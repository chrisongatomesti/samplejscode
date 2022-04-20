function SupendResumeTerminateBulkOrder(&vBulkDataArray,ArrLen,psListOfActionSet,Header)
{
	try
	{
		var oSvcAcctBO:BusObject = TheApplication().GetBusObject(""STC Service Account"");
		var oSubAcctBC:BusComp = oSvcAcctBO.GetBusComp(""CUT Service Sub Accounts"");
		var oAssetBC:BusComp = oSvcAcctBO.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
		var oAccountBC = oSvcAcctBO.GetBusComp(""STC Account Thin"");
		var strExpr;
		var vSuspType;
		var vSuspReason;
		var vTerminateReason;
		var vSeq:Number = 1;
		var Count:Number=0;
		var vSvcName;
		var vActCode;
		var vActionSetType:String ="""";
		var vServiceAccId1;
		var vBANNum; //[Hardik:Bulk Suspension and Resumption]
		var vCustType; //[Hardik:Bulk Suspension and Resumption]
		var vParentMSISDN; //[Hardik:Bulk Suspension and Resumption]
		var psListOfActions:PropertySet = TheApplication().NewPropertySet();
		psListOfActions.SetType(""ListOfActions"");
		var psListOfInstance:PropertySet = TheApplication().NewPropertySet();
		psListOfInstance.SetType(""ListOfInstance"");

		vMSISDN = vBulkDataArray[1];
		vRootAssetId = vBulkDataArray[2];
		if(vOrderType == ""Resume""||vOrderType == ""Suspend""|| vOrderType == ""Terminate"")
		{
			vActionSetType = ""Modify"";
		}
		if(vOrderType == ""Suspend"")
		{
			vSuspType = vBulkDataArray[3];
			vSuspReason = vBulkDataArray[4];
			//[Hardik:Bulk Suspension and Resumption]
			vBANNum = vBulkDataArray[5];
			vCustType = vBulkDataArray[6];
			vParentMSISDN = vBulkDataArray[7];
		}
		if(vOrderType == ""Resume"") // Hardik Bulk Resume 
		{
			vBANNum = vBulkDataArray[3];
			vCustType = vBulkDataArray[4];
			vParentMSISDN = vBulkDataArray[5];

		}
		if(vSuspType == ""undefined""||vSuspType == null)
		{
			vSuspType = """";
			vSuspReason = """";
		}
		if(vOrderType == ""Terminate"")
		{
			vTerminateReason = vBulkDataArray[3];
			vActCode = ""Delete"";
			vOrderType = ""Disconnect"";
		}

	/*	with(oSubAcctBC)
		{
			ClearToQuery();
			SetViewMode(AllView);
			ActivateField(""DUNS Number"");
			ActivateField(""Master Account Id"");
			ActivateField(""Parent Account Id"");
			strExpr = ""[DUNS Number] = '""+ vMSISDN +""' AND [Account Status] = 'Active'"";
			SetSearchExpr(strExpr);
			ExecuteQuery(ForwardBackward);
			if(FirstRecord())
			{
				vBANId = GetFieldValue(""Parent Account Id"");
				vCANId = GetFieldValue(""Master Account Id"");
				vServiceAccId1 = GetFieldValue(""Id"");
				vSvcName = GetFieldValue(""Name"");
			}
		}
		with(oAccountBC)
		{
			ClearToQuery();
			SetViewMode(AllView);
			ActivateField(""Id"");
			ActivateField(""Name"");
			SetSearchSpec(""Id"",vCANId);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
			{
				AccName = GetFieldValue(""Name"");
			}
		} 
		with(oAssetBC)
		{
			ClearToQuery();
			SetViewMode(AllView);
			ActivateField(""Id"");
			ActivateField(""Product Name"");
			SetSearchSpec(""Id"",vRootAssetId);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
			{
				vPackage = GetFieldValue(""Product Name"");
			}
		
		}*/

		var sAssetBO:BusObject = TheApplication().GetBusObject(""PDS Asset Management"");
		var sAssetBC:BusComp = sAssetBO.GetBusComp(""Asset Mgmt - Asset"");
		var sPkg="""",SANId="""",BANId="""",CANId="""",SANName="""",CANName="""",vSIM="""",BillProfId="""";
		sAssetBC.SetViewMode(AllView);
		sAssetBC.ClearToQuery();
		sAssetBC.ActivateField(""Product Name"");
		sAssetBC.ActivateField(""Service Account"");
		sAssetBC.ActivateField(""Account Name"");
		sAssetBC.ActivateField(""Service Account Id"");
		sAssetBC.ActivateField(""Billing Account Id"");
		sAssetBC.ActivateField(""Owner Account Id"");
		sAssetBC.ActivateField(""Service Account Master Id"");
		sAssetBC.ActivateField(""STC ICCID"");
		sAssetBC.ActivateField(""Billing Profile Id"");
		sAssetBC.SetSearchSpec(""Id"",vRootAssetId);
		sAssetBC.ExecuteQuery(ForwardOnly);
		if(sAssetBC.FirstRecord())
		{
			sPkg = sAssetBC.GetFieldValue(""Product Name"");
			SANId = sAssetBC.GetFieldValue(""Service Account Id"");
			BANId = sAssetBC.GetFieldValue(""Billing Account Id"");
			CANId = sAssetBC.GetFieldValue(""Owner Account Id"");
			if(CANId == """" || CANId == null)// Hardik Bulk Resume 
			{
				CANId = sAssetBC.GetFieldValue(""Service Account Master Id"");
			}
			SANName = sAssetBC.GetFieldValue(""Service Account"");
			CANName = sAssetBC.GetFieldValue(""Account Name"");
			if (CANName == """" || CANName == null) // Hardik Bulk Resume 
			{
				with(oAccountBC)
				{
					ClearToQuery();
					SetViewMode(AllView);
					ActivateField(""Id"");
					ActivateField(""Account Name"");
					SetSearchSpec(""Id"",CANId);
					ExecuteQuery(ForwardOnly);
					if(FirstRecord())
					{
						CANName = GetFieldValue(""Account Name"");
					}
				} 
			}
			vSIM = sAssetBC.GetFieldValue(""STC ICCID"");
			BillProfId = sAssetBC.GetFieldValue(""Billing Profile Id"");
		}


		// Setting Bulk Request Header
		if(Header == ""Order"" && BulkCount == 0)
		{
			with(oBulkReqBC)
			{
				ActivateField(""BRFileName"");
				ActivateField(""Bulk Request Name"");
				ActivateField(""Status"");
				ActivateField(""User Id"");
				ActivateField(""Mode"");
				NewRecord(NewAfter);
				SetFieldValue(""BRFileName"","""");
				SetFieldValue(""Bulk Request Name"",vBulkOrdFileName);
				SetFieldValue(""Status"",""New"");
				SetFieldValue(""Mode"",Header);
				SetFieldValue(""User Id"",sLoginId);
				WriteRecord();
				BulkRequestId = GetFieldValue(""Id"");
				Header = null;

			}
			
			
		}
		//setting Action Set
		
		var psActionSet:PropertySet = TheApplication().NewPropertySet();
		
		psActionSet.SetType(""Action Set"");
		var i =1;
		psActionSet.SetProperty(""Id"",i);
		psActionSet.SetProperty(""Customer Account"",CANName);
		psActionSet.SetProperty(""Customer Account Id"",CANId);
		psActionSet.SetProperty(""Billing Account Id"", BANId);
		psActionSet.SetProperty(""Service Account Id"",SANId);
		psActionSet.SetProperty(""Service Account"",SANName);
		psActionSet.SetProperty(""Bulk Request Id"",BulkRequestId);
		psActionSet.SetProperty(""Billing Profile Id"",BillProfId);
		psActionSet.SetProperty(""SIM Number"",vSIM);
		psActionSet.SetProperty(""Type"",vActionSetType);
		psActionSet.SetProperty(""Sequence"",i+BulkCount);
		psActionSet.SetProperty(""Active Flag"",""Y"");
		psActionSet.SetProperty(""Order Type"",vOrderType);
		psActionSet.SetProperty(""BAN Number"",vBANNum); //[Hardik:Bulk Suspension and Resumption]
		psActionSet.SetProperty(""Customer Type"",vCustType);//[Hardik:Bulk Suspension and Resumption]
		psActionSet.SetProperty(""Parent MSISDN"",vParentMSISDN);//[Hardik:Bulk Suspension and Resumption]
		//psActionSet.SetProperty(""Account"",CANName);
		psActionSet.SetProperty(""Child Instance Type"",""Service Id"");
		psActionSet.SetProperty(""Scope"",""Include""); 
		if(vSuspType != null || vSuspType != """")
		{
			psActionSet.SetProperty(""Suspension Type"",vSuspType);
			psActionSet.SetProperty(""Suspension Reason"",vSuspReason);
		}
		if(vOrderType == ""Disconnect"")
		{
			psActionSet.SetProperty(""Suspension Reason"",vTerminateReason);
		}
	
		i++;
		psListOfActionSet.AddChild(psActionSet);
		
		//Setting Actions

			var psActions:PropertySet = TheApplication().NewPropertySet();
	
			psActions.SetType(""Actions"");
			psActions.SetProperty(""Id"",""12""+i);
			psActions.SetProperty(""Sequence"",vSeq);
			psActions.SetProperty(""Base Product Name"",sPkg);
			if(vOrderType == ""Suspend""|| vOrderType == ""Resume"")
			{
				psActions.SetProperty(""Action Code"",vOrderType);	
			}
			if(vOrderType == ""Disconnect"")
			{
				psActions.SetProperty(""Action Code"",vActCode);
			}
			psActions.SetProperty(""Active Flag"",""Y"");
			psActions.SetProperty(""Component Product Name"","""");
			psActions.SetProperty(""Field Name"","""");
			psActions.SetProperty(""Attribute Name"","""");
			psListOfActions.AddChild(psActions);
	
			psActions = null;
			vSeq++;
			
		
	// Setting Instance

			if(vMSISDN != null || vMSISDN != """")
			{
				var psInstance:PropertySet = TheApplication().NewPropertySet(); 
				psInstance.SetType(""Instance"");
				psInstance.SetProperty(""Service Id"",vMSISDN);
				psInstance.SetProperty(""Id"",""12345"");
				psInstance.SetProperty(""Sequence"",""1"");
	            psInstance.SetProperty(""Asset Id"",vRootAssetId);
				psInstance.SetProperty(""Root Asset Id"",vRootAssetId);
				psInstance.SetProperty(""Account"",CANName);
				psInstance.SetProperty(""Product Name"",sPkg);
				psListOfInstance.AddChild(psInstance);
			 	psActionSet.AddChild(psListOfInstance);
			}
			psActionSet.AddChild(psListOfActions);
			psListOfActions = null;
			psListOfInstance = null;
	
			return psListOfActionSet,Header;
	
		
			
	}
	catch(e)
	{
		LogException(e);
		if(BulkRequestId == null || BulkRequestId == """")
		{
			TheApplication().RaiseErrorText(""Request Name is already exists, Please enter unique request name"");
		}
	}
	
	finally
	{
		oSubAcctBC = null;
		oAssetBC = null;
		oSvcAcctBO = null;
		vCANId = """";
		vBANId = """";
		vServiceAccId = """";
		vPackage = """";
		AccName = """";

	}

}
"//Your public declarations go here... 
function ToProperCase()
 {
     try
     {
        var iCtr;
        var arrProperCase = new Array();
        arrProperCase = vOrderType.split("" "");
        for(iCtr = 0; iCtr < arrProperCase.length; iCtr++)
		{
           arrProperCase[iCtr] = arrProperCase[iCtr].charAt(0).toUpperCase() + arrProperCase[iCtr].substring(1).toLowerCase();
	       vOrderType = arrProperCase.join("" "");
		}

	  }
     catch(e)
     {
        throw(e);
     }
     finally
     {
        arrProperCase = null;
        
     }
  }
"//Your public declarations go here... 
function trim(s)
{
	var r=/\b(.*)\b/.exec(s);
	return (r==null)?"""":r[1];
}
function Resubmit()
{
	var MRow="""";
	var MRowId="""";
	var Product="""";
	var Action="""";
	var Channel;
	
	/*	WIPRO-Upgrade-03.05.2016-TSINGHALC - Gets the Filename along with Filepath from LOV Description	*/
	
	var svc = TheApplication().GetService(""STC Get Filename"");
	var Inputs = TheApplication().NewPropertySet();
	var Outputs = TheApplication().NewPropertySet();
	Inputs.SetProperty(""Type"",""STC_FILE_NAME"");
	Inputs.SetProperty(""LIC"",""STC_BULK_GPRS_ACT"");
	svc.InvokeMethod(""STC Get LOV Desc"", Inputs, Outputs);
	var filepath = Outputs.GetProperty(""Description"");
	
	var file = Clib.fopen(filepath, ""rt"");
	
	/* WIPRO-Upgrade-03.05.2016-TSINGHALC - Commented the below line as the filename is received from the above lines by invoking the Generic BS */
	
	//var file=Clib.fopen(""/siebelfs/GPRSAddonActivation.csv"", ""rt"");
	
	//var file=Clib.fopen(""C:\GPRSAddonActivation.csv"", ""rt"");

	if (file==null)
    {
		TheApplication().RaiseErrorText(""Error in opening the file"");
    }
	else
    {
		while(!Clib.feof(file))
        {

			MRow = (Clib.fgets(file));  
			MRow = trim(MRow);
			var len = MRow.length;//97399009858,LTEADDON5,Delete,FCA

			var ind1 = MRow.indexOf("","");
			var MSISDN=MRow.substring(0,ind1);//97399009858

			MRow = MRow.substring(ind1+1,len);//LTEADDON5,Delete,FCA
			var ind2 = MRow .indexOf("","");
			Product = MRow .substring(0,ind2);//LTEADDON5

			MRow = MRow.substring(ind2+1,len);//LTEADDON5,Delete,FCA
			var Ind3 = MRow .indexOf("","");
			if(Ind3 != ""-1"")
			{
				Action = MRow.substring(0,Ind3);//Delete
				Channel = MRow.substring(Ind3+1,len);
			}
			else
			{
				Action = MRow;
				Channel = ""Automated"";
			}
 
			//TheApplication().RaiseErrorText(NetPrice);

			var MInputs = TheApplication().NewPropertySet();
			var MOutputs = TheApplication().NewPropertySet();

			if( Product != '' || Product != null)
			{
				MInputs.SetProperty(""ProcessName"",""STC Create GPRS Data Main WF"");
				MInputs.SetProperty(""MSISDN"",MSISDN);    
				MInputs.SetProperty(""Product"",Product);
				MInputs.SetProperty(""Action"",Action);
				MInputs.SetProperty(""Channel"",Channel);

				var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");

				MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);

			}
        }
    }
	MWorkflowProc=null;
	MOutputs=null;
	MInputs=null;
	MRowId=null;
	file = null;
	filepath = null;
	Outputs = null;
	Inputs = null;
	svc = null;

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""Resubmit"")
	{
		Resubmit();
		return(CancelOperation);    
	}
	else
    {    
		return(ContinueOperation);
    }
}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}
"//Your public declarations go here... 
	var vCANId;
	var vBANId;
	var sLoginId;
	var svc;
	var AccName = """";
	var BulkCount = 0;
	var BulkRequestId= """";
	var BulkRequestNumber = """";
	var vOrderType;
	var vBulkOrdFileName;
	var vErrorMessage = """";
	var vErrorCode    = """";
	var vServiceAccId;
	var vPackage;
	var vRootAssetId;
	var vMSISDN;
	var vSIM;
	var oAccountBO = TheApplication().GetBusObject(""Account"");
	var oAccountBC = oAccountBO.GetBusComp(""Account"");
	var oBulkReqBO = TheApplication().GetBusObject(""ABO Bulk Request"");
	var oBulkReqBC = oBulkReqBO.GetBusComp(""ABO Bulk Request Header"");
	var psSiebelMsg :PropertySet = TheApplication().NewPropertySet();"
"/*..................................................
Author: SUMAN KANUMURI
Functionality: Importing Bulk File
Comments: 
..................................................*/
function ImportBulkData( Inputs, Outputs)
{
	var vInputFile      = """";
	var vReadFromFile   = """";
	var vBulkDataArray  = new Array; 
	var Out = TheApplication().NewPropertySet();
	var APNRecId;
	var CANNumber;
	var APNName;
	var APNType;
	var IPType;
	var Status;
	var APNTempId;
	var CNTXId;
	var IPAddress;
	var CLLID;
	var SANNumber;
	var SubnetLANIP;
	var LANSubnetIP;
	var sCRMROWID;
	var Status;
	var APNBO = TheApplication().GetBusObject(""STC APN Details BO"");
	var APNBC = APNBO.GetBusComp(""STC APN Details"");
	var StrLANIpBC = APNBO.GetBusComp(""VIVA LAN Subnet IP BC"");
	var sView = TheApplication().ActiveViewName();//Mayank: Added for Modify 4G APN
	try
	{
		var vFileName = Inputs.GetProperty(""FileName"");
		var vFileType = ToString(Inputs.GetProperty(""FileType""));
		vFileType = Clib.strlwr(vFileType);
		sLoginId = TheApplication().LoginId();
		if( vFileType != ""csv"")
		{
			TheApplication().RaiseErrorText(""Please check the File Type , Is should be :  FileName.CSV"");
		}
		vInputFile     = Clib.fopen(vFileName , ""r"");       
		vReadFromFile  = Clib.fgets(vInputFile); 
		while(!Clib.feof(vInputFile))
		{
			while((vReadFromFile != null) && (vReadFromFile.length > 0))
			{	
				vBulkDataArray = vReadFromFile.split("","");
				CANNumber	=	vBulkDataArray[0]
				APNName		=	vBulkDataArray[1]
				APNType		=	vBulkDataArray[2]
				IPType		=	vBulkDataArray[3]
				APNTempId	=	vBulkDataArray[4]
				CNTXId		=	vBulkDataArray[5]
				LANSubnetIP	=	vBulkDataArray[6]
				CLLID		=	vBulkDataArray[7]
				SubnetLANIP	=	vBulkDataArray[8]
				Status      =	vBulkDataArray[9]
				if(CANNumber != ""Customer Account Number"")
				{
					with(APNBC)
					{
						var Spec = """";
						//Mayank: Added for Modify 4G APN --- START ----
						if(sView == ""STC Order Entry - Line Items APN Details"" || sView == ""STC Service Request APN Details"")
						{
							Spec = ""[Apn Name]= '"" + APNName + ""'"";
						}
						else
						{
							Spec = ""[Apn Name]= '"" + APNName + ""' AND ([Billing Account Id]='"" + CANNumber + ""')"";
						}//Mayank: Added for Modify 4G APN ----- STOP -------
						SetViewMode(AllView);
						InvokeMethod(""SetAdminMode"",""TRUE"");
						ActivateField(""Status"");
						ActivateField(""IP Type"");	
						ActivateField(""Apn Name"");
						ActivateField(""APN Type""); 
						ActivateField(""APN CNTX Id"");
						ActivateField(""APN Template Id"");
						ActivateField(""Billing Account Id""); 
						ActivateField(""STC APN Source"");
						ActivateField(""STC LAN Subnet"");				
						ClearToQuery();	
						//Spec = ""[Apn Name]= '"" + APNName + ""' AND ([Billing Account Id]='"" + CANNumber + ""')"";
						SetSearchExpr(Spec);
						ExecuteQuery(ForwardOnly);
						var isAPNRec = FirstRecord();
						if(!isAPNRec)
						{	
							NewRecord(NewAfter);
							SetFieldValue(""Status"",""Active"");
							SetFieldValue(""IP Type"",IPType);
							SetFieldValue(""Apn Name"",APNName);
							SetFieldValue(""APN Type"",APNType);
							SetFieldValue(""Billing Account Id"",CANNumber);
							SetFieldValue(""APN Template Id"",APNTempId);
							SetFieldValue(""APN CNTX Id"",CNTXId);
							SetFieldValue(""STC LAN Subnet"",SubnetLANIP);
							WriteRecord();
							APNRecId = GetFieldValue(""Id"");
						}
						else
						{	
							SetFieldValue(""Status"",""Active"");//Mayank: Added for Modify 4G APN
							WriteRecord();	//Mayank: Added for Modify 4G APN				
							APNRecId = GetFieldValue(""Id"");
						}
						with(StrLANIpBC)
						{
							var SLANIPSpec = """";
							SetViewMode(AllView);
							InvokeMethod(""SetAdminMode"",""TRUE"");
							ActivateField(""APN Name"");
							ActivateField(""IP Address"");
							ActivateField(""IP Type"");
							ActivateField(""MSISDN"");
							ActivateField(""Service Request Id"");
							ActivateField(""Status"");
							ClearToQuery();	
							SLANIPSpec = ""[APN Name]= '"" + APNName + ""' AND ([IP Address]='"" + LANSubnetIP + ""')"";
							SetSearchExpr(SLANIPSpec);
							ExecuteQuery(ForwardOnly);
							var isAPNSIPRec = FirstRecord();
							if(!isAPNSIPRec && Status == ""Add"")
							{
								NewRecord(NewAfter);
								SetFieldValue(""APN Name"",APNName);
								SetFieldValue(""IP Address"",LANSubnetIP);
								SetFieldValue(""IP Type"",IPType);
								SetFieldValue(""Status"",""Unassigned"");
								SetFieldValue(""MSISDN"",CLLID);
								SetFieldValue(""STC APN Id"",APNRecId);
								WriteRecord();
							}
							if(isAPNSIPRec)
							{
								if(Status == ""Add"")
								{
									SetFieldValue(""Status"",""Unassigned"");
									WriteRecord();
								}
								if(Status != ""Add"")
								{
									SetFieldValue(""Status"",""Trashed"");
									WriteRecord();
								}
							}
						}
					}
				}		
				vReadFromFile = Clib.fgets(vInputFile);
			}//	while(ReadFromFile)  
		}//End While
	}//try
	catch(e)
	{ 
		vErrorMessage = e.toString();
		vErrorCode    = e.errCode; 
		LogException(e);
		TheApplication().RaiseErrorText(vErrorMessage);	  
	}
	finally
	{
	}
}
function LogException(e)
{
	var appObj= TheApplication();
  	var Input;
  	var Output;
  	var CallMessageHandler; 
	try
 	{
		  
		  Input = appObj.NewPropertySet();
		  Output = appObj.NewPropertySet();
		  CallMessageHandler = appObj.GetService(""STC Generic Error Handler""); 
		  Input.SetProperty(""Error Code"", e.errCode);
		  Input.SetProperty(""Error Message"", e.errText);
		  Input.SetProperty(""Object Name"", ""STC Bulk IP Data Import BS"");
		  Input.SetProperty(""Object Type"", ""Buisness Service"");
		  CallMessageHandler.InvokeMethod(""Log Message"", Input, Output);
 	}
 	catch(e)
 	{
  		TheApplication().RaiseError(e.errCode);
 	}
 	finally
 	{
 
		  CallMessageHandler = null;
		  Output = null;
		  Input = null;
		  appObj = null;
 	}
 	
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""Import"")
	{
		ImportBulkData(Inputs,Outputs);
		return (CancelOperation);
	}
	
}
"//Your public declarations go here... 
function trim(s)
{
	var r=/\b(.*)\b/.exec(s);
	return (r==null)?"""":r[1];
}
"var vErrorMessage = """";
var vErrorCode = """";"
function Import_Bulk_File( Inputs , Outputs)
{
   try
   {
      var vInputFile      = """";
      var vReadFromFile   = """";
      var vBulkDataArray  = """";
      TheApplication().RaiseErrorText(""Hi"");
      var boBulkBO         =  TheApplication().GetBusObject(""STC Apps Query BO"");
      var bcBulkBC        =  boBulkBO.GetBusComp(""STC Active Add Parent BC"");
       
      bcBulkBC.SetViewMode(AllView); 
      bcBulkBC.ActivateField(""Product PartNumber"");
      bcBulkBC.ActivateField(""Product Name"");
      bcBulkBC.ActivateField(""Prepaid/Postpaid"");
      bcBulkBC.ActivateField(""Product Id"");
      //bcBulkBC.ActivateField(""Status"");           
  var vFileName   = Inputs.GetProperty(""FileName"");
  var vFileType     = ToString(Inputs.GetProperty(""FileType""));
  vFileType       = Clib.strlwr(vFileType);
        
      if( vFileType != ""csv"")
      {
         TheApplication().RaiseErrorText(""Please check the File Type , It should be :  FileName.CSV"");
      }
      //vFileImportBC.SetFieldValue(""Import Type"",""Notes"");
      //vFileImportBC.WriteRecord();
      vInputFile     = Clib.fopen(vFileName , ""rt"");       
      vReadFromFile  = Clib.fgets(vInputFile);
      
      while((vReadFromFile != null) && (vReadFromFile.length > 1))
      {
          vBulkDataArray = vReadFromFile.split("","");
          bcBulkBC.InvokeMethod(""SetAdminMode"", ""TRUE""); 
          bcBulkBC.NewRecord(NewAfter);      
          bcBulkBC.SetFieldValue(""Product PartNumber"" ,vBulkDataArray[0]);        
          //bcBulkBC.SetFieldValue(""Prepaid/Postpaid"" ,vBulkDataArray[2]);
          //bcBulkBC.SetFieldValue(""Product Id"" ,vBulkDataArray[0]);
          //bcBulkBC.SetFieldValue(""Product Name""     ,vBulkDataArray[1]);
          var temp = vBulkDataArray[0].length;
          bcBulkBC.SetFieldValue(""Product Id"" ,vBulkDataArray[0].substr(0 ,(temp-1))); 
          //bcBulkBC.SetFieldValue(""Field Id"" ,vFileImportBC.GetFieldValue(""File Order Id""));
          //bcBulkBC.SetFieldValue(""Status"", ""Created"");
          bcBulkBC.WriteRecord();          
          vReadFromFile = Clib.fgets(vInputFile);          
      }
   }
   catch(m)
   {
      vErrorMessage = m.toString();
      vErrorCode    = m.errCode;
   }
 
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs) 
{ 
 
if( MethodName == ""Import"") 
    { 
 
      Import_Bulk_File( Inputs, Outputs ); 
      return(CancelOperation); 
    } 
 return (ContinueOperation); 
}
"var vErrorMessage = """";
var vErrorCode = """";"
function Import_Bulk_File( Inputs , Outputs)
{
   try
   {
      var vInputFile      = """";
      var vReadFromFile   = """";
      var vBulkDataArray  = """";
      
      var boBulkBO         =  TheApplication().GetBusObject(""STC Apps Query BO"");
      var bcBulkBC        =  boBulkBO.GetBusComp(""STC Active Add Parent BC"");
       
      bcBulkBC.SetViewMode(AllView); 
      bcBulkBC.ActivateField(""Product PartNumber"");
      bcBulkBC.ActivateField(""Product Name"");
      bcBulkBC.ActivateField(""Prepaid/Postpaid"");
      bcBulkBC.ActivateField(""Product Id"");
      //bcBulkBC.ActivateField(""Status"");           
  var vFileName   = Inputs.GetProperty(""FileName"");
  var vFileType     = ToString(Inputs.GetProperty(""FileType""));
  vFileType       = Clib.strlwr(vFileType);
        
      if( vFileType != ""csv"")
      {
         TheApplication().RaiseErrorText(""Please check the File Type , It should be :  FileName.CSV"");
      }
      //vFileImportBC.SetFieldValue(""Import Type"",""Notes"");
      //vFileImportBC.WriteRecord();
      vInputFile     = Clib.fopen(vFileName , ""rt"");       
      vReadFromFile  = Clib.fgets(vInputFile);
      
      while((vReadFromFile != null) && (vReadFromFile.length > 1))
      {
          vBulkDataArray = vReadFromFile.split("","");
          bcBulkBC.InvokeMethod(""SetAdminMode"", ""TRUE""); 
          bcBulkBC.NewRecord(NewAfter);      
          bcBulkBC.SetFieldValue(""Product PartNumber"" ,vBulkDataArray[0]);
          bcBulkBC.SetFieldValue(""Product Name""     ,vBulkDataArray[1]);
          bcBulkBC.SetFieldValue(""Prepaid/Postpaid"" ,vBulkDataArray[2]);
          bcBulkBC.SetFieldValue(""Product Id"" ,vBulkDataArray[3]);
          var temp = vBulkDataArray[3].length;
          bcBulkBC.SetFieldValue(""Product Id"" ,vBulkDataArray[3].substr(0 ,(temp-1))); 
          //bcBulkBC.SetFieldValue(""Field Id"" ,vFileImportBC.GetFieldValue(""File Order Id""));
          //bcBulkBC.SetFieldValue(""Status"", ""Created"");
          bcBulkBC.WriteRecord();          
          vReadFromFile = Clib.fgets(vInputFile);          
      }
   }
   catch(m)
   {
      vErrorMessage = m.toString();
      vErrorCode    = m.errCode;
   }
 
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{

if( MethodName == ""Import"")
    {
      Import_Bulk_File( Inputs, Outputs );
      return(CancelOperation);
    }
 return (ContinueOperation);
}
function Enroll()
{
	var MRow="""";
	var MSISDN=""""; 
	var RequestFor="""";
	var SMSInvokeFlg="""";
	var ProgramName="""";
	var downgradeflag="""";
	
	/*	WIPRO-Upgrade-03.05.2016-TSINGHALC - Gets the Filename along with Filepath from LOV Description	*/
	
	var svc = TheApplication().GetService(""STC Get Filename"");
	var Inputs = TheApplication().NewPropertySet();
	var Outputs = TheApplication().NewPropertySet();
	Inputs.SetProperty(""Type"",""STC_FILE_NAME"");
	Inputs.SetProperty(""LIC"",""STC_BULK_LOY_REG_ENROLL"");
	svc.InvokeMethod(""STC Get LOV Desc"", Inputs, Outputs);
	var filepath = Outputs.GetProperty(""Description"");
	
	var file = Clib.fopen(filepath, ""rt"");
	
	/* WIPRO-Upgrade-03.05.2016-TSINGHALC - Commented the below line as the filename is received from the above lines by invoking the Generic BS */
	
	//var file=Clib.fopen(""/siebelfs/Enroll.csv"", ""rt"");
	 
	if (file==null)
	{
		TheApplication().RaiseErrorText(""Error in opening the file"");
	}
	else
	{
		while(!Clib.feof(file))                  
		{
 
			MRow = (Clib.fgets(file));  
			MRow = trim(MRow);
			var len = MRow.length;
			var ind1 = MRow.indexOf("","");
			MSISDN=MRow.substring(0,ind1);
			 
			MRow = MRow.substring(ind1+1,len);
			var ind2 = MRow .indexOf("",""); 
			RequestFor = MRow .substring(0,ind2);
			
			MRow = MRow.substring(ind2+1,len);
			var ind3 = MRow .indexOf("","");
			SMSInvokeFlg = MRow.substring(0,ind3);
			  
			MRow = MRow.substring(ind3+1,len);
			var ind4 = MRow .indexOf("","");
			downgradeflag = MRow.substring(0,ind4);

			ProgramName = MRow.substring(ind4+1,len);
 
			//TheApplication().RaiseErrorText(  MSISDN+RequestFor+SMSInvokeFlg+ downgradeflag+ProgramName );
			   
			var MInputs = TheApplication().NewPropertySet();
			var MOutputs = TheApplication().NewPropertySet();
			  
			MInputs.SetProperty(""ProcessName"",""STC LOY Bulk Registration Manual"");
			MInputs.SetProperty(""MSISDN"",MSISDN);    
			MInputs.SetProperty(""Request For"",RequestFor );    
			MInputs.SetProperty(""SMS Invoke Flg"",SMSInvokeFlg);
			MInputs.SetProperty(""STC DownGrade Flg"", downgradeflag);
			MInputs.SetProperty(""Program Name"",ProgramName);
			  
			var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");
			  
			MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);
		}
	}
	MWorkflowProc=null;
	MOutputs=null;
	MInputs=null;
	MRow=null;
	file = null;
	filepath = null;
	Outputs = null;
	Inputs = null;
	svc = null;
	
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""Enroll"")
	{
		Enroll();
		return(CancelOperation);    
	}
	else if(MethodName == ""Upgrade"")
	{
		Upgrade();
		return(CancelOperation);    
	}
	else
	{    
		return(ContinueOperation);
	}
}
function Upgrade()
{
	var MRow="""";
	var MSISDN=""""; 
	var RequestFor="""";
	var SMSInvokeFlg="""";
	var ProgramName="""";
	var downgradeflag="""";

	/*	WIPRO-Upgrade-03.05.2016-TSINGHALC - Gets the Filename along with Filepath from LOV Description	*/
	
	var svc = TheApplication().GetService(""STC Get Filename"");
	var Inputs = TheApplication().NewPropertySet();
	var Outputs = TheApplication().NewPropertySet();
	Inputs.SetProperty(""Type"",""STC_FILE_NAME"");
	Inputs.SetProperty(""LIC"",""STC_BULK_LOY_REG_UPGRADE"");
	svc.InvokeMethod(""STC Get LOV Desc"", Inputs, Outputs);
	var filepath = Outputs.GetProperty(""Description"");
	
	var file = Clib.fopen(filepath, ""rt"");
	
	/* WIPRO-Upgrade-03.05.2016-TSINGHALC - Commented the below line as the filename is received from the above lines by invoking the Generic BS */
	
	//var file=Clib.fopen(""/crmapp/Upgrade.csv"", ""rt"");
 
	if (file==null)
	{
		TheApplication().RaiseErrorText(""Error in opening the file"");
	}
	else
	{
		while(!Clib.feof(file))                  
		{
	 
			MRow = (Clib.fgets(file));  
			MRow = trim(MRow);
			var len = MRow.length;
			var ind1 = MRow.indexOf("","");
			MSISDN=MRow.substring(0,ind1);
			   
			MRow = MRow.substring(ind1+1,len);
			var ind2 = MRow .indexOf("",""); 
			RequestFor = MRow.substring(0,ind2);
			  
			MRow = MRow.substring(ind2+1,len);
			var ind3 = MRow .indexOf("","");
			SMSInvokeFlg = MRow.substring(0,ind3);
			  
			MRow = MRow.substring(ind3+1,len);
			var ind4 = MRow .indexOf("","");
			downgradeflag = MRow.substring(0,ind4);

			ProgramName = MRow.substring(ind4+1,len);
			  
			//TheApplication().RaiseErrorText(  MSISDN+RequestFor+SMSInvokeFlg+ downgradeflag+ProgramName );
			  
			var MInputs = TheApplication().NewPropertySet();
			var MOutputs = TheApplication().NewPropertySet();
			  
			MInputs.SetProperty(""ProcessName"",""STC LOY Bulk Registration Manual"");
			MInputs.SetProperty(""MSISDN"",MSISDN);    
			MInputs.SetProperty(""Request For"",RequestFor);    
			MInputs.SetProperty(""SMS Invoke Flg"",SMSInvokeFlg);
			MInputs.SetProperty(""STC DownGrade Flg"", downgradeflag);
			MInputs.SetProperty(""Program Name"",ProgramName);
			  
			var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");
			  
			MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);
		}
	}
	MWorkflowProc=null;
	MOutputs=null;
	MInputs=null;
	MRow=null;
}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}
function GetFileName(LOVType)
{
var sListBo = TheApplication().GetBusObject(""List Of Values"");
var sListBc = sListBo.GetBusComp(""List Of Values"");
var FilePath = """";
with(sListBc)
{
ActivateField(""Description"");
ClearToQuery();
SetViewMode(AllView);
SetSearchSpec(""Type"",LOVType);
SetSearchSpec(""Name"",LOVType);
ExecuteQuery(ForwardOnly);
var IsLovRec = FirstRecord();
if(IsLovRec)
{
FilePath = GetFieldValue(""Description"");
}//endif IsLovRec
}//endwith sListBc
return (FilePath);
}
function ReadFile(Inputs, Outputs)
{
	var LOVType, LOVTypeLIC, Testing;
	var sListBo, sListBc, FilePath ="""" , svcBSName="""", svcBSMethod="""", Delimeter = """", WFName ;
	var i=0, vInputFile, vReadFromFile, vDataArray="""", vDataArrayLength, svcBS="""" , OutPos=0; 
	var ChildIn = TheApplication().NewPropertySet(); 
	var ChildOut = TheApplication().NewPropertySet(); 
	try
	{
		LOVType = ""STC_READ_FILE_GEN"";
		LOVTypeLIC = Inputs.GetProperty(""LOVTypeLIC"");
		Testing = Inputs.GetProperty(""Testing"");
		OutPos = Inputs.GetProperty(""OutTypePosition"");
		
		sListBo = TheApplication().GetBusObject(""List Of Values"");
		sListBc = sListBo.GetBusComp(""List Of Values"");
		OutPos = (OutPos == """")? 1:OutPos;
		with(sListBc)
		{
		ActivateField(""Description"");
		ActivateField(""High"");
		ActivateField(""Low"");
		ActivateField(""Sub Type"");
		ClearToQuery();
		SetViewMode(AllView);
		SetSearchSpec(""Type"",LOVType);
		SetSearchSpec(""Name"",LOVType);
		ExecuteQuery(ForwardOnly);
		 if(FirstRecord())
		 {
			FilePath = GetFieldValue(""Description"");
			svcBSName = GetFieldValue(""High"");
			svcBSMethod = GetFieldValue(""Low"");
			Delimeter = GetFieldValue(""Sub Type"");
		 }
		}//end with(sListBc)

		if(FilePath != """" && FilePath != null)
		{
			vInputFile=Clib.fopen(FilePath, ""rt"");
			if (vInputFile== null)
			{
			    //TheApplication().RaiseErrorText(""Error in opening the file"");
				Outputs.SetProperty(""ErrorMessage"", ""Error in opening the file"");
			}
			else
			{
				//-----
				vReadFromFile = Clib.fgets(vInputFile); //,97399009858,LTEADDON5,20,Delete,FCA,100
			    while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
			    {
					ChildIn.Reset();
					if(Delimeter != """" && Delimeter != null)
						vDataArray = vReadFromFile.split(Delimeter);
					else
						vDataArray = vReadFromFile.split("","");
					
					vDataArrayLength = getArrayLength(vDataArray);
					
					for(i=0; i<=vDataArrayLength; i++)
					{
						ChildIn.SetProperty(""Param""+i, vDataArray[i]);
						if(i==OutPos)
							ChildIn.SetType('File-'+vDataArray[i]);
					}
					if(svcBS != """" && svcBS != null)
					{
						svcBS = TheApplication().GetService(svcBSName);
						if(svcBS == ""Workflow Process Manager"")
						{
							ChildIn = SetProperty(""ProcessName"", svcBSMethod);
							svcBS.InvokeMethod(""RunProcess"", ChildIn, ChildOut);
						}
						else
							svcBS.InvokeMethod(svcBSMethod, ChildIn, ChildOut);
					}
					if(Testing == ""Y"")
						Outputs.AddChild(ChildIn.Copy());

					
			        //Read Next Line:
			        vReadFromFile = Clib.fgets(vInputFile); //,97399009858,LTEADDON5,20,Delete,FCA,100
			    }
				//----
			}
		}
	}
	catch(e)
	{
	svcBS=null; 
	}
	finally
	{
	}
}
"
function Resubmit()
{
var MRow="""";
var MRowId="""";
var Product="""";
var Action="""";
var Channel;
var Quantity=0;
var vInputFile      = """";
var vReadFromFile   = """";
var vBulkDataArray  = """";
var StartOffset;

var vFileName = GetFileName(""STC_MODIFY_FILEPATH"");
vInputFile=Clib.fopen(vFileName, ""rt"");
vReadFromFile  = Clib.fgets(vInputFile); 

		if (vInputFile== null)
		{
			TheApplication().RaiseErrorText(""Error in opening the file"");
		}
		else
		{
			while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")

			{
				vReadFromFile = Clib.fgets(vInputFile); //97399009858,LTEADDON5,20,Delete,FCA,100
				vBulkDataArray = vReadFromFile.split("","");
				var MSISDN = vBulkDataArray[1];
				Product = vBulkDataArray[2];
				Quantity = vBulkDataArray[3];
				Action = vBulkDataArray[4];
				Channel = vBulkDataArray[5];
				if(Channel == '' || Channel == """" || Channel == null)
				{
					Channel = 	""Automated"";
				}
				StartOffset = vBulkDataArray[6];
				



				var MInputs = TheApplication().NewPropertySet();
				var MOutputs = TheApplication().NewPropertySet();

				if( Product != '' || Product != null)
				{
					MInputs.SetProperty(""ProcessName"",""STC Bulk Modify Order Main WF"");
					MInputs.SetProperty(""MSISDN"",MSISDN);    
					MInputs.SetProperty(""Product"",Product);
					MInputs.SetProperty(""Action"",Action);
					MInputs.SetProperty(""ProductQuantity"",Quantity);
					MInputs.SetProperty(""Channel"",Channel);
					MInputs.SetProperty(""StartOffset"",StartOffset);
					var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");
					MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);

				}
			}
		}
MWorkflowProc=null;
MOutputs=null;
MInputs=null;
MRowId=null

}
function Resubmit()
{
var MRow="""";
var MRowId="""";
var Product="""";
var Action="""";
var Channel;
var Quantity=0;
var vInputFile      = """";
var vReadFromFile   = """";
var vBulkDataArray  = """";
var StartOffset;
var vBulkDataArrayLength=0, ProductTwo="""";
var MSISDN, MInputs, MOutputs, MWorkflowProc;

var vFileName = GetFileName(""STC_MODIFY_FILEPATH"");
vInputFile=Clib.fopen(vFileName, ""rt"");
//vReadFromFile  = Clib.fgets(vInputFile);

if (vInputFile== null)
{
    TheApplication().RaiseErrorText(""Error in opening the file"");
}
else
{
	//Read First Line:
	vReadFromFile = Clib.fgets(vInputFile); //97399009858,LTEADDON5,20,Delete,FCA,100

    while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
    {
        //vReadFromFile = Clib.fgets(vInputFile); //97399009858,LTEADDON5,20,Delete,FCA,100
        vBulkDataArray = vReadFromFile.split("","");
        MSISDN = vBulkDataArray[1];
        Product = vBulkDataArray[2];
        Quantity = vBulkDataArray[3];
        Action = vBulkDataArray[4];
        Channel = vBulkDataArray[5];
        StartOffset = vBulkDataArray[6];
        vBulkDataArrayLength = getArrayLength(vBulkDataArray );
		
		if(vBulkDataArrayLength > 7)
			ProductTwo = vBulkDataArray[7];
		
		if(Channel == '' || Channel == """" || Channel == null)
        {
            Channel =     ""Automated"";
        }
        MInputs = TheApplication().NewPropertySet();
        MOutputs = TheApplication().NewPropertySet();

        if( Product != '' || Product != null)
        {
            MInputs.SetProperty(""ProcessName"",""STC Bulk Modify Order Main WF"");
            MInputs.SetProperty(""MSISDN"",MSISDN);    
            MInputs.SetProperty(""Product"",Product);
            MInputs.SetProperty(""Action"",Action);
            MInputs.SetProperty(""ProductQuantity"",Quantity);
            MInputs.SetProperty(""Channel"",Channel);
            MInputs.SetProperty(""StartOffset"",StartOffset);
			MInputs.SetProperty(""ProductTwo"", ProductTwo);
            MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");
            MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);
        }
        //Read Next Line:
        vReadFromFile = Clib.fgets(vInputFile); //,97399009858,LTEADDON5,20,Delete,FCA,100
    }
}
MWorkflowProc=null;
MOutputs=null;
MInputs=null;
MRowId=null
}
function Resubmit()
{
var MRow="""";
var MRowId="""";
var Product="""";
var Action="""";
var Channel;
var Quantity=0;
var vInputFile      = """";
var vReadFromFile   = """";
var vBulkDataArray  = """";
var StartOffset;

var vFileName = GetFileName(""STC_MODIFY_FILEPATH"");
vInputFile=Clib.fopen(vFileName, ""rt"");
//vReadFromFile  = Clib.fgets(vInputFile);

if (vInputFile== null)
{
    TheApplication().RaiseErrorText(""Error in opening the file"");
}
else
{
	//Read First Line:
	vReadFromFile = Clib.fgets(vInputFile); //97399009858,LTEADDON5,20,Delete,FCA,100

    while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
    {
        //vReadFromFile = Clib.fgets(vInputFile); //97399009858,LTEADDON5,20,Delete,FCA,100
        vBulkDataArray = vReadFromFile.split("","");
        var MSISDN = vBulkDataArray[1];
        Product = vBulkDataArray[2];
        Quantity = vBulkDataArray[3];
        Action = vBulkDataArray[4];
        Channel = vBulkDataArray[5];
        if(Channel == '' || Channel == """" || Channel == null)
        {
            Channel =     ""Automated"";
        }
        StartOffset = vBulkDataArray[6];
        
        var MInputs = TheApplication().NewPropertySet();
        var MOutputs = TheApplication().NewPropertySet();

        if( Product != '' || Product != null)
        {
            MInputs.SetProperty(""ProcessName"",""STC Bulk Modify Order Main WF"");
            MInputs.SetProperty(""MSISDN"",MSISDN);    
            MInputs.SetProperty(""Product"",Product);
            MInputs.SetProperty(""Action"",Action);
            MInputs.SetProperty(""ProductQuantity"",Quantity);
            MInputs.SetProperty(""Channel"",Channel);
            MInputs.SetProperty(""StartOffset"",StartOffset);
            var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");
            MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);
        }
        //Read Next Line:
        vReadFromFile = Clib.fgets(vInputFile); //97399009858,LTEADDON5,20,Delete,FCA,100
    }
}
MWorkflowProc=null;
MOutputs=null;
MInputs=null;
MRowId=null
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{

if(MethodName == ""Resubmit"")
   {
    Resubmit();
   return(CancelOperation);    
   }
else
     {    
return(ContinueOperation);
      }

	return (ContinueOperation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""Resubmit"")
	{
		Resubmit();
		return(CancelOperation);    
	}
	if(MethodName == ""ReadFile"")
	{
		ReadFile(Inputs, Outputs);
		return(CancelOperation);    
	}
	else
	{    
		return(ContinueOperation);
	}

	return (ContinueOperation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""Resubmit"")
	{
		Resubmit();
		return(CancelOperation);    
	}
	else
	{    
		return(ContinueOperation);
	}

	return (ContinueOperation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""Resubmit"")
	{
		Resubmit();
		return(CancelOperation);    
	}
	else
    {    
		return(ContinueOperation);
    }
}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}





function Resubmit()
{
	var MRow="""";
	var MRowId="""";
	var Product="""";
	var Action="""";
	
	/*	WIPRO-Upgrade-03.05.2016-TSINGHALC - Gets the Filename along with Filepath from LOV Description	*/
	
	var svc = TheApplication().GetService(""STC Get Filename"");
	var Inputs = TheApplication().NewPropertySet();
	var Outputs = TheApplication().NewPropertySet();
	Inputs.SetProperty(""Type"",""STC_FILE_NAME"");
	Inputs.SetProperty(""LIC"",""STC_BULK_LTE_ACT_1"");
	svc.InvokeMethod(""STC Get LOV Desc"", Inputs, Outputs);
	var filepath = Outputs.GetProperty(""Description"");
	
	var file = Clib.fopen(filepath, ""rt"");
	
	/* WIPRO-Upgrade-03.05.2016-TSINGHALC - Commented the below line as the filename is received from the above lines by invoking the Generic BS */
	
	//var file=Clib.fopen(""/siebelfs/LTEAddon1.csv"", ""rt"");
	
	//var file=Clib.fopen(""C:\LTEAddon.csv"", ""rt"");

	if (file==null)
	{
		TheApplication().RaiseErrorText(""Error in opening the file"");
    }
	else	
    {
		while(!Clib.feof(file))
        {

			MRow = (Clib.fgets(file));  
			MRow = trim(MRow);
			var len = MRow.length;
			var ind1 = MRow.indexOf("","");
			MRowId=MRow.substring(0,ind1);
			MRow = MRow.substring(ind1+1,len);
			var ind2 = MRow .indexOf("","");
			Product = MRow .substring(0,ind2);
			Action = MRow.substring(ind2+1,len);
			 
			//TheApplication().RaiseErrorText(NetPrice);

			var MInputs = TheApplication().NewPropertySet();
			var MOutputs = TheApplication().NewPropertySet();

			if( Product != '' || Product != null)
			{
				MInputs.SetProperty(""ProcessName"",""STC Bulk Modify Order Main WF"");
				MInputs.SetProperty(""MSISDN"",MRowId);    
				MInputs.SetProperty(""Product"",Product);
				MInputs.SetProperty(""Action"",Action);

				var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");

				MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);

			}
        }
    }
	MWorkflowProc=null;
	MOutputs=null;
	MInputs=null;
	MRowId=null;
	file = null;
	filepath = null;
	Outputs = null;
	Inputs = null;
	svc = null;

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""Resubmit"")
	{
		Resubmit();
		return(CancelOperation);    
	}
	else
    {    
		return(ContinueOperation);
    }
}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}





function Resubmit()
{
	var MRow="""";
	var MRowId="""";
	var Product="""";
	var Action="""";
	
	/*	WIPRO-Upgrade-03.05.2016-TSINGHALC - Gets the Filename along with Filepath from LOV Description	*/
	
	var svc = TheApplication().GetService(""STC Get Filename"");
	var Inputs = TheApplication().NewPropertySet();
	var Outputs = TheApplication().NewPropertySet();
	Inputs.SetProperty(""Type"",""STC_FILE_NAME"");
	Inputs.SetProperty(""LIC"",""STC_BULK_LTE_ACT_2"");
	svc.InvokeMethod(""STC Get LOV Desc"", Inputs, Outputs);
	var filepath = Outputs.GetProperty(""Description"");
	
	var file = Clib.fopen(filepath, ""rt"");
	
	/* WIPRO-Upgrade-03.05.2016-TSINGHALC - Commented the below line as the filename is received from the above lines by invoking the Generic BS */
	
	//var file=Clib.fopen(""/siebelfs/LTEAddon2.csv"", ""rt"");
	
	//var file=Clib.fopen(""C:\LTEAddon.csv"", ""rt"");

	if (file==null)
    {
		TheApplication().RaiseErrorText(""Error in opening the file"");
    }
	else
    {
		while(!Clib.feof(file))
        {

			MRow = (Clib.fgets(file));  
			MRow = trim(MRow);
			var len = MRow.length;
			var ind1 = MRow.indexOf("","");
			MRowId=MRow.substring(0,ind1);
			MRow = MRow.substring(ind1+1,len);
			var ind2 = MRow .indexOf("","");
			Product = MRow .substring(0,ind2);
			Action = MRow.substring(ind2+1,len);
			 
			//TheApplication().RaiseErrorText(NetPrice);

			var MInputs = TheApplication().NewPropertySet();
			var MOutputs = TheApplication().NewPropertySet();

			if( Product != '' || Product != null)
			{
				MInputs.SetProperty(""ProcessName"",""STC Bulk Modify Order Main WF"");
				MInputs.SetProperty(""MSISDN"",MRowId);    
				MInputs.SetProperty(""Product"",Product);
				MInputs.SetProperty(""Action"",Action);

				var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");

				MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);

			}
        }
    }
	MWorkflowProc=null;
	MOutputs=null;
	MInputs=null;
	MRowId=null;
	file = null;
	filepath = null;
	Outputs = null;
	Inputs = null;
	svc = null;

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""Resubmit"")
	{
		Resubmit();
		return(CancelOperation);    
	}
	else
    {    
		return(ContinueOperation);
    }
}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}





function Resubmit()
{
	var MRow="""";
	var MRowId="""";
	var Product="""";
	var Action="""";
	
	/*	WIPRO-Upgrade-03.05.2016-TSINGHALC - Gets the Filename along with Filepath from LOV Description	*/
	
	var svc = TheApplication().GetService(""STC Get Filename"");
	var Inputs = TheApplication().NewPropertySet();
	var Outputs = TheApplication().NewPropertySet();
	Inputs.SetProperty(""Type"",""STC_FILE_NAME"");
	Inputs.SetProperty(""LIC"",""STC_BULK_LTE_ACT_OLD"");
	svc.InvokeMethod(""STC Get LOV Desc"", Inputs, Outputs);
	var filepath = Outputs.GetProperty(""Description"");
	
	var file = Clib.fopen(filepath, ""rt"");
	
	/* WIPRO-Upgrade-03.05.2016-TSINGHALC - Commented the below line as the filename is received from the above lines by invoking the Generic BS */
	
	//var file=Clib.fopen(""/siebelfs/LTEAddon.csv"", ""rt"");
	
	//var file=Clib.fopen(""C:\LTEAddon.csv"", ""rt"");

	if (file==null)
    {
		TheApplication().RaiseErrorText(""Error in opening the file"");
    }
	else
    {
		while(!Clib.feof(file))
        {

			MRow = (Clib.fgets(file));  
			MRow = trim(MRow);
			var len = MRow.length;
			var ind1 = MRow.indexOf("","");
			MRowId=MRow.substring(0,ind1);
			MRow = MRow.substring(ind1+1,len);
			var ind2 = MRow .indexOf("","");
			Product = MRow .substring(0,ind2);
			Action = MRow.substring(ind2+1,len);
			 
			//TheApplication().RaiseErrorText(NetPrice);

			var MInputs = TheApplication().NewPropertySet();
			var MOutputs = TheApplication().NewPropertySet();

			if( Product != '' || Product != null)
			{
				MInputs.SetProperty(""ProcessName"",""STC Bulk Modify Order Main WF"");
				MInputs.SetProperty(""MSISDN"",MRowId);    
				MInputs.SetProperty(""Product"",Product);
				MInputs.SetProperty(""Action"",Action);

				var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");

				MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);

			}
        }
    }
	MWorkflowProc=null;
	MOutputs=null;
	MInputs=null;
	MRowId=null;
	file = null;
	filepath = null;
	Outputs = null;
	Inputs = null;
	svc = null;

}
function GetFileName(LOVType)
{
var sListBo = TheApplication().GetBusObject(""List Of Values"");
var sListBc = sListBo.GetBusComp(""List Of Values"");
var FilePath = """";
with(sListBc)
{
ActivateField(""Description"");
ClearToQuery();
SetViewMode(AllView);
SetSearchSpec(""Type"",LOVType);
SetSearchSpec(""Name"",LOVType);
ExecuteQuery(ForwardOnly);
var IsLovRec = FirstRecord();
if(IsLovRec)
{
FilePath = GetFieldValue(""Description"");
}//endif IsLovRec
}//endwith sListBc
return (FilePath);
}
function Resubmit()
{
var MRow="""";
var MRowId="""";
var Product="""";
var Action="""";
var Channel;
var Quantity=0;
var vFileName = GetFileName(""STC_MODIFY__LINE_FILEPATH"");
//var file=Clib.fopen(""/crmapp/LTEAddon.csv"", ""rt"");
//var file=Clib.fopen(""C:\LTEAddon.csv"", ""rt"");
var file=Clib.fopen(vFileName, ""rt"");

if (file==null)
     {
     TheApplication().RaiseErrorText(""Error in opening the file"");
      }
else
     {
while(!Clib.feof(file))
                   
             {

MRow = (Clib.fgets(file));  
MRow = trim(MRow);
var len = MRow.length;//97399009858,LTEADDON5,20,Delete,FCA

var ind1 = MRow.indexOf("","");
var MSISDN=MRow.substring(0,ind1);//97399009858

MRow = MRow.substring(ind1+1,len);//LTEADDON5,20,Delete,FCA
var ind2 = MRow .indexOf("","");
Product = MRow .substring(0,ind2);//LTEADDON5

MRow = MRow.substring(ind2+1,len);//20,Delete,FCA
var ind3 = MRow .indexOf("","");
Quantity = MRow .substring(0,ind3);//20

MRow = MRow.substring(ind3+1,len);//Delete,FCA
var Ind4 = MRow .indexOf("","");
if(Ind4 != ""-1"")
{
Action = MRow.substring(0,Ind4);//Delete
//Channel = MRow.substring(Ind4+1,len);
Channel = ""Automated"";
}
else
{
 Action = MRow;
 Channel = ""Automated"";
}
 
//TheApplication().RaiseErrorText(NetPrice);

var MInputs = TheApplication().NewPropertySet();
var MOutputs = TheApplication().NewPropertySet();

if( Product != '' || Product != null)
{
MInputs.SetProperty(""ProcessName"",""STC Bulk Modify Order Line Item WF"");
MInputs.SetProperty(""MSISDN"",MSISDN);    
MInputs.SetProperty(""Product"",Product);
MInputs.SetProperty(""Action"",Action);
MInputs.SetProperty(""ProductQuantity"",Quantity);
MInputs.SetProperty(""Channel"",""Automated"");

var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");

MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);

}
                  }
      }
MWorkflowProc=null;
MOutputs=null;
MInputs=null;
MRowId=null

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{

if(MethodName == ""Resubmit"")
   {
    Resubmit();
   return(CancelOperation);    
   }
else
     {    
return(ContinueOperation);
      }

}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""Resubmit"")
	{
		Resubmit();
		return(CancelOperation);    
	}
	else
    {    
		return(ContinueOperation);
    }
}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}




function Resubmit()
{
	var MRowId="""";

	/*	WIPRO-Upgrade-03.05.2016-TSINGHALC - Gets the Filename along with Filepath from LOV Description	*/
	
	var svc = TheApplication().GetService(""STC Get Filename"");
	var Inputs = TheApplication().NewPropertySet();
	var Outputs = TheApplication().NewPropertySet();
	Inputs.SetProperty(""Type"",""STC_FILE_NAME"");
	Inputs.SetProperty(""LIC"",""STC_BULK_MODIFY_SIM_BB"");
	svc.InvokeMethod(""STC Get LOV Desc"", Inputs, Outputs);
	var filepath = Outputs.GetProperty(""Description"");
	
	var file = Clib.fopen(filepath, ""rt"");
	
	/* WIPRO-Upgrade-03.05.2016-TSINGHALC - Commented the below line as the filename is received from the above lines by invoking the Generic BS */
	
	//var file=Clib.fopen(""/crmapp/SIMDiscount.csv"", ""rt"");

	if (file==null)
    {
		TheApplication().RaiseErrorText(""Error in opening the file"");
    }
	else
    {
		while(!Clib.feof(file))
        {

			MRowId = (Clib.fgets(file));  
			MRowId = trim(MRowId);

			var MInputs = TheApplication().NewPropertySet();
			var MOutputs = TheApplication().NewPropertySet();

			MInputs.SetProperty(""ProcessName"",""STC Bulk Modify For SIM discount Broadband"");
			MInputs.SetProperty(""Add-On1"",""VIVA Additional SIM discount Broadband"");    
			MInputs.SetProperty(""GsmPlan"",""VIVA Consumer Shared Service Plan"");    
			MInputs.SetProperty(""StatusCode"",""1"");
			MInputs.SetProperty(""MSISDN"",MRowId);
			MInputs.SetProperty(""GsmPackage"",""VIVA Broadband Package"");
			MInputs.SetProperty(""Action"",""Add"");
			MInputs.SetProperty(""SubStatus"",""Pending"");

			var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");

			MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);

        }
    }
	MWorkflowProc=null;
	MOutputs=null;
	MInputs=null;
	MRowId=null;
	file = null;
	filepath = null;
	Outputs = null;
	Inputs = null;
	svc = null;

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""Resubmit"")
	{
		Resubmit();
		return(CancelOperation);    
	}
	else
    {    
		return(ContinueOperation);
    }
}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}




function Resubmit()
{
	var MRowId="""";

	/*	WIPRO-Upgrade-03.05.2016-TSINGHALC - Gets the Filename along with Filepath from LOV Description	*/
	
	var svc = TheApplication().GetService(""STC Get Filename"");
	var Inputs = TheApplication().NewPropertySet();
	var Outputs = TheApplication().NewPropertySet();
	Inputs.SetProperty(""Type"",""STC_FILE_NAME"");
	Inputs.SetProperty(""LIC"",""STC_BULK_MOD_1MBPS"");
	svc.InvokeMethod(""STC Get LOV Desc"", Inputs, Outputs);
	var filepath = Outputs.GetProperty(""Description"");
	
	var file = Clib.fopen(filepath, ""rt"");
	
	/* WIPRO-Upgrade-03.05.2016-TSINGHALC - Commented the below line as the filename is received from the above lines by invoking the Generic BS */
	
	//var file=Clib.fopen(""/siebelfs/Rental1.csv"", ""rt"");

	if (file==null)
    {
		TheApplication().RaiseErrorText(""Error in opening the file"");
    }
	else
    {
		while(!Clib.feof(file))
        {

			MRowId = (Clib.fgets(file));  
			MRowId = trim(MRowId);

			var MInputs = TheApplication().NewPropertySet();
			var MOutputs = TheApplication().NewPropertySet();

			MInputs.SetProperty(""ProcessName"",""STC Bulk Modify For SIM discount Broadband"");
			MInputs.SetProperty(""Add-On1"",""VIVA Rental Discount 1 Mbps Unlimited Plan"");    
			MInputs.SetProperty(""GsmPlan"",""VIVA Broad band 1Mbps Unlimited Plan"");    
			MInputs.SetProperty(""StatusCode"",""1"");
			MInputs.SetProperty(""MSISDN"",MRowId);
			MInputs.SetProperty(""GsmPackage"",""VIVA Broadband Package"");
			MInputs.SetProperty(""Action"",""Add"");
			MInputs.SetProperty(""SubStatus"",""Pending"");

			var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");

			MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);

        }
    }
	MWorkflowProc=null;
	MOutputs=null;
	MInputs=null;
	MRowId=null;
	file = null;
	filepath = null;
	Outputs = null;
	Inputs = null;
	svc = null;

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""Resubmit"")
	{
		Resubmit();
		return(CancelOperation);    
	}
	else
    {    
		return(ContinueOperation);
    }
}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}




function Resubmit()
{
	var MRowId="""";

	/*	WIPRO-Upgrade-03.05.2016-TSINGHALC - Gets the Filename along with Filepath from LOV Description	*/
	
	var svc = TheApplication().GetService(""STC Get Filename"");
	var Inputs = TheApplication().NewPropertySet();
	var Outputs = TheApplication().NewPropertySet();
	Inputs.SetProperty(""Type"",""STC_FILE_NAME"");
	Inputs.SetProperty(""LIC"",""STC_BULK_MOD_2MBPS"");
	svc.InvokeMethod(""STC Get LOV Desc"", Inputs, Outputs);
	var filepath = Outputs.GetProperty(""Description"");
	
	var file = Clib.fopen(filepath, ""rt"");
	
	/* WIPRO-Upgrade-03.05.2016-TSINGHALC - Commented the below line as the filename is received from the above lines by invoking the Generic BS */
	
	//var file=Clib.fopen(""/siebelfs/Rental2.csv"", ""rt"");

	if (file==null)
    {
		TheApplication().RaiseErrorText(""Error in opening the file"");
    }
	else
    {
		while(!Clib.feof(file))
        {

			MRowId = (Clib.fgets(file));  
			MRowId = trim(MRowId);

			var MInputs = TheApplication().NewPropertySet();
			var MOutputs = TheApplication().NewPropertySet();

			MInputs.SetProperty(""ProcessName"",""STC Bulk Modify For SIM discount Broadband"");
			MInputs.SetProperty(""Add-On1"",""VIVA Rental Discount 2 Mbps Unlimited Plan"");    
			MInputs.SetProperty(""GsmPlan"",""VIVA Broad band 2Mbps Unlimited Plan"");    
			MInputs.SetProperty(""StatusCode"",""1"");
			MInputs.SetProperty(""MSISDN"",MRowId);
			MInputs.SetProperty(""GsmPackage"",""VIVA Broadband Package"");
			MInputs.SetProperty(""Action"",""Add"");
			MInputs.SetProperty(""SubStatus"",""Pending"");

			var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");

			MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);

        }
    }
	MWorkflowProc=null;
	MOutputs=null;
	MInputs=null;
	MRowId=null;
	file = null;
	filepath = null;
	Outputs = null;
	Inputs = null;
	svc = null;

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{

if(MethodName == ""Resubmit"")
   {
    Resubmit();
   return(CancelOperation);    
   }
else
     {    
return(ContinueOperation);
      }

}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}





function Resubmit()
{
var MRow="""";
var MRowId="""";
var Addon="""";
var Plan="""";
var Package="""";
var NetPrice="""";
var file=Clib.fopen(""/siebelfs/Addon.csv"", ""rt"");



if (file==null)
     {
     TheApplication().RaiseErrorText(""Error in opening the file"");
      }
else
     {
while(!Clib.feof(file))
                   
             {

MRow = (Clib.fgets(file));  
MRow = trim(MRow);
var len = MRow.length;
var ind1 = MRow.indexOf("","");
MRowId=MRow.substring(0,ind1);
MRow = MRow.substring(ind1+1,len);
var ind2 = MRow .indexOf("","");
Addon = MRow .substring(0,ind2);
NetPrice = MRow.substring(ind2+1,len);
 
//TheApplication().RaiseErrorText(NetPrice);

var MInputs = TheApplication().NewPropertySet();
var MOutputs = TheApplication().NewPropertySet();


MInputs.SetProperty(""ProcessName"",""STC Create Modify Generic WF"");
MInputs.SetProperty(""MSISDN"",MRowId);    
MInputs.SetProperty(""Addon"",Addon);
MInputs.SetProperty(""Netprice"",NetPrice);

var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");

MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);


                  }
      }
MWorkflowProc=null;
MOutputs=null;
MInputs=null;
MRowId=null

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""Resubmit"")
	{
		Resubmit();
		return(CancelOperation);    
	}
	else
    {    
		return(ContinueOperation);
    }
}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}





function Resubmit()
{
	var MRow="""";
	var MRowId="""";
	var Addon="""";
	var Plan="""";
	var Package="""";
	
	/*	WIPRO-Upgrade-03.05.2016-TSINGHALC - Gets the Filename along with Filepath from LOV Description	*/
	
	var svc = TheApplication().GetService(""STC Get Filename"");
	var Inputs = TheApplication().NewPropertySet();
	var Outputs = TheApplication().NewPropertySet();
	Inputs.SetProperty(""Type"",""STC_FILE_NAME"");
	Inputs.SetProperty(""LIC"",""STC_BULK_MODIFY_ORDER"");
	svc.InvokeMethod(""STC Get LOV Desc"", Inputs, Outputs);
	var filepath = Outputs.GetProperty(""Description"");
	
	var file = Clib.fopen(filepath, ""rt"");
	
	/* WIPRO-Upgrade-03.05.2016-TSINGHALC - Commented the below line as the filename is received from the above lines by invoking the Generic BS */
	
	//var file=Clib.fopen(""/siebelfs/Addon.csv"", ""rt"");

	if (file==null)
    {
		TheApplication().RaiseErrorText(""Error in opening the file"");
    }
	else
    {
		while(!Clib.feof(file))
        {

			MRow = (Clib.fgets(file));  
			MRow = trim(MRow);
			var len = MRow.length;
			var ind1 = MRow.indexOf("","");
			MRowId=MRow.substring(0,ind1);
			 
			Addon= MRow.substring(ind1+1,len);

			//TheApplication().RaiseErrorText(Addon);

			var MInputs = TheApplication().NewPropertySet();
			var MOutputs = TheApplication().NewPropertySet();

			MInputs.SetProperty(""ProcessName"",""STC Modify Order Creation WF"");
			MInputs.SetProperty(""MSISDN"",MRowId);    
			MInputs.SetProperty(""Addon"",Addon);

			var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");

			MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);


        }
    }
	MWorkflowProc=null;
	MOutputs=null;
	MInputs=null;
	MRowId=null;
	file = null;
	filepath = null;
	Outputs = null;
	Inputs = null;
	svc = null;

}
"//Your public declarations go here...  
"
function GenrateList(Inputs, Outputs)
{
	var HeaderBO ="""",BulkProdBC="""",HeaderBC="""",BulkDataBC="""";
	var BulkReqId="""",PlanList ="""",IsDataRecFound ="""",IsRecFound= """",assetRecFound="""";
	var AssetBO = """",AssetBC ="""",searchst1="""";
	var vDataId,CurPlanName="""",vPlanName="""",vPlanContName,vRouterName,vRouterCont,SmartDevice,SmartContract,SANId,vMSISDN;
	try
	{
		HeaderBO = TheApplication().GetBusObject(""STC Business Bulk Modify Orders BO"");
		AssetBO = TheApplication().GetBusObject(""STCISLAccountBO"");
		AssetBC = AssetBO.GetBusComp(""STC ISL Asset Mgmt - Asset BC"");
		BulkReqId = Inputs.GetProperty(""BulkReqId"")
		//TheApplication().RaiseErrorText(""Bulk Request Id""+BulkReqId);
		with(HeaderBO)
		{ 
			HeaderBC = GetBusComp(""STC Bulk Modify Orders Header BC"");
			BulkDataBC = GetBusComp(""STC Bulk Modify Order Data BC"");
			BulkProdBC = GetBusComp(""STC Bulk Modify Order Line Items BC"");
		}
		with(HeaderBC)
		{
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Request Id"", BulkReqId);
			ExecuteQuery(ForwardOnly);
			if (FirstRecord())
			{
				with(BulkDataBC)
				{
					SetViewMode(AllView);
					ClearToQuery();
					ActivateField(""Parent Request Id"");
					ActivateField(""STC Description Note""); ///PlantList
					ActivateField(""VIVA Plan""); // PlanName
					ActivateField(""Plan Contract Product""); //PlanContract
					ActivateField(""STC Current Router Name""); // RouterName
					ActivateField(""STC Old Contract Part Code""); // Smart Contract
					ActivateField(""CLI Addon""); //Smard Device
					ActivateField(""STC New Contract Name"");  // RouterContract
					ActivateField(""STC Currrent SAN Id"");
					ActivateField(""MSISDN"");
					SetSearchSpec(""Parent Request Id"", BulkReqId);
					
					ExecuteQuery(ForwardOnly);
					IsRecFound = FirstRecord()
					while(IsRecFound)
					{
						vDataId = GetFieldValue(""Id"");
						vPlanName = GetFieldValue(""VIVA Plan""); // PlanName
						vPlanContName = GetFieldValue(""Plan Contract Product""); //PlanContract
						vRouterName = GetFieldValue(""STC Current Router Name""); // RouterName
						vRouterCont =GetFieldValue(""STC New Contract Name""); // RouterContract
						SmartDevice = GetFieldValue(""CLI Addon""); //Smard Device
						SmartContract = GetFieldValue(""STC Old Contract Part Code"");// Smart Contract
						SANId = GetFieldValue(""STC Currrent SAN Id"");
						vMSISDN = GetFieldValue(""MSISDN"");
						with(AssetBC)
						{
							SetViewMode(AllView);
							ClearToQuery();
							ActivateField(""Service Account Id"");
							ActivateField(""Product Name"");
							ActivateField(""Product Part Number"");
							//searchst1 = ""[Service Account Id]='""+SANId+""' AND [Status] <> 'Inactive' AND [Parent Asset Id] IS NULL"";
							searchst1 = ""[Serial Number]='""+vMSISDN+""' AND [Status] <> 'Inactive' AND [STC Plan Type]='Service Plan'"";
							SetSearchExpr(searchst1);
							ExecuteQuery(ForwardOnly);
							assetRecFound = FirstRecord()
							if(assetRecFound)
							{
								CurPlanName = GetFieldValue(""Product Name""); 
							}
						}
						
						if(CurPlanName)
						{	
							if((vPlanName !="""" && vPlanName !=null) && (vPlanName != CurPlanName))
							{
								PlanList = vPlanName;
							}
						}
						else{
							PlanList = vPlanName;
						}
						if(vPlanContName !="""" && vPlanContName !=null)
						{
							if (PlanList != """" && PlanList != null)
								PlanList = PlanList+"",""+vPlanContName;
							else
								PlanList = vPlanContName;      
						}
						if(vRouterName !="""" && vRouterName != null)
						{
							if (PlanList != """" && PlanList != null)
								PlanList = PlanList+"",""+vRouterName;
							else
								PlanList = vRouterName;
						}
						if(vRouterCont !="""" && vRouterCont != null)
						{
							if (PlanList != """" && PlanList != null)
								PlanList = PlanList+"",""+vRouterName+"":""+vRouterCont;
							else
								PlanList = vRouterName+"":""+vRouterCont;;
						}
						if(SmartDevice !="""" && SmartDevice !=null)
						{
							if (PlanList != """" && PlanList != null)
								PlanList = PlanList+"",""+SmartDevice;
							else
								PlanList = SmartDevice;
						}
						if(SmartContract !="""" && SmartContract !=null)
						{
							if (PlanList != """" && PlanList != null)
								PlanList = PlanList+"",""+SmartDevice+"":""+SmartContract;
							else
								PlanList = SmartDevice+"":""+SmartContract;;
						}
						
						with(BulkProdBC)
						{
							SetViewMode(AllView);
							ClearToQuery();
							ActivateField(""Parent Row Id"");
							ActivateField(""Product Name"");
							SetSearchSpec(""Parent Row Id"", vDataId); 
							ExecuteQuery(ForwardOnly);
							IsDataRecFound = FirstRecord()
							while(IsDataRecFound)
							{
								if (PlanList != """" && PlanList != null)
									PlanList= PlanList +"",""+GetFieldValue(""Product Name"");
								else
									PlanList= GetFieldValue(""Product Name"");
								
								IsDataRecFound = NextRecord(); 
							}
						} //  END BulkProdBC
						SetFieldValue(""STC Description Note"",PlanList);
						WriteRecord();
						
						Outputs.SetProperty(""MSISDN"", vMSISDN);
						Outputs.SetProperty(""PlanList"", PlanList);
						PlanList = """";
						IsRecFound = NextRecord();
						
					}//while(IsRecFound)
				} //BulkDataBC
			}// HeaderBC FirstRec
		} // With HeaderBC
	} ///try 
	catch(e)
	{
		throw(e);
	}
	finally
	{
		BulkProdBC = null;
		BulkDataBC = null;
		HeaderBC = null;
		AssetBC = null;
		AssetBO = null;
		HeaderBO = null;
	}
}
function GetProductName(Inputs, Outputs)
{
	var vPartNum=Inputs.GetProperty(""PartNum"") ;
	var vProdBO = TheApplication().GetBusObject(""Admin ISS Product Definition"");
	var vProdBC = vProdBO.GetBusComp(""Internal Product - ISS Admin"");
	var vProdName;
	with(vProdBC)
	{
		SetViewMode(AllView);
		ClearToQuery();
		ActivateField(""Name"");
		ActivateField(""Part #"");
		var vSearchExp= ""[Part #]='""+vPartNum+""'"";
		SetSearchExpr(vSearchExp);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			vProdName= GetFieldValue(""Name"");
		}
	}
	Outputs.SetProperty(""ProductName"",vProdName);
}
function GetProductName(Inputs, Outputs)
{
	var vPartNum=Inputs.GetProperty(""PartNum"") ;
	var vProdBO = TheApplication().GetBusObject(""Admin ISS Product Definition"");
	var vProdBC = vProdBO.GetBusComp(""Internal Product - ISS Admin"");
	var vProdName="""";
	with(vProdBC)
	{
		SetViewMode(AllView);
		ClearToQuery();
		ActivateField(""Name"");
		ActivateField(""Part #"");
		var vSearchExp= ""[Part #]='""+vPartNum+""'"";
		SetSearchExpr(vSearchExp);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			vProdName= GetFieldValue(""Name"");
		}
	}
	Outputs.SetProperty(""ProductName"",vProdName);
}
function List_Values(PlanPartCode)
{
		//var sType  = Inputs.GetProperty(""Type"");
		//var LIC = Inputs.GetProperty(""LIC"");

		var boLOV = null, bcLOV = null,isRec="""", searchExpr = null; 
		boLOV = TheApplication().GetBusObject(""List Of Values"");
		bcLOV = boLOV.GetBusComp(""List Of Values"");
		with(bcLOV)
		{
			ActivateField(""Type"");
			ActivateField(""Name"");
			ActivateField(""Value"");
			ActivateField(""Order By"");
			ActivateField(""Active"");
			ActivateField(""High"");
			ActivateField(""Low"");
			ActivateField(""Description"");
			SetViewMode(3);
			ClearToQuery();
			searchExpr = ""[Type]='STC_PLAN_LTE_ADD_ON' AND [Name] = '""+PlanPartCode+""' AND [Active]='Y'"";
			SetSearchExpr(searchExpr);
			ExecuteQuery(ForwardOnly);
			isRec = FirstRecord();
			if (isRec)
			{
				return(GetFieldValue(""High""));
			
			}
		}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	try
	{
		if(MethodName ==""GenrateList"")
		{
			GenrateList(Inputs, Outputs)
			return(CancelOperation);
		}
		if(MethodName ==""mPOSGenerateList"")
		{
			mPOSGenrateList(Inputs, Outputs)
			return(CancelOperation);
		}
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
	}
	return (ContinueOperation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	try
	{
		if(MethodName ==""GenrateList"")
		{
			GenrateList(Inputs, Outputs);
			return(CancelOperation);
		}
		if(MethodName ==""mPOSGenerateList"")
		{
			mPOSGenrateList(Inputs, Outputs);
			return(CancelOperation);
		}
		if(MethodName ==""mPOSParentGenerateList"")
		{
			mPOSParentGenerateList(Inputs, Outputs);
			return(CancelOperation);
		}
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
	}
	return (ContinueOperation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	try
	{
		if(MethodName ==""GenrateList"")
		{
			GenrateList(Inputs, Outputs);
			return(CancelOperation);
		}
		if(MethodName ==""mPOSGenerateList"")
		{
			mPOSGenrateList(Inputs, Outputs);
			return(CancelOperation);
		}
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
	}
	return (ContinueOperation);
}
function mPOSGenrateList(Inputs, Outputs)
{
	var vMenaPrdBO ="""",vMenaPrdBC="""";
	var vOrderId="""",vProdList ="""",IsRecFound= """";
	var vPlanName,vPlanContract,vVanityContract,vDevNamePart,vDevContractPart,vDevName,vDevContract;
	var vPlanPart,vPlanContractPart,vVanityContractPart;
	try
	{
		vMenaPrdBO = TheApplication().GetBusObject(""STC MENA Product BO"");
		vMenaPrdBC = vMenaPrdBO.GetBusComp(""STC MENA Product Data BC"");
		vOrderId = Inputs.GetProperty(""OrderId"");
		var iPs = TheApplication().NewPropertySet();
		var oPs = TheApplication().NewPropertySet();
		with(vMenaPrdBC)// service plan
		{
			SetViewMode(AllView);
			ClearToQuery();
			ActivateField(""MSISDN"");
			ActivateField(""Type"");
			ActivateField(""Parent Row Id"");
			ActivateField(""Product Attribute 1"");
			ActivateField(""Product Attribute 2"");
			ActivateField(""Product Attribute 3"");
			ActivateField(""Product Attribute 4"");
			ActivateField(""Product Attribute 7"");
			ActivateField(""Product Attribute 8"");
			ActivateField(""Product Attribute 9"");
			ActivateField(""MENA Service Number"");
			ActivateField(""IMEI"");

			var vSearchExp= ""[Parent Row Id]='""+vOrderId+""' AND [Type]='Service Plan'"";
			SetSearchExpr(vSearchExp);
			ExecuteQuery(ForwardOnly);
			if (FirstRecord())
			{
				vPlanPart = GetFieldValue(""Product Attribute 1"");
				vPlanContractPart = GetFieldValue(""Product Attribute 3"");
				vVanityContractPart = GetFieldValue(""Product Attribute 4"");
				iPs.SetProperty(""PartNum"",vPlanPart);
				GetProductName(iPs,oPs);
				vPlanName=oPs.GetProperty(""ProductName"");
				
			}
			vProdList=vPlanName;
			if(vPlanContractPart !="""" && vPlanContractPart !=null)
			{
				//vPlanContract=GetProductName(vPlanContractPart);
				iPs.SetProperty(""PartNum"",vPlanContractPart);
				GetProductName(iPs,oPs);
				vPlanContract=oPs.GetProperty(""ProductName"");
				
				vProdList=vProdList+"",""+vPlanContract;
			}
			if(vVanityContractPart !="""" && vVanityContractPart !=null)
			{
				//vVanityContract=GetProductName(vVanityContractPart);
				iPs.SetProperty(""PartNum"",vVanityContractPart);
				GetProductName(iPs,oPs);
				vVanityContract=oPs.GetProperty(""ProductName"");
				
				vProdList=vProdList+"",""+vVanityContract;
			}
		}//with service plan

		with(vMenaPrdBC)// device addon
		{
			SetViewMode(AllView);
			ClearToQuery();
			ActivateField(""MSISDN"");
			ActivateField(""Type"");
			ActivateField(""Parent Row Id"");
			ActivateField(""Product Attribute 1"");
			ActivateField(""Product Attribute 2"");
			ActivateField(""Product Attribute 3"");
			ActivateField(""Product Attribute 4"");
			ActivateField(""Product Attribute 7"");
			ActivateField(""Product Attribute 8"");
			ActivateField(""Product Attribute 9"");
			ActivateField(""MENA Service Number"");
			ActivateField(""IMEI"");

			var vSearchExp= ""[Parent Row Id]='""+vOrderId+""' AND [Type]='Device Addon'"";
			SetSearchExpr(vSearchExp);
			ExecuteQuery(ForwardOnly);
			IsRecFound = FirstRecord()
			while(IsRecFound)
			
			{
				vDevNamePart = GetFieldValue(""Product Attribute 1"");
				vDevContractPart = GetFieldValue(""Product Attribute 2"");
					if(vDevNamePart !="""" && vDevNamePart !=null)
					{
						//vDevName=GetProductName(vDevNamePart);
						iPs.SetProperty(""PartNum"",vDevNamePart);
						GetProductName(iPs,oPs);
						vDevName=oPs.GetProperty(""ProductName"");
				
						vProdList=vProdList+"",""+vDevName;
					}
					if(vDevContractPart !="""" && vDevContractPart !=null)
					{
						//vDevContract=GetProductName(vDevContractPart);
						iPs.SetProperty(""PartNum"",vDevContractPart);
						GetProductName(iPs,oPs);
						vDevContract=oPs.GetProperty(""ProductName"");
				
						vProdList=vProdList+"",""+vDevContract;
					}
				Outputs.SetProperty(""ProdList"", vProdList);
				IsRecFound=NextRecord();
			}// while

		}//with device addon

		
	} ///try 
	catch(e)
	{
		throw(e);
	}
	finally
	{

	}
}
function mPOSGenrateList(Inputs, Outputs)
{
	//REV01 = [Indrasen:fy21_r8:CRM-R9:04May2021:mPOS enhancemnet phase2 Fix]
	//REV02 = Indrasen: fy21_r11 :fix :Device Contracts with colon(:) in list
	var vMenaPrdBO ="""",vMenaPrdBC="""";
	var vOrderId="""",vProdList ="""",IsRecFound= """";
	var vPlanName="""",vPlanContract="""",vVanityContract="""",vDevNamePart="""",vDevContractPart="""",vDevName="""",vDevContract="""";
	var vPlanPart="""",vPlanContractPart="""",vVanityContractPart="""",vAddonPart="""",vAddonName="""";
	var boOrder="""", bcLineItem="""", vExistPlanName="""", vExistPlanPart="""";
	var iPs, oPs, vSearchExp="""",vTransSubType ="""",vSubField2 ="""";
	var oApp = TheApplication();
	try
	{
		vMenaPrdBO = oApp.GetBusObject(""STC MENA Product BO"");
		vMenaPrdBC = vMenaPrdBO.GetBusComp(""STC MENA Product Data BC"");
		vOrderId = Inputs.GetProperty(""OrderId"");
		iPs = oApp.NewPropertySet();
		oPs = oApp.NewPropertySet();
		
		boOrder = oApp.GetBusObject(""Order Entry (Sales)"");
		bcLineItem = boOrder.GetBusComp(""MACD Order Entry - Line Items"");
		with(bcLineItem) 	//REV01
		{
			ActivateField(""Product Part Number"");
			ActivateField(""Product"");
			ClearToQuery();
			SetViewMode(AllView);
			vSearchExp = ""[Order Header Id]='""+vOrderId+""' AND [STC Plan Type] = 'Service Plan' AND [Action Code] <> 'Add'"";
			SetSearchExpr(vSearchExp);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
			{
				vExistPlanPart = GetFieldValue(""Product Part Number"");
				vExistPlanName = GetFieldValue(""Product"");
			}
		}
		with(vMenaPrdBC)// service plan
		{
			vSearchExp="""";
			SetViewMode(AllView);
			ClearToQuery();
			ActivateField(""MSISDN"");
			ActivateField(""Type"");
			ActivateField(""Parent Row Id"");
			ActivateField(""Product Attribute 1"");
			ActivateField(""Product Attribute 2"");
			ActivateField(""Product Attribute 3"");
			ActivateField(""Product Attribute 4"");
			ActivateField(""Product Attribute 7"");
			ActivateField(""Product Attribute 8"");
			ActivateField(""Product Attribute 9"");
			ActivateField(""Product Attribute 11"");
			ActivateField(""Product Attribute 12"");
			ActivateField(""MENA Service Number"");
			ActivateField(""IMEI"");

			vSearchExp= ""[Parent Row Id]='""+vOrderId+""' AND [Type]='Service Plan'"";
			SetSearchExpr(vSearchExp);
			ExecuteQuery(ForwardOnly);
			if (FirstRecord())
			{
				vPlanPart = GetFieldValue(""Product Attribute 1"");
				vPlanContractPart = GetFieldValue(""Product Attribute 3"");
				vVanityContractPart = GetFieldValue(""Product Attribute 4"");
				vTransSubType = GetFieldValue(""Product Attribute 11"");
				vSubField2 = GetFieldValue(""Product Attribute 12"");
				
				if(vExistPlanPart != vPlanPart)	//REV01
				{
					iPs.SetProperty(""PartNum"",vPlanPart);
					GetProductName(iPs,oPs);
					vPlanName=oPs.GetProperty(""ProductName"");
					vAddonPart = List_Values(vPlanPart);
					//vAddonPart = oApp.GetLOVFieldExpr(""[Type]='STC_PLAN_LTE_ADD_ON' AND [Name] = '""+vPlanPart+""' AND [Active]='Y'"", ""High"");	//REV02
					if(vAddonPart !="""") // Plan Addon
					{
						iPs.SetProperty(""PartNum"",vAddonPart);
						GetProductName(iPs,oPs);
						vAddonName=oPs.GetProperty(""ProductName"");
					}
				}
			}
			//vProdList=vPlanName;	
			if(vPlanContractPart !="""" && vPlanContractPart !=null)
			{
				iPs.SetProperty(""PartNum"",vPlanContractPart);
				GetProductName(iPs,oPs);
				vPlanContract=oPs.GetProperty(""ProductName"");
				
				//vProdList=vProdList+"",""+vPlanContract;
			}
			if(vVanityContractPart !="""" && vVanityContractPart !=null)
			{
				iPs.SetProperty(""PartNum"",vVanityContractPart);
				GetProductName(iPs,oPs);
				vVanityContract=oPs.GetProperty(""ProductName"");
				
				//vProdList=vProdList+"",""+vVanityContract;
			}
			if (vTransSubType == ""B2C"")
			{
				if(vSubField2 !="""" && vSubField2 !=null)
				{
						iPs.SetProperty(""PartNum"",vSubField2);
						GetProductName(iPs,oPs);
						vAddonName=oPs.GetProperty(""ProductName"");
				}
			}
			if(vPlanName != """")	//REV01
				vProdList=vPlanName;
			if(vAddonName !="""") // Plan Addon	//REV02 hardik
			{
				if(vProdList == """")
					vProdList = vAddonName;
				else
					vProdList = vProdList+"",""+vAddonName;
			}
			if(vPlanContract != """")
			{
				if(vProdList == """")
					vProdList = vPlanContract;
				else
					vProdList = vProdList+"",""+vPlanContract;
			}
			if(vVanityContract != """")
			{
				if(vProdList == """")
					vProdList = vVanityContract;
				else
					vProdList = vProdList+"",""+vVanityContract;
			}
		}//with service plan

		with(vMenaPrdBC)// device addon
		{
			vSearchExp="""";
			SetViewMode(AllView);
			ClearToQuery();
			ActivateField(""MSISDN"");
			ActivateField(""Type"");
			ActivateField(""Parent Row Id"");
			ActivateField(""Product Attribute 1"");
			ActivateField(""Product Attribute 2"");
			ActivateField(""Product Attribute 3"");
			ActivateField(""Product Attribute 4"");
			ActivateField(""Product Attribute 7"");
			ActivateField(""Product Attribute 8"");
			ActivateField(""Product Attribute 9"");
			ActivateField(""MENA Service Number"");
			ActivateField(""IMEI"");

			vSearchExp= ""[Parent Row Id]='""+vOrderId+""' AND [Type]='Device Addon'"";
			SetSearchExpr(vSearchExp);
			ExecuteQuery(ForwardOnly);
			IsRecFound = FirstRecord()
			while(IsRecFound)
			{
				vDevNamePart=""""; vDevContractPart=""""; vDevName=""""; vDevContract=""""; //new
				vDevNamePart = GetFieldValue(""Product Attribute 1"");
				vDevContractPart = GetFieldValue(""Product Attribute 2"");
				
				if(vDevNamePart !="""" && vDevNamePart !=null)
				{
					iPs.SetProperty(""PartNum"",vDevNamePart);
					GetProductName(iPs,oPs);
					vDevName=oPs.GetProperty(""ProductName"");
				}
				if(vDevContractPart !="""" && vDevContractPart !=null)
				{
					iPs.SetProperty(""PartNum"",vDevContractPart);
					GetProductName(iPs,oPs);
					vDevContract=oPs.GetProperty(""ProductName"");
				}
				
				if(vDevName != """") //REV01
				{
					if(vProdList == """")
						vProdList = vDevName;
					else
						vProdList = vProdList+"",""+vDevName;
				}
				if(vDevContract != """")
				{
					if(vProdList == """")
						vProdList = vDevContract;
					else if(vDevName != """")				//REV02
						vProdList = vProdList+"",""+vDevName+"":""+vDevContract;	
					else
						vProdList = vProdList+"",""+vDevContract;
				}
				
				IsRecFound=NextRecord();
			}// while
		}//with device addon
	
		Outputs.SetProperty(""ProdList"", vProdList);
		
	} ///try 
	catch(e)
	{
		Outputs.SetProperty(""ErrorMsg"", e);
		throw(e);
	}
	finally
	{
		iPs=null; oPs=null; vMenaPrdBC=null; vMenaPrdBO=null; bcLineItem=null; boOrder=null; oApp = null;
	}
}
function mPOSGenrateList(Inputs, Outputs)
{
	//REV01 = [Indrasen:fy21_r8:CRM-R9:04May2021:mPOS enhancemnet phase2 Fix]
	//REV02 = Indrasen: fy21_r11 :fix :Device Contracts with colon(:) in list
	var vMenaPrdBO ="""",vMenaPrdBC="""";
	var vOrderId="""",vProdList ="""",IsRecFound= """";
	var vPlanName="""",vPlanContract="""",vVanityContract="""",vDevNamePart="""",vDevContractPart="""",vDevName="""",vDevContract="""";
	var vPlanPart="""",vPlanContractPart="""",vVanityContractPart="""",vAddonPart="""",vAddonName="""";
	var boOrder="""", bcLineItem="""", vExistPlanName="""", vExistPlanPart="""";
	var iPs, oPs, vSearchExp="""";
	var oApp = TheApplication();
	try
	{
		vMenaPrdBO = oApp.GetBusObject(""STC MENA Product BO"");
		vMenaPrdBC = vMenaPrdBO.GetBusComp(""STC MENA Product Data BC"");
		vOrderId = Inputs.GetProperty(""OrderId"");
		iPs = oApp.NewPropertySet();
		oPs = oApp.NewPropertySet();
		
		boOrder = oApp.GetBusObject(""Order Entry (Sales)"");
		bcLineItem = boOrder.GetBusComp(""MACD Order Entry - Line Items"");
		with(bcLineItem) 	//REV01
		{
			ActivateField(""Product Part Number"");
			ActivateField(""Product"");
			ClearToQuery();
			SetViewMode(AllView);
			vSearchExp = ""[Order Header Id]='""+vOrderId+""' AND [STC Plan Type] = 'Service Plan' AND [Action Code] <> 'Add'"";
			SetSearchExpr(vSearchExp);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
			{
				vExistPlanPart = GetFieldValue(""Product Part Number"");
				vExistPlanName = GetFieldValue(""Product"");
			}
		}
		with(vMenaPrdBC)// service plan
		{
			vSearchExp="""";
			SetViewMode(AllView);
			ClearToQuery();
			ActivateField(""MSISDN"");
			ActivateField(""Type"");
			ActivateField(""Parent Row Id"");
			ActivateField(""Product Attribute 1"");
			ActivateField(""Product Attribute 2"");
			ActivateField(""Product Attribute 3"");
			ActivateField(""Product Attribute 4"");
			ActivateField(""Product Attribute 7"");
			ActivateField(""Product Attribute 8"");
			ActivateField(""Product Attribute 9"");
			ActivateField(""MENA Service Number"");
			ActivateField(""IMEI"");

			vSearchExp= ""[Parent Row Id]='""+vOrderId+""' AND [Type]='Service Plan'"";
			SetSearchExpr(vSearchExp);
			ExecuteQuery(ForwardOnly);
			if (FirstRecord())
			{
				vPlanPart = GetFieldValue(""Product Attribute 1"");
				vPlanContractPart = GetFieldValue(""Product Attribute 3"");
				vVanityContractPart = GetFieldValue(""Product Attribute 4"");
				
				if(vExistPlanPart != vPlanPart)	//REV01
				{
					iPs.SetProperty(""PartNum"",vPlanPart);
					GetProductName(iPs,oPs);
					vPlanName=oPs.GetProperty(""ProductName"");
					vAddonPart = List_Values(vPlanPart);
					//vAddonPart = oApp.GetLOVFieldExpr(""[Type]='STC_PLAN_LTE_ADD_ON' AND [Name] = '""+vPlanPart+""' AND [Active]='Y'"", ""High"");	//REV02
					if(vAddonPart !="""") // Plan Addon
					{
						iPs.SetProperty(""PartNum"",vAddonPart);
						GetProductName(iPs,oPs);
						vAddonName=oPs.GetProperty(""ProductName"");
					}
				}
			}
			//vProdList=vPlanName;	
			if(vPlanContractPart !="""" && vPlanContractPart !=null)
			{
				iPs.SetProperty(""PartNum"",vPlanContractPart);
				GetProductName(iPs,oPs);
				vPlanContract=oPs.GetProperty(""ProductName"");
				
				//vProdList=vProdList+"",""+vPlanContract;
			}
			if(vVanityContractPart !="""" && vVanityContractPart !=null)
			{
				iPs.SetProperty(""PartNum"",vVanityContractPart);
				GetProductName(iPs,oPs);
				vVanityContract=oPs.GetProperty(""ProductName"");
				
				//vProdList=vProdList+"",""+vVanityContract;
			}
			
			if(vPlanName != """")	//REV01
				vProdList=vPlanName;
			if(vAddonName !="""") // Plan Addon	//REV02 hardik
			{
				if(vProdList == """")
					vProdList = vAddonName;
				else
					vProdList = vProdList+"",""+vAddonName;
			}
			if(vPlanContract != """")
			{
				if(vProdList == """")
					vProdList = vPlanContract;
				else
					vProdList = vProdList+"",""+vPlanContract;
			}
			if(vVanityContract != """")
			{
				if(vProdList == """")
					vProdList = vVanityContract;
				else
					vProdList = vProdList+"",""+vVanityContract;
			}
		}//with service plan

		with(vMenaPrdBC)// device addon
		{
			vSearchExp="""";
			SetViewMode(AllView);
			ClearToQuery();
			ActivateField(""MSISDN"");
			ActivateField(""Type"");
			ActivateField(""Parent Row Id"");
			ActivateField(""Product Attribute 1"");
			ActivateField(""Product Attribute 2"");
			ActivateField(""Product Attribute 3"");
			ActivateField(""Product Attribute 4"");
			ActivateField(""Product Attribute 7"");
			ActivateField(""Product Attribute 8"");
			ActivateField(""Product Attribute 9"");
			ActivateField(""MENA Service Number"");
			ActivateField(""IMEI"");

			vSearchExp= ""[Parent Row Id]='""+vOrderId+""' AND [Type]='Device Addon'"";
			SetSearchExpr(vSearchExp);
			ExecuteQuery(ForwardOnly);
			IsRecFound = FirstRecord()
			while(IsRecFound)
			{
				vDevNamePart=""""; vDevContractPart=""""; vDevName=""""; vDevContract=""""; //new
				vDevNamePart = GetFieldValue(""Product Attribute 1"");
				vDevContractPart = GetFieldValue(""Product Attribute 2"");
				
				if(vDevNamePart !="""" && vDevNamePart !=null)
				{
					iPs.SetProperty(""PartNum"",vDevNamePart);
					GetProductName(iPs,oPs);
					vDevName=oPs.GetProperty(""ProductName"");
				}
				if(vDevContractPart !="""" && vDevContractPart !=null)
				{
					iPs.SetProperty(""PartNum"",vDevContractPart);
					GetProductName(iPs,oPs);
					vDevContract=oPs.GetProperty(""ProductName"");
				}
				
				if(vDevName != """") //REV01
				{
					if(vProdList == """")
						vProdList = vDevName;
					else
						vProdList = vProdList+"",""+vDevName;
				}
				if(vDevContract != """")
				{
					if(vProdList == """")
						vProdList = vDevContract;
					else if(vDevName != """")				//REV02
						vProdList = vProdList+"",""+vDevName+"":""+vDevContract;	
					else
						vProdList = vProdList+"",""+vDevContract;
				}
				
				IsRecFound=NextRecord();
			}// while
		}//with device addon
	
		Outputs.SetProperty(""ProdList"", vProdList);
		
	} ///try 
	catch(e)
	{
		Outputs.SetProperty(""ErrorMsg"", e);
		throw(e);
	}
	finally
	{
		iPs=null; oPs=null; vMenaPrdBC=null; vMenaPrdBO=null; bcLineItem=null; boOrder=null; oApp = null;
	}
}
function mPOSGenrateList_Bkp(Inputs, Outputs)
{
	var vMenaPrdBO ="""",vMenaPrdBC="""";
	var vOrderId="""",vProdList ="""",IsRecFound= """";
	var vPlanName,vPlanContract,vVanityContract,vDevNamePart,vDevContractPart,vDevName,vDevContract;
	var vPlanPart,vPlanContractPart,vVanityContractPart;
	try
	{
		vMenaPrdBO = TheApplication().GetBusObject(""STC MENA Product BO"");
		vMenaPrdBC = vMenaPrdBO.GetBusComp(""STC MENA Product Data BC"");
		vOrderId = Inputs.GetProperty(""OrderId"");
		var iPs = TheApplication().NewPropertySet();
		var oPs = TheApplication().NewPropertySet();
		with(vMenaPrdBC)// service plan
		{
			SetViewMode(AllView);
			ClearToQuery();
			ActivateField(""MSISDN"");
			ActivateField(""Type"");
			ActivateField(""Parent Row Id"");
			ActivateField(""Product Attribute 1"");
			ActivateField(""Product Attribute 2"");
			ActivateField(""Product Attribute 3"");
			ActivateField(""Product Attribute 4"");
			ActivateField(""Product Attribute 7"");
			ActivateField(""Product Attribute 8"");
			ActivateField(""Product Attribute 9"");
			ActivateField(""MENA Service Number"");
			ActivateField(""IMEI"");

			var vSearchExp= ""[Parent Row Id]='""+vOrderId+""' AND [Type]='Service Plan'"";
			SetSearchExpr(vSearchExp);
			ExecuteQuery(ForwardOnly);
			if (FirstRecord())
			{
				vPlanPart = GetFieldValue(""Product Attribute 1"");
				vPlanContractPart = GetFieldValue(""Product Attribute 3"");
				vVanityContractPart = GetFieldValue(""Product Attribute 4"");
				iPs.SetProperty(""PartNum"",vPlanPart);
				GetProductName(iPs,oPs);
				vPlanName=oPs.GetProperty(""ProductName"");
				
			}
			vProdList=vPlanName;
			if(vPlanContractPart !="""" && vPlanContractPart !=null)
			{
				//vPlanContract=GetProductName(vPlanContractPart);
				iPs.SetProperty(""PartNum"",vPlanContractPart);
				GetProductName(iPs,oPs);
				vPlanContract=oPs.GetProperty(""ProductName"");
				
				vProdList=vProdList+"",""+vPlanContract;
			}
			if(vVanityContractPart !="""" && vVanityContractPart !=null)
			{
				//vVanityContract=GetProductName(vVanityContractPart);
				iPs.SetProperty(""PartNum"",vVanityContractPart);
				GetProductName(iPs,oPs);
				vVanityContract=oPs.GetProperty(""ProductName"");
				
				vProdList=vProdList+"",""+vVanityContract;
			}
		}//with service plan

		with(vMenaPrdBC)// device addon
		{
			SetViewMode(AllView);
			ClearToQuery();
			ActivateField(""MSISDN"");
			ActivateField(""Type"");
			ActivateField(""Parent Row Id"");
			ActivateField(""Product Attribute 1"");
			ActivateField(""Product Attribute 2"");
			ActivateField(""Product Attribute 3"");
			ActivateField(""Product Attribute 4"");
			ActivateField(""Product Attribute 7"");
			ActivateField(""Product Attribute 8"");
			ActivateField(""Product Attribute 9"");
			ActivateField(""MENA Service Number"");
			ActivateField(""IMEI"");

			var vSearchExp= ""[Parent Row Id]='""+vOrderId+""' AND [Type]='Device Addon'"";
			SetSearchExpr(vSearchExp);
			ExecuteQuery(ForwardOnly);
			IsRecFound = FirstRecord()
			while(IsRecFound)
			
			{
				vDevNamePart = GetFieldValue(""Product Attribute 1"");
				vDevContractPart = GetFieldValue(""Product Attribute 2"");
					if(vDevNamePart !="""" && vDevNamePart !=null)
					{
						//vDevName=GetProductName(vDevNamePart);
						iPs.SetProperty(""PartNum"",vDevNamePart);
						GetProductName(iPs,oPs);
						vDevName=oPs.GetProperty(""ProductName"");
				
						vProdList=vProdList+"",""+vDevName;
					}
					if(vDevContractPart !="""" && vDevContractPart !=null)
					{
						//vDevContract=GetProductName(vDevContractPart);
						iPs.SetProperty(""PartNum"",vDevContractPart);
						GetProductName(iPs,oPs);
						vDevContract=oPs.GetProperty(""ProductName"");
				
						vProdList=vProdList+"",""+vDevContract;
					}
				Outputs.SetProperty(""ProdList"", vProdList);
				IsRecFound=NextRecord();
			}// while

		}//with device addon

		
	} ///try 
	catch(e)
	{
		throw(e);
	}
	finally
	{

	}
}
function mPOSParentGenerateList(Inputs, Outputs)
{
	//Hardik: Added for mPOS Parent Order
	var vMenaPrdBO ="""",vMenaPrdBC="""";
	var vOrderId="""",vProdList ="""",IsRecFound= """",vMSISDN="""";
	var vPlanName="""",vPlanContract="""",vVanityContract="""",vDevNamePart="""",vDevContractPart="""",vDevName="""",vDevContract="""";
	var vPlanPart="""",vPlanContractPart="""",vVanityContractPart="""",vAddonPart="""",vAddonName="""";
	var boOrder="""", bcLineItem="""", vExistPlanName="""", vExistPlanPart="""";
	var iPs, oPs, vSearchExp="""";
	var oApp = TheApplication();
	try
	{
		vMenaPrdBO = oApp.GetBusObject(""STC MENA Product BO"");
		vMenaPrdBC = vMenaPrdBO.GetBusComp(""STC MENA Product Data BC"");
		vOrderId = Inputs.GetProperty(""OrderId"");
		vMSISDN = Inputs.GetProperty(""MSISDN"");
		iPs = oApp.NewPropertySet();
		oPs = oApp.NewPropertySet();
		
		boOrder = oApp.GetBusObject(""Order Entry (Sales)"");
		bcLineItem = boOrder.GetBusComp(""MACD Order Entry - Line Items"");
		with(bcLineItem) 	//REV01
		{
			ActivateField(""Product Part Number"");
			ActivateField(""Product"");
			ClearToQuery();
			SetViewMode(AllView);
			vSearchExp = ""[Order Header Id]='""+vOrderId+""' AND [STC Plan Type] = 'Service Plan' AND [Action Code] <> 'Add'"";
			SetSearchExpr(vSearchExp);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
			{
				vExistPlanPart = GetFieldValue(""Product Part Number"");
				vExistPlanName = GetFieldValue(""Product"");
			}
		}
		with(vMenaPrdBC)// service plan
		{
			vSearchExp="""";
			SetViewMode(AllView);
			ClearToQuery();
			ActivateField(""MSISDN"");
			ActivateField(""Type"");
			ActivateField(""Parent Row Id"");
			ActivateField(""Product Attribute 1"");
			ActivateField(""Product Attribute 2"");
			ActivateField(""Product Attribute 3"");
			ActivateField(""Product Attribute 4"");
			ActivateField(""Product Attribute 7"");
			ActivateField(""Product Attribute 8"");
			ActivateField(""Product Attribute 9"");
			ActivateField(""MENA Service Number"");
			ActivateField(""IMEI"");

			vSearchExp= vSearchExp= ""[Parent Row Id]='""+vOrderId+""' AND [Type]='Parent' AND [MSISDN]='""+vMSISDN+""'"";;
			SetSearchExpr(vSearchExp);
			ExecuteQuery(ForwardOnly);
			if (FirstRecord())
			{
				vPlanPart = GetFieldValue(""Product Attribute 3"");
				vPlanContractPart = GetFieldValue(""Product Attribute 5"");
				vVanityContractPart = GetFieldValue(""Product Attribute 4"");
				
				if(vExistPlanPart != vPlanPart)	//REV01
				{
					iPs.SetProperty(""PartNum"",vPlanPart);
					GetProductName(iPs,oPs);
					vPlanName=oPs.GetProperty(""ProductName"");
					vAddonPart = List_Values(vPlanPart);
					//vAddonPart = oApp.GetLOVFieldExpr(""[Type]='STC_PLAN_LTE_ADD_ON' AND [Name] = '""+vPlanPart+""' AND [Active]='Y'"", ""High"");	//REV02
					if(vAddonPart !="""") // Plan Addon
					{
						iPs.SetProperty(""PartNum"",vAddonPart);
						GetProductName(iPs,oPs);
						vAddonName=oPs.GetProperty(""ProductName"");
					}
				}
			}
			//vProdList=vPlanName;	
			if(vPlanContractPart !="""" && vPlanContractPart !=null)
			{
				iPs.SetProperty(""PartNum"",vPlanContractPart);
				GetProductName(iPs,oPs);
				vPlanContract=oPs.GetProperty(""ProductName"");
				
				//vProdList=vProdList+"",""+vPlanContract;
			}
			if(vVanityContractPart !="""" && vVanityContractPart !=null)
			{
				iPs.SetProperty(""PartNum"",vVanityContractPart);
				GetProductName(iPs,oPs);
				vVanityContract=oPs.GetProperty(""ProductName"");
				
				//vProdList=vProdList+"",""+vVanityContract;
			}
			
			if(vPlanName != """")	//REV01
				vProdList=vPlanName;
			if(vAddonName !="""") // Plan Addon	//REV02 hardik
			{
				if(vProdList == """")
					vProdList = vAddonName;
				else
					vProdList = vProdList+"",""+vAddonName;
			}
			if(vPlanContract != """")
			{
				if(vProdList == """")
					vProdList = vPlanContract;
				else
					vProdList = vProdList+"",""+vPlanContract;
			}
			if(vVanityContract != """")
			{
				if(vProdList == """")
					vProdList = vVanityContract;
				else
					vProdList = vProdList+"",""+vVanityContract;
			}
		}//with service plan

	
		Outputs.SetProperty(""ProdList"", vProdList);
		
	} ///try 
	catch(e)
	{
		Outputs.SetProperty(""ErrorMsg"", e);
		throw(e);
	}
	finally
	{
		iPs=null; oPs=null; vMenaPrdBC=null; vMenaPrdBO=null; bcLineItem=null; boOrder=null; oApp = null;
	}
}
"//Your public declarations go here... 
var sErrCode="""", sErrMsg="""";"
"//Your public declarations go here...
function CommonValidation(sServAccntId,sRootAssetId,sOrderType,currLoginId,bMSISDN)
{
	try
	{
		var boRMSNumberEnquiry:BusObject = TheApplication().GetBusObject(""RMS NM Number Enquiry"");
		var bcRMSNumberEnquiry:BusComp = boRMSNumberEnquiry.GetBusComp(""RMS NM Number Enquiry"");
	//	var bMSISDN = Inputs.GetProperty(""MSISDN"");
		if(bMSISDN != """" && bMSISDN != null && bMSISDN != '')
		{ 
			with (bcRMSNumberEnquiry)
			{				
				ActivateField(""Special Category Type"");
				ActivateField(""Type"");
				ActivateField(""Number String"");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchSpec(""Special Category Type"", ""Bulk Message"");               
				SetSearchSpec(""Number String"", bMSISDN);
				SetSearchSpec(""Type"", ""MSISDN"");
				ExecuteQuery(ForwardOnly);   
				var bRecordExists = FirstRecord();
				if (bRecordExists)
				{
					sErrMsg = ""For virtual MSISDN this is not allowed."";
				}
			}
		}
	
				 		 	
 		//ServAccId = this.BusComp().GetFieldValue(""Service Account Id""); 
		if(sErrMsg == null || sErrMsg == """")
		{
			var sServiceBO:BusObject = TheApplication().GetBusObject(""Service Request"");
			var sServiceBC:BusComp = sServiceBO.GetBusComp(""Service Request"");
			var AppPropSet:PropertySet = TheApplication().NewPropertySet();
			var isRecord="""",SRStatus="""",SRType="""",sAllowSR=""Y"";
			with(sServiceBC)
			{
				ActivateField(""Account Id"");
				ActivateField(""Status"");
				ActivateField(""INS Sub-Area"");
			    ClearToQuery();
				SetViewMode(AllView);
				SetSearchSpec(""Account Id"", sServAccntId);
				ExecuteQuery(ForwardOnly);
			    var sClosed = TheApplication().InvokeMethod(""LookupValue"", ""SR_STATUS"", ""Closed""); 
				if(FirstRecord())
				{
					isRecord = FirstRecord();
					while(isRecord)
					{	
						SRStatus = GetFieldValue(""Status"");
						SRType = GetFieldValue(""INS Sub-Area"");
						if(SRStatus != sClosed && (SRType == ""Change MSISDN"" || SRType == ""Change SIM Card""))
						sAllowSR = ""N"";
						isRecord = NextRecord();
					}//while
				}//if
			}//with	
			if(sAllowSR == ""N"")
			{
				sErrMsg = sErrMsg + ""There is currently an Open SR to change the MSISDN or SIM card. Can't proceed with this request."";
			}
		}	
	

		//Incoporatin SIP Validation Code
		if(sErrMsg == null || sErrMsg == """")
		{
			var oSvcAcctBO:BusObject = TheApplication().GetBusObject(""STC Service Account"");
			var oSvcAccBC: BusComp = oSvcAcctBO.GetBusComp(""CUT Service Sub Accounts"");
			var sServiceAssetBC:BusComp = oSvcAcctBO.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
			with(oSvcAccBC)
			{
				ActivateField(""STC Profile Type"");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchSpec(""Id"",sServAccntId);
				ExecuteQuery(ForwardOnly);
				if(FirstRecord())
				{
					var strProfile = GetFieldValue(""STC Profile Type"");
	
				}
	
			}
			with(sServiceAssetBC)
			{
				ActivateField(""Service Account Id"");
	      		ActivateField(""Product Part Number"");
	      		ClearToQuery();
	      		SetViewMode(AllView);
	      		SetSearchExpr(""[Service Account Id] = '"" + sServAccntId + ""' AND [Product Part Number] LIKE 'VIVAIPTRUNK*'""); //check under SAN
	      		ExecuteQuery(ForwardOnly);	      
	      		if(FirstRecord())
				{
					sErrMsg = ""The request cannot be completed when IP plans are active.""
				}
				if(sErrMsg == null || sErrMsg == """")
				{
					if(sOrderType == ""Suspend"")
					{
						ClearToQuery();
		      			SetViewMode(AllView);
		      			SetSearchExpr(""[Service Account Id] = '"" + sServAccntId + ""' AND [Product Part Number] LIKE 'DATACENTERPACK*'""); //check under SAN
		      			ExecuteQuery(ForwardOnly);	
		      			if(FirstRecord())
		      			{
		     				sErrMsg = ""Suspend is not allowed for DataCenter Package."";
		    			}
		    			ClearToQuery();
		      			SetViewMode(AllView);
		      			ActivateField(""Product Part Number"");
		      			SetSearchExpr(""[Service Account Id] = '"" + sServAccntId + ""' AND [STC Plan Type] = 'Service Plan'""); //check under SAN
		      			ExecuteQuery(ForwardOnly);
		      			if(FirstRecord())
		      			{
		      				var sEPlanPartNum = GetFieldValue(""Product Part Number"");
		      				var sEPlanSuspend = TheApplication().InvokeMethod(""LookupValue"", ""STC_PLAN_SUSP_VAL"", sEPlanPartNum);
		      				var sEPlanSuspendAllow = sEPlanSuspend.substring(0,5);
							if(sErrMsg == null || sErrMsg == """")
							{
			      				if(sEPlanSuspendAllow == ""Allow"")
			      				{
			      					sErrMsg = ""Sorry! Suspend Order is not allowed for this plan."";
			      				}
							}
		      			}  
					}
				}

			}
			
			if(sErrMsg == null || sErrMsg == """")
			{
				ValidateCSR(sServAccntId,currLoginId);
			}
	      		

		}



	}
	catch(e)
	{
		
	}
	finally
	{
		oSvcAccBC = null;
		sServiceAssetBC = null;
		bcRMSNumberEnquiry = null;
		sServiceBC = null;
		sServiceBO = null;
		oSvcAcctBO = null;
		boRMSNumberEnquiry = null;
		AppPropSet = null;

	}

}
"//for Migration Order
function OutstandingBalance(sServAccntId,CurrLogin,sMsisdn)
{
	try
	{
		var appObj = TheApplication();
		var sMsisdn;
		var Input;
		var Output;
		var svcOutPayments;
		var sPlanType;
		var sPBusComp;
		var sOutstanding;
		var sCustomerType;
		var sCompanyOutstanding;
		var sSplitBillFlag;
		
		var oSvcAcctBO:BusObject = TheApplication().GetBusObject(""STC Service Account"");
		var oSvcAccBC: BusComp = oSvcAcctBO.GetBusComp(""CUT Service Sub Accounts"");
		var foundCSR = appObj.InvokeMethod(""LookupValue"",""STC_OUTSTANDING_BYEPASS_USER"",CurrLogin);
		with(oSvcAccBC)
		{
			ActivateField(""Type"");
			ActivateField(""STC Pricing Plan Type"");
			ActivateField(""STC Split Billing Flag"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Id"",sServAccntId);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
			{
				sPlanType = GetFieldValue(""STC Pricing Plan Type"");
				sSplitBillFlag = GetFieldValue(""STC Split Billing Flag"");
				sCustomerType = GetFieldValue(""Type"");
			}

		}
		if(sPlanType == ""Postpaid"")
		{
			Input = appObj.NewPropertySet();
    		Output = appObj.NewPropertySet();
   			svcOutPayments = appObj.GetService(""Workflow Process Manager"");
    		Input.SetProperty(""ProcessName"",""STC OutstandingPayment WF"");
   			Input.SetProperty(""MSISDN"",sMsisdn);
    		svcOutPayments.InvokeMethod(""RunProcess"",Input,Output);
    		sOutstanding = Output.GetProperty(""OutStandingAmt"");
			var NumsOutstanding = ToNumber(sOutstanding);
    		if(sSplitBillFlag == ""Y"")
			{
				Output.Reset();
				Input.SetProperty(""MSISDN"",sMsisdn+'_A');
				svcOutPayments.InvokeMethod(""RunProcess"",Input,Output);
				sCompanyOutstanding = Output.GetProperty(""OutStandingAmt"");
				sOutstanding = ToNumber(sOutstanding) + ToNumber(sCompanyOutstanding);
			}
			if(sOutstanding > 0)
			{
	   			if ((sCustomerType == ""SME"" || sCustomerType == ""Corporate"") && CurrLogin == foundCSR)
	   				{
	   				}
	   			else
		   			{
		    			sErrCode = ""BS-ERR-4""	
						sErrMsg = ""In Order to Proceed further kindly clear Outstanding Dues."";
		   			}
		   	}
		}
 }


	catch(e)
	{

	}

	finally
	{
		oSvcAccBC = null;
		oSvcAcctBO = null;
		Input = null;
		Output = null;


	}
}
function Service_InvokeMethod (MethodName, Inputs, Outputs)
{

}
"/*......................................................................................
NileshD     :13/09/2016
Description : Incorporated functionality behind Suspend, Resume, Modify and Terminate button
			 from Installed Asset applet.
........................................................................................*/
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if (MethodName == ""ValidateBulkOrder"")
	{
		var sBulkRequestId = Inputs.GetProperty(""BulkRequestId"");
		var sOrderType = Inputs.GetProperty(""OrderType"");
		var sServAccntId = Inputs.GetProperty(""ServiceAccountId"");
		var sRootAssetId = Inputs.GetProperty(""RootAssetId"");
		var BillAccId = Inputs.GetProperty(""BillingAccountId"");
		var CurrLogin = Inputs.GetProperty(""LoginName"");
		var MSISDN = Inputs.GetProperty(""MSISDN"");

		CommonValidation (sServAccntId,sRootAssetId,sOrderType,CurrLogin,MSISDN);
		
		if(sErrMsg == null || sErrMsg == """")
		{
			if (sOrderType == ""Resume"")
		 	{
				ValidateResume(sServAccntId,sRootAssetId);
			
			}
			if(sOrderType == ""Disconnect"")
			{
				ValidateDisconnect(sServAccntId,sRootAssetId,BillAccId,CurrLogin);
			
			}
			if(sOrderType == ""Modify"")
			{
				ValidateModify(sServAccntId,sRootAssetId);
			
			}
	
			if(sOrderType == ""Suspend"")
			{
				ValidateSuspend(sServAccntId,sRootAssetId);
			
			}	
		}
		
		var MsgLen = sErrMsg.length;
		var Ind = sErrMsg.indexOf(""-"")+14;
		sErrMsg = sErrMsg.substring(Ind,MsgLen);		

		Outputs.SetProperty(""Error Code"",sErrCode)
		Outputs.SetProperty(""Error Message"",sErrMsg);

		return(CancelOperation);
	}
	return (ContinueOperation);
}
"//***********************************************************************************************************//
//Purpose: 1)To validate whether the current user(CSR) has the rights to modify the order or not 
//Inputs: 
//Outputs: Will give an error message if the CSR is not authorised
/
////*************************************************************************************************************//
function ValidateCSR(ServAccntId,currLoginId)
{

	var appObj;
	var currLoginId;
	var custType;
	var foundCSR, foundCSRSubstr;
	var boSR, bcSR;
	
	try
	{
	
		//currLoginId = null;
		appObj = TheApplication();
	
		//currLoginId = appObj.LoginName();
	
		boSR = appObj.GetBusObject(""STC Service Account"");
		bcSR = boSR.GetBusComp(""CUT Service Sub Accounts"");
		with(bcSR)
		{
			ActivateField(""Id"");
			ActivateField(""Type"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Id"",ServAccntId);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
			{
				custType = GetFieldValue(""Type"");
			}
	
		}
		if(custType == ""Corporate"")
		{
			foundCSR = appObj.InvokeMethod(""LookupValue"",""STC_CORPORATE_CSRS"",currLoginId);
			
			foundCSRSubstr = foundCSR.substring(0,3);
			if(foundCSRSubstr != ""CSR"")
			{
				sErrMsg = ""Sorry! You do not have the privilege to modify the order"";
				//return (CancelOperation);
			}
		}
		
		if(custType == ""SME"")
		{
		    foundCSR = appObj.InvokeMethod(""LookupValue"",""STC_SMB_CSRS"",currLoginId);
		    
		    foundCSRSubstr = foundCSR.substring(0,3);
		    if(foundCSRSubstr != ""SMB"")
		    {
				sErrMsg = ""Sorry! You do not have the privilege to modify the order"";
			//	return (CancelOperation);
		    }
		}
		

		
	
	}
	finally
	{
		foundCSRSubstr = null;
		foundCSR = null;
		bcSR = null;
		boSR = null;
		appObj = null;
		currLoginId = null;
	}
}
"//NileshD:13-Sep-2016

function ValidateDisconnect(sServAccntId,sRootAssetId,BillAccId,CurrLogin)
{
	try
	{

		var oSvcAcctBO:BusObject = TheApplication().GetBusObject(""STC Service Account"");
		var oSvcAccBC: BusComp = oSvcAcctBO.GetBusComp(""CUT Service Sub Accounts"");
		var sServiceAssetBC:BusComp = oSvcAcctBO.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");

		var wfBS = TheApplication().GetService(""Workflow Process Manager"");
		var wfIn:PropertySet = TheApplication().NewPropertySet();
		var wfOut:PropertySet = TheApplication().NewPropertySet();
		wfIn.SetProperty(""ProcessName"",""STC Vanity Termination Check WF"");
		wfIn.SetProperty(""Object Id"",sServAccntId);
		wfBS.InvokeMethod(""RunProcess"",wfIn,wfOut);
		sErrCode = wfOut.GetProperty(""Error Code"");
		sErrMsg = wfOut.GetProperty(""Error Message"");
		
		if(sErrCode == null || sErrCode == """")
		{
			wfIn.SetProperty(""ProcessName"",""STC Employee Plan Validation WF"");
			wfIn.SetProperty(""Object Id"",sServAccntId);
			wfBS.InvokeMethod(""RunProcess"",wfIn,wfOut);
			sErrCode = wfOut.GetProperty(""Error Code"");
			sErrMsg = wfOut.GetProperty(""Error Message"");
		}
		if(sErrCode == null || sErrCode == """")
		{
			wfIn.SetProperty(""ProcessName"",""STC VOBB Termination Validation WF"");
			wfIn.SetProperty(""Object Id"",sServAccntId);
			wfBS.InvokeMethod(""RunProcess"",wfIn,wfOut);
			sErrCode = wfOut.GetProperty(""Error Code"");
			sErrMsg = wfOut.GetProperty(""Error Message"");
		}
		
		with(oSvcAccBC)
		{
			ActivateField(""Id"");
			ActivateField(""STC Profile Type"");
			ActivateField(""STC Port Out Flag"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Id"",sServAccntId);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
			{
				var strProfile = GetFieldValue(""STC Profile Type"");
				var PortOut = GetFieldValue(""STC Port Out Flag"");

			}
		}
		with(sServiceAssetBC)
		{
			ActivateField(""Service Account Id"");
			ActivateField(""Billing Account Id"");
			SetViewMode(AllView);
			var Expr = ""[Service Account Id] = '"" + sServAccntId + ""' AND [Product Part Number] = 'PLANCLUBBB'""
			ClearToQuery();
			SetSearchExpr(Expr);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
	      	{
	 			var sBillingBO = TheApplication().GetBusObject(""STC Billing Account"");
				var sAssetBC = sBillingBO.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
				var sMsisdn = GetFieldValue(""Serial Number"");
	  
		   		with (sAssetBC)
	   			{
	   				ActivateField(""Billing Account Id"");
				   	ActivateField(""Product Part Number"");
				   	ActivateField(""Status"");
			        ClearToQuery();
			        SetViewMode(AllView);
			        SetSearchExpr(""[Billing Account Id] = '"" + BillAccId + ""' AND [Product Part Number] = 'PLANCLUB' AND [Status] = 'Active'"");
			        ExecuteQuery(ForwardOnly);
	     	        if(FirstRecord())
	    			{
						sErrCode = ""BS-ERR2"";
					 	sErrMsg = ""Please disconnect VIVA Voice Plan First"";
	    			}
	    		}//end with
	    	}

		}
	   if(PortOut == ""Y"")
	   {
			var foundCSR = TheApplication().InvokeMethod(""LookupValue"",""STC_MNP_CSR"",CurrLogin); 
			var foundCSRSubstr = foundCSR.substring(0,3);
			if(foundCSRSubstr != ""CSR"")
			{
				sErrCode = ""BS-ERR3"";
				sErrMsg = ""Sorry!!! MNP Port Out Orders can be raised by special CSRs only"";
			}
		
	   }
	   else
	   {
			if(strProfile != ""Datacom"")
		    {
				OutstandingBalance(sServAccntId,CurrLogin,sMsisdn);		    
		    }
		}

		// DVM#1
	/*	TheApplication().SetProfileAttr(""Modify"",""N"");
		TheApplication().SetProfileAttr(""Disconnect"", ""Y"");
		TheApplication().SetProfileAttr(""Suspend"", ""N"");
		TheApplication().SetProfileAttr(""Resume"",""N"");
		
		var svc = TheApplication().GetService(""Data Valiation Manager"");
		var Input:PropertySet = TheApplication().NewPropertySet();
		var Output:PropertySet = TheApplication().NewPropertySet();
		
		Input.SetProperty(""Rule Set Name"", ""STC Modify Order Validation"");
		Input.SetProperty(""BusComp"", ""Asset Mgmt - Asset (Order Mgmt)"");
		Input.SetProperty(""BusObj"", ""STC Service Account"");
		Input.SetProperty(""Object Id"", sRootAssetId);
		Input.SetProperty(""Enable Log"", ""Y"");
		Input.SetProperty(""Object Search Type"", ""Business Object"");
		Input.SetProperty(""Active Object"", ""N"");
		svc.InvokeMethod(""Validate"", Input, Output);
		sErrCode = sErrCode + ""\n"" + Output.GetProperty(""Return Code"");
		sErrMsg = sErrMsg + ""\n"" + Output.GetProperty(""Return Message"");
		TheApplication().SetProfileAttr(""Disconnect"", ""N"");*/
		
	
	
			 


	}
	catch(e)
	{

	}
	finally
	{
		oSvcAccBC = null;
		sServiceAssetBC = null;
		oSvcAcctBO = null;
		wfBS= null;
		wfIn = null;
		wfOut = null;




	}
	
	
       	

	     	

		
}
"//Your public declarations go here... 
function ValidateModify(sServAccntId,sRootAssetId)
{
	try
	{
	//InvokeMethod(""SelectAll"");


	// STC Modify Order Validation Action Set 
	
/*		TheApplication().SetProfileAttr(""Disconnect"",""N"");
		TheApplication().SetProfileAttr(""Suspend"", ""N"");
		TheApplication().SetProfileAttr(""Resume"", ""N"");
		TheApplication().SetProfileAttr(""Modify"",""Y"");*/
	
		//DVM# 
		var svc = TheApplication().GetService(""Workflow Process Manager"");
		var Input:PropertySet = TheApplication().NewPropertySet();
		var Output:PropertySet = TheApplication().NewPropertySet();
		
	/*	Input.SetProperty(""Rule Set Name"", ""STC Modify Order Validation"");
		Input.SetProperty(""BusComp"", ""Asset Mgmt - Asset (Order Mgmt)"");
		Input.SetProperty(""BusObj"", ""STC Service Account"");
		Input.SetProperty(""Object Id"", RootAssetId);
		Input.SetProperty(""Enable Log"", ""Y"");
		Input.SetProperty(""Object Search Type"", ""Business Object"");
		Input.SetProperty(""Active Object"", ""N"");
		svc.InvokeMethod(""Validate"", Input, Output);
		sErrCode = sErrCode + ""\n"" + Output.GetProperty(""Return Code"");
		sErrMsg = sErrMsg + ""\n"" + Output.GetProperty(""Return Message"");

		TheApplication().SetProfileAttr(""Modify"",""N"");*/
		


		//DVM#2
		Input.SetProperty(""ProcessName"",""STC Invoke DVM WF"");
		Input.SetProperty(""RuleSetName"", ""STC Budget Control Validation"");
		Input.SetProperty(""BusinessComponent"", ""Asset Mgmt - Asset (Order Mgmt)"");
		Input.SetProperty(""BusinessObject"", ""STC Service Account"");
		Input.SetProperty(""Object Id"", sRootAssetId);
	//	Input.SetProperty(""Enable Log"", ""Y"");
		Input.SetProperty(""ObjectSearchType"", ""Business Object"");
		Input.SetProperty(""ActiveObject"", ""N"");
		svc.InvokeMethod(""RunProcess"", Input, Output);
		sErrCode = sOutput.GetProperty(""Error Code"");
		sErrMsg = sOutput.GetProperty(""Error Message"");
		
		//DVM#3
		if(sErrCode == null || sErrCode == """")
		{
			Input.SetProperty(""ProcessName"",""STC Invoke DVM WF"");
			Input.SetProperty(""RuleSetName"", ""STC DID Order Validation"");
			Input.SetProperty(""BusinessComponent"", ""Asset Mgmt - Asset (Order Mgmt)"");
			Input.SetProperty(""BusinessObject"", ""STC Service Account"");
			Input.SetProperty(""Object Id"", sRootAssetId);
		//	Input.SetProperty(""Enable Log"", ""Y"");
			Input.SetProperty(""ObjectSearchType"", ""Business Object"");
			Input.SetProperty(""ActiveObject"", ""N"");
			svc.InvokeMethod(""RunProcess"", Input, Output);
			sErrCode = sOutput.GetProperty(""Error Code"");
			sErrMsg = sOutput.GetProperty(""Error Message"");	
		}

		//DVM# 4

		if(sErrCode == null || sErrCode == """")
		{
			Input.SetProperty(""ProcessName"",""STC Invoke DVM WF"");
			Input.SetProperty(""RuleSetName"", ""STC CPR Expiry Date Check"");
			Input.SetProperty(""BusinessComponent"", ""CUT Service Sub Accounts"");
			Input.SetProperty(""BusinessObject"", ""STC Service Account"");
			Input.SetProperty(""Object Id"", sServAccntId);
		//	Input.SetProperty(""Enable Log"", ""Y"");
			Input.SetProperty(""ObjectSearchType"", ""Business Object"");
			Input.SetProperty(""ActiveObject"", ""N"");
			svc.InvokeMethod(""RunProcess"", Input, Output);
			sErrCode = sOutput.GetProperty(""Error Code"");
			sErrMsg = sOutput.GetProperty(""Error Message"");	
		}
	

	}
	catch(e)
	{

	}
	finally
	{
		svc = null;
		Input = null;
		Output = null;


	}
	


}
"// TANAY
function ValidateResume (sServAccntId,sRootAssetId)
{
	try
	{
		//var sOrderType = Inputs.Getproperty(""OrderType"");
	//	var sServAccntId = Inputs.GetProperty(""ServiceAccountId"");
//		var sRootAssetId = Inputs.GetProperty(""RootAssetId"");
		var sBS:Service = TheApplication().GetService(""Workflow Process Manager"");
		var sInput:PropertySet = TheApplication().NewPropertySet();
		var sOutput:PropertySet = TheApplication().NewPropertySet();
		
		
		// from Applet ""SIS OM Products & Services Root List Applet (Service)"" - WebApplet_PreInvokeMethod

		//var StrSerId = this.BusComp().GetFieldValue(""Service Account Id"");
		var StrAssetBC:BusComp = TheApplication().GetBusObject(""STC Asset Mgmt - Asset Thin BO"").GetBusComp(""STC Asset Mgmt - Asset Thin"");
		var RETPLANPART = TheApplication().InvokeMethod(""LookupValue"",""STC_TERMINATION_ADMIN"",""RETENTIONPLANPART""); 
		with(StrAssetBC)
		{
			var Exp = ""[Service Account Id] = '"" + sServAccntId + ""' AND [Part] LIKE '"" + RETPLANPART + ""*' AND [Status] = 'Suspended'"";
			ActivateField(""Part"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchExpr(Exp);
			ExecuteQuery(ForwardOnly);
			var AssetRec = FirstRecord();
			if(AssetRec)
			{
				var PlanPart = GetFieldValue(""Part"");
				if(PlanPart == RETPLANPART)
				{
					var CurrRETLogin = TheApplication().LoginName();
					var foundRETCSR = TheApplication().InvokeMethod(""LookupValue"",""STC_RESUME_CSR"",CurrRETLogin); 
					var foundRETCSRSubstr = foundRETCSR.substring(0,6);
					if(foundRETCSRSubstr != ""RESRET"")
					{
						sErrCode = ""BS-ERR1"";
						sErrMsg = ""You are not allowed to resume this Order. Please contact Administrator"";
					}
				}
			}
		}

		// DVM # 1
		sInput.SetProperty(""ProcessName"",""STC Invoke DVM WF"");
		sInput.SetProperty(""RuleSetName"", ""STC HTM Order Validation"");
		sInput.SetProperty(""BusinessComponent"", ""CUT Service Sub Accounts"");
		sInput.SetProperty(""BusinessObject"", ""STC Service Account"");
		sInput.SetProperty(""Object Id"", sServAccntId);
	//	sInput.SetProperty(""Enable Log"", ""Y"");
		sInput.SetProperty(""ObjectSearchType"", ""Business Object"");
		sInput.SetProperty(""ActiveObject"", ""N"");
		sBS.InvokeMethod(""RunProcess"", sInput, sOutput);
		sErrCode = sOutput.GetProperty(""Error Code"");
		sErrMsg = sOutput.GetProperty(""Error Message"");
		
		// DVM # 2
		if(sErrCode == null || sErrCode == """")
		{
			sInput.SetProperty(""ProcessName"",""STC Invoke DVM WF"");
			sInput.SetProperty(""RuleSetName"", ""CPR Check"");
			sInput.SetProperty(""BusinessComponent"", ""CUT Service Sub Accounts"");
			sInput.SetProperty(""BusinessObject"", ""STC Service Account"");
			sInput.SetProperty(""Object Id"", sServAccntId);
			//sInput.SetProperty(""Enable Log"", ""Y"");
			sInput.SetProperty(""ObjectSearchType"", ""Business Object"");
			sInput.SetProperty(""ActiveObject"", ""N"");
			sBS.InvokeMethod(""RunProcess"", sInput, sOutput);
			sErrCode = sOutput.GetProperty(""Error Code"");
			sErrMsg = sOutput.GetProperty(""Error Message"");
		}


		if(sErrCode == null || sErrCode == """")
		{
			sInput.SetProperty(""ProcessName"",""STC Invoke DVM WF"");
			sInput.SetProperty(""RuleSetName"", ""STC Budget Control Validation"");
			sInput.SetProperty(""BusinessComponent"", ""Asset Mgmt - Asset (Order Mgmt)"");
			sInput.SetProperty(""BusinessObject"", ""STC Service Account"");
			sInput.SetProperty(""Object Id"", sRootAssetId);
		//	sInput.SetProperty(""Enable Log"", ""Y"");
			sInput.SetProperty(""ObjectSearchType"", ""Business Object"");
			sInput.SetProperty(""ActiveObject"", ""N"");
			sBS.InvokeMethod(""RunProcess"", sInput, sOutput);
			sErrCode = sOutput.GetProperty(""Error Code"");
			sErrMsg = sOutput.GetProperty(""Error Message"");
		}

	/*	if(sErrCode == null || sErrCode == """")
		{
			TheApplication().SetProfileAttr(""Modify"",""N"");
			TheApplication().SetProfileAttr(""Disconnect"",""N"");
			TheApplication().SetProfileAttr(""Suspend"", ""N"");
			TheApplication().SetProfileAttr(""Resume"", ""Y"");

			// DVM#3
			sInput.SetProperty(""Rule Set Name"", ""STC Modify Order Validation"");
			sInput.SetProperty(""BusComp"", ""Asset Mgmt - Asset (Order Mgmt)"");
			sInput.SetProperty(""BusObj"", ""STC Service Account"");
			sInput.SetProperty(""Object Id"", sRootAssetId);
			sInput.SetProperty(""Enable Log"", ""Y"");
			sInput.SetProperty(""Object Search Type"", ""Business Object"");
			sInput.SetProperty(""Active Object"", ""N"");
			sBS.InvokeMethod(""Validate"", sInput, sOutput);
			sErrCode = sErrCode + ""\n"" + sOutput.GetProperty(""Return Code"");
			sErrMsg = sErrMsg + ""\n"" + sOutput.GetProperty(""Return Message"");

			TheApplication().SetProfileAttr(""Resume"", ""N"");
		}*/


		//Outputs.SetProperty (""ErrCode"", sErrCode);
		//Outputs.SetProperty (""ErrMessage"", sErrMsg);
		 
		//return(CancelOperation);
	}
	catch (e)
	{
		
	}
	finally
	{
		sBS= null;
		sInput = null;
		sOutput = null;
		StrAssetBC = null;


	}
		

}
"//Your public declarations go here... 

function ValidateSuspend(sServAccntId,sRootAssetId)
{
	try
	{
	
		/*TheApplication().SetProfileAttr(""Modify"",""N"");
		TheApplication().SetProfileAttr(""Disconnect"", ""N"");
		TheApplication().SetProfileAttr(""Resume"", ""N"");
		TheApplication().SetProfileAttr(""Suspend"",""Y"");*/
	
		
		//DVM #1
		var svc:Service = TheApplication().GetService(""Workflow Process Manager"");
		var Input:PropertySet = TheApplication().NewPropertySet();
		var Output:PropertySet = TheApplication().NewPropertySet();
		
	/*	Input.SetProperty(""Rule Set Name"", ""STC Modify Order Validation"");
		Input.SetProperty(""BusComp"", ""Asset Mgmt - Asset (Order Mgmt)"");
		Input.SetProperty(""BusObj"", ""STC Billing Account"");
		Input.SetProperty(""Object Id"", RootAssetId);
		Input.SetProperty(""Enable Log"", ""Y"");
		Input.SetProperty(""Object Search Type"", ""Business Object"");
		Input.SetProperty(""Active Object"", ""N"");
		svc.InvokeMethod(""Validate"", Input, Output);
		sErrCode = sErrCode + ""\n"" + Output.GetProperty(""Return Code"");
		sErrMsg = sErrMsg + ""\n"" + Output.GetProperty(""Return Message"");
		TheApplication().SetProfileAttr(""Suspend"",""N"");*/
	
		//DVM #2
		Input.SetProperty(""ProcessName"",""STC Invoke DVM WF"");
		Input.SetProperty(""RuleSetName"", ""STC Split Suspension Check Validation"");
		Input.SetProperty(""BusinessComponent"", ""CUT Service Sub Accounts"");
		Input.SetProperty(""BusinessObject"", ""STC Service Account"");
		Input.SetProperty(""Object Id"", sServAccntId);
	//	Input.SetProperty(""Enable Log"", ""Y"");
		Input.SetProperty(""ObjectSearchType"", ""Business Object"");
		Input.SetProperty(""ActiveObject"", ""N"");
		svc.InvokeMethod(""RunProcess"", Input, Output);
		sErrCode = Output.GetProperty(""Error Code"");
		sErrMsg = Output.GetProperty(""Error Message"");
		
	
		//DVN#3
	
		if(sErrCode == null || sErrCode == """")
		{
			Input.SetProperty(""ProcessName"",""STC Invoke DVM WF"");
			Input.SetProperty(""RuleSetName"", ""STC Budget Control Validation"");
			Input.SetProperty(""BusinessComponent"", ""Asset Mgmt - Asset (Order Mgmt)"");
			Input.SetProperty(""BusinessObject"", ""STC Service Account"");
			Input.SetProperty(""Object Id"", sRootAssetId);
		//	Input.SetProperty(""Enable Log"", ""Y"");
			Input.SetProperty(""ObjectSearchType"", ""Business Object"");
			Input.SetProperty(""ActiveObject"", ""N"");
			svc.InvokeMethod(""RunProcess"", Input, Output);
			sErrCode = Output.GetProperty(""Error Code"");
			sErrMsg = Output.GetProperty(""Error Message"");;
		}
	
		if(sErrCode == null || sErrCode == """")
		{
			Input.SetProperty(""ProcessName"",""STC CorpGPRS Dummy APN Validation"");
			Input.SetProperty(""Object Id"",sServAccntId);
			svc.InvokeMethod(""RunProcess"",Input,Output);
			sErrCode = wfOut.GetProperty(""Error Code"");
			sErrMsg = wfOut.GetProperty(""Error Message"");
		}
		if(sErrCode == null || sErrCode == """")
		{
			Input.SetProperty(""ProcessName"",""STC VOBB Termination Validation WF"");
			Input.SetProperty(""Object Id"",sServAccntId);
			svc.InvokeMethod(""RunProcess"",Input,Output);
			sErrCode = wfOut.GetProperty(""Error Code"");
			sErrMsg = wfOut.GetProperty(""Error Message"");
		}


	}
	catch(e)
	{

	}
	finally
	{
		svc = null;
		Input = null;
		Output = null;

	}
	



}
function GetAmount(Inputs,Outputs)
{
  var ServAccntId="""";
  var AssetServiceType ="""";
  var AssetPartNumber = """";
  var sPlanPartNum="""";
  var ParAssetIntId="""";
  var sAddDevicePart="""";
  var AssetServiceDesc=""""; 
  var sMainDevicePart="""";
  var appObj;
  var boAsset="""";
  var bcAsset="""";   
  try
  {
   appObj = TheApplication();
    boAsset = appObj.GetBusObject(""STC Asset Mgmt - Asset Thin BO"");
    bcAsset = boAsset.GetBusComp(""STC Asset Mgmt - Asset Thin"");
   with(Inputs)
   {
    ServAccntId = GetProperty(""ServAccntId"");
   	AssetServiceType = GetProperty(""AssetServiceType"");
   	AssetPartNumber = GetProperty(""AssetPartNumber"");
   	ParAssetIntId = GetProperty(""ParAssetIntId"");
    AssetServiceDesc = GetProperty(""AssetServiceDesc"");
   }
	var svc = appObj.GetService(""Workflow Process Manager"");
	var Input1 = appObj.NewPropertySet();
	var Output1 = appObj.NewPropertySet();
	Input1.SetProperty(""ProcessName"", ""STC ICT Contract Amount WF"");
	Input1.SetProperty(""Object Id"", ServAccntId);
	svc.InvokeMethod(""RunProcess"", Input1, Output1);
	var ICTAmount = Output1.GetProperty(""Amount"");
	Outputs.SetProperty(""ICTAmount"", ICTAmount);
 }

 finally
 {
  appObj = null;
 }
}
function GetPartNum(Inputs,Outputs)
{
  var ServAccntId="""";
  var AssetServiceType ="""";
  var AssetPartNumber = """";
  var sPlanPartNum="""";
  var ParAssetIntId="""";
  var sAddDevicePart="""";
  var AssetServiceDesc=""""; 
  var sMainDevicePart="""";
  var appObj;
  var boAsset="""";
  var bcAsset="""";   
  try
  {
   appObj = TheApplication();
    boAsset = appObj.GetBusObject(""STC Asset Mgmt - Asset Thin BO"");
    bcAsset = boAsset.GetBusComp(""STC Asset Mgmt - Asset Thin"");
   with(Inputs)
   {
    ServAccntId = GetProperty(""ServAccntId"");
   	AssetServiceType = GetProperty(""AssetServiceType"");
   	AssetPartNumber = GetProperty(""AssetPartNumber"");
   	ParAssetIntId = GetProperty(""ParAssetIntId"");
    AssetServiceDesc = GetProperty(""AssetServiceDesc"");
   }
	with(bcAsset)
	{
		if(AssetServiceType == ""MainContract"") //If Main Contract is present Get the Plan Name
		{
		ActivateField(""Service Account Id"");
		ActivateField(""STC Plan Type"");
		ActivateField(""Part"");
		ClearToQuery();
	   	/*SetSearchSpec(""STC Plan Type"", ""Service Plan"");
	   	SetSearchSpec(""Service Account Id"", ServAccntId);
	   	SetSearchSpec(""Status"", ""Active"");
	   	ExecuteQuery(ForwardOnly);*/
	   	SetSearchExpr(""[Service Account Id] = '"" + ServAccntId + ""' AND [STC Plan Type] = 'Service Plan' AND ([Status] <> 'Inactive')"");
		ExecuteQuery(ForwardOnly);
	   	if(FirstRecord())
		   	{
		   	sPlanPartNum = GetFieldValue(""Part"");
		   	Outputs.SetProperty(""PartNumber"", sPlanPartNum);
		   	}
		   	else
		   	{
		   	Outputs.SetProperty(""PartNumber"", AssetPartNumber);
		   	}
		}
		if(AssetServiceType == ""AddonContract"") //if AddonContract is there check for Device
		{
		ActivateField(""Service Account Id"");// Query Parent of Contract for BB
		ActivateField(""Parent Asset Id"");
		ActivateField(""Part"");
		ClearToQuery();
	   	//SetSearchSpec(""Service Account Id"", ServAccntId);
	   	//SetSearchSpec(""Id"", ParAssetIntId);
	   	//SetSearchSpec(""Status"", ""Active"");
	   	SetSearchExpr(""[Service Account Id] = '"" + ServAccntId + ""' AND [Id] = '"" + ParAssetIntId + ""' AND ([Status] <> 'Inactive')"");
	   	ExecuteQuery(ForwardOnly);
	   	if(FirstRecord())// if AddonDevice Present
		   	{
		   	sAddDevicePart = GetFieldValue(""Part"");
		   	Outputs.SetProperty(""PartNumber"", sAddDevicePart);
		   	}
		   	else//if No AddonDevice Present
		   	{
		   	Outputs.SetProperty(""PartNumber"", AssetPartNumber);
		   	}
		}
		if(AssetServiceDesc == ""MainContract"")// if MainDeviceContract Present Get the Device
		{
		ActivateField(""Service Account Id"");
		ActivateField(""STC Service Description"");
		ActivateField(""Part"");
		ClearToQuery();
	   	//SetSearchSpec(""Id"", ParAssetIntId);
	   	//SetSearchSpec(""Service Account Id"", ServAccntId);
	   	//SetSearchSpec(""Status"", ""Active"");
	   	SetSearchExpr(""[Service Account Id] = '"" + ServAccntId + ""' AND [Id] = '"" + ParAssetIntId + ""' AND ([Status] <> 'Inactive')"");
	   	ExecuteQuery(ForwardOnly);
	   	if(FirstRecord())
		   	{
		   	sMainDevicePart = GetFieldValue(""Part"");
		   	Outputs.SetProperty(""PartNumber"", sMainDevicePart);
		   	}
		   	{
		   	Outputs.SetProperty(""PartNumber"", AssetPartNumber);
		   	}
	}
		}
 }
 catch(e)
 {
  LogException(e);
 }
 finally
 {
  bcAsset = null;
  boAsset = null;
  appObj = null;
 }
}
function GetRefreshPlanProvProds(Inputs,Outputs)
{
  var ServAccntId="""", ServPlanPart ="""", ProdPartNum="""", ProdPartNumList="""";
  var searchExpr="""", assetCount=0, isRec=false, i=0;
  var sPlanPartNum="""";
  var ContractActive=""N"";
  var ParAssetIntId="""", sAddDevicePart="""", AssetServiceDesc="""", sMainDevicePart="""";
  //var appObj;
  var boAsset=null, bcAsset=null;   
  try
  {
	//appObj = TheApplication();
	boAsset = TheApplication().GetBusObject(""STC Asset Mgmt - Asset Thin BO"");
	bcAsset = boAsset.GetBusComp(""STC Asset Mgmt - Asset Thin"");
	with(Inputs)
	{
		ServAccntId = GetProperty(""ServAccntId"");
		//ServPlanPart = GetProperty(""ServicePlanPart"");
		//ProdPartNum = GetProperty(""ProductPartNum"");
		//ParAssetIntId = GetProperty(""ParAssetIntId"");
		//AssetServiceDesc = GetProperty(""AssetServiceDesc"");
	}
	with(Outputs)
	{
		SetProperty(""ProdPartNumList"", ProdPartNumList);
		SetProperty(""RecordCount"", assetCount);
	}
	with(bcAsset)
	{
			ActivateField(""Service Account Id"");
			ActivateField(""STC Plan Type"");
			ActivateField(""Part"");
			ActivateField(""STCContractActiveFlag"");
			ClearToQuery();
			searchExpr = ""[Service Account Id]='""+ServAccntId+""' AND ([Part] LIKE 'VIPCDBBREV*') AND ([Status] <> 'Inactive')"";
			SetSearchExpr(searchExpr);
			ExecuteQuery(ForwardOnly);
			var isConRec = FirstRecord();
			if(isConRec)
			{
				ContractActive = GetFieldValue(""STCContractActiveFlag"");
			}

	}
	if(ContractActive == ""Y"")
	{
		with(bcAsset)
		{
			ActivateField(""Service Account Id"");
			ActivateField(""STC Plan Type"");
			ActivateField(""Part"");
			ActivateField(""Service Type"");
			ClearToQuery();
			searchExpr = ""[Service Account Id]='""+ServAccntId+""' AND ([Service Type]='LTERefreshData' OR [Service Type]='LTERefreshDataAddOn') AND ([Status] <> 'Inactive')"";
			SetSearchExpr(searchExpr);
			ExecuteQuery(ForwardOnly);
			assetCount = CountRecords();
			isRec = FirstRecord();
			for (i=0; i < assetCount; i++)
			{
				sPlanPartNum = GetFieldValue(""Part"");
				if (i == 0)
					ProdPartNumList = sPlanPartNum;
				else
					ProdPartNumList = ProdPartNumList+"",""+sPlanPartNum;
				isRec = NextRecord();
			}
			with(Outputs)
			{
				SetProperty(""ProdPartNumList"", ProdPartNumList);
				SetProperty(""RecordCount"", assetCount);
			}
		}
	}//if(ContractExpiry != ""Y"")
 }
 catch(e)
 {
	LogException(e);
 }
 finally
 {
	bcAsset = null;
	boAsset = null;
	//appObj = null;
 }
}
function GetSplitPart(Inputs,Outputs)
{
  var ServAccntId="""";
  var AssetServiceType ="""";
  var AssetPartNumber = """";
  var sPlanPartNum="""";
  var ParAssetIntId="""";
  var sAddDevicePart="""";
  var AssetServiceDesc=""""; 
  var sMainDevicePart="""";
  var appObj;
  var boAsset="""";
  var bcAsset=""""; 
  var SplitServiceAccount="""";  
  try
  {
   appObj = TheApplication();
    var boSAN = appObj.GetBusObject(""STC Service Account"");
    var bcSAN = boSAN.GetBusComp(""CUT Service Sub Accounts"");
   with(Inputs)
   {
    ServAccntId = GetProperty(""ServAccntId"");
   	AssetServiceType = GetProperty(""AssetServiceType"");
   	AssetPartNumber = GetProperty(""AssetPartNumber"");
   	ParAssetIntId = GetProperty(""ParAssetIntId"");
    AssetServiceDesc = GetProperty(""AssetServiceDesc"");
   }
   with(bcSAN)
   {
   SetViewMode(AllView);
   ClearToQuery();
  //ActivateField(""Service Account Id"");
	ActivateField(""STC Split Account Id"");
	
   	SetSearchSpec(""Id"", ServAccntId);
	   	/*SetSearchSpec(""Service Account Id"", ServAccntId);
	   	SetSearchSpec(""Status"", ""Active"");
	   	ExecuteQuery(ForwardOnly);*/
	   	//SetSearchExpr(""[Id] = '"" + ServAccntId + ""'"");
	ExecuteQuery(ForwardOnly);
	//var Record = FirstRecord();
	   	if(FirstRecord())
		 	{
		   	SplitServiceAccount = GetFieldValue(""STC Split Account Id"");
			}
	}
	boAsset = appObj.GetBusObject(""STC Asset Mgmt - Asset Thin BO"");
    bcAsset = boAsset.GetBusComp(""STC Asset Mgmt - Asset Thin"");
    with(bcAsset)
    {
    ActivateField(""Service Account Id"");
		ActivateField(""STC Plan Type"");
		ActivateField(""Part"");
		ClearToQuery();
	   	/*SetSearchSpec(""STC Plan Type"", ""Service Plan"");
	   	SetSearchSpec(""Service Account Id"", ServAccntId);
	   	SetSearchSpec(""Status"", ""Active"");
	   	ExecuteQuery(ForwardOnly);*/
	   	SetSearchExpr(""[Service Account Id] = '"" + SplitServiceAccount + ""' AND [STC Plan Type] = 'Service Plan' AND ([Status] <> 'Inactive')"");
		ExecuteQuery(ForwardOnly);
	   	if(FirstRecord())
		   	{
		   	sPlanPartNum = GetFieldValue(""Part"");
		   	Outputs.SetProperty(""SplitPartNumber"", sPlanPartNum);
		   	}
		   	else
		   	{
		   	Outputs.SetProperty(""SplitPartNumber"", AssetPartNumber);
		   	}
    	}
 }
 catch(e)
 {
  LogException(e);
 }
 finally
 {
  appObj = null;
 }
}
function LogException(e)
{
 var appObj;
   var psInput;
   var psOutput;
   var bsErrorHandler; 
 try
  {
    appObj = TheApplication();
    with(appObj)
    {
     psInput = NewPropertySet();
     psOutput = NewPropertySet();
     bsErrorHandler = GetService(""STC Generic Error Handler"");
    }
    with(psInput)
    {
     SetProperty(""Error Code"", e.errCode);
     SetProperty(""Error Message"", e.errText);
     SetProperty(""Object Name"", ""STC Contract Name Modification BS"");
     SetProperty(""Object Type"", ""Buisness Service"");
    }
    bsErrorHandler.InvokeMethod(""Log Message"", psInput, psOutput);
  }
  catch(e)
  {
    // do nothing 
  }
  finally
  {
 
    bsErrorHandler = null;
    psOutput = null;
    psInput = null;
    appObj = null;
  }
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
try
 {
 if(MethodName == ""GetPartNum"")
 	{
		GetPartNum(Inputs,Outputs);
		return (CancelOperation);
	}
	if(MethodName == ""GetAmount"")
 	{
		GetAmount(Inputs,Outputs);
		return (CancelOperation);
	}
	if(MethodName == ""GetSplitPartNum"")
 	{
		GetSplitPart(Inputs,Outputs);
		return (CancelOperation);
	}
	if(MethodName == ""GetRefreshPlanProvProds"")
 	{
		GetRefreshPlanProvProds(Inputs,Outputs);
		return (CancelOperation);
	}
	  return (ContinueOperation);
 }
 catch(e)
 {
  LogException(e);
 }
 finally
 {
 }
}
function Init(Inputs, Outputs)
{
//Mayank : Created as a dummy method for Applet Display
	try
	{
	//Start:Initializing VBC Fields
		Outputs.SetProperty(""STC Bulk Amount"","""");
		Outputs.SetProperty(""STC Bulk Transaction Date"","""");
		Outputs.SetProperty(""STC Bulk Transaction Id"","""");

		Outputs.SetProperty(""STC Bulk Transaction Type"","""");
		Outputs.SetProperty(""STC MSISDN"","""");
		Outputs.SetProperty(""STC Status"","""");
		Outputs.SetProperty(""STC Transaction Amount"","""");
		Outputs.SetProperty(""STC Transaction Id"","""");
		Outputs.SetProperty(""STC Sub Channel"","""");
		Outputs.SetProperty(""STC Channel"","""");
	//End:Initializing VBC Fields
		return (CancelOperation);
	
	}
catch(e)
	{
	LogException(e);
	}
	finally
	{
	}
}
function LogException(e)
{
	var appObj;
  	var Input;
  	var Output;
  	var CallMessageHandler; 
	try
 	{
		  appObj = TheApplication();
		  Input = appObj.NewPropertySet();
		  Output = appObj.NewPropertySet();
		  CallMessageHandler = appObj.GetService(""STC Generic Error Handler""); 
		  Input.SetProperty(""Error Code"", e.errCode);
		  Input.SetProperty(""Error Message"", e.errText);
		  Input.SetProperty(""Object Name"", ""STC Bulk Payment Request VBC BS"");
		  Input.SetProperty(""Object Type"", ""Buisness Service"");
		  CallMessageHandler.InvokeMethod(""Log Message"", Input, Output);
 	}
 	catch(e)
 	{
  		
 	}
 	finally
 	{
 
		  CallMessageHandler = null;
		  Output = null;
		  Input = null;
		  appObj = null;
 	}
 	
}
function Query(Inputs, Outputs)
{

}
"/*--------------------------------------------------------------------------------------------
Author  : Mayank Kandpal
Date    : 11-02-2015
Version : 1.0
Desc    : Created this code for functionality behind the button ""Submit""
Inputs  : Bulk Transaction Id
---------------------------------------------------------------------------------------------------*/
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	var ireturn;
	var psInputs;
	var psOutputs;
	
	try
	{
	    switch(MethodName)
		{	
		
			  	case ""Init"": 
					Init(Inputs,Outputs);
					ireturn =CancelOperation;
					break;
					
				case ""Query"": 
					Query(Inputs,Outputs);
					ireturn =CancelOperation;
					break;
					
				case ""PreInsert"":
					ireturn =CancelOperation;
					break;
					
				case ""Insert"":
					ireturn =CancelOperation;
					break;

				case ""Update"":
					ireturn =CancelOperation;
					break;
	
				case ""Delete"":
					ireturn =CancelOperation;
					break;
				
				/*case ""CallAIA"":
					CallAIA(Inputs,Outputs)
					ireturn =CancelOperation;
					break;*/
							
		       	default:
		       	ireturn = ContinueOperation;
				break;
		}//End Switch
			return(ireturn);	
	}//end try
 catch(e)
	{
	LogException(e);
	}
	finally
	{
	}
	return(CancelOperation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""ProductDelete"")
	{
		ProductDelete();
		return(CancelOperation);    
	}
	else
    {    
		return(ContinueOperation);
    }
}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}




function ProductDelete()
{
	var MRowId="""";

	/*	WIPRO-Upgrade-03.05.2016-TSINGHALC - Gets the Filename along with Filepath from LOV Description	*/
	
	var svc = TheApplication().GetService(""STC Get Filename"");
	var Inputs = TheApplication().NewPropertySet();
	var Outputs = TheApplication().NewPropertySet();
	Inputs.SetProperty(""Type"",""STC_FILE_NAME"");
	Inputs.SetProperty(""LIC"",""STC_BULK_PROD_V_DEL"");
	svc.InvokeMethod(""STC Get LOV Desc"", Inputs, Outputs);
	var filepath = Outputs.GetProperty(""Description"");
	
	var file = Clib.fopen(filepath, ""rt"");
	
	/* WIPRO-Upgrade-03.05.2016-TSINGHALC - Commented the below line as the filename is received from the above lines by invoking the Generic BS */

	//var file=Clib.fopen(""/siebelfs/ProductDelete.csv"", ""rt"");

	if (file==null)
	{
		TheApplication().RaiseErrorText(""Error in opening the file"");
    }
	else
    {
		while(!Clib.feof(file))
        {

			MRowId = (Clib.fgets(file));  
			MRowId = trim(MRowId);
			var MInputs = TheApplication().NewPropertySet();
			var MOutputs = TheApplication().NewPropertySet();
			var vBS = TheApplication().GetService(""ISS Authoring Import Export Service"");

			MInputs.SetProperty(""VODObjectNum"",MRowId);    
			MInputs.SetProperty(""RootObjectType"",""ISS_PROD_DEF"");
			vBS.InvokeMethod(""CleanupSingleObject"", MInputs, MOutputs);

        }
    }
	vBS=null;
	MOutputs=null;
	MInputs=null;
	MRowId=null;
	file = null;
	filepath = null;
	Outputs = null;
	Inputs = null;
	svc = null;

}
var sErrorMsg ="";
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if (MethodName == ""SubmitCreditSR"")
	{
		sErrorMsg = """";
	  	SubmitCreditIncreaseSR(Inputs,Outputs);
	  	return (CancelOperation);
	} 
	return (ContinueOperation);
}
function SubmitCreditIncreaseSR(Inputs, Outputs)
{
	var appObj;
	var parentBC=null;
	var custType, billingType, custSegment;
	var desc;
	var callBackTime, callBackFlag;
	var tempOwner=null, owner=null, bcLOV, boLOV;
	var varLIC=null, newCredit=null;
	var searchst;
	var typeLOV = ""STC_CORP_CL_APPROVERS"";
	var test, isRecord=null;
	var parBillingAcctNo;

	var maxCreditFlag = true;
	var creditBO=null, creditBC=null;
	var defaultSegCredit, maxCredit, defaultEmpCredit;
	var newCred, oldCredit;
	var ZERO=0;
	var srBO,srBC,SRId,nNewCreditLimit;
	var invoiceBO=null, testAcctId=null;

	try
	{
	SRId = Inputs.GetProperty(""SRId"");
	nNewCreditLimit = Inputs.GetProperty(""NewCreditLimit"");
	appObj = TheApplication();
	srBO = appObj.GetBusObject(""STC Service Request BO"");
	srBC = srBO.GetBusComp(""STC Service Request thin"");
	with(srBC)
	{	
		ActivateField(""Description"");
		ActivateField(""Call Back"");
		ActivateField(""STC New Preferred Timing"");
		ActivateField(""Account Id"");
		ActivateField(""STC New Credit Limit"");
		ActivateField(""Exchange Rate"");
		
		ClearToQuery();
		SetViewMode(AllView);
		SetSearchSpec(""Id"", SRId);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			testAcctId= GetFieldValue(""Account Id"");
			srBC.SetFieldValue(""STC New Credit Limit"",ToNumber(nNewCreditLimit));

			invoiceBO = appObj.GetBusObject(""STC Billing Account"");
			if(invoiceBO != null)
			{
				parentBC = invoiceBO.GetBusComp(""CUT Invoice Sub Accounts"");
				if(parentBC != null)
				{						
					if(testAcctId != null && testAcctId != """")
					{
						with(parentBC)
						{							
							ActivateField(""Id"");
							ActivateField(""Credit Score"");
							ActivateField(""Parent Account Id"");
							ActivateField(""STC Corporate Type"");
							
							ActivateField(""Type"");
							ActivateField(""STC Corporate Type"");
							ActivateField(""STC Contract Category"");
							ActivateField(""Credit Score"");
										
							ClearToQuery();
							SetViewMode(AllView);
							SetSearchSpec(""Id"", testAcctId);
							ExecuteQuery(ForwardOnly);
							isRecord = FirstRecord();
						}//end of with(parentBC)
					}//end of if(testAcctId != null && ...
				}//end of if(parentBC != null)
			}//end of if(invoiceBO != null)
	
			if(isRecord)
			{
				custType = parentBC.GetFieldValue(""Type"");
				billingType = parentBC.GetFieldValue(""STC Corporate Type"");
				if(custType == ""Corporate"" || custType == ""SME"")
				{
					desc = srBC.GetFieldValue(""Description"");
					if(desc != null && desc != """")
					{
						callBackFlag = srBC.GetFieldValue(""Call Back"");
						callBackTime = srBC.GetFieldValue(""STC New Preferred Timing"");
	
						if(callBackFlag == ""N"" || (callBackTime != null && callBackTime != """"))
						{
							custSegment = parentBC.GetFieldValue(""STC Contract Category"");
							if(custSegment != null && custSegment != """")
							{
								if(custSegment == ""Government"")
								{	varLIC = ""GOVC*"";
								}
								else if(custSegment == ""Large Enterprises"")
								{	varLIC = ""LENC*"";
								}
								else if(custSegment == ""Powered MEs"")
								{	varLIC = ""PMEC*"";
								}
								else if(custSegment == ""Budget SMEs"")
								{	varLIC = ""BSMC*"";
								}
								else
								{	varLIC = ""TEST*"";
								}
							}
				            newCred = 0;
				            oldCredit = 0;
				            newCredit = ToNumber(nNewCreditLimit); //GetFieldValue(""STC New Credit Limit"");
				            oldCredit = ToNumber(parentBC.GetFieldValue(""Credit Score"")); //(GetFieldValue(""Exchange Rate""));
				            srBC.SetFieldValue(""Exchange Rate"",oldCredit);
				            if(newCredit != null || newCredit != """")
			         		{	
			         			newCred = ToNumber(newCredit);
			         			if(newCred < ZERO)
								{
									//appObj.RaiseErrorText(""Desired Credit Limit for Billing Account can not be less than "" +ZERO+ ""!"");
									sErrorMsg = sErrorMsg + ""Desired Credit Limit for Billing Account can not be less than "" +ZERO+ ""!""; 
								}
								else if(newCred == oldCredit)
								{
									//appObj.RaiseErrorText(""Desired Credit Limit can not be same as Current Credit Limit!"");
									sErrorMsg = sErrorMsg + ""Desired Credit Limit can not be same as Current Credit Limit!"";
								}
								var inputArg = appObj.NewPropertySet();
								var outputArg = appObj.NewPropertySet();
								inputArg.SetProperty(""newCredit"", newCredit);
								inputArg.SetProperty(""oldCredit"", oldCredit);
								inputArg.SetProperty(""testAcctId"", testAcctId);
				         		ValidateParentCreditLimit(inputArg,outputArg); 
				         		ValidateChildCreditLimit(inputArg,outputArg);
				         		ValidateMinCreditLimit(newCredit,testAcctId);
				         	}
				         	else
				         	{	//appObj.RaiseErrorText(""Desired Credit Limit can not be blank"");
				         		sErrorMsg = sErrorMsg + ""Desired Credit Limit can not be blank"";
				         	}
							    
							if(custSegment != null && custSegment != """" && (sErrorMsg == """" || sErrorMsg == null))
							{
								defaultSegCredit = 0;
								defaultEmpCredit = 0;
								maxCredit = 0;
								
								if(newCred != null && newCred != """")
								{
									if(billingType == ""Individual"" || billingType == ""Department"")
									{
										maxCreditFlag = false;
										srBC.SetFieldValue(""Status"",appObj.InvokeMethod(""LookupValue"",""SR_STATUS"",""In Progress""));
		           						srBC.SetFieldValue(""Sub-Status"",appObj.InvokeMethod(""LookupValue"",""SR_SUB_STATUS"",""Assigned""));
		           						srBC.WriteRecord();
										////Calling Workflow to update credit limit of current Corporate BAN											
										var creditUpdateService = appObj.GetService(""Workflow Process Manager"");
								        var input = appObj.NewPropertySet();
								        var output = appObj.NewPropertySet();
								        var srId = srBC.GetFieldValue(""Id"");
								        input.SetProperty(""Object Id"", srId);
								        input.SetProperty(""CustType"", custType);
								        input.SetProperty(""ProcessName"", ""STC Credit Limit Change SR WF"");
								        creditUpdateService.InvokeMethod(""RunProcess"", input, output);
										////<<<<<<<< Ends
										srBC.InvokeMethod(""RefreshBusComp"");
										/*var sCurrStatus = srBC.GetFieldValue(""Status"");
										if (sCurrStatus != ""Closed"")
										{
											srBC.SetFieldValue(""Status"",appObj.InvokeMethod(""LookupValue"",""SR_STATUS"",""Closed""));
										}
										var sCurrSubStatus = srBC.GetFieldValue(""Sub-Status"");
										if (sCurrSubStatus != ""Completed"")
										{
											srBC.SetFieldValue(""Sub-Status"",appObj.InvokeMethod(""LookupValue"",""SR_SUB_STATUS"",""Completed""));
		           						}*/
		           						srBC.WriteRecord();									
									}///end of if(billingType == ""Individual"")
									else if(billingType == ""Corporate"")
									{
										if(newCred < defaultSegCredit)
										{
											sErrorMsg = sErrorMsg + ""Desired Credit Limit for Corporate level BAN can not be less than Default Segment Credit Limt of "" +defaultSegCredit+ ""!"";
										}
									}
									else if(billingType == ""SME"")
									{
										if(newCred < defaultSegCredit)
										{
											sErrorMsg = sErrorMsg + ""Desired Credit Limit for SME level BAN can not be less than Default Segment Credit Limt of "" +defaultSegCredit+ ""!"";
										}
									}
									if(newCred < ZERO)
									{
										//appObj.RaiseErrorText(""Desired Credit Limit for Billing Account can not be less than "" +ZERO+ ""!"");
										sErrorMsg = sErrorMsg + ""Desired Credit Limit for Billing Account can not be less than "" +ZERO+ ""!"";
									}
								}//end of 	if(newCredit != null && newCredit != """")
								else
       							{	//appObj.RaiseErrorText(""Desired Credit Limit can not be blank"");
       								sErrorMsg = sErrorMsg + ""Desired Credit Limit can not be blank"";
       							}
							}//end of if(billingType == ""Individual"" && (custSegment != null && custSegment != """"))
						}//end of IF callBack
						else
						{
							sErrorMsg = sErrorMsg + ""Preferred Call Back Timing is a mandatory field!"";
						}//end of Call Back Time else
					} //end of desc IF
					else
					{
						sErrorMsg = sErrorMsg + ""Description is a mandatory field!"";
					}//end of desc else
				}//end of custType IF
			}//end of parentBC IF
			else
			{	
				//appObj.RaiseErrorText(""Parent BC not found!!"");
				sErrorMsg = sErrorMsg + ""Parent BC not found!!"";
			}
			if(sErrorMsg != """")
			{
				var currDesc = srBC.GetFieldValue(""Description"");
				var descText = currDesc + ""************"" + sErrorMsg;
				srBC.SetFieldValue(""Description"", descText);
				srBC.WriteRecord();
			}
/*			else
			{
				var svc = TheApplication().GetService(""Server Requests"")
				var inputBS = TheApplication().NewPropertySet();
				var childBS = TheApplication().NewPropertySet();
				var outputBS = TheApplication().NewPropertySet();
				inputBS.SetProperty(""Component"", ""WfProcMgr"");
				inputBS.SetProperty(""Mode"",""DirectDb"");
				inputBS.SetProperty(""DelUnits"",""Mins"");
				inputBS.SetProperty(""DelAmount"",""5"");
				inputBS.SetProperty(""Method"",""RunProcess"");
				childBS.SetProperty(""ProcessName"", ""STC SME Credit Limit Send SMS WF"");
				childBS.SetProperty(""Object Id"", SRId);
				childBS.SetProperty(""NewCL"", newCred);
				childBS.SetProperty(""OldCL"", oldCredit);
				inputBS.AddChild(childBS);
				svc.InvokeMethod(""SubmitRequest"", inputBS, outputBS); 
			}*/
			Outputs.SetProperty(""errorMsg"",sErrorMsg);
		}//End of SRBC First Rec.
	}//End of with srBC
	}//End of Try
	catch(e)
	{
		throw(e);
	}
	finally
	{
		bcLOV = null;
		boLOV = null;
		parentBC = null;
		appObj = null;
	}
}
function SubmitCreditIncreaseSR(Inputs, Outputs)
{
	// REV02 : Modify: Indrasen : 26102020 : Bulk SR Credit Limit Increase SD : Harsha Design
	var appObj;
	var parentBC=null;
	var custType, billingType, custSegment;
	var desc;
	var callBackTime, callBackFlag;
	var tempOwner=null, owner=null, bcLOV, boLOV;
	var varLIC=null, newCredit=null;
	var searchst;
	var typeLOV = ""STC_CORP_CL_APPROVERS"";
	var test, isRecord=null;
	var parBillingAcctNo;

	var maxCreditFlag = true;
	var creditBO=null, creditBC=null;
	var defaultSegCredit, maxCredit, defaultEmpCredit;
	var newCred, oldCredit;
	var ZERO=0;
	var srBO,srBC,SRId,nNewCreditLimit;
	var invoiceBO=null, testAcctId=null;
	var UserLogin = """", AccTypeCode="""", CreditLimitSwitch = ""FALSE"", CreditLimitSR = ""NO"", CreditLimitSRUsers = ""NO""; // REV02
	appObj = TheApplication();
	try
	{
	SRId = Inputs.GetProperty(""SRId"");
	nNewCreditLimit = Inputs.GetProperty(""NewCreditLimit"");
	UserLogin = Inputs.GetProperty(""UserLogin"");
	if(nNewCreditLimit == """" || nNewCreditLimit == null)// REV02 :
		nNewCreditLimit=0;
	srBO = appObj.GetBusObject(""STC Service Request BO"");
	srBC = srBO.GetBusComp(""STC Service Request thin"");
	with(srBC)
	{	
		ActivateField(""Description"");
		ActivateField(""Call Back"");
		ActivateField(""STC New Preferred Timing"");
		ActivateField(""Account Id"");
		ActivateField(""STC New Credit Limit"");
		ActivateField(""Exchange Rate"");
		
		ClearToQuery();
		SetViewMode(AllView);
		SetSearchSpec(""Id"", SRId);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			testAcctId= GetFieldValue(""Account Id"");
			srBC.SetFieldValue(""STC New Credit Limit"",ToNumber(nNewCreditLimit));

			invoiceBO = appObj.GetBusObject(""STC Billing Account"");
			if(invoiceBO != null)
			{
				parentBC = invoiceBO.GetBusComp(""CUT Invoice Sub Accounts"");
				if(parentBC != null)
				{						
					if(testAcctId != null && testAcctId != """")
					{
						with(parentBC)
						{							
							ActivateField(""Id"");
							ActivateField(""Credit Score"");
							ActivateField(""Parent Account Id"");
							ActivateField(""STC Corporate Type"");
							
							ActivateField(""Type"");
							ActivateField(""STC Corporate Type"");
							ActivateField(""STC Contract Category"");
							ActivateField(""Credit Score"");
							ActivateField(""Account Type Code"");	// REV02			
							ClearToQuery();
							SetViewMode(AllView);
							SetSearchSpec(""Id"", testAcctId);
							ExecuteQuery(ForwardOnly);
							isRecord = FirstRecord();
						}//end of with(parentBC)
					}//end of if(testAcctId != null && ...
				}//end of if(parentBC != null)
			}//end of if(invoiceBO != null)
	
			if(isRecord)
			{
				
				custType = parentBC.GetFieldValue(""Type"");
				billingType = parentBC.GetFieldValue(""STC Corporate Type"");
				
				AccTypeCode = parentBC.GetFieldValue(""Account Type Code"");	// REV02 new
				CreditLimitSwitch = appObj.InvokeMethod(""LookupValue"", ""STC_CREDIT_LIMIT_INCREASE"", ""CREDITLIMIT SWITCH"");
				if(CreditLimitSwitch == ""ALLOW"") // REV02 new
				{
					/*CreditLimitSRUsers = appObj.InvokeMethod(""LookupValue"",""STC_CREDIT_LIMIT_INCREASE"",UserLogin);	// REV02 new
					CreditLimitSRUsers = CreditLimitSRUsers.substring(0, 5);	// REV02 new
					if(CreditLimitSRUsers == ""ALLOW"") // REV02 new
					{
						if(AccTypeCode == ""Billing"" && (billingType == ""Individual"" || (billingType == """" && custType == ""Individual""))) //IBAN check 
							CreditLimitSR = appObj.InvokeMethod(""LookupValue"", ""STC_CREDIT_LIMIT_INCREASE"", ""CREDITLIMIT SWITCH""); // REV02 new
						else
							appObj.RaiseErrorText(""You can process Credit Limit Increase SR for IBAN only. please select valid IBAN and try again."");
					}
					else
						appObj.RaiseErrorText(""You are not authorised USER to Process this SR. Please get your ID added to userlistLOV and try again."");
					*/
					desc = srBC.GetFieldValue(""Description"");
					if(desc != null && desc != """")
					{
						newCred = 0;
						oldCredit = 0;
						newCredit = ToNumber(nNewCreditLimit); //GetFieldValue(""STC New Credit Limit"");
						oldCredit = ToNumber(parentBC.GetFieldValue(""Credit Score"")); //(GetFieldValue(""Exchange Rate""));
						srBC.SetFieldValue(""Exchange Rate"",oldCredit);
						if(newCredit != null || newCredit != """")
						{	
							newCred = ToNumber(newCredit);
							if(newCred < ZERO)
								sErrorMsg = sErrorMsg + ""Desired Credit Limit for Billing Account can not be less than "" +ZERO+ ""!""; 
							else if(newCred == oldCredit)
								sErrorMsg = sErrorMsg + ""Desired Credit Limit can not be same as Current Credit Limit!"";
							else	//function call
								ValidateMinCreditLimit(newCredit,testAcctId);
							if(sErrorMsg == null || sErrorMsg == """")
							{
								srBC.SetFieldValue(""Status"",appObj.InvokeMethod(""LookupValue"",""SR_STATUS"",""In Progress""));
								srBC.SetFieldValue(""Sub-Status"",appObj.InvokeMethod(""LookupValue"",""SR_SUB_STATUS"",""Assigned""));
								srBC.WriteRecord();
								////Calling Workflow to update credit limit of current Corporate BAN											
								var creditUpdateService = appObj.GetService(""Workflow Process Manager"");
								var input = appObj.NewPropertySet();
								var output = appObj.NewPropertySet();
								var srId = srBC.GetFieldValue(""Id"");
								input.SetProperty(""Object Id"", srId);
								input.SetProperty(""CustType"", custType);
								input.SetProperty(""ProcessName"", ""STC Credit Limit Change SR WF"");
								creditUpdateService.InvokeMethod(""RunProcess"", input, output);
								////<<<<<<<< Ends
								srBC.InvokeMethod(""RefreshBusComp"");
							}				
						}
						else
							sErrorMsg = sErrorMsg + ""Desired Credit Limit can not be blank"";
					} //end of desc IF
					else
						sErrorMsg = sErrorMsg + ""Description is a mandatory field!"";
				}	// REV02 new End
				else if(custType == ""Corporate"" || custType == ""SME"")		// REV02  ::: if(custType == ""Corporate"" || custType == ""SME"")
				{
					desc = srBC.GetFieldValue(""Description"");
					if(desc != null && desc != """")
					{
						callBackFlag = srBC.GetFieldValue(""Call Back"");
						callBackTime = srBC.GetFieldValue(""STC New Preferred Timing"");
	
						if(callBackFlag == ""N"" || (callBackTime != null && callBackTime != """"))
						{
							custSegment = parentBC.GetFieldValue(""STC Contract Category"");
							if(custSegment != null && custSegment != """")
							{
								if(custSegment == ""Government"")
								{	varLIC = ""GOVC*"";
								}
								else if(custSegment == ""Large Enterprises"")
								{	varLIC = ""LENC*"";
								}
								else if(custSegment == ""Powered MEs"")
								{	varLIC = ""PMEC*"";
								}
								else if(custSegment == ""Budget SMEs"")
								{	varLIC = ""BSMC*"";
								}
								else
								{	varLIC = ""TEST*"";
								}
							}
				            newCred = 0;
				            oldCredit = 0;
				            newCredit = ToNumber(nNewCreditLimit); //GetFieldValue(""STC New Credit Limit"");
				            oldCredit = ToNumber(parentBC.GetFieldValue(""Credit Score"")); //(GetFieldValue(""Exchange Rate""));
				            srBC.SetFieldValue(""Exchange Rate"",oldCredit);
				            if(newCredit != null || newCredit != """")
			         		{	
			         			newCred = ToNumber(newCredit);
			         			if(newCred < ZERO)
								{
									//appObj.RaiseErrorText(""Desired Credit Limit for Billing Account can not be less than "" +ZERO+ ""!"");
									sErrorMsg = sErrorMsg + ""Desired Credit Limit for Billing Account can not be less than "" +ZERO+ ""!""; 
								}
								else if(newCred == oldCredit)
								{
									//appObj.RaiseErrorText(""Desired Credit Limit can not be same as Current Credit Limit!"");
									sErrorMsg = sErrorMsg + ""Desired Credit Limit can not be same as Current Credit Limit!"";
								}
								var inputArg = appObj.NewPropertySet();
								var outputArg = appObj.NewPropertySet();
								inputArg.SetProperty(""newCredit"", newCredit);
								inputArg.SetProperty(""oldCredit"", oldCredit);
								inputArg.SetProperty(""testAcctId"", testAcctId);
				         		ValidateParentCreditLimit(inputArg,outputArg); 
				         		ValidateChildCreditLimit(inputArg,outputArg);
				         		ValidateMinCreditLimit(newCredit,testAcctId);
				         	}
				         	else
				         	{	//appObj.RaiseErrorText(""Desired Credit Limit can not be blank"");
				         		sErrorMsg = sErrorMsg + ""Desired Credit Limit can not be blank"";
				         	}
							    
							if(custSegment != null && custSegment != """" && (sErrorMsg == """" || sErrorMsg == null))
							{
								defaultSegCredit = 0;
								defaultEmpCredit = 0;
								maxCredit = 0;
								
								if(newCred != null && newCred != """")
								{
									if(billingType == ""Individual"" || billingType == ""Department"")
									{
										maxCreditFlag = false;
										srBC.SetFieldValue(""Status"",appObj.InvokeMethod(""LookupValue"",""SR_STATUS"",""In Progress""));
		           						srBC.SetFieldValue(""Sub-Status"",appObj.InvokeMethod(""LookupValue"",""SR_SUB_STATUS"",""Assigned""));
		           						srBC.WriteRecord();
										////Calling Workflow to update credit limit of current Corporate BAN											
										var creditUpdateService = appObj.GetService(""Workflow Process Manager"");
								        var input = appObj.NewPropertySet();
								        var output = appObj.NewPropertySet();
								        var srId = srBC.GetFieldValue(""Id"");
								        input.SetProperty(""Object Id"", srId);
								        input.SetProperty(""CustType"", custType);
								        input.SetProperty(""ProcessName"", ""STC Credit Limit Change SR WF"");
								        creditUpdateService.InvokeMethod(""RunProcess"", input, output);
										////<<<<<<<< Ends
										srBC.InvokeMethod(""RefreshBusComp"");
										/*var sCurrStatus = srBC.GetFieldValue(""Status"");
										if (sCurrStatus != ""Closed"")
										{
											srBC.SetFieldValue(""Status"",appObj.InvokeMethod(""LookupValue"",""SR_STATUS"",""Closed""));
										}
										var sCurrSubStatus = srBC.GetFieldValue(""Sub-Status"");
										if (sCurrSubStatus != ""Completed"")
										{
											srBC.SetFieldValue(""Sub-Status"",appObj.InvokeMethod(""LookupValue"",""SR_SUB_STATUS"",""Completed""));
		           						}*/
		           						srBC.WriteRecord();									
									}///end of if(billingType == ""Individual"")
									else if(billingType == ""Corporate"")
									{
										if(newCred < defaultSegCredit)
										{
											sErrorMsg = sErrorMsg + ""Desired Credit Limit for Corporate level BAN can not be less than Default Segment Credit Limt of "" +defaultSegCredit+ ""!"";
										}
									}
									else if(billingType == ""SME"")
									{
										if(newCred < defaultSegCredit)
										{
											sErrorMsg = sErrorMsg + ""Desired Credit Limit for SME level BAN can not be less than Default Segment Credit Limt of "" +defaultSegCredit+ ""!"";
										}
									}
									if(newCred < ZERO)
									{
										//appObj.RaiseErrorText(""Desired Credit Limit for Billing Account can not be less than "" +ZERO+ ""!"");
										sErrorMsg = sErrorMsg + ""Desired Credit Limit for Billing Account can not be less than "" +ZERO+ ""!"";
									}
								}//end of 	if(newCredit != null && newCredit != """")
								else
       							{	//appObj.RaiseErrorText(""Desired Credit Limit can not be blank"");
       								sErrorMsg = sErrorMsg + ""Desired Credit Limit can not be blank"";
       							}
							}//end of if(billingType == ""Individual"" && (custSegment != null && custSegment != """"))
						}//end of IF callBack
						else
						{
							sErrorMsg = sErrorMsg + ""Preferred Call Back Timing is a mandatory field!"";
						}//end of Call Back Time else
					} //end of desc IF
					else
					{
						sErrorMsg = sErrorMsg + ""Description is a mandatory field!"";
					}//end of desc else
				}//end of custType IF
			}//end of parentBC IF
			else
			{	
				//appObj.RaiseErrorText(""Parent BC not found!!"");
				sErrorMsg = sErrorMsg + ""Parent BC not found!!"";
			}
			Outputs.SetProperty(""sErrorMsg"", sErrorMsg);
			if(sErrorMsg != """")
			{
				var srBOobj = appObj.GetBusObject(""STC Service Request BO"");	//REV02 new
				var srBCobj = srBOobj.GetBusComp(""STC Service Request thin"");	//REV02
				with(srBCobj)
				{	
					ActivateField(""Description"");
					ClearToQuery();
					SetViewMode(AllView);
					SetSearchSpec(""Id"", SRId);
					ExecuteQuery(ForwardOnly);
					if (FirstRecord())
					{
						var currDesc = srBCobj.GetFieldValue(""Description"");
						var descText = currDesc + ""************"" + sErrorMsg;
						srBCobj.SetFieldValue(""Description"", descText);
						srBCobj.WriteRecord();
					}
				}
				srBCobj=null; srBOobj=null;
			}
/*			else
			{
				var svc = TheApplication().GetService(""Server Requests"")
				var inputBS = TheApplication().NewPropertySet();
				var childBS = TheApplication().NewPropertySet();
				var outputBS = TheApplication().NewPropertySet();
				inputBS.SetProperty(""Component"", ""WfProcMgr"");
				inputBS.SetProperty(""Mode"",""DirectDb"");
				inputBS.SetProperty(""DelUnits"",""Mins"");
				inputBS.SetProperty(""DelAmount"",""5"");
				inputBS.SetProperty(""Method"",""RunProcess"");
				childBS.SetProperty(""ProcessName"", ""STC SME Credit Limit Send SMS WF"");
				childBS.SetProperty(""Object Id"", SRId);
				childBS.SetProperty(""NewCL"", newCred);
				childBS.SetProperty(""OldCL"", oldCredit);
				inputBS.AddChild(childBS);
				svc.InvokeMethod(""SubmitRequest"", inputBS, outputBS); 
			}*/
			Outputs.SetProperty(""errorMsg"",sErrorMsg);
		}//End of SRBC First Rec.
	}//End of with srBC
	}//End of Try
	catch(e)
	{
		Outputs.SetProperty(""Catch e"", e.toString());
		throw(e);
	}
	finally
	{
		bcLOV = null;
		boLOV = null;
		parentBC = null;
		appObj = null;
	}
}
function SubmitCreditIncreaseSR(Inputs, Outputs)
{
	// REV02 : Modify: Indrasen : 26102020 : Bulk SR Credit Limit Increase SD : Harsha Design
	var appObj;
	var parentBC=null;
	var custType, billingType, custSegment;
	var desc;
	var callBackTime, callBackFlag;
	var tempOwner=null, owner=null, bcLOV, boLOV;
	var varLIC=null, newCredit=null;
	var searchst;
	var typeLOV = ""STC_CORP_CL_APPROVERS"";
	var test, isRecord=null;
	var parBillingAcctNo;

	var maxCreditFlag = true;
	var creditBO=null, creditBC=null;
	var defaultSegCredit, maxCredit, defaultEmpCredit;
	var newCred, oldCredit;
	var ZERO=0;
	var srBO,srBC,SRId,nNewCreditLimit;
	var invoiceBO=null, testAcctId=null;
	var UserLogin = """", AccTypeCode="""", CreditLimitSwitch = ""FALSE"", CreditLimitSR = ""NO"", CreditLimitSRUsers = ""NO""; // REV02
	appObj = TheApplication();
	try
	{
	SRId = Inputs.GetProperty(""SRId"");
	nNewCreditLimit = Inputs.GetProperty(""NewCreditLimit"");
	UserLogin = Inputs.GetProperty(""UserLogin"");
	if(nNewCreditLimit == """" || nNewCreditLimit == null)// REV02 :
		nNewCreditLimit=0;
	srBO = appObj.GetBusObject(""STC Service Request BO"");
	srBC = srBO.GetBusComp(""STC Service Request thin"");
	with(srBC)
	{	
		ActivateField(""Description"");
		ActivateField(""Call Back"");
		ActivateField(""STC New Preferred Timing"");
		ActivateField(""Account Id"");
		ActivateField(""STC New Credit Limit"");
		ActivateField(""Exchange Rate"");
		
		ClearToQuery();
		SetViewMode(AllView);
		SetSearchSpec(""Id"", SRId);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			testAcctId= GetFieldValue(""Account Id"");
			srBC.SetFieldValue(""STC New Credit Limit"",ToNumber(nNewCreditLimit));

			invoiceBO = appObj.GetBusObject(""STC Billing Account"");
			if(invoiceBO != null)
			{
				parentBC = invoiceBO.GetBusComp(""CUT Invoice Sub Accounts"");
				if(parentBC != null)
				{						
					if(testAcctId != null && testAcctId != """")
					{
						with(parentBC)
						{							
							ActivateField(""Id"");
							ActivateField(""Credit Score"");
							ActivateField(""Parent Account Id"");
							ActivateField(""STC Corporate Type"");
							
							ActivateField(""Type"");
							ActivateField(""STC Corporate Type"");
							ActivateField(""STC Contract Category"");
							ActivateField(""Credit Score"");
							ActivateField(""Account Type Code"");	// REV02			
							ClearToQuery();
							SetViewMode(AllView);
							SetSearchSpec(""Id"", testAcctId);
							ExecuteQuery(ForwardOnly);
							isRecord = FirstRecord();
						}//end of with(parentBC)
					}//end of if(testAcctId != null && ...
				}//end of if(parentBC != null)
			}//end of if(invoiceBO != null)
	
			if(isRecord)
			{
				
				custType = parentBC.GetFieldValue(""Type"");
				billingType = parentBC.GetFieldValue(""STC Corporate Type"");
				
				AccTypeCode = parentBC.GetFieldValue(""Account Type Code"");	// REV02 new
				CreditLimitSwitch = appObj.InvokeMethod(""LookupValue"", ""STC_CREDIT_LIMIT_INCREASE"", ""CREDITLIMIT SWITCH"");
				if(CreditLimitSwitch == ""ALLOW"") // REV02 new
				{
					/*CreditLimitSRUsers = appObj.InvokeMethod(""LookupValue"",""STC_CREDIT_LIMIT_INCREASE"",UserLogin);	// REV02 new
					CreditLimitSRUsers = CreditLimitSRUsers.substring(0, 5);	// REV02 new
					if(CreditLimitSRUsers == ""ALLOW"") // REV02 new
					{
						if(AccTypeCode == ""Billing"" && (billingType == ""Individual"" || (billingType == """" && custType == ""Individual""))) //IBAN check 
							CreditLimitSR = appObj.InvokeMethod(""LookupValue"", ""STC_CREDIT_LIMIT_INCREASE"", ""CREDITLIMIT SWITCH""); // REV02 new
						else
							appObj.RaiseErrorText(""You can process Credit Limit Increase SR for IBAN only. please select valid IBAN and try again."");
					}
					else
						appObj.RaiseErrorText(""You are not authorised USER to Process this SR. Please get your ID added to userlistLOV and try again."");
					*/
					desc = srBC.GetFieldValue(""Description"");
					if(desc != null && desc != """")
					{
						newCred = 0;
						oldCredit = 0;
						newCredit = ToNumber(nNewCreditLimit); //GetFieldValue(""STC New Credit Limit"");
						oldCredit = ToNumber(parentBC.GetFieldValue(""Credit Score"")); //(GetFieldValue(""Exchange Rate""));
						srBC.SetFieldValue(""Exchange Rate"",oldCredit);
						if(newCredit != null || newCredit != """")
						{	
							newCred = ToNumber(newCredit);
							if(newCred < ZERO)
								sErrorMsg = sErrorMsg + ""Desired Credit Limit for Billing Account can not be less than "" +ZERO+ ""!""; 
							else if(newCred == oldCredit)
								sErrorMsg = sErrorMsg + ""Desired Credit Limit can not be same as Current Credit Limit!"";
							//function call
							ValidateMinCreditLimit(newCredit,testAcctId);
							
							srBC.SetFieldValue(""Status"",appObj.InvokeMethod(""LookupValue"",""SR_STATUS"",""In Progress""));
							srBC.SetFieldValue(""Sub-Status"",appObj.InvokeMethod(""LookupValue"",""SR_SUB_STATUS"",""Assigned""));
							srBC.WriteRecord();
							////Calling Workflow to update credit limit of current Corporate BAN											
							var creditUpdateService = appObj.GetService(""Workflow Process Manager"");
							var input = appObj.NewPropertySet();
							var output = appObj.NewPropertySet();
							var srId = srBC.GetFieldValue(""Id"");
							input.SetProperty(""Object Id"", srId);
							input.SetProperty(""CustType"", custType);
							input.SetProperty(""ProcessName"", ""STC Credit Limit Change SR WF"");
							creditUpdateService.InvokeMethod(""RunProcess"", input, output);
							////<<<<<<<< Ends
							srBC.InvokeMethod(""RefreshBusComp"");				
						}
						else
							sErrorMsg = sErrorMsg + ""Desired Credit Limit can not be blank"";
					} //end of desc IF
					else
						sErrorMsg = sErrorMsg + ""Description is a mandatory field!"";
				}	// REV02 new End
				else if(custType == ""Corporate"" || custType == ""SME"")		// REV02  ::: if(custType == ""Corporate"" || custType == ""SME"")
				{
					desc = srBC.GetFieldValue(""Description"");
					if(desc != null && desc != """")
					{
						callBackFlag = srBC.GetFieldValue(""Call Back"");
						callBackTime = srBC.GetFieldValue(""STC New Preferred Timing"");
	
						if(callBackFlag == ""N"" || (callBackTime != null && callBackTime != """"))
						{
							custSegment = parentBC.GetFieldValue(""STC Contract Category"");
							if(custSegment != null && custSegment != """")
							{
								if(custSegment == ""Government"")
								{	varLIC = ""GOVC*"";
								}
								else if(custSegment == ""Large Enterprises"")
								{	varLIC = ""LENC*"";
								}
								else if(custSegment == ""Powered MEs"")
								{	varLIC = ""PMEC*"";
								}
								else if(custSegment == ""Budget SMEs"")
								{	varLIC = ""BSMC*"";
								}
								else
								{	varLIC = ""TEST*"";
								}
							}
				            newCred = 0;
				            oldCredit = 0;
				            newCredit = ToNumber(nNewCreditLimit); //GetFieldValue(""STC New Credit Limit"");
				            oldCredit = ToNumber(parentBC.GetFieldValue(""Credit Score"")); //(GetFieldValue(""Exchange Rate""));
				            srBC.SetFieldValue(""Exchange Rate"",oldCredit);
				            if(newCredit != null || newCredit != """")
			         		{	
			         			newCred = ToNumber(newCredit);
			         			if(newCred < ZERO)
								{
									//appObj.RaiseErrorText(""Desired Credit Limit for Billing Account can not be less than "" +ZERO+ ""!"");
									sErrorMsg = sErrorMsg + ""Desired Credit Limit for Billing Account can not be less than "" +ZERO+ ""!""; 
								}
								else if(newCred == oldCredit)
								{
									//appObj.RaiseErrorText(""Desired Credit Limit can not be same as Current Credit Limit!"");
									sErrorMsg = sErrorMsg + ""Desired Credit Limit can not be same as Current Credit Limit!"";
								}
								var inputArg = appObj.NewPropertySet();
								var outputArg = appObj.NewPropertySet();
								inputArg.SetProperty(""newCredit"", newCredit);
								inputArg.SetProperty(""oldCredit"", oldCredit);
								inputArg.SetProperty(""testAcctId"", testAcctId);
				         		ValidateParentCreditLimit(inputArg,outputArg); 
				         		ValidateChildCreditLimit(inputArg,outputArg);
				         		ValidateMinCreditLimit(newCredit,testAcctId);
				         	}
				         	else
				         	{	//appObj.RaiseErrorText(""Desired Credit Limit can not be blank"");
				         		sErrorMsg = sErrorMsg + ""Desired Credit Limit can not be blank"";
				         	}
							    
							if(custSegment != null && custSegment != """" && (sErrorMsg == """" || sErrorMsg == null))
							{
								defaultSegCredit = 0;
								defaultEmpCredit = 0;
								maxCredit = 0;
								
								if(newCred != null && newCred != """")
								{
									if(billingType == ""Individual"" || billingType == ""Department"")
									{
										maxCreditFlag = false;
										srBC.SetFieldValue(""Status"",appObj.InvokeMethod(""LookupValue"",""SR_STATUS"",""In Progress""));
		           						srBC.SetFieldValue(""Sub-Status"",appObj.InvokeMethod(""LookupValue"",""SR_SUB_STATUS"",""Assigned""));
		           						srBC.WriteRecord();
										////Calling Workflow to update credit limit of current Corporate BAN											
										var creditUpdateService = appObj.GetService(""Workflow Process Manager"");
								        var input = appObj.NewPropertySet();
								        var output = appObj.NewPropertySet();
								        var srId = srBC.GetFieldValue(""Id"");
								        input.SetProperty(""Object Id"", srId);
								        input.SetProperty(""CustType"", custType);
								        input.SetProperty(""ProcessName"", ""STC Credit Limit Change SR WF"");
								        creditUpdateService.InvokeMethod(""RunProcess"", input, output);
										////<<<<<<<< Ends
										srBC.InvokeMethod(""RefreshBusComp"");
										/*var sCurrStatus = srBC.GetFieldValue(""Status"");
										if (sCurrStatus != ""Closed"")
										{
											srBC.SetFieldValue(""Status"",appObj.InvokeMethod(""LookupValue"",""SR_STATUS"",""Closed""));
										}
										var sCurrSubStatus = srBC.GetFieldValue(""Sub-Status"");
										if (sCurrSubStatus != ""Completed"")
										{
											srBC.SetFieldValue(""Sub-Status"",appObj.InvokeMethod(""LookupValue"",""SR_SUB_STATUS"",""Completed""));
		           						}*/
		           						srBC.WriteRecord();									
									}///end of if(billingType == ""Individual"")
									else if(billingType == ""Corporate"")
									{
										if(newCred < defaultSegCredit)
										{
											sErrorMsg = sErrorMsg + ""Desired Credit Limit for Corporate level BAN can not be less than Default Segment Credit Limt of "" +defaultSegCredit+ ""!"";
										}
									}
									else if(billingType == ""SME"")
									{
										if(newCred < defaultSegCredit)
										{
											sErrorMsg = sErrorMsg + ""Desired Credit Limit for SME level BAN can not be less than Default Segment Credit Limt of "" +defaultSegCredit+ ""!"";
										}
									}
									if(newCred < ZERO)
									{
										//appObj.RaiseErrorText(""Desired Credit Limit for Billing Account can not be less than "" +ZERO+ ""!"");
										sErrorMsg = sErrorMsg + ""Desired Credit Limit for Billing Account can not be less than "" +ZERO+ ""!"";
									}
								}//end of 	if(newCredit != null && newCredit != """")
								else
       							{	//appObj.RaiseErrorText(""Desired Credit Limit can not be blank"");
       								sErrorMsg = sErrorMsg + ""Desired Credit Limit can not be blank"";
       							}
							}//end of if(billingType == ""Individual"" && (custSegment != null && custSegment != """"))
						}//end of IF callBack
						else
						{
							sErrorMsg = sErrorMsg + ""Preferred Call Back Timing is a mandatory field!"";
						}//end of Call Back Time else
					} //end of desc IF
					else
					{
						sErrorMsg = sErrorMsg + ""Description is a mandatory field!"";
					}//end of desc else
				}//end of custType IF
			}//end of parentBC IF
			else
			{	
				//appObj.RaiseErrorText(""Parent BC not found!!"");
				sErrorMsg = sErrorMsg + ""Parent BC not found!!"";
			}
			if(sErrorMsg != """")
			{
				var srBOobj = appObj.GetBusObject(""STC Service Request BO"");	//REV02 new
				var srBCobj = srBOobj.GetBusComp(""STC Service Request thin"");	//REV02
				with(srBCobj)
				{	
					ActivateField(""Description"");
					ClearToQuery();
					SetViewMode(AllView);
					SetSearchSpec(""Id"", SRId);
					ExecuteQuery(ForwardOnly);
					if (FirstRecord())
					{
						var currDesc = srBCobj.GetFieldValue(""Description"");
						var descText = currDesc + ""************"" + sErrorMsg;
						srBCobj.SetFieldValue(""Description"", descText);
						srBCobj.WriteRecord();
					}
				}
				srBCobj=null; srBOobj=null;
			}
/*			else
			{
				var svc = TheApplication().GetService(""Server Requests"")
				var inputBS = TheApplication().NewPropertySet();
				var childBS = TheApplication().NewPropertySet();
				var outputBS = TheApplication().NewPropertySet();
				inputBS.SetProperty(""Component"", ""WfProcMgr"");
				inputBS.SetProperty(""Mode"",""DirectDb"");
				inputBS.SetProperty(""DelUnits"",""Mins"");
				inputBS.SetProperty(""DelAmount"",""5"");
				inputBS.SetProperty(""Method"",""RunProcess"");
				childBS.SetProperty(""ProcessName"", ""STC SME Credit Limit Send SMS WF"");
				childBS.SetProperty(""Object Id"", SRId);
				childBS.SetProperty(""NewCL"", newCred);
				childBS.SetProperty(""OldCL"", oldCredit);
				inputBS.AddChild(childBS);
				svc.InvokeMethod(""SubmitRequest"", inputBS, outputBS); 
			}*/
			Outputs.SetProperty(""errorMsg"",sErrorMsg);
		}//End of SRBC First Rec.
	}//End of with srBC
	}//End of Try
	catch(e)
	{
		throw(e);
	}
	finally
	{
		bcLOV = null;
		boLOV = null;
		parentBC = null;
		appObj = null;
	}
}
function ValidateChildCreditLimit(inputArg,outputArg)
{
	var appObj;
	var custType;
	var parentBC=null, parentAcctType, parAcctId;
	var billType;
	var totalChildCredit;
	var isRecord=null;
	var tempCredit, currentCredit;
	var zero;
	var parBO=null, parBC=null;
	var oldCredit, newCredit;
	var sAccountId;
	var testAcctId=null;
	 
	try
	{
		oldCredit=0; 
		newCredit=0;
		zero=0;
		tempCredit=0;
		currentCredit=0;
		totalChildCredit=0;
		
		appObj = TheApplication();
		
		newCredit = inputArg.GetProperty(""newCredit"");
		oldCredit = inputArg.GetProperty(""oldCredit"");
		sAccountId = inputArg.GetProperty(""testAcctId"");
			
		parBO = appObj.GetBusObject(""STC Billing Account"");
		if(parBO != null)
		{
			parentBC = parBO.GetBusComp(""CUT Invoice Sub Accounts"");
			if(parentBC != null)
			{					
				testAcctId= sAccountId;
				if(testAcctId != null && testAcctId != """")
				{
					with(parentBC)
					{							
						ActivateField(""Id"");
						ActivateField(""Credit Score"");
						ActivateField(""Parent Account Id"");
						ActivateField(""STC Corporate Type"");
						ActivateField(""Type"");
						ActivateField(""Account Type Code"");
						ActivateField(""Id"");
									
						ClearToQuery();
						SetViewMode(AllView);
						SetSearchSpec(""Id"", testAcctId);
						ExecuteQuery(ForwardOnly);

						isRecord = FirstRecord();
					}//end of with(parentBC)
				}//end of if(testAcctId != null && ...
			}//end of if(parentBC != null)
		}//end of if(invoiceBO != null)

		if(isRecord)
		{
			with(parentBC)
			{	
				custType = GetFieldValue(""Type"");
				parentAcctType = GetFieldValue(""Account Type Code"");

				if((custType == ""Corporate"" ||  custType == ""SME"") && parentAcctType == ""Billing"") //outer IF
				{
					billType = GetFieldValue(""STC Corporate Type"");
					currentCredit = GetFieldValue(""Credit Score"");
					parAcctId = GetFieldValue(""Parent Account Id"");

					newCredit = ToNumber(newCredit);
					oldCredit = ToNumber(oldCredit);
					if(oldCredit == null || oldCredit == """")
					{	
						oldCredit=0;
					}

					if((billType == ""Department"" || billType == ""Corporate"") && parAcctId != null) //inner IF
					{
						if(parBO != null)
						{
							parBC = parBO.GetBusComp(""CUT Invoice Sub Accounts"");
							if(parBC != null)
							{
								with(parBC)
								{
									//-->>>Find the sum of credit limit of all Child Billing Accounts
									SetViewMode(AllView);
									ClearToQuery();
			
									SetSearchSpec(""Parent Account Id"", testAcctId);
									ExecuteQuery(ForwardOnly);
									isRecord = FirstRecord();
								
									while(isRecord)
									{
										tempCredit = GetFieldValue(""Credit Score"");
								 		if((tempCredit != """") && (tempCredit != null))
										{
											totalChildCredit = totalChildCredit + ToNumber(tempCredit);
										}
										isRecord = NextRecord();
									}			
									
									if(newCredit == null || newCredit == """")
									{
										newCredit=0;
									}
							
									if(newCredit < totalChildCredit)
									{
										sErrorMsg = sErrorMsg + ""Desired Credit Limit can not be less than the Sum of Credit Limit all Child Billing Accounts i.e.: ""+totalChildCredit+""!"";
									}
								}
							}
						}
					}//end of inner if			
				}//end of outer if
			}//End of with(parentBC)
		}//end of if(parentBC != null)
		else
		{
			sErrorMsg = sErrorMsg + ""Parent BC not found!!"";
		}
		
	}//end of try block
	catch(e)
	{
		throw(e);
	}
	finally
	{
		parentBC = null;
		parBC=null;
		parBO=null;
		appObj = null;
	}
}//end of function"
function ValidateMinCreditLimit(NewCL,BANId)
{
	var recCount,iRec,sumMRC,sCalcMRC;
	try
 	{
		var AppObj = TheApplication();
		var vBANId = BANId;
		var vCL = NewCL;
		var billAccountBO = AppObj.GetBusObject(""STC Billing Account"");
		var assetBC = billAccountBO.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
		
		sumMRC= 0;
		
		with (assetBC)
		{
			ActivateField(""Billing Account Id"");
			ActivateField(""Status"");
			ActivateField(""Parent Asset Id"");
			ActivateField(""STC Plan Segregation"");
			ActivateField(""STC App AddOn"");
			ActivateField(""Adjusted List Price"");
			
			ClearToQuery();
			SetViewMode(AllView);

			SetSearchExpr(""[Billing Account Id] = '"" + vBANId + ""' AND ([Status] <> 'Inactive' OR [Status] <> 'Terminated') AND [Parent Asset Id] is null"");
			ExecuteQuery(ForwardOnly);
			recCount = CountRecords();
			
			ClearToQuery();
			SetViewMode(AllView);
			
			SetSearchExpr(""[Billing Account Id] = '"" + vBANId + ""' AND ([Status] <> 'Inactive' OR [Status] <> 'Terminated') AND ([STC Plan Segregation] IS NOT NULL OR [STC App AddOn] IS NOT NULL)"");
			ExecuteQuery(ForwardOnly);
			iRec = FirstRecord();
			while(iRec)
			{
				var iMRC = GetFieldValue(""Adjusted List Price"");
				if (iMRC == """" || iMRC == null)
					iMRC = 0;
				
				sumMRC = sumMRC + ToNumber(iMRC);
				
				iRec = NextRecord();
			}
			
			sCalcMRC = sumMRC + ( recCount * 10);
			
			if(sCalcMRC > vCL)
			{
				sErrorMsg = sErrorMsg + ""Requested credit limit value is less than minimum threshold allowed for the Account"";
			}
		}//end with
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
		assetBC = null;
		billAccountBO = null;
		AppObj = null;
	}
}
function ValidateParentCreditLimit(inputArg,outputArg)
{
	var appObj;
	var custType;
	//var childCount=0;
	var parentBC=null, parentAcctType, parAcctId;
	var billType;
	var parCreditLimit, totalChildCredit;
	//var parentAcctId;
	var isRecord=null;
	var tempCredit, currentCredit;
	var zero;
	var parBO=null, parBC=null;
	var oldCredit, newCredit;
	
	var testAcctId=null;
	var oldTotal; 
	var sAccountId;	
	var PaymentDepositBucket, totalPaymentDepositBucket;
	
	try
	{
		PaymentDepositBucket = 0;
		totalPaymentDepositBucket =0;
		oldCredit=0; 
		newCredit=0;
		zero=0;
		tempCredit=0;
		currentCredit=0;
		parCreditLimit=0;
		totalChildCredit=0;
		oldTotal=0;
		
		appObj = TheApplication();
		
		newCredit = inputArg.GetProperty(""newCredit"");
		oldCredit = inputArg.GetProperty(""oldCredit"");
		sAccountId = inputArg.GetProperty(""testAcctId"");
		
		parBO = appObj.GetBusObject(""STC Billing Account"");
		if(parBO != null)
		{
			parentBC = parBO.GetBusComp(""CUT Invoice Sub Accounts"");
			if(parentBC != null)
			{	
						
				testAcctId= sAccountId;
				if(testAcctId != null && testAcctId != """")
				{
					with(parentBC)
					{							
						ActivateField(""Id"");
						ActivateField(""Credit Score"");
						ActivateField(""Parent Account Id"");
						ActivateField(""STC Corporate Type"");
						ActivateField(""STC Credit Score - Deposit"");
						ActivateField(""Type"");
						ActivateField(""Account Type Code"");
						ActivateField(""Id"");
									
						ClearToQuery();
						SetViewMode(AllView);
						SetSearchSpec(""Id"", testAcctId);
						ExecuteQuery(ForwardOnly);
	
						isRecord = FirstRecord();
					}//end of with(parentBC)
				}//end of if(testAcctId != null && ...
			}//end of if(parentBC != null)
		}//end of if(invoiceBO != null)

		if(isRecord)
		{
			with(parentBC)
			{	
				custType = GetFieldValue(""Type"");
				parentAcctType = GetFieldValue(""Account Type Code"");

				if((custType == ""Corporate"" ||  custType == ""SME"") && parentAcctType == ""Billing"") //outer IF
				{
					billType = GetFieldValue(""STC Corporate Type"");
					currentCredit = GetFieldValue(""Credit Score"");
					parAcctId = GetFieldValue(""Parent Account Id"");				
			
					newCredit = ToNumber(newCredit);
					oldCredit = ToNumber(oldCredit);
					if(oldCredit == null || oldCredit == """")
					{	
						oldCredit=0;	
					}

					if((billType == ""Department"" || billType == ""Individual"") && parAcctId != null) //inner IF
					{
						if(parBO != null)
						{
							parBC = parBO.GetBusComp(""CUT Invoice Sub Accounts"");
							if(parBC != null)
							{
								with(parBC)
								{
									SetViewMode(AllView);
									ClearToQuery();
							
									SetSearchSpec(""Parent Account Id"", parAcctId);
									ExecuteQuery(ForwardOnly);
									isRecord = FirstRecord();
									
									while(isRecord)
									{
										tempCredit = GetFieldValue(""Credit Score"");
										PaymentDepositBucket = GetFieldValue(""STC Credit Score - Deposit"");
								 		if((tempCredit != """") && (tempCredit != null))
										{
											totalChildCredit = totalChildCredit + ToNumber(tempCredit);
											totalPaymentDepositBucket = totalPaymentDepositBucket + ToNumber(PaymentDepositBucket);
										}
										isRecord = NextRecord();
									}
									
									oldTotal = totalChildCredit;
									if(custType == ""SME"")
									{
										oldTotal = oldTotal - totalPaymentDepositBucket;
										totalChildCredit = ToNumber(totalChildCredit) + ToNumber(newCredit);
										totalChildCredit = ToNumber(totalChildCredit) - ToNumber(currentCredit);
										totalChildCredit = totalChildCredit - totalPaymentDepositBucket;
									}
									else
									{
										totalChildCredit = ToNumber(totalChildCredit) + ToNumber(newCredit);
										totalChildCredit = ToNumber(totalChildCredit) - ToNumber(currentCredit);
									}
								
									//Find the credit limit of the Parent Biling Account
									SetViewMode(AllView);
									ClearToQuery();
						
									ActivateField(""Id"");
							
									SetSearchSpec(""Id"", parAcctId);
									ExecuteQuery(ForwardOnly);
									
									if(FirstRecord())
									{
										parCreditLimit = ToNumber(GetFieldValue(""Credit Score""));
									}
									
									if(parCreditLimit == null || parCreditLimit == """")
									{	parCreditLimit=0;	
									}
					
									if(totalChildCredit > parCreditLimit)
									{
										sErrorMsg = sErrorMsg + ""Insufficient Parent BAN Credit Limit, Balance Credit limit is:(""+(parCreditLimit - oldTotal)+""), Please Increase the Parent Credit Limit First!!"";
									}
								}
							}
						}
					}//end of inner if			
				}//end of outer if
			}//End of with(parentBC)
		}//end of if(parentBC != null)
		else
		{
			//appObj.RaiseErrorText(""Parent BC not found!!"")
			sErrorMsg = sErrorMsg + ""Parent BC not found!!"";
		}
	}//end of try block
	catch(e)
	{
		throw(e);
	}
	finally
	{
		parentBC = null;
		parBC=null;
		parBO=null;
		appObj = null;
	}
}//end of function"
"//Your public declarations go here...  
"
function CreateBulkCollection(DataPS, i)
{
	var svcUI = null, psIn1 = null, psOut1 = null, psInAct=null;
try
{
	var RecCount = 0, AccntNum="""", MSISDN="""", SrchExpr="""", HeaderDesc="""";
	var BulkReqBO = TheApplication().GetBusObject(""STC Collection Details"");	
	var BulkHeaderBC = BulkReqBO.GetBusComp(""STC Collection Details"");
	

    var vHeaderReqType = TheApplication().GetProfileAttr(""BulkHeaderType"");
    TheApplication().SetProfileAttr(""BulkHeaderType"", """");
    

		with(BulkHeaderBC)
			{
				if (i > 0)
				{
					while(RecCount < i)
					{
						ClearToQuery();
						psInAct = DataPS.GetChild(RecCount);
						ActivateMultipleFields(psInAct);
						NewRecord(NewAfter);
						SetMultipleFieldValues(psInAct);
						WriteRecord();
						RecCount++;
					}//end of while(RecCount > 0)
		
					BulkHeaderBC.WriteRecord();
					
					svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
					psIn1 = TheApplication().NewPropertySet();
					psOut1 = TheApplication().NewPropertySet();
					psIn1.SetProperty(""Refresh All"", ""Y"");
					svcUI.InvokeMethod(""RefreshCurrentApplet"", psIn1, psOut1);
				}//end of if (i > 0)
			}//end of with(BulkLineBC)


}
catch(e)
{
	throw(e.toString);
}
finally
{
	svcUI = null, psIn1 = null, psOut1 = null; psInAct=null;
	 BulkHeaderBC=null, BulkReqBO=null;
}
return (CancelOperation);
}
function CreateBulkSRItems(DataPS, i)
{
	var svcUI = null, psIn1 = null, psOut1 = null, psInAct=null;
try
{
	var RecCount = 0, AccntNum="""", MSISDN="""", SrchExpr="""", HeaderDesc="""";
	var BulkReqBO = TheApplication().GetBusObject(""STC Bulk Revamp SR"");	
	var BulkHeaderBC = BulkReqBO.GetBusComp(""STC Bulk SR Header BC"");
	var BulkLineBC = BulkReqBO.GetBusComp(""STC Bulk SR"");

	var vHeaderReqID = TheApplication().GetProfileAttr(""BulkHeaderId"");
    var vHeaderReqNum = TheApplication().GetProfileAttr(""BulkHeaderNumber"");
    var vHeaderReqType = TheApplication().GetProfileAttr(""BulkHeaderType"");
    TheApplication().SetProfileAttr(""BulkHeaderId"", """");
    TheApplication().SetProfileAttr(""BulkHeaderNumber"", """");
    TheApplication().SetProfileAttr(""BulkHeaderType"", """");
    
//	var vPendingStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_BULK_REQ_HEADER_STATUS"",""Pending"");
//	var vImportedStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_BULK_REQ_HEADER_STATUS"",""Imported"");
	
	with(BulkHeaderBC)
	{
		ClearToQuery();
		ActivateField(""Status"");
		ActivateField(""Sub-Status"");
		ActivateField(""Request Id"");
		ActivateField(""Description"");
		SetSearchSpec(""Request Id"",vHeaderReqID);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			HeaderDesc = GetFieldValue(""Description"");
			with(BulkLineBC)
			{
				if (i > 0)
				{
					while(RecCount < i)
					{
						ClearToQuery();
						psInAct = DataPS.GetChild(RecCount);
						with(psInAct)
						{
							SetProperty(""STC Bulk Header Id"", vHeaderReqID);
							AccntNum = GetProperty(""Account Number"");
							MSISDN = GetProperty(""MSISDN"");
						}
						ActivateMultipleFields(psInAct);

					/* --- for now we do always create new record in bulk SR Revamp---
						if(MSISDN != """")
							SrchExpr = ""[MSISDN]='""+MSISDN+""' AND [STC Bulk Header Id]='""+vHeaderReqID+""'"";
						else if(AccntNum != """")
							SrchExpr = ""[Account Number]='""+AccntNum+""' AND [STC Bulk Header Id]='""+vHeaderReqID+""'"";
						if(SrchExpr != """")
							SetSearchExpr(SrchExpr);
						ExecuteQuery(ForwardBackward);
						if(!(FirstRecord()))
						{
							NewRecord(NewAfter);
							//RecCount--;
							SetMultipleFieldValues(psInAct);
							WriteRecord();
						}
					*/
						NewRecord(NewAfter);
						SetMultipleFieldValues(psInAct);
						WriteRecord();

						RecCount++;
					}//end of while(RecCount > 0)
		
					BulkHeaderBC.SetFieldValue(""Description"", HeaderDesc+""| No.of Records = ""+RecCount+"" are Imported"");
					BulkHeaderBC.WriteRecord();
					
					svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
					psIn1 = TheApplication().NewPropertySet();
					psOut1 = TheApplication().NewPropertySet();
					psIn1.SetProperty(""Refresh All"", ""Y"");
					svcUI.InvokeMethod(""RefreshCurrentApplet"", psIn1, psOut1);
				}//end of if (i > 0)
			}//end of with(BulkLineBC)
		}//end of if (FirstRecord())
	}//end of with(BulkHeaderBC)
}
catch(e)
{
	throw(e);
}
finally
{
	svcUI = null, psIn1 = null, psOut1 = null; psInAct=null;
	BulkLineBC=null, BulkHeaderBC=null, BulkReqBO=null;
}
return (CancelOperation);
}  
"
function CreateLineItems(vAccountNum,vAction,vExtDays,i)
{
/*[17Aug2015][NAVINR][SD: Extended Dunning Bulk Request]*/
var svcUI = null, psIn1 = null, psOut1 = null;

try{
	var RecCount = 0;
	var BulkReqBO = TheApplication().GetBusObject(""STC Bulk Request BO"");	
	var BulkHeaderBC = BulkReqBO.GetBusComp(""STC Bulk Request Header BC"");
	var BulkLineBC = BulkReqBO.GetBusComp(""STC Bulk Request Line Item BC"");
	var vHeaderReqID = TheApplication().GetProfileAttr(""BulkHeaderId"");
    var vHeaderReqNum = TheApplication().GetProfileAttr(""BulkHeaderNumber"");
    var vHeaderReqType = TheApplication().GetProfileAttr(""BulkHeaderType"");
    TheApplication().SetProfileAttr(""BulkHeaderId"", """");
    TheApplication().SetProfileAttr(""BulkHeaderNumber"", """");
    TheApplication().SetProfileAttr(""BulkHeaderType"", """");
    
	var vPendingStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_BULK_REQ_HEADER_STATUS"",""Pending"");
	var vImportedStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_BULK_REQ_HEADER_STATUS"",""Imported"");
	
	with(BulkHeaderBC)
	{
		ClearToQuery();
		ActivateField(""Status"");
		ActivateField(""Sub Status"");
		ActivateField(""Request Id"");
		SetSearchSpec(""Request Id"",vHeaderReqID);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			with(BulkLineBC)
			{
				if (i > 0)
				{
					while(RecCount < i)
					{
						ClearToQuery();
						ActivateField(""Parent Id"");
						ActivateField(""Attribute Name"");
						ActivateField(""Attribute Type"");
						ActivateField(""Action"");
						ActivateField(""Attribute 3"");
						//ActivateField(""Created Date"");
						ActivateField(""MSISDN"");
						ActivateField(""Status"");
						ActivateField(""Sub Status"");	
						SetSearchSpec(""Parent Id"", vHeaderReqID);
						SetSearchSpec(""Attribute Name"", vAccountNum[RecCount]);
						ExecuteQuery(ForwardBackward);
						
						if(FirstRecord())
						{}
						else
						{
							NewRecord(NewAfter);
							//RecCount--;
							SetFieldValue(""Parent Id"", vHeaderReqID);
							SetFieldValue(""Attribute Type"", vHeaderReqType);		
							SetFieldValue(""Attribute Name"", vAccountNum[RecCount]);
							SetFieldValue(""Action"", vAction[RecCount]);
							SetFieldValue(""Attribute 3"", vExtDays[RecCount]);
							//SetFieldValue(""Created Date"",new Date());
							SetFieldValue(""MSISDN"", """");
							SetFieldValue(""Status"", vPendingStatus);
							SetFieldValue(""Sub Status"", vImportedStatus);
							WriteRecord();
						}
						RecCount++;
					}//end of while(RecCount > 0)
		
					BulkHeaderBC.SetFieldValue(""Sub Status"", vImportedStatus);
					BulkHeaderBC.WriteRecord();
					
					svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
					psIn1 = TheApplication().NewPropertySet();
					psOut1 = TheApplication().NewPropertySet();
					psIn1.SetProperty(""Refresh All"", ""Y"");
					svcUI.InvokeMethod(""RefreshCurrentApplet"", psIn1, psOut1);
				}//end of if (i > 0)
			}//end of with(BulkLineBC)
		}//end of if (FirstRecord())
	}//end of with(BulkHeaderBC)
}
catch(e)
{throw(e);}
finally{
	svcUI = null, psIn1 = null, psOut1 = null;
	BulkLineBC=null, BulkHeaderBC=null, BulkReqBO=null;
}
return CancelOperation;
}
function CreateLineItems(vAccountNum,vAction,vExtDays,i)
{
/*[17Aug2015][NAVINR][SD: Extended Dunning Bulk Request]*/
var svcUI = null, psIn1 = null, psOut1 = null;

try{
	var RecCount = 0;
	var BulkReqBO = TheApplication().GetBusObject(""STC Bulk Request BO"");	
	var BulkHeaderBC = BulkReqBO.GetBusComp(""STC Bulk Request Header BC"");
	var BulkLineBC = BulkReqBO.GetBusComp(""STC Bulk Request Line Item BC"");
	var vHeaderReqID = TheApplication().GetProfileAttr(""BulkHeaderId"");
    var vHeaderReqNum = TheApplication().GetProfileAttr(""BulkHeaderNumber"");
    var vHeaderReqType = TheApplication().GetProfileAttr(""BulkHeaderType"");
    TheApplication().SetProfileAttr(""BulkHeaderId"", """");
    TheApplication().SetProfileAttr(""BulkHeaderNumber"", """");
    TheApplication().SetProfileAttr(""BulkHeaderType"", """");
    
	var vPendingStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_BULK_REQ_HEADER_STATUS"",""Pending"");
	var vImportedStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_BULK_REQ_HEADER_STATUS"",""Imported"");
	
	with(BulkHeaderBC)
	{
		ClearToQuery();
		ActivateField(""Status"");
		ActivateField(""Sub Status"");
		ActivateField(""Request Id"");
		SetSearchSpec(""Request Id"",vHeaderReqID);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			with(BulkLineBC)
			{
				if (i > 0)
				{
					while(RecCount < i)
					{
						ClearToQuery();
						ActivateField(""Parent Id"");
						ActivateField(""Attribute Name"");
						ActivateField(""Attribute Type"");
						ActivateField(""Action"");
						ActivateField(""Attribute 3"");
						//ActivateField(""Created Date"");
						ActivateField(""MSISDN"");
						ActivateField(""Status"");
						ActivateField(""Sub Status"");	
						SetSearchSpec(""Parent Id"", vHeaderReqID);
						SetSearchSpec(""Attribute Name"", vAccountNum[RecCount]);
						ExecuteQuery(ForwardBackward);
						
						if(FirstRecord())
						{}
						else
						{
							NewRecord(NewAfter);
							//RecCount--;
							SetFieldValue(""Parent Id"", vHeaderReqID);
							SetFieldValue(""Attribute Type"", vHeaderReqType);		
							SetFieldValue(""Attribute Name"", vAccountNum[RecCount]);
							SetFieldValue(""Action"", vAction[RecCount]);
							SetFieldValue(""Attribute 3"", vExtDays[RecCount]);
							//SetFieldValue(""Created Date"",new Date());
							SetFieldValue(""MSISDN"", """");
							SetFieldValue(""Status"", vPendingStatus);
							SetFieldValue(""Sub Status"", vImportedStatus);
							WriteRecord();
						}
						RecCount++;
					}//end of while(RecCount > 0)
		
					BulkHeaderBC.SetFieldValue(""Sub Status"", vImportedStatus);
					BulkHeaderBC.WriteRecord();
					
					svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
					psIn1 = TheApplication().NewPropertySet();
					psOut1 = TheApplication().NewPropertySet();
					psIn1.SetProperty(""Refresh All"", ""Y"");
					svcUI.InvokeMethod(""RefreshCurrentApplet"", psIn1, psOut1);
				}//end of if (i > 0)
			}//end of with(BulkLineBC)
		}//end of if (FirstRecord())
	}//end of with(BulkHeaderBC)
}
catch(e)
{throw(e);}
finally{
	svcUI = null, psIn1 = null, psOut1 = null;
	BulkLineBC=null, BulkHeaderBC=null, BulkReqBO=null;
}
return CancelOperation;
}
function CreateLineItemsBulkTermination(BAN,MSISDN,CustomerName,TerminationReason,Notes,ChildType,ParentMSISDN,i)
{
//[MANUJ]  Added for Bulk Termination.
var svcUI = null, psIn1 = null, psOut1 = null;

try{
	var RecCount = 0;
	var BulkReqBO = TheApplication().GetBusObject(""STC Bulk Request BO"");	
	var BulkHeaderBC = BulkReqBO.GetBusComp(""STC Bulk Request Header BC"");
	var BulkLineBC = BulkReqBO.GetBusComp(""STC Bulk Request Line Item BC"");
	var vHeaderReqID = TheApplication().GetProfileAttr(""BulkHeaderId"");
    var vHeaderReqNum = TheApplication().GetProfileAttr(""BulkHeaderNumber"");
    var vHeaderReqType = TheApplication().GetProfileAttr(""BulkHeaderType"");
    TheApplication().SetProfileAttr(""BulkHeaderId"", """");
    TheApplication().SetProfileAttr(""BulkHeaderNumber"", """");
    TheApplication().SetProfileAttr(""BulkHeaderType"", """");
    
	var vPendingStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_BULK_REQ_HEADER_STATUS"",""Pending"");
	var vImportedStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_BULK_REQ_HEADER_STATUS"",""Imported"");
	
	with(BulkHeaderBC)
	{
		ClearToQuery();
		ActivateField(""Status"");
		ActivateField(""Sub Status"");
		ActivateField(""Request Id"");
		SetSearchSpec(""Request Id"",vHeaderReqID);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			with(BulkLineBC)
			{
				if (i > 0)
				{
					while(RecCount < i)
					{
						ClearToQuery();
						ActivateField(""Parent Id"");
						ActivateField(""Attribute Name"");
						ActivateField(""Attribute Type"");
						ActivateField(""Action"");
						ActivateField(""MSISDN"");
						//ActivateField(""Created Date"");
						ActivateField(""Attribute 7"");
						ActivateField(""Attribute 10"");
						ActivateField(""Attribute 11"");
						ActivateField(""Attribute 21"");
						ActivateField(""Attribute 22"");
						ActivateField(""Status"");
						ActivateField(""Sub Status"");	
						SetSearchSpec(""Parent Id"", vHeaderReqID);
						SetSearchSpec(""MSISDN"", MSISDN[RecCount]);
						ExecuteQuery(ForwardBackward);
						
						if(FirstRecord())
						{}
						else
						{
							NewRecord(NewAfter);
							//RecCount--;
							SetFieldValue(""Parent Id"", vHeaderReqID);
							SetFieldValue(""Attribute Type"", vHeaderReqType);		
							SetFieldValue(""Attribute Name"", BAN[RecCount]);
							SetFieldValue(""MSISDN"", MSISDN[RecCount]);
							SetFieldValue(""Action"", ""Delete"");
							//SetFieldValue(""Created Date"",new Date());
							SetFieldValue(""Attribute 7"", CustomerName[RecCount]);
							SetFieldValue(""Attribute 10"", TerminationReason[RecCount]);
							
							SetFieldValue(""Attribute 21"", ChildType[RecCount]);
							SetFieldValue(""Attribute 22"", ParentMSISDN[RecCount]);

							SetFieldValue(""Attribute 11"", Notes[RecCount]);
							SetFieldValue(""Status"", vPendingStatus);
							SetFieldValue(""Sub Status"", vImportedStatus);
							WriteRecord();
						}
						RecCount++;
					}//end of while(RecCount > 0)
		
					BulkHeaderBC.SetFieldValue(""Sub Status"", vImportedStatus);
					BulkHeaderBC.WriteRecord();
					
					svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
					psIn1 = TheApplication().NewPropertySet();
					psOut1 = TheApplication().NewPropertySet();
					psIn1.SetProperty(""Refresh All"", ""Y"");
					svcUI.InvokeMethod(""RefreshCurrentApplet"", psIn1, psOut1);
				}//end of if (i > 0)
			}//end of with(BulkLineBC)
		}//end of if (FirstRecord())
	}//end of with(BulkHeaderBC)
}
catch(e)
{throw(e);}
finally{
	svcUI = null, psIn1 = null, psOut1 = null;
	BulkLineBC=null, BulkHeaderBC=null, BulkReqBO=null;
}
return CancelOperation;
}
function CreateLineItemsBulkTermination(BAN,MSISDN,CustomerName,TerminationReason,Notes,ChildType,ParentMSISDN,i)
{
//[MANUJ]  Added for Bulk Termination.
var svcUI = null, psIn1 = null, psOut1 = null;

try{
	var RecCount = 0;
	var BulkReqBO = TheApplication().GetBusObject(""STC Bulk Request BO"");	
	var BulkHeaderBC = BulkReqBO.GetBusComp(""STC Bulk Request Header BC"");
	var BulkLineBC = BulkReqBO.GetBusComp(""STC Bulk Request Line Item BC"");
	var vHeaderReqID = TheApplication().GetProfileAttr(""BulkHeaderId"");
    var vHeaderReqNum = TheApplication().GetProfileAttr(""BulkHeaderNumber"");
    var vHeaderReqType = TheApplication().GetProfileAttr(""BulkHeaderType"");
    TheApplication().SetProfileAttr(""BulkHeaderId"", """");
    TheApplication().SetProfileAttr(""BulkHeaderNumber"", """");
    TheApplication().SetProfileAttr(""BulkHeaderType"", """");
    
	var vPendingStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_BULK_REQ_HEADER_STATUS"",""Pending"");
	var vImportedStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_BULK_REQ_HEADER_STATUS"",""Imported"");
	
	with(BulkHeaderBC)
	{
		ClearToQuery();
		ActivateField(""Status"");
		ActivateField(""Sub Status"");
		ActivateField(""Request Id"");
		SetSearchSpec(""Request Id"",vHeaderReqID);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			with(BulkLineBC)
			{
				if (i > 0)
				{
					while(RecCount < i)
					{
						ClearToQuery();
						ActivateField(""Parent Id"");
						ActivateField(""Attribute Name"");
						ActivateField(""Attribute Type"");
						ActivateField(""Action"");
						ActivateField(""MSISDN"");
						//ActivateField(""Created Date"");
						ActivateField(""Attribute 7"");
						ActivateField(""STC Termination Reason"");
						ActivateField(""Attribute 11"");
						ActivateField(""Attribute 21"");
						ActivateField(""Attribute 22"");
						ActivateField(""Status"");
						ActivateField(""Sub Status"");	
						SetSearchSpec(""Parent Id"", vHeaderReqID);
						SetSearchSpec(""MSISDN"", MSISDN[RecCount]);
						ExecuteQuery(ForwardBackward);
						
						if(FirstRecord())
						{}
						else
						{
							NewRecord(NewAfter);
							//RecCount--;
							SetFieldValue(""Parent Id"", vHeaderReqID);
							SetFieldValue(""Attribute Type"", vHeaderReqType);		
							SetFieldValue(""Attribute Name"", BAN[RecCount]);
							SetFieldValue(""MSISDN"", MSISDN[RecCount]);
							SetFieldValue(""Action"", ""Delete"");
							//SetFieldValue(""Created Date"",new Date());
							SetFieldValue(""Attribute 7"", CustomerName[RecCount]);
							SetFieldValue(""STC Termination Reason"", TerminationReason[RecCount]);
							
							SetFieldValue(""Attribute 21"", ChildType[RecCount]);
							SetFieldValue(""Attribute 22"", ParentMSISDN[RecCount]);

							SetFieldValue(""Attribute 11"", Notes[RecCount]);
							SetFieldValue(""Status"", vPendingStatus);
							SetFieldValue(""Sub Status"", vImportedStatus);
							WriteRecord();
						}
						RecCount++;
					}//end of while(RecCount > 0)
		
					BulkHeaderBC.SetFieldValue(""Sub Status"", vImportedStatus);
					BulkHeaderBC.WriteRecord();
					
					svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
					psIn1 = TheApplication().NewPropertySet();
					psOut1 = TheApplication().NewPropertySet();
					psIn1.SetProperty(""Refresh All"", ""Y"");
					svcUI.InvokeMethod(""RefreshCurrentApplet"", psIn1, psOut1);
				}//end of if (i > 0)
			}//end of with(BulkLineBC)
		}//end of if (FirstRecord())
	}//end of with(BulkHeaderBC)
}
catch(e)
{throw(e);}
finally{
	svcUI = null, psIn1 = null, psOut1 = null;
	BulkLineBC=null, BulkHeaderBC=null, BulkReqBO=null;
}
return CancelOperation;
}
function CreateLineItemsCSM(vMSISDN,i)
{//[NAVIN:10Jul2018:CORP_SME_MERGER]

var svcUI = null, psIn1 = null, psOut1 = null;

try{
	var RecCount = 0;
	var BulkReqBO = TheApplication().GetBusObject(""STC Bulk Request BO"");	
	var BulkHeaderBC = BulkReqBO.GetBusComp(""STC Bulk Request Header BC"");
	var BulkLineBC = BulkReqBO.GetBusComp(""STC Bulk Request Line Item BC"");
	var vHeaderReqID = TheApplication().GetProfileAttr(""BulkHeaderId"");
    var vHeaderReqNum = TheApplication().GetProfileAttr(""BulkHeaderNumber"");
    var vHeaderReqType = TheApplication().GetProfileAttr(""BulkHeaderType"");
    TheApplication().SetProfileAttr(""BulkHeaderId"", """");
    TheApplication().SetProfileAttr(""BulkHeaderNumber"", """");
    TheApplication().SetProfileAttr(""BulkHeaderType"", """");
    
	var vPendingStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_BULK_REQ_HEADER_STATUS"",""Pending"");
	var vImportedStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_BULK_REQ_HEADER_STATUS"",""Imported"");
	
	with(BulkHeaderBC)
	{
		ClearToQuery();
		ActivateField(""Status"");
		ActivateField(""Sub Status"");
		ActivateField(""Request Id"");
		SetSearchSpec(""Request Id"",vHeaderReqID);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			with(BulkLineBC)
			{
				if (i > 0)
				{
					while(RecCount < i)
					{
						ClearToQuery();
						ActivateField(""Parent Id"");
						ActivateField(""Attribute Name"");
						ActivateField(""Attribute Type"");
						ActivateField(""Action"");
						ActivateField(""Attribute 3"");
						//ActivateField(""Created Date"");
						ActivateField(""MSISDN"");
						ActivateField(""Status"");
						ActivateField(""Sub Status"");	
						SetSearchSpec(""Parent Id"", vHeaderReqID);
						SetSearchSpec(""MSISDN"", vMSISDN[RecCount]);
						ExecuteQuery(ForwardBackward);
						
						if(FirstRecord())
						{}
						else
						{
							NewRecord(NewAfter);
							//RecCount--;
							SetFieldValue(""Parent Id"", vHeaderReqID);
							SetFieldValue(""Attribute Type"", vHeaderReqType);		
							SetFieldValue(""Attribute Name"", """");
							SetFieldValue(""Action"", ""Modify"");
							//SetFieldValue(""Created Date"",new Date());
							SetFieldValue(""MSISDN"", vMSISDN[RecCount]);
							SetFieldValue(""Status"", vPendingStatus);
							SetFieldValue(""Sub Status"", vImportedStatus);
							WriteRecord();
						}
						RecCount++;
					}//end of while(RecCount > 0)
		
					BulkHeaderBC.SetFieldValue(""Sub Status"", vImportedStatus);
					BulkHeaderBC.WriteRecord();
					
					svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
					psIn1 = TheApplication().NewPropertySet();
					psOut1 = TheApplication().NewPropertySet();
					psIn1.SetProperty(""Refresh All"", ""Y"");
					svcUI.InvokeMethod(""RefreshCurrentApplet"", psIn1, psOut1);
				}//end of if (i > 0)
			}//end of with(BulkLineBC)
		}//end of if (FirstRecord())
	}//end of with(BulkHeaderBC)
}
catch(e)
{throw(e);}
finally{
	svcUI = null, psIn1 = null, psOut1 = null;
	BulkLineBC=null, BulkHeaderBC=null, BulkReqBO=null;
}
return CancelOperation;
}
function CreateLineItemsCSM(vMSISDN,i)
{//[NAVIN:10Jul2018:CORP_SME_MERGER]

var svcUI = null, psIn1 = null, psOut1 = null;

try{
	var RecCount = 0;
	var BulkReqBO = TheApplication().GetBusObject(""STC Bulk Request BO"");	
	var BulkHeaderBC = BulkReqBO.GetBusComp(""STC Bulk Request Header BC"");
	var BulkLineBC = BulkReqBO.GetBusComp(""STC Bulk Request Line Item BC"");
	var vHeaderReqID = TheApplication().GetProfileAttr(""BulkHeaderId"");
    var vHeaderReqNum = TheApplication().GetProfileAttr(""BulkHeaderNumber"");
    var vHeaderReqType = TheApplication().GetProfileAttr(""BulkHeaderType"");
    TheApplication().SetProfileAttr(""BulkHeaderId"", """");
    TheApplication().SetProfileAttr(""BulkHeaderNumber"", """");
    TheApplication().SetProfileAttr(""BulkHeaderType"", """");
    
	var vPendingStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_BULK_REQ_HEADER_STATUS"",""Pending"");
	var vImportedStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_BULK_REQ_HEADER_STATUS"",""Imported"");
	
	with(BulkHeaderBC)
	{
		ClearToQuery();
		ActivateField(""Status"");
		ActivateField(""Sub Status"");
		ActivateField(""Request Id"");
		SetSearchSpec(""Request Id"",vHeaderReqID);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			with(BulkLineBC)
			{
				if (i > 0)
				{
					while(RecCount < i)
					{
						ClearToQuery();
						ActivateField(""Parent Id"");
						ActivateField(""Attribute Name"");
						ActivateField(""Attribute Type"");
						ActivateField(""Action"");
						ActivateField(""Attribute 3"");
						//ActivateField(""Created Date"");
						ActivateField(""MSISDN"");
						ActivateField(""Status"");
						ActivateField(""Sub Status"");	
						SetSearchSpec(""Parent Id"", vHeaderReqID);
						SetSearchSpec(""MSISDN"", vMSISDN[RecCount]);
						ExecuteQuery(ForwardBackward);
						
						if(FirstRecord())
						{}
						else
						{
							NewRecord(NewAfter);
							//RecCount--;
							SetFieldValue(""Parent Id"", vHeaderReqID);
							SetFieldValue(""Attribute Type"", vHeaderReqType);		
							SetFieldValue(""Attribute Name"", """");
							SetFieldValue(""Action"", ""Modify"");
							//SetFieldValue(""Created Date"",new Date());
							SetFieldValue(""MSISDN"", vMSISDN[RecCount]);
							SetFieldValue(""Status"", vPendingStatus);
							SetFieldValue(""Sub Status"", vImportedStatus);
							WriteRecord();
						}
						RecCount++;
					}//end of while(RecCount > 0)
		
					BulkHeaderBC.SetFieldValue(""Sub Status"", vImportedStatus);
					BulkHeaderBC.WriteRecord();
					
					svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
					psIn1 = TheApplication().NewPropertySet();
					psOut1 = TheApplication().NewPropertySet();
					psIn1.SetProperty(""Refresh All"", ""Y"");
					svcUI.InvokeMethod(""RefreshCurrentApplet"", psIn1, psOut1);
				}//end of if (i > 0)
			}//end of with(BulkLineBC)
		}//end of if (FirstRecord())
	}//end of with(BulkHeaderBC)
}
catch(e)
{throw(e);}
finally{
	svcUI = null, psIn1 = null, psOut1 = null;
	BulkLineBC=null, BulkHeaderBC=null, BulkReqBO=null;
}
return CancelOperation;
}
function CreateLineItemsUpdCommChannel(vMSISDN,vPrefCommChannel,i)
{
//[RUTUJA:26Dec2021:WhatsappNotifySD:called from Bulk request import button]

var svcUI = null, psIn1 = null, psOut1 = null;
try{
	var RecCount = 0;
	var BulkReqBO = TheApplication().GetBusObject(""STC Bulk Request BO"");	
	var BulkHeaderBC = BulkReqBO.GetBusComp(""STC Bulk Request Header BC"");
	var BulkLineBC = BulkReqBO.GetBusComp(""STC Bulk Request Line Item BC"");
	var vHeaderReqID = TheApplication().GetProfileAttr(""BulkHeaderId"");
    var vHeaderReqNum = TheApplication().GetProfileAttr(""BulkHeaderNumber"");
    var vHeaderReqType = TheApplication().GetProfileAttr(""BulkHeaderType"");
    TheApplication().SetProfileAttr(""BulkHeaderId"", """");
    TheApplication().SetProfileAttr(""BulkHeaderNumber"", """");
    TheApplication().SetProfileAttr(""BulkHeaderType"", """");
    
	var vPendingStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_BULK_REQ_HEADER_STATUS"",""Pending"");
	var vImportedStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_BULK_REQ_HEADER_STATUS"",""Imported"");
	
	with(BulkHeaderBC)
	{
		ClearToQuery();
		ActivateField(""Status"");
		ActivateField(""Sub Status"");
		ActivateField(""Request Id"");
		SetSearchSpec(""Request Id"",vHeaderReqID);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			with(BulkLineBC)
			{
				if (i > 0)
				{
					while(RecCount < i)
					{
						ClearToQuery();
						ActivateField(""Parent Id"");
						ActivateField(""Attribute Name"");
						ActivateField(""Attribute Type"");
						ActivateField(""Action"");
						ActivateField(""Attribute 10"");
						ActivateField(""MSISDN"");
						ActivateField(""Status"");
						ActivateField(""Sub Status"");	
						SetSearchSpec(""Parent Id"", vHeaderReqID);
						SetSearchSpec(""MSISDN"", vMSISDN[RecCount]);
						ExecuteQuery(ForwardBackward);	
						if(FirstRecord())
						{}
						else
						{
							NewRecord(NewAfter);
							//RecCount--;
							SetFieldValue(""Parent Id"", vHeaderReqID);
							SetFieldValue(""Attribute Type"", vHeaderReqType);		
							SetFieldValue(""Attribute Name"", """");
							SetFieldValue(""Action"", ""Modify"");
							SetFieldValue(""MSISDN"", vMSISDN[RecCount]);
							SetFieldValue(""Attribute 10"", vPrefCommChannel[RecCount]);
							SetFieldValue(""Status"", vPendingStatus);
							SetFieldValue(""Sub Status"", vImportedStatus);
							WriteRecord();
						}
						RecCount++;
					}//end of while(RecCount > 0)
		
					BulkHeaderBC.SetFieldValue(""Sub Status"", vImportedStatus);
					BulkHeaderBC.WriteRecord();
					
					svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
					psIn1 = TheApplication().NewPropertySet();
					psOut1 = TheApplication().NewPropertySet();
					psIn1.SetProperty(""Refresh All"", ""Y"");
					svcUI.InvokeMethod(""RefreshCurrentApplet"", psIn1, psOut1);
				}//end of if (i > 0)
			}//end of with(BulkLineBC)
		}//end of if (FirstRecord())
	}//end of with(BulkHeaderBC)
}
catch(e)
{throw(e);}
finally{
	svcUI = null, psIn1 = null, psOut1 = null;
	BulkLineBC=null, BulkHeaderBC=null, BulkReqBO=null;
}
return CancelOperation;
}
"
function CreateLineItemsWhiteList(vAccountNum,vMSISDN,vCustomerName,vIDNumber,ReqSector,vOwnership,vReason,vTypeofWhitelist,CapAmount,vReqDate,vEndDate,i)
{//[SUMANK:WHITELIST]

var svcUI = null, psIn1 = null, psOut1 = null;

try{
	var RecCount = 0;
	var BulkReqBO = TheApplication().GetBusObject(""STC Bulk Request BO"");	
	var BulkHeaderBC = BulkReqBO.GetBusComp(""STC Bulk Request Header BC"");
	var BulkLineBC = BulkReqBO.GetBusComp(""STC Bulk Request Line Item BC"");
	var vHeaderReqID = TheApplication().GetProfileAttr(""BulkHeaderId"");
    var vHeaderReqNum = TheApplication().GetProfileAttr(""BulkHeaderNumber"");
    var vHeaderReqType = TheApplication().GetProfileAttr(""BulkHeaderType"");
    TheApplication().SetProfileAttr(""BulkHeaderId"", """");
    TheApplication().SetProfileAttr(""BulkHeaderNumber"", """");
    TheApplication().SetProfileAttr(""BulkHeaderType"", """");
    var sReqUser, sStartDate,sEndDate, sReqEmail,sReqContactNum,sDepartment;
	var vPendingStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_BULK_REQ_HEADER_STATUS"",""Pending"");
	var vImportedStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_BULK_REQ_HEADER_STATUS"",""Imported"");
	
	with(BulkHeaderBC)
	{
		ClearToQuery();
		ActivateField(""Status"");
		ActivateField(""Sub Status"");
		ActivateField(""Request Id"");
		ActivateField(""Attribute14"");
		ActivateField(""Request Attribute 4"");
		ActivateField(""Request Attribute 3"");
		ActivateField(""Extra Arribute 10"");
		ActivateField(""Attribute12"");
		ActivateField(""Attribute30"");
		SetSearchSpec(""Request Id"",vHeaderReqID);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			sReqUser = GetFieldValue(""Attribute14"");
			sStartDate = GetFieldValue(""Request Attribute 4"");
			sEndDate = GetFieldValue(""Request Attribute 3"");
			sReqEmail = GetFieldValue(""Extra Arribute 10"");
			sReqContactNum = GetFieldValue(""Attribute12"");
			sDepartment = GetFieldValue(""Attribute30"");
			with(BulkLineBC)
			{
				if (i > 0)
				{
					while(RecCount < i)
					{
						ClearToQuery();
					var psInAct = TheApplication().NewPropertySet();
					with(psInAct)
					{
						SetProperty(""Parent Id"", vHeaderReqID);
						SetProperty(""Attribute Name"", ""SR"");
						SetProperty(""Attribute Type"", vHeaderReqType);
						SetProperty(""Action"", ""Add"");
						SetProperty(""Attribute 3"", ""2-Qualified"");
					//	SetProperty(""Attribute 7"", ""2-Qualified"");
						SetProperty(""Status"", vPendingStatus);
						SetProperty(""Sub Status"", vImportedStatus);
						SetProperty(""MSISDN"", vMSISDN[RecCount]);
						SetProperty(""Attribute 7"", vAccountNum[RecCount]);
						SetProperty(""Attribute 5"", vEndDate[RecCount]);
						SetProperty(""Attribute 6"", vReqDate[RecCount]);
					//	SetProperty(""Attribute 5"", sEndDate);
						SetProperty(""Attribute 19"", vCustomerName[RecCount]);
						SetProperty(""Attribute 20"", vIDNumber[RecCount]);
					//	SetProperty(""Attribute 21"", vDepartment[RecCount]);
						SetProperty(""Attribute 21"", sDepartment);
					//	SetProperty(""Attribute 22"", vReqUser[RecCount]);
						SetProperty(""Attribute 22"", sReqUser);
						SetProperty(""Attribute 23"", vOwnership[RecCount]);
						SetProperty(""Attribute 24"", vReason[RecCount]);
					//	SetProperty(""Attribute 25"", vReqContactNum[RecCount]);
						SetProperty(""Attribute 25"", sReqContactNum);
						SetProperty(""Attribute 26"", vTypeofWhitelist[RecCount]);
						SetProperty(""Attribute 27"", CapAmount[RecCount]);
					//	SetProperty(""Attribute 28"", ReqEmail[RecCount]);
						SetProperty(""Attribute 28"", sReqEmail);
						SetProperty(""Attribute 29"", ReqSector[RecCount]);
					}
						ActivateMultipleFields(psInAct);
						SetSearchSpec(""Parent Id"", vHeaderReqID);
						SetSearchSpec(""Attribute 7"", vAccountNum[RecCount]);
						ExecuteQuery(ForwardBackward);
						
						if(FirstRecord())
						{}
						else
						{
							NewRecord(NewAfter);
							//RecCount--;
							SetMultipleFieldValues(psInAct);
							WriteRecord();
						}
						RecCount++;
					}//end of while(RecCount > 0)
		
					BulkHeaderBC.SetFieldValue(""Sub Status"", vImportedStatus);
					BulkHeaderBC.WriteRecord();
					
					svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
					psIn1 = TheApplication().NewPropertySet();
					psOut1 = TheApplication().NewPropertySet();
					psIn1.SetProperty(""Refresh All"", ""Y"");
					svcUI.InvokeMethod(""RefreshCurrentApplet"", psIn1, psOut1);
				}//end of if (i > 0)
			}//end of with(BulkLineBC)
		}//end of if (FirstRecord())
	}//end of with(BulkHeaderBC)
}
catch(e)
{throw(e);}
finally{
	svcUI = null, psIn1 = null, psOut1 = null;
	BulkLineBC=null, BulkHeaderBC=null, BulkReqBO=null;
}
return CancelOperation;
}
function CreateLineItemsWhiteList(vAccountNum,vMSISDN,vCustomerName,vIDNumber,ReqSector,vDepartment,vOwnership,vReason,vTypeofWhitelist,CapAmount,vReqDate,vEndDate,i)
{//[SUMANK:WHITELIST]

var svcUI = null, psIn1 = null, psOut1 = null;

try{
	var RecCount = 0;
	var BulkReqBO = TheApplication().GetBusObject(""STC Bulk Request BO"");	
	var BulkHeaderBC = BulkReqBO.GetBusComp(""STC Bulk Request Header BC"");
	var BulkLineBC = BulkReqBO.GetBusComp(""STC Bulk Request Line Item BC"");
	var vHeaderReqID = TheApplication().GetProfileAttr(""BulkHeaderId"");
    var vHeaderReqNum = TheApplication().GetProfileAttr(""BulkHeaderNumber"");
    var vHeaderReqType = TheApplication().GetProfileAttr(""BulkHeaderType"");
    TheApplication().SetProfileAttr(""BulkHeaderId"", """");
    TheApplication().SetProfileAttr(""BulkHeaderNumber"", """");
    TheApplication().SetProfileAttr(""BulkHeaderType"", """");
    var sReqUser, sStartDate,sEndDate, sReqEmail,sReqContactNum,sDepartment;
	var vPendingStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_BULK_REQ_HEADER_STATUS"",""Pending"");
	var vImportedStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_BULK_REQ_HEADER_STATUS"",""Imported"");
	
	with(BulkHeaderBC)
	{
		ClearToQuery();
		ActivateField(""Status"");
		ActivateField(""Sub Status"");
		ActivateField(""Request Id"");
		ActivateField(""Attribute14"");
		ActivateField(""Request Attribute 4"");
		ActivateField(""Request Attribute 3"");
		ActivateField(""Extra Arribute 10"");
		ActivateField(""Attribute12"");
		ActivateField(""Attribute30"");
		SetSearchSpec(""Request Id"",vHeaderReqID);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			sReqUser = GetFieldValue(""Attribute14"");
			sStartDate = GetFieldValue(""Request Attribute 4"");
			sEndDate = GetFieldValue(""Request Attribute 3"");
			sReqEmail = GetFieldValue(""Extra Arribute 10"");
			sReqContactNum = GetFieldValue(""Attribute12"");
			sDepartment = GetFieldValue(""Attribute30"");
			with(BulkLineBC)
			{
				if (i > 0)
				{
					while(RecCount < i)
					{
						ClearToQuery();
					var psInAct = TheApplication().NewPropertySet();
					with(psInAct)
					{
						SetProperty(""Parent Id"", vHeaderReqID);
						SetProperty(""Attribute Name"", ""SR"");
						SetProperty(""Attribute Type"", vHeaderReqType);
						SetProperty(""Action"", ""Add"");
						SetProperty(""Attribute 3"", ""2-Qualified"");
					//	SetProperty(""Attribute 7"", ""2-Qualified"");
						SetProperty(""Status"", vPendingStatus);
						SetProperty(""Sub Status"", vImportedStatus);
						SetProperty(""MSISDN"", vMSISDN[RecCount]);
						SetProperty(""Attribute 7"", vAccountNum[RecCount]);
						SetProperty(""Attribute 5"", vEndDate[RecCount]);
						SetProperty(""Attribute 6"", vReqDate[RecCount]);
					//	SetProperty(""Attribute 5"", sEndDate);
						SetProperty(""Attribute 19"", vCustomerName[RecCount]);
						SetProperty(""Attribute 20"", vIDNumber[RecCount]);
						SetProperty(""Attribute 21"", vDepartment[RecCount]);
					//	SetProperty(""Attribute 21"", sDepartment); // Pankaj: updating department from file
					//	SetProperty(""Attribute 22"", vReqUser[RecCount]);
						SetProperty(""Attribute 22"", sReqUser);
						SetProperty(""Attribute 23"", vOwnership[RecCount]);
						SetProperty(""Attribute 24"", vReason[RecCount]);
					//	SetProperty(""Attribute 25"", vReqContactNum[RecCount]);
						SetProperty(""Attribute 25"", sReqContactNum);
						SetProperty(""Attribute 26"", vTypeofWhitelist[RecCount]);
						SetProperty(""Attribute 27"", CapAmount[RecCount]);
					//	SetProperty(""Attribute 28"", ReqEmail[RecCount]);
						SetProperty(""Attribute 28"", sReqEmail);
						SetProperty(""Attribute 29"", ReqSector[RecCount]);
					}
						ActivateMultipleFields(psInAct);
						SetSearchSpec(""Parent Id"", vHeaderReqID);
						SetSearchSpec(""Attribute 7"", vAccountNum[RecCount]);
						ExecuteQuery(ForwardBackward);
						
						if(FirstRecord())
						{}
						else
						{
							NewRecord(NewAfter);
							//RecCount--;
							SetMultipleFieldValues(psInAct);
							WriteRecord();
						}
						RecCount++;
					}//end of while(RecCount > 0)
		
					BulkHeaderBC.SetFieldValue(""Sub Status"", vImportedStatus);
					BulkHeaderBC.WriteRecord();
					
					svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
					psIn1 = TheApplication().NewPropertySet();
					psOut1 = TheApplication().NewPropertySet();
					psIn1.SetProperty(""Refresh All"", ""Y"");
					svcUI.InvokeMethod(""RefreshCurrentApplet"", psIn1, psOut1);
				}//end of if (i > 0)
			}//end of with(BulkLineBC)
		}//end of if (FirstRecord())
	}//end of with(BulkHeaderBC)
}
catch(e)
{throw(e);}
finally{
	svcUI = null, psIn1 = null, psOut1 = null;
	BulkLineBC=null, BulkHeaderBC=null, BulkReqBO=null;
}
return CancelOperation;
}
function ImportFile(Inputs, Outputs)
{
/*[17Aug2015][NAVINR][SD: Extended Dunning Bulk Request]*/
// Indrasen: FY21_R17: Collection SD: Extended the logic for Bulk SR Revamp

	var vInputFile = """", vReadFromFile = """", vBulkDataArray = """", vHeaderReqType="""";
    var vFileName = """", vFileType = """";
 	var vAccountNum: Array = new Array();
 	var vAction: Array = new Array();
 	var vExtDays: Array = new Array();
	var vMSISDN: Array = new Array();
	var vEndDate: Array = new Array();
 	var vRecord = false;
	var BAN: Array = new Array();
	var vCustomerName: Array = new Array();
	var vDepartment: Array = new Array();
	var vIDNumber: Array = new Array();
	var vOwnership: Array = new Array();
	var vReason: Array = new Array();
	var vReqContactNum: Array = new Array();
	var vReqUser: Array = new Array();
	var vReqDate: Array = new Array();
	var vTypeofWhitelist: Array = new Array();
	var CapAmount: Array = new Array();
	var ReqEmail: Array = new Array();
	var ReqSector: Array = new Array();
	var ReasonForflagging: Array = new Array();
	var ChildType:Array = new Array();
	var ParentMSISDN:Array = new Array();
	var i = 0, ErrMsg = ""Success"";
	
	try {
		vHeaderReqType = TheApplication().GetProfileAttr(""BulkHeaderType"");

		vFileName = Inputs.GetProperty(""FileName"");
	  	vFileType = ToString(Inputs.GetProperty(""FileType""));
		vFileType = Clib.strlwr(vFileType);
	    if((vFileType != ""csv"") && (vFileType != ""tmp"")) //files having size more than 500KB are created with '.tmp' extension// Indrasen: FY21_R17
	    {
	       TheApplication().RaiseErrorText(""Please check the File Type, It should be :  File_Name.CSV"");
	    }
	    vInputFile = Clib.fopen(vFileName, ""rt"");       
	    vReadFromFile = Clib.fgets(vInputFile);
		
		if(vReadFromFile != null && vFileName != '' && vFileName != """")
		{		
			if (vInputFile == null)
			{
				TheApplication().RaiseErrorText(""Error in opening the file!"");
			}
			if(vHeaderReqType == ""CORP SME MERGER"")
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
				{			
					ErrMsg = """"; //Nullify Error Message for each of the iteration			
					if(vReadFromFile != null && vReadFromFile != """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
						var sRecData = vReadFromFile.split("","");
						vMSISDN[i] = sRecData[0];		
						i++;
					}//if(sReadFromFile != null && sReadFromFile != """")
					vReadFromFile = Clib.fgets(vInputFile);
				}//while(!Clib.feof(sFileOpen))
				 
				CreateLineItemsCSM(vMSISDN,i);
			}//end of if(vHeaderReqType == ""CORP SME MERGER"")
			if(vHeaderReqType == ""WHITELIST"" || vHeaderReqType == ""WHITELIST REMOVE"")
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
					{			
						ErrMsg = """"; //Nullify Error Message for each of the iteration			
						if(vReadFromFile != null && vReadFromFile != """")
							{
								vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
								var sRecData = vReadFromFile.split("","");
								vAccountNum[i] = sRecData[0];
								vMSISDN[i] = sRecData[1];
								vCustomerName[i]= sRecData[2];
								vIDNumber[i] = sRecData[3];	
								ReqSector[i] = sRecData[4];
							//	vDepartment[i] = sRecData[5];
							//	vReqUser[i] = sRecData[6];
							//	vReqDate[i] = sRecData[6]; 
							//	vEndDate[i] = sRecData[7];
								vOwnership[i] = sRecData[5];
								vReason[i] = sRecData[6];
							//	vReqContactNum[i] = sRecData[11];
								vTypeofWhitelist[i] = sRecData[7];
								CapAmount[i] = sRecData[8];
							//	ReqEmail[i] = sRecData[14];
								i++;
							}//if(sReadFromFile != null && sReadFromFile != """")

						vReadFromFile = Clib.fgets(vInputFile);
					}//while(!Clib.feof(sFileOpen))
				 
				//	CreateLineItemsWhiteList(vAccountNum,vMSISDN,vCustomerName,vIDNumber,ReqSector,vDepartment,vReqUser,vReqDate,vEndDate,vOwnership,vReason,vReqContactNum,vTypeofWhitelist,CapAmount,ReqEmail,i);
					CreateLineItemsWhiteList(vAccountNum,vMSISDN,vCustomerName,vIDNumber,ReqSector,vOwnership,vReason,vTypeofWhitelist,CapAmount,i);

			}// end of if(vHeaderReqType == ""WHITELIST"" || vHeaderReqType == ""WHITELIST REMOVE"")
			//START : MANUJ Added for Bulk Termination
			else if(vHeaderReqType == ""Bulk Termination"")
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
					{			
						ErrMsg = """"; //Nullify Error Message for each of the iteration			
						if(vReadFromFile != null && vReadFromFile != """")
							{
								vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
								var sRecData = vReadFromFile.split("","");
								BAN[i] = sRecData[0];				
								vMSISDN[i] = sRecData[1];
								vCustomerName[i] = sRecData[2];
								vReason[i] = sRecData[3];
								ReasonForflagging[i] = sRecData[4];
								ChildType[i] = sRecData[5];
								ParentMSISDN[i] = sRecData[6];
								i++;
							}//if(sReadFromFile != null && sReadFromFile != """")
						vReadFromFile = Clib.fgets(vInputFile);
					}//while(!Clib.feof(sFileOpen))
				 
				CreateLineItemsBulkTermination(BAN,vMSISDN,vCustomerName,vReason,ReasonForflagging,ChildType,ParentMSISDN,i);

			}// END : MANUJ Added for Bulk Termination
			else if(vHeaderReqType == ""Bulk SR Revamp"")
			{
				var Header = """", HeaderArray="""", j=0, DataArrLength=0, HeaderFieldName="""";
				var RecPS = TheApplication().NewPropertySet();
				var DataPS = TheApplication().NewPropertySet();
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
				{			
					ErrMsg = """"; //Nullify Error Message for each of the iteration
					
					if(vReadFromFile != null && vReadFromFile != """" && Header == """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 
						Header = vReadFromFile;
						HeaderArray = vReadFromFile.split("","");
						DataArrLength = HeaderArray.length;
						for(j=0; j<(ToNumber(DataArrLength)-1); j++)
						{
							HeaderFieldName = TheApplication().InvokeMethod(""LookupValue"",""STC_COLLECTION_UNBAR_ADMIN"",HeaderArray[j]);
							if( HeaderFieldName != """" && HeaderFieldName != HeaderArray[j] )
								HeaderArray[j] = HeaderFieldName;
						}
					}
					else if(vReadFromFile != null && vReadFromFile != """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
						var sRecData = vReadFromFile.split("","");
						
						for(j=0; j<(ToNumber(DataArrLength)-1); j++)
						{
							RecPS.SetProperty(HeaderArray[j], sRecData[j]);
						}
						DataPS.AddChild(RecPS.Copy());
						RecPS.Reset();

						i++;
					}
					vReadFromFile = Clib.fgets(vInputFile);
				}//while(!Clib.feof(sFileOpen))
				 
				CreateBulkSRItems(DataPS, i);

			}// END : MANUJ Added for Bulk Termination
			else
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
				{			
					ErrMsg = """"; //Nullify Error Message for each of the iteration			
					if(vReadFromFile != null && vReadFromFile != """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
						var sRecData = vReadFromFile.split("","");
						vAccountNum[i] = sRecData[0];				
						vAction[i] = sRecData[1];
						vExtDays[i] = sRecData[2];	
						i++;
					}//if(sReadFromFile != null && sReadFromFile != """")
					vReadFromFile = Clib.fgets(vInputFile);
				}//while(!Clib.feof(sFileOpen))
				 
				CreateLineItems(vAccountNum,vAction,vExtDays,i);
			}//end of else
		 
		}//if(sFileName != null && sFileName != '' && sFileName != """")
	}//end of try
	catch(e)
	{throw(e.errText);}
	finally{
		vAccountNum = null, vAction = null, vExtDays = null;
		vInputFile = null;
	}
	return CancelOperation;
}
function ImportFile(Inputs, Outputs)
{
/*[17Aug2015][NAVINR][SD: Extended Dunning Bulk Request]*/
// Indrasen: FY21_R17: Collection SD: Extended the logic for Bulk SR Revamp

	var vInputFile = """", vReadFromFile = """", vBulkDataArray = """", vHeaderReqType="""";
    var vFileName = """", vFileType = """";
 	var vAccountNum: Array = new Array();
 	var vAction: Array = new Array();
 	var vExtDays: Array = new Array();
	var vMSISDN: Array = new Array();
	var vEndDate: Array = new Array();
 	var vRecord = false;
	var BAN: Array = new Array();
	var vCustomerName: Array = new Array();
	var vDepartment: Array = new Array();
	var vIDNumber: Array = new Array();
	var vOwnership: Array = new Array();
	var vReason: Array = new Array();
	var vReqContactNum: Array = new Array();
	var vReqUser: Array = new Array();
	var vReqDate: Array = new Array();
	var vTypeofWhitelist: Array = new Array();
	var CapAmount: Array = new Array();
	var ReqEmail: Array = new Array();
	var ReqSector: Array = new Array();
	var ReasonForflagging: Array = new Array();
	var ChildType:Array = new Array();
	var ParentMSISDN:Array = new Array();
	var vPrefCommChannel: Array = new Array();
	var i = 0, ErrMsg = ""Success"";
	
	try {
		vHeaderReqType = TheApplication().GetProfileAttr(""BulkHeaderType"");

		vFileName = Inputs.GetProperty(""FileName"");
	  	vFileType = ToString(Inputs.GetProperty(""FileType""));
		vFileType = Clib.strlwr(vFileType);
	    if((vFileType != ""csv"") && (vFileType != ""tmp"")) //files having size more than 500KB are created with '.tmp' extension// Indrasen: FY21_R17
	    {
	       TheApplication().RaiseErrorText(""Please check the File Type, It should be :  File_Name.CSV"");
	    }
	    vInputFile = Clib.fopen(vFileName, ""rt"");       
	    vReadFromFile = Clib.fgets(vInputFile);
		
		if(vReadFromFile != null && vFileName != '' && vFileName != """")
		{		
			if (vInputFile == null)
			{
				TheApplication().RaiseErrorText(""Error in opening the file!"");
			}
			if(vHeaderReqType == ""CORP SME MERGER"")
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
				{			
					ErrMsg = """"; //Nullify Error Message for each of the iteration			
					if(vReadFromFile != null && vReadFromFile != """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
						var sRecData = vReadFromFile.split("","");
						vMSISDN[i] = sRecData[0];		
						i++;
					}//if(sReadFromFile != null && sReadFromFile != """")
					vReadFromFile = Clib.fgets(vInputFile);
				}//while(!Clib.feof(sFileOpen))
				 
				CreateLineItemsCSM(vMSISDN,i);
			}//end of if(vHeaderReqType == ""CORP SME MERGER"")
			if(vHeaderReqType == ""UPDATE PREF COMM CHANNEL"")//[RUTUJA:26Dec2021:WhatsappNotify]
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
				{			
					ErrMsg = """"; //Nullify Error Message for each of the iteration			
					if(vReadFromFile != null && vReadFromFile != """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
						var sRecData = vReadFromFile.split("","");
						vMSISDN[i] = sRecData[0];
						vPrefCommChannel[i] = sRecData[1];		
						i++;
					}//if(sReadFromFile != null && sReadFromFile != """")
					vReadFromFile = Clib.fgets(vInputFile);
				}//while(!Clib.feof(sFileOpen))				 
				CreateLineItemsUpdCommChannel(vMSISDN,vPrefCommChannel,i);
			}//end of if(vHeaderReqType == ""UPDATE PREF COMM CHANNEL"")
			if(vHeaderReqType == ""WHITELIST"" || vHeaderReqType == ""WHITELIST REMOVE"")
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
					{			
						ErrMsg = """"; //Nullify Error Message for each of the iteration			
						if(vReadFromFile != null && vReadFromFile != """")
							{
								vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
								var sRecData = vReadFromFile.split("","");
								vAccountNum[i] = sRecData[0];
								vMSISDN[i] = sRecData[1];
								vCustomerName[i]= sRecData[2];
								vIDNumber[i] = sRecData[3];	
								ReqSector[i] = sRecData[4];
								vDepartment[i] = sRecData[5];
							//	vReqUser[i] = sRecData[6];
								vReqDate[i] = sRecData[10]; 
								vEndDate[i] = sRecData[11];
								vOwnership[i] = sRecData[6];
								vReason[i] = sRecData[7];
							//	vReqContactNum[i] = sRecData[11];
								vTypeofWhitelist[i] = sRecData[8];
								CapAmount[i] = sRecData[9];
							//	ReqEmail[i] = sRecData[14];
								i++;
							}//if(sReadFromFile != null && sReadFromFile != """")

						vReadFromFile = Clib.fgets(vInputFile);
					}//while(!Clib.feof(sFileOpen))
				 
				//	CreateLineItemsWhiteList(vAccountNum,vMSISDN,vCustomerName,vIDNumber,ReqSector,vDepartment,vReqUser,vReqDate,vEndDate,vOwnership,vReason,vReqContactNum,vTypeofWhitelist,CapAmount,ReqEmail,i);
					CreateLineItemsWhiteList(vAccountNum,vMSISDN,vCustomerName,vIDNumber,ReqSector,vDepartment,vOwnership,vReason,vTypeofWhitelist,CapAmount,vReqDate,vEndDate,i);

			}// end of if(vHeaderReqType == ""WHITELIST"" || vHeaderReqType == ""WHITELIST REMOVE"")
			//START : MANUJ Added for Bulk Termination
			else if(vHeaderReqType == ""Bulk Termination"")
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
					{			
						ErrMsg = """"; //Nullify Error Message for each of the iteration			
						if(vReadFromFile != null && vReadFromFile != """")
							{
								vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
								var sRecData = vReadFromFile.split("","");
								BAN[i] = sRecData[0];				
								vMSISDN[i] = sRecData[1];
								vCustomerName[i] = sRecData[2];
								vReason[i] = sRecData[3];
								ReasonForflagging[i] = sRecData[4];
								ChildType[i] = sRecData[5];
								ParentMSISDN[i] = sRecData[6];
								i++;
							}//if(sReadFromFile != null && sReadFromFile != """")
						vReadFromFile = Clib.fgets(vInputFile);
					}//while(!Clib.feof(sFileOpen))
				 
				CreateLineItemsBulkTermination(BAN,vMSISDN,vCustomerName,vReason,ReasonForflagging,ChildType,ParentMSISDN,i);

			}// END : MANUJ Added for Bulk Termination
			else if(vHeaderReqType == ""Bulk SR Revamp"")
			{
				var Header = """", HeaderArray="""", j=0, DataArrLength=0, HeaderFieldName="""";
				var RecPS = TheApplication().NewPropertySet();
				var DataPS = TheApplication().NewPropertySet();
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
				{			
					ErrMsg = """"; //Nullify Error Message for each of the iteration
					
					if(vReadFromFile != null && vReadFromFile != """" && Header == """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 
						Header = vReadFromFile;
						HeaderArray = vReadFromFile.split("","");
						DataArrLength = HeaderArray.length;
						for(j=0; j<(ToNumber(DataArrLength)-1); j++)
						{
							HeaderFieldName = TheApplication().InvokeMethod(""LookupValue"",""STC_COLLECTION_UNBAR_ADMIN"",HeaderArray[j]);
							if( HeaderFieldName != """" && HeaderFieldName != HeaderArray[j] )
								HeaderArray[j] = HeaderFieldName;
						}
					}
					else if(vReadFromFile != null && vReadFromFile != """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
						var sRecData = vReadFromFile.split("","");
						
						for(j=0; j<(ToNumber(DataArrLength)-1); j++)
						{
							RecPS.SetProperty(HeaderArray[j], sRecData[j]);
						}
						DataPS.AddChild(RecPS.Copy());
						RecPS.Reset();

						i++;
					}
					vReadFromFile = Clib.fgets(vInputFile);
				}//while(!Clib.feof(sFileOpen))
				 
				CreateBulkSRItems(DataPS, i);

			}// END : MANUJ Added for Bulk Termination
			else if(vHeaderReqType == ""BulkCollection"") //Hardik:Collection SD
			{
				var Header = """", HeaderArray="""", j=0, DataArrLength=0, HeaderFieldName="""";
				var RecPS = TheApplication().NewPropertySet();
				var DataPS = TheApplication().NewPropertySet();
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
				{			
					ErrMsg = """"; //Nullify Error Message for each of the iteration
					
					if(vReadFromFile != null && vReadFromFile != """" && Header == """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 
						Header = vReadFromFile;
						HeaderArray = vReadFromFile.split("","");
						DataArrLength = HeaderArray.length;
						for(j=0; j<(ToNumber(DataArrLength)-1); j++)
						{
							HeaderFieldName = TheApplication().InvokeMethod(""LookupValue"",""STC_COLLECTION_UNBAR_ADMIN"",HeaderArray[j]);
							if( HeaderFieldName != """" && HeaderFieldName != HeaderArray[j] )
								HeaderArray[j] = HeaderFieldName;
						}
					}
					else if(vReadFromFile != null && vReadFromFile != """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
						var sRecData = vReadFromFile.split("","");
						
						for(j=0; j<(ToNumber(DataArrLength)-1); j++)
						{
							RecPS.SetProperty(HeaderArray[j], sRecData[j]);
						}
						DataPS.AddChild(RecPS.Copy());
						RecPS.Reset();

						i++;
					}
					vReadFromFile = Clib.fgets(vInputFile);
				}//while(!Clib.feof(sFileOpen))
				 
				CreateBulkCollection(DataPS, i);

			}// END : Hardik Added for Bulk Import for Collection.
			else
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
				{			
					ErrMsg = """"; //Nullify Error Message for each of the iteration			
					if(vReadFromFile != null && vReadFromFile != """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
						var sRecData = vReadFromFile.split("","");
						vAccountNum[i] = sRecData[0];				
						vAction[i] = sRecData[1];
						vExtDays[i] = sRecData[2];	
						i++;
					}//if(sReadFromFile != null && sReadFromFile != """")
					vReadFromFile = Clib.fgets(vInputFile);
				}//while(!Clib.feof(sFileOpen))
				 
				CreateLineItems(vAccountNum,vAction,vExtDays,i);
			}//end of else
		 
		}//if(sFileName != null && sFileName != '' && sFileName != """")
	}//end of try
	catch(e)
	{
	//throw(e.errText);
		throw(e);
	}
	finally{
		vAccountNum = null, vAction = null, vExtDays = null;
		vInputFile = null;
	}
	return CancelOperation;
}
function ImportFile(Inputs, Outputs)
{
/*[17Aug2015][NAVINR][SD: Extended Dunning Bulk Request]*/
// Indrasen: FY21_R17: Collection SD: Extended the logic for Bulk SR Revamp

	var vInputFile = """", vReadFromFile = """", vBulkDataArray = """", vHeaderReqType="""";
    var vFileName = """", vFileType = """";
 	var vAccountNum: Array = new Array();
 	var vAction: Array = new Array();
 	var vExtDays: Array = new Array();
	var vMSISDN: Array = new Array();
	var vEndDate: Array = new Array();
 	var vRecord = false;
	var BAN: Array = new Array();
	var vCustomerName: Array = new Array();
	var vDepartment: Array = new Array();
	var vIDNumber: Array = new Array();
	var vOwnership: Array = new Array();
	var vReason: Array = new Array();
	var vReqContactNum: Array = new Array();
	var vReqUser: Array = new Array();
	var vReqDate: Array = new Array();
	var vTypeofWhitelist: Array = new Array();
	var CapAmount: Array = new Array();
	var ReqEmail: Array = new Array();
	var ReqSector: Array = new Array();
	var ReasonForflagging: Array = new Array();
	var ChildType:Array = new Array();
	var ParentMSISDN:Array = new Array();
	var vPrefCommChannel: Array = new Array();
	var i = 0, ErrMsg = ""Success"";
	
	try {
		vHeaderReqType = TheApplication().GetProfileAttr(""BulkHeaderType"");

		vFileName = Inputs.GetProperty(""FileName"");
	  	vFileType = ToString(Inputs.GetProperty(""FileType""));
		vFileType = Clib.strlwr(vFileType);
	    if((vFileType != ""csv"") && (vFileType != ""tmp"")) //files having size more than 500KB are created with '.tmp' extension// Indrasen: FY21_R17
	    {
	       TheApplication().RaiseErrorText(""Please check the File Type, It should be :  File_Name.CSV"");
	    }
	    vInputFile = Clib.fopen(vFileName, ""rt"");       
	    vReadFromFile = Clib.fgets(vInputFile);
		
		if(vReadFromFile != null && vFileName != '' && vFileName != """")
		{		
			if (vInputFile == null)
			{
				TheApplication().RaiseErrorText(""Error in opening the file!"");
			}
			if(vHeaderReqType == ""CORP SME MERGER"")
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
				{			
					ErrMsg = """"; //Nullify Error Message for each of the iteration			
					if(vReadFromFile != null && vReadFromFile != """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
						var sRecData = vReadFromFile.split("","");
						vMSISDN[i] = sRecData[0];		
						i++;
					}//if(sReadFromFile != null && sReadFromFile != """")
					vReadFromFile = Clib.fgets(vInputFile);
				}//while(!Clib.feof(sFileOpen))
				 
				CreateLineItemsCSM(vMSISDN,i);
			}//end of if(vHeaderReqType == ""CORP SME MERGER"")
			if(vHeaderReqType == ""UPDATE PREF COMM CHANNEL"")//[RUTUJA:26Dec2021:WhatsappNotify]
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
				{			
					ErrMsg = """"; //Nullify Error Message for each of the iteration			
					if(vReadFromFile != null && vReadFromFile != """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
						var sRecData = vReadFromFile.split("","");
						vMSISDN[i] = sRecData[0];
						vPrefCommChannel[i] = sRecData[1];		
						i++;
					}//if(sReadFromFile != null && sReadFromFile != """")
					vReadFromFile = Clib.fgets(vInputFile);
				}//while(!Clib.feof(sFileOpen))				 
				CreateLineItemsUpdCommChannel(vMSISDN,vPrefCommChannel,i);
			}//end of if(vHeaderReqType == ""UPDATE PREF COMM CHANNEL"")
			if(vHeaderReqType == ""WHITELIST"" || vHeaderReqType == ""WHITELIST REMOVE"")
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
					{			
						ErrMsg = """"; //Nullify Error Message for each of the iteration			
						if(vReadFromFile != null && vReadFromFile != """")
							{
								vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
								var sRecData = vReadFromFile.split("","");
								vAccountNum[i] = sRecData[0];
								vMSISDN[i] = sRecData[1];
								vCustomerName[i]= sRecData[2];
								vIDNumber[i] = sRecData[3];	
								ReqSector[i] = sRecData[4];
							//	vDepartment[i] = sRecData[9];
							//	vReqUser[i] = sRecData[6];
								vReqDate[i] = sRecData[9]; 
								vEndDate[i] = sRecData[10];
								vOwnership[i] = sRecData[5];
								vReason[i] = sRecData[6];
							//	vReqContactNum[i] = sRecData[11];
								vTypeofWhitelist[i] = sRecData[7];
								CapAmount[i] = sRecData[8];
							//	ReqEmail[i] = sRecData[14];
								i++;
							}//if(sReadFromFile != null && sReadFromFile != """")

						vReadFromFile = Clib.fgets(vInputFile);
					}//while(!Clib.feof(sFileOpen))
				 
				//	CreateLineItemsWhiteList(vAccountNum,vMSISDN,vCustomerName,vIDNumber,ReqSector,vDepartment,vReqUser,vReqDate,vEndDate,vOwnership,vReason,vReqContactNum,vTypeofWhitelist,CapAmount,ReqEmail,i);
					CreateLineItemsWhiteList(vAccountNum,vMSISDN,vCustomerName,vIDNumber,ReqSector,vOwnership,vReason,vTypeofWhitelist,CapAmount,vReqDate,vEndDate,i);

			}// end of if(vHeaderReqType == ""WHITELIST"" || vHeaderReqType == ""WHITELIST REMOVE"")
			//START : MANUJ Added for Bulk Termination
			else if(vHeaderReqType == ""Bulk Termination"")
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
					{			
						ErrMsg = """"; //Nullify Error Message for each of the iteration			
						if(vReadFromFile != null && vReadFromFile != """")
							{
								vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
								var sRecData = vReadFromFile.split("","");
								BAN[i] = sRecData[0];				
								vMSISDN[i] = sRecData[1];
								vCustomerName[i] = sRecData[2];
								vReason[i] = sRecData[3];
								ReasonForflagging[i] = sRecData[4];
								ChildType[i] = sRecData[5];
								ParentMSISDN[i] = sRecData[6];
								i++;
							}//if(sReadFromFile != null && sReadFromFile != """")
						vReadFromFile = Clib.fgets(vInputFile);
					}//while(!Clib.feof(sFileOpen))
				 
				CreateLineItemsBulkTermination(BAN,vMSISDN,vCustomerName,vReason,ReasonForflagging,ChildType,ParentMSISDN,i);

			}// END : MANUJ Added for Bulk Termination
			else if(vHeaderReqType == ""Bulk SR Revamp"")
			{
				var Header = """", HeaderArray="""", j=0, DataArrLength=0, HeaderFieldName="""";
				var RecPS = TheApplication().NewPropertySet();
				var DataPS = TheApplication().NewPropertySet();
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
				{			
					ErrMsg = """"; //Nullify Error Message for each of the iteration
					
					if(vReadFromFile != null && vReadFromFile != """" && Header == """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 
						Header = vReadFromFile;
						HeaderArray = vReadFromFile.split("","");
						DataArrLength = HeaderArray.length;
						for(j=0; j<(ToNumber(DataArrLength)-1); j++)
						{
							HeaderFieldName = TheApplication().InvokeMethod(""LookupValue"",""STC_COLLECTION_UNBAR_ADMIN"",HeaderArray[j]);
							if( HeaderFieldName != """" && HeaderFieldName != HeaderArray[j] )
								HeaderArray[j] = HeaderFieldName;
						}
					}
					else if(vReadFromFile != null && vReadFromFile != """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
						var sRecData = vReadFromFile.split("","");
						
						for(j=0; j<(ToNumber(DataArrLength)-1); j++)
						{
							RecPS.SetProperty(HeaderArray[j], sRecData[j]);
						}
						DataPS.AddChild(RecPS.Copy());
						RecPS.Reset();

						i++;
					}
					vReadFromFile = Clib.fgets(vInputFile);
				}//while(!Clib.feof(sFileOpen))
				 
				CreateBulkSRItems(DataPS, i);

			}// END : MANUJ Added for Bulk Termination
			else if(vHeaderReqType == ""BulkCollection"") //Hardik:Collection SD
			{
				var Header = """", HeaderArray="""", j=0, DataArrLength=0, HeaderFieldName="""";
				var RecPS = TheApplication().NewPropertySet();
				var DataPS = TheApplication().NewPropertySet();
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
				{			
					ErrMsg = """"; //Nullify Error Message for each of the iteration
					
					if(vReadFromFile != null && vReadFromFile != """" && Header == """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 
						Header = vReadFromFile;
						HeaderArray = vReadFromFile.split("","");
						DataArrLength = HeaderArray.length;
						for(j=0; j<(ToNumber(DataArrLength)-1); j++)
						{
							HeaderFieldName = TheApplication().InvokeMethod(""LookupValue"",""STC_COLLECTION_UNBAR_ADMIN"",HeaderArray[j]);
							if( HeaderFieldName != """" && HeaderFieldName != HeaderArray[j] )
								HeaderArray[j] = HeaderFieldName;
						}
					}
					else if(vReadFromFile != null && vReadFromFile != """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
						var sRecData = vReadFromFile.split("","");
						
						for(j=0; j<(ToNumber(DataArrLength)-1); j++)
						{
							RecPS.SetProperty(HeaderArray[j], sRecData[j]);
						}
						DataPS.AddChild(RecPS.Copy());
						RecPS.Reset();

						i++;
					}
					vReadFromFile = Clib.fgets(vInputFile);
				}//while(!Clib.feof(sFileOpen))
				 
				CreateBulkCollection(DataPS, i);

			}// END : Hardik Added for Bulk Import for Collection.
			else
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
				{			
					ErrMsg = """"; //Nullify Error Message for each of the iteration			
					if(vReadFromFile != null && vReadFromFile != """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
						var sRecData = vReadFromFile.split("","");
						vAccountNum[i] = sRecData[0];				
						vAction[i] = sRecData[1];
						vExtDays[i] = sRecData[2];	
						i++;
					}//if(sReadFromFile != null && sReadFromFile != """")
					vReadFromFile = Clib.fgets(vInputFile);
				}//while(!Clib.feof(sFileOpen))
				 
				CreateLineItems(vAccountNum,vAction,vExtDays,i);
			}//end of else
		 
		}//if(sFileName != null && sFileName != '' && sFileName != """")
	}//end of try
	catch(e)
	{
	//throw(e.errText);
		throw(e);
	}
	finally{
		vAccountNum = null, vAction = null, vExtDays = null;
		vInputFile = null;
	}
	return CancelOperation;
}
function ImportFile(Inputs, Outputs)
{
/*[17Aug2015][NAVINR][SD: Extended Dunning Bulk Request]*/
// Indrasen: FY21_R17: Collection SD: Extended the logic for Bulk SR Revamp

	var vInputFile = """", vReadFromFile = """", vBulkDataArray = """", vHeaderReqType="""";
    var vFileName = """", vFileType = """";
 	var vAccountNum: Array = new Array();
 	var vAction: Array = new Array();
 	var vExtDays: Array = new Array();
	var vMSISDN: Array = new Array();
	var vEndDate: Array = new Array();
 	var vRecord = false;
	var BAN: Array = new Array();
	var vCustomerName: Array = new Array();
	var vDepartment: Array = new Array();
	var vIDNumber: Array = new Array();
	var vOwnership: Array = new Array();
	var vReason: Array = new Array();
	var vReqContactNum: Array = new Array();
	var vReqUser: Array = new Array();
	var vReqDate: Array = new Array();
	var vTypeofWhitelist: Array = new Array();
	var CapAmount: Array = new Array();
	var ReqEmail: Array = new Array();
	var ReqSector: Array = new Array();
	var ReasonForflagging: Array = new Array();
	var ChildType:Array = new Array();
	var ParentMSISDN:Array = new Array();
	var i = 0, ErrMsg = ""Success"";
	
	try {
		vHeaderReqType = TheApplication().GetProfileAttr(""BulkHeaderType"");

		vFileName = Inputs.GetProperty(""FileName"");
	  	vFileType = ToString(Inputs.GetProperty(""FileType""));
		vFileType = Clib.strlwr(vFileType);
	    if((vFileType != ""csv"") && (vFileType != ""tmp"")) //files having size more than 500KB are created with '.tmp' extension// Indrasen: FY21_R17
	    {
	       TheApplication().RaiseErrorText(""Please check the File Type, It should be :  File_Name.CSV"");
	    }
	    vInputFile = Clib.fopen(vFileName, ""rt"");       
	    vReadFromFile = Clib.fgets(vInputFile);
		
		if(vReadFromFile != null && vFileName != '' && vFileName != """")
		{		
			if (vInputFile == null)
			{
				TheApplication().RaiseErrorText(""Error in opening the file!"");
			}
			if(vHeaderReqType == ""CORP SME MERGER"")
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
				{			
					ErrMsg = """"; //Nullify Error Message for each of the iteration			
					if(vReadFromFile != null && vReadFromFile != """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
						var sRecData = vReadFromFile.split("","");
						vMSISDN[i] = sRecData[0];		
						i++;
					}//if(sReadFromFile != null && sReadFromFile != """")
					vReadFromFile = Clib.fgets(vInputFile);
				}//while(!Clib.feof(sFileOpen))
				 
				CreateLineItemsCSM(vMSISDN,i);
			}//end of if(vHeaderReqType == ""CORP SME MERGER"")
			if(vHeaderReqType == ""WHITELIST"" || vHeaderReqType == ""WHITELIST REMOVE"")
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
					{			
						ErrMsg = """"; //Nullify Error Message for each of the iteration			
						if(vReadFromFile != null && vReadFromFile != """")
							{
								vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
								var sRecData = vReadFromFile.split("","");
								vAccountNum[i] = sRecData[0];
								vMSISDN[i] = sRecData[1];
								vCustomerName[i]= sRecData[2];
								vIDNumber[i] = sRecData[3];	
								ReqSector[i] = sRecData[4];
							//	vDepartment[i] = sRecData[9];
							//	vReqUser[i] = sRecData[6];
								vReqDate[i] = sRecData[9]; 
								vEndDate[i] = sRecData[10];
								vOwnership[i] = sRecData[5];
								vReason[i] = sRecData[6];
							//	vReqContactNum[i] = sRecData[11];
								vTypeofWhitelist[i] = sRecData[7];
								CapAmount[i] = sRecData[8];
							//	ReqEmail[i] = sRecData[14];
								i++;
							}//if(sReadFromFile != null && sReadFromFile != """")

						vReadFromFile = Clib.fgets(vInputFile);
					}//while(!Clib.feof(sFileOpen))
				 
				//	CreateLineItemsWhiteList(vAccountNum,vMSISDN,vCustomerName,vIDNumber,ReqSector,vDepartment,vReqUser,vReqDate,vEndDate,vOwnership,vReason,vReqContactNum,vTypeofWhitelist,CapAmount,ReqEmail,i);
					CreateLineItemsWhiteList(vAccountNum,vMSISDN,vCustomerName,vIDNumber,ReqSector,vOwnership,vReason,vTypeofWhitelist,CapAmount,vReqDate,vEndDate,i);

			}// end of if(vHeaderReqType == ""WHITELIST"" || vHeaderReqType == ""WHITELIST REMOVE"")
			//START : MANUJ Added for Bulk Termination
			else if(vHeaderReqType == ""Bulk Termination"")
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
					{			
						ErrMsg = """"; //Nullify Error Message for each of the iteration			
						if(vReadFromFile != null && vReadFromFile != """")
							{
								vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
								var sRecData = vReadFromFile.split("","");
								BAN[i] = sRecData[0];				
								vMSISDN[i] = sRecData[1];
								vCustomerName[i] = sRecData[2];
								vReason[i] = sRecData[3];
								ReasonForflagging[i] = sRecData[4];
								ChildType[i] = sRecData[5];
								ParentMSISDN[i] = sRecData[6];
								i++;
							}//if(sReadFromFile != null && sReadFromFile != """")
						vReadFromFile = Clib.fgets(vInputFile);
					}//while(!Clib.feof(sFileOpen))
				 
				CreateLineItemsBulkTermination(BAN,vMSISDN,vCustomerName,vReason,ReasonForflagging,ChildType,ParentMSISDN,i);

			}// END : MANUJ Added for Bulk Termination
			else if(vHeaderReqType == ""Bulk SR Revamp"")
			{
				var Header = """", HeaderArray="""", j=0, DataArrLength=0, HeaderFieldName="""";
				var RecPS = TheApplication().NewPropertySet();
				var DataPS = TheApplication().NewPropertySet();
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
				{			
					ErrMsg = """"; //Nullify Error Message for each of the iteration
					
					if(vReadFromFile != null && vReadFromFile != """" && Header == """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 
						Header = vReadFromFile;
						HeaderArray = vReadFromFile.split("","");
						DataArrLength = HeaderArray.length;
						for(j=0; j<(ToNumber(DataArrLength)-1); j++)
						{
							HeaderFieldName = TheApplication().InvokeMethod(""LookupValue"",""STC_COLLECTION_UNBAR_ADMIN"",HeaderArray[j]);
							if( HeaderFieldName != """" && HeaderFieldName != HeaderArray[j] )
								HeaderArray[j] = HeaderFieldName;
						}
					}
					else if(vReadFromFile != null && vReadFromFile != """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
						var sRecData = vReadFromFile.split("","");
						
						for(j=0; j<(ToNumber(DataArrLength)-1); j++)
						{
							RecPS.SetProperty(HeaderArray[j], sRecData[j]);
						}
						DataPS.AddChild(RecPS.Copy());
						RecPS.Reset();

						i++;
					}
					vReadFromFile = Clib.fgets(vInputFile);
				}//while(!Clib.feof(sFileOpen))
				 
				CreateBulkSRItems(DataPS, i);

			}// END : MANUJ Added for Bulk Termination
			else if(vHeaderReqType == ""BulkCollection"") //Hardik:Collection SD
			{
				var Header = """", HeaderArray="""", j=0, DataArrLength=0, HeaderFieldName="""";
				var RecPS = TheApplication().NewPropertySet();
				var DataPS = TheApplication().NewPropertySet();
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
				{			
					ErrMsg = """"; //Nullify Error Message for each of the iteration
					
					if(vReadFromFile != null && vReadFromFile != """" && Header == """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 
						Header = vReadFromFile;
						HeaderArray = vReadFromFile.split("","");
						DataArrLength = HeaderArray.length;
						for(j=0; j<(ToNumber(DataArrLength)-1); j++)
						{
							HeaderFieldName = TheApplication().InvokeMethod(""LookupValue"",""STC_COLLECTION_UNBAR_ADMIN"",HeaderArray[j]);
							if( HeaderFieldName != """" && HeaderFieldName != HeaderArray[j] )
								HeaderArray[j] = HeaderFieldName;
						}
					}
					else if(vReadFromFile != null && vReadFromFile != """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
						var sRecData = vReadFromFile.split("","");
						
						for(j=0; j<(ToNumber(DataArrLength)-1); j++)
						{
							RecPS.SetProperty(HeaderArray[j], sRecData[j]);
						}
						DataPS.AddChild(RecPS.Copy());
						RecPS.Reset();

						i++;
					}
					vReadFromFile = Clib.fgets(vInputFile);
				}//while(!Clib.feof(sFileOpen))
				 
				CreateBulkCollection(DataPS, i);

			}// END : Hardik Added for Bulk Import for Collection.
			else
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
				{			
					ErrMsg = """"; //Nullify Error Message for each of the iteration			
					if(vReadFromFile != null && vReadFromFile != """")
					{
						vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
						var sRecData = vReadFromFile.split("","");
						vAccountNum[i] = sRecData[0];				
						vAction[i] = sRecData[1];
						vExtDays[i] = sRecData[2];	
						i++;
					}//if(sReadFromFile != null && sReadFromFile != """")
					vReadFromFile = Clib.fgets(vInputFile);
				}//while(!Clib.feof(sFileOpen))
				 
				CreateLineItems(vAccountNum,vAction,vExtDays,i);
			}//end of else
		 
		}//if(sFileName != null && sFileName != '' && sFileName != """")
	}//end of try
	catch(e)
	{
	//throw(e.errText);
		throw(e);
	}
	finally{
		vAccountNum = null, vAction = null, vExtDays = null;
		vInputFile = null;
	}
	return CancelOperation;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
var ireturn = CancelOperation;

	 try
	 {
	    switch(MethodName)
	     {     
		     case ""ImportFile"":
		     {
		     	ImportFile(Inputs,Outputs);
		     	return(CancelOperation);
		     	break;
		     }

	      	 default:
	         	break;
	     }
	 }
	 catch (exc)
	 {
	 	//throw(exc.toString());
		throw(exc);
	 }
	 finally 
	 {
	 }  
}
function CheckSplitBillValidation(Inputs, Outputs)
{
	var sMSISDN = Inputs.GetProperty(""CPSMSISDN"");
	var sSIMNo = Inputs.GetProperty(""SIMNum"");
	var corpGPRSPlanId = Inputs.GetProperty(""GSMPlanId"");
	var appObj = TheApplication();
	var MigratedNum = """";
	var sSIMSpecialCatType = """";
	var sMigrationType = """";
	var corpGPRSPlan = """";
	var boProdInt = appObj.GetBusObject(""Internal Product"");//P1 ****
	var bcProdInt = boProdInt.GetBusComp(""Internal Product"");
	var sErrorFlag = ""N"";
	with(bcProdInt)
	{
		SetViewMode(AllView);
		ActivateField(""Part #"");
		ClearToQuery();
		SetSearchSpec(""Id"",corpGPRSPlanId);
		ExecuteQuery(ForwardOnly);
		if(FirstRecord())
		{
			corpGPRSPlan = GetFieldValue(""Part #"");
		}
	}
	
	if(sMSISDN != null && sMSISDN != """")
	{
		if(!isNaN(sMSISDN))
		{
			if(sMSISDN.length != 11)
			{
				Outputs.SetProperty(""ErrorMessage"", ""Please enter 11 digits for CPSMSISDN"");
				sErrorFlag = ""Y"";
			//	TheApplication().RaiseErrorText(""Please enter 11 digits for CPSMSISDN"");
			}
			var vCPSMSISDN = sMSISDN.substring(3,0);
			if(vCPSMSISDN != '973')
			{
				Outputs.SetProperty(""ErrorMessage"", ""MSISDN should start with '973'"");
				sErrorFlag = ""Y"";
			//	TheApplication().RaiseErrorText(""MSISDN should start with '973'"");
			}
		}
		else
		{
			Outputs.SetProperty(""ErrorMessage"", ""Please enter Numericals for CPSMSISDN"");
			sErrorFlag = ""Y"";
		//	TheApplication().RaiseErrorText(""Please enter Numericals for CPSMSISDN"");
		}
	}
	if(sSIMNo != null && sSIMNo != """" && sErrorFlag != ""Y"")
	{
		var corpGPRSPlanNew = TheApplication().InvokeMethod(""LookupValue"",""STC_CORPGPRSSIMPLAN"",corpGPRSPlan);
		var CorpGPRSSubStr = corpGPRSPlanNew.substring(0,8);
		var CategoryName = appObj.InvokeMethod(""LookupValue"",""STC_ADMIN"",""CORPGPRSCAT"");
		
		var boRMS = appObj.GetBusObject(""RMS NM Number Enquiry_Thin"");//P1 ****
		var bcRMS = boRMS.GetBusComp(""RMS NM Number Enquiry_Thin"");
		with (bcRMS)
		{
			SetViewMode(AllView);
	//		ActivateField(""STC Migration Type"");//Validation to restrict new Postpaid plans
			ActivateField(""Number String"");
			ActivateField(""Special Category Type"");
	//		ActivateField(""Migrated SIM Number"");
			ClearToQuery();
			SetSearchSpec(""Number String"",sSIMNo);
			ExecuteQuery(ForwardOnly);     
			var isrecord = FirstRecord();
			if (isrecord)
			{
	//			MigratedNum = GetFieldValue(""Migrated SIM Number"");
				sSIMSpecialCatType = GetFieldValue(""Special Category Type"");
	//			sMigrationType = GetFieldValue(""STC Migration Type"");//Validation to restrict new Postpaid plans
			}
			if(CorpGPRSSubStr == ""CORPGPRS"")
		   {
			 if(sSIMSpecialCatType != CategoryName)
			 {
				Outputs.SetProperty(""ErrorMessage"", ""Please enter SIM series from DummyCorp category"");
			//	sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0030"") +""\n"";
			//	sErrorCode += ""OM0030 \n"";
			 }
		   }
		}
	}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 switch(MethodName)
 {
  case ""Process Batch"":
   fn_ProcessBatch(Inputs, Outputs);
   break;
 }
 return (CancelOperation);
}
function fn_ProcessBatch(Inputs, Outputs)
{
 try
 {
  var vRequestFor,vRequestFrom, vStatus, vMethod_Name, vDeptBillAccntId, vErrorCount=0, vSuccessCount=0, vTotCount=0;
  var vRecPresent, vRowId, vSearchSpec;
  var objAppln, objBusObj,  objBusComp, objServRequest;
  var propInput, propOutput, propServReq;
  var STCSIMType, SIM, MSISDN, GsmPlan, AccountName, SubmitRequest=true;
  var sCPSMSISDN; var GsmPlanId; var propCPSInput, propCPSOutput;
  
  objAppln = TheApplication();
  objBusObj = objAppln.GetBusObject(""STC Bulk Request"");
  objBusComp = objBusObj.GetBusComp(""STC SME Bulk Request"");
  objServRequest = objAppln.GetService(""Workflow Process Manager"");
  
  var sActView = objAppln.ActiveViewName();
  
  vStatus     = Inputs.GetProperty(""Status"");
  vMethod_Name = Inputs.GetProperty(""Method_Name"");
  vDeptBillAccntId = Inputs.GetProperty(""Department Bill Account Id"");
  if( Inputs.PropertyExists(""RequestFrom"") )
   vRequestFrom = Inputs.GetProperty(""RequestFrom"");
  else
   vRequestFrom = ""Y"";
 
  propInput  = objAppln.NewPropertySet();
  propOutput  = objAppln.NewPropertySet();
  propServReq  = objAppln.NewPropertySet();
  
  switch(vMethod_Name)
  {
   case ""CreateOrderAllActivation"":
      	 vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Line Activation' AND [Status] = '"" + vStatus + ""' AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
      	 vRequestFor = ""Create Order"";
      	 break;
   case ""SubmitOrderAllActivation"":
      	 vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Line Activation' AND [Status] = '"" + vStatus + ""' AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
      	 vRequestFor = ""Submit Order"";
      	 break;
   case ""CreateOrderAllModify"":
      	 vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Modify Service' AND [Status] = '"" + vStatus + ""' AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
      	 vRequestFor = ""Create Order"";
         break;
   case ""SubmitOrderAllModify"":
         vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Modify Service' AND [Status] = '"" + vStatus + ""' AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
         vRequestFor = ""Submit Order"";
         break;
   case ""CreateOrderAllDeActivation"":
         vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Line De-activation' AND [Status] = '"" + vStatus + ""' AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
         vRequestFor = ""Create Order"";
         break;
   case ""SubmitOrderAllDeActivation"":
         vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Line De-activation' AND [Status] = '"" + vStatus + ""' AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
         vRequestFor = ""Submit Order"";
         break;
   case ""CreateOrderAllResume"":
         vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Line Resumption' AND [Status] = '"" + vStatus + ""' AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
         vRequestFor = ""Create Order"";
         break;
    case ""SubmitOrderAllResume"":
         vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Line Resumption' AND [Status] = '"" + vStatus + ""' AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
         vRequestFor = ""Submit Order"";
         break;
    case ""CreateOrderAllSuspend"":
         vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Line Suspension' AND [Status] = '"" + vStatus + ""' AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
         vRequestFor = ""Create Order"";
         break;
    case ""SubmitOrderAllSuspend"":
         vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Line Suspension' AND [Status] = '"" + vStatus + ""' AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
         vRequestFor = ""Submit Order"";
         break;
  } // end switch
  with(objBusComp)
  {
	   ActivateField(""Request Type"");
	   ActivateField(""Request Area"");
	   ActivateField(""Status"");
	   ActivateField(""STC SIM Type"");
	   ActivateField(""GSM Plan"");
	   ActivateField(""MSISDN"");
	   ActivateField(""Request Attribute 7"");
	   ActivateField(""Request Attribute 10"");
	   ActivateField(""Error Code"");
	   ActivateField(""Error Message"");
	   ActivateField(""STC CPS Pckg MSISDN"");
   	   ActivateField(""GSM Plan Id"");
	   SetViewMode(AllView);
	   ClearToQuery();
	   SetSearchExpr(vSearchSpec);
	   ExecuteQuery(ForwardOnly);
	   vRecPresent = FirstRecord();
	   while(vRecPresent)
	   {
	    try
	    {
		     propInput.Reset();
		     vRowId = GetFieldValue(""Id"");
		     STCSIMType = GetFieldValue(""STC SIM Type"");
			 SIM = GetFieldValue(""Request Attribute 7"");
			 MSISDN = GetFieldValue(""MSISDN"");
			 GsmPlan = GetFieldValue(""GSM Plan"");
			 AccountName = GetFieldValue(""Request Attribute 10"");
			 sCPSMSISDN = GetFieldValue(""STC CPS Pckg MSISDN"");
	 		 GsmPlanId = GetFieldValue(""GSM Plan Id"");
	 		 var sCPSPlanAllow = objAppln.InvokeMethod(""LookupValue"", ""STC_CPS_PLAN"", GsmPlan);
	 		 var sCPSPlanAllowSubstr = sCPSPlanAllow.substring(0,5);
			 if( vMethod_Name == ""CreateOrderAllActivation"" || vMethod_Name == ""SubmitOrderAllActivation"" )
			 {
				if(sActView == ""STC SME Bulk Activation"")
				{
					if(sCPSPlanAllowSubstr == ""Allow"")
					{
						if( STCSIMType == """" || SIM == """" || sCPSMSISDN == """" || GsmPlan == """" || AccountName == """" )
						{
							SetFieldValue(""Error Message"", ""Account Name, Service Type, SIM, CPS MSISDN and GSM Plan are mandatory fields to submit the request"");
							SetFieldValue(""Error Code"", ""NULL_FIELD_FOUND"");
							WriteRecord();
							SubmitRequest=false;
							vErrorCount++;
						}
						else
						{
							propCPSInput  = objAppln.NewPropertySet();
							propCPSOutput  = objAppln.NewPropertySet();
							propCPSInput.SetProperty(""CPSMSISDN"",  sCPSMSISDN);
							propCPSInput.SetProperty(""SIMNum"",  SIM);
							propCPSInput.SetProperty(""GSMPlanId"",  GsmPlanId);
							CheckSplitBillValidation(propCPSInput, propCPSOutput);
							var sCPSError = propCPSOutput.GetProperty(""ErrorMessage"");
							if(sCPSError != null && sCPSError != """")
							{
								SetFieldValue(""Error Message"", sCPSError);
								SetFieldValue(""Error Code"", ""WRONG_FIELD_FOUND"");
								WriteRecord();
								SubmitRequest=false;
								vErrorCount++;
							}
						}
					}//end of if(sCPSPlanAllowSubstr == ""Allow"")
					else
					{
						if( STCSIMType == """" || SIM == """" || MSISDN == """" || GsmPlan == """" || AccountName == """" )
						{
							SetFieldValue(""Error Message"", ""Account Name, Service Type, SIM, MSISDN and GSM Plan are mandatory fields to submit the request"");
							SetFieldValue(""Error Code"", ""NULL_FIELD_FOUND"");
							WriteRecord();
							SubmitRequest=false;
							vErrorCount++;
						}
					}
				}//end of if(sActView == ""STC SME Bulk Activation"")
				else
				{
					if( STCSIMType == """" || SIM == """" || MSISDN == """" || GsmPlan == """" || AccountName == """" )
					{
						SetFieldValue(""Error Message"", ""Account Name, Service Type, SIM, MSISDN and GSM Plan are mandatory fields to submit the request"");
						SetFieldValue(""Error Code"", ""NULL_FIELD_FOUND"");
						WriteRecord();
						SubmitRequest=false;
						vErrorCount++;
					}
				}
			 } 
			 if(SubmitRequest)
			 { 		
		     	propInput.SetProperty(""ProcessName"", ""STC SME Bulk Request Process WF"");
		     	propInput.SetProperty(""RequestFor"",  vRequestFor);
		     	propInput.SetProperty(""Object Id"",  vRowId);
		     	propInput.SetProperty(""STCAdminMode"",  ""Y"");
		     	objServRequest.InvokeMethod(""RunProcess"", propInput, propOutput);
		     	vSuccessCount++;
		     }
	    }
	    catch(e) 
	    {
	      vErrorCount++;
	    }
	    finally
	    {
		      vRecPresent = NextRecord();
		      SubmitRequest=true;
	    }
	   }
  } // end with buscomp
  
  vTotCount=vErrorCount+vSuccessCount;
  if( vRequestFrom == ""Y"" )
   objAppln.RaiseErrorText(vTotCount+"" record(s) submitted. Please refresh applet to know status."");
   
 }
 catch(e)
 {
  throw(e);
 }
 finally
 {
  objAppln = null; 
  objBusObj = null;  
  objBusComp = null; 
  objServRequest=null;
  Outputs.SetProperty(""ErrorCount"", vErrorCount);
  Outputs.SetProperty(""SuccessCount"", vSuccessCount); 
 }
 return (CancelOperation);
}
function fn_ProcessBatch(Inputs, Outputs)
{
 try
 {
  var vRequestFor,vRequestFrom, vStatus, vMethod_Name, vDeptBillAccntId, vErrorCount=0, vSuccessCount=0, vTotCount=0;
  var vRecPresent, vRowId, vSearchSpec;
  var objAppln, objBusObj,  objBusComp, objServRequest;
  var propInput, propOutput, propServReq;
  var STCSIMType, SIM, MSISDN, GsmPlan, AccountName, SubmitRequest=true;
  var sCPSMSISDN; var GsmPlanId; var propCPSInput, propCPSOutput;
  var vRequestArea = """"; //VIDYAD;23012022;Added for PBI000000007484
  
  objAppln = TheApplication();
  objBusObj = objAppln.GetBusObject(""STC Bulk Request"");
  objBusComp = objBusObj.GetBusComp(""STC SME Bulk Request"");
  objServRequest = objAppln.GetService(""Workflow Process Manager"");
  
  var sActView = objAppln.ActiveViewName();
  
  vStatus     = Inputs.GetProperty(""Status"");
  vMethod_Name = Inputs.GetProperty(""Method_Name"");
  vDeptBillAccntId = Inputs.GetProperty(""Department Bill Account Id"");
  if( Inputs.PropertyExists(""RequestFrom"") )
   vRequestFrom = Inputs.GetProperty(""RequestFrom"");
  else
   vRequestFrom = ""Y"";
 
  propInput  = objAppln.NewPropertySet();
  propOutput  = objAppln.NewPropertySet();
  propServReq  = objAppln.NewPropertySet();
  
  switch(vMethod_Name)
  {
   case ""CreateOrderAllActivation"":
      	 vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Line Activation' AND [Status] = '"" + vStatus + ""' AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
      	 vRequestFor = ""Create Order"";
      	 break;
   case ""SubmitOrderAllActivation"":
      	 vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Line Activation' AND [Status] = '"" + vStatus + ""' AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
      	 vRequestFor = ""Submit Order"";
      	 break;
   case ""CreateOrderAllModify"":
      	 vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Modify Service' AND [Status] = '"" + vStatus + ""' AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
      	 vRequestFor = ""Create Order"";
         break;
   case ""SubmitOrderAllModify"":
         vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Modify Service' AND [Status] = '"" + vStatus + ""' AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
         vRequestFor = ""Submit Order"";
         break;
   case ""CreateOrderAllDeActivation"":
         vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Line De-activation' AND [Status] = '"" + vStatus + ""' AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
         vRequestFor = ""Create Order"";
         break;
   case ""SubmitOrderAllDeActivation"":
         vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Line De-activation' AND [Status] = '"" + vStatus + ""' AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
         vRequestFor = ""Submit Order"";
         break;
   case ""CreateOrderAllResume"":
         vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Line Resumption' AND [Status] = '"" + vStatus + ""' AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
         vRequestFor = ""Create Order"";
         break;
    case ""SubmitOrderAllResume"":
         vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Line Resumption' AND [Status] = '"" + vStatus + ""' AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
         vRequestFor = ""Submit Order"";
         break;
    case ""CreateOrderAllSuspend"":
         vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Line Suspension' AND [Status] = '"" + vStatus + ""' AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
         vRequestFor = ""Create Order"";
         break;
    case ""SubmitOrderAllSuspend"":
         vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Line Suspension' AND [Status] = '"" + vStatus + ""' AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
         vRequestFor = ""Submit Order"";
         break;
  } // end switch
  with(objBusComp)
  {
	   ActivateField(""Request Type"");
	   ActivateField(""Request Area"");
	   ActivateField(""Status"");
	   ActivateField(""STC SIM Type"");
	   ActivateField(""GSM Plan"");
	   ActivateField(""MSISDN"");
	   ActivateField(""Request Attribute 7"");
	   ActivateField(""Request Attribute 10"");
	   ActivateField(""Error Code"");
	   ActivateField(""Error Message"");
	   ActivateField(""STC CPS Pckg MSISDN"");
   	   ActivateField(""GSM Plan Id"");
	   SetViewMode(AllView);
	   ClearToQuery();
	   SetSearchExpr(vSearchSpec);
	   ExecuteQuery(ForwardOnly);
	   vRecPresent = FirstRecord();
	   while(vRecPresent)
	   {
	    try
	    {
		     propInput.Reset();
		     vRowId = GetFieldValue(""Id"");
		     STCSIMType = GetFieldValue(""STC SIM Type"");
			 SIM = GetFieldValue(""Request Attribute 7"");
			 MSISDN = GetFieldValue(""MSISDN"");
			 GsmPlan = GetFieldValue(""GSM Plan"");
			 AccountName = GetFieldValue(""Request Attribute 10"");
			 sCPSMSISDN = GetFieldValue(""STC CPS Pckg MSISDN"");
	 		 GsmPlanId = GetFieldValue(""GSM Plan Id"");
			 vRequestArea = GetFieldValue(""Request Area""); //VIDYAD;23012022;Added for PBI000000007484
	 		 var sCPSPlanAllow = objAppln.InvokeMethod(""LookupValue"", ""STC_CPS_PLAN"", GsmPlan);
	 		 var sCPSPlanAllowSubstr = sCPSPlanAllow.substring(0,5);
			 if( vMethod_Name == ""CreateOrderAllActivation"" || vMethod_Name == ""SubmitOrderAllActivation"" )
			 {
				if(sActView == ""STC SME Bulk Activation"")
				{
					if(sCPSPlanAllowSubstr == ""Allow"")
					{
						if( STCSIMType == """" || SIM == """" || sCPSMSISDN == """" || GsmPlan == """" || AccountName == """" )
						{
							SetFieldValue(""Error Message"", ""Account Name, Service Type, SIM, CPS MSISDN and GSM Plan are mandatory fields to submit the request"");
							SetFieldValue(""Error Code"", ""NULL_FIELD_FOUND"");
							SetFieldValue(""Status"", ""Pending"");////VIDYAD;23012022;Added for PBI000000007484
							WriteRecord();
							SubmitRequest=false;
							vErrorCount++;
						}
						else
						{
							propCPSInput  = objAppln.NewPropertySet();
							propCPSOutput  = objAppln.NewPropertySet();
							propCPSInput.SetProperty(""CPSMSISDN"",  sCPSMSISDN);
							propCPSInput.SetProperty(""SIMNum"",  SIM);
							propCPSInput.SetProperty(""GSMPlanId"",  GsmPlanId);
							CheckSplitBillValidation(propCPSInput, propCPSOutput);
							var sCPSError = propCPSOutput.GetProperty(""ErrorMessage"");
							if(sCPSError != null && sCPSError != """")
							{
								SetFieldValue(""Error Message"", sCPSError);
								SetFieldValue(""Error Code"", ""WRONG_FIELD_FOUND"");
								WriteRecord();
								SubmitRequest=false;
								vErrorCount++;
							}
						}
					}//end of if(sCPSPlanAllowSubstr == ""Allow"")
					else
					{
						if( STCSIMType == """" || SIM == """" || MSISDN == """" || GsmPlan == """" || AccountName == """" )
						{
							SetFieldValue(""Error Message"", ""Account Name, Service Type, SIM, MSISDN and GSM Plan are mandatory fields to submit the request"");
							SetFieldValue(""Error Code"", ""NULL_FIELD_FOUND"");
							SetFieldValue(""Status"", ""Pending"");////VIDYAD;23012022;Added for PBI000000007484
							WriteRecord();
							SubmitRequest=false;
							vErrorCount++;
						}
					}
				}//end of if(sActView == ""STC SME Bulk Activation"")
				else
				{
					if( STCSIMType == """" || SIM == """" || MSISDN == """" || GsmPlan == """" || AccountName == """" )
					{
						SetFieldValue(""Error Message"", ""Account Name, Service Type, SIM, MSISDN and GSM Plan are mandatory fields to submit the request"");
						SetFieldValue(""Error Code"", ""NULL_FIELD_FOUND"");
						SetFieldValue(""Status"", ""Pending"");////VIDYAD;23012022;Added for PBI000000007484
						WriteRecord();
						SubmitRequest=false;
						vErrorCount++;
					}
				}
			 } 
			 if(SubmitRequest)
			 { 		
		     	propInput.SetProperty(""ProcessName"", ""STC SME Bulk Request Process WF"");
		     	propInput.SetProperty(""RequestFor"",  vRequestFor);
		     	propInput.SetProperty(""Object Id"",  vRowId);
		     	propInput.SetProperty(""STCAdminMode"",  ""Y"");
				propInput.SetProperty(""RequestArea"", vRequestArea);//VIDYAD;23012022;Added for PBI000000007484
		     	objServRequest.InvokeMethod(""RunProcess"", propInput, propOutput);
		     	vSuccessCount++;
		     }
	    }
	    catch(e) 
	    {
	      vErrorCount++;
	    }
	    finally
	    {
		      vRecPresent = NextRecord();
		      SubmitRequest=true;
	    }
	   }
  } // end with buscomp
  
  vTotCount=vErrorCount+vSuccessCount;
  if( vRequestFrom == ""Y"" )
   objAppln.RaiseErrorText(vTotCount+"" record(s) submitted. Please refresh applet to know status."");
   
 }
 catch(e)
 {
  throw(e);
 }
 finally
 {
  objAppln = null; 
  objBusObj = null;  
  objBusComp = null; 
  objServRequest=null;
  Outputs.SetProperty(""ErrorCount"", vErrorCount);
  Outputs.SetProperty(""SuccessCount"", vSuccessCount); 
 }
 return (CancelOperation);
}
function fn_ProcessBatch_Old(Inputs, Outputs)
{
 try
 {
  var vRequestFor,vRequestFrom, vStatus, vMethod_Name, vDeptBillAccntId, vErrorCount=0, vSuccessCount=0, vTotCount=0;
  var vRecPresent, vRowId, vSearchSpec;
  var objAppln, objBusObj,  objBusComp, objServRequest;
  var propInput, propOutput, propServReq;
  
  objAppln = TheApplication();
  objBusObj = objAppln.GetBusObject(""STC Bulk Request"");
  objBusComp = objBusObj.GetBusComp(""STC SME Bulk Request"");
  objServRequest = objAppln.GetService(""Server Requests"");
  
  vStatus     = Inputs.GetProperty(""Status"");
  vMethod_Name = Inputs.GetProperty(""Method_Name"");
 // vDeptBillAccntId = Inputs.GetProperty(""Department Bill Account Id"");
  if( Inputs.PropertyExists(""RequestFrom"") )
   vRequestFrom = Inputs.GetProperty(""RequestFrom"");
  else
   vRequestFrom = ""Y"";
 
  propInput  = objAppln.NewPropertySet();
  propOutput  = objAppln.NewPropertySet();
  propServReq  = objAppln.NewPropertySet();
  
  switch(vMethod_Name)
  {
   case ""CreateOrderAllActivation"":
      vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Line Activation' AND [Status] = '"" + vStatus + ""' "";//AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
      vRequestFor = ""Create Order"";
      break;
   case ""SubmitOrderAllActivation"":
      vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Line Activation' AND [Status] = '"" + vStatus + ""' "";//AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
      vRequestFor = ""Submit Order"";
      break;
   case ""CreateOrderAllModify"":
      vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Modify Service' AND [Status] = '"" + vStatus + ""' "";//AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
      vRequestFor = ""Create Order"";
         break;
   case ""SubmitOrderAllModify"":
         vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Modify Service' AND [Status] = '"" + vStatus + ""' "";//AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
         vRequestFor = ""Submit Order"";
         break;
   case ""CreateOrderAllDeActivation"":
         vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Line De-activation' AND [Status] = '"" + vStatus + ""' "";//AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
         vRequestFor = ""Create Order"";
         break;
   case ""SubmitOrderAllDeActivation"":
         vSearchSpec = ""[Request Type] = 'SME BULK ORDER' AND [Request Area]='Line De-activation' AND [Status] = '"" + vStatus + ""' "";//AND [Department Bill Account Id] = '"" + vDeptBillAccntId +""'"";
         vRequestFor = ""Submit Order"";
         break;
  } // end switch
  with(propServReq)
  {
   SetProperty(""Component"", ""WfProcMgr"");
   SetProperty(""Method"", ""RunProcess"");
   SetProperty(""Mode"", ""DirectDb"");
  }
  with(objBusComp)
  {
   ActivateField(""Request Type"");
   ActivateField(""Request Area"");
   ActivateField(""Status"");
   SetViewMode(AllView);
   ClearToQuery();
   SetSearchExpr(vSearchSpec);
   ExecuteQuery(ForwardOnly);
   vRecPresent = FirstRecord();
   while(vRecPresent)
   {
    propInput.Reset();
    vRowId = GetFieldValue(""Id"");
    propInput.SetProperty(""ProcessName"", ""STC SME Bulk Request Process WF"");
    propInput.SetProperty(""RequestFor"",  vRequestFor);
    propInput.SetProperty(""Object Id"",  vRowId);
    propInput.SetProperty(""STCAdminMode"",  ""Y"");
    var temp=TheApplication().LoginName();
    propInput.SetProperty(""OrderCreatedBy"", temp);
    propServReq.AddChild(propInput);
    
    try
    {
     objServRequest.InvokeMethod(""SubmitRequest"", propServReq, propOutput);
     vSuccessCount++;
    }
    catch(e)
    {
     vErrorCount++;
    }
    finally
    {
     propServReq.RemoveChild(0);
     vRecPresent = NextRecord();
    }
   }
  } // end with buscomp
  
  vTotCount=vErrorCount+vSuccessCount;
  if( vRequestFrom == ""Y"" )
   objAppln.RaiseErrorText(vTotCount+"" records queued for submission. Please refresh applet to know status."");
   
 }
 catch(e)
 {
  throw(e);
 }
 finally
 {
  objAppln = null; 
  objBusObj = null;  
  objBusComp = null; 
  objServRequest=null;
  Outputs.SetProperty(""ErrorCount"", vErrorCount);
  Outputs.SetProperty(""SuccessCount"", vSuccessCount); 
 }
 return (CancelOperation);
}
"//Your public declarations go here...  
var vErrorMessage = """";
var vErrorCode    = """";"
"//Your public declarations go here...  
function GetFileName(LOVType)
{
	var sListBo = TheApplication().GetBusObject(""List Of Values"");
	var sListBc = sListBo.GetBusComp(""List Of Values"");
	var FilePath = """";
	
	with(sListBc){
		ActivateField(""Description"");
		ClearToQuery();
		SetViewMode(AllView);
		SetSearchSpec(""Type"",LOVType);
		SetSearchSpec(""Name"",LOVType);		
		ExecuteQuery(ForwardOnly);
		var IsLovRec = FirstRecord();
		if(IsLovRec){
			FilePath = GetFieldValue(""Description"");
		}//endif IsLovRec
	}//endwith sListBc
return (FilePath);
}
function ImportBulkData( Inputs, Outputs)
{
/*..................................................
Author: SUMAN KANUMURI
Functionality: Importing Bulk File
Comments:
Modified By: NAVIN: 24Jul2018
..................................................*/
  	var vInputFile      = """", vReadFromFile   = """", vBulkDataArray  = """";
    //var sAppObj = TheApplication();
    var sErrorCode = """", sErrorMsg = """";
    var snFileName = """", isRec=false, vSearchExpr="""", vRecCount=0;
	var SrcProdId="""", SrcProdName="""", SrcProdPartNum="""", SrcPlanType="""", SrcServiceType="""", SrcIdentifier="""";
	var Treatment="""", SkipProvisioning="""", AttribFlag="""", ParentPartNum="""", ProdTypeCustom="""";
	var TargetProdId="""", TargetProdName="""", TargetProdPartNum="""", TargetPlanType="""", TargetServiceType="""", TargetIdentifier="""";
	var SMECorpBO = TheApplication().GetBusObject(""STC SME Corporate Merger BO"");
	var SMECorpBC = SMECorpBO.GetBusComp(""STC SME Corporate Merger BC"");
	var ProdBCSource = null, ProdBCTarget=null, isProdRecSource=false, isProdRecTarget=false;

    try
    {
		var vFileName = Inputs.GetProperty(""FileName"");
		var vFileType = ToString(Inputs.GetProperty(""FileType""));
		vFileType = Clib.strlwr(vFileType);
	//	sLoginId = TheApplication().LoginId();
		
   
		if( vFileType != ""csv"")
		{
			TheApplication().RaiseErrorText(""Please check the File Type , Is should be :  FileName.CSV"");
		}
		vInputFile     = Clib.fopen(vFileName , ""r"");       
		vReadFromFile  = Clib.fgets(vInputFile); 

	     
		while(!Clib.feof(vInputFile))
		{
			while((vReadFromFile != null) && (vReadFromFile.length > 0))
			{	
				vBulkDataArray = vReadFromFile.split("","");
				SrcProdId = vBulkDataArray[0];
				SrcProdName = vBulkDataArray[1];
				SrcProdPartNum = vBulkDataArray[2];
				SrcPlanType = vBulkDataArray[3];
				SrcServiceType = vBulkDataArray[4];
				SrcIdentifier = vBulkDataArray[5];
				Treatment = vBulkDataArray[6];
				SkipProvisioning = vBulkDataArray[7];
				TargetProdId = vBulkDataArray[8];
				TargetProdName = vBulkDataArray[9];
				TargetProdPartNum = vBulkDataArray[10];
				TargetPlanType = vBulkDataArray[11];
				TargetServiceType = vBulkDataArray[12];
				TargetIdentifier = vBulkDataArray[13];
				if(vBulkDataArray.length >= 15)
					AttribFlag = vBulkDataArray[14];
				if(vBulkDataArray.length >= 16)
					ParentPartNum = vBulkDataArray[15];
				if(vBulkDataArray.length >= 17)
					ProdTypeCustom = vBulkDataArray[16];
				
				if(vRecCount > 0 && SrcProdPartNum != ""#N/A"" && SrcProdPartNum != """" && SrcProdPartNum != null && TargetProdPartNum != ""#N/A"" && TargetProdPartNum != """" && TargetProdPartNum != null)
				{
					with(SMECorpBC)
					{
						ActivateField(""STC Prod Id Source"");
						ActivateField(""STC Product Name Source"");
						ActivateField(""STC Part Number Source"");
						ActivateField(""STC Product Type Source"");
						ActivateField(""STC Prod Identifier Source"");
						ActivateField(""STC Treatment"");
						ActivateField(""STC Skip Provisioning"");
						ActivateField(""STC Prod Id Target"");
						ActivateField(""STC Product Name Target"");
						ActivateField(""STC Part Number Target"");
						ActivateField(""STC Product Type Target"");
						ActivateField(""STC Prod Identifier Target"");
						ActivateField(""STC Attribute Flag"");
						ActivateField(""STC Parent Part Number Target"");
						ActivateField(""STC Product Type Custom"");

						SetViewMode(AllView);  
						ClearToQuery();
						vSearchExpr = ""[STC Part Number Source]='""+SrcProdPartNum+""'"";
						SetSearchExpr(vSearchExpr);
						//SetSearchSpec(""STC Part Number Source"", SrcProdPartNum);
						ExecuteQuery(ForwardBackward); 
						isRec = FirstRecord();
						if(isRec)
						{
							ProdBCSource = GetPicklistBusComp(""STC Prod Id Source"");
							with(ProdBCSource)
							{
								SetViewMode(AllView);  
								ClearToQuery();  
								//SetSearchSpec(""Part #"", SrcProdPartNum);
								SetSearchExpr(""[Part #]='""+SrcProdPartNum+""'"");
								ExecuteQuery(ForwardOnly); 
								isProdRecSource = FirstRecord();
								if(isProdRecSource)
								{
									Pick();
								}
							}
							ProdBCTarget = GetPicklistBusComp(""STC Prod Id Target"");
							with(ProdBCTarget)
							{
								SetViewMode(AllView);  
								ClearToQuery();  
								//SetSearchSpec(""Part #"", TargetProdPartNum);
								SetSearchExpr(""[Part #]='""+TargetProdPartNum+""'"");
								ExecuteQuery(ForwardOnly); 
								isProdRecTarget = FirstRecord();
								if(isProdRecTarget)
								{
									Pick();
								}
							}
							if(!isProdRecSource)
							{
								SetFieldValue(""STC Product Name Source"", SrcProdName);
								SetFieldValue(""STC Part Number Source"", SrcProdPartNum);
							}
							if(!isProdRecTarget)
							{
								SetFieldValue(""STC Product Name Target"", TargetProdName);
								SetFieldValue(""STC Part Number Target"", TargetProdPartNum);
							}
							SetFieldValue(""STC Treatment"", Treatment);
							SetFieldValue(""STC Prod Identifier Source"", SrcIdentifier);
							SetFieldValue(""STC Prod Identifier Target"", TargetIdentifier);
							SetFieldValue(""STC Skip Provisioning"", SkipProvisioning);
							SetFieldValue(""STC Attribute Flag"", AttribFlag);
							SetFieldValue(""STC Parent Part Number Target"", ParentPartNum);
							SetFieldValue(""STC Product Type Custom"", ProdTypeCustom);
							WriteRecord();
						}// end of if(isRec)
						else
						{
							NewRecord(NewAfter);

							ProdBCSource = GetPicklistBusComp(""STC Prod Id Source"");
							with(ProdBCSource)
							{
								SetViewMode(AllView);  
								ClearToQuery();  
								//SetSearchSpec(""Part #"", SrcProdPartNum);
								SetSearchExpr(""[Part #]='""+SrcProdPartNum+""'"");
								ExecuteQuery(ForwardOnly); 
								isProdRecSource = FirstRecord();
								if(isProdRecSource)
								{
									Pick();
								}
							}
							ProdBCTarget = GetPicklistBusComp(""STC Prod Id Target"");
							with(ProdBCTarget)
							{
								SetViewMode(AllView);  
								ClearToQuery();  
								//SetSearchSpec(""Part #"", TargetProdPartNum);
								SetSearchExpr(""[Part #]='""+TargetProdPartNum+""'""); 
								ExecuteQuery(ForwardOnly); 
								isProdRecTarget = FirstRecord();
								if(isProdRecTarget)
								{
									Pick();
								}
							}
							if(!isProdRecSource)
							{
								SetFieldValue(""STC Product Name Source"", SrcProdName);
								SetFieldValue(""STC Part Number Source"", SrcProdPartNum);
							}
							if(!isProdRecTarget)
							{
								SetFieldValue(""STC Product Name Target"", TargetProdName);
								SetFieldValue(""STC Part Number Target"", TargetProdPartNum);
							}
							SetFieldValue(""STC Treatment"", Treatment);
							SetFieldValue(""STC Prod Identifier Source"", SrcIdentifier);
							SetFieldValue(""STC Prod Identifier Target"", TargetIdentifier);
							SetFieldValue(""STC Skip Provisioning"", SkipProvisioning);
							SetFieldValue(""STC Attribute Flag"", AttribFlag);
							SetFieldValue(""STC Parent Part Number Target"", ParentPartNum);
							SetFieldValue(""STC Product Type Custom"", ProdTypeCustom);
							WriteRecord();

						}// end of else 
					}
				}
				vReadFromFile = Clib.fgets(vInputFile);
				vRecCount++;
			}//	while(ReadFromFile)  
		}//End While
   }//try
   
   catch(e)
   { 
		vErrorMessage = e.toString();
		vErrorCode    = e.errCode; 
		LogError(vFileName, vErrorCode, vErrorMessage);
		TheApplication().RaiseErrorText(vErrorMessage);
   }
   finally
   {
		ProdBCSource = null;
		ProdBCTarget = null;
		SMECorpBC = null;
		SMECorpBO = null;
   }
}
function LogError(vFileName,sErrorCode,sErrorMsg)
{
	var sAppObj = TheApplication();
    var sErrorBo = sAppObj.GetBusObject(""STC Error Handler"");
    var sErrorBc = sErrorBo.GetBusComp(""STC Error Handler BC"");
   		with(sErrorBc)
			{
			ActivateField(""Object Name"");
			ActivateField(""Object Type"");
			ActivateField(""Error Code"");
			ActivateField(""Error Message"");
			
			NewRecord(NewAfter);
			SetFieldValue(""Object Name"", ""STC Bulk SME Corp Merger Import Products BS"");
			SetFieldValue(""Object Type"", ""Business Service"");
			SetFieldValue(""Error Code"", sErrorCode);
			SetFieldValue(""Error Message"", sErrorMsg);
			WriteRecord();
			}

			return (ContinueOperation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{

    if( MethodName == ""Import"")
    {
      ImportBulkData( Inputs, Outputs );
      return(CancelOperation);
    }
 return (ContinueOperation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""Resubmit"")
	{
		Resubmit();
		return(CancelOperation);    
	}
	else
	{    
		return(ContinueOperation);
    }
}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}




function Resubmit()
{
	var MRowId="""";
	var Product="""";
	
	/*	WIPRO-Upgrade-02.05.2016-TSINGHALC - Gets the Filename along with Filepath from LOV Description	*/
	
	var svc = TheApplication().GetService(""STC Get Filename"");
	var Inputs = TheApplication().NewPropertySet();
	var Outputs = TheApplication().NewPropertySet();
	Inputs.SetProperty(""Type"",""STC_FILE_NAME"");
	Inputs.SetProperty(""LIC"",""STC_BULK_SR_COMPLETE"");
	svc.InvokeMethod(""STC Get LOV Desc"", Inputs, Outputs);
	var filepath = Outputs.GetProperty(""Description"");
	
	var file = Clib.fopen(filepath, ""rt"");
	
	/* WIPRO-Upgrade-02.05.2016-TSINGHALC - Commented the below line as the filename is received from the above lines by invoking the Generic BS */

	//var file=Clib.fopen(""/siebelfs/SR.csv"", ""rt"");

	if (file==null)
	{
		TheApplication().RaiseErrorText(""Error in opening the file"");
    }
	else
	{
		while(!Clib.feof(file))       
        {
			MRowId = (Clib.fgets(file));  
			MRowId = trim(MRowId);
			var MInputs = TheApplication().NewPropertySet();
			var MOutputs = TheApplication().NewPropertySet();

			MInputs.SetProperty(""ProcessName"",""STC Bulk SR Complete"");
			MInputs.SetProperty(""EntityId"",MRowId); 
			MInputs.SetProperty(""ChildEntityId"",Product);   

			var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");

			MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);
        }
    }
	MWorkflowProc=null;
	MOutputs=null;
	MInputs=null;
	MRowId=null
	file = null;
	filepath = null;
	Outputs = null;
	Inputs = null;
	svc = null;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""Resubmit"")
	{
		Resubmit();
		return(CancelOperation);    
	}
	else
    {    
		return(ContinueOperation);
    }
}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}





function Resubmit()
{
	var MRow="""";
	var MRowId="""";
	var Product="""";
	var Action="""";

	/*	WIPRO-Upgrade-03.05.2016-TSINGHALC - Gets the Filename along with Filepath from LOV Description	*/
	
	var svc = TheApplication().GetService(""STC Get Filename"");
	var Inputs = TheApplication().NewPropertySet();
	var Outputs = TheApplication().NewPropertySet();
	Inputs.SetProperty(""Type"",""STC_FILE_NAME"");
	Inputs.SetProperty(""LIC"",""STC_BULK_SR_COMP_PROCESS"");
	svc.InvokeMethod(""STC Get LOV Desc"", Inputs, Outputs);
	var filepath = Outputs.GetProperty(""Description"");
	
	var file = Clib.fopen(filepath, ""rt"");
	
	/* WIPRO-Upgrade-03.05.2016-TSINGHALC - Commented the below line as the filename is received from the above lines by invoking the Generic BS */

	//var file=Clib.fopen(""/siebelfs/SRComplete.csv"", ""rt"");

	//var file=Clib.fopen(""C:\SRComplete.csv"", ""rt"");

	if (file==null)
    {
		TheApplication().RaiseErrorText(""Error in opening the file"");
    }
	else
    {
		while(!Clib.feof(file))
        {

			MRow = (Clib.fgets(file));  
			MRow = trim(MRow);
			var len = MRow.length;
			var ind1 = MRow.indexOf("","");
			MRowId=MRow.substring(0,ind1);
			MRow = MRow.substring(ind1+1,len);
			var ind2 = MRow .indexOf("","");
			Product = MRow .substring(0,ind2);
			Action = MRow.substring(ind2+1,len);
			var MInputs = TheApplication().NewPropertySet();
			var MOutputs = TheApplication().NewPropertySet();

			if( MRowId != '' || MRowId != null)
			{
				MInputs.SetProperty(""ProcessName"",""STC SR Submit Response WF"");
				MInputs.SetProperty(""EntityId"",MRowId);    
				MInputs.SetProperty(""Status"",Product);
				MInputs.SetProperty(""Description"",Action);

				var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");

				MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);

			}
        }
    }
	MWorkflowProc=null;
	MOutputs=null;
	MInputs=null;
	MRowId=null;
	file = null;
	filepath = null;
	Outputs = null;
	Inputs = null;
	svc = null;

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	try
	{
		if(MethodName == ""UpdateOrderLineItems"")
		{
		var sApp = TheApplication();
			var vOrderId = Inputs.GetProperty(""ActiveOrderId"");
			var vSIM = Inputs.GetProperty(""SIMNumber"");
			var vMNPMSISDN = Inputs.GetProperty(""MNPMSISDN"");
			var oOrderBO = sApp.GetBusObject(""Order Entry (Sales)"");
			var oLineItemsBC = oOrderBO.GetBusComp(""Order Entry - Line Items (Simple)"");
		//	var oLineItemsBC = oOrderBO.GetBusComp(""Order Entry - Line Items"");
			var sAuthCode = sApp.InvokeMethod(""LookupValue"",""S_SUB_AUTH_LEVEL"",""Read All and Write All"");

		var NumBO = sApp.GetBusObject(""RMS NM Number Enquiry_Thin"");
		var NumBC = NumBO.GetBusComp(""RMS NM Number Enquiry_Thin"");
		with(NumBC)
		{
				ActivateField(""Number String Checksum"");
				ClearToQuery();
				SetViewMode(AllView);
				SetSearchSpec(""Number String"",vSIM);
				ExecuteQuery(ForwardOnly);
				if(FirstRecord())
				{
					vSIM = GetFieldValue(""Number String Checksum"");
					
				}
		}
					
			var LineItemId:String ="""";
			with(oLineItemsBC)
			{
				ClearToQuery();
				SetViewMode(AllView);
				ActivateField(""STC ICCID"");
				ActivateField(""STC MNP MSISDN"");
				ActivateField(""STC Authorization Code"");
				SetSearchSpec(""Order Header Id"",vOrderId);
				ExecuteQuery(ForwardOnly);
				if(FirstRecord())
				{
					LineItemId = GetFieldValue(""Root Order Item Id"");
					
				}
				SetSearchSpec(""Id"",LineItemId);
				ExecuteQuery(ForwardOnly);
				if(FirstRecord())
				{
					SetFieldValue(""STC ICCID"",vSIM);
					SetFieldValue(""STC MNP MSISDN"",vMNPMSISDN);
					SetFieldValue(""STC Authorization Code"",sAuthCode);
					WriteRecord();
				}

			}

		return(CancelOperation);
	}
	}
	catch(e)
	{
		
	}
	finally
	{
		oLineItemsBC = null;
		oOrderBO = null;
	}

	return (ContinueOperation);
}
"//Your public declarations go here...
function fun_UpdateOrderLineItems()
{
	
 	
}
"//***********************************************************************************************************//
//Purpose: 1) To Initialize the fields in the BC.
//Author: MANUJ
//Date: 14-May-16
//*************************************************************************************************************//
function Init(Inputs,Outputs)
{
	try
	{
		with(Outputs)
		{
		

			SetProperty(""CPR"","""");
			
		
		
		}

	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
}
"//***********************************************************************************************************//
//Purpose: 1) To Log the exceptions in Custom Error Log Table
//Inputs: Error Message
//Author: Rajitha P G
//Release: R1.0
//Date: 29-Oct-09
//*************************************************************************************************************//
function LogException(e)
{
	var appObj;
  	var psInput;
  	var psOutput;
  	var bsErrorHandler; 
	try
 	{
		  appObj = TheApplication();
		  with(appObj)
		  {
			  psInput = NewPropertySet();
			  psOutput = NewPropertySet();
			  bsErrorHandler = GetService(""STC Generic Error Handler"");
		  }
		  with(psInput)
		  {
			  SetProperty(""Error Code"", e.errCode);
			  SetProperty(""Error Message"", e.errText);
			  SetProperty(""Object Name"", ""STC Business Customer Search BC"");
			  SetProperty(""Object Type"", ""Buisness Service"");
		  }
		  bsErrorHandler.InvokeMethod(""Log Message"", psInput, psOutput);
 	}
 	catch(e)
 	{
  		// do nothing	
 	}
 	finally
 	{
 
		  bsErrorHandler = null;
		  psOutput = null;
		  psInput = null;
		  appObj = null;
 	}
}
function Query(Inputs,Outputs)
{
	try
	{
/*	var Appobj = TheApplication();
	var sPreviousView = Appobj.GetProfileAttr(""sPreview"");
	if(sPreviousView == ""Response View"") 
	  {
	
	var vFstname = TheApplication().GetProfileAttr(""sFstname"");
	var vLstname = TheApplication().GetProfileAttr(""sLstname"");
	var vCamId = TheApplication().GetProfileAttr(""sCampaignId""); //Added by Sudeep for Campaign
	
	var PsOutputs = Appobj.NewPropertySet();
	//Outputs.SetProperty(""First Name"",sFstname);
	//Outputs.SetProperty(""Last Name"",sLstname);
	PsOutputs.SetProperty(""First Name"",vFstname);
	PsOutputs.SetProperty(""Last Name"",vLstname);
	PsOutputs.SetProperty(""STC Campaign Id"",vCamId); //Added by Sudeep for Campaign
	Outputs.AddChild(PsOutputs);
		//PsOutputs.SetProperty(""Contact First Name"",sFstname);
		//PsOutputs.SetProperty(""Contact Last Name"",sLstnmae);
		
	    }*/
	}
	
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
	
	
	
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	var ireturn=ContinueOperation;
	try
	{
		switch(MethodName)
		{
			case ""Init"":
					Init(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
			case ""Query"":
					Query(Inputs,Outputs);
					ireturn = CancelOperation;
					break;

			case ""Update"":
					ireturn = CancelOperation;
					break;
			case ""Insert"":
					ireturn = CancelOperation;
					break;
			case ""PreInsert"":
					ireturn = CancelOperation;
					break;
			case ""Delete"":
					ireturn = CancelOperation;
					break;

			default:
					ireturn = ContinueOperation;
		}
		return(ireturn);
	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
	
}
"//***********************************************************************************************************//
//Purpose: 1) To Initialize the fields in the BC.
//Author: Suman Kanumuri
//Release: Single View
//Date: Mar-02-2013
//*************************************************************************************************************//
function Init(Inputs,Outputs)
{
	try
	{
		with(Outputs)
		{
			SetProperty(""STC Outstand Amount"","""");
			SetProperty(""STC Total BadDept"","""");
			SetProperty(""CANId"","""");
			SetProperty(""DBANId"","""");
			SetProperty(""DBANNum"","""");
			SetProperty(""DBANName"","""");
			SetProperty(""BANType"","""");
			SetProperty(""Current Charges"","""");
			SetProperty(""Previous Carry Forwards"","""");
			SetProperty(""Unbilled Amount"","""");
		}

	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
}
function Insert(Inputs,Outputs)
{
//logPropSet(Inputs, ""InsertInputs.xml"");

}
"//***********************************************************************************************************//
//Purpose: 1) To Log the exceptions in Custom Error Log Table
//Inputs: Error Message
//Author: Suman Kanumuri
//Release: Single View
//Date: Mar-02-2013
//*************************************************************************************************************//
function LogException(e)
{
	var appObj;
  	var psInput;
  	var psOutput;
  	var bsErrorHandler; 
	try
 	{
		  appObj = TheApplication();
		  with(appObj)
		  {
			  psInput = NewPropertySet();
			  psOutput = NewPropertySet();
			  bsErrorHandler = GetService(""STC Generic Error Handler"");
		  }
		  with(psInput)
		  {
			  SetProperty(""Error Code"", e.errCode);
			  SetProperty(""Error Message"", e.errText);
			  SetProperty(""Object Name"", ""STC Busiess OS Amount Query BS"");
			  SetProperty(""Object Type"", ""Buisness Service"");
		  }
		  bsErrorHandler.InvokeMethod(""Log Message"", psInput, psOutput);
 	}
 	catch(e)
 	{
  		// do nothing	
 	}
 	finally
 	{
 
		  bsErrorHandler = null;
		  psOutput = null;
		  psInput = null;
		  appObj = null;
 	}
}
function PopulateDBANDetails(Inputs,Outputs)
{
	var AppObj;
	var InputPS, OutputPS, WFBs, PsChildRec;
	var CANId, EndDate;
	
	AppObj =TheApplication();
	var psRec:PropertySet = AppObj.NewPropertySet();

	try
	{
		CANId = AppObj.GetProfileAttr(""PAttrbCustomerAccountId"");
		InputPS = AppObj.NewPropertySet();
		OutputPS = AppObj.NewPropertySet();
		InputPS.SetProperty(""Object Id"",CANId );
		InputPS.SetProperty(""ProcessName"",""STC Business CAN Total Outstanding WF"" );
		WFBs = AppObj.GetService(""Workflow Process Manager"");
		WFBs.InvokeMethod(""RunProcess"",InputPS,OutputPS);
		var sErrorCode = OutputPS.GetProperty(""Error Code"");	
		var sErrMsg = 	OutputPS.GetProperty(""Error Message"");
		PsChildRec = AppObj.NewPropertySet();
		if(sErrorCode != ""0""){
		if(sErrorCode == ""TECH-ERROR""){
		PsChildRec.SetProperty(""STC Outstand Amount"",""Internal Error Please contact Administrator."");
		}
			Outputs.AddChild(PsChildRec);
			goto End;

		}
		var RespMssgCnt1 = OutputPS.GetPropertyCount();
		var RespmssgCnt2 = OutputPS.GetChild(0);
		var RespMssg = AppObj.NewPropertySet();
		RespMssg = RespmssgCnt2.Copy();
		var RespMssgCnt = RespMssg.GetChildCount();		
		var RespPayLoad = AppObj.NewPropertySet();
		RespPayLoad = RespMssg.GetChild(0).GetChild(0);

		//Added for the exception Handling above
		var ListOfPADetailsView = AppObj.NewPropertySet();
		ListOfPADetailsView = RespPayLoad.GetChild(0);
		//PsChildRec = AppObj.NewPropertySet();
		var PsParentRec = AppObj.NewPropertySet();
		var PADetailsCount = ListOfPADetailsView.GetChildCount();
		var PADetail = AppObj.NewPropertySet();
		
		var InstallmentAmount="""", PAMonthlyCharge="""", PAFirstMonthCharge="""", PATotalCharge="""", PAType= """", InstallmentCycle = """", RemainingNCRValue = """", InstallmentStartdate = """", InstallmentEnddate = """";
		var DBANNum="""", DBANName="""", STCOutstandAmount="""";
		
		for(var i=0;i<PADetailsCount;i++)
		{
			//var PADetail = AppObj.NewPropertySet();
			PsChildRec = AppObj.NewPropertySet();
			PADetail = ListOfPADetailsView.GetChild(i);
			with (PADetail)
			{
				DBANNum = GetProperty(""DBANNum"");
				DBANName = GetProperty(""DBANName"");
				STCOutstandAmount = GetProperty(""STC Outstand Amount"");
		
			}
			with (PsChildRec)
			{
				SetProperty(""DBANNum"",DBANNum);
				SetProperty(""DBANName"",DBANName);
				SetProperty(""STC Outstand Amount"",STCOutstandAmount);	
			}

			Outputs.AddChild(PsChildRec);	
				
			
		}//endfor
		
		
			
	End:
	TheApplication().SetProfileAttr(""GetDBANOutstandingDetails"",""DONE"");
	return(Outputs);
	}
	catch(e)
	{
		LogException(e);
		
		psRec.SetProperty(""STC Outstand Amount"" , ""Error Occurred"");
		psRec.SetProperty(""PAMonthlyCharge"" , e.errCode() + "":"" + e.errText());
		Outputs.AddChild(psRec);
		return(Outputs);
	}
	finally
	{
		PsParentRec = null;
		PsChildRec = null;
		PADetail = null;
		ListOfPADetailsView = null;
		RespPayLoad = null; RespMssg = null;
		RespmssgCnt2 = null;
		psRec = null;
		InputPS = null; OutputPS = null; WFBs = null;
		AppObj = null;
	}

}
"//***********************************************************************************************************//
//Author: Manu Antony
//Release: Single View
//Date: Mar-02-2013
//*************************************************************************************************************//
function Query(Inputs,Outputs)
{
	try
	{
  var sAccBO = TheApplication().GetBusObject(""Single View Account BO"");
  var sBANBc = sAccBO.GetBusComp(""CUT Invoice Sub Accounts"");
  var DBANId = """", DBANNum = """", DBANName="""", OutputPS = """";var PsChildRec = """";
  var CANId = TheApplication().GetProfileAttr(""PAttrbCustomerAccountId"");
  
  if(CANId != """")
  {
  
	//Call DBAN Population Code
  	var FetchDBANDetails = TheApplication().GetProfileAttr(""GetDBANOutstandingDetails"");
	//if(FetchDBANDetails == ""Y"")
	//{
	//OutputPS = TheApplication().NewPropertySet();
	//OutputPS =	PopulateDBANDetails(Inputs,Outputs);
	//Outputs.AddChild(OutputPS);
//	}
	//Call DBAN Population Code
//	if (FetchDBANDetails != ""DONE"" && FetchDBANDetails != ""Y"" )
	//{

if (FetchDBANDetails != ""Y"" )
	{

	   with(sBANBc){
       ActivateField(""STC Corporate Type"");
	   ActivateField(""Master Account Id"")
	   ActivateField(""Account Number"");
	   ActivateField(""Account Status"");
	   ActivateField(""Name"");
       ClearToQuery();
       SetSearchSpec(""STC Corporate Type"",""Department"");
	   SetSearchSpec(""Master Account Id"",CANId);
	   SetSearchSpec(""Account Status"",""Active"");
       SetViewMode(AllView);
     ExecuteQuery(ForwardOnly);
     var count = CountRecords();
     var IsDBANAvail = FirstRecord();
     while(IsDBANAvail)
     {
	 PsChildRec = TheApplication().NewPropertySet();
     DBANId = GetFieldValue(""Id"");
	 DBANNum = GetFieldValue(""Account Number"");
	 DBANName = GetFieldValue(""Name"");
     
    with (PsChildRec)
	{
		SetProperty(""DBANId"",DBANId);
		SetProperty(""DBANNum"",DBANNum);
		SetProperty(""DBANName"",DBANName);
		SetProperty(""CANId"",CANId);
	}
			
	 Outputs.AddChild(PsChildRec);  
     IsDBANAvail = NextRecord();
     }
  
  }//with
	
	}//else
	}

}


catch(e)
 {
		LogException(e);
		var psRec = TheApplication().NewPropertySet();
		psRec.SetProperty(""DBANNum"" , ""Error Occurred"");
		psRec.SetProperty(""STC Outstand Amount"" , e.errCode() + "":"" + e.errText());
		Outputs.AddChild(psRec);
 }
 finally
 {
  sBANBc = null;
  sAccBO = null;
  DBANId = null;
  DBANNum = null;
  PsChildRec = null;
  
 }

	

}
function QueryOld(Inputs,Outputs)
{
	var AppObj;
	var InputPS, OutputPS, WFBs, PsChildRec;
	var CANId, EndDate;
	
	AppObj =TheApplication();
	var psRec:PropertySet = AppObj.NewPropertySet();
	OutputPS = AppObj.NewPropertySet();

	try
	{
	 
	var FetchDBANDetails = AppObj.GetProfileAttr(""GetDBANOutstandingDetails"");
	if(FetchDBANDetails == ""Y"")
	{
	OutputPS =	PopulateDBANDetails(Inputs,Outputs);
	Outputs.AddChild(OutputPS);
	}


	}
	catch(e)
	{
		LogException(e);
		
		psRec.SetProperty(""DBANNum"" , ""Error Occurred"");
		psRec.SetProperty(""STC Outstand Amount"" , e.errCode() + "":"" + e.errText());
		Outputs.AddChild(OutputPS);
	}
	finally
	{
		
		InputPS = null; OutputPS = null; WFBs = null;
		AppObj = null;
	}

}
function Service_InvokeMethod (MethodName, Inputs, Outputs)
{

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	var ireturn;
	try
	{
		switch(MethodName)
		{
			case ""Init"":
					Init(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
			case ""Query"":
					Query(Inputs,Outputs);
					ireturn = CancelOperation;
					break;

			case ""Insert"":
					Insert(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
					
			case ""PreInsert"":
					ireturn = CancelOperation;
					break;
						

			case ""Update"":
					Update(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
	
			case ""Delete"":
					ireturn = CancelOperation;
					break;

			default:
					ireturn = ContinueOperation;
		}
		return(ireturn);
	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
	
}
function Update(Inputs,Outputs)
{
//logPropSet(Inputs, ""UpdateInputs.xml"");

}
function logPropSet(inputPS, fileName) {

  /* var fileSvc = TheApplication().GetService(""EAI XML Write to File"");
   var outPS = TheApplication().NewPropertySet();
   var fileLoc = ""D:\\siebel\\15.9\\Client\\TEMP\\"" + fileName;
   var tmpProp = inputPS.Copy();
   tmpProp.SetProperty(""FileName"", fileLoc);
   fileSvc.InvokeMethod(""WritePropSet"", tmpProp, outPS);
   outPS = null;
   fileSvc = null;
   tmpProp = null;*/

  }
"//***********************************************************************************************************//
//Purpose: 1) To Initialize the fields in the BC.
//Author: Suman Kanumuri
//Release: Single View
//Date: Mar-02-2013
//*************************************************************************************************************//
function Init(Inputs,Outputs)
{
	try
	{
		with(Outputs)
		{
			SetProperty(""STC Outstand Amount"","""");
			SetProperty(""STC Total BadDept"","""");
			SetProperty(""CANId"","""");
			SetProperty(""DBANId"","""");
			SetProperty(""DBANNum"","""");
			SetProperty(""BANType"","""");
			SetProperty(""IBAN"","""");
			SetProperty(""Credit Limit"","""");
			SetProperty(""Previous Carry Forwards"","""");
			SetProperty(""Current Charges"","""");
			SetProperty(""Last Payment Date"","""");
			SetProperty(""Total Amount Due"","""");
			SetProperty(""STC Total Amount"","""");
			SetProperty(""Billed Amount"","""");
			SetProperty(""Overdue Amount"","""");	 
			SetProperty(""IBAN"","""");
			SetProperty(""Unbilled Amount"","""");
			

		}

	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
}
function Insert(Inputs,Outputs)
{
//logPropSet(Inputs, ""InsertInputs.xml"");

}
"//***********************************************************************************************************//
//Purpose: 1) To Log the exceptions in Custom Error Log Table
//Inputs: Error Message
//Author: Manu Antony Jose
//Release: Single View
//Date: Mar-02-2013
//*************************************************************************************************************//
function LogException(e)
{
	var appObj;
  	var psInput;
  	var psOutput;
  	var bsErrorHandler; 
	try
 	{
		  appObj = TheApplication();
		  with(appObj)
		  {
			  psInput = NewPropertySet();
			  psOutput = NewPropertySet();
			  bsErrorHandler = GetService(""STC Generic Error Handler"");
		  }
		  with(psInput)
		  {
			  SetProperty(""Error Code"", e.errCode);
			  SetProperty(""Error Message"", e.errText);
			  SetProperty(""Object Name"", ""STC Busiess OS Amount Query BS"");
			  SetProperty(""Object Type"", ""Buisness Service"");
		  }
		  bsErrorHandler.InvokeMethod(""Log Message"", psInput, psOutput);
 	}
 	catch(e)
 	{
  		// do nothing	
 	}
 	finally
 	{
 
		  bsErrorHandler = null;
		  psOutput = null;
		  psInput = null;
		  appObj = null;
 	}
}
function PopulateIBANDetails(Inputs,Outputs)
{
		try
	{
		
		var AppObj = """";
		var AccountBC;
		var VoucherNumber;
		var StrSRId;
		var ErrMsg = """";
		var sTotalBANAmount;
		var sTotalBadDebtAmount;
		var AccountId;
		var x = 0; 
		var PsChildRec="""";
		
		AppObj = TheApplication();
		AccountId = AppObj.GetProfileAttr(""PAttrbCustomerAccountId"");		
		var DBANNum = AppObj.GetProfileAttr(""DBANNum"");
		if(AccountId != """" && DBANNum != """")
		{
		var psRec:PropertySet = AppObj.NewPropertySet();
		var SiebelMsg:PropertySet = AppObj.NewPropertySet();
		var	InputPS:PropertySet = AppObj.NewPropertySet();
		var	OutputPS:PropertySet = AppObj.NewPropertySet();
		InputPS.SetProperty(""ParentBAN"",DBANNum );
		InputPS.SetProperty(""Operation"",""POPULATEINDIVIDUALBAN"" );
		InputPS.SetProperty(""Object Id"",AccountId );
		InputPS.SetProperty(""ProcessName"",""STC Business CAN Total Outstanding WF"");
		var	WFBs = AppObj.GetService(""Workflow Process Manager"");
		WFBs.InvokeMethod(""RunProcess"",InputPS,OutputPS);
		var errcode = OutputPS.GetProperty(""Error Code"");
        var errdesc = OutputPS.GetProperty(""Error Message"");
		if(errcode != 0)
            {              		
				with(psRec)
					{
					SetProperty(""MSISDN"",""Exception"");
					SetProperty(""IBAN"", ""Ensure there are postpaid individual Billing Accounts under the DBAN or else could be error while fetching Outstanding Amount. Please try again later."");
					}
					Outputs.AddChild(psRec);
					return(Outputs);
					goto End;
            }

		SiebelMsg = OutputPS;
		
   		var vType = SiebelMsg.GetChild(0).GetType();
  		 if(vType == ""SiebelMessage"")
         {
            var nodTemp11 = SiebelMsg.GetChild(0).GetChild(0).GetChild(0);
            var errcode = nodTemp11.GetProperty(""Household Size"");
            var errdesc = nodTemp11.GetProperty(""Access Level"");
            if(errcode != 0)
            {              		
				with(psRec)
					{
					SetProperty(""MSISDN"",""Exception"");
					SetProperty(""IBAN"", ""Error while fetching Outstanding Amount. Please try again later"");
					}
					Outputs.AddChild(psRec);
					return(Outputs);
					goto End;
            }
          }
 	
			var Count:Number = nodTemp11.GetChild(0).GetChildCount();//Billing Account Count
			for(var i:Number=0;i<Count;i++)
					{
                 		nodTemp11 = SiebelMsg.GetChild(0).GetChild(0).GetChild(0).GetChild(0).GetChild(x);
	                 	var STCOutstandAmount = nodTemp11.GetProperty(""STC Outstand Amount"");
	                 	var UnbilledAmount = nodTemp11.GetProperty(""Unbilled Amount"");
						var CurrentBillAmount = nodTemp11.GetProperty(""CurrentBillAmount"");
						var BillDueDate = nodTemp11.GetProperty(""BillDueDate"");
						var CreditLimit = nodTemp11.GetProperty(""Credit Limit"");
						var MinimumPayableAmount = nodTemp11.GetProperty(""MinimumPayableAmount"");
						var OverdueAmount = nodTemp11.GetProperty(""Overdue Amount"");
						var IBAN =  nodTemp11.GetProperty(""IBAN"");
						var BilledAmount =  nodTemp11.GetProperty(""Billed Amount"");
						var TotalAmountDue =  nodTemp11.GetProperty(""Total Amount Due"");
						var PreviousCarryForwards =  nodTemp11.GetProperty(""Previous Carry Forwards"");
						var CurrentCharges =  nodTemp11.GetProperty(""Current Charges"");
						var LastPaymentDate =  nodTemp11.GetProperty(""Last Payment Date"");	
						var CountSAN:Number = nodTemp11.GetChild(0).GetChildCount(); //SAN Count   
					  	for(var j:Number=0;j<CountSAN;j++)
	           			{          					        
							PsChildRec = AppObj.NewPropertySet();					
		                 	var nodTemp1 = nodTemp11.GetChild(0).GetChild(j);                 	                		            
		                 	var MSISDN = nodTemp1.GetProperty(""MSISDN"");		           
							with (PsChildRec)
							{
				
								SetProperty(""IBAN"",IBAN);
								SetProperty(""MSISDN"",MSISDN);
								SetProperty(""BAN Number"",IBAN);
								SetProperty(""STC Outstand Amount"", STCOutstandAmount);
								SetProperty(""Total Amount Due"",TotalAmountDue);	
								SetProperty(""Due Date"", BillDueDate);
								SetProperty(""Credit Limit"", CreditLimit);
								SetProperty(""MinimumPayableAmount"", MinimumPayableAmount);
								SetProperty(""Overdue Amount"", OverdueAmount);
								SetProperty(""Billed Amount"", BilledAmount);							
								SetProperty(""Unbilled Amount"", UnbilledAmount);
								SetProperty(""Previous Carry Forwards"", PreviousCarryForwards);
								SetProperty(""Current Charges"", CurrentCharges);
								SetProperty(""Last Payment Date"", LastPaymentDate);
					
							}
							Outputs.AddChild(PsChildRec);	
		                 }

                 	x++;
                 }
		return(Outputs);
		End:
	}
}
	catch(e)
	{
		with(psRec)
		{
			SetProperty(""MSISDN"",""Exception"");
			SetProperty(""IBAN"", ""Exception Occurred Calling Oustanding Service"");
			
		}
		Outputs.AddChild(psRec);
		return(Outputs);
	}
	finally
	{
	}
}
function PopulateIBANDetailsOld(Inputs,Outputs)
{
	var AppObj;
	var InputPS, OutputPS, WFBs, PsChildRec;
	var CANId, EndDate, FetchIBAN;
	
	AppObj =TheApplication();
	var psRec:PropertySet = AppObj.NewPropertySet();

	try
	{
	    
		CANId = AppObj.GetProfileAttr(""PAttrbCustomerAccountId"");
		
		var DBANNum = AppObj.GetProfileAttr(""DBANNum"");
		if(CANId != """" && DBANNum != """")
		{
	
		InputPS = AppObj.NewPropertySet();
		OutputPS = AppObj.NewPropertySet();
		InputPS.SetProperty(""Object Id"",CANId );
		InputPS.SetProperty(""ParentBAN"",DBANNum );
		InputPS.SetProperty(""Operation"",""POPULATEINDIVIDUALBAN"" );
		InputPS.SetProperty(""ProcessName"",""STC Business CAN Total Outstanding WF"" );
		WFBs = AppObj.GetService(""Workflow Process Manager"");
		WFBs.InvokeMethod(""RunProcess"",InputPS,OutputPS);
		
		var RespMssgCnt1 = OutputPS.GetPropertyCount();
		var RespmssgCnt2 = OutputPS.GetChild(0);
		var RespMssg = AppObj.NewPropertySet();
		RespMssg = RespmssgCnt2.Copy();
		var RespMssgCnt = RespMssg.GetChildCount();		
		var RespPayLoad = AppObj.NewPropertySet();
		RespPayLoad = RespMssg.GetChild(0).GetChild(0);
		/*
		//Added for the exception Handling below
		var sErrorCode = RespPayLoad.GetProperty(""ErrorCode"");	
		var sErrMsg = 	RespPayLoad.GetProperty(""ErrorMessage"");		
		//Added for the exception Handling above
		PsChildRec = AppObj.NewPropertySet();
		//Added for the exception Handling below
		if(sErrorCode != ""0""){
			if(sErrorCode == ""TE_003"")
				PsChildRec.SetProperty(""InstallmentAmount"",""Internal Error Please contact AIA team."");
			else if(sErrorCode == '' || sErrorCode == """")
			{
			PsChildRec.SetProperty(""InstallmentAmount"",""There is no Payment Arrangement created for this BAN."");
			}
			else
			{
				PsChildRec.SetProperty(""InstallmentAmount"",sErrMsg);
			}
			Outputs.AddChild(PsChildRec);
			goto End;
	*/

		//Added for the exception Handling above
		var ListOfPADetailsView = AppObj.NewPropertySet();
		ListOfPADetailsView = RespPayLoad.GetChild(0);
		//PsChildRec = AppObj.NewPropertySet();
		var PsParentRec = AppObj.NewPropertySet();
		var PADetailsCount = ListOfPADetailsView.GetChildCount();
		var PADetail = AppObj.NewPropertySet();
		
		var InstallmentAmount="""", PAMonthlyCharge="""", PAFirstMonthCharge="""", PATotalCharge="""", PAType= """", InstallmentCycle = """", RemainingNCRValue = """", InstallmentStartdate = """", InstallmentEnddate = """";
		var DBANNum="""", STCOutstandAmount="""", IBAN = """";
		
		for(var i=0;i<PADetailsCount;i++)
		{
			//var PADetail = AppObj.NewPropertySet();
			PsChildRec = AppObj.NewPropertySet();
			PADetail = ListOfPADetailsView.GetChild(i);
			with (PADetail)
			{
				DBANNum = GetProperty(""DBANNum"");
				STCOutstandAmount = GetProperty(""STC Outstand Amount"");
				IBAN = GetProperty(""IBAN"");
				
		
			}
			with (PsChildRec)
			{
				SetProperty(""DBANNum"",DBANNum);
				SetProperty(""STC Outstand Amount"",STCOutstandAmount);
				SetProperty(""IBAN"",IBAN);
					
			}

			Outputs.AddChild(PsChildRec);	
				
			
		}//endfor
			return(Outputs);
	End:
	}
	}
	catch(e)
	{
		LogException(e);
		
		psRec.SetProperty(""InstallmentAmount"" , ""Error Occurred"");
		psRec.SetProperty(""PAMonthlyCharge"" , e.errCode() + "":"" + e.errText());
		Outputs.AddChild(psRec);
		return(Outputs);
	}
	finally
	{
		PsParentRec = null;
		PsChildRec = null;
		PADetail = null;
		ListOfPADetailsView = null;
		RespPayLoad = null; RespMssg = null;
		RespmssgCnt2 = null;
		psRec = null;
		InputPS = null; OutputPS = null; WFBs = null;
		AppObj = null;
	}

}
function Query(Inputs,Outputs)
{
	var AppObj;
	var InputPS, OutputPS, WFBs, PsChildRec, FetchIBAN;
	var CANId, EndDate;
	
	AppObj =TheApplication();
	var psRec:PropertySet = AppObj.NewPropertySet();
	OutputPS = AppObj.NewPropertySet();

	try
	{
	 var SingleViewSearchTriggered = AppObj.GetProfileAttr(""SingleViewSearchTriggered"");
	if(SingleViewSearchTriggered != ""Y"")
	{
	PopulateIBANDetails(Inputs,Outputs);
	AppObj.SetProfileAttr(""GetDBANOutstandingDetails"",""DONE"");
	}
	if(SingleViewSearchTriggered == ""Y"")
	{
	AppObj.SetProfileAttr(""SingleViewSearchTriggered"",""N"");
	}
	}
	catch(e)
	{
		LogException(e);
		
		psRec.SetProperty(""DBANNum"" , ""Error Occurred"");
		psRec.SetProperty(""CurrentBillAmount"" , e.errCode() + "":"" + e.errText());
		Outputs.AddChild(psRec);
	}
	finally
	{
		
		InputPS = null; OutputPS = null; WFBs = null;
		AppObj = null;
	}

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	var ireturn;
	try
	{
		switch(MethodName)
		{
			case ""Init"":
					Init(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
			case ""Query"":
					Query(Inputs,Outputs);
					ireturn = CancelOperation;
					break;

			case ""Insert"":
					Insert(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
					
			case ""PreInsert"":
					ireturn = CancelOperation;
					break;
						

			case ""Update"":
					Update(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
	
			case ""Delete"":
					ireturn = CancelOperation;
					break;

			default:
					ireturn = ContinueOperation;
		}
		return(ireturn);
	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
	
}
function Update(Inputs,Outputs)
{
//logPropSet(Inputs, ""UpdateInputs.xml"");

}
function logPropSet(inputPS, fileName) {

   var fileSvc = TheApplication().GetService(""EAI XML Write to File"");
   var outPS = TheApplication().NewPropertySet();
   var fileLoc = ""D:\\siebel\\15.9\\Client\\TEMP\\"" + fileName;
   var tmpProp = inputPS.Copy();
   tmpProp.SetProperty(""FileName"", fileLoc);
   fileSvc.InvokeMethod(""WritePropSet"", tmpProp, outPS);
   outPS = null;
   fileSvc = null;
   tmpProp = null;

  }
function AssociateCANVATAddress(Inputs,Outputs)
{
 var sBillAccntId;
 var isRecord;
 var sConPriAddrId;
 var sCopyAddress;//NEW
 var sAccountType;//NEW
 var sContactId;
 var bcAddrMVG;
 var bcAddrAssoc;
 var bcContactMVG;
 var bcContactAssoc;
 var sCustAccntId;
 var appObj;
 var bcAcnt;
 var boAccount;
 var bcAccount;
 var bcContact;
 var sAccntId;
 var NewAddressId;
 var Operation;
 try
 {
   appObj = TheApplication();
   with(Inputs)
   {
    
    sBillAccntId = GetProperty(""BillingAccountId"");
    sConPriAddrId = GetProperty(""PrimaryAddrId"");
    sContactId = GetProperty(""PrimaryCustId"");
    sCustAccntId = GetProperty(""sCustAccntId"");
    sAccntId = GetProperty(""sAccntId"");
    NewAddressId = GetProperty(""NewAddressId"");
    Operation = GetProperty(""Operation"");
    
   }   
                    var spec = ""[Account Id]= '"" + sCustAccntId + ""' AND [STC Address Type] = 'VAT'"";
                    if (sCustAccntId != """" && sCustAccntId != null )
                    {
        var CUTAddrBO = TheApplication().GetBusObject(""STC Account Address Thin BO"");
 var CUTAddrBC = CUTAddrBO.GetBusComp(""STC CUT Address Thin"");

 with(CUTAddrBC)
 {
 ActivateField(""Account Id"");
 ActivateField(""STC Address Type"");
 ActivateField(""Address Id"");
 ClearToQuery();
 SetViewMode(AllView);
 SetSearchExpr(spec);
 ExecuteQuery(ForwardOnly);
 var count = CountRecords();
 var isVATAddrAvailable = FirstRecord();
  if(isVATAddrAvailable)
  {
  NewAddressId = GetFieldValue(""Address Id"");

  }

                    }

}
   if(Operation == ""SINGlEACCOUNTASSOCIATION"")
   {
   if(sAccntId != """" && sAccntId != null && NewAddressId != """" && NewAddressId != null)
   {
    boAccount = appObj.GetBusObject(""STC Account Address Thin BO"");
    bcAcnt = boAccount.GetBusComp(""STC Account Address Thin"");
    with(bcAcnt)
    {
     ActivateField(""Type"");
      SetViewMode(AllView);
     ClearToQuery();
     SetSearchSpec(""Id"",sAccntId);
     ExecuteQuery(ForwardOnly);
     isRecord = FirstRecord();                                                                             
     if(isRecord)
     {
     sAccountType = GetFieldValue(""Type"");
      if(sAccountType == ""Corporate"" || sAccountType == ""SME"")
     {

      bcAddrMVG = GetMVGBusComp(""Street Address"");
      with(bcAddrMVG)
      {
       bcAddrAssoc = GetAssocBusComp();
       with(bcAddrAssoc)
       {
        SetViewMode(AllView);
        ClearToQuery();
        SetSearchSpec(""Id"",NewAddressId);
        ExecuteQuery(ForwardOnly);
        isRecord = FirstRecord();                                                                             
        if(isRecord)
        {
                                                        try{
           Associate(NewAfter);
                                                           }
catch(e)
{

}
                                                      
                                                      
        }
       }
       WriteRecord();
      }
     
     }
   }
  } 
 }
 
 }
 else if(Operation == ""ALLACCOUNTASSOCIATION"")
 {
 
 if(NewAddressId != """" && NewAddressId != null && sCustAccntId != """" && sCustAccntId != null )
   {
    var spec = ""[Master Account Id] = '""+sCustAccntId+""' AND ([Account Type Code] = 'Customer' OR [Account Type Code] = 'Billing' OR [Account Type Code] = 'Service')"";

    boAccount = appObj.GetBusObject(""STC Account Address Thin BO"");
    bcAcnt = boAccount.GetBusComp(""STC Account Address Thin"");
    with(bcAcnt)
    {
     ActivateField(""Type"");
      ActivateField(""Master Account Id"");
     ActivateField(""Street Address"");
     SetViewMode(AllView);
     ClearToQuery();
     SetSearchExpr(spec);
     ExecuteQuery(ForwardOnly);
     var count = CountRecords();
     isRecord = FirstRecord(); 
                                                                                 
     while(isRecord)
     {
                    sAccountType = GetFieldValue(""Type"");
      if(sAccountType == ""Corporate"" || sAccountType == ""SME"")
     {

      bcAddrMVG = GetMVGBusComp(""Street Address"");
      with(bcAddrMVG)
      {
       bcAddrAssoc = GetAssocBusComp();
       with(bcAddrAssoc)
       {
        SetViewMode(AllView);
        ClearToQuery();
        SetSearchSpec(""Id"",NewAddressId);
        ExecuteQuery(ForwardOnly);
        isRecord = FirstRecord();                                                                             
        if(isRecord)
        {
       
             try 
          {
             Associate(NewAfter);
                                        }
          catch(e)
          {
          
          }
                                    
                         
                                                     
        }
       }
       WriteRecord();
      }
     
     }
                         isRecord= NextRecord(); 

   }
  } 
 }
 
 }
 }
 catch(e)
 {
  LogException(e);
 }
 finally
 {
  bcAddrMVG = null;
  bcAddrAssoc = null;
  bcContactMVG = null;
  bcContactAssoc = null;
  bcAcnt = null;
  boAccount = null;
   appObj = null;
 }

}
function AssociateVATAddress(Inputs,Outputs)
{
 var sBillAccntId;
 var isRecord;
 var sConPriAddrId;
 var sCopyAddress;//NEW
 var sAccountType;//NEW
 var sContactId;
 var bcAddrMVG;
 var bcAddrAssoc;
 var bcContactMVG;
 var bcContactAssoc;
 var sCustAccntId;
 var appObj;
 var bcAcnt;
 var boAccount;
 var bcAccount;
 var bcContact;
 var sAccntId;
 var NewAddressId;
 var Operation;
 try
 {
   appObj = TheApplication();
   with(Inputs)
   {
    
    sBillAccntId = GetProperty(""BillingAccountId"");
    sConPriAddrId = GetProperty(""PrimaryAddrId"");
    sContactId = GetProperty(""PrimaryCustId"");
    sCustAccntId = GetProperty(""sCustAccntId"");
    sAccntId = GetProperty(""sAccntId"");
    NewAddressId = GetProperty(""NewAddressId"");
    Operation = GetProperty(""Operation"");
    
   }   
   if(Operation == ""SINGlEACCOUNTASSOCIATION"")
   {
   if(sAccntId != """" && sAccntId != null && NewAddressId != """" && NewAddressId != null)
   {
    boAccount = appObj.GetBusObject(""STC Account Address Thin BO"");
    bcAcnt = boAccount.GetBusComp(""STC Account Address Thin"");
    with(bcAcnt)
    {
     ActivateField(""Type"");
      SetViewMode(AllView);
     ClearToQuery();
     SetSearchSpec(""Id"",sAccntId);
     ExecuteQuery(ForwardOnly);
     isRecord = FirstRecord();                                                                             
     if(isRecord)
     {
     sAccountType = GetFieldValue(""Type"");
      if(sAccountType == ""Corporate"" || sAccountType == ""SME"")
     {

      bcAddrMVG = GetMVGBusComp(""Street Address"");
      with(bcAddrMVG)
      {
       bcAddrAssoc = GetAssocBusComp();
       with(bcAddrAssoc)
       {
        SetViewMode(AllView);
        ClearToQuery();
        SetSearchSpec(""Id"",NewAddressId);
        ExecuteQuery(ForwardOnly);
        isRecord = FirstRecord();                                                                             
        if(isRecord)
        {
                                                        try{
           Associate(NewAfter);
                                                           }
catch(e)
{

}
                                                      
                                                      
        }
       }
       WriteRecord();
      }
     
     }
   }
  } 
 }
 
 }
 else if(Operation == ""ALLACCOUNTASSOCIATION"")
 {
 
 if(NewAddressId != """" && NewAddressId != null && sCustAccntId != """" && sCustAccntId != null )
   {
    var spec = ""[Master Account Id] = '""+sCustAccntId+""' AND ([Account Type Code] = 'Customer' OR [Account Type Code] = 'Billing' OR [Account Type Code] = 'Service')"";

    boAccount = appObj.GetBusObject(""STC Account Address Thin BO"");
    bcAcnt = boAccount.GetBusComp(""STC Account Address Thin"");
    with(bcAcnt)
    {
     ActivateField(""Type"");
      ActivateField(""Master Account Id"");
     ActivateField(""Street Address"");
     SetViewMode(AllView);
     ClearToQuery();
     SetSearchExpr(spec);
     ExecuteQuery(ForwardOnly);
     var count = CountRecords();
     isRecord = FirstRecord(); 
                                                                                 
     while(isRecord)
     {
                    sAccountType = GetFieldValue(""Type"");
      if(sAccountType == ""Corporate"" || sAccountType == ""SME"")
     {

      bcAddrMVG = GetMVGBusComp(""Street Address"");
      with(bcAddrMVG)
      {
       bcAddrAssoc = GetAssocBusComp();
       with(bcAddrAssoc)
       {
        SetViewMode(AllView);
        ClearToQuery();
        SetSearchSpec(""Id"",NewAddressId);
        ExecuteQuery(ForwardOnly);
        isRecord = FirstRecord();                                                                             
        if(isRecord)
        {
       
             try 
          {
             Associate(NewAfter);
                                        }
          catch(e)
          {
          
          }
                                    
                         
                                                     
        }
       }
       WriteRecord();
      }
     
     }
                         isRecord= NextRecord(); 

   }
  } 
 }
 
 }
 }
 catch(e)
 {
  LogException(e);
 }
 finally
 {
  bcAddrMVG = null;
  bcAddrAssoc = null;
  bcContactMVG = null;
  bcContactAssoc = null;
  bcAcnt = null;
  boAccount = null;
   appObj = null;
 }

}
function LogException(e)
{
 var appObj;
   var psInput;
   var psOutput;
   var bsErrorHandler; 
 try
  {
    appObj = TheApplication();
    with(appObj)
    {
     psInput = NewPropertySet();
     psOutput = NewPropertySet();
     bsErrorHandler = GetService(""STC Generic Error Handler"");
    }
    with(psInput)
    {
     SetProperty(""Error Code"", e.errCode);
     SetProperty(""Error Message"", e.errText);
     SetProperty(""Object Name"", ""STC Business VAT Registration BS"");
     SetProperty(""Object Type"", ""BusinessService"");
    }
    bsErrorHandler.InvokeMethod(""Log Message"", psInput, psOutput);
  }
  catch(e)
  {
    // do nothing 
  }
  finally
  {
 
    bsErrorHandler = null;
    psOutput = null;
    psInput = null;
    appObj = null;
  }
}
function PickVATAddress(Inputs,Outputs)
{

try
{
 
var SRId = """", CANId  = """";
with(Inputs)
{
SRId  = GetProperty(""SRId"");
CANId = GetProperty(""sCustAccntId"");
}
var NewAddressId = """";
var spec = ""[Account Id]= '"" + CANId + ""' AND [STC Address Type] = 'VAT'"";
var SRBC = TheApplication().GetBusObject(""Service Request"").GetBusComp(""Service Request"");

if( SRId != """" && SRId != null && CANId != """" && CANId != null )
{
 var CUTAddrBO = TheApplication().GetBusObject(""STC Account Address Thin BO"");
 var CUTAddrBC = CUTAddrBO.GetBusComp(""STC CUT Address Thin"");

 with(CUTAddrBC)
 {
 ActivateField(""Account Id"");
 ActivateField(""STC Address Type"");
 ActivateField(""Address Id"");
 ClearToQuery();
 SetViewMode(AllView);
 SetSearchExpr(spec);
 ExecuteQuery(ForwardOnly);
 var count = CountRecords();
 var isVATAddrAvailable = FirstRecord();
  if(isVATAddrAvailable)
  {
  NewAddressId = GetFieldValue(""Address Id"");

  }
 }
if(NewAddressId != """" && NewAddressId != null)
{
with(SRBC)
{
  ActivateField(""STC Address"");
  SetViewMode(AllView);
  ClearToQuery();
  SetSearchSpec(""Id"", SRId);
  ExecuteQuery(ForwardOnly);
  var SRRec = FirstRecord();
  if(SRRec)
  {
   var PickBC = GetPicklistBusComp(""STC Address"");
   with (PickBC) 
   {
   ClearToQuery();
   SetViewMode(AllView);
   SetSearchSpec(""Id"", NewAddressId);
   ExecuteQuery(ForwardOnly);
   if(FirstRecord()) 
   {
    try
    {
    Pick();
    }
    catch(e)
    {
          
    }
   }
   
   }
   WriteRecord();
  InvokeMethod(""RefreshRecord"");
  }
}
}
}
}
 catch(e)
 {
  throw(e);
 }
 finally
 {
 PickBC = null;
 CUTAddrBC = null;
 CUTAddrBO = null;

 }

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 if(MethodName == ""AssociateVATAddress""){
  AssociateVATAddress(Inputs,Outputs);
  return CancelOperation;
 }


 if(MethodName == ""PickVATAddress""){
  PickVATAddress(Inputs,Outputs);
  return CancelOperation;
 }

 if(MethodName == ""AssociateCANVATAddress""){
  AssociateCANVATAddress(Inputs,Outputs);
  return CancelOperation;
 }




 return (ContinueOperation);
}
"//***********************************************************************************************************//
//Purpose: 1) To Initialize the fields in the BC.
//Author: Suman Kanumuri
//Release: Single View
//Date: Mar-02-2013
//*************************************************************************************************************//
function Init(Inputs,Outputs)
{
	try
	{
		with(Outputs)
		{
			SetProperty(""STC Outstand Amount"","""");
			SetProperty(""STC Total BadDebt"","""");
			SetProperty(""SANId"","""");
			SetProperty(""MSISDN"","""");
			SetProperty(""Due Date"","""");
			SetProperty(""Credit Limit"","""");
			SetProperty(""MinimumPayableAmount"","""");
			SetProperty(""Overdue Amount"","""");
		
		}

	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
}
"//***********************************************************************************************************//
//Purpose: 1) To Initialize the fields in the BC.
//Author: Suman Kanumuri
//Release: Single View
//Date: Mar-02-2013
//*************************************************************************************************************//
function Insert(Inputs,Outputs)
{
	try
	{
		with(Outputs)
		{
		
		
		}

	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
}
"//***********************************************************************************************************//
//Purpose: 1) To Log the exceptions in Custom Error Log Table
//Inputs: Error Message
//Author: Suman Kanumuri
//Release: Single View
//Date: Mar-02-2013
//*************************************************************************************************************//
function LogException(e)
{
	var appObj;
  	var psInput;
  	var psOutput;
  	var bsErrorHandler; 
	try
 	{
		  appObj = TheApplication();
		  with(appObj)
		  {
			  psInput = NewPropertySet();
			  psOutput = NewPropertySet();
			  bsErrorHandler = GetService(""STC Generic Error Handler"");
		  }
		  with(psInput)
		  {
			  SetProperty(""Error Code"", e.errCode);
			  SetProperty(""Error Message"", e.errText);
			  SetProperty(""Object Name"", ""STC CAN Outstanding Amount Query BS"");
			  SetProperty(""Object Type"", ""Buisness Service"");
		  }
		  bsErrorHandler.InvokeMethod(""Log Message"", psInput, psOutput);
 	}
 	catch(e)
 	{
  		// do nothing	
 	}
 	finally
 	{
 
		  bsErrorHandler = null;
		  psOutput = null;
		  psInput = null;
		  appObj = null;
 	}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	var ireturn;
	try
	{
		switch(MethodName)
		{
			case ""Init"":
					Init(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
			case ""Query"":
					ireturn = CancelOperation;
					break;
					
			case ""PreInsert"":
					ireturn = CancelOperation;
					break;
							
			case ""Insert"":
					Insert(Inputs,Outputs);
					ireturn = CancelOperation;
					break;

			case ""Update"":
					ireturn = CancelOperation;
					break;
	
			case ""Delete"":
					ireturn = CancelOperation;
					break;

			default:
					ireturn = ContinueOperation;
		}
		return(ireturn);
	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
	
}
"/*function LogException(e)
{

	var appObj;
  	var Input;
  	var Output;
  	var CallMessageHandler; 
	try
 	{
		  appObj = TheApplication();
		  Input = appObj.NewPropertySet();
		  Output = appObj.NewPropertySet();
		  CallMessageHandler = appObj.GetService(""STC Generic Error Handler""); 
		  Input.SetProperty(""Error Code"", e.errCode);
		  Input.SetProperty(""Error Message"", e.errText);
		  Input.SetProperty(""Object Name"", ""STC Calculate Corporate Credit Limit"");
		  Input.SetProperty(""Object Type"", ""Business Service"");
		  CallMessageHandler.InvokeMethod(""Log Message"", Input, Output);
 	}
 	catch(e)
 	{
  		
 	}
 	finally
 	{
 		  Output = null;
		  Input = null;
		  CallMessageHandler = null;
		  appObj = null;
 	}
}*/"
function CreditLimit(Inputs,Outputs)
{
	var oldChildCL;
	var newChildCL = 0;
	try
	{
				var appObj = TheApplication();
				with(appObj)
				{
		         	
		         		var parentBO = appObj.GetBusObject(""STC Billing Account"");
		         		var parentBC = parentBO.GetBusComp(""CUT Invoice Sub Accounts"");
		         		var childBC  = parentBO.GetBusComp(""STC Child Billing Accounts"");
		         		var BillAccountId = Inputs.GetProperty(""ParentBillingAccId"");//[MANUJ] : [Department Account]
						var IBANId = Inputs.GetProperty(""IBANId"");//[MANUJ] : [Individual Account]
		         		
						var DefCL = ToNumber(Inputs.GetProperty(""DefCL""));
		         		
		         		 with(parentBC)
		         		 {
		         		   SetViewMode(AllView);
		         		   ActivateField(""Id"");
		         		   ClearToQuery();
		         		   SetSearchSpec(""Id"",BillAccountId);
			               ExecuteQuery(ForwardOnly);
			               var sfRec1 = FirstRecord();
			               if(sfRec1)
			               {
		         		
		         		  var parentCL = ToNumber(GetFieldValue(""Credit Score""));  //[MANUJ]: [Credit Limit      		
		         		with(childBC)
		         		{
		         		  
		         		  SetViewMode(AllView);
		         	      ActivateField(""Parent Account Id"");
		         	      ActivateField(""Credit Score"");
		              	  ActivateField(""STC Corporate Type"");
		              	  ClearToQuery();
			              //SetSearchSpec(""Parent Account Id"", BillAccountId);
						  var StrSearch = ""[Parent Account Id] = '"" + BillAccountId + ""' AND [Id] <> '"" + IBANId + ""'""; 
						  SetSearchExpr(StrSearch);
			              ExecuteQuery(ForwardOnly);
			              var sfRec = FirstRecord();
			              var totalChildCL = 0;	
		      			  while(sfRec)
		                  {
		                    var corpType = ParentBusComp().GetFieldValue(""STC Corporate Type"");
		                    if ( corpType == ""Department"" )
		                    {
		                                          
		         		       totalChildCL = ToNumber(totalChildCL) + ToNumber(GetFieldValue(""Credit Score""));
		         			   
		         		     
		                      		                        
		                      }
		         		        sfRec = NextRecord();
		         		      
		         	      } //end of while
							   totalChildCL = ToNumber(totalChildCL) + ToNumber(DefCL); 
		         	     } //end of if
		         	      var balCL = parentCL - totalChildCL ;
		         	      	if ( balCL < DefCL )
		         	      	{
		         	      	   Outputs.SetProperty(""Result"",""INSUFFICIENT"");
							   balCL = 0 - ToNumber(balCL);
							   Outputs.SetProperty(""balCL"",balCL);
		         	      	 }

							 else
							 {
							  Outputs.SetProperty(""Result"",""SUFFICIENT"");
							 }
		         			
		         	  		            
		        	    } //end of with(childBC)
		        	  } //end of with(parentBC)
		         	     
                      } //end of with(appObj)
		     
       	}	            
	catch(e)
	{
	 	throw(e);
	}
	finally
	{
	    childBC = null;
	    parentBC = null;
	    parentBO = null;
		appObj = null;
	}
	  
}
"/*function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{

    	CreditLimit(Inputs, Outputs);
    	return(CancelOperation);
}  */
	function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	
	var ireturn;
	try
	{
		
	switch(MethodName)
		{
			case ""CreditLimit"":
					CreditLimit(Inputs,Outputs);
					ireturn =CancelOperation;
					break;
			default:
					ireturn = ContinueOperation;
					break;
			}
	return(ireturn);
	}
	catch(e)
	{
	throw(e);
	}
	finally
	{
	}
	return(CancelOperation);
}
function DERESERVE ()
{
  var sDealerName = """";//LOV
  var sCategory = """";
  var ReserveEndDate = """";
  var IDNum = """";
  var MSISDN = """";
  var appObj = TheApplication();
  var spec = ""([Status] = 'RESERVED' OR [Status] = 'Reserved') AND [Special Category Type] = 'CloudPBX'"";
//var spec = ""([Status] = 'RESERVED' OR [Status] = 'Reserved') AND [Special Category Type] = 'CloudPBX'  AND ([Number String] = '97399009092'))"";

  try{
  var sRMSBO = TheApplication().GetBusObject(""RMS NM Number Enquiry_Thin"");
  var sRMSBc = sRMSBO.GetBusComp(""RMS NM Number Enquiry_Thin"");
  
  with(sRMSBc){
  ActivateField(""Special Category Type"");
  ActivateField(""Status"");
  ActivateField(""CPBX Customer ID Num"");
  ActivateField(""Number String"");
  ActivateField(""Reservation End Date"");
  ClearToQuery();
  SetViewMode(AllView);
  SetSearchExpr(spec);
  ExecuteQuery(ForwardOnly);
  var count = CountRecords();
  var IsMSISDNAvail = FirstRecord();
   while(IsMSISDNAvail){
    ReserveEndDate = GetFieldValue(""Reservation End Date"");//ReservationEndDate
	IDNum = GetFieldValue(""CPBX Customer ID Num"");//CPBX Customer ID Num
	MSISDN = GetFieldValue(""Number String"");//MSISDN
	
		var sWorkflowProcBs = appObj.GetService(""Workflow Process Manager"");
		var sInps = appObj.NewPropertySet();
		var sOutPs = appObj.NewPropertySet();
		with (sInps)
		{
			SetProperty(""ProcessName"",""STC CPBX DeReserve RCR"");
			SetProperty(""IDNum"",IDNum);
			SetProperty(""MSISDN"",MSISDN);
			SetProperty(""MSISDN"",ReservationEndDate);
		}
		sWorkflowProcBs.InvokeMethod(""RunProcess"",sInps,sOutPs);
	
 IsMSISDNAvail = NextRecord(); 
   }
  }//endwith sRMSBc

 return ContinueOperation;
 }//try
 catch(e)
 {
  throw(e);
 }
 finally
 {
  sRMSBc = null;
  sRMSBO = null;
  appObj = null;
 }
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""DERESERVE""){
		DERESERVE(Inputs,Outputs);
		return CancelOperation;
	}
	return (ContinueOperation);
}
"//***********************************************************************************************************//
//Author: Manu Antony
//*************************************************************************************************************//
function DIDReserveMore(Range, PilotNumber)
{
	try
	{

		var sAccBO = TheApplication().GetBusObject(""Account"");
		var sNumReserveBO = TheApplication().GetBusObject(""RMS NM Number Enquiry_Thin"");
		var sDIDBc = sAccBO.GetBusComp(""STC PBX DID Reservation BC"");
		var sNumReservBc = sNumReserveBO.GetBusComp(""RMS NM Number Enquiry_Thin"");
		var DBANId = """", DBANNum = """", OutputPS = """";var PsChildRec = """", MSISDN = 0, Vanity = """"; 
	var PilotNumber = TheApplication().GetProfileAttr(""PilotNumber"");
	Range = ToNumber(Range);
	var CustomerIDNum = TheApplication().GetProfileAttr(""Customer IDNum"");
	var AccntId = TheApplication().GetProfileAttr(""Accnt Id"");
//	Range = 2;
	//CustomerIDNum = ""6348239/51"";
//	AccntId = ""1-7ICFSF7"";
//	PilotNumber = ""97313100427"";

	if(Range != """" && Range > 0 && PilotNumber != """")
	{
  	  with(sNumReservBc)
	  {
       ActivateField(""Number String"");
	   ActivateField(""Status"");
	   ActivateField(""CPBX Customer ID Num"");
	   ActivateField(""Special Category Type"");
	   
       ClearToQuery();
	   SetSearchSpec(""Status"",""Allocated"");
	   SetSearchSpec(""CPBX Customer ID Num"","""");
	   SetSearchSpec(""Special Category Type"",""CloudPBX"");
	   
       SetViewMode(AllView);
	   ExecuteQuery(ForwardOnly);
	   var count = CountRecords();
	   var IsDIDAvail = FirstRecord();
	   if(!IsDIDAvail)//First Check
	   {
		 TheApplication().RaiseErrorText(""Numbers not availale for Reservation."");
	   }
	   while(IsDIDAvail)
		{
		var i = 0;
		while(i < Range) //0< 2
		{
		//Pick Number Reservation Information
		MSISDN = GetFieldValue(""Number String"");  
		Vanity = GetFieldValue(""Special Category Type""); 
		//Insert into  DID Reservation Table with picked Information
		with(sDIDBc)
		{
		ActivateField(""MSISDN"");
		ActivateField(""Record Picked"");
		ActivateField(""Vanity"");
		NewRecord(NewAfter);
		TheApplication().SetProfileAttr(""NewPick"", ""Y"");
		//Reserve DID
		SetFieldValue(""MSISDN"",MSISDN);
		//Parent Key
		SetFieldValue(""PilotNum"",PilotNumber);
		SetFieldValue(""Customer IDNum"",CustomerIDNum);
		SetFieldValue(""Accnt Id"",AccntId);
		WriteRecord();
		}
		i=i+1;
		}
		IsDIDAvail = NextRecord();
		}
	  }//with(sNumReservBc)
	}
}




catch(e)
 {
		TheApplication().RaiseErrorText(e);
 }
 finally
 {
  sDIDBc = null;
  sNumReservBc = null;
  sNumReserveBO = null;
  sAccBO = null;
  MSISDN = null;
  
 }

	

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""DIDReserveMore""){
		var Range = Inputs.GetProperty(""Range"");
		var PilotNum = Inputs.GetProperty(""PilotNum"");
		DIDReserveMore(Range, PilotNum);
		return CancelOperation;
	}
	return (ContinueOperation);
}
function CPSCreateActivity(Inputs, Outputs)
{
 var sActionBO = TheApplication().GetBusObject(""Action"");
 var sActionBC = sActionBO.GetBusComp(""Action"");
 
 var sOrderId = Inputs.GetProperty(""OrderId"");
 var sType = Inputs.GetProperty(""Type"");
 var sContactId = Inputs.GetProperty(""ContactId"");
 var sDNIS = Inputs.GetProperty(""SubscriptionNumber"");
 var sStatus = Inputs.GetProperty(""Status"");
var sDesc = Inputs.GetProperty(""Comments"");
 
 var sActivityId = """";
 
 with(sActionBC)
 {
  SetViewMode(AllView);
  ClearToQuery();
  ActivateField(""Order Id"");
  ActivateField(""Type"");
  ActivateField(""DNIS"");
  ActivateField(""Suspect Id"");
  ActivateField(""Status"");
  ActivateField(""Comment"");
  NewRecord(NewAfter);
  SetFieldValue(""Order Id"", sOrderId);
  SetFieldValue(""Type"", sType);
  SetFieldValue(""DNIS"", sDNIS);
  SetFieldValue(""Suspect Id"", sContactId);
  SetFieldValue(""Status"", sStatus);
  SetFieldValue(""Comment"", sDesc);
  sActivityId = GetFieldValue(""Id"");
WriteRecord();
 }
 Outputs.SetProperty(""ActivityId"", sActivityId);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
try
{
 if(MethodName == ""CPSCreateActivity"")
 {
  CPSCreateActivity(Inputs, Outputs);
  return(CancelOperation);
 }


 return (ContinueOperation);
 
}
catch(e)
{
 throw(e);
}
finally
{

}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
try
{
	if(MethodName == ""UpdateCPSSIM"")
	{
		fnUpdateCPSSimStat(Inputs, Outputs);
		return(CancelOperation);
	}
	return(ContinueOperation);
}
catch(e)
{
	throw(e);
}
finally
{

}
}
function fnUpdateCPSSimStat(Inputs, Outputs)
{
	var appObj = TheApplication();
	var sOrderId = Inputs.GetProperty(""OrderId"");
	
	var sOrderBo = TheApplication().GetBusObject(""Order Entry (Sales)"");
	var sOrderBc = sOrderBo.GetBusComp(""Order Entry - Orders"");
	var sOrderLine = sOrderBo.GetBusComp(""Order Entry - Line Items"");
	
	var sOrderTypeLOV = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_TYPE"",""Provide"");
	
	var sCPSFlag, sServiceId, sOrderType;
	var sSimNum = """";
	var boRMS, bcRMS;
	
	with(sOrderBc)
	{
		SetViewMode(AllView);
		ActivateField(""STC Billing CPS Flag"");
		ActivateField(""STC Order SubType"");
		ActivateField(""Service Account Id"");
		ClearToQuery();
		SetSearchSpec(""Id"", sOrderId);
		ExecuteQuery(ForwardOnly);
		if(FirstRecord())
		{
			sCPSFlag = GetFieldValue(""STC Billing CPS Flag"");
			sServiceId = GetFieldValue(""Service Account Id"");
			sOrderType = GetFieldValue(""STC Order SubType"");
			if(sCPSFlag == ""Y"" && sOrderType == sOrderTypeLOV)
			{
				with(sOrderLine)
				{
					SetViewMode(AllView);
			//		ActivateField(""STC MNP MSISDN"");
					ActivateField(""STC ICCID"");
					ClearToQuery();
					SetSearchExpr(""[Order Header Id] = '""+sOrderId+""' AND [Parent Order Item Id] IS NULL"");
					ExecuteQuery(ForwardOnly);
					if(FirstRecord())
					{
						sSimNum = GetFieldValue(""STC ICCID"");
					}
				}
				if(sSimNum != """" && sSimNum != null)
				{
					boRMS = appObj.GetBusObject(""RMS NM Number Redeployment"");
					bcRMS = boRMS.GetBusComp(""RMS NM Number Master Deployment"");
					with (bcRMS)
					{
						SetViewMode(AllView);
						ActivateField(""Assigned Id"");
						ActivateField(""Assigned Date"");
						ActivateField(""Using Type"");
						ActivateField(""Reservation End Date"");
						ActivateField(""Record Blocking Date"");
						ActivateField(""Is Associated"");
						ActivateField(""Status"");
						ActivateField(""Current Date"");
						ClearToQuery();
						SetSearchSpec(""NumStringDelim"",sSimNum);
						ExecuteQuery(ForwardOnly);     
						var isrecord = FirstRecord();
						if(isrecord)
						{
							SetFieldValue(""Assigned Id"", sServiceId);
							SetFieldValue(""Assigned Date"",GetFieldValue(""Current Date""));
							SetFieldValue(""Using Type"",TheApplication().InvokeMethod(""LookupValue"", ""RMS_USING_TYPE"", ""ACTIVATION""));
							SetFieldValue(""Reservation End Date"","""");
							SetFieldValue(""Record Blocking Date"","""");
							SetFieldValue(""Is Associated"",""Y"");
							SetFieldValue(""Status"",TheApplication().InvokeMethod(""LookupValue"", ""NM_NUMBER_STATUS"", ""ASSIGNED""));
							WriteRecord();
						}
					}//end of with (bcRMS)
				}//end of if(sSimNum != """" && sSimNum != null)
			}//end of if(sCPSFlag == ""Y"")
		}//end of if(FirstRecord())
	}//end of with(sOrderBc)
}
function AgentStateToggle(Inputs, Outputs)
{
	TheApplication().SetProfileAttr(""AgentState"","""");
}
"//Function gets called from CTI Configuration in EventEstablished Event
//It is used to do MSISDN serach in Subscription
function CallEstablished(Inputs, Outputs)
{
 try
 {
  var sServiceId,aapObj,boServiceAcct,bcServiceAcct,sMasterAccId;
  aapObj = TheApplication();
  sServiceId = Inputs.GetProperty(""HWANI""); // Get the MSISDN Number from incoming call
  if (sServiceId != null && sServiceId != """")
  {
	sServiceId = ""973""+sServiceId; // Add country code as core n/w do not support sending the country code in call
	// aapObj.RaiseErrorText(sServiceId);
	boServiceAcct = TheApplication().GetBusObject(""STC Service Account"");
	bcServiceAcct = boServiceAcct.GetBusComp(""CUT Service Sub Accounts"");
	with(bcServiceAcct)
	{
		ClearToQuery();
		SetViewMode(AllView);
		ActivateField(""DUNS Number"");
		ActivateField(""Master Account Id"");
		SetSearchSpec(""DUNS Number"",sServiceId);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			sMasterAccId = GetFieldValue(""Master Account Id"");
			TheApplication().SetProfileAttr(""HWCTI"",sMasterAccId);
			//aapObj.GotoView(""STC Service Account List View"",boServiceAcct);
			aapObj.GotoView(""STC Service Account Contact History View"",boServiceAcct);
		}
		else
		{
			aapObj.GotoView(""STC Service Accounts Screen Homepage View"");                                                                     
		}
	}//end with     
  }//end if  
 }//end try
catch(e)
{
   throw(e);
}
finally
{
	 boServiceAcct = null;   
	 bcServiceAcct = null;
}
}
function CallReleased(Inputs, Outputs)
{
	TheApplication().SetProfileAttr(""HWCTI"","""");
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 var iReturn;
 iReturn = ContinueOperation; 
 switch(MethodName)
 {
 	case ""ShowDashboard"":
	 {
	  //remove the code once dash bord is ready
	  /* var bs, inputs, outputs;
	   var idContact, idAccount, idInteraction;
	   inputs = TheApplication().NewPropertySet();
	   outputs = TheApplication().NewPropertySet();
	   bs = TheApplication().GetService(""Persistent Customer Dashboard"");
	       inputs.SetProperty(""Source Name"", ""Base View"");
	      inputs.SetProperty(""RowId"", ""1-32HG"");
	      inputs.SetProperty(""Buscomp Name"", ""Account"");
	
	    bs.InvokeMethod(""ClearDashboard"", inputs, outputs);
	    bs.InvokeMethod(""Update Dashboard"", inputs, outputs); 
	     iReturn = CancelOperation; */
	    break; 
	 }
	 case ""CallEstablished"":
		CallEstablished(Inputs,Outputs);
		iReturn = CancelOperation;
		break;	 
	 case ""CallReleased"":
 	 	CallReleased(Inputs,Outputs);
		iReturn = CancelOperation;
		break;	 
	default:
		break;		
 }			
 return (iReturn);
}
"/*function LogException(e)
{

	var appObj;
  	var Input;
  	var Output;
  	var CallMessageHandler; 
	try
 	{
		  appObj = TheApplication();
		  Input = appObj.NewPropertySet();
		  Output = appObj.NewPropertySet();
		  CallMessageHandler = appObj.GetService(""STC Generic Error Handler""); 
		  Input.SetProperty(""Error Code"", e.errCode);
		  Input.SetProperty(""Error Message"", e.errText);
		  Input.SetProperty(""Object Name"", ""STC Calculate Corporate Credit Limit"");
		  Input.SetProperty(""Object Type"", ""Business Service"");
		  CallMessageHandler.InvokeMethod(""Log Message"", Input, Output);
 	}
 	catch(e)
 	{
  		
 	}
 	finally
 	{
 		  Output = null;
		  Input = null;
		  CallMessageHandler = null;
		  appObj = null;
 	}
}*/"
function CreditLimit(Inputs,Outputs)
{
	var oldChildCL;
	var newChildCL = 0;
	try
	{
				var appObj = TheApplication();
				with(appObj)
				{
		         	
		         		var parentBO = appObj.GetBusObject(""STC Billing Account"");
		         		var parentBC = parentBO.GetBusComp(""CUT Invoice Sub Accounts"");
		         		var childBC  = parentBO.GetBusComp(""STC Child Billing Accounts"");
		         		var BillAccountId = Inputs.GetProperty(""ParentBillingAccId"");
		         		var empCL = ToNumber(Inputs.GetProperty(""EMPCL""));
		         		
		         		 with(parentBC)
		         		 {
		         		   SetViewMode(AllView);
		         		   ActivateField(""Id"");
		         		   ClearToQuery();
		         		   SetSearchSpec(""Id"",BillAccountId);
			               ExecuteQuery(ForwardOnly);
			               var sfRec1 = FirstRecord();
			               if(sfRec1)
			               {
		         		//var sCreditScore = ToNumber(Inputs.GetProperty(""CreditScore""));
		         		  var parentCL = ToNumber(GetFieldValue(""Credit Score""));       		
		         		with(childBC)
		         		{
		         		  
		         		  SetViewMode(AllView);
		         	      ActivateField(""Parent Account Id"");
		         	      ActivateField(""Credit Score"");
		              	  ActivateField(""STC Corporate Type"");
		              	  ClearToQuery();
			              SetSearchSpec(""Parent Account Id"", BillAccountId);
			              ExecuteQuery(ForwardOnly);
			              var sfRec = FirstRecord();
			              var totalChildCL = 0;	
		      			  while(sfRec)
		                  {
		                    var corpType = ParentBusComp().GetFieldValue(""STC Corporate Type"");
		                    if ( corpType == ""Department"" )
		                    {
		                                          
		         		       totalChildCL = ToNumber(totalChildCL) + ToNumber(GetFieldValue(""Credit Score""));
		         		      
		         		        //else if ( oldChildCL != null )
		         		       //{
		         		        // newChildCL = newChildCL + oldChildCL;
		                       //}
		                      		                        
		                      }
		         		        sfRec = NextRecord();
		         		      
		         	      } //end of while
		         	     } //end of if
		         	      var balCL = parentCL - totalChildCL ;
		         	      	if ( balCL < empCL )
		         	      	{
		         	      	   Outputs.SetProperty(""BalCL"",balCL);
		         	      	 }
		         	      	else 
		         	      	{
		         	      	  Outputs.SetProperty(""BalCL"",empCL);
		         	      	}
		         	  		            
		        	    } //end of with(childBC)
		        	  } //end of with(parentBC)
		         	     
                      } //end of with(appObj)
		     
       	}	            
	catch(e)
	{
	 	throw(e);
	}
	finally
	{
	    childBC = null;
	    parentBC = null;
	    parentBO = null;
		appObj = null;
	}
	  
}
"/*function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{

    	CreditLimit(Inputs, Outputs);
    	return(CancelOperation);
}  */
	function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	
	var ireturn;
	try
	{
		
	switch(MethodName)
		{
			case ""CreditLimit"":
					CreditLimit(Inputs,Outputs);
					ireturn =CancelOperation;
					break;
			default:
					ireturn = ContinueOperation;
					break;
			}
	return(ireturn);
	}
	catch(e)
	{
	throw(e);
	}
	finally
	{
	}
	return(CancelOperation);
}
function CreditLimit(Inputs,Outputs)
{
	var appObj;
	var sCreditLimit;
	var sAccountId;
	var psInputs;
	var psOutputs;
	var svcService;
	var sMaxFlag;
	var sRecordCount;
	var sNewDeopsit;
	var sOldDeposit;
	//var sdiff;
	var sAlert;
	var sConfirm;
	var sCheckRefund;
	var sRefundLimit;
	var SRId;
	var sOverrideCLHvc;//Srini:28012014:Added for the OverrideCL for HVC customer at BAN
	try
	{
				appObj = TheApplication();
				with(appObj)
				{
		         		sAccountId = GetProfileAttr(""BillAccountId"");
		         		sCreditLimit = ToNumber(Inputs.GetProperty(""CreditLimit""));
		         		SRId = Inputs.GetProperty(""SRId"");
		         		//Inputs.GetProperty(""BillId"");
		         		psInputs = NewPropertySet();
		         		psOutputs = NewPropertySet();
		         		svcService = GetService(""Workflow Process Manager"");
		           		psInputs.SetProperty(""Object Id"",sAccountId);  
		            	psInputs.SetProperty(""Credit Limit"",sCreditLimit); 
		            	psInputs.SetProperty(""SRId"",SRId);
		            	psInputs.SetProperty(""ProcessName"",""STC Calculate Deposit WF"");
		            	svcService.InvokeMethod(""RunProcess"", psInputs, psOutputs);
		            	sMaxFlag = psOutputs.GetProperty(""Check Max Credit"");
		            	sRecordCount = psOutputs.GetProperty(""Record Count"");
		            	sNewDeopsit = ToNumber(psOutputs.GetProperty(""Security Deposit""));
		            	sOldDeposit = ToNumber(psOutputs.GetProperty(""Old Security Deposit""));
		            	sCheckRefund = psOutputs.GetProperty(""Check Refund"");
		            	sRefundLimit = psOutputs.GetProperty(""Refund Limit"");
		            	sOverrideCLHvc = psOutputs.GetProperty(""OverrideCreditLimitHVC"");//Srini:28012014:Added for the OverrideCL for HVC customer at BAN
		            	//if(sRecordCount ==""1"")
		            	if(sRecordCount ==""1"" && sOverrideCLHvc == ""N"")//Srini:28012014:Added for the OverrideCL for HVC customer at BAN
		            	{
		            		if(sMaxFlag == ""N"")
			            	{
			            		if(sCheckRefund == ""N"")
			            		{
			            			//sdiff = sNewDeopsit-sOldDeposit;
			            			Outputs.SetProperty(""Fee"",sNewDeopsit);
			            			Outputs.SetProperty(""Check Refund"",sCheckRefund);
			            			//this.SetFieldValue(""STC Fee"",sdiff);
			            		}
			            		else
			            		{
			            			if(sRefundLimit==""Y"")
			            			{
			            			//gjena_13Dec12 Commented Not to show the Pop Up.
			            			//sAlert = LookupMessage(""User Defined Errors"",""SM0004"");
			            			//Outputs.SetProperty(""AlertMsg"", sAlert);
			            			}
			            			else
			            			{
			            				Outputs.SetProperty(""Fee"",sNewDeopsit);
			            				Outputs.SetProperty(""Check Refund"",sCheckRefund);
			            			}
			            		}
			            	}
			            	else
			            	{	
			            		sConfirm =LookupMessage(""User Defined Errors"",""SM0003"");
			             		Outputs.SetProperty(""ConfirmMsg"", sConfirm);
			             		Outputs.SetProperty(""Fee"",sNewDeopsit);
			             		Outputs.SetProperty(""Check Refund"",sCheckRefund);
			             	}	
			            		
		            	}
		            	//else
		            	else if(sOverrideCLHvc != ""Y"" && sRecordCount ==""0"")//Srini:28012014:Added for the OverrideCL for HVC customer at BAN
		  				{
		            		sAlert =LookupMessage(""User Defined Errors"",""SM0002"");
		            		Outputs.SetProperty(""AlertMsg"", sAlert);
		            	}
      			 }
	}
	catch(e)
	{
	 	LogException(e);
	}
	finally
	{
		psInputs = null;
		psOutputs = null;
		svcService = null;
		appObj = null;
	}
}
function LogException(e)
{

	var appObj;
  	var Input;
  	var Output;
  	var CallMessageHandler; 
	try
 	{
		  appObj = TheApplication();
		  Input = appObj.NewPropertySet();
		  Output = appObj.NewPropertySet();
		  CallMessageHandler = appObj.GetService(""STC Generic Error Handler""); 
		  Input.SetProperty(""Error Code"", e.errCode);
		  Input.SetProperty(""Error Message"", e.errText);
		  Input.SetProperty(""Object Name"", ""STC Calculate Credit Limit"");
		  Input.SetProperty(""Object Type"", ""Buisness Service"");
		  CallMessageHandler.InvokeMethod(""Log Message"", Input, Output);
 	}
 	catch(e)
 	{
  		
 	}
 	finally
 	{
 		  Output = null;
		  Input = null;
		  CallMessageHandler = null;
		  appObj = null;
 	}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	try
	 {
	  
	   switch(MethodName)
		{   
	          case ""CreditLimit"":
	          {
	            CreditLimit(Inputs,Outputs);
				return (CancelOperation);
			    break;
			  }	
			  default:
			    break;
		 } 
	return (ContinueOperation);
	}
	catch(e)
	{
	 LogException(e);
	}
	finally
	{
	}
}
function Service_InvokeMethod (MethodName, Inputs, Outputs)
{

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""BudgetApproval"")
	{
		try
		{
			var vAmount:Number;
			vAmount = Inputs.GetProperty(""RequestedAmount"");
			var vAppBO = TheApplication().GetBusObject(""FINS Approval"");
			var vAppLevelBC = vAppBO.GetBusComp(""FINS Approval Level"");
			var vAppStageBC = vAppBO.GetBusComp(""FINS Approval Stage"");
			var AppId = """";
			var vLimit:Number;
			var RecExists = """";
			var vAppLevel = """";
			with(vAppLevelBC)
			{
				ActivateField(""Approval Level"");
				ClearToQuery();
				SetSearchSpec(""Approval Level"",""Campaign Budget"");
				ExecuteQuery(ForwardBackward);
				if(FirstRecord())
					AppId = GetFieldValue(""Id"");
			}
			if(AppId != """")
			{
				with(vAppStageBC)
				{
					ActivateField(""Approval Level Id"");
					ClearToQuery();
					SetSearchSpec(""Approval Level Id"",AppId);
					ExecuteQuery(ForwardBackward);
					if(FirstRecord())
					{
						RecExists = LastRecord();
						ActivateField(""Stage Number"");
						vAppLevel = GetFieldValue(""Stage Number"");
						RecExists = PreviousRecord();
						while(RecExists)
						{
							var id = GetFieldValue(""Id"");
							ActivateField(""STC Discount Limit"");
							ActivateField(""Stage Number"");
							vLimit = GetFieldValue(""STC Discount Limit"");
							if(vAmount <= vLimit)
							{
								vAppLevel = GetFieldValue(""Stage Number"");
							}
							RecExists = PreviousRecord();
						}
					}
				}
				Outputs.SetProperty(""vAppLevel"",vAppLevel);
			}
			return(CancelOperation);
		}
		catch(e)
		{
		}
		finally
		{
			vAppLevel = null;
			RecExists = null;
			vLimit = null;
			AppId = null;
			vAppStageBC = null;
			vAppLevelBC = null;
			vAppBO = null;
			vAmount = null;
		}
	}
	return (ContinueOperation);
}
function GetEmailAddress(Inputs, Outputs)
{
	try
	{
	
		var ListBO="""", ListBC="""";
		var ErrMsg = Inputs.GetProperty(""Error Message"");
		if(ErrMsg !="""" && ErrMsg !=null)
		{
			ListBO = TheApplication().GetBusObject(""List Of Values"");
			ListBC = ListBO.GetBusComp(""List Of Values"");
			var Position=0;
			with(ListBC){
		    ActivateField(""Type"");    //Type
		    ActivateField(""Value"");   //Display Value
		    ActivateField(""Name"");    //Language Independent Code
		    ActivateField(""High"");
		    ActivateField(""Low"");
			ActivateField(""Order By"");
		    ActivateField(""Description"");// Description
		    ClearToQuery();
		    SetViewMode(AllView);  
		    SetSearchSpec(""Type"",""STC_CAMPAIGN_ERROR_LIST"");
			SetSortSpec(""Order By (ASCENDING)"");
			ExecuteQuery(ForwardBackward);
			var isRecord = FirstRecord();
			while(isRecord){
				 var sname = GetFieldValue(""Name"");
			
				
					Position = ErrMsg.indexOf(sname);
							
					if(Position>=1)
					{
					
						Outputs.SetProperty(""EamilAddr"",GetFieldValue(""Description""));
						
						break;
					}
					else
					{
						//do nothing 
					}
	
				
				isRecord = NextRecord();
					    	}//End While
					    
	
			} // End With ListBC
		} // End If Error Message
	} // End try 
	catch(e)
	{
		throw(e);
	}
	finally
	{
	}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""GetEmailAddress"")
	{
		GetEmailAddress(Inputs,Outputs);
		return(CancelOperation);
	}
	return (ContinueOperation);
}
//Your public declarations go here...
function Execute(Record)
{
	try 
	{
		var oCampBO = """";
		var oCampBC = """";
		var oCampMapBC = """";
		var sOrderId = """";
		var sShortCode = """";
		var sShortCodeValue = """";
		var campRwid = """";
		var campid = """";
		var oOrdBO = """";
		var oOrdBC = """";
		var sSTCType = """";
		var sCampaignCode = """";

		var vOrderType = TheApplication().InvokeMethod(""LookupValue"",""STC_CAMPAIGN_SOURCE"",""Order"");
		var vCallCenType = TheApplication().InvokeMethod(""LookupValue"",""STC_CAMPAIGN_SOURCE"",""Call Center"");
		var vRetType = TheApplication().InvokeMethod(""LookupValue"",""STC_CAMPAIGN_SOURCE"",""Retail"");

		sOrderId = Record.GetProperty(""OrderId"");
		sShortCode = Record.GetProperty(""ShortCode"");
		sShortCodeValue = Record.GetProperty(""ShortCodeValue"");	
		sSTCType = Record.GetProperty(""STCType"");
		sCampaignCode = Record.GetProperty(""CampaignCode"");

		oCampBO=TheApplication().GetBusObject(""Campaign"");
		oCampBC=oCampBO.GetBusComp(""Campaign"");
		oCampMapBC=oCampBO.GetBusComp(""STC Campaign Mapping"");
		if(sSTCType == ""Email"" || sSTCType == ""IVR"" || sSTCType == vOrderType || sSTCType == vCallCenType || sSTCType == vRetType || sSTCType == ""Web"" || sSTCType == ""Mobile"")
		{
		
				with(oCampBC)
				{
					SetViewMode(AllView);
					ClearToQuery();
					ActivateField(""Source Code"");
					ActivateField(""Id"");
					SetSearchSpec(""Source Code"",sCampaignCode); 
					ExecuteQuery(ForwardOnly);
					if (FirstRecord()) 
					{   
						campRwid = GetFieldValue(""Id"");
					}			
				}		
		}
		else
		{
		with(oCampMapBC)
		{
			SetViewMode(AllView);
			ClearToQuery();
			ActivateField(""Short Code"");
			ActivateField(""Short Code Value"");
			ActivateField(""Campaign Code"");
			ActivateField(""Status"");
			ActivateField(""Eligibillity Check"");
			SetSearchSpec(""Short Code"",sShortCode); 
			SetSearchSpec(""Short Code Value"",sShortCodeValue); 
			SetSearchSpec(""Status"",""Active"");
            SetSearchSpec(""Eligibillity Check"",""Y"");
			ExecuteQuery(ForwardOnly);
			if (FirstRecord()) 
			{   
				campid = GetFieldValue(""Campaign Code"");
			}			
		}
		with(oCampBC)
		{
			SetViewMode(AllView);
			ClearToQuery();
			ActivateField(""Source Code"");
			ActivateField(""Id"");
			SetSearchSpec(""Source Code"",campid); 
			ExecuteQuery(ForwardOnly);
			if (FirstRecord()) 
			{   
				campRwid = GetFieldValue(""Id"");
			}			
		}

		}
		
		oOrdBO=TheApplication().GetBusObject(""Order Entry (Sales)"");
		oOrdBC=oOrdBO.GetBusComp(""Order Entry - Orders"");
		with(oOrdBC)
		{
			SetViewMode(AllView);
			ClearToQuery();
			ActivateField(""Id"");
			ActivateField(""Campaign Id"");
			SetSearchSpec(""Id"",sOrderId); 
			ExecuteQuery(ForwardOnly);
			if (FirstRecord()) 
			{   
				SetFieldValue(""Campaign Id"",campRwid);
				WriteRecord();
			}			
		}
		
			
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
	// Nullify Objects
		oOrdBC = null;
		oOrdBO = null;		
		oCampMapBC = null;
		oCampBC = null;
		oCampBO = null;
		
	}

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	switch (MethodName){
		case ""Execute"" : {
			Execute(Inputs);
			return(CancelOperation);
		}
	}
	return (ContinueOperation);
}
"//Your public declarations go here...  
"
function Init(Inputs, Outputs)
{
	try
	{
		with (Outputs)
		{
			SetProperty(""STC Rejection Reason"","""");
		}
		//return(ContinueOperation);
	}
	catch(e)
	{
	throw(e.toString());
	}
	finally
	{
	}
}
function Query(Inputs,Outputs)
{
	try
	{
	  	var PsChildRec = TheApplication().NewPropertySet();
	    with (PsChildRec)
		{
			SetProperty(""STC Rejection Reason"","""");
		}
			 Outputs.AddChild(PsChildRec);   
	}
	catch(e)
	 {
		
	 }
	 finally
	 {
	 	  PsChildRec=null;
	 }
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{ 
	var ireturn;
	var psInputs; 
	var psOutputs;

	try
	{
		ireturn = ContinueOperation;
		switch(MethodName)
		{
			case ""Init"":
					Init(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
			case ""Query"":
					Query(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
			case ""PreInsert"":
					ireturn = CancelOperation;
					break;
		
			default:
					//ireturn = ContinueOperation;
					break;
		}
	return (ireturn);
	}
	catch(e)
	{
		throw(e.toString());
	}
	finally
	{
	}
	return (ContinueOperation);
}
"//Your public declarations go here...  
"
function ResponseCreationCheck(Inputs,Outputs)
{
// var MSISDN = Inputs.GetProperty(""MSISDN"");
var MSISDN = """";
// var SANId= Inputs.GetProperty(""SANId"");
 var CANId= Inputs.GetProperty(""CANId"");
 var SANBO = TheApplication().GetBusObject(""STC Service Account"");
 var CampaignMemberBO = TheApplication().GetBusObject(""Campaign Members"");
 var CampaignBO = TheApplication().GetBusObject(""Campaign"");
 var SANBC = SANBO.GetBusComp(""CUT Service Sub Accounts"");
 var CampaignMemberBC = CampaignMemberBO.GetBusComp(""STC Campaign Members Thin"");
 var ResponseBC = CampaignBO.GetBusComp(""Response"");
 var CampaignId = """";
var j = 0;

//cardinality = TheApplication().InvokeMethod(""LookupValue"", ""CAMPAIGN_QUERY"", ""Count"");
var CampaignMemberRecCount = 0;
var NoOfCampaigns = 0;
 Outputs.SetProperty(""NoOfCampaigns"", 0);
 with(CampaignMemberBC)
  {
	   ActivateField(""Prospect DUNS Number"");
	   ActivateField(""Treatment Type"");
	   ActivateField(""Campaign Id"");
	   ActivateField(""Campaign Status"");
	   ActivateField(""Subscription Id"");
	   ActivateField(""CampaignActive"");
	   ActivateField(""Campaign Priority"");
	   ActivateField(""Subscription Status"");
	   ActivateField(""Response Flag"");
	   SetViewMode(AllView);
	   ClearToQuery();
	   SetSearchSpec(""Customer Id"", CANId);
	   SetSearchSpec(""Response Flag"", ""N"");
	   SetSearchSpec(""Campaign Status"", ""Launched"");
	   SetSearchSpec(""CampaignActive"", ""Y"");  //Active Campaigns
	   SetSearchSpec(""Subscription Status"", ""Active"");  //Active Campaigns
	   ExecuteQuery(ForwardBackward);
	   var CampaignMemRec = FirstRecord();
	   
	   if(CampaignMemRec)
	   {
			CampaignMemberRecCount = CountRecords();  
		  for (j= 0; j < CampaignMemberRecCount; j++)
		  {
			  CampaignId = GetFieldValue(""Campaign Id"");
			  MSISDN = GetFieldValue(""Prospect DUNS Number"");
			    with(ResponseBC)
			    {
					ActivateField(""SRC_ID"");
					ActivateField(""Prospect MSISDN"");
					ActivateField(""Treatment Type"");
					SetViewMode(AllView);
					ClearToQuery();
					var ResponseSpec = ""[SRC_ID] ='"" + CampaignId + ""' AND [Prospect MSISDN] ='"" + MSISDN + ""'"";
					SetSearchExpr(ResponseSpec);
					ExecuteQuery(ForwardOnly);
					var ResponseRec = FirstRecord();
					if(!ResponseRec)
					{
						NoOfCampaigns = NoOfCampaigns  + 1;
					}
				 }
				CampaignMemRec = NextRecord();
		   }
	   }
	
  }


 Outputs.SetProperty(""NoOfCampaigns"",NoOfCampaigns );
 
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 if(MethodName == ""ResponseCreationCheck""){
  ResponseCreationCheck(Inputs,Outputs);
  return CancelOperation;
 }
 return (ContinueOperation);
}
function GenerateSearchSpec(Inputs,Outputs)
{
 var MSISDN = Inputs.GetProperty(""MSISDN"");
 var SANId= Inputs.GetProperty(""SANId"");
 var SANBO = TheApplication().GetBusObject(""STC Service Account"");
 var CampaignMemberBO = TheApplication().GetBusObject(""Campaign Members"");
 var CampaignBO = TheApplication().GetBusObject(""Campaign"");
 var SANBC = SANBO.GetBusComp(""CUT Service Sub Accounts"");
 var CampaignMemberBC = CampaignMemberBO.GetBusComp(""Campaign Members"");
 var ResponseBC = CampaignBO.GetBusComp(""Response"");
 var CampaignId = """";
var cardinality = 0;
cardinality = TheApplication().InvokeMethod(""LookupValue"", ""CAMPAIGN_QUERY"", ""Count"");
 var fieldName = ""Campaign.Id"", searchExprOut = ""[Campaign.Id]='NOMATCH'"",j = 0;
 Outputs.SetProperty(""SearchSpec"",""[Campaign.Id]='NOMATCH'"");

 with(CampaignMemberBC)
  {
   ActivateField(""Prospect DUNS Number"");
   ActivateField(""Treatment Type"");
   ActivateField(""Campaign Id"");
   ActivateField(""Campaign Status"");
   ActivateField(""Subscription Id"");
   ActivateField(""CampaignActive"");
   ActivateField(""Campaign Priority"");
   SetViewMode(AllView);
   ClearToQuery();
   SetSearchSpec(""Subscription Id"", SANId);
   SetSearchSpec(""Prospect DUNS Number"", MSISDN);
   SetSearchSpec(""Treatment Type"", ""Wireless Message"");
   SetSearchSpec(""Campaign Status"", ""Launched"");
   SetSearchSpec(""CampaignActive"", ""Y"");
   SetSortSpec(""Campaign Created(DESCENDING), Campaign Priority(ASCENDING)"");
   ExecuteQuery(ForwardBackward);
   var CampaignMemRec = FirstRecord();
   
   if(CampaignMemRec)
   {
 // var CampaignMemberRecCount = CountRecords();  
  for (j= 0; j < cardinality; j++)
  {
  CampaignId = GetFieldValue(""Campaign Id"");
    with(ResponseBC)
    {
  ActivateField(""SRC_ID"");
  ActivateField(""Prospect MSISDN"");
  ActivateField(""Treatment Type"");
  SetViewMode(AllView);
  ClearToQuery();
 var ResponseSpec = ""[SRC_ID] ='"" + CampaignId + ""' AND [Prospect MSISDN] ='"" + MSISDN + ""' AND [Treatment Type] ='Wireless Message'"";
 
     SetSearchExpr(ResponseSpec);
     ExecuteQuery(ForwardOnly);
     var ResponseRec = FirstRecord();
     if(!ResponseRec)
     {
  
    if (j == 0)
       searchExprOut = ""[""+fieldName+""]='""+CampaignId+""'"";
       else
       searchExprOut = searchExprOut + ""OR [""+fieldName+""]='""+CampaignId+""'"";
      
     }
    }
 CampaignMemRec = NextRecord();
   }
   }

  }


 Outputs.SetProperty(""SearchSpec"",searchExprOut);
 
 return CancelOperation;
}
function PortalSearch(Inputs,Outputs)
{
	var MSISDN = Inputs.GetProperty(""MSISDN"");
	var SANId= Inputs.GetProperty(""SANId"");
	var SANBO = TheApplication().GetBusObject(""STC Service Account"");
	var CampaignMemberBO = TheApplication().GetBusObject(""Campaign Members"");
	var CampaignBO = TheApplication().GetBusObject(""Campaign"");
	var SANBC = SANBO.GetBusComp(""CUT Service Sub Accounts"");
	var CampaignMemberBC = CampaignMemberBO.GetBusComp(""Campaign Members"");
	var ResponseBC = CampaignBO.GetBusComp(""Response"");
	var CampaignId = """";
	var cardinality = 0;
	cardinality = TheApplication().InvokeMethod(""LookupValue"", ""CAMPAIGN_QUERY_PORTAL"", ""Count"");
	var fieldName = ""Campaign.Id"", searchExprOut = ""[Campaign.Id]='NOMATCH'"",j = 0;
	Outputs.SetProperty(""SearchSpec"",""[Campaign.Id]='NOMATCH'"");
	var CampaignSpec = ""[Subscription Id] ='"" + SANId + ""' AND [Prospect DUNS Number] ='"" + MSISDN + ""' AND [STC Channel] ='Popup Offer' AND [Campaign Status] = 'Launched' AND [CampaignActive] = 'Y'"";
	with(CampaignMemberBC)
	{
		ActivateField(""Prospect DUNS Number"");
		ActivateField(""STC Customer Target Type"");
		ActivateField(""Campaign Id"");
		ActivateField(""Campaign Status"");
		ActivateField(""Subscription Id"");
		ActivateField(""CampaignActive"");
		ActivateField(""Campaign Priority"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchExpr(CampaignSpec);
		SetSortSpec(""Campaign Created(DESCENDING), Campaign Priority(ASCENDING)"");
		ExecuteQuery(ForwardBackward);
		var CampaignMemRec = FirstRecord();
		var CampaignMemberRecCount = CountRecords();
		if(CampaignMemRec)
		{ 
			for (j= 0; j < cardinality; j++)
			{
				CampaignId = GetFieldValue(""Campaign Id"");
				with(ResponseBC)
				{
					ActivateField(""SRC_ID"");
					ActivateField(""Prospect MSISDN"");
					ActivateField(""Treatment Type"");
					SetViewMode(AllView);
					ClearToQuery();
					var ResponseSpec = ""[SRC_ID] ='"" + CampaignId + ""' AND [Prospect MSISDN] ='"" + MSISDN + ""' AND [STC Campaign Channel] ='Popup Offer'"";
					SetSearchExpr(ResponseSpec);
					ExecuteQuery(ForwardOnly);
					var ResponseRec = FirstRecord();
					if(!ResponseRec)
					{
						if (j == 0)
						searchExprOut = ""[""+fieldName+""]='""+CampaignId+""'"";
						else
						searchExprOut = searchExprOut + ""OR [""+fieldName+""]='""+CampaignId+""'"";
					}
				}
				CampaignMemRec = NextRecord();
			}
		}
	}
	Outputs.SetProperty(""SearchSpec"",searchExprOut);
	return CancelOperation;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 if(MethodName == ""GenerateSearchSpec""){
  GenerateSearchSpec(Inputs,Outputs);
  return CancelOperation;
 }

if(MethodName == ""PortalSearch"")
{
PortalSearch(Inputs,Outputs);
return CancelOperation;
}


 return (ContinueOperation);
}
//Your public declarations go here...
function ReadSmartCard (Inputs, Outputs)
{
	try
	{
		var CPR,Name,Gender,Dob,CardExpiry,FName,LName,MiddleName,Address,Flat,Building,Road,BlockNo,Governorate,Nationality,Occupation,SponsorName,SponsorNo,PassportNo,PassportIssueDate,PassportExpiryDate,LabourForceParticipation,EmployerNumber,EmployerName;
		var formatDOB;
		var CardCountry;
		var CardIssueDate;
		var newformatDOB;
		var newformatExpiry;
		var newformatPassportExpiryDate;
		var newformatPassportIssueDate;
		var CheckExist;	
		var country;
		var SystemOccupation;
		var appObj = TheApplication();

		var proxyBS = appObj.GetService(""Workflow Process Manager"");
		var input = appObj.NewPropertySet();
		var output = appObj.NewPropertySet();
		var siebMessage = Inputs.GetProperty(""SiebelMessage"");
		var sRowId = Inputs.GetProperty(""RowId"");
		input.SetProperty(""XMLDOC"",siebMessage);
		if(siebMessage != """" && siebMessage != null)
		{
			input.SetProperty(""ProcessName"",""STC Smart Card Read VBC Update WF"");
			proxyBS.InvokeMethod(""RunProcess"",input,output);
			var smartcard = output.GetChild(0);
			var row = appObj.NewPropertySet();

			CPR = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""CPRNO"");
			Name = smartcard.GetChild(0).GetChild(0).GetProperty(""EnglishFullName"");
			Gender = smartcard.GetChild(0).GetChild(0).GetProperty(""Gender"");
			Dob = smartcard.GetChild(0).GetChild(0).GetProperty(""BirthDate"");
			CardExpiry = smartcard.GetChild(0).GetChild(0).GetProperty(""CardexpiryDate"");
			CardCountry = smartcard.GetChild(0).GetChild(0).GetProperty(""CardCountry"");
			Address = smartcard.GetChild(0).GetChild(0).GetProperty(""AddressEnglish"");
			Nationality = smartcard.GetChild(0).GetChild(0).GetProperty(""NationalityCode"");
			Occupation = smartcard.GetChild(0).GetChild(0).GetProperty(""OccupationEnglish"");
			CardIssueDate = smartcard.GetChild(0).GetChild(0).GetProperty(""CardIssueDate"");
			SponsorName = smartcard.GetChild(0).GetChild(0).GetProperty(""SponserNameEnglish"");
			SponsorNo = smartcard.GetChild(0).GetChild(0).GetProperty(""SponserId"");
			PassportNo = smartcard.GetChild(0).GetChild(0).GetProperty(""PassportNumber"");
			PassportIssueDate = smartcard.GetChild(0).GetChild(0).GetProperty(""PassportIssueDate"");
			PassportExpiryDate = smartcard.GetChild(0).GetChild(0).GetProperty(""PassportExpiryDate"");
			EmployerNumber = smartcard.GetChild(0).GetChild(0).GetProperty(""EmploymentId"");
			EmployerName = smartcard.GetChild(0).GetChild(0).GetProperty(""EmploymentNameEnglish"");
			var FMiscCount = smartcard.GetChild(0).GetChild(0).GetChildCount();
			FName = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""FirstNameEnglish"");
			LName = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""LastNameEnglish"");
			Flat = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""FlatNo"");
			Building = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""BuildingNo"");
			Road = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""RoadNo"");
			BlockNo = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""BlockNo"");
			Governorate = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""GovernorateNameEnglish"");
			MiddleName = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""MiddleName1English"");
			LabourForceParticipation = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""LaborForceParticipation"")
		
			var day = Dob.substring(0,2);
			var Mon = Dob.substring(3,5);
			var Year = Dob.substring(6,10);
			//[MANUJ] : [Autopopualte Revamp]
				if(day == ""00"")
				{
				day == ""01"";
				}
				if(Mon == ""00"")
				{
				Mon == ""01"";
				}
					
			var Expday = CardExpiry.substring(0,2);
			var ExpMon = CardExpiry.substring(3,5);
			var ExpYear = CardExpiry.substring(6,10);
					
			var PExpday = PassportExpiryDate.substring(0,2);
			var PExpMon = PassportExpiryDate.substring(3,5);
			var PExpYear = PassportExpiryDate.substring(6,10);
					
			var PIssueday = PassportIssueDate.substring(0,2);
			var PIssueMon = PassportIssueDate.substring(3,5);
			var PIssueYear = PassportIssueDate.substring(6,10);
					
			formatDOB = day+""/""+Mon+""/""+Year;
			newformatDOB = Mon+""/""+day+""/""+Year;
			newformatExpiry = ExpMon+""/""+Expday+""/""+ExpYear;
			newformatPassportExpiryDate = PExpMon+""/""+PExpday+""/""+PExpYear;
			newformatPassportIssueDate = PIssueMon+""/""+PIssueday+""/""+PIssueYear;

			/*if(Gender == ""M"")
			{
				Gender = ""Male"";
			}
			else if(Gender == ""F"")
			{
				Gender = ""Female"";
			}*/

			if(LName == '-')
			{
				LName = '';
			}

			if(MiddleName == '-')
			{
				MiddleName = '';
			}
			
			
			var InputsNew = TheApplication().NewPropertySet();
			var OutputsNew = TheApplication().NewPropertySet();
			var svcService = TheApplication().GetService(""STC Get Country"");
			InputsNew.SetProperty(""CountryCode"",Nationality);
			InputsNew.SetProperty(""CardOccupation"",Occupation);
			InputsNew.SetProperty(""CardCountry"",CardCountry);
			svcService.InvokeMethod(""GetCountry"",InputsNew,OutputsNew);
			country = OutputsNew.GetProperty(""Nationality"");
			SystemOccupation = OutputsNew.GetProperty(""SystemOccupation"");
					

			Outputs.SetProperty(""FName"", FName);
			Outputs.SetProperty(""LName"", LName);
			Outputs.SetProperty(""MiddleName"", MiddleName);
			Outputs.SetProperty(""CPR"", CPR);
			Outputs.SetProperty(""FULLNAME"", Name);
			Outputs.SetProperty(""Gender"", Gender);
			Outputs.SetProperty(""newformatDOB"", newformatDOB);	
			Outputs.SetProperty(""newformatExpiry"", newformatExpiry);
			Outputs.SetProperty(""Flat"", Flat);
			Outputs.SetProperty(""Building"", Building);
			Outputs.SetProperty(""Road"", Road);
			Outputs.SetProperty(""BlockNo"", BlockNo);
			Outputs.SetProperty(""Governorate"", Governorate);
			Outputs.SetProperty(""country"", country);
			Outputs.SetProperty(""SystemOccupation"",SystemOccupation);
			Outputs.SetProperty(""Occupation"",Occupation);
			Outputs.SetProperty(""SponsorName"",SponsorName);
			Outputs.SetProperty(""SponsorNo"",SponsorNo);
			Outputs.SetProperty(""PassportNo"",PassportNo);
			Outputs.SetProperty(""newformatPassportIssueDate"",newformatPassportIssueDate);
			Outputs.SetProperty(""newformatPassportExpiryDate"",newformatPassportExpiryDate);	
			Outputs.SetProperty(""LabourForceParticipation"",LabourForceParticipation);
			Outputs.SetProperty(""EmployerNumber"",EmployerNumber);
			Outputs.SetProperty(""EmployerName"",EmployerName);

		}
	}
	catch(e)
	{
		appObj.RaiseErrorText(e.errText);
	}
	finally
	{
		InputsNew = null;
		OutputsNew = null;
		svcService = null;
		input = null;
		output = null;
		proxyBS = null;
	}

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	try
	{
		if(MethodName == ""ReadSmartCard"")
		{
			ReadSmartCard(Inputs, Outputs);
			return (CancelOperation);
		}
	}
	catch(e)
	{
		TheApplication().RaiseErrorText(e.errText);
	}
	finally
	{
	
	}
}
function CeilNumber(Inputs,Outputs)
{
	var sOrderNumber = Inputs.GetProperty(""CommitmentPeriod"");
	sOrderNumber = Math.ceil(sOrderNumber);
	Outputs.SetProperty(""CommitmentPeriod"",sOrderNumber);
	
	return CancelOperation;
}
function FixedRoundOff(Inputs,Outputs)
{
	var Price = Inputs.GetProperty(""Price"");
	Price = ToNumber(Price);
	Price= Price.toFixed(3);
	Outputs.SetProperty(""Price"",Price);

	return CancelOperation;
}
function RoundUpNumber(Inputs,Outputs)
{//[NAVIN:09Jul2019:Eshop_Reprice-PriceCheckAPI]
	var vPowerFactor = 10, vOutputNum=0;
	var vInputNum = ToNumber(Inputs.GetProperty(""InputNum""));
	var vDecPlaces = Inputs.GetProperty(""DecimalPlaces"");
	if(vDecPlaces != null && vDecPlaces != """")
		vDecPlaces = ToNumber(vDecPlaces);
	else
		vDecPlaces = 1;
	
	vPowerFactor = Math.pow(10, vDecPlaces);
	vOutputNum = Math.ceil(vInputNum * vPowerFactor)/vPowerFactor; //Round Up Number to n digit after decimal
	Outputs.SetProperty(""OutputNum"", vOutputNum);

	return CancelOperation;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""CeilNumber""){
		CeilNumber(Inputs,Outputs);
		return CancelOperation;
	}
	if(MethodName == ""RoundUpNumber""){
		RoundUpNumber(Inputs,Outputs);
		return CancelOperation;
	}
	if(MethodName == ""FixedRoundOff""){
		FixedRoundOff(Inputs,Outputs);
		return CancelOperation;
	}
	return (ContinueOperation);
}
function AddNewPackageProducts(psInputs, psOutputs)
{
	try
	{
		var sRootId, sObjectId, sRootPath, sIOName, sProductName, sRootProductId, sProductPath, sProductId;
		var bsRCOIS;
		var sBSName = ""Remote Complex Object Instance Service"";
		var psIn, psOut, psListOfProducts, psProduct, psAttribute;
		var iCount, iProductCount, iCount2, iAttributeCount;
		var sProductpartnum;
		var psProdRowIdInputs, psProdRowIdOutputs;

		bsRCOIS = TheApplication().GetService(sBSName);

		with (psInputs)
		{
			sObjectId = GetProperty(""Object Id"");
			sRootId = GetProperty(""Root Id"");
			sIOName = GetProperty(""IO Name"");
			psListOfProducts = GetChild(0);
		}//End with (psInputs)

		psIn = TheApplication().NewPropertySet();
		psOut = TheApplication().NewPropertySet();
		
		psProdRowIdInputs = TheApplication().NewPropertySet();
		psProdRowIdOutputs = TheApplication().NewPropertySet();
		
		with (psIn)
		{
			SetProperty(""ObjId"", sObjectId);
			SetProperty(""RootId"", sRootId);
		}//End with (psIn)
		bsRCOIS.InvokeMethod(""GetRootPath"", psIn, psOut);
		sRootPath = psOut.GetProperty(""Path"");
		if (sRootPath == """")
		{
			psOutputs.SetProperty(""Status"", ""ERROR"");
		//	psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Root Path not found""));
			psOutputs.SetProperty(""Error Msg"", ""Root Path Not found"");
			psOutputs.SetProperty(""Error Code"", ""SBL0013"");
			return;
		}//End if (sRootPath == """")

		psIn.Reset();
		psOut.Reset();
		with (psIn)
		{
			SetProperty(""ObjId"", sObjectId);
			SetProperty(""RootId"", sRootId);
		}//End with (psIn)
		bsRCOIS.InvokeMethod(""GetProductId"", psIn, psOut);
		sRootProductId = psOut.GetProperty(""Product Id"");
		if (sRootProductId == """")
		{
			psOutputs.SetProperty(""Status"", ""ERROR"");
		//	psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Root Product not found""));
			psOutputs.SetProperty(""Error Msg"", ""Root Path Not found"");
			psOutputs.SetProperty(""Error Code"", ""SBL0014"");
			return;
		}//End if (sRootProductId == """")

		iProductCount = psListOfProducts.GetChildCount();
		for (iCount = 0; iCount < iProductCount; iCount++)
		{
			psProduct = psListOfProducts.GetChild(iCount);
			switch (psProduct.GetProperty(""Action""))
			{
				case ""Delete"":
			//		sProductId = psProduct.GetProperty(""Product Id"");
					sProductpartnum = psProduct.GetProperty(""Product"");
					psProdRowIdInputs.Reset();
					psProdRowIdOutputs.Reset();
					psProdRowIdInputs.SetProperty(""ProductPartNum"", sProductpartnum);
					fnGetProdRowId(psProdRowIdInputs, psProdRowIdOutputs);
					sProductId = psProdRowIdOutputs.GetProperty(""ProductId"");
					sProductName = psProdRowIdOutputs.GetProperty(""ProductName"");
			//		sProductName = psProduct.GetProperty(""Product Name"");

					psIn.Reset();
					psOut.Reset();
					with (psIn)
					{
						SetProperty(""Object Id"", sObjectId);
						SetProperty(""Root Id"", sRootId);
						SetProperty(""Product Id"", sProductId);
						SetProperty(""Path"", sRootPath);
						SetProperty(""Product Name"", sProductName);
						SetProperty(""IO Name"", sIOName);
					}//End with (psIn)
					FindProductPath(psIn, psOut);
					if (psOut.GetProperty(""Status"") != ""FOUND"")
					{
						psOutputs.SetProperty(""Status"", ""ERROR"");
				//		psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Product Deletion Failed"", sProductName, sProductId));
						psOutputs.SetProperty(""Error Msg"", ""Product Deletion Failed"");
						psOutputs.SetProperty(""Error Code"", ""SBL0015"");
						return;
					}//End if (psOut.GetProperty(""Status"") != ""FOUND"")

					psIn.Reset();
					with (psIn)
					{
						SetProperty(""ObjId"", sObjectId);
						SetProperty(""RootId"", sRootId);
						SetProperty(""Path"", psOut.GetProperty(""Product Path""));
					}//End with (psIn)
					psOut.Reset();
					bsRCOIS.InvokeMethod(""RemoveItem"", psIn, psOut);

				break;
				case ""Add"":
					sProductpartnum = psProduct.GetProperty(""Product"");
					psProdRowIdInputs.Reset();
					psProdRowIdOutputs.Reset();
					psProdRowIdInputs.SetProperty(""ProductPartNum"", sProductpartnum);
					fnGetProdRowId(psProdRowIdInputs, psProdRowIdOutputs);
					sProductId = psProdRowIdOutputs.GetProperty(""ProductId"");
					sProductName = psProdRowIdOutputs.GetProperty(""ProductName"");
				//	sProductName = psProduct.GetProperty(""Product Name"");
				//	sProductId = psProduct.GetProperty(""Product Id"");

					psIn.Reset();
					psOut.Reset();
					with (psIn)
					{
						SetProperty(""Object Id"", sObjectId);
						SetProperty(""Root Id"", sRootId);
						SetProperty(""Root Product Id"", sRootProductId);
						SetProperty(""Path"", sRootPath);
						SetProperty(""Child Product Name"", sProductName);
						SetProperty(""Child Product Id"", sProductId);
						SetProperty(""IO Name"", sIOName);
					}//End with (psIn)
					FindProductDetails(psIn, psOut);

					if (psOut.GetProperty(""Status"") != ""FOUND"")
					{
						psOutputs.SetProperty(""Status"", ""ERROR"");
				//		psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Product Addition Failed; Not Found"", sProductName, sProductId));
						psOutputs.SetProperty(""Error Msg"", ""Product Addition Failed"");
						psOutputs.SetProperty(""Error Code"", ""SBL0016"");
						return;
					}//End if (psOut.GetProperty(""Status"") != ""FOUND"")

					var ProdStr = TheApplication().InvokeMethod(""LookupValue"",""STC_BB_AUTO_DISC"",sProductpartnum);
					var ProdSubStr = ProdStr.substring(0,4);
					if (psOut.GetProperty(""Instance Exists"") == ""Y"" && ProdSubStr != ""DISC"")
					{
						psOutputs.SetProperty(""Status"", ""ERROR"");
					//	psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Product Addition Failed; Already Exists"", sProductName, sProductId));
						psOutputs.SetProperty(""Error Msg"", ""Product Addition Failed"");
						psOutputs.SetProperty(""Error Code"", ""SBL0017"");
						return;
					}//End if (psOut.GetProperty(""Instance Exists"") == ""Y"")

					psIn.Reset();
					with (psIn)
					{
						SetProperty(""ObjId"", sObjectId);
						SetProperty(""RootId"", sRootId);
						SetProperty(""Parent Path"", psOut.GetProperty(""Parent Path""));
						SetProperty(""Name"", psOut.GetProperty(""Product Name""));
						SetProperty(""Port Item Id"", psOut.GetProperty(""Port Item Id""));
						SetProperty(""Prod Item Id"", psOut.GetProperty(""Prod Item Id""));
						SetProperty(""Product Id"", psOut.GetProperty(""Product Id""));
						SetProperty(""Quantity"", ""1"");
					}//End with (psIn)
					psOut.Reset();
					bsRCOIS.InvokeMethod(""AddItem"", psIn, psOut);

				break;
				case ""Update"":
					sProductpartnum = psProduct.GetProperty(""Product"");
					psProdRowIdInputs.Reset();
					psProdRowIdOutputs.Reset();
					psProdRowIdInputs.SetProperty(""ProductPartNum"", sProductpartnum);
					fnGetProdRowId(psProdRowIdInputs, psProdRowIdOutputs);
					sProductId = psProdRowIdOutputs.GetProperty(""ProductId"");
					sProductName = psProdRowIdOutputs.GetProperty(""ProductName"");
			//		sProductName = psProduct.GetProperty(""Product Name"");
			//		sProductId = psProduct.GetProperty(""Product Id"");

					if (sProductName == ""ROOT"" || sProductId == ""ROOT"")
					{
						sProductPath = sRootPath;
					}//End if (sProductName == ""ROOT"" || sProductId == ""ROOT"")
					else
					{
						psIn.Reset();
						psOut.Reset();
						with (psIn)
						{
							SetProperty(""Object Id"", sObjectId);
							SetProperty(""Root Id"", sRootId);
							SetProperty(""Product Id"", sProductId);
							SetProperty(""Path"", sRootPath);
							SetProperty(""Product Name"", sProductName);
							SetProperty(""IO Name"", sIOName);
						}//End with (psIn)
						FindProductPath(psIn, psOut);
						if (psOut.GetProperty(""Status"") != ""FOUND"")
						{
							psOutputs.SetProperty(""Status"", ""ERROR"");
					//		psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Product Updation Failed"", sProductName, sProductId));
							psOutputs.SetProperty(""Error Msg"", ""Product Deletion Failed"");
							psOutputs.SetProperty(""Error Code"", ""SBL0018"");
							return;
						}//End if (psOut.GetProperty(""Status"") != ""FOUND"")
						sProductPath = psOut.GetProperty(""Product Path"");
					}//End else

					iAttributeCount = psProduct.GetChildCount();
					for (iCount2 = 0; iCount2 < iAttributeCount; iCount2++)
					{
						psAttribute = psProduct.GetChild(iCount2);
						if (psAttribute.GetType() == ""Attribute"")
						{
							psIn.Reset();
							psOut.Reset();
							with (psIn)
							{
								SetProperty(""ObjId"", sObjectId);
								SetProperty(""RootId"", sRootId);
								SetProperty(""Path"", sProductPath);
								SetProperty(""Value"", psAttribute.GetProperty(""Attribute Value""));
								SetProperty(""Name"", psAttribute.GetProperty(""Attribute Name""));
								SetProperty(""XA Id"", ""XXX"");
							}//End with (psIn)
							bsRCOIS.InvokeMethod(""SetAttribute"", psIn, psOut);
						}//End if (psAttribute.GetType() == ""Attribute"")
						else if (psAttribute.GetType() == ""Field"")
						{
							psIn.Reset();
							psOut.Reset();
							with (psIn)
							{
								SetProperty(""ObjId"", sObjectId);
								SetProperty(""RootId"", sRootId);
								SetProperty(""Path"", sProductPath);
								SetProperty(""FieldName"", psAttribute.GetProperty(""Field Name""));
								SetProperty(""Value"", psAttribute.GetProperty(""Field Value""));
							}//End with (psIn)
							bsRCOIS.InvokeMethod(""SetFieldValue"", psIn, psOut);
						}//End else if (psAttribute.GetType() == ""Field"")
					}//End for (iCount2 = 0; iCount2 < iAttributeCount; iCount2++)
				break;								
			}//End switch (psProduct.GetProperty(""Action Code""))
		}//End for (iCount = 0; iCount < iProductCount; iCount++)
		psOutputs.SetProperty(""Status"", ""SUCCESS"");
		psOutputs.SetProperty(""Error Msg"", """");
		psOutputs.SetProperty(""Error Code"", """");
	}//End try
	catch(E)
	{
		psOutputs.SetProperty(""Status"", ""ERROR"");
		psOutputs.SetProperty(""Error Msg"", E.errText);
		psOutputs.SetProperty(""Error Code"", E.errCode);
	}//End catch(E)
	finally
	{
		bsRCOIS = null;
		psIn = null;
		psOut = null;
		psListOfProducts = null;
		psProduct = null;
		psAttribute = null;
		sRootId = sObjectId = sRootPath = sIOName = sProductName = sRootProductId = sProductPath = sProductId = iCount = iProductCount = iCount2 = iAttributeCount = null; //Dileep CR # 20130905_2
	}//End finally
}
"
function AddRemoveProduct(psInputs, psOutputs)
{
	try
	{
		var sRootId, sObjectId, sRootPath, sIOName, sProductName, sRootProductId, sProductPath, sProductId;
		var bsRCOIS;
		var sBSName = ""Remote Complex Object Instance Service"";
		var psIn, psOut, psListOfProducts, psProduct, psAttribute;
		var iCount, iProductCount, iCount2, iAttributeCount;

		bsRCOIS = TheApplication().GetService(sBSName);

		with (psInputs)
		{
			sObjectId = GetProperty(""Object Id"");
			sRootId = GetProperty(""Root Id"");
			sIOName = GetProperty(""IO Name"");
			psListOfProducts = GetChild(0);
		}
		psOutputs.SetProperty(""Input"", psInputs);

		psIn = TheApplication().NewPropertySet();
		psOut = TheApplication().NewPropertySet();
		with (psIn)
		{
			SetProperty(""ObjId"", sObjectId);
			SetProperty(""RootId"", sRootId);
		}
		bsRCOIS.InvokeMethod(""GetRootPath"", psIn, psOut);
		sRootPath = psOut.GetProperty(""Path"");
		if (sRootPath == """")
		{
			psOutputs.SetProperty(""Status"", ""ERROR"");
			psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Root Path not found""));
			psOutputs.SetProperty(""Error Code"", ""SBL0013"");
			return;
		}

		psIn.Reset();
		psOut.Reset();
		with (psIn)
		{
			SetProperty(""ObjId"", sObjectId);
			SetProperty(""RootId"", sRootId);
		}
		bsRCOIS.InvokeMethod(""GetProductId"", psIn, psOut);
		sRootProductId = psOut.GetProperty(""Product Id"");
		if (sRootProductId == """")
		{
			psOutputs.SetProperty(""Status"", ""ERROR"");
			psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Root Product not found""));
			psOutputs.SetProperty(""Error Code"", ""SBL0014"");
			return;
		}

		iProductCount = psListOfProducts.GetChildCount();
		for (iCount = 0; iCount < iProductCount; iCount++)
		{
			psProduct = psListOfProducts.GetChild(iCount);
			switch (psProduct.GetProperty(""Action Code""))
			{
				case ""Delete"":
					sProductId = psProduct.GetProperty(""Product Id"");
					sProductName = psProduct.GetProperty(""Product Name"");

					psIn.Reset();
					psOut.Reset();
					with (psIn)
					{
						SetProperty(""Object Id"", sObjectId);
						SetProperty(""Root Id"", sRootId);
						SetProperty(""Product Id"", sProductId);
						SetProperty(""Path"", sRootPath);
						SetProperty(""Product Name"", sProductName);
						SetProperty(""IO Name"", sIOName);
					}
					FindProductPath(psIn, psOut);
					if (psOut.GetProperty(""Status"") != ""FOUND"")
					{
						psOutputs.SetProperty(""Status"", ""ERROR"");
						psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Product Deletion Failed"", sProductName, sProductId));
						psOutputs.SetProperty(""Error Code"", ""SBL0015"");
						return;
					}

					psIn.Reset();
					with (psIn)
					{
						SetProperty(""ObjId"", sObjectId);
						SetProperty(""RootId"", sRootId);
						SetProperty(""Path"", psOut.GetProperty(""Product Path""));
					}
					psOut.Reset();
					bsRCOIS.InvokeMethod(""RemoveItem"", psIn, psOut);

				break;
			}
		}
		for (iCount = 0; iCount < iProductCount; iCount++)
		{
			psProduct = psListOfProducts.GetChild(iCount);
			switch (psProduct.GetProperty(""Action Code""))
			{
				case ""Add"":
					sProductName = psProduct.GetProperty(""Product Name"");
					sProductId = psProduct.GetProperty(""Product Id"");

					psIn.Reset();
					psOut.Reset();
					with (psIn)
					{
						SetProperty(""Object Id"", sObjectId);
						SetProperty(""Root Id"", sRootId);
						SetProperty(""Root Product Id"", sRootProductId);
						SetProperty(""Path"", sRootPath);
						SetProperty(""Child Product Name"", sProductName);
						SetProperty(""Child Product Id"", sProductId);
						SetProperty(""IO Name"", sIOName);
					}
					FindProductDetails(psIn, psOut);

					if (psOut.GetProperty(""Status"") != ""FOUND"")
					{
						psOutputs.SetProperty(""Status"", ""ERROR"");
						psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Product Addition Failed; Not Found"", sProductName, sProductId));
						psOutputs.SetProperty(""Error Code"", ""SBL0016"");
						return;
					}

					if (psOut.GetProperty(""Instance Exists"") == ""Y"")
					{
						psOutputs.SetProperty(""Status"", ""ERROR"");
						psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Product Addition Failed; Already Exists"", sProductName, sProductId));
						psOutputs.SetProperty(""Error Code"", ""SBL0017"");
						return;
					}

					psIn.Reset();
					with (psIn)
					{
						SetProperty(""ObjId"", sObjectId);
						SetProperty(""RootId"", sRootId);
						SetProperty(""Parent Path"", psOut.GetProperty(""Parent Path""));
						SetProperty(""Name"", psOut.GetProperty(""Product Name""));
						SetProperty(""Port Item Id"", psOut.GetProperty(""Port Item Id""));
						SetProperty(""Prod Item Id"", psOut.GetProperty(""Prod Item Id""));
						SetProperty(""Product Id"", psOut.GetProperty(""Product Id""));
						SetProperty(""Quantity"", ""1"");
					}
					psOut.Reset();
					bsRCOIS.InvokeMethod(""AddItem"", psIn, psOut);

				break;
			}
		}
		for (iCount = 0; iCount < iProductCount; iCount++)
		{
			psProduct = psListOfProducts.GetChild(iCount);
			switch (psProduct.GetProperty(""Action Code""))
			{
				case ""Update"":
					sProductName = psProduct.GetProperty(""Product Name"");
					sProductId = psProduct.GetProperty(""Product Id"");

					if (sProductName == ""ROOT"" || sProductId == ""ROOT"")
					{
						sProductPath = sRootPath;
					}
					else
					{
						psIn.Reset();
						psOut.Reset();
						with (psIn)
						{
							SetProperty(""Object Id"", sObjectId);
							SetProperty(""Root Id"", sRootId);
							SetProperty(""Product Id"", sProductId);
							SetProperty(""Path"", sRootPath);
							SetProperty(""Product Name"", sProductName);
							SetProperty(""IO Name"", sIOName);
						}
						FindProductPath(psIn, psOut);
						if (psOut.GetProperty(""Status"") != ""FOUND"")
						{
							psOutputs.SetProperty(""Status"", ""ERROR"");
							psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Product Updation Failed"", sProductName, sProductId));
							psOutputs.SetProperty(""Error Code"", ""SBL0018"");
							return;
						}
						sProductPath = psOut.GetProperty(""Product Path"");
					}

					iAttributeCount = psProduct.GetChildCount();
					for (iCount2 = 0; iCount2 < iAttributeCount; iCount2++)
					{
						psAttribute = psProduct.GetChild(iCount2);
						if (psAttribute.GetType() == ""Attribute"")
						{
							psIn.Reset();
							psOut.Reset();
							with (psIn)
							{
								SetProperty(""ObjId"", sObjectId);
								SetProperty(""RootId"", sRootId);
								SetProperty(""Path"", sProductPath);
								SetProperty(""Value"", psAttribute.GetProperty(""Attribute Value""));
								SetProperty(""Name"", psAttribute.GetProperty(""Attribute Name""));
								SetProperty(""XA Id"", ""XXX"");
							}
							bsRCOIS.InvokeMethod(""SetAttribute"", psIn, psOut);
						}
						else if (psAttribute.GetType() == ""Field"")
						{
							psIn.Reset();
							psOut.Reset();
							with (psIn)
							{
								SetProperty(""ObjId"", sObjectId);
								SetProperty(""RootId"", sRootId);
								SetProperty(""Path"", sProductPath);
								SetProperty(""FieldName"", psAttribute.GetProperty(""Field Name""));
								SetProperty(""Value"", psAttribute.GetProperty(""Field Value""));
							}
							bsRCOIS.InvokeMethod(""SetFieldValue"", psIn, psOut);
						}
					}

				break;
			}
		}
		psOutputs.SetProperty(""Status"", ""SUCCESS"");
		psOutputs.SetProperty(""Error Msg"", """");
		psOutputs.SetProperty(""Error Code"", """");
	}
	catch(E)
	{
		psOutputs.SetProperty(""Status"", ""ERROR"");
		psOutputs.SetProperty(""Error Msg"", E.errText);
		psOutputs.SetProperty(""Error Code"", E.errCode);
	}
	finally
	{
		bsRCOIS = null;
		psIn = null;
		psOut = null;
		psListOfProducts = null;
		psProduct = null;
		psAttribute = null;
		sRootId = sObjectId = sRootPath = sIOName = sProductName = sRootProductId = sProductPath = sProductId = iCount = iProductCount = iCount2 = iAttributeCount = null; //Dileep CR # 20130905_2
	}
}
"
function AddRemoveProductChangeRatePlan(psInputs, psOutputs)
{
	try
	{
		var sRootId, sObjectId, sRootPath, sIOName, sProductName, sRootProductId, sProductPath, sProductId;
		var bsRCOIS;
		var sBSName = ""Remote Complex Object Instance Service"";
		var psIn, psOut, psListOfProducts, psProduct, psAttribute;
		var iCount, iProductCount, iCount2, iAttributeCount;

		bsRCOIS = TheApplication().GetService(sBSName);

		with (psInputs)
		{
			sObjectId = GetProperty(""Object Id"");
			sRootId = GetProperty(""Root Id"");
			sIOName = GetProperty(""IO Name"");
			psListOfProducts = GetChild(0);
		}
		psOutputs.SetProperty(""Input"", psInputs);

		psIn = TheApplication().NewPropertySet();
		psOut = TheApplication().NewPropertySet();
		with (psIn)
		{
			SetProperty(""ObjId"", sObjectId);
			SetProperty(""RootId"", sRootId);
		}
		bsRCOIS.InvokeMethod(""GetRootPath"", psIn, psOut);
		sRootPath = psOut.GetProperty(""Path"");
		if (sRootPath == """")
		{
			psOutputs.SetProperty(""Status"", ""ERROR"");
			psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Root Path not found""));
			psOutputs.SetProperty(""Error Code"", ""SBL0013"");
			return;
		}

		psIn.Reset();
		psOut.Reset();
		with (psIn)
		{
			SetProperty(""ObjId"", sObjectId);
			SetProperty(""RootId"", sRootId);
		}
		bsRCOIS.InvokeMethod(""GetProductId"", psIn, psOut);
		sRootProductId = psOut.GetProperty(""Product Id"");
		if (sRootProductId == """")
		{
			psOutputs.SetProperty(""Status"", ""ERROR"");
			psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Root Product not found""));
			psOutputs.SetProperty(""Error Code"", ""SBL0014"");
			return;
		}

		iProductCount = psListOfProducts.GetChildCount();
		for (iCount = 0; iCount < iProductCount; iCount++)
		{
			psProduct = psListOfProducts.GetChild(iCount);
			switch (psProduct.GetProperty(""Action Code""))
			{
				case ""Delete"":
					sProductId = psProduct.GetProperty(""Product Id"");
					sProductName = psProduct.GetProperty(""Product Name"");

					psIn.Reset();
					psOut.Reset();
					with (psIn)
					{
						SetProperty(""Object Id"", sObjectId);
						SetProperty(""Root Id"", sRootId);
						SetProperty(""Product Id"", sProductId);
						SetProperty(""Path"", sRootPath);
						SetProperty(""Product Name"", sProductName);
						SetProperty(""IO Name"", sIOName);
					}
					FindProductPath(psIn, psOut);
					if (psOut.GetProperty(""Status"") != ""FOUND"")
					{
						psOutputs.SetProperty(""Status"", ""ERROR"");
						psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Product Deletion Failed"", sProductName, sProductId));
						psOutputs.SetProperty(""Error Code"", ""SBL0015"");
						return;
					}

					psIn.Reset();
					with (psIn)
					{
						SetProperty(""ObjId"", sObjectId);
						SetProperty(""RootId"", sRootId);
						SetProperty(""Path"", psOut.GetProperty(""Product Path""));
					}
					psOut.Reset();
					try
					{
						bsRCOIS.InvokeMethod(""RemoveItem"", psIn, psOut);
					}
					catch(e)
					{
						var sdelPsInput = TheApplication().NewPropertySet();
						var sdelPsOutput = TheApplication().NewPropertySet();
						with (sdelPsInput)
						{
							SetProperty(""ObjId"", sObjectId);
							SetProperty(""RootId"", sRootId);
							SetProperty(""IntObjName"", ""SIS OM Asset"");
						}
						bsRCOIS.InvokeMethod(""GetDetailedReqExpl"", sdelPsInput, sdelPsOutput);
						var sdelExpl = sdelPsOutput.GetProperty(""Expl0"");
						if(sdelExpl != null && sdelExpl != """")
						{
							sdelPsInput.Reset();
							with (sdelPsInput)
							{
								SetProperty(""ObjId"", sObjectId);
								SetProperty(""RootId"", sRootId);
							}
							bsRCOIS.InvokeMethod(""RemoveFailedRequests"", sdelPsInput, sdelPsOutput);
						}
					}

				break;
			}
		}
		for (iCount = 0; iCount < iProductCount; iCount++)
		{
			psProduct = psListOfProducts.GetChild(iCount);
			switch (psProduct.GetProperty(""Action Code""))
			{
				case ""Add"":
					sProductName = psProduct.GetProperty(""Product Name"");
					sProductId = psProduct.GetProperty(""Product Id"");

					psIn.Reset();
					psOut.Reset();
					with (psIn)
					{
						SetProperty(""Object Id"", sObjectId);
						SetProperty(""Root Id"", sRootId);
						SetProperty(""Root Product Id"", sRootProductId);
						SetProperty(""Path"", sRootPath);
						SetProperty(""Child Product Name"", sProductName);
						SetProperty(""Child Product Id"", sProductId);
						SetProperty(""IO Name"", sIOName);
					}
					FindProductDetails(psIn, psOut);

					if (psOut.GetProperty(""Status"") != ""FOUND"")
					{
						psOutputs.SetProperty(""Status"", ""ERROR"");
						psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Product Addition Failed; Not Found"", sProductName, sProductId));
						psOutputs.SetProperty(""Error Code"", ""SBL0016"");
						return;
					}

					if (psOut.GetProperty(""Instance Exists"") == ""Y"")
					{
						/*psOutputs.SetProperty(""Status"", ""ERROR"");
						psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Product Addition Failed; Already Exists"", sProductName, sProductId));
						psOutputs.SetProperty(""Error Code"", ""SBL0017"");
						return;*/
					}	
					else
					{
						psIn.Reset();
						with (psIn)
						{
							SetProperty(""ObjId"", sObjectId);
							SetProperty(""RootId"", sRootId);
							SetProperty(""Parent Path"", psOut.GetProperty(""Parent Path""));
							SetProperty(""Name"", psOut.GetProperty(""Product Name""));
							SetProperty(""Port Item Id"", psOut.GetProperty(""Port Item Id""));
							SetProperty(""Prod Item Id"", psOut.GetProperty(""Prod Item Id""));
							SetProperty(""Product Id"", psOut.GetProperty(""Product Id""));
							SetProperty(""Quantity"", ""1"");
						}
						psOut.Reset();
						try
						{
							bsRCOIS.InvokeMethod(""AddItem"", psIn, psOut);
						}
						catch(e)
						{
							var saddPsInput = TheApplication().NewPropertySet();
							var saddPsOutput = TheApplication().NewPropertySet();
							with (saddPsInput)
							{
								SetProperty(""ObjId"", sObjectId);
								SetProperty(""RootId"", sRootId);
								SetProperty(""IntObjName"", ""SIS OM Asset"");
							}
							bsRCOIS.InvokeMethod(""GetDetailedReqExpl"", saddPsInput, saddPsOutput);
							var saddExpl = saddPsOutput.GetProperty(""Expl0"");
							if(saddExpl != null && saddExpl != """")
							{
								saddPsInput.Reset();
								with (saddPsInput)
								{
									SetProperty(""ObjId"", sObjectId);
									SetProperty(""RootId"", sRootId);
								}
								bsRCOIS.InvokeMethod(""RemoveFailedRequests"", saddPsInput, saddPsOutput);
							}
						}
					}
				break;
			}
		}
		for (iCount = 0; iCount < iProductCount; iCount++)
		{
			psProduct = psListOfProducts.GetChild(iCount);
			switch (psProduct.GetProperty(""Action Code""))
			{
				case ""Update"":
					sProductName = psProduct.GetProperty(""Product Name"");
					sProductId = psProduct.GetProperty(""Product Id"");

					if (sProductName == ""ROOT"" || sProductId == ""ROOT"")
					{
						sProductPath = sRootPath;
					}
					else
					{
						psIn.Reset();
						psOut.Reset();
						with (psIn)
						{
							SetProperty(""Object Id"", sObjectId);
							SetProperty(""Root Id"", sRootId);
							SetProperty(""Product Id"", sProductId);
							SetProperty(""Path"", sRootPath);
							SetProperty(""Product Name"", sProductName);
							SetProperty(""IO Name"", sIOName);
						}
						FindProductPath(psIn, psOut);
						if (psOut.GetProperty(""Status"") != ""FOUND"")
						{
							psOutputs.SetProperty(""Status"", ""ERROR"");
							psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Product Updation Failed"", sProductName, sProductId));
							psOutputs.SetProperty(""Error Code"", ""SBL0018"");
							return;
						}
						sProductPath = psOut.GetProperty(""Product Path"");
					}

					iAttributeCount = psProduct.GetChildCount();
					for (iCount2 = 0; iCount2 < iAttributeCount; iCount2++)
					{
						psAttribute = psProduct.GetChild(iCount2);
						if (psAttribute.GetType() == ""Attribute"")
						{
							psIn.Reset();
							psOut.Reset();
							with (psIn)
							{
								SetProperty(""ObjId"", sObjectId);
								SetProperty(""RootId"", sRootId);
								SetProperty(""Path"", sProductPath);
								SetProperty(""Value"", psAttribute.GetProperty(""Attribute Value""));
								SetProperty(""Name"", psAttribute.GetProperty(""Attribute Name""));
								SetProperty(""XA Id"", ""XXX"");
							}
							bsRCOIS.InvokeMethod(""SetAttribute"", psIn, psOut);
						}
						else if (psAttribute.GetType() == ""Field"")
						{
							psIn.Reset();
							psOut.Reset();
							with (psIn)
							{
								SetProperty(""ObjId"", sObjectId);
								SetProperty(""RootId"", sRootId);
								SetProperty(""Path"", sProductPath);
								SetProperty(""FieldName"", psAttribute.GetProperty(""Field Name""));
								SetProperty(""Value"", psAttribute.GetProperty(""Field Value""));
							}
							bsRCOIS.InvokeMethod(""SetFieldValue"", psIn, psOut);
						}
					}

				break;
			}
		}
		psOutputs.SetProperty(""Status"", ""SUCCESS"");
		psOutputs.SetProperty(""Error Msg"", """");
		psOutputs.SetProperty(""Error Code"", """");
	}
	catch(E)
	{
		psOutputs.SetProperty(""Status"", ""ERROR"");
		psOutputs.SetProperty(""Error Msg"", E.errText);
		psOutputs.SetProperty(""Error Code"", E.errCode);
	}
	finally
	{
		bsRCOIS = null;
		psIn = null;
		psOut = null;
		psListOfProducts = null;
		psProduct = null;
		psAttribute = null;
		sRootId = sObjectId = sRootPath = sIOName = sProductName = sRootProductId = sProductPath = sProductId = iCount = iProductCount = iCount2 = iAttributeCount = null; //Dileep CR # 20130905_2
	}
}
"
function AddRemoveProductFromBackEnd(psInputs, psOutputs)
{
	try
	{
		var sRootId, sObjectId, sRootPath, sIOName, sProductName, sRootProductId, sProductPath, sProductId;
		var bsRCOIS;
		var sBSName = ""Remote Complex Object Instance Service"";
		var psIn, psOut, psListOfProducts, psProduct, psAttribute;
		var iCount, iProductCount, iCount2, iAttributeCount;

		bsRCOIS = TheApplication().GetService(sBSName);

		with (psInputs)
		{
			sObjectId = GetProperty(""Object Id"");
			sRootId = GetProperty(""Root Id"");
			sIOName = GetProperty(""IO Name"");
			psListOfProducts = GetChild(0);
		}//End with (psInputs)

		psIn = TheApplication().NewPropertySet();
		psOut = TheApplication().NewPropertySet();
		with (psIn)
		{
			SetProperty(""ObjId"", sObjectId);
			SetProperty(""RootId"", sRootId);
		}//End with (psIn)
		bsRCOIS.InvokeMethod(""GetRootPath"", psIn, psOut);
		sRootPath = psOut.GetProperty(""Path"");
		if (sRootPath == """")
		{
			psOutputs.SetProperty(""Status"", ""ERROR"");
			psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Root Path not found""));
			psOutputs.SetProperty(""Error Code"", ""SBL0013"");
			return;
		}//End if (sRootPath == """")

		psIn.Reset();
		psOut.Reset();
		with (psIn)
		{
			SetProperty(""ObjId"", sObjectId);
			SetProperty(""RootId"", sRootId);
		}//End with (psIn)
		bsRCOIS.InvokeMethod(""GetProductId"", psIn, psOut);
		sRootProductId = psOut.GetProperty(""Product Id"");
		if (sRootProductId == """")
		{
			psOutputs.SetProperty(""Status"", ""ERROR"");
			psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Root Product not found""));
			psOutputs.SetProperty(""Error Code"", ""SBL0014"");
			return;
		}//End if (sRootProductId == """")

		iProductCount = psListOfProducts.GetChildCount();
		for (iCount = 0; iCount < iProductCount; iCount++)
		{
			psProduct = psListOfProducts.GetChild(iCount);
			switch (psProduct.GetProperty(""Action Code""))
			{
				case ""Delete"":
					sProductId = psProduct.GetProperty(""Product Id"");
					sProductName = psProduct.GetProperty(""Product Name"");

					psIn.Reset();
					psOut.Reset();
					with (psIn)
					{
						SetProperty(""Object Id"", sObjectId);
						SetProperty(""Root Id"", sRootId);
						SetProperty(""Product Id"", sProductId);
						SetProperty(""Path"", sRootPath);
						SetProperty(""Product Name"", sProductName);
						SetProperty(""IO Name"", sIOName);
					}//End with (psIn)
					FindProductPath(psIn, psOut);
					if (psOut.GetProperty(""Status"") != ""FOUND"")
					{
						psOutputs.SetProperty(""Status"", ""ERROR"");
						psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Product Deletion Failed"", sProductName, sProductId));
						psOutputs.SetProperty(""Error Code"", ""SBL0015"");
						return;
					}//End if (psOut.GetProperty(""Status"") != ""FOUND"")

					psIn.Reset();
					with (psIn)
					{
						SetProperty(""ObjId"", sObjectId);
						SetProperty(""RootId"", sRootId);
						SetProperty(""Path"", psOut.GetProperty(""Product Path""));
					}//End with (psIn)
					psOut.Reset();
					bsRCOIS.InvokeMethod(""RemoveItem"", psIn, psOut);

				break;
				case ""Add"":
					sProductName = psProduct.GetProperty(""Product Name"");
					sProductId = psProduct.GetProperty(""Product Id"");

					psIn.Reset();
					psOut.Reset();
					with (psIn)
					{
						SetProperty(""Object Id"", sObjectId);
						SetProperty(""Root Id"", sRootId);
						SetProperty(""Root Product Id"", sRootProductId);
						SetProperty(""Path"", sRootPath);
						SetProperty(""Child Product Name"", sProductName);
						SetProperty(""Child Product Id"", sProductId);
						SetProperty(""IO Name"", sIOName);
					}//End with (psIn)
					FindProductDetails(psIn, psOut);

					if (psOut.GetProperty(""Status"") != ""FOUND"")
					{
						psOutputs.SetProperty(""Status"", ""ERROR"");
						psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Product Addition Failed; Not Found"", sProductName, sProductId));
						psOutputs.SetProperty(""Error Code"", ""SBL0016"");
						return;
					}//End if (psOut.GetProperty(""Status"") != ""FOUND"")

					if (psOut.GetProperty(""Instance Exists"") == ""Y"")
					{
						psOutputs.SetProperty(""Status"", ""ERROR"");
						psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Product Addition Failed; Already Exists"", sProductName, sProductId));
						psOutputs.SetProperty(""Error Code"", ""SBL0017"");
						return;
					}//End if (psOut.GetProperty(""Instance Exists"") == ""Y"")

					psIn.Reset();
					with (psIn)
					{
						SetProperty(""ObjId"", sObjectId);
						SetProperty(""RootId"", sRootId);
						SetProperty(""Parent Path"", psOut.GetProperty(""Parent Path""));
						SetProperty(""Name"", psOut.GetProperty(""Product Name""));
						SetProperty(""Port Item Id"", psOut.GetProperty(""Port Item Id""));
						SetProperty(""Prod Item Id"", psOut.GetProperty(""Prod Item Id""));
						SetProperty(""Product Id"", psOut.GetProperty(""Product Id""));
						SetProperty(""Quantity"", ""1"");
					}//End with (psIn)
					psOut.Reset();
					bsRCOIS.InvokeMethod(""AddItem"", psIn, psOut);

				break;
				case ""Update"":
					sProductName = psProduct.GetProperty(""Product Name"");
					sProductId = psProduct.GetProperty(""Product Id"");

					if (sProductName == ""ROOT"" || sProductId == ""ROOT"")
					{
						sProductPath = sRootPath;
					}//End if (sProductName == ""ROOT"" || sProductId == ""ROOT"")
					else
					{
						psIn.Reset();
						psOut.Reset();
						with (psIn)
						{
							SetProperty(""Object Id"", sObjectId);
							SetProperty(""Root Id"", sRootId);
							SetProperty(""Product Id"", sProductId);
							SetProperty(""Path"", sRootPath);
							SetProperty(""Product Name"", sProductName);
							SetProperty(""IO Name"", sIOName);
						}//End with (psIn)
						FindProductPath(psIn, psOut);
						if (psOut.GetProperty(""Status"") != ""FOUND"")
						{
							psOutputs.SetProperty(""Status"", ""ERROR"");
							psOutputs.SetProperty(""Error Msg"", TheApplication().LookupMessage(""User Defined Errors"", ""STC OM PROD CONFIG API: Product Updation Failed"", sProductName, sProductId));
							psOutputs.SetProperty(""Error Code"", ""SBL0018"");
							return;
						}//End if (psOut.GetProperty(""Status"") != ""FOUND"")
						sProductPath = psOut.GetProperty(""Product Path"");
					}//End else

					iAttributeCount = psProduct.GetChildCount();
					for (iCount2 = 0; iCount2 < iAttributeCount; iCount2++)
					{
						psAttribute = psProduct.GetChild(iCount2);
						if (psAttribute.GetType() == ""Attribute"")
						{
							psIn.Reset();
							psOut.Reset();
							with (psIn)
							{
								SetProperty(""ObjId"", sObjectId);
								SetProperty(""RootId"", sRootId);
								SetProperty(""Path"", sProductPath);
								SetProperty(""Value"", psAttribute.GetProperty(""Attribute Value""));
								SetProperty(""Name"", psAttribute.GetProperty(""Attribute Name""));
								SetProperty(""XA Id"", ""XXX"");
							}//End with (psIn)
							bsRCOIS.InvokeMethod(""SetAttribute"", psIn, psOut);
						}//End if (psAttribute.GetType() == ""Attribute"")
						else if (psAttribute.GetType() == ""Field"")
						{
							psIn.Reset();
							psOut.Reset();
							with (psIn)
							{
								SetProperty(""ObjId"", sObjectId);
								SetProperty(""RootId"", sRootId);
								SetProperty(""Path"", sProductPath);
								SetProperty(""FieldName"", psAttribute.GetProperty(""Field Name""));
								SetProperty(""Value"", psAttribute.GetProperty(""Field Value""));
							}//End with (psIn)
							bsRCOIS.InvokeMethod(""SetFieldValue"", psIn, psOut);
						}//End else if (psAttribute.GetType() == ""Field"")
					}//End for (iCount2 = 0; iCount2 < iAttributeCount; iCount2++)
				break;								
			}//End switch (psProduct.GetProperty(""Action Code""))
		}//End for (iCount = 0; iCount < iProductCount; iCount++)
		psOutputs.SetProperty(""Status"", ""SUCCESS"");
		psOutputs.SetProperty(""Error Msg"", """");
		psOutputs.SetProperty(""Error Code"", """");
	}//End try
	catch(E)
	{
		psOutputs.SetProperty(""Status"", ""ERROR"");
		psOutputs.SetProperty(""Error Msg"", E.errText);
		psOutputs.SetProperty(""Error Code"", E.errCode);
	}//End catch(E)
	finally
	{
		bsRCOIS = null;
		psIn = null;
		psOut = null;
		psListOfProducts = null;
		psProduct = null;
		psAttribute = null;
		sRootId = sObjectId = sRootPath = sIOName = sProductName = sRootProductId = sProductPath = sProductId = iCount = iProductCount = iCount2 = iAttributeCount = null; //Dileep CR # 20130905_2
	}//End finally
}//End function"
"
function EnumObjects (psInputs, psOutputs)
{
try
{
	var psIn, psOut;
	var sRootId, sObjectId, sIntObjName, sParentPath;
	var sBSName = ""Remote Complex Object Instance Service"";
	var bsRCIOS;

	sRootId = psInputs.GetProperty(""Root Id"");
	sObjectId = psInputs.GetProperty(""Object Id"");
	sIntObjName = psInputs.GetProperty(""IO Name"");
	sParentPath = psInputs.GetProperty(""Parent Path"");

	psIn = TheApplication().NewPropertySet();
	psOut = TheApplication().NewPropertySet();

	if (sParentPath == """")
	{
		psOutputs.AddChild(psOut.Copy());
		return;
	}
	with (psIn)
	{
		SetProperty(""RootId"", sRootId);
		SetProperty(""ObjId"", sObjectId);
		SetProperty(""IntObjName"", sIntObjName);
		SetProperty(""Parent Path"", sParentPath);
	}

	bsRCIOS = TheApplication().GetService(sBSName);
	bsRCIOS.InvokeMethod(""EnumObjects"", psIn, psOut);

	psOutputs.AddChild(psOut.Copy());
}
catch(E)
{
	throw E;
}
finally
{
	psOut = null;
	psIn = null;
	bsRCIOS = null;
}
}
"
function FindProductDetails(psInputs, psOutputs)
{
	try
	{
		var sObjectId, sRootId, sRootProductId, sPath, sChildProductName, sChildProductId, sIOName;
		var bsRCOIS;
		var psIn, psOut, psListOfPorts, psEnumObjects;
		var sInterimPath, sInterimProductId;
		var sBSName = ""Remote Complex Object Instance Service"";
		var iCount;

		with (psInputs)
		{
			sObjectId = GetProperty(""Object Id"");
			sRootId = GetProperty(""Root Id"");
			sRootProductId = GetProperty(""Root Product Id"");
			sPath = GetProperty(""Path"");
			sChildProductName = GetProperty(""Child Product Name"");
			sChildProductId = GetProperty(""Child Product Id"");
			sIOName = GetProperty(""IO Name"");
		}

		bsRCOIS = TheApplication().GetService(sBSName);

		psIn = TheApplication().NewPropertySet();
		psOut = TheApplication().NewPropertySet();

		psIn.SetProperty(""Product Id"", sRootProductId);
		GetAllPorts(psIn, psOut);
		psListOfPorts = psOut.GetChild(0).Copy();

		psIn.Reset();
		psOut.Reset();
		with (psIn)
		{
			SetProperty(""Product Id"", sChildProductId);
			SetProperty(""Product Name"", sChildProductName);
			AddChild(psListOfPorts.Copy());
		}
		GetPortProductInfo(psIn, psOut);
		if (psOut.GetProperty(""Status"") == ""FOUND"")
		{
			with (psOutputs)
			{
				SetProperty(""Status"", ""FOUND"");
				SetProperty(""Parent Path"", sPath);
				SetProperty(""Product Id"", psOut.GetProperty(""Product Id""));
				SetProperty(""Prod Item Id"", psOut.GetProperty(""Prod Item Id""));
				SetProperty(""Product Name"", psOut.GetProperty(""Product Name""));
				SetProperty(""Port Item Id"", psOut.GetProperty(""Port Item Id""));
				SetProperty(""Port Name"", psOut.GetProperty(""Port Name""));
			}

			psIn.Reset();
			psOut.Reset();
			with (psIn)
			{
				SetProperty(""Root Id"", sRootId);
				SetProperty(""Object Id"", sObjectId);
				SetProperty(""IO Name"", sIOName);
				SetProperty(""Parent Path"", sPath);
			}
			EnumObjects(psIn, psOut);
			psEnumObjects = psOut.GetChild(0).Copy();

			psIn.Reset();
			psOut.Reset();
			with (psIn)
			{
				SetProperty(""Product Id"", sChildProductId);
				SetProperty(""Product Name"", sChildProductName);
				AddChild(psEnumObjects.Copy());
			}
			GetPath(psIn, psOut);
			if (psOut.GetProperty(""Status"") == ""FOUND"")
				psOutputs.SetProperty(""Instance Exists"", ""Y"");
			else
				psOutputs.SetProperty(""Instance Exists"", ""N"");

			return;
		}

		psIn.Reset();
		psOut.Reset();
		with (psIn)
		{
			SetProperty(""Root Id"", sRootId);
			SetProperty(""Object Id"", sObjectId);
			SetProperty(""IO Name"", sIOName);
			SetProperty(""Parent Path"", sPath);
		}
		EnumObjects(psIn, psOut);
		psEnumObjects = psOut.GetChild(0).Copy();

		for (iCount = 0; iCount < psEnumObjects.GetChildCount(); iCount++)
		{
			with (psEnumObjects.GetChild(iCount))
			{
				sInterimPath = GetProperty(""Path"");
				sInterimProductId = GetProperty(""Product Id"");
			}
			psIn.Reset();
			psOut.Reset();
			with (psIn)
			{
				SetProperty(""Object Id"", sObjectId);
				SetProperty(""Root Id"", sRootId);
				SetProperty(""Root Product Id"", sInterimProductId);
				SetProperty(""Path"", sInterimPath);
				SetProperty(""Child Product Name"", sChildProductName);
				SetProperty(""Child Product Id"", sChildProductId);
				SetProperty(""IO Name"", sIOName);
			}
			FindProductDetails(psIn, psOut);
			if (psOut.GetProperty(""Status"") == ""FOUND"")
			{
				with (psOutputs)
				{
					SetProperty(""Status"", ""FOUND"");
					SetProperty(""Parent Path"", psOut.GetProperty(""Parent Path""));
					SetProperty(""Product Id"", psOut.GetProperty(""Product Id""));
					SetProperty(""Prod Item Id"", psOut.GetProperty(""Prod Item Id""));
					SetProperty(""Product Name"", psOut.GetProperty(""Product Name""));
					SetProperty(""Port Item Id"", psOut.GetProperty(""Port Item Id""));
					SetProperty(""Port Name"", psOut.GetProperty(""Port Name""));
					SetProperty(""Instance Exists"", psOut.GetProperty(""Instance Exists""));
				}
				return;
			}
		}
		psOutputs.SetProperty(""Status"", ""NOTFOUND"");
	}
	catch(E)
	{
		throw E;
	}
	finally
	{
		bsRCOIS = null;
		psIn = null;
		psOut = null;
		psListOfPorts = null;
		psEnumObjects = null;
	}
}
"
function FindProductPath(psInputs, psOutputs)
{
	try
	{
		var sObjectId, sRootId, sProductId, sPath, sProductName, sIOName;
		var bsRCOIS;
		var psIn, psOut, psEnumObjects;
		var sInterimPath;
		var sBSName = ""Remote Complex Object Instance Service"";
		var iCount;

		with (psInputs)
		{
			sObjectId = GetProperty(""Object Id"");
			sRootId = GetProperty(""Root Id"");
			sProductId = GetProperty(""Product Id"");
			sPath = GetProperty(""Path"");
			sProductName = GetProperty(""Product Name"");
			sIOName = GetProperty(""IO Name"");
		}

		bsRCOIS = TheApplication().GetService(sBSName);

		psIn = TheApplication().NewPropertySet();
		psOut = TheApplication().NewPropertySet();

		with (psIn)
		{
			SetProperty(""Root Id"", sRootId);
			SetProperty(""Object Id"", sObjectId);
			SetProperty(""IO Name"", sIOName);
			SetProperty(""Parent Path"", sPath);
		}
		EnumObjects(psIn, psOut);
		psEnumObjects = psOut.GetChild(0).Copy();

		psIn.Reset();
		psOut.Reset();
		with (psIn)
		{
			SetProperty(""Product Id"", sProductId);
			SetProperty(""Product Name"", sProductName);
			AddChild(psEnumObjects.Copy());
		}
		GetPath(psIn, psOut);
		if (psOut.GetProperty(""Status"") == ""FOUND"")
		{
			psOutputs.SetProperty(""Status"", ""FOUND"");
			psOutputs.SetProperty(""Product Path"", psOut.GetProperty(""Path""));
			return;
		}

		for (iCount = 0; iCount < psEnumObjects.GetChildCount(); iCount++)
		{
			sInterimPath = psEnumObjects.GetChild(iCount).GetProperty(""Path"");

			psIn.Reset();
			psOut.Reset();
			with (psIn)
			{
				SetProperty(""Object Id"", sObjectId);
				SetProperty(""Root Id"", sRootId);
				SetProperty(""Product Id"", sProductId);
				SetProperty(""Path"", sInterimPath);
				SetProperty(""Product Name"", sProductName);
				SetProperty(""IO Name"", sIOName);
			}
			FindProductPath(psIn, psOut);
			if (psOut.GetProperty(""Status"") == ""FOUND"")
			{
				with (psOutputs)
				{
					SetProperty(""Status"", ""FOUND"");
					SetProperty(""Product Path"", psOut.GetProperty(""Product Path""));
				}
				return;
			}
		}
		psOutputs.SetProperty(""Status"", ""NOTFOUND"");
	}
	catch(E)
	{
		throw E;
	}
	finally
	{
		bsRCOIS = null;
		psIn = null;
		psOut = null;
		psEnumObjects = null;
	}
}
"
function GetAllPorts(psInputs, psOutputs)
{
try
{
	var psIn, psOut;
	var sBSName = ""Remote Complex Object Instance Service"";
	var bsRCOIS;
	var sProductId;

	sProductId = psInputs.GetProperty(""Product Id"");

	psIn = TheApplication().NewPropertySet();
	psOut = TheApplication().NewPropertySet();

	if (sProductId == """")
	{
		psOutputs.AddChild(psOut.Copy());
		return;
	}

	bsRCOIS = TheApplication().GetService(sBSName);

	psIn.SetProperty(""GetPortDomain"", ""Y"");
	psIn.SetProperty(""Product Id"", sProductId);
	bsRCOIS.InvokeMethod(""GetAllPorts"", psIn, psOut);

	psOutputs.AddChild(psOut.Copy());
}
catch(E)
{
	throw E;
}
finally
{
	psIn = null;
	psOut = null;
	bsRCOIS = null;
}
}
"
function GetPath(psInputs, psOutputs)
{
try
{
	var psEnum;
	var sProductName = """", sProductId = """", sPath = """", sStatus = ""NOTFOUND"";
	var iCount, iTotalCount;

	sProductName = psInputs.GetProperty(""Product Name"");
	sProductId = psInputs.GetProperty(""Product Id"");
	psEnum = psInputs.GetChild(0);
	iTotalCount = psEnum.GetChildCount();

	for (iCount = 0; iCount < iTotalCount; iCount++)
	{
		if (sProductId != """")
		{
			if (sProductId == psEnum.GetChild(iCount).GetProperty(""Product Id""))
			{
				sPath = psEnum.GetChild(iCount).GetProperty(""Path"");
				sStatus = ""FOUND"";
				break;
			}
		}
		else if (sProductName != """")
		{
			if (sProductName == psEnum.GetChild(iCount).GetProperty(""Name""))
			{
				sPath = psEnum.GetChild(iCount).GetProperty(""Path"");
				sStatus = ""FOUND"";
				break;
			}
		}
	}
}
catch(E)
{
	throw E;
}
finally
{
	psOutputs.SetProperty(""Path"", sPath);
	psOutputs.SetProperty(""Status"", sStatus);
	psEnum = null;
}
}
"
function GetPortProductInfo(psInputs, psOutputs)
{
try
{
	var iPortCount, iPort, iProdCount, iProd, sProductName, sProductId, sStatus = ""NOTFOUND"";
	var psListOfPorts, psPort, psProd;

	sProductName = psInputs.GetProperty(""Product Name"");
	sProductId = psInputs.GetProperty(""Product Id"");
	psListOfPorts = psInputs.GetChild(0);

	iPortCount = psListOfPorts.GetChildCount();

	for (iPort = 0; iPort < iPortCount; iPort++)
	{
		psPort = psListOfPorts.GetChild(iPort);
		iProdCount = psPort.GetChildCount();
		for (iProd = 0; iProd < iProdCount; iProd++)
		{
			psProd = psPort.GetChild(iProd);

			if (sProductId != """")
			{
				if (sProductId == psProd.GetProperty(""Product Id""))
				{
					sStatus = ""FOUND"";
				}
			}
			else if (sProductName != """")
			{
				if (sProductName == psProd.GetProperty(""Name""))
				{
					sStatus = ""FOUND"";
				}
			}
			if (sStatus == ""FOUND"")
			{
				with (psOutputs)
				{
					SetProperty(""Product Id"", psProd.GetProperty(""Product Id""));
					SetProperty(""Prod Item Id"", psProd.GetProperty(""Prod Item Id""));
					SetProperty(""Product Name"", psProd.GetProperty(""Name""));
					SetProperty(""Port Item Id"", psPort.GetProperty(""Port Item Id""));
					SetProperty(""Port Name"", psPort.GetProperty(""Name""));
					SetProperty(""Status"", sStatus);
				}
				return;
			}
		}
	}
	psOutputs.SetProperty(""Status"", sStatus);
}
catch(E)
{
	throw E;
}
finally
{
	psListOfPorts = null;
	psPort = null;
	psProd = null;
}
}
function GetProductPortDetails(psInputs, psOutputs)
{
	try
	{
		var psIn, psOut;
		var sBSName = ""Remote Complex Object Instance Service"";
		var bsRCOIS;
		var sProductId, sParentProdId, iPort, sProductName, iPortCount, iProd, iProdCount, psPort, psProd, sStatus = ""NOTFOUND"";
	
		sProductId = psInputs.GetProperty(""Product Id"");
		sProductName = psInputs.GetProperty(""Product Name"");
		sParentProdId = psInputs.GetProperty(""Parent Product Id"");
	
		psIn = TheApplication().NewPropertySet();
		psOut = TheApplication().NewPropertySet();
		psPort = TheApplication().NewPropertySet();
		psProd = TheApplication().NewPropertySet();
	
	/*	if (sProductId == """")
		{
			psOutputs.AddChild(psOut.Copy());
			return;
		}*/
	
		bsRCOIS = TheApplication().GetService(sBSName);
	
		psIn.SetProperty(""GetPortDomain"", ""Y"");
		psIn.SetProperty(""Product Id"", sParentProdId);
		bsRCOIS.InvokeMethod(""GetAllPorts"", psIn, psOut);
	
		iPortCount = psOut.GetChildCount();
	
		for (iPort = 0; iPort < iPortCount; iPort++)
		{
			psPort = psOut.GetChild(iPort);
			iProdCount = psPort.GetChildCount();
			for (iProd = 0; iProd < iProdCount; iProd++)
			{
				psProd = psPort.GetChild(iProd);
	
				if (sProductId != """")
				{
					if (sProductId == psProd.GetProperty(""Product Id""))
					{
						sStatus = ""FOUND"";
					}
				}
				else if (sProductName != """")
				{
					if (sProductName == psProd.GetProperty(""Name""))
					{
						sStatus = ""FOUND"";
					}
				}
				if (sStatus == ""FOUND"")
				{
					with (psOutputs)
					{
						SetProperty(""Product Id"", psProd.GetProperty(""Product Id""));
						SetProperty(""Prod Item Id"", psProd.GetProperty(""Prod Item Id""));
						SetProperty(""Product Name"", psProd.GetProperty(""Name""));
						SetProperty(""Port Item Id"", psPort.GetProperty(""Port Item Id""));
						SetProperty(""Port Name"", psPort.GetProperty(""Name""));
						SetProperty(""Status"", sStatus);
					}
					return;
				}
			}
		}
	}
	catch(E)
	{
		throw E;
	}
	finally
	{
		psIn = null;
		psOut = null;
		psProd = null;
		psPort = null;
		bsRCOIS = null;
	}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	switch (MethodName)
	{
		case ""AddRemoveProduct"":
			AddRemoveProduct(Inputs, Outputs);
		break;
		case ""AddRemoveProductFromBackEnd"":
			AddRemoveProductFromBackEnd(Inputs, Outputs);
		break;
		case ""AddRemoveProductChangeRatePlan"":
			AddRemoveProductChangeRatePlan(Inputs, Outputs);
		break;
		case ""ShiftHierarchy"":
			ShiftHierarchy(Inputs, Outputs);
		break;
	
		case ""GetProductPortDetails"":
			GetProductPortDetails(Inputs, Outputs);
		break;
		
		case ""AddNewPackageProducts"":
			AddNewPackageProducts(Inputs, Outputs);
		break;
		
		case "fnPopulateProductInstance"":
			fnPopulateProductInstance(Inputs, Outputs);
		break;
		
	}
 return (CancelOperation);
}
"
function ShiftHierarchy(psInputs, psOutputs)
{
	try
	{
		var iCount;
		var psPar;
		iCount = psInputs.GetChildCount();
		psPar = TheApplication().NewPropertySet();
		psPar.SetType(psInputs.GetProperty(""ParentType""));
		while (iCount > 0) {
			psPar.AddChild(psInputs.GetChild(iCount - 1));
			iCount = iCount - 1;
		}
		psOutputs.AddChild(psPar.Copy());
	}
	catch(E)
	{
		throw E;
	}
	finally
	{
		psPar = null;
	}
}
function fnGetProdRowId(pProdRowIdInputs, pProdRowIdOutputs)
{
	var boAdminProduct = TheApplication().GetBusObject(""Admin ISS Product Definition"");
    var bcInternalProduct = boAdminProduct.GetBusComp(""Internal Product - ISS Admin"");
    var Productpartnum = pProdRowIdInputs.GetProperty(""ProductPartNum"");
    var ProductId = """"; var ProductName = """";
    with(bcInternalProduct)
    {
	     SetViewMode(3);
	     ClearToQuery();   
	     ActivateField(""Name"");
	//     ActivateField(""Billing Service Type"");
	     ActivateField(""Type"");
	     SetSearchExpr(""[Part #]= '""+Productpartnum+""' AND [Version Status] = 'Active'"");
	     ExecuteQuery(ForwardOnly);
	     if(FirstRecord())
	     {
	     	ProductId = GetFieldValue(""Id"");
	     	ProductName = GetFieldValue(""Name"");
	     }
    }
    pProdRowIdOutputs.SetProperty(""ProductId"", ProductId);
    pProdRowIdOutputs.SetProperty(""ProductName"", ProductName);
}
function fnPopulateProductInstance(Inputs, Outputs) 
{ 
 try 
 { 
   var appObj; 
   var bsCOIS; 
   var sListOfItemNodeName; 
   var sListOfAttributeNodeName; 
   var propInputs; 
   var propOutputs; 
   var nodTemp;      
   var nodItem; 
   var nChildCount; 
   var nodChild; 
   var nodasset; 
   var ChildNode; 
   var propRPInputs; 
   var propRPOutputs; 
   var nAssetCount; 
   var sRootPath; 
   var parentfound=""N""; 
   var strChildProductName; 
   var sProjectId; 
   var sProjectManagedServiceRequired; 
   var NodeOrder;  
   var type; 
   var prodid; 
   var Propaddinputs; 
   var sOrderSubType = """"; 
   var chkparentoutputs; 
    var rootpathid=Inputs.GetProperty(""RootPathId""); 
    
   appObj = TheApplication(); 
   var glbServiceName = Inputs.GetProperty(""ObjectInstanceServiceName""); 
   bsCOIS = appObj.GetService(glbServiceName);
   sListOfItemNodeName = Inputs.GetProperty(""ListOfItemNodeType""); //eg: ListOfOrder Entry - Line Items   
   sListOfAttributeNodeName = Inputs.GetProperty(""ListOfAttributeNodeType""); //eg: ListOfOrderItemXA   
 
      propInputs = null; 
   propOutputs = null;       
      propInputs = appObj.NewPropertySet(); 
   propOutputs = appObj.NewPropertySet(); 
 
    
   nodTemp = null; 
   nodTemp = Inputs.GetChild(0); //Get the Siebel Message node    
   propRPInputs = null; 
   propRPOutputs = null; 
 
    
   nodItem = null; 
    
 
   while(nodTemp.GetType() != ""ListOfLineItem"") //While the node type is not sListOfItemNodeName 
   {    
    nodTemp = nodTemp.GetChild(0);   
   } 
   var sProductName = nodTemp.GetChild(0).GetProperty(""Product""); 
     var boAdminProduct = appObj.GetBusObject(""Admin ISS Product Definition""); 
    var bcInternalProduct = boAdminProduct.GetBusComp(""Internal Product - ISS Admin""); 
    with(bcInternalProduct) 
    { 
     SetViewMode(3); 
     ClearToQuery();    
     ActivateField(""Name""); 
     ActivateField(""Billing Service Type""); 
     SetSearchSpec(""Part #"" , sProductName); 
     ExecuteQuery(ForwardOnly); 
    } 
    if(bcInternalProduct.FirstRecord())  
    {    
  //   billingServicetypeOrder= bcInternalProduct.GetFieldValue(""Billing Service Type""); 
     prodid = bcInternalProduct.GetFieldValue(""Id""); 
     type = bcInternalProduct.GetFieldValue(""Type""); 
    } 
    else 
    {   
      var error= ""Invlid Service Name""; 
      throw(error); 
    }    
     
 /*   if(type == ""Service Plan"") 
       sOrderSubType =""RatePlan""; 
  */   
  
  
  
	var NewPkgInputs = appObj.NewPropertySet(); 
   	var NewPkgOutputs = appObj.NewPropertySet(); 
	with(NewPkgInputs) 
	{ 
	 SetProperty(""Object Id"",Inputs.GetProperty(""ObjId""));     
	 SetProperty(""Root Id"",Inputs.GetProperty(""RootPathId""));
	 SetProperty(""IO Name"", ""SIS OM Asset"");
	}
	NewPkgInputs.AddChild(nodTemp);
	AddNewPackageProducts(NewPkgInputs, NewPkgOutputs)
   //Find the Root Product Path----------- 
 /*  propRPInputs = appObj.NewPropertySet(); 
   propRPOutputs = appObj.NewPropertySet(); 
   with(propRPInputs) 
   { 
    SetProperty(""ObjId"",Inputs.GetProperty(""ObjId""));     
    SetProperty(""RootId"",Inputs.GetProperty(""RootPathId"")); 
   }    
   bsCOIS.InvokeMethod(""GetRootPath"",propRPInputs, propRPOutputs);  
   sRootPath = propRPOutputs.GetProperty(""Path""); 
   var EAIBS= appObj.GetService(""EAI Siebel Adapter""); 
   var assetinputs= appObj.NewPropertySet(); 
   var assetoutputs= appObj.NewPropertySet(); 
  
   var searchspec = '[Header.Id] = ""' + rootpathid + '"" AND [Header.Status] <> ""Inactive"" AND [Line Item.Status] <>  ""Inactive""'; 
   assetinputs.SetProperty(""SearchSpec"",searchspec); 
   assetinputs.SetProperty(""OutputIntObjectName"",""SIS OM Asset""); 
   EAIBS.InvokeMethod(""Query"",assetinputs,assetoutputs); 
 while(assetoutputs.GetType() != ""ListOfLine Item"") //While the node type is not sListOfItemNodeName 
   {    
    assetoutputs = assetoutputs.GetChild(0);   
   }
   
   propRPOutputs = null; 
   propRPInputs = null; 
   bsCOIS = null; 
   //---------------------------------------- 
   
   nAssetCount = assetoutputs.GetChildCount();   
//TheApplication().RaiseErrorText(""Value of AssetCount""+nAssetCount); 
 
   for(var nIndex=0;nIndex<nAssetCount;nIndex++) 
   { 
      nodItem = null;     
    nodItem = assetoutputs.GetChild(nIndex); 
    propInputs = appObj.NewPropertySet(); 
    propOutputs = appObj.NewPropertySet(); 
     nChildCount = nodTemp.GetChildCount(); 
    with(propInputs) 
    {    
     SetProperty(""Sequence Num"",(nIndex + 1)); // Used to find the correct item in the product instance 
     SetProperty(""Parent Product Id"",""""); 
     SetProperty(""Intg Obj Name"",Inputs.GetProperty(""IntObjName"")); //uncommented 
     SetProperty(""Parent Product Path"",sRootPath); 
     SetProperty(""ListOfAttributeNodeType"",sListOfAttributeNodeName); 
     SetProperty(""ObjId"",Inputs.GetProperty(""ObjId"")); 
     SetProperty(""RootPathId"",Inputs.GetProperty(""RootPathId"")); 
     SetProperty(""OrderSubType"",sOrderSubType); 
     SetProperty(""ChildCount"",nChildCount); 
   //  SetProperty(""Product Name Tag"",Inputs.GetProperty(""ProductNameTag"")); 
     SetProperty(""Attribute Name Tag"",""AttributeName""); 
     SetProperty(""Attribute Value Tag"",""AttributeValue""); 
     SetProperty(""Root Intg Id"", sRootPath); 
     SetProperty(""New Order"",""Y""); 
     SetProperty(""New Node"",""Y"");      
    }      
  */   
 /*   fnParsePropertySet(propInputs, propOutputs, nodItem,nodTemp); 
    var action =nodTemp.GetChild(0).GetProperty(""Action""); 
    if(prodadded == ""FALSE"" && action==""Add"") 
    { 
     prodadded = ""TRUE""; 
     chkparentoutputs= appObj.NewPropertySet(); 
     fncheckparent(chkparentoutputs,nodTemp); 
    var parentproduct =chkparentoutputs.GetProperty(""parentproduct""); 
  */  if(NewPkgOutputs.GetProperty(""Error Msg"") != """" && NewPkgOutputs.GetProperty(""Error Msg"") != null) 
     { 
     	var error=  NewPkgOutputs.GetProperty(""Error Code"")+"" ""+NewPkgOutputs.GetProperty(""Error Msg"");
    //   var error= sProductName +""is invalid service under this plan""; 
        throw(error); 
      }     
  //    nIndex = -1; 
// } 
  
/*    propInputs = null; 
    propOutputs = null; 
   }//For End 
   appObj = null; 
 }//Try End 
  */
 }
 catch(e) 
 {   
  throw(e); 
 } 
 finally 
 { 
  nodItem = null; 
  propRPInputs = null; 
  propRPOutputs = null; 
  nodTemp = null;  
  propOutputs = null; 
  propInputs = null;   
  bsCOIS = null; 
  appObj = null;  
 } 
}
function CheckAPNName(Inputs, Outputs)
{
var AccountId = Inputs.GetProperty(""AccountId"");
var APNName = Inputs.GetProperty(""APNName"");
var AppObj = TheApplication();
var AssetBO = AppObj.GetBusObject(""Asset Management"");
var APNVal;
var APNFound = ""No"";
var AssetBC = AssetBO.GetBusComp(""Asset Mgmt - Asset"");
var AssetXABC = AssetBO.GetBusComp(""Asset Mgmt - Asset XA"");


	with(AssetBC)
	{	
		ActivateField(""Service Account Id"");
		ActivateField(""Product Part Number"");
		ClearToQuery();
		SetViewMode(AllView);
		SetSearchExpr(""[Service Account Id] = '"" + AccountId + ""' AND [Product Part Number] = 'CORPAPNA1'""); 
		ExecuteQuery(ForwardOnly);
		var AssetRec = FirstRecord();
		if(AssetRec)
		{
			var AssetId = GetFieldValue(""Asset Id"");
			with(AssetXABC)
			{
				ActivateField(""Product Part Number"");
				ClearToQuery();
				SetViewMode(AllView);
				SetSearchExpr(""[Object Id] = '"" + AssetId + ""' AND [Name] = 'APN_APNName'"");
				ExecuteQuery()
				{
					APNVal = GetFieldValue(""Text Value"");
				}
			}
			if(APNVal == APNName)
			{
				APNFound = ""Yes"";
				AssetRec = "false"";
			}
			else
			{
				AssetRec = NextRecord();
			}
		}
	}
Outputs.SetProperty(""APNFound"",APNFound);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	 switch(MethodName)
     {
		case ""CheckAPNName"":
		CheckAPNName(Inputs, Outputs);
		return(CancelOperation);
		break;
		
	   default:
          return (ContinueOperation);
       }
	
	return (ContinueOperation);
}
function GetAccessoryCount(vCustomerId)
{
//var vApp = TheApplication();
	var vBusinessService = TheApplication().GetService(""STC Get Accessory Count BS"");
	var vInputPS = TheApplication().NewPropertySet();
	var vOutputPS = TheApplication().NewPropertySet();
	vInputPS.SetProperty(""AccountId"",vCustomerId);
	vBusinessService.InvokeMethod(""QueryAccessory"",vInputPS,vOutputPS);
	var vBillEquipRec = vOutputPS.GetProperty(""BillEqipRec"");
	var vDeleteEquipRec = vOutputPS.GetProperty(""DeleteEqipRec"");
	var vFinalDeviceCount = vBillEquipRec - vDeleteEquipRec;
	return(vFinalDeviceCount);
}
function GetCustomerAge(AccountId)
{
	try
	{
		var AppObj=TheApplication();
		var AccountBO=AppObj.GetBusObject(""Account"");
		var AccountBC=AccountBO.GetBusComp(""Account"");
		var vPriContactId=null,vContactBC=null,vCustAge=null,vDob=null;
		var vCurrDate=new Date();
		var vSysdate=vCurrDate.getTime();
		var vDobdate=null,vDiff=null;
		with(AccountBC)
		{
			SetViewMode(AllView);
			ActivateField(""Primary Contact Id"");
			ClearToQuery();
			SetSearchSpec(""Id"",AccountId);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
			{
				vPriContactId=GetFieldValue(""Primary Contact Id"");
				vContactBC=AccountBO.GetBusComp(""Contact"");
				with(vContactBC)
				{
					SetViewMode(AllView);
					ActivateField(""Birth Date"");
					ClearToQuery();
					SetSearchSpec(""Id"",vPriContactId);
					ExecuteQuery(ForwardOnly);
					if(FirstRecord())
					{
						vDob=GetFieldValue(""Birth Date"");
						vDobdate=new Date(vDob);
						vDobdate=vDobdate.getTime();
						vDiff=vSysdate-vDobdate;
						vDiff=vDiff/86400000;
						vDiff=vDiff/365;
						vDiff=Math.floor(vDiff);
						vCustAge=vDiff;
					}
					
				}
			}

		}
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
		vPriContactId=null;
		vContactBC=null;
		vDob=null;
		vDobdate=null;
		vDiff=null;
		AccountBC=null;
		AccountBO=null;
		AppObj=null;
		vCurrDate=null;
		vSysdate=null
	}
	return(vCustAge);
}
function GetDeviceCount(vCustomerId)
{
	//var vApp = TheApplication();
	var vBusinessService = TheApplication().GetService(""Workflow Process Manager"");
	var vInputPS = TheApplication().NewPropertySet();
	var vOutputPS = TheApplication().NewPropertySet();
	vInputPS.SetProperty(""Object Id"",vCustomerId);
	vInputPS.SetProperty(""ProcessName"",""STC Single View Eligibility Device Count WF"");
	vBusinessService.InvokeMethod(""RunProcess"",vInputPS,vOutputPS);
	var vBillEquipRec = ToNumber(vOutputPS.GetProperty(""BillEqipRec""));
	var vDeleteEquipRec = ToNumber(vOutputPS.GetProperty(""DeleteEqipRec""));
	var vFinalDeviceCount = vBillEquipRec - vDeleteEquipRec;
	return(vFinalDeviceCount);
}
function GetExperianDeviceCnt(vCustomerId)
{
	//Indrasen: created for Experian Credit Scoring SD
	var vCANTermCharge=0;
	var vBusinessService = TheApplication().GetService(""Workflow Process Manager"");
	var vInputPS = TheApplication().NewPropertySet();
	var vOutputPS = TheApplication().NewPropertySet();
	vInputPS.SetProperty(""Object Id"",vCustomerId);
	vInputPS.SetProperty(""ProcessName"",""STC Get CAN Termination Account Balance CRM WF"");
	vBusinessService.InvokeMethod(""RunProcess"",vInputPS,vOutputPS);

	vCANTermCharge = vOutputPS.GetProperty(""vCANTermCharge"");
	if(vCANTermCharge == """")
		vCANTermCharge = 0;

	return(vCANTermCharge);
}
function Init(Inputs, Outputs)
{
	try
	{
		with (Outputs)
		{
			SetProperty(""STC Device Number"","""");			
			SetProperty(""STC Plan Category"","""");
			SetProperty(""STC Installment Number"","""");
			//MANUJ: Single View SD Revamp
			SetProperty(""SmartPlanInstallmentNo"","""");
			SetProperty(""SIMOnlyPlanInstallmentNo"","""");
			SetProperty(""PlatinumInstallmentNo"","""");
			SetProperty(""STCContractElig24M"","""");
			SetProperty(""STCNoOfAdvPayElig"","""");
			SetProperty(""STCNoOfDeviceElig"","""");
			SetProperty(""STCNoOfAccDevices"","""");
			SetProperty(""DeviceRRP"","""");
			SetProperty(""STCExpUpfrontTerm"","""");	//Indrasen-Experian Credit Matrix ( below-4 )
			SetProperty(""STCExpDiviceLimit"","""");
			SetProperty(""STCExpContractLimit"","""");
			SetProperty(""STCExpRiskClass"","""");
		
			//Indrasen - BR Automation singleView enhancement	
			SetProperty(""DevicesEligibleCount"","""");
			SetProperty(""AccessoriesEligibleCount"","""");
			SetProperty(""STCExpDiviceLimitEligibility"","""");

		}
		//return(ContinueOperation);
	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
}
function LogException(e)
{

	//var appObj;
  	var Input;
  	var Output;
  	var CallMessageHandler;  
	try
 	{
		  //appObj = TheApplication();
		  Input = TheApplication().NewPropertySet();
		  Output = TheApplication().NewPropertySet();
		  CallMessageHandler = TheApplication().GetService(""STC Generic Error Handler"");
		  with(Input){
			  SetProperty(""Error Code"", e.errCode);
			  SetProperty(""Error Message"", e.errText);
			  SetProperty(""Object Name"", ""STC DiscountProduct Service"");
			  SetProperty(""Object Type"", ""Buisness Service"");
		  }
		  CallMessageHandler.InvokeMethod(""Log Message"", Input, Output);
 	}
 	catch(e)
 	{}
 	finally
 	{
 
		  CallMessageHandler = null;
		  Output = null;
		  Input = null;
		  //appObj = null;
 	}
}
function Query(Inputs,Outputs)
{
/* **********************************************************************************
Purpose : Function called from VBC-BS to display the Customer Eligibility check details
Author 	: GURURAJ MADHAVARAO

date		version		Developer				Description
----------  --------  -------------------	--------------------------------
15/12/2019	1.0		| GURURAJ MADHAVARAO	Modified for new CC Frame Work
03/03/2020	1.2		| NAVINKUMAR RAI		BR_Automation_Phase3
01.06.2020	REV03	| Indrasen				Experian Customer credit scoring
19.07.2020	REV04	| Indrasen				BR Automation singleView enhancement	
--------------------------------------------------------------------------------------- */ 
	var AppObj=TheApplication();
	var sErrorMsg1 = TheApplication().InvokeMethod(""LookupValue"",""STC_SINGLE_VIEW_ERR"",""NotIndividual"");
	var vCustomerId = TheApplication().GetProfileAttr(""STCEligibilityCustomerId"");
	var vCustExperianFlag = TheApplication().GetProfileAttr(""STCEligibilityCustomerExperianFlg"");	//REV03
	TheApplication().SetProfileAttr(""STCEligibilityCustomerId"", """");

	var QBS=AppObj.GetService(""STC Siebel Operation BS"");
	var AccountBO=null, AccountBC=null,vCCMatrixBO=null,vCCMatrixBC=null;
	//Variables used for calculation and logic
	var vEmpname=null,vEmpCode=null,vEmpCat=null,vRCount=null,vOccp=null,vCardOccp=null,vNationality=null,vOccpCat=null,vSSpec=null,vAON=null,vElite=null,vBadPayee=null,vCustAge=null,vDeviceRRP=null,vNumIns=null,vNumDevice=null,vEligContrt=null,isRecord=null,vAONchk=null,vCustAgechk=null,vDeviceRRPchk=null,vNumAccDev=null,vContactCat=null,vAllowedDevices=null,vAllowedAccess=null;
	var inp=AppObj.NewPropertySet();
	var out=AppObj.NewPropertySet();
	var vXDeviceRRPVal=TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"",""X_VALUE_RRP"");
	var isRecord=null,vDeviceRRPVal=new Array(),i=0;
	var vExperianFlg = """", vCANTermCharge=0, vDeviceEligiCount=0, vAccessoriesEligiCunt=0;
	try
	{
		var vDeviceCount = GetDeviceCount(vCustomerId);
		var vAccessoryCount = GetAccessoryCount(vCustomerId);//Hardik Accessories

		AccountBO=AppObj.GetBusObject(""Account"");
		AccountBC=AccountBO.GetBusComp(""Account"");
		with(AccountBC)
		{
			SetViewMode(AllView);
			ActivateField(""Tax ID Number"");
			ActivateField(""Account Type Code"");
			ActivateField(""Household Head Occupation"");
			ActivateField(""STC Card Occupation"");
			ActivateField(""STC Account Created Date"");
			ActivateField(""Employer Name"");
			ActivateField(""Employer Number"");
			ActivateField(""Market Class"");
			ActivateField(""Customer Age On Network"");
			ActivateField(""STC Elite Count Calc"");
			ActivateField(""STC Cust Cat Cal1"");
			ActivateField(""STC Contract Category"");
			ActivateField(""STC Experian Flag""); 
			ActivateField(""STC Max Contract Eligibility"");
			ActivateField(""STC Max Device Eligibility"");
			ActivateField(""STC Max Device Limit"");
			ActivateField(""STC Risk Class"");
			ActivateField(""STC Upfront Term"");
			ActivateField(""STC Advance Term"");
			 ClearToQuery();
			 vSSpec=""[Id]='""+vCustomerId+""'"";
			 SetSearchExpr(vSSpec);
			 ExecuteQuery(ForwardOnly);
			 isRecord = FirstRecord(); 
			 if(isRecord)
			 {		
			 		vExperianFlg = GetFieldValue(""STC Experian Flag"");
			 		vEmpname=GetFieldValue(""Employer Name"");
					vEmpCode=GetFieldValue(""Employer Number"");
					vContactCat=GetFieldValue(""STC Contract Category"");
					if(vContactCat==""Individual"")
					{
						if(vExperianFlg == ""Y"")		//REV03 -Indrasen
						{
							var MaxContcElig =	GetFieldValue(""STC Max Contract Eligibility"");
							var MaxDeviceElig = GetFieldValue(""STC Max Device Eligibility"");
							var MaxDeviceLimt = GetFieldValue(""STC Max Device Limit"");
							var expRiskclass = GetFieldValue(""STC Risk Class"");
							var expUpfrontTerm = GetFieldValue(""STC Upfront Term"");
							var expAdvTerm = GetFieldValue(""STC Advance Term"");
							
							//var CalcDeviceEligty = ToNumber(MaxDeviceElig);
							var CalcDeviceEligty = ToNumber(MaxDeviceElig) - ToNumber(vDeviceCount) - ToNumber(vAccessoryCount);
							
							vCANTermCharge = GetExperianDeviceCnt(vCustomerId); //for Device Limit
							
							var ExpOut = TheApplication().NewPropertySet();
							with(ExpOut)
							{
								SetProperty(""STCContractElig24M"","""");
								SetProperty(""STCNoOfAdvPayElig"", expAdvTerm);
								
								if(CalcDeviceEligty < 0)
									SetProperty(""STCNoOfDeviceElig"",""0"");
								else
									SetProperty(""STCNoOfDeviceElig"", CalcDeviceEligty);

								SetProperty(""STCNoOfAccDevices"","""");
								SetProperty(""DeviceRRP"","""");
								SetProperty(""STCExpUpfrontTerm"", expUpfrontTerm);
								SetProperty(""STCExpDiviceLimit"", (MaxDeviceLimt-vCANTermCharge) );
								SetProperty(""STCExpContractLimit"",MaxContcElig);
								SetProperty(""STCExpRiskClass"", expRiskclass);
								SetProperty(""DevicesEligibleCount"",ToNumber(MaxDeviceElig));  //REV04
								SetProperty(""AccessoriesEligibleCount"","""");
								SetProperty(""STCExpDiviceLimitEligibility"", MaxDeviceLimt);
							}
							Outputs.AddChild(ExpOut);
							ExpOut=null;
						}
						else
						{
							if(vEmpCode==null || vEmpCode == """")
							{
								vEmpCat=AppObj.InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""EMP_CAT"");
							}
							else
							{
								//Get Employer Category
								//vSSpec=""[Employer Name]='""+vEmpname+""' AND [Employer Code]='""+vEmpCode+""'"";
								vSSpec=""[Employer Code]='""+vEmpCode+""'"";
								inp.SetProperty(""BusinessObject"",""STC Customer Classification BO"");
								inp.SetProperty(""BusinessComponent"",""STC Employee Category Matrix"");
								inp.SetProperty(""SearchExpression"",vSSpec);
								inp.SetProperty(""Field0"",""Employer Category"");
								QBS.InvokeMethod(""SiebelQuery"",inp,out);
								vRCount=out.GetProperty(""RecordCount"");
								if(vRCount > 0)
								{
									vEmpCat=out.GetProperty(""Output0"");
								}
								else
								{
									vEmpCat=AppObj.InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""EMP_CAT"");
								}
								inp.Reset();
								out.Reset();
	
							}
							vOccp=GetFieldValue(""Household Head Occupation"");
							vCardOccp=GetFieldValue(""STC Card Occupation"");
							vNationality=GetFieldValue(""Market Class"");
							if(vNationality==null || vNationality=='')
							{
								vNationality=AppObj.InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""NATIONALITY"");
							}
							if(vNationality==AppObj.InvokeMethod(""LookupValue"",""STC_CUST_CLASS_TYPE"",""Foreigner""))
							{
								vNationality=""Expats"";
							}
							else
							{
								vNationality=""Bahraini"";
							}
	
							//Get Occupation Category
							//[NAVIN:03Mar2020:BR_Automation_Phase3]
							var CusAgeBS = AppObj.GetService(""STC Customer Age on Network BS"");
							with(inp)
							{
								SetProperty(""Nationality"", vNationality);
								SetProperty(""EmployerCategory"", vEmpCat);
								SetProperty(""SystemOccupation"", vOccp);
							}
							CusAgeBS.InvokeMethod(""GetOccupationCategory_NEWBR"",inp,out);
							vOccpCat = out.GetProperty(""OccupationCategory"");
							CusAgeBS = null;
							inp.Reset();
							out.Reset();
	
							vAON=GetFieldValue(""Customer Age On Network"");
							if(vAON < 36 && vAON >=24)
							{ 
								vAONchk=24;
							}
							else if(vAON < 24 && vAON >=11)
							{
								vAONchk=11;
							}
							else if(vAON < 11 && vAON >=6)
							{
								vAONchk=6;
							}
							else if(vAON < 6 && vAON >=0)
							{
								vAONchk=0;
							}
							else
							{
								vAONchk=36;
							}
							vElite=GetFieldValue(""STC Elite Count Calc"");
							if(vElite==""Y"")
							{
								vElite=""Elite"";
							}
							else
							{
								vElite=""Not Elite"";
							}
							vBadPayee=GetFieldValue(""STC Cust Cat Cal1"");
							if(vBadPayee==""Bad"")
							{
								vBadPayee=""Bad Payee"";
							}
							else
							{
								vBadPayee=""Not Bad Payee"";
							}
							vCustAge=GetCustomerAge(vCustomerId);
							if(vCustAge >=30)
							{
								vCustAgechk=30;
							}
							else if(vCustAge < 30)
							{
								vCustAgechk=29;
							}
							//Get Advance Payments and Device Installments
							inp.Reset();
							out.Reset();
							vCCMatrixBO=AppObj.GetBusObject(""STC Customer Classification BO"");
							vCCMatrixBC=vCCMatrixBO.GetBusComp(""STC New Customer Classification Matrix"");
							with(vCCMatrixBC)
							{
								ActivateField(""Occupation Category"");
								ActivateField(""AON"");
								ActivateField(""Bad Payee Status"");
								ActivateField(""Elite Status"");
								ActivateField(""Customer Age"");
								ActivateField(""Eligible 24M Contract"");
								ActivateField(""No of Advance Payments"");
								ActivateField(""No of Accessory Dev Elig"");
								ActivateField(""Device RRP"");
								ActivateField(""No of Device Eligible"");
								vSSpec=""[Occupation Category] = '""+vOccpCat+""' AND [AON] = '""+vAONchk+""' AND [Bad Payee Status] ='""+vBadPayee+""' AND [Elite Status] ='""+vElite+""' AND [Customer Age] = '""+vCustAgechk+""'"";
								ClearToQuery();
								SetSearchExpr(vSSpec);
								ExecuteQuery(ForwardOnly);
								isRecord=FirstRecord();
								while(isRecord)
								{
									vDeviceRRPVal[i]=GetFieldValue(""Device RRP"");
								
									out.SetProperty(""vEligContrt"",GetFieldValue(""Eligible 24M Contract""));
									out.SetProperty(""vNumIns"",GetFieldValue(""No of Advance Payments""));
									out.SetProperty(""vNumDevice"",GetFieldValue(""No of Device Eligible""));
									out.SetProperty(""vNumAccDev"",GetFieldValue(""No of Accessory Dev Elig""));
									inp.AddChild(out.Copy());
									out.Reset();

									vDeviceEligiCount = GetFieldValue(""No of Device Eligible"");
									vAccessoriesEligiCunt = GetFieldValue(""No of Accessory Dev Elig"");
									vAllowedDevices=GetFieldValue(""No of Device Eligible"")-vDeviceCount;
									vAllowedAccess = GetFieldValue(""No of Accessory Dev Elig"")-vAccessoryCount; //Hardik Accessoies
									
									out.SetProperty(""DevicesEligibleCount"", vDeviceEligiCount);
									out.SetProperty(""AccessoriesEligibleCount"", vAccessoriesEligiCunt);
									out.SetProperty(""STCContractElig24M"",GetFieldValue(""Eligible 24M Contract""));
									out.SetProperty(""STCNoOfAdvPayElig"",GetFieldValue(""No of Advance Payments""));
									
									if(vAllowedDevices<0)
										out.SetProperty(""STCNoOfDeviceElig"",""0"");
									else
										out.SetProperty(""STCNoOfDeviceElig"",vAllowedDevices);

									if (vAllowedAccess<0) //Hardik Accessoies
										out.SetProperty(""STCNoOfAccDevices"",""0"");
									else
										out.SetProperty(""STCNoOfAccDevices"",vAllowedAccess);
									
									
									if(ToNumber(vDeviceRRPVal[i]) < ToNumber(vXDeviceRRPVal))
									{
										out.SetProperty(""DeviceRRP"",""< ""+vXDeviceRRPVal);
									}
									else
									{
										out.SetProperty(""DeviceRRP"","">= ""+vXDeviceRRPVal);
									}
									
									out.SetProperty(""STCExpUpfrontTerm"","""");	
									out.SetProperty(""STCExpDiviceLimit"","""");
									out.SetProperty(""STCExpContractLimit"","""");
									out.SetProperty(""STCExpRiskClass"","""");
									out.SetProperty(""STCExpDiviceLimitEligibility"","""");
									
									Outputs.AddChild(out.Copy());
	
									isRecord=NextRecord();
									i++;
								}//while(isRecord)
							}//with(vCCMatrixBC)
						}//else of experian
						
					}//if(vContactCat==""Individual"")
					else
					{
						var PsErrOutputs = TheApplication().NewPropertySet();
						with(PsErrOutputs)
						{
							SetProperty(""STCContractElig24M"",""NA"");
							SetProperty(""STCNoOfAdvPayElig"",""NA"");
							SetProperty(""STCNoOfDeviceElig"",sErrorMsg1);
							SetProperty(""STCNoOfAccDevices"",""NA"");
							SetProperty(""DeviceRRP"",""NA"");
							SetProperty(""STCExpUpfrontTerm"","""");	
							SetProperty(""STCExpDiviceLimit"","""");
							SetProperty(""STCExpContractLimit"","""");
							SetProperty(""STCExpRiskClass"","""");
							SetProperty(""DevicesEligibleCount"",""NA"");		//REV04
							SetProperty(""AccessoriesEligibleCount"",""NA"");
							SetProperty(""STCExpDiviceLimitEligibility"","""");
						}
						Outputs.AddChild(PsErrOutputs);
						PsErrOutputs=null;
					}

			 }//if(isRecord)
		}//with(AccountBC)
	}//End Try Block
	catch(e)
	{
		var PsErrOutputs = TheApplication().NewPropertySet();
		with(PsErrOutputs)
		{
			SetProperty(""STCContractElig24M"",""NA"");
			SetProperty(""STCNoOfAdvPayElig"",""NA"");
			SetProperty(""STCNoOfDeviceElig"",e.errText);
			SetProperty(""STCNoOfAccDevices"",""NA"");
			SetProperty(""DeviceRRP"",""NA"");
			SetProperty(""STCExpUpfrontTerm"","""");
			SetProperty(""STCExpDiviceLimit"","""");
			SetProperty(""STCExpContractLimit"","""");
			SetProperty(""STCExpRiskClass"","""");
			SetProperty(""DevicesEligibleCount"",""NA"");		//REV04
			SetProperty(""AccessoriesEligibleCount"",""NA"");
			SetProperty(""STCExpDiviceLimitEligibility"","""");
		}
		Outputs.AddChild(PsErrOutputs);
		PsErrOutputs=null;
	}
	finally
	{
		AccountBC=null;vCCMatrixBC=null;
		AccountBO=null;vCCMatrixBO=null;

		vEmpname=null;vEmpCode=null;vEmpCat=null;vRCount=null;vOccp=null;vCardOccp=null;vNationality=null;vOccpCat=null;vSSpec=null;vAON=null;vElite=null;vBadPayee=null;vCustAge=null;vDeviceRRP=null;vNumIns=null;vNumDevice=null;vEligContrt=null;isRecord=null;vAONchk=null;vCustAgechk=null;vDeviceRRPchk=null;vNumAccDev=null;vContactCat=null;

		AppObj=null;
	}
}
function Query(Inputs,Outputs)
{
/* **********************************************************************************
Purpose : Function called from VBC-BS to display the Customer Eligibility check details
Author 	: GURURAJ MADHAVARAO

date		version		Developer				Description
----------  --------  -------------------	--------------------------------
15/12/2019	1.0		| GURURAJ MADHAVARAO	Modified for new CC Frame Work
03/03/2020	1.2		| NAVINKUMAR RAI		BR_Automation_Phase3
01.06.2020	REV03	| Indrasen				Experian Customer credit scoring
19.07.2020	REV04	| Indrasen				BR Automation singleView enhancement
16.09.2021 REV05	| Indrasen			Experian Phase 2A where we need to skip experian for VIP and Badpayee	
--------------------------------------------------------------------------------------- */ 
	var AppObj=TheApplication();
	var sErrorMsg1 = TheApplication().InvokeMethod(""LookupValue"",""STC_SINGLE_VIEW_ERR"",""NotIndividual"");
	var vCustomerId = TheApplication().GetProfileAttr(""STCEligibilityCustomerId"");
	var vCustExperianFlag = TheApplication().GetProfileAttr(""STCEligibilityCustomerExperianFlg"");	//REV03
	TheApplication().SetProfileAttr(""STCEligibilityCustomerId"", """");

	var QBS=AppObj.GetService(""STC Siebel Operation BS"");
	var AccountBO=null, AccountBC=null,vCCMatrixBO=null,vCCMatrixBC=null;
	//Variables used for calculation and logic
	var vEmpname=null,vEmpCode=null,vEmpCat=null,vRCount=null,vOccp=null,vCardOccp=null,vNationality=null,vOccpCat=null,vSSpec=null,vAON=null,vElite=null,vBadPayee=null,vCustAge=null,vDeviceRRP=null,vNumIns=null,vNumDevice=null,vEligContrt=null,isRecord=null,vAONchk=null,vCustAgechk=null,vDeviceRRPchk=null,vNumAccDev=null,vContactCat=null,vAllowedDevices=null,vAllowedAccess=null;
	var inp=AppObj.NewPropertySet();
	var out=AppObj.NewPropertySet();
	var vXDeviceRRPVal=TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"",""X_VALUE_RRP"");
	var isRecord=null,vDeviceRRPVal=new Array(),i=0;
	var vExperianFlg = """", vCANTermCharge=0, vDeviceEligiCount=0, vAccessoriesEligiCunt=0;
	var VIPcust =""N"", BadPayeeCust=""N"", Elite=""N"";
	try
	{
		var vDeviceCount = GetDeviceCount(vCustomerId);
		var vAccessoryCount = GetAccessoryCount(vCustomerId);//Hardik Accessories

		AccountBO=AppObj.GetBusObject(""Account"");
		AccountBC=AccountBO.GetBusComp(""Account"");
		with(AccountBC)
		{
			SetViewMode(AllView);
			ActivateField(""Tax ID Number"");
			ActivateField(""Account Type Code"");
			ActivateField(""Household Head Occupation"");
			ActivateField(""STC Card Occupation"");
			ActivateField(""STC Account Created Date"");
			ActivateField(""Employer Name"");
			ActivateField(""Employer Number"");
			ActivateField(""Market Class"");
			ActivateField(""Customer Age On Network"");
			ActivateField(""STC Elite Count Calc"");
			ActivateField(""STC Cust Cat Cal1"");
			ActivateField(""STC Contract Category"");
			ActivateField(""STC Experian Flag""); 
			ActivateField(""STC Max Contract Eligibility"");
			ActivateField(""STC Max Device Eligibility"");
			ActivateField(""STC Max Device Limit"");
			ActivateField(""STC Risk Class"");
			ActivateField(""STC Upfront Term"");
			ActivateField(""STC Advance Term"");
			ActivateField(""STC VIP"");
			ActivateField(""STC BadDept Flag"");
			ActivateField(""STC Elite Count Calc"");
			 ClearToQuery();
			 vSSpec=""[Id]='""+vCustomerId+""'"";
			 SetSearchExpr(vSSpec);
			 ExecuteQuery(ForwardOnly);
			 isRecord = FirstRecord(); 
			 if(isRecord)
			 {		
			 		vExperianFlg = GetFieldValue(""STC Experian Flag"");
			 		vEmpname=GetFieldValue(""Employer Name"");
					vEmpCode=GetFieldValue(""Employer Number"");
					vContactCat=GetFieldValue(""STC Contract Category"");

					VIPcust =  GetFieldValue(""STC VIP"");	//REV05
					BadPayeeCust = GetFieldValue(""STC BadDept Flag"");	//REV05
					Elite = GetFieldValue(""STC Elite Count Calc"");	//REV05
					if(vContactCat==""Individual"")
					{
						if(vExperianFlg == ""Y"" && VIPcust != ""Y"" && BadPayeeCust != ""Y"" && Elite != ""Y"")	////REV05	//REV03 -Indrasen
						{
							var MaxContcElig =	GetFieldValue(""STC Max Contract Eligibility"");
							var MaxDeviceElig = GetFieldValue(""STC Max Device Eligibility"");
							var MaxDeviceLimt = GetFieldValue(""STC Max Device Limit"");
							var expRiskclass = GetFieldValue(""STC Risk Class"");
							var expUpfrontTerm = GetFieldValue(""STC Upfront Term"");
							var expAdvTerm = GetFieldValue(""STC Advance Term"");
							
							//var CalcDeviceEligty = ToNumber(MaxDeviceElig);
							var CalcDeviceEligty = ToNumber(MaxDeviceElig) - ToNumber(vDeviceCount) - ToNumber(vAccessoryCount);
							
							vCANTermCharge = GetExperianDeviceCnt(vCustomerId); //for Device Limit
							
							var ExpOut = TheApplication().NewPropertySet();
							with(ExpOut)
							{
								SetProperty(""STCContractElig24M"","""");
								SetProperty(""STCNoOfAdvPayElig"", expAdvTerm);
								
								if(CalcDeviceEligty < 0)
									SetProperty(""STCNoOfDeviceElig"",""0"");
								else
									SetProperty(""STCNoOfDeviceElig"", CalcDeviceEligty);

								SetProperty(""STCNoOfAccDevices"","""");
								SetProperty(""DeviceRRP"","""");
								SetProperty(""STCExpUpfrontTerm"", expUpfrontTerm);
								SetProperty(""STCExpDiviceLimit"", (MaxDeviceLimt-vCANTermCharge) );
								SetProperty(""STCExpContractLimit"",MaxContcElig);
								SetProperty(""STCExpRiskClass"", expRiskclass);
								SetProperty(""DevicesEligibleCount"",ToNumber(MaxDeviceElig));  //REV04
								SetProperty(""AccessoriesEligibleCount"","""");
								SetProperty(""STCExpDiviceLimitEligibility"", MaxDeviceLimt);
							}
							Outputs.AddChild(ExpOut);
							ExpOut=null;
						}
						else
						{
							if(vEmpCode==null || vEmpCode == """")
							{
								vEmpCat=AppObj.InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""EMP_CAT"");
							}
							else
							{
								//Get Employer Category
								//vSSpec=""[Employer Name]='""+vEmpname+""' AND [Employer Code]='""+vEmpCode+""'"";
								vSSpec=""[Employer Code]='""+vEmpCode+""'"";
								inp.SetProperty(""BusinessObject"",""STC Customer Classification BO"");
								inp.SetProperty(""BusinessComponent"",""STC Employee Category Matrix"");
								inp.SetProperty(""SearchExpression"",vSSpec);
								inp.SetProperty(""Field0"",""Employer Category"");
								QBS.InvokeMethod(""SiebelQuery"",inp,out);
								vRCount=out.GetProperty(""RecordCount"");
								if(vRCount > 0)
								{
									vEmpCat=out.GetProperty(""Output0"");
								}
								else
								{
									vEmpCat=AppObj.InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""EMP_CAT"");
								}
								inp.Reset();
								out.Reset();
	
							}
							vOccp=GetFieldValue(""Household Head Occupation"");
							vCardOccp=GetFieldValue(""STC Card Occupation"");
							vNationality=GetFieldValue(""Market Class"");
							if(vNationality==null || vNationality=='')
							{
								vNationality=AppObj.InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""NATIONALITY"");
							}
							if(vNationality==AppObj.InvokeMethod(""LookupValue"",""STC_CUST_CLASS_TYPE"",""Foreigner""))
							{
								vNationality=""Expats"";
							}
							else
							{
								vNationality=""Bahraini"";
							}
	
							//Get Occupation Category
							//[NAVIN:03Mar2020:BR_Automation_Phase3]
							var CusAgeBS = AppObj.GetService(""STC Customer Age on Network BS"");
							with(inp)
							{
								SetProperty(""Nationality"", vNationality);
								SetProperty(""EmployerCategory"", vEmpCat);
								SetProperty(""SystemOccupation"", vOccp);
							}
							CusAgeBS.InvokeMethod(""GetOccupationCategory_NEWBR"",inp,out);
							vOccpCat = out.GetProperty(""OccupationCategory"");
							CusAgeBS = null;
							inp.Reset();
							out.Reset();
	
							vAON=GetFieldValue(""Customer Age On Network"");
							if(vAON < 36 && vAON >=24)
							{ 
								vAONchk=24;
							}
							else if(vAON < 24 && vAON >=11)
							{
								vAONchk=11;
							}
							else if(vAON < 11 && vAON >=6)
							{
								vAONchk=6;
							}
							else if(vAON < 6 && vAON >=0)
							{
								vAONchk=0;
							}
							else
							{
								vAONchk=36;
							}
							vElite=GetFieldValue(""STC Elite Count Calc"");
							if(vElite==""Y"")
							{
								vElite=""Elite"";
							}
							else
							{
								vElite=""Not Elite"";
							}
							vBadPayee=GetFieldValue(""STC Cust Cat Cal1"");
							if(vBadPayee==""Bad"")
							{
								vBadPayee=""Bad Payee"";
							}
							else
							{
								vBadPayee=""Not Bad Payee"";
							}
							vCustAge=GetCustomerAge(vCustomerId);
							if(vCustAge >=30)
							{
								vCustAgechk=30;
							}
							else if(vCustAge < 30)
							{
								vCustAgechk=29;
							}
							//Get Advance Payments and Device Installments
							inp.Reset();
							out.Reset();
							vCCMatrixBO=AppObj.GetBusObject(""STC Customer Classification BO"");
							vCCMatrixBC=vCCMatrixBO.GetBusComp(""STC New Customer Classification Matrix"");
							with(vCCMatrixBC)
							{
								ActivateField(""Occupation Category"");
								ActivateField(""AON"");
								ActivateField(""Bad Payee Status"");
								ActivateField(""Elite Status"");
								ActivateField(""Customer Age"");
								ActivateField(""Eligible 24M Contract"");
								ActivateField(""No of Advance Payments"");
								ActivateField(""No of Accessory Dev Elig"");
								ActivateField(""Device RRP"");
								ActivateField(""No of Device Eligible"");
								vSSpec=""[Occupation Category] = '""+vOccpCat+""' AND [AON] = '""+vAONchk+""' AND [Bad Payee Status] ='""+vBadPayee+""' AND [Elite Status] ='""+vElite+""' AND [Customer Age] = '""+vCustAgechk+""'"";
								ClearToQuery();
								SetSearchExpr(vSSpec);
								ExecuteQuery(ForwardOnly);
								isRecord=FirstRecord();
								while(isRecord)
								{
									vDeviceRRPVal[i]=GetFieldValue(""Device RRP"");
								
									out.SetProperty(""vEligContrt"",GetFieldValue(""Eligible 24M Contract""));
									out.SetProperty(""vNumIns"",GetFieldValue(""No of Advance Payments""));
									out.SetProperty(""vNumDevice"",GetFieldValue(""No of Device Eligible""));
									out.SetProperty(""vNumAccDev"",GetFieldValue(""No of Accessory Dev Elig""));
									inp.AddChild(out.Copy());
									out.Reset();

									vDeviceEligiCount = GetFieldValue(""No of Device Eligible"");
									vAccessoriesEligiCunt = GetFieldValue(""No of Accessory Dev Elig"");
									vAllowedDevices=GetFieldValue(""No of Device Eligible"")-vDeviceCount;
									vAllowedAccess = GetFieldValue(""No of Accessory Dev Elig"")-vAccessoryCount; //Hardik Accessoies
									
									out.SetProperty(""DevicesEligibleCount"", vDeviceEligiCount);
									out.SetProperty(""AccessoriesEligibleCount"", vAccessoriesEligiCunt);
									out.SetProperty(""STCContractElig24M"",GetFieldValue(""Eligible 24M Contract""));
									out.SetProperty(""STCNoOfAdvPayElig"",GetFieldValue(""No of Advance Payments""));
									
									if(vAllowedDevices<0)
										out.SetProperty(""STCNoOfDeviceElig"",""0"");
									else
										out.SetProperty(""STCNoOfDeviceElig"",vAllowedDevices);

									if (vAllowedAccess<0) //Hardik Accessoies
										out.SetProperty(""STCNoOfAccDevices"",""0"");
									else
										out.SetProperty(""STCNoOfAccDevices"",vAllowedAccess);
									
									
									if(ToNumber(vDeviceRRPVal[i]) < ToNumber(vXDeviceRRPVal))
									{
										out.SetProperty(""DeviceRRP"",""< ""+vXDeviceRRPVal);
									}
									else
									{
										out.SetProperty(""DeviceRRP"","">= ""+vXDeviceRRPVal);
									}
									
									out.SetProperty(""STCExpUpfrontTerm"","""");	
									out.SetProperty(""STCExpDiviceLimit"","""");
									out.SetProperty(""STCExpContractLimit"","""");
									out.SetProperty(""STCExpRiskClass"","""");
									out.SetProperty(""STCExpDiviceLimitEligibility"","""");
									
									Outputs.AddChild(out.Copy());
	
									isRecord=NextRecord();
									i++;
								}//while(isRecord)
							}//with(vCCMatrixBC)
						}//else of experian
						
					}//if(vContactCat==""Individual"")
					else
					{
						var PsErrOutputs = TheApplication().NewPropertySet();
						with(PsErrOutputs)
						{
							SetProperty(""STCContractElig24M"",""NA"");
							SetProperty(""STCNoOfAdvPayElig"",""NA"");
							SetProperty(""STCNoOfDeviceElig"",sErrorMsg1);
							SetProperty(""STCNoOfAccDevices"",""NA"");
							SetProperty(""DeviceRRP"",""NA"");
							SetProperty(""STCExpUpfrontTerm"","""");	
							SetProperty(""STCExpDiviceLimit"","""");
							SetProperty(""STCExpContractLimit"","""");
							SetProperty(""STCExpRiskClass"","""");
							SetProperty(""DevicesEligibleCount"",""NA"");		//REV04
							SetProperty(""AccessoriesEligibleCount"",""NA"");
							SetProperty(""STCExpDiviceLimitEligibility"","""");
						}
						Outputs.AddChild(PsErrOutputs);
						PsErrOutputs=null;
					}

			 }//if(isRecord)
		}//with(AccountBC)
	}//End Try Block
	catch(e)
	{
		var PsErrOutputs = TheApplication().NewPropertySet();
		with(PsErrOutputs)
		{
			SetProperty(""STCContractElig24M"",""NA"");
			SetProperty(""STCNoOfAdvPayElig"",""NA"");
			SetProperty(""STCNoOfDeviceElig"",e.errText);
			SetProperty(""STCNoOfAccDevices"",""NA"");
			SetProperty(""DeviceRRP"",""NA"");
			SetProperty(""STCExpUpfrontTerm"","""");
			SetProperty(""STCExpDiviceLimit"","""");
			SetProperty(""STCExpContractLimit"","""");
			SetProperty(""STCExpRiskClass"","""");
			SetProperty(""DevicesEligibleCount"",""NA"");		//REV04
			SetProperty(""AccessoriesEligibleCount"",""NA"");
			SetProperty(""STCExpDiviceLimitEligibility"","""");
		}
		Outputs.AddChild(PsErrOutputs);
		PsErrOutputs=null;
	}
	finally
	{
		AccountBC=null;vCCMatrixBC=null;
		AccountBO=null;vCCMatrixBO=null;

		vEmpname=null;vEmpCode=null;vEmpCat=null;vRCount=null;vOccp=null;vCardOccp=null;vNationality=null;vOccpCat=null;vSSpec=null;vAON=null;vElite=null;vBadPayee=null;vCustAge=null;vDeviceRRP=null;vNumIns=null;vNumDevice=null;vEligContrt=null;isRecord=null;vAONchk=null;vCustAgechk=null;vDeviceRRPchk=null;vNumAccDev=null;vContactCat=null;

		AppObj=null;
	}
}
function Query_experianbkp(Inputs,Outputs)
{
/**********************************************************************************************************
Purpose 		: Function called from Workflow Process  to  Set Number of Installments 
Author 			: GURURAJ MADHAVARAO
Change Log		: Changes made to the function
***********************************************************************************************************
Date(DD/MM/YYYY)	| By		| Description of Change																		
-----------------------------------------------------------------------------------------------------------
15/12/2019		1.0   | GURURAJ MADHAVARAO	| Modified for new CC Frame Work
03/03/2020		1.2   | NAVINKUMAR RAI		| BR_Automation_Phase3
----------------------------------------------------------------------------------------------------------*/ 
	var AppObj=TheApplication();
	var sErrorMsg1 = TheApplication().InvokeMethod(""LookupValue"",""STC_SINGLE_VIEW_ERR"",""NotIndividual"");
	var vCustomerId = TheApplication().GetProfileAttr(""STCEligibilityCustomerId"");
	TheApplication().SetProfileAttr(""STCEligibilityCustomerId"", """");
	var vDeviceCount = GetDeviceCount(vCustomerId);
	var QBS=AppObj.GetService(""STC Siebel Operation BS"");
	var AccountBO=null, AccountBC=null,vCCMatrixBO=null,vCCMatrixBC=null;
	//Variables used for calculation and logic
	var vEmpname=null,vEmpCode=null,vEmpCat=null,vRCount=null,vOccp=null,vCardOccp=null,vNationality=null,vOccpCat=null,vSSpec=null,vAON=null,vElite=null,vBadPayee=null,vCustAge=null,vDeviceRRP=null,vNumIns=null,vNumDevice=null,vEligContrt=null,isRecord=null,vAONchk=null,vCustAgechk=null,vDeviceRRPchk=null,vNumAccDev=null,vContactCat=null,vAllowedDevices=null,vAllowedAccess=null;
	var inp=AppObj.NewPropertySet();
	var out=AppObj.NewPropertySet();
	var vXDeviceRRPVal=TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"",""X_VALUE_RRP"");
	var isRecord=null,vDeviceRRPVal=new Array(),i=0;
	try
	{
		var vAccessoryCount = GetAccessoryCount(vCustomerId);//Hardik Accessories
		AccountBO=AppObj.GetBusObject(""Account"");
		AccountBC=AccountBO.GetBusComp(""Account"");
		with(AccountBC)
		{
			 SetViewMode(AllView);
			 ActivateField(""Tax ID Number"");
			 ActivateField(""Account Type Code"");
			 ActivateField(""Household Head Occupation"");
			 ActivateField(""STC Card Occupation"");
			 ActivateField(""STC Account Created Date"");
			 ActivateField(""Employer Name"");
			 ActivateField(""Employer Number"");
			 ActivateField(""Market Class"");
			 ActivateField(""Customer Age On Network"");
			 ActivateField(""STC Elite Count Calc"");
			 ActivateField(""STC Cust Cat Cal1"");
			 ActivateField(""STC Contract Category""); 
			 ClearToQuery();
			 vSSpec=""[Id]='""+vCustomerId+""'"";
			 SetSearchExpr(vSSpec);
			 ExecuteQuery(ForwardOnly);
			 isRecord = FirstRecord(); 
			 if(isRecord)
			 {
			 		vEmpname=GetFieldValue(""Employer Name"");
					vEmpCode=GetFieldValue(""Employer Number"");
					vContactCat=GetFieldValue(""STC Contract Category"");
					if(vContactCat==""Individual"")
					{
						if(vEmpCode==null || vEmpCode == '')
						{
							vEmpCat=AppObj.InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""EMP_CAT"");
						}
						else
						{
							//Get Employer Category
							//vSSpec=""[Employer Name]='""+vEmpname+""' AND [Employer Code]='""+vEmpCode+""'"";
							vSSpec=""[Employer Code]='""+vEmpCode+""'"";
							inp.SetProperty(""BusinessObject"",""STC Customer Classification BO"");
							inp.SetProperty(""BusinessComponent"",""STC Employee Category Matrix"");
							inp.SetProperty(""SearchExpression"",vSSpec);
							inp.SetProperty(""Field0"",""Employer Category"");
							QBS.InvokeMethod(""SiebelQuery"",inp,out);
							vRCount=out.GetProperty(""RecordCount"");
							if(vRCount > 0)
							{
								vEmpCat=out.GetProperty(""Output0"");
							}
							else
							{
								vEmpCat=AppObj.InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""EMP_CAT"");
							}
							inp.Reset();
							out.Reset();

						}
						vOccp=GetFieldValue(""Household Head Occupation"");
						vCardOccp=GetFieldValue(""STC Card Occupation"");
						vNationality=GetFieldValue(""Market Class"");
						if(vNationality==null || vNationality=='')
						{
							vNationality=AppObj.InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""NATIONALITY"");
						}
						if(vNationality==AppObj.InvokeMethod(""LookupValue"",""STC_CUST_CLASS_TYPE"",""Foreigner""))
						{
							vNationality=""Expats"";
						}
						else
						{
							vNationality=""Bahraini"";
						}

						//Get Occupation Category
						//[NAVIN:03Mar2020:BR_Automation_Phase3]
						var CusAgeBS = AppObj.GetService(""STC Customer Age on Network BS"");
						with(inp)
						{
							SetProperty(""Nationality"", vNationality);
							SetProperty(""EmployerCategory"", vEmpCat);
							SetProperty(""SystemOccupation"", vOccp);
						}
						CusAgeBS.InvokeMethod(""GetOccupationCategory_NEWBR"",inp,out);
						vOccpCat = out.GetProperty(""OccupationCategory"");
						CusAgeBS = null;
						inp.Reset();
						out.Reset();

						vAON=GetFieldValue(""Customer Age On Network"");
						if(vAON < 36 && vAON >=24)
						{ 
							vAONchk=24;
						}
						else if(vAON < 24 && vAON >=11)
						{
							vAONchk=11;
						}
						else if(vAON < 11 && vAON >=6)
						{
							vAONchk=6;
						}
						else if(vAON < 6 && vAON >=0)
						{
							vAONchk=0;
						}
						else
						{
							vAONchk=36;
						}
						vElite=GetFieldValue(""STC Elite Count Calc"");
						if(vElite==""Y"")
						{
							vElite=""Elite"";
						}
						else
						{
							vElite=""Not Elite"";
						}
						vBadPayee=GetFieldValue(""STC Cust Cat Cal1"");
						if(vBadPayee==""Bad"")
						{
							vBadPayee=""Bad Payee"";
						}
						else
						{
							vBadPayee=""Not Bad Payee"";
						}
						vCustAge=GetCustomerAge(vCustomerId);
						if(vCustAge >=30)
						{
							vCustAgechk=30;
						}
						else if(vCustAge < 30)
						{
							vCustAgechk=29;
						}
						//Get Advance Payments and Device Installments
						inp.Reset();
						out.Reset();
						vCCMatrixBO=AppObj.GetBusObject(""STC Customer Classification BO"");
						vCCMatrixBC=vCCMatrixBO.GetBusComp(""STC New Customer Classification Matrix"");
						with(vCCMatrixBC)
						{
							ActivateField(""Occupation Category"");
							ActivateField(""AON"");
							ActivateField(""Bad Payee Status"");
							ActivateField(""Elite Status"");
							ActivateField(""Customer Age"");
							ActivateField(""Eligible 24M Contract"");
							ActivateField(""No of Advance Payments"");
							ActivateField(""No of Accessory Dev Elig"");
							ActivateField(""Device RRP"");
							ActivateField(""No of Device Eligible"");
							vSSpec=""[Occupation Category] = '""+vOccpCat+""' AND [AON] = '""+vAONchk+""' AND [Bad Payee Status] ='""+vBadPayee+""' AND [Elite Status] ='""+vElite+""' AND [Customer Age] = '""+vCustAgechk+""'"";
							ClearToQuery();
							SetSearchExpr(vSSpec);
							ExecuteQuery(ForwardOnly);
							isRecord=FirstRecord();
							while(isRecord)
							{
								vDeviceRRPVal[i]=GetFieldValue(""Device RRP"");
							
								out.SetProperty(""vEligContrt"",GetFieldValue(""Eligible 24M Contract""));
								out.SetProperty(""vNumIns"",GetFieldValue(""No of Advance Payments""));
								out.SetProperty(""vNumDevice"",GetFieldValue(""No of Device Eligible""));
								out.SetProperty(""vNumAccDev"",GetFieldValue(""No of Accessory Dev Elig""));
								inp.AddChild(out.Copy());
								out.Reset();


								if(ToNumber(vDeviceRRPVal[i]) < ToNumber(vXDeviceRRPVal))
								{
									out.SetProperty(""STCContractElig24M"",GetFieldValue(""Eligible 24M Contract""));
									out.SetProperty(""STCNoOfAdvPayElig"",GetFieldValue(""No of Advance Payments""));
									vAllowedDevices=GetFieldValue(""No of Device Eligible"")-vDeviceCount;
									vAllowedAccess = GetFieldValue(""No of Accessory Dev Elig"")-vAccessoryCount; //Hardik Accessoies
									if(vAllowedDevices<0)
									{
										out.SetProperty(""STCNoOfDeviceElig"",""0"");
									}
									else
									{
										out.SetProperty(""STCNoOfDeviceElig"",vAllowedDevices);
									}
									
									//out.SetProperty(""STCNoOfAccDevices"",GetFieldValue(""No of Accessory Dev Elig""));
									if (vAllowedAccess<0) //Hardik Accessoies
									{
										out.SetProperty(""STCNoOfAccDevices"",""0"");
									}
									else
									{
									  out.SetProperty(""STCNoOfAccDevices"",vAllowedAccess);
									}
										////Hardik Accessoies
									out.SetProperty(""DeviceRRP"",""< ""+vXDeviceRRPVal);
									Outputs.AddChild(out.Copy());
								}
								else
								{
									out.SetProperty(""STCContractElig24M"",GetFieldValue(""Eligible 24M Contract""));
									out.SetProperty(""STCNoOfAdvPayElig"",GetFieldValue(""No of Advance Payments""));
									if(vAllowedDevices<0)
									{
										out.SetProperty(""STCNoOfDeviceElig"",""0"");
									}
									else
									{
										out.SetProperty(""STCNoOfDeviceElig"",vAllowedDevices);
									}
									//out.SetProperty(""STCNoOfDeviceElig"",GetFieldValue(""No of Device Eligible""));
									//out.SetProperty(""STCNoOfAccDevices"",GetFieldValue(""No of Accessory Dev Elig""));
									if (vAllowedAccess<0) //Hardik Accessoies
										{
											out.SetProperty(""STCNoOfAccDevices"",""0"");
										}
										else
										{
										    out.SetProperty(""STCNoOfAccDevices"",vAllowedAccess);
										}
										////Hardik Accessoies
									out.SetProperty(""DeviceRRP"","">= ""+vXDeviceRRPVal);
									Outputs.AddChild(out.Copy());
								}


								isRecord=NextRecord();
								i++;
							}//while(isRecord)
						}//with(vCCMatrixBC)
					}//if(vContactCat==""Individual"")
					else
					{
						var PsErrOutputs = TheApplication().NewPropertySet();
						with(PsErrOutputs)
						{
							out.SetProperty(""STCContractElig24M"",""NA"");
							out.SetProperty(""STCNoOfAdvPayElig"",""NA"");
							out.SetProperty(""STCNoOfDeviceElig"",sErrorMsg1);
							out.SetProperty(""STCNoOfAccDevices"",""NA"");
							out.SetProperty(""DeviceRRP"",""NA"");
						}
						Outputs.AddChild(PsErrOutputs);
						PsErrOutputs=null;
					}

			 }//if(isRecord)
		}//with(AccountBC)
	}//End Try Block
	catch(e)
	{
		var PsErrOutputs = TheApplication().NewPropertySet();
		with(PsErrOutputs)
		{
			out.SetProperty(""STCContractElig24M"",""NA"");
			out.SetProperty(""STCNoOfAdvPayElig"",""NA"");
			out.SetProperty(""STCNoOfDeviceElig"",e.errText);
			out.SetProperty(""DeviceRRP"",""NA"");
		}
		Outputs.AddChild(PsErrOutputs);
		PsErrOutputs=null;
	}
	finally
	{
		AccountBC=null;vCCMatrixBC=null;
		AccountBO=null;vCCMatrixBO=null;

		vEmpname=null;vEmpCode=null;vEmpCat=null;vRCount=null;vOccp=null;vCardOccp=null;vNationality=null;vOccpCat=null;vSSpec=null;vAON=null;vElite=null;vBadPayee=null;vCustAge=null;vDeviceRRP=null;vNumIns=null;vNumDevice=null;vEligContrt=null;isRecord=null;vAONchk=null;vCustAgechk=null;vDeviceRRPchk=null;vNumAccDev=null;vContactCat=null;

		AppObj=null;
	}
}
function Query_old(Inputs,Outputs)
{
/**********************************************************************************************************
Purpose 		: Function called from Workflow Process  to  Set Number of Installments 
Author 			: SUMAN KANUMURI
Change Log		: Changes made to the function
***********************************************************************************************************
Date(DD/MM/YYYY)	| By		| Description of Change																		
----------------------------------------------------------------------------------------------------------
09/10/2016  |    1.1  | SUMAN KANUMURI | Added code for SD Late Payee Flag.. Removed Dunning Date related code and bad customer is based on Late Payee flag at CAN
----------------------------------------------------------------------------------------------------------*/
	//var vApp =  TheApplication();
	//MANUJ: Single View Revamp
	var SmartPlanInstallmentNo, SIMOnlyPlanInstallmentNo, PlatinumInstallmentNo, vPlanCategory="""", vCustomerId="""";
	var Masterid, vPlanName = """", vContractCat, vType= ""OCCUPATION"", sServiceType;
	var isRecord1, Contractcat,NumLineCalc,NumLines,Occupation,AccStartDate,sDiffTime,sDiffTime1;	
	var ExisCust, ExisIns, NewCust, NewIns = ""NA"", sMaxNumMonths, vAllowedDevices;
	var BadCus, DunnDate, ContractCat, NumMonths, NumEligCon, dunflg=""N"", DunniDays=null;
	var ListBO=null, ListBC=null, AccountBO=null, AccountBC=null, oCustomBO=null, oCustomBC=null;
	var dCurrDate, sSysdate, vDeviceCount, sErrorMsg1="""", PsErrOutputs = """";
		
	try
	{
		vCustomerId = TheApplication().GetProfileAttr(""STCEligibilityCustomerId"");
		TheApplication().SetProfileAttr(""STCEligibilityCustomerId"", """");
		DunniDays = TheApplication().InvokeMethod(""LookupValue"",""STC_CC_DUN"",""CCBADDays"");
		dCurrDate = new Date();
		sSysdate = dCurrDate.getTime();		
		vDeviceCount = GetDeviceCount(vCustomerId); //Get Customer Existing Device Count
		ListBO = TheApplication().GetBusObject(""List Of Values"");
		ListBC = ListBO.GetBusComp(""List Of Values"");
		//AccountBO = TheApplication().GetBusObject(""Account"");
		AccountBO = TheApplication().GetBusObject(""STC Query Service Account"");
		AccountBC = AccountBO.GetBusComp(""Account"");
		oCustomBO = TheApplication().GetBusObject(""STC Custmer Admin BO"");
		oCustomBC = oCustomBO.GetBusComp(""STC Custmer Admin BC"");
		
		sErrorMsg1 = TheApplication().InvokeMethod(""LookupValue"",""STC_SINGLE_VIEW_ERR"",""NotIndividual"");//22March2015:Single View Fixes

		with(AccountBC)
		{
			SetViewMode(AllView);
			ActivateField(""Tax ID Number"");
			ActivateField(""Survey Type"");
			ActivateField(""Input On"");
			ActivateField(""STC Num Sub"");		
			ActivateField(""STC Contract Category""); 
			ActivateField(""Account Created"");
			//ActivateField(""STC Num of Inst"");
			ActivateField(""Household Head Occupation"");
			ActivateField(""STC Account Created Date"");
			ActivateField(""STC CAN Susp Date""); 
			ActivateField(""STC CAN Susp Reason"");
			ClearToQuery();
			SetSearchSpec(""Id"",vCustomerId);
			ExecuteQuery(ForwardOnly);
			isRecord = FirstRecord(); 
			if(isRecord)
			{
				Contractcat = GetFieldValue(""STC Contract Category"");
				NumLineCalc = GetFieldValue(""STC Num Sub"");			
				Occupation = GetFieldValue(""Household Head Occupation"");			
				AccStartDate = GetFieldValue(""STC Account Created Date"");
				DunnDate = GetFieldValue(""STC CAN Susp Date"");
				if(AccStartDate == """" || AccStartDate == null)
				{
					AccStartDate = new Date();
				}
				if(AccStartDate!="""")
				{
					AccStartDate = new Date(AccStartDate);
					AccStartDate = AccStartDate.getTime();
					sDiffTime = sSysdate - AccStartDate;
					sDiffTime1=sDiffTime/86400000; 
					sDiffTime1=sDiffTime1/30;
					sDiffTime1=Math.round(sDiffTime1); 
				}//endif AccStartDate!=""""				 
				 
				 if(DunnDate!="""")
				 { 
				 	 DunnDate=new Date(DunnDate);
					 DunnDate=DunnDate.getTime();
					 DunnDate=sSysdate-DunnDate;
					 DunnDate=DunnDate/86400000;
					 DunnDate=Math.round(DunnDate);
				 }//endif DunnDate
			}//endif isRecord
			if(Contractcat == ""Individual""){//22March:single View Fixes.
				with(ListBC)
				{
					ActivateField(""Type"");    //Type
					ActivateField(""Value"");   //Display Value
					ActivateField(""Name"");    //Language Independent Code
					ActivateField(""High"");
					ActivateField(""Low"");
					ActivateField(""Description"");// Description
					ClearToQuery();
					SetViewMode(AllView);  
					SetSearchSpec(""Type"",vType);
					SetSearchSpec(""Value"",Occupation);
					SetSearchSpec(""Parent"",""Individual"");//22March:single View Fixes.
					ExecuteQuery(ForwardOnly);
					var isRecord = FirstRecord();
					if(isRecord)
					{
						var ContractCat1 = GetFieldValue(""Low"");
						if(ContractCat1 == null || ContractCat1 == """")
							ContractCat1 = 4;
					}				    
				}//withlistbc
				with(oCustomBC)
				{
					 if(ContractCat1 != """" && ContractCat1 != null)
					 {
						 SetViewMode(AllView);
						 ActivateField(""Contract Category"");
						 ActivateField(""Exis Cust"");
						 ActivateField(""Exis Inst"");
						 ActivateField(""New Cust"");
						 ActivateField(""New Inst"");
						 ActivateField(""Bad Customer"");
						 ActivateField(""Number Of Months"");					
						 ActivateField(""Old Cust"");
						 ActivateField(""Old Inst"");					 
						 ActivateField(""Max Number Of Months""); 
						 ActivateField(""Old Customer Devices"");
						 ActivateField(""Old Customer Installments"");					 
						 ActivateField(""STC Device Category"");//MANUJ: Added for Device Category
						 ClearToQuery();
						 SetSearchSpec(""Contract Category"",ContractCat1);
						 SetSearchSpec(""STC Device Category"",""1"");//MANUJ: Added for Device Category			 
						 ExecuteQuery(ForwardOnly);
						 isRecord1 = FirstRecord();
						 while(isRecord1)
						 {
							ContractCat=GetFieldValue(""Contract Category"");
							NumMonths=GetFieldValue(""Number Of Months"");
							sMaxNumMonths = GetFieldValue(""Max Number Of Months"");//Added for Customer Classification-Adjustments SD
							BadCus=GetFieldValue(""Bad Customer"");
							vPlanCategory = GetFieldValue(""Old Cust"");
							///////////////Category ""1""///////////////
	
							if(DunnDate!="""")
							{					  
								if(DunnDate < DunniDays && (ContractCat ==""1"" || ContractCat ==""2"" || ContractCat ==""3"" || ContractCat ==""4""))
								{
									  NumEligCon=GetFieldValue(""Bad Customer"");
									  NewIns=GetFieldValue(""Old Inst"");
									  vAllowedDevices = NumEligCon - vDeviceCount;						  	    
									  dunflg=""Y"";   
								}
							}//endif DunnDate!=""""
	
							if(sDiffTime1 < NumMonths && dunflg==""N"") 
							{
								NumEligCon=GetFieldValue(""New Cust"");
								NewIns=GetFieldValue(""New Inst"");
								vAllowedDevices = NumEligCon - vDeviceCount;							 		    
							}				
							else if(sDiffTime1 >= sMaxNumMonths && dunflg==""N"")
							{
								NumEligCon=GetFieldValue(""Old Customer Devices"");
								NewIns=GetFieldValue(""Old Customer Installments"");
								vAllowedDevices = NumEligCon - vDeviceCount;								  				
							}				
							else if(sDiffTime1 >= NumMonths && sDiffTime1 < sMaxNumMonths && dunflg==""N"")
							{
								NumEligCon=GetFieldValue(""Exis Cust"");
								NewIns=GetFieldValue(""Exis Inst"");
								vAllowedDevices = NumEligCon - vDeviceCount;								  				     
							} 
							///Bad/////////////
							var PsOutputs = TheApplication().NewPropertySet();							
							if(vPlanCategory == ""1"")
							{
								vPlanName = ""Smart Plan"";
								SmartPlanInstallmentNo = NewIns;
							}
							else if(vPlanCategory == ""2"")
							{
								vPlanName = ""Unlimited Smart / SIM only Plan"";
								SIMOnlyPlanInstallmentNo = NewIns;//MANUJ
							}
							else if(vPlanCategory == ""3"")
							{
								vPlanName = ""Platinum Plan"";
								PlatinumInstallmentNo = NewIns;//MANUJ
							}
							else if(vPlanCategory == ""0"")
							vPlanName = ""Basic Plan"";
							if(vPlanCategory != ""0"")
							{
								if(NewIns == ""NA"")
								{
									PsOutputs.SetProperty(""STC Device Number"",""NA"");
									//MANUJ: Single View SD
									if(vPlanCategory == ""1"")//For plan Category 1, if no/Installments calculates to 0, then set SmartPlanInstallmentNo
									{
										SmartPlanInstallmentNo = ""NA"";	
									}
									if(vPlanCategory == ""2"")//For plan Category 1, if no/Installments calculates to 0, then set SmartPlanInstallmentNo
									{
										SIMOnlyPlanInstallmentNo = ""NA"";	
									}
									if(vPlanCategory == ""3"")//For plan Category 1, if no/Installments calculates to 0, then set SmartPlanInstallmentNo
									{
										PlatinumInstallmentNo = ""NA"";	
									}
									// MANUJ: Single View SD Revamp
								}
								else
								{
									if(vAllowedDevices < 0)//22March:single View Fixes.
										vAllowedDevices = 0;
								
								}
							}
							isRecord1 = NextRecord();
						}// End While isRecord1
						with(PsOutputs)
						{
							SetProperty(""SmartPlanInstallmentNo"",SmartPlanInstallmentNo);
							SetProperty(""SIMOnlyPlanInstallmentNo"",SIMOnlyPlanInstallmentNo);
							SetProperty(""PlatinumInstallmentNo"",PlatinumInstallmentNo);
							SetProperty(""STC Device Number"",vAllowedDevices);
						}
						Outputs.AddChild(PsOutputs);
					}//End if(ContractCat1 != """" && ContractCat1 != null)
				} //End With /oCustomBC/
			}//end if(Contractcat == ""Individual"")
			else{//22March:single View Fixes Below			
				PsErrOutputs = TheApplication().NewPropertySet();
				with(PsErrOutputs){//MANUJ: Added single View
					SetProperty(""STC Device Number"","""");
					SetProperty(""SmartPlanInstallmentNo"",sErrorMsg1);
					SetProperty(""SIMOnlyPlanInstallmentNo"","""");
					SetProperty(""PlatinumInstallmentNo"","""");
				}
				Outputs.AddChild(PsErrOutputs);
			}//end else(Contractcat == ""Individual"")
		}//EndWith AccountBC
	}//endtry
	finally
	{
		ListBC = null;
		ListBO = null;
		AccountBC=null; oCustomBC=null;
		AccountBO=null; oCustomBO=null; 
		//vApp = null;
	}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{ 
	var ireturn=false;
	//var psInputs=null, psOutputs=null;

	try
	{
		ireturn = ContinueOperation;
		switch(MethodName)
		{
			case ""Init"":
				Init(Inputs,Outputs);
				ireturn = CancelOperation;
				break;
					
			case ""Query"":
				Query(Inputs,Outputs);
				ireturn = CancelOperation;
				break;
			
			case ""PreInsert"":
				ireturn = CancelOperation;
				break;
			
			default:
				//ireturn = ContinueOperation;
				break;
		}
		return (ireturn);
	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{}
	return (ContinueOperation);
}
//Your public declarations go here...
function CheckIDExpiry(Inputs,Outputs)
{
var apj = TheApplication();
var AccountBC = apj.GetBusObject(""Account"").GetBusComp(""Account"");
var AccountId = Inputs.GetProperty(""AccountId"");
var foundCSR, foundCSRSubstr, currLoginId;
currLoginId = apj.LoginName();
foundCSR = apj.InvokeMethod(""LookupValue"",""STC_ID_EXP_CHECK"",currLoginId);
foundCSRSubstr = foundCSR.substring(0,3);
if(foundCSRSubstr != ""USR"")
{
var ExpForDays = apj.InvokeMethod(""LookupValue"",""STC_AUTO_POP_ADMIN"",""FOREIGNER""); // SUMANK: Added for Autopopuate SD Fixes
var ExpBahDays = apj.InvokeMethod(""LookupValue"",""STC_AUTO_POP_ADMIN"",""BAHRAINI""); // SUMANK: Added for Autopopuate SD Fixes
var PNNIDDays = apj.InvokeMethod(""LookupValue"",""STC_AUTO_POP_ADMIN"",""PNNID""); // SUMANK: Added for Autopopuate SD Fixes
var dCurrDate = new Date();
var sSysdate = dCurrDate.getTime(); 
var IDType,CustomerClass,Segment,IDExpDate;
with(AccountBC)
{
	ActivateField(""STC ID Expiry Date"");
	ActivateField(""STC Contract Category"");
	ActivateField(""Market Class""); 
	ActivateField(""Tax ID Number"");
	ActivateField(""Survey Type""); 
	SetViewMode(AllView);
	ClearToQuery();
	SetSearchSpec(""Id"",AccountId);
	ExecuteQuery(ForwardOnly);
	var AccRec = FirstRecord();
	if(AccRec)
	{
		IDType =GetFieldValue(""Survey Type"");
		CustomerClass = GetFieldValue(""Market Class""); // SUMANK: Added for Autopopuate SD Fixes
		Segment = GetFieldValue(""STC Contract Category"");
		IDExpDate = GetFieldValue(""STC ID Expiry Date"");

	}
}//with(AccountBC)

	 	ExpForDays = ToNumber(ExpForDays);  // SUMANK: Added for Autopopuate SD Fixes
		ExpBahDays = ToNumber(ExpBahDays); // SUMANK: Added for Autopopuate SD Fixes
		var IDExpDatesys = new Date(IDExpDate);
		var sysIDExpdate = IDExpDatesys.toSystem();
		var CurrDate = new Date();	
		var CurrDateSys = new Date(CurrDate);
		var sysdateCurrDate = CurrDateSys.toSystem();
		var daydiff = (sysIDExpdate - sysdateCurrDate);
		var Finaldays = ToNumber(Math.round((daydiff/(60*60*24))));
		if(CustomerClass == apj.InvokeMethod(""LookupValue"",""STC_CUST_CLASS_TYPE"",""Bahraini"")) // SUMANK: Added for Autopopuate SD Fixes
		{
			if(Finaldays < ExpBahDays)
			{
				apj.RaiseErrorText(""Dear Customer, Please renew ID Card as ID Card Expiry date is approaching. Please contact Administrator for more details"");
			}
		}
		if(CustomerClass == apj.InvokeMethod(""LookupValue"",""STC_CUST_CLASS_TYPE"",""Foreigner"")) // SUMANK: Added for Autopopuate SD Fixes
		{
			if(Finaldays < ExpForDays)
			{
				apj.RaiseErrorText(""Dear Customer, Please renew ID Card as ID Card Expiry date is approaching. Please contact Administrator for more details"");
			}
		}
		if(IDType == ""PNN ID"")
		{
			if(Finaldays < PNNIDDays)
			{
				apj.RaiseErrorText(""Dear Customer, Please renew ID Card as ID Card Expiry date is approaching. Please contact Administrator for more details"");
			}
		}
}// end of if user
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 

    switch(MethodName)
     {
    case ""CheckIDExpiry"":
     CheckIDExpiry(Inputs, Outputs);
     return(CancelOperation);
     break;

      default:
          return (ContinueOperation);
       }


}
function DOB(Inputs,Outputs)
{
	var sDateOfBirth = Inputs.GetProperty(""DOB"");
	var Minor = ""N"",SixteenandLess = ""N"",EighteenandAbove=""N"",Age = 0;
	if (sDateOfBirth != """" && sDateOfBirth != null)
		{
		sDateOfBirth = new Date(sDateOfBirth);
		var sCompareDate = sDateOfBirth.getTime(); 
		var dCurrDate = new Date();
		var sSysdate = dCurrDate.getTime();
		Age = (sSysdate - sCompareDate)/(365.25 * 24 * 60 * 60 * 1000);
		
		if (Age >= 16 && Age < 18)
			{
				Minor = ""Y"";
			}
		if (Age < 16)
			{
				SixteenandLess = ""Y"";
			}
			if (Age >= 18)
			{
				EighteenandAbove = ""Y"";
			}
		}
	Outputs.SetProperty(""Minor"",Minor);
	Outputs.SetProperty(""EighteenandAbove"",EighteenandAbove);
	Outputs.SetProperty(""SixteenandLess"",SixteenandLess);
	
	return CancelOperation;
}
"//Your public declarations go here...
//***********************************************************************************************************//
//Purpose: 1) To DeAssociate the Guardian Contact of the Customer Account & Subscription Account Created under it
//Inputs: Subscription Account Id, Guardian Contact Id of the Customer Account
//Outputs: 
//Author: MANUJ//
//*************************************************************************************************************//
function GuardianDeAssociation(Inputs,Outputs)
{
	var sSubAccntId;
	var isRecord;
	var sConPriAddrId;
	var sCopyAddress;//NEW
	var sAccountType;//NEW
	var sContactId;
	var bcAddrMVG;
	var bcAddrAssoc;
	var bcContactMVG;
	var sCustAccntId;
	var appObj;
	var bcSubAcnt;
	var boAccount="""";
	var bcAccount;
	var bcContact;
	var bcContactAssoc = """";
	var boContactAssoc;
	var dCurrDate = new Date();
	try
	{
			appObj = TheApplication();
			with(Inputs)
			{
				sAccountType = GetProperty(""AccountType"");//NEW
				sSubAccntId = GetProperty(""SubscriptionAccountId"");
				sContactId = GetProperty(""GuardianConId"");
				sCustAccntId = GetProperty(""CustAccountId"");
			}            
			if(sSubAccntId != """" && sSubAccntId != null)
			{
				//boAccount = appObj.GetBusObject(""STC Service Account"");
				//bcSubAcnt = boAccount.GetBusComp(""CUT Service Sub Accounts"");
				boContactAssoc = appObj.GetBusObject(""Guardian Association"");
				bcContactAssoc = boContactAssoc.GetBusComp(""Guardian Association"");
            }
				if(sContactId != """" && sContactId != null && sSubAccntId != """" && sSubAccntId != null)
					{
							with(bcContactAssoc)
							{
								ActivateField(""Employee Id"");
								ActivateField(""Position Id"");
								SetViewMode(AllView);
								SetSearchSpec(""Position Id"",sContactId);
								SetSearchSpec(""Employee Id"",sSubAccntId);
								ExecuteQuery(ForwardOnly);
								isRecord = FirstRecord(); 
								 if(isRecord)
									   {
										   DeleteRecord();		       
									   }
							}
		
					}
				/*bcContact = boAccount.GetBusComp(""Contact"");
				if(sContactId != """" && sContactId != null)
				{
				with(bcContact)
				{
				   ActivateField(""Master Account Id"");
				   SetViewMode(AllView);
				   ClearToQuery();
				   SetSearchSpec(""Id"",sContactId);
				   ExecuteQuery(ForwardOnly);
				   isRecord = FirstRecord(); 
				   if(isRecord)
				   {
				      DeleteRecord();			       
				   }
			      } 
				}*/
			}		
	catch(e)
	{
	throw(e);
	}
	finally
	{
		bcAddrMVG = null;
		bcAddrAssoc = null;
		bcContactMVG = null;
		bcContactAssoc = null;
		bcSubAcnt = null;
		boAccount = null;
	 	appObj = null;
	}

}
function GuardianDeassocRCR(){
		var spec  = ""[Guardian Status] = 'Active'"";
	//	var spec  = ""([Id] = '1-7AG4TN0' OR [Id] = '1-7AG7TZ9') AND ([Guardian Status] = 'Active')"";		
	//var spec  = ""([Id] = '1-7AG4TN0' OR [Id] = '1-7AG7TZ9')"";
		var ContactBO=TheApplication().GetBusObject(""Contact"");
		var ContactBODOB=TheApplication().GetBusObject(""Contact"");
		var ContactBC=ContactBO.GetBusComp(""Contact"");
		var ContactDOB=ContactBODOB.GetBusComp(""Contact"");
		var AccountBO=TheApplication().GetBusObject(""Account"");
		var AccountBC= AccountBO.GetBusComp(""Account"");
		var EighteenandAbove = ""N"";
		var MinorId = """",PrimaryId = """",DOB = """", GuardianActiveId = """",GuardianFound ;
		with(ContactBC){
		SetViewMode(AllView);
		ActivateField(""Master Account Id"");
		ActivateField(""Guardian Status"");
		ClearToQuery();
		SetSearchExpr(spec);
		//SetSearchSpec(""Guardian Status"",""Active"");	
		ExecuteQuery(ForwardOnly);
		var count = CountRecords();
		var GuardianFound = FirstRecord();
		while(GuardianFound)//GuardianFound
		{
		MinorId = GetFieldValue(""Master Account Id""); //Minor Id
		GuardianActiveId = GetFieldValue(""Id""); //Guardian Id
		if (MinorId != """" || MinorId != null)
		{
		with(AccountBC)
		{
		SetViewMode(AllView);
		ActivateField(""Primary Contact Id"");
		ClearToQuery();
		SetSearchSpec(""Id"",MinorId); 
		ExecuteQuery(ForwardOnly);
		var isRecord = FirstRecord();
		if(isRecord)
		{
		PrimaryId=GetFieldValue(""Primary Contact Id"");				
		}	
		}//with(AccountBC)
		with(ContactDOB){//GET DOB
		SetViewMode(AllView);
		ActivateField(""Birth Date"");
		ClearToQuery();
		SetSearchSpec(""Id"",PrimaryId);
		ExecuteQuery(ForwardOnly);
		var isRecord1 = FirstRecord();
		if(isRecord1)
		{
					DOB=GetFieldValue(""Birth Date""); 
					if (DOB !="""")
					{
					var Inputs   = TheApplication().NewPropertySet();
					var Outputs = TheApplication().NewPropertySet();			
					var CallBS = TheApplication().GetService(""STC Check Minor Customer BS"");
					Inputs.SetProperty(""DOB"",DOB);				
					CallBS.InvokeMethod(""DOB"", Inputs,Outputs);	
					EighteenandAbove = Outputs.GetProperty(""EighteenandAbove"");
					
					if(EighteenandAbove == ""Y"")
					{
					var OrdInputs   = TheApplication().NewPropertySet();
					var OrdOutputs = TheApplication().NewPropertySet();	
					var STCOrdWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");
					OrdInputs.SetProperty(""Object Id"",MinorId);
					OrdInputs.SetProperty(""GuardianActiveId"",GuardianActiveId);
					OrdInputs.SetProperty(""CustomerAccId"",MinorId);
					OrdInputs.SetProperty(""ProcessName"",""STC DeAssociate Guardian OnMaturity"");
					STCOrdWorkflowProc.InvokeMethod(""RunProcess"", OrdInputs, OrdOutputs);
					}//if(EighteenandAbove == ""Y"")
					}//if (DOB !="""")
		}//if(isRecord1)
		
		}//with(ContactDOB)//GET DOB
		
		
		}
		GuardianFound = NextRecord(); 
		}//while(GuardianFound)
		
		}//with(ContactBC)
		
		}//function GuardianDeassoc"
"//***********************************************************************************************************//
//Purpose: 1) To Associate the Guardian Contact of the Customer Account to the Subscription Account Created under it
//Inputs: Subscription Account Id, Guardian Contact Id of the Customer Account
//Outputs: 
//Author: MANUJ//
//*************************************************************************************************************//
function GuardianSANAssociation(Inputs,Outputs)
{
	var sSubAccntId;
	var isRecord;
	var sConPriAddrId;
	var sCopyAddress;//NEW
	var sAccountType;//NEW
	var sContactId;
	var bcAddrMVG;
	var bcAddrAssoc;
	var bcContactMVG;
	var sCustAccntId;
	var appObj;
	var bcSubAcnt;
	var boAccount="""";
	var bcAccount;
	var bcContact;
	var bcContactAssoc = """";
	var boContactAssoc;
	var dCurrDate = new Date();
	try
	{
			appObj = TheApplication();
			with(Inputs)
			{
				sAccountType = GetProperty(""AccountType"");//NEW
				sSubAccntId = GetProperty(""SubscriptionAccountId"");
				sContactId = GetProperty(""GuardianConId"");
				sCustAccntId = GetProperty(""CustAccountId"");
			}            
			if(sSubAccntId != """" && sSubAccntId != null)
			{
				boAccount = appObj.GetBusObject(""STC Service Account"");
				bcSubAcnt = boAccount.GetBusComp(""CUT Service Sub Accounts"");
			
				boContactAssoc = appObj.GetBusObject(""Guardian Association"");
				bcContactAssoc = boContactAssoc.GetBusComp(""Guardian Association"");
            }
				if(sContactId != """" && sContactId != null && sSubAccntId != """" && sSubAccntId != null)
					{
							with(bcContactAssoc)
							{
								ActivateField(""Employee Id"");
								ActivateField(""Position Id"");
								ActivateField(""StartDate"");
								NewRecord(NewAfter);
								SetFieldValue(""Employee Id"", sSubAccntId); //SANId
								SetFieldValue(""Position Id"", sContactId);//contactId 
								WriteRecord();
							}
		
					}
				bcContact = boAccount.GetBusComp(""Contact"");
				if(sContactId != """" && sContactId != null)
				{
				with(bcContact)
				{
				   ActivateField(""Master Account Id"");
				   SetViewMode(AllView);
				   ClearToQuery();
				   SetSearchSpec(""Id"",sContactId);
				   ExecuteQuery(ForwardOnly);
				   isRecord = FirstRecord(); 
				   if(isRecord)
				   {
				       SetFieldValue(""Master Account Id"",sCustAccntId);
				       WriteRecord();			       
				   }
			      } 
				}
			}		
	catch(e)
	{
	throw(e);
	}
	finally
	{
		bcAddrMVG = null;
		bcAddrAssoc = null;
		bcContactMVG = null;
		bcContactAssoc = null;
		bcSubAcnt = null;
		boAccount = null;
	 	appObj = null;
	}

}
function QuickVerifyGuardian(Inputs,Outputs)
{   

//Checks ID expiartion, Bad customer and Guardian CPR Match
	var sBadCust = """", GuardianInfoViolated = ""N"";
	var sGIDExpiryDate = Inputs.GetProperty(""IDExpiryDate"");
	var CANId = Inputs.GetProperty(""CANId"");
	var GuardianCardCPR = Inputs.GetProperty(""GuardianCardCPR"");
	 var CPRExpired = ""N"";
	 var AccountBO = TheApplication().GetBusObject(""Account"");
	if (sGIDExpiryDate != """" && sGIDExpiryDate != null)
    	{
		sGIDExpiryDate = new Date(sGIDExpiryDate);
		var sCompareDate = sGIDExpiryDate.getTime(); 
		var dCurrDate = new Date();
		var sSysdate = dCurrDate.getTime();
		if (sSysdate > sCompareDate)
			{
			CPRExpired = ""Y"";	
			}
     	}
	Outputs.SetProperty(""CPRExpired"",CPRExpired);
	
	
		var Account = AccountBO.GetBusComp(""Account""); 
		with(Account) 
		{  
		ActivateField(""STC BadCust Calc"");
		ClearToQuery(); 
		SetViewMode(AllView); 
		SetSearchSpec(""Id"",CANId); 
		ExecuteQuery(); 
		var IsAccRec= FirstRecord();
		if(IsAccRec) 
		{
		sBadCust = GetFieldValue(""STC BadCust Calc""); 
		}
		}
	Outputs.SetProperty(""sBadCust"",sBadCust);

				var bcContact = AccountBO.GetBusComp(""Contact"");
				with(bcContact)
				{
				   ActivateField(""Master Account Id"");
				   ActivateField(""STC ID #"");
				   ActivateField(""Guardian Status"");
				   SetViewMode(AllView);
				   ClearToQuery();
				   SetSearchSpec(""STC ID #"",GuardianCardCPR);//Guardian CPR
				   SetSearchSpec(""Master Account Id"",CANId);//CAN Id
				   SetSearchSpec(""Guardian Status"",""Active"");//Active Guardian
				   ExecuteQuery(ForwardOnly);
				   var isRecord = FirstRecord(); 
				   if(!isRecord)
				   {
				   	GuardianInfoViolated = ""Y"";	//Current Guardian has differnt CPR	       
				   }
			      } 
	Outputs.SetProperty(""GuardianInfoViolated"",GuardianInfoViolated);
	return CancelOperation;
	
	}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""DOB""){
		DOB(Inputs,Outputs);
		return CancelOperation;
	}

		if(MethodName == ""QuickVerifyGuardian""){
		QuickVerifyGuardian(Inputs,Outputs);
		return CancelOperation;
	}

	if(MethodName == ""GuardianSANAssociation""){
		GuardianSANAssociation(Inputs,Outputs);
		return CancelOperation;
	}

		if(MethodName == ""GuardianDeAssociation""){
		GuardianDeAssociation(Inputs,Outputs);
		return CancelOperation;
	}

		if(MethodName == ""GuardianDeassocRCR""){
		GuardianDeassocRCR(Inputs,Outputs);
		return CancelOperation;
	}
	
	return (ContinueOperation);
}
function NumberCheck(Inputs,Outputs)
{
	var appObj = TheApplication();
	var oBusObj = TheApplication().ActiveBusObject();
	var NumberCheck;
	var CallTier;var IMEI;var CardSerNumber;var PIN;
     if (oBusObj.Name() == ""STC Service Account"")
{

	var oBC = oBusObj.GetBusComp(""Service Request"");
	with(oBC)
	{
	CallTier =  GetFieldValue(""INS Sub-Area"");
	if(CallTier == ""Service Center"" || CallTier == ""Warranty Compliant"")
	{
	IMEI = GetFieldValue(""DIS Device IMEI"");
	if(IMEI != """" && IMEI != null)
	{
	if(isNaN(IMEI))
	{
	TheApplication().RaiseErrorText(""Device IMEI Number should be Numeric."");
	}
	}
	}
	
	if(CallTier == ""Scratch Compliant"" || CallTier == ""PIN Number Not Working"")
	{
	CardSerNumber = GetFieldValue(""DIS Card Serial Number"");
	if(CardSerNumber != """" && CardSerNumber != null)
	{
	if(isNaN(CardSerNumber))
	{
	TheApplication().RaiseErrorText(""Card Serial Number should be Numeric."");
	}
	}
	}
	
	if(CallTier == ""PIN Number Not Working"")
	{
	PIN = GetFieldValue(""DIS PIN Number"");
	if(PIN != """" && PIN != null)
	{
	if(isNaN(PIN))
	{
	TheApplication().RaiseErrorText(""PIN Number should be Numeric."");
	}
	}
	}
	
	
	
	}

	
	}
	return CancelOperation;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""NumberCheck""){
		NumberCheck(Inputs,Outputs);
		return CancelOperation;
	}
	return (ContinueOperation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	try
	{
		if(MethodName == ""CheckOpenOrders"")
		{
			var sServiceAccId = Inputs.GetProperty(""ServiceAccountId"");
			var oOrderBO  = TheApplication().GetBusObject(""STC Service Account"");
			var oOrderBC = oOrderBO.GetBusComp(""Order Entry - Orders"");
			var sCompleteStatus = TheApplication().InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""Complete"");
			var sCancelledStatus = TheApplication().InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""Cancelled"");
			var strExpr;
			
			with(oOrderBC)
			{
				ActivateField(""Status"");
				ActivateField(""Service Account Id"");
				ClearToQuery();
				SetViewMode(AllView);
				strExpr = strExpr = ""[Service Account Id] = '""+ sServiceAccId +""' "" + "" AND [Status] <> '""+ sCompleteStatus +""' AND [Status] <> '""+ sCancelledStatus +""'"";
				SetSearchExpr(strExpr);
				ExecuteQuery(ForwardOnly);
				var iRecrod = FirstRecord();
	
			}
	
			Outputs.SetProperty(""OpenOrderFlag"",iRecrod);
			return(CancelOperation);
		}
	}
	catch(e)
	{
	}
	finally
	{
		oOrderBC = null;
		oOrderBO = null;

	}
	
	
}
function FindSROrder(Inputs,Outputs)
{
	var sOrderNumber = Inputs.GetProperty(""Order Number"");
	var Length = sOrderNumber.length;
	var sub_strng = sOrderNumber.substr( 2,Length - 2 );
	Outputs.SetProperty(""Order Number"",sub_strng);
	
	return CancelOperation;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""FindSROrder""){
		FindSROrder(Inputs,Outputs);
		return CancelOperation;
	}
	return (ContinueOperation);
}
function FindMismatch(Inputs,Outputs)
{
	var appObj = TheApplication();
	var oBusObj = TheApplication().ActiveBusObject();
	var NumberCheck;
	Outputs.SetProperty(""sMismatch"",""N"");
	var CallTier;
	var sID = Inputs.GetProperty(""sID"");
	var sNewPassportNo = Inputs.GetProperty(""sNewPassportNo"");
	var sUser;
	sUser = TheApplication().LoginName();
	var isSuperUser = TheApplication().InvokeMethod(""LookupValue"", ""STC_SM_USER"", sUser);
	var Length = isSuperUser.length;
	var sub_strng = isSuperUser.substr( 0,3 );
	
	var CusIDNumber;
	var ExisIDType;
	
     if (oBusObj.Name() == ""STC Service Account"" || oBusObj.Name() == ""Service Request"")
	{

	var oBC = oBusObj.GetBusComp(""Service Request"");
	with(oBC)
	{
	CallTier =  GetFieldValue(""INS Sub-Area"");
	CusIDNumber = GetFieldValue(""ID Number"");//customer ID#
	ExisIDType = GetFieldValue(""ID Type"");//Need to query to find by server script
	if (sNewPassportNo != """" && sNewPassportNo != null && sID != null && sID != """" && sNewPassportNo.length > 0 && sID.length > 0 )
	
	{//Then trigger Server script
	
		if(CusIDNumber != sID)
		{//CPR Id doesnt Match and any other ID in DB, Update Bahraini Id

			if(CusIDNumber != sNewPassportNo && sub_strng == ""SUP"" && CusIDNumber.length > 0 && sNewPassportNo.length > 0 && (ExisIDType == ""Passport"" || ExisIDType == ""Bahraini ID"") ){ //Passport Not Matching and super user.
			Outputs.SetProperty(""sMismatch"",""Y"");
			}
		}
	}
	
	
	
	}//WithOBC

	
	}
	return CancelOperation;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""FindMismatch""){
		FindMismatch(Inputs,Outputs);
		return CancelOperation;
	}
	return (ContinueOperation);
}
function CheckTTType(Inputs, Outputs) 
{
	var appObj = TheApplication();
	var TypeTT = ""PreviousDayTT"";
	var TTDate = Inputs.GetProperty(""TTDate"");
	TTDate = ToString(TTDate);
	var TTHour = TTDate.substring(11, 13);
	TTHour = ToNumber(TTHour);
	var LiveStartHour = appObj.InvokeMethod(""LookupValue"",""STC_TERMINATION_TT_RET"",""Retention Start Hrs"");
	var LiveEndHour = appObj.InvokeMethod(""LookupValue"",""STC_TERMINATION_TT_RET"",""Retention End Hrs"");
	LiveStartHour = ToNumber(LiveStartHour);
	LiveEndHour = ToNumber(LiveEndHour);
	if(TTHour < LiveStartHour || TTHour >= LiveEndHour)
	{
		TypeTT = ""PreviousDayTT"";
	}
	else
	{
		TypeTT = ""LiveTT"";
	}
	Outputs.SetProperty(""TypeTT"",TypeTT);
	return(CancelOperation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
var iReturn;
 try
{
 iReturn = ContinueOperation;
switch (MethodName)
{
 case ""CheckTTType"":CheckTTType(Inputs, Outputs);
iReturn = CancelOperation;
 break;

default:
 iReturn = ContinueOperation;
    
  }
  return (iReturn);
 } 
 catch (e)
 { 
  TheApplication().RaiseErrorText(e.toString());
 }

}
function CheckBalCL(Inputs,Outputs)
{
  
	try
	{ 	
	  var appObj = TheApplication();
	  with(appObj)
	 {
	   var checkFlg;
	   var finalBalCL = Inputs.GetProperty(""FinalBalCL"");
	   if(finalBalCL == 0)
	   {
	     appObj.RaiseErrorText("" You cannot create Individual Account as the Parent Account Credit Limit Balance is zero.Please raise an SR to increase the same and Proceed"");
	   }
	  }
	}	            
	catch(e)
	{
	 	throw(e);
	}
	finally
	{
	   appObj = null;
	}
	  
}
"
	function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	
	var ireturn;
	try
	{
		
	switch(MethodName)

		{
			case ""CheckBalCL"":
					CheckBalCL(Inputs,Outputs);
					ireturn =CancelOperation;
					break;
			default:
					ireturn = ContinueOperation;
					break;
			}
	return(ireturn);
	}
	catch(e)
	{
	throw(e);
	}
	finally
	{
	}
	return(CancelOperation);
}
"//***********************************************************************************************************//
//Purpose: 1) To Initialize the fields in the BC.
//Author: MANUJ
//Date: 14-May-16
//*************************************************************************************************************//
function Init(Inputs,Outputs)
{
	try
	{
		with(Outputs)
		{
		

			SetProperty(""CPR"","""");
			SetProperty(""IDType"","""");
			SetProperty(""SiebelMessage"","""");//Mayank Added for Gaurdian Open UI
		
		
		}

	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
}
"//***********************************************************************************************************//
//Mayank Kandpal
//*************************************************************************************************************//
function Insert(InputsIns,OutputsIns)
{
	try
	{
		var CPR,Name,Gender,Dob,CardExpiry,FName,LName,MiddleName,Address,Flat,Building,Road,BlockNo,Governorate,Nationality,Occupation,SponsorName,SponsorNo,PassportNo,PassportIssueDate,PassportExpiryDate,LabourForceParticipation,EmployerNumber,EmployerName;
		//var formatDOB;
		//var CardCountry;
		//var CardIssueDate;
		//var newformatDOB;
		//var newformatExpiry;
		//var newformatPassportExpiryDate;
		//var newformatPassportIssueDate;
		//var CheckExist;	
		//var country;
		//var SystemOccupation;
		var appObj = TheApplication();

		var proxyBS = appObj.GetService(""Workflow Process Manager"");
		var input = appObj.NewPropertySet();
		var output = appObj.NewPropertySet();
		var siebMessage = """";
		var sCount = InputsIns.GetChildCount();
		var sFN = InputsIns.GetChild(0).GetProperty(""SiebelMessage"");
		for(var k=0;k<sCount;k++)
		{
			siebMessage = InputsIns.GetChild(k).GetProperty(""SiebelMessage"");
			input.SetProperty(""XMLDOC"",siebMessage);
			
		}
		if(siebMessage != """" && siebMessage != null)
		{
			input.SetProperty(""ProcessName"",""STC Smart Card Read VBC Update WF"");
			proxyBS.InvokeMethod(""RunProcess"",input,output);
			var smartcard = output.GetChild(0);
			var row = appObj.NewPropertySet();

			//Name = smartcard.GetChild(0).GetChild(0).GetProperty(""EnglishFullName"");
			CPR = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""CPRNO"");
			//Gender = smartcard.GetChild(0).GetChild(0).GetProperty(""Gender"");
			//Dob = smartcard.GetChild(0).GetChild(0).GetProperty(""BirthDate"");
			//CardExpiry = smartcard.GetChild(0).GetChild(0).GetProperty(""CardexpiryDate"");
			//CardCountry = smartcard.GetChild(0).GetChild(0).GetProperty(""CardCountry"");
			//Address = smartcard.GetChild(0).GetChild(0).GetProperty(""AddressEnglish"");
			//Nationality = smartcard.GetChild(0).GetChild(0).GetProperty(""NationalityCode"");
			//Occupation = smartcard.GetChild(0).GetChild(0).GetProperty(""OccupationEnglish"");
			//CardIssueDate = smartcard.GetChild(0).GetChild(0).GetProperty(""CardIssueDate"");
			//SponsorName = smartcard.GetChild(0).GetChild(0).GetProperty(""SponserNameEnglish"");
			//SponsorNo = smartcard.GetChild(0).GetChild(0).GetProperty(""SponserId"");
			//PassportNo = smartcard.GetChild(0).GetChild(0).GetProperty(""PassportNumber"");
			//PassportIssueDate = smartcard.GetChild(0).GetChild(0).GetProperty(""PassportIssueDate"");
			//PassportExpiryDate = smartcard.GetChild(0).GetChild(0).GetProperty(""PassportExpiryDate"");
			//EmployerNumber = smartcard.GetChild(0).GetChild(0).GetProperty(""EmploymentId"");
			//EmployerName = smartcard.GetChild(0).GetChild(0).GetProperty(""EmploymentNameEnglish"");
			var FMiscCount = smartcard.GetChild(0).GetChild(0).GetChildCount();
			//FName = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""FirstNameEnglish"");
			//LName = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""LastNameEnglish"");
			//Flat = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""FlatNo"");
			//Building = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""BuildingNo"");
			//Road = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""RoadNo"");
			//BlockNo = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""BlockNo"");
			//Governorate = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""GovernorateNameEnglish"");
			//MiddleName = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""MiddleName1English"");
			//LabourForceParticipation = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""LfpNameEnglish"");
			
			//var day = Dob.substring(0,2);
			//var Mon = Dob.substring(3,5);
			//var Year = Dob.substring(6,10);
					
			/*var Expday = CardExpiry.substring(0,2);
			var ExpMon = CardExpiry.substring(3,5);
			var ExpYear = CardExpiry.substring(6,10);
					
			var PExpday = PassportExpiryDate.substring(0,2);
			var PExpMon = PassportExpiryDate.substring(3,5);
			var PExpYear = PassportExpiryDate.substring(6,10);
					
			var PIssueday = PassportIssueDate.substring(0,2);
			var PIssueMon = PassportIssueDate.substring(3,5);
			var PIssueYear = PassportIssueDate.substring(6,10);
					
			formatDOB = day+""/""+Mon+""/""+Year;
			newformatDOB = Mon+""/""+day+""/""+Year;
			newformatExpiry = ExpMon+""/""+Expday+""/""+ExpYear;
			newformatPassportExpiryDate = PExpMon+""/""+PExpday+""/""+PExpYear;
			newformatPassportIssueDate = PIssueMon+""/""+PIssueday+""/""+PIssueYear;

			if(Gender == ""M"")
			{
				Gender = ""Male"";
			}
			else if(Gender == ""F"")
			{
				Gender = ""Female"";
			}

			if(LName == '-')
			{
				LName = '';
			}

			if(MiddleName == '-')
			{
				MiddleName = '';
			}
			
			var InputsNew = TheApplication().NewPropertySet();
			var OutputsNew = TheApplication().NewPropertySet();
			var svcService = TheApplication().GetService(""STC Get Country"");
			InputsNew.SetProperty(""CountryCode"",Nationality);
			InputsNew.SetProperty(""CardOccupation"",Occupation);
			InputsNew.SetProperty(""CardCountry"",CardCountry);
			svcService.InvokeMethod(""GetCountry"",InputsNew,OutputsNew);
			country = OutputsNew.GetProperty(""Nationality"");
			SystemOccupation = OutputsNew.GetProperty(""SystemOccupation"");
					
			var CustType = appObj.GetProfileAttr(""CustType"");*/
			var sActiveApplet = appObj.GetProfileAttr(""sActApplet"");
			var sMethodInvoked = appObj.GetProfileAttr(""CPRMethodInvoked"");
			if(sMethodInvoked == ""GetCPR"")//Mayank: Added for Open UI: START
			{
				//row.SetProperty(""Guardian First Name"",FName);
				//row.SetProperty(""Guardian Last Name"", LName);
				//row.SetProperty(""Guardian Middle Name"", MiddleName);
				row.SetProperty(""CPR"", CPR);
				/*row.SetProperty(""Guardian Gender"", Gender);
				row.SetProperty(""Guardian Date Of Birth"", newformatDOB);
				row.SetProperty(""Guardian ID Expiry Date"", newformatExpiry);
				row.SetProperty(""Guardian Flat/Villa No"", Flat);
				row.SetProperty(""Guardian Building No"", Building);
				row.SetProperty(""Guardian Road No"", Road);
				row.SetProperty(""Guardian Block No"", BlockNo);
				row.SetProperty(""Guardian Address Type"", ""Billing"");
				row.SetProperty(""Guardian Nationality"", country);
				row.SetProperty(""Guardian Card Occupation"",Occupation);
				row.SetProperty(""Guardian Current Occupation"",SystemOccupation);
				row.SetProperty(""Guardian Sponsor Name"",SponsorName);
				row.SetProperty(""Guardian Sponsor ID Number"",SponsorNo);
				row.SetProperty(""Guardian Passport No"",PassportNo);
				row.SetProperty(""Guardian Passport Issue Date"",newformatPassportIssueDate);
				row.SetProperty(""Guardian Passport Expiry Date"",newformatPassportExpiryDate);
				row.SetProperty(""Guardian Labour Force Participation"",LabourForceParticipation);
				row.SetProperty(""Guardian Employer Number"",EmployerNumber);
				row.SetProperty(""Guardian Employer Name"",EmployerName);
				row.SetProperty(""Guardian Verified"",""N"");*/
				OutputsIns.AddChild(row);
			}
			/*else
			//{//Mayank: Added for Open UI:STOP
			/*	if(CustType != ""Individual"")
				{
					row.SetProperty(""STC First Name"", FName);
					row.SetProperty(""STC Last Name"", LName);
					row.SetProperty(""STC Middle Name"", MiddleName);
					row.SetProperty(""ID"", CPR);
					row.SetProperty(""Gender"", Gender);
					row.SetProperty(""Date Of Birth"", newformatDOB);
					row.SetProperty(""ID Expiry Date"", newformatExpiry);
					row.SetProperty(""Flat/Villa No"", Flat);
					row.SetProperty(""Building No"", Building);
					row.SetProperty(""Road No"", Road);
					row.SetProperty(""Block No"", BlockNo);
					row.SetProperty(""Governorate"", Governorate);
					row.SetProperty(""Address Type"", ""Billing"");
					row.SetProperty(""Nationality"", country);
					OutputsIns.AddChild(row);
				}*/
				//else
				/*{
					if(sActiveApplet == ""STC Create New Customer Applet"")
					{
						row.SetProperty(""Account Type"", ""Individual"");
						row.SetProperty(""Sponsor Name"",SponsorName);
						row.SetProperty(""Sponsor ID Number"",SponsorNo);
						row.SetProperty(""Passport No"",PassportNo);
						row.SetProperty(""Passport Issue Date"",newformatPassportIssueDate);
						row.SetProperty(""Passport Expiry Date"",newformatPassportExpiryDate);
						row.SetProperty(""Labour Force Participation"",LabourForceParticipation);
						row.SetProperty(""Employer Number"",EmployerNumber);
						row.SetProperty(""Employer Name"",EmployerName);
						row.SetProperty(""Current Occupation"",SystemOccupation);
					}
					else if(sActiveApplet == ""STC Create New Retail Customer Applet"" || sActiveApplet == ""STC Create New Corporate Individual Customer Applet"")
					{
						row.SetProperty(""Contract Category"", ""Individual"");
						row.SetProperty(""STC Card Read Only"",""Yes"");
						row.SetProperty(""Sponsor Name"",SponsorName);
						row.SetProperty(""Sponsor ID Number"",SponsorNo);
						row.SetProperty(""Passport No"",PassportNo);
						row.SetProperty(""Passport Issue Date"",newformatPassportIssueDate);
						row.SetProperty(""Passport Expiry Date"",newformatPassportExpiryDate);
						row.SetProperty(""Labour Force Participation"",LabourForceParticipation);
						row.SetProperty(""Employer Number"",EmployerNumber);
						row.SetProperty(""Employer Name"",EmployerName);
						row.SetProperty(""Current Occupation"",SystemOccupation);
					}
					else if(sActiveApplet == ""STC Create New Customer Applet Mini"")
					{
						row.SetProperty(""Governorate"", Governorate);
						if(sMethodInvoked == ""STCTEST"")
						{
							row.SetProperty(""Current Occupation"",SystemOccupation);
						}

					}
					//Fields common to all Applets and all methods
					row.SetProperty(""First Name"", FName);
					row.SetProperty(""Last Name"", LName);
					row.SetProperty(""Middle Name"", MiddleName);
					row.SetProperty(""ID"", CPR);
					row.SetProperty(""Gender"", Gender);
					row.SetProperty(""Date Of Birth"", newformatDOB);
					row.SetProperty(""ID Type"", ""Bahraini ID"");
					row.SetProperty(""ID Expiry Date"", newformatExpiry);
					row.SetProperty(""Flat/Villa No"", Flat);
					row.SetProperty(""Building No"", Building);
					row.SetProperty(""Road No"", Road);
					row.SetProperty(""Block No"", BlockNo);
					row.SetProperty(""Address Type"", ""Billing"");
					row.SetProperty(""Nationality"", country);
					row.SetProperty(""Card Occupation"",Occupation);
					OutputsIns.AddChild(row);
					TheApplication().GetService(""FINS Teller UI Navigation"").InvokeMethod(""RefreshCurrentApplet"", TheApplication().NewPropertySet(), TheApplication().NewPropertySet());
				}
			}*///Mayank: Added for Open UI -- ELSE Closed
		}
	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
}
"//***********************************************************************************************************//
//Purpose: 1) To Log the exceptions in Custom Error Log Table
//Inputs: Error Message
//Author: Rajitha P G
//Release: R1.0
//Date: 29-Oct-09
//*************************************************************************************************************//
function LogException(e)
{
	var appObj;
  	var psInput;
  	var psOutput;
  	var bsErrorHandler; 
	try
 	{
		  appObj = TheApplication();
		  with(appObj)
		  {
			  psInput = NewPropertySet();
			  psOutput = NewPropertySet();
			  bsErrorHandler = GetService(""STC Generic Error Handler"");
		  }
		  with(psInput)
		  {
			  SetProperty(""Error Code"", e.errCode);
			  SetProperty(""Error Message"", e.errText);
			  SetProperty(""Object Name"", ""STC Customer Search"");
			  SetProperty(""Object Type"", ""Buisness Service"");
		  }
		  bsErrorHandler.InvokeMethod(""Log Message"", psInput, psOutput);
 	}
 	catch(e)
 	{
  		// do nothing	
 	}
 	finally
 	{
 
		  bsErrorHandler = null;
		  psOutput = null;
		  psInput = null;
		  appObj = null;
 	}
}
function Query(Inputs,Outputs)
{
	try
	{
/*	var Appobj = TheApplication();
	var sPreviousView = Appobj.GetProfileAttr(""sPreview"");
	if(sPreviousView == ""Response View"") 
	  {
	
	var vFstname = TheApplication().GetProfileAttr(""sFstname"");
	var vLstname = TheApplication().GetProfileAttr(""sLstname"");
	var vCamId = TheApplication().GetProfileAttr(""sCampaignId""); //Added by Sudeep for Campaign
	
	var PsOutputs = Appobj.NewPropertySet();
	//Outputs.SetProperty(""First Name"",sFstname);
	//Outputs.SetProperty(""Last Name"",sLstname);
	PsOutputs.SetProperty(""First Name"",vFstname);
	PsOutputs.SetProperty(""Last Name"",vLstname);
	PsOutputs.SetProperty(""STC Campaign Id"",vCamId); //Added by Sudeep for Campaign
	Outputs.AddChild(PsOutputs);
		//PsOutputs.SetProperty(""Contact First Name"",sFstname);
		//PsOutputs.SetProperty(""Contact Last Name"",sLstnmae);
		
	    }*/
	}
	
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
	
	
	
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	var ireturn=ContinueOperation;
	try
	{
		switch(MethodName)
		{
			case ""Init"":
					Init(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
			case ""Query"":
					Query(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
					
			case ""PreInsert"":
					ireturn = CancelOperation;
					break;
							
			case ""Insert"":
				Insert(Inputs,Outputs);//Mayank: Added for Gaurdian Open UI
					ireturn = CancelOperation;
					break;

			case ""Update"":
					ireturn = CancelOperation;
					break;
	
			case ""Delete"":
					ireturn = CancelOperation;
					break;

			default:
					ireturn = ContinueOperation;
		}
		return(ireturn);
	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
	
}
//Your public declarations go here...
function ExtractAttachmentPath(Inputs,Outputs)
{


var sAbsoluteFileFinalName = """", sAbsoluteFileName = """", sGetFileReturn = """", sStatus = """";
var ActivityId = Inputs.GetProperty(""ActivityId"");
var boAttach = TheApplication().GetBusObject(""Avaya Attachment BO"");
var bcAttach = boAttach.GetBusComp(""Avaya Activity Attachment"");

with (bcAttach)

{
ActivateField(""ActivityFileName"");
ActivateField(""Activity Id"");
ClearToQuery();
//SetSearchSpec(""ActivityFileName"", AttachmentName);
SetSearchSpec(""Activity Id"", ActivityId);
ExecuteQuery(ForwardOnly);
var count = CountRecords();
 var IsAttachAvail = FirstRecord();
while (IsAttachAvail)

{

sGetFileReturn = InvokeMethod(""GetFile"", ""ActivityFileName"");

	var Length = sGetFileReturn.length;

sStatus = sGetFileReturn.substring(0, sGetFileReturn.indexOf("",""));

if (sStatus == ""Success"")

{

sAbsoluteFileName = sGetFileReturn.substring(sGetFileReturn.indexOf("","") + 1, Length);

}
//sAbsoluteFileFinalName = sAbsoluteFileFinalName + ""*"" +sAbsoluteFileName;
sAbsoluteFileFinalName = sAbsoluteFileName + ""*"" +sAbsoluteFileFinalName;

IsAttachAvail = NextRecord();
}

}
return (sAbsoluteFileFinalName);





}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""ExtractAttachmentPath""){
	var sAbsoluteFileFinalName =	ExtractAttachmentPath(Inputs,Outputs);
	Outputs.SetProperty(""sAbsoluteFileFinalName"",sAbsoluteFileFinalName);
		return CancelOperation;
	}
	return (ContinueOperation);
}
//Your public declarations go here...
"//***********************************************************************************************************//
//Purpose: 1) To Initialize the fields in the BC.
//Release: Single View
//Date: Mar-02-2013
//*************************************************************************************************************//
function Init(Inputs,Outputs)
{
	try
	{
		with(Outputs)
		{
			SetProperty(""Number Type"","""");
			SetProperty(""MSISDN"","""");
			SetProperty(""Id"","""");
		}

	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
}
function Insert(Inputs,Outputs)
{


}
"//***********************************************************************************************************//
//Purpose: 1) To Log the exceptions in Custom Error Log Table
//Inputs: Error Message
//Author: Suman Kanumuri
//Release: Single View
//Date: Mar-02-2013
//*************************************************************************************************************//
function LogException(e)
{
	var appObj;
  	var psInput;
  	var psOutput;
  	var bsErrorHandler; 
	try
 	{
		  appObj = TheApplication();
		  with(appObj)
		  {
			  psInput = NewPropertySet();
			  psOutput = NewPropertySet();
			  bsErrorHandler = GetService(""STC Generic Error Handler"");
		  }
		  with(psInput)
		  {
			  SetProperty(""Error Code"", e.errCode);
			  SetProperty(""Error Message"", e.errText);
			  SetProperty(""Object Name"", ""STC Cloud PBX Reservation Screen Export"");
			  SetProperty(""Object Type"", ""Buisness Service"");
		  }
		  bsErrorHandler.InvokeMethod(""Log Message"", psInput, psOutput);
 	}
 	catch(e)
 	{
  		// do nothing	
 	}
 	finally
 	{
 
		  bsErrorHandler = null;
		  psOutput = null;
		  psInput = null;
		  appObj = null;
 	}
}
"//***********************************************************************************************************//
//Author: Manu Antony
//*************************************************************************************************************//
function Query(Inputs,Outputs)
{
	try
	{
  
  var sAccBO = TheApplication().GetBusObject(""Account"");
  var sDIDBc = sAccBO.GetBusComp(""STC PBX DID Reservation BC"");
  var sExtBc = sAccBO.GetBusComp(""STC PBX Extension Reservation BC"");
  
  
  var DBANId = """", DBANNum = """", OutputPS = """";var PsChildRec = """", MSISDN = 0; 
  var Range = 0, StartExtension = 0;
  	var PilotNumber = TheApplication().GetProfileAttr(""PilotNumber"");

	if (PilotNumber != """" )
	{
		PsChildRec = TheApplication().NewPropertySet();
		with (PsChildRec)
		{
		SetProperty(""Number Type"",""Pilot"");
		SetProperty(""MSISDN"",PilotNumber);
		}
		 Outputs.AddChild(PsChildRec);  

	  with(sDIDBc)
	  {
       ActivateField(""PilotNum"");
	   ActivateField(""DID Flag"");
       ClearToQuery();
	   SetSearchSpec(""PilotNum"",PilotNumber);
	   SetSearchSpec(""DID Flag"",""Y"");
       SetViewMode(AllView);
	   ExecuteQuery(ForwardOnly);
	   var count = CountRecords();
	   var IsDIDAvail = FirstRecord();
	   while(IsDIDAvail)
		{
		PsChildRec = TheApplication().NewPropertySet();
		MSISDN = GetFieldValue(""MSISDN"");  
		with (PsChildRec)
		{
		SetProperty(""Number Type"",""DID"");
		SetProperty(""MSISDN"",MSISDN);
		}
			
	 Outputs.AddChild(PsChildRec);  
     IsDIDAvail = NextRecord();
		}
	  }//with(sDIDBc)
	  
	  with(sExtBc)
	  {
       ActivateField(""PilotNum"");
	   ActivateField(""Extension Flag"");
	   ActivateField(""Range"");
	   ActivateField(""Starting Extension"");
       ClearToQuery();
	   SetSearchSpec(""PilotNum"",PilotNumber);
	   SetSearchSpec(""Extension Flag"",""Y"");
       SetViewMode(AllView);
	   ExecuteQuery(ForwardOnly);
	   var count = CountRecords();
	   var IsExtAvail = FirstRecord();
	   while(IsExtAvail)
		{

		Range = ToNumber(GetFieldValue(""Range"")); 
		MSISDN = ToNumber(GetFieldValue(""Starting Extension"")); 
		var i = 0;
		while(i < Range)
		{
		PsChildRec = TheApplication().NewPropertySet();	
		
		with (PsChildRec)
		{
		SetProperty(""Number Type"",""Extension"");
		SetProperty(""MSISDN"",MSISDN);
		}
			
		Outputs.AddChild(PsChildRec); 
		MSISDN = ToNumber(MSISDN) + 1; 
		i=i+1;
		}
		
     IsExtAvail = NextRecord();
		}
	  }
	//TheApplication().SetProfileAttr(""PilotNumber"", """");
	}

}


catch(e)
 {
		LogException(e);
		var psRec = TheApplication().NewPropertySet();
		psRec.SetProperty(""Number Type"" , ""Error Occurred"");
		psRec.SetProperty(""MSISDN"" , e.errCode() + "":"" + e.errText());
		Outputs.AddChild(psRec);
 }
 finally
 {
  sDIDBc = null;
  sAccBO = null;
  MSISDN = null;
  PsChildRec = null;
  
 }

	

}
function Service_InvokeMethod (MethodName, Inputs, Outputs)
{

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	var ireturn;
	try
	{
		switch(MethodName)
		{
			case ""Init"":
					Init(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
			case ""Query"":
					Query(Inputs,Outputs);
					ireturn = CancelOperation;
					break;

			case ""Insert"":
					Insert(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
					
			case ""PreInsert"":
					ireturn = CancelOperation;
					break;
						

			case ""Update"":
					Update(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
	
			case ""Delete"":
					ireturn = CancelOperation;
					break;

			default:
					ireturn = ContinueOperation;
		}
		return(ireturn);
	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
	
}
function Update(Inputs,Outputs)
{


}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
/**********************************************
*  Created By:    Ankit Agrawal
*  Date Created:  29-May-2013
*  Description/Purpose/Notes: MULTI-PURPOSE BS
***********************************************/

	switch(MethodName)
	{
		case""createSR"":			createSR(Inputs,Outputs);break;
		case"findRecord"":		findRecord(Inputs,Outputs);break;
	}
	return(CancelOperation);
}
"/*********************************************************************************************
Created by	: 	Ankit Agrawal 
Description : 	This Service creates a Service Request
Input		:	Type,Tier1,Tier2,Tier3,Customer Account Id, Asset Id OR Phone Number,
Billing Account Id,Description,Status,SubStatus
**********************************************************************************************/
function createSR(Inputs,Outputs)
{
	var sSRId,sSRNum,sErr,sErrStr,iCounter=0;
	var oBCPick,BOStcEaiAcc,BCStcEaiAcc,BCStcEaiSerReq,BCStcFindAsset;
	var sApp=TheApplication();
	var sSRType,sTier1,sTier2,sTier3,sStatus,sSubStatus,sSource,sCustId,sBillId,sAssetId,sPhoneNum,sReason,sCustSubType,sysdatestring;
	var sSvcAcctId=""""; 
	var sSRBO = TheApplication().GetBusObject(""Service Request"");
	var sSearchExp = """";
	var sysdate = new Date();
	var sTypeEnq = ""Enquiry"";
	Outputs.SetProperty(""RequestFound"",""N"");

	try
	{
		sSRType		=	Inputs.GetProperty(""SRType"");
		sTier1		=	Inputs.GetProperty(""Tier1"");
		sTier2		=	Inputs.GetProperty(""Tier2"");
		sTier3		=	Inputs.GetProperty(""Tier3"");
		sStatus		=	Inputs.GetProperty(""Status"");
		sSubStatus	=	Inputs.GetProperty(""SubStatus"");
		sSource		=	Inputs.GetProperty(""Source"");
		sCustId		=	Inputs.GetProperty(""CustAcctId"");
		sBillId		=	Inputs.GetProperty(""BillAcctId"");
		sAssetId	=	Inputs.GetProperty(""Asset Id"");
		sPhoneNum	=	Inputs.GetProperty(""MSISDN"");
		sReason		=	Inputs.GetProperty(""Desc"");
		BOStcEaiAcc	=	sApp.GetBusObject(""STC Service Account"");
		BCStcEaiAcc	=	BOStcEaiAcc.GetBusComp(""CUT Service Sub Accounts"");
		BCStcEaiSerReq = BOStcEaiAcc.GetBusComp(""Service Request"");
		sSvcAcctId=sCustId;
		
		do{
			sErr=false;
			sErrStr=sSRId=sSRNum="""";
			try
			{
				BCStcEaiAcc.ClearToQuery();
				BCStcEaiAcc.SetViewMode(AllView);
				BCStcEaiAcc.SetSearchSpec(""Id"",sCustId);
				BCStcEaiAcc.ExecuteQuery(ForwardOnly);
				if(BCStcEaiAcc.FirstRecord())
				{			
					if((sAssetId==null||sAssetId=="""")&&(sPhoneNum==null||sPhoneNum==""""))
					{				
						BCStcFindAsset=BOStcEaiAcc.GetBusComp(""STC Asset Mgmt - Asset Thin"");
						BCStcFindAsset.ActivateField(""Serial Number"");
						BCStcFindAsset.ActivateField(""Root Asset Id"");
						BCStcFindAsset.ActivateField(""Parent Asset Id"");
						BCStcFindAsset.ActivateField(""Service Account Id"");
						BCStcFindAsset.ClearToQuery();
						BCStcFindAsset.SetViewMode(3);
						BCStcFindAsset.SetSearchExpr(""[Service Account Id] = '""+sCustId+""' AND [Parent Asset Id] IS NULL AND [Status] <> 'Inactive'"");
						BCStcFindAsset.ExecuteQuery(ForwardOnly);
						if(BCStcFindAsset.FirstRecord())
						{
							sPhoneNum=BCStcFindAsset.GetFieldValue(""Serial Number"");
							sAssetId = BCStcFindAsset.GetFieldValue(""Id"");
							sSvcAcctId=BCStcFindAsset.GetFieldValue(""Service Account Id"");
						}
					}
			
					BCStcEaiSerReq.ActivateField(""INS Product"");
					BCStcEaiSerReq.ActivateField(""INS Area"");
					BCStcEaiSerReq.ActivateField(""INS Sub-Area"");
					BCStcEaiSerReq.ActivateField(""Status"");
					BCStcEaiSerReq.ActivateField(""Sub-Status"");
					BCStcEaiSerReq.ActivateField(""Source"");
					BCStcEaiSerReq.ActivateField(""Account Id"");
					BCStcEaiSerReq.ActivateField(""Asset Id"");
					BCStcEaiSerReq.ActivateField(""Description"");
					BCStcEaiSerReq.ActivateField(""Serial Number"");
					BCStcEaiSerReq.ActivateField(""SR Type"");
			
					BCStcEaiSerReq.NewRecord(NewBefore);

					BCStcEaiSerReq.SetFieldValue(""SR Type"", sApp.InvokeMethod(""LookupValue"",""SR_TYPE"",sSRType));
					BCStcEaiSerReq.SetFieldValue(""INS Product"",sApp.InvokeMethod(""LookupValue"",""SR_AREA"",sTier1));
					BCStcEaiSerReq.SetFieldValue(""INS Area"",sApp.InvokeMethod(""LookupValue"",""SR_AREA"",sTier2));
					BCStcEaiSerReq.SetFieldValue(""INS Sub-Area"",sApp.InvokeMethod(""LookupValue"",""SR_AREA"",sTier3));
					BCStcEaiSerReq.SetFieldValue(""Status"",sApp.InvokeMethod(""LookupValue"",""SR_STATUS"",sStatus));
					BCStcEaiSerReq.SetFieldValue(""Sub-Status"",sApp.InvokeMethod(""LookupValue"",""SR_SUB_STATUS"",sSubStatus));
					BCStcEaiSerReq.SetFieldValue(""Source"",sApp.InvokeMethod(""LookupValue"",""SR_SOURCE"",sSource));
					BCStcEaiSerReq.SetFieldValue(""Account Id"",sSvcAcctId);
					if(sReason!=null && sReason!="""")
						BCStcEaiSerReq.SetFieldValue(""Description"",sReason);
			
					oBCPick=BCStcEaiSerReq.GetPicklistBusComp(""Serial Number"");
					oBCPick.ClearToQuery();
					oBCPick.SetViewMode(AllView);			
					if(sPhoneNum!=null&&sPhoneNum!="""")
					{
						oBCPick.SetSearchExpr(""[Parent Asset Id] IS NULL AND [Status] <> '""+TheApplication().InvokeMethod(""LookupValue"", ""IMPL_PHASE"", ""Inactive"")+""' AND [Serial Number] = '""+sPhoneNum+""'"");
					}
					else if(sAssetId!=null&&sAssetId!="""")
						oBCPick.SetSearchSpec(""Asset Id"",sAssetId);
			
					if(oBCPick.GetSearchSpec(""Asset Id"")!=null || oBCPick.GetSearchSpec(""Serial Number"")!=null)
					{
						oBCPick.ExecuteQuery(ForwardOnly);
						if(oBCPick.FirstRecord())
							oBCPick.Pick();
					}
					oBCPick=null;
			
					BCStcEaiSerReq.WriteRecord();
					sSRId = BCStcEaiSerReq.GetFieldValue(""Id"");
					sSRNum = BCStcEaiSerReq.GetFieldValue(""SR Number"");
				}
				else
					throw""Customer Account doesnot exist"";
			}
			catch(e)
			{
				Outputs.SetProperty(""Error"",e.toString());				
			}
		}while(sErr&&++iCounter<3)
	
		Outputs.SetProperty(""SRId"",sSRId);
		Outputs.SetProperty(""SRNumber"",sSRNum);
		Outputs.SetProperty(""Error"",sErrStr);
	}
	finally
	{
		oBCPick			=	null;
		BCStcEaiSerReq	=	null;
		BCStcEaiAcc		=	null;
		BCStcFindAsset	=	null;
		BOStcEaiAcc		=	null;
		sSRId=sErr=sErrStr=sApp=sTier1=sTier2=null;
		sReason=sTier3=sStatus=sSubStatus=sSource=sCustId=sBillId=sAssetId=sPhoneNum=null;
	}
}
"/********************************************************************************************
Created by	: 	Ankit Agrawal
Description : 	This Service is similar to FindRecord of ""Inbound E-mail Database Operations"" BS except that it accepts an additional I/p Argument of ""SearcSpec""
Input		:	Business Object, Business Component, Query Fields, Value Fields, Search Spec
**********************************************************************************************/
function findRecord(Inputs,Outputs)
{
	var sApp		=	TheApplication();
	var sBO			=	Inputs.GetProperty(""BusObject"");
	var sBC			=	Inputs.GetProperty(""BusComp"");
	var sQueryFlds	=	Inputs.GetProperty(""QueryFields"");
	var sValueFlds	=	Inputs.GetProperty(""ValueFields"");
	var sSpc		=	Inputs.GetProperty(""SearchSpec"");
	var sIgnBlInp	= 	Inputs.GetProperty(""IgnoreBlankInputs"");
	var sNegCode,sCode,sExpr;

	sNegCode=sCode=sExpr="""";
	Outputs.SetProperty(""ErrorFlag"",""N"");
	Outputs.SetProperty(""ErrorMessage"","""");
	Outputs.SetProperty(""RecordCount"",""0"");

	try{
		sBO	=	sApp.GetBusObject(sBO);
		sBC	=	sBO.GetBusComp(sBC);
		sBC.SetViewMode(AllView);
		sBC.ClearToQuery();
		var fldsArray=new Array();
		fldsArray=sQueryFlds.split("","");

		for(var i=0;i<fldsArray.length;i++){
			sBC.ActivateField(fldsArray[i]);
			if((sIgnBlInp==null || sIgnBlInp=="""" || sIgnBlInp==""N"") || (sIgnBlInp==""Y"" && Inputs.GetProperty(fldsArray[i])!=null && Inputs.GetProperty(fldsArray[i])!=""""))
				sExpr+=""[""+fldsArray[i]+""]='""+Inputs.GetProperty(fldsArray[i])+""' AND "";
		}
		if(sSpc!=null && sSpc!="""")
			sExpr+=sSpc;
		else
			sExpr=sExpr.substring(0,sExpr.lastIndexOf("" AND ""));
		sBC.SetSearchExpr(sExpr);

		fldsArray=sValueFlds.split("","");
		for(var j=0;j<fldsArray.length;j++)
		{
			sBC.ActivateField(fldsArray[j]);
			sCode+=""Outputs.SetProperty(fldsArray[""+j+""],sBC.GetFieldValue(fldsArray[""+j+""]));"";
			sNegCode+=""Outputs.SetProperty(fldsArray[""+j+""],'');"";
		}

		sBC.ExecuteQuery(ForwardOnly);
		Outputs.SetProperty(""RecordCount"",sBC.CountRecords());

		if(sBC.FirstRecord())
			eval(sCode);
		else
			eval(sNegCode);
	}
	catch(e){
		Outputs.SetProperty(""ErrorFlag"",""Y"");
		Outputs.SetProperty(""ErrorMessage"",e.toString());
	}
	finally{
		sQueryFlds = sValueFlds = null;
		sBC = null;
		sBO = null;
		sApp = null;
		sSpc = sNegCode = sCode = sExpr = null;
	}
}
function CheckDuplicate(Inputs,Outputs)
{
  var mbRecExists;
  var mboAccount;
  var mbcAccount; 
  var msNewAccId;
  var msIDType; 
  var msIDNum;
  var msAccType;
  var msCompId;
  var msSrchExp,msSearch = """";
 try 
 {
  //Resetting the Property
  Outputs.SetProperty(""gCombExists"",""N"");
  mboAccount = TheApplication().GetBusObject(""Account"");
  mbcAccount = mboAccount.GetBusComp(""Account"");
  msNewAccId= Inputs.GetProperty(""StrAccountId"");
  msIDType = Inputs.GetProperty(""IDType"");//had single quotes appended here, removed from here and set on SrchExpr
  msIDNum = Inputs.GetProperty(""IDNum"");
  msAccType = Inputs.GetProperty(""CustType"");
  msCompId = Inputs.GetProperty(""CompId"");
  //Querying for duplicate combination of ID Type and ID #
  with(mbcAccount)
  {
   SetViewMode(AllView);
   ActivateField(""Survey Type"");
   ActivateField(""Tax ID Number"");
   ActivateField(""STC CR Number"");
   ActivateField(""Type"");
   ClearToQuery();
   
 
     if(msAccType == TheApplication().InvokeMethod(""LookupValue"",""STC_CUST_TYPE"",""Organization""))
     {
      msSearch = "" AND [STC CR Number] ='"" + msCompId + ""'"";
     }
     msSrchExp = ""[Tax ID Number]='"" + msIDNum + ""' AND [Survey Type] ='"" + msIDType + ""' AND [Type] ='"" + msAccType + ""'"" + msSearch; 
     SetSearchExpr(msSrchExp);
     ExecuteQuery(ForwardOnly);
     mbRecExists = FirstRecord();
      while(mbRecExists)//can get more than one record
      {
    if(msNewAccId == """" || msNewAccId == null) //this is the call from New customer VBC where account Id would be null
    {
       Outputs.SetProperty(""gCombExists"",""Y"");
       break;
    }   
        if(msNewAccId != GetFieldValue(""Id""))//exclude currently created new account
        {
         Outputs.SetProperty(""gCombExists"",""Y""); //If combination already exists prompt user through Browser Script
         break;
        }
       mbRecExists = NextRecord();
      }
  // praveen Perala CRP Validation    
      if(msAccType == TheApplication().InvokeMethod(""LookupValue"",""STC_CUST_TYPE"",""Individual"")) 
      {
       msSrchExp = ""[STC CR Number]='"" + msIDNum + ""'"";
    SetSearchExpr(msSrchExp);
    ExecuteQuery(ForwardOnly);
    mbRecExists = FirstRecord();
      while(mbRecExists)//can get more than one record
        {
      if(msNewAccId == """" || msNewAccId == null) //this is the call from New customer VBC where account Id would be null
      {
         Outputs.SetProperty(""gCombExists"",""Y"");
         break;
      }   
          if(msNewAccId != GetFieldValue(""Id""))//exclude currently created new account
          {
           Outputs.SetProperty(""gCombExists"",""Y""); //If combination already exists prompt user through Browser Script
           break;
          }
         mbRecExists = NextRecord();
        }
      }//else
      
  }//with
  return(CancelOperation);
 }//try
 catch(e)
 {
  throw(e.toString());
 }
 finally
 {
  mbcAccount = null;
  mboAccount = null; 
 }
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
 if(MethodName == ""CheckDuplicate"")
 {
  CheckDuplicate(Inputs,Outputs);
  return(CancelOperation);
 }
 
 
 return (ContinueOperation);
}
function AddToDate(sourceDate, nMonths, nDays, nHours, nMinutes, nSeconds, nsign)
{//[NAVIN: 29Jan2017: MultipleBillCycles]
	// Parameters : // sourceDate : Date object // nDays, nHours , nMinutes , nSeconds : Integer numbers // nsign : Can have two values : 1 or -1 // 1 indicates to ADD to the sourceDate // -1 indicates to SUBTRACT from the sourceDate // Returns : A date object, after adding/subtracting // ndays,hNours,nMinutes // and nseconds to the sourceDate. 
	var retDate = sourceDate; 
	retDate.setMonth(retDate.getMonth()+nsign*nMonths);
	retDate.setDate(retDate.getDate()+nsign*nDays); 
	retDate.setHours(retDate.getHours()+nsign*nHours); 
	retDate.setMinutes(retDate.getMinutes()+nsign*nMinutes); 
	retDate.setSeconds(retDate.getSeconds()+nsign*nSeconds); 
	return (retDate);
}
function AddToDateWF(Inputs, Outputs)
{
// Parameters : // sourceDate : Date object // nDays, nHours , nMinutes , nSeconds : Integer numbers // nsign : Can have two values : 1 or -1 // 1 indicates to ADD to the sourceDate // -1 indicates to SUBTRACT from the sourceDate // Returns : A date object, after adding/subtracting // ndays,hNours,nMinutes // and nseconds to the sourceDate. 
	
	var SourceDate, nMonths=0, nDays=0, nHours=0, nMinutes=0, nSeconds=0, nsign=0, retFormat="""", outDateFormat="""", outTime="""";
	var Month="""", MM="""", DD="""", YYYY="""", HH="""", MI="""", SS="""";
	SourceDate = Inputs.GetProperty(""SourceDate"");
	nMonths = Inputs.GetProperty(""nMonths"");
	nDays = Inputs.GetProperty(""nDays"");
	nHours = Inputs.GetProperty(""nHours"");
	nMinutes = Inputs.GetProperty(""nMinutes"");
	nSeconds = Inputs.GetProperty(""nSeconds"");
	nsign = Inputs.GetProperty(""nsign"");
	retFormat = Inputs.GetProperty(""retDateFormat"");
	var retDate="""";
	if(nsign == """")
		nsign=1;
	if(SourceDate == """")
		retDate = new Date()
	else
		retDate = new Date(SourceDate);

	if(nMonths != """")
		retDate.setMonth(retDate.getMonth()+nsign*nMonths);
	if(nDays != """")
		retDate.setDate(retDate.getDate()+nsign*nDays);
	if(nHours != """")
		retDate.setHours(retDate.getHours()+nsign*nHours);
	if(nMinutes != """")
		retDate.setMinutes(retDate.getMinutes()+nsign*nMinutes);
	if(nSeconds != """")
		retDate.setSeconds(retDate.getSeconds()+nsign*nSeconds);
	
	 // default = ""MM/DD/YYYY""
	outDateFormat = (ToNumber(retDate.getMonth())+1)+""/""+retDate.getDate()+""/""+retDate.getFullYear();
	outTime = retDate.getHours()+"":""+retDate.getMinutes()+"":""+retDate.getSeconds();

	Month = (ToNumber(retDate.getMonth())+1);
	DD = ToString(retDate.getDate()).length==1? ""0""+retDate.getDate() : retDate.getDate();
	MM = ToString(Month).length==1? ""0""+Month :Month;
	YYYY =  retDate.getFullYear();
	HH = ToString(retDate.getHours()).length==1? ""0""+retDate.getHours() : retDate.getHours();
	MI = ToString(retDate.getMinutes()).length==1? ""0""+retDate.getMinutes() : retDate.getMinutes();
	SS = ToString(retDate.getSeconds()).length==1? ""0""+retDate.getSeconds() : retDate.getSeconds();

	if(retFormat == ""DD/MM/YYYY"")
		outDateFormat = DD+""/""+MM+""/""+YYYY;
	else // default = ""MM/DD/YYYY""
		outDateFormat = MM+""/""+DD+""/""+YYYY;

	outTime = HH+"":""+MI+"":""+SS;

	//return (retDate);
	Outputs.SetProperty(""outDateTimeFormat"", outDateFormat+"" ""+outTime);
	Outputs.SetProperty(""outDateFormat"", outDateFormat);
	Outputs.SetProperty(""outTime"", outTime);
	Outputs.SetProperty(""outDateTimeDDMM"", DD+""/""+MM+""/""+YYYY+"" ""+outTime);
	Outputs.SetProperty(""outDateDDMM"", DD+""/""+MM+""/""+YYYY);
	Outputs.SetProperty(""outDateTimeMMDD"", MM+""/""+DD+""/""+YYYY+"" ""+outTime);
	Outputs.SetProperty(""outDateMMDD"", MM+""/""+DD+""/""+YYYY);
}
function GetRemainingContract(Inputs, Outputs)
{
  try
  {
	var OrderId = Inputs.GetProperty(""Order Id"");
	var strServiceId = Inputs.GetProperty(""ServiceId"");
	var strUsrFetMRCdiscCycle = Inputs.GetProperty(""User Feature MRC disc Cycle"");
	
	if(strServiceId != """")
	{
		var boSrvAcnt = TheApplication().GetBusObject(""STC Service Account"");
		var bcSrvAcnt = boSrvAcnt.GetBusComp(""CUT Service Sub Accounts"");
		var bcAsset = boSrvAcnt.GetBusComp(""Asset Mgmt - Asset""); 	//Asset Mgmt - Asset (Order Mgmt)"");
		var bcAssetXA =boSrvAcnt.GetBusComp(""Asset Mgmt - Asset XA"");

		with(bcSrvAcnt)
		{
			ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Id"", strServiceId);
			ExecuteQuery(ForwardOnly);
			if (FirstRecord())
			{   
				var SrvcAccntProfile = GetFieldValue(""STC Profile Type"");
				with(bcAsset)
				{
					ActivateField(""Install Date"");
					ActivateField(""Service Length"");
					ActivateField(""Service Length UoM"");
					ActivateField(""STC Service Length"");
					ActivateField(""STC Service Length UoM"");
					ClearToQuery();
					SetViewMode(AllView);   
					var strExpr = "" [Service Account Id] = '""+ strServiceId +""'""  + "" AND [STC Plan Type] = 'MainContract' AND [Status] = 'Active'""; 
					SetSearchExpr(strExpr);
					ExecuteQuery(ForwardOnly);
					if(FirstRecord())   
					{
						var SrvcInstalDt="""", ContractSrvcLen="""", ContractSrvcLenUOM="""", ContractEndDate="""", ContractEndDateMS="""",ContractEndDt="""",ContractEndMMDDYYYY="""";
						SrvcInstalDt = GetFieldValue(""Install Date"");
						ContractSrvcLen = GetFieldValue(""Service Length"");
						ContractSrvcLenUOM = GetFieldValue(""Service Length UoM"");
						Outputs.SetProperty(""Id"", GetFieldValue(""Id"") );

						var dtSrvcInstall = new Date(SrvcInstalDt);
						var dtToday = new Date();
						if(ContractSrvcLenUOM == ""Months"")
							ContractEndDateMS = dtSrvcInstall.setMonth(ContractSrvcLen);
						
						ContractEndDt = new Date(ContractEndDateMS);
						
						var month = ContractEndDt.getMonth()+1;
						var date = ContractEndDt.getDate();
						ContractEndMMDDYYYY = ((ToString(month).length == 1) ? (""0""+month) : month )
											+ ""/"" + ((ToString(date).length == 1) ? (""0""+date) : date)
											+ ""/"" + ContractEndDt.getFullYear();
						
						Outputs.SetProperty(""SrvcInstalDt"", SrvcInstalDt);
						Outputs.SetProperty(""ContractSrvcLen"", ContractSrvcLen);
						Outputs.SetProperty(""ContractSrvcLenUOM"", ContractSrvcLenUOM);
						Outputs.SetProperty(""ContractEndDateMS"", ContractEndDateMS);
						Outputs.SetProperty(""ContractEndDt"", ContractEndDt);
						Outputs.SetProperty(""ContractEndMMDDYYYY "", ContractEndMMDDYYYY );
						
						if(strUsrFetMRCdiscCycle != """")
						{
							var xDate = new Date();
							var xDateSetCycleMS = xDate.setMonth(strUsrFetMRCdiscCycle);
							var xDateSetCycleDate = new Date(xDateSetCycleMS);
							Outputs.SetProperty(""xDateSetCycleMS "", xDateSetCycleMS );
							Outputs.SetProperty(""xDateSetCycleDate "", xDateSetCycleDate );
							if(xDateSetCycleMS > ContractEndDateMS)
							{
								Outputs.SetProperty(""ErrorMessage"", ""The 'User Feature Addon MRC Discount' cannot exceed the remaining contract duration"");
								Outputs.SetProperty(""ErrorCode"", ""1"");
							}
							else
								Outputs.SetProperty(""ErrorMessage"", ""SUCCESS"");
							}	
							
					}
				}
			}
		}//with(bcSrvAcnt)
	}
	else if(OrderId != """")
	{
		var boOrder = TheApplication().GetBusObject(""Order Entry (Sales)"");
        var bcOrder = boOrder.GetBusComp(""Order Entry - Orders"");
        var bcLineItms = boOrder.GetBusComp(""Order Entry - Line Items"");
        var bcLineXA = boOrder.GetBusComp(""Order Item XA"");
       
		var strStartDt,strOrderType, strExpr, bRecExist1;
		var strLineId="""",strPlanType="""",strPart="""",strAction="""",ContractInstallDt="""",ContractAction="""",ContractLength="""",ContractLengthUoM="""";
		var SysFetMRCdiscLine="""",OneUserFetMRCdiscLine="""", DiscCycle="""", strProdName="""";
		with (bcOrder)
		{
			ActivateField(""Order Date"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Id"", OrderId);
			ExecuteQuery(ForwardOnly);
			if (FirstRecord())
			{
				strStartDt = GetFieldValue(""Order Date"");
				strOrderType = GetFieldValue(""STC Order SubType"");
				with(bcLineItms)
				{
					ActivateField(""Order Header Id"");
					ActivateField(""Parent Order Item Id"");
					ActivateField(""Part Number"");
					ActivateField(""Status"");
					ActivateField(""Product Type"");
					ActivateField(""Part Number"");

					SetViewMode(AllView);
					ClearToQuery();
					if(strOrderType == ""Provide"")
						strExpr = ""[Order Header Id] = '""+OrderId+""' AND ([STC Plan Type] = 'MainContract' OR [Part Number] = 'SYSFEATUREMRCDISC' OR [Part Number] = 'ONEUSERFEATUREMRCDISC') AND [Action Code] = 'Add'"";
					if(strOrderType == ""Modify"")
						strExpr = ""[Order Header Id] = '""+OrderId+""' AND ((([Part Number] = 'SYSFEATUREMRCDISC' OR [Part Number] = 'ONEUSERFEATUREMRCDISC') AND [Action Code] = 'Add') OR ([STC Plan Type] = 'MainContract' AND ([Action Code] = '-' OR [Action Code] = 'Add')))"";
					Outputs.SetProperty(""99strExpr"", strExpr);
					SetSearchExpr(strExpr);
					ExecuteQuery(ForwardOnly);
					bRecExist1 = FirstRecord();
					while(bRecExist1)
					{
						strLineId = GetFieldValue(""Id"");
						strPlanType = GetFieldValue(""STC Plan Type"");
						strPart = GetFieldValue(""Part Number"");
						strAction = GetFieldValue(""Action Code"");
						if(strPlanType == ""MainContract"") // && (strAction == ""Add"" || strAction == ""-""))
						{
							if(strAction == ""Add"")
								ContractInstallDt = strStartDt;
							else
								ContractInstallDt = GetFieldValue(""STC Install Date"");
							
							ContractAction = strAction;
							ContractLength = GetFieldValue(""Service Length"");
							ContractLengthUoM=GetFieldValue(""Service Length UoM"");
						}
						if(strPart == ""SYSFEATUREMRCDISC"") // || strPart == ""ONEUSERFEATUREMRCDISC"")
						{
							SysFetMRCdiscLine = strLineId;
							strProdName = GetFieldValue(""Product"");
						}
						else if(strPart == ""ONEUSERFEATUREMRCDISC"")
						{
							OneUserFetMRCdiscLine = strLineId;
							strProdName = GetFieldValue(""Product"");
						}
						
						bRecExist1 = NextRecord();
					}
				}
				Outputs.SetProperty(""1ContractInstallDt"", ContractInstallDt);
				Outputs.SetProperty(""2ContractAction"", ContractAction);
				Outputs.SetProperty(""3ContractLength"", ContractLength);
				Outputs.SetProperty(""4ContractLengthUoM"", ContractLengthUoM);
				Outputs.SetProperty(""5SysFetMRCdiscLine"", SysFetMRCdiscLine);
				Outputs.SetProperty(""6strProdName"", strProdName);
				Outputs.SetProperty(""7OneUserFetMRCdiscLine"", OneUserFetMRCdiscLine);
				
				with(bcLineXA)
				{
					ActivateField(""Value"");
					SetViewMode(AllView);    
					ClearToQuery(); 
					if(SysFetMRCdiscLine != """")
						SetSearchSpec(""Object Id"", SysFetMRCdiscLine);
					else
						SetSearchSpec(""Object Id"", OneUserFetMRCdiscLine);
					
					SetSearchSpec(""Name"", ""Discount Cycle"");
					ExecuteQuery(ForwardOnly);
					if(FirstRecord())
					{
						DiscCycle = GetFieldValue(""Value"");
					}
				}
				Outputs.SetProperty(""8DiscCycle"", DiscCycle);
				if(ContractInstallDt != """")
				{
					var lineStartDt = new Date(ContractInstallDt);
					var lineEndDtMS = lineStartDt.setMonth(ContractLength);
					var lineEndDate = new Date(lineEndDtMS);
					
					var atrStartDt = new Date(ContractInstallDt);
					var atrEndDtMS = atrStartDt.setMonth(DiscCycle);
					var atrEndDate = new Date(atrEndDtMS);
					Outputs.SetProperty(""9lineStartDt"", lineStartDt);
					Outputs.SetProperty(""91lineEndDtMS"", lineEndDtMS);
					Outputs.SetProperty(""92lineEndDate"", lineEndDate);
					Outputs.SetProperty(""93atrStartDt"", atrStartDt);
					Outputs.SetProperty(""94atrEndDtMS"", atrEndDtMS);
					Outputs.SetProperty(""95atrEndDate"", atrEndDate);
					if(atrEndDtMS > lineEndDtMS)
					{
						Outputs.SetProperty(""ErrorMessage"", ""The '""+strProdName+""' cannot exceed the remaining contract duration"");
						Outputs.SetProperty(""ErrorCode"", ""1"");
					}
					else
						Outputs.SetProperty(""ErrorMessage"", ""SUCCESS"");
				}
			}
		}
	}
  }
  catch(e)
  {
  	Outputs.SetProperty(""ErrorMessage"", e.toString());
  }
  finally
  {
  }
}
function GetRemainingContract(Inputs, Outputs)
{
  try
  {
	var OrderId = Inputs.GetProperty(""Order Id"");
	var strServiceId = Inputs.GetProperty(""ServiceId"");
	var strUsrFetMRCdiscCycle = Inputs.GetProperty(""User Feature MRC disc Cycle"");
	
	if(strServiceId != """")
	{
		var boSrvAcnt = TheApplication().GetBusObject(""STC Service Account"");
		var bcSrvAcnt = boSrvAcnt.GetBusComp(""CUT Service Sub Accounts"");
		var bcAsset = boSrvAcnt.GetBusComp(""Asset Mgmt - Asset""); 	//Asset Mgmt - Asset (Order Mgmt)"");
		var bcAssetXA =boSrvAcnt.GetBusComp(""Asset Mgmt - Asset XA"");

		with(bcSrvAcnt)
		{
			ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Id"", strServiceId);
			ExecuteQuery(ForwardOnly);
			if (FirstRecord())
			{   
				var SrvcAccntProfile = GetFieldValue(""STC Profile Type"");
				with(bcAsset)
				{
					ActivateField(""Install Date"");
					ActivateField(""Service Length"");
					ActivateField(""Service Length UoM"");
					ActivateField(""STC Service Length"");
					ActivateField(""STC Service Length UoM"");
					ClearToQuery();
					SetViewMode(AllView);   
					var strExpr = "" [Service Account Id] = '""+ strServiceId +""'""  + "" AND [STC Plan Type] = 'MainContract' AND [Status] = 'Active'""; 
					SetSearchExpr(strExpr);
					ExecuteQuery(ForwardOnly);
					if(FirstRecord())   
					{
						var SrvcInstalDt="""", ContractSrvcLen="""", ContractSrvcLenUOM="""", ContractEndDate="""", ContractEndDateMS="""",ContractEndDt="""",ContractEndMMDDYYYY="""";
						SrvcInstalDt = GetFieldValue(""Install Date"");
						ContractSrvcLen = GetFieldValue(""Service Length"");
						ContractSrvcLenUOM = GetFieldValue(""Service Length UoM"");
						Outputs.SetProperty(""Id"", GetFieldValue(""Id"") );

						var dtSrvcInstall = new Date(SrvcInstalDt);
						var dtToday = new Date();
						if(ContractSrvcLenUOM == ""Months"")
							ContractEndDateMS = dtSrvcInstall.setMonth(ContractSrvcLen);
						
						ContractEndDt = new Date(ContractEndDateMS);
						
						var month = ContractEndDt.getMonth()+1;
						var date = ContractEndDt.getDate();
						ContractEndMMDDYYYY = ((ToString(month).length == 1) ? (""0""+month) : month )
											+ ""/"" + ((ToString(date).length == 1) ? (""0""+date) : date)
											+ ""/"" + ContractEndDt.getFullYear();
						
						Outputs.SetProperty(""SrvcInstalDt"", SrvcInstalDt);
						Outputs.SetProperty(""ContractSrvcLen"", ContractSrvcLen);
						Outputs.SetProperty(""ContractSrvcLenUOM"", ContractSrvcLenUOM);
						Outputs.SetProperty(""ContractEndDateMS"", ContractEndDateMS);
						Outputs.SetProperty(""ContractEndDt"", ContractEndDt);
						Outputs.SetProperty(""ContractEndMMDDYYYY "", ContractEndMMDDYYYY );
						
						if(strUsrFetMRCdiscCycle != """")
						{
							var xDate = new Date();
							var xDateSetCycleMS = xDate.setMonth(strUsrFetMRCdiscCycle);
							var xDateSetCycleDate = new Date(xDateSetCycleMS);
							Outputs.SetProperty(""xDateSetCycleMS "", xDateSetCycleMS );
							Outputs.SetProperty(""xDateSetCycleDate "", xDateSetCycleDate );
							if(xDateSetCycleMS > ContractEndDateMS)
							{
								Outputs.SetProperty(""ErrorMessage"", ""The 'User Feature Addon MRC Discount' cannot exceed the remaining contract duration"");
								Outputs.SetProperty(""ErrorCode"", ""1"");
							}
							else
								Outputs.SetProperty(""ErrorMessage"", ""SUCCESS"");
							}	
							
					}
				}
			}
		}//with(bcSrvAcnt)
	}
	else if(OrderId != """")
	{
		var boOrder = TheApplication().GetBusObject(""Order Entry (Sales)"");
        var bcOrder = boOrder.GetBusComp(""Order Entry - Orders"");
        var bcLineItms = boOrder.GetBusComp(""Order Entry - Line Items"");
        var bcLineXA = boOrder.GetBusComp(""Order Item XA"");
       
		var strStartDt,strOrderType, strExpr, bRecExist1;
		var strLineId="""",strPlanType="""",strPart="""",strAction="""",ContractInstallDt="""",ContractAction="""",ContractLength="""",ContractLengthUoM="""";
		var SysFetMRCdiscLine="""",OneUserFetMRCdiscLine="""", DiscCycle="""", strProdName="""";
		with (bcOrder)
		{
			ActivateField(""Order Date"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Id"", OrderId);
			ExecuteQuery(ForwardOnly);
			if (FirstRecord())
			{
				strStartDt = GetFieldValue(""Order Date"");
				strOrderType = GetFieldValue(""STC Order SubType"");
				with(bcLineItms)
				{
					ActivateField(""Order Header Id"");
					ActivateField(""Parent Order Item Id"");
					ActivateField(""Part Number"");
					ActivateField(""Status"");
					ActivateField(""Product Type"");
					ActivateField(""Part Number"");

					SetViewMode(AllView);
					ClearToQuery();
					if(strOrderType == ""Provide"")
						strExpr = ""[Order Header Id] = '""+OrderId+""' AND ([STC Plan Type] = 'MainContract' OR [Part Number] = 'SYSFEATUREMRCDISC' OR [Part Number] = 'ONEUSERFEATUREMRCDISC') AND [Action Code] = 'Add'"";
					if(strOrderType == ""Modify"")
						strExpr = ""[Order Header Id] = '""+OrderId+""' AND ((([Part Number] = 'SYSFEATUREMRCDISC' OR [Part Number] = 'ONEUSERFEATUREMRCDISC') AND [Action Code] = 'Add') OR ([STC Plan Type] = 'MainContract' AND ([Action Code] = '-' OR [Action Code] = 'Add')))"";
					Outputs.SetProperty(""99strExpr"", strExpr);
					SetSearchExpr(strExpr);
					ExecuteQuery(ForwardOnly);
					bRecExist1 = FirstRecord();
					while(bRecExist1)
					{
						strLineId = GetFieldValue(""Id"");
						strPlanType = GetFieldValue(""STC Plan Type"");
						strPart = GetFieldValue(""Part Number"");
						strAction = GetFieldValue(""Action Code"");
						if(strPlanType == ""MainContract"") // && (strAction == ""Add"" || strAction == ""-""))
						{
							if(strAction == ""Add"")
								ContractInstallDt = strStartDt;
							else
								ContractInstallDt = GetFieldValue(""STC Install Date"");
							
							ContractAction = strAction;
							ContractLength = GetFieldValue(""Service Length"");
							ContractLengthUoM=GetFieldValue(""Service Length UoM"");
						}
						if(strPart == ""SYSFEATUREMRCDISC"") // || strPart == ""ONEUSERFEATUREMRCDISC"")
						{
							SysFetMRCdiscLine = strLineId;
							strProdName = GetFieldValue(""Product"");
						}
						else if(strPart == ""ONEUSERFEATUREMRCDISC"")
						{
							OneUserFetMRCdiscLine = strLineId;
							strProdName = GetFieldValue(""Product"");
						}
						
						bRecExist1 = NextRecord();
					}
				}
				Outputs.SetProperty(""1ContractInstallDt"", ContractInstallDt);
				Outputs.SetProperty(""2ContractAction"", ContractAction);
				Outputs.SetProperty(""3ContractLength"", ContractLength);
				Outputs.SetProperty(""4ContractLengthUoM"", ContractLengthUoM);
				Outputs.SetProperty(""5SysFetMRCdiscLine"", SysFetMRCdiscLine);
				Outputs.SetProperty(""6strProdName"", strProdName);
				Outputs.SetProperty(""7OneUserFetMRCdiscLine"", OneUserFetMRCdiscLine);
				
				with(bcLineXA)
				{
					ActivateField(""Value"");
					SetViewMode(AllView);    
					ClearToQuery(); 
					if(SysFetMRCdiscLine != """")
						SetSearchSpec(""Object Id"", SysFetMRCdiscLine);
					else
						SetSearchSpec(""Object Id"", OneUserFetMRCdiscLine);
					
					SetSearchSpec(""Name"", ""Discount Cycle"");
					ExecuteQuery(ForwardOnly);
					if(FirstRecord())
					{
						DiscCycle = GetFieldValue(""Value"");
					}
				}
				Outputs.SetProperty(""8DiscCycle"", DiscCycle);
				if(ContractInstallDt != """")
				{
					var lineStartDt = new Date(ContractInstallDt);
					var lineEndDtMS = lineStartDt.setMonth(ContractLength);
					var lineEndDate = new Date(lineEndDtMS);
					
					var atrStartDt = new Date(ContractInstallDt);
					var atrEndDtMS = atrStartDt.setMonth(DiscCycle);
					var atrEndDate = new Date(atrEndDtMS);
					Outputs.SetProperty(""9lineStartDt"", lineStartDt);
					Outputs.SetProperty(""91lineEndDtMS"", lineEndDtMS);
					Outputs.SetProperty(""92lineEndDate"", lineEndDate);
					Outputs.SetProperty(""93atrStartDt"", atrStartDt);
					Outputs.SetProperty(""94atrEndDtMS"", atrEndDtMS);
					Outputs.SetProperty(""95atrEndDate"", atrEndDate);
					if(atrEndDtMS > lineEndDtMS)
					{
						Outputs.SetProperty(""ErrorMessage"", ""The '""+strProdName+""' cannot exceed the remaining contract duration"");
						Outputs.SetProperty(""ErrorCode"", ""1"");
					}
					else
						Outputs.SetProperty(""ErrorMessage"", ""SUCCESS"");
				}
			}
		}
	}
  }
  catch(e)
  {
  	Outputs.SetProperty(""ErrorMessage"", e.toString());
  }
  finally
  {
  }
}
function GetStcOneContract(Inputs, Outputs)
{
  try
  {
	var OrderId = Inputs.GetProperty(""OrderId"");
	var strServiceId = Inputs.GetProperty(""ServiceId"");
	var strUsrFeatMRCdiscCycle = Inputs.GetProperty(""User Feature MRC disc Cycle"");
	var strContractEndDtMS = Inputs.GetProperty(""ContractEndDateMS"");
	var ContractTerm  = Inputs.GetProperty(""ContractTerm"");
	
	if(strServiceId != """")
	{
		var boSrvAcnt = TheApplication().GetBusObject(""STC Service Account"");
		var bcSrvAcnt = boSrvAcnt.GetBusComp(""CUT Service Sub Accounts"");
		var bcAsset = boSrvAcnt.GetBusComp(""Asset Mgmt - Asset""); 	//Asset Mgmt - Asset (Order Mgmt)"");
		var bcAssetXA =boSrvAcnt.GetBusComp(""Asset Mgmt - Asset XA"");

		with(bcSrvAcnt)
		{
			ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Id"", strServiceId);
			ExecuteQuery(ForwardOnly);
			if (FirstRecord())
			{   
				var SrvcAccntProfile = GetFieldValue(""STC Profile Type"");
				with(bcAsset)
				{
					ActivateField(""Install Date"");
					ActivateField(""Service Length"");
					ActivateField(""Service Length UoM"");
					ActivateField(""STC Service Length"");
					ActivateField(""STC Service Length UoM"");
					ClearToQuery();
					SetViewMode(AllView);   
					var strExpr = "" [Service Account Id] = '""+ strServiceId +""'""  + "" AND [STC Plan Type] = 'MainContract' AND [Status] = 'Active'""; 
					SetSearchExpr(strExpr);
					ExecuteQuery(ForwardOnly);
					if(FirstRecord())   
					{
						var SrvcInstalDt="""", ContractSrvcLen="""", ContractSrvcLenUOM="""", ContractEndDate="""", ContractEndDateMS="""",ContractEndDt="""",ContractEndMMDDYYYY="""";
						SrvcInstalDt = GetFieldValue(""Install Date"");
						ContractSrvcLen = GetFieldValue(""Service Length"");
						ContractSrvcLenUOM = GetFieldValue(""Service Length UoM"");
						Outputs.SetProperty(""Id"", GetFieldValue(""Id"") );

						var dtSrvcInstall = new Date(SrvcInstalDt);
						var dtSrvcInstallMDYYYY = (ToNumber(dtSrvcInstall.getMonth())+1) + ""/"" + dtSrvcInstall.getDate() + ""/"" + dtSrvcInstall.getFullYear() + "" 00:00:00"";
						/*var dtToday = new Date();
						if(ContractSrvcLenUOM == ""Months"")
							ContractEndDateMS = dtSrvcInstall.setMonth(ContractSrvcLen);
						
						ContractEndDt = new Date(ContractEndDateMS);
						*/
						Outputs.SetProperty(""0SrvcInstalDt"", SrvcInstalDt);
						Outputs.SetProperty(""1dtSrvcInstallMDYYYY"", dtSrvcInstallMDYYYY);
						Outputs.SetProperty(""2ContractSrvcLen"", ContractSrvcLen);
						Outputs.SetProperty(""3ContractSrvcLenUOM"", ContractSrvcLenUOM);
						
						ContractEndMMDDYYYY = fnUpdateContract(Inputs,Outputs,dtSrvcInstallMDYYYY, ToNumber(ContractSrvcLen)) ;
						Outputs.SetProperty(""ContractEndMMDDYYYY "", ContractEndMMDDYYYY );
						ContractEndDt = new Date(ContractEndMMDDYYYY);
						Outputs.SetProperty(""5ContractEndDt"", ContractEndDt);
						ContractEndDateMS = ContractEndDt.getTime();
						Outputs.SetProperty(""ContractEndDateMS"", ContractEndDateMS);
						
					}
				}
			}
		}//with(bcSrvAcnt)
	}
	else if(OrderId != """")
	{
		var boOrder = TheApplication().GetBusObject(""Order Entry (Sales)"");
        var bcOrder = boOrder.GetBusComp(""Order Entry - Orders"");
        var bcLineItms = boOrder.GetBusComp(""Order Entry - Line Items"");
        var bcLineXA = boOrder.GetBusComp(""Order Item XA"");
       
		var strStartDt,strOrderType, strExpr, bRecExist1;
		var strLineId="""",strPlanType="""",strPart="""",strAction="""",ContractInstallDt="""",ContractAction="""",ContractLength="""",ContractLengthUoM="""";
		var SysFetMRCdiscLine="""",OneUserFetMRCdiscLine="""", PilotMRCdisc="""", DiscCycle="""", strProdName="""", XAId="""",strIntegId="""", strErrorFlag = ""No"";
		var lineStartDt, lineStartDtMDYYYY , lineEndDate, lineEndDateObj, lineEndDtMS;
		var atrStartDt, atrStartDtMDYYYY , atrEndDate, atrEndDateObj, atrEndDtMS, out1="""", out2="""", AssetId="""", xServiceId = """";
		with (bcOrder)
		{
			ActivateField(""Order Date"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Id"", OrderId);
			ExecuteQuery(ForwardOnly);
			if (FirstRecord())
			{
				strStartDt = GetFieldValue(""Order Date"");
				strOrderType = GetFieldValue(""STC Order SubType"");
				xServiceId = GetFieldValue(""Service Account Id"");

				with(bcLineItms)
				{
					ActivateField(""Order Header Id"");
					ActivateField(""Parent Order Item Id"");
					ActivateField(""Part Number"");
					ActivateField(""Status"");
					ActivateField(""Product Type"");
					ActivateField(""Part Number"");

					SetViewMode(AllView);
					ClearToQuery();
					if(strOrderType == ""Provide"")
						strExpr = ""[Order Header Id] = '""+OrderId+""' AND ([STC Plan Type] = 'MainContract' OR [Part Number] = 'SYSFEATUREMRCDISC' OR [Part Number] = 'ONEUSERFEATUREMRCDISC' OR [Part Number]='PILOTMRCDISC') AND [Action Code] = 'Add'"";
					if(strOrderType == ""Modify"")
						strExpr = ""[Order Header Id] = '""+OrderId+""' AND ((([Part Number] = 'SYSFEATUREMRCDISC' OR [Part Number] = 'ONEUSERFEATUREMRCDISC' OR [Part Number]='PILOTMRCDISC') AND [Action Code] = 'Add') OR ([STC Plan Type] = 'MainContract' AND ([Action Code] <> 'Delete')))"";
					Outputs.SetProperty(""99strExpr"", strExpr);
					SetSearchExpr(strExpr);
					ExecuteQuery(ForwardOnly);
					bRecExist1 = FirstRecord();
					while(bRecExist1 && strErrorFlag == ""No"")
					{
						strLineId = GetFieldValue(""Id"");
						strPlanType = GetFieldValue(""STC Plan Type"");
						strPart = GetFieldValue(""Part Number"");
						strAction = GetFieldValue(""Action Code"");
						strIntegId = GetFieldValue(""Asset Integration Id"");
						
						if(strPlanType == ""MainContract"") // && (strAction == ""Add"" || strAction == ""-""))
						{
							ContractAction = strAction;
							if(strAction == ""Add"")
								ContractInstallDt = strStartDt;
							else
								ContractInstallDt = GetFieldValue(""STC Install Date"");
							
							if(ContractInstallDt == """" && ContractAction == ""Update"" && xServiceId != """")
							{
								var boAsset = TheApplication().GetBusObject(""Asset Management"");
								var bcAssetH = boAsset.GetBusComp(""Asset Mgmt - Asset - Header"");
								with(bcAssetH)
								{
									ActivateField(""Install Date"");
									ClearToQuery();
									SetViewMode(AllView);   
									var strExpr = "" [Service Account Id] = '""+ xServiceId +""' AND [Integration Id] ='"" + strIntegId +""' AND [STC Plan Type] = 'MainContract' AND [Status] = 'Active'""; 
									SetSearchExpr(strExpr);
									ExecuteQuery(ForwardOnly);
									if(FirstRecord())   
									{
										AssetId = AssetId+ GetFieldValue(""Id"") +"" | "";
										ContractInstallDt = GetFieldValue(""Install Date"");
									}
								}
							}
							ContractLength = GetFieldValue(""Service Length"");
							ContractLengthUoM=GetFieldValue(""Service Length UoM"");
						}
						if(strPart == ""SYSFEATUREMRCDISC"") // || strPart == ""ONEUSERFEATUREMRCDISC"")
						{
							SysFetMRCdiscLine = strLineId;
							strProdName = GetFieldValue(""Product"");
						}
						else if(strPart == ""ONEUSERFEATUREMRCDISC"")
						{
							OneUserFetMRCdiscLine = strLineId;
							strProdName = GetFieldValue(""Product"");
						}
						else if(strPart == ""PILOTMRCDISC"")
						{
							PilotMRCdisc = strLineId;
							strProdName = GetFieldValue(""Product"");
						}
						out1 = out1+strLineId+""|""+PilotMRCdisc+"" ; "";
						////-------------
						
						if(strPlanType != ""MainContract"")
						{
							with(bcLineXA)
							{
								ActivateField(""Value"");
								ActivateField(""Object Id"");
								SetViewMode(AllView);    
								ClearToQuery(); 
								SetSearchSpec(""Object Id"", strLineId);
								SetSearchSpec(""Name"", ""Discount Cycle"");
								ExecuteQuery(ForwardOnly);
								if(FirstRecord())
								{
									XAId = XAId+""LineItemId=""+GetFieldValue(""Object Id"")+""|XAID=""+GetFieldValue(""Id"")+""|discCycl=""+GetFieldValue(""Value"")+"" ; "";
									DiscCycle = GetFieldValue(""Value"");
								}
							}
							
							DiscCycle = (DiscCycle == """") ? 0:DiscCycle;
							Outputs.SetProperty(""80DiscCycle"", DiscCycle);
							
							if(strOrderType == ""Provide"")
							{
								lineEndDtMS = ContractLength;
								atrEndDtMS = DiscCycle;
							}
							else if(ContractInstallDt != """")
							{
								lineStartDt = new Date(ContractInstallDt);
								lineStartDtMDYYYY = (ToNumber(lineStartDt.getMonth())+1) + ""/"" + lineStartDt.getDate() + ""/"" + lineStartDt.getFullYear() + "" 00:00:00"";
								lineEndDate = fnUpdateContract(Inputs,Outputs,lineStartDtMDYYYY, ToNumber(ContractLength)) ;
								lineEndDateObj = new Date(lineEndDate);
								lineEndDtMS = lineEndDateObj.getTime();

								atrStartDt = new Date();
								atrStartDtMDYYYY = (ToNumber(atrStartDt.getMonth())+1) + ""/"" + atrStartDt.getDate() + ""/"" + atrStartDt.getFullYear() + "" 00:00:00"";
								atrEndDate = fnUpdateContract(Inputs,Outputs,atrStartDtMDYYYY, ToNumber(DiscCycle)) ;
								atrEndDateObj = new Date(atrEndDate);
								atrEndDtMS = atrEndDateObj.getTime();	
							}
							Outputs.SetProperty(""90lineStartDt"", lineStartDt);
							Outputs.SetProperty(""91lineEndDtMS"", lineEndDtMS);
							Outputs.SetProperty(""92lineEndDate"", lineEndDate);
							Outputs.SetProperty(""93atrStartDt"", atrStartDt);
							Outputs.SetProperty(""94atrEndDtMS"", atrEndDtMS);
							Outputs.SetProperty(""95atrEndDate"", atrEndDate);
							out2 = out2+atrEndDtMS +"" > ""+lineEndDtMS +"" | "";
							Outputs.SetProperty(""Compare err"", out2);
							if(ToNumber(atrEndDtMS) > ToNumber(lineEndDtMS))
							{
								Outputs.SetProperty(""ErrorMessage"", ""The '""+strProdName+""' cannot exceed the remaining contract duration"");
								Outputs.SetProperty(""ErrorCode"", ""1-ORDERID"");
								Outputs.SetProperty(""ErrorFlag"", ""Y"");
								strErrorFlag = ""Y"";
							}
							else
								Outputs.SetProperty(""ErrorMessage"", ""SUCCESS"");
						}
						///----------------
						bRecExist1 = NextRecord();
					}
				}
				Outputs.SetProperty(""1ContractInstallDt"", ContractInstallDt);
				Outputs.SetProperty(""2ContractAction"", ContractAction);
				Outputs.SetProperty(""3ContractLength"", ContractLength);
				Outputs.SetProperty(""4ContractLengthUoM"", ContractLengthUoM);
				Outputs.SetProperty(""5SysFetMRCdiscLine"", SysFetMRCdiscLine);
				Outputs.SetProperty(""6strProdName"", strProdName);
				Outputs.SetProperty(""7OneUserFetMRCdiscLine"", out1);
				Outputs.SetProperty(""8DiscCycle-XA"", XAId);
				Outputs.SetProperty(""ContractAssetId"", AssetId);
			}
		}
	}
	else if(strUsrFeatMRCdiscCycle != """") //&& (strContractEndDtMS != """" || ContractTerm != """"))
	{
		var xDate="""", xDateSetCycleMS="""",xDateSetCycleDate="""", DateMMDDYYYY, DateCalcDATE; //if3 var
		if(strContractEndDtMS != """")
		{
			xDate = new Date();
			DateMMDDYYYY = (ToNumber(xDate.getMonth())+1) + ""/"" + xDate.getDate() + ""/"" + xDate.getFullYear() + "" 00:00:00"";
			xDateSetCycleDate = fnUpdateContract(Inputs,Outputs,DateMMDDYYYY, ToNumber(strUsrFeatMRCdiscCycle)) ;
			DateCalcDATE = new Date(xDateSetCycleDate);
			xDateSetCycleMS = DateCalcDATE.getTime();
			Outputs.SetProperty(""1 xDate"", ""xDate=""+xDate+""; DateMMDDYYYY=""+DateMMDDYYYY +""; strUsrFeatMRCdiscCycle=""+strUsrFeatMRCdiscCycle );
			Outputs.SetProperty(""2 xDateSetCycleDate="", xDateSetCycleDate);
			Outputs.SetProperty(""3 DateCalcDATE"", ""DateCalcDATE=""+DateCalcDATE+""; xDateSetCycleMS= ""+xDateSetCycleMS );
			Outputs.SetProperty(""4 strContractEndDATE "", ""strContractEndDATE= ""+ new Date(ToNumber(strContractEndDtMS))+""; strContractEndDtMS =""+strContractEndDtMS );
		}
		else if(ContractTerm != """")
		{	
			strContractEndDtMS = ContractTerm;
			xDateSetCycleMS = strUsrFeatMRCdiscCycle;
		}
		Outputs.SetProperty(""Compare err"", xDateSetCycleMS +"" > ""+strContractEndDtMS);
		if(ToNumber(xDateSetCycleMS) > ToNumber(strContractEndDtMS))
		{
			Outputs.SetProperty(""ErrorMessage"", ""The 'User Feature Addon MRC Discount' cannot exceed the remaining contract duration"");
			Outputs.SetProperty(""ErrorCode"", ""1-COMPARE"");
			Outputs.SetProperty(""ErrorFlag"", ""Y"");
		}
		else
			Outputs.SetProperty(""ErrorMessage"", ""SUCCESS"");
	} //if3
  }
  catch(e)
  {
  	Outputs.SetProperty(""ErrorMessage"", e.toString());
	Outputs.SetProperty(""ErrorCode"", ""1-CATCH"");
	Outputs.SetProperty(""ErrorFlag"", ""Y"");
  }
  finally
  {

  }
}
function GetStcOneContract(Inputs, Outputs)
{
  try
  {
	var OrderId = Inputs.GetProperty(""OrderId"");
	var strServiceId = Inputs.GetProperty(""ServiceId"");
	var strUsrFeatMRCdiscCycle = Inputs.GetProperty(""User Feature MRC disc Cycle"");
	var strContractEndDtMS = Inputs.GetProperty(""ContractEndDateMS"");
	var ContractTerm  = Inputs.GetProperty(""ContractTerm"");
	
	if(strServiceId != """")
	{
		var boSrvAcnt = TheApplication().GetBusObject(""STC Service Account"");
		var bcSrvAcnt = boSrvAcnt.GetBusComp(""CUT Service Sub Accounts"");
		var bcAsset = boSrvAcnt.GetBusComp(""Asset Mgmt - Asset""); 	//Asset Mgmt - Asset (Order Mgmt)"");
		var bcAssetXA =boSrvAcnt.GetBusComp(""Asset Mgmt - Asset XA"");

		with(bcSrvAcnt)
		{
			ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Id"", strServiceId);
			ExecuteQuery(ForwardOnly);
			if (FirstRecord())
			{   
				var SrvcAccntProfile = GetFieldValue(""STC Profile Type"");
				with(bcAsset)
				{
					ActivateField(""Install Date"");
					ActivateField(""Service Length"");
					ActivateField(""Service Length UoM"");
					ActivateField(""STC Service Length"");
					ActivateField(""STC Service length UOM"");
					ClearToQuery();
					SetViewMode(AllView);   
					var strExpr = "" [Service Account Id] = '""+ strServiceId +""'""  + "" AND [STC Plan Type] = 'MainContract' AND [Status] = 'Active'""; 
					SetSearchExpr(strExpr);
					ExecuteQuery(ForwardOnly);
					if(FirstRecord())   
					{
						var SrvcInstalDt="""", ContractSrvcLen="""", ContractSrvcLenUOM="""", ContractEndDate="""", ContractEndDateMS="""",ContractEndDt="""",ContractEndMMDDYYYY="""";
						SrvcInstalDt = GetFieldValue(""Install Date"");
						ContractSrvcLen = GetFieldValue(""STC Service Length"");
						ContractSrvcLenUOM = GetFieldValue(""STC Service length UOM"");
						Outputs.SetProperty(""Id"", GetFieldValue(""Id"") );

						var dtSrvcInstall = new Date(SrvcInstalDt);
						var dtSrvcInstallMDYYYY = (ToNumber(dtSrvcInstall.getMonth())+1) + ""/"" + dtSrvcInstall.getDate() + ""/"" + dtSrvcInstall.getFullYear() + "" 00:00:00"";
						/*var dtToday = new Date();
						if(ContractSrvcLenUOM == ""Months"")
							ContractEndDateMS = dtSrvcInstall.setMonth(ContractSrvcLen);
						
						ContractEndDt = new Date(ContractEndDateMS);
						*/
						Outputs.SetProperty(""0SrvcInstalDt"", SrvcInstalDt);
						Outputs.SetProperty(""1dtSrvcInstallMDYYYY"", dtSrvcInstallMDYYYY);
						Outputs.SetProperty(""2ContractSrvcLen"", ContractSrvcLen);
						Outputs.SetProperty(""3ContractSrvcLenUOM"", ContractSrvcLenUOM);
						
						ContractEndMMDDYYYY = fnUpdateContract(Inputs,Outputs,dtSrvcInstallMDYYYY, ToNumber(ContractSrvcLen)) ;
						Outputs.SetProperty(""ContractEndMMDDYYYY "", ContractEndMMDDYYYY );
						ContractEndDt = new Date(ContractEndMMDDYYYY);
						Outputs.SetProperty(""5ContractEndDt"", ContractEndDt);
						ContractEndDateMS = ContractEndDt.getTime();
						Outputs.SetProperty(""ContractEndDateMS"", ContractEndDateMS);
						
					}
				}
			}
		}//with(bcSrvAcnt)
	}
	else if(OrderId != """")
	{
		var boOrder = TheApplication().GetBusObject(""Order Entry (Sales)"");
        var bcOrder = boOrder.GetBusComp(""Order Entry - Orders"");
        var bcLineItms = boOrder.GetBusComp(""Order Entry - Line Items"");
        var bcLineXA = boOrder.GetBusComp(""Order Item XA"");
       
		var strStartDt,strOrderType, strExpr, bRecExist1;
		var strLineId="""",strPlanType="""",strPart="""",strAction="""",ContractInstallDt="""",ContractAction="""",ContractLength="""",ContractLengthUoM="""";
		var SysFetMRCdiscLine="""",OneUserFetMRCdiscLine="""", PilotMRCdisc="""", DiscCycle="""", strProdName="""", XAId="""",strIntegId="""", strErrorFlag = ""No"";
		var lineStartDt, lineStartDtMDYYYY , lineEndDate, lineEndDateObj, lineEndDtMS;
		var atrStartDt, atrStartDtMDYYYY , atrEndDate, atrEndDateObj, atrEndDtMS, out1="""", out2="""", AssetId="""", xServiceId = """";
		with (bcOrder)
		{
			ActivateField(""Order Date"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Id"", OrderId);
			ExecuteQuery(ForwardOnly);
			if (FirstRecord())
			{
				strStartDt = GetFieldValue(""Order Date"");
				strOrderType = GetFieldValue(""STC Order SubType"");
				xServiceId = GetFieldValue(""Service Account Id"");

				with(bcLineItms)
				{
					ActivateField(""Order Header Id"");
					ActivateField(""Parent Order Item Id"");
					ActivateField(""Part Number"");
					ActivateField(""Status"");
					ActivateField(""Product Type"");
					ActivateField(""Part Number"");

					SetViewMode(AllView);
					ClearToQuery();
					if(strOrderType == ""Provide"")
						strExpr = ""[Order Header Id] = '""+OrderId+""' AND ([STC Plan Type] = 'MainContract' OR [Part Number] = 'SYSFEATUREMRCDISC' OR [Part Number] = 'ONEUSERFEATUREMRCDISC' OR [Part Number]='PILOTMRCDISC') AND [Action Code] = 'Add'"";
					if(strOrderType == ""Modify"")
						strExpr = ""[Order Header Id] = '""+OrderId+""' AND ((([Part Number] = 'SYSFEATUREMRCDISC' OR [Part Number] = 'ONEUSERFEATUREMRCDISC' OR [Part Number]='PILOTMRCDISC') AND [Action Code] = 'Add') OR ([STC Plan Type] = 'MainContract' AND ([Action Code] <> 'Delete')))"";
					Outputs.SetProperty(""99strExpr"", strExpr);
					SetSearchExpr(strExpr);
					ExecuteQuery(ForwardOnly);
					bRecExist1 = FirstRecord();
					Outputs.SetProperty(""Rec-Count"",  CountRecords());
					var aaaLine = """";
					while(bRecExist1)// && strErrorFlag == ""No"")
					{
						strLineId = GetFieldValue(""Id"");
						aaaLine = aaaLine+"" @@ ""+strLineId;
						strPlanType = GetFieldValue(""STC Plan Type"");
						strPart = GetFieldValue(""Part Number"");
						strAction = GetFieldValue(""Action Code"");
						strIntegId = GetFieldValue(""Asset Integration Id"");
						
						if(strPlanType == ""MainContract"") // && (strAction == ""Add"" || strAction == ""-""))
						{
							ContractAction = strAction;
							if(strAction == ""Add"")
								ContractInstallDt = strStartDt;
							else
								ContractInstallDt = GetFieldValue(""STC Install Date"");
							
							if(ContractInstallDt == """" && ContractAction == ""Update"" && xServiceId != """")
							{
								var boAsset = TheApplication().GetBusObject(""Asset Management"");
								var bcAssetH = boAsset.GetBusComp(""Asset Mgmt - Asset - Header"");
								with(bcAssetH)
								{
									ActivateField(""Install Date"");
									ClearToQuery();
									SetViewMode(AllView);   
									var strExpr = "" [Service Account Id] = '""+ xServiceId +""' AND [Integration Id] ='"" + strIntegId +""' AND [STC Plan Type] = 'MainContract' AND [Status] = 'Active'""; 
									SetSearchExpr(strExpr);
									ExecuteQuery(ForwardOnly);
									if(FirstRecord())   
									{
										AssetId = AssetId+ GetFieldValue(""Id"") +"" | "";
										ContractInstallDt = GetFieldValue(""Install Date"");
									}
								}
							}
							ContractLength = GetFieldValue(""STC Prod Service Length"");
							ContractLengthUoM=GetFieldValue(""STC Prod Service Length UOM"");
							Outputs.SetProperty(""ContractLength"", ContractLength+"" | ""+ContractLengthUoM+ "" | line: "" +strLineId);
						}
						if(strPart == ""SYSFEATUREMRCDISC"") // || strPart == ""ONEUSERFEATUREMRCDISC"")
						{
							SysFetMRCdiscLine = strLineId;
							strProdName = GetFieldValue(""Product"");
						}
						else if(strPart == ""ONEUSERFEATUREMRCDISC"")
						{
							OneUserFetMRCdiscLine = strLineId;
							strProdName = GetFieldValue(""Product"");
						}
						else if(strPart == ""PILOTMRCDISC"")
						{
							PilotMRCdisc = strLineId;
							strProdName = GetFieldValue(""Product"");
						}
						out1 = out1+strLineId+""|""+PilotMRCdisc+"" ; "";
						////-------------
						
						if(strPlanType != ""MainContract"")
						{
							with(bcLineXA)
							{
								ActivateField(""Value"");
								ActivateField(""Object Id"");
								SetViewMode(AllView);    
								ClearToQuery(); 
								SetSearchSpec(""Object Id"", strLineId);
								SetSearchSpec(""Name"", ""Discount Cycle"");
								ExecuteQuery(ForwardOnly);
								if(FirstRecord())
								{
									XAId = XAId+""LineItemId=""+GetFieldValue(""Object Id"")+""|XAID=""+GetFieldValue(""Id"")+""|discCycl=""+GetFieldValue(""Value"")+"" ; "";
									DiscCycle = GetFieldValue(""Value"");
								}
							}
						}
						///----------------
						bRecExist1 = NextRecord();
					}
					//added defensive IF condition :Indrasen:Fy21_R16
					if(PilotMRCdisc !="""" || OneUserFetMRCdiscLine != """" || SysFetMRCdiscLine != """") 
					{	
						DiscCycle = (DiscCycle == """") ? 0:DiscCycle;
						Outputs.SetProperty(""80DiscCycle"", DiscCycle);
						ContractLength = (ContractLength == """") ? 0:ContractLength;
						if(strOrderType == ""Provide"")
						{
							lineEndDtMS = ContractLength;
							atrEndDtMS = DiscCycle;
						}
						else if(ContractInstallDt != """")
						{
							lineStartDt = new Date(ContractInstallDt);
							lineStartDtMDYYYY = (ToNumber(lineStartDt.getMonth())+1) + ""/"" + lineStartDt.getDate() + ""/"" + lineStartDt.getFullYear() + "" 00:00:00"";
							lineEndDate = fnUpdateContract(Inputs,Outputs,lineStartDtMDYYYY, ToNumber(ContractLength)) ;
							lineEndDateObj = new Date(lineEndDate);
							lineEndDtMS = lineEndDateObj.getTime();

							atrStartDt = new Date();
							atrStartDtMDYYYY = (ToNumber(atrStartDt.getMonth())+1) + ""/"" + atrStartDt.getDate() + ""/"" + atrStartDt.getFullYear() + "" 00:00:00"";
							atrEndDate = fnUpdateContract(Inputs,Outputs,atrStartDtMDYYYY, ToNumber(DiscCycle)) ;
							atrEndDateObj = new Date(atrEndDate);
							atrEndDtMS = atrEndDateObj.getTime();	
						}
						Outputs.SetProperty(""90lineStartDt"", lineStartDt);
						Outputs.SetProperty(""91lineEndDtMS"", lineEndDtMS);
						Outputs.SetProperty(""92lineEndDate"", lineEndDate);
						Outputs.SetProperty(""93atrStartDt"", atrStartDt);
						Outputs.SetProperty(""94atrEndDtMS"", atrEndDtMS);
						Outputs.SetProperty(""95atrEndDate"", atrEndDate);
						out2 = out2+atrEndDtMS +"" > ""+lineEndDtMS +"" | "";
						Outputs.SetProperty(""Compare err"", out2);
						if(ToNumber(atrEndDtMS) > ToNumber(lineEndDtMS))
						{
							Outputs.SetProperty(""ErrorMessage"", ""The '""+strProdName+""' cannot exceed the remaining contract duration"");
							Outputs.SetProperty(""ErrorCode"", ""1-ORDERID"");
							Outputs.SetProperty(""ErrorFlag"", ""Y"");
							strErrorFlag = ""Y"";
						}
						else
							Outputs.SetProperty(""ErrorMessage"", ""SUCCESS"");
					}						
				}
				Outputs.SetProperty(""1ContractInstallDt"", ContractInstallDt);
				Outputs.SetProperty(""2ContractAction"", ContractAction);
				Outputs.SetProperty(""3ContractLength"", ContractLength);
				Outputs.SetProperty(""4ContractLengthUoM"", ContractLengthUoM);
				Outputs.SetProperty(""5SysFetMRCdiscLine"", SysFetMRCdiscLine);
				Outputs.SetProperty(""6strProdName"", strProdName);
				Outputs.SetProperty(""7OneUserFetMRCdiscLine"", out1);
				Outputs.SetProperty(""8DiscCycle-XA"", XAId);
				Outputs.SetProperty(""ContractAssetId"", AssetId);
			}
		}
	}
	else if(strUsrFeatMRCdiscCycle != """") //&& (strContractEndDtMS != """" || ContractTerm != """"))
	{
		var xDate="""", xDateSetCycleMS="""",xDateSetCycleDate="""", DateMMDDYYYY, DateCalcDATE; //if3 var
		if(strContractEndDtMS != """")
		{
			xDate = new Date();
			DateMMDDYYYY = (ToNumber(xDate.getMonth())+1) + ""/"" + xDate.getDate() + ""/"" + xDate.getFullYear() + "" 00:00:00"";
			xDateSetCycleDate = fnUpdateContract(Inputs,Outputs,DateMMDDYYYY, ToNumber(strUsrFeatMRCdiscCycle)) ;
			DateCalcDATE = new Date(xDateSetCycleDate);
			xDateSetCycleMS = DateCalcDATE.getTime();
			Outputs.SetProperty(""1 xDate"", ""xDate=""+xDate+""; DateMMDDYYYY=""+DateMMDDYYYY +""; strUsrFeatMRCdiscCycle=""+strUsrFeatMRCdiscCycle );
			Outputs.SetProperty(""2 xDateSetCycleDate="", xDateSetCycleDate);
			Outputs.SetProperty(""3 DateCalcDATE"", ""DateCalcDATE=""+DateCalcDATE+""; xDateSetCycleMS= ""+xDateSetCycleMS );
			Outputs.SetProperty(""4 strContractEndDATE "", ""strContractEndDATE= ""+ new Date(ToNumber(strContractEndDtMS))+""; strContractEndDtMS =""+strContractEndDtMS );
		}
		else if(ContractTerm != """")
		{	
			strContractEndDtMS = ContractTerm;
			xDateSetCycleMS = strUsrFeatMRCdiscCycle;
		}
		Outputs.SetProperty(""Compare err"", xDateSetCycleMS +"" > ""+strContractEndDtMS);
		if(ToNumber(xDateSetCycleMS) > ToNumber(strContractEndDtMS))
		{
			Outputs.SetProperty(""ErrorMessage"", ""The 'User Feature Addon MRC Discount' cannot exceed the remaining contract duration"");
			Outputs.SetProperty(""ErrorCode"", ""1-COMPARE"");
			Outputs.SetProperty(""ErrorFlag"", ""Y"");
		}
		else
			Outputs.SetProperty(""ErrorMessage"", ""SUCCESS"");
	} //if3
  }
  catch(e)
  {
  	Outputs.SetProperty(""ErrorMessage"", e.toString());
	Outputs.SetProperty(""ErrorCode"", ""1-CATCH"");
	Outputs.SetProperty(""ErrorFlag"", ""Y"");
  }
  finally
  {

  }
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)  
{ 
/*  
---------------+------+--------+----------------------------------------------  
Date(YYYYMMDD) | Ver  | By     | Description   
---------------+------+--------+----------------------------------------------  
20120712       | 1.0  | Chiranjeevi| business Service to calculate contract end date 
 
---------------+------+--------+----------------------------------------------  
*/  
 
	switch(MethodName)  
	{ 
		case ""CheckContract"": 
			fnStampContract(Inputs, Outputs);  
			return (CancelOperation);  
			break; 
		case ""CalcPenlty"": 
			fnCalcPenalty(Inputs, Outputs);  
			return (CancelOperation);   
			break; 
		case ""ChekPenaltyProd"": 
			fnChekPenaltyProd(Inputs, Outputs);  
			return (CancelOperation);   
			break;
		case ""CalcDatacomPenalty"": 
			fn_CalcDatacomPenalty(Inputs, Outputs);  
			return (CancelOperation);   
			break;
		case ""CheckDatacomPenaltyProd"":
			fn_CheckDatacomPenaltyProd(Inputs, Outputs);
			return (CancelOperation);   
			break;
		case ""GetBillCycleDueDates"":
			fn_GetBillCycleDueDates(Inputs, Outputs);
			return (CancelOperation);   
			break;
		case ""GetFormattedDate"":
			fn_GetFormattedDate(Inputs, Outputs);
			return (CancelOperation);   
			break;

		case ""GetStcOneContract"":
			GetStcOneContract(Inputs, Outputs);
			return (CancelOperation);   
			break;

		default: 
			break; 
		
		
	}
 
 return (ContinueOperation);  
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)  
{ 
/*  
---------------+------+--------+----------------------------------------------  
Date(YYYYMMDD) | Ver  | By     | Description   
---------------+------+--------+----------------------------------------------  
20120712       | 1.0  | Chiranjeevi| business Service to calculate contract end date 
 
---------------+------+--------+----------------------------------------------  
*/  
 
	switch(MethodName)  
	{ 
		case ""CheckContract"": 
			fnStampContract(Inputs, Outputs);  
			return (CancelOperation);  
			break; 
		case ""CalcPenlty"": 
			fnCalcPenalty(Inputs, Outputs);  
			return (CancelOperation);   
			break; 
		case ""ChekPenaltyProd"": 
			fnChekPenaltyProd(Inputs, Outputs);  
			return (CancelOperation);   
			break;
		case ""CalcDatacomPenalty"": 
			fn_CalcDatacomPenalty(Inputs, Outputs);  
			return (CancelOperation);   
			break;
		case ""CheckDatacomPenaltyProd"":
			fn_CheckDatacomPenaltyProd(Inputs, Outputs);
			return (CancelOperation);   
			break;
		case ""GetBillCycleDueDates"":
			fn_GetBillCycleDueDates(Inputs, Outputs);
			return (CancelOperation);   
			break;
		case ""GetFormattedDate"":
			fn_GetFormattedDate(Inputs, Outputs);
			return (CancelOperation);   
			break;

		case ""GetStcOneContract"":
			GetStcOneContract(Inputs, Outputs);
			return (CancelOperation);   
			break;
		
		case ""AddToDateWF"":
			AddToDateWF(Inputs, Outputs);
			return (CancelOperation);   
			break;

		default: 
			break; 
		
		
	}
 
 return (ContinueOperation);  
}
"/* 
---------------+------+--------+---------------------------------------------- 
Date(YYYYMMDD) | Ver  | By     | Description  
---------------+------+--------+---------------------------------------------- 
20120712      |   1.0|   CP        Creation 
---------------+------+--------+---------------------------------------------- 
*/ 
function StringToDateFormat(strStartDt)
{
 
 var retDate; 
 var vFirstSlash = strStartDt.indexOf(""/"");
 var vSecondSlash = strStartDt.indexOf(""/"",vFirstSlash + 1);
 var vFirstSpace = strStartDt.indexOf("" "");
 var vFirstColon = strStartDt.indexOf("":"");
 var vSecondColon = strStartDt.indexOf("":"",vFirstColon + 1);
 var vSecondSpace = strStartDt.indexOf("" "",vFirstSpace + 1); 
 var vSecond = """";
 var vDay = strStartDt.substring(vFirstSlash + 1,vSecondSlash);
 var vMonth = ToNumber(strStartDt.substring(0,vFirstSlash));
 var vYear = strStartDt.substring(vSecondSlash + 1,vFirstSpace);
 var vHour = strStartDt.substring(vFirstSpace + 1,vFirstColon);
 var vMinute = strStartDt.substring(vFirstColon + 1,vSecondColon);
 if(vSecondSpace == ""-1"")
  vSecond = strStartDt.substring(vSecondColon + 1);
 else
  vSecond = strStartDt.substring(vSecondColon + 1,vSecondSpace);
 var strMonth = """";
 if(vMonth == 1)
 {
  strMonth = ""Jan"";
 }
 else if(vMonth == 2)
 {
  strMonth = ""Feb"";
 }
 else if(vMonth == 3)
 {
  strMonth = ""Mar"";
 }
 else if(vMonth == 4)
 {
  strMonth = ""Apr"";
 }
 else if(vMonth == 5)
 {
  strMonth = ""May"";
 }
 else if(vMonth == 6)
 {
  strMonth = ""Jun"";
 }
 else if(vMonth == 7)
 {
  strMonth = ""Jul"";
 }
 else if(vMonth == 8)
 {
  strMonth = ""Aug"";
 }
 else if(vMonth == 9)
 {
  strMonth = ""Sep"";
 }
 else if(vMonth == 10)
 {
  strMonth = ""Oct"";
 }
 else if(vMonth == 11)
 {
  strMonth = ""Nov"";
 }
 else if(vMonth == 12)
 {
  strMonth = ""Dec"";
 } 
 retDate = strMonth+"" ""+vDay+"" ""+vYear+"" ""+vHour+"":""+vMinute+"":""+vSecond; 
 return retDate;
}
"/* 
---------------+------+--------+---------------------------------------------- 
Date(YYYYMMDD) | Ver  | By     | Description  
---------------+------+--------+---------------------------------------------- 
20120712      |   1.0|   CP        Creation 
---------------+------+--------+---------------------------------------------- 
*/ 
function StringToDateFormat(strStartDt)
{
 
 var retDate; 
 var vFirstSlash = strStartDt.indexOf(""/"");
 var vSecondSlash = strStartDt.indexOf(""/"",vFirstSlash + 1);
 var vFirstSpace = strStartDt.indexOf("" "");
 var vFirstColon = strStartDt.indexOf("":"");
 var vSecondColon = strStartDt.indexOf("":"",vFirstColon + 1);
 var vSecondSpace = strStartDt.indexOf("" "",vFirstSpace + 1); 
 var vSecond = """";
 var vDay = strStartDt.substring(vFirstSlash + 1,vSecondSlash);
 var vMonth = ToNumber(strStartDt.substring(0,vFirstSlash));
 var vYear = strStartDt.substring(vSecondSlash + 1,vFirstSpace);
 var vHour = strStartDt.substring(vFirstSpace + 1,vFirstColon);
 var vMinute = strStartDt.substring(vFirstColon + 1,vSecondColon);
 if(vSecondSpace == ""-1"")
  vSecond = strStartDt.substring(vSecondColon + 1);
 else
  vSecond = strStartDt.substring(vSecondColon + 1,vSecondSpace);
 var strMonth = """";
 if(vMonth == 1)
 {
  strMonth = ""Jan"";
 }
 else if(vMonth == 2)
 {
  strMonth = ""Feb"";
 }
 else if(vMonth == 3)
 {
  strMonth = ""Mar"";
 }
 else if(vMonth == 4)
 {
  strMonth = ""Apr"";
 }
 else if(vMonth == 5)
 {
  strMonth = ""May"";
 }
 else if(vMonth == 6)
 {
  strMonth = ""Jun"";
 }
 else if(vMonth == 7)
 {
  strMonth = ""Jul"";
 }
 else if(vMonth == 8)
 {
  strMonth = ""Aug"";
 }
 else if(vMonth == 9)
 {
  strMonth = ""Sep"";
 }
 else if(vMonth == 10)
 {
  strMonth = ""Oct"";
 }
 else if(vMonth == 11)
 {
  strMonth = ""Nov"";
 }
 else if(vMonth == 12)
 {
  strMonth = ""Dec"";
 } 
 retDate = strMonth+"" ""+vDay+"" ""+vYear+"" ""+vHour+"":""+vMinute+"":""+vSecond; 
 return retDate;
}
function  fnAddPenaltyProd(strPenaltyCharge,OrderId)
{
	try
	{
        var Appln = TheApplication();
        var boOrder = Appln.GetBusObject(""Order Entry (Sales)"");   
        var PdsService = Appln.GetService(""PDS Product Data Service"");
        var bcOrder = boOrder.GetBusComp(""Order Entry - Orders"");   
        var bcLineItms = boOrder.GetBusComp(""Order Entry - Line Items"");
        var bRecExist;
        var bRecExist2;
		var RootItemId;
		var strExpr;
		var ServiceAccountId, BillingAccountId;
 		with (bcOrder)   // with Order
        {   
	        ActivateField(""Order Header Id"");
	        ActivateField(""Product Id"");
	        ActivateField(""Billing Account Id"");
	        ActivateField(""Service Account Id"");
	        ActivateField(""STC Channel"");
	        SetViewMode(AllView);   
	        ClearToQuery();   
	        SetSearchSpec(""Id"", OrderId);   
	        ExecuteQuery(ForwardOnly);   
	        bRecExist = FirstRecord();   
	        if (bRecExist)   
	        {   
				BillingAccountId = GetFieldValue(""Billing Account Id"");
				ServiceAccountId = GetFieldValue(""Service Account Id"");
				var vInputs = Appln.NewPropertySet();
				var vOutputs = Appln.NewPropertySet();
				var TempName = Appln.InvokeMethod(""LookupValue"", ""STC_DATACOMM_PACKAGE"", ""Datacom Terminated Product"");
				vInputs.SetProperty(""Doc Id"", OrderId);
				vInputs.SetProperty(""Template Search Spec"", ""[Name] = '"" + TempName + ""'"");
				PdsService.InvokeMethod(""AddFavoriteToOrder"", vInputs, vOutputs); 
				
				with(bcLineItms)    
	         	{  
      				ActivateField(""Product Type"");
    				strExpr = "" [Order Header Id] = '""+ OrderId +""'""  + ""AND [Product Type] = 'Package'"";   
				    SetSearchExpr(strExpr);   
				    ExecuteQuery(ForwardOnly);   
				    bRecExist2 = FirstRecord();        
					if(bRecExist2)
					{
						RootItemId = GetFieldValue(""Id"");
					}
				}//with(bcLineItms)   
				                
				with(bcLineItms)   
				{  
					ActivateField(""Product"");
					ActivateField(""Net Price"");
					ActivateField(""Unit Price"");
					ActivateField(""Stored Extended Price"");
					ActivateField(""Parent Order Item Id"");
					ActivateField(""Root Order Item Id"");
					ActivateField(""Pricing Adjustment Amount"");
					ActivateField(""Header Discount Amount"");
					ActivateField(""Billing Account Id"");
	        		ActivateField(""Service Account Id"");
					strExpr = "" [Order Header Id] = '""+ OrderId +""'""  + ""AND [Product] = '"" + TempName + ""'"";   
				    SetSearchExpr(strExpr);   
				    ExecuteQuery(ForwardOnly);   
				    bRecExist2 = FirstRecord();        
					if(bRecExist2)
					{
						 SetFieldValue(""Parent Order Item Id"", RootItemId); 
				         SetFieldValue(""Root Order Item Id"", RootItemId); 
						 SetFieldValue(""Billing Account Id"", BillingAccountId);
						 SetFieldValue(""Service Account Id"", ServiceAccountId);
				         SetFieldValue(""Net Price"", strPenaltyCharge);
				         SetFieldValue(""Unit Price"", strPenaltyCharge);
				         SetFieldValue(""Stored Extended Price"", strPenaltyCharge);
				         WriteRecord();
				    }
				}//with(bcLineItms)
				SetFieldValue(""STC Channel"", ""FCA"");
				WriteRecord();   
			}//if
		}// with order
	}
	catch(e)
	{
		throw(e);
	}     
	finally
	{
		bcLineItms = null;
		bcOrder = null;
		boOrder = null;
		PdsService = null;
		Appln = null;
	}   
	return (CancelOperation);
}
function  fnAddPenaltyProd_Old(strPenaltyCharge,OrderId)
{
        var boOrder = TheApplication().GetBusObject(""Order Entry (Sales)"");   
        var bcOrder = boOrder.GetBusComp(""Order Entry - Orders"");   
        var bcLineItms = boOrder.GetBusComp(""Order Entry - Line Items"");
        var bRecExist;
        var  bRecExist2;
var RootItemId;
var strExpr;
 with (bcOrder)   
         {   
        
        ActivateField(""Order Header Id"");
        ActivateField(""Product Id"");
        SetViewMode(AllView);   
        ClearToQuery();   
        SetSearchSpec(""Id"", OrderId);   
        ExecuteQuery(ForwardOnly);   
        bRecExist = FirstRecord();   
        if (bRecExist)   
          {   

with(bcLineItms)   
         {  
      
    strExpr = "" [Order Header Id] = '""+ OrderId +""'""  + ""AND [Product Type] = 'Package'"";   
      SetSearchExpr(strExpr);   
      ExecuteQuery(ForwardOnly);   
      bRecExist2 = FirstRecord();        
if(bRecExist2)
{
RootItemId = GetFieldValue(""Id"");
}
}//with(bcLineItms)   
                
         with(bcLineItms)   
         {  
         NewRecord(NewAfter);
         SetFieldValue(""Order Header Id"",OrderId);
         SetFieldValue(""Product Id"",TheApplication().InvokeMethod(""LookupValue"",""STC_DATACOMM_PACKAGE"",""PENALTY""));
       //SetFieldValue(""Product Id"",'1-7NFUFR');
         SetFieldValue(""Product"",""VIVA Termination Penalty"");
        
         //SetFieldValue(""Cfg Type"",""eConfigurator"");
         SetFieldValue(""Net Price"",strPenaltyCharge);
         SetFieldValue(""Parent Order Item Id"",RootItemId); 
         SetFieldValue(""Root Order Item Id"",RootItemId); 
         WriteRecord();
}//with(bcLineItms)   
}
}//
         
}
"/* 
---------------+------+--------+---------------------------------------------- 
Date(YYYYMMDD) | Ver  | By     | Description  
---------------+------+--------+---------------------------------------------- 
20120717      |   1.0|   CP        Creation 
---------------+------+--------+---------------------------------------------- 
*/ 
function fnCalcPenalty(Inputs, Outputs)  
{   
	try   
    { 
       
        var boSrvAcnt = TheApplication().GetBusObject(""STC Service Account"");
        var bcSrvAcnt = boSrvAcnt.GetBusComp(""CUT Service Sub Accounts"");
        var bcAsset = boSrvAcnt.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
        var bcAssetXA =boSrvAcnt.GetBusComp(""Asset Mgmt - Asset XA"");  
        var OrderId = Inputs.GetProperty(""Order Id"");
        var strServiceId = Inputs.GetProperty(""ServiceId"");
        var bRecExist; 
        var bRecExist1;
        var strExpr;
        var strLineId;
        var strRootId;   
        var strOrderId = Inputs.GetProperty(""Order Id""); 
        var strOrderType = Inputs.GetProperty(""Order Type""); 
        var bsLovs;
        var psInputs; 
        var psOutputs; 
        var vTermLength;
        var strProdName;
        var strStartDt;
        var strEndDt;
        var strCurrentDt;
        var bRecExist2;
        var strAttrName;
        var strMrcTot;
        var strPerdayMRC;
        var strPenaltyCharge;
        var bRecExist3;

        with (bcSrvAcnt)   
         {   
	        //ActivateField(""STC Profile Type"");
	        SetViewMode(AllView);   
	        ClearToQuery();   
	        SetSearchSpec(""Id"", strServiceId);   
	        ExecuteQuery(ForwardOnly);   
	        bRecExist = FirstRecord(); 

        	if (bRecExist)   
          	{   
                var strProfile = GetFieldValue(""STC Profile Type"");

				if(strProfile == 'Datacom')
				{
			    	with(bcAsset)   
			        {  
						ActivateField(""Service Account Id"");   
					    ActivateField(""Status"");   
					    ActivateField(""Product Type"");
					    ActivateField(""STC MRCTotal"");
						ActivateField(""STC Product Type"");
					    ActivateField(""Id"");
					
					   	SetViewMode(AllView);   
					    ClearToQuery();  
     					strExpr = "" [Service Account Id] = '""+ strServiceId +""'""  + ""AND [STC Product Type] = 'Package' AND [Status] = 'Active'""; 
      					SetSearchExpr(strExpr);
      					ExecuteQuery(ForwardOnly);
      					bRecExist1 = FirstRecord();   

      					if(bRecExist1)   
       					{         
      						strMrcTot = GetFieldValue(""STC MRCTotal"");

      						//strExpr = "" [Service Account Id] = '""+ strServiceId +""'""  + ""AND [STC Product Type] = 'Service Point' AND [Status] = 'Active'"";
						    strExpr = ""[Service Account Id] = '""+strServiceId+""' AND ([STC Plan Type] = 'MainContract') AND [Status] = 'Active'"";
							
							SetSearchExpr(strExpr);   
						    ExecuteQuery(ForwardOnly);   
						    bRecExist1 = FirstRecord();

 							if(bRecExist1)   
							{
								var strAssetId = GetFieldValue(""Id"");
 								with(bcAssetXA)   
         						{  
      								ActivateField(""Object Id"");   
      								ActivateField(""Name"");   
     								ActivateField(""Value""); 
      								SetViewMode(AllView);   
      								ClearToQuery();      
      								SetSearchExpr(""[Object Id] = '"" + strAssetId + ""' AND ( [Name] = 'End Date' OR [Name] = 'Start Date' )"");
      								ExecuteQuery(ForwardOnly);   
      								bRecExist2 = FirstRecord(); 
      								bRecExist3 = FirstRecord();
      								while(bRecExist2)
      								{
      									if( GetFieldValue(""Name"") == ""Start Date"")
      										strStartDt = GetFieldValue(""Value"");
      									else
      										strEndDt = GetFieldValue(""Value"");
      										
      									bRecExist2 = NextRecord();
      								}
           							if( bRecExist3 )
                        			{
                      					// Set Date Object //
                       					strCurrentDt = new Date;
                       					strEndDt 	 = new Date(strEndDt);
                       					strStartDt 	 = new Date(strStartDt); 	
                       					// Set time to 00:00:00 hrs // 
										strCurrentDt = new Date(strCurrentDt.setHours(0,0,0)); 
										strEndDt	 = new Date(strEndDt.setHours(0,0,0));
										strStartDt	 = new Date(strStartDt.setHours(0,0,0));
										// Set Date to 1st of the month //
			                       		strCurrentDt = ToNumber(strCurrentDt.setDate(1));
			                       		strEndDt 	 = ToNumber(strEndDt.setDate(1));	
			                       		strStartDt 	 = ToNumber(strStartDt.setDate(1)); 
                       					
                       					if( strEndDt > strCurrentDt ) 
                       					{	
                       						var MonthOfTenure:Number = Math.floor((strEndDt-strStartDt)/(1000*60*60*24*30));
                       						var MonthOfUse:Number	 = Math.floor((strCurrentDt-strStartDt)/(1000*60*60*24*30));
                       						var strMonthDiff:Number  = MonthOfTenure-MonthOfUse;
                       						strPenaltyCharge = strMonthDiff * (ToNumber(strMrcTot));
                      						Outputs.SetProperty(""TotCharge"",strPenaltyCharge);
                      						fnAddPenaltyProd(strPenaltyCharge, OrderId);
                      					}
                                 	}//if( bRecExist3)
      							}// with(bcAssetXA) 
							}// if(bRecExist1)  
      					}  //  if(bRecExist1) 
					}// with(bcAsset)
     			}//if(strProfile == 'Datacom')   
  			} //if (bRecExist)   
 		} //with (bcSrvAcnt)   
	}//try   
 	catch (e)   
 	{   
		throw(e.toString());   
 	}   
 	finally   
 	{   
		bcAssetXA = null;
		bcAsset = null;
		bcSrvAcnt = null;
		boSrvAcnt = null;
	}   
	return (CancelOperation);
}
"/* 
---------------+------+--------+---------------------------------------------- 
Date(YYYYMMDD) | Ver  | By     | Description  
---------------+------+--------+---------------------------------------------- 
20120717      |   1.0|   CP        Creation 
---------------+------+--------+---------------------------------------------- 
*/ 
function fnCalcPenalty_old(Inputs, Outputs)  
{   
       
        var boSrvAcnt = TheApplication().GetBusObject(""STC Service Account"");
        var bcSrvAcnt = boSrvAcnt.GetBusComp(""CUT Service Sub Accounts"");
        var bcAsset = boSrvAcnt.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
        var bcAssetXA =boSrvAcnt.GetBusComp(""Asset Mgmt - Asset XA"");  
         var OrderId = Inputs.GetProperty(""Order Id"");
        var strServiceId = Inputs.GetProperty(""ServiceId"");
        var bRecExist; 
        var bRecExist1;
        var strExpr;
        var strLineId;
        var strRootId;   
        var strOrderId = Inputs.GetProperty(""Order Id""); 
        var strOrderType = Inputs.GetProperty(""Order Type""); 
        var bsLovs;
        var psInputs; 
        var psOutputs; 
        var vTermLength;
        var strProdName;
        var strStartDt;
        var strEndDt;
        var bRecExist2;
        var strAttrName;
        var strMrcTot;
        var strPerdayMRC;
        var strPenaltyCharge;
        var bRecExist3;
  

 try   
    {   

    
        with (bcSrvAcnt)   
         {   
        //ActivateField(""STC Profile Type"");
        SetViewMode(AllView);   
        ClearToQuery();   
        SetSearchSpec(""Id"", strServiceId);   
        ExecuteQuery(ForwardOnly);   
        bRecExist = FirstRecord(); 

        if (bRecExist)   
          {   
                var strProfile = GetFieldValue(""STC Profile Type"");


if(strProfile == 'Datacom')
{


         with(bcAsset)   
         {  
      
      ActivateField(""Service Account Id"");   
      ActivateField(""Status"");   
      ActivateField(""Product Type"");
      ActivateField(""STC MRCTotal"");
ActivateField(""STC Product Type"");
      ActivateField(""Id"");

      SetViewMode(AllView);   
      ClearToQuery();  
     strExpr = "" [Service Account Id] = '""+ strServiceId +""'""  + ""AND [STC Product Type] = 'Package' AND [Status] = 'Active'""; 
       //strExpr = "" [Service Account Id] = '""+ strServiceId +""'""  + ""AND [Status] = 'Active'""; 
      SetSearchExpr(strExpr);
      ExecuteQuery(ForwardOnly);
      bRecExist1 = FirstRecord();   

      if(bRecExist1)   
       {         
      strMrcTot = GetFieldValue(""STC MRCTotal"");
 
      strExpr = "" [Service Account Id] = '""+ strServiceId +""'""  + ""AND [STC Product Type] = 'Service Point' AND [Status] = 'Active'"";
// strExpr = "" [Service Account Id] = '""+ strServiceId +""'""  + ""AND [Status] = 'Active'"";    
      SetSearchExpr(strExpr);   
      ExecuteQuery(ForwardOnly);   
      bRecExist1 = FirstRecord();

 if(bRecExist1)   
{
var strAssetId = GetFieldValue(""Id"");

  
 with(bcAssetXA)   
         {  
      
      ActivateField(""Object Id"");   
      ActivateField(""Name"");   
     ActivateField(""Value""); 
      SetViewMode(AllView);   
      ClearToQuery();   
      SetSearchSpec(""Object Id"", strAssetId);
      SetSearchSpec(""Name"", ""End Date"");    
      ExecuteQuery(ForwardOnly);   
      bRecExist2 = FirstRecord();   
      
           if( bRecExist2)
                        {
    
                       strEndDt = GetFieldValue(""Value"");
// TheApplication().RaiseErrorText(strEndDt); 
                      //calcpenalty charges
                       var CurrentDate = new Date; 
                           CurrentDate = ToNumber(CurrentDate.getTime());
                       strEndDt =  new Date(strEndDt);
                       strEndDt = ToNumber(strEndDt.getTime());
                       var strtimediff = strEndDt-CurrentDate;
                       var strDays = strtimediff/86400000;
                       strDays = Math.round(strDays);
                       strPerdayMRC = (12* strMrcTot)/ 365;
                       strPenaltyCharge = strDays * strPerdayMRC;
                      Outputs.SetProperty(""TotCharge"",strPenaltyCharge)
                      fnAddPenaltyProd(strPenaltyCharge,OrderId);
                                       }//if( bRecExist2)

      }// with(bcAssetXA) 
}// if(bRecExist1)  
      }  //  if(bRecExist1) 
}// with(bcAsset)
     }//if(strProfile == 'Datacom')   
  } //if (bRecExist)   
 } //with (bcSrvAcnt)   


 

  
   }//try   
    catch (e)   
 {   
throw(e.toString());   
 }   
 finally   
 {   
// bcLineItms = null;
// bcOrder = null;
// boOrder = null;
 }   
}
"/*  
---------------+------+--------+----------------------------------------------  
Date(YYYYMMDD) | Ver  | By     | Description   
---------------+------+--------+----------------------------------------------  
25120712      |   1.0|   CP        Creation  
---------------+------+--------+----------------------------------------------  
*/  
function fnChekPenaltyProd(Inputs, Outputs)   
{    
        var boOrder = TheApplication().GetBusObject(""Order Entry (Sales)"");    
        var bcOrder = boOrder.GetBusComp(""Order Entry - Orders"");    
        var bcLineItms = boOrder.GetBusComp(""Order Entry - Line Items""); 
     
        var bRecExist;  
        var bRecExist1; 
        var strExpr; 
        var strLineId; 
        var strRootId;    
        var strOrderId = Inputs.GetProperty(""OrderId"");  
        var strOrderType = Inputs.GetProperty(""OrderType""); 
        var strProdFlag = ""N""; 
     try    
    {    
      //Query for Line Items    
        if (strOrderType == ""Modify"") 
        { 
        with (bcOrder)    
         {    
         ActivateField(""Order Date"");   
        SetViewMode(AllView);    
        ClearToQuery();    
        SetSearchSpec(""Id"", strOrderId);    
        ExecuteQuery(ForwardOnly);    
        bRecExist = FirstRecord();    
        if (bRecExist)    
          {    
                  
         with(bcLineItms)    
         {   
       
      ActivateField(""Order Header Id"");    
      ActivateField(""Parent Order Item Id"");    
      ActivateField(""Product"");  
      ActivateField(""Status"");    
      ActivateField(""Part Number"");   
       
      SetViewMode(AllView);    
      ClearToQuery();    
      strExpr = "" [Order Header Id] = '""+ strOrderId +""'""  + ""AND [Part Number] = 'VIVADATAPEN' AND [Action Code] = 'Add'"";    
      SetSearchExpr(strExpr);    
      ExecuteQuery(ForwardOnly);    
      bRecExist1 = FirstRecord();    
  
      if(bRecExist1)    
       {  
       strProdFlag = ""Y""; 
      TheApplication().SetProfileAttr(""ProductFlg"",strProdFlag);      
     
       } // if(bRecExist1) 
       else
       {
       TheApplication().SetProfileAttr(""ProductFlg"",strProdFlag);
       } 
     
     }//with(bcLineItms)      
  } //if (bRecExist)     
 } //with (bcOrder)  
  
 }// if (strOrderType == ""Modify"") 
  
 else 
  
 { 
 //Do Nothing 
 } 
   
   }//try    
    catch (e)    
 {    
throw(e.toString());    
 }
 finally    
 {    
 bcLineItms = null; 
 bcOrder = null; 
 boOrder = null; 
 }  

}
"/*  
---------------+------+--------+----------------------------------------------  
Date(YYYYMMDD) | Ver  | By     | Description   
---------------+------+--------+----------------------------------------------  
20120712      |   1.0|   CP        Creation  
---------------+------+--------+----------------------------------------------  
*/  
function fnStampContract(Inputs, Outputs)   
{    
        var boOrder = TheApplication().GetBusObject(""Order Entry (Sales)"");    
        var bcOrder = boOrder.GetBusComp(""Order Entry - Orders"");    
        var bcLineItms = boOrder.GetBusComp(""Order Entry - Line Items""); 
        var bcLineXA = boOrder.GetBusComp(""Order Item XA"");    
        var OrderId = Inputs.GetProperty(""Order Id""); 
        var bRecExist;  
        var bRecExist1; 
        var strExpr; 
        var strLineId; 
        var strRootId;    
        var strOrderId = Inputs.GetProperty(""Order Id"");  
        var strOrderType = Inputs.GetProperty(""Order Type"");  
        var bsLovs; 
        var psInputs;  
        var psOutputs;  
        var vTermLength; 
        var strProdName; 
        var strStartDt; 
        var strEndDt; 
        var bRecExist2; 
        var strAttrName;
 
 try    
    {    
      //Query for Line Items    
        if (strOrderType == ""Provide"" || strOrderType == ""Modify"") 
        { 
        with (bcOrder)    
         {    
         ActivateField(""Order Date"");   
        SetViewMode(AllView);    
        ClearToQuery();    
        SetSearchSpec(""Id"", strOrderId);    
        ExecuteQuery(ForwardOnly);    
        bRecExist = FirstRecord();    
        if (bRecExist)    
          {    
                  strStartDt = GetFieldValue(""Order Date""); 
         with(bcLineItms)    
         {   
       
      ActivateField(""Order Header Id"");    
      ActivateField(""Parent Order Item Id"");    
      ActivateField(""Part Number"");  
      ActivateField(""Status"");    
      ActivateField(""Product Type"");
      ActivateField(""Part Number""); //NehaK 18/11/2013 IPBX Changes 
       
      SetViewMode(AllView);    
      ClearToQuery();    
      //strExpr = "" [Order Header Id] = '""+ strOrderId +""'""  + ""AND ([Product Type] = 'Service Point' OR [Part Number] LIKE 'VOIPEQUIP*') AND [Action Code] = 'Add'"";     //NehaK 18/11/2013 IPBX Changes
      strExpr = ""[Order Header Id] = '""+strOrderId+""' AND ([STC Plan Type] = 'MainContract' OR [Product Type] = 'Service Point' OR [Part Number] LIKE 'VOIPEQUIP*') AND [Action Code] = 'Add'"";
	  
	  SetSearchExpr(strExpr);    
      ExecuteQuery(ForwardOnly);    
      bRecExist1 = FirstRecord();    
  
      if(bRecExist1)    
       {          
       while(bRecExist1)
       {
       strLineId = GetFieldValue(""Id"");    
       strRootId = GetFieldValue(""Root Order Item Id""); 
       strProdName = GetFieldValue(""Part Number""); 
 	   var strTruncProdName =  strProdName.substring(0,9); //NehaK 18/11/2013 IPBX Changes
      
		if(strTruncProdName == ""VOIPEQUIP"")     //NehaK 18/11/2013 IPBX Changes 
		strProdName=strProdName.substring(0,11); //NehaK 18/11/2013 IPBX Changes
      
//TheApplication().RaiseErrorText(CurrentDate); 
 
       bsLovs = TheApplication().GetService(""STC Get LOV Values""); 
       psInputs = TheApplication().NewPropertySet(); 
       psOutputs = TheApplication().NewPropertySet(); 
       psInputs.SetProperty(""LOV Field"", ""Value"");  
       psInputs.SetProperty(""LOV Value"", strProdName); 
       psInputs.SetProperty(""LOV Type"", ""STC_CONTRACT_TYPE""); 
       bsLovs.InvokeMethod(""GetLovValues"", psInputs, psOutputs); 
       vTermLength = ToNumber(psOutputs.GetProperty(""Description""));   
      
       strEndDt = fnUpdateContract(Inputs,Outputs,strStartDt,vTermLength);  
 
 
       with(bcLineXA)    
         {   
       
      ActivateField(""Object Id"");    
      ActivateField(""Name"");    
      SetViewMode(AllView);    
      ClearToQuery();    
      SetSearchSpec(""Object Id"", strLineId);    
      ExecuteQuery(ForwardOnly);    
      bRecExist2 = FirstRecord();    
      var reccount = CountRecords(); 
 
      while(bRecExist2)    
       {          
      strAttrName = GetFieldValue(""Name""); 
 
      if(strAttrName == ""Start Date"") 
      { 
      SetFieldValue(""Value"",strStartDt); 
      WriteRecord(); 
      } 
         if(strAttrName == ""End Date"") 
      { 
      SetFieldValue(""Value"",strEndDt); 
      WriteRecord(); 
      } 
       bRecExist2 = NextRecord(); 
      } // while(bRecExist2)   
     }//with(bcLineXA)   
      bRecExist1 = NextRecord(); 
      }// while bRecExist1
      } // if(bRecExist1)   
     }//with(bcLineItms)      
  } //if (bRecExist)     
 } //with (bcOrder)  
  
 }// if (strOrderType == ""Provide"" || strOrderType == ""Modify"") 
  
 else 
  
 { 
 //Do Nothing 
 } 
   
   }//try    
    catch (e)    
 {    
throw(e.toString());    
 }    
 finally    
 {    
 bcLineItms = null; 
 bcOrder = null; 
 boOrder = null; 
 }    
}
"/* 
---------------+------+--------+---------------------------------------------- 
Date(YYYYMMDD) | Ver  | By     | Description  
---------------+------+--------+---------------------------------------------- 
20120712      |   1.0|   CP        Creation 
---------------+------+--------+---------------------------------------------- 
*/ 
function fnUpdateContract(Inputs,Outputs,strStartDt,vTermLength)  
{ 

   
   
      
    var vAgreestartdate = """";  
    var aDate = """";  
    var aYear = """";  
    var aMonth = """";  
    var aDay ="""";  
    var anHour = """";  
    var anMins = """";  
    var anSecs = """";  
    var vendDate = """";  
    var vAgreeId ="""";  
    var aNewYear = """";  
    var aNewMonth = """";  
    var newmonth = """"; 
    var vstartdate1;
   
 try  
   {  
    
             vAgreestartdate = StringToDateFormat(strStartDt);
         
       vAgreestartdate = new Date(vAgreestartdate); 
//TheApplication().RaiseErrorText(vAgreestartdate);
          vstartdate1 = Clib.mktime(vAgreestartdate)*1000;         
       aDate = new Date();  
       aDate.setTime(vstartdate1);  
       aYear = aDate.getFullYear(aYear); 
          aMonth = aDate.getMonth() + 1;  
       aDay = aDate.getDate();  
       anHour = aDate.getHours();  
       anMins = aDate.getMinutes();  
       anSecs = aDate.getSeconds();  
       newmonth = aMonth + vTermLength;  
     
          if(newmonth > 12)  
          {  
      if(aMonth=='12')// code for dec month
     {
     if((newmonth%12)=='0')
     {
     aNewYear = ToInteger(newmonth/12)
     aYear = aYear + aNewYear;
     aYear = aYear - 1;
     aNewMonth = (newmonth%12);
     }//if (newmonth%12)=='0
     else
     {
           aNewYear = ToInteger(newmonth/12); 
           aYear = aYear + aNewYear;  
           aNewMonth = (newmonth%12);
     } //else
     }
     
     else
     {
           aNewYear = ToInteger(newmonth/12); 
           aYear = aYear + aNewYear;  
           aNewMonth = (newmonth%12);
     } 
     
     ////  code for december month
     if(aNewMonth=='0')
     {
     aMonth=12;
     }
       else
     {
           aMonth =  aNewMonth;  
     }
          }   //if newmonth > 12
          else  
          {  
           aMonth = newmonth;  
          }  
          if((aDay > 29) && (aMonth == 2) && ((aYear%4) == 0))  
          {  
            aDay = aDay - 29;  
            aMonth = aMonth + 1;  
          }  
         if((aDay > 28) && (aMonth == 2) && ((aYear%4)!= 0))  
         {  
            aDay = aDay - 28;  
            aMonth = aMonth + 1;  
         }     
          if((aDay > 30) && ((aMonth == 4) || (aMonth == 6) || (aMonth == 9) || (aMonth == 11)))  
         {  
           aDay = aDay - 30;  
           aMonth = aMonth + 1;  
         }   

    if (Clib.strlen(aMonth) == 1)
{
aMonth = '0'+ aMonth;
}
    if (Clib.strlen(aDay) == 1)
{
aDay = '0'+ aDay;
}
    if (Clib.strlen(anHour) == 1)
{
anHour = '0'+ anHour;
}
    if (Clib.strlen(anMins) == 1)
{
anMins = '0'+ anMins;
}
    if (Clib.strlen(anSecs) == 1)
{
anSecs = '0'+ anSecs;
}
          vendDate = aMonth + ""/"" + aDay + ""/"" + aYear +"" ""+anHour+"":""+anMins+"":""+anSecs; 
     
      
 
        
      }//end of try  
      
 catch(e)  
 { 
 throw(e.toString()); 
 }  
 finally  
 {  
    
 }    

 return vendDate;  
}
function fn_CalcDatacomPenalty(Inputs, Outputs)
{
	try
	{
		var Appln, boServAccnt, bcAsset, bcAssetXA;
		var inServAccntId=Inputs.GetProperty(""Service Account Id"");
		var outPenaltyAmt=0;
		var RemMonths=0;
		var bRecExist1, bRecExist2, strMrcTot=0, strExpr, strAssetId, strStartDt, strEndDt, strCurrentDt, CalcPenaltyCharge=""N"";
		
		Appln = TheApplication();
		boServAccnt = Appln.GetBusObject(""STC Service Account"");
		bcAsset= boServAccnt.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
		bcAssetXA=boServAccnt.GetBusComp(""Asset Mgmt - Asset XA"");
		with(bcAsset) //with 1
		{
			ActivateField(""Service Account Id"");   
		    ActivateField(""Status"");   
		    ActivateField(""Product Type"");
		    ActivateField(""Adjusted List Price"");
			ActivateField(""STC Product Type"");
		    ActivateField(""Id"");
		   	SetViewMode(AllView);   
		    ClearToQuery();  
			SetSearchExpr(""[Service Account Id] = '""+ inServAccntId +""'""  + ""AND [Product Part Number] LIKE 'VIVADATACOM90MR*' AND [Status] = 'Active'"");
			ExecuteQuery(ForwardOnly);
			bRecExist1 = FirstRecord();
			if(bRecExist1) //if 1.1
			{
				strMrcTot = GetFieldValue(""Adjusted List Price"");
				//strExpr = "" [Service Account Id] = '""+ inServAccntId +""'""  + ""AND [STC Product Type] = 'Service Point' AND [Status] = 'Active'"";
			    strExpr = ""[Service Account Id] = '""+inServAccntId +""' AND ([STC Plan Type] = 'MainContract') AND [Status] = 'Active'"";
				SetSearchExpr(strExpr);   
			    ExecuteQuery(ForwardOnly);   
			    bRecExist1 = FirstRecord();
			    if(bRecExist1) //if 1.1.1
			    {
			    	strAssetId = GetFieldValue(""Id"");
			    	with(bcAssetXA) //with 1.1.1.1
			    	{
			    		ActivateField(""Object Id"");   
						ActivateField(""Name"");   
						ActivateField(""Value""); 
						SetViewMode(AllView);   
						ClearToQuery();      
						SetSearchExpr(""[Object Id] = '"" + strAssetId + ""' AND ( [Name] = 'End Date' OR [Name] = 'Start Date' )"");
						ExecuteQuery(ForwardOnly);   
						bRecExist2 = FirstRecord(); 
						while(bRecExist2)
						{
							CalcPenaltyCharge = ""Y"";
							if( GetFieldValue(""Name"") == ""Start Date"")
								strStartDt = GetFieldValue(""Value"");
							else
								strEndDt = GetFieldValue(""Value"");
								
							bRecExist2 = NextRecord();
						}
						if( CalcPenaltyCharge == ""Y"" )
						{
							strCurrentDt = new Date;
           					strEndDt 	 = new Date(strEndDt);
           					strStartDt 	 = new Date(strStartDt);
           					// Set time to 00:00:00 hrs // 
							strCurrentDt = new Date(strCurrentDt.setHours(0,0,0)); 
							strEndDt	 = new Date(strEndDt.setHours(0,0,0));
							strStartDt	 = new Date(strStartDt.setHours(0,0,0));
							// Set Date to 1st of the month //
                       		strCurrentDt = ToNumber(strCurrentDt.setDate(1));
                       		strEndDt 	 = ToNumber(strEndDt.setDate(1));	
                       		strStartDt 	 = ToNumber(strStartDt.setDate(1)); 
                       			
           					if( strEndDt > strCurrentDt ) 
           					{	
           						var MonthOfTenure:Number = Math.floor((strEndDt-strStartDt)/(1000*60*60*24*30));
           						var MonthOfUse:Number	 = Math.floor((strCurrentDt-strStartDt)/(1000*60*60*24*30));
           						var strMonthDiff:Number  = MonthOfTenure-MonthOfUse;
								RemMonths = strMonthDiff;
           						outPenaltyAmt = strMonthDiff * (ToNumber(strMrcTot));
          					}
						}
			    	}//with 1.1.1.1
			    }//if 1.1.1
			}//if 1.1
		} //with 1
		
		
	}// try
	catch(e)
	{
	}
	finally
	{
		Outputs.SetProperty(""Penalty Amount"", outPenaltyAmt);
		Outputs.SetProperty(""Tenure"", RemMonths);
		Appln=null, boServAccnt=null, bcAsset=null, bcAssetXA=null;
	}
	return (CancelOperation); 
}
function fn_CheckDatacomPenaltyProd(Inputs, Outputs)
{
	try
	{
		var objAppln, objOrderBusObj, objOrderItemBusComp;
		var strPenaltyProd;
		var strResultCode=""N"";
		var strOrderId = Inputs.GetProperty(""Order Id"");
		objAppln 		= TheApplication();
		objOrderBusObj	= objAppln.GetBusObject(""Order Entry (Sales)"");
		objOrderItemBusComp = objOrderBusObj.GetBusComp(""Order Entry - Line Items"");
		strPenaltyProd = objAppln.InvokeMethod(""LookupValue"", ""STC_DATACOMM_PACKAGE"", ""Datacom Terminated Product"");
		with( objOrderItemBusComp )
		{
			ActivateField(""Product"");
			ActivateField(""Order Header Id"");
			ActivateField(""Action Code"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Product"", strPenaltyProd);
			SetSearchSpec(""Action Code"", ""Add"");
			SetSearchSpec(""Order Header Id"", strOrderId);
			ExecuteQuery(ForwardOnly);
			if( FirstRecord() )
			{
				strResultCode = ""Y"";
			}
			
		}
	}
	catch(e)
	{
	}
	finally
	{
		Outputs.SetProperty(""ReturnCode"", strResultCode);
		objAppln = null;
		objOrderBusObj = null;
		objOrderItemBusComp = null;
	}
}
function fn_GetBillCycleDueDates(Inputs, Outputs)
{//[NAVIN: 29Jan2017: MultipleBillCycles]

	var vOldBillCycle=0, vOldDueDate=0, vNewBillCycle=0, vNewDueDate=0;
	
	vOldBillCycle = ToNumber(Inputs.GetProperty(""CurrBillCycle""));
	vOldDueDate = ToNumber(Inputs.GetProperty(""CurrDueDate""));
	vNewBillCycle = ToNumber(Inputs.GetProperty(""NewBillCycle""));
	vNewDueDate = ToNumber(Inputs.GetProperty(""NewDueDate""));
	
	if (!(vNewBillCycle > 0) || !(vNewDueDate > 0))
	{
		vNewBillCycle = 0;
		vNewDueDate = 0;
	}
	
	var vCurrBillDateMon="""", vCurrDueDateMon="""", vNextBillDateMon="""", vNextDueDateMon="""";

	with (Outputs)
	{
		SetProperty(""CurrBillDateMon"", """");
		SetProperty(""CurrDueDateMon"", """");
		SetProperty(""NextBillDateMon"", """");
		SetProperty(""NextDueDateMon"", """");
		SetProperty(""NextBillCycleEffDate"", """");
	}//end of with (Outputs)

	var CurrDate = new Date();
	var CurrDate1 = new Date();
	var CurrDate2 = new Date();
	var CurrDate3 = new Date();
	var CurrDate4 = new Date();
	CurrDate1.setDate(vOldBillCycle);
	CurrDate2.setDate(vOldDueDate);
	if (vNewBillCycle > 0)
	{
		CurrDate3.setDate(vNewBillCycle);
		CurrDate4.setDate(vNewDueDate);
	}

	var vTimeBuf1 = """", vTimeBuf2 = """", vTimeBuf3 = """", vTimeBuf4="""", vTimeBuf5="""";
	var vCurrDate, vOldBillTemp, vOldDueTemp, vNewBillTemp, vNewDueTemp;
	
	vCurrDate = CurrDate.getDate();

	if (vOldBillCycle == 1)
	{
		vOldBillTemp = AddToDate(CurrDate1, 1, 0, 0, 0, 0, +1);
		vOldDueTemp = AddToDate(CurrDate2, 1, 0, 0, 0, 0, +1);
		vNewBillTemp = AddToDate(CurrDate3, 1, 0, 0, 0, 0, +1);
		vNewDueTemp = AddToDate(CurrDate4, 2, 0, 0, 0, 0, +1);
	}//end of if (vOldBillCycle == 1)
	else //if (vOldBillCycle == 10 || vOldBillCycle == 20)
	{
		if (vCurrDate < vOldBillCycle)
		{
			vOldBillTemp = AddToDate(CurrDate1, 0, 0, 0, 0, 0, +1);
			vOldDueTemp = AddToDate(CurrDate2, 1, 0, 0, 0, 0, +1);
			vNewBillTemp = AddToDate(CurrDate3, 1, 0, 0, 0, 0, +1);
			if (vNewBillCycle == 1)
				vNewDueTemp = AddToDate(CurrDate4, 1, 0, 0, 0, 0, +1);
			else
				vNewDueTemp = AddToDate(CurrDate4, 2, 0, 0, 0, 0, +1);
		}//end of if (vCurrDate < vOldBillCycle)
		else
		{
			vOldBillTemp = AddToDate(CurrDate1, 1, 0, 0, 0, 0, +1);
			vOldDueTemp = AddToDate(CurrDate2, 2, 0, 0, 0, 0, +1);
			
			if ((vOldBillCycle < vNewBillCycle) && (vNewBillCycle != 1))
				vNewBillTemp = AddToDate(CurrDate3, 1, 0, 0, 0, 0, +1);
			else
				vNewBillTemp = AddToDate(CurrDate3, 2, 0, 0, 0, 0, +1);
			
			if (vNewBillCycle == 1)
				vNewDueTemp = AddToDate(CurrDate4, 2, 0, 0, 0, 0, +1);
			else
			{
				if (vOldBillCycle < vNewBillCycle)
					vNewDueTemp = AddToDate(CurrDate4, 2, 0, 0, 0, 0, +1);
				else
					vNewDueTemp = AddToDate(CurrDate4, 3, 0, 0, 0, 0, +1);
			}		
		}//end of inner else
	}//end of outer else
	
	Clib.strftime(vTimeBuf1, ""%d-%b-%Y"", vOldBillTemp);
	Clib.strftime(vTimeBuf2, ""%d-%b-%Y"", vOldDueTemp);
	Clib.strftime(vTimeBuf3, ""%d-%b-%Y"", vNewBillTemp);
	Clib.strftime(vTimeBuf4, ""%d-%b-%Y"", vNewDueTemp);
	Clib.strftime(vTimeBuf5, ""%m/%d/%Y"", vNewBillTemp);

	vCurrBillDateMon = (vTimeBuf1.substring(0, 6)).toUpperCase();
	vCurrDueDateMon = (vTimeBuf2.substring(0, 6)).toUpperCase();
	vNextBillDateMon = (vTimeBuf3.substring(0, 6)).toUpperCase();
	vNextDueDateMon = (vTimeBuf4.substring(0, 6)).toUpperCase();
	
	with (Outputs)
	{
		SetProperty(""CurrBillDateMon"", vCurrBillDateMon);
		SetProperty(""CurrDueDateMon"", vCurrDueDateMon);
		if (vNewBillCycle > 0)
		{
			SetProperty(""NextBillDateMon"", vNextBillDateMon);
			SetProperty(""NextDueDateMon"", vNextDueDateMon);
			SetProperty(""NextBillCycleEffDate"", vTimeBuf5);
		}
	}//end of with (Outputs)

return CancelOperation;
}
function fn_GetFormattedDate(Inputs, Outputs)
{//[NAVIN: 21Feb2017: MultipleBillCycles]

	var vInputDate="""", vOutputDateFormat="""", vOutputDate="""";
	var vInputDateArr = null, vInputDateObj = null, vTimeBuf1 = """";
	with(Inputs)
	{
		vInputDate = GetProperty(""InputDate"");
		vOutputDateFormat = GetProperty(""OutputDateFormat"");
	}
	if (vInputDate != """")
	{
		vInputDateArr = vInputDate.split("" "");
		with(Outputs)
		{
			SetProperty(""OutputDate"", """");
		}
		
		vInputDateObj = new Date(vInputDateArr[0]);
		
		if (vOutputDateFormat == ""DD/MM/YYYY"")
			Clib.strftime(vTimeBuf1, ""%d/%m/%Y"", vInputDateObj);
		else if (vOutputDateFormat == ""DD-MM-YYYY"")
			Clib.strftime(vTimeBuf1, ""%d-%m-%Y"", vInputDateObj);
		else if (vOutputDateFormat == ""DD-MON-YYYY"")
			Clib.strftime(vTimeBuf1, ""%d-%b-%Y"", vInputDateObj);
		else if (vOutputDateFormat == ""DD/MON/YYYY"")
			Clib.strftime(vTimeBuf1, ""%d/%b/%Y"", vInputDateObj);
		else if (vOutputDateFormat == ""YYYY/MM/DD"")
			Clib.strftime(vTimeBuf1, ""%Y/%m/%d"", vInputDateObj);
		else if (vOutputDateFormat == ""YYYYMMDD"")
			Clib.strftime(vTimeBuf1, ""%Y%m/%d"", vInputDateObj);
		else if (vOutputDateFormat == ""DD-MM"")
			Clib.strftime(vTimeBuf1, ""%d-%m"", vInputDateObj);
		else if (vOutputDateFormat == ""DD/MM"")
			Clib.strftime(vTimeBuf1, ""%d/%m"", vInputDateObj);
		else if (vOutputDateFormat == ""DD-MON"")
			Clib.strftime(vTimeBuf1, ""%d-%b"", vInputDateObj);
		else
			Clib.strftime(vTimeBuf1, ""%m/%d/%Y"", vInputDateObj);
		
		if (vInputDateArr.length == 2)
			vOutputDate = (vTimeBuf1.toString()).toUpperCase() +"" ""+ vInputDateArr[1];
		else
			vOutputDate = (vTimeBuf1.toString()).toUpperCase();
	}
	
	with (Outputs)
	{
		SetProperty(""OutputDate"", vOutputDate);
	}//end of with (Outputs)

return CancelOperation;
}
"/*  
---------------+------+--------+----------------------------------------------  
Date(YYYYMMDD) | Ver  | By     | Description   
---------------+------+--------+----------------------------------------------  
20120712       | 1.0  | Chiranjeevi| business Service to calculate contract end date 
 
---------------+------+--------+----------------------------------------------  
*/  
  
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)  
{  
 
switch(MethodName)  
   { 
	   case ""CheckContract"": 
	   		fnStampContract(Inputs, Outputs);  
	    	return (CancelOperation);  
	   		break; 
	  case ""CalcPenlty"": 
	  		fnCalcPenalty(Inputs, Outputs);  
	      	return (CancelOperation);   
	   		break; 
	case ""ChekPenaltyProd"": 
	  		fnChekPenaltyProd(Inputs, Outputs);  
	      	return (CancelOperation);   
	   		break;
	case ""CalcDatacomPenalty"": 
	  		fn_CalcDatacomPenalty(Inputs, Outputs);  
	      	return (CancelOperation);   
	   		break; 
	      
	 case ""CheckDatacomPenaltyProd"":
	 		fn_CheckDatacomPenaltyProd(Inputs, Outputs);
	 		return (CancelOperation);   
	   		break;
	 
	default: 
	     break; 
    
    
   } 
 
 
 
 return (ContinueOperation);  
}
"/* 
---------------+------+--------+---------------------------------------------- 
Date(YYYYMMDD) | Ver  | By     | Description  
---------------+------+--------+---------------------------------------------- 
20120712      |   1.0|   CP        Creation 
---------------+------+--------+---------------------------------------------- 
*/ 
function StringToDateFormat(strStartDt)
{
 
 var retDate; 
 var vFirstSlash = strStartDt.indexOf(""/"");
 var vSecondSlash = strStartDt.indexOf(""/"",vFirstSlash + 1);
 var vFirstSpace = strStartDt.indexOf("" "");
 var vFirstColon = strStartDt.indexOf("":"");
 var vSecondColon = strStartDt.indexOf("":"",vFirstColon + 1);
 var vSecondSpace = strStartDt.indexOf("" "",vFirstSpace + 1); 
 var vSecond = """";
 var vDay = strStartDt.substring(vFirstSlash + 1,vSecondSlash);
 var vMonth = ToNumber(strStartDt.substring(0,vFirstSlash));
 var vYear = strStartDt.substring(vSecondSlash + 1,vFirstSpace);
 var vHour = strStartDt.substring(vFirstSpace + 1,vFirstColon);
 var vMinute = strStartDt.substring(vFirstColon + 1,vSecondColon);
 if(vSecondSpace == ""-1"")
  vSecond = strStartDt.substring(vSecondColon + 1);
 else
  vSecond = strStartDt.substring(vSecondColon + 1,vSecondSpace);
 var strMonth = """";
 if(vMonth == 1)
 {
  strMonth = ""Jan"";
 }
 else if(vMonth == 2)
 {
  strMonth = ""Feb"";
 }
 else if(vMonth == 3)
 {
  strMonth = ""Mar"";
 }
 else if(vMonth == 4)
 {
  strMonth = ""Apr"";
 }
 else if(vMonth == 5)
 {
  strMonth = ""May"";
 }
 else if(vMonth == 6)
 {
  strMonth = ""Jun"";
 }
 else if(vMonth == 7)
 {
  strMonth = ""Jul"";
 }
 else if(vMonth == 8)
 {
  strMonth = ""Aug"";
 }
 else if(vMonth == 9)
 {
  strMonth = ""Sep"";
 }
 else if(vMonth == 10)
 {
  strMonth = ""Oct"";
 }
 else if(vMonth == 11)
 {
  strMonth = ""Nov"";
 }
 else if(vMonth == 12)
 {
  strMonth = ""Dec"";
 } 
 retDate = strMonth+"" ""+vDay+"" ""+vYear+"" ""+vHour+"":""+vMinute+"":""+vSecond; 
 return retDate;
}
function  fnAddPenaltyProd(strPenaltyCharge,OrderId)
{
	try
	{
        var Appln = TheApplication();
        var boOrder = Appln.GetBusObject(""Order Entry (Sales)"");   
        var PdsService = Appln.GetService(""PDS Product Data Service"");
        var bcOrder = boOrder.GetBusComp(""Order Entry - Orders"");   
        var bcLineItms = boOrder.GetBusComp(""Order Entry - Line Items"");
        var bRecExist;
        var bRecExist2;
		var RootItemId;
		var strExpr;
		var ServiceAccountId, BillingAccountId;
 		with (bcOrder)   // with Order
        {   
	        ActivateField(""Order Header Id"");
	        ActivateField(""Product Id"");
	        ActivateField(""Billing Account Id"");
	        ActivateField(""Service Account Id"");
	        ActivateField(""STC Channel"");
	        SetViewMode(AllView);   
	        ClearToQuery();   
	        SetSearchSpec(""Id"", OrderId);   
	        ExecuteQuery(ForwardOnly);   
	        bRecExist = FirstRecord();   
	        if (bRecExist)   
	        {   
				BillingAccountId = GetFieldValue(""Billing Account Id"");
				ServiceAccountId = GetFieldValue(""Service Account Id"");
				var vInputs = Appln.NewPropertySet();
				var vOutputs = Appln.NewPropertySet();
				var TempName = Appln.InvokeMethod(""LookupValue"", ""STC_DATACOMM_PACKAGE"", ""Datacom Terminated Product"");
				vInputs.SetProperty(""Doc Id"", OrderId);
				vInputs.SetProperty(""Template Search Spec"", ""[Name] = '"" + TempName + ""'"");
				PdsService.InvokeMethod(""AddFavoriteToOrder"", vInputs, vOutputs); 
				
				with(bcLineItms)    
	         	{  
      				ActivateField(""Product Type"");
    				strExpr = "" [Order Header Id] = '""+ OrderId +""'""  + ""AND [Product Type] = 'Package'"";   
				    SetSearchExpr(strExpr);   
				    ExecuteQuery(ForwardOnly);   
				    bRecExist2 = FirstRecord();        
					if(bRecExist2)
					{
						RootItemId = GetFieldValue(""Id"");
					}
				}//with(bcLineItms)   
				                
				with(bcLineItms)   
				{  
					ActivateField(""Product"");
					ActivateField(""Net Price"");
					ActivateField(""Unit Price"");
					ActivateField(""Stored Extended Price"");
					ActivateField(""Parent Order Item Id"");
					ActivateField(""Root Order Item Id"");
					ActivateField(""Pricing Adjustment Amount"");
					ActivateField(""Header Discount Amount"");
					ActivateField(""Billing Account Id"");
	        		ActivateField(""Service Account Id"");
					strExpr = "" [Order Header Id] = '""+ OrderId +""'""  + ""AND [Product] = '"" + TempName + ""'"";   
				    SetSearchExpr(strExpr);   
				    ExecuteQuery(ForwardOnly);   
				    bRecExist2 = FirstRecord();        
					if(bRecExist2)
					{
						 SetFieldValue(""Parent Order Item Id"", RootItemId); 
				         SetFieldValue(""Root Order Item Id"", RootItemId); 
						 SetFieldValue(""Billing Account Id"", BillingAccountId);
						 SetFieldValue(""Service Account Id"", ServiceAccountId);
				         SetFieldValue(""Net Price"", strPenaltyCharge);
				         SetFieldValue(""Unit Price"", strPenaltyCharge);
				         SetFieldValue(""Stored Extended Price"", strPenaltyCharge);
				         WriteRecord();
				    }
				}//with(bcLineItms)
				SetFieldValue(""STC Channel"", ""FCA"");
				WriteRecord();   
			}//if
		}// with order
	}
	catch(e)
	{
		throw(e);
	}     
	finally
	{
		bcLineItms = null;
		bcOrder = null;
		boOrder = null;
		PdsService = null;
		Appln = null;
	}   
	return (CancelOperation);
}
function  fnAddPenaltyProd_Old(strPenaltyCharge,OrderId)
{
        var boOrder = TheApplication().GetBusObject(""Order Entry (Sales)"");   
        var bcOrder = boOrder.GetBusComp(""Order Entry - Orders"");   
        var bcLineItms = boOrder.GetBusComp(""Order Entry - Line Items"");
        var bRecExist;
        var  bRecExist2;
var RootItemId;
var strExpr;
 with (bcOrder)   
         {   
        
        ActivateField(""Order Header Id"");
        ActivateField(""Product Id"");
        SetViewMode(AllView);   
        ClearToQuery();   
        SetSearchSpec(""Id"", OrderId);   
        ExecuteQuery(ForwardOnly);   
        bRecExist = FirstRecord();   
        if (bRecExist)   
          {   

with(bcLineItms)   
         {  
      
    strExpr = "" [Order Header Id] = '""+ OrderId +""'""  + ""AND [Product Type] = 'Package'"";   
      SetSearchExpr(strExpr);   
      ExecuteQuery(ForwardOnly);   
      bRecExist2 = FirstRecord();        
if(bRecExist2)
{
RootItemId = GetFieldValue(""Id"");
}
}//with(bcLineItms)   
                
         with(bcLineItms)   
         {  
         NewRecord(NewAfter);
         SetFieldValue(""Order Header Id"",OrderId);
         SetFieldValue(""Product Id"",TheApplication().InvokeMethod(""LookupValue"",""STC_DATACOMM_PACKAGE"",""PENALTY""));
       //SetFieldValue(""Product Id"",'1-7NFUFR');
         SetFieldValue(""Product"",""VIVA Termination Penalty"");
        
         //SetFieldValue(""Cfg Type"",""eConfigurator"");
         SetFieldValue(""Net Price"",strPenaltyCharge);
         SetFieldValue(""Parent Order Item Id"",RootItemId); 
         SetFieldValue(""Root Order Item Id"",RootItemId); 
         WriteRecord();
}//with(bcLineItms)   
}
}//
         
}
function fnCalcPenalty(Inputs, Outputs)  
{
/* 
---------------+------+--------+---------------------------------------------- 
Date(YYYYMMDD) | Ver  | By     | Description  
---------------+------+--------+---------------------------------------------- 
20120717      |   1.0|   CP        Creation 
---------------+------+--------+---------------------------------------------- 
*/ 
	try   
    { 
       
        var boSrvAcnt = TheApplication().GetBusObject(""STC Service Account"");
        var bcSrvAcnt = boSrvAcnt.GetBusComp(""CUT Service Sub Accounts"");
        var bcAsset = boSrvAcnt.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
        var bcAssetXA =boSrvAcnt.GetBusComp(""Asset Mgmt - Asset XA"");  
        var OrderId = Inputs.GetProperty(""Order Id"");
        var strServiceId = Inputs.GetProperty(""ServiceId"");
        var bRecExist; 
        var bRecExist1;
        var strExpr;
        var strLineId;
        var strRootId;   
        var strOrderId = Inputs.GetProperty(""Order Id""); 
        var strOrderType = Inputs.GetProperty(""Order Type""); 
        var bsLovs;
        var psInputs; 
        var psOutputs; 
        var vTermLength;
        var strProdName;
        var strStartDt;
        var strEndDt;
        var strCurrentDt;
        var bRecExist2;
        var strAttrName;
        var strMrcTot;
        var strPerdayMRC;
        var strPenaltyCharge;
        var bRecExist3;

        with (bcSrvAcnt)   
         {   
	        //ActivateField(""STC Profile Type"");
	        SetViewMode(AllView);   
	        ClearToQuery();   
	        SetSearchSpec(""Id"", strServiceId);   
	        ExecuteQuery(ForwardOnly);   
	        bRecExist = FirstRecord(); 

        	if (bRecExist)   
          	{   
                var strProfile = GetFieldValue(""STC Profile Type"");

				if(strProfile == 'Datacom')
				{
			    	with(bcAsset)   
			        {  
						ActivateField(""Service Account Id"");   
					    ActivateField(""Status"");   
					    ActivateField(""Product Type"");
					    ActivateField(""STC MRCTotal"");
						ActivateField(""STC Product Type"");
					    ActivateField(""Id"");
					
					   	SetViewMode(AllView);   
					    ClearToQuery();  
     					strExpr = "" [Service Account Id] = '""+ strServiceId +""'""  + ""AND [STC Product Type] = 'Package' AND [Status] = 'Active'""; 
      					SetSearchExpr(strExpr);
      					ExecuteQuery(ForwardOnly);
      					bRecExist1 = FirstRecord();   

      					if(bRecExist1)   
       					{         
      						strMrcTot = GetFieldValue(""STC MRCTotal"");

      						//strExpr = "" [Service Account Id] = '""+ strServiceId +""'""  + ""AND [STC Product Type] = 'Service Point' AND [Status] = 'Active'"";
							strExpr = ""[Service Account Id]='""+ strServiceId +""' AND ([STC Plan Type]='MainContract') AND [Status]='Active'"";
						    SetSearchExpr(strExpr);   
						    ExecuteQuery(ForwardOnly);   
						    bRecExist1 = FirstRecord();

 							if(bRecExist1)   
							{
								var strAssetId = GetFieldValue(""Id"");
 								with(bcAssetXA)   
         						{  
      								ActivateField(""Object Id"");   
      								ActivateField(""Name"");   
     								ActivateField(""Value""); 
      								SetViewMode(AllView);   
      								ClearToQuery();      
      								SetSearchExpr(""[Object Id] = '"" + strAssetId + ""' AND ( [Name] = 'End Date' OR [Name] = 'Start Date' )"");
      								ExecuteQuery(ForwardOnly);   
      								bRecExist2 = FirstRecord(); 
      								bRecExist3 = FirstRecord();
      								while(bRecExist2)
      								{
      									if( GetFieldValue(""Name"") == ""Start Date"")
      										strStartDt = GetFieldValue(""Value"");
      									else
      										strEndDt = GetFieldValue(""Value"");
      										
      									bRecExist2 = NextRecord();
      								}
           							if( bRecExist3 )
                        			{
                      					// Set Date Object //
                       					strCurrentDt = new Date;
                       					strEndDt 	 = new Date(strEndDt);
                       					strStartDt 	 = new Date(strStartDt); 	
                       					// Set time to 00:00:00 hrs // 
										strCurrentDt = new Date(strCurrentDt.setHours(0,0,0)); 
										strEndDt	 = new Date(strEndDt.setHours(0,0,0));
										strStartDt	 = new Date(strStartDt.setHours(0,0,0));
										// Set Date to 1st of the month //
			                       		strCurrentDt = ToNumber(strCurrentDt.setDate(1));
			                       		strEndDt 	 = ToNumber(strEndDt.setDate(1));	
			                       		strStartDt 	 = ToNumber(strStartDt.setDate(1)); 
                       					
                       					if( strEndDt > strCurrentDt ) 
                       					{	
                       						var MonthOfTenure:Number = Math.floor((strEndDt-strStartDt)/(1000*60*60*24*30));
                       						var MonthOfUse:Number	 = Math.floor((strCurrentDt-strStartDt)/(1000*60*60*24*30));
                       						var strMonthDiff:Number  = MonthOfTenure-MonthOfUse;
                       						strPenaltyCharge = strMonthDiff * (ToNumber(strMrcTot));
                      						Outputs.SetProperty(""TotCharge"",strPenaltyCharge);
                      						fnAddPenaltyProd(strPenaltyCharge, OrderId);
                      					}
                                 	}//if( bRecExist3)
      							}// with(bcAssetXA) 
							}// if(bRecExist1)  
      					}  //  if(bRecExist1) 
					}// with(bcAsset)
     			}//if(strProfile == 'Datacom')   
  			} //if (bRecExist)   
 		} //with (bcSrvAcnt)   
	}//try   
 	catch (e)   
 	{   
		throw(e.toString());   
 	}   
 	finally   
 	{   
		bcAssetXA = null;
		bcAsset = null;
		bcSrvAcnt = null;
		boSrvAcnt = null;
	}   
	return (CancelOperation);
}
"/* 
---------------+------+--------+---------------------------------------------- 
Date(YYYYMMDD) | Ver  | By     | Description  
---------------+------+--------+---------------------------------------------- 
20120717      |   1.0|   CP        Creation 
---------------+------+--------+---------------------------------------------- 
*/ 
function fnCalcPenalty_old(Inputs, Outputs)  
{   
       
        var boSrvAcnt = TheApplication().GetBusObject(""STC Service Account"");
        var bcSrvAcnt = boSrvAcnt.GetBusComp(""CUT Service Sub Accounts"");
        var bcAsset = boSrvAcnt.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
        var bcAssetXA =boSrvAcnt.GetBusComp(""Asset Mgmt - Asset XA"");  
         var OrderId = Inputs.GetProperty(""Order Id"");
        var strServiceId = Inputs.GetProperty(""ServiceId"");
        var bRecExist; 
        var bRecExist1;
        var strExpr;
        var strLineId;
        var strRootId;   
        var strOrderId = Inputs.GetProperty(""Order Id""); 
        var strOrderType = Inputs.GetProperty(""Order Type""); 
        var bsLovs;
        var psInputs; 
        var psOutputs; 
        var vTermLength;
        var strProdName;
        var strStartDt;
        var strEndDt;
        var bRecExist2;
        var strAttrName;
        var strMrcTot;
        var strPerdayMRC;
        var strPenaltyCharge;
        var bRecExist3;
  

 try   
    {   

    
        with (bcSrvAcnt)   
         {   
        //ActivateField(""STC Profile Type"");
        SetViewMode(AllView);   
        ClearToQuery();   
        SetSearchSpec(""Id"", strServiceId);   
        ExecuteQuery(ForwardOnly);   
        bRecExist = FirstRecord(); 

        if (bRecExist)   
          {   
                var strProfile = GetFieldValue(""STC Profile Type"");


if(strProfile == 'Datacom')
{


         with(bcAsset)   
         {  
      
      ActivateField(""Service Account Id"");   
      ActivateField(""Status"");   
      ActivateField(""Product Type"");
      ActivateField(""STC MRCTotal"");
ActivateField(""STC Product Type"");
      ActivateField(""Id"");

      SetViewMode(AllView);   
      ClearToQuery();  
     strExpr = "" [Service Account Id] = '""+ strServiceId +""'""  + ""AND [STC Product Type] = 'Package' AND [Status] = 'Active'""; 
       //strExpr = "" [Service Account Id] = '""+ strServiceId +""'""  + ""AND [Status] = 'Active'""; 
      SetSearchExpr(strExpr);
      ExecuteQuery(ForwardOnly);
      bRecExist1 = FirstRecord();   

      if(bRecExist1)   
       {         
      strMrcTot = GetFieldValue(""STC MRCTotal"");
 
      strExpr = "" [Service Account Id] = '""+ strServiceId +""'""  + ""AND [STC Product Type] = 'Service Point' AND [Status] = 'Active'"";
// strExpr = "" [Service Account Id] = '""+ strServiceId +""'""  + ""AND [Status] = 'Active'"";    
      SetSearchExpr(strExpr);   
      ExecuteQuery(ForwardOnly);   
      bRecExist1 = FirstRecord();

 if(bRecExist1)   
{
var strAssetId = GetFieldValue(""Id"");

  
 with(bcAssetXA)   
         {  
      
      ActivateField(""Object Id"");   
      ActivateField(""Name"");   
     ActivateField(""Value""); 
      SetViewMode(AllView);   
      ClearToQuery();   
      SetSearchSpec(""Object Id"", strAssetId);
      SetSearchSpec(""Name"", ""End Date"");    
      ExecuteQuery(ForwardOnly);   
      bRecExist2 = FirstRecord();   
      
           if( bRecExist2)
                        {
    
                       strEndDt = GetFieldValue(""Value"");
// TheApplication().RaiseErrorText(strEndDt); 
                      //calcpenalty charges
                       var CurrentDate = new Date; 
                           CurrentDate = ToNumber(CurrentDate.getTime());
                       strEndDt =  new Date(strEndDt);
                       strEndDt = ToNumber(strEndDt.getTime());
                       var strtimediff = strEndDt-CurrentDate;
                       var strDays = strtimediff/86400000;
                       strDays = Math.round(strDays);
                       strPerdayMRC = (12* strMrcTot)/ 365;
                       strPenaltyCharge = strDays * strPerdayMRC;
                      Outputs.SetProperty(""TotCharge"",strPenaltyCharge)
                      fnAddPenaltyProd(strPenaltyCharge,OrderId);
                                       }//if( bRecExist2)

      }// with(bcAssetXA) 
}// if(bRecExist1)  
      }  //  if(bRecExist1) 
}// with(bcAsset)
     }//if(strProfile == 'Datacom')   
  } //if (bRecExist)   
 } //with (bcSrvAcnt)   


 

  
   }//try   
    catch (e)   
 {   
throw(e.toString());   
 }   
 finally   
 {   
// bcLineItms = null;
// bcOrder = null;
// boOrder = null;
 }   
}
"/*  
---------------+------+--------+----------------------------------------------  
Date(YYYYMMDD) | Ver  | By     | Description   
---------------+------+--------+----------------------------------------------  
25120712      |   1.0|   CP        Creation  
---------------+------+--------+----------------------------------------------  
*/  
function fnChekPenaltyProd(Inputs, Outputs)   
{    
        var boOrder = TheApplication().GetBusObject(""Order Entry (Sales)"");    
        var bcOrder = boOrder.GetBusComp(""Order Entry - Orders"");    
        var bcLineItms = boOrder.GetBusComp(""Order Entry - Line Items""); 
     
        var bRecExist;  
        var bRecExist1; 
        var strExpr; 
        var strLineId; 
        var strRootId;    
        var strOrderId = Inputs.GetProperty(""OrderId"");  
        var strOrderType = Inputs.GetProperty(""OrderType""); 
        var strProdFlag = ""N""; 
     try    
    {    
      //Query for Line Items    
        if (strOrderType == ""Modify"") 
        { 
        with (bcOrder)    
         {    
         ActivateField(""Order Date"");   
        SetViewMode(AllView);    
        ClearToQuery();    
        SetSearchSpec(""Id"", strOrderId);    
        ExecuteQuery(ForwardOnly);    
        bRecExist = FirstRecord();    
        if (bRecExist)    
          {    
                  
         with(bcLineItms)    
         {   
       
      ActivateField(""Order Header Id"");    
      ActivateField(""Parent Order Item Id"");    
      ActivateField(""Product"");  
      ActivateField(""Status"");    
      ActivateField(""Part Number"");   
       
      SetViewMode(AllView);    
      ClearToQuery();    
      strExpr = "" [Order Header Id] = '""+ strOrderId +""'""  + ""AND [Part Number] = 'VIVADATAPEN' AND [Action Code] = 'Add'"";    
      SetSearchExpr(strExpr);    
      ExecuteQuery(ForwardOnly);    
      bRecExist1 = FirstRecord();    
  
      if(bRecExist1)    
       {  
       strProdFlag = ""Y""; 
      TheApplication().SetProfileAttr(""ProductFlg"",strProdFlag);      
     
       } // if(bRecExist1) 
       else
       {
       TheApplication().SetProfileAttr(""ProductFlg"",strProdFlag);
       } 
     
     }//with(bcLineItms)      
  } //if (bRecExist)     
 } //with (bcOrder)  
  
 }// if (strOrderType == ""Modify"") 
  
 else 
  
 { 
 //Do Nothing 
 } 
   
   }//try    
    catch (e)    
 {    
throw(e.toString());    
 }
 finally    
 {    
 bcLineItms = null; 
 bcOrder = null; 
 boOrder = null; 
 }  

}
"/*  
---------------+------+--------+----------------------------------------------  
Date(YYYYMMDD) | Ver  | By     | Description   
---------------+------+--------+----------------------------------------------  
20120712      |   1.0|   CP        Creation  
---------------+------+--------+----------------------------------------------  
*/  
function fnStampContract(Inputs, Outputs)   
{    
        var boOrder = TheApplication().GetBusObject(""Order Entry (Sales)"");    
        var bcOrder = boOrder.GetBusComp(""Order Entry - Orders"");    
        var bcLineItms = boOrder.GetBusComp(""Order Entry - Line Items""); 
        var bcLineXA = boOrder.GetBusComp(""Order Item XA"");    
        var OrderId = Inputs.GetProperty(""Order Id""); 
        var bRecExist;  
        var bRecExist1; 
        var strExpr; 
        var strLineId; 
        var strRootId;    
        var strOrderId = Inputs.GetProperty(""Order Id"");  
        var strOrderType = Inputs.GetProperty(""Order Type"");  
        var bsLovs; 
        var psInputs;  
        var psOutputs;  
        var vTermLength; 
        var strProdName; 
        var strStartDt; 
        var strEndDt; 
        var bRecExist2; 
        var strAttrName;
 
 try    
    {    
      //Query for Line Items    
        if (strOrderType == ""Provide"" || strOrderType == ""Modify"") 
        { 
        with (bcOrder)    
         {    
         ActivateField(""Order Date"");   
        SetViewMode(AllView);    
        ClearToQuery();    
        SetSearchSpec(""Id"", strOrderId);    
        ExecuteQuery(ForwardOnly);    
        bRecExist = FirstRecord();    
        if (bRecExist)    
          {    
                  strStartDt = GetFieldValue(""Order Date""); 
         with(bcLineItms)    
         {   
       
      ActivateField(""Order Header Id"");    
      ActivateField(""Parent Order Item Id"");    
      ActivateField(""Part Number"");  
      ActivateField(""Status"");    
      ActivateField(""Product Type"");
      ActivateField(""Part Number""); //NehaK 18/11/2013 IPBX Changes 
       
      SetViewMode(AllView);    
      ClearToQuery();    
      //strExpr = "" [Order Header Id] = '""+ strOrderId +""'""  + ""AND ([Product Type] = 'Service Point' OR [Part Number] LIKE 'VOIPEQUIP*') AND [Action Code] = 'Add'"";     //NehaK 18/11/2013 IPBX Changes
      strExpr = ""[Order Header Id] = '""+strOrderId+""' AND ([STC Plan Type] = 'MainContract' OR [Product Type] = 'Service Point' OR [Part Number] LIKE 'VOIPEQUIP*') AND [Action Code] = 'Add'"";
	  SetSearchExpr(strExpr);    
      ExecuteQuery(ForwardOnly);    
      bRecExist1 = FirstRecord();    
  
      if(bRecExist1)    
       {          
       while(bRecExist1)
       {
       strLineId = GetFieldValue(""Id"");    
       strRootId = GetFieldValue(""Root Order Item Id""); 
       strProdName = GetFieldValue(""Part Number""); 
 	   var strTruncProdName =  strProdName.substring(0,9); //NehaK 18/11/2013 IPBX Changes
      
		if(strTruncProdName == ""VOIPEQUIP"")     //NehaK 18/11/2013 IPBX Changes 
		strProdName=strProdName.substring(0,11); //NehaK 18/11/2013 IPBX Changes
      
//TheApplication().RaiseErrorText(CurrentDate); 
 
       bsLovs = TheApplication().GetService(""STC Get LOV Values""); 
       psInputs = TheApplication().NewPropertySet(); 
       psOutputs = TheApplication().NewPropertySet(); 
       psInputs.SetProperty(""LOV Field"", ""Value"");  
       psInputs.SetProperty(""LOV Value"", strProdName); 
       psInputs.SetProperty(""LOV Type"", ""STC_CONTRACT_TYPE""); 
       bsLovs.InvokeMethod(""GetLovValues"", psInputs, psOutputs); 
       vTermLength = ToNumber(psOutputs.GetProperty(""Description""));   
      
       strEndDt = fnUpdateContract(Inputs,Outputs,strStartDt,vTermLength);  
 
 
       with(bcLineXA)    
         {   
       
      ActivateField(""Object Id"");    
      ActivateField(""Name"");    
      SetViewMode(AllView);    
      ClearToQuery();    
      SetSearchSpec(""Object Id"", strLineId);    
      ExecuteQuery(ForwardOnly);    
      bRecExist2 = FirstRecord();    
      var reccount = CountRecords(); 
 
      while(bRecExist2)    
       {          
      strAttrName = GetFieldValue(""Name""); 
 
      if(strAttrName == ""Start Date"") 
      { 
      SetFieldValue(""Value"",strStartDt); 
      WriteRecord(); 
      } 
         if(strAttrName == ""End Date"") 
      { 
      SetFieldValue(""Value"",strEndDt); 
      WriteRecord(); 
      } 
       bRecExist2 = NextRecord(); 
      } // while(bRecExist2)   
     }//with(bcLineXA)   
      bRecExist1 = NextRecord(); 
      }// while bRecExist1
      } // if(bRecExist1)   
     }//with(bcLineItms)      
  } //if (bRecExist)     
 } //with (bcOrder)  
  
 }// if (strOrderType == ""Provide"" || strOrderType == ""Modify"") 
  
 else 
  
 { 
 //Do Nothing 
 } 
   
   }//try    
    catch (e)    
 {    
throw(e.toString());    
 }    
 finally    
 {    
 bcLineItms = null; 
 bcOrder = null; 
 boOrder = null; 
 }    
}
"/* 
---------------+------+--------+---------------------------------------------- 
Date(YYYYMMDD) | Ver  | By     | Description  
---------------+------+--------+---------------------------------------------- 
20120712      |   1.0|   CP        Creation 
---------------+------+--------+---------------------------------------------- 
*/ 
function fnUpdateContract(Inputs,Outputs,strStartDt,vTermLength)  
{ 

   
   
      
    var vAgreestartdate = """";  
    var aDate = """";  
    var aYear = """";  
    var aMonth = """";  
    var aDay ="""";  
    var anHour = """";  
    var anMins = """";  
    var anSecs = """";  
    var vendDate = """";  
    var vAgreeId ="""";  
    var aNewYear = """";  
    var aNewMonth = """";  
    var newmonth = """"; 
    var vstartdate1;
   
 try  
   {  
    
             vAgreestartdate = StringToDateFormat(strStartDt);
         
       vAgreestartdate = new Date(vAgreestartdate); 
//TheApplication().RaiseErrorText(vAgreestartdate);
          vstartdate1 = Clib.mktime(vAgreestartdate)*1000;         
       aDate = new Date();  
       aDate.setTime(vstartdate1);  
       aYear = aDate.getFullYear(aYear); 
          aMonth = aDate.getMonth() + 1;  
       aDay = aDate.getDate();  
       anHour = aDate.getHours();  
       anMins = aDate.getMinutes();  
       anSecs = aDate.getSeconds();  
       newmonth = aMonth + vTermLength;  
     
          if(newmonth > 12)  
          {  
      if(aMonth=='12')// code for dec month
     {
     if((newmonth%12)=='0')
     {
     aNewYear = ToInteger(newmonth/12)
     aYear = aYear + aNewYear;
     aYear = aYear - 1;
     aNewMonth = (newmonth%12);
     }//if (newmonth%12)=='0
     else
     {
           aNewYear = ToInteger(newmonth/12); 
           aYear = aYear + aNewYear;  
           aNewMonth = (newmonth%12);
     } //else
     }
     
     else
     {
           aNewYear = ToInteger(newmonth/12); 
           aYear = aYear + aNewYear;  
           aNewMonth = (newmonth%12);
     } 
     
     ////  code for december month
     if(aNewMonth=='0')
     {
     aMonth=12;
     }
       else
     {
           aMonth =  aNewMonth;  
     }
          }   //if newmonth > 12
          else  
          {  
           aMonth = newmonth;  
          }  
          if((aDay > 29) && (aMonth == 2) && ((aYear%4) == 0))  
          {  
            aDay = aDay - 29;  
            aMonth = aMonth + 1;  
          }  
         if((aDay > 28) && (aMonth == 2) && ((aYear%4)!= 0))  
         {  
            aDay = aDay - 28;  
            aMonth = aMonth + 1;  
         }     
          if((aDay > 30) && ((aMonth == 4) || (aMonth == 6) || (aMonth == 9) || (aMonth == 11)))  
         {  
           aDay = aDay - 30;  
           aMonth = aMonth + 1;  
         }   

    if (Clib.strlen(aMonth) == 1)
{
aMonth = '0'+ aMonth;
}
    if (Clib.strlen(aDay) == 1)
{
aDay = '0'+ aDay;
}
    if (Clib.strlen(anHour) == 1)
{
anHour = '0'+ anHour;
}
    if (Clib.strlen(anMins) == 1)
{
anMins = '0'+ anMins;
}
    if (Clib.strlen(anSecs) == 1)
{
anSecs = '0'+ anSecs;
}
          vendDate = aMonth + ""/"" + aDay + ""/"" + aYear +"" ""+anHour+"":""+anMins+"":""+anSecs; 
     
      
 
        
      }//end of try  
      
 catch(e)  
 { 
 throw(e.toString()); 
 }  
 finally  
 {  
    
 }    

 return vendDate;  
}
function fn_CalcDatacomPenalty(Inputs, Outputs)
{
	try
	{
		var Appln, boServAccnt, bcAsset, bcAssetXA;
		var inServAccntId=Inputs.GetProperty(""Service Account Id"");
		var outPenaltyAmt=0;
		var RemMonths=0;
		var bRecExist1, bRecExist2, strMrcTot=0, strExpr, strAssetId, strStartDt, strEndDt, strCurrentDt, CalcPenaltyCharge=""N"";
		
		Appln = TheApplication();
		boServAccnt = Appln.GetBusObject(""STC Service Account"");
		bcAsset= boServAccnt.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
		bcAssetXA=boServAccnt.GetBusComp(""Asset Mgmt - Asset XA"");
		with(bcAsset) //with 1
		{
			ActivateField(""Service Account Id"");   
			ActivateField(""Status"");   
			ActivateField(""Product Type"");
			ActivateField(""Adjusted List Price"");
			ActivateField(""STC Product Type"");
			ActivateField(""Id"");
			SetViewMode(AllView);   
			ClearToQuery();  
			SetSearchExpr(""[Service Account Id] = '""+inServAccntId+""' AND [Product Part Number] LIKE 'VIVADATACOM90MR*' AND [Status] = 'Active'"");
			ExecuteQuery(ForwardOnly);
			bRecExist1 = FirstRecord();
			if(bRecExist1) //if 1.1
			{
				strMrcTot = GetFieldValue(""Adjusted List Price"");
				//strExpr = "" [Service Account Id] = '""+ inServAccntId +""'""  + ""AND ([STC Product Type] = 'Service Point') AND [Status] = 'Active'"";
				strExpr = ""[Service Account Id]='""+inServAccntId+""' AND ([STC Plan Type]='MainContract') AND [Status]='Active'"";
				SetSearchExpr(strExpr);   
				ExecuteQuery(ForwardOnly);   
				bRecExist1 = FirstRecord();
				if(bRecExist1) //if 1.1.1
				{
					strAssetId = GetFieldValue(""Id"");
					with(bcAssetXA) //with 1.1.1.1
					{
						ActivateField(""Object Id"");   
						ActivateField(""Name"");   
						ActivateField(""Value""); 
						SetViewMode(AllView);   
						ClearToQuery();      
						SetSearchExpr(""[Object Id] = '""+strAssetId+""' AND ( [Name] = 'End Date' OR [Name] = 'Start Date' )"");
						ExecuteQuery(ForwardOnly);   
						bRecExist2 = FirstRecord(); 
						while(bRecExist2)
						{
							CalcPenaltyCharge = ""Y"";
							if( GetFieldValue(""Name"") == ""Start Date"")
								strStartDt = GetFieldValue(""Value"");
							else
								strEndDt = GetFieldValue(""Value"");

							bRecExist2 = NextRecord();
						}
						if( CalcPenaltyCharge == ""Y"" )
						{
							strCurrentDt = new Date;
							strEndDt 	 = new Date(strEndDt);
							strStartDt 	 = new Date(strStartDt);
							// Set time to 00:00:00 hrs // 
							strCurrentDt = new Date(strCurrentDt.setHours(0,0,0)); 
							strEndDt	 = new Date(strEndDt.setHours(0,0,0));
							strStartDt	 = new Date(strStartDt.setHours(0,0,0));
							// Set Date to 1st of the month //
							strCurrentDt = ToNumber(strCurrentDt.setDate(1));
							strEndDt 	 = ToNumber(strEndDt.setDate(1));	
							strStartDt 	 = ToNumber(strStartDt.setDate(1)); 

							if( strEndDt > strCurrentDt ) 
							{	
								var MonthOfTenure:Number = Math.floor((strEndDt-strStartDt)/(1000*60*60*24*30));
								var MonthOfUse:Number	 = Math.floor((strCurrentDt-strStartDt)/(1000*60*60*24*30));
								var strMonthDiff:Number  = MonthOfTenure-MonthOfUse;
								RemMonths = strMonthDiff;
								outPenaltyAmt = strMonthDiff * (ToNumber(strMrcTot));
							}
						}
					}//with 1.1.1.1
				}//if 1.1.1
			}//if 1.1
		} //with 1
	}// try
	catch(e)
	{
	}
	finally
	{
		Outputs.SetProperty(""Penalty Amount"", outPenaltyAmt);
		Outputs.SetProperty(""Tenure"", RemMonths);
		Appln=null, boServAccnt=null, bcAsset=null, bcAssetXA=null;
	}
	return (CancelOperation); 
}
function fn_CheckDatacomPenaltyProd(Inputs, Outputs)
{
	try
	{
		var objAppln, objOrderBusObj, objOrderItemBusComp;
		var strPenaltyProd;
		var strResultCode=""N"";
		var strOrderId = Inputs.GetProperty(""Order Id"");
		objAppln 		= TheApplication();
		objOrderBusObj	= objAppln.GetBusObject(""Order Entry (Sales)"");
		objOrderItemBusComp = objOrderBusObj.GetBusComp(""Order Entry - Line Items"");
		strPenaltyProd = objAppln.InvokeMethod(""LookupValue"", ""STC_DATACOMM_PACKAGE"", ""Datacom Terminated Product"");
		with( objOrderItemBusComp )
		{
			ActivateField(""Product"");
			ActivateField(""Order Header Id"");
			ActivateField(""Action Code"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Product"", strPenaltyProd);
			SetSearchSpec(""Action Code"", ""Add"");
			SetSearchSpec(""Order Header Id"", strOrderId);
			ExecuteQuery(ForwardOnly);
			if( FirstRecord() )
			{
				strResultCode = ""Y"";
			}
			
		}
	}
	catch(e)
	{
	}
	finally
	{
		Outputs.SetProperty(""ReturnCode"", strResultCode);
		objAppln = null;
		objOrderBusObj = null;
		objOrderItemBusComp = null;
	}
}
function AppendName(Inputs,Outputs)
{
  var AssetIntId="""";
  var ParAssetIntId ="""";
  var AssetName = """";
  var appObj;
  var AssetServiceType="""";
  var AssetServiceDesc="""";
  var sSerAccntId="""";
  var boAsset="""";
  var bcAsset="""";
  var sPlanName="""";
  var sAddonDevice="""";
  var sMainDevice="""";
  var sContractDuration="""";
  var sContractDurationType="""";
  var AppendName="""";
  var AssetIntegrationId="""";
  try
  {
   appObj = TheApplication();
   with(appObj)
   {
    boAsset = appObj.GetBusObject(""STC Asset Mgmt - Asset Thin BO"");
    bcAsset = boAsset.GetBusComp(""STC Asset Mgmt - Asset Thin"");
   }
   with(Inputs)
   {
    ParAssetIntId = GetProperty(""ParAssetIntId"");
   	AssetIntId = GetProperty(""AssetIntId"");
    AssetIntegrationId = GetProperty(""AssetIntegrationId"");
    AssetName = GetProperty(""AssetName"");
    AssetServiceType = GetProperty(""AssetServiceType"");
    sSerAccntId = GetProperty(""sSerAccntId"");
    AssetServiceDesc = GetProperty(""AssetServiceDesc"");
   }
	with(bcAsset)
	{
		if(AssetServiceType == ""MainContract"") //If Main Contract is present Get the Plan Name
		{
		ActivateField(""STC Service Length"");
		ActivateField(""STC Service length UOM"");
		ActivateField(""Product Name"");
		//ActivateField(""Root Integration Id"");
		ClearToQuery();
	   	SetSearchSpec(""Product Name"", AssetName);
	   	SetSearchSpec(""Status"", ""Active"");
	   	ExecuteQuery(ForwardOnly);
	    sContractDuration = GetFieldValue(""STC Service Length"");
	    sContractDurationType = GetFieldValue(""STC Service length UOM"");
	      	
		ActivateField(""Service Account Id"");
		ActivateField(""STC Plan Type"");
		ActivateField(""Product Name"");
		ClearToQuery();
		//SetSearchSpec(""Id"", ""ParAssetIntId"");
	   	SetSearchSpec(""STC Plan Type"", ""Service Plan"");
	   	SetSearchSpec(""Service Account Id"", sSerAccntId);
	   	SetSearchSpec(""Status"", ""Active"");
	   	ExecuteQuery(ForwardOnly);
	   	if(FirstRecord())
		   	{
		   	sPlanName = GetFieldValue(""Product Name"");
		   	AppendName = sPlanName + "" "" + sContractDuration + "" "" + sContractDurationType;
		   	Outputs.SetProperty(""AppendName"", AppendName);
		   	}
		   	else
		   	{
		   	Outputs.SetProperty(""AppendName"", AssetName);
		   	}
		}
		if(AssetServiceType == ""AddonContract"") //if AddonContract is there check for Device
		{
		ActivateField(""STC Service Length"");
		ActivateField(""STC Service length UOM"");
		ActivateField(""Parent Asset Id"");
		ActivateField(""Product Name"");
		//ActivateField(""Root Integration Id"");
		ClearToQuery();
	   	SetSearchSpec(""Product Name"", AssetName);
	   	SetSearchSpec(""Status"", ""Active"");
	   	ExecuteQuery(ForwardOnly);
	    sContractDuration = GetFieldValue(""STC Service Length"");
	    sContractDurationType = GetFieldValue(""STC Service length UOM"");
	    //ParAssetIntId = GetFieldValue(""Parent Asset Id"");
	    
		ActivateField(""Service Account Id"");// Query Parent of Contract for BB
		ActivateField(""Parent Asset Id"");
		ActivateField(""Product Name"");
		ClearToQuery();
	   	SetSearchSpec(""Service Account Id"", sSerAccntId);
	   	SetSearchSpec(""Id"", ParAssetIntId);
	   	SetSearchSpec(""Status"", ""Active"");
	   	ExecuteQuery(ForwardOnly);
	   	if(FirstRecord())// if AddonDevice Present
		   	{
		   	sAddonDevice = GetFieldValue(""Product Name"");
		   	AppendName = sAddonDevice + "" "" + sContractDuration + "" "" + sContractDurationType;
		   	Outputs.SetProperty(""AppendName"", AppendName);
		   	}
		   	else//if No AddonDevice Present
		   	{
		   	Outputs.SetProperty(""AppendName"", AssetName);
		   	}
		}
		if(AssetServiceDesc == ""MainContract"")// if MainDeviceContract Present Get the Device
		{
		ActivateField(""STC Service Length"");
		ActivateField(""STC Service length UOM"");
		ActivateField(""Product Name"");
		//ActivateField(""Root Integration Id"");
		ClearToQuery();
	   	SetSearchSpec(""Product Name"", AssetName);
	   	SetSearchSpec(""Status"", ""Active"");
	   	ExecuteQuery(ForwardOnly);
	    sContractDuration = GetFieldValue(""STC Service Length"");
	    sContractDurationType = GetFieldValue(""STC Service length UOM"");
	    
		ActivateField(""Service Account Id"");
		ActivateField(""STC Service Description"");
		ActivateField(""Product Name"");
		ClearToQuery();
	   	SetSearchSpec(""Id"", ParAssetIntId);
	   	SetSearchSpec(""Service Account Id"", sSerAccntId);
	   	SetSearchSpec(""Status"", ""Active"");
	   	ExecuteQuery(ForwardOnly);
	   	if(FirstRecord())
		   	{
		   	sMainDevice = GetFieldValue(""Product Name"");
		   	AppendName = sMainDevice + "" "" + sContractDuration;
		   	Outputs.SetProperty(""AppendName"", AppendName);
		   	}
		   	{
		   	Outputs.SetProperty(""AppendName"", AssetName);
		   	}
	}
		}
 }
 catch(e)
 {
  LogException(e);
 }
 finally
 {
  bcAsset = null;
  boAsset = null;
  appObj = null;
 }
}
function LogException(e)
{
 var appObj;
   var psInput;
   var psOutput;
   var bsErrorHandler; 
 try
  {
    appObj = TheApplication();
    with(appObj)
    {
     psInput = NewPropertySet();
     psOutput = NewPropertySet();
     bsErrorHandler = GetService(""STC Generic Error Handler"");
    }
    with(psInput)
    {
     SetProperty(""Error Code"", e.errCode);
     SetProperty(""Error Message"", e.errText);
     SetProperty(""Object Name"", ""STC Contract Name Modification BS"");
     SetProperty(""Object Type"", ""Buisness Service"");
    }
    bsErrorHandler.InvokeMethod(""Log Message"", psInput, psOutput);
  }
  catch(e)
  {
    // do nothing 
  }
  finally
  {
 
    bsErrorHandler = null;
    psOutput = null;
    psInput = null;
    appObj = null;
  }
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
try
 {
 if(MethodName == ""AppendName"")
 	{
		AppendName(Inputs,Outputs);
		return (CancelOperation);
	}
	  return (ContinueOperation);
 }
 catch(e)
 {
  LogException(e);
 }
 finally
 {
 }
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
  if(MethodName==""TermLen"")  
   { 
      fnTempTerm(Inputs, Outputs);  
      return (CancelOperation);  
    }
 return (ContinueOperation);
}
function fnTempTerm(Inputs,Outputs)  
{ 

   
   //Praveen TempSusPention//add one year.
      
    //var vAgreestartdate = """";  
    var aDate = """";  
    var aYear = """";  
    var aMonth = """";  
    var aDay ="""";  
    var anHour = """";  
    var anMins = """";  
    var anSecs = """";  
    var vendDate = """";  
    var vAgreeId ="""";  
    var aNewYear = """";  
    var aNewMonth = """";  
    var newmonth = """"; 
    var vstartdate1;
   
 try  
    {  
  
        var CurrentDate = Inputs.GetProperty(""CurrentDate"");  
        var TermLen = Inputs.GetProperty(""TermLen"");        
       aDate = new Date(CurrentDate);  
       //aDate.setTime(vstartdate1);  
       aYear = aDate.getFullYear(aYear); 
          aMonth = aDate.getMonth() + 1;  
       aDay = aDate.getDate();  
       anHour = aDate.getHours();  
       anMins = aDate.getMinutes();  
       anSecs = aDate.getSeconds();  
       newmonth = aMonth + ToNumber(TermLen);     
      if(newmonth > 12)  
      {  
      if(aMonth=='12')// code for dec month
     {
     if((newmonth%12)=='0')
     {
     aNewYear = ToInteger(newmonth/12)
     aYear = aYear + aNewYear;
     aYear = aYear - 1;
     aNewMonth = (newmonth%12);
     }//if (newmonth%12)=='0
     else
     {
      aNewYear = ToInteger(newmonth/12); 
      aYear = aYear + aNewYear;  
      aNewMonth = (newmonth%12);
     } //else
     }
     else
     {
  aNewYear = ToInteger(newmonth/12); 
  aYear = aYear + aNewYear;  
  aNewMonth = (newmonth%12);
     } 
     
     ////  code for december month
     if(aNewMonth=='0')
     {
     aMonth=12;
     }
       else
     {
           aMonth =  aNewMonth;  
     }
          }   //if newmonth > 12
          else  
          {  
           aMonth = newmonth;  
          }  
          if((aDay > 29) && (aMonth == 2) && ((aYear%4) == 0))  
          {  
            aDay = aDay - 29;  
            aMonth = aMonth + 1;  
          }  
         if((aDay > 28) && (aMonth == 2) && ((aYear%4)!= 0))  
         {  
            aDay = aDay - 28;  
            aMonth = aMonth + 1;  
         }     
          if((aDay > 30) && ((aMonth == 4) || (aMonth == 6) || (aMonth == 9) || (aMonth == 11)))  
         {  
           aDay = aDay - 30;  
           aMonth = aMonth + 1;  
         }   

    if (Clib.strlen(aMonth) == 1)
{
aMonth = '0'+ aMonth;
}
    if (Clib.strlen(aDay) == 1)
{
aDay = '0'+ aDay;
}
    if (Clib.strlen(anHour) == 1)
{
anHour = '0'+ anHour;
}
    if (Clib.strlen(anMins) == 1)
{
anMins = '0'+ anMins;
}
    if (Clib.strlen(anSecs) == 1)
{
anSecs = '0'+ anSecs;
}          
     
  if(aDay > 1)    
 {
 //vendDate = aMonth + ""/"" +""1""+ ""/"" + aYear +"" ""+anHour+"":""+anMins+"":""+anSecs; 
 vendDate = aMonth + ""/"" +""1""+ ""/"" + aYear;// +"" ""+anHour+"":""+anMins+"":""+anSecs;
 } 
 else 
 {
//vendDate = aMonth + ""/"" + aDay + ""/"" + aYear +"" ""+anHour+"":""+anMins+"":""+anSecs; 
 vendDate = aMonth + ""/"" + aDay + ""/"" + aYear;// +"" ""+anHour+"":""+anMins+"":""+anSecs; 
 }
Outputs.SetProperty(""TermLen"",vendDate);       
}//end of try  
      
 catch(e)  
 { 
 throw(e.toString()); 
 }  
 finally  
 {  
    
 }    

 return vendDate;  
}
function BuildSearchExpr(sInps,sOutps)
{
	var sAccountId = sInps.GetProperty(""sAccntId"");
	
	var sBOListOfValues = TheApplication().GetBusObject(""List Of Values"");
	var sBCListOfValues = sBOListOfValues.GetBusComp(""List Of Values"");
	var sConPlan = """";
	var sConPlanCnt = 0;
	var IsRecord = """";
	var sSearchExpr = """";
	var sSearchExpr1 = """";
	var sSearchExpr2 = """";
	
	sSearchExpr1 = ""[Service Account Id] = '"" + sAccountId + ""' AND [Status] = 'Active' AND"";	
	
	with(sBCListOfValues){
		ActivateField(""Value"");
		ClearToQuery();
		SetViewMode(AllView);
		SetSearchSpec(""Type"",""STC_CONTRACT_PLAN1"");
		ExecuteQuery(ForwardOnly);
		IsRecord = FirstRecord();
		sConPlanCnt = CountRecords();
		for(var i=0;i<sConPlanCnt;i++){			
			sConPlan = GetFieldValue(""Value"");
			if(i ==0)
				sSearchExpr2 = ""(([Product Part Number] LIKE '""+ sConPlan +""*'"";
			else
				sSearchExpr2 = sSearchExpr2 + "" OR [Product Part Number] LIKE '""+ sConPlan +""*'"";		
			
			IsRecord = NextRecord();
		}//endfor
	}//endwith
	
	sSearchExpr =  sSearchExpr1 + sSearchExpr2 + "") OR ([Product Part Number] = 'VIPPPPLAN5'))"";
	
	
	sOutps.SetProperty(""SearchExpr"",sSearchExpr);
		

	return CancelOperation;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	switch(MethodName)
	{
		case ""Contractual Validation"":
			 fnContractualValidation(Inputs, Outputs);
			 return (CancelOperation);
			 break;
		default:
   		     return (ContinueOperation);
 		     break;
	}
	
	return (CancelOperation);
}
function fnContractualValidation(Inputs, Outputs)
{
	var SetError;
	var SetErrorCode = ""0"";
	var sReason = """";
	var sSplitFlag = """";
	var sSplitAccntType = """";
	var sSplitAccntId = """";
	try
	{
	
		var appObj	  =  TheApplication();
		var ProdCode1 =  TheApplication().InvokeMethod(""LookupValue"",""STC_PRODUCT_TYPE"",""STC_CONTDUR"");
		var sAId 	  =  Inputs.GetProperty(""sAId"");//this.BusComp().GetFieldValue(""Service Account Id"");
		//var StrSearch =  ""[Service Account Id] = '"" + sAId + ""' AND [Status] = 'Active' AND (([Product Part Number] LIKE '"" + ProdCode1 + ""*') OR ([Product Part Number] = 'VIPPPPLAN5'))"";
		var assetBc	  =  appObj.GetBusObject(""STC Service Account"").GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
		var bcSA	  =  appObj.GetBusObject(""STC Service Account"").GetBusComp(""CUT Service Sub Accounts"");
		var result	  = false;
		
		var sInps = TheApplication().NewPropertySet();
		var sOutps = TheApplication().NewPropertySet();
		sInps.SetProperty(""sAccntId"",sAId);		
		BuildSearchExpr(sInps,sOutps);
		var StrSearch = sOutps.GetProperty(""SearchExpr"");
		
		bcSA.ActivateField(""STC Suspension Reason"");
		bcSA.ActivateField(""STC Split Billing Flag"");
		bcSA.ActivateField(""STC Split Account Id"");
		bcSA.ActivateField(""STC Split Account Type"");
		bcSA.ActivateField(""Id"");
		bcSA.ClearToQuery();
		bcSA.SetViewMode(AllView);
		bcSA.SetSearchSpec(""Id"",sAId);
		bcSA.ExecuteQuery(ForwardOnly);
		sReason =  bcSA.GetFieldValue(""STC Suspension Reason"");
		sSplitFlag = bcSA.GetFieldValue(""STC Split Billing Flag"");
		sSplitAccntType = bcSA.GetFieldValue(""STC Split Account Type"");
		sSplitAccntId = bcSA.GetFieldValue(""STC Split Account Id"");
		if(sSplitFlag == ""Y"" && sSplitAccntType == ""Personal"")
		{
			var sSplitInps = TheApplication().NewPropertySet();
			var sSplitOutps = TheApplication().NewPropertySet();
			sSplitInps.SetProperty(""sAccntId"",sSplitAccntId);
			BuildSearchExpr(sSplitInps,sSplitOutps);
			StrSearch = sSplitOutps.GetProperty(""SearchExpr"");
		}		
		if("""" != sReason)
		{
			SetError = ""This SR is only for contractual & Active lines"";
			SetErrorCode = ""1"";
		}
		else
		{
			with(assetBc)
			{	
				ClearToQuery();
				SetViewMode(AllView);
				SetSearchExpr(StrSearch);
				ExecuteQuery(ForwardOnly);
				if(!FirstRecord())
				{
					SetError = ""This SR is only for contractual & Active lines"";
					SetErrorCode = ""1"";
				//	appObj.RaiseError(""This SR is only for contractual lines"");//result = true;
				}
			}
		}
	}	
	
	catch(e)
	{
		throw(e);	
	}
	
	finally
	{
		 
		 Outputs.SetProperty(""SetError"", SetError);
		 Outputs.SetProperty(""SetErrorCode"", SetErrorCode);
		 appObj  = null;
		 assetBc = null;
	//	 return (result);
	}

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	var iReturn;
	
	try  
	{
		iReturn = ContinueOperation;
		switch (MethodName)
		{
			case ""ValidateCorporateCSR"":
			 	ValidateCorporateCSR(Inputs, Outputs);
				iReturn = CancelOperation;
				break;
							    								 
			default: 
				iReturn = ContinueOperation;
				
		} //switch
		
	} 
	catch (e)
	{	
		throw(e);	
	}
	return (iReturn);
}
function ValidateCorporateCSR(Inputs, Outputs)
{
//***********************************************************************************************************//
//Purpose: 1)To validate whether the current user(CSR) has the rights to modify the Corporate data
//Inputs: 
//Outputs: Will give an error message if the CSR is not authorised
//Author: Navin Rai
//Release: 
//Date: 20-Dec-2010
//*************************************************************************************************************//

	var appObj;
	var currLoginId;
	var foundCSR, foundCSRSubstr;
	
	try
	{
	appObj = TheApplication();
				
				with(appObj)
				{
					currLoginId = LoginName();	
				}		
			
				foundCSR = appObj.InvokeMethod(""LookupValue"",""STC_CORPORATE_CSRS"",currLoginId);
					
				foundCSRSubstr = foundCSR.substring(0,3);
					
				if(foundCSRSubstr != ""CSR"")
				{
					appObj.RaiseErrorText(""Sorry! You do not have the privilege to create the order"");
					return (CancelOperation);
				}
		}
	catch(e)
	{
		throw(e);
	}
	finally
	{
		appObj = null;
	}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	var iReturn;
	
	try  
	{
		iReturn = ContinueOperation;
		switch (MethodName)
		{
			case ""UpdateDunningStatus"":
			 	UpdateDunningStatus(Inputs, Outputs);
				iReturn = CancelOperation;
				break;
							    								 
			default: 
				iReturn = ContinueOperation;
				
		} //switch
		
	} 
	catch (e)
	{	
		throw(e);	
	}
	return (iReturn);
}
function UpdateDunningStatus(Inputs, Outputs)
{
	var billAccountId;
	var srId, dunningStatus;

	var boAccount, boBilling;
	var bcAccount, bcAccount2;
	
	var isRecord, isRecord1;
	var parAccountId;
	var currentBillId;
	
	var count=0, count1=0, acctId;
	
	try
	{
		billAccountId = Inputs.GetProperty(""BillingAccountId"");
		srId = Inputs.GetProperty(""SRId"");
		dunningStatus = Inputs.GetProperty(""DunningStatus"");
				
		boAccount = TheApplication().GetBusObject(""Account"");
		bcAccount = boAccount.GetBusComp(""Account"");	
		
		with(bcAccount)
		{

//Updating the Dunnnig status of Current BAN:
			SetViewMode(AllView);
			ActivateField(""Parent Account Id"");
			ActivateField(""Dunning Excluded"");
			ActivateField(""Tax ID Number"");
			//ActivateField(""Dunning Excluded Flag"");
			ClearToQuery();
			SetSearchSpec(""Id"", billAccountId);
			ExecuteQuery(ForwardOnly);
			isRecord = FirstRecord();
			//count = CountRecords();	
			if(isRecord)//1
			{
				//acctId = GetFieldValue(""Id"");
				SetFieldValue(""Dunning Excluded"", dunningStatus);
				WriteRecord();
			
			
//Updating the Dunnnig status of Parent CAN:
				parAccountId = GetFieldValue(""Parent Account Id"");
					SetViewMode(AllView);
					//ActivateField(""Id"");
					//ActivateField(""Dunning Excluded"");
					//ActivateField(""Dunning Excluded Flag"");
					ClearToQuery();
					SetSearchSpec(""Id"", parAccountId);
					ExecuteQuery(ForwardOnly);
					isRecord = FirstRecord();
					//count = CountRecords();	
					if(isRecord)
					{
						//acctId = GetFieldValue(""Id"");
						SetFieldValue(""Dunning Excluded"", dunningStatus);
						WriteRecord();
					}
			}//end of if(isRecord)//1	
						
//Updating the Dunnnig status of Child Dept BAN:				
			SetViewMode(AllView);
			//ActivateField(""Parent Account Id"");
			//ActivateField(""Dunning Excluded"");
			//ActivateField(""Dunning Excluded Flag"");
			ClearToQuery();
			SetSearchSpec(""Parent Account Id"", billAccountId);
			ExecuteQuery(ForwardOnly);
			isRecord = FirstRecord();	
			//count = CountRecords();
			
			boBilling = TheApplication().GetBusObject(""STC Billing Account"");
			bcAccount2 = boBilling.GetBusComp(""CUT Invoice Sub Accounts"");
			
			while (isRecord)
			{
				//acctId = GetFieldValue(""Id"");
				currentBillId = GetFieldValue(""Id"");
				SetFieldValue(""Dunning Excluded"", dunningStatus);
				WriteRecord();
				
			
//Updating the Dunnnig status of Child Emp BAN:
				
				with(bcAccount2)
				{					
					bcAccount2.SetViewMode(AllView);
					bcAccount2.ActivateField(""Parent Account Id"");
					bcAccount2.ActivateField(""Dunning Excluded"");
					//ActivateField(""Dunning Excluded Flag"");
					bcAccount2.ClearToQuery();
					bcAccount2.SetSearchSpec(""Parent Account Id"", currentBillId);
					bcAccount2.ExecuteQuery(ForwardOnly);
					isRecord1 = bcAccount2.FirstRecord();
					//count1 = bcAccount2.CountRecords();
					while (isRecord1)
					{
						//acctId = bcAccount2.GetFieldValue(""Id"");
						bcAccount2.SetFieldValue(""Dunning Excluded"", dunningStatus);
						bcAccount2.WriteRecord();
						isRecord1 = bcAccount2.NextRecord();
					}	
					
				}
				
				isRecord = bcAccount.NextRecord();
			}
		

		}
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
		bcAccount = null;
		bcAccount2 = null;
		boBilling = null;
		boAccount = null;
	}

		
}
function SIMMSISDNValidation(Inputs, Outputs)
{
var OrderId = Inputs.GetProperty(""OrderId"");
var AppObj = TheApplication();
var OrderBO = AppObj.GetBusObject(""Order Entry (Sales)"");
var OrderBC = OrderBO.GetBusComp(""Order Entry - Orders"");
var OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items"");
var PackageId;
var ErrMsg = """";
var SIMNum = """";
var MSISDNNum = """";
with(OrderBC)
{
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"",OrderId);
		ExecuteQuery(ForwardOnly);
		var OrderRec = FirstRecord();
		if(OrderRec)
		{	
					with(OrderLineBC)
					{
					ActivateField(""Order Header Id"");
					ActivateField(""Part Number"");
					ActivateField(""Parent Order Item Id"");					
					SetViewMode(AllView);
					ClearToQuery();
					var spec  = ""[Order Header Id] = '"" + OrderId + ""' AND [Part Number] = 'PLANCORPGPRS 1'"";
					SetSearchExpr(spec);
					ExecuteQuery(ForwardOnly);
					var isrec = FirstRecord();
						if(isrec)
						{
							PackageId = GetFieldValue(""Parent Order Item Id"");
								with(OrderLineBC)
								{
									ActivateField(""STC ICCID"");
									ActivateField(""Service Id"");
									SetViewMode(AllView);
									ClearToQuery();
									SetSearchSpec(""Id"",PackageId);
									ExecuteQuery(ForwardOnly);
									var OrderLineRec = FirstRecord();
									if(OrderLineRec)
									{
										SIMNum = GetFieldValue(""STC ICCID"");
										MSISDNNum = GetFieldValue(""Service Id"");
										
										if(SIMNum != """" || 	MSISDNNum != """")
										{
											ErrMsg = ""Please remove SIM/MSISDN for Dummy Corporate GPRS Plan or Cancel Order"";
											Outputs.SetProperty(""ErrorMsg"", ErrMsg);	
										}
										else
										{
											Outputs.SetProperty(""ErrorMsg"", ErrMsg);
										}
									}
								}
						}
					}
			
		}// end of OrderRec	
}

}
function STCDUMMYDELETE(Inputs, Outputs)
{
var OrderId = Inputs.GetProperty(""OrderId"");
var AppObj = TheApplication();
var OrderBO = AppObj.GetBusObject(""Order Entry (Sales)"");
var OrderBC = OrderBO.GetBusComp(""Order Entry - Orders"");
var OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items"");
var sOrderItemXA = OrderBO.GetBusComp(""Order Item XA"");
var APNValue;
var Error ="""";
var ProdName;
with(OrderBC)
{
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"",OrderId);
		ExecuteQuery(ForwardOnly);
		var OrderRec = FirstRecord();
		if(OrderRec)
		{	
					with(OrderLineBC)
					{
					ActivateField(""Order Header Id"");
					ActivateField(""Part Number"");
					ActivateField(""Parent Order Item Id"");					
					SetViewMode(AllView);
					ClearToQuery();
					var spec  = ""[Order Header Id] = '"" + OrderId + ""' AND [Part Number] = 'APN*' AND [Action Code] = 'Delete'"";
					SetSearchExpr(spec);
					ExecuteQuery(ForwardOnly);
					var isrec = FirstRecord();
						while(isrec)
						{
								var LineItemId = GetFieldValue(""Id"");
								with(sOrderItemXA)
								{
								var XAspec = ""[Object Id] = '"" + LineItemId + ""' AND  [Display Name] = 'APN_APNName'"";
								ActivateField(""Object Id"");
								ActivateField(""Name"");
								ActivateField(""Value"");
								SetViewMode(AllView);
								ClearToQuery();
								SetSearchExpr(XAspec);
								ExecuteQuery(ForwardOnly);
								var IsXARec = FirstRecord();
								if(IsXARec)
								{
								APNValue = GetFieldValue(""Value"");
								}
							}// end of with OrderItemXA
		var AssetXA = AppObj.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset XA"");
		var AssetBC = AppObj.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset"");
		with(AssetXA)
		{
			ActivateField(""Name"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Text Value"",APNValue);
			ExecuteQuery(ForwardOnly);
			var XARec = FirstRecord();
			while(XARec)
			{
				var AssetId = GetFieldValue(""Object Id"");
				with(AssetBC)
				{
						ActivateField(""Product Part Number"");
						SetViewMode(AllView);
						ClearToQuery();
						SetSearchSpec(""Asset Id"",AssetId);
						ExecuteQuery(ForwardOnly);
						var AssRec = FirstRecord();
						if(AssRec)
						{
							ProdName = GetFieldValue(""Product Part Number"");
							if(ProdName != ""APNPRIDYN"" || ProdName != ""APNPRISTAT"" || ProdName != ""APNPUBDYN"" || ProdName != ""APNPUBSTAT"" )
							{	
								AppObj.RaiseErrorText(""Please unsubscribe all the products using '"" +APNValue +""'on all the MSISDN’s under the corporate/organization hierarchy before unsubscribing to the APN product"");
							}
						}//if(AssRec)
				}//with(AssetBC)
				XARec = NextRecord();
			 
			}//while(XARec)
		}//with(AssetXA)
		isrec = NextRecord();
				
						}// end of isrec
					}// end of with OrderLine
			}// end of Orderrec
}// end of withOrderBC
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
 
    switch(MethodName)
     {
		case ""UpdateAPNOrdertoOrderXA"":
		UpdateAPNOrdertoOrderXA(Inputs, Outputs);
		return(CancelOperation);
		break;
		
		case ""TerminateDummyAPN"":
		TerminateDummyAPN(Inputs, Outputs);
		return(CancelOperation);
		break;
		
		case ""UpdateAPNBillAccId"":
		UpdateAPNBillAccId(Inputs, Outputs);
		return(CancelOperation);
		break;
	
		case ""STCDUMMYDELETE"":
		STCDUMMYDELETE(Inputs, Outputs);
		return(CancelOperation);
		break;
	
		case ""SIMMSISDNValidation"":
		SIMMSISDNValidation(Inputs, Outputs);
		return(CancelOperation);
		break;
 
     default:
          return (ContinueOperation);
       }
 
}
function TerminateDummyAPN(Inputs, Outputs)
{
var App = TheApplication();
var ProdName;
var APNName = Inputs.GetProperty(""APNName"");
var AssetXA = App.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset XA"");
var AssetBC = App.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset"");
with(AssetXA)
{
		ActivateField(""Name"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Text Value"",APNName);
		ExecuteQuery(ForwardOnly);
		var XARec = FirstRecord();
		while(XARec)
		{
			var AssetId = GetFieldValue(""Object Id"");
			with(AssetBC)
			{
				ActivateField(""Product Part Number"");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchSpec(""Asset Id"",AssetId);
				ExecuteQuery(ForwardOnly);
				var AssRec = FirstRecord();
				if(AssRec)
				{
					ProdName = GetFieldValue(""Product Part Number"");
					if(ProdName != ""CORPAPNS"")
					{	
					var Error = ""Please unsubscribe all the products using '"" +APNName +""'on all the MSISDN’s under the corporate/organization hierarchy before unsubscribing to the APN product"";
						Outputs.SetProperty(""ErrorMsg"", Error);	
					}
				}//if(AssRec)
			}//with(AssetBC)
		XARec = NextRecord();
		}//while(XARec)
	}//with(AssetXA)
}
function UpdateAPNBillAccId(Inputs, Outputs)
{
var OrderId = Inputs.GetProperty(""OrderId"");
var BillAccId;
var Custtype;
var ParBillAccId;
var OrderBC = TheApplication().GetBusObject(""Order Entry (Sales)"").GetBusComp(""Order Entry - Orders"");
var CUTInvBC = TheApplication().GetBusObject(""STC Billing Account"").GetBusComp(""CUT Invoice Sub Accounts"");

with(OrderBC)
{
	ActivateField(""STC APN Billing Account Id"");
	ActivateField(""Billing Account Id"");
	ActivateField(""STC Customer Type"");
	SetViewMode(AllView);
	ClearToQuery();
	SetSearchSpec(""Id"",OrderId);
	ExecuteQuery(ForwardOnly);
	var OrderRec = FirstRecord();
	if(OrderRec)
	{
		BillAccId = GetFieldValue(""Billing Account Id"");
			with(CUTInvBC)
			{
				ActivateField(""Parent Account Id"");
				ActivateField(""STCPlanName"");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchSpec(""Id"",BillAccId);
				ExecuteQuery(ForwardOnly);
				var BillRec = FirstRecord();
				if(BillRec)
				{
					SetFieldValue(""STCPlanName"",""CORPGPRS"");
					WriteRecord();
				}
			}

    	}
	}
}
function UpdateAPNOrdertoOrderXA(Inputs, Outputs)
{
var OrderId = Inputs.GetProperty(""OrderId"");
var AppObj = TheApplication();
var APNName;
var APNValue;
var APNTemplate;
var sBCLineItemId;
var CNTXValue;
var OrderBO = AppObj.GetBusObject(""Order Entry (Sales)"");
var OrderBC = OrderBO.GetBusComp(""Order Entry - Orders"");
var OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items"");
var sOrderItemXA = OrderBO.GetBusComp(""Order Item XA"");
with(OrderBC)
{
		ActivateField(""STC APN Name"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"",OrderId);
		ExecuteQuery(ForwardOnly);
		var OrderRec = FirstRecord();
		if(OrderRec)
		{
				APNName = GetFieldValue(""STC APN Name"");
				if(APNName != """" || APNName != null)
				{
				with(OrderLineBC)
				{
					SetViewMode(AllView);
					ActivateField(""Order Header Id"");
					ActivateField(""Part Number"");
					ClearToQuery();
					var spec  = ""[Order Header Id] = '"" + OrderId + ""' AND [Action Code] = 'Add' AND ([Part Number] = 'CORPAPNA1' OR  [Part Number] = 'CORPIPA1')"";
					SetSearchExpr(spec);
					
					ExecuteQuery(ForwardOnly);
					var isrec = FirstRecord();
					while(isrec)
					{
						sBCLineItemId = GetFieldValue(""Id"");
						var APNBC = AppObj.GetBusObject(""STC Billing Account"").GetBusComp(""STC APN Details"");
						with(APNBC)
						{
							ActivateField(""Apn Name"");
							ActivateField(""Apn Type"");
							ActivateField(""APN Template Id"");
							ActivateField(""APN Template Id"");
							SetViewMode(AllView);
							ClearToQuery();
							SetSearchSpec(""Apn Name"",APNName);
							ExecuteQuery(ForwardOnly);
							var isAPNRec = FirstRecord();
							if(isAPNRec)
							{
								APNValue = GetFieldValue(""Apn Type"");
								APNTemplate = GetFieldValue(""APN Template Id"");
								CNTXValue = GetFieldValue(""APN CNTX Id"");								
							}
						}
					with(sOrderItemXA)
					{
						var XAspec = ""[Object Id] = '"" + sBCLineItemId + ""'"";
						ActivateField(""Object Id"");
						ActivateField(""Name"");
						ActivateField(""Value"");
						SetViewMode(AllView);
						ClearToQuery();
						SetSearchExpr(XAspec);
						ExecuteQuery(ForwardOnly);
						var isRecord3 = FirstRecord();
						while(isRecord3)
						{
						var sName = GetFieldValue(""Name"");
						if( sName == 'APN_APNName')
						{
						SetFieldValue(""Value"", APNName);
						}
						if(sName == 'APN_APNTemplateID')
						{
						SetFieldValue(""Value"", APNTemplate);
						}
						if(sName == 'APN_APNType')
						{
						SetFieldValue(""Value"", APNValue);
						}
						
						if(sName == 'APN_CNTXID')
						{
						SetFieldValue(""Value"", CNTXValue);
						}
						
						
						WriteRecord();
						isRecord3 = NextRecord();
						}//End of while
					}// end of withsOrderItemXA	
					isrec = NextRecord();
					}
				}// end of with OrderLineBC
				}// if APN Name
		}
}// end of withOrderBC
}// end of function"
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
 
    switch(MethodName)
     {
		case ""UpdateAPNStatus"":
		UpdateAPNStatus(Inputs, Outputs);
		return(CancelOperation);
		break;
		
     default:
          return (ContinueOperation);
       }
 
}
function UpdateAPNStatus(Inputs, Outputs)
{
var OrderId = Inputs.GetProperty(""OrderId"");
var AppObj = TheApplication();
var OrderBO = AppObj.GetBusObject(""Order Entry (Sales)"");
var OrderBC = OrderBO.GetBusComp(""Order Entry - Orders"");
var OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items"");
var sOrderItemXA = OrderBO.GetBusComp(""Order Item XA"");
var billingacntBO = AppObj.GetBusObject(""STC Billing Account"");
var sAPN = billingacntBO.GetBusComp(""STC APN Details"");
var IsAPNRec;
var APNValue;
with(OrderBC)
{
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"",OrderId);
		ExecuteQuery(ForwardOnly);
		var OrderRec = FirstRecord();
		if(OrderRec)
		{	
					with(OrderLineBC)
					{
					ActivateField(""Order Header Id"");
					ActivateField(""Part Number"");
					ActivateField(""Action Code"");
					ActivateField(""Parent Order Item Id"");					
					SetViewMode(AllView);
					ClearToQuery();
					var spec  = ""[Order Header Id] = '"" + OrderId + ""' AND [Part Number] = 'CORPAPNS'"";
					SetSearchExpr(spec);
					ExecuteQuery(ForwardOnly);
					var isrec = FirstRecord();
						while(isrec)
						{
								var LineItemId = GetFieldValue(""Id"");
								var Action = GetFieldValue(""Action Code"");
									with(sOrderItemXA)
									{
										var XAspec = ""[Object Id] = '"" + LineItemId + ""' AND  [Display Name] = 'APN_APNName'"";
										ActivateField(""Object Id"");
										ActivateField(""Name"");
										ActivateField(""Value"");
										SetViewMode(AllView);
										ClearToQuery();
										SetSearchExpr(XAspec);
										ExecuteQuery(ForwardOnly);
										var IsXARec = FirstRecord();
										if(IsXARec)
										{
											APNValue = GetFieldValue(""Value"");
										}
								}// end of with OrderItemXA
							if(Action == ""Add"")
							{
								with(sAPN)
								{
									ActivateField(""Apn Name"");
									SetViewMode(AllView);
									ClearToQuery();
									SetSearchSpec(""Apn Name"",APNValue);
									ExecuteQuery(ForwardOnly);
									IsAPNRec = FirstRecord();
									if(IsAPNRec)
									{
										SetFieldValue(""Status"",""Active"");
									}
								}
							}
							else if(Action == ""Delete"")
							{
								with(sAPN)
								{
									ActivateField(""Apn Name"");
									SetViewMode(AllView);
									ClearToQuery();
									SetSearchSpec(""Apn Name"",APNValue);
									ExecuteQuery(ForwardOnly);
									IsAPNRec = FirstRecord();
									if(IsAPNRec)
									{
										SetFieldValue(""Status"",""InActive"");
									}
								}	
							}
							isrec = NextRecord();
						}// end of while(isrec)
					}// end of with(OrderLineBC)
			}// end of if(OrderRec)
		}// end of with(OrderBC)		
}//end of function"
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
 
    switch(MethodName)
     {
  case ""UpdateAPNStatus"":
  UpdateAPNStatus(Inputs, Outputs);
  return(CancelOperation);
  break;
  
     default:
          return (ContinueOperation);
       }
 
}
function UpdateAPNStatus(Inputs, Outputs)
{
var OrderId = Inputs.GetProperty(""OrderId"");
var AppObj = TheApplication();
var OrderBO = AppObj.GetBusObject(""Order Entry (Sales)"");
var OrderBC = OrderBO.GetBusComp(""Order Entry - Orders"");
var OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items"");
var sOrderItemXA = OrderBO.GetBusComp(""Order Item XA"");
var billingacntBO = AppObj.GetBusObject(""STC Billing Account"");
var sAPN = billingacntBO.GetBusComp(""STC APN Details"");
var IsAPNRec;
var APNValue;

with(OrderBC)
{
  SetViewMode(AllView);
  ClearToQuery();
  SetSearchSpec(""Id"",OrderId);
  ExecuteQuery(ForwardOnly);
  var OrderRec = FirstRecord();
  if(OrderRec)
  { 

     with(OrderLineBC)
     {
     ActivateField(""Order Header Id"");
     ActivateField(""Part Number"");
     ActivateField(""Action Code"");
     ActivateField(""Parent Order Item Id"");     
     SetViewMode(AllView);
     ClearToQuery();
     var spec  = ""[Order Header Id] = '"" + OrderId + ""' AND [Part Number] LIKE '*APN*'"";
     SetSearchExpr(spec);
     ExecuteQuery(ForwardOnly);
     var isrec = FirstRecord();
      while(isrec)
      {
        var LineItemId = GetFieldValue(""Id"");

        var Action = GetFieldValue(""Action Code"");
         with(sOrderItemXA)
         {

          var XAspec = ""[Object Id] = '"" + LineItemId + ""' AND  ([Display Name] = 'APN_APNName' OR [Display Name] = 'VIVA _APN_NAME')"";
          ActivateField(""Object Id"");
          ActivateField(""Name"");
          ActivateField(""Value"");
          SetViewMode(AllView);
          ClearToQuery();
          SetSearchExpr(XAspec);
          ExecuteQuery(ForwardOnly);
          var IsXARec = FirstRecord();
          if(IsXARec)
          {
           APNValue = GetFieldValue(""Value"");
          }
        }// end of with OrderItemXA
       if(Action == ""Add"")
       {
        with(sAPN)
        {
         ActivateField(""Apn Name"");
         SetViewMode(AllView);
         ClearToQuery();
         SetSearchSpec(""Apn Name"",APNValue);
         ExecuteQuery(ForwardOnly);
         IsAPNRec = FirstRecord();
         if(IsAPNRec)
         {
          SetFieldValue(""Status"",""Active"");
WriteRecord()
         }
        }
       }
       else if(Action == ""Delete"")
       {

        with(sAPN)
        {
         ActivateField(""Apn Name"");
         SetViewMode(AllView);
         ClearToQuery();
         SetSearchSpec(""Apn Name"",APNValue);
         ExecuteQuery(ForwardOnly);
         IsAPNRec = FirstRecord();
         if(IsAPNRec)
         {
          SetFieldValue(""Status"",""InActive"");
WriteRecord()
         }
        } 
       }
       isrec = NextRecord();
      }// end of while(isrec)
     }// end of with(OrderLineBC)
   }// end of if(OrderRec)
  }// end of with(OrderBC)  
}//end of function"
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
 
    switch(MethodName)
     {
  case ""SubmitCorpGPRS"":
  SubmitCorpGPRS(Inputs, Outputs);
  return(CancelOperation);
  break;
 
     default:
          return (ContinueOperation);
       }
 
}
function SubmitCorpGPRS(Inputs, Outputs)
{

 var appobj = TheApplication();
var OrderBO = appobj.GetBusObject(""Order Entry (Sales)"");
var CurrBC = OrderBO.GetBusComp(""Order Entry - Orders"");
 CurrBC.WriteRecord();
  var SerAccId;
  var sName;
  var sValue;
  var sTemplateId;
  var CNTXId;
  var SRCreated;
  var NoOfIP;
  var OrderId;
  var sOrderItemId;
  var sOrderItemXAId;
  var APNProdName;
  var TTStat;
  var TTOpenCnt = 0;
  var TTCreatedCnt = 0; 
  var IsTTRec;
  OrderId = Inputs.GetProperty(""Object Id"");
with(CurrBC)
{
  ActivateField(""STC Community Type"");
  
  SetViewMode(AllView);
  ClearToQuery();
  SetSearchSpec(""Id"",OrderId);
  ExecuteQuery(ForwardOnly);
  var OrderRec = FirstRecord();
  if(OrderRec)
  { 
 
 var AccType = GetFieldValue(""Order Account Type"");
 var BillAccName = GetFieldValue(""Billing Account"");
 var BillAddId = GetFieldValue(""Primary Account Address Id"");
 var CommType = GetFieldValue(""STC Community Type"");
 var CustAccId = GetFieldValue(""Customer Account Id"");
 var OrderSubType = GetFieldValue(""STC Order SubType"");
 var BillAccId = GetFieldValue(""Billing Account Id"");
 var PriConId = GetFieldValue(""STC Primary Contact Id"");
 SerAccId = GetFieldValue(""Service Account Id"");

 var STCInputs  = appobj.NewPropertySet();
 var STCOutputs  = appobj.NewPropertySet();
 
 if(SerAccId == """" || SerAccId == null)
 {
  var STCCreateSAN = appobj.GetService(""STC Create Subscription"");
  STCInputs.SetProperty(""Account Type"",AccType);
  STCInputs.SetProperty(""Billing Account Name"",BillAccName);
  STCInputs.SetProperty(""Billing Address Id"",BillAddId);
  STCInputs.SetProperty(""Community Type"",CommType);
  STCInputs.SetProperty(""Customer Account Id"",CustAccId);
  STCInputs.SetProperty(""Order Id"",OrderId);
  STCInputs.SetProperty(""Order Sub Type"",OrderSubType);
  STCInputs.SetProperty(""Billing Account Id"",BillAccId);
  STCInputs.SetProperty(""Primary Contact Id"",PriConId); 
  STCCreateSAN.InvokeMethod(""CreateCorpGPRSSubscription"", STCInputs, STCOutputs);
  SerAccId = STCOutputs.GetProperty(""ServiceAccountId"");
  var ErrMsg = STCOutputs.GetProperty(""Error Message"");
  if((SerAccId != """" || SerAccId != null) && ErrMsg == """" )
  { 
  ActivateField(""Service Account Id"");
  SetFieldValue(""Service Account Id"", SerAccId);
  WriteRecord();
  }//if((SerAccId != """" || SerAccId != null) && ErrMsg == """" )

 }// end of if(SerAccId == """" || SerAccId == null)
 
  var StrOrderBO = TheApplication().GetBusObject(""Order Entry (Sales)"");
  var StrOrderBC = StrOrderBO.GetBusComp(""Order Entry - Orders"");
  
  var sBCLineItem = StrOrderBO.GetBusComp(""Order Entry - Line Items"");
  var sOrderItemXA = StrOrderBO.GetBusComp(""Order Item XA"");
  with(StrOrderBC)
  {
  SetViewMode(AllView);
  ClearToQuery();
  SetSearchSpec(""Id"", OrderId);
  ExecuteQuery(ForwardOnly);
  var isOrderrec = FirstRecord();
  if(isOrderrec)
  {
    with(sBCLineItem)
    {
    SetViewMode(AllView);
    ActivateField(""Order Header Id"");
    ActivateField(""Part Number"");
    ActivateField(""Action Code"");
    ActivateField(""STC WVPN SR Check"");
    ClearToQuery();
    var spec  = ""[Part Number] LIKE 'APN*' AND ([Action Code] = 'Add' OR [Action Code] = 'Delete') AND [Order Header Id] = '"" + OrderId + ""'"";
    SetSearchExpr(spec);
    
    ExecuteQuery(ForwardOnly);
    var isrec = FirstRecord();
    while(isrec)
    {
     sOrderItemId = GetFieldValue(""Id"");
     SRCreated = GetFieldValue(""STC WVPN SR Check"");
     
     /* check TT created for this line item and its status */
    /* var serReqBCforTT = appobj.GetBusObject(""Service Request"").GetBusComp(""Service Request"");
     with(serReqBCforTT)
      {
       SetViewMode(AllView);
       ActivateField(""APN OrderItemId"");
       ActivateField(""Status"");
       ClearToQuery();
       SetSearchSpec(""APN OrderItemId"", sOrderItemId);
       ExecuteQuery(ForwardOnly);
       IsTTRec = FirstRecord();
       if(IsTTRec)
       {
         TTStat = GetFieldValue(""Status"");
         if(TTStat != ""Closed"")
         {
    TTOpenCnt = TTOpenCnt + 1;
         }
       }
      } //with(serReqBCforTT)*/
  if(SRCreated != ""Yes"")
  {
     APNProdName = GetFieldValue(""Part Number"");
     var action = GetFieldValue(""Action Code"");
     with(sOrderItemXA)
     {
      ActivateField(""Object Id"");
      SetViewMode(AllView);
      ClearToQuery();
      var XAspec  = ""[Object Id] = '"" + sOrderItemId + ""'"";
      SetSearchExpr(XAspec);
      ExecuteQuery(ForwardOnly);
      var isrecord = FirstRecord();
      if(isrecord)
      {
       while(isrecord)
       {
         sOrderItemXAId = GetFieldValue(""Id"");
         var sOrderItemName = GetFieldValue(""Name"");
         if(sOrderItemName == 'APN_APNName')
         {
          sName = GetFieldValue(""Value"");
         }
         if(sOrderItemName == 'APN_APNType')
         {
          sValue = GetFieldValue(""Value"");
         }
         if(sOrderItemName == 'APN_APNTemplateID')
         {
          sTemplateId = GetFieldValue(""Value"");
         }
         if(sOrderItemName == 'APN_CNTXID')
         {
          CNTXId = GetFieldValue(""Value"");
         }
         if(sOrderItemName == 'NoOfIP')
         {
          NoOfIP = GetFieldValue(""Value"");
         }
        isrecord = NextRecord();
       }//end of while
      }//end of if
 }//end of sOrderItemXA with
      var SerReqBC = TheApplication().GetBusObject(""Service Request"").GetBusComp(""Service Request"");
      var STCInputsone  = appobj.NewPropertySet();
      var STCOutputsone  = appobj.NewPropertySet();
      var STCCreateSR = appobj.GetService(""Workflow Process Manager"");
      if(APNProdName == ""APNPRIDYN"" || APNProdName == ""APNPRIDYNSME"" || APNProdName == ""APNPRISTAT"" || APNProdName == ""APNPRISTATSME"" ||  APNProdName == ""APNPUBDYN"" || APNProdName == ""APNPUBDYNSME"" || APNProdName == ""APNPUBSTAT"" || APNProdName == ""APNPUBSTATSME"")  
      {       
      STCInputsone.SetProperty(""SerAccId"",SerAccId);
      STCInputsone.SetProperty(""Tier1"",""Corporate GPRS"");
      STCInputsone.SetProperty(""Tier2"",""APN Configuration"");
      if(action == ""Delete"") 
   {
       STCInputsone.SetProperty(""Tier3"",""APN Termination"");       
     STCInputsone.SetProperty(""Description"",""TT Created for APN and Static IP Termination"");   
        STCInputsone.SetProperty(""APNCNTXId"",CNTXId);
        STCInputsone.SetProperty(""APNName"",sName);
        STCInputsone.SetProperty(""APNTemplateId"",sTemplateId);
        STCInputsone.SetProperty(""LineId"",sOrderItemId);
        STCInputsone.SetProperty(""ProdName"",APNProdName);
        STCInputsone.SetProperty(""ProcessName"", ""STC WVPN Create VPN Service Request WF"");
        STCCreateSR.InvokeMethod(""RunProcess"", STCInputsone, STCOutputsone);
        var SerReqId = STCOutputsone.GetProperty(""SR Id"");      
   }
      else if( APNProdName  == ""APNPRISTAT"" || APNProdName  == ""APNPUBSTAT"" || APNProdName  == ""APNPRISTATSME"" || APNProdName  == ""APNPUBSTATSME"")
      {
       STCInputsone.SetProperty(""Tier3"",""APN-IP Generation"");
     STCInputsone.SetProperty(""Description"",""TT Created for APN and Static IP Configuration"");
        STCInputsone.SetProperty(""APNCNTXId"",CNTXId);
        STCInputsone.SetProperty(""APNName"",sName);
        STCInputsone.SetProperty(""APNTemplateId"",sTemplateId);
        STCInputsone.SetProperty(""LineId"",sOrderItemId);
        STCInputsone.SetProperty(""ProdName"",APNProdName);
        STCInputsone.SetProperty(""NoOfIP"",NoOfIP);        
        STCInputsone.SetProperty(""ProcessName"", ""STC WVPN Create VPN Service Request WF"");
        STCCreateSR.InvokeMethod(""RunProcess"", STCInputsone, STCOutputsone);
        var SerReqId = STCOutputsone.GetProperty(""SR Id"");      
      }
      else{      
      STCInputsone.SetProperty(""SerAccId"",SerAccId);
      STCInputsone.SetProperty(""Type"", ""CreateGPRSReq"");
      STCInputsone.SetProperty(""Description"",""TT Created for APN Configuration"");
      STCInputsone.SetProperty(""ProcessName"", ""STC Create Corporate GPRS Service Request"");
      STCCreateSR.InvokeMethod(""RunProcess"", STCInputsone, STCOutputsone);
      var SerReqId = STCOutputsone.GetProperty(""SR Id"");
      } 
     }//If APNProdName ends
      var serReqBC = appobj.GetBusObject(""Service Request"").GetBusComp(""Service Request"");
      var GPRSQueueId = appobj.InvokeMethod(""LookupValue"",""STC_NETWORK_QUEUE"", ""NETWORK_HELPDESK""); 
      with(serReqBC)
      {
       SetViewMode(AllView);
       ActivateField(""STC Queue Name"");
       ActivateField(""Call Back"");
       ActivateField(""APN Name"");
       ActivateField(""STC GPRS Prod Name"");
       ActivateField(""APN Template Id""); 
       ActivateField(""APN Value""); 
       ActivateField(""APN CNTX Id"");
       ActivateField(""NoOfIP"");
       ActivateField(""Owned By Id"");
       ClearToQuery();
       SetSearchSpec(""SR Id"", SerReqId);
       ExecuteQuery(ForwardOnly);
       var IsSRRec = FirstRecord();
       if(IsSRRec)
       {
        SetFieldValue(""Call Back"" , ""N"");
        SetFieldValue(""STC Queue Id"" , GPRSQueueId);
        SetFieldValue(""Status"", ""In Progress"");
        SetFieldValue(""Sub-Status"", ""Queued"");
        SetFieldValue(""APN Name"", sName);
        SetFieldValue(""APN Value"", sValue);
        SetFieldValue(""APN Template Id"", sTemplateId);
        SetFieldValue(""APN CNTX Id"", CNTXId);
        SetFieldValue(""APN OrderItemId"", sOrderItemId);
        SetFieldValue(""STC GPRS Prod Name"", APNProdName);
        SetFieldValue(""NoOfIP"",NoOfIP);
        SetFieldValue(""Owned By Id"", GPRSQueueId);
        WriteRecord();
      //  TTCreatedCnt = TTCreatedCnt + 1
       }//end of If
      }//end of with(serReqBC)       
    }// if IsTTRec
    SetFieldValue(""STC WVPN SR Check"",""Yes"");
    WriteRecord();
    isrec = NextRecord();    
    }// while(isrec)
    }//end of sBCLineItem with
  }// end of if Order Rec

 // if(TTOpenCnt > 0 || TTCreatedCnt >0  )
 // {
     with(sBCLineItem)
     {
       SetViewMode(AllView);
      ActivateField(""Order Header Id"");
      ActivateField(""Order Header Id"");
      ClearToQuery();
      SetSearchSpec(""Order Header Id"", OrderId);
      ExecuteQuery(ForwardOnly);
      var OrderLineRec = FirstRecord();
      while(OrderLineRec)
      {
        SetFieldValue(""Service Account Id"",SerAccId);
        WriteRecord();
        OrderLineRec = NextRecord();
      }
     
     }
     SetFieldValue(""STC Order Sub Status"",""GPRS Order In Progress"");
     WriteRecord();
     InvokeMethod(""RefreshBusComp"");
   /*  if(TTOpenCnt > 0)
     {
      appobj.RaiseErrorText(""APN-IP Configuration/Termination TT is pending for network configuration. Please ensure closure of respective TT's before resubmission of Order."");
      return(CancelOperation);     
     }//if(TTOpenCnt > 0 )
  } //if(TTOpenCnt > 0 || TTCreatedCnt >0  )*/
 /* else
  {
  var OrderBO1 = appobj.GetBusObject(""MACD Performance Order"");
 var CurrBC1= OrderBO1.GetBusComp(""MACD Order Entry - Orders"");

 with(CurrBC1)
 {
   SetViewMode(AllView);
   ClearToQuery();
   ActivateField(""Status"");
   ActivateField(""STC Order Sub Status"");
   SetSearchSpec(""Id"",OrderId);
   ExecuteQuery(ForwardOnly);
   var OrderRec1 = FirstRecord();
   if(OrderRec1)
      {
       SetFieldValue(""Status"",""Submitted"");
      SetFieldValue(""STC Order Sub Status"",""Submitted"");
       WriteRecord();
  InvokeMethod(""RefreshBusComp"");
  
  var STCInputsTwo  = appobj.NewPropertySet();
  var STCOutputsTwo  = appobj.NewPropertySet();
 
  var STCWorkflowProc = appobj.GetService(""Workflow Process Manager"");
  STCInputsTwo.SetProperty(""Object Id"",OrderId);
  STCInputsTwo.SetProperty(""ProcessName"",""SISOMBillingSubmitOrderWebService"");
  STCWorkflowProc.InvokeMethod(""RunProcess"", STCInputsTwo, STCOutputsTwo);   
      } // OrderRec1
     }// end  with(CurrBC1)
    } //else*/
  } // with(StrOrderBC)
  }// if(OrderRec)
  InvokeMethod(""RefreshBusComp"");
} //with(CurrBC)
}// end of function"
function SIMMSISDNValidation(Inputs, Outputs)
{
var OrderId = Inputs.GetProperty(""OrderId"");
var AppObj = TheApplication();
var OrderBO = AppObj.GetBusObject(""Order Entry (Sales)"");
var OrderBC = OrderBO.GetBusComp(""Order Entry - Orders"");
var OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items"");
var PackageId;
var ErrMsg = """";
var SIMNum = """";
var MSISDNNum = """";
with(OrderBC)
{
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"",OrderId);
		ExecuteQuery(ForwardOnly);
		var OrderRec = FirstRecord();
		if(OrderRec)
		{	
					with(OrderLineBC)
					{
					ActivateField(""Order Header Id"");
					ActivateField(""Part Number"");
					ActivateField(""Parent Order Item Id"");					
					SetViewMode(AllView);
					ClearToQuery();
					var spec  = ""[Order Header Id] = '"" + OrderId + ""' AND [Part Number] = 'PLANCORPGPRS 1'"";
					SetSearchExpr(spec);
					ExecuteQuery(ForwardOnly);
					var isrec = FirstRecord();
						if(isrec)
						{
							PackageId = GetFieldValue(""Parent Order Item Id"");
								with(OrderLineBC)
								{
									ActivateField(""STC ICCID"");
									ActivateField(""Service Id"");
									SetViewMode(AllView);
									ClearToQuery();
									SetSearchSpec(""Id"",PackageId);
									ExecuteQuery(ForwardOnly);
									var OrderLineRec = FirstRecord();
									if(OrderLineRec)
									{
										SIMNum = GetFieldValue(""STC ICCID"");
										MSISDNNum = GetFieldValue(""Service Id"");
										
										if(SIMNum != """" || 	MSISDNNum != """")
										{
											ErrMsg = ""Please remove SIM/MSISDN for Dummy Corporate GPRS Plan or Cancel Order"";
											Outputs.SetProperty(""ErrorMsg"", ErrMsg);	
										}
										else
										{
											Outputs.SetProperty(""ErrorMsg"", ErrMsg);
										}
									}
								}
						}
					}
			
		}// end of OrderRec	
}

}
function STCDUMMYDELETE(Inputs, Outputs)
{
var OrderId = Inputs.GetProperty(""OrderId"");
var AppObj = TheApplication();
var OrderBO = AppObj.GetBusObject(""Order Entry (Sales)"");
var OrderBC = OrderBO.GetBusComp(""Order Entry - Orders"");
var OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items"");
var sOrderItemXA = OrderBO.GetBusComp(""Order Item XA"");
var APNValue;
var Error ="""";
var ProdName;
with(OrderBC)
{
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"",OrderId);
		ExecuteQuery(ForwardOnly);
		var OrderRec = FirstRecord();
		if(OrderRec)
		{	
					with(OrderLineBC)
					{
					ActivateField(""Order Header Id"");
					ActivateField(""Part Number"");
					ActivateField(""Parent Order Item Id"");					
					SetViewMode(AllView);
					ClearToQuery();
					var spec  = ""[Order Header Id] = '"" + OrderId + ""' AND [Part Number] = 'APN*' AND [Action Code] = 'Delete'"";
					SetSearchExpr(spec);
					ExecuteQuery(ForwardOnly);
					var isrec = FirstRecord();
						while(isrec)
						{
								var LineItemId = GetFieldValue(""Id"");
								with(sOrderItemXA)
								{
								var XAspec = ""[Object Id] = '"" + LineItemId + ""' AND  [Display Name] = 'APN_APNName'"";
								ActivateField(""Object Id"");
								ActivateField(""Name"");
								ActivateField(""Value"");
								SetViewMode(AllView);
								ClearToQuery();
								SetSearchExpr(XAspec);
								ExecuteQuery(ForwardOnly);
								var IsXARec = FirstRecord();
								if(IsXARec)
								{
								APNValue = GetFieldValue(""Value"");
								}
							}// end of with OrderItemXA
							if(APNValue != """" || APNValue != null)
							{
		var AssetXA = AppObj.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset XA"");
		var AssetBC = AppObj.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset"");
		with(AssetXA)
		{
			ActivateField(""Name"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Text Value"",APNValue);
			ExecuteQuery(ForwardOnly);
			var XARec = FirstRecord();
			while(XARec)
			{
				var AssetId = GetFieldValue(""Object Id"");
				with(AssetBC)
				{
						ActivateField(""Product Part Number"");
						SetViewMode(AllView);
						ClearToQuery();
						SetSearchSpec(""Asset Id"",AssetId);
						ExecuteQuery(ForwardOnly);
						var AssRec = FirstRecord();
						if(AssRec)
						{
							ProdName = GetFieldValue(""Product Part Number"");
							var MSISDN = GetFieldValue(""Serial Number"");
							if(ProdName != ""APNPRIDYN"" || ProdName != ""APNPRISTAT"" || ProdName != ""APNPUBDYN"" || ProdName != ""APNPUBSTAT"" )
							{	
								var Error = ""Please unsubscribe all the products using '"" +APNName +""'on MSISDN: '"" +MSISDN +""' under the corporate/organization hierarchy before unsubscribing to the APN product"";
								Outputs.SetProperty(""ErrorMsg"", Error);	
							}
						}//if(AssRec)
				}//with(AssetBC)
				XARec = NextRecord();
			 
			}//while(XARec)
		}//with(AssetXA)
		isrec = NextRecord();
			}
						}// end of isrec
					}// end of with OrderLine
			}// end of Orderrec
}// end of withOrderBC
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
 
    switch(MethodName)
     {
		case ""UpdateAPNOrdertoOrderXA"":
		UpdateAPNOrdertoOrderXA(Inputs, Outputs);
		return(CancelOperation);
		break;
		
		case ""TerminateDummyAPN"":
		TerminateDummyAPN(Inputs, Outputs);
		return(CancelOperation);
		break;
		
		case ""UpdateAPNBillAccId"":
		UpdateAPNBillAccId(Inputs, Outputs);
		return(CancelOperation);
		break;
	
		case ""STCDUMMYDELETE"":
		STCDUMMYDELETE(Inputs, Outputs);
		return(CancelOperation);
		break;
	
		case ""SIMMSISDNValidation"":
		SIMMSISDNValidation(Inputs, Outputs);
		return(CancelOperation);
		break;
 
     default:
          return (ContinueOperation);
       }
 
}
function TerminateDummyAPN(Inputs, Outputs)
{
var App = TheApplication();
var ProdName;
var MSISDN;
var APNName = Inputs.GetProperty(""APNName"");
var AssetXA = App.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset XA"");
var AssetBC = App.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset"");
with(AssetXA)
{
		ActivateField(""Name"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Text Value"",APNName);
		ExecuteQuery(ForwardOnly);
		var XARec = FirstRecord();
		while(XARec)
		{
			var AssetId = GetFieldValue(""Object Id"");
			with(AssetBC)
			{
				ActivateField(""Product Part Number"");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchSpec(""Asset Id"",AssetId);
				ExecuteQuery(ForwardOnly);
				var AssRec = FirstRecord();
				if(AssRec)
				{
					ProdName = GetFieldValue(""Product Part Number"");
					MSISDN = GetFieldValue(""Serial Number"");
					if(ProdName != ""CORPAPNS"")
					{	
					var Error = ""Please unsubscribe all the products using '"" +APNName +""'on MSISDN: '"" +MSISDN +""' under the corporate/organization hierarchy before unsubscribing to the APN product"";
						Outputs.SetProperty(""ErrorMsg"", Error);	
					}
				}//if(AssRec)
			}//with(AssetBC)
		XARec = NextRecord();
		}//while(XARec)
	}//with(AssetXA)
}
function UpdateAPNBillAccId(Inputs, Outputs)
{
var OrderId = Inputs.GetProperty(""OrderId"");
var BillAccId;
var Custtype;
var ParBillAccId;
var OrderBC = TheApplication().GetBusObject(""Order Entry (Sales)"").GetBusComp(""Order Entry - Orders"");
var CUTInvBC = TheApplication().GetBusObject(""STC Billing Account"").GetBusComp(""CUT Invoice Sub Accounts"");

with(OrderBC)
{
	ActivateField(""STC APN Billing Account Id"");
	ActivateField(""Billing Account Id"");
	ActivateField(""STC Customer Type"");
	SetViewMode(AllView);
	ClearToQuery();
	SetSearchSpec(""Id"",OrderId);
	ExecuteQuery(ForwardOnly);
	var OrderRec = FirstRecord();
	if(OrderRec)
	{
		BillAccId = GetFieldValue(""Billing Account Id"");
			with(CUTInvBC)
			{
				ActivateField(""Parent Account Id"");
				ActivateField(""STCPlanName"");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchSpec(""Id"",BillAccId);
				ExecuteQuery(ForwardOnly);
				var BillRec = FirstRecord();
				if(BillRec)
				{
					SetFieldValue(""STCPlanName"",""CORPGPRS"");
					WriteRecord();
				}
			}
				//	SetFieldValue(""STC APN Billing Account Id"",BillAccId);
				//	WriteRecord();	
    	}
	}
}
function UpdateAPNOrdertoOrderXA(Inputs, Outputs)
{
var OrderId = Inputs.GetProperty(""OrderId"");
var AppObj = TheApplication();
var APNName;
var APNValue;
var APNTemplate;
var sBCLineItemId;
var CNTXValue;
var OrderBO = AppObj.GetBusObject(""Order Entry (Sales)"");
var OrderBC = OrderBO.GetBusComp(""Order Entry - Orders"");
var OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items"");
var sOrderItemXA = OrderBO.GetBusComp(""Order Item XA"");
with(OrderBC)
{
		ActivateField(""STC APN Name"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"",OrderId);
		ExecuteQuery(ForwardOnly);
		var OrderRec = FirstRecord();
		if(OrderRec)
		{
				APNName = GetFieldValue(""STC APN Name"");
				if(APNName != """" || APNName != null)
				{
				with(OrderLineBC)
				{
					SetViewMode(AllView);
					ActivateField(""Order Header Id"");
					ActivateField(""Part Number"");
					ClearToQuery();
					var spec  = ""[Order Header Id] = '"" + OrderId + ""' AND [Action Code] = 'Add' AND ([Part Number] = 'CORPAPNA1' OR  [Part Number] = 'CORPIPA1')"";
					SetSearchExpr(spec);
					
					ExecuteQuery(ForwardOnly);
					var isrec = FirstRecord();
					while(isrec)
					{
						sBCLineItemId = GetFieldValue(""Id"");
						var APNBC = AppObj.GetBusObject(""STC Billing Account"").GetBusComp(""STC APN Details"");
						with(APNBC)
						{
							ActivateField(""Apn Name"");
							ActivateField(""Apn Type"");
							ActivateField(""APN Template Id"");
							ActivateField(""APN Template Id"");
							SetViewMode(AllView);
							ClearToQuery();
							SetSearchSpec(""Apn Name"",APNName);
							ExecuteQuery(ForwardOnly);
							var isAPNRec = FirstRecord();
							if(isAPNRec)
							{
								APNValue = GetFieldValue(""Apn Type"");
								APNTemplate = GetFieldValue(""APN Template Id"");
								CNTXValue = GetFieldValue(""APN CNTX Id"");								
							}
						}
					with(sOrderItemXA)
					{
						var XAspec = ""[Object Id] = '"" + sBCLineItemId + ""'"";
						ActivateField(""Object Id"");
						ActivateField(""Name"");
						ActivateField(""Value"");
						SetViewMode(AllView);
						ClearToQuery();
						SetSearchExpr(XAspec);
						ExecuteQuery(ForwardOnly);
						var isRecord3 = FirstRecord();
						while(isRecord3)
						{
						var sName = GetFieldValue(""Name"");
						if( sName == 'APN_APNName')
						{
						SetFieldValue(""Value"", APNName);
						}
						if(sName == 'APN_APNTemplateID')
						{
						SetFieldValue(""Value"", APNTemplate);
						}
						if(sName == 'APN_APNType')
						{
						SetFieldValue(""Value"", APNValue);
						}
						
						if(sName == 'APN_CNTXID')
						{
						SetFieldValue(""Value"", CNTXValue);
						}
						
						
						WriteRecord();
						isRecord3 = NextRecord();
						}//End of while
					}// end of withsOrderItemXA	
					isrec = NextRecord();
					}
				}// end of with OrderLineBC
				}// if APN Name
		}
}// end of withOrderBC
}// end of function"
function APNNameCheck(Inputs, Outputs)
{
var OrderId = Inputs.GetProperty(""OrderId"");
var AppObj = TheApplication();
Outputs.SetProperty(""ErrorMessage"","""");
var OrderBO = AppObj.GetBusObject(""Order Entry (Sales)"");
var OrderBC = OrderBO.GetBusComp(""Order Entry - Orders"");
var OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items (Simple)"");
var OrderXA = OrderBO.GetBusComp(""Order Item XA (Simple)"");
var APNVal = ""NOAPN"";
with(OrderBC)
{
  SetViewMode(AllView);
  ClearToQuery();
  SetSearchSpec(""Id"",OrderId);
  ExecuteQuery(ForwardOnly);
  var OrderRec = FirstRecord();
  if(OrderRec)
  {
   with(OrderLineBC)
   {
    var spec  = ""[Order Header Id] = '"" + OrderId + ""' AND [Action Code] = 'Add' AND ([Part Number] LIKE 'VCGPRS*')"";
    SetViewMode(AllView);
    ClearToQuery();
    SetSearchExpr(spec);
    ExecuteQuery(ForwardOnly);
    var OrderLineRec = FirstRecord();
    while(OrderLineRec)
    {
     var LineId = GetFieldValue(""Id"");
     with(OrderXA)
     {
      var XASpec  = ""[Object Id] = '"" + LineId + ""' AND [Name] = 'APN_APNName'"";
      SetViewMode(AllView);
      ClearToQuery();
      SetSearchExpr(XASpec);
      ExecuteQuery(ForwardOnly);
      var OrderXARec = FirstRecord();
      if(OrderXARec)
      {
        APNVal = GetFieldValue(""Value"");
       if(APNVal == """" || APNVal == null)
       {
        var sMessage = ""APN Details are required for IP Products""
        Outputs.SetProperty(""ErrorMessage"",sMessage);
       }
       else
       {
       Outputs.SetProperty(""ErrorMessage"","""");
       }
      }
     }
     OrderLineRec = NextRecord();
    }
    
   }
  }
}// end of with(OrderBC)

}
function SIMMSISDNValidation(Inputs, Outputs)
{
var OrderId = Inputs.GetProperty(""OrderId"");
var AppObj = TheApplication();
var OrderBO = AppObj.GetBusObject(""Order Entry (Sales)"");
var OrderBC = OrderBO.GetBusComp(""Order Entry - Orders"");
var OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items"");
var PackageId;
var ErrMsg = """";
var SIMNum = """";
var MSISDNNum = """";
with(OrderBC)
{
  SetViewMode(AllView);
  ClearToQuery();
  SetSearchSpec(""Id"",OrderId);
  ExecuteQuery(ForwardOnly);
  var OrderRec = FirstRecord();
  if(OrderRec)
  { 
     with(OrderLineBC)
     {
     ActivateField(""Order Header Id"");
     ActivateField(""Part Number"");
     ActivateField(""Parent Order Item Id"");     
     SetViewMode(AllView);
     ClearToQuery();
     var spec  = ""[Order Header Id] = '"" + OrderId + ""' AND [Part Number] = 'PLANCORPGPRS 1'"";
     SetSearchExpr(spec);
     ExecuteQuery(ForwardOnly);
     var isrec = FirstRecord();
      if(isrec)
      {
       PackageId = GetFieldValue(""Parent Order Item Id"");
        with(OrderLineBC)
        {
         ActivateField(""STC ICCID"");
         ActivateField(""Service Id"");
         SetViewMode(AllView);
         ClearToQuery();
         SetSearchSpec(""Id"",PackageId);
         ExecuteQuery(ForwardOnly);
         var OrderLineRec = FirstRecord();
         if(OrderLineRec)
         {
          SIMNum = GetFieldValue(""STC ICCID"");
          MSISDNNum = GetFieldValue(""Service Id"");
          
          if(SIMNum != """" ||  MSISDNNum != """")
          {
           ErrMsg = ""Please remove SIM/MSISDN for Dummy Corporate GPRS Plan or Cancel Order"";
           Outputs.SetProperty(""ErrorMsg"", ErrMsg); 
          }
          else
          {
           Outputs.SetProperty(""ErrorMsg"", ErrMsg);
          }
         }
        }
      }
     }
   
  }// end of OrderRec 
}

}
function STCDUMMYDELETE(Inputs, Outputs)
{
var OrderId = Inputs.GetProperty(""OrderId"");
var AppObj = TheApplication();
var OrderBO = AppObj.GetBusObject(""Order Entry (Sales)"");
var OrderBC = OrderBO.GetBusComp(""Order Entry - Orders"");
var OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items (Simple)"");
var sOrderItemXA = OrderBO.GetBusComp(""Order Item XA"");
var APNValue;
var ProdName;
Outputs.SetProperty(""ErrorMessage"","""");
with(OrderBC)
{
  SetViewMode(AllView);
  ClearToQuery();
  SetSearchSpec(""Id"",OrderId);
  ExecuteQuery(ForwardOnly);
  var OrderRec = FirstRecord();
  if(OrderRec)
  { 
     with(OrderLineBC)
     {
     ActivateField(""Order Header Id"");
     ActivateField(""Part Number"");
     ActivateField(""Parent Order Item Id"");     
     SetViewMode(AllView);
     ClearToQuery();
     var spec  = ""[Order Header Id] = '"" + OrderId + ""' AND ([Part Number] lIKE 'APN*' )AND [Action Code] = 'Delete'"";
     SetSearchExpr(spec);
     ExecuteQuery(ForwardOnly);
     var isrec = FirstRecord();
      while(isrec)
      {
        var LineItemId = GetFieldValue(""Id"");
        with(sOrderItemXA)
        {
        var XAspec = ""[Object Id] = '"" + LineItemId + ""' AND  [Display Name] = 'APN_APNName'"";
        ActivateField(""Object Id"");
        ActivateField(""Name"");
        ActivateField(""Value"");
        SetViewMode(AllView);
        ClearToQuery();
        SetSearchExpr(XAspec);
        ExecuteQuery(ForwardOnly);
        var IsXARec = FirstRecord();
        if(IsXARec)
        {
        APNValue = GetFieldValue(""Value"");
        }
       }// end of with OrderItemXA
       if(APNValue != """" || APNValue != null)
       {
  var AssetXA = AppObj.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset XA"");
  var AssetBC = AppObj.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset"");
  with(AssetXA)
  {
   ActivateField(""Name"");
   SetViewMode(AllView);
   ClearToQuery();
   SetSearchSpec(""Text Value"",APNValue);
   ExecuteQuery(ForwardOnly);
   var XARec = FirstRecord();
   while(XARec)
   {
    var AssetId = GetFieldValue(""Object Id"");
    with(AssetBC)
    {
      ActivateField(""Product Part Number"");
      ActivateField(""Status"");
      SetViewMode(AllView);
      ClearToQuery();
      SetSearchSpec(""Asset Id"",AssetId);
      ExecuteQuery(ForwardOnly);
      var AssRec = FirstRecord();
      if(AssRec)
      {
       ProdName = GetFieldValue(""Product Part Number"");
       var Status = GetFieldValue(""Status"");
       var MSISDN = GetFieldValue(""Serial Number"");
       if((ProdName == ""VCGPRSSTIP1"" || ProdName == ""VCGPRSDIP1"") && Status != ""Inactive"")
       { 
        var sMessage = ""Please unsubscribe all the products using '"" +APNValue +""'on MSISDN: '"" +MSISDN +""' under the corporate/organization hierarchy before unsubscribing to the APN product"";
        //AppObj.RaiseErrorText(""Please unsubscribe all the products using '"" +APNValue +""'on all the MSISDN’s under the corporate/organization hierarchy before unsubscribing to the APN product"");
        Outputs.SetProperty(""ErrorMessage"",sMessage);
       }
       else 
       {
        Outputs.SetProperty(""ErrorMessage"","""");
       }
      }//if(AssRec)
      else 
       {
        Outputs.SetProperty(""ErrorMessage"","""");
       }
    }//with(AssetBC)
    XARec = NextRecord();
    
   }//while(XARec)
  }//with(AssetXA)
  isrec = NextRecord();
   }
      }// end of isrec
     }// end of with OrderLine
   }// end of Orderrec
}// end of withOrderBC
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
 
    switch(MethodName)
     {
  case ""UpdateAPNOrdertoOrderXA"":
  UpdateAPNOrdertoOrderXA(Inputs, Outputs);
  return(CancelOperation);
  break;
  
  case ""APNNameCheck"":
  APNNameCheck(Inputs, Outputs);
  return(CancelOperation);
  break;
  
  case ""TerminateDummyAPN"":
  TerminateDummyAPN(Inputs, Outputs);
  return(CancelOperation);
  break;
  
  case ""UpdateAPNBillAccId"":
  UpdateAPNBillAccId(Inputs, Outputs);
  return(CancelOperation);
  break;
 
  case ""STCDUMMYDELETE"":
  STCDUMMYDELETE(Inputs, Outputs);
  return(CancelOperation);
  break;
 
  case ""SIMMSISDNValidation"":
  SIMMSISDNValidation(Inputs, Outputs);
  return(CancelOperation);
  break;
 
     default:
          return (ContinueOperation);
       }
 
}
function TerminateDummyAPN(Inputs, Outputs)
{
var App = TheApplication();
var ProdName;
var APNName = Inputs.GetProperty(""APNName"");
var AssetXA = App.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset XA"");
var AssetBC = App.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset"");
with(AssetXA)
{
  ActivateField(""Name"");
  SetViewMode(AllView);
  ClearToQuery();
  SetSearchSpec(""Text Value"",APNName);
  ExecuteQuery(ForwardOnly);
  var XARec = FirstRecord();
  while(XARec)
  {
   var AssetId = GetFieldValue(""Object Id"");
   with(AssetBC)
   {
    ActivateField(""Product Part Number"");
    SetViewMode(AllView);
    ClearToQuery();
    SetSearchSpec(""Asset Id"",AssetId);
    ExecuteQuery(ForwardOnly);
    var AssRec = FirstRecord();
    if(AssRec)
    {
     ProdName = GetFieldValue(""Product Part Number"");
     if(ProdName != ""CORPAPNS"")
     { 
     var Error = ""Please unsubscribe all the products using '"" +APNName +""'on all the MSISDN’s under the corporate/organization hierarchy before unsubscribing to the APN product"";
      Outputs.SetProperty(""ErrorMsg"", Error); 
     }
    }//if(AssRec)
   }//with(AssetBC)
  XARec = NextRecord();
  }//while(XARec)
 }//with(AssetXA)
}
function UpdateAPNBillAccId(Inputs, Outputs)
{
var OrderId = Inputs.GetProperty(""OrderId"");
var BillAccId;
var Custtype;
var ParBillAccId;
var OrderBC = TheApplication().GetBusObject(""Order Entry (Sales)"").GetBusComp(""Order Entry - Orders"");
var CUTInvBC = TheApplication().GetBusObject(""STC Billing Account"").GetBusComp(""CUT Invoice Sub Accounts"");

with(OrderBC)
{
 ActivateField(""STC APN Billing Account Id"");
 ActivateField(""Billing Account Id"");
 ActivateField(""STC Customer Type"");
 SetViewMode(AllView);
 ClearToQuery();
 SetSearchSpec(""Id"",OrderId);
 ExecuteQuery(ForwardOnly);
 var OrderRec = FirstRecord();
 if(OrderRec)
 {
  BillAccId = GetFieldValue(""Billing Account Id"");
   with(CUTInvBC)
   {
    ActivateField(""Parent Account Id"");
    ActivateField(""STCPlanName"");
    SetViewMode(AllView);
    ClearToQuery();
    SetSearchSpec(""Id"",BillAccId);
    ExecuteQuery(ForwardOnly);
    var BillRec = FirstRecord();
    if(BillRec)
    {
     SetFieldValue(""STCPlanName"",""CORPGPRS"");
     WriteRecord();
    }
   }
     SetFieldValue(""STC APN Billing Account Id"",BillAccId);
     WriteRecord(); 
     }
 }
}
function UpdateAPNOrdertoOrderXA(Inputs, Outputs)
{
var OrderId = Inputs.GetProperty(""OrderId"");
var AppObj = TheApplication();
var APNName;
var APNValue;
var APNTemplate;
var sBCLineItemId;
var CNTXValue;
var OrderBO = AppObj.GetBusObject(""Order Entry (Sales)"");
var OrderBC = OrderBO.GetBusComp(""Order Entry - Orders"");
var OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items"");
var sOrderItemXA = OrderBO.GetBusComp(""Order Item XA"");
with(OrderBC)
{
  ActivateField(""STC APN Name"");
  SetViewMode(AllView);
  ClearToQuery();
  SetSearchSpec(""Id"",OrderId);
  ExecuteQuery(ForwardOnly);
  var OrderRec = FirstRecord();
  if(OrderRec)
  {
    APNName = GetFieldValue(""STC APN Name"");
    if(APNName != """" || APNName != null)
    {
    with(OrderLineBC)
    {
     SetViewMode(AllView);
     ActivateField(""Order Header Id"");
     ActivateField(""Part Number"");
     ClearToQuery();
     var spec  = ""[Order Header Id] = '"" + OrderId + ""' AND [Action Code] = 'Add' AND ([Part Number] = 'CORPAPNA1' OR  [Part Number] = 'CORPIPA1')"";
     SetSearchExpr(spec);
     
     ExecuteQuery(ForwardOnly);
     var isrec = FirstRecord();
     while(isrec)
     {
      sBCLineItemId = GetFieldValue(""Id"");
      var APNBC = AppObj.GetBusObject(""STC Billing Account"").GetBusComp(""STC APN Details"");
      with(APNBC)
      {
       ActivateField(""Apn Name"");
       ActivateField(""Apn Type"");
       ActivateField(""APN Template Id"");
       ActivateField(""APN Template Id"");
       SetViewMode(AllView);
       ClearToQuery();
       SetSearchSpec(""Apn Name"",APNName);
       ExecuteQuery(ForwardOnly);
       var isAPNRec = FirstRecord();
       if(isAPNRec)
       {
        APNValue = GetFieldValue(""Apn Type"");
        APNTemplate = GetFieldValue(""APN Template Id"");
        CNTXValue = GetFieldValue(""APN CNTX Id"");        
       }
      }
     with(sOrderItemXA)
     {
      var XAspec = ""[Object Id] = '"" + sBCLineItemId + ""'"";
      ActivateField(""Object Id"");
      ActivateField(""Name"");
      ActivateField(""Value"");
      SetViewMode(AllView);
      ClearToQuery();
      SetSearchExpr(XAspec);
      ExecuteQuery(ForwardOnly);
      var isRecord3 = FirstRecord();
      while(isRecord3)
      {
      var sName = GetFieldValue(""Name"");
      if( sName == 'APN_APNName')
      {
      SetFieldValue(""Value"", APNName);
      }
      if(sName == 'APN_APNTemplateID')
      {
      SetFieldValue(""Value"", APNTemplate);
      }
      if(sName == 'APN_APNType')
      {
      SetFieldValue(""Value"", APNValue);
      }
      
      if(sName == 'APN_CNTXID')
      {
      SetFieldValue(""Value"", CNTXValue);
      }
      
      
      WriteRecord();
      isRecord3 = NextRecord();
      }//End of while
     }// end of withsOrderItemXA 
     isrec = NextRecord();
     }
    }// end of with OrderLineBC
    }// if APN Name
  }
}// end of withOrderBC
}// end of function"
function APNNameCheck(Inputs, Outputs)
{
var OrderId = Inputs.GetProperty(""OrderId"");
var AppObj = TheApplication();
Outputs.SetProperty(""ErrorMessage"","""");
var OrderBO = AppObj.GetBusObject(""Order Entry (Sales)"");
var OrderBC = OrderBO.GetBusComp(""Order Entry - Orders"");
var OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items (Simple)"");
var OrderXA = OrderBO.GetBusComp(""Order Item XA (Simple)"");
var APNVal = ""NOAPN"";
with(OrderBC)
{
  SetViewMode(AllView);
  ClearToQuery();
  SetSearchSpec(""Id"",OrderId);
  ExecuteQuery(ForwardOnly);
  var OrderRec = FirstRecord();
  if(OrderRec)
  {
   with(OrderLineBC)
   {
    var spec  = ""[Order Header Id] = '"" + OrderId + ""' AND [Action Code] = 'Add' AND ([Part Number] LIKE 'VCGPRS*')"";
    SetViewMode(AllView);
    ClearToQuery();
    SetSearchExpr(spec);
    ExecuteQuery(ForwardOnly);
    var OrderLineRec = FirstRecord();
    while(OrderLineRec)
    {
     var LineId = GetFieldValue(""Id"");
     with(OrderXA)
     {
      var XASpec  = ""[Object Id] = '"" + LineId + ""' AND [Name] = 'APN_APNName'"";
      SetViewMode(AllView);
      ClearToQuery();
      SetSearchExpr(XASpec);
      ExecuteQuery(ForwardOnly);
      var OrderXARec = FirstRecord();
      if(OrderXARec)
      {
        APNVal = GetFieldValue(""Value"");
       if(APNVal == """" || APNVal == null)
       {
        var sMessage = ""APN Details are required for IP Products""
        Outputs.SetProperty(""ErrorMessage"",sMessage);
       }
       else
       {
       Outputs.SetProperty(""ErrorMessage"","""");
       }
      }
     }
     OrderLineRec = NextRecord();
    }
    
   }
  }
}// end of with(OrderBC)

}
function SIMMSISDNValidation(Inputs, Outputs)
{
var OrderId = Inputs.GetProperty(""OrderId"");
var AppObj = TheApplication();
var OrderBO = AppObj.GetBusObject(""Order Entry (Sales)"");
var OrderBC = OrderBO.GetBusComp(""Order Entry - Orders"");
var OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items"");
var PackageId;
var ErrMsg = """";
var SIMNum = """";
var MSISDNNum = """";
with(OrderBC)
{
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"",OrderId);
		ExecuteQuery(ForwardOnly);
		var OrderRec = FirstRecord();
		if(OrderRec)
		{	
					with(OrderLineBC)
					{
					ActivateField(""Order Header Id"");
					ActivateField(""Part Number"");
					ActivateField(""Parent Order Item Id"");					
					SetViewMode(AllView);
					ClearToQuery();
					var spec  = ""[Order Header Id] = '"" + OrderId + ""' AND [Part Number] = 'PLANCORPGPRS 1'"";
					SetSearchExpr(spec);
					ExecuteQuery(ForwardOnly);
					var isrec = FirstRecord();
						if(isrec)
						{
							PackageId = GetFieldValue(""Parent Order Item Id"");
								with(OrderLineBC)
								{
									ActivateField(""STC ICCID"");
									ActivateField(""Service Id"");
									SetViewMode(AllView);
									ClearToQuery();
									SetSearchSpec(""Id"",PackageId);
									ExecuteQuery(ForwardOnly);
									var OrderLineRec = FirstRecord();
									if(OrderLineRec)
									{
										SIMNum = GetFieldValue(""STC ICCID"");
										MSISDNNum = GetFieldValue(""Service Id"");
										
										if(SIMNum != """" || 	MSISDNNum != """")
										{
											ErrMsg = ""Please remove SIM/MSISDN for Dummy Corporate GPRS Plan or Cancel Order"";
											Outputs.SetProperty(""ErrorMsg"", ErrMsg);	
										}
										else
										{
											Outputs.SetProperty(""ErrorMsg"", ErrMsg);
										}
									}
								}
						}
					}
			
		}// end of OrderRec	
}

}
function STCDUMMYDELETE(Inputs, Outputs)
{
	var OrderId = Inputs.GetProperty(""OrderId"");
	var AppObj = TheApplication();
	var OrderBO = AppObj.GetBusObject(""Order Entry (Sales)"");
	var OrderBC = OrderBO.GetBusComp(""Order Entry - Orders"");
	var OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items (Simple)"");
	var sOrderItemXA = OrderBO.GetBusComp(""Order Item XA"");
	var APNValue;
	var sMessage;
	var ProdName;
	Outputs.SetProperty(""ErrorMessage"","""");
	with(OrderBC)
	{
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"",OrderId);
		ExecuteQuery(ForwardOnly);
		var OrderRec = FirstRecord();
		if(OrderRec)
		{ 
			with(OrderLineBC)
			{
			ActivateField(""Order Header Id"");
			ActivateField(""Part Number"");
			ActivateField(""Parent Order Item Id"");     
			SetViewMode(AllView);
			ClearToQuery();
			var spec  = ""[Order Header Id] = '"" + OrderId + ""' AND ([Part Number] lIKE 'APN*' OR [Part Number] lIKE 'VWVPNPAPN*') AND [Action Code] = 'Delete'"";
			SetSearchExpr(spec);
			ExecuteQuery(ForwardOnly);
			var isrec = FirstRecord();
			while(isrec)
			{
					var LineItemId = GetFieldValue(""Id"");
					with(sOrderItemXA)
					{
						var XAspec = ""[Object Id] = '"" + LineItemId + ""' AND  [Display Name] = 'APN_APNName'"";
						ActivateField(""Object Id"");
						ActivateField(""Name"");
						ActivateField(""Value"");
						SetViewMode(AllView);
						ClearToQuery();
						SetSearchExpr(XAspec);
						ExecuteQuery(ForwardOnly);
						var IsXARec = FirstRecord();
						if(IsXARec)
						{
						APNValue = GetFieldValue(""Value"");
						}
						}// end of with OrderItemXA
					
					var APNMasterBO = AppObj.GetBusObject(""STC APN Details BO"");
					var APNMasterBC = APNMasterBO.GetBusComp(""STC APN Details"");
					var APNIPBC = APNMasterBO.GetBusComp(""STC APN IP Details BC"");
					
					with(APNMasterBC)
					{
						var APNSpec = ""[Apn Name] = '"" + APNValue + ""' AND  [Status] = 'Active'"";
						SetViewMode(AllView);
						ClearToQuery();
						SetSearchExpr(APNSpec);
						ExecuteQuery(ForwardOnly);
						var IsAPNRec = FirstRecord()
						if(IsAPNRec)
						{
							with(APNIPBC)
							{
								var APNIPSpec = ""[STC APN Name] = '"" + APNValue + ""' AND  [STC Status] <> 'Unassigned'"";
								SetViewMode(AllView);
								ClearToQuery();
								SetSearchExpr(APNIPSpec);
								ExecuteQuery(ForwardOnly);
								var IsAPNIPRec = FirstRecord()
								if(IsAPNIPRec)
								{
									sMessage = ""Please unsubscribe all the Services using '"" +APNValue +""' under the corporate/organization/SME hierarchy before unsubscribing to the APN product"";
									Outputs.SetProperty(""ErrorMessage"",sMessage);
									goto EndofProg;
								}
							}
						}
					}
					
					
					
					if((APNValue != """" || APNValue != null) && (sMessage == """" || sMessage == null))
					{
							var AssetXA = AppObj.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset XA"");
							var AssetBC = AppObj.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset"");
							with(AssetXA)
							{
									ActivateField(""Name"");
									SetViewMode(AllView);
									ClearToQuery();
									SetSearchSpec(""Text Value"",APNValue);
									ExecuteQuery(ForwardOnly);
									var XARec = FirstRecord();
									while(XARec)
									{
										var AssetId = GetFieldValue(""Object Id"");
										with(AssetBC)
										{
											ActivateField(""Product Part Number"");
											ActivateField(""Status"");
											SetViewMode(AllView);
											ClearToQuery();
											SetSearchSpec(""Asset Id"",AssetId);
											ExecuteQuery(ForwardOnly);
											var AssRec = FirstRecord();
												if(AssRec)
												{
												ProdName = GetFieldValue(""Product Part Number"");
												var Status = GetFieldValue(""Status"");
												var MSISDN = GetFieldValue(""Serial Number"");
												var FoundProd = AppObj.InvokeMethod(""LookupValue"",""STC_APN_DELETION_VALID"",ProdName);
												var FoundProdStr = FoundProd.substring(0,6);
												
													if((FoundProdStr == ""APNDEL"") && Status != ""Inactive"")
													{ 
													var sMessage = ""Please unsubscribe all the products using '"" +APNValue +""'on MSISDN: '"" +MSISDN +""' under the corporate/organization/SME hierarchy before unsubscribing to the APN product"";
													//AppObj.RaiseErrorText(""Please unsubscribe all the products using '"" +APNValue +""'on all the MSISDN’s under the corporate/organization/SME hierarchy before unsubscribing to the APN product"");
													Outputs.SetProperty(""ErrorMessage"",sMessage);
													goto EndofProg;
													}
												
												}//if(AssRec)
										
										}//with(AssetBC)
										
										XARec = NextRecord();
									
									}//while(XARec)
							}//with(AssetXA)
					isrec = NextRecord();
					}
					}// end of isrec
			
			}// end of with OrderLine
		}// end of Orderrec
	}// end of withOrderBC
	EndofProg:
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
 
    switch(MethodName)
     {
  case ""UpdateAPNOrdertoOrderXA"":
  UpdateAPNOrdertoOrderXA(Inputs, Outputs);
  return(CancelOperation);
  break;
  
  case ""APNNameCheck"":
  APNNameCheck(Inputs, Outputs);
  return(CancelOperation);
  break;
  
  case ""TerminateDummyAPN"":
  TerminateDummyAPN(Inputs, Outputs);
  return(CancelOperation);
  break;
  
  case ""UpdateAPNBillAccId"":
  UpdateAPNBillAccId(Inputs, Outputs);
  return(CancelOperation);
  break;
 
  case ""STCDUMMYDELETE"":
  STCDUMMYDELETE(Inputs, Outputs);
  return(CancelOperation);
  break;
 
  case ""SIMMSISDNValidation"":
  SIMMSISDNValidation(Inputs, Outputs);
  return(CancelOperation);
  break;
 
     default:
          return (ContinueOperation);
       }
 
}
function TerminateDummyAPN(Inputs, Outputs)
{
var App = TheApplication();
var ProdName;
var APNName = Inputs.GetProperty(""APNName"");
var AssetXA = App.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset XA"");
var AssetBC = App.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset"");
with(AssetXA)
{
  ActivateField(""Name"");
  SetViewMode(AllView);
  ClearToQuery();
  SetSearchSpec(""Text Value"",APNName);
  ExecuteQuery(ForwardOnly);
  var XARec = FirstRecord();
  while(XARec)
  {
   var AssetId = GetFieldValue(""Object Id"");
   with(AssetBC)
   {
    ActivateField(""Product Part Number"");
    SetViewMode(AllView);
    ClearToQuery();
    SetSearchSpec(""Asset Id"",AssetId);
    ExecuteQuery(ForwardOnly);
    var AssRec = FirstRecord();
    if(AssRec)
    {
     ProdName = GetFieldValue(""Product Part Number"");
     if(ProdName != ""CORPAPNS"")
     { 
     var Error = ""Please unsubscribe all the products using '"" +APNName +""'on all the MSISDN’s under the corporate/organization hierarchy before unsubscribing to the APN product"";
      Outputs.SetProperty(""ErrorMsg"", Error); 
     }
    }//if(AssRec)
   }//with(AssetBC)
  XARec = NextRecord();
  }//while(XARec)
 }//with(AssetXA)
}
function UpdateAPNBillAccId(Inputs, Outputs)
{
var OrderId = Inputs.GetProperty(""OrderId"");
var BillAccId;
var Custtype;
var ParBillAccId;
var OrderBC = TheApplication().GetBusObject(""Order Entry (Sales)"").GetBusComp(""Order Entry - Orders"");
var CUTInvBC = TheApplication().GetBusObject(""STC Billing Account"").GetBusComp(""CUT Invoice Sub Accounts"");

with(OrderBC)
{
 ActivateField(""STC APN Billing Account Id"");
 ActivateField(""Billing Account Id"");
 ActivateField(""STC Customer Type"");
 SetViewMode(AllView);
 ClearToQuery();
 SetSearchSpec(""Id"",OrderId);
 ExecuteQuery(ForwardOnly);
 var OrderRec = FirstRecord();
 if(OrderRec)
 {
  BillAccId = GetFieldValue(""Billing Account Id"");
   with(CUTInvBC)
   {
    ActivateField(""Parent Account Id"");
    ActivateField(""STCPlanName"");
    SetViewMode(AllView);
    ClearToQuery();
    SetSearchSpec(""Id"",BillAccId);
    ExecuteQuery(ForwardOnly);
    var BillRec = FirstRecord();
    if(BillRec)
    {
     SetFieldValue(""STCPlanName"",""CORPGPRS"");
     WriteRecord();
    }
   }
     SetFieldValue(""STC APN Billing Account Id"",BillAccId);
     WriteRecord(); 
     }
 }
}
function UpdateAPNOrdertoOrderXA(Inputs, Outputs)
{
var OrderId = Inputs.GetProperty(""OrderId"");
var AppObj = TheApplication();
var APNName;
var APNValue;
var APNTemplate;
var sBCLineItemId;
var CNTXValue;
var OrderBO = AppObj.GetBusObject(""Order Entry (Sales)"");
var OrderBC = OrderBO.GetBusComp(""Order Entry - Orders"");
var OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items"");
var sOrderItemXA = OrderBO.GetBusComp(""Order Item XA"");
with(OrderBC)
{
  ActivateField(""STC APN Name"");
  SetViewMode(AllView);
  ClearToQuery();
  SetSearchSpec(""Id"",OrderId);
  ExecuteQuery(ForwardOnly);
  var OrderRec = FirstRecord();
  if(OrderRec)
  {
    APNName = GetFieldValue(""STC APN Name"");
    if(APNName != """" || APNName != null)
    {
    with(OrderLineBC)
    {
     SetViewMode(AllView);
     ActivateField(""Order Header Id"");
     ActivateField(""Part Number"");
     ClearToQuery();
     var spec  = ""[Order Header Id] = '"" + OrderId + ""' AND [Action Code] = 'Add' AND ([Part Number] = 'CORPAPNA1' OR  [Part Number] = 'CORPIPA1')"";
     SetSearchExpr(spec);
     
     ExecuteQuery(ForwardOnly);
     var isrec = FirstRecord();
     while(isrec)
     {
      sBCLineItemId = GetFieldValue(""Id"");
      var APNBC = AppObj.GetBusObject(""STC Billing Account"").GetBusComp(""STC APN Details"");
      with(APNBC)
      {
       ActivateField(""Apn Name"");
       ActivateField(""Apn Type"");
       ActivateField(""APN Template Id"");
       ActivateField(""APN Template Id"");
       SetViewMode(AllView);
       ClearToQuery();
       SetSearchSpec(""Apn Name"",APNName);
       ExecuteQuery(ForwardOnly);
       var isAPNRec = FirstRecord();
       if(isAPNRec)
       {
        APNValue = GetFieldValue(""Apn Type"");
        APNTemplate = GetFieldValue(""APN Template Id"");
        CNTXValue = GetFieldValue(""APN CNTX Id"");        
       }
      }
     with(sOrderItemXA)
     {
      var XAspec = ""[Object Id] = '"" + sBCLineItemId + ""'"";
      ActivateField(""Object Id"");
      ActivateField(""Name"");
      ActivateField(""Value"");
      SetViewMode(AllView);
      ClearToQuery();
      SetSearchExpr(XAspec);
      ExecuteQuery(ForwardOnly);
      var isRecord3 = FirstRecord();
      while(isRecord3)
      {
      var sName = GetFieldValue(""Name"");
      if( sName == 'APN_APNName')
      {
      SetFieldValue(""Value"", APNName);
      }
      if(sName == 'APN_APNTemplateID')
      {
      SetFieldValue(""Value"", APNTemplate);
      }
      if(sName == 'APN_APNType')
      {
      SetFieldValue(""Value"", APNValue);
      }
      
      if(sName == 'APN_CNTXID')
      {
      SetFieldValue(""Value"", CNTXValue);
      }
      
      
      WriteRecord();
      isRecord3 = NextRecord();
      }//End of while
     }// end of withsOrderItemXA 
     isrec = NextRecord();
     }
    }// end of with OrderLineBC
    }// if APN Name
  }
}// end of withOrderBC
}// end of function"
"//Your public declarations go here... 
 var vCANId;
 var vBANId;
 var sLoginId;
 var svc;
 var AccName = """";
 var BulkCount = 0;
 var BulkRequestId= """";
 var BulkRequestNumber = """";
 var vOrderType;
 var vBulkOrdFileName;
 var vErrorMessage = """";
 var vErrorCode    = """";
 var vServiceAccId;
 var vPackage;
 var vRootAssetId;
 var vMSISDN;
 var vSIM;
 var oAccountBO = TheApplication().GetBusObject(""Account"");
 var oAccountBC = oAccountBO.GetBusComp(""Account"");
 var oBulkReqBO = TheApplication().GetBusObject(""ABO Bulk Request"");
 var oBulkReqBC = oBulkReqBO.GetBusComp(""ABO Bulk Request Header"");
 var psSiebelMsg :PropertySet = TheApplication().NewPropertySet();"
function CreateBulkRequest( Inputs, Outputs)
{
	var vInputFile      = """";
	var vReadFromFile   = """";
	var vBulkDataArray  = new Array; 
	var CustActNumber="""", BilActNumber="""", vMSISDN="""", vSIM="""", vPackage="""", vPlan="""", vContract="""", vDevice="""", MENASANNumber="""", BlkReqId="""", CRMBulkReqId="""", vAccountStatus="""",RequestType="""",PlanAddon="""";
	var Sequence:Number = 1;
	with(Inputs)
	{
		CustActNumber = GetProperty(""CustActNumber"");
		BilActNumber = GetProperty(""BilActNumber"");
		vMSISDN = GetProperty(""vMSISDN"");
		vSIM = GetProperty(""vSIM"");
		vPackage = GetProperty(""vPackage"");
		vPlan = GetProperty(""vPlan"");
		vContract = GetProperty(""PlanContractName"");
		vDevice = GetProperty(""vDevice"");
		MENASANNumber = GetProperty(""MENASANNumber"");
		BlkReqId = GetProperty(""BulkRequestId"");
		CRMBulkReqId = GetProperty(""CRMBulkReqId"");
		vAccountStatus = GetProperty(""AccountStatus"");
		Sequence = GetProperty(""Sequence"");
		 RequestType = GetProperty(""RequestType"");//[MANUJ] : [BB Automation]
		  PlanAddon= GetProperty(""PlanAddon""); //mark added for bulk MNP 
	}

	var Out = TheApplication().NewPropertySet();
	var vOrderType = ""New"";

	try
	{
		sLoginId = TheApplication().LoginId();

		var Header = ""Order"";

		var psSiebelActSetMsg:PropertySet = TheApplication().NewPropertySet();
		var psListOfActionSet:PropertySet = TheApplication().NewPropertySet();

		//Bulk Request Action Set configuration
		with(psSiebelActSetMsg)
		{
			SetType(""SiebelMessage"");
			SetProperty(""MessageId"", ""1-4T7UTH"");
			SetProperty(""MessageType"", ""Integration Object"");
			SetProperty(""IntObjectName"", ""ABO Bulk Action Set IO"");
			SetProperty(""IntObjectFormat"", ""Siebel Hierarchical"");
		}
		psListOfActionSet.SetType(""ListOfABO Bulk Action Set IO"");
		psSiebelActSetMsg.AddChild(psListOfActionSet);
		
		switch(vOrderType) 
		{
			case ""New"":
				NewBulkOrder(CustActNumber,Sequence,CRMBulkReqId,BilActNumber,vMSISDN,vSIM,vPackage,vPlan,vContract,vDevice,psListOfActionSet,Header,MENASANNumber,BlkReqId,vAccountStatus,RequestType,PlanAddon);
				break;
				
			default: return(CancelOperation);
		}

		var wfBS = TheApplication().GetService(""EAI Siebel Adapter"");
		var InP = TheApplication().NewPropertySet();
		var OutP = TheApplication().NewPropertySet();
		var FaultMsg = TheApplication().NewPropertySet();
		with(InP)
		{
			SetProperty(""ObjectLevelTransactions"", ""true"");
			SetProperty(""StatusObject"", ""true"");
			AddChild(psSiebelActSetMsg);
		}
		wfBS.InvokeMethod(""Upsert"",InP,OutP);

		var FullMsg = OutP.GetChild(0).GetChild(0);
		var ChildCount = FullMsg.GetChildCount();
		var RecordCount = BulkCount - ChildCount;
		
		var ActSetChildCount=0, ErrMsg="""", ErrCustomerId="""", ErrBillAccId="""", ActionSetChildCount=0, ErrPackage="""", ErrMSISDN=""""; 
		//var ActionSetChild=null, InstanceChild=null;
		var SiebMsgRequest="""";
		var ErrHandlerBS = TheApplication().GetService(""STC Generic Error Handler""); 
		var HandlerIn = TheApplication().NewPropertySet();
		var HandlerOut = TheApplication().NewPropertySet();

		for (var i = 0; i < ChildCount; i++)
		{
			ActSetChildCount = FullMsg.GetChild(i).GetChildCount();
			if(ActSetChildCount >= 1)
			{
				var ActionSetChild = FullMsg.GetChild(i);
				ErrMsg = ActionSetChild.GetProperty(""ErrorMessage"");
				ErrCustomerId = ActionSetChild.GetProperty(""Customer Account Id"");
				ErrBillAccId = ActionSetChild.GetProperty(""Billing Account Id"");
				  
				var ActionsChild = ActionSetChild.GetChild(0).GetChild(0);
				ActionSetChildCount = ActionSetChild.GetChild(0).GetChildCount();

				ErrPackage = ActionsChild.GetProperty(""Base Product Name"");
				if(ActionSetChildCount == 1)
				{
					var InstanceChild = ActionSetChild.GetChild(1).GetChild(0);
					ErrMSISDN = InstanceChild.GetProperty(""Service Id"");
				}
				SiebMsgRequest = ErrCustomerId + "","" + ErrBillAccId +  "","" + ErrPackage + "","" + ErrMSISDN;
				
				with(HandlerIn)
				{
					SetProperty(""Error Code"", BulkRequestId);
					SetProperty(""Error Message"", ErrMsg);
					SetProperty(""Object Name"", ""STC Bulk File Import BS"");
					SetProperty(""Object Type"", ""Buisness Service"");
					SetProperty(""Siebel Message Request Text"", SiebMsgRequest);
					SetProperty(""Siebel Message Response Text"", """");
				}
				ErrHandlerBS.InvokeMethod(""Log Message"", HandlerIn, HandlerOut);
				
			}//end of if(ActSetChildCount >= 1)
		
		}//end of for (var i = 0; ...

		Outputs.SetProperty(""BulkRequestId"",BulkRequestId);

	}//try
	catch(e)
	{ 
		vErrorMessage = e.toString();
		vErrorCode    = e.errCode; 
		LogException(e);
		TheApplication().RaiseErrorText(vErrorMessage);
	}
	finally
	{
		oBulkReqBC = null;
		oAccountBC = null;
		oBulkReqBO = null;
		oAccountBO = null;
		vBulkDataArray = null;
		wfBS = null;
		InP = null;
		OutP = null;
		psSiebelActSetMsg = null;
		HandlerIn = null;
		HandlerOut = null;
		ErrHandlerBS= null;
		psListOfActionSet = null;
	}
}
function GetTimeStamp()
{
 var SysDate = Clib.time();
 var ObjDate = Date.fromSystem(SysDate); 

 var Month = ToString(ObjDate.getMonth()+1);
  if(Month.length == 1)   
   {
    Month = ""0"" + Month;
   }
 var Day = ToString(ObjDate.getDate());
  if(Day.length == 1)
   {
    Day = ""0"" + Day;
   }
 var Year = ToString(ObjDate.getFullYear());
 var Hour = ToString(ObjDate.getHours());
  if(Hour.length == 1)
   {
    Hour = ""0"" + Hour;
   }
 var Minute = ToString(ObjDate.getMinutes());
  if(Minute.length == 1)
   {
    Minute = ""0"" + Minute;
   }
 var Second = ToString(ObjDate.getSeconds()); 
  if(Second.length == 1)
   {
    Second = ""0"" + Second;
   }

 var now = Day+""""+Month+""""+Year+""""+Hour+""""+Minute+""""+Second; 

 return(now);
}
function LogException(e)
{
 var appObj= TheApplication();
   var Input;
   var Output;
   var CallMessageHandler; 
 try
  {
    
    Input = appObj.NewPropertySet();
    Output = appObj.NewPropertySet();
    var SiebMsgRequest = vCANId + "","" + vBANId +  "","" + vMSISDN + "","" + vPackage;
    CallMessageHandler = appObj.GetService(""STC Generic Error Handler""); 
    Input.SetProperty(""Error Code"", BulkRequestId);
    Input.SetProperty(""Error Message"", e.errText);
    Input.SetProperty(""Object Name"", ""STC Bulk File Import BS"");
    Input.SetProperty(""Object Type"", ""Buisness Service"");
    Input.SetProperty(""Siebel Message Request Text"", SiebMsgRequest);
    Input.SetProperty(""Siebel Message Response Text"", """");
    CallMessageHandler.InvokeMethod(""Log Message"", Input, Output);
  }
  catch(e)
  {
    
  }
  finally
  {
 
    CallMessageHandler = null;
    Output = null;
    Input = null;
    appObj = null;
  }
  
}
function NewBulkOrder (CustActNumber,Sequence,CRMBulkReqId,BilActNumber,vMSISDN,vSIM,vPackage,vPlan,vContract,vDevice,psListOfActionSet,Header,MENASANNumber,BlkReqId,vAccountStatus,RequestType,PlanAddon)
{
	try
	{
		var oAccountBO = TheApplication().GetBusObject(""Account"");
		var oAccountBC = oAccountBO.GetBusComp(""Account"");
		var oBulkReqBO = TheApplication().GetBusObject(""ABO Bulk Request"");
		var oBulkReqBC = oBulkReqBO.GetBusComp(""ABO Bulk Request Header"");;
		var MENAProdBO = TheApplication().GetBusObject(""STC MENA Product BO"");
		var MENAProdBC = MENAProdBO.GetBusComp(""STC MENA Product Data BC"");
		var AddonName="""", AddonContract="""", AddonType="""", vCustType="""";
		var vSeq:Number = 1;
		var vBillProfId = """"; 
		var vDTime = GetTimeStamp();
		var vBulkOrdFileName = ""MENA_MIG""+ ""_""+ vDTime;   
		var oBillAccBO = TheApplication().GetBusObject(""STC Billing Account"");
		var oBillAccBC = oBillAccBO.GetBusComp(""CUT Invoice Sub Accounts"");
		var psListOfActions:PropertySet = TheApplication().NewPropertySet();
		psListOfActions.SetType(""ListOfActions"");
		var psListOfInstance:PropertySet = TheApplication().NewPropertySet();
		psListOfInstance.SetType(""ListOfInstance"");
		with(oAccountBC)
		{
			ClearToQuery();
			SetViewMode(AllView);
			ActivateField(""Id"");
			ActivateField(""Name"");
			ActivateField(""Account Number"");
			ActivateField(""Type"");
			SetSearchSpec(""Id"",CustActNumber);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
			{
				AccName = GetFieldValue(""Name"");
				vCANId = GetFieldValue(""Id"");
				vCustType = GetFieldValue(""Type"");
			}
		}//end of with(oAccountBC)
		with(oBillAccBC)
		{
			ClearToQuery();
			SetViewMode(AllView);
			ActivateField(""Id"");
			ActivateField(""Account Number"");
			ActivateField(""Primary Billing Profile Id"");
			SetSearchSpec(""Id"",BilActNumber);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
			{
				vBANId = GetFieldValue(""Id"");
				vBillProfId = GetFieldValue(""Primary Billing Profile Id"");
			}
		}//end of with(oBillAccBC)
		
		// Setting Bulk Request Header
		if(BlkReqId != """" && BlkReqId != null && BlkReqId != '')
		{
			BulkRequestId = BlkReqId;
			Header = null;
		}
		else if(Header == ""Order"" && (BlkReqId == """" || BlkReqId == null || BlkReqId == ''))
		{
			with(oBulkReqBC)
			{
				ActivateField(""BRFileName"");
				ActivateField(""Bulk Request Name"");
				ActivateField(""Status"");
				ActivateField(""User Id"");
				ActivateField(""Mode"");
				NewRecord(NewAfter);
				SetFieldValue(""BRFileName"","""");
				SetFieldValue(""Bulk Request Name"",vBulkOrdFileName);
				SetFieldValue(""Status"",""New"");
				SetFieldValue(""Mode"",Header);
				SetFieldValue(""User Id"",sLoginId);
				WriteRecord();
				BulkRequestId = GetFieldValue(""Id"");
				Header = null;
			}
		}//end of else if(Header...

		//setting Action Set
		var psActionSet:PropertySet = TheApplication().NewPropertySet();
		var i =1;
		with(psActionSet)
		{
			SetType(""Action Set"");
			SetProperty(""Id"",i);
			SetProperty(""Customer Account"",AccName);
			SetProperty(""Customer Account Id"",vCANId);
			SetProperty(""Billing Account Id"", vBANId);
			SetProperty(""Bulk Request Id"",BulkRequestId);
			SetProperty(""Billing Profile Id"",vBillProfId);
			SetProperty(""CRM Bulk Request Id"",CRMBulkReqId);
			SetProperty(""Service Account"","""");
			SetProperty(""Type"",""New"");
			SetProperty(""Order Type"",""Provide"");
			SetProperty(""Sequence"",i+Sequence);
			SetProperty(""Active Flag"",""Y"");
			// SetProperty(""Account"",AccName);
			SetProperty(""Child Instance Type"",""Service Id"");
			SetProperty(""Scope"",""Include""); 
			SetProperty(""SIM Number"",vSIM);
			SetProperty(""AnyChildInError"",""N"");
			SetProperty(""Template Flag"",""N"");
			SetProperty(""Valid Flag"",""N"");
		}
		
		var psActions:PropertySet = TheApplication().NewPropertySet();
		with(psActions)
		{
			SetType(""Actions"");
			SetProperty(""Id"",vSeq);
			SetProperty(""Sequence"",vSeq);
			SetProperty(""Base Product Name"",vPackage);
			SetProperty(""Action Code"",""Add"");       
			SetProperty(""Active Flag"",""Y"");
			SetProperty(""Allow Multiple Instance"",""N"");
			SetProperty(""Component Product Name"","""");
			SetProperty(""Field Name"","""");
			SetProperty(""Attribute Name"","""");
		}
		psListOfActions.AddChild(psActions);
		
		var psActionsPlan:PropertySet = TheApplication().NewPropertySet();
		if(vPlan != """" && vPlan != null && vPlan != '')
		{
			vSeq = vSeq+1;
			with(psActionsPlan)
			{
				SetType(""Actions"");
				SetProperty(""Id"",vSeq);
				SetProperty(""Sequence"",vSeq);
				SetProperty(""Base Product Name"",vPackage);
				SetProperty(""Action Code"",""Add""); 
				SetProperty(""Active Flag"",""Y"");
				SetProperty(""Allow Multiple Instance"",""N"");
				SetProperty(""Component Product Name"",vPlan);
				SetProperty(""Field Name"","""");
				SetProperty(""Attribute Name"","""");
			}
			psListOfActions.AddChild(psActionsPlan);
		}

		//[MARK:2-DEC-2019 SD:: Business Products Bulk Activation – Phase II]  
  var vMNPPlanAddon:PropertySet = TheApplication().NewPropertySet();
  var MNPPlanAddon = TheApplication().InvokeMethod(""LookupValue"", ""MNP_LIST_OF_ADD_ON"", vPlan);  
  //if(RequestType ==""MNP"" && MNPPlanAddon != """" && MNPPlanAddon != null && MNPPlanAddon != '')
   if(RequestType ==""MNP"" && PlanAddon!= """" && PlanAddon!= null && PlanAddon!= '')
  {
   vSeq = vSeq+1;
   with(vMNPPlanAddon)
   {
    SetType(""Actions"");
    SetProperty(""Id"",vSeq);
    SetProperty(""Sequence"",vSeq);
    SetProperty(""Base Product Name"",vPackage);
    SetProperty(""Action Code"",""Add""); 
    SetProperty(""Active Flag"",""Y"");
    SetProperty(""Allow Multiple Instance"",""N"");
    SetProperty(""Component Product Name"",PlanAddon);
    SetProperty(""Field Name"","""");
    SetProperty(""Attribute Name"","""");
   }
   psListOfActions.AddChild(vMNPPlanAddon);
  }

		if(vAccountStatus == """" || vAccountStatus == null || vAccountStatus != ""Terminated"")
		{
			var psActionsContract:PropertySet = TheApplication().NewPropertySet();
			if(vContract != """" && vContract != null && vContract != '')
			{
				vSeq = vSeq+1;
				with(psActionsContract)
				{
					SetType(""Actions"");
					SetProperty(""Id"",vSeq);
					SetProperty(""Sequence"",vSeq);
					SetProperty(""Base Product Name"",vPackage);
					SetProperty(""Action Code"",""Add""); 
					SetProperty(""Active Flag"",""Y"");
					SetProperty(""Allow Multiple Instance"",""N"");
					SetProperty(""Component Product Name"",vContract);
					SetProperty(""Field Name"","""");
					SetProperty(""Attribute Name"","""");
				}
				psListOfActions.AddChild(psActionsContract);
			}
		}//end of if(vAccountStatus == """" ||...
		
		if(vAccountStatus == """" || vAccountStatus == null || vAccountStatus != ""Terminated"")
		{
			with(MENAProdBC)
			{
				ClearToQuery();
				SetViewMode(AllView);
				ActivateField(""MENA Service Number"");
				ActivateField(""MSISDN"");
				ActivateField(""Product Name"");
				ActivateField(""Contract Name"");
				ActivateField(""Type"");
				//SetSearchSpec(""MENA Service Number"", MENASANNumber);
				SetSearchSpec(""MSISDN"", vMSISDN);
				ExecuteQuery(ForwardOnly);
				var ProdRec = FirstRecord();
				while(ProdRec)
				{
					AddonName = GetFieldValue(""Product Name"");
					AddonContract = GetFieldValue(""Contract Name"");
					AddonType = GetFieldValue(""Type"");
					vSeq = vSeq+1;
					var psActionsAddon:PropertySet = TheApplication().NewPropertySet();
					with(psActionsAddon)
					{
						SetType(""Actions"");
						SetProperty(""Id"",vSeq);
						SetProperty(""Sequence"",vSeq);
						SetProperty(""Base Product Name"",vPackage);
						SetProperty(""Action Code"",""Add""); 
						SetProperty(""Active Flag"",""Y"");
						SetProperty(""Allow Multiple Instance"",""N"");
						SetProperty(""Component Product Name"",AddonName);
						SetProperty(""Field Name"","""");
						SetProperty(""Attribute Name"","""");
					}//with(psActionsAddon)
					psListOfActions.AddChild(psActionsAddon);
					
					if(AddonType == ""DeviceAddon"" && (vCustType == ""Corporate"" || vCustType == ""SME"") && (vPackage == ""VIVA Broadband Enterprise Package"" || vPackage == ""VIVA Broadband SME Package"") && AddonContract != null && AddonContract != """")
					{
						vSeq = vSeq+1;
						var psActionsAddonContr:PropertySet = TheApplication().NewPropertySet();
						with(psActionsAddonContr)
						{
							SetType(""Actions"");
							SetProperty(""Id"",vSeq);
							SetProperty(""Sequence"",vSeq);
							SetProperty(""Base Product Name"",vPackage);
							SetProperty(""Action Code"",""Add""); 
							SetProperty(""Active Flag"",""Y"");
							SetProperty(""Allow Multiple Instance"",""N"");
							SetProperty(""Component Product Name"",AddonContract);
							SetProperty(""Field Name"","""");
							SetProperty(""Attribute Name"","""");
						}//with(psActionsAddon)
						psListOfActions.AddChild(psActionsAddonContr);
					}//end of if(AddonType == ""DeviceAddon"" &&...
					
					ProdRec = NextRecord();
					psActionsAddon = null;
					psActionsAddonContr = null;
				}// while(ProdRec)
			}// with(MENAProdBC)
		}//end of if(vAccountStatus == """" ||...

		psActions = null;

		// Setting Instance
		var psInstance:PropertySet = TheApplication().NewPropertySet();
		with(psInstance)
		{
			SetType(""Instance"");
			SetProperty(""Service Id"",vMSISDN);
			SetProperty(""Id"",""12345"");
			SetProperty(""Sequence"",""1"");
		}
		
		psListOfInstance.AddChild(psInstance);
		psActionSet.AddChild(psListOfInstance);
		psActionSet.AddChild(psListOfActions);
		psListOfActionSet.AddChild(psActionSet);

		return psListOfActionSet;

	}
	catch(e)
	{
		LogException(e);
		if(BulkRequestId == null || BulkRequestId == """")
		{
			TheApplication().RaiseErrorText(""Request Name is already exists, Please enter unique request name"");
		}
	}
	finally
	{
		AccName = """";
		psInstance= null;
		psActionsPlan = null;
		psActionsContract = null;
		psActions= null;
		psActionSet = null;
		psListOfActions = null;
		psListOfInstance = null;
		oBillAccBC = null;
		oBillAccBO = null;
	}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 if(MethodName == ""CreateBulkRequest"")
 {
  CreateBulkRequest(Inputs,Outputs);
  return (CancelOperation);
 }
 
}
"//Your public declarations go here... 
function ToProperCase()
 {
     try
     {
        var iCtr;
        var arrProperCase = new Array();
        arrProperCase = vOrderType.split("" "");
        for(iCtr = 0; iCtr < arrProperCase.length; iCtr++)
  {
           arrProperCase[iCtr] = arrProperCase[iCtr].charAt(0).toUpperCase() + arrProperCase[iCtr].substring(1).toLowerCase();
        vOrderType = arrProperCase.join("" "");
  }

   }
     catch(e)
     {
        throw(e);
     }
     finally
     {
        arrProperCase = null;
        
     }
  }
"//Your public declarations go here... 
function trim(s)
{
 var r=/\b(.*)\b/.exec(s);
 return (r==null)?"""":r[1];
}
"//Your public declarations go here... 
 var vCANId;
 var vBANId;
 var sLoginId;
 var svc;
 var AccName = """";
 var BulkCount = 0;
 var BulkRequestId= """";
 var BulkRequestNumber = """";
 var vOrderType;
 var vBulkOrdFileName;
 var vErrorMessage = """";
 var vErrorCode    = """";
 var vServiceAccId;
 var vPackage;
 var vRootAssetId;
 var vMSISDN;
 var vSIM;
 var oAccountBO = TheApplication().GetBusObject(""Account"");
 var oAccountBC = oAccountBO.GetBusComp(""Account"");
 var oBulkReqBO = TheApplication().GetBusObject(""ABO Bulk Request"");
 var oBulkReqBC = oBulkReqBO.GetBusComp(""ABO Bulk Request Header"");
 var psSiebelMsg :PropertySet = TheApplication().NewPropertySet();"
function CreateBulkRequest( Inputs, Outputs)
{
 var vInputFile      = """";
 var vReadFromFile   = """";
 var vBulkDataArray  = new Array; 
 var CustActNumber="""", BilActNumber="""", vMSISDN="""", vSIM="""", vPackage="""", vPlan="""", vContract="""", vDevice="""", MENASANNumber="""", BlkReqId="""", CRMBulkReqId="""", NewRouterName = """",vAccountStatus="""",RequestType="""";
 var ContractPartNum = """";
 var vRouterName="""", vRouterContract="""",vSmartDevice="""",vSmartContract="""";
 var Sequence:Number = 1;
 with(Inputs)
 {
		CustActNumber = GetProperty(""CustActNumber"");
		BilActNumber = GetProperty(""BilActNumber"");
		vMSISDN = GetProperty(""vMSISDN"");
		vSIM = GetProperty(""vSIM"");
		vPackage = GetProperty(""vPackage"");
		vPlan = GetProperty(""vPlan"");
		vContract = GetProperty(""PlanContractName"");
		vDevice = GetProperty(""vDevice"");
		MENASANNumber = GetProperty(""MENASANNumber"");
		BlkReqId = GetProperty(""BulkRequestId"");
		CRMBulkReqId = GetProperty(""CRMBulkReqId"");
		vAccountStatus = GetProperty(""AccountStatus"");
		Sequence = GetProperty(""Sequence"");
		NewRouterName = GetProperty(""NewRouterName"");//[MANUJ] : [BB Automation]
		RequestType = GetProperty(""RequestType"");//[MANUJ] : [BB Automation]
		ContractPartNum= GetProperty(""ContractPartNum"");//[MANUJ] : [BB Automation]
		vRouterContract= GetProperty(""vRouterContract"");
		vRouterName= GetProperty(""vRouterName"");
		vSmartContract= GetProperty(""vSmartContract"");
		vSmartDevice= GetProperty(""vSmartDevice"");
 }

 var Out = TheApplication().NewPropertySet();
 var vOrderType = ""New"";

 try
 {
  sLoginId = TheApplication().LoginId();

  var Header = ""Order"";

  var psSiebelActSetMsg:PropertySet = TheApplication().NewPropertySet();
  var psListOfActionSet:PropertySet = TheApplication().NewPropertySet();

  //Bulk Request Action Set configuration
  with(psSiebelActSetMsg)
  {
   SetType(""SiebelMessage"");
   SetProperty(""MessageId"", ""1-4T7UTH"");
   SetProperty(""MessageType"", ""Integration Object"");
   SetProperty(""IntObjectName"", ""ABO Bulk Action Set IO"");
   SetProperty(""IntObjectFormat"", ""Siebel Hierarchical"");
  }
  psListOfActionSet.SetType(""ListOfABO Bulk Action Set IO"");
  psSiebelActSetMsg.AddChild(psListOfActionSet);
  
  switch(vOrderType) 
  {
   case ""New"":
    NewBulkOrder(CustActNumber,Sequence,CRMBulkReqId,BilActNumber,vMSISDN,vSIM,vPackage,vPlan,vContract,vDevice,psListOfActionSet,Header,MENASANNumber,BlkReqId,vAccountStatus,NewRouterName,RequestType,ContractPartNum,vRouterContract,vRouterName,vSmartContract,vSmartDevice);//[MANUJ] : [BB Automation]
    break;
    
   default: return(CancelOperation);
  }

  var wfBS = TheApplication().GetService(""EAI Siebel Adapter"");
  var InP = TheApplication().NewPropertySet();
  var OutP = TheApplication().NewPropertySet();
  var FaultMsg = TheApplication().NewPropertySet();
  with(InP)
  {
   SetProperty(""ObjectLevelTransactions"", ""true"");
   SetProperty(""StatusObject"", ""true"");
   AddChild(psSiebelActSetMsg);
  }
  wfBS.InvokeMethod(""Upsert"",InP,OutP);

  var FullMsg = OutP.GetChild(0).GetChild(0);
  var ChildCount = FullMsg.GetChildCount();
  var RecordCount = BulkCount - ChildCount;
  
  var ActSetChildCount=0, ErrMsg="""", ErrCustomerId="""", ErrBillAccId="""", ActionSetChildCount=0, ErrPackage="""", ErrMSISDN=""""; 
  //var ActionSetChild=null, InstanceChild=null;
  var SiebMsgRequest="""";
  var ErrHandlerBS = TheApplication().GetService(""STC Generic Error Handler""); 
  var HandlerIn = TheApplication().NewPropertySet();
  var HandlerOut = TheApplication().NewPropertySet();

  for (var i = 0; i < ChildCount; i++)
  {
   ActSetChildCount = FullMsg.GetChild(i).GetChildCount();
   if(ActSetChildCount >= 1)
   {
    var ActionSetChild = FullMsg.GetChild(i);
    ErrMsg = ActionSetChild.GetProperty(""ErrorMessage"");
    ErrCustomerId = ActionSetChild.GetProperty(""Customer Account Id"");
    ErrBillAccId = ActionSetChild.GetProperty(""Billing Account Id"");
      
    var ActionsChild = ActionSetChild.GetChild(0).GetChild(0);
    ActionSetChildCount = ActionSetChild.GetChild(0).GetChildCount();

    ErrPackage = ActionsChild.GetProperty(""Base Product Name"");
    if(ActionSetChildCount == 1)
    {
     var InstanceChild = ActionSetChild.GetChild(1).GetChild(0);
     ErrMSISDN = InstanceChild.GetProperty(""Service Id"");
    }
    SiebMsgRequest = ErrCustomerId + "","" + ErrBillAccId +  "","" + ErrPackage + "","" + ErrMSISDN;
    
    with(HandlerIn)
    {
     SetProperty(""Error Code"", BulkRequestId);
     SetProperty(""Error Message"", ErrMsg);
     SetProperty(""Object Name"", ""STC Bulk File Import BS"");
     SetProperty(""Object Type"", ""Buisness Service"");
     SetProperty(""Siebel Message Request Text"", SiebMsgRequest);
     SetProperty(""Siebel Message Response Text"", """");
    }
    ErrHandlerBS.InvokeMethod(""Log Message"", HandlerIn, HandlerOut);
    
   }//end of if(ActSetChildCount >= 1)
  
  }//end of for (var i = 0; ...

  Outputs.SetProperty(""BulkRequestId"",BulkRequestId);

 }//try
 catch(e)
 { 
  vErrorMessage = e.toString();
  vErrorCode    = e.errCode; 
  LogException(e);
  TheApplication().RaiseErrorText(vErrorMessage);
 }
 finally
 {
  oBulkReqBC = null;
  oAccountBC = null;
  oBulkReqBO = null;
  oAccountBO = null;
  vBulkDataArray = null;
  wfBS = null;
  InP = null;
  OutP = null;
  psSiebelActSetMsg = null;
  HandlerIn = null;
  HandlerOut = null;
  ErrHandlerBS= null;
  psListOfActionSet = null;
 }
}
function CreateBulkRequest( Inputs, Outputs)
{
 var vInputFile      = """";
 var vReadFromFile   = """";
 var vBulkDataArray  = new Array; 
 var CustActNumber="""", BilActNumber="""", vMSISDN="""", vSIM="""", vPackage="""", vPlan="""", vContract="""", vDevice="""", MENASANNumber="""", BlkReqId="""", CRMBulkReqId="""", NewRouterName = """",vAccountStatus="""",RequestType="""";
 var ContractPartNum = """";
 var vRouterName="""", vRouterContract="""",vSmartDevice="""",vSmartContract="""",vAddon1Name="""",vAddon2Name="""",vAddon1ContractName="""",vAddon2ContractName="""";
 var Sequence:Number = 1;
 with(Inputs)
 {
		CustActNumber = GetProperty(""CustActNumber"");
		BilActNumber = GetProperty(""BilActNumber"");
		vMSISDN = GetProperty(""vMSISDN"");
		vSIM = GetProperty(""vSIM"");
		vPackage = GetProperty(""vPackage"");
		vPlan = GetProperty(""vPlan"");
		vContract = GetProperty(""PlanContractName"");
		vDevice = GetProperty(""vDevice"");
		MENASANNumber = GetProperty(""MENASANNumber"");
		BlkReqId = GetProperty(""BulkRequestId"");
		CRMBulkReqId = GetProperty(""CRMBulkReqId"");
		vAccountStatus = GetProperty(""AccountStatus"");
		Sequence = GetProperty(""Sequence"");
		NewRouterName = GetProperty(""NewRouterName"");//[MANUJ] : [BB Automation]
		RequestType = GetProperty(""RequestType"");//[MANUJ] : [BB Automation]
		ContractPartNum= GetProperty(""ContractPartNum"");//[MANUJ] : [BB Automation]
		vRouterContract= GetProperty(""vRouterContract"");
		vRouterName= GetProperty(""vRouterName"");
		vSmartContract= GetProperty(""vSmartContract"");
		vSmartDevice= GetProperty(""vSmartDevice"");
		vAddon1Name= GetProperty(""Addon1Name"");
		vAddon2Name= GetProperty(""Addon2Name"");
		vAddon1ContractName= GetProperty(""Addon1ContractName"");
		vAddon2ContractName= GetProperty(""Addon2ContractName"");
 }

 var Out = TheApplication().NewPropertySet();
 var vOrderType = ""New"";

 try
 {
  sLoginId = TheApplication().LoginId();

  var Header = ""Order"";

  var psSiebelActSetMsg:PropertySet = TheApplication().NewPropertySet();
  var psListOfActionSet:PropertySet = TheApplication().NewPropertySet();

  //Bulk Request Action Set configuration
  with(psSiebelActSetMsg)
  {
   SetType(""SiebelMessage"");
   SetProperty(""MessageId"", ""1-4T7UTH"");
   SetProperty(""MessageType"", ""Integration Object"");
   SetProperty(""IntObjectName"", ""ABO Bulk Action Set IO"");
   SetProperty(""IntObjectFormat"", ""Siebel Hierarchical"");
  }
  psListOfActionSet.SetType(""ListOfABO Bulk Action Set IO"");
  psSiebelActSetMsg.AddChild(psListOfActionSet);
  
  switch(vOrderType) 
  {
   case ""New"":
    NewBulkOrder(CustActNumber,Sequence,CRMBulkReqId,BilActNumber,vMSISDN,vSIM,vPackage,vPlan,vContract,vDevice,psListOfActionSet,Header,MENASANNumber,BlkReqId,vAccountStatus,NewRouterName,RequestType,ContractPartNum,vRouterContract,vRouterName,vSmartContract,vSmartDevice,vAddon1Name,vAddon2Name,vAddon1ContractName,vAddon2ContractName);//[MANUJ] : [BB Automation]
    break;
    
   default: return(CancelOperation);
  }

  var wfBS = TheApplication().GetService(""EAI Siebel Adapter"");
  var InP = TheApplication().NewPropertySet();
  var OutP = TheApplication().NewPropertySet();
  var FaultMsg = TheApplication().NewPropertySet();
  with(InP)
  {
   SetProperty(""ObjectLevelTransactions"", ""true"");
   SetProperty(""StatusObject"", ""true"");
   AddChild(psSiebelActSetMsg);
  }
  wfBS.InvokeMethod(""Upsert"",InP,OutP);

  var FullMsg = OutP.GetChild(0).GetChild(0);
  var ChildCount = FullMsg.GetChildCount();
  var RecordCount = BulkCount - ChildCount;
  
  var ActSetChildCount=0, ErrMsg="""", ErrCustomerId="""", ErrBillAccId="""", ActionSetChildCount=0, ErrPackage="""", ErrMSISDN=""""; 
  //var ActionSetChild=null, InstanceChild=null;
  var SiebMsgRequest="""";
  var ErrHandlerBS = TheApplication().GetService(""STC Generic Error Handler""); 
  var HandlerIn = TheApplication().NewPropertySet();
  var HandlerOut = TheApplication().NewPropertySet();

  for (var i = 0; i < ChildCount; i++)
  {
   ActSetChildCount = FullMsg.GetChild(i).GetChildCount();
   if(ActSetChildCount >= 1)
   {
    var ActionSetChild = FullMsg.GetChild(i);
    ErrMsg = ActionSetChild.GetProperty(""ErrorMessage"");
    ErrCustomerId = ActionSetChild.GetProperty(""Customer Account Id"");
    ErrBillAccId = ActionSetChild.GetProperty(""Billing Account Id"");
      
    var ActionsChild = ActionSetChild.GetChild(0).GetChild(0);
    ActionSetChildCount = ActionSetChild.GetChild(0).GetChildCount();

    ErrPackage = ActionsChild.GetProperty(""Base Product Name"");
    if(ActionSetChildCount == 1)
    {
     var InstanceChild = ActionSetChild.GetChild(1).GetChild(0);
     ErrMSISDN = InstanceChild.GetProperty(""Service Id"");
    }
    SiebMsgRequest = ErrCustomerId + "","" + ErrBillAccId +  "","" + ErrPackage + "","" + ErrMSISDN;
    
    with(HandlerIn)
    {
     SetProperty(""Error Code"", BulkRequestId);
     SetProperty(""Error Message"", ErrMsg);
     SetProperty(""Object Name"", ""STC Bulk File Import BS"");
     SetProperty(""Object Type"", ""Buisness Service"");
     SetProperty(""Siebel Message Request Text"", SiebMsgRequest);
     SetProperty(""Siebel Message Response Text"", """");
    }
    ErrHandlerBS.InvokeMethod(""Log Message"", HandlerIn, HandlerOut);
    
   }//end of if(ActSetChildCount >= 1)
  
  }//end of for (var i = 0; ...

  Outputs.SetProperty(""BulkRequestId"",BulkRequestId);

 }//try
 catch(e)
 { 
  vErrorMessage = e.toString();
  vErrorCode    = e.errCode; 
  LogException(e);
  TheApplication().RaiseErrorText(vErrorMessage);
 }
 finally
 {
  oBulkReqBC = null;
  oAccountBC = null;
  oBulkReqBO = null;
  oAccountBO = null;
  vBulkDataArray = null;
  wfBS = null;
  InP = null;
  OutP = null;
  psSiebelActSetMsg = null;
  HandlerIn = null;
  HandlerOut = null;
  ErrHandlerBS= null;
  psListOfActionSet = null;
 }
}
function GetTimeStamp()
{
 var SysDate = Clib.time();
 var ObjDate = Date.fromSystem(SysDate); 

 var Month = ToString(ObjDate.getMonth()+1);
  if(Month.length == 1)   
   {
    Month = ""0"" + Month;
   }
 var Day = ToString(ObjDate.getDate());
  if(Day.length == 1)
   {
    Day = ""0"" + Day;
   }
 var Year = ToString(ObjDate.getFullYear());
 var Hour = ToString(ObjDate.getHours());
  if(Hour.length == 1)
   {
    Hour = ""0"" + Hour;
   }
 var Minute = ToString(ObjDate.getMinutes());
  if(Minute.length == 1)
   {
    Minute = ""0"" + Minute;
   }
 var Second = ToString(ObjDate.getSeconds()); 
  if(Second.length == 1)
   {
    Second = ""0"" + Second;
   }

 var now = Day+""""+Month+""""+Year+""""+Hour+""""+Minute+""""+Second; 

 return(now);
}
function LogException(e)
{
 var appObj= TheApplication();
   var Input;
   var Output;
   var CallMessageHandler; 
 try
  {
    
    Input = appObj.NewPropertySet();
    Output = appObj.NewPropertySet();
    var SiebMsgRequest = vCANId + "","" + vBANId +  "","" + vMSISDN + "","" + vPackage;
    CallMessageHandler = appObj.GetService(""STC Generic Error Handler""); 
    Input.SetProperty(""Error Code"", BulkRequestId);
    Input.SetProperty(""Error Message"", e.errText);
    Input.SetProperty(""Object Name"", ""STC Create Bulk Order Request Bulk Extraction BS"");
    Input.SetProperty(""Object Type"", ""Buisness Service"");
    Input.SetProperty(""Siebel Message Request Text"", SiebMsgRequest);
    Input.SetProperty(""Siebel Message Response Text"", """");
    CallMessageHandler.InvokeMethod(""Log Message"", Input, Output);
  }
  catch(e)
  {
    
  }
  finally
  {
 
    CallMessageHandler = null;
    Output = null;
    Input = null;
    appObj = null;
  }
  
}
function NewBulkOrder (CustActNumber,Sequence,CRMBulkReqId,BilActNumber,vMSISDN,vSIM,vPackage,vPlan,vContract,vDevice,psListOfActionSet,Header,MENASANNumber,BlkReqId,vAccountStatus,NewRouterName,RequestType,ContractPartNum,vRouterContract,vRouterName,vSmartContract,vSmartDevice)//[MANUJ] : [BB Automation]
{
 try
 {
  var oAccountBO = TheApplication().GetBusObject(""Account"");
  var oAccountBC = oAccountBO.GetBusComp(""Account"");
  var oBulkReqBO = TheApplication().GetBusObject(""ABO Bulk Request"");
  var oBulkReqBC = oBulkReqBO.GetBusComp(""ABO Bulk Request Header"");;
  var MENAProdBO = TheApplication().GetBusObject(""STC MENA Product BO"");
  var MENAProdBC = MENAProdBO.GetBusComp(""STC MENA Product Data BC"");
  var AddonName="""", AddonContract="""", AddonType="""", vCustType="""";
  var vSeq:Number = 1;
  var vBillProfId = """"; 
  var vDTime = GetTimeStamp();
  var vBulkOrdFileName = ""BULKEXTRACTION""+ ""_""+ vDTime;   
  var oBillAccBO = TheApplication().GetBusObject(""STC Billing Account"");
  var oBillAccBC = oBillAccBO.GetBusComp(""CUT Invoice Sub Accounts"");
  var psListOfActions:PropertySet = TheApplication().NewPropertySet();
  psListOfActions.SetType(""ListOfActions"");
  var psListOfInstance:PropertySet = TheApplication().NewPropertySet();
  psListOfInstance.SetType(""ListOfInstance"");
  var Externaldentifier = """";//[MANUJ] : [Network Change Automation]
  with(oAccountBC)
  {
   ClearToQuery();
   SetViewMode(AllView);
   ActivateField(""Id"");
   ActivateField(""Name"");
   ActivateField(""Account Number"");
   ActivateField(""Type"");
   SetSearchSpec(""Id"",CustActNumber);
   ExecuteQuery(ForwardOnly);
   if(FirstRecord())
   {
    AccName = GetFieldValue(""Name"");
    vCANId = GetFieldValue(""Id"");
    vCustType = GetFieldValue(""Type"");
   }
  }//end of with(oAccountBC)
  with(oBillAccBC)
  {
   ClearToQuery();
   SetViewMode(AllView);
   ActivateField(""Id"");
   ActivateField(""Account Number"");
   ActivateField(""Primary Billing Profile Id"");
   SetSearchSpec(""Id"",BilActNumber);
   ExecuteQuery(ForwardOnly);
   if(FirstRecord())
   {
    vBANId = GetFieldValue(""Id"");
    vBillProfId = GetFieldValue(""Primary Billing Profile Id"");
   }
  }//end of with(oBillAccBC)
  
  // Setting Bulk Request Header
  if(BlkReqId != """" && BlkReqId != null && BlkReqId != '')
  {
   BulkRequestId = BlkReqId;
   Header = null;
  }
  else if(Header == ""Order"" && (BlkReqId == """" || BlkReqId == null || BlkReqId == ''))
  {
   with(oBulkReqBC)
   {
    ActivateField(""BRFileName"");
    ActivateField(""Bulk Request Name"");
    ActivateField(""Status"");
    ActivateField(""User Id"");
    ActivateField(""Mode"");
    NewRecord(NewAfter);
    SetFieldValue(""BRFileName"","""");
    SetFieldValue(""Bulk Request Name"",vBulkOrdFileName);
    SetFieldValue(""Status"",""New"");
    SetFieldValue(""Mode"",Header);
    SetFieldValue(""User Id"",sLoginId);
    WriteRecord();
    BulkRequestId = GetFieldValue(""Id"");
    Header = null;
   }
  }//end of else if(Header...

  //setting Action Set
  var psActionSet:PropertySet = TheApplication().NewPropertySet();
  var i =1;
  with(psActionSet)
  {
   SetType(""Action Set"");
   SetProperty(""Id"",i);
   SetProperty(""Customer Account"",AccName);
   SetProperty(""Customer Account Id"",vCANId);
   SetProperty(""Billing Account Id"", vBANId);
   SetProperty(""Bulk Request Id"",BulkRequestId);
   SetProperty(""Billing Profile Id"",vBillProfId);
   SetProperty(""CRM Bulk Request Id"",CRMBulkReqId);
   SetProperty(""Service Account"","""");
   SetProperty(""Type"",""New"");
   SetProperty(""Order Type"",""Provide"");
   SetProperty(""Sequence"",i+Sequence);
   SetProperty(""Active Flag"",""Y"");
   // SetProperty(""Account"",AccName);
   SetProperty(""Child Instance Type"",""Service Id"");
   SetProperty(""Scope"",""Include""); 
   SetProperty(""SIM Number"",vSIM);
   SetProperty(""AnyChildInError"",""N"");
   SetProperty(""Template Flag"",""N"");
   SetProperty(""Valid Flag"",""N"");
  }
  
  var psActions:PropertySet = TheApplication().NewPropertySet();
  with(psActions)
  {
   SetType(""Actions"");
   SetProperty(""Id"",vSeq);
   SetProperty(""Sequence"",vSeq);
   SetProperty(""Base Product Name"",vPackage);
   SetProperty(""Action Code"",""Add"");       
   SetProperty(""Active Flag"",""Y"");
   SetProperty(""Allow Multiple Instance"",""N"");
   SetProperty(""Component Product Name"","""");
   SetProperty(""Field Name"","""");
   SetProperty(""Attribute Name"","""");
  }
  psListOfActions.AddChild(psActions);
  
  var psActionsPlan:PropertySet = TheApplication().NewPropertySet();
  if(vPlan != """" && vPlan != null && vPlan != '')
  {
   vSeq = vSeq+1;
   with(psActionsPlan)
   {
    SetType(""Actions"");
    SetProperty(""Id"",vSeq);
    SetProperty(""Sequence"",vSeq);
    SetProperty(""Base Product Name"",vPackage);
    SetProperty(""Action Code"",""Add""); 
    SetProperty(""Active Flag"",""Y"");
    SetProperty(""Allow Multiple Instance"",""N"");
    SetProperty(""Component Product Name"",vPlan);
    SetProperty(""Field Name"","""");
    SetProperty(""Attribute Name"","""");
   }
   psListOfActions.AddChild(psActionsPlan);
  }
        //[MANUJ] : [BB Automation]
   var psActionsvRouterContract:PropertySet = TheApplication().NewPropertySet();
  if(vRouterContract != """" && vRouterContract != null && vRouterContract != '')
  {
   vSeq = vSeq+1;
   with(psActionsvRouterContract)
   {
    SetType(""Actions"");
    SetProperty(""Id"",vSeq);
    SetProperty(""Sequence"",vSeq);
    SetProperty(""Base Product Name"",vPackage);
    SetProperty(""Action Code"",""Add""); 
    SetProperty(""Active Flag"",""Y"");
    SetProperty(""Allow Multiple Instance"",""N"");
    SetProperty(""Component Product Name"",vRouterContract);
    SetProperty(""Field Name"","""");
    SetProperty(""Attribute Name"","""");
   }
   psListOfActions.AddChild(psActionsvRouterContract);
  }
psActionsvRouterContract = null;

   var psActionsvRouterName:PropertySet = TheApplication().NewPropertySet();
  if(vRouterName != """" && vRouterName != null && vRouterName != '')
  {
   vSeq = vSeq+1;
   with(psActionsvRouterName)
   {
    SetType(""Actions"");
    SetProperty(""Id"",vSeq);
    SetProperty(""Sequence"",vSeq);
    SetProperty(""Base Product Name"",vPackage);
    SetProperty(""Action Code"",""Add""); 
    SetProperty(""Active Flag"",""Y"");
    SetProperty(""Allow Multiple Instance"",""N"");
    SetProperty(""Component Product Name"",vRouterName);
    SetProperty(""Field Name"","""");
    SetProperty(""Attribute Name"","""");
   }
   psListOfActions.AddChild(psActionsvRouterName);
  }

psActionsvRouterName = null;

   var psActionsvSmartContract:PropertySet = TheApplication().NewPropertySet();
  if(vSmartContract != """" && vSmartContract != null && vSmartContract != '')
  {
   vSeq = vSeq+1;
   with(psActionsvSmartContract)
   {
    SetType(""Actions"");
    SetProperty(""Id"",vSeq);
    SetProperty(""Sequence"",vSeq);
    SetProperty(""Base Product Name"",vPackage);
    SetProperty(""Action Code"",""Add""); 
    SetProperty(""Active Flag"",""Y"");
    SetProperty(""Allow Multiple Instance"",""N"");
    SetProperty(""Component Product Name"",vSmartContract);
    SetProperty(""Field Name"","""");
    SetProperty(""Attribute Name"","""");
   }
   psListOfActions.AddChild(psActionsvSmartContract);
  }

psActionsvSmartContract = null;

   var psActionsvSmartDevice:PropertySet = TheApplication().NewPropertySet();
  if(vSmartDevice != """" && vSmartDevice != null && vSmartDevice != '')
  {
   vSeq = vSeq+1;
   with(psActionsvSmartDevice)
   {
    SetType(""Actions"");
    SetProperty(""Id"",vSeq);
    SetProperty(""Sequence"",vSeq);
    SetProperty(""Base Product Name"",vPackage);
    SetProperty(""Action Code"",""Add""); 
    SetProperty(""Active Flag"",""Y"");
    SetProperty(""Allow Multiple Instance"",""N"");
    SetProperty(""Component Product Name"",vSmartDevice);
    SetProperty(""Field Name"","""");
    SetProperty(""Attribute Name"","""");
   }
   psListOfActions.AddChild(psActionsvSmartDevice);
  }

psActionsvSmartDevice = null;

   var psActionsvPlanContract:PropertySet = TheApplication().NewPropertySet();
  if(vContract != """" && vContract != null && vContract != '')
  {
   vSeq = vSeq+1;
   with(psActionsvPlanContract)
   {
    SetType(""Actions"");
    SetProperty(""Id"",vSeq);
    SetProperty(""Sequence"",vSeq);
    SetProperty(""Base Product Name"",vPackage);
    SetProperty(""Action Code"",""Add""); 
    SetProperty(""Active Flag"",""Y"");
    SetProperty(""Allow Multiple Instance"",""N"");
    SetProperty(""Component Product Name"",vContract);
    SetProperty(""Field Name"","""");
    SetProperty(""Attribute Name"","""");
   }
   psListOfActions.AddChild(psActionsvPlanContract);
  }

psActionsvPlanContract = null;

  
  if(vAccountStatus == """" || vAccountStatus == null || vAccountStatus != ""Terminated"")
  {
   with(MENAProdBC)
   {
    ClearToQuery();
    SetViewMode(AllView);
    ActivateField(""MENA Service Number"");
    ActivateField(""MSISDN"");
    ActivateField(""Product Name"");
    ActivateField(""Contract Name"");
    ActivateField(""Type"");
	ActivateField(""Product Attribute 8""); //[MANUJ] : [Network Change Automation]
	ActivateField(""Parent Row Id"");//[MANUJ] : [Network Change Automation]
	//SetSearchSpec(""MENA Service Number"", MENASANNumber);
	SetSearchSpec(""Parent Row Id"", CRMBulkReqId);
    ExecuteQuery(ForwardOnly);
    var ProdRec = FirstRecord();
    while(ProdRec)
    {
     AddonName = GetFieldValue(""Product Name"");
     AddonContract = GetFieldValue(""Contract Name"");
     Externaldentifier = GetFieldValue(""Product Attribute 8"");//[MANUJ] : [Network Change Automation]

     AddonType = GetFieldValue(""Type"");
     vSeq = vSeq+1;
     var psActionsAddon:PropertySet = TheApplication().NewPropertySet();
     with(psActionsAddon)
     {
      SetType(""Actions"");
      SetProperty(""Id"",vSeq);
      SetProperty(""Sequence"",vSeq);
      SetProperty(""Base Product Name"",vPackage);
      SetProperty(""Action Code"",""Add""); 
      SetProperty(""Active Flag"",""Y"");
      SetProperty(""Allow Multiple Instance"",""N"");
      SetProperty(""Component Product Name"",AddonName);
      SetProperty(""Field Name"","""");
      SetProperty(""Attribute Name"","""");
     }//with(psActionsAddon)
     psListOfActions.AddChild(psActionsAddon);
     ProdRec = NextRecord();
     psActionsAddon = null;
    }// while(ProdRec)
   }// with(MENAProdBC)
  }//end of if(vAccountStatus == """" ||...

  psActions = null;

  // Setting Instance
  var psInstance:PropertySet = TheApplication().NewPropertySet();
  with(psInstance)
  {
   SetType(""Instance"");
   SetProperty(""Service Id"",vMSISDN);
   SetProperty(""Id"",""12345"");
   SetProperty(""Sequence"",""1"");
  }
  
  psListOfInstance.AddChild(psInstance);
  psActionSet.AddChild(psListOfInstance);
  psActionSet.AddChild(psListOfActions);
  psListOfActionSet.AddChild(psActionSet);

  return psListOfActionSet;

 }
 catch(e)
 {
  LogException(e);
  if(BulkRequestId == null || BulkRequestId == """")
  {
   TheApplication().RaiseErrorText(""Request Name is already exists, Please enter unique request name"");
  }
 }
 finally
 {
  AccName = """";
  psInstance= null;
  psActionsPlan = null;
  psActions= null;
  psActionSet = null;
  psListOfActions = null;
  psListOfInstance = null;
  oBillAccBC = null;
  oBillAccBO = null;
 }
}
function NewBulkOrder (CustActNumber,Sequence,CRMBulkReqId,BilActNumber,vMSISDN,vSIM,vPackage,vPlan,vContract,vDevice,psListOfActionSet,Header,MENASANNumber,BlkReqId,vAccountStatus,NewRouterName,RequestType,ContractPartNum,vRouterContract,vRouterName,vSmartContract,vSmartDevice,vAddon1Name,vAddon2Name,vAddon1ContractName,vAddon2ContractName)//[MANUJ] : [BB Automation]
{
 try
 {
  var oAccountBO = TheApplication().GetBusObject(""Account"");
  var oAccountBC = oAccountBO.GetBusComp(""Account"");
  var oBulkReqBO = TheApplication().GetBusObject(""ABO Bulk Request"");
  var oBulkReqBC = oBulkReqBO.GetBusComp(""ABO Bulk Request Header"");;
  var MENAProdBO = TheApplication().GetBusObject(""STC MENA Product BO"");
  var MENAProdBC = MENAProdBO.GetBusComp(""STC MENA Product Data BC"");
  var AddonName="""", AddonContract="""", AddonType="""", vCustType="""";
  var vSeq:Number = 1;
  var vBillProfId = """"; 
  var vDTime = GetTimeStamp();
  var vBulkOrdFileName = ""BULKEXTRACTION""+ ""_""+ vDTime;   
  var oBillAccBO = TheApplication().GetBusObject(""STC Billing Account"");
  var oBillAccBC = oBillAccBO.GetBusComp(""CUT Invoice Sub Accounts"");
  var psListOfActions:PropertySet = TheApplication().NewPropertySet();
  psListOfActions.SetType(""ListOfActions"");
  var psListOfInstance:PropertySet = TheApplication().NewPropertySet();
  psListOfInstance.SetType(""ListOfInstance"");
  var Externaldentifier = """";//[MANUJ] : [Network Change Automation]
  with(oAccountBC)
  {
   ClearToQuery();
   SetViewMode(AllView);
   ActivateField(""Id"");
   ActivateField(""Name"");
   ActivateField(""Account Number"");
   ActivateField(""Type"");
   SetSearchSpec(""Id"",CustActNumber);
   ExecuteQuery(ForwardOnly);
   if(FirstRecord())
   {
    AccName = GetFieldValue(""Name"");
    vCANId = GetFieldValue(""Id"");
    vCustType = GetFieldValue(""Type"");
   }
  }//end of with(oAccountBC)
  with(oBillAccBC)
  {
   ClearToQuery();
   SetViewMode(AllView);
   ActivateField(""Id"");
   ActivateField(""Account Number"");
   ActivateField(""Primary Billing Profile Id"");
   SetSearchSpec(""Id"",BilActNumber);
   ExecuteQuery(ForwardOnly);
   if(FirstRecord())
   {
    vBANId = GetFieldValue(""Id"");
    vBillProfId = GetFieldValue(""Primary Billing Profile Id"");
   }
  }//end of with(oBillAccBC)
  
  // Setting Bulk Request Header
  if(BlkReqId != """" && BlkReqId != null && BlkReqId != '')
  {
   BulkRequestId = BlkReqId;
   Header = null;
  }
  else if(Header == ""Order"" && (BlkReqId == """" || BlkReqId == null || BlkReqId == ''))
  {
   with(oBulkReqBC)
   {
    ActivateField(""BRFileName"");
    ActivateField(""Bulk Request Name"");
    ActivateField(""Status"");
    ActivateField(""User Id"");
    ActivateField(""Mode"");
    NewRecord(NewAfter);
    SetFieldValue(""BRFileName"","""");
    SetFieldValue(""Bulk Request Name"",vBulkOrdFileName);
    SetFieldValue(""Status"",""New"");
    SetFieldValue(""Mode"",Header);
    SetFieldValue(""User Id"",sLoginId);
    WriteRecord();
    BulkRequestId = GetFieldValue(""Id"");
    Header = null;
   }
  }//end of else if(Header...

  //setting Action Set
  var psActionSet:PropertySet = TheApplication().NewPropertySet();
  var i =1;
  with(psActionSet)
  {
   SetType(""Action Set"");
   SetProperty(""Id"",i);
   SetProperty(""Customer Account"",AccName);
   SetProperty(""Customer Account Id"",vCANId);
   SetProperty(""Billing Account Id"", vBANId);
   SetProperty(""Bulk Request Id"",BulkRequestId);
   SetProperty(""Billing Profile Id"",vBillProfId);
   SetProperty(""CRM Bulk Request Id"",CRMBulkReqId);
   SetProperty(""Service Account"","""");
   SetProperty(""Type"",""New"");
   SetProperty(""Order Type"",""Provide"");
   SetProperty(""Sequence"",i+Sequence);
   SetProperty(""Active Flag"",""Y"");
   // SetProperty(""Account"",AccName);
   SetProperty(""Child Instance Type"",""Service Id"");
   SetProperty(""Scope"",""Include""); 
   SetProperty(""SIM Number"",vSIM);
   SetProperty(""AnyChildInError"",""N"");
   SetProperty(""Template Flag"",""N"");
   SetProperty(""Valid Flag"",""N"");
  }
  
  var psActions:PropertySet = TheApplication().NewPropertySet();
  with(psActions)
  {
   SetType(""Actions"");
   SetProperty(""Id"",vSeq);
   SetProperty(""Sequence"",vSeq);
   SetProperty(""Base Product Name"",vPackage);
   SetProperty(""Action Code"",""Add"");       
   SetProperty(""Active Flag"",""Y"");
   SetProperty(""Allow Multiple Instance"",""N"");
   SetProperty(""Component Product Name"","""");
   SetProperty(""Field Name"","""");
   SetProperty(""Attribute Name"","""");
  }
  psListOfActions.AddChild(psActions);
  
  var psActionsPlan:PropertySet = TheApplication().NewPropertySet();
  if(vPlan != """" && vPlan != null && vPlan != '')
  {
   vSeq = vSeq+1;
   with(psActionsPlan)
   {
    SetType(""Actions"");
    SetProperty(""Id"",vSeq);
    SetProperty(""Sequence"",vSeq);
    SetProperty(""Base Product Name"",vPackage);
    SetProperty(""Action Code"",""Add""); 
    SetProperty(""Active Flag"",""Y"");
    SetProperty(""Allow Multiple Instance"",""N"");
    SetProperty(""Component Product Name"",vPlan);
    SetProperty(""Field Name"","""");
    SetProperty(""Attribute Name"","""");
   }
   psListOfActions.AddChild(psActionsPlan);
  }
        //[MANUJ] : [BB Automation]
   var psActionsvRouterContract:PropertySet = TheApplication().NewPropertySet();
  if(vRouterContract != """" && vRouterContract != null && vRouterContract != '')
  {
   vSeq = vSeq+1;
   with(psActionsvRouterContract)
   {
    SetType(""Actions"");
    SetProperty(""Id"",vSeq);
    SetProperty(""Sequence"",vSeq);
    SetProperty(""Base Product Name"",vPackage);
    SetProperty(""Action Code"",""Add""); 
    SetProperty(""Active Flag"",""Y"");
    SetProperty(""Allow Multiple Instance"",""N"");
    SetProperty(""Component Product Name"",vRouterContract);
    SetProperty(""Field Name"","""");
    SetProperty(""Attribute Name"","""");
   }
   psListOfActions.AddChild(psActionsvRouterContract);
  }
psActionsvRouterContract = null;

   var psActionsvRouterName:PropertySet = TheApplication().NewPropertySet();
  if(vRouterName != """" && vRouterName != null && vRouterName != '')
  {
   vSeq = vSeq+1;
   with(psActionsvRouterName)
   {
    SetType(""Actions"");
    SetProperty(""Id"",vSeq);
    SetProperty(""Sequence"",vSeq);
    SetProperty(""Base Product Name"",vPackage);
    SetProperty(""Action Code"",""Add""); 
    SetProperty(""Active Flag"",""Y"");
    SetProperty(""Allow Multiple Instance"",""N"");
    SetProperty(""Component Product Name"",vRouterName);
    SetProperty(""Field Name"","""");
    SetProperty(""Attribute Name"","""");
   }
   psListOfActions.AddChild(psActionsvRouterName);
  }

psActionsvRouterName = null;

   var psActionsvSmartContract:PropertySet = TheApplication().NewPropertySet();
  if(vSmartContract != """" && vSmartContract != null && vSmartContract != '')
  {
   vSeq = vSeq+1;
   with(psActionsvSmartContract)
   {
    SetType(""Actions"");
    SetProperty(""Id"",vSeq);
    SetProperty(""Sequence"",vSeq);
    SetProperty(""Base Product Name"",vPackage);
    SetProperty(""Action Code"",""Add""); 
    SetProperty(""Active Flag"",""Y"");
    SetProperty(""Allow Multiple Instance"",""N"");
    SetProperty(""Component Product Name"",vSmartContract);
    SetProperty(""Field Name"","""");
    SetProperty(""Attribute Name"","""");
   }
   psListOfActions.AddChild(psActionsvSmartContract);
  }

psActionsvSmartContract = null;

   var psActionsvSmartDevice:PropertySet = TheApplication().NewPropertySet();
  if(vSmartDevice != """" && vSmartDevice != null && vSmartDevice != '')
  {
   vSeq = vSeq+1;
   with(psActionsvSmartDevice)
   {
    SetType(""Actions"");
    SetProperty(""Id"",vSeq);
    SetProperty(""Sequence"",vSeq);
    SetProperty(""Base Product Name"",vPackage);
    SetProperty(""Action Code"",""Add""); 
    SetProperty(""Active Flag"",""Y"");
    SetProperty(""Allow Multiple Instance"",""N"");
    SetProperty(""Component Product Name"",vSmartDevice);
    SetProperty(""Field Name"","""");
    SetProperty(""Attribute Name"","""");
   }
   psListOfActions.AddChild(psActionsvSmartDevice);
  }

psActionsvSmartDevice = null;

   var psActionsvPlanContract:PropertySet = TheApplication().NewPropertySet();
  if(vContract != """" && vContract != null && vContract != '')
  {
   vSeq = vSeq+1;
   with(psActionsvPlanContract)
   {
    SetType(""Actions"");
    SetProperty(""Id"",vSeq);
    SetProperty(""Sequence"",vSeq);
    SetProperty(""Base Product Name"",vPackage);
    SetProperty(""Action Code"",""Add""); 
    SetProperty(""Active Flag"",""Y"");
    SetProperty(""Allow Multiple Instance"",""N"");
    SetProperty(""Component Product Name"",vContract);
    SetProperty(""Field Name"","""");
    SetProperty(""Attribute Name"","""");
   }
   psListOfActions.AddChild(psActionsvPlanContract);
  }

psActionsvPlanContract = null;

/*
Mark:2009201:Cloudhosting 
   var psActionsAddon1Name:PropertySet = TheApplication().NewPropertySet();
  if(vAddon1Name != """" && vAddon1Name != null && vAddon1Name != '')
  {
   vSeq = vSeq+1;
   with(psActionsAddon1Name)
   {
    SetType(""Actions"");
    SetProperty(""Id"",vSeq);
    SetProperty(""Sequence"",vSeq);
    SetProperty(""Base Product Name"",vPackage);
    SetProperty(""Action Code"",""Add""); 
    SetProperty(""Active Flag"",""Y"");
    SetProperty(""Allow Multiple Instance"",""N"");
    SetProperty(""Component Product Name"",vAddon1Name);
    SetProperty(""Field Name"","""");
    SetProperty(""Attribute Name"","""");
   }
   psListOfActions.AddChild(psActionsAddon1Name);
  }

psActionsAddon1Name = null;

   var psActvAddon1ContractName:PropertySet = TheApplication().NewPropertySet();
  if(vAddon1ContractName != """" && vAddon1ContractName != null && vAddon1ContractName != '')
  {
   vSeq = vSeq+1;
   with(psActvAddon1ContractName)
   {
    SetType(""Actions"");
    SetProperty(""Id"",vSeq);
    SetProperty(""Sequence"",vSeq);
    SetProperty(""Base Product Name"",vPackage);
    SetProperty(""Action Code"",""Add""); 
    SetProperty(""Active Flag"",""Y"");
    SetProperty(""Allow Multiple Instance"",""N"");
    SetProperty(""Component Product Name"",vAddon1ContractName);
    SetProperty(""Field Name"","""");
    SetProperty(""Attribute Name"","""");
   }
   psListOfActions.AddChild(psActvAddon1ContractName);
  }

psActvAddon1ContractName = null;


var psActionsAddon2Name:PropertySet = TheApplication().NewPropertySet();
  if(vAddon2Name != """" && vAddon2Name != null && vAddon2Name != '')
  {
   vSeq = vSeq+1;
   with(psActionsAddon2Name)
   {
    SetType(""Actions"");
    SetProperty(""Id"",vSeq);
    SetProperty(""Sequence"",vSeq);
    SetProperty(""Base Product Name"",vPackage);
    SetProperty(""Action Code"",""Add""); 
    SetProperty(""Active Flag"",""Y"");
    SetProperty(""Allow Multiple Instance"",""N"");
    SetProperty(""Component Product Name"",vAddon2Name);
    SetProperty(""Field Name"","""");
    SetProperty(""Attribute Name"","""");
   }
   psListOfActions.AddChild(psActionsAddon2Name);
  }

psActionsAddon2Name = null;

   var psActvAddon2ContractName:PropertySet = TheApplication().NewPropertySet();
  if(vAddon2ContractName != """" && vAddon2ContractName != null && vAddon2ContractName != '')
  {
   vSeq = vSeq+1;
   with(psActvAddon2ContractName)
   {
    SetType(""Actions"");
    SetProperty(""Id"",vSeq);
    SetProperty(""Sequence"",vSeq);
    SetProperty(""Base Product Name"",vPackage);
    SetProperty(""Action Code"",""Add""); 
    SetProperty(""Active Flag"",""Y"");
    SetProperty(""Allow Multiple Instance"",""N"");
    SetProperty(""Component Product Name"",vAddon2ContractName);
    SetProperty(""Field Name"","""");
    SetProperty(""Attribute Name"","""");
   }
   psListOfActions.AddChild(psActvAddon2ContractName);
  }
psActvAddon2ContractName = null; */

  if(vAccountStatus == """" || vAccountStatus == null || vAccountStatus != ""Terminated"")
  {
   with(MENAProdBC)
   {
    ClearToQuery();
    SetViewMode(AllView);
    ActivateField(""MENA Service Number"");
    ActivateField(""MSISDN"");
    ActivateField(""Product Name"");
    ActivateField(""Contract Name"");
    ActivateField(""Type"");
	ActivateField(""Product Attribute 8""); //[MANUJ] : [Network Change Automation]
	ActivateField(""Parent Row Id"");//[MANUJ] : [Network Change Automation]
	//SetSearchSpec(""MENA Service Number"", MENASANNumber);
	SetSearchSpec(""Parent Row Id"", CRMBulkReqId);
    ExecuteQuery(ForwardOnly);
    var ProdRec = FirstRecord();
    while(ProdRec)
    {
     AddonName = GetFieldValue(""Product Name"");
     AddonContract = GetFieldValue(""Contract Name"");
     Externaldentifier = GetFieldValue(""Product Attribute 8"");//[MANUJ] : [Network Change Automation]

     AddonType = GetFieldValue(""Type"");
     vSeq = vSeq+1;
     var psActionsAddon:PropertySet = TheApplication().NewPropertySet();
     with(psActionsAddon)
     {
      SetType(""Actions"");
      SetProperty(""Id"",vSeq);
      SetProperty(""Sequence"",vSeq);
      SetProperty(""Base Product Name"",vPackage);
      SetProperty(""Action Code"",""Add""); 
      SetProperty(""Active Flag"",""Y"");
      SetProperty(""Allow Multiple Instance"",""N"");
      SetProperty(""Component Product Name"",AddonName);
      SetProperty(""Field Name"","""");
      SetProperty(""Attribute Name"","""");
     }//with(psActionsAddon)
     psListOfActions.AddChild(psActionsAddon);
     ProdRec = NextRecord();
     psActionsAddon = null;
    }// while(ProdRec)
   }// with(MENAProdBC)
  }//end of if(vAccountStatus == """" ||...

  psActions = null;

  // Setting Instance
  var psInstance:PropertySet = TheApplication().NewPropertySet();
  with(psInstance)
  {
   SetType(""Instance"");
   SetProperty(""Service Id"",vMSISDN);
   SetProperty(""Id"",""12345"");
   SetProperty(""Sequence"",""1"");
  }
  
  psListOfInstance.AddChild(psInstance);
  psActionSet.AddChild(psListOfInstance);
  psActionSet.AddChild(psListOfActions);
  psListOfActionSet.AddChild(psActionSet);

  return psListOfActionSet;

 }
 catch(e)
 {
  LogException(e);
  if(BulkRequestId == null || BulkRequestId == """")
  {
   TheApplication().RaiseErrorText(""Request Name is already exists, Please enter unique request name"");
  }
 }
 finally
 {
  AccName = """";
  psInstance= null;
  psActionsPlan = null;
  psActions= null;
  psActionSet = null;
  psListOfActions = null;
  psListOfInstance = null;
  oBillAccBC = null;
  oBillAccBO = null;
 }
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 if(MethodName == ""CreateBulkRequest"")
 {
  CreateBulkRequest(Inputs,Outputs);
  return (CancelOperation);
 }
 
}
"//Your public declarations go here... 
function ToProperCase()
 {
     try
     {
        var iCtr;
        var arrProperCase = new Array();
        arrProperCase = vOrderType.split("" "");
        for(iCtr = 0; iCtr < arrProperCase.length; iCtr++)
  {
           arrProperCase[iCtr] = arrProperCase[iCtr].charAt(0).toUpperCase() + arrProperCase[iCtr].substring(1).toLowerCase();
        vOrderType = arrProperCase.join("" "");
  }

   }
     catch(e)
     {
        throw(e);
     }
     finally
     {
        arrProperCase = null;
        
     }
  }
"//Your public declarations go here... 
function trim(s)
{
 var r=/\b(.*)\b/.exec(s);
 return (r==null)?"""":r[1];
}
function InsertRecord(Inputs,Outputs)
{
 try
 {
  var vTN = Inputs.GetProperty(""MSISDN"");
  var vPortId = Inputs.GetProperty(""PortId"");
  var vMsgId = Inputs.GetProperty(""MsgType"");
  var vMsgTimeStamp = Inputs.GetProperty(""MsgTimeStamp"");
  var vOpTrxId = Inputs.GetProperty(""OperatorTrxId"");
  var vNpTrxId = Inputs.GetProperty(""NpTrxId"");
  var vLineTypeId = Inputs.GetProperty(""LineTypeId"");
  var vSubNetwId = Inputs.GetProperty(""SubscriptionNetworkId"");
  var vPortType = Inputs.GetProperty(""PortType"");
  var vErrorCode = Inputs.GetProperty(""ErrorCode"");
  var vErrorText = Inputs.GetProperty(""ErrorText"");
  var vSANId = Inputs.GetProperty(""SANId"");
  var vOrderNo = Inputs.GetProperty(""OrdersubmitNo"");
  var Reccount;
  var vMNPProcess = 'New';
  var vSysdate = new Date();
  var vMsgStampTime = ((vSysdate.getMonth() + 1) + ""/"" + vSysdate.getDate() + ""/"" + vSysdate.getFullYear()+ "" ""+ vSysdate.getHours() + "":"" + vSysdate.getMinutes()+"":"" + vSysdate.getSeconds());
  
  var vSTCBO = TheApplication().GetBusObject(""STC Service Account"");
  var vSTCBC = vSTCBO.GetBusComp(""CUT Service Sub Accounts"");
  var vMNPBC = vSTCBO.GetBusComp(""STC MNP Port Details BC"");
    with(vSTCBC)
  {
   SetViewMode(AllView);
   ActivateField(""DUNS Number"");
   ActivateField(""Id"");
   ActivateField(""STC MNP Process"");
   ActivateField(""STC MNP PortIn Status"");
   ClearToQuery();
   SetSearchSpec(""Id"",vSANId);
   ExecuteQuery(ForwardOnly);
      Reccount = CountRecords();   
    if(FirstRecord())
     { 
      SetFieldValue(""STC MNP PortIn Status"",""GenPortTerminateRequest"");
      SetFieldValue(""STC MNP Process"",vMNPProcess);
      WriteRecord();
     with(vMNPBC)
       {
          InvokeMethod(""SetAdminMode"", ""TRUE"");
          SetViewMode(AllView);
          ActivateField(""Msisdn"");
           ActivateField(""Port Id"");
           ActivateField(""Msg Time Stamp"");
           ActivateField(""Msg Type"");
           ActivateField(""Operator Trx Id"");
           ActivateField(""Np Trx Id"");
           ActivateField(""Line Type Id"");
           ActivateField(""Subscription Network Id"");
           ActivateField(""Port Type"");
           ActivateField(""Porting Start Date"");
           ActivateField(""Error Code"");
           ActivateField(""Error Text"");
           ActivateField(""Order Submit No"");
              NewRecord(NewAfter);
              SetFieldValue(""Msisdn"",vTN);              
                SetFieldValue(""Port Id"",vPortId);
              SetFieldValue(""Msg Time Stamp"",vMsgStampTime);
              SetFieldValue(""Np Trx Id"",vNpTrxId);
              SetFieldValue(""Operator Trx Id"",vOpTrxId);
                 SetFieldValue(""Msg Type"",""GenPortTerminateRequest"");
                 SetFieldValue(""Line Type Id"",vLineTypeId);
                 SetFieldValue(""Subscription Network Id"",""VIVA"");
                    SetFieldValue(""Port Type"",""Port In Terminate"");
                    SetFieldValue(""Porting Start Date"",vMsgStampTime);
                    SetFieldValue(""Error Code"",vErrorCode);
                    SetFieldValue(""Error Text"",vErrorText);
                    SetFieldValue(""Order Submit No"",vOrderNo);
                    WriteRecord();
                                                  
           } // with vMNPBC
           
        } // with vSTCBC
       else
        {
         Outputs.SetProperty(""ErrorCode"",'999');
        Outputs.SetProperty(""ErrorMessage"",'No Record Found SAN BC');
        return(CancelOperation);
        }  // if - else end
       }  // if vSTCBC    
         
      
   }
     
  catch(e)
 {
    Outputs.SetProperty(""ErrorMessage"", e.errText);
  Outputs.SetProperty(""ErrorCode"", '999');
   
 }
 
 finally
 {
  vMNPBC = null;
  vSTCBO = null;
 } 

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 if(MethodName == ""InsertRecord"")
  { 
   InsertRecord(Inputs,Outputs)
   return(CancelOperation);
   }

 return (ContinueOperation);
}
function CreateSR(Inputs,Outputs)
{
    var AppObj = TheApplication();
    var vAccountId = Inputs.GetProperty(""AccountId"");
    var vSRType = Inputs.GetProperty(""SRType"");
    var vTier1 = Inputs.GetProperty(""Tier1"");
    var vTier2 = Inputs.GetProperty(""Tier2"");
    var vTier3 = Inputs.GetProperty(""Tier3"");
    var vSRDesc = Inputs.GetProperty(""Desc"");
    
    var BOSR = AppObj.GetBusObject(""STC Thin Billing Account BO"");
    var BCSub = BOSR.GetBusComp(""STC Thin CUT Invoice Sub Accounts"");
    var BCSR = BOSR.GetBusComp(""Service Request - Lightweight"");
    with(BCSub)
     {
			SetViewMode(AllView);
			ActivateField(""Id"");
			ClearToQuery();
			SetSearchSpec(""Id"",vAccountId);
			ExecuteQuery(ForwardOnly);
            if(FirstRecord())
			{              
					with(BCSR)
					{
						ActivateField(""SR Type"");
						ActivateField(""INS Product"");
						ActivateField(""Status"");
						ActivateField(""INS Area"");
						ActivateField(""INS Sub-Area"");
						ActivateField(""Description"");
						NewRecord(NewBefore);
						SetFieldValue(""SR Type"",vSRType);
						SetFieldValue(""INS Product"",vTier1);
						SetFieldValue(""INS Area"",vTier2);
						SetFieldValue(""INS Sub-Area"",vTier3);
						SetFieldValue(""Description"",vSRDesc);
						SetFieldValue(""Status"",""In Progress"");
						WriteRecord();
						var SRId = GetFieldValue(""Id"");
						var SRNum = GetFieldValue(""SR Number"");
						Outputs.SetProperty(""SRRowId"",SRId);
						Outputs.SetProperty(""SRNum"",SRNum);
					}
					}
			} 
			

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
  if(MethodName == ""CreateSR"")
  { 
   CreateSR(Inputs,Outputs)
   return(CancelOperation);
   }
 return (ContinueOperation);
}
function Init(Inputs, Outputs)
{
	with(Outputs)
	{
		SetProperty(""Account Id"","""");
		SetProperty(""Item Type Name"","""");
		SetProperty(""Order Id"","""");
		SetProperty(""Order Number"","""");
		SetProperty(""STC Item Value Current"","""");
		SetProperty(""STC Item Value New"","""");
		SetProperty(""STC Item Value Approved"","""");
		SetProperty(""Approver Login"","""");
		SetProperty(""Approver Name"","""");
		SetProperty(""STC Justification"","""");
		SetProperty(""STC Device Name"", """");
		SetProperty(""STC Device Integ Id"", """");
		//SetProperty("""","""");
	}
	return (CancelOperation);
}
function Query(Inputs, Outputs)
{
return ContinueOperation;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	var ireturn=CancelOperation;
	var psInputs=null;
	var psOutputs=null;
	
	try
	{
	    switch(MethodName)
		{
			  	case ""Init"": 
					Init(Inputs,Outputs);
					ireturn=CancelOperation;
					break;
					
				case ""Query"": 
					Query(Inputs,Outputs);
					ireturn=CancelOperation;
					break;
					
				case ""PreInsert"":
					ireturn=CancelOperation;
					break;
					
				case ""Insert"":
					ireturn=CancelOperation;
					break;

				case ""Update"":
					ireturn=CancelOperation;
					break;
	
				case ""Delete"":
					ireturn=CancelOperation;
					break;		
		       	default:
		       		ireturn= ContinueOperation;
					break;
		}//End Switch
			return(ireturn);	
	}//end try
 catch(e)
	{ throw(e);}
	finally
	{
	}
	return(CancelOperation);
}
function CloseSR (Inputs,Outputs)
{//[NAVIN:29Jan2018:SocialMediaApplicationIdCapture]

try{
	var sSRBO = TheApplication().GetBusObject(""STC Single Account BO"");
	var sSRBC = sSRBO.GetBusComp(""STC CCSI Service Request Thin BC"");

	var SRId = Inputs.GetProperty(""SRId"");
	var sQueueSeq = Inputs.GetProperty(""QueueSeq"");
	var sQueueId = Inputs.GetProperty(""Queue Id"");
	var sErrCde = Inputs.GetProperty(""Error Code"");
	var sErrMsg = Inputs.GetProperty(""Error Message"");
	var sComments = sErrCde+""|""+sErrMsg ;

	with(sSRBC)
	{
		ActivateField(""Description"");
		ActivateField(""SR Number"");
		ActivateField(""Status"");
		ActivateField(""Sub-Status"");
		ActivateField(""Comments"");
		ClearToQuery();
		SetViewMode(AllView);
		SetSearchSpec(""Id"", SRId);
		ExecuteQuery(ForwardOnly);

		if(FirstRecord())
		{
			SetFieldValue(""Comments"",sComments.substring(0, 255));                  
			SetFieldValue(""Status"", ""In Progress"");
			SetFieldValue(""Sub-Status"", ""Assigned"");
			//WriteRecord();

			if (sErrCde==""0"" || sErrCde=="""")
			{ 
				SetFieldValue(""Status"", ""Closed"");
				SetFieldValue(""Sub-Status"", ""Executed"");
			}
			else
			{
				SetFieldValue(""Status"", ""Pending"");
				SetFieldValue(""Sub-Status"", ""Failed/Exception"");
			}
			WriteRecord();

			Outputs.SetProperty(""ErrorMessage"", ""SUCCESS"");
			Outputs.SetProperty(""ErrorCode"", ""0"");
		}
		else
		{
			Outputs.SetProperty(""ErrorMessage"", ""Service Request does not exists"");
			Outputs.SetProperty(""ErrorCode"", ""1"");
		}
	}//end of with(sSRBC)
}//try
catch(e)
{
	var errC = e.errCode;
	var errT = e.errText;
	Outputs.SetProperty(""ErrorMessage"", errT);
	Outputs.SetProperty(""ErrorCode"", errC);
}
finally
{
	sSRBC = null; 
	sSRBO = null;
}
}
function CreateBANSR(Inputs,Outputs)
{
    var AppObj = TheApplication();
    var vAccountId = Inputs.GetProperty(""AccountId"");
    var vSRType = Inputs.GetProperty(""SRType"");
    var vTier1 = Inputs.GetProperty(""Tier1"");
    var vTier2 = Inputs.GetProperty(""Tier2"");
    var vTier3 = Inputs.GetProperty(""Tier3"");
    var vSRDesc = Inputs.GetProperty(""Desc"");
    var BOSR = AppObj.GetBusObject(""STC Billing Account"");
    var BCSub = BOSR.GetBusComp(""CUT Invoice Sub Accounts"");
    var BCSR = BOSR.GetBusComp(""Service Request"");
    with(BCSub)
    {
		SetViewMode(AllView);
		ActivateField(""Id"");
	    ClearToQuery();
	    SetSearchSpec(""Id"",vAccountId);
	    ExecuteQuery(ForwardOnly);
	    if(FirstRecord())
	    {              
			with(BCSR)
	        {
				ActivateField(""SR Type"");
				ActivateField(""INS Product"");
				ActivateField(""Status"");
				ActivateField(""INS Area"");
				ActivateField(""INS Sub-Area"");
				ActivateField(""Description"");
				ActivateField(""Account Id"");
				NewRecord(NewBefore);
				SetFieldValue(""SR Type"",vSRType);
				SetFieldValue(""INS Product"",vTier1);
				SetFieldValue(""STC INS Area"",vTier2);
				SetFieldValue(""STC INS Sub-Area"",vTier3);
				SetFieldValue(""Description"",vSRDesc);
				SetFieldValue(""Status"",""In Progress"");
				SetFieldValue(""Account Id"",vAccountId);
				WriteRecord();
				var SRId = GetFieldValue(""Id"");
				var SRNum = GetFieldValue(""SR Number"");
				Outputs.SetProperty(""SRRowId"",SRId);
                Outputs.SetProperty(""SRNum"",SRNum);
			}
		}
	} 
}
function CreateCANSR(Inputs,Outputs)
{
    var AppObj = TheApplication();
    var vAccountId = Inputs.GetProperty(""AccountId"");
    var vSRType = Inputs.GetProperty(""SRType"");
    var vTier1 = Inputs.GetProperty(""Tier1"");
    var vTier2 = Inputs.GetProperty(""Tier2"");
    var vTier3 = Inputs.GetProperty(""Tier3"");
    var vSRDesc = Inputs.GetProperty(""Desc"");
    var BOSR = AppObj.GetBusObject(""Account"");
    var BCCAN = BOSR.GetBusComp(""Account"");
    var BCSR = BOSR.GetBusComp(""Service Request"");
    with(BCCAN)
    {
		SetViewMode(AllView);
		ActivateField(""Id"");
	    ClearToQuery();
	    SetSearchSpec(""Id"",vAccountId);
	    ExecuteQuery(ForwardOnly);
	    if(FirstRecord())
	    {              
			with(BCSR)
	        {
				ActivateField(""SR Type"");
				ActivateField(""INS Product"");
				ActivateField(""Status"");
				ActivateField(""INS Area"");
				ActivateField(""INS Sub-Area"");
				ActivateField(""Description"");
				ActivateField(""Account Id"");
				NewRecord(NewBefore);
				SetFieldValue(""SR Type"",vSRType);
				SetFieldValue(""INS Product"",vTier1);
				SetFieldValue(""INS Area"",vTier2);
				SetFieldValue(""INS Sub-Area"",vTier3);
				SetFieldValue(""Description"",vSRDesc);
				SetFieldValue(""Status"",""In Progress"");
				SetFieldValue(""Account Id"",vAccountId);
				WriteRecord();
				var SRId = GetFieldValue(""Id"");
				var SRNum = GetFieldValue(""SR Number"");
				Outputs.SetProperty(""SRRowId"",SRId);
                Outputs.SetProperty(""SRNum"",SRNum);
			}
		}
	} 
}
function CreateContactSR(Inputs,Outputs)
{
    var AppObj = TheApplication();
    var vAccountId = Inputs.GetProperty(""AccountId"");
    var vSRType = Inputs.GetProperty(""SRType"");
    var vTier1 = Inputs.GetProperty(""Tier1"");
    var vTier2 = Inputs.GetProperty(""Tier2"");
    var vTier3 = Inputs.GetProperty(""Tier3"");
    var vSRDesc = Inputs.GetProperty(""Desc"");
    var BOSR = AppObj.GetBusObject(""STC Billing Account"");
	var BCContact = BOSR.GetBusComp(""Contact"");
    var BCSR = BOSR.GetBusComp(""Service Request"");
    with(BCContact)
    {
		SetViewMode(AllView);
		ActivateField(""Id"");
	    ClearToQuery();
	    SetSearchSpec(""Id"",vAccountId);
	    ExecuteQuery(ForwardOnly);
	    if(FirstRecord())
	    {              
			with(BCSR)
	        {
				ActivateField(""SR Type"");
				ActivateField(""INS Product"");
				ActivateField(""Status"");
				ActivateField(""INS Area"");
				ActivateField(""INS Sub-Area"");
				ActivateField(""Description"");
				ActivateField(""Contact Id"");
				NewRecord(NewBefore);
				SetFieldValue(""SR Type"",vSRType);
				SetFieldValue(""INS Product"",vTier1);
				SetFieldValue(""INS Area"",vTier2);
				SetFieldValue(""INS Sub-Area"",vTier3);
				SetFieldValue(""Description"",vSRDesc);
				SetFieldValue(""Contact Id"",vAccountId);
				SetFieldValue(""Status"",""In Progress"");
				WriteRecord();
				var SRId = GetFieldValue(""Id"");
				var SRNum = GetFieldValue(""SR Number"");
				Outputs.SetProperty(""SRRowId"",SRId);
                Outputs.SetProperty(""SRNum"",SRNum);
			}
		}
	} 
}
function CreateOrderSR(Inputs,Outputs)
{
	try
	{
		var AppObj = TheApplication();
	    var vOrderId = Inputs.GetProperty(""OrderId"");
	    var vSRType = Inputs.GetProperty(""SRType"");
	    var vTier1 = Inputs.GetProperty(""Tier1"");
	    var vTier2 = Inputs.GetProperty(""Tier2"");
	    var vTier3 = Inputs.GetProperty(""Tier3"");
	    var vSRDesc = Inputs.GetProperty(""Desc"");
	    var sBO = AppObj.GetBusObject(""Order Entry (Sales)"");
	    var sOrderBC = sBO.GetBusComp(""Order Entry - Orders"");
	    var sSerReqBC = sBO.GetBusComp(""Service Request - Lightweight"");
		var vAccountId;
	    with(sOrderBC)
	    {
			SetViewMode(AllView);
			ActivateField(""Account Id"");
		    ClearToQuery();
		    SetSearchSpec(""Id"",vOrderId);
		    ExecuteQuery(ForwardOnly);
		    if(FirstRecord())
		    {  
				vAccountId = GetFieldValue(""Account Id"");            
				with(sSerReqBC)
		        {
					InvokeMethod(""SetAdminMode"",""TRUE"");
					ActivateField(""SR Type"");
					ActivateField(""INS Product"");
					ActivateField(""Status"");
					ActivateField(""INS Area"");
					ActivateField(""INS Sub-Area"");
					ActivateField(""Description"");
					ActivateField(""Account Id"");
					NewRecord(NewBefore);
					SetFieldValue(""SR Type"",vSRType);
					SetFieldValue(""INS Product"",vTier1);
					SetFieldValue(""STC INS Area"",vTier2);
					SetFieldValue(""STC INS Sub-Area"",vTier3);
					SetFieldValue(""Description"",vSRDesc);
					SetFieldValue(""Status"",""In Progress"");
					SetFieldValue(""Account Id"",vAccountId);
					WriteRecord();
					var SRId = GetFieldValue(""Id"");
					var SRNum = GetFieldValue(""SR Number"");
					Outputs.SetProperty(""SRRowId"",SRId);
	                Outputs.SetProperty(""SRNum"",SRNum);
				}
			}
		} 
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
		AppObj=null;
		sBO=null;
		sOrderBC=null;
		sSerReqBC=null;
	}
}
function CreateSANSR (Inputs,Outputs)
{
	//var AppObj = TheApplication();
	var vChannel="""", vAccountId="""", vSRType="""", vTier1="""", vTier2="""", vTier3="""", vSRDesc="""";
	var SRId="""", SRNum="""";
	var BOSR=null, BCSub=null, BCSR=null;
	with (Inputs)
	{
		vChannel = GetProperty(""Channel"");
		vAccountId = GetProperty(""AccountId"");
		vSRType = GetProperty(""SRType"");
		vTier1 = GetProperty(""Tier1"");
		vTier2 = GetProperty(""Tier2"");
		vTier3 = GetProperty(""Tier3"");
		vSRDesc = GetProperty(""Desc"");
		
		if (vChannel == """" || vChannel == null)
			vChannel = ""Call center"";
	}
	with (Outputs)
	{
		SetProperty(""SRRowId"", SRId);
		SetProperty(""SRNum"", SRNum);
	}
	try{
		BOSR = TheApplication().GetBusObject(""STC Service Account"");
		BCSub = BOSR.GetBusComp(""CUT Service Sub Accounts"");
		BCSR = BOSR.GetBusComp(""Service Request - Lightweight"");
		with(BCSub)
		{
			SetViewMode(AllView);
			ActivateField(""Id"");
			ClearToQuery();
			SetSearchSpec(""Id"",vAccountId);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
			{              
				with(BCSR)
				{
					ActivateField(""Source"");
					ActivateField(""SR Type"");
					ActivateField(""INS Product"");
					ActivateField(""Status"");
					ActivateField(""INS Area"");
					ActivateField(""INS Sub-Area"");
					ActivateField(""Description"");
					NewRecord(NewBefore);
					SetFieldValue(""Source"",vChannel);
					SetFieldValue(""SR Type"",vSRType);
					SetFieldValue(""INS Product"",vTier1);
					SetFieldValue(""INS Area"",vTier2);
					SetFieldValue(""INS Sub-Area"",vTier3);
					SetFieldValue(""Description"",vSRDesc);
					SetFieldValue(""Status"",""In Progress"");
					WriteRecord();
					
					SRId = GetFieldValue(""Id"");
					SRNum = GetFieldValue(""SR Number"");
					with(Outputs)
					{
						SetProperty(""SRRowId"",SRId);
						SetProperty(""SRNum"",SRNum);
					}
				}
			}
		}
	}
	catch(e)
	{throw(e);}
	finally{
		BCSR = null;
		BCSub = null;
		BOSR = null;
	}
	
	return (CancelOperation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""CreateContactSR"")
	{ 
		CreateContactSR(Inputs,Outputs)
		return(CancelOperation);
	}
	if(MethodName == ""CreateBANSR"")
	{ 
		CreateBANSR(Inputs,Outputs)
		return(CancelOperation);
	}
	if(MethodName == ""CreateCANSR"")
	{ 
		CreateCANSR(Inputs,Outputs)
		return(CancelOperation);
	}
	if(MethodName == ""CreateSANSR"")
	{//[NAVIN:08Aug2018:CustomerJourney360View]
		CreateSANSR(Inputs,Outputs)
		return(CancelOperation);
	}
	if(MethodName == ""CloseSR"")
	{//[NAVIN:08Aug2018:CustomerJourney360View]
		CloseSR(Inputs,Outputs)
		return(CancelOperation);
	}
	if(MethodName == ""CreateOrderSR"")
	{//Jithin: ABS
		CreateOrderSR(Inputs,Outputs)
		return(CancelOperation);
	}
 return (ContinueOperation);
}
function CreateProfile(Inputs,Outputs)
 {
  var appObj = TheApplication();
  var SpecRateListId = """";
 try
 {
 
 var boStcServAcc = appObj.GetBusObject(""STC Service Account"");
 var bcCUTServAcc = boStcServAcc.GetBusComp(""CUT Service Sub Accounts"");
 var bcProfile = boStcServAcc.GetBusComp(""SWI Special Rating List"");
 var bcCUTSerAcc =  boStcServAcc.GetBusComp(""CUT Service Sub Accounts""); 
 var AccountId = Inputs.GetProperty(""AccountId"");
 var ProfName = Inputs.GetProperty(""SpecialRatingProduct"");
 var ProfType = appObj.InvokeMethod(""LookupValue"",""SPL_RATE_LIST_TYPE"",""Phone Number"");
 var ProfNameval =  appObj.InvokeMethod(""LookupValue"",""STC_SPECIAL_RATING_LIST"",ProfName);
 with(bcCUTServAcc)
            {
  InvokeMethod(""SetAdminMode"",""TRUE"");
     ActivateField(""Primary Special Rating List Id"");
  ActivateField(""SSA Primary"");
  SetViewMode(AllView);
  ClearToQuery();
  SetSearchSpec(""Id"",AccountId);
  ExecuteQuery(ForwardOnly);
    if(FirstRecord())
    {
     
    with(bcProfile)
    {
    InvokeMethod(""SetAdminMode"",""TRUE"");
    SetViewMode(AllView);
    ActivateField(""SSA Primary Field"");
    ClearToQuery();
    SetSearchSpec(""Special Rating List Name"",ProfName);
    ExecuteQuery(ForwardOnly);
      if(!FirstRecord())
      {
       NewRecord(1);
       SetFieldValue(""Account Id"",AccountId);
       SetFieldValue(""Special Rating List Name"",ProfName);
       SetFieldValue(""Special Rating List Type"",ProfType);
        SetFieldValue(""SSA Primary Field"",""Y"");
       WriteRecord();
    SpecRateListId = GetFieldValue(""Id""); 
   }// end of If
   else
   {
        SpecRateListId = GetFieldValue(""Id""); 
        SetFieldValue(""SSA Primary Field"",""Y"");
        WriteRecord();
   } 
   }
   
   InvokeMethod(""SetAdminMode"",""TRUE"");
    SetFieldValue(""Primary Special Rating List Id"",SpecRateListId);
    //SetFieldValue(""SSA Primary Field"",""Y"");
    WriteRecord();
  } 
    }
  Outputs.SetProperty(""SpecRatingId"",SpecRateListId);    
 
 }// end of try
  catch(e)
  {
   appObj.RaiseErrorText(e.toString()); 
  } 
  finally
  {
   bcProfile = null;
   boStcServAcc = null;
   appObj = null;
  
  }
 }
function GetProfileRecords(Inputs,Outputs)
{


var SpecRateListId = Inputs.GetProperty(""SpecRateListId"");
var StrListItem = TheApplication().GetBusObject(""STC Service Account"").GetBusComp(""SWI Special Rating List Items"");
var PhList = """";

 with(StrListItem)
 {
   ActivateField(""Phone Number Type"");
   SetViewMode(AllView);
   ClearToQuery();
   var SearchExp = ""[Special Rating List Id] = '"" +SpecRateListId+ ""' AND [Inactive Flag]='"" + ""N"" + ""'"";
   SetSearchExpr(SearchExp);

   ExecuteQuery(ForwardOnly); 
   
   var Isrec = FirstRecord();
   while(Isrec)
   {
    var PhoneNumType = GetFieldValue(""Phone Number Type"");
    if(PhList != """")
    {
    PhList = PhList + "","" + PhoneNumType;
    }
        else
     {
          PhList = PhoneNumType;
      }
          Isrec = NextRecord();
      } 
 }
Outputs.SetProperty(""PhoneNumberType"",PhList);
}
function QueryRatingProducts (Inputs,Outputs)
{

 var appObj = TheApplication();
try
{
var OrderBO = appObj.GetBusObject(""Order Entry (Sales)"");
var OrderEntryBC = OrderBO.GetBusComp(""Order Entry - Orders"");
var OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items"");
var OrderId = Inputs.GetProperty(""OrderId"");
with(OrderEntryBC)
{
 SetViewMode(AllView);
 ClearToQuery();
 SetSearchSpec(""Id"",OrderId);
 ExecuteQuery(ForwardOnly);
 
 with(OrderLineBC)
 {
  ActivateField(""Part Number"");
  SetViewMode(AllView);
  ClearToQuery();
  SetSearchExpr(""[Order Header Id] = '"" + OrderId + ""' AND [Billing Type] = '"" + ""Special Rating"" + ""'AND [Action Code] = '"" + ""Add"" + ""'"");
//  SetSearchSpec(""Id"",OrderId);
  ExecuteQuery(ForwardOnly); 
  if(FirstRecord())
  {
  var PartNum = GetFieldValue(""Part Number""); 
  }
 }
}
Outputs.SetProperty(""PartNum"",PartNum );
    
 }// end of try
 catch(e)
 {
 appObj.RaiseErrorText(e.toString()); 
 } 
 finally
 {
 
 }}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
 try
 {
    switch(MethodName)
     {
    case ""CreateProfile"":
     CreateProfile(Inputs, Outputs);
     return(CancelOperation);
     break;


 case ""QueryRatingProducts"":
     QueryRatingProducts(Inputs, Outputs);
     return(CancelOperation);
     break;


case ""GetProfileRecords"":
     GetProfileRecords(Inputs, Outputs);
     return(CancelOperation);
     break;

     default:
          return (ContinueOperation);
       }
 }
 catch (exc)
 {
 throw(exc.toString());
 }
  finally 
 {
 }  
}
"var vSubscriptionId = """";
var sErrorMsg="""";
var sErrorCode="""";"
function CreateCorpGPRSSubscription(OrderId,BillingAccName,CustomerAccountId,BillingAccId,PrimaryContactId,BillingAddrId,OrderSubType,AccountType,CommunityType,vPlanPartCode,Outputs)
{
	var OrderBO;
	var OrderLineBC;
	var setsearchexpr;
	var sBillProfileId;
	var vMSISDN;
	var vICCID;
	var vId;
	var vRootId;
	var sAuthLevel;
	var isRecord;
	var sServiceAccountId;
	var sIMSI;
	var sIMSI1;
	
	try
	{
		OrderBO = TheApplication().GetBusObject(""Order Entry (Sales)"");
		OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items"");
		setsearchexpr = """";	
	 	with(OrderLineBC)
	 	{
			// Query for the Root Line Items and Fetch the MSISDN Number
			ActivateField(""Service Id"");
			ActivateField(""STC ICCID"");
			ActivateField(""Order Header Id"");
			ActivateField(""Root Order Item Id"");
			ActivateField(""Parent Order Item Id"");
			ActivateField(""STC Authorization Code"");
			ActivateField(""STC IMSI"");
			ActivateField(""STC IMSI1"");
			ActivateField(""Id"");
			ActivateField(""Service Account Id"");
			ActivateField(""Billing Profile Id"");
			ClearToQuery();
			SetViewMode(AllView);
			
			setsearchexpr  = ""[Order Header Id] = '"" + OrderId + ""' AND "" + ""[Parent Order Item Id] IS NULL"";
			SetSearchExpr(setsearchexpr);
			ExecuteQuery(ForwardOnly);
			isRecord = FirstRecord();
	
			//Create Subscription for all the MSISDNs chosen at the Line Item level
			while(isRecord)
			{
					vMSISDN = GetFieldValue(""Service Id"");
					vICCID = GetFieldValue(""STC ICCID"");
					vId = GetFieldValue(""Id"");
					vRootId = GetFieldValue(""Root Order Item Id"");
					sAuthLevel = GetFieldValue(""STC Authorization Code"");
					sBillProfileId = GetFieldValue(""Billing Profile Id"");
					sIMSI1 = GetFieldValue(""STC IMSI1"");
					sIMSI = GetFieldValue(""STC IMSI"");
					if(vId == vRootId)
					{
					//Create New Subscription Record
						sServiceAccountId = CreateCorpGPRSSubscriptionRecord(OrderId,BillingAccName,CustomerAccountId,vMSISDN,BillingAccId,BillingAddrId,PrimaryContactId,vICCID,OrderSubType,vId,AccountType,sAuthLevel,sBillProfileId,sIMSI1,sIMSI,CommunityType,Outputs);
						if(sErrorCode!="""")
						{
							Outputs.SetProperty(""Error Message"",sErrorMsg);
							Outputs.SetProperty(""Error Code"",sErrorCode);
							Outputs.SetProperty(""ServiceAccountId"","""");
							return(CancelOperation);
						}
						Outputs.SetProperty(""ServiceAccountId"",sServiceAccountId);
						if(vSubscriptionId != """")
						{
							SetFieldValue(""Service Account Id"",vSubscriptionId);
							WriteRecord();
							//vSubscriptionId="""";
						}
						isRecord = NextRecord();
					}
					else
					{
						SetFieldValue(""Service Account Id"",vSubscriptionId);
						WriteRecord();
						isRecord = NextRecord();
					}
			}
		}
	}
	
	catch(e)
	{
			if(e.errCode == ""22709"")
			{
				throw(e.errText);
			}
	}
	finally
	{
		OrderLineBC = null;
		OrderBO = null;
	}
}
function CreateCorpGPRSSubscriptionRecord(OrderId,BillingAccName,CustomerAccountId,vMSISDN,BillingAccId,BillingAddrId,PrimaryContactId,vICCID,OrderSubType,vId,AccountType,sAuthLevel,sBillProfileId,sIMSI1,sIMSI,CommunityType,Outputs)
{
	try
	{
		var AccountBO;
		var ServiceAccntBC;
		var sPricingType;
		var isRec;
		var BABO;
		var BillingAccntBC;
		var isRecord;
		var vName;
		var vContactBC;
		var vAssociateBC;
		var isPrimaryContact;
		var vStreetAddress;
		var vAssociateAddr;
		var isPrimaryAddress;
		var sSearchExpr;
		var slovInactive;
		
		BABO = TheApplication().GetBusObject(""STC Billing Account"");
		BillingAccntBC = BABO.GetBusComp(""CUT Invoice Sub Accounts""); // Billing Account record then look for child Service Account
		with(BillingAccntBC)
		{
			ActivateField(""STC Service Type"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Id"",BillingAccId);
			ExecuteQuery(ForwardBackward);
			isRec = FirstRecord();
		
			if(isRec)//if the billing account exists then can proceed
			{
				sPricingType = GetFieldValue(""STC Service Type"") ;
				ServiceAccntBC = BABO.GetBusComp(""CUT Service Sub Accounts"");
				slovInactive = TheApplication().InvokeMethod(""LookupValue"",""ACCOUNT_STATUS"",""Terminated"");
				//Check if the Subscription is already created
				with(ServiceAccntBC)
				{
					ActivateField(""DUNS Number"");
					ActivateField(""STC Pricing Plan Type"");
					ActivateField(""STC-ICCID"");
					ActivateField(""STC IMSI1""); // Added for specifying IMSI number
					ActivateField(""STC IMSI""); // Added for specifying IMSI number
					ActivateField(""Primary Address Id"");
					ActivateField(""Parent Account Id"");
					ActivateField(""Master Account Id"");
					ActivateField(""Account Status"");
					ActivateField(""Primary Contact First Name"");
					ActivateField(""STC Root Order Item Id"");
					ActivateField(""Street Address"");   // Activated since GetAssocBusComp is not working
					ActivateField(""STC Account Authority Level"");
					ActivateField(""Primary Billing Profile Id"");
					ActivateField(""STC Community Type"");
					SetViewMode(AllView);
				
		
				
				
						vName = BillingAccName;
						NewRecord(NewAfter);
					
						SetFieldValue(""Name"",vName);
						SetFieldValue(""Parent Account Id"",BillingAccId);
					
						SetFieldValue(""DUNS Number"",vMSISDN);
						SetFieldValue(""STC-ICCID"",vICCID);
						SetFieldValue(""STC IMSI1"",sIMSI1);
						SetFieldValue(""STC IMSI"",sIMSI);
						SetFieldValue(""Master Account Id"",CustomerAccountId);
						SetFieldValue(""Primary Address Id"",BillingAddrId);
						SetFieldValue(""Primary Billing Profile Id"",sBillProfileId);
						SetFieldValue(""Type"",AccountType);
						SetFieldValue(""STC Pricing Plan Type"",sPricingType);
						SetFieldValue(""STC Account Authority Level"",sAuthLevel);
						SetFieldValue(""STC Community Type"",CommunityType);
						vSubscriptionId = GetFieldValue(""Id"");
	
					// Associate Primary Contact Details to the subscription
						vContactBC = GetMVGBusComp(""Primary Contact First Name"");
						with(vContactBC)
						{
							vAssociateBC = GetAssocBusComp();
							with(vAssociateBC)
							{
									SetViewMode(AllView);
									ClearToQuery();
									SetSearchSpec(""Id"",PrimaryContactId);
									ExecuteQuery(ForwardOnly);
									isPrimaryContact = FirstRecord();
								if(isPrimaryContact)
								{
									Associate(NewAfter);
								}
							}
							WriteRecord();
						}//with(vContactBC)

				// Associate the Address details to the subscription
						vStreetAddress = GetMVGBusComp(""Street Address"");
						with(vStreetAddress)
						{
							vAssociateAddr = GetAssocBusComp();
							with(vAssociateAddr)
							{
								SetViewMode(AllView);
								ClearToQuery();
								SetSearchSpec(""Id"",BillingAddrId);
								ExecuteQuery(ForwardOnly);
								isPrimaryAddress = 	FirstRecord();
								if(isPrimaryAddress)
								{
										Associate(NewAfter);
								}
							}
							WriteRecord(); 
						}//with(vStreetAddress)
	
					WriteRecord();
				
				}//with(ServiceAccntBC)
			} //if(isRec)
		}//with(BillingAccntBC)
		return vSubscriptionId;
	}
	catch(e)
	{
	//	var errT = e.errText;
	//	var errC = e.errCode;

	}
	finally
	{
		ServiceAccntBC = null;
		BillingAccntBC = null;
		BABO = null;
	}
}
function CreateSpiltBillSubscription(Inputs, Outputs)
{
try
{
	var BillingAccName = Inputs.GetProperty(""BillingAccName"");
	var CustomerAccountId = Inputs.GetProperty(""CustomerAccountId"");
	var BillingAccId = Inputs.GetProperty(""BillingAccId"");
	var BillingAddrId = Inputs.GetProperty(""BillingAddrId"");
	var PrimaryContactId = Inputs.GetProperty(""PrimaryContactId"");
	var AccountType = Inputs.GetProperty(""AccountType"");
	var sAuthLevel = Inputs.GetProperty(""sAuthLevel"");
	var sBillProfileId = Inputs.GetProperty(""sBillProfileId"");
	var CommunityType = Inputs.GetProperty(""CommunityType"");
	var sSplitBillSvcType = Inputs.GetProperty(""SplitBillServiceType"");
	var sSplitBillFlag = Inputs.GetProperty(""SplitBillFlag"");
	var sSplitEmployeeName = Inputs.GetProperty(""SplitEmployeeName"");
	var sSplitOccupation = Inputs.GetProperty(""SplitEmpOccupation"");
	var sSplitEmpCPR = Inputs.GetProperty(""SplitEmpCPR"");
	var sSplitEmpClass = Inputs.GetProperty(""SplitEmpClass"");
	
	var IdType = """"; var IdNumber = """"; var ContractCat = """";

	var sPricingType, ServiceAccntBC, slovInactive, vContactBC, vAssociateBC, vStreetAddress, vAssociateAddr, vSubscriptionId;
	vSubscriptionId = """";
	var	CustomerAccntBC;//MANUJ Added
	var CusIDNum;//MANUJ Added
	var CusIDType;//MANUJ Added
	var BABO = TheApplication().GetBusObject(""STC Billing Account"");
	var BillingAccntBC = BABO.GetBusComp(""CUT Invoice Sub Accounts""); // Billing Account record then look for child Service Account
	//MANUJ Added to stamp ID# and ID Type of CAN on SAN if BANs Customer Segment <> ""Employee Relative""
	CustomerAccntBC = BABO.GetBusComp(""Account""); //MANUJ
			//MANUJ Added to stamp ID# and ID Type of CAN on SAN if BANs Customer Segment <> ""Employee Relative""
		with(CustomerAccntBC)
		{
			ActivateField(""Survey Type"");
			ActivateField(""Tax ID Number"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Id"", CustomerAccountId);
			ExecuteQuery(ForwardOnly);
			var isCustRec = FirstRecord();
			if(isCustRec)
			{
				CusIDType = GetFieldValue(""Survey Type"");
				CusIDNum = GetFieldValue(""Tax ID Number"");
		
			}
		}
		//MANUJ
	
	
	
	
	with(BillingAccntBC)
	{
		ActivateField(""STC Service Type"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"",BillingAccId);
		ExecuteQuery(ForwardBackward);
		var isRec = FirstRecord();
		if(isRec)//if the billing account exists then can proceed
		{
			sPricingType = GetFieldValue(""STC Service Type"") ;
			ContractCat = GetFieldValue(""STC Contract Category"");//MANUJ Added
			ServiceAccntBC = BABO.GetBusComp(""CUT Service Sub Accounts"");
			slovInactive = TheApplication().InvokeMethod(""LookupValue"",""ACCOUNT_STATUS"",""Terminated"");
			//Check if the Subscription is already created
			with(ServiceAccntBC)
			{
			//	ActivateField(""DUNS Number"");
				ActivateField(""STC Pricing Plan Type"");
			//	ActivateField(""STC-ICCID"");
			//	ActivateField(""STC IMSI1""); // Added for specifying IMSI number
			//	ActivateField(""STC IMSI""); // Added for specifying IMSI number
				ActivateField(""Primary Address Id"");
				ActivateField(""Parent Account Id"");
				ActivateField(""Master Account Id"");
				ActivateField(""Account Status"");
				ActivateField(""Primary Contact First Name"");
				ActivateField(""STC Root Order Item Id"");
				ActivateField(""Street Address"");   // Activated since GetAssocBusComp is not working
				ActivateField(""STC Account Authority Level"");
				ActivateField(""Primary Billing Profile Id"");
				ActivateField(""STC Community Type"");
				ActivateField(""STC Split Billing Flag"");
				ActivateField(""STC Split Bill Service Type"");
				ActivateField(""STC Split Occupation Type"");
				ActivateField(""STC Split Employee Name"");
				ActivateField(""STC Split Employee CPR"");
				ActivateField(""STC Split Bill Customer Class"");
				ActivateField(""STC ID Type"");
				ActivateField(""STC ID #"");
				SetViewMode(AllView);
				NewRecord(NewAfter);
			
				SetFieldValue(""Name"",BillingAccName);
				SetFieldValue(""Parent Account Id"",BillingAccId);
			//	SetFieldValue(""DUNS Number"",vMSISDN);
			//	SetFieldValue(""STC-ICCID"",vICCID);
			//	SetFieldValue(""STC IMSI1"",sIMSI1);
			//	SetFieldValue(""STC IMSI"",sIMSI);
				SetFieldValue(""Master Account Id"",CustomerAccountId);
				SetFieldValue(""Primary Address Id"",BillingAddrId);
				SetFieldValue(""Primary Billing Profile Id"",sBillProfileId);
				SetFieldValue(""Type"",AccountType);
				SetFieldValue(""STC Pricing Plan Type"",sPricingType);
				SetFieldValue(""STC Account Authority Level"",sAuthLevel);
				SetFieldValue(""STC Community Type"",CommunityType);
				SetFieldValue(""STC Split Billing Flag"",sSplitBillFlag);
				SetFieldValue(""STC Split Bill Service Type"",sSplitBillSvcType);
				SetFieldValue(""STC Split Occupation Type"",sSplitOccupation);
				SetFieldValue(""STC Split Employee Name"",sSplitEmployeeName);
				SetFieldValue(""STC Split Employee CPR"",sSplitEmpCPR);
				SetFieldValue(""STC Split Bill Customer Class"",sSplitEmpClass);
				vSubscriptionId = GetFieldValue(""Id"");
				WriteRecord();
				// Associate Primary Contact Details to the subscription
				vContactBC = GetMVGBusComp(""Primary Contact First Name"");
				with(vContactBC)
				{
					vAssociateBC = GetAssocBusComp();
					with(vAssociateBC)
					{
							SetViewMode(AllView);
							ClearToQuery();
							SetSearchSpec(""Id"",PrimaryContactId);
							ExecuteQuery(ForwardOnly);
							var isPrimaryContact = FirstRecord();
						if(isPrimaryContact)
						{
							IdType = GetFieldValue(""STC ID Type"");
							IdNumber = GetFieldValue(""STC ID #"");
							Associate(NewAfter);
						}
					}
					WriteRecord();
				}//with(vContactBC)
				
				// Associate the Address details to the subscription
				vStreetAddress = GetMVGBusComp(""Street Address"");
				with(vStreetAddress)
				{
					vAssociateAddr = GetAssocBusComp();
					with(vAssociateAddr)
					{
						SetViewMode(AllView);
						ClearToQuery();
						SetSearchSpec(""Id"",BillingAddrId);
						ExecuteQuery(ForwardOnly);
						var isPrimaryAddress = 	FirstRecord();
						if(isPrimaryAddress)
						{
							Associate(NewAfter);
						}
					}
					WriteRecord(); 
				}//with(vStreetAddress)
				
				if(ContractCat == ""Employee Relative""){//MANUJ Added	
				SetFieldValue(""STC ID Type"",IdType);
				SetFieldValue(""STC ID #"",IdNumber);
				}else{
				SetFieldValue(""STC ID Type"",CusIDType);	
				SetFieldValue(""STC ID #"",CusIDNum);
				
				
				
				}
				WriteRecord();
			}
		}	
	}
	Outputs.SetProperty(""SubscriptionId"", vSubscriptionId);
}
catch(e)
{
	throw(e);
}
finally
{
	ServiceAccntBC = null; BillingAccntBC = null; BABO = null;
}
}
function CreateSubscription(OrderId,OrderCustProvType,BillingAccName,CustomerAccountId,BillingAccId,AuthNumber,AuthNotifications,PrimaryContactId,BillingAddrId,OrderSubType,AccountType,CommunityType,sGCCCntryCode,vPlanPartCode,Outputs)
{
	var OrderBO, sOrderBc, OrderLineBC;
	var setsearchexpr, isRecord;
	var sBillProfileId, vMSISDN, vICCID;
	var vId, vRootId, sAuthLevel;
	var sServiceAccountId, sIMSI, sIMSI1;
	var VOBBLINKMSISDN, VOBBPlan, PackagePartCode, SANPackage = """";
	var DatacomCircuitId, ServiceLocation; //sumank: Added for VAT
	var AuthNotifType="""", AuthEmail="""";
	try
	{
		OrderBO = TheApplication().GetBusObject(""Order Entry (Sales)"");
		OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items"");
		setsearchexpr = """";	
		//Added for the CIO Software Update SD below
		sOrderBc = OrderBO.GetBusComp(""Order Entry - Orders"");

		//var sGccCntryCode;
		with(sOrderBc){
			ActivateField(""STC GCC Country Code"");
			ActivateField(""STC VOBB MSISDN Link"");
			ActivateField(""STC VOBB Plan Name"");
			ActivateField(""STC Service Location"");//SUMANK: Added for VAT
			ActivateField(""STC Authorized Notification Type"");
			ActivateField(""STC Authorized Number"");
			ActivateField(""STC Authorized Email Id"");
			ActivateField(""STC Auth Number Notifications"");
			ClearToQuery();
			SetViewMode(AllView);			
			SetSearchSpec(""Id"",OrderId);
			ExecuteQuery(ForwardOnly);
			var IsRec = FirstRecord();
			if(IsRec){
				sGCCCntryCode = GetFieldValue(""STC GCC Country Code"");	
				VOBBLINKMSISDN = GetFieldValue(""STC VOBB MSISDN Link"");
				VOBBPlan = GetFieldValue(""STC VOBB Plan Name"");
				ServiceLocation = GetFieldValue(""STC Service Location"");
				if(AuthNotifications == null && AuthNotifications == """")
					AuthNotifications = GetFieldValue(""STC Auth Number Notifications"");
				if(AuthNumber == null && AuthNumber == """")
					AuthNumber = GetFieldValue(""STC Authorized Number"");

				AuthNotifType = GetFieldValue(""STC Authorized Notification Type"");
				AuthEmail = GetFieldValue(""STC Authorized Email Id"");
			}//endif IsRec
		}//endwith sOrderBc
		//Added for the CIO Software Update SD above
	 	with(OrderLineBC)
	 	{
			// Query for the Root Line Items and Fetch the MSISDN Number
			ActivateField(""Service Id"");
			ActivateField(""STC ICCID"");
			ActivateField(""STC MNP MSISDN"");
			ActivateField(""Order Header Id"");
			ActivateField(""Root Order Item Id"");
			ActivateField(""Parent Order Item Id"");
			ActivateField(""STC Authorization Code"");
			ActivateField(""STC IMSI"");
			ActivateField(""STC IMSI1"");
			ActivateField(""Id"");
			ActivateField(""Service Account Id"");
			ActivateField(""Billing Profile Id"");
			ActivateField(""Part Number"");//Mayank: EFTS	
			ActivateField(""STC Node Id"");
			ClearToQuery();
			SetViewMode(AllView);
			
			setsearchexpr  = ""[Order Header Id] = '"" + OrderId + ""' AND "" + ""[Parent Order Item Id] IS NULL"";
			SetSearchExpr(setsearchexpr);
			ExecuteQuery(ForwardOnly);
			isRecord = FirstRecord();
	
			//Create Subscription for all the MSISDNs chosen at the Line Item level
			while(isRecord)
			{
				////Mayank: EFTS START
				PackagePartCode=GetFieldValue(""Part Number"");
				var Package = TheApplication().InvokeMethod(""LookupValue"",""STC_PACKAGE_TYPE_EFTS"",PackagePartCode);
				Package = Package.substring(0, 5);
				if(Package == ""VOICE"")
				{
					SANPackage = ""Voice"";
				}
				if(Package == ""BROAD"")
				{
					SANPackage = ""Broadband"";
				}
				//Mayank: EFTS END	
				vMSISDN = GetFieldValue(""Service Id"");
				if(vMSISDN == """" || vMSISDN == null)
				{
		     		vMSISDN = GetFieldValue(""STC MNP MSISDN"");
				}
				vICCID = GetFieldValue(""STC ICCID"");
				DatacomCircuitId = GetFieldValue(""STC Node Id"");
				vId = GetFieldValue(""Id"");
				vRootId = GetFieldValue(""Root Order Item Id"");
				sAuthLevel = GetFieldValue(""STC Authorization Code"");
				sBillProfileId = GetFieldValue(""Billing Profile Id"");
				sIMSI1 = GetFieldValue(""STC IMSI1"");
				sIMSI = GetFieldValue(""STC IMSI"");
				if(vId == vRootId)
				{
				//Create New Subscription Record
				//[09Aug2015][NAVINR][SD: Corporate Individual Customers]
					sServiceAccountId = CreateSubscriptionRecord(OrderId,DatacomCircuitId,OrderCustProvType,BillingAccName,CustomerAccountId,vMSISDN,BillingAccId,AuthNumber,AuthNotifications,BillingAddrId,PrimaryContactId,vICCID,OrderSubType,vId,AccountType,sAuthLevel,sBillProfileId,sIMSI1,sIMSI,CommunityType,sGCCCntryCode,VOBBLINKMSISDN,VOBBPlan,Outputs,SANPackage,ServiceLocation,vPlanPartCode,AuthNotifType,AuthEmail);//Mayank: EFTS Added SANPackage:SUMANK: Added ServiceLocation
					if(sErrorCode!="""")
					{
						Outputs.SetProperty(""Error Message"",sErrorMsg);
						Outputs.SetProperty(""Error Code"",sErrorCode);
						Outputs.SetProperty(""ServiceAccountId"","""");
						return(CancelOperation);
					}
					Outputs.SetProperty(""ServiceAccountId"",sServiceAccountId);
					//CreateSubscriptionRecord(OrderId,OrderCustProvType,BillingAccName,CustomerAccountId,BillingAccId,BillingAddrId,PrimaryContactId,OrderSubType,vId,Outputs);
					if(vSubscriptionId != """")
					{
						SetFieldValue(""Service Account Id"",vSubscriptionId);
						WriteRecord();
						//vSubscriptionId="""";
					}
					isRecord = NextRecord();
				}
				else
				{
					SetFieldValue(""Service Account Id"",vSubscriptionId);
					WriteRecord();
					isRecord = NextRecord();
				}
			}
		}
	}
	catch(e)
	{
		if(e.errCode == ""22709"")
		{
			throw(e.errText);
		}
	}
	finally
	{
		OrderLineBC = null;
		OrderBO = null;
	}
}
function CreateSubscriptionRecord(OrderId,DatacomCircuitId,OrderCustProvType,BillingAccName,CustomerAccountId,vMSISDN,BillingAccId,AuthNumber,AuthNotifications,BillingAddrId,PrimaryContactId,vICCID,OrderSubType,vId,AccountType,sAuthLevel,sBillProfileId,sIMSI1,sIMSI,CommunityType,sGCCCntryCode,VOBBLINKMSISDN,VOBBPlan,Outputs,SANPackage,ServiceLocation,vPlanPartCode,AuthNotifType,AuthEmail)// Mayank: EFTS added SANPackage:SUMANK: Added ServiceLocation for VAT
{
	try
	{
 		var AccountBO=null, ServiceAccntBC=null, ContactBC=null;
		var sPricingType, isRec;
		var BABO, BillingAccntBC, PrefLang;
		var CrdLimit;
		var isRecord, vName;
		var vContactBC, vAssociateBC,isPrimaryContact;
		var vStreetAddress, vAssociateAddr, isPrimaryAddress;
		var sSearchExpr, slovInactive;
		var IDType, IDNum;
		var vAuthNumFlag="""", vAuthNumUpdFlag="""", vMENAPlanFlag="""", vBlockPlanFlag="""";
		/*[11Aug2015][NAVINR][SD: Corporate Individual Customer creation]*/
 		var vCompName="""", vCRNum="""", vCRCANId="""", vCRCustType="""";
		var vIOTAttribute="""", vIOTAccountID=""""; //Indrasen:15feb2021:IOTphase2
		
		BABO = TheApplication().GetBusObject(""STC Billing Account"");
		BillingAccntBC = BABO.GetBusComp(""CUT Invoice Sub Accounts""); // Billing Account record then look for child Service Account
		ContactBC = TheApplication().GetBusObject(""Contact"").GetBusComp(""Contact-Thin"");
		//----------- MANUJ - Production Defects----------START----
		var	CustomerAccntBC, CusIDNum, CusIDType;
		CustomerAccntBC = BABO.GetBusComp(""Account"");
		if(SANPackage == ""Broadband"")
		{//[NAVIN:26May2020:OpenAccesssToMENAAgents]
			vAuthNumUpdFlag = TheApplication().InvokeMethod(""LookupValue"",""STC_AUTH_NUMBER_SAN_UPDATE"",""AUTH_NUM_UPDATE_FLAG"");
			vMENAPlanFlag = TheApplication().InvokeMethod(""LookupValue"", ""STC_MENA_PLANS"", vPlanPartCode);
			vMENAPlanFlag = vMENAPlanFlag.substring(0,8);
			vMENAPlanFlag = TheApplication().InvokeMethod(""LookupValue"",""STC_AUTH_NUMBER_SAN_UPDATE"",vMENAPlanFlag);
			vMENAPlanFlag = vMENAPlanFlag.substring(0,5);

			vBlockPlanFlag = TheApplication().InvokeMethod(""LookupValue"",""STC_AUTH_NUMBER_SAN_UPDATE"",vPlanPartCode);
			vBlockPlanFlag = vBlockPlanFlag.substring(0,5);

			if(vAuthNumUpdFlag == ""BLOCK"" && (vMENAPlanFlag == ""BLOCK"" || vBlockPlanFlag == ""BLOCK""))
				vAuthNumFlag = ""BLOCK"";
		}
		vIOTAttribute = TheApplication().InvokeMethod(""LookupValue"",""STC_AUTH_NUMBER_SAN_UPDATE"",vPlanPartCode);
		vIOTAttribute = vIOTAttribute.substring(0,10);
		if(vIOTAttribute == ""IOT_ATTRIB"")		//Indrasen:15feb2021:IOTphase2
		{
			vIOTAccountID = GetIOTAccountID(OrderId, vPlanPartCode);
		}

		with(CustomerAccntBC)
		{
			ActivateField(""Survey Type"");
			ActivateField(""Tax ID Number"");
			ActivateField(""STC Preferred Language"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Id"", CustomerAccountId);
			ExecuteQuery(ForwardOnly);
			var isCustRec = FirstRecord();
			if(isCustRec)
			{
				CusIDType = GetFieldValue(""Survey Type"");
				CusIDNum = GetFieldValue(""Tax ID Number"");
				PrefLang = GetFieldValue(""STC Preferred Language"");
			}
		}
		//----------- MANUJ - Production Defects----------END--------
		with(ContactBC)
		{
			ActivateField(""STC ID Type"");
			ActivateField(""STC ID #"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Id"", PrimaryContactId);
			ExecuteQuery(ForwardOnly);
			var isContactRec = FirstRecord();
			if(isContactRec)
			{
				IDType = GetFieldValue(""STC ID Type"");
				IDNum = GetFieldValue(""STC ID #"");
		
			}
		}
		
		with(BillingAccntBC)
		{
			ActivateField(""STC Service Type"");			
			ActivateField(""STC Contract Category"");
			/*[11Aug2015][NAVINR][SD: Corporate Individual Customer creation]*/
			ActivateField(""STC Individual Company Name"");
			ActivateField(""STC Individual CR Number"");
			ActivateField(""STC Individual CR CAN"");
			ActivateField(""STC Individual CR Cust Type"");
			  ActivateField(""Credit Score"");// SUMANK JULY9 Added for OCMC SD to Set CL for SAN
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Id"",BillingAccId);
			ExecuteQuery(ForwardBackward);
			isRec = FirstRecord();
		
			if(isRec)//if the billing account exists then can proceed
			{
				sPricingType = GetFieldValue(""STC Service Type"") ;
				var ContrCat = GetFieldValue(""STC Contract Category"");
				ServiceAccntBC = BABO.GetBusComp(""CUT Service Sub Accounts"");
				slovInactive = TheApplication().InvokeMethod(""LookupValue"",""ACCOUNT_STATUS"",""Terminated"");
				/*[11Aug2015][NAVINR][SD: Corporate Individual Customer creation]*/
				vCompName = GetFieldValue(""STC Individual Company Name""); 
				vCRNum = GetFieldValue(""STC Individual CR Number"");
				vCRCANId = GetFieldValue(""STC Individual CR CAN"");
				vCRCustType = GetFieldValue(""STC Individual CR Cust Type"");
				CrdLimit = GetFieldValue(""Credit Score"");// SUMANK JULY9 Added for OCMC SD to Set CL for SAN
				
				with(ServiceAccntBC)
				{
					ActivateField(""DUNS Number"");
					ActivateField(""STC Pricing Plan Type"");
					ActivateField(""STC-ICCID"");
					ActivateField(""STC IMSI1"");
					ActivateField(""STC IMSI"");
					ActivateField(""Primary Address Id"");
					ActivateField(""Parent Account Id"");
					ActivateField(""Master Account Id"");
					ActivateField(""STC Service Location"");//SUMANK: Added for VAT
					ActivateField(""Account Status"");
					ActivateField(""Primary Contact First Name"");
					ActivateField(""STC Root Order Item Id"");
					ActivateField(""Street Address"");   // Activated since GetAssocBusComp is not working
					ActivateField(""STC Account Authority Level"");
					ActivateField(""Primary Billing Profile Id"");
					ActivateField(""STC ID #"");
					ActivateField(""STC ID Type"");
					ActivateField(""STC Contract Category"");
					ActivateField(""STC Authorized Notifications"");
					ActivateField(""STC Authorized Number"");
					ActivateField(""STC Authorized Notification Type"");
					ActivateField(""STC Authorized Email Id"");
					ActivateField(""STC Community Type"");
					ActivateField(""STC GCC Country Code"");
					ActivateField(""STC VOBB LINK MSISDN"");
					ActivateField(""STC VOBB Link Service"");
					ActivateField(""STC OCMC Credit Score"");
					ActivateField(""STC Package Type"");
					/*[11Aug2015][NAVINR][SD: Corporate Individual Customer creation]*/
					ActivateField(""STC Individual Customer Type"");
					ActivateField(""STC Individual Company Name"");
					ActivateField(""STC Individual CR Number"");
					ActivateField(""STC Individual CR CAN"");
					ActivateField(""STC Individual CR Cust Type"");
					ActivateField(""STC Datacom Circuit Id"");
					ActivateField(""STC Pref Lang"");	
					ActivateField(""STC CPBX Tenant"");
					SetViewMode(AllView);
					ClearToQuery();
					sSearchExpr = ""[DUNS Number]='"" + vMSISDN + ""' AND [Account Status] <>'"" + slovInactive +""'"";
					SetSearchExpr(sSearchExpr);
					ExecuteQuery();
					isRecord = FirstRecord();
		
					if(isRecord)
					{//Check if the Subscription is already created
						vSubscriptionId = GetFieldValue(""Id"");
						sErrorMsg = TheApplication().LookupMessage(""User Defined Errors"",""OM0017"");
						sErrorCode = ""OM0017"";
						return(CancelOperation);
					}
					else
					{
						vName = BillingAccName;
						NewRecord(NewAfter);
					
						SetFieldValue(""Name"",vName);
						SetFieldValue(""Parent Account Id"",BillingAccId);
					
						SetFieldValue(""DUNS Number"",vMSISDN);
						SetFieldValue(""STC-ICCID"",vICCID);
						SetFieldValue(""STC IMSI1"",sIMSI1);
						SetFieldValue(""STC IMSI"",sIMSI);
						SetFieldValue(""Master Account Id"",CustomerAccountId);
						SetFieldValue(""Primary Address Id"",BillingAddrId);
						SetFieldValue(""Primary Billing Profile Id"",sBillProfileId);
						SetFieldValue(""STC Service Location"",ServiceLocation);//SUMANK: Added for VAT.
						SetFieldValue(""Type"",AccountType);

						if(vIOTAttribute == ""IOT_ATTRIB"")		//Indrasen:15feb2021:IOTphase2
						{
							SetFieldValue(""STC CPBX Tenant"",vIOTAccountID);
						}
						//----------- MANUJ - Production Defects----------START----
						if(ContrCat != ""Employee Relative"")
						{
							IDType = CusIDType;
							IDNum = CusIDNum;
						}
						//----------- MANUJ - Production Defects----------END------
						SetFieldValue(""STC ID Type"",IDType);	
						SetFieldValue(""STC ID #"",IDNum);
						SetFieldValue(""STC Pricing Plan Type"",sPricingType);
						SetFieldValue(""STC Account Authority Level"",sAuthLevel);
						SetFieldValue(""STC Community Type"",CommunityType);
						SetFieldValue(""STC Contract Category"",ContrCat);
						vSubscriptionId = GetFieldValue(""Id"");

						if(vAuthNumFlag == ""BLOCK""){}
						else{
							SetFieldValue(""STC Authorized Number"",AuthNumber);
							SetFieldValue(""STC Authorized Notifications"",AuthNotifications);
							SetFieldValue(""STC Authorized Email Id"",AuthEmail);
							SetFieldValue(""STC Authorized Notification Type"",AuthNotifType);
						}
						
						SetFieldValue(""STC Pref Lang"",PrefLang);
						SetFieldValue(""STC VOBB LINK MSISDN"",VOBBLINKMSISDN);
						SetFieldValue(""STC VOBB Link Service"",VOBBPlan);
						SetFieldValue(""STC GCC Country Code"",sGCCCntryCode);
						SetFieldValue(""STC Datacom Circuit Id"",DatacomCircuitId);
						SetFieldValue(""STC OCMC Credit Score"",CrdLimit);
						SetFieldValue(""STC Package Type"",SANPackage);//Mayank: EFTS
						/*[11Aug2015][NAVINR][SD: Corporate Individual Customer creation]*/
						SetFieldValue(""STC Individual Customer Type"",OrderCustProvType);
						if (OrderCustProvType == ""Corporate Individual"")
						{
							SetFieldValue(""STC Individual Company Name"",vCompName);
							SetFieldValue(""STC Individual CR Number"",vCRNum);
							SetFieldValue(""STC Individual CR CAN"",vCRCANId);
							SetFieldValue(""STC Individual CR Cust Type"",vCRCustType);
						}
							
					// Associate Primary Contact Details to the subscription
						vContactBC = GetMVGBusComp(""Primary Contact First Name"");
						with(vContactBC)
						{
							vAssociateBC = GetAssocBusComp();
							with(vAssociateBC)
							{
									SetViewMode(AllView);
									ClearToQuery();
									SetSearchSpec(""Id"",PrimaryContactId);
									ExecuteQuery(ForwardOnly);
									isPrimaryContact = FirstRecord();
								if(isPrimaryContact)
								{
									Associate(NewAfter);
								}
							}
							WriteRecord();
						}//with(vContactBC)

				// Associate the Address details to the subscription
						vStreetAddress = GetMVGBusComp(""Street Address"");
						with(vStreetAddress)
						{
							vAssociateAddr = GetAssocBusComp();
							with(vAssociateAddr)
							{
								SetViewMode(AllView);
								ClearToQuery();
								SetSearchSpec(""Id"",BillingAddrId);
								ExecuteQuery(ForwardOnly);
								isPrimaryAddress = 	FirstRecord();
								if(isPrimaryAddress)
								{
										Associate(NewAfter);
								}
							}
							WriteRecord(); 
						}//with(vStreetAddress)
	
					WriteRecord();
					}//else
				}//with(ServiceAccntBC)
			} //if(isRec)
		}//with(BillingAccntBC)
		return vSubscriptionId;
	}
	catch(e)
	{
			TheApplication().RaiseErrorText(e.toString());

	}
	finally
	{
		ContactBC=null;
		ServiceAccntBC = null;
		BillingAccntBC = null;
		BABO = null;
	}
}
function GetIOTAccountID(vOrderId, vPlanPartCode)
{
	var sOrderBO, sOrderBc, sOrderLineBC, sOrderItemXA;
	var IsLineRec, IsRec, vItemId = """", vIOTAccountID="""";
	try
	{
		sOrderBO = TheApplication().GetBusObject(""MACD Performance Order"");
		sOrderLineBC = sOrderBO.GetBusComp(""MACD Order Entry - Line Items"");
		sOrderItemXA = sOrderBO.GetBusComp(""MACD Order Item XA"");

		with(sOrderLineBC)
		{
			ClearToQuery();
			SetViewMode(AllView);		
			SetSearchExpr(""[Order Header Id] = '""+ vOrderId +""' AND [Product Part Number] = '""+ vPlanPartCode +""'"");			
			ExecuteQuery(ForwardBackward);
			IsLineRec = FirstRecord();
			if(IsLineRec)
			{
				vItemId = GetFieldValue(""Id"");
				with(sOrderItemXA)
				{
					ActivateField(""Text Value"");
					ClearToQuery();
					SetViewMode(AllView);			
					SetSearchExpr(""[Object Id] = '""+ vItemId +""' AND [Name] = 'Account Id'"");	
					ExecuteQuery(ForwardBackward);
					IsRec = FirstRecord();
					if(IsRec)
					{
						vIOTAccountID = GetFieldValue(""Text Value"");
					}
				}
			}
		}

		return vIOTAccountID;
	}
	catch(e)
	{
		TheApplication().RaiseErrorText(e.toString());
	}
	finally
	{
		sOrderBO=null; sOrderBc=null; sOrderLineBC=null; sOrderItemXA=null;
	}	
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	try
	{
	 //[09Aug2015][NAVINR][SD: Corporate Individual Customers]
	 var OrderId = """";
	 var BillingAccName = """", CustomerAccountId = """", BillingAccId = """", PrimaryContactId = """", BillingAddrId = """"; 
	 var OrderSubType = """", AccountType = """", CommunityType = """", AuthNumber = """", AuthNotifications = """";
	 var ServiceAccountId = """", sGCCCntryCode = """", OrderCustProvType = """", vPlanPartCode = """";
	 
		if(MethodName == ""CreateSubscription"")
		{
			OrderId = Inputs.GetProperty(""Order Id"");
			BillingAccName = Inputs.GetProperty(""Billing Account Name"");
			CustomerAccountId = Inputs.GetProperty(""Customer Account Id"");
			BillingAccId = Inputs.GetProperty(""Billing Account Id"");
			PrimaryContactId = Inputs.GetProperty(""Primary Contact Id"");
			BillingAddrId = Inputs.GetProperty(""Billing Address Id"");
			OrderSubType = Inputs.GetProperty(""Order Sub Type"");
        	AccountType = Inputs.GetProperty(""Account Type"");
        	CommunityType = Inputs.GetProperty(""Community Type"");
       		AuthNumber = Inputs.GetProperty(""AuthorizedNumber"");
        	AuthNotifications = Inputs.GetProperty(""AuthNotifications"");
        	ServiceAccountId = """";
        	OrderCustProvType = Inputs.GetProperty(""CustProvisionType"");
        	vPlanPartCode = Inputs.GetProperty(""PlanPartCode"");
        	
     		Outputs.SetProperty(""Error Code"","""");
     		Outputs.SetProperty(""Error Message"","""");
     		sGCCCntryCode = Inputs.GetProperty(""GCCCountryCode"");//CIO

			CreateSubscription(OrderId,OrderCustProvType,BillingAccName,CustomerAccountId,BillingAccId,AuthNumber,AuthNotifications,PrimaryContactId,BillingAddrId,OrderSubType,AccountType,CommunityType,sGCCCntryCode,vPlanPartCode,Outputs);
		//	Outputs.SetProperty(""ServiceAccountId"",ServiceAccountId);	
		} 
		
		if(MethodName == ""CreateCorpGPRSSubscription"")
		{
			OrderId = Inputs.GetProperty(""Order Id"");
			BillingAccName = Inputs.GetProperty(""Billing Account Name"");
			CustomerAccountId = Inputs.GetProperty(""Customer Account Id"");
			BillingAccId = Inputs.GetProperty(""Billing Account Id"");
			PrimaryContactId = Inputs.GetProperty(""Primary Contact Id"");
			BillingAddrId = Inputs.GetProperty(""Billing Address Id"");
			OrderSubType = Inputs.GetProperty(""Order Sub Type"");
        	AccountType = Inputs.GetProperty(""Account Type"");
        	CommunityType = Inputs.GetProperty(""Community Type"");
        	vPlanPartCode = Inputs.GetProperty(""PlanPartCode"");
        	ServiceAccountId = """";
     		Outputs.SetProperty(""Error Code"","""");
     		Outputs.SetProperty(""Error Message"","""");
     		
			CreateCorpGPRSSubscription(OrderId,BillingAccName,CustomerAccountId,BillingAccId,PrimaryContactId,BillingAddrId,OrderSubType,AccountType,CommunityType,vPlanPartCode,Outputs);

		}
		
		if(MethodName == ""CreateSpiltBillSubscription"")
		{
			CreateSpiltBillSubscription(Inputs, Outputs);
			return (CancelOperation);
		}
		
		return (CancelOperation);
	}
	catch(e)
	{

	}

	finally
	{
	
	}
}
"var vSubscriptionId = """";
var sErrorMsg="""";
var sErrorCode="""";"
function CreateCorpGPRSSubscription(OrderId,BillingAccName,CustomerAccountId,BillingAccId,PrimaryContactId,BillingAddrId,OrderSubType,AccountType,CommunityType,Outputs)
{
 var OrderBO;
 var OrderLineBC;
 var setsearchexpr;
 var sBillProfileId;
 var vMSISDN;
 var vICCID;
 var vId;
 var vRootId;
 var sAuthLevel;
 var isRecord;
 var sServiceAccountId;
 var sIMSI;
 var sIMSI1;
 
 try
 {
  OrderBO = TheApplication().GetBusObject(""Order Entry (Sales)"");
  OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items"");
  setsearchexpr = """"; 
   with(OrderLineBC)
   {
   // Query for the Root Line Items and Fetch the MSISDN Number
   ActivateField(""Service Id"");
   ActivateField(""STC ICCID"");
   ActivateField(""Order Header Id"");
   ActivateField(""Root Order Item Id"");
   ActivateField(""Parent Order Item Id"");
   ActivateField(""STC Authorization Code"");
   ActivateField(""STC IMSI"");
   ActivateField(""STC IMSI1"");
   ActivateField(""Id"");
   ActivateField(""Service Account Id"");
   ActivateField(""Billing Profile Id"");
   ClearToQuery();
   SetViewMode(AllView);
   
   setsearchexpr  = ""[Order Header Id] = '"" + OrderId + ""' AND "" + ""[Parent Order Item Id] IS NULL"";
   SetSearchExpr(setsearchexpr);
   ExecuteQuery(ForwardOnly);
   isRecord = FirstRecord();
 
   //Create Subscription for all the MSISDNs chosen at the Line Item level
   while(isRecord)
   {
     vMSISDN = GetFieldValue(""Service Id"");
     vICCID = GetFieldValue(""STC ICCID"");
     vId = GetFieldValue(""Id"");
     vRootId = GetFieldValue(""Root Order Item Id"");
     sAuthLevel = GetFieldValue(""STC Authorization Code"");
     sBillProfileId = GetFieldValue(""Billing Profile Id"");
     sIMSI1 = GetFieldValue(""STC IMSI1"");
     sIMSI = GetFieldValue(""STC IMSI"");
     if(vId == vRootId)
     {
     //Create New Subscription Record
      sServiceAccountId = CreateCorpGPRSSubscriptionRecord(OrderId,BillingAccName,CustomerAccountId,vMSISDN,BillingAccId,BillingAddrId,PrimaryContactId,vICCID,OrderSubType,vId,AccountType,sAuthLevel,sBillProfileId,sIMSI1,sIMSI,CommunityType,Outputs);
      if(sErrorCode!="""")
      {
       Outputs.SetProperty(""Error Message"",sErrorMsg);
       Outputs.SetProperty(""Error Code"",sErrorCode);
       Outputs.SetProperty(""ServiceAccountId"","""");
       return(CancelOperation);
      }
      Outputs.SetProperty(""ServiceAccountId"",sServiceAccountId);
      if(vSubscriptionId != """")
      {
       SetFieldValue(""Service Account Id"",vSubscriptionId);
       WriteRecord();
       //vSubscriptionId="""";
      }
      isRecord = NextRecord();
     }
     else
     {
      SetFieldValue(""Service Account Id"",vSubscriptionId);
      WriteRecord();
      isRecord = NextRecord();
     }
   }
  }
 }
 
 catch(e)
 {
   if(e.errCode == ""22709"")
   {
    throw(e.errText);
   }
 }
 finally
 {
  OrderLineBC = null;
  OrderBO = null;
 }
}
function CreateCorpGPRSSubscriptionRecord(OrderId,BillingAccName,CustomerAccountId,vMSISDN,BillingAccId,BillingAddrId,PrimaryContactId,vICCID,OrderSubType,vId,AccountType,sAuthLevel,sBillProfileId,sIMSI1,sIMSI,CommunityType,Outputs)
{
 try
 {
  var AccountBO;
  var ServiceAccntBC;
  var sPricingType;
  var isRec;
  var BABO;
  var BillingAccntBC;
  var isRecord;
  var vName;
  var vContactBC;
  var vAssociateBC;
  var isPrimaryContact;
  var vStreetAddress;
  var vAssociateAddr;
  var isPrimaryAddress;
  var sSearchExpr;
  var slovInactive;
  
  BABO = TheApplication().GetBusObject(""STC Billing Account"");
  BillingAccntBC = BABO.GetBusComp(""CUT Invoice Sub Accounts""); // Billing Account record then look for child Service Account
  with(BillingAccntBC)
  {
   ActivateField(""STC Service Type"");
   SetViewMode(AllView);
   ClearToQuery();
   SetSearchSpec(""Id"",BillingAccId);
   ExecuteQuery(ForwardBackward);
   isRec = FirstRecord();
  
   if(isRec)//if the billing account exists then can proceed
   {
    sPricingType = GetFieldValue(""STC Service Type"") ;
    ServiceAccntBC = BABO.GetBusComp(""CUT Service Sub Accounts"");
    slovInactive = TheApplication().InvokeMethod(""LookupValue"",""ACCOUNT_STATUS"",""Terminated"");
    //Check if the Subscription is already created
    with(ServiceAccntBC)
    {
     ActivateField(""DUNS Number"");
     ActivateField(""STC Pricing Plan Type"");
     ActivateField(""STC-ICCID"");
     ActivateField(""STC IMSI1""); // Added for specifying IMSI number
     ActivateField(""STC IMSI""); // Added for specifying IMSI number
     ActivateField(""Primary Address Id"");
     ActivateField(""Parent Account Id"");
     ActivateField(""Master Account Id"");
     ActivateField(""Account Status"");
     ActivateField(""Primary Contact First Name"");
     ActivateField(""STC Root Order Item Id"");
     ActivateField(""Street Address"");   // Activated since GetAssocBusComp is not working
     ActivateField(""STC Account Authority Level"");
     ActivateField(""Primary Billing Profile Id"");
     ActivateField(""STC Community Type"");
     SetViewMode(AllView);
    
  
    
    
      vName = BillingAccName;
      NewRecord(NewAfter);
     
      SetFieldValue(""Name"",vName);
      SetFieldValue(""Parent Account Id"",BillingAccId);
     
      SetFieldValue(""DUNS Number"",vMSISDN);
      SetFieldValue(""STC-ICCID"",vICCID);
      SetFieldValue(""STC IMSI1"",sIMSI1);
      SetFieldValue(""STC IMSI"",sIMSI);
      SetFieldValue(""Master Account Id"",CustomerAccountId);
      SetFieldValue(""Primary Address Id"",BillingAddrId);
      SetFieldValue(""Primary Billing Profile Id"",sBillProfileId);
      SetFieldValue(""Type"",AccountType);
      SetFieldValue(""STC Pricing Plan Type"",sPricingType);
      SetFieldValue(""STC Account Authority Level"",sAuthLevel);
      SetFieldValue(""STC Community Type"",CommunityType);
      vSubscriptionId = GetFieldValue(""Id"");
 
     // Associate Primary Contact Details to the subscription
      vContactBC = GetMVGBusComp(""Primary Contact First Name"");
      with(vContactBC)
      {
       vAssociateBC = GetAssocBusComp();
       with(vAssociateBC)
       {
         SetViewMode(AllView);
         ClearToQuery();
         SetSearchSpec(""Id"",PrimaryContactId);
         ExecuteQuery(ForwardOnly);
         isPrimaryContact = FirstRecord();
        if(isPrimaryContact)
        {
         Associate(NewAfter);
        }
       }
       WriteRecord();
      }//with(vContactBC)

    // Associate the Address details to the subscription
      vStreetAddress = GetMVGBusComp(""Street Address"");
      with(vStreetAddress)
      {
       vAssociateAddr = GetAssocBusComp();
       with(vAssociateAddr)
       {
        SetViewMode(AllView);
        ClearToQuery();
        SetSearchSpec(""Id"",BillingAddrId);
        ExecuteQuery(ForwardOnly);
        isPrimaryAddress =  FirstRecord();
        if(isPrimaryAddress)
        {
          Associate(NewAfter);
        }
       }
       WriteRecord(); 
      }//with(vStreetAddress)
 
     WriteRecord();
    
    }//with(ServiceAccntBC)
   } //if(isRec)
  }//with(BillingAccntBC)
  return vSubscriptionId;
 }
 catch(e)
 {
 // var errT = e.errText;
 // var errC = e.errCode;

 }
 finally
 {
  ServiceAccntBC = null;
  BillingAccntBC = null;
  BABO = null;
 }
}
function CreateMIGSAN(OrderId,BillingAccName,CustomerAccountId,vMSISDN,BillingAccId,BillingAddrId,PrimaryContactId,vICCID,OrderSubType,vId,AccountType,sAuthLevel,sBillProfileId,sIMSI1,sIMSI,CommunityType,Outputs,SANPackage,sGCCCntryCode)// Mayank: Added for Post to Pre Migration added SANPackage
{
 try
 {
  var AccountBO;
  var ServiceAccntBC;
  var sPricingType;
  var isRec;
  var BABO;
  var BillingAccntBC;
  var CrdLimit;//SUMANK: July52018 Fix for Defect 477
  var isRecord;
  var vName;
  var vContactBC;
  var vAssociateBC;
  var isPrimaryContact;
  var vStreetAddress;
  var vAssociateAddr;
  var isPrimaryAddress;
  var sSearchExpr;
  var slovInactive;
  var IDType;
  var IDNum;
  BABO = TheApplication().GetBusObject(""STC Billing Account"");
  BillingAccntBC = BABO.GetBusComp(""CUT Invoice Sub Accounts""); // Billing Account record then look for child Service Account
    var ContactBC = TheApplication().GetBusObject(""Contact"").GetBusComp(""Contact-Thin"");
  
  with(ContactBC)
  {
   ActivateField(""STC ID Type"");
   ActivateField(""STC ID #"");
   SetViewMode(AllView);
   ClearToQuery();
   SetSearchSpec(""Id"", PrimaryContactId);
   ExecuteQuery(ForwardOnly);
   var isContactRec = FirstRecord();
   if(isContactRec)
   {
    IDType = GetFieldValue(""STC ID Type"");
    IDNum = GetFieldValue(""STC ID #"");
  
   }
  }
  
  
  with(BillingAccntBC)
  {
   ActivateField(""STC Service Type"");
   ActivateField(""Primary Billing Profile Id"");
   ActivateField(""Credit Score"");//SUMANK: July52018 Fix for Defect 477
   SetViewMode(AllView);
   ClearToQuery();
   SetSearchSpec(""Id"",BillingAccId);
   ExecuteQuery(ForwardBackward);
   isRec = FirstRecord();
  
   if(isRec)//if the billing account exists then can proceed
   {
    sPricingType = GetFieldValue(""STC Service Type"") ;
    sBillProfileId = GetFieldValue(""Primary Billing Profile Id"");
	CrdLimit = GetFieldValue(""Credit Score"");//SUMANK: July52018 Fix for Defect 477
    ServiceAccntBC = BABO.GetBusComp(""CUT Service Sub Accounts"");
    slovInactive = TheApplication().InvokeMethod(""LookupValue"",""ACCOUNT_STATUS"",""Terminated"");
    //Check if the Subscription is already created
    with(ServiceAccntBC)
    {
     ActivateField(""DUNS Number"");
     ActivateField(""STC Pricing Plan Type"");
     ActivateField(""STC-ICCID"");
     ActivateField(""STC IMSI1""); // Added for specifying IMSI number
     ActivateField(""STC IMSI""); // Added for specifying IMSI number
     ActivateField(""Primary Address Id"");
     ActivateField(""Parent Account Id"");
     ActivateField(""Master Account Id"");
     ActivateField(""Account Status"");
     ActivateField(""Primary Contact First Name"");
     ActivateField(""STC Root Order Item Id"");
     ActivateField(""Street Address"");   // Activated since GetAssocBusComp is not working
     ActivateField(""STC Account Authority Level"");
     ActivateField(""Primary Billing Profile Id"");
     ActivateField(""STC Community Type"");
     ActivateField(""STC ID #"");
     ActivateField(""STC ID Type"");
	 ActivateField(""STC Package Type"");// Mayank: Added for Post to Pre Migration
	 ActivateField(""STC OCMC Credit Score"");//SUMANK: July52018 Fix for Defect 477
	 ActivateField(""STC GCC Country Code"");
     SetViewMode(AllView);
    
      vName = BillingAccName;
      NewRecord(NewAfter);
     
      SetFieldValue(""Name"",vName);
      SetFieldValue(""Parent Account Id"",BillingAccId);
     
      SetFieldValue(""DUNS Number"",vMSISDN);
      SetFieldValue(""STC-ICCID"",vICCID);
      SetFieldValue(""STC IMSI1"",sIMSI1);
      SetFieldValue(""STC IMSI"",sIMSI);
      SetFieldValue(""Master Account Id"",CustomerAccountId);
      SetFieldValue(""Primary Address Id"",BillingAddrId);
      SetFieldValue(""Primary Billing Profile Id"",sBillProfileId);
      SetFieldValue(""Type"",AccountType);
      SetFieldValue(""STC Pricing Plan Type"",sPricingType);
      SetFieldValue(""STC Account Authority Level"",sAuthLevel);
      SetFieldValue(""STC Community Type"",CommunityType);
	  SetFieldValue(""STC OCMC Credit Score"",CrdLimit);//SUMANK: July52018 Fix for Defect 477
      vSubscriptionId = GetFieldValue(""Id"");
	  SetFieldValue(""STC Package Type"",SANPackage);// Mayank: Added for Post to Pre Migration
	  SetFieldValue(""STC GCC Country Code"",sGCCCntryCode);

	  SetFieldValue(""STC ID Type"",IDType); 
	  SetFieldValue(""STC ID #"",IDNum);
		//WriteRecord();
 
     // Associate Primary Contact Details to the subscription
      vContactBC = GetMVGBusComp(""Primary Contact First Name"");
      with(vContactBC)
      {
       vAssociateBC = GetAssocBusComp();
       with(vAssociateBC)
       {
         SetViewMode(AllView);
         ClearToQuery();
         SetSearchSpec(""Id"",PrimaryContactId);
         ExecuteQuery(ForwardOnly);
         isPrimaryContact = FirstRecord();
        if(isPrimaryContact)
        {
         Associate(NewAfter);
        }
       }
       WriteRecord();
      }//with(vContactBC)

    // Associate the Address details to the subscription
      vStreetAddress = GetMVGBusComp(""Street Address"");
      with(vStreetAddress)
      {
       vAssociateAddr = GetAssocBusComp();
       with(vAssociateAddr)
       {
        SetViewMode(AllView);
        ClearToQuery();
        SetSearchSpec(""Id"",BillingAddrId);
        ExecuteQuery(ForwardOnly);
        isPrimaryAddress =  FirstRecord();
        if(isPrimaryAddress)
        {
          Associate(NewAfter);
        }
       }
       WriteRecord(); 
      }//with(vStreetAddress)
 
     WriteRecord();
      
    }//with(ServiceAccntBC)
   } //if(isRec)
  }//with(BillingAccntBC)
  return vSubscriptionId;
 }
 catch(e)
 {
 // var errT = e.errText;
 // var errC = e.errCode;

 }
 finally
 {
  ServiceAccntBC = null;
  BillingAccntBC = null;
  BABO = null;
 }
}
function CreateMigrationSAN(OrderId,BillingAccName,CustomerAccountId,BillingAccId,PrimaryContactId,BillingAddrId,OrderSubType,AccountType,CommunityType,Outputs)
{
 var OrderBO=null, OrderBC=null, OrderLineBC=null;
 var setsearchexpr;
 var sBillProfileId, sServiceAccountId="""";
 var vMSISDN, vICCID, vId, vRootId, sAuthLevel;
 var isRecord;
 var sGCCCntryCode="""", VOBBLINKMSISDN="""", VOBBPlan="""";
 var sIMSI, sIMSI1;
 var PackagePartCode, SANPackage = """";//Mayank: Added for Post to Pre Migration
 
 try
 {
  OrderBO = TheApplication().GetBusObject(""Order Entry (Sales)"");
  OrderBC = OrderBO.GetBusComp(""Order Entry - Orders"");
  OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items"");
  setsearchexpr = """"; 

	with(OrderBC){
		ActivateField(""STC GCC Country Code"");
		ActivateField(""STC VOBB MSISDN Link"");
		ActivateField(""STC VOBB Plan Name"");
		ClearToQuery();
		SetViewMode(AllView);			
		SetSearchSpec(""Id"", OrderId);
		ExecuteQuery(ForwardOnly);
		var IsRec = FirstRecord();
		if(IsRec){
			sGCCCntryCode = GetFieldValue(""STC GCC Country Code"");												
			VOBBLINKMSISDN = GetFieldValue(""STC VOBB MSISDN Link"");
			VOBBPlan = 	GetFieldValue(""STC VOBB Plan Name"");			
		}//endif IsRec
	}//endwith OrderBC

   with(OrderLineBC)
   {
	   // Query for the Root Line Items and Fetch the MSISDN Number
	   ActivateField(""Service Id"");
	   ActivateField(""STC ICCID"");
	   ActivateField(""Order Header Id"");
	   ActivateField(""Root Order Item Id"");
	   ActivateField(""Parent Order Item Id"");
	   ActivateField(""STC Authorization Code"");
	   ActivateField(""STC IMSI"");
	   ActivateField(""STC IMSI1"");
	   ActivateField(""Id"");
	   ActivateField(""Service Account Id"");
	   ActivateField(""Billing Profile Id"");
	   ActivateField(""Part Number"");//Mayank: Added for Post to Pre Migration	
	   ClearToQuery();
	   SetViewMode(AllView);
	   
	   setsearchexpr  = ""[Order Header Id] = '"" + OrderId + ""' AND "" + ""[Parent Order Item Id] IS NULL"";
	   SetSearchExpr(setsearchexpr);
	   ExecuteQuery(ForwardOnly);
	   isRecord = FirstRecord();
	 
	   //Create Subscription for all the MSISDNs chosen at the Line Item level
	   while(isRecord)
	   {
   		//Mayank: Added for Post to Pre Migration START
					PackagePartCode=GetFieldValue(""Part Number"");
					var Package = TheApplication().InvokeMethod(""LookupValue"",""STC_PACKAGE_TYPE_EFTS"",PackagePartCode);
					Package = Package.substring(0, 5);
					if(Package == ""VOICE"")
						{
						SANPackage = ""Voice"";
						}
					if(Package == ""BROAD"")
						{
						SANPackage = ""Broadband"";
						}
					//Mayank: Added for Post to Pre Migration END
     vMSISDN = GetFieldValue(""Service Id"");
     vICCID = GetFieldValue(""STC ICCID"");
     vId = GetFieldValue(""Id"");
     vRootId = GetFieldValue(""Root Order Item Id"");
     sAuthLevel = GetFieldValue(""STC Authorization Code"");
     sBillProfileId = GetFieldValue(""Billing Profile Id"");
     sIMSI1 = GetFieldValue(""STC IMSI1"");
     sIMSI = GetFieldValue(""STC IMSI"");
     if(vId == vRootId)
     {
     //Create New Subscription Record
      sServiceAccountId = CreateMIGSAN(OrderId,BillingAccName,CustomerAccountId,vMSISDN,BillingAccId,BillingAddrId,PrimaryContactId,vICCID,OrderSubType,vId,AccountType,sAuthLevel,sBillProfileId,sIMSI1,sIMSI,CommunityType,Outputs,SANPackage,sGCCCntryCode);//Mayank: Added for Post to Pre Migration Added SANPackage
      if(sErrorCode!="""")
      {
       Outputs.SetProperty(""Error Message"",sErrorMsg);
       Outputs.SetProperty(""Error Code"",sErrorCode);
       Outputs.SetProperty(""ServiceAccountId"","""");
       return(CancelOperation);
      }
      Outputs.SetProperty(""ServiceAccountId"",sServiceAccountId);
      if(vSubscriptionId != """")
      {
       SetFieldValue(""Service Account Id"",vSubscriptionId);
       WriteRecord();
       //vSubscriptionId="""";
      }
      isRecord = NextRecord();
     }
     else
     {
      SetFieldValue(""Service Account Id"",vSubscriptionId);
      WriteRecord();
      isRecord = NextRecord();
     }
   }
  }
 }
 
 catch(e)
 {
   if(e.errCode == ""22709"")
   {
    throw(e.errText);
   }
 }
 finally
 {
  OrderLineBC = null;
  OrderBO = null;
 }
}
function CreateSpiltBillSubscription(Inputs, Outputs)
{
try
{
 var BillingAccName = Inputs.GetProperty(""BillingAccName"");
 var CustomerAccountId = Inputs.GetProperty(""CustomerAccountId"");
 var BillingAccId = Inputs.GetProperty(""BillingAccId"");
 var BillingAddrId = Inputs.GetProperty(""BillingAddrId"");
 var PrimaryContactId = Inputs.GetProperty(""PrimaryContactId"");
 var AccountType = Inputs.GetProperty(""AccountType"");
 var sAuthLevel = Inputs.GetProperty(""sAuthLevel"");
 var sBillProfileId = Inputs.GetProperty(""sBillProfileId"");
 var CommunityType = Inputs.GetProperty(""CommunityType"");
 var sSplitBillSvcType = Inputs.GetProperty(""SplitBillServiceType"");
 var sSplitBillFlag = Inputs.GetProperty(""SplitBillFlag"");
 var sSplitEmployeeName = Inputs.GetProperty(""SplitEmployeeName"");
 var sSplitOccupation = Inputs.GetProperty(""SplitEmpOccupation"");
 var sSplitEmpCPR = Inputs.GetProperty(""SplitEmpCPR"");
 var sSplitEmpClass = Inputs.GetProperty(""SplitEmpClass"");
 
 var IdType = """"; var IdNumber = """";

 var sPricingType, ServiceAccntBC, slovInactive, vContactBC, vAssociateBC, vStreetAddress, vAssociateAddr, vSubscriptionId;
 vSubscriptionId = """";
 
 var BABO = TheApplication().GetBusObject(""STC Billing Account"");
 var BillingAccntBC = BABO.GetBusComp(""CUT Invoice Sub Accounts""); // Billing Account record then look for child Service Account
 with(BillingAccntBC)
 {
  ActivateField(""STC Service Type"");
  SetViewMode(AllView);
  ClearToQuery();
  SetSearchSpec(""Id"",BillingAccId);
  ExecuteQuery(ForwardBackward);
  var isRec = FirstRecord();
  if(isRec)//if the billing account exists then can proceed
  {
   sPricingType = GetFieldValue(""STC Service Type"") ;
   ServiceAccntBC = BABO.GetBusComp(""CUT Service Sub Accounts"");
   slovInactive = TheApplication().InvokeMethod(""LookupValue"",""ACCOUNT_STATUS"",""Terminated"");
   //Check if the Subscription is already created
   with(ServiceAccntBC)
   {
   // ActivateField(""DUNS Number"");
    ActivateField(""STC Pricing Plan Type"");
   // ActivateField(""STC-ICCID"");
   // ActivateField(""STC IMSI1""); // Added for specifying IMSI number
   // ActivateField(""STC IMSI""); // Added for specifying IMSI number
    ActivateField(""Primary Address Id"");
    ActivateField(""Parent Account Id"");
    ActivateField(""Master Account Id"");
    ActivateField(""Account Status"");
    ActivateField(""Primary Contact First Name"");
    ActivateField(""STC Root Order Item Id"");
    ActivateField(""Street Address"");   // Activated since GetAssocBusComp is not working
    ActivateField(""STC Account Authority Level"");
    ActivateField(""Primary Billing Profile Id"");
    ActivateField(""STC Community Type"");
    ActivateField(""STC Split Billing Flag"");
    ActivateField(""STC Split Bill Service Type"");
    ActivateField(""STC Split Occupation Type"");
    ActivateField(""STC Split Employee Name"");
    ActivateField(""STC Split Employee CPR"");
    ActivateField(""STC Split Bill Customer Class"");
    ActivateField(""STC ID Type"");
    ActivateField(""STC ID #"");
    SetViewMode(AllView);
    NewRecord(NewAfter);
   
    SetFieldValue(""Name"",BillingAccName);
    SetFieldValue(""Parent Account Id"",BillingAccId);
   // SetFieldValue(""DUNS Number"",vMSISDN);
   // SetFieldValue(""STC-ICCID"",vICCID);
   // SetFieldValue(""STC IMSI1"",sIMSI1);
   // SetFieldValue(""STC IMSI"",sIMSI);
    SetFieldValue(""Master Account Id"",CustomerAccountId);
    SetFieldValue(""Primary Address Id"",BillingAddrId);
    SetFieldValue(""Primary Billing Profile Id"",sBillProfileId);
    SetFieldValue(""Type"",AccountType);
    SetFieldValue(""STC Pricing Plan Type"",sPricingType);
    SetFieldValue(""STC Account Authority Level"",sAuthLevel);
    SetFieldValue(""STC Community Type"",CommunityType);
    SetFieldValue(""STC Split Billing Flag"",sSplitBillFlag);
    SetFieldValue(""STC Split Bill Service Type"",sSplitBillSvcType);
    SetFieldValue(""STC Split Occupation Type"",sSplitOccupation);
    SetFieldValue(""STC Split Employee Name"",sSplitEmployeeName);
    SetFieldValue(""STC Split Employee CPR"",sSplitEmpCPR);
    SetFieldValue(""STC Split Bill Customer Class"",sSplitEmpClass);
    vSubscriptionId = GetFieldValue(""Id"");
    WriteRecord();
    // Associate Primary Contact Details to the subscription
    vContactBC = GetMVGBusComp(""Primary Contact First Name"");
    with(vContactBC)
    {
     vAssociateBC = GetAssocBusComp();
     with(vAssociateBC)
     {
       SetViewMode(AllView);
       ClearToQuery();
       SetSearchSpec(""Id"",PrimaryContactId);
       ExecuteQuery(ForwardOnly);
       var isPrimaryContact = FirstRecord();
      if(isPrimaryContact)
      {
       IdType = GetFieldValue(""STC ID Type"");
       IdNumber = GetFieldValue(""STC ID #"");
       Associate(NewAfter);
      }
     }
     WriteRecord();
    }//with(vContactBC)
    
    // Associate the Address details to the subscription
    vStreetAddress = GetMVGBusComp(""Street Address"");
    with(vStreetAddress)
    {
     vAssociateAddr = GetAssocBusComp();
     with(vAssociateAddr)
     {
      SetViewMode(AllView);
      ClearToQuery();
      SetSearchSpec(""Id"",BillingAddrId);
      ExecuteQuery(ForwardOnly);
      var isPrimaryAddress =  FirstRecord();
      if(isPrimaryAddress)
      {
       Associate(NewAfter);
      }
     }
     WriteRecord(); 
    }//with(vStreetAddress)
    SetFieldValue(""STC ID Type"",IdType);
    SetFieldValue(""STC ID #"",IdNumber);
    WriteRecord();
   }
  } 
 }
 Outputs.SetProperty(""SubscriptionId"", vSubscriptionId);
}
catch(e)
{
 throw(e);
}
finally
{
 ServiceAccntBC = null; BillingAccntBC = null; BABO = null;
}
}
function CreateSubscription(OrderId,BillingAccName,CustomerAccountId,BillingAccId,PrimaryContactId,BillingAddrId,OrderSubType,AccountType,CommunityType,Outputs)
{
 var OrderBO;
 var OrderLineBC;
 var setsearchexpr;
 var sBillProfileId;
 var vMSISDN;
 var vICCID;
 var vId;
 var vRootId;
 var sAuthLevel;
 var isRecord;
 var sServiceAccountId;
 var sIMSI;
 var sIMSI1;
 
 try
 {
  OrderBO = TheApplication().GetBusObject(""Order Entry (Sales)"");
  OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items"");
  setsearchexpr = """"; 
   with(OrderLineBC)
   {
   // Query for the Root Line Items and Fetch the MSISDN Number
   ActivateField(""Service Id"");
   ActivateField(""STC ICCID"");
   ActivateField(""STC MNP MSISDN"");
   ActivateField(""Order Header Id"");
   ActivateField(""Root Order Item Id"");
   ActivateField(""Parent Order Item Id"");
   ActivateField(""STC Authorization Code"");
   ActivateField(""STC IMSI"");
   ActivateField(""STC IMSI1"");
   ActivateField(""Id"");
   ActivateField(""Service Account Id"");
   ActivateField(""Billing Profile Id"");
   ClearToQuery();
   SetViewMode(AllView);
   
   setsearchexpr  = ""[Order Header Id] = '"" + OrderId + ""' AND "" + ""[Parent Order Item Id] IS NULL"";
   SetSearchExpr(setsearchexpr);
   ExecuteQuery(ForwardOnly);
   isRecord = FirstRecord();
 
   //Create Subscription for all the MSISDNs chosen at the Line Item level
   while(isRecord)
   {
     vMSISDN = GetFieldValue(""Service Id"");
     if(vMSISDN == """" || vMSISDN == null)
     {
          vMSISDN = GetFieldValue(""STC MNP MSISDN"");
     }
     vICCID = GetFieldValue(""STC ICCID"");
     vId = GetFieldValue(""Id"");
     vRootId = GetFieldValue(""Root Order Item Id"");
     sAuthLevel = GetFieldValue(""STC Authorization Code"");
     sBillProfileId = GetFieldValue(""Billing Profile Id"");
     sIMSI1 = GetFieldValue(""STC IMSI1"");
     sIMSI = GetFieldValue(""STC IMSI"");
     if(vId == vRootId)
     {
     //Create New Subscription Record
      sServiceAccountId = CreateSubscriptionRecord(OrderId,BillingAccName,CustomerAccountId,vMSISDN,BillingAccId,BillingAddrId,PrimaryContactId,vICCID,OrderSubType,vId,AccountType,sAuthLevel,sBillProfileId,sIMSI1,sIMSI,CommunityType,Outputs);
      if(sErrorCode!="""")
      {
       Outputs.SetProperty(""Error Message"",sErrorMsg);
       Outputs.SetProperty(""Error Code"",sErrorCode);
       Outputs.SetProperty(""ServiceAccountId"","""");
       return(CancelOperation);
      }
      Outputs.SetProperty(""ServiceAccountId"",sServiceAccountId);
      //CreateSubscriptionRecord(OrderId,BillingAccName,CustomerAccountId,BillingAccId,BillingAddrId,PrimaryContactId,OrderSubType,vId,Outputs);
      if(vSubscriptionId != """")
      {
       SetFieldValue(""Service Account Id"",vSubscriptionId);
       WriteRecord();
       //vSubscriptionId="""";
      }
      isRecord = NextRecord();
     }
     else
     {
      SetFieldValue(""Service Account Id"",vSubscriptionId);
      WriteRecord();
      isRecord = NextRecord();
     }
   }
  }
 }
 
 catch(e)
 {
   if(e.errCode == ""22709"")
   {
    throw(e.errText);
   }
 }
 finally
 {
  OrderLineBC = null;
  OrderBO = null;
 }
}
function CreateSubscriptionRecord(OrderId,BillingAccName,CustomerAccountId,vMSISDN,BillingAccId,BillingAddrId,PrimaryContactId,vICCID,OrderSubType,vId,AccountType,sAuthLevel,sBillProfileId,sIMSI1,sIMSI,CommunityType,Outputs)
{
 try
 {
  var AccountBO;
  var ServiceAccntBC;
  var sPricingType;
  var isRec;
  var BABO;
  var BillingAccntBC;
  var isRecord;
  var vName;
  var vContactBC;
  var vAssociateBC;
  var isPrimaryContact;
  var vStreetAddress;
  var vAssociateAddr;
  var isPrimaryAddress;
  var sSearchExpr;
  var slovInactive;
  var IDType;
  var IDNum;
  var ContractCat;
  BABO = TheApplication().GetBusObject(""STC Billing Account"");
  BillingAccntBC = BABO.GetBusComp(""CUT Invoice Sub Accounts""); // Billing Account record then look for child Service Account
  var ContactBC = TheApplication().GetBusObject(""Contact"").GetBusComp(""Contact-Thin"");
  
  with(ContactBC)
  {
   ActivateField(""STC ID Type"");
   ActivateField(""STC ID #"");
   SetViewMode(AllView);
   ClearToQuery();
   SetSearchSpec(""Id"", PrimaryContactId);
   ExecuteQuery(ForwardOnly);
   var isContactRec = FirstRecord();
   if(isContactRec)
   {
    IDType = GetFieldValue(""STC ID Type"");
    IDNum = GetFieldValue(""STC ID #"");
  
   }
  }
  
  
  
  with(BillingAccntBC)
  {
   ActivateField(""STC Service Type"");
   SetViewMode(AllView);
   ClearToQuery();
   SetSearchSpec(""Id"",BillingAccId);
   ExecuteQuery(ForwardBackward);
   isRec = FirstRecord();
  
   if(isRec)//if the billing account exists then can proceed
   {
    sPricingType = GetFieldValue(""STC Service Type"") ;
    ContractCat = GetFieldValue(""STC Contract Category"");
    ServiceAccntBC = BABO.GetBusComp(""CUT Service Sub Accounts"");
    slovInactive = TheApplication().InvokeMethod(""LookupValue"",""ACCOUNT_STATUS"",""Terminated"");
    //Check if the Subscription is already created
    with(ServiceAccntBC)
    {
     ActivateField(""DUNS Number"");
     ActivateField(""STC Pricing Plan Type"");
     ActivateField(""STC-ICCID"");
     ActivateField(""STC IMSI1""); // Added for specifying IMSI number
     ActivateField(""STC IMSI""); // Added for specifying IMSI number
     ActivateField(""Primary Address Id"");
     ActivateField(""Parent Account Id"");
     ActivateField(""Master Account Id"");
     ActivateField(""Account Status"");
     ActivateField(""Primary Contact First Name"");
     ActivateField(""STC Root Order Item Id"");
     ActivateField(""Street Address"");   // Activated since GetAssocBusComp is not working
     ActivateField(""STC Account Authority Level"");
     ActivateField(""Primary Billing Profile Id"");
     ActivateField(""STC ID #"");
     ActivateField(""STC ID Type"");
     ActivateField(""STC Contract Category"");
     ActivateField(""STC Community Type"");
     SetViewMode(AllView);
     ClearToQuery();
    // SetSearchSpec(""DUNS Number"",vMSISDN);   
    // SetSearchSpec(""Account Status"",TheApplication().InvokeMethod(""LookupValue"",""ACCOUNT_STATUS"",""Active""));
     sSearchExpr = ""[DUNS Number]='"" + vMSISDN + ""' AND [Account Status] <>'"" + slovInactive +""'"";
     SetSearchExpr(sSearchExpr);
     ExecuteQuery();
     isRecord = FirstRecord();
  
     if(isRecord)
     {
     // if (OrderSubType == ""Terminate"")
     // {
     //   SetFieldValue(""STC-User Status"",""Terminated"");
     //   SetFieldValue(""Account Status"",""Terminated"");
     //   WriteRecord();
     // }
      vSubscriptionId = GetFieldValue(""Id"");
      sErrorMsg = TheApplication().LookupMessage(""User Defined Errors"",""OM0017"");
      sErrorCode = ""OM0017"";
      return(CancelOperation);
     }
     else
     {
      vName = BillingAccName;
      NewRecord(NewAfter);
     
      SetFieldValue(""Name"",vName);
      SetFieldValue(""Parent Account Id"",BillingAccId);
     
      SetFieldValue(""DUNS Number"",vMSISDN);
      SetFieldValue(""STC-ICCID"",vICCID);
      SetFieldValue(""STC IMSI1"",sIMSI1);
      SetFieldValue(""STC IMSI"",sIMSI);
      SetFieldValue(""Master Account Id"",CustomerAccountId);
      SetFieldValue(""Primary Address Id"",BillingAddrId);
      SetFieldValue(""Primary Billing Profile Id"",sBillProfileId);
      SetFieldValue(""Type"",AccountType);
      SetFieldValue(""STC ID Type"",IDType); 
      SetFieldValue(""STC ID #"",IDNum);
      SetFieldValue(""STC Pricing Plan Type"",sPricingType);
      SetFieldValue(""STC Account Authority Level"",sAuthLevel);
      SetFieldValue(""STC Community Type"",CommunityType);
      SetFieldValue(""STC Contract Category"",ContractCat);
      
      vSubscriptionId = GetFieldValue(""Id"");
 
     // Associate Primary Contact Details to the subscription
      vContactBC = GetMVGBusComp(""Primary Contact First Name"");
      with(vContactBC)
      {
       vAssociateBC = GetAssocBusComp();
       with(vAssociateBC)
       {
         SetViewMode(AllView);
         ClearToQuery();
         SetSearchSpec(""Id"",PrimaryContactId);
         ExecuteQuery(ForwardOnly);
         isPrimaryContact = FirstRecord();
        if(isPrimaryContact)
        {
         Associate(NewAfter);
        }
       }
       WriteRecord();
      }//with(vContactBC)

    // Associate the Address details to the subscription
      vStreetAddress = GetMVGBusComp(""Street Address"");
      with(vStreetAddress)
      {
       vAssociateAddr = GetAssocBusComp();
       with(vAssociateAddr)
       {
        SetViewMode(AllView);
        ClearToQuery();
        SetSearchSpec(""Id"",BillingAddrId);
        ExecuteQuery(ForwardOnly);
        isPrimaryAddress =  FirstRecord();
        if(isPrimaryAddress)
        {
          Associate(NewAfter);
        }
       }
       WriteRecord(); 
      }//with(vStreetAddress)
 
     WriteRecord();
     }//else
    }//with(ServiceAccntBC)
   } //if(isRec)
  }//with(BillingAccntBC)
  return vSubscriptionId;
 }
 catch(e)
 {
   TheApplication().RaiseErrorText(e.toString());

 }
 finally
 {
  ServiceAccntBC = null;
  BillingAccntBC = null;
  BABO = null;
 }
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 try
 {
  if(MethodName == ""CreateSubscription"")
  {
   var OrderId = Inputs.GetProperty(""Order Id"");
   var BillingAccName = Inputs.GetProperty(""Billing Account Name"");
   var CustomerAccountId = Inputs.GetProperty(""Customer Account Id"");
   var BillingAccId = Inputs.GetProperty(""Billing Account Id"");
   var PrimaryContactId = Inputs.GetProperty(""Primary Contact Id"");
   var BillingAddrId = Inputs.GetProperty(""Billing Address Id"");
   var OrderSubType = Inputs.GetProperty(""Order Sub Type"");
         var AccountType = Inputs.GetProperty(""Account Type"");
         var CommunityType = Inputs.GetProperty(""Community Type"");
         var ServiceAccountId = """";
       Outputs.SetProperty(""Error Code"","""");
       Outputs.SetProperty(""Error Message"","""");

   CreateSubscription(OrderId,BillingAccName,CustomerAccountId,BillingAccId,PrimaryContactId,BillingAddrId,OrderSubType,AccountType,CommunityType,Outputs);
  // Outputs.SetProperty(""ServiceAccountId"",ServiceAccountId); 
  } 
  
  if(MethodName == ""CreateCorpGPRSSubscription"")
  {
      var OrderId = Inputs.GetProperty(""Order Id"");
   var BillingAccName = Inputs.GetProperty(""Billing Account Name"");
   var CustomerAccountId = Inputs.GetProperty(""Customer Account Id"");
   var BillingAccId = Inputs.GetProperty(""Billing Account Id"");
   var PrimaryContactId = Inputs.GetProperty(""Primary Contact Id"");
   var BillingAddrId = Inputs.GetProperty(""Billing Address Id"");
   var OrderSubType = Inputs.GetProperty(""Order Sub Type"");
         var AccountType = Inputs.GetProperty(""Account Type"");
         var CommunityType = Inputs.GetProperty(""Community Type"");
         var ServiceAccountId = """";
       Outputs.SetProperty(""Error Code"","""");
       Outputs.SetProperty(""Error Message"","""");

   CreateCorpGPRSSubscription(OrderId,BillingAccName,CustomerAccountId,BillingAccId,PrimaryContactId,BillingAddrId,OrderSubType,AccountType,CommunityType,Outputs);

  }
  
   if(MethodName == ""CreateMigrationSAN"")
  {
      var OrderId = Inputs.GetProperty(""Order Id"");
   var BillingAccName = Inputs.GetProperty(""Billing Account Name"");
   var CustomerAccountId = Inputs.GetProperty(""Customer Account Id"");
   var BillingAccId = Inputs.GetProperty(""Billing Account Id"");
   var PrimaryContactId = Inputs.GetProperty(""Primary Contact Id"");
   var BillingAddrId = Inputs.GetProperty(""Billing Address Id"");
   var OrderSubType = Inputs.GetProperty(""Order Sub Type"");
         var AccountType = Inputs.GetProperty(""Account Type"");
         var CommunityType = Inputs.GetProperty(""Community Type"");
         var ServiceAccountId = """";
       Outputs.SetProperty(""Error Code"","""");
       Outputs.SetProperty(""Error Message"","""");

   CreateMigrationSAN(OrderId,BillingAccName,CustomerAccountId,BillingAccId,PrimaryContactId,BillingAddrId,OrderSubType,AccountType,CommunityType,Outputs);

  }
  
  if(MethodName == ""CreateSpiltBillSubscription"")
  {
   CreateSpiltBillSubscription(Inputs, Outputs);
   return (CancelOperation);
  }
  return (CancelOperation);
 }
 catch(e)
 {

 }

 finally
 {
 
 }
}
function CreateSOAP(Inputs,Outputs)
{
try
 { 
   var vAppObj = TheApplication();
   var psInputs = vAppObj.NewPropertySet();
   var psListOf = vAppObj.NewPropertySet();
   var psParam = vAppObj.NewPropertySet(); 
   psInputs.SetType(""SoapInput"");
   psInputs.SetProperty(""Message Id"", """");
   psInputs.SetProperty(""Message Type"", ""Integration Object"");
   psInputs.SetProperty(""IntObjectName"", ""SoapInput"");
   psInputs.SetProperty(""IntObjectFormat"", ""Siebel Hierarchical"");
   psListOf.SetType(""ListOfSoapInput"");
   psParam.SetType(""SoapInput"");   
   psListOf.AddChild(psParam);
   psInputs.AddChild(psListOf);
   Outputs.AddChild(psInputs);
   return (CancelOperation); 
	  }
  catch (exception)
 {
 	throw(exception.toString());
 }
 finally
 {
    psParam = null;
    psListOf = null;
    psInputs = null;
    vAppObj = null;
 }
  
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	try
	{
		switch(MethodName)
		{
			case ""CreateSOAP"":
			CreateSOAP(Inputs , Outputs);
			return(CancelOperation);
			break;
			
			default:
			return(ContinueOperation);
			
		}
		
	}
	catch(execp)
	{
		throw(execp.toString());
	}
	finally
	{
	}
	
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{

  try
    {
 
       if(MethodName == ""Rate Plan"")
        { 
		        var BillAccountId = Inputs.GetProperty(""BillAccId"");
		        
		        var appObj = TheApplication();
		        var psIn   = appObj.NewPropertySet();
		        var psOut  = appObj.NewPropertySet();
			    var wfService = appObj.GetService(""Workflow Process Manager""); 
			    
			    psIn.SetProperty(""SAN Id"", BillAccountId);
			    psIn.SetProperty(""ProcessName"", ""STC Get Asset MRC CL WF"");
		        
		        wfService.InvokeMethod(""RunProcess"", psIn, psOut);
		       
		     	var total = psOut.GetProperty(""MRC Total"");
		     	var cust_type = psOut.GetProperty(""Type"");
				var PlanMRC =  psOut.GetProperty(""PlanMRC"");
				var OnetimeAddonCnt =  psOut.GetProperty(""OnetimeAddonCnt"");
		        /*var boOrder = TheApplication().GetBusObject(""Order Entry (Sales)"");
		        var bcOrder = boOrder.GetBusComp(""Order Entry - Orders""); 
		        var MRC=0; 
		        var total=0; 
		        bcOrder.ActivateField(""Billing Account Id"");
		        bcOrder.ActivateField(""Current Order Total Net Price MRC"");
		        bcOrder.ActivateField(""STC Order SubType"");
		        bcOrder.SetViewMode(AllView);
		        bcOrder.ClearToQuery();
		        bcOrder.SetSearchSpec(""Billing Account Id"", BillAccountId);
		        bcOrder.SetSearchSpec(""STC Order SubType"",""Provide""); 
		        bcOrder.SetSearchSpec(""Status"", ""<> 'Cancelled' AND [Status] <> 'Failed'""); 
		        bcOrder.ExecuteQuery(ForwardOnly); 
		        //var RecordCount=bcOrder.CountRecords();
		        var recordfound=bcOrder.FirstRecord();
		            while (recordfound)
		             {
		           MRC=bcOrder.GetFieldValue(""Current Order Total Net Price MRC"");
		           total=total+ToNumber(MRC);
		           recordfound=bcOrder.NextRecord();
		             }//while End*/
		           Outputs.SetProperty(""CreditScoreChange"",total);
		           Outputs.SetProperty(""cust_type"",cust_type);
				   Outputs.SetProperty(""PlanMRC"",PlanMRC);
		           Outputs.SetProperty(""OnetimeAddonCnt"",OnetimeAddonCnt);
           }//if End
                 
    }//end try        

	catch(e)
	{
	TheApplication().RaiseErrorText(e.toString());
	}
	
	finally
	{
	//bcOrder=null;
	//boOrder=null;
	}

	return (CancelOperation);

}
"//Your public declarations go here...  
//Your public declarations go here...  
var vIsDevice = ""No"";
var vDeviceProdId=null;"
function AdvancePaymentEcommerce(ObjectId1)
{	
	//Mayank: Added for Ecommerce ----------------- START----------
	try
	{
		//var vApp: Application = TheApplication();	
		var OrderBO: BusObject = TheApplication().GetBusObject(""Order Entry (Sales)"");
		var OrderBC: BusComp = OrderBO.GetBusComp(""Order Entry - Orders"");
		var vExpr = """";
		var vExpr1 = """";
		var AdvancePayment = 0;
		var EcomAdvancePayment = 0;
		var AdvancePaymentDiff = 0;
		var vIsRec = """",vIsRec1 = """";
		with(OrderBC)
		{
			SetViewMode(AllView);
			ActivateField(""STC Advance Installments"");
			ClearToQuery();	
			vExpr = ""[Id] = '""+ObjectId1+""'"";
			SetSearchExpr(vExpr);
			ExecuteQuery(ForwardOnly);
			vIsRec = FirstRecord();
			if(vIsRec)
			{
				AdvancePayment = GetFieldValue(""STC Advance Installments"");
			}
		}
		var ECOMOrderBO: BusObject = TheApplication().GetBusObject(""STC ECom Order BO"");
		var ECOMOrderBC: BusComp = OrderBO.GetBusComp(""STC ECom Order Item BC"");
		with(ECOMOrderBC)
		{
			SetViewMode(AllView);
			ActivateField(""STC Order CRM Id"");
			ActivateField(""STC Advance Payment"");
			ClearToQuery();	
			vExpr1 = ""[STC Order CRM Id] = '""+ObjectId1+""'"";
			SetSearchExpr(vExpr1);
			ExecuteQuery(ForwardOnly);
			vIsRec1 = FirstRecord();
			if(vIsRec1)
			{
				EcomAdvancePayment = GetFieldValue(""STC Advance Payment"");
			}
		}
		AdvancePaymentDiff = AdvancePayment - EcomAdvancePayment;
		if(AdvancePaymentDiff > 0)
		{
			var psWorkflowChildIn: PropertySet = TheApplication().NewPropertySet();		
			var sServiceAF: Service = TheApplication().GetService(""Workflow Process Manager"");
			var vInputPropAF: PropertySet = TheApplication().NewPropertySet();
			var vOutputPropAF: PropertySet = TheApplication().NewPropertySet();		
			vInputPropAF.SetProperty(""AdvancePaymentDiff"",AdvancePaymentDiff);
			
			vInputPropAF.SetProperty(""Object Id"",ObjectId1);//Account BO
			//vInputPropAF.SetProperty(""CANId"",CANId);
			vInputPropAF.SetProperty(""ProcessName"",""STCeCommerceAdvancePaymentDifferenceAdditionProcess"");		
			sServiceAF.InvokeMethod(""RunProcess"", vInputPropAF, vOutputPropAF);
		}
	}
	finally
	{
		ECOMOrderBO = null;
		ECOMOrderBC = null;
		OrderBC = null;
		OrderBO = null;
		//vApp = null;
		
	}
	//Mayank: Added for Ecommerce ----------------- STOP----------
}
function AgeOnNetwork_New(Inputs,Outputs)
{
/**********************************************************************************************************
Purpose 		: Function called from Workflow Process  to  Set Number of Installments 
Author 			: GURURAJ MADHAVARAO
Change Log		: Changes made to the function
***********************************************************************************************************
Date(DD/MM/YYYY)	| By		| Description of Change																		
-----------------------------------------------------------------------------------------------------------
12/09/2019		1.0   | GURURAJ MADHAVARAO	| Modified for new CC Frame Work
13/01/2020		1.1   | NAVINKUMAR RAI	| Modified for MPOS ENHANCEMENTS
03/03/2020		1.2   | NAVINKUMAR RAI	| BR_Automation_Phase3
20/07/2020		1.3   |	GURURAJ MADHAVARAO	| Modified for new Experain Frame Work
----------------------------------------------------------------------------------------------------------*/

	var AccountId="""", vDeviceId="""", sDeviceId="""", vCPR="""", veShop="""", ObjectId1="""";
	var vDefCardOcc="""", vDefSysOcc="""", vBirthDate="""";

	//Variables used for calculation and logic
	var vEmpname=null,vEmpCode=null,vEmpCat=null,vRCount=null,vOccp=null,vCardOccp=null,vNationality=null,vOccpCat=null,vSSpec=null,vAON=null,vElite=null,vBadPayee=null,vCustAge=null,vDeviceRRP=null,vNumIns=null,vNumDevice=null,vEligContrt=null,isRecord=null,vAONchk=0,vCustAgechk=null,vDeviceRRPchk=null,vNumAccDev=null,vExperain=""N"",vByPassExp=""N"";
	var inp=TheApplication().NewPropertySet();
	var out=TheApplication().NewPropertySet();

	var QBS = TheApplication().GetService(""STC Siebel Operation BS"");
	var AccountBO=null, AccountBC=null,vCCMatrixBO=null,vCCMatrixBC=null;
	var vDeviceRRPVal=new Array(),i=0;

	with(Inputs)
	{
		AccountId = GetProperty(""AccountId"");
		vDeviceId = GetProperty(""Device Id"");
		sDeviceId = GetProperty(""sDeviceId"");//Jithin: Advance Payment SD
		vCPR = GetProperty(""CPR"");
		veShop = GetProperty(""EshopFlag"");
		ObjectId1 = GetProperty(""Object Id"");
		
		//[NAVIN:21Jan2020:AdvancePaymentAllocation-MPOSChanges]
		//vCustAge = GetProperty(""CustomerAge"");
		vBirthDate = GetProperty(""BirthDate"");
		vNationality = GetProperty(""Nationality"");
		vCardOccp = GetProperty(""CardOccupation"");
		vByPassExp = GetProperty(""ByPassExp"");
	}

	try
	{  
		vIsDevice = CheckDevice(ObjectId1);
		AccountBO=TheApplication().GetBusObject(""Account"");
		AccountBC=AccountBO.GetBusComp(""Account"");

		with(AccountBC)
		{
			SetViewMode(AllView);
			ActivateField(""Tax ID Number"");
			ActivateField(""Account Type Code"");
			ActivateField(""Household Head Occupation"");
			ActivateField(""STC Card Occupation"");
			ActivateField(""STC Account Created Date"");
			ActivateField(""Employer Name"");
			ActivateField(""Employer Number"");
			ActivateField(""Market Class"");
			ActivateField(""Customer Age On Network"");
			ActivateField(""STC Elite Count Calc"");
			ActivateField(""STC Cust Cat Cal1"");
			ClearToQuery();
			if(AccountId==null || AccountId=='')
			{
				vSSpec=""[Tax ID Number]='""+vCPR+""' AND [Account Type Code]='""+TheApplication().InvokeMethod(""LookupValue"",""CUT_ACCOUNT_TYPE"", ""Customer"")+""'"";
			}
			else
			{
				vSSpec=""[Id]='""+AccountId+""'"";
			}
			SetSearchExpr(vSSpec);
			ExecuteQuery(ForwardOnly);
			isRecord = FirstRecord(); 
			if(isRecord)
			{
				if(AccountId==null || AccountId=='')
				{
					AccountId=GetFieldValue(""Id"");
				}
				
				// Call Experain function
				Inputs.SetProperty(""vAccountId"",AccountId);
				vExperain=ExperianAPI(Inputs,Outputs);
				if(vExperain==""N"" || (vExperain==""Y"" && vByPassExp==""Y""))
				{
					vEmpname=GetFieldValue(""Employer Name"");
					vEmpCode=GetFieldValue(""Employer Number"");
					if(vEmpCode==null || vEmpCode == '')
					{
						vEmpCat=TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""EMP_CAT"");
					}
					else
					{
						//Get Employer Category
						//vSSpec=""[Employer Name]='""+vEmpname+""' AND [Employer Code]='""+vEmpCode+""'"";
						vSSpec=""[Employer Code]='""+vEmpCode+""'"";
						with(inp){
							SetProperty(""BusinessObject"",""STC Customer Classification BO"");
							SetProperty(""BusinessComponent"",""STC Employee Category Matrix"");
							SetProperty(""SearchExpression"",vSSpec);
							SetProperty(""Field0"",""Employer Category"");
						}
						QBS.InvokeMethod(""SiebelQuery"",inp,out);
						vRCount=out.GetProperty(""RecordCount"");
						if(vRCount > 0)
						{
							vEmpCat=out.GetProperty(""Output0"");
						}
						else
						{
							vEmpCat=TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""EMP_CAT"");
						}
						inp.Reset();
						out.Reset();
					}
					vOccp=GetFieldValue(""Household Head Occupation"");
					vCardOccp=GetFieldValue(""STC Card Occupation"");
					vNationality=GetFieldValue(""Market Class"");
					if(vNationality==null || vNationality=='')
					{
						vNationality=TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""NATIONALITY"");
					}
					if(vNationality==TheApplication().InvokeMethod(""LookupValue"",""STC_CUST_CLASS_TYPE"",""Foreigner""))
					{
						vNationality=""Expats"";
					}
					else
					{
						vNationality=""Bahraini"";
					}
					//Get Occupation Category
					//[NAVIN:03Mar2020:BR_Automation_Phase3]
					vOccpCat = GetOccupationCategory_NEWBR(vNationality, vEmpCat, vOccp);
					
					//TheApplication().RaiseErrorText(vNationality+"":""+vEmpCat+"":""+vOccp+"":""+vOccpCat);

					vAON=GetFieldValue(""Customer Age On Network"");
					if(vAON < 36 && vAON >=24)
					{ 
						vAONchk=24;
					}
					else if(vAON < 24 && vAON >=11)
					{
						vAONchk=11;
					}
					else if(vAON < 11 && vAON >=6)
					{
						vAONchk=6;
					}
					else if(vAON < 6 && vAON >=0)
					{
						vAONchk=0;
					}
					else
					{
						vAONchk=36;
					}
					vElite=GetFieldValue(""STC Elite Count Calc"");
					if(vElite==""Y"")
					{
						vElite=""Elite"";
					}
					else
					{
						vElite=""Not Elite"";
					}
					vBadPayee=GetFieldValue(""STC Cust Cat Cal1"");
					if(vBadPayee==""Bad"")
					{
						vBadPayee=""Bad Payee"";
					}
					else
					{
						vBadPayee=""Not Bad Payee"";
					}

					vCustAge=GetCustomerAge(AccountId, vBirthDate);
					if(vCustAge >=30)
					{
						vCustAgechk=30;
					}
					else if(vCustAge < 30)
					{
						vCustAgechk=29;
					}
					if(vDeviceId.length>0)
					{
						vDeviceRRP=GetDeviceRRP(vDeviceId);
					}
					else
					{
						vDeviceRRP=GetDeviceRRP(vDeviceProdId);
					}

					//Get Advance Payments and Device Installments
					inp.Reset();
					out.Reset();
					if(veShop == ""Y"")
					{
						vSSpec=""[Occupation Category] = '""+vOccpCat+""' AND [AON] = '""+vAONchk+""' AND [Bad Payee Status] ='""+vBadPayee+""' AND [Elite Status] ='""+vElite+""' AND [Customer Age] = '""+vCustAgechk+""'"";
						with(Outputs){
							SetProperty(""SearchSpec"",vSSpec);
							SetProperty(""Occupation Category"",vOccpCat);
							SetProperty(""AON"",vAONchk);
							SetProperty(""Bad Payee Status"",vBadPayee);
							SetProperty(""Elite Status"",vElite);
							SetProperty(""Customer Age"",vCustAgechk);
							SetProperty(""ExperianFlag"",vExperain);

							SetProperty(""Nationality"",vNationality);
							SetProperty(""EmployerCategory"",vEmpCat);
							SetProperty(""SystemOccupation"",vOccp);
							SetProperty(""DeviceRRP"",vDeviceRRP);
						}
					}
					else
					{
						vCCMatrixBO=TheApplication().GetBusObject(""STC Customer Classification BO"");
						vCCMatrixBC=vCCMatrixBO.GetBusComp(""STC New Customer Classification Matrix"");
						with(vCCMatrixBC)
						{
							ActivateField(""Occupation Category"");
							ActivateField(""AON"");
							ActivateField(""Bad Payee Status"");
							ActivateField(""Elite Status"");
							ActivateField(""Customer Age"");
							ActivateField(""Eligible 24M Contract"");
							ActivateField(""No of Advance Payments"");
							ActivateField(""No of Accessory Dev Elig"");
							ActivateField(""Device RRP"");
							ActivateField(""No of Device Eligible"");
							vSSpec=""[Occupation Category] = '""+vOccpCat+""' AND [AON] = '""+vAONchk+""' AND [Bad Payee Status] ='""+vBadPayee+""' AND [Elite Status] ='""+vElite+""' AND [Customer Age] = '""+vCustAgechk+""'"";
							ClearToQuery();
							SetSearchExpr(vSSpec);
							ExecuteQuery(ForwardOnly);
							isRecord=FirstRecord();
							while(isRecord)
							{
								vDeviceRRPVal[i]=GetFieldValue(""Device RRP"");
								with(out){
									SetProperty(""vEligContrt"",GetFieldValue(""Eligible 24M Contract""));
									SetProperty(""vNumIns"",GetFieldValue(""No of Advance Payments""));
									SetProperty(""vNumDevice"",GetFieldValue(""No of Device Eligible""));
									SetProperty(""vNumAccDev"",GetFieldValue(""No of Accessory Dev Elig""));
								}
								inp.AddChild(out.Copy());
								out.Reset();
								isRecord=NextRecord();
								i++;
							}
							if(ToNumber(vDeviceRRPVal[0]) < ToNumber(vDeviceRRPVal[1]))
							{
								vDeviceRRPchk=vDeviceRRPVal[0];
								if(ToNumber(vDeviceRRP) <= vDeviceRRPchk)
								{
									vDeviceRRPchk=vDeviceRRPVal[0];
									vEligContrt=inp.GetChild(0).GetProperty(""vEligContrt"");
									vNumIns=inp.GetChild(0).GetProperty(""vNumIns"");
									vNumDevice=inp.GetChild(0).GetProperty(""vNumDevice"");
									vNumAccDev=inp.GetChild(0).GetProperty(""vNumAccDev"");

								}
								else 
								{
									vDeviceRRPchk=vDeviceRRPVal[1];
									if(ToNumber(vDeviceRRP) >= vDeviceRRPchk)
									{
										vEligContrt=inp.GetChild(1).GetProperty(""vEligContrt"");
										vNumIns=inp.GetChild(1).GetProperty(""vNumIns"");
										vNumDevice=inp.GetChild(1).GetProperty(""vNumDevice"");
										vNumAccDev=inp.GetChild(1).GetProperty(""vNumAccDev"");
									}
								}
							}
							else 
							{
								vDeviceRRPchk=vDeviceRRPVal[1];
								if(ToNumber(vDeviceRRP) <= vDeviceRRPchk)
								{
									vDeviceRRPchk=vDeviceRRPVal[1];
									vEligContrt=inp.GetChild(1).GetProperty(""vEligContrt"");
									vNumIns=inp.GetChild(1).GetProperty(""vNumIns"");
									vNumDevice=inp.GetChild(1).GetProperty(""vNumDevice"");
									vNumAccDev=inp.GetChild(1).GetProperty(""vNumAccDev"");
								}
								else 
								{
									vDeviceRRPchk=vDeviceRRPVal[0];
									if(ToNumber(vDeviceRRP) >= vDeviceRRPchk)
									{
										vEligContrt=inp.GetChild(0).GetProperty(""vEligContrt"");
										vNumIns=inp.GetChild(0).GetProperty(""vNumIns"");
										vNumDevice=inp.GetChild(0).GetProperty(""vNumDevice"");
										vNumAccDev=inp.GetChild(0).GetProperty(""vNumAccDev"");
									}
								}
							}

						}
						//if(vDeviceId.length == 0)//Jithin: Commented for advance payment SD
						
						NumberOfInstalment(null,null,null,vNumIns,ObjectId1,vIsDevice,vDeviceId, sDeviceId);
						with(Outputs){
							SetProperty(""NewDeviceFlag"",vIsDevice);
							SetProperty(""DevAllowed"",vNumDevice);
							SetProperty(""ContractElig"",vEligContrt);
							SetProperty(""AccAllowed"",vNumAccDev);
							SetProperty(""NumOfInstalment"",vNumIns);
							
							//[NAVIN:12Mar2020:Added for Testing]
							SetProperty(""Nationality"",vNationality);
							SetProperty(""EmployerCategory"",vEmpCat);
							SetProperty(""SystemOccupation"",vOccp);
							SetProperty(""Occupation Category"",vOccpCat);
							SetProperty(""AON"",vAONchk);
							SetProperty(""Bad Payee Status"",vBadPayee);
							SetProperty(""Elite Status"",vElite);
							SetProperty(""Customer Age"",vCustAgechk);
							SetProperty(""DeviceRRP"",vDeviceRRP);
							SetProperty(""ExperianFlag"",vExperain);
						}
					}//End else-eshop flag
				}//End Experain Flag==""N""
				
			
			}//End isRecord--Account BC
			else
			{//[NAVIN: 21Jan2020: Get Details for New Customer for MPOS]
				if(veShop == ""Y"" && vExperain==""N"")
				{
					vEmpCat=TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""EMP_CAT"");

					if(vNationality == null || vNationality == '')
					{
						vNationality=TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""NATIONALITY"");
					}
					if(vNationality == ""Bahraini""){
						vNationality = ""Bahraini"";
					}
					else{
						vNationality = ""Expats"";
					}

					inp.Reset();
					out.Reset();
					vDefCardOcc = TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""SMART_CARD_OCC"");
					vDefSysOcc = TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""SYSTEM_OCC"");

					vRCount=0;
					if(vCardOccp == null || vCardOccp == """")
						vCardOccp = vDefCardOcc;

					vSSpec=""[Card Occupation]='""+vCardOccp+""'"";
					with(inp){
						SetProperty(""BusinessObject"",""STC Custom Occupation BO"");
						SetProperty(""BusinessComponent"",""STC Custom Occupation BC"");
						SetProperty(""SearchExpression"",vSSpec);
						SetProperty(""Field0"",""System Occupation"");
						SetProperty(""Field1"",""Card Occupation"");
					}
					QBS.InvokeMethod(""SiebelQuery"",inp,out);
					vRCount=out.GetProperty(""RecordCount"");
					if(vRCount > 0)
					{
						vOccp=out.GetProperty(""Output0"");
					}
					if(vOccp == null || vOccp == """")
						vOccp = vDefSysOcc;

					//Get Occupation Category
					//[NAVIN:03Mar2020:BR_Automation_Phase3]
					vOccpCat = GetOccupationCategory_NEWBR(vNationality, vEmpCat, vOccp);

					vAONchk=0;
					vElite=""Not Elite"";
					vBadPayee=""Not Bad Payee"";
					vCustAge = GetCustomerAge(AccountId, vBirthDate);
					if(vCustAge >= 30){
						vCustAgechk=30;
					}
					else{
						vCustAgechk=29;
					}

					vSSpec=""[Occupation Category] = '""+vOccpCat+""' AND [AON] = '""+vAONchk+""' AND [Bad Payee Status] ='""+vBadPayee+""' AND [Elite Status] ='""+vElite+""' AND [Customer Age] = '""+vCustAgechk+""'"";
					with(Outputs){
						SetProperty(""SearchSpec"",vSSpec);
						SetProperty(""Occupation Category"",vOccpCat);
						SetProperty(""AON"",vAONchk);
						SetProperty(""Bad Payee Status"",vBadPayee);
						SetProperty(""Elite Status"",vElite);
						SetProperty(""Customer Age"",vCustAgechk);

						SetProperty(""Nationality"",vNationality);
						SetProperty(""EmployerCategory"",vEmpCat);
						SetProperty(""SystemOccupation"",vOccp);
						SetProperty(""DeviceRRP"",vDeviceRRP);
						SetProperty(""ExperianFlag"",vExperain);
					}
				}
				
			}

		}//End (withAccountBC)
}
catch(e)
{
	throw(e);
}
finally
{
	AccountBC=null; vCCMatrixBC=null;
	AccountBO=null; vCCMatrixBO=null;
}
}
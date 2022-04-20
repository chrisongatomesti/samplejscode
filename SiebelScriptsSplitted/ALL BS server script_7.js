function validateSME(sOrgFlg,sActiveView,sSelfEmployed,sIncomeGroup,sCurrOccupation,sAccountName,sLineOfBusiness,sNumEmp,sBranchLocal,sFirstName,sLastName,sBusTel1,sManagerName,sOffNum,sOffEmail,sCR,sBusTel2,sContractCategory,sCPRNumber,sGCCcountryCode,sID,sConGccCntryCode,sConIDType,sCompanyType,psOutputs)
{
var appObj,i,icode,semailAddr,sfirstChar,slastChar,sNot_First_Last,srequiredChars,sillegalChars,iIndex,ipindex,scurrent_char;
var sErrorCode = """";
var sErrorMsg = """";
var sMesg ="""";
try
{
	appObj = TheApplication();
	with(appObj)
	{
		if(sOrgFlg ==""Y"")
		{
			if(sActiveView == ""STC Create New Customer View"")
			{
				if(sSelfEmployed == ""Y"" && (sIncomeGroup == """" || sIncomeGroup == null))
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0026"") +""\n"";
					sErrorCode += ""AM0026 \n"";
				}
			if((sSelfEmployed == ""N"" || sSelfEmployed == """") && (sCurrOccupation == """" || sCurrOccupation == null))
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0027"") +""\n"";
					sErrorCode += ""AM0027 \n"";
				}
			}
			if(sCR == """" || sCR == null)
			{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0002"") +""\n"";
				sErrorCode += ""AM0002 \n"";
			}
		}
		if(sAccountName == """" || sAccountName == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0001"") +""\n"";
			sErrorCode += ""AM0001 \n"";
		}
		if((sCompanyType == """" || sCompanyType == null))
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""CCS003"") +""\n"";
					sErrorCode += ""CCS003 \n"";
				}
		if(sLineOfBusiness == """" || sLineOfBusiness == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0003"") +""\n"";
			sErrorCode += ""AM0003 \n"";
		}
		if(sNumEmp == """" || sNumEmp == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0034"") +""\n"";
			sErrorCode += ""AM0034 \n"";
		}
		else//[MANUJ] : [CCS]
		{
		if(!isNaN(sNumEmp))
		{
		if (sNumEmp < 1)//Enter No > 1
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""CCS001"") +""\n"";
			sErrorCode += ""CCS001 \n"";
		}
		
		}
//No Of Employees is a Number Field.
		else
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""CCS002"") +""\n"";
			sErrorCode += ""CCS002 \n"";
		}
		}
		if(sBranchLocal == """" || sBranchLocal == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0033"") +""\n"";
			sErrorCode += ""AM0033 \n"";
		}
		if(sFirstName == """" || sFirstName == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0046"") +""\n"";
			sErrorCode += ""AM0046 \n"";
		}
		else
		{
			for (i=0;i<sFirstName.length;i++)
				{ 
					icode = sFirstName.charCodeAt(i); 
					if (!((icode >= 65) && (icode <= 90) || (icode >= 97) && (icode <= 122) || (icode == 32)))
					{
		
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0009"") +""\n"";
						sErrorCode += ""AM0009 \n"";
						break;
					}
				}
		}							
		if(sLastName == """" || sLastName == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0047"") +""\n"";
			sErrorCode += ""AM0047 \n"";
		}
		else
		{
			for (i=0;i<sLastName.length;i++)
				{ 
					icode = sLastName.charCodeAt(i); 
					if (!((icode >= 65) && (icode <= 90) || (icode >= 97) && (icode <= 122) || (icode == 32)))
					{
		
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0010"") +""\n"";
						sErrorCode += ""AM0010 \n"";
						break;
					}
				}
		}
				/// km0050713 written for CPR number validations
		if(sConIDType == """"){
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0090"") +""\n"";
			sErrorCode += ""AM0090 \n"";			
		}//endif
	if(sConIDType == TheApplication().InvokeMethod(""LookupValue"",""STC_CUST_ID_TYPE"",""Bahraini ID"")){	//CIO software SD
		if(sCPRNumber == """" || sCPRNumber == null)
			{
					    sErrorMsg += LookupMessage(""User Defined Errors"",""AM00074"") +""\n"";
						sErrorCode += ""AM00074 \n"";
			}
				else
				{
				if(!isNaN(sCPRNumber))	
				{
					if(sCPRNumber.length < 9 || sCPRNumber.length > 9)
					{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0063"") +""\n"";
						sErrorCode += ""AM0063 \n""
					}
					if(sCPRNumber.length == 9)
						{
			 var sID0 = sCPRNumber.charAt(0);//a  
             var sID1 = sCPRNumber.charAt(1); //b
             var sID2 = sCPRNumber.charAt(2); //c            
             var sID3 = sCPRNumber.charAt(3);//d
             var sID4 = sCPRNumber.charAt(4);//e
             var sID5 = sCPRNumber.charAt(5);//f
             var sID6 = sCPRNumber.charAt(6);//g
             var sID7 = sCPRNumber.charAt(7);//h
             
             var sID8 = sCPRNumber.charAt(8);  //i                   
             var Valid =((sID7*2+sID6*3+sID5*4+sID4*5+sID3*6+sID2*7+sID1*8+sID0*9)%11);
             var Valid1=(11-Valid);
            	}
         
           if(Valid == ""0""|| Valid == ""1"")
           {
           	var SIDNew = ""0"";
           }
           else
           {
           	var SIDNewext = Valid1;
           }
			if(SIDNew != sID8)
			{
				if(SIDNewext != sID8)
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0062"") +""\n"";
						sErrorCode += ""AM0062 \n""
				}
            }
								
				}
				else
				{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM00074"") +""\n"";
				sErrorCode += ""AM00074 \n""
				}
					}				
		// km0050713 written above code	
		}//endif sConIDType //CIO software SD
		if(sConIDType == TheApplication().InvokeMethod(""LookupValue"",""STC_CUST_ID_TYPE"",""GCC"")){
			var sLoginName = TheApplication().LoginName();
			var sSuperUser = TheApplication().InvokeMethod(""LookupValue"",""STC_GCC_SUPER_USER"",sLoginName);
			if(sSuperUser!= sLoginName){
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0084"") +""\n"";
				sErrorCode += ""AM0084 \n"";					
			}//endif sSuperUser!= sLoginName
			else{
				if(sCPRNumber != """"){
					//Validation,ID Type 'GCC' should not be allowed for the GCC Country Code ""BH""
					var sGCCCntCode = TheApplication().InvokeMethod(""LookupValue"",""STC_GCC_COUNTRY_CODE"",""BH"")
					if(sConGccCntryCode == sGCCCntCode){
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0086"") +""\n"";
						sErrorCode += ""AM0086 \n"";
					}//endif sGCCcountryCode == sGCCCntCode
					//Validation of the ID# length for the respective country for the GCCID SRINI:17022014
					if(sConGccCntryCode != """"){
						var sOutps = TheApplication().NewPropertySet();
						var sInps = TheApplication().NewPropertySet();
						sInps.SetProperty(""GCCId"",sCPRNumber);
						sInps.SetProperty(""GCCCountryCode"",sConGccCntryCode);
						sInps.SetProperty(""sErrorMsg"",sErrorMsg);
						sInps.SetProperty(""sErrorCode"",sErrorCode);		
						ValidateGCCId(sInps,sOutps);
						sErrorCode = sOutps.GetProperty(""ErrorCode"");
						sErrorMsg = sOutps.GetProperty(""ErrorMsg"");
					}//endif sGCCCountryCode
					else{
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0085"") +""\n"";
						sErrorCode += ""AM0085 \n"";
					}//endelse sGCCCountryCode
				}//endif sID != """"
				else{
					sErrorMsg = TheApplication().LookupMessage(""User Defined Errors"",""AM0087"")+""\n"";
					sErrorCode += ""AM0087 \n"";
				}//endelse sID != """"					
			}//end else	
			
		}//endif sConIDType == ""GCC""
		if(sBusTel1 == """" || sBusTel1 == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0035"") +""\n"";
			sErrorCode += ""AM0035 \n"";
		}
		else
		{
			if(!isNaN(sBusTel1))
			{
				if(sBusTel1.length < 8)
				{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0041"") +""\n"";
				sErrorCode += ""AM0039 \n"";
				}
			}
			else
			{	
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0040"") +""\n"";
				sErrorCode += ""AM0038 \n"";
			}
		}
		
		if(sBusTel2 == """" || sBusTel2 == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0044"") +""\n"";
			sErrorCode += ""AM0044 \n"";
		}
		else
		{
			if(!isNaN(sBusTel2))
			{
				if(sBusTel2.length < 8)
				{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0044"") +""\n"";
				sErrorCode += ""AM0044 \n"";
				}
			}
			else
			{	
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0043"") +""\n"";
				sErrorCode += ""AM0043 \n"";
			}
		}
		//  
		
		
		if(sContractCategory == ""Medium SME"" || sContractCategory==""Small SME"")//stc@123
		{
			if(sManagerName == """" || sManagerName == null)
			{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0032"") +""\n"";
				sErrorCode += ""AM0032 \n"";
			}
			else
			{
				for (i=0;i<sManagerName.length;i++)
				{ 
					icode = sManagerName.charCodeAt(i); 
					if (!((icode >= 65) && (icode <= 90) || (icode >= 97) && (icode <= 122) || (icode == 32)))
					{
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0045"") +""\n"";
						sErrorCode += ""AM0045 \n"";
						break;
					}
				}
			}
			if(sOffNum == """" || sOffNum == null)
			{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0036"") +""\n"";
				sErrorCode += ""AM0036 \n"";
			}
			else
			{
				if(!isNaN(sOffNum))
				{
					if(sOffNum.length < 8)
					{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0039"") +""\n"";
					sErrorCode += ""AM0039 \n"";
					}
				}
				else
				{	
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0038"") +""\n"";
					sErrorCode += ""AM0038 \n"";
				}
			}
			if(sOffEmail == """" || sOffEmail == null)
			{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0037"") +""\n"";
				sErrorCode += ""AM0037 \n"";
			}
			else
			{
				   semailAddr = sOffEmail;
				   sfirstChar = semailAddr.substring(0,1);
				   slastChar = semailAddr.substring(semailAddr.length-1,semailAddr.length);
				   sNot_First_Last = ""@."";
				   srequiredChars = "".@"";
				   sillegalChars = "",:; <>[]{}!£$%^*()#/+~|"";
				   iIndex = semailAddr.indexOf(""@"");
				   ipindex = semailAddr.lastIndexOf(""."");
				   
				    if (semailAddr.length < 6)
				    {
					       sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
					       sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
						   sErrorCode += ""AM0018 \n"";	
					 }
					 else if (sNot_First_Last.indexOf(sfirstChar,0) != -1)
					 {
						   sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
						   sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
						   sErrorCode += ""AM0018 \n"";
					 }
					 else if (sNot_First_Last.indexOf(slastChar,0) != -1)
	                 {
		                   sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
						   sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
						   sErrorCode += ""AM0018 \n"";
					 }
					 else if(iIndex > ipindex)
					 {
						   sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
						   sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
						   sErrorCode += ""AM0018 \n"";
					 }
	                 else if (sMesg == """")
	                 {
	                       //Process Required Chars
	                       for (i=0;i<srequiredChars.length;i++)
	                       {
	                             scurrent_char = srequiredChars.substring(i,i+1);
	                             if (semailAddr.indexOf(scurrent_char,0) == -1)
	                             {
		                               sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
						               sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
						               sErrorCode += ""AM0018 \n"";
						               break;
				             	 }
				           }  	 
				           
				     }
				     
				      else if (sMesg == """")
	                	{                       
	                        //Process all other illegal chars
	                       for (i=0;i<sillegalChars.length;i++)
	                       {
	                              scurrent_char = sillegalChars.substring(i,i+1);
	                              if (semailAddr.indexOf(scurrent_char,0) != -1)
	                              {
		                                sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
						                sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
						                sErrorCode += ""AM0018 \n"";
						                break;
					              }  
					        }
			    	  	}
			}//if(sOffEmail == """" || sOffEmail == null)
		}///if(sOrgFlg == ""N"")
	}
	with(psOutputs)
		{
			SetProperty(""Error Code"", sErrorCode);
			SetProperty(""Error Msg"", sErrorMsg);
		}
	}
catch(e)
{
	LogException(e);
}
finally
{}

}
function Init (Inputs,Outputs)
{
	try
	{
		with (Outputs)
		{
			SetProperty(""OutstandingAmount"","""");
			SetProperty(""TerminationCharges"","""");
			SetProperty(""Total Charges"","""");
			SetProperty(""ContractName"","""");
			
			//Start - [NAVIN: 05Feb2017: TermnChargesTabEnh]
			SetProperty(""StartDate"","""");
			SetProperty(""EndDate"","""");
			//End - [NAVIN: 05Feb2017: TermnChargesTabEnh]
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
		  Input.SetProperty(""Object Name"", ""STC Termination Charges BS"");
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
function Query(Inputs,Outputs)
{
	var AppObj;
	var TotalCharges, TerminationCharges, OutstandingAmount, TaxAmount, ContractVAT;
	var InputPS, OutputPS, WFBs, PsChildRec;
	var ServAccRowId, EndDate;
	var PackPartCode;
	var ERPProduct = ""N"";//Mayank: Added for ERP Cloud
	var TerminationChargesERP,TotalChargesERP,OutstandingAmountERP,TaxAmountERP;//Mayank: Added for ERP Cloud
	AppObj = TheApplication();
	var psRec:PropertySet = AppObj.NewPropertySet();
	var bsCeilNumber, cnInputPS, cnOutputPS; //Abuzar:11Feb2020:To RoundOff Outstanding Amt:Defect 4440
	try
	{
		ServAccRowId = AppObj.GetProfileAttr(""AccountId"");
		var AssetBC = AppObj.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset"");
		var spec  = ""[Service Account Id] = '"" + ServAccRowId + ""' AND [Status] <> 'Inactive' AND [Type] = 'Package'"";
			with(AssetBC)
			{
				ActivateField(""Product Part Number"");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchExpr(spec);
				ExecuteQuery(ForwardOnly);
				var AssRec = FirstRecord();
				if(AssRec)
				{
					PackPartCode = GetFieldValue(""Product Part Number"");
				}
			}
		//Mayank: Added for ERP Cloud ------- START-------
		var sAssetBC = TheApplication().GetBusObject(""STC Asset Mgmt - Asset Thin BO"").GetBusComp(""STC Asset Mgmt - Asset Thin"");
	//	var ERPspec  = ""[Service Account Id] = '"" + ServAccRowId + ""' AND [Status] <> 'Inactive' AND ([Product Part Number] LIKE 'ADDERPDMA*' OR [Product Part Number] LIKE 'ERP*ADV*' OR [Product Part Number] LIKE 'ERP*PRO*' OR [Product Part Number] LIKE 'ERP*BASIC*')"";
		var ERPspec  = ""[Service Account Id] = '"" + ServAccRowId + ""' AND [Status] <> 'Inactive' AND ([STC Vendor Part Number] = 'ERPDEVICE')"";
		with(sAssetBC)
		{
			ActivateField(""Product Part Number"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchExpr(ERPspec);
			ExecuteQuery(ForwardOnly);
			var ERPAssRec = FirstRecord();
			if(ERPAssRec)
			{
				ERPProduct = ""Y"";
			}
			}//Mayank: Added for ERP Cloud ------- END---------
		var PackPartCodeLOV = AppObj.InvokeMethod(""LookupValue"",""STC_DATACOM_BAL_PACK"",PackPartCode);
		var PackPartCodeSubStr = PackPartCodeLOV.substring(0,7);
		//if(PackPartCodeSubStr != ""DATPACK"")//Mayank: Added for ERP Cloud
		if(PackPartCodeSubStr != ""DATPACK"" || ERPProduct == ""Y"")//Mayank: Added for ERP Cloud
		{
		InputPS = AppObj.NewPropertySet();
		OutputPS = AppObj.NewPropertySet();
		InputPS.SetProperty(""Object Id"",ServAccRowId );
		InputPS.SetProperty(""ProcessName"",""STC New Terminated Account Balance CRM WF"" );
		WFBs = AppObj.GetService(""Workflow Process Manager"");
		WFBs.InvokeMethod(""RunProcess"",InputPS,OutputPS);
		
		//var RespMssgCnt = OutputPS.GetChildCount();
		var RespMssgCnt1 = OutputPS.GetPropertyCount();
		var RespmssgCnt2 = OutputPS.GetChild(3);
		var RespMssg = AppObj.NewPropertySet();
		RespMssg = RespmssgCnt2.Copy();
		var RespMssgCnt = RespMssg.GetChildCount();		
		var RespPayLoad = AppObj.NewPropertySet();
		RespPayLoad = RespMssg.GetChild(0).GetChild(0);
		TotalCharges = RespPayLoad.GetProperty(""SubsciberTotalTerminationOutstanding"");
		TerminationCharges = RespPayLoad.GetProperty(""SubsciberTotalContractCancelAmount"");
		TaxAmount = RespPayLoad.GetProperty(""VATAmount"");	
		//Added for the exception Handling below
		var sErrorCode = RespPayLoad.GetProperty(""ErrorCode"");	
		var sErrMsg = 	RespPayLoad.GetProperty(""ErrorDescription"");		
		//Added for the exception Handling above	
		OutstandingAmount = ToNumber(TotalCharges - TerminationCharges);
		//Abuzar:11Feb2020:To RoundOff Outstanding Amt:Defect 4440 - START
		if (OutstandingAmount != '' && OutstandingAmount != null)
		{
			bsCeilNumber = AppObj.GetService(""STC Ceil Number"");
			cnInputPS = AppObj.NewPropertySet();
			cnOutputPS = AppObj.NewPropertySet();
			with(cnInputPS)
			{
				SetProperty(""InputNum"", OutstandingAmount);
				SetProperty(""DecimalPlaces"", ""3"");
			}
			bsCeilNumber.InvokeMethod(""RoundUpNumber"", cnInputPS, cnOutputPS);
			OutstandingAmount = cnOutputPS.GetProperty(""OutputNum"");
			
		}
//Abuzar:11Feb2020:To RoundOff Outstanding Amt:Defect 4440 - END
		TotalCharges = ToNumber(TotalCharges) + ToNumber(TaxAmount);
		PsChildRec = AppObj.NewPropertySet();
		//Added for the exception Handling below
		
		if(sErrorCode != ""0""){
			if(sErrorCode == ""201"")
				PsChildRec.SetProperty(""ContractName"",""Remote exception occured,please retry."");
			else
				PsChildRec.SetProperty(""ContractName"",sErrMsg);
			Outputs.AddChild(PsChildRec);
			goto End;
		}//endif sErrorCode != ""0""
		//Added for the exception Handling above	
		//Mayank: Added for ERP Cloud ------- END---------
		if(PackPartCodeSubStr == ""DATPACK"" && ERPProduct == ""Y"")
		{
			TerminationChargesERP = TerminationCharges;
			TotalChargesERP = TotalCharges;
			OutstandingAmountERP = OutstandingAmount;
			TaxAmountERP = TaxAmount;
		}
		else
		{	
			PsChildRec.SetProperty(""TerminationCharges"",TerminationCharges);
			PsChildRec.SetProperty(""Total Charges"",TotalCharges);
			PsChildRec.SetProperty(""OutstandingAmount"",OutstandingAmount);
			PsChildRec.SetProperty(""VAT Amount"",TaxAmount);
			PsChildRec.SetProperty(""SubscriptionRowId"",ServAccRowId);
			Outputs.AddChild(PsChildRec);
		}//Mayank: Added for ERP Cloud ------- END---------
		
		var ListOfProductDetail = AppObj.NewPropertySet();
		ListOfProductDetail = RespPayLoad.GetChild(0).GetChild(0).GetChild(0);
		var PsParentRec = AppObj.NewPropertySet();
		var ProductDetailCnt = ListOfProductDetail.GetChildCount();
		var ProductDetail = AppObj.NewPropertySet();
		
		var vContractName="""", vTermCharges="""", vStartDate="""", vEndDate="""";
		
		for(var i=0;i<ProductDetailCnt;i++)
		{
			PsChildRec = AppObj.NewPropertySet();
			ProductDetail = ListOfProductDetail.GetChild(i);
			with (ProductDetail)
			{
				vContractName = GetProperty(""ContractName"");
				vTermCharges = GetProperty(""TerminationCharges"");
				vStartDate = GetProperty(""StartDate"");
				vEndDate = GetProperty(""EndDate"");
				ContractVAT = GetProperty(""TAX"");
			}
			with (PsChildRec)
			{
				SetProperty(""ContractName"",vContractName);
				SetProperty(""TerminationCharges"",vTermCharges);
				SetProperty(""SubscriptionRowId"" , ServAccRowId);
				SetProperty(""StartDate"" , vStartDate);
				SetProperty(""EndDate"" , vEndDate);
				SetProperty(""VAT Amount"" , ContractVAT);
			}
			Outputs.AddChild(PsChildRec);			
		}//endfor
		//Mayank: Added for ERP Cloud ------- START ---------
		if(PackPartCodeSubStr != ""DATPACK"" && ERPProduct == ""Y"")
		{
			End:		
		}//Mayank: Added for ERP Cloud ------- END---------		
		}// end of If(PackPartCodeSubStr == """")
		if(PackPartCodeSubStr == ""DATPACK"")
		{
			InputPS = AppObj.NewPropertySet();
			OutputPS = AppObj.NewPropertySet();
			InputPS.SetProperty(""Object Id"",ServAccRowId );
			InputPS.SetProperty(""ProcessName"",""STC Get Datacom Termination Charges WF"");
			WFBs = AppObj.GetService(""Workflow Process Manager"");
			WFBs.InvokeMethod(""RunProcess"",InputPS,OutputPS);
			var OtherCon = OutputPS.GetProperty(""OtherContractProductName"");
			//[MANUJ] : [Business  Vanity Contract]
			var DisplayVanityContractProduct = OutputPS.GetProperty(""DisplayVanityContractProduct"");
			//[MANUJ] : [Business  Vanity Contract]
			var PsChildRecMain = AppObj.NewPropertySet();
			//Mayank: Added for ERP Cloud ------- START---------
			if(PackPartCodeSubStr == ""DATPACK"" && ERPProduct == ""Y"")
			{
				TerminationCharges = OutputPS.GetProperty(""ContractTerminationCharges"");
				TotalCharges = OutputPS.GetProperty(""TotalTerminationCharges"");
				OutstandingAmount = OutputPS.GetProperty(""DatacomOutstandingAmount"");
				
				TerminationCharges = ToNumber(TerminationCharges) + ToNumber(TerminationChargesERP);
				TotalCharges = ToNumber(TotalCharges) + ToNumber(TotalChargesERP);
				TotalCharges = ToNumber(TotalCharges) - ToNumber(OutstandingAmount);

				PsChildRecMain.SetProperty(""TerminationCharges"",TerminationCharges);
				PsChildRecMain.SetProperty(""Total Charges"",TotalCharges);
				PsChildRecMain.SetProperty(""OutstandingAmount"",OutputPS.GetProperty(""DatacomOutstandingAmount""));
				PsChildRecMain.SetProperty(""VAT Amount"",TaxAmountERP);
				PsChildRecMain.SetProperty(""SubscriptionRowId"",ServAccRowId);
				Outputs.AddChild(PsChildRecMain);
				PsChildRecMain = null;
			}
			else
			{
				PsChildRecMain.SetProperty(""TerminationCharges"",OutputPS.GetProperty(""ContractTerminationCharges""));
				PsChildRecMain.SetProperty(""Total Charges"",OutputPS.GetProperty(""TotalTerminationCharges""));
				PsChildRecMain.SetProperty(""OutstandingAmount"",OutputPS.GetProperty(""DatacomOutstandingAmount""));
				PsChildRecMain.SetProperty(""SubscriptionRowId"",ServAccRowId);
				Outputs.AddChild(PsChildRecMain);
				PsChildRecMain = null;
			}//Mayank: Added for ERP Cloud ------- END---------
			var PsChildRecSec = AppObj.NewPropertySet();

			PsChildRecSec.SetProperty(""ContractName"",OutputPS.GetProperty(""DatacomConProdName""));
			PsChildRecSec.SetProperty(""TerminationCharges"",OutputPS.GetProperty(""ContractTerminationCharges""));
			PsChildRecSec.SetProperty(""SubscriptionRowId"" , ServAccRowId);
			PsChildRecSec.SetProperty(""StartDate"" , OutputPS.GetProperty(""DatacomStartDate""));
			PsChildRecSec.SetProperty(""EndDate"", OutputPS.GetProperty(""DatacomEndDate""));

			Outputs.AddChild(PsChildRecSec);

			if(OtherCon != ""NOCONTRACT"")
			{
				var PsChildRecOther = AppObj.NewPropertySet();
				
				PsChildRecOther.SetProperty(""ContractName"",OutputPS.GetProperty(""OtherContractProductName""));
				PsChildRecOther.SetProperty(""TerminationCharges"",OutputPS.GetProperty(""OtherContractTerminationCharges""));
				PsChildRecOther.SetProperty(""SubscriptionRowId"" , ServAccRowId);
				PsChildRecOther.SetProperty(""StartDate"" , OutputPS.GetProperty(""OtherContractStartDate""));
				PsChildRecOther.SetProperty(""EndDate"", OutputPS.GetProperty(""OtherContractEndDate""));
				
				Outputs.AddChild(PsChildRecOther);
			}
			//[MANUJ] : [Business  Vanity Contract]
			if(DisplayVanityContractProduct == ""Y"")
			{
				var PsChildRecVanity = AppObj.NewPropertySet();
				
				PsChildRecVanity.SetProperty(""ContractName"",OutputPS.GetProperty(""VanityProductName""));
				PsChildRecVanity.SetProperty(""TerminationCharges"",OutputPS.GetProperty(""VanityTerminationCharges""));
				PsChildRecVanity.SetProperty(""SubscriptionRowId"" , ServAccRowId);
				PsChildRecVanity.SetProperty(""StartDate"" , OutputPS.GetProperty(""VanityStartDate""));
				PsChildRecVanity.SetProperty(""EndDate"", OutputPS.GetProperty(""VanityEndDate""));
				
				Outputs.AddChild(PsChildRecVanity);
			}
			//[MANUJ] : [Business  Vanity Contract]
		}//If(PackPartCodeSubStr == ""DATPACK"")

	}
	catch(e)
	{
		LogException(e);
		
		psRec.SetProperty(""TerminationCharges"" , ""Error Occurred"");
		psRec.SetProperty(""OutstandingAmount"" , e.errCode() + "":"" + e.errText());
		Outputs.AddChild(psRec);
	}
	finally
	{
		//[NAVIN: 05Feb2017: TermnChargesTabEnh]
		PsParentRec = null;
		PsChildRec = null;
		ProductDetail = null;
		ListOfProductDetail = null;
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
	var TotalCharges, TerminationCharges, OutstandingAmount, TaxAmount, ContractVAT;
	var InputPS, OutputPS, WFBs, PsChildRec;
	var ServAccRowId, EndDate;
	var PackPartCode,busGenContrPartCode;
	var ERPProduct = ""N"";//Mayank: Added for ERP Cloud
	var TerminationChargesERP,TotalChargesERP,OutstandingAmountERP,TaxAmountERP;//Mayank: Added for ERP Cloud
	AppObj = TheApplication();
	var psRec:PropertySet = AppObj.NewPropertySet();
	var bsCeilNumber, cnInputPS, cnOutputPS; //Abuzar:11Feb2020:To RoundOff Outstanding Amt:Defect 4440
	try
	{
		ServAccRowId = AppObj.GetProfileAttr(""AccountId"");
		var AssetBC = AppObj.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset"");
		var spec  = ""[Service Account Id] = '"" + ServAccRowId + ""' AND [Status] <> 'Inactive' AND [Type] = 'Package'"";
			with(AssetBC)
			{
				ActivateField(""Product Part Number"");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchExpr(spec);
				ExecuteQuery(ForwardOnly);
				var AssRec = FirstRecord();
				if(AssRec)
				{
					PackPartCode = GetFieldValue(""Product Part Number"");
				}
			}
		//Mayank: Added for ERP Cloud ------- START-------
		var sAssetBC = TheApplication().GetBusObject(""STC Asset Mgmt - Asset Thin BO"").GetBusComp(""STC Asset Mgmt - Asset Thin"");
	//	var ERPspec  = ""[Service Account Id] = '"" + ServAccRowId + ""' AND [Status] <> 'Inactive' AND ([Product Part Number] LIKE 'ADDERPDMA*' OR [Product Part Number] LIKE 'ERP*ADV*' OR [Product Part Number] LIKE 'ERP*PRO*' OR [Product Part Number] LIKE 'ERP*BASIC*')"";
		//Thana Modify for Business Generic Device Addon || 22/03/2022
		busGenContrPartCode = TheApplication().InvokeMethod(""LookupValue"",""STC_BUS_GEN_DEV_ADDON"",""CONTRACT_PART_NUM"");
		if (busGenContrPartCode != null && busGenContrPartCode != """")
		{
			var ERPspec  = ""[Service Account Id] = '"" + ServAccRowId + ""' AND [Status] <> 'Inactive' AND ([STC Vendor Part Number] = 'ERPDEVICE' OR [Product Part Number] = '"" + busGenContrPartCode + ""')""; 
		}
		else
		{
			var ERPspec  = ""[Service Account Id] = '"" + ServAccRowId + ""' AND [Status] <> 'Inactive' AND ([STC Vendor Part Number] = 'ERPDEVICE')"";
		}
		with(sAssetBC)
		{
			ActivateField(""Product Part Number"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchExpr(ERPspec);
			ExecuteQuery(ForwardOnly);
			var ERPAssRec = FirstRecord();
			if(ERPAssRec)
			{
				ERPProduct = ""Y"";
			}
			}//Mayank: Added for ERP Cloud ------- END---------
		var PackPartCodeLOV = AppObj.InvokeMethod(""LookupValue"",""STC_DATACOM_BAL_PACK"",PackPartCode);
		var PackPartCodeSubStr = PackPartCodeLOV.substring(0,7);
		//if(PackPartCodeSubStr != ""DATPACK"")//Mayank: Added for ERP Cloud
		if(PackPartCodeSubStr != ""DATPACK"" || ERPProduct == ""Y"")//Mayank: Added for ERP Cloud
		{
		InputPS = AppObj.NewPropertySet();
		OutputPS = AppObj.NewPropertySet();
		InputPS.SetProperty(""Object Id"",ServAccRowId );
		InputPS.SetProperty(""ProcessName"",""STC New Terminated Account Balance CRM WF"" );
		WFBs = AppObj.GetService(""Workflow Process Manager"");
		WFBs.InvokeMethod(""RunProcess"",InputPS,OutputPS);
		
		//var RespMssgCnt = OutputPS.GetChildCount();
		var RespMssgCnt1 = OutputPS.GetPropertyCount();
		var RespmssgCnt2 = OutputPS.GetChild(3);
		var RespMssg = AppObj.NewPropertySet();
		RespMssg = RespmssgCnt2.Copy();
		var RespMssgCnt = RespMssg.GetChildCount();		
		var RespPayLoad = AppObj.NewPropertySet();
		RespPayLoad = RespMssg.GetChild(0).GetChild(0);
		TotalCharges = RespPayLoad.GetProperty(""SubsciberTotalTerminationOutstanding"");
		TerminationCharges = RespPayLoad.GetProperty(""SubsciberTotalContractCancelAmount"");
		TaxAmount = RespPayLoad.GetProperty(""VATAmount"");	
		//Added for the exception Handling below
		var sErrorCode = RespPayLoad.GetProperty(""ErrorCode"");	
		var sErrMsg = 	RespPayLoad.GetProperty(""ErrorDescription"");		
		//Added for the exception Handling above	
		OutstandingAmount = ToNumber(TotalCharges - TerminationCharges);
		//Abuzar:11Feb2020:To RoundOff Outstanding Amt:Defect 4440 - START
		if (OutstandingAmount != '' && OutstandingAmount != null)
		{
			bsCeilNumber = AppObj.GetService(""STC Ceil Number"");
			cnInputPS = AppObj.NewPropertySet();
			cnOutputPS = AppObj.NewPropertySet();
			with(cnInputPS)
			{
				SetProperty(""InputNum"", OutstandingAmount);
				SetProperty(""DecimalPlaces"", ""3"");
			}
			bsCeilNumber.InvokeMethod(""RoundUpNumber"", cnInputPS, cnOutputPS);
			OutstandingAmount = cnOutputPS.GetProperty(""OutputNum"");
			
		}
//Abuzar:11Feb2020:To RoundOff Outstanding Amt:Defect 4440 - END
		TotalCharges = ToNumber(TotalCharges) + ToNumber(TaxAmount);
		PsChildRec = AppObj.NewPropertySet();
		//Added for the exception Handling below
		
		if(sErrorCode != ""0""){
			if(sErrorCode == ""201"")
				PsChildRec.SetProperty(""ContractName"",""Remote exception occured,please retry."");
			else
				PsChildRec.SetProperty(""ContractName"",sErrMsg);
			Outputs.AddChild(PsChildRec);
			goto End;
		}//endif sErrorCode != ""0""
		//Added for the exception Handling above	
		//Mayank: Added for ERP Cloud ------- END---------
		if(PackPartCodeSubStr == ""DATPACK"" && ERPProduct == ""Y"")
		{
			TerminationChargesERP = TerminationCharges;
			TotalChargesERP = TotalCharges;
			OutstandingAmountERP = OutstandingAmount;
			TaxAmountERP = TaxAmount;
		}
		else
		{	
			PsChildRec.SetProperty(""TerminationCharges"",TerminationCharges);
			PsChildRec.SetProperty(""Total Charges"",TotalCharges);
			PsChildRec.SetProperty(""OutstandingAmount"",OutstandingAmount);
			PsChildRec.SetProperty(""VAT Amount"",TaxAmount);
			PsChildRec.SetProperty(""SubscriptionRowId"",ServAccRowId);
			Outputs.AddChild(PsChildRec);
		}//Mayank: Added for ERP Cloud ------- END---------
		
		var ListOfProductDetail = AppObj.NewPropertySet();
		ListOfProductDetail = RespPayLoad.GetChild(0).GetChild(0).GetChild(0);
		var PsParentRec = AppObj.NewPropertySet();
		var ProductDetailCnt = ListOfProductDetail.GetChildCount();
		var ProductDetail = AppObj.NewPropertySet();
		
		var vContractName="""", vTermCharges="""", vStartDate="""", vEndDate="""";
		
		for(var i=0;i<ProductDetailCnt;i++)
		{
			PsChildRec = AppObj.NewPropertySet();
			ProductDetail = ListOfProductDetail.GetChild(i);
			with (ProductDetail)
			{
				vContractName = GetProperty(""ContractName"");
				vTermCharges = GetProperty(""TerminationCharges"");
				vStartDate = GetProperty(""StartDate"");
				vEndDate = GetProperty(""EndDate"");
				ContractVAT = GetProperty(""TAX"");
			}
			with (PsChildRec)
			{
				SetProperty(""ContractName"",vContractName);
				SetProperty(""TerminationCharges"",vTermCharges);
				SetProperty(""SubscriptionRowId"" , ServAccRowId);
				SetProperty(""StartDate"" , vStartDate);
				SetProperty(""EndDate"" , vEndDate);
				SetProperty(""VAT Amount"" , ContractVAT);
			}
			Outputs.AddChild(PsChildRec);			
		}//endfor
		//Mayank: Added for ERP Cloud ------- START ---------
		if(PackPartCodeSubStr != ""DATPACK"" && ERPProduct == ""Y"")
		{
			End:		
		}//Mayank: Added for ERP Cloud ------- END---------		
		}// end of If(PackPartCodeSubStr == """")
		if(PackPartCodeSubStr == ""DATPACK"")
		{
			InputPS = AppObj.NewPropertySet();
			OutputPS = AppObj.NewPropertySet();
			InputPS.SetProperty(""Object Id"",ServAccRowId );
			InputPS.SetProperty(""ProcessName"",""STC Get Datacom Termination Charges WF"");
			WFBs = AppObj.GetService(""Workflow Process Manager"");
			WFBs.InvokeMethod(""RunProcess"",InputPS,OutputPS);
			var OtherCon = OutputPS.GetProperty(""OtherContractProductName"");
			//[MANUJ] : [Business  Vanity Contract]
			var DisplayVanityContractProduct = OutputPS.GetProperty(""DisplayVanityContractProduct"");
			//[MANUJ] : [Business  Vanity Contract]
			var PsChildRecMain = AppObj.NewPropertySet();
			//Mayank: Added for ERP Cloud ------- START---------
			if(PackPartCodeSubStr == ""DATPACK"" && ERPProduct == ""Y"")
			{
				TerminationCharges = OutputPS.GetProperty(""ContractTerminationCharges"");
				TotalCharges = OutputPS.GetProperty(""TotalTerminationCharges"");
				OutstandingAmount = OutputPS.GetProperty(""DatacomOutstandingAmount"");
				
				TerminationCharges = ToNumber(TerminationCharges) + ToNumber(TerminationChargesERP);
				TotalCharges = ToNumber(TotalCharges) + ToNumber(TotalChargesERP);
				TotalCharges = ToNumber(TotalCharges) - ToNumber(OutstandingAmount);

				//[NAVIN: 08Sep2021: Tajer Revamp Termination Charge Issue]
				//OutstandingAmount = ToNumber(OutstandingAmount) + ToNumber(OutstandingAmountERP);
				PsChildRecMain.SetProperty(""ContractName"", ""Final Rolled-Up Charges:"");

				PsChildRecMain.SetProperty(""TerminationCharges"",TerminationCharges);
				PsChildRecMain.SetProperty(""Total Charges"",TotalCharges);
				PsChildRecMain.SetProperty(""OutstandingAmount"",OutstandingAmount);
				PsChildRecMain.SetProperty(""VAT Amount"",TaxAmountERP);
				PsChildRecMain.SetProperty(""SubscriptionRowId"",ServAccRowId);
				Outputs.AddChild(PsChildRecMain);
				PsChildRecMain = null;
			}
			else
			{
				PsChildRecMain.SetProperty(""ContractName"", ""Final Rolled-Up Charges:"");//[NAVIN: 08Sep2021: Tajer Revamp Termination Charge Issue]
				PsChildRecMain.SetProperty(""TerminationCharges"",OutputPS.GetProperty(""ContractTerminationCharges""));
				PsChildRecMain.SetProperty(""Total Charges"",OutputPS.GetProperty(""TotalTerminationCharges""));
				PsChildRecMain.SetProperty(""OutstandingAmount"",OutputPS.GetProperty(""DatacomOutstandingAmount""));
				PsChildRecMain.SetProperty(""SubscriptionRowId"",ServAccRowId);
				Outputs.AddChild(PsChildRecMain);
				PsChildRecMain = null;
			}//Mayank: Added for ERP Cloud ------- END---------
			var PsChildRecSec = AppObj.NewPropertySet();
			
			//[NAVIN: 08Sep2021: Tajer Revamp Termination Charge Issue]:START
			var vMainContract = OutputPS.GetProperty(""DatacomConProdName"");
			var vMainCharge = ToNumber(OutputPS.GetProperty(""ContractTerminationCharges""));
			var vTajerContrFlag = vMainContract.substring(0,27);
			vTajerContrFlag = AppObj.InvokeMethod(""LookupValue"",""STC_TERM_CHARGE_SKIP_CONTRACT"",vTajerContrFlag);
			vTajerContrFlag = vTajerContrFlag.substring(0,4);

			if (vTajerContrFlag == ""SKIP"")
			{
			}
			else{
				PsChildRecSec.SetProperty(""ContractName"",vMainContract);
				PsChildRecSec.SetProperty(""TerminationCharges"",vMainCharge);
				PsChildRecSec.SetProperty(""SubscriptionRowId"" , ServAccRowId);
				PsChildRecSec.SetProperty(""StartDate"" , OutputPS.GetProperty(""DatacomStartDate""));
				PsChildRecSec.SetProperty(""EndDate"", OutputPS.GetProperty(""DatacomEndDate""));

				Outputs.AddChild(PsChildRecSec);
			}
			//[NAVIN: 08Sep2021: Tajer Revamp Termination Charge Issue]:END
			
			if(OtherCon != ""NOCONTRACT"")
			{
				var PsChildRecOther = AppObj.NewPropertySet();
				
				PsChildRecOther.SetProperty(""ContractName"",OutputPS.GetProperty(""OtherContractProductName""));
				PsChildRecOther.SetProperty(""TerminationCharges"",OutputPS.GetProperty(""OtherContractTerminationCharges""));
				PsChildRecOther.SetProperty(""SubscriptionRowId"" , ServAccRowId);
				PsChildRecOther.SetProperty(""StartDate"" , OutputPS.GetProperty(""OtherContractStartDate""));
				PsChildRecOther.SetProperty(""EndDate"", OutputPS.GetProperty(""OtherContractEndDate""));
				
				Outputs.AddChild(PsChildRecOther);
			}
			//[MANUJ] : [Business  Vanity Contract]
			if(DisplayVanityContractProduct == ""Y"")
			{
				var PsChildRecVanity = AppObj.NewPropertySet();
				
				PsChildRecVanity.SetProperty(""ContractName"",OutputPS.GetProperty(""VanityProductName""));
				PsChildRecVanity.SetProperty(""TerminationCharges"",OutputPS.GetProperty(""VanityTerminationCharges""));
				PsChildRecVanity.SetProperty(""SubscriptionRowId"" , ServAccRowId);
				PsChildRecVanity.SetProperty(""StartDate"" , OutputPS.GetProperty(""VanityStartDate""));
				PsChildRecVanity.SetProperty(""EndDate"", OutputPS.GetProperty(""VanityEndDate""));
				
				Outputs.AddChild(PsChildRecVanity);
			}
			//[MANUJ] : [Business  Vanity Contract]
		}//If(PackPartCodeSubStr == ""DATPACK"")

	}
	catch(e)
	{
		LogException(e);
		
		psRec.SetProperty(""TerminationCharges"" , ""Error Occurred"");
		psRec.SetProperty(""OutstandingAmount"" , e.errCode() + "":"" + e.errText());
		Outputs.AddChild(psRec);
	}
	finally
	{
		//[NAVIN: 05Feb2017: TermnChargesTabEnh]
		PsParentRec = null;
		PsChildRec = null;
		ProductDetail = null;
		ListOfProductDetail = null;
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
	var TotalCharges, TerminationCharges, OutstandingAmount, TaxAmount, ContractVAT;
	var InputPS, OutputPS, WFBs, PsChildRec;
	var ServAccRowId, EndDate;
	var PackPartCode;
	var ERPProduct = ""N"";//Mayank: Added for ERP Cloud
	var TerminationChargesERP,TotalChargesERP,OutstandingAmountERP,TaxAmountERP;//Mayank: Added for ERP Cloud
	AppObj = TheApplication();
	var psRec:PropertySet = AppObj.NewPropertySet();
	var bsCeilNumber, cnInputPS, cnOutputPS; //Abuzar:11Feb2020:To RoundOff Outstanding Amt:Defect 4440
	try
	{
		ServAccRowId = AppObj.GetProfileAttr(""AccountId"");
		var AssetBC = AppObj.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset"");
		var spec  = ""[Service Account Id] = '"" + ServAccRowId + ""' AND [Status] <> 'Inactive' AND [Type] = 'Package'"";
			with(AssetBC)
			{
				ActivateField(""Product Part Number"");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchExpr(spec);
				ExecuteQuery(ForwardOnly);
				var AssRec = FirstRecord();
				if(AssRec)
				{
					PackPartCode = GetFieldValue(""Product Part Number"");
				}
			}
		//Mayank: Added for ERP Cloud ------- START-------
		var sAssetBC = TheApplication().GetBusObject(""STC Asset Mgmt - Asset Thin BO"").GetBusComp(""STC Asset Mgmt - Asset Thin"");
	//	var ERPspec  = ""[Service Account Id] = '"" + ServAccRowId + ""' AND [Status] <> 'Inactive' AND ([Product Part Number] LIKE 'ADDERPDMA*' OR [Product Part Number] LIKE 'ERP*ADV*' OR [Product Part Number] LIKE 'ERP*PRO*' OR [Product Part Number] LIKE 'ERP*BASIC*')"";
		var ERPspec  = ""[Service Account Id] = '"" + ServAccRowId + ""' AND [Status] <> 'Inactive' AND ([STC Vendor Part Number] = 'ERPDEVICE')"";
		with(sAssetBC)
		{
			ActivateField(""Product Part Number"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchExpr(ERPspec);
			ExecuteQuery(ForwardOnly);
			var ERPAssRec = FirstRecord();
			if(ERPAssRec)
			{
				ERPProduct = ""Y"";
			}
			}//Mayank: Added for ERP Cloud ------- END---------
		var PackPartCodeLOV = AppObj.InvokeMethod(""LookupValue"",""STC_DATACOM_BAL_PACK"",PackPartCode);
		var PackPartCodeSubStr = PackPartCodeLOV.substring(0,7);
		//if(PackPartCodeSubStr != ""DATPACK"")//Mayank: Added for ERP Cloud
		if(PackPartCodeSubStr != ""DATPACK"" || ERPProduct == ""Y"")//Mayank: Added for ERP Cloud
		{
		InputPS = AppObj.NewPropertySet();
		OutputPS = AppObj.NewPropertySet();
		InputPS.SetProperty(""Object Id"",ServAccRowId );
		InputPS.SetProperty(""ProcessName"",""STC New Terminated Account Balance CRM WF"" );
		WFBs = AppObj.GetService(""Workflow Process Manager"");
		WFBs.InvokeMethod(""RunProcess"",InputPS,OutputPS);
		
		//var RespMssgCnt = OutputPS.GetChildCount();
		var RespMssgCnt1 = OutputPS.GetPropertyCount();
		var RespmssgCnt2 = OutputPS.GetChild(3);
		var RespMssg = AppObj.NewPropertySet();
		RespMssg = RespmssgCnt2.Copy();
		var RespMssgCnt = RespMssg.GetChildCount();		
		var RespPayLoad = AppObj.NewPropertySet();
		RespPayLoad = RespMssg.GetChild(0).GetChild(0);
		TotalCharges = RespPayLoad.GetProperty(""SubsciberTotalTerminationOutstanding"");
		TerminationCharges = RespPayLoad.GetProperty(""SubsciberTotalContractCancelAmount"");
		TaxAmount = RespPayLoad.GetProperty(""VATAmount"");	
		//Added for the exception Handling below
		var sErrorCode = RespPayLoad.GetProperty(""ErrorCode"");	
		var sErrMsg = 	RespPayLoad.GetProperty(""ErrorDescription"");		
		//Added for the exception Handling above	
		OutstandingAmount = ToNumber(TotalCharges - TerminationCharges);
		//Abuzar:11Feb2020:To RoundOff Outstanding Amt:Defect 4440 - START
		if (OutstandingAmount != '' && OutstandingAmount != null)
		{
			bsCeilNumber = AppObj.GetService(""STC Ceil Number"");
			cnInputPS = AppObj.NewPropertySet();
			cnOutputPS = AppObj.NewPropertySet();
			with(cnInputPS)
			{
				SetProperty(""InputNum"", OutstandingAmount);
				SetProperty(""DecimalPlaces"", ""3"");
			}
			bsCeilNumber.InvokeMethod(""RoundUpNumber"", cnInputPS, cnOutputPS);
			OutstandingAmount = cnOutputPS.GetProperty(""OutputNum"");
			
		}
//Abuzar:11Feb2020:To RoundOff Outstanding Amt:Defect 4440 - END
		TotalCharges = ToNumber(TotalCharges) + ToNumber(TaxAmount);
		PsChildRec = AppObj.NewPropertySet();
		//Added for the exception Handling below
		
		if(sErrorCode != ""0""){
			if(sErrorCode == ""201"")
				PsChildRec.SetProperty(""ContractName"",""Remote exception occured,please retry."");
			else
				PsChildRec.SetProperty(""ContractName"",sErrMsg);
			Outputs.AddChild(PsChildRec);
			goto End;
		}//endif sErrorCode != ""0""
		//Added for the exception Handling above	
		//Mayank: Added for ERP Cloud ------- END---------
		if(PackPartCodeSubStr == ""DATPACK"" && ERPProduct == ""Y"")
		{
			TerminationChargesERP = TerminationCharges;
			TotalChargesERP = TotalCharges;
			OutstandingAmountERP = OutstandingAmount;
			TaxAmountERP = TaxAmount;
		}
		else
		{	
			PsChildRec.SetProperty(""TerminationCharges"",TerminationCharges);
			PsChildRec.SetProperty(""Total Charges"",TotalCharges);
			PsChildRec.SetProperty(""OutstandingAmount"",OutstandingAmount);
			PsChildRec.SetProperty(""VAT Amount"",TaxAmount);
			PsChildRec.SetProperty(""SubscriptionRowId"",ServAccRowId);
			Outputs.AddChild(PsChildRec);
		}//Mayank: Added for ERP Cloud ------- END---------
		
		var ListOfProductDetail = AppObj.NewPropertySet();
		ListOfProductDetail = RespPayLoad.GetChild(0).GetChild(0).GetChild(0);
		var PsParentRec = AppObj.NewPropertySet();
		var ProductDetailCnt = ListOfProductDetail.GetChildCount();
		var ProductDetail = AppObj.NewPropertySet();
		
		var vContractName="""", vTermCharges="""", vStartDate="""", vEndDate="""";
		
		for(var i=0;i<ProductDetailCnt;i++)
		{
			PsChildRec = AppObj.NewPropertySet();
			ProductDetail = ListOfProductDetail.GetChild(i);
			with (ProductDetail)
			{
				vContractName = GetProperty(""ContractName"");
				vTermCharges = GetProperty(""TerminationCharges"");
				vStartDate = GetProperty(""StartDate"");
				vEndDate = GetProperty(""EndDate"");
				ContractVAT = GetProperty(""TAX"");
			}
			with (PsChildRec)
			{
				SetProperty(""ContractName"",vContractName);
				SetProperty(""TerminationCharges"",vTermCharges);
				SetProperty(""SubscriptionRowId"" , ServAccRowId);
				SetProperty(""StartDate"" , vStartDate);
				SetProperty(""EndDate"" , vEndDate);
				SetProperty(""VAT Amount"" , ContractVAT);
			}
			Outputs.AddChild(PsChildRec);			
		}//endfor
		//Mayank: Added for ERP Cloud ------- START ---------
		if(PackPartCodeSubStr != ""DATPACK"" && ERPProduct == ""Y"")
		{
			End:		
		}//Mayank: Added for ERP Cloud ------- END---------		
		}// end of If(PackPartCodeSubStr == """")
		if(PackPartCodeSubStr == ""DATPACK"")
		{
			InputPS = AppObj.NewPropertySet();
			OutputPS = AppObj.NewPropertySet();
			InputPS.SetProperty(""Object Id"",ServAccRowId );
			InputPS.SetProperty(""ProcessName"",""STC Get Datacom Termination Charges WF"");
			WFBs = AppObj.GetService(""Workflow Process Manager"");
			WFBs.InvokeMethod(""RunProcess"",InputPS,OutputPS);
			var OtherCon = OutputPS.GetProperty(""OtherContractProductName"");
			//[MANUJ] : [Business  Vanity Contract]
			var DisplayVanityContractProduct = OutputPS.GetProperty(""DisplayVanityContractProduct"");
			//[MANUJ] : [Business  Vanity Contract]
			var PsChildRecMain = AppObj.NewPropertySet();
			//Mayank: Added for ERP Cloud ------- START---------
			if(PackPartCodeSubStr == ""DATPACK"" && ERPProduct == ""Y"")
			{
				TerminationCharges = OutputPS.GetProperty(""ContractTerminationCharges"");
				TotalCharges = OutputPS.GetProperty(""TotalTerminationCharges"");
				OutstandingAmount = OutputPS.GetProperty(""DatacomOutstandingAmount"");
				
				TerminationCharges = ToNumber(TerminationCharges) + ToNumber(TerminationChargesERP);
				TotalCharges = ToNumber(TotalCharges) + ToNumber(TotalChargesERP);
				TotalCharges = ToNumber(TotalCharges) - ToNumber(OutstandingAmount);

				//[NAVIN: 08Sep2021: Tajer Revamp Termination Charge Issue]
				//OutstandingAmount = ToNumber(OutstandingAmount) + ToNumber(OutstandingAmountERP);
				PsChildRecMain.SetProperty(""ContractName"", ""Final Rolled-Up Charges:"");

				PsChildRecMain.SetProperty(""TerminationCharges"",TerminationCharges);
				PsChildRecMain.SetProperty(""Total Charges"",TotalCharges);
				PsChildRecMain.SetProperty(""OutstandingAmount"",OutstandingAmount);
				PsChildRecMain.SetProperty(""VAT Amount"",TaxAmountERP);
				PsChildRecMain.SetProperty(""SubscriptionRowId"",ServAccRowId);
				Outputs.AddChild(PsChildRecMain);
				PsChildRecMain = null;
			}
			else
			{
				PsChildRecMain.SetProperty(""ContractName"", ""Final Rolled-Up Charges:"");//[NAVIN: 08Sep2021: Tajer Revamp Termination Charge Issue]
				PsChildRecMain.SetProperty(""TerminationCharges"",OutputPS.GetProperty(""ContractTerminationCharges""));
				PsChildRecMain.SetProperty(""Total Charges"",OutputPS.GetProperty(""TotalTerminationCharges""));
				PsChildRecMain.SetProperty(""OutstandingAmount"",OutputPS.GetProperty(""DatacomOutstandingAmount""));
				PsChildRecMain.SetProperty(""SubscriptionRowId"",ServAccRowId);
				Outputs.AddChild(PsChildRecMain);
				PsChildRecMain = null;
			}//Mayank: Added for ERP Cloud ------- END---------
			var PsChildRecSec = AppObj.NewPropertySet();
			
			//[NAVIN: 08Sep2021: Tajer Revamp Termination Charge Issue]:START
			var vMainContract = OutputPS.GetProperty(""DatacomConProdName"");
			var vMainCharge = ToNumber(OutputPS.GetProperty(""ContractTerminationCharges""));
			var vTajerContrFlag = vMainContract.substring(0,27);
			vTajerContrFlag = AppObj.InvokeMethod(""LookupValue"",""STC_TERM_CHARGE_SKIP_CONTRACT"",vTajerContrFlag);
			vTajerContrFlag = vTajerContrFlag.substring(0,4);

			if (vTajerContrFlag == ""SKIP"")
			{
			}
			else{
				PsChildRecSec.SetProperty(""ContractName"",vMainContract);
				PsChildRecSec.SetProperty(""TerminationCharges"",vMainCharge);
				PsChildRecSec.SetProperty(""SubscriptionRowId"" , ServAccRowId);
				PsChildRecSec.SetProperty(""StartDate"" , OutputPS.GetProperty(""DatacomStartDate""));
				PsChildRecSec.SetProperty(""EndDate"", OutputPS.GetProperty(""DatacomEndDate""));

				Outputs.AddChild(PsChildRecSec);
			}
			//[NAVIN: 08Sep2021: Tajer Revamp Termination Charge Issue]:END
			
			if(OtherCon != ""NOCONTRACT"")
			{
				var PsChildRecOther = AppObj.NewPropertySet();
				
				PsChildRecOther.SetProperty(""ContractName"",OutputPS.GetProperty(""OtherContractProductName""));
				PsChildRecOther.SetProperty(""TerminationCharges"",OutputPS.GetProperty(""OtherContractTerminationCharges""));
				PsChildRecOther.SetProperty(""SubscriptionRowId"" , ServAccRowId);
				PsChildRecOther.SetProperty(""StartDate"" , OutputPS.GetProperty(""OtherContractStartDate""));
				PsChildRecOther.SetProperty(""EndDate"", OutputPS.GetProperty(""OtherContractEndDate""));
				
				Outputs.AddChild(PsChildRecOther);
			}
			//[MANUJ] : [Business  Vanity Contract]
			if(DisplayVanityContractProduct == ""Y"")
			{
				var PsChildRecVanity = AppObj.NewPropertySet();
				
				PsChildRecVanity.SetProperty(""ContractName"",OutputPS.GetProperty(""VanityProductName""));
				PsChildRecVanity.SetProperty(""TerminationCharges"",OutputPS.GetProperty(""VanityTerminationCharges""));
				PsChildRecVanity.SetProperty(""SubscriptionRowId"" , ServAccRowId);
				PsChildRecVanity.SetProperty(""StartDate"" , OutputPS.GetProperty(""VanityStartDate""));
				PsChildRecVanity.SetProperty(""EndDate"", OutputPS.GetProperty(""VanityEndDate""));
				
				Outputs.AddChild(PsChildRecVanity);
			}
			//[MANUJ] : [Business  Vanity Contract]
		}//If(PackPartCodeSubStr == ""DATPACK"")

	}
	catch(e)
	{
		LogException(e);
		
		psRec.SetProperty(""TerminationCharges"" , ""Error Occurred"");
		psRec.SetProperty(""OutstandingAmount"" , e.errCode() + "":"" + e.errText());
		Outputs.AddChild(psRec);
	}
	finally
	{
		//[NAVIN: 05Feb2017: TermnChargesTabEnh]
		PsParentRec = null;
		PsChildRec = null;
		ProductDetail = null;
		ListOfProductDetail = null;
		RespPayLoad = null; RespMssg = null;
		RespmssgCnt2 = null;
		psRec = null;
		InputPS = null; OutputPS = null; WFBs = null;
		AppObj = null;
	}

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	
	var ireturn;
	var psInputs;
	var psOutputs;

	try
	{
		//ireturn = ContinueOperation;
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
			default:
					ireturn = ContinueOperation;
					break;
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
	return(CancelOperation);
}
function Init(Inputs, Outputs)
{
	try
	{
		Outputs.SetProperty(""Id Number"","""");
		Outputs.SetProperty(""Id Type"","""");
		Outputs.SetProperty(""MSISDN Starting Number"","""");
		Outputs.SetProperty(""STC Bulk Transaction Type"","""");
		Outputs.SetProperty(""Plan"","""");
		Outputs.SetProperty(""Plan Part Code"","""");
		Outputs.SetProperty(""Category"");
		Outputs.SetProperty(""MSISDN"");
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
function Init(Inputs, Outputs)
{
	try
	{
		Outputs.SetProperty(""Id Number"","""");
		Outputs.SetProperty(""Id Type"","""");
		Outputs.SetProperty(""MSISDN Starting Number"","""");
		Outputs.SetProperty(""STC Bulk Transaction Type"","""");
		Outputs.SetProperty(""Plan"","""");
		Outputs.SetProperty(""Plan Part Code"","""");
		Outputs.SetProperty(""Category"", """");
		Outputs.SetProperty(""MSISDN"", """");
		//Outputs.SetProperty(""Pool"", """");
		Outputs.SetProperty(""Pool Category"", """");
		
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
		  Input.SetProperty(""Object Name"", ""STC Number Reservation VBC Service"");
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
Date    : 02-07-2017
Version : 1.0
Desc    : Created this code for functionality behind the button ""Submit""
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
"//Your public declarations go here...  
"
function CreateOneExtensionRecords(vAction,vFullName,vExtensioNumber,vPilotDIDNumber,vEmail,vDeviceModel,vCallingBarring,vUserBusfeatset,vUserfeatureAdvance,vCCAgentAddOn,vCCRecordingAddOn,vCCReportAdminAddOn,vCCReportAgentAddOn,vFeatureBundle,i)
{
var svcUI = null, psIn1 = null, psOut1 = null;
var SearchSpec = """", sSearchSpecOpt = """";
try{
	var RecCount = 0;
	var Range="""";
	var FeatureBundle="""";
	var errorCd,errormsg;
	var sEXTENSIONCOUNT =0,sExtsCount=0;
	var EndingExtension,StartingExtension;
	var MainPiliotNumber="""";
	var sMsg="""",pilotNum,sExtsDIDCount;
	var stcAvayaBO = TheApplication().GetBusObject(""STC AVAYA Opty BO"");
	var stcAvayaOptyBO = TheApplication().GetBusObject(""STCVIVAOneAVAYAOptyBO"");
	var stcAccount = TheApplication().GetBusObject(""Account"");	
	var PilotMSISDN = stcAvayaBO.GetBusComp(""STC Pilot MSISDN Avaya BC"");
	var DIDAvayaBC = stcAvayaOptyBO.GetBusComp(""STC DID MSISDN Avaya BC"");
	var ExtensionAvaya = stcAvayaBO.GetBusComp(""STC Extension Avaya BC"");
	var ExtensionAvayaQuery = stcAvayaBO.GetBusComp(""STC Extension Avaya Query BC"");
	var NewPBXExtReseBC = stcAccount.GetBusComp(""STC New PBX Extension Reservation BC"");
	var vExtParentId = TheApplication().GetProfileAttr(""ExtParentId"");
    var sExtReserveBC = TheApplication().GetBusObject(""Account"").GetBusComp(""STC New PBX Extension Reservation BC"");
	with(PilotMSISDN)
	{
		ClearToQuery();
		ActivateField(""Bulk Id"");
		ActivateField(""Opportunity Id"");
		ActivateField(""Main Piliot Number"");	
		SetSearchSpec(""Id"",vExtParentId);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
		var BulkId = GetFieldValue(""Bulk Id"");
		var OptyId = GetFieldValue(""Opportunity Id"");
		var sPilotMSISDN = GetFieldValue(""Main Piliot Number"");				
			with(sExtReserveBC)
				{
				ClearToQuery();
				ActivateField(""Range"");
				ActivateField(""PilotNum"");
				ActivateField(""Ending Extension"");
				ActivateField(""Starting Extension"");
				SearchSpec = ""[PilotNum] = '"" + sPilotMSISDN + ""' AND [Extension Flag] = 'Y'"";
				SetSearchExpr(SearchSpec);
				ExecuteQuery(ForwardBackward);						
				if(FirstRecord())
				{						//var Id = GetFieldValue(""Id"");
				Range = GetFieldValue(""Range"");
				Range = ToNumber(Range);
				}
				} // sExtReserveBC		
				with(ExtensionAvayaQuery)
				{
				ClearToQuery();
				ActivateField(""Parent Pilot Id"");
				ActivateField(""Ext Status"");
				SearchSpec = ""[Parent Pilot Id] = '"" +vExtParentId+ ""' AND [Extension Number] IS NOT NULL AND [Ext Status] ='Imported' "";
			   	SetSearchExpr(SearchSpec);
				ExecuteQuery(ForwardBackward);			
				sExtsCount = CountRecords();
				sExtsCount = ToNumber(sExtsCount);
				sEXTENSIONCOUNT = sExtsCount + i;
				sEXTENSIONCOUNT = ToNumber(sEXTENSIONCOUNT);
				} // ExtensionAvayaQuery
			
				if(Range<i || Range<sExtsCount)
				{
				
				sMsg = ""You are not allowed to add more number of extension as you have reached the Max Extension Reserved for the Pilot Number. Total Reserved Extensions = ""+Range+"".!"";
				TheApplication().RaiseErrorText(sMsg);
				}
				with(NewPBXExtReseBC)
				{
					ClearToQuery();
					ActivateField(""Ending Extension"");
					ActivateField(""Starting Extension"");
					//SearchSpec = ""[PilotNum] = '"" +sPilotMSISDN+ ""'"";
					SearchSpec = ""[PilotNum] = '"" +sPilotMSISDN+ ""' AND [Starting Extension] IS NOT NULL"";
				   	SetSearchExpr(SearchSpec);
					ExecuteQuery(ForwardBackward);			
					if(FirstRecord())
					{						//var Id = GetFieldValue(""Id"");
					EndingExtension = GetFieldValue(""Ending Extension"");
					EndingExtension = ToNumber(EndingExtension);
					StartingExtension = GetFieldValue(""Starting Extension"");
					StartingExtension = ToNumber(StartingExtension);
					}
				} // NewPBXExtReseBC
				

			with(ExtensionAvayaQuery)
			{
				if (i > 0)
				{
					while(RecCount < i)
					{
					var	RecCountDID = vPilotDIDNumber[RecCount];
					 FeatureBundle= vFeatureBundle[RecCount];
					 if(RecCountDID =="","")
					 {
						RecCountDID="""";
					
					 }
					 if(FeatureBundle =="","")
					 {
						FeatureBundle ="""";
					 }

				 	MainPiliotNumber="""";

				with(ExtensionAvayaQuery)
						{
						ClearToQuery();
						ActivateField(""Parent Pilot Id"");
						ActivateField(""Ext Status"");
						SearchSpec = ""[Parent Pilot Id] = '"" +vExtParentId+ ""' AND [Extension Number] IS NOT NULL AND [Ext Status] ='Imported' "";
					   	SetSearchExpr(SearchSpec);
						ExecuteQuery(ForwardBackward);			
						sExtsCount = CountRecords();
						sExtsCount = ToNumber(sExtsCount);
						sEXTENSIONCOUNT = sExtsCount + i;
						sEXTENSIONCOUNT = ToNumber(sEXTENSIONCOUNT);
						} // ExtensionAvayaQuery
					
					with(DIDAvayaBC)
					{
						ClearToQuery();
						ActivateField(""STC Subscriber Status"");
						ActivateField(""Type"");
						ActivateField(""Pilot Parent Id"");
						ActivateField(""Main Piliot Number"");
						//ActivateField(""Starting Extension"");
						SearchSpec = ""[Pilot Parent Id] = '"" + vExtParentId + ""' AND [Type] = 'DID' AND [Main Piliot Number] IS NOT NULL AND [Main Piliot Number] = '"" + vPilotDIDNumber[RecCount] + ""'"";
						SetSearchExpr(SearchSpec);
						ExecuteQuery(ForwardBackward);	
						sExtsDIDCount = CountRecords();
						sExtsDIDCount = ToNumber(sExtsCount);
													
						if(FirstRecord())
						{						//var Id = GetFieldValue(""Id"");
						MainPiliotNumber = GetFieldValue(""Main Piliot Number"");												
						}														
						}
						if(MainPiliotNumber != RecCountDID)
						{
						sMsg = ""One or more of the DIDs are not Active/ reserved.Hence file is not uploaded.!"";
						TheApplication().RaiseErrorText(sMsg);	
						}
						ClearToQuery();
						ActivateField(""Id"");
						ActivateField(""Action"");
						ActivateField(""Call Barring"");
						ActivateField(""Device Model"");
						ActivateField(""Email"");
						ActivateField(""Extension Number"");
						ActivateField(""Ext Status"");
						ActivateField(""Full Name"");
						ActivateField(""Pilot DID Number"");
						ActivateField(""User Business Feature Set"");	
						ActivateField(""STC User Feature Advance"");	
						ActivateField(""CC Agent AddOn"");	
						ActivateField(""CC Recording AddOn"");	
						ActivateField(""CC Report Admin AddOn"");	
						ActivateField(""CC Report Agent AddOn"");	
						ActivateField(""Feature Bundle"");	
						ActivateField(""Bulk Id"");
                 		ActivateField(""Opportunity Id"");
						ActivateField(""Parent Pilot Id"");				
				    	SearchSpec = ""[Parent Pilot Id] = '"" +vExtParentId+ ""' AND [Extension Number] ='"" +vExtensioNumber[RecCount]+ ""'"";
				    	SetSearchExpr(SearchSpec);
					    ExecuteQuery(ForwardBackward);						
						if(FirstRecord())
						{
						    pilotNum = GetFieldValue(""Pilot DID Number"");
							SetFieldValue(""Bulk Id"",BulkId);
							SetFieldValue(""Ext Status"",""Updated"");
							SetFieldValue(""Opportunity Id"",OptyId);
							SetFieldValue(""Parent Pilot Id"",vExtParentId);
							SetFieldValue(""Action"", vAction[RecCount]);		
							SetFieldValue(""Call Barring"",vCallingBarring[RecCount]);							
							SetFieldValue(""Device Model"",vDeviceModel[RecCount]);
							SetFieldValue(""Email"", vEmail[RecCount]);			
							SetFieldValue(""Extension Number"", vExtensioNumber[RecCount]);
							SetFieldValue(""Full Name"", vFullName[RecCount]);					
							SetFieldValue(""Pilot DID Number"", vPilotDIDNumber[RecCount]);
							SetFieldValue(""User Business Feature Set"",vUserBusfeatset[RecCount]);
							SetFieldValue(""STC User Feature Advance"",vUserfeatureAdvance[RecCount]);
							SetFieldValue(""CC Agent AddOn"",vCCAgentAddOn[RecCount]);
							SetFieldValue(""CC Recording AddOn"",vCCRecordingAddOn[RecCount]);
							SetFieldValue(""CC Report Admin AddOn"",vCCReportAdminAddOn[RecCount]);
							SetFieldValue(""CC Report Agent AddOn"",vCCReportAgentAddOn[RecCount]);
							SetFieldValue(""Feature Bundle"",vFeatureBundle[RecCount]);															
							WriteRecord();
						
						}
				
					else if(Range<=sExtsCount)
						{						
						sMsg = ""You are not allowed to add more number of extension as you have reached the Max Extension Reserved for the Pilot Number. Total Reserved Extensions = ""+Range+"".!"";
						TheApplication().RaiseErrorText(sMsg);
						}
					else if((StartingExtension > ToNumber(vExtensioNumber[RecCount])) || (EndingExtension < ToNumber(vExtensioNumber[RecCount])))
						{
						sMsg = ""Extension numbers should be added in the sequence and number range should be in between Starting Extension ""+StartingExtension+"" and Ending Extension ""+EndingExtension+"".!"";
						TheApplication().RaiseErrorText(sMsg);
						}
					else if(vUserBusfeatset[RecCount] ==""No"" && ((vFeatureBundle[RecCount] !="""" &&  vFeatureBundle[RecCount] != null) || (vCCAgentAddOn[RecCount]==""Y"") || (vCCRecordingAddOn[RecCount]==""Y"") || (vCCReportAgentAddOn[RecCount]==""Y"") || (vCCReportAdminAddOn[RecCount]==""Y"")))
						{
						sMsg = ""CC add-ons are applicable only when User Business Features Set value will be 'Yes'"";
						TheApplication().RaiseErrorText(sMsg);
						} 
					else if((vFeatureBundle[RecCount] !="""" && vFeatureBundle[RecCount] != null) && ((vCCAgentAddOn[RecCount]==""Y"") || (vCCRecordingAddOn[RecCount]==""Y"") || (vCCReportAgentAddOn[RecCount]==""Y"")))
						{
						sMsg = ""You can select Only 'CC Report Admin AddOn' value is 'Y' with a Feature Bundle.!"";
						TheApplication().RaiseErrorText(sMsg);
						} 
											
						else
						{
					
							NewRecord(NewAfter);
							//RecCount--;
							SetFieldValue(""Ext Status"",""Imported"");
							SetFieldValue(""Bulk Id"",BulkId);
							SetFieldValue(""Opportunity Id"",OptyId);
							SetFieldValue(""Parent Pilot Id"",vExtParentId);
							SetFieldValue(""Ext Status"",""Imported"");
							SetFieldValue(""Action"", vAction[RecCount]);		
							SetFieldValue(""Call Barring"", vCallingBarring[RecCount]);
							SetFieldValue(""Device Model"",vDeviceModel[RecCount]);
							SetFieldValue(""Email"", vEmail[RecCount]);						
							SetFieldValue(""Extension Number"", vExtensioNumber[RecCount]);					
							SetFieldValue(""Full Name"", vFullName[RecCount]);
							SetFieldValue(""Pilot DID Number"", vPilotDIDNumber[RecCount]);
							SetFieldValue(""User Business Feature Set"", vUserBusfeatset[RecCount]);
							SetFieldValue(""STC User Feature Advance"",vUserfeatureAdvance[RecCount]);
							SetFieldValue(""CC Agent AddOn"",vCCAgentAddOn[RecCount]);
							SetFieldValue(""CC Recording AddOn"",vCCRecordingAddOn[RecCount]);
							SetFieldValue(""CC Report Admin AddOn"",vCCReportAdminAddOn[RecCount]);
							SetFieldValue(""CC Report Agent AddOn"",vCCReportAgentAddOn[RecCount]);
							SetFieldValue(""Feature Bundle"",vFeatureBundle[RecCount]);						
							WriteRecord();
						}
						RecCount++;
					}//end of while(RecCount > 0)

					svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
					psIn1 = TheApplication().NewPropertySet();
					psOut1 = TheApplication().NewPropertySet();
					psIn1.SetProperty(""Refresh All"", ""Y"");
					svcUI.InvokeMethod(""RefreshCurrentApplet"", psIn1, psOut1);
				}//end of if (i > 0)
			}//end of with(BulkLineBC)
		}//end of if (FirstRecord())
	}//end of with(BulkHeaderBC)

	TheApplication().SetProfileAttr(""ExtParentId"", """");
		return(CancelOperation);
}
catch(e)
{
if(sMsg !=  null && sMsg !="""")
{
  TheApplication().RaiseErrorText(sMsg);
  }
  //  throw e;
}
finally
{
	svcUI = null, psIn1 = null, psOut1 = null;
    ExtensionAvaya = null;
	DIDAvayaBC = null;	
	ExtensionAvayaQuery=null, PilotMSISDN=null, stcAvayaBO=null;
	stcAvayaOptyBO = null;
}
//return CancelOperation;
}
function CreateOneExtensionRecords(vAction,vFullName,vExtensioNumber,vPilotDIDNumber,vEmail,vDeviceModel,vCallingBarring,vUserBusfeatset,vUserfeatureAdvance,vCCAgentAddOn,vCCRecordingAddOn,vCCReportAdminAddOn,vCCReportAgentAddOn,vFeatureBundle,vUserFeatureMRCdisc,vMSTeamAddon,vMSTeamAddonPrice,i)
{
var svcUI = null, psIn1 = null, psOut1 = null;
var SearchSpec = """", sSearchSpecOpt = """";
try
{
	var RecCount = 0;
	var Range="""";
	var FeatureBundle="""";
	var errorCd,errormsg;
	var sEXTENSIONCOUNT =0,sExtsCount=0;
	var EndingExtension,StartingExtension;
	var MainPiliotNumber="""";
	var sMsg="""",pilotNum,sExtsDIDCount;
	var stcAvayaBO = TheApplication().GetBusObject(""STC AVAYA Opty BO"");
	var stcAvayaOptyBO = TheApplication().GetBusObject(""STCVIVAOneAVAYAOptyBO"");
	var stcAccount = TheApplication().GetBusObject(""Account"");	
	var PilotMSISDN = stcAvayaBO.GetBusComp(""STC Pilot MSISDN Avaya BC"");
	var DIDAvayaBC = stcAvayaOptyBO.GetBusComp(""STC DID MSISDN Avaya BC"");
	var ExtensionAvaya = stcAvayaBO.GetBusComp(""STC Extension Avaya BC"");
	var ExtensionAvayaQuery = stcAvayaBO.GetBusComp(""STC Extension Avaya Query BC"");
	var NewPBXExtReseBC = stcAccount.GetBusComp(""STC New PBX Extension Reservation BC"");
	var vExtParentId = TheApplication().GetProfileAttr(""ExtParentId"");
	var sExtReserveBC = TheApplication().GetBusObject(""Account"").GetBusComp(""STC New PBX Extension Reservation BC"");
	with(PilotMSISDN)
	{
		ClearToQuery();
		ActivateField(""Bulk Id"");
		ActivateField(""Opportunity Id"");
		ActivateField(""Main Piliot Number"");	
		SetSearchSpec(""Id"",vExtParentId);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			var BulkId = GetFieldValue(""Bulk Id"");
			var OptyId = GetFieldValue(""Opportunity Id"");
			var sPilotMSISDN = GetFieldValue(""Main Piliot Number"");				
			with(sExtReserveBC)
			{
				ClearToQuery();
				ActivateField(""Range"");
				ActivateField(""PilotNum"");
				ActivateField(""Ending Extension"");
				ActivateField(""Starting Extension"");
				SearchSpec = ""[PilotNum] = '"" + sPilotMSISDN + ""' AND [Extension Flag] = 'Y'"";
				SetSearchExpr(SearchSpec);
				ExecuteQuery(ForwardBackward);						
				if(FirstRecord())
				{						//var Id = GetFieldValue(""Id"");
					Range = GetFieldValue(""Range"");
					Range = ToNumber(Range);
				}
			} // sExtReserveBC		
			with(ExtensionAvayaQuery)
			{
				ClearToQuery();
				ActivateField(""Parent Pilot Id"");
				ActivateField(""Ext Status"");
				SearchSpec = ""[Parent Pilot Id] = '"" +vExtParentId+ ""' AND [Extension Number] IS NOT NULL AND [Ext Status] ='Imported' "";
				SetSearchExpr(SearchSpec);
				ExecuteQuery(ForwardBackward);			
				sExtsCount = CountRecords();
				sExtsCount = ToNumber(sExtsCount);
				sEXTENSIONCOUNT = sExtsCount + i;
				sEXTENSIONCOUNT = ToNumber(sEXTENSIONCOUNT);
			} // ExtensionAvayaQuery

			if(Range<i || Range<sExtsCount)
			{
				sMsg = ""You are not allowed to add more number of extension as you have reached the Max Extension Reserved for the Pilot Number. Total Reserved Extensions = ""+Range+"".!"";
				TheApplication().RaiseErrorText(sMsg);
			}
			with(NewPBXExtReseBC)
			{
				ClearToQuery();
				ActivateField(""Ending Extension"");
				ActivateField(""Starting Extension"");
				//SearchSpec = ""[PilotNum] = '"" +sPilotMSISDN+ ""'"";
				SearchSpec = ""[PilotNum] = '"" +sPilotMSISDN+ ""' AND [Starting Extension] IS NOT NULL"";
				SetSearchExpr(SearchSpec);
				ExecuteQuery(ForwardBackward);			
				if(FirstRecord())
				{		//var Id = GetFieldValue(""Id"");
					EndingExtension = GetFieldValue(""Ending Extension"");
					EndingExtension = ToNumber(EndingExtension);
					StartingExtension = GetFieldValue(""Starting Extension"");
					StartingExtension = ToNumber(StartingExtension);
				}
			} // NewPBXExtReseBC

			with(ExtensionAvayaQuery)
			{
				if (i > 0)
				{
					while(RecCount < i)
					{
						var	RecCountDID = vPilotDIDNumber[RecCount];
						FeatureBundle= vFeatureBundle[RecCount];
						if(RecCountDID =="","")
						{
							RecCountDID="""";
						}
						if(FeatureBundle =="","")
						{
							FeatureBundle ="""";
						}

						MainPiliotNumber="""";

						with(ExtensionAvayaQuery)
						{
							ClearToQuery();
							ActivateField(""Parent Pilot Id"");
							ActivateField(""Ext Status"");
							SearchSpec = ""[Parent Pilot Id] = '"" +vExtParentId+ ""' AND [Extension Number] IS NOT NULL AND [Ext Status] ='Imported' "";
							SetSearchExpr(SearchSpec);
							ExecuteQuery(ForwardBackward);			
							sExtsCount = CountRecords();
							sExtsCount = ToNumber(sExtsCount);
							sEXTENSIONCOUNT = sExtsCount + i;
							sEXTENSIONCOUNT = ToNumber(sEXTENSIONCOUNT);
						} // ExtensionAvayaQuery

						with(DIDAvayaBC)
						{
							ClearToQuery();
							ActivateField(""STC Subscriber Status"");
							ActivateField(""Type"");
							ActivateField(""Pilot Parent Id"");
							ActivateField(""Main Piliot Number"");
							//ActivateField(""Starting Extension"");
							SearchSpec = ""[Pilot Parent Id] = '"" + vExtParentId + ""' AND [Type] = 'DID' AND [Main Piliot Number] IS NOT NULL AND [Main Piliot Number] = '"" + vPilotDIDNumber[RecCount] + ""'"";
							SetSearchExpr(SearchSpec);
							ExecuteQuery(ForwardBackward);	
							sExtsDIDCount = CountRecords();
							sExtsDIDCount = ToNumber(sExtsCount);
										
							if(FirstRecord())
							{						//var Id = GetFieldValue(""Id"");
								MainPiliotNumber = GetFieldValue(""Main Piliot Number"");												
							}														
						}
						if(MainPiliotNumber != RecCountDID)
						{
							sMsg = ""One or more of the DIDs are not Active/ reserved.Hence file is not uploaded.!"";
							TheApplication().RaiseErrorText(sMsg);	
						}
						ClearToQuery();
						ActivateField(""Id"");
						ActivateField(""Action"");
						ActivateField(""Call Barring"");
						ActivateField(""Device Model"");
						ActivateField(""Email"");
						ActivateField(""Extension Number"");
						ActivateField(""Ext Status"");
						ActivateField(""Full Name"");
						ActivateField(""Pilot DID Number"");
						ActivateField(""User Business Feature Set"");	
						ActivateField(""STC User Feature Advance"");	
						ActivateField(""CC Agent AddOn"");	
						ActivateField(""CC Recording AddOn"");	
						ActivateField(""CC Report Admin AddOn"");	
						ActivateField(""CC Report Agent AddOn"");	
						ActivateField(""Feature Bundle"");	
						ActivateField(""Bulk Id"");
						ActivateField(""Opportunity Id"");
						ActivateField(""Parent Pilot Id"");
						ActivateField(""STC User Feature MRC Discount"");

						ActivateField(""STC MS Team AddOn"");
						ActivateField(""STC MS Team Price"");	
										
						SearchSpec = ""[Parent Pilot Id] = '"" +vExtParentId+ ""' AND [Extension Number] ='"" +vExtensioNumber[RecCount]+ ""'"";
						SetSearchExpr(SearchSpec);
						ExecuteQuery(ForwardBackward);						
						if(FirstRecord())
						{
							pilotNum = GetFieldValue(""Pilot DID Number"");
							SetFieldValue(""Bulk Id"",BulkId);
							SetFieldValue(""Ext Status"",""Updated"");
							SetFieldValue(""Opportunity Id"",OptyId);
							SetFieldValue(""Parent Pilot Id"",vExtParentId);
							SetFieldValue(""Action"", vAction[RecCount]);		
							SetFieldValue(""Call Barring"",vCallingBarring[RecCount]);							
							SetFieldValue(""Device Model"",vDeviceModel[RecCount]);
							SetFieldValue(""Email"", vEmail[RecCount]);			
							SetFieldValue(""Extension Number"", vExtensioNumber[RecCount]);
							SetFieldValue(""Full Name"", vFullName[RecCount]);					
							SetFieldValue(""Pilot DID Number"", vPilotDIDNumber[RecCount]);
							SetFieldValue(""User Business Feature Set"",vUserBusfeatset[RecCount]);
							SetFieldValue(""STC User Feature Advance"",vUserfeatureAdvance[RecCount]);
							SetFieldValue(""CC Agent AddOn"",vCCAgentAddOn[RecCount]);
							SetFieldValue(""CC Recording AddOn"",vCCRecordingAddOn[RecCount]);
							SetFieldValue(""CC Report Admin AddOn"",vCCReportAdminAddOn[RecCount]);
							SetFieldValue(""CC Report Agent AddOn"",vCCReportAgentAddOn[RecCount]);
							SetFieldValue(""Feature Bundle"",vFeatureBundle[RecCount]);
							SetFieldValue(""STC User Feature MRC Discount"",vUserFeatureMRCdisc[RecCount]);	
							
							SetFieldValue(""STC MS Team AddOn"",vMSTeamAddon[RecCount]);
							SetFieldValue(""STC MS Team Price"",vMSTeamAddonPrice[RecCount]);																					
							WriteRecord();
						}

						else if(Range<=sExtsCount)
						{						
							sMsg = ""You are not allowed to add more number of extension as you have reached the Max Extension Reserved for the Pilot Number. Total Reserved Extensions = ""+Range+"".!"";
							TheApplication().RaiseErrorText(sMsg);
						}
						else if((StartingExtension > ToNumber(vExtensioNumber[RecCount])) || (EndingExtension < ToNumber(vExtensioNumber[RecCount])))
						{
							sMsg = ""Extension numbers should be added in the sequence and number range should be in between Starting Extension ""+StartingExtension+"" and Ending Extension ""+EndingExtension+"".!"";
							TheApplication().RaiseErrorText(sMsg);
						}
						else if(vUserBusfeatset[RecCount] ==""No"" && ((vFeatureBundle[RecCount] !="""" &&  vFeatureBundle[RecCount] != null) || (vCCAgentAddOn[RecCount]==""Y"") || (vCCRecordingAddOn[RecCount]==""Y"") || (vCCReportAgentAddOn[RecCount]==""Y"") || (vCCReportAdminAddOn[RecCount]==""Y"")))
						{
							sMsg = ""CC add-ons are applicable only when User Business Features Set value will be 'Yes'"";
							TheApplication().RaiseErrorText(sMsg);
						} 
						else if((vFeatureBundle[RecCount] !="""" && vFeatureBundle[RecCount] != null) && ((vCCAgentAddOn[RecCount]==""Y"") || (vCCRecordingAddOn[RecCount]==""Y"") || (vCCReportAgentAddOn[RecCount]==""Y"")))
						{
							sMsg = ""You can select Only 'CC Report Admin AddOn' value is 'Y' with a Feature Bundle.!"";
							TheApplication().RaiseErrorText(sMsg);
						} 
						else
						{
							NewRecord(NewAfter);
							//RecCount--;
							SetFieldValue(""Ext Status"",""Imported"");
							SetFieldValue(""Bulk Id"",BulkId);
							SetFieldValue(""Opportunity Id"",OptyId);
							SetFieldValue(""Parent Pilot Id"",vExtParentId);
							SetFieldValue(""Ext Status"",""Imported"");
							SetFieldValue(""Action"", vAction[RecCount]);		
							SetFieldValue(""Call Barring"", vCallingBarring[RecCount]);
							SetFieldValue(""Device Model"",vDeviceModel[RecCount]);
							SetFieldValue(""Email"", vEmail[RecCount]);						
							SetFieldValue(""Extension Number"", vExtensioNumber[RecCount]);					
							SetFieldValue(""Full Name"", vFullName[RecCount]);
							SetFieldValue(""Pilot DID Number"", vPilotDIDNumber[RecCount]);
							SetFieldValue(""User Business Feature Set"", vUserBusfeatset[RecCount]);
							SetFieldValue(""STC User Feature Advance"",vUserfeatureAdvance[RecCount]);
							SetFieldValue(""CC Agent AddOn"",vCCAgentAddOn[RecCount]);
							SetFieldValue(""CC Recording AddOn"",vCCRecordingAddOn[RecCount]);
							SetFieldValue(""CC Report Admin AddOn"",vCCReportAdminAddOn[RecCount]);
							SetFieldValue(""CC Report Agent AddOn"",vCCReportAgentAddOn[RecCount]);
							SetFieldValue(""Feature Bundle"",vFeatureBundle[RecCount]);
							SetFieldValue(""STC User Feature MRC Discount"",vUserFeatureMRCdisc[RecCount]);

							SetFieldValue(""STC MS Team AddOn"",vMSTeamAddon[RecCount]);
							SetFieldValue(""STC MS Team Price"",vMSTeamAddonPrice[RecCount]);							
							WriteRecord();
						}
						RecCount++;
					}//end of while(RecCount > 0)

					svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
					psIn1 = TheApplication().NewPropertySet();
					psOut1 = TheApplication().NewPropertySet();
					psIn1.SetProperty(""Refresh All"", ""Y"");
					svcUI.InvokeMethod(""RefreshCurrentApplet"", psIn1, psOut1);
				}//end of if (i > 0)
			}//end of with(BulkLineBC)
		}//end of if (FirstRecord())
	}//end of with(BulkHeaderBC)

	TheApplication().SetProfileAttr(""ExtParentId"", """");
	return(CancelOperation);
}
catch(e)
{
	if(sMsg !=  null && sMsg !="""")
	{
	TheApplication().RaiseErrorText(sMsg);
	}
	//  throw e;
}
finally
{
	svcUI = null, psIn1 = null, psOut1 = null;
	ExtensionAvaya = null;
	DIDAvayaBC = null;	
	ExtensionAvayaQuery=null, PilotMSISDN=null, stcAvayaBO=null;
	stcAvayaOptyBO = null;
}
//return CancelOperation;
}
function CreateOneExtensionRecords(vAction,vFullName,vExtensioNumber,vPilotDIDNumber,vEmail,vDeviceModel,vCallingBarring,vUserBusfeatset,vUserfeatureAdvance,vCCAgentAddOn,vCCRecordingAddOn,vCCReportAdminAddOn,vCCReportAgentAddOn,vFeatureBundle,vUserFeatureMRCdisc,i)
{
var svcUI = null, psIn1 = null, psOut1 = null;
var SearchSpec = """", sSearchSpecOpt = """";
try
{
	var RecCount = 0;
	var Range="""";
	var FeatureBundle="""";
	var errorCd,errormsg;
	var sEXTENSIONCOUNT =0,sExtsCount=0;
	var EndingExtension,StartingExtension;
	var MainPiliotNumber="""";
	var sMsg="""",pilotNum,sExtsDIDCount;
	var stcAvayaBO = TheApplication().GetBusObject(""STC AVAYA Opty BO"");
	var stcAvayaOptyBO = TheApplication().GetBusObject(""STCVIVAOneAVAYAOptyBO"");
	var stcAccount = TheApplication().GetBusObject(""Account"");	
	var PilotMSISDN = stcAvayaBO.GetBusComp(""STC Pilot MSISDN Avaya BC"");
	var DIDAvayaBC = stcAvayaOptyBO.GetBusComp(""STC DID MSISDN Avaya BC"");
	var ExtensionAvaya = stcAvayaBO.GetBusComp(""STC Extension Avaya BC"");
	var ExtensionAvayaQuery = stcAvayaBO.GetBusComp(""STC Extension Avaya Query BC"");
	var NewPBXExtReseBC = stcAccount.GetBusComp(""STC New PBX Extension Reservation BC"");
	var vExtParentId = TheApplication().GetProfileAttr(""ExtParentId"");
	var sExtReserveBC = TheApplication().GetBusObject(""Account"").GetBusComp(""STC New PBX Extension Reservation BC"");
	with(PilotMSISDN)
	{
		ClearToQuery();
		ActivateField(""Bulk Id"");
		ActivateField(""Opportunity Id"");
		ActivateField(""Main Piliot Number"");	
		SetSearchSpec(""Id"",vExtParentId);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			var BulkId = GetFieldValue(""Bulk Id"");
			var OptyId = GetFieldValue(""Opportunity Id"");
			var sPilotMSISDN = GetFieldValue(""Main Piliot Number"");				
			with(sExtReserveBC)
			{
				ClearToQuery();
				ActivateField(""Range"");
				ActivateField(""PilotNum"");
				ActivateField(""Ending Extension"");
				ActivateField(""Starting Extension"");
				SearchSpec = ""[PilotNum] = '"" + sPilotMSISDN + ""' AND [Extension Flag] = 'Y'"";
				SetSearchExpr(SearchSpec);
				ExecuteQuery(ForwardBackward);						
				if(FirstRecord())
				{						//var Id = GetFieldValue(""Id"");
					Range = GetFieldValue(""Range"");
					Range = ToNumber(Range);
				}
			} // sExtReserveBC		
			with(ExtensionAvayaQuery)
			{
				ClearToQuery();
				ActivateField(""Parent Pilot Id"");
				ActivateField(""Ext Status"");
				SearchSpec = ""[Parent Pilot Id] = '"" +vExtParentId+ ""' AND [Extension Number] IS NOT NULL AND [Ext Status] ='Imported' "";
				SetSearchExpr(SearchSpec);
				ExecuteQuery(ForwardBackward);			
				sExtsCount = CountRecords();
				sExtsCount = ToNumber(sExtsCount);
				sEXTENSIONCOUNT = sExtsCount + i;
				sEXTENSIONCOUNT = ToNumber(sEXTENSIONCOUNT);
			} // ExtensionAvayaQuery

			if(Range<i || Range<sExtsCount)
			{
				sMsg = ""You are not allowed to add more number of extension as you have reached the Max Extension Reserved for the Pilot Number. Total Reserved Extensions = ""+Range+"".!"";
				TheApplication().RaiseErrorText(sMsg);
			}
			with(NewPBXExtReseBC)
			{
				ClearToQuery();
				ActivateField(""Ending Extension"");
				ActivateField(""Starting Extension"");
				//SearchSpec = ""[PilotNum] = '"" +sPilotMSISDN+ ""'"";
				SearchSpec = ""[PilotNum] = '"" +sPilotMSISDN+ ""' AND [Starting Extension] IS NOT NULL"";
				SetSearchExpr(SearchSpec);
				ExecuteQuery(ForwardBackward);			
				if(FirstRecord())
				{		//var Id = GetFieldValue(""Id"");
					EndingExtension = GetFieldValue(""Ending Extension"");
					EndingExtension = ToNumber(EndingExtension);
					StartingExtension = GetFieldValue(""Starting Extension"");
					StartingExtension = ToNumber(StartingExtension);
				}
			} // NewPBXExtReseBC

			with(ExtensionAvayaQuery)
			{
				if (i > 0)
				{
					while(RecCount < i)
					{
						var	RecCountDID = vPilotDIDNumber[RecCount];
						FeatureBundle= vFeatureBundle[RecCount];
						if(RecCountDID =="","")
						{
							RecCountDID="""";
						}
						if(FeatureBundle =="","")
						{
							FeatureBundle ="""";
						}

						MainPiliotNumber="""";

						with(ExtensionAvayaQuery)
						{
							ClearToQuery();
							ActivateField(""Parent Pilot Id"");
							ActivateField(""Ext Status"");
							SearchSpec = ""[Parent Pilot Id] = '"" +vExtParentId+ ""' AND [Extension Number] IS NOT NULL AND [Ext Status] ='Imported' "";
							SetSearchExpr(SearchSpec);
							ExecuteQuery(ForwardBackward);			
							sExtsCount = CountRecords();
							sExtsCount = ToNumber(sExtsCount);
							sEXTENSIONCOUNT = sExtsCount + i;
							sEXTENSIONCOUNT = ToNumber(sEXTENSIONCOUNT);
						} // ExtensionAvayaQuery

						with(DIDAvayaBC)
						{
							ClearToQuery();
							ActivateField(""STC Subscriber Status"");
							ActivateField(""Type"");
							ActivateField(""Pilot Parent Id"");
							ActivateField(""Main Piliot Number"");
							//ActivateField(""Starting Extension"");
							SearchSpec = ""[Pilot Parent Id] = '"" + vExtParentId + ""' AND [Type] = 'DID' AND [Main Piliot Number] IS NOT NULL AND [Main Piliot Number] = '"" + vPilotDIDNumber[RecCount] + ""'"";
							SetSearchExpr(SearchSpec);
							ExecuteQuery(ForwardBackward);	
							sExtsDIDCount = CountRecords();
							sExtsDIDCount = ToNumber(sExtsCount);
										
							if(FirstRecord())
							{						//var Id = GetFieldValue(""Id"");
								MainPiliotNumber = GetFieldValue(""Main Piliot Number"");												
							}														
						}
						if(MainPiliotNumber != RecCountDID)
						{
							sMsg = ""One or more of the DIDs are not Active/ reserved.Hence file is not uploaded.!"";
							TheApplication().RaiseErrorText(sMsg);	
						}
						ClearToQuery();
						ActivateField(""Id"");
						ActivateField(""Action"");
						ActivateField(""Call Barring"");
						ActivateField(""Device Model"");
						ActivateField(""Email"");
						ActivateField(""Extension Number"");
						ActivateField(""Ext Status"");
						ActivateField(""Full Name"");
						ActivateField(""Pilot DID Number"");
						ActivateField(""User Business Feature Set"");	
						ActivateField(""STC User Feature Advance"");	
						ActivateField(""CC Agent AddOn"");	
						ActivateField(""CC Recording AddOn"");	
						ActivateField(""CC Report Admin AddOn"");	
						ActivateField(""CC Report Agent AddOn"");	
						ActivateField(""Feature Bundle"");	
						ActivateField(""Bulk Id"");
						ActivateField(""Opportunity Id"");
						ActivateField(""Parent Pilot Id"");
						ActivateField(""STC User Feature MRC Discount"");				
						SearchSpec = ""[Parent Pilot Id] = '"" +vExtParentId+ ""' AND [Extension Number] ='"" +vExtensioNumber[RecCount]+ ""'"";
						SetSearchExpr(SearchSpec);
						ExecuteQuery(ForwardBackward);						
						if(FirstRecord())
						{
							pilotNum = GetFieldValue(""Pilot DID Number"");
							SetFieldValue(""Bulk Id"",BulkId);
							SetFieldValue(""Ext Status"",""Updated"");
							SetFieldValue(""Opportunity Id"",OptyId);
							SetFieldValue(""Parent Pilot Id"",vExtParentId);
							SetFieldValue(""Action"", vAction[RecCount]);		
							SetFieldValue(""Call Barring"",vCallingBarring[RecCount]);							
							SetFieldValue(""Device Model"",vDeviceModel[RecCount]);
							SetFieldValue(""Email"", vEmail[RecCount]);			
							SetFieldValue(""Extension Number"", vExtensioNumber[RecCount]);
							SetFieldValue(""Full Name"", vFullName[RecCount]);					
							SetFieldValue(""Pilot DID Number"", vPilotDIDNumber[RecCount]);
							SetFieldValue(""User Business Feature Set"",vUserBusfeatset[RecCount]);
							SetFieldValue(""STC User Feature Advance"",vUserfeatureAdvance[RecCount]);
							SetFieldValue(""CC Agent AddOn"",vCCAgentAddOn[RecCount]);
							SetFieldValue(""CC Recording AddOn"",vCCRecordingAddOn[RecCount]);
							SetFieldValue(""CC Report Admin AddOn"",vCCReportAdminAddOn[RecCount]);
							SetFieldValue(""CC Report Agent AddOn"",vCCReportAgentAddOn[RecCount]);
							SetFieldValue(""Feature Bundle"",vFeatureBundle[RecCount]);
							SetFieldValue(""STC User Feature MRC Discount"",vUserFeatureMRCdisc[RecCount]);															
							WriteRecord();
						}

						else if(Range<=sExtsCount)
						{						
							sMsg = ""You are not allowed to add more number of extension as you have reached the Max Extension Reserved for the Pilot Number. Total Reserved Extensions = ""+Range+"".!"";
							TheApplication().RaiseErrorText(sMsg);
						}
						else if((StartingExtension > ToNumber(vExtensioNumber[RecCount])) || (EndingExtension < ToNumber(vExtensioNumber[RecCount])))
						{
							sMsg = ""Extension numbers should be added in the sequence and number range should be in between Starting Extension ""+StartingExtension+"" and Ending Extension ""+EndingExtension+"".!"";
							TheApplication().RaiseErrorText(sMsg);
						}
						else if(vUserBusfeatset[RecCount] ==""No"" && ((vFeatureBundle[RecCount] !="""" &&  vFeatureBundle[RecCount] != null) || (vCCAgentAddOn[RecCount]==""Y"") || (vCCRecordingAddOn[RecCount]==""Y"") || (vCCReportAgentAddOn[RecCount]==""Y"") || (vCCReportAdminAddOn[RecCount]==""Y"")))
						{
							sMsg = ""CC add-ons are applicable only when User Business Features Set value will be 'Yes'"";
							TheApplication().RaiseErrorText(sMsg);
						} 
						else if((vFeatureBundle[RecCount] !="""" && vFeatureBundle[RecCount] != null) && ((vCCAgentAddOn[RecCount]==""Y"") || (vCCRecordingAddOn[RecCount]==""Y"") || (vCCReportAgentAddOn[RecCount]==""Y"")))
						{
							sMsg = ""You can select Only 'CC Report Admin AddOn' value is 'Y' with a Feature Bundle.!"";
							TheApplication().RaiseErrorText(sMsg);
						} 
						else
						{
							NewRecord(NewAfter);
							//RecCount--;
							SetFieldValue(""Ext Status"",""Imported"");
							SetFieldValue(""Bulk Id"",BulkId);
							SetFieldValue(""Opportunity Id"",OptyId);
							SetFieldValue(""Parent Pilot Id"",vExtParentId);
							SetFieldValue(""Ext Status"",""Imported"");
							SetFieldValue(""Action"", vAction[RecCount]);		
							SetFieldValue(""Call Barring"", vCallingBarring[RecCount]);
							SetFieldValue(""Device Model"",vDeviceModel[RecCount]);
							SetFieldValue(""Email"", vEmail[RecCount]);						
							SetFieldValue(""Extension Number"", vExtensioNumber[RecCount]);					
							SetFieldValue(""Full Name"", vFullName[RecCount]);
							SetFieldValue(""Pilot DID Number"", vPilotDIDNumber[RecCount]);
							SetFieldValue(""User Business Feature Set"", vUserBusfeatset[RecCount]);
							SetFieldValue(""STC User Feature Advance"",vUserfeatureAdvance[RecCount]);
							SetFieldValue(""CC Agent AddOn"",vCCAgentAddOn[RecCount]);
							SetFieldValue(""CC Recording AddOn"",vCCRecordingAddOn[RecCount]);
							SetFieldValue(""CC Report Admin AddOn"",vCCReportAdminAddOn[RecCount]);
							SetFieldValue(""CC Report Agent AddOn"",vCCReportAgentAddOn[RecCount]);
							SetFieldValue(""Feature Bundle"",vFeatureBundle[RecCount]);
							SetFieldValue(""STC User Feature MRC Discount"",vUserFeatureMRCdisc[RecCount]);						
							WriteRecord();
						}
						RecCount++;
					}//end of while(RecCount > 0)

					svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
					psIn1 = TheApplication().NewPropertySet();
					psOut1 = TheApplication().NewPropertySet();
					psIn1.SetProperty(""Refresh All"", ""Y"");
					svcUI.InvokeMethod(""RefreshCurrentApplet"", psIn1, psOut1);
				}//end of if (i > 0)
			}//end of with(BulkLineBC)
		}//end of if (FirstRecord())
	}//end of with(BulkHeaderBC)

	TheApplication().SetProfileAttr(""ExtParentId"", """");
	return(CancelOperation);
}
catch(e)
{
	if(sMsg !=  null && sMsg !="""")
	{
	TheApplication().RaiseErrorText(sMsg);
	}
	//  throw e;
}
finally
{
	svcUI = null, psIn1 = null, psOut1 = null;
	ExtensionAvaya = null;
	DIDAvayaBC = null;	
	ExtensionAvayaQuery=null, PilotMSISDN=null, stcAvayaBO=null;
	stcAvayaOptyBO = null;
}
//return CancelOperation;
}
function ImportFile(Inputs, Outputs)
{

	var vInputFile = """", vReadFromFile = """", vBulkDataArray = """", vExtParentId="""";
    var vFileName = """", vFileType = """";
	var vErrorMessage,vErrorCode;
	 //Mark
	var vAction: Array = new Array();
	var vFullName: Array = new Array();
	var vExtensioNumber: Array = new Array();
	var vPilotDIDNumber: Array = new Array();
	var vEmail: Array = new Array();
	var vDeviceModel: Array = new Array();
	var vCallingBarring: Array = new Array();
	var vUserBusfeatset: Array = new Array();
		var vCCAgentAddOn: Array = new Array();
	var vCCRecordingAddOn: Array = new Array();
	var vCCReportAdminAddOn: Array = new Array();
	var vCCReportAgentAddOn: Array = new Array();
	var vFeatureBundle: Array = new Array();

 	var vRecord = false;
	var i = 0, j = 0, ErrMsg = ""Success"";
	
	try {
		
		vExtParentId = TheApplication().GetProfileAttr(""ExtParentId"");

		vFileName = Inputs.GetProperty(""FileName"");
	 	vFileType = ToString(Inputs.GetProperty(""FileType""));
		vFileType = Clib.strlwr(vFileType);
	   if( vFileType != ""csv"")
	    {
	      TheApplication().RaiseErrorText(""Please check the File Type , It should be :  File_Name.CSV"");
	    }
	   vInputFile = Clib.fopen(vFileName, ""rt"");       
      vReadFromFile = Clib.fgets(vInputFile);
		
	//	var filepath = ""C:\\VIVA\\Bulk_file\\BulkExtensionUploadFilelatest.csv"";
//		vFileName =""C:\\VIVA\\Bulk_file\\BulkExtensionUploadFilelatest.csv"";
	//	vInputFile = Clib.fopen(vFileName, ""rt"");       
	 //   vReadFromFile = Clib.fgets(vInputFile);
	//C:\VIVA\Bulk_file
	
		if(vReadFromFile != null && vFileName != '' && vFileName != """")
		{		
			if (vInputFile == null)
			{
				TheApplication().RaiseErrorText(""Error in opening the file!"");
			}
				//vReadFromFile = Clib.fgets(4000, vInputFile); 		
			if(vExtParentId != null && vExtParentId != """")
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
					{			
						ErrMsg = """"; //Nullify Error Message for each of the iteration			
						if(vReadFromFile != null && vReadFromFile != """")
						{
							vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n""));
							if (j == 0)
							{
								j++;
							}
							else{	 
								var sRecData = vReadFromFile.split("","");
								//vOltName[i] = sRecData[0];
								vAction[i] = sRecData[0];
								vFullName[i] = sRecData[1];
								vExtensioNumber[i] = sRecData[2];
								vPilotDIDNumber[i] = sRecData[3];
								vEmail[i] = sRecData[4];
								vDeviceModel[i] = sRecData[5];
								vCallingBarring[i] = sRecData[6];
								vUserBusfeatset[i] = sRecData[7];
								vCCAgentAddOn[i] = sRecData[8];
								vCCRecordingAddOn[i] = sRecData[9];
								vCCReportAdminAddOn[i] = sRecData[10];
								vCCReportAgentAddOn[i] = sRecData[11];
								vFeatureBundle[i] = sRecData[12];
								i++;
								j++;
							}
						}//if(sReadFromFile != null && sReadFromFile != """")
						vReadFromFile = Clib.fgets(vInputFile);
					}//while(!Clib.feof(sFileOpen))
				 
					CreateOneExtensionRecords(vAction,vFullName,vExtensioNumber,vPilotDIDNumber,vEmail,vDeviceModel,vCallingBarring,vUserBusfeatset,vCCAgentAddOn,vCCRecordingAddOn,vCCReportAdminAddOn,vCCReportAgentAddOn,vFeatureBundle,i);


			}// end of if 	 
		}//if(sFileName != null && sFileName != '' && sFileName != """")
	}//end of try
	catch(e)
	{

       
		vErrorMessage = e.toString();
	//throw(e.errText); vErrorMessage = e.toString();
        vErrorCode    = e.errCode;
 
        TheApplication().RaiseErrorText(vErrorMessage);
	}
	finally{
		//vAccountNum = null, vAction = null, vExtDays = null;
		vInputFile = null;
	//	vGPONParentID = null;
	}
//	return CancelOperation;
}
function ImportFile(Inputs, Outputs)
{

	var vInputFile = """", vReadFromFile = """", vBulkDataArray = """", vExtParentId="""";
    var vFileName = """", vFileType = """";
	var vErrorMessage,vErrorCode;
	 //Mark
	var vAction: Array = new Array();
	var vFullName: Array = new Array();
	var vExtensioNumber: Array = new Array();
	var vPilotDIDNumber: Array = new Array();
	var vEmail: Array = new Array();
	var vDeviceModel: Array = new Array();
	var vCallingBarring: Array = new Array();
	var vUserBusfeatset: Array = new Array();
	var vUserfeatureAdvance: Array = new Array();
	var vCCAgentAddOn: Array = new Array();
	var vCCRecordingAddOn: Array = new Array();
	var vCCReportAdminAddOn: Array = new Array();
	var vCCReportAgentAddOn: Array = new Array();
	var vFeatureBundle: Array = new Array();
	var vUserFeatureMRCdisc: Array = new Array();
	var vMSTeamAddon: Array = new Array();
	var vMSTeamAddonPrice: Array = new Array();

 	var vRecord = false;
	var i = 0, j = 0, ErrMsg = ""Success"";
	
	try {
		
		vExtParentId = TheApplication().GetProfileAttr(""ExtParentId"");

		vFileName = Inputs.GetProperty(""FileName"");
	 	vFileType = ToString(Inputs.GetProperty(""FileType""));
		vFileType = Clib.strlwr(vFileType);
	   if( vFileType != ""csv"")
	    {
	      TheApplication().RaiseErrorText(""Please check the File Type , It should be :  File_Name.CSV"");
	    }
	   vInputFile = Clib.fopen(vFileName, ""rt"");       
      vReadFromFile = Clib.fgets(vInputFile);
		
	//	var filepath = ""C:\\VIVA\\Bulk_file\\BulkExtensionUploadFilelatest.csv"";
//		vFileName =""C:\\VIVA\\Bulk_file\\BulkExtensionUploadFilelatest.csv"";
	//	vInputFile = Clib.fopen(vFileName, ""rt"");       
	 //   vReadFromFile = Clib.fgets(vInputFile);
	//C:\VIVA\Bulk_file
	
		if(vReadFromFile != null && vFileName != '' && vFileName != """")
		{		
			if (vInputFile == null)
			{
				TheApplication().RaiseErrorText(""Error in opening the file!"");
			}
				//vReadFromFile = Clib.fgets(4000, vInputFile); 		
			if(vExtParentId != null && vExtParentId != """")
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
					{			
						ErrMsg = """"; //Nullify Error Message for each of the iteration			
						if(vReadFromFile != null && vReadFromFile != """")
						{
							vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n""));
							if (j == 0)
							{
								j++;
							}
							else{	 
								var sRecData = vReadFromFile.split("","");
								//vOltName[i] = sRecData[0];
								vAction[i] = sRecData[0];
								vFullName[i] = sRecData[1];
								vExtensioNumber[i] = sRecData[2];
								vPilotDIDNumber[i] = sRecData[3];
								vEmail[i] = sRecData[4];
								vDeviceModel[i] = sRecData[5];
								vCallingBarring[i] = sRecData[6];								
								vUserBusfeatset[i] = sRecData[7];
								vUserfeatureAdvance[i] =sRecData[8];
								vCCAgentAddOn[i] = sRecData[9];
								vCCRecordingAddOn[i] = sRecData[10];
								vCCReportAdminAddOn[i] = sRecData[11];
								vCCReportAgentAddOn[i] = sRecData[12];
								vFeatureBundle[i] = sRecData[13];
								vUserFeatureMRCdisc[i] = sRecData[14];

								vMSTeamAddon[i] = sRecData[15];
								vMSTeamAddonPrice[i] = sRecData[16];

								i++;
								j++;
							}
						}//if(sReadFromFile != null && sReadFromFile != """")
						vReadFromFile = Clib.fgets(vInputFile);
					}//while(!Clib.feof(sFileOpen))
				 
					CreateOneExtensionRecords(vAction,vFullName,vExtensioNumber,vPilotDIDNumber,vEmail,vDeviceModel,vCallingBarring,vUserBusfeatset,vUserfeatureAdvance,vCCAgentAddOn,vCCRecordingAddOn,vCCReportAdminAddOn,vCCReportAgentAddOn,vFeatureBundle,vUserFeatureMRCdisc,vMSTeamAddon,vMSTeamAddonPrice,i);


			}// end of if 	 
		}//if(sFileName != null && sFileName != '' && sFileName != """")
	}//end of try
	catch(e)
	{

       
		vErrorMessage = e.toString();
	//throw(e.errText); vErrorMessage = e.toString();
        vErrorCode    = e.errCode;
 
        TheApplication().RaiseErrorText(vErrorMessage);
	}
	finally{
		//vAccountNum = null, vAction = null, vExtDays = null;
		vInputFile = null;
	//	vGPONParentID = null;
	}
//	return CancelOperation;
}
function ImportFile(Inputs, Outputs)
{

	var vInputFile = """", vReadFromFile = """", vBulkDataArray = """", vExtParentId="""";
    var vFileName = """", vFileType = """";
	var vErrorMessage,vErrorCode;
	 //Mark
	var vAction: Array = new Array();
	var vFullName: Array = new Array();
	var vExtensioNumber: Array = new Array();
	var vPilotDIDNumber: Array = new Array();
	var vEmail: Array = new Array();
	var vDeviceModel: Array = new Array();
	var vCallingBarring: Array = new Array();
	var vUserBusfeatset: Array = new Array();
	var vUserfeatureAdvance: Array = new Array();
	var vCCAgentAddOn: Array = new Array();
	var vCCRecordingAddOn: Array = new Array();
	var vCCReportAdminAddOn: Array = new Array();
	var vCCReportAgentAddOn: Array = new Array();
	var vFeatureBundle: Array = new Array();
	var vUserFeatureMRCdisc: Array = new Array();

 	var vRecord = false;
	var i = 0, j = 0, ErrMsg = ""Success"";
	
	try {
		
		vExtParentId = TheApplication().GetProfileAttr(""ExtParentId"");

		vFileName = Inputs.GetProperty(""FileName"");
	 	vFileType = ToString(Inputs.GetProperty(""FileType""));
		vFileType = Clib.strlwr(vFileType);
	   if( vFileType != ""csv"")
	    {
	      TheApplication().RaiseErrorText(""Please check the File Type , It should be :  File_Name.CSV"");
	    }
	   vInputFile = Clib.fopen(vFileName, ""rt"");       
      vReadFromFile = Clib.fgets(vInputFile);
		
	//	var filepath = ""C:\\VIVA\\Bulk_file\\BulkExtensionUploadFilelatest.csv"";
//		vFileName =""C:\\VIVA\\Bulk_file\\BulkExtensionUploadFilelatest.csv"";
	//	vInputFile = Clib.fopen(vFileName, ""rt"");       
	 //   vReadFromFile = Clib.fgets(vInputFile);
	//C:\VIVA\Bulk_file
	
		if(vReadFromFile != null && vFileName != '' && vFileName != """")
		{		
			if (vInputFile == null)
			{
				TheApplication().RaiseErrorText(""Error in opening the file!"");
			}
				//vReadFromFile = Clib.fgets(4000, vInputFile); 		
			if(vExtParentId != null && vExtParentId != """")
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
					{			
						ErrMsg = """"; //Nullify Error Message for each of the iteration			
						if(vReadFromFile != null && vReadFromFile != """")
						{
							vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n""));
							if (j == 0)
							{
								j++;
							}
							else{	 
								var sRecData = vReadFromFile.split("","");
								//vOltName[i] = sRecData[0];
								vAction[i] = sRecData[0];
								vFullName[i] = sRecData[1];
								vExtensioNumber[i] = sRecData[2];
								vPilotDIDNumber[i] = sRecData[3];
								vEmail[i] = sRecData[4];
								vDeviceModel[i] = sRecData[5];
								vCallingBarring[i] = sRecData[6];								
								vUserBusfeatset[i] = sRecData[7];
								vUserfeatureAdvance[i] =sRecData[8];
								vCCAgentAddOn[i] = sRecData[9];
								vCCRecordingAddOn[i] = sRecData[10];
								vCCReportAdminAddOn[i] = sRecData[11];
								vCCReportAgentAddOn[i] = sRecData[12];
								vFeatureBundle[i] = sRecData[13];
								vUserFeatureMRCdisc[i] = sRecData[14];
								i++;
								j++;
							}
						}//if(sReadFromFile != null && sReadFromFile != """")
						vReadFromFile = Clib.fgets(vInputFile);
					}//while(!Clib.feof(sFileOpen))
				 
					CreateOneExtensionRecords(vAction,vFullName,vExtensioNumber,vPilotDIDNumber,vEmail,vDeviceModel,vCallingBarring,vUserBusfeatset,vUserfeatureAdvance,vCCAgentAddOn,vCCRecordingAddOn,vCCReportAdminAddOn,vCCReportAgentAddOn,vFeatureBundle,vUserFeatureMRCdisc,i);


			}// end of if 	 
		}//if(sFileName != null && sFileName != '' && sFileName != """")
	}//end of try
	catch(e)
	{

       
		vErrorMessage = e.toString();
	//throw(e.errText); vErrorMessage = e.toString();
        vErrorCode    = e.errCode;
 
        TheApplication().RaiseErrorText(vErrorMessage);
	}
	finally{
		//vAccountNum = null, vAction = null, vExtDays = null;
		vInputFile = null;
	//	vGPONParentID = null;
	}
//	return CancelOperation;
}
function ImportFile(Inputs, Outputs)
{

	var vInputFile = """", vReadFromFile = """", vBulkDataArray = """", vExtParentId="""";
    var vFileName = """", vFileType = """";
	var vErrorMessage,vErrorCode;
	 //Mark
	var vAction: Array = new Array();
	var vFullName: Array = new Array();
	var vExtensioNumber: Array = new Array();
	var vPilotDIDNumber: Array = new Array();
	var vEmail: Array = new Array();
	var vDeviceModel: Array = new Array();
	var vCallingBarring: Array = new Array();
	var vUserBusfeatset: Array = new Array();
	var vUserfeatureAdvance: Array = new Array();
	var vCCAgentAddOn: Array = new Array();
	var vCCRecordingAddOn: Array = new Array();
	var vCCReportAdminAddOn: Array = new Array();
	var vCCReportAgentAddOn: Array = new Array();
	var vFeatureBundle: Array = new Array();

 	var vRecord = false;
	var i = 0, j = 0, ErrMsg = ""Success"";
	
	try {
		
		vExtParentId = TheApplication().GetProfileAttr(""ExtParentId"");

		vFileName = Inputs.GetProperty(""FileName"");
	 	vFileType = ToString(Inputs.GetProperty(""FileType""));
		vFileType = Clib.strlwr(vFileType);
	   if( vFileType != ""csv"")
	    {
	      TheApplication().RaiseErrorText(""Please check the File Type , It should be :  File_Name.CSV"");
	    }
	   vInputFile = Clib.fopen(vFileName, ""rt"");       
      vReadFromFile = Clib.fgets(vInputFile);
		
	//	var filepath = ""C:\\VIVA\\Bulk_file\\BulkExtensionUploadFilelatest.csv"";
//		vFileName =""C:\\VIVA\\Bulk_file\\BulkExtensionUploadFilelatest.csv"";
	//	vInputFile = Clib.fopen(vFileName, ""rt"");       
	 //   vReadFromFile = Clib.fgets(vInputFile);
	//C:\VIVA\Bulk_file
	
		if(vReadFromFile != null && vFileName != '' && vFileName != """")
		{		
			if (vInputFile == null)
			{
				TheApplication().RaiseErrorText(""Error in opening the file!"");
			}
				//vReadFromFile = Clib.fgets(4000, vInputFile); 		
			if(vExtParentId != null && vExtParentId != """")
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
					{			
						ErrMsg = """"; //Nullify Error Message for each of the iteration			
						if(vReadFromFile != null && vReadFromFile != """")
						{
							vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n""));
							if (j == 0)
							{
								j++;
							}
							else{	 
								var sRecData = vReadFromFile.split("","");
								//vOltName[i] = sRecData[0];
								vAction[i] = sRecData[0];
								vFullName[i] = sRecData[1];
								vExtensioNumber[i] = sRecData[2];
								vPilotDIDNumber[i] = sRecData[3];
								vEmail[i] = sRecData[4];
								vDeviceModel[i] = sRecData[5];
								vCallingBarring[i] = sRecData[6];								
								vUserBusfeatset[i] = sRecData[7];
								vUserfeatureAdvance[i] =sRecData[8];
								vCCAgentAddOn[i] = sRecData[9];
								vCCRecordingAddOn[i] = sRecData[10];
								vCCReportAdminAddOn[i] = sRecData[11];
								vCCReportAgentAddOn[i] = sRecData[12];
								vFeatureBundle[i] = sRecData[13];
								i++;
								j++;
							}
						}//if(sReadFromFile != null && sReadFromFile != """")
						vReadFromFile = Clib.fgets(vInputFile);
					}//while(!Clib.feof(sFileOpen))
				 
					CreateOneExtensionRecords(vAction,vFullName,vExtensioNumber,vPilotDIDNumber,vEmail,vDeviceModel,vCallingBarring,vUserBusfeatset,vUserfeatureAdvance,vCCAgentAddOn,vCCRecordingAddOn,vCCReportAdminAddOn,vCCReportAgentAddOn,vFeatureBundle,i);


			}// end of if 	 
		}//if(sFileName != null && sFileName != '' && sFileName != """")
	}//end of try
	catch(e)
	{

       
		vErrorMessage = e.toString();
	//throw(e.errText); vErrorMessage = e.toString();
        vErrorCode    = e.errCode;
 
        TheApplication().RaiseErrorText(vErrorMessage);
	}
	finally{
		//vAccountNum = null, vAction = null, vExtDays = null;
		vInputFile = null;
	//	vGPONParentID = null;
	}
//	return CancelOperation;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{

	if(MethodName == ""ImportFile"")
	{
		ImportFile(Inputs,Outputs);
		return (CancelOperation);
	}
	
	
}
"//Your public declarations go here...  
"
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{


	try
	{
		if(MethodName == ""Validated"")
		{
			Validation(Inputs,Outputs);
			return (CancelOperation);
		}
		//return (ContinueOperation);
	}
	catch(e)
	{
	}
	finally
	{
	}
return (ContinueOperation);
	  
}
function Validation(Inputs, Outputs)
{

try
 	{
	var svcUI = null, psIn1 = null, psOut1 = null;
	var SearchSpec = """", sSearchSpecOpt = """";
	var i;
	var RecCount = 0;
	var Range="""";
	var vErrorMessage="""";
		var	CCAgentAddOn =""N"";
	var CCReportAgentAddOn=""N"";
	var CCReportAdminAddOn =""N"";
	var CCRecordingAddOn =""N"";
	var FeatureBundle ="""";
	var ExtensionId   = Inputs.GetProperty(""ExtensionId"");
	var PilotParentId   = Inputs.GetProperty(""Pilot ParentId"");
	var sEXTENSIONCOUNT =0,sExtsCount=0;
	var sMsg,ExtensionNumber,Action,CallBarring,UserBusinesseatureSet;
	var stcAvayaBO = TheApplication().GetBusObject(""STC AVAYA Opty BO"");	
	var PilotMSISDN = stcAvayaBO.GetBusComp(""STC Pilot MSISDN Avaya BC"");
	var ExtensionAvaya = stcAvayaBO.GetBusComp(""STC Extension Avaya BC"");
	var ExtensionAvayaQuery = stcAvayaBO.GetBusComp(""STC Extension Avaya Query BC"");
	var vExtParentId = TheApplication().GetProfileAttr(""ExtParentId"");
	var	sExtReserveBC = TheApplication().GetBusObject(""Account"").GetBusComp(""STC New PBX Extension Reservation BC"");
	with(PilotMSISDN)
	{
		ClearToQuery();
		ActivateField(""Bulk Id"");
		ActivateField(""Opportunity Id"");
		ActivateField(""Main Piliot Number"");	
		SetSearchSpec(""Id"",PilotParentId);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			var BulkId = GetFieldValue(""Bulk Id"");
			var OptyId = GetFieldValue(""Opportunity Id"");
			var sPilotMSISDN = GetFieldValue(""Main Piliot Number"");				
			with(sExtReserveBC)
				{
					ClearToQuery();
					ActivateField(""Range"");
					ActivateField(""PilotNum"");
					ActivateField(""Ending Extension"");
					ActivateField(""Starting Extension"");
					SearchSpec = ""[PilotNum] = '"" + sPilotMSISDN + ""' AND [Extension Flag] = 'Y'"";
					SetSearchExpr(SearchSpec);
					ExecuteQuery(ForwardBackward);						
					if(FirstRecord())
					{						//var Id = GetFieldValue(""Id"");
					Range = GetFieldValue(""Range"");
					Range = ToNumber(Range);
					}
				}			
				with(ExtensionAvaya)
				{
				ClearToQuery();
				ActivateField(""Parent Pilot Id"");
				ActivateField(""Ext Status"");
				SearchSpec = ""[Parent Pilot Id] = '"" +vExtParentId+ ""' AND [Extension Number] IS NOT NULL AND [Ext Status] ='Imported' "";
			   	SetSearchExpr(SearchSpec);
				ExecuteQuery(ForwardBackward);			
				sExtsCount = CountRecords();
				sExtsCount = ToNumber(sExtsCount);
				sEXTENSIONCOUNT = sExtsCount + i;
				sEXTENSIONCOUNT = ToNumber(sEXTENSIONCOUNT);
				} // ExtensionAvaya

				if(Range<i || Range<sExtsCount)
				{
				
				sMsg = ""You are not allowed to add more number of extension as you have reached the Max Extension Reserved for the Pilot Number. Total Reserved Extensions = ""+Range+"".!"";
				TheApplication().RaiseErrorText(sMsg);
				}
				
				
			} //if PilotMSISDN
		
		with(ExtensionAvayaQuery)
				{
					ClearToQuery();
					ActivateField(""Id"");
					ActivateField(""Extension Number"");
					ActivateField(""Action"");
					ActivateField(""Pilot DID Number"");
					ActivateField(""Call Barring"");
					ActivateField(""User Business Feature Set"");	
					ActivateField(""CC Agent AddOn"");	
					ActivateField(""CC Recording AddOn"");	
					ActivateField(""CC Report Admin AddOn"");	
					ActivateField(""CC Report Agent AddOn"");	
					ActivateField(""Feature Bundle"");
										
					SearchSpec = ""[Id] = '"" +ExtensionId+""'"";
					SetSearchExpr(SearchSpec);
					ExecuteQuery();												
					if(FirstRecord())
					{
					CCAgentAddOn = GetFieldValue(""CC Agent AddOn"");
					CCReportAgentAddOn = GetFieldValue(""CC Recording AddOn"");
					CCReportAdminAddOn = GetFieldValue(""CC Report Admin AddOn"");
					CCRecordingAddOn = GetFieldValue(""CC Report Agent AddOn"");
					FeatureBundle = GetFieldValue(""Feature Bundle"");
					

					ExtensionNumber = GetFieldValue(""Extension Number"");
					Action = GetFieldValue(""Action"");
					UserBusinesseatureSet = GetFieldValue(""User Business Feature Set"");
					CallBarring = GetFieldValue(""Call Barring"");
					}
				if((Action == null ||  Action =="""")  || (ExtensionNumber == null ||  ExtensionNumber =="""") || (UserBusinesseatureSet == null ||  UserBusinesseatureSet =="""") ||(CallBarring == null ||  CallBarring ==""""))
				{
				TheApplication().RaiseErrorText(""Call Barring/User Business Feature Set/Extension Number/Action should not be null, It is a required field values"");	
				}
			else if(UserBusinesseatureSet ==""No"" && ((FeatureBundle !="""" &&  FeatureBundle != null) || (CCAgentAddOn==""Y"") || (CCReportAgentAddOn==""Y"") || (CCReportAdminAddOn==""Y"") || (CCRecordingAddOn==""Y"")))
				{			
				TheApplication().RaiseErrorText(""CC add-ons are applicable only when User Business Features Set value will be 'Yes'"");
				}
			else if((FeatureBundle !="""" &&  FeatureBundle != null) && ((CCAgentAddOn==""Y"") || (CCReportAgentAddOn==""Y"") || (CCRecordingAddOn==""Y"")))
				{					
				TheApplication().RaiseErrorText(""You can select Only 'CC Report Admin AddOn' value is 'Y' with a Feature Bundle.!"");
				} 
				
				}
		} //PilotMSISDN
	}
		
 	catch(m)
 	{
  		  vErrorMessage = m.toString();
		//	vErrorCode    = m.errCode; 
		///throw (e);
		Outputs.SetProperty(""ErrorMessage"",vErrorMessage);
		
 	}
 	finally
 	{
	//	vPortNumber = null;
		ExtensionAvayaQuery = null;
		ExtensionAvaya = null;
		PilotMSISDN = null;
		stcAvayaBO = null;
	//	Outputs.SetProperty(""ErrorMessage"",vErrorMessage);
			
 	}
	//return CancelOperation;
}
function Validation(Inputs, Outputs)
{

try
 	{
	var svcUI = null, psIn1 = null, psOut1 = null;
	var SearchSpec = """", sSearchSpecOpt = """";
	var i;
	var RecCount = 0;
	var Range="""";
	var vErrorMessage="""";
	var CCAgentAddOn =""N"";
	var CCReportAgentAddOn=""N"";
	var CCReportAdminAddOn =""N"";
	var CCRecordingAddOn =""N"";
	var UserFeatureMRCDiscount="""";
	var MSTeamAddon=""No"";
	var MSTeamAddonPrice="""";
	
	var FeatureBundle ="""";
	var ExtensionId   = Inputs.GetProperty(""ExtensionId"");
	var PilotParentId   = Inputs.GetProperty(""Pilot ParentId"");
	var sEXTENSIONCOUNT =0,sExtsCount=0;
	var sMsg,ExtensionNumber,Action,CallBarring,UserBusinesseatureSet,UserFeatureAdvance;
	var stcAvayaBO = TheApplication().GetBusObject(""STC AVAYA Opty BO"");	
	var PilotMSISDN = stcAvayaBO.GetBusComp(""STC Pilot MSISDN Avaya BC"");
	var ExtensionAvaya = stcAvayaBO.GetBusComp(""STC Extension Avaya BC"");
	var ExtensionAvayaQuery = stcAvayaBO.GetBusComp(""STC Extension Avaya Query BC"");
	var vExtParentId = TheApplication().GetProfileAttr(""ExtParentId"");
	var	sExtReserveBC = TheApplication().GetBusObject(""Account"").GetBusComp(""STC New PBX Extension Reservation BC"");
	with(PilotMSISDN)
	{
		ClearToQuery();
		ActivateField(""Bulk Id"");
		ActivateField(""Opportunity Id"");
		ActivateField(""Main Piliot Number"");	
		SetSearchSpec(""Id"",PilotParentId);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			var BulkId = GetFieldValue(""Bulk Id"");
			var OptyId = GetFieldValue(""Opportunity Id"");
			var sPilotMSISDN = GetFieldValue(""Main Piliot Number"");				
			with(sExtReserveBC)
				{
					ClearToQuery();
					ActivateField(""Range"");
					ActivateField(""PilotNum"");
					ActivateField(""Ending Extension"");
					ActivateField(""Starting Extension"");
					SearchSpec = ""[PilotNum] = '"" + sPilotMSISDN + ""' AND [Extension Flag] = 'Y'"";
					SetSearchExpr(SearchSpec);
					ExecuteQuery(ForwardBackward);						
					if(FirstRecord())
					{						//var Id = GetFieldValue(""Id"");
					Range = GetFieldValue(""Range"");
					Range = ToNumber(Range);
					}
				}			
				with(ExtensionAvaya)
				{
				ClearToQuery();
				ActivateField(""Parent Pilot Id"");
				ActivateField(""Ext Status"");
				SearchSpec = ""[Parent Pilot Id] = '"" +vExtParentId+ ""' AND [Extension Number] IS NOT NULL AND [Ext Status] ='Imported' "";
			   	SetSearchExpr(SearchSpec);
				ExecuteQuery(ForwardBackward);			
				sExtsCount = CountRecords();
				sExtsCount = ToNumber(sExtsCount);
				sEXTENSIONCOUNT = sExtsCount + i;
				sEXTENSIONCOUNT = ToNumber(sEXTENSIONCOUNT);
				} // ExtensionAvaya

				if(Range<i || Range<sExtsCount)
				{
				
				sMsg = ""You are not allowed to add more number of extension as you have reached the Max Extension Reserved for the Pilot Number. Total Reserved Extensions = ""+Range+"".!"";
				TheApplication().RaiseErrorText(sMsg);
				}
				
				
			} //if PilotMSISDN
		
				with(ExtensionAvayaQuery)
				{
					ClearToQuery();
					ActivateField(""Id"");
					ActivateField(""Extension Number"");
					ActivateField(""Action"");
					ActivateField(""Pilot DID Number"");
					ActivateField(""Call Barring"");
					ActivateField(""User Business Feature Set"");	
					ActivateField(""STC User Feature Advance"");
					ActivateField(""CC Agent AddOn"");	
					ActivateField(""CC Recording AddOn"");	
					ActivateField(""CC Report Admin AddOn"");	
					ActivateField(""CC Report Agent AddOn"");	
					ActivateField(""Feature Bundle"");
					ActivateField(""STC User Feature MRC Discount"");

					ActivateField(""STC MS Team AddOn"");
					ActivateField(""STC MS Team Price"");
										
					SearchSpec = ""[Id] = '"" +ExtensionId+""'"";
					SetSearchExpr(SearchSpec);
					ExecuteQuery();												
					if(FirstRecord())
					{
						CCAgentAddOn = GetFieldValue(""CC Agent AddOn"");
						CCReportAgentAddOn = GetFieldValue(""CC Recording AddOn"");
						CCReportAdminAddOn = GetFieldValue(""CC Report Admin AddOn"");
						CCRecordingAddOn = GetFieldValue(""CC Report Agent AddOn"");
						FeatureBundle = GetFieldValue(""Feature Bundle"");
						ExtensionNumber = GetFieldValue(""Extension Number"");
						Action = GetFieldValue(""Action"");
						UserBusinesseatureSet = GetFieldValue(""User Business Feature Set"");
						UserFeatureAdvance = GetFieldValue(""STC User Feature Advance"");
						CallBarring = GetFieldValue(""Call Barring"");
						UserFeatureMRCDiscount = GetFieldValue(""STC User Feature MRC Discount""); 

						MSTeamAddon = GetFieldValue(""STC MS Team AddOn"");
						MSTeamAddonPrice = GetFieldValue(""STC MS Team Price""); //Mark

					}
				if((Action == null ||  Action =="""")  || (ExtensionNumber == null ||  ExtensionNumber =="""") || (UserBusinesseatureSet == null ||  UserBusinesseatureSet =="""") ||(CallBarring == null ||  CallBarring ==""""))
				{
				TheApplication().RaiseErrorText(""Call Barring/User Business Feature Set/Extension Number/Action should not be null, It is a required field values"");	
				}
			else if(UserBusinesseatureSet ==""No"" && ((FeatureBundle !="""" &&  FeatureBundle != null) || (CCAgentAddOn==""Y"") || (CCReportAgentAddOn==""Y"") || (CCReportAdminAddOn==""Y"") || (CCRecordingAddOn==""Y"")))
				{			
				TheApplication().RaiseErrorText(""CC add-ons are applicable only when User Business Features Set value will be 'Yes'"");
				}
			else if(UserBusinesseatureSet ==""Yes"" && UserFeatureAdvance ==""Yes"")
				{			
				TheApplication().RaiseErrorText(""User feature Advance is not applicable when User Business Features Set value will be 'Yes'"");
				}
			else if((FeatureBundle !="""" &&  FeatureBundle != null) && ((CCAgentAddOn==""Y"") || (CCReportAgentAddOn==""Y"") || (CCRecordingAddOn==""Y"")))
				{					
				TheApplication().RaiseErrorText(""You can select Only 'CC Report Admin AddOn' value is 'Y' with a Feature Bundle.!"");
				}
				//Mark Added for stcone MS Team
		
				 
				else if(UserBusinesseatureSet != ""Yes"" && UserFeatureAdvance != ""Yes"" && UserFeatureMRCDiscount != """") //Indrasen:Fy21_R6_1
				{			
					TheApplication().RaiseErrorText(""User feature MRC Discount is not applicable when both 'User Business Features Set' and 'User Feature Advance' are not 'Yes'"");
				}
				 //Mark Added for stcone MS Team
				   else if(UserBusinesseatureSet ==""No"" && UserFeatureAdvance == ""No"" && MSTeamAddon ==""Yes"") //Mark
				    {
				    TheApplication().RaiseErrorText(""MS Teams addon is available only if the customer has System Business Feature Set 'Yes' on Pilot and Business/User Feature Set 'Yes' on Extension.!""); 
				    }
				}
		} //PilotMSISDN
	}
		
 	catch(m)
 	{
  		  vErrorMessage = m.toString();
		//	vErrorCode    = m.errCode; 
		///throw (e);
		Outputs.SetProperty(""ErrorMessage"",vErrorMessage);
		
 	}
 	finally
 	{
	//	vPortNumber = null;
		ExtensionAvayaQuery = null;
		ExtensionAvaya = null;
		PilotMSISDN = null;
		stcAvayaBO = null;
	//	Outputs.SetProperty(""ErrorMessage"",vErrorMessage);
			
 	}
	//return CancelOperation;
}
function Validation(Inputs, Outputs)
{

try
 	{
	var svcUI = null, psIn1 = null, psOut1 = null;
	var SearchSpec = """", sSearchSpecOpt = """";
	var i;
	var RecCount = 0;
	var Range="""";
	var vErrorMessage="""";
		var	CCAgentAddOn =""N"";
	var CCReportAgentAddOn=""N"";
	var CCReportAdminAddOn =""N"";
	var CCRecordingAddOn =""N"";
	
	var FeatureBundle ="""";
	var ExtensionId   = Inputs.GetProperty(""ExtensionId"");
	var PilotParentId   = Inputs.GetProperty(""Pilot ParentId"");
	var sEXTENSIONCOUNT =0,sExtsCount=0;
	var sMsg,ExtensionNumber,Action,CallBarring,UserBusinesseatureSet,UserFeatureAdvance;
	var stcAvayaBO = TheApplication().GetBusObject(""STC AVAYA Opty BO"");	
	var PilotMSISDN = stcAvayaBO.GetBusComp(""STC Pilot MSISDN Avaya BC"");
	var ExtensionAvaya = stcAvayaBO.GetBusComp(""STC Extension Avaya BC"");
	var ExtensionAvayaQuery = stcAvayaBO.GetBusComp(""STC Extension Avaya Query BC"");
	var vExtParentId = TheApplication().GetProfileAttr(""ExtParentId"");
	var	sExtReserveBC = TheApplication().GetBusObject(""Account"").GetBusComp(""STC New PBX Extension Reservation BC"");
	with(PilotMSISDN)
	{
		ClearToQuery();
		ActivateField(""Bulk Id"");
		ActivateField(""Opportunity Id"");
		ActivateField(""Main Piliot Number"");	
		SetSearchSpec(""Id"",PilotParentId);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			var BulkId = GetFieldValue(""Bulk Id"");
			var OptyId = GetFieldValue(""Opportunity Id"");
			var sPilotMSISDN = GetFieldValue(""Main Piliot Number"");				
			with(sExtReserveBC)
				{
					ClearToQuery();
					ActivateField(""Range"");
					ActivateField(""PilotNum"");
					ActivateField(""Ending Extension"");
					ActivateField(""Starting Extension"");
					SearchSpec = ""[PilotNum] = '"" + sPilotMSISDN + ""' AND [Extension Flag] = 'Y'"";
					SetSearchExpr(SearchSpec);
					ExecuteQuery(ForwardBackward);						
					if(FirstRecord())
					{						//var Id = GetFieldValue(""Id"");
					Range = GetFieldValue(""Range"");
					Range = ToNumber(Range);
					}
				}			
				with(ExtensionAvaya)
				{
				ClearToQuery();
				ActivateField(""Parent Pilot Id"");
				ActivateField(""Ext Status"");
				SearchSpec = ""[Parent Pilot Id] = '"" +vExtParentId+ ""' AND [Extension Number] IS NOT NULL AND [Ext Status] ='Imported' "";
			   	SetSearchExpr(SearchSpec);
				ExecuteQuery(ForwardBackward);			
				sExtsCount = CountRecords();
				sExtsCount = ToNumber(sExtsCount);
				sEXTENSIONCOUNT = sExtsCount + i;
				sEXTENSIONCOUNT = ToNumber(sEXTENSIONCOUNT);
				} // ExtensionAvaya

				if(Range<i || Range<sExtsCount)
				{
				
				sMsg = ""You are not allowed to add more number of extension as you have reached the Max Extension Reserved for the Pilot Number. Total Reserved Extensions = ""+Range+"".!"";
				TheApplication().RaiseErrorText(sMsg);
				}
				
				
			} //if PilotMSISDN
		
		with(ExtensionAvayaQuery)
				{
					ClearToQuery();
					ActivateField(""Id"");
					ActivateField(""Extension Number"");
					ActivateField(""Action"");
					ActivateField(""Pilot DID Number"");
					ActivateField(""Call Barring"");
					ActivateField(""User Business Feature Set"");	
					ActivateField(""STC User Feature Advance"");
					ActivateField(""CC Agent AddOn"");	
					ActivateField(""CC Recording AddOn"");	
					ActivateField(""CC Report Admin AddOn"");	
					ActivateField(""CC Report Agent AddOn"");	
					ActivateField(""Feature Bundle"");
										
					SearchSpec = ""[Id] = '"" +ExtensionId+""'"";
					SetSearchExpr(SearchSpec);
					ExecuteQuery();												
					if(FirstRecord())
					{
					CCAgentAddOn = GetFieldValue(""CC Agent AddOn"");
					CCReportAgentAddOn = GetFieldValue(""CC Recording AddOn"");
					CCReportAdminAddOn = GetFieldValue(""CC Report Admin AddOn"");
					CCRecordingAddOn = GetFieldValue(""CC Report Agent AddOn"");
					FeatureBundle = GetFieldValue(""Feature Bundle"");
					ExtensionNumber = GetFieldValue(""Extension Number"");
					Action = GetFieldValue(""Action"");
					UserBusinesseatureSet = GetFieldValue(""User Business Feature Set"");
					UserFeatureAdvance = GetFieldValue(""STC User Feature Advance"");
					CallBarring = GetFieldValue(""Call Barring"");
					}
				if((Action == null ||  Action =="""")  || (ExtensionNumber == null ||  ExtensionNumber =="""") || (UserBusinesseatureSet == null ||  UserBusinesseatureSet =="""") ||(CallBarring == null ||  CallBarring ==""""))
				{
				TheApplication().RaiseErrorText(""Call Barring/User Business Feature Set/Extension Number/Action should not be null, It is a required field values"");	
				}
			else if(UserBusinesseatureSet ==""No"" && ((FeatureBundle !="""" &&  FeatureBundle != null) || (CCAgentAddOn==""Y"") || (CCReportAgentAddOn==""Y"") || (CCReportAdminAddOn==""Y"") || (CCRecordingAddOn==""Y"")))
				{			
				TheApplication().RaiseErrorText(""CC add-ons are applicable only when User Business Features Set value will be 'Yes'"");
				}
			else if(UserBusinesseatureSet ==""Yes"" && UserFeatureAdvance ==""Yes"")
				{			
				TheApplication().RaiseErrorText(""User feature Advance is not applicable when User Business Features Set value will be 'Yes'"");
				}
			else if((FeatureBundle !="""" &&  FeatureBundle != null) && ((CCAgentAddOn==""Y"") || (CCReportAgentAddOn==""Y"") || (CCRecordingAddOn==""Y"")))
				{					
				TheApplication().RaiseErrorText(""You can select Only 'CC Report Admin AddOn' value is 'Y' with a Feature Bundle.!"");
				} 
				
				}
		} //PilotMSISDN
	}
		
 	catch(m)
 	{
  		  vErrorMessage = m.toString();
		//	vErrorCode    = m.errCode; 
		///throw (e);
		Outputs.SetProperty(""ErrorMessage"",vErrorMessage);
		
 	}
 	finally
 	{
	//	vPortNumber = null;
		ExtensionAvayaQuery = null;
		ExtensionAvaya = null;
		PilotMSISDN = null;
		stcAvayaBO = null;
	//	Outputs.SetProperty(""ErrorMessage"",vErrorMessage);
			
 	}
	//return CancelOperation;
}
"var sErrorMsg = """";
var sErrorCode ="""";"
function ApprovalRequired(psInputs,psOutputs)
{
	var appObj;
	var boLOV;
	var bcLOV;
	var isrecord;
	var iIndivhigh;
	var iIndivlow;
	var iOrghigh;
	var iOrglow;
	var sLIC;
	var sIndivLOV;
	var sOrgLOV;
	var boAccnt;
	var bcPosition;
	var sSalecoShopMgr;
	var sSTCLegal;
	var sOwnerPosition;
	var sOwnerPostnId;
	var sSalesAgent;
	var sAccntType;
	var iprepaidcount;
	var ipostpaidcount;
	var bApprovalReqFlag;
	var sSearchExpr;
	var sPlanType;
	try
	{
			appObj = TheApplication();
			sAccntType = psInputs.GetProperty(""sAccntType"");
			iprepaidcount = psInputs.GetProperty(""iprepaidcount"");
			ipostpaidcount = psInputs.GetProperty(""ipostpaidcount"");
			sPlanType = psInputs.GetProperty(""sPlanType"");
			boLOV = appObj.GetBusObject(""List Of Values"");
			bcLOV = boLOV.GetBusComp(""List Of Values"");
			sIndivLOV = appObj.InvokeMethod(""LookupValue"",""STC_CUST_TYPE"",""Individual"");
			sOrgLOV = appObj.InvokeMethod(""LookupValue"",""STC_CUST_TYPE"",""Organization"");
			iIndivhigh = 0;
			iIndivlow = 0;
			iOrghigh = 0;
			iOrglow = 0;
			sOwnerPostnId = """";
			bApprovalReqFlag = ""N"";
			with (bcLOV)
			{
				ActivateField(""Value"");
				ActivateField(""High"");
				ActivateField(""Low"");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchSpec(""Type"",""STC_CUST_TYPE"");
				ExecuteQuery(ForwardOnly);
				
				if(FirstRecord())
				{
					isrecord = FirstRecord();
					while(isrecord)
					{
						sLIC = GetFieldValue(""Value"");
						if(sLIC == sIndivLOV)
						{
							iIndivhigh = GetFieldValue(""High"");
							iIndivlow = GetFieldValue(""Low"");
						}
						else if(sLIC == sOrgLOV)
						{
							iOrghigh = GetFieldValue(""High"");
							iOrglow = GetFieldValue(""Low"");
						}
						isrecord = NextRecord();
					}
				}
			}
			
			boAccnt = appObj.GetBusObject(""STC Service Account"");
			bcPosition = boAccnt.GetBusComp(""Position"");
			sSalesAgent = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_OWNER"",""Sales Rep"");
			sSalecoShopMgr = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_OWNER"",""Saleco Shop Manager"");
			sSTCLegal = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_OWNER"",""STC Legal"");
			sOwnerPosition = sSalesAgent;
			if(sAccntType == sIndivLOV)
			{
				if(sPlanType == ""Prepaid"")
				{
					if(ToNumber(iprepaidcount) > 0 && ToNumber(iprepaidcount) < ToNumber(iIndivhigh))
					{
						sOwnerPosition = sSalesAgent;
					}
					else if(ToNumber(iprepaidcount) >= ToNumber(iIndivhigh))
					{
						sOwnerPosition = sSTCLegal;
						bApprovalReqFlag = ""Y"";
					}
			  	}
			  
				if(sPlanType == ""Postpaid"")
				{	
					if(ToNumber(ipostpaidcount) > 0 && ToNumber(ipostpaidcount) < ToNumber(iIndivlow))
					{
						sOwnerPosition = sSalesAgent;
					}
					else if(ToNumber(ipostpaidcount) >= ToNumber(iIndivlow) && ToNumber(ipostpaidcount) < ToNumber(iIndivhigh))
					{
						sOwnerPosition = sSalecoShopMgr;
						bApprovalReqFlag = ""Y"";
					}
					else if (ToNumber(ipostpaidcount) >= ToNumber(iIndivhigh))
					{
						sOwnerPosition = sSTCLegal;
						bApprovalReqFlag = ""Y"";
					}
				}
			}
			else if(sAccntType == sOrgLOV)
			{
				if(sPlanType == ""Prepaid"")
				{			
					if(ToNumber(iprepaidcount) > 0 && ToNumber(iprepaidcount) < ToNumber(iOrghigh))
					{
						sOwnerPosition = sSalesAgent;
					}
					else if(ToNumber(iprepaidcount) >= ToNumber(iOrghigh))
					{
						sOwnerPosition = sSTCLegal;
						bApprovalReqFlag = ""Y"";
					}
				}
				
				if(sPlanType == ""Postpaid"")
				{				
					if(ToNumber(ipostpaidcount) > 0 && ToNumber(ipostpaidcount) < ToNumber(iOrglow))
					{
						sOwnerPosition = sSalesAgent;
					}
					else if(ToNumber(ipostpaidcount) >= ToNumber(iOrglow) && ToNumber(ipostpaidcount) < ToNumber(iOrghigh))
					{
						sOwnerPosition = sSalecoShopMgr;
						bApprovalReqFlag = ""Y"";
					}
					else if (ToNumber(ipostpaidcount) >= ToNumber(iOrghigh))
					{
						sOwnerPosition = sSTCLegal;
						bApprovalReqFlag = ""Y"";
					}
				}	
			}
			with (bcLOV)
			{
				ActivateField(""Value"");
				ActivateField(""Description"");
				SetViewMode(AllView);
				ClearToQuery();
				//SetSearchSpec(""Type"",""STC_CUST_TYPE"");
				sSearchExpr  = ""[Type] = '"" + ""STC_ORDER_OWNER"" + ""' AND "" + ""[Value] ='"" + sOwnerPosition + ""'"";
				SetSearchExpr(sSearchExpr);
				ExecuteQuery(ForwardOnly);
				
				if(FirstRecord())
				{
					sOwnerPosition = GetFieldValue(""Description"");
				}
			}
			with (bcPosition)
			{
				ActivateField(""Name"");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchSpec(""Name"",sOwnerPosition);
				ExecuteQuery(ForwardOnly);
				
				if(FirstRecord())
				{
					sOwnerPostnId = GetFieldValue(""Id"");
				}
			}
		psOutputs.SetProperty(""sOwnerPostn"",sOwnerPosition);
		psOutputs.SetProperty(""bApprovalReqFlag"",bApprovalReqFlag);
				
	}
	catch(e)
	{
	}
	finally
	{
		bcPosition = null;
	 	bcLOV = null;
		boAccnt = null;
		boLOV = null;
		appObj = null;
	}
}
function GetConnections(Inputs, Outputs)
{
	var appObj;
	var icount;
	var psInputs;
	var psParent;
	var psChild;
	var stype;
	var ipostpaid;
	var iprepaid;
	var i;
	var sPlanType;
	var sinputmessage;
	try
	{
		appObj = TheApplication();
		with(appObj)
		{	
			psInputs = appObj.NewPropertySet();
			psParent = appObj.NewPropertySet();
		}
			iprepaid = 0;
			ipostpaid = 0;
			psInputs = Inputs.GetChild(0);
			icount = psInputs.GetChildCount();
			if(icount > 0)
			{
				psParent = psInputs.GetChild(0).GetChild(0);
				stype = psParent.GetType();
				if(stype == ""ListOfCUT Service Sub Accounts"")
				{
					icount = psParent.GetChildCount();
					for(i=0;i<icount;i++)
					{
						psChild = psParent.GetChild(i);
						
						sPlanType = psChild.GetProperty(""STC Pricing Plan Type"");
						if(sPlanType == ""Prepaid"")
						{
							iprepaid++;
						}
						else if(sPlanType == ""Postpaid"")
						{
							ipostpaid++;
						}
					}
					
				}
			}
		Outputs.SetProperty(""Prepaid Count"",iprepaid);
		Outputs.SetProperty(""Postpaid Count"",ipostpaid);
		
	}
	catch(e)
	{
	}
	finally
	{
		psInputs = null;
		appObj = null;
	}
}
function OrderApproval(Inputs, Outputs)
{
	var psInputs;
	var psOutputs;
	var appObj;
	var sAccntType;
	var sinputmessage;
	var icount;
	var iprepaidcount;
	var ipostpaidcount;
	var sOwnerPosition;
	var bApprovalReqFlag;
	var sPlanType;
	var sOrderId;
	try
	{
		appObj = TheApplication();
		with(appObj)
		{	
			psInputs = appObj.NewPropertySet();
			psOutputs = appObj.NewPropertySet();
		}
		icount = Inputs.GetChildCount();
		sAccntType = Inputs.GetProperty(""Account Type"");
		sOrderId = Inputs.GetProperty(""Order Id"");
		sPlanType = Inputs.GetProperty(""Plan Type"");
		psInputs = Inputs.GetChild(0);
		GetConnections(psInputs, psOutputs);
		
		iprepaidcount= psOutputs.GetProperty(""Prepaid Count"");
		ipostpaidcount = psOutputs.GetProperty(""Postpaid Count"");
		
		psInputs.SetProperty(""sAccntType"",sAccntType);
		psInputs.SetProperty(""iprepaidcount"",iprepaidcount);
		psInputs.SetProperty(""ipostpaidcount"",ipostpaidcount);
		psInputs.SetProperty(""sPlanType"",sPlanType);		
		ApprovalRequired(psInputs,psOutputs);
		
		sOwnerPosition = psOutputs.GetProperty(""sOwnerPostn"");
		bApprovalReqFlag = psOutputs.GetProperty(""bApprovalReqFlag"");
		
		Outputs.SetProperty(""Owner PostnId"",sOwnerPosition);
		Outputs.SetProperty(""Approval ReqFlag"",bApprovalReqFlag);
		if(bApprovalReqFlag == ""Y"")
		{
			psInputs.SetProperty(""Order Id"",sOrderId);
			psInputs.SetProperty(""Owner Postn"",sOwnerPosition);
			UpdateOrder(psInputs,psOutputs);
		}
		
	}
	catch(e)
	{
	}
	finally
	{
	}

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
var ireturn;
try
{
	ireturn = ContinueOperation;
	switch(MethodName)
	{
		case ""OrderApprovalSTC"":
			OrderApproval(Inputs, Outputs);		
			ireturn = CancelOperation;
			break;
			
		case ""UpdateOrder"":
			UpdateOrder(Inputs, Outputs);		
			ireturn = CancelOperation;
			break;
			
		default:
			ireturn = ContinueOperation;
	}
	return(ireturn);
}
catch(e)
{
}
finally
{
	//sErrorMsg = """";
//sErrorCode ="""";
}	
	
}
function UpdateOrder(Inputs,Outputs)
{
	var sOrderId;
	var sOwnerPosition;
	var bcassocPosition;
	var bcmvgPosition;
	var boOrder;
	var bcOrder;
	var bcOrderLineItem;
	var appObj;
	var isRec;
	var isRecord;
	try
	{
		appObj = TheApplication();
		with(appObj)
		{
			sOrderId = Inputs.GetProperty(""Order Id"");
			sOwnerPosition = Inputs.GetProperty(""Owner Postn"");
			if(sOrderId != """" && sOrderId != null)
			{
				boOrder = appObj.GetBusObject(""Order Entry (Sales)"");
				bcOrder = boOrder.GetBusComp(""Order Entry - Orders"");
				bcOrderLineItem = boOrder.GetBusComp(""Order Entry - Line Items"");
				with (bcOrder)
				{
					ActivateField (""Status"");
					ActivateField (""STC Order Sub Status"");
					SetViewMode(AllView);
					ClearToQuery();
					SetSearchSpec(""Id"",sOrderId);
					ExecuteQuery(ForwardOnly);
					
					if(FirstRecord())
					{
						bcmvgPosition = bcOrder.GetMVGBusComp(""Sales Team"");
						bcassocPosition = bcmvgPosition.GetAssocBusComp();
						with(bcmvgPosition)
						{
							ClearToQuery();
							ActivateField (""Name"");
							SetSearchSpec(""Name"",sOwnerPosition);
							ExecuteQuery();
							isRecord = FirstRecord();
							if(!isRecord)
							{
								with(bcassocPosition)
								{
									ClearToQuery();
									ActivateField (""Name"");
									SetSearchSpec(""Name"",sOwnerPosition);
									ExecuteQuery();
									isRec = FirstRecord();
									
									if(isRec)
									{
										Associate(NewAfter);
									}
									
								}
							}
							SetFieldValue(""SSA Primary Field"",""Y"");
							WriteRecord(); 
						
						}
						SetFieldValue(""Status"",appObj.InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""Pending""));
						SetFieldValue(""STC Order Sub Status"",appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Awaiting Approval""));
						WriteRecord();
					}
					with(bcOrderLineItem)
					{
						ActivateField (""Status"");
						SetViewMode(AllView);
						ClearToQuery();
						SetSearchSpec(""Order Header Id"",sOrderId);
						ExecuteQuery(ForwardOnly);
						isRecord = FirstRecord();
						while(isRecord)
						{
							SetFieldValue(""Status"",appObj.InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""Pending""));
							isRecord = NextRecord();
						}
					}
				}
			}
		}
	}
	catch(e)
	{
	}
	finally
	{
	}
}
function DeviceName(Inputs,Outputs)
{
	 var sBO, sBC, sExp, sRec, sDeviceName="""", i=""0"";
	 var sOrderId = Inputs.GetProperty(""OrderId"");
	 try 
	 {
	 	sBO = TheApplication().GetBusObject(""Order Entry (Sales)"");
		sBC = sBO.GetBusComp(""Order Entry - Line Items (Simple)"");
		with(sBC)
		{
			InvokeMethod(""SetAdminMode"", ""TRUE"") 
			ActivateField(""Product"");					
			sExp=""[Order Header Id]='""+sOrderId+""' AND [STC Service Description] = 'AddOnEquipment' AND [Action Code] = 'Add'""
			ClearToQuery();
			SetSearchExpr(sExp);
			ExecuteQuery(ForwardOnly);
			sRec = FirstRecord();
			while(sRec)
			{
				if(i==0)
					sDeviceName = GetFieldValue(""Product"");
				else
					sDeviceName = sDeviceName+"",""+GetFieldValue(""Product"");
				i++;
				sRec = NextRecord();
			}
		Outputs.SetProperty(""DeviceList"",sDeviceName);
		Outputs.SetProperty(""DeviceCount"",i);
		}
	  
	  return(CancelOperation);
	 }
	 catch(e)
	 {
	  throw(e.toString());
	 }
	 finally
	 {
		sBO = null;
		sBC = null;
	 }

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
 if(MethodName == ""DeviceName"")
 {
  DeviceName(Inputs,Outputs);
  return(CancelOperation);
 }
 
 
 return (ContinueOperation);

}
function AddToDate(sourceDate, nMonths, nDays, nHours, nMinutes, nSeconds, nsign)
 {

// Parameters : // sourceDate : Date object // nDays, nHours , nMinutes , nSeconds : Integer numbers // nsign : Can have two values : 1 or -1 // 1 indicates to ADD to the sourceDate // -1 indicates to SUBTRACT from the sourceDate // Returns : A date object, after adding/subtracting // ndays,hNours,nMinutes // and nseconds to the sourceDate. 
var retDate = sourceDate; 
retDate.setMonth(retDate.getMonth()+nsign*nMonths);
retDate.setDate(retDate.getDate()+nsign*nDays); 
retDate.setHours(retDate.getHours()+nsign*nHours); 
retDate.setMinutes(retDate.getMinutes()+nsign*nMinutes); 
retDate.setSeconds(retDate.getSeconds()+nsign*nSeconds); 
return (retDate);
}
function CheckBroadband(Inputs, Outputs)
{
var OrderId = Inputs.GetProperty(""Order Id"");
var AppObj:Application = TheApplication();
var OrderBO:BusObject = AppObj.GetBusObject(""Order Entry (Sales)"");
var OrderBC:BusComp = OrderBO.GetBusComp(""Order Entry - Orders"");
var OrderLineBC:BusComp = OrderBO.GetBusComp(""Order Entry - Line Items"");
var AccId;
var ErrMsg = """";
with(OrderBC)
{	
	SetViewMode(AllView);
	ActivateField(""Account Status"");
	ClearToQuery();
	SetSearchSpec(""Id"",OrderId);
	ExecuteQuery(ForwardOnly);
	var OrderRec = FirstRecord();
	if(OrderRec)
	{
		AccId = GetFieldValue(""Account Id"");
		
		with(OrderLineBC)
		{
				var Spec = ""[Order Header Id] = '""+ OrderId +""' AND [Action Code] = 'Add'  AND [Part Number] = 'STCBRPKG'"";
				SetViewMode(AllView);
				ActivateField(""Account Status"");
				ClearToQuery();
				SetSearchExpr(Spec);
				ExecuteQuery(ForwardOnly);
				var OrderLineRec = FirstRecord();
				if(OrderLineRec)
				{
					ErrMsg = CheckBroadbandaccount(AccId);
								
				}
				
						Outputs.SetProperty(""ErrorMsg"",ErrMsg);
	
		}//end of OrderLineBC	
	}//
}
}
function CheckBroadbandaccount(AccId)
{
var BillAccBO:BusObject = TheApplication().GetBusObject(""STC Billing Account""); 
var AccBC:BusComp = TheApplication().GetBusObject(""Account"").GetBusComp(""Account"");
var BillAccBC:BusComp = BillAccBO.GetBusComp(""CUT Invoice Sub Accounts"");
//var OrderBC:BusComp = BillAccBO.GetBusComp(""Order Entry - Orders"");
//var SerAccBC:BusComp = AccountBO.GetBusComp(""CUT Service Sub Accounts"");
var isAccRec;
var isBillRec;
var OrderRec;
var BillAccId;
var RouterCount:Number = 0;
var orderLineRec;
var Occupation;
var Limit;
with(AccBC)
{
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"",AccId);
		SetSearchSpec(""STC Contract Category"",""Employees"");
		ExecuteQuery(ForwardOnly);
		isAccRec = FirstRecord();
		if(isAccRec)
		{
		with(BillAccBC)
		{
			ActivateField(""Occupation"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Parent Account Id"",AccId);
			ExecuteQuery(ForwardOnly);
			isBillRec = FirstRecord();
			while(isBillRec)
			{
			BillAccId = GetFieldValue(""Id"");
			Occupation = GetFieldValue(""Occupation"");
			
			var OrderBC = TheApplication().GetBusObject(""Order Entry (Sales)"").GetBusComp(""Order Entry - Orders"");
				with(OrderBC)
				{
						var Searchspec = ""[Account Id] = '""+ AccId +""' AND ([Status] = 'Complete'  OR [Status] = 'In Progress' OR [Status] = 'Submitted')"";
					//	var Searchspec = ""[Billing Account Id] = '""+ BillAccId +""'"";
						SetViewMode(AllView);
						ClearToQuery();
						SetSearchExpr(Searchspec);
					//	SetSearchSpec(""Account Id"",AccId);
							ExecuteQuery(ForwardOnly);
						OrderRec = FirstRecord();
							while(OrderRec)
							{
							
									var OrderId = GetFieldValue(""Id"");
									var OrderLine = TheApplication().GetBusObject(""Order Entry (Sales)"").GetBusComp(""Order Entry - Line Items"");
									with(OrderLine)
									{
										var LineSpec = ""[Order Header Id] = '""+ OrderId +""' AND [Action Code] = 'Add'  AND [Product Description] LIKE '*Route*' "";
										SetViewMode(AllView);
										ClearToQuery();
										SetSearchExpr(LineSpec);
										ExecuteQuery(ForwardOnly);
										var OrdLineRec = FirstRecord();
											if(OrdLineRec)
											{
													RouterCount = RouterCount+1;
											}
									}
						    	OrderRec = NextRecord();
							}
					isBillRec = NextRecord();
				}	
			}//	if(isAccRec)
		}//with(AccountBC)
	}// end of isAccRec 
	var LovBC = TheApplication().GetBusObject(""List Of Values"").GetBusComp(""List Of Values"");
	with(LovBC)
	{
		var LovSpec = ""[Value] = '""+ Occupation +""' AND [Type] = 'STC_EMP_PLAN_LIMIT'"";
		ActivateField(""Target High"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchExpr(LovSpec);
		ExecuteQuery(ForwardOnly);
		var islovrec = FirstRecord();
		if(islovrec)
		{
			Limit = GetFieldValue(""Target High"");
		}
		
	}	
	
	if(Limit <= RouterCount)
	{
		return(""Reached Max Router count"");
	}
	else
	{
			return("""");
	}
}// end of Acc BC
}
function CreateServiceRequest(Inputs, Outputs)
{
var Tier1 = Inputs.GetProperty(""TierOne"");
var Tier2 = Inputs.GetProperty(""TierTwo"");
var Tier3 = Inputs.GetProperty(""TierThree"");
var AccId = Inputs.GetProperty(""SerAccId"");

var serReqBC = TheApplication().GetBusObject(""Service Request"").GetBusComp(""Service Request"");
with(serReqBC)
{
var time = new Date();
	NewRecord(1);
	SetFieldValue(""INS Product"", Tier1);
	SetFieldValue(""INS Area"", Tier2);
	SetFieldValue(""INS Sub-Area"", Tier3);
	SetFieldValue(""Description"", Tier1);
	SetFieldValue(""Account Id"", AccId);
	SetFieldValue(""Opened Date"", time);
	WriteRecord();
}
}
function DateToString(dDate) {

// Parameters : // dDate  : Date object // Returns : A string with the format ""mm/dd/yyyy"" or ""mm/dd/yyyy hh:mm:ss"" 

var sMonth = ToString(dDate.getMonth() + 1); 
if (sMonth.length == 1)
{
sMonth = ""0"" + sMonth;
} 
var sDay = ToString(dDate.getDate()); 
if (sDay.length == 1)
{
sDay = ""0"" + sDay;
} 
var sHours = ToString(dDate.getHours()); 
if (sHours.length == 1) 
{
sHours = ""0"" + sHours;
} 
var sMinutes = ToString(dDate.getMinutes());
if (sMinutes.length == 1)
{
sMinutes = ""0"" + sMinutes;
} 
var sSeconds = ToString(dDate.getSeconds());
if (sSeconds.length == 1) 
{
sSeconds = ""0"" + sSeconds;
} 
if (sHours == ""00"" && sMinutes == ""00"" && sSeconds == ""00"")
return (sMonth +""/""+ sDay +""/"" + dDate.getFullYear()) 
else
return (sMonth +""/""+ sDay +""/"" + dDate.getFullYear()); 
//return (sMonth +""/""+ sDay +""/"" + dDate.getFullYear() +"" ""+sHours+"":""+sMinutes+"":""+sSeconds);
}
function GetOrderItemAttribList(Inputs, Outputs)
{//[Modified By: NAVIN: 14Nov2021: LocalMins Numeric Value 3,000 fix]
	//var oApp = TheApplication();
	var oBO=null, oBC ="""", Name="""", Val="""", LineItemId = """", vSearchExpr="""", frec="""", fCnt=0;
	var vDataType="""", NumVal=0;
	try
	{
		LineItemId = Inputs.GetProperty(""LineItemId"");
		if(LineItemId != """")
		{
			oBO = TheApplication().GetBusObject(""Order Entry (Sales)"");
			oBC = oBO.GetBusComp(""Order Item XA (No Link)"");
			with(oBC)
			{
				ActivateField(""Display Name"");
				ActivateField(""Value"");
				ActivateField(""Data Type"");
				ActivateField(""Numeric Value"");
				SetViewMode(AllView);
				ClearToQuery();
				vSearchExpr = ""[Object Id]='""+LineItemId+""'"";
				SetSearchExpr(vSearchExpr);
				ExecuteQuery(ForwardOnly);
				frec = FirstRecord();
				fCnt = CountRecords();
				
				if(!frec)
					Outputs.SetProperty(""Error"",""Attributes not found"");
				while(frec)
				{
					Name = GetFieldValue(""Display Name"");
					vDataType = GetFieldValue(""Data Type"");
					
					if(vDataType == ""Number""){
						NumVal = ToNumber(GetFieldValue(""Numeric Value""));
						Outputs.SetProperty(Name, NumVal);
					}
					else{
						Val = GetFieldValue(""Value"");
						Outputs.SetProperty(Name, Val);
					}
							//outputs
					frec = NextRecord();
				}
			}
		}
		else
			Outputs.SetProperty(""Error"",""LineItemId input is null"");
	}
	catch(e)
	{
		Outputs.SetProperty(""Error"",e.toString());
	}
	finally
	{
		oBC=null;
		oBO=null;
		Outputs.SetProperty(""AttribCount"",fCnt);
	}
}
"
function HERetailDevInsValidation (Inputs, Outputs)
{//[NAVIN:12Feb2020:NewPostpaidHighEndPlans-DeviceInsurance]

	var boOrder=null, bcOrder=null, bcOli=null, bcOliSimple=null;
	var vOrderId="""", vDCBalance=0, vRootItemId="""", vDevPart="""", vDevAssetIntId="""", vDevPickedFlag="""", vInsuranceDevFlag="""";
	var vId, vSearchExpr="""", isRecord=false, vRecCount=0, isRecordDI=false, vRecCountDI=0, isRecordDCDisc=false, vRecCountDCDisc=0;
	var vDevInsItemId="""", vDevInsProd="""", vDevInsPrice=0, vDevInsPriceType="""", vDevInsPriceDC=0, vDevInsAmtTotal=0, vDCDiscAmountFinal=0;
	var vDCDiscPart="""", vDCDiscItemId="""", vDCDiscAmount=0;
	var vErrorFlag=""N"", vErrorCode=""0"", vErrorMessage=""SUCCESS"", vComments=""""; 

	try
	{
		with(Inputs){
			vOrderId = GetProperty(""Order Id"");
			vDCBalance = GetProperty(""Device Credit Balance"");
		}

		if(vDCBalance != """")
			vDCBalance = ToNumber(vDCBalance);
		else
			vDCBalance = 0;

		vDCDiscPart = TheApplication().InvokeMethod(""LookupValue"", ""STC_DEVICE_CREDIT_ADMIN"", ""DC_DISCOUNT_PROD_PART"");

		with(Outputs)
		{
			SetProperty(""Error Flag"", vErrorFlag);
			SetProperty(""Error Code"", vErrorCode);
			SetProperty(""Error Message"", vErrorMessage);
			SetProperty(""Comments"", vComments);
		}

		boOrder = TheApplication().GetBusObject(""Order Entry (Sales)"");
		with(boOrder)
		{
			bcOrder = GetBusComp(""Order Entry - Orders"");
			bcOli = GetBusComp(""Order Entry - Line Items"");
			bcOliSimple = GetBusComp(""Order Entry - Line Items (Simple)"");
		}
		with(bcOrder)
		{
			SetViewMode(AllView);
			ClearToQuery();
			vSearchExpr = ""[Id]='""+vOrderId+""'"";
			SetSearchExpr(vSearchExpr);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
			{   
				//Validate all the HE Retail Equipments and their respective Cash Device Insurance products:
				with(bcOli)
				{
					SetViewMode(AllView);
					ClearToQuery();
					ActivateField(""Order Header Id"");
					ActivateField(""STC Service Description"");
					ActivateField(""Asset Integration Id"");
					ActivateField(""STC Is Device Picked"");
					
					vSearchExpr = ""[Order Header Id]='""+vOrderId+""' AND [STC Plan Type]='RetailEquipment' AND [Action Code]<>'Delete'"";
					SetSearchExpr(vSearchExpr);
					ExecuteQuery(ForwardOnly);
					isRecord = FirstRecord();
					vRecCount = CountRecords();
					vComments = vComments + ""HE-Dev:""+vRecCount;
					while(isRecord)
					{   
						vDevPart = GetFieldValue(""Part Number"");
						vDevAssetIntId = GetFieldValue(""Asset Integration Id"");
						vDevPickedFlag = GetFieldValue(""STC Is Device Picked"");
						//vInsuranceDevFlag = TheApplication().InvokeMethod(""LookupValue"", ""STC_INSURANCE_DEVICES"", vDevPart);
						//vInsuranceDevFlag = vInsuranceDevFlag.substring(0, 6);

						if(vDevPickedFlag == ""Y"")
						{
							with(bcOliSimple)
							{
								SetViewMode(AllView);
								ClearToQuery();
								ActivateField(""Order Header Id"");
								ActivateField(""STC Contract Par Asset Integ Id"");
								ActivateField(""STC Parent Device Attribute"");
								ActivateField(""STC Parent Device Name"");
								ActivateField(""Product"");
								ActivateField(""Net Price"");
								ActivateField(""Price Type"");
								ActivateField(""STC HE Discount Amount"");

								vSearchExpr = ""[Order Header Id]='""+vOrderId+""' AND [STC Contract Par Asset Integ Id]='""+vDevAssetIntId+""' AND [Action Code]='Add'"";
								SetSearchExpr(vSearchExpr);
								ExecuteQuery(ForwardOnly);
								isRecordDI = FirstRecord();
								vRecCountDI = CountRecords();
								vComments = vComments + ""|HE-DI:""+vRecCountDI+""|"";
								if(isRecordDI)
								{
									vDevInsItemId = GetFieldValue(""Id"");
									vDevInsProd = GetFieldValue(""Product"");
									vDevInsPrice = ToNumber(GetFieldValue(""Net Price""));
									vDevInsPriceType = GetFieldValue(""Price Type"");
									vDevInsPriceDC = GetFieldValue(""STC HE Discount Amount"");
									
									if(vDevInsPriceType == ""One-Time"")
									{
										if(vDevInsPrice > 0 && (vDevInsPriceDC == null || vDevInsPriceDC == """"))
										{
											if(vDCBalance >= vDevInsPrice)
												vDevInsPriceDC = vDevInsPrice;
											else
												vDevInsPriceDC = vDCBalance;

											vDevInsAmtTotal = vDevInsAmtTotal + vDevInsPriceDC;
											SetFieldValue(""STC HE Discount Amount"", vDevInsPriceDC);
											WriteRecord();
										}//if(vDevInsPrice > 0)

									}//if(vDevInsPriceType == ""One-Time"")
									else{
										vErrorFlag = 'Y';
										vErrorCode = ""HE_DEVICE_INSURANCE_ERR1"";
										vErrorMessage = ""Only Cash Device Insurance is allowed with 'HE Retail EQuipment'!"";
									}

									if(vErrorCode == ""0"" && vDevInsAmtTotal > 0)
									{//Query and Update Total Device Insurance amount on 'HE Retail Device Discount Product'
										with(bcOliSimple) //bcOliSimple2
										{
											SetViewMode(AllView);
											ClearToQuery();
											ActivateField(""Order Header Id"");
											ActivateField(""Product"");
											ActivateField(""Net Price"");
											ActivateField(""Unit Price"");
											ActivateField(""STC HE Discount Amount"");

											vSearchExpr = ""[Order Header Id]='""+vOrderId+""' AND [Part Number]='""+vDCDiscPart+""' AND [Action Code]='Add'"";

											SetSearchExpr(vSearchExpr);
											ExecuteQuery(ForwardOnly);
											isRecordDCDisc = FirstRecord();
											vRecCountDCDisc = CountRecords();
											vComments = vComments + ""|HE-DCDisc:""+vRecCountDCDisc+""|"";
											if(isRecordDCDisc)
											{
												vDCDiscItemId = GetFieldValue(""Id"");
												vDCDiscAmount = -1 * ToNumber(GetFieldValue(""Net Price""));
												vDCDiscAmountFinal = -1 * (vDCDiscAmount + vDevInsAmtTotal);
												
												SetFieldValue(""Net Price"", vDCDiscAmountFinal);
												SetFieldValue(""Unit Price"", vDCDiscAmountFinal);
												SetFieldValue(""STC HE Discount Amount"", vDevInsAmtTotal);
												WriteRecord();
											}//if(isRecordDCDisc)
										}//with(bcOliSimple2)
									}//if(vErrorCode == ""0""

								}//if(isRecordDI)
							}//with (bcOliSimple)
						}//if(vDevPickedFlag == ""Y"")

						isRecord = NextRecord();
					}
				}//with (bcOli)

			}//if(FirstRecord())
		}//with(bcOrder)
		with(Outputs)
		{
			SetProperty(""Error Flag"", vErrorFlag);
			SetProperty(""Error Code"", vErrorCode);
			SetProperty(""Error Message"", vErrorMessage);
			SetProperty(""Comments"", vComments);
		}
	}
	catch(e)
	{
		//throw (e);
		with(Outputs)
		{
			SetProperty(""Error Flag"", ""Y"");
			SetProperty(""Error Code"", e.errCode);
			SetProperty(""Error Message"", e.errText);
			SetProperty(""Comments"", vComments);
		}
	}
	finally
	{
		bcOrder=null; bcOli=null; bcOliSimple=null;
		boOrder=null;
	}
}
function NewDeviceInsuranceDelete (Inputs, Outputs)
{//[NAVIN:12Feb2020:Eshop_Reprice-NewDeviceInsurance-Descoped]

	var boOrder=null, bcOrder=null, bcOli=null, bcOliSimple=null, bcOliMACD=null;
	var vOrderId="""", vRootItemId="""", vDevPart="""", vDevAssetIntId="""", vDevPickedFlag="""", vInsuranceDevFlag="""", vDevInsItemId="""";
	var vId, vSearchExpr="""", isRecord=false, isRecordDI=false, vRecCount=0, vRecCountDI=0, isRecDIChild=false, vRecCountDIChild=0;
	var vErrorCode=""0"", vErrorMessage=""SUCCESS"", vComments=""""; 

	try
	{
		vOrderId = Inputs.GetProperty(""Order Id"");
		with(Outputs)
		{
			SetProperty(""Error Code"", vErrorCode);
			SetProperty(""Error Message"", vErrorMessage);
			SetProperty(""Comments"", vComments);
		}

		boOrder = TheApplication().GetBusObject(""Order Entry (Sales)"");
		with(boOrder)
		{
			bcOrder = GetBusComp(""Order Entry - Orders"");
			bcOli = GetBusComp(""Order Entry - Line Items"");
			bcOliSimple = GetBusComp(""Order Entry - Line Items (Simple)"");
			bcOliMACD = GetBusComp(""MACD Order Entry - Line Items"");
		}
		with(bcOrder)
		{
			SetViewMode(AllView);
			ClearToQuery();
			vSearchExpr = ""[Id]='""+vOrderId+""'"";
			SetSearchExpr(vSearchExpr);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
			{   
				//Delete all the Device Insurance products for which Device Addons are being deleted:
				with(bcOli)
				{
					SetViewMode(AllView);
					ClearToQuery();
					ActivateField(""Order Header Id"");
					ActivateField(""STC Service Description"");
					ActivateField(""Asset Integration Id"");
					ActivateField(""STC Is Device Picked"");
					ActivateField(""Action Code"");
					
					vSearchExpr = ""[Order Header Id]='""+vOrderId+""' AND [STC Service Description]='AddOnEquipment' AND [Action Code]='Delete'"";
					SetSearchExpr(vSearchExpr);
					ExecuteQuery(ForwardOnly);
					isRecord = FirstRecord();
					vRecCount = CountRecords();
					vComments = vComments + ""Device:""+vRecCount;
					while(isRecord)
					{   
						vDevPart = GetFieldValue(""Part Number"");
						vDevAssetIntId = GetFieldValue(""Asset Integration Id"");
						vDevPickedFlag = GetFieldValue(""STC Is Device Picked"");
						vInsuranceDevFlag = TheApplication().InvokeMethod(""LookupValue"", ""STC_INSURANCE_DEVICES"", vDevPart);
						vInsuranceDevFlag = vInsuranceDevFlag.substring(0, 6);

						if(vInsuranceDevFlag == ""DEVICE"" && vDevPickedFlag == ""Y"")
						{
							with(bcOliSimple)
							{
								SetViewMode(AllView);
								ClearToQuery();
								ActivateField(""Order Header Id"");
								ActivateField(""STC Contract Par Asset Integ Id"");
								ActivateField(""STC Parent Device Attribute"");
								ActivateField(""STC Parent Device Name"");
								ActivateField(""Action Code"");

								vSearchExpr = ""[Order Header Id]='""+vOrderId+""' AND [STC Contract Par Asset Integ Id]='""+vDevAssetIntId+""' AND [Action Code]<>'Delete'"";
								SetSearchExpr(vSearchExpr);
								ExecuteQuery(ForwardOnly);
								isRecordDI = FirstRecord();
								vRecCountDI = CountRecords();
								vComments = vComments + ""|DI:""+vRecCountDI;
								while(isRecordDI)
								{
									vDevInsItemId = GetFieldValue(""Id"");
									SetFieldValue(""Action Code"", ""Delete"");
									WriteRecord();

									with(bcOliMACD)
									{
										SetViewMode(AllView);
										ClearToQuery();
										ActivateField(""Order Header Id"");
										ActivateField(""STC Contract Par Asset Integ Id"");
										ActivateField(""STC Parent Device Attribute"");
										ActivateField(""STC Parent Device Name"");
										ActivateField(""Action Code"");

										vSearchExpr = ""[Order Header Id]='""+vOrderId+""' AND [Parent Order Item Id]='""+vDevInsItemId+""' AND [Action Code]<>'Delete'"";
										SetSearchExpr(vSearchExpr);
										ExecuteQuery(ForwardOnly);
										isRecDIChild = FirstRecord();
										vRecCountDIChild = CountRecords();
										vComments = vComments + ""|DIChild:""+vRecCountDIChild+""|"";
										while(isRecDIChild)
										{
											SetFieldValue(""Action Code"", ""Delete"");
											WriteRecord();

											isRecDIChild = NextRecord();
										}//while(isRecDIChild)
									}//with (bcOliMACD)

									isRecordDI = NextRecord();
								}//while(isRecordDI)
							}//with (bcOliSimple)
						}//if(vInsuranceDevFlag == ""DEVICE""

						isRecord = NextRecord();
					}//while(isRecord)
				}//with (bcOli)

			}//if(FirstRecord())
		}//with(bcOrder)
		with(Outputs)
		{
			SetProperty(""Error Code"", vErrorCode);
			SetProperty(""Error Message"", vErrorMessage);
			SetProperty(""Comments"", vComments);
		}
	}
	catch(e)
	{
		//throw e;
		with(Outputs)
		{
			SetProperty(""Error Code"", e.errCode);
			SetProperty(""Error Message"", e.errText);
			SetProperty(""Comments"", vComments);
		}
	}
	finally
	{
		bcOrder=null; bcOli=null; bcOliSimple=null; bcOliMACD=null;
		boOrder=null;
	}
}
function NewDeviceInsuranceValidation (Inputs, Outputs)
{//[NAVIN:12Jan2020:Eshop_Reprice-NewDeviceInsurance]

	var boOrder=null, bcOrder=null, bcOli=null, bcOliSimple=null;
	var vOrderId="""", vRootItemId="""", vDevPart="""", vDevAssetIntId="""", vDevPickedFlag="""", vInsuranceDevFlag="""";
	var vId, vSearchExpr="""", isRecord=false, isRecordDI=false, vRecCount=0, vRecCountDI=0;
	var vErrorCode=""0"", vErrorMessage=""SUCCESS"", vComments="""", vComments2=""""; 
	var vRecCountEligDev=0, vDevLineId="""", vDevProd="""", vDevProdAttr="""", vDevInsLineId="""";
	try
	{
		vOrderId = Inputs.GetProperty(""Order Id"");
		with(Outputs)
		{
			SetProperty(""Error Code"", vErrorCode);
			SetProperty(""Error Message"", vErrorMessage);
			SetProperty(""Comments"", vComments);
			SetProperty(""CommentsDelete"", vComments2);
		}

		boOrder = TheApplication().GetBusObject(""Order Entry (Sales)"");
		with(boOrder)
		{
			bcOrder = GetBusComp(""Order Entry - Orders"");
			bcOli = GetBusComp(""Order Entry - Line Items"");
			bcOliSimple = GetBusComp(""Order Entry - Line Items (Simple)"");
		}
		with(bcOrder)
		{
			SetViewMode(AllView);
			ClearToQuery();
			vSearchExpr = ""[Id]='""+vOrderId+""'"";
			SetSearchExpr(vSearchExpr);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
			{   
				//Validate all the Device Addons and their respective Device Insurance products are linked or not
				with(bcOli)
				{
					SetViewMode(AllView);
					ClearToQuery();
					ActivateField(""Order Header Id"");
					ActivateField(""STC Service Description"");
					ActivateField(""Asset Integration Id"");
					ActivateField(""STC Is Device Picked"");
					ActivateField(""Product"");
					ActivateField(""Color"");
					
					vSearchExpr = ""[Order Header Id]='""+vOrderId+""' AND [STC Service Description]='AddOnEquipment' AND [Action Code]='Add'"";
					SetSearchExpr(vSearchExpr);
					ExecuteQuery(ForwardOnly);
					isRecord = FirstRecord();
					vRecCount = CountRecords();
					vComments = vComments + ""|Record Count Device:""+vRecCount;
					while(isRecord)
					{   
						vDevPart = GetFieldValue(""Part Number"");
						vInsuranceDevFlag = TheApplication().InvokeMethod(""LookupValue"", ""STC_INSURANCE_DEVICES"", vDevPart);
						vInsuranceDevFlag = vInsuranceDevFlag.substring(0, 6);

						if(vInsuranceDevFlag == ""DEVICE"")
						{
							vRecCountEligDev += 1;
							vDevAssetIntId = GetFieldValue(""Asset Integration Id"");
							vDevPickedFlag = GetFieldValue(""STC Is Device Picked"");
							vDevLineId = GetFieldValue(""Id"");
							vDevProd = GetFieldValue(""Product"");
							vDevProdAttr = GetFieldValue(""Color"");
							with(bcOliSimple)
							{
								SetViewMode(AllView);
								ClearToQuery();
								ActivateField(""Order Header Id"");
								ActivateField(""STC Contract Par Asset Integ Id"");
								ActivateField(""STC Parent Device Name"");
								ActivateField(""STC Parent Device Attribute"");

								vSearchExpr = ""[Order Header Id]='""+vOrderId+""' AND [STC Contract Par Asset Integ Id]='""+vDevAssetIntId+""' AND [Action Code]='Add'"";
								SetSearchExpr(vSearchExpr);
								ExecuteQuery(ForwardOnly);
								isRecordDI = FirstRecord();
								vRecCountDI = CountRecords();
								vComments = vComments + ""|Record Count DI:""+vRecCountDI;
								if(!isRecordDI)
								{
									if(vDevPickedFlag == ""Y"")
									{
										bcOli.SetFieldValue(""STC Is Device Picked"", """");
                                        bcOli.WriteRecord();
									}
									vErrorCode = ""NEW_DEVICE_INSURANCE_ERR1"";
									vErrorMessage = ""Please select the relevant Device Insurance product against the required Device Addons to proceed with order validation!"";
								}//if(!isRecordDI)
								else
									vDevInsLineId = GetFieldValue(""Id"");

							}//with (bcOliSimple)
						}//if(vInsuranceDevFlag == ""DEVICE"")

						isRecord = NextRecord();
					}

					if(vErrorCode == ""NEW_DEVICE_INSURANCE_ERR1"")
					{//[NAVIN:25Mar2020:NewPostpaidULPlans_Device-InsuranceAutoLink]

						if(vRecCountEligDev == 1 && vDevLineId != """")
						{
							with(bcOliSimple) 
							{//Update Device Insurance mapping
								SetViewMode(AllView);
								ClearToQuery();
								ActivateField(""Order Header Id"");
								ActivateField(""Part Number"");
								ActivateField(""STC Contract Par Asset Integ Id"");
								ActivateField(""STC Parent Device Name"");
								ActivateField(""STC Parent Device Attribute"");
								
								vSearchExpr = ""[Order Header Id]='""+vOrderId+""' AND [STC Contract Par Asset Integ Id] IS NULL AND [Action Code]='Add' AND [Part Number] LIKE 'DEVICEINSURANCE*'"";
								SetSearchExpr(vSearchExpr);
								ExecuteQuery(ForwardOnly);
								isRecordDI = FirstRecord();
								vRecCountDI = CountRecords();
								vComments = vComments + ""|Record Count DI:""+vRecCountDI;
								vComments2 = vDevAssetIntId+"":""+vDevProd+"":""+vDevProdAttr;
								if(isRecordDI && vRecCountDI == 1)
								{
									vDevInsLineId = GetFieldValue(""Id"");

									SetFieldValue(""STC Contract Par Asset Integ Id"", vDevAssetIntId);
									SetFieldValue(""STC Parent Device Name"", vDevProd);
									SetFieldValue(""STC Parent Device Attribute"", vDevProdAttr);
									WriteRecord();
								
									vErrorCode = ""0"";
									vErrorMessage = ""SUCCESS"";
								}//if(!isRecordDI)
							}//End Update Device Insurance mapping

							if(vRecCountDI == 1)
							{
								with(bcOliSimple)
								{//Update Device selection
									SetViewMode(AllView);
									ClearToQuery();
									ActivateField(""Order Header Id"");
									ActivateField(""STC Service Description"");
									ActivateField(""Asset Integration Id"");
									ActivateField(""STC Is Device Picked"");
									ActivateField(""Product"");
									ActivateField(""Color"");
									
									vSearchExpr = ""[Id]='""+vDevLineId+""'"";
									SetSearchExpr(vSearchExpr);
									ExecuteQuery(ForwardOnly);
									isRecord = FirstRecord();
									vComments2 = vComments2 +"":""+ isRecord;
									if(isRecord)
									{
										vDevAssetIntId = GetFieldValue(""Asset Integration Id"");
										vDevProd = GetFieldValue(""Product"");
										vDevProdAttr = GetFieldValue(""Color"");

										SetFieldValue(""STC Is Device Picked"", ""Y"");
										WriteRecord();
									}
								}//End Update Device selection
							}//End if(vRecCountDI == 1)
						}
					}//if(vErrorCode == ""NEW_DEVICE_INSURANCE_ERR1"")
					
				}//with (bcOli)

			/*This requirement is Descoped:
				//Validate if Device Addons and their respective Device Insurance products both are being deleted or not
				if(vErrorCode == ""0"" || vErrorCode == """")
				{
					with(bcOli)
					{
						SetViewMode(AllView);
						ClearToQuery();
						ActivateField(""Order Header Id"");
						ActivateField(""STC Service Description"");
						ActivateField(""Asset Integration Id"");
						ActivateField(""STC Is Device Picked"");
						
						vSearchExpr = ""[Order Header Id]='""+vOrderId+""' AND [STC Service Description]='AddOnEquipment' AND [Action Code]='Delete'"";
						SetSearchExpr(vSearchExpr);
						ExecuteQuery(ForwardOnly);
						isRecord = FirstRecord();
						vRecCount = CountRecords();
						vComments2 = vComments2 + ""|Record Count Device:""+vRecCount;
						while(isRecord)
						{   
							vDevPart = GetFieldValue(""Part Number"");
							vDevAssetIntId = GetFieldValue(""Asset Integration Id"");
							vDevPickedFlag = GetFieldValue(""STC Is Device Picked"");
							vInsuranceDevFlag = TheApplication().InvokeMethod(""LookupValue"", ""STC_INSURANCE_DEVICES"", vDevPart);
							vInsuranceDevFlag = vInsuranceDevFlag.substring(0, 6);

							if(vInsuranceDevFlag == ""DEVICE"")
							{
								with(bcOliSimple)
								{
									SetViewMode(AllView);
									ClearToQuery();
									ActivateField(""Order Header Id"");
									ActivateField(""STC Contract Par Asset Integ Id"");
									ActivateField(""STC Parent Device Attribute"");
									ActivateField(""STC Parent Device Name"");

									vSearchExpr = ""[Order Header Id]='""+vOrderId+""' AND [STC Contract Par Asset Integ Id]='""+vDevAssetIntId+""' AND [Action Code]<>'Delete'"";
									SetSearchExpr(vSearchExpr);
									ExecuteQuery(ForwardOnly);
									isRecordDI = FirstRecord();
									vRecCount = CountRecords();
									vComments2 = vComments2 + ""|Record Count DI No Del:""+vRecCount;
									if(isRecordDI)
									{
										vErrorCode = ""NEW_DEVICE_INSURANCE_DEL_ERR2"";
										vErrorMessage = ""Please Delete the linked Device Insurance product with the Device Addons being deleted to proceed with order validation!"";
									}//if(!isRecordDI)
								}//with (bcOliSimple)
							}//if(vInsuranceDevFlag == ""DEVICE"")

							isRecord = NextRecord();
						}
					}//with (bcOli)
				}//if(vErrorCode == ""0""
			*/

			}//if(FirstRecord())
		}//with(bcOrder)
		with(Outputs)
		{
			SetProperty(""Error Code"", vErrorCode);
			SetProperty(""Error Message"", vErrorMessage);
			SetProperty(""Comments"", vComments);
			SetProperty(""CommentsDelete"", vComments2);
		}
	}
	catch(e)
	{
		//throw e;
		with(Outputs)
		{
			SetProperty(""Error Code"", e.errCode);
			SetProperty(""Error Message"", e.errText);
			SetProperty(""Comments"", vComments);
			SetProperty(""CommentsDelete"", vComments2);
		}
	}
	finally
	{
		bcOrder=null; bcOli=null; bcOliSimple=null;
		boOrder=null;
	}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	try
	{
		switch(MethodName)
		{
			case ""Update Suspend Status"":
				UpdateSuspendStatus(Inputs, Outputs);
				return(CancelOperation);
				break;

			case ""UpdateNumberPortOut"":
				UpdateNumberPortOut(Inputs, Outputs);
				return(CancelOperation);
				break;

			case ""Update Service Length Date"":
				UpdateServiceLength(Inputs, Outputs);
				return(CancelOperation);
				break;

			case ""Update Service Length DateAsset"":
				UpdateServiceLengthAsset(Inputs, Outputs);
				return(CancelOperation);
				break;

			case ""Check Broadband"":
				CheckBroadband(Inputs, Outputs);
				return(CancelOperation);
				break;

			case ""UpdateSpecRateItems"":
				UpdateSpecRateItems(Inputs, Outputs);
				return(CancelOperation);
				break;

			case ""CreateServiceRequest"":
				CreateServiceRequest(Inputs, Outputs);
				return(CancelOperation);
				break;

			case ""NewDeviceInsuranceValidation"":
				NewDeviceInsuranceValidation(Inputs, Outputs);
				return(CancelOperation);
				break;

			case ""NewDeviceInsuranceDelete"":
				NewDeviceInsuranceDelete(Inputs, Outputs);
				return(CancelOperation);
				break;

			case ""HERetailDevInsValidation"":
				HERetailDevInsValidation(Inputs, Outputs);
				return(CancelOperation);
				break;

			case ""GetOrderItemAttribList"":
				GetOrderItemAttribList(Inputs, Outputs);
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
function UpdateNumberPortOut(Inputs, Outputs)
{
var MSISDN = Inputs.GetProperty(""MSISDN"");
var boNumberMaster:BusObject		  = TheApplication().GetBusObject(""RMS NM Number Enquiry"");
var bcNumberMaster:BusComp 	          = boNumberMaster.GetBusComp(""RMS NM Number Enquiry For Update""); // RMS NM Number Enquiry 

with(bcNumberMaster)
{
		ActivateField(""Status"");
		ActivateField(""Allocated To"");
		ClearToQuery();
		SetSearchSpec(""Number String"", MSISDN);
		ExecuteQuery();
		if(FirstRecord())
		{
			SetFieldValue(""Status"",TheApplication().InvokeMethod(""LookupValue"",""NM_NUMBER_STATUS"",""TRASHED""));
			SetFieldValue(""Allocated To"","""");
			WriteRecord();
		}
}

}
function UpdateServiceLength(Inputs,Outputs)
{
var OrderId = Inputs.GetProperty(""OrderId"");
var AppObj = TheApplication();
var OrderBC = AppObj.GetBusObject(""Order Entry (Sales)"").GetBusComp(""Order Entry - Orders"");
var OrdLineBC = AppObj.GetBusObject(""Order Entry (Sales)"").GetBusComp(""Order Entry - Line Items"");
var SerLen;
var SerUOM;
with(OrderBC)
{
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"",OrderId);
		ExecuteQuery(ForwardOnly);
		if(FirstRecord())
		{
			with(OrdLineBC)
			{
				ActivateField(""STC Prod Service Length"");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchSpec(""Order Header Id"",OrderId);
				ExecuteQuery(ForwardOnly);
				var IsOrdLineRec = FirstRecord();
				while(IsOrdLineRec)
				{
					SerLen = GetFieldValue(""STC Prod Service Length"");
					SerUOM = GetFieldValue(""STC Prod Service Length UOM"");
					var RecId = GetFieldValue(""Id"");
					if(SerLen != """")
					{
						var CurrDate = new Date();
						if( SerUOM == ""Months"")
						{
							var EndDate = AddToDate(CurrDate, SerLen, 0, 0, 0, 0, +1);
						}
						else if( SerUOM == ""Days"")
						{
							var EndDate = AddToDate(CurrDate, 0, SerLen, 0, 0, 0, +1);
						}
						var StrDate = DateToString(EndDate);
					//	var StrDate = ToString(EndDate);
					//	SetFieldValue(""ATP Message"",StrDate);
						SetFieldValue(""Service End Date"",StrDate);
						WriteRecord();
					}
					IsOrdLineRec = NextRecord();
				}
			}
		}// end of If	
}

}
function UpdateServiceLengthAsset(Inputs,Outputs)
{
var OrderId = Inputs.GetProperty(""OrderId"");
var AppObj = TheApplication();
var OrderBC = AppObj.GetBusObject(""Order Entry (Sales)"").GetBusComp(""Order Entry - Orders"");
var OrdLineBC = AppObj.GetBusObject(""Order Entry (Sales)"").GetBusComp(""Order Entry - Line Items"");
var SerLen;
var SerUOM;
with(OrderBC)
{
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"",OrderId);
		ExecuteQuery(ForwardOnly);
		if(FirstRecord())
		{
			with(OrdLineBC)
			{
				ActivateField(""STC Prod Service Length"");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchSpec(""Order Header Id"",OrderId);
				ExecuteQuery(ForwardOnly);
				var IsOrdLineRec = FirstRecord();
				while(IsOrdLineRec)
				{
					SerLen = GetFieldValue(""STC Prod Service Length"");
					SerUOM = GetFieldValue(""STC Prod Service Length UOM"");
					var RecId = GetFieldValue(""Id"");
					if(SerLen != """")
					{
						var CurrDate = new Date();
						if( SerUOM == ""Months"")
						{
							var EndDate = AddToDate(CurrDate, SerLen, 0, 0, 0, 0, +1);
						}
						else if( SerUOM == ""Days"")
						{
							var EndDate = AddToDate(CurrDate, 0, SerLen, 0, 0, 0, +1);
						}
						var StrDate = DateToString(EndDate);
					//	var StrDate = ToString(EndDate);
					//	SetFieldValue(""ATP Message"",StrDate);
						SetFieldValue(""Service End Date"",StrDate);
						WriteRecord();
					}
					IsOrdLineRec = NextRecord();
				}
			}
		}// end of If	
}

}
function UpdateSpecRateItems(Inputs,Outputs)
{
var SpecRateId = Inputs.GetProperty(""RateId"");
var SpecRec;
var SpecListRec;
var specBO = TheApplication().GetBusObject(""SWI Special Rating List"");
var SpecBC = specBO.GetBusComp(""SWI Special Rating List"");
var SpecItem = specBO.GetBusComp(""SWI Special Rating List Items"");
with(SpecBC)
{
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"",SpecRateId);
		ExecuteQuery(ForwardOnly);
		SpecRec = FirstRecord();
		if(SpecRec)
		{
			with(SpecItem)
			{
				ActivateField(""Inactive Flag"");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchSpec(""Special Rating List Id"",SpecRateId);
				ExecuteQuery(ForwardOnly);
				SpecListRec = FirstRecord();
				while(SpecListRec)
				{
					if(GetFieldValue(""Inactive Flag"") == ""N"")
					{
						SetFieldValue(""Status"",""Provisioned"");
						WriteRecord();
					}
					else
					{
						SetFieldValue(""Status"",""DeProvisioned"");
						WriteRecord();
					}
					
					SpecListRec = NextRecord();
				}
				
			}
		}
}
	
}
function UpdateSuspendStatus(Inputs,Outputs)
{
var AccntBO = TheApplication().GetBusObject(""STC Service Account"");
var SerBC = AccntBO.GetBusComp(""CUT Service Sub Accounts"");
var AccountId = Inputs.GetProperty(""AccountId"");
with(SerBC)
{
				SetViewMode(AllView);
				ActivateField(""Account Status"");
				ClearToQuery();
				SetSearchSpec(""Id"",AccountId);
				ExecuteQuery(ForwardOnly);
			   if(FirstRecord())
				{
					SetFieldValue(""Account Status"",""Active"");
					WriteRecord();
				}// end of If		
}
}
"var sErrorMsg = """";
var sErrorCode = """";
"
function CheckAdvPayment(sOrderId,sAdvPay,NumIns,NRCtotal)
{
	var appObj;
	var boPayment;
	var bcPayment;
	var spec;	
	var sAdvPayment;
	var sdvPayment1=""0"";
	var OrderPayment1=""0"";
	var NumInsPayment=""0""; 
	var NumInsPayment1=""0""; 
	var sdvPayment;
	var sTranAmount;
	var AdvCount=""0"";
	try
	{
		appObj = TheApplication();
		boPayment = appObj.GetBusObject(""Order Entry (Sales)"");
		bcPayment = boPayment.GetBusComp(""Payments"");
if(NumIns!=""0"" || sAdvPay!=""0"")// || NRCtotal !=""0"")
{			
		with(bcPayment)
		{
			SetViewMode(AllView);
			ActivateField(""Order Id"");
			ActivateField(""Payment Status""); 
			ActivateField(""STC Payment Type""); 
			ActivateField(""STC Num of Inst"");
			ActivateField(""STC Advance Payment"");
			ActivateField(""STC Payment Type"");	
			ClearToQuery(); 
			SetSearchSpec(""Order Id"",sOrderId);
			ExecuteQuery(ForwardOnly);
			var isrec = FirstRecord();			
				while(isrec)
				{
					var sPayStatus = GetFieldValue(""Payment Status"");
                    NumInsPayment=GetFieldValue(""STC Num of Inst"");
					sdvPayment=GetFieldValue(""STC Advance Payment"");
					sTranAmount=GetFieldValue(""Transaction Amount"");
					var Type =GetFieldValue(""STC Payment Type"");
						if(Type==""Advance Payment"")
						{
						sdvPayment1 =ToNumber(sdvPayment1) + ToNumber(sTranAmount);
						NumInsPayment1=ToNumber(NumInsPayment1) + ToNumber(NumInsPayment);	
					    AdvCount++;									 
						}//sdvPayment
						if(Type==""Order Payment"")
						{
						var OrderPayment1= ToNumber(OrderPayment1) + ToNumber(sTranAmount);
						}					
					isrec = NextRecord();
				}//whileisrec						
			if(sAdvPay!=sdvPayment1)
			{
			//appObj.RaiseErrorText(""Advance Payment is not Equal to Order Advance Payment"");
			sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0084"") +""\n"";
			sErrorCode += ""OM0084 \n"";
			//break;
			}
			if(NumIns!=NumInsPayment1) 
			{
			sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0085"") +""\n"";
			sErrorCode += ""OM0085 \n"";
		//	break;
			//appObj.RaiseErrorText(""Advance Payment Installments are not Equal to Order Instalments"");
			}
			if(NRCtotal!=OrderPayment1)
			{
			sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0086"") +""\n"";
			sErrorCode += ""OM0086 \n"";
			}					
			if(AdvCount == ""0"") 
			{
			sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0087"") +""\n"";
			sErrorCode += ""OM0087 \n""; 
			}			
		}// end with
	 }	//if			
	}//end try
	catch(e)
	{
	//throw(e)
	}
	finally
	{
	}
	

}
function CheckMSISDNVanity(sOrderId,corpGPRSPlan,ServiceType,sBillCpsFlag,sChannel,sOrderType,CustomerType,Outputs,sTaxIdNum,OrderSubChannel)
{
	var appObj;
	var boOrder;
	var bcLineItem;
	var boRMS;
	var bcRMS;
	var sMSISDN;
	var sSpecialCatType="""";
	var sSIMSpecialCatType="""";
	var vanProd = """";
	var sVanityTypeLOV=""""; 
	var spec;
	var sReservedTo="""";
	var sAccntId="""";
	var boAccount;
	var bcAccount;
	var sIDNumber="""";
	var sPlanType="""";
	var VanityPaid;
	var PortOut;
	var MigratedNum;
	var sVanityMigrationType;
	var SIMNumber;
	var sMSISDNContractFlag="""";
	var sMigrationType;
	var sSIPMSISDNType = """";
	var vAllocTo = """";
	var vVanityCat = """";
	var vAllocToFlg = """";
	var eComSessionId = """";
	var eComLineSessionId = """";
	var stcmsisdntype = """";
	var INPRMSFlag =""N""; // INP
	var OrderLinINP = ""N""; //INP
	var PackPart=""""; //H
	var vDisUser="""";
	try
	{
		appObj = TheApplication();
		var corpGPRSPlanNew = appObj.InvokeMethod(""LookupValue"",""STC_CORPGPRSSIMPLAN"",corpGPRSPlan);
		var CategoryName = appObj.InvokeMethod(""LookupValue"",""STC_ADMIN"",""CORPGPRSCAT"");
		var CorpGPRSSubStr = corpGPRSPlanNew.substring(0,8);
		var VOBBCategoryName = appObj.InvokeMethod(""LookupValue"",""STC_ADMIN"",""VOBBCATEGORY"");
		var sSIPBBPlanLov = appObj.InvokeMethod(""LookupValue"",""STC_CORPSIPPLAN"",corpGPRSPlan);
		var sSIPBBPlan = sSIPBBPlanLov.substring(0,7);
		var sSIPCategoryName = appObj.InvokeMethod(""LookupValue"",""STC_ADMIN"",""SIPCATEGORY"");
		var sEfaxPlanLOV = appObj.InvokeMethod(""LookupValue"",""STC_CORPGPRSSIMPLAN"",corpGPRSPlan);
		var sEfaxPlan = sEfaxPlanLOV.substring(0,8);
		var sEfaxCatName = appObj.InvokeMethod(""LookupValue"",""STC_ADMIN"",""EFAXCATEGORY"");
		var sEfaxSIMCatName = appObj.InvokeMethod(""LookupValue"",""STC_SIM_CAT_ADMIN"",""EFAXSIMCATEGORY"");
		var vEFAXPLAN = ""EFAXPLAN"";
		var corpVOBBPlan = appObj.InvokeMethod(""LookupValue"",""STC_CREATE_VOBB"",corpGPRSPlan);
		var corpVOBBPlanStr = corpVOBBPlan.substring(0,4);
		Outputs.SetProperty(""Reserved To"","""");
		Outputs.SetProperty(""Iden Number"","""");
		Outputs.SetProperty(""STC Service Type"","""");
		var sAvayaBBPlanLov = appObj.InvokeMethod(""LookupValue"",""STC_AVAYA_PLAN"",corpGPRSPlan);
		var sAvayaBBPlan = sAvayaBBPlanLov.substring(0,5);
		boOrder = appObj.GetBusObject(""Order Entry (Sales)"");
		bcLineItem = boOrder.GetBusComp(""Order Entry - Line Items (Simple)"");
		var vLogin = TheApplication().LoginName();
		var vDispatchAllow = appObj.InvokeMethod(""LookupValue"",""STC_DISPATCH_STATUS"",""SWITCH_DIRECT_SALES"");
		var vDipatchOn = vDispatchAllow.substring(0,2);
		var vDipatchUser = appObj.InvokeMethod(""LookupValue"",""STC_FUL_ALLOW_LIST"",vLogin);
		if (vDipatchUser !="""" && vDipatchUser !=null)
		{
			vDisUser = vDipatchUser.substring(0,5);
		}
		else
		{
			vDisUser="""";
		}
		if(sOrderType == ""Provide"")
		{
			with(bcLineItem)
			{
				SetViewMode(AllView);
				ActivateField(""Order Header Id"");
				ActivateField(""STC Portal Session Id"");
				ActivateField(""Action Code"");
				ClearToQuery();
				var spec1  = ""[Order Header Id] = '"" + sOrderId + ""' AND [STC Portal Session Id] IS NOT NULL AND [Action Code] = 'Add'"";
				SetSearchExpr(spec1);
				ExecuteQuery(ForwardOnly);
				if(FirstRecord())
				{
					eComLineSessionId = GetFieldValue(""STC Portal Session Id"");
				}
			}
		}
		with(bcLineItem)
		{
			SetViewMode(AllView);
			ActivateField(""Order Header Id"");
			ActivateField(""Service Id"");
			ActivateField(""Root Order Item Id"");
			ActivateField(""Part Number"");
			ActivateField(""STC ICCID"");
			ActivateField(""Product"");
			ActivateField(""Account Id"");
			ActivateField(""STC Internal Portability Flag"");
			ClearToQuery();
			spec  = ""[Order Header Id] = '"" + sOrderId + ""' AND [Id] = [Root Order Item Id]"";
			SetSearchExpr(spec);
			ExecuteQuery(ForwardOnly);
			var isrec = FirstRecord();
			if(isrec)	
			{
				sMSISDN = GetFieldValue(""Service Id"");
				sAccntId = GetFieldValue(""Account Id"");
				SIMNumber = GetFieldValue(""STC ICCID"");
				PackPart = GetFieldValue(""Part Number""); //H
				OrderLinINP = GetFieldValue(""STC Internal Portability Flag"");
				Outputs.SetProperty(""STC Service Type"",ServiceType);
				if(SIMNumber == null || SIMNumber == """")
				{
					if(OrderSubChannel == ""Outbound"" && TheApplication().ActiveViewName()!= """")
					{
							if(vDipatchOn != """" & vDipatchOn != null && vDipatchOn == ""ON""){
							}
							else{
									 if(vDisUser !="""" && vDisUser !=null && vDisUser == ""ALLOW""){
		  							 }
									else{
										sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0027"",sMSISDN,MigratedNum) +""\n"";
										sErrorCode += ""OM0027 \n"";
									}
															
						    	}
					 }
					else
					{
						sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0027"",sMSISDN,MigratedNum) +""\n"";
						sErrorCode += ""OM0027 \n"";
					}
				    }
				if((!(sMSISDN == null || sMSISDN == '')) || sBillCpsFlag == ""Y"")
				{							
					boRMS = appObj.GetBusObject(""RMS NM Number Enquiry_Thin"");
					bcRMS = boRMS.GetBusComp(""RMS NM Number Enquiry_Thin"");
					if(sBillCpsFlag != ""Y"")
					{
						with (bcRMS)
						{
							SetViewMode(AllView);
							ActivateField(""STC Migration Type"");
							ActivateField(""Number String"");
							ActivateField(""Migrated SIM Number"");
							ActivateField(""Special Category Type"");
							ActivateField(""STC Vanity Paid"");
							ActivateField(""Port Out"");
							ActivateField(""STC Contract MSISDN"");
							ActivateField(""Reserved To"");
							ActivateField(""STC MSISDN Type"");
							ActivateField(""Allocated To"");
							ActivateField(""CPBX Customer ID Num"");//Mayank: Added for ECOM
							ActivateField(""STC MSISDN Type"");//[MANUJ] : [Business Vanity]
							ActivateField(""STC Internal Portability Flag""); //H
							ClearToQuery();
							SetSearchSpec(""Number String"",sMSISDN);
							ExecuteQuery(ForwardOnly);
							var isrecord = FirstRecord();
							if (isrecord)
							{
								sSpecialCatType = GetFieldValue(""Special Category Type"");
								sReservedTo = GetFieldValue(""Reserved To"");
								VanityPaid = GetFieldValue(""STC Vanity Paid"");
								sMSISDNContractFlag = GetFieldValue(""STC Contract MSISDN"");
								MigratedNum = GetFieldValue(""Migrated SIM Number"");
								PortOut = GetFieldValue(""Port Out"");
								sMigrationType = GetFieldValue(""STC Migration Type"");
								sVanityMigrationType = GetFieldValue(""STC Migration Type"");
								vAllocTo = GetFieldValue(""Allocated To"");
								sSIPMSISDNType = GetFieldValue(""STC MSISDN Type"");
								eComSessionId = GetFieldValue(""Reserved To"");//Mayank: Added for ECOM
								INPRMSFlag = GetFieldValue(""STC Internal Portability Flag""); //H
								Outputs.SetProperty(""Reserved To"",sReservedTo);
								vVanityCat = TheApplication().InvokeMethod(""LookupValue"", ""STC_VANITY_DEF_FLAG_CAT_LIST"", sSpecialCatType);
								if (vVanityCat != """" && vVanityCat != null)
								vVanityCat = vVanityCat.substring(0,9);
								else
								vVanityCat = """";
								vAllocToFlg = TheApplication().InvokeMethod(""LookupValue"", ""STC_VANITY_DEF_FLAG_ADMIN"", vAllocTo);
							}
							if (INPRMSFlag == ""Y"") //INP
							{
								with(bcLineItem)
								{
									if(OrderLinINP == ""N"" || OrderLinINP == """" || OrderLinINP == null )
									{
										SetFieldValue(""STC Internal Portability Flag"",""Y"");
										WriteRecord();
									}
								}
						     }			
							if(	(MigratedNum != """" && MigratedNum != null) && (SIMNumber != MigratedNum) )
							{
								sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0038"",sMSISDN,MigratedNum) +""\n"";
								sErrorCode += ""OM0028 \n"";
							}
								
							if(sSIPBBPlan == ""SIPPlan"")
							{
								if(sSIPMSISDNType != ""SIP MSISDN"")
								{
									sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0048"") +""\n"";
									sErrorCode += ""OM0048 \n"";
								}
							}
							if(sSIPMSISDNType == ""SIP MSISDN"")
							{
								if (INPRMSFlag != ""Y"") //H
								{
									if(sSIPBBPlan != ""SIPPlan"")
									{
										sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0051"") +""\n"";
										sErrorCode += ""OM0051 \n"";
									}
								}
							}
						}//end with bcRMS
					}
				 if(SIMNumber != """" && SIMNumber != null)
			      {
					with (bcRMS)
					{
						SetViewMode(AllView);
						ActivateField(""STC Migration Type"");
						ActivateField(""Number String"");
						ActivateField(""Migrated SIM Number"");
						ActivateField(""Special Category Type"");
						ClearToQuery();
						SetSearchSpec(""Num Mstr Number String"",SIMNumber);
						ExecuteQuery(ForwardOnly);					
						var isrecord = FirstRecord();
						if (isrecord)
						{
							MigratedNum = GetFieldValue(""Migrated SIM Number"");
							sSIMSpecialCatType = GetFieldValue(""Special Category Type"");
							sMigrationType = GetFieldValue(""STC Migration Type"");
						}	
						if(CorpGPRSSubStr == ""CORPGPRS"")
						{
							if(sSIMSpecialCatType != CategoryName)
							{
								sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0030"") +""\n"";
								sErrorCode += ""OM0030 \n"";
							}
						}
						if(sBillCpsFlag != ""Y"")
						{
							if(sSIPBBPlan == ""SIPPlan"")
							{
								if(sSIMSpecialCatType != sSIPCategoryName)
								{
									sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0049"") +""\n"";
									sErrorCode += ""OM0049 \n"";
								}
							}
							if(sSIMSpecialCatType == sSIPCategoryName)
							{
								if(sSIPBBPlan != ""SIPPlan"")
								{
									sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0050"") +""\n"";
									sErrorCode += ""OM0050 \n"";
								}
							}
						//	if(CorpGPRSSubStr == ""VOBBPLAN"")
							if(corpVOBBPlanStr == ""VOBB"")
						
							{
								if(PackPart != ""GPONPACK1"") //H
							   {
									if(sSIMSpecialCatType != VOBBCategoryName)
									{
										sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0041"") +""\n"";
										sErrorCode += ""OM0041 \n"";
									}
							    }
							}
							if(sSIMSpecialCatType == VOBBCategoryName )
							{
								if(corpVOBBPlanStr != ""VOBB"")
								{
									sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0042"") +""\n"";
									sErrorCode += ""OM0042 \n"";
								}
							}
							if(sSIMSpecialCatType == CategoryName )
							{
								if(CorpGPRSSubStr != ""CORPGPRS"")
								{
									sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0031"") +""\n"";
									sErrorCode += ""OM0030 \n"";
								}
							}
							if(sEfaxPlan == vEFAXPLAN)
							{
								if(sSIMSpecialCatType != sEfaxSIMCatName)
								{
									sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0041"") +""\n"";
									sErrorCode += ""OM0041 \n"";
								}
							}
							if(sSIMSpecialCatType == sEfaxSIMCatName)
							{
								if(sEfaxPlan != vEFAXPLAN)
								{
									sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0042"") +""\n"";
									sErrorCode += ""OM0042 \n"";
								}
							}//end E-Fax		
							if(	(MigratedNum != """" && MigratedNum != null) && (sMSISDN != MigratedNum) )
							{
								sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0039"",SIMNumber,MigratedNum) +""\n"";
								sErrorCode += ""OM0029 \n"";
							}
							if(MigratedNum != """" && MigratedNum != null && vVanityCat != ""VANITYFLG"")
							CheckMigratePlan(sOrderId,sMigrationType);												
						}			
					}//end with bcRMS
					} //if SIM Null check.
				}//	if(isrec)			
				sSpecialCatType = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_VANITY"",sSpecialCatType);
				SetViewMode(AllView); 
				ActivateField(""Order Header Id"");
				ActivateField(""Service Id"");
				ActivateField(""Root Order Item Id"");
				ActivateField(""Part Number"");
				ActivateField(""Product""); 
				ClearToQuery();
				spec  = ""[Order Header Id] = '"" + sOrderId + ""' AND [Part Number] LIKE 'VAN*'"";
				SetSearchExpr(spec);
				ExecuteQuery(ForwardOnly);
				var isrec1 = FirstRecord();
				if(isrec1)
				{
					vanProd = GetFieldValue(""Product"");
					var BcLov = appObj.GetBusObject(""List Of Values"").GetBusComp(""List Of Values"");
					with(BcLov)
					{
						SetViewMode(AllView);
						ActivateField(""High"");
						ClearToQuery();
						SetSearchSpec(""Name"",vanProd);
						ExecuteQuery(ForwardOnly);
						var islovRec = FirstRecord();
						if(islovRec)
						{
							sVanityTypeLOV = GetFieldValue(""High"");
						}// end of islovRec
					}// end of BcLov
				}//	if(isrec1)
			}// end with bcLineItem
		/*	boAccount = appObj.GetBusObject(""STC Account Thin BO"");
			bcAccount = boOrder.GetBusComp(""STC Account Thin"");
			with(bcAccount)
			{
				SetViewMode(AllView);
				ActivateField(""Id"");
				ActivateField(""Tax ID Number"");
				if (sAccntId != """")
				{
					ClearToQuery();
					spec  = ""[Id] = '"" + sAccntId + ""'""; 
					SetSearchExpr(spec);
					ExecuteQuery(ForwardOnly);
					var isAccnt = FirstRecord();
					if(isAccnt)	
					{
						sIDNumber =	GetFieldValue(""Tax ID Number"");
						Outputs.SetProperty(""Iden Number"",sIDNumber);
					}
				}
			}// end with bcAccount */
			if (sTaxIdNum != """")
		{
			sIDNumber =	sTaxIdNum;
			Outputs.SetProperty(""Iden Number"",sIDNumber);
		}
			var sVanBypassFlag = appObj.InvokeMethod(""LookupValue"",""STC_VANITY_VALIDATION_FLAG"",""BypassValidation"");
			var PrepVanity = appObj.InvokeMethod(""LookupValue"",""STC_PREP_CATEGORY"",sSpecialCatType);
			var FoundCat = PrepVanity.substring(0,5);
			if (sPlanType == ""Prepaid"" && sSpecialCatType !="""" && VanityPaid != ""Yes"" && PortOut != ""Y"" && FoundCat != ""PPCAT"")
			{
				sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0023"") +""\n"";
				sErrorCode += ""OM0023 \n"";		
			}
			else
			{
				var VanMigLOVType = appObj.InvokeMethod(""LookupValue"",""STC_VANITY_MIG_TYPE"",sVanityMigrationType);
				var sFoundLOV = VanMigLOVType.substring(0,3);
				if(sVanityTypeLOV == """" || sVanityTypeLOV == null)
					{sVanityTypeLOV = ""NUL"";}
				if(sSpecialCatType == """" || sSpecialCatType == null)
					{sSpecialCatType = ""NUL"";}
				if(sFoundLOV == """" || sFoundLOV == null)
					{sFoundLOV = ""NUL"";}
				if(CorpGPRSSubStr == """" || CorpGPRSSubStr == null)
					{CorpGPRSSubStr = ""NUL"";}
				if(vVanityCat == """" || vVanityCat == null)
					{vVanityCat = ""NUL"";}
				if(sSIPMSISDNType == """" || sSIPMSISDNType == null)
					{sSIPMSISDNType = ""NUL"";}
				if((CustomerType == ""SME"" || CustomerType == ""Corporate""))//[MANUJ] : Business Vanity SD Rules (Common Rules)/SME/Corporate/VOBB/SIP/CloudPBX
					{
						if (INPRMSFlag != ""Y"") //H
						{
							if(corpVOBBPlanStr == ""VOBB"" && (sSIPMSISDNType != ""VOBB Series"" && sMSISDN != """" && sMSISDN != null ))
							{
								sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0043"") +""\n"";
								sErrorCode += ""OM0043 \n"";
							}			
							else if(sSIPMSISDNType == ""VOBB Series"" && CorpGPRSSubStr == ""VOBBPLAN"")//stop certain VOBB Plans when number chosen is VOBB
							{
								sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0043"") +""\n"";
								sErrorCode += ""OM0043 \n"";
							}
						}
					}
				if (sVanityTypeLOV != sSpecialCatType && sFoundLOV != ""MIG"")
				{
				if(!((CustomerType == ""SME"" || CustomerType == ""Corporate"") && (sSIPMSISDNType == ""VOBB Series"" || sSIPMSISDNType == ""CloudPBX"" || sSIPMSISDNType == ""SIP MSISDN"")))//[MANUJ] : [Busines Vanity]
				{
					if(sVanityTypeLOV != ""DummyCorp"" && CorpGPRSSubStr != ""CORPGPRS"" && vVanityCat != ""VANITYFLG"")
					{
						sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0022"") +""\n"";
						sErrorCode += ""OM0022 \n"";
					}
					else if(sVanityTypeLOV == ""DummyCorp"" && CorpGPRSSubStr == ""CORPGPRS"")
					{
						sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0040"") +""\n"";
						sErrorCode += ""OM0040 \n"";
					}
					else if(sVanityTypeLOV != ""VOBB Series"" && CorpGPRSSubStr != ""VOBBPLAN"" && vVanityCat != ""VANITYFLG"")
					{
						sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0022"") +""\n"";
						sErrorCode += ""OM0022 \n"";
					}
					else if(sVanityTypeLOV == ""VOBB Series"" && CorpGPRSSubStr == ""VOBBPLAN"")
					{
						sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0043"") +""\n"";
						sErrorCode += ""OM0043 \n"";
					}
					else if(sVanityTypeLOV == sEfaxCatName && sEfaxPlan != vEFAXPLAN)
					{
						sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0043"") +""\n"";
						sErrorCode += ""OM0043 \n"";
					}
					else if(vVanityCat == ""VANITYFLG"")
					{
						VanityContractCheck(sOrderId,sSpecialCatType,vanProd,CustomerType,sSIPMSISDNType);//[MANUJ] : [Business Vanity]
					}
				}
				}
				else
				{
					MigratedVanity(sOrderId);
				}
			}//end else
			if (sReservedTo !="""")
			{
				var sChannelLOV = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_CHANNEL"",""eCommerce"")//Mayank: Added for ECOM
				if (sReservedTo != sIDNumber && sAvayaBBPlan != ""AVAYA"" && sChannel != sChannelLOV)//Mayank: Added for ECOM
				{
					sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0024"") +""\n"";
					sErrorCode += ""OM0024 \n"";						
				}
				else 
				{
					if(sChannel == sChannelLOV && eComSessionId != eComLineSessionId)
					{
						sErrorMsg += appObj.LookupMessage(""User Defined Errors"",""OM0024"") +""\n"";
						sErrorCode += ""OM0024 \n"";
					}
				}//Mayank: Added for ECOM ------------STOP------------
			}
		}//end try
	}
	catch(e) 
	{
		throw e;
	}
	finally
	{
		bcAccount = null;
		boAccount = null;
		bcRMS = null;
		boRMS = null;
		bcLineItem = null;
		boOrder = null;
		appObj = null;
	}
}
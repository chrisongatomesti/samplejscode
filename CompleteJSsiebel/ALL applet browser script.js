function Applet_PreInvokeMethod (name, inputPropSet)
{
	if(name == ""CreatePostpaidBillAcc"" || name == ""CreatePrepaidBillAcc"")
	{
		var sFlag = confirm(""Have you checked for valid GCC Id/CPR Id? If 'YES', Press 'OK' else 'Cancel'"");
		if(sFlag == false)
		return (""CancelOperation"");	
		else
		return (""ContinueOperation"");
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	switch(name){
		case ""OrderTemplate""
		alert (""Siebel 7 browser script!);
		return(CancelOperation);
		break;
	}
	return (""ContinueOperation"");
}
function Applet_Load ()
{





}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	switch (name) {
		case ""ReconfigureCxProd"":
			var sessionCookie = document.cookie;
			var sblUrl = document.location.toString();
			var index = sblUrl.lastIndexOf(""/"");
			var sblServerUrl = sblUrl.substring(0, index+1);
			TheApplication().SetProfileAttr(""czSblUrl"", sblServerUrl);
			TheApplication().SetProfileAttr(""czSblSesCookie"", sessionCookie);
		break;
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
WshShell.Popup(""Entered into Method"");
if(MethodName==""WriteRecord"" || Method==""ExplicitWriteRecord"")
{
	var strPartnerName = this.BusComp().GetFieldValue(""Partner Name"");
	if(strPartnerName == """")
	{
	 TheApplication().RaiseErrorText(""Partner Name is Required Field. Enter a value for Partner Name"");
	}
}

	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	switch (name) {
		case ""ReconfigureCxProd"":
			var sessionCookie = document.cookie;
			var sblUrl = document.location.toString();
			var index = sblUrl.lastIndexOf(""/"");
			if (index == -1) {
				//Todo: raise error text
			}
			var sblServerUrl = sblUrl.substring(0, index+1);
			TheApplication().SetProfileAttr(""czSblUrl"", sblServerUrl);
			TheApplication().SetProfileAttr(""czSblSesCookie"", sessionCookie);
		break;
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	switch (name) {
		case ""ReconfigureCxProd"":
			var sessionCookie = document.cookie;
			var sblUrl = document.location.toString();
			var index = sblUrl.lastIndexOf(""/"");
			if (index == -1) {
				//Todo: raise error text
			}
			var sblServerUrl = sblUrl.substring(0, index+1);
			TheApplication().SetProfileAttr(""czSblUrl"", sblServerUrl);
			TheApplication().SetProfileAttr(""czSblSesCookie"", sessionCookie);
		break;
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	switch (name) {
		case ""ReconfigureCxProd"":
			var sessionCookie = document.cookie;
			var sblUrl = document.location.toString();
			var index = sblUrl.lastIndexOf(""/"");
			if (index == -1) {
				//Todo: raise error text
			}
			var sblServerUrl = sblUrl.substring(0, index+1);
			TheApplication().SetProfileAttr(""czSblUrl"", sblServerUrl);
			TheApplication().SetProfileAttr(""czSblSesCookie"", sessionCookie);
		break;
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	switch (name) {
		case ""ReconfigureCxProd"":
			var sessionCookie = document.cookie;
			var sblUrl = document.location.toString();
			var index = sblUrl.lastIndexOf(""/"");
			if (index == -1) {
				//Todo: raise error text
			}
			var sblServerUrl = sblUrl.substring(0, index+1);
			TheApplication().SetProfileAttr(""czSblUrl"", sblServerUrl);
			TheApplication().SetProfileAttr(""czSblSesCookie"", sessionCookie);
		break;
		
		 case ""AddDiscount"":
		 
			 var sOrderItemId = this.BusComp().GetFieldValue(""Id"");
			 var appObjSC = theApplication();
			 
			 theApplication().SetProfileAttr(""OrderItemId"",sOrderItemId);
			 
			 var inputPropSet = theApplication().NewPropertySet();
			 inputPropSet.SetProperty(""SWEMethod"", ""ShowPopup"");
			 inputPropSet.SetProperty(""SWETA"", ""STC Add Discount Product Applet"");
			 inputPropSet.SetProperty(""SWEW"", ""800"");
			 inputPropSet.SetProperty(""SWEH"", ""400"");
			 inputPropSet.SetProperty(""SWESP"", ""true"");
			 inputPropSet.SetProperty(""SWEM"", ""Edit List""); // Base, Edit, Edit List
			 this.InvokeMethod(""ShowPopup"", inputPropSet);
		 
		 return (""CancelOperation"");
		 
		 
		 break;

	}
	
	if(name == ""STCAddEligiblePromotion"")
	{
		var	appObjSC = theApplication();
		appObjSC.SetProfileAttr(""EligibleOrderSubStat"","""");
		var OrderHeaderId = this.BusComp().GetFieldValue(""Id"");
	//	var OrderHeaderId = this.BusComp().ParentBusComp().GetFieldValue(""Id"");;
	//	alert(OrderHeaderId);
	//	var sServiceId = this.BusComp().GetFieldValue(""Service Id"");
	//	appObjSC.SetProfileAttr(""sEligibleOrderMSISDN"", sServiceId);
	//	appObjSC.SetProfileAttr(""sEligiblePromoOrderId"", OrderHeaderId);
		var InputsSC = appObjSC.NewPropertySet();
		var OutputsSC = appObjSC.NewPropertySet();
		InputsSC.SetProperty(""OrderHeaderId"", OrderHeaderId);
		var svcServiceSC = appObjSC.GetService(""STC Add Eligible Promotion"");
		OutputsSC = svcServiceSC.InvokeMethod(""EligiblePromotion"",InputsSC);
		var ErrEligbleFlg = appObjSC.GetProfileAttr(""ErrorEligibleProm"");
		var sOrderSubStat = appObjSC.GetProfileAttr(""EligibleOrderSubStat"");
		if(ErrEligbleFlg == ""Y"")
		{
			appObjSC.SetProfileAttr(""ErrorEligibleProm"","""");
			appObjSC.SetProfileAttr(""EligibleOrderSubStat"","""");
			return (""CancelOperation"");
		}
		
		var inputPropSet = theApplication().NewPropertySet();
		inputPropSet.SetProperty(""SWEMethod"", ""ShowPopup"");
		if(sOrderSubStat == ""Raised"")
		{
			appObjSC.SetProfileAttr(""EligibleOrderSubStat"","""");
			inputPropSet.SetProperty(""SWETA"", ""STC Promotion Mgmt Add Eligible Product Popup Applet - BTL Optimization"");
		}
		else if(sOrderSubStat == ""Order Validated"")
		{
			appObjSC.SetProfileAttr(""EligibleOrderSubStat"","""");
			inputPropSet.SetProperty(""SWETA"", ""STC Promotion Mgmt Add Eligible Product Popup Applet"");
		}
		inputPropSet.SetProperty(""SWEW"", ""700"");
		inputPropSet.SetProperty(""SWEH"", ""700"");
		inputPropSet.SetProperty(""SWESP"", ""true"");
		inputPropSet.SetProperty(""SWEM"", ""Edit List""); // Base, Edit, Edit List
		this.InvokeMethod(""ShowPopup"", inputPropSet);
		return (""CancelOperation"");
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	switch (name) {
		case ""ReconfigureCxProd"":
		case ""QuotesAndOrdersValidate"":
			var sessionCookie = document.cookie;
			var sblUrl = document.location.toString();
			var index = sblUrl.lastIndexOf(""/"");
			if (index == -1) {
				//Todo: raise error text
			}
			var sblServerUrl = sblUrl.substring(0, index+1);
			TheApplication().SetProfileAttr(""czSblUrl"", sblServerUrl);
			TheApplication().SetProfileAttr(""czSblSesCookie"", sessionCookie);
		break;
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	switch (name) {
		case ""ReconfigureCxProd"":
		case ""QuotesAndOrdersValidate"":
			var sessionCookie = document.cookie;
			var sblUrl = document.location.toString();
			var index = sblUrl.lastIndexOf(""/"");
			if (index == -1) {
				//Todo: raise error text
			}
			var sblServerUrl = sblUrl.substring(0, index+1);
			TheApplication().SetProfileAttr(""czSblUrl"", sblServerUrl);
			TheApplication().SetProfileAttr(""czSblSesCookie"", sessionCookie);
		break;
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	switch (name) {
		case ""ReconfigureCxProd"":
			var sessionCookie = document.cookie;
			var sblUrl = document.location.toString();
			var index = sblUrl.lastIndexOf(""/"");
			if (index == -1) {
				//Todo: raise error text
			}
			var sblServerUrl = sblUrl.substring(0, index+1);
			TheApplication().SetProfileAttr(""czSblUrl"", sblServerUrl);
			TheApplication().SetProfileAttr(""czSblSesCookie"", sessionCookie);
		break;
		
		 case ""AddDiscount"":
		 
			 var sOrderId = this.BusComp().GetFieldValue(""Order Header Id"");
			 var appObjSC = theApplication();
			 
			 theApplication().SetProfileAttr(""OrderHeaderId"",sOrderId);
			 
			 var inputPropSet = theApplication().NewPropertySet();
			 inputPropSet.SetProperty(""SWEMethod"", ""ShowPopup"");
			 inputPropSet.SetProperty(""SWETA"", ""STC Add Discount Product Applet"");
			 inputPropSet.SetProperty(""SWEW"", ""800"");
			 inputPropSet.SetProperty(""SWEH"", ""400"");
			 inputPropSet.SetProperty(""SWESP"", ""true"");
			 inputPropSet.SetProperty(""SWEM"", ""Edit List""); // Base, Edit, Edit List
			 this.InvokeMethod(""ShowPopup"", inputPropSet);
		 
		 return (""CancelOperation"");
		 
		 
		 break;

	}
	
	if(name == ""STCAddEligiblePromotion"")
	{
		var	appObjSC = theApplication();
		appObjSC.SetProfileAttr(""EligibleOrderSubStat"","""");
		var OrderHeaderId = this.BusComp().GetFieldValue(""Id"");
	//	var OrderHeaderId = this.BusComp().ParentBusComp().GetFieldValue(""Id"");;
	//	alert(OrderHeaderId);
	//	var sServiceId = this.BusComp().GetFieldValue(""Service Id"");
	//	appObjSC.SetProfileAttr(""sEligibleOrderMSISDN"", sServiceId);
	//	appObjSC.SetProfileAttr(""sEligiblePromoOrderId"", OrderHeaderId);
		var InputsSC = appObjSC.NewPropertySet();
		var OutputsSC = appObjSC.NewPropertySet();
		InputsSC.SetProperty(""OrderHeaderId"", OrderHeaderId);
		var svcServiceSC = appObjSC.GetService(""STC Add Eligible Promotion"");
		OutputsSC = svcServiceSC.InvokeMethod(""EligiblePromotion"",InputsSC);
		var ErrEligbleFlg = appObjSC.GetProfileAttr(""ErrorEligibleProm"");
		var sOrderSubStat = appObjSC.GetProfileAttr(""EligibleOrderSubStat"");
		if(ErrEligbleFlg == ""Y"")
		{
			appObjSC.SetProfileAttr(""ErrorEligibleProm"","""");
			appObjSC.SetProfileAttr(""EligibleOrderSubStat"","""");
			return (""CancelOperation"");
		}
		
		var inputPropSet = theApplication().NewPropertySet();
		inputPropSet.SetProperty(""SWEMethod"", ""ShowPopup"");
		if(sOrderSubStat == ""Raised"")
		{
			appObjSC.SetProfileAttr(""EligibleOrderSubStat"","""");
			inputPropSet.SetProperty(""SWETA"", ""STC Promotion Mgmt Add Eligible Product Popup Applet - BTL Optimization"");
		}
		else if(sOrderSubStat == ""Order Validated"")
		{
			appObjSC.SetProfileAttr(""EligibleOrderSubStat"","""");
			inputPropSet.SetProperty(""SWETA"", ""STC Promotion Mgmt Add Eligible Product Popup Applet"");
		}
		inputPropSet.SetProperty(""SWEW"", ""700"");
		inputPropSet.SetProperty(""SWEH"", ""700"");
		inputPropSet.SetProperty(""SWESP"", ""true"");
		inputPropSet.SetProperty(""SWEM"", ""Edit List""); // Base, Edit, Edit List
		this.InvokeMethod(""ShowPopup"", inputPropSet);
		return (""CancelOperation"");
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	switch (name) {
		case ""ReconfigureCxProd"":
			var sessionCookie = document.cookie;
			var sblUrl = document.location.toString();
			var index = sblUrl.lastIndexOf(""/"");
			if (index == -1) {
				//Todo: raise error text
			}
			var sblServerUrl = sblUrl.substring(0, index+1);
			TheApplication().SetProfileAttr(""czSblUrl"", sblServerUrl);
			TheApplication().SetProfileAttr(""czSblSesCookie"", sessionCookie);
		break;
	}
	return (""ContinueOperation"");
}
"/*  
---------------+------+--------+----------------------------------------------  
Date(YYYYMMDD) | Ver  | By     | Description   
---------------+------+--------+----------------------------------------------  
26120712       |   1.0|   CP        Creation  
---------------+------+--------+----------------------------------------------
20130103       |   2.0|S Poria |    update  
---------------+------+--------+----------------------------------------------    
*/ 

function Applet_PreInvokeMethod (name, inputPropSet)
{
	var thisReturn = ""ContinueOperation"";
	switch(name)
	{
		case ""ValidateOrder"":
				try
				{
					var objAppln, Inputs, Outputs, svcService, strRetCode; 
					var numCountRec, strErrorCd, strPenaltyProd;
					var strOrderId 		= this.BusComp().GetFieldValue(""Id"");
					var strOrderType 	= this.BusComp().GetFieldValue(""STC Order SubType"");
					var strProfileType 	= this.BusComp().GetFieldValue(""STC Billing Profile Type"");
					
					if( strOrderType == ""Modify"" && strProfileType == ""Datacom"" )
					{
						objAppln = theApplication();
						Inputs = objAppln.NewPropertySet();
			         	Outputs = objAppln.NewPropertySet();
			         	svcService = objAppln.GetService(""STC Contract Date Calc"");
						Inputs.SetProperty(""Order Id"", strOrderId);
						Outputs = svcService.InvokeMethod(""CheckDatacomPenaltyProd"", Inputs);
						strRetCode = Outputs.GetProperty(""ReturnCode"");
						if( strRetCode == ""N"" )
						{
							alert(""You have not selected Datacom Terminated Product."");
						}
					}
					
				}
				catch(e)
				{
				}
				finally
				{
					objAppln=null;
					Inputs=null;
					Outputs=null;
					svcService=null;
				}
				thisReturn = ""ContinueOperation"";
				break;
			
		default:
				thisReturn = ""ContinueOperation"";
				break;
	}

	return (thisReturn);
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	if(name == ""SuspendProdSvc"")
	{
		var oBS;
     	var inpPS;
        var outPS;
        var vFlag = """";
        //MANUJ Added for SIP Defect. To ensure the below validation doesnt occur from BAN - Asset View 
        var ActiveView = theApplication().ActiveViewName();
		if(ActiveView != ""STC CUT Invoice Installed Assets View"")
		{
        inpPS = theApplication().NewPropertySet();
        outPS = theApplication().NewPropertySet();
		var vMSISDN = this.BusComp().GetFieldValue(""Serial Number"");
		var vRootAssetId  = this.BusComp().GetFieldValue(""Id"");
		inpPS.SetProperty(""Object Id"",vRootAssetId);
		inpPS.SetProperty(""ProcessName"",""STC Get Shared MSISDN Details WF"");
		inpPS.SetProperty(""MSISDN"",vMSISDN);
		oBS = theApplication().GetService(""Workflow Process Manager"");
        outPS = oBS.InvokeMethod(""RunProcess"", inpPS,outPS);
        vFlag = outPS.GetProperty(""LOVValue"");
        var vParentMSISDN = outPS.GetProperty(""ParentMSISDN"");
		if(vFlag == ""True"")
		{
			var vMessage = ""The line you are trying to Suspend is a child SIM of parent MSISDN  "" + ""'"" + vParentMSISDN + ""'"" + "" . Press 'Ok' to continue with suspension or press 'Cancel' to discontinue"";
			var sFlag = confirm(vMessage);
			if (sFlag == false)
				return (""CancelOperation"");
			else
			{	
				return (""ContinueOperation"");
			}
		
			
		}
		else if(vFlag == ""False"")
		{
			return (""ContinueOperation"");
		}
		}//	ActiveView
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	switch (name) {
		case ""ReconfigureCxProd"":
			var sessionCookie = document.cookie;
			var sblUrl = document.location.toString();
			var index = sblUrl.lastIndexOf(""/"");
			var sblServerUrl = sblUrl.substring(0, index+1);
			TheApplication().SetProfileAttr(""czSblUrl"", sblServerUrl);
			TheApplication().SetProfileAttr(""czSblSesCookie"", sessionCookie);
		break;
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	switch (name) {
		case ""Customize"":
			var sessionCookie = document.cookie;
			var sblUrl = document.location.toString();
			var index = sblUrl.lastIndexOf(""/"");
			var sblServerUrl = sblUrl.substring(0, index+1);
			TheApplication().SetProfileAttr(""czSblUrl"", sblServerUrl);
			TheApplication().SetProfileAttr(""czSblSesCookie"", sessionCookie);
		break;
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	switch (name) {
		case ""ReconfigureCxProd"":
			var sessionCookie = document.cookie;
			var sblUrl = document.location.toString();
			var index = sblUrl.lastIndexOf(""/"");
			var sblServerUrl = sblUrl.substring(0, index+1);
			TheApplication().SetProfileAttr(""czSblUrl"", sblServerUrl);
			TheApplication().SetProfileAttr(""czSblSesCookie"", sessionCookie);
		break;
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	switch (name) {
		case ""ReconfigureCxProd"":
			var sessionCookie = document.cookie;
			var sblUrl = document.location.toString();
			var index = sblUrl.lastIndexOf(""/"");
			if (index == -1) {
				//Todo: raise error text
			}
			var sblServerUrl = sblUrl.substring(0, index+1);
			TheApplication().SetProfileAttr(""czSblUrl"", sblServerUrl);
			TheApplication().SetProfileAttr(""czSblSesCookie"", sessionCookie);
		break;
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	switch (name) {
		case ""ReconfigureCxProd"":
		case ""GetEligibility"":
		case ""QuotesAndOrdersValidate"":
			var sessionCookie = document.cookie;
			var sblUrl = document.location.toString();
			var index = sblUrl.lastIndexOf(""/"");
			var sblServerUrl = sblUrl.substring(0, index+1);
			TheApplication().SetProfileAttr(""czSblUrl"", sblServerUrl);
			TheApplication().SetProfileAttr(""czSblSesCookie"", sessionCookie);
		break;
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	switch (name) {
		case ""ReconfigureCxProd"":
		case ""GetEligibility"":
		case ""QuotesAndOrdersValidate"":
			var sessionCookie = document.cookie;
			var sblUrl = document.location.toString();
			var index = sblUrl.lastIndexOf(""/"");
			var sblServerUrl = sblUrl.substring(0, index+1);
			TheApplication().SetProfileAttr(""czSblUrl"", sblServerUrl);
			TheApplication().SetProfileAttr(""czSblSesCookie"", sessionCookie);
		break;
	}
	return (""ContinueOperation"");
}
var ForReading = 1, ForWriting = 2;
function Applet_InvokeMethod (name, inputPropSet)
{
	/*if(name == ""ExportIMSI"") {	
		var bsRMSUtilities 	= TheApplication().GetService(""RMS RMS Utilities"");
		var psInputs 		= TheApplication().NewPropertySet();
		var psOutputs;
		
		try {
		if(this.BusComp().GetFieldValue(""File Name and Path"") != """") {
			psInputs.SetProperty(""FilePath"",this.BusComp().GetFieldValue(""File Name and Path""));
		} else {
			psInputs.SetProperty(""FilePath"","""");
		}
		psInputs.SetProperty(""FileContent"",TheApplication().GetProfileAttr(""RMSIMSIExport""));
		
		psOutputs 	= bsRMSUtilities.InvokeMethod(""WriteLocalFile"",psInputs);
		TheApplication().SetProfileAttr(""RMSIMSIExport"","""");
		
		if(psOutputs.GetProperty(""ErrCode"") != """" ) {
			TheApplication().SWEAlert(""Error: "" + psOutputs.GetProperty(""ErrMessage""));
		} else {
			psInputs.SetProperty(""MessageCode"",""RMSAUC002"");
			psOutputs = bsRMSUtilities.InvokeMethod(""LookupMessage"",psInputs);
			alert(psOutputs.GetProperty(""Message""));
		}
		} catch(e) {
			TheApplication().SetProfileAttr(""RMSIMSIExport"","""");
		}
	}*/
	
	

}
"/*
---------------+------+--------+----------------------------------------------
Date(YYYYMMDD) | Ver  | By     | Description of Change
---------------+------+--------+----------------------------------------------
????????       | 1.0  | TM     | Creation
20060706       | 1.1  | Prasad | Siebel ES SCR1, Objects Destroyed
---------------+------+--------+----------------------------------------------
*/
function Applet_PreInvokeMethod (name, inputPropSet)
{
	if(name == ""ExportIMSI"") 
	{	
		try
		{	
			var bsRMSUtilities 	= theApplication().GetService(""RMS RMS Utilities"");
			var psBSInputArgs	= theApplication().NewPropertySet();
			var psInputs 		= theApplication().NewPropertySet();
			var psOutputs		= theApplication().NewPropertySet();
			var psBSOutputArgs;
			psInputs.SetProperty(""BSName"",""RMS AUC Registration"");
			psInputs.SetProperty(""BSMethod"",""ExportIMSI"");
//Set the type so that the CallServerBS method gets the Input arguments 
			psBSInputArgs.SetType(""BSInputArgs"");
			psBSInputArgs.SetProperty(""Action"",this.BusComp().GetFieldValue(""Action""));
			psBSInputArgs.SetProperty(""RowId"",this.BusComp().GetFieldValue(""Id""));
//Pass the input variables for the BS
			psInputs.AddChild(psBSInputArgs);
			psOutputs = bsRMSUtilities.InvokeMethod(""CallServerBS"", psInputs);
			psBSOutputArgs = psOutputs.GetChild(0);
//alert(""name9""+psBSOutputArgs);
//if(psBSOutputArgs.GetProperty(""ErrMessage"") != null)
//alert(psBSOutputArgs.GetProperty(""ErrMessage""));
			if(this.BusComp().GetFieldValue(""File Name and Path"") != """") 
			{
				psInputs.SetProperty(""FilePath"",this.BusComp().GetFieldValue(""File Name and Path""));
			} 
			else 
			{
				psInputs.SetProperty(""FilePath"","""");
			}
			for(var iPsCnt = 0;iPsCnt < psBSOutputArgs.GetChildCount();iPsCnt++) 
			{
				if(psBSOutputArgs.GetChild(iPsCnt).GetType() == ""FileContent"") 
				{
					var iIndx = psInputs.AddChild(psBSOutputArgs.GetChild(iPsCnt));
					break;
				}
			}
			var psFile = psInputs;
//psOutputs 	= bsRMSUtilities.InvokeMethod(""WriteLocalFile"",psInputs);
//psOutputs = WriteLocalFile(psInputs,psOutputs,psFile);
			WriteLocalFile(psInputs,psOutputs,psFile);
//theApplication().SetProfileAttr(""RMSReservedExport"","""");
//alert(""got out of the writelocal"");
			if(psOutputs.GetProperty(""ErrCode"") != """" ) 
				theApplication().SWEAlert(""Error: "" + psOutputs.GetProperty(""ErrMessage""));
			else if(psBSOutputArgs.GetProperty(""ErrCode"") != """" ) 
				theApplication().SWEAlert(""Error: "" + psBSOutputArgs.GetProperty(""ErrMessage""));
			else 
			{
				psInputs.SetProperty(""MessageCode"",""RMSAUC002"");
				psOutputs = bsRMSUtilities.InvokeMethod(""LookupMessage"", psInputs);
				theApplication().SWEAlert(psOutputs.GetProperty(""Message""));
			}
			return(""CancelOperation"");
		}
		catch(e) 
		{
			theApplication().SetProfileAttr(""RMSReservedExport"","""");
		}
//1.1 below
		finally
		{
			psBSInputArgs = null;
			psInputs = null;
			psOutputs = null;
			bsRMSUtilities = null;
		}
//1.1 above
	}
	else
		return(""ContinueOperation"");
}
function WriteLocalFile (inputPropSet, outputPropSet, psFile)
{
	var strFilePath = inputPropSet.GetProperty(""FilePath"");
	var iWriteLine 	= 1;
	var axoFileObject;
	var ptrFile;
	var psFile;// = theApplication().NewPropertySet();
//	psFile = inputPropSet;
    if(strFilePath =="""") {
    	strFilePath = prompt(""Please Enter full File Path (including file name)."");
    	//alert(strFilePath);
    }
 
    if(strFilePath != null) {
    	try {
	       	axoFileObject = new ActiveXObject(""Scripting.FileSystemObject"");
	        ptrFile = axoFileObject.OpenTextFile(strFilePath,ForWriting,true);

	       if((inputPropSet.GetProperty(""FileContentString"") != """") && (inputPropSet.GetProperty(""FileContentString"") != null)) {
	        	ptrFile.Write(inputPropSet.GetProperty(""FileContentString""));
	        }
	        else if(inputPropSet.GetChildCount() != 0){
	        	for(var iChildCnt = 0; iChildCnt < inputPropSet.GetChildCount();iChildCnt++) {
	        		if(inputPropSet.GetChild(iChildCnt).GetType() == ""FileContent"") {
	        			psFile = inputPropSet.GetChild(iChildCnt);
	        			break;
	        		}
	        	}
	        	if(psFile == null) {
	        		outputPropSet.SetProperty(""ErrCode"",""ERROR"");
	     			outputPropSet.SetProperty(""ErrMessage"",""Input property set not found"");
	        	} else {
		        	
		        	while(psFile.GetProperty(iWriteLine) != null && psFile.GetProperty(iWriteLine) != """") {
		        		ptrFile.WriteLine(psFile.GetProperty(iWriteLine++));
		        	}
		        }
	        }
	        ptrFile.Close();
     	} catch(e) {

     		if(ptrFile != null)
	   			ptrFile.Close();
     		outputPropSet.SetProperty(""ErrCode"",""ERROR"");
     		outputPropSet.SetProperty(""ErrMessage"",e.message);
     	
     	} finally {
     		if(axoFileObject != null)
     			axoFileObject = null;

     	}
   	} else {
   		outputPropSet.SetProperty(""ErrCode"",""FILE_NULL"");
    	outputPropSet.SetProperty(""ErrMessage"",""Please specify a file path"");
   	}
	

}
var ForReading = 1, ForWriting = 2;
"/*
---------------+------+--------+----------------------------------------------
Date(YYYYMMDD) | Ver  | By     | Description of Change
---------------+------+--------+----------------------------------------------
????????       | 1.0  | TM     | Creation
20060706       | 1.1  | Prasad | Siebel ES SCR1, Objects Destroyed
                                 what are these alerts? name1..name2 etc?
---------------+------+--------+----------------------------------------------
*/
function Applet_PreInvokeMethod (name, inputPropSet)
{
	if(name == ""ImportMSISDN"") 
	{
		alert(""name1"");
		var bsRMSUtilities 	= theApplication().GetService(""RMS RMS Utilities"");
		var psInputs 		= theApplication().NewPropertySet();
		var psOutputs		= theApplication().NewPropertySet();
		var psBSInputArgs	= theApplication().NewPropertySet();
		var psBSOutputArgs	= theApplication().NewPropertySet();
		alert(""name2"");
//		try {
		if(this.BusComp().GetFieldValue(""File Name"") == """") 
		{
			psInputs.SetProperty(""MessageCode"",""RMSGEN021"");
			psOutputs = bsRMSUtilities.InvokeMethod(""LookupMessage"",psInputs);
			theApplication().SWEAlert(psOutputs.GetProperty(""Message""));
		} else 
		{
			psInputs.SetProperty(""FilePath"",this.BusComp().GetFieldValue(""File Name""));
		}
		alert(""name3"");
		if(this.BusComp().GetFieldValue(""Scheme Name"") == """"){
			psInputs.SetProperty(""MessageCode"",""RMSGEN022"");
			psOutputs = bsRMSUtilities.InvokeMethod(""LookupMessage"",psInputs);
			theApplication().SWEAlert(psOutputs.GetProperty(""Message""));
		}
		alert(""name4"");
//		psOutputs 	= bsRMSUtilities.InvokeMethod(""ReadLocalFile"",psInputs);
		var psFile = psInputs;
		ReadLocalFile(psInputs,psOutputs,psFile);
		alert(""name5"");
		//psBSOutputArgs = psOutputs.GetChild(0);
		alert(psOutputs.GetChildCount());
		for(var iPsCnt = 0;iPsCnt < psOutputs.GetChildCount();iPsCnt++) {
			alert(""insidefor"");
			if(psOutputs.GetChild(iPsCnt).GetType() == ""FileContent"") {
				alert(""insideif"");
				var iIndx = psBSInputArgs.AddChild(psOutputs.GetChild(iPsCnt));
				alert(""Indx""+iIndx)
				alert(""iPsCnt""+iPsCnt);
				psBSInputArgs.GetChild(iPsCnt).SetType(""FileContent"");
				break;
			}
		}
		
		alert(""name6"");
	
		//Specify the input args for the BS
		psInputs.SetProperty(""BSName"",""RMS NM Number Generation Import MSISDN"");
		psInputs.SetProperty(""BSMethod"",""Import"");
		//Set the type so that the CallServerBS method gets the Input arguments 
		psBSInputArgs.SetType(""BSInputArgs"");
		//psBSInputArgs.SetProperty(""File Name"",this.BusComp().GetFieldValue(""File Name""));
		psBSInputArgs.SetProperty(""Scheme Name"",this.BusComp().GetFieldValue(""Scheme Name""));
		psBSInputArgs.SetProperty(""Scheme Id"",this.BusComp().GetFieldValue(""Scheme RowId""));
		//psBSInputArgs.SetProperty(""FileContent"",this.BusComp().GetFieldValue(""Scheme Id""));
		//Pass the input variables for the BS
		
		psInputs.AddChild(psBSInputArgs);
		//Call the Business Service and get the output variables in the output property set.

		psOutputs 	= bsRMSUtilities.InvokeMethod(""CallServerBS"",psInputs);
		alert(""name7"");
		
		if(psOutputs.GetChildCount() != 0)
		{
			alert(""name8"");
			psBSOutputArgs = psOutputs.GetChild(0);
			alert(""name9"");
		}
		if(psOutputs.GetProperty(""ErrMessage"") != null ) 
		{
			alert(""name12"");		
			theApplication().SWEAlert(psOutputs.GetProperty(""ErrMessage""));
		} 
		else if(psBSOutputArgs.GetProperty(""ErrMessage"") != null) 
		{
			alert(""name11"");
			theApplication().SWEAlert(psBSOutputArgs.GetProperty(""ErrMessage""));
		}
		else 
		{
			alert(""name10"");
			psInputs.SetProperty(""MessageCode"",""RMSGEN020"");
			psOutputs = bsRMSUtilities.InvokeMethod(""LookupMessage"",psInputs);
			theApplication().SWEAlert(psOutputs.GetProperty(""Message""));
		}
//		} catch(e) {
			
//		}
//1.1 below
		psInputs 	= null;
		psOutputs	= null;
		psBSInputArgs	= null;
		psBSOutputArgs	= null;
		bsRMSUtilities 	= null;
//1.1 above
		return (""CancelOperation"");
	}
	else
		return (""ContinueOperation"");
}
function ReadLocalFile (inputPropSet, outputPropSet,psFile)
{
	
	var strFilePath = inputPropSet.GetProperty(""FilePath"");
	var iReadLine 	= 1;
    var axoFileObject;
	var ptrFile;	
	
    if(strFilePath ==null) {
    	strFilePath = prompt(""Please Enter full File Path (including file name)."");
    }

    if(strFilePath != """") {
    	try {
			alert(""Inside Try"");
	     	axoFileObject = new ActiveXObject(""Scripting.FileSystemObject"");
	        ptrFile = axoFileObject.OpenTextFile(strFilePath, ForReading);
        	var strFileTxt = ptrFile.ReadLine();
        	psFile.SetType(""FileContent"");	        	
        	while(strFileTxt != null) {
        		psFile.SetProperty(iReadLine++,strFileTxt);
        		strFileTxt = ptrFile.ReadLine();
        	}
	        alert(""bfrclose"");
	        ptrFile.Close();
     	} catch(e) {
     		if(ptrFile != null)
	   			ptrFile.Close();
     		outputPropSet.SetProperty(""ErrCode"",""ERROR"");
     		outputPropSet.SetProperty(""ErrMessage"",e.message);
     	
     	} finally {
     	
     		if(axoFileObject != null)
    			axoFileObject = null;
     		outputPropSet.AddChild(psFile);
			alert(""FileRead""+psFile.GetProperty(2));
     	}
   	} else {
   		outputPropSet.SetProperty(""ErrCode"",""ERROR"");
    	outputPropSet.SetProperty(""ErrMessage"",""Please specify a file path"");
   	}
 
}
function WriteLocalFile (inputPropSet, outputPropSet, psFile)
{
	
	var strFilePath = inputPropSet.GetProperty(""FilePath"");
	var iWriteLine 	= 1;
	var axoFileObject;
	var ptrFile;
    if(strFilePath =="""") {
    	strFilePath = prompt(""Please Enter full File Path (including file name)."");
    	//alert(strFilePath);
    }
 
    if(strFilePath != null) {
    	try {
	       	axoFileObject = new ActiveXObject(""Scripting.FileSystemObject"");
	        ptrFile = axoFileObject.OpenTextFile(strFilePath,ForWriting,true);
//			ptrFile = axoFileObject.CreateTextFile(strFilePath,true);

	       if((inputPropSet.GetProperty(""FileContentString"") != """") && (inputPropSet.GetProperty(""FileContentString"") != null)) {
	        	ptrFile.Write(inputPropSet.GetProperty(""FileContentString""));
	        }
	        else if(inputPropSet.GetChildCount() != 0){
	        	for(var iChildCnt = 0; iChildCnt < inputPropSet.GetChildCount();iChildCnt++) {
	        		if(inputPropSet.GetChild(iChildCnt).GetType() == ""FileContent"") {
	        			psFile = inputPropSet.GetChild(iChildCnt);
	        			break;
	        		}
	        	}
	        	if(psFile == null) {
	        		outputPropSet.SetProperty(""ErrCode"",""ERROR"");
	     			outputPropSet.SetProperty(""ErrMessage"",""Input property set not found"");
	        	} else {
		        	
		        	while(psFile.GetProperty(iWriteLine) != null) {
		        		ptrFile.WriteLine(psFile.GetProperty(iWriteLine++));
		        	}
		        	
		        }
	        }
	        ptrFile.Close();
     	} catch(e) {

     		if(ptrFile != null)
   			ptrFile.Close();
     		outputPropSet.SetProperty(""ErrCode"",""ERROR"");
     		outputPropSet.SetProperty(""ErrMessage"",e.message);
     	
     	} finally {
     	
     		if(axoFileObject != null)
     			axoFileObject = null;
     	}
   	} else {
   		outputPropSet.SetProperty(""ErrCode"",""FILE_NULL"");
    	outputPropSet.SetProperty(""ErrMessage"",""Please specify a file path"");
   	}

}
"/*
---------------+------+--------+----------------------------------------------
Date(YYYYMMDD) | Ver  | By     | Description of Change
---------------+------+--------+----------------------------------------------
????????       | 1.0  | TM     | Creation
20060706       | 1.1  | Prasad | Siebel ES SCR1, Objects Destroyed
---------------+------+--------+----------------------------------------------
*/
function Applet_PreInvokeMethod (name, inputPropSet)
{
	if(name == ""ExportNumbers"") 
	{	
		var bsRMSUtilities 	= TheApplication().GetService(""RMS RMS Utilities"");
		var psInputs 		= TheApplication().NewPropertySet();
		var psOutputs;		//= TheApplication().NewPropertySet();
		var psBSInputArgs	= TheApplication().NewPropertySet();
		var psBSOutputArgs;
		
		try 
		{
			//Specify the input args for the BS
			psInputs.SetProperty(""BSName"",""RMS NM ReservedExport"");
			psInputs.SetProperty(""BSMethod"",""ReservedExport"");
			//Set the type so that the CallServerBS method gets the Input arguments 
			psBSInputArgs.SetType(""BSInputArgs"");
			psBSInputArgs.SetProperty(""ReservationId"",this.BusComp().GetFieldValue(""Id""));
			psBSInputArgs.SetProperty(""FilePathName"",this.BusComp().GetFieldValue(""Message""));
			//Pass the input variables for the BS
			psInputs.AddChild(psBSInputArgs);
			//Call the Business Service and get the output variables in the output property set.
			psOutputs 	= bsRMSUtilities.InvokeMethod(""CallServerBS"",psInputs);
			
			psBSOutputArgs = psOutputs.GetChild(0);
			
			if(psOutputs.GetProperty(""ErrMessage"") != null)
			alert(psOutputs.GetProperty(""ErrMessage""));
			
			if(this.BusComp().GetFieldValue(""Message"") != """") 
				psInputs.SetProperty(""FilePath"",this.BusComp().GetFieldValue(""Message""));
			else 
				psInputs.SetProperty(""FilePath"","""");
			
			for(var iPsCnt = 0;iPsCnt < psBSOutputArgs.GetChildCount();iPsCnt++) {
				
				if(psBSOutputArgs.GetChild(iPsCnt).GetType() == ""FileContent"") {
					var iIndx = psInputs.AddChild(psBSOutputArgs.GetChild(iPsCnt));
					psInputs.GetChild(iIndx).SetType(""FileContent"");
					break;
				}
			}
			
			psOutputs 	= bsRMSUtilities.InvokeMethod(""WriteLocalFile"",psInputs);
			//TheApplication().SetProfileAttr(""RMSReservedExport"","""");
			
			if(psOutputs.GetProperty(""ErrCode"") != """" ) 
			{
				if(psOutputs.GetProperty(""ErrCode"") == ""FILE_NULL"" )
				{
					psInputs.SetProperty(""MessageCode"",""RMSRS014"");
					psOutputs = bsRMSUtilities.InvokeMethod(""LookupMessage"",psInputs);
					TheApplication().SWEAlert(psOutputs.GetProperty(""Message""));
				}
				else
					TheApplication().SWEAlert(""Error: "" + psOutputs.GetProperty(""ErrMessage""));
			} 
			else 
			{
				psInputs.SetProperty(""MessageCode"",""RMSRS013"");
				psOutputs = bsRMSUtilities.InvokeMethod(""LookupMessage"",psInputs);
				TheApplication().SWEAlert(psOutputs.GetProperty(""Message""));
			}
		} 
		catch(e) 
		{
			TheApplication().SetProfileAttr(""RMSReservedExport"","""");
		}
		//window.open(""C:\\test.csv"");
//1.1 below
		finally
		{
			bsRMSUtilities = null;
			psBSInputArgs = null;
			psInputs = null; 
		}
		return (""CancelOperation"");
		//1.1 below
	}
	else
		return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{

	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
 var msAccountId;
 var msIDNum;
 var msIDType;
 var mbsSVC;
 var msInputs;
 var msOutputs;
 var msConfirm;
	try	
	{
	    if (name == ""WriteRecord"")
		{
		    msAccountId = this.BusComp().GetFieldValue(""Id"");
			msIDNum = this.BusComp().GetFieldValue(""Tax ID Number"");
			msIDType = this.BusComp().GetFieldValue(""Survey Type"");
			mbsSVC = TheApplication().GetService(""STC-CheckDuplicateID"");
			msInputs = TheApplication().NewPropertySet();
			msOutputs = TheApplication().NewPropertySet();
			msInputs.SetProperty(""StrAccountId"", msAccountId);
	  		msInputs.SetProperty(""IDType"", msIDType);
	  		msInputs.SetProperty(""IDNum"", msIDNum);	  		
			if(msIDType != """" && msIDNum != """")
		  		msOutputs = mbsSVC.InvokeMethod(""CheckDuplicate"", msInputs, msOutputs);
	  		if(msOutputs.GetProperty(""gCombExists"") == ""Y"")
	  		{
				msConfirm = confirm(""Customer with same ID Type and ID # Combination already exists.Do you want to Continue?"");
			    
			    if(msConfirm == true)
			       theApplication().SetProfileAttr(""gAllowNewRec"",""N"");
				else
				   theApplication().SetProfileAttr(""gAllowNewRec"",""Y"");
			}
			else
				 theApplication().SetProfileAttr(""gAllowNewRec"",""N"");
		 }	
	}
	catch(e)
	{
		  throw(e.toString());
	}
    finally
	{

		msOutputs = null;
		msInputs = null;
		mbsSVC = null; 
	}
	
}
function Applet_Load ()
{

}
function Applet_PreInvokeMethod (name, inputPropSet)
{
 var msAccountId;
 var msIDNum;
 var msIDType;
 var mbsSVC;
 var msInputs;
 var msOutputs;
 var msConfirm;
	try	
	{
	    if (name == ""WriteRecord"")
		{
		    msAccountId = this.BusComp().GetFieldValue(""Id"");
			msIDNum = this.BusComp().GetFieldValue(""Tax ID Number"");
			msIDType = this.BusComp().GetFieldValue(""Survey Type"");
			mbsSVC = TheApplication().GetService(""STC-CheckDuplicateID"");
			msInputs = TheApplication().NewPropertySet();
			msOutputs = TheApplication().NewPropertySet();
			msInputs.SetProperty(""StrAccountId"", msAccountId);
	  		msInputs.SetProperty(""IDType"", msIDType);
	  		msInputs.SetProperty(""IDNum"", msIDNum);	  		
			if(msIDType != """" && msIDNum != """")
		  		msOutputs = mbsSVC.InvokeMethod(""CheckDuplicate"", msInputs, msOutputs);
	  		if(msOutputs.GetProperty(""gCombExists"") == ""Y"")
	  		{
				msConfirm = confirm(""Customer with same ID Type and ID # Combination already exists.Do you want to Continue?"");
			    
			    if(msConfirm == true)
			       theApplication().SetProfileAttr(""gAllowNewRec"",""N"");
				else
				   theApplication().SetProfileAttr(""gAllowNewRec"",""Y"");
			}
			else
				 theApplication().SetProfileAttr(""gAllowNewRec"",""N"");
		 }	
	}
	catch(e)
	{
		  throw(e.toString());
	}
    finally
	{

		msOutputs = null;
		msInputs = null;
		mbsSVC = null; 
	}
	
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	/*if(name == ""ModifyProdSvc"" || name == ""SuspendProdSvc"" || name == ""ResumeProdSvc"" || name == ""TempSuspendSvc"" || name == ""MigrationProdSvc"" || name == ""ServiceMigrationSvc"")
	{
		var TRASABusComp=null;
	    var sTRAFlag="""", ActiveTRAView="""", vTRAMessage="""", TRAFlag="""", TRACustType="""";
	    
	    ActiveTRAView = theApplication().ActiveViewName();
		TRASABusComp = theApplication().ActiveBusObject().GetBusComp(""CUT Service Sub Accounts"");
		
		with (TRASABusComp)
		{
			TRAFlag = GetFieldValue(""STC Registration Flag"");
			TRACustType = theApplication().GetProfileAttr(""SANAccountType"");
		}
	
		if((TRAFlag == """" || TRAFlag == ""N"") && TRACustType == ""Individual"")
		{
			vTRAMessage = ""please register customer’s line before proceeding with the transaction"";
			sTRAFlag = confirm(vTRAMessage);
			if (sTRAFlag == false)
				return (""CancelOperation"");
			else
				return (""ContinueOperation"");
		}
		else
		{
			return (""ContinueOperation"");
		}	
	}*/

	if(name == ""SuspendProdSvc"")
	{
		var oBS;
     	var inpPS;
        var outPS;
        var vFlag = """";
        //MANUJ Added for SIP Defect. To ensure the below validation doesnt occur from BAN - Asset View 
        var ActiveView = theApplication().ActiveViewName();
		if(ActiveView != ""STC CUT Invoice Installed Assets View"")
		{
        inpPS = theApplication().NewPropertySet();
        outPS = theApplication().NewPropertySet();
		var vMSISDN = this.BusComp().GetFieldValue(""Serial Number"");
		var vRootAssetId  = this.BusComp().GetFieldValue(""Id"");
		inpPS.SetProperty(""Object Id"",vRootAssetId);
		inpPS.SetProperty(""ProcessName"",""STC Get Shared MSISDN Details WF"");
		inpPS.SetProperty(""MSISDN"",vMSISDN);
		oBS = theApplication().GetService(""Workflow Process Manager"");
        outPS = oBS.InvokeMethod(""RunProcess"", inpPS,outPS);
        vFlag = outPS.GetProperty(""LOVValue"");
        var vParentMSISDN = outPS.GetProperty(""ParentMSISDN"");
		if(vFlag == ""True"")
		{
			var vMessage = ""The line you are trying to Suspend is a child SIM of parent MSISDN  "" + ""'"" + vParentMSISDN + ""'"" + "" . Press 'Ok' to continue with suspension or press 'Cancel' to discontinue"";
			var sFlag = confirm(vMessage);
			if (sFlag == false)
				return (""CancelOperation"");
			else
			{	
				return (""ContinueOperation"");
			}
		
			
		}
		else if(vFlag == ""False"")
		{
			return (""ContinueOperation"");
		}
		}//	ActiveView
	}
	if(name == ""MigrationProdSvc"")
	{/*START > [26Apr2016][NAVINR][TRA_SIMREG: TOO - Elite customer popup]*/

		var SABusComp=null;
        var sFlag="""", ActiveView="""", vMessage="""", loyTierClass="""";
        
        ActiveView = theApplication().ActiveViewName();
		SABusComp = theApplication().ActiveBusObject().GetBusComp(""CUT Service Sub Accounts"");
		
		with (SABusComp)
		{
			loyTierClass = GetFieldValue(""STC Loyality Tier Class"");
		}

		if(loyTierClass == ""Premier"")
		{
			vMessage = ""If you migrate, you will lose all Elite customer benefits immediately & the new owner will not become an Elite customer. Please confirm!"";
			sFlag = confirm(vMessage);
			if (sFlag == false)
				return (""CancelOperation"");
			else
				return (""ContinueOperation"");
		}
		else
		{
			return (""ContinueOperation"");
		}
	}/*END > [26Apr2016][NAVINR][TRA_SIMREG: TOO - Elite customer popup]*/
	
	if(name == ""ServiceMigrationSvc"")
	{//[NAVIN: 16Oct2017: AdvanceCreditPayments]
		var oBS, inpPS, outPS;
		var vErrCode="""", vErrMsg="""", vAirtimeDue="""";
        var vFlag = """";
		var ActiveBO = null, SANBC = null;
		var sMsisdn = """", sServiceAccId = """";
        var ActiveView = theApplication().ActiveViewName();
		if(ActiveView != ""STC CUT Invoice Installed Assets View"")
		{
	        inpPS = theApplication().NewPropertySet();
	        outPS = theApplication().NewPropertySet();
			oBS = theApplication().GetService(""Workflow Process Manager"");
			
			sMsisdn = this.BusComp().GetFieldValue(""Serial Number"");
			//sServiceAccId = this.BusComp().GetFieldValue(""Service Account Id"");
			ActiveBO = theApplication().ActiveBusObject();
			SANBC = ActiveBO.GetBusComp(""CUT Service Sub Accounts"");
			sServiceAccId = SANBC.GetFieldValue(""Id"");

			if (!sServiceAccId)
				sServiceAccId = """";

			//alert (""Output:""+sMsisdn+""|""+sServiceAccId);
			with (inpPS)
			{
				SetProperty(""ProcessName"", ""STC Advance Credit Payments Wrapper WF"");
				SetProperty(""Object Id"", sServiceAccId);
				SetProperty(""MSISDN"", sMsisdn);
				SetProperty(""TransactionType"", name);
				SetProperty(""TransactionSubType"", ""Raise"");
				SetProperty(""TransactionId"", """");
				SetProperty(""CustAccId"", """");
			}
	        outPS = oBS.InvokeMethod(""RunProcess"", inpPS,outPS);
			with(outPS)
			{
				vErrCode = GetProperty(""Error Code"");
				vErrMsg = GetProperty(""Error Message"");
				vAirtimeDue = GetProperty(""FinalCreditAmt"");
			}
			if(vErrCode != """" && vErrCode != ""0"")
			{
				//theApplication().RaiseErrorText(vErrMsg);
				var vMessage = vErrMsg +"" Press 'Ok' to continue with Service Migration or press 'Cancel' to Stop!"";
				var sFlag = confirm(vMessage);
				if (sFlag == false)
					return (""CancelOperation"");
				else	
					return (""ContinueOperation"");
			}
			else
			{return (""ContinueOperation"");}
		}//	ActiveView
	}//	if(name == ""ServiceMigrationSvc"")
	
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{

	//// Abuzar:06-Jan-2020: Added for Automate Sales Journey SD: Capture Signature////

	if(name == ""CaptureSignature"" || name == ""MobCaptureSignature"")
	{
		try
		{
			var sADId,sOrdReason,sURL,sURL1;
			sADId = this.BusComp().GetFieldValue(""Id"");
			sOrdReason = ""AccountAdministrator"";
			var psIn = theApplication().NewPropertySet();
			var psOut = theApplication().NewPropertySet();
			psIn.SetProperty(""Type"",""VIVA_SIGN_URL"");
			
			if (name == ""MobCaptureSignature"")	//Indrasen:02Mar2021:Sales Automation Feature
				psIn.SetProperty(""LIC"",""MobileURL"");
			else
				psIn.SetProperty(""LIC"",""URL"");

			var sService = theApplication().GetService(""BS LOV Services"");
			psOut = sService.InvokeMethod(""GetLOVDescription"", psIn);
			sURL = psOut.GetProperty(""Description"");
			sURL1 = sURL + ""?"" + ""OrderId="" + sADId + ""&OrderReason="" + sOrdReason;
			window.open(sURL1);
			//alert(sURL1);
		}
		catch(e)
		{
			alert(""CatchBlock:""+e);
		}
		finally
		{
			sService=null;
			psIn=null;
			psOut=null;
		}
		return(""CancelOperation"");
	}



	return (""ContinueOperation"");
}
"
function Applet_PreInvokeMethod (name, inputPropSet)
{
	if(name == ""STCCreatePostpaidAccount"" || name == ""STCCreatePrepaidAccount"")
	{
		var sFlag = confirm(""Have you checked for valid GCC Id/CPR Id? If 'YES', Press 'OK' else 'Cancel'"");
		if(sFlag == false)
		return (""CancelOperation"");	
		else
		return (""ContinueOperation"");
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	if(name == ""STCCreatePostpaidAccount"" || name == ""STCCreatePrepaidAccount"")
	{
		var sFlag = confirm(""Have you checked for valid GCC Id/CPR Id? If 'YES', Press 'OK' else 'Cancel'"");
		if(sFlag == false)
		return (""CancelOperation"");	
		else
		return (""ContinueOperation"");
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	//Mayank: Added for RDS ------------- START------------
	if(name == ""CaptureSignature"")
	{
		try
		{
			var sSRNum,sOrdReason,sURL,sURL1;
			sSRNum = this.BusComp().GetFieldValue(""Id"");
			sOrdReason = ""ActivationOrder"";
			var psIn = theApplication().NewPropertySet();
			var psOut = theApplication().NewPropertySet();
			psIn.SetProperty(""Type"",""VIVA_SIGN_URL"");
			psIn.SetProperty(""LIC"",""URL"");
			var sService = theApplication().GetService(""BS LOV Services"");
			psOut = sService.InvokeMethod(""GetLOVDescription"", psIn);
			sURL = psOut.GetProperty(""Description"");
			sURL1 = sURL + ""?"" + ""OrderId="" + sSRNum + ""&OrderReason="" + sOrdReason;
			window.open(sURL1);
		}
		catch(e)
		{
			alert(""CatchBlock:""+e);
		}
		finally
		{
			sService=null;
			psIn=null;
			psOut=null;
		}
		return(""CancelOperation"");
	}
	//Mayank: Added for RDS ------------- STOP------------
	if(name == ""EditDetails"")
	{
		var vQueueName = """", sFlag = false;
		vQueueName = this.BusComp().GetFieldValue(""STC Queue Name"");
		if (vQueueName == ""AUTO_RETAIL_PREPAID_REGISTRATION"")
		{
			sFlag = confirm(""You have chosen to update customer details. Click on ‘OK’ to continue editing or click ‘Cancel’ to return back."");
			if(sFlag == false)
			return (""CancelOperation"");	
			else
			return (""ContinueOperation"");
		}
	}
	if(name == ""SaveDetails"")
	{
		var sFlag = confirm(""System will now update details against CAN/ BANs/ SANs of customer. Please note that the entered details will overwrite existing ones. Click 'Ok' to proceed or click 'Cancel' to re-validate."");
		if(sFlag == false)
		return (""CancelOperation"");	
		else
		return (""ContinueOperation"");
	}
	return (""ContinueOperation"");
}
function Applet_ChangeFieldValue (field, value)
{

}
function Applet_Load ()
{
	var reqQty= TheApplication().GetProfileAttr(""ReqQty"");
	if(reqQty == ""F"")
	{
		TheApplication().SetProfileAttr(""ReqQty"",""T"");
		TheApplication().SWEAlert(""Please Note: Contagious numbers are not available in required quantity!"");
	}
}
function Applet_ChangeFieldValue (field, value)
{

}
function Applet_Load ()
{
	var reqQty= TheApplication().GetProfileAttr(""ReqQty"");
	if(reqQty == ""F"")
	{
		TheApplication().SetProfileAttr(""ReqQty"",""T"");
		TheApplication().SWEAlert(""Please Note: Contagious numbers are not available in required quantity!"");
	}
}
function Applet_ChangeFieldValue (field, value)
{

}
function Applet_ChangeRecord ()
{

}
function Applet_Load ()
{

}
function Applet_PreInvokeMethod (name, inputPropSet)
{

	return (""ContinueOperation"");
}
function Applet_ChangeFieldValue (field, value)
{

}
function Applet_ChangeRecord ()
{

}
function Applet_Load ()
{

}
function Applet_PreInvokeMethod (name, inputPropSet)
{

	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	if(name == ""CreatePostpaidBillAcc"" || name == ""CreatePrepaidBillAcc"")
	{
		var sFlag = confirm(""Have you checked for valid GCC Id/CPR Id? If 'YES', Press 'OK' else 'Cancel'"");
		if(sFlag == false)
		return (""CancelOperation"");	
		else
		return (""ContinueOperation"");
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	if(name == ""CreatePostpaidBillAcc"" || name == ""CreatePrepaidBillAcc"")
	{
		var sFlag = confirm(""Have you checked for valid GCC Id/CPR Id? If 'YES', Press 'OK' else 'Cancel'"");
		if(sFlag == false)
		return (""CancelOperation"");	
		else
		return (""ContinueOperation"");
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	if (name == ""ConvertLOST"")
	{
	var ConvertLOSTFlg = confirm(""Are you sure that you have lost this opportunity? If you proceed with ‘Ok’ system will de-reserve all reserved MSISDNs and opportunity will be closed. Click ‘Cancel’ otherwise"");
	if(ConvertLOSTFlg == false)
    return (""CancelOperation"");
    else
    return (""ContinueOperation"");
	}

		if (name == ""ConvertWON"")
	{
	var ConvertWINFlg = confirm(""Are you sure to convert this opportunity as ‘Win’? If you proceed with ‘Ok’ system will freeze MSISDN reservation and you will not be able to update details anymore. Click ‘Cancel’ to proceed otherwise"");
	if(ConvertWINFlg == false)
    return (""CancelOperation"");
    else
    return (""ContinueOperation"");
	}


	return (""ContinueOperation"");
}
"
function Applet_PreInvokeMethod (name, inputPropSet)
{
var sAccountId;
var sCorporate;

try
{
 	sAccountId = this.BusComp().GetFieldValue(""Id"");
 	sCorporate =this.BusComp().GetFieldValue(""STC Corporate Type"");
 	TheApplication().SetProfileAttr(""BillAccountId"",sAccountId);
 	TheApplication().SetProfileAttr(""CorporateType"",sCorporate);
 
 	return (ContinueOperation);
}
catch(e)
{
	throw(e);
}
finally
{}
	
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	if(name == ""NewRecord"")
	{
	//	var vType = theApplication().GetProfileAttr(""STCBillAccType"");

	var StrappObjSC = theApplication();
	var vType = StrappObjSC.GetProfileAttr(""STCBillAccType"");

		if(vType == ""SME"" || vType == ""Corporate"")//sumank: Added for TRA Line count check for SME and Corporate
		{
			
			var sBillAccountId = """";
			sBillAccountId = StrappObjSC.GetProfileAttr(""BillAccountId"");
			var StrInputsSC = StrappObjSC.NewPropertySet();
			var StrOutputsSC = StrappObjSC.NewPropertySet();
			var StrsvcServiceSC = StrappObjSC.GetService(""Workflow Process Manager"");
			StrInputsSC.SetProperty(""ProcessName"",""STC Call TRA Prepaid Count Billing WF"");
			StrInputsSC.SetProperty(""Object Id"",sBillAccountId);
			StrOutputsSC = StrsvcServiceSC.InvokeMethod(""RunProcess"",StrInputsSC);
			var StrErrCode = StrOutputsSC.GetProperty(""StrErrorCode"");
			var StrErrMsg = StrOutputsSC.GetProperty(""StrErrorMessage"");
			if(StrErrCode == ""FE_SBL_CRM_002"")
			{
				var sFlag = confirm(""Quota for Physical SIM is not present. Click on 'OK' to proceed and create dummy SIM orders else Click on Cancel"");
				if(sFlag == false)
				return (""CancelOperation"");					
			}
			else if(StrErrCode != ""0"" && StrErrCode != ""FE_SBL_CRM_002"")
			{
				 theApplication().SWEAlert(StrErrorMessage);
		         return (""CancelOperation"");
			}
			else
			{
				return (""ContinueOperation"");
			}
			
		}//	if(vType == ""SME"" || vType == ""Corporate"")



		if(vType == ""Individual"")
		{
			var sFlag = confirm(""Have you checked for valid GCC Id/CPR Id? If 'YES', Press 'OK' else 'Cancel'"");
			if(sFlag == false)
			return (""CancelOperation"");	
			else
			//[MANUJ] : [Email Data Capture]
			var sAccountId = """";
			sAccountId = theApplication().GetProfileAttr(""STCBillAccId"");
			var appObjSC = theApplication();
			var InputsSC = appObjSC.NewPropertySet();
			var OutputsSC = appObjSC.NewPropertySet();
			var svcServiceSC = appObjSC.GetService(""Workflow Process Manager"");
			InputsSC.SetProperty(""ProcessName"",""STC Validate Primary Contact Details"");
			InputsSC.SetProperty(""Object Id"",sAccountId);
			InputsSC.SetProperty(""Operation"",""EMAIL"");
			OutputsSC = svcServiceSC.InvokeMethod(""RunProcess"",InputsSC);
			var ErrorMessage = OutputsSC.GetProperty(""Error Message"");
			var ValidEmail = OutputsSC.GetProperty(""ValidEmail"");
			if(ValidEmail == ""N"")
			{
				var sFlag1 = confirm(""Invalid Email address, please update valid email address or click 'OK' to continue."");
				if(sFlag1 == false)
				return (""CancelOperation"");	
			}
			//[MANUJ] : [Email Data Capture]
			return (""ContinueOperation"");
		}
	}
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
//Abuzar: 07-Jan-2020: SD: Automate Sales Journey: Capture Signature//
//[Modified By: NAVIN: 25Dec2020: Business Mobility Tablet]

	if(name == ""CaptureSignature"" || name == ""MobCaptureSignature"")
	{
		try
		{
			this.BusComp().WriteRecord();
			//var appObj = theApplication();
			var sService1 = theApplication().GetService(""Workflow Process Manager"");
			var sInputs1 = theApplication().NewPropertySet();
			var sOutput1 = theApplication().NewPropertySet();
			sInputs1.SetProperty(""ProcessName"", ""STC Invoke DVM WF"");
			sInputs1.SetProperty(""Object Id"", this.BusComp().GetFieldValue(""Id""));
			sInputs1.SetProperty(""RuleSetName"", ""STC Bulk Order Capture Signature Validation"");
			sInputs1.SetProperty(""ActiveObject"", ""N"");
			sInputs1.SetProperty(""BusinessObject"", ""STC Business Bulk Activation BO"");
			sInputs1.SetProperty(""BusinessComponent"", ""STC Bulk Activation Header BC"");
			sOutput1 = sService1.InvokeMethod(""RunProcess"", sInputs1);
			var Error = sOutput1.GetProperty(""ReturnMsg"");
			if(Error != """")
			{
				alert(Error); 
				return (""CancelOperation"");
			}

			var sOrderId,sOrdReason,sURL,sURL1;
			sOrderId = this.BusComp().GetFieldValue(""Id"");
			sOrdReason = ""BulkActivation"";
			var psIn = theApplication().NewPropertySet();
			var psOut = theApplication().NewPropertySet();
			psIn.SetProperty(""Type"",""VIVA_SIGN_URL"");
			
			if (name == ""MobCaptureSignature"")
				psIn.SetProperty(""LIC"",""MobileURL"");
			else
				psIn.SetProperty(""LIC"",""URL"");
				
			var sService = theApplication().GetService(""BS LOV Services"");
			psOut = sService.InvokeMethod(""GetLOVDescription"", psIn);
			sURL = psOut.GetProperty(""Description"");
			sURL1 = sURL + ""?"" + ""OrderId="" + sOrderId + ""&OrderReason="" + sOrdReason;
			window.open(sURL1);
			
			//alert(sURL1);
		}
		catch(e)
		{
			alert(""CatchBlock:""+e);
		}
		finally
		{
			sService=null;
			psIn=null;
			psOut=null;
		}
		return(""CancelOperation"");
	}

	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
//Abuzar: 07-Jan-2020: SD: Automate Sales Journey: Capture Signature//
//[Modified By: NAVIN: 25Dec2020: Business Mobility Tablet]

	if(name == ""CaptureSignature"" || name == ""MobCaptureSignature"")
	{
		try
		{
			this.BusComp().WriteRecord();
			var appObj = theApplication();
			var sService1 = appObj.GetService(""Workflow Process Manager"");
			var sInputs1 = appObj.NewPropertySet();
			var sOutput1 = appObj.NewPropertySet();
			sInputs1.SetProperty(""ProcessName"", ""STC Invoke DVM WF"");
			sInputs1.SetProperty(""Object Id"", this.BusComp().GetFieldValue(""Id""));
			sInputs1.SetProperty(""RuleSetName"", ""STC Bulk Modify Order Capture Signature Validation"");
			sInputs1.SetProperty(""ActiveObject"", ""N"");
			sInputs1.SetProperty(""BusinessObject"", ""STC Business Bulk Modify Orders BO"");
			sInputs1.SetProperty(""BusinessComponent"", ""STC Bulk Modify Orders Header BC"");
			sOutput1 = sService1.InvokeMethod(""RunProcess"", sInputs1);
			var Error = sOutput1.GetProperty(""ReturnMsg"");
			if(Error != """")
			{
				alert(Error); 
				return (""CancelOperation"");
			}

			var sOrderId,sOrdReason,sURL,sURL1;
			sOrderId = this.BusComp().GetFieldValue(""Id"");
			sOrdReason = ""BulkActivation"";
			var psIn = theApplication().NewPropertySet();
			var psOut = theApplication().NewPropertySet();
			psIn.SetProperty(""Type"",""VIVA_SIGN_URL"");

			if (name == ""MobCaptureSignature"")
				psIn.SetProperty(""LIC"",""MobileURL"");
			else
				psIn.SetProperty(""LIC"",""URL"");

			var sService = theApplication().GetService(""BS LOV Services"");
			psOut = sService.InvokeMethod(""GetLOVDescription"", psIn);
			sURL = psOut.GetProperty(""Description"");
			sURL1 = sURL + ""?"" + ""OrderId="" + sOrderId + ""&OrderReason="" + sOrdReason;
			window.open(sURL1);
			//alert(sURL1);
		}
		catch(e)
		{
			alert(""CatchBlock:""+e);
		}
		finally
		{
			sService=null;
			psIn=null;
			psOut=null;
		}
		return(""CancelOperation"");
	}

return (""ContinueOperation"");
}
"
function Applet_PreInvokeMethod (name, inputPropSet)
{
if (name == ""ValidateRecords"")

	{
	this.BusComp().WriteRecord();
	appObj = theApplication();
	var vBulkHeaderId = this.BusComp().GetFieldValue(""Bulk Payment Header Id"");
	var sService = appObj.GetService(""Workflow Process Manager"");
	var sInputs = appObj.NewPropertySet();
	var sOutput = appObj.NewPropertySet();
	sInputs.SetProperty(""ProcessName"", ""STCBulkPaymentValidateWF"");
	sInputs.SetProperty(""Object Id"",vBulkHeaderId);
	sInputs.SetProperty(""Process"",""TotalSum"");
	sOutput = sService.InvokeMethod(""RunProcess"", sInputs);
	var vTotalAmount = sOutput.GetProperty(""ChildAmount"");
	var sCount = sOutput.GetProperty(""LineCount"");
	
	
		//var ConfirmText = ""Number of BANs :""+sCount+""\n""+""Payment Amount :""+vTotalAmount;MAyank: For bulk Enhancement
		var ConfirmText = ""Number of SANs :""+sCount+""\n""+""Payment Amount :""+vTotalAmount;//MAyank: For bulk Enhancement
		var sCreditFlag = confirm(ConfirmText);
		if(sCreditFlag == false)
		{
		return (""CancelOperation"");
		}
		else
		{
		var sService1 = appObj.GetService(""Workflow Process Manager"");
		var sInputs1 = appObj.NewPropertySet();
		var sOutput1 = appObj.NewPropertySet();
		sInputs1.SetProperty(""ProcessName"", ""STCBulkPaymentValidateWF"");
		sInputs1.SetProperty(""Object Id"",vBulkHeaderId);
	    sOutput1 = sService.InvokeMethod(""RunProcess"", sInputs1);
	    var Error = sOutput1.GetProperty(""Error Message"");
	    if(Error != ""Success"")
	    {
	    	alert(Error); 
	    	return (""CancelOperation"");
	    }
		return (""CancelOperation"");
		}	
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
if (name == ""ValidateRecords"")

	{
	this.BusComp().WriteRecord();
	appObj = theApplication();
	var vBulkHeaderId = this.BusComp().GetFieldValue(""Bulk Payment Header Id"");
	var sService = appObj.GetService(""Workflow Process Manager"");
	var sInputs = appObj.NewPropertySet();
	var sOutput = appObj.NewPropertySet();
	sInputs.SetProperty(""ProcessName"", ""STCBulkPaymentValidateWF"");
	sInputs.SetProperty(""Object Id"",vBulkHeaderId);
	sInputs.SetProperty(""Process"",""TotalSum"");
	sOutput = sService.InvokeMethod(""RunProcess"", sInputs);
	var vTotalAmount = sOutput.GetProperty(""ChildAmount"");
	var sCount = sOutput.GetProperty(""LineCount"");
	
	
		//var ConfirmText = ""Number of BANs :""+sCount+""\n""+""Payment Amount :""+vTotalAmount;MAyank: For bulk Enhancement
		var ConfirmText = ""Number of SANs :""+sCount+""\n""+""Payment Amount :""+vTotalAmount;//MAyank: For bulk Enhancement
		var sCreditFlag = confirm(ConfirmText);
		if(sCreditFlag == false)
		{
		return (""CancelOperation"");
		}
		else
		{
		var sService1 = appObj.GetService(""Workflow Process Manager"");
		var sInputs1 = appObj.NewPropertySet();
		var sOutput1 = appObj.NewPropertySet();
		sInputs1.SetProperty(""ProcessName"", ""STCBulkPaymentValidateWF"");
		sInputs1.SetProperty(""Object Id"",vBulkHeaderId);
	    sOutput1 = sService.InvokeMethod(""RunProcess"", sInputs1);
	    var Error = sOutput1.GetProperty(""Error Message"");
	    if(Error != ""Success"")
	    {
	    	alert(Error); 
	    	return (""CancelOperation"");
	    }
		return (""CancelOperation"");
		}	
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	if(name == ""VoucherAccept"")
	{
		var sFlag = confirm(""System will now process payment through voucher. Please press ‘Ok’ to continue or press ‘Cancel"");
		if(sFlag == false)
		return (""CancelOperation"");
		else
		return (""ContinueOperation"");
	}

	return (""ContinueOperation"");
}
function Applet_Load ()
{

}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	var sAppMode = TheApplication().GetProfileAttr(""IsOpenUI"");//Mayank: Added for Gaurdian
	//if(name == ""GetCPR"")//Mayank: Added for Gaurdian
	if(name == ""GetCPR"" && sAppMode == 0)//Mayank: Added for Gaurdian
	{
		var smartcard = new ActiveXObject(""BH.CIO.Smartcard.IDCardManager.CardManager"");
		var testActivation = smartcard.TestSmartCardComActivation(""TestActivation"");
		var initiate =  smartcard.InitializesSCReaderLibrary();
		var formatDOB;
		var newformatDOB;
		var newformatExpiry;
		var newformatPassportExpiryDate;//Added for smartcard autopopulate SD
		var newformatPassportIssueDate;//Added for smartcard autopopulate SD
		var CheckExist;	
		var CPR;
		if(!initiate)
		{
			alert(""Card Initialization falied. Please try again"");
		}
		if(initiate)
		{
			smartcard.EnableSmartcardEvents();
			smartcard.ToIncludeBiometricSupportInfo = true;
			smartcard.ToIncludeDisabilityInfo = true;
			smartcard.ToIncludeEmploymentInfo = true;
			smartcard.ToIncludePassportInfo = true;
			smartcard.ToIncludePersonalInfo = true;
			smartcard.ToIncludePhoto = true;
			smartcard.ToIncludeAddressInfo = true;
			smartcard.ToIncludeSignature = true;
			var read = smartcard.ReadCard();
			if(read)
			{
				CPR = smartcard.SmartcardData.IdNumber;
				var appObj = theApplication();
				var psInputs = appObj.NewPropertySet();
				var psOutputs = appObj.NewPropertySet();
			}//if(Read)
		}//if(Initiate)
		with(this.BusComp())
		{
			SetFieldValue(""CPR"", CPR);
		}
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{

///////////////Abuzar:07Jan2020: Capture Signature: SD: Automate Sales Journey///////////////

if(name == ""CaptureSignature"")
 {
  try
  {

///////////////// Validation

		this.BusComp().WriteRecord();
		var appObj = theApplication();
		var sService1 = appObj.GetService(""Workflow Process Manager"");
		var sInputs1 = appObj.NewPropertySet();
		var sOutput1 = appObj.NewPropertySet();
		sInputs1.SetProperty(""ProcessName"", ""STC Invoke DVM WF"");
		sInputs1.SetProperty(""Object Id"", this.BusComp().GetFieldValue(""Id""));
		sInputs1.SetProperty(""RuleSetName"", ""STC Bulk MNP Order Capture Signature Validation"");
		sInputs1.SetProperty(""ActiveObject"", ""N"");
		sInputs1.SetProperty(""BusinessObject"", ""STC Business Products Bulk CRM BO"");
		sInputs1.SetProperty(""BusinessComponent"", ""STC MENA Request Header BC"");
	    sOutput1 = sService1.InvokeMethod(""RunProcess"", sInputs1);
	    var Error = sOutput1.GetProperty(""ReturnMsg"");
	    if(Error != """")
	    {
	    	alert(Error); 
	    	return (""CancelOperation"");
	    }


////////////////



   var sOrderId,sOrdReason,sURL,sURL1;
   sOrderId = this.BusComp().GetFieldValue(""Id"");
   sOrdReason = ""BulkActivation"";
   var psIn = theApplication().NewPropertySet();
   var psOut = theApplication().NewPropertySet();
   psIn.SetProperty(""Type"",""VIVA_SIGN_URL"");
   psIn.SetProperty(""LIC"",""URL"");
   var sService = theApplication().GetService(""BS LOV Services"");
   psOut = sService.InvokeMethod(""GetLOVDescription"", psIn);
   sURL = psOut.GetProperty(""Description"");
   sURL1 = sURL + ""?"" + ""OrderId="" + sOrderId + ""&OrderReason="" + sOrdReason;
   window.open(sURL1);
   //alert(sURL1);
  }
  catch(e)
  {
   alert(""CatchBlock:""+e);
  }
  finally
  {
   sService=null;
   psIn=null;
   psOut=null;
  }
  return(""CancelOperation"");
 }

	return (""ContinueOperation"");
}
"
function Applet_PreInvokeMethod (name, inputPropSet)
{
	if(name == ""NewRecord"")
	{
			var	appObjSC = theApplication();
			var CustomerType = appObjSC.GetProfileAttr(""STCCustomerType"");
			if(CustomerType != ""Individual""){
			var inputPropSet = theApplication().NewPropertySet();
			inputPropSet.SetProperty(""SWEMethod"", ""ShowPopup"");
			inputPropSet.SetProperty(""SWETA"", ""STC Corporate ISL Audit Popup Applet""); // Applet Name to be invoked
			inputPropSet.SetProperty(""SWEW"", ""700"");
			inputPropSet.SetProperty(""SWEH"", ""700"");
			inputPropSet.SetProperty(""SWESP"", ""true"");
			inputPropSet.SetProperty(""SWEM"", ""Edit List""); // Base, Edit, Edit List
			this.InvokeMethod(""ShowPopup"", inputPropSet);
			return (""CancelOperation"");
			}
			else
			{
			return (""ContinueOperation"");
			}
	}
	return (""ContinueOperation"");
}
function Applet_Load ()
{

}
function Applet_PreInvokeMethod (name, inputPropSet)
{

	if (name == ""FetchCustomer"")
	{
	var sCreditFlag = confirm(""Please note that if ID Number is not existing in CRM, navigation would occur to New Customer Reservation View."");
	if(sCreditFlag == false)
    return (""CancelOperation"");
    else
    return (""ContinueOperation"");
	}

	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	if(name == ""CreatePostpaidBillAcc"" || name == ""CreatePrepaidBillAcc"")
	{
		var sFlag = confirm(""Have you checked for valid GCC Id/CPR Id? If 'YES', Press 'OK' else 'Cancel'"");
		if(sFlag == false)
		return (""CancelOperation"");	
		else
		return (""ContinueOperation"");
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	if(name == ""NewRecord"")
	{
			var	appObjSC = theApplication();
			var CustomerType = appObjSC.GetProfileAttr(""STCCustomerType"");
			if(CustomerType != ""Individual""){
			var inputPropSet = theApplication().NewPropertySet();
			inputPropSet.SetProperty(""SWEMethod"", ""ShowPopup"");
			inputPropSet.SetProperty(""SWETA"", ""STC Corporate ISL Audit Popup Applet""); // Applet Name to be invoked
			inputPropSet.SetProperty(""SWEW"", ""700"");
			inputPropSet.SetProperty(""SWEH"", ""700"");
			inputPropSet.SetProperty(""SWESP"", ""true"");
			inputPropSet.SetProperty(""SWEM"", ""Edit List""); // Base, Edit, Edit List
			this.InvokeMethod(""ShowPopup"", inputPropSet);
			return (""CancelOperation"");
			}
			else
			{
			return (""ContinueOperation"");
			}
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	if(name == ""NewRecord"")
	{
			var	appObjSC = theApplication();
			var CustomerType = appObjSC.GetProfileAttr(""STCCustomerType"");
			if(CustomerType != ""Individual""){
			var inputPropSet = theApplication().NewPropertySet();
			inputPropSet.SetProperty(""SWEMethod"", ""ShowPopup"");
			inputPropSet.SetProperty(""SWETA"", ""STC Corporate ISL Audit Popup Applet""); // Applet Name to be invoked
			inputPropSet.SetProperty(""SWEW"", ""700"");
			inputPropSet.SetProperty(""SWEH"", ""700"");
			inputPropSet.SetProperty(""SWESP"", ""true"");
			inputPropSet.SetProperty(""SWEM"", ""Edit List""); // Base, Edit, Edit List
			this.InvokeMethod(""ShowPopup"", inputPropSet);
			return (""CancelOperation"");
			}
			else
			{
			return (""ContinueOperation"");
			}
	}
	return (""ContinueOperation"");
}
function Applet_Load ()
{
try
{
		var sApplnURL = document.location.toString();
		var sApplnMode = sApplnURL.indexOf(""OUI"").toString();
		if(sApplnMode == -1)
		{
			TheApplication().SetProfileAttr(""ApplicationMode"",""HI"");
		}
		else
		{
			TheApplication().SetProfileAttr(""ApplicationMode"",""OpenUI"");
		}
		TheApplication().SetProfileAttr(""UIBahrainiUpdateNormalUser"",""N"");
		return (""ContinueOperation"");
}
catch(e)
{
	alert(e);
	return(""CancelOperation""); 
}
finally
{

}
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
try
{
if(name == ""ReadSmartCard"")
{
	var appObj = theApplication();
	var psIn = appObj.NewPropertySet();
	var psOut = appObj.NewPropertySet();
	
	fn_ReadSmartCard(psIn,psOut);
	var FName = psOut.GetProperty(""FName"");
	var LName = psOut.GetProperty(""LName"");
	var MiddleName = psOut.GetProperty(""MiddleName"");
	var CPR = psOut.GetProperty(""CPR"");
	var Gender = psOut.GetProperty(""Gender"");
	var newformatDOB = psOut.GetProperty(""newformatDOB"");
	var newformatExpiry = psOut.GetProperty(""newformatExpiry"");
	var Flat = psOut.GetProperty(""Flat"");
	var Building = psOut.GetProperty(""Building"");
	var Road = psOut.GetProperty(""Road"");
	var BlockNo = psOut.GetProperty(""BlockNo"");
	var Governorate = psOut.GetProperty(""Governorate"");
	var country = psOut.GetProperty(""country"");
	var Occupation = psOut.GetProperty(""Occupation"");
	var IDType =  psOut.GetProperty(""IDType"");
	var GCCCountryCode =  psOut.GetProperty(""GCCCountryCode"");
	with(this.BusComp())
	{
		var CustType = GetFieldValue(""Account Type"");
		if(CustType == """")
		{
			var sFlag = confirm(""Please select Customer Type"");
			if(sFlag == false)
			{
				return (""CancelOperation"");
			} 	
		}//if(CustType == """")
		else if(CustType != ""Individual"")
		{
			SetFieldValue(""STC First Name"", FName);
			SetFieldValue(""STC Last Name"", LName);
			SetFieldValue(""STC Middle Name"", MiddleName);
			SetFieldValue(""ID"", CPR);
			SetFieldValue(""Gender"", Gender);
			SetFieldValue(""Date Of Birth"", newformatDOB);
			SetFieldValue(""ID Expiry Date"", newformatExpiry);
			SetFieldValue(""Flat/Villa No"", Flat);
			SetFieldValue(""Building No"", Building);
			SetFieldValue(""Road No"", Road);
			SetFieldValue(""Block No"", BlockNo);
			SetFieldValue(""Governorate"", Governorate);
			SetFieldValue(""Address Type"", ""Billing"");
			SetFieldValue(""Nationality"", country); 
		}
		else
		{
			SetFieldValue(""First Name"", FName);
			SetFieldValue(""Last Name"", LName);
			SetFieldValue(""Middle Name"", MiddleName);
			SetFieldValue(""ID"", CPR);
			SetFieldValue(""Gender"", Gender);
			SetFieldValue(""Date Of Birth"", newformatDOB);
			SetFieldValue(""ID Type"", IDType);
			SetFieldValue(""ID Expiry Date"", newformatExpiry);
			SetFieldValue(""Flat/Villa No"", Flat);
			SetFieldValue(""Building No"", Building);
			SetFieldValue(""Road No"", Road);
			SetFieldValue(""Block No"", BlockNo);
			SetFieldValue(""Address Type"", ""Billing"");
			SetFieldValue(""Governorate"", Governorate);
			SetFieldValue(""Nationality"", country);
			SetFieldValue(""Card Occupation"",Occupation);
			SerFieldValue(""SubscriberCountry"",""BH"");
			alert(GCCCountryCode);
		}//WriteRecord();
	}//with(this.BusComp())
	return(""CancelOperation"");
}
if(name == ""CreateCustAndBillAccntPrepaid"" || name == ""CreateCustAndBillAccntPostpaid"")
{
	var sFlag = confirm(""Have you checked for valid GCC Id/CPR Id? If 'YES', Press 'OK' else 'Cancel'"");
	if(sFlag == false)
	return (""CancelOperation"");	
	else
	return (""ContinueOperation"");
}

sAppMode = TheApplication().GetProfileAttr(""IsOpenUI"");
if(name == ""STCTEST"" && sAppMode == 0) 
		{ 
			var CPR,Name,Gender,Dob,CardExpiry,FName,LName,MiddleName,Address,Flat,Building,Road,BlockNo,Governorate,Nationality,Occupation,SponsorName,SponsorNo,PassportNo,PassportIssueDate,PassportExpiryDate,LabourForceParticipation,EmployerNumber,EmployerName;
			//MANUJ Added to conditionally check for Old/New DLL -- START
			var SId = this.BusComp().GetFieldValue(""Id"");
			var appObjSC = theApplication();
			var InputsSC = appObjSC.NewPropertySet();
			var OutputsSC = appObjSC.NewPropertySet();
			var svcServiceSC = appObjSC.GetService(""Workflow Process Manager"");
			InputsSC.SetProperty(""ProcessName"",""STC SmartCard Old_New DLL Decider"");
			InputsSC.SetProperty(""Object Id"",SId);
			OutputsSC = svcServiceSC.InvokeMethod(""RunProcess"",InputsSC);
			var DLLFlag = OutputsSC.GetProperty(""Value"");
			//MANUJ Added to conditionally check for Old/New DLL -- END
			//Profile Section				
			TheApplication().SetProfileAttr(""UIBahrainiUpdateNormalUser"",""Y"");
			//Profile Section
			if(DLLFlag == ""Old"")
			{
			var smartcard = new ActiveXObject(""KOBSC.SDK.SmartCardManagerLegacy"");
			var initiateOld = smartcard.InitateSmartCardManagerLibrary();
			var formatDOB;
			var newformatDOB;
			var newformatExpiry;
			var newformatPassportExpiryDate;//Added for smartcard autopopulate SD
			var newformatPassportIssueDate;//Added for smartcard autopopulate SD
			if(!initiateOld)
			{
			alert(""Card Initialization falied. Please try again"");
			}
			
			if(initiateOld)
			{
				var samerror = false"";
				var carderror = false"";
				var readOld = smartcard.ReadDataFromCard(samerror, carderror);	
	
		if(readOld)
		{
			CPR = smartcard.DataFromSmartCard.CPR0104_ElementData;
			Name = smartcard.DataFromSmartCard.FullNameEn_ElementData;
			Gender = smartcard.DataFromSmartCard.CPR0117_ElementData;
			Dob = smartcard.DataFromSmartCard.CPR0118_ElementData;
			CardExpiry = smartcard.DataFromSmartCard.CPR0119_ElementData;
			FName = smartcard.DataFromSmartCard.CPR0105_ElementData;
			LName = smartcard.DataFromSmartCard.CPR0110_ElementData;
			MiddleName = smartcard.DataFromSmartCard.CPR0106_ElementData;
			Address = smartcard.DataFromSmartCard.CorrenpondenceAddress_ElementData;
			Flat = smartcard.DataFromSmartCard.CPR0308_ElementData;
			Building = smartcard.DataFromSmartCard.CPR0309_ElementData;
			Road = smartcard.DataFromSmartCard.CPR0312_ElementData;
			BlockNo = smartcard.DataFromSmartCard.CPR0315_ElementData;
			//var Governorate = smartcard.DataFromSmartCard.CPR0318_ElementData;Commented as not captured in card
			Nationality = smartcard.DataFromSmartCard.GDNPR0103_ElementData;
			Occupation= smartcard.DataFromSmartCard.CPR1203_ElementData;
			SponsorName= smartcard.DataFromSmartCard.CPR1237_ElementData;//AutoPopulate
			SponsorNo= smartcard.DataFromSmartCard.CPR1236_ElementData;//AutoPopulate
			PassportNo= smartcard.DataFromSmartCard.GDNPR0203_ElementData;//AutoPopulate
			PassportIssueDate= smartcard.DataFromSmartCard.GDNPR0206_ElementData;//AutoPopulate
			PassportExpiryDate= smartcard.DataFromSmartCard.GDNPR0207_ElementData;//AutoPopulate
			LabourForceParticipation= smartcard.DataFromSmartCard.CPR1242_ElementData;//AutoPopulate
			// var CardIssueDate= smartcard.DataFromSmartCard.CPR02B02_ElementData;//AutoPopulate
			EmployerNumber= smartcard.DataFromSmartCard.CPR1205_ElementData;//AutoPopulate
			EmployerName= smartcard.DataFromSmartCard.CPR1206_ElementData;//AutoPopulate
		//  alert(Occupation);
		}//	if(readOld)
		}//	if(initiateOld)
		}//OLD DLL
				
		if(DLLFlag == ""New"")
		{
			var smartcard = new ActiveXObject(""BH.CIO.Smartcard.IDCardManager.CardManager"");
			var testActivation = smartcard.TestSmartCardComActivation(""TestActivation"");
			var initiate =  smartcard.InitializesSCReaderLibrary();
			var formatDOB;
			var newformatDOB;
			var newformatExpiry;
			var newformatPassportExpiryDate;//Added for smartcard autopopulate SD
			var newformatPassportIssueDate;//Added for smartcard autopopulate SD
			var CheckExist;	
			if(!initiate)
			{
			alert(""Card Initialization failed. Please try again"");
			}
		if(initiate)
			{
				smartcard.EnableSmartcardEvents();
				smartcard.ToIncludeBiometricSupportInfo = true;
				smartcard.ToIncludeDisabilityInfo = true;
				smartcard.ToIncludeEmploymentInfo = true;
				smartcard.ToIncludePassportInfo = true;
				smartcard.ToIncludePersonalInfo = true;
				smartcard.ToIncludePhoto = true;
				smartcard.ToIncludeAddressInfo = true;
				smartcard.ToIncludeSignature = true;
				var read = smartcard.ReadCard();
		if(read)
				{
				//theApplication().SetProfileAttr(""CPRGetDetailsTriggered"",""Y"");
				CPR = smartcard.SmartcardData.IdNumber;
				Name = smartcard.SmartcardData.EnglishFullName;
				Gender = smartcard.SmartcardData.Gender;
				Dob = smartcard.SmartcardData.BirthDate;
				CardExpiry = smartcard.SmartcardData.CardexpiryDate;
				CardCountry = smartcard.SmartcardData.CardCountry;
				Address = smartcard.SmartcardData.AddressEnglish;
				Nationality = smartcard.SmartcardData.NationalityCode;
				Occupation = smartcard.SmartcardData.OccupationEnglish;
				CardIssueDate = smartcard.SmartcardData.CardIssueDate;//Card Issue Date read
                var xmlHierarchy = smartcard.SmartcardData.SeralizeToXMLString();//convert to XML
                xmlHierarchy = xmlHierarchy.toString();//XML to string
                var appObj = theApplication();

				var psInputs = appObj.NewPropertySet();
				var psOutputs = appObj.NewPropertySet();
				var XMLService = appObj.GetService(""STC Get Country"");
				psInputs.SetProperty(""xmlHierarchy"",xmlHierarchy);
				psOutputs = XMLService.InvokeMethod(""GetCardDetails"",psInputs);
				FName = psOutputs.GetProperty(""FirstNameEnglish"");
				LName = psOutputs.GetProperty(""LastNameEnglish"");
				if(LName == '-')
				{
				LName = '';
				}
				MiddleName = psOutputs.GetProperty(""MiddleName1English"");
				if(MiddleName == '-')
				{
				MiddleName = '';
				}
				Flat = psOutputs.GetProperty(""FlatNo"");
				Building = psOutputs.GetProperty(""BuildingNo"");
				Road = psOutputs.GetProperty(""RoadNo"");
				BlockNo = psOutputs.GetProperty(""BlockNo"");
				//var Governorate = psOutputs.GetProperty(""GovernorateNameEnglish"");
				//Occupation Missing
				SponsorName= smartcard.SmartcardData.SponserNameEnglish;//AutoPopulate
				SponsorNo= smartcard.SmartcardData.SponserId;//AutoPopulate
				PassportNo= smartcard.SmartcardData.PassportNumber;//AutoPopulate
				PassportIssueDate= smartcard.SmartcardData.PassportIssueDate;//AutoPopulate
				PassportExpiryDate= smartcard.SmartcardData.PassportExpiryDate;//AutoPopulate
				LabourForceParticipation= psOutputs.GetProperty(""LaborForceParticipation"");//LFP need to analyze
				// var CardIssueDate= smartcard.DataFromSmartCard.CPR02B02_ElementData;//AutoPopulate
				EmployerNumber= smartcard.SmartcardData.EmploymentId;//AutoPopulate
				EmployerName= smartcard.SmartcardData.EmploymentNameEnglish;//AutoPopulate
				
			}//if(Read)
				
		   }//if(Initiate)
			
		}//NEW DLL
					var appObj = theApplication();
					var Inputs = appObj.NewPropertySet();
					var Outputs = appObj.NewPropertySet();
					
					var svcService = appObj.GetService(""STC Get Country"");
					Inputs.SetProperty(""CountryCode"",Nationality);
					Inputs.SetProperty(""CardOccupation"",Occupation);
					Outputs = svcService.InvokeMethod(""GetCountry"",Inputs);
					var country = Outputs.GetProperty(""Nationality"");
					var SystemOccupation = Outputs.GetProperty(""SystemOccupation"");
					
			//	alert(SystemOccupation);	
			/*	try{
				var svcOccupation = appObj.GetService(""STC Get Occupation"");
				Inputs.SetProperty(""CardOccupation"",Occupation);
				Outputs = svcOccupation.InvokeMethod(""GetOccupation"",Inputs,Outputs);
				var SystemOccupation = Outputs.GetProperty(""SystemOccupation"");
				}
				catch(e)
				{
				}*/
				
			//	 alert(SystemOccupation);	
		
				var day = Dob.substring(0,2);
				var Mon = Dob.substring(3,5);
				var Year = Dob.substring(6,10);
				
				var Expday = CardExpiry.substring(0,2);
				var ExpMon = CardExpiry.substring(3,5);
				var ExpYear = CardExpiry.substring(6,10);
				
				var PExpday = PassportExpiryDate.substring(0,2);//Added for smartcard autopopulate SD
				var PExpMon = PassportExpiryDate.substring(3,5);//Added for smartcard autopopulate SD
				var PExpYear = PassportExpiryDate.substring(6,10);//Added for smartcard autopopulate SD
				
				var PIssueday = PassportIssueDate.substring(0,2);//Added for smartcard autopopulate SD
				var PIssueMon = PassportIssueDate.substring(3,5);//Added for smartcard autopopulate SD
				var PIssueYear = PassportIssueDate.substring(6,10);//Added for smartcard autopopulate SD
				
				
				formatDOB = day+""/""+Mon+""/""+Year;
				newformatDOB = Mon+""/""+day+""/""+Year;
				newformatExpiry = ExpMon+""/""+Expday+""/""+ExpYear;
				newformatPassportExpiryDate = PExpMon+""/""+PExpday+""/""+PExpYear;//Added for smartcard autopopulate SD
				newformatPassportIssueDate = PIssueMon+""/""+PIssueday+""/""+PIssueYear;//Added for smartcard autopopulate SD
			
				if(Gender == ""M"")
				{
					Gender = ""Male"";
				}
				else if(Gender == ""F"")
				{
					Gender = ""Female"";
				}
				
				with(this.BusComp())
				{
					var CustType = GetFieldValue(""Account Type"");
					if(CustType == """")
					{
					var sFlag = confirm(""Please select Customer Type"");
						if(sFlag == false)
						{
							return (""CancelOperation"");
						} 	
					}//if(CustType == """")
					else if(CustType != ""Individual"")
					{
						SetFieldValue(""STC First Name"", FName);
						SetFieldValue(""STC Last Name"", LName);
						SetFieldValue(""STC Middle Name"", MiddleName);
					//	SetFieldValue(""ID Type"", ""CR"");
						SetFieldValue(""ID"", CPR);
						SetFieldValue(""Gender"", Gender);
						SetFieldValue(""Date Of Birth"", newformatDOB);
						SetFieldValue(""ID Expiry Date"", newformatExpiry);
						SetFieldValue(""Flat/Villa No"", Flat);
						SetFieldValue(""Building No"", Building);
						SetFieldValue(""Road No"", Road);
						SetFieldValue(""Block No"", BlockNo);
						SetFieldValue(""Governorate"", Governorate);
				        SetFieldValue(""Address Type"", ""Billing"");
				        SetFieldValue(""Nationality"", country); 
					}
					else
					{
						SetFieldValue(""Contract Category"", ""Individual"");
						SetFieldValue(""First Name"", FName);
						SetFieldValue(""Last Name"", LName);
						SetFieldValue(""Middle Name"", MiddleName);
						SetFieldValue(""ID"", CPR);
						SetFieldValue(""Gender"", Gender);
						SetFieldValue(""Date Of Birth"", newformatDOB);
						SetFieldValue(""ID Type"", ""Bahraini ID"");
						SetFieldValue(""ID Expiry Date"", newformatExpiry);
						SetFieldValue(""Flat/Villa No"", Flat);
						SetFieldValue(""Building No"", Building);
						SetFieldValue(""Road No"", Road);
						SetFieldValue(""Block No"", BlockNo);
     					SetFieldValue(""Address Type"", ""Billing"");
//						SetFieldValue(""Governorate"", Governorate);Not Captured
						SetFieldValue(""Nationality"", country);
						SetFieldValue(""Card Occupation"",Occupation);
						SetFieldValue(""Current Occupation"",SystemOccupation);
						SetFieldValue(""STC Card Read Only"",""Yes"");
						SetFieldValue(""Sponsor Name"",SponsorName);//AutoPopulate
						SetFieldValue(""Sponsor ID Number"",SponsorNo);//AutoPopulate
						SetFieldValue(""Passport No"",PassportNo);//AutoPopulate
					    SetFieldValue(""Passport Issue Date"",newformatPassportIssueDate);//AutoPopulate Changed as part of Autopopulate SD
						SetFieldValue(""Passport Expiry Date"",newformatPassportExpiryDate);//AutoPopulate Changed as part of Autopopulate SD	
						SetFieldValue(""Labour Force Participation"",LabourForceParticipation);//AutoPopulate
					//	SetFieldValue(""Card Issue Date"",CardIssueDate);//AutoPopulate Not Captured
						SetFieldValue(""Employer Number"",EmployerNumber);//AutoPopulate
						SetFieldValue(""Employer Name"",EmployerName);//AutoPopulate
						WriteRecord();
						//InvokeMethod(""RefreshBusComp"");
					//	SetFieldValue(""Hobby"",""Yes"");
					}//WriteRecord();
				}//with(this.BusComp())
		
		return(""CancelOperation""); 
		}
	else
	
	return (""ContinueOperation"");
	}
	catch(e)
	{
		alert(e);
				return(""CancelOperation""); 
	}
}
function fn_ReadSmartCard(psIn,psOut)
{
	try
	{
		var smartcard = new ActiveXObject(""BH.CIO.Smartcard.IDCardManager.CardManager"");
		var testActivation = smartcard.TestSmartCardComActivation(""TestActivation"");
		var initiate =  smartcard.InitializesSCReaderLibrary();
		var formatDOB;
		var newformatDOB;
		var newformatExpiry;
		
		if(!initiate)
		{
			alert(""Card Initialization falied. Please try again"");
		}
	
		if(initiate)
		{
			smartcard.EnableSmartcardEvents();
			smartcard.ToIncludeBiometricSupportInfo = true;
			smartcard.ToIncludeDisabilityInfo = true;
			smartcard.ToIncludeEmploymentInfo = true;
			smartcard.ToIncludePassportInfo = true;
			smartcard.ToIncludePersonalInfo = true;
			smartcard.ToIncludePhoto = true;
			smartcard.ToIncludeAddressInfo = true;
			smartcard.ToIncludeSignature = true;
			var read = smartcard.ReadCard();

			if(read)
			{
				var CPR = smartcard.SmartcardData.IdNumber;
				var Name = smartcard.SmartcardData.EnglishFullName;
				var Gender = smartcard.SmartcardData.Gender;
				var Dob = smartcard.SmartcardData.BirthDate;
				var CardExpiry = smartcard.SmartcardData.CardexpiryDate;
				var CardCountry = smartcard.SmartcardData.CardCountry;
				var Address = smartcard.SmartcardData.AddressEnglish;
				var Nationality = smartcard.SmartcardData.NationalityCode;
				var Occupation = smartcard.SmartcardData.OccupationEnglish;
				var xmlHierarchy = smartcard.SmartcardData.SeralizeToXMLString();
				xmlHierarchy = xmlHierarchy.toString();

				var appObj = theApplication();

				var psInputs = appObj.NewPropertySet();
				var psOutputs = appObj.NewPropertySet();
				var XMLService = appObj.GetService(""STC Get Country"");
				psInputs.SetProperty(""xmlHierarchy"",xmlHierarchy);
				psOutputs = XMLService.InvokeMethod(""GetCardDetails"",psInputs);

				var FName = psOutputs.GetProperty(""FirstNameEnglish"");
				var LName = psOutputs.GetProperty(""LastNameEnglish"");
				var MiddleName = psOutputs.GetProperty(""MiddleName1English"");
				var Flat = psOutputs.GetProperty(""FlatNo"");
				var Building = psOutputs.GetProperty(""BuildingNo"");
				var Road = psOutputs.GetProperty(""RoadNo"");
				var BlockNo = psOutputs.GetProperty(""BlockNo"");
				var Governorate = psOutputs.GetProperty(""GovernorateNameEnglish"");

				var Inputs = appObj.NewPropertySet();
				var Outputs = appObj.NewPropertySet();
				var svcService = appObj.GetService(""STC Get Country"");

				Inputs.SetProperty(""CountryCode"",Nationality);
				Inputs.SetProperty(""CardCountry"",CardCountry);
				Outputs = svcService.InvokeMethod(""GetCountry"",Inputs);
				var country = Outputs.GetProperty(""Nationality"");
				var GCCCountryCode = Outputs.GetProperty(""GCCCountryCode"");

				var day = Dob.substring(0,2);
				var Mon = Dob.substring(3,5);
				var Year = Dob.substring(6,10);
				var Expday = CardExpiry.substring(0,2);
				var ExpMon = CardExpiry.substring(3,5);
				var ExpYear = CardExpiry.substring(6,10);
	
				formatDOB = day+""/""+Mon+""/""+Year;				
				newformatDOB = Mon+""/""+day+""/""+Year;
				newformatExpiry = ExpMon+""/""+Expday+""/""+ExpYear;
	
				if(Gender == ""M"" || Gender == ""m"" || Gender == ""Male"" || Gender == ""MALE"")
				{
					Gender = ""Male"";
				}
				else if(Gender == ""F"" || Gender == f"" || Gender == ""Female"" || Gender == ""FEMALE"")
				{
					Gender = ""Female"";
				}

				if (FName == """" || FName == null)
					FName = Name;
				psOut.SetProperty(""FName"",FName);
				psOut.SetProperty(""LName"",LName);
				psOut.SetProperty(""MiddleName"",MiddleName);
				psOut.SetProperty(""CPR"",CPR);
				psOut.SetProperty(""Gender"",Gender);
				psOut.SetProperty(""newformatDOB"",newformatDOB);
				psOut.SetProperty(""newformatExpiry"",newformatExpiry);
				psOut.SetProperty(""Flat"",Flat);
				psOut.SetProperty(""Building"",Building);
				psOut.SetProperty(""Road"",Road);
				psOut.SetProperty(""BlockNo"",BlockNo);
				psOut.SetProperty(""Governorate"",Governorate);
				psOut.SetProperty(""country"",country);
				psOut.SetProperty(""Occupation"",Occupation);
				psOut.SetProperty(""GCCCountryCode"",GCCCountryCode);
				if (country == ""Bahraini"")
					psOut.SetProperty(""IDType"",""Bahraini ID"");
				else
					psOut.SetProperty(""IDType"",""GCC"");
					
			}//	if(read)
			else
			{
				alert(""Problem reading Smart Card"");
			}
		}//	if(initiate)
	}
	catch(e)
	{
		alert(e);
		return(""CancelOperation""); 
	}
	finally
	{
		appObj = null;
	}
}
function Applet_Load ()
{
try
{
		/*var sApplnURL = document.location.toString();
		var sApplnMode = sApplnURL.indexOf(""OUI"").toString();
		if(sApplnMode == -1)
		{
			TheApplication().SetProfileAttr(""ApplicationMode"",""HI"");
		}
		else
		{
			TheApplication().SetProfileAttr(""ApplicationMode"",""OpenUI"");
		}*/
		TheApplication().SetProfileAttr(""UIBahrainiUpdateNormalUser"",""N"");
		return (""ContinueOperation"");
}
catch(e)
{
	alert(e);
	return(""CancelOperation""); 
}
finally
{

}
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
try
{
var CPR,Name,Gender,Dob,CardExpiry,FName,LName,MiddleName,Address,Flat,Building,Road,BlockNo,Governorate,Nationality,Occupation,SponsorName,SponsorNo,PassportNo,PassportIssueDate,PassportExpiryDate,LabourForceParticipation,EmployerNumber,EmployerName;
var sCreditFlag;
var appObjSC = theApplication();
var sAppMode = TheApplication().GetProfileAttr(""IsOpenUI"");
if((name == ""STCTEST"" || name == ""GetGuardianDetails"") && sAppMode == 0) 
		{ 
			//Profile Section
			
			//[MANUJ]:[Guardian Minor SD] : [10/08/2016]
			if(name == ""GetGuardianDetails"")
			{
			var InputsG = appObjSC.NewPropertySet();
			var OutputsG = appObjSC.NewPropertySet();
			var svcServiceG = appObjSC.GetService(""STC Verify Guardian Details"");
			OutputsG = svcServiceG.InvokeMethod(""ValidateMinor"",InputsG);	
			
			}	
		/*	if(name == ""STCTEST"")
			{
			var InputsG = appObjSC.NewPropertySet();//
			var OutputsG = appObjSC.NewPropertySet();//
			var svcServiceG = appObjSC.GetService(""STC Verify Guardian Details"");
			OutputsG = svcServiceG.InvokeMethod(""MinorSUPVal"",InputsG);	
			var MinorSUP = OutputsG.GetProperty(""MinorSUP"");
			if(MinorSUP == ""Y"")
				{
				sCreditFlag = confirm(""Please check Employment Offer check box if customer has employee proof or Get Guardian details."");
				}
			if(sCreditFlag == false)
			{
			 return (""CancelOperation"");
			}

			}*/
			TheApplication().SetProfileAttr(""UIBahrainiUpdateNormalUser"",""Y"");
			var smartcard = new ActiveXObject(""BH.CIO.Smartcard.IDCardManager.CardManager"");
			var testActivation = smartcard.TestSmartCardComActivation(""TestActivation"");
			var initiate =  smartcard.InitializesSCReaderLibrary();
			var formatDOB;
			var newformatDOB;
			var newformatExpiry;
			var newformatPassportExpiryDate;//Added for smartcard autopopulate SD
			var newformatPassportIssueDate;//Added for smartcard autopopulate SD
			var CheckExist;	
			if(!initiate)
			{
			alert(""Card Initialization failed. Please try again"");
			}
		if(initiate)
			{
				smartcard.EnableSmartcardEvents();
				smartcard.ToIncludeBiometricSupportInfo = true;
				smartcard.ToIncludeDisabilityInfo = true;
				smartcard.ToIncludeEmploymentInfo = true;
				smartcard.ToIncludePassportInfo = true;
				smartcard.ToIncludePersonalInfo = true;
				smartcard.ToIncludePhoto = true;
				smartcard.ToIncludeAddressInfo = true;
				smartcard.ToIncludeSignature = true;
				var read = smartcard.ReadCard();
		if(read)
				{
				//theApplication().SetProfileAttr(""CPRGetDetailsTriggered"",""Y"");
				CPR = smartcard.SmartcardData.IdNumber;
				Name = smartcard.SmartcardData.EnglishFullName;
				Gender = smartcard.SmartcardData.Gender;
				Dob = smartcard.SmartcardData.BirthDate;
				CardExpiry = smartcard.SmartcardData.CardexpiryDate;
				CardCountry = smartcard.SmartcardData.CardCountry;
				Address = smartcard.SmartcardData.AddressEnglish;
				Nationality = smartcard.SmartcardData.NationalityCode;
				Occupation = smartcard.SmartcardData.OccupationEnglish;
				CardIssueDate = smartcard.SmartcardData.CardIssueDate;//Card Issue Date read
                var xmlHierarchy = smartcard.SmartcardData.SeralizeToXMLString();//convert to XML
                xmlHierarchy = xmlHierarchy.toString();//XML to string
                var appObj = theApplication();

				var psInputs = appObj.NewPropertySet();
				var psOutputs = appObj.NewPropertySet();
				var XMLService = appObj.GetService(""STC Get Country"");
				psInputs.SetProperty(""xmlHierarchy"",xmlHierarchy);
				psOutputs = XMLService.InvokeMethod(""GetCardDetails"",psInputs);
				FName = psOutputs.GetProperty(""FirstNameEnglish"");
				LName = psOutputs.GetProperty(""LastNameEnglish"");
					if(LName == '-')
				{
				LName = '';
				}
				MiddleName = psOutputs.GetProperty(""MiddleName1English"");
				if(MiddleName == '-')
				{
				MiddleName = '';
				}
				Flat = psOutputs.GetProperty(""FlatNo"");
				Building = psOutputs.GetProperty(""BuildingNo"");
				Road = psOutputs.GetProperty(""RoadNo"");
				BlockNo = psOutputs.GetProperty(""BlockNo"");
				//var Governorate = psOutputs.GetProperty(""GovernorateNameEnglish"");
				//Occupation Missing
				SponsorName= smartcard.SmartcardData.SponserNameEnglish;//AutoPopulate
				SponsorNo= smartcard.SmartcardData.SponserId;//AutoPopulate
				PassportNo= smartcard.SmartcardData.PassportNumber;//AutoPopulate
				PassportIssueDate= smartcard.SmartcardData.PassportIssueDate;//AutoPopulate
				PassportExpiryDate= smartcard.SmartcardData.PassportExpiryDate;//AutoPopulate
				LabourForceParticipation= psOutputs.GetProperty(""LaborForceParticipation"");//LFP need to analyze
				// var CardIssueDate= smartcard.DataFromSmartCard.CPR02B02_ElementData;//AutoPopulate
				EmployerNumber= smartcard.SmartcardData.EmploymentId;//AutoPopulate
				EmployerName= smartcard.SmartcardData.EmploymentNameEnglish;//AutoPopulate
				
			}//if(Read)
				
		   }//if(Initiate)
			
				//Commmon Code
		        
				var appObj = theApplication();
				var Inputs = appObj.NewPropertySet();
				var Outputs = appObj.NewPropertySet();
				var svcService = appObj.GetService(""STC Get Country"");
				Inputs.SetProperty(""CountryCode"",Nationality);
				Inputs.SetProperty(""CardOccupation"",Occupation);
				Outputs = svcService.InvokeMethod(""GetCountry"",Inputs);
				var country = Outputs.GetProperty(""Nationality"");
				var SystemOccupation = Outputs.GetProperty(""SystemOccupation"");
					
				var day = Dob.substring(0,2);
				var Mon = Dob.substring(3,5);
				var Year = Dob.substring(6,10);
				
				var Expday = CardExpiry.substring(0,2);
				var ExpMon = CardExpiry.substring(3,5);
				var ExpYear = CardExpiry.substring(6,10);
				
				var PExpday = PassportExpiryDate.substring(0,2);//Added for smartcard autopopulate SD
				var PExpMon = PassportExpiryDate.substring(3,5);//Added for smartcard autopopulate SD
				var PExpYear = PassportExpiryDate.substring(6,10);//Added for smartcard autopopulate SD
				
				var PIssueday = PassportIssueDate.substring(0,2);//Added for smartcard autopopulate SD
				var PIssueMon = PassportIssueDate.substring(3,5);//Added for smartcard autopopulate SD
				var PIssueYear = PassportIssueDate.substring(6,10);//Added for smartcard autopopulate SD
				
				
				formatDOB = day+""/""+Mon+""/""+Year;
				newformatDOB = Mon+""/""+day+""/""+Year;
				newformatExpiry = ExpMon+""/""+Expday+""/""+ExpYear;
				newformatPassportExpiryDate = PExpMon+""/""+PExpday+""/""+PExpYear;//Added for smartcard autopopulate SD
				newformatPassportIssueDate = PIssueMon+""/""+PIssueday+""/""+PIssueYear;//Added for smartcard autopopulate SD
			if(name == ""STCTEST"")
			{
			var InputsG = appObjSC.NewPropertySet();//
			var OutputsG = appObjSC.NewPropertySet();//
			var svcServiceG = appObjSC.GetService(""STC Verify Guardian Details"");
			InputsG.SetProperty(""DOB"",newformatDOB);
			OutputsG = svcServiceG.InvokeMethod(""MinorSUPVal"",InputsG);	
			var MinorSUP = OutputsG.GetProperty(""MinorSUP"");
			if(MinorSUP == ""Y"")
				{
				sCreditFlag = confirm(""Please check Employment Offer check box if customer has employee proof or click on Get Guardian details & verify guardian. This is applicable for minor customers"");
				}
			if(sCreditFlag == false)
			{
			 return (""CancelOperation"");
			}

			}
				if(Gender == ""M"")
				{
					Gender = ""Male"";
				}
				else if(Gender == ""F"")
				{
					Gender = ""Female"";
				}
				
		if(name == ""STCTEST"")
				{
				with(this.BusComp())
				{
					var CustType = GetFieldValue(""Account Type"");
					if(CustType == """")
					{
					var sFlag = confirm(""Please select Customer Type"");
						if(sFlag == false)
						{
							return (""CancelOperation"");
						} 	
					}//if(CustType == """")
					else if(CustType != ""Individual"")
					{
						SetFieldValue(""STC First Name"", FName);
						SetFieldValue(""STC Last Name"", LName);
						SetFieldValue(""STC Middle Name"", MiddleName);
					//	SetFieldValue(""ID Type"", ""CR"");
						SetFieldValue(""ID"", CPR);
						SetFieldValue(""Gender"", Gender);
						SetFieldValue(""Date Of Birth"", newformatDOB);
						SetFieldValue(""ID Expiry Date"", newformatExpiry);
						SetFieldValue(""Flat/Villa No"", Flat);
						SetFieldValue(""Building No"", Building);
						SetFieldValue(""Road No"", Road);
						SetFieldValue(""Block No"", BlockNo);
						SetFieldValue(""Governorate"", Governorate);
						SetFieldValue(""Address Type"", ""Billing"");
						SetFieldValue(""Nationality"", country);
					}
					else
					{
						SetFieldValue(""First Name"", FName);
						SetFieldValue(""Last Name"", LName);
						SetFieldValue(""Middle Name"", MiddleName);
						SetFieldValue(""ID"", CPR);
						SetFieldValue(""Gender"", Gender);
						SetFieldValue(""Date Of Birth"", newformatDOB);
						SetFieldValue(""Account Type"", ""Individual"");
						SetFieldValue(""ID Type"", ""Bahraini ID"");
						SetFieldValue(""ID Expiry Date"", newformatExpiry);
						SetFieldValue(""Flat/Villa No"", Flat);
						SetFieldValue(""Building No"", Building);
						SetFieldValue(""Road No"", Road);
						SetFieldValue(""Block No"", BlockNo);
     					SetFieldValue(""Address Type"", ""Billing"");
						//SetFieldValue(""Governorate"", Governorate);//Commented as not read
						SetFieldValue(""Nationality"", country);//
						SetFieldValue(""Card Occupation"",Occupation);
						SetFieldValue(""Current Occupation"",SystemOccupation);
						SetFieldValue(""Sponsor Name"",SponsorName);//AutoPopulate
						SetFieldValue(""Sponsor ID Number"",SponsorNo);//AutoPopulate
						SetFieldValue(""Passport No"",PassportNo);//AutoPopulate
					    SetFieldValue(""Passport Issue Date"",newformatPassportIssueDate);//AutoPopulate Changed as part of Autopopulate SD
						SetFieldValue(""Passport Expiry Date"",newformatPassportExpiryDate);//AutoPopulate Changed as part of Autopopulate SD
						SetFieldValue(""Labour Force Participation"",LabourForceParticipation);//AutoPopulate
						//SetFieldValue(""Card Issue Date"",CardIssueDate);//AutoPopulate//Commented as not read
						SetFieldValue(""Employer Number"",EmployerNumber);//AutoPopulate
						SetFieldValue(""Employer Name"",EmployerName);//AutoPopulate
						WriteRecord();

					}//WriteRecord();
				}//with(this.BusComp())
		//Common Code
		}
						else{

				with(this.BusComp())
				{
						var CustType = GetFieldValue(""Account Type"");
						SetFieldValue(""Guardian First Name"", FName);
						SetFieldValue(""Guardian Last Name"", LName);
						SetFieldValue(""Guardian Middle Name"", MiddleName);
						SetFieldValue(""Guardian ID"", CPR);
						SetFieldValue(""Guardian Gender"", Gender);
						SetFieldValue(""Guardian Date Of Birth"", newformatDOB);
						SetFieldValue(""Guardian ID Expiry Date"", newformatExpiry);
						SetFieldValue(""Guardian Flat/Villa No"", Flat);
						SetFieldValue(""Guardian Building No"", Building);
						SetFieldValue(""Guardian Road No"", Road);
						SetFieldValue(""Guardian Block No"", BlockNo);
     					SetFieldValue(""Guardian Address Type"", ""Billing"");
						SetFieldValue(""Guardian Nationality"", country);
						SetFieldValue(""Guardian Card Occupation"",Occupation);
						SetFieldValue(""Guardian Current Occupation"",SystemOccupation);
						SetFieldValue(""Guardian Sponsor Name"",SponsorName);//AutoPopulate
						SetFieldValue(""Guardian Sponsor ID Number"",SponsorNo);//AutoPopulate
						SetFieldValue(""Guardian Passport No"",PassportNo);//AutoPopulate
					    SetFieldValue(""Guardian Passport Issue Date"",newformatPassportIssueDate);//AutoPopulate Changed as part of Autopopulate SD
						SetFieldValue(""Guardian Passport Expiry Date"",newformatPassportExpiryDate);//AutoPopulate Changed as part of Autopopulate SD	
						SetFieldValue(""Guardian Labour Force Participation"",LabourForceParticipation);//AutoPopulate
						SetFieldValue(""Guardian Employer Number"",EmployerNumber);//AutoPopulate
						SetFieldValue(""Guardian Employer Name"",EmployerName);//AutoPopulate
						SetFieldValue(""Guardian Verified"",""N"");
						WriteRecord();
				}//with(this.BusComp()
				}
		
		
		return(""CancelOperation""); 
		}
	else
	
	return (""ContinueOperation"");
	}
	catch(e)
	{
		alert(e);
				return(""CancelOperation""); 
	}
}
function Applet_Load ()
{
try
{
		var sApplnURL = document.location.toString();
		var sApplnMode = sApplnURL.indexOf(""OUI"").toString();
		if(sApplnMode == -1)
		{
			TheApplication().SetProfileAttr(""ApplicationMode"",""HI"");
		}
		else
		{
			TheApplication().SetProfileAttr(""ApplicationMode"",""OpenUI"");
		}
		return (""ContinueOperation"");
}
catch(e)
{
	alert(e);
	return(""CancelOperation""); 
}
finally
{

}
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
try
{
var sAppMode = TheApplication().GetProfileAttr(""IsOpenUI"");
if(name == ""ReadSmartCard"" && sAppMode == 0)
{
	var appObj = theApplication();
	var psIn = appObj.NewPropertySet();
	var psOut = appObj.NewPropertySet();
	
	fn_ReadSmartCard(psIn,psOut);
	var FName = psOut.GetProperty(""FName"");
	var LName = psOut.GetProperty(""LName"");
	var MiddleName = psOut.GetProperty(""MiddleName"");
	var CPR = psOut.GetProperty(""CPR"");
	var Gender = psOut.GetProperty(""Gender"");
	var newformatDOB = psOut.GetProperty(""newformatDOB"");
	var newformatExpiry = psOut.GetProperty(""newformatExpiry"");
	var Flat = psOut.GetProperty(""Flat"");
	var Building = psOut.GetProperty(""Building"");
	var Road = psOut.GetProperty(""Road"");
	var BlockNo = psOut.GetProperty(""BlockNo"");
	var Governorate = psOut.GetProperty(""Governorate"");
	var country = psOut.GetProperty(""country"");
	var Occupation = psOut.GetProperty(""Occupation"");
	
	with(this.BusComp())
	{
		var CustType = GetFieldValue(""Account Type"");
		if(CustType == """")
		{
			var sFlag = confirm(""Please select Customer Type"");
			if(sFlag == false)
			{
				return (""CancelOperation"");
			} 	
		}//if(CustType == """")
		else if(CustType != ""Individual"")
		{
			SetFieldValue(""STC First Name"", FName);
			SetFieldValue(""STC Last Name"", LName);
			SetFieldValue(""STC Middle Name"", MiddleName);
			SetFieldValue(""ID"", CPR);
			SetFieldValue(""Gender"", Gender);
			SetFieldValue(""Date Of Birth"", newformatDOB);
			SetFieldValue(""ID Expiry Date"", newformatExpiry);
			SetFieldValue(""Flat/Villa No"", Flat);
			SetFieldValue(""Building No"", Building);
			SetFieldValue(""Road No"", Road);
			SetFieldValue(""Block No"", BlockNo);
			SetFieldValue(""Governorate"", Governorate);
			SetFieldValue(""Address Type"", ""Billing"");
			SetFieldValue(""Nationality"", country); 
		}
		else
		{
			SetFieldValue(""First Name"", FName);
			SetFieldValue(""Last Name"", LName);
			SetFieldValue(""Middle Name"", MiddleName);
			SetFieldValue(""ID"", CPR);
			SetFieldValue(""Gender"", Gender);
			SetFieldValue(""Date Of Birth"", newformatDOB);
			SetFieldValue(""ID Type"", ""Bahraini ID"");
			SetFieldValue(""ID Expiry Date"", newformatExpiry);
			SetFieldValue(""Flat/Villa No"", Flat);
			SetFieldValue(""Building No"", Building);
			SetFieldValue(""Road No"", Road);
			SetFieldValue(""Block No"", BlockNo);
			SetFieldValue(""Address Type"", ""Billing"");
			SetFieldValue(""Governorate"", Governorate);
			SetFieldValue(""Nationality"", country);
			SetFieldValue(""Card Occupation"",Occupation);
		}//WriteRecord();
	}//with(this.BusComp())
	return(""CancelOperation"");
}
if(name == ""STCTEST"" && sAppMode == 0) 
		{ 
			//alert(""Hi"");
			var smartcard = new ActiveXObject(""KOBSC.SDK.SmartCardManagerLegacy"");
			var initiate = smartcard.InitateSmartCardManagerLibrary();
			var formatDOB;
			var newformatDOB;
			var newformatExpiry;
			if(!initiate)
			{
			alert(""Card Initialization failed. Please try again"");
			}
			
			if(initiate)
			{
				var samerror = false"";
				var carderror = false"";
				var read = smartcard.ReadDataFromCard(samerror, carderror);	
	
		if(read)
		{
				var CPR = smartcard.DataFromSmartCard.CPR0104_ElementData;
				var Name = smartcard.DataFromSmartCard.FullNameEn_ElementData;
				var Gender = smartcard.DataFromSmartCard.CPR0117_ElementData;
				var Dob = smartcard.DataFromSmartCard.CPR0118_ElementData;
				var CardExpiry = smartcard.DataFromSmartCard.CPR0119_ElementData;
				var FName = smartcard.DataFromSmartCard.CPR0105_ElementData;
				var LName = smartcard.DataFromSmartCard.CPR0110_ElementData;
				var MiddleName = smartcard.DataFromSmartCard.CPR0106_ElementData;
				var Address = smartcard.DataFromSmartCard.CorrenpondenceAddress_ElementData;
				var Flat = smartcard.DataFromSmartCard.CPR0308_ElementData;
				var Building = smartcard.DataFromSmartCard.CPR0309_ElementData;
				var Road = smartcard.DataFromSmartCard.CPR0312_ElementData;
				var BlockNo = smartcard.DataFromSmartCard.CPR0315_ElementData;
				var Governorate = smartcard.DataFromSmartCard.CPR0318_ElementData;
				var Nationality = smartcard.DataFromSmartCard.GDNPR0103_ElementData;
		        var Occupation= smartcard.DataFromSmartCard.CPR1203_ElementData;
		        
					var appObj = theApplication();
					var Inputs = appObj.NewPropertySet();
					var Outputs = appObj.NewPropertySet();
					var svcService = appObj.GetService(""STC Get Country"");
					Inputs.SetProperty(""CountryCode"",Nationality);
					Inputs.SetProperty(""CardOccupation"",Occupation);
					Outputs = svcService.InvokeMethod(""GetCountry"",Inputs);
					var country = Outputs.GetProperty(""Nationality"");
					var SystemOccupation = Outputs.GetProperty(""SystemOccupation"");
					
				var day = Dob.substring(0,2);
				var Mon = Dob.substring(3,5);
				var Year = Dob.substring(6,10);
				
				var Expday = CardExpiry.substring(0,2);
				var ExpMon = CardExpiry.substring(3,5);
				var ExpYear = CardExpiry.substring(6,10);
				
				
				formatDOB = day+""/""+Mon+""/""+Year;
				newformatDOB = Mon+""/""+day+""/""+Year;
				newformatExpiry = ExpMon+""/""+Expday+""/""+ExpYear;
			
				if(Gender == ""M"")
				{
					Gender = ""Male"";
				}
				else if(Gender == ""F"")
				{
					Gender = ""Female"";
				}
				
				with(this.BusComp())
				{
					var CustType = GetFieldValue(""Account Type"");
					if(CustType == """")
					{
					var sFlag = confirm(""Please select Customer Type"");
						if(sFlag == false)
						{
							return (""CancelOperation"");
						} 	
					}//if(CustType == """")
					else if(CustType != ""Individual"")
					{
						SetFieldValue(""STC First Name"", FName);
						SetFieldValue(""STC Last Name"", LName);
						SetFieldValue(""STC Middle Name"", MiddleName);
					//	SetFieldValue(""ID Type"", ""CR"");
						SetFieldValue(""ID"", CPR);
						SetFieldValue(""Gender"", Gender);
						SetFieldValue(""Date Of Birth"", newformatDOB);
						SetFieldValue(""ID Expiry Date"", newformatExpiry);
						SetFieldValue(""Flat/Villa No"", Flat);
						SetFieldValue(""Building No"", Building);
						SetFieldValue(""Road No"", Road);
						SetFieldValue(""Block No"", BlockNo);
						SetFieldValue(""Governorate"", Governorate);
				        SetFieldValue(""Address Type"", ""Billing"");
				        SetFieldValue(""Nationality"", country); 
					}
					else
					{
						SetFieldValue(""First Name"", FName);
						SetFieldValue(""Last Name"", LName);
						SetFieldValue(""Middle Name"", MiddleName);
						SetFieldValue(""ID"", CPR);
						SetFieldValue(""Gender"", Gender);
						SetFieldValue(""Date Of Birth"", newformatDOB);
						SetFieldValue(""ID Type"", ""Bahraini ID"");
						SetFieldValue(""ID Expiry Date"", newformatExpiry);
						SetFieldValue(""Flat/Villa No"", Flat);
						SetFieldValue(""Building No"", Building);
						SetFieldValue(""Road No"", Road);
						SetFieldValue(""Block No"", BlockNo);
     					SetFieldValue(""Address Type"", ""Billing"");
						SetFieldValue(""Governorate"", Governorate);
						SetFieldValue(""Nationality"", country);
						SetFieldValue(""Card Occupation"",Occupation);
						SetFieldValue(""Current Occupation"",SystemOccupation);
					}//WriteRecord();
				}//with(this.BusComp())
			}//	if(read)
		
			}//	if(initiate)
		
		return(""CancelOperation""); 
		}
	else
	
	return (""ContinueOperation"");
	}
	catch(e)
	{
			alert(""Unable to read card. Please contact administrator."");
			return(""CancelOperation""); 
	}
}
function fn_ReadSmartCard(psIn,psOut)
{
	try
	{
		var smartcard = new ActiveXObject(""BH.CIO.Smartcard.IDCardManager.CardManager"");
		var testActivation = smartcard.TestSmartCardComActivation(""TestActivation"");
		var initiate =  smartcard.InitializesSCReaderLibrary();
		var formatDOB;
		var newformatDOB;
		var newformatExpiry;
		
		if(!initiate)
		{
			alert(""Card Initialization falied. Please try again"");
		}
	
		if(initiate)
		{
			smartcard.EnableSmartcardEvents();
			smartcard.ToIncludeBiometricSupportInfo = true;
			smartcard.ToIncludeDisabilityInfo = true;
			smartcard.ToIncludeEmploymentInfo = true;
			smartcard.ToIncludePassportInfo = true;
			smartcard.ToIncludePersonalInfo = true;
			smartcard.ToIncludePhoto = true;
			smartcard.ToIncludeAddressInfo = true;
			smartcard.ToIncludeSignature = true;
			var read = smartcard.ReadCard();

			if(read)
			{
				var CPR = smartcard.SmartcardData.IdNumber;
				var Name = smartcard.SmartcardData.EnglishFullName;
				var Gender = smartcard.SmartcardData.Gender;
				var Dob = smartcard.SmartcardData.BirthDate;
				var CardExpiry = smartcard.SmartcardData.CardexpiryDate;
				var CardCountry = smartcard.SmartcardData.CardCountry;
				var Address = smartcard.SmartcardData.AddressEnglish;
				var Nationality = smartcard.SmartcardData.NationalityCode;
				var Occupation = smartcard.SmartcardData.OccupationEnglish;
				var xmlHierarchy = smartcard.SmartcardData.SeralizeToXMLString();
				xmlHierarchy = xmlHierarchy.toString();

				var appObj = theApplication();

				var psInputs = appObj.NewPropertySet();
				var psOutputs = appObj.NewPropertySet();
				var XMLService = appObj.GetService(""STC Get Country"");
				psInputs.SetProperty(""xmlHierarchy"",xmlHierarchy);
				psOutputs = XMLService.InvokeMethod(""GetCardDetails"",psInputs);

				var FName = psOutputs.GetProperty(""FirstNameEnglish"");
				var LName = psOutputs.GetProperty(""LastNameEnglish"");
				var MiddleName = psOutputs.GetProperty(""MiddleName1English"");
				var Flat = psOutputs.GetProperty(""FlatNo"");
				var Building = psOutputs.GetProperty(""BuildingNo"");
				var Road = psOutputs.GetProperty(""RoadNo"");
				var BlockNo = psOutputs.GetProperty(""BlockNo"");
				var Governorate = psOutputs.GetProperty(""GovernorateNameEnglish"");

				var Inputs = appObj.NewPropertySet();
				var Outputs = appObj.NewPropertySet();
				var svcService = appObj.GetService(""STC Get Country"");

				Inputs.SetProperty(""CountryCode"",Nationality);
				Outputs = svcService.InvokeMethod(""GetCountry"",Inputs);
				var country = Outputs.GetProperty(""Nationality"");

				var day = Dob.substring(0,2);
				var Mon = Dob.substring(3,5);
				var Year = Dob.substring(6,10);
				var Expday = CardExpiry.substring(0,2);
				var ExpMon = CardExpiry.substring(3,5);
				var ExpYear = CardExpiry.substring(6,10);
	
				formatDOB = day+""/""+Mon+""/""+Year;				
				newformatDOB = Mon+""/""+day+""/""+Year;
				newformatExpiry = ExpMon+""/""+Expday+""/""+ExpYear;
	
				if(Gender == ""M"")
				{
					Gender = ""Male"";
				}
				else if(Gender == ""F"")
				{
					Gender = ""Female"";
				}

				psOut.SetProperty(""FName"",FName);
				psOut.SetProperty(""LName"",LName);
				psOut.SetProperty(""MiddleName"",MiddleName);
				psOut.SetProperty(""CPR"",CPR);
				psOut.SetProperty(""Gender"",Gender);
				psOut.SetProperty(""newformatDOB"",newformatDOB);
				psOut.SetProperty(""newformatExpiry"",newformatExpiry);
				psOut.SetProperty(""Flat"",Flat);
				psOut.SetProperty(""Building"",Building);
				psOut.SetProperty(""Road"",Road);
				psOut.SetProperty(""BlockNo"",BlockNo);
				psOut.SetProperty(""Governorate"",Governorate);
				psOut.SetProperty(""country"",country);
				psOut.SetProperty(""Occupation"",Occupation);
			}//	if(read)
			else
			{
				alert(""Problem reading Smart Card"");
			}
		}//	if(initiate)
	}
	catch(e)
	{
		alert(e);
		return(""CancelOperation""); 
	}
	finally
	{
		appObj = null;
	}
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
if(name == ""STCTEST"") 
		{ 
			var smartcard = new ActiveXObject(""KOBSC.SDK.SmartCardManagerLegacy"");
			var initiate = smartcard.InitateSmartCardManagerLibrary();
			if(!initiate)
			{
			alert(""Card Initialization falied. Please try again"");
			}
			
			if(initiate)
			{
				var samerror = false"";
				var carderror = false"";
				var read = smartcard.ReadDataFromCard(samerror, carderror);	
	
		if(read)
		{
				var CPR = smartcard.DataFromSmartCard.CPR0104_ElementData;
				var Name = smartcard.DataFromSmartCard.FullNameEn_ElementData;
				var Gender = smartcard.DataFromSmartCard.CPR0117_ElementData;
				var Dob = smartcard.DataFromSmartCard.CPR0118_ElementData;
				var CardExpiry = smartcard.DataFromSmartCard.CPR0119_ElementData;
				var FName = smartcard.DataFromSmartCard.CPR0105_ElementData;
				var LName = smartcard.DataFromSmartCard.CPR0110_ElementData;
				var MiddleName = smartcard.DataFromSmartCard.CPR0106_ElementData;
				var Address = smartcard.DataFromSmartCard.CorrenpondenceAddress_ElementData;
				var Flat = smartcard.DataFromSmartCard.CPR0308_ElementData;
				var Building = smartcard.DataFromSmartCard.CPR0309_ElementData;
				var Road = smartcard.DataFromSmartCard.CPR0312_ElementData;
				var BlockNo = smartcard.DataFromSmartCard.CPR0315_ElementData;
				
				if(Gender == ""M"")
				{
					Gender = ""Male"";
				}
				else if(Gender == ""F"")
				{
					Gender = ""Female"";
				}
				
				with(this.BusComp())
				{
					var CustType = GetFieldValue(""Account Type"");
					if(CustType == """")
					{var sFlag = confirm(""Please select Customer Type"");
						if(sFlag == false)
						{
							return (""CancelOperation"");
						} 	
					}//if(CustType == """")
					else if(CustType != ""Individual"")
					{
						SetFieldValue(""STC First Name"", FName);
						SetFieldValue(""STC Last Name"", LName);
						SetFieldValue(""STC Middle Name"", MiddleName);
					//	SetFieldValue(""ID Type"", ""CR"");
						SetFieldValue(""ID"", CPR);
						SetFieldValue(""Gender"", Gender);
						SetFieldValue(""Date Of Birth"", Dob);
						SetFieldValue(""ID Expiry Date"", CardExpiry);
						SetFieldValue(""Flat/Villa No"", Flat);
						SetFieldValue(""Building No"", Building);
						SetFieldValue(""Road No"", Road);
						SetFieldValue(""Block No"", BlockNo);

					}
					else
					{
						SetFieldValue(""First Name"", FName);
						SetFieldValue(""Last Name"", LName);
						SetFieldValue(""Middle Name"", MiddleName);
						SetFieldValue(""ID"", CPR);
						SetFieldValue(""Gender"", Gender);
						SetFieldValue(""Date Of Birth"", Dob);
						SetFieldValue(""ID Type"", ""Bahraini ID"");
						SetFieldValue(""ID Expiry Date"", CardExpiry);
						SetFieldValue(""Flat/Villa No"", Flat);
						SetFieldValue(""Building No"", Building);
						SetFieldValue(""Road No"", Road);
						SetFieldValue(""Block No"", BlockNo);
					}//WriteRecord();
				}//with(this.BusComp())
			}//	if(read)
		
			}//	if(initiate)
		
		return(""CancelOperation""); 
		}
	else
	
	return (""ContinueOperation"");
}
//Your public declarations go here...
function Applet_Load ()
{
try
{
	/*	var sApplnURL = document.location.toString();
		var sApplnMode = sApplnURL.indexOf(""OUI"").toString();
		if(sApplnMode == -1)
		{
			TheApplication().SetProfileAttr(""ApplicationMode"",""HI"");
		}
		else
		{
			TheApplication().SetProfileAttr(""ApplicationMode"",""OpenUI"");
		}*/
		TheApplication().SetProfileAttr(""UIBahrainiUpdateNormalUser"",""N"");
		return (""ContinueOperation"");
}
catch(e)
{
	alert(e);
	return(""CancelOperation""); 
}
finally
{

}
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
try
{
var sAppMode = TheApplication().GetProfileAttr(""IsOpenUI"");
	if(name == ""ReadSmartCard"")
	{
		var appObj = theApplication();
		var psIn = appObj.NewPropertySet();
		var psOut = appObj.NewPropertySet();
		var sCreditFlag;
		fn_ReadSmartCard(psIn,psOut);
		var FName = psOut.GetProperty(""FName"");
		var LName = psOut.GetProperty(""LName"");
		var MiddleName = psOut.GetProperty(""MiddleName"");
		var CPR = psOut.GetProperty(""CPR"");
		var Gender = psOut.GetProperty(""Gender"");
		var newformatDOB = psOut.GetProperty(""newformatDOB"");
		var newformatExpiry = psOut.GetProperty(""newformatExpiry"");
		var Flat = psOut.GetProperty(""Flat"");
		var Building = psOut.GetProperty(""Building"");
		var Road = psOut.GetProperty(""Road"");
		var BlockNo = psOut.GetProperty(""BlockNo"");
		var Governorate = psOut.GetProperty(""Governorate"");
		var country = psOut.GetProperty(""country"");
		var Occupation = psOut.GetProperty(""Occupation"");
		var IDType =  psOut.GetProperty(""IDType"");
		var GCCCountryCode =  psOut.GetProperty(""GCCCountryCode"");
		with(this.BusComp())
		{
			var CustType = GetFieldValue(""Account Type"");
			if(CustType == """")
			{
				var sFlag = confirm(""Please select Customer Type"");
				if(sFlag == false)
				{
					return (""CancelOperation"");
				} 	
			}//if(CustType == """")
			else if(CustType != ""Individual"")
			{
				SetFieldValue(""STC First Name"", FName);
				SetFieldValue(""STC Last Name"", LName);
				SetFieldValue(""STC Middle Name"", MiddleName);
				SetFieldValue(""ID"", CPR);
				SetFieldValue(""Gender"", Gender);
				SetFieldValue(""Date Of Birth"", newformatDOB);
				SetFieldValue(""ID Expiry Date"", newformatExpiry);
				SetFieldValue(""Flat/Villa No"", Flat);
				SetFieldValue(""Building No"", Building);
				SetFieldValue(""Road No"", Road);
				SetFieldValue(""Block No"", BlockNo);
				SetFieldValue(""Governorate"", Governorate);
				SetFieldValue(""Address Type"", ""Billing"");
				SetFieldValue(""Nationality"", country); 
			}
			else
			{
				SetFieldValue(""First Name"", FName);
				SetFieldValue(""Last Name"", LName);
				SetFieldValue(""Middle Name"", MiddleName);
				SetFieldValue(""ID"", CPR);
				SetFieldValue(""Gender"", Gender);
				SetFieldValue(""Date Of Birth"", newformatDOB);
				SetFieldValue(""ID Type"", IDType);
				SetFieldValue(""ID Expiry Date"", newformatExpiry);
				SetFieldValue(""Flat/Villa No"", Flat);
				SetFieldValue(""Building No"", Building);
				SetFieldValue(""Road No"", Road);
				SetFieldValue(""Block No"", BlockNo);
				SetFieldValue(""Address Type"", ""Billing"");
				SetFieldValue(""Governorate"", Governorate);
				SetFieldValue(""Nationality"", country);
				SetFieldValue(""Card Occupation"",Occupation);
				SerFieldValue(""SubscriberCountry"",""BH"");
				alert(GCCCountryCode);
			}//WriteRecord();
		}//with(this.BusComp())
		return(""CancelOperation"");
	}
		if(name == ""CreateCustAndBillAccntPrepaid"" || name == ""CreateCustAndBillAccntPostpaid"")
		{
			var sFlag = confirm(""Have you checked for valid GCC Id/CPR Id? If 'YES', Press 'OK' else 'Cancel'"");
			if(sFlag == false)
			return (""CancelOperation"");	
			else
			return (""ContinueOperation"");
		}
		if((name == ""STCTEST"" || name == ""GetGuardianDetails"") && sAppMode == 0) 
		{ 
			var CPR,Name,Gender,Dob,CardExpiry,FName,LName,MiddleName,Address,Flat,Building,Road,BlockNo,Governorate,Nationality,Occupation,SponsorName,SponsorNo,PassportNo,PassportIssueDate,PassportExpiryDate,LabourForceParticipation,EmployerNumber,EmployerName;
			//MANUJ Added to conditionally check for Old/New DLL -- START
			var SId = this.BusComp().GetFieldValue(""Id"");
			var appObjSC = theApplication();
			var InputsSC = appObjSC.NewPropertySet();
			var OutputsSC = appObjSC.NewPropertySet();
			var svcServiceSC = appObjSC.GetService(""Workflow Process Manager"");
			InputsSC.SetProperty(""ProcessName"",""STC SmartCard Old_New DLL Decider"");
			InputsSC.SetProperty(""Object Id"",SId);
			OutputsSC = svcServiceSC.InvokeMethod(""RunProcess"",InputsSC);
			var DLLFlag = OutputsSC.GetProperty(""Value"");
			//MANUJ Added to conditionally check for Old/New DLL -- END
			//Profile Section
			//MinorVerification
			if(name == ""GetGuardianDetails"")
			{
			var InputsG = appObjSC.NewPropertySet();//
			var OutputsG = appObjSC.NewPropertySet();//
			var svcServiceG = appObjSC.GetService(""STC Verify Guardian Details"");
			OutputsG = svcServiceG.InvokeMethod(""ValidateMinorRetail"",InputsG);	
			
			}
			/*	if(name == ""STCTEST"")
			{
			var InputsG = appObjSC.NewPropertySet();//
			var OutputsG = appObjSC.NewPropertySet();//
			var svcServiceG = appObjSC.GetService(""STC Verify Guardian Details"");
			OutputsG = svcServiceG.InvokeMethod(""MinorSUPValRetail"",InputsG);	
			var MinorSUP = OutputsG.GetProperty(""MinorSUP"");
			if(MinorSUP == ""Y"")
				{
				sCreditFlag = confirm(""Please check Employment Offer check box if customer has employee proof or Get Guardian details."");
				}
			if(sCreditFlag == false)
			{
			 return (""CancelOperation"");
			}

			}*/		
			theApplication().SetProfileAttr(""UIBahrainiUpdateNormalUser"",""Y"");
			//Profile Section
	
	if(DLLFlag == ""New"")
		{
			var smartcard = new ActiveXObject(""BH.CIO.Smartcard.IDCardManager.CardManager"");
			var testActivation = smartcard.TestSmartCardComActivation(""TestActivation"");
			var initiate =  smartcard.InitializesSCReaderLibrary();
			var formatDOB;
			var newformatDOB;
			var newformatExpiry;
			var newformatPassportExpiryDate;//Added for smartcard autopopulate SD
			var newformatPassportIssueDate;//Added for smartcard autopopulate SD
			var CheckExist;	
			if(!initiate)
			{
			alert(""Card Initialization failed. Please try again"");
			}
		if(initiate)
			{
				smartcard.EnableSmartcardEvents();
				smartcard.ToIncludeBiometricSupportInfo = true;
				smartcard.ToIncludeDisabilityInfo = true;
				smartcard.ToIncludeEmploymentInfo = true;
				smartcard.ToIncludePassportInfo = true;
				smartcard.ToIncludePersonalInfo = true;
				smartcard.ToIncludePhoto = true;
				smartcard.ToIncludeAddressInfo = true;
				smartcard.ToIncludeSignature = true;
				var read = smartcard.ReadCard();
		if(read)
				{
				//theApplication().SetProfileAttr(""CPRGetDetailsTriggered"",""Y"");
				CPR = smartcard.SmartcardData.IdNumber;
				Name = smartcard.SmartcardData.EnglishFullName;
				Gender = smartcard.SmartcardData.Gender;
				Dob = smartcard.SmartcardData.BirthDate;
				CardExpiry = smartcard.SmartcardData.CardexpiryDate;
				CardCountry = smartcard.SmartcardData.CardCountry;
				Address = smartcard.SmartcardData.AddressEnglish;
				Nationality = smartcard.SmartcardData.NationalityCode;
				Occupation = smartcard.SmartcardData.OccupationEnglish;
				CardIssueDate = smartcard.SmartcardData.CardIssueDate;//Card Issue Date read
                var xmlHierarchy = smartcard.SmartcardData.SeralizeToXMLString();//convert to XML
                xmlHierarchy = xmlHierarchy.toString();//XML to string
                var appObj = theApplication();

				var psInputs = appObj.NewPropertySet();
				var psOutputs = appObj.NewPropertySet();
				var XMLService = appObj.GetService(""STC Get Country"");
				psInputs.SetProperty(""xmlHierarchy"",xmlHierarchy);
				psOutputs = XMLService.InvokeMethod(""GetCardDetails"",psInputs);
				FName = psOutputs.GetProperty(""FirstNameEnglish"");
				LName = psOutputs.GetProperty(""LastNameEnglish"");
				if(LName == '-')
				{
				LName = '';
				}
				MiddleName = psOutputs.GetProperty(""MiddleName1English"");
				if(MiddleName == '-')
				{
				MiddleName = '';
				}
				Flat = psOutputs.GetProperty(""FlatNo"");
				Building = psOutputs.GetProperty(""BuildingNo"");
				Road = psOutputs.GetProperty(""RoadNo"");
				BlockNo = psOutputs.GetProperty(""BlockNo"");
				//var Governorate = psOutputs.GetProperty(""GovernorateNameEnglish"");
				//Occupation Missing
				SponsorName= smartcard.SmartcardData.SponserNameEnglish;//AutoPopulate
				SponsorNo= smartcard.SmartcardData.SponserId;//AutoPopulate
				PassportNo= smartcard.SmartcardData.PassportNumber;//AutoPopulate
				PassportIssueDate= smartcard.SmartcardData.PassportIssueDate;//AutoPopulate
				PassportExpiryDate= smartcard.SmartcardData.PassportExpiryDate;//AutoPopulate
				LabourForceParticipation= psOutputs.GetProperty(""LaborForceParticipation"");//LFP need to analyze
				// var CardIssueDate= smartcard.DataFromSmartCard.CPR02B02_ElementData;//AutoPopulate
				EmployerNumber= smartcard.SmartcardData.EmploymentId;//AutoPopulate
				EmployerName= smartcard.SmartcardData.EmploymentNameEnglish;//AutoPopulate
				
			}//if(Read)
				
		   }//if(Initiate)
			
		}//NEW DLL
					var appObj = theApplication();
					var Inputs = appObj.NewPropertySet();
					var Outputs = appObj.NewPropertySet();
					
					var svcService = appObj.GetService(""STC Get Country"");
					Inputs.SetProperty(""CountryCode"",Nationality);
					Inputs.SetProperty(""CardOccupation"",Occupation);
					Outputs = svcService.InvokeMethod(""GetCountry"",Inputs);
					var country = Outputs.GetProperty(""Nationality"");
					var SystemOccupation = Outputs.GetProperty(""SystemOccupation"");
					
			//	alert(SystemOccupation);	
			/*	try{
				var svcOccupation = appObj.GetService(""STC Get Occupation"");
				Inputs.SetProperty(""CardOccupation"",Occupation);
				Outputs = svcOccupation.InvokeMethod(""GetOccupation"",Inputs,Outputs);
				var SystemOccupation = Outputs.GetProperty(""SystemOccupation"");
				}
				catch(e)
				{
				}*/
				
			//	 alert(SystemOccupation);	
		
				var day = Dob.substring(0,2);
				var Mon = Dob.substring(3,5);
				var Year = Dob.substring(6,10);
				
				var Expday = CardExpiry.substring(0,2);
				var ExpMon = CardExpiry.substring(3,5);
				var ExpYear = CardExpiry.substring(6,10);
				
				var PExpday = PassportExpiryDate.substring(0,2);//Added for smartcard autopopulate SD
				var PExpMon = PassportExpiryDate.substring(3,5);//Added for smartcard autopopulate SD
				var PExpYear = PassportExpiryDate.substring(6,10);//Added for smartcard autopopulate SD
				
				var PIssueday = PassportIssueDate.substring(0,2);//Added for smartcard autopopulate SD
				var PIssueMon = PassportIssueDate.substring(3,5);//Added for smartcard autopopulate SD
				var PIssueYear = PassportIssueDate.substring(6,10);//Added for smartcard autopopulate SD
				
				
				formatDOB = day+""/""+Mon+""/""+Year;
				newformatDOB = Mon+""/""+day+""/""+Year;
				newformatExpiry = ExpMon+""/""+Expday+""/""+ExpYear;
				newformatPassportExpiryDate = PExpMon+""/""+PExpday+""/""+PExpYear;//Added for smartcard autopopulate SD
				newformatPassportIssueDate = PIssueMon+""/""+PIssueday+""/""+PIssueYear;//Added for smartcard autopopulate SD
				if(name == ""STCTEST"")
			{
			var InputsG = appObjSC.NewPropertySet();//
			var OutputsG = appObjSC.NewPropertySet();//
			var svcServiceG = appObjSC.GetService(""STC Verify Guardian Details"");
			InputsG.SetProperty(""DOB"",newformatDOB);
			OutputsG = svcServiceG.InvokeMethod(""MinorSUPValRetail"",InputsG);	
			var MinorSUP = OutputsG.GetProperty(""MinorSUP"");
			if(MinorSUP == ""Y"")
				{
				sCreditFlag = confirm(""Please check Employment Offer check box if customer has employee proof or Get Guardian details and verify. This is applicable for minor customers."");
				}
			if(sCreditFlag == false)
			{
			 return (""CancelOperation"");
			}

			}
			
				if(Gender == ""M"")
				{
					Gender = ""Male"";
				}
				else if(Gender == ""F"")
				{
					Gender = ""Female"";
				}
				if(name == ""STCTEST"")
				{
				with(this.BusComp())
				{
					var CustType = GetFieldValue(""Account Type"");
					if(CustType == """")
					{
					var sFlag = confirm(""Please select Customer Type"");
						if(sFlag == false)
						{
							return (""CancelOperation"");
						} 	
					}//if(CustType == """")
					else if(CustType != ""Individual"")
					{
						SetFieldValue(""STC First Name"", FName);
						SetFieldValue(""STC Last Name"", LName);
						SetFieldValue(""STC Middle Name"", MiddleName);
					//	SetFieldValue(""ID Type"", ""CR"");
						SetFieldValue(""ID"", CPR);
						SetFieldValue(""Gender"", Gender);
						SetFieldValue(""Date Of Birth"", newformatDOB);
						SetFieldValue(""ID Expiry Date"", newformatExpiry);
						SetFieldValue(""Flat/Villa No"", Flat);
						SetFieldValue(""Building No"", Building);
						SetFieldValue(""Road No"", Road);
						SetFieldValue(""Block No"", BlockNo);
						SetFieldValue(""Governorate"", Governorate);
				        SetFieldValue(""Address Type"", ""Billing"");
				        SetFieldValue(""Nationality"", country); 
					}
					else
					{
						SetFieldValue(""Contract Category"", ""Individual"");
						SetFieldValue(""First Name"", FName);
						SetFieldValue(""Last Name"", LName);
						SetFieldValue(""Middle Name"", MiddleName);
						SetFieldValue(""ID"", CPR);
						SetFieldValue(""Gender"", Gender);
						SetFieldValue(""Date Of Birth"", newformatDOB);
						SetFieldValue(""ID Type"", ""Bahraini ID"");
						SetFieldValue(""ID Expiry Date"", newformatExpiry);
						SetFieldValue(""Flat/Villa No"", Flat);
						SetFieldValue(""Building No"", Building);
						SetFieldValue(""Road No"", Road);
						SetFieldValue(""Block No"", BlockNo);
     					SetFieldValue(""Address Type"", ""Billing"");
//						SetFieldValue(""Governorate"", Governorate);Not Captured
						SetFieldValue(""Nationality"", country);
						SetFieldValue(""Card Occupation"",Occupation);
						SetFieldValue(""Current Occupation"",SystemOccupation);
						SetFieldValue(""STC Card Read Only"",""Yes"");
						SetFieldValue(""Sponsor Name"",SponsorName);//AutoPopulate
						SetFieldValue(""Sponsor ID Number"",SponsorNo);//AutoPopulate
						SetFieldValue(""Passport No"",PassportNo);//AutoPopulate
					    SetFieldValue(""Passport Issue Date"",newformatPassportIssueDate);//AutoPopulate Changed as part of Autopopulate SD
						SetFieldValue(""Passport Expiry Date"",newformatPassportExpiryDate);//AutoPopulate Changed as part of Autopopulate SD	
						SetFieldValue(""Labour Force Participation"",LabourForceParticipation);//AutoPopulate
					//	SetFieldValue(""Card Issue Date"",CardIssueDate);//AutoPopulate Not Captured
						SetFieldValue(""Employer Number"",EmployerNumber);//AutoPopulate
						SetFieldValue(""Employer Name"",EmployerName);//AutoPopulate
						WriteRecord();
						//InvokeMethod(""RefreshBusComp"");
					//	SetFieldValue(""Hobby"",""Yes"");
					}//WriteRecord();
				}//with(this.BusComp())
				}//STCTEST
				else{

				with(this.BusComp())
				{
						var CustType = GetFieldValue(""Account Type"");
						SetFieldValue(""Guardian First Name"", FName);
						SetFieldValue(""Guardian Last Name"", LName);
						SetFieldValue(""Guardian Middle Name"", MiddleName);
						SetFieldValue(""Guardian ID"", CPR);
						SetFieldValue(""Guardian Gender"", Gender);
						SetFieldValue(""Guardian Date Of Birth"", newformatDOB);
						SetFieldValue(""Guardian ID Expiry Date"", newformatExpiry);
						SetFieldValue(""Guardian Flat/Villa No"", Flat);
						SetFieldValue(""Guardian Building No"", Building);
						SetFieldValue(""Guardian Road No"", Road);
						SetFieldValue(""Guardian Block No"", BlockNo);
     					SetFieldValue(""Guardian Address Type"", ""Billing"");
						SetFieldValue(""Guardian Nationality"", country);
						SetFieldValue(""Guardian Card Occupation"",Occupation);
						SetFieldValue(""Guardian Current Occupation"",SystemOccupation);
						SetFieldValue(""Guardian Sponsor Name"",SponsorName);//AutoPopulate
						SetFieldValue(""Guardian Sponsor ID Number"",SponsorNo);//AutoPopulate
						SetFieldValue(""Guardian Passport No"",PassportNo);//AutoPopulate
					    SetFieldValue(""Guardian Passport Issue Date"",newformatPassportIssueDate);//AutoPopulate Changed as part of Autopopulate SD
						SetFieldValue(""Guardian Passport Expiry Date"",newformatPassportExpiryDate);//AutoPopulate Changed as part of Autopopulate SD	
						SetFieldValue(""Guardian Labour Force Participation"",LabourForceParticipation);//AutoPopulate
						SetFieldValue(""Guardian Employer Number"",EmployerNumber);//AutoPopulate
						SetFieldValue(""Guardian Employer Name"",EmployerName);//AutoPopulate
						SetFieldValue(""Guardian Verified"",""N"");
						WriteRecord();
				}//with(this.BusComp()
				}

		
		return(""CancelOperation""); 
		}
	else
	
	return (""ContinueOperation"");
	}
	catch(e)
	{
		alert(e);
				return(""CancelOperation""); 
	}
}
function fn_ReadSmartCard(psIn,psOut)
{
	try
	{
		var smartcard = new ActiveXObject(""BH.CIO.Smartcard.IDCardManager.CardManager"");
		var testActivation = smartcard.TestSmartCardComActivation(""TestActivation"");
		var initiate =  smartcard.InitializesSCReaderLibrary();
		var formatDOB;
		var newformatDOB;
		var newformatExpiry;
		
		if(!initiate)
		{
			alert(""Card Initialization falied. Please try again"");
		}
	
		if(initiate)
		{
			smartcard.EnableSmartcardEvents();
			smartcard.ToIncludeBiometricSupportInfo = true;
			smartcard.ToIncludeDisabilityInfo = true;
			smartcard.ToIncludeEmploymentInfo = true;
			smartcard.ToIncludePassportInfo = true;
			smartcard.ToIncludePersonalInfo = true;
			smartcard.ToIncludePhoto = true;
			smartcard.ToIncludeAddressInfo = true;
			smartcard.ToIncludeSignature = true;
			var read = smartcard.ReadCard();

			if(read)
			{
				var CPR = smartcard.SmartcardData.IdNumber;
				var Name = smartcard.SmartcardData.EnglishFullName;
				var Gender = smartcard.SmartcardData.Gender;
				var Dob = smartcard.SmartcardData.BirthDate;
				var CardExpiry = smartcard.SmartcardData.CardexpiryDate;
				var CardCountry = smartcard.SmartcardData.CardCountry;
				var Address = smartcard.SmartcardData.AddressEnglish;
				var Nationality = smartcard.SmartcardData.NationalityCode;
				var Occupation = smartcard.SmartcardData.OccupationEnglish;
				var xmlHierarchy = smartcard.SmartcardData.SeralizeToXMLString();
				xmlHierarchy = xmlHierarchy.toString();

				var appObj = theApplication();

				var psInputs = appObj.NewPropertySet();
				var psOutputs = appObj.NewPropertySet();
				var XMLService = appObj.GetService(""STC Get Country"");
				psInputs.SetProperty(""xmlHierarchy"",xmlHierarchy);
				psOutputs = XMLService.InvokeMethod(""GetCardDetails"",psInputs);

				var FName = psOutputs.GetProperty(""FirstNameEnglish"");
				var LName = psOutputs.GetProperty(""LastNameEnglish"");
				var MiddleName = psOutputs.GetProperty(""MiddleName1English"");
				var Flat = psOutputs.GetProperty(""FlatNo"");
				var Building = psOutputs.GetProperty(""BuildingNo"");
				var Road = psOutputs.GetProperty(""RoadNo"");
				var BlockNo = psOutputs.GetProperty(""BlockNo"");
				var Governorate = psOutputs.GetProperty(""GovernorateNameEnglish"");

				var Inputs = appObj.NewPropertySet();
				var Outputs = appObj.NewPropertySet();
				var svcService = appObj.GetService(""STC Get Country"");

				Inputs.SetProperty(""CountryCode"",Nationality);
				Inputs.SetProperty(""CardCountry"",CardCountry);
				Outputs = svcService.InvokeMethod(""GetCountry"",Inputs);
				var country = Outputs.GetProperty(""Nationality"");
				var GCCCountryCode = Outputs.GetProperty(""GCCCountryCode"");

				var day = Dob.substring(0,2);
				var Mon = Dob.substring(3,5);
				var Year = Dob.substring(6,10);
				var Expday = CardExpiry.substring(0,2);
				var ExpMon = CardExpiry.substring(3,5);
				var ExpYear = CardExpiry.substring(6,10);
	
				formatDOB = day+""/""+Mon+""/""+Year;				
				newformatDOB = Mon+""/""+day+""/""+Year;
				newformatExpiry = ExpMon+""/""+Expday+""/""+ExpYear;
	
				if(Gender == ""M"" || Gender == ""m"" || Gender == ""Male"" || Gender == ""MALE"")
				{
					Gender = ""Male"";
				}
				else if(Gender == ""F"" || Gender == f"" || Gender == ""Female"" || Gender == ""FEMALE"")
				{
					Gender = ""Female"";
				}

				if (FName == """" || FName == null)
					FName = Name;
				psOut.SetProperty(""FName"",FName);
				psOut.SetProperty(""LName"",LName);
				psOut.SetProperty(""MiddleName"",MiddleName);
				psOut.SetProperty(""CPR"",CPR);
				psOut.SetProperty(""Gender"",Gender);
				psOut.SetProperty(""newformatDOB"",newformatDOB);
				psOut.SetProperty(""newformatExpiry"",newformatExpiry);
				psOut.SetProperty(""Flat"",Flat);
				psOut.SetProperty(""Building"",Building);
				psOut.SetProperty(""Road"",Road);
				psOut.SetProperty(""BlockNo"",BlockNo);
				psOut.SetProperty(""Governorate"",Governorate);
				psOut.SetProperty(""country"",country);
				psOut.SetProperty(""Occupation"",Occupation);
				psOut.SetProperty(""GCCCountryCode"",GCCCountryCode);
				if (country == ""Bahraini"")
					psOut.SetProperty(""IDType"",""Bahraini ID"");
				else
					psOut.SetProperty(""IDType"",""GCC"");
					
			}//	if(read)
			else
			{
				alert(""Problem reading Smart Card"");
			}
		}//	if(initiate)
	}
	catch(e)
	{
		alert(e);
		return(""CancelOperation""); 
	}
	finally
	{
		appObj = null;
	}
}
function Applet_ChangeFieldValue (field, value)
{
/*[07Mar2016][NAVINR][TT Credit Control Collections]*/
	var srApplet = theApplication().FindApplet(""STC Subscription SR Detail Applet"");
	var appletControl = srApplet.FindControl(""INSSub-Area"");
	var controlValue = appletControl.GetValue();
	//theApplication().SWEAlert(srApplet +"":""+ appletControl +"":""+ controlValue);
	
    if(controlValue == ""Credit Limit Value / Deposit"")
    {
		switch (field)
		{
			case ""STC TT Dispute Type"":
				if (value == ""Decrease CL"")
					alert (""Please create SR to 'Decrease Credit Limit' if not created already!"");
				break;
			case ""STC TT SR Flag"":
				if (value == ""No"")
					alert (""Please create SR for Credit limit complaint if not created already!"");
			default:
				return(""ContinueOperation"");
		
		}//end of switch
	}//end of if
	return(""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{

//MANUJ Added for TT Attachment Functionality
if (name == ""Assign"")

	{
	appObj = theApplication();
	var vSRId= this.BusComp().GetFieldValue(""Id"");//SRId
	var CallTier3= this.BusComp().GetFieldValue(""INS Sub-Area"");//Call Tier3
	var CallTier2= this.BusComp().GetFieldValue(""INS Area"");//Call Tier2
	var CallTier1= this.BusComp().GetFieldValue(""INS Product"");//Call Tier1
	var sActiveViewName = appObj.ActiveViewName();
	var svcbsServiceOSTerm = appObj.GetService(""Workflow Process Manager"");
	var psiPSOS = appObj.NewPropertySet();
	var psoPSOS = appObj.NewPropertySet();
	psiPSOS.SetProperty(""ProcessName"", ""STC TT Assign Attachment Check"");
	psiPSOS.SetProperty(""Object Id"",vSRId);
	psiPSOS.SetProperty(""CallTier"",CallTier3);
    psoPSOS = svcbsServiceOSTerm.InvokeMethod(""RunProcess"", psiPSOS);
	var RecordCount = psoPSOS.GetProperty(""Record Count"");
	var ErrorCode = psoPSOS.GetProperty(""Error Code"");
	if(ErrorCode != '0' && sActiveViewName == ""STC Subscription SR Detailed View"")
	{//if Call Tier matches and activeview;
		var ConfirmText = psoPSOS.GetProperty(""ConfirmText"");
		sCreditFlag = confirm(ConfirmText);
		if(sCreditFlag == false)//Cancel - Continue Assign
		{
		appObj.SetProfileAttr(""AssignGoAhead"",""Y"");
		return (""ContinueOperation"");
		}
		else
		{
		appObj.SetProfileAttr(""AssignGoAhead"",""N"");
		return (""ContinueOperation"");//Ok - Go to View
		}	
	}
	}
//MANUJ Added for TT Attachment Functionality	
	return (""ContinueOperation"");
}
function Applet_Load ()
{

}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	var sAppMode = TheApplication().GetProfileAttr(""IsOpenUI"");//Mayank: Added for Gaurdian
	//if(name == ""GetCPR"")//Mayank: Added for Gaurdian
	if(name == ""GetCPR"" && sAppMode == 0)//Mayank: Added for Gaurdian
	{
		var smartcard = new ActiveXObject(""BH.CIO.Smartcard.IDCardManager.CardManager"");
		var testActivation = smartcard.TestSmartCardComActivation(""TestActivation"");
		var initiate =  smartcard.InitializesSCReaderLibrary();
		var formatDOB;
		var newformatDOB;
		var newformatExpiry;
		var newformatPassportExpiryDate;//Added for smartcard autopopulate SD
		var newformatPassportIssueDate;//Added for smartcard autopopulate SD
		var CheckExist;	
		var CPR;
		if(!initiate)
		{
			alert(""Card Initialization falied. Please try again"");
		}
		if(initiate)
		{
			smartcard.EnableSmartcardEvents();
			smartcard.ToIncludeBiometricSupportInfo = true;
			smartcard.ToIncludeDisabilityInfo = true;
			smartcard.ToIncludeEmploymentInfo = true;
			smartcard.ToIncludePassportInfo = true;
			smartcard.ToIncludePersonalInfo = true;
			smartcard.ToIncludePhoto = true;
			smartcard.ToIncludeAddressInfo = true;
			smartcard.ToIncludeSignature = true;
			var read = smartcard.ReadCard();
			if(read)
			{
				CPR = smartcard.SmartcardData.IdNumber;
				var appObj = theApplication();
				var psInputs = appObj.NewPropertySet();
				var psOutputs = appObj.NewPropertySet();
			}//if(Read)
		}//if(Initiate)
		with(this.BusComp())
		{
			SetFieldValue(""CPR"", CPR);
		}
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	if(name == ""ApproveActivity"")
	{
		var sApproveflag = confirm(""You are going to approve activity. Order will now be submitted. Click 'Ok' to confirm."");
		if (sApproveflag == false)
		{
			return (""CancelOperation"");
		}
	}
	if(name == ""RejectActivity"")
	{
		var sRejectflag = confirm(""You are going to reject activity. Order will now be cancelled. Click 'Ok' to confirm."");
		if (sRejectflag == false)
		{
			return (""CancelOperation"");
		}
	}
	return (""ContinueOperation"");
}
"//function Applet_ChangeRecord ()
//{

//}
"
function Applet_ChangeFieldValue (field, value)
{
//Mark: cod is going in sleep mode

	if(field == ""User Business Feature Set"" && value == ""No"")
	{
		alert(""Your are changing User Business Feature set 'Yes' to 'No' so Additional phone will not work"");
	} 
}
function Applet_ChangeRecord ()
{

}
"
function Applet_PreInvokeMethod (name, inputPropSet)
{
	var thisReturn = ""ContinueOperation"";
	switch(name)
	{
	 //case ""NewRecord"":
		case ""BulkExtensionUpload"":
		try
		{
			//var sConfirmMsg = ""You are about to add a new Extension. Once added it will not be deleted. Please confirm to proceed."";
	var sConfirmMsg = ""Please follow the Extension number sequence series and Action/Call Barring/User Business Feature Set fields values are required in Bulk import excel csv file. Please confirm to proceed."";
			var Flag = """";


			/*var sPilot = """", sBulkId = """", sOpptyId = """", sFlag = """";
			var svcService = """", sInputs = """", sOutputs = """";
			var sErrCode = ""0"", sErrMsg = ""SUCCESS"";

			var sPilot = this.BusComp().GetFieldValue(""Id"");
			var sOpptyId 	= this.BusComp().GetFieldValue(""Opportunity Id"");
			var sBulkId 	= this.BusComp().GetFieldValue(""Bulk Id"");
			
			sInputs = theApplication().NewPropertySet();
			sOutputs = theApplication().NewPropertySet();
			svcService = theApplication().GetService(""Workflow Process Manager"");
			sInputs.SetProperty(""ProcessName"", ""STCVIVAOneBrowserCodeProcess"");
			sInputs.SetProperty(""Object Id"", sOpptyId);
			sInputs.SetProperty(""PilotRowId"", sPilot);
			sInputs.SetProperty(""BulkRowId"", sBulkId);
			sInputs.SetProperty(""Method"", name);
			sOutputs = svcService.InvokeMethod(""RunProcess"", sInputs, sOutputs);
			sErrCode = sOutputs.GetProperty(""Error Code"");
			sErrMsg = sOutputs.GetProperty(""Error Message"");
			if(sErrCode != ""0"")
			{
				if(sErrCode == ""FIRSTPROV"")
				{
					alert(sErrMsg);
					return (""CancelOperation"");
				}
				else
				{*/
				Flag = confirm(sConfirmMsg);
					if (Flag == false)
					return (""CancelOperation"");
					else
					return (""ContinueOperation"");
				//}
			//}
		}
		catch(e)
		{
		}
		finally
		{
			
		}
		thisReturn = ""ContinueOperation"";
		break;

		default:
		thisReturn = ""ContinueOperation"";
		break;
	}
	return (thisReturn);
	
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
var sAppMode = TheApplication().GetProfileAttr(""IsOpenUI"");//Mayank: Added For Open UI

if(name == ""GetGuardianDetails"" && sAppMode == 0)//Mayank: Added For Open UI
{
	
			
			var smartcard = new ActiveXObject(""BH.CIO.Smartcard.IDCardManager.CardManager"");
			var testActivation = smartcard.TestSmartCardComActivation(""TestActivation"");
			var initiate =  smartcard.InitializesSCReaderLibrary();
			var formatDOB;
			var newformatDOB;
			var newformatExpiry;
			var newformatPassportExpiryDate;//Added for smartcard autopopulate SD
			var newformatPassportIssueDate;//Added for smartcard autopopulate SD
			var CheckExist;	
			var CPR,CardExpiry,GuardianCardCPR;
			if(!initiate)
			{
			alert(""Card Initialization falied. Please try again"");
			}
		if(initiate)
			{
				smartcard.EnableSmartcardEvents();
				smartcard.ToIncludeBiometricSupportInfo = true;
				smartcard.ToIncludeDisabilityInfo = true;
				smartcard.ToIncludeEmploymentInfo = true;
				smartcard.ToIncludePassportInfo = true;
				smartcard.ToIncludePersonalInfo = true;
				smartcard.ToIncludePhoto = true;
				smartcard.ToIncludeAddressInfo = true;
				smartcard.ToIncludeSignature = true;
				var read = smartcard.ReadCard();
		if(read)
				{
				
				GuardianCardCPR = smartcard.SmartcardData.IdNumber;
				CardExpiry = smartcard.SmartcardData.CardexpiryDate;
                var appObj = theApplication();

				var psInputs = appObj.NewPropertySet();
				var psOutputs = appObj.NewPropertySet();
				
			}//if(Read)
				
		   }
		   
		   //if(Initiate)
		   
		   /*with(this.BusComp())
		   
		   {
		   
		    SetFieldValue(""CPR"", CPR);
		   
		   }*/
				var Expday = CardExpiry.substring(0,2);
				var ExpMon = CardExpiry.substring(3,5);
				var ExpYear = CardExpiry.substring(6,10);
				newformatExpiry = ExpMon+""/""+Expday+""/""+ExpYear;
		   //Guardian CPR Comparison/ID Expiry Date/Bad Customer
		   	var CANId = theApplication().GetProfileAttr(""GuardianMinorId"");
			var appObjSC = theApplication();
			var InputsSC = appObjSC.NewPropertySet();
			var OutputsSC = appObjSC.NewPropertySet();
			var svcServiceSC = appObjSC.GetService(""STC Check Minor Customer BS"");
			InputsSC.SetProperty(""CANId"",CANId);
			InputsSC.SetProperty(""IDExpiryDate"",newformatExpiry);
			InputsSC.SetProperty(""GuardianCardCPR"",GuardianCardCPR);
			OutputsSC = svcServiceSC.InvokeMethod(""QuickVerifyGuardian"",InputsSC);
			var CPRExpired = OutputsSC.GetProperty(""CPRExpired"");
			var GuardianInfoViolated = OutputsSC.GetProperty(""GuardianInfoViolated"");
			var sBadCust = OutputsSC.GetProperty(""sBadCust"");
			//Guardian CPR Comparison/ID Expiry Date/Bad Customer
			
			if(GuardianInfoViolated == ""Y"")
			{
			alert(""CPR Mismatch. Change Guardian SR Initiated"");		
				
			}
			if(sBadCust == ""Y"" && GuardianInfoViolated != ""Y"")
			{
			//Initiate Change Guardian SR
			alert(""Guardian is existing BAD Customer. Customer will have to bring another guardian"");	
			}
			if(CPRExpired == ""Y"" && GuardianInfoViolated != ""Y"")
			{
			alert(""CPR Expired. Customer will have to bring another guardian"");		
				
			}
			
			if(sBadCust == ""Y"" || CPRExpired == ""Y"" || GuardianInfoViolated == ""Y""){
				
				this.InvokeMethod(""FrameEventMethodNo""); //Initiate Guardian change SR Process and GotoSRView
				
			}
			
			else{
				
				this.InvokeMethod(""FrameEventMethodYes""); //Continue with BAU
				
				
			}
		}

	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	if(name == ""NewRecord"")
	{
			var	appObjSC = theApplication();
			var CustomerType = appObjSC.GetProfileAttr(""STCCustomerType"");
			if(CustomerType != ""Individual""){
			var inputPropSet = theApplication().NewPropertySet();
			inputPropSet.SetProperty(""SWEMethod"", ""ShowPopup"");
			inputPropSet.SetProperty(""SWETA"", ""STC Corporate ISL Audit Popup Applet""); // Applet Name to be invoked
			inputPropSet.SetProperty(""SWEW"", ""700"");
			inputPropSet.SetProperty(""SWEH"", ""700"");
			inputPropSet.SetProperty(""SWESP"", ""true"");
			inputPropSet.SetProperty(""SWEM"", ""Edit List""); // Base, Edit, Edit List
			this.InvokeMethod(""ShowPopup"", inputPropSet);
			return (""CancelOperation"");
			}
			else
			{
			return (""ContinueOperation"");
			}
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	if(name == ""NewRecord"")
	{
			var	appObjSC = theApplication();
			var CustomerType = appObjSC.GetProfileAttr(""STCCustomerType"");
			if(CustomerType != ""Individual""){
			var inputPropSet = theApplication().NewPropertySet();
			inputPropSet.SetProperty(""SWEMethod"", ""ShowPopup"");
			inputPropSet.SetProperty(""SWETA"", ""STC Corporate ISL Audit Popup Applet""); // Applet Name to be invoked
			inputPropSet.SetProperty(""SWEW"", ""700"");
			inputPropSet.SetProperty(""SWEH"", ""700"");
			inputPropSet.SetProperty(""SWESP"", ""true"");
			inputPropSet.SetProperty(""SWEM"", ""Edit List""); // Base, Edit, Edit List
			this.InvokeMethod(""ShowPopup"", inputPropSet);
			return (""CancelOperation"");
			}
			else
			{
			return (""ContinueOperation"");
			}
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
//Mayank: Added for Get All TT Queue
{
	var thisReturn = ""ContinueOperation"";
	switch(name)
	{
		case ""GetAllQueue"":
		try
		{
			var Inputs, Outputs, strRetCode; 
			var UserPositionAllowed = ""N"";
			var sPopMssg = ""You dont have access to get all the TT assigned to you."";
			var sQueueId = this.BusComp().GetFieldValue(""Id"");
			var sInps = """",sInps1 = """";
			var sOutps = """",sOutps1 = """";
			var sWFSrvc = """",sWFSrvc1 = """";
			var sFlag= """";
			var NoOfRecords = 0;
			sInps = theApplication().NewPropertySet();
			sOutps = theApplication().NewPropertySet();
			sWFSrvc = theApplication().GetService(""STC SR Validate Utilities"");			
			sInps.SetProperty(""LOVTYPE"", ""STC_ALL_TT_QUEUE_POSITION"");
			sOutps = sWFSrvc.InvokeMethod(""CheckPosition"",sInps,sOutps);
			UserPositionAllowed = sOutps.GetProperty(""LOVAvailable"");
			if(UserPositionAllowed == ""No"")
			{
				alert(sPopMssg);
				return (""CancelOperation"");
			}
			sInps1 = theApplication().NewPropertySet();
			sOutps1 = theApplication().NewPropertySet();
			sWFSrvc1 = theApplication().GetService(""Workflow Process Manager"");
			sInps1.SetProperty(""QueueId"",sQueueId);
			sInps1.SetProperty(""ProcessName"", ""STC All TT Queue Process"");
			sOutps1 = sWFSrvc1.InvokeMethod(""RunProcess"",sInps1,sOutps1);			
			NoOfRecords = sOutps1.GetProperty(""NoOfRecords"");
			if(NoOfRecords > 0)
			{
				sFlag = confirm(""Total number of TT = ""+NoOfRecords+"" will be assigned to you. Do you want to Proceed?"");
				if(sFlag == false)
				return (""CancelOperation"");
				else
				return (""ContinueOperation"");
			}
			else
			{
				alert(""There are no items Held in the Queue."");
				return (""CancelOperation"");
			}
		}
		catch(e)
		{
		}
		finally
		{
			sInps1=null;
			sOutps1=null;
			sWFSrvc1=null;
			sOutps=null;
			sInps=null;
			sOutps=null;
			sWFSrvc=null;
		}
		thisReturn = ""ContinueOperation"";
		break;

		default:
		thisReturn = ""ContinueOperation"";
		break;
	}
	return (thisReturn);
}
function Applet_PreInvokeMethod (name, inputPropSet)
{

	if (name == ""FetchCustomer"")
	{
		with(this.BusComp())
		{
			var IDNumber = GetFieldValue(""CPR"");
			var IDType = GetFieldValue(""IDType"");
		}
	//	alert(IDType+"":""+IDNumber);
	var AppObj =theApplication();
	var inpPS = AppObj.NewPropertySet();
	var outPS = AppObj.NewPropertySet();
	var oBS;
	var vFlag;

		inpPS.SetProperty(""IDNumber"",IDNumber);
		inpPS.SetProperty(""ProcessName"",""STC AVAYA Check CR Number WF"");
		inpPS.SetProperty(""IDType"",IDType);
		oBS = AppObj.GetService(""Workflow Process Manager"");
        outPS = oBS.InvokeMethod(""RunProcess"", inpPS,outPS);
        vFlag = outPS.GetProperty(""NewCR"");
        var ErrorMsg = outPS.GetProperty(""ErrMsg"");
		if(ErrorMsg != ""SUCCESS"" && ErrorMsg != """")
		{
			var Error = confirm(ErrorMsg);
			if(Error == false)
			{
			return (""CancelOperation"");
			}
			else
			{
				return (""CancelOperation"");
			}
		}

			if(vFlag == ""YES"")
			{
				var sErrMsg = confirm(""The provided CR does not exist. Would you like to create a new customer account?"");
				if(sErrMsg == false){
				return (""CancelOperation"");
				}
					else
					{
				       	return (""ContinueOperation"");		
					}

			}
	return (""ContinueOperation"");
	}

	return (""ContinueOperation"");
}
function Applet_Load ()
{

}
function Applet_PreInvokeMethod (name, inputPropSet)
{

if(name == ""GetCPR"")
{
			var smartcard = new ActiveXObject(""BH.CIO.Smartcard.IDCardManager.CardManager"");
			var testActivation = smartcard.TestSmartCardComActivation(""TestActivation"");
			var initiate =  smartcard.InitializesSCReaderLibrary();
			var formatDOB;
			var newformatDOB;
			var newformatExpiry;
			var newformatPassportExpiryDate;//Added for smartcard autopopulate SD
			var newformatPassportIssueDate;//Added for smartcard autopopulate SD
			var CheckExist;	
			var CPR;
			if(!initiate)
			{
			alert(""Card Initialization falied. Please try again"");
			}
		if(initiate)
			{
				smartcard.EnableSmartcardEvents();
				smartcard.ToIncludeBiometricSupportInfo = true;
				smartcard.ToIncludeDisabilityInfo = true;
				smartcard.ToIncludeEmploymentInfo = true;
				smartcard.ToIncludePassportInfo = true;
				smartcard.ToIncludePersonalInfo = true;
				smartcard.ToIncludePhoto = true;
				smartcard.ToIncludeAddressInfo = true;
				smartcard.ToIncludeSignature = true;
				var read = smartcard.ReadCard();
		if(read)
				{
				
				CPR = smartcard.SmartcardData.IdNumber;
                var appObj = theApplication();

				var psInputs = appObj.NewPropertySet();
				var psOutputs = appObj.NewPropertySet();
				
			}//if(Read)
				
		   }//if(Initiate)
		   
		   with(this.BusComp())
		   
		   {
		   
		    SetFieldValue(""CPR"", CPR);
		   
		   }
		}

	return (""ContinueOperation"");
}
"/*  
---------------+------+--------+----------------------------------------------  
Date(YYYYMMDD) | Ver  | By     | Description   
---------------+------+--------+----------------------------------------------  
26120712       |   1.0|   CP        Creation  
---------------+------+--------+----------------------------------------------
20130103       |   2.0|S Poria |    update  
---------------+------+--------+----------------------------------------------    
*/ 

function Applet_PreInvokeMethod (name, inputPropSet)
{
	var thisReturn = ""ContinueOperation"";
	switch(name)
	{
		case ""CaptureSignature"":
		try
		{
			var sOrdNum,sOrdReason,sURL,sURL1;
			sOrdNum = this.BusComp().GetFieldValue(""Id"");
			sOrdReason = ""ActivationOrder"";
			var psIn = theApplication().NewPropertySet();
			var psOut = theApplication().NewPropertySet();
			psIn.SetProperty(""Type"",""VIVA_SIGN_URL"");
			psIn.SetProperty(""LIC"",""URL"");
			var sService = theApplication().GetService(""BS LOV Services"");
			psOut = sService.InvokeMethod(""GetLOVDescription"", psIn);
			sURL = psOut.GetProperty(""Description"");
			sURL1 = sURL + ""?"" + ""OrderId="" + sOrdNum + ""&OrderReason="" + sOrdReason;
			window.open(sURL1);
		}
		catch(e)
		{
			alert(""CatchBlock:""+e);
		}
		finally
		{
			sService=null;
			psIn=null;
			psOut=null;
		}
		return(""CancelOperation"");
		break;
			////Hardik:Mobility 
		case ""MobCaptureSignature"":
		try
		{
			var sOrdNum,sOrdReason,sURL,sURL1;
			sOrdNum = this.BusComp().GetFieldValue(""Id"");
			sOrdReason = ""ActivationOrder"";
			var psIn = theApplication().NewPropertySet();
			var psOut = theApplication().NewPropertySet();
			psIn.SetProperty(""Type"",""VIVA_SIGN_URL"");
			psIn.SetProperty(""LIC"",""MobileURL"");
			var sService = theApplication().GetService(""BS LOV Services"");
			psOut = sService.InvokeMethod(""GetLOVDescription"", psIn);
			sURL = psOut.GetProperty(""Description"");
			sURL1 = sURL + ""?"" + ""OrderId="" + sOrdNum + ""&OrderReason="" + sOrdReason;
			window.open(sURL1);
			//alert(sURL1);
		}
		catch(e)
		{
			alert(""CatchBlock:""+e);
		}
		finally
		{
			sService=null;
			psIn=null;
			psOut=null;
		}
		return(""CancelOperation"");
		break;
		///End Mobility

	/*	case ""SendtoPOS"": ////MARK Commented PBI000000005055  for Problem Ticket Fins invoke is not working 
			try
			{
				var oBS1, inpPS1, outPS1,oBS2, inpPS2, outPS2;;
				var vErrCode1="""", vErrMsg1="""";
				var OrderId1 = this.BusComp().GetFieldValue(""Id"");
				inpPS1 = theApplication().NewPropertySet();
				outPS1 = theApplication().NewPropertySet();
				oBS1 = theApplication().GetService(""Workflow Process Manager"");
				inpPS2 = theApplication().NewPropertySet();
				outPS2 = theApplication().NewPropertySet();
				oBS2 = theApplication().GetService(""FINS Teller UI Navigation"");
				with (inpPS1)
				{
					SetProperty(""ProcessName"", ""STC Mena Create Validate Activity Process"");
					SetProperty(""Object Id"", OrderId1);
				}
				outPS1 = oBS1.InvokeMethod(""RunProcess"", inpPS1,outPS1);
				with(outPS1)
				{
					vErrCode1 = GetProperty(""Error Code"");
					vErrMsg1 = GetProperty(""FinalAddress"");
				}
				if(vErrMsg1 != """" && vErrMsg1 != null)
				{
					var sFlag1 = confirm(vErrMsg1);
					if (sFlag1 == false)
					{
						inpPS2.SetProperty(""BusObj"", ""Order Entry (Sales)"");
						inpPS2.SetProperty(""ViewName"", ""STC Order Entry - Order Activity List View"");
						outPS2 = oBS2.InvokeMethod(""GotoView"", inpPS2,outPS2);
						return (""CancelOperation"");
					}
					else
					return (""ContinueOperation"");
				}
			}
			catch(e)
			{
			
			}
			finally
			{
				psIn1=null;
				psOut1=null;
				oBS1=null;
				psIn2=null;
				psOut2=null;
				oBS2=null;
			}
			return(""ContinueOperation"");
			break; //PBI000000005055 
			
		*/	//Mayank: Added for RDS---------- START-----------------
			case ""SubmitOrderSTC"":
			case ""SendtoPOS"":
			try
			{
				var oBS, inpPS, outPS;
				var vErrCode="""", vErrMsg="""", EmailId = """";
				var OrderId = this.BusComp().GetFieldValue(""Id"");
				inpPS = theApplication().NewPropertySet();
				outPS = theApplication().NewPropertySet();
				oBS = theApplication().GetService(""Workflow Process Manager"");
				with (inpPS)
				{
					SetProperty(""ProcessName"", ""STCRetailDigitalSignatureSubmitValidationWF"");
					SetProperty(""Object Id"", OrderId);
				}
				outPS = oBS.InvokeMethod(""RunProcess"", inpPS,outPS);
				with(outPS)
				{
					vErrCode = GetProperty(""Error Code"");
					vErrMsg = GetProperty(""Error Message"");
					EmailId = GetProperty(""EmailId"");
				}
				if(vErrMsg != ""SUCCESS"")
				{
					var sFlag = confirm(vErrMsg);
					if (sFlag == false)
					return (""CancelOperation"");
					else
					return (""ContinueOperation"");
				}
			}
			catch(e)
			{
			
			}
			finally
			{
				psIn=null;
				psOut=null;
				oBS=null;
			}
			return(""ContinueOperation"");
			break;
			//Mayank: Added for RDS---------- STOP-----------------
		case ""ValidateOrder"":
			try
			{
				var objAppln, Inputs, Outputs, svcService, strRetCode; 
				var numCountRec, strErrorCd, strPenaltyProd;
				var strOrderId 		= this.BusComp().GetFieldValue(""Id"");
				var strOrderType 	= this.BusComp().GetFieldValue(""STC Order SubType"");
				var strProfileType 	= this.BusComp().GetFieldValue(""STC Billing Profile Type"");
				var strServiceMig 	= this.BusComp().GetFieldValue(""STC Migration Sub Type"");
				var SuspensionReason = this.BusComp().GetFieldValue(""Delivery Block"");
				var PrimaryFlag = this.BusComp().GetFieldValue(""STC Primary SAN Flag"");
				var SharedFlag = this.BusComp().GetFieldValue(""STC Shared Flag"");
				//Added the below code for the Autoplan Migration SD
				var sobjAppln = """";
				var sInps = """";
				var sOutps = """";
				var sWFSrvc = """";
				var sFlag= """";
				var PlanName= """";
				var MainContractName= """";
				var AddOnContractName = """";
				var MainDevice= """";
				var AddOnDevice = """";
				var sPopMssg = """";
				var sInps1 = """",sOutps1 = """",sWFSrvc1 = """",sOSNBasePackDelete = ""N"",sobjApplnOSN = theApplication();//Mayank: Added for OSN

				if(strOrderType == ""Modify"" && SharedFlag == ""Y"" && PrimaryFlag == ""Y"")
				{
					
					var oBS, inpPS, outPS;
					var vErrCode="""", vErrMsg="""";
					inpPS = theApplication().NewPropertySet();
					outPS = theApplication().NewPropertySet();
					oBS = theApplication().GetService(""Workflow Process Manager"");
					with (inpPS)
					{
					SetProperty(""ProcessName"", ""STC Check Shared BB MRC Plan Validation WF"");
					SetProperty(""Object Id"", strOrderId);
					}
					outPS = oBS.InvokeMethod(""RunProcess"", inpPS,outPS);
					with(outPS)
					{
						vErrCode = GetProperty(""ErrorFlag"");
						vErrMsg = GetProperty(""ErrorMsg"");
					}
					if(vErrCode != ""N"")
					{
						var sFlag = confirm(vErrMsg);
						if (sFlag == false)
							return (""CancelOperation"");
						else
							return (""ContinueOperation"");
					}
				}

				if(strOrderType == ""Modify"" || strOrderType == ""Provide"" || strServiceMig == ""Service Migration"")
				{			
					sobjAppln = theApplication();	
					sInps = sobjAppln.NewPropertySet();
					sOutps = sobjAppln.NewPropertySet();
					sWFSrvc = sobjAppln.GetService(""STC Auto Plan Migration Service"");			
					sInps.SetProperty(""OrderId"",strOrderId);			
					sOutps = sWFSrvc.InvokeMethod(""Validate"",sInps);			
					sPopMssg = sOutps.GetProperty(""PopupMessage"");
					var OSNBasePackDelete = sOutps.GetProperty(""OSNBasePackDelete"");	
					sFlag = confirm(sPopMssg);
					if(sFlag == false)
					return (""CancelOperation"");
					else 
					{
						if(OSNBasePackDelete == ""Y"" && strOrderType == ""Modify"")
						{
							alert(""Customer might loose VAT Waiver benefit due to plan changes. Please check VAT Waiver eligible plans"");
						}		
					}
				}


				
				if(strOrderType == ""Modify"")
				{//Mayank: Added for Mena
		
				
					//sOrdId = this.BusComp().GetFieldValue(""Id"");
					var OrderBO = theApplication().ActiveBusObject(""Order Entry (Sales)"");
					var OrdLineBC = OrderBO.GetBusComp(""Order Entry - Line Items (Simple)"");
					with (OrdLineBC)
					{
					ClearToQuery();
					SetViewMode(AllView);
					ActivateField(""Part Number"");
					ActivateField(""Action Code"");
					SetSearchExpr(""[Order Header Id] = '""+strOrderId+""' AND [Part Number] LIKE  'CSCFSADDON*' AND [Action Code] = 'Delete'"");
					ExecuteQuery(ForwardOnly);
					if (FirstRecord())
						alert(""Please note that all service and feature add-ons will be deleted with this order. Kindly make sure to purchase required add-ons."");
					}
				
				
					sobjAppln = theApplication();	
					sInps = sobjAppln.NewPropertySet();
					sOutps = sobjAppln.NewPropertySet();
					sWFSrvc = sobjAppln.GetService(""STC Auto Plan Migration Service"");			
					sInps.SetProperty(""OrderId"",strOrderId);			
					sOutps = sWFSrvc.InvokeMethod(""BusinessBB"",sInps);			
					var BusinessBBPlanChange = sOutps.GetProperty(""BusinessBBPlanChange"");
					if(BusinessBBPlanChange == ""Y"")
					{
						alert(""Please check for 'Free email', 'Free Website Hosting', 'Domain Name', 'Bulk SMS' and take necessary action as per plan eligibility."");
					}	
					//Hardik Started Added for Try and Buy
						var OrderRec=0;
						sOutps = sWFSrvc.InvokeMethod(""ContactDetail"",sInps);			
						var vPopMssg = sOutps.GetProperty(""PopupContact"");	
						OrderRec =sOutps.GetProperty(""OrderRec"");
						if(OrderRec>0)
						{
							var vFlag = confirm(vPopMssg);
							if(vFlag == false)
							{
								return (""CancelOperation"");
							}
							else
							{
								return (""ContinueOperation"");
							}
						}		
				}
				if(SuspensionReason == ""SIM Lost"" && strOrderType == ""Suspend"")
				{
					alert(""The line will be terminated within 30 days if the customer does not call 124 to resume the line or approaches the retail outlet for SIM Replacement. Please make sure the alternate number and email are updated so that the customer can receive the necessary notifications"");	
				}
				if((SuspensionReason == ""Service not available"" || SuspensionReason == ""Complaint"" || SuspensionReason == ""Temporary Suspension"" || SuspensionReason == ""Customer Dis-satisfaction"") && strOrderType == ""Suspend"")
				{
					alert(""The line may be terminated after 3 months if the customer does not call 124 or approach a retail outlet to resume the line before the suspension end date.Please make sure the alternate number is updated so that a retention agent can reach the customer after 3 months"");	
				}
		
				if( strOrderType == ""Modify"" && strProfileType == ""Datacom"" )
				{
					objAppln = theApplication();
					Inputs = objAppln.NewPropertySet();
					Outputs = objAppln.NewPropertySet();
					svcService = objAppln.GetService(""STC Contract Date Calc"");
					Inputs.SetProperty(""Order Id"", strOrderId);
					Outputs = svcService.InvokeMethod(""CheckDatacomPenaltyProd"", Inputs);
					strRetCode = Outputs.GetProperty(""ReturnCode"");
					if( strRetCode == ""N"" )
					{
						alert(""You have not selected Datacom Terminated Product."");
					}
				}
				if(strOrderType == ""Provide"")
				{
					//Hardik : Added for Jawwy TV
					this.BusComp().WriteRecord();
					var vBS ="""", vinpPS ="""", voutPS ="""",JawwyFlg=""N"";
					var sErrCode="""", sErrMsg="""";
					var vChannel = """";
					vinpPS = theApplication().NewPropertySet();
					voutPS = theApplication().NewPropertySet();
					vBS = theApplication().GetService(""Workflow Process Manager"");
					with (vinpPS)
					{
						SetProperty(""ProcessName"", ""STC Jawwy Order Validation Process WF"");
						SetProperty(""Object Id"", strOrderId);
						SetProperty(""Operation"", ""ValidateJawwyTV"");
					}
						voutPS = vBS.InvokeMethod(""RunProcess"", vinpPS,voutPS);
					with(voutPS)
					{
						sErrCode = GetProperty(""Error Code"");
						sErrMsg = GetProperty(""Error Message"");
						JawwyFlg = GetProperty(""JawwyFlg"");
					}

					if(sErrCode == ""0"" && sErrMsg == ""SUCCESS"" && JawwyFlg == ""Y"" )
					{
						//theApplication().RaiseErrorText(vErrMsg);
						var sMessage = "" Press 'Ok' to continue with Add Jawwy TV or press 'Cancel' to Remove!"";
						var sFlag = confirm(sMessage);
						if (sFlag == false)
						{	
							var sinpPS ="""";
							var soutPS ="""";
							sinpPS = theApplication().NewPropertySet();
							soutPS = theApplication().NewPropertySet();
							var sBS = theApplication().GetService(""Workflow Process Manager"");
							with (sinpPS)
							{
								SetProperty(""ProcessName"", ""STC Jawwy Order Validation Process WF"");
								SetProperty(""Object Id"", strOrderId);
								SetProperty(""Operation"", ""DeleteJawwyTv"");
							}
							soutPS = sBS.InvokeMethod(""RunProcess"", sinpPS,soutPS);	
							//return (""CancelOperation"");
						}
						else
						{
							//return (""ContinueOperation"");
						}
					}
				  	///End Jawwy TV Code 

					//[NAVIN: 19Oct2017: AdvanceCreditPayments]
					var oBS, inpPS, outPS;
					var vErrCode="""", vErrMsg="""", vAirtimeDue="""";
					var vFlag = """";
					var ActiveBO = null, SANBC = null;
					var sMsisdn = """", sServiceAccId = """";
					var ContinueFlag;//[MANUJ]: [HBB VP Revamp]
					var OrderNetworkType = this.BusComp().GetFieldValue(""STC Network Identifier"");
					var ActiveView = theApplication().ActiveViewName();
					inpPS = theApplication().NewPropertySet();
					outPS = theApplication().NewPropertySet();
					oBS = theApplication().GetService(""Workflow Process Manager"");

					//alert (""Output: ""+strOrderId);
					with (inpPS)
					{
						SetProperty(""ProcessName"", ""STC Advance Credit Order Process WF"");
						SetProperty(""Object Id"", strOrderId);
						SetProperty(""Operation"", ""ValidateBrowserScript"");
					}
					outPS = oBS.InvokeMethod(""RunProcess"", inpPS,outPS);
					with(outPS)
					{
						vErrCode = GetProperty(""Error Code"");
						vErrMsg = GetProperty(""Error Message"");
						vAirtimeDue = GetProperty(""AirtimeDue"");
					}
					if(vErrCode != """" && vErrCode != ""0"")
					{
						//theApplication().RaiseErrorText(vErrMsg);
						var vMessage = vErrMsg +"" Press 'Ok' to continue with Validate or press 'Cancel' to Stop!"";
						var sFlag = confirm(vMessage);
						if (sFlag == false)
							return (""CancelOperation"");
						else
						{
							ContinueFlag =  NetworkConfirmation(strOrderId,OrderNetworkType);//[MANUJ]: [HBB VP Revamp]
							if (ContinueFlag == ""Y"")
								return (""ContinueOperation"");
							else
							{
							return (""CancelOperation"");
						}
							}
					}
					else
					{//return (""ContinueOperation"");
					ContinueFlag =  NetworkConfirmation(strOrderId,OrderNetworkType);//[MANUJ]: [HBB VP Revamp]
					      if (ContinueFlag == ""Y"")
							return (""ContinueOperation"");
						  else
						  {
							return (""CancelOperation"");
						  }
					}
				}//end of if(strOrderType == ""Provide"")
				if(strOrderType == ""Modify"")//Jithin: High end plan SD
				{
					var sBS, sInpPs, sOutPS;
					var  sExcessCharge="""", sErrMsg="""";
					sInpPs = theApplication().NewPropertySet();
					sOutPS = theApplication().NewPropertySet();
					sBS = theApplication().GetService(""Workflow Process Manager"");
					sInpPs.SetProperty(""ProcessName"", ""STC Get Device Credit Contract Termination WF"");
					sInpPs.SetProperty(""Object Id"", strOrderId);
					sInpPs.SetProperty(""OrderId"", strOrderId);					
					sOutPS = sBS.InvokeMethod(""RunProcess"", sInpPs,sOutPS);
					sExcessCharge = sOutPS.GetProperty(""ExcessCharge"");
					if(sExcessCharge > '0')
					{
						sErrMsg = ""You have ""+sExcessCharge+"" credit available to utilise. Click cancel to use the credit else the credit will be loose""
						var sVal = confirm(sErrMsg);
						if (sVal == true)
							return (""ContinueOperation"");
						else
						{
							return (""CancelOperation"");
						}
					}
				}
					
			}
			catch(e)
			{
			}
			finally
			{
				objAppln=null;
				Inputs=null;
				Outputs=null;
				svcService=null;
				oBS=null; inpPS=null; outPS=null;
				sBS=null;
				sInpPs=null; 
				sOutPS=null;
			}
			thisReturn = ""ContinueOperation"";
			break;
			
		default:
			thisReturn = ""ContinueOperation"";
			break;
	}

	return (thisReturn);
}
function NetworkConfirmation(strOrderId,OrderNetworkType)
{

					var oBS, inpPS, outPS;
					var vErrCode="""", vErrMsg="""", vAirtimeDue="""";
					var vFlag = """";
					var ActiveBO = null, SANBC = null;
					var sMsisdn = """", sServiceAccId = """",PopUpMsg = """";
					var ActiveView = theApplication().ActiveViewName();
					inpPS = theApplication().NewPropertySet();
					outPS = theApplication().NewPropertySet();
					oBS = theApplication().GetService(""Workflow Process Manager"");
					with (inpPS)
					{
						SetProperty(""ProcessName"", ""STCPlanNetworkPopUpWorkflow"");
						SetProperty(""Object Id"", strOrderId);
						SetProperty(""OrderNetworkType"", OrderNetworkType);
					}
					outPS = oBS.InvokeMethod(""RunProcess"", inpPS,outPS);
					with(outPS)
					{
						vErrCode = GetProperty(""Error Code"");
						vErrMsg = GetProperty(""Error Message"");
						PopUpMsg = GetProperty(""PopUpMsg"");
					}
					if(PopUpMsg == ""Y"")
					{
						var vMessage = vErrMsg +"" Press 'Ok' to continue with Validate or press 'Cancel' to Stop!"";
						var sFlag = confirm(vMessage);
						if (sFlag == false)
							return (""N"");
						else
							return (""Y"");
					}
					else
					{
							return (""Y"");
					}


}
"/*  
---------------+------+--------+----------------------------------------------  
Date(YYYYMMDD) | Ver  | By     | Description   
---------------+------+--------+----------------------------------------------  
26120712       |   1.0|   CP        Creation  
---------------+------+--------+----------------------------------------------
20130103       |   2.0|   SP        update  
---------------+------+--------+----------------------------------------------    
*/ 

function Applet_PreInvokeMethod (name, inputPropSet)
{
	var thisReturn = ""ContinueOperation"";
	switch(name)
	{
		case ""ValidateOrder"":
				try
				{
					var objAppln, Inputs, Outputs, svcService, strRetCode; 
					var numCountRec, strErrorCd, strPenaltyProd;
					var strOrderId 		= this.BusComp().GetFieldValue(""Id"");
					var strOrderType 	= this.BusComp().GetFieldValue(""STC Order SubType"");
					var strProfileType 	= this.BusComp().GetFieldValue(""STC Billing Profile Type"");
					
					if( strOrderType == ""Modify"" && strProfileType == ""Datacom"" )
					{
						objAppln = theApplication();
						Inputs = objAppln.NewPropertySet();
			         	Outputs = objAppln.NewPropertySet();
			         	svcService = objAppln.GetService(""STC Contract Date Calc"");
						Inputs.SetProperty(""Order Id"", strOrderId);
						Outputs = svcService.InvokeMethod(""CheckDatacomPenaltyProd"", Inputs);
						strRetCode = Outputs.GetProperty(""ReturnCode"");
						if( strRetCode == ""N"" )
						{
							alert(""You have not selected Datacom Terminated Product."");
						}
					}
					
				}
				catch(e)
				{
				}
				finally
				{
					objAppln=null;
					Inputs=null;
					Outputs=null;
					svcService=null;
				}
				thisReturn = ""ContinueOperation"";
				break;
			
		default:
				thisReturn = ""ContinueOperation"";
				break;
	}

	return (thisReturn);
}
/***********************************************************************************************
function Applet_PreInvokeMethod (name, inputPropSet)
{
   var strOrderId;
   var bsApplication = theApplication();
   var psInputs = bsApplication.NewPropertySet();
   var psOutputs = bsApplication.NewPropertySet();
   var strbsOutput;
   var strConfirm;
   var strOrderType;
   
                
    if(name == ""SubmitOrderSTC"")
	{
                          strOrderId = this.BusComp().GetFieldValue(""Id"");
                          strOrderType = this.BusComp().GetFieldValue(""STC Order SubType"");
                          if(strOrderType == ""Modify"")
                          {
                          
                          
                          var WFPsvc = theApplication().GetService(""Workflow Process Manager"");
						  psInputs.SetProperty(""ProcessName"", ""STC Check PenaltyProd WF"");
						  psInputs.SetProperty(""OrderId"",strOrderId);
						  psInputs.SetProperty(""OrderType"",strOrderType);
						  WFPsvc.InvokeMethod(""RunProcess"",psInputs,psOutputs);
                          strbsOutput = theApplication().GetProfileAttr(""ProductFlg"");
                         
                           
                                                
                          if(strbsOutput == ""Y"")
                             {
                          theApplication().SetProfileAttr(""ProductFlg"","""");
                          strConfirm = confirm(""Plesae collect penalty charges if applicable"");
                            if(strConfirm == true)
                                   {
                                   theApplication().SetProfileAttr(""ProductFlg"","""");                                                                                             
                                    return (""ContinueOperation"");
                              }
                          else
                          {
                                    theApplication().SetProfileAttr(""ProductFlg"","""");                                                                                             
                                    return (""ContinueOperation"");
                          }
                                                                                                           
          
                         }//if(strbsOutput == ""Y"")
                         
                        } // if(strOrderType == ""Modify"")
                                                                                                
	}//          if(name == ""SubmitOrderSTC"")
                           
	return (""ContinueOperation"");
}
***********************************************************************************************/"
function Applet_PreInvokeMethod (name, inputPropSet)
{
		if(name == ""ReserveMore"")
		{	 
			 
		 var inputPropSet = theApplication().NewPropertySet();
		 inputPropSet.SetProperty(""SWEMethod"", ""ShowPopup"");
		 inputPropSet.SetProperty(""SWETA"", ""STC PBX DID Reserve More Applet"");
		 inputPropSet.SetProperty(""SWEW"", ""800"");
		 inputPropSet.SetProperty(""SWEH"", ""400"");
		 inputPropSet.SetProperty(""SWESP"", ""true"");
		 inputPropSet.SetProperty(""SWEM"", ""Edit""); // Base, Edit, Edit List
		 this.InvokeMethod(""ShowPopup"", inputPropSet);
		 
		 return (""CancelOperation"");

		}
	return (""ContinueOperation"");
}
function Applet_Load ()
{

}
function Applet_PreInvokeMethod (name, inputPropSet)
{

if(name == ""GetCPR"")
{
			var smartcard = new ActiveXObject(""BH.CIO.Smartcard.IDCardManager.CardManager"");
			var testActivation = smartcard.TestSmartCardComActivation(""TestActivation"");
			var initiate =  smartcard.InitializesSCReaderLibrary();
			var formatDOB;
			var newformatDOB;
			var newformatExpiry;
			var newformatPassportExpiryDate;//Added for smartcard autopopulate SD
			var newformatPassportIssueDate;//Added for smartcard autopopulate SD
			var CheckExist;	
			var CPR;
			if(!initiate)
			{
			alert(""Card Initialization falied. Please try again"");
			}
		if(initiate)
			{
				smartcard.EnableSmartcardEvents();
				smartcard.ToIncludeBiometricSupportInfo = true;
				smartcard.ToIncludeDisabilityInfo = true;
				smartcard.ToIncludeEmploymentInfo = true;
				smartcard.ToIncludePassportInfo = true;
				smartcard.ToIncludePersonalInfo = true;
				smartcard.ToIncludePhoto = true;
				smartcard.ToIncludeAddressInfo = true;
				smartcard.ToIncludeSignature = true;
				var read = smartcard.ReadCard();
		if(read)
				{
				
				CPR = smartcard.SmartcardData.IdNumber;
                var appObj = theApplication();

				var psInputs = appObj.NewPropertySet();
				var psOutputs = appObj.NewPropertySet();
				
			}//if(Read)
				
		   }//if(Initiate)
		   
		   with(this.BusComp())
		   
		   {
		   
		    SetFieldValue(""CPR"", CPR);
		   
		   }
		}

	return (""ContinueOperation"");
}
"top.showTooltip=function(o,sText)
{
//get the co-ordinates of the control
var xy = getXYpos(o);
//create a html div element
var elmnt=o.document.createElement(""div"");
//make the element white text, black background
//align the text, some padding, id=tt
//and set the html within the div to be the
//text passed into this function
elmnt.style.color=""#FFFFFF"";
elmnt.style.backgroundColor=""#000000"";
elmnt.style.textAlign=""left"";
elmnt.style.padding=""3px"";
elmnt.id=""tt"";
elmnt.innerHTML=sText;
//set the div to be
}//MANUJ: Incomplete Config"
function Applet_PreInvokeMethod (name, inputPropSet)
{
if (name == ""Reserve_MSISDN"")

{

var sCreditFlag;
	sCreditFlag = confirm(""i. Have you informed the customer to follow up within three days by calling 124? \n ii. Have you double-checked the reservation details and notification details."");

	if(sCreditFlag == false)
    return (""CancelOperation"");
    else
    return (""ContinueOperation"");


}


	return (""ContinueOperation"");
}
function getXYpos(elem)
{
if (!elem)
{
return {""x"":0,""y"":0};
}
var xy={""x"":elem.offsetLeft,""y"":elem.offsetTop}
var par=getXYpos(elem.offsetParent);
for (var key in par)
{
xy[key]+=par[key];
}
return xy;
}
//Your public declarations go here...
function Applet_ChangeFieldValue (field, value)
{
	var strActivePos = theApplication().GetProfileAttr(""Me.Position"");
	
	if(field == ""Payment Receipt Number"")
	{
		if(strActivePos==""PRM Partner Manager"" || strActivePos==""PRM Sales Team"")
		{
			return(CancelOperation);
		}
	}//end of field == ""Payment Receipt Number""

}
function Applet_PreInvokeMethod (name, inputPropSet)
{

	var thisReturn = ""ContinueOperation"";
	if(name == ""ValidateOrder"")
	{
		var strOrderId 		= this.BusComp().GetFieldValue(""Id"");
		var strOrderType 	= this.BusComp().GetFieldValue(""STC Order SubType"");
		var strProfileType 	= this.BusComp().GetFieldValue(""STC Billing Profile Type"");
		var strServiceMig 	= this.BusComp().GetFieldValue(""STC Migration Sub Type"");
		
		var sobjAppln = """";
		var sInps = """";
		var sOutps = """";
		var sWFSrvc = """";
		var sPopMssg = """";
		var sFlag= """";
		
		if(strServiceMig == ""Service Migration"")
		{
			sobjAppln = theApplication();	
			sInps = sobjAppln.NewPropertySet();
			sOutps = sobjAppln.NewPropertySet();
			
			sWFSrvc = sobjAppln.GetService(""STC Auto Plan Migration Service"");			
			sInps.SetProperty(""OrderId"",strOrderId);			
			sOutps = sWFSrvc.InvokeMethod(""Validate"",sInps,sOutps);
			sPopMssg = sOutps.GetProperty(""PopupMessage"");
			sFlag = confirm(sPopMssg);
				if(sFlag == false)
					return (""CancelOperation"");
				else
					return (""ContinueOperation"");
		}
	}

	return (""ContinueOperation"");
}
function Applet_InvokeMethod (name, inputPropSet)
{

}
"
function Applet_PreInvokeMethod (name, inputPropSet)
{
		if(name == ""ReserveMore"")
		{	 
			 
		 var inputPropSet = theApplication().NewPropertySet();
		 inputPropSet.SetProperty(""SWEMethod"", ""ShowPopup"");
		 inputPropSet.SetProperty(""SWETA"", ""STC PBX DID Reserve More Applet"");
		 inputPropSet.SetProperty(""SWEW"", ""800"");
		 inputPropSet.SetProperty(""SWEH"", ""400"");
		 inputPropSet.SetProperty(""SWESP"", ""true"");
		 inputPropSet.SetProperty(""SWEM"", ""Edit""); // Base, Edit, Edit List
		 this.InvokeMethod(""ShowPopup"", inputPropSet);
		 
		 return (""CancelOperation"");

		}
	return (""ContinueOperation"");
}
function Applet_Load ()
{

}
function Applet_PreInvokeMethod (name, inputPropSet)
{

	return (""ContinueOperation"");
}
function Applet_Load ()
{

}
function Applet_PreInvokeMethod (name, inputPropSet)
{

if(name == ""GetCPR"")
{
			var smartcard = new ActiveXObject(""BH.CIO.Smartcard.IDCardManager.CardManager"");
			var testActivation = smartcard.TestSmartCardComActivation(""TestActivation"");
			var initiate =  smartcard.InitializesSCReaderLibrary();
			var formatDOB;
			var newformatDOB;
			var newformatExpiry;
			var newformatPassportExpiryDate;//Added for smartcard autopopulate SD
			var newformatPassportIssueDate;//Added for smartcard autopopulate SD
			var CheckExist;	
			var CPR;
			if(!initiate)
			{
			alert(""Card Initialization falied. Please try again"");
			}
		if(initiate)
			{
				smartcard.EnableSmartcardEvents();
				smartcard.ToIncludeBiometricSupportInfo = true;
				smartcard.ToIncludeDisabilityInfo = true;
				smartcard.ToIncludeEmploymentInfo = true;
				smartcard.ToIncludePassportInfo = true;
				smartcard.ToIncludePersonalInfo = true;
				smartcard.ToIncludePhoto = true;
				smartcard.ToIncludeAddressInfo = true;
				smartcard.ToIncludeSignature = true;
				var read = smartcard.ReadCard();
		if(read)
				{
				
				CPR = smartcard.SmartcardData.IdNumber;
                var appObj = theApplication();

				var psInputs = appObj.NewPropertySet();
				var psOutputs = appObj.NewPropertySet();
				
			}//if(Read)
				
		   }//if(Initiate)
		   
		   with(this.BusComp())
		   
		   {
		   
		    SetFieldValue(""CPR"", CPR);
		   
		   }
		}

	return (""ContinueOperation"");
}
function Applet_Load ()
{

}
function Applet_PreInvokeMethod (name, inputPropSet)
{

if(name == ""GetCPR"")
{
			var smartcard = new ActiveXObject(""BH.CIO.Smartcard.IDCardManager.CardManager"");
			var testActivation = smartcard.TestSmartCardComActivation(""TestActivation"");
			var initiate =  smartcard.InitializesSCReaderLibrary();
			var formatDOB;
			var newformatDOB;
			var newformatExpiry;
			var newformatPassportExpiryDate;//Added for smartcard autopopulate SD
			var newformatPassportIssueDate;//Added for smartcard autopopulate SD
			var CheckExist;	
			var CPR;
			if(!initiate)
			{
			alert(""Card Initialization falied. Please try again"");
			}
		if(initiate)
			{
				smartcard.EnableSmartcardEvents();
				smartcard.ToIncludeBiometricSupportInfo = true;
				smartcard.ToIncludeDisabilityInfo = true;
				smartcard.ToIncludeEmploymentInfo = true;
				smartcard.ToIncludePassportInfo = true;
				smartcard.ToIncludePersonalInfo = true;
				smartcard.ToIncludePhoto = true;
				smartcard.ToIncludeAddressInfo = true;
				smartcard.ToIncludeSignature = true;
				var read = smartcard.ReadCard();
		if(read)
				{
				
				CPR = smartcard.SmartcardData.IdNumber;
                var appObj = theApplication();

				var psInputs = appObj.NewPropertySet();
				var psOutputs = appObj.NewPropertySet();
				
			}//if(Read)
				
		   }//if(Initiate)
		   
		   with(this.BusComp())
		   
		   {
		   
		    SetFieldValue(""CPR"", CPR);
		   
		   }
		}

	return (""ContinueOperation"");
}
function Applet_Load ()
{
	try
	{		
			//var sCallTier= this.BusComp().GetFieldValue(""INS Sub-Area"");
			if(theApplication().ActiveViewName() != ""STC Trouble Ticket Payments View"")
			{
				var ctrl = this.FindActiveXControl(""Submit"");
				ctrl.style.visibility=""hidden"";
			}
	}	
	catch (e)
	{
		LogException(e);
	}
	finally
	{
	
	}
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	var thisReturn = ""ContinueOperation"";
	switch(name)
	{
		case ""PlanChange"":
		case ""Terminate"":
		try
		{
			var sPilot = """", sBulkId = """", sOpptyId = """", sFlag = """";
			var svcService = """", sInputs = """", sOutputs = """";
			var sErrCode = ""0"", sErrMsg = ""SUCCESS"";

			var sPilot = this.BusComp().GetFieldValue(""Id"");
			var sOpptyId 	= this.BusComp().GetFieldValue(""Opportunity Id"");
			var sBulkId 	= this.BusComp().GetFieldValue(""Bulk Id"");
			
			sInputs = theApplication().NewPropertySet();
			sOutputs = theApplication().NewPropertySet();
			svcService = theApplication().GetService(""Workflow Process Manager"");
			sInputs.SetProperty(""ProcessName"", ""STCVIVAOneBrowserCodeProcess"");
			sInputs.SetProperty(""Object Id"", sOpptyId);
			sInputs.SetProperty(""PilotRowId"", sPilot);
			sInputs.SetProperty(""BulkRowId"", sBulkId);
			sInputs.SetProperty(""Method"", name);
			sOutputs = svcService.InvokeMethod(""RunProcess"", sInputs, sOutputs);
			sErrCode = sOutputs.GetProperty(""Error Code"");
			sErrMsg = sOutputs.GetProperty(""Error Message"");
			if(sErrCode != ""0"")
			{
				if(sErrCode == ""FIRSTPROV"")
				{
					alert(sErrMsg);
					return (""CancelOperation"");
				}
				else
				{
					sFlag = confirm(sErrMsg);
					if (sFlag == false)
					return (""CancelOperation"");
					else
					return (""ContinueOperation"");
				}
			}
		}
		catch(e)
		{
		}
		finally
		{
			sInputs=null;
			sOutputs=null;
			svcService=null;
		}
		thisReturn = ""ContinueOperation"";
		break;

		default:
		thisReturn = ""ContinueOperation"";
		break;
	}
	return (thisReturn);
}
function Applet_Load ()
{
theApplication().SetProfileAttr(""UIBahrainiUpdateNormalUser"",""N"");
theApplication().SetProfileAttr(""CPRGetDetailsTriggered"",""N"");
}
function Applet_Load ()
{
try
{
		var sApplnURL = document.location.toString();
		var sApplnMode = sApplnURL.indexOf(""OUI"").toString();
		if(sApplnMode == -1)
		{
			TheApplication().SetProfileAttr(""ApplicationMode"",""HI"");
		}
		else
		{
			TheApplication().SetProfileAttr(""ApplicationMode"",""OpenUI"");
		}
		TheApplication().SetProfileAttr(""UIBahrainiUpdateNormalUser"",""N"");
		TheApplication().SetProfileAttr(""CPRGetDetailsTriggered"",""N"");
		return (""ContinueOperation"");
}
catch(e)
{
	alert(e);
	return(""CancelOperation""); 
}
finally
{

}


}
function Applet_PreInvokeMethod (name, inputPropSet)
{

try
{
var CPR,Name,Gender,Dob,CardExpiry,FName,LName,MiddleName,Address,Flat,Building,Road,BlockNo,Governorate,Nationality,Occupation,SponsorName,SponsorNo,PassportNo,PassportIssueDate,PassportExpiryDate,LabourForceParticipation,EmployerNumber,EmployerName;
var CheckExist;
var sAppMode = TheApplication().GetProfileAttr(""IsOpenUI"");
if(name == ""STCGetCustomerDetails"" && sAppMode == 0) 
		{ 
			//MANUJ Added to conditionally check for Old/New DLL -- START
			var SId = this.BusComp().GetFieldValue(""Id"");
			var appObjSC = theApplication();
			var InputsSC = appObjSC.NewPropertySet();
			var OutputsSC = appObjSC.NewPropertySet();
			var svcServiceSC = appObjSC.GetService(""Workflow Process Manager"");
			InputsSC.SetProperty(""ProcessName"",""STC SmartCard Old_New DLL Decider"");
			InputsSC.SetProperty(""Object Id"",SId);
			OutputsSC = svcServiceSC.InvokeMethod(""RunProcess"",InputsSC);
			var DLLFlag = OutputsSC.GetProperty(""Value"");
			//MANUJ Added to conditionally check for Old/New DLL -- END
				//Profile Section
		    theApplication().SetProfileAttr(""UIBahrainiUpdateNormalUser"",""Y"");
		    //Profile Section
		    if(DLLFlag == ""Old"")
			{
			var smartcard = new ActiveXObject(""KOBSC.SDK.SmartCardManagerLegacy"");
			var initiateOld = smartcard.InitateSmartCardManagerLibrary();
			var formatDOB;
			var newformatDOB;
			var newformatExpiry;
			var newformatPassportExpiryDate;//Added for smartcard autopopulate SD
			var newformatPassportIssueDate;//Added for smartcard autopopulate SD
			if(!initiateOld)
			{
			alert(""Card Initialization falied. Please try again"");
			}
			
			if(initiateOld)
			{
				var samerror = false"";
				var carderror = false"";
				var readOld = smartcard.ReadDataFromCard(samerror, carderror);	
	
		if(readOld)
		{
				theApplication().SetProfileAttr(""CPRGetDetailsTriggered"",""Y"");
				CPR = smartcard.DataFromSmartCard.CPR0104_ElementData;
				Name = smartcard.DataFromSmartCard.FullNameEn_ElementData;
				Gender = smartcard.DataFromSmartCard.CPR0117_ElementData;
				Dob = smartcard.DataFromSmartCard.CPR0118_ElementData;
				CardExpiry = smartcard.DataFromSmartCard.CPR0119_ElementData;
				FName = smartcard.DataFromSmartCard.CPR0105_ElementData;
				LName = smartcard.DataFromSmartCard.CPR0110_ElementData;
				MiddleName = smartcard.DataFromSmartCard.CPR0106_ElementData;
				Address = smartcard.DataFromSmartCard.CorrenpondenceAddress_ElementData;
				Flat = smartcard.DataFromSmartCard.CPR0308_ElementData;
				Building = smartcard.DataFromSmartCard.CPR0309_ElementData;
				Road = smartcard.DataFromSmartCard.CPR0312_ElementData;
				BlockNo = smartcard.DataFromSmartCard.CPR0315_ElementData;
				Governorate = smartcard.DataFromSmartCard.CPR0318_ElementData;
				Nationality = smartcard.DataFromSmartCard.GDNPR0103_ElementData;
				Occupation= smartcard.DataFromSmartCard.CPR1203_ElementData;
				//Occupation Missing
				SponsorName= smartcard.DataFromSmartCard.CPR1237_ElementData;//AutoPopulate
				SponsorNo= smartcard.DataFromSmartCard.CPR1236_ElementData;//AutoPopulate
				PassportNo= smartcard.DataFromSmartCard.GDNPR0203_ElementData;//AutoPopulate
				PassportIssueDate= smartcard.DataFromSmartCard.GDNPR0206_ElementData;//AutoPopulate
				PassportExpiryDate= smartcard.DataFromSmartCard.GDNPR0207_ElementData;//AutoPopulate
				LabourForceParticipation= smartcard.DataFromSmartCard.CPR1242_ElementData;//AutoPopulate
		            // var CardIssueDate= smartcard.DataFromSmartCard.CPR02B02_ElementData;//AutoPopulate
				EmployerNumber= smartcard.DataFromSmartCard.CPR1205_ElementData;//AutoPopulate
				EmployerName= smartcard.DataFromSmartCard.CPR1206_ElementData;//AutoPopulate
		}//	if(readOld)
		
				}//	if(initiateOld)
				}//OLD DLL		
		if(DLLFlag == ""New"")
		{   
			var smartcard = new ActiveXObject(""BH.CIO.Smartcard.IDCardManager.CardManager"");
			var testActivation = smartcard.TestSmartCardComActivation(""TestActivation"");
			var initiate =  smartcard.InitializesSCReaderLibrary();
			var formatDOB;
			var newformatDOB;
			var newformatExpiry;
			var newformatPassportExpiryDate;//Added for smartcard autopopulate SD
			var newformatPassportIssueDate;//Added for smartcard autopopulate SD
	
			if(!initiate)
			{
			alert(""Card Initialization failed. Please try again"");
			}
		if(initiate)
			{
				smartcard.EnableSmartcardEvents();
				smartcard.ToIncludeBiometricSupportInfo = true;
				smartcard.ToIncludeDisabilityInfo = true;
				smartcard.ToIncludeEmploymentInfo = true;
				smartcard.ToIncludePassportInfo = true;
				smartcard.ToIncludePersonalInfo = true;
				smartcard.ToIncludePhoto = true;
				smartcard.ToIncludeAddressInfo = true;
				smartcard.ToIncludeSignature = true;
				var read = smartcard.ReadCard();
		if(read)
				{
				theApplication().SetProfileAttr(""CPRGetDetailsTriggered"",""Y"");
				CPR = smartcard.SmartcardData.IdNumber;
				Name = smartcard.SmartcardData.EnglishFullName;
				Gender = smartcard.SmartcardData.Gender;
				Dob = smartcard.SmartcardData.BirthDate;
				CardExpiry = smartcard.SmartcardData.CardexpiryDate;
				CardCountry = smartcard.SmartcardData.CardCountry;
				Address = smartcard.SmartcardData.AddressEnglish;
				Nationality = smartcard.SmartcardData.NationalityCode;
				Occupation = smartcard.SmartcardData.OccupationEnglish;
				CardIssueDate = smartcard.SmartcardData.CardIssueDate;//Card Issue Date read
                var xmlHierarchy = smartcard.SmartcardData.SeralizeToXMLString();//convert to XML
                xmlHierarchy = xmlHierarchy.toString();//XML to string
                var appObj = theApplication();

				var psInputs = appObj.NewPropertySet();
				var psOutputs = appObj.NewPropertySet();
				var XMLService = appObj.GetService(""STC Get Country"");
				psInputs.SetProperty(""xmlHierarchy"",xmlHierarchy);
				psOutputs = XMLService.InvokeMethod(""GetCardDetails"",psInputs);
				FName = psOutputs.GetProperty(""FirstNameEnglish"");
				LName = psOutputs.GetProperty(""LastNameEnglish"");
				if(LName == '-')
				{
				LName = '';
				}
				MiddleName = psOutputs.GetProperty(""MiddleName1English"");
				if(MiddleName == '-')
				{
				MiddleName = '';
				}
				Flat = psOutputs.GetProperty(""FlatNo"");
				Building = psOutputs.GetProperty(""BuildingNo"");
				Road = psOutputs.GetProperty(""RoadNo"");
				BlockNo = psOutputs.GetProperty(""BlockNo"");
				//var Governorate = psOutputs.GetProperty(""GovernorateNameEnglish"");
				//Occupation Missing
				SponsorName= smartcard.SmartcardData.SponserNameEnglish;//AutoPopulate
				SponsorNo= smartcard.SmartcardData.SponserId;//AutoPopulate
				PassportNo= smartcard.SmartcardData.PassportNumber;//AutoPopulate
				PassportIssueDate= smartcard.SmartcardData.PassportIssueDate;//AutoPopulate
				PassportExpiryDate= smartcard.SmartcardData.PassportExpiryDate;//AutoPopulate
				LabourForceParticipation= psOutputs.GetProperty(""LaborForceParticipation"");//LFP need to analyze
				// var CardIssueDate= smartcard.DataFromSmartCard.CPR02B02_ElementData;//AutoPopulate
				EmployerNumber= smartcard.SmartcardData.EmploymentId;//AutoPopulate
				EmployerName= smartcard.SmartcardData.EmploymentNameEnglish;//AutoPopulate
			}//if(Read)
				
		   }//if(Initiate)
			
		}//NEW DLL
				var appObj = theApplication();
				var Inputs = appObj.NewPropertySet();
				var Outputs = appObj.NewPropertySet();
				var svcService = appObj.GetService(""STC Get Country"");
				Inputs.SetProperty(""CountryCode"",Nationality);
				Inputs.SetProperty(""CardOccupation"",Occupation);//Auto
				Outputs = svcService.InvokeMethod(""GetCountry"",Inputs);
				var country = Outputs.GetProperty(""Nationality"");
				var SystemOccupation = Outputs.GetProperty(""SystemOccupation"");//Auto
		
				var day = Dob.substring(0,2);
				var Mon = Dob.substring(3,5);
				var Year = Dob.substring(6,10);
				
				var Expday = CardExpiry.substring(0,2);
				var ExpMon = CardExpiry.substring(3,5);
				var ExpYear = CardExpiry.substring(6,10);
				
				var PExpday = PassportExpiryDate.substring(0,2);//Added for smartcard autopopulate SD
				var PExpMon = PassportExpiryDate.substring(3,5);//Added for smartcard autopopulate SD
				var PExpYear = PassportExpiryDate.substring(6,10);//Added for smartcard autopopulate SD
				
				var PIssueday = PassportIssueDate.substring(0,2);//Added for smartcard autopopulate SD
				var PIssueMon = PassportIssueDate.substring(3,5);//Added for smartcard autopopulate SD
				var PIssueYear = PassportIssueDate.substring(6,10);//Added for smartcard autopopulate SD
				
				
				formatDOB = day+""/""+Mon+""/""+Year;
				newformatDOB = Mon+""/""+day+""/""+Year;
				newformatExpiry = ExpMon+""/""+Expday+""/""+ExpYear;
				newformatPassportExpiryDate = PExpMon+""/""+PExpday+""/""+PExpYear;//Added for smartcard autopopulate SD
				newformatPassportIssueDate = PIssueMon+""/""+PIssueday+""/""+PIssueYear;//Added for smartcard autopopulate SD
				
				
				with(this.BusComp())
				{	
					
						//ActivateField(""STC Existing Cust Flag"");
						CheckExist = GetFieldValue(""STC Existing Cust Flag"");
						if(CheckExist == ""Y""){//Update BH only if existing customer
						SetFieldValue(""STC GCC Country Code"",""BH"");
						SetFieldValue(""STC Existing Customer"","""");
						SetFieldValue(""STC Existing Cust Flag"","""");
						SetFieldValue(""STC New Company Name"","""");
						}
						SetFieldValue(""STC New Customer Type"", ""Individual"");	
						SetFieldValue(""STC New First Name"", FName);
						SetFieldValue(""STC New Last Name"", LName);
						SetFieldValue(""STC New Father Name"", MiddleName);
						SetFieldValue(""STC ID Number"", CPR);
						SetFieldValue(""STC New Gender"", Gender);
						SetFieldValue(""STC Date Of Birth"", newformatDOB);	
						SetFieldValue(""STC ID Type"", ""Bahraini ID"");
						SetFieldValue(""STC ID New Exipry Date"", newformatExpiry);
						SetFieldValue(""STC New Address Apartment Number"", Flat);
						SetFieldValue(""STC New Address Strret Address"", Building);
						SetFieldValue(""STC New Address Road No"", Road);
						SetFieldValue(""STC New Address Strret Address 2"", BlockNo);
     					SetFieldValue(""STC New Address Type"", ""Billing"");
						SetFieldValue(""STC New Address State"", Governorate);
						SetFieldValue(""STC New Nationality"", country);
						SetFieldValue(""STC Occupation"",SystemOccupation);//Autopopulate
						SetFieldValue(""APN OrderItemId"",Occupation);//Autopopulate
						SetFieldValue(""STC Update Sponsor Name"",SponsorName);//AutoPopulate
						SetFieldValue(""STC Update Sponsor Number"",SponsorNo);//AutoPopulate
						SetFieldValue(""STC Update Passport Number"",PassportNo);//AutoPopulate
					    SetFieldValue(""STC Update Passport Issue Date"",newformatPassportIssueDate);//AutoPopulate Changed as part of Autopopulate SD
						SetFieldValue(""STC Update Passport Expiry Date"",newformatPassportExpiryDate);//AutoPopulate Changed as part of Autopopulate SD	
						SetFieldValue(""STC Update LFP"",LabourForceParticipation);//AutoPopulate
					//	SetFieldValue(""STC Update Card Issue Date"",CardIssueDate);//AutoPopulate Not Captured
						SetFieldValue(""STC Update Employer Number"",EmployerNumber);//AutoPopulate
						SetFieldValue(""STC Update Employer Name"",EmployerName);//AutoPopulate
						WriteRecord();
						InvokeMethod(""RefreshBusComp"");
					    InvokeMethod(""RefreshRecord"");
				
				}//with(this.BusComp())*/
		
		return(""CancelOperation""); 
		}
	else
	
	return (""ContinueOperation"");
	}
	catch(e)
	{
		alert(e);
		return(""CancelOperation""); 
	}
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
//alert(""PreInvoke"");
	if(name == ""NavigateToPlans"")
	{
		var appObjSC = theApplication();
		var sMasterPromotionId = this.BusComp().GetFieldValue(""Id"");
		var sMasterPromoName = this.BusComp().GetFieldValue(""Promotion Category"");
		
		theApplication().SetProfileAttr(""gMasterPromotionId"",sMasterPromotionId);
		theApplication().SetProfileAttr(""gMasterPromoName"",sMasterPromoName);
		
		if (sMasterPromoName == ""Postpaid Renewal Offer"")
		{//[20Oct2016][NAVIN: RenewalOfferPP]
			var sServcAccId = theApplication().GetProfileAttr(""AccountId"");
			var sProdType = ""Service Plan""; //theApplication().InvokeMethod(""LookupValue"",""PRODUCT_TYPE"",""Service Plan"");
			//alert(""Service Account Id: ""+sServcAccId+"":""+sProdType);
			
			var InputsSC = theApplication().NewPropertySet();
			var OutputsSC = theApplication().NewPropertySet();
			var svcServiceSC = theApplication().GetService(""STC Siebel Operation BS"");
			
			with(InputsSC)
			{
				SetProperty(""BusinessObject"", ""STC Service Account"");
				SetProperty(""BusinessComponent"", ""Asset Mgmt - Asset (Order Mgmt)"");
				SetProperty(""SearchExpression"", ""[Service Account Id]='""+sServcAccId+""' AND [STC Plan Type]='""+sProdType+""' AND [Status]='Active'"");
				SetProperty(""Field1"", ""Id"");
				SetProperty(""Field2"", ""Service Account Id"");
				SetProperty(""Field3"", ""STC Plan Type"");
				SetProperty(""Field4"", ""Status"");
				SetProperty(""Field5"", ""Product Id"");
				SetProperty(""Field6"", ""Product Part Number"");
			}
			
			OutputsSC = svcServiceSC.InvokeMethod(""SiebelQuery"", InputsSC);
			var vRecCount = OutputsSC.GetProperty(""RecordCount"");
			var vSvcPlanId = OutputsSC.GetProperty(""Output5"");
			var vSvcPlanProd= OutputsSC.GetProperty(""Output6"");
			
			if (vRecCount != ""0"")
			{
				theApplication().SetProfileAttr(""gServicePlanId"",vSvcPlanId);
				theApplication().SetProfileAttr(""gServicePlanProd"",vSvcPlanProd);
			}
			else{
				throw(""No Service Plan found for the given Subscriber!"");
				return (""CancelOperation"");
			}
		}//end of if
		else{
			var InputsSC = appObjSC.NewPropertySet();
			var OutputsSC = appObjSC.NewPropertySet();
			var svcServiceSC = appObjSC.GetService(""STC Get BTL Plan List Service"");
			OutputsSC = svcServiceSC.InvokeMethod(""GetPLanList"",InputsSC);
			var ErrProf = appObjSC.GetProfileAttr(""ErrorPlanList"");
			if(ErrProf == ""Y"")
			{
				appObjSC.SetProfileAttr(""ErrorPlanList"","""");
				return (""CancelOperation"");
			}
		
		}//end of else
		
		var inputPropSet = theApplication().NewPropertySet();
		inputPropSet.SetProperty(""SWEMethod"", ""ShowPopup"");
		inputPropSet.SetProperty(""SWETA"", ""STC Promo Mgmg Customer Survey End Prod Popup Applet"");
		inputPropSet.SetProperty(""SWEW"", ""700"");
		inputPropSet.SetProperty(""SWEH"", ""700"");
		inputPropSet.SetProperty(""SWESP"", ""true"");
		inputPropSet.SetProperty(""SWEM"", ""Edit List""); // Base, Edit, Edit List
		this.InvokeMethod(""ShowPopup"", inputPropSet);
		//this.InvokeMethod(""CloseApplet"");
	
		return (""CancelOperation"");

		
	}
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	/*if(name == ""Submit"")
	{
		var sFlag = confirm(""Selected Voucher/Promotion will now be applied, Click on OK to continue"");
		
		if (sFlag == false)
			return (""CancelOperation"");
		else
			return (""ContinueOperation"");	
	}*/
	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	/*if(name == ""Submit"")
	{
		var sFlag = confirm(""Selected Voucher/Promotion will now be applied, Click on OK to continue"");
		
		if (sFlag == false)
			return (""CancelOperation"");
		else
			return (""ContinueOperation"");	
	}*/
	return (""ContinueOperation"");
}
"top.showTooltip=function(o,sText)
{
//get the co-ordinates of the control
var xy = getXYpos(o);
//create a html div element
var elmnt=o.document.createElement(""div"");
//make the element white text, black background
//align the text, some padding, id=tt
//and set the html within the div to be the
//text passed into this function
elmnt.style.color=""#FFFFFF"";
elmnt.style.backgroundColor=""#000000"";
elmnt.style.textAlign=""left"";
elmnt.style.padding=""3px"";
elmnt.id=""tt"";
elmnt.innerHTML=sText;
//set the div to be
}//MANUJ: Incomplete Config"
function Applet_PreInvokeMethod (name, inputPropSet)
{
if (name == ""Reserve_MSISDN"")

{

var sCreditFlag;
	sCreditFlag = confirm(""i. Have you informed the customer to follow up within three days by calling 124? \n ii. Have you double-checked the reservation details and notification details."");

	if(sCreditFlag == false)
    return (""CancelOperation"");
    else
    return (""ContinueOperation"");


}


	return (""ContinueOperation"");
}
function getXYpos(elem)
{
if (!elem)
{
return {""x"":0,""y"":0};
}
var xy={""x"":elem.offsetLeft,""y"":elem.offsetTop}
var par=getXYpos(elem.offsetParent);
for (var key in par)
{
xy[key]+=par[key];
}
return xy;
}
//Your public declarations go here...
function Applet_PreInvokeMethod (name, inputPropSet)
{

	if(name == ""GetRetentionOffers"")
	{
		var sMSISDN = this.BusComp().GetFieldValue(""STC MSISDN"");
		var sDisLevel1 = this.BusComp().GetFieldValue(""STC Dissatisfaction Level1"");
		var sDisLevel2 = this.BusComp().GetFieldValue(""STC Dissatisfaction Level2"");
		var sPricingPlanType = this.BusComp().GetFieldValue(""STC Pricing Plan Type"");
		

		var appObjSC = theApplication();
		var InputsSC = appObjSC.NewPropertySet();
		var OutputsSC = appObjSC.NewPropertySet();
		var svcServiceSC = appObjSC.GetService(""STC Get Retention Details Service"");
		InputsSC.SetProperty(""MSISDN"",sMSISDN);
		InputsSC.SetProperty(""DisLevel1"",sDisLevel1);
		InputsSC.SetProperty(""DisLevel2"",sDisLevel2);
		InputsSC.SetProperty(""PricingPlanType"",sPricingPlanType);
		OutputsSC = svcServiceSC.InvokeMethod(""CheckRetentionOffer"",InputsSC);
		var ErrorOccured = OutputsSC.GetProperty(""ErrorOccured"");
		var ErrProf = appObjSC.GetProfileAttr(""ErrorOccured"");
		if(ErrProf == ""Y"")
		{
		appObjSC.GetProfileAttr(""ErrorOccured"","""");
		return (""CancelOperation"");
		}

		var inputPropSet = theApplication().NewPropertySet();
		inputPropSet.SetProperty(""SWEMethod"", ""ShowPopup"");
		inputPropSet.SetProperty(""SWETA"", ""STC Retention Offer Output Applet"");
		inputPropSet.SetProperty(""SWEW"", ""700"");
		inputPropSet.SetProperty(""SWEH"", ""700"");
		inputPropSet.SetProperty(""SWESP"", ""true"");
		inputPropSet.SetProperty(""SWEM"", ""Edit List""); // Base, Edit, Edit List
		this.InvokeMethod(""ShowPopup"", inputPropSet);
		

		return (""CancelOperation"");

	}

	return (""ContinueOperation"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	if(name == ""RejectOffer"")
	{
		var sFlag = confirm(""You have clicked on 'Reject' button. Press 'Ok' to continue or press 'Cancel'."");
		if(sFlag == false)
		return (""CancelOperation"");
		else
		return (""ContinueOperation"");
	}
}
function Edit__0__Control__Issue_SObserved_SDate__onchange (applet, id)
{
alert(""CHANGED"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	if(name == ""VoucherAccept"")
	{
		var sFlag = confirm(""System will now process payment through voucher. Please press ‘Ok’ to continue or press ‘Cancel"");
		if(sFlag == false)
		return (""CancelOperation"");
		else
		return (""ContinueOperation"");
	}

	return (""ContinueOperation"");
}
function Applet_Load ()
{
	try
	{		
			//var sCallTier= this.BusComp().GetFieldValue(""INS Sub-Area"");
			if(theApplication().ActiveViewName() != ""STC Service Enquiry Payments View"")
			{
				var ctrl = this.FindActiveXControl(""Submit"");
				ctrl.style.visibility=""hidden"";
			}
	}	
	catch (e)
	{
		LogException(e);
	}
	finally
	{
	
	}		
}
function Applet_Load ()
{
	try
	{		
			//var sCallTier= this.BusComp().GetFieldValue(""INS Sub-Area"");
			if(theApplication().ActiveViewName() != ""STC Service Enquiry Payments View"")
			{
				var ctrl = this.FindActiveXControl(""Submit"");
				ctrl.style.visibility=""hidden"";
			}
	}	
	catch (e)
	{
		LogException(e);
	}
	finally
	{
	
	}
}
function Applet_Load ()
{
	try
	{		
			//var sCallTier= this.BusComp().GetFieldValue(""INS Sub-Area"");
			if(theApplication().ActiveViewName() != ""STC Service Request Payments View"")
			{
				var ctrl = this.FindActiveXControl(""Submit"");
				ctrl.style.visibility=""hidden"";
			}
	}	
	catch (e)
	{
		LogException(e);
	}
	finally
	{
	
	}
}
function Applet_Load ()
{
	try
	{		
			//var sCallTier= this.BusComp().GetFieldValue(""INS Sub-Area"");
			if(theApplication().ActiveViewName() != ""STC Service Request Payments View"")
			{
				var ctrl = this.FindActiveXControl(""Submit"");
				ctrl.style.visibility=""hidden"";
			}
	}	
	catch (e)
	{
		LogException(e);
	}
	finally
	{
	
	}
}
function Applet_Load ()
{
try
{
	/*	var sApplnURL = document.location.toString();
		var sApplnMode = sApplnURL.indexOf(""OUI"").toString();
		if(sApplnMode == -1)
		{
			TheApplication().SetProfileAttr(""ApplicationMode"",""HI"");
		}
		else
		{
			TheApplication().SetProfileAttr(""ApplicationMode"",""OpenUI"");
		}*/
		TheApplication().SetProfileAttr(""UIBahrainiUpdateNormalUser"",""N"");
		TheApplication().SetProfileAttr(""SmartCardUpdateSuperuser"",""N"");

	
		return (""ContinueOperation"");
}
catch(e)
{
	alert(e);
	return(""CancelOperation""); 
}
finally
{

}

}
function Applet_PreInvokeMethod (name, inputPropSet)
{

try
{
	var sCreditFlag;
	var CPR,Name,Gender,Dob,CardExpiry,FName,LName,MiddleName,Address,Flat,Building,Road,BlockNo,Governorate,Nationality,Occupation,SponsorName,SponsorNo,PassportNo,PassportIssueDate,PassportExpiryDate,LabourForceParticipation,EmployerNumber,EmployerName;
	var sAppMode = TheApplication().GetProfileAttr(""IsOpenUI"");
	if(name == ""STCGetCustomerDetailsSmartCard""  && sAppMode == 0) 
	{
	
				//MANUJ Added to conditionally check for Old/New DLL -- START
				var SId = this.BusComp().GetFieldValue(""Id"");
				var appObjSC = theApplication();
				var InputsSC = appObjSC.NewPropertySet();
				var OutputsSC = appObjSC.NewPropertySet();
				var svcServiceSC = appObjSC.GetService(""Workflow Process Manager"");
				InputsSC.SetProperty(""ProcessName"",""STC SmartCard Old_New DLL Decider"");
				InputsSC.SetProperty(""Object Id"",SId);
				OutputsSC = svcServiceSC.InvokeMethod(""RunProcess"",InputsSC);
				var DLLFlag = OutputsSC.GetProperty(""Value"");
				//MANUJ Added to conditionally check for Old/New DLL -- END
				
				//Profile Section
				theApplication().SetProfileAttr(""UIBahrainiUpdateNormalUser"",""Y"");
				//Profile Section
				
				
		if(DLLFlag == ""Old"")
			{
				var smartcard = new ActiveXObject(""KOBSC.SDK.SmartCardManagerLegacy"");
				//	var smartcard = new ActiveXObject(""BH.CIO.Smartcard.IDCardManager.CardManager"");
				var initiateOld = smartcard.InitateSmartCardManagerLibrary();
				var formatDOB;
				var newformatDOB;
				var newformatExpiry;
				var newformatPassportExpiryDate;//Added for smartcard autopopulate SD
				var newformatPassportIssueDate;//Added for smartcard autopopulate SD
				var CheckExist;
				if(!initiate)
			{
			alert(""Card Initialization failed. Please try again"");
			}
			
			if(initiateOld)
			{
				var samerror = false"";
				var carderror = false"";
				var readOld = smartcard.ReadDataFromCard(samerror, carderror);	
	
		if(readOld)
		{
					CPR = smartcard.DataFromSmartCard.CPR0104_ElementData;
					Name = smartcard.DataFromSmartCard.FullNameEn_ElementData;
					Gender = smartcard.DataFromSmartCard.CPR0117_ElementData;
					Dob = smartcard.DataFromSmartCard.CPR0118_ElementData;
					CardExpiry = smartcard.DataFromSmartCard.CPR0119_ElementData;
					FName = smartcard.DataFromSmartCard.CPR0105_ElementData;
					LName = smartcard.DataFromSmartCard.CPR0110_ElementData;
					MiddleName = smartcard.DataFromSmartCard.CPR0106_ElementData;
					Address = smartcard.DataFromSmartCard.CorrenpondenceAddress_ElementData;
					Flat = smartcard.DataFromSmartCard.CPR0308_ElementData;
					Building = smartcard.DataFromSmartCard.CPR0309_ElementData;
					Road = smartcard.DataFromSmartCard.CPR0312_ElementData;
					BlockNo = smartcard.DataFromSmartCard.CPR0315_ElementData;
					Governorate = smartcard.DataFromSmartCard.CPR0318_ElementData;
					Nationality = smartcard.DataFromSmartCard.GDNPR0103_ElementData;
					Occupation= smartcard.DataFromSmartCard.CPR1203_ElementData;
				//Occupation Missing
					SponsorName= smartcard.DataFromSmartCard.CPR1237_ElementData;//AutoPopulate
					SponsorNo= smartcard.DataFromSmartCard.CPR1236_ElementData;//AutoPopulate
					PassportNo= smartcard.DataFromSmartCard.GDNPR0203_ElementData;//AutoPopulate
					PassportIssueDate= smartcard.DataFromSmartCard.GDNPR0206_ElementData;//AutoPopulate
					PassportExpiryDate= smartcard.DataFromSmartCard.GDNPR0207_ElementData;//AutoPopulate
					LabourForceParticipation= smartcard.DataFromSmartCard.CPR1242_ElementData;//AutoPopulate
				// var CardIssueDate= smartcard.DataFromSmartCard.CPR02B02_ElementData;//AutoPopulate
					EmployerNumber= smartcard.DataFromSmartCard.CPR1205_ElementData;//AutoPopulate
					EmployerName= smartcard.DataFromSmartCard.CPR1206_ElementData;//AutoPopulate		
			}//	if(readOld)
		
			}//	if(initiateOld)
		
	
		}//OLD DLL
		
		if(DLLFlag == ""New"")
		{
			var smartcard = new ActiveXObject(""BH.CIO.Smartcard.IDCardManager.CardManager"");
			var testActivation = smartcard.TestSmartCardComActivation(""TestActivation"");
			var initiate =  smartcard.InitializesSCReaderLibrary();
			var formatDOB;
			var newformatDOB;
			var newformatExpiry;
			var newformatPassportExpiryDate;//Added for smartcard autopopulate SD
			var newformatPassportIssueDate;//Added for smartcard autopopulate SD
			var CheckExist;	
			if(!initiate)
			{
			alert(""Card Initialization falied. Please try again"");
			}
		if(initiate)
			{
				smartcard.EnableSmartcardEvents();
				smartcard.ToIncludeBiometricSupportInfo = true;
				smartcard.ToIncludeDisabilityInfo = true;
				smartcard.ToIncludeEmploymentInfo = true;
				smartcard.ToIncludePassportInfo = true;
				smartcard.ToIncludePersonalInfo = true;
				smartcard.ToIncludePhoto = true;
				smartcard.ToIncludeAddressInfo = true;
				smartcard.ToIncludeSignature = true;
				var read = smartcard.ReadCard();
		if(read)
				{
				//theApplication().SetProfileAttr(""CPRGetDetailsTriggered"",""Y"");
				CPR = smartcard.SmartcardData.IdNumber;
				Name = smartcard.SmartcardData.EnglishFullName;
				Gender = smartcard.SmartcardData.Gender;
				Dob = smartcard.SmartcardData.BirthDate;
				CardExpiry = smartcard.SmartcardData.CardexpiryDate;
				CardCountry = smartcard.SmartcardData.CardCountry;
				Address = smartcard.SmartcardData.AddressEnglish;
				Nationality = smartcard.SmartcardData.NationalityCode;
				Occupation = smartcard.SmartcardData.OccupationEnglish;
				CardIssueDate = smartcard.SmartcardData.CardIssueDate;//Card Issue Date read
                var xmlHierarchy = smartcard.SmartcardData.SeralizeToXMLString();//convert to XML
                xmlHierarchy = xmlHierarchy.toString();//XML to string
                var appObj = theApplication();

				var psInputs = appObj.NewPropertySet();
				var psOutputs = appObj.NewPropertySet();
				var XMLService = appObj.GetService(""STC Get Country"");
				psInputs.SetProperty(""xmlHierarchy"",xmlHierarchy);
				psOutputs = XMLService.InvokeMethod(""GetCardDetails"",psInputs);
				FName = psOutputs.GetProperty(""FirstNameEnglish"");
				LName = psOutputs.GetProperty(""LastNameEnglish"");
				if(LName == '-')
				{
				LName = '';
				}
			
				MiddleName = psOutputs.GetProperty(""MiddleName1English"");
				if(MiddleName == '-')
				{
				MiddleName = '';
				}
				Flat = psOutputs.GetProperty(""FlatNo"");
				Building = psOutputs.GetProperty(""BuildingNo"");
				Road = psOutputs.GetProperty(""RoadNo"");
				BlockNo = psOutputs.GetProperty(""BlockNo"");
				//var Governorate = psOutputs.GetProperty(""GovernorateNameEnglish"");
				//Occupation Missing
				SponsorName= smartcard.SmartcardData.SponserNameEnglish;//AutoPopulate
				SponsorNo= smartcard.SmartcardData.SponserId;//AutoPopulate
				PassportNo= smartcard.SmartcardData.PassportNumber;//AutoPopulate
				PassportIssueDate= smartcard.SmartcardData.PassportIssueDate;//AutoPopulate
				PassportExpiryDate= smartcard.SmartcardData.PassportExpiryDate;//AutoPopulate
				LabourForceParticipation= psOutputs.GetProperty(""LaborForceParticipation"");//LFP need to analyze
				// var CardIssueDate= smartcard.DataFromSmartCard.CPR02B02_ElementData;//AutoPopulate
				EmployerNumber= smartcard.SmartcardData.EmploymentId;//AutoPopulate
				EmployerName= smartcard.SmartcardData.EmploymentNameEnglish;//AutoPopulate
				
			}//if(Read)
				
		   }//if(Initiate)
			
		}//NEW DLL
		//Common Code
		
				var appObj = theApplication();
				var Inputs = appObj.NewPropertySet();
				var Outputs = appObj.NewPropertySet();
				var svcService = appObj.GetService(""STC Get Country"");
				Inputs.SetProperty(""CountryCode"",Nationality);
				Inputs.SetProperty(""CardOccupation"",Occupation);//Auto
				Outputs = svcService.InvokeMethod(""GetCountry"",Inputs);
				var country = Outputs.GetProperty(""Nationality"");
				var SystemOccupation = Outputs.GetProperty(""SystemOccupation"");//Auto
		
				var day = Dob.substring(0,2);
				var Mon = Dob.substring(3,5);
				var Year = Dob.substring(6,10);
				
				var Expday = CardExpiry.substring(0,2);
				var ExpMon = CardExpiry.substring(3,5);
				var ExpYear = CardExpiry.substring(6,10);
				
				var PExpday = PassportExpiryDate.substring(0,2);//Added for smartcard autopopulate SD
				var PExpMon = PassportExpiryDate.substring(3,5);//Added for smartcard autopopulate SD
				var PExpYear = PassportExpiryDate.substring(6,10);//Added for smartcard autopopulate SD
				
				var PIssueday = PassportIssueDate.substring(0,2);//Added for smartcard autopopulate SD
				var PIssueMon = PassportIssueDate.substring(3,5);//Added for smartcard autopopulate SD
				var PIssueYear = PassportIssueDate.substring(6,10);//Added for smartcard autopopulate SD
							
				formatDOB = day+""/""+Mon+""/""+Year;
				newformatDOB = Mon+""/""+day+""/""+Year;
				newformatExpiry = ExpMon+""/""+Expday+""/""+ExpYear;
				newformatPassportExpiryDate = PExpMon+""/""+PExpday+""/""+PExpYear;//Added for smartcard autopopulate SD
				newformatPassportIssueDate = PIssueMon+""/""+PIssueday+""/""+PIssueYear;//Added for smartcard autopopulate SD
						with(this.BusComp())
				{	
					
						/*ActivateField(""STC Existing Cust Flag"");
						CheckExist = GetFieldValue(""STC Existing Cust Flag"");
						if(CheckExist == ""Y""){
						SetFieldValue(""STC GCC Country Code"",""BH"");
						}*/
						SetFieldValue(""STC New Customer Type"", ""Individual"");	
						SetFieldValue(""STC New First Name"", FName);
						SetFieldValue(""STC New Last Name"", LName);
						SetFieldValue(""STC New Father Name"", MiddleName);
						SetFieldValue(""STC ID Number"", CPR);
						SetFieldValue(""STC New Gender"", Gender);
						SetFieldValue(""STC Date Of Birth"", newformatDOB);	
//						SetFieldValue(""STC ID Type"", ""Bahraini ID"");
						SetFieldValue(""STC ID New Exipry Date"", newformatExpiry);
						SetFieldValue(""STC New Address Apartment Number"", Flat);
						SetFieldValue(""STC New Address Strret Address"", Building);
						SetFieldValue(""STC New Address Road No"", Road);
						SetFieldValue(""STC New Address Strret Address 2"", BlockNo);
     					SetFieldValue(""STC New Address Type"", ""Billing"");
						SetFieldValue(""STC New Address State"", Governorate);
						SetFieldValue(""STC New Nationality"", country);
						SetFieldValue(""STC Occupation"",SystemOccupation);//Autopopulate
						SetFieldValue(""APN OrderItemId"",Occupation);//Autopopulate
						SetFieldValue(""STC Update Sponsor Name"",SponsorName);//AutoPopulate
						SetFieldValue(""STC Update Sponsor Number"",SponsorNo);//AutoPopulate
						SetFieldValue(""STC Update Passport Number"",PassportNo);//AutoPopulate
					    SetFieldValue(""STC Update Passport Issue Date"",newformatPassportIssueDate);//AutoPopulate Changed as part of Autopopulate SD
						SetFieldValue(""STC Update Passport Expiry Date"",newformatPassportExpiryDate);//AutoPopulate Changed as part of Autopopulate SD	
						SetFieldValue(""STC Update LFP"",LabourForceParticipation);//AutoPopulate
					//	SetFieldValue(""STC Update Card Issue Date"",CardIssueDate);//AutoPopulate Not Captured
						SetFieldValue(""STC Update Employer Number"",EmployerNumber);//AutoPopulate
						SetFieldValue(""STC Update Employer Name"",EmployerName);//AutoPopulate
						SetFieldValue(""Description"",""SmartCardDataUpdate"");//AutoPopulate
						WriteRecord();
						InvokeMethod(""RefreshBusComp"");
					    InvokeMethod(""RefreshRecord"");
				
				}//with(this.BusComp())
						return(""CancelOperation""); 
		//Common Code
		}
		
		if (name == ""Submit_SmartCard""){
				//MANUJ Added to conditionally check for IDMismatch -- START
				var SId1 = this.BusComp().GetFieldValue(""Id"");
				var sNewPassportNo = this.BusComp().GetFieldValue(""STC Update Passport Number"");//Passport No
				var sID = this.BusComp().GetFieldValue(""STC ID Number"");//Bahraini ID
				var appObjSC = theApplication();
				var InputsSC = appObjSC.NewPropertySet();
				var OutputsSC = appObjSC.NewPropertySet();
				var svcServiceSC = appObjSC.GetService(""STC Check Smart Card ID Mismatch"");
				InputsSC.SetProperty(""SRId"",SId1);
				InputsSC.SetProperty(""sID"",sID);
				InputsSC.SetProperty(""sNewPassportNo"",sNewPassportNo);
				OutputsSC = svcServiceSC.InvokeMethod(""FindMismatch"",InputsSC);
				var sMismatch = OutputsSC.GetProperty(""sMismatch"");
				//MANUJ Added to conditionally check for IDMismatch -- END
		
	if(sMismatch == ""N"")
	{
	sCreditFlag = confirm(""Please note that if you have left any field blank then system will update/ overwrite the same in records. Please make sure that required data is correctly entered. Press 'Ok' to continue or press 'Cancel'."");
	}
	if(sMismatch == ""Y"")
	{
	sCreditFlag = confirm(""Please note that the ID on the Smartcard and on CRM are different. Press 'OK' to continue with updating the ID or press 'Cancel'."");
	}
	if(sCreditFlag == false)
    return (""CancelOperation"");
    else
    return (""ContinueOperation"");

		

		}
	else
	
	return (""ContinueOperation"");
	}
	catch(e)
	{
		alert(e);
		return(""CancelOperation""); 
	}
}
function Applet_Load ()
{
try
{
	/*	var sApplnURL = document.location.toString();
		var sApplnMode = sApplnURL.indexOf(""OUI"").toString();
		if(sApplnMode == -1)
		{
			TheApplication().SetProfileAttr(""ApplicationMode"",""HI"");
		}
		else
		{
			TheApplication().SetProfileAttr(""ApplicationMode"",""OpenUI"");
		}*/
		TheApplication().SetProfileAttr(""UIBahrainiUpdateNormalUser"",""N"");
		//theApplication().SetProfileAttr(""CPRGetDetailsTriggered"",""N"");
		return (""ContinueOperation"");
}
catch(e)
{
	alert(e);
	return(""CancelOperation""); 
}
finally
{

}

}
function Applet_PreInvokeMethod (name, inputPropSet)
{

try
{
	var sCreditFlag;
	var CPR,Name,Gender,Dob,CardExpiry,FName,LName,MiddleName,Address,Flat,Building,Road,BlockNo,Governorate,Nationality,Occupation,SponsorName,SponsorNo,PassportNo,PassportIssueDate,PassportExpiryDate,LabourForceParticipation,EmployerNumber,EmployerName;
	var sAppMode = TheApplication().GetProfileAttr(""IsOpenUI"");
	if(name == ""STCGetCustomerDetailsSmartCard"" && sAppMode == 0) 
	{
	
				//MANUJ Added to conditionally check for Old/New DLL -- START
				var SId = this.BusComp().GetFieldValue(""Id"");
				var appObjSC = theApplication();
				var InputsSC = appObjSC.NewPropertySet();
				var OutputsSC = appObjSC.NewPropertySet();
				var svcServiceSC = appObjSC.GetService(""Workflow Process Manager"");
				InputsSC.SetProperty(""ProcessName"",""STC SmartCard Old_New DLL Decider"");
				InputsSC.SetProperty(""Object Id"",SId);
				OutputsSC = svcServiceSC.InvokeMethod(""RunProcess"",InputsSC);
				var DLLFlag = OutputsSC.GetProperty(""Value"");
				//MANUJ Added to conditionally check for Old/New DLL -- END
				
				//Profile Section
				theApplication().SetProfileAttr(""UIBahrainiUpdateNormalUser"",""Y"");
				//Profile Section
				
				
		if(DLLFlag == ""Old"")
			{
				var smartcard = new ActiveXObject(""KOBSC.SDK.SmartCardManagerLegacy"");
				//	var smartcard = new ActiveXObject(""BH.CIO.Smartcard.IDCardManager.CardManager"");
				var initiateOld = smartcard.InitateSmartCardManagerLibrary();
				var formatDOB;
				var newformatDOB;
				var newformatExpiry;
				var newformatPassportExpiryDate;//Added for smartcard autopopulate SD
				var newformatPassportIssueDate;//Added for smartcard autopopulate SD
				var CheckExist;
				if(!initiate)
			{
			alert(""Card Initialization failed. Please try again"");
			}
			
			if(initiateOld)
			{
				var samerror = false"";
				var carderror = false"";
				var readOld = smartcard.ReadDataFromCard(samerror, carderror);	
	
		if(readOld)
		{
					CPR = smartcard.DataFromSmartCard.CPR0104_ElementData;
					Name = smartcard.DataFromSmartCard.FullNameEn_ElementData;
					Gender = smartcard.DataFromSmartCard.CPR0117_ElementData;
					Dob = smartcard.DataFromSmartCard.CPR0118_ElementData;
					CardExpiry = smartcard.DataFromSmartCard.CPR0119_ElementData;
					FName = smartcard.DataFromSmartCard.CPR0105_ElementData;
					LName = smartcard.DataFromSmartCard.CPR0110_ElementData;
					MiddleName = smartcard.DataFromSmartCard.CPR0106_ElementData;
					Address = smartcard.DataFromSmartCard.CorrenpondenceAddress_ElementData;
					Flat = smartcard.DataFromSmartCard.CPR0308_ElementData;
					Building = smartcard.DataFromSmartCard.CPR0309_ElementData;
					Road = smartcard.DataFromSmartCard.CPR0312_ElementData;
					BlockNo = smartcard.DataFromSmartCard.CPR0315_ElementData;
					Governorate = smartcard.DataFromSmartCard.CPR0318_ElementData;
					Nationality = smartcard.DataFromSmartCard.GDNPR0103_ElementData;
					Occupation= smartcard.DataFromSmartCard.CPR1203_ElementData;
				//Occupation Missing
					SponsorName= smartcard.DataFromSmartCard.CPR1237_ElementData;//AutoPopulate
					SponsorNo= smartcard.DataFromSmartCard.CPR1236_ElementData;//AutoPopulate
					PassportNo= smartcard.DataFromSmartCard.GDNPR0203_ElementData;//AutoPopulate
					PassportIssueDate= smartcard.DataFromSmartCard.GDNPR0206_ElementData;//AutoPopulate
					PassportExpiryDate= smartcard.DataFromSmartCard.GDNPR0207_ElementData;//AutoPopulate
					LabourForceParticipation= smartcard.DataFromSmartCard.CPR1242_ElementData;//AutoPopulate
				// var CardIssueDate= smartcard.DataFromSmartCard.CPR02B02_ElementData;//AutoPopulate
					EmployerNumber= smartcard.DataFromSmartCard.CPR1205_ElementData;//AutoPopulate
					EmployerName= smartcard.DataFromSmartCard.CPR1206_ElementData;//AutoPopulate		
			}//	if(readOld)
		
			}//	if(initiateOld)
		
	
		}//OLD DLL
		
		if(DLLFlag == ""New"")
		{
			var smartcard = new ActiveXObject(""BH.CIO.Smartcard.IDCardManager.CardManager"");
			var testActivation = smartcard.TestSmartCardComActivation(""TestActivation"");
			var initiate =  smartcard.InitializesSCReaderLibrary();
			var formatDOB;
			var newformatDOB;
			var newformatExpiry;
			var newformatPassportExpiryDate;//Added for smartcard autopopulate SD
			var newformatPassportIssueDate;//Added for smartcard autopopulate SD
			var CheckExist;	
			if(!initiate)
			{
			alert(""Card Initialization falied. Please try again"");
			}
		if(initiate)
			{
				smartcard.EnableSmartcardEvents();
				smartcard.ToIncludeBiometricSupportInfo = true;
				smartcard.ToIncludeDisabilityInfo = true;
				smartcard.ToIncludeEmploymentInfo = true;
				smartcard.ToIncludePassportInfo = true;
				smartcard.ToIncludePersonalInfo = true;
				smartcard.ToIncludePhoto = true;
				smartcard.ToIncludeAddressInfo = true;
				smartcard.ToIncludeSignature = true;
				var read = smartcard.ReadCard();
		if(read)
				{
				//theApplication().SetProfileAttr(""CPRGetDetailsTriggered"",""Y"");
				CPR = smartcard.SmartcardData.IdNumber;
				Name = smartcard.SmartcardData.EnglishFullName;
				Gender = smartcard.SmartcardData.Gender;
				Dob = smartcard.SmartcardData.BirthDate;
				CardExpiry = smartcard.SmartcardData.CardexpiryDate;
				CardCountry = smartcard.SmartcardData.CardCountry;
				Address = smartcard.SmartcardData.AddressEnglish;
				Nationality = smartcard.SmartcardData.NationalityCode;
				Occupation = smartcard.SmartcardData.OccupationEnglish;
				CardIssueDate = smartcard.SmartcardData.CardIssueDate;//Card Issue Date read
                var xmlHierarchy = smartcard.SmartcardData.SeralizeToXMLString();//convert to XML
                xmlHierarchy = xmlHierarchy.toString();//XML to string
                var appObj = theApplication();

				var psInputs = appObj.NewPropertySet();
				var psOutputs = appObj.NewPropertySet();
				var XMLService = appObj.GetService(""STC Get Country"");
				psInputs.SetProperty(""xmlHierarchy"",xmlHierarchy);
				psOutputs = XMLService.InvokeMethod(""GetCardDetails"",psInputs);
				FName = psOutputs.GetProperty(""FirstNameEnglish"");
				LName = psOutputs.GetProperty(""LastNameEnglish"");
				if(LName == '-')
				{
				LName = '';
				}
			
				MiddleName = psOutputs.GetProperty(""MiddleName1English"");
				if(MiddleName == '-')
				{
				MiddleName = '';
				}
				Flat = psOutputs.GetProperty(""FlatNo"");
				Building = psOutputs.GetProperty(""BuildingNo"");
				Road = psOutputs.GetProperty(""RoadNo"");
				BlockNo = psOutputs.GetProperty(""BlockNo"");
				//var Governorate = psOutputs.GetProperty(""GovernorateNameEnglish"");
				//Occupation Missing
				SponsorName= smartcard.SmartcardData.SponserNameEnglish;//AutoPopulate
				SponsorNo= smartcard.SmartcardData.SponserId;//AutoPopulate
				PassportNo= smartcard.SmartcardData.PassportNumber;//AutoPopulate
				PassportIssueDate= smartcard.SmartcardData.PassportIssueDate;//AutoPopulate
				PassportExpiryDate= smartcard.SmartcardData.PassportExpiryDate;//AutoPopulate
				LabourForceParticipation= psOutputs.GetProperty(""LaborForceParticipation"");//LFP need to analyze
				// var CardIssueDate= smartcard.DataFromSmartCard.CPR02B02_ElementData;//AutoPopulate
				EmployerNumber= smartcard.SmartcardData.EmploymentId;//AutoPopulate
				EmployerName= smartcard.SmartcardData.EmploymentNameEnglish;//AutoPopulate
				
			}//if(Read)
				
		   }//if(Initiate)
			
		}//NEW DLL
		//Common Code
		
				var appObj = theApplication();
				var Inputs = appObj.NewPropertySet();
				var Outputs = appObj.NewPropertySet();
				var svcService = appObj.GetService(""STC Get Country"");
				Inputs.SetProperty(""CountryCode"",Nationality);
				Inputs.SetProperty(""CardOccupation"",Occupation);//Auto
				Outputs = svcService.InvokeMethod(""GetCountry"",Inputs);
				var country = Outputs.GetProperty(""Nationality"");
				var SystemOccupation = Outputs.GetProperty(""SystemOccupation"");//Auto
		
				var day = Dob.substring(0,2);
				var Mon = Dob.substring(3,5);
				var Year = Dob.substring(6,10);
				
				var Expday = CardExpiry.substring(0,2);
				var ExpMon = CardExpiry.substring(3,5);
				var ExpYear = CardExpiry.substring(6,10);
				
				var PExpday = PassportExpiryDate.substring(0,2);//Added for smartcard autopopulate SD
				var PExpMon = PassportExpiryDate.substring(3,5);//Added for smartcard autopopulate SD
				var PExpYear = PassportExpiryDate.substring(6,10);//Added for smartcard autopopulate SD
				
				var PIssueday = PassportIssueDate.substring(0,2);//Added for smartcard autopopulate SD
				var PIssueMon = PassportIssueDate.substring(3,5);//Added for smartcard autopopulate SD
				var PIssueYear = PassportIssueDate.substring(6,10);//Added for smartcard autopopulate SD
							
				formatDOB = day+""/""+Mon+""/""+Year;
				newformatDOB = Mon+""/""+day+""/""+Year;
				newformatExpiry = ExpMon+""/""+Expday+""/""+ExpYear;
				newformatPassportExpiryDate = PExpMon+""/""+PExpday+""/""+PExpYear;//Added for smartcard autopopulate SD
				newformatPassportIssueDate = PIssueMon+""/""+PIssueday+""/""+PIssueYear;//Added for smartcard autopopulate SD
						with(this.BusComp())
				{	
					
						/*ActivateField(""STC Existing Cust Flag"");
						CheckExist = GetFieldValue(""STC Existing Cust Flag"");
						if(CheckExist == ""Y""){
						SetFieldValue(""STC GCC Country Code"",""BH"");
						}*/
						SetFieldValue(""STC New Customer Type"", ""Individual"");	
						SetFieldValue(""STC New First Name"", FName);
						SetFieldValue(""STC New Last Name"", LName);
						SetFieldValue(""STC New Father Name"", MiddleName);
						SetFieldValue(""STC ID Number"", CPR);
						SetFieldValue(""STC New Gender"", Gender);
						SetFieldValue(""STC Date Of Birth"", newformatDOB);	
//						SetFieldValue(""STC ID Type"", ""Bahraini ID"");
						SetFieldValue(""STC ID New Exipry Date"", newformatExpiry);
						SetFieldValue(""STC New Address Apartment Number"", Flat);
						SetFieldValue(""STC New Address Strret Address"", Building);
						SetFieldValue(""STC New Address Road No"", Road);
						SetFieldValue(""STC New Address Strret Address 2"", BlockNo);
     					SetFieldValue(""STC New Address Type"", ""Billing"");
						SetFieldValue(""STC New Address State"", Governorate);
						SetFieldValue(""STC New Nationality"", country);
						SetFieldValue(""STC Occupation"",SystemOccupation);//Autopopulate
						SetFieldValue(""APN OrderItemId"",Occupation);//Autopopulate
						SetFieldValue(""STC Update Sponsor Name"",SponsorName);//AutoPopulate
						SetFieldValue(""STC Update Sponsor Number"",SponsorNo);//AutoPopulate
						SetFieldValue(""STC Update Passport Number"",PassportNo);//AutoPopulate
					    SetFieldValue(""STC Update Passport Issue Date"",newformatPassportIssueDate);//AutoPopulate Changed as part of Autopopulate SD
						SetFieldValue(""STC Update Passport Expiry Date"",newformatPassportExpiryDate);//AutoPopulate Changed as part of Autopopulate SD	
						SetFieldValue(""STC Update LFP"",LabourForceParticipation);//AutoPopulate
					//	SetFieldValue(""STC Update Card Issue Date"",CardIssueDate);//AutoPopulate Not Captured
						SetFieldValue(""STC Update Employer Number"",EmployerNumber);//AutoPopulate
						SetFieldValue(""STC Update Employer Name"",EmployerName);//AutoPopulate
						SetFieldValue(""Description"",""SmartCardDataUpdate"");//AutoPopulate
						WriteRecord();
						InvokeMethod(""RefreshBusComp"");
					    InvokeMethod(""RefreshRecord"");
				
				}//with(this.BusComp())
						return(""CancelOperation""); 
		//Common Code
		}
		
		if (name == ""Submit_SmartCard""){
				//MANUJ Added to conditionally check for IDMismatch -- START
				var SId1 = this.BusComp().GetFieldValue(""Id"");
				var sNewPassportNo = this.BusComp().GetFieldValue(""STC Update Passport Number"");//Passport No
				var sID = this.BusComp().GetFieldValue(""STC ID Number"");//Bahraini ID
				var appObjSC = theApplication();
				var InputsSC = appObjSC.NewPropertySet();
				var OutputsSC = appObjSC.NewPropertySet();
				var svcServiceSC = appObjSC.GetService(""STC Check Smart Card ID Mismatch"");
				InputsSC.SetProperty(""SRId"",SId1);
				InputsSC.SetProperty(""sID"",sID);
				InputsSC.SetProperty(""sNewPassportNo"",sNewPassportNo);
				OutputsSC = svcServiceSC.InvokeMethod(""FindMismatch"",InputsSC);
				var sMismatch = OutputsSC.GetProperty(""sMismatch"");
				//MANUJ Added to conditionally check for IDMismatch -- END
		
	if(sMismatch == ""N"")
	{
	sCreditFlag = confirm(""Please note that if you have left any field blank then system will update/ overwrite the same in records. Please make sure that required data is correctly entered. Press 'Ok' to continue or press 'Cancel'."");
	}
	if(sMismatch == ""Y"")
	{
	sCreditFlag = confirm(""Please note that the ID on the Smartcard and on CRM are different. Press 'OK' to continue with updating the ID or press 'Cancel'."");
	}
	if(sCreditFlag == false)
    return (""CancelOperation"");
    else
    return (""ContinueOperation"");

		

		}
	else
	
	return (""ContinueOperation"");
	}
	catch(e)
	{
		alert(e);
		return(""CancelOperation""); 
	}
}
function Applet_Load ()
{
theApplication().SetProfileAttr(""UIBahrainiUpdateNormalUser"",""N"");
//theApplication().SetProfileAttr(""CPRGetDetailsTriggered"",""N"");
}
function Applet_PreInvokeMethod (name, inputPropSet)
{

try
{
	var sCreditFlag;
	var CPR,Name,Gender,Dob,CardExpiry,FName,LName,MiddleName,Address,Flat,Building,Road,BlockNo,Governorate,Nationality,Occupation,SponsorName,SponsorNo,PassportNo,PassportIssueDate,PassportExpiryDate,LabourForceParticipation,EmployerNumber,EmployerName;
	var sAppMode = TheApplication().GetProfileAttr(""IsOpenUI"");//Mayank: Added for Gaurdian Open UI
	//if(name == ""STCGetCustomerDetailsSmartCard"") //Mayank: Added for Gaurdian Open UI
	if(name == ""STCGetCustomerDetailsSmartCard"" && sAppMode == 0) //Mayank: Added for Gaurdian Open UI 
	{
	
				//MANUJ Added to conditionally check for Old/New DLL -- START
				var SId = this.BusComp().GetFieldValue(""Id"");
				var appObjSC = theApplication();
				var InputsSC = appObjSC.NewPropertySet();
				var OutputsSC = appObjSC.NewPropertySet();
				var svcServiceSC = appObjSC.GetService(""Workflow Process Manager"");
				InputsSC.SetProperty(""ProcessName"",""STC SmartCard Old_New DLL Decider"");
				InputsSC.SetProperty(""Object Id"",SId);
				OutputsSC = svcServiceSC.InvokeMethod(""RunProcess"",InputsSC);
				var DLLFlag = OutputsSC.GetProperty(""Value"");
				//MANUJ Added to conditionally check for Old/New DLL -- END
				
				//Profile Section
				theApplication().SetProfileAttr(""UIBahrainiUpdateNormalUser"",""Y"");
				//Profile Section
				
				
		if(DLLFlag == ""Old"")
			{
				var smartcard = new ActiveXObject(""KOBSC.SDK.SmartCardManagerLegacy"");
				//	var smartcard = new ActiveXObject(""BH.CIO.Smartcard.IDCardManager.CardManager"");
				var initiateOld = smartcard.InitateSmartCardManagerLibrary();
				var formatDOB;
				var newformatDOB;
				var newformatExpiry;
				var newformatPassportExpiryDate;//Added for smartcard autopopulate SD
				var newformatPassportIssueDate;//Added for smartcard autopopulate SD
				var CheckExist;
				if(!initiate)
			{
			alert(""Card Initialization failed. Please try again"");
			}
			
			if(initiateOld)
			{
				var samerror = false"";
				var carderror = false"";
				var readOld = smartcard.ReadDataFromCard(samerror, carderror);	
	
		if(readOld)
		{
					CPR = smartcard.DataFromSmartCard.CPR0104_ElementData;
					Name = smartcard.DataFromSmartCard.FullNameEn_ElementData;
					Gender = smartcard.DataFromSmartCard.CPR0117_ElementData;
					Dob = smartcard.DataFromSmartCard.CPR0118_ElementData;
					CardExpiry = smartcard.DataFromSmartCard.CPR0119_ElementData;
					FName = smartcard.DataFromSmartCard.CPR0105_ElementData;
					LName = smartcard.DataFromSmartCard.CPR0110_ElementData;
					MiddleName = smartcard.DataFromSmartCard.CPR0106_ElementData;
					Address = smartcard.DataFromSmartCard.CorrenpondenceAddress_ElementData;
					Flat = smartcard.DataFromSmartCard.CPR0308_ElementData;
					Building = smartcard.DataFromSmartCard.CPR0309_ElementData;
					Road = smartcard.DataFromSmartCard.CPR0312_ElementData;
					BlockNo = smartcard.DataFromSmartCard.CPR0315_ElementData;
					Governorate = smartcard.DataFromSmartCard.CPR0318_ElementData;
					Nationality = smartcard.DataFromSmartCard.GDNPR0103_ElementData;
					Occupation= smartcard.DataFromSmartCard.CPR1203_ElementData;
				//Occupation Missing
					SponsorName= smartcard.DataFromSmartCard.CPR1237_ElementData;//AutoPopulate
					SponsorNo= smartcard.DataFromSmartCard.CPR1236_ElementData;//AutoPopulate
					PassportNo= smartcard.DataFromSmartCard.GDNPR0203_ElementData;//AutoPopulate
					PassportIssueDate= smartcard.DataFromSmartCard.GDNPR0206_ElementData;//AutoPopulate
					PassportExpiryDate= smartcard.DataFromSmartCard.GDNPR0207_ElementData;//AutoPopulate
					LabourForceParticipation= smartcard.DataFromSmartCard.CPR1242_ElementData;//AutoPopulate
				// var CardIssueDate= smartcard.DataFromSmartCard.CPR02B02_ElementData;//AutoPopulate
					EmployerNumber= smartcard.DataFromSmartCard.CPR1205_ElementData;//AutoPopulate
					EmployerName= smartcard.DataFromSmartCard.CPR1206_ElementData;//AutoPopulate		
			}//	if(readOld)
		
			}//	if(initiateOld)
		
	
		}//OLD DLL
		
		if(DLLFlag == ""New"")
		{
			var smartcard = new ActiveXObject(""BH.CIO.Smartcard.IDCardManager.CardManager"");
			var testActivation = smartcard.TestSmartCardComActivation(""TestActivation"");
			var initiate =  smartcard.InitializesSCReaderLibrary();
			var formatDOB;
			var newformatDOB;
			var newformatExpiry;
			var newformatPassportExpiryDate;//Added for smartcard autopopulate SD
			var newformatPassportIssueDate;//Added for smartcard autopopulate SD
			var CheckExist;	
			if(!initiate)
			{
			alert(""Card Initialization falied. Please try again"");
			}
		if(initiate)
			{
				smartcard.EnableSmartcardEvents();
				smartcard.ToIncludeBiometricSupportInfo = true;
				smartcard.ToIncludeDisabilityInfo = true;
				smartcard.ToIncludeEmploymentInfo = true;
				smartcard.ToIncludePassportInfo = true;
				smartcard.ToIncludePersonalInfo = true;
				smartcard.ToIncludePhoto = true;
				smartcard.ToIncludeAddressInfo = true;
				smartcard.ToIncludeSignature = true;
				var read = smartcard.ReadCard();
		if(read)
				{
				//theApplication().SetProfileAttr(""CPRGetDetailsTriggered"",""Y"");
				CPR = smartcard.SmartcardData.IdNumber;
				Name = smartcard.SmartcardData.EnglishFullName;
				Gender = smartcard.SmartcardData.Gender;
				Dob = smartcard.SmartcardData.BirthDate;
				CardExpiry = smartcard.SmartcardData.CardexpiryDate;
				CardCountry = smartcard.SmartcardData.CardCountry;
				Address = smartcard.SmartcardData.AddressEnglish;
				Nationality = smartcard.SmartcardData.NationalityCode;
				Occupation = smartcard.SmartcardData.OccupationEnglish;
				CardIssueDate = smartcard.SmartcardData.CardIssueDate;//Card Issue Date read
                var xmlHierarchy = smartcard.SmartcardData.SeralizeToXMLString();//convert to XML
                xmlHierarchy = xmlHierarchy.toString();//XML to string
                var appObj = theApplication();

				var psInputs = appObj.NewPropertySet();
				var psOutputs = appObj.NewPropertySet();
				var XMLService = appObj.GetService(""STC Get Country"");
				psInputs.SetProperty(""xmlHierarchy"",xmlHierarchy);
				psOutputs = XMLService.InvokeMethod(""GetCardDetails"",psInputs);
				FName = psOutputs.GetProperty(""FirstNameEnglish"");
				LName = psOutputs.GetProperty(""LastNameEnglish"");
				if(LName == '-')
				{
				LName = '';
				}
			
				MiddleName = psOutputs.GetProperty(""MiddleName1English"");
				if(MiddleName == '-')
				{
				MiddleName = '';
				}
				Flat = psOutputs.GetProperty(""FlatNo"");
				Building = psOutputs.GetProperty(""BuildingNo"");
				Road = psOutputs.GetProperty(""RoadNo"");
				BlockNo = psOutputs.GetProperty(""BlockNo"");
				//var Governorate = psOutputs.GetProperty(""GovernorateNameEnglish"");
				//Occupation Missing
				SponsorName= smartcard.SmartcardData.SponserNameEnglish;//AutoPopulate
				SponsorNo= smartcard.SmartcardData.SponserId;//AutoPopulate
				PassportNo= smartcard.SmartcardData.PassportNumber;//AutoPopulate
				PassportIssueDate= smartcard.SmartcardData.PassportIssueDate;//AutoPopulate
				PassportExpiryDate= smartcard.SmartcardData.PassportExpiryDate;//AutoPopulate
				LabourForceParticipation= psOutputs.GetProperty(""LaborForceParticipation"");//LFP need to analyze
				// var CardIssueDate= smartcard.DataFromSmartCard.CPR02B02_ElementData;//AutoPopulate
				EmployerNumber= smartcard.SmartcardData.EmploymentId;//AutoPopulate
				EmployerName= smartcard.SmartcardData.EmploymentNameEnglish;//AutoPopulate
				
			}//if(Read)
				
		   }//if(Initiate)
			
		}//NEW DLL
		//Common Code
		
				var appObj = theApplication();
				var Inputs = appObj.NewPropertySet();
				var Outputs = appObj.NewPropertySet();
				var svcService = appObj.GetService(""STC Get Country"");
				Inputs.SetProperty(""CountryCode"",Nationality);
				Inputs.SetProperty(""CardOccupation"",Occupation);//Auto
				Outputs = svcService.InvokeMethod(""GetCountry"",Inputs);
				var country = Outputs.GetProperty(""Nationality"");
				var SystemOccupation = Outputs.GetProperty(""SystemOccupation"");//Auto
		
				var day = Dob.substring(0,2);
				var Mon = Dob.substring(3,5);
				var Year = Dob.substring(6,10);
				
				var Expday = CardExpiry.substring(0,2);
				var ExpMon = CardExpiry.substring(3,5);
				var ExpYear = CardExpiry.substring(6,10);
				
				var PExpday = PassportExpiryDate.substring(0,2);//Added for smartcard autopopulate SD
				var PExpMon = PassportExpiryDate.substring(3,5);//Added for smartcard autopopulate SD
				var PExpYear = PassportExpiryDate.substring(6,10);//Added for smartcard autopopulate SD
				
				var PIssueday = PassportIssueDate.substring(0,2);//Added for smartcard autopopulate SD
				var PIssueMon = PassportIssueDate.substring(3,5);//Added for smartcard autopopulate SD
				var PIssueYear = PassportIssueDate.substring(6,10);//Added for smartcard autopopulate SD
							
				formatDOB = day+""/""+Mon+""/""+Year;
				newformatDOB = Mon+""/""+day+""/""+Year;
				newformatExpiry = ExpMon+""/""+Expday+""/""+ExpYear;
				newformatPassportExpiryDate = PExpMon+""/""+PExpday+""/""+PExpYear;//Added for smartcard autopopulate SD
				newformatPassportIssueDate = PIssueMon+""/""+PIssueday+""/""+PIssueYear;//Added for smartcard autopopulate SD
						with(this.BusComp())
				{	
					
						/*ActivateField(""STC Existing Cust Flag"");
						CheckExist = GetFieldValue(""STC Existing Cust Flag"");
						if(CheckExist == ""Y""){
						SetFieldValue(""STC GCC Country Code"",""BH"");
						}*/
						SetFieldValue(""STC New Customer Type"", ""Individual"");	
						SetFieldValue(""STC New First Name"", FName);
						SetFieldValue(""STC New Last Name"", LName);
						SetFieldValue(""STC New Father Name"", MiddleName);
						SetFieldValue(""STC ID Number"", CPR);
						SetFieldValue(""STC New Gender"", Gender);
						SetFieldValue(""STC Date Of Birth Guardian"", newformatDOB);	
//						SetFieldValue(""STC ID Type"", ""Bahraini ID"");
						SetFieldValue(""STC ID New Exipry Date"", newformatExpiry);
						SetFieldValue(""STC New Address Apartment Number"", Flat);
						SetFieldValue(""STC New Address Strret Address"", Building);
						SetFieldValue(""STC New Address Road No"", Road);
						SetFieldValue(""STC New Address Strret Address 2"", BlockNo);
     					SetFieldValue(""STC New Address Type"", ""Billing"");
						SetFieldValue(""STC New Address State"", Governorate);
						SetFieldValue(""STC New Nationality"", country);
						SetFieldValue(""STC Occupation"",SystemOccupation);//Autopopulate
						SetFieldValue(""APN OrderItemId"",Occupation);//Autopopulate
						SetFieldValue(""STC Update Sponsor Name"",SponsorName);//AutoPopulate
						SetFieldValue(""STC Update Sponsor Number"",SponsorNo);//AutoPopulate
						SetFieldValue(""STC Update Passport Number"",PassportNo);//AutoPopulate
					    SetFieldValue(""STC Update Passport Issue Date"",newformatPassportIssueDate);//AutoPopulate Changed as part of Autopopulate SD
						SetFieldValue(""STC Update Passport Expiry Date"",newformatPassportExpiryDate);//AutoPopulate Changed as part of Autopopulate SD	
						SetFieldValue(""STC Update LFP"",LabourForceParticipation);//AutoPopulate
					//	SetFieldValue(""STC Update Card Issue Date"",CardIssueDate);//AutoPopulate Not Captured
						SetFieldValue(""STC Update Employer Number"",EmployerNumber);//AutoPopulate
						SetFieldValue(""STC Update Employer Name"",EmployerName);//AutoPopulate
						SetFieldValue(""Description"",""Guardian Change"");//AutoPopulate
						WriteRecord();
						InvokeMethod(""RefreshBusComp"");
					    InvokeMethod(""RefreshRecord"");
				
				}//with(this.BusComp())
						return(""CancelOperation""); 
		//Common Code
		}
		
/*		if (name == ""Submit_SmartCard""){
				//MANUJ Added to conditionally check for IDMismatch -- START
				var SId1 = this.BusComp().GetFieldValue(""Id"");
				var sNewPassportNo = this.BusComp().GetFieldValue(""STC Update Passport Number"");//Passport No
				var sID = this.BusComp().GetFieldValue(""STC ID Number"");//Bahraini ID
				var appObjSC = theApplication();
				var InputsSC = appObjSC.NewPropertySet();
				var OutputsSC = appObjSC.NewPropertySet();
				var svcServiceSC = appObjSC.GetService(""STC Check Smart Card ID Mismatch"");
				InputsSC.SetProperty(""SRId"",SId1);
				InputsSC.SetProperty(""sID"",sID);
				InputsSC.SetProperty(""sNewPassportNo"",sNewPassportNo);
				OutputsSC = svcServiceSC.InvokeMethod(""FindMismatch"",InputsSC);
				var sMismatch = OutputsSC.GetProperty(""sMismatch"");
				//MANUJ Added to conditionally check for IDMismatch -- END
		
	if(sMismatch == ""N"")
	{
	sCreditFlag = confirm(""Please note that if you have left any field blank then system will update/ overwrite the same in records. Please make sure that required data is correctly entered. Press 'Ok' to continue or press 'Cancel'."");
	}
	if(sMismatch == ""Y"")
	{
	sCreditFlag = confirm(""Please note that the ID on the Smartcard and on CRM are different. Press 'OK' to continue with updating the ID or press 'Cancel'."");
	}
	if(sCreditFlag == false)
    return (""CancelOperation"");
    else
    return (""ContinueOperation"");

		

		}*/
	//else
	
	return (""ContinueOperation"");
	}
	catch(e)
	{
		alert(e);
		return(""CancelOperation""); 
	}
}
function Applet_PreInvokeMethod (name, inputPropSet)
{

//MANUJ Added for TT Attachment Functionality
if (name == ""Assign"")

	{
	appObj = theApplication();
	var vSRId= this.BusComp().GetFieldValue(""Id"");//SRId
	var CallTier3= this.BusComp().GetFieldValue(""INS Sub-Area"");//Call Tier3
	var CallTier2= this.BusComp().GetFieldValue(""INS Area"");//Call Tier2
	var CallTier1= this.BusComp().GetFieldValue(""INS Product"");//Call Tier1
	var sActiveViewName = appObj.ActiveViewName();
	var svcbsServiceOSTerm = appObj.GetService(""Workflow Process Manager"");
	var psiPSOS = appObj.NewPropertySet();
	var psoPSOS = appObj.NewPropertySet();
	psiPSOS.SetProperty(""ProcessName"", ""STC TT Assign Attachment Check"");
	psiPSOS.SetProperty(""Object Id"",vSRId);
	psiPSOS.SetProperty(""CallTier"",CallTier3);
    psoPSOS = svcbsServiceOSTerm.InvokeMethod(""RunProcess"", psiPSOS);
	var RecordCount = psoPSOS.GetProperty(""Record Count"");
	var ErrorCode = psoPSOS.GetProperty(""Error Code"");
	if(ErrorCode != '0' && sActiveViewName == ""STC Subscription SR Detailed View"")
	{//if Call Tier matches and activeview;
		var ConfirmText = psoPSOS.GetProperty(""ConfirmText"");
		sCreditFlag = confirm(ConfirmText);
		if(sCreditFlag == false)//Cancel - Continue Assign
		{
		appObj.SetProfileAttr(""AssignGoAhead"",""Y"");
		return (""ContinueOperation"");
		}
		else
		{
		appObj.SetProfileAttr(""AssignGoAhead"",""N"");
		return (""ContinueOperation"");//Ok - Go to View
		}	
	}
	}
//MANUJ Added for TT Attachment Functionality	
	return (""ContinueOperation"");
}
function Applet_Load ()
{
	try
	{		
			//var sCallTier= this.BusComp().GetFieldValue(""INS Sub-Area"");
			if(theApplication().ActiveViewName() != ""STC Trouble Ticket Payments View"")
			{
				var ctrl = this.FindActiveXControl(""Submit"");
				ctrl.style.visibility=""hidden"";
			}
	}	
	catch (e)
	{
		LogException(e);
	}
	finally
	{
	
	}
}
function Applet_Load ()
{
	try
	{		
			//var sCallTier= this.BusComp().GetFieldValue(""INS Sub-Area"");
			if(theApplication().ActiveViewName() != ""STC Trouble Ticket Payments View"")
			{
				var ctrl = this.FindActiveXControl(""Submit"");
				ctrl.style.visibility=""hidden"";
			}
	}	
	catch (e)
	{
		LogException(e);
	}
	finally
	{
	
	}
}
function Applet_Load ()
{
	try
	{		
			//var sCallTier= this.BusComp().GetFieldValue(""INS Sub-Area"");
			if(theApplication().ActiveViewName() != ""STC Trouble Ticket Payments View"")
			{
				var ctrl = this.FindActiveXControl(""Submit"");
				ctrl.style.visibility=""hidden"";
			}
	}	
	catch (e)
	{
		LogException(e);
	}
	finally
	{
	
	}
}
function Applet_Load ()
{
	try
	{		
			//var sCallTier= this.BusComp().GetFieldValue(""INS Sub-Area"");
			if(theApplication().ActiveViewName() != ""STC Trouble Ticket Payments View"")
			{
				var ctrl = this.FindActiveXControl(""Submit"");
				ctrl.style.visibility=""hidden"";
			}
	}	
	catch (e)
	{
		LogException(e);
	}
	finally
	{
	
	}
}
function Applet_Load ()
{
	try
	{		
			//var sCallTier= this.BusComp().GetFieldValue(""INS Sub-Area"");
			if(theApplication().ActiveViewName() != ""STC Trouble Ticket Payments View"")
			{
				var ctrl = this.FindActiveXControl(""Submit"");
				ctrl.style.visibility=""hidden"";
			}
	}	
	catch (e)
	{
		LogException(e);
	}
	finally
	{
	
	}
}
function Applet_Load ()
{
	try
	{		
			//var sCallTier= this.BusComp().GetFieldValue(""INS Sub-Area"");
			if(theApplication().ActiveViewName() != ""STC Trouble Ticket Payments View"")
			{
				var ctrl = this.FindActiveXControl(""Submit"");
				ctrl.style.visibility=""hidden"";
			}
	}	
	catch (e)
	{
		LogException(e);
	}
	finally
	{
	
	}
}
function Applet_PreInvokeMethod (name, inputPropSet)
{
	switch (name) {
		case ""Customize"":
			var sessionCookie = document.cookie;
			var sblUrl = document.location.toString();
			var index = sblUrl.lastIndexOf(""/"");
			var sblServerUrl = sblUrl.substring(0, index+1);
			TheApplication().SetProfileAttr(""czSblUrl"", sblServerUrl);
			TheApplication().SetProfileAttr(""czSblSesCookie"", sessionCookie);
		break;
	}
	return (""ContinueOperation"");
}
var ForReading = 1, ForWriting = 2;
function Applet_InvokeMethod (name, inputPropSet)
{
	/*if(name == ""ExportIMSI"") {	
		var bsRMSUtilities 	= TheApplication().GetService(""RMS RMS Utilities"");
		var psInputs 		= TheApplication().NewPropertySet();
		var psOutputs;
		
		try {
		if(this.BusComp().GetFieldValue(""File Name and Path"") != """") {
			psInputs.SetProperty(""FilePath"",this.BusComp().GetFieldValue(""File Name and Path""));
		} else {
			psInputs.SetProperty(""FilePath"","""");
		}
		psInputs.SetProperty(""FileContent"",TheApplication().GetProfileAttr(""RMSIMSIExport""));
		
		psOutputs 	= bsRMSUtilities.InvokeMethod(""WriteLocalFile"",psInputs);
		TheApplication().SetProfileAttr(""RMSIMSIExport"","""");
		
		if(psOutputs.GetProperty(""ErrCode"") != """" ) {
			TheApplication().SWEAlert(""Error: "" + psOutputs.GetProperty(""ErrMessage""));
		} else {
			psInputs.SetProperty(""MessageCode"",""RMSAUC002"");
			psOutputs = bsRMSUtilities.InvokeMethod(""LookupMessage"",psInputs);
			alert(psOutputs.GetProperty(""Message""));
		}
		} catch(e) {
			TheApplication().SetProfileAttr(""RMSIMSIExport"","""");
		}
	}*/
	
	

}
"/*
---------------+------+--------+----------------------------------------------
Date(YYYYMMDD) | Ver  | By     | Description of Change
---------------+------+--------+----------------------------------------------
????????       | 1.0  | TM     | Creation
20060706       | 1.1  | Prasad | Siebel ES SCR1, Objects Destroyed
---------------+------+--------+----------------------------------------------
*/
function Applet_PreInvokeMethod (name, inputPropSet)
{
	if(name == ""ExportIMSI"") 
	{	
		try
		{	
			var bsRMSUtilities 	= theApplication().GetService(""RMS RMS Utilities"");
			var psBSInputArgs	= theApplication().NewPropertySet();
			var psInputs 		= theApplication().NewPropertySet();
			var psOutputs		= theApplication().NewPropertySet();
			var psBSOutputArgs;
			psInputs.SetProperty(""BSName"",""RMS AUC Registration"");
			psInputs.SetProperty(""BSMethod"",""ExportIMSI"");
//Set the type so that the CallServerBS method gets the Input arguments 
			psBSInputArgs.SetType(""BSInputArgs"");
			psBSInputArgs.SetProperty(""Action"",this.BusComp().GetFieldValue(""Action""));
			psBSInputArgs.SetProperty(""RowId"",this.BusComp().GetFieldValue(""Id""));
//Pass the input variables for the BS
			psInputs.AddChild(psBSInputArgs);
			psOutputs = bsRMSUtilities.InvokeMethod(""CallServerBS"", psInputs);
			psBSOutputArgs = psOutputs.GetChild(0);
//alert(""name9""+psBSOutputArgs);
//if(psBSOutputArgs.GetProperty(""ErrMessage"") != null)
//alert(psBSOutputArgs.GetProperty(""ErrMessage""));
			if(this.BusComp().GetFieldValue(""File Name and Path"") != """") 
			{
				psInputs.SetProperty(""FilePath"",this.BusComp().GetFieldValue(""File Name and Path""));
			} 
			else 
			{
				psInputs.SetProperty(""FilePath"","""");
			}
			for(var iPsCnt = 0;iPsCnt < psBSOutputArgs.GetChildCount();iPsCnt++) 
			{
				if(psBSOutputArgs.GetChild(iPsCnt).GetType() == ""FileContent"") 
				{
					var iIndx = psInputs.AddChild(psBSOutputArgs.GetChild(iPsCnt));
					break;
				}
			}
			var psFile = psInputs;
//psOutputs 	= bsRMSUtilities.InvokeMethod(""WriteLocalFile"",psInputs);
//psOutputs = WriteLocalFile(psInputs,psOutputs,psFile);
			WriteLocalFile(psInputs,psOutputs,psFile);
//theApplication().SetProfileAttr(""RMSReservedExport"","""");
//alert(""got out of the writelocal"");
			if(psOutputs.GetProperty(""ErrCode"") != """" ) 
				theApplication().SWEAlert(""Error: "" + psOutputs.GetProperty(""ErrMessage""));
			else if(psBSOutputArgs.GetProperty(""ErrCode"") != """" ) 
				theApplication().SWEAlert(""Error: "" + psBSOutputArgs.GetProperty(""ErrMessage""));
			else 
			{
				psInputs.SetProperty(""MessageCode"",""RMSAUC002"");
				psOutputs = bsRMSUtilities.InvokeMethod(""LookupMessage"", psInputs);
				theApplication().SWEAlert(psOutputs.GetProperty(""Message""));
			}
			return(""CancelOperation"");
		}
		catch(e) 
		{
			theApplication().SetProfileAttr(""RMSReservedExport"","""");
		}
//1.1 below
		finally
		{
			psBSInputArgs = null;
			psInputs = null;
			psOutputs = null;
			bsRMSUtilities = null;
		}
//1.1 above
	}
	else
		return(""ContinueOperation"");
}
function WriteLocalFile (inputPropSet, outputPropSet, psFile)
{
	var strFilePath = inputPropSet.GetProperty(""FilePath"");
	var iWriteLine 	= 1;
	var axoFileObject;
	var ptrFile;
	var psFile;// = theApplication().NewPropertySet();
//	psFile = inputPropSet;
    if(strFilePath =="""") {
    	strFilePath = prompt(""Please Enter full File Path (including file name)."");
    	//alert(strFilePath);
    }
 
    if(strFilePath != null) {
    	try {
	       	axoFileObject = new ActiveXObject(""Scripting.FileSystemObject"");
	        ptrFile = axoFileObject.OpenTextFile(strFilePath,ForWriting,true);

	       if((inputPropSet.GetProperty(""FileContentString"") != """") && (inputPropSet.GetProperty(""FileContentString"") != null)) {
	        	ptrFile.Write(inputPropSet.GetProperty(""FileContentString""));
	        }
	        else if(inputPropSet.GetChildCount() != 0){
	        	for(var iChildCnt = 0; iChildCnt < inputPropSet.GetChildCount();iChildCnt++) {
	        		if(inputPropSet.GetChild(iChildCnt).GetType() == ""FileContent"") {
	        			psFile = inputPropSet.GetChild(iChildCnt);
	        			break;
	        		}
	        	}
	        	if(psFile == null) {
	        		outputPropSet.SetProperty(""ErrCode"",""ERROR"");
	     			outputPropSet.SetProperty(""ErrMessage"",""Input property set not found"");
	        	} else {
		        	
		        	while(psFile.GetProperty(iWriteLine) != null && psFile.GetProperty(iWriteLine) != """") {
		        		ptrFile.WriteLine(psFile.GetProperty(iWriteLine++));
		        	}
		        }
	        }
	        ptrFile.Close();
     	} catch(e) {

     		if(ptrFile != null)
	   			ptrFile.Close();
     		outputPropSet.SetProperty(""ErrCode"",""ERROR"");
     		outputPropSet.SetProperty(""ErrMessage"",e.message);
     	
     	} finally {
     		if(axoFileObject != null)
     			axoFileObject = null;

     	}
   	} else {
   		outputPropSet.SetProperty(""ErrCode"",""FILE_NULL"");
    	outputPropSet.SetProperty(""ErrMessage"",""Please specify a file path"");
   	}
	

}
function Applet_ChangeFieldValue (field, value)
{
}
function Applet_Load ()
{

}
function Applet_SetLayout()
{
}

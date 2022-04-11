function ValidateGCCId(vSubsId,vCustType)
{

	var sBsValidateGCC = TheApplication().GetService("STC New Customer Validation");
	var sErrorCode = "";
	var sErrorMsg = "";
	var vSubCntry;
	var sSubIdType;
	if(vCustType == "Corporate" || vCustType =="SME"){
		this.BusComp().ActivateField("STC Indv GCC Country Code");		
		vSubCntry = this.BusComp().GetFieldValue("STC Indv GCC Country Code");
		
	}//endif vCustType == "Corporate" || vCustType =="SME"
	if(vCustType == "Individual"){
		this.BusComp().ActivateField("STC GCC Country Code");		
		vSubCntry = this.BusComp().GetFieldValue("STC GCC Country Code");
		
	}//endif  vCustType == "Individual"
	
	if(vSubCntry != ""){
		var sInps = TheApplication().NewPropertySet();
		var sOutps = TheApplication().NewPropertySet();
		sInps.SetProperty("GCCId",vSubsId);
		sInps.SetProperty("GCCCountryCode",vSubCntry);
		sInps.SetProperty("sErrorCode",sErrorCode);
		sInps.SetProperty("sErrorMsg",sErrorMsg);
		
		sBsValidateGCC.InvokeMethod("ValidateGCCId",sInps,sOutps);
		sErrorMsg = sOutps.GetProperty("sErrorMsg");
		if(sErrorMsg != ""){
			TheApplication().RaiseErrorText(sErrorMsg);				
		}//endif sErrorMsg
	}//endif vSubCntry
	else{
		sErrorMsg = TheApplication().LookupMessage("User Defined Errors","AM0085")
		TheApplication().RaiseErrorText(sErrorMsg);
	}//endelse vSubCntry
	
	return CancelOperation;
	
}
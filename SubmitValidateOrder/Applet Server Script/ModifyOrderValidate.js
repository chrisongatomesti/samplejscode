function ModifyOrderValidate(OrderId,BillAccId,strServiceType,Ordertype,vProfile,vDatcomPackage,STCCustomerType,BillingAccountStatus,strCount,MSISDNCategory,sMSISDN,PackageName,PackagePart,sActionCd,sBillProfId,sSIMNumber,sAuthorityLevel,sServiceAccount,sServiceId,MNPMSISDN)
{
try{
				var strServiceType,sMSISDN,OrderId,BillAccId,Ordertype;
				var strCount;
				var MSISDNCategory;
				var PackageName,PackagePart,vProfile,vDatcomPackage,STCCustomerType,BillingAccountStatus;
				var sActionCd,sBillProfId,sSIMNumber,sAuthorityLevel,sServiceAccount,sServiceId,MNPMSISDN;
var isDatacomPackage;
var appObj = TheApplication();
	var vPackagePartNumLic = appObj.InvokeMethod("LookupValue", "STC_DATACOMM_PACKAGE_PARTNUM", PackagePart);
	
	if( vProfile == "Datacom" && vDatcomPackage != "" && vDatcomPackage != PackageName && (strServiceType == "Postpaid"))
	{ // 1.1
		appObj.RaiseErrorText("You are eligible for selection of " + vDatcomPackage + " package only.");
	}
	if( vPackagePartNumLic == PackagePart )
	{
		isDatacomPackage = true;
	}
	if(isDatacomPackage && (strServiceType == "Postpaid"))
	{
		fn_datacomOrderValidation();
	}
		if(strServiceType == "Postpaid")
		{
			Rateplan();
		}
	
		ValidateSTCOrder(sActionCd,sBillProfId,sSIMNumber,sAuthorityLevel,sServiceAccount,sServiceId,MNPMSISDN);
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
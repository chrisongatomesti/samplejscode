function ProvideOrderValidate(OrderId,BillAccId,strServiceType,Ordertype,vProfile,vDatcomPackage,STCCustomerType,BillingAccountStatus,strCount,MSISDNCategory,sMSISDN,PackageName,PackagePart,sActionCd,sBillProfId,sSIMNumber,sAuthorityLevel,sServiceAccount,sServiceId,MNPMSISDN)
{
try{
var appObj = TheApplication();
//var strServiceType1,sMSISDN,OrderId,BillAccId,Ordertype;
//var strCount;
//var MSISDNCategory;
//var PackageName,PackagePart,vProfile,vDatcomPackage,STCCustomerType,BillingAccountStatus;
//var sActionCd,sBillProfId,sSIMNumber,sAuthorityLevel,sServiceAccount,sServiceId,MNPMSISDN;
var isDatacomPackage=false;

	if(ToNumber(strCount) >= 2)
	{
		appObj.RaiseErrorText("You should not select more than one package.Please report the issue.");	return(CancelOperation);
	}
	
	 if(MSISDNCategory == "Bulk Message" && (strServiceType == "Postpaid"))
	{
		appObj.RaiseErrorText("Virtual MSISDN is not allowed for Postpaid connection.");		return(CancelOperation);
	}
	if(strServiceType == "Postpaid")
	{
		fn_datacomOrderValidation();
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
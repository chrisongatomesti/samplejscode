function UpdateEmailAddress()
{
	try
	{
		var appObj = TheApplication();
		var Inputs = appObj.NewPropertySet();
		Validations("ORDERCHECK", Inputs);
		var sAccountId = this.BusComp().GetFieldValue("Billing Account Id");
		//Mayank: Added for "STC Order Entry - Order Form Applet Dashboard (Sales) Migration Order"
		this.BusComp().ActivateField("STC Migration Sub Type");
		var sMigSubType = this.BusComp().GetFieldValue("STC Migration Sub Type");
		if(sMigSubType != null && sMigSubType != "")
		{
			this.BusComp().ActivateField("STC New Accnt Id");
			var sNewAccountId = this.BusComp().GetFieldValue("STC New Accnt Id");
			if(sNewAccountId != "" && sNewAccountId != null)
			{
				sAccountId = sNewAccountId;
			}
		}
		//Mayank: Added for "STC Order Entry - Order Form Applet Dashboard (Sales) Migration Order"
		var sBANBO = appObj.GetBusObject("STC Billing Account");
		var sBANBC = sBANBO.GetBusComp("CUT Invoice Sub Accounts");
		with(sBANBC)
		{
			SetViewMode(AllView);
			ActivateField("Primary Contact Id");
			ClearToQuery();
			SetSearchSpec("Id", sAccountId);
			ExecuteQuery(ForwardOnly);
			if (FirstRecord())
			{
				var sContactId = GetFieldValue("Primary Contact Id");
				appObj.SetProfileAttr("CONTACT_ID", sContactId);
			}
		}
		Inputs.SetProperty("PrimaryContactId",sContactId);
		Validations("RESETEMAILREASON",Inputs);
		var sBS = appObj.GetService("SLM Save List Service");
		var psInp = appObj.NewPropertySet();
		var psOut = appObj.NewPropertySet();
		psInp.SetProperty("Applet Height", "400");
		psInp.SetProperty("Applet Mode", "2");                         
		psInp.SetProperty("Applet Name", "STC Order Email Popup Applet");
		psInp.SetProperty("Applet Width", "400");
		sBS.InvokeMethod("LoadPopupApplet", psInp , psOut);
	}
catch(e)
{
	throw(e);
}
finally
{
	appObj = null;
	sAccountId = null;
	sBANBC = null;
	sBANBO = null;
	sContactId = null;
	sBS = null;
	psInp = null;
	psOut = null;
}








}
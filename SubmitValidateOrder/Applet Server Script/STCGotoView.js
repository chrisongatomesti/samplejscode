function STCGotoView()
{
	try
	{		
		var vApplication: Application = TheApplication();
		var vService: Service = vApplication.GetService("Shopping Service");
		var sInputs: PropertySet  = vApplication.NewPropertySet();
		var sOutputs: PropertySet  = vApplication.NewPropertySet();
		sInputs.SetProperty("Business Component","Account");
		sInputs.SetProperty("Row Id",this.BusComp().GetFieldValue("Account Id"));
		sInputs.SetProperty("View","Com Sub Account View");
		vService.InvokeMethod("GotoView",sInputs,sOutputs);
	}
	finally
	{
		vApplication = null;
		vService = null;
		sInputs = null;
		sOutputs = null;
	}
}
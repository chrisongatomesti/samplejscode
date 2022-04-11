function CorpGPRS()
{

	var appobj = TheApplication();
	var STCInputs  = appobj.NewPropertySet();
	var STCOutputs  = appobj.NewPropertySet();
	
		var STCRowId = this.BusComp().GetFieldValue("Id");
		var STCWorkflowProc = appobj.GetService("STC Corporate GPRS Order Util");
		STCInputs.SetProperty("Object Id",STCRowId);
		STCWorkflowProc.InvokeMethod("SubmitCorpGPRS", STCInputs, STCOutputs);
		this.BusComp().InvokeMethod("RefreshBusComp");
}
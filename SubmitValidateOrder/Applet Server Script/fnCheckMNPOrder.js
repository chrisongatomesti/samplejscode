function fnCheckMNPOrder(sOrderId)
{
try
{
	var appobj = TheApplication();
	var sWfSvc = appobj.GetService("Workflow Process Manager");
	var psMNPInputs  = appobj.NewPropertySet();
	var psMNPOutputs  = appobj.NewPropertySet();
	psMNPInputs.SetProperty("Object Id",sOrderId);
	psMNPInputs.SetProperty("ProcessName","STC Add MNP PortIn Charge Product WF");	
	sWfSvc.InvokeMethod("RunProcess", psMNPInputs, psMNPOutputs);
}
catch(e)
{
	throw(e);
}
finally
{
	psMNPOutputs = null; psMNPInputs = null; sWfSvc = null;
}
}
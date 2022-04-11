function fnCANOutstandingVal(sOrderId)
{/*[19Sep2016][NAVINR][OrderApproval]*/
try
{
	var sOrdStatNoUpdate = "N";
	var appobj = TheApplication();
	var sWfSvc = appobj.GetService("Workflow Process Manager");
	var psMNPInputs  = appobj.NewPropertySet();
	var psMNPOutputs  = appobj.NewPropertySet();
	psMNPInputs.SetProperty("Object Id",sOrderId);
	psMNPInputs.SetProperty("ProcessName","STC CAN OutStanding Approval Validation WF");	
	sWfSvc.InvokeMethod("RunProcess", psMNPInputs, psMNPOutputs);
	sOrdStatNoUpdate = psMNPOutputs.GetProperty("OrderStatNoUpdate");
	return sOrdStatNoUpdate;
}
catch(e)
{
	throw(e);
}
finally
{
	psMNPOutputs = null; psMNPInputs = null; sWfSvc = null;
}
return sOrdStatNoUpdate;
}
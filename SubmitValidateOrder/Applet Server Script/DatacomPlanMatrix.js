function DatacomPlanMatrix(sOrderId)
{
	try	
{
  var sApp = TheApplication();
  var sInputs;
  var sOutputs;
  var sBSWPM;
  var sErrMsg;
  var sErrorCode;

	 sInputs = sApp.NewPropertySet();
	 sOutputs = sApp.NewPropertySet();
     sInputs.SetProperty("Object Id",sOrderId);
	 sInputs.SetProperty("ProcessName","STC Datacom Plan Matrix Approval WF");	
	 sBSWPM = sApp.GetService("Workflow Process Manager");
	 sBSWPM.InvokeMethod("RunProcess", sInputs, sOutputs);
	 sErrMsg = sOutputs.GetProperty("Error Message");
	 sErrorCode = sOutputs.GetProperty("Error Code");
	 if(sErrorCode !="" && sErrorCode != null)
		{
		   	TheApplication().RaiseErrorText(sErrMsg);
		}

}
catch(e)
{
	throw(e);
}
finally
{
	sApp = null; 
	sInputs = null; 
	sOutputs = null;
}	
}
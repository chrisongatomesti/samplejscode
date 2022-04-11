//ROHITR:20-08-20: Added for Fulfillment enhancement
  function Fulfillment(sOrderId)
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
     sInputs.SetProperty("OrderId",sOrderId);
	 sInputs.SetProperty("ProcessName","STC Create Order Dispatch Rec Wrapper WF");	
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
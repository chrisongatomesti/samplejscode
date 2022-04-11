//[MANUJ] : [Email Alternate Number Capture Enhancement]
function Validations(Operation,Inputs)
{
try
{
		var appObj = TheApplication();
		var psInputs = appObj.NewPropertySet();
		var psOutputs = appObj.NewPropertySet();
		var PrimaryContactId = Inputs.GetProperty("PrimaryContactId");
		this.BusComp().ActivateField("STC Order SubType");
		var OrderType = this.BusComp().GetFieldValue("STC Order SubType");
		var OrderId = this.BusComp().GetFieldValue("Id");
		var svcBusSrv = "";
		with(psInputs)
		{
			SetProperty("OrderType",OrderType);
			SetProperty("PrimaryContactId",PrimaryContactId);
			SetProperty("OrderId",OrderId);
			SetProperty("Operation",Operation);
			SetProperty("ProcessName","STC Validate Primary Contact Details");
		}
		svcBusSrv = appObj.GetService("Workflow Process Manager");
		svcBusSrv.InvokeMethod("RunProcess",psInputs,psOutputs);
		var Err = psOutputs.GetProperty("Error Message");
		if(Err != "" || Err != '')
		{
		TheApplication().RaiseErrorText(Err);
		
		}
}
catch(e)
{
throw(e);
}
finally
{
appObj = null;
psInputs = null;
psOutputs = null;
OrderId = null;
svcBusSrv = null;
OrderType = null;
}




}
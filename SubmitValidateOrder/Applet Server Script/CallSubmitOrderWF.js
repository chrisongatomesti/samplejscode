function CallSubmitOrderWF()
{
	var appobj = TheApplication();
	var STCInputs  = appobj.NewPropertySet();
	var STCOutputs  = appobj.NewPropertySet();
	var sSimRetain;
  	var SMigType;
  		
	try
	{
		CallCheckIP();
		this.BusComp().ActivateField("SIM Retension Flag");
		sSimRetain = this.BusComp().GetFieldValue("SIM Retension Flag");
		SMigType = this.BusComp().GetFieldValue("Delivery Block");
		TheApplication().SetProfileAttr("SimRetain",sSimRetain);
	    TheApplication().SetProfileAttr("MigType",SMigType);
	    
		var STCRowId = this.BusComp().GetFieldValue("Id");
		var STCWorkflowProc = appobj.GetService("Workflow Process Manager");
		STCInputs.SetProperty("Object Id",STCRowId);
		STCInputs.SetProperty("ProcessName","STC Submit Order Wrapper");
		
		STCWorkflowProc.InvokeMethod("RunProcess", STCInputs, STCOutputs);
		return (CancelOperation);	
	}
	catch(e)
	{
		throw(e)
	}
	finally
	{
		STCOutputs = null;
		STCInputs = null;
		STCWorkflowProc = null;
	}				
	}
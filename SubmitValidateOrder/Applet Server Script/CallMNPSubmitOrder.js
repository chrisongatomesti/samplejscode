function CallMNPSubmitOrder()
{
	var SerAccId="", vCustProvType="";
	with(this.BusComp())
	{
		var OrderId = GetFieldValue("Id");
		var AccType = GetFieldValue("Order Account Type");
		var BillAccName = GetFieldValue("Billing Account");
		var BillAddId = GetFieldValue("Primary Account Address Id");
		var CommType = GetFieldValue("STC Community Type");
		var CustAccId = GetFieldValue("Customer Account Id");
		var OrderSubType = GetFieldValue("STC Order SubType");
		var BillAccId = GetFieldValue("Billing Account Id");
		var PriConId = GetFieldValue("STC Primary Contact Id");
		SerAccId = GetFieldValue("Service Account Id");
		var sGccCntryCode = GetFieldValue("STC GCC Country Code");//CIO
		var sSplitFlag = GetFieldValue("STC Split Billing Flag");
		ActivateField("STC Individual Customer Type");
		vCustProvType = GetFieldValue("STC Individual Customer Type");
	}

	//var appobj = TheApplication();
	var STCInputs  = TheApplication().NewPropertySet();
	var STCOutputs  = TheApplication().NewPropertySet();

	if(SerAccId == "" || SerAccId == null)
	{
		var STCCreateSAN = TheApplication().GetService("STC Create Subscription");
		with(STCInputs)
		{
			SetProperty("Account Type",AccType);
			SetProperty("Billing Account Name",BillAccName);
			SetProperty("Billing Address Id",BillAddId);
			SetProperty("Community Type",CommType);
			SetProperty("Customer Account Id",CustAccId);
			SetProperty("Order Id",OrderId);
			SetProperty("Order Sub Type",OrderSubType);
			SetProperty("Billing Account Id",BillAccId);
			SetProperty("Primary Contact Id",PriConId);
			SetProperty("GCCCountryCode",sGccCntryCode);//CIO	
			SetProperty("CustProvisionType", vCustProvType);
		}
		STCCreateSAN.InvokeMethod("CreateSubscription", STCInputs, STCOutputs);
		SerAccId = STCOutputs.GetProperty("ServiceAccountId");
		var ErrMsg = STCOutputs.GetProperty("Error Message");
		if((SerAccId != "" || SerAccId != null) && ErrMsg == "" )
		{
			with(this.BusComp())
			{
				ActivateField("Service Account Id");
				SetFieldValue("Service Account Id", SerAccId);
				WriteRecord();
			}
		}
		else if(ErrMsg != null || ErrMsg != "")
		{
			TheApplication().RaiseErrorText(ErrMsg);
		}
	}
	else if(sSplitFlag == "Y")
	{
		var psSplitMNPInputs  = TheApplication().NewPropertySet();
		var psSplitMNPOutputs  = TheApplication().NewPropertySet();
		var svcSplitMNPService = TheApplication().GetService("Workflow Process Manager");
		psSplitMNPInputs.SetProperty("Object Id",OrderId);
		psSplitMNPInputs.SetProperty("ProcessName", "STC Split Update MSISDN Accounts");
		svcSplitMNPService.InvokeMethod("RunProcess", psSplitMNPInputs, psSplitMNPOutputs);
	}
			
	var vMNPSRCreate = TheApplication().InvokeMethod("LookupValue","STC_MNP_SR_CREATE","MNPSRCREATE");
			
	if(vMNPSRCreate == "TRUE")
	{
		var SerReqBC = TheApplication().GetBusObject("Service Request").GetBusComp("Service Request");
		with(SerReqBC)
		{
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec("Account Id", SerAccId);
			ExecuteQuery(ForwardOnly);
			if(!FirstRecord())
			{
				var STCInputsone  = TheApplication().NewPropertySet();
				var STCOutputsone  = TheApplication().NewPropertySet();
				var STCCreateSR = TheApplication().GetService("Workflow Process Manager");
				with(STCInputsone)
				{
					SetProperty("SerAccId",SerAccId);
					SetProperty("Type", "CreateMNPReq");
					SetProperty("ProcessName", "STC Create MNP Service Request");
				}
				STCCreateSR.InvokeMethod("RunProcess", STCInputsone, STCOutputsone);
				var SerReqId = STCOutputsone.GetProperty("SR Id");
				
				var serReqBC = TheApplication().GetBusObject("Service Request").GetBusComp("Service Request");
				var MNPQueueId = TheApplication().InvokeMethod("LookupValue","STC_MNP_QUEUE", "HELP_DESK"); 
				with(serReqBC)
				{
					SetViewMode(AllView);
					ActivateField("STC Queue Name");
					ActivateField("Call Back");
					ClearToQuery();
					SetSearchSpec("SR Id", SerReqId)
					ExecuteQuery(ForwardOnly);
					var IsSRRec = FirstRecord();
					if(IsSRRec)
					{
						SetFieldValue("Call Back" , "N");
						SetFieldValue("STC Queue Id" , MNPQueueId);
						SetFieldValue("Status", "In Progress");
						SetFieldValue("Sub-Status", "Queued");
						WriteRecord();
					}
				}
			}//if(!FirstRecord())
		}//with(SerReqBC)
	}//if(vMNPSRCreate == "TRUE")
		
	var vMNPOrderSubmit = TheApplication().InvokeMethod("LookupValue","STC_MNP_PORT_AUTO","Automated");
			
	if(vMNPOrderSubmit == "TRUE")
	{	
		var MNPInputs  = TheApplication().NewPropertySet();
		var MNPOutputs  = TheApplication().NewPropertySet();
		var MNPService = TheApplication().GetService("Workflow Process Manager");
		with(MNPInputs){
			SetProperty("ServAccntId",SerAccId);
			SetProperty("Object Id",OrderId);
			SetProperty("ProcessName", "STC GenPortIn Request WF");
		}
		MNPService.InvokeMethod("RunProcess", MNPInputs, MNPOutputs);
		this.BusComp().SetFieldValue("STC Order Sub Status","MNP Order In Progress");
		this.BusComp().WriteRecord();
	}
	else
	{			
		this.BusComp().SetFieldValue("STC Order Sub Status","MNP Order In Progress");
		this.BusComp().WriteRecord();
	}
}
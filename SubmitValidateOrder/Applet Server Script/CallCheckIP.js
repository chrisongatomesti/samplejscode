function CallCheckIP()
{

var AppObj = TheApplication();
var OrderItemId;
var APNName;
var SerAccId;
	var StrOrderBO = TheApplication().GetBusObject("Order Entry (Sales)");
	var StrOrderBC = StrOrderBO.GetBusComp("Order Entry - Orders");
	var sBCLineItem = StrOrderBO.GetBusComp("Order Entry - Line Items (Simple)");
	var sOrderItemXA = StrOrderBO.GetBusComp("Order Item XA");
		var STCRowId = this.BusComp().GetFieldValue("Id");
	with(StrOrderBC)
	{
		ClearToQuery();
		SetSearchSpec("Id", STCRowId);
		ExecuteQuery(ForwardOnly);
		var isOrderrec = FirstRecord();
		if(isOrderrec)
		{
			SerAccId = GetFieldValue("Service Account Id");
			with(sBCLineItem)
				{
						SetViewMode(AllView);
						ActivateField("Order Header Id");
						ActivateField("Part Number");
						ClearToQuery();
						var spec  = "[Part Number] = 'CORPIPA1' AND [Action Code] = 'Add' AND [Order Header Id] = '" + STCRowId + "'";
						SetSearchExpr(spec);
						ExecuteQuery(ForwardOnly);
						var isrec = FirstRecord();
						if(isrec)
						{
							OrderItemId = GetFieldValue("Id");

							with(sOrderItemXA)
							{
								ActivateField("Object Id");
								SetViewMode(AllView);
								ClearToQuery();
								var XAspec  = "[Object Id] = '" + OrderItemId + "' AND [Name] = 'APN_APNName'";
								SetSearchExpr(XAspec);
								ExecuteQuery(ForwardOnly);
								var isrecord = FirstRecord();
								if(isrecord)
								{
										APNName = GetFieldValue("Value");
										var STCInputsIPAPN  = AppObj.NewPropertySet();
										var STCOutputsIPAPN  = AppObj.NewPropertySet();
										var STCAPNIPBS = AppObj.GetService("STC Check APN for IP");
										STCInputsIPAPN.SetProperty("AccountId",SerAccId);
										STCInputsIPAPN.SetProperty("APNName",APNName);
										STCAPNIPBS.InvokeMethod("CheckAPNName", STCInputsIPAPN, STCOutputsIPAPN);
										var APNFound = STCOutputsIPAPN.GetProperty("APNFound");
										if(APNFound != "Yes")
										{
											AppObj.RaiseErrorText("Selected APN is not Provisioned for this MSISDN");
											return(CancelOperation);
										}
								}
							}
						}
				}
		}
		}


}
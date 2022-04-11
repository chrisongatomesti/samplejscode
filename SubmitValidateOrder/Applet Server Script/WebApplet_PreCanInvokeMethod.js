function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var ireturn = "";
	var sOrderStatus, sOrderSubStatus, sOrderLOVStatus, sOrderLOVSubStatusRaised;
	var MNPOrder, CORPGPRSBAcc;
	var appObj = TheApplication();
	var CurrBC = this.BusComp();
	var sSubStatusPending="", sSubStatusPendVer="";
	var STCRenewalStatus;
	var IPhonePartCode;
	with(CurrBC)
	{
		ActivateField("STC Cust Exist Plan");
		ActivateField("STC APN Billing Account Id");
		ActivateField("STC Iphone PartCode");
		ActivateField("STC Renewal Status");
		ActivateField("Billing Account Id");
		ActivateField("STC Primary Contact Id");
		ActivateField("STC Customer Type");
		ActivateField("STC Subscriber Id");
		ActivateField("STC Service Type");
		ActivateField("STC Migration Sub Type");//Mayank[30July18]: Added for Removal of MIgration Order Toogle
		var sMigSubType = GetFieldValue("STC Migration Sub Type");//Mayank[30July18]
		var OrderType = GetFieldValue("STC Order SubType");
		var STCExistingCustPlan = GetFieldValue("STC Cust Exist Plan");
		var STCOrderId = GetFieldValue("Id");
		var APNBillAccId = GetFieldValue("STC APN Billing Account Id");
		STCRenewalStatus = GetFieldValue("STC Renewal Status");
		var STCBillAccntId = GetFieldValue("Billing Account Id");
		var STCPrimaryBillConId = GetFieldValue("STC Primary Contact Id");
		IPhonePartCode = GetFieldValue("STC Iphone PartCode");
		var CustType = GetFieldValue("STC Customer Type");
		var ServiceType = GetFieldValue("STC Service Type");
		var STCCustomerId = GetFieldValue("STC Subscriber Id");
		var sGCCanInvokeCalc = GetFieldValue("GenerateContractCanInvokeCalc");//Mayank: 1Oct18 -- Added for RDS
	}
	with(appObj)
	{
		appObj.SetProfileAttr("STCOrderType",OrderType);
		appObj.SetProfileAttr("STCAPNBILLACCID",APNBillAccId);
		appObj.SetProfileAttr("STCExistingCustPlan",STCExistingCustPlan);
		appObj.SetProfileAttr("IPhonePartCode",IPhonePartCode);
		appObj.SetProfileAttr("STCRenewalStatus",STCRenewalStatus);
		appObj.SetProfileAttr("STCOrderId",STCOrderId);
		appObj.SetProfileAttr("STCBillAccntId",STCBillAccntId);
		appObj.SetProfileAttr("STCPrimaryBillConId",STCPrimaryBillConId);
		appObj.SetProfileAttr("STCCustomerType",CustType);
		appObj.SetProfileAttr("STCCustomerId",STCCustomerId);
		appObj.SetProfileAttr("ServiceType",ServiceType);
		//Mayank[30July18]: Added for Removal of MIgration Order Toogle
		if(sMigSubType != null && sMigSubType != "")
		{
			appObj.SetProfileAttr("MigrationOrderId",STCOrderId);
		}//Mayank[30July18]
	}

	try
	{
		switch(MethodName)
		{
			case "CaptureSignature":
			CanInvoke = "true";
			ireturn = CancelOperation;
			break;

			case "GenerateNewSubscriptionForm":
			var sOrderGStatus = CurrBC.GetFieldValue("Status");
			var sOrderGSubStatus = CurrBC.GetFieldValue("STC Order Sub Status");
			var CanInGenerateC = "N",GenerateContractCanInvokeCalc = "N";
			CurrBC.ActivateField("STC Order SubType");
			var sOrderType = CurrBC.GetFieldValue("STC Order SubType");
			if(sOrderType == "Retail")
			{
				CanInvoke = "false";
			}
			else
			{
				if(sOrderGStatus == "Complete" || sOrderGStatus == "Submitted" || sOrderGSubStatus == "MNP Order In Progress")
				{
					CanInGenerateC = "Y";
				}
					/*//Mayank-13Jun19: Added for Mena Contract --------- START -----------
				var STCInputs  = TheApplication().NewPropertySet();
				var STCOutputs = TheApplication().NewPropertySet();
				var BService = TheApplication().GetService("Workflow Process Manager");
				STCInputs.SetProperty("Object Id",STCOrderId);
				STCInputs.SetProperty("ProcessName","STC MENA Contract Generation SubProcess");
				BService.InvokeMethod("RunProcess", STCInputs, STCOutputs);
				var PLANTYPE = STCOutputs.GetProperty("PLANTYPE");
				if(PLANTYPE == "MENA")
				{
					if(CanInGenerateC == "Y")
					{
						CanInvoke = "true";
					}
					else
					{
						CanInvoke = "false";
					}
				}
				else
				{*///Mayank-13Jun19: Added for Mena Contract --------- STOP -----------
					var sSigNatureSwitch = appObj.InvokeMethod("LookupValue","STC_RETAIL_SIGNATURE_ADMIN","SIGNATURE_SWITCH");
					var sSigNatureUserSwitch = appObj.InvokeMethod("LookupValue","STC_RETAIL_SIGNATURE_ADMIN","SIGNATURE_USER_SWITCH");
					var sUser = appObj.LoginName();
					if(sSigNatureSwitch == "Y")
					{
						if(sSigNatureUserSwitch == "YES")
						{
							var sUserAllow = appObj.InvokeMethod("LookupValue","STC_RETAIL_SIGNATURE_ADMIN",sUser);
							sUserAllow = sUserAllow.substring(0,5);
							if(sUserAllow == "ALLOW")
							{
								if(sOrderGStatus == "In Progress" && sOrderGSubStatus == "Order Validated")
								{
									CanInvoke = "true";
								}
								else
								{
									CanInvoke = "false";
								}
							}
							else
							{
								if((sOrderGStatus == "Complete" || sOrderGStatus== "Submitted") || sOrderGSubStatus == "MNP Order In Progress")
								{
									CanInvoke = "true";
								}
								else
								{
									CanInvoke = "false";
								}
							}
						}
						else
						{
							if(sOrderGStatus == "In Progress" && sOrderGSubStatus == "Order Validated")
								{
									CanInvoke = "true";
								}
								else
								{
									CanInvoke = "false";
								}
						}
					}
					else
					{
						if((sOrderGStatus == "Complete" || sOrderGStatus== "Submitted") || sOrderGSubStatus == "MNP Order In Progress")
						{
							CanInvoke = "true";
						}
						else
						{
							CanInvoke = "false";
						}
					}
			//}//Mayank-13Jun19: Added for Mena Contract
			}
			ireturn = CancelOperation;
			break;

			case "SubmitOrderSTC":
			MNPOrder = this.BusComp().GetFieldValue("STC Port In Flag");
			sOrderStatus = CurrBC.GetFieldValue("Status");
			sOrderSubStatus = CurrBC.GetFieldValue("STC Order Sub Status");
			sOrderLOVStatus = appObj.InvokeMethod("LookupValue","FS_ORDER_STATUS","In Progress");
			sOrderLOVSubStatusRaised = appObj.InvokeMethod("LookupValue","STC_ORDER_SUB_STATUS","Raised");
			sSubStatusPending = appObj.InvokeMethod("LookupValue","STC_ORDER_SUB_STATUS","Pending Approval");
			var sCorpGPRS = appObj.InvokeMethod("LookupValue","STC_ORDER_SUB_STATUS","GPRS Order In Progress");
			sSubStatusPendVer = appObj.InvokeMethod("LookupValue","STC_ORDER_SUB_STATUS","Pending Verification");
			var vDisableFlag = appObj.InvokeMethod("LookupValue","STC_ORDER_SUBMIT_BUTTON",sOrderSubStatus);
			if(vDisableFlag !="" && vDisableFlag!= null)
			{
			 vDisableFlag = vDisableFlag.substring(0,7);
			}
			if(sOrderStatus == sOrderLOVStatus)
			{    
					if(vDisableFlag == "Disable")
					{
						CanInvoke = "false";
					}
					else
					{
						if(sOrderSubStatus == sOrderLOVSubStatusRaised || sOrderSubStatus == sSubStatusPending || sOrderSubStatus == sSubStatusPendVer)
						{
							if(sOrderSubStatus == sCorpGPRS)
							{
								CanInvoke = "false";
							}
						}
						else
						{   
							if(MNPOrder != "Yes")
							CanInvoke = "true";
						}  
					 }
			}
			else
			{
				CanInvoke = "false";
			}        
			ireturn = CancelOperation;
			break;

			case "CancelOrderSTC":
			CanInvoke = "true";		
			ireturn = CancelOperation;
			break;

			case "ApproveOrderSTC":
			CanInvoke = "true";		
			ireturn = CancelOperation;
			break;

			case "RejectOrderSTC":
			CanInvoke = "true";		
			ireturn = CancelOperation;
			break;

			case "STCMNPSubmitOrder":
			MNPOrder = CurrBC.GetFieldValue("STC Port In Flag");
			var stat = CurrBC.GetFieldValue("STC Order Sub Status");
			if(MNPOrder != "Yes")
			{
				CanInvoke = "false";
			}
			else if(MNPOrder == "Yes" && stat == "Order Validated")
			{
				CanInvoke = "true";		
			}
			ireturn = CancelOperation;
			break;	

			case "STCMNPSubmitAutomated":
			MNPOrder = CurrBC.GetFieldValue("STC Port In Flag");
			var stat = CurrBC.GetFieldValue("STC Order Sub Status");
			if(MNPOrder != "Yes")
			{
				CanInvoke = "false";
			}
			else if(MNPOrder == "Yes" && stat == "Order Validated")
			{
				CanInvoke = "true";		 
			}
			ireturn = CancelOperation;
			break;

			case "CorpGPRS":
			var Ordstat = this.BusComp().GetFieldValue("STC Order Sub Status");
			var product = this.BusComp().GetFieldValue("STCCorpGPRSDummyProduct");
			if( product != "" && (Ordstat == "Order Validated" || Ordstat == "GPRS Order In Progress"))
			{
				CanInvoke = "true";		
			}
			else
			{
				CanInvoke = "false";
			}   
			ireturn = CancelOperation;
			break;

			default:
			ireturn = ContinueOperation;
		}
		return(ireturn);
	}
	catch(e)
	{
	}
	finally
	{
		CurrBC = null;
		appObj = null;
	}	
}
function WebApplet_PreInvokeMethod (MethodName)
{
	var ireturn;
	var CurrBC = this.BusComp();
	var appObj = TheApplication();
	var sCustomerType,sAllowedLogin,sPOSOrderFlag;
	try
	{
		switch(MethodName)
		{
			case "SubmitOrderSTC":
			CurrBC.WriteRecord();
			CurrBC.ActivateField("STC Port In Flag");
			var MNPOrder = CurrBC.GetFieldValue("STC Port In Flag");
			var CurrLogin = appObj.LoginName();
			CurrBC.ActivateField("STC Customer Type");
			CurrBC.ActivateField("STC POS Order Flag");
			sCustomerType = CurrBC.GetFieldValue("STC Customer Type");
			sPOSOrderFlag = CurrBC.GetFieldValue("STC POS Order Flag");
			sAllowedLogin = appObj.InvokeMethod("LookupValue","STC_POS_ORDER_ADMIN",CurrLogin);
			if (sCustomerType != "Corporate" && sAllowedLogin != CurrLogin && sPOSOrderFlag =="Y")
			appObj.RaiseErrorText("You are not allowed to Submit Order. Please Submit Order from POS.");
			var FoundUser = appObj.InvokeMethod("LookupValue","STC_CPBX_ORD_RES",CurrLogin); 
			var foundCSRSubstr = FoundUser.substring(0,3);
			if(foundCSRSubstr != "CSR")
			{
				var STCOrdRowId = this.BusComp().GetFieldValue("Id");
				var STCInputsCPBX  = TheApplication().NewPropertySet();
				var STCOutputsCPBX = TheApplication().NewPropertySet();
				var STCInputsCPBXService = TheApplication().GetService("Workflow Process Manager");
				STCInputsCPBX.SetProperty("Object Id",STCOrdRowId);
				STCInputsCPBX.SetProperty("ProcessName","STC CPBX UI Order Restriction");
				STCInputsCPBXService.InvokeMethod("RunProcess", STCInputsCPBX, STCOutputsCPBX);
				var ErrFlag = STCOutputsCPBX.GetProperty("ErrorFlag");
				var ErrMsg = STCOutputsCPBX.GetProperty("Error Message");
				if(ErrFlag == "Y")
				{
					TheApplication().RaiseErrorText(ErrMsg);
					return(CancelOperation);
				}	
			}
			var foundCSR = appObj.InvokeMethod("LookupValue","STC_MNP_CSR",CurrLogin); 
			var foundCSRSubstr = foundCSR.substring(0,3);
			if(MNPOrder != "Yes")
			{		
				CallSubmitOrderWF();
			}
			else
			{
				if(foundCSRSubstr != "CSR")
				{
					appObj.RaiseErrorText("Sorry!!! MNP Orders can be submitted by special CSRs only");
				}
				else
				{
					if(CurrBC.GetFieldValue("STC Order Sub Status") == "Raised" || CurrBC.GetFieldValue("STC Order Sub Status") == "Order Validated")
					{
						appObj.RaiseErrorText("Please Submit MNP Request before Submitting Order");
					}
					else
					{
						CurrBC.ActivateField("STC MNP Operator");
						var Donar = CurrBC.GetFieldValue("STC MNP Operator");
						if(Donar == "" || Donar == null)
						{
							appObj.RaiseErrorText("Please select Donar Details for MNP Order");
						}
						else
						{
							CallSubmitOrderWF();
						}
					}
				}
			}
			ireturn = CancelOperation;
			break;

			case "STCMNPSubmitOrder":
			this.BusComp().WriteRecord();
			CallMNPSubmitOrder();
			ireturn = CancelOperation;
			break;

			//Mayank: Added for RDS ------- START-------
			case "GenerateNewSubscriptionForm":
		    this.BusComp().WriteRecord();
			ireturn = ContinueOperation;
			break;//Mayank: Added for RDS ------- STOP-------

			case "MNPSubmitAutomated":
			this.BusComp().WriteRecord();
			CallMNPSubmitOrder();
			ireturn = CancelOperation;
			break;

			case "CorpGPRS":
			this.BusComp().WriteRecord();
			CorpGPRS();
			ireturn = CancelOperation;
			break;

			case "CancelOrderSTC":
			ireturn = CancelOperation;
			break;

			case "ApproveOrderSTC":
			ireturn = CancelOperation;
			break;

			case "RejectOrderSTC":
			ireturn = CancelOperation;
			break;

			case "STCGotoBANView": //Anchal: 13/10/2014 Added as per SD_Retail Provisioning Enhancements
			STCGotoView();
			ireturn = CancelOperation;
			break;

			case "ValidateOrder":
			STCValidateOrder();// Calling single function for all Order Validations.
			this.BusComp().InvokeMethod("RefreshBusComp");
			ireturn = CancelOperation;
			break;

			case "UpdateEmailAddress":
			UpdateEmailAddress();
			ireturn = CancelOperation;
			break;

			case "UpdateAlternateNo":
			UpdateAlternateNo();
			ireturn = CancelOperation;
			break;
		}
		return(ireturn);
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
	}	
}
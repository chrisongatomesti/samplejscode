//Your public declarations go here... 
var BulkReqId;
var oBulkReqBO;
var oActionSetBC;
var vOrderId;"
function WebApplet_Load ()
{

}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	
	if(MethodName == ""SubmitBulkOrder"")
	{
		var vOrderStatus = this.BusComp().GetFieldValue(""Order Status"");

		
		if(vOrderStatus == ""Order Validated"")
		{
			CanInvoke = ""TRUE"";
			return(CancelOperation);
		}
	}
	if(MethodName == ""ValidateBulkOrder"")
	{
		var sBulkReqStatus = this.BusComp().GetFieldValue(""Status"");
		vOrderStatus = this.BusComp().GetFieldValue(""Order Status"");
		if((sBulkReqStatus == ""Complete""|| sBulkReqStatus == ""Partially Complete"") && (vOrderStatus == ""Order Validating""))
		{
			CanInvoke = ""TRUE"";
			return(CancelOperation);
		}

	}
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	try
	{	
		if(MethodName == ""ValidateBulkOrder"")
		{
			this.BusComp().SetFieldValue(""Order Status"",""Validating"");
			this.BusComp().WriteRecord();
			BulkReqId = this.BusComp().GetFieldValue(""Id"");
			oBulkReqBO = TheApplication().GetBusObject(""ABO Bulk Request"");
			var oActionSetOrderBC = oBulkReqBO.GetBusComp(""ABO Bulk Request Action Set Orders"");
			var wfBS = TheApplication().GetService(""Server Requests"");
			var InPS = TheApplication().NewPropertySet();
			var OutPS = TheApplication().NewPropertySet();
			var ChildPS = TheApplication().NewPropertySet();
			var strExpr;
			InPS.SetProperty(""Component"",""WfProcMgr"");
			InPS.SetProperty(""Mode"",""DirectDb"");
	
			ChildPS.SetProperty(""ProcessName"",""STC Validate Bulk Order WF"");
	
			with(oActionSetOrderBC)
			{
				ActivateField(""Bulk Request Id"");
				ActivateField(""Order Id"");
				ClearToQuery();
				SetViewMode(AllView);
				strExpr = ""[Bulk Request Id] = '""+ BulkReqId +""' AND [Order Type] = 'Sales Order'"";
				SetSearchExpr(strExpr);
				ExecuteQuery(ForwardOnly);
				var iRecord = FirstRecord();
				while(iRecord)
				{
					var vOrderId = GetFieldValue(""Order Id"");
					ChildPS.SetProperty(""Object Id"",vOrderId);
					InPS.AddChild(ChildPS);
					wfBS.InvokeMethod(""SubmitRequest"",InPS,OutPS);
	
					iRecord = NextRecord();
	
				}

			}
			this.BusComp().SetFieldValue(""Order Status"", ""Order Validated"");
			this.BusComp().WriteRecord();

			return(CancelOperation);
	
		}
		if(MethodName == ""SubmitBulkOrder"")
		{
			this.BusComp().SetFieldValue(""Order Status"",""Order Submitting"");
			this.BusComp().WriteRecord();
			BulkReqId = this.BusComp().GetFieldValue(""Id"");
			oBulkReqBO = TheApplication().GetBusObject(""ABO Bulk Request"");
			oActionSetBC = oBulkReqBO.GetBusComp(""ABO Bulk Request Action Set Orders"");
			var svc = TheApplication().GetService(""Server Requests"");
			var Input = TheApplication().NewPropertySet();
			var Output = TheApplication().NewPropertySet();
			var PSChild  = TheApplication().NewPropertySet();
			var i = 0;
		//	var STCWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");
		//	Input.SetProperty(""ProcessName"",""STC Submit Bulk Order WF"");
			
			Input.SetProperty(""Component"",""WfProcMgr"");
			Input.SetProperty(""Mode"",""DirectDb"");
			PSChild.SetProperty(""ProcessName"",""STC Submit Bulk Order WF"");
	
			with(oActionSetBC)
			{
				ActivateField(""Bulk Request Id"");
				ActivateField(""Order Id"");
				ActivateField(""Order Type"");
				ActivateField(""STC Port In Flag"");
				ActivateField(""STC Order SubType"");
				ClearToQuery();
				SetViewMode(AllView);
				strExpr = ""[Bulk Request Id] = '""+ BulkReqId +""' AND [Order Type] = 'Sales Order'"";
				SetSearchExpr(strExpr);			
				ExecuteQuery(ForwardOnly);
				iRecord = FirstRecord();
				while(iRecord)
				{
					var vOrderType = GetFieldValue(""STC Order SubType"");
					vOrderId = GetFieldValue(""Order Id"");
					var MNPPortIn = GetFieldValue(""STC Port In Flag"");

					PSChild.SetProperty(""Object Id"",vOrderId);
					PSChild.SetProperty(""MNP Flag"",MNPPortIn);
					PSChild.SetProperty(""Order Type"",vOrderType);
					PSChild.SetProperty(""Counter"",i);
					Input.AddChild(PSChild);
					svc.InvokeMethod(""SubmitRequest"",Input,Output);
					i++;
					iRecord = NextRecord();
	
				}
				
	
			}
	
			return(CancelOperation);
		}
	
		
		return (ContinueOperation);
	}
	catch(e)
	{
	
	}
	finally
	{
		PSChild = null;
		Output = null;
		Input = null;
		svc = null;
		oActionSetBC = null;
		oBulkReqBO = null;
		ChildPS = null;
		OutPS = null;
		InPS = null;
		wfBS = null;
		oActionSetOrderBC = null;
		oBulkReqBO = null;
	}
}
function WebApplet_ShowListColumn (ColumnName, Property, Mode, &HTML)
{

}
function WebApplet_PreInvokeMethod (MethodName)
{
	try
	{
		if(MethodName == ""Confirm"")
		{
			var sRec, sStatus, sInputs, sOutputs, sBS;
			this.BusComp().ActivateField(""Activity Id"");
			this.BusComp().ActivateField(""Slot Start"");
			this.BusComp().ActivateField(""Slot End"");
			this.BusComp().ActivateField(""Assignee"");
			this.BusComp().ActivateField(""Planned Start""); // Abuzar 30June2020
			this.BusComp().ActivateField(""Planned End""); // Abuzar 30June2020
			var sActivityId = this.BusComp().GetFieldValue(""Activity Id"");
			//var SlotStart = this.BusComp().GetFieldValue(""Slot Start"");
			var SlotStart = this.BusComp().GetFieldValue(""Planned Start""); // Abuzar 30June2020 - Prod bug fix
			//var SlotEnd = this.BusComp().GetFieldValue(""Slot End"");
			var SlotEnd = this.BusComp().GetFieldValue(""Planned End""); // Abuzar 30June2020 - Prod bug fix
			var sOwner = this.BusComp().GetFieldValue(""Assignee"");
			var sBO = TheApplication().GetBusObject(""Action"");
			var sBC = sBO.GetBusComp(""Action"");
			with(sBC)
			{
				ActivateField(""Status"");
				SetSearchSpec(""Id"",sActivityId);
				ExecuteQuery(ForwardOnly);
				sRec = FirstRecord();
				if(sRec)
				{
					sStatus=GetFieldValue(""Status"");
				}
			}
			if(sStatus == ""Scheduled"")
			{
				sBS	= TheApplication().GetService(""Workflow Process Manager"");
				sInputs = TheApplication().NewPropertySet();
				sOutputs = TheApplication().NewPropertySet();
				sInputs.SetProperty(""Object Id"", sActivityId);
				sInputs.SetProperty(""SlotStart"", SlotStart);
				sInputs.SetProperty(""SlotEnd"", SlotEnd);
				sInputs.SetProperty(""OwnerName"", sOwner);
				sInputs.SetProperty(""Operatoin"", ""Reschedule"");
				sInputs.SetProperty(""ProcessName"", ""STC ABS Rescheduling Process"");
				sBS.InvokeMethod(""RunProcess"", sInputs, sOutputs);
			}
			else
			{
					sBS	= TheApplication().GetService(""Workflow Process Manager"");
					sInputs = TheApplication().NewPropertySet();
					sOutputs = TheApplication().NewPropertySet();
					sInputs.SetProperty(""Object Id"", sActivityId);
					sInputs.SetProperty(""SlotStart"", SlotStart);
					sInputs.SetProperty(""SlotEnd"", SlotEnd);
					sInputs.SetProperty(""OwnerName"", sOwner);
					sInputs.SetProperty(""Operatoin"", ""Confirmation"");
					sInputs.SetProperty(""ProcessName"", ""STC ABS Rescheduling Process"");
					sBS.InvokeMethod(""RunProcess"", sInputs, sOutputs);	
			}
		//	this.InvokeMethod(""CloseApplet"");
			return(ContinueOperation);
		}
		}
		catch(e)
		{
			throw(e);
		}
		finally
		{
			sBO = null;
			sBC = null;
			sBS = null;
			sInputs = null;
			sOutputs = null;
		}
	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if(MethodName == ""STCCamMember"")
	{
		this.BusComp().ActivateField(""Campaign Id"");
		this.BusComp().ActivateField(""Status"");
		var strCamId = """";
		var strOwnerId = """";
		strCamId = this.BusComp().GetFieldValue(""Campaign Id"");
		//strOwnerId = this.BusComp().GetFieldValue(""Primary Owner Id"");
		var strStatus = this.BusComp().GetFieldValue(""Status"");
		var strReqStat = TheApplication().InvokeMethod(""LookupValue"", ""EVENT_STATUS"", ""Not Started"");
		//if((strCamId != """") && (strStatus == """"))
		//if((strCamId != """"))
		if((strCamId != """") && (strStatus == strReqStat))
		{
		CanInvoke = ""TRUE"";
		return (CancelOperation);
		}
		else
		{
		CanInvoke = ""FALSE"";
		return (CancelOperation);
		}
	}
	
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	
	if(MethodName == ""STCCamMember"")
	{
	var appObj = TheApplication();
	var bcAct = this.BusComp();
	var strId = bcAct.GetFieldValue(""Id"");
	var ActivityType = bcAct.GetFieldValue(""Type"");
	var strCurrLogin = appObj.LoginId();
	
	var strCurrLoginName = appObj.LoginName();
	
	//bcAct.InvokeMethod(""SetAdminMode"",""TRUE"");
	bcAct.ActivateField(""Email Sender Address"");
	bcAct.ActivateField(""Campaign Id"");


bcAct.ActivateField(""Status"");
var strActStatus = appObj.InvokeMethod(""LookupValue"", ""EVENT_STATUS"", ""Attended"");
bcAct.SetFieldValue(""Status"",strActStatus);	
var bcMvg =bcAct.GetMVGBusComp(""Owned By Id"");
 bcMvg.ActivateField(""SSA Primary Field"");
 
 with(bcMvg)
	{
			ActivateField(""Login Name"");
			ActivateField(""Id"");
			//ActivateField(""SSA Primary Field"");
			ActivateField(""SSA Primary"");
		    ClearToQuery();
			SetViewMode(AllView);
			//SetSearchSpec(""Login Name"", strCurrLoginName);
			SetSearchSpec(""Id"", strCurrLogin);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
			{
				SetFieldValue(""SSA Primary Field"",""Y"");
				bcAct.WriteRecord();
				
			}
			else
			{
				var bcAssoc = bcMvg.GetAssocBusComp();
				with(bcAssoc)
				{
					ActivateField(""Login Name"");
					ActivateField(""Id"");
					//ActivateField(""SSA Primary Field"");
					ActivateField(""SSA Primary"");
		    		ClearToQuery();
					SetViewMode(AllView);
					//SetSearchSpec(""Login Name"", strCurrLoginName);
					SetSearchSpec(""Id"", strCurrLogin);
					ExecuteQuery(ForwardOnly);
					if(FirstRecord())
					{
						Associate(NewBefore);
				
					}
				}	
			}
		bcMvg.SetFieldValue(""SSA Primary Field"",""Y"");
		bcAct.WriteRecord();
	}//end of with bcMVG
	with(bcAct)
		{
	  		ActivateField(""Campaign Id"");
	  		ActivateField(""Email Sender Address"");
		    ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Id"", strId);
			ExecuteQuery(ForwardOnly);
		}
	
	
	
	
	var strEmail = bcAct.GetFieldValue(""Email Sender Address"");
	var strCamId = bcAct.GetFieldValue(""Campaign Id"");
	var str_email = strEmail.toLowerCase();
	//var strCamBO = TheApplication().GetBusObject(""Campaign Members""); 
	var strCamBO = appObj.GetBusObject(""Campaign"");
	var strCamBC = strCamBO.GetBusComp(""Campaign Members"");
	var strCampaignBC = strCamBO.GetBusComp(""Campaign"");
	
	with(strCampaignBC)
		{
	  		//ActivateField(""Campaign Id"");
		    //ActivateField(""Calculated Email Address"");
		    ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Id"", strCamId);
			//SetSearchSpec(""Calculated Email Address"", str_email);
			ExecuteQuery(ForwardOnly);
		}
	
	with(strCamBC)
		{
	  		ActivateField(""Campaign Id"");
		    ActivateField(""Calculated Email Address"");
		     ActivateField(""Type"");
		    ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Campaign Id"", strCamId);
			SetSearchSpec(""Calculated Email Address"", str_email);
			ExecuteQuery(ForwardOnly);
		
			if(FirstRecord())
			{
				var ActType = GetFieldValue(""Type"");
				
				if(ActivityType == ""SMS - Inbound"")
				{
						appObj.GotoView(""All Campaign Members View - Outbound"",strCamBO);
				}
				else if(ActivityType == ""Email - Inbound"")
				{
					appObj.GotoView(""All Campaign Members View - Outbound - Email"",strCamBO);	
				}
				else
				{
						appObj.GotoView(""All Campaign Members View - Outbound - Phone"",strCamBO);	
				}
			
			}//end of FirstRecord
		}//End of With
		return (CancelOperation);
	}//End of Method
	
	return (ContinueOperation);
}
function WebApplet_InvokeMethod (MethodName)
{

	return(ContinueOperation);	 
}
function WebApplet_PreInvokeMethod (MethodName)
{
	//Mayank: Added for Mena
	if(MethodName == ""CloseApplet"")
	{
		var sOrderId = TheApplication().GetProfileAttr(""STCOrderId"");
		if(sOrderId != """" && sOrderId != null)
		{
			var CurrBC = this.BusComp();
			with(CurrBC)
			{
				ActivateField(""Id"");
				var sAddressId = GetFieldValue(""Id"");
			}
			var appObj = TheApplication();
			var boOrder = appObj.GetBusObject(""Order Entry (Sales)"");
			var bcActivity = boOrder.GetBusComp(""Action (Quote Order)"");
			with(bcActivity)
			{
				ActivateField(""STC Primary Appointment Address Id"");
				ActivateField(""Order Id"");
				ActivateField(""Type"");
		        SetViewMode(AllView);   
		        ClearToQuery();
				var strExpr = ""[Order Id] = '""+ sOrderId +""' AND [Type] = 'Appointment'"";
				SetSearchExpr(strExpr);
		        ExecuteQuery(ForwardOnly);
				if(FirstRecord())
				{
					SetFieldValue(""STC Primary Appointment Address Id"", sAddressId);
					WriteRecord();	
				}
			}
		}
	}
	return (ContinueOperation);
}
function WebApplet_InvokeMethod (MethodName)
{
	if( MethodName == ""CreateRecord"" && this.BusComp().ParentBusComp().Name() == ""CUT Invoice Sub Accounts"" )
	{
		this.BusComp().SetFieldValue(""SSA Primary Field"", ""Y""); 
		//IsCreateRecord = true;
	}
	/*else if( MethodName == ""PostChanges"" && IsCreateRecord && this.BusComp().ParentBusComp().Name() == ""CUT Service Sub Accounts"" )
	{
		this.BusComp().SetFieldValue(""SSA Primary Field"", ""Y"");
		IsCreateRecord = false;
	}*/
}
function WebApplet_InvokeMethod (MethodName)
{
	var ireturn;
	var appObj;
	var sAccountLOV;
	try
	{
		ireturn = ContinueOperation;
		switch(MethodName)
		{
			case ""Mirror Search GotoView"":
				appObj=TheApplication();
				with(appObj)
				{
					sAccountLOV = InvokeMethod(""LookupValue"",""STC_CUST_TYPE"",""Corporate"");
					SetProfileAttr(""STCAccountTypeAcc"",sAccountLOV);
				}
				ireturn = ContinueOperation;
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
	}
}
function WebApplet_InvokeMethod (MethodName)
{
	var ireturn;
	var appObj;
	var sAccountLOV;
	try
	{
		ireturn = ContinueOperation;
		switch(MethodName)
		{
			case ""Mirror Search GotoView"":
				appObj=TheApplication();
				with(appObj)
				{
					sAccountLOV = InvokeMethod(""LookupValue"",""STC_CUST_TYPE"",""Organization"");
					SetProfileAttr(""STCAccountTypeAcc"",sAccountLOV);
				}
				ireturn = ContinueOperation;
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
	}
}
function WebApplet_InvokeMethod (MethodName)
{
	var ireturn;
	var appObj;
	var sAccountLOV;
	try
	{
		ireturn = ContinueOperation;
		switch(MethodName)
		{
			case ""Mirror Search GotoView"":
				appObj=TheApplication();
				with(appObj)
				{
					sAccountLOV = InvokeMethod(""LookupValue"",""STC_CUST_TYPE"",""SME"");
					SetProfileAttr(""STCAccountTypeAcc"",sAccountLOV);
				}
				ireturn = ContinueOperation;
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
	}
}
function WebApplet_InvokeMethod (MethodName)
{
	var ireturn;
	var appObj;
	var sAccountLOV;
	try
	{
		ireturn = ContinueOperation;
		switch(MethodName)
		{
			case ""Mirror Search GotoView"":
				appObj=TheApplication();
				with(appObj)
				{
					sAccountLOV = InvokeMethod(""LookupValue"",""STC_CUST_TYPE"",""Individual"");
					SetProfileAttr(""STCAccountTypeAcc"",sAccountLOV);
				}
				ireturn = ContinueOperation;
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
	}
}
function WebApplet_InvokeMethod (MethodName)
{
	var ireturn;
	var appObj;
	var sAccountLOV;
	try
	{
		ireturn = ContinueOperation;
		switch(MethodName)
		{
			case ""Mirror Search GotoView"":
			appObj=TheApplication();

			with(appObj)
			{
				sAccountLOV = InvokeMethod(""LookupValue"",""STC_CUST_TYPE"",""Individual"");
				SetProfileAttr(""STCAccountTypeAcc"",sAccountLOV);
			}		
			ireturn = ContinueOperation;		
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
	}
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	
	return (ContinueOperation);
}
function WebApplet_InvokeMethod (MethodName)
{

}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	//Mayank 18/02/2019: Added for ODU
	try
	{
		if(MethodName == ""CancelActivity"")
		{	
			this.BusComp().ActivateField(""Status"");
			this.BusComp().ActivateField(""Description"");
			this.BusComp().ActivateField(""Type"");
			this.BusComp().ActivateField(""STC Customer Type"");
			this.BusComp().ActivateField(""Order Id"");
			var sStatus = this.BusComp().GetFieldValue(""Status"");
			var sType = this.BusComp().GetFieldValue(""Type"");
			var sDesc = this.BusComp().GetFieldValue(""Description"");
			var sCustType = this.BusComp().GetFieldValue(""STC Customer Type"");
			var sOrderId = this.BusComp().GetFieldValue(""Order Id"");
			var sOrderItemBC = """", sSpec = """", sCountDevice = 0, RecExists = """", sPartNum = """";
			CanInvoke = ""False"";
			if(sCustType == ""Individual"")
			{
				if(sStatus == ""Approved"" || sStatus == ""Completed"" || sStatus == ""Cancelled"")
				{
					CanInvoke = ""False"";
					return (CancelOperation);
				}
				else
				{
					if(sDesc == ""CPE Activity"")
					{
						sOrderItemBC = TheApplication().GetBusObject(""Order Entry (Sales)"").GetBusComp(""Order Entry - Line Items"");
						with(sOrderItemBC)
						{
							SetViewMode(AllView);
							ActivateField(""STC Product Identifier"");
						    ActivateField(""Order Header Id"");
							ActivateField(""Action Code"");
							ActivateField(""Part Number"");
							ClearToQuery();
							sSpec  = ""[Order Header Id] = '"" + sOrderId + ""' AND [Action Code] = 'Add' AND [STC Product Identifier] = 'ROUTER'"";
							SetSearchExpr(sSpec);
							ExecuteQuery(ForwardOnly);
							sCountDevice = CountRecords();
							RecExists=FirstRecord();
							if (sCountDevice > 0)
							{
								while(RecExists)
								{	
									if(CanInvoke != ""True"")
									{
										sPartNum = GetFieldValue(""Part Number"");
										if(sPartNum == ""MNCAT6DEVICEADD"" || sPartNum == ""MENADEVICE1"" || sPartNum == ""TDDMAINOUEQU"")
										{
											CanInvoke = ""True"";
											return (CancelOperation);
										}
										RecExists = NextRecord();
									}
								}
							}
							else
							{
								CanInvoke = ""False"";
								return (CancelOperation);
							}
						}
					}
					else
					{
						CanInvoke = ""False"";
						return (CancelOperation);
					}
				}
			}
			//Mark 20/06/2021: Added for stc one device treatment
			if((sCustType == ""Corporate"" || sCustType == ""SME"") && (sType == ""STC OneDevice Business"" || sType == ""STC OneDevice Validation"")&& sStatus != ""Approved"" && sStatus != ""Completed"" && sStatus != ""Cancelled"")
			{
				//if(sStatus != ""Approved"" && sStatus != ""Completed"" && sStatus != ""Cancelled"")
			//	{
				CanInvoke = ""TRUE"";
				return (CancelOperation);
				//}
			}
			else
			{
				CanInvoke = ""False"";
				return (CancelOperation);
			}
		}
	}//try
	catch(e)
	{

	}
	finally
	{
		sOrderItemBC = null;
	}
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{

var appObj=TheApplication();
	if(MethodName == ""Reschedule"")
	{
		with(this.BusComp())
		{
			var appobj = TheApplication();
			var STCInputs  = appobj.NewPropertySet();
			var STCOutputs  = appobj.NewPropertySet();
			var ActivityId = this.BusComp().GetFieldValue(""Activity Id"");
			
			var STCWorkflowProc = appobj.GetService(""Workflow Process Manager"");
			STCInputs.SetProperty(""Object Id"",ActivityId);
			STCInputs.SetProperty(""ProcessName"",""STC CBR ReSchedule Activity WF"");
			
			STCWorkflowProc.InvokeMethod(""RunProcess"", STCInputs, STCOutputs);
			return (CancelOperation);	
			
		}
	}
if(MethodName == ""CancelActivity"")
{
	 this.BusComp().ActivateField(""SR Status"");
	 this.BusComp().ActivateField(""Activity SR Id"");
	 this.BusComp().ActivateField(""Type"");
	 var sType = this.BusComp().GetFieldValue(""Type"");
     var SRId = this.BusComp().GetFieldValue(""Activity SR Id"");
	 var SRStatus = this.BusComp().GetFieldValue(""SR Status"");
	  var sSRBC  = TheApplication().GetBusObject(""STC Service Request LightWeight BO"").GetBusComp(""STC Service Request Light Weight"");
	 if(sType ==""STC OneDevice Business"")
	   {
	    	this.BusComp().SetFieldValue(""STC Cancellation Reason"",""Rejected by Business Support Team"");
		}
	 else
		{
	    	this.BusComp().SetFieldValue(""STC Cancellation Reason"",""Rejected by Business Validation Team"");	
		}
		this.BusComp().SetFieldValue(""Status"",""Cancelled"");
		this.BusComp().WriteRecord();
	  if(SRStatus != ""Closed"" && SRStatus != ""Completed"")
	  {
	 	with(sSRBC)
		{
			ActivateField(""Id"");
			ActivateField(""Status"");
			ActivateField(""Description"");
			ActivateField(""Sub-Status"");
			ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Id"",SRId);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
			{
			if(sType ==""STC OneDevice Business"")
			{
			SetFieldValue(""Description"",""Rejected by Business Support Team"");
			}
			else
			{
			SetFieldValue(""Description"",""Rejected by Business Validation Team"");	
			}
			SetFieldValue(""Status"", appObj.InvokeMethod(""LookupValue"", ""SR_STATUS"", ""Closed""));	
			SetFieldValue(""Sub-Status"",appObj.InvokeMethod(""LookupValue"", ""SR_SUB_STATUS"", ""Completed""));
			sSRBC.WriteRecord();
			
			}
		}
	}


 }
	
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	
	if (MethodName == ""Submit"")
	{
		var ActId = this.BusComp().GetFieldValue(""Id"");
		var inpPS = TheApplication().NewPropertySet();
		var outPS = TheApplication().NewPropertySet();
		var oBS = TheApplication().GetService(""Workflow Process Manager"");
		inpPS.SetProperty(""ProcessName"", ""STC Assign CBR Activity WF"");
		inpPS.SetProperty(""Object Id"", ActId);
		outPS = oBS.InvokeMethod(""RunProcess"", inpPS,outPS);
		return(CancelOperation)
		
	}
	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if(MethodName == ""STCCamMember"")
	{
		this.BusComp().ActivateField(""Campaign Id"");
		this.BusComp().ActivateField(""Status"");
		var strCamId = """";
		var strOwnerId = """";
		strCamId = this.BusComp().GetFieldValue(""Campaign Id"");
		//strOwnerId = this.BusComp().GetFieldValue(""Primary Owner Id"");
		var strStatus = this.BusComp().GetFieldValue(""Status"");
		var strReqStat = TheApplication().InvokeMethod(""LookupValue"", ""EVENT_STATUS"", ""Not Started"");
		//if((strCamId != """") && (strStatus == """"))
		//if((strCamId != """"))
		if((strCamId != """") && (strStatus == strReqStat))
		{
		CanInvoke = ""TRUE"";
		return (CancelOperation);
		}
		else
		{
		CanInvoke = ""FALSE"";
		return (CancelOperation);
		}
	}
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	if(MethodName == ""STCCamMember"")
	{
	var appObj = TheApplication();
	var bcAct = this.BusComp();
	var strId = bcAct.GetFieldValue(""Id"");
	var strCurrLogin = appObj.LoginId();
	
	var strCurrLoginName = appObj.LoginName();
	
	//bcAct.InvokeMethod(""SetAdminMode"",""TRUE"");
	bcAct.ActivateField(""Email Sender Address"");
	bcAct.ActivateField(""Campaign Id"");
	
	//bcAct.ActivateField(""Primary Owner Id"");
	//bcAct.SetFieldValue(""Primary Owner Id"",strCurrLogin);
//	bcAct.ActivateField(""Primary Owned By"");
	
//	bcAct.SetFieldValue(""Primary Owned By"",strCurrLoginName);
	
//	var bcPick = bcAct.GetPicklistBusComp(""Primary Owner Id"");
	
/*	with(bcPick)
	{
			ActivateField(""Login Name"");
			ActivateField(""Id"");
		    ClearToQuery();
			SetViewMode(AllView);
			//SetSearchSpec(""Login Name"", strCurrLoginName);
			SetSearchSpec(""Id"", strCurrLogin);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
			{
				Pick();
			}
	}*/

bcAct.ActivateField(""Status"");
var strActStatus = appObj.InvokeMethod(""LookupValue"", ""EVENT_STATUS"", ""Attended"");
bcAct.SetFieldValue(""Status"",strActStatus);	
var bcMvg =bcAct.GetMVGBusComp(""Owned By Id"");
 bcMvg.ActivateField(""SSA Primary Field"");
var bcAssoc = bcMvg.GetAssocBusComp();
with(bcAssoc)
	{
			ActivateField(""Login Name"");
			ActivateField(""Id"");
			//ActivateField(""SSA Primary Field"");
			ActivateField(""SSA Primary"");
		    ClearToQuery();
			SetViewMode(AllView);
			//SetSearchSpec(""Login Name"", strCurrLoginName);
			SetSearchSpec(""Id"", strCurrLogin);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
			{
				Associate(NewBefore);
				
			}
	}
	bcMvg.SetFieldValue(""SSA Primary Field"",""Y"");
	bcAct.WriteRecord();
	
	with(bcAct)
		{
	  		ActivateField(""Campaign Id"");
	  		ActivateField(""Email Sender Address"");
		    ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Id"", strId);
			ExecuteQuery(ForwardOnly);
		}
	
	
	
	
	var strEmail = bcAct.GetFieldValue(""Email Sender Address"");
	var strCamId = bcAct.GetFieldValue(""Campaign Id"");
	var str_email = strEmail.toLowerCase();
	var strCamBO = TheApplication().GetBusObject(""Campaign Members""); 
	var strCamBC = strCamBO.GetBusComp(""Campaign Members"");
	
	with(strCamBC)
		{
	  		ActivateField(""Campaign Id"");
		    ActivateField(""Calculated Email Address"");
		    ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Campaign Id"", strCamId);
			SetSearchSpec(""Calculated Email Address"", str_email);
			ExecuteQuery(ForwardOnly);
		
			if(FirstRecord())
			{
				//TheApplication().RaiseErrorText(strCamBC.GetFieldValue(""Id""));
				TheApplication().GotoView(""All Campaign Members View - Outbound"",strCamBO);
			}//end of FirstRecord
		}//End of With
		return (CancelOperation);
	}//End of Method

	//[MARK:7-Oct-2019 SD:: Business Products Bulk Activation – Phase II]
	if(MethodName == ""BulkActivitySubmit"")
	{
	
		//var appObj = TheApplication();
		var bcActy = this.BusComp();
		var ActId = bcActy.GetFieldValue(""Id"");
		var inputPS1:PropertySet = TheApplication().NewPropertySet();
		var outputPS1:PropertySet = TheApplication().NewPropertySet();
		var BSAdjApp: Service = TheApplication().GetService(""Workflow Process Manager"");
		inputPS1.SetProperty(""ProcessName"", ""STC Bulk Activity Submition Workflow"");
		inputPS1.SetProperty(""Object Id"", ActId); 
		//inputPS1.SetProperty(""PackageType"", PackageType);
		BSAdjApp.InvokeMethod(""RunProcess"",inputPS1,outputPS1);
		return (CancelOperation);
	}	
	//return (ContinueOperation);
}
function WebApplet_InvokeMethod (MethodName)
{
	 if (MethodName == ""CopyRecord"") 
	 {
	 		syncAgreementLineswithOracle();
	 }
}
"
function syncAgreementLineswithOracle()
{

   	var prodId = new Array ;
	var rootAgreementItemId = new Array;
	var sourceAgreementId = new Array;
	var sourceConfigHeader = new Array;
	var sourceConfigRevNbr = new Array;
	
	var svc1;
	var bOracleProduct;
	
	var sourceConfigHeader;
	var sourceConfigRevNbr
	
	var bo = this.BusObject();
	var hdrBusComp = this.BusComp();
	var destAgreementId = hdrBusComp.GetFieldValue(""Id"");

		
	var bc = bo.GetBusComp(""FS Agreement Item"");

    //get the source configuration information
	try 
	{
		bc.ClearToQuery();
		
		var bcSearchStr = ""[Agreement Id] ='"" 
		/*bcSearchStr = bcSearchStr + 
		              searchSpec.substring(searchSpec.indexOf(""'"") +1,
		                     	               searchSpec.lastIndexOf(""'""))*/
		bcSearchStr = bcSearchStr + destAgreementId 	                             	               
		bcSearchStr = bcSearchStr + ""'"";                             	               
		bcSearchStr = bcSearchStr + "" AND "" ;
		bcSearchStr = bcSearchStr + ""[Id]=[Root Agreement Item Id]""; //to check only for root items
		bc.SetSearchExpr(bcSearchStr);
		bc.ExecuteQuery();
		
		var countRecs = bc.CountRecords();
		var i = 0;
		
		var isOCPi = TheApplication().NewPropertySet();
	    var isOCPo = TheApplication().NewPropertySet();
	    var bOracleProduct ;
	    var isOCPSvc;

		
		if (bc.FirstRecord())
		{
			do 
			{	 											
				var productId = bc.GetFieldValue(""Product Id"");
				
				//isOCPi.SetProperty(""BusCompName"",bc.Name())
				isOCPi.SetProperty(""ProductId"",productId);
					
				isOCPSvc = TheApplication().GetService(""CZSessionManagement"");
				isOCPSvc.InvokeMethod(""IsOracleConfigurableProduct"", isOCPi, isOCPo);
		
				bOracleProduct = isOCPo.GetProperty(""IsOracleProduct"");
				

				if (bOracleProduct == ""true"")
				{					
					prodId[i] = bc.GetFieldValue(""Root Product Id"");
					rootAgreementItemId[i] = bc.GetFieldValue(""Root Agreement Item Id"");
					sourceAgreementId[i] = bc.GetFieldValue(""Agreement Id"")
					sourceConfigHeader[i] =  bc.GetFieldValue(""External Configurator Reference 1"");
					sourceConfigRevNbr[i] = bc.GetFieldValue(""External Configurator Reference 2"");
					i++;
				}
			} while(bc.NextRecord())
		}

		 	
	    // update the rows		 	    
	    for (var k = 0; k< prodId.length; k++)
	    { 
			var indata1 =TheApplication().NewPropertySet ();
			var outdata1 = TheApplication().NewPropertySet ();
			indata1.SetProperty (""RootItemId"", rootAgreementItemId[k]);
			indata1.SetProperty (""QuoteorOrderorAgreementId"", destAgreementId);
			indata1.SetProperty(""SourceConfigHeader"",sourceConfigHeader[k]);
			indata1.SetProperty(""SourceConfigRevNbr"",sourceConfigRevNbr[k]);
			indata1.SetProperty(""BusinessObject"",bo.Name());					
			indata1.SetProperty(""BusinessComponent"",bc.Name());
			
			var svc1 = TheApplication().GetService(""CZIntegCopyConfigService"");
			svc1.InvokeMethod(""CopyOracleConfiguration"", indata1, outdata1);
	
	    }
    }
	catch  (e) 
	{
	  TheApplication().Trace(e.toString());
	  TheApplication().RaiseErrorText(e.toString());
	  throw e;
	}
	finally
	{
		indata1 = null;
		outdata1 = null
		svc1 = null;
	 	bOracleProduct = null;
		isOCPi = null;
		isOCPo = null;
		isOCPSvc = null;
		sourceConfigHeader = null;
		sourceConfigRevNbr = null;
		destAgreementId  = null;
		bo = null;
		bc = null;;
		prodId = null;
		rootAgreementItemId = null;
		sourceAgreementId =  null;
		sourceConfigHeader = null;
		sourceConfigRevNbr = null;
	}
  }
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{  
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
var vItemId="""", vItemTaskId="""", vItemType="""", vOrderId="""", vOrderNum="""", vItemValCurr="""", vItemValNew="""";
var vItemValAppr="""", vApproverLogin="""", vRequestorLogin="""", vJustification="""";
var psInput=null, psOutput=null, WfProcMgr=null;
var oServiceAF=null, inputPropAF=null, outputPropAF=null;
var vErrorCode="""", vErrorMsg="""";

	switch (MethodName){
		case ""CreateApproval"":
		{
			with(this.BusComp())
			{
				WriteRecord();
				vOrderId = this.BusComp().ParentBusComp().GetFieldValue(""Id"");
				vOrderNum = this.BusComp().ParentBusComp().GetFieldValue(""Order Number"");
				//vItemValCurr = this.BusComp().ParentBusComp().GetFieldValue(""STC Num of Inst"");
				vItemType = TheApplication().InvokeMethod(""LookupValue"", ""STC_ORDER_APPROVAL_TYPE"", ""Change of Installments"");
				//vItemValNew=GetFieldValue(""STC Item Value New"");
			}
			psInput = TheApplication().NewPropertySet();
			psOutput = TheApplication().NewPropertySet();
			WfProcMgr = TheApplication().GetService(""Workflow Process Manager"");
			with (psInput)
			{
				SetProperty(""ProcessName"", ""STC Order ISS Approval Workflow"");
				SetProperty(""Object Id"", vOrderId);
				SetProperty(""OrderNumber"", vOrderNum );
				SetProperty(""Inbox Type"", vItemType);
				//SetProperty(""ItemValCurr"", vItemValCurr);
				SetProperty(""ItemValNew"", vItemValNew);
				SetProperty(""ApproverLogin"", vApproverLogin);
				SetProperty(""ReqJustification"", vJustification);
				//SetProperty("""", """");
			}
			try
			{
				WfProcMgr.InvokeMethod(""RunProcess"", psInput, psOutput);
			}  
			catch(e)
			{
				throw(e);
			}
			finally
			{
				vErrorCode = psOutput.GetProperty(""Error Code"");
				vErrorMsg = psOutput.GetProperty(""Error Message"");
				if(vErrorCode != ""0"" && vErrorCode != ""00"")
				{
					TheApplication().RaiseErrorText(vErrorMsg);
				}
			}
			return (CancelOperation);  
			break;
		}
		case ""SubmitApproval"":
		case ""Approved"":
		case ""CancelApproval"":
		case ""Rejected"":
		{
			with(this.BusComp())
			{
				WriteRecord();
				ActivateField(""Item Type Name"");
				ActivateField(""STC Item Value Current"");
				ActivateField(""STC Item Value New"");
				ActivateField(""STC Item Value Approved"");
				ActivateField(""STC Approver Login"");
				ActivateField(""Task Requestor Login"");
				ActivateField(""Item Id"");
				vOrderId = this.BusComp().ParentBusComp().GetFieldValue(""Id"");
				vOrderNum = this.BusComp().ParentBusComp().GetFieldValue(""Order Number"");
				vItemType = GetFieldValue(""Item Type Name"");
				vItemValCurr = GetFieldValue(""STC Item Value Current"");
				vItemValNew = GetFieldValue(""STC Item Value New"");
				vItemValAppr = GetFieldValue(""STC Item Value Approved"");
				vApproverLogin = GetFieldValue(""STC Approver Login"");
				vRequestorLogin = GetFieldValue(""Task Requestor Login"");
				vItemTaskId = GetFieldValue(""Id"");
				vItemId = GetFieldValue(""Item Id"");
			}
		
			psInput = TheApplication().NewPropertySet();
			psOutput = TheApplication().NewPropertySet();
			WfProcMgr = TheApplication().GetService(""Workflow Process Manager"");
			with (psInput)
			{
				SetProperty(""ProcessName"", ""STC Order ISS Approval Wrapper Workflow"");
				SetProperty(""Object Id"", vOrderId);
				SetProperty(""OrderNumber"", vOrderNum );
				SetProperty(""Inbox Type"", vItemType);
				SetProperty(""ItemValCurr"", vItemValCurr);
				SetProperty(""ItemValNew"", vItemValNew);
				SetProperty(""ItemValAppr"", vItemValAppr);
				SetProperty(""ApproverLogin"", vApproverLogin);
				SetProperty(""ApprovalItemRowId"", vItemId);
				SetProperty(""ApprovalItemTaskId"", vItemTaskId);
				SetProperty(""RequestorLogin"", vRequestorLogin);
				SetProperty(""Operation"", MethodName);
				//SetProperty("""", """");
			}
			try
			{
				WfProcMgr.InvokeMethod(""RunProcess"", psInput, psOutput);
			}  
			catch(e)
			{
				throw(e);
			}
			finally
			{
				vErrorCode = psOutput.GetProperty(""Error Code"");
				vErrorMsg = psOutput.GetProperty(""Error Message"");
				if(vErrorCode != ""0"" && vErrorCode != ""00"")
				{
					TheApplication().RaiseErrorText(vErrorMsg);
				}
			}
			return (CancelOperation);  
			break;
		}
		default:
			break;
	}
	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
 if (MethodName == ""SetEDLinkCtxt"") 

{ 
       CanInvoke = ""TRUE""; 

        return(CancelOperation)

} 
 return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	
	if(MethodName == ""NotifyCallCenter"")
	{
			var appObj = TheApplication();
			var sCampId = this.BusComp().GetFieldValue(""Id"");
			var psInputs = appObj.NewPropertySet();
			var psOutputs = appObj.NewPropertySet();
			var svcbsService = appObj.GetService(""Workflow Process Manager"");
			psInputs.SetProperty(""ProcessName"", ""STC Campaign Mgmt email template"");
			psInputs.SetProperty(""Object Id"",sCampId);
			svcbsService.InvokeMethod(""RunProcess"", psInputs, psOutputs);
			return(CancelOperation);
		}

	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if (MethodName == ""STCCampaignApprove"")
	{
		if (this.BusComp().GetFieldValue(""Approval Status"") == """")
		{
			CanInvoke = ""TRUE"";
			return(CancelOperation);
		}
	}

	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	if (MethodName == ""STCCampaignApprove"")
	{
		var sBC:BusComp = this.BusComp();
		//var ApprStatus = sBC.GetFieldValue(""Approval Status"");
        var vId = sBC.GetFieldValue(""Id"");
        var vName = sBC.GetFieldValue(""Name"");
        var sId = TheApplication().LoginId();

        var svc1:Service = TheApplication().GetService(""Campaign Approval Process"");
		var Input:PropertySet = TheApplication().NewPropertySet();
		var Output:PropertySet = TheApplication().NewPropertySet();
		Input.SetProperty(""CampaignId"",vId); // Input Agruments
		Input.SetProperty(""CampaignName"",vName); // Input Agruments
		Input.SetProperty(""LoginId"",sId); // Input Agruments
		svc1.InvokeMethod(""Approval"", Input, Output);  
        this.BusComp().InvokeMethod(""RefreshRecord"");

		return(CancelOperation);
	}
	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var strOwnerId = """";
	if(MethodName == ""STCAssignMe"")
	{
		this.BusComp().ActivateField(""STC Owner Id"");
		
		strOwnerId = this.BusComp().GetFieldValue(""STC Owner Id"");

		if(strOwnerId == """")
		{
		CanInvoke = ""TRUE"";
		return (CancelOperation);
		}
	}
	
	if(MethodName == ""OnCreateResponseClicked"")
	{
		this.BusComp().ActivateField(""STC Owner Id"");
		
		strOwnerId = this.BusComp().GetFieldValue(""STC Owner Id"");

		if(strOwnerId != """")
		{
		CanInvoke = ""TRUE"";
		return (CancelOperation);
		}
		else
		{
		CanInvoke = ""FALSE"";
		return (CancelOperation);
		}
	}
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	
	if(MethodName == ""STCAssignMe"")
	{
	var appObj = TheApplication();
	var strCurrLogin = appObj.LoginId();
	var strBC = this.BusComp();
	strBC.ActivateField(""STC Owner Id"");
	strBC.SetFieldValue(""STC Owner Id"",strCurrLogin);
	strBC.WriteRecord();
	return (CancelOperation);
	}

	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var strOwnerId = """";
	if(MethodName == ""STCAssignMe"")
	{
		this.BusComp().ActivateField(""STC Owner Id"");
		
		strOwnerId = this.BusComp().GetFieldValue(""STC Owner Id"");

		if(strOwnerId == """")
		{
		CanInvoke = ""TRUE"";
		return (CancelOperation);
		}
	}
	
	if(MethodName == ""OnCreateResponseClicked"")
	{
		this.BusComp().ActivateField(""STC Owner Id"");
		
		strOwnerId = this.BusComp().GetFieldValue(""STC Owner Id"");

		if(strOwnerId != """")
		{
		CanInvoke = ""TRUE"";
		return (CancelOperation);
		}
		else
		{
		CanInvoke = ""FALSE"";
		return (CancelOperation);
		}
	}
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	
	if(MethodName == ""STCAssignMe"")
	{
	var appObj = TheApplication();
	var strCurrLogin = appObj.LoginId();
	var strBC = this.BusComp();
	strBC.ActivateField(""STC Owner Id"");
	strBC.SetFieldValue(""STC Owner Id"",strCurrLogin);
	strBC.WriteRecord();
	return (CancelOperation);
	}

	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var strOwnerId = """";
	if(MethodName == ""STCAssignMe"")
	{
		this.BusComp().ActivateField(""STC Owner Id"");
		
		strOwnerId = this.BusComp().GetFieldValue(""STC Owner Id"");

		if(strOwnerId == """")
		{
		CanInvoke = ""TRUE"";
		return (CancelOperation);
		}
	}
	
	if(MethodName == ""OnCreateResponseClicked"")
	{
		this.BusComp().ActivateField(""STC Owner Id"");
		
		strOwnerId = this.BusComp().GetFieldValue(""STC Owner Id"");

		if(strOwnerId != """")
		{
		CanInvoke = ""TRUE"";
		return (CancelOperation);
		}
		else
		{
		CanInvoke = ""FALSE"";
		return (CancelOperation);
		}
	}
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	
	if(MethodName == ""STCAssignMe"")
	{
	var appObj = TheApplication();
	var strCurrLogin = appObj.LoginId();
	var strBC = this.BusComp();
	strBC.ActivateField(""STC Owner Id"");
	strBC.SetFieldValue(""STC Owner Id"",strCurrLogin);
	strBC.WriteRecord();
	return (CancelOperation);
	}

	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var strOwnerId = """";
	if(MethodName == ""STCAssignMe"")
	{
		this.BusComp().ActivateField(""STC Owner Id"");
		
		strOwnerId = this.BusComp().GetFieldValue(""STC Owner Id"");

		if(strOwnerId == """")
		{
		CanInvoke = ""TRUE"";
		return (CancelOperation);
		}
	}
	
	if(MethodName == ""OnCreateResponseClicked"")
	{
		this.BusComp().ActivateField(""STC Owner Id"");
		
		strOwnerId = this.BusComp().GetFieldValue(""STC Owner Id"");

		if(strOwnerId != """")
		{
		CanInvoke = ""TRUE"";
		return (CancelOperation);
		}
		else
		{
		CanInvoke = ""FALSE"";
		return (CancelOperation);
		}
	}
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	
	if(MethodName == ""STCAssignMe"")
	{
	var appObj = TheApplication();
	var strCurrLogin = appObj.LoginId();
	var strBC = this.BusComp();
	strBC.ActivateField(""STC Owner Id"");
	strBC.SetFieldValue(""STC Owner Id"",strCurrLogin);
	strBC.WriteRecord();
	return (CancelOperation);
	}

	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	if(MethodName == ""DeleteRecord"" || MethodName == ""CopyRecord"" || MethodName == ""NewRecord"" || MethodName == ""NewQuery"" || MethodName == ""RefineQuery"")
	{
		return(CancelOperation);			
	}
	
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	if(MethodName == ""DeleteRecord"" || MethodName == ""CopyRecord"" || MethodName == ""NewRecord"" || MethodName == ""NewQuery"" || MethodName == ""RefineQuery"")
	{
		return(CancelOperation);			
	}
	
	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if ( MethodName == ""TestClick"" )
	{
		CanInvoke = ""TRUE"";
    	return( CancelOperation );
	}
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	if(MethodName == ""TestClick"")
	{
		//Smart Script Player View (eApps)
		TheApplication().InvokeMethod(""RunSmartScript"", ""PPR Partner Program Application"","""",""ENU"",""USD"",""PPR SmartScript Player View"", ""PPR SmartScript Player Applet"");
		return (CancelOperation);
	}
	return (ContinueOperation);
}
function WebApplet_Load ()
{
	var RecId = TheApplication().GetProfileAttr(""RecId"");
	var BC = this.BusComp();
	if(RecId != """" || RecId != ""No Match Row Id"")
	{ 
		with(BC)
		{
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Id"",RecId);
			ExecuteQuery(ForwardOnly);
		}
	}
}
function WebApplet_PreInvokeMethod (MethodName)
{
if( MethodName == ""CreateRecord"" && this.BusComp().ParentBusComp().Name() == ""CUT Invoice Sub Accounts"" )
	{
		this.BusComp().SetFieldValue(""SSA Primary Field"", ""Y""); 
		var IsCreateRecord = true;
		this.BusComp().WriteRecord();
	}
		return (ContinueOperation); 
}
"//Your public declarations go here...  
var vCheckPrePost = """"; // Anchal: Added for SD_Retail Provisioning User Interface Enhancements
var vPackageType = """"; //Gurur : Added for CRM System Feature Enhancements"
function CreateAndAutoPopulate(vWorkflowName)
{
	var psInputs, psOutputs, svcBusSrv, appObj;
	var sCustAccountId, sType, sParent, sBlacklist;
	var IDType = """";
	var sWriteOffStopPOrderFlg = ""N"",sCustSegment = """",sUser = """",sVIPUser = """",sWriteOffStatusAllowFlg;//Mayank(09/01/2019)-- Added for WriteOff
	var sWriteOffStatusFlag = """"; // [Hardik:23July2020:WriteOffAutomation]
	try
	{
		DataCaptureValidations();//[MANUJ] : [Email Data Capture] : [05/10/2017]
		appObj = TheApplication();
		psInputs = appObj.NewPropertySet();
		psOutputs = appObj.NewPropertySet();
		sParent = this.BusComp().ParentBusComp();
		with(sParent)
		{
			ActivateField(""STC Black List""); 
			//Mayank(09/01/2019)-- Added for WriteOff ---- START----
			ActivateField(""STCWriteOffStopPOrder"");
			ActivateField(""STC Contract Category"");
			ActivateField(""STCWriteOffAllowedCalc"");
			ActivateField(""STCWriteOffOtherStatusCalc""); // [Hardik:23July2020:WriteOffAutomation]
			sWriteOffStatusFlag = GetFieldValue(""STCWriteOffOtherStatusCalc""); // [Hardik:23July2020:WriteOffAutomation]
			sWriteOffStatusAllowFlg = GetFieldValue(""STCWriteOffAllowedCalc"");
			sCustSegment = GetFieldValue(""STC Contract Category"");
			sWriteOffStopPOrderFlg = GetFieldValue(""STCWriteOffStopPOrder"");
			//Mayank(09/01/2019)-- Added for WriteOff ---- STOP----
			sCustAccountId = GetFieldValue(""Id"");
			sType = GetFieldValue(""Type"");
			sBlacklist=GetFieldValue(""STC Black List"");
			IDType=GetFieldValue(""Survey Type"");//[MANUJ] : [Refund_Deposit]
		}
		if(sBlacklist!="""")
		{ 
		 var sErrorMsg=""Please ask the customer to check the validity of their CPR with the Central Informatics Organization"";
		//TheApplication().RaiseErrorText(""Please ask the customer to check the validity of their CPR with the Central Informatics Organization. If customer is a foreigner, have them check with the LMRA"");
		sErrorMsg+=""If customer is a foreigner, have them check with the LMRA"";
		TheApplication().RaiseErrorText(sErrorMsg); 
		}
		if(sType == appObj.InvokeMethod(""LookupValue"",""STC_CUST_TYPE"",""Corporate""))
		{
		 	with(this.BusComp())
		 	{
		 	ActivateField(""Master Account Id"");
		    ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Master Account Id"", sCustAccountId);
			ExecuteQuery(ForwardOnly);	
				if(FirstRecord())
				{
					appObj.RaiseErrorText(""Corporate Billing Account already exists for this Customer"");
				}
			}
		}	   
		
		if(sType == appObj.InvokeMethod(""LookupValue"",""STC_CUST_TYPE"",""SME""))
		{
		 	with(this.BusComp())
		 	{
		 	ActivateField(""Master Account Id"");
		    ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Master Account Id"", sCustAccountId);
			ExecuteQuery(ForwardOnly);	
				if(FirstRecord())
				{
					appObj.RaiseErrorText(""Corporate Billing Account already exists for this Customer"");
				}
			}
		}
		if(vCheckPrePost == ""Postpaid"")
		{
			this.BusComp().ActivateField(""STC Master Account Legal Status"");
			var sCustLegalStat = """";
			sCustLegalStat = this.BusComp().GetFieldValue(""STC Master Account Legal Status"");
			if(sCustLegalStat != """" && sCustLegalStat != null)
			{
				appObj.RaiseErrorText(""This Operation is not allowed because customer has Legal Fees/Travel BAN applicable"");
			}
		}
		//[MANUJ] : [Deposit_Refund]
		if(sType == ""Individual"" && vCheckPrePost == ""Postpaid"" && vWorkflowName == ""STC Create Prepaid Postpaid Customer WF"")//[MANUJ] : [Refund_Deposit]
		{
			var CurIDValue = TheApplication().InvokeMethod(""LookupValue"", ""STC_DEP_NATIONALITY_CHECK"", IDType);
			var sub_strng = CurIDValue.substr( 0,6 );
			if(sub_strng == ""TARGET"")
			{
				NationalityCheck(sCustAccountId);
			}
		}
		//Mayank(09/01/2019)-- Added for WriteOff ---- START ----------
		if(sWriteOffStopPOrderFlg == ""Y"")
		{
			if(sType == ""Individual"" && vCheckPrePost == ""Postpaid"" && sCustSegment == ""Individual"" && vWorkflowName == ""STC Create Prepaid Postpaid Customer WF"")
			{
				if (sWriteOffStatusFlag == ""Y"") ///[Hardik:23July2020:WriteOffAutomation] Started -------
					{
							appObj.RaiseErrorText(""Write-off flag is active, please clear the old balances and raise SR for CCC Approval."");
					}
					else
					{
					  var A =1;
					}
				//appObj.RaiseErrorText(""Write-off flag is active, please clear the old balances and raise SR for CCC Approval."");
			}
			else if(sType == ""Individual"" && vCheckPrePost == ""Postpaid"" && (sCustSegment == ""A"" || sCustSegment == ""B"" || sCustSegment == ""C"" || sCustSegment == ""D"") && vWorkflowName == ""STC Create Prepaid Postpaid Customer WF"")
			{
				sUser = appObj.LoginName();
				sVIPUser = appObj.InvokeMethod(""LookupValue"", ""STC_VIP_WRITEOFF_ALLOW"", sUser);
				sVIPUser = sVIPUser.substring(0,5);
				if(sVIPUser == ""ALLOW"" && sWriteOffStatusAllowFlg == ""Y"")
				{
					var A=1;
				}
				else
				{
					if (sWriteOffStatusFlag == ""Y"") ///[Hardik:23July2020:WriteOffAutomation] Started -------
						{
							appObj.RaiseErrorText(""Write-off flag is active, please clear the old balances and raise SR for CCC Approval."");
							
						}  ///[Hardik:23July2020:WriteOffAutomation] Started -------
					else    ///[Hardik:23July2020:WriteOffAutomation] Started -------
						{
					      var A=1;
						}
					//appObj.RaiseErrorText(""Write-off flag is active, please clear the old balances and raise SR for CCC Approval."");
				}
			}
		}//Mayank(09/01/2019)-- Added for WriteOff ---- STOP ----------
		
		with(psInputs)
		{
			SetProperty(""Object Id"",sCustAccountId);
			SetProperty(""OnlyBACreate"",""Y"");
			SetProperty(""OnlyCustCreate"",""N"");
			//Guru Updated for System Feature Enhancement - [28-Nov-2019]~~~~~~~~~~~~Start~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			/*if(vWorkflowName == ""STC Create Prepaid Postpaid Customer WF"") // Anchal: Added for SD_Retail Provisioning User Interface Enhancements 
			{
				SetProperty(""BillAccType"",vCheckPrePost);
			}*/
			//SetProperty(""ProcessName"", ""STC Create New Customer"");
			if(vWorkflowName == ""STC Create Prepaid Postpaid Customer WF"" && vPackageType.length < 1)
			{
				SetProperty(""BillAccType"",vCheckPrePost);
			}
			else if (vWorkflowName == ""STC Create Prepaid Postpaid Customer WF"" && vPackageType.length > 0)
			{
				SetProperty(""BillAccType"",vCheckPrePost);
				SetProperty(""vPackageType"",vPackageType);
			}
			//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~End~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			SetProperty(""ProcessName"",vWorkflowName); // Anchal: Modified to call a different WF for SD_Retail Provisioning User Interface Enhancements
		}
		svcBusSrv = appObj.GetService(""Workflow Process Manager"");
		svcBusSrv.InvokeMethod(""RunProcess"",psInputs,psOutputs);
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
		psInputs = null;
	 	psOutputs = null;
		svcBusSrv = null;
		appObj= null;
	}
}
function DataCaptureValidations()
{

		var appObj = TheApplication();
		var psInputs = appObj.NewPropertySet();
		var psOutputs = appObj.NewPropertySet();
		var sParent = this.BusComp().ParentBusComp();
		var sCustAccountId = """", svcBusSrv = """", AccountId = """";
		AccountId = this.BusComp().GetFieldValue(""Id"");
	/*	with(sParent)
		{
		sCustAccountId = GetFieldValue(""Id"");
		}*/
		with(psInputs)
		{
			SetProperty(""Object Id"",AccountId);
			SetProperty(""Operation"",""ALTERNATENUMBER"");
			SetProperty(""ProcessName"",""STC Validate Primary Contact Details"");
		}

		svcBusSrv = appObj.GetService(""Workflow Process Manager"");
		svcBusSrv.InvokeMethod(""RunProcess"",psInputs,psOutputs);
		var ValidAlternateNo = psOutputs.GetProperty(""ValidAlternateNo"");
		var ErrorMessage = psOutputs.GetProperty(""Error Message"");
		if(ValidAlternateNo == ""N"")
		{
		TheApplication().RaiseErrorText(ErrorMessage);
		}



}
function NationalityCheck(CustomerId)
{
//***********************************************************************************************************//
//[MANUJ] : [Refund & Deposit Functionality]
try
{
	var appObj;
	var bsValidCustomer;
	var sErrorCode;
	var sErrorMsg;

		appObj = TheApplication();
		with(appObj)
		{   
			var psInputsDep = NewPropertySet();
			var psOutputsDep = NewPropertySet();		
			psInputsDep.SetProperty(""ProcessName"", ""STC Deposit Operations WF"");
			psInputsDep.SetProperty(""CustomerId"", CustomerId);
			psInputsDep.SetProperty(""Operation"", ""NATIONALITY MATCH"");
			bsValidCustomer = GetService(""Workflow Process Manager"");
			bsValidCustomer.InvokeMethod(""RunProcess"",psInputsDep, psOutputsDep);		
			sErrorCode = psOutputsDep.GetProperty(""Error Code"");
			sErrorMsg = psOutputsDep.GetProperty(""Error Message"");
			if((sErrorCode !="""" && sErrorCode != null) || (sErrorMsg!="""" && sErrorMsg!=null))
			{
				TheApplication().RaiseErrorText(sErrorMsg);
			}
			
			
			
		} 
	
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
		psInputsDep = null;
		psOutputsDep = null;
		bsValidCustomer = null;
		appObj = null;
	}
}
function WebApplet_Load ()
{
TheApplication().SetProfileAttr(""MinorAutopoulate"",""N"");
TheApplication().SetProfileAttr(""MinorPrepaidPostpaid"",""N"");
TheApplication().SetProfileAttr(""MinorPrepaid"",""N"");
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{

	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	var ireturn;
	try
	{
		ireturn = ContinueOperation;
		var vWorkflowName = """";
		switch(MethodName)
		{
			case ""CreateAndAutoPopulate"":
				vWorkflowName = ""STC Create New Customer"";
				TheApplication().SetProfileAttr(""MinorAutopoulate"",""Y"");//[Guardian Minor SD]
				CreateAndAutoPopulate(vWorkflowName);
				ireturn = CancelOperation;
				break;
			
			case ""CreatePostpaidBillAcc"": // Anchal: Added for SD_Retail Provisioning User Interface Enhancements 
				vCheckPrePost = ""Postpaid"";
				vWorkflowName = ""STC Create Prepaid Postpaid Customer WF"";
				TheApplication().SetProfileAttr(""MinorPrepaidPostpaid"",""Y"");//[Guardian Minor SD]
				CreateAndAutoPopulate(vWorkflowName);
				ireturn = CancelOperation;
				break;
				
			case ""CreatePrepaidBillAcc"": // Anchal: Added for SD_Retail Provisioning User Interface Enhancements 
				vCheckPrePost = ""Prepaid"";
				vWorkflowName = ""STC Create Prepaid Postpaid Customer WF"";
				TheApplication().SetProfileAttr(""MinorPrepaid"",""Y"");//[Guardian Minor SD]
				CreateAndAutoPopulate(vWorkflowName);
				ireturn = CancelOperation;
				break;
			//Gurur Added for system feature enhancement [28-Nov-2019]
			case ""CreatePostpaidVoiceBillAcc"": 
				vCheckPrePost = ""Postpaid"";
				vPackageType = ""Voice"";
				vWorkflowName = ""STC Create Prepaid Postpaid Customer WF"";
				TheApplication().SetProfileAttr(""MinorPrepaidPostpaid"",""Y"");//[Guardian Minor SD]
				CreateAndAutoPopulate(vWorkflowName);
				ireturn = CancelOperation;
				break;

			case ""CreatePrepaidVoiceBillingAcc"": 
				vCheckPrePost = ""Prepaid"";
				vPackageType = ""Voice"";
				vWorkflowName = ""STC Create Prepaid Postpaid Customer WF"";
				TheApplication().SetProfileAttr(""MinorPrepaid"",""Y"");//[Guardian Minor SD]
				CreateAndAutoPopulate(vWorkflowName);
				ireturn = CancelOperation;
				break;

			case ""CreatePrepaidBBBillAcc"": 
				vCheckPrePost = ""Prepaid"";
				vPackageType = ""BroadBand""
				vWorkflowName = ""STC Create Prepaid Postpaid Customer WF"";
				TheApplication().SetProfileAttr(""MinorPrepaidPostpaid"",""Y"");//[Guardian Minor SD]
				CreateAndAutoPopulate(vWorkflowName);
				ireturn = CancelOperation;
				break;
			
			case ""CreatePostpaidBBBillAcc"": 
				vCheckPrePost = ""Postpaid"";
				vPackageType = ""BroadBand""
				vWorkflowName = ""STC Create Prepaid Postpaid Customer WF"";
				TheApplication().SetProfileAttr(""MinorPrepaidPostpaid"",""Y"");//[Guardian Minor SD]
				CreateAndAutoPopulate(vWorkflowName);
				ireturn = CancelOperation;
				break;

			default:
				ireturn = ContinueOperation;
				break;
		}	
		return (ireturn);
	}
	catch(e)
	{
		TheApplication().RaiseErrorText(e.errText);
	
	}
	finally
	{
	}
}
function CreateAndAutoPopulate()
{
	var psInputs;
	var psOutputs;
	var svcBusSrv;
	var appObj;
	var sCustAccountId;
	var sType;
	var sParent;
	var sBlacklist;
	
	try
	{
		appObj = TheApplication();
		psInputs = appObj.NewPropertySet();
		psOutputs = appObj.NewPropertySet();
		sParent = this.BusComp().ParentBusComp();
		with(sParent)
		{
		ActivateField(""STC Black List""); 
		sCustAccountId = GetFieldValue(""Id"");
		sType = GetFieldValue(""Type"");
		sBlacklist=GetFieldValue(""STC Black List"");
		}
		
		if(sBlacklist!="""")
		{ 
		 var sErrorMsg=""Please ask the customer to check the validity of their CPR with the Central Informatics Organization"";
		//TheApplication().RaiseErrorText(""Please ask the customer to check the validity of their CPR with the Central Informatics Organization. If customer is a foreigner, have them check with the LMRA"");
		sErrorMsg+=""If customer is a foreigner, have them check with the LMRA"";
		TheApplication().RaiseErrorText(sErrorMsg); 
		}
		
		
		if(sType == appObj.InvokeMethod(""LookupValue"",""STC_CUST_TYPE"",""Corporate""))
		{
		 	with(this.BusComp())
		 	{
		 	ActivateField(""Master Account Id"");
		    ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Master Account Id"", sCustAccountId);
			ExecuteQuery(ForwardOnly);	
				if(FirstRecord())
				{
					appObj.RaiseErrorText(""Corporate Billing Account already exists for this Customer"");
				}
			}
		}	   
		
		if(sType == appObj.InvokeMethod(""LookupValue"",""STC_CUST_TYPE"",""SME""))
		{
		 	with(this.BusComp())
		 	{
		 	ActivateField(""Master Account Id"");
		    ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Master Account Id"", sCustAccountId);
			ExecuteQuery(ForwardOnly);	
				if(FirstRecord())
				{
					appObj.RaiseErrorText(""Corporate Billing Account already exists for this Customer"");
				}
			}
		}	
		with(psInputs)
		{
			SetProperty(""Object Id"",sCustAccountId);
			SetProperty(""OnlyBACreate"",""Y"");
			SetProperty(""OnlyCustCreate"",""N"");
			SetProperty(""ProcessName"", ""STC Create New Customer"");
		}
		svcBusSrv = appObj.GetService(""Workflow Process Manager"");
		svcBusSrv.InvokeMethod(""RunProcess"",psInputs,psOutputs);
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
		psInputs = null;
	 	psOutputs = null;
		svcBusSrv = null;
		appObj= null;
	}
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{

	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	var ireturn;
	try
	{
		ireturn = ContinueOperation;
		switch(MethodName)
		{
			case ""CreateAndAutoPopulate"":
				CreateAndAutoPopulate();
				ireturn = CancelOperation;
				break;
			default:
				ireturn = ContinueOperation;
				break;
		}	
		return (ireturn);
	}
	catch(e)
	{
		TheApplication().RaiseErrorText(e.errText);
	
	}
	finally
	{
	}
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{

	var activeView = TheApplication().ActiveViewName();
	if((activeView == ""Com Sub Account View"") && (MethodName == ""NewRecord""))
	{
	    CanInvoke = ""FALSE"";
	    return(CancelOperation);
	}   


	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
   	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
   return (ContinueOperation);
}
"//Sharath: Added for RDynamic DIA
function WebApplet_PreInvokeMethod (MethodName)
{
	switch(MethodName)
	{
		case ""InvokeImport"":
		try
		{
			var appobj: Application = TheApplication();
			//appobj.SetProfileAttr(""STCAPNId"", this.BusComp().GetFieldValue(""Id""));
			//appobj.SetProfileAttr(""STCAPNName"", this.BusComp().GetFieldValue(""Apn Name""));
			//appobj.SetProfileAttr(""STCAPNType"", this.BusComp().GetFieldValue(""APN Type""));
			//appobj.SetProfileAttr(""STCIPType"", this.BusComp().GetFieldValue(""IP Type""));
			//appobj.SetProfileAttr(""STCTemplateId"", this.BusComp().GetFieldValue(""APN Template Id""));//Prod fix
			//appobj.SetProfileAttr(""STCCNTX"", this.BusComp().GetFieldValue(""APN CNTX Id""));//Prod fix
			var oServiceAF: Service = appobj.GetService(""SLM Save List Service"");
			var inputPropAF: PropertySet = appobj.NewPropertySet();
			var outputPropAF: PropertySet = appobj.NewPropertySet();
			inputPropAF.SetProperty(""Applet Name"",""STC DIA IP Import Applet"");
			inputPropAF.SetProperty(""Applet Mode"",""3"");
			inputPropAF.SetProperty(""Applet Height"", ""1000"");
			inputPropAF.SetProperty(""Applet Width"", ""1000"");
			oServiceAF.InvokeMethod(""LoadPopupApplet"", inputPropAF, outputPropAF);					
		}
		finally
		{
			appobj = null;
			oServiceAF =  null;
			inputPropAF = null;
			outputPropAF = null;
		}
		return(CancelOperation);
		break;

				
		default:
		break;
	}
	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{  
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	return (ContinueOperation);
}
function WebApplet_InvokeMethod (MethodName)
{

}
function WebApplet_PreInvokeMethod (MethodName)
{
	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if(MethodName == ""AddSelectedItems""){
		CanInvoke = ""TRUE"";
		return(CancelOperation);
	}	
	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if(MethodName == ""OrderTemplate""){
		CanInvoke = ""TRUE"";
		return(CancelOperation);
	}
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	return (ContinueOperation);
}
function WebApplet_InvokeMethod (MethodName)
{

  //  if this is a copy process, for a line item,
  //  we need to invoke the Oracle copy business Service
  //  which will make the call to copy the corresponding
  //  configuration in Oracle and then update the lines
  //  in Siebel with the Configuration Header and Rev Number
 
 if (MethodName == ""CopyRecord"") 
 {
	  try 
	  {
		var busObj = this.BusObject();
		var busComp = this.BusComp();
		var sourceConfigHeader =  busComp.GetFieldValue(""External Configurator Reference 1"");
		var sourceConfigRevNbr = busComp.GetFieldValue(""External Configurator Reference 2"");
		var agreementId = busComp.GetFieldValue(""Agreement Id"");
		var prodId = busComp.GetFieldValue(""Root Product Id"");
		var rootAgreementItemId = busComp.GetFieldValue(""Root Agreement Item Id"");
		
		var invItemId = busComp.GetFieldValue(""External Inventory System Ref"");

		var isOCPi = TheApplication().NewPropertySet();
     	var isOCPo = TheApplication().NewPropertySet();
  	    var bOracleProduct ;
											
		var productId = busComp.GetFieldValue(""Product Id"");
		
		//isOCPi.SetProperty(""BusCompName"",busComp.Name())
		isOCPi.SetProperty(""ProductId"",productId);
			
		var isOCPSvc = TheApplication().GetService(""CZSessionManagement"");
		isOCPSvc.InvokeMethod(""IsOracleConfigurableProduct"", isOCPi, isOCPo);
		
		bOracleProduct = isOCPo.GetProperty(""IsOracleProduct"");
		
		
		if (bOracleProduct == ""true"")
		{
			try
			{
				var indata1 =TheApplication().NewPropertySet ();
				var outdata1 = TheApplication().NewPropertySet ();
				indata1.SetProperty (""RootItemId"", rootAgreementItemId);
				indata1.SetProperty (""QuoteorOrderorAgreementId"", agreementId);
				indata1.SetProperty(""SourceConfigHeader"",sourceConfigHeader);
				indata1.SetProperty(""SourceConfigRevNbr"",sourceConfigRevNbr);
				indata1.SetProperty(""BusinessObject"",busObj.Name());
				indata1.SetProperty(""BusinessComponent"",busComp.Name());
										
				var svc1 = TheApplication().GetService(""CZIntegCopyConfigService"");
				svc1.InvokeMethod(""CopyOracleConfiguration"", indata1, outdata1);
				
				var destConfigRevNbr = outdata1.GetProperty(""DestConfigRevNbr"");
				var destConfigHeader = outdata1.GetProperty(""DestConfigHeader"");
				
			}
			catch  (e) 
			{
				TheApplication().Trace(e.toString());
				var error = e.toString();
				TheApplication().RaiseErrorText(e.toString());
				throw e;
			}
			finally
			{
			//for the root item
				busComp.SetFieldValue(""External Configurator Reference 1"",destConfigHeader);
				busComp.SetFieldValue(""External Configurator Reference 2"",destConfigRevNbr );
				
				destConfigRevNbr = null;
				destConfigHeader = null;
				indata1 = null;
				svc1 = null;
			}
		} //  end if (bOracleProduct)
		}
		catch  (e) 
		{
			TheApplication().RaiseErrorText(e.toString());
			TheApplication().Trace(e.toString());
			var error = e.toString();
			throw e;
		}
		finally 
		{
			if (busObj != null) { busObj = null;}
			if (busComp != null) {busComp = null;}
			bOracleProduct = null;
			isOCPi = null;
			isOCPo = null;
			isOCPSvc = null;
			sourceConfigHeader =  null;
			sourceConfigRevNbr = null;
			agreementId = null;
			prodId = null;
			rootAgreementItemId = null;
		
		}
} // end if (MethodName == ""CopyRecord"")


}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{  
	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{

	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if( MethodName == ""TerminateMembership"")
	{
		if( this.BusComp().GetFieldValue(""Status"") == ""Closed"" )
		{
			CanInvoke = ""FALSE"";
		}
		else
		{
			CanInvoke = ""TRUE"";
		}
		return (CancelOperation);
	}
	return (ContinueOperation);
}
function CreateRegistrationForm(Inputs, Outputs)
{
var actBusComp,actBusObj;
	var msisdn = Inputs.GetProperty(""MSISDN"");
	var RegType = Inputs.GetProperty(""RegType"");
	var vContactId = null, vCustAccntId = null, vAddrId = null;
	var objAccntBusObj, objAccntBusComp, objConBusComp, objAddrBusComp;
	
	var objAppln = TheApplication();
	actBusObj		= objAppln.GetBusObject(""LOY Member"");
	actBusComp		= actBusObj.GetBusComp(""LOY Member VBC"");
	objAccntBusComp = objAppln.GetBusObject(""Account"").GetBusComp(""Account"");
	objConBusComp	= objAppln.GetBusObject(""Contact"").GetBusComp(""Contact"");
	objAddrBusComp	= objAppln.GetBusObject(""CUT Address"").GetBusComp(""CUT Address"");
	actBusComp.NewRecord(NewAfter);
	actBusComp.SetFieldValue(""MSISDN"", msisdn );
	actBusComp.SetFieldValue(""Attr 2"", RegType );
	actBusComp.SetFieldValue(""Program Name"", objAppln.InvokeMethod(""LookupValue"", ""STC_LOY_DEFAULT"", ""DEFAULT_PROGRAM_NAME""));
	actBusComp.SetFieldValue(""Tier"", objAppln.InvokeMethod(""LookupValue"", ""LOY_LOUNGE_CD"", ""1""));
	
	with(objAccntBusComp) // Get Account Details
	{
		ActivateField(""Primary Contact Id"");
		ActivateField(""Primary Address Id"");
		ActivateField(""Master Account Id"");
		ActivateField(""Name"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchExpr(""[DUNS Number] = '""+msisdn+""' AND [Account Type Code] = 'Service' AND [Account Status] = 'Active'"");
		ExecuteQuery(ForwardOnly);
		if( FirstRecord() )
		{
			vContactId	= GetFieldValue(""Primary Contact Id"");
			vAddrId		= GetFieldValue(""Primary Address Id"");
			vCustAccntId	= GetFieldValue(""Master Account Id"");
			
			actBusComp.SetFieldValue(""Account Id"", GetFieldValue(""Id"")); //
			actBusComp.SetFieldValue(""Name"", GetFieldValue(""Name"") ); // Set Name
		}
	}
	
	with(objAccntBusComp)
	{
		ActivateField(""Survey Type"");
		ActivateField(""Tax ID Number"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"", vCustAccntId );
		ExecuteQuery(ForwardOnly);
		if( FirstRecord() )
		{
			actBusComp.SetFieldValue(""ID Type"", GetFieldValue(""Survey Type""));		//
			actBusComp.SetFieldValue(""ID#"", GetFieldValue(""Tax ID Number""));	//
		}
	}
	objAccntBusComp=null;
	
	with(objConBusComp)
	{
		ActivateField(""M/M"");
		ActivateField(""First Name"");
		ActivateField(""Middle Name"");
		ActivateField(""Last Name"");
		ActivateField(""Date of Birth"");
		ActivateField(""Email Address"");
		ActivateField(""M/F"");
		ActivateField(""Work Phone #"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"", vContactId);
		ExecuteQuery(ForwardOnly);
		if( FirstRecord())
		{
			actBusComp.SetFieldValue(""Title"", GetFieldValue(""M/M"") );
			actBusComp.SetFieldValue(""First Name"", GetFieldValue(""First Name"") );
			actBusComp.SetFieldValue(""Middle Name"", GetFieldValue(""Middle Name"") );
			actBusComp.SetFieldValue(""Last Name"", GetFieldValue(""Last Name"") );
			actBusComp.SetFieldValue(""Gender"", GetFieldValue(""M/F"") );
			actBusComp.SetFieldValue(""Date Of Birth"", GetFieldValue(""Date of Birth"") );
			actBusComp.SetFieldValue(""Email Address"", GetFieldValue(""Email Address"") );
			actBusComp.SetFieldValue(""Work Phone"", GetFieldValue(""Work Phone #"") );
			actBusComp.SetFieldValue(""Contact Id"", vContactId );		
		}
	}
	objConBusComp=null;
	
	with(objAddrBusComp)
	{
		ActivateField(""Apartment Number"");
		ActivateField(""Building No"");
		ActivateField(""STC Road No"");
		ActivateField(""Block No"");
		ActivateField(""Postal Code"")
		ActivateField(""City"");
		ActivateField(""State"");
		ActivateField(""Address Name"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"", vAddrId );
		ExecuteQuery(ForwardOnly);
		if( FirstRecord() )
		{
			actBusComp.SetFieldValue(""Flat No"", GetFieldValue(""Apartment Number"") );
			actBusComp.SetFieldValue(""Building Name"", GetFieldValue(""Building No"") );
			actBusComp.SetFieldValue(""Road No"", GetFieldValue(""STC Road No"") );
			actBusComp.SetFieldValue(""Block No"", GetFieldValue(""Block No"") ); 
			actBusComp.SetFieldValue(""Postal Code"", GetFieldValue(""Postal Code""));
			actBusComp.SetFieldValue(""Governorate"", GetFieldValue(""State"") );
			actBusComp.SetFieldValue(""City"", GetFieldValue(""City"") );
			actBusComp.SetFieldValue(""Country"", ""Bahrain"" );
			actBusComp.SetFieldValue(""Address"", vAddrId );
		}
	}
	objAddrBusComp=null;
	
	actBusComp.WriteRecord();
	objAccntBusObj  = null;
	objAccntBusComp = null;
	objConBusComp	= null;
	objAddrBusComp	= null;
	objAppln.GotoView(""STC LOY Member Registration View"", actBusObj);

	return (CancelOperation);
}
function CreateRegistrationForm(Inputs, Outputs)
{
var actBusComp,actBusObj;
	var msisdn = Inputs.GetProperty(""MSISDN"");
	var RegType = Inputs.GetProperty(""RegType"");
	var vContactId = null, vCustAccntId = null, vAddrId = null;
	var objAccntBusObj, objAccntBusComp, objConBusComp, objAddrBusComp;
	
	var objAppln = TheApplication();
	actBusObj		= objAppln.GetBusObject(""LOY Member"");
	actBusComp		= actBusObj.GetBusComp(""LOY Member VBC"");
	objAccntBusComp = objAppln.GetBusObject(""Account"").GetBusComp(""Account"");
	objConBusComp	= objAppln.GetBusObject(""Contact"").GetBusComp(""Contact"");
	objAddrBusComp	= objAppln.GetBusObject(""CUT Address"").GetBusComp(""CUT Address"");
	actBusComp.NewRecord(NewAfter);
	actBusComp.SetFieldValue(""MSISDN"", msisdn );
	actBusComp.SetFieldValue(""Attr 2"", RegType );
	actBusComp.SetFieldValue(""Program Name"", objAppln.InvokeMethod(""LookupValue"", ""STC_LOY_DEFAULT"", ""DEFAULT_PROGRAM_NAME""));
	//actBusComp.SetFieldValue(""Tier"", objAppln.InvokeMethod(""LookupValue"", ""LOY_LOUNGE_CD"", ""1""));
	actBusComp.SetFieldValue(""Tier"", objAppln.InvokeMethod(""LookupValue"", ""LOY_LOUNGE_CD"", ""2"")); //abuzar:16Nov2020:SD-Revamping stc Rewards
	
	with(objAccntBusComp) // Get Account Details
	{
		ActivateField(""Primary Contact Id"");
		ActivateField(""Primary Address Id"");
		ActivateField(""Master Account Id"");
		ActivateField(""Name"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchExpr(""[DUNS Number] = '""+msisdn+""' AND [Account Type Code] = 'Service' AND [Account Status] = 'Active'"");
		ExecuteQuery(ForwardOnly);
		if( FirstRecord() )
		{
			vContactId	= GetFieldValue(""Primary Contact Id"");
			vAddrId		= GetFieldValue(""Primary Address Id"");
			vCustAccntId	= GetFieldValue(""Master Account Id"");
			
			actBusComp.SetFieldValue(""Account Id"", GetFieldValue(""Id"")); //
			actBusComp.SetFieldValue(""Name"", GetFieldValue(""Name"") ); // Set Name
		}
	}
	
	with(objAccntBusComp)
	{
		ActivateField(""Survey Type"");
		ActivateField(""Tax ID Number"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"", vCustAccntId );
		ExecuteQuery(ForwardOnly);
		if( FirstRecord() )
		{
			actBusComp.SetFieldValue(""ID Type"", GetFieldValue(""Survey Type""));		//
			actBusComp.SetFieldValue(""ID#"", GetFieldValue(""Tax ID Number""));	//
		}
	}
	objAccntBusComp=null;
	
	with(objConBusComp)
	{
		ActivateField(""M/M"");
		ActivateField(""First Name"");
		ActivateField(""Middle Name"");
		ActivateField(""Last Name"");
		ActivateField(""Date of Birth"");
		ActivateField(""Email Address"");
		ActivateField(""M/F"");
		ActivateField(""Work Phone #"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"", vContactId);
		ExecuteQuery(ForwardOnly);
		if( FirstRecord())
		{
			actBusComp.SetFieldValue(""Title"", GetFieldValue(""M/M"") );
			actBusComp.SetFieldValue(""First Name"", GetFieldValue(""First Name"") );
			actBusComp.SetFieldValue(""Middle Name"", GetFieldValue(""Middle Name"") );
			actBusComp.SetFieldValue(""Last Name"", GetFieldValue(""Last Name"") );
			actBusComp.SetFieldValue(""Gender"", GetFieldValue(""M/F"") );
			actBusComp.SetFieldValue(""Date Of Birth"", GetFieldValue(""Date of Birth"") );
			actBusComp.SetFieldValue(""Email Address"", GetFieldValue(""Email Address"") );
			actBusComp.SetFieldValue(""Work Phone"", GetFieldValue(""Work Phone #"") );
			actBusComp.SetFieldValue(""Contact Id"", vContactId );		
		}
	}
	objConBusComp=null;
	
	with(objAddrBusComp)
	{
		ActivateField(""Apartment Number"");
		ActivateField(""Building No"");
		ActivateField(""STC Road No"");
		ActivateField(""Block No"");
		ActivateField(""Postal Code"")
		ActivateField(""City"");
		ActivateField(""State"");
		ActivateField(""Address Name"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"", vAddrId );
		ExecuteQuery(ForwardOnly);
		if( FirstRecord() )
		{
			actBusComp.SetFieldValue(""Flat No"", GetFieldValue(""Apartment Number"") );
			actBusComp.SetFieldValue(""Building Name"", GetFieldValue(""Building No"") );
			actBusComp.SetFieldValue(""Road No"", GetFieldValue(""STC Road No"") );
			actBusComp.SetFieldValue(""Block No"", GetFieldValue(""Block No"") ); 
			actBusComp.SetFieldValue(""Postal Code"", GetFieldValue(""Postal Code""));
			actBusComp.SetFieldValue(""Governorate"", GetFieldValue(""State"") );
			actBusComp.SetFieldValue(""City"", GetFieldValue(""City"") );
			actBusComp.SetFieldValue(""Country"", ""Bahrain"" );
			actBusComp.SetFieldValue(""Address"", vAddrId );
		}
	}
	objAddrBusComp=null;
	
	actBusComp.WriteRecord();
	objAccntBusObj  = null;
	objAccntBusComp = null;
	objConBusComp	= null;
	objAddrBusComp	= null;
	objAppln.GotoView(""STC LOY Member Registration View"", actBusObj);

	return (CancelOperation);
}
function WebApplet_Load ()
{
	this.BusComp().NewRecord(NewAfter);
}
"/*  
---------------+------+----------+----------------------------------------------  
Date(YYYYMMDD) | Ver  | By       | Description   
---------------+------+----------+----------------------------------------------  
20120920       | 1.0  | Subhankar| Manual Registration
---------------+------+----------+----------------------------------------------  
*/  
function WebApplet_PreInvokeMethod (MethodName)
{
	if( MethodName == ""Validate"" )
	{
		var objAppln 	= TheApplication();
		var psIn  	 	= objAppln.NewPropertySet();
		var	psOut  		= objAppln.NewPropertySet();
		var	sBsName 	= objAppln.GetService(""Workflow Process Manager"");
		var	sRequestFrom = objAppln.InvokeMethod(""LookupValue"", ""LOY_TXN_CHNNL_CD"", ""Manual Registration"");
		with(psIn)
		{
			SetProperty(""MSISDN"", this.BusComp().GetFieldValue(""MSISDN"") );
			SetProperty(""RequestFrom"", sRequestFrom);
			SetProperty(""ProcessName"", ""StcLoyOnlineEnrollmentProcess"");
		}
		sBsName.InvokeMethod(""RunProcess"", psIn, psOut);
		var sStatusCode  = psOut.GetProperty(""StatusCode"");
		var sParamCode   = psOut.GetProperty(""Error Message"");
		var sMemberId	 = psOut.GetProperty(""Object Id"");
		var sMemConId	 = psOut.GetProperty(""MemberContactId"");
		var sMemAddrId   = psOut.GetProperty(""MemberAddressId"");
		if( sStatusCode == ""0"" )
		{
			psIn = objAppln.NewPropertySet();
			psIn.SetProperty(""MSISDN"", this.BusComp().GetFieldValue(""MSISDN"") );
			psIn.SetProperty(""Contact Id"", sMemConId );
			psIn.SetProperty(""Address Id"", sMemAddrId );
			CreateRegistrationForm(psIn, psOut);
		}
		else
		{
			objAppln.RaiseErrorText(sParamCode); 
		}  
		
		return (CancelOperation);
	}
	return (ContinueOperation);
}
"/*  
---------------+------+----------+----------------------------------------------  
Date(YYYYMMDD) | Ver  | By       | Description   
---------------+------+----------+----------------------------------------------  
20120920       | 1.0  | Subhankar| Manual Registration
---------------+------+----------+----------------------------------------------  
*/  
function WebApplet_PreInvokeMethod (MethodName)
{
	if( MethodName == ""Register"" )
	{
		var objAppln, objService;
		var vMSISDN, MemberType, AccrualType, vName,EnChnl, EnrollmentType, ProgramName, vAccntId ; 
		var vTitle, vGender, vFirstName, vMiddleName, vLastName, vDateofBirth, vEmailAddress, vContactId, vWorkPhNum, vIdType, vIdNum,Tier;
		var vApptNum, vBuildingNo, vRoadNo, vBlockNo, vGovernorate, vPostalCode, vCity, vCountry, vAddrId;
		//var Tier;
		objAppln = TheApplication();
		objService = objAppln.GetService(""STC LOY Generic BS"");
		EnChnl = objAppln.InvokeMethod(""LookupValue"", ""LOY_TXN_CHNNL_CD"", ""Manual Registration"");
		MemberType = objAppln.InvokeMethod(""LookupValue"", ""LOY_MEM_TYPE"", ""Individual"");
		AccrualType = objAppln.InvokeMethod(""LookupValue"", ""LOY_CORP_ACCR_TYPE"", ""Individual Only""); 		
		ProgramName = objAppln.InvokeMethod(""LookupValue"", ""STC_LOY_DEFAULT"", ""DEFAULT_PROGRAM_NAME""); 
				
		with(this.BusComp())
		{
			vMSISDN = GetFieldValue(""MSISDN"");
			Tier=GetFieldValue(""Tier""); 
			vName	= GetFieldValue(""Name"");
			EnrollmentType = GetFieldValue(""Attr 2"");
			vTitle = GetFieldValue(""Title"");
			vGender = GetFieldValue(""Gender"");
			vFirstName = GetFieldValue(""First Name"");
			vMiddleName = GetFieldValue(""Middle Name"");
			vLastName = GetFieldValue(""Last Name"");
			vDateofBirth = GetFieldValue(""Date Of Birth"");
			vEmailAddress = GetFieldValue(""Email Address"");
			vContactId = GetFieldValue(""Contact Id"");
			vApptNum = GetFieldValue(""Flat No"");
			vBuildingNo = GetFieldValue(""Building Name"");
			vRoadNo = GetFieldValue(""Road No"");
			vBlockNo = GetFieldValue(""Block No"");
			vGovernorate = GetFieldValue(""Governorate"");
			vPostalCode = GetFieldValue(""Postal Code"");
			vCity = GetFieldValue(""City"");
			vCountry = GetFieldValue(""Country"");
			vAddrId = GetFieldValue(""Address"");
			vAccntId = GetFieldValue(""Account Id"");
			vWorkPhNum=GetFieldValue(""Work Phone"");
			vIdType=GetFieldValue(""ID Type"");
			vIdNum=GetFieldValue(""ID#"");
		}
		if( vName == """" || vFirstName == """" || vLastName == """" || vDateofBirth == """" || vEmailAddress == """" || vApptNum == """" || vBuildingNo == """" || vRoadNo == """" || vBlockNo == """" || vGovernorate == """" || vCity == """" )
		{
			objAppln.RaiseErrorText(""Please fill all mandatory fields before registration"");
		}
	
		var propIn = objAppln.NewPropertySet();
		var propOut = objAppln.NewPropertySet();
		var Address = objAppln.NewPropertySet();
		var Contact = objAppln.NewPropertySet();
		var Member = objAppln.NewPropertySet();
		
		Address.SetProperty(""Apartment Number"", vApptNum );
		Address.SetProperty(""Building No"", vBuildingNo );
		Address.SetProperty(""Road No"", vRoadNo );
		Address.SetProperty(""Block No"", vBlockNo );
		Address.SetProperty(""Governorate"", vGovernorate );
		Address.SetProperty(""Postal Code"", vPostalCode );
		Address.SetProperty(""City"", vCity );
		Address.SetProperty(""Country"", vCountry );
		Address.SetProperty(""Address Id"", vAddrId );
		Address.SetType(""Address"");
		propIn.AddChild(Address);
		
		Contact.SetProperty(""Title"", vTitle );
		Contact.SetProperty(""Gender"", vGender );
		Contact.SetProperty(""First Name"", vFirstName );
		Contact.SetProperty(""Middle Name"", vMiddleName );
		Contact.SetProperty(""Last Name"", vLastName );
		Contact.SetProperty(""Date of Birth"", vDateofBirth );
		Contact.SetProperty(""Email Address"", vEmailAddress );
		Contact.SetProperty(""Work Phone"", vWorkPhNum );
		Contact.SetProperty(""ID Type"", vIdType );
		Contact.SetProperty(""ID Number"", vIdNum );
		Contact.SetProperty(""Contact Id"", vContactId );
		Contact.SetType(""Contact"");
		propIn.AddChild(Contact);
		
		Member.SetProperty(""MSISDN"", vMSISDN );
		Member.SetProperty(""Member Type"", MemberType );
		Member.SetProperty(""Accrual Type"", AccrualType );
		Member.SetProperty(""Name"", vName );
		Member.SetProperty(""Enroll Channel"", EnChnl );
		Member.SetProperty(""Program Name"", ProgramName );
		Member.SetProperty(""Account Id"", vAccntId );
		Member.SetType(""Member"");
		propIn.AddChild(Member);
		
		objService.InvokeMethod(""EnrollRequest"", propIn, propOut );
		
		var vMemId = propOut.GetProperty(""MemberId"");
		var vErrorMsg = propOut.GetProperty(""ErrorMsg"");
		var vRetCode = propOut.GetProperty(""SuccessCode"");
		var vMemNum = propOut.GetProperty(""MemberNumber"");
		objService = null;
		if( vRetCode == ""0"" )
		{
			// Commented on 20th Jan
			//fn_SetTierEndDate(vMemId); // Set Tier End Date
			fn_Payflex(vMemId);
			fn_UpdateLoyaltyTier(vMemId,vAccntId);//update Loyalty Tier at BRM Level
			fn_SendSMS(vMSISDN, vMemNum,Tier); // Send Success Message
			var objLoyBusObj = objAppln.GetBusObject(""LOY Member"");
			var objLoyBusComp = objLoyBusObj.GetBusComp(""LOY Member"");
			with(objLoyBusComp)
			{
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchSpec(""Id"", vMemId);
				ExecuteQuery(ForwardOnly);
			}
			TheApplication().GotoView(""LOY Member Detail View"", objLoyBusObj);
		}
		else
		{
			TheApplication().RaiseErrorText(vErrorMsg);	
		}
		
		return (CancelOperation);
	}
	return (ContinueOperation);
}
function fn_Payflex(inMemberId)
{
	try
	{
		var objAppln = TheApplication(); 
		var objWfProcMgr = objAppln.GetService(""Workflow Process Manager"");
		var psIn = objAppln.NewPropertySet();
		var psOut = objAppln.NewPropertySet();
		psIn.SetProperty(""ProcessName"", ""STC Payflex Subscribe Enrollment Request WF"");
		psIn.SetProperty(""Object Id"", inMemberId);
		
		objWfProcMgr.InvokeMethod(""RunProcess"", psIn, psOut);
		
	}
	catch(e)
	{
	}
	finally
	{
		objWfProcMgr = null;
		objAppln = null;
		psIn = null;
		psOut = null;
	}
	return (ContinueOperation);
}
function fn_SendSMS(MSISDN, vMemNum,Tier)
{
	try
	{
		var objAppln = TheApplication(); 
		var objWfProcMgr = objAppln.GetService(""Workflow Process Manager"");
		var psIn = objAppln.NewPropertySet();
		var psOut = objAppln.NewPropertySet();
		var ServName = objAppln.InvokeMethod(""LookupValue"", ""STC_LOY_DEFAULT"", ""LOY_ENT_NAME"" );
		var MsgId 	 = objAppln.InvokeMethod(""LookupValue"", ""STC_LOY_SMS_CODE"", ""LOY_SMS_CODE_014"" );
		
		psIn.SetProperty(""ProcessName"", ""StcLoySendSmsNotification"" );
		psIn.SetProperty(""MessageId"", MsgId );
		psIn.SetProperty(""Request Id"", vMemNum );
		psIn.SetProperty(""MSISDN"", MSISDN );
		psIn.SetProperty(""Tier"", Tier);  
	    psIn.SetProperty(""TierFlg"", ""Y"");
		psIn.SetProperty(""Param 1 Name"", ""SERVICE_NAME"" );
		psIn.SetProperty(""Param 1 Value"", ServName ); 		
		objWfProcMgr.InvokeMethod(""RunProcess"", psIn, psOut );
		
	}
	catch(e)
	{
	}
	finally
	{
		objWfProcMgr = null;
		objAppln = null;
		psIn = null;
		psOut = null;
	}
	return (ContinueOperation);
}
function fn_SetTierEndDate(inMemberId)
{
	try
	{
		var outErrorCd="""", outErrorMsg="""";
		var objAppln, objLoyMemBusObj, objLoyMemBusComp, ObjLoyMemTier;
		var vPrTierId;
		
		objAppln = TheApplication();
		objLoyMemBusObj = objAppln.GetBusObject(""LOY Member"");
		objLoyMemBusComp = objLoyMemBusObj.GetBusComp(""LOY Member"");
		ObjLoyMemTier = objLoyMemBusObj.GetBusComp(""LOY Member Tier"");
		
		var curDt = new Date;
		curDt = ToNumber(curDt.getFullYear())+1;
		curDt = ""12/31/"" + curDt;
		
		objAppln.SetProfileAttr(""IsBS"", ""Y"");
		
		with(objLoyMemBusComp)
		{
			ActivateField(""Primary Tier Id"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Id"", inMemberId );
			ExecuteQuery(ForwardOnly);
			if( FirstRecord() )
			{
				vPrTierId = GetFieldValue(""Primary Tier Id"");
				
				with(ObjLoyMemTier)
				{
					ActivateField(""STC Tier End Date"");
					ActivateField(""Tier Id"");
					ActivateField(""Active"");
					SetViewMode(AllView);
					ClearToQuery();
					SetSearchSpec(""Active"", ""Y"");
					SetSearchSpec(""Tier Id"", vPrTierId);
					ExecuteQuery(ForwardOnly);
					if( FirstRecord() )
					{
						SetFieldValue(""STC Tier End Date"", curDt );
						WriteRecord();
					}
				}
			}
		}
	}
	catch(e)
	{
	}
	finally
	{
		objAppln.SetProfileAttr(""IsBS"", ""N"");
		objAppln=null, objLoyMemBusObj=null, objLoyMemBusComp=null, ObjLoyMemTier=null;
	}
	return(CancelOperation);
}
function fn_UpdateLoyaltyTier(vMemId,vAccntId)
{
	try
	{
		var objAppln = TheApplication(); 
		var objWfProcMgr = objAppln.GetService(""Workflow Process Manager"");
		var psIn = objAppln.NewPropertySet();
		var psOut = objAppln.NewPropertySet();
		psIn.SetProperty(""ProcessName"", ""STC Loyalty Tier Update To BRM WF"");
		psIn.SetProperty(""Object Id"", vAccntId);
		psIn.SetProperty(""MemberId"", vMemId);		
		objWfProcMgr.InvokeMethod(""RunProcess"", psIn, psOut);
		
	}
	catch(e)
	{
	}
	finally
	{
		objWfProcMgr = null;
		objAppln = null;
		psIn = null;
		psOut = null;
	}
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	if( MethodName == ""ShowPopup"" )
	{
		TheApplication().SetProfileAttr(""STCAccountIDNumber"",this.BusComp().ParentBusComp().GetFieldValue(""STC ID Number"")); //Anchal: Added for LMS Bugfix
		TheApplication().SetProfileAttr(""STCLoyaltyMemberId"",this.BusComp().ParentBusComp().GetFieldValue(""Id"")); //Anchal: Added for LMS Bugfix
		//this.BusComp().ActivateField(""MSISDN"");
		//TheApplication().SetProfileAttr(""Transaction MSISDN"", this.BusComp().GetFieldValue(""MSISDN"") );
		this.BusObject().GetBusComp(""LOY Member VBC Ext"").NewRecord(NewAfter);
	}

			if (MethodName == ""AddManualPoints"")
			{
				var sApp = TheApplication();
				sApp.SetProfileAttr(""LOYMSISDN"",this.BusComp().ParentBusComp().GetFieldValue(""MSISDN"")); //Anchal: Added for LMS Bugfix
				sApp.SetProfileAttr(""STCLoyaltyMemberId"",this.BusComp().ParentBusComp().GetFieldValue(""Id"")); //Anchal: Added for LMS Bugfix
				//		this.BusObject().GetBusComp(""STC LOY Add Points VBC"").NewRecord(NewAfter);
				var oServiceAF = sApp.GetService(""SLM Save List Service"");
				var inputPropAF = sApp.NewPropertySet();
				var outputPropAF = sApp.NewPropertySet();
				inputPropAF.SetProperty(""Applet Name"",""STC Add Loylaty Points Popup applet"");
				inputPropAF.SetProperty(""Applet Mode"",""3"");
				inputPropAF.SetProperty(""Applet Height"", ""800"");
				inputPropAF.SetProperty(""Applet Width"", ""800"");
				oServiceAF.InvokeMethod(""LoadPopupApplet"", inputPropAF, outputPropAF)
				return (CancelOperation);
			}

	return (ContinueOperation);
}
function WebApplet_InvokeMethod (MethodName)
{
	if(MethodName == ""GetBrowserURL"")
	{
		var url = window.location;
		alert(url);
		return (CancelOperation);
	}
}
function WebApplet_PreInvokeMethod (MethodName)
{
	if(MethodName == ""GetBrowserURL"")
	{
		return (ContinueOperation);		
	}
	else
		return (ContinueOperation);
}
function WebApplet_InvokeMethod (MethodName)
{
	if(MethodName == ""GetBrowserURL"")
	{
		var url = window.location;
		alert(url);
		return (CancelOperation);
	}
}
function WebApplet_PreInvokeMethod (MethodName)
{
	if(MethodName == ""GetBrowserURL"")
	{
		return (ContinueOperation);		
	}
	else
		return (ContinueOperation);
}
function ValidateCustomer(psInputs)
//Mayank: Added for Lead To Cashe
{
	var appObj;
	var bsValidCustomer;
	var sErrorCode;
	var sErrorMsg;
	try
	{
		appObj = TheApplication();
		var psOutputs = appObj.NewPropertySet();
		with(appObj)
		{
			bsValidCustomer = GetService(""STC New Customer Validation"");
			bsValidCustomer.InvokeMethod(""ValidateCustomer"",psInputs, psOutputs);
		
			sErrorCode = psOutputs.GetProperty(""Error Code"");
			sErrorMsg = psOutputs.GetProperty(""Error Message"");
			if(sErrorCode !="""" && sErrorCode != null)
			{
				TheApplication().RaiseErrorText(sErrorMsg);
			}
			
		} 
		return(ContinueOperation);
	
	}
	catch(e)
	{
		//TheApplication().RaiseErrorText(e.errText);
		throw(e);
	}
	finally
	{
		psInputs = null;
		psOutputs = null;
		bsValidCustomer = null;
	}
}
function WebApplet_Load ()
{

}
function WebApplet_PreInvokeMethod (MethodName)
{ 
//Mayank: Added for Lead To Cashe -------------START-------------
	var appObj=TheApplication();
	if(MethodName==""DisplayPopupContact"")
	{
		try
		{
			var sCountry, sPhone,sCity,sGovernate, sEmailId, sGender, sMidleName, sEmailReason, sLastName, sFirstName,sDateOfBirth,sID, sIDType,sIDExpiryDate,sCustomerClass,sFlatVillaNo,sCurrOccupation, sNationality, sApplicantType, sContractCategory,sBahrainID, GCCCountryCode;
			var sInputs1,sInputs, sOutputs1,sOutputs;
			var LeadType;
			with(this.BusComp())
			{
				ActivateField(""Work Phone #"");
				ActivateField(""Email Address"");
				ActivateField(""Last Name"");
				ActivateField(""Middle Name"");
				ActivateField(""First Name"");
				ActivateField(""Birth Date"");
				ActivateField(""STC ID #"");
				ActivateField(""STC ID Type"");
				ActivateField(""ID Expiration Date"");
				ActivateField(""STC Customer Class"");
				ActivateField(""Current Occupation"");
				ActivateField(""STC Flat Number"");
				ActivateField(""Citizenship"");
				ActivateField(""STC Country"");
				ActivateField(""M/F"");
				ActivateField(""STC GCC Country Code"");
				ActivateField(""STC City"");
				ActivateField(""STC Governorate"");
				sPhone = GetFieldValue(""Work Phone #"");
				sEmailId = GetFieldValue(""Email Address"");
				sLastName = GetFieldValue(""Last Name"");
				sFirstName = GetFieldValue(""First Name"");
				sDateOfBirth = GetFieldValue(""Birth Date"");
				sID = GetFieldValue(""STC ID #"");
				sIDType = GetFieldValue(""STC ID Type"");
				sIDExpiryDate = GetFieldValue(""ID Expiration Date"");
				sCustomerClass = GetFieldValue(""STC Customer Class"");
				sCurrOccupation = GetFieldValue(""Current Occupation"");
				sFlatVillaNo = GetFieldValue(""STC Flat Number"");
				sNationality = GetFieldValue(""Citizenship"");
				GCCCountryCode = GetFieldValue(""STC GCC Country Code"");
				sMidleName = GetFieldValue(""Middle Name"");
				sGender = GetFieldValue(""M/F"");
				sCountry = GetFieldValue(""STC Country"");
				sCity = GetFieldValue(""STC City"");
				sGovernate = GetFieldValue(""STC Governorate"");
			}
			var sView = appObj.GetProfileAttr(""ActiveViewName"");
			if(sView == ""Lead Details View"")
			{
				LeadType = TheApplication().GetProfileAttr(""sLeadType"");
				sInputs1 = appObj.NewPropertySet();
				sOutputs1 = appObj.NewPropertySet();
				var sIDCheck = appObj.GetService(""STC-CheckDuplicateID"");
				sInputs1.SetProperty(""IDNum"", sID);
				sInputs1.SetProperty(""IDType"", sIDType);
				sInputs1.SetProperty(""StrAccountId"", "" "");
				sInputs1.SetProperty(""CompId"", "" "");
				sInputs1.SetProperty(""CustType"", ""Individual"");
				sIDCheck.InvokeMethod(""CheckDuplicate"",sInputs1, sOutputs1);
				var sIdExist = sOutputs1.GetProperty(""gCombExists"");
				if(sIdExist == ""Y"")
				{
					appObj.RaiseErrorText(""A record with similar values for IDType and ID# already exists."");
				}
				if(sCountry == null || sCountry == """" || sGovernate == null || sGovernate == """" || sCity == null || sCity == """" || sPhone == null || sPhone == """" || sEmailId == null || sEmailId == """" || sLastName == null || sLastName == """" || sFirstName == null || sFirstName == """" || sDateOfBirth == null || sDateOfBirth == """" || sID == null || sID == """" || sIDType == null || sIDType == """" || sIDExpiryDate == null || sIDExpiryDate == """" || sFlatVillaNo == null || sFlatVillaNo == """" || sCurrOccupation == null || sCurrOccupation == """" || sCustomerClass == null || sCustomerClass == """" || sNationality == null || sNationality == """" || sGender == null || sGender == """")
				{
					appObj.RaiseErrorText(""Please provide all the mandatory deatils"");
				}
				sBahrainID = TheApplication().InvokeMethod(""LookupValue"",""STC_CUST_ID_TYPE"",""Bahraini ID"");
				if(sIDType == ""GCC"" && (GCCCountryCode == null || GCCCountryCode == """"))
				{
					appObj.RaiseErrorText(""Please provide GCC Country Code for ID Type Other than Bahrini Id."");
				}
				sInputs = appObj.NewPropertySet();
				sOutputs = appObj.NewPropertySet();
				var sAgeCustomer = appObj.GetService(""Workflow Process Manager"");
				sInputs.SetProperty(""BirthDate"", sDateOfBirth);
				sInputs.SetProperty(""IDExpiryDate"", sIDExpiryDate);
				sInputs.SetProperty(""ProcessName"", ""STC Calculate Customer Age WF"");
				sAgeCustomer.InvokeMethod(""RunProcess"",sInputs, sOutputs);
				var Age = 0;
				Age = sOutputs.GetProperty(""Age"");
				var sExpired = ""N"";
				sExpired = sOutputs.GetProperty(""Expired"");
				Age = Age/365;
				if(Age < 18)
				{
					appObj.RaiseErrorText(""Customer Age has to 18 or More."");
				}
				if(sExpired == ""Y"")
				{
					appObj.RaiseErrorText(""Id has Expired. Please provide an Id which is active."");
				}
				var psInputs = appObj.NewPropertySet();
				with(psInputs)
				{
					SetProperty(""AccountType"", ""Individual"");
					SetProperty(""Phone"", sPhone);
					if(sEmailId == """" || sEmailId == null)
					{
						SetProperty(""EmailId"", NA);
						SetProperty(""EmailReason"", ""No Email"");
					}
					else
					{
						SetProperty(""EmailId"", sEmailId);
						SetProperty(""EmailReason"", ""Available"");
					}
					SetProperty(""LastName"", sLastName);
					SetProperty(""FirstName"", sFirstName);
					SetProperty(""DateOfBirth"", sDateOfBirth);
					SetProperty(""ID"", sID);
					SetProperty(""IDType"", sIDType);
					SetProperty(""IDExpiryDate"", sIDExpiryDate);
					SetProperty(""AccountClass"", sCustomerClass);
					SetProperty(""FlatVillaNo"", sFlatVillaNo);
					//sIncomeGroup = GetProperty(""IncomeGroup"");
					SetProperty(""CurrentOccupation"", sCurrOccupation);
					SetProperty(""Nationality"", sNationality);
					SetProperty(""ApplicantType"", ""Others"");
					SetProperty(""ContractCategory"", ""Individual"");
					SetProperty(""TaxCategory"", ""Individual"");
					if(LeadType == ""SCB Card Registration"")
					{
						SetProperty(""ByPassBlackList"", ""Y"");
					}
					if(sIDType == sBahrainID)
					{
						SetProperty(""GCCCountryCode"", TheApplication().InvokeMethod(""LookupValue"",""STC_GCC_COUNTRY_CODE"",""BH""));
					}
					else
					{
						SetProperty(""GCCCountryCode"", GCCCountryCode);
					}
					//sCardIssueDate = GetProperty(""sCardIssueDate"");
					//sPassportIssueDate = GetProperty(""sPassportIssueDate"");
				}
				ValidateCustomer(psInputs);
			}
    }
    	catch(e)
			{
			throw(e);
			}
			//this.InvokeMethod(""CloseApplet"");
			}
	return (ContinueOperation);			
}
function WebApplet_Load ()
{
	TheApplication().SetProfileAttr(""LEADID"", this.BusComp().GetFieldValue(""Id""));//Mayank: Added for Lead To Cashe
}
function WebApplet_PreInvokeMethod (MethodName)
{
	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
//Mayank: Added for Lead To Cashe -------------START-------------
	try
	{
		var ireturn = ContinueOperation;
		var appObj = TheApplication();
		var CurrBC = this.BusComp();
		var sValidMultiMediaUser = ""Y"";
		var sValidTeleSaleUser = ""Y"";
		var sUser = appObj.LoginName();
		sValidMultiMediaUser = appObj.InvokeMethod(""LookupValue"", ""VALIDATE_MULTIMEDIA_USER"", sUser);
		sValidTeleSaleUser = appObj.InvokeMethod(""LookupValue"", ""VALIDATE_TELE_SALES_USER"", sUser);
		//[MANUJ] : [Optic Fiber] : Start	
		var sLeadId = """", sStatus = """", sLeadType = """";
		var sAccept = appObj.InvokeMethod(""LookupValue"", ""LEAD_STATUS"", ""Accepted"");
		var sFulfilment =	appObj.InvokeMethod(""LookupValue"", ""LEAD_STATUS"", ""Awaiting Fulfilment"");
		var sRetired = appObj.InvokeMethod(""LookupValue"", ""LEAD_STATUS"", ""Retired"");
		var sRejected = appObj.InvokeMethod(""LookupValue"", ""LEAD_STATUS"", ""Rejected"");
		var sCompleted = appObj.InvokeMethod(""LookupValue"", ""LEAD_STATUS"", ""Completed"");

		if((this.BusComp().CountRecords()) > 0) //Indrasen: 12jul2020
		{
			this.BusComp().ActivateField(""Lead Status"");
			this.BusComp().ActivateField(""STC Lead Type"");
			sStatus = this.BusComp().GetFieldValue(""Lead Status"");
			sLeadType = this.BusComp().GetFieldValue(""STC Lead Type"");
			sLeadId = this.BusComp().GetFieldValue(""Id"");
			appObj.SetProfileAttr(""sLeadId"",sLeadId);
			if (sLeadType != """")
				TheApplication().SetProfileAttr(""sLeadType"",sLeadType);
		}
		//[MANUJ] : [Optic Fiber] : End
		switch(MethodName)
		{
			case ""LeadConvert"":
				if(sStatus == sAccept && sValidMultiMediaUser == sUser)
					CanInvoke = ""TRUE"";
				else
					CanInvoke = ""FALSE"";
	
				ireturn = CancelOperation;
				break;

			case ""OnRejectClicked"":
				if(sStatus != sAccept && sStatus != sFulfilment && sStatus != sRetired && sStatus != sRejected && sStatus != sCompleted && sValidTeleSaleUser == sUser)
					CanInvoke = ""TRUE"";
				else
					CanInvoke = ""FALSE"";
		
				ireturn = CancelOperation;
				break;

			case ""OnRetireClicked"":
				if(sStatus != sAccept && sStatus != sFulfilment && sStatus != sRetired && sStatus != sRejected && sStatus != sCompleted && sValidTeleSaleUser == sUser)
					CanInvoke = ""TRUE"";
				else
					CanInvoke = ""FALSE"";
	
				ireturn = CancelOperation;
				break;

			case ""LeadValidate"":
				if(sStatus != sAccept && sStatus != sFulfilment && sStatus != sRetired && sStatus != sRejected && sStatus != sCompleted && sValidTeleSaleUser == sUser)
					CanInvoke = ""TRUE"";
				else
					CanInvoke = ""FALSE"";
	
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
		appObj = null;
	}//Mayank: Added for Lead To Cashe -------------STOP-------------	
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
//Mayank: Added for Lead To Cashe -------------START-------------
	try
	{
		var ireturn = ContinueOperation;
		var appObj = TheApplication();
		var CurrBC = this.BusComp();
		var sValidMultiMediaUser = ""Y"";
		var sValidTeleSaleUser = ""Y"";
		var sUser = appObj.LoginName();
		sValidMultiMediaUser = appObj.InvokeMethod(""LookupValue"", ""VALIDATE_MULTIMEDIA_USER"", sUser);
		sValidTeleSaleUser = appObj.InvokeMethod(""LookupValue"", ""VALIDATE_TELE_SALES_USER"", sUser);
		//[MANUJ] : [Optic Fiber] : Start	
		var sLeadId = """", sStatus = """", sLeadType = """";
		var sAccept = appObj.InvokeMethod(""LookupValue"", ""LEAD_STATUS"", ""Accepted"");
		var sFulfilment =	appObj.InvokeMethod(""LookupValue"", ""LEAD_STATUS"", ""Awaiting Fulfilment"");
		var sRetired = appObj.InvokeMethod(""LookupValue"", ""LEAD_STATUS"", ""Retired"");
		var sRejected = appObj.InvokeMethod(""LookupValue"", ""LEAD_STATUS"", ""Rejected"");
		var sCompleted = appObj.InvokeMethod(""LookupValue"", ""LEAD_STATUS"", ""Completed"");
		var strSalesCampType="""";
		

		if((this.BusComp().CountRecords()) > 0) //Indrasen: 12jul2020
		{
			this.BusComp().ActivateField(""Lead Status"");
			this.BusComp().ActivateField(""STC Lead Type"");
			this.BusComp().ActivateField(""STC Sales Campaign Type""); //Abuzar:09102021:SD:Telesales
			sStatus = this.BusComp().GetFieldValue(""Lead Status"");
			sLeadType = this.BusComp().GetFieldValue(""STC Lead Type"");
			sLeadId = this.BusComp().GetFieldValue(""Id"");
			strSalesCampType = this.BusComp().GetFieldValue(""STC Sales Campaign Type""); //Abuzar:09102021:SD:Telesales
			appObj.SetProfileAttr(""sLeadId"",sLeadId);
			if (sLeadType != """")
				TheApplication().SetProfileAttr(""sLeadType"",sLeadType);
		}
		//[MANUJ] : [Optic Fiber] : End
		switch(MethodName)
		{
			case ""LeadConvert"":
				if(sStatus == sAccept && sValidMultiMediaUser == sUser)
					CanInvoke = ""TRUE"";
				else
					CanInvoke = ""FALSE"";
	
				ireturn = CancelOperation;
				break;

			case ""OnRejectClicked"":
				if(sStatus != sAccept && sStatus != sFulfilment && sStatus != sRetired && sStatus != sRejected && sStatus != sCompleted && sValidTeleSaleUser == sUser && (strSalesCampType==""Not Applicable"" || strSalesCampType=="""" || strSalesCampType==null))
					CanInvoke = ""TRUE"";
				else
					CanInvoke = ""FALSE"";
		
				ireturn = CancelOperation;
				break;

			case ""OnRetireClicked"":
				if(sStatus != sAccept && sStatus != sFulfilment && sStatus != sRetired && sStatus != sRejected && sStatus != sCompleted && sValidTeleSaleUser == sUser && (strSalesCampType==""Not Applicable"" || strSalesCampType=="""" || strSalesCampType==null))
					CanInvoke = ""TRUE"";
				else
					CanInvoke = ""FALSE"";
	
				ireturn = CancelOperation;
				break;

			case ""LeadValidate"":
				if(sStatus != sAccept && sStatus != sFulfilment && sStatus != sRetired && sStatus != sRejected && sStatus != sCompleted && sValidTeleSaleUser == sUser && (strSalesCampType==""Not Applicable"" || strSalesCampType=="""" || strSalesCampType==null))
					CanInvoke = ""TRUE"";
				else
					CanInvoke = ""FALSE"";
	
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
		appObj = null;
	}//Mayank: Added for Lead To Cashe -------------STOP-------------	
}
function WebApplet_PreInvokeMethod (MethodName)
{//Mayank: Added for Lead To Cashe -------------START-------------
	try
	{
		var ireturn = ContinueOperation;
		var appObj = TheApplication();
		var sDocAttach = ""N"";
		var sLeadId,sStatus,sAccountId,sContactId;
		var ExistingCust="""", NewLineFlag = """";//[Hardik17June2020:Order Fullfilment Changes]
		switch(MethodName)
		{
			case ""LeadConvert"":
			this.BusComp().WriteRecord();
			with(this.BusComp())
			{
				ActivateField(""Lead Status"");
				ActivateField(""Account Id"");
				ActivateField(""Contact Id"");
				ActivateField(""STC Existing Cust Flag"");//[Hardik17June2020:Order Fullfilment Changes]
				ActivateField(""STC Accnt New Line"");//[Hardik17June2020:Order Fullfilment Changes]
				sLeadId = GetFieldValue(""Id"");
				sStatus = GetFieldValue(""Lead Status"");
				sAccountId = GetFieldValue(""Account Id"");
				ExistingCust = GetFieldValue(""STC Existing Cust Flag"");//[Hardik17June2020:Order Fullfilment Changes]
				NewLineFlag = GetFieldValue(""STC Accnt New Line""); //[Hardik17June2020:Order Fullfilment Changes]
				if(sAccountId == ""No Match Row Id"")
				{
					sAccountId = """";
				}
				sContactId = GetFieldValue(""Contact Id"");
			}
			var bcLeadAttach = appObj.GetBusObject(""Lead"").GetBusComp(""Service Request Attachment"");
			with(bcLeadAttach)   
			{  
		        ActivateField(""Activity Id"");
		        SetViewMode(AllView);   
		        ClearToQuery();
   				var strExpr = ""[Activity Id] = '""+ sLeadId +""'"";
				SetSearchExpr(strExpr);
		        ExecuteQuery(ForwardOnly);
		        if(FirstRecord())
		        {
					sDocAttach = ""Y"";
				}
			}
			if(sDocAttach == ""N"")
			{
				appObj.RaiseErrorText(""Please Attach Required document to Convert a Lead."");
			}
			else
			{
				if((sAccountId == null || sAccountId == """") ||(ExistingCust == ""Y"" && NewLineFlag == ""Y""))
				{
					var psInputs = appObj.NewPropertySet();
					var psOutputs = appObj.NewPropertySet();
					var svcBusSrv = appObj.GetService(""Workflow Process Manager"");
					psInputs.SetProperty(""Object Id"", sLeadId);
					psInputs.SetProperty(""AccountId"", sAccountId); 
					psInputs.SetProperty(""ProcessName"", ""STCCreateNewLeadCustomerProcess"");
					svcBusSrv.InvokeMethod(""RunProcess"",psInputs,psOutputs);
					var sError = psOutputs.GetProperty(""Error Code"");
					var sErrorMSG = psOutputs.GetProperty(""Error Message"");
					if(sError != ""0"")
					{
						appObj.RaiseErrorText(""Customer creation Failed due to following Error:- ""+sErrorMSG+""."");
					}
					
				}
				//[Hardik17June2020:Order Fullfilment Changes]
				//Existing Customer
				if (ExistingCust == ""Y"" && NewLineFlag == ""N"")
				{
					var psInputs = appObj.NewPropertySet();
					var psOutputs = appObj.NewPropertySet();
					var svcBusSrv = appObj.GetService(""Workflow Process Manager"");
					psInputs.SetProperty(""Object Id"", sLeadId);
					psInputs.SetProperty(""AccountId"", sAccountId); 
					psInputs.SetProperty(""ProcessName"", ""STCCreateNewLeadModifyOrderProcess"");
					svcBusSrv.InvokeMethod(""RunProcess"",psInputs,psOutputs);
					var sError = psOutputs.GetProperty(""Error Code"");
					var sErrorMSG = psOutputs.GetProperty(""Error Message"");
					if(sError != ""0"")
					{
						appObj.RaiseErrorText(""Customer creation Failed due to following Error:- ""+sErrorMSG+""."");
					}
				}

				this.BusComp().SetFieldValue(""Lead Status"", appObj.InvokeMethod(""LookupValue"", ""LEAD_STATUS"", ""Awaiting Fulfilment""));
				this.BusComp().WriteRecord();
			}
			ireturn = CancelOperation;
			break;
			
			case ""LeadValidate"":
			this.BusComp().WriteRecord();
			with(this.BusComp())
			{
				ActivateField(""Lead Status"");
				ActivateField(""Account Id"");
				ActivateField(""Contact Id"");
				sLeadId = GetFieldValue(""Id"");
				sStatus = GetFieldValue(""Lead Status"");
				sAccountId = GetFieldValue(""Account Id"");
				if(sAccountId == ""No Match Row Id"")
				{
					sAccountId = """";
				}
				sContactId = GetFieldValue(""Contact Id"");
			}
			var psVInputs = appObj.NewPropertySet();
			var psVOutputs = appObj.NewPropertySet();
			var svcVBusSrv = appObj.GetService(""Workflow Process Manager"");
			psVInputs.SetProperty(""Object Id"", sLeadId);
			psVInputs.SetProperty(""AccountId"", sAccountId);
			psVInputs.SetProperty(""ProcessName"", ""STCLeadCreationValidationProcess"");
			svcVBusSrv.InvokeMethod(""RunProcess"",psVInputs,psVOutputs);
			ireturn = CancelOperation;
			break;

			default:
			ireturn = ContinueOperation;
		}
		return(ireturn);
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
	}	//Mayank: Added for Lead To Cashe -------------STOP-------------
}
function WebApplet_PreInvokeMethod (MethodName)
{
try
{
	if(MethodName == ""CompleteTask"")
	{
			var ListId = """";
			var TaskId = this.BusComp().GetFieldValue(""Id"");
			var lstName;// = this.BusComp().GetFieldValue(""Details"");
var MktgBO = TheApplication().GetBusObject(""Mktg System Task"");
var MktgBC = MktgBO.GetBusComp(""Mktg System Task"");

with(this.BusComp())
{
				ActivateField(""Details"");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchSpec(""Id"",TaskId);
				ExecuteQuery();
				var isTaskRec = FirstRecord();
				if(isTaskRec)
				{
					lstName = GetFieldValue(""Details"");
			
			
			with(TheApplication().GetBusObject(""List Mgmt"").GetBusComp(""List Mgmt Lists""))
			{
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchSpec(""Name"",lstName);
				ExecuteQuery();
				var isListRec = FirstRecord();
				if(isListRec)
				{
					ListId = GetFieldValue(""Id"");
				}
			}
			var CallListSer = TheApplication().GetService(""List Import"");
			var InpPS = TheApplication().NewPropertySet();
			var OutPS = TheApplication().NewPropertySet();
			InpPS.SetProperty(""Task_Id"", TaskId);
			InpPS.SetProperty(""List_Id"", ListId);
			CallListSer.InvokeMethod(""Start"",InpPS,OutPS);
		
			}	
}	// END OF WITH mKTGbc
		
		with(this.BusComp())
		{
				SetViewMode(AllView);
				ClearToQuery();
			//	SetSearchSpec(""Id"",TaskId);
				ExecuteQuery();
		}
		
			return(CancelOperation);
	}
	}
	catch(e)
	{
		TheApplication().RaiseErrorText(e.toString());
	}
	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	/*var  busComp= BusComp();
	var  salesToolType = busComp.GetFieldValue(""Sales Tool Type"");
	var  str;
    if(MethodName == ""ShowPopup"")
	{
		str = busComp.InvokeMethod (""IsQuery"");//""IsInQueryState"");
		if(str == ""TRUE"")
		{
			CanInvoke = ""FALSE"";
			return (CancelOperation);
    	}
		else if (salesToolType == ""Message"")
		{		
			CanInvoke = ""TRUE"";
			return (CancelOperation);			
		}
		else
		{
			CanInvoke = ""FALSE"";
			return (CancelOperation);
		}
	}*/	
	
	return (ContinueOperation);	
}
function WebApplet_InvokeMethod (MethodName)
{

	  //  if this is a copy process, for a line item,
	  //  we need to invoke the Oracle copy business Service
	  //  which will make the call to copy the corresponding
	  //  configuration in Oracle and then update the lines
	  //  in Siebel with the Configuration Header and Rev Number
  
	 if (MethodName == ""CopyRecord"") 
	 {
		  try 
		  {
				var busObj = this.BusObject();
				var busComp = this.BusComp();
				var sourceConfigHeader =  busComp.GetFieldValue(""External Configurator Reference 1"");
				var sourceConfigRevNbr = busComp.GetFieldValue(""External Configurator Reference 2"");
				var orderId = busComp.GetFieldValue(""Order Header Id"");
				var prodId = busComp.GetFieldValue(""Root Product Id"");
				var rootOrderItemId = busComp.GetFieldValue(""Root Order Item Id"");
				
				var invItemId = busComp.GetFieldValue(""External Inventory System Ref"");
 				var bOracleProduct = false;
											
				if ((invItemId != null) && (invItemId != """")) 
				{
						bOracleProduct = true;
				}

				if (bOracleProduct)
				{
					try
					{
						var indata1 =TheApplication().NewPropertySet ();
						var outdata1 = TheApplication().NewPropertySet ();
						indata1.SetProperty (""RootItemId"", rootOrderItemId);
						indata1.SetProperty (""QuoteorOrderorAgreementId"", orderId);
						indata1.SetProperty(""SourceConfigHeader"",sourceConfigHeader);
						indata1.SetProperty(""SourceConfigRevNbr"",sourceConfigRevNbr);
						indata1.SetProperty(""BusinessObject"",busObj.Name());
						indata1.SetProperty(""BusinessComponent"",busComp.Name());
												
						var svc1 = TheApplication().GetService(""CZIntegCopyConfigService"");
						svc1.InvokeMethod(""CopyOracleConfiguration"", indata1, outdata1);
						
						var destConfigRevNbr = outdata1.GetProperty(""DestConfigRevNbr"");
						var destConfigHeader = outdata1.GetProperty(""DestConfigHeader"");
						
						//for the root item
						busComp.SetFieldValue(""External Configurator Reference 1"",destConfigHeader);
						busComp.SetFieldValue(""External Configurator Reference 2"",destConfigRevNbr );
					}
					catch  (e) 
					{
						TheApplication().RaiseErrorText(e.toString());
						TheApplication().Trace(e.toString());
						var error = e.toString();
						throw e;
					}
					finally
					{
					  destConfigRevNbr = null;
					  destConfigHeader = null;
						indata1 = null;
						svc1 = null;
					}
				} //  end if (bOracleProduct)
			}
			catch  (e) 
			{
				TheApplication().RaiseErrorText(e.toString());
				TheApplication().Trace(e.toString());
				var error = e.toString();
				throw e;
			}
			finally 
			{
				if (busObj != null) { busObj = null;}
				if (busComp != null) {busComp = null;}
				
				sourceConfigHeader =  null;
				sourceConfigRevNbr = null;
				prodId = null;
				orderId = null;
				rootOrderItemId = null;
			
		}
	} // end if (MethodName == ""CopyRecord"")


}
"
function WebApplet_InvokeMethod (MethodName)
{

	  //  if this is a copy process, for a line item,
	  //  we need to invoke the Oracle copy business Service
	  //  which will make the call to copy the corresponding
	  //  configuration in Oracle and then update the lines
	  //  in Siebel with the Configuration Header and Rev Number
  
	 if (MethodName == ""CopyRecord"") 
	 {
		  try 
		  {
				var busObj = this.BusObject();
				var busComp = this.BusComp();
				var sourceConfigHeader =  busComp.GetFieldValue(""External Configurator Reference 1"");
				var sourceConfigRevNbr = busComp.GetFieldValue(""External Configurator Reference 2"");
				var quoteId = busComp.GetFieldValue(""Quote Id"");
				var prodId = busComp.GetFieldValue(""Root Product Id"");
				var rootQuoteItemId = busComp.GetFieldValue(""Root Quote Item Id"");
			
				var invItemId = busComp.GetFieldValue(""External Inventory System Ref"");
 				var bOracleProduct = false;
											
				if ((invItemId != null) && (invItemId != """")) 
				{
						bOracleProduct = true;
				}

				if (bOracleProduct)
				{
					try
					{
						var indata1 =TheApplication().NewPropertySet ();
						var outdata1 = TheApplication().NewPropertySet ();
						indata1.SetProperty (""RootItemId"", rootQuoteItemId);
						indata1.SetProperty (""QuoteorOrderorAgreementId"", quoteId);
						indata1.SetProperty(""SourceConfigHeader"",sourceConfigHeader);
						indata1.SetProperty(""SourceConfigRevNbr"",sourceConfigRevNbr);
						indata1.SetProperty(""BusinessObject"",busObj.Name());
						indata1.SetProperty(""BusinessComponent"",busComp.Name());
						
						
						var svc1 = TheApplication().GetService(""CZIntegCopyConfigService"");
						svc1.InvokeMethod(""CopyOracleConfiguration"", indata1, outdata1);
						
						var destConfigRevNbr = outdata1.GetProperty(""DestConfigRevNbr"");
						var destConfigHeader = outdata1.GetProperty(""DestConfigHeader"");
						
						//for the root item
						busComp.SetFieldValue(""External Configurator Reference 1"",destConfigHeader);
						busComp.SetFieldValue(""External Configurator Reference 2"",destConfigRevNbr );
					}
					catch  (e) 
					{
						TheApplication().RaiseErrorText(e.toString());
						TheApplication().Trace(e.toString());
						var error = e.toString();
						throw e;
					}
					finally
					{
					  destConfigRevNbr = null;
					  destConfigHeader = null;
						indata1 = null;
						svc1 = null;
					}
				} //  end if (bOracleProduct)
			}
			catch  (e) 
			{
				TheApplication().RaiseErrorText(e.toString());
				TheApplication().Trace(e.toString());
				var error = e.toString();
				throw e;
			}
			finally 
			{
				if (busObj != null) { busObj = null;}
				if (busComp != null) {busComp = null;}
				
				sourceConfigHeader =  null;
				sourceConfigRevNbr = null;
				quoteId = null;
				prodId = null;
				rootQuoteItemId = null;
			
		}
	} // end if (MethodName == ""CopyRecord"")


}
"
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if (MethodName == ""STCBudgetApprove"")
	{
		if (this.BusComp().GetFieldValue(""Approval Status"") == ""Needs Revision"")
		{
			CanInvoke = ""TRUE"";
			return(CancelOperation);
		}
	}

	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	if (MethodName == ""STCBudgetApprove"")
	{
		var sBC:BusComp = this.BusComp();
		//var ApprStatus = sBC.GetFieldValue(""Approval Status"");
        var vId = sBC.GetFieldValue(""Id"");
		var vName = sBC.GetFieldValue(""Name"");
        var vTotal = sBC.GetFieldValue(""Total Requested"");
        var sId = TheApplication().LoginId();

        var svc1:Service = TheApplication().GetService(""Campaign Budget Approval Process"");
		var Input:PropertySet = TheApplication().NewPropertySet();
		var Output:PropertySet = TheApplication().NewPropertySet();
		Input.SetProperty(""BudgetId"",vId); // Input Agruments
		Input.SetProperty(""Name"",vName); // Input Agruments
		Input.SetProperty(""vTotal"",vTotal); // Input Agruments
		Input.SetProperty(""LoginId"",sId); // Input Agruments
		svc1.InvokeMethod(""Approval"", Input, Output);  
        this.BusComp().InvokeMethod(""RefreshRecord"");

		return(CancelOperation);
	}
	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{

}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if (MethodName ==""RejectOffer"")
    {
        CanInvoke =""TRUE""           
        return (CancelOperation); 
    }    
    else
        return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if (MethodName ==""RejectOffer"")
    {
        CanInvoke =""TRUE""           
        return (CancelOperation); 
    }    
    else
        return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if (MethodName ==""RejectOffer"")
    {
        CanInvoke =""TRUE""           
        return (CancelOperation); 
    }    
    else
        return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if(MethodName == ""Import""){
		CanInvoke = ""TRUE"";
		return(CancelOperation);
	}	
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	if(MethodName == ""DeleteRecord"" || MethodName == ""CopyRecord"" || MethodName == ""NewRecord""  )
	{
		return(CancelOperation);			
	}
	return (ContinueOperation);
}
function WebApplet_InvokeMethod (MethodName)
{

	  //  if this is a copy process, for a line item,
	  //  we need to invoke the Oracle copy business Service
	  //  which will make the call to copy the corresponding
	  //  configuration in Oracle and then update the lines
	  //  in Siebel with the Configuration Header and Rev Number
  
	 if (MethodName == ""CopyRecord"") 
	 {
		  try 
		  {
				var busObj = this.BusObject();
				var busComp = this.BusComp();
				var sourceConfigHeader =  busComp.GetFieldValue(""External Configurator Reference 1"");
				var sourceConfigRevNbr = busComp.GetFieldValue(""External Configurator Reference 2"");
				var orderId = busComp.GetFieldValue(""Order Header Id"");
				var prodId = busComp.GetFieldValue(""Root Product Id"");
				var rootOrderItemId = busComp.GetFieldValue(""Root Order Item Id"");
				
				var invItemId = busComp.GetFieldValue(""External Inventory System Ref"");
 				var bOracleProduct = false;
											
				if ((invItemId != null) && (invItemId != """")) 
				{
						bOracleProduct = true;
				}

				if (bOracleProduct)
				{
					try
					{
						var indata1 =TheApplication().NewPropertySet ();
						var outdata1 = TheApplication().NewPropertySet ();
						indata1.SetProperty (""RootItemId"", rootOrderItemId);
						indata1.SetProperty (""QuoteorOrderorAgreementId"", orderId);
						indata1.SetProperty(""SourceConfigHeader"",sourceConfigHeader);
						indata1.SetProperty(""SourceConfigRevNbr"",sourceConfigRevNbr);
						indata1.SetProperty(""BusinessObject"",busObj.Name());
						indata1.SetProperty(""BusinessComponent"",busComp.Name());
												
						var svc1 = TheApplication().GetService(""CZIntegCopyConfigService"");
						svc1.InvokeMethod(""CopyOracleConfiguration"", indata1, outdata1);
						
						var destConfigRevNbr = outdata1.GetProperty(""DestConfigRevNbr"");
						var destConfigHeader = outdata1.GetProperty(""DestConfigHeader"");
						
						//for the root item
						busComp.SetFieldValue(""External Configurator Reference 1"",destConfigHeader);
						busComp.SetFieldValue(""External Configurator Reference 2"",destConfigRevNbr );
					}
					catch  (e) 
					{
						TheApplication().RaiseErrorText(e.toString());
						TheApplication().Trace(e.toString());
						var error = e.toString();
						throw e;
					}
					finally
					{
					  destConfigRevNbr = null;
					  destConfigHeader = null;
						indata1 = null;
						svc1 = null;
					}
				} //  end if (bOracleProduct)
			}
			catch  (e) 
			{
				TheApplication().RaiseErrorText(e.toString());
				TheApplication().Trace(e.toString());
				var error = e.toString();
				throw e;
			}
			finally 
			{
				if (busObj != null) { busObj = null;}
				if (busComp != null) {busComp = null;}
				
				sourceConfigHeader =  null;
				sourceConfigRevNbr = null;
				prodId = null;
				orderId = null;
				rootOrderItemId = null;
			
		}
	} // end if (MethodName == ""CopyRecord"")


}
"
function ALLPLANAllowed()
{
		var Allowed = ""No"";
		var appObj = TheApplication();                 
	    var SRValidationBS = appObj.GetService(""STC SR Validate Utilities"") ;
	    var psInputs = appObj.NewPropertySet();
	    var psOutputs = appObj.NewPropertySet();         
	    psInputs.SetProperty(""LOVTYPE"",""STC_MENA_VIVA_ADMIN_USER"");
		SRValidationBS.InvokeMethod(""CheckPosition"",psInputs,psOutputs); 
		Allowed = psOutputs.GetProperty(""LOVAvailable"");

return(Allowed);
}
function CheckMENAADMINFlag()
{
		var Allowed = ""No"";
		var appObj = TheApplication();                 
	    var SRValidationBS = appObj.GetService(""STC SR Validate Utilities"") ;
	    var psInputs = appObj.NewPropertySet();
	    var psOutputs = appObj.NewPropertySet();         
	    psInputs.SetProperty(""LOVTYPE"",""STC_MENA_ADMIN_USER"");
		SRValidationBS.InvokeMethod(""CheckPosition"",psInputs,psOutputs); 
		Allowed = psOutputs.GetProperty(""LOVAvailable"");

return(Allowed);
}
function DowngradeRevert()
{
try
{
		var appObj = TheApplication();
		var psInputs = appObj.NewPropertySet();
		var psOutputs = appObj.NewPropertySet();
		var svcBusSrv = """";
		var OrderId = this.BusComp().GetFieldValue(""Order Header Id"");
		with(psInputs)
		{
			SetProperty(""Object Id"",OrderId);
			SetProperty(""Operation"",""REVERTDOWNGRADE"");
			SetProperty(""ProcessName"",""STC Upgrade Downgrade Rules Order Process WF"");
		}
		svcBusSrv = appObj.GetService(""Workflow Process Manager"");
		svcBusSrv.InvokeMethod(""RunProcess"",psInputs,psOutputs);
}
catch(e)
{

}
finally
{
appObj = null;
psInputs = null;
psOutputs = null;
svcBusSrv = null;
}

}
function WebApplet_InvokeMethod (MethodName)
{

	  //  if this is a copy process, for a line item,
	  //  we need to invoke the Oracle copy business Service
	  //  which will make the call to copy the corresponding
	  //  configuration in Oracle and then update the lines
	  //  in Siebel with the Configuration Header and Rev Number
  
	 if (MethodName == ""CopyRecord"") 
	 {
		  try 
		  {
				var busObj = this.BusObject();
				var busComp = this.BusComp();
				var sourceConfigHeader =  busComp.GetFieldValue(""External Configurator Reference 1"");
				var sourceConfigRevNbr = busComp.GetFieldValue(""External Configurator Reference 2"");
				var orderId = busComp.GetFieldValue(""Order Header Id"");
				var prodId = busComp.GetFieldValue(""Root Product Id"");
				var rootOrderItemId = busComp.GetFieldValue(""Root Order Item Id"");
				
				var invItemId = busComp.GetFieldValue(""External Inventory System Ref"");
 				var bOracleProduct = false;
											
				if ((invItemId != null) && (invItemId != """")) 
				{
						bOracleProduct = true;
				}

				if (bOracleProduct)
				{
					try
					{
						var indata1 =TheApplication().NewPropertySet ();
						var outdata1 = TheApplication().NewPropertySet ();
						indata1.SetProperty (""RootItemId"", rootOrderItemId);
						indata1.SetProperty (""QuoteorOrderorAgreementId"", orderId);
						indata1.SetProperty(""SourceConfigHeader"",sourceConfigHeader);
						indata1.SetProperty(""SourceConfigRevNbr"",sourceConfigRevNbr);
						indata1.SetProperty(""BusinessObject"",busObj.Name());
						indata1.SetProperty(""BusinessComponent"",busComp.Name());
												
						var svc1 = TheApplication().GetService(""CZIntegCopyConfigService"");
						svc1.InvokeMethod(""CopyOracleConfiguration"", indata1, outdata1);
						
						var destConfigRevNbr = outdata1.GetProperty(""DestConfigRevNbr"");
						var destConfigHeader = outdata1.GetProperty(""DestConfigHeader"");
						
						//for the root item
						busComp.SetFieldValue(""External Configurator Reference 1"",destConfigHeader);
						busComp.SetFieldValue(""External Configurator Reference 2"",destConfigRevNbr );
					}
					catch  (e) 
					{
						TheApplication().RaiseErrorText(e.toString());
						TheApplication().Trace(e.toString());
						var error = e.toString();
						throw e;
					}
					finally
					{
					  destConfigRevNbr = null;
					  destConfigHeader = null;
						indata1 = null;
						svc1 = null;
					}
				} //  end if (bOracleProduct)
			}
			catch  (e) 
			{
				TheApplication().RaiseErrorText(e.toString());
				TheApplication().Trace(e.toString());
				var error = e.toString();
				throw e;
			}
			finally 
			{
				if (busObj != null) { busObj = null;}
				if (busComp != null) {busComp = null;}
				
				sourceConfigHeader =  null;
				sourceConfigRevNbr = null;
				prodId = null;
				orderId = null;
				rootOrderItemId = null;
			
		}
	} // end if (MethodName == ""CopyRecord"")


}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var ireturn;
	var sStatus;
	var sType;
	var appObj;
	var sOrderId;
	var sBusComp;
	try
	{
		if( TheApplication().GetProfileAttr(""gRefreshCurrentApplet"") == ""Y"")
		{	
			TheApplication().GetService(""FINS Teller UI Navigation"").InvokeMethod (""RefreshCurrentApplet"", TheApplication().NewPropertySet(), TheApplication().NewPropertySet());
			TheApplication().SetProfileAttr(""gRefreshCurrentApplet"","""");
		}
		switch(MethodName) 
		{
			case ""NewRecord"":
			appObj = TheApplication();
			CanInvoke = ""true"";
			sStatus = this.BusComp().ParentBusComp().GetFieldValue(""Status"");
			sType = this.BusComp().ParentBusComp().GetFieldValue(""STC Order SubType"");
			sOrderId = this.BusComp().ParentBusComp().GetFieldValue(""Id"");
			if(sType == appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_TYPE"",""Provide""))
			{
				if(sStatus == appObj.InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""In Progress""))
				{
					CanInvoke = ""true"";
				}
				else
				{
					CanInvoke = "false"";
				}
			}
			else
			{
				CanInvoke = "false"";
			}
			ireturn = CancelOperation;
			break;

			case ""DeleteRecord"":
			appObj = TheApplication();
			CanInvoke = ""true"";
			sStatus = this.BusComp().ParentBusComp().GetFieldValue(""Status"");
			sType = this.BusComp().ParentBusComp().GetFieldValue(""STC Order SubType"");
			var sVoucherFlag = this.BusComp().GetFieldValue(""STC Voucher Promotion Flag"");
			var sPayRec = this.BusComp().ParentBusComp().GetFieldValue(""PaymentCount"");
			if ( sVoucherFlag == ""Y"")
			{
				if (sPayRec == ""Y"")
				CanInvoke = "false"";
				else
				CanInvoke = ""true"";
			}
			else
			{
				if(sType == appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_TYPE"",""Provide""))
				{
					if(sStatus == appObj.InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""In Progress""))
					{
						CanInvoke = ""true"";
					}
					else
					{
						CanInvoke = "false"";
					}
				}
				else
				{
					CanInvoke = "false"";
				}
			}
			ireturn = CancelOperation;
			break;

			case ""ABOReconfigureCxProd"":
			{
				CanInvoke = ""true"";
				this.BusComp().ParentBusComp().ActivateField(""Delivery Block"");
				var vOrderDeliveryBlock = this.BusComp().ParentBusComp().GetFieldValue(""Delivery Block"");
				var vOrderStatus = this.BusComp().ParentBusComp().GetFieldValue(""Status"");
				var vOrderType = this.BusComp().ParentBusComp().GetFieldValue(""STC Order SubType"");
				var vOrderSubStatus = this.BusComp().ParentBusComp().GetFieldValue(""STC Order Sub Status"");
				var vOrderStatCancelled = TheApplication().InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""Cancelled"");
				var vOrderStatComplete = TheApplication().InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""Complete"");
				var vOrderStatSubmitted = TheApplication().InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""Submitted"");
				var vOrderSubStatPending = TheApplication().InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Pending Approval"");
				var vOrderSubStatPendVer = TheApplication().InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Pending Verification"");
				var vChannel = this.BusComp().ParentBusComp().GetFieldValue(""STC Channel"");
				var vOrderSubStatActivity = TheApplication().InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Waiting Activity Completion"");
				if(vOrderSubStatus == vOrderSubStatActivity)
				{
					CanInvoke = "false"";
				}
				else if(vOrderType == ""Modify"" && vOrderDeliveryBlock == ""Pre Pre Under Diff Customer"")
				{
					CanInvoke = "false"";
				}
				else if(vChannel == TheApplication().InvokeMethod(""LookupValue"",""STC_ORDER_CHANNEL"",""eCommerce""))
				{
					CanInvoke = "false"";
				}
				else
				{
					if ((vOrderStatus != vOrderStatCancelled) && (vOrderStatus != vOrderStatComplete) && (vOrderStatus != vOrderStatSubmitted) && (vOrderSubStatus != vOrderSubStatPending) && (vOrderSubStatus != vOrderSubStatPendVer))
					{
						CanInvoke = ""true"";
					}
					else
					{
						CanInvoke = "false"";
					}
				}
				ireturn = CancelOperation;
				break;
			}
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
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var ireturn;
	var sStatus;
	var sType;
	var appObj;
	var sOrderId;
	var sBusComp;
	try
	{
		if( TheApplication().GetProfileAttr(""gRefreshCurrentApplet"") == ""Y"")
		{	
			TheApplication().GetService(""FINS Teller UI Navigation"").InvokeMethod (""RefreshCurrentApplet"", TheApplication().NewPropertySet(), TheApplication().NewPropertySet());
			TheApplication().SetProfileAttr(""gRefreshCurrentApplet"","""");
		}
		switch(MethodName) 
		{
			case ""NewRecord"":
			appObj = TheApplication();
			CanInvoke = ""true"";
			sStatus = this.BusComp().ParentBusComp().GetFieldValue(""Status"");
			sType = this.BusComp().ParentBusComp().GetFieldValue(""STC Order SubType"");
			sOrderId = this.BusComp().ParentBusComp().GetFieldValue(""Id"");
			if(sType == appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_TYPE"",""Provide""))
			{
				if(sStatus == appObj.InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""In Progress""))
				{
					CanInvoke = ""true"";
				}
				else
				{
					CanInvoke = "false"";
				}
			}
			else
			{
				CanInvoke = "false"";
			}
			ireturn = CancelOperation;
			break;

			case ""DeleteRecord"":
			appObj = TheApplication();
			CanInvoke = ""true"";
			sStatus = this.BusComp().ParentBusComp().GetFieldValue(""Status"");
			sType = this.BusComp().ParentBusComp().GetFieldValue(""STC Order SubType"");
			var sVoucherFlag = this.BusComp().GetFieldValue(""STC Voucher Promotion Flag"");
			var sPayRec = this.BusComp().ParentBusComp().GetFieldValue(""PaymentCount"");
			if ( sVoucherFlag == ""Y"")
			{
				if (sPayRec == ""Y"")
				CanInvoke = "false"";
				else
				CanInvoke = ""true"";
			}
			else
			{
				if(sType == appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_TYPE"",""Provide""))
				{
					if(sStatus == appObj.InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""In Progress""))
					{
						CanInvoke = ""true"";
					}
					else
					{
						CanInvoke = "false"";
					}
				}
				else
				{
					CanInvoke = "false"";
				}
			}
			ireturn = CancelOperation;
			break;

			case ""ABOReconfigureCxProd"":
			{
				CanInvoke = ""true"";
				this.BusComp().ParentBusComp().ActivateField(""Delivery Block"");
				var vOrderDeliveryBlock = this.BusComp().ParentBusComp().GetFieldValue(""Delivery Block"");
				var vOrderStatus = this.BusComp().ParentBusComp().GetFieldValue(""Status"");
				var vOrderType = this.BusComp().ParentBusComp().GetFieldValue(""STC Order SubType"");
				var vOrderSubStatus = this.BusComp().ParentBusComp().GetFieldValue(""STC Order Sub Status"");
				var vOrderStatCancelled = TheApplication().InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""Cancelled"");
				var vOrderStatComplete = TheApplication().InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""Complete"");
				var vOrderStatSubmitted = TheApplication().InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""Submitted"");
				var vOrderSubStatPending = TheApplication().InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Pending Approval"");
				var vOrderSubStatPendVer = TheApplication().InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Pending Verification"");
				var vChannel = this.BusComp().ParentBusComp().GetFieldValue(""STC Channel"");
				var vOrderSubStatActivity = TheApplication().InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Waiting Activity Completion"");
				var vOrderSubStatFulFillment = TheApplication().InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Awaiting Fulfilment"");
				var vOrderSubStatLineCreation = TheApplication().InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Awaiting Line Creation"");
				if(vOrderSubStatus == vOrderSubStatActivity)
				{
					CanInvoke = "false"";
				}
				else if (vOrderSubStatus == vOrderSubStatFulFillment)
				{
					CanInvoke = "false"";
				}
				else if (vOrderSubStatus == vOrderSubStatLineCreation) // Pankaj: Added for PT PBI000000007168
				{
					CanInvoke = "false"";
				}
				else if(vOrderType == ""Modify"" && vOrderDeliveryBlock == ""Pre Pre Under Diff Customer"")
				{
					CanInvoke = "false"";
				}
				else if(vChannel == TheApplication().InvokeMethod(""LookupValue"",""STC_ORDER_CHANNEL"",""eCommerce""))
				{
					CanInvoke = "false"";
				}
				else
				{
					if ((vOrderStatus != vOrderStatCancelled) && (vOrderStatus != vOrderStatComplete) && (vOrderStatus != vOrderStatSubmitted) && (vOrderSubStatus != vOrderSubStatPending) && (vOrderSubStatus != vOrderSubStatPendVer))
					{
						CanInvoke = ""true"";
					}
					else
					{
						CanInvoke = "false"";
					}
				}
				ireturn = CancelOperation;
				break;
			}
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
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var ireturn;
	var sStatus;
	var sType;
	var appObj;
	var sOrderId;
	var sBusComp;
	try
	{
		if( TheApplication().GetProfileAttr(""gRefreshCurrentApplet"") == ""Y"")
		{	
			TheApplication().GetService(""FINS Teller UI Navigation"").InvokeMethod (""RefreshCurrentApplet"", TheApplication().NewPropertySet(), TheApplication().NewPropertySet());
			TheApplication().SetProfileAttr(""gRefreshCurrentApplet"","""");
		}
		switch(MethodName) 
		{
			case ""NewRecord"":
			appObj = TheApplication();
			CanInvoke = ""true"";
			sStatus = this.BusComp().ParentBusComp().GetFieldValue(""Status"");
			sType = this.BusComp().ParentBusComp().GetFieldValue(""STC Order SubType"");
			sOrderId = this.BusComp().ParentBusComp().GetFieldValue(""Id"");
			if(sType == appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_TYPE"",""Provide""))
			{
				if(sStatus == appObj.InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""In Progress""))
				{
					CanInvoke = ""true"";
				}
				else
				{
					CanInvoke = "false"";
				}
			}
			else
			{
				CanInvoke = "false"";
			}
			ireturn = CancelOperation;
			break;

			case ""DeleteRecord"":
			appObj = TheApplication();
			CanInvoke = ""true"";
			sStatus = this.BusComp().ParentBusComp().GetFieldValue(""Status"");
			sType = this.BusComp().ParentBusComp().GetFieldValue(""STC Order SubType"");
			var sVoucherFlag = this.BusComp().GetFieldValue(""STC Voucher Promotion Flag"");
			var sPayRec = this.BusComp().ParentBusComp().GetFieldValue(""PaymentCount"");
			if ( sVoucherFlag == ""Y"")
			{
				if (sPayRec == ""Y"")
				CanInvoke = "false"";
				else
				CanInvoke = ""true"";
			}
			else
			{
				if(sType == appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_TYPE"",""Provide""))
				{
					if(sStatus == appObj.InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""In Progress""))
					{
						CanInvoke = ""true"";
					}
					else
					{
						CanInvoke = "false"";
					}
				}
				else
				{
					CanInvoke = "false"";
				}
			}
			ireturn = CancelOperation;
			break;

			case ""ABOReconfigureCxProd"":
			{
				CanInvoke = ""true"";
				this.BusComp().ParentBusComp().ActivateField(""Delivery Block"");
				var vOrderDeliveryBlock = this.BusComp().ParentBusComp().GetFieldValue(""Delivery Block"");
				var vOrderStatus = this.BusComp().ParentBusComp().GetFieldValue(""Status"");
				var vOrderType = this.BusComp().ParentBusComp().GetFieldValue(""STC Order SubType"");
				var vOrderSubStatus = this.BusComp().ParentBusComp().GetFieldValue(""STC Order Sub Status"");
				var vOrderStatCancelled = TheApplication().InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""Cancelled"");
				var vOrderStatComplete = TheApplication().InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""Complete"");
				var vOrderStatSubmitted = TheApplication().InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""Submitted"");
				var vOrderSubStatPending = TheApplication().InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Pending Approval"");
				var vOrderSubStatPendVer = TheApplication().InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Pending Verification"");
				var vChannel = this.BusComp().ParentBusComp().GetFieldValue(""STC Channel"");
				var vOrderSubStatActivity = TheApplication().InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Waiting Activity Completion"");
				var vOrderSubStatFulFillment = TheApplication().InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Awaiting Fulfilment"");
				if(vOrderSubStatus == vOrderSubStatActivity)
				{
					CanInvoke = "false"";
				}
				else if (vOrderSubStatus == vOrderSubStatFulFillment)
				{
					CanInvoke = "false"";
				}
				else if(vOrderType == ""Modify"" && vOrderDeliveryBlock == ""Pre Pre Under Diff Customer"")
				{
					CanInvoke = "false"";
				}
				else if(vChannel == TheApplication().InvokeMethod(""LookupValue"",""STC_ORDER_CHANNEL"",""eCommerce""))
				{
					CanInvoke = "false"";
				}
				else
				{
					if ((vOrderStatus != vOrderStatCancelled) && (vOrderStatus != vOrderStatComplete) && (vOrderStatus != vOrderStatSubmitted) && (vOrderSubStatus != vOrderSubStatPending) && (vOrderSubStatus != vOrderSubStatPendVer))
					{
						CanInvoke = ""true"";
					}
					else
					{
						CanInvoke = "false"";
					}
				}
				ireturn = CancelOperation;
				break;
			}
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
function WebApplet_PreInvokeMethod (MethodName)
{
	try
	{
		var appObj;		
		var PackagePart;
		var PackPartStr;
		var DatacomPkg = ""N"";
		var MENAAllowed = ""No"";
		var vALLPLANAllowed = ""No"";
		var OrderSubstatus;
		var OrderLOVSubstatus;
		var OrdernewSubstatus;
		var OrderHeaderId;
		var boOrder;
		var bcOrder;
		var bcOrderLine;
		var boRMSNumberEnquiry;
		var bcRMSNumberEnquiry;
		var sMSISDN;
		var bRecordExists; 
		var strExpr;
		var CustomerPlan;
		var sExistingPlan = """";
		var sSplCat = """";
		OrderHeaderId = this.BusComp().ParentBusComp().GetFieldValue(""Id"");
		appObj = TheApplication();
		var sSIM;
		//Mayank: Added for Ecom
		if(MethodName == ""STCEcomPreBooking"")
		{
			var sCPR = this.BusComp().ParentBusComp().GetFieldValue(""STC Subscriber Id"");
			appObj.SetProfileAttr(""EcomCPR"",sCPR);
			OrderHeaderId = this.BusComp().GetFieldValue(""Order Header Id"");
			appObj.SetProfileAttr(""EcomOrderId"",OrderHeaderId);
			var sBS = TheApplication().GetService(""SLM Save List Service"");
			var psEcomInp = TheApplication().NewPropertySet();
			var psEcomOut = TheApplication().NewPropertySet();
			psEcomInp.SetProperty(""Applet Height"", ""400"");
			psEcomInp.SetProperty(""Applet Mode"", ""6"");                         
			psEcomInp.SetProperty(""Applet Name"", ""STC ECommerce PreBooking PopUp Applet"");
			psEcomInp.SetProperty(""Applet Width"", ""800"");
			sBS.InvokeMethod(""LoadPopupApplet"", psEcomInp , psEcomOut);
			return (CancelOperation); 
		}//Mayank: Added for Ecom
		if(MethodName == ""ABOReconfigureCxProd"")
		{
		//[MANUJ] : [Datacom Tier Provisioning]
			var OrderProfType = this.BusComp().ParentBusComp().GetFieldValue(""STC Order Profile Type"");
			if(OrderProfType == ""DATACOMTIER"")
			{
				TheApplication().RaiseErrorText(""Please note that this is a datacom Tier Provisioning Order and cannot be customized."");
			}
		//SUMANK: Added below for Plan Visibility MENA Plans
			OrderHeaderId = this.BusComp().GetFieldValue(""Order Header Id"");
			boOrder = appObj.GetBusObject(""Order Entry (Sales)"");
			bcOrder = boOrder.GetBusComp(""Order Entry - Orders"");
			MENAAllowed = CheckMENAADMINFlag();
			vALLPLANAllowed = ALLPLANAllowed();
	//		TheApplication().RaiseErrorText(MENAAllowed+""  ""+vALLPLANAllowed);

			if(MENAAllowed != ""No"" || vALLPLANAllowed != ""No"")
			{
					with(bcOrder)
					{	
					ActivateField(""STC USER POSITION"");
					SetViewMode(AllView);
					ClearToQuery();
					SetSearchSpec(""Id"",OrderHeaderId);
					ExecuteQuery(ForwardOnly);
					var OrderRec = FirstRecord();
					if(OrderRec)
					{
					if(MENAAllowed == ""Yes"" && vALLPLANAllowed == ""No"")
					{
						SetFieldValue(""STC USER POSITION"",""MENA"");
					}
					 	else if(MENAAllowed == ""No"" && vALLPLANAllowed == ""Yes"")
						{
							SetFieldValue(""STC USER POSITION"",""ALLPLANS"");
						}

					}
						WriteRecord();
						InvokeMethod(""RefreshRecord"");
					}
			}

			
//SUMANK: Added above for Plan Visibility MENA Plans
			//[MANUJ] : [Upgrade Downgrade Rules] : [Start]
			this.BusComp().ParentBusComp().ActivateField(""STC Downgrade Flag"");
			this.BusComp().ParentBusComp().ActivateField(""STC Upgrade Type"");
			
			var DowngradeFlag = this.BusComp().ParentBusComp().GetFieldValue(""STC Downgrade Flag"");
			var ContScenario = this.BusComp().ParentBusComp().GetFieldValue(""STC Upgrade Type"");
			if(DowngradeFlag == ""Y"" || ContScenario == ""Upgrade"" || ContScenario == ""Downgrade"")
			{
				DowngradeRevert();
			}
			//[MANUJ] : [Upgrade Downgrade Rules] : [End]
			boRMSNumberEnquiry = TheApplication().GetBusObject(""RMS NM Number Enquiry"");
			bcRMSNumberEnquiry = boRMSNumberEnquiry.GetBusComp(""RMS NM Number Enquiry"");
			
			var CurrBC = this.BusComp();
			with(CurrBC){
			ActivateField(""Service Id"");
			ActivateField(""Part Number"");// 1.1	
			PackagePart = GetFieldValue(""Part Number"");	// 1.1
			var vRecId = GetFieldValue(""Order Header Id"");
			ActivateField(""Service Id"");
			sMSISDN = GetFieldValue(""Service Id"");
			
			ActivateField(""STC ICCID"");
			sSIM = GetFieldValue(""STC ICCID"");
			var PackPartStrA = appObj.InvokeMethod(""LookupValue"", ""STC_AVAYA_PILOT_PACK"", PackagePart);
			var StrPackAvaya = PackPartStrA.substring(0,10);
			if(StrPackAvaya == ""AVAYAPILOT"")
			{
			if(sMSISDN != """" || sMSISDN != '' || sMSISDN != null)
				{
				if(sSIM == """" || sSIM == '' || sSIM == null)
				{
				var STCWorkflowProc = appObj.GetService(""Workflow Process Manager"");
				var PSInput = appObj.NewPropertySet();
				var PSOutput = appObj.NewPropertySet();
				PSInput.SetProperty(""Object Id"",vRecId);
				PSInput.SetProperty(""ProcessName"",""STC Update SIM MSISDN Datacom WF"");
				PSInput.SetProperty(""Operation"",""Avaya"");
				STCWorkflowProc.InvokeMethod(""RunProcess"", PSInput, PSOutput);
				}
				}
			}
			PackPartStr = appObj.InvokeMethod(""LookupValue"", ""STC_DATACOM_AUTO_SIM"", PackagePart);//1.1
			var StrPackDatacom = PackPartStr.substring(0,3);
			if(StrPackDatacom == ""SIP"")
			{
			if(sMSISDN != """" || sMSISDN != '' || sMSISDN != null)
				{
				if(sSIM == """" || sSIM == '' || sSIM == null)
				{
				var STCWorkflowProc = appObj.GetService(""Workflow Process Manager"");
				var PSInput = appObj.NewPropertySet();
				var PSOutput = appObj.NewPropertySet();
				with(PSInput){
					SetProperty(""Object Id"",vRecId);
					SetProperty(""ProcessName"",""STC Update SIM MSISDN Datacom WF"");
					SetProperty(""Operation"",""SIP"");
				}
				STCWorkflowProc.InvokeMethod(""RunProcess"", PSInput, PSOutput);
				}
				}

			}
			if((StrPackDatacom == ""DPB"") || (StrPackDatacom == ""DCP""))
			{
				DatacomPkg = ""Y"";
				if(sMSISDN != """" || sMSISDN != '' || sMSISDN != null)
				{
				var STCWorkflowProc = appObj.GetService(""Workflow Process Manager"");
				var PSInput = appObj.NewPropertySet();
				var PSOutput = appObj.NewPropertySet();
				with (PSInput)
				{
					SetProperty(""Object Id"",vRecId);
					SetProperty(""ProcessName"",""STC Update SIM MSISDN Datacom WF"");
					SetProperty(""Operation"", StrPackDatacom);//[NAVIN:07Jun2017:BusCloudHostingSec]
				}
				STCWorkflowProc.InvokeMethod(""RunProcess"", PSInput, PSOutput);
				}	
			}
			var vRootId = this.BusComp().GetFieldValue(""Root Order Item Id""); //Start 28-09-2014 Anchal: Added for SD_Retails Provisioning Enhancements
			var vMNPFlag = this.BusComp().ParentBusComp().GetFieldValue(""STC Port In Flag"");
			this.BusComp().ParentBusComp().ActivateField(""STC Billing CPS Flag"");
			var strCarPreFlag = this.BusComp().ParentBusComp().GetFieldValue(""STC Billing CPS Flag"");
			var vRecId = this.BusComp().GetFieldValue(""Id"");
		}
			//RohitR:11-04-21: Sales Txn Automation
			var sSaleTxnSwtch = appObj.InvokeMethod(""LookupValue"", ""STC_SALE_TXN_SWCH"", ""SWITCH"");
			var sBBPck = appObj.InvokeMethod(""LookupValue"", ""STC_DATACOM_AUTO_SIM"", PackagePart);
			var sBBPckPart = PackPartStr.substring(0,3);
			//RohitR:11-04-21: Sales Txn Automation
			if((vRootId == vRecId) && (sMSISDN == null || sMSISDN == """") && vMNPFlag == ""No"")
			{
				if(strCarPreFlag == ""Y"" || DatacomPkg == ""Y"" || (sSaleTxnSwtch == ""Y"" && sBBPckPart == ""BBP""))//RohitR:11-04-21: Modified Search Spec for Sales Txn Automation
				{
				}
				else
				{
					TheApplication().RaiseErrorText(""Please select MSISDN.""); //End 28-09-2014 Anchal: Added for SD_Retails Provisioning Enhancements
				}
			}
			with (bcRMSNumberEnquiry)
			{				
				ActivateField(""Special Category Type"");
				ActivateField(""STC Customer Existing Plan"");
				ActivateField(""STC Migration Type"");
				ActivateField(""Type"");
				ActivateField(""Number String"");
				SetViewMode(AllView);
				ClearToQuery();
				strExpr = "" [Number String] = '""+ sMSISDN +""'"";
				SetSearchExpr(strExpr);
				ExecuteQuery(ForwardOnly);   
				bRecordExists = FirstRecord();
				if (bRecordExists)
				{
						sSplCat = GetFieldValue(""Special Category Type"");//22092014:New Retention Offer
						if(sSplCat == ""Bulk Message"")//22092014:New Retention Offer
						TheApplication().RaiseErrorText("" Customization not allowed for virtual MSISDN "");
						else{//22092014:New Retention Offer:below
						sExistingPlan = GetFieldValue(""STC Migration Type"");
						CustomerPlan = GetFieldValue(""STC Customer Existing Plan"");}
				}
			}
			OrderHeaderId = this.BusComp().GetFieldValue(""Order Header Id"");
			boOrder = appObj.GetBusObject(""Order Entry (Sales)"");
			bcOrder = boOrder.GetBusComp(""Order Entry - Orders"");
			with(bcOrder)
			{
				bcOrderLine = boOrder.GetBusComp(""Order Entry - Line Items"");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchSpec(""Id"",OrderHeaderId);
				ExecuteQuery(ForwardOnly);
				with(bcOrderLine)
				{
					var sBBWaiverPartNumber = appObj.InvokeMethod(""LookupValue"", ""STC_BB_WAIVER_PROD"",""BBSWFEEWAIVERPROD"");
					SetViewMode(AllView);
					ActivateField(""Part Number"");
					ActivateField(""STC Product Identifier"");
					ClearToQuery();
					//var strExprCon = ""[STC Voucher Promotion Flag] = 'Y' AND [Part Number] <> '""+ sBBWaiverPartNumber +""'""; //Old one commnented for Production issue .
					var strExprCon = ""[STC Voucher Promotion Flag] = 'Y' AND [Part Number] <> '""+ sBBWaiverPartNumber +""' AND ([STC Product Identifier] <>'PREBOOKING' OR [STC Product Identifier] IS NULL)"";
					SetSearchExpr(strExprCon);
					ExecuteQuery(ForwardOnly);
					if (FirstRecord())
					{
						appObj.RaiseErrorText(""Please delete Voucher/Promotion Discouunt Products first to continue customization."");
					}
				}
			
				SetViewMode(AllView);
				ActivateField(""STC Order Sub Status"");
				ActivateField(""STC Migrated Plan"");
				ClearToQuery();
				SetSearchSpec(""Id"",OrderHeaderId);
				ExecuteQuery(ForwardOnly);	
				
				if (FirstRecord())
				{
					OrderSubstatus = GetFieldValue(""STC Order Sub Status"");
					var MigType = appObj.InvokeMethod(""LookupValue"",""STC_MRC_DISC_TYPE"",sExistingPlan);
					var MigTypeStr = MigType.substring(0,5);
					if(MigTypeStr == ""ALLOW""){
					SetFieldValue(""STC Migrated Plan"",CustomerPlan);}//16/10/2014: Voice Plan Revamp to store Migrated Plan from MSISDN
					WriteRecord();//22092014:New Retention Offer
					InvokeMethod(""RefreshRecord"");					
				}
				OrderLOVSubstatus = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Order Validated"");
				OrdernewSubstatus = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Raised"");
				if(OrderLOVSubstatus == OrderSubstatus)
				{
					SetFieldValue(""STC Order Sub Status"",OrdernewSubstatus);
					WriteRecord();   
				}   
			} //end of with 
var svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
var psIn1 = TheApplication().NewPropertySet();
var psOut1 = TheApplication().NewPropertySet();
psIn1.SetProperty(""Refresh All"",""Y"");
svcUI.InvokeMethod(""RefreshCurrentApplet"",psIn1,psOut1);
		}
	if(MethodName == ""NewRecord"")
	{
		var sCPSFlg = """";
		var vMasterAccountType;
		var bcOrderBC = this.BusComp().ParentBusComp();
		with(bcOrderBC)
		{
			ActivateField(""STC Billing CPS Flag"");			
			sCPSFlg = this.BusComp().ParentBusComp().GetFieldValue(""STC Billing CPS Flag"");
			TheApplication().SetProfileAttr(""STCCPSFlag"", sCPSFlg);
			vMasterAccountType = this.BusComp().ParentBusComp().GetFieldValue(""STC Master Account Type""); //Anchal: Added for Retail Provisioning Flow Enhancements
			TheApplication().SetProfileAttr(""STCMasterAccountType"",vMasterAccountType); //Anchal: Added for Retail Provisioning Flow Enhancements
		}
	}
		return (ContinueOperation);   
	}					 
	catch(e)
	{
		throw(e);
	}
	finally
	{
		 bcOrder = null;
		 bcRMSNumberEnquiry = null;
		 boOrder = null;
		 boRMSNumberEnquiry = null;
		 appObj = null; 
	 }
 }
function WebApplet_InvokeMethod (MethodName)
{

	  //  if this is a copy process, for a line item,
	  //  we need to invoke the Oracle copy business Service
	  //  which will make the call to copy the corresponding
	  //  configuration in Oracle and then update the lines
	  //  in Siebel with the Configuration Header and Rev Number
  
	 if (MethodName == ""CopyRecord"") 
	 {
		  try 
		  {
				var busObj = this.BusObject();
				var busComp = this.BusComp();
				var sourceConfigHeader =  busComp.GetFieldValue(""External Configurator Reference 1"");
				var sourceConfigRevNbr = busComp.GetFieldValue(""External Configurator Reference 2"");
				var orderId = busComp.GetFieldValue(""Order Header Id"");
				var prodId = busComp.GetFieldValue(""Root Product Id"");
				var rootOrderItemId = busComp.GetFieldValue(""Root Order Item Id"");
				
				var isOCPi = TheApplication().NewPropertySet();
	    		var isOCPo = TheApplication().NewPropertySet();
		  	    var bOracleProduct ;
 											
				var productId = busComp.GetFieldValue(""Product Id"");
				
				//isOCPi.SetProperty(""BusCompName"",busComp.Name())
				isOCPi.SetProperty(""ProductId"",productId);
					
				var isOCPSvc = TheApplication().GetService(""CZSessionManagement"");
				isOCPSvc.InvokeMethod(""IsOracleConfigurableProduct"", isOCPi, isOCPo);
		
				bOracleProduct = isOCPo.GetProperty(""IsOracleProduct"");
				
				if (bOracleProduct == ""true"")
				{
					try
					{
						var indata1 =TheApplication().NewPropertySet ();
						var outdata1 = TheApplication().NewPropertySet ();
						indata1.SetProperty (""RootItemId"", rootOrderItemId);
						indata1.SetProperty (""QuoteorOrderorAgreementId"", orderId);
						indata1.SetProperty(""SourceConfigHeader"",sourceConfigHeader);
						indata1.SetProperty(""SourceConfigRevNbr"",sourceConfigRevNbr);
						indata1.SetProperty(""BusinessObject"",busObj.Name());
						indata1.SetProperty(""BusinessComponent"",busComp.Name());
												
						var svc1 = TheApplication().GetService(""CZIntegCopyConfigService"");
						svc1.InvokeMethod(""CopyOracleConfiguration"", indata1, outdata1);
						
						var destConfigRevNbr = outdata1.GetProperty(""DestConfigRevNbr"");
						var destConfigHeader = outdata1.GetProperty(""DestConfigHeader"");
					}
					catch  (e) 
					{
						TheApplication().Trace(e.toString());
						var error = e.toString();
						TheApplication().RaiseErrorText(e.toString());
						throw e;
					}
					finally
					{
								
						//for the root item
						busComp.SetFieldValue(""External Configurator Reference 1"",destConfigHeader);
						busComp.SetFieldValue(""External Configurator Reference 2"",destConfigRevNbr );
			
						destConfigRevNbr = null;
					    destConfigHeader = null;
						indata1 = null;
						svc1 = null;
					}
				} //  end if (bOracleProduct)
			}
			catch  (e) 
			{
				TheApplication().RaiseErrorText(e.toString());
				TheApplication().Trace(e.toString());
				var error = e.toString();
				throw e;
			}
			finally 
			{
				if (busObj != null) { busObj = null;}
				if (busComp != null) {busComp = null;}
				
				sourceConfigHeader =  null;
				sourceConfigRevNbr = null;
				orderId = null;
				prodId = null;
				rootOrderItemId = null;
							
				bOracleProduct = null;
				isOCPi = null;
				isOCPo = null;
				isOCPSvc = null;
			
			}
	} // end if (MethodName == ""CopyRecord"")


}
function WebApplet_InvokeMethod (MethodName)
{

	  //  if this is a copy process, for a line item,
	  //  we need to invoke the Oracle copy business Service
	  //  which will make the call to copy the corresponding
	  //  configuration in Oracle and then update the lines
	  //  in Siebel with the Configuration Header and Rev Number
  
	 if (MethodName == ""CopyRecord"") 
	 {
		  try 
		  {
				var busObj = this.BusObject();
				var busComp = this.BusComp();
				var sourceConfigHeader =  busComp.GetFieldValue(""External Configurator Reference 1"");
				var sourceConfigRevNbr = busComp.GetFieldValue(""External Configurator Reference 2"");
				var orderId = busComp.GetFieldValue(""Order Header Id"");
				var prodId = busComp.GetFieldValue(""Root Product Id"");
				var rootOrderItemId = busComp.GetFieldValue(""Root Order Item Id"");
				
				var isOCPi = TheApplication().NewPropertySet();
	    		var isOCPo = TheApplication().NewPropertySet();
		  	    var bOracleProduct ;
 											
				var productId = busComp.GetFieldValue(""Product Id"");
				
				//isOCPi.SetProperty(""BusCompName"",busComp.Name())
				isOCPi.SetProperty(""ProductId"",productId);
					
				var isOCPSvc = TheApplication().GetService(""CZSessionManagement"");
				isOCPSvc.InvokeMethod(""IsOracleConfigurableProduct"", isOCPi, isOCPo);
		
				bOracleProduct = isOCPo.GetProperty(""IsOracleProduct"");
				
				if (bOracleProduct == ""true"")
				{
					try
					{
						var indata1 =TheApplication().NewPropertySet ();
						var outdata1 = TheApplication().NewPropertySet ();
						indata1.SetProperty (""RootItemId"", rootOrderItemId);
						indata1.SetProperty (""QuoteorOrderorAgreementId"", orderId);
						indata1.SetProperty(""SourceConfigHeader"",sourceConfigHeader);
						indata1.SetProperty(""SourceConfigRevNbr"",sourceConfigRevNbr);
						indata1.SetProperty(""BusinessObject"",busObj.Name());
						indata1.SetProperty(""BusinessComponent"",busComp.Name());
												
						var svc1 = TheApplication().GetService(""CZIntegCopyConfigService"");
						svc1.InvokeMethod(""CopyOracleConfiguration"", indata1, outdata1);
						
						var destConfigRevNbr = outdata1.GetProperty(""DestConfigRevNbr"");
						var destConfigHeader = outdata1.GetProperty(""DestConfigHeader"");
					}
					catch  (e) 
					{
						TheApplication().Trace(e.toString());
						var error = e.toString();
						TheApplication().RaiseErrorText(e.toString());
						throw e;
					}
					finally
					{
								
						//for the root item
						busComp.SetFieldValue(""External Configurator Reference 1"",destConfigHeader);
						busComp.SetFieldValue(""External Configurator Reference 2"",destConfigRevNbr );
			
						destConfigRevNbr = null;
					    destConfigHeader = null;
						indata1 = null;
						svc1 = null;
					}
				} //  end if (bOracleProduct)
			}
			catch  (e) 
			{
				TheApplication().RaiseErrorText(e.toString());
				TheApplication().Trace(e.toString());
				var error = e.toString();
				throw e;
			}
			finally 
			{
				if (busObj != null) { busObj = null;}
				if (busComp != null) {busComp = null;}
				
				sourceConfigHeader =  null;
				sourceConfigRevNbr = null;
				orderId = null;
				prodId = null;
				rootOrderItemId = null;
							
				bOracleProduct = null;
				isOCPi = null;
				isOCPo = null;
				isOCPSvc = null;
			
			}
	} // end if (MethodName == ""CopyRecord"")


}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var ireturn;
	var sStatus;
	var sType;
	var appObj;
	var sOrderId;
	var sBusComp;
	try
	{
		switch(MethodName) 
		{
			case ""NewRecord"":
				appObj = TheApplication();
				CanInvoke = ""true"";
				sStatus = this.BusComp().ParentBusComp().GetFieldValue(""Status"");
				sType = this.BusComp().ParentBusComp().GetFieldValue(""STC Order SubType"");
				sOrderId = this.BusComp().ParentBusComp().GetFieldValue(""Id"");
				if(sType == appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_TYPE"",""Provide""))
				{
					if(sStatus == appObj.InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""In Progress""))
					{
				    	CanInvoke = ""true"";
					   /* sBusComp = this.BusComp();
					   	with(sBusComp)
						{ 
						   SetViewMode(AllView);
						   ClearToQuery();
						   ActivateField(""Order Header Id"");
						   SetSearchSpec(""Order Header Id"",sOrderId);
						   ExecuteQuery(ForwardOnly);
						   
						  if(FirstRecord())
						      CanInvoke = "false"";
						  else
						      CanInvoke = ""true"";
						 }   
						 */     
								
						
					}
					else
					{
						CanInvoke = "false"";
					}
				}
				else
				{
					CanInvoke = "false"";
				}
				ireturn = CancelOperation;
				break;
				
			case ""DeleteRecord"":
				appObj = TheApplication();
				CanInvoke = ""true"";
				sStatus = this.BusComp().ParentBusComp().GetFieldValue(""Status"");
				sType = this.BusComp().ParentBusComp().GetFieldValue(""STC Order SubType"");
				if(sType == appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_TYPE"",""Provide""))
				{
					if(sStatus == appObj.InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""In Progress""))
					{
						CanInvoke = ""true"";
					}
					else
					{
						CanInvoke = "false"";
					}
				}
				else
				{
					CanInvoke = "false"";
				}
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
function WebApplet_PreInvokeMethod (MethodName)
{
	try
	{
		if(MethodName == ""CopyRecord"" || MethodName == ""NewRecord"")
		{
			return(CancelOperation);			
		}
		var appObj;
		var OrderSubstatus;
		var OrderLOVSubstatus;
		var OrdernewSubstatus;
		var OrderHeaderId;
		var boOrder;
		var bcOrder;
		var boRMSNumberEnquiry;
		var bcRMSNumberEnquiry;
		var sMSISDN;
		var bRecordExists;
		var strExpr;		
		if(MethodName == ""ABOReconfigureCxProd"")
		{
			appObj = TheApplication();
			//[Venkata/Soumyadeep][Virtual MSISDN Check][12-10-2012]
			boRMSNumberEnquiry = TheApplication().GetBusObject(""RMS NM Number Enquiry"");
			bcRMSNumberEnquiry = boRMSNumberEnquiry.GetBusComp(""RMS NM Number Enquiry"");
			this.BusComp().ActivateField(""Service Id"");
			sMSISDN = this.BusComp().GetFieldValue(""Service Id"");
			with (bcRMSNumberEnquiry)
			{				
				ActivateField(""Special Category Type"");
				ActivateField(""Type"");
				ActivateField(""Number String"");
				SetViewMode(AllView);
				ClearToQuery();
				strExpr = "" [Number String] = '""+ sMSISDN +""'"" + "" AND [Special Category Type] = 'Bulk Message' AND [Type] = 'MSISDN'"";
				SetSearchExpr(strExpr);
				ExecuteQuery(ForwardOnly);   
				bRecordExists = FirstRecord();
				if (bRecordExists)
				{
					TheApplication().RaiseErrorText("" Customization not allowed for virtual MSISDN "");
				}
			}
			//[Venkata/Soumyadeep][Virtual MSISDN Check][12-10-2012]
			
			OrderHeaderId = this.BusComp().GetFieldValue(""Order Header Id"");
			boOrder = appObj.GetBusObject(""Order Entry (Sales)"");
			bcOrder = boOrder.GetBusComp(""Order Entry - Orders"");
			
			with(bcOrder)
			{
				SetViewMode(AllView);
				ActivateField(""STC Order Sub Status"");
				ClearToQuery();
				SetSearchSpec(""Id"",OrderHeaderId);
				ExecuteQuery(ForwardOnly);	
				
				if (FirstRecord())
				{
					OrderSubstatus = GetFieldValue(""STC Order Sub Status"");
				}
				//   OrderSubstatus = this.BusComp().ParentBusComp().GetFieldValue(""STC Order Sub Status"");
				OrderLOVSubstatus = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Order Validated"");
				OrdernewSubstatus = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Raised"");
				if(OrderLOVSubstatus == OrderSubstatus)
				{
					//  this.BusComp().ParentBusComp().SetFieldValue(""STC Order Sub Status"",OrdernewSubstatus);
					//  this.BusComp().ParentBusComp().WriteRecord();
					SetFieldValue(""STC Order Sub Status"",OrdernewSubstatus);
					WriteRecord();   
				}   
			} //end of with 
		}
		return (ContinueOperation);   
	}					 
	catch(e)
	{
		throw(e);
	}
	finally
	{
		 bcOrder = null;
		 bcRMSNumberEnquiry = null;
		 boOrder = null;
		 boRMSNumberEnquiry = null;
		 appObj = null; 
	 }
 }
function WebApplet_InvokeMethod (MethodName)
{

	  //  if this is a copy process, for a line item,
	  //  we need to invoke the Oracle copy business Service
	  //  which will make the call to copy the corresponding
	  //  configuration in Oracle and then update the lines
	  //  in Siebel with the Configuration Header and Rev Number
  
	 if (MethodName == ""CopyRecord"") 
	 {
		  try 
		  {
				var busObj = this.BusObject();
				var busComp = this.BusComp();
				var sourceConfigHeader =  busComp.GetFieldValue(""External Configurator Reference 1"");
				var sourceConfigRevNbr = busComp.GetFieldValue(""External Configurator Reference 2"");
				var orderId = busComp.GetFieldValue(""Order Header Id"");
				var prodId = busComp.GetFieldValue(""Root Product Id"");
				var rootOrderItemId = busComp.GetFieldValue(""Root Order Item Id"");
				
				var invItemId = busComp.GetFieldValue(""External Inventory System Ref"");
 				var bOracleProduct = false;
											
				if ((invItemId != null) && (invItemId != """")) 
				{
						bOracleProduct = true;
				}

				if (bOracleProduct)
				{
					try
					{
						var indata1 =TheApplication().NewPropertySet ();
						var outdata1 = TheApplication().NewPropertySet ();
						indata1.SetProperty (""RootItemId"", rootOrderItemId);
						indata1.SetProperty (""QuoteorOrderorAgreementId"", orderId);
						indata1.SetProperty(""SourceConfigHeader"",sourceConfigHeader);
						indata1.SetProperty(""SourceConfigRevNbr"",sourceConfigRevNbr);
						indata1.SetProperty(""BusinessObject"",busObj.Name());
						indata1.SetProperty(""BusinessComponent"",busComp.Name());
												
						var svc1 = TheApplication().GetService(""CZIntegCopyConfigService"");
						svc1.InvokeMethod(""CopyOracleConfiguration"", indata1, outdata1);
						
						var destConfigRevNbr = outdata1.GetProperty(""DestConfigRevNbr"");
						var destConfigHeader = outdata1.GetProperty(""DestConfigHeader"");
						
						//for the root item
						busComp.SetFieldValue(""External Configurator Reference 1"",destConfigHeader);
						busComp.SetFieldValue(""External Configurator Reference 2"",destConfigRevNbr );
					}
					catch  (e) 
					{
						TheApplication().RaiseErrorText(e.toString());
						TheApplication().Trace(e.toString());
						var error = e.toString();
						throw e;
					}
					finally
					{
					  destConfigRevNbr = null;
					  destConfigHeader = null;
						indata1 = null;
						svc1 = null;
					}
				} //  end if (bOracleProduct)
			}
			catch  (e) 
			{
				TheApplication().RaiseErrorText(e.toString());
				TheApplication().Trace(e.toString());
				var error = e.toString();
				throw e;
			}
			finally 
			{
				if (busObj != null) { busObj = null;}
				if (busComp != null) {busComp = null;}
				
				sourceConfigHeader =  null;
				sourceConfigRevNbr = null;
				prodId = null;
				orderId = null;
				rootOrderItemId = null;
			
		}
	} // end if (MethodName == ""CopyRecord"")


}
"
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var ireturn;
	var sStatus;
	var sType;
	var appObj;
	var sOrderId;
	var sBusComp;
	try
	{
		if( TheApplication().GetProfileAttr(""gRefreshCurrentApplet"") == ""Y"")
		{	
			TheApplication().GetService(""FINS Teller UI Navigation"").InvokeMethod (""RefreshCurrentApplet"", TheApplication().NewPropertySet(), TheApplication().NewPropertySet());
			TheApplication().SetProfileAttr(""gRefreshCurrentApplet"","""");
		}
		switch(MethodName) 
		{
			case ""NewRecord"":
				appObj = TheApplication();
				CanInvoke = ""true"";
				sStatus = this.BusComp().ParentBusComp().GetFieldValue(""Status"");
				sType = this.BusComp().ParentBusComp().GetFieldValue(""STC Order SubType"");
				sOrderId = this.BusComp().ParentBusComp().GetFieldValue(""Id"");
				if(sType == appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_TYPE"",""Provide""))
				{
					if(sStatus == appObj.InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""In Progress""))
					{
				    	CanInvoke = ""true"";
					   /* sBusComp = this.BusComp();
					   	with(sBusComp)
						{ 
						   SetViewMode(AllView);
						   ClearToQuery();
						   ActivateField(""Order Header Id"");
						   SetSearchSpec(""Order Header Id"",sOrderId);
						   ExecuteQuery(ForwardOnly);
						   
						  if(FirstRecord())
						      CanInvoke = "false"";
						  else
						      CanInvoke = ""true"";
						 }   
						 */     
								
						
					}
					else
					{
						CanInvoke = "false"";
					}
				}
				else
				{
					CanInvoke = "false"";
				}
				ireturn = CancelOperation;
				break;
				
			case ""DeleteRecord"":
				appObj = TheApplication();
				CanInvoke = ""true"";
				sStatus = this.BusComp().ParentBusComp().GetFieldValue(""Status"");
				sType = this.BusComp().ParentBusComp().GetFieldValue(""STC Order SubType"");
				
				var sVoucherFlag = this.BusComp().GetFieldValue(""STC Voucher Promotion Flag"");
				var sPayRec = this.BusComp().ParentBusComp().GetFieldValue(""PaymentCount"");
				if ( sVoucherFlag == ""Y"")
				{
					if (sPayRec == ""Y"")
						CanInvoke = "false"";
					else
						CanInvoke = ""true"";
				}
				else
				{
					if(sType == appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_TYPE"",""Provide""))
					{
						if(sStatus == appObj.InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""In Progress""))
						{
							CanInvoke = ""true"";
						}
						else
						{
							CanInvoke = "false"";
						}
					}
					else
					{
						CanInvoke = "false"";
					}
				}
				
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
function WebApplet_PreInvokeMethod (MethodName)
{
	try
	{
		var appObj;
		var OrderSubstatus;
		var OrderLOVSubstatus;
		var OrdernewSubstatus;
		var OrderHeaderId;
		var boOrder;
		var bcOrder;
		var bcOrderLine;
		var boRMSNumberEnquiry;
		var bcRMSNumberEnquiry;
		var sMSISDN;
		var bRecordExists; 
		var strExpr;
		var CustomerPlan;
		var sExistingPlan = """";//22092014:New Retention Offer
		var sSplCat = """";//22092014:New Retention Offer
		OrderHeaderId = this.BusComp().ParentBusComp().GetFieldValue(""Id"");
	//	if(MethodName == ""ShowPopup"")
	//	{
		//this.BusObject().GetBusComp(""STC Discount Product VBC"").NewRecord(NewAfter);
	//	TheApplication().SetProfileAttr(""OrderHeaderId"",OrderHeaderId);
	//	var oBSSLM = TheApplication().GetService(""PSP Waterfall Service"");
		//var psInp = TheApplication().NewPropertySet();
	//	var psOut = TheApplication().NewPropertySet();
		//psInp.SetProperty(""Applet Height"", ""400"");
		//psInp.SetProperty(""Applet Mode"", ""6"");                           // 1 - List Applet, 2 - Form Applet
		//psInp.SetProperty(""Popup Applet Name"", ""STC Add Discount Product Applet"");
		//psInp.SetProperty(""Applet Width"", ""800"");
		//oBSSLM.InvokeMethod(""ShowWaterfallPopup"", psInp , psOut);
	//	return (ContinueOperation);  
	//	}
		
			//Added for the BB Promo - SharedBB promo discount below
/*	if(MethodName == ""NewRecord""){
		var AppObj = TheApplication();
		var EqPartNum;
		var BillingId = this.BusComp().ParentBusComp().GetFieldValue(""Billing Account Id"");
		var sSharedBBDisc = AppObj.InvokeMethod(""LookupValue"",""STC_ADMIN"",""SHAREDBBPROMO"");
		var sSharedBBNoDisc = AppObj.InvokeMethod(""LookupValue"",""STC_ADMIN"",""SHAREDBBPROMONO"");
		var VOBBPlan = AppObj.InvokeMethod(""LookupValue"",""STC_ADMIN"",""VOBBPLAN"");
		var VOBBPlanContract = AppObj.InvokeMethod(""LookupValue"",""STC_ADMIN"",""VOBBPLANCONTRACT"");
		var InputsVOBB   = AppObj.NewPropertySet();
		var OutputsVOBB = AppObj.NewPropertySet();
		var sBANBO = AppObj.GetBusObject(""STC Billing Account"");
		var sBANBC = sBANBO.GetBusComp(""CUT Invoice Sub Accounts"");
		var sSharedBB = """";
		var sPrimarySANId = """";
		var vMasterAccountType = """"; //Anchal: Added for Retail Provisioning Flow Enhancements
		var OrderBC = this.BusComp().ParentBusComp();
		with(OrderBC)
		{
			ActivateField(""STC Equipment PartNum"");
			EqPartNum = this.BusComp().ParentBusComp().GetFieldValue(""STC Equipment PartNum"");
			vMasterAccountType = this.BusComp().ParentBusComp().GetFieldValue(""STC Master Account Type""); //Anchal: Added for Retail Provisioning Flow Enhancements
			AppObj.SetProfileAttr(""STCMasterAccountType"",vMasterAccountType); //Anchal: Added for Retail Provisioning Flow Enhancements
		}
		if(EqPartNum != VOBBPlan && EqPartNum != VOBBPlanContract)
		{	
		with(sBANBC){
			ActivateField(""STC Primary SAN"");
			ActivateField(""STCPlanName"");
			ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Id"",BillingId);
			SetSearchSpec(""Account Status"",""Active"");
			ExecuteQuery(ForwardOnly);
			var IsBANRec = FirstRecord();
			if(IsBANRec){
				sSharedBB = GetFieldValue(""STCPlanName"");
				sPrimarySANId = GetFieldValue(""STC Primary SAN"");
			}//endif	
		}//endwith sBANBC
		if(sPrimarySANId != """" && sSharedBB == ""SHAREDBB""){
			var sAssetMgmtBC = AppObj.GetBusObject(""STC Asset Mgmt - Asset Thin BO"").GetBusComp(""STC Asset Mgmt - Asset Thin"");
			var sAssetStatus = AppObj.InvokeMethod(""LookupValue"",""IMPL_PHASE"",""Active"");
		//	AppObj.InvokeMethod(""LookupValue"",""IMPL_PHASE"",""Active"");
			//var sSrchExpr = ""[Service Account Id] = '"" + sPrimarySANId + ""' AND ([Part] LIKE 'VIPCDBBREV*')"";
			var sSrchExpr = ""[Service Account Id] = '"" + sPrimarySANId + ""' AND ([Part] LIKE 'PLANBBRNP*') AND [Status] ='""+ sAssetStatus +""'"";
			with(sAssetMgmtBC){
				ActivateField(""Part"");
				ClearToQuery();
				SetViewMode(AllView);
				SetSearchExpr(sSrchExpr);
				ExecuteQuery();
				var IsContractRec = FirstRecord();
				if(IsContractRec){
					var sContractPartNum = GetFieldValue(""Part"");
					var sBBPromoCon = AppObj.InvokeMethod(""LookupValue"",""STC_BBREVAMP_PROPL"",sContractPartNum);
					sBBPromoCon = sBBPromoCon.substring(0,5);
					if(sBBPromoCon == ""PROMO""){
					var STCWorkflowProc = AppObj.GetService(""Workflow Process Manager"");
									InputsVOBB.SetProperty(""SANId"",sPrimarySANId);
									InputsVOBB.SetProperty(""ProcessName"",""STC Get Remaining Contract Days WF"");
									STCWorkflowProc.InvokeMethod(""RunProcess"", InputsVOBB, OutputsVOBB);
									var ContractDaysRem = ToNumber(OutputsVOBB.GetProperty(""ContractDaysRemaining""));
									if(ContractDaysRem > 2)
									{
						this.BusComp().ParentBusComp().ActivateField(""STC Equipment PartNum"");
						this.BusComp().ParentBusComp().SetFieldValue(""STC Equipment PartNum"",sSharedBBDisc);
						this.BusComp().ParentBusComp().WriteRecord();
						}
						else
						{
						this.BusComp().ParentBusComp().ActivateField(""STC Equipment PartNum"");
						this.BusComp().ParentBusComp().SetFieldValue(""STC Equipment PartNum"",sSharedBBNoDisc);
						this.BusComp().ParentBusComp().WriteRecord();	
						}
					}//endif sBBPromoCon == ""CONTRACT""
					
				}//endif IsContractRec

			}//endwith assetMgmtBC
		}//endif sPrimarySANId != """" && sSharedBB == ""SHAREDBB""				
		}//end of if(EqPartNum != VOBBPlan && EqPartNum != VOBBPlanContract)
	}//endif NewRecord
	//Added for the BB Promo - SharedBB promo discount above.*/

		/////////////////praveen//////////////*/
		if(MethodName == ""ABOReconfigureCxProd"")
		{
			appObj = TheApplication();
			//[Venkata/Soumyadeep][Virtual MSISDN Check][12-10-2012]
			boRMSNumberEnquiry = TheApplication().GetBusObject(""RMS NM Number Enquiry"");
			bcRMSNumberEnquiry = boRMSNumberEnquiry.GetBusComp(""RMS NM Number Enquiry"");
			this.BusComp().ActivateField(""Service Id"");
			sMSISDN = this.BusComp().GetFieldValue(""Service Id"");
			var vRootId = this.BusComp().GetFieldValue(""Root Order Item Id""); //Start 28-09-2014 Anchal: Added for SD_Retails Provisioning Enhancements
			var vMNPFlag = this.BusComp().ParentBusComp().GetFieldValue(""STC Port In Flag"");
			this.BusComp().ParentBusComp().ActivateField(""STC Billing CPS Flag"");
			var strCarPreFlag = this.BusComp().ParentBusComp().GetFieldValue(""STC Billing CPS Flag"");
			var vRecId = this.BusComp().GetFieldValue(""Id"");
			if((vRootId == vRecId) && (sMSISDN == null || sMSISDN == """") && vMNPFlag == ""No"")
			{
				if(strCarPreFlag == ""Y"")
				{
				}
				else
				{
					TheApplication().RaiseErrorText(""Please select MSISDN.""); //End 28-09-2014 Anchal: Added for SD_Retails Provisioning Enhancements
				}
			}
			with (bcRMSNumberEnquiry)
			{				
				ActivateField(""Special Category Type"");
				ActivateField(""STC Customer Existing Plan"");
				ActivateField(""STC Migration Type"");
				ActivateField(""Type"");
				ActivateField(""Number String"");
				SetViewMode(AllView);
				ClearToQuery();
			//	strExpr = "" [Number String] = '""+ sMSISDN +""'"" + "" AND [Special Category Type] = 'Bulk Message' AND [Type] = 'MSISDN'"";
			//	strExpr = "" [Number String] = '""+ sMSISDN +""'AND [Type] = 'MSISDN'"";//22092014:Iphone6 for passing Migrated PLan from RMS
				strExpr = "" [Number String] = '""+ sMSISDN +""'"";
				SetSearchExpr(strExpr);
				ExecuteQuery(ForwardOnly);   
				bRecordExists = FirstRecord();
				if (bRecordExists)
				{
						sSplCat = GetFieldValue(""Special Category Type"");//22092014:New Retention Offer
						if(sSplCat == ""Bulk Message"")//22092014:New Retention Offer
						TheApplication().RaiseErrorText("" Customization not allowed for virtual MSISDN "");
						else{//22092014:New Retention Offer:below
						sExistingPlan = GetFieldValue(""STC Migration Type"");
						CustomerPlan = GetFieldValue(""STC Customer Existing Plan"");}
				}
			}
			//[Venkata/Soumyadeep][Virtual MSISDN Check][12-10-2012]
			
			OrderHeaderId = this.BusComp().GetFieldValue(""Order Header Id"");
			boOrder = appObj.GetBusObject(""Order Entry (Sales)"");
			bcOrder = boOrder.GetBusComp(""Order Entry - Orders"");
			
			with(bcOrder)
			{
				bcOrderLine = boOrder.GetBusComp(""Order Entry - Line Items"");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchSpec(""Id"",OrderHeaderId);
				ExecuteQuery(ForwardOnly);
				with(bcOrderLine)
				{
					SetViewMode(AllView);
					ClearToQuery();
					SetSearchSpec(""STC Voucher Promotion Flag"", ""Y"");
					ExecuteQuery(ForwardOnly);
					if (FirstRecord())
					{
						appObj.RaiseErrorText(""Please delete Voucher/Promotion Discouunt Products first to continue customization."");
					}
				}
			
				SetViewMode(AllView);
				ActivateField(""STC Order Sub Status"");
				ActivateField(""STC Migrated Plan"");
				ClearToQuery();
				SetSearchSpec(""Id"",OrderHeaderId);
				ExecuteQuery(ForwardOnly);	
				
				if (FirstRecord())
				{
					OrderSubstatus = GetFieldValue(""STC Order Sub Status"");
					var MigType = appObj.InvokeMethod(""LookupValue"",""STC_MRC_DISC_TYPE"",sExistingPlan);
					var MigTypeStr = MigType.substring(0,5);
					if(MigTypeStr == ""ALLOW""){
					SetFieldValue(""STC Migrated Plan"",CustomerPlan);}//16/10/2014: Voice Plan Revamp to store Migrated Plan from MSISDN
					WriteRecord();//22092014:New Retention Offer
					InvokeMethod(""RefreshRecord"");					
				}
				//   OrderSubstatus = this.BusComp().ParentBusComp().GetFieldValue(""STC Order Sub Status"");
				OrderLOVSubstatus = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Order Validated"");
				OrdernewSubstatus = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Raised"");
				if(OrderLOVSubstatus == OrderSubstatus)
				{
					//  this.BusComp().ParentBusComp().SetFieldValue(""STC Order Sub Status"",OrdernewSubstatus);
					//  this.BusComp().ParentBusComp().WriteRecord();
					SetFieldValue(""STC Order Sub Status"",OrdernewSubstatus);
					WriteRecord();   
				}   
			} //end of with 
			
			
var svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
var psIn1 = TheApplication().NewPropertySet();
var psOut1 = TheApplication().NewPropertySet();
psIn1.SetProperty(""Refresh All"",""Y"");
svcUI.InvokeMethod(""RefreshCurrentApplet"",psIn1,psOut1);
		}

/*	if (MethodName == ""STCAddEligiblePromotion"")
	{
		appObj = TheApplication();
		OrderHeaderId = this.BusComp().GetFieldValue(""Order Header Id"");
		boOrder = appObj.GetBusObject(""CMU Order Line Item"");
		bcOrder = boOrder.GetBusComp(""MACD Order Entry - Line Items"");
		var bcOrderRe = boOrder.GetBusComp(""MACD Order Entry - Line Items"");
				
		if (this.BusComp().ParentBusComp() != '' && this.BusComp().ParentBusComp() != null)
			appObj.SetProfileAttr(""sEligibleOrderIDNum"" ,this.BusComp().ParentBusComp().GetFieldValue(""STC Subscriber Id""));
		appObj.SetProfileAttr(""sEligibleOrderMSISDN"", this.BusComp().GetFieldValue(""Service Id""));
		appObj.SetProfileAttr(""sEligiblePromoOrderId"", OrderHeaderId);

		
		with(bcOrder)
		{
			ActivateField(""STC Plan Type"");
			ActivateField(""Action Code"");
			ActivateField(""Product"");
			ActivateField(""Product Part Number"");//Added for BTL promotions SRINI:21042014
			SetViewMode(AllView);
			ClearToQuery();
			strExpr = ""[Order Header Id] = '""+ OrderHeaderId +""' AND [STC Plan Type] = 'Service Plan' AND [Action Code] <>	 'Delete'"";
			SetSearchExpr(strExpr);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
			{	
				var sServicePlan = GetFieldValue(""Product"");
				var sSrvcPlnPartNum = GetFieldValue(""Product Part Number"");//Added for BTL promotions SRINI:21042014
				with(bcOrderRe)
				{
					ActivateField(""Product Part Number"");
					ActivateField(""Action Code"");
					SetViewMode(AllView);
					ClearToQuery();
					strExpr = ""[Order Header Id] = '""+ OrderHeaderId +""' AND [Product Part Number] LIKE 'VIPCD*' AND [Action Code] = 'Add'"";
					SetSearchExpr(strExpr);
					ExecuteQuery(ForwardOnly);
					var VIPRec = FirstRecord()
					if(VIPRec)
						appObj.SetProfileAttr(""sEligibleServicePlanName"", sServicePlan);
					else{//Added for BTL promotions SRINI:21042014
						var sBTLEligiblePln = TheApplication().InvokeMethod(""LookupValue"",""STC_BTL_PROMO_PLAN"",sSrvcPlnPartNum);
						sBTLEligiblePln = sBTLEligiblePln.substring(0,7);
						if(sBTLEligiblePln == ""BTLPLAN"")
							appObj.SetProfileAttr(""sEligibleServicePlanName"", sServicePlan);
						else	
							appObj.SetProfileAttr(""sEligibleServicePlanName"", ""NOSERVICEPLAN"");
						
					}//Added for BTL promotions SRINI:21042014
					if(!VIPRec && sBTLEligiblePln != ""BTLPLAN"")
					{
					appObj.SetProfileAttr(""sEligibleServicePlanName"", ""NOSERVICEPLAN"");
					}
				}
				
				var oServiceAF = TheApplication().GetService(""PSP Waterfall Service"");
				var inputPropAF = TheApplication().NewPropertySet();
				var outputPropAF = TheApplication().NewPropertySet();
				//Added for BTL promotions SRINI:27042014 below
				var sOrderSubStat = this.BusComp().ParentBusComp().GetFieldValue(""STC Order Sub Status"");
				if(sOrderSubStat == ""Raised"")
					inputPropAF.SetProperty(""Popup Applet Name"",""STC Promotion Mgmt Add Eligible Product Popup Applet - BTL Optimization"");				
				else if(sOrderSubStat == ""Order Validated"")
				//Added for BTL promotions SRINI:27042014 above
					inputPropAF.SetProperty(""Popup Applet Name"",""STC Promotion Mgmt Add Eligible Product Popup Applet"");
				//inputPropAF.SetProperty(""Applet Mode"",""6"");
				//inputPropAF.SetProperty(""Applet Height"", ""700"");
				//inputPropAF.SetProperty(""Applet Width"", ""700"");
				oServiceAF.InvokeMethod(""ShowWaterfallPopup"", inputPropAF, outputPropAF);
			}
			else
			{
				appObj.RaiseErrorText(""Please Customizate the order"");
			}
		}
		this.BusComp().ParentBusComp().InvokeMethod(""RefreshRecord"");
		return (CancelOperation);
	}*/
	if(MethodName == ""NewRecord"")
	{
		var sCPSFlg = """";
	//	var sBillingId = this.BusComp().ParentBusComp().GetFieldValue(""Billing Account Id"");
		var bcOrderBC = this.BusComp().ParentBusComp();
		with(bcOrderBC)
		{
			ActivateField(""STC Billing CPS Flag"");			
			sCPSFlg = this.BusComp().ParentBusComp().GetFieldValue(""STC Billing CPS Flag"");
			TheApplication().SetProfileAttr(""STCCPSFlag"", sCPSFlg);
	//		vMasterAccountType = this.BusComp().ParentBusComp().GetFieldValue(""STC Master Account Type""); //Anchal: Added for Retail Provisioning Flow Enhancements
	//		AppObj.SetProfileAttr(""STCMasterAccountType"",vMasterAccountType); //Anchal: Added for Retail Provisioning Flow Enhancements
		}
	}
		return (ContinueOperation);   
	}					 
	catch(e)
	{
		throw(e);
	}
	finally
	{
		 bcOrder = null;
		 bcRMSNumberEnquiry = null;
		 boOrder = null;
		 boRMSNumberEnquiry = null;
		 appObj = null; 
	 }
 }
function WebApplet_InvokeMethod (MethodName)
{

	  //  if this is a copy process, for a line item,
	  //  we need to invoke the Oracle copy business Service
	  //  which will make the call to copy the corresponding
	  //  configuration in Oracle and then update the lines
	  //  in Siebel with the Configuration Header and Rev Number
  
	 if (MethodName == ""CopyRecord"") 
	 {
		  try 
		  {
				var busObj = this.BusObject();
				var busComp = this.BusComp();
				var sourceConfigHeader =  busComp.GetFieldValue(""External Configurator Reference 1"");
				var sourceConfigRevNbr = busComp.GetFieldValue(""External Configurator Reference 2"");
				var orderId = busComp.GetFieldValue(""Order Header Id"");
				var prodId = busComp.GetFieldValue(""Root Product Id"");
				var rootOrderItemId = busComp.GetFieldValue(""Root Order Item Id"");
				
				var invItemId = busComp.GetFieldValue(""External Inventory System Ref"");
 				var bOracleProduct = false;
											
				if ((invItemId != null) && (invItemId != """")) 
				{
						bOracleProduct = true;
				}

				if (bOracleProduct)
				{
					try
					{
						var indata1 =TheApplication().NewPropertySet ();
						var outdata1 = TheApplication().NewPropertySet ();
						indata1.SetProperty (""RootItemId"", rootOrderItemId);
						indata1.SetProperty (""QuoteorOrderorAgreementId"", orderId);
						indata1.SetProperty(""SourceConfigHeader"",sourceConfigHeader);
						indata1.SetProperty(""SourceConfigRevNbr"",sourceConfigRevNbr);
						indata1.SetProperty(""BusinessObject"",busObj.Name());
						indata1.SetProperty(""BusinessComponent"",busComp.Name());
												
						var svc1 = TheApplication().GetService(""CZIntegCopyConfigService"");
						svc1.InvokeMethod(""CopyOracleConfiguration"", indata1, outdata1);
						
						var destConfigRevNbr = outdata1.GetProperty(""DestConfigRevNbr"");
						var destConfigHeader = outdata1.GetProperty(""DestConfigHeader"");
						
						//for the root item
						busComp.SetFieldValue(""External Configurator Reference 1"",destConfigHeader);
						busComp.SetFieldValue(""External Configurator Reference 2"",destConfigRevNbr );
					}
					catch  (e) 
					{
						TheApplication().RaiseErrorText(e.toString());
						TheApplication().Trace(e.toString());
						var error = e.toString();
						throw e;
					}
					finally
					{
					  destConfigRevNbr = null;
					  destConfigHeader = null;
						indata1 = null;
						svc1 = null;
					}
				} //  end if (bOracleProduct)
			}
			catch  (e) 
			{
				TheApplication().RaiseErrorText(e.toString());
				TheApplication().Trace(e.toString());
				var error = e.toString();
				throw e;
			}
			finally 
			{
				if (busObj != null) { busObj = null;}
				if (busComp != null) {busComp = null;}
				
				sourceConfigHeader =  null;
				sourceConfigRevNbr = null;
				prodId = null;
				orderId = null;
				rootOrderItemId = null;
			
		}
	} // end if (MethodName == ""CopyRecord"")


}
"
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var ireturn;
	var sStatus;
	var sType;
	var appObj;
	var sOrderId;
	var sBusComp;
	try
	{
		if( TheApplication().GetProfileAttr(""gRefreshCurrentApplet"") == ""Y"")
		{	
			TheApplication().GetService(""FINS Teller UI Navigation"").InvokeMethod (""RefreshCurrentApplet"", TheApplication().NewPropertySet(), TheApplication().NewPropertySet());
			TheApplication().SetProfileAttr(""gRefreshCurrentApplet"","""");
		}
		switch(MethodName) 
		{
			case ""NewRecord"":
				appObj = TheApplication();
				CanInvoke = ""true"";
				sStatus = this.BusComp().ParentBusComp().GetFieldValue(""Status"");
				sType = this.BusComp().ParentBusComp().GetFieldValue(""STC Order SubType"");
				sOrderId = this.BusComp().ParentBusComp().GetFieldValue(""Id"");
				if(sType == appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_TYPE"",""Provide""))
				{
					if(sStatus == appObj.InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""In Progress""))
					{
				    	CanInvoke = ""true"";
					   /* sBusComp = this.BusComp();
					   	with(sBusComp)
						{ 
						   SetViewMode(AllView);
						   ClearToQuery();
						   ActivateField(""Order Header Id"");
						   SetSearchSpec(""Order Header Id"",sOrderId);
						   ExecuteQuery(ForwardOnly);
						   
						  if(FirstRecord())
						      CanInvoke = "false"";
						  else
						      CanInvoke = ""true"";
						 }   
						 */     
								
						
					}
					else
					{
						CanInvoke = "false"";
					}
				}
				else
				{
					CanInvoke = "false"";
				}
				ireturn = CancelOperation;
				break;
				
			case ""DeleteRecord"":
				appObj = TheApplication();
				CanInvoke = ""true"";
				sStatus = this.BusComp().ParentBusComp().GetFieldValue(""Status"");
				sType = this.BusComp().ParentBusComp().GetFieldValue(""STC Order SubType"");
				
				var sVoucherFlag = this.BusComp().GetFieldValue(""STC Voucher Promotion Flag"");
				var sPayRec = this.BusComp().ParentBusComp().GetFieldValue(""PaymentCount"");
				if ( sVoucherFlag == ""Y"")
				{
					if (sPayRec == ""Y"")
						CanInvoke = "false"";
					else
						CanInvoke = ""true"";
				}
				else
				{
					if(sType == appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_TYPE"",""Provide""))
					{
						if(sStatus == appObj.InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""In Progress""))
						{
							CanInvoke = ""true"";
						}
						else
						{
							CanInvoke = "false"";
						}
					}
					else
					{
						CanInvoke = "false"";
					}
				}
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
function WebApplet_PreInvokeMethod (MethodName)
{
	try
	{
		var appObj;
		var OrderSubstatus;
		var OrderLOVSubstatus;
		var OrdernewSubstatus;
		var OrderHeaderId;
		var boOrder;
		var bcOrder;
		var bcOrderLine;
		var boRMSNumberEnquiry;
		var bcRMSNumberEnquiry;
		var sMSISDN;
		var bRecordExists; 
		var strExpr;
		var CustomerPlan;
		var sExistingPlan = """";//22092014:New Retention Offer
		var sSplCat = """";//22092014:New Retention Offer
		OrderHeaderId = this.BusComp().ParentBusComp().GetFieldValue(""Id"");
		if(MethodName == ""AddDiscount"")
		{
		//this.BusObject().GetBusComp(""STC Discount Product VBC"").NewRecord(NewAfter);
		TheApplication().SetProfileAttr(""OrderHeaderId"",OrderHeaderId);
		var oBSSLM = TheApplication().GetService(""SLM Save List Service"");
		var psInp = TheApplication().NewPropertySet();
		var psOut = TheApplication().NewPropertySet();
		psInp.SetProperty(""Applet Height"", ""400"");
		psInp.SetProperty(""Applet Mode"", ""6"");                           // 1 - List Applet, 2 - Form Applet
		psInp.SetProperty(""Applet Name"", ""STC Add Discount Product Applet"");
		psInp.SetProperty(""Applet Width"", ""800"");
		oBSSLM.InvokeMethod(""LoadPopupApplet"", psInp , psOut);
		return (CancelOperation);  
		}
		
			//Added for the BB Promo - SharedBB promo discount below
/*	if(MethodName == ""NewRecord""){
		var AppObj = TheApplication();
		var EqPartNum;
		var BillingId = this.BusComp().ParentBusComp().GetFieldValue(""Billing Account Id"");
		var sSharedBBDisc = AppObj.InvokeMethod(""LookupValue"",""STC_ADMIN"",""SHAREDBBPROMO"");
		var sSharedBBNoDisc = AppObj.InvokeMethod(""LookupValue"",""STC_ADMIN"",""SHAREDBBPROMONO"");
		var VOBBPlan = AppObj.InvokeMethod(""LookupValue"",""STC_ADMIN"",""VOBBPLAN"");
		var VOBBPlanContract = AppObj.InvokeMethod(""LookupValue"",""STC_ADMIN"",""VOBBPLANCONTRACT"");
		var InputsVOBB   = AppObj.NewPropertySet();
		var OutputsVOBB = AppObj.NewPropertySet();
		var sBANBO = AppObj.GetBusObject(""STC Billing Account"");
		var sBANBC = sBANBO.GetBusComp(""CUT Invoice Sub Accounts"");
		var sSharedBB = """";
		var sPrimarySANId = """";
		var vMasterAccountType = """"; //Anchal: Added for Retail Provisioning Flow Enhancements
		var OrderBC = this.BusComp().ParentBusComp();
		with(OrderBC)
		{
			ActivateField(""STC Equipment PartNum"");
			EqPartNum = this.BusComp().ParentBusComp().GetFieldValue(""STC Equipment PartNum"");
			vMasterAccountType = this.BusComp().ParentBusComp().GetFieldValue(""STC Master Account Type""); //Anchal: Added for Retail Provisioning Flow Enhancements
			AppObj.SetProfileAttr(""STCMasterAccountType"",vMasterAccountType); //Anchal: Added for Retail Provisioning Flow Enhancements
		}
		if(EqPartNum != VOBBPlan && EqPartNum != VOBBPlanContract)
		{	
		with(sBANBC){
			ActivateField(""STC Primary SAN"");
			ActivateField(""STCPlanName"");
			ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Id"",BillingId);
			SetSearchSpec(""Account Status"",""Active"");
			ExecuteQuery(ForwardOnly);
			var IsBANRec = FirstRecord();
			if(IsBANRec){
				sSharedBB = GetFieldValue(""STCPlanName"");
				sPrimarySANId = GetFieldValue(""STC Primary SAN"");
			}//endif	
		}//endwith sBANBC
		if(sPrimarySANId != """" && sSharedBB == ""SHAREDBB""){
			var sAssetMgmtBC = AppObj.GetBusObject(""STC Asset Mgmt - Asset Thin BO"").GetBusComp(""STC Asset Mgmt - Asset Thin"");
			var sAssetStatus = AppObj.InvokeMethod(""LookupValue"",""IMPL_PHASE"",""Active"");
		//	AppObj.InvokeMethod(""LookupValue"",""IMPL_PHASE"",""Active"");
			//var sSrchExpr = ""[Service Account Id] = '"" + sPrimarySANId + ""' AND ([Part] LIKE 'VIPCDBBREV*')"";
			var sSrchExpr = ""[Service Account Id] = '"" + sPrimarySANId + ""' AND ([Part] LIKE 'PLANBBRNP*') AND [Status] ='""+ sAssetStatus +""'"";
			with(sAssetMgmtBC){
				ActivateField(""Part"");
				ClearToQuery();
				SetViewMode(AllView);
				SetSearchExpr(sSrchExpr);
				ExecuteQuery();
				var IsContractRec = FirstRecord();
				if(IsContractRec){
					var sContractPartNum = GetFieldValue(""Part"");
					var sBBPromoCon = AppObj.InvokeMethod(""LookupValue"",""STC_BBREVAMP_PROPL"",sContractPartNum);
					sBBPromoCon = sBBPromoCon.substring(0,5);
					if(sBBPromoCon == ""PROMO""){
					var STCWorkflowProc = AppObj.GetService(""Workflow Process Manager"");
									InputsVOBB.SetProperty(""SANId"",sPrimarySANId);
									InputsVOBB.SetProperty(""ProcessName"",""STC Get Remaining Contract Days WF"");
									STCWorkflowProc.InvokeMethod(""RunProcess"", InputsVOBB, OutputsVOBB);
									var ContractDaysRem = ToNumber(OutputsVOBB.GetProperty(""ContractDaysRemaining""));
									if(ContractDaysRem > 2)
									{
						this.BusComp().ParentBusComp().ActivateField(""STC Equipment PartNum"");
						this.BusComp().ParentBusComp().SetFieldValue(""STC Equipment PartNum"",sSharedBBDisc);
						this.BusComp().ParentBusComp().WriteRecord();
						}
						else
						{
						this.BusComp().ParentBusComp().ActivateField(""STC Equipment PartNum"");
						this.BusComp().ParentBusComp().SetFieldValue(""STC Equipment PartNum"",sSharedBBNoDisc);
						this.BusComp().ParentBusComp().WriteRecord();	
						}
					}//endif sBBPromoCon == ""CONTRACT""
					
				}//endif IsContractRec

			}//endwith assetMgmtBC
		}//endif sPrimarySANId != """" && sSharedBB == ""SHAREDBB""				
		}//end of if(EqPartNum != VOBBPlan && EqPartNum != VOBBPlanContract)
	}//endif NewRecord
	//Added for the BB Promo - SharedBB promo discount above.*/

		/////////////////praveen//////////////*/
		if(MethodName == ""ABOReconfigureCxProd"")
		{
			appObj = TheApplication();
			//[Venkata/Soumyadeep][Virtual MSISDN Check][12-10-2012]
			boRMSNumberEnquiry = TheApplication().GetBusObject(""RMS NM Number Enquiry"");
			bcRMSNumberEnquiry = boRMSNumberEnquiry.GetBusComp(""RMS NM Number Enquiry"");
			this.BusComp().ActivateField(""Service Id"");
			sMSISDN = this.BusComp().GetFieldValue(""Service Id"");
			var vRootId = this.BusComp().GetFieldValue(""Root Order Item Id""); //Start 28-09-2014 Anchal: Added for SD_Retails Provisioning Enhancements
			var vMNPFlag = this.BusComp().ParentBusComp().GetFieldValue(""STC Port In Flag"");
			var vRecId = this.BusComp().GetFieldValue(""Id"");
			if((vRootId == vRecId) && (sMSISDN == null || sMSISDN == """") && vMNPFlag == ""No"")
			TheApplication().RaiseErrorText(""Please select MSISDN.""); //End 28-09-2014 Anchal: Added for SD_Retails Provisioning Enhancements
			with (bcRMSNumberEnquiry)
			{				
				ActivateField(""Special Category Type"");
				ActivateField(""STC Customer Existing Plan"");
				ActivateField(""STC Migration Type"");
				ActivateField(""Type"");
				ActivateField(""Number String"");
				SetViewMode(AllView);
				ClearToQuery();
			//	strExpr = "" [Number String] = '""+ sMSISDN +""'"" + "" AND [Special Category Type] = 'Bulk Message' AND [Type] = 'MSISDN'"";
			//	strExpr = "" [Number String] = '""+ sMSISDN +""'AND [Type] = 'MSISDN'"";//22092014:Iphone6 for passing Migrated PLan from RMS
				strExpr = "" [Number String] = '""+ sMSISDN +""'"";
				SetSearchExpr(strExpr);
				ExecuteQuery(ForwardOnly);   
				bRecordExists = FirstRecord();
				if (bRecordExists)
				{
						sSplCat = GetFieldValue(""Special Category Type"");//22092014:New Retention Offer
						if(sSplCat == ""Bulk Message"")//22092014:New Retention Offer
						TheApplication().RaiseErrorText("" Customization not allowed for virtual MSISDN "");
						else{//22092014:New Retention Offer:below
						sExistingPlan = GetFieldValue(""STC Migration Type"");
						CustomerPlan = GetFieldValue(""STC Customer Existing Plan"");}
				}
			}
			//[Venkata/Soumyadeep][Virtual MSISDN Check][12-10-2012]
			
			OrderHeaderId = this.BusComp().GetFieldValue(""Order Header Id"");
			boOrder = appObj.GetBusObject(""Order Entry (Sales)"");
			bcOrder = boOrder.GetBusComp(""Order Entry - Orders"");
			
			with(bcOrder)
			{
				bcOrderLine = boOrder.GetBusComp(""Order Entry - Line Items"");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchSpec(""Id"",OrderHeaderId);
				ExecuteQuery(ForwardOnly);
				with(bcOrderLine)
				{
					SetViewMode(AllView);
					ClearToQuery();
					SetSearchSpec(""STC Voucher Promotion Flag"", ""Y"");
					ExecuteQuery(ForwardOnly);
					if (FirstRecord())
					{
						appObj.RaiseErrorText(""Please delete Voucher/Promotion Discouunt Products first to continue customization."");
					}
				}
			
				SetViewMode(AllView);
				ActivateField(""STC Order Sub Status"");
				ActivateField(""STC Migrated Plan"");
				ClearToQuery();
				SetSearchSpec(""Id"",OrderHeaderId);
				ExecuteQuery(ForwardOnly);	
				
				if (FirstRecord())
				{
					OrderSubstatus = GetFieldValue(""STC Order Sub Status"");
					var MigType = appObj.InvokeMethod(""LookupValue"",""STC_MRC_DISC_TYPE"",sExistingPlan);
					var MigTypeStr = MigType.substring(0,5);
					if(MigTypeStr == ""ALLOW""){
					SetFieldValue(""STC Migrated Plan"",CustomerPlan);}//16/10/2014: Voice Plan Revamp to store Migrated Plan from MSISDN
					WriteRecord();//22092014:New Retention Offer
					InvokeMethod(""RefreshRecord"");					
				}
				//   OrderSubstatus = this.BusComp().ParentBusComp().GetFieldValue(""STC Order Sub Status"");
				OrderLOVSubstatus = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Order Validated"");
				OrdernewSubstatus = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Raised"");
				if(OrderLOVSubstatus == OrderSubstatus)
				{
					//  this.BusComp().ParentBusComp().SetFieldValue(""STC Order Sub Status"",OrdernewSubstatus);
					//  this.BusComp().ParentBusComp().WriteRecord();
					SetFieldValue(""STC Order Sub Status"",OrdernewSubstatus);
					WriteRecord();   
				}   
			} //end of with 
			
			
var svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
var psIn1 = TheApplication().NewPropertySet();
var psOut1 = TheApplication().NewPropertySet();
psIn1.SetProperty(""Refresh All"",""Y"");
svcUI.InvokeMethod(""RefreshCurrentApplet"",psIn1,psOut1);
		}

	if (MethodName == ""STCAddEligiblePromotion"")
	{
		appObj = TheApplication();
		OrderHeaderId = this.BusComp().GetFieldValue(""Order Header Id"");
		boOrder = appObj.GetBusObject(""CMU Order Line Item"");
		bcOrder = boOrder.GetBusComp(""MACD Order Entry - Line Items"");
		var bcOrderRe = boOrder.GetBusComp(""MACD Order Entry - Line Items"");
				
		if (this.BusComp().ParentBusComp() != '' && this.BusComp().ParentBusComp() != null)
			appObj.SetProfileAttr(""sEligibleOrderIDNum"" ,this.BusComp().ParentBusComp().GetFieldValue(""STC Subscriber Id""));
		appObj.SetProfileAttr(""sEligibleOrderMSISDN"", this.BusComp().GetFieldValue(""Service Id""));
		appObj.SetProfileAttr(""sEligiblePromoOrderId"", OrderHeaderId);

		
		with(bcOrder)
		{
			ActivateField(""STC Plan Type"");
			ActivateField(""Action Code"");
			ActivateField(""Product"");
			ActivateField(""Product Part Number"");//Added for BTL promotions SRINI:21042014
			SetViewMode(AllView);
			ClearToQuery();
			strExpr = ""[Order Header Id] = '""+ OrderHeaderId +""' AND [STC Plan Type] = 'Service Plan' AND [Action Code] <>	 'Delete'"";
			SetSearchExpr(strExpr);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
			{	
				var sServicePlan = GetFieldValue(""Product"");
				var sSrvcPlnPartNum = GetFieldValue(""Product Part Number"");//Added for BTL promotions SRINI:21042014
				with(bcOrderRe)
				{
					ActivateField(""Product Part Number"");
					ActivateField(""Action Code"");
					SetViewMode(AllView);
					ClearToQuery();
					strExpr = ""[Order Header Id] = '""+ OrderHeaderId +""' AND [Product Part Number] LIKE 'VIPCD*' AND [Action Code] = 'Add'"";
					SetSearchExpr(strExpr);
					ExecuteQuery(ForwardOnly);
					var VIPRec = FirstRecord()
					if(VIPRec)
						appObj.SetProfileAttr(""sEligibleServicePlanName"", sServicePlan);
					else{//Added for BTL promotions SRINI:21042014
						var sBTLEligiblePln = TheApplication().InvokeMethod(""LookupValue"",""STC_BTL_PROMO_PLAN"",sSrvcPlnPartNum);
						sBTLEligiblePln = sBTLEligiblePln.substring(0,7);
						if(sBTLEligiblePln == ""BTLPLAN"")
							appObj.SetProfileAttr(""sEligibleServicePlanName"", sServicePlan);
						else	
							appObj.SetProfileAttr(""sEligibleServicePlanName"", ""NOSERVICEPLAN"");
						
					}//Added for BTL promotions SRINI:21042014
					if(!VIPRec && sBTLEligiblePln != ""BTLPLAN"")
					{
					appObj.SetProfileAttr(""sEligibleServicePlanName"", ""NOSERVICEPLAN"");
					}
				}
				
				var oServiceAF = TheApplication().GetService(""SLM Save List Service"");
				var inputPropAF = TheApplication().NewPropertySet();
				var outputPropAF = TheApplication().NewPropertySet();
				//Added for BTL promotions SRINI:27042014 below
				var sOrderSubStat = this.BusComp().ParentBusComp().GetFieldValue(""STC Order Sub Status"");
				if(sOrderSubStat == ""Raised"")
					inputPropAF.SetProperty(""Applet Name"",""STC Promotion Mgmt Add Eligible Product Popup Applet - BTL Optimization"");				
				else if(sOrderSubStat == ""Order Validated"")
				//Added for BTL promotions SRINI:27042014 above
					inputPropAF.SetProperty(""Applet Name"",""STC Promotion Mgmt Add Eligible Product Popup Applet"");
				inputPropAF.SetProperty(""Applet Mode"",""6"");
				inputPropAF.SetProperty(""Applet Height"", ""700"");
				inputPropAF.SetProperty(""Applet Width"", ""700"");
				oServiceAF.InvokeMethod(""LoadPopupApplet"", inputPropAF, outputPropAF);
			}
			else
			{
				appObj.RaiseErrorText(""Please Customizate the order"");
			}
		}
		this.BusComp().ParentBusComp().InvokeMethod(""RefreshRecord"");
		return (CancelOperation);
	}
		return (ContinueOperation);   
	}					 
	catch(e)
	{
		throw(e);
	}
	finally
	{
		 bcOrder = null;
		 bcRMSNumberEnquiry = null;
		 boOrder = null;
		 boRMSNumberEnquiry = null;
		 appObj = null; 
	 }
 }
function CallCheckIP()
{



var AppObj = TheApplication();
var OrderItemId;
var APNName;
var SerAccId;
	var StrOrderBO = TheApplication().GetBusObject(""Order Entry (Sales)"");
	var StrOrderBC = StrOrderBO.GetBusComp(""Order Entry - Orders"");
	var sBCLineItem = StrOrderBO.GetBusComp(""Order Entry - Line Items"");
	var sOrderItemXA = StrOrderBO.GetBusComp(""Order Item XA"");
		var STCRowId = this.BusComp().GetFieldValue(""Id"");
	with(StrOrderBC)
	{
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"", STCRowId);
		ExecuteQuery(ForwardOnly);
		var isOrderrec = FirstRecord();
		if(isOrderrec)
		{
			SerAccId = GetFieldValue(""Service Account Id"");
			with(sBCLineItem)
				{
						SetViewMode(AllView);
						ActivateField(""Order Header Id"");
						ActivateField(""Part Number"");
						ClearToQuery();
						var spec  = ""[Part Number] = 'CORPIPA1' AND [Action Code] = 'Add' AND [Order Header Id] = '"" + STCRowId + ""'"";
						SetSearchExpr(spec);
						ExecuteQuery(ForwardOnly);
						var isrec = FirstRecord();
						if(isrec)
						{
							OrderItemId = GetFieldValue(""Id"");

							with(sOrderItemXA)
							{
								ActivateField(""Object Id"");
								SetViewMode(AllView);
								ClearToQuery();
								var XAspec  = ""[Object Id] = '"" + OrderItemId + ""' AND [Name] = 'APN_APNName'"";
								SetSearchExpr(XAspec);
								ExecuteQuery(ForwardOnly);
								var isrecord = FirstRecord();
								if(isrecord)
								{
										APNName = GetFieldValue(""Value"");
										
											if(!(APNName == """" || APNName == null || APNName == ''))
											{
										var STCInputsIPAPN  = AppObj.NewPropertySet();
										var STCOutputsIPAPN  = AppObj.NewPropertySet();
										var STCAPNIPBS = AppObj.GetService(""STC Check APN for IP"");
										STCInputsIPAPN.SetProperty(""AccountId"",SerAccId);
										STCInputsIPAPN.SetProperty(""APNName"",APNName);
										STCAPNIPBS.InvokeMethod(""CheckAPNName"", STCInputsIPAPN, STCOutputsIPAPN);
										var APNFound = STCOutputsIPAPN.GetProperty(""APNFound"");
										if(APNFound != ""Yes"")
										{
											AppObj.RaiseErrorText(""Selected APN is not Provisioned for this MSISDN"");
											return(CancelOperation);
										}
										}
								}
							}
						}
				}
		}
		}


}
function CallMNPSubmitOrder()
{
var SerAccId;
with(this.BusComp())
{
var OrderId = GetFieldValue(""Id"");
var AccType = GetFieldValue(""Order Account Type"");
var BillAccName = GetFieldValue(""Billing Account"");
var BillAddId = GetFieldValue(""Primary Account Address Id"");
var CommType = GetFieldValue(""STC Community Type"");
var CustAccId = GetFieldValue(""Customer Account Id"");
var OrderSubType = GetFieldValue(""STC Order SubType"");
var BillAccId = GetFieldValue(""Billing Account Id"");
var PriConId = GetFieldValue(""STC Primary Contact Id"");
SerAccId = GetFieldValue(""Service Account Id"");
var sGccCntryCode = GetFieldValue(""STC GCC Country Code"");//CIO
var sSplitFlag = GetFieldValue(""STC Split Billing Flag"");
}

var appobj = TheApplication();

var STCInputs  = appobj.NewPropertySet();
var STCOutputs  = appobj.NewPropertySet();


if(SerAccId == """" || SerAccId == null)
{
	var STCCreateSAN = appobj.GetService(""STC Create Subscription"");
	STCInputs.SetProperty(""Account Type"",AccType);
	STCInputs.SetProperty(""Billing Account Name"",BillAccName);
	STCInputs.SetProperty(""Billing Address Id"",BillAddId);
	STCInputs.SetProperty(""Community Type"",CommType);
	STCInputs.SetProperty(""Customer Account Id"",CustAccId);
	STCInputs.SetProperty(""Order Id"",OrderId);
	STCInputs.SetProperty(""Order Sub Type"",OrderSubType);
	STCInputs.SetProperty(""Billing Account Id"",BillAccId);
	STCInputs.SetProperty(""Primary Contact Id"",PriConId);
	STCInputs.SetProperty(""GCCCountryCode"",sGccCntryCode);//CIO	
	STCCreateSAN.InvokeMethod(""CreateSubscription"", STCInputs, STCOutputs);
	SerAccId = STCOutputs.GetProperty(""ServiceAccountId"");
	var ErrMsg = STCOutputs.GetProperty(""Error Message"");
	if((SerAccId != """" || SerAccId != null) && ErrMsg == """" )
	{	
	this.BusComp().ActivateField(""Service Account Id"");
	this.BusComp().SetFieldValue(""Service Account Id"", SerAccId);
	this.BusComp().WriteRecord();
	}
	else if(ErrMsg != null || ErrMsg != """")
	{
		TheApplication().RaiseErrorText(ErrMsg);
	}
}
else if(sSplitFlag == ""Y"")
{
	var psSplitMNPInputs  = appobj.NewPropertySet();
	var psSplitMNPOutputs  = appobj.NewPropertySet();
	var svcSplitMNPService = appobj.GetService(""Workflow Process Manager"");
	psSplitMNPInputs.SetProperty(""Object Id"",OrderId);
	psSplitMNPInputs.SetProperty(""ProcessName"", ""STC Split Update MSISDN Accounts"");
	svcSplitMNPService.InvokeMethod(""RunProcess"", psSplitMNPInputs, psSplitMNPOutputs);
}
			var vMNPSRCreate = appobj.InvokeMethod(""LookupValue"",""STC_MNP_SR_CREATE"",""MNPSRCREATE"");
			
			if(vMNPSRCreate == ""TRUE"")
				{

var SerReqBC = TheApplication().GetBusObject(""Service Request"").GetBusComp(""Service Request"");
with(SerReqBC)
{
SetViewMode(AllView);
ClearToQuery();
SetSearchSpec(""Account Id"", SerAccId);
ExecuteQuery(ForwardOnly);
if(!FirstRecord())
{
var STCInputsone  = appobj.NewPropertySet();
var STCOutputsone  = appobj.NewPropertySet();
		var STCCreateSR = appobj.GetService(""Workflow Process Manager"");
		
		
		STCInputsone.SetProperty(""SerAccId"",SerAccId);
		STCInputsone.SetProperty(""Type"", ""CreateMNPReq"");
		STCInputsone.SetProperty(""ProcessName"", ""STC Create MNP Service Request"");

		STCCreateSR.InvokeMethod(""RunProcess"", STCInputsone, STCOutputsone);
		var SerReqId = STCOutputsone.GetProperty(""SR Id"");
		
		var serReqBC = appobj.GetBusObject(""Service Request"").GetBusComp(""Service Request"");
		var MNPQueueId = appobj.InvokeMethod(""LookupValue"",""STC_MNP_QUEUE"", ""HELP_DESK""); 
		with(serReqBC)
		{
				SetViewMode(AllView);
				ActivateField(""STC Queue Name"");
				ActivateField(""Call Back"");
				ClearToQuery();
				SetSearchSpec(""SR Id"", SerReqId)
				ExecuteQuery(ForwardOnly);
				var IsSRRec = FirstRecord();
				if(IsSRRec)
				{
					SetFieldValue(""Call Back"" , ""N"");
					SetFieldValue(""STC Queue Id"" , MNPQueueId);
					SetFieldValue(""Status"", ""In Progress"");
					SetFieldValue(""Sub-Status"", ""Queued"");
					WriteRecord();
				}
		}
		}
	}	
}
		var vMNPOrderSubmit = appobj.InvokeMethod(""LookupValue"",""STC_MNP_PORT_AUTO"",""Automated"");
			
			if(vMNPOrderSubmit == ""TRUE"")
				{
					
				var MNPInputs  = appobj.NewPropertySet();
				var MNPOutputs  = appobj.NewPropertySet();
				var MNPService = appobj.GetService(""Workflow Process Manager"");
				
		MNPInputs.SetProperty(""ServAccntId"",SerAccId);
		MNPInputs.SetProperty(""Object Id"",OrderId);
		MNPInputs.SetProperty(""ProcessName"", ""STC GenPortIn Request WF"");
		MNPService.InvokeMethod(""RunProcess"", MNPInputs, MNPOutputs);
		this.BusComp().SetFieldValue(""STC Order Sub Status"",""MNP Order In Progress"");
		this.BusComp().WriteRecord();
		}
		else
		{			
		this.BusComp().SetFieldValue(""STC Order Sub Status"",""MNP Order In Progress"");
		this.BusComp().WriteRecord();
		}
}
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
		this.BusComp().ActivateField(""SIM Retension Flag"");
		sSimRetain = this.BusComp().GetFieldValue(""SIM Retension Flag"");
		SMigType = this.BusComp().GetFieldValue(""Delivery Block"");
		TheApplication().SetProfileAttr(""SimRetain"",sSimRetain);
	    TheApplication().SetProfileAttr(""MigType"",SMigType);	    
		var STCRowId = this.BusComp().GetFieldValue(""Id"");
		var STCWorkflowProc = appobj.GetService(""Workflow Process Manager"");
		STCInputs.SetProperty(""Object Id"",STCRowId);
		STCInputs.SetProperty(""ProcessName"",""STC Submit Order Wrapper"");		
		STCWorkflowProc.InvokeMethod(""RunProcess"", STCInputs, STCOutputs);
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
function CorpGPRS()
{
//Added for Defect#5341
	var appobj = TheApplication();
	var STCInputs  = appobj.NewPropertySet();
	var STCOutputs  = appobj.NewPropertySet();
	
		var STCRowId = this.BusComp().GetFieldValue(""Id"");
		var STCWorkflowProc = appobj.GetService(""STC Corporate GPRS Order Util"");
		STCInputs.SetProperty(""Object Id"",STCRowId);
		STCWorkflowProc.InvokeMethod(""SubmitCorpGPRS"", STCInputs, STCOutputs);
		this.BusComp().InvokeMethod(""RefreshBusComp"");
	
}
function Rateplan()
{
 //gjena_11 Nov 2012 Added for New CR for Rate Plan and CL validation
  
 try
  {
	  var BillAccId = this.BusComp().GetFieldValue(""Billing Account Id"");
	  var CurrentOrdMrc = this.BusComp().GetFieldValue(""Current Order Total Net Price MRC"");
	  this.BusComp().ActivateField(""STC Order SubType"");
	  var sOrderType = this.BusComp().GetFieldValue(""STC Order SubType"");
	  var advflg=this.BusComp().GetFieldValue(""STC Credit Flg"");
	  if(sOrderType == ""Provide"")
      {
		  var AccountBO=TheApplication().GetBusObject(""STC Billing Account_Copy"");
		  var AcctCon=AccountBO.GetBusComp(""CUT Invoice Sub Accounts_Copy"");
		  AcctCon.ActivateField(""Credit Score"");
		  AcctCon.ActivateField(""Type"");
		  AcctCon.SetViewMode(AllView);
		  AcctCon.ClearToQuery();
		  AcctCon.SetSearchSpec(""Id"",BillAccId);
		  AcctCon.ExecuteQuery(ForwardOnly);
		  var Recordfound=AcctCon.FirstRecord();
      	  if(Recordfound)
          {
       		var CreditScore =AcctCon.GetFieldValue(""Credit Score"");
       		var type=AcctCon.GetFieldValue(""Type"");
          }
          if(type==""Individual"") //If type
          { 
            
            var vCreditScore = """";
            var vBillValidationBS = TheApplication().GetService(""STC Credit Limit Updates Rate Plan"");
            var InpPS = TheApplication().NewPropertySet();
            var OutPS = TheApplication().NewPropertySet();
            InpPS.SetProperty(""BillAccId"", BillAccId);
            vBillValidationBS.InvokeMethod(""Rate Plan"",InpPS,OutPS);
            vCreditScore = OutPS.GetProperty(""CreditScoreChange"");
            
            CreditScore = ToNumber(CreditScore);
            var TotCreditLimit = ToNumber(vCreditScore)+ ToNumber(CurrentOrdMrc);
	        if(CreditScore <= TotCreditLimit && advflg!=""Y"")
			{
		   		TheApplication().RaiseErrorText(""Plan Value is More than the Customers Credit Limit,To Continue Please check the Credit limit flag"");			
            }
           }// end If type
  	   }
  }

  catch(e)
  {
  throw(e);
  }
 
 finally
  {
  AcctCon=null;
  AccountBO=null;
  vBillValidationBS=null;	
  }

}
function ValidateGCCId(vSubsId,vCustType)
{

	var sBsValidateGCC = TheApplication().GetService(""STC New Customer Validation"");
	var sErrorCode = """";
	var sErrorMsg = """";
	var vSubCntry;
	var sSubIdType;
	if(vCustType == ""Corporate"" || vCustType ==""SME""){
		this.BusComp().ActivateField(""STC Indv GCC Country Code"");		
		vSubCntry = this.BusComp().GetFieldValue(""STC Indv GCC Country Code"");
		
	}//endif vCustType == ""Corporate"" || vCustType ==""SME""
	if(vCustType == ""Individual""){
		this.BusComp().ActivateField(""STC GCC Country Code"");		
		vSubCntry = this.BusComp().GetFieldValue(""STC GCC Country Code"");
		
	}//endif  vCustType == ""Individual""
	
	if(vSubCntry != """"){
		var sInps = TheApplication().NewPropertySet();
		var sOutps = TheApplication().NewPropertySet();
		sInps.SetProperty(""GCCId"",vSubsId);
		sInps.SetProperty(""GCCCountryCode"",vSubCntry);
		sInps.SetProperty(""sErrorCode"",sErrorCode);
		sInps.SetProperty(""sErrorMsg"",sErrorMsg);
		
		sBsValidateGCC.InvokeMethod(""ValidateGCCId"",sInps,sOutps);
		sErrorMsg = sOutps.GetProperty(""sErrorMsg"");
		if(sErrorMsg != """"){
			TheApplication().RaiseErrorText(sErrorMsg);				
		}//endif sErrorMsg
	}//endif vSubCntry
	else{
		sErrorMsg = TheApplication().LookupMessage(""User Defined Errors"",""AM0085"")
		TheApplication().RaiseErrorText(sErrorMsg);
	}//endelse vSubCntry
	
	return CancelOperation;
	
}
function ValidateSTCOrder()
{
  var ireturn;
  var sOrderSubStatus;
  var sLOVSubStatus;
  var sBusSrvc;
  var appObj;
  var Inputs;
  var Outputs;
  var srvc;
  var sOrderId;
  var sErrMsg;
  var sErrorCode;
  var boOrder;
  var bcOrderLineItem;   
  var sProductType;
  var sLOVProductType;  
  var boBilling;
  var bcBilling;
  var sBillingId;
  var bcOrder;
  var sOrderType;
  var sOrderStatus;
  var sRecordCount;
 var ordType;
 var PortOut;	
  try
    {              
		appObj = TheApplication(); 		
		boBilling = appObj.GetBusObject(""STC Billing Account"");
		bcBilling = boBilling.GetBusComp(""CUT Invoice Sub Accounts"");
		bcOrder = boBilling.GetBusComp(""Order Entry - Orders"");
		sBillingId = this.BusComp().GetFieldValue(""Billing Account Id"");		
	    with(this.BusComp())
	    {	    
	    ActivateField(""STC Order SubType"");
	    ordType = GetFieldValue(""STC Order SubType"");
	    var DiscOrder = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_TYPE"",""Disconnect"");
	    	ActivateField(""STC Port In Flag"");
			var MNPPortIn = GetFieldValue(""STC Port In Flag"");
	    if(MNPPortIn == ""Yes"")
	    	{
	    		ActivateField(""STC MNP Operator"");
	    		ActivateField(""STC Donor SIM No"");
	    		ActivateField(""STC Subscriber Id Type"");
	    		ActivateField(""STC Subscriber Id"");
	    		ActivateField(""STC Individual Id"");
	    		ActivateField(""STC Individual Id Type"");
	    		ActivateField(""STC MNP Customer Type"");
	    		var Oper = GetFieldValue(""STC MNP Operator"");
	    		var vSIM = GetFieldValue(""STC Donor SIM No"");
	    		var vSubsIdType = GetFieldValue(""STC Subscriber Id Type"");
	    		var vCustType = GetFieldValue(""STC MNP Customer Type"");
	    		var vIndId = GetFieldValue(""STC Individual Id"");
	    		var vIndTypeId = GetFieldValue(""STC Individual Id Type"");
	    		var vSubsId = GetFieldValue(""STC Subscriber Id"");
	    		var vIndCntryCode = GetFieldValue(""STC Indv GCC Country Code"");//CIO
	    		var vSubCntyCode = GetFieldValue(""STC GCC Country Code"");//CIO
	    		var vLenSubId = vSubsId.length;
	    		var vLenIndId = vIndId.length;
	    		var vStrsubid;
	    		//CIO software Update SD below
	    		var vAllowGCCId = TheApplication().InvokeMethod(""LookupValue"",""STC_GCC_PORTIN_ALLOW"",""STC_GCC_PORTIN_ALLOW"");
	    		if(vAllowGCCId != ""Y""){
	    			if(vSubsIdType == ""GCC"" || vIndTypeId == ""GCC"")
	    			appObj.RaiseErrorText(""Currently GCC Id is not allowed for PortIn Orders"");	    			
	    		}//endif vAllowGCCId
	    		//CIO software Update SD above
	    	  if(Oper == """" || Oper == null)
	    			{
	    				appObj.RaiseErrorText(""Please select Donor Id for MNP Orders"");
	    			}
	    			 	if(vCustType == ""Corporate"")
	    					{
	    						if(vSubsIdType == """" || vSubsIdType == null)
	    							{
	    								appObj.RaiseErrorText(""Subscriber Id Type is Required Field"");
	    							}	    						
	    						if(vSubsIdType != ""CR"")
	    							{
	    								appObj.RaiseErrorText(""Please select CR as Subscriber Id Type for Corporate Customers"");
	    							}
	    							if(vSubsId == """" || vSubsId == null)
	    								{
	    									appObj.RaiseErrorText(""Subscriber Id is Required Field"");
	    								}	    									    								
	    							if(vLenSubId > 10)
	    								{
	    									appObj.RaiseErrorText(""CR length should be Lessthan equal to 10 digit"");
	    								}	    
	    								    vStrsubid = vSubsId.indexOf(""/"",0);
	    										
	    										if(vStrsubid == -1)
	    											{
	    												appObj.RaiseErrorText(""Please enter '/' in Subscriber Id"");
	    											}  
	    																	    	
	    								if(vIndTypeId == """" || vIndTypeId == null)
	    									{
	    										appObj.RaiseErrorText(""Individual Id Type is required Field"")
	    									}
	    									    									
	    								if(vIndTypeId == ""CR"")
	    								{	
	    									appObj.RaiseErrorText(""Please select Bharain Id or Passport or GCC as IndividualType Id for corporate customers"");//Added GCC for CIO
	    								}	   
	    								    if(vIndId == """" || vIndId == null)	
	    								    	{
	    											appObj.RaiseErrorText(""Individual Id # is Required Field"");
	    										}								
	    								if(vIndTypeId == ""Bahraini ID"")
	    									{
	    										if(vLenIndId != 9)	
	    											{
	    											appObj.RaiseErrorText(""Bharain Id must be 9 digits"");									
	    												}
	    										else{//CIO
	    											if(vIndCntryCode != ""BH"")
	    												appObj.RaiseErrorText(""Please select type as ‘Bahraini Id’ for country Bahrain."");
	    										}//endelse vLenIndId
	    									}
	    								if(vIndTypeId == ""Passport"")
	    									{
	    										if(vLenIndId > 12)			
	    											{
	    												appObj.RaiseErrorText(""Passport Should be lessthan equal to 12 digit"");									
	    												}
	    											}
	    								//CIO
	    								if(vIndTypeId == ""GCC""){
	    									ValidateGCCId(vIndId,vCustType);		    									
	    								}//endif
	    						 }		
	    						 /////Praven/////
	    						 if(vCustType == ""SME"")
	    						 {
                                   if(vSubsIdType == """" || vSubsIdType == null)
                                   {
                                    appObj.RaiseErrorText(""Subscriber Id Type is Required Field"");
                                    }                                                                                                              
                                   if(vSubsIdType != ""CR"")
                                   {
                                    appObj.RaiseErrorText(""Please select CR as Subscriber Id Type for SME Customers"");
                                   }
                                  if(vSubsId == """" || vSubsId == null)
                                   {
                                    appObj.RaiseErrorText(""Subscriber Id is Required Field"");
                                   } 
                                    if(vLenSubId > 10)
                                    {
                                      appObj.RaiseErrorText(""CR length should be Lessthan equal to 10 digit"");
                                     }                  
                                      vStrsubid = vSubsId.indexOf(""/"",0);
                                                                                                                                                                                
                                 if(vStrsubid == -1)
			                       {
			                                       appObj.RaiseErrorText(""Please enter '/' in Subscriber Id"");
			                       }
                                    if(vIndTypeId == """" || vIndTypeId == null)
									{
									appObj.RaiseErrorText(""Individual Id Type is required Field"")
									}
									
									if(vIndTypeId == ""CR"")
									{              
									appObj.RaiseErrorText(""Please select Bharain Id or Passport or GCC as IndividualType Id for SME customers"");//Added GCC for CIO
									}                 
									if(vIndId == """" || vIndId == null)           
									{
									appObj.RaiseErrorText(""Individual Id # is Required Field"");
									}
									if(vIndTypeId == ""Bahraini ID"")
									{
									if(vLenIndId != 9)             
									{
									appObj.RaiseErrorText(""Bharain Id must be 9 digits"");
									}
									else{
										if(vIndCntryCode != ""BH"")
	    									appObj.RaiseErrorText(""Please select type as ‘Bahraini Id’ for country Bahrain."");
	    							}//endelse vLenIndId
									}
                                   if(vIndTypeId == ""Passport"")
                                   {
                                   if(vLenIndId > 12)
                                   {
                                   appObj.RaiseErrorText(""Passport Should be lessthan equal to 12 digit"");
                                   }
                                  } 
                                  //CIO
	    							if(vIndTypeId == ""GCC""){
	    								ValidateGCCId(vIndId,vCustType);		    									
	    							}//endif
                                }                                  
////Praveen///							
	    						if(vCustType == ""Organization"")	
	    						{
	    							if(vSubsIdType == """" || vSubsIdType == null)
	    									{
	    										appObj.RaiseErrorText(""Subscriber Id Type is Required Field"");
	    									}
	    									
	    									if(!(vSubsIdType == ""Bahraini ID"" || vSubsIdType == ""Passport"" ))
	    									{
	    											appObj.RaiseErrorText(""Please select Bahraini ID or Passport as Subscriber Id Type for Organisation Customers"");
	    										}		
	    											if(vSubsId == """" || vSubsId == null)
	    												{
	    													appObj.RaiseErrorText(""Subscriber Id is Required Field"");
	    												}	    											  	
	    			 			  					if(vSubsIdType == ""Bahraini ID"")
	    			 			  						{
	    			 			  							if(vLenSubId != 9)
	    			 			  								{
	    			 			  										appObj.RaiseErrorText(""Bharain Id must be 9 digits"");
	    			 			  								}
	    			 			  						}
	    			 			  					 if(vSubsIdType == ""Passport"")
	    			 			  					 	{
	    			 			  					 		if(vLenSubId > 12)
	    			 			  								{
	    			 			  										appObj.RaiseErrorText(""Passport Should be lessthan equal to 12 digit"");
	    			 			  								}	
	    			 			  						}
	    			 			  					if(vIndTypeId == """" || vIndTypeId == null)	
	    								    				{
	    														appObj.RaiseErrorText(""Individual Id Type is Required Field"");
	    													}	
	    			 			  					if(vIndTypeId != ""CR"")
	    												{	
	    													appObj.RaiseErrorText(""Please select CR as IndividualType Id for Organisation customers"");
	    												}	
	    			 			  					if(vIndTypeId == ""CR"")
	    			 			  						{	
	    			 			  							if(vIndId == """" || vIndId == null)
	    			 			  								{
	    			 			  									appObj.RaiseErrorText(""Individual Id # is Required Field"");
	    			 			  								}	    			 			  						
	    			 			  							if(vLenIndId > 10)			
	    														{
	    															appObj.RaiseErrorText(""CR length should be Lessthan equal to 10 digit"");									
	    														}
	    															 vStrsubid = vIndId.indexOf(""/"",0);
	    										
	    															if(vStrsubid == -1)
	    																{
	    																	appObj.RaiseErrorText(""Please enter '/' in Subscriber Id"");
	    																}	
	    			 			  						}
	    			 			  				}
	    			 			  				
	    			 			 if(vCustType == ""Individual"")	
	    			 			  	{	
	    			 			  		if(vSubsIdType == """" || vSubsIdType == null)
	    			 			  			{
	    			 			  				appObj.RaiseErrorText(""Subscriber Id Type is Required Field"");
	    			 			  			}	    			 			  			
	    			 			  	if(!(vSubsIdType == ""Bahraini ID"" || vSubsIdType == ""Passport"" || vSubsIdType == ""GCC""))//CIO added GCC
	    										{
	    											appObj.RaiseErrorText(""Please select Bahraini ID or Passport or GCC as Subscriber Id Type for Individual Customers"");
	    										}	
	    										if(vSubsId == """" || vSubsId == null)
	    												{
	    													appObj.RaiseErrorText(""Subscriber Id is Required Field"");
	    												}	    										
	    			 			  			if(vSubsIdType == ""Bahraini ID"")
	    			 			  				{		    			 			  					
	    			 			  						if(vLenSubId != 9)
	    			 			  								{
	    			 			  										appObj.RaiseErrorText(""Bharain Id must be 9 digits"");
	    			 			  								}
	    			 			  						else{
																if(vSubCntyCode != ""BH"")
	    															appObj.RaiseErrorText(""Please select type as ‘Bahraini Id’ for country Bahrain."");
	    												}//endelse vLenSubId
	    			 			  				}
	    			 			  						if(vSubsIdType == ""Passport"")
	    			 			  								{
	    			 			  										if(vLenSubId > 12)
	    			 			  											{
	    			 			  												appObj.RaiseErrorText(""Passport Should be lessthan equal to 12 digit"");
	    			 			  											}			
	    			 			  								} 
	    			 			  			if(vSubsIdType == ""GCC""){//CIO Software Update SD :SRINI
	    			 			  				ValidateGCCId(vSubsId,vCustType);
	    			 			  			}//endif vSubsIdType == ""GCC""
	    			 			  			    			 			  		
	    			 			  		} 	   			 			  	
	    			 			  	}
	  //  }
		}// end of with(this.BusComp())
		with(bcBilling)
		{
		   SetViewMode(AllView);
		   ClearToQuery();
		   SetSearchExpr(""[Id] = '"" + sBillingId + ""' AND [STC Club Viva Flag] = 'Y'"");
		   ExecuteQuery(ForwardOnly);
		   
		   if (FirstRecord())
		   {
		       sOrderType = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_TYPE"",""Provide"");
		       sOrderStatus = appObj.InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""Complete"");
		       with(bcOrder)
		       {
		          SetViewMode(AllView);
		          ActivateField(""STC Order SubType"");
		          ActivateField(""Status"");
		          ClearToQuery();
		          SetSearchExpr(""[Billing Account Id] = '"" + sBillingId + ""' AND [STC Order SubType] = '"" + sOrderType + ""' AND [Status] = '"" + sOrderStatus + ""'"");
		          ExecuteQuery(ForwardOnly);
		          sRecordCount = CountRecords();
		          
		          if (sRecordCount > 2)
		          {
		             appObj.RaiseErrorText(""No more Voice Plan allowed for VIVA Club Package."");
		             
		          }   
		          
		        } //end of with  
		          
		          
		          
		          
		       
		       
		   } //end of if
		 
		 
		 } // end of with   			
		// sOrderSubStatus = this.BusComp().ParentBusComp().GetFieldValue(""STC Order Sub Status"");
		sLOVSubStatus = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Order Validated"");
		//if(sOrderSubStatus != sLOVSubStatus)
		sOrderId = this.BusComp().GetFieldValue(""Id"");
		sLOVProductType = appObj.InvokeMethod(""LookupValue"",""PRODUCT_TYPE"",""Equipment"");		
		boOrder = appObj.GetBusObject(""Order Entry (Sales)"");
	    bcOrderLineItem = boOrder.GetBusComp(""Order Entry - Line Items"");
		with(bcOrderLineItem)
		{
			SetViewMode(AllView);
		  	ActivateField(""Product Type"");
  		    ClearToQuery();
			SetSearchExpr(""[Order Header Id] ='"" + sOrderId + ""' AND [Root Order Item Id] = [Id]"");
			ExecuteQuery(ForwardOnly);	

			if (FirstRecord())
			{
				sProductType = GetFieldValue(""Product Type"");
			}
		}
		
		if (sProductType != sLOVProductType)	  
		{
			  //  appobj = TheApplication(); 
			     Inputs = appObj.NewPropertySet();
			     Outputs = appObj.NewPropertySet();
			     //sOrderId = this.BusComp().GetFieldValue(""Id"");
			     Inputs.SetProperty(""Order Id"",sOrderId);
			     srvc = appObj.GetService(""STC Order Validation"");
			     srvc.InvokeMethod(""ValidateOrderSTC"",Inputs,Outputs);
			     sErrMsg = Outputs.GetProperty(""Error Message"");
		   	     sErrorCode = Outputs.GetProperty(""Error Code"");
		}
		
		if(sErrorCode !="""" && sErrorCode != null)
		{
		   	TheApplication().RaiseErrorText(sErrMsg);
		}
		else
		{
			var sOrdNoUpd = ""N"";
			sOrdNoUpd = fnCANOutstandingVal(sOrderId);
			if(sOrdNoUpd == ""Y"")
			{
			//Do Nothing
			}
			else
			{
		    	this.BusComp().SetFieldValue(""STC Order Sub Status"",sLOVSubStatus);
		    	this.BusComp().WriteRecord();
		    }
		}     
		return(ContinueOperation); 
	
	}
	
	catch(e)
	{
       throw(e);
	}
	finally
	{
	   Inputs = null;
	   Outputs = null;
	   srvc = null;
	   bcOrderLineItem = null;
	   boOrder = null;
	   appObj = null;
	}   	
           
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
var ireturn = """";
var sOrderStatus, sOrderSubStatus, sOrderLOVStatus, sOrderLOVSubStatusRaised;
var MNPOrder, CORPGPRSBAcc;
var appObj = TheApplication();
var CurrBC = this.BusComp();
var sSubStatusPending="""";/*[23Jun2016][NAVINR][Order Approval]*/

with(CurrBC)
{
ActivateField(""STC Cust Exist Plan"");
var OrderType = GetFieldValue(""STC Order SubType"");
var STCExistingCustPlan = GetFieldValue(""STC Cust Exist Plan"");
var STCOrderId = GetFieldValue(""Id"");
}
with(appObj){
appObj.SetProfileAttr(""STCOrderType"",OrderType);
appObj.SetProfileAttr(""STCExistingCustPlan"",STCExistingCustPlan);
appObj.SetProfileAttr(""STCOrderId"",STCOrderId);}

try
{
//ireturn = ContinueOperation;
	switch(MethodName)
	{
		case ""SubmitOrderSTC"":
		//	if (appObj.ActiveViewName() != ""Order Entry - My Orders View (Sales)"")
		//	{
			    MNPOrder = this.BusComp().GetFieldValue(""STC Port In Flag"");//Added to disable Submit button in case of MNP
			    sOrderStatus = CurrBC.GetFieldValue(""Status"");
			    sOrderSubStatus = CurrBC.GetFieldValue(""STC Order Sub Status"");
			    sOrderLOVStatus = appObj.InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""In Progress"");
			    sOrderLOVSubStatusRaised = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Raised"");
				sSubStatusPending = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Pending Approval"");/*[23Jun2016][NAVINR][Order Approval]*/
			    var sCorpGPRS = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""GPRS Order In Progress"");
			    
			  if(sOrderStatus == sOrderLOVStatus)
			    {    
			        if(sOrderSubStatus == sOrderLOVSubStatusRaised || sOrderSubStatus == sSubStatusPending)/*[23Jun2016][NAVINR][Order Approval]*/
			        {
			        if(sOrderSubStatus == sCorpGPRS)
			        {
			           CanInvoke = "false"";
			        }
			        }
			        else
			        {   
			        	if(MNPOrder != ""Yes"")//Added to disable Submit button in case of MNP
				       	CanInvoke = ""true"";
				    }   
				}
				else
				{
				    CanInvoke = "false"";
				}        
		//	}
			ireturn = CancelOperation;
			break;
		
		case ""CancelOrderSTC"":
			CanInvoke = ""true"";		
			ireturn = CancelOperation;
			break;
			
		case ""ApproveOrderSTC"":
			CanInvoke = ""true"";		
			ireturn = CancelOperation;
			break;
			
			
		case ""RejectOrderSTC"":
			CanInvoke = ""true"";		
			ireturn = CancelOperation;
			break;
			
		case ""STCMNPSubmitOrder"":
		 	MNPOrder = CurrBC.GetFieldValue(""STC Port In Flag"");
		 	var stat = CurrBC.GetFieldValue(""STC Order Sub Status"");
		 	if(MNPOrder != ""Yes"")
		 	{
		 	CanInvoke = "false"";
		 	}
		 	else if(MNPOrder == ""Yes"" && stat == ""Order Validated"")
		 	{
			CanInvoke = ""true"";		
			}
			ireturn = CancelOperation;
			break;	
		
			case ""STCMNPSubmitAutomated"":
			MNPOrder = CurrBC.GetFieldValue(""STC Port In Flag"");
		 	var stat = CurrBC.GetFieldValue(""STC Order Sub Status"");
		 	if(MNPOrder != ""Yes"")
		 	{
		 	CanInvoke = "false"";
		 	}
		 	else if(MNPOrder == ""Yes"" && stat == ""Order Validated"")
		 	{
			CanInvoke = ""true"";		 
			}
			ireturn = CancelOperation;
			break;
		
				
			case ""CorpGPRS"":
		 	var Ordstat = this.BusComp().GetFieldValue(""STC Order Sub Status"");
		 	var product = this.BusComp().GetFieldValue(""STCCorpGPRSDummyProduct"");
			if( product != """" && (Ordstat == ""Order Validated"" || Ordstat == ""GPRS Order In Progress""))
		 	{
			CanInvoke = ""true"";		
			}
			else
				{
				    CanInvoke = "false"";
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
		case ""SubmitOrderSTC"":
		    CurrBC.WriteRecord();
		   
			CurrBC.ActivateField(""STC Port In Flag"");
			var MNPOrder = CurrBC.GetFieldValue(""STC Port In Flag"");
			var CurrLogin = appObj.LoginName();
			
			//ANKIT: Added for POS Restriction
			CurrBC.ActivateField(""STC Customer Type"");
			CurrBC.ActivateField(""STC POS Order Flag"");
			sCustomerType = CurrBC.GetFieldValue(""STC Customer Type"");
			sPOSOrderFlag = CurrBC.GetFieldValue(""STC POS Order Flag"");
			sAllowedLogin = appObj.InvokeMethod(""LookupValue"",""STC_POS_ORDER_ADMIN"",CurrLogin);
			if (sCustomerType != ""Corporate"" && sAllowedLogin != CurrLogin && sPOSOrderFlag ==""Y"")
				appObj.RaiseErrorText(""You are not allowed to Submit Order. Please Submit Order from POS."");
			//End of POS Restriction
			
			var foundCSR = appObj.InvokeMethod(""LookupValue"",""STC_MNP_CSR"",CurrLogin); 
			var foundCSRSubstr = foundCSR.substring(0,3);
			if(MNPOrder != ""Yes"")
		{		
			CallSubmitOrderWF();
		}
		else
		{
			if(foundCSRSubstr != ""CSR"")
			{
				appObj.RaiseErrorText(""Sorry!!! MNP Orders can be submitted by special CSRs only"");
			}
			else
			{
			if(CurrBC.GetFieldValue(""STC Order Sub Status"") == ""Raised"" || CurrBC.GetFieldValue(""STC Order Sub Status"") == ""Order Validated"")
				{
					appObj.RaiseErrorText(""Please Submit MNP Request before Submitting Order"");
				}
					else
					{
						CurrBC.ActivateField(""STC MNP Operator"");
					var Donar = CurrBC.GetFieldValue(""STC MNP Operator"");
					if(Donar == """" || Donar == null)
					{
					appObj.RaiseErrorText(""Please select Donar Details for MNP Order"");
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
			
		case ""STCMNPSubmitOrder"":
		    this.BusComp().WriteRecord();
			CallMNPSubmitOrder();
			ireturn = CancelOperation;
			break;
			
			case ""MNPSubmitAutomated"":
		    this.BusComp().WriteRecord();
			CallMNPSubmitOrder();
			ireturn = CancelOperation;
			break;
			
				case ""CorpGPRS"":
			    this.BusComp().WriteRecord();
				CorpGPRS();
				ireturn = CancelOperation;
				break;
			
			
		case ""CancelOrderSTC"":
			ireturn = CancelOperation;
			break;
			
		case ""ApproveOrderSTC"":
			ireturn = CancelOperation;
			break;
			
		case ""RejectOrderSTC"":
			ireturn = CancelOperation;
			break;
			
			
			
	     case ""ValidateOrder"":
	     	   fn_ValidateVirtualMsisdn(); // [Subhankar Poria] 01/24/2013 : BMS Virtual MSISDN Validation
	     	   fn_datacomOrderValidation(); // [Subhankar Poria] 01/24/2013 : Datacom product Check 	 
	           Rateplan();
	           ValidateSTCOrder();
		       //gjena_20102012 added the Code for RatePlan Validation
		       //Rateplan();
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
function fnCANOutstandingVal(sOrderId)
{
try
{
	var sOrdStatNoUpdate = ""N"";
	var appobj = TheApplication();
	var sWfSvc = appobj.GetService(""Workflow Process Manager"");
	var psMNPInputs  = appobj.NewPropertySet();
	var psMNPOutputs  = appobj.NewPropertySet();
	psMNPInputs.SetProperty(""Object Id"",sOrderId);
	psMNPInputs.SetProperty(""ProcessName"",""STC CAN OutStanding Approval Validation WF"");	
	sWfSvc.InvokeMethod(""RunProcess"", psMNPInputs, psMNPOutputs);
	sOrdStatNoUpdate = psMNPOutputs.GetProperty(""OrderStatNoUpdate"");
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
}
"//[Soumyadeep][No Postpaid subscription for Virtual MSISDN][11-10-2012]
function fn_ValidateVirtualMsisdn()
{
	try
	{
		var strServiceType;
		var bRecExist,bRecExist1;
		var sMSISDN="""";
		var boRMSNumberEnquiry;
		var bcRMSNumberEnquiry;
		var bRecordExists;
		var OrderId;
		var BillAccId;
		var boBilling;
		var bcBillAccnt;
		var boOrder;
		var bcOrder;
		var bcOrderLines;
		var strExpr;
		var CurrBC = this.BusComp();
		var appObj = TheApplication();
		var bmsPackagePartNum="""",bmsPackagePartNumLic="""";
		

		CurrBC.ActivateField(""Billing Account Id"");
		CurrBC.ActivateField(""Id"");
		OrderId 	= CurrBC.GetFieldValue(""Id"");
		BillAccId 	= CurrBC.GetFieldValue(""Billing Account Id"");
						
		boBilling 	= appObj.GetBusObject(""STC Billing Account"");
		bcBillAccnt = boBilling.GetBusComp(""CUT Invoice Sub Accounts"");
		boOrder 	= appObj.GetBusObject(""Order Entry (Sales)"");
		bcOrder 	= boOrder.GetBusComp(""Order Entry - Orders"");
		bcOrderLines = boOrder.GetBusComp(""Order Entry - Line Items"");
		
		with (bcBillAccnt)   //with 1
        {   
	        ActivateField(""Id"");
	        ActivateField(""STC Service Type"");
	        SetViewMode(AllView);   
	        ClearToQuery();   
	        SetSearchSpec(""Id"", BillAccId);   
	        ExecuteQuery(ForwardOnly);   
	        bRecExist = FirstRecord(); 
			if(bRecExist) // if 1.1
			{
				strServiceType = GetFieldValue(""STC Service Type"");
			} //end if 1.1
		} //end with
		
		if(strServiceType == ""Postpaid"") // if 2
		{					
			bRecExist = null;
			with (bcOrder)   //with 2.1
			{   
		        ActivateField(""Id"");
		        SetViewMode(AllView);   
		        ClearToQuery();   
		        SetSearchSpec(""Id"", OrderId);   
		        ExecuteQuery(ForwardOnly);   
		        bRecExist = FirstRecord();   
		        if (bRecExist)  //if 2.1.1 
				{   
					with(bcOrderLines)  //with 2.1.1.1 
					{  
				        ActivateField(""Order Header Id"");
				        ActivateField(""Service Id"");
				        ActivateField(""Part Number"");
				        SetViewMode(AllView);   
				        ClearToQuery();
				        SetSearchSpec(""Order Header Id"", OrderId);
				        SetSearchSpec(""Product Type"", ""Package"");
				        ExecuteQuery(ForwardOnly); 
				        bRecExist1 = FirstRecord(); 
				        if(bRecExist1) //if 2.1.1.1.1
				        {
				        	sMSISDN = GetFieldValue(""Service Id"");
				        	bmsPackagePartNum = GetFieldValue(""Part Number"");
				        	
				        	bmsPackagePartNumLic = appObj.InvokeMethod(""LookupValue"", ""STC_BMS_PKG"", bmsPackagePartNum);
				        	if( bmsPackagePartNumLic == bmsPackagePartNum )
				        		appObj.RaiseErrorText(""Bulk SMS Package is not available for postpaid customer"");
				        } //end if 2.1.1.1.1
					} //end with 2.1.1.1
				} // end if 2.1.1
			} // end with 2.1
			
			if( sMSISDN != """" ) //if 2.2
			{
				boRMSNumberEnquiry = TheApplication().GetBusObject(""RMS NM Number Enquiry"");
				bcRMSNumberEnquiry = boRMSNumberEnquiry.GetBusComp(""RMS NM Number Enquiry"");
				with (bcRMSNumberEnquiry) //with 2.2.1
				{				
					ActivateField(""Special Category Type"");
					ActivateField(""Type"");
					ActivateField(""Number String"");
					SetViewMode(AllView);
					ClearToQuery();
					strExpr = "" [Number String] = '""+ sMSISDN +""'""  + ""AND [Special Category Type] = 'Bulk Message' AND [Type] = 'MSISDN'"";
					/*SetSearchSpec(""Special Category Type"", ""Bulk Message"");               
					SetSearchSpec(""Number String"", sMSISDN);
					SetSearchSpec(""Type"", ""MSISDN"");*/
					SetSearchExpr(strExpr);
					ExecuteQuery(ForwardOnly);   
					bRecordExists = FirstRecord();
					if (bRecordExists) //if 2.2.1.1
					{
						appObj.RaiseErrorText(""Virtual MSISDN is not allowed for Postpaid connection."");
					} //end if 2.2.1.1
				} // end with 2.2.1
			}//end if 2.2
		} //end if 2
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
		bRecExist = null;
		bRecExist1=null;
		bcBillAccnt=null;
		bcRMSNumberEnquiry=null;
		bRecordExists=null;
		bcOrder=null;
		bcOrderLines=null;
		CurrBC=null;
		boBilling=null;
		boOrder=null;
		boRMSNumberEnquiry=null;
		appObj=null;
	}
	return(CancelOperation);
	//[Soumyadeep][No Postpaid subscription for Virtual MSISDN][11-10-2012]
}
"/*********************************************************************************************************************************/
/* Subject: Datacom product	combination validation																				 */
/* Author: Subhankar Poria | 12/26/2012																							 */
/* Version: 1.0																													 */	
/*********************************************************************************************************************************/
function fn_datacomOrderValidation()
{
	try
	{
		var vOrderId 		= this.BusComp().GetFieldValue(""Id"");
		var vOrderSubType 	= this.BusComp().GetFieldValue(""STC Order SubType"");
		var objAppln, objOrderBusObj, objOrderBusComp, objOrderItemBusComp;
		var vContractProd, vRelocationPart, vHardwarePart, vSlaPartNum, vTenurePartNum, vCircuitSpeedPartNum, vProfile, vPackageName, vDatcomPackage, vPackagePartNum, vPackagePartNumLic="""", isDatacomPackage=false, vRecCount=0;
		
		if( vOrderSubType == ""Provide"" || vOrderSubType == ""Modify"" )
		{
			objAppln 		= TheApplication();
			objOrderBusObj	= objAppln.GetBusObject(""Order Entry (Sales)"");
			objOrderBusComp	= objOrderBusObj.GetBusComp(""Order Entry - Orders"");
			objOrderItemBusComp = objOrderBusObj.GetBusComp(""Order Entry - Line Items"");
			vContractProd 	= objAppln.InvokeMethod(""LookupValue"", ""STC_DATACOM_CONTRACT_PARTNUM"", ""DATACOM_CONTRACT_PARTNUM"");
			vRelocationPart = objAppln.InvokeMethod(""LookupValue"", ""STC_DATACOMM_PACKAGE"", ""DATACOM_RELOCATION_PARTNUM"");
			vHardwarePart	= objAppln.InvokeMethod(""LookupValue"", ""STC_DATACOMM_PACKAGE"", ""DATACOM_HARDWARE_PARTNUM"");
			vSlaPartNum		= objAppln.InvokeMethod(""LookupValue"", ""STC_DATACOMM_PACKAGE"", ""DATACOM_SLA_PARTNUM"");
			vTenurePartNum	= objAppln.InvokeMethod(""LookupValue"", ""STC_DATACOMM_PACKAGE"", ""DATACOM_TENURE_PARTNUM"");
			vCircuitSpeedPartNum = objAppln.InvokeMethod(""LookupValue"", ""STC_DATACOMM_PACKAGE"", ""DATACOM_CIRCUITSPEED_PARTNUM"");
			
			with(objOrderBusComp)
			{
				ActivateField(""STC Datacom Package"");
				ActivateField(""STC Billing Profile Type"");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchSpec(""Id"", vOrderId );
				ExecuteQuery(ForwardOnly);  
				if( FirstRecord() )
				{
					vProfile = GetFieldValue(""STC Billing Profile Type"");
					vDatcomPackage = GetFieldValue(""STC Datacom Package"");
					////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
					// START: Check For same Datacom Package is selected in Order or not. it's for multiple service in one individual BAN 	
					//Search root product. get product part num, package name.
					//search product partnum in LOV and get display val. if it is present then it will return display val.
					//to check same package check if 1.1
					//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
					with(objOrderItemBusComp)
					{
						ActivateField(""Action Code"");
						ActivateField(""Part Number"");
						ActivateField(""Product Type"");
						ActivateField(""Parent Order Item Id"");
						ActivateField(""Product"");
						SetViewMode(AllView);
						ClearToQuery();
						SetSearchSpec(""Product Type"", ""Package"");
						ExecuteQuery(ForwardOnly); 
						if( FirstRecord() )
						{
							vPackageName = GetFieldValue(""Product"");
							vPackagePartNum = GetFieldValue(""Part Number"");
							vPackagePartNumLic = objAppln.InvokeMethod(""LookupValue"", ""STC_DATACOMM_PACKAGE_PARTNUM"", vPackagePartNum);
							
							if( vProfile == ""Datacom"" && vDatcomPackage != """" && vDatcomPackage != vPackageName ) // 1.1
								objAppln.RaiseErrorText(""You are eligible for selection of "" + vDatcomPackage + "" package only."");
								
							if( vPackagePartNumLic == vPackagePartNum )
								isDatacomPackage = true;
						}
					}
					////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
					//Check for proper combination.
					//Provide order: minimum two contract products with Add action --> Modified on 25th March, 2013 by Subhankar Poria
					//Modify Order: minimum 1 contract product or relocation product with Add action --> Modified on 25th March, 2013 by Subhankar Poria
					//SLA, Contract tenure and Circuit Speed product is mandatory --> Modified on 17th April By Subhankar Poria
					////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
					if(isDatacomPackage && (vOrderSubType == ""Provide"" || vOrderSubType == ""Modify"" )) // if isDatacomPackage
					{
						with(objOrderItemBusComp)
						{
							// Check for mandatory products
							ActivateField(""Action Code"");
							ActivateField(""Part Number"");
							SetViewMode(AllView);
							ClearToQuery();
							SetSearchExpr(""[Action Code] <> 'Delete' AND ( [Part Number] LIKE '"" + vSlaPartNum +""*' OR [Part Number] LIKE '"" + vTenurePartNum +""*' OR [Part Number] LIKE '"" + vCircuitSpeedPartNum +""*')"");
							ExecuteQuery(ForwardOnly); 
							vRecCount = CountRecords();
							vRecCount = ToNumber(vRecCount);
							if( vRecCount < 3 ) 
							{
							//	objAppln.RaiseErrorText(""SLA, Contract Tenure and Circuit Speed are mandatory products. Please select these products to proceed."");//HardikDIA
							}
							// check for contract combination
							ClearToQuery();
							SetSearchExpr(""( [Action Code] = 'Add' OR [Action Code] = 'Delete' ) AND ( [Part Number] = '"" + vContractProd + ""' OR [Part Number] = '"" + vRelocationPart + ""' OR [Part Number] LIKE '"" + vHardwarePart +""*' )"");
							ExecuteQuery(ForwardOnly); 
							vRecCount = CountRecords();
							vRecCount = ToNumber(vRecCount);
							if( vOrderSubType == ""Provide"" && vRecCount < 2 )
							{
							//	objAppln.RaiseErrorText(""Please select a correct combination of products to invoke a contract."");///HardikDIA
							}
							else if( vOrderSubType == ""Modify"" && vRecCount < 1 ) 
							{
							//	objAppln.RaiseErrorText(""Please select a correct combination of products to invoke a contract.""); //HardikDIA
							}
						}
					}// if isDatacomPackage
				}
			}
		}
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
		objAppln = null;
		objOrderBusObj = null;
		objOrderBusComp = null;
		objOrderItemBusComp= null;
	}
	return (CancelOperation);
}
function CallMNPSubmitOrder()
{
var SerAccId;
var appobj = TheApplication();
var sBC = this.BusComp();
try
{
with(sBC)
{
var OrderId = GetFieldValue(""Id"");
var AccType = GetFieldValue(""Order Account Type"");
var BillAccName = GetFieldValue(""Billing Account"");
var BillAddId = GetFieldValue(""Primary Account Address Id"");
var CommType = GetFieldValue(""STC Community Type"");
var CustAccId = GetFieldValue(""Customer Account Id"");
var OrderSubType = GetFieldValue(""STC Order SubType"");
var BillAccId = GetFieldValue(""Billing Account Id"");
var PriConId = GetFieldValue(""STC Primary Contact Id"");
SerAccId = GetFieldValue(""Service Account Id"");
}


var STCInputs  = appobj.NewPropertySet();
var STCOutputs  = appobj.NewPropertySet();


if(SerAccId == """" || SerAccId == null)
{
	var STCCreateSAN = appobj.GetService(""STC Create Subscription"");
	STCInputs.SetProperty(""Account Type"",AccType);
	STCInputs.SetProperty(""Billing Account Name"",BillAccName);
	STCInputs.SetProperty(""Billing Address Id"",BillAddId);
	STCInputs.SetProperty(""Community Type"",CommType);
	STCInputs.SetProperty(""Customer Account Id"",CustAccId);
	STCInputs.SetProperty(""Order Id"",OrderId);
	STCInputs.SetProperty(""Order Sub Type"",OrderSubType);
	STCInputs.SetProperty(""Billing Account Id"",BillAccId);
	STCInputs.SetProperty(""Primary Contact Id"",PriConId);	
	STCCreateSAN.InvokeMethod(""CreateSubscription"", STCInputs, STCOutputs);
	SerAccId = STCOutputs.GetProperty(""ServiceAccountId"");
	var ErrMsg = STCOutputs.GetProperty(""Error Message"");
	if((SerAccId != """" || SerAccId != null) && ErrMsg == """" )
	{	
	sBC.ActivateField(""Service Account Id"");
	sBC.SetFieldValue(""Service Account Id"", SerAccId);
	sBC.WriteRecord();
	}
	else if(ErrMsg != null || ErrMsg != """")
	{
		appobj.RaiseErrorText(ErrMsg);
	}
}
			var vMNPSRCreate = appobj.InvokeMethod(""LookupValue"",""STC_MNP_SR_CREATE"",""MNPSRCREATE"");
			
			if(vMNPSRCreate == ""TRUE"")
				{

var SerReqBC = appobj.GetBusObject(""Service Request"").GetBusComp(""Service Request"");
with(SerReqBC)
{
SetViewMode(AllView);
ClearToQuery();
SetSearchSpec(""Account Id"", SerAccId);
ExecuteQuery(ForwardOnly);
if(!FirstRecord())
{
var STCInputsone  = appobj.NewPropertySet();
var STCOutputsone  = appobj.NewPropertySet();
		var STCCreateSR = appobj.GetService(""Workflow Process Manager"");
		
		
		STCInputsone.SetProperty(""SerAccId"",SerAccId);
		STCInputsone.SetProperty(""Type"", ""CreateMNPReq"");
		STCInputsone.SetProperty(""ProcessName"", ""STC Create MNP Service Request"");

		STCCreateSR.InvokeMethod(""RunProcess"", STCInputsone, STCOutputsone);
		var SerReqId = STCOutputsone.GetProperty(""SR Id"");
		
		var serReqBC = appobj.GetBusObject(""Service Request"").GetBusComp(""Service Request"");
		var MNPQueueId = appobj.InvokeMethod(""LookupValue"",""STC_MNP_QUEUE"", ""HELP_DESK""); 
		with(serReqBC)
		{
				SetViewMode(AllView);
				ActivateField(""STC Queue Name"");
				ActivateField(""Call Back"");
				ClearToQuery();
				SetSearchSpec(""SR Id"", SerReqId)
				ExecuteQuery(ForwardOnly);
				var IsSRRec = FirstRecord();
				if(IsSRRec)
				{
					SetFieldValue(""Call Back"" , ""N"");
					SetFieldValue(""STC Queue Id"" , MNPQueueId);
					SetFieldValue(""Status"", ""In Progress"");
					SetFieldValue(""Sub-Status"", ""Queued"");
					WriteRecord();
				}
		}
		}
	}	
}
		var vMNPOrderSubmit = appobj.InvokeMethod(""LookupValue"",""STC_MNP_PORT_AUTO"",""Automated"");
			
			if(vMNPOrderSubmit == ""TRUE"")
				{
					
				var MNPInputs  = appobj.NewPropertySet();
				var MNPOutputs  = appobj.NewPropertySet();
				var MNPService = appobj.GetService(""Workflow Process Manager"");
				
		MNPInputs.SetProperty(""ServAccntId"",SerAccId);
		MNPInputs.SetProperty(""Object Id"",OrderId);
		MNPInputs.SetProperty(""ProcessName"", ""STC GenPortIn Request WF"");
		MNPService.InvokeMethod(""RunProcess"", MNPInputs, MNPOutputs);
		sBC.SetFieldValue(""STC Order Sub Status"",""MNP Order In Progress"");
		sBC.WriteRecord();
		}
		else
		{			
		sBC.SetFieldValue(""STC Order Sub Status"",""MNP Order In Progress"");
		sBC.WriteRecord();
		}
	}
	catch(e)
	{
		throw(e)
	}
	finally
	{	
		SerReqBC = null;
		sBC = null;
		appobj = null;
		}
}
function CallSubmitOrderWF()
{
	var appobj = TheApplication();
	var STCInputs  = appobj.NewPropertySet();
	var STCOutputs  = appobj.NewPropertySet();
	var sSimRetain;
  	var SMigType;
  		
	try
	{
		this.BusComp().ActivateField(""SIM Retension Flag"");
		sSimRetain = this.BusComp().GetFieldValue(""SIM Retension Flag"");
		SMigType = this.BusComp().GetFieldValue(""Delivery Block"");
		TheApplication().SetProfileAttr(""SimRetain"",sSimRetain);
	    TheApplication().SetProfileAttr(""MigType"",SMigType);
	    
		var STCRowId = this.BusComp().GetFieldValue(""Id"");
		var STCWorkflowProc = appobj.GetService(""Workflow Process Manager"");
		STCInputs.SetProperty(""Object Id"",STCRowId);
		STCInputs.SetProperty(""ProcessName"",""STC Submit Order Wrapper"");
		
		STCWorkflowProc.InvokeMethod(""RunProcess"", STCInputs, STCOutputs);
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
function CorpGPRS()
{
	var CurrBC = this.BusComp();
	
	CurrBC.WriteRecord();
		var SerAccId;
		var sName;
		var sValue;
		var sTemplateId;
		var CNTXId;
		var OrderId;
		var sOrderItemId;
		var sOrderItemXAId;
		var APNProdName;
with(CurrBC)
{
	OrderId = GetFieldValue(""Id"");
	var AccType = GetFieldValue(""Order Account Type"");
	var BillAccName = GetFieldValue(""Billing Account"");
	var BillAddId = GetFieldValue(""Primary Account Address Id"");
	var CommType = GetFieldValue(""STC Community Type"");
	var CustAccId = GetFieldValue(""Customer Account Id"");
	var OrderSubType = GetFieldValue(""STC Order SubType"");
	var BillAccId = GetFieldValue(""Billing Account Id"");
	var PriConId = GetFieldValue(""STC Primary Contact Id"");
	SerAccId = GetFieldValue(""Service Account Id"");
	var appobj = TheApplication();
	var STCInputs  = appobj.NewPropertySet();
	var STCOutputs  = appobj.NewPropertySet();
	
	if(SerAccId == """" || SerAccId == null)
	{
		var STCCreateSAN = appobj.GetService(""STC Create Subscription"");
		STCInputs.SetProperty(""Account Type"",AccType);
		STCInputs.SetProperty(""Billing Account Name"",BillAccName);
		STCInputs.SetProperty(""Billing Address Id"",BillAddId);
		STCInputs.SetProperty(""Community Type"",CommType);
		STCInputs.SetProperty(""Customer Account Id"",CustAccId);
		STCInputs.SetProperty(""Order Id"",OrderId);
		STCInputs.SetProperty(""Order Sub Type"",OrderSubType);
		STCInputs.SetProperty(""Billing Account Id"",BillAccId);
		STCInputs.SetProperty(""Primary Contact Id"",PriConId);	
		STCCreateSAN.InvokeMethod(""CreateCorpGPRSSubscription"", STCInputs, STCOutputs);
		SerAccId = STCOutputs.GetProperty(""ServiceAccountId"");
		var ErrMsg = STCOutputs.GetProperty(""Error Message"");
		if((SerAccId != """" || SerAccId != null) && ErrMsg == """" )
		{	
		ActivateField(""Service Account Id"");
		SetFieldValue(""Service Account Id"", SerAccId);
		WriteRecord();
		}//if((SerAccId != """" || SerAccId != null) && ErrMsg == """" )

	}// end of if(SerAccId == """" || SerAccId == null)
	
		var StrOrderBO = TheApplication().GetBusObject(""Order Entry (Sales)"");
		var StrOrderBC = StrOrderBO.GetBusComp(""Order Entry - Orders"");
		
		var sBCLineItem = StrOrderBO.GetBusComp(""Order Entry - Line Items"");
		var sOrderItemXA = StrOrderBO.GetBusComp(""Order Item XA"");
		with(StrOrderBC)
		{
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"", OrderId);
		ExecuteQuery(ForwardOnly);
		var isOrderrec = FirstRecord();
		if(isOrderrec)
		{
				with(sBCLineItem)
				{
				SetViewMode(AllView);
				ActivateField(""Order Header Id"");
				ActivateField(""Part Number"");
				ClearToQuery();
				var spec  = ""[Part Number] LIKE 'APN*' AND ([Action Code] = 'Add' OR [Action Code] = 'Delete') AND [Order Header Id] = '"" + OrderId + ""'"";
				SetSearchExpr(spec);
				
				ExecuteQuery(ForwardOnly);
				var isrec = FirstRecord();
				while(isrec)
				{
					sOrderItemId = GetFieldValue(""Id"");
					APNProdName = GetFieldValue(""Part Number"");
					with(sOrderItemXA)
					{
						ActivateField(""Object Id"");
						SetViewMode(AllView);
						ClearToQuery();
						var XAspec  = ""[Object Id] = '"" + sOrderItemId + ""'"";
						SetSearchExpr(XAspec);
						ExecuteQuery(ForwardOnly);
						var isrecord = FirstRecord();
						if(isrecord)
						{
							while(isrecord)
							{
									sOrderItemXAId = GetFieldValue(""Id"");
									var sOrderItemName = GetFieldValue(""Name"");
									if(sOrderItemName == 'APN_APNName')
									{
										sName = GetFieldValue(""Value"");
									}
									if(sOrderItemName == 'APN_APNType')
									{
										sValue = GetFieldValue(""Value"");
									}
									if(sOrderItemName == 'APN_APNTemplateID')
									{
										sTemplateId = GetFieldValue(""Value"");
									}
									if(sOrderItemName == 'APN_CNTXID')
									{
										CNTXId = GetFieldValue(""Value"");
									}
								isrecord = NextRecord();
							}//end of while
						}//end of if
						var SerReqBC = TheApplication().GetBusObject(""Service Request"").GetBusComp(""Service Request"");
						var STCInputsone  = appobj.NewPropertySet();
						var STCOutputsone  = appobj.NewPropertySet();
						var STCCreateSR = appobj.GetService(""Workflow Process Manager"");
						STCInputsone.SetProperty(""SerAccId"",SerAccId);
						STCInputsone.SetProperty(""Type"", ""CreateGPRSReq"");
						STCInputsone.SetProperty(""ProcessName"", ""STC Create Corporate GPRS Service Request"");
						STCCreateSR.InvokeMethod(""RunProcess"", STCInputsone, STCOutputsone);
						var SerReqId = STCOutputsone.GetProperty(""SR Id"");
						var serReqBC = appobj.GetBusObject(""Service Request"").GetBusComp(""Service Request"");
						var GPRSQueueId = appobj.InvokeMethod(""LookupValue"",""STC_NETWORK_QUEUE"", ""HELP_DESK""); 
						with(serReqBC)
						{
							SetViewMode(AllView);
							ActivateField(""STC Queue Name"");
							ActivateField(""Call Back"");
							ActivateField(""APN Name"");
							ActivateField(""STC GPRS Prod Name"");
							ActivateField(""APN Template Id"");
							ActivateField(""APN Value"");
							ActivateField(""APN CNTX Id"");
							ClearToQuery();
							SetSearchSpec(""SR Id"", SerReqId);
							ExecuteQuery(ForwardOnly);
							var IsSRRec = FirstRecord();
							if(IsSRRec)
							{
								SetFieldValue(""Call Back"" , ""N"");
								SetFieldValue(""STC Queue Id"" , GPRSQueueId);
								SetFieldValue(""Status"", ""In Progress"");
								SetFieldValue(""Sub-Status"", ""Queued"");
								SetFieldValue(""APN Name"", sName);
								SetFieldValue(""APN Value"", sValue);
								SetFieldValue(""APN Template Id"", sTemplateId);
								SetFieldValue(""APN CNTX Id"", CNTXId);
								SetFieldValue(""APN OrderItemId"", sOrderItemId);
								SetFieldValue(""STC GPRS Prod Name"", APNProdName);
								WriteRecord();
							}//end of If
						}//end of with(serReqBC) 
						}//end of sOrderItemXA with
				isrec = NextRecord();
				}// while 
				}//end of sBCLineItem with
		}// end of if Order Rec
	
	}
	
					with(sBCLineItem)
					{
					SetViewMode(AllView);
					ActivateField(""Order Header Id"");
					ActivateField(""Order Header Id"");
					ClearToQuery();
					SetSearchSpec(""Order Header Id"", OrderId);
					ExecuteQuery(ForwardOnly);
					var OrderLineRec = FirstRecord();
					while(OrderLineRec)
					{
							SetFieldValue(""Service Account Id"",SerAccId);
							WriteRecord();
							OrderLineRec = NextRecord();
					}
					
					}
					SetFieldValue(""STC Order Sub Status"",""GPRS Order In Progress"");
					WriteRecord();
	
	
	
}// end of with
}// end of CorpGPRS"
function ValidateSTCOrder()
{
  var ireturn;
  var sOrderSubStatus;
  var sLOVSubStatus;
  var sBusSrvc;
  var appObj;
  var Inputs;
  var Outputs;
  var srvc;
  var sOrderId;
  var sErrMsg;
  var sErrorCode;
  var boOrder;
  var bcOrderLineItem;   
  var sProductType;
  var sLOVProductType;
  
  var boBilling;
  var bcBilling;
  var sBillingId;
  var bcOrder;
  var sOrderType;
  var sOrderStatus;
  var sRecordCount;
  var ordType;
 var PortOut;
  try
  {
                     
		appObj = TheApplication(); 
		
		boBilling = appObj.GetBusObject(""STC Billing Account"");
		bcBilling = boBilling.GetBusComp(""CUT Invoice Sub Accounts"");
		bcOrder = boBilling.GetBusComp(""Order Entry - Orders"");
		sBillingId = this.BusComp().GetFieldValue(""Billing Account Id"");
		
			    with(this.BusComp())
	    {
	    
	    ActivateField(""STC Order SubType"");
	    ordType = GetFieldValue(""STC Order SubType"");
	    var DiscOrder = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_TYPE"",""Disconnect"");
	   // if(ordType == DiscOrder)
	 //   {
	    	ActivateField(""STC MNP Port Out"");
			ActivateField(""STC Port In Flag"");
			var MNPPortIn = GetFieldValue(""STC Port In Flag"");
	    	PortOut = GetFieldValue(""STC MNP Port Out"");
	    	if(PortOut == ""Y"" || MNPPortIn == ""Yes"")
	    	{
	    		ActivateField(""STC MNP Operator"");
	    		var Oper = GetFieldValue(""STC MNP Operator"");
	    		if(Oper == """" || Oper == null)
	    		{
	    			appObj.RaiseErrorText(""Please select operator for MNP Orders"");
	    		}
	    	}
	   // }
		}// end of with(this.BusComp())
	    
		
		with(bcBilling)
		{
		   SetViewMode(AllView);
		   ClearToQuery();
		   SetSearchExpr(""[Id] = '"" + sBillingId + ""' AND [STC Club Viva Flag] = 'Y'"");
		   ExecuteQuery(ForwardOnly);
		   
		   if (FirstRecord())
		   {
		       sOrderType = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_TYPE"",""Provide"");
		       sOrderStatus = appObj.InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""Complete"");
		       with(bcOrder)
		       {
		          SetViewMode(AllView);
		          ActivateField(""STC Order SubType"");
		          ActivateField(""Status"");
		          ClearToQuery();
		          SetSearchExpr(""[Billing Account Id] = '"" + sBillingId + ""' AND [STC Order SubType] = '"" + sOrderType + ""' AND [Status] = '"" + sOrderStatus + ""'"");
		          ExecuteQuery(ForwardOnly);
		          sRecordCount = CountRecords();
		          
		          if (sRecordCount > 2)
		          {
		             appObj.RaiseErrorText(""No more Voice Plan allowed for VIVA Club Package."");
		             
		          }   
		          
		        } //end of with  
		          
		          
		          
		          
		       
		       
		   } //end of if
		 
		 
		 } // end of with      
		   
		   		
		
		
		
		
		
			
		// sOrderSubStatus = this.BusComp().ParentBusComp().GetFieldValue(""STC Order Sub Status"");
		sLOVSubStatus = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Order Validated"");
		//if(sOrderSubStatus != sLOVSubStatus)
		
		sOrderId = this.BusComp().GetFieldValue(""Id"");
		sLOVProductType = appObj.InvokeMethod(""LookupValue"",""PRODUCT_TYPE"",""Equipment"");
		
		boOrder = appObj.GetBusObject(""Order Entry (Sales)"");
	    bcOrderLineItem = boOrder.GetBusComp(""Order Entry - Line Items"");
		
	
		  
		with(bcOrderLineItem)
		{
			SetViewMode(AllView);
		  	ActivateField(""Product Type"");
  		    ClearToQuery();
			SetSearchExpr(""[Order Header Id] ='"" + sOrderId + ""' AND [Root Order Item Id] = [Id]"");
			ExecuteQuery(ForwardOnly);	

			if (FirstRecord())
			{
				sProductType = GetFieldValue(""Product Type"");
			}
		}
		
		if (sProductType != sLOVProductType)	  
		{
			  //  appobj = TheApplication(); 
			     Inputs = appObj.NewPropertySet();
			     Outputs = appObj.NewPropertySet();
			     //sOrderId = this.BusComp().GetFieldValue(""Id"");
			     Inputs.SetProperty(""Order Id"",sOrderId);
			     srvc = appObj.GetService(""STC Order Validation"");
			     srvc.InvokeMethod(""ValidateOrderSTC"",Inputs,Outputs);
			     sErrMsg = Outputs.GetProperty(""Error Message"");
		   	     sErrorCode = Outputs.GetProperty(""Error Code"");
		}
		
		if(sErrorCode !="""" && sErrorCode != null)
		{
		   	TheApplication().RaiseErrorText(sErrMsg);
		}
		else
		{
		    this.BusComp().SetFieldValue(""STC Order Sub Status"",sLOVSubStatus);
		    this.BusComp().WriteRecord(); 
		}     
		return(ContinueOperation); 
	
	}
	
	catch(e)
	{
       throw(e);
	}
	finally
	{
	   Inputs = null;
	   Outputs = null;
	   srvc = null;
	   bcOrderLineItem = null;
	   boOrder = null;
	   appObj = null;
	}   	
           
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
var ireturn = """";
var sOrderStatus;
var sOrderSubStatus; 
var sOrderLOVStatus;
var sOrderLOVSubStatusRaised;
var MNPOrder;
var CORPGPRSBAcc;
var appObj = TheApplication();
var PartNum;

//this.BusComp().ActivateField(""STC APN Billing Account Id"");
//CORPGPRSBAcc = this.BusComp().GetFieldValue(""STC APN Billing Account Id"");
//appObj.SetProfileAttr(""CORPGPRSBAcc"",CORPGPRSBAcc);
try
{
//ireturn = ContinueOperation;
	switch(MethodName)
	{
		case ""SubmitOrderSTC"":
		//	if (TheApplication().ActiveViewName() != ""Order Entry - My Orders View (Sales)"")
		//	{
			    
			    sOrderStatus = this.BusComp().GetFieldValue(""Status"");
			    sOrderSubStatus = this.BusComp().GetFieldValue(""STC Order Sub Status"");
			    sOrderLOVStatus = appObj.InvokeMethod(""LookupValue"",""FS_ORDER_STATUS"",""In Progress"");
			    sOrderLOVSubStatusRaised = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""Raised"");
			    var sCorpGPRS = appObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_STATUS"",""GPRS Order In Progress"");
			    
			    if(sOrderStatus == sOrderLOVStatus)
			    {    
			        if(sOrderSubStatus == sOrderLOVSubStatusRaised)
			        {
			        if(sOrderSubStatus == sCorpGPRS)
			        {
			           CanInvoke = "false"";
			        }
			        }
			        else
			        {   
				       CanInvoke = ""true"";
				    }   
				}
				else
				{
				    CanInvoke = "false"";
				}        
		//	}
			ireturn = CancelOperation;
			break;
		
		case ""CancelOrderSTC"":
			CanInvoke = ""true"";		
			ireturn = CancelOperation;
			break;
			
		case ""ApproveOrderSTC"":
			CanInvoke = ""true"";		
			ireturn = CancelOperation;
			break;
			
			
		case ""RejectOrderSTC"":
			CanInvoke = ""true"";		
			ireturn = CancelOperation;
			break;
			
		case ""STCMNPSubmitOrder"":
		 	MNPOrder = this.BusComp().GetFieldValue(""STC Port In Flag"");
		 	var stat = this.BusComp().GetFieldValue(""STC Order Sub Status"");
		 	if(MNPOrder != ""Yes"")
		 	{
		 	CanInvoke = "false"";
		 	}
		 	else if(MNPOrder == ""Yes"" && stat == ""Order Validated"")
		 	{
			CanInvoke = ""true"";		
			}
			ireturn = CancelOperation;
			break;	
		
			case ""STCMNPSubmitAutomated"":
			MNPOrder = this.BusComp().GetFieldValue(""STC Port In Flag"");
		 	var stat = this.BusComp().GetFieldValue(""STC Order Sub Status"");
		 	if(MNPOrder != ""Yes"")
		 	{
		 	CanInvoke = "false"";
		 	}
		 	else if(MNPOrder == ""Yes"" && stat == ""Order Validated"")
		 	{
			CanInvoke = ""true"";		
			}
			ireturn = CancelOperation;
			break;
		
				
			case ""CorpGPRS"":
		 	var Ordstat = this.BusComp().GetFieldValue(""STC Order Sub Status"");
		  	if(Ordstat == ""Order Validated"" || Orderstat != ""GPRS Order In Progress"")
		 	{
			CanInvoke = ""true"";		
			}
			else
				{
				    CanInvoke = "false"";
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
}	
}
function WebApplet_PreInvokeMethod (MethodName)
{
var ireturn;
var CurrBC = this.BusComp();
 var appObj = TheApplication();
try
{

	if(MethodName == ""DeleteRecord"" || MethodName == ""CopyRecord"" || MethodName == ""NewRecord"" || MethodName == ""NewQuery"" || MethodName == ""RefineQuery"")
	{
		return(CancelOperation);			
	}
	switch(MethodName)
	{
		case ""SubmitOrderSTC"":
		    CurrBC.WriteRecord();
		   
			CurrBC.ActivateField(""STC Port In Flag"");
			var MNPOrder = CurrBC.GetFieldValue(""STC Port In Flag"");
			var CurrLogin = appObj.LoginName();
			var foundCSR = appObj.InvokeMethod(""LookupValue"",""STC_MNP_CSR"",CurrLogin); 
			var foundCSRSubstr = foundCSR.substring(0,3);
			if(MNPOrder != ""Yes"")
		{		
			CallSubmitOrderWF();
		}
		else
		{
			if(foundCSRSubstr != ""CSR"")
			{
				appObj.RaiseErrorText(""Sorry!!! MNP Orders can be submitted by special CSRs only"");
			}
			else
			{
			if(CurrBC.GetFieldValue(""STC Order Sub Status"") == ""Raised"" || CurrBC.GetFieldValue(""STC Order Sub Status"") == ""Order Validated"")
				{
					appObj.RaiseErrorText(""Please Submit MNP Request before Submitting Order"");
				}
					else
					{
						CurrBC.ActivateField(""STC MNP Operator"");
					var Donar = CurrBC.GetFieldValue(""STC MNP Operator"");
					if(Donar == """" || Donar == null)
					{
					appObj.RaiseErrorText(""Please select Donar Details for MNP Order"");
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
			
		case ""STCMNPSubmitOrder"":
		    this.BusComp().WriteRecord();
			CallMNPSubmitOrder();
			ireturn = CancelOperation;
			break;
			
			case ""MNPSubmitAutomated"":
		    this.BusComp().WriteRecord();
			CallMNPSubmitOrder();
			ireturn = CancelOperation;
			break;
			
			case ""CorpGPRS"":
		    this.BusComp().WriteRecord();
			CorpGPRS();
			ireturn = CancelOperation;
			break;
	
			
		case ""CancelOrderSTC"":
			ireturn = CancelOperation;
			break;
			
		case ""ApproveOrderSTC"":
			ireturn = CancelOperation;
			break;
			
		case ""RejectOrderSTC"":
			ireturn = CancelOperation;
			break;
			
			
			
	     case ""ValidateOrder"":
	          ValidateSTCOrder();
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
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if ( MethodName == ""TestClick"" )
	{
		CanInvoke = ""TRUE"";
    	return( CancelOperation );
	}
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	if(MethodName == ""TestClick"")
	{
		//Smart Script Player View (eApps)
		TheApplication().InvokeMethod(""RunSmartScript"", ""PPR Partner Program Application"","""",""ENU"",""USD"",""PPR SmartScript Player View"", ""PPR SmartScript Player Applet"");
		return (CancelOperation);
	}
	return (ContinueOperation);
}
"var sOutstanding = 0;
var ServAccId="""";
var sMessage ="""";"
function CheckBroadBforPrepaid()
{
	try
	{
		var appObj = TheApplication();
		var sMigration ="""";
		var sMigrationType="""";
		var sAssetBO;
		var sAssetBC,sAssetBC2;
		var sProdPartNum;
		var sLOVPartNum;
		var vLOVPartNum;
		var vChargeProdPartNum;
		var sSExpr;
		var sSExpr2;
		var vDiffDays;
    	var vCreated ="""";   // Sachin - 6Oct2010
		
		sAssetBO = appObj.ActiveBusObject();
		sAssetBC = sAssetBO.GetBusComp(""Asset Mgmt - Asset"");
		sAssetBC2 = sAssetBO.GetBusComp(""Asset Mgmt - Asset"");
		
		with(sAssetBC)
	   	{
	   		ActivateField(""Service Account Id"");
	 		ActivateField(""Billing Account Id"");
		   	ActivateField(""Product Part Number"");
		   	ActivateField(""Status"");
		   	ActivateField(""Created"");
	        ClearToQuery();
	        SetViewMode(AllView);
	        
	        //-----
	        //sSExpr = ""[Service Account Id] = '"" + ServAccId + ""' AND [Product Part Number] = 'PLANCLUBBB' AND [Status] = 'Active'"";
	     //   sSExpr = ""[Service Account Id] = '"" + ServAccId + ""' AND [Status] = 'Active' AND [Type] = 'Service Plan'""
	        sSExpr = ""[Service Account Id] = '"" + ServAccId + ""' AND [Status] = 'Active' AND [STC Plan Type] = 'Service Plan'""
	        //-----
	        
	        SetSearchExpr(sSExpr);
	        ExecuteQuery(ForwardOnly);	
	                
	        sMigrationType = TheApplication().InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Postpaid To Prepaid""); 
	        
	       	var iRecord = FirstRecord();
	        if(FirstRecord())
			{
				//----------
	        	while(iRecord)
	        	{
	    	    	sProdPartNum = GetFieldValue(""Product Part Number"");
	    	    	vCreated = GetFieldValue(""Created"");
		        	sLOVPartNum = TheApplication().InvokeMethod(""LookupValue"", ""STC_MIGRATION_NOT_ALLOWED"", sProdPartNum);	        
	        		vLOVPartNum = TheApplication().InvokeMethod(""LookupValue"", ""STC_EMP_PLAN"", ""Employee Plan"");
	        		if (sLOVPartNum != """") 
	        		{
	        			sMessage = ""The Migration is not supported for the current plan"";
	        			break;
	        		}
	        		else
	        		{
	        			sMessage = """";
	        		}
	        		
	        		if (vLOVPartNum == sProdPartNum)
	        		{
	        		
	        			// Sachin Below - Date logic
	        			    
								var vDate1=new Date(vCreated);
								var vDate2=vDate1.toSystem();
								
								var sysDate = new Date();
								var vDate3=sysDate.toSystem();
							
								var vDate4 = (vDate3 - vDate2)/86400;
								vDiffDays = TheApplication().InvokeMethod(""LookupValue"", ""STC_EMP_PLAN"", ""Charge Days"");
								var vDateDiff = vDate4.toFixed(0) - vDiffDays;
								
								// TheApplication().RaiseErrorText( vDate1 + ""realdate "" + sysDate + ""Syatem"" + ""Diff "" + vDate4  + ""Number"" + vDateDiff);
	        			
	        			// Sachin Above - Date logic
	        			if (vDateDiff < 0)
	        			{
	        				vChargeProdPartNum = TheApplication().InvokeMethod(""LookupValue"", ""STC_EMP_PLAN"", ""Charge Product"");
	        				with(sAssetBC2)
						   	{
						   		ActivateField(""Service Account Id"");
						 		ActivateField(""Billing Account Id"");
							   	ActivateField(""Product Part Number"");
							   	ActivateField(""Status"");
						        ClearToQuery();
						        SetViewMode(AllView);
						        sSExpr2 = ""[Service Account Id] = '"" + ServAccId + ""' AND [Status] = 'Active' AND [Product Part Number] = '"" + vChargeProdPartNum + ""'"";
						        
						        SetSearchExpr(sSExpr2);
						        ExecuteQuery(ForwardOnly);
						        
						        if(FirstRecord())
								{
									sMessage = """";
								}
								else
								{
									sMessage = ""Employee Migration is not allowed. Please raise modify order selecting the charge product first."";
									break;
								}
						        
						     } // End with(sAssetBC2) Sachin
	        				
	        			} // End if (vDateDiff < 0)
	        		} // End if (vLOVPartNum == sProdPartNum)
	        		
	        		iRecord = NextRecord();
	        	}//End While
		        //----------
			
				//=============
				/*
				this.BusComp().ParentBusComp().ActivateField(""STC Migration Type"");
				sMigration = this.BusComp().ParentBusComp().GetFieldValue(""STC Migration Type"");
				if(sMigration == sMigrationType)
				{ 
					sMessage = ""Broadband Migration to Prepaid Account is not Allowed."";
					//appObj.RaiseErrorText(sMessage);
				}
				else
				{
					sMessage = """";
				}
				*/
				//=============
           	}
		}//End with
	}//End try

	catch(e)
	{
		throw(e);
	}
	
	finally
	{
		sAssetBC = null;
		sAssetBO = null;
		
	}
}
function CheckLastSub()
{
try
{
var MasterId=this.BusComp().GetFieldValue(""Owner Account Id"");
var appObj=TheApplication();
var AccountBO=appObj.GetBusObject(""Account"");
var AccountBC=AccountBO.GetBusComp(""Account"");
var ServiceBO=appObj.GetBusObject(""STC Service Account"");
//var ServiceBC=ServiceBO.GetBusComp(""CUT Service Sub Accounts"");
var ServiceBC = TheApplication().GetBusObject(""STC Thin Service Account BO"").GetBusComp(""STC Thin CUT Service Sub Accounts""); //Anchal: Changed BC because of Query Issue
var iRecord;

var strdate = new Date; 
var strStatusChangeDate = (strdate.getMonth()+1) + ""/"" + strdate.getDate() + ""/"" + strdate.getFullYear() + "" "" + strdate.getHours() + "":"" + strdate.getMinutes() + "":"" + strdate.getSeconds();
with(ServiceBC)  
{ 
SetViewMode(AllView);
ClearToQuery();
var sSExpr = ""[Master Account Id] = '"" + MasterId + ""' AND [STC Pricing Plan Type] = 'Postpaid' AND [Account Status] <> 'Terminated'"";
SetSearchExpr(sSExpr);
ExecuteQuery(ForwardOnly);
var Count=CountRecords();
	if(Count<= ""1"")
	{
		with(AccountBC)
		{
		SetViewMode(AllView);
		ActivateField(""STC Account Created Date"");  
		ClearToQuery();	
	    SetSearchSpec(""Id"",MasterId);
	    ExecuteQuery(ForwardOnly);
	     iRecord = FirstRecord();
		   if(iRecord)
		   {
		   SetFieldValue(""STC Account Created Date"","""");
		   WriteRecord();
		   }
		}//AccountBC
	}
  }
}
catch(e)
{
}
finally
{
AccountBO=null;
ServiceBO=null;
ServiceBC=null;
AccountBC=null;
}
}
function CheckServiceMigrationVal()
{
try
{
	var appObj = TheApplication();
	var sMigration ="""";
	var sMigrationType="""";
	var sAssetBO;
	var sAssetBC,sAssetBC2;
	var sProdPartNum;
	var sLOVPartNum;
	var vLOVPartNum;
	var vChargeProdPartNum;
	var sSExpr;
	var sSExpr2;
	var vDiffDays;
   	var vCreated ="""";   // Sachin - 6Oct2010
	sAssetBO = appObj.ActiveBusObject();
	sAssetBC = sAssetBO.GetBusComp(""Asset Mgmt - Asset"");
	sAssetBC2 = sAssetBO.GetBusComp(""Asset Mgmt - Asset"");
	with(sAssetBC)
   	{
   		ActivateField(""Service Account Id"");
 		ActivateField(""Billing Account Id"");
	   	ActivateField(""Product Part Number"");
	   	ActivateField(""Status"");
	   	ActivateField(""Created"");
        ClearToQuery();
        SetViewMode(AllView);
        //-----
        //sSExpr = ""[Service Account Id] = '"" + ServAccId + ""' AND [Product Part Number] = 'PLANCLUBBB' AND [Status] = 'Active'"";
        //sSExpr = ""[Service Account Id] = '"" + ServAccId + ""' AND [Status] = 'Active' AND [Type] = 'Service Plan'""
        sSExpr = ""[Service Account Id] = '"" + ServAccId + ""' AND [Status] = 'Active' AND [STC Plan Type] = 'Service Plan'""
        //-----
        SetSearchExpr(sSExpr);
        ExecuteQuery(ForwardOnly);	
        sMigrationType = TheApplication().InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Postpaid To Prepaid""); 
       	var iRecord = FirstRecord();
        if(FirstRecord())
		{
			//----------
        	while(iRecord)
        	{
    	    	sProdPartNum = GetFieldValue(""Product Part Number"");
    	    	vCreated = GetFieldValue(""Created"");
	        	sLOVPartNum = TheApplication().InvokeMethod(""LookupValue"", ""STC_MIGRATION_NOT_ALLOWED"", sProdPartNum);	        
        		if (sLOVPartNum != """") 
        		{
        			sMessage = ""The Migration is not supported for the current plan"";
        			break;
        		}
        		else
        		{
        			sMessage = """";
        		}
        		
         		iRecord = NextRecord();
        	}//End While
	}
	}//End with
}
catch(e)
{
	throw(e);
}
finally
{
	sAssetBC = null;
	sAssetBO = null;
}
}
"//PS 10/05/2010 for Migration Order
function CreateAndAutoPopulate()
{
	var psInputs;
	var psOutputs;
	var svcBusSrv;
	var appObj;
	var sPBusComp;
	var sCustAccountId = """";
	var sMigrationType;
	var sMigrationTypeLOV;
	var sParBillingId;
	var sMigrationTypeLOV2;
	var sBillBO;
	var sBillBC;
	var sBillName;
	var sMigrationTypeLOV3;
	var sMigrationTypeLOV4;
	var sMigrationTypeLOV5;
	var sMigrationTypeLOV6;

	var IsNewBillAcc;
	try
	{
		appObj = TheApplication();
		psInputs = appObj.NewPropertySet();
		psOutputs = appObj.NewPropertySet();
		
		sPBusComp = this.BusComp().ParentBusComp();
		sParBillingId = sPBusComp.GetFieldValue(""Parent Account Id"");
			sPBusComp.ActivateField(""STC New BAN Flag"");
		IsNewBillAcc = sPBusComp.GetFieldValue(""STC New BAN Flag"");
		sBillBO = appObj.GetBusObject(""STC Billing Account"");
		sBillBC = sBillBO.GetBusComp(""CUT Invoice Sub Accounts"");
		
		with(sBillBC)
		{
			ActivateField(""Name"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Id"",sParBillingId);
			ExecuteQuery(ForwardOnly);
			
			if(FirstRecord())
			{
				sBillName = GetFieldValue(""Name"");
			}
		}
		
		if (sPBusComp != null)
		{
			sMigrationType = sPBusComp.GetFieldValue(""STC Migration Type"");
			var sMigration = appObj.InvokeMethod(""LookupValue"", ""STC_MIG_BAN_TYPE"", sMigrationType);
			var FoundMigration = sMigration.substring(0,4);
			
			var PrepMigType = appObj.InvokeMethod(""LookupValue"", ""STC_PREPAID_MIG_TYPE"", sMigrationType);
			var PrepMigTypeStr = PrepMigType.substring(0,7);
			
				
			//04/07/2010
			//sCustAccountId = sPBusComp.GetFieldValue(""Master Account Id"");
			
			//========================
			sMigrationTypeLOV = appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Pre Post Under Diff Customer"");
			sMigrationTypeLOV2= appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Post Pre Under Diff Customer"");
			sMigrationTypeLOV3= appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Post Post Under Diff Customer""); 
			sMigrationTypeLOV4= appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Pre Pre Under Diff Customer""); 
			sMigrationTypeLOV5= appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corp Post To Inv Pre""); 
			sMigrationTypeLOV6= appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corp Post To Inv Post""); 
			var sMigrationSMEToSME = appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""SME To SME""); 
			var sMigrationSMEToCORP = appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""SME To Corporate""); 
			var sMigrationCORPToSME = appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corporate To SME""); 
			var sMigrationIndPostToSME = appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Inv Post To SME""); 
			var sMigrationIndPreToSME = appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Inv Pre To SME""); 
			var sMigrationSMEToIndPre = appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""SME To Inv Pre""); 
			var sMigrationSMEToIndPost = appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""SME To Inv Post""); 
			var sMigSMESameCust = appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""SME to SME under same customer""); 
			var sMigCorpSameCust = appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corp to Corp undr same customr""); 
			
			if (sMigrationType == sMigrationTypeLOV || sMigrationType == sMigrationTypeLOV2 || sMigrationType ==sMigrationTypeLOV3 || sMigrationType== sMigrationTypeLOV4 )
			{
				sCustAccountId = sPBusComp.GetFieldValue(""STC Master Account Id"");
			}
		//	else if (sMigrationType ==  appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corp Post To Inv Pre"") || sMigrationType ==  appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corp Post To Inv Post"") || sMigrationType== sMigrationSMEToIndPre || sMigrationType== sMigrationSMEToIndPost)
			else if (sMigrationType ==  appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corp Post To Inv Pre"") || sMigrationType ==  appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corp Post To Inv Post"") || sMigrationType== sMigrationSMEToIndPre || sMigrationType== sMigrationSMEToIndPost || PrepMigTypeStr == ""PREPAID"")
			{
			sCustAccountId = sPBusComp.GetFieldValue(""STC Master Account Id"");
			}
		    else
			{
				sCustAccountId = sPBusComp.GetFieldValue(""Master Account Id"");
			}
			
	//	if(IsNewBillAcc != ""Y"" && (sMigrationType != sMigrationTypeLOV || sMigrationType != sMigrationTypeLOV5 || sMigrationType != sMigrationTypeLOV6 || sMigrationType != sMigrationTypeLOV2 || sMigrationType != sMigrationTypeLOV3 || sMigrationType != sMigrationTypeLOV4))
	//	{		
			
			//=========================
	//	if(sMigrationType == appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Inv Pre To Corp Post"") || sMigrationType == appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Inv Post To Corp Post"") || sMigrationType == appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corporate To Corporate"") || sMigrationType == sMigrationSMEToSME || sMigrationType == sMigrationSMEToCORP || sMigrationType == sMigrationCORPToSME || sMigrationType == sMigrationIndPostToSME || sMigrationType == sMigrationIndPreToSME)
	//	if(sMigrationType == appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Inv Pre To Corp Post"") || sMigrationType == appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Inv Post To Corp Post"") || sMigrationType == appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corporate To Corporate"") || sMigrationType == sMigrationSMEToSME || sMigrationType == sMigrationSMEToCORP || sMigrationType == sMigrationCORPToSME || sMigrationType == sMigrationIndPostToSME || sMigrationType == sMigrationIndPreToSME || sMigrationType == sMigSMESameCust || sMigrationType == sMigCorpSameCust)	
		if(FoundMigration == ""POST"")
		{
			
			with(psInputs)
			{
				sCustAccountId = sPBusComp.GetFieldValue(""STC Department BAN Id"");
				SetProperty(""MigrationType"",sMigrationType);
				SetProperty(""BillName"",sBillName);
				SetProperty(""Object Id"",sCustAccountId);
				SetProperty(""ProcessName"", ""STC Create New Child Billing Account WF"");
			}
			svcBusSrv = appObj.GetService(""Workflow Process Manager"");
			svcBusSrv.InvokeMethod(""RunProcess"",psInputs,psOutputs);
		}
		else if(IsNewBillAcc == ""N"" || IsNewBillAcc == """" || IsNewBillAcc == null)
		{
			with(psInputs)
			{
				SetProperty(""Object Id"",sCustAccountId);
				SetProperty(""OnlyBACreate"",""Y"");
				SetProperty(""OnlyCustCreate"",""N"");
				SetProperty(""MigrationType"",sMigrationType);
				//if (sMigrationType == ""Postpaid To Prepaid"" || sMigrationType == TheApplication().InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corp Post To Inv Pre"") || sMigrationType ==sMigrationTypeLOV2 || sMigrationType == sMigrationTypeLOV4 || sMigrationType == sMigrationSMEToIndPre)
				if(FoundMigration == ""PREP"")
				{
					SetProperty(""PlanType"",""Prepaid"");
				}
				else
				{
					SetProperty(""PlanType"","""");
				}
				SetProperty(""ProcessName"", ""STC Create New Customer"");
			}
			svcBusSrv = appObj.GetService(""Workflow Process Manager"");
			svcBusSrv.InvokeMethod(""RunProcess"",psInputs,psOutputs);
		}
		}
	//}
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
		psInputs = null;
	 	psOutputs = null;
		svcBusSrv = null;
		appObj= null;
	}
}
function GetTerminationCharges()//Suman function created to get Total terminatoin charges before TOO
{
	try
	{
		var appObj = TheApplication();
		var sMsisdn;
		var Input;
		var Output;
		var svcOutPayments;
		var sPlanType;
		var sPBusComp;
		var sOutstanding;
		
		sPBusComp = this.BusComp().ParentBusComp();
		
		if (sPBusComp != null)
		{
			sPBusComp.ActivateField(""STC Pricing Plan Type"");
			sPlanType = sPBusComp.GetFieldValue(""STC Pricing Plan Type"");
			if (sPlanType == ""Postpaid"")
			{
				with (appObj)
				{
					sMsisdn = this.BusComp().GetFieldValue(""Service Account Id"");
		    		Input = NewPropertySet();
		    		Output = NewPropertySet();
		   			svcOutPayments = GetService(""Workflow Process Manager"");
		    		Input.SetProperty(""ProcessName"",""STC Terminated Account Balance CRM WF"");
		   			Input.SetProperty(""Object Id"",sMsisdn);
		    		svcOutPayments.InvokeMethod(""RunProcess"",Input,Output);
		    		sOutstanding = Output.GetProperty(""OutStandAmout"");
		    		var NumsOutstanding = ToNumber(sOutstanding);
		    		if(sOutstanding > 0)
		   			{
		    		RaiseErrorText(""In Order to Proceed further kindly clear Total Termination Charges."");
		   			}
		   		}
			}
		}
	}	   	
	

	
	finally
	{
	}
}
"//PS 10/05/2010 for Migration Order
function OutstandingBalance()
{
	try
	{
		var appObj = TheApplication();
		var sMsisdn;
		var Input;
		var Output;
		var svcOutPayments;
		var sPlanType;
		var sPBusComp;
		var sOutstanding;
		var sCustomerType;
		var sCompanyOutstanding;
		var sSplitBillFlag;
		
		sPBusComp = this.BusComp().ParentBusComp();
		
		if (sPBusComp != null)
		{
			sPBusComp.ActivateField(""Type"");
			sPBusComp.ActivateField(""STC Pricing Plan Type"");//Mayank: Added for Termination Line
			sPBusComp.ActivateField(""STC Split Billing Flag"");
			sPlanType = sPBusComp.GetFieldValue(""STC Pricing Plan Type"");
			sCustomerType = sPBusComp.GetFieldValue(""Type"");//Mayank: Added for Termination Line
			sSplitBillFlag = sPBusComp.GetFieldValue(""STC Split Billing Flag"");
			var sCurrLogin = appObj.LoginName();
			var foundCSR = appObj.InvokeMethod(""LookupValue"",""STC_OUTSTANDING_BYEPASS_USER"",sCurrLogin);
			if (sPlanType == ""Postpaid"")
			{
				with (appObj)
				{
					sMsisdn = this.BusComp().GetFieldValue(""Serial Number"");
		    		Input = NewPropertySet();
		    		Output = NewPropertySet();
		   			svcOutPayments = GetService(""Workflow Process Manager"");
		    		Input.SetProperty(""ProcessName"",""STC OutstandingPayment WF"");
		   			Input.SetProperty(""MSISDN"",sMsisdn);
		    		svcOutPayments.InvokeMethod(""RunProcess"",Input,Output);
		    		sOutstanding = Output.GetProperty(""OutStandingAmt"");
		    		var NumsOutstanding = ToNumber(sOutstanding);
		    		if(sSplitBillFlag == ""Y"")
					{
						Output.Reset();
						Input.SetProperty(""MSISDN"",sMsisdn+'_A');
						svcOutPayments.InvokeMethod(""RunProcess"",Input,Output);
						sCompanyOutstanding = Output.GetProperty(""OutStandingAmt"");
						sOutstanding = ToNumber(sOutstanding) + ToNumber(sCompanyOutstanding);
					}
		    		if(sOutstanding > 0)
   					{//Mayank
		   			if ((sCustomerType == ""SME"" || sCustomerType == ""Corporate"") && sCurrLogin == foundCSR)//Start: Mayank
		   				{
		   				}
		   			else
			   			{
			    		RaiseErrorText(""In Order to Proceed further kindly clear Outstanding Dues."");
			   			}//End: Mayank
    		   		}
		   		}
			}
		}
	}	   	
	

	
	finally
	{
	}
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
   if (MethodName == ""ResumeProdSvc"")// && foundCSRSubstr==""RES"")
	{   
		var appObj= TheApplication();
		var CurrLogin = appObj.LoginName();
		var foundCSR = appObj.InvokeMethod(""LookupValue"",""STC_RESUME_CSR"",CurrLogin); 
		var foundCSRSubstr = foundCSR.substring(0,3);
		var status=this.BusComp().ParentBusComp().GetFieldValue(""Account Status"");
	   if(foundCSRSubstr ==""RES"" && status==""Suspended"")
	   {	   
	    CanInvoke = ""TRUE"";
		return (CancelOperation);	   	
	   }
	   else
		{
			CanInvoke = ""FALSE"";
			return (CancelOperation);
		}
	   	
	  }
	  
	 if(MethodName == ""ServiceMigrationSvc"")
	 {
		CanInvoke = ""FALSE"";
		var appObj= TheApplication();
		this.BusComp().ParentBusComp().ActivateField(""Type"");
		this.BusComp().ParentBusComp().ActivateField(""Account Status"");
		var StrAccntType = this.BusComp().ParentBusComp().GetFieldValue(""Type"");
		var sLOVAccntType = appObj.InvokeMethod(""LookupValue"",""STC_SVCMIG_CUST"",StrAccntType);
		var Status = this.BusComp().ParentBusComp().GetFieldValue(""Account Status""); 
		var sLOVAccntTypeSubStr = sLOVAccntType.substring(0,5);
		if(sLOVAccntTypeSubStr == ""Allow"" && Status == ""Active"")
		{
			this.BusComp().ActivateField(""STC Root Product Part Num"");
			var sMigRootPartNum = this.BusComp().GetFieldValue(""STC Root Product Part Num"");
			var SerMigPackCheck = appObj.InvokeMethod(""LookupValue"",""STC_MIG_PACK"", sMigRootPartNum);
			var serMigPackSubstr = SerMigPackCheck.substring(0,4);
			if(serMigPackSubstr == ""PACK"")
			{
				CanInvoke = ""TRUE"";
			}
			else
			{
				CanInvoke = ""FALSE"";
			}
		}
		else
		{
			CanInvoke = ""FALSE"";
		}
		return (CancelOperation);
	 }
	  
	  
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
var isRecord;
var sAllowSR=""Y"";
var SRStatus;
var SRType;
var appObj = TheApplication();
var sMsisdn;
var Input;
var Output;
var sBillingId;
var svcOutPayment;
var sOutstanding;
var sAssetId;
var sServiceId;
var sAllowSR;
var boRMSNumberEnquiry;
var bcRMSNumberEnquiry;
var bRecordExists;
var bMSISDN;
try{

/*
	if(MethodName == ""ModifyProdSvc"" || MethodName == ""DisconnectProdSvc"" || MethodName == ""SuspendProdSvc"" || MethodName == ""ResumeProdSvc"" || MethodName == ""TempSuspendSvc"" || MethodName ==""MigrationProdSvc"")
	{	
		ServAccId = this.BusComp().GetFieldValue(""Service Account Id"");
		var sServiceBO = TheApplication().GetBusObject(""Service Request"");
		var sServiceBC = sServiceBO.GetBusComp(""Service Request"");
		with(sServiceBC)
		{
	  		ActivateField(""Account Id"");
		    ActivateField(""Status"");
		    ActivateField(""INS Sub-Area"");
	    	ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Account Id"", ServAccId);
			ExecuteQuery(ForwardOnly);

	        var sClosed = TheApplication().InvokeMethod(""LookupValue"", ""SR_STATUS"", ""Closed""); 
			if(FirstRecord())
			{
				isRecord = FirstRecord();
			    while(isRecord)
			    {	
					SRStatus = GetFieldValue(""Status"");
					SRType = GetFieldValue(""INS Sub-Area"");
					if(SRStatus != sClosed && (SRType == ""Change MSISDN"" || SRType == ""Change SIM Card""))
						sAllowSR=""N"";
					isRecord = NextRecord();
				}//while
			}//if
		}//with	
		if(sAllowSR == ""N"")
			TheApplication().RaiseErrorText(""There is currently an Open SR to change the MSISDN or SIM card. Can't proceed with this request."");
	}
	
	if(MethodName == ""DisconnectProdSvc"")
	{
	
	    sServiceId = this.BusComp().GetFieldValue(""Service Account Id"");
	    sBillingId = this.BusComp().GetFieldValue(""Billing Account Id"");
       	sAssetId = this.BusComp().GetFieldValue(""Id"");
       	var sSubBO = TheApplication().GetBusObject(""STC Service Account"");
	   	var sServiceAssetBC = sSubBO.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
       	
	    with(sServiceAssetBC)
	    {
	      ActivateField(""Service Account Id"");
	      ActivateField(""Product Part Number"");
	      ClearToQuery();
	      SetViewMode(AllView);
	      SetSearchExpr(""[Service Account Id] = '"" + sServiceId + ""' AND [Product Part Number] = 'PLANCLUBBB'""); 
	      ExecuteQuery(ForwardOnly);
	      
	      if(FirstRecord())
	      {
	         
	     	var sBillingBO = TheApplication().GetBusObject(""STC Billing Account"");
	    	var sAssetBC = sBillingBO.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
	      
	 	   with (sAssetBC)
	       {
		   	 ActivateField(""Billing Account Id"");
		   	 ActivateField(""Product Part Number"");
		   	 ActivateField(""Status"");
	         ClearToQuery();
	         SetViewMode(AllView);
	         SetSearchExpr(""[Billing Account Id] = '"" + sBillingId + ""' AND [Product Part Number] = 'PLANCLUB' AND [Status] = 'Active'"");
	         ExecuteQuery(ForwardOnly);
	         
	          if(FirstRecord())
	          {
	        	TheApplication().RaiseErrorText(""Please disconnect VIVA Voice Plan First"");
	          }
	        }
	    	}
	     }	
	}            
	          
	         
	if(MethodName == ""MigrationProdSvc"")
	{
		appObj = TheApplication();
		
		
		CheckBroadBforPrepaid();
		if (sMessage != """")
		{
			appObj.RaiseErrorText(sMessage);
		}
		
		OutstandingBalance();
   		if(sOutstanding > 0)
   		{
    		appObj.RaiseErrorText(""In Order to Proceed further kindly clear Outstanding Dues."");
   		}	   		

		//var sServiceType = this.BusComp().ParentBusComp().GetFieldValue(""STC Pricing Plan Type"");
  		CreateAndAutoPopulate();
	}


	if(MethodName == ""TempSuspendSvc"")
	{
		appObj = TheApplication();
		OutstandingBalance();
			    	
	   		if(sOutstanding > 0)
	   		{
	    		appObj.RaiseErrorText(""In Order to Proceed further kindly clear Outstanding Dues."");
	   		}
	}
	
*/

//[Soumyadeep][No Suspension,Modify or migration for Virtual MSISDN][10-10-2012]
	if(MethodName == ""ResumeProdSvc"" || MethodName == ""SuspendProdSvc"" || MethodName == ""TempSuspendSvc"" || MethodName == ""MigrationProdSvc"" || MethodName == ""ModifyProdSvc"" || MethodName == ""ServiceMigrationSvc"")
	{
		boRMSNumberEnquiry = TheApplication().GetBusObject(""RMS NM Number Enquiry"");
		bcRMSNumberEnquiry = boRMSNumberEnquiry.GetBusComp(""RMS NM Number Enquiry"");
		this.BusComp().ActivateField(""Serial Number"");
		bMSISDN = this.BusComp().GetFieldValue(""Serial Number"");
		if(bMSISDN != """" && bMSISDN != null && bMSISDN != '')
		{ 
		with (bcRMSNumberEnquiry)
		{				
			ActivateField(""Special Category Type"");
			ActivateField(""Type"");
			ActivateField(""Number String"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Special Category Type"", ""Bulk Message"");               
			SetSearchSpec(""Number String"", bMSISDN);
			SetSearchSpec(""Type"", ""MSISDN"");
			ExecuteQuery(ForwardOnly);   
			bRecordExists = FirstRecord();
			if (bRecordExists)
			{
				appObj.RaiseErrorText(""For virtual MSISDN this is not allowed."");
			}
		}
		}
	}
//[Soumyadeep][No Suspension,Modify or migration for Virtual MSISDN][10-10-2012]

	switch(MethodName)
	{
 		case ""ModifyProdSvc"":
 		case ""SuspendProdSvc"":
 		case ""ResumeProdSvc"":
 		case ""TempSuspendSvc"":
 		case ""MigrationProdSvc"":
 		case ""ServiceMigrationSvc"":
 		case ""DisconnectProdSvc"":
 		{ 		 		 	
 			ServAccId = this.BusComp().GetFieldValue(""Service Account Id"");
			var sServiceBO = TheApplication().GetBusObject(""Service Request"");
			var sServiceBC = sServiceBO.GetBusComp(""Service Request"");
		    var AppPropSet = TheApplication().NewPropertySet();
			with(sServiceBC)
			{
		  		ActivateField(""Account Id"");
			    ActivateField(""Status"");
			    ActivateField(""INS Sub-Area"");
		    	ClearToQuery();
				SetViewMode(AllView);
				SetSearchSpec(""Account Id"", ServAccId);
				ExecuteQuery(ForwardOnly);
	
		        var sClosed = TheApplication().InvokeMethod(""LookupValue"", ""SR_STATUS"", ""Closed""); 
				if(FirstRecord())
				{
					isRecord = FirstRecord();
				    while(isRecord)
				    {	
						SRStatus = GetFieldValue(""Status"");
						SRType = GetFieldValue(""INS Sub-Area"");
						if(SRStatus != sClosed && (SRType == ""Change MSISDN"" || SRType == ""Change SIM Card""))
							sAllowSR=""N"";
						isRecord = NextRecord();
					}//while
				}//if
			}//with	
			if(sAllowSR == ""N"")
			{
				TheApplication().RaiseErrorText(""There is currently an Open SR to change the MSISDN or SIM card. Can't proceed with this request."");
			}	
		}	
			
		if(MethodName == ""DisconnectProdSvc"")
		{
		    
		    this.BusComp().ParentBusComp().ActivateField(""STC Profile Type"");//[CP][13-08-2012][Datacom SIT Issue_40]
		    var strProfile = this.BusComp().ParentBusComp().GetFieldValue(""STC Profile Type"");//[CP][13-08-2012][Datacom SIT Issue_40]
		    sServiceId = this.BusComp().GetFieldValue(""Service Account Id"");
	    	sBillingId = this.BusComp().GetFieldValue(""Billing Account Id"");
       		sAssetId = this.BusComp().GetFieldValue(""Id"");
       		var sSubBO = TheApplication().GetBusObject(""STC Service Account"");
	   		var sServiceAssetBC = sSubBO.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
       	
	    	with(sServiceAssetBC)
	    	{
	      		ActivateField(""Service Account Id"");
	      		ActivateField(""Product Part Number"");
	      		ClearToQuery();
	      		SetViewMode(AllView);
	      		SetSearchExpr(""[Service Account Id] = '"" + sServiceId + ""' AND [Product Part Number] = 'PLANCLUBBB'""); 
	      		ExecuteQuery(ForwardOnly);
	      
	      		if(FirstRecord())
	      		{
	     			var sBillingBO = TheApplication().GetBusObject(""STC Billing Account"");
	    			var sAssetBC = sBillingBO.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
	      
	 	   			with (sAssetBC)
	       			{
	       				ActivateField(""Billing Account Id"");
					   	ActivateField(""Product Part Number"");
					   	ActivateField(""Status"");
				        ClearToQuery();
				        SetViewMode(AllView);
				        SetSearchExpr(""[Billing Account Id] = '"" + sBillingId + ""' AND [Product Part Number] = 'PLANCLUB' AND [Status] = 'Active'"");
				        ExecuteQuery(ForwardOnly);
	         
				        if(FirstRecord())
	        				{
								TheApplication().RaiseErrorText(""Please disconnect VIVA Voice Plan First"");
	          				}
	        		}//end with
	    		}
	     	}//end with	
	     	
		   this.BusComp().ParentBusComp().GetFieldValue(""STC Port Out Flag"");
		   var PortOut = this.BusComp().ParentBusComp().GetFieldValue(""STC Port Out Flag"");
		   if(PortOut == ""Y"")
		   {
				var CurrLogin = appObj.LoginName();
				var foundCSR = appObj.InvokeMethod(""LookupValue"",""STC_MNP_CSR"",CurrLogin); 
				var foundCSRSubstr = foundCSR.substring(0,3);
					if(foundCSRSubstr != ""CSR"")
					{
						TheApplication().RaiseErrorText(""Sorry!!! MNP Port Out Orders can be raised by special CSRs only"");
					}
			
		   }
		    else
		    {
		    	if(strProfile != ""Datacom"")//[CP][13-08-2012][Datacom SIT Issue_40]
			    {
			    OutstandingBalance();		    
			    }
		    }	 
	     //  CheckLastSub();SumanK Moving code to completion of Migration and Termiantion order
	    
	     
		}    
		//MANUJ Added for SIP Validation        
	     if(MethodName == ""SuspendProdSvc"" || MethodName == ""TempSuspendSvc"" || MethodName == ""MigrationProdSvc"" || MethodName == ""ServiceMigrationSvc"")
		{
		
		    this.BusComp().ParentBusComp().ActivateField(""STC Profile Type"");//[CP][13-08-2012][Datacom SIT Issue_40]
		    var strProfile = this.BusComp().ParentBusComp().GetFieldValue(""STC Profile Type"");//[CP][13-08-2012][Datacom SIT Issue_40]
		    sServiceId = this.BusComp().GetFieldValue(""Service Account Id"");
       		sAssetId = this.BusComp().GetFieldValue(""Id"");
       		var sSubBO = TheApplication().GetBusObject(""STC Service Account"");
	   		var sServiceAssetBC = sSubBO.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");       	
	    	with(sServiceAssetBC)
	    	{
	      		ActivateField(""Service Account Id"");
	      		ActivateField(""Product Part Number"");
	      		ClearToQuery();
	      		SetViewMode(AllView);
	      		SetSearchExpr(""[Service Account Id] = '"" + sServiceId + ""' AND [Product Part Number] LIKE 'VIVAIPTRUNK*'""); //check under SAN
	      		ExecuteQuery(ForwardOnly);	      
	      		if(FirstRecord())
	      		{
	     		TheApplication().RaiseErrorText(""The request cannot be completed when IP plans are active."");
	    		}
	     	}//end with	
			
			}
	         
		if(MethodName == ""MigrationProdSvc"")
		{
			appObj = TheApplication();	
			this.BusComp().ParentBusComp().ActivateField(""STC Migration Type"");
			var MigType = this.BusComp().ParentBusComp().GetFieldValue(""STC Migration Type"");
			var PostToPostMigrationType = appObj.InvokeMethod(""LookupValue"",""STC_EXC_AON_MIGRATION"",MigType); //Anchal
			var MigTypeAllowed = appObj.InvokeMethod(""LookupValue"",""STC_MIG_VAL_ALL"",MigType);	
			var FoundMigType = MigTypeAllowed.substring(0,3);

			var ChkChaType = appObj.InvokeMethod(""LookupValue"",""STC_MIG_TOO_TERMI"",MigType);
			var ChkTOOTYPE = ChkChaType.substring(0,7);

			if(FoundMigType == ""MIG"")
			{
			var MigLov = appObj.InvokeMethod(""LookupValue"",""STC_VALIDATION"",""MigrationOrders"");	
		    var ValidationReqd = appObj.InvokeMethod(""LookupValue"",""STC_VALIDATION"",""MigrationOrders"");	
			if(ValidationReqd == ""YesMig"")
			{
					var currLoginId = appObj.LoginName();
					var FoundCSR = appObj.InvokeMethod(""LookupValue"",""STC_MIG_VALID_CSR"",currLoginId);
					var foundCSRSubstr = FoundCSR.substring(0,3);
					if(foundCSRSubstr != ""CSR"")
					{
						appObj.RaiseErrorText(""Sorry! Migration Orders Can be raised by Special CSRs Only."");
					}
					else
					{
							CheckBroadBforPrepaid();
							if (sMessage != """")
							{
							appObj.RaiseErrorText(sMessage);
							}
							
					if(ChkTOOTYPE == ""MIGTERM"")
					{
						GetTerminationCharges();
					}
					else
					{	
						OutstandingBalance();
					}
						//	CheckLastSub();SumanK Moving code to completion of Migration and Termiantion order
							//var sServiceType = this.BusComp().ParentBusComp().GetFieldValue(""STC Pricing Plan Type"");
							CreateAndAutoPopulate();
					}	
			}// end of if(ValidationReqd)
			}// end of MIG
			else 
			{		
			CheckBroadBforPrepaid();
			if (sMessage != """")
			{
				appObj.RaiseErrorText(sMessage);
			}
		
				if(ChkTOOTYPE == ""MIGTERM"")
				{
					GetTerminationCharges();
				}
				else
				{	
					OutstandingBalance();
				}
   			
			//var sServiceType = this.BusComp().ParentBusComp().GetFieldValue(""STC Pricing Plan Type"");
		//	if((PostToPostMigrationType == """") && (MigType != PostToPostMigrationType))
		//	{
  			//	CheckLastSub(); //Updated code as per AON Nullification in case of Post To Post : SumanK Moving code to completion of Migration and Termiantion order
  		//	}
  			CreateAndAutoPopulate();
  			}// end of else
		}
		
		if(MethodName == ""ServiceMigrationSvc"")
		{
			fnServiceMigrationSvc();
		}

         //Praveen Perala Comented For Temparory Suspension //
		/*if(MethodName == ""TempSuspendSvc"")
		{
			appObj = TheApplication();
			OutstandingBalance();
			    	
	   		if(sOutstanding > 0)
	   		{
	    		appObj.RaiseErrorText(""In Order to Proceed further kindly clear Outstanding Dues."");
	   		}
		}*/
		//Praveen Perala Comented For Temparory Suspension //
		break; 
	}//end switch


	
	return (ContinueOperation);
}

catch(e)
{
	throw(e);	
}

finally
{
	sServiceBC = null;
	sServiceBO = null;	
	svcOutPayment = null;
	appObj 	   = null;
}	






























}
function fnServiceMigrationSvc()
{
try
{
var appObj = TheApplication();	

var ValidationReqd = appObj.InvokeMethod(""LookupValue"",""STC_VALIDATION"",""MigrationSvcOrders"");
if(ValidationReqd == ""YesSvcMig"")
{
var currLoginId = appObj.LoginName();
var FoundCSR = appObj.InvokeMethod(""LookupValue"",""STC_MIG_VALID_CSR"",currLoginId);
var foundCSRSubstr = FoundCSR.substring(0,3);
	if(foundCSRSubstr != ""CSR"")
	{
	appObj.RaiseErrorText(""Sorry! Migration Orders Can be raised by Special CSRs Only."");
	}
}
		else
		{
				CheckServiceMigrationVal();
				if (sMessage != """")
				{
				appObj.RaiseErrorText(sMessage);
				}
		
						GetTerminationCharges();
		
		}


}
catch(e)
{
throw(e);
}
finally
{

}
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
/*    if (MethodName == ""SetEDQueryMode"" || MethodName == ""EDQueryShowAll"" || MethodName == ""EDQueryShowActive"") 

{ 
       CanInvoke = ""TRUE""; 

        return(CancelOperation)

} */
 return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if(MethodName==""Goto Attachment View"")
	{
		CanInvoke = ""TRUE"";
		return (CancelOperation);
	}
	
	else if(MethodName==""GotoRegisterView"")
	{
		var ApplPostn = TheApplication().GetProfileAttr(""Position"");
		var PstnName = TheApplication().InvokeMethod(""LookupValue"",""STC_PRM_PRTNR_APPROVER"",""PRM Partner Manager"");	
		if(ApplPostn==PstnName)
		{	
			CanInvoke = ""TRUE"";
			return (CancelOperation);
		}
		else
		{
			CanInvoke = ""FALSE"";
			return(CancelOperation);
		}
	}	
	
/*	else if(MethodName==""GotoRegisterView"")
	{
		var id = this.BusComp().GetFieldValue(""Id"");
		var BO = TheApplication().GetBusObject(""STC Channel Partner"");
		var BC = BO.GetBusComp(""PPR Partner Program Application Attachment"");
		BC.ActivateField(""Application Id"");
		BC.SetViewMode(AllView);
		BC.ClearToQuery();
		BC.SetSearchExpr(""Application Id"", id);
		BC.ExecuteQuery(ForwardOnly);
		var FRec = BC.FirstRecord();
		if(!FRec)
		{
			CanInvoke = ""FALSE"";
			return (CancelOperation);
		}
		else
		{
			CanInvoke = ""TRUE"";
			return (CancelOperation);
		}
	}
	
	else */			
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	if(MethodName==""Goto Attachment View"")
	{
	/*	this.BusComp().WriteRecord();
		TheApplication().GotoView(""STC Partner Attachment View"", ""STC Channel Partner""); */
		var Id = this.BusComp().GetFieldValue(""Id"");
		TheApplication().SetProfileAttr(""RecId"",Id);
		
		var svc = TheApplication().GetService(""FINS Teller UI Navigation""); 
 		var Input = TheApplication().NewPropertySet(); 
 		var Output = TheApplication().NewPropertySet(); 
 		//Input.SetProperty(""Row Id"", Id); 
 		Input.SetProperty(""ViewName"", ""STC Partner Attachment View"");  
		Input.SetProperty(""BusObj"", ""STC Channel Partner"");
		svc.InvokeMethod(""GotoView"", Input, Output);
		return(CancelOperation);
	}
	
	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
/*	if(MethodName==""SyncERP"")
			{
				var vStatus = this.BusComp().GetFieldValue(""Account Status"");
				if(vStatus==""New"")
				{
					CanInvoke = ""TRUE"";
					return(CancelOperation);
				}
				else
				{
					CanInvoke = ""FALSE"";
					return(CancelOperation);
				}
			}	*/
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	/*if(MethodName ==""SendMail"")
	{
		 var rowId = this.BusComp().GetFieldValue(""Id"");
		 var svc = TheApplication().GetService(""Workflow Process Manager"");
		 var Input = TheApplication().NewPropertySet();
		 var Output = TheApplication().NewPropertySet();
		 Input.SetProperty(""ProcessName"", ""STC Send Partner Notification Mail using template"");
		 Input.SetProperty(""Object Id"", rowId);
		 svc.InvokeMethod(""RunProcess"", Input, Output);
     }
	else */
	if(MethodName ==""SyncERP"")
	{
		 var Id = this.BusComp().GetFieldValue(""Id"");
		 var svc1 = TheApplication().GetService(""Workflow Process Manager"");
		 var psInput = TheApplication().NewPropertySet();
		 var psOutput = TheApplication().NewPropertySet();
		 psInput.SetProperty(""ProcessName"", ""STC PRM ERP Notfn Upd"");
		 psInput.SetProperty(""Object Id"", Id);
		 svc1.InvokeMethod(""RunProcess"", psInput, psOutput);
		 return(CancelOperation);
     }
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	if(MethodName == ""ShowPopup"") {
		this.BusComp().WriteRecord();
		this.BusComp().InvokeMethod(""RefreshRecord"");
		//this.BusComp().ExecuteQuery(ForwardOnly);
	} else
		return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	if(MethodName == ""ShowPopup"") {
		this.BusComp().WriteRecord();
		this.BusComp().InvokeMethod(""RefreshRecord"");
		//this.BusComp().ExecuteQuery(ForwardOnly);
	} else
		return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	if(MethodName == ""ShowPopup"") {
		this.BusComp().WriteRecord();
		this.BusComp().InvokeMethod(""RefreshRecord"");
		//this.BusComp().ExecuteQuery(ForwardOnly);
	} else
		return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if (MethodName == ""NewRecord"")
	{
		var custType, allowedPaymentLogin,sLoginName;
		
		try
		{
			custType = """";
			sLoginName = TheApplication().LoginName();
			allowedPaymentLogin = TheApplication().InvokeMethod(""LookupValue"",""STC_POS_ORDER_ADMIN"",sLoginName);
			
			if (this.BusComp().ParentBusComp() == null)
				return (CancelOperation);
			else
				custType = this.BusComp().ParentBusComp().GetFieldValue(""STC Customer Type"");
						
			if (custType == ""Corporate"")
				CanInvoke = ""true"";
			else
			{	if (allowedPaymentLogin != """")
					CanInvoke = ""true"";
				else 
					CanInvoke = "false"";
			}
			return (CancelOperation);
		}
		catch(e)
		{
			throw(e);
		}
		finally
		{
		}
	}
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{

	var appobj = TheApplication();
	var PSInputs  = appobj.NewPropertySet();
	var PSOutputs  = appobj.NewPropertySet();
	var OrderId;
	var STCWorkflowProc;  		
	try
	{
		if(MethodName == ""NewRecord"")
		{
		this.BusComp().ParentBusComp().ActivateField(""Id"");
		OrderId = this.BusComp().ParentBusComp().GetFieldValue(""Id"");
		var AdvPay=this.BusComp().ParentBusComp().GetFieldValue(""STC Advance Installments"");
		var Category=this.BusComp().ParentBusComp().GetFieldValue(""STC Contract Category"");  
        STCWorkflowProc = appobj.GetService(""Workflow Process Manager"");
	/*	PSInputs.SetProperty(""Object Id"",OrderId);
		PSInputs.SetProperty(""ProcessName"",""STC BMS Payment Validation WF"");
	    STCWorkflowProc.InvokeMethod(""RunProcess"", PSInputs, PSOutputs);
		    //if(Category!="""")
		   // {*/
		    PSInputs.SetProperty(""Object Id"",OrderId);
			PSInputs.SetProperty(""ProcessName"",""STC Payment Create WF"");
		    STCWorkflowProc.InvokeMethod(""RunProcess"", PSInputs, PSOutputs);
		    this.InvokeMethod(""RefreshBusComp"");
			this.InvokeMethod(""RefreshRecord""); 
		    return (CancelOperation);
		}	//if(MethodName == ""NewRecord"")	*/		
	}
	catch(e)
	{
		throw(e)
	}
	finally
	{
		PSOutputs = null;
		PSInputs = null;
		STCWorkflowProc = null;
	}
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{

	var appobj = TheApplication();
	var PSInputs  = appobj.NewPropertySet();
	var PSOutputs  = appobj.NewPropertySet();
	var OrderId;
	var STCWorkflowProc;  		
	try
	{
		if(MethodName == ""NewRecord"")
		{
		this.BusComp().ParentBusComp().ActivateField(""Id"");
		OrderId = this.BusComp().ParentBusComp().GetFieldValue(""Id"");
		var AdvPay=this.BusComp().ParentBusComp().GetFieldValue(""STC Advance Installments"");
		var Category=this.BusComp().ParentBusComp().GetFieldValue(""STC Contract Category"");  
        STCWorkflowProc = appobj.GetService(""Workflow Process Manager"");
		PSInputs.SetProperty(""Object Id"",OrderId);
		PSInputs.SetProperty(""ProcessName"",""STC BMS Payment Validation WF"");
	    STCWorkflowProc.InvokeMethod(""RunProcess"", PSInputs, PSOutputs);
		    //if(Category!="""")
		   // {
		    PSInputs.SetProperty(""Object Id"",OrderId);
			PSInputs.SetProperty(""ProcessName"",""STC Payment Create WF"");
		    STCWorkflowProc.InvokeMethod(""RunProcess"", PSInputs, PSOutputs);
		    this.InvokeMethod(""RefreshBusComp"");
			this.InvokeMethod(""RefreshRecord""); 
		    return (CancelOperation);
		}	//if(MethodName == ""NewRecord"")	*/		
	}
	catch(e)
	{
	//	throw(e)
	}
	finally
	{
		PSOutputs = null;
		PSInputs = null;
		STCWorkflowProc = null;
	}
	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{  
	return (ContinueOperation);
}
function STCLoadProducts()
{
	try
	{
		// 30/9/2014 Anchal: Created as per SD_Retail Provisioning Flow Enhancements
		var vApp: Application = TheApplication();
		var vView = vApp.GetProfileAttr(""ActiveViewName"");
		var vUser = vApp.GetProfileAttr(""Login Name"");
		var vUserLogin = vApp.InvokeMethod(""LookupValue"",""STC_PRD_USR_LST"",vUser); // To check login users for hiding new packages
		if(vView == ""Order Entry - Line Items View (Sales)"" || vView == ""Order Entry - Line Items Detail View (Sales)"")
		{
			var vBC: BusComp = this.BusComp();
			with(vBC)
			{
				SetViewMode(AllView);
				var searchspec = """";
				var vAccountType = TheApplication().GetProfileAttr(""STCMasterAccountType"");
				var strCPSFlag = TheApplication().GetProfileAttr(""STCCPSFlag"");
				ClearToQuery();
				if(strCPSFlag == ""Y"")
				{
					searchspec = ""[Part #] LIKE 'VIVACPSPKG*'"";
				}
				else
				{
					if(vUserLogin == vUser)
					{
						if(vAccountType == ""Individual"")
						searchspec = ""([Product Account Usage Type] = '"" + vAccountType + ""' OR [Product Account Usage Type] = 'All') AND [STC Exclude For] <> 'Production'"";
						if(vAccountType == ""SME"")
						searchspec = ""([Product Account Usage Type] = '"" + vAccountType + ""' OR [Product Account Usage Type] = 'All' OR [Product Account Usage Type] = 'Enterprise')  AND [STC Exclude For] <> 'Production'"";
						if(vAccountType == ""Corporate"")
						searchspec = ""([Product Account Usage Type] = '"" + vAccountType + ""' OR [Product Account Usage Type] = 'Enterprise' OR [Product Account Usage Type] = 'All')  AND [STC Exclude For] <> 'Production'"";				
					}
					else
					{
						if(vAccountType == ""Individual"")
						searchspec = ""[Product Account Usage Type] = '"" + vAccountType + ""' OR [Product Account Usage Type] = 'All'"";
						if(vAccountType == ""SME"")
						searchspec = ""[Product Account Usage Type] = '"" + vAccountType + ""' OR [Product Account Usage Type] = 'All' OR [Product Account Usage Type] = 'Enterprise'"";
						if(vAccountType == ""Corporate"")
						searchspec = ""[Product Account Usage Type] = '"" + vAccountType + ""' OR [Product Account Usage Type] = 'Enterprise' OR [Product Account Usage Type] = 'All'"";
					}
				}			
				SetSearchExpr(searchspec);
				ExecuteQuery(ForwardBackward);
			}
		}
	}
	finally
	{
		vBC = null;
	}
}
function WebApplet_Load ()
{
		STCLoadProducts(); // 30/9/2014 Anchal: Created as per SD_Retail Provisioning Flow Enhancements
}
function WebApplet_PreInvokeMethod (MethodName)
{
	if(MethodName == ""ExecuteQuery"")
	{
		// 30/9/2014 Anchal: Created as per SD_Retail Provisioning Flow Enhancements
		STCLoadProducts();
	}
	return (ContinueOperation);
}
function WebApplet_InvokeMethod (MethodName)
{

	  //  if this is a copy process, for a line item,
	  //  we need to invoke the Oracle copy business Service
	  //  which will make the call to copy the corresponding
	  //  configuration in Oracle and then update the lines
	  //  in Siebel with the Configuration Header and Rev Number
  
	 if (MethodName == ""CopyRecord"") 
	 {
		  try 
		  {
				var busObj = this.BusObject();
				var busComp = this.BusComp();
				var sourceConfigHeader =  busComp.GetFieldValue(""External Configurator Reference 1"");
				var sourceConfigRevNbr = busComp.GetFieldValue(""External Configurator Reference 2"");
				var quoteId = busComp.GetFieldValue(""Quote Id"");
				var prodId = busComp.GetFieldValue(""Root Product Id"");
				var rootQuoteItemId = busComp.GetFieldValue(""Root Quote Item Id"");
			
     			var isOCPi = TheApplication().NewPropertySet();
	      		var isOCPo = TheApplication().NewPropertySet();
  	   			var bOracleProduct;
 											
				var productId = busComp.GetFieldValue(""Product Id"");
				
				//isOCPi.SetProperty(""BusCompName"",busComp.Name())
				isOCPi.SetProperty(""ProductId"",productId);
					
				var isOCPSvc = TheApplication().GetService(""CZSessionManagement"");
				isOCPSvc.InvokeMethod(""IsOracleConfigurableProduct"", isOCPi, isOCPo);
		
				bOracleProduct = isOCPo.GetProperty(""IsOracleProduct"");

				if (bOracleProduct == ""true"")
				{
					try
					{
						var indata1 =TheApplication().NewPropertySet ();
						var outdata1 = TheApplication().NewPropertySet ();
						indata1.SetProperty (""RootItemId"", rootQuoteItemId);
						indata1.SetProperty (""QuoteorOrderorAgreementId"", quoteId);
						indata1.SetProperty(""SourceConfigHeader"",sourceConfigHeader);
						indata1.SetProperty(""SourceConfigRevNbr"",sourceConfigRevNbr);
						indata1.SetProperty(""BusinessObject"",""Quote"");
						indata1.SetProperty(""BusinessComponent"",""Quote Item"");
						
						
						var svc1 = TheApplication().GetService(""CZIntegCopyConfigService"");
						svc1.InvokeMethod(""CopyOracleConfiguration"", indata1, outdata1);
						
						var destConfigRevNbr = outdata1.GetProperty(""DestConfigRevNbr"");
						var destConfigHeader = outdata1.GetProperty(""DestConfigHeader"");
						
					}
					catch  (e) 
					{
						TheApplication().Trace(e.toString());
						var error = e.toString();
						TheApplication().RaiseErrorText(e.toString());
						throw e;
					}
					finally
					{
	 				  //for the root item
						busComp.SetFieldValue(""External Configurator Reference 1"",destConfigHeader);
						busComp.SetFieldValue(""External Configurator Reference 2"",destConfigRevNbr );
	
					  destConfigRevNbr = null;
					  destConfigHeader = null;
						indata1 = null;
						svc1 = null;
					}
				} //  end if (bOracleProduct)
			}
			catch  (e) 
			{
				TheApplication().RaiseErrorText(e.toString());
				TheApplication().Trace(e.toString());
				var error = e.toString();
				throw e;
			}
			finally 
			{
				if (busObj != null) { busObj = null;}
				if (busComp != null) {busComp = null;}
				
				sourceConfigHeader =  null;
				sourceConfigRevNbr = null;
				quoteId = null;
				prodId = null;
				rootQuoteItemId = null;
				bOracleProduct = null;
				isOCPi = null;
				isOCPo = null;
				isOCPSvc = null;
		}
	} // end if (MethodName == ""CopyRecord"")


}
function WebApplet_InvokeMethod (MethodName)
{
	 if (MethodName == ""CopyRecord"") 
	 {
	 		syncFavoriteLineswithOracle();
	 }
}
function syncFavoriteLineswithOracle()
{

		var prodId = new Array ;
		var rootQuoteItemId = new Array;
		var sourceQuoteId = new Array;
		var sourceConfigHeader = new Array;
		var sourceConfigRevNbr = new Array;

		var svc1;
		var bOracleProduct;
  
		var sourceConfigHeader;
		var sourceConfigRevNbr
	
    	var bo = this.BusObject();
		var hdrBusComp = this.BusComp();
		var destQuoteId = hdrBusComp.GetFieldValue(""Id"");

		
		var bc = bo.GetBusComp(""Template Item"");

		bc.ActivateField(""External Configurator Reference 1"");
		bc.ActivateField(""External Configurator Reference 2"");
	 	bc.ActivateField(""External Configurator Reference 3"");

    //get the source configuration information
		try 
		{
			bc.ClearToQuery();
			
			var bcSearchStr = ""[Quote Id] ='"" 
			/*bcSearchStr = bcSearchStr + 
			              searchSpec.substring(searchSpec.indexOf(""'"") +1,
			                     	               searchSpec.lastIndexOf(""'""))*/
			bcSearchStr = bcSearchStr + destQuoteId 	                             	               
			bcSearchStr = bcSearchStr + ""'"";                             	               
			bcSearchStr = bcSearchStr + "" AND "" ;
			bcSearchStr = bcSearchStr + ""[Id]=[Root Quote Item Id]""; //to check only for root items
			bc.SetSearchExpr(bcSearchStr);
			bc.ExecuteQuery();
			
			var countRecs = bc.CountRecords();
			var i = 0;
			var isOCPi = TheApplication().NewPropertySet();
			var isOCPo = TheApplication().NewPropertySet();
			var bOracleProduct ;

			
			if (bc.FirstRecord())
			{
				do 
				{
					var productId = bc.GetFieldValue(""Product Id"");
				
					//isOCPi.SetProperty(""BusCompName"",""Template Item"")
					isOCPi.SetProperty(""ProductId"",productId);
					
					var isOCPSvc = TheApplication().GetService(""CZSessionManagement"");
					isOCPSvc.InvokeMethod(""IsOracleConfigurableProduct"", isOCPi, isOCPo);
		
					bOracleProduct = isOCPo.GetProperty(""IsOracleProduct"");

					if (bOracleProduct == ""true"")
					{					
						prodId[i] = bc.GetFieldValue(""Root Product Id"");
						rootQuoteItemId[i] = bc.GetFieldValue(""Root Quote Item Id"");
						sourceQuoteId[i] = bc.GetFieldValue(""Quote Id"")
						sourceConfigHeader[i] =  bc.GetFieldValue(""External Configurator Reference 1"");
						sourceConfigRevNbr[i] = bc.GetFieldValue(""External Configurator Reference 2"");
						i++;
					}
				} while(bc.NextRecord())
			}
	
		 	
		    // update the rows		 	    
		    for (var k = 0; k< prodId.length; k++)
		    { 
				var indata1 =TheApplication().NewPropertySet ();
				var outdata1 = TheApplication().NewPropertySet ();
				indata1.SetProperty (""RootItemId"", rootQuoteItemId[k]);
				indata1.SetProperty (""QuoteorOrderorAgreementId"", destQuoteId);
				indata1.SetProperty(""SourceConfigHeader"",sourceConfigHeader[k]);
				indata1.SetProperty(""SourceConfigRevNbr"",sourceConfigRevNbr[k]);
				indata1.SetProperty(""BusinessObject"",bo.Name());					
				indata1.SetProperty(""BusinessComponent"",bc.Name());
				
				var svc1 = TheApplication().GetService(""CZIntegCopyConfigService"");
				svc1.InvokeMethod(""CopyOracleConfiguration"", indata1, outdata1);
		
		    }
  		}
		catch  (e) 
		{
 			TheApplication().Trace(e.toString());
		  	TheApplication().RaiseErrorText(e.toString());
			throw e;
		}
		finally
		{
			indata1 = null;
			outdata1 = null
			svc1 = null;
			bOracleProduct = null;
			isOCPi = null;
			isOCPo = null;
			isOCPSvc = null;
			sourceConfigHeader = null;
			sourceConfigRevNbr = null;
			destQuoteId  = null;
			bo = null;
			bc = null;;
			prodId = null;
			rootQuoteItemId = null;
			sourceQuoteId =  null;
			sourceConfigHeader = null;
			sourceConfigRevNbr = null;
		}
  }
function WebApplet_PreInvokeMethod (MethodName)
{
	if(MethodName == ""RejectProspect"")
	{
	var appObj = TheApplication();
		this.BusComp().ActivateField(""PartnershipApplicationStatus"");
		this.BusComp().SetFieldValue(""PartnershipApplicationStatus"",appObj.InvokeMethod(""LookupValue"",""PRTNRSHIP_APPL_STATUS"",""Rejected""));
		this.BusComp().WriteRecord();
		return(CancelOperation);	
	}
	
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	
	if(MethodName == ""SaveRead"")
	{
		with(this.BusComp())
		{
		
		
		ActivateField(""STC Read Only Flag"");
		
		if(GetFieldValue(""STC Read Only Flag"") != ""Y"")
		{
		SetFieldValue(""STC Read Only Flag"", ""Y"");
		WriteRecord();
		}
		}
		return(CancelOperation);
	}
	return (ContinueOperation);
}
function WebApplet_InvokeMethod (MethodName)
{

	  //  if this is a copy process, for a line item,
	  //  we need to invoke the Oracle copy business Service
	  //  which will make the call to copy the corresponding
	  //  configuration in Oracle and then update the lines
	  //  in Siebel with the Configuration Header and Rev Number
  
	 if (MethodName == ""CopyRecord"") 
	 {
		  try 
		  {
				var busObj = this.BusObject();
				var busComp = this.BusComp();
				var sourceConfigHeader =  busComp.GetFieldValue(""External Configurator Reference 1"");
				var sourceConfigRevNbr = busComp.GetFieldValue(""External Configurator Reference 2"");
				var quoteId = busComp.GetFieldValue(""Quote Id"");
				var prodId = busComp.GetFieldValue(""Root Product Id"");
				var rootQuoteItemId = busComp.GetFieldValue(""Root Quote Item Id"");
			
     			var isOCPi = TheApplication().NewPropertySet();
	      		var isOCPo = TheApplication().NewPropertySet();
  	   			var bOracleProduct ;
 											
				var productId = busComp.GetFieldValue(""Product Id"");
				
				//isOCPi.SetProperty(""BusCompName"",busComp.Name())
				isOCPi.SetProperty(""ProductId"",productId);
					
				var isOCPSvc = TheApplication().GetService(""CZSessionManagement"");
				isOCPSvc.InvokeMethod(""IsOracleConfigurableProduct"", isOCPi, isOCPo);
		
				bOracleProduct = isOCPo.GetProperty(""IsOracleProduct"");

				if (bOracleProduct == ""true"")
				{
					try
					{
						var indata1 =TheApplication().NewPropertySet ();
						var outdata1 = TheApplication().NewPropertySet ();
						indata1.SetProperty (""RootItemId"", rootQuoteItemId);
						indata1.SetProperty (""QuoteorOrderorAgreementId"", quoteId);
						indata1.SetProperty(""SourceConfigHeader"",sourceConfigHeader);
						indata1.SetProperty(""SourceConfigRevNbr"",sourceConfigRevNbr);
						indata1.SetProperty(""BusinessObject"",busObj.Name());
						indata1.SetProperty(""BusinessComponent"",""Quote Item"");
						
						
						var svc1 = TheApplication().GetService(""CZIntegCopyConfigService"");
						svc1.InvokeMethod(""CopyOracleConfiguration"", indata1, outdata1);
						
						var destConfigRevNbr = outdata1.GetProperty(""DestConfigRevNbr"");
						var destConfigHeader = outdata1.GetProperty(""DestConfigHeader"");
						
					}
					catch  (e) 
					{
						TheApplication().Trace(e.toString());
						var error = e.toString();
						TheApplication().RaiseErrorText(e.toString());
						throw e;
					}
					finally
					{
	 				  //for the root item
						busComp.SetFieldValue(""External Configurator Reference 1"",destConfigHeader);
						busComp.SetFieldValue(""External Configurator Reference 2"",destConfigRevNbr );
	
					  destConfigRevNbr = null;
					  destConfigHeader = null;
						indata1 = null;
						svc1 = null;
					}
				} //  end if (bOracleProduct)
			}
			catch  (e) 
			{
				TheApplication().RaiseErrorText(e.toString());
				TheApplication().Trace(e.toString());
				var error = e.toString();
				throw e;
			}
			finally 
			{
				if (busObj != null) { busObj = null;}
				if (busComp != null) {busComp = null;}
				
				sourceConfigHeader =  null;
				sourceConfigRevNbr = null;
				quoteId = null;
				prodId = null;
				rootQuoteItemId = null;
				bOracleProduct = null;
				isOCPi = null;
				isOCPo = null;
				isOCPSvc = null;
		}
	} // end if (MethodName == ""CopyRecord"")


}
function WebApplet_InvokeMethod (MethodName)
{

	  //  if this is a copy process, for a line item,
	  //  we need to invoke the Oracle copy business Service
	  //  which will make the call to copy the corresponding
	  //  configuration in Oracle and then update the lines
	  //  in Siebel with the Configuration Header and Rev Number
  
	 if (MethodName == ""CopyRecord"") 
	 {
		  try 
		  {
				var busObj = this.BusObject();
				var busComp = this.BusComp();
				var sourceConfigHeader =  busComp.GetFieldValue(""External Configurator Reference 1"");
				var sourceConfigRevNbr = busComp.GetFieldValue(""External Configurator Reference 2"");
				var quoteId = busComp.GetFieldValue(""Quote Id"");
				var prodId = busComp.GetFieldValue(""Root Product Id"");
				var rootQuoteItemId = busComp.GetFieldValue(""Root Quote Item Id"");
			
				var invItemId = busComp.GetFieldValue(""External Inventory System Ref"");
 				var bOracleProduct = false;
											
				if ((invItemId != null) && (invItemId != """")) 
				{
						bOracleProduct = true;
				}

				if (bOracleProduct)
				{
					try
					{
						var indata1 =TheApplication().NewPropertySet ();
						var outdata1 = TheApplication().NewPropertySet ();
						indata1.SetProperty (""RootItemId"", rootQuoteItemId);
						indata1.SetProperty (""QuoteorOrderorAgreementId"", quoteId);
						indata1.SetProperty(""SourceConfigHeader"",sourceConfigHeader);
						indata1.SetProperty(""SourceConfigRevNbr"",sourceConfigRevNbr);
						indata1.SetProperty(""BusinessObject"",busObj.Name());
						indata1.SetProperty(""BusinessComponent"",busComp.Name());
						
						
						var svc1 = TheApplication().GetService(""CZIntegCopyConfigService"");
						svc1.InvokeMethod(""CopyOracleConfiguration"", indata1, outdata1);
						
						var destConfigRevNbr = outdata1.GetProperty(""DestConfigRevNbr"");
						var destConfigHeader = outdata1.GetProperty(""DestConfigHeader"");
						
						//for the root item
						busComp.SetFieldValue(""External Configurator Reference 1"",destConfigHeader);
						busComp.SetFieldValue(""External Configurator Reference 2"",destConfigRevNbr );
					}
					catch  (e) 
					{
						TheApplication().RaiseErrorText(e.toString());
						TheApplication().Trace(e.toString());
						var error = e.toString();
						throw e;
					}
					finally
					{
					  destConfigRevNbr = null;
					  destConfigHeader = null;
						indata1 = null;
						svc1 = null;
					}
				} //  end if (bOracleProduct)
			}
			catch  (e) 
			{
				TheApplication().RaiseErrorText(e.toString());
				TheApplication().Trace(e.toString());
				var error = e.toString();
				throw e;
			}
			finally 
			{
				if (busObj != null) { busObj = null;}
				if (busComp != null) {busComp = null;}
				
				sourceConfigHeader =  null;
				sourceConfigRevNbr = null;
				quoteId = null;
				prodId = null;
				rootQuoteItemId = null;
			
		}
	} // end if (MethodName == ""CopyRecord"")


}
"
function WebApplet_InvokeMethod (MethodName)
{

	  //  if this is a copy process, for a line item,
	  //  we need to invoke the Oracle copy business Service
	  //  which will make the call to copy the corresponding
	  //  configuration in Oracle and then update the lines
	  //  in Siebel with the Configuration Header and Rev Number
  
	 if (MethodName == ""CopyRecord"") 
	 {
		  try 
		  {
				var busObj = this.BusObject();
				var busComp = this.BusComp();
				var sourceConfigHeader =  busComp.GetFieldValue(""External Configurator Reference 1"");
				var sourceConfigRevNbr = busComp.GetFieldValue(""External Configurator Reference 2"");
				var quoteId = busComp.GetFieldValue(""Quote Id"");
				var prodId = busComp.GetFieldValue(""Root Product Id"");
				var rootQuoteItemId = busComp.GetFieldValue(""Root Quote Item Id"");
				
				var invItemId = busComp.GetFieldValue(""External Inventory System Ref"");
 				var bOracleProduct;

				var isOCPi = TheApplication().NewPropertySet();
		     	var isOCPo = TheApplication().NewPropertySet();

				var productId = busComp.GetFieldValue(""Product Id"");
				
				//isOCPi.SetProperty(""BusCompName"",busComp.Name())
				isOCPi.SetProperty(""ProductId"",productId);
		
   		        var isOCPSvc = TheApplication().GetService(""CZSessionManagement"");
				isOCPSvc.InvokeMethod(""IsOracleConfigurableProduct"", isOCPi, isOCPo);
		
				bOracleProduct = isOCPo.GetProperty(""IsOracleProduct"");
							
			    if (bOracleProduct == ""true"")
				{
					try
					{
					
						var indata1 =TheApplication().NewPropertySet ();
						var outdata1 = TheApplication().NewPropertySet ();
						indata1.SetProperty (""RootItemId"", rootQuoteItemId);
						indata1.SetProperty (""QuoteorOrderorAgreementId"", quoteId);
						indata1.SetProperty(""SourceConfigHeader"",sourceConfigHeader);
						indata1.SetProperty(""SourceConfigRevNbr"",sourceConfigRevNbr);
  					indata1.SetProperty(""BusinessObject"",busObj.Name());
						indata1.SetProperty(""BusinessComponent"",busComp.Name());
						
						var svc1 = TheApplication().GetService(""CZIntegCopyConfigService"");
						svc1.InvokeMethod(""CopyOracleConfiguration"", indata1, outdata1);
						
						var destConfigRevNbr = outdata1.GetProperty(""DestConfigRevNbr"");
						var destConfigHeader = outdata1.GetProperty(""DestConfigHeader"");
						
					}
					catch  (e) 
					{
						TheApplication().Trace(e.toString());
						var error = e.toString();
						TheApplication().RaiseErrorText(e.toString());
						throw e;
					}
					finally
					{
						//for the root item
						busComp.SetFieldValue(""External Configurator Reference 1"",destConfigHeader);
						busComp.SetFieldValue(""External Configurator Reference 2"",destConfigRevNbr );
					
					  destConfigRevNbr = null;
					  destConfigHeader = null;
						indata1 = null;
						svc1 = null;
					}
				} //  end if (bOracleProduct)
			}
			catch  (e) 
			{
				TheApplication().RaiseErrorText(e.toString());
				TheApplication().Trace(e.toString());
				var error = e.toString();
				throw e;
			}
			finally 
			{
				if (busObj != null) { busObj = null;}
				if (busComp != null) {busComp = null;}
				
				sourceConfigHeader =  null;
				sourceConfigRevNbr = null;
				quoteId = null;
				prodId = null;
				rootQuoteItemId = null;
			
		}
	} // end if (MethodName == ""CopyRecord"")


}
function WebApplet_InvokeMethod (MethodName)
{

	  //  if this is a copy process, for a line item,
	  //  we need to invoke the Oracle copy business Service
	  //  which will make the call to copy the corresponding
	  //  configuration in Oracle and then update the lines
	  //  in Siebel with the Configuration Header and Rev Number
  
	 if (MethodName == ""CopyRecord"") 
	 {
		  try 
		  {
				var busObj = this.BusObject();
				var busComp = this.BusComp();
				var sourceConfigHeader =  busComp.GetFieldValue(""External Configurator Reference 1"");
				var sourceConfigRevNbr = busComp.GetFieldValue(""External Configurator Reference 2"");
				var quoteId = busComp.GetFieldValue(""Quote Id"");
				var prodId = busComp.GetFieldValue(""Root Product Id"");
				var rootQuoteItemId = busComp.GetFieldValue(""Root Quote Item Id"");
				
				var invItemId = busComp.GetFieldValue(""External Inventory System Ref"");
 				var bOracleProduct;

				var isOCPi = TheApplication().NewPropertySet();
		     	var isOCPo = TheApplication().NewPropertySet();

				var productId = busComp.GetFieldValue(""Product Id"");
				
				//isOCPi.SetProperty(""BusCompName"",busComp.Name())
				isOCPi.SetProperty(""ProductId"",productId);
		
   		        var isOCPSvc = TheApplication().GetService(""CZSessionManagement"");
				isOCPSvc.InvokeMethod(""IsOracleConfigurableProduct"", isOCPi, isOCPo);
		
				bOracleProduct = isOCPo.GetProperty(""IsOracleProduct"");
							
			    if (bOracleProduct == ""true"")
				{
					try
					{
					
						var indata1 =TheApplication().NewPropertySet ();
						var outdata1 = TheApplication().NewPropertySet ();
						indata1.SetProperty (""RootItemId"", rootQuoteItemId);
						indata1.SetProperty (""QuoteorOrderorAgreementId"", quoteId);
						indata1.SetProperty(""SourceConfigHeader"",sourceConfigHeader);
						indata1.SetProperty(""SourceConfigRevNbr"",sourceConfigRevNbr);
  					indata1.SetProperty(""BusinessObject"",busObj.Name());
						indata1.SetProperty(""BusinessComponent"",busComp.Name());
						
						var svc1 = TheApplication().GetService(""CZIntegCopyConfigService"");
						svc1.InvokeMethod(""CopyOracleConfiguration"", indata1, outdata1);
						
						var destConfigRevNbr = outdata1.GetProperty(""DestConfigRevNbr"");
						var destConfigHeader = outdata1.GetProperty(""DestConfigHeader"");
						
					}
					catch  (e) 
					{
						TheApplication().Trace(e.toString());
						var error = e.toString();
						TheApplication().RaiseErrorText(e.toString());
						throw e;
					}
					finally
					{
						//for the root item
						busComp.SetFieldValue(""External Configurator Reference 1"",destConfigHeader);
						busComp.SetFieldValue(""External Configurator Reference 2"",destConfigRevNbr );
					
					  destConfigRevNbr = null;
					  destConfigHeader = null;
						indata1 = null;
						svc1 = null;
					}
				} //  end if (bOracleProduct)
			}
			catch  (e) 
			{
				TheApplication().RaiseErrorText(e.toString());
				TheApplication().Trace(e.toString());
				var error = e.toString();
				throw e;
			}
			finally 
			{
				if (busObj != null) { busObj = null;}
				if (busComp != null) {busComp = null;}
				
				sourceConfigHeader =  null;
				sourceConfigRevNbr = null;
				quoteId = null;
				prodId = null;
				rootQuoteItemId = null;
			
		}
	} // end if (MethodName == ""CopyRecord"")


}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if(MethodName == ""FrameEventSiebelToOracleQuote"")
	{
		CanInvoke = ""TRUE"";
		return (CancelOperation);
	}
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	return (ContinueOperation);
}
function WebApplet_InvokeMethod (MethodName)
{
	return (ContinueOperation);
}
"/**************************************************************************************
* Name          : NM Number Redeployment import CSV  WebApplet_PreCanInvokeMethod     * 
* Author        : Mahindra British Telecom                                            *
* Description   : NM Number Redeployment Code File                      			  *
*																					  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 12/12/2003	1.0   		   MBT					   	Created       12/12/2003      *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{

	if(MethodName == ""Import"")
	{
		CanInvoke = ""TRUE"";
		return(CancelOperation);
	}	
	return (ContinueOperation);
}
function WebApplet_InvokeMethod (MethodName)
{
	return (ContinueOperation);
}
"/**************************************************************************************
* Name          : NM Number Redeployment import CSV  WebApplet_PreCanInvokeMethod     * 
* Author        : Mahindra British Telecom                                            *
* Description   : NM Number Redeployment Code File                      			  *
*																					  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 12/12/2003	1.0   		   MBT					   	Created       12/12/2003      *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{

	if(MethodName == ""Import"")
	{
		CanInvoke = ""TRUE"";
		return(CancelOperation);
	}	
	return (ContinueOperation);
}
"/**************************************************************************************
* Name 			: RMS AUC Number Master Pick List Applet PreCanInvoke Method		  *
* Author 		: Mahindra British Telecom											  *	
* Description 	: RMS Code file for AUC Number Master Pick List Applet				  * 				  	
*																					  *	
* Ammendment Details				                                                  *
***************************************************************************************
* Date 			Version 	AmmendedBy				Comments 	  Reveiwed Date   	  *	
***************************************************************************************
* 06/07/05		2.0			MBT						Created	      06/07/05      	  *
**************************************************************************************/
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if(MethodName == ""ExportIMSI""){
		CanInvoke = ""TRUE"";
		return CancelOperation;
	}

	return ContinueOperation;
}
function GetPromotionCode(fBatchId)
{


 var boAUCRegistration      = TheApplication().GetBusObject(""RMS AUC Registration"");
 var bcControlEBC         = boAUCRegistration.GetBusComp(""RMS AUC Control Table EBC"");
 var fPromotionCD = """";
     with(bcControlEBC)
     {
    SetViewMode(AllView);
    ActivateField(""Pre Act Batch Id"");
    ActivateField(""Promotion Code"");
    ClearToQuery();
                SetSearchSpec(""Pre Act Batch Id"",fBatchId);
                ExecuteQuery(ForwardOnly);
                var blnIsRecord1 = FirstRecord();
                if (blnIsRecord1)
    {
     fPromotionCD = GetFieldValue(""Promotion Code"");
     return (fPromotionCD); 
    }
  }
bcControlEBC = null;
boAUCRegistration = null;

}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	try
{
	var intReturn = ContinueOperation;
	if (MethodName == ""Register"")
	{
		
			var bcBatchAct 	= this.BusComp();
			var Mregistered = bcBatchAct.GetFieldValue(""STC Registered"");
		    if((bcBatchAct.GetFieldValue(""Id"") == """") || (Mregistered == ""Y"")) 
		    { 
	   			CanInvoke = ""FALSE"";
				intReturn = CancelOperation;
	     	} 
			else
			{
	   			CanInvoke = ""TRUE"";
	 			intReturn = CancelOperation;
	 		}
	}	

	return (intReturn);
}
catch(e)
{
	e.toString();
}

}
function WebApplet_PreInvokeMethod (MethodName)
{
try
{
	if(MethodName == ""Register"")
	{		
			var boAccount = TheApplication().GetBusObject(""STC-Subscriptions Data"");
	   		var bcAccount = boAccount.GetBusComp(""CUT Service Sub Accounts"");
			var bcAssets = boAccount.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
			var fMSISDN = this.BusComp().GetFieldValue(""MSISDN"");		
			var fSIM = this.BusComp().GetFieldValue(""SIM"");
			var fPIN1 = this.BusComp().GetFieldValue(""PIN1"");
			var fPIN2 = this.BusComp().GetFieldValue(""PIN2"");
			var fPUK1 = this.BusComp().GetFieldValue(""PUK1"");
	     	var fPUK2 = this.BusComp().GetFieldValue(""PUK2"");
			var fIMSI = this.BusComp().GetFieldValue(""IMSI"");
			var fIMSI; 
			var fPromotionCD;
			var strSubscriptionId;
			var fbatchid = this.BusComp().GetFieldValue(""Batch No"");
	        if (fbatchid != null && fbatchid != """")
	   			fPromotionCD = GetPromotionCode(fbatchid);
		
		 // To check whether MSISDN is already exists
			if (fMSISDN != null && fMSISDN != """")
			{
				with (bcAccount)
	     		{
	     			var vacctstatus = TheApplication().InvokeMethod(""LookupValue"", ""ACCOUNT_STATUS"", ""Active"");
					var vregstat = TheApplication().InvokeMethod(""LookupValue"", ""STC_REG_STATUS"", ""Unregistered"");
	     		//	var strSearchExpress = ""[DUNS Number] = '99999' AND [Account Status] = '"" + vacctstatus + ""' AND [STC Registration Status] = '"" + vregstat + ""' AND [STC Create Assets Flg] = 'Y'""; 
	     			var strSearchExpress = ""[DUNS Number] = '99999' AND [Account Status] = '"" + vacctstatus + ""' AND [STC Create Assets Flg] = 'Y'""; 												
					SetViewMode(AllView);
					ActivateField(""DUNS Number"");
					ActivateField(""Account Status"");
				//	ActivateField(""STC Registration Status"");
					ActivateField(""STC-ICCID"");
					ActivateField(""STC-PIN1"");
					ActivateField(""STC-PIN2"");
					ActivateField(""STC-PUK1"");
					ActivateField(""STC-PUK2"");
					ActivateField(""STC SP Flag"");	
					ActivateField(""STC Promotion Code"");
				//	ActivateField(""STC SP Flag"");
					ActivateField(""STC Create Assets Flg""); // na;050508; Flag to filter to get records for which assets created
					ClearToQuery();
		          /*  SetSearchSpec(""DUNS Number"",""99999"");
					SetSearchSpec(""Account Status"",vacctstatus);
					SetSearchSpec(""STC Registration Status"",vregstat);
					SetSearchSpec(""STC Create Assets Flg"",""Y""); // na;050508; Flag to filter assets created records */
					SetSearchExpr(strSearchExpress);
		            ExecuteQuery(ForwardOnly);
					var IsRecord = FirstRecord();
					if (IsRecord)
					{
					    var strSubscriptionId = GetFieldValue(""Id"");
						if (fMSISDN != null && fMSISDN != """")
		     			SetFieldValue(""DUNS Number"", fMSISDN);
						if (fSIM != null && fSIM != """")
		     			SetFieldValue(""STC-ICCID"", fSIM);
						if (fPIN1 != null && fPIN1 != """")
		     			SetFieldValue(""STC-PIN1"", fPIN1);
						if (fPIN2 != null && fPIN2 != """")
		     			SetFieldValue(""STC-PIN2"", fPIN2);
						if (fPUK1 != null && fPUK1 != """")
		     			SetFieldValue(""STC-PUK1"", fPUK1);
						if (fPUK2 != null && fPUK2 != """")
		     			SetFieldValue(""STC-PUK2"", fPUK2);
						if (fIMSI != null && fIMSI != """")
		     			SetFieldValue(""STC-IMSI"", fIMSI);
						if (fPromotionCD != null && fPromotionCD != """")
				     	SetFieldValue(""STC Promotion Code"", fPromotionCD);
				     	SetFieldValue(""STC SP Flag"", ""Y"");	// NA; 15-08-2008;
			     		WriteRecord();
					
						with(bcAssets)
						{
							var strSearchExpr = ""[Service Account Id] = '"" + strSubscriptionId + ""' AND [Status] = 'Active' AND [Parent Asset Id] IS NULL""; 						
							SetViewMode(AllView);
							ActivateField(""Parent Asset Id"");
							ActivateField(""STC MSISDN"");
							ActivateField(""STC SIM"");	
							ClearToQuery();
							SetViewMode(AllView);
		               		SetSearchExpr(strSearchExpr);
		               		ExecuteQuery(ForwardOnly);
		               		var blnIsRecord1 = FirstRecord();
							if(blnIsRecord1)
	               			{
									SetFieldValue(""STC MSISDN"", fMSISDN);
									if (fSIM != null && fSIM != """")
					     			SetFieldValue(""STC SIM"", fSIM);
									WriteRecord();
							} //end if	
						} //end assets bc 
							ClearToQuery();
							SetSearchSpec(""Id"",strSubscriptionId);
							ExecuteQuery(ForwardOnly);
						TheApplication().GotoView(""STC-Subscriptions MoreInfo View"",boAccount); 
					} // end if
		     	} //end bc account
			} // if msisdn found
	return (CancelOperation); 
	}// if method name
}
catch(e)
	{
		var vErr = e.toString();
		var vErrCode = e.errCode;
		var vObjName = ""RMS AUC Pre Activation Form Applet"";
		var vFunc = ""Service_PreInvokeMethod"";
		var vObjType = ""Applet"";
		var vMSISDN = fMSISDN;
		TheApplication().log_exception(""Exception"",vErr,vErrCode,vMSISDN,vObjName,vFunc,vObjType);
		return(CancelOperation);
	}
finally
	{
		bcAssets = null;
		bcAccount = null;
		boAccount = null;
	}	
	return (ContinueOperation);

}
"/**************************************************************************************
* Name 			: RMS AUC Registration Form Applet Invoke Method				      *
* Author 		: Mahindra British Telecom											  *	
* Description 	: RMS Code file for AUC Registration Form Applet					  * 				  	
*																					  *	
* Ammendment Details				                                                  *
***************************************************************************************
* Date 			Version 	AmmendedBy					Comments 	  Reveiwed Date   *
***************************************************************************************
*                                                                                     *
* 18/12/2003	1.0			MBT							Created	      18/12/2003      *
**************************************************************************************/
function WebApplet_InvokeMethod (MethodName)
{

	if(MethodName == ""NewQuery"")
  		TheApplication().SetSharedGlobal(""blnIsExportEnabled"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"")
  		TheApplication().SetSharedGlobal(""blnIsExportEnabled"",""Y"");

}
"/**************************************************************************************
* Name 			: RMS AUC Registration Form Applet PreCanInvoke Method			  *
* Author 		: Mahindra British Telecom											  *	
* Description 	: RMS Code file for RMS AUC Registration Form Applet					  * 				  	
*				  										             	 			  *
* Ammendment Details :				                                                  *     
***************************************************************************************
* Date 			Version 	AmmendedBy			Comments 	  	 Reviewed Date        *
***************************************************************************************
*                                                                                     *
* 18/12/2003	1.0			MBT					Created	         18/12/2003           *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

//	var bcAssRuleDtl;
//	var bcAssRuleMstr;
	
	var intReturn = ContinueOperation;
/*	if((blnSimOrdButton == ""Y"" || blnSimOrdButton == """")) 
		CanInvoke = ""TRUE"";
	else
		CanInvoke = ""FALSE"";
		intReturn = CancelOperation;
	break;
*/	
	if (MethodName == ""ExportIMSI""){
	
		var bcAUCDtl 	= this.BusComp();
	    
   	if(bcAUCDtl.GetFieldValue(""Id"") == """" ||  TheApplication().GetSharedGlobal(""blnIsExportEnabled"")==""N"") { 
   			CanInvoke = ""FALSE"";
     	} else {
   			CanInvoke = ""TRUE"";
 			intReturn = CancelOperation;
 		}
 
	}


	if (MethodName == ""Import AUC File"")
	{
		var bcAUCDtl 	= this.BusComp();
	    
   		if(bcAUCDtl.GetFieldValue(""Id"") == """" ||  TheApplication().GetSharedGlobal(""blnIsExportEnabled"")==""N"") 
   		{ 
   			CanInvoke = ""FALSE"";
     	} 
     	else 
     	{
   			CanInvoke = ""TRUE"";
 			intReturn = CancelOperation;
 		}
 
	}
 	return(intReturn); 
}
"/**************************************************************************************
* Name 			: RMS AUC Registration List Applet Invoke Method				      *
* Author 		: Mahindra British Telecom											  *	
* Description 	: RMS Code file for AUC Registration List Applet					  * 				  	
*																					  *	
* Ammendment Details				                                                  *
***************************************************************************************
* Date 			Version 	AmmendedBy					Comments 	  Reveiwed Date   *
***************************************************************************************
*                                                                                     *
* 18/12/2003	1.0			MBT							Created	      18/12/2003      *
**************************************************************************************/
function WebApplet_InvokeMethod (MethodName)
{

	if(MethodName == ""NewQuery"")
  		TheApplication().SetSharedGlobal(""blnIsExportEnabled"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"")
  		TheApplication().SetSharedGlobal(""blnIsExportEnabled"",""Y"");

}
"/**************************************************************************************
* Name 			: RMS AUC Registration List Applet PreCanInvoke Method			  *
* Author 		: Mahindra British Telecom											  *	
* Description 	: RMS Code file for RMS AUC Registration List Applet					  * 				  	
*				  										             	 			  *
* Ammendment Details :				                                                  *     
***************************************************************************************
* Date 			Version 	AmmendedBy			Comments 	  	 Reviewed Date        *
***************************************************************************************
*                                                                                     *
* 18/12/2003	1.0			MBT					Created	         18/12/2003           *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var intReturn = ContinueOperation;
	var bcRMSAUC = this.BusComp();
	bcRMSAUC.ActivateField(""Status"");
if (MethodName == ""ShowPopup"")
	{
			var bcAUCDtl 	= this.BusComp();
	    
   		if(bcAUCDtl.GetFieldValue(""Id"") == """" ||  TheApplication().GetSharedGlobal(""blnIsExportEnabled"")==""N"" ) 
   		{ 
   			CanInvoke = ""FALSE"";
 			intReturn = ContinueOperation;
     	} 
     	else 
     	{
   			CanInvoke = ""TRUE"";
			intReturn = CancelOperation;   			
		}
		
     }

       if (MethodName==""RegisterIMSI"")
	     {
	   if(bcRMSAUC.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"",""RMS_OPR_STATUS"",""PENDING""))
			{
	    CanInvoke = ""TRUE"";
		intReturn = CancelOperation; 
         }
       else
           {
             CanInvoke = ""FALSE"";
 			intReturn = ContinueOperation;
        		}
	
              }
if (MethodName==""Update NO Status"")

{
			
			if(bcRMSAUC.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"",""RMS_OPR_STATUS"",""COMPLETE""))
				{
					CanInvoke = ""TRUE"";
 					intReturn = CancelOperation; 
        		}
			else
				{
					CanInvoke = ""FALSE"";
					intReturn = ContinueOperation; 
          		}
}

return(intReturn); 
}
"/**************************************************************************************
* Name 			: RMS Dist SIM Count Form Applet PreCarInvoke Method				  *
* Author 		: Mahindra British Telecom											  *	
* Description 	: RMS Code file for RMS Dist SIM Count Form Applet					  * 				  	
*																					  *	
* Ammendment Details				                                                  *
***************************************************************************************
* Date 			Version 	AmmendedBy				Comments 	  	  Reveiwed Date   *
***************************************************************************************
*                                                                                     *
* 4/26/2005		 1.0			MBT				    Kadali Srinivas    4/26/2005      *
**************************************************************************************/
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){	
	
	var intReturn	= ContinueOperation;
	
	switch (MethodName){
		case ""Blocksims"" : 
			CanInvoke = ""TRUE"";
			return (CancelOperation);
			break;
		case ""Unblocksims"" :
			CanInvoke = ""TRUE"";
			return (CancelOperation);
			break;
			
  	}	
	return(intReturn);
}
"/**************************************************************************************
* Name 			: WebApplet_PreCanInvokeMethod 										  *
* Author 		: MBT 																  *
* Description 	: The function Disables the Query function          				  *
* Ammendment Details                                                                  *
***************************************************************************************
* Date 			Version 	AmmendedBy					Comments 	  	              *
***************************************************************************************
* 18/10/2002	1.0			MBT(Mumbai)					Created	 			          *
**************************************************************************************/
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke) {

	switch (MethodName)	 {
		case ""NewQuery"" :
			CanInvoke = ""FALSE"";
			return(CancelOperation);
			break;
	} 

	return (ContinueOperation);
}
"/**************************************************************************************
* Name 			: NM Association Number Type Enquiry List applet                      *
*				  WebApplet_PreCanInvokeMethod	 									  *
* Author 		: Mahindra British Telecom 										      *
* Description 	: Code file for NM Association Number Type Enquiry List applet 		  *
***************************************************************************************
* Date 			Version 	AmmendedBy			Comments     Reviewed Date	  	      *
***************************************************************************************
*                                                                                     *
* 22/12/2003	1.0			MBT(Pune)			Created	      22/12/2003              *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke) {
	
	return (ContinueOperation);

}
"/**************************************************************************************
* Name 			: RMS Association Rule Detail Applet Invoke Method				      *
* Author 		: Mahindra British Telecom											  *	
* Description 	: RMS Code file for Association Rule detail Applet					  * 				  	
*																					  *	
* Ammendment Details				                                                  *
***************************************************************************************
* Date 			Version 	AmmendedBy					Comments 	  Reveiwed Date   *
***************************************************************************************
*                                                                                     *
* 01/11/2003	1.0			MBT							Created	      01/11/2003      *
**************************************************************************************/
function WebApplet_InvokeMethod (MethodName)
{

	if(MethodName == ""NewQuery"")
  		TheApplication().SetSharedGlobal(""blnIsValidateEnabled"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"")
  		TheApplication().SetSharedGlobal(""blnIsValidateEnabled"",""Y"");

}
"/**************************************************************************************
* Name 			: RMS Association Rule Detail Applet PreCanInvoke Method			  *
* Author 		: Mahindra British Telecom											  *	
* Description 	: RMS Code file for Association Rule detail Applet					  * 				  	
*				  										             	 			  *
* Ammendment Details :				                                                  *     
***************************************************************************************
* Date 			Version 	AmmendedBy			Comments 	  	 Reviewed Date        *
***************************************************************************************
*                                                                                     *
* 01/12/2003	1.0			MBT					Created	         01/12/2003           *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	var bcAssRuleDtl;
	var bcAssRuleMstr;
	
	var intReturn = ContinueOperation;
	
	if (MethodName == ""ValidateRule""){
		
		bcAssRuleDtl 	= this.BusComp();
	    bcAssRuleMstr	= bcAssRuleDtl.ParentBusComp();
	    
   		if(bcAssRuleMstr.GetFieldValue(""Status"") == ""Y"" 
   								||
   		   bcAssRuleMstr.GetFieldValue(""Is Valid"") == ""Y"" 
   		   						||
   		   TheApplication().GetSharedGlobal(""blnIsValidateEnabled"")==""N"" 
   		   						|| 
   		   bcAssRuleDtl.GetFieldValue(""Sequence"") == """")
   			CanInvoke = ""FALSE"";
     	else 
   			CanInvoke = ""TRUE"";
 		intReturn = CancelOperation;
 	
 		bcAssRuleDtl  = null;
		bcAssRuleMstr = null;
	}
 	
 	return(intReturn); 
}
"/**************************************************************************************
* Name 			: RMS Association Rule Master Form Applet Invoke Method			  *
* Author 		: Mahindra British Telecom										      *	
* Description 	: RMS NM Association Rule Master Code File.					      * 				  	
*				                                                                      *
***************************************************************************************
* Date 			Version 	AmmendedBy			Comments        Reviewed Date         *
***************************************************************************************
*                                                                                     *
* 01/12/2003	1.0			MBT					Created	        01/12/2003            *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){
	if(MethodName == ""NewQuery""){
		TheApplication().SetSharedGlobal(""blnIsValidateEnabled"",""N"");
		TheApplication().SetSharedGlobal(""blnIsReleaseEnabled"",""N"");
	}
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery""){
		TheApplication().SetSharedGlobal(""blnIsValidateEnabled"",""Y"");
		TheApplication().SetSharedGlobal(""blnIsReleaseEnabled"",""Y"");
	}
}
"/**************************************************************************************
* Name 			: RMS Association Rule Master Form Applet PreCanInvoke Method		  *
* Author 		: Mahindra British Telecom									     	  *	
* Description 	: RMS NM Association Rule Master Code File.					      * 				  	
*				                                                                      *
***************************************************************************************
* Date 			Version 	AmmendedBy			Comments        Reviewed Date         *
***************************************************************************************
*                                                                                     *
* 01/12/2003	1.0			MBT					Created	        01/12/2003            *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	var bcRulMstr;
    var intReturn = ContinueOperation;
     
	switch(MethodName){
//----------------------------------------------------------------
// Enable the release button only if the rule hasnt been released
// or if its valid or if the rule hasnt expired.
//----------------------------------------------------------------
		case ""ReleaseRule"":
			bcRulMstr = this.BusComp();
			if(bcRulMstr.GetFieldValue(""Is Valid"") == ""N"" 
									|| 
			   bcRulMstr.GetFieldValue(""Status"") == ""Y"" 
			   						||
			   bcRulMstr.GetFieldValue(""Is Expired"") == ""Y""
			   						|| 						
			   TheApplication().GetSharedGlobal(""blnIsReleaseEnabled"")==""N"")
				CanInvoke = ""FALSE"";
			else 
				CanInvoke = ""TRUE"";
			intReturn = CancelOperation;
			break;

//----------------------------------------------------------------
// Enable the delete button only if the rule hasnt been released
//----------------------------------------------------------------
		case ""DeleteRecord"":
			bcRulMstr = this.BusComp();
			if(bcRulMstr.GetFieldValue(""Status"") == ""Y"")
				CanInvoke = ""FALSE"";
			else 
				CanInvoke = ""TRUE"";
			intReturn = CancelOperation;
			break;	

//----------------------------------------------------------------
// Enable the copy button only if the rule hasnt been released
//----------------------------------------------------------------
		case ""CopyRecord"":
			bcRulMstr = this.BusComp();
			if(bcRulMstr.GetFieldValue(""Status"") == ""Y"")
				CanInvoke = ""FALSE"";
			else 
				CanInvoke = ""TRUE"";
			intReturn = CancelOperation;
			break;

//----------------------------------------------------------------
// Enable the undo record button only if the rule hasnt been released
//----------------------------------------------------------------
		case ""UndoRecord"":
			bcRulMstr = this.BusComp();
			if(bcRulMstr.GetFieldValue(""Status"") == ""Y"")
				CanInvoke = ""FALSE"";
			else 
				CanInvoke = ""TRUE"";
			intReturn = CancelOperation;
			break;
			
		case ""Default"":
			break;			
	}
	
	bcRulMstr = null;	
	return(intReturn);
}
"/**************************************************************************************
* Name 			: RMS Association Rule Master Form Applet Invoke Method			  *
* Author 		: Mahindra British Telecom										      *	
* Description 	: RMS NM Association Rule Master Code File.					      * 				  	
*				                                                                      *
***************************************************************************************
* Date 			Version 	AmmendedBy			Comments        Reviewed Date         *
***************************************************************************************
*                                                                                     *
* 01/11/2003	1.0			MBT					Created	        01/11/2003            *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName)
{
	if(MethodName == ""NewQuery"")
		{
		TheApplication().SetSharedGlobal(""isValidateEnabled"",""N"");
		TheApplication().SetSharedGlobal(""isReleaseEnabled"",""N"");
		}
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"")
		{
		TheApplication().SetSharedGlobal(""isValidateEnabled"",""Y"");
		TheApplication().SetSharedGlobal(""isReleaseEnabled"",""Y"");
		}

}
"/**************************************************************************************
* Name 			: RMS Association Rule Master Form Applet PreCanInvoke Method		  *
* Author 		: Mahindra British Telecom									     	  *	
* Description 	: RMS NM Association Rule Master Code File.					      * 				  	
*				                                                                      *
***************************************************************************************
* Date 			Version 	AmmendedBy			Comments        Reviewed Date         *
***************************************************************************************
*                                                                                     *
* 01/11/2003	1.0			MBT					Created	        01/11/2003            *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var bcRulMstr;
    
    var intReturn = ContinueOperation;
     
	switch(MethodName){
		case ""Release"":
			
			bcRulMstr = this.BusComp();
			
			if(bcRulMstr.GetFieldValue(""Is Valid"") == ""N"" || bcRulMstr.GetFieldValue(""Status"") == ""Y"" ||TheApplication().GetSharedGlobal(""isReleaseEnabled"")==""N"")
				CanInvoke = ""FALSE"";
			else 
				CanInvoke = ""TRUE"";
				
			intReturn = CancelOperation;
			
			bcRulMstr = null;
			
			break;
		
	}
		
	return(intReturn);
}
"/**************************************************************************************
* Name 			: RMS Association Rule Master List Applet Invoke Method			  *
* Author 		: Mahindra British Telecom										      *	
* Description 	: RMS NM Association Rule Master Code File.					      * 				  	
*				                                                                      *
***************************************************************************************
* Date 			Version 	AmmendedBy			Comments        Reviewed Date         *
***************************************************************************************
*                                                                                     *
* 01/12/2003	1.0			MBT					Created	        01/12/2003            *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){
	if(MethodName == ""NewQuery""){
		TheApplication().SetSharedGlobal(""blnIsValidateEnabled"",""N"");
		TheApplication().SetSharedGlobal(""blnIsReleaseEnabled"",""N"");
	}
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery""){
		TheApplication().SetSharedGlobal(""blnIsValidateEnabled"",""Y"");
		TheApplication().SetSharedGlobal(""blnIsReleaseEnabled"",""Y"");
	}
}
"/**************************************************************************************
* Name 			: RMS Association Rule Master List Applet PreCanInvoke Method		  *
* Author 		: Mahindra British Telecom									     	  *	
* Description 	: RMS NM Association Rule Master Code File.					      * 				  	
*				                                                                      *
***************************************************************************************
* Date 			Version 	AmmendedBy			Comments        Reviewed Date         *
***************************************************************************************
*                                                                                     *
* 01/12/2003	1.0			MBT					Created	        01/12/2003            *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	var bcRulMstr;
    var intReturn = ContinueOperation;
     
	switch(MethodName){
//----------------------------------------------------------------
// Enable the release button only if the rule hasnt been released
// or if its valid or if the rule hasnt expired.
//----------------------------------------------------------------
		case ""ReleaseRule"":
			bcRulMstr = this.BusComp();
			if(bcRulMstr.GetFieldValue(""Is Valid"") == ""N"" 
									|| 
			   bcRulMstr.GetFieldValue(""Status"") == ""Y"" 
			   						||
			   bcRulMstr.GetFieldValue(""Is Expired"") == ""Y""
			   						|| 						
			   TheApplication().GetSharedGlobal(""blnIsReleaseEnabled"")==""N"")
				CanInvoke = ""FALSE"";
			else 
				CanInvoke = ""TRUE"";
			intReturn = CancelOperation;
			break;

//----------------------------------------------------------------
// Enable the delete button only if the rule hasnt been released
//----------------------------------------------------------------
		case ""DeleteRecord"":
			bcRulMstr = this.BusComp();
			if(bcRulMstr.GetFieldValue(""Status"") == ""Y"")
				CanInvoke = ""FALSE"";
			else 
				CanInvoke = ""TRUE"";
			intReturn = CancelOperation;
			break;	

//----------------------------------------------------------------
// Enable the copy button only if the rule hasnt been released
//----------------------------------------------------------------
		case ""CopyRecord"":
			bcRulMstr = this.BusComp();
			if(bcRulMstr.GetFieldValue(""Status"") == ""Y"")
				CanInvoke = ""FALSE"";
			else 
				CanInvoke = ""TRUE"";
			intReturn = CancelOperation;
			break;

//----------------------------------------------------------------
// Enable the undo record button only if the rule hasnt been released
//----------------------------------------------------------------
		case ""UndoRecord"":
			bcRulMstr = this.BusComp();
			if(bcRulMstr.GetFieldValue(""Status"") == ""Y"")
				CanInvoke = ""FALSE"";
			else 
				CanInvoke = ""TRUE"";
			intReturn = CancelOperation;
			break;
			
		case ""Default"":
			break;			
	}
	
	bcRulMstr = null;	
	return(intReturn);
}
"/**************************************************************************************
* Name          : RMS NM Number Generation Import MSISDN PreCanInvoke Method         * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Generation Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 02/12/2003 	1.0   		MBT						   	Created      12/12/2003       *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{

	if(MethodName == ""ImportMSISDN""){
		CanInvoke = ""TRUE"";
		return(CancelOperation);
	}



	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if (MethodName == ""QueryMSISDN"")
	{
		CanInvoke = ""TRUE"";
		return (CancelOperation);
	}
	if (MethodName == ""Reserve"")
	{
		var CusBo = TheApplication().ActiveBusObject();
     	var CusBc = CusBo.GetBusComp(""RMS NM MSISDN Details"");
        var strAllocatedTo = CusBc.GetFieldValue(""Allocated To"");
     	var STCGroupCodeId = TheApplication().GetProfileAttr(""STC GroupCode Id"");
       	if ((CusBc.GetFieldValue(""Is Associated"") != ""Y"") && (strAllocatedTo == STCGroupCodeId) && (CusBc.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"",""NM_NUMBER_STATUS"",""ALLOCATED"")))
     	{
     		CanInvoke = ""TRUE"";
			return (CancelOperation);
		}
	    else
		{
			CanInvoke = ""FALSE"";
			return (CancelOperation);
		}
	}
	if (MethodName == ""Cancel Reservation"")
	{
		var CusBo = TheApplication().ActiveBusObject();
     	var CusBc = CusBo.GetBusComp(""RMS NM MSISDN Details"");
     	var STCGroupCodeId = TheApplication().GetProfileAttr(""STC GroupCode Id"");
     	if ((STCGroupCodeId != """") && (CusBc.GetFieldValue(""Is Associated"") != ""Y"") &&   (CusBc.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"",""NM_NUMBER_STATUS"",""RESERVED"")))
     	{
     		CanInvoke = ""TRUE"";
			return (CancelOperation);
		}
		//else
		//{
			//CanInvoke = ""FALSE"";
			//return (CancelOperation);
		//}
	}
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
   var sReserve;
   try {
   if(MethodName == ""Reserve"" || MethodName == ""Cancel Reservation"")                  
   //sReserve = this.GetFieldValue(""Customer Id""); 
   sReserve = this.BusComp().GetFieldValue(""Customer Id"");
   
      if (sReserve == ""null""|| sReserve == """") 
      {
         TheApplication().RaiseErrorText(""Please Enter Customer Id"");
         return (CancelOperation);

      }
      else {
         return (ContinueOperation);
      }
   }
   catch (e) {
      throw e;
   }


}
"/**************************************************************************************
* Name          : RMS NM Number Allocation WebApplet_PreCanInvoke Method  		 	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Allocation Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 07/05/05 		 2.0   		MBT						   	Created      07/05/05 	      *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){
	switch (MethodName){
		case ""NewQuery"" : 
			TheApplication().SetSharedGlobal(""g_isAllocatedEnabled"",""N"");
			break;
		case ""ExecuteQuery"" :
			TheApplication().SetSharedGlobal(""g_isAllocatedEnabled"",""Y"");
			break;
		case ""UndoQuery"":
			TheApplication().SetSharedGlobal(""g_isAllocatedEnabled"",""Y"");
			break;
	}				
}
"/**************************************************************************************
* Name          : RMS NM Number Allocation WebApplet_PreCanInvoke Method  		 	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Allocation Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 02/12/2003 	1.0   		MBT						   	Created      05/12/2003       *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){
	
	var bcNumberAlloc 	= this.BusComp();
	var intReturn		= ContinueOperation;
	
	switch (MethodName){
		case ""Allocate"" : 
			if((bcNumberAlloc.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) &&  (bcNumberAlloc.GetFieldValue(""Operation"") == TheApplication().InvokeMethod(""LookupValue"", ""NM_ALLOCATION_OPERATION"", ""ALLOCATE"")) && ((TheApplication().GetSharedGlobal(""g_isAllocatedEnabled"")==""Y"") || (TheApplication().GetSharedGlobal(""g_isAllocatedEnabled"")=="""")))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";	
			intReturn = CancelOperation;
			break;
		case ""Deallocate"" :
			if((bcNumberAlloc.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) &&  (bcNumberAlloc.GetFieldValue(""Operation"") == TheApplication().InvokeMethod(""LookupValue"", ""NM_ALLOCATION_OPERATION"", ""DEALLOCATE"")) && ((TheApplication().GetSharedGlobal(""g_isAllocatedEnabled"")==""Y"") || (TheApplication().GetSharedGlobal(""g_isAllocatedEnabled"")=="""")))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";	
			intReturn = CancelOperation;
			break;
			
		case ""CopyRecord"" :				
			CanInvoke = ""False"";
		  	intReturn = CancelOperation;
			break;
			
		case ""DeleteRecord"":
			if(bcNumberAlloc.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""COMPLETE"") || bcNumberAlloc.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PROCESSING""))			
				CanInvoke = ""FALSE"";
			else
				CanInvoke = ""TRUE"";
		  	intReturn = CancelOperation;
		  	break;
	}	

	return(intReturn);
}
"/**************************************************************************************
* Name          : RMS NM Number Allocation Form Applet getLIC Method  		 	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Allocation Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 02/12/2003 	1.0   		MBT						   	Created      05/12/2003       *
20060706        1.1         Prasad Siebel ES SCR1, Objects Destroyed
**************************************************************************************/


function getLIC(lang, type, value)
{
    var lovBusObj = TheApplication().GetBusObject(""List Of Values"");
    var lovBusComp = lovBusObj.GetBusComp(""List Of Values"");
    var name;

    lovBusComp.SetSearchSpec(""Language"", lang);
    lovBusComp.SetSearchSpec(""Type"", type);
    lovBusComp.SetSearchSpec(""Value"", value);
    lovBusComp.ExecuteQuery();
    if(lovBusComp.FirstRecord())
        name = lovBusComp.GetFieldValue(""Name"");

    lovBusComp = null;
//1.1 below
	lovBusObj = null;
//1.1 above
    return(name);
}
"/**************************************************************************************
* Name          : RMS NM Number Allocation WebApplet_PreCanInvoke Method  		 	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Allocation Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 02/12/2003 	1.0   		MBT						   	Created      05/12/2003       *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){
	switch (MethodName){
		case ""NewQuery"" : 
			TheApplication().SetSharedGlobal(""g_isAllocatedEnabled"",""N"");
			break;
		case ""ExecuteQuery"" :
			TheApplication().SetSharedGlobal(""g_isAllocatedEnabled"",""Y"");
			break;
		case ""UndoQuery"":
			TheApplication().SetSharedGlobal(""g_isAllocatedEnabled"",""Y"");
			break;
	}				
}
"/**************************************************************************************
* Name          : RMS NM Number Allocation WebApplet_PreCanInvoke Method  		 	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Allocation Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 02/12/2003 	1.0   		MBT						   	Created      05/12/2003       *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){
	
	var bcNumberAlloc 	= this.BusComp();
	var intReturn		= ContinueOperation;
	
	switch (MethodName){
		case ""Allocate"" : 
			if((bcNumberAlloc.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) &&  (bcNumberAlloc.GetFieldValue(""Operation"") == TheApplication().InvokeMethod(""LookupValue"", ""NM_ALLOCATION_OPERATION"", ""ALLOCATE"")) && ((TheApplication().GetSharedGlobal(""g_isAllocatedEnabled"")==""Y"") || (TheApplication().GetSharedGlobal(""g_isAllocatedEnabled"")=="""")))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";	
			intReturn = CancelOperation;
			break;
		case ""Deallocate"" :
			if((bcNumberAlloc.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) &&  (bcNumberAlloc.GetFieldValue(""Operation"") == TheApplication().InvokeMethod(""LookupValue"", ""NM_ALLOCATION_OPERATION"", ""DEALLOCATE"")) && ((TheApplication().GetSharedGlobal(""g_isAllocatedEnabled"")==""Y"") || (TheApplication().GetSharedGlobal(""g_isAllocatedEnabled"")=="""")))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";	
			intReturn = CancelOperation;
			break;
			
		case ""CopyRecord"" :				
			CanInvoke = ""False"";
		  	intReturn = CancelOperation;
			break;
			
		case ""DeleteRecord"":
			if(bcNumberAlloc.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""COMPLETE"") || bcNumberAlloc.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PROCESSING""))			
				CanInvoke = ""FALSE"";
			else
				CanInvoke = ""TRUE"";
		  	intReturn = CancelOperation;
		  	break;
	}	

	return(intReturn);
}
"/*
---------------+------+--------+----------------------------------------------
Date(YYYYMMDD) | Ver  | By     | Description of Change
---------------+------+--------+----------------------------------------------
????????       | 1.0  | TM     | Creation
20060706       | 1.1  | Prasad | Siebel ES SCR1, Objects Destroyed
---------------+------+--------+----------------------------------------------
*/
function getLIC(lang, type, value)
{
    var lovBusObj = TheApplication().GetBusObject(""List Of Values"");
    var lovBusComp = lovBusObj.GetBusComp(""List Of Values"");
    var name;

    lovBusComp.SetSearchSpec(""Language"", lang);
    lovBusComp.SetSearchSpec(""Type"", type);
    lovBusComp.SetSearchSpec(""Value"", value);
    lovBusComp.ExecuteQuery();
    if(lovBusComp.FirstRecord())
        name = lovBusComp.GetFieldValue(""Name"");

    lovBusComp = null;
//1.1 below
    lovBusObj = null;
//1.1 above
    return(name);
}
"/**************************************************************************************
* Name          : RMS NM Number Allocation WebApplet_Invoke Method      		 	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Allocation Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 02/12/2003 	1.0   		MBT						   	Created      05/12/2003       *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){
	switch (MethodName){
		case ""NewQuery"" : 
			TheApplication().SetSharedGlobal(""g_isAllocatedEnabled"",""N"");
			break;
		case ""ExecuteQuery"" :
			TheApplication().SetSharedGlobal(""g_isAllocatedEnabled"",""Y"");
			break;
		case ""UndoQuery"":
			TheApplication().SetSharedGlobal(""g_isAllocatedEnabled"",""Y"");
			break;
	}				
}
"/**************************************************************************************
* Name          : RMS NM Number Allocation WebApplet_PreCanInvoke Method  		 	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Allocation Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 02/12/2003 	1.0   		MBT						   	Created      05/12/2003       *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){	
	
	var bcNumberAlloc 	= this.BusComp();
	var intReturn		= ContinueOperation;
	
	switch (MethodName){
		case ""Allocate"" : 
			if((bcNumberAlloc.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) &&  (bcNumberAlloc.GetFieldValue(""Operation"") == TheApplication().InvokeMethod(""LookupValue"", ""NM_ALLOCATION_OPERATION"", ""ALLOCATE"")) && ((TheApplication().GetSharedGlobal(""g_isAllocatedEnabled"")==""Y"") || (TheApplication().GetSharedGlobal(""g_isAllocatedEnabled"")=="""")))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";	
			intReturn = CancelOperation;
			break;
		case ""Deallocate"" :
			if((bcNumberAlloc.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) &&  (bcNumberAlloc.GetFieldValue(""Operation"") == TheApplication().InvokeMethod(""LookupValue"", ""NM_ALLOCATION_OPERATION"", ""DEALLOCATE"")) && ((TheApplication().GetSharedGlobal(""g_isAllocatedEnabled"")==""Y"") || (TheApplication().GetSharedGlobal(""g_isAllocatedEnabled"")=="""")))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";	
			intReturn = CancelOperation;
			break;
			
		case ""CopyRecord"" :				
			CanInvoke = ""False"";
		  	intReturn = CancelOperation;
			break;
			
		case ""DeleteRecord"":
					
			if(bcNumberAlloc.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""COMPLETE"") || bcNumberAlloc.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PROCESSING""))			
				CanInvoke = ""FALSE"";
			else
				CanInvoke = ""TRUE"";
		  	intReturn = CancelOperation;
		  	break;
		}	

	return(intReturn);
}
"/**************************************************************************************
* Name          : RMS NM Number Allocation WebApplet_Invoke Method      		 	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Allocation Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 02/12/2003 	1.0   		MBT						   	Created      05/12/2003       *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){
	switch (MethodName){
		case ""NewQuery"" : 
			TheApplication().SetSharedGlobal(""g_isAllocatedEnabled"",""N"");
			break;
		case ""ExecuteQuery"" :
			TheApplication().SetSharedGlobal(""g_isAllocatedEnabled"",""Y"");
			break;
		case ""UndoQuery"":
			TheApplication().SetSharedGlobal(""g_isAllocatedEnabled"",""Y"");
			break;
	}				
}
"/**************************************************************************************
* Name          : RMS NM Number Allocation WebApplet_PreCanInvoke Method  		 	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Allocation Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 02/12/2003 	1.0   		MBT						   	Created      05/12/2003       *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){	
	
	var bcNumberAlloc 	= this.BusComp();
	var intReturn		= ContinueOperation;
	
	switch (MethodName){
		case ""Allocate"" : 
			if((bcNumberAlloc.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) &&  (bcNumberAlloc.GetFieldValue(""Operation"") == TheApplication().InvokeMethod(""LookupValue"", ""NM_ALLOCATION_OPERATION"", ""ALLOCATE"")) && ((TheApplication().GetSharedGlobal(""g_isAllocatedEnabled"")==""Y"") || (TheApplication().GetSharedGlobal(""g_isAllocatedEnabled"")=="""")))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";	
			intReturn = CancelOperation;
			break;
		case ""Deallocate"" :
			if((bcNumberAlloc.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) &&  (bcNumberAlloc.GetFieldValue(""Operation"") == TheApplication().InvokeMethod(""LookupValue"", ""NM_ALLOCATION_OPERATION"", ""DEALLOCATE"")) && ((TheApplication().GetSharedGlobal(""g_isAllocatedEnabled"")==""Y"") || (TheApplication().GetSharedGlobal(""g_isAllocatedEnabled"")=="""")))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";	
			intReturn = CancelOperation;
			break;
			
		case ""CopyRecord"" :				
			CanInvoke = ""False"";
		  	intReturn = CancelOperation;
			break;
			
		case ""DeleteRecord"":
					
			if(bcNumberAlloc.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""COMPLETE"") || bcNumberAlloc.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PROCESSING""))			
				CanInvoke = ""FALSE"";
			else
				CanInvoke = ""TRUE"";
		  	intReturn = CancelOperation;
		  	break;
		}	

	return(intReturn);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if(MethodName == ""Find"")
		TheApplication().SetSharedGlobal(""g_blnIsFind"",""Y"");

	return (ContinueOperation);
}
"/**************************************************************************************
* Name          : RMS NM Number Association Master Applet WebApplet_PreCanInvokeMethod	
* Author        : Mahindra British Telecom										      *
* Description   : RMS NM Number Association Code File                        		  *
* Amendment Details																	  *
***************************************************************************************
* Date   		 Version  		AmendedBy    		 Comments    	 Reviewed Date    *
***************************************************************************************
* 31/12/2003 		1.0   			MBT   				Created       31/12/2003      *
**************************************************************************************/



function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke) {
		
	switch (MethodName)	 {
	
		case ""CopyRecord"" : 
		
			CanInvoke = ""FALSE"";
			return(CancelOperation);
			break;
	
		case ""DeleteRecord"" :
		
			var	bcNumAssocMstr = this.BusComp();
			//bcNumAssocMstr.ActivateField(""Status"");
				
			if (bcNumAssocMstr.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""ASSOCIATED"")) {		
			
				CanInvoke = ""FALSE"";
			
			} else {
				
				CanInvoke = ""TRUE"";
			}
			bcNumAssocMstr = null;
			return(CancelOperation);
			break;

	}//end of switch
	
		
		
		return (ContinueOperation);
}
"/**************************************************************************************
* Name 			: WebApplet_PreCanInvokeMethod 										  *
* Author 		: MBT 																  *
* Description 	: The above said function enables/disbles the various actions         *
*				  based on various conditions                                         *
*                                                                                     *
* Ammendment Details                                                                  *
***************************************************************************************
* Date 			Version 	AmmendedBy					Comments 	  	              *
***************************************************************************************
*                                                                                     *
* 18/12/2003	1.0			MBT							Created	 				      *
**************************************************************************************/


function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke) {

 	 
	switch (MethodName)	 {
	
		case ""CopyRecord"" : 
		
			CanInvoke = ""FALSE"";
			return(CancelOperation);
			break;
	
		case ""DeleteRecord"" :
	
			
		var	bcNumAssocMstr = this.BusComp();
			//bcNumAssocMstr.ActivateField(""Status"");
			
		
			if (bcNumAssocMstr.GetFieldValue(""Status"") ==  TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""ASSOCIATED"")){		
			
				CanInvoke = ""FALSE"";
				
			} else {
				
				CanInvoke = ""TRUE"";
			}
			bcNumAssocMstr = null;	
			return(CancelOperation);
			break;

	}// end of switch	
	
	
	return (ContinueOperation);

}
"/**************************************************************************************
* Name          : RMS NM Number Association WebApplet_PreCanInvokeMethod Method   	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Association Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 30/12/2003 	1.0   		MBT						   	Created      28/12/2003       *
**************************************************************************************/


function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke) {
	
	var boNumAssoc,bcNumAssocMstr;

	boNumAssoc = TheApplication().ActiveBusObject();
	bcNumAssocMstr = boNumAssoc.GetBusComp(""RMS NM Number Association Master"");
	//bcNumAssocMstr.ActivateField(""Status""); KT commneted 21-06-06
	
	
	switch (MethodName)	 {
	
		case ""AssociateNumbers"" : 

	
			if (MethodName == ""AssociateNumbers"") {
	
				if (bcNumAssocMstr.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) {		
						
					CanInvoke = ""TRUE"";

				} else {
		
					CanInvoke = ""FALSE"";
				}

				return(CancelOperation);	
				break;
			} 


		case ""DeassociateNumbers"" : 

			if (bcNumAssocMstr.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""ASSOCIATED"")) {
			
				CanInvoke = ""TRUE"";
			
			} else {
			
				CanInvoke = ""FALSE"";
			}
			
			return(CancelOperation);
		 	break;

	
		case ""NewQuery"" :
			
			CanInvoke = ""FALSE"";
			return(CancelOperation);
			break;
		
	}//end of switch

	bcNumAssocMstr = null;
	return (ContinueOperation);
}
"/*************************************************************************************
* Name          : RMS NM Number Association WebApplet_PreCanInvokeMethod Method   	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Association Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    	Ver     By     		Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
30/12/2003 	 1.0   	MBT		    Created      28/12/2003       *
20060628     1.1    Prasad      SiebelES#10, UNnecessary ActivateField commented out
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke) {

	var boNumAssoc,bcNumAssocMstr;
	boNumAssoc = TheApplication().ActiveBusObject();
	bcNumAssocMstr = boNumAssoc.GetBusComp(""RMS NM Number Association Master"");
//	bcNumAssocMstr.ActivateField(""Status"");
	
	switch (MethodName)	 {
	
		case ""AssociateNumbers"" : 
		
			if (bcNumAssocMstr.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) {		
				
					CanInvoke = ""TRUE"";
		
			} else {
					
					CanInvoke = ""FALSE"";
			}
		
			return(CancelOperation);	
			break;
	
		case ""DeassociateNumbers"" :  
	
			if (bcNumAssocMstr.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""ASSOCIATED"")) {		
			
				CanInvoke = ""TRUE"";
			
			} else {
				
				CanInvoke = ""FALSE"";
			}
			
			return(CancelOperation);
			break;
		
/*
//no control on the applet has this method invoked
		case ""EstimateEndNumber"":
			
			if (bcNumAssocMstr.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) {		
				
					CanInvoke = ""TRUE"";
		
			} else {
					
					CanInvoke = ""FALSE"";
			}
		
			return(CancelOperation);
			break;	
*/			
		case ""NewQuery"" :
			
			CanInvoke = ""FALSE"";
			return(CancelOperation);
			break;
			

	}//end of switch	 
	

	return (ContinueOperation);
	bcNumAssocMstr = null;
	
}
"/**************************************************************************************
* Name          : RMS NM Number Block List Applet PreCanInvoke Method			 	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Scheme Code File                      				  *
*																					  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 01/12/2003	1.0   		  MBT					   	Created       02/12/2003      *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	var bcNumberBlock;
	var intCurrCount = 0; 
	var intReturn = ContinueOperation;
	
//---------------------------------------------------------
// If any number has been generated for that block then
// cannot delete that block.
//---------------------------------------------------------
	
	if (MethodName == ""DeleteRecord""){
		bcNumberBlock = this.BusComp();
		with(bcNumberBlock) {
			intCurrCount  = ToNumber(GetFieldValue(""Current Quantity""));
		}
		if(intCurrCount > 0)
			CanInvoke = ""FALSE"";
		else
			CanInvoke = ""TRUE"";
		bcNumberBlock = null;					
		intReturn = CancelOperation;			
	}
	return (intReturn);
}
function WebApplet_InvokeMethod (MethodName)
{
	if(MethodName == ""NewQuery"")
		TheApplication().SetSharedGlobal(""blnIsUpdateEnabled"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"")
		TheApplication().SetSharedGlobal(""blnIsUpdateEnabled"",""Y"");
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var intReturn =ContinueOperation;
	var bcDeployDetail;

	bcDeployDetail = this.BusComp();
	
	if(MethodName == ""UpdateNumbers""){
		intReturn = CancelOperation;
		if(bcDeployDetail.GetFieldValue(""Result"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")
											 && 
			(TheApplication().GetSharedGlobal(""blnIsUpdateEnabled"")==""Y"" || TheApplication().GetSharedGlobal(""blnIsUpdateEnabled"") == """"))
			
			CanInvoke = ""TRUE"";
		else 
			CanInvoke = ""FALSE"";
		return(intReturn);
	}
	
	if(MethodName == ""NewRecord""){
		intReturn =CancelOperation;
		CanInvoke = ""FALSE"";
		return(intReturn);
	}
	return(intReturn);
	/*if(MethodName == ""UpdateNumbers"")
	{
		CanInvoke = ""TRUE"";
		return(CancelOperation);
	}	
	return (ContinueOperation);
	*/
}
"/**************************************************************************************
* Name 			: NM Number Enquiry Form applet WebApplet_PreCanInvokeMethod Method   *
*				  	 									 							  *
* Author 		: Mahindra British Telecom 										      *
* Description 	: Code file for NM Number Enquiry List applet 	                	  *
***************************************************************************************
* Date 			Version 	AmmendedBy			Comments     Reviewed Date	  	      *
***************************************************************************************
*                                                                                     *
* 22/12/2003	1.0			MBT(Pune)			Created	      22/12/2003              *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	var intReturn = ContinueOperation;

	switch(MethodName){
		case ""ChangeReservation"":
			var strStatus = this.BusComp().GetFieldValue(""Status"");
			var dtReservDate = new Date(this.BusComp().GetFieldValue(""Reservation End Date""));
			var dtCurrentDate = new Date(this.BusComp().GetFieldValue(""Current Date""));
			if(strStatus == TheApplication().InvokeMethod(""LookupValue"", ""NM_NUMBER_STATUS"", ""RESERVED"")
				&& (dtReservDate.getDay() == dtCurrentDate.getDay())
				&& (dtReservDate.getMonth() == dtCurrentDate.getMonth())
				&& (dtReservDate.getYear() == dtCurrentDate.getYear()) ){
					CanInvoke = ""TRUE"";
			}
			else{
					CanInvoke = ""FALSE"";
			}		
		intReturn =CancelOperation;
	}

	return (intReturn);
}
function WebApplet_PreInvokeMethod (MethodName)
{
		if(MethodName == ""TestQuery"") //Instead of Query We are calling our own custom method. Test Query
		{
		TheApplication().SetProfileAttr(""QueryMe"",""N"");
		this.BusComp().SetSearchSpec(""Id"","""");
		this.BusComp().ExecuteQuery();
		this.InvokeMethod(""NewQuery"");//New query is executed on the default applet in the view
		return(CancelOperation);
		}
	var busSer;
	var boRMSNumberEnquiry;
	var bcRMSNumberEnquiry;
	var appObj = TheApplication();
	try
	{		
		boRMSNumberEnquiry = TheApplication().GetBusObject(""RMS NM Number Enquiry"");
		bcRMSNumberEnquiry = boRMSNumberEnquiry.GetBusComp(""RMS NM Number Enquiry"");
			if (MethodName == ""RecycleNumber"")
			{
				var MSISDN = this.BusComp().GetFieldValue(""Number String"");
				var StrSerAccBO = appObj.GetBusObject(""STC Thin Service Account BO"").GetBusComp(""STC Thin CUT Service Sub Accounts"");
				with(StrSerAccBO)
				{
					ActivateField(""Number String"");
					SetViewMode(AllView);
					ClearToQuery();
					var spec  = ""[Account Status] <> 'Terminated' AND [DUNS Number] = '"" + MSISDN + ""'"";
					SetSearchExpr(spec);
					ExecuteQuery(ForwardOnly); 
					var isRec = FirstRecord();
					if(isRec)
					{
						appObj.RaiseErrorText(""The termination of this number is pending"");
						return(CancelOperation);
					}
					else
					{
						var STCInputs  = appObj.NewPropertySet();
						var STCOutputs  = appObj.NewPropertySet();
						var StrBS = appObj.GetService(""STC RMS Number Recycle Service"");
						STCInputs.SetProperty(""MSISDN"",MSISDN);
						StrBS.InvokeMethod(""UpdateNumbers"", STCInputs, STCOutputs);
						this.BusComp().ExecuteQuery();
					}  
				}
			return (CancelOperation);
			}

		else
			return (ContinueOperation);
 	}
 	catch(e){
 		throw(e);
 	}
 	finally
 	{
 	}
 }
"/**************************************************************************************
* Name          : RMS NM Number Format List Applet Invoke Method					  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Format Code File            	                      *
*                                                                                     *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 20/11/2003 	 1.0   		MBT   						Created       24/11/2003	  *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){
	if(MethodName == ""NewQuery"")
		TheApplication().SetSharedGlobal(""g_flgIsReleaseEnabled"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"")
		TheApplication().SetSharedGlobal(""g_flgIsReleaseEnabled"",""Y"");
}
"/**************************************************************************************
* Name          : RMS NM Number Format List Applet PreCanInvoke Method				  * 
* Author        : Mahindra British Telecom                              	          *
* Description   : RMS NM Number Format Code File            	                      *
*                                                                                     *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 22/11/2003 	 1.0   		MBT						   	Created       24/11/2003	  *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	var intReturn = ContinueOperation;
	
	var bcNumFormat;
	var bcNumType;
					
	if (MethodName == ""ValidateFormat"") {
		
		bcNumFormat = this.BusComp();
		bcNumType = bcNumFormat.ParentBusComp();
	
		if (bcNumType.GetFieldValue(""Valid"") == ""Y"" || TheApplication().GetSharedGlobal(""g_flgIsReleaseEnabled"")==""N"" || bcNumFormat.GetFieldValue(""Sequence"") == """")
			CanInvoke = ""FALSE"";
		else
			CanInvoke = ""TRUE"";
		
		intReturn 	= CancelOperation;
		
		bcNumType 	= null;
		bcNumFormat = null;
	
	}
	return(intReturn);
}
"/**************************************************************************************
* Name          : RMS NM Number Generation Form Applet Invoke Method 	        	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Generation Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 02/12/2003 	1.0   		MBT						   	Created      02/12/2003       *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){

//Disabling the Generate and cancel generate button when querying
	if(MethodName == ""NewQuery"")
		TheApplication().SetSharedGlobal(""g_blnReleaseEnabled"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"")
		TheApplication().SetSharedGlobal(""g_blnReleaseEnabled"",""Y"");

}
"/**************************************************************************************
* Name          : RMS NM Number Generation Form Applet PreCanInvoke Method           * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Generation Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 02/12/2003 	1.0   		MBT						   	Created      12/12/2003       *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){	
		
	var bcNumberGeneration = this.BusComp();
	var intReturn = ContinueOperation;
	
	switch (MethodName){
	
	case ""GenerateNumbers"" : 
//			if((bcNumberGeneration.GetFieldValue(""Type Identifier"")== TheApplication().InvokeMethod(""LookupValue"", ""NM_TYPE_IDENTIFIER"", ""SIM"") || bcNumberGeneration.GetFieldValue(""Type Identifier"")== TheApplication().InvokeMethod(""LookupValue"", ""NM_TYPE_IDENTIFIER"", ""IMSI"") )&&(bcNumberGeneration.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) && (TheApplication().GetSharedGlobal(""g_blnReleaseEnabled"")==""Y"" || TheApplication().GetSharedGlobal(""g_blnReleaseEnabled"")==""""))
			if((bcNumberGeneration.GetFieldValue(""Type Identifier"")== TheApplication().InvokeMethod(""LookupValue"", ""NM_TYPE_IDENTIFIER"", ""SIM"") || bcNumberGeneration.GetFieldValue(""Type Identifier"")== TheApplication().InvokeMethod(""LookupValue"", ""NM_TYPE_IDENTIFIER"", ""IMSI"") || bcNumberGeneration.GetFieldValue(""Type Identifier"")== TheApplication().InvokeMethod(""LookupValue"", ""NM_TYPE_IDENTIFIER"", ""MSISDN"") )&&(bcNumberGeneration.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) && (TheApplication().GetSharedGlobal(""g_blnReleaseEnabled"")==""Y"" || TheApplication().GetSharedGlobal(""g_blnReleaseEnabled"")==""""))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";
			intReturn = CancelOperation;			
			break;
		
		
		case ""CancelGeneratedNumbers"" :
			if((bcNumberGeneration.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""GENERATED"")) &&(TheApplication().GetSharedGlobal(""g_blnReleaseEnabled"")==""Y"" || TheApplication().GetSharedGlobal(""g_blnReleaseEnabled"")==""""))			
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";
			intReturn = CancelOperation;			
			break;
		
		case ""DeleteRecord"":
			if((bcNumberGeneration.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) &&(TheApplication().GetSharedGlobal(""g_blnReleaseEnabled"")==""Y"" || TheApplication().GetSharedGlobal(""g_blnReleaseEnabled"")==""""))			
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";
		
			intReturn = CancelOperation;			
			break;
			
		case ""ShowPopup"":
			CanInvoke = ""TRUE"";
			intReturn = CancelOperation;			
			break;	
			
	}
	
	bcNumberGeneration =null;
	return (intReturn);
}
"/**************************************************************************************
* Name          : RMS NM Number Generation List Applet Invoke Method 	        	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Generation Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 02/12/2003 	1.0   		MBT						   	Created      12/12/2003       *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){
var intReturn 	= ContinueOperation;
//Disabling the Generate and cancel generate button when querying
	if(MethodName == ""NewQuery"")
		TheApplication().SetSharedGlobal(""g_blnReleaseEnabled"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"")
		TheApplication().SetSharedGlobal(""g_blnReleaseEnabled"",""Y"");
/*	else if(MethodName == ""Special_Numbers"")
	{

		var bcNumberGeneration = this.BusComp();
//		var intReturn 	= ContinueOperation;
		var psInput		= 	TheApplication().NewPropertySet();
		var psOutput 	= 	TheApplication().NewPropertySet();
		var bsNumGen 	= 	TheApplication().GetService(""RMS NM Number Generation"");
		var intObjectId = 	bcNumberGeneration.GetFieldValue(""Id"");


		psInput.SetProperty(""Object Id"", intObjectId);
		bsNumGen.InvokeMethod(""Special_Numbers"",psInput,psOutput);
		intReturn = CancelOperation;

		bcNumberGeneration =null;
	
	}
*/

	return (intReturn);

}
"/**************************************************************************************
* Name          : RMS NM Number Generation List Applet PreCanInvoke Method           * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Generation Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 02/12/2003 	V1.0   		MBT					   	Created      	12/12/2003        *
* 28/03/2005	V2.0		MBT					Kadali Srinivas		28/03/2005		  *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){	
		
	var bcNumberGeneration = this.BusComp();
	var intReturn = ContinueOperation;
	
	switch (MethodName){
	
		case ""GenerateNumbers"" : 
//V2.0		if((bcNumberGeneration.GetFieldValue(""Type Identifier"")== TheApplication().InvokeMethod(""LookupValue"", ""NM_TYPE_IDENTIFIER"", ""SIM"") || bcNumberGeneration.GetFieldValue(""Type Identifier"")== TheApplication().InvokeMethod(""LookupValue"", ""NM_TYPE_IDENTIFIER"", ""IMSI"") )&&(bcNumberGeneration.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) && (TheApplication().GetSharedGlobal(""g_blnReleaseEnabled"")==""Y"" || TheApplication().GetSharedGlobal(""g_blnReleaseEnabled"")==""""))
			if((bcNumberGeneration.GetFieldValue(""Type Identifier"")== TheApplication().InvokeMethod(""LookupValue"", ""NM_TYPE_IDENTIFIER"", ""SIM"") || bcNumberGeneration.GetFieldValue(""Type Identifier"")== TheApplication().InvokeMethod(""LookupValue"", ""NM_TYPE_IDENTIFIER"", ""IMSI"") || bcNumberGeneration.GetFieldValue(""Type Identifier"")== TheApplication().InvokeMethod(""LookupValue"", ""NM_TYPE_IDENTIFIER"", ""MSISDN"") )&&(bcNumberGeneration.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) && (TheApplication().GetSharedGlobal(""g_blnReleaseEnabled"")==""Y"" || TheApplication().GetSharedGlobal(""g_blnReleaseEnabled"")==""""))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";
			intReturn = CancelOperation;			
			break;
		
		
		case ""CancelGeneratedNumbers"" :
			if((bcNumberGeneration.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""GENERATED"")) &&(TheApplication().GetSharedGlobal(""g_blnReleaseEnabled"")==""Y"" || TheApplication().GetSharedGlobal(""g_blnReleaseEnabled"")==""""))			
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";
			intReturn = CancelOperation;			
			break;
		
		case ""DeleteRecord"":
			if((bcNumberGeneration.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) &&(TheApplication().GetSharedGlobal(""g_blnReleaseEnabled"")==""Y"" || TheApplication().GetSharedGlobal(""g_blnReleaseEnabled"")==""""))			
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";
		
			intReturn = CancelOperation;			
			break;
			
		case ""ShowPopup"":
			CanInvoke = ""TRUE"";
			intReturn = CancelOperation;			
			break;	

		case ""Special_Numbers"":
			if(bcNumberGeneration.GetFieldValue(""Type Identifier"")== TheApplication().InvokeMethod(""LookupValue"", ""NM_TYPE_IDENTIFIER"", ""MSISDN""))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";
		
				intReturn = CancelOperation;			
				break;
			
	}
	
	bcNumberGeneration =null;
	return (intReturn);
}
function WebApplet_PreInvokeMethod (MethodName)
{
/*	var bcNumberGeneration = this.BusComp();
	var intReturn = ContinueOperation;


	if(MethodName == ""Special_Numbers"")
	{
		var psInput		= 	TheApplication().NewPropertySet();
		var psOutput 	= 	TheApplication().NewPropertySet();
		var bsNumGen 	= 	TheApplication().GetService(""RMS NM Number Generation"");
		var intObjectId = 	bcNumberGeneration.GetFieldValue(""Id"");


		psInput.SetProperty(""Object Id"", intObjectId);
		bsNumGen.InvokeMethod(""Special_Numbers"",psInput,psOutput);
		intReturn = CancelOperation;
	
	}

	bcNumberGeneration =null;
	return (intReturn);
*/
	return (ContinueOperation);
}
"/**************************************************************************************
* Name 			: NM Number inventory Maintainance Form Applet Invoke Method	      *
* Author 		: Mahindra British Telecom											  *	
* Description 	: Code file for NM Number inventory Maintainance			          * 				  	
* Ammendment Details:																  *
***************************************************************************************
* Date 			Version 	AmmendedBy			Comments 	  	Reviewed Date         *
***************************************************************************************
*                                                                                     *
* 10/12/2003	1.0			MBT					Created	         11/12/2003           *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){
	if(MethodName == ""NewQuery"")
		TheApplication().SetSharedGlobal(""g_blnChangeInvEnabled"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"")
		TheApplication().SetSharedGlobal(""g_blnChangeInvEnabled"",""Y"");

}
"/**************************************************************************************
* Name 			: NM Number inventory Maintainance Form Applet PreCanInvoke Method    *
* Author 		: Mahindra British Telecom											  *	
* Description 	: Code file for NM Number inventory Maintainance			          * 				  	
* Ammendment Details:																  *
***************************************************************************************
* Date 			Version 	AmmendedBy			Comments 	  	Reviewed Date         *
***************************************************************************************
*                                                                                     *
* 10/12/2003	1.0			MBT					Created	         11/12/2003           *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	var bcNumberInventory;
	
	var intReturn = ContinueOperation;
	
	bcNumberInventory = this.BusComp();
	
	switch (MethodName){
	
		case ""Change Inventory"" :
			if((bcNumberInventory.GetFieldValue(""Change Inventory Flag"") == ""N"")&&((TheApplication().GetSharedGlobal(""g_blnChangeInvEnabled"")==""Y"")||(TheApplication().GetSharedGlobal(""g_blnChangeInvEnabled"")=="""")))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";
				
			
     		intReturn =CancelOperation;
		break;

		case ""DeleteRecord"" :
			if(bcNumberInventory.GetFieldValue(""Change Inventory Flag"") ==""Y"")
				CanInvoke = ""FALSE"";
			else
				CanInvoke = ""TRUE"";
			
			intReturn =CancelOperation;
		break;
			
		case ""CopyRecord"":
			if(bcNumberInventory.GetFieldValue(""Change Inventory Flag"") ==""Y"")
				CanInvoke = ""FALSE"";
			else
				CanInvoke = ""TRUE"";
			intReturn =CancelOperation;
		break;
		
		case ""UndoRecord"":
			if(bcNumberInventory.GetFieldValue(""Change Inventory Flag"") ==""Y"")
				CanInvoke = ""FALSE"";
			else
				CanInvoke = ""TRUE"";
			intReturn =CancelOperation;
		break;
	}
	bcNumberInventory = null;	
	return (intReturn);
}
"/**************************************************************************************
* Name 			: NM Number inventory Maintainance List Applet Invoke Method	      *
* Author 		: Mahindra British Telecom											  *	
* Description 	: Code file for NM Number inventory Maintainance			          * 				  	
* Ammendment Details:																  *
***************************************************************************************
* Date 			Version 	AmmendedBy			Comments 	  	Reviewed Date         *
***************************************************************************************
*                                                                                     *
* 10/12/2003		1.0			MBT				Created	         11/12/2003           *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){
	if(MethodName == ""NewQuery"")
		TheApplication().SetSharedGlobal(""g_blnChangeInvEnabled"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"")
		TheApplication().SetSharedGlobal(""g_blnChangeInvEnabled"",""Y"");

}
"/**************************************************************************************
* Name 			: NM Number inventory Maintainance List Applet PreCanInvoke Method    *
* Author 		: Mahindra British Telecom											  *	
* Description 	: Code file for NM Number inventory Maintainance			          * 				  	
* Ammendment Details:																  *
***************************************************************************************
* Date 			Version 	AmmendedBy			Comments 	  	Reviewed Date         *
***************************************************************************************
*                                                                                     *
* 10/12/2003	1.0			MBT					Created	         11/12/2003           *
**************************************************************************************/
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	var bcNumberInventory;

	var intReturn = ContinueOperation;

	bcNumberInventory = this.BusComp();
	
	switch (MethodName){
		case ""Change Inventory"" :
			if((bcNumberInventory.GetFieldValue(""Change Inventory Flag"") == ""N"")&&((TheApplication().GetSharedGlobal(""g_blnChangeInvEnabled"")==""Y"")||(TheApplication().GetSharedGlobal(""g_blnChangeInvEnabled"")=="""")))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";
			intReturn =CancelOperation;
			break;

		case ""DeleteRecord"" :
			if(bcNumberInventory.GetFieldValue(""Change Inventory Flag"") ==""Y"")
				CanInvoke = ""FALSE"";
			else
				CanInvoke = ""TRUE"";
			intReturn =CancelOperation;
			break;
			
		case ""CopyRecord"":
			if(bcNumberInventory.GetFieldValue(""Change Inventory Flag"") ==""Y"")
				CanInvoke = ""FALSE"";
			else
				CanInvoke = ""TRUE"";
			intReturn =CancelOperation;
			break;
		
		case ""UndoRecord"":
			if(bcNumberInventory.GetFieldValue(""Change Inventory Flag"") ==""Y"")
				CanInvoke = ""FALSE"";
			else
				CanInvoke = ""TRUE"";
			intReturn =CancelOperation;
			break;
	}
	bcNumberInventory = null;	
	return (intReturn);
}
"/********************************************************************************************
* Name          : RMS NM Number Inventory Start Number Pick Applet WebApplet_Load Method  	*
* Author        : Mahindra British Telecom										      		*
* Description   : RMS NM Number Inventory Code File                        				*
* Amendment Details																	  		*
*********************************************************************************************
* Date   		 Version  		AmendedBy    		 Comments    	 Reviewed Date    		*
*********************************************************************************************
* 10/12/2003 		1.0   			MBT   				Created       11/12/2003      		*
********************************************************************************************/

function WebApplet_Load (){
/*
	var boNMInventory;
	var bcNMMaster;
	var bcNMInventory;
	var strSearchExpr="""";
	var strIsAssociated = ""Y"";
	
//--------------------------------------------------------------------------
//Creating a Search expression depending on the values filled in the applet.
//--------------------------------------------------------------------------
	TheApplication().SetSharedGlobal(""Expression"","""");
	
	boNMInventory = TheApplication().ActiveBusObject();
	bcNMInventory = boNMInventory.GetBusComp(""RMS NM Number Inventory Maintenance"");
	bcNMMaster    = this.BusComp();

	strSearchExpr = "" [Scheme Id] = '"" + bcNMInventory.GetFieldValue(""Scheme Id"") + ""'"";
	
//-------------------------------------------------------------------------------
// If status selected is 'Available' or 'Not Available' then display only those
// MSISDN numbers which are not associated.
//-------------------------------------------------------------------------------
		
	if(bcNMInventory.GetFieldValue(""From Status"") != """"){
		if((bcNMInventory.GetFieldValue(""From Status"") == TheApplication().InvokeMethod(""LookupValue"",""NM_INVENTORY_FROM_STATUS"", ""AVAILABLE""))
		 											|| 
		 	(bcNMInventory.GetFieldValue(""From Status"") == TheApplication().InvokeMethod(""LookupValue"",""NM_INVENTORY_FROM_STATUS"", ""NOT AVAILABLE"")))
 	
			strSearchExpr = strSearchExpr + "" AND [Is Associated] <> '"" + strIsAssociated + ""' AND [Status] = '"" + bcNMInventory.GetFieldValue(""From Status"") + ""'"";
		else
			strSearchExpr = strSearchExpr + "" AND [Status] = '"" + bcNMInventory.GetFieldValue(""From Status"") + ""'"";
	}
	
	if(bcNMInventory.GetFieldValue(""HLR Id"") != """")
		strSearchExpr = strSearchExpr + "" AND [HLR Id] = '"" + bcNMInventory.GetFieldValue(""HLR Id"") + ""'"";
	if(bcNMInventory.GetFieldValue(""From Class"") != """")
		strSearchExpr = strSearchExpr + "" AND [Class] = '"" + bcNMInventory.GetFieldValue(""From Class"") +	""'"";
	if(bcNMInventory.GetFieldValue(""From Type"") != """")
		strSearchExpr = strSearchExpr + "" AND [Special Category Type] = '"" + bcNMInventory.GetFieldValue(""From Type"") + ""'"";
	if(bcNMInventory.GetFieldValue(""From Price"") != """")
		strSearchExpr = strSearchExpr + "" AND [Price] = '"" + bcNMInventory.GetFieldValue(""From Price"") +	""'"";
		
	with(bcNMMaster){
		ClearToQuery();
		SetSearchExpr(strSearchExpr);
		ExecuteQuery();
	}
	
	TheApplication().SetSharedGlobal(""Expression"",strSearchExpr);	
	
	boNMInventory = null;
	bcNMInventory = null;
	bcNMMaster    = null;
	*/
}
"/********************************************************************************************
* Name          : RMS NM Number Inventory Start Number Pick Applet WebApplet_PreCanInvoke	*
* Author        : Mahindra British Telecom										      		*	
* Description   : RMS NM Number Inventory Code File                        				*
* Amendment Details																	  		*
*********************************************************************************************
* Date   		 Version  		AmendedBy    		 Comments    	 Reviewed Date    		*
*********************************************************************************************
* 10/12/2003 		1.0   			MBT   				Created       11/12/2003      		*
********************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	if(MethodName == ""ExecuteQuery""){

//--------------------------------------------------------------------------
//Creating a Search expression depending on the field values and the
//values filled in the Find control.
//--------------------------------------------------------------------------
	
		if(TheApplication().GetSharedGlobal(""g_blnIsFind"") == ""Y""){
		
			var strSearchExpr	= """";
			var strFindExpr     = """";			
			strFindExpr   = this.BusComp().GetSearchExpr();
			strSearchExpr = TheApplication().GetSharedGlobal(""Expression"");
			
			if (strFindExpr!="""")
				strSearchExpr = strSearchExpr + "" AND "" + strFindExpr;

			this.BusComp().ClearToQuery();
			this.BusComp().SetSearchExpr(strSearchExpr);
			this.BusComp().ExecuteQuery();
			TheApplication().SetSharedGlobal(""g_blnIsFind"","""")
		}	
	}
	return (ContinueOperation);
}
"/********************************************************************************************
* Name          : RMS NM Number Inventory Start Number Pick Applet WebApplet_PreInvoke    	*
* Author        : Mahindra British Telecom										      		*
* Description   : RMS NM Number Inventory Code File                        				*
* Amendment Details																	  		*
*********************************************************************************************
* Date   		 Version  		AmendedBy    		 Comments    	 Reviewed Date    		*
*********************************************************************************************
* 10/12/2003 		1.0   		MBT   				  Created         11/12/2003      		*
********************************************************************************************/

function WebApplet_PreInvokeMethod (MethodName){
	if(MethodName == ""Find"")
		TheApplication().SetSharedGlobal(""g_blnIsFind"",""Y"");
	return (ContinueOperation);
}
function WebApplet_InvokeMethod (MethodName)
{
	if(MethodName == ""Find""){
		if(this.BusComp().GetNamedSearch(""FindSpecific"") != """")
        	this.BusComp().SetNamedSearch(""FindSpecific"", """");
        this.BusComp().ExecuteQuery();

	}
}
"/**************************************************************************************
* Name          : RMS NM Number Master  Pick Applet WebApplet_Load Method  		  *
* Author        : Mahindra British Telecom										      *
* Description   : RMS NM Number Association Code File                        		  *
* Amendment Details																	  *
***************************************************************************************
* Date   		 Version  		AmendedBy    		 Comments    	 Reviewed Date    *
***************************************************************************************
* 31/12/2003 		1.0   			MBT   				Created       31/12/2003      *
**************************************************************************************/

function WebApplet_Load (){

	var boNMAsociation;
	var bcNMAssStartNum;
	var bcNMNumMaster;
	var strSearchExpr="""";
	
//--------------------------------------------------------------------------
//Creating a Search expression depending on the values filled in the applet.
//--------------------------------------------------------------------------
	TheApplication().SetSharedGlobal(""Expression"","""");
	
	boNMAsociation   = TheApplication().ActiveBusObject();
	bcNMAssStartNum  = boNMAsociation.GetBusComp(""RMS NM Number Association Start Number"");
	bcNMNumMaster    = this.BusComp();

	strSearchExpr = "" [Scheme Id] = '"" + bcNMAssStartNum.GetFieldValue(""Scheme Id"") + ""' AND [Block Id] = '""+bcNMAssStartNum.GetFieldValue(""Block Id"")+""' AND [Is Associated] = 'N' AND"" ;
	
//-----------------------------------------------------------------------------------------------------
// For MSISDN show availablle or not availabl numbers and for any other type show not-available numbers.
//-----------------------------------------------------------------------------------------------------
		
	if(bcNMAssStartNum.GetFieldValue(""Type Identifier"") == TheApplication().InvokeMethod(""LookupValue"",""NM_TYPE_IDENTIFIER"", ""MSISDN""))
		strSearchExpr = strSearchExpr + ""([Status] = '""+TheApplication().InvokeMethod(""LookupValue"",""NM_NUMBER_STATUS"", ""NOT AVAILABLE"")+""' OR [Status] = '""+TheApplication().InvokeMethod(""LookupValue"",""NM_NUMBER_STATUS"", ""AVAILABLE"")+""')"";
	else		
		strSearchExpr = strSearchExpr +""[Status] = '""+TheApplication().InvokeMethod(""LookupValue"",""NM_NUMBER_STATUS"", ""NOT AVAILABLE"")+""'"";
		
	with(bcNMNumMaster){
		ClearToQuery();
		SetSearchExpr(strSearchExpr);
		ExecuteQuery();
	}

	TheApplication().SetSharedGlobal(""Expression"",strSearchExpr);	
	
	boNMAsociation = null;
	bcNMAssStartNum = null;
	bcNMNumMaster = null;
	
}
"/**************************************************************************************
* Name          : RMS NM Number Master  Pick Applet WebApplet_PreCanInvokeMethod 	  *	
* Author        : Mahindra British Telecom										      *
* Description   : RMS NM Number Association Code File                        		  *
* Amendment Details																	  *
***************************************************************************************
* Date   		 Version  		AmendedBy    		 Comments    	 Reviewed Date    *
***************************************************************************************
* 31/12/2003 		1.0   			MBT   				Created       31/12/2003      *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){


	if(MethodName == ""ExecuteQuery""){

//--------------------------------------------------------------------------
//Creating a Search expression depending on the field values and the
//values filled in the Find control.
//--------------------------------------------------------------------------
	
		if(TheApplication().GetSharedGlobal(""g_blnIsFind"") == ""Y""){
		
			var strSearchExpr	= """";
			var strFindExpr     = """";			
			strFindExpr   = this.BusComp().GetSearchExpr();
			strSearchExpr = TheApplication().GetSharedGlobal(""Expression"");
			
			if(strFindExpr != """")
				strSearchExpr = strSearchExpr + "" AND "" + strFindExpr;

			this.BusComp().ClearToQuery();
			this.BusComp().SetSearchExpr(strSearchExpr);
			this.BusComp().ExecuteQuery();
			TheApplication().SetSharedGlobal(""g_blnIsFind"","""")
		}	
	}
	return (ContinueOperation);
}
"/**************************************************************************************
* Name          : NM Number Inventory Start Number Pick Applet WebApplet_PreInvoke    *
* Author        : Mahindra British Telecom										      *
* Description   : NM Number Inventory Code File                        				  *
* Amendment Details																	  *
***************************************************************************************
* Date   		 Version  		AmendedBy    		 Comments    	 Reviewed Date    *
***************************************************************************************
* 10/12/2003 		1.0   		MBT   				  Created         11/12/2003      *
**************************************************************************************/

function WebApplet_PreInvokeMethod (MethodName){
	if(MethodName == ""Find""){
		TheApplication().SetSharedGlobal(""g_blnIsFind"",""Y"");
		this.BusComp().SetNamedSearch(""FindSpecific"", ""1 = 0"");
	}
	return (ContinueOperation);
}
function WebApplet_InvokeMethod (MethodName)
{
	if(MethodName == ""NewQuery"")
		TheApplication().SetSharedGlobal(""blnIsUpdateEnabled"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"")
		TheApplication().SetSharedGlobal(""blnIsUpdateEnabled"",""Y"");

}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var intReturn =ContinueOperation;
	
	if(MethodName == ""ShowPopup""){
		intReturn = CancelOperation;
		if(TheApplication().GetSharedGlobal(""blnIsUpdateEnabled"")==""Y"" || TheApplication().GetSharedGlobal(""blnIsUpdateEnabled"") == """")
		
			CanInvoke = ""TRUE"";
		else
			CanInvoke = ""FALSE""
		return(intReturn);
	}
	if(MethodName == ""NewRecord""){
		intReturn =CancelOperation;
		CanInvoke = ""False"";
		return(intReturn);
	}
	return(intReturn);
	/*if(MethodName == ""Import"")
	{
		CanInvoke = ""TRUE"";
		return(CancelOperation);
	}	
	return (ContinueOperation); */
}
"/****************************************************************************************
* Name 			      : WebApplet_Load	 												*
* Author 		     : 	MBT (Mumbai-India)												*
* Description 	 : 		Sets the search specification, to fetch start numbers         	*
*                		based on 'Action' selected by the user							*
*																						*	
* Input params  :                                                                     	*
*																					  	*
* Output params : 																	 	*
* 																					  	*
*                                                                                     	*
* Ammendment Details                                                                  	*
*****************************************************************************************
* Date 						Version 				AmmendedBy			Comments 	  	*
*****************************************************************************************
*                       	                                            	            *
* 23/09/2002				1.0						MBT(Mumbai)			Created	        *
*****************************************************************************************/
function WebApplet_Load ()
{
	var boNumberReserve;
    var bcIVRModel;
    var bcNumberMaster;
    var bcNumberReserve;
    var intIVRModelNo = 1;
    var blnIsRecord;
    var strSrchExpr = """";
	var strSrchSts = """";    
    
    TheApplication().SetSharedGlobal(""Expression"","""");
   	boNumberReserve = this.BusObject();
   	bcNumberReserve = boNumberReserve.GetBusComp(""RMS NM Number Reservation For CSR"");
   	bcIVRModel     = boNumberReserve.GetBusComp(""RMS NM IVR Models"");

//--------------------------------------------------------------------------
//Creating a Search expression to fetch the inventories based on IVR model
//--------------------------------------------------------------------------

   	bcNumberMaster  = this.BusComp();
   	strSrchSts = ""[Status] = '""+TheApplication().InvokeMethod(""LookupValue"", ""NM_NUMBER_STATUS"", ""AVAILABLE"")+""'"";
  	if (bcNumberReserve.GetFieldValue(""Operation"") == TheApplication().InvokeMethod(""LookupValue"", ""NM_RESERVE_OPERATION"", ""RESERVE"")) {
   	
		with(bcIVRModel) {
			ActivateField(""Scheme Id"");
			ClearToQuery();
			SetSearchSpec(""IVR Model Number"",intIVRModelNo);
			ExecuteQuery();
			blnIsRecord = FirstRecord();
			if(FirstRecord())
				strSrchExpr = strSrchExpr + ""("";
			while(blnIsRecord) {
					strSrchExpr = strSrchExpr + ""[Scheme Id] = '""+GetFieldValue(""Scheme Id"")+""' OR "";
					blnIsRecord = NextRecord();
			}
			if(FirstRecord())
		    	strSrchExpr = strSrchExpr.substring(0,ToInteger(strSrchExpr.length)-3);
		}

//--------------------------------------------------------------------------------
//Query the Number Master for fetching the MSISDN numbers based on the inventories
//--------------------------------------------------------------------------------
		
		if(strSrchExpr != """"){
			strSrchExpr = strSrchExpr + "") AND "" + strSrchSts;
			with(bcNumberMaster) {
		   		ActivateField(""Scheme Id"");  
	    		ClearToQuery();
	    		SetSearchExpr(strSrchExpr);
	    		ExecuteQuery();
	    	}
	    }
	    else {
	    	strSrchExpr = ""[Scheme Id] = ''"";
			with(bcNumberMaster) {
		   		ActivateField(""Scheme Id"");  
	    		ClearToQuery();
	    		SetSearchExpr(strSrchExpr);
	    		ExecuteQuery();
	    	}
		}
		TheApplication().SetSharedGlobal(""Expression"",strSrchExpr);
   	}
   	
	boNumberReserve = null;
    bcIVRModel 		= null;
    bcNumberMaster 	= null;
    bcNumberReserve = null;

}
"/****************************************************************************************
* Name 			      : WebApplet_PreCanInvokeMethod 									*
* Author 		     : 	MBT (Mumbai-India)												*
* Description 	 : 		sets the search specification, to fetch start numbers         	*
*                		based on 'Action' selected by the user							*
*																						*	
* Input params  :                                                                     	*
*																					  	*
* Output params : 																	 	*
* 																					  	*
*                                                                                     	*
* Ammendment Details                                                                  	*
*****************************************************************************************
* Date 						Version 				AmmendedBy			Comments 	  	*
*****************************************************************************************
*                       	                                            	            *
* 23/09/2002				1.0						MBT(Mumbai)			Created	        *
*****************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{

	if(MethodName == ""ExecuteQuery""){

//--------------------------------------------------------------------------
//Creating a Search expression depending on the field values and the
//values filled in the Find control.
//--------------------------------------------------------------------------
	
		if(TheApplication().GetSharedGlobal(""IsFind"") == ""Y""){
		
			var strSearchExpr	= """";
			var strFindExpr     = """";			
			strFindExpr   = this.BusComp().GetSearchExpr();
			strSearchExpr = TheApplication().GetSharedGlobal(""Expression"");
			
			if(strFindExpr != """")		
				strSearchExpr = strSearchExpr + "" AND "" + strFindExpr;

			this.BusComp().ClearToQuery();
			this.BusComp().SetSearchExpr(strSearchExpr);
			this.BusComp().ExecuteQuery();
			TheApplication().SetSharedGlobal(""IsFind"","""")
		}	
	}
	return (ContinueOperation);
}
"/**************************************************************************************
* Name          : RMS Number Reservation Pick Applet WebApplet_PreInvoke   		  *
* Author        : Mahindra British Telecom										      *
* Description   : RMS Number Reservation Code File                        			  *
* Amendment Details																	  *
***************************************************************************************
* Date   		 Version  		AmendedBy    		 Comments    	 Reviewed Date    *
***************************************************************************************
* 10/11/2003 		1.0   			MBT   				Created       11/11/2003      *
**************************************************************************************/
function WebApplet_PreInvokeMethod (MethodName)
{
//--------------------------------------------------------------------------
//Setting a global variable on the click of Find button.
//--------------------------------------------------------------------------

	if(MethodName == ""Find"")
		TheApplication().SetSharedGlobal(""IsFind"",""Y"");
	return (ContinueOperation);
}
"/****************************************************************************************
* Name 			      : GetIVRModelNumber	 											*
* Author 		      : MBT (Mumbai-India)											*
* Description 	      :	Fetches the IVR Model number from Dealer Management System.	* 
* Input params  :                                                                     	*
* Output params : 																	 	*
* Ammendment Details                                                                  	*
*****************************************************************************************
* Date 			 Ver    By		 Comments
*****************************************************************************************
* 23/09/2002	 1.0	MBT      Created
20060706       | 1.1  | Prasad | Siebel ES SCR1, Objects Destroyed
*****************************************************************************************/
function GetIVRModelNumber(bcNumberReserve)
{
	var boVBCDMS = TheApplication().GetBusObject(""RMS BO DMS"");
	var bcVBCDBS = boVBCDMS.GetBusComp(""RMS VBC DMS"");
	var intIVRModelNo = 0;
	with(bcVBCDBS) {
		ActivateField(""IVR_MODEL"");
		ActivateField(""HAPPOINTMENT"");
		ActivateField(""IVR_REDAYS"");
		ClearToQuery();
		SetSearchSpec(""DEALER_CODE"",bcNumberReserve.GetFieldValue(""Reserved To""));
		ExecuteQuery();		

		if(FirstRecord()) 
			intIVRModelNo = GetFieldValue(""IVR_MODEL"");
	}
//1.1 below
	bcVBCDBS = null;
	boVBCDMS = null; 
//1.1 above
	return(intIVRModelNo);
}
"/**************************************************************************************
* Name          : RMS Number Reservation Pick Applet Load Method   		          *
* Author        : Mahindra British Telecom										      *
* Description   : RMS Number Reservation Code File                        			  *
* Amendment Details																	  *
***************************************************************************************
* Date   		 Version  		AmendedBy    		 Comments    	 Reviewed Date    *
***************************************************************************************
* 22/12/2003 		1.0   			MBT   				Created       26/12/2003      *
**************************************************************************************/

function WebApplet_Load (){
	var boNumberReserve;
    var bcIVRModel;
    var bcNumberMaster;
    var bcNumberReserve;
	var boVBCDMS;
	var bcVBCDBS;
    
    var intIVRModelNo;
    var intIVRCnt;
    var blnIsRecord;
    var strSrchExpr = """";
	var strSrchSts = """"; 
	var strSrchExprIVRMdl = """";   
    
    TheApplication().SetSharedGlobal(""Expression"","""");
   	boNumberReserve = this.BusObject();
   	bcNumberReserve = boNumberReserve.GetBusComp(""RMS NM Number Reservation For DSO"");
   	bcIVRModel     = boNumberReserve.GetBusComp(""RMS NM IVR Models"");
   	bcNumberMaster  = this.BusComp();
   	
//-----------------------------------------------------------------------
//Getting the IVR Model Number from DMS and forming the search expression
//for IVR Model number
//------------------------------------------------------------------------

   	intIVRModelNo = GetIVRModelNumber(bcNumberReserve);
   	for(intIVRCnt = intIVRModelNo;intIVRCnt!=0;intIVRCnt--)
		strSrchExprIVRMdl = strSrchExprIVRMdl + ""[IVR Model Number] = '""+intIVRCnt+""' OR "";	
	if(strSrchExprIVRMdl != """")
    	strSrchExprIVRMdl = strSrchExprIVRMdl.substring(0,ToInteger(strSrchExprIVRMdl.length)-3);

//--------------------------------------------------------------------------------
//Creating a Search expression to fetch the inventories based on IVR model Numbers
//--------------------------------------------------------------------------------
   	
   	strSrchSts = ""([Status] = '""+TheApplication().InvokeMethod(""LookupValue"", ""NM_NUMBER_STATUS"", ""AVAILABLE"")+""' AND [Type Identifier] = '""+TheApplication().InvokeMethod(""LookupValue"", ""NM_TYPE_IDENTIFIER"", ""MSISDN"")+""')"";
  	if (bcNumberReserve.GetFieldValue(""Operation"") == TheApplication().InvokeMethod(""LookupValue"", ""NM_RESERVE_OPERATION"", ""RESERVE"")) {
   	
		if(strSrchExprIVRMdl != """")	{	
			with(bcIVRModel) {
				ActivateField(""Scheme Id"");
				ClearToQuery();
				SetSearchExpr(strSrchExprIVRMdl);
				ExecuteQuery();
				blnIsRecord = FirstRecord();
				if(FirstRecord())
					strSrchExpr = strSrchExpr + ""("";
				while(blnIsRecord) {
						strSrchExpr = strSrchExpr + ""[Scheme Id] = '""+GetFieldValue(""Scheme Id"")+""' OR "";
						blnIsRecord = NextRecord();
				}
				if(FirstRecord())
			    	strSrchExpr = strSrchExpr.substring(0,ToInteger(strSrchExpr.length)-3);
		}
	}
		
		if(strSrchExpr != """"){
			strSrchExpr = strSrchExpr + "") AND "" + strSrchSts;
			with(bcNumberMaster) {
		   		ActivateField(""Scheme Id"");  
	    		ClearToQuery();
	    		SetSearchExpr(strSrchExpr);
	    		ExecuteQuery();
	    	}
	    }
	    else {
	    	strSrchExpr = ""[Scheme Id] = ''"";
			with(bcNumberMaster) {
		   		ActivateField(""Scheme Id"");  
	    		ClearToQuery();
	    		SetSearchExpr(strSrchExpr);
	    		ExecuteQuery();
	    	}
		}
		TheApplication().SetSharedGlobal(""Expression"",strSrchExpr);
   	}
   	
	boNumberReserve = null;
    bcIVRModel 		= null;
    bcNumberMaster 	= null;
    bcNumberReserve = null;
}
"/**************************************************************************************
* Name          : RMS Number Reservation Pick Applet PreCanInvoke_Method   		  *
* Author        : Mahindra British Telecom										      *
* Description   : RMS Number Reservation Code File                        			  *
* Amendment Details																	  *
***************************************************************************************
* Date   		 Version  		AmendedBy    		 Comments    	 Reviewed Date    *
***************************************************************************************
* 22/12/2003 		1.0   			MBT   				Created       26/12/2003      *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	if(MethodName == ""ExecuteQuery""){

//--------------------------------------------------------------------------
//Creating a Search expression depending on the field values and the
//values filled in the Find control.
//--------------------------------------------------------------------------
	
		if(TheApplication().GetSharedGlobal(""IsFind"") == ""Y""){
		
			var strSearchExpr	= """";
			var strFindExpr     = """";			
			strFindExpr   = this.BusComp().GetSearchExpr();
			strSearchExpr = TheApplication().GetSharedGlobal(""Expression"");
			
			if(strFindExpr != """")		
				strSearchExpr = strSearchExpr + "" AND "" + strFindExpr;

			this.BusComp().ClearToQuery();
			this.BusComp().SetSearchExpr(strSearchExpr);
			this.BusComp().ExecuteQuery();
			TheApplication().SetSharedGlobal(""IsFind"","""")
		}	
	}
	return (ContinueOperation);
}
"/**************************************************************************************
* Name          : RMS Number Reservation Pick Applet PreInvoke_Method       		  *
* Author        : Mahindra British Telecom										      *
* Description   : RMS Number Reservation Code File                        			  *
* Amendment Details																	  *
***************************************************************************************
* Date   		 Version  		AmendedBy    		 Comments    	 Reviewed Date    *
***************************************************************************************
* 22/12/2003 		1.0   			MBT   				Created       26/12/2003      *
**************************************************************************************/

function WebApplet_PreInvokeMethod (MethodName){
	if(MethodName == ""Find"")
		TheApplication().SetSharedGlobal(""IsFind"",""Y"");
	return (ContinueOperation);
}
"/**************************************************************************************
* Name          : RMS NM Number Reservation WebApplet_Invoke Method 		     	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Reservation Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 22/12/2003 	1.0   		MBT						   	Created      28/12/2003       *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){

	switch (MethodName){
		case ""NewQuery"" : 
			TheApplication().SetSharedGlobal(""g_isReservedEnabled"",""N"");
			break;
		case ""ExecuteQuery"" :
			TheApplication().SetSharedGlobal(""g_isReservedEnabled"",""Y"");
			break;
		case ""UndoQuery"":
			TheApplication().SetSharedGlobal(""g_isReservedEnabled"",""Y"");
			break;
	}				
}
"/**************************************************************************************
* Name          : RMS NM Number Reservation WebApplet_PreCanInvoke Method  		 	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Reservation Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 22/12/2003 	1.0   		MBT						   	Created      28/12/2003       *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){	
	
	var bcNumberResrv 	= this.BusComp();
	var intReturn		= ContinueOperation;
	
	switch (MethodName){
		case ""Reserve"" : 
			if((bcNumberResrv.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) &&  (bcNumberResrv.GetFieldValue(""Operation"") == TheApplication().InvokeMethod(""LookupValue"", ""NM_RESERVE_OPERATION"", ""RESERVE"")) && ((TheApplication().GetSharedGlobal(""g_isReservedEnabled"")==""Y"") || (TheApplication().GetSharedGlobal(""g_isReservedEnabled"")=="""")))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";	
			intReturn = CancelOperation;
			break;
		case ""CancelReserve"" :
			if((bcNumberResrv.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) &&  (bcNumberResrv.GetFieldValue(""Operation"") == TheApplication().InvokeMethod(""LookupValue"", ""NM_RESERVE_OPERATION"", ""CANCEL RESERVATION"")) && ((TheApplication().GetSharedGlobal(""g_isReservedEnabled"")==""Y"") || (TheApplication().GetSharedGlobal(""g_isReservedEnabled"")=="""")))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";	
			intReturn = CancelOperation;
			break;
			
		case ""CopyRecord"" :				
			CanInvoke = ""False"";
		  	intReturn = CancelOperation;
			break;
			
		case ""DeleteRecord"":
					
			if(bcNumberResrv.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""COMPLETE"") || bcNumberResrv.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PROCESSING""))			
				CanInvoke = ""FALSE"";
			else
				CanInvoke = ""TRUE"";
		  	intReturn = CancelOperation;
		  	break;
		}	

	return(intReturn);
}
"/**************************************************************************************
* Name          : RMS NM Number Reservation WebApplet_PreCanInvoke Method  		 	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Allocation Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 22/11/2003 	1.0   		MBT						   	Created      28/11/2003       *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName)
{
	switch (MethodName){
		case ""NewQuery"" : 
			TheApplication().SetSharedGlobal(""g_isAllocatedEnabled"",""N"");
			break;
		case ""ExecuteQuery"" :
			TheApplication().SetSharedGlobal(""g_isAllocatedEnabled"",""Y"");
			break;
		case ""UndoQuery"":
			TheApplication().SetSharedGlobal(""g_isAllocatedEnabled"",""Y"");
			break;
	}				
}
"/**************************************************************************************
* Name          : RMS NM Number Reservation WebApplet_PreCanInvoke Method  		 	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Reservation Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 22/11/2003 	1.0   		MBT						   	Created      28/11/2003       *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{	
	
	var bcNumberResrv 	= this.BusComp();
	var intReturn		= ContinueOperation;
	
	switch (MethodName){
		case ""Reserve"" : 
			if((bcNumberResrv.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) &&  (bcNumberResrv.GetFieldValue(""Operation"") == TheApplication().InvokeMethod(""LookupValue"", ""NM_RESERVE_OPERATION"", ""RESERVE"")) && ((TheApplication().GetSharedGlobal(""g_isAllocatedEnabled"")==""Y"") || (TheApplication().GetSharedGlobal(""g_isAllocatedEnabled"")=="""")))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";	
			intReturn = CancelOperation;
			break;
		case ""CancelReserve"" :
			if((bcNumberResrv.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) &&  (bcNumberResrv.GetFieldValue(""Operation"") == TheApplication().InvokeMethod(""LookupValue"", ""NM_RESERVE_OPERATION"", ""CANCEL RESERVATION"")) && ((TheApplication().GetSharedGlobal(""g_isAllocatedEnabled"")==""Y"") || (TheApplication().GetSharedGlobal(""g_isAllocatedEnabled"")=="""")))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";	
			intReturn = CancelOperation;
			break;
			
		case ""CopyRecord"" :				
			CanInvoke = ""False"";
		  	intReturn = CancelOperation;
			break;
			
		case ""DeleteRecord"":
					
			if(bcNumberResrv.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""COMPLETE"") || bcNumberResrv.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PROCESSING""))			
				CanInvoke = ""FALSE"";
			else
				CanInvoke = ""TRUE"";
		  	intReturn = CancelOperation;
		  	break;
		}	

	return(intReturn);
}
"/**************************************************************************************
* Name          : RMS NM Number Reservation WebApplet_Invoke Method  	         	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Reservation Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 22/12/2003 	1.0   		MBT						   	Created      28/12/2003       *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){
	switch (MethodName){
		case ""NewQuery"" : 
			TheApplication().SetSharedGlobal(""g_isReservedEnabled"",""N"");
			break;
		case ""ExecuteQuery"" :
			TheApplication().SetSharedGlobal(""g_isReservedEnabled"",""Y"");
			break;
		case ""UndoQuery"":
			TheApplication().SetSharedGlobal(""g_isReservedEnabled"",""Y"");
			break;
	}				
}
"/**************************************************************************************
* Name          : RMS NM Number Reservation WebApplet_PreCanInvoke Method  		 	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Reservation Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 22/12/2003 	1.0   		MBT						   	Created      28/12/2003       *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){	
	
	var bcNumberResrv 	= this.BusComp();
	var intReturn		= ContinueOperation;
	
	switch (MethodName){
		case ""Reserve"" : 
			if((bcNumberResrv.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) &&  (bcNumberResrv.GetFieldValue(""Operation"") == TheApplication().InvokeMethod(""LookupValue"", ""NM_RESERVE_OPERATION"", ""RESERVE"")) && ((TheApplication().GetSharedGlobal(""g_isReservedEnabled"")==""Y"") || (TheApplication().GetSharedGlobal(""g_isReservedEnabled"")=="""")))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";	
			intReturn = CancelOperation;
			break;
		case ""CancelReservation"" :
			if((bcNumberResrv.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) &&  (bcNumberResrv.GetFieldValue(""Operation"") == TheApplication().InvokeMethod(""LookupValue"", ""NM_RESERVE_OPERATION"", ""CANCEL RESERVATION"")) && ((TheApplication().GetSharedGlobal(""g_isReservedEnabled"")==""Y"") || (TheApplication().GetSharedGlobal(""g_isReservedEnabled"")=="""")))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";	
			intReturn = CancelOperation;
			break;
			
		case ""CopyRecord"" :				
			CanInvoke = ""False"";
		  	intReturn = CancelOperation;
			break;
			
		case ""DeleteRecord"":
					
			if(bcNumberResrv.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""COMPLETE"") || bcNumberResrv.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PROCESSING""))			
				CanInvoke = ""FALSE"";
			else
				CanInvoke = ""TRUE"";
		  	intReturn = CancelOperation;
		  	break;
	
	  	}	

	return(intReturn);
}
"/**************************************************************************************
* Name          : RMS NM Number Reservation WebApplet_Invoke Method     		 	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Allocation Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 22/12/2003 	1.0   		MBT						   	Created      28/12/2003       *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){
	switch (MethodName){
		case ""NewQuery"" : 
			TheApplication().SetSharedGlobal(""g_isReservedEnabled"",""N"");
			break;
		case ""ExecuteQuery"" :
			TheApplication().SetSharedGlobal(""g_isReservedEnabled"",""Y"");
			break;
		case ""UndoQuery"":
			TheApplication().SetSharedGlobal(""g_isReservedEnabled"",""Y"");
			break;
	}				
}
"/**************************************************************************************
* Name          : RMS NM Number Reservation WebApplet_PreCanInvoke Method  	 	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Reservation Code File	    		                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 22/12/2003 	1.0   		MBT						   	Created      28/12/2003       *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){	
	
	var bcNumberResrv 	= this.BusComp();
	var intReturn		= ContinueOperation;
	
	switch (MethodName){
	
		case ""Reserve"" : 
			if((bcNumberResrv.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) &&  (bcNumberResrv.GetFieldValue(""Operation"") == TheApplication().InvokeMethod(""LookupValue"", ""NM_RESERVE_OPERATION"", ""RESERVE"")) && ((TheApplication().GetSharedGlobal(""g_isReservedEnabled"")==""Y"") || (TheApplication().GetSharedGlobal(""g_isReservedEnabled"")=="""")))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";	
			intReturn = CancelOperation;
			break;
		case ""CancelReservation"" :
			if((bcNumberResrv.GetFieldValue(""Status"") == TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PENDING"")) &&  (bcNumberResrv.GetFieldValue(""Operation"") == TheApplication().InvokeMethod(""LookupValue"", ""NM_RESERVE_OPERATION"", ""CANCEL RESERVATION"")) && ((TheApplication().GetSharedGlobal(""g_isReservedEnabled"")==""Y"") || (TheApplication().GetSharedGlobal(""g_isReservedEnabled"")=="""")))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";	
			intReturn = CancelOperation;
			break;
			
		case ""CopyRecord"" :				
			CanInvoke = ""False"";
		  	intReturn = CancelOperation;
			break;
			
		case ""DeleteRecord"":
					
			if(bcNumberResrv.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""COMPLETE"") || bcNumberResrv.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""PROCESSING""))			
				CanInvoke = ""FALSE"";
			else
				CanInvoke = ""TRUE"";
		  	intReturn = CancelOperation;
		  	break;

		case ""ExportNumbers"":
					
			if(bcNumberResrv.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""COMPLETE"") || bcNumberResrv.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""COMPLETE""))			
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";
		  	intReturn = CancelOperation;
		  	break;
		  	
		  case ""Export"":
					
			if(bcNumberResrv.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""COMPLETE"") || bcNumberResrv.GetFieldValue(""Status"")== TheApplication().InvokeMethod(""LookupValue"", ""RMS_OPR_STATUS"", ""COMPLETE""))			
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";
		  	intReturn = CancelOperation;
		  	break;
		  	
		  			  	
		}	
		
	return(intReturn);
}
"/********************************************************************************************
* Name          : RMS NM Number Reservation Start Number Pick Applet WebApplet_Load Method	*
* Author        : Mahindra British Telecom										      		*
* Description   : RMS NM Number Reservation Code File                        				*
* Amendment Details																	  		*
*********************************************************************************************
* Date   		 Version  		AmendedBy    		 Comments    	 Reviewed Date    		*
*********************************************************************************************
* 10/12/2003 		1.0   			MBT   				Created       11/12/2003      		*
********************************************************************************************/

function WebApplet_Load (){

/*	var boNMNumberReservation;
	var bcNMMaster;
	var bcNMNumberReservation;
	var bcNMResrvStartNum;
	var strSearchExpr="""";
	var strIsAssociated = ""N"";

//--------------------------------------------------------------------------
//Creating a Search expression depending on the values filled in the applet.
//--------------------------------------------------------------------------
	TheApplication().SetSharedGlobal(""Expression"","""");
	
	boNMNumberReservation = TheApplication().ActiveBusObject();
	bcNMNumberReservation = boNMNumberReservation.GetBusComp(""RMS NM Number Reservation"");
	bcNMResrvStartNum = boNMNumberReservation.GetBusComp(""RMS NM Resrv Start Num"");
	bcNMMaster    = this.BusComp();
	strSearchExpr = ""[Is Associated] = 'N'"";

//-------------------------------------------------------------------------------
// If status selected is 'Available' or 'Not Available' then display only those
// MSISDN numbers which are not associated.
//-------------------------------------------------------------------------------
		
	if(bcNMNumberReservation.GetFieldValue(""HLR Id"") != """")
		strSearchExpr = strSearchExpr + "" AND [HLR ID] = '"" + bcNMNumberReservation.GetFieldValue(""HLR Id"") + ""'"";
	if(bcNMNumberReservation.GetFieldValue(""Special Category"") != """")
		strSearchExpr = strSearchExpr + "" AND [Special Category] = '"" + bcNMNumberReservation.GetFieldValue(""Special Category"") + ""'"";

//------------ Kadali Srinivas Ver 2.0 --------------------//

	if(bcNMNumberReservation.GetFieldValue(""Operation"") == ""RESERVE""){
		strSearchExpr = strSearchExpr + "" AND [Status] = '""+ TheApplication().InvokeMethod(""LookupValue"", ""NM_NUMBER_STATUS"", ""ALLOCATED"")+""'"";
		strSearchExpr = strSearchExpr + "" AND ([Allocated To] = '"" + bcNMNumberReservation.GetFieldValue(""Reserved To"") + ""'"" + "" OR [Partner Type] = '"" + ""Common Pool')"";		
	}
	if(bcNMNumberReservation.GetFieldValue(""Operation"") == ""CANCEL RESERVATION""){
		strSearchExpr = strSearchExpr + "" AND [Status] = '""+ TheApplication().InvokeMethod(""LookupValue"", ""NM_NUMBER_STATUS"", ""RESERVED"")+""'"";
		strSearchExpr = strSearchExpr + "" AND ([Allocated To] = '"" + bcNMNumberReservation.GetFieldValue(""Reserved To"") + ""'"" + "" OR [Partner Type] = '"" + ""Common Pool')"";		
	}

//-------------Kadali Srinivas Ver 2.0 -------------------//	

	with(bcNMMaster){
		ClearToQuery();
		SetSearchExpr(strSearchExpr);
//		ExecuteQuery();
	}

	TheApplication().SetSharedGlobal(""Expression"",strSearchExpr);	
	
	boNMNumberReservation = null;
	bcNMNumberReservation = null;
	bcNMMaster    = null;*/
}
"/********************************************************************************************
* Name          : RMS NM Number Reservation Start Number Pick Applet WebApplet_PreCanInvoke*
* Author        : Mahindra British Telecom										      		*	
* Description   : RMS NM Number Reservation Code File                        				*
* Amendment Details																	  		*
*********************************************************************************************
* Date   		 Version  		AmendedBy    		 Comments    	 Reviewed Date    		*
*********************************************************************************************
* 10/12/2003 		1.0   			MBT   				Created       11/12/2003      		*
********************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	if(MethodName == ""Find"")
		TheApplication().SetSharedGlobal(""g_blnIsFind"",""Y"");
	
/*f(MethodName == ""ExecuteQuery""){

//--------------------------------------------------------------------------
//Creating a Search expression depending on the field values and the
//values filled in the Find control.
//--------------------------------------------------------------------------
	
		if(TheApplication().GetSharedGlobal(""g_blnIsFind"") == ""Y""){
		
			var strSearchExpr	= """";
			var strFindExpr     = """";			
			strFindExpr   = this.BusComp().GetSearchExpr();
			strSearchExpr = TheApplication().GetSharedGlobal(""Expression"");
			
			if (strFindExpr!="""")
				strSearchExpr = strSearchExpr + "" AND "" + strFindExpr;

			this.BusComp().ClearToQuery();
			this.BusComp().SetSearchExpr(strSearchExpr);
//			this.BusComp().ExecuteQuery();
			TheApplication().SetSharedGlobal(""g_blnIsFind"","""")
		}	
	}*/
	return (ContinueOperation);
}
"/********************************************************************************************
* Name          : RMS NM Number Reservation Start Number Pick Applet WebApplet_PreInvoke  	*
* Author        : Mahindra British Telecom										      		*
* Description   : RMS NM Number entory Code File                        				*
* Amendment Details																	  		*
*********************************************************************************************
* Date   		 Version  		AmendedBy    		 Comments    	 Reviewed Date    		*
*********************************************************************************************
* 10/12/2003 		1.0   		MBT   				  Created         11/12/2003      		*
********************************************************************************************/

function WebApplet_PreInvokeMethod (MethodName){
	if(MethodName == ""Find"")
		TheApplication().SetSharedGlobal(""g_blnIsFind"",""Y"");
// =========================== COMMENTED FOR FUTURE USE Ver 2.0 =============================/	
	/*
	if(MethodName == ""PickRecord"") {
	
		var boNMNumberReservation;
		var bcNMMaster;
		var bcNMNumberReservation;

//--------------------------------------------------------------------------
//Creating a Search expression depending on the values filled in the applet.
//--------------------------------------------------------------------------
		
		boNMNumberReservation = TheApplication().ActiveBusObject();
		bcNMNumberReservation = boNMNumberReservation.GetBusComp(""RMS NM Number Reservation"");
		bcNMMaster    = this.BusComp();
		
 		if(bcNMNumberReservation.GetFieldValue(""Operation"") == TheApplication().InvokeMethod(""LookupValue"",""NM_RESERVE_OPERATION"",""CANCEL RESERVATION"")) {

			bcNMNumberReservation.SetFieldValue(""Operation"",TheApplication().InvokeMethod(""LookupValue"",""NM_RESERVE_OPERATION"",""RESERVE"")); 
			bcNMNumberReservation.SetFieldValue(""Reserved To"",bcNMMaster.GetFieldValue(""Reserved To""));
//-----------------------------------------------------------
// Code added for Phase 1A2 for setting the dealer name,
// dealer area code and dealer channel code.
//-----------------------------------------------------------						
	
			//bcNMNumberReservation.SetFieldValue(""Dealer Name"",bcNMMaster.GetFieldValue(""Dealer Name""));
			//bcNMNumberReservation.SetFieldValue(""Dealer Area Code"",bcNMMaster.GetFieldValue(""Dealer Area Code""));
			//bcNMNumberReservation.SetFieldValue(""Dealer Channel Code"",bcNMMaster.GetFieldValue(""Dealer Channel Code""));
			bcNMNumberReservation.SetFieldValue(""Operation"",TheApplication().InvokeMethod(""LookupValue"",""NM_RESERVE_OPERATION"",""CANCEL RESERVATION"")); 
		}
	}
*/
	return (ContinueOperation);
	
}
"/********************************************************************************************
* Name          : RMS NM Number Reservation Start Number Pick Applet WebApplet_Load Method	*
* Author        : Mahindra British Telecom										      		*
* Description   : RMS NM Number Reservation Code File                        				*
* Amendment Details																	  		*
*********************************************************************************************
* Date   		 Version  		AmendedBy    		 Comments    	 Reviewed Date    		*
*********************************************************************************************
* 10/12/2003 		1.0   			MBT   				Created       11/12/2003      		*
********************************************************************************************/

function WebApplet_Load (){

	var boNMNumberReservation;
	var bcNMMaster;
	var bcNMNumberReservation;
	var strSearchExpr="""";
	var strIsAssociated = ""N"";

//--------------------------------------------------------------------------
//Creating a Search expression depending on the values filled in the applet.
//--------------------------------------------------------------------------
	TheApplication().SetSharedGlobal(""Expression"","""");
	
	boNMNumberReservation = TheApplication().ActiveBusObject();
	bcNMNumberReservation = boNMNumberReservation.GetBusComp(""RMS NM Number Reservation"");
	bcNMMaster    = this.BusComp();
	strSearchExpr = ""[Is Associated] = 'N'"";

//-------------------------------------------------------------------------------
// If status selected is 'Available' or 'Not Available' then display only those
// MSISDN numbers which are not associated.
//-------------------------------------------------------------------------------
		
	if(bcNMNumberReservation.GetFieldValue(""HLR Id"") != """")
		strSearchExpr = strSearchExpr + "" AND [HLR ID] = '"" + bcNMNumberReservation.GetFieldValue(""HLR Id"") + ""'"";
	if(bcNMNumberReservation.GetFieldValue(""Class"") != """")
		strSearchExpr = strSearchExpr + "" AND [Class] = '"" + bcNMNumberReservation.GetFieldValue(""Class"") +	""'"";
	if(bcNMNumberReservation.GetFieldValue(""Special Category"") != """")
		strSearchExpr = strSearchExpr + "" AND [Special Category] = '"" + bcNMNumberReservation.GetFieldValue(""Special Category"") + ""'"";
	
	with(bcNMMaster){
		ClearToQuery();
		SetSearchExpr(strSearchExpr);
//		ExecuteQuery();
	}

	TheApplication().SetSharedGlobal(""Expression"",strSearchExpr);	
	
	boNMNumberReservation = null;
	bcNMNumberReservation = null;
//	bcNMMaster    = null;
}
"/********************************************************************************************
* Name          : RMS NM Number Reservation Start Number Pick Applet WebApplet_PreCanInvoke*
* Author        : Mahindra British Telecom										      		*	
* Description   : RMS NM Number Reservation Code File                        				*
* Amendment Details																	  		*
*********************************************************************************************
* Date   		 Version  		AmendedBy    		 Comments    	 Reviewed Date    		*
*********************************************************************************************
* 10/12/2003 		1.0   			MBT   				Created       11/12/2003      		*
********************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	if(MethodName == ""ExecuteQuery""){

//--------------------------------------------------------------------------
//Creating a Search expression depending on the field values and the
//values filled in the Find control.
//--------------------------------------------------------------------------
	
		if(TheApplication().GetSharedGlobal(""g_blnIsFind"") == ""Y""){
		
			var strSearchExpr	= """";
			var strFindExpr     = """";			
			strFindExpr   = this.BusComp().GetSearchExpr();
			strSearchExpr = TheApplication().GetSharedGlobal(""Expression"");
			
			if (strFindExpr!="""")
				strSearchExpr = strSearchExpr + "" AND "" + strFindExpr;

			this.BusComp().ClearToQuery();
			this.BusComp().SetSearchExpr(strSearchExpr);
			this.BusComp().ExecuteQuery();
			TheApplication().SetSharedGlobal(""g_blnIsFind"","""")
		}	
	}
	return (ContinueOperation);
}
"/********************************************************************************************
* Name          : RMS NM Number Reservation Start Number Pick Applet WebApplet_PreInvoke  	*
* Author        : Mahindra British Telecom										      		*
* Description   : RMS NM Number entory Code File                        				*
* Amendment Details																	  		*
*********************************************************************************************
* Date   		 Version  		AmendedBy    		 Comments    	 Reviewed Date    		*
*********************************************************************************************
* 10/12/2003 		1.0   		MBT   				  Created         11/12/2003      		*
********************************************************************************************/

function WebApplet_PreInvokeMethod (MethodName){
	if(MethodName == ""Find"")
		TheApplication().SetSharedGlobal(""g_blnIsFind"",""Y"");
// =========================== COMMENTED FOR FUTURE USE Ver 2.0 =============================/	
	/*
	if(MethodName == ""PickRecord"") {
	
		var boNMNumberReservation;
		var bcNMMaster;
		var bcNMNumberReservation;

//--------------------------------------------------------------------------
//Creating a Search expression depending on the values filled in the applet.
//--------------------------------------------------------------------------
		
		boNMNumberReservation = TheApplication().ActiveBusObject();
		bcNMNumberReservation = boNMNumberReservation.GetBusComp(""RMS NM Number Reservation"");
		bcNMMaster    = this.BusComp();
		
 		if(bcNMNumberReservation.GetFieldValue(""Operation"") == TheApplication().InvokeMethod(""LookupValue"",""NM_RESERVE_OPERATION"",""CANCEL RESERVATION"")) {

			bcNMNumberReservation.SetFieldValue(""Operation"",TheApplication().InvokeMethod(""LookupValue"",""NM_RESERVE_OPERATION"",""RESERVE"")); 
			bcNMNumberReservation.SetFieldValue(""Reserved To"",bcNMMaster.GetFieldValue(""Reserved To""));
//-----------------------------------------------------------
// Code added for Phase 1A2 for setting the dealer name,
// dealer area code and dealer channel code.
//-----------------------------------------------------------						
	
			//bcNMNumberReservation.SetFieldValue(""Dealer Name"",bcNMMaster.GetFieldValue(""Dealer Name""));
			//bcNMNumberReservation.SetFieldValue(""Dealer Area Code"",bcNMMaster.GetFieldValue(""Dealer Area Code""));
			//bcNMNumberReservation.SetFieldValue(""Dealer Channel Code"",bcNMMaster.GetFieldValue(""Dealer Channel Code""));
			bcNMNumberReservation.SetFieldValue(""Operation"",TheApplication().InvokeMethod(""LookupValue"",""NM_RESERVE_OPERATION"",""CANCEL RESERVATION"")); 
		}
	}
*/
	return (ContinueOperation);
	
}
"/**************************************************************************************
* Name          : RMS NM Number Scheme Form WebApplet Invoke Method		 	      * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Scheme Code File                      			      *
*																					  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 02/12/2003	1.0   		  MBT					   	Created       02/12/2003      *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){
	if(MethodName == ""NewQuery"")
		TheApplication().SetSharedGlobal(""g_blnIsReleaseEnabled"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"")
		TheApplication().SetSharedGlobal(""g_blnIsReleaseEnabled"",""Y"");
}
"/**************************************************************************************
* Name          : RMS NM Number Scheme Form WebApplet PreCanInvoke Method			  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Scheme Code File                      				  *
*																					  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 01/12/2003	1.0   		  MBT					   	Created       02/12/2003      *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	var intReturn = ContinueOperation;
	var bcNumberScheme;
	
	bcNumberScheme = this.BusComp();

	switch (MethodName)	 {

//-----------------------------------------------	
// Disabling the release button in Query Mode
//-----------------------------------------------
		case ""ReleaseScheme"" : 
		   try{
			if(bcNumberScheme.GetFieldValue(""Status"")==""N"" && (TheApplication().GetSharedGlobal(""g_blnIsReleaseEnabled"")==""Y"" || TheApplication().GetSharedGlobal(""g_blnIsReleaseEnabled"") == """")
											&&
				bcNumberScheme.GetFieldValue(""Format Received"")==""Y"")
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";
			} catch (e) {
				CanInvoke = ""FALSE"";
			}	
			intReturn= CancelOperation;
			break;

//--------------------- Commented for Future Use ---------------		
// Disabling the delete functionality if the scheme is released
//--------------------------------------------------------------
/*		case ""DeleteRecord"" :
			if(bcNumberScheme.GetFieldValue(""Status"")==""Y"")
				CanInvoke = ""FALSE"";
			else
				CanInvoke = ""TRUE"";
			intReturn= CancelOperation;
			break;		*/

//-------------------------------------------------------------------			
// Disabling the Copy Record functionality if the scheme is released	
//-------------------------------------------------------------------
		case ""CopyRecord"":
		   try {
			if(bcNumberScheme.GetFieldValue(""Status"")==""Y"")
				CanInvoke = ""FALSE"";
			else
				CanInvoke = ""TRUE"";
			} catch (e) {
				CanInvoke = ""FALSE"";
			}
			intReturn= CancelOperation;
			break;
			
		default:
			break;	
	}
	
	bcNumberScheme = null;			
	return (intReturn);

return (ContinueOperation);
}
"/**************************************************************************************
* Name          : RMS NM Number Scheme Format RefreshingBc Function        		  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Scheme Format Refresh Code File	                  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Ver     By     	 Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 02/12/2003 	 1.0   	MBT		 Created      02/12/2003       *
20060710       | 1.1  | Prasad | Siebel ES SCR1, Objects Destroyed
**************************************************************************************/
function RefreshingBc(){

	var psInputs;
	var psOutputs;
	var bsSIMNMRef;
	
	psInputs = TheApplication().NewPropertySet();
	psOutputs = TheApplication().NewPropertySet();
	
	bsSIMNMRef = TheApplication().GetService(""RMS SIM NM Refresh Business Component"");
										
	psInputs.SetProperty(""Business Component Name"",""RMS NM Number Scheme"");
	psInputs.SetProperty(""Business Object Name"",""RMS NM Number Scheme"");
	bsSIMNMRef.InvokeMethod(""Refresh Business Component"",psInputs,psOutputs);
	
	psInputs 	= null;
	psOutputs 	= null;
//1.1 below needs to be replaced by a call to bc.InvokeMethod(""RefreshRecord"")
	bsSIMNMRef = null;
//1.1 below
}
"/**************************************************************************************
* Name          : RMS NM Number Scheme Level List WebApplet PreCanInvokeMethod       * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Scheme Code File                      			      *
*																					  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 02/12/2003	1.0   		  MBT					   	Created       02/12/2003      *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod(MethodName,&CanInvoke){

	var boNMScheme;
	var boNumberType;
	
	var bcNMSchemeUpdate;
	var bcNumberSchemeLevel;
 	var bcNumberFormat;
 	var bcNumberScheme;
 	
 	var blnIsRecord;
 	
 	var strHlr;
  	var intLength;
 	 
	bcNumberSchemeLevel = this.BusComp();
	bcNumberScheme      = bcNumberSchemeLevel.ParentBusComp();		
		
	boNumberType 		= TheApplication().GetBusObject(""RMS NM Number Type"");
	bcNumberFormat 		= boNumberType.GetBusComp(""RMS NM Number Format"");
	
	boNMScheme			= TheApplication().GetBusObject(""RMS NM Number Scheme"");
	bcNMSchemeUpdate	= boNMScheme.GetBusComp(""RMS NM Scheme Level Updation"");
	
//----------------------------------------------------------------				
// To check whether the format for the scheme has been populated.
//----------------------------------------------------------------
	if(bcNumberScheme.GetFieldValue(""Format Received"") != ""Y"") {
		with(bcNumberFormat){
			ActivateField(""Type Id"");
			ActivateField(""Row Id"");
			ActivateField(""Level Name"");
			ActivateField(""Level Type"");
			ActivateField(""Length"");
			ClearToQuery();
			SetSearchSpec(""Type Id"",bcNumberScheme.GetFieldValue(""Type Id""));
			ExecuteQuery();	
			blnIsRecord = FirstRecord();			
		}	
		
		strHlr = ToString(bcNumberScheme.GetFieldValue(""HLR Id""));
		
//---------------------------------------------------------
// Populating the scheme format as defined in number type.
//---------------------------------------------------------
		while(blnIsRecord){
			with(bcNMSchemeUpdate){
				NewRecord(1);
				SetFieldValue(""Format Id"", bcNumberFormat.GetFieldValue(""Row Id""));
				SetFieldValue(""Scheme Id"", bcNumberScheme.GetFieldValue(""Id""));
				if(bcNumberFormat.GetFieldValue(""Level Type"") == TheApplication().InvokeMethod(""LookupValue"", ""NM_LEVEL_TYPE"", ""HLR"")){
					intLength = strHlr.length;
					if(bcNumberFormat.GetFieldValue(""Length"") > intLength){
						for(intLength;intLength < bcNumberFormat.GetFieldValue(""Length"");intLength++)
							strHlr = ""0"" + strHlr;
					}
					SetFieldValue(""Value"",strHlr);
                }
                
            	WriteRecord();
            }
			blnIsRecord = bcNumberFormat.NextRecord();
		}
		
		bcNumberScheme.SetFieldValue(""Format Received"",""Y"");
		bcNumberScheme.WriteRecord();
		RefreshingBc();
	}	
		
	
	bcNumberSchemeLevel  = null;
 	bcNumberFormat       = null;
 	bcNumberScheme       = null;
 	bcNMSchemeUpdate	 = null;
	boNumberType         = null;
	boNMScheme			 = null;
	
	return (ContinueOperation);
}
"/**************************************************************************************
* Name          : RMS NM Number Scheme List WebApplet Invoke Method		 	      * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Scheme Code File                      				  *
*																					  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 02/12/2003	1.0   		  MBT					   	Created       02/12/2003      *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){
	if(MethodName == ""NewQuery"")
		TheApplication().SetSharedGlobal(""g_blnIsReleaseEnabled"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"")
		TheApplication().SetSharedGlobal(""g_blnIsReleaseEnabled"",""Y"");
}
"/**************************************************************************************
* Name          : RMS NM Number Scheme List WebApplet PreCanInvoke Method			  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Scheme Code File                      			      *
*																					  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 02/12/2003	 1.0   		  MBT					   	 Created       02/12/2003     *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	var intReturn = ContinueOperation;
	var bcNumberScheme;
	
	bcNumberScheme = this.BusComp();
	
	switch (MethodName)	 {

		case ""ReleaseScheme"" : 
		
				if(bcNumberScheme.GetFieldValue(""Status"")==""N"" && (TheApplication().GetSharedGlobal(""g_blnIsReleaseEnabled"")==""Y"" || TheApplication().GetSharedGlobal(""g_blnIsReleaseEnabled"") == """")
										&&
	   				bcNumberScheme.GetFieldValue(""Format Received"")==""Y"")
					CanInvoke = ""TRUE"";
				else
					CanInvoke = ""FALSE"";
				
			
			intReturn= CancelOperation;
			break;
 
//---------------------------------------------------------------		
// Disabling the delete functionality if the scheme is released
//---------------------------------------------------------------
		case ""DeleteRecord"" :
			
				if(bcNumberScheme.GetFieldValue(""Status"")==""Y"")
					CanInvoke = ""FALSE"";
				else
					CanInvoke = ""TRUE"";
		
			intReturn= CancelOperation;
			
			break;		

//-------------------------------------------------------------------			
//Disabling the Copy Record functionality if the scheme is released	
//-------------------------------------------------------------------
		case ""CopyRecord"":
			
				if(bcNumberScheme.GetFieldValue(""Status"")==""Y"")
					CanInvoke = ""FALSE"";
				else
					CanInvoke = ""TRUE"";
		
			intReturn= CancelOperation;
			
			break;
		
		default:
			break;	
	}
	
	bcNumberScheme = null;			
	return (intReturn);
}
"/**************************************************************************************
* Name          : RMS NM Number Type WebApplet Invoke Method					      * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Type Code File            	                          *
*                                                                                     *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 20/11/2003 	 1.0   		 MBT 					  	Created       24/11/2003	  *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){

	if(MethodName == ""NewQuery"")
		TheApplication().SetSharedGlobal(""g_flgIsReleaseEnabled"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"")
		TheApplication().SetSharedGlobal(""g_flgIsReleaseEnabled"",""Y"");
}
"/**************************************************************************************
* Name          : RMS NM Number Type WebApplet PreCanInvoke Method				      * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Type Code File            	                          *
*                                                                                     *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 22/11/2003 	 1.0   		MBT						   	Created       24/11/2003	  *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	var intReturn = ContinueOperation;
	var bcNumberType;
		
	bcNumberType = this.BusComp();
	
	switch(MethodName){
	
		case ""Release"":
			if (TheApplication().GetSharedGlobal(""g_flgIsReleaseEnabled"")==""N"" 
									||
				bcNumberType.GetFieldValue(""Valid"") == ""N"" 
									||
				bcNumberType.GetFieldValue(""Status"") == ""Y"" )
				CanInvoke = ""FALSE"";
			else
				CanInvoke = ""TRUE"";
			
			intReturn = CancelOperation;
			break;
			
		case ""CopyRecord"":
		  
  	     	if (bcNumberType.GetFieldValue(""Status"")==""Y"")
	     		CanInvoke = ""FALSE""
	     	else
	     		CanInvoke = ""TRUE""
	     	
	     	intReturn = CancelOperation;
	     	break;
	}   
	
	bcNumberType = null;
	return(intReturn);
}
"/**************************************************************************************
* Name          : RMS NM Number Type WebApplet Invoke Method				 	      * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Type Code File            	                          *
*                                                                                     *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 22/11/2003 	 1.0   		MBT   						Created       24/11/2003	  *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){

	if(MethodName == ""NewQuery"")
		TheApplication().SetSharedGlobal(""g_flgIsReleaseEnabled"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"")
		TheApplication().SetSharedGlobal(""g_flgIsReleaseEnabled"",""Y"");
}
"/**************************************************************************************
* Name          : RMS NM Number Type WebApplet PreCanInvoke Method					  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS NM Number Type Code File            	                          *
*                                                                                     *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 22/11/2003 	 1.0   		MBT						   	Created       24/11/2003	  *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	var intReturn = ContinueOperation;
	var bcNumberType;
	
	bcNumberType = this.BusComp();
	
	switch(MethodName){
	
		case ""Release"":
			if (TheApplication().GetSharedGlobal(""g_flgIsReleaseEnabled"")==""N""
									||
				bcNumberType.GetFieldValue(""Valid"") == ""N"" 
									||
				bcNumberType.GetFieldValue(""Status"") == ""Y"" )
				CanInvoke = ""FALSE"";
			else
				CanInvoke = ""TRUE"";
			
			intReturn = CancelOperation;
			break;
			
		case ""CopyRecord"":
		  
  	     	if (bcNumberType.GetFieldValue(""Status"")==""Y"")
	     		CanInvoke = ""FALSE""
	     	else
	     		CanInvoke = ""TRUE""
	     	
	     	intReturn = CancelOperation;
	     	break;
	}   
	
	bcNumberType = null;
	return(intReturn);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if(MethodName == ""Import""){
		CanInvoke = ""TRUE"";
		return(CancelOperation);
	}	
	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){	
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
return (ContinueOperation);
}
"/**************************************************************************************
* Name          : RMS SIM Card Config WebApplet Invoke Method				 	      * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS SIM Card Config Code File       	                              *
*                                                                                     *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 10/11/2003 	 1.0   		MBT						   	Created       15/10/2003	  *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){

	if(MethodName == ""NewQuery""){
  		TheApplication().SetSharedGlobal(""g_Release"",""N"");
  		TheApplication().SetSharedGlobal(""g_UnRelease"",""N"");
 	} 
 	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery""){
  		TheApplication().SetSharedGlobal(""g_Release"",""Y"");
  		TheApplication().SetSharedGlobal(""g_UnRelease"",""Y"");
 	} 
	
}
"/**************************************************************************************
* Name          : RMS SIM Card Config WebApplet PreCanInvoke Method			 	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS SIM Card Config Code File       	                              *
*                                                                                     *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 10/11/2003 	 1.0   		MBT						   	Created       10/11/2003	  *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

    var bcSIMCardCfg;
    
    var blnReleased;
    var blnUnReleased;
       
    var intReturn = ContinueOperation;
    
    bcSIMCardCfg = this.BusComp();
   	
	switch (MethodName){

//-----------------------------------------------------------------------
// Enable the release button only if the card config hasnt been released.
//-----------------------------------------------------------------------
		case ""ReleaseCardConfig"":
			blnReleased = TheApplication().GetSharedGlobal(""g_Release"");
            if((bcSIMCardCfg.GetFieldValue(""Is Released"") == ""N"") 
            && (blnReleased == ""Y"" || blnReleased == """"))
		    	CanInvoke = ""TRUE"";
			intReturn = CancelOperation;
            break;

//------------------------------------------------------------------------
// Enable the unrelease button only if the card config hasnt been released.
//------------------------------------------------------------------------
     	case ""UnReleaseCardConfig"" :
 			blnUnReleased = TheApplication().GetSharedGlobal(""g_UnRelease"");
        	if((bcSIMCardCfg.GetFieldValue(""Is Released"") == ""Y"") 
        	&& (blnUnReleased == ""Y"" || blnUnReleased == """"))
				CanInvoke = ""TRUE"";
            intReturn = CancelOperation;
            break;

//--------------------------------------------------------------------			
// Disable the delete button only if the card config has been released.
//--------------------------------------------------------------------        		
		case ""DeleteRecord"":
     		if(bcSIMCardCfg.GetFieldValue(""Is Released"") == ""Y""){
     			CanInvoke = ""FALSE"";
	       	 	intReturn = CancelOperation;
			}
			break;
	}		
               
 	bcSIMCardCfg = null; 
	return (intReturn);
    
}
"/**************************************************************************************
* Name          : RMS SIM Card Config WebApplet Invoke Method				 	      * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS SIM Card Config Code File            	                      *
*                                                                                     *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 10/11/2003 	 1.0   		MBT						   	Created       11/11/2003	  *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){

	if(MethodName == ""NewQuery""){
 		TheApplication().SetSharedGlobal(""g_Release"",""N"");
  		TheApplication().SetSharedGlobal(""g_UnRelease"",""N"");
 	} 
 	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery""){
  		TheApplication().SetSharedGlobal(""g_Release"",""Y"");
  		TheApplication().SetSharedGlobal(""g_UnRelease"",""Y"");
 	} 
 
}
"/**************************************************************************************
* Name          : RMS SIM Card Config WebApplet PreCanInvoke Method			 	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS SIM Card Config Code File            	                      *
*                                                                                     *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 10/11/2003 	 1.0   		MBT						   	Created       12/11/2003	  *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

    var bcSIMCardCfg;

    var blnReleased;
    var blnUnReleased;
       
    var intReturn = ContinueOperation;
    
    bcSIMCardCfg = this.BusComp();
   	
	switch (MethodName){

//-----------------------------------------------------------------------
// Enable the release button only if the card config hasnt been released.
//-----------------------------------------------------------------------
		case ""ReleaseCardConfig"":
			blnReleased = TheApplication().GetSharedGlobal(""g_Release"");
            if((bcSIMCardCfg.GetFieldValue(""Is Released"") == ""N"") 
            && (blnReleased == ""Y"" || blnReleased == """"))
				CanInvoke = ""TRUE"";
            intReturn = CancelOperation;
            break;

//-------------------------------------------------------------------------
// Enable the unrelease button only if the card config hasnt been released.
//-------------------------------------------------------------------------
     	case ""UnReleaseCardConfig"" :
 			blnUnReleased = TheApplication().GetSharedGlobal(""g_UnRelease"");
        	if((bcSIMCardCfg.GetFieldValue(""Is Released"") == ""Y"") 
        	&& (blnUnReleased == ""Y"" || blnUnReleased == """"))
				CanInvoke = ""TRUE"";
            intReturn = CancelOperation;
            break;
        		
//--------------------------------------------------------------------			
// Disable the delete button only if the card config has been released.
//--------------------------------------------------------------------        		
		case ""DeleteRecord"":
     		if(bcSIMCardCfg.GetFieldValue(""Is Released"") == ""Y""){
     			CanInvoke = ""FALSE"";
	       	 	intReturn = CancelOperation;
			}
			break;
	}		
               
 	bcSIMCardCfg = null; 
	return (intReturn);
}
"/**************************************************************************************
* Name          : NM Number Redeployment import CSV  WebApplet_PreCanInvokeMethod     * 
* Author        : Mahindra British Telecom                                            *
* Description   : NM Number Redeployment Code File                      			  *
*																					  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 12/12/2003	1.0   		   MBT					   	Created       12/12/2003      *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	if(MethodName == ""Import""){
		CanInvoke = ""TRUE"";
		return(CancelOperation);
	} else	
		return (ContinueOperation);
}
"/**************************************************************************************
* Name          : SIM Order Form Applet Invoke Method		                          * 
* Author        : Mahindra British Telecom                                            *
* Description   : SIM Order Code file.								  		          *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2003 	1.0   		   MBT	     	Created      			22/12/2003        *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){

	if(MethodName == ""NewQuery"")
		TheApplication().SetSharedGlobal(""g_QueryMode"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"")
		TheApplication().SetSharedGlobal(""g_QueryMode"",""Y"");
}
"/**************************************************************************************
* Name          : SIM Order List Applet PreCanInvoke Method		                      * 
* Author        : Mahindra British Telecom                                            *
* Description   : SIM Order Code file.								  		          *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2003 	1.0   		   MBT	     	Created      			22/12/2003        *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	var bcSIMOrder;

	var strStatus;

	var blnSimOrdButton;
	var blnDelete = true;
	var intReturn = ContinueOperation;

	blnSimOrdButton=TheApplication().GetSharedGlobal(""g_QueryMode"");
	bcSIMOrder = this.BusComp();

	
	
	try
	{
		strStatus =bcSIMOrder.GetFieldValue(""Status"");
	}
	catch(e)
	{
	//	return(CancelOperation);
	}

	switch(MethodName)
	{
		case ""SendForApproval"":
		
		if((strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""NEW"")) ||
		   (strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""APPROVAL REJECTED"")) || 
		   (strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""OPEN"")) )
			{  
          		if((blnSimOrdButton == ""Y"" || blnSimOrdButton == """"))
          		        CanInvoke = ""TRUE"";
			}
			intReturn = CancelOperation;
			break;
			
		case ""SubmitToSupplier"":

		if(	
		//(strStatus ==TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""APPROVED""))|| 
    	//	(strStatus ==TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""PENDING"")))          /* Modified - Apr 25 */
	        (strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""NEW"")))      /* Modified - Apr 25 */
	      //  (strStatus ==TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""PO SUSPENDED"")))
			{
				if(blnSimOrdButton == ""Y"" || blnSimOrdButton == """")
					CanInvoke = ""TRUE"";	

			}
			intReturn = CancelOperation;
			break;
			
		case ""CancelOrder"":
			if((strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""APPROVED"")) || (strStatus ==TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""PO GENERATED""))
			||(strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""AWAITING APPROVAL"")) || (strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""OPEN""))){
				if(blnSimOrdButton == ""Y"" || blnSimOrdButton == """")
					CanInvoke = ""TRUE"";						
			}
			intReturn = CancelOperation;
			break;
			
		case ""DeleteRecord"":
			if(strStatus != TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""NEW"")){
				CanInvoke = ""FALSE"";
				intReturn = CancelOperation;
			}	
			break;
		
		case ""TrashOrder"":
			if((strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""PARTIALLY FULFILLED""))
													||
			  (strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""PO GENERATED""))
													||
			  (strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""COMPLETED""))){
			  	if(blnSimOrdButton == ""Y"" || blnSimOrdButton == """")			
					CanInvoke = ""TRUE"";
			}
			else
				CanInvoke = ""FALSE"";
			intReturn = CancelOperation;
			break;	
	}			

	bcSIMOrder = null;
	return (intReturn);
}
"/**************************************************************************************
* Name          : SIM Order Line Form Applet Invoke Method					 	       	  * 
* Author        : MBT (Pune-India)                                                    *
* Description   : Code file to set flag depending on method invoked             	  *
* Input Params  :                                                                     *   
*                                                                                     *
* Output Params :                                                                     *                                    
*                                                                                     *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2002 	1.0   		MBT(Pune)     	Created      			22/01/2003        *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName)
{
	if(MethodName == ""NewQuery"")
		TheApplication().SetSharedGlobal(""Availability"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"")
		TheApplication().SetSharedGlobal(""Availability"",""Y"");
}
"/**************************************************************************************
* Name          : SIM Order Line Form Applet PreCanInvoke Method 	       	  		  * 
* Author        : MBT (Pune-India)                                                    *
* Description   : Code is to check whether the user has the authority to invoke the   *
*				  Applet method.			                                     	  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2002 	1.0   		MBT(Pune)     	Created      			22/01/2003        *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var boSIMOrder;

	var bcSIMOrder;
	var bcSIMOrderLine;

	var strStatus;
	var strOrdLineStatus;

	var blnIsRecord = true;

	var intReturn = ContinueOperation;
	
	try{
		bcSIMOrderLine	 = this.BusComp();
	    bcSIMOrder		 = bcSIMOrderLine.ParentBusComp(); 
	    strStatus		 = bcSIMOrder.GetFieldValue(""Status"");	
		strOrdLineStatus = bcSIMOrderLine.GetFieldValue(""Status"");
	}
	catch(e){
	blnIsRecord = false;
	} 
	
	switch(MethodName){
		case ""NewRecord"" :
		case ""CopyRecord"":
			if((strStatus != ""New"") && (strStatus != ""Approval Rejected"") && (strStatus != ""Open"")){
				CanInvoke = ""FALSE"";
				intReturn = CancelOperation;
			}
			break;

		case ""DeleteRecord"":
			if((!(strStatus == ""Approved"" && strOrdLineStatus == ""To Be Deleted""))
			&&(!(strStatus==""New""))){
				CanInvoke=""FALSE"";
				intReturn = CancelOperation;
			}
			break;

	}
	
	boSIMOrder = null;
	bcSIMOrder = null;
	bcSIMOrderLine = null;

	return(intReturn);		
}
"/**************************************************************************************
* Name          : SIM Order Line Approval Form Applet Invoke Method		              * 
* Author        : Mahindra British Telecom                                            *
* Description   : SIM Order Code file.								  		          *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2003 	1.0   		   MBT	     	Created      			22/12/2003        *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){

	if(MethodName == ""NewQuery"")
		TheApplication().SetSharedGlobal(""g_Availability"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"")
		TheApplication().SetSharedGlobal(""g_Availability"",""Y"");
	 
}
"/**************************************************************************************
* Name          : SIM Order Line Approval Form Applet PreCanInvoke Method		      * 
* Author        : Mahindra British Telecom                                            *
* Description   : SIM Order Code file.								  		          *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2003 	1.0   		   MBT	     	Created      			22/12/2003        *
* 20060710      1.1            Kalyana      Siebel ES SCR1, Objects Destroyed
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	var boSimOrder;
	var bcSimOrder;
	var bcSimOrderLine;
	
	var strOrderStatus;
	var strOrderLineStatus;
	var	blnAvailable;
	var intReturn = ContinueOperation;
		
	boSimOrder = TheApplication().ActiveBusObject();
	bcSimOrder = boSimOrder.GetBusComp(""RMS SIM Order Approval"");
	bcSimOrderLine = boSimOrder.GetBusComp(""RMS SIM Order Line Approval"");
	
	strOrderStatus = bcSimOrder.GetFieldValue(""Status"");
	
    blnAvailable = TheApplication().GetSharedGlobal(""g_Availability"");

//-----------------------------------------------------------------
//Enabling the buttons only if order status is ""Awaiting Approval""
//-----------------------------------------------------------------	
	switch(MethodName){
		case ""Approve"":
			if((blnAvailable == ""Y"" || blnAvailable == """") 
 			&& (strOrderStatus==TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""AWAITING APPROVAL"")))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";
			intReturn = CancelOperation;
			break;
					
		case ""Reject"":
			if((blnAvailable == ""Y"" || blnAvailable == """") 
 			&& (strOrderStatus==TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""AWAITING APPROVAL"")))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";	
			intReturn = CancelOperation;
			break;
	}
	
	boSimOrder       = null;
	bcSimOrder       = null;
	//below 1.1
	bcSimOrderLine   = null;
	//above 1.1 
	return(intReturn);				
}
"/**************************************************************************************
* Name          : SIM Order Line Approval List Applet Invoke Method		              * 
* Author        : Mahindra British Telecom                                            *
* Description   : SIM Order Code file.								  		          *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2003 	1.0   		   MBT	     	Created      			22/12/2003        *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){

	if(MethodName == ""NewQuery"")
		TheApplication().SetSharedGlobal(""g_Availability"",""N"");
	 else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"")
	 	TheApplication().SetSharedGlobal(""g_Availability"",""Y"");
}
"/**************************************************************************************
* Name          : SIM Order Line Approval List Applet PreCanInvoke Method		      * 
* Author        : Mahindra British Telecom                                            *
* Description   : SIM Order Code file.								  		          *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2003 	1.0   		   MBT	     	Created      			22/12/2003        *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	var boSimOrder;
	var bcSimOrder;
	
	var strStatus;
	var	blnAvailable;
	var intReturn = ContinueOperation;
		
	boSimOrder = TheApplication().ActiveBusObject();
	bcSimOrder = boSimOrder.GetBusComp(""RMS SIM Order Approval"");
	
	strStatus = bcSimOrder.GetFieldValue(""Status"");
    blnAvailable = TheApplication().GetSharedGlobal(""g_Availability"");

//-----------------------------------------------------------------
//Enabling the buttons only if order status is ""Awaiting Approval""
//-----------------------------------------------------------------	
	switch(MethodName){
		case ""Approve"":
			if((blnAvailable == ""Y"" || blnAvailable == """") 
 			&& (strStatus==TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""AWAITING APPROVAL"") || strStatus==TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""APPROVAL REJECTED"")))
 				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";
			intReturn = CancelOperation;
			break;
					
		case ""Reject"":
			if((blnAvailable == ""Y"" || blnAvailable == """") 
 			&& (strStatus==TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""AWAITING APPROVAL"")))
				CanInvoke = ""TRUE"";
			else
				CanInvoke = ""FALSE"";	
			intReturn = CancelOperation;
			break;
	}
	
	boSimOrder = null;
	bcSimOrder = null;
	return(intReturn);				
}
"/**************************************************************************************
* Name          : SIM Order Line Approval List Applet Invoke Method		              * 
* Author        : Mahindra British Telecom                                            *
* Description   : SIM Order Approval Code file.								  		  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2003 	1.0   		   MBT	     	Created      			22/12/2003        *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){

	if(MethodName == ""NewQuery"")
		TheApplication().SetSharedGlobal(""Availability"",""N"");
	 else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"")
	 	TheApplication().SetSharedGlobal(""Availability"",""Y"");
}
"/**************************************************************************************
* Name          : SIM Order Line Approval List Applet PreCanInvoke Method		      * 
* Author        : Mahindra British Telecom                                            *
* Description   : SIM Order Approval Code file.								  		  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2003 	1.0   		   MBT	     	Created      			22/12/2003        *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

/*	var boSimOrder;
	var bcSimOrder;
	var strStatus;
    
	var intReturn = ContinueOperation;
	
	boSimOrder = TheApplication().ActiveBusObject();
	bcSimOrder = boSimOrder.GetBusComp(""SIM Order Approval"");
	
	strStatus = bcSimOrder.GetFieldValue(""Status"");
    blnAvailable = TheApplication().GetSharedGlobal(""Availability"");

//------------------------------------------------------------------
//To enable the buttons only if order status is ""Awaiting Approval""	
//------------------------------------------------------------------	
	
	switch(MethodName){
		case ""Approve"":
	
		case ""Reject"":
		
	}
	
	boSimOrder = null;
	bcSimOrder = null;
*/
	return(ContinueOperation);		

}
"/**************************************************************************************
* Name          : SIM Order Line Form Applet Invoke Method					 	       	  * 
* Author        : MBT (Pune-India)                                                    *
* Description   : Code file to set flag depending on method invoked             	  *
* Input Params  :                                                                     *   
*                                                                                     *
* Output Params :                                                                     *                                    
*                                                                                     *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2002 	1.0   		MBT(Pune)     	Created      			22/01/2003        *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName)
{
	if(MethodName == ""NewQuery"")
		TheApplication().SetSharedGlobal(""Availability"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"")
		TheApplication().SetSharedGlobal(""Availability"",""Y"");
}
"/**************************************************************************************
* Name          : SIM Order Line Form Applet PreCanInvoke Method 	       	  		  * 
* Author        : Mahindra British Telecom                                            *
* Description   : Code is to check whether the user has the authority to invoke the   *
*				  Applet method.			                                     	  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2003 	1.0   		MBT			   	Created      			22/01/2003        *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var boSIMOrder;

	var bcSIMOrder;
	var bcSIMOrderLine;

	var strStatus;
	var strOrdLineStatus;

	var blnIsRecord = true;

	var intReturn = ContinueOperation;
	
	try
	{
		bcSIMOrderLine	 = this.BusComp();
	    bcSIMOrder		 = bcSIMOrderLine.ParentBusComp(); 
	    strStatus		 = bcSIMOrder.GetFieldValue(""Status"");	
		strOrdLineStatus = bcSIMOrderLine.GetFieldValue(""Status"");
	}
	catch(e)
	{
	blnIsRecord = false;
	} 
	
	switch(MethodName)
	{
		case ""NewRecord"" :
		
		case ""CopyRecord"":
		
			if((strStatus != ""New"") && (strStatus != ""Approval Rejected"") && (strStatus != ""Open""))
			{
				CanInvoke = ""FALSE"";
				intReturn = CancelOperation;
			}
			break;

		case ""DeleteRecord"":
		
			if((!(strStatus == ""Approved"" && strOrdLineStatus == ""To Be Deleted""))&&(!(strStatus==""New"")))
			{
				CanInvoke=""FALSE"";
				intReturn = CancelOperation;
			}
			break;
	}
	
	boSIMOrder = null;
	bcSIMOrder = null;
	bcSIMOrderLine = null;
	return(intReturn);		
}
"/**************************************************************************************
* Name          : SIM Order Line Form Applet Invoke Method	    		 	       	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : Code file to set flag depending on method invoked             	  *
* Input Params  :                                                                     *   
*                                                                                     *
* Output Params :                                                                     *                                    
*                                                                                     *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2002 	1.0   		MBT		     	Created      			22/01/2003        *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName)
{
	if(MethodName == ""NewQuery"")
		TheApplication().SetSharedGlobal(""Availability"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"")
		TheApplication().SetSharedGlobal(""Availability"",""Y"");
}
"/**************************************************************************************
* Name          : SIM Order Line Form Applet PreCanInvoke Method 	       	  		  * 
* Author        : Mahindra British Telecom                                            *
* Description   : Code is to check whether the user has the authority to invoke the   *
*				  Applet method.			                                     	  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2002 	1.0   		MBT			   	Created      			22/01/2003        *
* 20060710      1.1         Kalyana         Siebel ES SCR1, Objects Destroyed
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var boSIMOrder;

	var bcSIMOrder;
	var bcSIMOrderLine;

	var strStatus;
	var strOrdLineStatus;

	var lboSIMOrder 	= TheApplication().GetBusObject(""RMS SIM Order"");
	var lbcSIMOrderLine	= lboSIMOrder.GetBusComp(""RMS SIM Order Line""); 

	var blnIsRecord = true;

	var intReturn = ContinueOperation;
	
	try{
		bcSIMOrderLine	 = this.BusComp();
	    bcSIMOrder		 = bcSIMOrderLine.ParentBusComp(); 
	    strStatus		 = bcSIMOrder.GetFieldValue(""Status"");	
		strOrdLineStatus = bcSIMOrderLine.GetFieldValue(""Status"");
	}
	catch(e){
	blnIsRecord = false;
	} 
	
	switch(MethodName)
	{
	//	case ""NewRecord"" :
				
	/*			with(lbcSIMOrderLine)
					{
						NewRecord(1);
						SetFieldValue(""Order Id"",lboSIMOrder.GetFieldValue(""Id"")); 
						var temp = lboSIMOrder.GetFieldValue(""Organization Name"");
						var orgid = lboSIMOrder.GetFieldValue(""Organization Id"");
						var divid = lboSIMOrder.GetFieldValue(""Division Id"");
						var bcSalesChannel = GetPicklistBusComp(""Sales Channel Name"");
						with(bcSalesChannel) 
							{
								SetViewMode(AllView);
								ClearToQuery()
								SetSearchSpec(""Id"",lboSIMOrder.GetFieldValue(""Organization Id""));
								ExecuteQuery();
								if(FirstRecord())
									Pick();
							}
*/							
    //					WriteRecord();
	//	           }
		    case ""NewRecord"":
			if(strStatus != TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""NEW""))      
			{
				CanInvoke = ""FALSE"";
				intReturn = CancelOperation;
			}
			break;
			case ""CopyRecord"":
			if((strStatus != TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""NEW"")) && (strStatus != TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""APPROVAL REJECTED"")) && (strStatus != TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""OPEN"")))
			{
				CanInvoke = ""FALSE"";
				intReturn = CancelOperation;
			}
			break;

		case ""DeleteRecord"":
			if(strStatus != TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""NEW"")){
				CanInvoke = ""FALSE"";
				intReturn = CancelOperation;
			}	
			break;

	}
	
	boSIMOrder = null;
	bcSIMOrder = null;
	bcSIMOrderLine = null;
//below 1.1	
	lbcSIMOrderLine = null;
	lboSIMOrder     = null;
//above 1.1
	return(intReturn);		
}
"/**************************************************************************************
* Name          : SIM Order Line List Applet Invoke Method		 		              * 
* Author        : Mahindra British Telecom                                            *
* Description   : Code file to set flag depending on method invoked			  		  *
* Input Params  :                                                                     *
*                                                                                     *
* Output Params :                                                                     *
*                                                                                     *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2002 	1.0   		MBT		     	Created      			22/01/2003        *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName)
{
	if(MethodName == ""NewQuery"")
		TheApplication().SetSharedGlobal(""Availability"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"") 
		TheApplication().SetSharedGlobal(""Availability"",""Y"");
	
}
"/**************************************************************************************
* Name          : SIM Order Line Form Applet PreCanInvoke Method 	       	  		  * 
* Author        : Mahindra British Telecom                                            *
* Description   : Code is to check whether the user has the authority to invoke the   *
*				  Applet method.			                                     	  *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2002 	1.0   		MBT			   	Created      			22/01/2003        *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var boSIMOrder;

	var bcSIMOrder;
	var bcSIMOrderLine;

	var strStatus;
	var strOrdLineStatus;

	var blnIsRecord = true;

	var intReturn = ContinueOperation;
	
	try{
		bcSIMOrderLine	 = this.BusComp();
	    bcSIMOrder		 = bcSIMOrderLine.ParentBusComp(); 
	    strStatus		 = bcSIMOrder.GetFieldValue(""Status"");	
		strOrdLineStatus = bcSIMOrderLine.GetFieldValue(""Status"");
	}
	catch(e){
	blnIsRecord = false;
	} 
	
	switch(MethodName)
	{
/*		case ""NewRecord"" :

		var bcSalesChannel = GetPicklistBusComp(""Sales Channel Name"");
		with(bcSalesChannel) 
				{
					SetViewMode(AllView);
					ClearToQuery()
					SetSearchSpec(""Id"",lboSIMOrder.GetFieldValue(""Organization Id""));
					ExecuteQuery();
					if(FirstRecord())
						Pick();
				}
			break;
*/			case ""NewRecord"":
			if(strStatus != TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""NEW"")){
				CanInvoke = ""FALSE"";
				intReturn = CancelOperation;
			}	
			break;
		

			case ""CopyRecord"":

			if((strStatus != TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""NEW"")) && (strStatus != TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""APPROVAL REJECTED"")) && (strStatus != TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""OPEN"")))
			{
				CanInvoke = ""FALSE"";
				intReturn = CancelOperation;
			}
			break;

		case ""DeleteRecord"":
			if(strStatus != TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""NEW"")){
				CanInvoke = ""FALSE"";
				intReturn = CancelOperation;
			}	
			break;
			
		case ""UpdateStartEndNumber"":
				if(strStatus != TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""NEW"")){
				CanInvoke = ""FALSE"";
				intReturn = CancelOperation;
			}	
			break;
	}
	
	boSIMOrder = null;
	bcSIMOrder = null;
	bcSIMOrderLine = null;

	return(intReturn);		
}
"/**************************************************************************************
* Name          : SIM Order Line List Applet Invoke Method		                      * 
* Author        : Mahindra British Telecom                                            *
* Description   : SIM Order Code file.								  		          *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2003 	1.0   		   MBT	     	Created      			22/12/2003        *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){

	if(MethodName == ""NewQuery"")
		TheApplication().SetSharedGlobal(""Availability"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"") 
		TheApplication().SetSharedGlobal(""Availability"",""Y"");
	
}
"/**************************************************************************************
* Name          : SIM Order Line List Applet PreCanInvoke Method		              * 
* Author        : Mahindra British Telecom                                            *
* Description   : SIM Order Code file.								  		          *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2003 	1.0   		   MBT	     	Created      			22/12/2003        *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	var boSIMOrder;

	var bcSIMOrder;
	var bcSIMOrderLine;

	var strStatus;
	var strOrdLineStatus;

	var blnAvailable;
	var blnIsRecord = true;
	
	var intReturn = ContinueOperation;
	
	try{
		bcSIMOrderLine   = this.BusComp();
	    bcSIMOrder		 = bcSIMOrderLine.ParentBusComp(); 
	    strStatus		 = bcSIMOrder.GetFieldValue(""Status"");	
		strOrdLineStatus = bcSIMOrderLine.GetFieldValue(""Status"");
	}
	catch(e){
		blnIsRecord = false;
	}
	 
	switch(MethodName){
		case ""NewRecord"" :
		case ""CopyRecord"":
			if((strStatus != TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""NEW"")) && (strStatus != TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""APPROVAL REJECTED"")) && (strStatus != TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""OPEN""))){
				CanInvoke = ""FALSE"";
				intReturn = CancelOperation;
			}	
			break;
			
		case ""DeleteRecord"":
			if((!(strStatus==TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""APPROVED"") && strOrdLineStatus==TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDERLINE_STATUS"", ""TO BE DELETED"")))
				&&(!(strStatus==TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""NEW"")))){
					CanInvoke = ""FALSE"";
					intReturn = CancelOperation;
			}		
			break;
			
	}
	
	boSIMOrder = null;
	bcSIMOrder = null;
	bcSIMOrderLine = null;
	
	return(intReturn);
}
"/**************************************************************************************
* Name          : SIM Order List Applet Invoke Method		                          * 
* Author        : Mahindra British Telecom                                            *
* Description   : SIM Order Code file.								  		          *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2003 	1.0   		   MBT	     	Created      			22/12/2003        *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName)
{

	if(MethodName == ""NewQuery"")
		TheApplication().SetSharedGlobal(""g_QueryMode"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"") 
		TheApplication().SetSharedGlobal(""g_QueryMode"",""Y"");

}
"/**************************************************************************************
* Name          : SIM Order List Applet PreCanInvoke Method		                      * 
* Author        : Mahindra British Telecom                                            *
* Description   : SIM Order Code file.								  		          *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2003 	1.0   		   MBT	     	Created      			22/12/2003        *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{

	var bcSIMOrder;
	var strStatus;

	var blnSimOrdButton;
	var blnDelete = true;

	var intReturn = ContinueOperation;

	blnSimOrdButton=TheApplication().GetSharedGlobal(""g_QueryMode""); /* Check */

	bcSIMOrder = this.BusComp();

	
	try
	{
			strStatus =bcSIMOrder.GetFieldValue(""Status"");
	}
	catch(e)
	{
//		return(CancelOperation); 
	}

	switch(MethodName)
	{

		case ""SendForApproval"":
			
				if((strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""NEW"")) || (strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""APPROVAL REJECTED"")) || (strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""OPEN"")) ){  
          			if((blnSimOrdButton == ""Y"" || blnSimOrdButton == """")) 
						CanInvoke = ""TRUE"";
				}
			
			else
				CanInvoke = ""FALSE"";
				
				
			intReturn = CancelOperation;
			break;
			
		case ""GenerateFile"":
		case ""ShowPopup"":
		case ""ReadERP"":
			
			if(""IMPORTERP_INACTIVE"" != TheApplication().InvokeMethod(""LookupValue"", ""RMS_ORDER_ADMIN"", ""IMPORTERP_INACTIVE"")) {
				if((blnSimOrdButton == ""Y"" || blnSimOrdButton == """")) 
					CanInvoke = ""TRUE"";
				else
					CanInvoke = ""FALSE"";
			} else
				CanInvoke = ""FALSE"";
			
			intReturn = CancelOperation;
			break;
			
		case ""SubmitToSupplier"":
		
		//	if((strStatus ==TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""APPROVED"")) || (strStatus ==TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""PO SUSPENDED"")))
    		if((strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""NEW"")))
			{
				if(blnSimOrdButton == ""Y"" || blnSimOrdButton == """")
					CanInvoke = ""TRUE"";	
				else
				  	CanInvoke = ""FALSE"";
				  	
			}
	
			intReturn = CancelOperation;
			break;
			
		case ""CancelOrder"":
			if((strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""APPROVED"")) || (strStatus ==TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""PO GENERATED""))
			||(strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""AWAITING APPROVAL"")) || (strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""OPEN""))){
				if(blnSimOrdButton == ""Y"" || blnSimOrdButton == """")
					CanInvoke = ""TRUE"";						
			}
			intReturn = CancelOperation;
			break;
			
		case ""DeleteRecord"":
			if(strStatus != TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""NEW"")){
				CanInvoke = ""FALSE"";
				intReturn = CancelOperation;
			}	

			break;
			
			
	}			

	//bcSIMOrder = null;
	return (intReturn);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	if(MethodName == ""GenerateFile"") {
		var bsWFP 			= TheApplication().GetService(""Workflow Process Manager"");
		var psInp			= TheApplication().NewPropertySet();
		var psOut			= TheApplication().NewPropertySet();
		var sOrderId		= this.BusComp().GetFieldValue(""Id"");
		var blnIsRecord		= false;
		var blnIsRecOrdLine	= false;
		
		var boOrder		= TheApplication().GetBusObject(""RMS SIM Order"");
		var bcOrderLine	= boOrder.GetBusComp(""RMS SIM Order Line"");
		var bcOrdFile	= boOrder.GetBusComp(""RMS SIM Order Line File Info"");
		
		with (bcOrderLine) {
			ActivateField(""Card Category"");
			ClearToQuery();
			SetSearchSpec(""Order Id"",sOrderId);
			ExecuteQuery(ForwardOnly);
			blnIsRecord = FirstRecord();
			
			while(blnIsRecord) {
				var sOrderLineId 	= bcOrderLine.GetFieldValue(""Id"");
				var sCardCatgory	= bcOrderLine.GetFieldValue(""Card Category"");
				with (bcOrdFile) {
					ActivateField(""File Name"");
					ActivateField(""BatchNumber"");
					ClearToQuery();
					SetSearchSpec(""SIM Order Line Id"",sOrderLineId);
					ExecuteQuery(ForwardOnly);
					blnIsRecOrdLine = FirstRecord();
					
					while(blnIsRecOrdLine) {
						//psInp.SetProperty(""FilePath"",bcSysPref.GetFieldValue(""Value""));
						psInp.SetProperty(""Object Id"",sOrderId);
						psInp.SetProperty(""RowId"",sOrderId);
						psInp.SetProperty(""OrderLineId"",sOrderLineId);
						psInp.SetProperty(""CardType"",sCardCatgory);
						psInp.SetProperty(""FileName"",bcOrdFile.GetFieldValue(""File Name""));
						psInp.SetProperty(""FileRecId"",bcOrdFile.GetFieldValue(""Id""));
						//psInp.SetProperty(""ProcessName"",""RMS SIM Submit To Supplier - Generate File"");
						psInp.SetProperty(""ProcessName"",""RMS Generate SIM Order File"");
						//bsSIMFile.InvokeMethod(""GenerateFile"",prsInputs,prsOutputs);
						bsWFP.InvokeMethod(""RunProcess"",psInp,psOut);
						
						blnIsRecOrdLine = NextRecord();
					} // end while blnIsRecOrdLine
					
				} // end with bcOrdFile
				
				blnIsRecord = bcOrderLine.NextRecord();
			} // end while blnIsRecord
		} // end with bcOrderLine
		
		psOut 	= null;
		psInp	= null;
		bsWFP	= null;
		
		return (CancelOperation);
		
	} else 
	return (ContinueOperation);
}
"/**************************************************************************************
* Name          : SIM Order Paper Item Assoc Applet PreCanInvoke Method		          * 
* Author        : Mahindra British Telecom                                            *
* Description   : SIM Order Code file.								  		          *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2003 	1.0   		   MBT	     	Created      			22/12/2003        *
* 20060710      1.1            Kalyana      Siebel ES SCR1, Objects Destroyed         *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	var boSIMSupplier;

	var bcSIMSupplier;
	var bcSIMOrdPaperItem;
	var bcSIMSuplrPprItm;

	var blnIsRecord;
	var strSearchSpec;	
	
	if(MethodName == ""ExecuteQuery""){
		bcSIMOrdPaperItem = this.BusComp();

		if(bcSIMOrdPaperItem.GetUserProperty(""SuppressQuery"") != ""Y"") {
			boSIMSupplier = TheApplication().GetBusObject(""SIM Supplier"");
			bcSIMSupplier = boSIMSupplier.GetBusComp(""SIM Supplier"");
			bcSIMSuplrPprItm = boSIMSupplier.GetBusComp(""SIM Paper Item"");
			
			with(bcSIMSupplier){
				ClearToQuery();
				SetSearchSpec(""Id"",TheApplication().GetSharedGlobal(""SupplierId""));
				ExecuteQuery();
			}
			
			with(bcSIMSuplrPprItm){
				ClearToQuery();
				ExecuteQuery();
			
				blnIsRecord = FirstRecord();
			}
			strSearchSpec = """";

//---------------------------------------------------------------------------
//To filter the paper items i.e to retrieve the paper items corresponding to
//the selected supplier in the active order
//---------------------------------------------------------------------------
			while(blnIsRecord){
				if(strSearchSpec.length == 0)
					strSearchSpec = strSearchSpec + ""[Id]=\'"" + bcSIMSuplrPprItm.GetFieldValue(""Id"")+""\'"";
				else
					strSearchSpec = strSearchSpec + "" OR [Id]=\'"" + bcSIMSuplrPprItm.GetFieldValue(""Id"")+""\'"";				
					
				blnIsRecord = bcSIMSuplrPprItm.NextRecord();
			}
			
			with(bcSIMOrdPaperItem){
				SetSearchSpec(""Id"",strSearchSpec);
				ExecuteQuery();
				SetUserProperty(""SuppressQuery"",""Y"");
			}
		}
	
	}
//below 1.1
	bcSIMSuplrPprItm  = null;
	bcSIMSupplier     = null;
	boSIMSupplier     = null;
//above  1.1
	return (ContinueOperation);
}
"/**************************************************************************************
* Name          : SIM Order Paper Item Assoc Applet PreInvoke Method		          * 
* Author        : Mahindra British Telecom                                            *
* Description   : SIM Order Code file.								  		          *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2003 	1.0   		   MBT	     	Created      			22/12/2003        *
**************************************************************************************/

function WebApplet_PreInvokeMethod (MethodName){

	var bcSIMPaperItem = this.BusComp();
	if(MethodName == ""GotoNextSet"" || MethodName == ""GotoPreviousSet"") {
		bcSIMPaperItem.SetUserProperty(""SuppressQuery"",""Y"");
	}
	if(MethodName == ""ExecuteQuery"" || MethodName == ""Find"" || MethodName == ""CloseApplet"")
		bcSIMPaperItem.SetUserProperty(""SuppressQuery"",""N"");

	return (ContinueOperation);
}
"/**************************************************************************************
* Name          : SIM Order Paper Items List Applet PreCanInvoke Method		          * 
* Author        : Mahindra British Telecom                                            *
* Description   : SIM Order Code file.								  		          *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2003 	1.0   		   MBT	     	Created      			22/12/2003        *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	var boSimOrder;
	var bcSimOrder;

	var strStatus;
	var intReturn = ContinueOperation;

	boSimOrder = TheApplication().ActiveBusObject();
	bcSimOrder = boSimOrder.GetBusComp(""RMS SIM Order"");

	strStatus = bcSimOrder.GetFieldValue(""Status"");

	switch(MethodName){
		case ""DeleteRecord"":
		case ""NewRecord"":
			if((strStatus!=TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""NEW"")) && (strStatus!=TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""OPEN"")) && (strStatus!=TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""APPROVAL REJECTED""))){
				CanInvoke=""FALSE"";
				intReturn = CancelOperation;
			}	
			break;
			
		case ""CopyRecord"":	
			CanInvoke=""FALSE"";
			intReturn = CancelOperation;
			break;
				
	}		
			
	boSimOrder = null;		
	bcSimOrder = null;
	
	return(intReturn);
}
"/**************************************************************************************
* Name          : SIM Order Paper Items List Applet PreInvoke Method		          * 
* Author        : Mahindra British Telecom                                            *
* Description   : SIM Order Code file.								  		          *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2003 	1.0   		   MBT	     	Created      			22/12/2003        *
**************************************************************************************/

function WebApplet_PreInvokeMethod (MethodName){

	var bcPaperItem;
	var bcOrder;
	
	if(MethodName == ""NewRecord"") {
		bcPaperItem = this.BusComp();
		bcOrder     = bcPaperItem.ParentBusComp();
		
		TheApplication().SetSharedGlobal(""SupplierId"",bcOrder.GetFieldValue(""Supplier Id""));
		
		bcPaperItem = null;
		bcOrder = null;
	}
	return (ContinueOperation);
}
"/**************************************************************************************
* Name          : SIM Order Paper Items List Applet PreCanInvoke Method		          * 
* Author        : Mahindra British Telecom                                            *
* Description   : SIM Order Code file.								  		          *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2003 	1.0   		   MBT	     	Created      			22/12/2003        *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	var boSimOrder;
	var bcSimOrder;

	var strStatus;
	var intReturn = ContinueOperation;

	boSimOrder = TheApplication().ActiveBusObject();
	bcSimOrder = boSimOrder.GetBusComp(""RMS SIM Order"");

	strStatus = bcSimOrder.GetFieldValue(""Status"");

	switch(MethodName){
		case ""DeleteRecord"":
		case ""NewRecord"":
			if((strStatus!=TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""NEW"")) && (strStatus!=TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""OPEN"")) && (strStatus!=TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""APPROVAL REJECTED""))){
				CanInvoke=""FALSE"";
				intReturn = CancelOperation;
			}	
			break;
			
		case ""CopyRecord"":	
			CanInvoke=""FALSE"";
			intReturn = CancelOperation;
			break;
				
	}		
			
	boSimOrder = null;		
	bcSimOrder = null;
	
	return(intReturn);
}
"/**************************************************************************************
* Name          : SIM Order Paper Items List Applet PreInvoke Method		          * 
* Author        : Mahindra British Telecom                                            *
* Description   : SIM Order Code file.								  		          *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2003 	1.0   		   MBT	     	Created      			22/12/2003        *
**************************************************************************************/

function WebApplet_PreInvokeMethod (MethodName){

	var bcPaperItem;
	var bcOrder;
	
	if(MethodName == ""NewRecord"") {
		bcPaperItem = this.BusComp();
		bcOrder     = bcPaperItem.ParentBusComp();
		
		TheApplication().SetSharedGlobal(""SupplierId"",bcOrder.GetFieldValue(""Supplier Id""));
		
		bcPaperItem = null;
		bcOrder = null;
	}
	return (ContinueOperation);
}
"/**************************************************************************************
* Name          : SIM Order List Applet Invoke Method		                          * 
* Author        : Mahindra British Telecom                                            *
* Description   : SIM Order Code file.								  		          *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2003 	1.0   		   MBT	     	Created      			22/12/2003        *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){

	if(MethodName == ""NewQuery"")
		TheApplication().SetSharedGlobal(""QueryMode"",""N"");
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery"") 
		TheApplication().SetSharedGlobal(""QueryMode"",""Y"");

}
"/**************************************************************************************
* Name          : SIM Order List Applet PreCanInvoke Method		                      * 
* Author        : Mahindra British Telecom                                            *
* Description   : SIM Order Code file.								  		          *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     	Comments     			Reviewed Date     *
***************************************************************************************
*                                                                                     *
* 12/12/2003 	1.0   		   MBT	     	Created      			22/12/2003        *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var bcSIMOrder;
	var strStatus;
	var blnSimOrdButton;
	var blnDelete = true;
	var intReturn = ContinueOperation;

	blnSimOrdButton=TheApplication().GetSharedGlobal(""QueryMode"");
	bcSIMOrder = this.BusComp();
	
	try{
		strStatus =bcSIMOrder.GetFieldValue(""Status"");
	}
	catch(e){
	//	return(intReturn);
	}

	switch(MethodName){
		case ""SendForApproval"":
			if((strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""NEW"")) || (strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""APPROVAL REJECTED"")) || (strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""OPEN"")) ){  
          		if((blnSimOrdButton == ""Y"" || blnSimOrdButton == """")) 
					CanInvoke = ""TRUE"";
			}
			intReturn = CancelOperation;
			break;
			
		case ""SubmitToSupplier"":
			if((strStatus ==TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""APPROVED"")) || (strStatus ==TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""PO SUSPENDED""))){
				if(blnSimOrdButton == ""Y"" || blnSimOrdButton == """")
					CanInvoke = ""TRUE"";	
			}
			intReturn = CancelOperation;
			break;
			
		case ""CancelOrder"":
			if((strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""APPROVED"")) || (strStatus ==TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""PO GENERATED""))
			||(strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""APPROVAL REJECTED"")) || (strStatus == TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""OPEN""))){
				if(blnSimOrdButton == ""Y"" || blnSimOrdButton == """")
					CanInvoke = ""TRUE"";						
			}
			intReturn = CancelOperation;
			break;
			
		case ""DeleteRecord"":
			if(strStatus != TheApplication().InvokeMethod(""LookupValue"", ""SIM_ORDER_STATUS"", ""NEW"")){
				CanInvoke = ""FALSE"";
				intReturn = CancelOperation;
			}	
			break;
	}			

	bcSIMOrder = null;
	return (intReturn);
}
"/**************************************************************************************
* Name          : RMS SIM Paper Item WebApplet Invoke Method					 	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS SIM Paper Item Code File            	                          *
*                                                                                     *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 10/11/2003 	1.0   		MBT 	 					 Created       10/11/2003	  *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){

	if(MethodName == ""NewQuery""){
		TheApplication().SetSharedGlobal(""g_Release"",""N"");
		TheApplication().SetSharedGlobal(""g_UnRelease"",""N"");
	} 
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery""){
		TheApplication().SetSharedGlobal(""g_Release"",""Y"");
		TheApplication().SetSharedGlobal(""g_UnRelease"",""Y"");
	} 

}
"/**************************************************************************************
* Name          : RMS SIM Paper Item WebApplet PreCanInvoke Method					  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS SIM Paper Item Code File            	                          *
*                                                                                     *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 09/11/2003    1.0   		MBT						   	Created       09/11/2003	  *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	var bcSIMPaperItem;

	var	blnRelValue;
	var	blnUnRelValue;
	
	var intReturn = ContinueOperation;
	
	bcSIMPaperItem = this.BusComp();

	switch(MethodName){

//----------------------------------------------------------------------
//Enable the release button only if the paper item hasnt been released.
//----------------------------------------------------------------------
		case ""ReleasePaperItem"":
	 		blnRelValue=TheApplication().GetSharedGlobal(""g_Release"");
 			if((bcSIMPaperItem.GetFieldValue(""Is Released"") == ""N"")
 			&& (blnRelValue == ""Y"" || blnRelValue == """"))
 		 		CanInvoke = ""TRUE"";				
  			intReturn = CancelOperation;
			break;

//----------------------------------------------------------------------
//Enable the unrelease button only if the paper item has been released.
//----------------------------------------------------------------------			
		case ""UnreleasePaperItem"":
	 	 	blnUnRelValue = TheApplication().GetSharedGlobal(""g_UnRelease"");
			if((bcSIMPaperItem.GetFieldValue(""Is Released"") == ""Y"")
			&& (blnUnRelValue == ""Y"" || blnUnRelValue == """"))
	  			CanInvoke = ""TRUE"";				
  			intReturn = CancelOperation;
			break;

//-------------------------------------------------------------------
//Disable the delete button only if the paper item has been released.
//-------------------------------------------------------------------
		case ""DeleteRecord"":
		  	if(bcSIMPaperItem.GetFieldValue(""Is Released"") == ""Y""){
		  		CanInvoke = ""FALSE"";
  				intReturn = CancelOperation;
			}
			break;
	}
  	
	bcSIMPaperItem = null;
	return (intReturn);
}
"/**************************************************************************************
* Name          : RMS SIM Paper Item WebApplet Invoke Method					 	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS SIM Paper Item Code File            	                          *
*                                                                                     *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 10/11/2003 	1.0   		MBT						   	Created       10/11/2003	  *
**************************************************************************************/

function WebApplet_InvokeMethod (MethodName){

	if(MethodName == ""NewQuery""){
		TheApplication().SetSharedGlobal(""g_Release"",""N"");
		TheApplication().SetSharedGlobal(""g_UnRelease"",""N"");
	} 
	else if(MethodName == ""ExecuteQuery"" || MethodName == ""UndoQuery""){ 
		TheApplication().SetSharedGlobal(""g_Release"",""Y"");
		TheApplication().SetSharedGlobal(""g_UnRelease"",""Y"");
	} 
}
"/**************************************************************************************
* Name          : RMS SIM Paper Item WebApplet PreCanInvoke Method					  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS SIM Paper Item Code File            	                          *
*                                                                                     *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 10/11/2003 	1.0   		MBT						   	Created       10/11/2003	  *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	var bcSIMPaperItem;

	var	blnRelValue;
	var	blnUnRelValue;
	
	var intReturn = ContinueOperation;
	
	bcSIMPaperItem = this.BusComp();

	switch(MethodName){

//----------------------------------------------------------------------
// Enable the release button only if the paper item hasnt been released.
//----------------------------------------------------------------------
		case ""ReleasePaperItem"":
	 		blnRelValue=TheApplication().GetSharedGlobal(""g_Release"");
 			if((bcSIMPaperItem.GetFieldValue(""Is Released"") == ""N"")
 			&& (blnRelValue == ""Y"" || blnRelValue == """"))
 		 		CanInvoke = ""TRUE"";				
  			intReturn = CancelOperation;
			break;

//----------------------------------------------------------------------
// Enable the unrelease button only if the paper item has been released.
//----------------------------------------------------------------------			
		case ""UnreleasePaperItem"":
	 	 	blnUnRelValue = TheApplication().GetSharedGlobal(""g_UnRelease"");
			if((bcSIMPaperItem.GetFieldValue(""Is Released"") == ""Y"")
			&& (blnUnRelValue == ""Y"" || blnUnRelValue == """"))
	  			CanInvoke = ""TRUE"";				
  			intReturn = CancelOperation;
			break;

//--------------------------------------------------------------------			
// Disable the delete button only if the paper item has been released.
//--------------------------------------------------------------------
		case ""DeleteRecord"":
		  	if(bcSIMPaperItem.GetFieldValue(""Is Released"") == ""Y""){
		  		CanInvoke = ""FALSE"";
  				intReturn = CancelOperation;
			}
			break;
	}
  	
	bcSIMPaperItem = null;
	return (intReturn);
}
"/**************************************************************************************
* Name          : RMS SIM Paper Item WebApplet PreCanInvoke Method					  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS SIM Paper Item Code File            	                          *
*                                                                                     *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 10/11/2003 	1.0   		MBT						   	Created      10/11/2003	      *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke){

	var boSIMPaperItem;

	var bcSIMPaperItem;
	var bcSIMSupplier;	

 	var intReturn = ContinueOperation;
 		
	boSIMPaperItem = TheApplication().ActiveBusObject();
	bcSIMPaperItem = boSIMPaperItem.GetBusComp(""RMS SIM Paper Item"");	
	bcSIMSupplier  = boSIMPaperItem.GetBusComp(""RMS SIM Supplier"");

	switch(MethodName){

//----------------------------------------------------------------	
//Enable the new button only if the paper item has been released.
//----------------------------------------------------------------
		case ""NewRecord"":
			if(bcSIMPaperItem.GetFieldValue(""Is Released"") == ""N"" 
									|| 
				bcSIMPaperItem.GetFieldValue(""Status"") == TheApplication().InvokeMethod (""LookupValue"", ""SIM_PAPER_ITEM_STATUS"", ""INACTIVE"")){
		 		CanInvoke = ""FALSE"";
		 		intReturn = CancelOperation;
		 	}			
			break;
		case ""CopyRecord"":
			CanInvoke = ""FALSE"";	
			intReturn = CancelOperation;		
			break;
	}
			
	boSIMPaperItem = null;
	bcSIMPaperItem = null;
	bcSIMSupplier  = null;	
	
	return(intReturn);

}
"/**************************************************************************************
* Name          : RMS SIM Supplier Paper Item WebApplet PreCanInvoke Method	 	  * 
* Author        : Mahindra British Telecom                                            *
* Description   : RMS SIM Supplier Paper Item Code File       	                      *
*                                                                                     *
* Amendment Details                                                                   *
***************************************************************************************
* Date    		Version  	AmendedBy     				Comments     Reviewed Date    *
***************************************************************************************
*                                                                                     *
* 15/10/2003 	 1.0   		MBT						   	Created       15/10/2003	  *
**************************************************************************************/

function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if(MethodName == ""CopyRecord""){
		CanInvoke = ""False"";
		return(CancelOperation);
	}	
		
	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if(MethodName == ""SubmitSPBatch"")
	{
		var vStatus = this.BusComp().GetFieldValue(""Status"");
		var vSubStatus = this.BusComp().GetFieldValue(""Sub Status"");
		
		if((vStatus == TheApplication().InvokeMethod(""LookupValue"",""RMS_SP_AUTO_STATUS"",""New"")) && (vSubStatus == TheApplication().InvokeMethod(""LookupValue"",""RMS_SP_AUTO_SUB_STATUS"",""New"")))
		{
			CanInvoke = ""TRUE"";
			return (CancelOperation);
		}
		else
		{
			CanInvoke = ""FALSE"";
			return (CancelOperation);
		}
	}
	
	if(MethodName == ""DeleteRecord"")
	{
		var vStatus = this.BusComp().GetFieldValue(""Status"");
		var vSubStatus = this.BusComp().GetFieldValue(""Sub Status"");
		
		if((vStatus == TheApplication().InvokeMethod(""LookupValue"",""RMS_SP_AUTO_STATUS"",""New"")) && (vSubStatus == TheApplication().InvokeMethod(""LookupValue"",""RMS_SP_AUTO_SUB_STATUS"",""New"")))
		{
			CanInvoke = ""TRUE"";
			return (CancelOperation);
		}
		else
		{
			CanInvoke = ""FALSE"";
			return (CancelOperation);
		}
	}

	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if(MethodName == ""SubmitSPBatch"")
	{
		var vStatus = this.BusComp().GetFieldValue(""Status"");
		var vSubStatus = this.BusComp().GetFieldValue(""Sub Status"");
		
		if((vStatus == TheApplication().InvokeMethod(""LookupValue"",""RMS_SP_AUTO_STATUS"",""New"")) && (vSubStatus == TheApplication().InvokeMethod(""LookupValue"",""RMS_SP_AUTO_SUB_STATUS"",""New"")))
		{
			CanInvoke = ""TRUE"";
			return (CancelOperation);
		}
		else
		{
			CanInvoke = ""FALSE"";
			return (CancelOperation);
		}
	}
	
	if(MethodName == ""DeleteRecord"")
	{
		var vStatus = this.BusComp().GetFieldValue(""Status"");
		var vSubStatus = this.BusComp().GetFieldValue(""Sub Status"");
		
		if((vStatus == TheApplication().InvokeMethod(""LookupValue"",""RMS_SP_AUTO_STATUS"",""New"")) && (vSubStatus == TheApplication().InvokeMethod(""LookupValue"",""RMS_SP_AUTO_SUB_STATUS"",""New"")))
		{
			CanInvoke = ""TRUE"";
			return (CancelOperation);
		}
		else
		{
			CanInvoke = ""FALSE"";
			return (CancelOperation);
		}
	}
	
	return (ContinueOperation);
}
//Your public declarations go here...
function WebApplet_InvokeMethod (MethodName)
{
}
function WebApplet_Load ()
{

}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	return (ContinueOperation);
}
function WebApplet_ShowControl (ControlName, Property, Mode, &HTML)
{

}
function WebApplet_ShowListColumn (ColumnName, Property, Mode, &HTML)
{

}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
if (MethodName == ""NewCust"")
{
    CanInvoke = ""TRUE"";
    return (CancelOperation);
}
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	var ireturn;

	try
	{
		ireturn = ContinueOperation;
		switch(MethodName)
		{
			 case ""NewCust"":
			 TheApplication().SetProfileAttr(""CampContact"",""Y"");
			 TheApplication().SetProfileAttr(""sPreview"",TheApplication().ActiveViewName());
			 var sBO = TheApplication().GetBusObject(""Campaign Members"")
			 var sBC = sBO.GetBusComp(""Campaign Members"");
			
			 //TheApplication().SetProfileAttr(""sFstname"",this.BusComp().GetFieldValue(""Contact First Name""));
			 //TheApplication().SetProfileAttr(""sLstname"",this.BusComp().GetFieldValue(""Contact Last Name""));
			 var FstName = this.BusComp().GetFieldValue(""Contact First Name"");
			 var LstName = this.BusComp().GetFieldValue(""Contact Last Name"")
			 if(FstName == """" || LstName=="""" )
			 {
			 	FstName = this.BusComp().GetFieldValue(""Prospect First Name"");
			 	LstName = this.BusComp().GetFieldValue(""Prospect Last Name"");
			 }
			 TheApplication().SetProfileAttr(""sFstname"",FstName);
			 TheApplication().SetProfileAttr(""sLstname"",LstName);
			 this.BusComp().ActivateField(""SRC_ID"");
			 TheApplication().SetProfileAttr(""sCampaignId"",this.BusComp().GetFieldValue(""SRC_ID""));
			 TheApplication().GotoView(""STC Create New Customer View"");
			 return(CancelOperation);
			 ireturn = ContinueOperation;
				break;
				
			default:
				ireturn = CancelOperation;
				break;
		}	
		return (ireturn);
	}
	catch(e)
	{
		throw(e);
	
	}
	finally
	{
	}
}
function VoucherPayment()
{
	this.BusComp().ActivateField(""STC Link Account ID"");
	var sBillAcntId = TheApplication().GetProfileAttr(""BillAccountId"");
	var sCustType = TheApplication().GetProfileAttr(""BillCustType"");
	//var sBillAcntId = this.BusComp().GetFieldValue(""STC Link Account ID"");
	TheApplication().SetProfileAttr(""SMEVoucherBillAcntId"",sBillAcntId);
	
	var sValidCustType = TheApplication().InvokeMethod(""LookupValue"",""STC_SMEVOUCHER_CUST_TYPE"",sCustType);
	var sValidCustTypeStr = sValidCustType.substring(0,13);
	if( sValidCustTypeStr != ""VALIDCUSTTYPE"")
		TheApplication().RaiseErrorText(""Payments valid for SME/Corporate type only"");

	
	var sBillAccntBO = TheApplication().GetBusObject(""STC Billing Account"");
	var sBillAccntBC = sBillAccntBO.GetBusComp(""CUT Invoice Sub Accounts"");
	
	//var sAccntBO = TheApplication().GetBusObject(""Account"");
	//var sAccntBC = sAccntBO.GetBusComp(""Account"");
	var IsBillAcntRec = """";
	var sCustAccntId = """";
	var sCPRId = """";
	
	with(sBillAccntBC){
		ActivateField(""Tax ID Number"");
		ActivateField(""Parent Account Id"");
		ClearToQuery();
		SetViewMode(AllView);
		SetSearchSpec(""Id"",sBillAcntId);
		ExecuteQuery(ForwardOnly);
		IsBillAcntRec = FirstRecord();
		if(IsBillAcntRec){
			sCustAccntId = 	GetFieldValue(""Parent Account Id"");
			sCPRId = GetFieldValue(""Tax ID Number"");
		/*	if(sCustAccntId != """"){
				with(sAccntBC){
					ActivateField(""Tax ID Number"");
					ClearToQuery();
					SetViewMode(AllView);
					SetSearchSpec(""Id"",sCustAccntId);
					ExecuteQuery(ForwardOnly);
					var sCustRecId = FirstRecord();
					if(sCustRecId){
						sCPRId = GetFieldValue(""Tax ID Number"");	
					}//endif sCustAccntId					
				}//endwith sAccntBC
			}//endif sCustAccntId */
		}//endif IsBillAcntRec		
	}//endwith sBillAccntBC
	
	if(sCPRId != """"){			
		TheApplication().SetProfileAttr(""SMEVoucherCPRId"",sCPRId);
				
		var sApps = TheApplication();
		var oServiceAF = sApps.GetService(""SLM Save List Service"");
		var inputPropAF = sApps.NewPropertySet();
		var outputPropAF = sApps.NewPropertySet();
		inputPropAF.SetProperty(""Applet Name"",""STC SME Voucher List Applet"");
		inputPropAF.SetProperty(""Applet Mode"",""6"");
		inputPropAF.SetProperty(""Applet Height"", ""700"");
		inputPropAF.SetProperty(""Applet Width"", ""700"");	
		
		oServiceAF.InvokeMethod(""LoadPopupApplet"", inputPropAF, outputPropAF);		
		
	}//endif sCPRId
	
	return CancelOperation;
}
function WebApplet_PreInvokeMethod (MethodName)
{
	if(MethodName == ""VoucherPayment""){
		VoucherPayment();
		return CancelOperation;
	}//endif MethodName == ""VoucherPayment""


		if(MethodName == ""PaymentReversal"")
		{
			    var vBulkTransId = this.BusComp().GetFieldValue(""Reference Number"");//Mayank
				var vBulkHeaderId = this.BusComp().GetFieldValue(""Id"");//Mayank
				var vPayType = this.BusComp().GetFieldValue(""Payment Method"");//Mayank
				var vPayAmt = this.BusComp().GetFieldValue(""Payment Amount"");
				var vVouAmt = this.BusComp().GetFieldValue(""STC Voucher Id"");
				var vCreated = this.BusComp().GetFieldValue(""Created"");//Mayank
				var psInputs = TheApplication().NewPropertySet();
				var psOutputs = TheApplication().NewPropertySet();
				var svcbsService = TheApplication().GetService(""Workflow Process Manager"");
				psInputs.SetProperty(""ProcessName"", ""STCPaymentReversalProcess"");
				psInputs.SetProperty(""Object Id"",vBulkHeaderId);
				psInputs.SetProperty(""vBulkTransId"",vBulkTransId);
				///psInputs.SetProperty(""vReversalReason"",ReversalReason);PaymentAmount VoucherId
                psInputs.SetProperty(""VoucherId"",vVouAmt);
				psInputs.SetProperty(""PaymentAmount"",vPayAmt);
				psInputs.SetProperty(""vCreated"",vCreated);
				psInputs.SetProperty(""vPayType"",vPayType);
				svcbsService.InvokeMethod(""RunProcess"", psInputs, psOutputs);
		
		return (CancelOperation);
		
		
		}
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	if(MethodName == ""VoucherPayment""){
		VoucherPayment();
		return CancelOperation;
	}//endif MethodName == ""VoucherPayment""


		if(MethodName == ""PaymentReversal"")
		{
			    var vBulkTransId = this.BusComp().GetFieldValue(""Reference Number"");//Mayank
				var vBulkHeaderId = this.BusComp().GetFieldValue(""Id"");//Mayank
				var vPayType = this.BusComp().GetFieldValue(""Payment Method"");//Mayank
				var vPayAmt = this.BusComp().GetFieldValue(""Payment Amount"");
				var VerificationNumber = this.BusComp().GetFieldValue(""Verification Number"");
				var vVouAmt = this.BusComp().GetFieldValue(""STC Voucher Id"");
				var vCreated = this.BusComp().GetFieldValue(""Created"");//Mayank
				var psInputs = TheApplication().NewPropertySet();
				var psOutputs = TheApplication().NewPropertySet();
				var svcbsService = TheApplication().GetService(""Workflow Process Manager"");
				psInputs.SetProperty(""ProcessName"", ""STCPaymentReversalProcess"");
				psInputs.SetProperty(""Object Id"",vBulkHeaderId);
				psInputs.SetProperty(""PaymentId"",vBulkHeaderId);
				psInputs.SetProperty(""vBulkTransId"",vBulkTransId);
				psInputs.SetProperty(""VerificationNumber"",VerificationNumber);
				///psInputs.SetProperty(""vReversalReason"",ReversalReason);PaymentAmount VoucherId
                psInputs.SetProperty(""VoucherId"",vVouAmt);
				psInputs.SetProperty(""PaymentAmount"",vPayAmt);
				psInputs.SetProperty(""vCreated"",vCreated);
				psInputs.SetProperty(""vPayType"",vPayType);
				svcbsService.InvokeMethod(""RunProcess"", psInputs, psOutputs);
		
		return (CancelOperation);
		
		
		}
	return (ContinueOperation);
}
function VoucherPayment()
{
	this.BusComp().ActivateField(""STC Link Account ID"");
	var sBillAcntId = this.BusComp().GetFieldValue(""STC Link Account ID"");
	TheApplication().SetProfileAttr(""SMEVoucherBillAcntId"",sBillAcntId);
	
	var sBillAccntBO = TheApplication().GetBusObject(""STC Billing Account"");
	var sBillAccntBC = sBillAccntBO.GetBusComp(""CUT Invoice Sub Accounts"");
	
	var sAccntBO = TheApplication().GetBusObject(""STC Billing Account"");
	var sAccntBC = sAccntBO.GetBusComp(""Account"");
	var IsBillAcntRec = """";
	var sCustAccntId = """";
	var sCPRId = """";
	
	with(sBillAccntBC){
		ActivateField(""Parent Account Id"");
		ClearToQuery();
		SetViewMode(AllView);
		SetSearchSpec(""Id"",sBillAcntId);
		ExecuteQuery(ForwardOnly);
		IsBillAcntRec = FirstRecord();
		if(IsBillAcntRec){
			sCustAccntId = 	GetFieldValue(""Parent Account Id"");
			if(sCustAccntId){
				with(sAccntBC){
					ActivateField(""Tax ID Number"");
					ClearToQuery();
					SetViewMode(AllView);
					SetSearchSpec(""Id"",sCustAccntId);
					ExecuteQuery(ForwardOnly);
					sCustAccntId = FirstRecord();
					if(sCustAccntId){
						sCPRId = GetFieldValue(""Tax ID Number"");	
					}//endif sCustAccntId					
				}//endwith sAccntBC
			}//endif sCustAccntId
		}//endif IsBillAcntRec		
	}//endwith sBillAccntBC
	
	if(sCPRId != """"){			
		TheApplication().SetProfileAttr(""SMEVoucherCPRId"",sCPRId);	
	}//endif sCPRId
	
	return CancelOperation;
}
function WebApplet_PreInvokeMethod (MethodName)
{
	if(MethodName == ""VoucherPayment""){
		VoucherPayment();
	}//endif MethodName == ""VoucherPayment""
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
	if(MethodName == ""ShowPopup"") {
	
		this.BusComp().WriteRecord();
		this.BusComp().InvokeMethod(""RefreshRecord"");
	} 
		return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
var sAccountId;
var appObj;
try
{	appObj = TheApplication();
 	sAccountId = this.BusComp().GetFieldValue(""Id"");
 	appObj.SetProfileAttr(""CreatePopulate"",sAccountId);
 	
 
}
catch(e)
{
}
finally
{}
}
function WebApplet_PreInvokeMethod (MethodName)
{
 /*	if(MethodName == ""WriteRecord"")
	{
	     if (TheApplication().GetProfileAttr(""gAllowNewRec"") == ""N"")
	     {
	        return(ContinueOperation);
	     }   
	      else
	     {
	          TheApplication().SetProfileAttr(""gAllowNewRec"",""N"");   
	          return(CancelOperation);
	      }  
	       
	}
	return(ContinueOperation);

*/

}
function WebApplet_Load ()
{
try
   {
      var currBC = this.BusComp();
      with (currBC)
      {
         SetViewMode(AllView);
         var query = GetSearchExpr();	
         query = query.replace(""CPR"", ""Bahraini ID"");
   		 SetSearchExpr(query);
       	 ExecuteQuery(ForwardBackward);
         var cnt1 = CountRecords();
         if(cnt1 < 1)
         {
		      TheApplication().RaiseErrorText(""No customer exists with given ID details. Please create a New Customer."");
			  return(CancelOperation);
         	
         }	
         if(query != null && query != """" && query != ""[Id] = \""dummy\"""")	  
		 {
	     query=query + "" AND ([Account Type Code] = 'Customer' AND [STC Post Sub] < 5)"";
   		 SetSearchExpr(query);
       	 ExecuteQuery(ForwardBackward);
         var cnt2 = CountRecords();
         if(cnt2 < 1)
         {
		      TheApplication().RaiseErrorText(""Exceeded the number of subscriptions please contact Retail manager"");	
			  return(CancelOperation);
         
         }
   		 } 
   		 else
   		 {
   		 	query=""[Id] = \""dummy\"""";
   			SetSearchExpr(query);
       		ExecuteQuery(ForwardBackward);
   		 }
      }
   }
   catch (e)
   {
      TheApplication().RaiseErrorText(e.errText);
	  return(CancelOperation);
   }

return(ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
 /*	if(MethodName == ""WriteRecord"")
	{
	     if (TheApplication().GetProfileAttr(""gAllowNewRec"") == ""N"")
	     {
	        return(ContinueOperation);
	     }   
	      else
	     {
	          TheApplication().SetProfileAttr(""gAllowNewRec"",""N"");   
	          return(CancelOperation);
	      }  
	       
	}
	return(ContinueOperation);

*/

	if(MethodName == ""NewQuery"" || MethodName == ""RefineQuery"" )
	{
      return(CancelOperation);
    }  
	return(ContinueOperation);
}
"var sOutstanding = 0;
var ServAccId="""";
var sMessage ="""";"
function CheckBroadBforPrepaid()
{
	try
	{
		var appObj = TheApplication();
		var sMigration ="""";
		var sMigrationType="""";
		var sAssetBO;
		var sAssetBC;
		var sProdPartNum;
		var sLOVPartNum;
		var sSExpr;
		
		sAssetBO = appObj.ActiveBusObject();
		sAssetBC = sAssetBO.GetBusComp(""Asset Mgmt - Asset"");
		
		with(sAssetBC)
	   	{
	   		ActivateField(""Service Account Id"");
	 		ActivateField(""Billing Account Id"");
		   	ActivateField(""Product Part Number"");
		   	ActivateField(""Status"");
	        ClearToQuery();
	        SetViewMode(AllView);
	        
	        //-----
	        //sSExpr = ""[Service Account Id] = '"" + ServAccId + ""' AND [Product Part Number] = 'PLANCLUBBB' AND [Status] = 'Active'"";
	        sSExpr = ""[Service Account Id] = '"" + ServAccId + ""' AND [Status] = 'Active'""
	        //-----
	        
	        SetSearchExpr(sSExpr);
	        ExecuteQuery(ForwardOnly);	
	                
	        sMigrationType = TheApplication().InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Postpaid To Prepaid""); 
	       	var iRecord = FirstRecord();
	        if(FirstRecord())
			{
				//----------
	        	while(iRecord)
	        	{
	    	    	sProdPartNum = GetFieldValue(""Product Part Number"");
		        	sLOVPartNum = TheApplication().InvokeMethod(""LookupValue"", ""STC_MIGRATION_NOT_ALLOWED"", sProdPartNum);	        
	        		
	        		if (sLOVPartNum != """") 
	        		{
	        			sMessage = ""The Migration is not supported for the current plan"";
	        			break;
	        		}
	        		else
	        		{
	        			sMessage = """";
	        		}
	        		iRecord = NextRecord();
	        	}//End While
		        //----------
			
				//=============
				/*
				this.BusComp().ParentBusComp().ActivateField(""STC Migration Type"");
				sMigration = this.BusComp().ParentBusComp().GetFieldValue(""STC Migration Type"");
				if(sMigration == sMigrationType)
				{ 
					sMessage = ""Broadband Migration to Prepaid Account is not Allowed."";
					//appObj.RaiseErrorText(sMessage);
				}
				else
				{
					sMessage = """";
				}
				*/
				//=============
           	}
		}//End with
	}//End try

	catch(e)
	{
		throw(e);
	}
	
	finally
	{
		sAssetBC = null;
		sAssetBO = null;
		
	}
}
"//PS 10/05/2010 for Migration Order
function CreateAndAutoPopulate()
{
	var psInputs;
	var psOutputs;
	var svcBusSrv;
	var appObj;
	var sPBusComp;
	var sCustAccountId = """";
	var sMigrationType;
	var sMigrationTypeLOV;
	
	try
	{
		appObj = TheApplication();
		psInputs = appObj.NewPropertySet();
		psOutputs = appObj.NewPropertySet();
		
		sPBusComp = this.BusComp().ParentBusComp();
		if (sPBusComp != null)
		{
			sMigrationType = sPBusComp.GetFieldValue(""STC Migration Type"");
			
			//04/07/2010
			//sCustAccountId = sPBusComp.GetFieldValue(""Master Account Id"");
			
			//========================
			sMigrationTypeLOV = TheApplication().InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Pre Post Under Diff Customer"");
			
			if (sMigrationType == sMigrationTypeLOV)
			{
				var sDiffCustMSISDN = sPBusComp.GetFieldValue(""STC Postpaid Cust MSISDN"");
				
				var sSubBO = TheApplication().GetBusObject(""STC Service Account"");
			   	var sServiceAccntBC = sSubBO.GetBusComp(""CUT Service Sub Accounts"");
       	
       			var sAccntStatus = TheApplication().InvokeMethod(""LookupValue"", ""ACCOUNT_STATUS"", ""Active"");
       	
	    		with(sServiceAccntBC)
	    		{
	      			ActivateField(""DUNS Number"");
	      			ActivateField(""Account Status"");
	      			ClearToQuery();
	      			SetViewMode(AllView);
	      			SetSearchExpr(""[DUNS Number] = '"" + sDiffCustMSISDN + ""' AND [Account Status] = '"" + sAccntStatus + ""'""); 
	      			ExecuteQuery(ForwardOnly);
				
					if(FirstRecord())
					{
						sCustAccountId  = GetFieldValue(""Master Account Id"");
					}
				}
			}
			else
			{
				sCustAccountId = sPBusComp.GetFieldValue(""Master Account Id"");
			}
			
			
			
			//=========================
		
			with(psInputs)
			{
				SetProperty(""Object Id"",sCustAccountId);
				SetProperty(""OnlyBACreate"",""Y"");
				SetProperty(""OnlyCustCreate"",""N"");
				if (sMigrationType == ""Postpaid To Prepaid"")
				{
					SetProperty(""PlanType"",""Prepaid"");
				}
				else
				{
					SetProperty(""PlanType"","""");
				}
				SetProperty(""ProcessName"", ""STC Create New Customer"");
			}
			svcBusSrv = appObj.GetService(""Workflow Process Manager"");
			svcBusSrv.InvokeMethod(""RunProcess"",psInputs,psOutputs);
		}
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
		psInputs = null;
	 	psOutputs = null;
		svcBusSrv = null;
		appObj= null;
	}
}
"//PS 10/05/2010 for Migration Order
function OutstandingBalance()
{
	try
	{
		var appObj = TheApplication();
		var sMsisdn;
		var Input;
		var Output;
		var svcOutPayments;
		var sPlanType;
		var sPBusComp;
		
		sPBusComp = this.BusComp().ParentBusComp();
		
		if (sPBusComp != null)
		{
			sPlanType = sPBusComp.GetFieldValue(""STC Pricing Plan Type"");
			if (sPlanType == ""Postpaid"")
			{
				with (appObj)
				{
					sMsisdn = this.BusComp().GetFieldValue(""Serial Number"");
		    		Input = NewPropertySet();
		    		Output = NewPropertySet();
		   			svcOutPayments = GetService(""Workflow Process Manager"");
		    		Input.SetProperty(""ProcessName"",""STC OutstandingPayment WF"");
		   			Input.SetProperty(""MSISDN"",sMsisdn);
		    		svcOutPayments.InvokeMethod(""RunProcess"",Input,Output);
		    		sOutstanding = Output.GetProperty(""OutStandingAmt"");
		   		}
			}
		}
	}	   	
	
	catch(e)
	{
	}
	
	finally
	{
	}
}
function WebApplet_PreInvokeMethod (MethodName)
{
var isRecord;
var sAllowSR=""Y"";
var SRStatus;
var SRType;
var appObj;
var sMsisdn;
var Input;
var Output;
var sBillingId;
var svcOutPayment;
var sOutstanding;
var sAssetId;
var sServiceId;

try{

/*
	if(MethodName == ""ModifyProdSvc"" || MethodName == ""DisconnectProdSvc"" || MethodName == ""SuspendProdSvc"" || MethodName == ""ResumeProdSvc"" || MethodName == ""TempSuspendSvc"" || MethodName ==""MigrationProdSvc"")
	{	
		ServAccId = this.BusComp().GetFieldValue(""Service Account Id"");
		var sServiceBO = TheApplication().GetBusObject(""Service Request"");
		var sServiceBC = sServiceBO.GetBusComp(""Service Request"");
		with(sServiceBC)
		{
	  		ActivateField(""Account Id"");
		    ActivateField(""Status"");
		    ActivateField(""INS Sub-Area"");
	    	ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Account Id"", ServAccId);
			ExecuteQuery(ForwardOnly);

	        var sClosed = TheApplication().InvokeMethod(""LookupValue"", ""SR_STATUS"", ""Closed""); 
			if(FirstRecord())
			{
				isRecord = FirstRecord();
			    while(isRecord)
			    {	
					SRStatus = GetFieldValue(""Status"");
					SRType = GetFieldValue(""INS Sub-Area"");
					if(SRStatus != sClosed && (SRType == ""Change MSISDN"" || SRType == ""Change SIM Card""))
						sAllowSR=""N"";
					isRecord = NextRecord();
				}//while
			}//if
		}//with	
		if(sAllowSR == ""N"")
			TheApplication().RaiseErrorText(""There is currently an Open SR to change the MSISDN or SIM card. Can't proceed with this request."");
	}
	
	if(MethodName == ""DisconnectProdSvc"")
	{
	
	    sServiceId = this.BusComp().GetFieldValue(""Service Account Id"");
	    sBillingId = this.BusComp().GetFieldValue(""Billing Account Id"");
       	sAssetId = this.BusComp().GetFieldValue(""Id"");
       	var sSubBO = TheApplication().GetBusObject(""STC Service Account"");
	   	var sServiceAssetBC = sSubBO.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
       	
	    with(sServiceAssetBC)
	    {
	      ActivateField(""Service Account Id"");
	      ActivateField(""Product Part Number"");
	      ClearToQuery();
	      SetViewMode(AllView);
	      SetSearchExpr(""[Service Account Id] = '"" + sServiceId + ""' AND [Product Part Number] = 'PLANCLUBBB'""); 
	      ExecuteQuery(ForwardOnly);
	      
	      if(FirstRecord())
	      {
	         
	     	var sBillingBO = TheApplication().GetBusObject(""STC Billing Account"");
	    	var sAssetBC = sBillingBO.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
	      
	 	   with (sAssetBC)
	       {
		   	 ActivateField(""Billing Account Id"");
		   	 ActivateField(""Product Part Number"");
		   	 ActivateField(""Status"");
	         ClearToQuery();
	         SetViewMode(AllView);
	         SetSearchExpr(""[Billing Account Id] = '"" + sBillingId + ""' AND [Product Part Number] = 'PLANCLUB' AND [Status] = 'Active'"");
	         ExecuteQuery(ForwardOnly);
	         
	          if(FirstRecord())
	          {
	        	TheApplication().RaiseErrorText(""Please disconnect VIVA Voice Plan First"");
	          }
	        }
	    	}
	     }	
	}            
	          
	         
	if(MethodName == ""MigrationProdSvc"")
	{
		appObj = TheApplication();
		
		
		CheckBroadBforPrepaid();
		if (sMessage != """")
		{
			appObj.RaiseErrorText(sMessage);
		}
		
		OutstandingBalance();
   		if(sOutstanding > 0)
   		{
    		appObj.RaiseErrorText(""In Order to Proceed further kindly clear Outstanding Dues."");
   		}	   		

		//var sServiceType = this.BusComp().ParentBusComp().GetFieldValue(""STC Pricing Plan Type"");
  		CreateAndAutoPopulate();
	}


	if(MethodName == ""TempSuspendSvc"")
	{
		appObj = TheApplication();
		OutstandingBalance();
			    	
	   		if(sOutstanding > 0)
	   		{
	    		appObj.RaiseErrorText(""In Order to Proceed further kindly clear Outstanding Dues."");
	   		}
	}
	
*/

	switch(MethodName)
	{
 		case ""ModifyProdSvc"":
 		case ""SuspendProdSvc"":
 		case ""ResumeProdSvc"":
 		case ""TempSuspendSvc"":
 		case ""MigrationProdSvc"":
 		case ""DisconnectProdSvc"":
 		{ 		 		 	
 			ServAccId = this.BusComp().GetFieldValue(""Service Account Id"");
			var sServiceBO = TheApplication().GetBusObject(""Service Request"");
			var sServiceBC = sServiceBO.GetBusComp(""Service Request"");
			with(sServiceBC)
			{
		  		ActivateField(""Account Id"");
			    ActivateField(""Status"");
			    ActivateField(""INS Sub-Area"");
		    	ClearToQuery();
				SetViewMode(AllView);
				SetSearchSpec(""Account Id"", ServAccId);
				ExecuteQuery(ForwardOnly);
	
		        var sClosed = TheApplication().InvokeMethod(""LookupValue"", ""SR_STATUS"", ""Closed""); 
				if(FirstRecord())
				{
					isRecord = FirstRecord();
				    while(isRecord)
				    {	
						SRStatus = GetFieldValue(""Status"");
						SRType = GetFieldValue(""INS Sub-Area"");
						if(SRStatus != sClosed && (SRType == ""Change MSISDN"" || SRType == ""Change SIM Card""))
							sAllowSR=""N"";
						isRecord = NextRecord();
					}//while
				}//if
			}//with	
			if(sAllowSR == ""N"")
			{
				TheApplication().RaiseErrorText(""There is currently an Open SR to change the MSISDN or SIM card. Can't proceed with this request."");
			}	
		}	
			
		if(MethodName == ""DisconnectProdSvc"")
		{
	    	sServiceId = this.BusComp().GetFieldValue(""Service Account Id"");
	    	sBillingId = this.BusComp().GetFieldValue(""Billing Account Id"");
       		sAssetId = this.BusComp().GetFieldValue(""Id"");
       		var sSubBO = TheApplication().GetBusObject(""STC Service Account"");
	   		var sServiceAssetBC = sSubBO.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
       	
	    	with(sServiceAssetBC)
	    	{
	      		ActivateField(""Service Account Id"");
	      		ActivateField(""Product Part Number"");
	      		ClearToQuery();
	      		SetViewMode(AllView);
	      		SetSearchExpr(""[Service Account Id] = '"" + sServiceId + ""' AND [Product Part Number] = 'PLANCLUBBB'""); 
	      		ExecuteQuery(ForwardOnly);
	      
	      		if(FirstRecord())
	      		{
	     			var sBillingBO = TheApplication().GetBusObject(""STC Billing Account"");
	    			var sAssetBC = sBillingBO.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
	      
	 	   			with (sAssetBC)
	       			{
	       				ActivateField(""Billing Account Id"");
					   	ActivateField(""Product Part Number"");
					   	ActivateField(""Status"");
				        ClearToQuery();
				        SetViewMode(AllView);
				        SetSearchExpr(""[Billing Account Id] = '"" + sBillingId + ""' AND [Product Part Number] = 'PLANCLUB' AND [Status] = 'Active'"");
				        ExecuteQuery(ForwardOnly);
	         
				        if(FirstRecord())
	        				{
								TheApplication().RaiseErrorText(""Please disconnect VIVA Voice Plan First"");
	          				}
	        		}//end with
	    		}
	     	}//end with	
		}            
	          
	         
		if(MethodName == ""MigrationProdSvc"")
		{
			appObj = TheApplication();	
			CheckBroadBforPrepaid();
			if (sMessage != """")
			{
				appObj.RaiseErrorText(sMessage);
			}
		
			OutstandingBalance();
   			if(sOutstanding > 0)
   			{
    			appObj.RaiseErrorText(""In Order to Proceed further kindly clear Outstanding Dues."");
   			}	   		

			//var sServiceType = this.BusComp().ParentBusComp().GetFieldValue(""STC Pricing Plan Type"");
  			CreateAndAutoPopulate();
		}


		if(MethodName == ""TempSuspendSvc"")
		{
			appObj = TheApplication();
			OutstandingBalance();
			    	
	   		if(sOutstanding > 0)
	   		{
	    		appObj.RaiseErrorText(""In Order to Proceed further kindly clear Outstanding Dues."");
	   		}
		}
		
		break;
	}//end switch


	
	return (ContinueOperation);
}

catch(e)
{
	throw(e);	
}

finally
{
	sServiceBC = null;
	sServiceBO = null;	
	svcOutPayment = null;
	appObj 	   = null;
}	






























}
"//Your public declarations go here... 
var sOutstanding = 0;
var ServAccId="""";
var sMessage ="""";"
"//Your public declarations go here... 
var sOutstanding = 0;
var ServAccId="""";
var sMessage ="""";
var declaredServiceAccntId = """";"
"//Mayank: Added for CRM Access Configuration
function ALLPLANAllowed()
{
		var Allowed = ""No"";
		var appObj = TheApplication();                 
	    var SRValidationBS = appObj.GetService(""STC SR Validate Utilities"") ;
	    var psInputs = appObj.NewPropertySet();
	    var psOutputs = appObj.NewPropertySet();         
	    psInputs.SetProperty(""LOVTYPE"",""STC_MENA_VIVA_ADMIN_USER"");
		SRValidationBS.InvokeMethod(""CheckPosition"",psInputs,psOutputs); 
		Allowed = psOutputs.GetProperty(""LOVAvailable"");

return(Allowed);
}
function CheckBroadBforPrepaid()
{
	try
	{
		var appObj = TheApplication();
		var sMigration ="""";
		var sMigrationType="""";
		var sAssetBO;
		var sAssetBC,sAssetBC2;
		var sProdPartNum;
		var sLOVPartNum;
		var vLOVPartNum;
		var vChargeProdPartNum;
		var sSExpr;
		var sSExpr2;
		var vDiffDays;
    	var vCreated ="""";   // Sachin - 6Oct2010
		
		sAssetBO = appObj.ActiveBusObject();
		sAssetBC = sAssetBO.GetBusComp(""Asset Mgmt - Asset"");
		sAssetBC2 = sAssetBO.GetBusComp(""Asset Mgmt - Asset"");
		
		with(sAssetBC)
	   	{
	   		ActivateField(""Service Account Id"");
	 		ActivateField(""Billing Account Id"");
		   	ActivateField(""Product Part Number"");
		   	ActivateField(""Status"");
		   	ActivateField(""Created"");
	        ClearToQuery();
	        SetViewMode(AllView);
	        
	        //-----
	        //sSExpr = ""[Service Account Id] = '"" + ServAccId + ""' AND [Product Part Number] = 'PLANCLUBBB' AND [Status] = 'Active'"";
	     //   sSExpr = ""[Service Account Id] = '"" + ServAccId + ""' AND [Status] = 'Active' AND [Type] = 'Service Plan'""
	        sSExpr = ""[Service Account Id] = '"" + ServAccId + ""' AND [Status] = 'Active' AND [STC Plan Type] = 'Service Plan'""
	        //-----
	        
	        SetSearchExpr(sSExpr);
	        ExecuteQuery(ForwardOnly);	
	                
	        sMigrationType = TheApplication().InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Postpaid To Prepaid""); 
	        
	       	var iRecord = FirstRecord();
	        if(FirstRecord())
			{
				//----------
	        	while(iRecord)
	        	{
	    	    	sProdPartNum = GetFieldValue(""Product Part Number"");
	    	    	vCreated = GetFieldValue(""Created"");
		        	sLOVPartNum = TheApplication().InvokeMethod(""LookupValue"", ""STC_MIGRATION_NOT_ALLOWED"", sProdPartNum);	        
	        		vLOVPartNum = TheApplication().InvokeMethod(""LookupValue"", ""STC_EMP_PLAN"", ""Employee Plan"");
	        		if (sLOVPartNum != """") 
	        		{
	        			sMessage = ""The Migration is not supported for the current plan"";
	        			break;
	        		}
	        		else
	        		{
	        			sMessage = """";
	        		}
	        		
	        		if (vLOVPartNum == sProdPartNum)
	        		{
	        		
	        			// Sachin Below - Date logic
	        			    
								var vDate1=new Date(vCreated);
								var vDate2=vDate1.toSystem();
								
								var sysDate = new Date();
								var vDate3=sysDate.toSystem();
							
								var vDate4 = (vDate3 - vDate2)/86400;
								vDiffDays = TheApplication().InvokeMethod(""LookupValue"", ""STC_EMP_PLAN"", ""Charge Days"");
								var vDateDiff = vDate4.toFixed(0) - vDiffDays;
								
								// TheApplication().RaiseErrorText( vDate1 + ""realdate "" + sysDate + ""Syatem"" + ""Diff "" + vDate4  + ""Number"" + vDateDiff);
	        			
	        			// Sachin Above - Date logic
	        			if (vDateDiff < 0)
	        			{
	        				vChargeProdPartNum = TheApplication().InvokeMethod(""LookupValue"", ""STC_EMP_PLAN"", ""Charge Product"");
	        				with(sAssetBC2)
						   	{
						   		ActivateField(""Service Account Id"");
						 		ActivateField(""Billing Account Id"");
							   	ActivateField(""Product Part Number"");
							   	ActivateField(""Status"");
						        ClearToQuery();
						        SetViewMode(AllView);
						        sSExpr2 = ""[Service Account Id] = '"" + ServAccId + ""' AND [Status] = 'Active' AND [Product Part Number] = '"" + vChargeProdPartNum + ""'"";
						        
						        SetSearchExpr(sSExpr2);
						        ExecuteQuery(ForwardOnly);
						        
						        if(FirstRecord())
								{
									sMessage = """";
								}
								else
								{
									sMessage = ""Employee Migration is not allowed. Please raise modify order selecting the charge product first."";
									break;
								}
						        
						     } // End with(sAssetBC2) Sachin
	        				
	        			} // End if (vDateDiff < 0)
	        		} // End if (vLOVPartNum == sProdPartNum)
	        		
	        		iRecord = NextRecord();
	        	}//End While
		        //----------
			
				//=============
				/*
				this.BusComp().ParentBusComp().ActivateField(""STC Migration Type"");
				sMigration = this.BusComp().ParentBusComp().GetFieldValue(""STC Migration Type"");
				if(sMigration == sMigrationType)
				{ 
					sMessage = ""Broadband Migration to Prepaid Account is not Allowed."";
					//appObj.RaiseErrorText(sMessage);
				}
				else
				{
					sMessage = """";
				}
				*/
				//=============
           	}
		}//End with
	}//End try

	catch(e)
	{
		throw(e);
	}
	
	finally
	{
		sAssetBC = null;
		sAssetBO = null;
		
	}
}
function CheckJawwy(sServiceId)
{
	try
	{			var JawwyFlg = ""N"";
				var sSubBO = TheApplication().GetBusObject(""STC Service Account"");
				var sServiceAssetBC = sSubBO.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");       	
				with(sServiceAssetBC)
				{
					ActivateField(""Service Account Id"");
					ActivateField(""Product Part Number"");
					ActivateField(""STC Plan Segregation"");
					ClearToQuery();
					SetViewMode(AllView);
					//SetSearchExpr(""[Service Account Id] = '"" + sServiceId + ""' AND [STC Prod Identifier] = 'JAWWY'"");
					//SetSearchExpr(""[Service Account Id] = '"" + sServiceId + ""'AND [Status] = 'Active' AND [STC Prod Identifier] = 'JAWWY'"");
					SetSearchExpr(""[Service Account Id] = '"" + sServiceId + ""'AND [Status] = 'Active' AND [STC Plan Segregation] = 'JAWWY'"");
					ExecuteQuery(ForwardOnly);	      
					if(FirstRecord())
					{
						JawwyFlg = ""Y"";	
					}
				 }
			return(JawwyFlg)
	}

	finally
	{
	}
}
function CheckLastSub()
{
try
{
var MasterId=this.BusComp().GetFieldValue(""Owner Account Id"");
var appObj=TheApplication();
var AccountBO=appObj.GetBusObject(""Account"");
var AccountBC=AccountBO.GetBusComp(""Account"");
var ServiceBO=appObj.GetBusObject(""STC Service Account"");
//var ServiceBC=ServiceBO.GetBusComp(""CUT Service Sub Accounts"");
var ServiceBC = TheApplication().GetBusObject(""STC Thin Service Account BO"").GetBusComp(""STC Thin CUT Service Sub Accounts""); //Anchal: Changed BC because of Query Issue
var iRecord;

var strdate = new Date; 
var strStatusChangeDate = (strdate.getMonth()+1) + ""/"" + strdate.getDate() + ""/"" + strdate.getFullYear() + "" "" + strdate.getHours() + "":"" + strdate.getMinutes() + "":"" + strdate.getSeconds();
with(ServiceBC)  
{ 
SetViewMode(AllView);
ClearToQuery();
var sSExpr = ""[Master Account Id] = '"" + MasterId + ""' AND [STC Pricing Plan Type] = 'Postpaid' AND [Account Status] <> 'Terminated'"";
SetSearchExpr(sSExpr);
ExecuteQuery(ForwardOnly);
var Count=CountRecords();
	if(Count<= ""1"")
	{
		with(AccountBC)
		{
		SetViewMode(AllView);
		ActivateField(""STC Account Created Date"");  
		ClearToQuery();	
	    SetSearchSpec(""Id"",MasterId);
	    ExecuteQuery(ForwardOnly);
	     iRecord = FirstRecord();
		   if(iRecord)
		   {
		   SetFieldValue(""STC Account Created Date"","""");
		   WriteRecord();
		   }
		}//AccountBC
	}
  }
}
catch(e)
{
}
finally
{
AccountBO=null;
ServiceBO=null;
ServiceBC=null;
AccountBC=null;
}
}
function CheckMENAPosition()
{
		var Allowed = ""No"";
		var appObj = TheApplication();                 
	    var SRValidationBS = appObj.GetService(""STC SR Validate Utilities"") ;
	    var psInputs = appObj.NewPropertySet();
	    var psOutputs = appObj.NewPropertySet();         
	    psInputs.SetProperty(""LOVTYPE"",""STC_MENA_ADMIN_USER"");
		SRValidationBS.InvokeMethod(""CheckPosition"",psInputs,psOutputs); 
		Allowed = psOutputs.GetProperty(""LOVAvailable"");
		return(Allowed);
}
function CheckServiceMigrationVal()
{
try
{
	var appObj = TheApplication();
	var sMigration ="""";
	var sMigrationType="""";
	var sAssetBO;
	var sAssetBC,sAssetBC2;
	var sProdPartNum;
	var sLOVPartNum;
	var vLOVPartNum;
	var vChargeProdPartNum;
	var sSExpr;
	var sSExpr2;
	var vDiffDays;
   	var vCreated ="""";   // Sachin - 6Oct2010
	sAssetBO = appObj.ActiveBusObject();
	sAssetBC = sAssetBO.GetBusComp(""Asset Mgmt - Asset"");
	sAssetBC2 = sAssetBO.GetBusComp(""Asset Mgmt - Asset"");
	with(sAssetBC)
   	{
   		ActivateField(""Service Account Id"");
 		ActivateField(""Billing Account Id"");
	   	ActivateField(""Product Part Number"");
	   	ActivateField(""Status"");
	   	ActivateField(""Created"");
        ClearToQuery();
        SetViewMode(AllView);
        //-----
        //sSExpr = ""[Service Account Id] = '"" + ServAccId + ""' AND [Product Part Number] = 'PLANCLUBBB' AND [Status] = 'Active'"";
        //sSExpr = ""[Service Account Id] = '"" + ServAccId + ""' AND [Status] = 'Active' AND [Type] = 'Service Plan'""
        sSExpr = ""[Service Account Id] = '"" + ServAccId + ""' AND [Status] = 'Active' AND [STC Plan Type] = 'Service Plan'""
        //-----
        SetSearchExpr(sSExpr);
        ExecuteQuery(ForwardOnly);	
        sMigrationType = TheApplication().InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Postpaid To Prepaid""); 
       	var iRecord = FirstRecord();
        if(FirstRecord())
		{
			//----------
        	while(iRecord)
        	{
    	    	sProdPartNum = GetFieldValue(""Product Part Number"");
    	    	vCreated = GetFieldValue(""Created"");
	        	sLOVPartNum = TheApplication().InvokeMethod(""LookupValue"", ""STC_MIGRATION_NOT_ALLOWED"", sProdPartNum);	        
        		if (sLOVPartNum != """") 
        		{
        			sMessage = ""The Migration is not supported for the current plan"";
        			break;
        		}
        		else
        		{
        			sMessage = """";
        		}
        		
         		iRecord = NextRecord();
        	}//End While
	}
	}//End with
}
catch(e)
{
	throw(e);
}
finally
{
	sAssetBC = null;
	sAssetBO = null;
}
}
function CheckWriteOff(MethodName)
{
	try
	{
		var AccountBO = """",AccountBC = """";
		if(MethodName == ""MigrationProdSvc"" || MethodName == ""ModifyProdSvc"" || MethodName == ""ServiceMigrationSvc"")
		{
			var sServiceAccntId = this.BusComp().GetFieldValue(""Service Account Id"");
			this.BusComp().ParentBusComp().ActivateField(""STC Pricing Plan Type"");
			var sServiceType = this.BusComp().ParentBusComp().GetFieldValue(""STC Pricing Plan Type"");
			var id = this.BusComp().GetFieldValue(""Customer Account Id"");//[NAVIN:04Dec2019]
			AccountBO = TheApplication().GetBusObject(""Account"");
			AccountBC = AccountBO.GetBusComp(""Account"");
			var sUser = """",sVIPUser = """",csegment = """",sErrorWriteOff = ""N"",sWriteOffStatusAllowFlg = """", sWriteOffStopPOrderFlg = """",sType = """";
			var sWriteOffStatusFlag = """"; // [Hardik:23July2020:WriteOffAutomation]
			with(AccountBC)
			{
				SetViewMode(AllView);
				ActivateField(""STCWriteOffStopPOrder"");
				ActivateField(""STCWriteOffAllowedCalc"");
				ActivateField(""STC Contract Category"");
				ActivateField(""STCWriteOffOtherStatusCalc""); // [Hardik:23July2020:WriteOffAutomation]
				ActivateField(""Type"");
				ClearToQuery();
				SetSearchSpec(""Id"",id); 
				ExecuteQuery(ForwardOnly);
				var isRecord = FirstRecord();
				if(isRecord)
				{
					sWriteOffStatusAllowFlg = GetFieldValue(""STCWriteOffAllowedCalc"");
					sWriteOffStopPOrderFlg = GetFieldValue(""STCWriteOffStopPOrder"");
					csegment = GetFieldValue(""STC Contract Category"");	
					sType = GetFieldValue(""Type"");
					sWriteOffStatusFlag = GetFieldValue(""STCWriteOffOtherStatusCalc""); // [Hardik:23July2020:WriteOffAutomation]
				}
			}
			if(sWriteOffStopPOrderFlg == ""Y"")
			{
				if((sType == ""Individual"" && sServiceType == ""Postpaid"") || (sType == ""Individual"" && sServiceType == ""Prepaid"" && MethodName == ""ServiceMigrationSvc""))
				{
					if(csegment == ""Individual"")
					{
						
						if (sWriteOffStatusFlag == ""Y"") ///[Hardik:23July2020:WriteOffAutomation] Started -------
						{
								
							sErrorWriteOff = ""Y"";
							TheApplication().RaiseErrorText(""Write-off flag is active, please clear the old balances and raise SR for CCC Approval."");
								
						} ///[Hardik:23July2020:WriteOffAutomation] End -------
						else
						{
							 var A=1;
							
						}
					}
					else if(csegment == ""A"" || csegment == ""B"" || csegment == ""C"" || csegment == ""D"")
					{
						sUser = TheApplication().LoginName();
						sVIPUser = TheApplication().InvokeMethod(""LookupValue"", ""STC_VIP_WRITEOFF_ALLOW"", sUser);
						sVIPUser = sVIPUser.substring(0,5);
						if(sVIPUser == ""ALLOW"" && sWriteOffStatusAllowFlg == ""Y"")
						{
							var A=1;
						}
						else
						{
							if (sWriteOffStatusFlag == ""Y"") ///[Hardik:23July2020:WriteOffAutomation] Started -------
						     {
								sErrorWriteOff = ""Y"";
								TheApplication().RaiseErrorText(""Write-off flag is active, please clear the old balances and raise SR for CCC Approval."");
						     } ///[Hardik:23July2020:WriteOffAutomation] End -------
							else  ///[Hardik:23July2020:WriteOffAutomation] End -------
							{
								var A=1;
								
							}
						}
					}
				}
			}
		}
		//return(sErrorWriteOff);
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
		AccountBC = null;
		AccountBO = null;			
	}
}
"//PS 10/05/2010 for Migration Order
function CreateAndAutoPopulate()
{
	var psInputs;
	var psOutputs;
	var svcBusSrv;
	var appObj;
	var sPBusComp;
	var sCustAccountId = """";
	var sMigrationType;
	var sMigrationTypeLOV;
	var sParBillingId;
	var sMigrationTypeLOV2;
	var sBillBO;
	var sBillBC;
	var sBillName;
	var sMigrationTypeLOV3;
	var sMigrationTypeLOV4;
	var sMigrationTypeLOV5;
	var sMigrationTypeLOV6;
	var IsGuardianVer;//[MANUJ] : [Guardian Verified]
	var IsNewBillAcc;
	try
	{
		appObj = TheApplication();
		psInputs = appObj.NewPropertySet();
		psOutputs = appObj.NewPropertySet();
		
		sPBusComp = this.BusComp().ParentBusComp();
		//[MANUJ] : [Guardian SD]
		sPBusComp.ActivateField(""STC Guardian Verified"");
		IsGuardianVer = sPBusComp.GetFieldValue(""STC Guardian Verified"");
		//[MANUJ] : [Guardian SD]
		sParBillingId = sPBusComp.GetFieldValue(""Parent Account Id"");
			sPBusComp.ActivateField(""STC New BAN Flag"");
		IsNewBillAcc = sPBusComp.GetFieldValue(""STC New BAN Flag"");
		sBillBO = appObj.GetBusObject(""STC Billing Account"");
		sBillBC = sBillBO.GetBusComp(""CUT Invoice Sub Accounts"");
		
		with(sBillBC)
		{
			ActivateField(""Name"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Id"",sParBillingId);
			ExecuteQuery(ForwardOnly);
			
			if(FirstRecord())
			{
				sBillName = GetFieldValue(""Name"");
			}
		}
		
		if (sPBusComp != null)
		{
			sMigrationType = sPBusComp.GetFieldValue(""STC Migration Type"");
			var sMigration = appObj.InvokeMethod(""LookupValue"", ""STC_MIG_BAN_TYPE"", sMigrationType);
			var FoundMigration = sMigration.substring(0,4);
			
			var PrepMigType = appObj.InvokeMethod(""LookupValue"", ""STC_PREPAID_MIG_TYPE"", sMigrationType);
			var PrepMigTypeStr = PrepMigType.substring(0,7);
			
				
			//04/07/2010
			//sCustAccountId = sPBusComp.GetFieldValue(""Master Account Id"");
			
			//========================
			sMigrationTypeLOV = appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Pre Post Under Diff Customer"");
			sMigrationTypeLOV2= appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Post Pre Under Diff Customer"");
			sMigrationTypeLOV3= appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Post Post Under Diff Customer""); 
			sMigrationTypeLOV4= appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Pre Pre Under Diff Customer""); 
			sMigrationTypeLOV5= appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corp Post To Inv Pre""); 
			sMigrationTypeLOV6= appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corp Post To Inv Post""); 
			var sMigrationSMEToSME = appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""SME To SME""); 
			var sMigrationSMEToCORP = appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""SME To Corporate""); 
			var sMigrationCORPToSME = appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corporate To SME""); 
			var sMigrationIndPostToSME = appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Inv Post To SME""); 
			var sMigrationIndPreToSME = appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Inv Pre To SME""); 
			var sMigrationSMEToIndPre = appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""SME To Inv Pre""); 
			var sMigrationSMEToIndPost = appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""SME To Inv Post""); 
			var sMigSMESameCust = appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""SME to SME under same customer""); 
			var sMigCorpSameCust = appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corp to Corp undr same customr""); 
			
			if (sMigrationType == sMigrationTypeLOV || sMigrationType == sMigrationTypeLOV2 || sMigrationType ==sMigrationTypeLOV3 || sMigrationType== sMigrationTypeLOV4 )
			{
				sCustAccountId = sPBusComp.GetFieldValue(""STC Master Account Id"");
			}
		//	else if (sMigrationType ==  appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corp Post To Inv Pre"") || sMigrationType ==  appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corp Post To Inv Post"") || sMigrationType== sMigrationSMEToIndPre || sMigrationType== sMigrationSMEToIndPost)
		//else if (sMigrationType ==  appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corp Post To Inv Pre"") || sMigrationType ==  appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corp Post To Inv Post"") || sMigrationType== sMigrationSMEToIndPre || sMigrationType== sMigrationSMEToIndPost || PrepMigTypeStr == ""PREPAID"")
			else if (sMigrationType ==  appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corporate to Consumer B2C"") || sMigrationType ==  appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corp Post To Inv Pre"") || sMigrationType ==  appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corp Post To Inv Post"") || sMigrationType== sMigrationSMEToIndPre || sMigrationType== sMigrationSMEToIndPost || PrepMigTypeStr == ""PREPAID"")
			{
			sCustAccountId = sPBusComp.GetFieldValue(""STC Master Account Id"");
			}
		    else
			{
				sCustAccountId = sPBusComp.GetFieldValue(""Master Account Id"");
			}
			
	//	if(IsNewBillAcc != ""Y"" && (sMigrationType != sMigrationTypeLOV || sMigrationType != sMigrationTypeLOV5 || sMigrationType != sMigrationTypeLOV6 || sMigrationType != sMigrationTypeLOV2 || sMigrationType != sMigrationTypeLOV3 || sMigrationType != sMigrationTypeLOV4))
	//	{		
			
			//=========================
	//	if(sMigrationType == appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Inv Pre To Corp Post"") || sMigrationType == appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Inv Post To Corp Post"") || sMigrationType == appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corporate To Corporate"") || sMigrationType == sMigrationSMEToSME || sMigrationType == sMigrationSMEToCORP || sMigrationType == sMigrationCORPToSME || sMigrationType == sMigrationIndPostToSME || sMigrationType == sMigrationIndPreToSME)
	//	if(sMigrationType == appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Inv Pre To Corp Post"") || sMigrationType == appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Inv Post To Corp Post"") || sMigrationType == appObj.InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corporate To Corporate"") || sMigrationType == sMigrationSMEToSME || sMigrationType == sMigrationSMEToCORP || sMigrationType == sMigrationCORPToSME || sMigrationType == sMigrationIndPostToSME || sMigrationType == sMigrationIndPreToSME || sMigrationType == sMigSMESameCust || sMigrationType == sMigCorpSameCust)	
		if(FoundMigration == ""POST"")
		{
			
			with(psInputs)
			{
				sCustAccountId = sPBusComp.GetFieldValue(""STC Department BAN Id"");
				SetProperty(""MigrationType"",sMigrationType);
				SetProperty(""BillName"",sBillName);
				SetProperty(""Object Id"",sCustAccountId);
				SetProperty(""MigBANVerified"",IsGuardianVer);//[MANUJ] : [Guardian SD]
				SetProperty(""ProcessName"", ""STC Create New Child Billing Account WF"");
			}
			svcBusSrv = appObj.GetService(""Workflow Process Manager"");
			svcBusSrv.InvokeMethod(""RunProcess"",psInputs,psOutputs);
		}
		else if(IsNewBillAcc == ""N"" || IsNewBillAcc == """" || IsNewBillAcc == null)
		{
			with(psInputs)
			{
				SetProperty(""Object Id"",sCustAccountId);
				SetProperty(""OnlyBACreate"",""Y"");
				SetProperty(""OnlyCustCreate"",""N"");
				SetProperty(""MigrationType"",sMigrationType);
				//if (sMigrationType == ""Postpaid To Prepaid"" || sMigrationType == TheApplication().InvokeMethod(""LookupValue"", ""STC_MIGRATION_TYPE"", ""Corp Post To Inv Pre"") || sMigrationType ==sMigrationTypeLOV2 || sMigrationType == sMigrationTypeLOV4 || sMigrationType == sMigrationSMEToIndPre)
				if(FoundMigration == ""PREP"")
				{
					SetProperty(""PlanType"",""Prepaid"");
				}
				else
				{
					SetProperty(""PlanType"","""");
				}
				SetProperty(""ProcessName"", ""STC Create New Customer"");
			}
			svcBusSrv = appObj.GetService(""Workflow Process Manager"");
			svcBusSrv.InvokeMethod(""RunProcess"",psInputs,psOutputs);
		}
		}
	//}
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
		psInputs = null;
	 	psOutputs = null;
		svcBusSrv = null;
		appObj= null;
	}
}
function GetAdvanceCreditDue(sOrderType)
{//[NAVIN: 16Oct2017: AdvanceCreditPayments]
	try
	{
		//var appObj = TheApplication();
		var sMsisdn="""", sServiceAccId="""", sPlanType="""";
		var wfInput=null, wfOutput=null, wfProcSvc=null;
		var vErrCode="""", vErrMsg="""", vAirtimeDue="""", vAirtimeDueNum=0;
		var sPBusComp;
		var sOutstanding;
		var vTxnType="""", vTxnSubType="""";
		
		sPBusComp = this.BusComp().ParentBusComp();
		
		if (sPBusComp != null)
		{
			with (sPBusComp){
				ActivateField(""STC Pricing Plan Type"");
				ActivateField(""DUNS Number"");
				sPlanType = GetFieldValue(""STC Pricing Plan Type"");
				sMsisdn = GetFieldValue(""DUNS Number"");
				sServiceAccId = GetFieldValue(""Id"");
			}
			
			//sOrderType = DisconnectProdSvc|MigrationProdSvc|ServiceMigrationSvc
			vTxnType = sOrderType;
			vTxnSubType = ""Raise"";
			
			if (sPlanType == ""Prepaid"")
			{
				//sServiceAccId = this.BusComp().GetFieldValue(""Service Account Id"");
				wfInput = TheApplication().NewPropertySet();
				wfOutput = TheApplication().NewPropertySet();
				wfProcSvc = TheApplication().GetService(""Workflow Process Manager"");
				with(wfInput){
					SetProperty(""ProcessName"", ""STC Advance Credit Payments Wrapper WF"");
					SetProperty(""Object Id"", sServiceAccId);
					SetProperty(""MSISDN"", sMsisdn);
					SetProperty(""TransactionType"", vTxnType);
					SetProperty(""TransactionSubType"", vTxnSubType);
					SetProperty(""TransactionId"", """");
					SetProperty(""CustAccId"", """");
				}
				wfProcSvc.InvokeMethod(""RunProcess"", wfInput, wfOutput);
				
				with(wfOutput){
					vErrCode = GetProperty(""Error Code"");
					vErrMsg = GetProperty(""Error Message"");
					vAirtimeDue = GetProperty(""FinalCreditAmt"");
					vAirtimeDueNum = ToNumber(vAirtimeDue);
				}
				if(vErrCode != """" && vErrCode != ""0"")
				{
					TheApplication().RaiseErrorText(vErrMsg);
				}
		   	}
		}
	}
	catch(e)
	{throw(e);}
	finally
	{
		wfProcSvc = null; wfInput = null; wfOutput = null;
	}
}
function GetDeviceCreditContractTermination()
{
	try
	{
		var sObjectId;
		var Input;
		var Output;
		var svcOutPayments;
		var sPlanType;
		var sPBusComp;
		var sExcessCharge;
		sPBusComp = this.BusComp().ParentBusComp();
		if (sPBusComp != null)
		{
			sPBusComp.ActivateField(""STC Pricing Plan Type"");
			sPlanType = sPBusComp.GetFieldValue(""STC Pricing Plan Type"");
			if (sPlanType == ""Postpaid"")
			{
				with (TheApplication())
				{
					sObjectId = this.BusComp().GetFieldValue(""Service Account Id"");
					Input = NewPropertySet();
					Output = NewPropertySet();
					svcOutPayments = GetService(""Workflow Process Manager"");
					Input.SetProperty(""ProcessName"",""STC Get Device Credit Contract Termination WF"");
					Input.SetProperty(""Object Id"",sObjectId);
					svcOutPayments.InvokeMethod(""RunProcess"",Input,Output);
					sExcessCharge = Output.GetProperty(""ExcessCharge"");
					var NumsOutstanding = ToNumber(sExcessCharge);
					if(sExcessCharge > 0)
					{
						RaiseErrorText(""You have ""+sExcessCharge+"" credit available to utilise. Please raise a modify order and utilise the credit"");
					}
				}
			}
		}
	}	   	
	catch(e)
	{
		throw(e);	
	}	
	finally
	{
		svcOutPayments = null;
		Output = null;
		Input = null;
		sPBusComp = null;
	}
}
function GetTerminationCharges()//Suman function created to get Total terminatoin charges before TOO
{
	try
	{
		var appObj = TheApplication();
		var sMsisdn;
		var Input;
		var Output;
		var svcOutPayments;
		var sPlanType;
		var sPBusComp;
		var sOutstanding;
		
		sPBusComp = this.BusComp().ParentBusComp();
		
		if (sPBusComp != null)
		{
			sPBusComp.ActivateField(""STC Pricing Plan Type"");
			sPlanType = sPBusComp.GetFieldValue(""STC Pricing Plan Type"");
			if (sPlanType == ""Postpaid"")
			{
				with (appObj)
				{
					sMsisdn = this.BusComp().GetFieldValue(""Service Account Id"");
		    		Input = NewPropertySet();
		    		Output = NewPropertySet();
		   			svcOutPayments = GetService(""Workflow Process Manager"");
		    		Input.SetProperty(""ProcessName"",""STC Terminated Account Balance CRM WF"");
		   			Input.SetProperty(""Object Id"",sMsisdn);
		    		svcOutPayments.InvokeMethod(""RunProcess"",Input,Output);
		    		sOutstanding = Output.GetProperty(""OutStandAmout"");
		    		var NumsOutstanding = ToNumber(sOutstanding);
		    		if(sOutstanding > 0)
		   			{
		    		RaiseErrorText(""In Order to Proceed further kindly clear Total Termination Charges."");
		   			}
		   		}
			}
		}
	}	   	
	

	
	finally
	{
	}
}
"//Your public declarations go here... 
//[MANUJ]: [Guardian Minor SD]
function MinorMigration(TargetCustId)
{

		var AccountBO=TheApplication().GetBusObject(""Account"");
		var AccountBC= AccountBO.GetBusComp(""Account"");
		var ContactBO=TheApplication().GetBusObject(""Contact"");
		var ContactBC=ContactBO.GetBusComp(""Contact-Thin"");
		var BillingBC= AccountBO.GetBusComp(""CUT Invoice Sub Accounts"");
		
		var PrimaryId = """",DOB = """";
		with(AccountBC)
		{
		SetViewMode(AllView);
		ActivateField(""Primary Contact Id"");
		ClearToQuery();
		SetSearchSpec(""Id"",TargetCustId); 
		ExecuteQuery(ForwardOnly);
		var isRecord = FirstRecord();
		if(isRecord){
		PrimaryId=GetFieldValue(""Primary Contact Id"");				
		}
		}//with(AccountBC)
		with(ContactBC){
		SetViewMode(AllView);
		ActivateField(""Birth Date"");
		ClearToQuery();
		SetSearchSpec(""Id"",PrimaryId);
		ExecuteQuery(ForwardOnly);
		var isRecord1 = FirstRecord();
		if(isRecord1)
		{
		DOB=GetFieldValue(""Birth Date""); 
		if (DOB !="""")
		{
					var Inputs   = TheApplication().NewPropertySet();
					var Outputs = TheApplication().NewPropertySet();			
					var CallBS = TheApplication().GetService(""STC Check Minor Customer BS"");
					Inputs.SetProperty(""DOB"",DOB);				
					CallBS.InvokeMethod(""DOB"", Inputs,Outputs);	
					var Minor = Outputs.GetProperty(""Minor"");
		if (Minor == ""Y"")
		{//Minor
		with(BillingBC)
		{
		SetViewMode(AllView);
		ActivateField(""Master Account Id"");
		ActivateField(""Guardian Verified"");
		ActivateField(""Account Status"");
		ClearToQuery();
		SetSearchSpec(""Master Account Id"",TargetCustId); 
		SetSearchSpec(""Guardian Verified"",""Y""); 
		SetSearchSpec(""Account Status"",""Active""); 
		ExecuteQuery(ForwardOnly);
		var isRecord = FirstRecord();
		  if(!isRecord)
		  {
		TheApplication().RaiseErrorText(""For transfer of ownership to a Minor, the target customer should have atleast one active Guardian Verified Billing Subscription"");	
		  
		  }
		}
		return(CancelOperation);
			}//if (Minor == ""Y"")

		}//if (DOB !="""")
		}//if(isRecord1)

		}//with(ContactBC)
				


}
function NationalityCheck(MethodName)
{
//***********************************************************************************************************//
//[MANUJ] : [Refund & Deposit Functionality]
	try
	{
		var appObj;
		var bsValidCustomer;
		var sErrorCode;
		var sErrorMsg;
		this.BusComp().ActivateField(""Service Account Id"");
		var SANId = this.BusComp().GetFieldValue(""Service Account Id"");
		var psInputsDep = TheApplication().NewPropertySet();
		var psOutputsDep = TheApplication().NewPropertySet();		
		psInputsDep.SetProperty(""ProcessName"", ""STC Deposit Operations WF"");
		psInputsDep.SetProperty(""SANId"", SANId);
		psInputsDep.SetProperty(""Operation"", ""NATIONALITY MATCH"");
		psInputsDep.SetProperty(""MethodName"", MethodName);
		bsValidCustomer = TheApplication().GetService(""Workflow Process Manager"");
		bsValidCustomer.InvokeMethod(""RunProcess"",psInputsDep, psOutputsDep);		
		sErrorCode = psOutputsDep.GetProperty(""Error Code"");
		sErrorMsg = psOutputsDep.GetProperty(""Error Message"");
		if((sErrorCode !="""" && sErrorCode != null) || (sErrorMsg!="""" && sErrorMsg!=null))
		{
			TheApplication().RaiseErrorText(sErrorMsg);
		}
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
		psInputsDep = null;
		psOutputsDep = null;
		bsValidCustomer = null;
	}
}
"//PS 10/05/2010 for Migration Order
function OutstandingBalance()
{
	try
	{
		var appObj = TheApplication();
		var sMsisdn;
		var Input;
		var Output;
		var svcOutPayments;
		var sPlanType;
		var sPBusComp;
		var sOutstanding;
		var sCustomerType;
		var sCompanyOutstanding;
		var sSplitBillFlag;
		
		sPBusComp = this.BusComp().ParentBusComp();
		
		if (sPBusComp != null)
		{
			sPBusComp.ActivateField(""Type"");
			sPBusComp.ActivateField(""STC Pricing Plan Type"");//Mayank: Added for Termination Line
			sPBusComp.ActivateField(""STC Split Billing Flag"");
			sPlanType = sPBusComp.GetFieldValue(""STC Pricing Plan Type"");
			sCustomerType = sPBusComp.GetFieldValue(""Type"");//Mayank: Added for Termination Line
			sSplitBillFlag = sPBusComp.GetFieldValue(""STC Split Billing Flag"");
			var sCurrLogin = appObj.LoginName();
			var foundCSR = appObj.InvokeMethod(""LookupValue"",""STC_OUTSTANDING_BYEPASS_USER"",sCurrLogin);
			if (sPlanType == ""Postpaid"")
			{
				with (appObj)
				{
					sMsisdn = this.BusComp().GetFieldValue(""Serial Number"");
		    		Input = NewPropertySet();
		    		Output = NewPropertySet();
		   			svcOutPayments = GetService(""Workflow Process Manager"");
		    		Input.SetProperty(""ProcessName"",""STC OutstandingPayment WF"");
		   			Input.SetProperty(""MSISDN"",sMsisdn);
		    		svcOutPayments.InvokeMethod(""RunProcess"",Input,Output);
		    		sOutstanding = Output.GetProperty(""OutStandingAmt"");
		    		var NumsOutstanding = ToNumber(sOutstanding);
		    		if(sSplitBillFlag == ""Y"")
					{
						Output.Reset();
						Input.SetProperty(""MSISDN"",sMsisdn+'_A');
						svcOutPayments.InvokeMethod(""RunProcess"",Input,Output);
						sCompanyOutstanding = Output.GetProperty(""OutStandingAmt"");
						sOutstanding = ToNumber(sOutstanding) + ToNumber(sCompanyOutstanding);
					}
		    		if(sOutstanding > 0)
   					{//Mayank
		   			if ((sCustomerType == ""SME"" || sCustomerType == ""Corporate"") && sCurrLogin == foundCSR)//Start: Mayank
		   				{
		   				}
		   			else
			   			{
			    		RaiseErrorText(""In Order to Proceed further kindly clear Outstanding Dues."");
			   			}//End: Mayank
    		   		}
		   		}
			}
		}
	}	   	
	

	
	finally
	{
	}
}
"//Your public declarations go here... 

function SIPConnectivity(sServiceId)
{
try
{
		var appObj = TheApplication();
		var psInputs = appObj.NewPropertySet();
		var psOutputs = appObj.NewPropertySet();
		var svcBusSrv = """";
		with(psInputs)
		{
			SetProperty(""SANId"",sServiceId);
			SetProperty(""Operation"",""CheckPilot"");
			SetProperty(""ProcessName"",""STC MENA SIP ISDN Operations WF"");
		}
		svcBusSrv = appObj.GetService(""Workflow Process Manager"");
		svcBusSrv.InvokeMethod(""RunProcess"",psInputs,psOutputs);
		var Err = psOutputs.GetProperty(""Error Message"");
		if(Err != """" && Err != '' && Err != 0 && Err != '0')
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
svcBusSrv = null;
}




}
function STCTempPlanTermination(){
var appObj, WfSvc, inp, op, ErrCode, ErrMsg;
	
	try{
		appObj = TheApplication();
		with(appObj)
		{
			WfSvc = GetService(""Workflow Process Manager"");
			inp = NewPropertySet();
			op = NewPropertySet();
			with(inp)
			{
				SetProperty(""ProcessName"", ""STC Autocreate Temporary Termination Order WF"");
				SetProperty(""Object Id"", this.BusComp().ParentBusComp().GetFieldValue(""Id""));
			}
			
			WfSvc.InvokeMethod(""RunProcess"",inp,op);
			ErrCode= op.GetProperty(""Error Code"");
			if (ErrCode != ""0"" && ErrCode != """" && ErrCode != null)
			{
				ErrMsg = op.GetProperty(""Error Message"");
				RaiseErrorText(ErrMsg);
			}
			return(CancelOperation);
		}
	}
	catch(e){
		throw(e);
	}
	finally{
	}
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var PlanType="""";
	var MENAAccType="""", vAccStatCalc="""", vBudgetControl="""", vAssetStatus="""", vRootPartNum="""";
	var MENAAllowed=""No"";
	var vALLPLANAllowed = ""No"";
	var sServiceAccntId = """",vPlanPartCode = """",vMENAPLANLOV = """",vMENAPLANAllowLOV = """",SearchSpec = """",vOpenAccessPlansFlag="""", sAssetBC="""";
	var vStatusLOV = TheApplication().InvokeMethod(""LookupValue"", ""IMPL_PHASE"", ""Active"");
	var vRootPartLOV = TheApplication().InvokeMethod(""LookupValue"", ""STC_SIP_ISDN_VAL"", ""VIVASIPPAK"");
	var ParentBC = this.BusComp().ParentBusComp();
	var vDisableMthd = """", vDisableMthdStrng = """";
	try
	{	//Mayank: Code Enhancement
		if (ParentBC)
		{
			with(ParentBC)
			{
				ActivateField(""Type"");
				ActivateField(""Account Status Calc2"");
				ActivateField(""STC Budget Control"");
				MENAAccType = GetFieldValue(""Type"");
				vAccStatCalc = GetFieldValue(""Account Status Calc2"");
				vBudgetControl = GetFieldValue(""STC Budget Control"");
				sServiceAccntId = GetFieldValue(""Id"");
			}
		}
		with(this.BusComp())
		{
			ActivateField(""STC External Profile Type"");
			ActivateField(""Status"");
			ActivateField(""STC Root Product Part Num"");
			PlanType = GetFieldValue(""STC External Profile Type"");
			vAssetStatus = GetFieldValue(""Status"");
			vRootPartNum = GetFieldValue(""STC Root Product Part Num"");
			PlanType = PlanType.substring(0,4);
		}
		//	if(declaredServiceAccntId == """")
		//	{
		sAssetBC = TheApplication().GetBusObject(""STC Asset Mgmt - Asset Thin BO"").GetBusComp(""STC Asset Mgmt - Asset Thin"");
		with(sAssetBC)
		{
			ActivateField(""Service Account Id"");
			ActivateField(""Status"");
			ActivateField(""STC Plan Type"");
			ActivateField(""Product Part Number"");
			SetViewMode(AllView);
			ClearToQuery();
			SearchSpec = ""[Service Account Id] = '"" + sServiceAccntId + ""' AND [Status] <> 'Inactive' AND [STC Plan Type] = 'Service Plan'"";
			SetSearchExpr(SearchSpec);
			ExecuteQuery();
			if(FirstRecord())
			{
				vPlanPartCode = GetFieldValue(""Product Part Number"");
			}
		}
		//	declaredServiceAccntId = vPlanPartCode;
		//	}
		vDisableMthd = TheApplication().InvokeMethod(""LookupValue"", ""STC_DISABLE_UI_PLANS"", vPlanPartCode); //[Indrasen:25102020: IOT Connected Cars SD new]
		vDisableMthdStrng = vDisableMthd.substring(0,7);

		vMENAPLANLOV = TheApplication().InvokeMethod(""LookupValue"", ""STC_MENA_PLANS"", vPlanPartCode);
		if(vMENAPLANLOV != null && vMENAPLANLOV != """")
		{
			vMENAPLANAllowLOV = TheApplication().InvokeMethod(""LookupValue"", ""STC_ALLOWED_MENA_PLANS_ACCESS"", vPlanPartCode);
			vMENAPLANAllowLOV = vMENAPLANAllowLOV.substring(0,5);
		}
		else
		{	//[NAVIN:26May2020:OpenAccesssToMENAAgents]
			vOpenAccessPlansFlag = TheApplication().InvokeMethod(""LookupValue"", ""STC_ALLOWED_STC_PLANS_ACCESS"", vPlanPartCode);
			if (vOpenAccessPlansFlag != null && vOpenAccessPlansFlag != """")
				vOpenAccessPlansFlag = vOpenAccessPlansFlag.substring(0,5);
			else
				vOpenAccessPlansFlag = ""NA"";
		}
		MENAAllowed = CheckMENAPosition();
		vALLPLANAllowed = ALLPLANAllowed();
		if(PlanType != ""MENA"")
		{
			PlanType = ""VIVA"";
		}
		if((MethodName == ""SuspendProdSvc"" || MethodName == ""TempSuspendSvc"" || MethodName == ""MigrationProdSvc"" || MethodName == ""ModifyProdSvc"" || MethodName == ""DisconnectProdSvc""))
		{
			if(PlanType == ""MENA"" && MENAAccType == ""Individual"")
			{
				if(MENAAllowed == ""No"")
				{
					if(vALLPLANAllowed == ""Yes"" && vMENAPLANAllowLOV == ""ALLOW"")
					{
						if ((MethodName == ""DisconnectProdSvc"") && ((vAssetStatus == vStatusLOV) || (vAccStatCalc == ""Y"")))
						{
							CanInvoke = ""TRUE"";	
						}
						else if (((MethodName == ""MigrationProdSvc"") || (MethodName == ""ModifyProdSvc"")) && ((vAssetStatus == vStatusLOV) && (vBudgetControl == null || vBudgetControl == """")))
						{
							CanInvoke = ""TRUE"";
						}
						else if (((MethodName == ""SuspendProdSvc"") || (MethodName == ""TempSuspendSvc"")) && ((vAssetStatus == vStatusLOV) && (vBudgetControl == null || vBudgetControl == """")))
						{
							CanInvoke = ""TRUE"";
						}
						else
						{
							CanInvoke = ""FALSE"";
						}
					}
					return (CancelOperation);
				}
				else
				{
					if ((MethodName == ""DisconnectProdSvc"") && ((vAssetStatus == vStatusLOV) || (vAccStatCalc == ""Y"")))
					{
						CanInvoke = ""TRUE"";	
					}
					else if (((MethodName == ""MigrationProdSvc"") || (MethodName == ""ModifyProdSvc"")) && ((vAssetStatus == vStatusLOV) && (vBudgetControl == null || vBudgetControl == """")))
					{
						CanInvoke = ""TRUE"";
					}
					else if (((MethodName == ""SuspendProdSvc"") || (MethodName == ""TempSuspendSvc"")) && ((vAssetStatus == vStatusLOV) && (vBudgetControl == null || vBudgetControl == """")))
					{
						CanInvoke = ""TRUE"";
					}
					else
					{
						CanInvoke = ""FALSE"";
					}
					return (CancelOperation);	   	
				}
			}
			else if(PlanType == ""VIVA"" && MENAAllowed == ""Yes"" && MENAAccType == ""Individual"" && vOpenAccessPlansFlag != ""ALLOW"")//[NAVIN:26May2020:OpenAccesssToMENAAgents]
			{
				CanInvoke = ""FALSE"";
				return (CancelOperation);
			}
			else if(PlanType == ""VIVA"" && vDisableMthdStrng == ""DISABLE"") //[Indrasen:25102020: IOT Connected Cars SD]
			{	
				CanInvoke = ""FALSE"";
				return (CancelOperation);
			}
			else
			{
				if ((MethodName == ""DisconnectProdSvc"") && ((vAssetStatus == vStatusLOV) || (vAccStatCalc == ""Y"")))
				{
					CanInvoke = ""TRUE"";	
				}
				else if (((MethodName == ""MigrationProdSvc"") || (MethodName == ""ModifyProdSvc"")) && ((vAssetStatus == vStatusLOV) && (vBudgetControl == null || vBudgetControl == """")))
				{
					CanInvoke = ""TRUE"";
				}
				else if (((MethodName == ""SuspendProdSvc"") || (MethodName == ""TempSuspendSvc"")) && ((vAssetStatus == vStatusLOV) && (vBudgetControl == null || vBudgetControl == """")))
				{
					CanInvoke = ""TRUE"";
				}
				else{
					CanInvoke = ""FALSE"";
				}
				return (CancelOperation);	   	
			}
		}
		if (MethodName == ""ResumeProdSvc"")
		{   
			var CurrLogin = TheApplication().LoginName();
			var foundCSR = TheApplication().InvokeMethod(""LookupValue"",""STC_RESUME_CSR"",CurrLogin); 
			var foundCSRSubstr = foundCSR.substring(0,3);
			var status=this.BusComp().ParentBusComp().GetFieldValue(""Account Status"");
			if(foundCSRSubstr ==""RES"" && status==""Suspended"")
			{
				if(PlanType == ""MENA"" &&  MENAAccType == ""Individual"")
				{
					if(MENAAllowed == ""No"")
					{
						if(vALLPLANAllowed == ""Yes"" && vMENAPLANAllowLOV == ""ALLOW"")
						{
							CanInvoke = ""TRUE"";
						}
						else
						{
							CanInvoke = ""FALSE"";
						}
						return (CancelOperation);	   	
					}
					else
					{		   
						CanInvoke = ""TRUE"";
						return (CancelOperation);	   	
					}
				}
				else if(PlanType == ""VIVA"" && MENAAllowed == ""Yes"" && MENAAccType == ""Individual"" && vOpenAccessPlansFlag != ""ALLOW"")//[NAVIN:26May2020:OpenAccesssToMENAAgents])
				{
					CanInvoke = ""FALSE"";
					return (CancelOperation);	   	
				}
				else if(PlanType == ""VIVA"" && vDisableMthdStrng == ""DISABLE"") //[Indrasen:25102020: IOT Connected Cars SD]
				{	
					CanInvoke = ""FALSE"";
					return (CancelOperation);
				}
				else
				{
					CanInvoke = ""TRUE"";
					return (CancelOperation);	   	
				}
			}
			else
			{
				CanInvoke = ""FALSE"";
				return (CancelOperation);
			}
		}
		if(MethodName == ""ServiceMigrationSvc"")
		{
			CanInvoke = ""FALSE"";
			this.BusComp().ParentBusComp().ActivateField(""Type"");
			this.BusComp().ParentBusComp().ActivateField(""Account Status"");
			var StrAccntType = this.BusComp().ParentBusComp().GetFieldValue(""Type"");
			var sLOVAccntType = TheApplication().InvokeMethod(""LookupValue"",""STC_SVCMIG_CUST"",StrAccntType);
			var Status = this.BusComp().ParentBusComp().GetFieldValue(""Account Status""); 
			var sLOVAccntTypeSubStr = sLOVAccntType.substring(0,5);
			if(sLOVAccntTypeSubStr == ""Allow"" && Status == ""Active"")
			{
				this.BusComp().ActivateField(""STC Root Product Part Num"");
				var sMigRootPartNum = this.BusComp().GetFieldValue(""STC Root Product Part Num"");
				var SerMigPackCheck = TheApplication().InvokeMethod(""LookupValue"",""STC_MIG_PACK"", sMigRootPartNum);
				var serMigPackSubstr = SerMigPackCheck.substring(0,4);
				if(serMigPackSubstr == ""PACK"")
				{
					if(PlanType == ""MENA"" && MENAAccType == ""Individual"")
					{
						if(MENAAllowed != ""No"")
						{
							CanInvoke = ""TRUE"";
						}
						else
						{
							if(vALLPLANAllowed == ""Yes"" && vMENAPLANAllowLOV == ""ALLOW"")
							{
								CanInvoke = ""TRUE"";
							}
							else
							{
								CanInvoke = ""FALSE"";
							}
						}
					}
					else if(PlanType == ""VIVA"" && MENAAllowed == ""Yes"" && MENAAccType == ""Individual"" && vOpenAccessPlansFlag != ""ALLOW"")//[NAVIN:26May2020:OpenAccesssToMENAAgents])
					{
						CanInvoke = ""FALSE"";
						return (CancelOperation);	   	
					}
					else if(PlanType == ""VIVA"" && vDisableMthdStrng == ""DISABLE"") //[Indrasen:25102020: IOT Connected Cars SD]
					{	
						CanInvoke = ""FALSE"";
						return (CancelOperation);
					}
					else 
					{ 
						CanInvoke = ""TRUE"";
					}
				}
				else
				{
					CanInvoke = ""FALSE"";
				}
			}
			else
			{
				CanInvoke = ""FALSE"";
			}
			return (CancelOperation);
		}
	}//try
	catch(e)
	{
	}
	finally
	{
		sAssetBC = null;
		ParentBC = null;
	}
	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var PlanType="""";
	var MENAAccType="""", vAccStatCalc="""", vBudgetControl="""", vAssetStatus="""", vRootPartNum="""";
	var MENAAllowed=""No"";
	var vALLPLANAllowed = ""No"";
	var sServiceAccntId = """",vPlanPartCode = """",vMENAPLANLOV = """",vMENAPLANAllowLOV = """",SearchSpec = """",vOpenAccessPlansFlag="""", sAssetBC="""";
	var vStatusLOV = TheApplication().InvokeMethod(""LookupValue"", ""IMPL_PHASE"", ""Active"");
	var vRootPartLOV = TheApplication().InvokeMethod(""LookupValue"", ""STC_SIP_ISDN_VAL"", ""VIVASIPPAK"");
	var ParentBC = this.BusComp().ParentBusComp();
	var vDisableMthd = """", vDisableMthdStrng = """", vPkgCheck = """";
	var stcTempTermSwitch=""OFF"",strPricingPlanType="""",stcAccStatus="""";
	try
	{	//Mayank: Code Enhancement
	
		if (ParentBC)
		{
			with(ParentBC)
			{
				ActivateField(""Type"");
				ActivateField(""Account Status Calc2"");
				ActivateField(""STC Budget Control"");
				ActivateField(""STC Pricing Plan Type"");			
				ActivateField(""Account Status"");			
				MENAAccType = GetFieldValue(""Type"");
				vAccStatCalc = GetFieldValue(""Account Status Calc2"");
				vBudgetControl = GetFieldValue(""STC Budget Control"");
				sServiceAccntId = GetFieldValue(""Id"");
				strPricingPlanType = GetFieldValue(""STC Pricing Plan Type"");
				stcAccStatus=GetFieldValue(""Account Status"");			
			}
		}
		with(this.BusComp())
		{
			ActivateField(""STC External Profile Type"");
			ActivateField(""Status"");
			ActivateField(""STC Root Product Part Num"");
			PlanType = GetFieldValue(""STC External Profile Type"");
			vAssetStatus = GetFieldValue(""Status"");
			vRootPartNum = GetFieldValue(""STC Root Product Part Num"");
			PlanType = PlanType.substring(0,4);
		}
		//	if(declaredServiceAccntId == """")
		//	{
		sAssetBC = TheApplication().GetBusObject(""STC Asset Mgmt - Asset Thin BO"").GetBusComp(""STC Asset Mgmt - Asset Thin"");
		with(sAssetBC)
		{
			ActivateField(""Service Account Id"");
			ActivateField(""Status"");
			ActivateField(""STC Plan Type"");
			ActivateField(""Product Part Number"");
			SetViewMode(AllView);
			ClearToQuery();
			SearchSpec = ""[Service Account Id] = '"" + sServiceAccntId + ""' AND [Status] <> 'Inactive' AND [STC Plan Type] = 'Service Plan'"";
			SetSearchExpr(SearchSpec);
			ExecuteQuery();
			if(FirstRecord())
			{
				vPlanPartCode = GetFieldValue(""Product Part Number"");
			}
		}
		//	declaredServiceAccntId = vPlanPartCode;
		//	}
		vDisableMthd = TheApplication().InvokeMethod(""LookupValue"", ""STC_DISABLE_UI_PLANS"", vPlanPartCode); //[Indrasen:25102020: IOT Connected Cars SD new]
		vDisableMthdStrng = vDisableMthd.substring(0,7);

		vPkgCheck = TheApplication().InvokeMethod(""LookupValue"", ""STC_PKG_NON_VOICE"", vRootPartNum); //[RUTUJA:14Dec2021:MicrosoftService]
		vPkgCheck = vPkgCheck.substring(0,5);//display value: DUMMYRootpartNum,LIC: Root part num

		vMENAPLANLOV = TheApplication().InvokeMethod(""LookupValue"", ""STC_MENA_PLANS"", vPlanPartCode);
		if(vMENAPLANLOV != null && vMENAPLANLOV != """")
		{
			vMENAPLANAllowLOV = TheApplication().InvokeMethod(""LookupValue"", ""STC_ALLOWED_MENA_PLANS_ACCESS"", vPlanPartCode);
			vMENAPLANAllowLOV = vMENAPLANAllowLOV.substring(0,5);
		}
		else
		{	//[NAVIN:26May2020:OpenAccesssToMENAAgents]
			vOpenAccessPlansFlag = TheApplication().InvokeMethod(""LookupValue"", ""STC_ALLOWED_STC_PLANS_ACCESS"", vPlanPartCode);
			if (vOpenAccessPlansFlag != null && vOpenAccessPlansFlag != """")
				vOpenAccessPlansFlag = vOpenAccessPlansFlag.substring(0,5);
			else
				vOpenAccessPlansFlag = ""NA"";
		}
		MENAAllowed = CheckMENAPosition();
		vALLPLANAllowed = ALLPLANAllowed();
		if(PlanType != ""MENA"")
		{
			PlanType = ""VIVA"";
		}

		//
		if((MethodName == ""SuspendProdSvc"" || MethodName == ""TempSuspendSvc"" || MethodName == ""MigrationProdSvc"" || MethodName == ""ModifyProdSvc"" || MethodName == ""DisconnectProdSvc"" || MethodName==""STCTempPlanTermination""))
		{
			if(PlanType == ""MENA"" && MENAAccType == ""Individual"")
			{
				if(MENAAllowed == ""No"")
				{
					if(vALLPLANAllowed == ""Yes"" && vMENAPLANAllowLOV == ""ALLOW"")
					{
						if ((MethodName == ""DisconnectProdSvc"") && ((vAssetStatus == vStatusLOV) || (vAccStatCalc == ""Y"")))
						{
							CanInvoke = ""TRUE"";	
						}
						else if (((MethodName == ""MigrationProdSvc"") || (MethodName == ""ModifyProdSvc"") || (MethodName==""STCTempPlanTermination"")) && ((vAssetStatus == vStatusLOV) && (vBudgetControl == null || vBudgetControl == """")))
						{
							CanInvoke = ""TRUE"";
						}
						else if (((MethodName == ""SuspendProdSvc"") || (MethodName == ""TempSuspendSvc"")) && ((vAssetStatus == vStatusLOV) && (vBudgetControl == null || vBudgetControl == """")))
						{
							CanInvoke = ""TRUE"";
						}
						else
						{
							CanInvoke = ""FALSE"";
						}
					}
					if(MethodName==""STCTempPlanTermination"" && (CanInvoke == ""TRUE"" || CanInvoke == """" || CanInvoke == null))//Abuzar:TempTermination_25112021
					{	stcTempTermSwitch = TheApplication().InvokeMethod(""LookupValue"", ""STC_TEMP_TERMINATION"", ""SWITCH"");	
						if(MENAAccType == ""Individual"" && stcAccStatus != ""New"" && stcAccStatus != ""Terminated"" && strPricingPlanType==""Postpaid"" && stcTempTermSwitch==""ON"")
							CanInvoke = ""TRUE"";	
						else
							CanInvoke = ""FALSE"";			
					}
					return (CancelOperation);
				}
				else
				{
					if ((MethodName == ""DisconnectProdSvc"") && ((vAssetStatus == vStatusLOV) || (vAccStatCalc == ""Y"")))
					{
						CanInvoke = ""TRUE"";	
					}
					else if (((MethodName == ""MigrationProdSvc"") || (MethodName == ""ModifyProdSvc"") || (MethodName==""STCTempPlanTermination"")) && ((vAssetStatus == vStatusLOV) && (vBudgetControl == null || vBudgetControl == """")))
					{
						CanInvoke = ""TRUE"";
					}
					else if (((MethodName == ""SuspendProdSvc"") || (MethodName == ""TempSuspendSvc"")) && ((vAssetStatus == vStatusLOV) && (vBudgetControl == null || vBudgetControl == """")))
					{
						CanInvoke = ""TRUE"";
					}
					else
					{
						CanInvoke = ""FALSE"";
					}
					if(MethodName==""STCTempPlanTermination"" && (CanInvoke == ""TRUE"" || CanInvoke == """" || CanInvoke == null))//Abuzar:TempTermination_25112021
					{	stcTempTermSwitch = TheApplication().InvokeMethod(""LookupValue"", ""STC_TEMP_TERMINATION"", ""SWITCH"");	
						if(MENAAccType == ""Individual"" && stcAccStatus != ""New"" && stcAccStatus != ""Terminated"" && strPricingPlanType==""Postpaid"" && stcTempTermSwitch==""ON"")
							CanInvoke = ""TRUE"";	
						else
							CanInvoke = ""FALSE"";			
					}
					return (CancelOperation);	   	
				}
			}
			else if(PlanType == ""VIVA"" && MENAAllowed == ""Yes"" && MENAAccType == ""Individual"" && vOpenAccessPlansFlag != ""ALLOW"")//[NAVIN:26May2020:OpenAccesssToMENAAgents]
			{
				CanInvoke = ""FALSE"";
				return (CancelOperation);
			}
			else if(PlanType == ""VIVA"" && (vDisableMthdStrng == ""DISABLE"" || vPkgCheck == ""DUMMY"")) //[Indrasen:25102020: IOT Connected Cars SD]
			{	
				//Pankaj: Added below if for GM Connected cars
				var vGMDisconnectAllow = TheApplication().InvokeMethod(""LookupValue"", ""STC_IOT_DATA"", vPlanPartCode);
				vGMDisconnectAllow = vGMDisconnectAllow.substring(0,5);				
				if(MethodName == ""DisconnectProdSvc"" && (vGMDisconnectAllow == ""ALLOW"" || vPkgCheck == ""DUMMY"")){
					CanInvoke = ""TRUE"";
				}
				else{
					CanInvoke = ""FALSE"";
				}
				return (CancelOperation);
			}
			else
			{
				if ((MethodName == ""DisconnectProdSvc"") && ((vAssetStatus == vStatusLOV) || (vAccStatCalc == ""Y"")))
				{
					CanInvoke = ""TRUE"";	
				}
				else if (((MethodName == ""MigrationProdSvc"") || (MethodName == ""ModifyProdSvc"") || (MethodName==""STCTempPlanTermination"")) && ((vAssetStatus == vStatusLOV) && (vBudgetControl == null || vBudgetControl == """")))
				{
					CanInvoke = ""TRUE"";
				}
				else if (((MethodName == ""SuspendProdSvc"") || (MethodName == ""TempSuspendSvc"")) && ((vAssetStatus == vStatusLOV) && (vBudgetControl == null || vBudgetControl == """")))
				{
						CanInvoke = ""TRUE"";
				}
				else{
					CanInvoke = ""FALSE"";
				}
				if(MethodName==""STCTempPlanTermination"" && (CanInvoke == ""TRUE"" || CanInvoke == """" || CanInvoke == null))//Abuzar:TempTermination_25112021
				{	stcTempTermSwitch = TheApplication().InvokeMethod(""LookupValue"", ""STC_TEMP_TERMINATION"", ""SWITCH"");	
					if(MENAAccType == ""Individual"" && stcAccStatus != ""New"" && stcAccStatus != ""Terminated"" && strPricingPlanType==""Postpaid"" && stcTempTermSwitch==""ON"")
						CanInvoke = ""TRUE"";	
					else
						CanInvoke = ""FALSE"";			
				}
				return (CancelOperation);	   	
			}
		}
		
		if (MethodName == ""ResumeProdSvc"")
		{   
			var CurrLogin = TheApplication().LoginName();
			var foundCSR = TheApplication().InvokeMethod(""LookupValue"",""STC_RESUME_CSR"",CurrLogin); 
			var foundCSRSubstr = foundCSR.substring(0,3);
			var status=this.BusComp().ParentBusComp().GetFieldValue(""Account Status"");
			if(foundCSRSubstr ==""RES"" && status==""Suspended"")
			{
				if(PlanType == ""MENA"" &&  MENAAccType == ""Individual"")
				{
					if(MENAAllowed == ""No"")
					{
						if(vALLPLANAllowed == ""Yes"" && vMENAPLANAllowLOV == ""ALLOW"")
						{
							CanInvoke = ""TRUE"";
						}
						else
						{
							CanInvoke = ""FALSE"";
						}
						return (CancelOperation);	   	
					}
					else
					{		   
						CanInvoke = ""TRUE"";
						return (CancelOperation);	   	
					}
				}
				else if(PlanType == ""VIVA"" && MENAAllowed == ""Yes"" && MENAAccType == ""Individual"" && vOpenAccessPlansFlag != ""ALLOW"")//[NAVIN:26May2020:OpenAccesssToMENAAgents])
				{
					CanInvoke = ""FALSE"";
					return (CancelOperation);	   	
				}
				else if(PlanType == ""VIVA"" && (vDisableMthdStrng == ""DISABLE"" || vPkgCheck == ""DUMMY"")) //[Indrasen:25102020: IOT Connected Cars SD]
				{	
					CanInvoke = ""FALSE"";
					return (CancelOperation);
				}
				else
				{
					CanInvoke = ""TRUE"";
					return (CancelOperation);	   	
				}
			}
			else
			{
				CanInvoke = ""FALSE"";
				return (CancelOperation);
			}
		}
		if(MethodName == ""ServiceMigrationSvc"")
		{
			CanInvoke = ""FALSE"";
			this.BusComp().ParentBusComp().ActivateField(""Type"");
			this.BusComp().ParentBusComp().ActivateField(""Account Status"");
			var StrAccntType = this.BusComp().ParentBusComp().GetFieldValue(""Type"");
			var sLOVAccntType = TheApplication().InvokeMethod(""LookupValue"",""STC_SVCMIG_CUST"",StrAccntType);
			var Status = this.BusComp().ParentBusComp().GetFieldValue(""Account Status""); 
			var sLOVAccntTypeSubStr = sLOVAccntType.substring(0,5);
			if(sLOVAccntTypeSubStr == ""Allow"" && Status == ""Active"")
			{
				this.BusComp().ActivateField(""STC Root Product Part Num"");
				var sMigRootPartNum = this.BusComp().GetFieldValue(""STC Root Product Part Num"");
				var SerMigPackCheck = TheApplication().InvokeMethod(""LookupValue"",""STC_MIG_PACK"", sMigRootPartNum);
				var serMigPackSubstr = SerMigPackCheck.substring(0,4);
				if(serMigPackSubstr == ""PACK"")
				{
					if(PlanType == ""MENA"" && MENAAccType == ""Individual"")
					{
						if(MENAAllowed != ""No"")
						{
							CanInvoke = ""TRUE"";
						}
						else
						{
							if(vALLPLANAllowed == ""Yes"" && vMENAPLANAllowLOV == ""ALLOW"")
							{
								CanInvoke = ""TRUE"";
							}
							else
							{
								CanInvoke = ""FALSE"";
							}
						}
					}
					else if(PlanType == ""VIVA"" && MENAAllowed == ""Yes"" && MENAAccType == ""Individual"" && vOpenAccessPlansFlag != ""ALLOW"")//[NAVIN:26May2020:OpenAccesssToMENAAgents])
					{
						CanInvoke = ""FALSE"";
						return (CancelOperation);	   	
					}
					else if(PlanType == ""VIVA"" && (vDisableMthdStrng == ""DISABLE"" || vPkgCheck == ""DUMMY"")) //[Indrasen:25102020: IOT Connected Cars SD]
					{	
						CanInvoke = ""FALSE"";
						return (CancelOperation);
					}
					else 
					{ 
						CanInvoke = ""TRUE"";
					}
				}
				else
				{
					CanInvoke = ""FALSE"";
				}
			}
			else
			{
				CanInvoke = ""FALSE"";
			}
			return (CancelOperation);
		}
	}//try
	catch(e)
	{
	//throw(e);
	}
	finally
	{
		sAssetBC = null;
		ParentBC = null;
	}
	return (ContinueOperation);
}
function WebApplet_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	var PlanType="""";
	var MENAAccType="""", vAccStatCalc="""", vBudgetControl="""", vAssetStatus="""", vRootPartNum="""";
	var MENAAllowed=""No"";
	var vALLPLANAllowed = ""No"";
	var sServiceAccntId = """",vPlanPartCode = """",vMENAPLANLOV = """",vMENAPLANAllowLOV = """",SearchSpec = """",vOpenAccessPlansFlag="""", sAssetBC="""";
	var vStatusLOV = TheApplication().InvokeMethod(""LookupValue"", ""IMPL_PHASE"", ""Active"");
	var vRootPartLOV = TheApplication().InvokeMethod(""LookupValue"", ""STC_SIP_ISDN_VAL"", ""VIVASIPPAK"");
	var ParentBC = this.BusComp().ParentBusComp();
	var vDisableMthd = """", vDisableMthdStrng = """";
	var stcTempTermSwitch=""OFF"",strPricingPlanType="""",stcAccStatus="""";
	try
	{	//Mayank: Code Enhancement
	
		if (ParentBC)
		{
			with(ParentBC)
			{
				ActivateField(""Type"");
				ActivateField(""Account Status Calc2"");
				ActivateField(""STC Budget Control"");
				ActivateField(""STC Pricing Plan Type"");			
				ActivateField(""Account Status"");			
				MENAAccType = GetFieldValue(""Type"");
				vAccStatCalc = GetFieldValue(""Account Status Calc2"");
				vBudgetControl = GetFieldValue(""STC Budget Control"");
				sServiceAccntId = GetFieldValue(""Id"");
				strPricingPlanType = GetFieldValue(""STC Pricing Plan Type"");
				stcAccStatus=GetFieldValue(""Account Status"");			
			}
		}
		with(this.BusComp())
		{
			ActivateField(""STC External Profile Type"");
			ActivateField(""Status"");
			ActivateField(""STC Root Product Part Num"");
			PlanType = GetFieldValue(""STC External Profile Type"");
			vAssetStatus = GetFieldValue(""Status"");
			vRootPartNum = GetFieldValue(""STC Root Product Part Num"");
			PlanType = PlanType.substring(0,4);
		}
		//	if(declaredServiceAccntId == """")
		//	{
		sAssetBC = TheApplication().GetBusObject(""STC Asset Mgmt - Asset Thin BO"").GetBusComp(""STC Asset Mgmt - Asset Thin"");
		with(sAssetBC)
		{
			ActivateField(""Service Account Id"");
			ActivateField(""Status"");
			ActivateField(""STC Plan Type"");
			ActivateField(""Product Part Number"");
			SetViewMode(AllView);
			ClearToQuery();
			SearchSpec = ""[Service Account Id] = '"" + sServiceAccntId + ""' AND [Status] <> 'Inactive' AND [STC Plan Type] = 'Service Plan'"";
			SetSearchExpr(SearchSpec);
			ExecuteQuery();
			if(FirstRecord())
			{
				vPlanPartCode = GetFieldValue(""Product Part Number"");
			}
		}
		//	declaredServiceAccntId = vPlanPartCode;
		//	}
		vDisableMthd = TheApplication().InvokeMethod(""LookupValue"", ""STC_DISABLE_UI_PLANS"", vPlanPartCode); //[Indrasen:25102020: IOT Connected Cars SD new]
		vDisableMthdStrng = vDisableMthd.substring(0,7);

		vMENAPLANLOV = TheApplication().InvokeMethod(""LookupValue"", ""STC_MENA_PLANS"", vPlanPartCode);
		if(vMENAPLANLOV != null && vMENAPLANLOV != """")
		{
			vMENAPLANAllowLOV = TheApplication().InvokeMethod(""LookupValue"", ""STC_ALLOWED_MENA_PLANS_ACCESS"", vPlanPartCode);
			vMENAPLANAllowLOV = vMENAPLANAllowLOV.substring(0,5);
		}
		else
		{	//[NAVIN:26May2020:OpenAccesssToMENAAgents]
			vOpenAccessPlansFlag = TheApplication().InvokeMethod(""LookupValue"", ""STC_ALLOWED_STC_PLANS_ACCESS"", vPlanPartCode);
			if (vOpenAccessPlansFlag != null && vOpenAccessPlansFlag != """")
				vOpenAccessPlansFlag = vOpenAccessPlansFlag.substring(0,5);
			else
				vOpenAccessPlansFlag = ""NA"";
		}
		MENAAllowed = CheckMENAPosition();
		vALLPLANAllowed = ALLPLANAllowed();
		if(PlanType != ""MENA"")
		{
			PlanType = ""VIVA"";
		}

		//
		if((MethodName == ""SuspendProdSvc"" || MethodName == ""TempSuspendSvc"" || MethodName == ""MigrationProdSvc"" || MethodName == ""ModifyProdSvc"" || MethodName == ""DisconnectProdSvc"" || MethodName==""STCTempPlanTermination""))
		{
			if(PlanType == ""MENA"" && MENAAccType == ""Individual"")
			{
				if(MENAAllowed == ""No"")
				{
					if(vALLPLANAllowed == ""Yes"" && vMENAPLANAllowLOV == ""ALLOW"")
					{
						if ((MethodName == ""DisconnectProdSvc"") && ((vAssetStatus == vStatusLOV) || (vAccStatCalc == ""Y"")))
						{
							CanInvoke = ""TRUE"";	
						}
						else if (((MethodName == ""MigrationProdSvc"") || (MethodName == ""ModifyProdSvc"") || (MethodName==""STCTempPlanTermination"")) && ((vAssetStatus == vStatusLOV) && (vBudgetControl == null || vBudgetControl == """")))
						{
							CanInvoke = ""TRUE"";
						}
						else if (((MethodName == ""SuspendProdSvc"") || (MethodName == ""TempSuspendSvc"")) && ((vAssetStatus == vStatusLOV) && (vBudgetControl == null || vBudgetControl == """")))
						{
							CanInvoke = ""TRUE"";
						}
						else
						{
							CanInvoke = ""FALSE"";
						}
					}
					if(MethodName==""STCTempPlanTermination"" && (CanInvoke == ""TRUE"" || CanInvoke == """" || CanInvoke == null))//Abuzar:TempTermination_25112021
					{	stcTempTermSwitch = TheApplication().InvokeMethod(""LookupValue"", ""STC_TEMP_TERMINATION"", ""SWITCH"");	
						if(MENAAccType == ""Individual"" && stcAccStatus != ""New"" && stcAccStatus != ""Terminated"" && strPricingPlanType==""Postpaid"" && stcTempTermSwitch==""ON"")
							CanInvoke = ""TRUE"";	
						else
							CanInvoke = ""FALSE"";			
					}
					return (CancelOperation);
				}
				else
				{
					if ((MethodName == ""DisconnectProdSvc"") && ((vAssetStatus == vStatusLOV) || (vAccStatCalc == ""Y"")))
					{
						CanInvoke = ""TRUE"";	
					}
					else if (((MethodName == ""MigrationProdSvc"") || (MethodName == ""ModifyProdSvc"") || (MethodName==""STCTempPlanTermination"")) && ((vAssetStatus == vStatusLOV) && (vBudgetControl == null || vBudgetControl == """")))
					{
						CanInvoke = ""TRUE"";
					}
					else if (((MethodName == ""SuspendProdSvc"") || (MethodName == ""TempSuspendSvc"")) && ((vAssetStatus == vStatusLOV) && (vBudgetControl == null || vBudgetControl == """")))
					{
						CanInvoke = ""TRUE"";
					}
					else
					{
						CanInvoke = ""FALSE"";
					}
					if(MethodName==""STCTempPlanTermination"" && (CanInvoke == ""TRUE"" || CanInvoke == """" || CanInvoke == null))//Abuzar:TempTermination_25112021
					{	stcTempTermSwitch = TheApplication().InvokeMethod(""LookupValue"", ""STC_TEMP_TERMINATION"", ""SWITCH"");	
						if(MENAAccType == ""Individual"" && stcAccStatus != ""New"" && stcAccStatus != ""Terminated"" && strPricingPlanType==""Postpaid"" && stcTempTermSwitch==""ON"")
							CanInvoke = ""TRUE"";	
						else
							CanInvoke = ""FALSE"";			
					}
					return (CancelOperation);	   	
				}
			}
			else if(PlanType == ""VIVA"" && MENAAllowed == ""Yes"" && MENAAccType == ""Individual"" && vOpenAccessPlansFlag != ""ALLOW"")//[NAVIN:26May2020:OpenAccesssToMENAAgents]
			{
				CanInvoke = ""FALSE"";
				return (CancelOperation);
			}
			else if(PlanType == ""VIVA"" && vDisableMthdStrng == ""DISABLE"") //[Indrasen:25102020: IOT Connected Cars SD]
			{	
				//Pankaj: Added below if for GM Connected cars
				var vGMDisconnectAllow = TheApplication().InvokeMethod(""LookupValue"", ""STC_IOT_DATA"", vPlanPartCode);
				vGMDisconnectAllow = vGMDisconnectAllow.substring(0,5);				
				if(MethodName == ""DisconnectProdSvc"" && vGMDisconnectAllow == ""ALLOW""){
					CanInvoke = ""TRUE"";
				}
				else{
					CanInvoke = ""FALSE"";
				}
				return (CancelOperation);
			}
			else
			{
				if ((MethodName == ""DisconnectProdSvc"") && ((vAssetStatus == vStatusLOV) || (vAccStatCalc == ""Y"")))
				{
					CanInvoke = ""TRUE"";	
				}
				else if (((MethodName == ""MigrationProdSvc"") || (MethodName == ""ModifyProdSvc"") || (MethodName==""STCTempPlanTermination"")) && ((vAssetStatus == vStatusLOV) && (vBudgetControl == null || vBudgetControl == """")))
				{
					CanInvoke = ""TRUE"";
				}
				else if (((MethodName == ""SuspendProdSvc"") || (MethodName == ""TempSuspendSvc"")) && ((vAssetStatus == vStatusLOV) && (vBudgetControl == null || vBudgetControl == """")))
				{
						CanInvoke = ""TRUE"";
				}
				else{
					CanInvoke = ""FALSE"";
				}
				if(MethodName==""STCTempPlanTermination"" && (CanInvoke == ""TRUE"" || CanInvoke == """" || CanInvoke == null))//Abuzar:TempTermination_25112021
				{	stcTempTermSwitch = TheApplication().InvokeMethod(""LookupValue"", ""STC_TEMP_TERMINATION"", ""SWITCH"");	
					if(MENAAccType == ""Individual"" && stcAccStatus != ""New"" && stcAccStatus != ""Terminated"" && strPricingPlanType==""Postpaid"" && stcTempTermSwitch==""ON"")
						CanInvoke = ""TRUE"";	
					else
						CanInvoke = ""FALSE"";			
				}
				return (CancelOperation);	   	
			}
		}
		
		if (MethodName == ""ResumeProdSvc"")
		{   
			var CurrLogin = TheApplication().LoginName();
			var foundCSR = TheApplication().InvokeMethod(""LookupValue"",""STC_RESUME_CSR"",CurrLogin); 
			var foundCSRSubstr = foundCSR.substring(0,3);
			var status=this.BusComp().ParentBusComp().GetFieldValue(""Account Status"");
			if(foundCSRSubstr ==""RES"" && status==""Suspended"")
			{
				if(PlanType == ""MENA"" &&  MENAAccType == ""Individual"")
				{
					if(MENAAllowed == ""No"")
					{
						if(vALLPLANAllowed == ""Yes"" && vMENAPLANAllowLOV == ""ALLOW"")
						{
							CanInvoke = ""TRUE"";
						}
						else
						{
							CanInvoke = ""FALSE"";
						}
						return (CancelOperation);	   	
					}
					else
					{		   
						CanInvoke = ""TRUE"";
						return (CancelOperation);	   	
					}
				}
				else if(PlanType == ""VIVA"" && MENAAllowed == ""Yes"" && MENAAccType == ""Individual"" && vOpenAccessPlansFlag != ""ALLOW"")//[NAVIN:26May2020:OpenAccesssToMENAAgents])
				{
					CanInvoke = ""FALSE"";
					return (CancelOperation);	   	
				}
				else if(PlanType == ""VIVA"" && vDisableMthdStrng == ""DISABLE"") //[Indrasen:25102020: IOT Connected Cars SD]
				{	
					CanInvoke = ""FALSE"";
					return (CancelOperation);
				}
				else
				{
					CanInvoke = ""TRUE"";
					return (CancelOperation);	   	
				}
			}
			else
			{
				CanInvoke = ""FALSE"";
				return (CancelOperation);
			}
		}
		if(MethodName == ""ServiceMigrationSvc"")
		{
			CanInvoke = ""FALSE"";
			this.BusComp().ParentBusComp().ActivateField(""Type"");
			this.BusComp().ParentBusComp().ActivateField(""Account Status"");
			var StrAccntType = this.BusComp().ParentBusComp().GetFieldValue(""Type"");
			var sLOVAccntType = TheApplication().InvokeMethod(""LookupValue"",""STC_SVCMIG_CUST"",StrAccntType);
			var Status = this.BusComp().ParentBusComp().GetFieldValue(""Account Status""); 
			var sLOVAccntTypeSubStr = sLOVAccntType.substring(0,5);
			if(sLOVAccntTypeSubStr == ""Allow"" && Status == ""Active"")
			{
				this.BusComp().ActivateField(""STC Root Product Part Num"");
				var sMigRootPartNum = this.BusComp().GetFieldValue(""STC Root Product Part Num"");
				var SerMigPackCheck = TheApplication().InvokeMethod(""LookupValue"",""STC_MIG_PACK"", sMigRootPartNum);
				var serMigPackSubstr = SerMigPackCheck.substring(0,4);
				if(serMigPackSubstr == ""PACK"")
				{
					if(PlanType == ""MENA"" && MENAAccType == ""Individual"")
					{
						if(MENAAllowed != ""No"")
						{
							CanInvoke = ""TRUE"";
						}
						else
						{
							if(vALLPLANAllowed == ""Yes"" && vMENAPLANAllowLOV == ""ALLOW"")
							{
								CanInvoke = ""TRUE"";
							}
							else
							{
								CanInvoke = ""FALSE"";
							}
						}
					}
					else if(PlanType == ""VIVA"" && MENAAllowed == ""Yes"" && MENAAccType == ""Individual"" && vOpenAccessPlansFlag != ""ALLOW"")//[NAVIN:26May2020:OpenAccesssToMENAAgents])
					{
						CanInvoke = ""FALSE"";
						return (CancelOperation);	   	
					}
					else if(PlanType == ""VIVA"" && vDisableMthdStrng == ""DISABLE"") //[Indrasen:25102020: IOT Connected Cars SD]
					{	
						CanInvoke = ""FALSE"";
						return (CancelOperation);
					}
					else 
					{ 
						CanInvoke = ""TRUE"";
					}
				}
				else
				{
					CanInvoke = ""FALSE"";
				}
			}
			else
			{
				CanInvoke = ""FALSE"";
			}
			return (CancelOperation);
		}
	}//try
	catch(e)
	{
	//throw(e);
	}
	finally
	{
		sAssetBC = null;
		ParentBC = null;
	}
	return (ContinueOperation);
}
function WebApplet_PreInvokeMethod (MethodName)
{
var appObj = TheApplication();
var Input, Output, isRecord, sAllowSR=""Y"", SRStatus, SRType,SRHandling;
var sMsisdn, sBillingId, svcOutPayment, sOutstanding, sAssetId, sServiceId, sAllowSR;
var boRMSNumberEnquiry=null, bcRMSNumberEnquiry=null;
var bRecordExists, bMSISDN, JawwyFlg =""N""; 
try
{
	if(MethodName == ""MigrationProdSvc"" || MethodName == ""ModifyProdSvc"" || MethodName == ""ServiceMigrationSvc"")
	{//WriteOff
		CheckWriteOff(MethodName);
	}
	if(MethodName == ""ResumeProdSvc"")
	{
		var StrSerId = this.BusComp().GetFieldValue(""Service Account Id"");
		var StrAssetBC = appObj.GetBusObject(""STC Asset Mgmt - Asset Thin BO"").GetBusComp(""STC Asset Mgmt - Asset Thin"");
		var RETPLANPART = appObj.InvokeMethod(""LookupValue"",""STC_TERMINATION_ADMIN"",""RETENTIONPLANPART""); 
		with(StrAssetBC)
		{
			var Exp = ""[Service Account Id] = '"" + StrSerId + ""' AND [Part] LIKE '"" + RETPLANPART + ""*' AND [Status] = 'Suspended'"";
			ActivateField(""Part"")
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchExpr(Exp);
			ExecuteQuery(ForwardOnly);
			var AssetRec = FirstRecord();
			if(AssetRec)
			{
				var PlanPart = GetFieldValue(""Part"");
				if(PlanPart == RETPLANPART)
				{
					var CurrRETLogin = appObj.LoginName();
					var foundRETCSR = appObj.InvokeMethod(""LookupValue"",""STC_RESUME_CSR"",CurrRETLogin); 
					var foundRETCSRSubstr = foundRETCSR.substring(0,6);
					if(foundRETCSRSubstr != ""RESRET"")
					{
						appObj.RaiseErrorText(""You are not allowed to resume this Order. Please contact Administrator"");
					}
				}
			}
		}
	}

	if(MethodName == ""ResumeProdSvc"" || MethodName == ""SuspendProdSvc"" || MethodName == ""TempSuspendSvc"" || MethodName == ""MigrationProdSvc"" || MethodName == ""ModifyProdSvc"" || MethodName == ""ServiceMigrationSvc"")
	{	boRMSNumberEnquiry = TheApplication().GetBusObject(""RMS NM Number Enquiry"");
		bcRMSNumberEnquiry = boRMSNumberEnquiry.GetBusComp(""RMS NM Number Enquiry"");
		this.BusComp().ActivateField(""Serial Number"");
		bMSISDN = this.BusComp().GetFieldValue(""Serial Number"");
		if(bMSISDN != """" && bMSISDN != null && bMSISDN != '')
		{ 
			with (bcRMSNumberEnquiry)
			{				
				ActivateField(""Special Category Type"");
				ActivateField(""Type"");
				ActivateField(""Number String"");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchSpec(""Special Category Type"", ""Bulk Message"");               
				SetSearchSpec(""Number String"", bMSISDN);
				SetSearchSpec(""Type"", ""MSISDN"");
				ExecuteQuery(ForwardOnly);   
				bRecordExists = FirstRecord();
				if (bRecordExists)
				{
					appObj.RaiseErrorText(""For virtual MSISDN this is not allowed."");
				}
			}
		}
	}

	switch(MethodName)
	{
 		case ""ModifyProdSvc"":
 		case ""SuspendProdSvc"":
 		case ""ResumeProdSvc"":
 		case ""TempSuspendSvc"":
 		case ""MigrationProdSvc"":
 		case ""ServiceMigrationSvc"":
 		case ""DisconnectProdSvc"":
 		{ 		 		 	
 			ServAccId = this.BusComp().GetFieldValue(""Service Account Id"");
			var sServiceBO = TheApplication().GetBusObject(""Service Request"");
			var sServiceBC = sServiceBO.GetBusComp(""Service Request"");
		    var AppPropSet = TheApplication().NewPropertySet();
			with(sServiceBC)
			{	ActivateField(""Account Id"");
			    ActivateField(""Status"");
			    ActivateField(""INS Sub-Area"");
				ActivateField(""INS SR Type"");//[RUTUJA:9Sept2020:Mobile Boadband Plans]
		    	ClearToQuery();
				SetViewMode(AllView);
				SetSearchSpec(""Account Id"", ServAccId);
				ExecuteQuery(ForwardOnly);
	
		        var sClosed = TheApplication().InvokeMethod(""LookupValue"", ""SR_STATUS"", ""Closed""); 
				if(FirstRecord())
				{
					isRecord = FirstRecord();
				    while(isRecord)
				    {	
						SRStatus = GetFieldValue(""Status"");
						SRType = GetFieldValue(""INS Sub-Area"");
						SRHandling = GetFieldValue(""INS SR Type"");
						if(SRStatus != sClosed && (SRType == ""Change MSISDN"" || SRType == ""Change SIM Card"" || SRType == ""Change SIM Card Request"" || (SRType == ""Network Identifier Change"" && SRHandling != ""Auto"")))//[RUTUJA:9Sept2020:Mobile Boadband Plans]
							sAllowSR=""N"";
						isRecord = NextRecord();
					}
				}
			}
			if(sAllowSR == ""N"")
			{
				TheApplication().RaiseErrorText(""There is currently an Open SR to change the MSISDN or SIM card or Network Identifier Change. Can't proceed with this request."");
			}	
		}
		if(MethodName == ""ModifyProdSvc"")
		{//Mayank: Added for TRA Suspesion
			ServAccId = this.BusComp().GetFieldValue(""Service Account Id"");
			var sSANBOV = TheApplication().GetBusObject(""STC Service Account"");
			var sSANBCV = sSANBOV.GetBusComp(""CUT Service Sub Accounts"");	
			with(sSANBCV)
			{
				ActivateField(""STC Service Profile Type"");
	      		ActivateField(""STC VOBB LINK MSISDN"");
				ActivateField(""STC TRA Suspension Flag"");
				ActivateField(""STC Service Profile Sub Type"");
	      		ClearToQuery();
	      		SetViewMode(AllView);
	      		SetSearchExpr(""[Id] = '"" + ServAccId + ""'""); 
	      		ExecuteQuery(ForwardOnly);
  	      		if(FirstRecord())
				{
					var sSANProfType = GetFieldValue(""STC Service Profile Type"");
					var sBBMSISDN = GetFieldValue(""STC VOBB LINK MSISDN"");
					var sSuspensionReason = GetFieldValue(""STC TRA Suspension Flag"");
					var sProfSubType = GetFieldValue(""STC Service Profile Sub Type"");
				}
			}
			if(sProfSubType == ""DATACOMTIER"")
			{
				TheApplication().RaiseErrorText(""Please note that this is a datacom Tier Provisioning subscription and cannot be Modified."");
			}
			if(sSANProfType == ""VOIP"")
			{
				if(sBBMSISDN != null && sBBMSISDN != """")
				{
					var sSANBO = TheApplication().GetBusObject(""STC Service Account"");
	   				var sSANBC = sSANBO.GetBusComp(""CUT Service Sub Accounts"");	
					with(sSANBC)
					{
						ActivateField(""DUNS Number"");
			      		ActivateField(""Account Status"");
						ActivateField(""STC TRA Suspension Flag"");
			      		ClearToQuery();
			      		SetViewMode(AllView);
			      		SetSearchExpr(""[DUNS Number] = '"" + sBBMSISDN + ""' AND [Account Status] <> 'New' AND [Account Status] <> 'Terminated' AND [STC TRA Suspension Flag] = 'Suspended by TRA'""); 
			      		ExecuteQuery(ForwardOnly);
	      	      		if(FirstRecord())
						{
							TheApplication().RaiseErrorText(""Modify Order for VOBB not allowed, as the Parent BB number is Suspended by TRA."");
						}
					}
				}
			}
		}
		if(MethodName == ""DisconnectProdSvc"")
		{
		    var PlanDis = """", sEPlanOut = """", sPlanOutSkip = """", SkipCSR = """", SkipCSRSubstr = """";//MANUJ
			this.BusComp().ParentBusComp().ActivateField(""STC Profile Type"");//[CP][13-08-2012][Datacom SIT Issue_40]
			var strProfile = this.BusComp().ParentBusComp().GetFieldValue(""STC Profile Type"");//[CP][13-08-2012][Datacom SIT Issue_40]
			with(this.BusComp()){
				sServiceId = GetFieldValue(""Service Account Id"");
				sBillingId = GetFieldValue(""Billing Account Id"");
				sAssetId = GetFieldValue(""Id"");
			}
       		var sSubBO = TheApplication().GetBusObject(""STC Service Account"");
	   		var sServiceAssetBC = sSubBO.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
	    	with(sServiceAssetBC)
	    	{
	      		ActivateField(""Service Account Id"");
	      		ActivateField(""Product Part Number"");
	      		ClearToQuery();
	      		SetViewMode(AllView);
	      		SetSearchExpr(""[Service Account Id] = '"" + sServiceId + ""' AND [Product Part Number] = 'PLANCLUBBB'""); 
	      		ExecuteQuery(ForwardOnly);
	      		if(FirstRecord())
	      		{
	     			var sBillingBO = TheApplication().GetBusObject(""STC Billing Account"");
	    			var sAssetBC = sBillingBO.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
	 	   			with (sAssetBC)
	       			{
	       				ActivateField(""Billing Account Id"");
					   	ActivateField(""Product Part Number"");
					   	ActivateField(""Status"");
				        ClearToQuery();
				        SetViewMode(AllView);
				        SetSearchExpr(""[Billing Account Id] = '"" + sBillingId + ""' AND [Product Part Number] = 'PLANCLUB' AND [Status] = 'Active'"");
				        ExecuteQuery(ForwardOnly);
						if(FirstRecord())
						{
							TheApplication().RaiseErrorText(""Please disconnect VIVA Voice Plan First"");
						}
	        		}//end with
	    		}
				//[MANUJ] : [Avaya]/[SIP]
				ClearToQuery();
				SetViewMode(AllView);
				ActivateField(""Product Part Number"");
				SetSearchExpr(""[Service Account Id] = '"" + sServiceId + ""' AND [STC Plan Type] = 'Service Plan'""); //check under SAN
				ExecuteQuery(ForwardOnly);
				if(FirstRecord())
				{
					var sEPlanPartNum = GetFieldValue(""Product Part Number"");
					var sEPlanSuspend = TheApplication().InvokeMethod(""LookupValue"", ""STC_PLAN_DISC_VAL"", sEPlanPartNum);
					var CurrLogin = appObj.LoginName();
					//[SIP]
					SkipCSR = appObj.InvokeMethod(""LookupValue"",""STC_SKIP_OUT_CSR"",CurrLogin); 
					sEPlanOut = TheApplication().InvokeMethod(""LookupValue"", ""STC_SIP_PLAN_OUT"", sEPlanPartNum);
					sPlanOutSkip = sEPlanOut.substring(0,5);
					SkipCSRSubstr = SkipCSR.substring(0,3);
					
					var sEPlanSuspendAllow = sEPlanSuspend.substring(0,5);
					if(sEPlanSuspendAllow == ""Allow"")
					{
						TheApplication().RaiseErrorText(""Sorry! Disconnect Order is not allowed for this plan."");
					}
				}//[MANUJ] : [Avaya]
	     	}//end with	
	     	
		   GetAdvanceCreditDue(MethodName);//[NAVIN: 16Oct2017: AdvanceCreditPayments]
		   
		   this.BusComp().ParentBusComp().GetFieldValue(""STC Port Out Flag"");
		   var PortOut = this.BusComp().ParentBusComp().GetFieldValue(""STC Port Out Flag"");
		   //[NAVIN:18Dec2018:POSReceiptTermination]
			var AllowTermFlow = appObj.InvokeMethod(""LookupValue"", ""STC_POS_ADMIN"", ""CALL_TERM_FRAMEWORK"");
			var currLoginId = appObj.LoginName();
			var UserAccess = appObj.InvokeMethod(""LookupValue"", ""STC_POS_ADMIN_USER"", currLoginId);
			UserAccess = UserAccess.substring(0,4);
			if(PortOut == ""Y"")
			{	var CurrLogin = appObj.LoginName();
				var foundCSR = appObj.InvokeMethod(""LookupValue"",""STC_MNP_CSR"",currLoginId); 
				var foundCSRSubstr = foundCSR.substring(0,3);
				if(foundCSRSubstr != ""CSR"")
				{
					TheApplication().RaiseErrorText(""Sorry!!! MNP Port Out Orders can be raised by special CSRs only"");
				}
			}
			else
			{	//if(strProfile != ""Datacom"" && !(SkipCSRSubstr == ""CSR"" && sPlanOutSkip == ""Allow""))
				if(!(SkipCSRSubstr == ""CSR"" && sPlanOutSkip == ""Allow""))
				{
					if (AllowTermFlow == ""BLOCK"" && (UserAccess == """" || UserAccess == null || UserAccess != ""POST""))
					{//[NAVIN:18Dec2018:POSReceiptTermination]
						OutstandingBalance();
					}
				}
			}
			SIPConnectivity(sServiceId);//[MANUJ] : [MENA] : [SIP 4G Connectivity]
			GetDeviceCreditContractTermination(); //Jithin: High End Plan
		} 
		 if(MethodName == ""SuspendProdSvc"" || MethodName == ""TempSuspendSvc"" || MethodName == ""MigrationProdSvc"" || MethodName == ""ServiceMigrationSvc"")
		{//MANUJ Added for SIP Validation
		    this.BusComp().ParentBusComp().ActivateField(""STC Profile Type"");
		    var strProfile = this.BusComp().ParentBusComp().GetFieldValue(""STC Profile Type"");
		    sServiceId = this.BusComp().GetFieldValue(""Service Account Id"");
       		sAssetId = this.BusComp().GetFieldValue(""Id"");
       		var sSubBO = TheApplication().GetBusObject(""STC Service Account"");
	   		var sServiceAssetBC = sSubBO.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");       	
	    	with(sServiceAssetBC)
	    	{
	      		ActivateField(""Service Account Id"");
	      		ActivateField(""Product Part Number"");
	      		ClearToQuery();
	      		SetViewMode(AllView);
	      		SetSearchExpr(""[Service Account Id] = '"" + sServiceId + ""' AND [Product Part Number] LIKE 'VIVAIPTRUNK*'"");
	      		ExecuteQuery(ForwardOnly);	      
	      		if(FirstRecord())
	      		{
					TheApplication().RaiseErrorText(""The request cannot be completed when IP plans are active."");
	    		}
	    		if(MethodName == ""SuspendProdSvc"")
	    		{
	    			ClearToQuery();
	      			SetViewMode(AllView);
	      			SetSearchExpr(""[Service Account Id] = '"" + sServiceId + ""' AND [Product Part Number] LIKE 'DATACENTERPACK*'"");
	      			ExecuteQuery(ForwardOnly);	
	      			if(FirstRecord())
	      			{
	     				TheApplication().RaiseErrorText(""Suspend is not allowed for DataCenter Package."");
	    			}
	    			ClearToQuery();
	      			SetViewMode(AllView);
	      			ActivateField(""Product Part Number"");
	      			SetSearchExpr(""[Service Account Id] = '"" + sServiceId + ""' AND [STC Plan Type] = 'Service Plan'"");
	      			ExecuteQuery(ForwardOnly);
	      			if(FirstRecord())
	      			{
	      				var sEPlanPartNum = GetFieldValue(""Product Part Number"");
	      				var sEPlanSuspend = TheApplication().InvokeMethod(""LookupValue"", ""STC_PLAN_SUSP_VAL"", sEPlanPartNum);
	      				var sEPlanSuspendAllow = sEPlanSuspend.substring(0,5);
	      				if(sEPlanSuspendAllow == ""Allow"")
	      				{
	      					TheApplication().RaiseErrorText(""Sorry! Suspend Order is not allowed for this plan."");
	      				}
	      			}
					JawwyFlg = CheckJawwy(sServiceId);
					if(JawwyFlg ==""Y""){
						TheApplication().RaiseErrorText(""Suspend is not allowed for Jawwy Addon Package."");
					}  
	    		}
	     	}//end with
		} 
		if(MethodName == ""MigrationProdSvc"")
		{
			NationalityCheck(MethodName);
			appObj = TheApplication();	
			this.BusComp().ParentBusComp().ActivateField(""STC Migration Type"");
			var MigType = this.BusComp().ParentBusComp().GetFieldValue(""STC Migration Type"");
			var PostToPostMigrationType = appObj.InvokeMethod(""LookupValue"",""STC_EXC_AON_MIGRATION"",MigType);
			var MigTypeAllowed = appObj.InvokeMethod(""LookupValue"",""STC_MIG_VAL_ALL"",MigType);	
			var FoundMigType = MigTypeAllowed.substring(0,3);
			var ChkChaType = appObj.InvokeMethod(""LookupValue"",""STC_MIG_TOO_TERMI"",MigType);
			var ChkTOOTYPE = ChkChaType.substring(0,7);
			//[NAVIN:18Dec2018:POSReceiptTermination]
			var AllowTermFlow = appObj.InvokeMethod(""LookupValue"", ""STC_POS_ADMIN"", ""CALL_TERM_FRAMEWORK"");
			var currLoginId = appObj.LoginName();
			var UserAccess = appObj.InvokeMethod(""LookupValue"", ""STC_POS_ADMIN_USER"", currLoginId);
			UserAccess = UserAccess.substring(0,4);
			if(FoundMigType == ""MIG"")
			{	var MigLov = appObj.InvokeMethod(""LookupValue"",""STC_VALIDATION"",""MigrationOrders"");	
				var ValidationReqd = appObj.InvokeMethod(""LookupValue"",""STC_VALIDATION"",""MigrationOrders"");	
				if(ValidationReqd == ""YesMig"")
				{
					var FoundCSR = appObj.InvokeMethod(""LookupValue"",""STC_MIG_VALID_CSR"",currLoginId);
					var foundCSRSubstr = FoundCSR.substring(0,3);
					if(foundCSRSubstr != ""CSR"")
					{
						appObj.RaiseErrorText(""Sorry! Migration Orders Can be raised by Special CSRs Only."");
					}
					else
					{
						CheckBroadBforPrepaid();
						if (sMessage != """")
						{ appObj.RaiseErrorText(sMessage); }
						if (AllowTermFlow == ""BLOCK"" && (UserAccess == """" || UserAccess == null || UserAccess != ""POST""))
						{//[NAVIN:18Dec2018:POSReceiptTermination]
							if(ChkTOOTYPE == ""MIGTERM""){
								GetTerminationCharges();
							}
							else{
								OutstandingBalance();
							}
						}
						GetAdvanceCreditDue(MethodName);//[NAVIN: 16Oct2017: AdvanceCreditPayments]
						CreateAndAutoPopulate();
					}	
				}// end of if(ValidationReqd)
			}// end of MIG
			else 
			{		
				CheckBroadBforPrepaid();
				if (sMessage != """")
				{
					appObj.RaiseErrorText(sMessage);
				}
				if (AllowTermFlow == ""BLOCK"" && (UserAccess == """" || UserAccess == null || UserAccess != ""POST""))
				{//[NAVIN:18Dec2018:POSReceiptTermination]
					if(ChkTOOTYPE == ""MIGTERM""){					
						GetTerminationCharges();	
					}
					else{
						OutstandingBalance();					
					}
				}
				var currLoginId = appObj.LoginName();
				var FoundSUP = appObj.InvokeMethod(""LookupValue"",""STC_MINOR_MIG_SUP_USER"",currLoginId);
				var foundSUPSubstr = FoundSUP.substring(0,3);					
				var MinorMigType = appObj.InvokeMethod(""LookupValue"",""STC_MINOR_MIGRATION_TYPE"",MigType);
				MinorMigType = MinorMigType.substring(0,5);
				if(MinorMigType == ""MINOR"" && foundSUPSubstr != ""SUP"")
				{
					this.BusComp().ParentBusComp().ActivateField(""STC Master Account Id"");//[MANUJ]:[Guardian SD]
					var TargetCustId = this.BusComp().ParentBusComp().GetFieldValue(""STC Master Account Id"");//[MANUJ]:[Guardian SD]
					MinorMigration(TargetCustId);
				}
				CreateAndAutoPopulate();
  			}//end of else
		}
		if(MethodName == ""ServiceMigrationSvc"")
		{	NationalityCheck(MethodName);
			var sServiceFlag = ""N"";
			sServiceFlag = fnServiceMigrationSvc();
			if(sServiceFlag == ""Y"")
			{return(CancelOperation);}
		}
		break; 
	}//end switch
	return (ContinueOperation);
}
catch(e)
{ throw(e); }
finally
{	sServiceBC = null;
	sServiceBO = null;	
	svcOutPayment = null;
	appObj = null;
}
}
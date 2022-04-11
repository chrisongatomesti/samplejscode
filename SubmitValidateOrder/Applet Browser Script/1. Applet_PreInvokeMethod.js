/*  
---------------+------+--------+----------------------------------------------  
Date(YYYYMMDD) | Ver  | By     | Description   
---------------+------+--------+----------------------------------------------  
26120712       |   1.0|   CP        Creation  
---------------+------+--------+----------------------------------------------
20130103       |   2.0|S Poria |    update  
---------------+------+--------+----------------------------------------------    
*/ 

function Applet_PreInvokeMethod (name, inputPropSet)
{
	var thisReturn = "ContinueOperation";
	switch(name)
	{
		case "CaptureSignature":
		try
		{
			var sOrdNum,sOrdReason,sURL,sURL1;
			sOrdNum = this.BusComp().GetFieldValue("Id");
			sOrdReason = "ActivationOrder";
			var psIn = theApplication().NewPropertySet();
			var psOut = theApplication().NewPropertySet();
			psIn.SetProperty("Type","VIVA_SIGN_URL");
			psIn.SetProperty("LIC","URL");
			var sService = theApplication().GetService("BS LOV Services");
			psOut = sService.InvokeMethod("GetLOVDescription", psIn);
			sURL = psOut.GetProperty("Description");
			sURL1 = sURL + "?" + "OrderId=" + sOrdNum + "&OrderReason=" + sOrdReason;
			window.open(sURL1);
		}
		catch(e)
		{
			alert("CatchBlock:"+e);
		}
		finally
		{
			sService=null;
			psIn=null;
			psOut=null;
		}
		return("CancelOperation");
		break;
			////Hardik:Mobility 
		case "MobCaptureSignature":
		try
		{
			var sOrdNum,sOrdReason,sURL,sURL1;
			sOrdNum = this.BusComp().GetFieldValue("Id");
			sOrdReason = "ActivationOrder";
			var psIn = theApplication().NewPropertySet();
			var psOut = theApplication().NewPropertySet();
			psIn.SetProperty("Type","VIVA_SIGN_URL");
			psIn.SetProperty("LIC","MobileURL");
			var sService = theApplication().GetService("BS LOV Services");
			psOut = sService.InvokeMethod("GetLOVDescription", psIn);
			sURL = psOut.GetProperty("Description");
			sURL1 = sURL + "?" + "OrderId=" + sOrdNum + "&OrderReason=" + sOrdReason;
			window.open(sURL1);
			//alert(sURL1);
		}
		catch(e)
		{
			alert("CatchBlock:"+e);
		}
		finally
		{
			sService=null;
			psIn=null;
			psOut=null;
		}
		return("CancelOperation");
		break;
		///End Mobility

	/*	case "SendtoPOS": ////MARK Commented PBI000000005055  for Problem Ticket Fins invoke is not working 
			try
			{
				var oBS1, inpPS1, outPS1,oBS2, inpPS2, outPS2;;
				var vErrCode1="", vErrMsg1="";
				var OrderId1 = this.BusComp().GetFieldValue("Id");
				inpPS1 = theApplication().NewPropertySet();
				outPS1 = theApplication().NewPropertySet();
				oBS1 = theApplication().GetService("Workflow Process Manager");
				inpPS2 = theApplication().NewPropertySet();
				outPS2 = theApplication().NewPropertySet();
				oBS2 = theApplication().GetService("FINS Teller UI Navigation");
				with (inpPS1)
				{
					SetProperty("ProcessName", "STC Mena Create Validate Activity Process");
					SetProperty("Object Id", OrderId1);
				}
				outPS1 = oBS1.InvokeMethod("RunProcess", inpPS1,outPS1);
				with(outPS1)
				{
					vErrCode1 = GetProperty("Error Code");
					vErrMsg1 = GetProperty("FinalAddress");
				}
				if(vErrMsg1 != "" && vErrMsg1 != null)
				{
					var sFlag1 = confirm(vErrMsg1);
					if (sFlag1 == false)
					{
						inpPS2.SetProperty("BusObj", "Order Entry (Sales)");
						inpPS2.SetProperty("ViewName", "STC Order Entry - Order Activity List View");
						outPS2 = oBS2.InvokeMethod("GotoView", inpPS2,outPS2);
						return ("CancelOperation");
					}
					else
					return ("ContinueOperation");
				}
			}
			catch(e)
			{
			
			}
			finally
			{
				psIn1=null;
				psOut1=null;
				oBS1=null;
				psIn2=null;
				psOut2=null;
				oBS2=null;
			}
			return("ContinueOperation");
			break; //PBI000000005055 
			
		*/	//Mayank: Added for RDS---------- START-----------------
			case "SubmitOrderSTC":
			case "SendtoPOS":
			try
			{
				var oBS, inpPS, outPS;
				var vErrCode="", vErrMsg="", EmailId = "";
				var OrderId = this.BusComp().GetFieldValue("Id");
				inpPS = theApplication().NewPropertySet();
				outPS = theApplication().NewPropertySet();
				oBS = theApplication().GetService("Workflow Process Manager");
				with (inpPS)
				{
					SetProperty("ProcessName", "STCRetailDigitalSignatureSubmitValidationWF");
					SetProperty("Object Id", OrderId);
				}
				outPS = oBS.InvokeMethod("RunProcess", inpPS,outPS);
				with(outPS)
				{
					vErrCode = GetProperty("Error Code");
					vErrMsg = GetProperty("Error Message");
					EmailId = GetProperty("EmailId");
				}
				if(vErrMsg != "SUCCESS")
				{
					var sFlag = confirm(vErrMsg);
					if (sFlag == false)
					return ("CancelOperation");
					else
					return ("ContinueOperation");
				}
			}
			catch(e)
			{
			
			}
			finally
			{
				psIn=null;
				psOut=null;
				oBS=null;
			}
			return("ContinueOperation");
			break;
			//Mayank: Added for RDS---------- STOP-----------------
		case "ValidateOrder":
			try
			{
				var objAppln, Inputs, Outputs, svcService, strRetCode; 
				var numCountRec, strErrorCd, strPenaltyProd;
				var strOrderId 		= this.BusComp().GetFieldValue("Id");
				var strOrderType 	= this.BusComp().GetFieldValue("STC Order SubType");
				var strProfileType 	= this.BusComp().GetFieldValue("STC Billing Profile Type");
				var strServiceMig 	= this.BusComp().GetFieldValue("STC Migration Sub Type");
				var SuspensionReason = this.BusComp().GetFieldValue("Delivery Block");
				var PrimaryFlag = this.BusComp().GetFieldValue("STC Primary SAN Flag");
				var SharedFlag = this.BusComp().GetFieldValue("STC Shared Flag");
				//Added the below code for the Autoplan Migration SD
				var sobjAppln = "";
				var sInps = "";
				var sOutps = "";
				var sWFSrvc = "";
				var sFlag= "";
				var PlanName= "";
				var MainContractName= "";
				var AddOnContractName = "";
				var MainDevice= "";
				var AddOnDevice = "";
				var sPopMssg = "";
				var sInps1 = "",sOutps1 = "",sWFSrvc1 = "",sOSNBasePackDelete = "N",sobjApplnOSN = theApplication();//Mayank: Added for OSN

				if(strOrderType == "Modify" && SharedFlag == "Y" && PrimaryFlag == "Y")
				{
					
					var oBS, inpPS, outPS;
					var vErrCode="", vErrMsg="";
					inpPS = theApplication().NewPropertySet();
					outPS = theApplication().NewPropertySet();
					oBS = theApplication().GetService("Workflow Process Manager");
					with (inpPS)
					{
					SetProperty("ProcessName", "STC Check Shared BB MRC Plan Validation WF");
					SetProperty("Object Id", strOrderId);
					}
					outPS = oBS.InvokeMethod("RunProcess", inpPS,outPS);
					with(outPS)
					{
						vErrCode = GetProperty("ErrorFlag");
						vErrMsg = GetProperty("ErrorMsg");
					}
					if(vErrCode != "N")
					{
						var sFlag = confirm(vErrMsg);
						if (sFlag == false)
							return ("CancelOperation");
						else
							return ("ContinueOperation");
					}
				}

				if(strOrderType == "Modify" || strOrderType == "Provide" || strServiceMig == "Service Migration")
				{			
					sobjAppln = theApplication();	
					sInps = sobjAppln.NewPropertySet();
					sOutps = sobjAppln.NewPropertySet();
					sWFSrvc = sobjAppln.GetService("STC Auto Plan Migration Service");			
					sInps.SetProperty("OrderId",strOrderId);			
					sOutps = sWFSrvc.InvokeMethod("Validate",sInps);			
					sPopMssg = sOutps.GetProperty("PopupMessage");
					var OSNBasePackDelete = sOutps.GetProperty("OSNBasePackDelete");	
					sFlag = confirm(sPopMssg);
					if(sFlag == false)
					return ("CancelOperation");
					else 
					{
						if(OSNBasePackDelete == "Y" && strOrderType == "Modify")
						{
							alert("Customer might loose VAT Waiver benefit due to plan changes. Please check VAT Waiver eligible plans");
						}		
					}
				}


				
				if(strOrderType == "Modify")
				{//Mayank: Added for Mena
		
				
					//sOrdId = this.BusComp().GetFieldValue("Id");
					var OrderBO = theApplication().ActiveBusObject("Order Entry (Sales)");
					var OrdLineBC = OrderBO.GetBusComp("Order Entry - Line Items (Simple)");
					with (OrdLineBC)
					{
					ClearToQuery();
					SetViewMode(AllView);
					ActivateField("Part Number");
					ActivateField("Action Code");
					SetSearchExpr("[Order Header Id] = '"+strOrderId+"' AND [Part Number] LIKE  'CSCFSADDON*' AND [Action Code] = 'Delete'");
					ExecuteQuery(ForwardOnly);
					if (FirstRecord())
						alert("Please note that all service and feature add-ons will be deleted with this order. Kindly make sure to purchase required add-ons.");
					}
				
				
					sobjAppln = theApplication();	
					sInps = sobjAppln.NewPropertySet();
					sOutps = sobjAppln.NewPropertySet();
					sWFSrvc = sobjAppln.GetService("STC Auto Plan Migration Service");			
					sInps.SetProperty("OrderId",strOrderId);			
					sOutps = sWFSrvc.InvokeMethod("BusinessBB",sInps);			
					var BusinessBBPlanChange = sOutps.GetProperty("BusinessBBPlanChange");
					if(BusinessBBPlanChange == "Y")
					{
						alert("Please check for 'Free email', 'Free Website Hosting', 'Domain Name', 'Bulk SMS' and take necessary action as per plan eligibility.");
					}	
					//Hardik Started Added for Try and Buy
						var OrderRec=0;
						sOutps = sWFSrvc.InvokeMethod("ContactDetail",sInps);			
						var vPopMssg = sOutps.GetProperty("PopupContact");	
						OrderRec =sOutps.GetProperty("OrderRec");
						if(OrderRec>0)
						{
							var vFlag = confirm(vPopMssg);
							if(vFlag == false)
							{
								return ("CancelOperation");
							}
							else
							{
								return ("ContinueOperation");
							}
						}		
				}
				if(SuspensionReason == "SIM Lost" && strOrderType == "Suspend")
				{
					alert("The line will be terminated within 30 days if the customer does not call 124 to resume the line or approaches the retail outlet for SIM Replacement. Please make sure the alternate number and email are updated so that the customer can receive the necessary notifications");	
				}
				if((SuspensionReason == "Service not available" || SuspensionReason == "Complaint" || SuspensionReason == "Temporary Suspension" || SuspensionReason == "Customer Dis-satisfaction") && strOrderType == "Suspend")
				{
					alert("The line may be terminated after 3 months if the customer does not call 124 or approach a retail outlet to resume the line before the suspension end date.Please make sure the alternate number is updated so that a retention agent can reach the customer after 3 months");	
				}
		
				if( strOrderType == "Modify" && strProfileType == "Datacom" )
				{
					objAppln = theApplication();
					Inputs = objAppln.NewPropertySet();
					Outputs = objAppln.NewPropertySet();
					svcService = objAppln.GetService("STC Contract Date Calc");
					Inputs.SetProperty("Order Id", strOrderId);
					Outputs = svcService.InvokeMethod("CheckDatacomPenaltyProd", Inputs);
					strRetCode = Outputs.GetProperty("ReturnCode");
					if( strRetCode == "N" )
					{
						alert("You have not selected Datacom Terminated Product.");
					}
				}
				if(strOrderType == "Provide")
				{
					//Hardik : Added for Jawwy TV
					this.BusComp().WriteRecord();
					var vBS ="", vinpPS ="", voutPS ="",JawwyFlg="N";
					var sErrCode="", sErrMsg="";
					var vChannel = "";
					vinpPS = theApplication().NewPropertySet();
					voutPS = theApplication().NewPropertySet();
					vBS = theApplication().GetService("Workflow Process Manager");
					with (vinpPS)
					{
						SetProperty("ProcessName", "STC Jawwy Order Validation Process WF");
						SetProperty("Object Id", strOrderId);
						SetProperty("Operation", "ValidateJawwyTV");
					}
						voutPS = vBS.InvokeMethod("RunProcess", vinpPS,voutPS);
					with(voutPS)
					{
						sErrCode = GetProperty("Error Code");
						sErrMsg = GetProperty("Error Message");
						JawwyFlg = GetProperty("JawwyFlg");
					}

					if(sErrCode == "0" && sErrMsg == "SUCCESS" && JawwyFlg == "Y" )
					{
						//theApplication().RaiseErrorText(vErrMsg);
						var sMessage = " Press 'Ok' to continue with Add Jawwy TV or press 'Cancel' to Remove!";
						var sFlag = confirm(sMessage);
						if (sFlag == false)
						{	
							var sinpPS ="";
							var soutPS ="";
							sinpPS = theApplication().NewPropertySet();
							soutPS = theApplication().NewPropertySet();
							var sBS = theApplication().GetService("Workflow Process Manager");
							with (sinpPS)
							{
								SetProperty("ProcessName", "STC Jawwy Order Validation Process WF");
								SetProperty("Object Id", strOrderId);
								SetProperty("Operation", "DeleteJawwyTv");
							}
							soutPS = sBS.InvokeMethod("RunProcess", sinpPS,soutPS);	
							//return ("CancelOperation");
						}
						else
						{
							//return ("ContinueOperation");
						}
					}
				  	///End Jawwy TV Code 

					//[NAVIN: 19Oct2017: AdvanceCreditPayments]
					var oBS, inpPS, outPS;
					var vErrCode="", vErrMsg="", vAirtimeDue="";
					var vFlag = "";
					var ActiveBO = null, SANBC = null;
					var sMsisdn = "", sServiceAccId = "";
					var ContinueFlag;//[MANUJ]: [HBB VP Revamp]
					var OrderNetworkType = this.BusComp().GetFieldValue("STC Network Identifier");
					var ActiveView = theApplication().ActiveViewName();
					inpPS = theApplication().NewPropertySet();
					outPS = theApplication().NewPropertySet();
					oBS = theApplication().GetService("Workflow Process Manager");

					//alert ("Output: "+strOrderId);
					with (inpPS)
					{
						SetProperty("ProcessName", "STC Advance Credit Order Process WF");
						SetProperty("Object Id", strOrderId);
						SetProperty("Operation", "ValidateBrowserScript");
					}
					outPS = oBS.InvokeMethod("RunProcess", inpPS,outPS);
					with(outPS)
					{
						vErrCode = GetProperty("Error Code");
						vErrMsg = GetProperty("Error Message");
						vAirtimeDue = GetProperty("AirtimeDue");
					}
					if(vErrCode != "" && vErrCode != "0")
					{
						//theApplication().RaiseErrorText(vErrMsg);
						var vMessage = vErrMsg +" Press 'Ok' to continue with Validate or press 'Cancel' to Stop!";
						var sFlag = confirm(vMessage);
						if (sFlag == false)
							return ("CancelOperation");
						else
						{
							ContinueFlag =  NetworkConfirmation(strOrderId,OrderNetworkType);//[MANUJ]: [HBB VP Revamp]
							if (ContinueFlag == "Y")
								return ("ContinueOperation");
							else
							{
							return ("CancelOperation");
						}
							}
					}
					else
					{//return ("ContinueOperation");
					ContinueFlag =  NetworkConfirmation(strOrderId,OrderNetworkType);//[MANUJ]: [HBB VP Revamp]
					      if (ContinueFlag == "Y")
							return ("ContinueOperation");
						  else
						  {
							return ("CancelOperation");
						  }
					}
				}//end of if(strOrderType == "Provide")
				if(strOrderType == "Modify")//Jithin: High end plan SD
				{
					var sBS, sInpPs, sOutPS;
					var  sExcessCharge="", sErrMsg="";
					sInpPs = theApplication().NewPropertySet();
					sOutPS = theApplication().NewPropertySet();
					sBS = theApplication().GetService("Workflow Process Manager");
					sInpPs.SetProperty("ProcessName", "STC Get Device Credit Contract Termination WF");
					sInpPs.SetProperty("Object Id", strOrderId);
					sInpPs.SetProperty("OrderId", strOrderId);					
					sOutPS = sBS.InvokeMethod("RunProcess", sInpPs,sOutPS);
					sExcessCharge = sOutPS.GetProperty("ExcessCharge");
					if(sExcessCharge > '0')
					{
						sErrMsg = "You have "+sExcessCharge+" credit available to utilise. Click cancel to use the credit else the credit will be loose"
						var sVal = confirm(sErrMsg);
						if (sVal == true)
							return ("ContinueOperation");
						else
						{
							return ("CancelOperation");
						}
					}
				}
					
			}
			catch(e)
			{
			}
			finally
			{
				objAppln=null;
				Inputs=null;
				Outputs=null;
				svcService=null;
				oBS=null; inpPS=null; outPS=null;
				sBS=null;
				sInpPs=null; 
				sOutPS=null;
			}
			thisReturn = "ContinueOperation";
			break;
			
		default:
			thisReturn = "ContinueOperation";
			break;
	}

	return (thisReturn);
}
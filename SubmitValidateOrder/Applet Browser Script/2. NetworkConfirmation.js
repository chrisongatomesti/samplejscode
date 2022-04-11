function NetworkConfirmation(strOrderId,OrderNetworkType)
{

					var oBS, inpPS, outPS;
					var vErrCode="", vErrMsg="", vAirtimeDue="";
					var vFlag = "";
					var ActiveBO = null, SANBC = null;
					var sMsisdn = "", sServiceAccId = "",PopUpMsg = "";
					var ActiveView = theApplication().ActiveViewName();
					inpPS = theApplication().NewPropertySet();
					outPS = theApplication().NewPropertySet();
					oBS = theApplication().GetService("Workflow Process Manager");
					with (inpPS)
					{
						SetProperty("ProcessName", "STCPlanNetworkPopUpWorkflow");
						SetProperty("Object Id", strOrderId);
						SetProperty("OrderNetworkType", OrderNetworkType);
					}
					outPS = oBS.InvokeMethod("RunProcess", inpPS,outPS);
					with(outPS)
					{
						vErrCode = GetProperty("Error Code");
						vErrMsg = GetProperty("Error Message");
						PopUpMsg = GetProperty("PopUpMsg");
					}
					if(PopUpMsg == "Y")
					{
						var vMessage = vErrMsg +" Press 'Ok' to continue with Validate or press 'Cancel' to Stop!";
						var sFlag = confirm(vMessage);
						if (sFlag == false)
							return ("N");
						else
							return ("Y");
					}
					else
					{
							return ("Y");
					}


}
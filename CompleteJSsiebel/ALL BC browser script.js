var num=0;
function BusComp_PreSetFieldValue (fieldName, value)
{
    if(fieldName==""TDN Nationality"" && value!=""India"")
    {
    	theApplication().SWEAlert(""Please provide 2 local references along with the form"");
    }
	return (""ContinueOperation"");
}
function BusComp_PreQuery ()
{
var SearchExpr;
SearchExpr = ""[Status] ='In Progress' OR [Priority] = 'High'"";
this.SetSearchExpr(SearchExpr);
   
this.ExecuteQuery();

	return (ContinueOperation);
}
function BusComp_PreQuery ()
{
var SearchExpr;
SearchExpr = ""[Status] ='In Progress' OR [Priority] = 'High'"";
this.SetSearchExpr(SearchExpr);
   
this.ExecuteQuery();

	return (ContinueOperation);
}
var num=0;
function BusComp_PreSetFieldValue (fieldName, value)
{
    if(fieldName==""TDN Nationality"" && value!=""India"")
    {
    	theApplication().SWEAlert(""Please provide 2 local references along with the form"");
    }
	return (""ContinueOperation"");
}
function BusComp_PreQuery ()
{
var SearchExpr;
SearchExpr = ""[Status] ='In Progress' OR [Priority] = 'High'"";
this.SetSearchExpr(SearchExpr);
   
this.ExecuteQuery();

	return (ContinueOperation);
}
function BusComp_PreQuery ()
{
var SearchExpr;
SearchExpr = ""[Status] ='In Progress' OR [Priority] = 'High'"";
this.SetSearchExpr(SearchExpr);
   
this.ExecuteQuery();

	return (ContinueOperation);
}
function BusComp_PreSetFieldValue (fieldName, value)
{
var appObj;

var NewValue;
var dCurrDate;
var sSysdate;
var sDateStr;
var sDiffTime;
var sErrMsg;
var type;

var sValue;
var SRId;
var Inputs;
var Outputs;
var svcService;

var sAlert;
var sConfirm;
var sFee;
var sCheckRefund;
var sRefund;

var sCallTier3;

var sFlag;

	try
	{
		switch(fieldName)
		{
			case ""STC Date Of Birth"":
				appObj = theApplication();
				
	            NewValue = value;
	            if (NewValue != """" && NewValue != null)
	            {
	
					dCurrDate = new Date();
					sSysdate = dCurrDate.getTime();

					NewValue = new Date(NewValue);
					sDateStr = NewValue.getTime();
					sDiffTime = sSysdate - sDateStr;
					
					if (sDiffTime < 16*365.25*24*60*60*1000)
					{ 
						alert(""Minimum age allowed for a customer is 16 years. Please check the Date of Birth."");
						return (""CancelOperation"");						
					}
				}
	         	break;
	         case ""STC New Credit Limit"":
         			appObj = theApplication();
         			
			         			this.WriteRecord();
			         			//>>>added by navin
			         			type = this.GetFieldValue(""INS Sub-Area"");
			         			//alert(type+"":1"");
			         			if(type == ""Change of Billing Details"")
			         			{
			         			//alert(type+"":2"");
			         			///<<<<navin ends
			         			sValue = value;
			         			SRId = this.GetFieldValue(""Id"");
			         			Inputs = appObj.NewPropertySet();
			         			Outputs = appObj.NewPropertySet();
			         			svcService = appObj.GetService(""STC Calculate Credit Limit"");
			         			Inputs.SetProperty(""CreditLimit"",sValue);
			         			Inputs.SetProperty(""SRId"",SRId);
			         			Outputs = svcService.InvokeMethod(""CreditLimit"",Inputs);
			         			sAlert = Outputs.GetProperty(""AlertMsg"");
			         			sConfirm = Outputs.GetProperty(""ConfirmMsg"");
			         			sFee = Outputs.GetProperty(""Fee"");
			         			sCheckRefund = Outputs.GetProperty(""Check Refund"");
			         			sRefund ="""";
			         			this.WriteRecord();
			         			if(sCheckRefund ==""Y"")
			         				sRefund =""Refund"";
			         			else
			         				sRefund =""Deposit"";
			         			if(sAlert !="""")
			         			{
			         				alert(sAlert);
			         				return (""CancelOperation"");
			         			}	
			         			if(sConfirm != """")
			         			{
			         				sFlag = confirm(sConfirm);
			         				if(sFlag == false)
			         				{
			         					return (""CancelOperation"");
			         				}
			         				else
			         				{
			         					this.SetFieldValue(""STC Fee"",sFee);
			         					this.SetFieldValue(""STC Deposit Flag"",sRefund);
			         				}
			         			
			         			}
			         			else
			           			{
			         				this.SetFieldValue(""STC Fee"",sFee);
			         				this.SetFieldValue(""STC Deposit Flag"",sRefund);
			         			}
			         		}//end if
			         		
			         	this.ActivateField(""INS Sub-Area"");	
			         	sCallTier3 = this.GetFieldValue(""INS Sub-Area"");
         			
         				if(sCallTier3 == ""Change of Billing Details"")
         				{
			         		this.WriteRecord();
			         		this.InvokeMethod(""RefreshBusComp"");
			         		this.InvokeMethod(""RefreshRecord"");
			         		this.ExecuteQuery();
			         	}	
			         		break;
			         	         			
				         default:
				         	break;
       	 }
      }
      catch(e)
	  {
	  }
      finally
      {
    		dCurrDate = null;
    		NewValue = null;
    		Inputs = null;
    		Outputs = null;
    		svcService = null;
    		appObj=null;
      }
	return (""ContinueOperation"");
}
function BusComp_PreSetFieldValue (fieldName, value)
{
var appObj;

var NewValue;
var dCurrDate;
var sSysdate;
var sDateStr;
var sDiffTime;
var sErrMsg;
var type;

var sValue;
var SRId;
var Inputs;
var Outputs;
var svcService;

var sAlert;
var sConfirm;
var sFee;
var sCheckRefund;
var sRefund;

var sCallTier3;

var sFlag;

	try
	{
		switch(fieldName)
		{
			case ""STC Date Of Birth"":
				appObj = theApplication();
				
	            NewValue = value;
	            if (NewValue != """" && NewValue != null)
	            {
	
					dCurrDate = new Date();
					sSysdate = dCurrDate.getTime();

					NewValue = new Date(NewValue);
					sDateStr = NewValue.getTime();
					sDiffTime = sSysdate - sDateStr;
					
					if (sDiffTime < 16*365.25*24*60*60*1000)
					{ 
						alert(""Minimum age allowed for a customer is 16 years. Please check the Date of Birth."");
						return (""CancelOperation"");						
					}
				}
	         	break;
	         case ""STC New Credit Limit"":
         			appObj = theApplication();
         			
			         			this.WriteRecord();
			         			//>>>added by navin
			         			type = this.GetFieldValue(""INS Sub-Area"");
			         			//alert(type+"":1"");
			         			if(type == ""Change of Billing Details"")
			         			{
			         			//alert(type+"":2"");
			         			///<<<<navin ends
			         			sValue = value;
			         			SRId = this.GetFieldValue(""Id"");
			         			Inputs = appObj.NewPropertySet();
			         			Outputs = appObj.NewPropertySet();
			         			svcService = appObj.GetService(""STC Calculate Credit Limit"");
			         			Inputs.SetProperty(""CreditLimit"",sValue);
			         			Inputs.SetProperty(""SRId"",SRId);
			         			Outputs = svcService.InvokeMethod(""CreditLimit"",Inputs);
			         			sAlert = Outputs.GetProperty(""AlertMsg"");
			         			sConfirm = Outputs.GetProperty(""ConfirmMsg"");
			         			sFee = Outputs.GetProperty(""Fee"");
			         			sCheckRefund = Outputs.GetProperty(""Check Refund"");
			         			sRefund ="""";
			         			this.WriteRecord();
			         			if(sCheckRefund ==""Y"")
			         				sRefund =""Refund"";
			         			else
			         				sRefund =""Deposit"";
			         			if(sAlert !="""")
			         			{
			         				alert(sAlert);
			         				return (""CancelOperation"");
			         			}	
			         			if(sConfirm != """")
			         			{
			         				sFlag = confirm(sConfirm);
			         				if(sFlag == false)
			         				{
			         					return (""CancelOperation"");
			         				}
			         				else
			         				{
			         					this.SetFieldValue(""STC Fee"",sFee);
			         					this.SetFieldValue(""STC Deposit Flag"",sRefund);
			         				}
			         			
			         			}
			         			else
			           			{
			         				this.SetFieldValue(""STC Fee"",sFee);
			         				this.SetFieldValue(""STC Deposit Flag"",sRefund);
			         			}
			         		}//end if
			         		
			         	this.ActivateField(""INS Sub-Area"");	
			         	sCallTier3 = this.GetFieldValue(""INS Sub-Area"");
         			
         				if(sCallTier3 == ""Change of Billing Details"")
         				{
			         		this.WriteRecord();
			         		this.InvokeMethod(""RefreshBusComp"");
			         		this.InvokeMethod(""RefreshRecord"");
			         		this.ExecuteQuery();
			         	}	
			         		break;
			         	         			
				         default:
				         	break;
       	 }
      }
      catch(e)
	  {
	  }
      finally
      {
    		dCurrDate = null;
    		NewValue = null;
    		Inputs = null;
    		Outputs = null;
    		svcService = null;
    		appObj=null;
      }
	return (""ContinueOperation"");
}
var num=0;
function BusComp_PreSetFieldValue (fieldName, value)
{
    if(fieldName==""TDN Nationality"" && value!=""India"")
    {
    	theApplication().SWEAlert(""Please provide 2 local references along with the form"");
    }
	return (""ContinueOperation"");
}
function BusComp_PreSetFieldValue (fieldName, value)
{

	return (""ContinueOperation"");
}
"
function BusComp_PreSetFieldValue (fieldName, value)
{
	try
	{
		var appObj;
		switch(fieldName)
		{
			case ""STC Date Of Birth"":
				appObj = theApplication();
				var NewValue;
	            NewValue = value;
	            if (NewValue != """" && NewValue != null)
	            {
					var dCurrDate;
					var sSysdate;
					var sDateStr;
					var sDiffTime;
					var sErrMsg;
					
					dCurrDate = new Date();
					sSysdate = dCurrDate.getTime();
					
	
					NewValue = new Date(NewValue);
					sDateStr = NewValue.getTime();
					sDiffTime = sSysdate - sDateStr;
					
					if (sDiffTime < 16*365.25*24*60*60*1000)
					{ 
						alert(""Minimum age allowed for a customer is 16 years. Please check the Date of Birth."");
						return (""CancelOperation"");						
					}
				}
	         	break;
	         case ""STC New Credit Limit"":
         			appObj = theApplication();
         			var sValue = value;
         			var Inputs = appObj.NewPropertySet();
         			var Outputs = appObj.NewPropertySet();
         			var svcService = appObj.GetService(""STC Calculate Credit Limit"");
         			Inputs.SetProperty(""CreditLimit"",sValue);
         			Outputs = svcService.InvokeMethod(""CreditLimit"",Inputs);
         			var sAlert = Outputs.GetProperty(""AlertMsg"");
         			var sConfirm = Outputs.GetProperty(""ConfirmMsg"");
         			var sFee = Outputs.GetProperty(""Fee"");
         			var sCheckRefund = Outputs.GetProperty(""Check Refund"");
         			var sRefund ="""";
         			if(sCheckRefund ==""Y"")
         				sRefund =""Refund"";
         			else
         				sRefund =""Deposit"";
         			if(sAlert !="""")
         			{
         				alert(sAlert);
         				return (""CancelOperation"");
         			}	
         			if(sConfirm != """")
         			{
         				var sFlag = confirm(sConfirm);
         				if(sFlag == false)
         				{
         					return (""CancelOperation"");
         				}
         				else
         				{
         					this.SetFieldValue(""STC Fee"",sFee);
         					this.SetFieldValue(""STC Deposit Flag"",sRefund);
         				}
         			
         			}
         			else
           			{
         				this.SetFieldValue(""STC Fee"",sFee);
         				this.SetFieldValue(""STC Deposit Flag"",sRefund);
         			}
         			break;
         	         			
	         default:
	         	break;
       	 }
      }
      catch(e)
	  {
	  }
      finally
      {
    		dCurrDate = null;
    		NewValue = null;
    		Inputs = null;
    		Outputs = null;
    		svcService = null;
      }
	return (""ContinueOperation"");
}
function BusComp_PreSetFieldValue (fieldName, value)
{
	try
	{
		var appObj;
		switch(fieldName)
		{
			case ""STC Date Of Birth"":
				appObj = theApplication();
				var NewValue;
	            NewValue = value;
	            if (NewValue != """" && NewValue != null)
	            {
					var dCurrDate;
					var sSysdate;
					var sDateStr;
					var sDiffTime;
					var sErrMsg;
					
					dCurrDate = new Date();
					sSysdate = dCurrDate.getTime();
					
	
					NewValue = new Date(NewValue);
					sDateStr = NewValue.getTime();
					sDiffTime = sSysdate - sDateStr;
					
					if (sDiffTime < 16*365.25*24*60*60*1000)
					{ 
						alert(""Minimum age allowed for a customer is 16 years. Please check the Date of Birth."");
						return (""CancelOperation"");						
					}
				}
	         	break;
	         case ""STC New Credit Limit"":
         			appObj = theApplication();
         			var sValue = value;
         			var Inputs = appObj.NewPropertySet();
         			var Outputs = appObj.NewPropertySet();
         			var svcService = appObj.GetService(""STC Calculate Credit Limit"");
         			Inputs.SetProperty(""CreditLimit"",sValue);
         			Outputs = svcService.InvokeMethod(""CreditLimit"",Inputs);
         			var sAlert = Outputs.GetProperty(""AlertMsg"");
         			var sConfirm = Outputs.GetProperty(""ConfirmMsg"");
         			var sFee = Outputs.GetProperty(""Fee"");
         			var sCheckRefund = Outputs.GetProperty(""Check Refund"");
         			var sRefund ="""";
         			if(sCheckRefund ==""Y"")
         				sRefund =""Refund"";
         			else
         				sRefund =""Deposit"";
         			if(sAlert !="""")
         			{
         				alert(sAlert);
         				return (""CancelOperation"");
         			}	
         			if(sConfirm != """")
         			{
         				var sFlag = confirm(sConfirm);
         				if(sFlag == false)
         				{
         					return (""CancelOperation"");
         				}
         				else
         				{
         					this.SetFieldValue(""STC Fee"",sFee);
         					this.SetFieldValue(""STC Deposit Flag"",sRefund);
         				}
         			
         			}
         			else
           			{
         				this.SetFieldValue(""STC Fee"",sFee);
         				this.SetFieldValue(""STC Deposit Flag"",sRefund);
         			}
         			break;
         	         			
	         default:
	         	break;
       	 }
      }
      catch(e)
	  {
	  }
      finally
      {
    		dCurrDate = null;
    		NewValue = null;
    		Inputs = null;
    		Outputs = null;
    		svcService = null;
      }
	return (""ContinueOperation"");
}
function BusComp_PreSetFieldValue (fieldName, value)
{
var appObj;

var NewValue;
var dCurrDate;
var sSysdate;
var sDateStr;
var sDiffTime;
var sErrMsg;
var type;

var sValue;
var SRId;
var Inputs;
var Outputs;
var svcService;

var sAlert;
var sConfirm;
var sFee;
var sCheckRefund;
var sRefund;

var sCallTier3;

var sFlag;

	try
	{
		switch(fieldName)
		{
			case ""STC Date Of Birth"":
				appObj = theApplication();
				
	            NewValue = value;
	            if (NewValue != """" && NewValue != null)
	            {
	
					dCurrDate = new Date();
					sSysdate = dCurrDate.getTime();

					NewValue = new Date(NewValue);
					sDateStr = NewValue.getTime();
					sDiffTime = sSysdate - sDateStr;
					
					if (sDiffTime < 16*365.25*24*60*60*1000)
					{ 
						alert(""Minimum age allowed for a customer is 16 years. Please check the Date of Birth."");
						return (""CancelOperation"");						
					}
				}
	         	break;
	         case ""STC New Credit Limit"":
         			appObj = theApplication();
         			
			         			this.WriteRecord();
			         			//>>>added by navin
			         			type = this.GetFieldValue(""INS Sub-Area"");
			         			//alert(type+"":1"");
			         			if(type == ""Change of Billing Details"")
			         			{
			         			//alert(type+"":2"");
			         			///<<<<navin ends
			         			sValue = value;
			         			SRId = this.GetFieldValue(""Id"");
			         			Inputs = appObj.NewPropertySet();
			         			Outputs = appObj.NewPropertySet();
			         			svcService = appObj.GetService(""STC Calculate Credit Limit"");
			         			Inputs.SetProperty(""CreditLimit"",sValue);
			         			Inputs.SetProperty(""SRId"",SRId);
			         			Outputs = svcService.InvokeMethod(""CreditLimit"",Inputs);
			         			sAlert = Outputs.GetProperty(""AlertMsg"");
			         			sConfirm = Outputs.GetProperty(""ConfirmMsg"");
			         			sFee = Outputs.GetProperty(""Fee"");
			         			sCheckRefund = Outputs.GetProperty(""Check Refund"");
			         			sRefund ="""";
			         			this.WriteRecord();
			         			if(sCheckRefund ==""Y"")
			         				sRefund =""Refund"";
			         			else
			         				sRefund =""Deposit"";
			         			if(sAlert !="""")
			         			{
			         				alert(sAlert);
			         				return (""CancelOperation"");
			         			}	
			         			if(sConfirm != """")
			         			{
			         				sFlag = confirm(sConfirm);
			         				if(sFlag == false)
			         				{
			         					return (""CancelOperation"");
			         				}
			         				else
			         				{
			         					this.SetFieldValue(""STC Fee"",sFee);
			         					this.SetFieldValue(""STC Deposit Flag"",sRefund);
			         				}
			         			
			         			}
			         			else
			           			{
			         				this.SetFieldValue(""STC Fee"",sFee);
			         				this.SetFieldValue(""STC Deposit Flag"",sRefund);
			         			}
			         		}//end if
			         		
			         	this.ActivateField(""INS Sub-Area"");	
			         	sCallTier3 = this.GetFieldValue(""INS Sub-Area"");
         			
         				if(sCallTier3 == ""Change of Billing Details"")
         				{
			         		this.WriteRecord();
			         		this.InvokeMethod(""RefreshBusComp"");
			         		this.InvokeMethod(""RefreshRecord"");
			         		this.ExecuteQuery();
			         	}	
			         		break;
			         	         			
				         default:
				         	break;
       	 }
      }
      catch(e)
	  {
	  }
      finally
      {
    		dCurrDate = null;
    		NewValue = null;
    		Inputs = null;
    		Outputs = null;
    		svcService = null;
    		appObj=null;
      }
	return (""ContinueOperation"");
}
function BusComp_PreSetFieldValue (fieldName, value)
{
var appObj;

var NewValue;
var dCurrDate;
var sSysdate;
var sDateStr;
var sDiffTime;
var sErrMsg;
var type;

var sValue;
var SRId;
var Inputs;
var Outputs;
var svcService;

var sAlert;
var sConfirm;
var sFee;
var sCheckRefund;
var sRefund;

var sCallTier3;

var sFlag;

	try
	{
		switch(fieldName)
		{
			case ""STC Date Of Birth"":
				appObj = theApplication();
				
	            NewValue = value;
	            if (NewValue != """" && NewValue != null)
	            {
	
					dCurrDate = new Date();
					sSysdate = dCurrDate.getTime();

					NewValue = new Date(NewValue);
					sDateStr = NewValue.getTime();
					sDiffTime = sSysdate - sDateStr;
					
					if (sDiffTime < 16*365.25*24*60*60*1000)
					{ 
						alert(""Minimum age allowed for a customer is 16 years. Please check the Date of Birth."");
						return (""CancelOperation"");						
					}
				}
	         	break;
	         case ""STC New Credit Limit"":
         			appObj = theApplication();
         			//MANUJ: CCS
         						var oBS;
						     	var inpPS;
						        var outPS;
								SRId = this.GetFieldValue(""Id"");
								inpPS = theApplication().NewPropertySet();
						        outPS = theApplication().NewPropertySet();
						        inpPS.SetProperty(""ProcessName"",""STC Check WeDo Flag"");
								inpPS.SetProperty(""Object Id"",SRId);
						        oBS = theApplication().GetService(""Workflow Process Manager"");
						        outPS = oBS.InvokeMethod(""RunProcess"", inpPS,outPS);       
						        var vFlag = outPS.GetProperty(""CCSCheckFlag"");
					//MANUJ: CCS
			         			this.WriteRecord();
			         			//>>>added by navin
			         			type = this.GetFieldValue(""INS Sub-Area"");
			         			//alert(type+"":1"");
			         			if(type == ""Change of Billing Details"" && vFlag != ""CCS_CHECK_ON"")
			         			{
			         			//alert(type+"":2"");
			         			///<<<<navin ends
			         			sValue = value;
			         			SRId = this.GetFieldValue(""Id"");
			         			Inputs = appObj.NewPropertySet();
			         			Outputs = appObj.NewPropertySet();
			         			svcService = appObj.GetService(""STC Calculate Credit Limit"");
			         			Inputs.SetProperty(""CreditLimit"",sValue);
			         			Inputs.SetProperty(""SRId"",SRId);
			         			Outputs = svcService.InvokeMethod(""CreditLimit"",Inputs);
			         			sAlert = Outputs.GetProperty(""AlertMsg"");
			         			sConfirm = Outputs.GetProperty(""ConfirmMsg"");
			         			sFee = Outputs.GetProperty(""Fee"");
			         			sCheckRefund = Outputs.GetProperty(""Check Refund"");
			         			sRefund ="""";
			         			this.WriteRecord();
			         			if(sAlert == undefined)
									sAlert = """";
								if(sConfirm == undefined)
									sConfirm = """";
								if(sCheckRefund ==""Y"")
			         				sRefund =""Refund"";
			         			else
			         				sRefund =""Deposit"";
			         			if(sAlert !="""")
			         			{
			         				alert(sAlert);
			         				return (""CancelOperation"");
			         			}	
			         			if(sConfirm != """")
			         			{
			         				sFlag = confirm(sConfirm);
			         				if(sFlag == false)
			         				{
			         					return (""CancelOperation"");
			         				}
			         				else
			         				{
			         					this.SetFieldValue(""STC Fee"",sFee);
			         					this.SetFieldValue(""STC Deposit Flag"",sRefund);
			         				}
			         			
			         			}
			         			else
			           			{
			         				this.SetFieldValue(""STC Fee"",sFee);
			         				this.SetFieldValue(""STC Deposit Flag"",sRefund);
			         			}
			         		}//end if
			         		
			         	this.ActivateField(""INS Sub-Area"");	
			         	sCallTier3 = this.GetFieldValue(""INS Sub-Area"");
         			
         				if(sCallTier3 == ""Change of Billing Details"")
         				{
			         		this.WriteRecord();
			         		this.InvokeMethod(""RefreshBusComp"");
			         		this.InvokeMethod(""RefreshRecord"");
			         		this.ExecuteQuery();
			         	}	
			         		break;
			         		
							case ""Status"":		
							appObj = theApplication();	
							var vStatus = this.GetFieldValue(""Status"");
							var vReason = this.GetFieldValue(""STC Response Value"");
							var vCallBack = this.GetFieldValue(""STC Pref Mode Contact"");
							if(vStatus == ""Resolved"" && vReason == ""No Response"" && vCallBack == ""Agent Call Back"")
							{
							alert(""Customer Response Field must be captured"");
							return (""CancelOperation"");
							}	
							break;	   
			         					
				         default:
				         	break;
       	 }
      }
      catch(e)
	  {
	  }
      finally
      {
    		dCurrDate = null;
    		NewValue = null;
    		Inputs = null;
    		Outputs = null;
    		svcService = null;
    		appObj=null;
      }
	return (""ContinueOperation"");
}

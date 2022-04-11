function Rateplan()
{
 //gjena_11 Nov 2012 Added for New CR for Rate Plan and CL validation
  
 try
  {
	  var BillAccId = this.BusComp().GetFieldValue("Billing Account Id");
	  var CurrentOrdMrc = this.BusComp().GetFieldValue("Current Order Total Net Price MRC");
	  this.BusComp().ActivateField("STC Order SubType");
	  var sOrderType = this.BusComp().GetFieldValue("STC Order SubType");
	  var advflg=this.BusComp().GetFieldValue("STC Credit Flg");
	  if(sOrderType == "Provide")
      {
		  var AccountBO=TheApplication().GetBusObject("STC Billing Account_Copy");
		  var AcctCon=AccountBO.GetBusComp("CUT Invoice Sub Accounts_Copy");
		  AcctCon.ActivateField("Credit Score");
		  AcctCon.ActivateField("Type");
		  AcctCon.SetViewMode(AllView);
		  AcctCon.ClearToQuery();
		  AcctCon.SetSearchSpec("Id",BillAccId);
		  AcctCon.ExecuteQuery(ForwardOnly);
		  var Recordfound=AcctCon.FirstRecord();
      	  if(Recordfound)
          {
       		var CreditScore =AcctCon.GetFieldValue("Credit Score");
       		var type=AcctCon.GetFieldValue("Type");
          }
          if(type=="Individual") //If type
          { 
            
            var vCreditScore = "";
            var vBillValidationBS = TheApplication().GetService("STC Credit Limit Updates Rate Plan");
            var InpPS = TheApplication().NewPropertySet();
            var OutPS = TheApplication().NewPropertySet();
            InpPS.SetProperty("BillAccId", BillAccId);
            vBillValidationBS.InvokeMethod("Rate Plan",InpPS,OutPS);
            vCreditScore = OutPS.GetProperty("CreditScoreChange");
            
            CreditScore = ToNumber(CreditScore);
            var TotCreditLimit = ToNumber(vCreditScore)+ ToNumber(CurrentOrdMrc);
	        if(CreditScore <= TotCreditLimit && advflg!="Y")
			{
		   		TheApplication().RaiseErrorText("Plan Value is More than the Customers Credit Limit,To Continue Please check the Credit limit flag");			
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
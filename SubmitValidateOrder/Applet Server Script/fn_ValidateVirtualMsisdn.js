//[Soumyadeep][No Postpaid subscription for Virtual MSISDN][11-10-2012]
function fn_ValidateVirtualMsisdn()
{
	try
	{
		var strServiceType;
		var bRecExist,bRecExist1;
		var sMSISDN="";
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
		var bmsPackagePartNum="",bmsPackagePartNumLic="";
		

		CurrBC.ActivateField("Billing Account Id");
		CurrBC.ActivateField("Id");
		OrderId 	= CurrBC.GetFieldValue("Id");
		BillAccId 	= CurrBC.GetFieldValue("Billing Account Id");
						
		boBilling 	= appObj.GetBusObject("STC Billing Account");
		bcBillAccnt = boBilling.GetBusComp("CUT Invoice Sub Accounts");
		boOrder 	= appObj.GetBusObject("Order Entry (Sales)");
		bcOrder 	= boOrder.GetBusComp("Order Entry - Orders");
		bcOrderLines = boOrder.GetBusComp("Order Entry - Line Items");
		
		with (bcBillAccnt)   //with 1
        {   
	        ActivateField("Id");
	        ActivateField("STC Service Type");
	        SetViewMode(AllView);   
	        ClearToQuery();   
	        SetSearchSpec("Id", BillAccId);   
	        ExecuteQuery(ForwardOnly);   
	        bRecExist = FirstRecord(); 
			if(bRecExist) // if 1.1
			{
				strServiceType = GetFieldValue("STC Service Type");
			} //end if 1.1
		} //end with
		
		if(strServiceType == "Postpaid") // if 2
		{					
			bRecExist = null;
			with (bcOrder)   //with 2.1
			{   
		        ActivateField("Id");
		        SetViewMode(AllView);   
		        ClearToQuery();   
		        SetSearchSpec("Id", OrderId);   
		        ExecuteQuery(ForwardOnly);   
		        bRecExist = FirstRecord();   
		        if (bRecExist)  //if 2.1.1 
				{   
					with(bcOrderLines)  //with 2.1.1.1 
					{  
				        ActivateField("Order Header Id");
				        ActivateField("Service Id");
				        ActivateField("Part Number");
				        SetViewMode(AllView);   
				        ClearToQuery();
				        SetSearchSpec("Order Header Id", OrderId);
				        SetSearchSpec("Product Type", "Package");
				        ExecuteQuery(ForwardOnly); 
				        bRecExist1 = FirstRecord(); 
				        if(bRecExist1) //if 2.1.1.1.1
				        {
				        	sMSISDN = GetFieldValue("Service Id");
				        	bmsPackagePartNum = GetFieldValue("Part Number");
				        	
				        	bmsPackagePartNumLic = appObj.InvokeMethod("LookupValue", "STC_BMS_PKG", bmsPackagePartNum);
				        	if( bmsPackagePartNumLic == bmsPackagePartNum )
				        		appObj.RaiseErrorText("Bulk SMS Package is not available for postpaid customer");
				        } //end if 2.1.1.1.1
					} //end with 2.1.1.1
				} // end if 2.1.1
			} // end with 2.1
			
			if( sMSISDN != "" ) //if 2.2
			{
				boRMSNumberEnquiry = TheApplication().GetBusObject("RMS NM Number Enquiry");
				bcRMSNumberEnquiry = boRMSNumberEnquiry.GetBusComp("RMS NM Number Enquiry");
				with (bcRMSNumberEnquiry) //with 2.2.1
				{				
					ActivateField("Special Category Type");
					ActivateField("Type");
					ActivateField("Number String");
					SetViewMode(AllView);
					ClearToQuery();
					strExpr = " [Number String] = '"+ sMSISDN +"'"  + "AND [Special Category Type] = 'Bulk Message' AND [Type] = 'MSISDN'";
					/*SetSearchSpec("Special Category Type", "Bulk Message");               
					SetSearchSpec("Number String", sMSISDN);
					SetSearchSpec("Type", "MSISDN");*/
					SetSearchExpr(strExpr);
					ExecuteQuery(ForwardOnly);   
					bRecordExists = FirstRecord();
					if (bRecordExists) //if 2.2.1.1
					{
						appObj.RaiseErrorText("Virtual MSISDN is not allowed for Postpaid connection.");
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
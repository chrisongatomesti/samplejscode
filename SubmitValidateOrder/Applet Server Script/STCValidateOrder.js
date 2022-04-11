function STCValidateOrder()
{
try{
				var strServiceType,sMSISDN,OrderId,BillAccId,Ordertype;
				var strCount;
				var MSISDNCategory;
				var PackageName,PackagePart,vProfile,vDatcomPackage,STCCustomerType,BillingAccountStatus;
				var sActionCd,sBillProfId,sSIMNumber,sAuthorityLevel,sServiceAccount,sServiceId,MNPMSISDN;
				var appObj = TheApplication();
				var bRecExist1;
				var boOrder = appObj.GetBusObject("Order Entry (Sales)");
		//		var bcOrder = boOrder.GetBusComp("Order Entry - Orders");
				var bcOrderLines = boOrder.GetBusComp("Order Entry - Line Items (Simple)");
				var CurrBC = this.BusComp();

					with(CurrBC)
				{
			
					ActivateField("Billing Account Id");
					ActivateField("Id");
					ActivateField("STC Billing Profile Type");
					ActivateField("STC Datacom Package");
					ActivateField("STC Customer Type");
					ActivateField("Billing Account Status");
					OrderId = GetFieldValue("Id");
					BillAccId = GetFieldValue("Billing Account Id");
					strServiceType = GetFieldValue("STC Service Type");
					Ordertype = GetFieldValue("STC Order SubType");
					vProfile = GetFieldValue("STC Billing Profile Type");
					vDatcomPackage = GetFieldValue("STC Datacom Package");
					STCCustomerType = GetFieldValue("STC Customer Type");
					BillingAccountStatus = GetFieldValue("Billing Account Status");


				}
					with(bcOrderLines)   
							{  
						        ActivateField("Order Header Id");
						        ActivateField("Service Id");
						        ActivateField("STC MSISDN Category");// P1*****
								ActivateField("Root Order Item Id");// P1*****
								ActivateField("Part Number");// P1*****
								ActivateField("Action Code");// P1*****
								ActivateField("Billing Profile Id");// P1*****
								ActivateField("STC Authorization Code");// P1*****
								ActivateField("Service Account Id");// P1*****
								ActivateField("Service Id");// P1*****
								ActivateField("STC ICCID");// P1*****
								ActivateField("STC MNP MSISDN");// P1*****
						        SetViewMode(AllView);   
						        ClearToQuery();
			       // P1***** SetSearchSpec("Order Header Id", OrderId);
					//			var strExpr = " [Order Header Id] = '"+ OrderId +"'"  + "AND [Product Type] = 'Package'"; 
								var strExpr = "[Order Header Id] = '"+ OrderId +"' AND [Product Type] = 'Package'";
								SetSearchExpr(strExpr);
						        ExecuteQuery(ForwardOnly);
						        strCount = CountRecords();
						        bRecExist1 = FirstRecord();
						        if(bRecExist1)
						        {
						        	
									MSISDNCategory = GetFieldValue("STC MSISDN Category");
						           	sMSISDN = GetFieldValue("Service Id");
						        	PackageName = GetFieldValue("Product");
						        	PackagePart = GetFieldValue("Part Number");
									sActionCd = GetFieldValue("Action Code");
									sBillProfId = GetFieldValue("Billing Profile Id");
									sSIMNumber = GetFieldValue("STC ICCID");
									sAuthorityLevel = GetFieldValue("STC Authorization Code");
									sServiceAccount= GetFieldValue("Service Account Id");
									sServiceId = GetFieldValue("Service Id");
									MNPMSISDN = GetFieldValue("STC MNP MSISDN");
						        	
						        }// if(bRecExist1)
							}//with(bcOrderLines)
					
						if(Ordertype == appObj.InvokeMethod("LookupValue","STC_ORDER_SUB_TYPE","Provide"))
						{

						   ProvideOrderValidate(OrderId,BillAccId,strServiceType,Ordertype,vProfile,vDatcomPackage,STCCustomerType,BillingAccountStatus,strCount,MSISDNCategory,sMSISDN,PackageName,PackagePart,sActionCd,sBillProfId,sSIMNumber,sAuthorityLevel,sServiceAccount,sServiceId,MNPMSISDN);
						}
						
						else if(Ordertype == appObj.InvokeMethod("LookupValue","STC_ORDER_SUB_TYPE","Modify"))
						{
							
						   ModifyOrderValidate(OrderId,BillAccId,strServiceType,Ordertype,vProfile,vDatcomPackage,STCCustomerType,BillingAccountStatus,strCount,MSISDNCategory,sMSISDN,PackageName,PackagePart,sActionCd,sBillProfId,sSIMNumber,sAuthorityLevel,sServiceAccount,sServiceId,MNPMSISDN);
						}
						else if(Ordertype != appObj.InvokeMethod("LookupValue","STC_ORDER_SUB_TYPE","Provide") && Ordertype != appObj.InvokeMethod("LookupValue","STC_ORDER_SUB_TYPE","Modify"))
						{
							RemainingOrderValidation();
						}
}
	catch(e)
	{
		throw(e);
	}
	finally
	{
		appObj = null;
	}
							
}
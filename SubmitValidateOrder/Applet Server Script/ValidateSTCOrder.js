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
 var OrdValDate;
 var STCOrderValidateStart;	
  try
    {              
		appObj = TheApplication(); 		
		boBilling = appObj.GetBusObject("STC Billing Account");
		bcBilling = boBilling.GetBusComp("CUT Invoice Sub Accounts");
		bcOrder = boBilling.GetBusComp("Order Entry - Orders");
		sBillingId = this.BusComp().GetFieldValue("Billing Account Id");		
	    with(this.BusComp())
	    {	    
	    ActivateField("STC Order SubType");
		ActivateField("STC Customer Type");
	    ordType = GetFieldValue("STC Order SubType");
		var OrderCustType = GetFieldValue("STC Customer Type");
	    var DiscOrder = appObj.InvokeMethod("LookupValue","STC_ORDER_SUB_TYPE","Disconnect");
	    	ActivateField("STC Port In Flag");
			var MNPPortIn = GetFieldValue("STC Port In Flag");
	    if(MNPPortIn == "Yes")
	    	{
	    		ActivateField("STC MNP Operator");
	    		ActivateField("STC Donor SIM No");
	    		ActivateField("STC Subscriber Id Type");
	    		ActivateField("STC Subscriber Id");
	    		ActivateField("STC Individual Id");
	    		ActivateField("STC Individual Id Type");
	    		ActivateField("STC MNP Customer Type");
	    		var Oper = GetFieldValue("STC MNP Operator");
	    		var vSIM = GetFieldValue("STC Donor SIM No");
	    		var vSubsIdType = GetFieldValue("STC Subscriber Id Type");
	    		var vCustType = GetFieldValue("STC MNP Customer Type");
	    		var vIndId = GetFieldValue("STC Individual Id");
	    		var vIndTypeId = GetFieldValue("STC Individual Id Type");
	    		var vSubsId = GetFieldValue("STC Subscriber Id");
	    		var vIndCntryCode = GetFieldValue("STC Indv GCC Country Code");//CIO
	    		var vSubCntyCode = GetFieldValue("STC GCC Country Code");//CIO
	    		var vLenSubId = vSubsId.length;
	    		var vLenIndId = vIndId.length;
	    		var vStrsubid;
	    		//CIO software Update SD below
	    		var vAllowGCCId = TheApplication().InvokeMethod("LookupValue","STC_GCC_PORTIN_ALLOW","STC_GCC_PORTIN_ALLOW");
	    		if(vAllowGCCId != "Y"){
	    			if(vSubsIdType == "GCC" || vIndTypeId == "GCC")
	    			appObj.RaiseErrorText("Currently GCC Id is not allowed for PortIn Orders");	    			
	    		}//endif vAllowGCCId
	    		//CIO software Update SD above
	    	  if(Oper == "" || Oper == null)
	    			{
	    				appObj.RaiseErrorText("Please select Donor Id for MNP Orders");
	    			}
	    			 	if(vCustType == "Corporate")
	    					{
	    						if(vSubsIdType == "" || vSubsIdType == null)
	    							{
	    								appObj.RaiseErrorText("Subscriber Id Type is Required Field");
	    							}	    						
	    						if(vSubsIdType != "CR")
	    							{
	    								appObj.RaiseErrorText("Please select CR as Subscriber Id Type for Corporate Customers");
	    							}
	    							if(vSubsId == "" || vSubsId == null)
	    								{
	    									appObj.RaiseErrorText("Subscriber Id is Required Field");
	    								}	    									    								
	    							if(vLenSubId > 10)
	    								{
	    									appObj.RaiseErrorText("CR length should be Lessthan equal to 10 digit");
	    								}	    
	    								    vStrsubid = vSubsId.indexOf("/",0);
	    										
	    										if(vStrsubid == -1)
	    											{
	    												appObj.RaiseErrorText("Please enter '/' in Subscriber Id");
	    											}  
	    																	    	
	    								if(vIndTypeId == "" || vIndTypeId == null)
	    									{
	    										appObj.RaiseErrorText("Individual Id Type is required Field")
	    									}
	    									    									
	    								if(vIndTypeId == "CR")
	    								{	
	    									appObj.RaiseErrorText("Please select Bharain Id or Passport or GCC as IndividualType Id for corporate customers");//Added GCC for CIO
	    								}	   
	    								    if(vIndId == "" || vIndId == null)	
	    								    	{
	    											appObj.RaiseErrorText("Individual Id # is Required Field");
	    										}								
	    								if(vIndTypeId == "Bahraini ID")
	    									{
	    										if(vLenIndId != 9)	
	    											{
	    											appObj.RaiseErrorText("Bharain Id must be 9 digits");									
	    												}
	    										else{//CIO
	    											if(vIndCntryCode != "BH")
	    												appObj.RaiseErrorText("Please select type as ‘Bahraini Id’ for country Bahrain.");
	    										}//endelse vLenIndId
	    									}
	    								if(vIndTypeId == "Passport")
	    									{
	    										if(vLenIndId > 12)			
	    											{
	    												appObj.RaiseErrorText("Passport Should be lessthan equal to 12 digit");									
	    												}
	    											}
	    								//CIO
	    								if(vIndTypeId == "GCC"){
	    									ValidateGCCId(vIndId,vCustType);		    									
	    								}//endif
	    						 }		
	    						 /////Praven/////
	    						 if(vCustType == "SME")
	    						 {
                                   if(vSubsIdType == "" || vSubsIdType == null)
                                   {
                                    appObj.RaiseErrorText("Subscriber Id Type is Required Field");
                                    }                                                                                                              
                                   if(vSubsIdType != "CR")
                                   {
                                    appObj.RaiseErrorText("Please select CR as Subscriber Id Type for SME Customers");
                                   }
                                  if(vSubsId == "" || vSubsId == null)
                                   {
                                    appObj.RaiseErrorText("Subscriber Id is Required Field");
                                   } 
                                    if(vLenSubId > 10)
                                    {
                                      appObj.RaiseErrorText("CR length should be Lessthan equal to 10 digit");
                                     }                  
                                      vStrsubid = vSubsId.indexOf("/",0);
                                                                                                                                                                                
                                 if(vStrsubid == -1)
			                       {
			                                       appObj.RaiseErrorText("Please enter '/' in Subscriber Id");
			                       }
                                    if(vIndTypeId == "" || vIndTypeId == null)
									{
									appObj.RaiseErrorText("Individual Id Type is required Field")
									}
									
									if(vIndTypeId == "CR")
									{              
									appObj.RaiseErrorText("Please select Bharain Id or Passport or GCC as IndividualType Id for SME customers");//Added GCC for CIO
									}                 
									if(vIndId == "" || vIndId == null)           
									{
									appObj.RaiseErrorText("Individual Id # is Required Field");
									}
									if(vIndTypeId == "Bahraini ID")
									{
									if(vLenIndId != 9)             
									{
									appObj.RaiseErrorText("Bharain Id must be 9 digits");
									}
									else{
										if(vIndCntryCode != "BH")
	    									appObj.RaiseErrorText("Please select type as ‘Bahraini Id’ for country Bahrain.");
	    							}//endelse vLenIndId
									}
                                   if(vIndTypeId == "Passport")
                                   {
                                   if(vLenIndId > 12)
                                   {
                                   appObj.RaiseErrorText("Passport Should be lessthan equal to 12 digit");
                                   }
                                  } 
                                  //CIO
	    							if(vIndTypeId == "GCC"){
	    								ValidateGCCId(vIndId,vCustType);		    									
	    							}//endif
                                }                                  
////Praveen///					
		
	    						if(vCustType == "Organization")	
	    						{
	    							if(vSubsIdType == "" || vSubsIdType == null)
	    									{
	    										appObj.RaiseErrorText("Subscriber Id Type is Required Field");
	    									}
	    									
	    									if(!(vSubsIdType == "Bahraini ID" || vSubsIdType == "Passport" ))
	    									{
	    											appObj.RaiseErrorText("Please select Bahraini ID or Passport as Subscriber Id Type for Organisation Customers");
	    										}		
	    											if(vSubsId == "" || vSubsId == null)
	    												{
	    													appObj.RaiseErrorText("Subscriber Id is Required Field");
	    												}	    											  	
	    			 			  					if(vSubsIdType == "Bahraini ID")
	    			 			  						{
	    			 			  							if(vLenSubId != 9)
	    			 			  								{
	    			 			  										appObj.RaiseErrorText("Bharain Id must be 9 digits");
	    			 			  								}
	    			 			  						}
	    			 			  					 if(vSubsIdType == "Passport")
	    			 			  					 	{
	    			 			  					 		if(vLenSubId > 12)
	    			 			  								{
	    			 			  										appObj.RaiseErrorText("Passport Should be lessthan equal to 12 digit");
	    			 			  								}	
	    			 			  						}
	    			 			  					if(vIndTypeId == "" || vIndTypeId == null)	
	    								    				{
	    														appObj.RaiseErrorText("Individual Id Type is Required Field");
	    													}	
	    			 			  					if(vIndTypeId != "CR")
	    												{	
	    													appObj.RaiseErrorText("Please select CR as IndividualType Id for Organisation customers");
	    												}	
	    			 			  					if(vIndTypeId == "CR")
	    			 			  						{	
	    			 			  							if(vIndId == "" || vIndId == null)
	    			 			  								{
	    			 			  									appObj.RaiseErrorText("Individual Id # is Required Field");
	    			 			  								}	    			 			  						
	    			 			  							if(vLenIndId > 10)			
	    														{
	    															appObj.RaiseErrorText("CR length should be Lessthan equal to 10 digit");									
	    														}
	    															 vStrsubid = vIndId.indexOf("/",0);
	    										
	    															if(vStrsubid == -1)
	    																{
	    																	appObj.RaiseErrorText("Please enter '/' in Subscriber Id");
	    																}	
	    			 			  						}
	    			 			  				}
	    			 			  				
	    			 			 if(vCustType == "Individual")	
	    			 			  	{	
	    			 			  		if(vSubsIdType == "" || vSubsIdType == null)
	    			 			  			{
	    			 			  				appObj.RaiseErrorText("Subscriber Id Type is Required Field");
	    			 			  			}	    			 			  			
	    			 			  	if(!(vSubsIdType == "Bahraini ID" || vSubsIdType == "Passport" || vSubsIdType == "GCC" || vSubsIdType == "PNN ID"))//CIO added GCC//SUMANK: 22012018Added PNN ID as per SD PNN ID Enhancements
	    										{
	    											appObj.RaiseErrorText("Please select Bahraini ID or Passport or GCC or PNN ID as Subscriber Id Type for Individual Customers");
	    										}	
	    										if(vSubsId == "" || vSubsId == null)
	    												{
	    													appObj.RaiseErrorText("Subscriber Id is Required Field");
	    												}	    										
	    			 			  			if(vSubsIdType == "Bahraini ID" || vSubsIdType == "PNN ID")
	    			 			  				{		    			 			  					
	    			 			  						if(vLenSubId != 9)
	    			 			  								{
	    			 			  										appObj.RaiseErrorText("Bharain Id / PNN ID must be 9 digits");
	    			 			  								}
	    			 			  						else{
																if(vSubCntyCode != "BH" && vSubsIdType != "PNN ID")
	    															appObj.RaiseErrorText("Please select type as ‘Bahraini Id’ for country Bahrain.");
	    												}//endelse vLenSubId
	    			 			  				}
	    			 			  						if(vSubsIdType == "Passport")
	    			 			  								{
	    			 			  										if(vLenSubId > 12)
	    			 			  											{
	    			 			  												appObj.RaiseErrorText("Passport Should be lessthan equal to 12 digit");
	    			 			  											}			
	    			 			  								} 
	    			 			  			if(vSubsIdType == "GCC"){//CIO Software Update SD :SRINI
	    			 			  				ValidateGCCId(vSubsId,vCustType);
	    			 			  			}//endif vSubsIdType == "GCC"
	    			 			  			    			 			  		
	    			 			  		} 	   			 			  	
	    			 			  	}
	  //  }
		}// end of with(this.BusComp())
	/*** Performance	with(bcBilling)
		{
		   SetViewMode(AllView);
		   ClearToQuery();
		   SetSearchExpr("[Id] = '" + sBillingId + "' AND [STC Club Viva Flag] = 'Y'");
		   ExecuteQuery(ForwardOnly);
		   
		   if (FirstRecord())
		   {
		       sOrderType = appObj.InvokeMethod("LookupValue","STC_ORDER_SUB_TYPE","Provide");
		       sOrderStatus = appObj.InvokeMethod("LookupValue","FS_ORDER_STATUS","Complete");
		       with(bcOrder)
		       {
		          SetViewMode(AllView);
		          ActivateField("STC Order SubType");
		          ActivateField("Status");
		          ClearToQuery();
		          SetSearchExpr("[Billing Account Id] = '" + sBillingId + "' AND [STC Order SubType] = '" + sOrderType + "' AND [Status] = '" + sOrderStatus + "'");
		          ExecuteQuery(ForwardOnly);
		          sRecordCount = CountRecords();
		          
		          if (sRecordCount > 2)
		          {
		             appObj.RaiseErrorText("No more Voice Plan allowed for VIVA Club Package.");
		             
		          }   
		          
		        } //end of with  
		          
		          
		          
		          
		       
		       
		   } //end of if
		 
		 
		 } // end of with   Performance***/			
		// sOrderSubStatus = this.BusComp().ParentBusComp().GetFieldValue("STC Order Sub Status");
		sLOVSubStatus = appObj.InvokeMethod("LookupValue","STC_ORDER_SUB_STATUS","Order Validated");
		//if(sOrderSubStatus != sLOVSubStatus)
		sOrderId = this.BusComp().GetFieldValue("Id");
		sLOVProductType = appObj.InvokeMethod("LookupValue","PRODUCT_TYPE","Equipment");		
		boOrder = appObj.GetBusObject("Order Entry (Sales)");
	    bcOrderLineItem = boOrder.GetBusComp("Order Entry - Line Items (Simple)");
		with(bcOrderLineItem)
		{
			SetViewMode(AllView);
		  	ActivateField("Product Type");
  		    ClearToQuery();
			SetSearchExpr("[Order Header Id] ='" + sOrderId + "' AND [Root Order Item Id] = [Id]");
			ExecuteQuery(ForwardOnly);	

			if (FirstRecord())
			{
				sProductType = GetFieldValue("Product Type");
			}
		}
		
		if (sProductType != sLOVProductType)	  
		{
			  //  appobj = TheApplication(); 
			     Inputs = appObj.NewPropertySet();
			     Outputs = appObj.NewPropertySet();
			     //sOrderId = this.BusComp().GetFieldValue("Id");
			     Inputs.SetProperty("Order Id",sOrderId);
			     srvc = appObj.GetService("STC Order Validation");
			     srvc.InvokeMethod("ValidateOrderSTC",Inputs,Outputs);
			     sErrMsg = Outputs.GetProperty("Error Message");
		   	     sErrorCode = Outputs.GetProperty("Error Code");
		}
		
		if(sErrorCode !="" && sErrorCode != null)
		{
		   	TheApplication().RaiseErrorText(sErrMsg);
		}
		else
		{
			fnCheckMNPOrder(sOrderId);
			var sOrdNoUpd = "N";
			sOrdNoUpd = fnCANOutstandingVal(sOrderId);
			if(sOrdNoUpd == "Y")
			{
			//Do Nothing
			}
			else
			{	//Abuzar:03022022 - Order Validate Framework - Start
				this.BusComp().ActivateField("Starting Customer Requested Delivery Date Time");
				this.BusComp().ActivateField("Starting Customer Requested Pickup Date Time");				
				
				OrdValDate = this.BusComp().GetFieldValue("TimeStamp");
				STCOrderValidateStart = TheApplication().GetProfileAttr("STCOrderValidateStart");
				
				this.BusComp().SetFieldValue("Starting Customer Requested Delivery Date Time",OrdValDate);

				if (STCOrderValidateStart != "" && STCOrderValidateStart != null)
				{
					this.BusComp().SetFieldValue("Starting Customer Requested Pickup Date Time",STCOrderValidateStart);
					TheApplication().SetProfileAttr("STCOrderValidateStart", "");
				}
				//Abuzar:03022022 - Order Validate Framework - End

		    	this.BusComp().SetFieldValue("STC Order Sub Status",sLOVSubStatus);
		    	this.BusComp().WriteRecord();
		    }
		}   
		Fulfillment(sOrderId); //ROHITR:20-08-20: Added for Fulfillment enhancement 
		//Srinivasb:23-02-2022: Added for Datacom Plan Movement SD
		var vDataComplanMatrix = TheApplication().InvokeMethod("LookupValue","STC_DATACOMPLAN_MATRIX","DATACOMPLANMATRIX");
		if ((OrderCustType == "SME" || OrderCustType == "Corporate") && ordType =="Modify" && vDataComplanMatrix =="Allow")	  
			{
			with(bcOrderLineItem)
			{
				SetViewMode(AllView);
			  	ActivateField("STC Plan Type");
				ActivateField("Part Number");
	  		    ClearToQuery();
				SetSearchExpr("[Order Header Id] ='" + sOrderId + "' AND [Parent Order Item Id] IS NULL AND [STC Plan Type]='Package'");
				ExecuteQuery(ForwardOnly);	
	
				if (FirstRecord())
				{
					var PackagePart = GetFieldValue("Part Number");
				}
			}
			var vPackagePartLOV = TheApplication().InvokeMethod("LookupValue","STC_DATACOMPLAN_MATRIX",PackagePart);
			if(vPackagePartLOV == PackagePart)
			{
			DatacomPlanMatrix(sOrderId);
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
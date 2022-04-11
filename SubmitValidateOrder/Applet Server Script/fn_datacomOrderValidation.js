/*********************************************************************************************************************************/
/* Subject: Datacom product	combination validation																				 */
/* Author: Subhankar Poria | 12/26/2012																							 */
/* Version: 1.0																													 */	
/*********************************************************************************************************************************/
function fn_datacomOrderValidation()
{
	try
	{
		var vOrderId 		= this.BusComp().GetFieldValue("Id");
		var vOrderSubType 	= this.BusComp().GetFieldValue("STC Order SubType");
		var objAppln, objOrderBusObj, objOrderBusComp, objOrderItemBusComp;
		var vContractProd, vRelocationPart, vHardwarePart, vSlaPartNum, vTenurePartNum, vCircuitSpeedPartNum, vProfile, vPackageName, vDatcomPackage, vPackagePartNum, vPackagePartNumLic="", isDatacomPackage=false, vRecCount=0;
		
		if( vOrderSubType == "Provide" || vOrderSubType == "Modify" )
		{
			objAppln 		= TheApplication();
			objOrderBusObj	= objAppln.GetBusObject("Order Entry (Sales)");
			objOrderBusComp	= objOrderBusObj.GetBusComp("Order Entry - Orders");
			objOrderItemBusComp = objOrderBusObj.GetBusComp("Order Entry - Line Items (Simple)");
			vContractProd 	= objAppln.InvokeMethod("LookupValue", "STC_DATACOM_CONTRACT_PARTNUM", "DATACOM_CONTRACT_PARTNUM");
			vRelocationPart = objAppln.InvokeMethod("LookupValue", "STC_DATACOMM_PACKAGE", "DATACOM_RELOCATION_PARTNUM");
			vHardwarePart	= objAppln.InvokeMethod("LookupValue", "STC_DATACOMM_PACKAGE", "DATACOM_HARDWARE_PARTNUM");
			vSlaPartNum		= objAppln.InvokeMethod("LookupValue", "STC_DATACOMM_PACKAGE", "DATACOM_SLA_PARTNUM");
			vTenurePartNum	= objAppln.InvokeMethod("LookupValue", "STC_DATACOMM_PACKAGE", "DATACOM_TENURE_PARTNUM");
			vCircuitSpeedPartNum = objAppln.InvokeMethod("LookupValue", "STC_DATACOMM_PACKAGE", "DATACOM_CIRCUITSPEED_PARTNUM");
			
			with(objOrderBusComp)
			{
				ActivateField("STC Datacom Package");
				ActivateField("STC Billing Profile Type");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchSpec("Id", vOrderId );
				ExecuteQuery(ForwardOnly);  
				if( FirstRecord() )
				{
					vProfile = GetFieldValue("STC Billing Profile Type");
					vDatcomPackage = GetFieldValue("STC Datacom Package");
					////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
					// START: Check For same Datacom Package is selected in Order or not. it's for multiple service in one individual BAN 	
					//Search root product. get product part num, package name.
					//search product partnum in LOV and get display val. if it is present then it will return display val.
					//to check same package check if 1.1
					//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
					with(objOrderItemBusComp)
					{
						ActivateField("Action Code");
						ActivateField("Part Number");
						ActivateField("Product Type");
						ActivateField("Parent Order Item Id");
						ActivateField("Product");
						SetViewMode(AllView);
						ClearToQuery();
						SetSearchSpec("Product Type", "Package");
						ExecuteQuery(ForwardOnly); 
						if( FirstRecord() )
						{
							vPackageName = GetFieldValue("Product");
							vPackagePartNum = GetFieldValue("Part Number");
							vPackagePartNumLic = objAppln.InvokeMethod("LookupValue", "STC_DATACOMM_PACKAGE_PARTNUM", vPackagePartNum);
							
							if( vProfile == "Datacom" && vDatcomPackage != "" && vDatcomPackage != vPackageName ) // 1.1
								objAppln.RaiseErrorText("You are eligible for selection of " + vDatcomPackage + " package only.");
								
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
					if(isDatacomPackage && (vOrderSubType == "Provide" || vOrderSubType == "Modify" )) // if isDatacomPackage
					{
						with(objOrderItemBusComp)
						{
							// Check for mandatory products
							ActivateField("Action Code");
							ActivateField("Part Number");
							SetViewMode(AllView);
							ClearToQuery();
							SetSearchExpr("[Action Code] <> 'Delete' AND ( [Part Number] LIKE '" + vSlaPartNum +"*' OR [Part Number] LIKE '" + vTenurePartNum +"*' OR [Part Number] LIKE '" + vCircuitSpeedPartNum +"*')");
							ExecuteQuery(ForwardOnly); 
							vRecCount = CountRecords();
							vRecCount = ToNumber(vRecCount);
							if( vRecCount < 3 ) 
							{
							//	objAppln.RaiseErrorText("SLA, Contract Tenure and Circuit Speed are mandatory products. Please select these products to proceed.");
							}
							// check for contract combination
							ClearToQuery();
							SetSearchExpr("( [Action Code] = 'Add' OR [Action Code] = 'Delete' ) AND ( [Part Number] = '" + vContractProd + "' OR [Part Number] = '" + vRelocationPart + "' OR [Part Number] LIKE '" + vHardwarePart +"*' )");
							ExecuteQuery(ForwardOnly); 
							vRecCount = CountRecords();
							vRecCount = ToNumber(vRecCount);
							if( vOrderSubType == "Provide" && vRecCount < 2 )
							{
							//	objAppln.RaiseErrorText("Please select a correct combination of products to invoke a contract.");
							}
							else if( vOrderSubType == "Modify" && vRecCount < 1 ) 
							{
							//	objAppln.RaiseErrorText("Please select a correct combination of products to invoke a contract.");
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
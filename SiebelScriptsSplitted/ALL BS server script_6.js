function AgeOnNetwork_New(Inputs,Outputs)
{
/**********************************************************************************************************
Purpose 		: Function called from Workflow Process  to  Set Number of Installments 
Author 			: GURURAJ MADHAVARAO
Change Log		: Changes made to the function
***********************************************************************************************************
Date(DD/MM/YYYY)	| By		| Description of Change																		
-----------------------------------------------------------------------------------------------------------
12/09/2019		1.0   | GURURAJ MADHAVARAO	| Modified for new CC Frame Work
13/01/2020		1.1   | NAVINKUMAR RAI	| Modified for MPOS ENHANCEMENTS
03/03/2020		1.2   | NAVINKUMAR RAI	| BR_Automation_Phase3
20/07/2020		1.3   |	GURURAJ MADHAVARAO	| Modified for new Experain Frame Work
03/10/2021		1.4	  | Indrasen Gaddam | Experaina Phase2A (bypass experian chk for Elite/Badpayee/VIP)
----------------------------------------------------------------------------------------------------------*/

	var AccountId="""", vDeviceId="""", sDeviceId="""", vCPR="""", veShop="""", ObjectId1="""";
	var vDefCardOcc="""", vDefSysOcc="""", vBirthDate="""";

	//Variables used for calculation and logic
	var vEmpname=null,vEmpCode=null,vEmpCat=null,vRCount=null,vOccp=null,vCardOccp=null,vNationality=null,vOccpCat=null,vSSpec=null,vAON=null,vElite=null,vBadPayee=null,vCustAge=null,vDeviceRRP=null,vNumIns=null,vNumDevice=null,vEligContrt=null,isRecord=null,vAONchk=0,vCustAgechk=null,vDeviceRRPchk=null,vNumAccDev=null,vExperain=""N"",vByPassExp=""N"";
	var vSANLoyalityTierClass="""", vCANElite="""", vVIP="""", vBadPayeeCust="""", ExperianCheck=""YES"", vLatePayeeFlag=""N"";
	var inp=TheApplication().NewPropertySet();
	var out=TheApplication().NewPropertySet();

	var QBS = TheApplication().GetService(""STC Siebel Operation BS"");
	var AccountBO=null, AccountBC=null,vCCMatrixBO=null,vCCMatrixBC=null;
	var vDeviceRRPVal=new Array(),i=0;

	with(Inputs)
	{
		AccountId = GetProperty(""AccountId"");
		vDeviceId = GetProperty(""Device Id"");
		sDeviceId = GetProperty(""sDeviceId"");//Jithin: Advance Payment SD
		vCPR = GetProperty(""CPR"");
		veShop = GetProperty(""EshopFlag"");
		ObjectId1 = GetProperty(""Object Id"");
		
		//[NAVIN:21Jan2020:AdvancePaymentAllocation-MPOSChanges]
		//vCustAge = GetProperty(""CustomerAge"");
		vBirthDate = GetProperty(""BirthDate"");
		vNationality = GetProperty(""Nationality"");
		vCardOccp = GetProperty(""CardOccupation"");
		vByPassExp = GetProperty(""ByPassExp"");
		vSANLoyalityTierClass = GetProperty(""SAN LoyalityTierClass"");
	}

	try
	{  
		vIsDevice = CheckDevice(ObjectId1);
		AccountBO=TheApplication().GetBusObject(""Account"");
		AccountBC=AccountBO.GetBusComp(""Account"");

		with(AccountBC)
		{
			SetViewMode(AllView);
			ActivateField(""Tax ID Number"");
			ActivateField(""Account Type Code"");
			ActivateField(""Household Head Occupation"");
			ActivateField(""STC Card Occupation"");
			ActivateField(""STC Account Created Date"");
			ActivateField(""Employer Name"");
			ActivateField(""Employer Number"");
			ActivateField(""Market Class"");
			ActivateField(""Customer Age On Network"");
			ActivateField(""STC Elite Count Calc"");
			ActivateField(""STC Cust Cat Cal1"");
			ActivateField(""STC VIP"");
			ActivateField(""STC BadDept Flag"");
			ActivateField(""STC Elite Count Calc"");
			ActivateField(""STC Late Payee BAN Calc"");
			ClearToQuery();
			if(AccountId==null || AccountId=='')
			{
				vSSpec=""[Tax ID Number]='""+vCPR+""' AND [Account Type Code]='""+TheApplication().InvokeMethod(""LookupValue"",""CUT_ACCOUNT_TYPE"", ""Customer"")+""'"";
			}
			else
			{
				vSSpec=""[Id]='""+AccountId+""'"";
			}
			SetSearchExpr(vSSpec);
			ExecuteQuery(ForwardOnly);
			isRecord = FirstRecord(); 
			if(isRecord)
			{
				if(AccountId==null || AccountId=='')
				{
					AccountId=GetFieldValue(""Id"");
				}
				vVIP = GetFieldValue(""STC VIP"");
				vBadPayeeCust = GetFieldValue(""STC BadDept Flag"");
				vCANElite = GetFieldValue(""STC Elite Count Calc"");
				vLatePayeeFlag = GetFieldValue(""STC Late Payee BAN Calc"");
				//if(vVIP == ""Y"" || vBadPayeeCust == ""Y"" || vCANElite == ""Y"")//REV-1.4-Indrasen
				if(vVIP == ""Y"" || vLatePayeeFlag == ""Y"" || vCANElite == ""Y"")//[NAVIN:02Feb2022:Fix]
				{
					vByPassExp = ""Y"";
					ExperianCheck = ""SKIP"";
				}
				// Call Experain function
				Inputs.SetProperty(""vAccountId"",AccountId);
				vExperain=ExperianAPI(Inputs,Outputs);
				if(vExperain==""N"" || (vExperain==""Y"" && vByPassExp==""Y""))
				{
					vEmpname=GetFieldValue(""Employer Name"");
					vEmpCode=GetFieldValue(""Employer Number"");
					if(vEmpCode==null || vEmpCode == '')
					{
						vEmpCat=TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""EMP_CAT"");
					}
					else
					{
						//Get Employer Category
						//vSSpec=""[Employer Name]='""+vEmpname+""' AND [Employer Code]='""+vEmpCode+""'"";
						vSSpec=""[Employer Code]='""+vEmpCode+""'"";
						with(inp){
							SetProperty(""BusinessObject"",""STC Customer Classification BO"");
							SetProperty(""BusinessComponent"",""STC Employee Category Matrix"");
							SetProperty(""SearchExpression"",vSSpec);
							SetProperty(""Field0"",""Employer Category"");
						}
						QBS.InvokeMethod(""SiebelQuery"",inp,out);
						vRCount=out.GetProperty(""RecordCount"");
						if(vRCount > 0)
						{
							vEmpCat=out.GetProperty(""Output0"");
						}
						else
						{
							vEmpCat=TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""EMP_CAT"");
						}
						inp.Reset();
						out.Reset();
					}
					vOccp=GetFieldValue(""Household Head Occupation"");
					vCardOccp=GetFieldValue(""STC Card Occupation"");
					vNationality=GetFieldValue(""Market Class"");
					if(vNationality==null || vNationality=='')
					{
						vNationality=TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""NATIONALITY"");
					}
					if(vNationality==TheApplication().InvokeMethod(""LookupValue"",""STC_CUST_CLASS_TYPE"",""Foreigner""))
					{
						vNationality=""Expats"";
					}
					else
					{
						vNationality=""Bahraini"";
					}
					//Get Occupation Category
					//[NAVIN:03Mar2020:BR_Automation_Phase3]
					vOccpCat = GetOccupationCategory_NEWBR(vNationality, vEmpCat, vOccp);
					
					//TheApplication().RaiseErrorText(vNationality+"":""+vEmpCat+"":""+vOccp+"":""+vOccpCat);

					vAON=GetFieldValue(""Customer Age On Network"");
					if(vAON < 36 && vAON >=24)
					{ 
						vAONchk=24;
					}
					else if(vAON < 24 && vAON >=11)
					{
						vAONchk=11;
					}
					else if(vAON < 11 && vAON >=6)
					{
						vAONchk=6;
					}
					else if(vAON < 6 && vAON >=0)
					{
						vAONchk=0;
					}
					else
					{
						vAONchk=36;
					}
					vElite=GetFieldValue(""STC Elite Count Calc"");
					if(vElite==""Y"")
					{
						vElite=""Elite"";
					}
					else
					{
						vElite=""Not Elite"";
					}
					vBadPayee=GetFieldValue(""STC Cust Cat Cal1"");
					if(vBadPayee==""Bad"")
					{
						vBadPayee=""Bad Payee"";
					}
					else
					{
						vBadPayee=""Not Bad Payee"";
					}

					vCustAge=GetCustomerAge(AccountId, vBirthDate);
					if(vCustAge >=30)
					{
						vCustAgechk=30;
					}
					else if(vCustAge < 30)
					{
						vCustAgechk=29;
					}
					if(vDeviceId.length>0)
					{
						vDeviceRRP=GetDeviceRRP(vDeviceId);
					}
					else
					{
						vDeviceRRP=GetDeviceRRP(vDeviceProdId);
					}

					//Get Advance Payments and Device Installments
					inp.Reset();
					out.Reset();
					if(veShop == ""Y"")
					{
						vSSpec=""[Occupation Category] = '""+vOccpCat+""' AND [AON] = '""+vAONchk+""' AND [Bad Payee Status] ='""+vBadPayee+""' AND [Elite Status] ='""+vElite+""' AND [Customer Age] = '""+vCustAgechk+""'"";
						with(Outputs){
							SetProperty(""SearchSpec"",vSSpec);
							SetProperty(""Occupation Category"",vOccpCat);
							SetProperty(""AON"",vAONchk);
							SetProperty(""Bad Payee Status"",vBadPayee);
							SetProperty(""Elite Status"",vElite);
							SetProperty(""Customer Age"",vCustAgechk);
							SetProperty(""ExperianFlag"",vExperain);
							SetProperty(""ExperianCheck"",ExperianCheck);	//REV-1.4-Indrasen

							SetProperty(""Nationality"",vNationality);
							SetProperty(""EmployerCategory"",vEmpCat);
							SetProperty(""SystemOccupation"",vOccp);
							SetProperty(""DeviceRRP"",vDeviceRRP);
						}
					}
					else
					{
						vCCMatrixBO=TheApplication().GetBusObject(""STC Customer Classification BO"");
						vCCMatrixBC=vCCMatrixBO.GetBusComp(""STC New Customer Classification Matrix"");
						with(vCCMatrixBC)
						{
							ActivateField(""Occupation Category"");
							ActivateField(""AON"");
							ActivateField(""Bad Payee Status"");
							ActivateField(""Elite Status"");
							ActivateField(""Customer Age"");
							ActivateField(""Eligible 24M Contract"");
							ActivateField(""No of Advance Payments"");
							ActivateField(""No of Accessory Dev Elig"");
							ActivateField(""Device RRP"");
							ActivateField(""No of Device Eligible"");
							vSSpec=""[Occupation Category] = '""+vOccpCat+""' AND [AON] = '""+vAONchk+""' AND [Bad Payee Status] ='""+vBadPayee+""' AND [Elite Status] ='""+vElite+""' AND [Customer Age] = '""+vCustAgechk+""'"";
							ClearToQuery();
							SetSearchExpr(vSSpec);
							ExecuteQuery(ForwardOnly);
							isRecord=FirstRecord();
							while(isRecord)
							{
								vDeviceRRPVal[i]=GetFieldValue(""Device RRP"");
								with(out){
									SetProperty(""vEligContrt"",GetFieldValue(""Eligible 24M Contract""));
									SetProperty(""vNumIns"",GetFieldValue(""No of Advance Payments""));
									SetProperty(""vNumDevice"",GetFieldValue(""No of Device Eligible""));
									SetProperty(""vNumAccDev"",GetFieldValue(""No of Accessory Dev Elig""));
								}
								inp.AddChild(out.Copy());
								out.Reset();
								isRecord=NextRecord();
								i++;
							}
							if(ToNumber(vDeviceRRPVal[0]) < ToNumber(vDeviceRRPVal[1]))
							{
								vDeviceRRPchk=vDeviceRRPVal[0];
								if(ToNumber(vDeviceRRP) <= vDeviceRRPchk)
								{
									vDeviceRRPchk=vDeviceRRPVal[0];
									vEligContrt=inp.GetChild(0).GetProperty(""vEligContrt"");
									vNumIns=inp.GetChild(0).GetProperty(""vNumIns"");
									vNumDevice=inp.GetChild(0).GetProperty(""vNumDevice"");
									vNumAccDev=inp.GetChild(0).GetProperty(""vNumAccDev"");

								}
								else 
								{
									vDeviceRRPchk=vDeviceRRPVal[1];
									if(ToNumber(vDeviceRRP) >= vDeviceRRPchk)
									{
										vEligContrt=inp.GetChild(1).GetProperty(""vEligContrt"");
										vNumIns=inp.GetChild(1).GetProperty(""vNumIns"");
										vNumDevice=inp.GetChild(1).GetProperty(""vNumDevice"");
										vNumAccDev=inp.GetChild(1).GetProperty(""vNumAccDev"");
									}
								}
							}
							else 
							{
								vDeviceRRPchk=vDeviceRRPVal[1];
								if(ToNumber(vDeviceRRP) <= vDeviceRRPchk)
								{
									vDeviceRRPchk=vDeviceRRPVal[1];
									vEligContrt=inp.GetChild(1).GetProperty(""vEligContrt"");
									vNumIns=inp.GetChild(1).GetProperty(""vNumIns"");
									vNumDevice=inp.GetChild(1).GetProperty(""vNumDevice"");
									vNumAccDev=inp.GetChild(1).GetProperty(""vNumAccDev"");
								}
								else 
								{
									vDeviceRRPchk=vDeviceRRPVal[0];
									if(ToNumber(vDeviceRRP) >= vDeviceRRPchk)
									{
										vEligContrt=inp.GetChild(0).GetProperty(""vEligContrt"");
										vNumIns=inp.GetChild(0).GetProperty(""vNumIns"");
										vNumDevice=inp.GetChild(0).GetProperty(""vNumDevice"");
										vNumAccDev=inp.GetChild(0).GetProperty(""vNumAccDev"");
									}
								}
							}

						}
						//if(vDeviceId.length == 0)//Jithin: Commented for advance payment SD
						if(ObjectId1 !="""" && ObjectId1!= null)
						NumberOfInstalment(null,null,null,vNumIns,ObjectId1,vIsDevice,vDeviceId, sDeviceId);
						with(Outputs){
							SetProperty(""NewDeviceFlag"",vIsDevice);
							SetProperty(""DevAllowed"",vNumDevice);
							SetProperty(""ContractElig"",vEligContrt);
							SetProperty(""AccAllowed"",vNumAccDev);
							SetProperty(""NumOfInstalment"",vNumIns);
							
							//[NAVIN:12Mar2020:Added for Testing]
							SetProperty(""Nationality"",vNationality);
							SetProperty(""EmployerCategory"",vEmpCat);
							SetProperty(""SystemOccupation"",vOccp);
							SetProperty(""Occupation Category"",vOccpCat);
							SetProperty(""AON"",vAONchk);
							SetProperty(""Bad Payee Status"",vBadPayee);
							SetProperty(""Elite Status"",vElite);
							SetProperty(""Customer Age"",vCustAgechk);
							SetProperty(""DeviceRRP"",vDeviceRRP);
							SetProperty(""ExperianFlag"",vExperain);
							SetProperty(""ExperianCheck"",ExperianCheck);	//REV-1.4-Indrasen
						}
					}//End else-eshop flag
				}//End Experain Flag==""N""
				
			
			}//End isRecord--Account BC
			else
			{//[NAVIN: 21Jan2020: Get Details for New Customer for MPOS]
				if(veShop == ""Y"" && vExperain==""N"")
				{
					vEmpCat=TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""EMP_CAT"");

					if(vNationality == null || vNationality == '')
					{
						vNationality=TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""NATIONALITY"");
					}
					if(vNationality == ""Bahraini""){
						vNationality = ""Bahraini"";
					}
					else{
						vNationality = ""Expats"";
					}

					inp.Reset();
					out.Reset();
					vDefCardOcc = TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""SMART_CARD_OCC"");
					vDefSysOcc = TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""SYSTEM_OCC"");

					vRCount=0;
					if(vCardOccp == null || vCardOccp == """")
						vCardOccp = vDefCardOcc;

					vSSpec=""[Card Occupation]='""+vCardOccp+""'"";
					with(inp){
						SetProperty(""BusinessObject"",""STC Custom Occupation BO"");
						SetProperty(""BusinessComponent"",""STC Custom Occupation BC"");
						SetProperty(""SearchExpression"",vSSpec);
						SetProperty(""Field0"",""System Occupation"");
						SetProperty(""Field1"",""Card Occupation"");
					}
					QBS.InvokeMethod(""SiebelQuery"",inp,out);
					vRCount=out.GetProperty(""RecordCount"");
					if(vRCount > 0)
					{
						vOccp=out.GetProperty(""Output0"");
					}
					if(vOccp == null || vOccp == """")
						vOccp = vDefSysOcc;

					//Get Occupation Category
					//[NAVIN:03Mar2020:BR_Automation_Phase3]
					vOccpCat = GetOccupationCategory_NEWBR(vNationality, vEmpCat, vOccp);

					vAONchk=0;
					vElite=""Not Elite"";
					vBadPayee=""Not Bad Payee"";
					vCustAge = GetCustomerAge(AccountId, vBirthDate);
					if(vCustAge >= 30){
						vCustAgechk=30;
					}
					else{
						vCustAgechk=29;
					}

					vSSpec=""[Occupation Category] = '""+vOccpCat+""' AND [AON] = '""+vAONchk+""' AND [Bad Payee Status] ='""+vBadPayee+""' AND [Elite Status] ='""+vElite+""' AND [Customer Age] = '""+vCustAgechk+""'"";
					with(Outputs){
						SetProperty(""SearchSpec"",vSSpec);
						SetProperty(""Occupation Category"",vOccpCat);
						SetProperty(""AON"",vAONchk);
						SetProperty(""Bad Payee Status"",vBadPayee);
						SetProperty(""Elite Status"",vElite);
						SetProperty(""Customer Age"",vCustAgechk);

						SetProperty(""Nationality"",vNationality);
						SetProperty(""EmployerCategory"",vEmpCat);
						SetProperty(""SystemOccupation"",vOccp);
						SetProperty(""DeviceRRP"",vDeviceRRP);
						SetProperty(""ExperianFlag"",vExperain);
						SetProperty(""ExperianCheck"",ExperianCheck);	//REV-1.4-Indrasen
					}
				}
				
			}

		}//End (withAccountBC)
}
catch(e)
{
	throw(e);
}
finally
{
	AccountBC=null; vCCMatrixBC=null;
	AccountBO=null; vCCMatrixBO=null;
}
}
function AgeOnNetwork_New(Inputs,Outputs)
{
/**********************************************************************************************************
Purpose 		: Function called from Workflow Process  to  Set Number of Installments 
Author 			: GURURAJ MADHAVARAO
Change Log		: Changes made to the function
***********************************************************************************************************
Date(DD/MM/YYYY)	| By		| Description of Change																		
-----------------------------------------------------------------------------------------------------------
12/09/2019		1.0   | GURURAJ MADHAVARAO	| Modified for new CC Frame Work
13/01/2020		1.1   | NAVINKUMAR RAI	| Modified for MPOS ENHANCEMENTS
03/03/2020		1.2   | NAVINKUMAR RAI	| BR_Automation_Phase3
20/07/2020		1.3   |	GURURAJ MADHAVARAO	| Modified for new Experain Frame Work
----------------------------------------------------------------------------------------------------------*/

	var AccountId="""", vDeviceId="""", sDeviceId="""", vCPR="""", veShop="""", ObjectId1="""";
	var vDefCardOcc="""", vDefSysOcc="""", vBirthDate="""";

	//Variables used for calculation and logic
	var vEmpname=null,vEmpCode=null,vEmpCat=null,vRCount=null,vOccp=null,vCardOccp=null,vNationality=null,vOccpCat=null,vSSpec=null,vAON=null,vElite=null,vBadPayee=null,vCustAge=null,vDeviceRRP=null,vNumIns=null,vNumDevice=null,vEligContrt=null,isRecord=null,vAONchk=0,vCustAgechk=null,vDeviceRRPchk=null,vNumAccDev=null,vExperain=""N"",vByPassExp=""N"";
	var inp=TheApplication().NewPropertySet();
	var out=TheApplication().NewPropertySet();

	var QBS = TheApplication().GetService(""STC Siebel Operation BS"");
	var AccountBO=null, AccountBC=null,vCCMatrixBO=null,vCCMatrixBC=null;
	var vDeviceRRPVal=new Array(),i=0;

	with(Inputs)
	{
		AccountId = GetProperty(""AccountId"");
		vDeviceId = GetProperty(""Device Id"");
		sDeviceId = GetProperty(""sDeviceId"");//Jithin: Advance Payment SD
		vCPR = GetProperty(""CPR"");
		veShop = GetProperty(""EshopFlag"");
		ObjectId1 = GetProperty(""Object Id"");
		
		//[NAVIN:21Jan2020:AdvancePaymentAllocation-MPOSChanges]
		//vCustAge = GetProperty(""CustomerAge"");
		vBirthDate = GetProperty(""BirthDate"");
		vNationality = GetProperty(""Nationality"");
		vCardOccp = GetProperty(""CardOccupation"");
		vByPassExp = GetProperty(""ByPassExp"");
	}

	try
	{  
		vIsDevice = CheckDevice(ObjectId1);
		AccountBO=TheApplication().GetBusObject(""Account"");
		AccountBC=AccountBO.GetBusComp(""Account"");

		with(AccountBC)
		{
			SetViewMode(AllView);
			ActivateField(""Tax ID Number"");
			ActivateField(""Account Type Code"");
			ActivateField(""Household Head Occupation"");
			ActivateField(""STC Card Occupation"");
			ActivateField(""STC Account Created Date"");
			ActivateField(""Employer Name"");
			ActivateField(""Employer Number"");
			ActivateField(""Market Class"");
			ActivateField(""Customer Age On Network"");
			ActivateField(""STC Elite Count Calc"");
			ActivateField(""STC Cust Cat Cal1"");
			ClearToQuery();
			if(AccountId==null || AccountId=='')
			{
				vSSpec=""[Tax ID Number]='""+vCPR+""' AND [Account Type Code]='""+TheApplication().InvokeMethod(""LookupValue"",""CUT_ACCOUNT_TYPE"", ""Customer"")+""'"";
			}
			else
			{
				vSSpec=""[Id]='""+AccountId+""'"";
			}
			SetSearchExpr(vSSpec);
			ExecuteQuery(ForwardOnly);
			isRecord = FirstRecord(); 
			if(isRecord)
			{
				if(AccountId==null || AccountId=='')
				{
					AccountId=GetFieldValue(""Id"");
				}
				
				// Call Experain function
				Inputs.SetProperty(""vAccountId"",AccountId);
				vExperain=ExperianAPI(Inputs,Outputs);
				if(vExperain==""N"" || (vExperain==""Y"" && vByPassExp==""Y""))
				{
					vEmpname=GetFieldValue(""Employer Name"");
					vEmpCode=GetFieldValue(""Employer Number"");
					if(vEmpCode==null || vEmpCode == '')
					{
						vEmpCat=TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""EMP_CAT"");
					}
					else
					{
						//Get Employer Category
						//vSSpec=""[Employer Name]='""+vEmpname+""' AND [Employer Code]='""+vEmpCode+""'"";
						vSSpec=""[Employer Code]='""+vEmpCode+""'"";
						with(inp){
							SetProperty(""BusinessObject"",""STC Customer Classification BO"");
							SetProperty(""BusinessComponent"",""STC Employee Category Matrix"");
							SetProperty(""SearchExpression"",vSSpec);
							SetProperty(""Field0"",""Employer Category"");
						}
						QBS.InvokeMethod(""SiebelQuery"",inp,out);
						vRCount=out.GetProperty(""RecordCount"");
						if(vRCount > 0)
						{
							vEmpCat=out.GetProperty(""Output0"");
						}
						else
						{
							vEmpCat=TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""EMP_CAT"");
						}
						inp.Reset();
						out.Reset();
					}
					vOccp=GetFieldValue(""Household Head Occupation"");
					vCardOccp=GetFieldValue(""STC Card Occupation"");
					vNationality=GetFieldValue(""Market Class"");
					if(vNationality==null || vNationality=='')
					{
						vNationality=TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""NATIONALITY"");
					}
					if(vNationality==TheApplication().InvokeMethod(""LookupValue"",""STC_CUST_CLASS_TYPE"",""Foreigner""))
					{
						vNationality=""Expats"";
					}
					else
					{
						vNationality=""Bahraini"";
					}
					//Get Occupation Category
					//[NAVIN:03Mar2020:BR_Automation_Phase3]
					vOccpCat = GetOccupationCategory_NEWBR(vNationality, vEmpCat, vOccp);
					
					//TheApplication().RaiseErrorText(vNationality+"":""+vEmpCat+"":""+vOccp+"":""+vOccpCat);

					vAON=GetFieldValue(""Customer Age On Network"");
					if(vAON < 36 && vAON >=24)
					{ 
						vAONchk=24;
					}
					else if(vAON < 24 && vAON >=11)
					{
						vAONchk=11;
					}
					else if(vAON < 11 && vAON >=6)
					{
						vAONchk=6;
					}
					else if(vAON < 6 && vAON >=0)
					{
						vAONchk=0;
					}
					else
					{
						vAONchk=36;
					}
					vElite=GetFieldValue(""STC Elite Count Calc"");
					if(vElite==""Y"")
					{
						vElite=""Elite"";
					}
					else
					{
						vElite=""Not Elite"";
					}
					vBadPayee=GetFieldValue(""STC Cust Cat Cal1"");
					if(vBadPayee==""Bad"")
					{
						vBadPayee=""Bad Payee"";
					}
					else
					{
						vBadPayee=""Not Bad Payee"";
					}

					vCustAge=GetCustomerAge(AccountId, vBirthDate);
					if(vCustAge >=30)
					{
						vCustAgechk=30;
					}
					else if(vCustAge < 30)
					{
						vCustAgechk=29;
					}
					if(vDeviceId.length>0)
					{
						vDeviceRRP=GetDeviceRRP(vDeviceId);
					}
					else
					{
						vDeviceRRP=GetDeviceRRP(vDeviceProdId);
					}

					//Get Advance Payments and Device Installments
					inp.Reset();
					out.Reset();
					if(veShop == ""Y"")
					{
						vSSpec=""[Occupation Category] = '""+vOccpCat+""' AND [AON] = '""+vAONchk+""' AND [Bad Payee Status] ='""+vBadPayee+""' AND [Elite Status] ='""+vElite+""' AND [Customer Age] = '""+vCustAgechk+""'"";
						with(Outputs){
							SetProperty(""SearchSpec"",vSSpec);
							SetProperty(""Occupation Category"",vOccpCat);
							SetProperty(""AON"",vAONchk);
							SetProperty(""Bad Payee Status"",vBadPayee);
							SetProperty(""Elite Status"",vElite);
							SetProperty(""Customer Age"",vCustAgechk);
							SetProperty(""ExperianFlag"",vExperain);

							SetProperty(""Nationality"",vNationality);
							SetProperty(""EmployerCategory"",vEmpCat);
							SetProperty(""SystemOccupation"",vOccp);
							SetProperty(""DeviceRRP"",vDeviceRRP);
						}
					}
					else
					{
						vCCMatrixBO=TheApplication().GetBusObject(""STC Customer Classification BO"");
						vCCMatrixBC=vCCMatrixBO.GetBusComp(""STC New Customer Classification Matrix"");
						with(vCCMatrixBC)
						{
							ActivateField(""Occupation Category"");
							ActivateField(""AON"");
							ActivateField(""Bad Payee Status"");
							ActivateField(""Elite Status"");
							ActivateField(""Customer Age"");
							ActivateField(""Eligible 24M Contract"");
							ActivateField(""No of Advance Payments"");
							ActivateField(""No of Accessory Dev Elig"");
							ActivateField(""Device RRP"");
							ActivateField(""No of Device Eligible"");
							vSSpec=""[Occupation Category] = '""+vOccpCat+""' AND [AON] = '""+vAONchk+""' AND [Bad Payee Status] ='""+vBadPayee+""' AND [Elite Status] ='""+vElite+""' AND [Customer Age] = '""+vCustAgechk+""'"";
							ClearToQuery();
							SetSearchExpr(vSSpec);
							ExecuteQuery(ForwardOnly);
							isRecord=FirstRecord();
							while(isRecord)
							{
								vDeviceRRPVal[i]=GetFieldValue(""Device RRP"");
								with(out){
									SetProperty(""vEligContrt"",GetFieldValue(""Eligible 24M Contract""));
									SetProperty(""vNumIns"",GetFieldValue(""No of Advance Payments""));
									SetProperty(""vNumDevice"",GetFieldValue(""No of Device Eligible""));
									SetProperty(""vNumAccDev"",GetFieldValue(""No of Accessory Dev Elig""));
								}
								inp.AddChild(out.Copy());
								out.Reset();
								isRecord=NextRecord();
								i++;
							}
							if(ToNumber(vDeviceRRPVal[0]) < ToNumber(vDeviceRRPVal[1]))
							{
								vDeviceRRPchk=vDeviceRRPVal[0];
								if(ToNumber(vDeviceRRP) <= vDeviceRRPchk)
								{
									vDeviceRRPchk=vDeviceRRPVal[0];
									vEligContrt=inp.GetChild(0).GetProperty(""vEligContrt"");
									vNumIns=inp.GetChild(0).GetProperty(""vNumIns"");
									vNumDevice=inp.GetChild(0).GetProperty(""vNumDevice"");
									vNumAccDev=inp.GetChild(0).GetProperty(""vNumAccDev"");

								}
								else 
								{
									vDeviceRRPchk=vDeviceRRPVal[1];
									if(ToNumber(vDeviceRRP) >= vDeviceRRPchk)
									{
										vEligContrt=inp.GetChild(1).GetProperty(""vEligContrt"");
										vNumIns=inp.GetChild(1).GetProperty(""vNumIns"");
										vNumDevice=inp.GetChild(1).GetProperty(""vNumDevice"");
										vNumAccDev=inp.GetChild(1).GetProperty(""vNumAccDev"");
									}
								}
							}
							else 
							{
								vDeviceRRPchk=vDeviceRRPVal[1];
								if(ToNumber(vDeviceRRP) <= vDeviceRRPchk)
								{
									vDeviceRRPchk=vDeviceRRPVal[1];
									vEligContrt=inp.GetChild(1).GetProperty(""vEligContrt"");
									vNumIns=inp.GetChild(1).GetProperty(""vNumIns"");
									vNumDevice=inp.GetChild(1).GetProperty(""vNumDevice"");
									vNumAccDev=inp.GetChild(1).GetProperty(""vNumAccDev"");
								}
								else 
								{
									vDeviceRRPchk=vDeviceRRPVal[0];
									if(ToNumber(vDeviceRRP) >= vDeviceRRPchk)
									{
										vEligContrt=inp.GetChild(0).GetProperty(""vEligContrt"");
										vNumIns=inp.GetChild(0).GetProperty(""vNumIns"");
										vNumDevice=inp.GetChild(0).GetProperty(""vNumDevice"");
										vNumAccDev=inp.GetChild(0).GetProperty(""vNumAccDev"");
									}
								}
							}

						}
						//if(vDeviceId.length == 0)//Jithin: Commented for advance payment SD
						if(ObjectId1 !="""" && ObjectId1!= null)
						NumberOfInstalment(null,null,null,vNumIns,ObjectId1,vIsDevice,vDeviceId, sDeviceId);
						with(Outputs){
							SetProperty(""NewDeviceFlag"",vIsDevice);
							SetProperty(""DevAllowed"",vNumDevice);
							SetProperty(""ContractElig"",vEligContrt);
							SetProperty(""AccAllowed"",vNumAccDev);
							SetProperty(""NumOfInstalment"",vNumIns);
							
							//[NAVIN:12Mar2020:Added for Testing]
							SetProperty(""Nationality"",vNationality);
							SetProperty(""EmployerCategory"",vEmpCat);
							SetProperty(""SystemOccupation"",vOccp);
							SetProperty(""Occupation Category"",vOccpCat);
							SetProperty(""AON"",vAONchk);
							SetProperty(""Bad Payee Status"",vBadPayee);
							SetProperty(""Elite Status"",vElite);
							SetProperty(""Customer Age"",vCustAgechk);
							SetProperty(""DeviceRRP"",vDeviceRRP);
							SetProperty(""ExperianFlag"",vExperain);
						}
					}//End else-eshop flag
				}//End Experain Flag==""N""
				
			
			}//End isRecord--Account BC
			else
			{//[NAVIN: 21Jan2020: Get Details for New Customer for MPOS]
				if(veShop == ""Y"" && vExperain==""N"")
				{
					vEmpCat=TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""EMP_CAT"");

					if(vNationality == null || vNationality == '')
					{
						vNationality=TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""NATIONALITY"");
					}
					if(vNationality == ""Bahraini""){
						vNationality = ""Bahraini"";
					}
					else{
						vNationality = ""Expats"";
					}

					inp.Reset();
					out.Reset();
					vDefCardOcc = TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""SMART_CARD_OCC"");
					vDefSysOcc = TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""SYSTEM_OCC"");

					vRCount=0;
					if(vCardOccp == null || vCardOccp == """")
						vCardOccp = vDefCardOcc;

					vSSpec=""[Card Occupation]='""+vCardOccp+""'"";
					with(inp){
						SetProperty(""BusinessObject"",""STC Custom Occupation BO"");
						SetProperty(""BusinessComponent"",""STC Custom Occupation BC"");
						SetProperty(""SearchExpression"",vSSpec);
						SetProperty(""Field0"",""System Occupation"");
						SetProperty(""Field1"",""Card Occupation"");
					}
					QBS.InvokeMethod(""SiebelQuery"",inp,out);
					vRCount=out.GetProperty(""RecordCount"");
					if(vRCount > 0)
					{
						vOccp=out.GetProperty(""Output0"");
					}
					if(vOccp == null || vOccp == """")
						vOccp = vDefSysOcc;

					//Get Occupation Category
					//[NAVIN:03Mar2020:BR_Automation_Phase3]
					vOccpCat = GetOccupationCategory_NEWBR(vNationality, vEmpCat, vOccp);

					vAONchk=0;
					vElite=""Not Elite"";
					vBadPayee=""Not Bad Payee"";
					vCustAge = GetCustomerAge(AccountId, vBirthDate);
					if(vCustAge >= 30){
						vCustAgechk=30;
					}
					else{
						vCustAgechk=29;
					}

					vSSpec=""[Occupation Category] = '""+vOccpCat+""' AND [AON] = '""+vAONchk+""' AND [Bad Payee Status] ='""+vBadPayee+""' AND [Elite Status] ='""+vElite+""' AND [Customer Age] = '""+vCustAgechk+""'"";
					with(Outputs){
						SetProperty(""SearchSpec"",vSSpec);
						SetProperty(""Occupation Category"",vOccpCat);
						SetProperty(""AON"",vAONchk);
						SetProperty(""Bad Payee Status"",vBadPayee);
						SetProperty(""Elite Status"",vElite);
						SetProperty(""Customer Age"",vCustAgechk);

						SetProperty(""Nationality"",vNationality);
						SetProperty(""EmployerCategory"",vEmpCat);
						SetProperty(""SystemOccupation"",vOccp);
						SetProperty(""DeviceRRP"",vDeviceRRP);
						SetProperty(""ExperianFlag"",vExperain);
					}
				}
				
			}

		}//End (withAccountBC)
}
catch(e)
{
	throw(e);
}
finally
{
	AccountBC=null; vCCMatrixBC=null;
	AccountBO=null; vCCMatrixBO=null;
}
}
"/**********************************************************************************************************
Purpose 		: Function called from Workflow Process  to  Set Number of Installments 
Author 			: SUMAN KANUMURI
Change Log		: Changes made to the function
***********************************************************************************************************
Date(DD/MM/YYYY)	| By		| Description of Change																		
-----------------------------------------------------------------------------------------------------------
05/07/2016		1.0   | SUMAN KANUMURI	| Modified to add more Number of Months Options 24 and 36 Months
----------------------------------------------------------------------------------------------------------*/
function AgeonNetwork(Inputs,Outputs)
{
var AppObj=TheApplication(); 
var AccountId =Inputs.GetProperty(""AccountId"");
var ObjectId1 =Inputs.GetProperty(""Object Id"");
var PlanCat= Inputs.GetProperty(""PlanCat"");
var Masterid, vContractCat, vType= ""OCCUPATION"", sServiceType;
var TwoYrMonths, ThrYrMonths;
var ListBO=null, ListBC=null, AccountBO=null, AccountBC=null;  
var oInvoiceBO=null, oInvoiceBC=null, oCustomBO=null, oCustomBC=null, oCustomBC2=null, isRecord1;
var dCurrDate,sSysdate,Contractcat,NumLineCalc,NumLines,Occupation,AccStartDate,sDiffTime,sDiffTime1= ""0"";
var ExisCust, ExisIns, NewCust, NewIns;
var BadCus,DunnDate,ContractCat;
var NumMonths,NumEligCon=0, dunflg=""N"";
var CustCat;
var DunniDays = AppObj.InvokeMethod(""LookupValue"",""STC_CC_DUN"",""CCBADDays"");
var sMaxNumMonths; //Customer Classification-Adjustments SD
//TheApplication().SetProfileAttr(""CreateAct"",""Yes"");
try
{  
	vIsDevice = CheckDevice(ObjectId1); // 22/10/2014 Anchal: Created to Set Installment as 0 for Basic Plans without Installment Product for Advance Payment Calculation
	ListBO = AppObj.GetBusObject(""List Of Values"");
	ListBC = ListBO.GetBusComp(""List Of Values"");
	AccountBO=AppObj.GetBusObject(""Account"");
	AccountBC=AccountBO.GetBusComp(""Account""); 
	oInvoiceBO=AppObj.GetBusObject(""STC Billing Account"");
	oInvoiceBC=oInvoiceBO.GetBusComp(""CUT Invoice Sub Accounts"");
	oCustomBO =AppObj.GetBusObject(""STC Custmer Admin BO"");
	oCustomBC=oCustomBO.GetBusComp(""STC Custmer Admin BC"");
	dCurrDate = new Date(); 
	sSysdate = dCurrDate.getTime();
	
	/*[01Nov2015][NAVINR][SD: Customer Classification Device Category]*/
	oCustomBC2=oCustomBO.GetBusComp(""STC Custmer Admin BC"");
	var DeviceCat= Inputs.GetProperty(""DeviceCat"");
	var vDefaultDeviceCat = 1, ContractCat1="""";
	if (DeviceCat=="""" || DeviceCat == null)
		DeviceCat = vDefaultDeviceCat;
	
	 with(AccountBC){
		 SetViewMode(AllView);
		 ActivateField(""Tax ID Number"");
		 ActivateField(""Survey Type"");
		 ActivateField(""Input On"");
		 ActivateField(""STC Num Sub"");  
		// ActivateField(""STC Num of Lines"");
		 ActivateField(""STC Contract Category""); 
		 ActivateField(""Account Created""); 
		// ActivateField(""STC Num of Inst""); SUMANK Inactivated as this field is not part of Account BC
		 ActivateField(""Household Head Occupation"");
		 ActivateField(""STC Account Created Date"");
		 ActivateField(""STC CAN Susp Date""); 
		 ActivateField(""STC CAN Susp Reason"");
		 ActivateField(""STC Cust Cat Cal1"");
		 ClearToQuery();
		 SetSearchSpec(""Id"",AccountId);
		 ExecuteQuery(ForwardOnly);
		 isRecord = FirstRecord(); 
		    if(isRecord){
				 Contractcat = GetFieldValue(""STC Contract Category"");
				 CustCat = GetFieldValue(""STC Cust Cat Cal1"");
				 NumLineCalc =GetFieldValue(""STC Num Sub"");
				// NumLines =GetFieldValue(""STC Num of Lines"");
				 Occupation =GetFieldValue(""Household Head Occupation"");
				 ///Praveen Customer Clasifaction
				 AccStartDate =GetFieldValue(""STC Account Created Date"");
				 if(AccStartDate == null || AccStartDate == '' || AccStartDate == """")
				 {
				 	AccStartDate = new Date();
				 }
				 DunnDate=GetFieldValue(""STC CAN Susp Date"");
 				/////////////////////////////////////
				 if(AccStartDate!=""""){
					 AccStartDate = new Date(AccStartDate);
					 AccStartDate = AccStartDate.getTime();
					 sDiffTime = sSysdate - AccStartDate;
					 sDiffTime1=sDiffTime/86400000; 
					 sDiffTime1=sDiffTime1/30;
					 sDiffTime1=Math.round(sDiffTime1); 
				 }//endif AccStartDate!=""""
				 
				 ///////////////////////////////////// 
				 if(DunnDate!=""""){ 
				 	 DunnDate=new Date(DunnDate);
					 DunnDate=DunnDate.getTime();
					 DunnDate=sSysdate-DunnDate;
					 DunnDate=DunnDate/86400000;
					 DunnDate=Math.round(DunnDate);
				 }//endif DunnDate
				 //////////////////////////////////// 
				 with(ListBC){
				    ActivateField(""Type"");    //Type
				    ActivateField(""Value"");   //Display Value
				    ActivateField(""Name"");    //Language Independent Code
				    ActivateField(""High"");
				    ActivateField(""Low"");
				    ActivateField(""Description"");// Description
				    ClearToQuery();
				    SetViewMode(AllView);  
				    SetSearchSpec(""Type"",vType);
				    SetSearchSpec(""Value"",Occupation);        
				    ExecuteQuery(ForwardOnly);
				    var isRecord = FirstRecord();
				    if(isRecord){
				    	ContractCat1 =GetFieldValue(""Low"");
				    }
				    //NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,ObjectId1);
				  }//withlistbc
				  with(oCustomBC){
					 SetViewMode(AllView);
					 ActivateField(""Contract Category"");
					 ActivateField(""Exis Cust"");
					 ActivateField(""Exis Inst"");
					 ActivateField(""New Cust"");
					 ActivateField(""New Inst"");
					 ActivateField(""Bad Customer"");
					 ActivateField(""Number Of Months"");					
					 ActivateField(""Old Cust"");
					 ActivateField(""Old Inst"");
					 //Added for Customer Classification-Adjustments SD below
					 ActivateField(""Max Number Of Months""); 
					 ActivateField(""Old Customer Devices"");
					 ActivateField(""Old Customer Installments"");
//below 1.0
					 ActivateField(""STC Three Year Inst"");
					 ActivateField(""STC Three Year Devices"");
					 ActivateField(""STC Two Year Devices"");
					 ActivateField(""STC Two Year Inst"");
					 ActivateField(""STC Three Year Month"");
					 ActivateField(""STC Two Year Month"");
//above 1.0					 
					 //Added for Customer Classification-Adjustments SD above
					 /*[01Nov2015][NAVINR][SD: Customer Classification Device Category]*/
					 ActivateField(""STC Device Category"");
					 
					 ClearToQuery();
					 SetSearchSpec(""Contract Category"",ContractCat1); 
					 SetSearchSpec(""Old Cust"",PlanCat);
					 /*[01Nov2015][NAVINR][SD: Customer Classification Device Category]*/
					 SetSearchSpec(""STC Device Category"",DeviceCat);
					 
					 ExecuteQuery(ForwardOnly);
					 isRecord1 = FirstRecord();
					 if(isRecord1)
					 {
						 ContractCat=GetFieldValue(""Contract Category"");
						 NumMonths=GetFieldValue(""Number Of Months"");
						 sMaxNumMonths = GetFieldValue(""Max Number Of Months"");//Added for Customer Classification-Adjustments SD
						 BadCus=GetFieldValue(""Bad Customer""); 
						 PlanCat=GetFieldValue(""Old Cust"");
								 TwoYrMonths = GetFieldValue(""STC Two Year Month"");
								 ThrYrMonths = GetFieldValue(""STC Three Year Month"");
						///////////////Category ""1""///////////////

					//	if(DunnDate!=""""){
						  //if(DunnDate > 59*24*60*60*1000 && (ContractCat ==""1"" || ContractCat ==""2"" || ContractCat ==""3"" || ContractCat ==""4""))
						//	if(DunnDate < DunniDays && (ContractCat ==""1"" || ContractCat ==""2"" || ContractCat ==""3"" || ContractCat ==""4"")){
						if(CustCat == ""Bad"" && (ContractCat ==""1"" || ContractCat ==""2"" || ContractCat ==""3"" || ContractCat ==""4"")){
								  NumEligCon=GetFieldValue(""Bad Customer"");
								  NewIns=GetFieldValue(""Old Inst"");
								  NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice); 
								  dunflg=""Y"";     
							}
				//		}//endif DunnDate!=""""

						 if(sDiffTime1 < NumMonths && dunflg==""N"")//&& ContractCat ==""1"" && PlanCat==""1"")// || ContractCat ==""2"" || ContractCat ==""3"") 
						 {
							  NumEligCon=GetFieldValue(""New Cust"");
							  NewIns=GetFieldValue(""New Inst"");
							  NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice);      
						 }
								 else if(sDiffTime1 >= NumMonths && sDiffTime1 < sMaxNumMonths && dunflg==""N"")//Added for Customer Classification-Adjustments SD
								 {
									  NumEligCon=GetFieldValue(""Exis Cust"");
									  NewIns=GetFieldValue(""Exis Inst"");
									  NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice);
								 }
								  else if(sDiffTime1 >= sMaxNumMonths && sDiffTime1 < TwoYrMonths && dunflg==""N"")//Added for Customer Classification-Adjustments SD
								 {
									  NumEligCon=GetFieldValue(""Old Customer Devices"");
									  NewIns=GetFieldValue(""Old Customer Installments"");
									  NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice);
								 }
								  else if(sDiffTime1 >= TwoYrMonths && sDiffTime1 < ThrYrMonths && dunflg==""N"")//Added for Customer Classification-Adjustments SD
								 {
									  NumEligCon=GetFieldValue(""STC Two Year Devices"");
									  NewIns=GetFieldValue(""STC Two Year Inst"");
									  NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice);
								 }

								  else if(sDiffTime1 >= ThrYrMonths && dunflg==""N"")//Added for Customer Classification-Adjustments SD
								 {
									  NumEligCon=GetFieldValue(""STC Three Year Devices"");
									  NewIns=GetFieldValue(""STC Three Year Inst"");
									  NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice);
								 } 
						 ///Bad/////////////
						//}
  					}//isRecord1
					else {
					/*[01Nov2015][NAVINR][SD: Customer Classification Device Category]*/
						DeviceCat = vDefaultDeviceCat;
						with(oCustomBC2)
						{
							 SetViewMode(AllView);
							 ActivateField(""Contract Category"");
							 ActivateField(""Exis Cust"");
							 ActivateField(""Exis Inst"");
							 ActivateField(""New Cust"");
							 ActivateField(""New Inst"");
							 ActivateField(""Bad Customer"");
							 ActivateField(""Number Of Months"");					
							 ActivateField(""Old Cust"");
							 ActivateField(""Old Inst"");
							 //Added for Customer Classification-Adjustments SD below
							 ActivateField(""Max Number Of Months""); 
							 ActivateField(""Old Customer Devices"");
							 ActivateField(""Old Customer Installments"");
							 /*[01Nov2015][NAVINR][SD: Customer Classification Device Category]*/
							 ActivateField(""STC Device Category"");
							 
							 ClearToQuery();
							 SetSearchSpec(""Contract Category"",ContractCat1); 
							 SetSearchSpec(""Old Cust"",PlanCat);
							 SetSearchSpec(""STC Device Category"",DeviceCat);
							 ExecuteQuery(ForwardOnly);
							 isRecord1 = FirstRecord();
							 if(isRecord1)
							 {
								 ContractCat=GetFieldValue(""Contract Category"");
								 NumMonths=GetFieldValue(""Number Of Months"");
								 sMaxNumMonths = GetFieldValue(""Max Number Of Months"");//Added for Customer Classification-Adjustments SD
								 BadCus=GetFieldValue(""Bad Customer""); 
								 PlanCat=GetFieldValue(""Old Cust"");
								 TwoYrMonths = GetFieldValue(""STC Two Year Month"");
								 ThrYrMonths = GetFieldValue(""STC Three Year Month"");
								
								///////////////Category ""1""///////////////

							//	if(DunnDate!=""""){
							
								//	if(DunnDate < DunniDays && (ContractCat ==""1"" || ContractCat ==""2"" || ContractCat ==""3"" || ContractCat ==""4"")){
								if(CustCat == ""Bad"" && (ContractCat ==""1"" || ContractCat ==""2"" || ContractCat ==""3"" || ContractCat ==""4"")){
										  NumEligCon=GetFieldValue(""Bad Customer"");
										  NewIns=GetFieldValue(""Old Inst"");
										  NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice); 
										  dunflg=""Y"";     
									}
							//	}//endif DunnDate!=""""
								 if(sDiffTime1 < NumMonths && dunflg==""N"")
								 {
									  NumEligCon=GetFieldValue(""New Cust"");
									  NewIns=GetFieldValue(""New Inst"");
									  NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice);      
								 }
								
								 else if(sDiffTime1 >= NumMonths && sDiffTime1 < sMaxNumMonths && dunflg==""N"")//Added for Customer Classification-Adjustments SD
								 {
									  NumEligCon=GetFieldValue(""Exis Cust"");
									  NewIns=GetFieldValue(""Exis Inst"");
									  NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice);
								 }
								  else if(sDiffTime1 >= sMaxNumMonths && sDiffTime1 < TwoYrMonths && dunflg==""N"")//Added for Customer Classification-Adjustments SD
								 {
									  NumEligCon=GetFieldValue(""Old Customer Devices"");
									  NewIns=GetFieldValue(""Old Customer Installments"");
									  NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice);
								 }
								  else if(sDiffTime1 >= TwoYrMonths && sDiffTime1 < ThrYrMonths && dunflg==""N"")//Added for Customer Classification-Adjustments SD
								 {
									  NumEligCon=GetFieldValue(""STC Two Year Devices"");
									  NewIns=GetFieldValue(""STC Two Year Inst"");
									  NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice);
								 }

								  else if(sDiffTime1 >= ThrYrMonths && dunflg==""N"")//Added for Customer Classification-Adjustments SD
								 {
									  NumEligCon=GetFieldValue(""STC Three Year Devices"");
									  NewIns=GetFieldValue(""STC Three Year Inst"");
									  NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice);
								 }

							}//end of if(isRecord1)
						}//end of with(oCustomBC2)
					}//end of else
 				}//with (oCustomBC)
 			}// isRecordAccount
		}//AccountBC  
Outputs.SetProperty(""NewDeviceFlag"",vIsDevice); //Anchal
Outputs.SetProperty(""DevAllowed"",NumEligCon);
//}//if(sType 
}
catch(e)
{
throw(e)
}
finally
{
	oInvoiceBC=null, ListBC=null, oCustomBC=null, oCustomBC2=null, AccountBC=null;  
	oInvoiceBO=null, ListBO=null, oCustomBO=null, AccountBO=null;
	AppObj=null;
}
}
function CheckDevice(ObjectId1)
{	
	//22/10/2014 Anchal: Created to Set Installment as 0 for Basic Plans without Installment Product for Advance Payment Calculation
	try
	{
		var vApp: Application = TheApplication();	
		var OrderBO: BusObject = vApp.GetBusObject(""Order Entry"");
		var OrderItemBC: BusComp = OrderBO.GetBusComp(""Order Entry - Line Items"");
		var vExpr = """";
		var vEquipment = vApp.InvokeMethod(""LookupValue"",""PRODUCT_TYPE"",""Equipment"");
		var vIsRec = false;
		var vIsBasePlanPartCode = ""No"";		
		with(OrderItemBC)
		{
			SetViewMode(AllView);
			ActivateField(""Product Id"");
			ClearToQuery();	
			//vExpr = ""[Order Header Id] = '""+ObjectId1+""' AND [Action Code] = 'Add' AND [Product Type]= '""+vEquipment+""' AND [Part Number] NOT LIKE 'VADPAY*'"";
			vExpr = ""[Order Header Id] = '""+ObjectId1+""' AND [Action Code] = 'Add' AND [Product Type]= '""+vEquipment+""' AND [Part Number] NOT LIKE 'VADPAY*' AND [STC Plan Elig] = 'Yes'"";//Added for BB Device Addons
			SetSearchExpr(vExpr);
			ExecuteQuery(ForwardBackward);
			vIsRec = FirstRecord();
			if(vIsRec)
			{
				vIsBasePlanPartCode = ""Yes"";
				//Added by Guru to be later used by GetDeviceRRP function
				vDeviceProdId=GetFieldValue(""Product Id"");
			}
		}
	}
	finally
	{
		OrderItemBC = null;
		OrderBO = null;
		vApp = null;
		
	}
	return(vIsBasePlanPartCode);
}
function ExperianAPI(Inputs,Outputs)
{
/**********************************************************************************************************
Purpose 		: Function called from Workflow Process  to  Set Number of Installments 
Author 			: GURURAJ MADHAVARAO
Change Log		: Changes made to the function
***********************************************************************************************************
Date(DD/MM/YYYY)	| By		| Description of Change																		
-----------------------------------------------------------------------------------------------------------
28/05/2020		1.0   |	GURURAJ MADHAVARAO	| Created for new Experain Frame Work
----------------------------------------------------------------------------------------------------------*/

	try
	{
		var vAccountId=null,vDeviceId=null,sDeviceId=null,vCPR=null,ObjectId1=null,vBirthDate=null,vNationality=null,vCardOccp=null;
		var vBo=null,vBc=null,vSSpec=null,vRcount=0,vExperianFlg=null,vAdvTerm=null,vDeviceLmt=null,vDeviceLmtCalc=null,vElgDevCnt=null,vMaxCncrt=null,vRskCls=null,vUpfrntTerm=null,vCustOweAmt=null,veShop=null,vNumIns=null;

		var inp=TheApplication().NewPropertySet();
		var out=TheApplication().NewPropertySet();
		var vQbs=TheApplication().GetService(""STC Siebel Operation BS"");
		
		//Getting Input Values
		with(Inputs)
		{
			vAccountId = GetProperty(""vAccountId"");
			vDeviceId = GetProperty(""Device Id"");
			sDeviceId = GetProperty(""sDeviceId"");
			vCPR = GetProperty(""CPR"");
			veShop = GetProperty(""EshopFlag"");
			ObjectId1 = GetProperty(""Object Id"");
			vBirthDate = GetProperty(""BirthDate"");
			vNationality = GetProperty(""Nationality"");
			vCardOccp = GetProperty(""CardOccupation"");
		}

		//Getting Values from experian BC
		vSSpec=""[Stc Can Id]='""+vAccountId+""'"";
		inp.SetProperty(""BusinessComponent"",""STC Experian Credit Scoring Matrix"");
		inp.SetProperty(""BusinessObject"",""STC Experian Credit Scoring Matrix BO"");
		inp.SetProperty(""SearchExpression"",vSSpec);
		inp.SetProperty(""Field0"",""STC Experain Flag"");
		inp.SetProperty(""Field1"",""Stc Advpay Term"");
		inp.SetProperty(""Field2"",""Stc Device Lmt"");
		inp.SetProperty(""Field3"",""Stc Elg Dev Cnt"");
		inp.SetProperty(""Field4"",""Stc Max Cncrt Elg"");
		inp.SetProperty(""Field5"",""Stc Rsk Cls"");
		inp.SetProperty(""Field6"",""Stc Upfront Term"");

		vQbs.InvokeMethod(""SiebelQuery"",inp,out);
		vRcount=out.GetProperty(""RecordCount"");
		vExperianFlg=out.GetProperty(""Output0"");
		if((vRcount > 0 && vExperianFlg==""Y"") && veShop != ""Y"")
		{
			vExperianFlg=""Y"";
			vAdvTerm=out.GetProperty(""Output1"");
			vDeviceLmt=out.GetProperty(""Output2"");
			vCustOweAmt=0;
			//vDeviceLmtCalc=vDeviceLmt-vCustOweAmt;
			vElgDevCnt=out.GetProperty(""Output3"");
			vMaxCncrt=out.GetProperty(""Output4"");
			vRskCls=out.GetProperty(""Output5"");
			vUpfrntTerm=out.GetProperty(""Output6"");
			vNumIns=vAdvTerm;

			with(Outputs)
			{
				SetProperty(""NewDeviceFlag"",vIsDevice);
				SetProperty(""DevAllowed"",vElgDevCnt);
				SetProperty(""MaxContractElg"",vMaxCncrt);
				SetProperty(""NumOfInstalment"",vAdvTerm);
				SetProperty(""DeviceLimitElg"",vDeviceLmt);
				//SetProperty(""DeviceLimitElgCalc"",vDeviceLmtCalc);
				//SetProperty(""CustomerOweAmount"",vCustOweAmt);
				SetProperty(""RiskClass"",vRskCls);
				SetProperty(""UpfrontTerm"",vUpfrntTerm);
				SetProperty(""ExperianFlag"",vExperianFlg);
				SetProperty(""CANId"",vAccountId);
				SetProperty(""Nationality"","""");
				SetProperty(""EmployerCategory"","""");
				SetProperty(""SystemOccupation"","""");
				SetProperty(""Occupation Category"","""");
				SetProperty(""AON"","""");
				SetProperty(""Bad Payee Status"","""");
				SetProperty(""Elite Status"","""");
				SetProperty(""Customer Age"","""");
				SetProperty(""DeviceRRP"","""");
				SetProperty(""AccAllowed"","""");
				SetProperty(""ContractElig"","""");
			}
			//Call function to set installment
			NumberOfInstalment(null,null,null,vNumIns,ObjectId1,vIsDevice,vDeviceId, sDeviceId);

		}
		else if((vRcount > 0 && vExperianFlg==""Y"") && veShop == ""Y"")
		{
			with(Outputs)
			{
				vSSpec=""[Stc Can Id]='""+vAccountId+""'"";
				SetProperty(""ExperianFlag"",vExperianFlg);
				SetProperty(""CANId"",vAccountId);
				SetProperty(""SearchSpec"",vSSpec);
				SetProperty(""Occupation Category"","""");
				SetProperty(""AON"","""");
				SetProperty(""Bad Payee Status"","""");
				SetProperty(""Elite Status"","""");
				SetProperty(""Customer Age"","""");
				SetProperty(""Nationality"","""");
				SetProperty(""EmployerCategory"","""");
				SetProperty(""SystemOccupation"","""");
				SetProperty(""DeviceRRP"","""");
			}
		}
		else
		{
			vExperianFlg=""N"";
		}



	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
		vAccountId=null;vDeviceId=null;sDeviceId=null;vCPR=null;ObjectId1=null;vBirthDate=null;vNationality=null;vCardOccp=null;
		vBo=null;vBc=null;vSSpec=null;vRcount=0;vAdvTerm=null;vDeviceLmt=null;vDeviceLmtCalc=null;vElgDevCnt=null;vMaxCncrt=null;vRskCls=null;vUpfrntTerm=null;vCustOweAmt=null;veShop=null;

	}
	return(vExperianFlg);

}
function ExperianAPI(Inputs,Outputs)
{
/**********************************************************************************************************
Purpose 		: Function called from Workflow Process  to  Set Number of Installments 
Author 			: GURURAJ MADHAVARAO
Change Log		: Changes made to the function
***********************************************************************************************************
Date(DD/MM/YYYY)	| By		| Description of Change																		
-----------------------------------------------------------------------------------------------------------
28/05/2020		1.0   |	GURURAJ MADHAVARAO	| Created for new Experain Frame Work
----------------------------------------------------------------------------------------------------------*/

	try
	{
		var vAccountId=null,vDeviceId=null,sDeviceId=null,vCPR=null,ObjectId1=null,vBirthDate=null,vNationality=null,vCardOccp=null;
		var vBo=null,vBc=null,vSSpec=null,vRcount=0,vExperianFlg=null,vAdvTerm=null,vDeviceLmt=null,vDeviceLmtCalc=null,vElgDevCnt=null,vMaxCncrt=null,vRskCls=null,vUpfrntTerm=null,vCustOweAmt=null,veShop=null,vNumIns=null;

		var inp=TheApplication().NewPropertySet();
		var out=TheApplication().NewPropertySet();
		var vQbs=TheApplication().GetService(""STC Siebel Operation BS"");
		
		//Getting Input Values
		with(Inputs)
		{
			vAccountId = GetProperty(""vAccountId"");
			vDeviceId = GetProperty(""Device Id"");
			sDeviceId = GetProperty(""sDeviceId"");
			vCPR = GetProperty(""CPR"");
			veShop = GetProperty(""EshopFlag"");
			ObjectId1 = GetProperty(""Object Id"");
			vBirthDate = GetProperty(""BirthDate"");
			vNationality = GetProperty(""Nationality"");
			vCardOccp = GetProperty(""CardOccupation"");
		}

		//Getting Values from experian BC
		vSSpec=""[Stc Can Id]='""+vAccountId+""'"";
		inp.SetProperty(""BusinessComponent"",""STC Experian Credit Scoring Matrix"");
		inp.SetProperty(""BusinessObject"",""STC Experian Credit Scoring Matrix BO"");
		inp.SetProperty(""SearchExpression"",vSSpec);
		inp.SetProperty(""Field0"",""STC Experain Flag"");
		inp.SetProperty(""Field1"",""Stc Advpay Term"");
		inp.SetProperty(""Field2"",""Stc Device Lmt"");
		inp.SetProperty(""Field3"",""Stc Elg Dev Cnt"");
		inp.SetProperty(""Field4"",""Stc Max Cncrt Elg"");
		inp.SetProperty(""Field5"",""Stc Rsk Cls"");
		inp.SetProperty(""Field6"",""Stc Upfront Term"");

		vQbs.InvokeMethod(""SiebelQuery"",inp,out);
		vRcount=out.GetProperty(""RecordCount"");
		vExperianFlg=out.GetProperty(""Output0"");
		if((vRcount > 0 && vExperianFlg==""Y"") && veShop != ""Y"")
		{
			vExperianFlg=""Y"";
			vAdvTerm=out.GetProperty(""Output1"");
			vDeviceLmt=out.GetProperty(""Output2"");
			vCustOweAmt=0;
			//vDeviceLmtCalc=vDeviceLmt-vCustOweAmt;
			vElgDevCnt=out.GetProperty(""Output3"");
			vMaxCncrt=out.GetProperty(""Output4"");
			vRskCls=out.GetProperty(""Output5"");
			vUpfrntTerm=out.GetProperty(""Output6"");
			vNumIns=vAdvTerm;

			with(Outputs)
			{
				SetProperty(""NewDeviceFlag"",vIsDevice);
				SetProperty(""DevAllowed"",vElgDevCnt);
				SetProperty(""MaxContractElg"",vMaxCncrt);
				SetProperty(""NumOfInstalment"",vAdvTerm);
				SetProperty(""DeviceLimitElg"",vDeviceLmt);
				//SetProperty(""DeviceLimitElgCalc"",vDeviceLmtCalc);
				//SetProperty(""CustomerOweAmount"",vCustOweAmt);
				SetProperty(""RiskClass"",vRskCls);
				SetProperty(""UpfrontTerm"",vUpfrntTerm);
				SetProperty(""ExperianFlag"",vExperianFlg);
				SetProperty(""CANId"",vAccountId);
				SetProperty(""Nationality"","""");
				SetProperty(""EmployerCategory"","""");
				SetProperty(""SystemOccupation"","""");
				SetProperty(""Occupation Category"","""");
				SetProperty(""AON"","""");
				SetProperty(""Bad Payee Status"","""");
				SetProperty(""Elite Status"","""");
				SetProperty(""Customer Age"","""");
				SetProperty(""DeviceRRP"","""");
				SetProperty(""AccAllowed"","""");
				SetProperty(""ContractElig"","""");
			}
			//Call function to set installment
			if(ObjectId1 !="""" && ObjectId1!= null){
				NumberOfInstalment(null,null,null,vNumIns,ObjectId1,vIsDevice,vDeviceId, sDeviceId);
			}

		}
		else if((vRcount > 0 && vExperianFlg==""Y"") && veShop == ""Y"")
		{
			with(Outputs)
			{
				vSSpec=""[Stc Can Id]='""+vAccountId+""'"";
				SetProperty(""ExperianFlag"",vExperianFlg);
				SetProperty(""CANId"",vAccountId);
				SetProperty(""SearchSpec"",vSSpec);
				SetProperty(""Occupation Category"","""");
				SetProperty(""AON"","""");
				SetProperty(""Bad Payee Status"","""");
				SetProperty(""Elite Status"","""");
				SetProperty(""Customer Age"","""");
				SetProperty(""Nationality"","""");
				SetProperty(""EmployerCategory"","""");
				SetProperty(""SystemOccupation"","""");
				SetProperty(""DeviceRRP"","""");
			}
		}
		else
		{
			vExperianFlg=""N"";
		}



	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
		vAccountId=null;vDeviceId=null;sDeviceId=null;vCPR=null;ObjectId1=null;vBirthDate=null;vNationality=null;vCardOccp=null;
		vBo=null;vBc=null;vSSpec=null;vRcount=0;vAdvTerm=null;vDeviceLmt=null;vDeviceLmtCalc=null;vElgDevCnt=null;vMaxCncrt=null;vRskCls=null;vUpfrntTerm=null;vCustOweAmt=null;veShop=null;

	}
	return(vExperianFlg);

}
function GetCustomerAge(AccountId, BirthDate)
{
//[Modified By: NAVIN:21Jan2020:AdvancePaymentAllocation-MPOSChanges]
	try
	{
		//var AppObj=TheApplication();
		var AccountBO=TheApplication().GetBusObject(""Account"");
		var AccountBC=AccountBO.GetBusComp(""Account"");
		var vPriContactId=null,vContactBC=null,vCustAge=0,vDob=null;
		var vCurrDate=new Date();
		var vSysdate=vCurrDate.getTime();
		var vDobdate=null,vDiff=null;
		if(AccountId != null && AccountId != """")
		{
			with(AccountBC)
			{
				SetViewMode(AllView);
				ActivateField(""Primary Contact Id"");
				ClearToQuery();
				SetSearchSpec(""Id"",AccountId);
				ExecuteQuery(ForwardOnly);
				if(FirstRecord())
				{
					vPriContactId=GetFieldValue(""Primary Contact Id"");
					vContactBC=AccountBO.GetBusComp(""Contact"");
					with(vContactBC)
					{
						SetViewMode(AllView);
						ActivateField(""Birth Date"");
						ClearToQuery();
						SetSearchSpec(""Id"",vPriContactId);
						ExecuteQuery(ForwardOnly);
						if(FirstRecord())
						{
							vDob=GetFieldValue(""Birth Date"");
							if(vDob == null || vDob == """")
							{
								vDob = BirthDate;
							}
							if(vDob != null && vDob != """")
							{
								vDobdate=new Date(vDob);
								vDobdate=vDobdate.getTime();
								vDiff=vSysdate-vDobdate;
								vDiff=vDiff/86400000;
								vDiff=vDiff/365;
								vDiff=Math.floor(vDiff);
								vCustAge=vDiff;
							}
						}
						
					}//with(vContactBC)
				}
			}//with(AccountBC)
		}//if(AccountId != null
		else{
			if(BirthDate != null && BirthDate != """")
			{
				vDob = BirthDate;
				vDobdate=new Date(vDob);
				vDobdate=vDobdate.getTime();
				vDiff=vSysdate-vDobdate;
				vDiff=vDiff/86400000;
				vDiff=vDiff/365;
				vDiff=Math.floor(vDiff);
				vCustAge=vDiff;
			}//if(BirthDate != null...
		}//end else

		if(vCustAge == null || vCustAge == """")
		{
			vCustAge = 0;
		}
	}
	catch(e)
	{
		vCustAge = 0;
		//throw(e);
	}
	finally
	{
		vPriContactId=null; vContactBC=null;
		vDob=null; vDobdate=null; vDiff=null;
		AccountBC=null;
		AccountBO=null;
		//AppObj=null;
		vCurrDate=null; vSysdate=null
	}
	return(vCustAge);
}
function GetDeviceRRP(vDeviceId)
{
	try
	{
		//var AppObj=TheApplication();
		var vCostListBO=TheApplication().GetBusObject(""FS Service Costs"");
		var vCostListBC=vCostListBO.GetBusComp(""Cost List Item"");
		var vDeviceRRP=null;
	
		with(vCostListBC)
		{
			SetViewMode(AllView);
			ActivateField(""Product Id"");
			ActivateField(""Standard Cost"");
			ClearToQuery();
			//SetSearchSpec(""Product Id"",vDeviceId);
			//SetSearchSpec(""Price List Name"",""STC Master Cost List"");
			SetSearchExpr(""[Product Id]='""+vDeviceId+""' AND [Price List Name]='STC Master Cost List'"");
			ExecuteQuery(ForwardOnly);
			if(FirstRecord())
			{
				vDeviceRRP=GetFieldValue(""Standard Cost"");

				if(vDeviceRRP == null || vDeviceRRP == """")
					vDeviceRRP = 0;

				//vDeviceRRP=Math.round(vDeviceRRP);
				vDeviceRRP=Math.ceil(vDeviceRRP);
			}
		}
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
		vCostListBC=null;
		vCostListBO=null;
		//AppObj=null;	
	}
	return(vDeviceRRP);
}
function GetOccupationCategory_NEWBR(vNationality, vEmpCat, vSysOcc)
{//[NAVIN:03Mar2020:BR_Automation_Phase3]

	var vOccpCat="""", vDefEmpCat="""", vDefSysOcc="""", vDefCardOcc="""";

	vOccpCat = GetOccupationCategory_sub(vNationality, vEmpCat, vSysOcc);

	if (vOccpCat == null || vOccpCat == """")
	{
		if(vEmpCat != """" && vEmpCat != ""CAT C"")
		{
			vDefEmpCat = TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""EMP_CAT"");
			vOccpCat = GetOccupationCategory_sub(vNationality, vDefEmpCat, vSysOcc);
		}
		else
		{
			//vDefCardOcc = TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""SMART_CARD_OCC"");
			vDefSysOcc = TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""SYSTEM_OCC"");
			vOccpCat = GetOccupationCategory_sub(vNationality, vEmpCat, vDefSysOcc);
		}

		if (vOccpCat == null || vOccpCat == """")
		{
			vDefEmpCat = TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""EMP_CAT"");
			vDefSysOcc = TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""SYSTEM_OCC"");
			vOccpCat = GetOccupationCategory_sub(vNationality, vDefEmpCat, vDefSysOcc);
			
			if (vOccpCat == null || vOccpCat == """")
			{
				vOccpCat = TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"", ""OCC_CAT"");
			}
		}
	}
//TheApplication().RaiseErrorText(vNationality+"":""+vEmpCat+"":""+vDefEmpCat+"":""+vSysOcc+"":""+vDefSysOcc+"":""+vOccpCat);

	return vOccpCat;
}
function GetOccupationCategory_sub(vNationality, vEmpCat, vSysOcc)
{//[NAVIN:03Mar2020:BR_Automation_Phase3]

	var vSSpec="""", vRCount=0, vOccpCat="""";
	var QBS = TheApplication().GetService(""STC Siebel Operation BS"");
	var inpPS=TheApplication().NewPropertySet();
	var outPS=TheApplication().NewPropertySet();
	
	vSSpec=""[Nationality]='""+vNationality+""' AND [Employer Category]='""+vEmpCat+""' AND [System Occupation]='""+vSysOcc+""'"";

	with(inpPS){
		SetProperty(""BusinessObject"",""STC Customer Classification BO"");
		SetProperty(""BusinessComponent"",""STC Occupation Category Matrix"");
		SetProperty(""SearchExpression"",vSSpec);
		SetProperty(""Field0"",""Occupation Category"");
	}
	QBS.InvokeMethod(""SiebelQuery"",inpPS,outPS);
	vRCount=0;
	vRCount=outPS.GetProperty(""RecordCount"");
	if(vRCount > 0)
	{
		vOccpCat=outPS.GetProperty(""Output0"");
		inpPS.Reset();
		outPS.Reset();
	}

	inpPS = null; outPS = null; QBS = null;

	return vOccpCat;
}
function NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice,vDeviceId, sDeviceId)
{
    var oOrder, oOrderBC, CustmerBO, CustmerBC;
    var sOrderItem;//Jithin: Advance Payment SD
    var vType=""STC_NUM_INSTALL"";
    var ContractCat, Existing, NewCust, NewInstallment:Number;
    var NumOfMonth, SuperCust, BadCust, sNetPrice;//Jithin: Advance Payment SD
    var PlanAdvanceInst = 0;//Mayank: Added for Ecom
    //var AppObj=TheApplication();
    NewInstallment =  NewIns;
    try
    {
        oOrder =TheApplication().GetBusObject(""Order Entry (Sales)"");
        oOrderBC=oOrder.GetBusComp(""Order Entry - Orders"");
        sOrderItem = oOrder.GetBusComp(""Order Entry - Line Items"");   
        with(oOrderBC)
        {
            InvokeMethod(""SetAdminMode"",""TRUE"");
            SetViewMode(AllView);
            ActivateField(""STC Num of Inst"");
            ActivateField(""STC Order Install Flag"");
            ActivateField(""STC Super ReadOnly"");
            ActivateField(""STC Install Flg"");
            ActivateField(""STC Channel"");//Mayank: Added for Ecom
            ActivateField(""STC Portal Order Number"");//Mayank: Added for Ecom
            ClearToQuery();
            SetSearchSpec(""Id"",ObjectId1);
            ExecuteQuery(ForwardOnly);
            var isRecord1 = FirstRecord(); 
            if(isRecord1)
            {   
                var Channel = GetFieldValue(""STC Channel"");//Mayank: Added for Ecom
                var PortalOrderNum = GetFieldValue(""STC Portal Order Number"");//Mayank: Added for Ecom
                SetFieldValue(""STC Order Install Flag"",""N"");
                WriteRecord();   
                var NumInst=GetFieldValue(""STC Order Install Flag"");
                var EcomChannel = TheApplication().InvokeMethod(""LookupValue"",""STC_ECOM_CHANNEL"",""eCommerce"");//Mayank: Added for Ecom    
                if(NumInst !=""Y"")
                {
                    if(vIsDevice == ""Yes"") //Anchal
                    {
                        //Mayank: Added for Ecom ----- START--------
                        if(Channel == EcomChannel)
                        {
                            var sServiceAF1: Service = TheApplication().GetService(""Workflow Process Manager"");
                            var vInputPropAF1: PropertySet = TheApplication().NewPropertySet();
                            var vOutputPropAF1: PropertySet = TheApplication().NewPropertySet();      
                            vInputPropAF1.SetProperty(""Operation"",""NOPlanAdvance"");
                            vInputPropAF1.SetProperty(""Object Id"",ObjectId1);
                            vInputPropAF1.SetProperty(""SystemNewIns"",NewInstallment);
                            vInputPropAF1.SetProperty(""ProcessName"",""STCeCommerceNumberInstallmentProcess"");        
                            sServiceAF1.InvokeMethod(""RunProcess"", vInputPropAF1, vOutputPropAF1);
                            PlanAdvanceInst = vOutputPropAF1.GetProperty(""NoOfInstallment"");
                            /*if(PlanAdvanceInst == """" || PlanAdvanceInst == null)
                            {
                                PlanAdvanceInst = 0;
                            }*/
                            SetFieldValue(""STC Num of Inst"",PlanAdvanceInst);
                        } 
                        else
                        {//Channel != 'eCommerce' [NAVIN:Advance payment SD]
                            with(sOrderItem)//Jithin: Advance payment SD
                            {
                                InvokeMethod(""SetAdminMode"",""TRUE"");
                                SetViewMode(AllView);
                                ActivateField(""STC Number Installment"");
                                ActivateField(""STC Advance Payment"");
                                ActivateField(""STC Installment Price"");                             
                                ClearToQuery();
                                SetSearchSpec(""Id"",sDeviceId);
                                ExecuteQuery(ForwardOnly);
                                var isRecord1 = FirstRecord(); 
                                if(isRecord1)
                                {
                                    sNetPrice = GetFieldValue(""STC Installment Price"");
                                    sNetPrice = sNetPrice * NewIns;
                                    SetFieldValue(""STC Number Installment"",NewIns);
                                    SetFieldValue(""STC Advance Payment"",sNetPrice);
                                    WriteRecord();
                                }
                            }
                        }
                    }
                    else
                    {   //Mayank: Added for Ecom ----- START--------
                        //var EcomChannel = TheApplication().InvokeMethod(""LookupValue"",""STC_ECOM_CHANNEL"",""eCommerce"");
                        if(Channel == EcomChannel)
                        {
                            var sServiceAF: Service = TheApplication().GetService(""Workflow Process Manager"");
                            var vInputPropAF: PropertySet = TheApplication().NewPropertySet();
                            var vOutputPropAF: PropertySet = TheApplication().NewPropertySet();       
                            vInputPropAF.SetProperty(""Operation"",""PlanAdvance"");
                            vInputPropAF.SetProperty(""Object Id"",ObjectId1);
                            vInputPropAF.SetProperty(""ProcessName"",""STCeCommerceNumberInstallmentProcess"");     
                            sServiceAF.InvokeMethod(""RunProcess"", vInputPropAF, vOutputPropAF);
                            PlanAdvanceInst = vOutputPropAF.GetProperty(""NoOfInstallment"");
                            /*if(PlanAdvanceInst == """" || PlanAdvanceInst == null)
                            {
                                PlanAdvanceInst = 0;
                            }*/
                            //var PlanAdvanceInst = TheApplication().InvokeMethod(""LookupValue"",""STC_ECOM_PLAN_ADV_PAY"",""STC_ECOM_PLAN_ADV_PAY"");
                            SetFieldValue(""STC Num of Inst"",PlanAdvanceInst);
                        } 
                        else
                        {//Channel != 'eCommerce' [NAVIN:Advance payment SD]
                            SetFieldValue(""STC Num of Inst"",""0"");
							WriteRecord();
							
							with(sOrderItem)//Jithin: Advance payment SD
                            {
                                InvokeMethod(""SetAdminMode"",""TRUE"");
                                SetViewMode(AllView);
                                ActivateField(""STC Number Installment"");
                                ActivateField(""STC Advance Payment"");
                                ActivateField(""STC Installment Price"");                             
                                ClearToQuery();
                                SetSearchSpec(""Id"",sDeviceId);
                                ExecuteQuery(ForwardOnly);
                                var isRecord1 = FirstRecord(); 
                                if(isRecord1)
                                {
                                    sNetPrice = GetFieldValue(""STC Installment Price"");
                                    sNetPrice = sNetPrice * NewIns;
                                    SetFieldValue(""STC Number Installment"",NewIns);
                                    SetFieldValue(""STC Advance Payment"",sNetPrice);
                                    WriteRecord();
                                }
                            }
                        }
                    }//Mayank: Added for Ecom
                    WriteRecord();
                    SetFieldValue(""STC Order Install Flag"",""Y"");
                    WriteRecord(); 
                }
            }//isRecord1
        }//orderbc 
    }//try
    catch(e)
    { 
		throw(e);
    }
    finally
    {}
}//endfunction"
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName ==""AgeOnNetwork"")
	{
	   AgeonNetwork(Inputs,Outputs);
	   return(CancelOperation);
	}
	if(MethodName ==""GetDeviceRRP"")
	{	
	   var vDeviceRRP=GetDeviceRRP(Inputs.GetProperty(""DeviceId""));
	   return(CancelOperation);
	}
	if(MethodName ==""AgeOnNetwork_New"")
	{
	   AgeOnNetwork_New(Inputs,Outputs);
	   return(CancelOperation);
	}
	if(MethodName ==""GetCustomerAge"")
	{//[NAVIN:21Jan2020:AdvancePaymentAllocation-MPOSChanges]
		var AccountId = GetProperty(""AccountId"");
		var vBirthDate = GetProperty(""BirthDate"");
		var vCustAge = GetCustomerAge(AccountId, vBirthDate);
		Outputs.SetProperty(""CustomerAge"", vCustAge);
		return(CancelOperation);
	}
	if(MethodName ==""GetOccupationCategory_NEWBR"")
    {//[NAVIN:03Mar2020:BR_Automation_Phase3]
        var vNationality="""", vEmpCat="""", vSysOcc="""", vOccpCat="""";
        with(Inputs)
        {
            vNationality = GetProperty(""Nationality"");
            vEmpCat = GetProperty(""EmployerCategory"");
            vSysOcc = GetProperty(""SystemOccupation"");
        }
        vOccpCat = GetOccupationCategory_NEWBR(vNationality, vEmpCat, vSysOcc);
        Outputs.SetProperty(""OccupationCategory"", vOccpCat);

        return(CancelOperation);
    }

	 return (ContinueOperation);
}
function Bulk(Inputs, Outputs)
{
	var MRowId="""";
	try
	{

		/*	WIPRO-Upgrade-03.05.2016-TSINGHALC - Gets the Filename along with Filepath from LOV Description	*/
	
		var svc = TheApplication().GetService(""STC Get Filename"");
		var Inputs = TheApplication().NewPropertySet();
		var Outputs = TheApplication().NewPropertySet();
		Inputs.SetProperty(""Type"",""STC_FILE_NAME"");
		Inputs.SetProperty(""LIC"",""STC_CUSTOMER_CPR_UPD"");
		svc.InvokeMethod(""STC Get LOV Desc"", Inputs, Outputs);
		var filepath = Outputs.GetProperty(""Description"");
		
		var file = Clib.fopen(filepath, ""rt"");
		
		/* WIPRO-Upgrade-03.05.2016-TSINGHALC - Commented the below line as the filename is received from the above lines by invoking the Generic BS */
		
		//var file=Clib.fopen(""/crmapp/CPRImport.csv"", ""rt"");

		var AccBO = TheApplication().GetBusObject(""Account"");
		var AccBC = AccBO.GetBusComp(""Account"");

		if (file==null)
		{
			TheApplication().RaiseErrorText(""Error in opening the file"");
		}
		else
		{
			while(!Clib.feof(file))                   
			{
				MRowId = (Clib.fgets(file));  
				MRowId = trim(MRowId);
				with(AccBC)
				{

					SetViewMode(AllView);
					ActivateField(""Tax ID Number"");
					ActivateField(""STC No Contact"");
					ClearToQuery();
					SetSearchSpec(""Id"",MRowId);
					ExecuteQuery(ForwardOnly);
					var isAccRecord = FirstRecord(); 

					if(isAccRecord)
					{
						SetFieldValue(""STC No Contact"",""Y"");

						WriteRecord();

						//isAccRecord=NextRecord(); 
					}
   
				}//AccBC	
			}
		}//else
	}//try
	catch(e)
	{
	}
	finally
	{
		file = null;
		filepath = null;
		Outputs = null;
		Inputs = null;
		svc = null;
	}
	//MWorkflowProc=null;
	//MOutputs=null;
	//MInputs=null;
	MRowId=null

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName==""Bulk"")
	{
		Bulk(Inputs, Outputs);
		return (CancelOperation);
	}
	return (ContinueOperation);
}
function trim(s) 
{
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""ValidateRequiredFields""){
		ValidateRequiredFields(Inputs,Outputs);
		return CancelOperation;
	}
	if(MethodName == ""ValidateMinorGuardian""){
		ValidateMinorGuardian(Inputs,Outputs);
		return CancelOperation;
	}
	
	return (ContinueOperation);
}
"//Your public declarations go here... 
function ValidateMinorGuardian()
{


var appObj = TheApplication();
var	oBusObj = TheApplication().ActiveBusObject();
var sAccountType = """",sEmpLetter = """",Gverified = """",svcBusSrv,DOB = """";
var psInputsG = appObj.NewPropertySet();
var psOutputs = appObj.NewPropertySet();
var Minor = ""N"", EighteenandAbove = ""N"", SixteenandLess = ""N"";
     if (oBusObj.Name() == ""Account Home"")
	 {
		var oBC = oBusObj.GetBusComp(""STC New Customer VBC"");
		with(oBC)
			{
			sAccountType = GetFieldValue(""Account Type"");
			sEmpLetter = GetFieldValue(""Employment Letter"");
			Gverified = GetFieldValue(""Guardian Verified"");
			DOB = GetFieldValue(""Date Of Birth"");
			
					
			}
			if(sAccountType == ""Individual"")
			{
		with(psInputsG)
		{
			SetProperty(""DOB"",DOB); 
		}
		svcBusSrv = appObj.GetService(""STC Check Minor Customer BS"");
		svcBusSrv.InvokeMethod(""DOB"",psInputsG,psOutputs);
		Minor = psOutputs.GetProperty(""Minor"");
		EighteenandAbove = psOutputs.GetProperty(""EighteenandAbove"");
		SixteenandLess = psOutputs.GetProperty(""SixteenandLess"");
		if (SixteenandLess == ""Y"")
		{
			TheApplication().RaiseErrorText(""Customer must be atleast 16 years old to take postpaid connection."");
		}
		if (Minor == ""Y"" && (sEmpLetter != ""Y"") && (Gverified != ""Y"") )
		{

			TheApplication().RaiseErrorText(""Please check Employment Offer check box if customer has employee proof if super user or Get Guardian details."");
		}


			}
	 }

}
function ValidateRequiredFields(Inputs,Outputs)
{

	var oBusObj;
    var CustomerFax;
	var sAddressTenureMonths; 
	var sAddressTenureYears;
	var sAddressType;
	var sAuthorityLevel;
	var sBlockNo;
	var sBuildingNo;
	var sCR;
	var sCity;
	var sContractCategory;
	var sCountry;
	var sCurrentOccupation;
	var sDateOfBirth;
	var sEmailId;
	var sFax;
	var sFirstName;
	var sFlatVillaNo;
	var sGender;
	var sGovernorate;
	var sHobby;
	var sID;
	var sIDExpiryDate;
	var sIDType;
	var sIncomeGroup;
	var sLastEducationLevel;
	var sLastName;
	var sLineOfBusiness;
	var sMaritalStatus;
	var sMiddleName;
	var sMobilePhone;
	var sMothersMaidenName;
	var sAccountName;
	var sNationality;
	var sOwnershipStatus;
	var sPersoninHousehold;
	var sPhone;
	var sPlaceOfBirth;
	var sPOBox;
	var sPreferredCommunicationChannel;
	var sPrefferedLanguage;
	var sRoadNo;
	var sAccountClass="""";
	var sStreetName;
	var sTitle;
	var sAccountType="""";
	var sVIPCategory;
	var sWorkPhone;
	var sSegment;
	var sCurrentOccupationTenureMonths;
	var sCurrentOccupationTenureYears;
	var psInputs;
	var psOutputs;
	var svcBusSrv;
	var sRefMiddleName;
	var sAccntLOV;
	var CustAccntId;	
	var sSponsorName;
	var sSponsorIDType;
	var sSponsorIDNumber;
	var sSponsorIDExpiryDate;
	var sSponsorIDIssuePlace;
	var sSponsorTelephoneNumber;
	var sSelfEmployed;
	var sDunningExcluded;//NEW
	var sCopyAddress;//NEW
	var sOrgFname;
	var sOrgLname;
	var sOrgTitle;
	var sOrgMname;
	var sManagerName;
	var sApplicantType;
	var sBranchLocal;
	var sBranchInt;
	var sBusTel1;
	var sBusTel2;
	var sNumEmp;
	var sOffNum;
	var sOffEmail;
	var sParCom;
	var sCamId; //Added by Sudeep for Campaign
	var sEmailReason; 
	var sCPRNumber,CardOcc,sConGccCntryCode;
	var sSubscriberCntry;//Added for the CIO software update SRINI:18022014
	var sActualOccupation;	//Autopopulate SD
	var sPassportNo;	//Autopopulate SD
	var sPassportIssueDate;	//Autopopulate SD
	var sPassportExpiryDate;	//Autopopulate SD
	var sLabourForceParticipation;	//Autopopulate SD
	var sCardIssueDate;	//Autopopulate SD
	var sEmployerNumber;	//Autopopulate SD
	var sEmployerName;	//Autopopulate SD
	var RE = ""is a required field. Please enter a value for the field."";
	var FR;
	var sDBAN1 = """";//ROHITR:4/5/20:CRM Order Automation
	var appObj = TheApplication();
	oBusObj = TheApplication().ActiveBusObject();
     if (oBusObj.Name() == ""Account Home"")
{


        var oBC = oBusObj.GetBusComp(""STC New Customer VBC"");
	//	sAccountClass = oBC.GetFieldValue(""Account Class"");
		//TheApplication().RaiseErrorText(sAccClass);
		with(oBC)
		{
			ActivateField(""Actual Occupation"");
			sActualOccupation = GetFieldValue(""Actual Occupation"");
			//Autopopulate SD
			sApplicantType = GetFieldValue(""STC Applicant Type"");
			ActivateField(""Passport No"");
			sPassportNo = GetFieldValue(""Passport No"");
			//Autopopulate SD
			ActivateField(""Passport Issue Date"");
			sPassportIssueDate = GetFieldValue(""Passport Issue Date"");
			//Autopopulate SD
			ActivateField(""Passport Expiry Date"");
			sPassportExpiryDate = GetFieldValue(""Passport Expiry Date"");
			//Autopopulate SD
			ActivateField(""Labour Force Participation"");
			sLabourForceParticipation = GetFieldValue(""Labour Force Participation"");
			//Autopopulate SD
			ActivateField(""Card Issue Date"");
			sCardIssueDate = GetFieldValue(""Card Issue Date"");
			//Autopopulate SD
			ActivateField(""Employer Number"");
			sEmployerNumber = GetFieldValue(""Employer Number"");
			//Autopopulate SD
			ActivateField(""Employer Name"");
			sEmployerName = GetFieldValue(""Employer Name"");
			ActivateField(""Customer Fax"");
			CustomerFax =GetFieldValue(""Customer Fax"");
			sAddressTenureMonths = GetFieldValue(""Address Tenure Months"");
			sAddressTenureYears = GetFieldValue(""Address Tenure Years"");
			sAddressType = GetFieldValue(""Address Type"");
			sBlockNo = GetFieldValue(""Block No"");
			sBuildingNo = GetFieldValue(""Building No"");
			sCR = GetFieldValue(""CR#"");
			ActivateField(""City"");//Autopopulate
			sCity = GetFieldValue(""City"");
			sContractCategory = GetFieldValue(""Contract Category"");
			sCountry = GetFieldValue(""Country"");
			sCurrentOccupation = GetFieldValue(""Current Occupation"");
			sDateOfBirth = GetFieldValue(""Date Of Birth"");
			sEmailId = GetFieldValue(""Email Id"");
			sEmailReason = GetFieldValue(""Email Reason"");
			sFax = GetFieldValue(""Fax#"");
			sFirstName = GetFieldValue(""First Name"");
			sFlatVillaNo = GetFieldValue(""Flat/Villa No"");
			sGender = GetFieldValue(""Gender"");
			sGovernorate = GetFieldValue(""Governorate"");
			sHobby = GetFieldValue(""Hobby"");
			sID = GetFieldValue(""ID"");
			sIDExpiryDate = GetFieldValue(""ID Expiry Date"");
			sIDType = GetFieldValue(""ID Type"");
			sIncomeGroup = GetFieldValue(""Income Group"");
			sLastEducationLevel = GetFieldValue(""Last Education Level"");
			sLastName = GetFieldValue(""Last Name"");
			sLineOfBusiness = GetFieldValue(""Line Of Business"");
			sMaritalStatus = GetFieldValue(""Marital Status"");
			sMiddleName = GetFieldValue(""Middle Name"");
			sMothersMaidenName = GetFieldValue(""Mothers Maiden Name"");
			sAccountName = GetFieldValue(""Account Name"");
			sNationality = GetFieldValue(""Nationality"");
			sOwnershipStatus = GetFieldValue(""Ownership Status"");
			sPersoninHousehold = GetFieldValue(""Person in Household"");
			sPhone = GetFieldValue(""Phone#"");
			sPlaceOfBirth = GetFieldValue(""Place Of Birth"");
			sPOBox = GetFieldValue(""PO Box"");
			sPreferredCommunicationChannel = GetFieldValue(""Preferred Communication Channel"");
			sPrefferedLanguage = GetFieldValue(""Preffered Language"");
			sRoadNo = GetFieldValue(""Road No"");
			sAccountClass = GetFieldValue(""Account Class"");
			sStreetName = GetFieldValue(""Street Name"");
			sTitle = GetFieldValue(""Title"");
			sAccountType = GetFieldValue(""Account Type"");
			sVIPCategory = GetFieldValue(""VIP Category"");
			sCurrentOccupationTenureMonths = GetFieldValue(""Current Occupation Tenure Months"");
			sCurrentOccupationTenureYears = GetFieldValue(""Current Occupation Tenure Years"");
			sSponsorName = GetFieldValue(""Sponsor Name"");
			sSponsorIDType = GetFieldValue(""Sponsor ID Type"");
			sSponsorIDNumber = GetFieldValue(""Sponsor ID Number"");
			sSponsorIDExpiryDate = GetFieldValue(""Sponsor ID Expiry Date"");
			sSponsorIDIssuePlace = GetFieldValue(""Sponsor ID Issue Place"");
			sSponsorTelephoneNumber = GetFieldValue(""Sponsor Telephone Number"");
			sSelfEmployed = GetFieldValue(""Employment Type"");
			sDunningExcluded = GetFieldValue(""Dunning Excluded"");//NEW
			sCopyAddress = GetFieldValue(""Copy Address"");//NEW
			sOrgFname = GetFieldValue(""STC First Name"");
			sOrgLname = GetFieldValue(""STC Last Name"");
			sOrgTitle = GetFieldValue(""STC Title"");
			sOrgMname = GetFieldValue(""STC Middle Name"");
			sManagerName = GetFieldValue(""STC Account Manager Name"");
			sBranchLocal = GetFieldValue(""STC Branches Local"");
			sBranchInt = GetFieldValue(""STC Branches International"");
			sBusTel1 = GetFieldValue(""STC Business Tel No 1"");
			sBusTel2 = GetFieldValue(""STC Business Tel No 2"");
			sNumEmp = GetFieldValue(""STC Empolyee Number"");
			sOffNum = GetFieldValue(""STC Official Contact Number"");
			sOffEmail = GetFieldValue(""STC Official Email Address"");
			sParCom = GetFieldValue(""STC Parent Company Name"");
			ActivateField(""STC Campaign Id""); //Added by Sudeep for Campaign
			ActivateField(""Card Occupation"");
			sCamId = GetFieldValue(""STC Campaign Id""); //Added by Sudeep for Campaign
			sCPRNumber = GetFieldValue(""STCCPRNumber"");				
			CardOcc=GetFieldValue(""Card Occupation"");
			sDBAN1 = GetFieldValue(""Account Name DBAN1"");//ROHITR:6/5/20:CRM Order Automation
		  }
		  if(sAccountClass === """" || sAccountClass == null ){
	FR = ""Customer Class"" + "" "" + RE;
	appObj.RaiseErrorText(FR);
	}
	if(sAccountType === """" && sAccountType == null || sAccountType.length == 0)
	{FR = ""Customer Type"" + "" "" + RE;	appObj.RaiseErrorText(FR);}
   else	if(sAddressType === """" && sAddressType == null || sAddressType.length == 0)
	{FR = ""Address Type"" + "" "" + RE;	appObj.RaiseErrorText(FR);}
	else if(sBlockNo === """" && sBlockNo == null || sBlockNo.length == 0)
	{FR = ""Block No"" + "" "" + RE;	appObj.RaiseErrorText(FR);}
	else if(sBuildingNo === """" && sBuildingNo == null || sBuildingNo.length == 0)
	{FR = ""Building No"" + "" "" + RE;	appObj.RaiseErrorText(FR);}
	else if(sCity == """" && sCity == null || sCity.length == 0)
	{FR = ""City"" + "" "" + RE;	appObj.RaiseErrorText(FR);}
	else if(sContractCategory == """" && sContractCategory == null || sContractCategory.length == 0)
	{FR = ""Customer Segment"" + "" "" + RE;	appObj.RaiseErrorText(FR);}
	else if(sDateOfBirth == """" && sDateOfBirth == null || sDateOfBirth.length == 0)
	{FR = ""Date Of Birth"" + "" "" + RE;	appObj.RaiseErrorText(FR);}
	else if(sFlatVillaNo == """" && sFlatVillaNo == null || sFlatVillaNo.length == 0)
	{FR = ""Flat/Villa No"" + "" "" + RE;	appObj.RaiseErrorText(FR);}
	else if(sGender == """" && sGender == null || sGender.length == 0)
	{FR = ""Gender"" + "" "" + RE;	appObj.RaiseErrorText(FR);}
	else if(sGovernorate == """" && sGovernorate == null || sGovernorate.length == 0)
	{FR = ""Governorate"" + "" "" + RE;	appObj.RaiseErrorText(FR);}
	else if(sID == """" && sID == null || sID.length == 0)
	{FR = ""ID#"" + "" "" + RE;	appObj.RaiseErrorText(FR);}
	else if(sIDExpiryDate == """" && sIDExpiryDate == null || sIDExpiryDate.length == 0)
	{FR = ""ID Expiry Date"" + "" "" + RE;	appObj.RaiseErrorText(FR);}
	else if(sIDType == """" && sIDType == null || sIDType.length == 0)
	{FR = ""ID Type"" + "" "" + RE;	appObj.RaiseErrorText(FR);}
		else if(sNationality == """" && sNationality == null || sNationality.length == 0)
	{FR = ""Nationality"" + "" "" + RE;	appObj.RaiseErrorText(FR);}
	else if(sPhone == """" && sPhone == null || sPhone.length == 0)
	{FR = ""Phone No"" + "" "" + RE;	appObj.RaiseErrorText(FR);}
			else if(sPrefferedLanguage == """" && sPrefferedLanguage == null || sPrefferedLanguage.length == 0)
	{FR = ""Preffered Language"" + "" "" + RE;	appObj.RaiseErrorText(FR);}
	else if(sRoadNo == """" && sRoadNo == null || sRoadNo.length == 0)
	{FR = ""Road No"" + "" "" + RE;	appObj.RaiseErrorText(FR);}
	else if(sAccountType != ""SME"" && sApplicantType.length == 0)
	{appObj.RaiseErrorText(""Applicant Type is Required Field.Please Enter a value for the field"");}
	else if((sFirstName == """" || sFirstName == null || sFirstName.length == 0) && sAccountType == ""Individual"")
	{FR = ""First Name"" + "" "" + RE;	appObj.RaiseErrorText(FR);}
	else if((sLastName == """" || sLastName == null || sLastName.length == 0) && sAccountType == ""Individual"")
	{FR = ""Family Name"" + "" "" + RE;	appObj.RaiseErrorText(FR);}
	else if((sCurrentOccupation == """" || sCurrentOccupation == null || sCurrentOccupation.length == 0) && sAccountType == ""Individual"")
	{FR = ""Current Occupation"" + "" "" + RE;	appObj.RaiseErrorText(FR);}
	//ROHITR:6/5/20:CRM Order Automation
	  else if((sAccountType == ""Corporate"" || sAccountType == ""SME"") && (sDBAN1 == """" || sDBAN1 == null || sDBAN1.length == 0))
      {appObj.RaiseErrorText(""Department 1 is Required Field. Please Enter a value for the field"");}
    //ROHITR:6/5/20:CRM Order Automation

//nullifying



}

	return CancelOperation;
}
"//***********************************************************************************************************//
//Purpose: 1) To Initialize the fields in the BC.
//Author: MANUJ
//Date: 14-May-16
//*************************************************************************************************************//
function Init(Inputs,Outputs)
{
	try
	{
		with(Outputs)
		{
			SetProperty(""CPR"","""");
			SetProperty(""SiebelMessage"","""");//Mayank Added for Gaurdian Open UI
		}
	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
}
"//***********************************************************************************************************//
//Mayank Kandpal
//*************************************************************************************************************//
function Insert(InputsIns,OutputsIns)
{
	try
	{
		var CPR,Name,Gender,Dob,CardExpiry,FName,LName,MiddleName,Address,Flat,Building,Road,BlockNo,Governorate,Nationality,Occupation,SponsorName,SponsorNo,PassportNo,PassportIssueDate,PassportExpiryDate,LabourForceParticipation,EmployerNumber,EmployerName;
		var appObj = TheApplication();

		var proxyBS = appObj.GetService(""Workflow Process Manager"");
		var input = appObj.NewPropertySet();
		var output = appObj.NewPropertySet();
		var siebMessage = """";
		var sCount = InputsIns.GetChildCount();
		var sFN = InputsIns.GetChild(0).GetProperty(""SiebelMessage"");
		for(var k=0;k<sCount;k++)
		{
			siebMessage = InputsIns.GetChild(k).GetProperty(""SiebelMessage"");
			input.SetProperty(""XMLDOC"",siebMessage);
			
		}
		if(siebMessage != """" && siebMessage != null)
		{
			input.SetProperty(""ProcessName"",""STC Smart Card Read VBC Update WF"");
			proxyBS.InvokeMethod(""RunProcess"",input,output);
			var smartcard = output.GetChild(0);
			var row = appObj.NewPropertySet();
			CPR = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""CPRNO"");
			var FMiscCount = smartcard.GetChild(0).GetChild(0).GetChildCount();
			
			var sActiveApplet = appObj.GetProfileAttr(""sActApplet"");
			var sMethodInvoked = appObj.GetProfileAttr(""CPRMethodInvoked"");
			if(sMethodInvoked == ""GetCPR"")
			{
				row.SetProperty(""CPR"", CPR);
				OutputsIns.AddChild(row);
			}
		
		}
	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
}
"//***********************************************************************************************************//
//Purpose: 1) To Log the exceptions in Custom Error Log Table
//Inputs: Error Message
//Author: Rajitha P G
//Release: R1.0
//Date: 29-Oct-09
//*************************************************************************************************************//
function LogException(e)
{
	var appObj;
  	var psInput;
  	var psOutput;
  	var bsErrorHandler; 
	try
 	{
		  appObj = TheApplication();
		  with(appObj)
		  {
			  psInput = NewPropertySet();
			  psOutput = NewPropertySet();
			  bsErrorHandler = GetService(""STC Generic Error Handler"");
		  }
		  with(psInput)
		  {
			  SetProperty(""Error Code"", e.errCode);
			  SetProperty(""Error Message"", e.errText);
			  SetProperty(""Object Name"", ""STC Customer Search"");
			  SetProperty(""Object Type"", ""Buisness Service"");
		  }
		  bsErrorHandler.InvokeMethod(""Log Message"", psInput, psOutput);
 	}
 	catch(e)
 	{
  		// do nothing	
 	}
 	finally
 	{
 
		  bsErrorHandler = null;
		  psOutput = null;
		  psInput = null;
		  appObj = null;
 	}
}
function Query(Inputs,Outputs)
{
	try
	{
/*	var Appobj = TheApplication();
	var sPreviousView = Appobj.GetProfileAttr(""sPreview"");
	if(sPreviousView == ""Response View"") 
	  {
	
	var vFstname = TheApplication().GetProfileAttr(""sFstname"");
	var vLstname = TheApplication().GetProfileAttr(""sLstname"");
	var vCamId = TheApplication().GetProfileAttr(""sCampaignId""); //Added by Sudeep for Campaign
	
	var PsOutputs = Appobj.NewPropertySet();
	//Outputs.SetProperty(""First Name"",sFstname);
	//Outputs.SetProperty(""Last Name"",sLstname);
	PsOutputs.SetProperty(""First Name"",vFstname);
	PsOutputs.SetProperty(""Last Name"",vLstname);
	PsOutputs.SetProperty(""STC Campaign Id"",vCamId); //Added by Sudeep for Campaign
	Outputs.AddChild(PsOutputs);
		//PsOutputs.SetProperty(""Contact First Name"",sFstname);
		//PsOutputs.SetProperty(""Contact Last Name"",sLstnmae);
		
	    }*/
	}
	
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
	
	
	
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	var ireturn=ContinueOperation;
	try
	{
		switch(MethodName)
		{
			case ""Init"":
					Init(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
			case ""Query"":
					Query(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
					
			case ""PreInsert"":
					ireturn = CancelOperation;
					break;
							
			case ""Insert"":
					Insert(Inputs,Outputs);//Mayank: Added for Gaurdian Open UI
					ireturn = CancelOperation;
					break;

			case ""Update"":
					ireturn = CancelOperation;
					break;
	
			case ""Delete"":
					ireturn = CancelOperation;
					break;

			default:
					ireturn = ContinueOperation;
		}
		return(ireturn);
	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
	
}
"var OMRADRE = """";
var OMRADRE1 = """";"
function DREOMRACheck(Inputs, Outputs)
{

var appobj = TheApplication();
var CurrBC="""";var OrderBO="""";
var TimeDiff;
var OtherDisPart="""";var isRecord1;
var LOVBO = appobj.GetBusObject(""List of Values Query"");
var LOVBC = LOVBO.GetBusComp(""List of Values Query"");
//var sDREOMRA = Inputs.GetProperty(""DRE/OMRA Addon"");
var sType = """";
var sLICVAL = Inputs.GetProperty(""sLICVAL"");//Inputted
var sOrderId = Inputs.GetProperty(""sOrderId"");//Inputted
var sPrePostPaid = Inputs.GetProperty(""sPrePostPaid"");//Inputted
var sExpiryDate;var SrchExprOtherProd;

if(sPrePostPaid == ""Postpaid""){

sType = ""STC_DRE_OMRA_POST"";

}
else if(sPrePostPaid == ""Prepaid""){

sType = ""STC_DRE_OMRA_PRE"";
}
var sCurrentDate = Inputs.GetProperty(""sCurrentDate"");//Inputted
var SrchExpr = ""[Type] = '"" + sType + ""' AND [Language Independent Code] <> '""+ sLICVAL + ""'"";
//var SrchExprOtherProd = ""[Order Header Id]= '"" + sOrderId + ""' AND ([Action Code] = '-' OR [Action Code] = 'Delete') AND ([Product Part Number] = '""+ OtherDisPart + ""')"";
//Outputs.SetProperty(""Order Number"",sub_strng);
var i = 0;
var isRecord;

with (LOVBC)
{
        ActivateField(""Display Value"");
        ActivateField(""Language Independent Code"");
        ActivateField(""Type"");ActivateField(""Description"");
        ClearToQuery();
		SetViewMode(AllView);
		SetSearchExpr(SrchExpr);
		ExecuteQuery(ForwardOnly);
	    var count = CountRecords();	
   		isRecord = FirstRecord();//first exclusive discount product

while (isRecord)
{
   
		OtherDisPart = GetFieldValue(""Display Value"");//get Exclusive Discount Prod
		OMRADRE = GetFieldValue(""Description"");//get Exclusive Discount Prod
		OrderBO = appobj.GetBusObject(""MACD Performance Order"");
		CurrBC = OrderBO.GetBusComp(""MACD Order Entry - Line Items"");
        //SrchExprOtherProd = ""[Order Header Id]= '"" + sOrderId + ""' AND ([Action Code] = '-' OR [Action Code] = 'Delete') AND ([Product Part Number] = '""+ OtherDisPart + ""')"";//Working
        SrchExprOtherProd = ""[Order Header Id]= '"" + sOrderId + ""' AND ([Action Code] = '-' OR [Action Code] = 'Delete' OR [Action Code] = 'Update') AND ([Product Part Number] = '""+ OtherDisPart + ""')"";//Working
		with(CurrBC){
		
		ActivateField(""Service End Date"");
			ActivateField(""Order Header Id"");
				ActivateField(""Action Code"");
					ActivateField(""Product Part Number"");
			
	    ClearToQuery();
		SetViewMode(AllView);
		SetSearchExpr(SrchExprOtherProd);//Search in Order Line Items for Expiry Date of Current Order
		ExecuteQuery(ForwardOnly);
   		isRecord1 = FirstRecord();
   		while (isRecord1){
   	
    	sExpiryDate = GetFieldValue(""Service End Date"");
    	sExpiryDate = new Date(sExpiryDate);
		sExpiryDate = sExpiryDate.getTime(); 
		sCurrentDate = new Date(sCurrentDate);
		sCurrentDate = sCurrentDate.getTime(); 
    	TimeDiff =	sCurrentDate - sExpiryDate;
		if (TimeDiff < 0)
		{
			if (OMRADRE == ""OMRA""){
		//TheApplication().RaiseErrorText(""You already have an OMRA AddOn Enabled"");
			//Outputs.SetProperty(""DRE/OMRA Addon"", OMRADRE );
			return(OMRADRE);

			return(CancelOperation);
	      }
	      else if (OMRADRE == ""DRE""){
	      	//TheApplication().RaiseErrorText(""You already have an DRE AddOn Enabled"");
	      	Outputs.SetProperty(""DRE/OMRA Addon"", OMRADRE );
	      	return(OMRADRE);
			return(CancelOperation);
	      }
		}//if (TimeDiff < 0)
		isRecord1 = NextRecord();
		}//while (isRecord1)
		}//with(CurrBC)

   i++;
   isRecord = NextRecord();
}//while (isRecord)

}










}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
 
    switch(MethodName)
     {
		case ""DREOMRACheck"":
		OMRADRE1 = DREOMRACheck(Inputs, Outputs);
		Outputs.SetProperty(""DREOMRA Addon"", OMRADRE1);
		return(CancelOperation);
		break;
 
     default:
          return (ContinueOperation);
       }
 
}
"//Your public declarations go here...  
"
function AppendName(Inputs,Outputs)
{//NAVIN: function to display Contract-Parent details on Query Termination Response:

var DisplayName="""", AssetIntegrationId="""", AppendName="""";
var appObj,boAsset,bcAsset;
var sSerAccntId="""",parAssetId="""",rootAssetId="""",cnt=0,D1="""",D2="""",D2Name="""",InsParAssetId="""";
var DevIntId="""", vServiceAccntId="""", vSearchExpr="""", vDevCnt=0, vPartNum="""", vInsuranceDevFlag="""", isRecord=false;
var ParProdIden="""", ParProdType="""", ParPlanType="""", ParSvcDesc="""";	//NAVIN: 29Jul2021: C5G Contract Display Name Fix

try
{
	//appObj = TheApplication();
	boAsset = TheApplication().GetBusObject(""STC Asset Mgmt - Asset Thin BO"");
    bcAsset = boAsset.GetBusComp(""STC Asset Mgmt - Asset Thin"");

	with(Inputs)
	{
	    AssetIntegrationId = GetProperty(""AssetIntegrationId"");
	    DisplayName = GetProperty(""DisplayName"");
	}
	Outputs.SetProperty(""AppendName"", """");
	with(bcAsset)
	{
		if(DisplayName == ""MainContract"" || DisplayName == ""OtherContract - Service"") //If Main Contract is present Get the Plan Name
		{	
			ActivateField(""Product Name"");
			ActivateField(""Integration Id"");
			ActivateField(""STC Display Name"");
			ActivateField(""Root Asset Id"");
			ActivateField(""Product Name"");
			ActivateField(""Service Account Id"");
			ClearToQuery();
		   	SetSearchSpec(""Integration Id"", AssetIntegrationId);
		   	SetSearchSpec(""Status"", ""Active"");
		   	ExecuteQuery(ForwardOnly);
			cnt=CountRecords();
			if(cnt>0 && FirstRecord())
			{
				vServiceAccntId = GetFieldValue(""Service Account Id"");
				rootAssetId=GetFieldValue(""Root Asset Id"");
				D1=GetFieldValue(""STC Display Name"");
				if(D1.length<=0)
				{
					D1=GetFieldValue(""Product Name"");
				}
			}
			else
			{
				TheApplication().RaiseErrorText(""No Asset found with integation id:""+AssetIntegrationId);
			}
			ActivateField(""STC Display Name"");
			ActivateField(""STC Plan Type"");
			ActivateField(""Status"");
			ActivateField(""Root Asset Id"");
			ActivateField(""Product Name"");
			ClearToQuery();
			SetSearchSpec(""Service Account Id"",vServiceAccntId);
			SetSearchSpec(""Root Asset Id"",rootAssetId);
			SetSearchSpec(""Status"",""Active"");
			SetSearchSpec(""STC Plan Type"",""Service Plan"");
			ExecuteQuery(ForwardOnly);
			cnt=CountRecords();
			if(cnt>0 && FirstRecord())
			{
				D2=GetFieldValue(""STC Display Name"");
				D2Name=GetFieldValue(""Product Name"");
			}
			else
			{
				TheApplication().RaiseErrorText(""No Servicve Plan found for root asset id:""+rootAssetId);
			}
			if(D2.length<=0)
			{
				if(D2Name != null && D2Name != """")
					Outputs.SetProperty(""AppendName"", D1+""_""+D2Name);
				else
					Outputs.SetProperty(""AppendName"", D1);
			}
			else
			{
				Outputs.SetProperty(""AppendName"", D1+""_""+D2);
			}
		}//end of if(DisplayName == ""MainContract""

		if(DisplayName == ""AddonContract"" || DisplayName == ""OtherContract - Device"" || DisplayName == ""OtherContract - EarlyTerm"")
		{//if AddonContract is there check for Device
			ActivateField(""Product Name"");
			ActivateField(""Integration Id"");
			ActivateField(""STC Display Name"");
			ActivateField(""Root Asset Id"");
			ActivateField(""Parent Asset Id"");
			ActivateField(""Service Account Id"");
			ActivateField(""Product Part Number"");
			ClearToQuery();
		   	SetSearchSpec(""Integration Id"", AssetIntegrationId);
		   	SetSearchSpec(""Status"", ""Active"");
		   	ExecuteQuery(ForwardOnly);
			cnt=CountRecords();
			if(cnt>0 && FirstRecord())
			{
				vServiceAccntId = GetFieldValue(""Service Account Id"");
				rootAssetId=GetFieldValue(""Root Asset Id"");
				parAssetId=GetFieldValue(""Parent Asset Id"");
				D1=GetFieldValue(""STC Display Name"");
				vPartNum = GetFieldValue(""Product Part Number"");
				if(D1.length<=0)
				{
					D1=GetFieldValue(""Product Name"");
				}
			}
			else
			{
				TheApplication().RaiseErrorText(""No Asset found with integation id:""+AssetIntegrationId);
			}
			vPartNum = vPartNum.substring(0,12);
			if(vPartNum == ""VIPCD5GFIXED"")
			{}
			else{
				ActivateField(""STC Display Name"");
				ActivateField(""Product Name"");
				ActivateField(""Type"");	//NAVIN: 29Jul2021: C5G Contract Display Name Fix
				ActivateField(""STC Plan Type"");
				ActivateField(""STC Service Description"");
				ActivateField(""Status"");
				ActivateField(""Parent Asset Id"");
				ActivateField(""Root Asset Id"");
				ActivateField(""STC Unlimited DRE AIA"");
				ActivateField(""STC Plan Elig"");
				if(rootAssetId != parAssetId && parAssetId != """")
				{
					ClearToQuery();
					SetSearchSpec(""Id"",parAssetId);
					SetSearchSpec(""Status"",""Active"");
					//SetSearchSpec(""STC Plan Type"",""Equipment"");	//NAVIN: 29Jul2021: C5G Contract Display Name Fix
					//SetSearchSpec(""STC Service Description"",""AddOnEquipment"");	//NAVIN: 29Jul2021: C5G Contract Display Name Fix
					ExecuteQuery(ForwardOnly);
					vDevCnt=CountRecords();
					if(vDevCnt>0 && FirstRecord())
					{
						//NAVIN: 29Jul2021: C5G Contract Display Name Fix
						ParProdType = GetFieldValue(""Type"");
						ParPlanType = GetFieldValue(""STC Plan Type"");
						ParSvcDesc = GetFieldValue(""STC Service Description"");
						if (ParPlanType == ""Equipment"" || ParProdType != ""Package"")
						{
							D2=GetFieldValue(""STC Display Name"");
							D2Name=GetFieldValue(""Product Name"");
						}
						else
							vDevCnt = 0;
					}
				}
				if(vDevCnt == 0)
				{
					ClearToQuery();
					vSearchExpr = ""[Service Account Id]='""+vServiceAccntId+""' AND [STC Plan Type]='Equipment' AND [STC Service Description]='AddOnEquipment' AND ([STC Unlimited DRE AIA] IS NULL OR [STC Unlimited DRE AIA]='Single') AND ([STC Plan Elig] IS NULL OR [STC Plan Elig]<>'Accessory') AND [Status] <> 'Inactive'"";

					SetSearchExpr(vSearchExpr);
					ExecuteQuery(ForwardOnly);
					vDevCnt=CountRecords();
					if(vDevCnt>0 && FirstRecord())
					{
						D2=GetFieldValue(""STC Display Name"");
						D2Name=GetFieldValue(""Product Name"");
					}
					else
					{
						TheApplication().RaiseErrorText(""No Device found for contract with integration id:""+AssetIntegrationId);
					}
				}
			}

			if(D2.length<=0)
			{
				if(D2Name != null && D2Name != """")
					Outputs.SetProperty(""AppendName"", D1+""_""+D2Name);
				else
					Outputs.SetProperty(""AppendName"", D1);
			}
			else
			{
				Outputs.SetProperty(""AppendName"", D1+""_""+D2);
			}
		}//end of if(DisplayName == ""AddonContract""

		if(DisplayName == ""OtherContract"" || DisplayName == ""OtherContract - Insurance"" || DisplayName == ""OtherContract - Vanity"") //If Main Contract is present Get the Plan Name
		{
			ActivateField(""Product Name"");
			ActivateField(""Integration Id"");
			ActivateField(""STC Display Name"");
			ActivateField(""Root Asset Id"");
			ActivateField(""Parent Asset Id"");
			ActivateField(""Service Account Id"");
			ClearToQuery();
		   	SetSearchSpec(""Integration Id"", AssetIntegrationId);
		   	SetSearchSpec(""Status"", ""Active"");
		   	ExecuteQuery(ForwardOnly);
			cnt=CountRecords();
			if(cnt>0 && FirstRecord())
			{
				vServiceAccntId = GetFieldValue(""Service Account Id"");
				rootAssetId=GetFieldValue(""Root Asset Id"");
				D1=GetFieldValue(""STC Display Name"");
				//DevIntId = GetFieldValue(""STC Contract Par Asset Integ Id"");
				InsParAssetId=GetFieldValue(""Parent Asset Id"");
				
				if(D1.length<=0)
				{
					D1=GetFieldValue(""Product Name"");
				}
			}
			else
			{
				TheApplication().RaiseErrorText(""No Asset found with integation id:""+AssetIntegrationId);
			}

			if(DisplayName == ""OtherContract - Insurance"" && InsParAssetId != """")
			{	
				ActivateField(""STC Display Name"");
				ActivateField(""Product Name"");
				ActivateField(""STC Plan Type"");
				ActivateField(""STC Service Description"");
				ActivateField(""Status"");
				ActivateField(""Parent Asset Id"");
				ActivateField(""STC Contract Par Asset Integ Id"");
				ActivateField(""STC Product Identifier"");
				
				ClearToQuery();
				SetSearchSpec(""Id"",InsParAssetId);
				SetSearchSpec(""Status"",""Active"");
				ExecuteQuery(ForwardOnly);
				cnt=CountRecords();
				if(cnt>0 && FirstRecord())
				{
					DevIntId = GetFieldValue(""STC Contract Par Asset Integ Id"");
					ParProdIden = GetFieldValue(""STC Product Identifier"");
					D2=GetFieldValue(""STC Display Name"");
					D2Name=GetFieldValue(""Product Name"");
					
					ActivateField(""STC Display Name"");
					ActivateField(""Product Name"");
					ActivateField(""STC Plan Type"");
					ActivateField(""STC Service Description"");
					ActivateField(""Status"");
					ActivateField(""Parent Asset Id"");
					ActivateField(""Service Account Id"");
					ActivateField(""Product Part Number"");
					ClearToQuery();
					if(DevIntId != null && DevIntId != """")
					{
						vSearchExpr = ""[Service Account Id]='""+vServiceAccntId+""' AND [Integration Id]='""+DevIntId+""' AND [STC Plan Type]='Equipment' AND [Status] <> 'Inactive'"";

						SetSearchExpr(vSearchExpr);
						ExecuteQuery(ForwardOnly);
						cnt=CountRecords();
						if(cnt>0 && FirstRecord())
						{
							D2=GetFieldValue(""STC Display Name"");
							D2Name=GetFieldValue(""Product Name"");
						}
					}
					else{
						if (ParProdIden == ""Device Insurance"" || ParProdIden == ""Extended Warranty"")
						{
							vSearchExpr = ""[Service Account Id]='""+vServiceAccntId+""' AND [STC Plan Type]='Equipment' AND [STC Service Description]='AddOnEquipment' AND [Status] <> 'Inactive'"";

							SetSearchExpr(vSearchExpr);
							ExecuteQuery(ForwardOnly);
							cnt=CountRecords();
							isRecord = FirstRecord();

							while(cnt>0 && isRecord)
							{
								vPartNum = GetFieldValue(""Product Part Number"");
								vInsuranceDevFlag = TheApplication().InvokeMethod(""LookupValue"", ""STC_INSURANCE_DEVICES"", vPartNum);
								vInsuranceDevFlag = vInsuranceDevFlag.substring(0,6);
								if(vInsuranceDevFlag == ""DEVICE"")
								{
									D2=GetFieldValue(""STC Display Name"");
									D2Name=GetFieldValue(""Product Name"");
								}
								isRecord = NextRecord();
							}//while(cnt>0 && isRecord)
						}//end of if (ParProdIden == ""Device Insurance""	
					}
				}
			}//if(vPartNum == ""VIPCD5GFIXED"")
			if(D2.length<=0)
			{
				if(D2Name != null && D2Name != """")
					Outputs.SetProperty(""AppendName"", D1+""_""+D2Name);
				else
					Outputs.SetProperty(""AppendName"", D1);
			}
			else
			{
				Outputs.SetProperty(""AppendName"", D1+""_""+D2);
			}
		}//end of if(DisplayName == ""OtherContract""
	}//end of with(bcAsset)
}
catch(e)
{
	LogException(e);
}
finally
{
	bcAsset = null;
	boAsset = null;
	//appObj = null;
}
}
function CollectionExCheck(Inputs,Outputs)
{
		try
		{
			var vParentAccId = """",vBillAccId = """",vCustSegment = """",vOccupation = """",vPortalEx = """", vElite ="""",vExFlag = ""0"";
			var svcBS ="""",input ="""",output ="""",OccupationCategory ="""",vCat ="""",OutBal =0,vCatFlag ="""",MSISDN ="""",SRCnt =0;
			vBillAccId =  Inputs.GetProperty(""BillingId"");
			var vSTCBillAccBO = TheApplication().GetBusObject(""STC Billing Account"");
			var vBillAccBC = vSTCBillAccBO.GetBusComp(""CUT Invoice Sub Accounts"");
			var vAccntBC = vSTCBillAccBO.GetBusComp(""Account"");
			var vServiceBC = vSTCBillAccBO.GetBusComp(""CUT Service Sub Accounts"");
			var boSR = TheApplication().GetBusObject(""Service Request"");
            var bcSR = boSR.GetBusComp(""Service Request"");
			//TheApplication().RaiseErrorText(vBillAccId);
			with(vBillAccBC)
			{
				ActivateField(""STC Contract Category"");
				ActivateField(""Credit Score"");
				ActivateField(""STC Billing Acc Segment"");
				ActivateField(""Parent Account Id"");
				ActivateField(""Occupation"");
				ActivateField(""STC Portal Collection Ex"");
				ActivateField(""STC Service Type"");
				SetViewMode(AllView);
				ClearToQuery();
				var vSearch =""[Id] = '"" + vBillAccId + ""'AND [Account Status]<>'Inactive' AND ([STC Corporate Type]='Individual' OR [STC Corporate Type] IS NULL) AND [STC Service Type]='Postpaid'"";
				//SetSearchSpec(""Id"", vBillAccId);
				//SetSearchSpec(""STC Service Type"", ""Postpaid"");
				SetSearchExpr(vSearch);
				ExecuteQuery(ForwardOnly);
				
				if (FirstRecord())
				{
					vCustSegment = GetFieldValue(""STC Contract Category"");
					vParentAccId = GetFieldValue(""Parent Account Id"");
					vOccupation = GetFieldValue(""Occupation"");
					vPortalEx = GetFieldValue(""STC Portal Collection Ex"");
					if(vParentAccId !="""")
					{
						with(vAccntBC)
						{
							ActivateField(""STC Elite Count Calc"");
							SetViewMode(AllView);
							ClearToQuery();
							SetSearchSpec(""Id"", vParentAccId);
							ExecuteQuery(ForwardOnly);
							if(FirstRecord())
							{
								vElite = GetFieldValue(""STC Elite Count Calc"");
								input = TheApplication().NewPropertySet();
								output = TheApplication().NewPropertySet();
								input.SetProperty(""AccountId"", vParentAccId);
								input.SetProperty(""EshopFlag"", ""Y"");
								input.SetProperty(""ByPassExp"", ""Y"");
								svcBS = TheApplication().GetService(""STC Customer Age on Network BS"");
								svcBS.InvokeMethod(""AgeOnNetwork_New"",input, output);
								OccupationCategory = output.GetProperty(""Occupation Category"");
								vCat = OccupationCategory.substring(0,5);
								if(vCat == ""CAT 1"" || vCat == ""CAT 2"")
								{
									with(vServiceBC)
									{
										ActivateField(""DUNS Number"");
										ActivateField(""Parent Account Id"");
										ActivateField(""STC Pricing Plan Type"");
										SetViewMode(AllView);
										ClearToQuery();
										SetSearchSpec(""Parent Account Id"", vBillAccId);
										SetSearchSpec(""STC Pricing Plan Type"", ""Postpaid"");
										ExecuteQuery(ForwardOnly);
										if(FirstRecord())
										{
											MSISDN = GetFieldValue(""DUNS Number"");
											var InputPS = TheApplication().NewPropertySet();
											var OutputPS = TheApplication().NewPropertySet();
											InputPS.SetProperty(""MSISDN"",MSISDN);
											InputPS.SetProperty(""ProcessName"",""STC OutstandingPayment WF"" );
											var WFBs = TheApplication().GetService(""Workflow Process Manager"");
											WFBs.InvokeMethod(""RunProcess"",InputPS,OutputPS);
											OutBal = OutputPS.GetProperty(""OutStandingAmt"");
											if(OutBal !="""" || OutBal != null)
											{
												OutBal = ToNumber(OutBal);
											}
											if (OutBal <= 50)
											{
												vCatFlag =""Y"";
											}
										}
									} // with vServiceBC
								 } //If vCat
							} //Accnt FirstRec
						} //with vAccntBC
					} //If Parentid
		
						var strSRSpec =  ""([INS Sub-Area] = 'Collection Barring' or [INS Sub-Area] = 'Collection Un-barring') and [Billing Account Id]='"" + vBillAccId  + ""' AND [Status]<> 'Closed'"";	
						with(bcSR)
						{
							SetViewMode(AllView);
							ClearToQuery();
							SetSearchExpr(strSRSpec);
							ExecuteQuery(ForwardOnly); 
							SRCnt = CountRecords();
						}
					if (vCustSegment == ""A"" || vCustSegment == ""B"" || vCustSegment == ""C"" || vCustSegment == ""D"" || vCustSegment ==""Employees"")
					{
						Outputs.SetProperty(""vExFlag"",""2"");
					}
					else if(vPortalEx == ""Y"" || SRCnt > 0)
					{
						Outputs.SetProperty(""vExFlag"",""4"");
						
					}
					else if(vElite == ""Y"")
					{
						Outputs.SetProperty(""vExFlag"",""3"");
					}
					else if(vCatFlag == ""Y"")
					{
						Outputs.SetProperty(""vExFlag"",""1"");
					}
					else
					{
						Outputs.SetProperty(""vExFlag"",""0"");
					}


				}// First Record
				else
				{
					Outputs.SetProperty(""vExFlag"",""0"");
				}
			}// With vBillAccBC
		}
		catch(e)
		{
			throw(e);
		}
		finally
		{

		}
}
function GetAddonServices(Inputs, Outputs)
{
/// Abuzar: 19Jan2020: Check if Internation Barring AddOn is selected.
///Hardik:09Feb2020: Added display name changes.
var LineId;
var HeaderId;
var strBO:BusObject, strBCHeader:BusComp, strBCLine:BusComp, strMvgBC:BusComp;
var appObj;
var InternationalCallsFlag, strProdName, strNextRecord,strProdDisName,vProdName,vProdDisName;
try{
		strProdName = """";
		LineId = Inputs.GetProperty(""LineId"");
		HeaderId = Inputs.GetProperty(""HeaderId"");
		appObj = TheApplication();
		strBO = appObj.GetBusObject(""STC Business Bulk Activation BO"");
		strBCHeader = strBO.GetBusComp(""STC Bulk Activation Header BC"");
	//	if(HeaderId != '' && HeaderId != null && LineId != '' && LineId != null)
//		{ 

			with(strBCHeader)
			{
			 SetViewMode(AllView); 
			 ClearToQuery();
			// ActivateField();
			 SetSearchSpec(""Id"", HeaderId);
			 ExecuteQuery(ForwardOnly);
			 if(FirstRecord())
				{
					strBCLine = strBO.GetBusComp(""STC Business Activation Bulk Data BC"");
					with(strBCLine)
					{
						 SetViewMode(AllView); 
						 ClearToQuery();
						// ActivateField(""Barring-InternationalCalls Flag"");
						 SetSearchSpec(""Id"", LineId);
						 ExecuteQuery(ForwardOnly);
						if(FirstRecord())
						{
							strMvgBC = GetMVGBusComp(""AddonServices Name"");
							with(strMvgBC)
							{
								strNextRecord = strMvgBC.FirstRecord();
								while(strNextRecord == true)
								{
									if(strProdName == '' || strProdName == null)
									{
										strProdName = GetFieldValue(""Product Name"");
										strProdDisName = GetFieldValue(""Product Display Name"");
										if(strProdDisName !="""" && strProdDisName != null)
										{
											strProdName = strProdDisName;
										}

									}
									else
									{
										vProdName = GetFieldValue(""Product Name"");
										vProdDisName = GetFieldValue(""Product Display Name"");
										if (vProdDisName != """" && vProdDisName != null)
										{
											vProdName = vProdDisName;
										}
										strProdName = strProdName + "","" + vProdName;
										//strProdName = strProdName + "","" + GetFieldValue(""Product Name""); // [Hardik:Business catalog]
									}
									strNextRecord = NextRecord();
								}
	
							
							}
						}
					}
				}
	
			}
	//	}
		Outputs.SetProperty(""AddonServices"", strProdName);	
		
		return (CancelOperation);
	}
catch(e){
throw(e);
}
finally{
}
}
function GetAddonServices(Inputs, Outputs)
{
/// Abuzar: 19Jan2020: Check if Internation Barring AddOn is selected.
///Hardik:09Feb2020: Added display name changes.
var LineId;
var HeaderId;
var strBO:BusObject, strBCHeader:BusComp, strBCLine:BusComp, strMvgBC:BusComp;
var appObj;
var InternationalCallsFlag, strProdName, strNextRecord,strProdDisName,vProdName,vProdDisName;
try{
		strProdName = """";
		LineId = Inputs.GetProperty(""LineId"");
		HeaderId = Inputs.GetProperty(""HeaderId"");
		appObj = TheApplication();
		strBO = appObj.GetBusObject(""STC Business Bulk Activation BO"");
		strBCHeader = strBO.GetBusComp(""STC Bulk Activation Header BC"");
	//	if(HeaderId != '' && HeaderId != null && LineId != '' && LineId != null)
//		{ 

			with(strBCHeader)
			{
			 SetViewMode(AllView); 
			 ClearToQuery();
			// ActivateField();
			 SetSearchSpec(""Id"", HeaderId);
			 ExecuteQuery(ForwardOnly);
			 if(FirstRecord())
				{
					strBCLine = strBO.GetBusComp(""STC Business Activation Bulk Data BC"");
					with(strBCLine)
					{
						 SetViewMode(AllView); 
						 ClearToQuery();
						// ActivateField(""Barring-InternationalCalls Flag"");
						 SetSearchSpec(""Id"", LineId);
						 ExecuteQuery(ForwardOnly);
						if(FirstRecord())
						{
							strMvgBC = GetMVGBusComp(""AddonServices Name"");
							with(strMvgBC)
							{
								strNextRecord = strMvgBC.FirstRecord();
								while(strNextRecord == true)
								{
									if(strProdName == '' || strProdName == null)
									{
										strProdName = GetFieldValue(""Product Name"");
										strProdDisName = GetFieldValue(""Product Display Name"");
										if(strProdDisName !="""" && strProdDisName != null)
										{
											strProdName = strProdDisName;
										}

									}
									else
									{
										vProdName = GetFieldValue(""Product Name"");
										vProdDisName = GetFieldValue(""Product Display Name"");
										if (vProdDisName != """" && vProdDisName != null)
										{
											vProdName = vProdDisName;
										}
										strProdName = strProdName + "","" + vProdName;
										//strProdName = strProdName + "","" + GetFieldValue(""Product Name""); // [Hardik:Business catalog]
									}
									strNextRecord = NextRecord();
								}
	
							
							}
						}
					}
				}
	
			}
	//	}
		Outputs.SetProperty(""AddonServices"", strProdName);	
		
		return (CancelOperation);
	}
catch(e){
throw(e);
}
finally{
}
}
function GetDRBlockStatus(Inputs,Outputs)
{
var boAsset:BusObject, bcAsset:BusComp;
var appObj;
var strSearchExpr;
var strDRBlock=""Unblocked"";
var strMSISDN, strPartNum;

try{

		appObj = TheApplication();

		boAsset = appObj.GetBusObject(""STC Asset Mgmt - Asset Thin BO"");
		bcAsset = boAsset.GetBusComp(""STC Asset Mgmt - Asset Thin"");
		strMSISDN =  Inputs.GetProperty(""MSISDN"");
		strPartNum = appObj.InvokeMethod(""LookupValue"", ""STC_ADDON_REQ_ADMIN"", ""International_Bar"");
		if(strMSISDN != """" && strMSISDN != null)
		{

			with(bcAsset)
			{
			 SetViewMode(AllView); 
			 ClearToQuery();
			 strSearchExpr = ""[Serial Number]='"" + strMSISDN + ""' AND [Status]='Active' AND [Part] LIKE '"" + strPartNum + ""'"";
			 SetSearchExpr(strSearchExpr);
			 ExecuteQuery(ForwardOnly);
			 if(FirstRecord())
				{
					strDRBlock=""Blocked"";
				}
			}
		}


}
catch(e){
throw(e);
}
finally{
Outputs.SetProperty(""DRBlock"",strDRBlock);
}

}
function GetDataAddonFlag(Inputs, Outputs)
{
/// Abuzar: 19Jan2020: Check if Internation Barring AddOn is selected.
var LineId;
var HeaderId;
var strBO:BusObject, strBCHeader:BusComp, strBCLine:BusComp;
var appObj;
var InternationalCallsFlag;
try{
		InternationalCallsFlag = """";
		LineId = Inputs.GetProperty(""LineId"");
		HeaderId = Inputs.GetProperty(""HeaderId"");
		appObj = TheApplication();
		strBO = appObj.GetBusObject(""STC Business Bulk Activation BO"");
		strBCHeader = strBO.GetBusComp(""STC Bulk Activation Header BC"");
	//	if(HeaderId != '' && HeaderId != null && LineId != '' && LineId != null)
//		{ 
			with(strBCHeader)
			{
			 SetViewMode(AllView); 
			 ClearToQuery();
			// ActivateField();
			 SetSearchSpec(""Id"", HeaderId);
			 ExecuteQuery(ForwardOnly);
			 if(FirstRecord())
				{
					strBCLine = strBO.GetBusComp(""STC Business Activation Bulk Data BC"");
					with(strBCLine)
					{
						 SetViewMode(AllView); 
						 ClearToQuery();
						 ActivateField(""Barring-Data Flag"");
						 SetSearchSpec(""Id"", LineId);
						 ExecuteQuery(ForwardOnly);
						if(FirstRecord())
						{
							InternationalCallsFlag = GetFieldValue(""Barring-Data Flag"");
						/*	if(InternationalCallsFlag == 'Y')
								Outputs.SetProperty(""DataAddonFlag"", InternationalCallsFlag);	
							else
								Outputs.SetProperty(""DataAddonFlag"", ""N"");	*/
						}
					}
				}
	
			}
//		}

Outputs.SetProperty(""DataAddonFlag"", InternationalCallsFlag);	
		
		return (CancelOperation);
	}
catch(e){
throw(e);
}
finally{
}
}
function GetDeviceNetPrice(Inputs, Outputs)
{
var strOrderId, strProdId;
var strBO:BusObject, strBCHeader:BusComp, strBCLine:BusComp, strMvgBC:BusComp;
var appObj;
var strNetPrice;
try{
	 strNetPrice = """";
	 strOrderId = Inputs.GetProperty(""Order Id"");
	 strProdId = Inputs.GetProperty(""Prod Id"");
	if (strOrderId != '' && strOrderId != null && strProdId != ''  && strProdId != null)
	{
		appObj = TheApplication();
		strBO = appObj.GetBusObject(""Order Item"");
		strBCHeader = strBO.GetBusComp(""Order Entry - Line Items (Simple)"");
		with(strBCHeader)
		{
			 SetViewMode(AllView); 
			 ClearToQuery();
			 //ActivateField(""Current Order Total Net Price MRC"");
			 SetSearchSpec(""Order Header Id"", strOrderId);
			 SetSearchSpec(""Product Id"", strProdId);
			 ExecuteQuery(ForwardOnly);
			 if(FirstRecord())
			{
				strNetPrice = GetFieldValue(""Net Price"");
			}
		}
	}
	Outputs.SetProperty(""NetPrice"", strNetPrice);
}
catch(e){
throw(e);
}
finally{
}
}
function GetInternationalAddonFlag(Inputs, Outputs)
{
/// Abuzar: 19Jan2020: Check if Internation Barring AddOn is selected.
var LineId;
var HeaderId;
var strBO:BusObject, strBCHeader:BusComp, strBCLine:BusComp;
var appObj;
var InternationalCallsFlag;
try{
		InternationalCallsFlag = """";
		LineId = Inputs.GetProperty(""LineId"");
		HeaderId = Inputs.GetProperty(""HeaderId"");
		appObj = TheApplication();
		strBO = appObj.GetBusObject(""STC Business Bulk Activation BO"");
		strBCHeader = strBO.GetBusComp(""STC Bulk Activation Header BC"");
	//	if(HeaderId != '' && HeaderId != null && LineId != '' && LineId != null)
//		{ 
			with(strBCHeader)
			{
			 SetViewMode(AllView); 
			 ClearToQuery();
			// ActivateField();
			 SetSearchSpec(""Id"", HeaderId);
			 ExecuteQuery(ForwardOnly);
			 if(FirstRecord())
				{
					strBCLine = strBO.GetBusComp(""STC Business Activation Bulk Data BC"");
					with(strBCLine)
					{
						 SetViewMode(AllView); 
						 ClearToQuery();
						 ActivateField(""Barring-InternationalCalls Flag"");
						 SetSearchSpec(""Id"", LineId);
						 ExecuteQuery(ForwardOnly);
						if(FirstRecord())
						{
							InternationalCallsFlag = GetFieldValue(""Barring-InternationalCalls Flag"");
						/*	if(InternationalCallsFlag == 'Y')
								Outputs.SetProperty(""InternationalAddonFlag"", InternationalCallsFlag);	
							else
								Outputs.SetProperty(""InternationalAddonFlag"", ""N"");	*/
						}
					}
				}
	
			}
	//	}

Outputs.SetProperty(""InternationalAddonFlag"", InternationalCallsFlag);	
		
		return (CancelOperation);
	}
catch(e){
throw(e);
}
finally{
}
}
function GetKAMName(Inputs, Outputs)
{
var strOrderId;
var strBO:BusObject, strBCHeader:BusComp, strBCLine:BusComp, strMvgBC:BusComp;
var appObj;
var strMonthlyFeeBD,strCANId, strKAMName;
var strKAMFName, strKAMLName;
var strSearchExpr;
try{
	strCANId = Inputs.GetProperty(""CAN Id"");
	strKAMName = """"
	 
	if (strCANId != '' && strCANId != null)
	{
		appObj = TheApplication();
		strBO = appObj.GetBusObject(""Account"");
		strBCHeader = strBO.GetBusComp(""Account"");
		with(strBCHeader)
		{
			 SetViewMode(AllView); 
			 ClearToQuery();
		 	 //strSearchExpr=""[Customer Id]='"" + strCANId + ""' AND [Type] = 'Account Admin' AND ([STC Status] IS NULL OR [STC Status] <> 'Marked for Deletion') AND [Admin Type] = 'Account Manager'"";
			 ActivateField(""STC BAM Last Name"");
			 ActivateField(""STC BAM First Name"");
			 SetSearchSpec(""Id"", strCANId);

			 ExecuteQuery(ForwardOnly);
			 if(FirstRecord())
			{
				strKAMFName = GetFieldValue(""STC BAM First Name"");
				strKAMLName = GetFieldValue(""STC BAM Last Name"");
				strKAMName = strKAMFName + "" "" + strKAMLName;
			}
		}
	}
	Outputs.SetProperty(""KAMName"", strKAMName);
}
catch(e){
throw(e);
}
finally{
}
}
function GetOrderMRC(Inputs, Outputs)
{
var strOrderId;
var strBO:BusObject, strBCHeader:BusComp, strBCLine:BusComp, strMvgBC:BusComp;
var appObj;
var strMonthlyFeeBD;
try{
	 strMonthlyFeeBD = """";
	 strOrderId = Inputs.GetProperty(""Order Id"");
	if (strOrderId != '' && strOrderId != null)
	{
		appObj = TheApplication();
		strBO = appObj.GetBusObject(""Order Entry (Sales)"");
		strBCHeader = strBO.GetBusComp(""Order Entry - Orders"");
		with(strBCHeader)
		{
			 SetViewMode(AllView); 
			 ClearToQuery();
			 ActivateField(""Current Order Total Net Price MRC"");
			 SetSearchSpec(""Id"", strOrderId);
			 ExecuteQuery(ForwardOnly);
			 if(FirstRecord())
			{
				strMonthlyFeeBD = GetFieldValue(""Current Order Total Net Price MRC"");
			}
		}
	}
	Outputs.SetProperty(""MonthlyFeeBD"", strMonthlyFeeBD);
}
catch(e){
throw(e);
}
finally{
}
}
function GetTRACANSANDetails(Inputs,Outputs)
{	
	var vApp: Application = TheApplication();
	var MSISDN = """",IDType="""",IDNumber="""",CANId = """",SANId = """";
	var StrSearch = """";
	with(Inputs)
	{
		MSISDN = GetProperty(""MSISDN"");
		IDType = GetProperty(""IDType"");
		IDNumber = GetProperty(""IDNumber"");
		CANId = GetProperty(""CANId"");
	}
	try
	{
		
		var SANBC = vApp.GetBusObject(""STC Service Account"").GetBusComp(""CUT Service Sub Accounts"");
		with(SANBC)
		{
			SetViewMode(AllView);
			ActivateField(""Master Account Id"");
			ActivateField(""DUNS Number"");
			ActivateField(""Account Status"");
			
			ClearToQuery();
			StrSearch = ""[DUNS Number] = '"" + MSISDN + ""' AND [Account Status] <> 'New' AND [Account Status] <> 'Terminated'"";  
			SetSearchExpr(StrSearch);    
			ExecuteQuery(ForwardOnly); 

			if(FirstRecord())
			{
				CANId = GetFieldValue(""Master Account Id"");
				SANId = GetFieldValue(""Id"");
			}
			Outputs.SetProperty(""CANId"", CANId);
			Outputs.SetProperty(""SANId"", SANId);
		}
	}
	finally
	{
		vApp = null;
	}
	return(ContinueOperation);
}
function GetVoiceAddonFlag(Inputs, Outputs)
{
/// Abuzar: 19Jan2020: Check if Internation Barring AddOn is selected.
var LineId;
var HeaderId;
var strBO:BusObject, strBCHeader:BusComp, strBCLine:BusComp;
var appObj;
var InternationalCallsFlag;
try{
		InternationalCallsFlag = """";
		LineId = Inputs.GetProperty(""LineId"");
		HeaderId = Inputs.GetProperty(""HeaderId"");
		appObj = TheApplication();
		strBO = appObj.GetBusObject(""STC Business Bulk Activation BO"");
		strBCHeader = strBO.GetBusComp(""STC Bulk Activation Header BC"");
	//	if(HeaderId != '' && HeaderId != null && LineId != '' && LineId != null)
	//	{ 
			with(strBCHeader)
			{
			 SetViewMode(AllView); 
			 ClearToQuery();
			// ActivateField();
			 SetSearchSpec(""Id"", HeaderId);
			 ExecuteQuery(ForwardOnly);
			 if(FirstRecord())
				{
					strBCLine = strBO.GetBusComp(""STC Business Activation Bulk Data BC"");
					with(strBCLine)
					{
						 SetViewMode(AllView); 
						 ClearToQuery();
						 ActivateField(""Barring-Voice Flag"");
						 SetSearchSpec(""Id"", LineId);
						 ExecuteQuery(ForwardOnly);
						if(FirstRecord())
						{
							InternationalCallsFlag = GetFieldValue(""Barring-Voice Flag"");
						
							//Outputs.SetProperty(""VoiceAddonFlag"", InternationalCallsFlag);	
						
						}
					}
				}
	
			}
	//	}

Outputs.SetProperty(""VoiceAddonFlag"", InternationalCallsFlag);	
		
		return (CancelOperation);
	}
catch(e){
throw(e);
}
finally{
}
}
function INSTR(Inputs,Outputs)
{
	var SHORTCODE = Inputs.GetProperty(""SHORTCODE"");
	var PositionFirst = 0,  IncPositionFirst=0,PositionSecond = 0,ExtractLength = 0;
	PositionFirst = SHORTCODE.indexOf(""_"", 0);
	IncPositionFirst = PositionFirst + 1;
	PositionSecond = SHORTCODE.indexOf(""_"", IncPositionFirst);
	ExtractLength = PositionSecond - IncPositionFirst;
	SHORTCODE = SHORTCODE.substr( IncPositionFirst,ExtractLength);
	Outputs.SetProperty(""SHORTCODE"", SHORTCODE );

 return CancelOperation;
}
"//Your public declarations go here...  
function LogException(e)
{
 var appObj;
   var psInput;
   var psOutput;
   var bsErrorHandler; 
 try
  {
    appObj = TheApplication();
    with(appObj)
    {
     psInput = NewPropertySet();
     psOutput = NewPropertySet();
     bsErrorHandler = GetService(""STC Generic Error Handler"");
    }
    with(psInput)
    {
     SetProperty(""Error Code"", e.errCode);
     SetProperty(""Error Message"", e.errText);
     SetProperty(""Object Name"", ""STC Contract Name Modification BS"");
     SetProperty(""Object Type"", ""Buisness Service"");
    }
    bsErrorHandler.InvokeMethod(""Log Message"", psInput, psOutput);
  }
  catch(e)
  {
    // do nothing 
  }
  finally
  {
 
    bsErrorHandler = null;
    psOutput = null;
    psInput = null;
    appObj = null;
  }
}
function Service_InvokeMethod (MethodName, Inputs, Outputs)
{

}
function Service_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	return (ContinueOperation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName ==""GetTRACANSANDetails"")
	{
		GetTRACANSANDetails(Inputs,Outputs);
		return(CancelOperation);
	}

	if(MethodName == ""INSTR"")
	{
		INSTR(Inputs,Outputs);
		return CancelOperation;
	 }
	 if(MethodName == ""AppendName"")
	{
		AppendName(Inputs,Outputs);
		return CancelOperation;
	 }


	// Abuzar 19Jan2020 Added for Automate Sales Journey - Start 
	if(MethodName == ""GetInternationalAddonFlag"")
	{
		GetInternationalAddonFlag(Inputs,Outputs);
		return (CancelOperation);
	}

		if(MethodName == ""GetVoiceAddonFlag"")
	{
		GetVoiceAddonFlag(Inputs,Outputs);
		return (CancelOperation);
	}

		if(MethodName == ""GetDataAddonFlag"")
	{
		GetDataAddonFlag(Inputs,Outputs);
		return (CancelOperation);
	}

		if(MethodName == ""GetAddonServices"")
	{
		GetAddonServices(Inputs,Outputs);
		return (CancelOperation);
	}

	if(MethodName == ""GetOrderMRC"")
	{
		GetOrderMRC(Inputs,Outputs);
		return(CancelOperation);
	}
	if(MethodName == ""GetDeviceNetPrice"")
	{
		GetDeviceNetPrice(Inputs,Outputs);
		return(CancelOperation);
	}

		if(MethodName == ""GetKAMName"")
	{
		GetKAMName(Inputs,Outputs);
		return(CancelOperation);
	}

	if(MethodName == ""CollectionExCheck"") //HardikAdded for Collection SD.
	{
		CollectionExCheck(Inputs,Outputs);
		return(CancelOperation);
	}
// Abuzar 19Jan2020 Added for Automate Sales Journey - End
// Abuzar 22Apr2020 Added for Add On Request - USSD Menu Item - SD - Start

	if(MethodName == ""GetDRBlockStatus"")
	{
		GetDRBlockStatus(Inputs,Outputs);
		return(CancelOperation);
	}
// Abuzar 22Apr2020 Added for Add On Request - USSD Menu Item - SD - End



return (ContinueOperation);
}
//Your public declarations go here...
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)  
{  
 
switch(MethodName)  
   { 

	case ""CalcDatacomPenalty"": 
	  		fn_CalcDatacomPenalty(Inputs, Outputs);  
	      	return (CancelOperation);   
	   		break; 
	      
 
	default: 
	     break; 
    
    
   } 
 
 
 
 return (ContinueOperation);  
}
"/* 
---------------+------+--------+---------------------------------------------- 
Date(YYYYMMDD) | Ver  | By     | Description  
---------------+------+--------+---------------------------------------------- 
20120712      |   1.0|   CP        Creation 
---------------+------+--------+---------------------------------------------- 
*/ 
function StringToDateFormat(strStartDt)
{
 
 var retDate; 
 var vFirstSlash = strStartDt.indexOf(""/"");
 var vSecondSlash = strStartDt.indexOf(""/"",vFirstSlash + 1);
 var vFirstSpace = strStartDt.indexOf("" "");
 var vFirstColon = strStartDt.indexOf("":"");
 var vSecondColon = strStartDt.indexOf("":"",vFirstColon + 1);
 var vSecondSpace = strStartDt.indexOf("" "",vFirstSpace + 1); 
 var vSecond = """";
 var vDay = strStartDt.substring(vFirstSlash + 1,vSecondSlash);
 var vMonth = ToNumber(strStartDt.substring(0,vFirstSlash));
 var vYear = strStartDt.substring(vSecondSlash + 1,vFirstSpace);
 var vHour = strStartDt.substring(vFirstSpace + 1,vFirstColon);
 var vMinute = strStartDt.substring(vFirstColon + 1,vSecondColon);
 if(vSecondSpace == ""-1"")
  vSecond = strStartDt.substring(vSecondColon + 1);
 else
  vSecond = strStartDt.substring(vSecondColon + 1,vSecondSpace);
 var strMonth = """";
 if(vMonth == 1)
 {
  strMonth = ""Jan"";
 }
 else if(vMonth == 2)
 {
  strMonth = ""Feb"";
 }
 else if(vMonth == 3)
 {
  strMonth = ""Mar"";
 }
 else if(vMonth == 4)
 {
  strMonth = ""Apr"";
 }
 else if(vMonth == 5)
 {
  strMonth = ""May"";
 }
 else if(vMonth == 6)
 {
  strMonth = ""Jun"";
 }
 else if(vMonth == 7)
 {
  strMonth = ""Jul"";
 }
 else if(vMonth == 8)
 {
  strMonth = ""Aug"";
 }
 else if(vMonth == 9)
 {
  strMonth = ""Sep"";
 }
 else if(vMonth == 10)
 {
  strMonth = ""Oct"";
 }
 else if(vMonth == 11)
 {
  strMonth = ""Nov"";
 }
 else if(vMonth == 12)
 {
  strMonth = ""Dec"";
 } 
 retDate = strMonth+"" ""+vDay+"" ""+vYear+"" ""+vHour+"":""+vMinute+"":""+vSecond; 
 return retDate;
}
function  fnAddPenaltyProd(strPenaltyCharge,OrderId)
{
	try
	{
        var Appln = TheApplication();
        var boOrder = Appln.GetBusObject(""Order Entry (Sales)"");   
        var PdsService = Appln.GetService(""PDS Product Data Service"");
        var bcOrder = boOrder.GetBusComp(""Order Entry - Orders"");   
        var bcLineItms = boOrder.GetBusComp(""Order Entry - Line Items"");
        var bRecExist;
        var bRecExist2;
		var RootItemId;
		var strExpr;
		var ServiceAccountId, BillingAccountId;
 		with (bcOrder)   // with Order
        {   
	        ActivateField(""Order Header Id"");
	        ActivateField(""Product Id"");
	        ActivateField(""Billing Account Id"");
	        ActivateField(""Service Account Id"");
	        ActivateField(""STC Channel"");
	        SetViewMode(AllView);   
	        ClearToQuery();   
	        SetSearchSpec(""Id"", OrderId);   
	        ExecuteQuery(ForwardOnly);   
	        bRecExist = FirstRecord();   
	        if (bRecExist)   
	        {   
				BillingAccountId = GetFieldValue(""Billing Account Id"");
				ServiceAccountId = GetFieldValue(""Service Account Id"");
				var vInputs = Appln.NewPropertySet();
				var vOutputs = Appln.NewPropertySet();
				var TempName = Appln.InvokeMethod(""LookupValue"", ""STC_DATACOMM_PACKAGE"", ""Datacom Terminated Product"");
				vInputs.SetProperty(""Doc Id"", OrderId);
				vInputs.SetProperty(""Template Search Spec"", ""[Name] = '"" + TempName + ""'"");
				PdsService.InvokeMethod(""AddFavoriteToOrder"", vInputs, vOutputs); 
				
				with(bcLineItms)    
	         	{  
      				ActivateField(""Product Type"");
    				strExpr = "" [Order Header Id] = '""+ OrderId +""'""  + ""AND [Product Type] = 'Package'"";   
				    SetSearchExpr(strExpr);   
				    ExecuteQuery(ForwardOnly);   
				    bRecExist2 = FirstRecord();        
					if(bRecExist2)
					{
						RootItemId = GetFieldValue(""Id"");
					}
				}//with(bcLineItms)   
				                
				with(bcLineItms)   
				{  
					ActivateField(""Product"");
					ActivateField(""Net Price"");
					ActivateField(""Unit Price"");
					ActivateField(""Stored Extended Price"");
					ActivateField(""Parent Order Item Id"");
					ActivateField(""Root Order Item Id"");
					ActivateField(""Pricing Adjustment Amount"");
					ActivateField(""Header Discount Amount"");
					ActivateField(""Billing Account Id"");
	        		ActivateField(""Service Account Id"");
					strExpr = "" [Order Header Id] = '""+ OrderId +""'""  + ""AND [Product] = '"" + TempName + ""'"";   
				    SetSearchExpr(strExpr);   
				    ExecuteQuery(ForwardOnly);   
				    bRecExist2 = FirstRecord();        
					if(bRecExist2)
					{
						 SetFieldValue(""Parent Order Item Id"", RootItemId); 
				         SetFieldValue(""Root Order Item Id"", RootItemId); 
						 SetFieldValue(""Billing Account Id"", BillingAccountId);
						 SetFieldValue(""Service Account Id"", ServiceAccountId);
				         SetFieldValue(""Net Price"", strPenaltyCharge);
				         SetFieldValue(""Unit Price"", strPenaltyCharge);
				         SetFieldValue(""Stored Extended Price"", strPenaltyCharge);
				         WriteRecord();
				    }
				}//with(bcLineItms)
				SetFieldValue(""STC Channel"", ""FCA"");
				WriteRecord();   
			}//if
		}// with order
	}
	catch(e)
	{
		throw(e);
	}     
	finally
	{
		bcLineItms = null;
		bcOrder = null;
		boOrder = null;
		PdsService = null;
		Appln = null;
	}   
	return (CancelOperation);
}
function  fnAddPenaltyProd_Old(strPenaltyCharge,OrderId)
{
        var boOrder = TheApplication().GetBusObject(""Order Entry (Sales)"");   
        var bcOrder = boOrder.GetBusComp(""Order Entry - Orders"");   
        var bcLineItms = boOrder.GetBusComp(""Order Entry - Line Items"");
        var bRecExist;
        var  bRecExist2;
var RootItemId;
var strExpr;
 with (bcOrder)   
         {   
        
        ActivateField(""Order Header Id"");
        ActivateField(""Product Id"");
        SetViewMode(AllView);   
        ClearToQuery();   
        SetSearchSpec(""Id"", OrderId);   
        ExecuteQuery(ForwardOnly);   
        bRecExist = FirstRecord();   
        if (bRecExist)   
          {   

with(bcLineItms)   
         {  
      
    strExpr = "" [Order Header Id] = '""+ OrderId +""'""  + ""AND [Product Type] = 'Package'"";   
      SetSearchExpr(strExpr);   
      ExecuteQuery(ForwardOnly);   
      bRecExist2 = FirstRecord();        
if(bRecExist2)
{
RootItemId = GetFieldValue(""Id"");
}
}//with(bcLineItms)   
                
         with(bcLineItms)   
         {  
         NewRecord(NewAfter);
         SetFieldValue(""Order Header Id"",OrderId);
         SetFieldValue(""Product Id"",TheApplication().InvokeMethod(""LookupValue"",""STC_DATACOMM_PACKAGE"",""PENALTY""));
       //SetFieldValue(""Product Id"",'1-7NFUFR');
         SetFieldValue(""Product"",""VIVA Termination Penalty"");
        
         //SetFieldValue(""Cfg Type"",""eConfigurator"");
         SetFieldValue(""Net Price"",strPenaltyCharge);
         SetFieldValue(""Parent Order Item Id"",RootItemId); 
         SetFieldValue(""Root Order Item Id"",RootItemId); 
         WriteRecord();
}//with(bcLineItms)   
}
}//
         
}
"/* 
---------------+------+--------+---------------------------------------------- 
Date(YYYYMMDD) | Ver  | By     | Description  
---------------+------+--------+---------------------------------------------- 
20120717      |   1.0|   CP        Creation 
---------------+------+--------+---------------------------------------------- 
*/ 
function fnCalcPenalty(Inputs, Outputs)  
{   
	try   
    { 
       
        var boSrvAcnt = TheApplication().GetBusObject(""STC Service Account"");
        var bcSrvAcnt = boSrvAcnt.GetBusComp(""CUT Service Sub Accounts"");
        var bcAsset = boSrvAcnt.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
        var bcAssetXA =boSrvAcnt.GetBusComp(""Asset Mgmt - Asset XA"");  
        var OrderId = Inputs.GetProperty(""Order Id"");
        var strServiceId = Inputs.GetProperty(""ServiceId"");
        var bRecExist; 
        var bRecExist1;
        var strExpr;
        var strLineId;
        var strRootId;   
        var strOrderId = Inputs.GetProperty(""Order Id""); 
        var strOrderType = Inputs.GetProperty(""Order Type""); 
        var bsLovs;
        var psInputs; 
        var psOutputs; 
        var vTermLength;
        var strProdName;
        var strStartDt;
        var strEndDt;
        var strCurrentDt;
        var bRecExist2;
        var strAttrName;
        var strMrcTot;
        var strPerdayMRC;
        var strPenaltyCharge;
        var bRecExist3;

        with (bcSrvAcnt)   
         {   
	        //ActivateField(""STC Profile Type"");
	        SetViewMode(AllView);   
	        ClearToQuery();   
	        SetSearchSpec(""Id"", strServiceId);   
	        ExecuteQuery(ForwardOnly);   
	        bRecExist = FirstRecord(); 

        	if (bRecExist)   
          	{   
                var strProfile = GetFieldValue(""STC Profile Type"");

				if(strProfile == 'Datacom')
				{
			    	with(bcAsset)   
			        {  
						ActivateField(""Service Account Id"");   
					    ActivateField(""Status"");   
					    ActivateField(""Product Type"");
					    ActivateField(""STC MRCTotal"");
						ActivateField(""STC Product Type"");
					    ActivateField(""Id"");
					
					   	SetViewMode(AllView);   
					    ClearToQuery();  
     					strExpr = "" [Service Account Id] = '""+ strServiceId +""'""  + ""AND [STC Product Type] = 'Package' AND [Status] = 'Active'""; 
      					SetSearchExpr(strExpr);
      					ExecuteQuery(ForwardOnly);
      					bRecExist1 = FirstRecord();   

      					if(bRecExist1)   
       					{         
      						strMrcTot = GetFieldValue(""STC MRCTotal"");

      						strExpr = "" [Service Account Id] = '""+ strServiceId +""'""  + ""AND [STC Product Type] = 'Service Point' AND [Status] = 'Active'"";
						    SetSearchExpr(strExpr);   
						    ExecuteQuery(ForwardOnly);   
						    bRecExist1 = FirstRecord();

 							if(bRecExist1)   
							{
								var strAssetId = GetFieldValue(""Id"");
 								with(bcAssetXA)   
         						{  
      								ActivateField(""Object Id"");   
      								ActivateField(""Name"");   
     								ActivateField(""Value""); 
      								SetViewMode(AllView);   
      								ClearToQuery();      
      								SetSearchExpr(""[Object Id] = '"" + strAssetId + ""' AND ( [Name] = 'End Date' OR [Name] = 'Start Date' )"");
      								ExecuteQuery(ForwardOnly);   
      								bRecExist2 = FirstRecord(); 
      								bRecExist3 = FirstRecord();
      								while(bRecExist2)
      								{
      									if( GetFieldValue(""Name"") == ""Start Date"")
      										strStartDt = GetFieldValue(""Value"");
      									else
      										strEndDt = GetFieldValue(""Value"");
      										
      									bRecExist2 = NextRecord();
      								}
           							if( bRecExist3 )
                        			{
                      					// Set Date Object //
                       					strCurrentDt = new Date;
                       					strEndDt 	 = new Date(strEndDt);
                       					strStartDt 	 = new Date(strStartDt); 	
                       					// Set time to 00:00:00 hrs // 
										strCurrentDt = new Date(strCurrentDt.setHours(0,0,0)); 
										strEndDt	 = new Date(strEndDt.setHours(0,0,0));
										strStartDt	 = new Date(strStartDt.setHours(0,0,0));
										// Set Date to 1st of the month //
			                       		strCurrentDt = ToNumber(strCurrentDt.setDate(1));
			                       		strEndDt 	 = ToNumber(strEndDt.setDate(1));	
			                       		strStartDt 	 = ToNumber(strStartDt.setDate(1)); 
                       					
                       					if( strEndDt > strCurrentDt ) 
                       					{	
                       						var MonthOfTenure:Number = Math.floor((strEndDt-strStartDt)/(1000*60*60*24*30));
                       						var MonthOfUse:Number	 = Math.floor((strCurrentDt-strStartDt)/(1000*60*60*24*30));
                       						var strMonthDiff:Number  = MonthOfTenure-MonthOfUse;
                       						strPenaltyCharge = strMonthDiff * (ToNumber(strMrcTot));
                      						Outputs.SetProperty(""TotCharge"",strPenaltyCharge);
                      						fnAddPenaltyProd(strPenaltyCharge, OrderId);
                      					}
                                 	}//if( bRecExist3)
      							}// with(bcAssetXA) 
							}// if(bRecExist1)  
      					}  //  if(bRecExist1) 
					}// with(bcAsset)
     			}//if(strProfile == 'Datacom')   
  			} //if (bRecExist)   
 		} //with (bcSrvAcnt)   
	}//try   
 	catch (e)   
 	{   
		throw(e.toString());   
 	}   
 	finally   
 	{   
		bcAssetXA = null;
		bcAsset = null;
		bcSrvAcnt = null;
		boSrvAcnt = null;
	}   
	return (CancelOperation);
}
"/* 
---------------+------+--------+---------------------------------------------- 
Date(YYYYMMDD) | Ver  | By     | Description  
---------------+------+--------+---------------------------------------------- 
20120717      |   1.0|   CP        Creation 
---------------+------+--------+---------------------------------------------- 
*/ 
function fnCalcPenalty_old(Inputs, Outputs)  
{   
       
        var boSrvAcnt = TheApplication().GetBusObject(""STC Service Account"");
        var bcSrvAcnt = boSrvAcnt.GetBusComp(""CUT Service Sub Accounts"");
        var bcAsset = boSrvAcnt.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
        var bcAssetXA =boSrvAcnt.GetBusComp(""Asset Mgmt - Asset XA"");  
         var OrderId = Inputs.GetProperty(""Order Id"");
        var strServiceId = Inputs.GetProperty(""ServiceId"");
        var bRecExist; 
        var bRecExist1;
        var strExpr;
        var strLineId;
        var strRootId;   
        var strOrderId = Inputs.GetProperty(""Order Id""); 
        var strOrderType = Inputs.GetProperty(""Order Type""); 
        var bsLovs;
        var psInputs; 
        var psOutputs; 
        var vTermLength;
        var strProdName;
        var strStartDt;
        var strEndDt;
        var bRecExist2;
        var strAttrName;
        var strMrcTot;
        var strPerdayMRC;
        var strPenaltyCharge;
        var bRecExist3;
  

 try   
    {   

    
        with (bcSrvAcnt)   
         {   
        //ActivateField(""STC Profile Type"");
        SetViewMode(AllView);   
        ClearToQuery();   
        SetSearchSpec(""Id"", strServiceId);   
        ExecuteQuery(ForwardOnly);   
        bRecExist = FirstRecord(); 

        if (bRecExist)   
          {   
                var strProfile = GetFieldValue(""STC Profile Type"");


if(strProfile == 'Datacom')
{


         with(bcAsset)   
         {  
      
      ActivateField(""Service Account Id"");   
      ActivateField(""Status"");   
      ActivateField(""Product Type"");
      ActivateField(""STC MRCTotal"");
ActivateField(""STC Product Type"");
      ActivateField(""Id"");

      SetViewMode(AllView);   
      ClearToQuery();  
     strExpr = "" [Service Account Id] = '""+ strServiceId +""'""  + ""AND [STC Product Type] = 'Package' AND [Status] = 'Active'""; 
       //strExpr = "" [Service Account Id] = '""+ strServiceId +""'""  + ""AND [Status] = 'Active'""; 
      SetSearchExpr(strExpr);
      ExecuteQuery(ForwardOnly);
      bRecExist1 = FirstRecord();   

      if(bRecExist1)   
       {         
      strMrcTot = GetFieldValue(""STC MRCTotal"");
 
      strExpr = "" [Service Account Id] = '""+ strServiceId +""'""  + ""AND [STC Product Type] = 'Service Point' AND [Status] = 'Active'"";
// strExpr = "" [Service Account Id] = '""+ strServiceId +""'""  + ""AND [Status] = 'Active'"";    
      SetSearchExpr(strExpr);   
      ExecuteQuery(ForwardOnly);   
      bRecExist1 = FirstRecord();

 if(bRecExist1)   
{
var strAssetId = GetFieldValue(""Id"");

  
 with(bcAssetXA)   
         {  
      
      ActivateField(""Object Id"");   
      ActivateField(""Name"");   
     ActivateField(""Value""); 
      SetViewMode(AllView);   
      ClearToQuery();   
      SetSearchSpec(""Object Id"", strAssetId);
      SetSearchSpec(""Name"", ""End Date"");    
      ExecuteQuery(ForwardOnly);   
      bRecExist2 = FirstRecord();   
      
           if( bRecExist2)
                        {
    
                       strEndDt = GetFieldValue(""Value"");
// TheApplication().RaiseErrorText(strEndDt); 
                      //calcpenalty charges
                       var CurrentDate = new Date; 
                           CurrentDate = ToNumber(CurrentDate.getTime());
                       strEndDt =  new Date(strEndDt);
                       strEndDt = ToNumber(strEndDt.getTime());
                       var strtimediff = strEndDt-CurrentDate;
                       var strDays = strtimediff/86400000;
                       strDays = Math.round(strDays);
                       strPerdayMRC = (12* strMrcTot)/ 365;
                       strPenaltyCharge = strDays * strPerdayMRC;
                      Outputs.SetProperty(""TotCharge"",strPenaltyCharge)
                      fnAddPenaltyProd(strPenaltyCharge,OrderId);
                                       }//if( bRecExist2)

      }// with(bcAssetXA) 
}// if(bRecExist1)  
      }  //  if(bRecExist1) 
}// with(bcAsset)
     }//if(strProfile == 'Datacom')   
  } //if (bRecExist)   
 } //with (bcSrvAcnt)   


 

  
   }//try   
    catch (e)   
 {   
throw(e.toString());   
 }   
 finally   
 {   
// bcLineItms = null;
// bcOrder = null;
// boOrder = null;
 }   
}
"/*  
---------------+------+--------+----------------------------------------------  
Date(YYYYMMDD) | Ver  | By     | Description   
---------------+------+--------+----------------------------------------------  
25120712      |   1.0|   CP        Creation  
---------------+------+--------+----------------------------------------------  
*/  
function fnChekPenaltyProd(Inputs, Outputs)   
{    
        var boOrder = TheApplication().GetBusObject(""Order Entry (Sales)"");    
        var bcOrder = boOrder.GetBusComp(""Order Entry - Orders"");    
        var bcLineItms = boOrder.GetBusComp(""Order Entry - Line Items""); 
     
        var bRecExist;  
        var bRecExist1; 
        var strExpr; 
        var strLineId; 
        var strRootId;    
        var strOrderId = Inputs.GetProperty(""OrderId"");  
        var strOrderType = Inputs.GetProperty(""OrderType""); 
        var strProdFlag = ""N""; 
     try    
    {    
      //Query for Line Items    
        if (strOrderType == ""Modify"") 
        { 
        with (bcOrder)    
         {    
         ActivateField(""Order Date"");   
        SetViewMode(AllView);    
        ClearToQuery();    
        SetSearchSpec(""Id"", strOrderId);    
        ExecuteQuery(ForwardOnly);    
        bRecExist = FirstRecord();    
        if (bRecExist)    
          {    
                  
         with(bcLineItms)    
         {   
       
      ActivateField(""Order Header Id"");    
      ActivateField(""Parent Order Item Id"");    
      ActivateField(""Product"");  
      ActivateField(""Status"");    
      ActivateField(""Part Number"");   
       
      SetViewMode(AllView);    
      ClearToQuery();    
      strExpr = "" [Order Header Id] = '""+ strOrderId +""'""  + ""AND [Part Number] = 'VIVADATAPEN' AND [Action Code] = 'Add'"";    
      SetSearchExpr(strExpr);    
      ExecuteQuery(ForwardOnly);    
      bRecExist1 = FirstRecord();    
  
      if(bRecExist1)    
       {  
       strProdFlag = ""Y""; 
      TheApplication().SetProfileAttr(""ProductFlg"",strProdFlag);      
     
       } // if(bRecExist1) 
       else
       {
       TheApplication().SetProfileAttr(""ProductFlg"",strProdFlag);
       } 
     
     }//with(bcLineItms)      
  } //if (bRecExist)     
 } //with (bcOrder)  
  
 }// if (strOrderType == ""Modify"") 
  
 else 
  
 { 
 //Do Nothing 
 } 
   
   }//try    
    catch (e)    
 {    
throw(e.toString());    
 }
 finally    
 {    
 bcLineItms = null; 
 bcOrder = null; 
 boOrder = null; 
 }  

}
"/*  
---------------+------+--------+----------------------------------------------  
Date(YYYYMMDD) | Ver  | By     | Description   
---------------+------+--------+----------------------------------------------  
20120712      |   1.0|   CP        Creation  
---------------+------+--------+----------------------------------------------  
*/  
function fnStampContract(Inputs, Outputs)   
{    
        var boOrder = TheApplication().GetBusObject(""Order Entry (Sales)"");    
        var bcOrder = boOrder.GetBusComp(""Order Entry - Orders"");    
        var bcLineItms = boOrder.GetBusComp(""Order Entry - Line Items""); 
        var bcLineXA = boOrder.GetBusComp(""Order Item XA"");    
        var OrderId = Inputs.GetProperty(""Order Id""); 
        var bRecExist;  
        var bRecExist1; 
        var strExpr; 
        var strLineId; 
        var strRootId;    
        var strOrderId = Inputs.GetProperty(""Order Id"");  
        var strOrderType = Inputs.GetProperty(""Order Type"");  
        var bsLovs; 
        var psInputs;  
        var psOutputs;  
        var vTermLength; 
        var strProdName; 
        var strStartDt; 
        var strEndDt; 
        var bRecExist2; 
        var strAttrName;
 
 try    
    {    
      //Query for Line Items    
        if (strOrderType == ""Provide"" || strOrderType == ""Modify"") 
        { 
        with (bcOrder)    
         {    
         ActivateField(""Order Date"");   
        SetViewMode(AllView);    
        ClearToQuery();    
        SetSearchSpec(""Id"", strOrderId);    
        ExecuteQuery(ForwardOnly);    
        bRecExist = FirstRecord();    
        if (bRecExist)    
          {    
                  strStartDt = GetFieldValue(""Order Date""); 
         with(bcLineItms)    
         {   
       
      ActivateField(""Order Header Id"");    
      ActivateField(""Parent Order Item Id"");    
      ActivateField(""Part Number"");  
      ActivateField(""Status"");    
      ActivateField(""Product Type"");
      ActivateField(""Part Number""); //NehaK 18/11/2013 IPBX Changes 
       
      SetViewMode(AllView);    
      ClearToQuery();    
      strExpr = "" [Order Header Id] = '""+ strOrderId +""'""  + ""AND ([Product Type] = 'Service Point' OR [Part Number] LIKE 'VOIPEQUIP*') AND [Action Code] = 'Add'"";     //NehaK 18/11/2013 IPBX Changes
      SetSearchExpr(strExpr);    
      ExecuteQuery(ForwardOnly);    
      bRecExist1 = FirstRecord();    
  
      if(bRecExist1)    
       {          
       while(bRecExist1)
       {
       strLineId = GetFieldValue(""Id"");    
       strRootId = GetFieldValue(""Root Order Item Id""); 
       strProdName = GetFieldValue(""Part Number""); 
 	   var strTruncProdName =  strProdName.substring(0,9); //NehaK 18/11/2013 IPBX Changes
      
		if(strTruncProdName == ""VOIPEQUIP"")     //NehaK 18/11/2013 IPBX Changes 
		strProdName=strProdName.substring(0,11); //NehaK 18/11/2013 IPBX Changes
      
//TheApplication().RaiseErrorText(CurrentDate); 
 
       bsLovs = TheApplication().GetService(""STC Get LOV Values""); 
       psInputs = TheApplication().NewPropertySet(); 
       psOutputs = TheApplication().NewPropertySet(); 
       psInputs.SetProperty(""LOV Field"", ""Value"");  
       psInputs.SetProperty(""LOV Value"", strProdName); 
       psInputs.SetProperty(""LOV Type"", ""STC_CONTRACT_TYPE""); 
       bsLovs.InvokeMethod(""GetLovValues"", psInputs, psOutputs); 
       vTermLength = ToNumber(psOutputs.GetProperty(""Description""));   
      
       strEndDt = fnUpdateContract(Inputs,Outputs,strStartDt,vTermLength);  
 
 
       with(bcLineXA)    
         {   
       
      ActivateField(""Object Id"");    
      ActivateField(""Name"");    
      SetViewMode(AllView);    
      ClearToQuery();    
      SetSearchSpec(""Object Id"", strLineId);    
      ExecuteQuery(ForwardOnly);    
      bRecExist2 = FirstRecord();    
      var reccount = CountRecords(); 
 
      while(bRecExist2)    
       {          
      strAttrName = GetFieldValue(""Name""); 
 
      if(strAttrName == ""Start Date"") 
      { 
      SetFieldValue(""Value"",strStartDt); 
      WriteRecord(); 
      } 
         if(strAttrName == ""End Date"") 
      { 
      SetFieldValue(""Value"",strEndDt); 
      WriteRecord(); 
      } 
       bRecExist2 = NextRecord(); 
      } // while(bRecExist2)   
     }//with(bcLineXA)   
      bRecExist1 = NextRecord(); 
      }// while bRecExist1
      } // if(bRecExist1)   
     }//with(bcLineItms)      
  } //if (bRecExist)     
 } //with (bcOrder)  
  
 }// if (strOrderType == ""Provide"" || strOrderType == ""Modify"") 
  
 else 
  
 { 
 //Do Nothing 
 } 
   
   }//try    
    catch (e)    
 {    
throw(e.toString());    
 }    
 finally    
 {    
 bcLineItms = null; 
 bcOrder = null; 
 boOrder = null; 
 }    
}
"/* 
---------------+------+--------+---------------------------------------------- 
Date(YYYYMMDD) | Ver  | By     | Description  
---------------+------+--------+---------------------------------------------- 
20120712      |   1.0|   CP        Creation 
---------------+------+--------+---------------------------------------------- 
*/ 
function fnUpdateContract(Inputs,Outputs,strStartDt,vTermLength)  
{ 

   
   
      
    var vAgreestartdate = """";  
    var aDate = """";  
    var aYear = """";  
    var aMonth = """";  
    var aDay ="""";  
    var anHour = """";  
    var anMins = """";  
    var anSecs = """";  
    var vendDate = """";  
    var vAgreeId ="""";  
    var aNewYear = """";  
    var aNewMonth = """";  
    var newmonth = """"; 
    var vstartdate1;
   
 try  
   {  
    
             vAgreestartdate = StringToDateFormat(strStartDt);
         
       vAgreestartdate = new Date(vAgreestartdate); 
//TheApplication().RaiseErrorText(vAgreestartdate);
          vstartdate1 = Clib.mktime(vAgreestartdate)*1000;         
       aDate = new Date();  
       aDate.setTime(vstartdate1);  
       aYear = aDate.getFullYear(aYear); 
          aMonth = aDate.getMonth() + 1;  
       aDay = aDate.getDate();  
       anHour = aDate.getHours();  
       anMins = aDate.getMinutes();  
       anSecs = aDate.getSeconds();  
       newmonth = aMonth + vTermLength;  
     
          if(newmonth > 12)  
          {  
      if(aMonth=='12')// code for dec month
     {
     if((newmonth%12)=='0')
     {
     aNewYear = ToInteger(newmonth/12)
     aYear = aYear + aNewYear;
     aYear = aYear - 1;
     aNewMonth = (newmonth%12);
     }//if (newmonth%12)=='0
     else
     {
           aNewYear = ToInteger(newmonth/12); 
           aYear = aYear + aNewYear;  
           aNewMonth = (newmonth%12);
     } //else
     }
     
     else
     {
           aNewYear = ToInteger(newmonth/12); 
           aYear = aYear + aNewYear;  
           aNewMonth = (newmonth%12);
     } 
     
     ////  code for december month
     if(aNewMonth=='0')
     {
     aMonth=12;
     }
       else
     {
           aMonth =  aNewMonth;  
     }
          }   //if newmonth > 12
          else  
          {  
           aMonth = newmonth;  
          }  
          if((aDay > 29) && (aMonth == 2) && ((aYear%4) == 0))  
          {  
            aDay = aDay - 29;  
            aMonth = aMonth + 1;  
          }  
         if((aDay > 28) && (aMonth == 2) && ((aYear%4)!= 0))  
         {  
            aDay = aDay - 28;  
            aMonth = aMonth + 1;  
         }     
          if((aDay > 30) && ((aMonth == 4) || (aMonth == 6) || (aMonth == 9) || (aMonth == 11)))  
         {  
           aDay = aDay - 30;  
           aMonth = aMonth + 1;  
         }   

    if (Clib.strlen(aMonth) == 1)
{
aMonth = '0'+ aMonth;
}
    if (Clib.strlen(aDay) == 1)
{
aDay = '0'+ aDay;
}
    if (Clib.strlen(anHour) == 1)
{
anHour = '0'+ anHour;
}
    if (Clib.strlen(anMins) == 1)
{
anMins = '0'+ anMins;
}
    if (Clib.strlen(anSecs) == 1)
{
anSecs = '0'+ anSecs;
}
          vendDate = aMonth + ""/"" + aDay + ""/"" + aYear +"" ""+anHour+"":""+anMins+"":""+anSecs; 
     
      
 
        
      }//end of try  
      
 catch(e)  
 { 
 throw(e.toString()); 
 }  
 finally  
 {  
    
 }    

 return vendDate;  
}
function fn_CalcDatacomPenalty(Inputs, Outputs)
{
	try
	{
		var Appln, boServAccnt, bcAsset, bcAssetXA;
		var inServAccntId=Inputs.GetProperty(""Service Account Id"");
		var outPenaltyAmt=0;
		var RemMonths=0;
		var SwitchingMonths=0;
		var bRecExist1, bRecExist2, strMrcTot=0, strExpr, strAssetId, strStartDt, strEndDt, strCurrentDt, CalcPenaltyCharge=""N"";
		
		Appln = TheApplication();
		boServAccnt = Appln.GetBusObject(""STC Service Account"");
		bcAsset= boServAccnt.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
		bcAssetXA=boServAccnt.GetBusComp(""Asset Mgmt - Asset XA"");
		with(bcAsset) //with 1
		{
			ActivateField(""Service Account Id"");   
		    ActivateField(""Status"");   
		    ActivateField(""Product Type"");
		    ActivateField(""STC MRCTotal"");
			ActivateField(""STC Product Type"");
		    ActivateField(""Id"");
		   	SetViewMode(AllView);   
		    ClearToQuery();  
			SetSearchExpr(""[Service Account Id] = '""+ inServAccntId +""'""  + ""AND [STC Product Type] = 'Package' AND [Status] = 'Active'"");
			ExecuteQuery(ForwardOnly);
			bRecExist1 = FirstRecord();
			if(bRecExist1) //if 1.1
			{
				strMrcTot = GetFieldValue(""STC MRCTotal"");
				strExpr = "" [Service Account Id] = '""+ inServAccntId +""'""  + ""AND [STC Product Type] = 'Service Point' AND [Status] = 'Active'"";
			    SetSearchExpr(strExpr);   
			    ExecuteQuery(ForwardOnly);   
			    bRecExist1 = FirstRecord();
			    if(bRecExist1) //if 1.1.1
			    {
			    	strAssetId = GetFieldValue(""Id"");
			    	with(bcAssetXA) //with 1.1.1.1
			    	{
			    		ActivateField(""Object Id"");   
						ActivateField(""Name"");   
						ActivateField(""Value""); 
						SetViewMode(AllView);   
						ClearToQuery();      
						SetSearchExpr(""[Object Id] = '"" + strAssetId + ""' AND ( [Name] = 'End Date' OR [Name] = 'Start Date' )"");
						ExecuteQuery(ForwardOnly);   
						bRecExist2 = FirstRecord(); 
						while(bRecExist2)
						{
							CalcPenaltyCharge = ""Y"";
							if( GetFieldValue(""Name"") == ""Start Date"")
								strStartDt = GetFieldValue(""Value"");
							else
								strEndDt = GetFieldValue(""Value"");
								
							bRecExist2 = NextRecord();
						}
						if( CalcPenaltyCharge == ""Y"" )
						{
							strCurrentDt = new Date;
           					strEndDt 	 = new Date(strEndDt);
           					strStartDt 	 = new Date(strStartDt);


           					// Set time to 00:00:00 hrs // 
							strCurrentDt = new Date(strCurrentDt.setHours(0,0,0)); 
							strEndDt	 = new Date(strEndDt.setHours(0,0,0));
							strStartDt	 = new Date(strStartDt.setHours(0,0,0));
							// Set Date to 1st of the month //






							var strCurrentDtMod = ToNumber(strCurrentDt);
                       		var strEndDtMod = ToNumber(strEndDt);
							var strStartDtMod= ToNumber(strStartDt);
							if(strEndDtMod > strCurrentDtMod)
							{
							var MonthOfTenureMod:Number = Math.floor((strEndDtMod-strStartDtMod)/(1000*60*60*24*30));
							var MonthOfUseMod:Number	 = Math.floor((strCurrentDtMod-strStartDtMod)/(1000*60*60*24*30));
							var strMonthDiffMod:Number  = MonthOfTenureMod-MonthOfUseMod;
							
							}
							strCurrentDt = ToNumber(strCurrentDt.setDate(1));
							strEndDt 	 = ToNumber(strEndDt.setDate(1));	
							strStartDt 	 = ToNumber(strStartDt.setDate(1));
	     					if( strEndDt > strCurrentDt ) 
           					{	
           						var MonthOfTenure:Number = Math.floor((strEndDt-strStartDt)/(1000*60*60*24));
           						var MonthOfUse:Number	 = Math.floor((strCurrentDt-strStartDt)/(1000*60*60*24));
           						var strMonthDiff:Number  = MonthOfTenure-MonthOfUse;
								RemMonths = strMonthDiff;
           						outPenaltyAmt = strMonthDiff * (ToNumber(strMrcTot));
          					}
						}
			    	}//with 1.1.1.1
			    }//if 1.1.1
			}//if 1.1
		} //with 1
		
		
	}// try
	catch(e)
	{
	}
	finally
	{
		Outputs.SetProperty(""Penalty Amount"", outPenaltyAmt);
		Outputs.SetProperty(""Tenure"", RemMonths);
		Outputs.SetProperty(""SwitchingTenure"", strMonthDiffMod);
		Appln=null, boServAccnt=null, bcAsset=null, bcAssetXA=null;
	}
	return (CancelOperation); 
}
function fn_CheckDatacomPenaltyProd(Inputs, Outputs)
{
	try
	{
		var objAppln, objOrderBusObj, objOrderItemBusComp;
		var strPenaltyProd;
		var strResultCode=""N"";
		var strOrderId = Inputs.GetProperty(""Order Id"");
		objAppln 		= TheApplication();
		objOrderBusObj	= objAppln.GetBusObject(""Order Entry (Sales)"");
		objOrderItemBusComp = objOrderBusObj.GetBusComp(""Order Entry - Line Items"");
		strPenaltyProd = objAppln.InvokeMethod(""LookupValue"", ""STC_DATACOMM_PACKAGE"", ""Datacom Terminated Product"");
		with( objOrderItemBusComp )
		{
			ActivateField(""Product"");
			ActivateField(""Order Header Id"");
			ActivateField(""Action Code"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Product"", strPenaltyProd);
			SetSearchSpec(""Action Code"", ""Add"");
			SetSearchSpec(""Order Header Id"", strOrderId);
			ExecuteQuery(ForwardOnly);
			if( FirstRecord() )
			{
				strResultCode = ""Y"";
			}
			
		}
	}
	catch(e)
	{
	}
	finally
	{
		Outputs.SetProperty(""ReturnCode"", strResultCode);
		objAppln = null;
		objOrderBusObj = null;
		objOrderItemBusComp = null;
	}
}
"//Your public declarations go here...  
"
function NationalityCheck(GCCCode, Nationality,IDType)
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
			var CurIDValue = TheApplication().InvokeMethod(""LookupValue"", ""STC_DEP_NATIONALITY_CHECK"", IDType);
			var sub_strng = CurIDValue.substr( 0,6 );
			if(sub_strng == ""TARGET"")
			{	
			psInputsDep.SetProperty(""ProcessName"", ""STC Deposit Operations WF"");
			psInputsDep.SetProperty(""ID Type"", IDType);
			psInputsDep.SetProperty(""Operation"", ""NATIONALITY MATCH"");
			psInputsDep.SetProperty(""Nationality"", Nationality);
			psInputsDep.SetProperty(""GCC Code"", GCCCode);
			psInputsDep.SetProperty(""CustomerType"", ""Individual"");
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
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
    if(MethodName ==""Validation"")
     {
       Validation(Inputs,Outputs);
       return(CancelOperation);
      }

 return (ContinueOperation);
}
function Validation(Inputs,Outputs)
{
try
{
var GCCCode,Nationality,CustomerType; //[MANUJ] : [Deposit_Refund]
var ContactBO,CustomerClass;
var ContactBC;
var DateofBirth;
var ServiceType;
var isRecord;
var MasterAccountId;
var AccountBO;
var PrimaryId;
var IDType;
var IDExpDate;
var ID;
var Segment;
var dCurrDate;
var sSysdate;
var AccountBC;
var YearMonth,getYear,getMonth;
var sID0,sID1,sID2,sID3,ConcatID,PriConId,BillingConId,isRecord1;
var apj=TheApplication();
var validation=""NO""
var sErrorCode = """";
var sErrorMsg = """";
var foundCSR, foundCSRSubstr, currLoginId;
currLoginId = apj.LoginName();
foundCSR = apj.InvokeMethod(""LookupValue"",""STC_ID_EXP_CHECK"",currLoginId);
foundCSRSubstr = foundCSR.substring(0,3);
var BillingBO;
var BillingBC;
ContactBO=TheApplication().GetBusObject(""Contact"");
ContactBC=ContactBO.GetBusComp(""Contact-Thin"");
AccountBO=TheApplication().GetBusObject(""Account"");
AccountBC= AccountBO.GetBusComp(""Account"");
ServiceType =Inputs.GetProperty(""ServiceType"");
MasterAccountId =Inputs.GetProperty(""MasterAccountId""); 
PriConId =Inputs.GetProperty(""PriConId""); 
BillingBO = TheApplication().GetBusObject(""STC Billing Account""); 
BillingBC = BillingBO.GetBusComp(""CUT Invoice Sub Accounts"");
var ExpForDays = apj.InvokeMethod(""LookupValue"",""STC_AUTO_POP_ADMIN"",""FOREIGNER""); // SUMANK: Added for Autopopuate SD Fixes
var ExpBahDays = apj.InvokeMethod(""LookupValue"",""STC_AUTO_POP_ADMIN"",""BAHRAINI""); // SUMANK: Added for Autopopuate SD Fixes
var PNNIDDays = apj.InvokeMethod(""LookupValue"",""STC_AUTO_POP_ADMIN"",""PNNID""); // SUMANK: Added for Autopopuate SD Fixes
dCurrDate = new Date();
sSysdate = dCurrDate.getTime(); 
with(AccountBC)
{
 SetViewMode(AllView);
 ActivateField(""Tax ID Number"");
 ActivateField(""Survey Type""); 
 ActivateField(""Primary Contact Id"");
 ActivateField(""Contact Id"");
 ActivateField(""STC Black List"");
 ActivateField(""STC ID Expiry Date"");
 ActivateField(""STC Contract Category"");
 ActivateField(""Market Class""); 
 ActivateField(""STC GCC Country Code"");//[MANUJ] : [Deposit_Refund]
 ActivateField(""STC Nationality"");//[MANUJ] : [Deposit_Refund]
 ActivateField(""Type"");//[MANUJ] : [Deposit_Refund]
ClearToQuery();
 SetSearchSpec(""Id"",MasterAccountId); 
 ExecuteQuery(ForwardOnly);
 isRecord = FirstRecord(); 
//TheApplication().RaiseErrorText(isRecord);
 if(isRecord)
 {
 IDType =GetFieldValue(""Survey Type"");
 ID = GetFieldValue(""Tax ID Number"");
 Segment = GetFieldValue(""STC Contract Category"");
 PrimaryId=GetFieldValue(""Primary Contact Id"");
 IDExpDate = GetFieldValue(""STC ID Expiry Date"");
 CustomerClass = GetFieldValue(""Market Class""); // SUMANK: Added for Autopopuate SD Fixes
 GCCCode = GetFieldValue(""STC GCC Country Code"");//[MANUJ] : [Deposit_Refund]
 Nationality = GetFieldValue(""STC Nationality"");//[MANUJ] : [Deposit_Refund]
 CustomerType = GetFieldValue(""Type"");//[MANUJ] : [Deposit_Refund]
 if(ServiceType == ""Postpaid"" && CustomerType == ""Individual"")//[MANUJ] : [Deposit_Refund]
  {
   NationalityCheck(GCCCode, Nationality,IDType);
  }
 if(IDType == ""Bahraini ID"" || IDType == ""PNN ID"")
  {
		if(IDExpDate == null || IDExpDate == '')
		{
		sErrorMsg=""Please update CPR Expiry Date for this CPR ""	
		}
	else
	 
	 {
	 if(foundCSRSubstr != ""USR""){
ExpForDays = ToNumber(ExpForDays);  // SUMANK: Added for Autopopuate SD Fixes
ExpBahDays = ToNumber(ExpBahDays); // SUMANK: Added for Autopopuate SD Fixes

		var IDExpDatesys = new Date(IDExpDate);
		var sysIDExpdate = IDExpDatesys.toSystem();
		var CurrDate = new Date();	
		var CurrDateSys = new Date(CurrDate);
		var sysdateCurrDate = CurrDateSys.toSystem();
		var daydiff = (sysIDExpdate - sysdateCurrDate);
		var Finaldays = ToNumber(Math.round((daydiff/(60*60*24))));
		 	if((IDType == ""Bahraini ID"") && (CustomerClass == apj.InvokeMethod(""LookupValue"",""STC_CUST_CLASS_TYPE"",""Bahraini""))) // SUMANK: Added for Autopopuate SD Fixes
		{
			if(Finaldays < ExpBahDays)
			{
				apj.RaiseErrorText(""Dear Customer, Please renew ID Card as ID Card Expiry date is approaching. Please contact Administrator for more details"");
			}
		}
		if((IDType == ""Bahraini ID"") && (CustomerClass == apj.InvokeMethod(""LookupValue"",""STC_CUST_CLASS_TYPE"",""Foreigner""))) // SUMANK: Added for Autopopuate SD Fixes
		{
			if(Finaldays < ExpForDays)
			{
				apj.RaiseErrorText(""Dear Customer, Please renew ID Card as ID Card Expiry date is approaching. Please contact Administrator for more details"");
			}
		}
		if(IDType==""PNN ID"")
		{
			if(Finaldays < PNNIDDays)
			{
				apj.RaiseErrorText(""Dear Customer, Please renew ID Card as ID Card Expiry date is approaching. Please contact Administrator for more details"");
			}
		}
		}
	 }	
	
}	
	
	
 var BlackListflg=GetFieldValue(""STC Black List"");
// if( BlackListflg!="""")
  if( BlackListflg!="""" && IDType == ""Bahraini ID"") 
 {
 	var sErrorMsg=""Please ask the customer to check the validity of their CPR with the Central Informatics Organization. "";
 	sErrorMsg+=""If customer is a foreigner, have them check with the LMRA"";
 	TheApplication().RaiseErrorText(sErrorMsg);
 } 
 
 
 if ((IDType==""Bahraini ID"" || IDType==""PNN ID"") && ID.length>9)
 {  
   sErrorMsg = apj.LookupMessage(""User Defined Errors"",""AM00072"") +""\r""; 

 }
 else if((IDType==""Bahraini ID"" || IDType==""PNN ID"") && ID.length<9)
 {
    sErrorMsg = apj.LookupMessage(""User Defined Errors"",""AM00072"") +""\r"";
 }
 else if((IDType==""Bahraini ID"" || IDType==""PNN ID"") && ID.length==""9"")
 {
  var sID0 = ID.charAt(0);//a  
  var sID1 = ID.charAt(1); //b
  var sID2 = ID.charAt(2); //c            
  var sID3 = ID.charAt(3);//d
  var sID4 = ID.charAt(4);//e
  var sID5 = ID.charAt(5);//f
  var sID6 = ID.charAt(6);//g
  var sID7 = ID.charAt(7);//h             
  var sID8 = ID.charAt(8);  //i                   
  var Valid =((sID7*2+sID6*3+sID5*4+sID4*5+sID3*6+sID2*7+sID1*8+sID0*9)%11);
  var Valid1=(11-Valid);
 }
  if(Valid == ""0""|| Valid == ""1"")
  {
  var SIDNew = ""0"";
  }
  else
  {
  var SIDNewext = Valid1;
  }
 if(SIDNew != sID8)
 {
  if(SIDNewext != sID8)
  {
     sErrorMsg = apj.LookupMessage(""User Defined Errors"",""AM00072"") +""\r"";
  } 
 }
 //else if(IDType!= ""Bahraini ID"" && IDType!= ""GCC"" && ServiceType==""Postpaid""){//Added GCC for the CIO
// else if(IDType!= ""Bahraini ID"" && IDType!= ""GCC"" && ServiceType==""Postpaid"" && Segment==""Individual"") //CIOUpdate to allow GCC also.
 else if(IDType!= ""Bahraini ID"" && IDType!= ""GCC"" && IDType!= ""PNN ID"" && ServiceType==""Postpaid"" && Segment==""Individual"") //CIOUpdate to allow GCC also.
 {
 sErrorMsg += apj.LookupMessage(""User Defined Errors"",""AM00077"") +""\r"";
 //TheApplication().RaiseErrorText(sErrorMsg);
 } 
 /*if(sErrorMsg!="""")
 {
 TheApplication().RaiseErrorText(sErrorMsg);
 }*/
 
// if(validation==""NO"")
 //{ 

 with(ContactBC)
    {  
  SetViewMode(AllView);
  ActivateField(""Birth Date"");
  ActivateField(""STC ID Type"");
  ActivateField(""STC ID #"");
  ClearToQuery();
  //SetSearchSpec(""STC ID #"",ID);
  SetSearchSpec(""Id"",PrimaryId);
  ExecuteQuery(ForwardOnly);
  isRecord = FirstRecord();
   if(isRecord)
      {
          DateofBirth=GetFieldValue(""Birth Date""); 
           IDType =GetFieldValue(""STC ID Type"");
           ID = GetFieldValue(""STC ID #""); 
          
     if(DateofBirth !="""")
     {
         DateofBirth = new Date(DateofBirth);
         var sDateStr = DateofBirth.getTime();
         var sDiffTime = sSysdate - sDateStr; 
         getYear = DateofBirth.getYear(); 
         getMonth = DateofBirth.getMonth()+1;   
         if((sDiffTime < 16*365.25*24*60*60*1000) && ServiceType==""Postpaid"" && Segment==""Individual"")
//         if((sDiffTime < 18*365.25*24*60*60*1000) && ServiceType==""Postpaid"")
         {      
         sErrorMsg += apj.LookupMessage(""User Defined Errors"",""GM0001"") +""\r"";
         }      
         else if((sDiffTime < 16*365.25*24*60*60*1000) && ServiceType==""Prepaid"" && Segment==""Individual"")         
         //else if((sDiffTime < 16*365.25*24*60*60*1000) && ServiceType==""Prepaid"")
         {       
         sErrorMsg += apj.LookupMessage(""User Defined Errors"",""AM00079"") +""\r"";
         }
         /*if (IDType==""Bahraini ID"" && ID.length>9)
    {  
     sErrorMsg += apj.LookupMessage(""User Defined Errors"",""AM00076"") +""\r"";        
    }
    else if(IDType==""Bahraini ID"" && ID.length<9)
    {
      sErrorMsg += apj.LookupMessage(""User Defined Errors"",""AM00076"") +""\r"";
    }
    else if(IDType==""Bahraini ID"" && ID.length==""9"")
    {
    var sID0 = ID.charAt(0);//a  
    var sID1 = ID.charAt(1); //b
    var sID2 = ID.charAt(2); //c            
    var sID3 = ID.charAt(3);//d
    var sID4 = ID.charAt(4);//e
    var sID5 = ID.charAt(5);//f
    var sID6 = ID.charAt(6);//g
    var sID7 = ID.charAt(7);//h             
    var sID8 = ID.charAt(8);  //i                   
    var Valid =((sID7*2+sID6*3+sID5*4+sID4*5+sID3*6+sID2*7+sID1*8+sID0*9)%11);
    var Valid1=(11-Valid);
    }
    if(Valid == ""0""|| Valid == ""1"")
    {
     var SIDNew = ""0"";
    }
    else
    {
    var SIDNewext = Valid1;
    }
    if(SIDNew != sID8)
    {
      if(SIDNewext != sID8)
      {
         sErrorMsg += apj.LookupMessage(""User Defined Errors"",""AM00076"") +""\r"";
      } 
    } */  
         
         
     }//DateofBirth
     else
     {
       sErrorMsg += apj.LookupMessage(""User Defined Errors"",""AM00075"") +""\r"";
     }//else  
    }//isRecord Contact 
    else
   {  
   sErrorMsg += apj.LookupMessage(""User Defined Errors"",""AM00076"") +""\r"";
   }//else 
  } //ContactBC  
 //}  
  /*with(BillingBC)
  {  
  SetViewMode(AllView);
  ActivateField(""Primary Contact Id"");
  ClearToQuery();
  SetSearchSpec(""Id"",BilingId); 
  ExecuteQuery(ForwardOnly);
  isRecord1 = FirstRecord();
  if(isRecord1)
  {
   BillingConId=GetFieldValue(""Primary Contact Id"");*/
   with(ContactBC)
   {
   SetViewMode(AllView);
   ActivateField(""Birth Date"");
   ActivateField(""STC ID Type"");
   ActivateField(""STC ID #"");
   ClearToQuery();
   //SetSearchSpec(""STC ID #"",ID);
   SetSearchSpec(""Id"",PriConId);
   ExecuteQuery(ForwardOnly);
   isRecord = FirstRecord();
   if(isRecord)  
   {
       IDType=GetFieldValue(""STC ID Type"");
       ID=GetFieldValue(""STC ID #"");  
    if ((IDType==""Bahraini ID"" || IDType==""PNN ID"") && ID.length>9)
    {  
     sErrorMsg += apj.LookupMessage(""User Defined Errors"",""AM00080"") +""\r"";        
    }
    else if((IDType==""Bahraini ID"" || IDType==""PNN ID"") && ID.length<9)
    {
      sErrorMsg += apj.LookupMessage(""User Defined Errors"",""AM00080"") +""\r"";
    }
    else if((IDType==""Bahraini ID"" || IDType==""PNN ID"") && ID.length==""9"")
    {
    var sID0 = ID.charAt(0);//a  
    var sID1 = ID.charAt(1); //b
    var sID2 = ID.charAt(2); //c            
    var sID3 = ID.charAt(3);//d
    var sID4 = ID.charAt(4);//e
    var sID5 = ID.charAt(5);//f
    var sID6 = ID.charAt(6);//g
    var sID7 = ID.charAt(7);//h             
    var sID8 = ID.charAt(8);  //i                   
    var Valid =((sID7*2+sID6*3+sID5*4+sID4*5+sID3*6+sID2*7+sID1*8+sID0*9)%11);
    var Valid1=(11-Valid);
    }
    if(Valid == ""0""|| Valid == ""1"")
    {
     var SIDNew = ""0"";
    }
    else
    {
    var SIDNewext = Valid1;
    }
    if(SIDNew != sID8)
    {
      if(SIDNewext != sID8)
      {
         sErrorMsg += apj.LookupMessage(""User Defined Errors"",""AM00080"") +""\r"";
      } 
    }   
   }//isRecordContactBCBillingBC
 if(sErrorMsg!="""")
 {
 TheApplication().RaiseErrorText(sErrorMsg);
 }
   } //ContactBC  
 // } //isRecordBillingBC
 //}//BillingB  
 }  //AccountisRecord 
 if(sErrorMsg!="""")
 {
 TheApplication().RaiseErrorText(sErrorMsg);
 }
}//Account 

  
}//try
catch(e)
{
   throw(e);
}
finally
{
ContactBO = null;   
AccountBO=null;
ContactBC = null;
AccountBC=null;
}
}
function CheckCredits(Inputs, Outputs)
{
//var AppObj = TheApplication();
var DescBO = TheApplication().GetBusObject(""STC Descretionary Credits BO"");
var DescBC = DescBO.GetBusComp(""STC Descretionary Limits"");
var serReqBO = TheApplication().GetBusObject(""Service Request"");
var SerReqBC = serReqBO.GetBusComp(""Service Request"");
var VATFlag;
var MaxCredits, ApprovedCredits, CreditsAdding = """", AdjReason=""""; 
var AccountId="""", SerType="""", SRNum="""";
var sDescApprvr = """", sDescApprvrFlag = """", sCreatedIDNum = """";
var sCreatedEmpId = """", sApprvrStat = """", sCreatErrMsg = """", sPostPaidBrodFlg = """";
var vPackType="""", vTelBenefit="""", vTelBenefitAmt="""", vProdCycle=0, vErrCode="""", vErrMsg="""";//[NAVIN:19Jun2017:DescrCreditRevamp]
var psInp = null, psOut = null, wfBS = null;//[NAVIN:19Jun2017:DescrCreditRevamp]
var sBulkSRFlg = ""N"";

sPostPaidBrodFlg = Inputs.GetProperty(""PostpaidBroadbandFlg"");
sBulkSRFlg = Inputs.GetProperty(""BulkSRFlag"");
with(DescBC)
{	ActivateField(""Default Credit Limit"");
	ActivateField(""Max Credit Limit"");
	SetViewMode(AllView);
	ClearToQuery();
	SetSearchSpec(""CSR LOGIN"",Inputs.GetProperty(""Login""));
	ExecuteQuery(ForwardOnly);
	var IsDescRec = FirstRecord();
	if(IsDescRec)
	{
			MaxCredits = GetFieldValue(""Max Credit Limit"");
			ApprovedCredits = GetFieldValue(""Default Credit Limit"");
		
		with(SerReqBC)
		{
			ActivateField(""Created By Name"");
			ActivateField(""STC Adjustment Data"");
			ActivateField(""SR Number"");
			ActivateField(""STC Adjustment Currency"");
			ActivateField(""STC New Bill Service Type"");
			ActivateField(""STC Adjustment Reason"");
			ActivateField(""STC Adjustment Data Postpaid"");
			ActivateField(""STC Authorized Notifications"");
			//24092014:Discretionary Credit SD:below
			ActivateField(""STC Owner ID Number"");
			ActivateField(""CPR"");
			ActivateField(""STC Desc Approver Flag"");
			ActivateField(""STC Desc Approver"");
			ActivateField(""STC Desc Approver Id"");//Approver Employee ID
			ActivateField(""STC Desc Approver ID Num"");//Approver ID Number
			ActivateField(""STC Owner Emp Id"");//Employee Id
			ActivateField(""STC Desc Approver Status"");//Approver Status
			ActivateField(""Sub-Status"");
			//24092014:Discretionary Credit SD:above
			//[NAVIN:19Jun2017:DescrCreditRevamp]
			ActivateField(""STC Package Type"");
			ActivateField(""STC DC Telecom Benefit"");
			ActivateField(""STC Amount Lost"");
			ActivateField(""STC DC Product Cycles"")
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Id"",Inputs.GetProperty(""SRId""));
			ExecuteQuery(ForwardOnly);
			var IsSRRec = FirstRecord();
			if(IsSRRec)
			{
				sDescApprvr = GetFieldValue(""STC Desc Approver"");
				sDescApprvrFlag = GetFieldValue(""STC Desc Approver Flag"");
				var sEmpIDNum = GetFieldValue(""STC Owner ID Number"");
				var sEmpId = GetFieldValue(""STC Owner Emp Id"");//
				var sApprvrIDNum = GetFieldValue(""STC Desc Approver ID Num"");
				SRNum = GetFieldValue(""SR Number"");
				VATFlag = GetFieldValue(""STC Authorized Notifications"");
				AccountId = GetFieldValue(""Account Id"");
				SerType = GetFieldValue(""STC New Bill Service Type"");
				AdjReason = GetFieldValue(""STC Adjustment Reason"");
				sApprvrStat = GetFieldValue(""STC Desc Approver Status"");
				var sCreatedBy = GetFieldValue(""Created By Name"");
				var sLogin = Inputs.GetProperty(""Login"");
				var sSubStat = GetFieldValue(""Sub-Status"");
				//[NAVIN:19Jun2017:DescrCreditRevamp]
				vPackType = GetFieldValue(""STC Package Type"");
				vTelBenefit = GetFieldValue(""STC DC Telecom Benefit"");
				vTelBenefitAmt = GetFieldValue(""STC Amount Lost"");
				vProdCycle = ToNumber(GetFieldValue(""STC DC Product Cycles""));
				//Validations for the Approver & Approver Status below
				if(sDescApprvrFlag == ""Y""){
					if(sDescApprvr == """"){
						RefreshRecord(Inputs.GetProperty(""SRId""));
						TheApplication().RaiseErrorText(""Business validations failed. You can submit this SR to available Team Lead or Operations Manager after selecting the user id against 'Approver'"");
						
					}//endif
					else if(sApprvrStat == ""-""){
						var sIps = TheApplication().NewPropertySet();
						var sOps = TheApplication().NewPropertySet();
						sIps.SetProperty(""CreatedBy"",sCreatedBy);
						GetCreatorId(sIps,sOps);
						sCreatedIDNum = sOps.GetProperty(""CreatorID"");
						sCreatedEmpId = sOps.GetProperty(""CreatorEmpId"");
						if(sCreatedIDNum == sApprvrIDNum || sCreatedEmpId == sApprvrIDNum){
							RefreshRecord(Inputs.GetProperty(""SRId""));
							TheApplication().RaiseErrorText(""Creator and approver cannot be same. Please select a different approver."");
						}//endif
						 
						SetFieldValue(""STC Desc Approver Status"",""Approval Pending"");
						SetFieldValue(""Sub-Status"",TheApplication().InvokeMethod(""LookupValue"",""SR_SUB_STATUS"",""Assigned""));
						WriteRecord();
						RefreshRecord(Inputs.GetProperty(""SRId""));
					//	if(sPostPaidBrodFlg == ""Y"")
					//	{
							fnSendDescCreditEmail(Inputs.GetProperty(""SRId""));
					//	}
						TheApplication().RaiseErrorText(""The SR has been assigned for approval"");						
						//goto Final;
					}//endelseif(sApprvrStat == ""-"")
					if(sSubStat == ""Unassigned""){
						if(sApprvrStat != ""-"")
						TheApplication().RaiseErrorText(""Invalid status,Please select '-' to proceed"");	
					}
					if(sSubStat == ""Assigned""){
						if(sApprvrStat == ""Approval Pending"")
						TheApplication().RaiseErrorText(""Invalid status,Please select ‘Approved’ or ‘Rejected’"");
					}
				}//endif sDescApprvrFlag
				//Validations for the Approver & Approver Status above
				if(sApprvrStat == ""Rejected""){
					goto End;
				}				
				
				if (vTelBenefit != """" && vTelBenefit != null)
				{
					CreditsAdding = vTelBenefitAmt * vProdCycle;
				}
				else if(Inputs.GetProperty(""Type"") == ""Broadband"")
				{
					if(sPostPaidBrodFlg == ""Y"")
					{
						CreditsAdding = GetFieldValue(""STC Adjustment Data Postpaid"");
					}
					else
					{
					CreditsAdding = GetFieldValue(""STC Adjustment Data"");
					}
				}
				else{
					CreditsAdding = GetFieldValue(""STC Adjustment Currency"");					
				}	
				
				//[NAVIN:19Jun2017:DescrCreditRevamp] - START
				psInp = TheApplication().NewPropertySet();
				psOut = TheApplication().NewPropertySet();
				wfBS = TheApplication().GetService(""Workflow Process Manager"");
				with (psInp)
				{
					SetProperty(""ProcessName"", ""STC Descretionary Credits Validate WF"");
					SetProperty(""Object Id"", AccountId);
					SetProperty(""SRId"", Inputs.GetProperty(""SRId""));
					SetProperty(""AdjReason"", AdjReason);
					SetProperty(""AdjAmount"", CreditsAdding);
					if(SerType == ""Prepaid"" && Inputs.GetProperty(""Type"") == ""Broadband"")
						SetProperty(""AdjType"",""PrepaidBB"");
					else if(SerType == ""Prepaid"" && Inputs.GetProperty(""Type"") == ""Voice"")
						SetProperty(""AdjType"",""PrepaidVoice"");
					else if(SerType == ""Postpaid"" && Inputs.GetProperty(""Type"") == ""Voice"")
						SetProperty(""AdjType"",""PostpaidVoice"");
					else if(SerType == ""Postpaid"" && Inputs.GetProperty(""Type"") == ""Broadband"")
						SetProperty(""AdjType"",""PostpaidBB"");
				}
				wfBS.InvokeMethod(""RunProcess"", psInp, psOut);
				
				with (psOut)
				{
					vErrCode = GetProperty(""Error Code"");
					vErrMsg = GetProperty(""Error Message"");
				}
				
				if (vErrCode != ""0"" && vErrCode != ""00"" && vErrCode != """" && vErrCode != null)
					TheApplication().RaiseErrorText(""Validation Error: ""+vErrMsg);
				//[NAVIN:19Jun2017:DescrCreditRevamp] - END
			
				//if(sDescApprvr!= null && sDescApprvr != """" && sDescApprvrFlag != ""Y""){
				if(sDescApprvrFlag != ""Y""){
					var sSANIdNum = GetFieldValue(""CPR"");
					if(sEmpIDNum == sSANIdNum || sEmpId == sSANIdNum){
						SerReqBC.SetFieldValue(""STC Desc Approver Flag"",""Y"");
						SerReqBC.WriteRecord();	
						RefreshRecord(Inputs.GetProperty(""SRId""));//19OCT2014				
						TheApplication().RaiseErrorText(""Business validations failed. You can submit this SR to available Team Lead or Operations Manager after selecting the user id against 'Approver'"");
					}//endif sEmpIDNum == sSANIdNum
					
					var sValidErrMsg = ValidatedescCredits(AccountId,sLogin,AdjReason); //24092014:Discretionary Credit SD
					if(sValidErrMsg != """"){
						SerReqBC.SetFieldValue(""STC Desc Approver Flag"",""Y"");
						SerReqBC.WriteRecord();	
						RefreshRecord(Inputs.GetProperty(""SRId""));//19OCT2014				
						TheApplication().RaiseErrorText(""Business validations failed. You can submit this SR to available Team Lead or Operations Manager after selecting the user id against 'Approver'"");				
					}//endif sValidErrMsg
				}//endif			 
				//24092014:Discretionary Credit SD:above
			//Check the Creator Credit limit and deduct the same;if not deduct from the Approver.	
			if(sApprvrStat == ""Approved""){
				sCreatErrMsg = ValidateCreatorCreditLimit(sCreatedBy,CreditsAdding);
				if(sCreatErrMsg == """"){
					goto End;
				}
			}//endif sApprvrStat == ""Approved""			
			
			var Creditsadd = ToNumber(CreditsAdding) + ToNumber(ApprovedCredits);
			if(ToNumber(MaxCredits) >= Creditsadd )
			{					
					SetFieldValue(""Status"",TheApplication().InvokeMethod(""LookupValue"",""SR_STATUS"",""In Progress""));
					SetFieldValue(""Sub-Status"",TheApplication().InvokeMethod(""LookupValue"",""SR_SUB_STATUS"",""In Progress""));//If user doesn't save the record and clicks on Submit Button					
					WriteRecord();
			}
			else
			{					
				SerReqBC.SetFieldValue(""STC Desc Approver Flag"",""Y"");
				SerReqBC.WriteRecord();	
				RefreshRecord(Inputs.GetProperty(""SRId""));//19OCT2014
				TheApplication().RaiseErrorText(""Credits are not available for your user. please assign this service request to manager/lead"");
				return(CancelOperation);
			}
		}// end of If SR Rec
		End:
		if(sApprvrStat != ""Rejected"" || (sBulkSRFlg != """" && sBulkSRFlg == ""Y"")){
			if(GetFieldValue(""Status"")== ""In Progress""){}
			else{
				SetFieldValue(""Status"",TheApplication().InvokeMethod(""LookupValue"",""SR_STATUS"",""In Progress""));
				SetFieldValue(""Sub-Status"",TheApplication().InvokeMethod(""LookupValue"",""SR_SUB_STATUS"",""In Progress""));//If user doesn't save the record and clicks on Submit Button					
				WriteRecord();
			}
			
			var psInputs = TheApplication().NewPropertySet();
			var psOutputs = TheApplication().NewPropertySet();
				
			var CallBS = TheApplication().GetService(""Workflow Process Manager"");
			//[NAVIN:19Jun2017:DescrCreditRevamp] - START
			/*psInputs.SetProperty(""ProcessName"", ""STC Create Adjustments Main Workflow"");
			psInputs.SetProperty(""SRNum"",SRNum);
			psInputs.SetProperty(""Object Id"",AccountId);
			psInputs.SetProperty(""STC Reason"",AdjReason);			
			
			psInputs.SetProperty(""CreditsAdding"",CreditsAdding);
			if(SerType == ""Prepaid"" && Inputs.GetProperty(""Type"") == ""Broadband"")
			{
				psInputs.SetProperty(""AdjType"",""PrepaidBB"");
			}
			else if(SerType == ""Prepaid"" && Inputs.GetProperty(""Type"") == ""Voice"")
			{
				psInputs.SetProperty(""AdjType"",""PrepaidVoice"");
			}
			else if(SerType == ""Postpaid"" && Inputs.GetProperty(""Type"") == ""Voice"")
			{
				psInputs.SetProperty(""AdjType"",""PostpaidVoice"");
			}
			else if(SerType == ""Postpaid"" && Inputs.GetProperty(""Type"") == ""Broadband"")
			{
				psInputs.SetProperty(""AdjType"",""PostpaidBB"");
			}
			*/
			
			with (psInputs)
			{
				SetProperty(""ProcessName"", ""STC Descretionary Credits Submit Wrapper WF"");
				SetProperty(""SRNum"", SRNum);
				SetProperty(""SRId"", Inputs.GetProperty(""SRId""));
				SetProperty(""Object Id"", AccountId);
				SetProperty(""VATFlag"", VATFlag);
				SetProperty(""AdjReason"", AdjReason);
				SetProperty(""AdjAmount"", CreditsAdding);
				SetProperty(""TelcoBenefit"", vTelBenefit);
				SetProperty(""ServiceType"", SerType);
				SetProperty(""PackageType"", Inputs.GetProperty(""Type""));
				SetProperty(""ProdCycles"", vProdCycle);
				if(SerType == ""Prepaid"" && Inputs.GetProperty(""Type"") == ""Broadband"")
					SetProperty(""AdjType"",""PrepaidBB"");
				else if(SerType == ""Prepaid"" && Inputs.GetProperty(""Type"") == ""Voice"")
					SetProperty(""AdjType"",""PrepaidVoice"");
				else if(SerType == ""Postpaid"" && Inputs.GetProperty(""Type"") == ""Voice"")
					SetProperty(""AdjType"",""PostpaidVoice"");
				else if(SerType == ""Postpaid"" && Inputs.GetProperty(""Type"") == ""Broadband"")
					SetProperty(""AdjType"",""PostpaidBB"");
			}
			
			CallBS.InvokeMethod(""RunProcess"", psInputs, psOutputs);
			
			with (psOutputs)
			{
				vErrCode = GetProperty(""Error Code"");
				vErrMsg = GetProperty(""Error Message"");
			}
			
			if (vErrCode != ""0"" && vErrCode != ""00"" && vErrCode != """" && vErrCode != null)
				TheApplication().RaiseErrorText(""Error while processing SR: ""+vErrMsg);

			//[NAVIN:19Jun2017:DescrCreditRevamp] - END
			
		}//endif sApprvrStat != ""Rejected""
		else{
			SetFieldValue(""Status"",TheApplication().InvokeMethod(""LookupValue"",""SR_STATUS"",""Waiting for approval""));
			SetFieldValue(""Sub-Status"",TheApplication().InvokeMethod(""LookupValue"",""SR_SUB_STATUS"",""In Progress""));
			WriteRecord();
			
			SetFieldValue(""Status"",TheApplication().InvokeMethod(""LookupValue"",""SR_STATUS"",""Rejected""));
			SetFieldValue(""Sub-Status"",TheApplication().InvokeMethod(""LookupValue"",""SR_SUB_STATUS"",""Completed""));//If user doesn't save the record and clicks on Submit Button
			WriteRecord();			
		}//endelse sApprvrStat != ""Rejected""
	}// end of SRBC	
	if(sApprvrStat != ""Rejected""){
		if(sApprvrStat == ""Approved"" && sCreatErrMsg == """"){
				UpdateCreatorCreditLimit(sCreatedBy,CreditsAdding);	
		}//endif sApprvrStat == ""Approved"" && sCreatErrMsg == """"
		else{		
				SetFieldValue(""Default Credit Limit"", Creditsadd);
				WriteRecord();
		}
	}//endif sApprvrStat != ""Rejected""
		
}// end if(IsDescRec)
//Final:
//Refresh the Record
	var sSRId = Inputs.GetProperty(""SRId"");
	RefreshRecord(sSRId);	
}
return CancelOperation;
}
function CheckCredits_Bkup_10112014(Inputs, Outputs)
{
var AppObj = TheApplication();
var DescBO:BusObject = AppObj.GetBusObject(""STC Descretionary Credits BO"");
var DescBC:BusComp = DescBO.GetBusComp(""STC Descretionary Limits"");
var serReqBO:BusObject = AppObj.GetBusObject(""Service Request"");
var SerReqBC:BusComp = serReqBO.GetBusComp(""Service Request"");
var MaxCredits;
var ApprovedCredits;
var CreditsAdding;
var AdjReason;
var AccountId;
var SerType;
var SRNum;
with(DescBC)
{	ActivateField(""Default Credit Limit"");
	ActivateField(""Max Credit Limit"");
	SetViewMode(AllView);
	ClearToQuery();
	SetSearchSpec(""CSR LOGIN"",Inputs.GetProperty(""Login""));
	ExecuteQuery(ForwardOnly);
	var IsDescRec = FirstRecord();
	if(IsDescRec)
	{
			MaxCredits = GetFieldValue(""Max Credit Limit"");
			ApprovedCredits = GetFieldValue(""Default Credit Limit"");
		
		
		with(SerReqBC)
		{
			ActivateField(""STC Adjustment Data"");
			ActivateField(""SR Number"");
			ActivateField(""STC Adjustment Currency"");
			ActivateField(""STC New Bill Service Type"");
			ActivateField(""STC Adjustment Reason"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Id"",Inputs.GetProperty(""SRId""));
			ExecuteQuery(ForwardOnly);
			var IsSRRec = FirstRecord();
			if(IsSRRec)
			{
				SRNum = GetFieldValue(""SR Number"");
						if(Inputs.GetProperty(""Type"") == ""Broadband"")
						{
							CreditsAdding = GetFieldValue(""STC Adjustment Data"");
						}
						else
						{
						CreditsAdding = GetFieldValue(""STC Adjustment Currency"");					
						}
				AccountId = GetFieldValue(""Account Id"");
				SerType = GetFieldValue(""STC New Bill Service Type"");
				AdjReason = GetFieldValue(""STC Adjustment Reason"");
			
		var Creditsadd = ToNumber(CreditsAdding) + ToNumber(ApprovedCredits);
			if(ToNumber(MaxCredits) >= Creditsadd )
			{
					SetFieldValue(""Status"",AppObj.InvokeMethod(""LookupValue"",""SR_STATUS"",""In Progress""));
					SetFieldValue(""Sub-Status"",AppObj.InvokeMethod(""LookupValue"",""SR_SUB_STATUS"",""In Progress""));//If user doesn't save the record and clicks on Submit Button
					
					
					WriteRecord();

				var psInputs = AppObj.NewPropertySet();
				var psOutputs = AppObj.NewPropertySet();
				
				var CallBS = AppObj.GetService(""Workflow Process Manager"");
				psInputs.SetProperty(""ProcessName"", ""STC Create Adjustments Main Workflow"");
				psInputs.SetProperty(""SRNum"",SRNum);
				psInputs.SetProperty(""Object Id"",AccountId);
				psInputs.SetProperty(""STC Reason"",AdjReason);			
				
				psInputs.SetProperty(""CreditsAdding"",CreditsAdding);
				if(SerType == ""Prepaid"" && Inputs.GetProperty(""Type"") == ""Broadband"")
				{
					psInputs.SetProperty(""AdjType"",""PrepaidBB"");
				}
				else if(SerType == ""Prepaid"" && Inputs.GetProperty(""Type"") == ""Voice"")
				{
					psInputs.SetProperty(""AdjType"",""PrepaidVoice"");
				}
				else if(SerType == ""Postpaid"" && Inputs.GetProperty(""Type"") == ""Voice"")
				{
					psInputs.SetProperty(""AdjType"",""PostpaidVoice"");
				}
				else if(SerType == ""Postpaid"" && Inputs.GetProperty(""Type"") == ""Broadband"")
				{
					psInputs.SetProperty(""AdjType"",""PostpaidBB"");
				}
				CallBS.InvokeMethod(""RunProcess"", psInputs, psOutputs);
				
			
			}
				else
				{	
					AppObj.RaiseErrorText(""Credits are not available for your user. please assign this service request to manager/lead"");
					return(CancelOperation);
				}
		}// end of If SR Rec
	}// end of SRBC
		SetFieldValue(""Default Credit Limit"", Creditsadd);
		WriteRecord();
}// end if(IsDescRec)
	
}

}
function ClearCredits()
{
var DescBC = TheApplication().GetBusObject(""STC Descretionary Credits BO"").GetBusComp(""STC Descretionary Limits"");
with(DescBC)
{
	SetViewMode(AllView);
	ClearToQuery();
	ExecuteQuery(ForwardOnly)
	var IsRec = FirstRecord();
	while(IsRec)
	{
		SetFieldValue(""Default Credit Limit"",""0"");
		WriteRecord();
		IsRec = NextRecord();
	}
	
}
}
function DealerIncentive(Inputs, Outputs)
{
	var AppObj = TheApplication();
	var serReqBO = AppObj.GetBusObject(""Service Request"");
	var SerReqBC = serReqBO.GetBusComp(""Service Request"");
	
	var SRNum = """"; var AccountId = """"; var CreditsAdding = """";
	
	var psInputs = AppObj.NewPropertySet();
	var psOutputs = AppObj.NewPropertySet();
	
	var sLoginName = TheApplication().LoginName();
	
	with(SerReqBC)
	{
		SetViewMode(AllView);
		ClearToQuery();
		ActivateField(""SR Number"");
		ActivateField(""Account Id"");
		ActivateField(""STC Adjustment Currency"");
		SetSearchSpec(""Id"",Inputs.GetProperty(""SRId""));
		ExecuteQuery(ForwardOnly);
		var IsSRRec = FirstRecord();
		if(IsSRRec)
		{
			SRNum = GetFieldValue(""SR Number"");
			AccountId = GetFieldValue(""Account Id"");
			CreditsAdding = GetFieldValue(""STC Adjustment Currency"");
			
			var CallBS = AppObj.GetService(""Workflow Process Manager"");
			psInputs.SetProperty(""ProcessName"", ""STC Create Adjustments Main Workflow"");
			psInputs.SetProperty(""SRNum"",SRNum);
			psInputs.SetProperty(""Object Id"",AccountId);
			psInputs.SetProperty(""CreditsAdding"",CreditsAdding);
	//		psInputs.SetProperty(""STC Reason"",AdjReason);
			psInputs.SetProperty(""AdjType"",""DealerIncentive"");
			psInputs.SetProperty(""ProcessedBy"",sLoginName);
			CallBS.InvokeMethod(""RunProcess"", psInputs, psOutputs);
		}
	}
}
function FormatDate(sDateType)
{
	var sSysDate = Clib.time();
	var sObjDate = Date.fromSystem(sSysDate);
	var scurrMnth = sObjDate.getMonth();	
	var sCurrDay = 	sObjDate.getDate();
	var scurrYear = sObjDate.getFullYear();
	var sResultDate = """";
	var sResultDatesys = """";
		
	
	if(sDateType == ""High""){	
		sResultDate = new Date(scurrYear,scurrMnth,sCurrDay+1,0,0,0);		
		Clib.strftime(sResultDatesys,""%m/%d/%Y %H:%M:%S"",sResultDate);
						
	}//endif High
	if(sDateType == ""Low""){
		if(scurrMnth == 1)			
			//sResultDate = new Date(scurrYear,scurrMnth-2,1,0,0,0);
			sResultDate = new Date(scurrYear,scurrMnth-3,1,0,0,0);
		else
			//sResultDate = new Date(scurrYear,scurrMnth-1,1,0,0,0);
			sResultDate = new Date(scurrYear,scurrMnth-2,1,0,0,0);
		
		Clib.strftime(sResultDatesys,""%m/%d/%Y %H:%M:%S"",sResultDate);
	}//endif Low	


	return(sResultDatesys);
}
function GetCreatorId(Inputs,Outputs)
{
	var sEmpBo = TheApplication().GetBusObject(""Employee"");
	var sEmpBc = sEmpBo.GetBusComp(""Employee"");
	var sCreatorLogin = Inputs.GetProperty(""CreatedBy"");
	var sCreatorID = """";
	var sCreatorEmpId = """";
	
	with(sEmpBc){
		ActivateField(""STC ID Number"");
		ActivateField(""STC Employee Id"");
		ClearToQuery();
		SetViewMode(AllView);
		SetSearchSpec(""Login Name"",sCreatorLogin);
		ExecuteQuery(ForwardOnly);
		var IsCreatorRec = FirstRecord();
		if(IsCreatorRec){
			sCreatorID = GetFieldValue(""STC ID Number"");	
			sCreatorEmpId = GetFieldValue(""STC Employee Id"");	
		}//endif IsCreatorRec
	}//endwith sEmpBc
	Outputs.SetProperty(""CreatorID"",sCreatorID);
	Outputs.SetProperty(""CreatorEmpId"",sCreatorEmpId);
	
	
	return CancelOperation;
}
function RefreshRecord(sSRId)
{
	var AppObj = TheApplication();
	var sActView = AppObj.ActiveViewName();	
	var psInRefresh = AppObj.NewPropertySet();
	var psOutRefresh = AppObj.NewPropertySet();
	//var sSRId = Inputs.GetProperty(""SRId"");
	var sSpec = ""[Id] = '"" + sSRId  + ""'"";
	var svcbsRefresh = AppObj.GetService(""SIS OM PMT Service"");
	
	if(sActView == ""STC Service Request Required Info View"")
		psInRefresh.SetProperty(""Business Object Name"",""Service Request"");
	else
		psInRefresh.SetProperty(""Business Object Name"", ""STC Service Account"");
		
	psInRefresh.SetProperty(""Business Component Name"", ""Service Request"");
	psInRefresh.SetProperty(""Search Specification"", sSpec);
	svcbsRefresh.InvokeMethod(""Refresh Business Component"", psInRefresh, psOutRefresh);
	
	return CancelOperation;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
var ireturn;
try
{
	ireturn = ContinueOperation;
	switch(MethodName)
	{
		case ""CheckCredits"":
			CheckCredits(Inputs, Outputs);		
			ireturn = CancelOperation;
			break;

		case ""UpdateCredits"":
			UpdateCredits(Inputs, Outputs);		
			ireturn = CancelOperation;
			break;

		case ""ClearCredits"":
			ClearCredits(Inputs, Outputs);		
			ireturn = CancelOperation;
			break;
			
		case ""DealerIncentive"":
			DealerIncentive(Inputs, Outputs);		
			ireturn = CancelOperation;
			break;

			
		default:
			ireturn = ContinueOperation;
	}
	return(ireturn);
}
catch(e)
{
TheApplication().RaiseErrorText(e.toString());
}
finally
{
	//sErrorMsg = """";
//sErrorCode ="""";
}	

return (ContinueOperation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
var ireturn;
try
{
	ireturn = ContinueOperation;
	switch(MethodName)
	{
		case ""CheckCredits"":
			CheckCredits(Inputs, Outputs);		
			ireturn = CancelOperation;
			break;

		case ""UpdateCredits"":
			UpdateCredits(Inputs, Outputs);		
			ireturn = CancelOperation;
			break;

		case ""ClearCredits"":
			ClearCredits(Inputs, Outputs);		
			ireturn = CancelOperation;
			break;
			
		case ""DealerIncentive"":
			DealerIncentive(Inputs, Outputs);		
			ireturn = CancelOperation;
			break;

		case ""CheckCreatorCredit"":
			var sLogin = Inputs.GetProperty(""Login"");
			var sAmtToCheck = Inputs.GetProperty(""Amount"");
			var sCreditError = """";
			sCreditError = ValidateCreatorCreditLimit(sLogin,sAmtToCheck);
			Outputs.SetProperty(""CreditStatus"", sCreditError);
			ireturn = CancelOperation;
			break;
				
		default:
			ireturn = ContinueOperation;
	}
	return(ireturn);
}
catch(e)
{
TheApplication().RaiseErrorText(e.toString());
}
finally
{
	//sErrorMsg = """";
//sErrorCode ="""";
}	

return (ContinueOperation);
}
function UpdateCreatorCreditLimit(sCreatedBy,SelCredits)
{	
	var AppObj = TheApplication();
	var DescCreditBO = AppObj.GetBusObject(""STC Descretionary Credits BO"");
	var DescCreditBC = DescCreditBO.GetBusComp(""STC Descretionary Limits"");
	var sAppObj = TheApplication();
	var sMaxCredits = """";
	var sApprvCredits = """";
	var ValidCredits = """";
	var IsDescRec = """";
	var SErrMsg = """";

with(DescCreditBC)
{	ActivateField(""Default Credit Limit"");
	ActivateField(""Max Credit Limit"");
	SetViewMode(AllView);
	ClearToQuery();
	SetSearchSpec(""CSR LOGIN"",sCreatedBy);
	ExecuteQuery(ForwardOnly);
	IsDescRec = FirstRecord();
	if(IsDescRec){
			
			sApprvCredits = GetFieldValue(""Default Credit Limit"");//Credits approved in UI.			
			ValidCredits = ToNumber(SelCredits) + ToNumber(sApprvCredits);
			
				SetFieldValue(""Default Credit Limit"",ValidCredits);
				WriteRecord();
				
	}//endif
}//endwith  DescCreditBC

	return CancelOperation;
}
function UpdateCredits(Inputs, Outputs)
{
var serReqBC = TheApplication().GetBusObject(""Service Request"").GetBusComp(""Service Request"");
var CrediBC = TheApplication().GetBusObject(""STC Descretionary Credits BO"").GetBusComp(""STC Descretionary Limits"");

var Owner;
var CreditstoAdd;
with(serReqBC)
{
	SetViewMode(AllView);
	ClearToQuery();
	SetSearchSpec(""Id"", Inputs.GetProperty(""SRId""));
	ExecuteQuery(ForwardOnly);
	var isSRRec = FirstRecord();
	if(isSRRec)
	{
		Owner = GetFieldValue(""STC Desc Owner"");
	}
with(CrediBC)
{
	SetViewMode(AllView);
	ClearToQuery();
	SetSearchSpec(""CSR LOGIN"", Owner);
	ExecuteQuery(ForwardOnly);
	var IsRec = FirstRecord();
	if(IsRec)
	{
		var CreditsApproved = ToNumber(GetFieldValue(""Default Credit Limit""));
		
		var CreditstoSet = CreditsApproved - ToNumber(Inputs.GetProperty(""CreditstoAdd""));
		SetFieldValue(""Default Credit Limit"", CreditstoSet);
		WriteRecord();
		
	}
}//with(CrediBC)	
	
}//with(serReqBC)
}
function ValidateCreatorCreditLimit(sCreatorLogin,SelectCredits)
{
var AppObj = TheApplication();
var DescCreditBO = AppObj.GetBusObject(""STC Descretionary Credits BO"");
var DescCreditBC = DescCreditBO.GetBusComp(""STC Descretionary Limits"");
var sAppObj = TheApplication();
var sMaxCredits = """";
var sApprvCredits = """";
var ValidCredits = """";
var IsDescRec = """";
var SErrMsg = """";

with(DescCreditBC)
{	ActivateField(""Default Credit Limit"");
	ActivateField(""Max Credit Limit"");
	SetViewMode(AllView);
	ClearToQuery();
	SetSearchSpec(""CSR LOGIN"",sCreatorLogin);
	ExecuteQuery(ForwardOnly);
	IsDescRec = FirstRecord();
	if(IsDescRec){
			sMaxCredits = GetFieldValue(""Max Credit Limit"");
			sApprvCredits = GetFieldValue(""Default Credit Limit"");//Credits approved in UI.			
			ValidCredits = ToNumber(SelectCredits) + ToNumber(sApprvCredits);
			if(ToNumber(sMaxCredits) <= ValidCredits)
				//sAppObj.RaiseErrorText(""Credits are not available for your selected approver. Please select other approver to proceed."");
				SErrMsg = ""Credits not available"";
				
	}//endif
}//endwith  DescCreditBC

return(SErrMsg);
}
function ValidateCreatorCreditLimit(sCreatorLogin,SelectCredits)
{
var AppObj = TheApplication();
var DescCreditBO = AppObj.GetBusObject(""STC Descretionary Credits BO"");
var DescCreditBC = DescCreditBO.GetBusComp(""STC Descretionary Limits"");
var sAppObj = TheApplication();
var sMaxCredits = """";
var sApprvCredits = """";
var ValidCredits = """";
var IsDescRec = """";
var SErrMsg = """";

with(DescCreditBC)
{	ActivateField(""Default Credit Limit"");
	ActivateField(""Max Credit Limit"");
	SetViewMode(AllView);
	ClearToQuery();
	SetSearchSpec(""CSR LOGIN"",sCreatorLogin);
	ExecuteQuery(ForwardOnly);
	IsDescRec = FirstRecord();
	if(IsDescRec){
			sMaxCredits = GetFieldValue(""Max Credit Limit"");
			sApprvCredits = GetFieldValue(""Default Credit Limit"");//Credits approved in UI.			
			ValidCredits = ToNumber(SelectCredits) + ToNumber(sApprvCredits);
			if(ToNumber(sMaxCredits) < ValidCredits)
				//sAppObj.RaiseErrorText(""Credits are not available for your selected approver. Please select other approver to proceed."");
				SErrMsg = ""Credits not available"";
				
	}//endif
}//endwith  DescCreditBC

return(SErrMsg);
}
function ValidatedescCredits(AccountId,Login,AdjReason)
{
	//24092014:Discretionary Credit SD:Validations
	var AppObj = TheApplication();
	var StrSerReqBO = AppObj.GetBusObject(""Service Request"");
	var StrSerReqBC = StrSerReqBO.GetBusComp(""Service Request"");
	var SysDate = Clib.time();
	var ObjDate = Date.fromSystem(SysDate);
	var currMnth = ObjDate.getMonth();
	var currYear = ObjDate.getFullYear();
	var MaxDCCount = AppObj.InvokeMethod(""LookupValue"",""STC_DESC_VALID_CNT"",""MAX_CNT"");
	var dtLowDate = """"; 
	var dtHighDate = """"; 
	var ErrorMsg = """";
	if (currMnth == 12)
	{
		dtLowDate = new Date(currYear,currMnth,1,0,0,0);
		dtHighDate = new Date(currYear+1,currMnth+1,1,0,0,0);
	}
	else 
	{
		dtLowDate = new Date(currYear,currMnth,1,0,0,0);
		dtHighDate = new Date(currYear,currMnth+1,1,0,0,0);
	}
	var dtLowDatesys;
	var dtHighDatesys;
	Clib.strftime(dtLowDatesys, ""%m/%d/%Y %H:%M:%S"",dtLowDate);
	Clib.strftime(dtHighDatesys, ""%m/%d/%Y %H:%M:%S"",dtHighDate);
	
	var strSRSpec1 = ""[INS Product] = 'Descretionary Credit' AND ([Sub-Status] = 'Executed' OR [Sub-Status] = 'Assigned' OR [Sub-Status] = 'In Progress') AND [Account Id]='"" + AccountId  + ""' AND [Opened Date]>= '"" + dtLowDatesys  + ""' AND [Opened Date]< '"" + dtHighDatesys  + ""'"";
	with(StrSerReqBC){
	//Validate DC count >=3 for same MSISDN,Same Month,Different Agents.Validation 4
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchExpr(strSRSpec1);
		ExecuteQuery(ForwardOnly);
		var OpenRecCount = CountRecords();
		var IsRec = FirstRecord();
		if(OpenRecCount >= MaxDCCount){
			ErrorMsg = ""Validation Failed"";
			goto End;			
		}//endif OpenRecCount >= MaxDCCount
	}//endwith StrSerReqBC
		
		//Validate DC count >1 for same MSISDN,Same Month,same reason,same Agents.Validation 2
		var StrSerReqBO1 = AppObj.GetBusObject(""Service Request"");
		var StrSerReqBC1 = StrSerReqBO1.GetBusComp(""Service Request"");	
		var strSRSpec2 = ""[INS Product] = 'Descretionary Credit' AND ([Sub-Status] = 'Executed' OR [Sub-Status] = 'Assigned' OR [Sub-Status] = 'In Progress') AND [Account Id]='"" + AccountId  + ""' AND [Opened Date]>= '"" + dtLowDatesys  + ""' AND [Opened Date]< '"" + dtHighDatesys  + ""' AND [STC Adjustment Reason]='""+AdjReason+""'AND [Created By Name]='""+Login+""'"";
	with(StrSerReqBC1){
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchExpr(strSRSpec2);
		ExecuteQuery(ForwardOnly);
		var sRecCnt = CountRecords();
		if(sRecCnt >= 1){
			ErrorMsg = ""Validation Failed"";
			goto End;			
		}//endif sRecCnt
	}//endwith StrSerReqBC1
	
	var StrSerReqBO2 = AppObj.GetBusObject(""Service Request"");
	var StrSerReqBC2 = StrSerReqBO2.GetBusComp(""Service Request"");
		
		//Multiple DC for same MSISDN, for more than two months in a row shouldn’t be applied by same agent.Validation 3		
		var sHighDate = FormatDate(""High"");
		var sLowDate = FormatDate(""Low"");		
		var strSRSpec3 = ""[INS Product] = 'Descretionary Credit' AND ([Sub-Status] = 'Executed' OR [Sub-Status] = 'Assigned' OR [Sub-Status] = 'In Progress') AND [Account Id]='"" + AccountId  + ""' AND [Created By Name]='""+Login+""' AND [Opened Date]>= '"" + sLowDate +""'AND [Opened Date]<= '"" + sHighDate  + ""'"";
		
	with(StrSerReqBC2){
		SetViewMode(AllView);	
		ClearToQuery();
		SetSearchExpr(strSRSpec3);
		ExecuteQuery(ForwardOnly);
		var sRecCount = CountRecords();
		if(sRecCount >= 2){
			ErrorMsg = ""Validation Failed"";
			goto End;			
		}//endif sRecCnt
		
	}//with(StrSerReqBC2)
	End:
	return (ErrorMsg);
}// end of function"
function fnSendDescCreditEmail(SRId)
{
	var sAppObj = TheApplication();
	var psEInputs = sAppObj.NewPropertySet();
	var psEOutputs = sAppObj.NewPropertySet();
				
	var svcCallBS = sAppObj.GetService(""Workflow Process Manager"");
	psEInputs.SetProperty(""ProcessName"", ""STC Disc Credit Send Email Workflow"");
	psEInputs.SetProperty(""Object Id"",SRId);
	svcCallBS.InvokeMethod(""RunProcess"", psEInputs, psEOutputs);
}
function Init(Inputs, Outputs)
{
	try
	{
		with (Outputs)
		{
			SetProperty(""DigitalCardId"","""");
			SetProperty(""CardType"","""");
			SetProperty(""PurchaseType"","""");
			SetProperty(""Brand"","""");
			SetProperty(""BrandID"","""");
			SetProperty(""Category"","""");
			SetProperty(""CategoryID"","""");
			SetProperty(""Denomination"","""");
			SetProperty(""DenominationID"","""");
			SetProperty(""Country"","""");
			SetProperty(""CBSProductID"","""");
			SetProperty(""BRMProductID"","""");
			SetProperty(""ProductID"","""");
			SetProperty(""ProductName"","""");
			SetProperty(""ServiceType"","""");
			SetProperty(""PromotionType"","""");
			SetProperty(""DiscountType"","""");
			SetProperty(""DiscountAmount"","""");
			SetProperty(""OriginalPrice"","""");
			SetProperty(""FinalPrice"","""");
			SetProperty(""ShortCode"","""");

		}
		//return(ContinueOperation);
	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
}
function LogException(e)
{

	//var appObj;
  	var Input=null;
  	var Output=null;
  	var CallMessageHandler=null;  
	try
 	{
		  //appObj = TheApplication();
		  Input = TheApplication().NewPropertySet();
		  Output = TheApplication().NewPropertySet();
		  CallMessageHandler = TheApplication().GetService(""STC Generic Error Handler"");
		  with(Input){
			  SetProperty(""Error Code"", e.errCode);
			  SetProperty(""Error Message"", e.errText);
			  SetProperty(""Object Name"", ""STC Digital Card Query VBC BS"");
			  SetProperty(""Object Type"", ""Buisness Service"");
			  SetProperty(""Object Id"", """");
		  }
		  CallMessageHandler.InvokeMethod(""Log Message"", Input, Output);
 	}
 	catch(e)
 	{}
 	finally
 	{
 
		  CallMessageHandler = null;
		  Output = null;
		  Input = null;
		  //appObj = null;
 	}
}
function Query(Inputs,Outputs)
{
	var vDigCardId="""", vErrCode, vErrMsg="""", PsOutputs = """";
	var psChildCount=0, psChild=null, psChildVoucherList=null, psChildVoucher=null;
	var vCardType="""", vPurchaseType="""", vBrand="""", vBrandID="""", vCategory="""", vCategoryID="""", vDenomination="""", vDenominationID="""";
	var vCountry="""", vProductID="""", vProductName="""", vServiceType="""", vPromotionType="""", vDiscountAmount="""", vOriginalPrice="""", vFinalPrice="""";
	var vCBSProductID="""", vBRMProductID="""", vShortCode="""", vDiscountType="""";
		
	try
	{
		vDigCardId = TheApplication().GetProfileAttr(""DigitalCardRowId"");
		TheApplication().SetProfileAttr(""DigitalCardRowId"", """");
		psChild = TheApplication().NewPropertySet();
		psChildVoucherList = TheApplication().NewPropertySet();
		psChildVoucher = TheApplication().NewPropertySet();

		var vBS = TheApplication().GetService(""Workflow Process Manager"");
		var vInputPS = TheApplication().NewPropertySet();
		var vOutputPS = TheApplication().NewPropertySet();
		with(vInputPS)
		{
			SetProperty(""Object Id"", vDigCardId);
			SetProperty(""ProcessName"", ""STC Digital Card Product Query WF"");
		}
		vBS.InvokeMethod(""RunProcess"",vInputPS,vOutputPS);
		
		with(vOutputPS)
		{
			vErrCode = vOutputPS.GetProperty(""Error Code"");
			vErrMsg = vOutputPS.GetProperty(""Error Message"");
			if(vErrCode == ""0"" || vErrCode == null || vErrCode == """")
			{
				if(vOutputPS.GetChildCount() > 0)
					if(vOutputPS.GetChild(0).GetChildCount() > 0)
						if(vOutputPS.GetChild(0).GetChild(0).GetChildCount() > 0)
						{
							psChild = vOutputPS.GetChild(0).GetChild(0).GetChild(0);
							vErrCode = psChild.GetProperty(""ErrorCode"");
							vErrMsg = psChild.GetProperty(""ErrorDesc"");
						}
			}
			
			if(vErrCode != ""0"" && vErrCode != null && vErrCode != """")
			{
				PsOutputs = TheApplication().NewPropertySet();
				vBrand = vErrCode;
				vProductName = vErrMsg;
				with(PsOutputs){
					SetProperty(""DigitalCardId"",vDigCardId);
					SetProperty(""CardType"",vCardType);
					SetProperty(""PurchaseType"",vPurchaseType);
					SetProperty(""Brand"",vBrand);
					SetProperty(""BrandID"",vBrandID);
					SetProperty(""Category"",vCategory);
					SetProperty(""CategoryID"",vCategoryID);
					SetProperty(""Denomination"",vDenomination);
					SetProperty(""DenominationID"",vDenominationID);
					SetProperty(""Country"",vCountry);
					SetProperty(""CBSProductID"",vCBSProductID);
					SetProperty(""BRMProductID"",vBRMProductID);
					SetProperty(""ProductID"",vProductID);
					SetProperty(""ProductName"",vProductName);
					SetProperty(""ServiceType"",vServiceType);
					SetProperty(""PromotionType"",vPromotionType);
					SetProperty(""DiscountType"",vDiscountType);
					SetProperty(""DiscountAmount"",vDiscountAmount);
					SetProperty(""OriginalPrice"",vOriginalPrice);
					SetProperty(""FinalPrice"",vFinalPrice);
					SetProperty(""ShortCode"",vShortCode);
				}
				Outputs.AddChild(PsOutputs);
				return CancelOperation;
			}//if(vErrCode != ""0"" &&
		}//with(vOutputPS)
		
		if(psChild.GetChildCount() > 0)
		{
			psChildVoucherList = psChild.GetChild(0);

			psChildCount = psChildVoucherList.GetChildCount();
			if(psChildCount > 0)
			{
				for(var i=0; i < psChildCount; i++)
				{	
					psChildVoucher = psChildVoucherList.GetChild(i);
					with(psChildVoucher)
					{
						vCardType = GetProperty(""CardType"");
						vPurchaseType = GetProperty(""PurchaseType"");
						vBrand = GetProperty(""Brand"");
						vBrandID = GetProperty(""BrandID"");
						vCategory = GetProperty(""Category"");
						vCategoryID = GetProperty(""CategoryID"");
						vDenomination = GetProperty(""Denomination"");
						vDenominationID = GetProperty(""DenominationID"");
						vCountry = GetProperty(""Country"");
						vCBSProductID = GetProperty(""CBSProductID"");
						vBRMProductID = GetProperty(""BRMProductID"");
						vProductID = GetProperty(""ProductID"");
						vProductName = GetProperty(""ProductName"");
						vServiceType = GetProperty(""ServiceType"");
						vPromotionType = GetProperty(""PromotionType"");
						vDiscountAmount = GetProperty(""DiscountAmount"");
						vOriginalPrice = GetProperty(""OriginalPrice"");
						vFinalPrice = GetProperty(""FinalPrice"");
						vShortCode = GetProperty(""ShortCode"");
						
						if(vProductName == null || vProductName == """")
						{
							vBrand = ""SBL_DIGICARD_ERR0"";
							vProductName = ""No Record Found!"";
						}
					}
					
					PsOutputs = TheApplication().NewPropertySet();
					with(PsOutputs){
						SetProperty(""DigitalCardId"",vDigCardId);
						SetProperty(""CardType"",vCardType);
						SetProperty(""PurchaseType"",vPurchaseType);
						SetProperty(""Brand"",vBrand);
						SetProperty(""BrandID"",vBrandID);
						SetProperty(""Category"",vCategory);
						SetProperty(""CategoryID"",vCategoryID);
						SetProperty(""Denomination"",vDenomination);
						SetProperty(""DenominationID"",vDenominationID);
						SetProperty(""Country"",vCountry);
						SetProperty(""CBSProductID"",vCBSProductID);
						SetProperty(""BRMProductID"",vBRMProductID);
						SetProperty(""ProductID"",vProductID);
						SetProperty(""ProductName"",vProductName);
						SetProperty(""ServiceType"",vServiceType);
						SetProperty(""PromotionType"",vPromotionType);
						SetProperty(""DiscountType"",vDiscountType);
						SetProperty(""DiscountAmount"",vDiscountAmount);
						SetProperty(""OriginalPrice"",vOriginalPrice);
						SetProperty(""FinalPrice"",vFinalPrice);
						SetProperty(""ShortCode"",vShortCode);
					}
					Outputs.AddChild(PsOutputs);
			
				}//end of for
				
			}//end of if(psChildCount > 0)
		}//if(psChild.GetChildCount() > 0)

	}//end try
	catch(e)
	{
		//throw(e);
		PsOutputs = TheApplication().NewPropertySet();
		vBrand = ""SBL_DIGICARD_ERR0"";
		vProductName = ""No Record Found!"";
		with(PsOutputs){
			SetProperty(""DigitalCardId"",vDigCardId);
			SetProperty(""CardType"",vCardType);
			SetProperty(""PurchaseType"",vPurchaseType);
			SetProperty(""Brand"",vBrand);
			SetProperty(""BrandID"",vBrandID);
			SetProperty(""Category"",vCategory);
			SetProperty(""CategoryID"",vCategoryID);
			SetProperty(""Denomination"",vDenomination);
			SetProperty(""DenominationID"",vDenominationID);
			SetProperty(""Country"",vCountry);
			SetProperty(""CBSProductID"",vCBSProductID);
			SetProperty(""BRMProductID"",vBRMProductID);
			SetProperty(""ProductID"",vProductID);
			SetProperty(""ProductName"",vProductName);
			SetProperty(""ServiceType"",vServiceType);
			SetProperty(""PromotionType"",vPromotionType);
			SetProperty(""DiscountType"",vDiscountType);
			SetProperty(""DiscountAmount"",vDiscountAmount);
			SetProperty(""OriginalPrice"",vOriginalPrice);
			SetProperty(""FinalPrice"",vFinalPrice);
			SetProperty(""ShortCode"",vShortCode);
		}
		Outputs.AddChild(PsOutputs);
		return CancelOperation;
	}
	finally
	{
		vInputPS = null; vOutputPS = null; vBS = null;
		PsOutputs=null; psChild=null; psChildVoucherList=null; psChildVoucher=null;
	}
	return CancelOperation;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{ 
	var ireturn=false;
	//var psInputs=null, psOutputs=null;

	try
	{
		ireturn = ContinueOperation;
		switch(MethodName)
		{
			case ""Init"":
				Init(Inputs,Outputs);
				ireturn = CancelOperation;
				break;
					
			case ""Query"":
				Query(Inputs,Outputs);
				ireturn = CancelOperation;
				break;
			
			case ""PreInsert"":
				ireturn = CancelOperation;
				break;
			
			default:
				//ireturn = ContinueOperation;
				break;
		}
		return (ireturn);
	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{}
	return (ContinueOperation);
}
function Init(Inputs, Outputs)
{
	try
	{
		with (Outputs)
		{
			SetProperty(""DiscounProduct"","""");
			SetProperty(""SelectFlag"","""");
			SetProperty(""DiscountProductId"","""");
			SetProperty(""BillingServiceType"","""");
			SetProperty(""ActiveProduct"","""");
			SetProperty(""OrderType"","""");
			SetProperty(""DiscountType"","""");
			//MANUJ: Added for Broadband Experience
			SetProperty(""Add Dis Param 1"","""");
			SetProperty(""Add Dis Param 2"","""");
			SetProperty(""Add Dis Param 3"","""");
			SetProperty(""Add Dis Quota"","""");
			SetProperty(""Add Dis Price Overide"","""");
			SetProperty(""Add Dis Charging Type"","""");
			SetProperty(""Add Service Length"","""");
			//SetProperty(""Active"","""");
		}
		//return(ContinueOperation);
	}
	catch(e)
	{
		LogException(e, """");
	}
	finally
	{
	}
}
function LogException(e, OrderHeaderId)
{

	var appObj;
  	var Input;
  	var Output;
  	var CallMessageHandler;  
	try
 	{
		  appObj = TheApplication();
		  Input = appObj.NewPropertySet();
		  Output = appObj.NewPropertySet();
		  CallMessageHandler = appObj.GetService(""STC Generic Error Handler"");
		  with(Input)
		  {
			SetProperty(""Error Code"", e.errCode);
			SetProperty(""Error Message"", e.errText);
			SetProperty(""Object Name"", ""STC Discount Product BS"");
			SetProperty(""Object Type"", ""Business Service"");
			SetProperty(""Object Id"", OrderHeaderId);
			SetProperty(""Siebel Operation Object Id"", appObj.GetProfileAttr(""OrderItemId""));
		  }
		  
		  CallMessageHandler.InvokeMethod(""Log Message"", Input, Output);
 	}
 	catch(e)
 	{ 
  		Input = null; Output = null; CallMessageHandler = null;
		appObj = null;
 	}
 	finally
 	{
 
		  CallMessageHandler = null;
		  Output = null;
		  Input = null;
		  appObj = null;
 	}
}
function Query(Inputs,Outputs)
{
var AppObj=TheApplication();
var LoginName, DiscountProduct;
var IsSelected, BusObj, BusCompUser, BusCompAddon, BusCompPlan;
var PlanId="""", OrderType="""", DisOrderType="""", MigSubType="""";//[NAVIN:01Jul2018:ServiceMigration_AddDiscount]
var PSInput = AppObj.NewPropertySet();
var OrderItemId=AppObj.GetProfileAttr(""OrderItemId"");
var OrderHeaderId="""";
var psInputs = AppObj.NewPropertySet();
var psOutputs = AppObj.NewPropertySet();
var DiscountOld = ""DUMMY"";//MANUJ Added for avoid multiple First Discount Products
var DiscountIdArr = new Array;
var sRestrictionFlag = """"; //Bala: 31Mar2016: Addded for RetentionrenewalOffer
var OrderBO = TheApplication().GetBusObject(""Order Entry (Sales)"");
var OrderItemBC = OrderBO.GetBusComp(""Order Entry - Line Items"");
OrderItemBC.SetSearchSpec(""Id"",OrderItemId);
OrderItemBC.ExecuteQuery(ForwardOnly);
var isRecord = OrderItemBC.FirstRecord();
if (isRecord)
	OrderHeaderId = OrderItemBC.GetFieldValue(""Order Header Id"");
try
{

	var sMacdBo = AppObj.GetBusObject(""MACD Performance Order"");
	var sMacdBcln = sMacdBo.GetBusComp(""MACD Order Entry - Line Items"");
	with(sMacdBcln)
	{
		ClearToQuery();
		SetViewMode(AllView);
		ActivateField(""Order Header Id"");
		SetSearchSpec(""Id"", OrderHeaderId);
		ExecuteQuery(ForwardOnly);
		if(FirstRecord())
		{
			OrderHeaderId = GetFieldValue(""Order Header Id"");
			AppObj.SetProfileAttr(""OrderHeaderId"", OrderHeaderId);
		}
	}
	

	LoginName=AppObj.LoginName();	
	BusObj=AppObj.GetBusObject(""STC Discount BO"");
	BusCompUser=BusObj.GetBusComp(""STC User List BC"");
	BusCompAddon=BusObj.GetBusComp(""STC Discount Product BC"");
	BusCompPlan=BusObj.GetBusComp(""STC Plan Details BC"");  
	///////////////////////Invoke WF/////////////
	var svcbsService = AppObj.GetService(""Workflow Process Manager"");
	psInputs.SetProperty(""ProcessName"", ""STC Discount Order Query WF"");
	psInputs.SetProperty(""Object Id"",OrderHeaderId);
	svcbsService.InvokeMethod(""RunProcess"", psInputs, psOutputs);
	PlanId = psOutputs.GetProperty(""ProductId"");//Find Service Plan Ordered
	OrderType=psOutputs.GetProperty(""OrderType""); //Provide/Modify
	MigSubType=psOutputs.GetProperty(""MigrationSubType"");
	//var OrderType=""Modify""; 
	
	if(PlanId != """")
	{//Bala: 31Mar2016: Added for Retention Samsung S7 Promotion Offer -- Start Code
		var stempBO = AppObj.GetBusObject(""STC Discount BO"");
		var stempAddonBC = BusObj.GetBusComp(""STC Discount Product BC"");
		var stempPlanBC =BusObj.GetBusComp(""STC Plan Details BC"");
		
		with(stempAddonBC)
		{
			ActivateField(""Plan Id"");
			ActivateField(""Add Prod Name"");
			ActivateField(""Add Prod Id"");
			ActivateField(""Dis Amount"");
			ActivateField(""Billing Service Type""); 
			ActivateField(""Order Type"");
			ActivateField(""Status"");
			ActivateField(""Add Dis Type"");
			//MANUJ Added for BB LTE Experience
			ActivateField(""Add Service Length"");//MANUJ Added for BB Experience
			ActivateField(""Add Dis Quota"");//MANUJ Added for BB Experience
			ActivateField(""Add Dis Price Overide"");//MANUJ Added for BB Experience
			ActivateField(""Add Dis Charging Type"");//MANUJ Added for BB Experience
			ActivateField(""STC Restriction Flag"");
			ClearToQuery(); 
			//SetSearchSpec(""Plan Id"",DiscountId);//Find Discount product for the plan ordered and order type
			SetSearchSpec(""Plan Id"",PlanId);//Mayank : Modified for Postpaid Vanity    
			SetSearchSpec(""Status"",""Active""); 
			if (OrderType == ""Migration"" && MigSubType == ""Service Migration"")//[NAVIN:01Jul2018:ServiceMigration_AddDiscount]
			{SetSearchSpec(""Order Type"", MigSubType);}
			else
			{SetSearchSpec(""Order Type"", OrderType);}
		
	//		SetSearchSpec(""Add Prod Id"",DiscountId);//Mayank : Added for Postpaid Vanity 
			SetSearchSpec(""STC Restriction Flag"", ""All"")
			ExecuteQuery(ForwardOnly);
			var DiscountAll = CountRecords();
			var RecExistAll = FirstRecord();
			while(RecExistAll) 
			{
			    DisOrderType=GetFieldValue(""Order Type"");
			    var DiscountIdAll = GetFieldValue(""Add Prod Id"");
				if(DisOrderType=="""" && DiscountIdArr[DiscountIdAll] != ""Yes"")
				{
					var DiscounPropertyset=AppObj.NewPropertySet();
					with(DiscounPropertyset){
						SetProperty(""DiscounProduct"",GetFieldValue(""Add Prod Name"")); 	
						SetProperty(""DiscountProductId"",GetFieldValue(""Add Prod Id"")); 
						SetProperty(""BillingServiceType"",GetFieldValue(""Billing Service Type""));					 
						SetProperty(""ActiveProduct"",GetFieldValue(""Status""));
						SetProperty(""DiscountType"",GetFieldValue(""Add Dis Type""));
						SetProperty(""Add Service Length"",GetFieldValue(""Add Service Length""));//MANUJ Added for BB Experience
						SetProperty(""Add Dis Quota"",GetFieldValue(""Add Dis Quota""));
						SetProperty(""Add Dis Price Overide"",GetFieldValue(""Add Dis Price Overide""));
						SetProperty(""Add Dis Charging Type"",GetFieldValue(""Add Dis Charging Type""));
					}
					PSInput.AddChild(DiscounPropertyset);
					DiscountIdArr[DiscountIdAll] = ""Yes"";//MANUJ: Added for DiscountId Index, set Yes
				}
				else if(OrderType==""Provide"" && DiscountIdArr[DiscountIdAll] != ""Yes"" )//Search in array with row_id as the index and if found , 
				{
					var DiscounPropertyset=AppObj.NewPropertySet();
					with(DiscounPropertyset){
						SetProperty(""DiscounProduct"",GetFieldValue(""Add Prod Name"")); 	
						SetProperty(""DiscountProductId"",GetFieldValue(""Add Prod Id"")); 
						SetProperty(""BillingServiceType"",GetFieldValue(""Billing Service Type"")); 
						SetProperty(""ActiveProduct"",GetFieldValue(""Status""));
						SetProperty(""DiscountType"",GetFieldValue(""Add Dis Type""));
						SetProperty(""Add Service Length"",GetFieldValue(""Add Service Length""));//MANUJ Added for BB Experience
						SetProperty(""Add Dis Quota"",GetFieldValue(""Add Dis Quota""));
						SetProperty(""Add Dis Price Overide"",GetFieldValue(""Add Dis Price Overide""));
						SetProperty(""Add Dis Charging Type"",GetFieldValue(""Add Dis Charging Type""));
					}
					PSInput.AddChild(DiscounPropertyset);
				//	DiscountOld = DiscountId;
					DiscountIdArr[DiscountIdAll] = ""Yes"";//MANUJ: Added for DiscountId Index, set Yes
				}
				else if(((OrderType == ""Modify"") || (OrderType == ""Migration"" && MigSubType == ""Service Migration"")) && DiscountIdArr[DiscountId] != ""Yes"" )
				{
					var DiscounPropertyset=AppObj.NewPropertySet();	
					with(DiscounPropertyset){
						SetProperty(""DiscounProduct"",GetFieldValue(""Add Prod Name"")); 	
						SetProperty(""DiscountProductId"",GetFieldValue(""Add Prod Id"")); 
						SetProperty(""BillingServiceType"",GetFieldValue(""Billing Service Type"")); 
						SetProperty(""ActiveProduct"",GetFieldValue(""Status"")); 
						SetProperty(""DiscountType"",GetFieldValue(""Add Dis Type""));
						SetProperty(""Add Service Length"",GetFieldValue(""Add Service Length""));//MANUJ Added for BB Experience
						SetProperty(""Add Dis Quota"",GetFieldValue(""Add Dis Quota""));
						SetProperty(""Add Dis Price Overide"",GetFieldValue(""Add Dis Price Overide""));
						SetProperty(""Add Dis Charging Type"",GetFieldValue(""Add Dis Charging Type""));
					}
					PSInput.AddChild(DiscounPropertyset);	
				//	DiscountOld = DiscountId;			
					DiscountIdArr[DiscountIdAll] = ""Yes"";//MANUJ: Added for DiscountId Index, set Yes	
				}
				
		        RecExistAll=NextRecord();         
		    }//while(RecExistAll)

		}//end of with(stempAddonBC)
		//Bala: 31Mar2016: Added for Retention Samsung S7 Promotion Offer -- End of Code
	///////////////////////////////////////////////	
		with(BusCompUser)
		{
			ActivateField(""Add Id""); 
			ActivateField(""Plan Id"");
			ActivateField(""User Name"");	
			ClearToQuery(); 
			SetSearchSpec(""User Name"",LoginName);
			SetSearchSpec(""Plan Id"",PlanId); 
			ExecuteQuery(ForwardOnly);
			var RecExist = FirstRecord();      
			var count = CountRecords();
			if(RecExist) 
			{
				while(RecExist)//Mayank : Added for Postpaid Vanity  
				{ //Mayank : Added for Postpaid Vanity  
					//var DiscountId=GetFieldValue(""Plan Id""); Mayank: Inactivated for Postpaid Vanity  
					var DiscountId=GetFieldValue(""Add Id"");//Mayank : Added for Postpaid Vanity   -- 
					//User Table stores Discount Id.Get Discount ID.
					//Get Service Plan and Order Type from the Order
					//Query in Discount addons to get the relevant discount Id.
					//Also Look for Service Length,
					with(BusCompAddon)
					{   
						ActivateField(""Plan Id"");
						ActivateField(""Add Prod Name"");
						ActivateField(""Add Prod Id"");
						ActivateField(""Dis Amount"");
						ActivateField(""Billing Service Type""); 
						ActivateField(""Order Type"");
						ActivateField(""Status"");
						ActivateField(""Add Dis Type"");
						//MANUJ Added for BB LTE Experience
						ActivateField(""Add Service Length"");//MANUJ Added for BB Experience
						ActivateField(""Add Dis Quota"");//MANUJ Added for BB Experience
						ActivateField(""Add Dis Price Overide"");//MANUJ Added for BB Experience
						ActivateField(""Add Dis Charging Type"");//MANUJ Added for BB Experience
						ActivateField(""STC Restriction Flag"");//Bala: 31Mar2016: Addded for RetentionrenewalOffer
						ClearToQuery(); 
						//SetSearchSpec(""Plan Id"",DiscountId);//Find Discount product for the plan ordered and order type
						SetSearchSpec(""Plan Id"",PlanId);//Mayank : Modified for Postpaid Vanity    
						SetSearchSpec(""Status"",""Active"");
						if (OrderType == ""Migration"" && MigSubType == ""Service Migration"")//[NAVIN:01Jul2018:ServiceMigration_AddDiscount]
						{SetSearchSpec(""Order Type"", MigSubType);}
						else
						{SetSearchSpec(""Order Type"", OrderType);}
						SetSearchSpec(""Add Prod Id"",DiscountId);//Mayank : Added for Postpaid Vanity 
						ExecuteQuery(ForwardOnly);
						var Discount = CountRecords();
						var RecExist1 = FirstRecord();
						while(RecExist1) 
						{
							DisOrderType=GetFieldValue(""Order Type"");
							 sRestrictionFlag = GetFieldValue(""STC Restriction Flag"");//Bala: 31Mar2016: Addded for RetentionrenewalOffer
							if(DisOrderType=="""" && DiscountIdArr[DiscountId] != ""Yes"" && sRestrictionFlag != ""All"")
							{
								var DiscounPropertyset=AppObj.NewPropertySet();
								with(DiscounPropertyset){
									SetProperty(""DiscounProduct"",GetFieldValue(""Add Prod Name"")); 	
									SetProperty(""DiscountProductId"",GetFieldValue(""Add Prod Id"")); 
									SetProperty(""BillingServiceType"",GetFieldValue(""Billing Service Type""));					 
									SetProperty(""ActiveProduct"",GetFieldValue(""Status""));
									SetProperty(""DiscountType"",GetFieldValue(""Add Dis Type""));
									SetProperty(""Add Service Length"",GetFieldValue(""Add Service Length""));//MANUJ Added for BB Experience
									SetProperty(""Add Dis Quota"",GetFieldValue(""Add Dis Quota""));
									SetProperty(""Add Dis Price Overide"",GetFieldValue(""Add Dis Price Overide""));
									SetProperty(""Add Dis Charging Type"",GetFieldValue(""Add Dis Charging Type""));
								}
								PSInput.AddChild(DiscounPropertyset);
								DiscountIdArr[DiscountId] = ""Yes"";//MANUJ: Added for DiscountId Index, set Yes
							}
							else if(OrderType==""Provide"" && DiscountIdArr[DiscountId] != ""Yes"" && sRestrictionFlag != ""All"")//Search in array with row_id as the index and if found , 
							{
								var DiscounPropertyset=AppObj.NewPropertySet();	
								with(DiscounPropertyset){
									SetProperty(""DiscounProduct"",GetFieldValue(""Add Prod Name"")); 	
									SetProperty(""DiscountProductId"",GetFieldValue(""Add Prod Id"")); 
									SetProperty(""BillingServiceType"",GetFieldValue(""Billing Service Type""));					 
									SetProperty(""ActiveProduct"",GetFieldValue(""Status""));
									SetProperty(""DiscountType"",GetFieldValue(""Add Dis Type""));
									SetProperty(""Add Service Length"",GetFieldValue(""Add Service Length""));//MANUJ Added for BB Experience
									SetProperty(""Add Dis Quota"",GetFieldValue(""Add Dis Quota""));
									SetProperty(""Add Dis Price Overide"",GetFieldValue(""Add Dis Price Overide""));
									SetProperty(""Add Dis Charging Type"",GetFieldValue(""Add Dis Charging Type""));
								}			
								PSInput.AddChild(DiscounPropertyset);
							//	DiscountOld = DiscountId;
								DiscountIdArr[DiscountId] = ""Yes"";//MANUJ: Added for DiscountId Index, set Yes
							}
							else if(((OrderType == ""Modify"") || (OrderType == ""Migration"" && MigSubType == ""Service Migration"")) && DiscountIdArr[DiscountId] != ""Yes"" )
							{
								var DiscounPropertyset=AppObj.NewPropertySet();	
								with(DiscounPropertyset){
									SetProperty(""DiscounProduct"",GetFieldValue(""Add Prod Name"")); 	
									SetProperty(""DiscountProductId"",GetFieldValue(""Add Prod Id"")); 
									SetProperty(""BillingServiceType"",GetFieldValue(""Billing Service Type""));					 
									SetProperty(""ActiveProduct"",GetFieldValue(""Status""));
									SetProperty(""DiscountType"",GetFieldValue(""Add Dis Type""));
									SetProperty(""Add Service Length"",GetFieldValue(""Add Service Length""));//MANUJ Added for BB Experience
									SetProperty(""Add Dis Quota"",GetFieldValue(""Add Dis Quota""));
									SetProperty(""Add Dis Price Overide"",GetFieldValue(""Add Dis Price Overide""));
									SetProperty(""Add Dis Charging Type"",GetFieldValue(""Add Dis Charging Type""));
								}
								PSInput.AddChild(DiscounPropertyset);	
							//	DiscountOld = DiscountId;			
								DiscountIdArr[DiscountId] = ""Yes"";//MANUJ: Added for DiscountId Index, set Yes	
							}
							
							RecExist1=NextRecord();	            
						}//while 
						
						//////////////////////adding code for both////////////////////////
						ClearToQuery(); 
						/*SetSearchSpec(""Plan Id"",DiscountId);  
						SetSearchSpec(""Status"",""Active""); 
						SetSearchSpec(""Order Type"",""""); */ 
						var vSExp2  = ""[Plan Id] ='"" + DiscountId + ""' AND [Status] = 'Active' AND [Order Type] is null AND [STC Restriction Flag] <> 'All'"";
						SetSearchExpr(vSExp2);   
						ExecuteQuery(ForwardOnly); 
						var RecExist2 = FirstRecord(); 
						while(RecExist2)
						{
							DisOrderType=GetFieldValue(""Order Type"");
							var DiscounPropertyset=AppObj.NewPropertySet();	
							DiscounPropertyset.SetProperty(""DiscounProduct"",GetFieldValue(""Add Prod Name"")); 	
							DiscounPropertyset.SetProperty(""DiscountProductId"",GetFieldValue(""Add Prod Id"")); 
							DiscounPropertyset.SetProperty(""BillingServiceType"",GetFieldValue(""Billing Service Type"")); 
							DiscounPropertyset.SetProperty(""ActiveProduct"",GetFieldValue(""Status"")); 
							DiscounPropertyset.SetProperty(""DiscountType"",GetFieldValue(""Add Dis Type""));
							PSInput.AddChild(DiscounPropertyset);
						RecExist2=NextRecord();	
						}
						//////////////////////adding code for both////////////////////////
						
					} //with
					RecExist=NextRecord();//Mayank : Added for Postpaid Vanity
				}//Mayank : Added for Postpaid Vanity
			}//RecExist
		}//BusCompUser
		var cnt = PSInput.GetChildCount();
		for (var k = 0; k < cnt; k++)
		{ var out = PSInput.GetChild(k);
			Outputs.AddChild(out);
		}	
	}//	PlanId
	//return(ContinueOperation);
}//try
catch(e)
{
	LogException(e, OrderHeaderId);
}
finally
{
	stempPlanBC = null; stempAddonBC = null;
	stempBO = null;
	psInputs = null; psOutputs = null; svcbsService = null;
	BusCompUser = null; BusCompAddon = null; BusCompPlan = null;
	BusObj = null;
	AppObj=null;
}

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{ 
	var ireturn;
	var psInputs; 
	var psOutputs;

	try
	{
		ireturn = ContinueOperation;
		switch(MethodName)
		{
			case ""Init"":
					Init(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
			case ""Query"":
					Query(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
			
			case ""PreInsert"":
			ireturn = CancelOperation;
			break;		
			default:
					//ireturn = ContinueOperation;
					break;
		}
	return (ireturn);
	}
	catch(e)
	{
	LogException(e, """");
	}
	finally
	{
	}
	return (ContinueOperation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	var iReturn;
	
	try  
	{
		iReturn = ContinueOperation;
		switch (MethodName)
		{
			case ""UpdateDunningStatus"":
			 	UpdateDunningStatus(Inputs, Outputs);
				iReturn = CancelOperation;
				break;
							    								 
			default: 
				iReturn = ContinueOperation;
				
		} //switch
		
	} 
	catch (e)
	{	
		throw(e);	
	}
	return (iReturn);
}
function UpdateDunningStatus(Inputs, Outputs)
{
	var billAccountId;
	var srId, dunningStatus;

	var boAccount, boBilling;
	var bcAccount, bcAccount2;
	
	var isRecord, isRecord1;
	var parAccountId;
	var currentBillId;
	
	var count=0, count1=0, acctId;
	
	try
	{
		billAccountId = Inputs.GetProperty(""BillingAccountId"");
		srId = Inputs.GetProperty(""SRId"");
		dunningStatus = Inputs.GetProperty(""DunningStatus"");
				
		boAccount = TheApplication().GetBusObject(""Account"");
		bcAccount = boAccount.GetBusComp(""Account"");	
		
		with(bcAccount)
		{

//Updating the Dunnnig status of Current BAN:
			SetViewMode(AllView);
			ActivateField(""Parent Account Id"");
			ActivateField(""Dunning Excluded"");
			ActivateField(""Tax ID Number"");
			//ActivateField(""Dunning Excluded Flag"");
			ClearToQuery();
			SetSearchSpec(""Id"", billAccountId);
			ExecuteQuery(ForwardOnly);
			isRecord = FirstRecord();
			//count = CountRecords();	
			if(isRecord)//1
			{
				//acctId = GetFieldValue(""Id"");
				SetFieldValue(""Dunning Excluded"", dunningStatus);
				WriteRecord();
			
			
//Updating the Dunnnig status of Parent CAN:
			//	parAccountId = GetFieldValue(""Parent Account Id"");
			//		SetViewMode(AllView);
					//ActivateField(""Id"");
					//ActivateField(""Dunning Excluded"");
					//ActivateField(""Dunning Excluded Flag"");
			//		ClearToQuery();
			//		SetSearchSpec(""Id"", parAccountId);
			//		ExecuteQuery(ForwardOnly);
			//		isRecord = FirstRecord();
					//count = CountRecords();	
			//		if(isRecord)
			//		{
						//acctId = GetFieldValue(""Id"");
			//			SetFieldValue(""Dunning Excluded"", dunningStatus);
			//			WriteRecord();
			//		}
			}//end of if(isRecord)//1	
						
//Updating the Dunnnig status of Child Dept BAN:				
			SetViewMode(AllView);
			//ActivateField(""Parent Account Id"");
			//ActivateField(""Dunning Excluded"");
			//ActivateField(""Dunning Excluded Flag"");
			ClearToQuery();
			SetSearchSpec(""Parent Account Id"", billAccountId);
			ExecuteQuery(ForwardOnly);
			isRecord = FirstRecord();	
			//count = CountRecords();
			
			boBilling = TheApplication().GetBusObject(""STC Billing Account"");
			bcAccount2 = boBilling.GetBusComp(""CUT Invoice Sub Accounts"");
			
			while (isRecord)
			{
				//acctId = GetFieldValue(""Id"");
				currentBillId = GetFieldValue(""Id"");
				SetFieldValue(""Dunning Excluded"", dunningStatus);
				WriteRecord();
				
			
//Updating the Dunnnig status of Child Emp BAN:
				
				with(bcAccount2)
				{					
					bcAccount2.SetViewMode(AllView);
					bcAccount2.ActivateField(""Parent Account Id"");
					bcAccount2.ActivateField(""Dunning Excluded"");
					//ActivateField(""Dunning Excluded Flag"");
					bcAccount2.ClearToQuery();
					bcAccount2.SetSearchSpec(""Parent Account Id"", currentBillId);
					bcAccount2.ExecuteQuery(ForwardOnly);
					isRecord1 = bcAccount2.FirstRecord();
					//count1 = bcAccount2.CountRecords();
					while (isRecord1)
					{
						//acctId = bcAccount2.GetFieldValue(""Id"");
						bcAccount2.SetFieldValue(""Dunning Excluded"", dunningStatus);
						bcAccount2.WriteRecord();
						isRecord1 = bcAccount2.NextRecord();
					}	
					
				}
				
				isRecord = bcAccount.NextRecord();
			}
		

		}
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
		bcAccount = null;
		bcAccount2 = null;
		boBilling = null;
		boAccount = null;
	}

		
}
function DateConversion(Inputs, Outputs) 
{
var Second = """";
var Date = Inputs.GetProperty(""Date"");
var Date1 = ToString(Date);
var date2 = Date1.substring(3, 5);
var Check = date2.substring(0, 1);
Check = ToNumber(Check);
if(Check == 0)
{
date2 = date2.substring(1, 2);
}

Outputs.SetProperty(""Date"",date2);
return(CancelOperation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
var iReturn;
 try
{
 iReturn = ContinueOperation;
switch (MethodName)
{
 case ""DateConversion"":DateConversion(Inputs, Outputs);
iReturn = CancelOperation;
 break;

default:
 iReturn = ContinueOperation;
    
  }
  return (iReturn);
 } 
 catch (e)
 { 
  TheApplication().RaiseErrorText(e.toString());
 }

}
"//Your public declarations go here...  
function GetPlanList (Inputs,Outputs)
{
	var PortalOrderId=Inputs.GetProperty(""Portal Order Id"");
	var ESA=TheApplication().GetService(""EAI Siebel Adapter"");
	var SearchSpec=""[Header.STC Portal Order Id] = '""+PortalOrderId+""' AND [Line Item.STC Parent Portal Order Id] = '""+PortalOrderId+""' AND [Line Item.STC Status] = 'InProgress' AND [Line Item.STC Order Identifier] <> 'Contractual' AND [Line Item.STC Order Identifier] <> 'Pre-Booking'""; //AND [Line Item.STC Order Flag] = 'Y'"";

	var inp=TheApplication().NewPropertySet();
	var out=TheApplication().NewPropertySet();
	var PlanList,tmp,pcat,ppart;

	var Qbs=TheApplication().GetService(""STC Siebel Operation BS"");


	try
	{
		Outputs.SetProperty(""Error Message"","""");
		Outputs.SetProperty(""Error Code"","""");
		Outputs.SetProperty(""Plan List"","""");

		inp.SetProperty(""SearchSpec"",SearchSpec);
		inp.SetProperty(""OutputIntObjectName"",""STC ECommerce Order IO"");
		ESA.InvokeMethod(""Query"",inp,out);

		PlanList="""";
		var NumItems=out.GetChild(0).GetChild(0).GetChild(0).GetChild(0).GetChildCount();
		for(var i=0;i<NumItems;i++)
		{	
			tmp="""";
			tmp=out.GetChild(0).GetChild(0).GetChild(0).GetChild(0).GetChild(i).GetProperty(""STC Prod Name"");
			pcat=out.GetChild(0).GetChild(0).GetChild(0).GetChild(0).GetChild(i).GetProperty(""STC Prod Item Category"");
			ppart=out.GetChild(0).GetChild(0).GetChild(0).GetChild(0).GetChild(i).GetProperty(""STC Prod Part Code"");
			//var test=pcat.search(""Device"");
			if((pcat.search(""Device""))>=0)
			{
				tmp=tmp+"",""+MatchDeviceAndGetIns(Qbs,ppart);
			}
			if(i==0)
				PlanList=tmp;
			else
				PlanList=PlanList+"",""+tmp;

		}
		Outputs.SetProperty(""Plan List"",PlanList);
		
		//SortEcomLineItem(Inputs,Outputs);
	}
	catch(e)
	{
		Outputs.SetProperty(""Error Message"",e.errText);
		Outputs.SetProperty(""Error Code"",e.errCode);
		Outpust.SetProperty(""Plan List"","""");
	}
	finally
	{

		
	}

}
"
"//Your public declarations go here...  
function MatchDeviceAndGetIns(Qbs,Devicepart)
{

	var inp1=TheApplication().NewPropertySet();
	var out1=TheApplication().NewPropertySet();

	try
	{
		var val=TheApplication().InvokeMethod(""LookupValue"",""STC_INSURANCE_DEVICES"",Devicepart);
		//var testv=val.search(""^DEVICE"");
		if((val.search(""^DEVICE""))>=0)
		{
			var DevInsPart=TheApplication().InvokeMethod(""LookupValue"",""STC_ECOM_DEVICE_INSURANCE_PART"",""STC_ECOM_DEVICE_INSURANCE_PART"");
			inp1.SetProperty(""BusinessComponent"",""Internal Product - ISS Admin"");
			inp1.SetProperty(""SearchExpression"",""[Part #]='""+DevInsPart+""'"");
			inp1.SetProperty(""BusinessObject"",""Admin ISS Product Definition"");
			inp1.SetProperty(""Field1"",""Name"");

			Qbs.InvokeMethod(""SiebelQuery"",inp1,out1);

			var pIns=out1.GetProperty(""Output1"");

			inp1.Reset();
			out1.Reset();

		}
	}
	
	catch(e)
	{
	}
	finally
	{
	}

	return pIns;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	try
	{
		switch(MethodName)
		{
			case ""GetPlanList"":
				Outputs.SetProperty(""Error Code"","""");
				Outputs.SetProperty(""Error Message"","""");
				Outputs.SetProperty(""Plan List"","""");

				GetPlanList(Inputs,Outputs);
				return(CancelOperation);
			default:
				return(ContinueOperation);
		}

	}
	catch(e)
	{
		Outputs.SetProperty(""Error Code"",e.errCode);
		Outputs.SetProperty(""Error Message"",e.errText);
		Outputs.SetProperty(""Plan List"","""");
	}
	finally
	{
		//Inputs.Reset();
		//Outputs.Reset();
	}
	return (ContinueOperation);
}
"//Your public declarations go here...  
function SortEcomLineItem(Inputs,Outputs)
{
	var PortalOrderId=Inputs.GetProperty(""Portal Order Id"");
	var ESA=TheApplication().GetService(""EAI Siebel Adapter"");
	var SearchSpec=""[Header.STC Portal Order Id] = '""+PortalOrderId+""' AND [Line Item.STC Parent Portal Order Id] = '""+PortalOrderId+""' AND [Line Item.STC Status] = 'InProgress' AND [Line Item.STC Order Identifier] <> 'Contractual' AND [Line Item.STC Order Identifier] <> 'Pre-Booking'""; //AND [Line Item.STC Order Flag] = 'Y'"";

	var inp=TheApplication().NewPropertySet();
	var out=TheApplication().NewPropertySet();
	var SortedOut=TheApplication().NewPropertySet();
	var PlanList="""",EquipList="""",ContractList="""",DiscountList="""",PromoList="""",VariantList="""",AccessList="""",tmp,pcat,ppart,pitemcat;
	var AllPlanList="""";

	var Qbs=TheApplication().GetService(""STC Siebel Operation BS"");

	try
	{
		Outputs.SetProperty(""Error Message"","""");
		Outputs.SetProperty(""Error Code"","""");
		Outputs.SetProperty(""Plan List"","""");

		inp.SetProperty(""SearchSpec"",SearchSpec);
		inp.SetProperty(""OutputIntObjectName"",""STC ECommerce Order IO"");
		ESA.InvokeMethod(""Query"",inp,out);

		//PlanList="""";
		var NumItems=out.GetChild(0).GetChild(0).GetChild(0).GetChild(0).GetChildCount();

		for(var i=0;i<NumItems;i++)
		{	
			tmp="""";
			tmp=out.GetChild(0).GetChild(0).GetChild(0).GetChild(0).GetChild(i).GetProperty(""STC Prod Name"");
			pcat=out.GetChild(0).GetChild(0).GetChild(0).GetChild(0).GetChild(i).GetProperty(""STC Prod Category"");
			pitemcat=out.GetChild(0).GetChild(0).GetChild(0).GetChild(0).GetChild(i).GetProperty(""STC Prod Item Category"");
			ppart=out.GetChild(0).GetChild(0).GetChild(0).GetChild(0).GetChild(i).GetProperty(""STC Prod Part Code"");
			
			if (pcat==""Plan"")
			{
				if(PlanList.length==0)
					PlanList=tmp;
				else
					PlanList=PlanList+"",""+tmp;	
			}
			else if (pcat==""Contract"")
			{
				if(ContractList.length==0)
					ContractList=tmp;
				else
					ContractList=ContractList+"",""+tmp;
			}
			else if (pcat==""Equipment"")
			{
				if((pitemcat.search(""Device""))>=0)
				{
					tmp=tmp+"",""+MatchDeviceAndGetIns(Qbs,ppart);
				}
				if(EquipList.length==0)
					EquipList=tmp;
				else
					EquipList=EquipList+"",""+tmp;
			}
			else if (pcat==""Variant"")
			{
				if(VariantList.length==0)
					VariantList=tmp;
				else
					VariantList=VariantList+"",""+tmp;
			}
			else if (pcat==""Discount"")
			{
				if(DiscountList.length==0)
					DiscountList=tmp;
				else
					DiscountList=DiscountList+"",""+tmp;
			}
			else if (pcat==""CRMPromo"")
			{
				if(PromoList.length==0)
					PromoList=tmp;
				else
					PromoList=PromoList+"",""+tmp;
			}
			else
			{
				if(AccessList.length==0)
					AccessList=tmp;
				else
					AccessList=AccessList+"",""+tmp;
			}
			
		}

			if(PlanList.length > 0)
				AllPlanList=AllPlanList+"",""+PlanList;
			if(ContractList.length > 0)
				AllPlanList=AllPlanList+"",""+ContractList;
			if(EquipList.length > 0)
				AllPlanList=AllPlanList+"",""+EquipList;
			if(VariantList.length > 0)
				AllPlanList=AllPlanList+"",""+VariantList;
			if(DiscountList.length > 0)
				AllPlanList=AllPlanList+"",""+DiscountList;
			if(PromoList.length > 0)
				AllPlanList=AllPlanList+"",""+PromoList;
			if(AccessList.length > 0)
				AllPlanList=AllPlanList+"",""+AccessList;

		Outputs.SetProperty(""Plan List"",AllPlanList.substring(1));
	}
	catch(e)
	{
		Outputs.SetProperty(""Error Message"","""");
		Outputs.SetProperty(""Error Code"","""");
		Outputs.SetProperty(""Plan List"","""");
	}
	finally
	{
	}
}
function Init(Inputs, Outputs)
{
	try
	{
		Outputs.SetProperty(""Query On"","""");
		Outputs.SetProperty(""Value"","""");
		Outputs.SetProperty(""STC Result"","""");
		return (CancelOperation);
	
	}
catch(e)
	{

	}
	finally
	{
	}
}
function Query(Inputs, Outputs)
{

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	var ireturn;
	var psInputs;
	var psOutputs;
	
	try
	{
	    switch(MethodName)
		{	
		
			  	case ""Init"": 
					Init(Inputs,Outputs);
					ireturn =CancelOperation;
					break;
					
				case ""Query"": 
					Query(Inputs,Outputs);
					ireturn =CancelOperation;
					break;
					
				case ""PreInsert"":
					ireturn =CancelOperation;
					break;
					
				case ""Insert"":
					ireturn =CancelOperation;
					break;

				case ""Update"":
					ireturn =CancelOperation;
					break;
	
				case ""Delete"":
					ireturn =CancelOperation;
					break;
				
									
		       	default:
		       	ireturn = ContinueOperation;
				break;
		}
			return(ireturn);	
	}
 catch(e)
	{

	}
	finally
	{
	}
	return(CancelOperation);
}
function GetEmail(Inputs,Outputs)
{
		var diff= Inputs.GetProperty(""Difference"");
		var appObj = TheApplication();
		var pos="""";

		if(diff>100)
		{
		pos= appObj.InvokeMethod(""LookupValue"",""POSITION_NAME"",""SFA"");
		
		}
		else
		{
		pos= appObj.InvokeMethod(""LookupValue"",""POSITION_NAME"",""Manager – Billing & Collection"");
		}
		
		with(appObj)
		{
		var PositionBO = GetBusObject(""Position"");
		var PositionBC = PositionBO.GetBusComp(""Position"");
		
		var EmployeeBO = GetBusObject(""Employee"");
		var EmployeeBC = EmployeeBO.GetBusComp(""Employee"");
		}
		
		
		with(PositionBC)
		{
			SetViewMode(AllView);
			ActivateField(""Name"");
			ActivateField(""Primary Employee Id"");
			
			ClearToQuery();
			SetSearchSpec(""Name"", pos);
			ExecuteQuery(ForwardOnly);
			
			if(FirstRecord())
			{
				var employeeId = GetFieldValue(""Primary Employee Id"");
				
			}
			
			
		}
		
		with(EmployeeBC)
		{
			SetViewMode(AllView);
			ActivateField(""EMail Addr"");
			
			ClearToQuery();
			SetSearchSpec(""Id"", employeeId);
			ExecuteQuery(ForwardOnly);
			
			if(FirstRecord())
			{
				var emailId = GetFieldValue(""EMail Addr"");
				
			}
		}
		Outputs.SetProperty(""Email"",emailId);
		Outputs.SetProperty(""EmpId"",employeeId);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
if(MethodName==""GetEmail"")
{
GetEmail(Inputs,Outputs);
return(CancelOperation);

}

	return (ContinueOperation);
}
function Init (Inputs,Outputs)
{
	with (Outputs) // Initilaizing the VBC Propertyset
	{
		SetProperty(""STC Query Entity"","""");
	}	
}
function Query(Inputs,Outputs)
{
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	try
	{
		switch(MethodName)
		{
			case ""Init"":
				    Init(Inputs,Outputs);
				    return(CancelOperation);
					break;
					
			case ""Query"":				
					Query(Inputs,Outputs);					
					return(CancelOperation);
					break;
					
			case ""PreInsert"":
					return(CancelOperation);
					break;
							
			case ""Insert"":
					return(CancelOperation);
					break;
			default:
					return(ContinueOperation);					
		}
	
	}
	finally
	{
	}
	return (ContinueOperation);
}
function ExportData(Inputs, Outputs)
{
	
try
{
	
	var vInputFile="""",vReadFromFile="""",ErrMsg="""",strError="""",vIMEI="""",vIMEI1 = """",vIMEI2 = """",vCustomerName = """";
	var vIBAN = """",vWriteoffAmount = """",vAgingIndays = """",vFlagIdentifier = """",vReason = """",vCustType = """",vCustSegment ="""";
	var vRecord = false;
	var RecCount=0,i=0,RecDataArrLen=0;
	var MSISDN="""",CallDuration="""";
	var vFileName;
	var vDTime = GetTimeStamp();
	var svc = TheApplication().GetService(""STC Get Filename"");
	var vInputs = TheApplication().NewPropertySet();
	var vOutputs = TheApplication().NewPropertySet();
	vInputs.SetProperty(""Type"",""STC_FILE_NAME"");
	vInputs.SetProperty(""LIC"",""STC_BLACK_LIST_DATA"");
	svc.InvokeMethod(""STC Get LOV Desc"", vInputs, vOutputs);
	var filepath = vOutputs.GetProperty(""Description"");
	//var filepath = ""C:\\temp\\"";
	vFileName = ""STC_BLACKLISTING_IMEI_DATA""+ ""_""+ vDTime +"".csv"";
	var vFP = Clib.fopen(filepath + vFileName,""w+"");
	
	var fline= ""IMEI\n"";
	Clib.fputs(fline,vFP);
		if(filepath != '' && filepath != """")
		{		
			
					
				ErrMsg = """"; //Nullify Error Message for each of the iteration			
	
				var boIMEI = TheApplication().GetBusObject(""STC IMEI Data BO"");
				var bcIMEI = boIMEI.GetBusComp(""STC IMEI Data BC"");
			

				with (bcIMEI)
					
					{
						ActivateField(""IMEI1"");
						ActivateField(""IMEI2"");
						ActivateField(""BlackListCalc"");
						ClearToQuery();
						SetSearchSpec(""BlackListCalc"", ""Y"");
						ExecuteQuery(ForwardOnly);
						var IsIMEI = FirstRecord();
						
								while(IsIMEI)
								{
									vIMEI1 = GetFieldValue(""IMEI1"");
									vIMEI2 = GetFieldValue(""IMEI2"");
									if ((vIMEI1 != null && vIMEI1!="""") && (vIMEI2 !=null &&  vIMEI2!=""""))
									{
										if (vIMEI != null && vIMEI != """")
											{
												vIMEI= vIMEI+"",""+vIMEI1+"",""+vIMEI2;
											}
										else
										{
											vIMEI = vIMEI1+"",""+vIMEI2;
										}
									}
									else
									{
										if ((vIMEI1!= null && vIMEI1 !="""") && (vIMEI2 == null || vIMEI2 ==""""))
										{
											if (vIMEI != null && vIMEI != """")
											{
												vIMEI = vIMEI+"",""+vIMEI1;
											}
											else
											{
												vIMEI = vIMEI1;
											}

										}
										if ((vIMEI2!= null && vIMEI2 !="""") && (vIMEI1 == null || vIMEI1 == """"))
										{
											if (vIMEI != null && vIMEI != """")
											{
												vIMEI = vIMEI+"",""+vIMEI2;
											}
											else
											{
												vIMEI = vIMEI2;
											}

											
										}
									}
								
									IsIMEI = NextRecord();
								} // IsIMEI
					} //bcIMEI
							
						Clib.fputs(vIMEI,vFP);
					

				
					Outputs.SetProperty(""FileName"",filepath+vFileName);
					
					
					
			} //End If filepath	
		//	vReadFromFile = Clib.fgets(4000, vInputFile);		

  			Clib.fclose(vFP);
		
 }
 catch(e)
 {
	throw(e);
 }
 finally
 {
 }


		
		
		
		
	
	
}
function GetTimeStamp()
{
	var SysDate = Clib.time();
	var ObjDate = Date.fromSystem(SysDate); 

	var Month = ToString(ObjDate.getMonth()+1);
		if(Month.length == 1)   
			{
				Month = ""0"" + Month;
			}
	var Day = ToString(ObjDate.getDate());
		if(Day.length == 1)
			{
				Day = ""0"" + Day;
			}
	var Year = ToString(ObjDate.getFullYear());
	var Hour = ToString(ObjDate.getHours());
		if(Hour.length == 1)
			{
				Hour = ""0"" + Hour;
			}
	var Minute = ToString(ObjDate.getMinutes());
		if(Minute.length == 1)
			{
				Minute = ""0"" + Minute;
			}
	var Second = ToString(ObjDate.getSeconds()); 
		if(Second.length == 1)
			{
				Second = ""0"" + Second;
			}

	var now = Day+""""+Month+""""+Year+""""+Hour+""""+Minute+""""+Second; 

	return(now);
}
function Service_InvokeMethod (MethodName, Inputs, Outputs)
{

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""ExportData"")
	{
		ExportData(Inputs, Outputs);
		return(CancelOperation);
	}
	return (ContinueOperation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	try
	{
		if(MethodName == ""UpdateLastExtension"")
		{
			UpdateLastExtension(Inputs,Outputs);
			return (CancelOperation);
		}
		return (ContinueOperation);
	}
	catch(e)
	{
	}
	finally
	{
	}
}
function UpdateLastExtension(Inputs, Outputs)
{
	 try
	 {
		  var sOppyID = """", sBulkRowId = """", sPilotRowId = """",  sExtQuriedNumber = """", ExtQuerySpec = """", RecExists = """";
		  var sExtQueryBC = """", sNum = """";  
		  sExtQueryBC = TheApplication().GetBusObject(""STC AVAYA Opty BO"").GetBusComp(""STC Extension Avaya Query BC"");
		  sOppyID = Inputs.GetProperty(""Object Id"");
		  sBulkRowId = Inputs.GetProperty(""BulkRowId"");
		  sPilotRowId = Inputs.GetProperty(""PilotRowId""); 
		  with(sExtQueryBC)
		  {
			   ActivateField(""Opportunity Id"");
			   ActivateField(""Bulk Id"");
			   ActivateField(""Parent Pilot Id"");
			   ActivateField(""Extension Number"");   
			   SetViewMode(AllView);
			   ClearToQuery();
			   SetSortSpec(""Extension Number(DESCENDING)"");
			   ExtQuerySpec = ""[Opportunity Id] = '"" + sOppyID + ""' AND [Bulk Id] = '"" + sBulkRowId + ""' AND [Parent Pilot Id] = '"" + sPilotRowId + ""' AND [Action] = 'Delete'"";
			   SetSearchExpr(ExtQuerySpec);
			   ExecuteQuery(ForwardBackward);   
			   RecExists=FirstRecord();
			   if(RecExists)
			   {
			    sExtQuriedNumber = GetFieldValue(""Extension Number"");
			    sExtQuriedNumber = ToNumber(sExtQuriedNumber);
			    
			   }
		   }
		   if(RecExists)
		   {
			  with(sExtQueryBC)
			  {
			   ActivateField(""Opportunity Id"");
			   ActivateField(""Bulk Id"");
			   ActivateField(""Parent Pilot Id"");
			   ActivateField(""Extension Number"");
			   ActivateField(""STC NoAction Flag""); 
			   ActivateField(""Action"");  
			   SetViewMode(AllView);
			   ClearToQuery();
			   SetSortSpec(""Extension Number(DESCENDING)"");
			   ExtQuerySpec = ""[Opportunity Id] = '"" + sOppyID + ""' AND [Bulk Id] = '"" + sBulkRowId + ""' AND [Parent Pilot Id] = '"" + sPilotRowId + ""'"";
			   SetSearchExpr(ExtQuerySpec);
			   ExecuteQuery(ForwardBackward);   
			   RecExists=FirstRecord();
			   while(RecExists)
			   {
			    sNum = GetFieldValue(""Extension Number"");
			    sNum = ToNumber(sNum);
			    if(sNum > sExtQuriedNumber)
			    {
			     SetFieldValue(""STC NoAction Flag"", ""Y"");
			     SetFieldValue(""Action"", ""Delete"");
			     WriteRecord();
			    }
			    RecExists = NextRecord();
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
	  sExtQueryBC = null;
	 }
}
function CreateEmployee(Inputs,Outputs)
{
//Function to create Employee,associate Resposibility and Position.
//Update primaries for the Responsibility and Position.
try{
	var sBoEmployee = TheApplication().GetBusObject(""Employee"");
	var sBcEmployee = sBoEmployee.GetBusComp(""Employee"");
		
	var sPrimaryResp = TheApplication().InvokeMethod(""LookupValue"",""STC_CREATE_EMP"",""Primary Responsibility"");
	var sPrimaryPostn = TheApplication().InvokeMethod(""LookupValue"",""STC_CREATE_EMP"",""Primary Position"");
	
	var sFirstName = Inputs.GetProperty(""FirstName"");
	var sLastName = Inputs.GetProperty(""LastName"");
	var sLoginName = Inputs.GetProperty(""UserId"");
	var sEmailId = Inputs.GetProperty(""Email"");
	var sErrorCode = Inputs.GetProperty(""ErrorCode"");
	var sErrorMessage = Inputs.GetProperty(""ErrorMessage"");
	
	var sEmpId = """";
	var sMVGBcResp = """";
	var sAssocBcResp = """";
	var sRespId = """";
	var IsMVGRec = """";
	var sPostnId = """";
	var sMVGBcPostn = """";
	var sAssocBcPostn = """";
	var IsPostnRec = """";
	var IsMVGPostnRec = """";
	
	with(sBcEmployee){
		NewRecord(NewAfter);
		SetFieldValue(""First Name"",sFirstName);
		SetFieldValue(""Last Name"",sLastName);
		SetFieldValue(""Login Name"",sLoginName);
		SetFieldValue(""EMail Addr"",sEmailId);
		sEmpId = GetFieldValue(""Id"");
		sMVGBcResp = GetMVGBusComp(""Responsibility"");
		sAssocBcResp = GetMVGBusComp(""Responsibility"").GetAssocBusComp();
		//To associate the configured responsibility to new employee
		with(sAssocBcResp){
			//ActivateField();
			ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Name"",sPrimaryResp);
			ExecuteQuery(ForwardOnly);
			var IsRespRec = FirstRecord();
			if(IsRespRec){
				Associate(NewBefore);
				sRespId = sAssocBcResp.GetFieldValue(""Id"");				
			}//endif IsRec
		}//endwith sBcResp
		//To Update primary for the associated record.
		with(sMVGBcResp){
			ActivateField(""SSA Primary Field"");
			ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Id"",sRespId);
			ExecuteQuery(ForwardOnly);
			IsMVGRec = FirstRecord();
			if(IsMVGRec){
				SetFieldValue(""SSA Primary Field"",""Y"");
				sMVGBcResp.WriteRecord();
			}//endif IsMVGRec
			//Delete ""Siebel Administrator"" responsibility which was added by default.
			ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Name"",""Siebel Administrator"");
			ExecuteQuery(ForwardOnly);
			IsMVGRec = FirstRecord();
			if(IsMVGRec){
				DeleteRecord();
			}//endif IsMVGRec			
		}//endwithsMVGBcResp
		//To associate the configured Position to new employee.
		sMVGBcPostn = 	GetMVGBusComp(""Position"");
		sAssocBcPostn = GetMVGBusComp(""Position"").GetAssocBusComp();
		with(sAssocBcPostn){
			//ActivateField();
			ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Name"",sPrimaryPostn);
			ExecuteQuery(ForwardOnly);
			IsPostnRec = FirstRecord();
			if(IsPostnRec){
				Associate(NewBefore);
				sPostnId = sAssocBcPostn.GetFieldValue(""Id"");
			}//endif IsFirstRec			
		}//endwith sBcPostn
		//To Update primary for the associated record.
		with(sMVGBcPostn){
			ActivateField(""SSA Primary Field"");
			ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Id"",sPostnId);
			ExecuteQuery(ForwardOnly);
			IsMVGPostnRec = FirstRecord();
			if(IsMVGPostnRec){
				SetFieldValue(""SSA Primary Field"",""Y"");
				sMVGBcPostn.WriteRecord();			
			}//endif IsMVGPostnRec			
		}//endwith sMVGBcPostn
		sBcEmployee.WriteRecord();
	}//endwith sBcEmployee
	
	Outputs.SetProperty(""ErrorCode"",""0"");
	Outputs.SetProperty(""ErrorMessage"",""Success"");	

}//endtry
catch(e){
	Outputs.SetProperty(""ErrorCode"",""1"");
	Outputs.SetProperty(""ErrorMessage"",""EmployeeCreationFailed"");	
}//endcatch
finally{
	sBcEmployee = """";
	sBoEmployee = """";
}//endfinally
	return CancelOperation;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""CreateEmployee""){
		CreateEmployee(Inputs,Outputs);
		return CancelOperation;
	}//endif MethodName == ""CreateEmployee""
	return (ContinueOperation);
}
function FindApprovalTemplate(Inputs,Outputs)
{
var sApp = TheApplication();
var STCOutputs = sApp.NewPropertySet();
var AppBO=TheApplication().GetBusObject(""STC Adjustment Approval Mapping BO"");
var AppBC=AppBO.GetBusComp(""STC Adjustment Approval Mapping"");
var AppDef=AppBO.GetBusComp(""STC Adjustment Approval Mapping"");
var count;
var AdjType = """", AdjReason = """", AdjCusSegment = """",AdjServiceType = """", AdjApprovalItem = """",AdjApprovalItemDef = """", AdjApprovalItemFin = """",AdjServiceSubType = """", MinApprovalAmount = 0,MaxApprovalAmount = 0;
  with(Inputs)
   {
    AdjType = GetProperty(""AdjType"");
    AdjReason = GetProperty(""AdjReason"");
    AdjCusSegment = GetProperty(""AdjCusSegment"");
    AdjServiceType = GetProperty(""AdjServiceType"");
 AdjServiceSubType = GetProperty(""AdjServiceSubType"");

   }  
var spec = ""[Adjustment Reason] = '"" + AdjReason + ""' AND [Adjustment Type] = '"" + AdjType + ""' AND [Cust Segment] = '"" + AdjCusSegment + ""'  AND [Service Type] = '"" + AdjServiceType + ""'"";
var specDef = ""[Adjustment Reason] IS NULL AND [Adjustment Type] = '"" + AdjType + ""' AND [Cust Segment] = '"" + AdjCusSegment + ""'  AND [Service Type] = '"" + AdjServiceType + ""' AND [Adjustment Sub Type] = '"" + AdjServiceSubType + ""'"";

 
 with(AppBC){
  SetViewMode(AllView);
  ActivateField(""Adjustment Reason"");
  ActivateField(""Adjustment Type"");
  ActivateField(""Approval Item"");
  ActivateField(""Cust Segment"");
  ActivateField(""Service Type"");
ActivateField(""Adjustment Sub Type"");
ActivateField(""Min Approval Amount"");
ActivateField(""Max Approval Amount"");
  ClearToQuery();
  SetSearchExpr(spec); 
  ExecuteQuery(ForwardOnly);
  count = CountRecords();
  var AppRec = FirstRecord();
  if(AppRec)
  {
  AdjApprovalItem = GetFieldValue(""Approval Item"");
 MinApprovalAmount = GetFieldValue(""Min Approval Amount"");
MaxApprovalAmount = GetFieldValue(""Max Approval Amount"");
 
  }
  else
  {
  with(AppDef){
  SetViewMode(AllView);
  ActivateField(""Adjustment Reason"");
  ActivateField(""Adjustment Type"");
  ActivateField(""Approval Item"");
  ActivateField(""Cust Segment"");
  ActivateField(""Service Type"");
ActivateField(""Adjustment Sub Type"");
ActivateField(""Min Approval Amount"");
ActivateField(""Max Approval Amount"");
  ClearToQuery();
  SetSearchExpr(specDef); 
  ExecuteQuery(ForwardOnly);
  count = CountRecords();
  var AppRecDef = FirstRecord();
  if(AppRecDef)
  {
  AdjApprovalItemDef = GetFieldValue(""Approval Item"");
 MinApprovalAmount = GetFieldValue(""Min Approval Amount"");
MaxApprovalAmount = GetFieldValue(""Max Approval Amount"");
 
  }
  }
  }
}
if (AdjApprovalItem != """")
{
AdjApprovalItemFin = AdjApprovalItem;
}
else if (AdjApprovalItemDef != """")
{
AdjApprovalItemFin = AdjApprovalItemDef;
}
Outputs.SetProperty(""AdjApprovalItem"", AdjApprovalItemFin );
Outputs.SetProperty(""MinApprovalAmount"", MinApprovalAmount );
Outputs.SetProperty(""MaxApprovalAmount"", MaxApprovalAmount );



}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 if(MethodName == ""FindApprovalTemplate""){
  FindApprovalTemplate(Inputs,Outputs);
//  Outputs.SetProperty(""AdjApprovalItem"", AdjApprovalItem);
 //Outputs.SetProperty(""MinApprovalAmount"", MinApprovalAmount);
  return CancelOperation;
 }
 return (ContinueOperation);
}
function FloorNumber(Inputs,Outputs)
{
	var sOrderNumber = Inputs.GetProperty(""CommitmentPeriod"");
	sOrderNumber = Math.floor(sOrderNumber);
	Outputs.SetProperty(""CommitmentPeriod"",sOrderNumber);
	
	return CancelOperation;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""FloorNumber""){
		FloorNumber(Inputs,Outputs);
		return CancelOperation;
	}
	return (ContinueOperation);
}
function FnFPortInPortOut(Inputs,Outputs)
{

try
{
var SpecItem = Inputs.GetProperty(""Number"");
var Type = Inputs.GetProperty(""Type"");
var appobj = TheApplication();
var SpecRateId;
var SpecItemBC = appobj.GetBusObject(""SWI Special Rating List Items"").GetBusComp(""SWI Special Rating List Items"");
SpecItem = ""00""+SpecItem;
	if(Type == ""PortOut"")
	{
			with(SpecItemBC)
			{
				
					ActivateField(""Inactive Flag"");
					ActivateField(""Phone Number Type"");
					ActivateField(""Special Rating List Id"");
					SetViewMode(AllView);
					ClearToQuery();
					SetSearchSpec(""Phone Number"", SpecItem);
					ExecuteQuery(ForwardOnly);
					var IsRec = FirstRecord();
					while(IsRec)
					{
						SpecRateId = GetFieldValue(""Special Rating List Id"");
						SetFieldValue(""Inactive Flag"", ""Y"");
						SetFieldValue(""Phone Number Type"", ""OFFNET"");
						WriteRecord();
						var psInputs = appobj.NewPropertySet();
						var psOutputs = appobj.NewPropertySet();
						
						var STCCreateSR = appobj.GetService(""Workflow Process Manager"");
						psInputs.SetProperty(""Object Id"", SpecRateId);
						psInputs.SetProperty(""ProcessName"", ""STC SWI Sync Special Rating Items Wrapper Process"");
				
						STCCreateSR.InvokeMethod(""RunProcess"", psInputs, psOutputs);
						IsRec = NextRecord();		
					}	
			}
	}// if(Type == ""PortOut"")
				if(Type == ""PortIn"")
				{
					with(SpecItemBC)
					{
					
						ActivateField(""Inactive Flag"");
						ActivateField(""Phone Number Type"");
						ActivateField(""Special Rating List Id"");
						SetViewMode(AllView);
						ClearToQuery();
						SetSearchSpec(""Phone Number"", SpecItem);
						ExecuteQuery(ForwardOnly);
						var IsRec = FirstRecord();
						while(IsRec)
						{
							SpecRateId = GetFieldValue(""Special Rating List Id"");
							SetFieldValue(""Inactive Flag"", ""Y"");
							SetFieldValue(""Phone Number Type"", ""ONNET"");
							WriteRecord();
							var psInputs = appobj.NewPropertySet();
							var psOutputs = appobj.NewPropertySet();
							var STCCreateSR = appobj.GetService(""Workflow Process Manager"");
							psInputs.SetProperty(""Object Id"", SpecRateId);
							psInputs.SetProperty(""ProcessName"", ""STC SWI Sync Special Rating Items Wrapper Process"");
							STCCreateSR.InvokeMethod(""RunProcess"", psInputs, psOutputs);
							IsRec = NextRecord();		
						}	
					}	
				}
}
catch (e)
{
			LogException(e);
}
finally
{
}
}
"//***********************************************************************************************************//
//Purpose: 1) To Log the exceptions in Custom Error Log Table
//Inputs: Error Message
//Author: Rajitha P G
//Release: R2.0
//Date: 23-Nov-09
//*************************************************************************************************************//
function LogException(e)
{
 var appObj;
   var psInput;
   var psOutput;
   var bsErrorHandler; 
 try
  {
    appObj = TheApplication();
    with(appObj)
    {
     psInput = NewPropertySet();
     psOutput = NewPropertySet();
     bsErrorHandler = GetService(""STC Generic Error Handler"");
    }
    with(psInput)
    {
     SetProperty(""Error Code"", e.errCode);
     SetProperty(""Error Message"", e.errText);
     SetProperty(""Object Name"", ""STC FnF Number Check"");
     SetProperty(""Object Type"", ""Buisness Service"");
    }
    bsErrorHandler.InvokeMethod(""Log Message"", psInput, psOutput);
  }
  catch(e)
  {
    // do nothing 
  }
  finally
  {
 
    bsErrorHandler = null;
    psOutput = null;
    psInput = null;
    appObj = null;
  }
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 var ureturn = """";
 try
 {
  switch (MethodName)
  {
   case ""ValidateFnFNumber"":
    ValidateFnFNumber(Inputs,Outputs);
    ureturn = CancelOperation;
    break;
    
   case ""ValidateFnFNumberNew"":
    ValidateFnFNumberNew(Inputs,Outputs);
    ureturn = CancelOperation;
    break;
    
    
   case ""ValidateFnFPlan"":
    ValidateFnFPlan(Inputs,Outputs);
    ureturn = CancelOperation;
    break;
    
   case ""FnFPortInPortOut"":
    FnFPortInPortOut(Inputs,Outputs);
    ureturn = CancelOperation;
    break;

   default:
    ureturn = ContinueOperation;
  }
  return(ureturn);
 }
 catch(e)
 {
  LogException(e);
 }
 finally
 {
 }
}
"//***********************************************************************************************************//
//Purpose: 1) To Format the Phone Number Entered for Special Rating List
//     2) To Calculate the Type of the Phone Number entered
//Inputs: Phone Number
//Outputs: Formatted Phone Number, Phone Number Type
//Author: Rajitha P G
//Release: R2.0
//Date: 23-Nov-09
//*************************************************************************************************************//
function ValidateFnFNumber(Inputs,Outputs)
{
  var snum;
  var stype = """";
  var l;
  var j;
  var sstr;
  var sonList, soffList;
  var sregex;
  var slstOn,slstOff;
  var appObj;
  var accstat;
  try
  {
   appObj = TheApplication();
   sregex = /^[0+]*([1-9][0-9]*)$/g;
   snum = Inputs.GetProperty(""Num"");
   Outputs.SetProperty(""OutNum"","""");
   Outputs.SetProperty(""Type"","""");
   sstr = snum;
   sstr = sstr.replace(/( )/g,"""")
   sstr = sstr.replace(sregex,""$1"");
   l = sstr.length;
   if (l == 11)
   {
     sstr = sstr.replace(/^973/,"""");
   }
   l = sstr.length;
   if (l == 8)
   {
 /*   with(appObj)
    {
      sonList = InvokeMethod(""LookupValue"",""STC_ONNET_RANGES"",""List"");
      soffList = InvokeMethod(""LookupValue"",""STC_OFFNET_RANGES"",""List"");
    }
     soffList = soffList.replace(/,/g,""|"");
     slstOff = ""^("" + soffList + "")"";
     sonList = sonList.replace(/,/g,""|"");
     slstOn = ""^("" + sonList + "")"";
     */
     snum = ""973""+sstr;
  /*    var CUTSerBC = TheApplication().GetBusObject(""STC Service Account"").GetBusComp(""CUT Service Sub Accounts"");
    with(CUTSerBC)
    {
     SetViewMode(AllView);
     ClearToQuery();
    // SetSearchSpec(""DUNS Number"", snum);
     //SetSearchExpr(""[DUNS Number] = '"" + snum + ""' AND([Account Status] <> 'Inactive' OR [Account Status] <> 'Terminated')"");
     var SearchE = ""[DUNS Number] = '"" + snum + ""' AND [Account Status] <> 'Terminated'""
     SetSearchExpr(SearchE);
     
     ExecuteQuery(ForwardOnly);
     var IsSANRec = FirstRecord();
     if(IsSANRec)
     {
     	
     }*/
var NumMstrBO = TheApplication().GetBusObject(""RMS NM Number Enquiry"");
var NumMstrBC = NumMstrBO.GetBusComp(""RMS NM Number Enquiry For Update"");

with(NumMstrBC)
{	
		ActivateField(""Port Out""); 
		SetViewMode(AllView); 
		ClearToQuery(); 
		SetSearchSpec(""Number String"", snum); 
		ExecuteQuery(); 
		if(FirstRecord()) 
		{
				var portOut = GetFieldValue(""Port Out"");
				if(portOut != ""Y"")
				{
					stype = ""ONNET"";
					Outputs.SetProperty(""OutNum"",""00973""+sstr);	
				}
				else
				{
					stype = ""OFFNET"";
					Outputs.SetProperty(""OutNum"",""00973""+sstr);
				}
		}
		else if(!FirstRecord())
		{
					stype = ""OFFNET"";
					Outputs.SetProperty(""OutNum"",""00973""+sstr);	
		}
}

 /*    if (!IsSANRec)
     {
       stype = ""OFFNET"";
       Outputs.SetProperty(""OutNum"",""00973""+sstr);
     }
     else if (IsSANRec)
     {
       stype = ""ONNET"";
       Outputs.SetProperty(""OutNum"",""00973""+sstr);
     }*/
  //  }
   }
   else if ((l >= 8) && (l <= 13))
   {
     stype = ""INTERNATIONAL"";
     Outputs.SetProperty(""OutNum"",""00""+sstr);
   }
  /* else if ((l > 12) && (l <= 13))
   {
     stype = ""INTERNATIONAL"";
     Outputs.SetProperty(""OutNum"",""00""+sstr);
   }*/
   else
   {
     stype = ""INVALID"";
     Outputs.SetProperty(""OutNum"",snum);
   }
   
   Outputs.SetProperty(""Type"",stype);
  }
  catch(e)
  {
   LogException(e);
  }
  finally
  {
   appObj = null;
  }
}
"//***********************************************************************************************************//
//Purpose: 1) To Format the Phone Number Entered for Special Rating List
//     2) To Calculate the Type of the Phone Number entered
//Inputs: Phone Number
//Outputs: Formatted Phone Number, Phone Number Type
//Author: Suman Kanumuri
//Release: R2.0
//Date: 05-07-2011
//*************************************************************************************************************//
function ValidateFnFNumberNew(Inputs,Outputs)
{
  var snum;
  var stype = """";
  var l;
  var j;
  var sstr;
  var sonList, soffList;
  var sregex;
  var slstOn,slstOff;
  var appObj;
  try
  {
   appObj = TheApplication();
   snum = Inputs.GetProperty(""Num"");
   Outputs.SetProperty(""OutNum"","""");
   Outputs.SetProperty(""Type"","""");
    appObj = TheApplication();
   sregex = /^[0+]*([1-9][0-9]*)$/g;
   snum = Inputs.GetProperty(""Num"");
   Outputs.SetProperty(""OutNum"","""");
   Outputs.SetProperty(""Type"","""");
   sstr = snum;
   sstr = sstr.replace(/( )/g,"""")
   sstr = sstr.replace(sregex,""$1"");
   l = sstr.length;
   if (l == 11)
   {
     sstr = sstr.replace(/^973/,"""");
   }
   l = sstr.length;
   
    if(l == 8)
    {
    var CUTSerBC = TheApplication().GetBusObject(""STC Service Account"").GetBusComp(""CUT Service Sub Accounts"");
    with(CUTSerBC)
    {
     SetViewMode(AllView);
     ClearToQuery();
     SetSearchExpr(""[DUNS Number] = '"" + snum + ""' AND([Account Status] <> 'Inactive' OR [Account Status] <> 'Terminated')"");
     ExecuteQuery(ForwardOnly);
     var IsSANRec = FirstRecord();
     if(IsSANRec)
     {
      stype = ""ONNET"";
      Outputs.SetProperty(""OutNum"",""00973""+snum);
     }
     else
     {
      stype = ""OFFNET"";
      Outputs.SetProperty(""OutNum"",""00973""+snum);
     }
	} 
	}// end of if   
     else if ((l >= 8) && (l <= 13))
   {
     stype = ""INTERNATIONAL"";
     Outputs.SetProperty(""OutNum"",""00""+sstr);
   }
   
   
   Outputs.SetProperty(""Type"",stype);
  }
  catch(e)
  {
   LogException(e);
  }
  finally
  {
   appObj = null;
  }
}
"//***********************************************************************************************************//
//Purpose: 1) To Validate whether the Phone Numbers entered are as per Plan selected or not.
//     This method is called behind the ""Synchronize"" method in Special rating List Applet
//Inputs: The Comma Separated list of all the Active Phone Number Types under the Special rating List and the Plan Type
//Outputs: ValidateFlag(True => if valid combination, False => if invalid combination)
//     Validation Message if the combination is not as per the Plan.
//Author: Rajitha P G
//Release: R2.0
//Date: 23-Nov-09
//*************************************************************************************************************//
function ValidateFnFPlan(Inputs,Outputs)
{
  var sstr="""";
  var i;
  var splanRule = """";
  var splan="""";
  var bflgValid = 0;
  var icntOn = 0;
  var icntOff = 0;
  var icntInt = 0;
  var appObj;
  var sSearchExpr;
  var boLOV;
  var bcLOV;
  try
  {
   appObj = TheApplication();
   with(appObj)
   {
    boLOV = appObj.GetBusObject(""List Of Values"");
    bcLOV = boLOV.GetBusComp(""List Of Values"");
   }
   with(Inputs)
   {
    sstr = GetProperty(""TypeList"");
    splan = GetProperty(""Plan"");
   }
   if (splan != null || splan != """")
   {
    splanRule = TheApplication().InvokeMethod(""LookupValue"",""STC_FNF_PLANS"",splan);
   }
 
 
   var arr = sstr.split("","");
   var arrPlan = splanRule.split("","");
   
   for (i=0; i<arr.length; i++)
   {
    switch (arr[i])
    {
     case ""ONNET"" :
      icntOn++;
      bflgValid = (icntOn <= ToNumber(arrPlan[0]) && bflgValid != 1 ) ? 0 : 1 ;
      break;
     case ""OFFNET"" :
      icntOff++;
      bflgValid = (icntOff <= ToNumber(arrPlan[1]) && bflgValid != 1 ) ? 0 : 1 ;
      break;
     case ""INTERNATIONAL"" :
      icntInt++;
      bflgValid = (icntInt <= ToNumber(arrPlan[2]) && bflgValid != 1) ? 0 : 1 ;
      break;
     default:
      break;
    }
   }
  
   if (bflgValid == 0)
   {
    with(Outputs)
    {
     SetProperty(""ValidateFlag"",""True"");
     SetProperty(""Message"","""");
    }
   }
   else
   {
    with(Outputs)
    {
     SetProperty(""ValidateFlag"",""False"");
     SetProperty(""Message"",""The plan "" + splan + "" should have combination of max "" + arrPlan[0] + "" ONNET numbers and max "" + arrPlan[1] + "" OFFNET numbers and max "" + arrPlan[2] + "" INTERNATIONAL numbers instead of "" + icntOn + "" ONNET numbers and "" + icntOff + "" OFFNET numbers and "" + icntInt + "" INTERNATIONAL numbers."");
    }
   }
 }
 catch(e)
 {
  LogException(e);
 }
 finally
 {
  bcLOV = null;
  boLOV = null;
  appObj = null;
 }
}
"//***********************************************************************************************************//
//Purpose: 1) To Log the exceptions in Custom Error Log Table
//Inputs: Error Message
//Author: Rajitha P G
//Release: R2.0
//Date: 23-Nov-09
//*************************************************************************************************************//
function LogException(e)
{
 var appObj;
   var psInput;
   var psOutput;
   var bsErrorHandler; 
 try
  {
    appObj = TheApplication();
    with(appObj)
    {
     psInput = NewPropertySet();
     psOutput = NewPropertySet();
     bsErrorHandler = GetService(""STC Generic Error Handler"");
    }
    with(psInput)
    {
     SetProperty(""Error Code"", e.errCode);
     SetProperty(""Error Message"", e.errText);
     SetProperty(""Object Name"", ""STC FnF Number Check"");
     SetProperty(""Object Type"", ""Buisness Service"");
    }
    bsErrorHandler.InvokeMethod(""Log Message"", psInput, psOutput);
  }
  catch(e)
  {
    // do nothing 
  }
  finally
  {
 
    bsErrorHandler = null;
    psOutput = null;
    psInput = null;
    appObj = null;
  }
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 var ureturn = """";
 try
 {
  switch (MethodName)
  {
   case ""ValidateFnFNumber"":
    ValidateFnFNumber(Inputs,Outputs);
    ureturn = CancelOperation;
    break;
    
   case ""ValidateFnFNumberNew"":
    ValidateFnFNumberNew(Inputs,Outputs);
    ureturn = CancelOperation;
    break;
    
    
   case ""ValidateFnFPlan"":
    ValidateFnFPlan(Inputs,Outputs);
    ureturn = CancelOperation;
    break;
   default:
    ureturn = ContinueOperation;
  }
  return(ureturn);
 }
 catch(e)
 {
  LogException(e);
 }
 finally
 {
 }
}
"//***********************************************************************************************************//
//Purpose: 1) To Format the Phone Number Entered for Special Rating List
//     2) To Calculate the Type of the Phone Number entered
//Inputs: Phone Number
//Outputs: Formatted Phone Number, Phone Number Type
//Author: Rajitha P G
//Release: R2.0
//Date: 23-Nov-09
//*************************************************************************************************************//
function ValidateFnFNumber(Inputs,Outputs)
{
  var snum;
  var stype = """";
  var l;
  var j;
  var sstr;
  var sonList, soffList;
  var sregex;
  var slstOn,slstOff;
  var appObj;
  var accstat;
  try
  {
   appObj = TheApplication();
   sregex = /^[0+]*([1-9][0-9]*)$/g;
   snum = Inputs.GetProperty(""Num"");
   Outputs.SetProperty(""OutNum"","""");
   Outputs.SetProperty(""Type"","""");
   sstr = snum;
   sstr = sstr.replace(/( )/g,"""")
   sstr = sstr.replace(sregex,""$1"");
   l = sstr.length;
   if (l == 11)
   {
     sstr = sstr.replace(/^973/,"""");
   }
   l = sstr.length;
   if (l == 8)
   {
 /*   with(appObj)
    {
      sonList = InvokeMethod(""LookupValue"",""STC_ONNET_RANGES"",""List"");
      soffList = InvokeMethod(""LookupValue"",""STC_OFFNET_RANGES"",""List"");
    }
     soffList = soffList.replace(/,/g,""|"");
     slstOff = ""^("" + soffList + "")"";
     sonList = sonList.replace(/,/g,""|"");
     slstOn = ""^("" + sonList + "")"";
     */
     snum = ""973""+sstr;
  /*    var CUTSerBC = TheApplication().GetBusObject(""STC Service Account"").GetBusComp(""CUT Service Sub Accounts"");
    with(CUTSerBC)
    {
     SetViewMode(AllView);
     ClearToQuery();
    // SetSearchSpec(""DUNS Number"", snum);
     //SetSearchExpr(""[DUNS Number] = '"" + snum + ""' AND([Account Status] <> 'Inactive' OR [Account Status] <> 'Terminated')"");
     var SearchE = ""[DUNS Number] = '"" + snum + ""' AND [Account Status] <> 'Terminated'""
     SetSearchExpr(SearchE);
     
     ExecuteQuery(ForwardOnly);
     var IsSANRec = FirstRecord();
     if(IsSANRec)
     {
      
     }*/
var NumMstrBO = TheApplication().GetBusObject(""RMS NM Number Enquiry"");
var NumMstrBC = NumMstrBO.GetBusComp(""RMS NM Number Enquiry For Update"");

with(NumMstrBC)
{ 
  ActivateField(""Port Out""); 
  SetViewMode(AllView); 
  ClearToQuery(); 
  SetSearchSpec(""Number String"", snum); 
  ExecuteQuery(); 
  if(FirstRecord()) 
  {
    var portOut = GetFieldValue(""Port Out"");
    if(portOut != ""Y"")
    {
     stype = ""ONNET"";
     Outputs.SetProperty(""OutNum"",""00973""+sstr); 
    }
    else
    {
     stype = ""OFFNET"";
     Outputs.SetProperty(""OutNum"",""00973""+sstr);
    }
  }
  else if(!FirstRecord())
  {
     stype = ""OFFNET"";
     Outputs.SetProperty(""OutNum"",""00973""+sstr); 
  }
}

 /*    if (!IsSANRec)
     {
       stype = ""OFFNET"";
       Outputs.SetProperty(""OutNum"",""00973""+sstr);
     }
     else if (IsSANRec)
     {
       stype = ""ONNET"";
       Outputs.SetProperty(""OutNum"",""00973""+sstr);
     }*/
  //  }
   }
   else if ((l >= 8) && (l <= 13))
   {
     stype = ""INTERNATIONAL"";
     Outputs.SetProperty(""OutNum"",""00""+sstr);
   }
  /* else if ((l > 12) && (l <= 13))
   {
     stype = ""INTERNATIONAL"";
     Outputs.SetProperty(""OutNum"",""00""+sstr);
   }*/
   else
   {
     stype = ""INVALID"";
     Outputs.SetProperty(""OutNum"",snum);
   }
   
   Outputs.SetProperty(""Type"",stype);
  }
  catch(e)
  {
   LogException(e);
  }
  finally
  {
   appObj = null;
  }
}
"//***********************************************************************************************************//
//Purpose: 1) To Format the Phone Number Entered for Special Rating List
//     2) To Calculate the Type of the Phone Number entered
//Inputs: Phone Number
//Outputs: Formatted Phone Number, Phone Number Type
//Author: Rajitha P G
//Release: R2.0
//Date: 23-Nov-09
//*************************************************************************************************************//
function ValidateFnFNumberNew(Inputs,Outputs)
{
  var snum;
  var stype = """";
  var l;
  var j;
  var sstr;
  var sonList, soffList;
  var sregex;
  var slstOn,slstOff;
  var appObj;
  var accstat;
  try
  {
   appObj = TheApplication();
   sregex = /^[0+]*([1-9][0-9]*)$/g;
   snum = Inputs.GetProperty(""Num"");
   Outputs.SetProperty(""OutNum"","""");
   Outputs.SetProperty(""Type"","""");
   sstr = snum;
   sstr = sstr.replace(/( )/g,"""")
   sstr = sstr.replace(sregex,""$1"");
   l = sstr.length;
   if (l == 11)
   {
     sstr = sstr.replace(/^973/,"""");
   }
   l = sstr.length;
   if (l == 8)
   {
 /*   with(appObj)
    {
      sonList = InvokeMethod(""LookupValue"",""STC_ONNET_RANGES"",""List"");
      soffList = InvokeMethod(""LookupValue"",""STC_OFFNET_RANGES"",""List"");
    }
     soffList = soffList.replace(/,/g,""|"");
     slstOff = ""^("" + soffList + "")"";
     sonList = sonList.replace(/,/g,""|"");
     slstOn = ""^("" + sonList + "")"";
     */
     snum = ""973""+sstr;
  /*    var CUTSerBC = TheApplication().GetBusObject(""STC Service Account"").GetBusComp(""CUT Service Sub Accounts"");
    with(CUTSerBC)
    {
     SetViewMode(AllView);
     ClearToQuery();
    // SetSearchSpec(""DUNS Number"", snum);
     //SetSearchExpr(""[DUNS Number] = '"" + snum + ""' AND([Account Status] <> 'Inactive' OR [Account Status] <> 'Terminated')"");
     var SearchE = ""[DUNS Number] = '"" + snum + ""' AND [Account Status] <> 'Terminated'""
     SetSearchExpr(SearchE);
     
     ExecuteQuery(ForwardOnly);
     var IsSANRec = FirstRecord();
     if(IsSANRec)
     {
      
     }*/
var NumMstrBO = TheApplication().GetBusObject(""RMS NM Number Enquiry"");
var NumMstrBC = NumMstrBO.GetBusComp(""RMS NM Number Enquiry For Update"");

with(NumMstrBC)
{ 
  ActivateField(""Port Out""); 
  SetViewMode(AllView); 
  ClearToQuery(); 
  SetSearchSpec(""Number String"", snum); 
  ExecuteQuery(); 
  if(FirstRecord()) 
  {
    var portOut = GetFieldValue(""Port Out"");
    if(portOut != ""Y"")
    {
     stype = ""ONNET"";
     Outputs.SetProperty(""OutNum"",""00973""+sstr); 
    }
    else
    {
     stype = ""OFFNET"";
     Outputs.SetProperty(""OutNum"",""00973""+sstr);
    }
  }
  else if(!FirstRecord())
  {
     stype = ""OFFNET"";
     Outputs.SetProperty(""OutNum"",""00973""+sstr); 
  }
}

 /*    if (!IsSANRec)
     {
       stype = ""OFFNET"";
       Outputs.SetProperty(""OutNum"",""00973""+sstr);
     }
     else if (IsSANRec)
     {
       stype = ""ONNET"";
       Outputs.SetProperty(""OutNum"",""00973""+sstr);
     }*/
  //  }
   }
   else if ((l >= 8) && (l <= 13))
   {
     stype = ""INTERNATIONAL"";
     Outputs.SetProperty(""OutNum"",""00""+sstr);
   }
  /* else if ((l > 12) && (l <= 13))
   {
     stype = ""INTERNATIONAL"";
     Outputs.SetProperty(""OutNum"",""00""+sstr);
   }*/
   else
   {
     stype = ""INVALID"";
     Outputs.SetProperty(""OutNum"",snum);
   }
   
   Outputs.SetProperty(""Type"",stype);
  }
  catch(e)
  {
   LogException(e);
  }
  finally
  {
   appObj = null;
  }
}
"//***********************************************************************************************************//
//Purpose: 1) To Validate whether the Phone Numbers entered are as per Plan selected or not.
//     This method is called behind the ""Synchronize"" method in Special rating List Applet
//Inputs: The Comma Separated list of all the Active Phone Number Types under the Special rating List and the Plan Type
//Outputs: ValidateFlag(True => if valid combination, False => if invalid combination)
//     Validation Message if the combination is not as per the Plan.
//Author: Rajitha P G
//Release: R2.0
//Date: 23-Nov-09
//*************************************************************************************************************//
function ValidateFnFPlan(Inputs,Outputs)
{
  var sstr="""";
  var i;
  var splanRule = """";
  var splan="""";
  var bflgValid = 0;
  var icntOn = 0;
  var icntOff = 0;
  var icntInt = 0;
  var appObj;
  var sSearchExpr;
  var boLOV;
  var bcLOV;
  try
  {
   appObj = TheApplication();
   with(appObj)
   {
    boLOV = appObj.GetBusObject(""List Of Values"");
    bcLOV = boLOV.GetBusComp(""List Of Values"");
   }
   with(Inputs)
   {
    sstr = GetProperty(""TypeList"");
    splan = GetProperty(""Plan"");
   }
   if (splan != null || splan != """")
   {
    splanRule = TheApplication().InvokeMethod(""LookupValue"",""STC_FNF_PLANS"",splan);
   }
 
 
   var arr = sstr.split("","");
   var arrPlan = splanRule.split("","");
   
   for (i=0; i<arr.length; i++)
   {
    switch (arr[i])
    {
     case ""ONNET"" :
      icntOn++;
      bflgValid = (icntOn <= ToNumber(arrPlan[0]) && bflgValid != 1 ) ? 0 : 1 ;
      break;
     case ""OFFNET"" :
      icntOff++;
      bflgValid = (icntOff <= ToNumber(arrPlan[1]) && bflgValid != 1 ) ? 0 : 1 ;
      break;
     case ""INTERNATIONAL"" :
      icntInt++;
      bflgValid = (icntInt <= ToNumber(arrPlan[2]) && bflgValid != 1) ? 0 : 1 ;
      break;
     default:
      break;
    }
   }
  
   if (bflgValid == 0)
   {
    with(Outputs)
    {
     SetProperty(""ValidateFlag"",""True"");
     SetProperty(""Message"","""");
    }
   }
   else
   {
    with(Outputs)
    {
     SetProperty(""ValidateFlag"",""False"");
     SetProperty(""Message"",""The plan "" + splan + "" should have combination of max "" + arrPlan[0] + "" ONNET numbers and max "" + arrPlan[1] + "" OFFNET numbers and max "" + arrPlan[2] + "" INTERNATIONAL numbers instead of "" + icntOn + "" ONNET numbers and "" + icntOff + "" OFFNET numbers and "" + icntInt + "" INTERNATIONAL numbers."");
    }
   }
 }
 catch(e)
 {
  LogException(e);
 }
 finally
 {
  bcLOV = null;
  boLOV = null;
  appObj = null;
 }
}
function FormatAppointmentBookingResponse(Inputs,Outputs)
{

var vActivityId='', vServiceRegionId='', vABSReqId='', vSlotStart ='';
var vBS ='', vBSInput ='', vBSOutput ='',vapptBookInputs ='', vServerName ='';

 try
 {
 
  vABSReqId = Inputs.GetProperty(""ABSReqId"");
  vActivityId = Inputs.GetProperty(""ActivityId"");
  vServiceRegionId = Inputs.GetProperty(""ServiceRegionId"");
  vSlotStart = Inputs.GetProperty(""StartSlot"");
  vServerName = Inputs.GetProperty(""ServerName"");
  
  if (vABSReqId != """" && vActivityId != """" && vServiceRegionId != """" && vSlotStart != """" && vServerName != """")
  {
  
      vBSInput = TheApplication().NewPropertySet();
      vBSOutput = TheApplication().NewPropertySet();
      vapptBookInputs = TheApplication().NewPropertySet();
      
      vBS = TheApplication().GetService(""Server Requests"");
           
   vBSInput.SetProperty(""Mode"", ""Sync"");
   vBSInput.SetProperty(""Method"", ""ConfirmAppointment"");
   vBSInput.SetProperty(""Component"", ""ApptBook"");
   vBSInput.SetProperty(""ReqKey"", vServiceRegionId);
   vBSInput.SetProperty(""ServerName"", vServerName);
      
   vapptBookInputs.SetProperty(""ActId"", vActivityId);
   vapptBookInputs.SetProperty(""SvcRegnId"", vServiceRegionId);
   vapptBookInputs.SetProperty(""ReqId"", vABSReqId);
   vapptBookInputs.SetProperty(""SlotStart"",vSlotStart);
   
   vBSInput.AddChild(vapptBookInputs);
   
   vBS.InvokeMethod(""SubmitRequest"", vBSInput, vBSOutput);
   
   Outputs.SetProperty(""ErrorCode"",vBSOutput.GetChild(0).GetProperty(""ErrCode""));
            Outputs.SetProperty(""ErrorMessage"",vBSOutput.GetChild(0).GetProperty(""Message""));
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
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	var sReturn = ContinueOperation;

   try
   {
   
		switch(MethodName)
		{		
			case ""FormatAppointmentBookingResponse"":
			      FormatAppointmentBookingResponse(Inputs,Outputs);
				  return (CancelOperation);
				  break;
				  
			default:
				  return (CancelOperation)
				  break;
		}		
	return (ContinueOperation);
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
	
	}
}
function FormatAppointmentCancelResponse(Inputs,Outputs)
{

var vActivityId='', vServiceRegionId='', vABSReqId='', vSlotStart ='';
var vBS ='', vBSInput ='', vBSOutput ='',vapptBookInputs ='', vServerName ='';

 try
 {
 
  vABSReqId = Inputs.GetProperty(""ABSReqId"");
  vServiceRegionId = Inputs.GetProperty(""ServiceRegionId"");
  
  if (vABSReqId != """" &&  vServiceRegionId != """")
  {
  
      vBSInput = TheApplication().NewPropertySet();
      vBSOutput = TheApplication().NewPropertySet();
      vapptBookInputs = TheApplication().NewPropertySet();
      
      vBS = TheApplication().GetService(""Server Requests"");
           
   vBSInput.SetProperty(""Mode"", ""Sync"");
   vBSInput.SetProperty(""Method"", ""CancelRequest"");
   vBSInput.SetProperty(""Component"", ""ApptBook"");
      
   vapptBookInputs.SetProperty(""SvcRegnId"", vServiceRegionId);
   vapptBookInputs.SetProperty(""ReqId"", vABSReqId);

   
   vBSInput.AddChild(vapptBookInputs);
   
   vBS.InvokeMethod(""SubmitRequest"", vBSInput, vBSOutput);
   
   Outputs.SetProperty(""ErrorCode"",vBSOutput.GetChild(0).GetProperty(""ErrCode""));
            Outputs.SetProperty(""ErrorMessage"",vBSOutput.GetChild(0).GetProperty(""Message""));
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
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 var sReturn = ContinueOperation;

   try
   {
   
  switch(MethodName)
  {  
   case ""FormatAppointmentCancelResponse"":
         FormatAppointmentCancelResponse(Inputs,Outputs);
      return (CancelOperation);
      break;
      
   default:
      return (CancelOperation)
      break;
  }  
 return (ContinueOperation);
 }
 catch(e)
 {
  throw(e);
 }
 finally
 {
 
 }
}
"var Result ='';
var xmlDoc ='';"
function FormatGetAppSlotResponse(Inputs,Outputs)
{

var vServiceRegionId='', vActivityId='',psListAppointments='',psAppointments='',psTempAppointments='',vReqId ='';
var i = 0;
var SRMSvc='',vXMLApp='',srmInputs='', apptBookInputs='', srmOutputs='';
var childPropSet='', activePropSet='', apptPropSet='',errCode='', vServerName='';

	try
	{
	
		vActivityId = Inputs.GetProperty(""ActivityId"");
		vServiceRegionId = Inputs.GetProperty(""ServiceRegionId"");
		vServerName = Inputs.GetProperty(""ServerName"");
		var vXMLHier = Inputs.GetChild(0);
		
		Result = TheApplication().NewPropertySet();
		psTempAppointments = TheApplication().NewPropertySet();
		psAppointments = TheApplication().NewPropertySet();
		psListAppointments = TheApplication().NewPropertySet();
		psListAppointments.SetType(""ListOfSTC Abs Result IO"");
		Result.SetType(""SiebelMessage"");
		
		if (vActivityId != """" && vServiceRegionId != """" && vServerName != """")
		{
				
			SRMSvc = TheApplication().GetService(""Server Requests"");

			srmInputs = TheApplication().NewPropertySet();
			apptBookInputs = TheApplication().NewPropertySet();
			srmOutputs = TheApplication().NewPropertySet();
			vXMLApp = TheApplication().NewPropertySet();
			
			srmInputs.SetProperty(""Mode"", ""Sync"");
			srmInputs.SetProperty(""Method"", ""GetAppointment"");
			srmInputs.SetProperty(""Component"", ""ApptBook"");
			srmInputs.SetProperty(""ServerName"", vServerName);
			
			apptBookInputs.SetProperty(""ActId"", vActivityId);
			apptBookInputs.SetProperty(""SvcRegnId"", vServiceRegionId);
			srmInputs.AddChild(apptBookInputs);
			
			SRMSvc.InvokeMethod(""SubmitRequest"", srmInputs, srmOutputs);
			
			// output
			childPropSet = TheApplication().NewPropertySet();
			activePropSet = TheApplication().NewPropertySet();
			
			childPropSet = srmOutputs.GetChild(0);
			
			Outputs.SetProperty(""ErrorCode"",childPropSet.GetProperty(""ErrCode""));
			Outputs.SetProperty(""ErrorMessage"",childPropSet.GetProperty(""Message""));
			
			errCode = childPropSet.GetProperty(""ErrCode"");
			
			if (errCode == ""0"")
			{
					var apptCount = childPropSet.GetChildCount();
					apptPropSet = TheApplication().NewPropertySet();
					for (i = 0; i < apptCount; i++)
					{
						activePropSet = childPropSet.GetChild(i);
						psAppointments.SetType(""Abs Result"");
	
						vReqId = activePropSet.GetProperty(""ReqId"");
					
						psAppointments.SetProperty(""SlotStart"",activePropSet.GetProperty(""PlannedStartSRTimeZone""));
					    psAppointments.SetProperty(""SlotEnd"",activePropSet.GetProperty(""PlannedEndSRTimeZone""));
					    psAppointments.SetProperty(""ActualSlotStart"",activePropSet.GetProperty(""SlotStartSRTimeZone""));
					    psAppointments.SetProperty(""ActualSlotEnd"",activePropSet.GetProperty(""SlotEndSRTimeZone""));
					
						psTempAppointments = psAppointments.Copy();
						psAppointments.Reset();
						psListAppointments.AddChild(psTempAppointments);

					}
					
					 vXMLApp = vXMLHier.GetChild(0).GetChild(0);
					 
					 if (vXMLApp.GetProperty(""ABSReqId"")== """")
  					     vXMLApp.SetProperty(""ABSReqId"",vReqId);
  					     
					 if (vXMLApp.GetChild(0).GetType()== ""ListOfAppointmentSlot"")
                         vXMLApp.RemoveChild(0);
					 
					 vXMLApp.AddChild(psListAppointments);
					 
					 Result = vXMLHier.Copy();
				
			}
			else
			{
					Result = vXMLHier.Copy(); // in case of failure it sends input as output	
			}

			
		}
			
	}
	catch(e)
	{
	// if it goes in catch then below code will free the availble slots
	  srmInputs.SetProperty(""Method"", ""CancelRequest"");
	  apptBookInputs.RemoveProperty(""ActId"");
	  apptBookInputs.SetProperty(""ReqId"", vReqId);
	  SRMSvc.InvokeMethod(""SubmitRequest"", srmInputs, srmOutputs);	
	  throw(e.toString);
	}
	finally
	{
	
	  
	  
	}

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	var sReturn = ContinueOperation;

   try
   {
   
		switch(MethodName)
		{		
			case ""FormatGetAppSlotResponse"":
				FormatGetAppSlotResponse(Inputs,Outputs);
				Outputs.AddChild(Result.Copy());
					
				return (CancelOperation);
				break;
			default:
				return (CancelOperation)
				break;
		}		
	return (ContinueOperation);
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
	
	}
}
"var Result ='';
var xmlDoc ='';"
function FormatCreateAppointmentResponse(Inputs,Outputs)
{

var vActivityPlanId='', vAccountId='', vBS='';
var psAppointmentsList='', psAppointments ='',psTempAppointments='';
var vBOAction ='', vBCAction ='',i = 0,bRecordFound ='',vXMLApp='',vError ='1';

	try
	{
	
		vAccountId = Inputs.GetProperty(""AccountId"");
		vActivityPlanId = Inputs.GetProperty(""Activity Plan Id"");
		var vXMLHier = Inputs.GetChild(0); 
		
		Result = TheApplication().NewPropertySet();
		Result.SetType(""SiebelMessage"");	 
		
		if (vAccountId != """" && vActivityPlanId != """")
		{
		
			psAppointmentsList = TheApplication().NewPropertySet();
			psAppointments = TheApplication().NewPropertySet();
			psTempAppointments = TheApplication().NewPropertySet();
		    
			vBOAction = TheApplication().GetBusObject(""Action""); 
			vBCAction = vBOAction.GetBusComp(""Action""); // can't use thin integration BCs as searchspec is different on them
						
			with(vBCAction)
			{
				ClearToQuery(); 
				ActivateField(""Sub Type""); 
				ActivateField(""Work Time Min"");
				ActivateField(""No Sooner Than Date"");
				ActivateField(""Due"");
				SetViewMode(AllView); 
				SetSearchExpr(""[Parent Activity Id] = '""+ vActivityPlanId + ""'"" + "" AND [Account Id] = '""+ vAccountId +""'"");
				ExecuteQuery(ForwardOnly); 
				bRecordFound = FirstRecord();
					
				while(bRecordFound)
				{
					psAppointments.SetType(""Appointment"");
					psAppointments.SetProperty(""ActivityId"",GetFieldValue(""Id""));		
					psAppointments.SetProperty(""AppointmentType"",GetFieldValue(""Sub Type""));		
					psAppointments.SetProperty(""Duration"",GetFieldValue(""Work Time Min""));		
					psAppointments.SetProperty(""EarliestStartDate"",GetFieldValue(""No Sooner Than Date""));
					psAppointments.SetProperty(""LatestStartDate"",GetFieldValue(""Due""));
					
					psTempAppointments = psAppointments.Copy();
					psAppointmentsList.AddChild(psTempAppointments);
					
					bRecordFound = NextRecord();
					psAppointments.Reset();
					vError = '0';
				
				}
    		}
				

			
			if(vError == ""0"")
			{
			    vXMLApp = vXMLHier.GetChild(0).GetChild(0);
		
		    	if (vXMLApp.GetChild(0).GetType() == ""ListOfAppointment"")
		    	{
		    		vXMLApp.RemoveChild(0);
		    		psAppointmentsList.SetType(""ListOfAppointment"");
		    		vXMLApp.AddChild(psAppointmentsList);
		    	}	
		    	
		    	Outputs.SetProperty(""ErrorCode"",""SUCCESS"");
   	    	    Outputs.SetProperty(""ErrorMessage"","""");
		        Result = vXMLHier.Copy();
    		
   		    }
   		    else
   		    {
   		        Outputs.SetProperty(""ErrorCode"",""FAILURE"");
   	    	    Outputs.SetProperty(""ErrorMessage"",""No Appointments Created"");
		        Result = vXMLHier.Copy(); // in case of any failure, input will be output
   		    }
  			
			
		}
			
	}
	catch(e)
	{
	  throw(e);
	}
	finally
	{
	
	  vBCAction = null;
	  vBOAction = null;
	}

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	var sReturn = ContinueOperation;

   try
   {
   
		switch(MethodName)
		{		
			case ""FormatCreateAppointmentResponse"":
				FormatCreateAppointmentResponse(Inputs,Outputs);
				Outputs.AddChild(Result.Copy());
			
				
				return (CancelOperation);
				break;
			default:
				return (CancelOperation)
				break;
		}		
	return (ContinueOperation);
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
	
	}
}
var glbServiceName;
function IndentPropertySet(Inputs , Outputs)
{
 var newInputs;
 newInputs = Inputs.Copy();
 newInputs.SetType('IndentedSiebelMessage');
 Outputs.AddChild(newInputs);
}
function PopulateInstance(Inputs,Outputs)
{
 try
 {
         var appObj;
   var bsCOIS; 
   var propInputs;
   var propOutputs;
   var nodTemp;    
            var nodItem;
            var nChildCount;
   var nodChild;
   var ChildNode;
   var propRPInputs;
   var propRPOutputs;
   var sRootPath;
   var strChildProductName;//[TK][18-04-07][40173]   
   
   appObj = TheApplication();
   glbServiceName = Inputs.GetProperty(""ObjectInstanceServiceName"");
   bsCOIS = appObj.GetService(glbServiceName);   
      propInputs = null;
   propOutputs = null;      
      propInputs = appObj.NewPropertySet();
   propOutputs = appObj.NewPropertySet();
   nodTemp = null;
   nodTemp = Inputs.GetChild(0);
   propRPInputs = null;
   propRPOutputs = null;   
   nodItem = null;
   while(nodTemp.GetType() != ""ListOfLineItem"") //While the node type is not sListOfItemNodeName
   {   
    nodTemp = nodTemp.GetChild(0);  
   }
   propRPInputs = appObj.NewPropertySet();
   propRPOutputs = appObj.NewPropertySet();
   with(propRPInputs)
   {
    SetProperty(""ObjId"",Inputs.GetProperty(""ObjId""));    
    SetProperty(""RootId"",Inputs.GetProperty(""RootPathId""));
   }   
   bsCOIS.InvokeMethod(""GetRootPath"",propRPInputs, propRPOutputs); 
   sRootPath = propRPOutputs.GetProperty(""Path"");

   propRPOutputs = null;
   propRPInputs = null;
   bsCOIS = null;
 }
 catch(e)
 {
      throw(e);
  }
  finally
  {}
}
function ResolvePath(Inputs , Outputs)
{
  var oURLinkValue;
var XAName = """";
 var psLineItemObj = TheApplication().NewPropertySet();
 var returnOutput = TheApplication().NewPropertySet();
 var psOrderObj = TheApplication().NewPropertySet();
var psLineItemXA = TheApplication().NewPropertySet();
 var oURLinkValue = """";var  OSXAId = """";
      var ProdName = Inputs.GetProperty(""ProdName"");
      XAName = Inputs.GetProperty(""XAName"");   
      for (var k = 0; k < Inputs.GetChildCount(); k++)//Loop thru all childs including all process properties
    {
    if (Inputs.GetChild(k).GetType() == ""SiebelMessage"")//Load
    {   

    psOrderObj = Inputs.GetChild(k).GetChild(0).GetChild(0);
	var j = psOrderObj.GetChild(0).GetChild(0).GetChildCount();
   for (var i = 0; i < psOrderObj.GetChild(0).GetChild(0).GetChildCount(); i++)//Loop thru all childs including all process properties
   {
   psLineItemObj = psOrderObj.GetChild(0).GetChild(0).GetChild(i);
   var LineItemName = psLineItemObj.GetProperty(""Name"");
   if(LineItemName == ""VIVA Business One Extension Service Plan"" || LineItemName == ""VIVA E-Business One Extension Service Plan"")
   //VIVA E-Business One Extension Service Plan
   {
   var BundleCount = psLineItemObj.GetChildCount();
   for (var n = 0; n < BundleCount; n++){
if (psLineItemObj.GetChild(n).GetProperty(""Name"") == ProdName )
{
oURLinkValue = psLineItemObj.GetChild(n).GetProperty(""Integration Id"");
break;
}

   }

   }
     }
   
    }
   }
  
//   return(oURLinkValue);
      returnOutput.SetProperty(""oURLinkValue"",oURLinkValue);
       
returnOutput.SetProperty(""OSXAId"",OSXAId);

      
 return(returnOutput);


 
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 if(MethodName ==""IndentPropertySet"")
 {
  IndentPropertySet(Inputs,Outputs);
  return(CancelOperation);
 }
  if(MethodName ==""PopulateInstance"")
 {
  PopulateInstance(Inputs,Outputs);
  return(CancelOperation);
 }
  if(MethodName == ""UnresolveLinks"")
 {
  UnresolveLinks(Inputs,Outputs);
  return(CancelOperation);
 }
 if(MethodName == ""ResolvePath"")
 {

var PathInfo = TheApplication().NewPropertySet();
PathInfo = ResolvePath(Inputs,Outputs);
 Outputs.SetProperty(""ParentPath"",PathInfo.GetProperty(""oURLinkValue""));
Outputs.SetProperty(""OSXAId"",PathInfo.GetProperty(""OSXAId""));
  return(CancelOperation);
 }
  return (ContinueOperation);
}
function UnresolveLinks(Inputs , Outputs)
{
 // check for Unresolved linked item type and copy the child to the 
  var psLinksparent = TheApplication().NewPropertySet(); //Links
 psLinksparent.SetType(""Links""); var oURLinkValue;
var psLineItemObj = TheApplication().NewPropertySet();
var psOrderObj = TheApplication().NewPropertySet();
var oURLinkValue = """";

   for (var i = 0; i < Inputs.GetChildCount(); i++)//Loop thru all childs including all process properties
   {
    if (Inputs.GetChild(i).GetType() == ""UnresolvedLinks"")//find all unresolvedLinks Parent Child
    {
     for (var j = 0; j < Inputs.GetChild(i).GetChildCount(); j++)//i=UnresolvedLinks; and find count of all unresolvedLinks;j =UnresolvedLink
     {      
      var oURLinkId = Inputs.GetChild(i).GetChild(j).GetProperty(""ID"");//Fetch ID from unresolved link
      var oURLinkField = Inputs.GetChild(i).GetChild(j).GetProperty(""Field"");//Fetch ID from unresolved link
      
      //---------------Search Field Value in instance
      
      
            
      for (var k = 0; k < Inputs.GetChildCount(); k++)//Loop thru all childs including all process properties
    {
    if (Inputs.GetChild(k).GetType() == ""SiebelMessageLoad"")//Load
    {   
    psOrderObj = Inputs.GetChild(k).GetChild(0).GetChild(0);
  if(psOrderObj.GetProperty(oURLinkField) == """")//if property not found/NULL
   {
 
   psLineItemObj = psOrderObj.GetChild(0).GetChild(0);
   if(psLineItemObj.GetProperty(oURLinkField) != """" ){//if property found/Not null
   oURLinkValue = psLineItemObj.GetProperty(oURLinkField);
   }
   else//Null
   {
   oURLinkValue = """";
   break;
      
   }
 
   }
   else{
   
   oURLinkValue = psOrderObj.GetProperty(oURLinkField);//if property found
   
    }
    }
   }
      
      
      
      
      //----------------Search Field Value in instance
   psLinksparent.SetProperty(oURLinkId, oURLinkValue);//Set Link Id
   
     }
     //oInp.AddChild(Inputs.GetChild(0).Copy());
  Outputs.AddChild(psLinksparent);//add to Outputs wrapper
    }
   }
 
}
"//Your public declarations go here...  
"
function CreateLineItems(vMenaReqId, vMenaCustType, RecArrMulti, RecCount, vFileName)
{//[NAVIN:13Mar2018:MENACustomerMigration_Header]

var MenaHeaderBO=null, MenaHeaderBC=null, MenaDataBC=null, MenaProdBC=null;
var vPendingStatus=""Pending"", vInProgStatus=""In Progress"", vImportedStatus=""Imported"", vInactiveStatus=""INACTIVE"";
var psFields = TheApplication().NewPropertySet();
var RecDataArr = new Array();
var i=0, RecDataArrLen=0, vReqType="""", vDuplicateFlag=""FALSE"", vDataRecId="""";

try
{
	MenaHeaderBO = TheApplication().GetBusObject(""STC MENA Request Header BO"");
	with(MenaHeaderBO)
	{	
		MenaHeaderBC = GetBusComp(""STC MENA Request Header BC"");
		MenaDataBC = GetBusComp(""STC MENA Individual Data BC"");
		MenaProdBC = GetBusComp(""STC MENA Product Data BC"");
	}
	with(MenaHeaderBC)
	{
		SetViewMode(AllView);
		ClearToQuery();
		ActivateField(""Status"");
		ActivateField(""Sub-Status"");
		ActivateField(""Request Id"");
		ActivateField(""Description"");
		ActivateField(""Request Type"");
		
		SetSearchSpec(""Request Id"", vMenaReqId);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			vReqType = GetFieldValue(""Request Type"");
			
			with(MenaDataBC)
			{
				//SetViewMode(AllView);
				//ClearToQuery();
				while(i < RecCount)
				{
					RecDataArr = RecArrMulti[i];
					RecDataArrLen = RecDataArr.length;
					if(RecDataArrLen > 0)
					{
						with(psFields)
						{
							SetProperty(""Parent Request Id"", vMenaReqId);
							
							//Check for Duplicate MSISDN and make new record INACTIVE
							//vDuplicateFlag = CheckDuplicateMSISDN(vMenaReqId, RecDataArr[29], vMenaCustType);
							if(vDuplicateFlag == ""TRUE"")
							{
								SetProperty(""Status"", vInactiveStatus);
							}
							else{
								SetProperty(""Status"", vInProgStatus);
							}

							SetProperty(""Sub-Status"", vImportedStatus);
							SetProperty(""Request Type"", vReqType);
							
							SetProperty(""Customer Type"", RecDataArr[0]);
							SetProperty(""Customer Class"", RecDataArr[1]);
							SetProperty(""Segment"", RecDataArr[2]);
							SetProperty(""Occupation"", RecDataArr[3]);
							SetProperty(""First Name"", RecDataArr[4]);
							SetProperty(""Middle Name"", RecDataArr[5]);
							SetProperty(""Last Name"", RecDataArr[6]);
							SetProperty(""MENA Account Number"", RecDataArr[7]);
							SetProperty(""MENA Service Number"", RecDataArr[8]);
							SetProperty(""ID Type"", RecDataArr[9]);
							SetProperty(""ID Number"", RecDataArr[10]);
							SetProperty(""ID Expiry Date"", RecDataArr[11]);
							SetProperty(""GCC Country Code"", RecDataArr[12]);
							SetProperty(""Age On Network"", RecDataArr[13]);
							SetProperty(""Gender"", RecDataArr[14]);
							SetProperty(""Nationality"", RecDataArr[15]);
							SetProperty(""Birth Date"", RecDataArr[16]);
							SetProperty(""Alternate Phone #"", RecDataArr[17]);
							SetProperty(""Email Address"", RecDataArr[18]);
							SetProperty(""Flat Number"", RecDataArr[19]);
							SetProperty(""Building Number"", RecDataArr[20]);
							SetProperty(""City"", RecDataArr[21]);
							SetProperty(""Block Number"", RecDataArr[22]);
							SetProperty(""Road Number"", RecDataArr[23]);
							SetProperty(""Governorate"", RecDataArr[24]);
							SetProperty(""Type"", RecDataArr[25]);
							SetProperty(""Bill Cycle"", RecDataArr[26]);
							SetProperty(""Credit Score"", RecDataArr[27]);
							SetProperty(""Bad Debt"", RecDataArr[28]);
							SetProperty(""MSISDN"", RecDataArr[29]);
							SetProperty(""MENA Parent CLI ID"", RecDataArr[30]);
							SetProperty(""SIM"", RecDataArr[31]);
							SetProperty(""Product Type"", RecDataArr[32]);
							SetProperty(""MENA Plan Name"", RecDataArr[33]);
							SetProperty(""Plan Name"", RecDataArr[34]);
							SetProperty(""Account Status"", RecDataArr[35]);
							SetProperty(""Suspension Date"", RecDataArr[36]);
							SetProperty(""Activation Date"", RecDataArr[37]);
							SetProperty(""TRA Registration Date"", RecDataArr[38]);
							SetProperty(""Authorized Number"", RecDataArr[39]);
							SetProperty(""Authorized Email Id"", RecDataArr[40]);
							SetProperty(""VOBB User Name"", RecDataArr[41]);
							SetProperty(""VOBB Password"", RecDataArr[42]);
							SetProperty(""VOBB Rental Charges"", RecDataArr[43]);
							SetProperty(""KZ Router Flag"", RecDataArr[44]);
							SetProperty(""Port ID"", RecDataArr[45]);
							SetProperty(""Port In Donor Id"", RecDataArr[46]);
							SetProperty(""Port Donor SIM"", RecDataArr[47]);
							SetProperty(""Contract Length"", RecDataArr[48]);
							SetProperty(""Contract Product"", RecDataArr[49]);
							SetProperty(""Contract Start Date"", RecDataArr[50]);
							SetProperty(""Contract End Date"", RecDataArr[51]);
							SetProperty(""Contract Termination Charge"", RecDataArr[52]);
							SetProperty(""MENA Attribute 1"", RecDataArr[53]);
							SetProperty(""MENA Attribute 2"", RecDataArr[54]);
							SetProperty(""MENA Attribute 3"", RecDataArr[55]);
							SetProperty(""MENA Attribute 4"", RecDataArr[56]);
							SetProperty(""MENA Attribute 5"", RecDataArr[57]);
							SetProperty(""MENA Attribute 6"", RecDataArr[58]);
							SetProperty(""MENA Attribute 7"", RecDataArr[59]);
							SetProperty(""MENA Attribute 8"", RecDataArr[60]);
							SetProperty(""MENA Attribute 9"", RecDataArr[61]);
							SetProperty(""MENA Attribute 10"", RecDataArr[62]);

						}//end of with(psFields)
				
						//ActivateMultipleFields(psFields);
						NewRecord(NewAfter);
						SetMultipleFieldValues(psFields);
						WriteRecord();
						vDataRecId = GetFieldValue(""Id"");
					}//end of if(RecDataArrLen > 0)

					i++;
				}//end of while(i < RecCount)
			}//end of with(MenaDataBC)
			
			SetFieldValue(""Description"", vFileName);
			SetFieldValue(""Sub-Status"", vImportedStatus); //update header status
			WriteRecord();
		}//end of if (FirstRecord())
	}//end of with(MenaHeaderBC)
}
catch(e)
{throw(e);}
finally{
	MenaProdBC=null;
	MenaDataBC=null;
	MenaHeaderBC=null;
	MenaHeaderBO=null; 
}
return CancelOperation;
}
function CreateLineItemsCorp(vMenaReqId, vMenaCustType, RecArrMulti, RecCount, vFileName)
{//[Hardik:GPON Corporate Bulk Import

var MenaHeaderBO=null, MenaHeaderBC=null, MenaDataBC=null, MenaProdBC=null;
var vPendingStatus=""Pending"", vInProgStatus=""In Progress"", vImportedStatus=""Imported"", vInactiveStatus=""INACTIVE"";
var psFields = TheApplication().NewPropertySet();
var RecDataArr = new Array();
var i=0, RecDataArrLen=0, vReqType="""", vDuplicateFlag=""FALSE"", vDataRecId="""";
//TheApplication().TraceOn(""C:\\temp\\trace_$p_$t.txt"", ""Allocation"", ""All"");
try
{
	MenaHeaderBO = TheApplication().GetBusObject(""STC GPON Request Header BO"");
	with(MenaHeaderBO)
	{	
		MenaHeaderBC = GetBusComp(""STC GPON Bulk Request Header BC"");
		MenaDataBC = GetBusComp(""STC GPON Bulk Data BC"");
		MenaProdBC = GetBusComp(""STC GPON Product Data BC"");
	}
	with(MenaHeaderBC)
	{
		SetViewMode(AllView);
		ClearToQuery();
		ActivateField(""Status"");
		ActivateField(""Sub-Status"");
		ActivateField(""Request Id"");
		ActivateField(""Description"");
		ActivateField(""Request Type"");

		SetSearchSpec(""Request Id"", vMenaReqId);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			vReqType = GetFieldValue(""Request Type"");
			
			with(MenaDataBC)
			{
				
				while(i < RecCount)
				{
					RecDataArr = RecArrMulti[i];
					RecDataArrLen = RecDataArr.length;
				
					if(RecDataArrLen > 0)
					{
						with(psFields)
						{
							SetProperty(""Parent Request Id"", vMenaReqId);

							//Check for Duplicate MSISDN and make new record INACTIVE
						//	vDuplicateFlag = CheckDuplicateMSISDN(vMenaReqId, RecDataArr[44], vMenaCustType);
							if(vDuplicateFlag == ""TRUE"")
							{
								SetProperty(""Status"", vInactiveStatus);
							}
							else{
								SetProperty(""Status"", vInProgStatus);
							}
							
							SetProperty(""Sub Status"", vImportedStatus);
							SetProperty(""Request Type"", vReqType);
							
							SetProperty(""Customer Type"", RecDataArr[0]);
							SetProperty(""STC DBAN Number"", RecDataArr[1]);
							SetProperty(""STC Address Flat Number"", RecDataArr[2]);
							SetProperty(""STC Address Building Number"", RecDataArr[3]);
							SetProperty(""STC Address Road Number"", RecDataArr[4]);
							SetProperty(""STC Address Block Number"", RecDataArr[5]);
							SetProperty(""STC Address City"", RecDataArr[6]);
							SetProperty(""VIVA Plan"", RecDataArr[7]);
							SetProperty(""Plan Contract Product"", RecDataArr[8]);
							SetProperty(""STC MENA Data Attr1"", RecDataArr[9]);
							SetProperty(""STC MENA Data Attr2"", RecDataArr[10]);
							SetProperty(""STC MENA Data Attr3"", RecDataArr[11]);
							SetProperty(""STC MENA Data Attr4"", RecDataArr[12]);
							SetProperty(""STC MENA Data Attr5"", RecDataArr[13]);
						}//end of with(psFields)

						//ActivateMultipleFields(psFields);
						NewRecord(NewAfter);
						SetMultipleFieldValues(psFields);
						WriteRecord();
						vDataRecId = GetFieldValue(""Id"");

					}//end of if(RecDataArrLen > 0)

					i++;
				}//end of while(i < RecCount)
			}//end of with(MenaDataBC)
			
			SetFieldValue(""Description"", vFileName);
			SetFieldValue(""Sub-Status"", vImportedStatus); //update header status
			WriteRecord();
		}//end of if (FirstRecord())
	}//end of with(MenaHeaderBC)
}
catch(e)
{throw(e);}
finally{
	MenaProdBC=null;
	MenaDataBC=null;
	MenaHeaderBC=null;
	MenaHeaderBO=null; 
}
//return CancelOperation;
}
function ImportFileData(Inputs, Outputs)
{

	var vInputFile = """", vReadFromFile = """", vBulkDataArray = """";
    var vFileName = """", vFileType = """", sRecData="""";
	var vMenaReqId="""", vMenaReqNum="""", vMenaCustType="""";
	var RecArrMulti = new Array();
	//var RecDataArr = new Array();;
 	var vRecord = false, RecDataArrLen=0;
	var RecCount = 0, ErrMsg = ""Success"", i=0;
	var vPendingStatus=""Pending"", vImportedStatus=""Imported"";
	var svcUI = null, psIn1 = null, psOut1 = null;
	
	try {
		vFileName = Inputs.GetProperty(""FileName"");
	  	vFileType = ToString(Inputs.GetProperty(""FileType""));
		
		with(TheApplication())
		{
			vMenaReqId = GetProfileAttr(""MENAHeaderId"");
			vMenaReqNum = GetProfileAttr(""MENAHeaderNumber"");
			vMenaCustType = GetProfileAttr(""MENACustomerType"");
	
			SetProfileAttr(""MENAHeaderId"", """");
			SetProfileAttr(""MENAHeaderNumber"", """");
			SetProfileAttr(""MENACustomerType"", """");
		}

		vFileType = Clib.strlwr(vFileType);
	   if((vFileType != ""csv"") && (vFileType != ""tmp"")) //files having size more than 500KB are created with '.tmp' extension
	    {
	       TheApplication().RaiseErrorText(""Please check the File Type , It should be :  File_Name.CSV"");
	    }
	//	var filepath = ""C:\\temp\\GPON_Corporate_Data-BB.csv"";
	//	vFileName =""C:\\temp\\GPON_Corporate_Data-BB.csv"";
		vInputFile = Clib.fopen(vFileName, ""rt"");       
		//vReadFromFile = Clib.fgets(4000, vInputFile);      
	    vReadFromFile = Clib.fgets(4000, vInputFile);
		
		if(vReadFromFile != null && vFileName != '' && vFileName != """")
		{		
			if (vInputFile == null)
			{
				TheApplication().RaiseErrorText(""Error in opening the file!"");
			}
					
			while((vReadFromFile != null) && (vReadFromFile.length > 1))
			{		
				ErrMsg = """"; //Nullify Error Message for each of the iteration			
				if(vReadFromFile != null && vReadFromFile != """")
				{
					vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
					var RecDataArr = vReadFromFile.split("","");
					RecDataArrLen = RecDataArr.length;

					for(i=RecDataArrLen; i <= 200; i++) //Set Remaining Array elements to null to avoid undefined error
						RecDataArr[i]="""";
						
					if(RecCount > 0)
						RecArrMulti[RecCount-1] = RecDataArr;
					
					RecCount++;
				}//if(sReadFromFile != null && sReadFromFile != """")
					
				vReadFromFile = Clib.fgets(4000, vInputFile);
				
			}//while((vReadFromFile != null) ...
			
			RecCount--;
			
			if(RecCount > 0)
			{
				//if(vMenaCustType == ""Individual"")
			//		CreateLineItems(vMenaReqId, vMenaCustType, RecArrMulti, RecCount, vFileName);
			//	else
					CreateLineItemsCorp(vMenaReqId, vMenaCustType, RecArrMulti, RecCount, vFileName);
			}

			svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
			psIn1 = TheApplication().NewPropertySet();
			psOut1 = TheApplication().NewPropertySet();
			psIn1.SetProperty(""Refresh All"", ""Y"");
			svcUI.InvokeMethod(""RefreshCurrentApplet"", psIn1, psOut1);
		}//if(sFileName != null && sFileName != '' && sFileName != """")
	}//end of try
	catch(e)
	{throw(e.errText);}
	finally{
		//vInputFile = null; 
		RecArrMulti=null;
		svcUI = null; psIn1 = null; psOut1 = null;
	}
	//return CancelOperation;
}
function ImportProductData(Inputs, Outputs)
{//[NAVIN:20Mar2018:MENACustomerMigration_ProductDataImport]

    var vInputFile=null, vFileName = """", vFileType = """", sRecData="""";
	var vMenaReqId="""", vMenaParId="""", vMenaCustType="""", vMenaOperation="""";
	//var vPendingStatus=""Pending"", vImportedStatus=""Imported"";
	var WFBS = null, WFInpPS = null, WFOutPS = null;
	var svcUI = null, psIn1 = null, psOut1 = null;
	
	try {
		vFileName = Inputs.GetProperty(""FileName"");
	  	vFileType = ToString(Inputs.GetProperty(""FileType""));
		
		with(TheApplication())
		{
			vMenaOperation = GetProfileAttr(""MENAOperation"");
			vMenaReqId = GetProfileAttr(""MENAHeaderId"");
			vMenaParId = GetProfileAttr(""MENAParentId"");
			vMenaCustType = GetProfileAttr(""MENACustomerType"");
			SetProfileAttr(""MENAOperation"", """");
			SetProfileAttr(""MENAHeaderId"", """");
			SetProfileAttr(""MENAParentId"", """");
			SetProfileAttr(""MENACustomerType"", """");
		}

		vFileType = Clib.strlwr(vFileType);
	    if((vFileType != ""csv"") && (vFileType != ""tmp"")) //files having size more than 500KB are created with '.tmp' extension
	    {
	       TheApplication().RaiseErrorText(""Please check the File Type , It should be :  File_Name.CSV"");
	    }
		
		if(vFileName != null && vFileName != """")
		{
			vInputFile = Clib.fopen(vFileName, ""rt""); 
			
			if (vInputFile == null)
			{
				TheApplication().RaiseErrorText(""Error in opening the file!"");
			}
	    
			WFBS = TheApplication().GetService(""Workflow Process Manager"");
			WFInpPS = TheApplication().NewPropertySet();
			WFOutPS = TheApplication().NewPropertySet();
			
			with(WFInpPS)
			{
				SetProperty(""ProcessName"", ""STC MENA Import Data WF"");
				SetProperty(""Operation"", vMenaOperation);
				SetProperty(""FileName"", vFileName);
				SetProperty(""FileType"", vFileType);
				SetProperty(""MENAHeaderId"", vMenaReqId);
				SetProperty(""MENAParentId"", vMenaParId);
				SetProperty(""CustType"", vMenaCustType);
			}
			
			WFBS.InvokeMethod(""RunProcess"", WFInpPS, WFOutPS);

			svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
			psIn1 = TheApplication().NewPropertySet();
			psOut1 = TheApplication().NewPropertySet();
			psIn1.SetProperty(""Refresh All"", ""Y"");
			svcUI.InvokeMethod(""RefreshCurrentApplet"", psIn1, psOut1);
			
		}//if(vFileName != null && vFileName != """")
	}//end of try
	catch(e)
	{throw(e.errText);}
	finally{
		WFBS = null; WFInpPS = null; WFOutPS = null;
		svcUI = null; psIn1 = null; psOut1 = null;
	}
	//return CancelOperation;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
//var ireturn = CancelOperation;
var vMenaOperation = """";
	 try
	 {
	    switch(MethodName)
	     {     
		     case ""ImportFileData"":
		     {
			 
				ImportFileData(Inputs,Outputs);
		
		     	return(CancelOperation);
		     	break;
		     }
			
	      	 default:
	         	break;
	     }
	 }
	 catch (exc)
	 {
	 	throw(exc.toString());
	 }
	 finally 
	 {
	 }
 //return (ContinueOperation); 
}
"//Your public declarations go here...  
"
function CreateGPONOLTRecords(vPortNumber,vFlat,vChildBuilding,vChildRoad,vChildBlock,vArea,vPONRouteSplittersPath,vLMSplitterLocation,i)
{

var svcUI = null, psIn1 = null, psOut1 = null;

try{
	var RecCount = 0;
	var GPONReqBO = TheApplication().GetBusObject(""STC GPON OLT BO Details"");	
	var GPONHeaderBC = GPONReqBO.GetBusComp(""STC GPON Parent OLT Details"");
	var GPONLineBC = GPONReqBO.GetBusComp(""STC GPON Child OLT Details"");
	var vGPONParentID = TheApplication().GetProfileAttr(""GPONParentId"");
    //var vGPONParentName = TheApplication().GetProfileAttr(""GPONParentName""); 
	with(GPONHeaderBC)
	{
		ClearToQuery();
		//ActivateField(""Status"");
		//ActivateField(""Sub Status"");
		ActivateField(""Name"");
		SetSearchSpec(""Id"",vGPONParentID);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			with(GPONLineBC)
			{
				if (i > 0)
				{
					while(RecCount < i)
					{
						ClearToQuery();
						ActivateField(""Area"");
						ActivateField(""Block"");
						ActivateField(""Building"");
						ActivateField(""Flat"");
						ActivateField(""Lm Splitter Location"");
						ActivateField(""Olt Name"");
						ActivateField(""Pon Route Splitters Path"");
						ActivateField(""Port Number"");
						ActivateField(""Road"");
						ActivateField(""GPON OLT ParentId"");
						SetSearchSpec(""GPON OLT ParentId"", vGPONParentID);
						SetSearchSpec(""Port Number"", vPortNumber[RecCount]);
					    ExecuteQuery(ForwardBackward);						
						if(FirstRecord())
						{}
						else
						{
							NewRecord(NewAfter);
							//RecCount--;
							//SetFieldValue(""Olt Name"", vOltName[RecCount]);
							SetFieldValue(""Port Number"", vPortNumber[RecCount]);		
							SetFieldValue(""Flat"", vFlat[RecCount]);
							SetFieldValue(""Building"",vChildBuilding[RecCount]);
							SetFieldValue(""Road"", vChildRoad[RecCount]);
							SetFieldValue(""Block"", vChildBlock[RecCount]);
							SetFieldValue(""Area"", vArea[RecCount]);
							SetFieldValue(""Pon Route Splitters Path"", vPONRouteSplittersPath[RecCount]);
							SetFieldValue(""Lm Splitter Location"", vLMSplitterLocation[RecCount]);						
							WriteRecord();
						}
						RecCount++;
					}//end of while(RecCount > 0)
		
									
					svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
					psIn1 = TheApplication().NewPropertySet();
					psOut1 = TheApplication().NewPropertySet();
					psIn1.SetProperty(""Refresh All"", ""Y"");
					svcUI.InvokeMethod(""RefreshCurrentApplet"", psIn1, psOut1);
				}//end of if (i > 0)
			}//end of with(BulkLineBC)
		}//end of if (FirstRecord())
	}//end of with(BulkHeaderBC)

	TheApplication().SetProfileAttr(""GPONParentId"", """");
}
catch(e)
{throw(e);}
finally{
	svcUI = null, psIn1 = null, psOut1 = null;
	GPONLineBC=null, GPONHeaderBC=null, GPONReqBO=null;
}
return CancelOperation;
}
function ImportFile(Inputs, Outputs)
{

	var vInputFile = """", vReadFromFile = """", vBulkDataArray = """", vGPONParentID="""";
    var vFileName = """", vFileType = """";
	 //Mark
//	var vOltName: Array = new Array();
	var vPortNumber: Array = new Array();
	var vFlat: Array = new Array();
	var vChildBuilding: Array = new Array();
	var vChildRoad: Array = new Array();
	var vChildBlock: Array = new Array();
	var vArea: Array = new Array();
	var vPONRouteSplittersPath: Array = new Array();
	var vLMSplitterLocation: Array = new Array();

 	var vRecord = false;
	var i = 0, j = 0, ErrMsg = ""Success"";
	
	try {
		
		vGPONParentID = TheApplication().GetProfileAttr(""GPONParentId"");

		vFileName = Inputs.GetProperty(""FileName"");
	  	vFileType = ToString(Inputs.GetProperty(""FileType""));
		vFileType = Clib.strlwr(vFileType);
	    if( vFileType != ""csv"")
	    {
	       TheApplication().RaiseErrorText(""Please check the File Type , It should be :  File_Name.CSV"");
	    }
	    vInputFile = Clib.fopen(vFileName, ""rt"");       
	    vReadFromFile = Clib.fgets(vInputFile);
		
		if(vReadFromFile != null && vFileName != '' && vFileName != """")
		{		
			if (vInputFile == null)
			{
				TheApplication().RaiseErrorText(""Error in opening the file!"");
			}
					
			if(vGPONParentID != null && vGPONParentID != """")
			{
				while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
					{			
						ErrMsg = """"; //Nullify Error Message for each of the iteration			
						if(vReadFromFile != null && vReadFromFile != """")
						{
							vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n""));
							if (j == 0)
							{
								j++;
							}
							else{	 
								var sRecData = vReadFromFile.split("","");
								//vOltName[i] = sRecData[0];
								vPortNumber[i] = sRecData[0];
								vFlat[i] = sRecData[1];
								vChildBuilding[i] = sRecData[2];
								vChildRoad[i] = sRecData[3];
								vChildBlock[i] = sRecData[4];
								vArea[i] = sRecData[5];
								vPONRouteSplittersPath[i] = sRecData[6];
								vLMSplitterLocation[i] = sRecData[7];
								i++;
								j++;
							}
						}//if(sReadFromFile != null && sReadFromFile != """")
						vReadFromFile = Clib.fgets(vInputFile);
					}//while(!Clib.feof(sFileOpen))
				 
					CreateGPONOLTRecords(vPortNumber,vFlat,vChildBuilding,vChildRoad,vChildBlock,vArea,vPONRouteSplittersPath,vLMSplitterLocation,i);

			}// end of if //Hardik Added for Write-Off	 
		}//if(sFileName != null && sFileName != '' && sFileName != """")
	}//end of try
	catch(e)
	{throw(e.errText);}
	finally{
		//vAccountNum = null, vAction = null, vExtDays = null;
		vInputFile = null;
		vGPONParentID = null;
	}
	return CancelOperation;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
var ireturn = CancelOperation;

	 try
	 {
	    switch(MethodName)
	     {     
		     case ""ImportFile"":
		     {
		     	ImportFile(Inputs,Outputs);
		     	return(CancelOperation);
		     	break;
		     }

	      	 default:
	         	break;
	     }
	 }
	 catch (exc)
	 {
	 	throw(exc.toString());
	 }
	 finally 
	 {
	 }
	  
}
"//Your public declarations go here...  
"
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
var ireturn = CancelOperation;

	 try
	 {
	    switch(MethodName)
	     {     
		     case ""Validation"":
		     {
		     	ValidationOLT(Inputs,Outputs);
		     	return(CancelOperation);
		     	break;
		     }

	      	 default:
	         	break;
	     }
	 }
	 catch (exc)
	 {
	// throw(exc.toString());
	 }
	 finally 
	 {
	 }
	  
}
function ValidationOLT(Inputs, Outputs)
{

		var Firstoneportnumber,firsttwopotnumber,nexttwoportnumber,last3portnumber,vUnused,vInprogress,scurrent_char,scharacter;
		//this.BusComp().ActivateField(""Port Number"");
		var vErrorMessage="""";
		var vPortNumber   = Inputs.GetProperty(""PortNumber"");
		var GPONParentId   = Inputs.GetProperty(""GPONParentId"");
		//var vPortNumber = this.BusComp().GetFieldValue(""Port Number"");
		var getlengthportnumber = vPortNumber.length;
		var sApps =TheApplication();
			var sSearchExpr=null;
		var sNot_First_zero = ""0"";
		var sNot_First_twozero = ""00"";
		var sNot_slas =""/0"";
		var slas =""/"";
		var snot_first_threezero = ""000"";
		var A = new Array();
		var A = vPortNumber.split(""/"");
		var i ="""",j="""";
		var sillegalChars = "".,:; <>[]{}!£$%^*()#+~|abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"";
		//var charachter =""abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"";
		//var vslashport = vPortNumber.includes(""/0"");
	//TheApplication().RaiseErrorText(""slahs port value"",vslashport);
		 Firstoneportnumber = vPortNumber.substring(0,1);
		 firsttwopotnumber = vPortNumber.substring(2,4);
		 nexttwoportnumber = vPortNumber.substring(5,7);
		 last3portnumber = vPortNumber.substring(8,11);
		 vUnused = TheApplication().InvokeMethod(""LookupValue"",""STC_GPON_OLTSTATUS_TYPE"",""UNUSED"");
		vInprogress = TheApplication().InvokeMethod(""LookupValue"",""STC_GPON_OLTSTATUS_TYPE"",""INPROGRESS"");
		var GPONBO,GPONBC;
		var count=0;
	try
 	{
		GPONBO = sApps.GetBusObject(""STC GPON OLT BO Details"");
		GPONBC =GPONBO.GetBusComp(""STC GPON Child OLT Details"");
			//GPONBC.WriteRecord();
			with(GPONBC)
			{			
			ActivateField(""GPON OLT ParentId"");
			ActivateField(""Port Number"");
			ClearToQuery();
			SetViewMode(AllView);	
			sSearchExpr = ""[GPON OLT ParentId] = '""+GPONParentId+""' AND [Port Number] = '""+vPortNumber+""'"";
			SetSearchExpr(sSearchExpr);
			ExecuteQuery(ForwardBackward);		
			count = CountRecords();
			if(Number(count) > 1)
			{

				TheApplication().RaiseErrorText(""Enter Port Number is already exist in system, Port Number should not be duplicate."");
			}
			}

		with(GPONBC)
		{
			SetViewMode(AllView);
			ClearToQuery();
			ActivateField(""Port Number"");
			ActivateField(""Status"");
			SetSearchSpec(""Port Number"", vPortNumber);
			ExecuteQuery(ForwardOnly);
			//IsRecFound = FirstRecord()
			if(FirstRecord())
			{

				for (i=0;i<sillegalChars.length;i++)
				{
				scurrent_char = sillegalChars.substring(i,i+1);
					if((vPortNumber.indexOf(""/"",0) == -1) || (vPortNumber.indexOf(""//"",0) != -1))
					{
					TheApplication().RaiseErrorText(""Please follow the format X/YY/ZZ/AAA"");
					}
				else if(vPortNumber.indexOf(scurrent_char,0) != -1)
					{
					TheApplication().RaiseErrorText(""Port Number should not be a spcial character and character value please follow the format X/YY/ZZ/AAA"");
					}
				}		

				if(getlengthportnumber>=12)
				{
				TheApplication().RaiseErrorText(""Port Number is not more then 11 digit as given the format X/YY/ZZ/AAA"");
				}
				else if(1< Firstoneportnumber.length)
				{
				TheApplication().RaiseErrorText(""'X' First Port Number is not more than Single digit as given the format X/YY/ZZ/AAA"");
				}
				//else if(vPortNumber.indexOf(sNot_slas,0) != -1) -- rama
				//else  if((A[1].indexOf(sNot_First_zero) == 0 || A[1].length>2) || (A[2].indexOf(sNot_First_zero) == 0 || A[2].length>2)|| ((A[3].indexOf(sNot_First_zero)==0&& A[3].length>=2)||A[3].length<1))
				else  if((A[1].length>2) || (A[2].length>2)|| (A[3].length>3)||(A[3].length==0))
				{
				TheApplication().RaiseErrorText(""Please follow the format X/YY/ZZ/AAA, YY/ZZ length will be a two/single digit and AAA should not be empty after '/'"");
				}

				else if(((2< firsttwopotnumber.length)|| (2< nexttwoportnumber.length) )&& ((nexttwoportnumber.indexOf(sNot_slas)== ""/"") || (firsttwopotnumber.indexOf(sNot_slas)== ""/"")))
				{
				TheApplication().RaiseErrorText(""YY OR ZZ format of the PortNumber is not more then two digit as given the format X/YY/ZZ/AAA "");
				}

				else if(vPortNumber.indexOf(slas,1) != 1)	
				{
				TheApplication().RaiseErrorText(""Port Number  'X'  should be a single digit i.e 0-9 before the '/' as given the format X/YY/ZZ/AAA"");
				}

				//else
				//{
				//this.BusComp().SetFieldValue(""Status"",vUnused);
				//this.BusComp().WriteRecord(); 
				//}

			} // if first record
	}
	}
		
 	catch(m)
 	{
  		  vErrorMessage = m.toString();
		//	vErrorCode    = m.errCode; 
		///throw (e);
		Outputs.SetProperty(""ErrorMessage"",vErrorMessage);
		
 	}
 	finally
 	{
		vPortNumber = null;
		GPONBC = null;
		GPONBO = null;
	//	Outputs.SetProperty(""ErrorMessage"",vErrorMessage);
			
 	}
	//return CancelOperation;
}
function ContractGeneration(Inputs, Outputs)
{
var ContactId = Inputs.GetProperty(""ContactId"");
var ContactBC = TheApplication().GetBusObject(""Contact"").GetBusComp(""Contact"");
with(ContactBC)
{
  SetViewMode(AllView);
  ActivateField(""Citizenship"");
  ActivateField(""M/F"");
  ActivateField(""First Name"");
  ActivateField(""Email Address"");
  ActivateField(""Last Name"");
  ActivateField(""Date of Birth"");
  ActivateField(""Work Phone #"");
  ClearToQuery();
  SetSearchSpec(""Id"",ContactId);
  ExecuteQuery(ForwardOnly);
  var IsCOnRec = FirstRecord();
  if(IsCOnRec)
  {
  var Citizen = GetFieldValue(""Citizenship"");
  var gender = GetFieldValue(""M/F"");
  var LName = GetFieldValue(""Last Name"");
  var FName = GetFieldValue(""First Name"");
  var Name = FName+"" ""+LName;
  var EmailAddr = GetFieldValue(""Email Address"");
  var DOB = GetFieldValue(""Date of Birth"");
  var workphone = GetFieldValue(""Work Phone #"");
  Outputs.SetProperty(""FullName"",FName+"" ""+LName);
  Outputs.SetProperty(""Nationality"",Citizen);
  Outputs.SetProperty(""Gender"",gender);
  Outputs.SetProperty(""FName"",Name);
  Outputs.SetProperty(""Email Address"",EmailAddr);
  Outputs.SetProperty(""Date of Birth"",DOB);
  
  Outputs.SetProperty(""Work Phone #"",workphone);
  }
}

}
function GetAddressForContract(Inputs, Outputs)
{
var CutAddrBC = TheApplication().GetBusObject(""CUT Address"").GetBusComp(""CUT Address"");

var AddressId = Inputs.GetProperty(""AddressId"");

with(CutAddrBC)
{
  SetViewMode(AllView);
  ActivateField(""STC Street Name"");
  ActivateField(""STC Road No"");
  ActivateField(""Province"");
  ActivateField(""Postal Code"");
  ActivateField(""State"");
  ActivateField(""Apartment Number"");
  ActivateField(""Country"");
  ActivateField(""City"");
  ActivateField(""Street Address"");
  ActivateField(""Street Address 2"");

  ClearToQuery();
  SetSearchSpec(""Id"",AddressId);
  ExecuteQuery(ForwardOnly);
  var IsAddrRec = FirstRecord();
  if(IsAddrRec)
  {
   var StreetName = GetFieldValue(""STC Street Name"");
   var RoadNo = GetFieldValue(""STC Road No"");
   var Province = GetFieldValue(""Province"");
   var PostalCode = GetFieldValue(""Postal Code"");
   var State = GetFieldValue(""State"");
   var ApptNum = GetFieldValue(""Apartment Number"");
   var Country = GetFieldValue(""Country"");
   var City = GetFieldValue(""City"");
   var StreetAddress = GetFieldValue(""Street Address"");
   var StreetAddress2 = GetFieldValue(""Street Address 2"");
   
     Outputs.SetProperty(""StreetName"",StreetName);
     Outputs.SetProperty(""RoadNo"",RoadNo);
     Outputs.SetProperty(""Province"",Province);
     Outputs.SetProperty(""PostalCode"",PostalCode);
     Outputs.SetProperty(""Governorate"",State);
     Outputs.SetProperty(""Flat"",ApptNum);
     Outputs.SetProperty(""Country"",Country);
     Outputs.SetProperty(""City"",City);
     Outputs.SetProperty(""BuildingNo"",StreetAddress);
     Outputs.SetProperty(""BlockNo"",StreetAddress2);
     
   
   
  }
}
}
function GetVanityNumber(Inputs, Outputs)
{
var OrderId = Inputs.GetProperty(""OrderId"");
var AppObj = TheApplication();
var OrderBO = AppObj.GetBusObject(""Order Entry (Sales)"");
var OrderBC = OrderBO.GetBusComp(""Order Entry - Orders"");
var spec;
var sVanityTypeLOV = """";
var sVanityCategory = """";//MANUJ: Contract Generation
var OrderLineBC = OrderBO.GetBusComp(""Order Entry - Line Items"");
with(OrderBC)
{
SetViewMode(AllView);
ClearToQuery();
SetSearchSpec(""Id"",OrderId);
ExecuteQuery(ForwardOnly);
var OrderRec = FirstRecord();
if(OrderRec)
{
  with(OrderLineBC)
  {
  ActivateField(""Product""); 
 // spec  = ""[Order Header Id] = '"" + OrderId + ""' AND [Part Number] LIKE 'VAN*'"";
  spec  = ""[Order Header Id] = '"" + OrderId + ""' AND [Part Number] LIKE 'VAN*' AND [Action Code] = 'Add' "";
  SetViewMode(AllView);
  ActivateField(""Low"");//MANU: COntract Generation
  
  ClearToQuery();
  SetSearchExpr(spec);  
  ExecuteQuery(ForwardOnly);
  var IsVanityProd = FirstRecord();
  if(IsVanityProd)
  {
   var VanityProd = GetFieldValue(""Product"");
   
   
   var BcLov = AppObj.GetBusObject(""List Of Values"").GetBusComp(""List Of Values"");
   with(BcLov)
   {
     SetViewMode(AllView);
     ActivateField(""Low"");
	 ActivateField(""Value"");//MANU: COntract Generation
     ClearToQuery();
     SetSearchSpec(""Name"",VanityProd);
     ExecuteQuery(ForwardOnly);
     var islovRec = FirstRecord();
     if(islovRec)
     {
       sVanityTypeLOV = GetFieldValue(""Low"");
	   sVanityCategory = GetFieldValue(""Value"");//MANUJ Added for Generate Contract Change
     }// end of islovRec
   }// end of BcLov
   
   
   
  }// end of  if(IsVanityProd)
  }// end of OrderLineBC
}// end of if(OrderRec) 
}// end of OrderBC

Outputs.SetProperty(""VanityCharges"", sVanityTypeLOV);
Outputs.SetProperty(""VanityCategory"", sVanityCategory);//MANUJ Added for Generate Contract Change
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
 try
 {
    switch(MethodName)
     {

     
    case ""ContractGeneration"":
     ContractGeneration(Inputs, Outputs);
     return(CancelOperation);
     break;
     
     
     case ""GetAddressForContract"":
     GetAddressForContract(Inputs, Outputs);
     return(CancelOperation);
     break;
     
     
     case ""GetVanityNumber"":
     GetVanityNumber(Inputs, Outputs);
     return(CancelOperation);
     break;
     

        default:
          return (ContinueOperation);
       }
 }
 catch (exc)
 {
 throw(exc.toString());
 }
  finally 
 {
 }  
}
function CheckPrimary(PilotNumber)
{
 var vPilotNumber = PilotNumber;
 var NoOfRec = """";

try
{
       var vInputs = TheApplication().NewPropertySet();
       var vOutputs = TheApplication().NewPropertySet();
       var vPortCanWF = TheApplication().GetService(""Workflow Process Manager"");
        vInputs.SetProperty(""ProcessName"", ""STC FNP Pilot Number Check"");
        vInputs.SetProperty(""PilotNumber"",vPilotNumber);
         vPortCanWF.InvokeMethod(""RunProcess"", vInputs, vOutputs);
         NoOfRec = vOutputs.GetProperty(""NoOfRec"");

 }
 
 catch(e)
 {
  throw(e);  
 }
 finally
 {
 
 }
 return(NoOfRec); 
}
function GenPortValidation(Inputs,Outputs)
{
try
 {
  
	var vMSISDN = Inputs.GetProperty(""MSISDN"");
	var vSIMNo = Inputs.GetProperty(""SIMNo"");
	var vCustType = Inputs.GetProperty(""CustomerType"");
	var vSubscirberId = Inputs.GetProperty(""SubscirberId"");
	var vSubscirberIdType = Inputs.GetProperty(""SubscirberIdType"");
	var vLineType = Inputs.GetProperty(""LineType"");
	var vOutStandAmt = """", vSubId = """";
	
	var vStrsubid = vSubscirberId.indexOf(""/"",0);
	var finalSubStr = vSubscirberId.substring(0,vStrsubid);

	//var StrLeft = Left(vSubscirberId,8);
	//var SubStr = InStr([1], vSubscirberId, ""/"");

     var vSTCBO = TheApplication().GetBusObject(""STC Service Account"");
     var vSTCBC = vSTCBO.GetBusComp(""CUT Service Sub Accounts"");
     var vLeftSIMNo = vSIMNo.substring(5,0);
     var vLenSIMNo = vSIMNo.length;
        
        
    with(vSTCBC)
    { 
    InvokeMethod(""SetAdminMode"", ""TRUE"");
    SetViewMode(AllView);
    ActivateField(""DUNS Number"");
    ActivateField(""Account Status"");
    ActivateField(""STC-ICCID"");
    ActivateField(""STC ID #"");
    ActivateField(""STC ID Type"");
    ActivateField(""STC Pricing Plan Type"");
    ActivateField(""STC CR#"");
    ActivateField(""Type"");
    ActivateField(""STC CPS Flag"");
    ActivateField(""Parent Account Id"");
    ActivateField(""STC Pilot Number"");
    ActivateField(""STC Line Type"");
    ActivateField(""STC Service Profile Type"");
    ClearToQuery();
    SetSearchSpec(""DUNS Number"",vMSISDN);
    SetSearchSpec(""Account Status"",""Active"");
   //SetSortSpec(""Created(DESCENDING)"");
    ExecuteQuery(ForwardBackward);

    if(FirstRecord())
     {
		var vStatus = GetFieldValue(""Account Status"");
		var vSTCSIMNo = GetFieldValue(""STC-ICCID"");
		var vType = GetFieldValue(""Type""); 
		var vSTCId = GetFieldValue(""STC ID #"");
		var vSTCIdType = GetFieldValue(""STC ID Type""); 
		var vPlanType = GetFieldValue(""STC Pricing Plan Type"");
		var vPilotNumber = GetFieldValue(""STC Pilot Number"");
		var sLineType = GetFieldValue(""STC Line Type"");
		var vProfileType = GetFieldValue(""STC Service Profile Type"");
		var sCPSFlag = GetFieldValue(""STC CPS Flag"");
		var sBillAccountId = GetFieldValue(""Parent Account Id"");
		var sServiceAccntId = GetFieldValue(""Id"");
		var vSIMNo_Sub = vSTCSIMNo.substring(18,0);
   
       //if(vLineType == ""Fixed"")	// adding for VOBB Port out issue	//[19Nov2015][NAVINR][Efax Profile Validation]
	   if(vLineType == ""Fixed"" && (vProfileType != ""EFAX"" && vProfileType != ""VOIP"" && vProfileType != """" && vProfileType != '' && vProfileType != null) && vProfileType != ""CPS"")
	   {       
	         if(sLineType == """")
	          {
	           Outputs.SetProperty(""ErrorCode"",'REJ0008'); 
	               Outputs.SetProperty(""ErrorMessage"",'NUMBER and SERVICE_TYPE does not match');
	               return(CancelOperation);
	          }
	     }
       if(vLineType == ""Mobile"")
  		 {       
         //if(sLineType == ""FIXED"")	// adding for VOBB Port out issue	//[19Nov2015][NAVINR][Efax Profile Validation]
          if(sLineType == ""FIXED"" && (vProfileType != ""EFAX"" && vProfileType != ""VOIP"" && vProfileType != """" && vProfileType != '' && vProfileType != null) && vProfileType != ""CPS"")// adding for VOBB Port out issue
          {
           Outputs.SetProperty(""ErrorCode"",'REJ0008'); 
               Outputs.SetProperty(""ErrorMessage"",'NUMBER and SERVICE_TYPE does not match');
               return(CancelOperation);
          }
        } 
     if(vLineType == ""Fixed"")
  	 {       
	 	 //if(sLineType == ""FIXED"" && (vProfileType == ""SIP_PRIMARY"" || vProfileType == ""ISDN_PRIMARY"" || vProfileType == ""SIP_TRUNK""))
		 if(sLineType == ""FIXED"" && (vProfileType == ""SIP_PRIMARY"" || vProfileType == ""ISDN_PRIMARY""))
		 {
		  var vNoOfRecord = CheckPrimary(vMSISDN);
          if(vNoOfRecord>0)
            {
           Outputs.SetProperty(""ErrorCode"",'REJ0099'); 
               Outputs.SetProperty(""ErrorMessage"",""Pilot number can not be ported out if DDIs are active"");
               return(CancelOperation);
                }
             }
           }   
                
        if(vLineType == ""Fixed"" || vLineType == ""Mobile"")
          {                
       
       if(vStatus != ""Active"")
         {
          Outputs.SetProperty(""ErrorCode"",'REJ0008');
          Outputs.SetProperty(""ErrorMessage"",""Number is not active or in service"");
          return(CancelOperation);
         } // if vstatus
        /* if(vLeftSIMNo != '89973')
          {
            Outputs.SetProperty(""ErrorCode"",'REJ0010');
             Outputs.SetProperty(""ErrorMessage"",""SIM_CARD_NUMBER does not match the SIM chip assigned to the Number""); 
             return(CancelOperation);
            } */
         if(vLineType == ""Mobile"")
         {            
          if(vLenSIMNo >=19)
           {
           var vSIMSubStr = vSIMNo.substring(18,0);
            if(vSIMNo != vSTCSIMNo)
             {
              Outputs.SetProperty(""ErrorCode"",'REJ0010');
              Outputs.SetProperty(""ErrorMessage"",""SIM_CARD_NUMBER does not match the SIM chip assigned to the Number"");
             return(CancelOperation);
             } 
            } 
            if(vLenSIMNo <=18)       
              { vSIMSubStr = vSIMNo.substring(18,0);
              if(vSIMSubStr != vSIMNo_Sub)
               { 
                Outputs.SetProperty(""ErrorCode"",'REJ0010');
                Outputs.SetProperty(""ErrorMessage"",""SIM_CARD_NUMBER does not match the SIM chip assigned to the Number"");
               return(CancelOperation);
              } 
         } // if vlensimno
        }
         if(sCPSFlag == ""Y"")
         {
         	Outputs.SetProperty(""ErrorCode"",'REJ0008');
          	Outputs.SetProperty(""ErrorMessage"",""Number is not active or in service"");
          	return(CancelOperation);
         }
         
         if(vCustType == """")
         {
          Outputs.SetProperty(""ErrorCode"",'REJ0004'); 
           Outputs.SetProperty(""ErrorMessage"",'NUMBER and SERVICE_TYPE does not match');
          return(CancelOperation);
         }  // if vtype
         if(vType == 'Individual')
         {
          if(vType == vCustType)
           {
            if(vSubscirberIdType == ""Passport"")
             {
              if(vSubscirberId == """")
               {
                Outputs.SetProperty(""ErrorCode"",'REJ0015');             
                       Outputs.SetProperty(""ErrorMessage"",""PASSPORT_NUMBER required for validation "");
                       return(CancelOperation);
                      }
              if(vSubscirberId != vSTCId)
                {
                 Outputs.SetProperty(""ErrorCode"",'REJ0014');             
                        Outputs.SetProperty(""ErrorMessage"",""PASSPORT_NUMBER does not match the requested Porting Number’s Subscriber details"");
                 return(CancelOperation);
                } 
              }
             
             else
              if(vSubscirberIdType == ""Bahraini ID"")
               {
                if(vSubscirberId == """")
                 {
                  Outputs.SetProperty(""ErrorCode"",'REJ0011');             
                         Outputs.SetProperty(""ErrorMessage"",""CPR required for validation"");
                         return(CancelOperation);
                        }
                if(vSubscirberId != vSTCId)
                 {
                  Outputs.SetProperty(""ErrorCode"",'REJ0013');             
                         Outputs.SetProperty(""ErrorMessage"",""CPR number does not match the requested Porting Number’s Subscriber details"");
                  return(CancelOperation); 
                 }
               }
              }
               else
                if(vType != vCustType)
                 {
                         Outputs.SetProperty(""ErrorCode"",'REJ0007');             
                         Outputs.SetProperty(""ErrorMessage"",""Company Flag has unexpected value"");
                         return(CancelOperation);
                        }
             }             
          if(vType == 'Corporate')
           {
            if(vType == vCustType)
             {
              if(vSubscirberIdType == ""CR"")
                {  
                vSubId = vSubscirberId.substring(7,0);
                 if(vSubscirberId == """")
                 {
                         Outputs.SetProperty(""ErrorCode"",'REJ0016');             
                         Outputs.SetProperty(""ErrorMessage"",""COMMERCIAL_REG_NUMBER required for validation"");
                         return(CancelOperation);
                        }
                   if(vSubscirberId != vSTCId)
                    {   
                     Outputs.SetProperty(""ErrorCode"",'REJ0017');
                     Outputs.SetProperty(""ErrorMessage"",""COMMERCIAL_REG_NUMBER does not match the requested Porting Number’s Subscriber details"");
                    return(CancelOperation);
                   }  //if vSubscirberId
                }  // if vSubscirberIdType
              }  
                else
                     if(vType != vCustType)   
                      {                          
                         Outputs.SetProperty(""ErrorCode"",'REJ0007');             
                         Outputs.SetProperty(""ErrorMessage"",""Company Flag has unexpected value"");
                         return(CancelOperation);
                 }
            } 
           if(vType == 'SME')
           {
            if(vCustType == 'Corporate')
             {
              if(vSubscirberIdType == ""CR"")
                {  
                vSubId = vSubscirberId.substring(7,0);
                 if(vSubscirberId == """")
                 {
                         Outputs.SetProperty(""ErrorCode"",'REJ0016');             
                         Outputs.SetProperty(""ErrorMessage"",""COMMERCIAL_REG_NUMBER required for validation"");
                         return(CancelOperation);
                        }
                   if(vSubscirberId != vSTCId)
                    {   
                     Outputs.SetProperty(""ErrorCode"",'REJ0017');
                     Outputs.SetProperty(""ErrorMessage"",""COMMERCIAL_REG_NUMBER does not match the requested Porting Number’s Subscriber details"");
                    return(CancelOperation);
                   }  //if vSubscirberId
                }  // if vSubscirberIdType
              }  
                else
                     if(vType != vCustType)   
                      {                          
                         Outputs.SetProperty(""ErrorCode"",'REJ0007');             
                         Outputs.SetProperty(""ErrorMessage"",""Company Flag has unexpected value"");
                         return(CancelOperation);
                 }
            }
            
            
            if(vType == 'Organization')
             {
		     if(vCustType == 'Corporate')
		      { 
                var vOrgCR = GetFieldValue(""STC CR#"");
               if(!(finalSubStr == vOrgCR))
                                                    {   
                                                      Outputs.SetProperty(""ErrorCode"",'REJ0017');
                                                       Outputs.SetProperty(""ErrorMessage"",""COMMERCIAL_REG_NUMBER does not match the requested Porting Number’s Subscriber details"");
                                                          return(CancelOperation);
                                                       }  //if vOrgCR
                                            }
                                            else
                                             {
                                                       Outputs.SetProperty(""ErrorCode"",'REJ0017');
                                                       Outputs.SetProperty(""ErrorMessage"",""COMMERCIAL_REG_NUMBER does not match the requested Porting Number’s Subscriber details"");           
                return(CancelOperation); 
                                                  }
             } 
       if(vPlanType == ""Postpaid"")
       {
       
       if(sBillAccountId != """" && sBillAccountId != null)
       {
	       	var psSIPInputs = TheApplication().NewPropertySet();
	       	var psSIPOutputs = TheApplication().NewPropertySet();
	       	psSIPInputs.SetProperty(""BillAccountId"", sBillAccountId);
	       	psSIPInputs.SetProperty(""ServiceAccountId"", sServiceAccntId);
	       	fnCheckSIPPlan(psSIPInputs, psSIPOutputs);
	       	var sSIPErrorMsg = psSIPOutputs.GetProperty(""ErrorMessage"");
	       	var sSIPErrorCode = psSIPOutputs.GetProperty(""ErrorCode"");
	       	if(sSIPErrorCode != """" && sSIPErrorCode != null)
	       	{
	       		Outputs.SetProperty(""ErrorCode"", sSIPErrorCode);             
	           	Outputs.SetProperty(""ErrorMessage"", sSIPErrorMsg);
	           	return(CancelOperation); 
	       	}
       }
       
     var vBal = TheApplication().InvokeMethod(""LookupValue"",""STC_MNP_OUTSTANDING_AMT"",""Bal"");
       if(vBal != """" || vBal == null)
       {//SUMANK: Added below for Error cases
	   var ErrFlg = ""N"";
	       var vInputs = TheApplication().NewPropertySet();
	       var vOutputs = TheApplication().NewPropertySet();
	       var vPortCanWF = TheApplication().GetService(""Workflow Process Manager"");
        vInputs.SetProperty(""ProcessName"", ""STC MNP Check OutStanding Balance WF"");
        vInputs.SetProperty(""MSISDN"",vMSISDN);
         vPortCanWF.InvokeMethod(""RunProcess"", vInputs, vOutputs);
         vOutStandAmt = vOutputs.GetProperty(""OutStandAmt"");
			ErrFlg = vOutputs.GetProperty(""SendError"");//SUMANK Added for Error cases
        if(ErrFlg != ""Y"")//SUMANK Added for Error cases
		{               
         if(ToNumber(vOutStandAmt) >= ToNumber(vBal))
         {
                Outputs.SetProperty(""ErrorCode"",'REJ0009');             
                Outputs.SetProperty(""ErrorMessage"",""Subscriber has Bad Debt""); 
                return(CancelOperation);      
              }
                     if(ToNumber(vOutStandAmt) < ToNumber(vBal))
                          {
                Outputs.SetProperty(""ErrorCode"",'0');             
                Outputs.SetProperty(""ErrorMessage"",""Accepted""); 
                return(CancelOperation);      
              }
            }// end of if(ErrFlg != ""Y"")
			else if(ErrFlg == ""Y"")//SUMANK Added for Error cases
			{
				 Outputs.SetProperty(""ErrorCode"",'REJ0009');             
                Outputs.SetProperty(""ErrorMessage"",""Subscriber has Bad Debt""); 
                return(CancelOperation);  
			}//SUMANK Added for Error cases
			} 

          }  
           if(vPlanType == ""Prepaid"")
           {
                Outputs.SetProperty(""ErrorCode"",'0');             
                Outputs.SetProperty(""ErrorMessage"",""Accepted""); 
                return(CancelOperation);               
           }       

             
          }
          else
          {
         Outputs.SetProperty(""ErrorCode"",'REJ0008');
         Outputs.SetProperty(""ErrorMessage"",""Number is not active or in service"");
         return(CancelOperation);
          }
      }
else
{
     Outputs.SetProperty(""ErrorCode"",'REJ0008');
     Outputs.SetProperty(""ErrorMessage"",""Number is not active or in service"");
     return(CancelOperation);
}
} // if F & M  
        
}  //try
catch(e)
{
	Outputs.SetProperty(""ErrorMessage"", e.errText);
	Outputs.SetProperty(""ErrorCode"", '999');
	return(CancelOperation);
} 
finally
{
	vSTCBC = null;
	vSTCBO = null;
}  
  
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 if(MethodName == ""GenPortValidation"")
  {
   GenPortValidation(Inputs,Outputs);
   return(CancelOperation);
  }

 if(MethodName == "fnCheckSIPPlan"")
  {
   fnCheckSIPPlan(Inputs,Outputs);
   return(CancelOperation);
  }
  
  if(MethodName == "fnCheckSIPPlanPortOut"")
  {
  	fnCheckSIPPlanPortOut(Inputs, Outputs);
  	return(CancelOperation);
  }
 return (ContinueOperation);
}
function fnCheckSIPPlan(SIPInputs, SIPOutputs)
{
	var sBillAcntId = SIPInputs.GetProperty(""BillAccountId"");
	var sSvcAccntId = SIPInputs.GetProperty(""ServiceAccountId"");
	var sBillAcntBO = TheApplication().GetBusObject(""PDS Asset Management"");
	var sAssetBC = sBillAcntBO.GetBusComp(""Asset Mgmt - Asset"");
	var sErrorMsg = """"; var sErrorCode = """"; var sPartNum = """"; var sSIMPartNumCheck = """";
	var sSIMPartNumSubStr = """"; var sPortPartNum = """"; var sSIMPortPartNumCheck = """"; var sSIMPortPartNumSubStr = """";
	
	with(sAssetBC)
	{
		SetViewMode(AllView);
		ActivateField(""Product Part Number"");
		ClearToQuery();
	//	SetSearchExpr(""[Billing Account Id] = '""+sBillAcntId+""' AND [STC Plan Type] = 'Service Plan' and [Status] <> 'Inactive'"");
		SetSearchExpr(""[Billing Account Id] = '""+sBillAcntId+""' AND [STC Plan Type] = 'Service Plan' and [Status] <> 'Inactive' AND [Service Account Id] = '""+sSvcAccntId+""'"");
		ExecuteQuery(ForwardOnly);
		if(FirstRecord())
		{
			sPortPartNum = GetFieldValue(""Product Part Number"");
			sSIMPortPartNumCheck = TheApplication().InvokeMethod(""LookupValue"",""STC_MNP_SIPPLANS"",sPortPartNum);
			sSIMPortPartNumSubStr = sSIMPortPartNumCheck.substring(0,5);
		}
		if(sSIMPortPartNumSubStr != ""Allow"")
		{
			SetViewMode(AllView);
			ActivateField(""Product Part Number"");
			ClearToQuery();
			SetSearchExpr(""[Billing Account Id] = '""+sBillAcntId+""' AND [STC Plan Type] = 'Service Plan' and [Status] <> 'Inactive' AND [Service Account Id] <> '""+sSvcAccntId+""'"");
			ExecuteQuery(ForwardOnly);
			var iRec = FirstRecord();
			while(iRec)
			{
				sPartNum = GetFieldValue(""Product Part Number"");
				sSIMPartNumCheck = TheApplication().InvokeMethod(""LookupValue"",""STC_MNP_SIPPLANS"",sPartNum);
				sSIMPartNumSubStr = sSIMPartNumCheck.substring(0,5);
				if(sSIMPartNumSubStr == ""Allow"")
				{
					sErrorCode = ""REJ0099"";
					sErrorMsg = ""Other"";
					break;
				}
				iRec = NextRecord();
			}//end of while(iRec)
		}//end of if(sSIMPortPartNumSubStr == ""Allow"")
	}//end of with(sAssetBC)
	SIPOutputs.SetProperty(""ErrorMessage"", sErrorMsg);
	SIPOutputs.SetProperty(""ErrorCode"", sErrorCode);
}
function fnCheckSIPPlanPortOut(Inputs, Outputs)
{
try
{
	var sBillAcntId = Inputs.GetProperty(""BillAccountId"");
	var sMSISDN = Inputs.GetProperty(""MSISDN"");
	var sBillAcntBO = TheApplication().GetBusObject(""PDS Asset Management"");
	var sAssetBC = sBillAcntBO.GetBusComp(""Asset Mgmt - Asset"");
	
	var sSvcAccntBO = TheApplication().GetBusObject(""STC Service Account"");
	var sSvcAccntBC = sSvcAccntBO.GetBusComp(""CUT Service Sub Accounts"");
	
	var sErrorMsg = """"; var sErrorCode = """"; var sPartNum = """"; var sSIMPartNumCheck = """";
	var sSIMPartNumSubStr = """"; var sServiceId = """"; var sSIPNoPortSAN = ""Y"";
	
	with(sAssetBC)
	{
		ActivateField(""Product Part Number"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchExpr(""[Serial Number] = '""+sMSISDN+""' AND [Billing Account Id] = '""+sBillAcntId+""' AND [STC Plan Type] = 'Service Plan' and [Status] <> 'Inactive'"");
		ExecuteQuery(ForwardOnly);
		if(FirstRecord())
		{
			sPartNum = GetFieldValue(""Product Part Number"");
			sSIMPartNumCheck = TheApplication().InvokeMethod(""LookupValue"",""STC_MNP_SIPPLANS"",sPartNum);
			sSIMPartNumSubStr = sSIMPartNumCheck.substring(0,5);
			if(sSIMPartNumSubStr == ""Allow"")
			{
				sSIPNoPortSAN = ""N"";
				SetViewMode(AllView);
				ActivateField(""Product Part Number"");
				ActivateField(""Service Account Id"");
				ClearToQuery();
				SetSearchExpr(""[Billing Account Id] = '""+sBillAcntId+""' AND [STC Plan Type] = 'Service Plan' and [Status] <> 'Inactive'"");
				ExecuteQuery(ForwardOnly);
				var iRec = FirstRecord();
				while(iRec)
				{
					sServiceId = """";
					sPartNum = GetFieldValue(""Product Part Number"");
					sServiceId = GetFieldValue(""Service Account Id"");
					sSIMPartNumCheck = TheApplication().InvokeMethod(""LookupValue"",""STC_MNP_SIPPLANS"",sPartNum);
					sSIMPartNumSubStr = sSIMPartNumCheck.substring(0,5);
					if(sSIMPartNumSubStr == ""Allow"" && sServiceId != """" && sServiceId != null)
					{
						with(sSvcAccntBC)
						{
							SetViewMode(AllView);
							ClearToQuery();
							SetSearchExpr(""[Id] = '""+sServiceId+""' AND ([STC PortOut Acceptance Flag] IS NULL OR [STC PortOut Acceptance Flag] = 'N') AND [Account Status]<>'Terminated' AND [Account Status]<>'New'"");
							ExecuteQuery(ForwardOnly);
							if(FirstRecord())
							{
								sSIPNoPortSAN = ""Y"";
								break;
							}
						}
					}
					iRec = NextRecord();
				}//while(iRec)	
			}//end of if(sSIMPartNumSubStr == ""Allow"")
		}//end of if(FirstRecord())	
	}//end of with(sAssetBC)
	Outputs.SetProperty(""SIPNoPortOut"", sSIPNoPortSAN);
}
catch(e)
{
	throw(e);
}
finally
{

}
}
function AddToDate(sourceDate, nMonths, nDays, nHours, nMinutes, nSeconds, nsign)
 {

// Parameters : // sourceDate : Date object // nDays, nHours , nMinutes , nSeconds : Integer numbers // nsign : Can have two values : 1 or -1 // 1 indicates to ADD to the sourceDate // -1 indicates to SUBTRACT from the sourceDate // Returns : A date object, after adding/subtracting // ndays,hNours,nMinutes // and nseconds to the sourceDate. 
var retDate = sourceDate; 
retDate.setMonth(retDate.getMonth()+nsign*nMonths);
retDate.setDate(retDate.getDate()+nsign*nDays); 
retDate.setHours(retDate.getHours()+nsign*nHours); 
retDate.setMinutes(retDate.getMinutes()+nsign*nMinutes); 
retDate.setSeconds(retDate.getSeconds()+nsign*nSeconds); 
return (retDate);
}
function GenSMSList(psInputs,psOutputs)
{
var ProcessingType = psInputs.GetProperty(""ProcessingType"");
var BillingAccountId = psInputs.GetProperty(""BillingAccountId"");

try
{

if(ProcessingType == ""ProcessAllRecords"")
{
	ProcessAllRecords(BillingAccountId);
}
}
catch(e)
{
	TheApplication().RaiseErrorText(e.toString());
	
}
}
function GetLOVDesc(Type, LIC)
{
	var vLOVType = Type;
	var vLIC = LIC;
	
	var vDesc ="""";
	var isRecord;
	var vBOLOV,vBCLOV;
	
	try
	{
		vBOLOV = TheApplication().GetBusObject(""List Of Values"");
	   	vBCLOV = vBOLOV.GetBusComp(""List Of Values"");
	   	
	
		with(vBCLOV)
	    {
		  	SetViewMode(3);
		    ActivateField(""Type"");
		  	ActivateField(""Description"");
		    ActivateField(""Name"");
		    ClearToQuery();
		    SetSearchSpec(""Type"",vLOVType);
		    SetSearchSpec(""Name"",vLIC);
		    ExecuteQuery(ForwardOnly);
		    isRecord = FirstRecord();
			if(isRecord != null)
			{  
		        vDesc = GetFieldValue(""Description"");  
			}   
			return(vDesc);				
		}
	}
	catch(e)
	{
		TheApplication().RaiseError(e.toString);
		return(vDesc);		
	}
	finally
	{
		vBOLOV = null;
		vBCLOV = null;
	
	}	
}
function GetTimeStamp()
{
	var SysDate = Clib.time();
	var ObjDate = Date.fromSystem(SysDate); 

	var Month = ToString(ObjDate.getMonth()+1);
		if(Month.length == 1)   
			{
				Month = ""0"" + Month;
			}
	var Day = ToString(ObjDate.getDate());
		if(Day.length == 1)
			{
				Day = ""0"" + Day;
			}
	var Year = ToString(ObjDate.getFullYear());
	var Hour = ToString(ObjDate.getHours());
		if(Hour.length == 1)
			{
				Hour = ""0"" + Hour;
			}
	var Minute = ToString(ObjDate.getMinutes());
		if(Minute.length == 1)
			{
				Minute = ""0"" + Minute;
			}
	var Second = ToString(ObjDate.getSeconds()); 
		if(Second.length == 1)
			{
				Second = ""0"" + Second;
			}

	var now = Day+""""+Month+""""+Year+""""+Hour+""""+Minute+""""+Second; 

	return(now);
}
function ProcessAllRecords(BillingAccountId)
{var vFileName,vFP;
var AppObj = TheApplication();
var BillAccBO = AppObj.GetBusObject(""STC Billing Account"");
var PreRegBC = BillAccBO.GetBusComp(""STC Business Prepaid Registration BC"");
var vMSISDN;
var Spec = ""[Batch Id] = '"" + BillingAccountId + ""' AND [Status] = 'Open'"";
var isRec;
var vCommaFlag = ""0"";
var vFilePathLOV = ""STC_ADMIN"";
var vLIC = ""BUSPREREG"";
var ShFilePathLOV = ""STC_ADMIN"";
var ShLIC = ""STC_SHELL"";
var strError;
var strFilePath = GetLOVDesc(vFilePathLOV,vLIC);
var StrShell = GetLOVDesc(ShFilePathLOV,ShLIC);
var vDTime = GetTimeStamp();
var CurrDate = new Date();
var CurrDateSys = new Date(CurrDate);
var sysdateCurrDate = CurrDateSys.toSystem();

						
						
try
{
		vFileName = ""CRM_BUSINESS_PREPAID_REGISTRATION""+ ""_""+ vDTime +"".txt"";
	//	vFP = Clib.fopen(""C:/"" + vFileName,""w"");
		vFP = Clib.fopen(strFilePath + vFileName,""w"");
		if(vFP != null)	// If vFP is NULL it means that File have not been created else continue Operation
   		{	
				with(PreRegBC)
				{
				ActivateField(""Status"");
				ActivateField(""MSISDN"");
				ActivateField(""Batch Id"");
				SetViewMode(AllView);
				ClearToQuery();
		var Spec1 = ""[Batch Id] = '"" + BillingAccountId + ""' AND ([Status] = 'Pending' OR [Status] = 'Imported')"";		
			//	SetSearchSpec(""Batch Id"", BillingAccountId);
			//	SetSearchSpec(""Status"", ""Pending"");
				SetSearchExpr(Spec1);
				ExecuteQuery(ForwardOnly);
				var BusReg = FirstRecord();	
				while(BusReg)
				{
				if(vCommaFlag == ""0"")
					{
					Clib.fputs(BillingAccountId, vFP);
					vCommaFlag = ""1"";
					}
					vMSISDN = GetFieldValue(""MSISDN"");
					if(vCommaFlag == ""0"")
					{
						Clib.fputs(""\n""+vMSISDN+"",Unbar"", vFP);
					}    		    	     		    
					else if(vCommaFlag == ""1"")
					{
						Clib.fputs(""\n""+vMSISDN+"",Unbar"", vFP);
					}
					vCommaFlag = ""1"";
				
					SetFieldValue(""Status"", AppObj.InvokeMethod(""LookupValue"", ""STC_PREPAID_STATUS"", ""Submitted""));
					WriteRecord();
   					BusReg = NextRecord();	
   				}// end of with
   				
   				
   				Clib.fputs(""\n""+""END;"",vFP); // Marking End Of File	
   			}
   			if(Clib.fclose(vFP) != 0)
			{
				strError = strError + ""****SMS file not closed****"";
			}
						Clib.system(StrShell+"" ""+vFileName); 
   		}
   		else
		{
			strError = strError + ""****Could not create SMS File****"";
		}
}
catch(e)
{
TheApplication().RaiseError(strError + e.toString());
}
finally //Releasing all the memory occupied by the objects
{
AppObj=null;
}

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""GenSMSList"")
	{
		GenSMSList(Inputs,Outputs);
		return(CancelOperation);
	}

	return (ContinueOperation);
}
function AddToDate(sourceDate, nMonths, nDays, nHours, nMinutes, nSeconds, nsign)
{

// Parameters : // sourceDate : Date object // nDays, nHours , nMinutes , nSeconds : Integer numbers // nsign : Can have two values : 1 or -1 // 1 indicates to ADD to the sourceDate // -1 indicates to SUBTRACT from the sourceDate // Returns : A date object, after adding/subtracting // ndays,hNours,nMinutes // and nseconds to the sourceDate. 
var retDate = sourceDate; 
retDate.setMonth(retDate.getMonth()+nsign*nMonths);
retDate.setDate(retDate.getDate()+nsign*nDays); 
retDate.setHours(retDate.getHours()+nsign*nHours); 
retDate.setMinutes(retDate.getMinutes()+nsign*nMinutes); 
retDate.setSeconds(retDate.getSeconds()+nsign*nSeconds); 
return (retDate);
}
function AddToDateWrapper(sourceDate, nMonths, nDays, nHours, nMinutes, nSeconds, nsign, nValidityUnit)
{
/*[02Jul2015][NAVINR][CR: Business Prepaid Plan Renewal]*/
	
	var EndDate="""";
	if(nValidityUnit == ""Months"")
	{
		EndDate = AddToDate(sourceDate, nMonths, 0, 0, 0, 0, nsign);
	}
	else if(nValidityUnit == ""Days"")
	{
		EndDate = AddToDate(sourceDate, 0, nDays, 0, 0, 0, nsign);
	}
	else if(nValidityUnit == ""Hours"")
	{
		EndDate = AddToDate(sourceDate, 0, 0, nHours, 0, 0, nsign);
	}
	else if(nValidityUnit == ""Minutes"")
	{
		EndDate = AddToDate(sourceDate, 0, 0, 0, nMinutes, 0, nsign);
	}
	else if(nValidityUnit == ""Seconds"")
	{
		EndDate = AddToDate(sourceDate, 0, 0, 0, 0, nSeconds, nsign);
	}
	else
	{
		EndDate = AddToDate(sourceDate, 0, nDays, 0, 0, 0, nsign);
	}
	
	return EndDate;
}
function DateToString(dDate) {

// Parameters : // dDate  : Date object // Returns : A string with the format ""mm/dd/yyyy"" or ""mm/dd/yyyy hh:mm:ss"" 

var sMonth = ToString(dDate.getMonth() + 1); 
if (sMonth.length == 1)
{
sMonth = ""0"" + sMonth;
} 
var sDay = ToString(dDate.getDate()); 
if (sDay.length == 1)
{
sDay = ""0"" + sDay;
} 
var sHours = ToString(dDate.getHours()); 
if (sHours.length == 1) 
{
sHours = ""0"" + sHours;
} 
var sMinutes = ToString(dDate.getMinutes());
if (sMinutes.length == 1)
{
sMinutes = ""0"" + sMinutes;
} 
var sSeconds = ToString(dDate.getSeconds());
if (sSeconds.length == 1) 
{
sSeconds = ""0"" + sSeconds;
} 
if (sHours == ""00"" && sMinutes == ""00"" && sSeconds == ""00"")
return (sMonth +""/""+ sDay +""/"" + dDate.getFullYear()) 
else
//return (sMonth +""/""+ sDay +""/"" + dDate.getFullYear()); 
return (sMonth +""/""+ sDay +""/"" + dDate.getFullYear() +"" ""+sHours+"":""+sMinutes+"":""+sSeconds);
}
function DateToStringBB(dDate) {

// Parameters : // dDate  : Date object // Returns : A string with the format ""mm/dd/yyyy"" or ""mm/dd/yyyy hh:mm:ss"" 

var sMonth = ToString(dDate.getMonth() + 1); 
if (sMonth.length == 1)
{
sMonth = ""0"" + sMonth;
} 
var sDay = ToString(dDate.getDate()); 
if (sDay.length == 1)
{
sDay = ""0"" + sDay;
} 
var sHours = ToString(dDate.getHours()); 
if (sHours.length == 1) 
{
sHours = ""0"" + sHours;
} 
var sMinutes = ToString(dDate.getMinutes());
if (sMinutes.length == 1)
{
sMinutes = ""0"" + sMinutes;
} 
var sSeconds = ToString(dDate.getSeconds());
if (sSeconds.length == 1) 
{
sSeconds = ""0"" + sSeconds;
} 
//return (sMonth +""/""+ sDay +""/"" + dDate.getFullYear()); //20150725000000
//return (dDate.getFullYear()+sMonth+sDay); //20150725000000
return (sDay +""/""+ sMonth +""/"" + dDate.getFullYear());//06/08/2016
}
function GenSMSList(psInputs,psOutputs)
{
var ProcessingType = psInputs.GetProperty(""ProcessingType"");
var BillingAccountId = psInputs.GetProperty(""BillingAccountId"");
var BatchId = psInputs.GetProperty(""BatchId"");

try
{

if(ProcessingType == ""ProcessAllRecords"")
{
	ProcessAllRecords(BillingAccountId);
}
if(ProcessingType == ""ProcessRenewalRecords"")
{
	ProcessRenewalRecords(BillingAccountId, BatchId);
}

}
catch(e)
{
	TheApplication().RaiseErrorText(e.toString());
	
}
}
function GetLOVDesc(Type, LIC)
{
	var vLOVType = Type;
	var vLIC = LIC;
	
	var vDesc ="""";
	var isRecord;
	var vBOLOV,vBCLOV;
	
	try
	{
		vBOLOV = TheApplication().GetBusObject(""List Of Values"");
	   	vBCLOV = vBOLOV.GetBusComp(""List Of Values"");
	   	
	
		with(vBCLOV)
	    {
		  	SetViewMode(3);
		    ActivateField(""Type"");
		  	ActivateField(""Description"");
		    ActivateField(""Name"");
		    ClearToQuery();
		    SetSearchSpec(""Type"",vLOVType);
		    SetSearchSpec(""Name"",vLIC);
		    ExecuteQuery(ForwardOnly);
		    isRecord = FirstRecord();
			if(isRecord != null)
			{  
		        vDesc = GetFieldValue(""Description"");  
			}   
			return(vDesc);				
		}
	}
	catch(e)
	{
		TheApplication().RaiseError(e.toString);
		return(vDesc);		
	}
	finally
	{
		vBOLOV = null;
		vBCLOV = null;
	
	}	
}
function GetLOVHigh(Type, LIC)
{
	var vLOVType = Type;
	var vLIC = LIC;
	
	var vDesc ="""";
	var isRecord;
	var vBOLOV,vBCLOV;
	
	try
	{
		vBOLOV = TheApplication().GetBusObject(""List Of Values"");
	   	vBCLOV = vBOLOV.GetBusComp(""List Of Values"");
	   	
	
		with(vBCLOV)
	    {
		  	SetViewMode(3);
		    ActivateField(""Type"");
		  	ActivateField(""High"");
		    ActivateField(""Name"");
		    ClearToQuery();
		    SetSearchSpec(""Type"",vLOVType);
		    SetSearchSpec(""Name"",vLIC);
		    ExecuteQuery(ForwardOnly);
		    isRecord = FirstRecord();
			if(isRecord != null)
			{  
		        vDesc = GetFieldValue(""High"");  
			}   
			return(vDesc);				
		}
	}
	catch(e)
	{
		TheApplication().RaiseError(e.toString);
		return(vDesc);		
	}
	finally
	{
		vBOLOV = null;
		vBCLOV = null;
	
	}	
}
function GetTimeStamp()
{
	var SysDate = Clib.time();
	var ObjDate = Date.fromSystem(SysDate); 

	var Month = ToString(ObjDate.getMonth()+1);
		if(Month.length == 1)   
			{
				Month = ""0"" + Month;
			}
	var Day = ToString(ObjDate.getDate());
		if(Day.length == 1)
			{
				Day = ""0"" + Day;
			}
	var Year = ToString(ObjDate.getFullYear());
	var Hour = ToString(ObjDate.getHours());
		if(Hour.length == 1)
			{
				Hour = ""0"" + Hour;
			}
	var Minute = ToString(ObjDate.getMinutes());
		if(Minute.length == 1)
			{
				Minute = ""0"" + Minute;
			}
	var Second = ToString(ObjDate.getSeconds()); 
		if(Second.length == 1)
			{
				Second = ""0"" + Second;
			}

	var now = Day+""""+Month+""""+Year+""""+Hour+""""+Minute+""""+Second; 

	return(now);
}
function GetValidityDaysList(validtyLovType, validityLovVal, validityDaysList, validityUnitList)
{
	var vLovName="""", vLovVal="""", vLovHigh="""", vLovDesc="""";
	var recordCount=-1, isRecord=false, searchExpr="""";
	var vBOLOV=null,vBCLOV=null;
	
	try
	{
		vBOLOV = TheApplication().GetBusObject(""List Of Values"");
	   	vBCLOV = vBOLOV.GetBusComp(""List Of Values"");
	   	
		with(vBCLOV)
	    {
		  	SetViewMode(3);
		    ActivateField(""Type"");
			ActivateField(""Value"");
			ActivateField(""Active"");
			ActivateField(""Name"");
			ActivateField(""High"");
			ActivateField(""Description"");
		    ClearToQuery();
			searchExpr=""[Type]='""+validtyLovType+""' AND [Value] LIKE '""+validityLovVal+""' AND [Active]='Y'"";
		    SetSearchExpr(searchExpr);
		    ExecuteQuery(ForwardOnly);
			recordCount = CountRecords();
		    isRecord = FirstRecord();
			while(isRecord)
			{  
		        vLovName = GetFieldValue(""Name"");
				vLovVal = GetFieldValue(""Value"");
				vLovHigh = GetFieldValue(""High"");
				vLovDesc = GetFieldValue(""Description"");
				validityDaysList[vLovName]=vLovHigh;
				validityUnitList[vLovName]=vLovDesc;
				isRecord = NextRecord();
			}   
			return(CancelOperation);				
		}
	}
	catch(e)
	{
		TheApplication().RaiseError(e.toString);		
	}
	finally
	{
		vBCLOV = null;
		vBOLOV = null;
	}

	return(CancelOperation);
}
function ProcessAllRecords(BillingAccountId)
{var vFileName,vFP;
var EndDateFormat = """";
var EndDateFormatSiebel = """";
var AppObj = TheApplication();
var BillAccBO = AppObj.GetBusObject(""STC Billing Account"");
var PreRegBC = BillAccBO.GetBusComp(""STC Business Prepaid Registration BC"");
var vMSISDN="""", ProdName="""";
var Spec = ""[Batch Id] = '"" + BillingAccountId + ""' AND [Status] = 'Open'"";
var isRec;
var vCommaFlag = ""0"";
var vFilePathLOV = ""STC_ADMIN"";
var vLIC = ""BUSPREREG"";
var ShFilePathLOV = ""STC_ADMIN"";
var ShLIC = ""STC_SHELL"";
var strError="""";
var strFilePath = GetLOVDesc(vFilePathLOV,vLIC);
var StrShell = GetLOVDesc(ShFilePathLOV,ShLIC);
var vDTime = GetTimeStamp();
var CurrDate = new Date();
var CurrDateSys = new Date(CurrDate);
var sysdateCurrDate = CurrDateSys.toSystem();
var ShProdExpiryLOV = ""STC_BUS_PRE_PROD_TYPE"";
var FileTxt="""";
var EndDate = """";						
						
try
{
		vFileName = ""CRM_BUSINESS_PREPAID_REGISTRATION""+ ""_""+ vDTime +"".txt"";
	//	vFP = Clib.fopen(""C:/"" + vFileName,""w"");
		vFP = Clib.fopen(strFilePath + vFileName,""w"");
		if(vFP != null)	// If vFP is NULL it means that File have not been created else continue Operation
   		{	
				with(PreRegBC)
				{
				ActivateField(""Status"");
				ActivateField(""MSISDN"");
				ActivateField(""Batch Id"");
				ActivateField(""STC Plan Name"");
				ActivateField(""STC Part Number"");
				ActivateField(""STC Plan Validity"");
				ActivateField(""STC Plan End Date"");
				SetViewMode(AllView);
				ClearToQuery();
			//	var Spec1 = ""[Batch Id] = '"" + BillingAccountId + ""' AND ([Status] = 'Pending' OR [Status] = 'Imported')"";//Mayank: Inactivated for Business Prepaid Feature		
				var Spec1 = ""[Batch Id] = '"" + BillingAccountId + ""' AND ([Status] = 'Pending' OR [Status] = 'Imported' OR [Status] = 'Open')"";	//Mayank: Activated for Business Prepaid Feature	
			//	SetSearchSpec(""Batch Id"", BillingAccountId);
			//	SetSearchSpec(""Status"", ""Pending"");
				SetSearchExpr(Spec1);
				ExecuteQuery(ForwardOnly);
				var BusReg = FirstRecord();	
				while(BusReg)
				{
				if(vCommaFlag == ""0"")
					{
					Clib.fputs(BillingAccountId, vFP);
					vCommaFlag = ""1"";
					}
					CurrDate = new Date();
					CurrDateSys = new Date(CurrDate);
					vMSISDN = GetFieldValue(""MSISDN"");
					ProdName = GetFieldValue(""STC Plan Name"");
					var vProductPartCode = GetFieldValue(""STC Part Number"");
					var Type = AppObj.InvokeMethod(""LookupValue"", ""STC_BUS_PRE_PROD_TYPE"",ProdName);
					var PARTCODE = AppObj.InvokeMethod(""LookupValue"", ""STC_BUS_PRE_PROD_PART"",ProdName);
					var SubStr = Type.substring(0,5);
					var StrProdExpDays = GetLOVDesc(ShProdExpiryLOV,ProdName);
					var StrProdLine = GetLOVHigh(ShProdExpiryLOV,ProdName);
					StrProdExpDays = ToNumber(StrProdExpDays)
					if(SubStr == ""BBBAR"")
					{
						EndDate = AddToDate(CurrDate, 0, StrProdExpDays, 0, 0, 0, +1);
						EndDateFormat = DateToStringBB(EndDate);
						EndDateFormatSiebel = DateToString(EndDate);
						Type = ""BBUnBar"";
						FileTxt = ""\n""+vMSISDN+"",""+Type+"",""+StrProdLine+"",""+PARTCODE+"",""+EndDateFormat;
						//FileTxt = ""\n""+vMSISDN+"",""+Type+"",""+StrProdExpDays+"",""+PARTCODE+"",""+EndDateFormat;
					}
					else
					{
						Type = ""Unbar"";
						FileTxt = ""\n""+vMSISDN+"",""+Type;
					}
					if(vCommaFlag == ""0"")
					{
						Clib.fputs(FileTxt, vFP);
					
					}    		    	     		    
					else if(vCommaFlag == ""1"")
					{
						Clib.fputs(FileTxt, vFP);
					}
					vCommaFlag = ""1"";
				
					SetFieldValue(""Status"", AppObj.InvokeMethod(""LookupValue"", ""STC_PREPAID_STATUS"", ""Submitted""));
					SetFieldValue(""STC Plan End Date"", EndDateFormatSiebel);
					SetFieldValue(""STC Part Number"", PARTCODE);
					WriteRecord();
   					BusReg = NextRecord();	
   				}// end of with
   				
   				
   				Clib.fputs(""\n""+""END;"",vFP); // Marking End Of File	
   			}
   			if(Clib.fclose(vFP) != 0)
			{
				strError = strError + ""****SMS file not closed****"";
			}
						Clib.system(StrShell+"" ""+vFileName); 
   		}
   		else
		{
			strError = strError + ""****Could not create SMS File****"";
		}
}
catch(e)
{
TheApplication().RaiseError(strError + e.toString());
}
finally //Releasing all the memory occupied by the objects
{
AppObj=null;
}

}
function ProcessRenewalRecords(BillingAccountId, BatchId)
{
/*[01Jul2015][NAVINR][CR: Business Prepaid Plan Renewal]*/
var vFileName="""",vFP=null, vFPLine="""";
var BillAccBO = null, PreRegBC = null;
var vFilePathLOV = ""STC_ADMIN"", vLIC = ""BUSPREREG""; 
var ShFilePathLOV = ""STC_ADMIN"", ShLIC = ""STC_SHELL"";
var strError="""", strFilePath = """", StrShell = """", vDTime = """";

var validtyLovType=""STC_PRESUBSIDY"", validityLovVal=""BUSPREPROVISION*"";
var validityDaysList:Array = new Array;
var validityUnitList:Array = new Array;
var searchExpr = """", Spec1="""", busPrepRegStatus="""";
var isRec=false;
var vMSISDN="""", vRequestType=""Renewal"", vProductPartCode="""", vPlanValidity="""", vPlanValidityNum=0, vPlanExpiry="""";
var vPlanExpiryDate = """", vPlanExpiryFile="""", nValidityUnit="""";
		
try
{
		busPrepRegStatus=TheApplication().InvokeMethod(""LookupValue"", ""STC_PREPAID_STATUS"", ""Submitted"");
		strFilePath = GetLOVDesc(vFilePathLOV,vLIC);
		StrShell = GetLOVDesc(ShFilePathLOV,ShLIC);
		vDTime = GetTimeStamp();
		vFileName = ""CRM_BUSINESS_PREPAID_RENEWAL""+ ""_""+ vDTime +"".txt"";
		if (strFilePath == """" || strFilePath == null)
			strFilePath = ""C:/Siebel/SiebelLog/"";
			
		vFP = Clib.fopen(strFilePath + vFileName,""w"");
		
		if(vFP != null)	// If vFP is NULL it means that File have not been created else continue Operation
   		{	
   			BillAccBO = TheApplication().GetBusObject(""STC Billing Account"");
			PreRegBC = BillAccBO.GetBusComp(""STC Business Prepaid Registration BC"");
			
			//To get the list of plan validity days from the ListOfValues.High:
			GetValidityDaysList(validtyLovType, validityLovVal, validityDaysList, validityUnitList);
			
			with(PreRegBC)
			{
				ActivateField(""Batch Id"");
				ActivateField(""Status"");
				ActivateField(""STC Selected Flag"");
				ActivateField(""MSISDN"");
				ActivateField(""STC Part Number"");
				ActivateField(""STC Plan Validity"");
				ActivateField(""STC Plan End Date"");
				SetViewMode(AllView);
				ClearToQuery();
				
				searchExpr=""[Batch Id] = '"" + BatchId + ""' AND [Status] = 'Open' AND [STC Selected Flag]='Y'"";
				SetSearchExpr(searchExpr);
				ExecuteQuery(ForwardOnly);
				isRec = FirstRecord();	
				
				if (isRec)
				{
					Clib.fputs(BatchId, vFP);
				}
				while(isRec)
				{
					vMSISDN = GetFieldValue(""MSISDN"");
					vProductPartCode = GetFieldValue(""STC Part Number"");
					vPlanValidity = validityDaysList[vProductPartCode];
					nValidityUnit = validityUnitList[vProductPartCode];
					if (vPlanValidity == """" || vPlanValidity == null || vPlanValidity == ""undefined"")
						vPlanValidity = ""365"";
					
					vPlanValidityNum = ToNumber(vPlanValidity);
					vPlanExpiry = AddToDateWrapper(new Date(), vPlanValidityNum, vPlanValidityNum, vPlanValidityNum, vPlanValidityNum, vPlanValidityNum, 1, nValidityUnit);
					vPlanExpiry = AddToDate(vPlanExpiry, 0, 1, 0, 0, 0, 1);
					//vPlanExpiryDate = Clib.strftime(vPlanExpiryDate, ""%m/%d/%Y %H:%M:%S"", Clib.localtime(new Date(vPlanExpiry).toSystem()));
					vPlanExpiryDate = Clib.strftime(vPlanExpiryDate, ""%m/%d/%Y"", Clib.localtime(new Date(vPlanExpiry).toSystem()));
					vPlanExpiryFile = Clib.strftime(vPlanExpiryFile, ""%d/%m/%Y"", Clib.localtime(new Date(vPlanExpiry).toSystem()));
					//vPlanExpiryFile = Clib.strftime(vPlanExpiryFile, ""%Y%m%d000000"", Clib.localtime(new Date(vPlanExpiry).toSystem()));
 		    	    vFPLine = ""\n""+vMSISDN+"",""+vRequestType+"",""+vPlanValidity+"",""+vProductPartCode+"",""+vPlanExpiryFile;
					Clib.fputs(vFPLine, vFP);
					
					SetFieldValue(""STC Plan Validity"", vPlanValidityNum);
					SetFieldValue(""STC Plan End Date"", vPlanExpiryDate);
					SetFieldValue(""Status"", busPrepRegStatus);
					WriteRecord();
					isRec = NextRecord();	
				}//end of while(isRec)
   				
   				Clib.fputs(""\n""+""END;"",vFP); // Marking End Of File	
   			}// end of with
   			
   			if(Clib.fclose(vFP) != 0)
			{
				strError = strError + ""****SMS file not closed****"";
			}
			
			Clib.system(StrShell+"" ""+vFileName); 
   		}//end of if(vFP != null)
   		else
		{
			strError = strError + ""****Could not create SMS File****"";
		}
}
catch(e)
{
	TheApplication().RaiseError(strError + e.toString());
}
finally //Releasing all the memory occupied by the objects
{
	vFP = null, validityDaysList=null, validityUnitList=null;
	PreRegBC = null;
	BillAccBO = null;
}

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""GenSMSList"")
	{
		GenSMSList(Inputs,Outputs);
		return(CancelOperation);
	}

	return (ContinueOperation);
}
function HandleMessage(Inputs,Outputs)
{
  var appObj;
  var bo_messageObject;
  var bc_messageTable;
  var errorCode;
  var errorMessage;
  var objectId;
  var objectName;
  var objectType;
  var operationObjectId;
  var UserLogin;
  var reqMessagestr;
  var respMessagestr;
  var rtmsg;
  	
  try
	{
		appObj = TheApplication();
	    UserLogin = appObj.LoginName();
		bo_messageObject = appObj.GetBusObject(""STC Error Handler"");
		bc_messageTable = bo_messageObject.GetBusComp(""STC Error Handler"");
		errorCode = Inputs.GetProperty(""Error Code"").substring(0, 50);
		errorMessage = Inputs.GetProperty(""Error Message"").substring(0, 2000);
		objectId = Inputs.GetProperty(""Object Id"").substring(0, 20);
		objectName = Inputs.GetProperty(""Object Name"").substring(0, 250);
		operationObjectId = Inputs.GetProperty(""Siebel Operation Object Id"").substring(0, 20);
		objectType = Inputs.GetProperty(""Object Type"").substring(0, 50);
		reqMessagestr = Inputs.GetProperty(""Siebel Message Request Text"").substring(0, 2000);
		respMessagestr = Inputs.GetProperty(""Siebel Message Response Text"").substring(0, 2000);
		
		// Write the record to the message log table
		with(bc_messageTable)
		{
			NewRecord(NewAfter);
			SetFieldValue(""Error Code"", errorCode);
			SetFieldValue(""Error Message"", errorMessage);
			SetFieldValue(""Object Id"", objectId);
			SetFieldValue(""Object Name"", objectName);
			SetFieldValue(""Operation Object Id"", operationObjectId);
			SetFieldValue(""Object Type"", objectType);		
			SetFieldValue(""Login"",UserLogin);
			SetFieldValue(""Message Request"",reqMessagestr);
			SetFieldValue(""Message Response"",respMessagestr);
					
			WriteRecord();
		}		
	}	
	catch(e)
	{
	rtmsg = ""Runtime Error "" + e.errCode + "": "" + e.errText + ""."";
    appObj.RaiseErrorText(rtmsg.substring(0, 512));
	}
	finally
	{
	bc_messageTable = null;
	bo_messageObject = null;
	appObj = null;
	}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	var ireturn;
	try
	{
		ireturn = ContinueOperation;
		switch(MethodName)
		{
			case ""Log Message"":
				HandleMessage(Inputs, Outputs);		
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
function CheckValue(Inputs, Outputs)
{
	var vLOVType = Inputs.GetProperty(""LOVType"");
	var vLOVLIC = Inputs.GetProperty(""LOVLIC"");
	var vLOVVal = TheApplication().InvokeMethod(""LookupValue"",vLOVType,vLOVLIC);
	var vAmount = Inputs.GetProperty(""Amount"");
	var vLOVValue: Number = ToNumber(vLOVVal);
	var vAmt: Number = ToNumber(vAmount);
	if(vAmt <= vLOVValue)
	Outputs.SetProperty(""LOVValue"",""True"");
	else
	Outputs.SetProperty(""LOVValue"",""False"");
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	switch(MethodName)
	{
		case ""STCLookUpValue"":	
		var vLOVType = Inputs.GetProperty(""LOVType"");
		var vLOVLIC = Inputs.GetProperty(""LOVLIC"");
		var vLOVValue = TheApplication().InvokeMethod(""LookupValue"",vLOVType,vLOVLIC);
		Outputs.SetProperty(""LOVValue"",vLOVValue);
		return(CancelOperation);
		break;
		
		case ""STCCheckLimit"":
		CheckValue(Inputs, Outputs);
		return(CancelOperation);
		break;
		
		default:
		break;
	}
	return (ContinueOperation);
}
function LogException(e)
{

	var appObj;
  	var Input;
  	var Output;
  	var CallMessageHandler; 
	try
 	{
		  appObj = TheApplication();
		  Input = appObj.NewPropertySet();
		  Output = appObj.NewPropertySet();
		  CallMessageHandler = appObj.GetService(""STC Generic Error Handler""); 
		  Input.SetProperty(""Error Code"", e.errCode);
		  Input.SetProperty(""Error Message"", e.errText);
		  Input.SetProperty(""Object Name"", ""STC Gneric Parse BS"");
		  Input.SetProperty(""Object Type"", ""Buisness Service"");
		  CallMessageHandler.InvokeMethod(""Log Message"", Input, Output);
 	}
 	catch(e)
 	{
  		
 	}
 	finally
 	{
 
		  CallMessageHandler = null;
		  Output = null;
		  Input = null;
		  appObj = null;
 	}
}
function ParseGeneric(Inputs,Outputs)
{
	var appObj;
	var psParent;
	var psChild;
	var strchild;
	var iRecordCount;
	var sDilimiter;
	var sSharedGlobalName;
	var sTotal;
	var i;
	var j;
	var sChildType;
	var iChildCount;
	var sPath;
	var sPathgrandchild;
	var iPathLen;
	var aPath;
	var aPathchild;
	var k =0;
	var l;
	var bValidFlag = ""True"";
	var ilistgrandchildcount;
	var igrandchildcount;
	var serrormessage = """";
	try
	{
			appObj = TheApplication(); 
			psParent = appObj.NewPropertySet();			
			sDilimiter = Inputs.GetProperty(""RecordDelimiter"");
			sSharedGlobalName = Inputs.GetProperty(""SharedGlobalName"");
			sTotal = """";
			Outputs.SetProperty(""RecordCount"", """");
			sPath = ""InputMessage;ListOfSoapOutput;SoapOuput"";
			aPath = new Array;
			aPath = sPath.split("";"");
			iPathLen = aPath.length;
			Outputs.SetProperty(""OutputMessage"", serrormessage);	
			
			if(Inputs.GetChildCount()>0)
				psParent =	Inputs.GetChild(0);
			
			while(k<iPathLen)//[getting the hierarchy upto: ListOfChild]
			{
				iChildCount = psParent.GetChildCount();
				if(iChildCount > 0)
					{
						sChildType = psParent.GetType();
						if(sChildType == aPath[k])
							psParent = psParent.GetChild(0); //[getting the hierarchy upto: Child]
						else
							{
								bValidFlag = ""False"";
								serrormessage = ""Hierarchy Mismatch"";
								break;
							}
					}//end if(iChildCount > 0)
				else
					{
						bValidFlag = ""False"";
						serrormessage = ""Tag: "" + aPath[k] + ""Not Found"";
						break;
					}
						
				k++;
			
			}//while(k<3)
			
			iChildCount = psParent.GetChildCount(); //[getting the child count]
			iRecordCount = iChildCount;
			for (i = 0; i< iChildCount; i++)//[if child exists looping all childs]
			{
					strchild = """";
					strchild =  psParent.GetChild(i).GetProperty(""OutputString1"");
					ilistgrandchildcount = psParent.GetChild(i).GetChildCount();
					if(ilistgrandchildcount != 0)
					{
						sPathgrandchild = ""Child;ListOflistOfGrandChild;listOfGrandChild"";
						aPathchild = new Array;
						aPathchild = sPathgrandchild.split("";"");
						iPathLen = aPathchild.length;
						psChild = psParent.GetChild(i);
						l =0;
						while(l<iPathLen) //[getting the hierarchy upto: ListOfGrandChild]
						{
							igrandchildcount = psChild.GetChildCount();
							if(igrandchildcount > 0)
								{
									sChildType = psChild.GetType();
									if(sChildType == aPathchild[l])
										psChild = psChild.GetChild(0);//[getting the hierarchy upto: GrandChild]
									else
										{
											bValidFlag = ""False"";
											serrormessage = ""Hierarchy Mismatch"";
											break;
										}
								}//
							else
								{
									bValidFlag = ""False"";
									serrormessage = ""Tag: "" + aPathchild[l] + ""Not Found"";
									break;
								}
						
							l++;
						}//end while
						igrandchildcount = psChild.GetChildCount();

						for (j = 0; j < igrandchildcount; j++)
						{
							strchild = strchild + ""^"" + psChild.GetChild(j).GetProperty(""OutputString"") ;
						}//end For(j)
					}//endif(ilistgrandchildcount != 0)
			sTotal = sTotal + strchild + sDilimiter;				

			}//For(i)	
			Outputs.SetProperty(""RecordCount"", iRecordCount);// [setting ""RecordCount"" used in calling workflow]
			Outputs.SetProperty(""OutputMessage"", serrormessage);// [setting ""OutputMessage"" if any of the hierarchy is missing in the response xml]
			if(sTotal != """")
				appObj.SetSharedGlobal(sSharedGlobalName, sTotal);
	    } 
	catch(e)
	{	
	  LogException(e);
	}
	finally
	{
		psParent = null;
		aPath = null;
		aPathchild = null;
		psChild = null;
		appObj = null;
	}//end of finally
}
function ParseGeneric(Inputs,Outputs)
{
	var appObj;
	var psParent;
	var psChild;
	var strchild;
	var iRecordCount;
	var sDilimiter;
	var sSharedGlobalName;
	var sTotal;
	var i;
	var j;
	var sChildType;
	var iChildCount;
	var sPath;
	var sPathgrandchild;
	var iPathLen;
	var aPath;
	var aPathchild;
	var k =0;
	var l;
	var bValidFlag = ""True"";
	var ilistgrandchildcount;
	var igrandchildcount;
	var serrormessage = """";
	try
	{
			appObj = TheApplication(); 
			psParent = appObj.NewPropertySet();			
			sDilimiter = Inputs.GetProperty(""RecordDelimiter"");
			sSharedGlobalName = Inputs.GetProperty(""SharedGlobalName"");
			sTotal = """";
			Outputs.SetProperty(""RecordCount"", """");
			sPath = ""InputMessage;ListOfSoapOutput;SoapOuput"";
			aPath = new Array;
			aPath = sPath.split("";"");
			iPathLen = aPath.length;
			Outputs.SetProperty(""OutputMessage"", serrormessage);	
			
			if(Inputs.GetChildCount()>0)
				psParent =	Inputs.GetChild(0);
			
			while(k<iPathLen)//[getting the hierarchy upto: ListOfChild]
			{
				iChildCount = psParent.GetChildCount();
				if(iChildCount > 0)
					{
						sChildType = psParent.GetType();
						if(sChildType == aPath[k])
							psParent = psParent.GetChild(0); //[getting the hierarchy upto: Child]
						else
							{
								bValidFlag = ""False"";
								serrormessage = ""Hierarchy Mismatch"";
								break;
							}
					}//end if(iChildCount > 0)
				else
					{
						bValidFlag = ""False"";
						serrormessage = ""Tag: "" + aPath[k] + ""Not Found"";
						break;
					}
						
				k++;
			
			}//while(k<3)
			
			iChildCount = psParent.GetChildCount(); //[getting the child count]
			iRecordCount = iChildCount;
			for (i = 0; i< iChildCount; i++)//[if child exists looping all childs]
			{
					strchild = """";
					strchild =  psParent.GetChild(i).GetProperty(""OutputString1"");
					ilistgrandchildcount = psParent.GetChild(i).GetChildCount();
					if(ilistgrandchildcount != 0)
					{
						sPathgrandchild = ""Child;ListOflistOfGrandChild;listOfGrandChild"";
						aPathchild = new Array;
						aPathchild = sPathgrandchild.split("";"");
						iPathLen = aPathchild.length;
						psChild = psParent.GetChild(i);
						l =0;
						while(l<iPathLen) //[getting the hierarchy upto: ListOfGrandChild]
						{
							igrandchildcount = psChild.GetChildCount();
							if(igrandchildcount > 0)
								{
									sChildType = psChild.GetType();
									if(sChildType == aPathchild[l])
										psChild = psChild.GetChild(0);//[getting the hierarchy upto: GrandChild]
									else
										{
											bValidFlag = ""False"";
											serrormessage = ""Hierarchy Mismatch"";
											break;
										}
								}//
							else
								{
									bValidFlag = ""False"";
									serrormessage = ""Tag: "" + aPathchild[l] + ""Not Found"";
									break;
								}
						
							l++;
						}//end while
						igrandchildcount = psChild.GetChildCount();

						for (j = 0; j < igrandchildcount; j++)
						{
							strchild = strchild + ""^"" + psChild.GetChild(j).GetProperty(""OutputString"") ;
						}//end For(j)
					}//endif(ilistgrandchildcount != 0)
			sTotal = sTotal + strchild + sDilimiter;				

			}//For(i)	
			Outputs.SetProperty(""RecordCount"", iRecordCount);// [setting ""RecordCount"" used in calling workflow]
			Outputs.SetProperty(""OutputMessage"", serrormessage);// [setting ""OutputMessage"" if any of the hierarchy is missing in the response xml]
			if(sTotal != """")
			{
				appObj.SetSharedGlobal(sSharedGlobalName, sTotal);
				Outputs.SetProperty(sSharedGlobalName, sTotal);
			}
	    } 
	catch(e)
	{	
	  LogException(e);
	}
	finally
	{
		psParent = null;
		aPath = null;
		aPathchild = null;
		psChild = null;
		appObj = null;
	}//end of finally
}
function ParseGrandChildCustom(Inputs,Outputs)
{
	var appObj;
	var psParent;
	var psChild;
	var strchild = """";
	var strParent= """";
	var iRecordCount = 0;
	var sDilimiter;
	var sTotalParent= """";
	var sTotalChild = """";
	var i;
	var j;
	var sChildType;
	var iChildCount;
	var sPath;
	var sPathgrandchild;
	var iPathLen;
	var aPath;
	var aPathchild;
	var k =0;
	var l;
	var bValidFlag = ""True"";
	var ilistgrandchildcount;
	var igrandchildcount;
	var serrormessage = """";
	var	iParent_i_ChildCount;
	var p;
	
	try
	{
			appObj = TheApplication(); 
			psParent = appObj.NewPropertySet();			
			sDilimiter = Inputs.GetProperty(""RecordDelimiter"");
			
			Outputs.SetProperty(""RecordCount"", iRecordCount);
			sPath = ""InputMessage;ListOfSoapOutput;SoapOuput"";
			aPath = new Array;
			aPath = sPath.split("";"");
			iPathLen = aPath.length;
			Outputs.SetProperty(""OutputMessage"", serrormessage);	
			
			if(Inputs.GetChildCount()>0)
				psParent =	Inputs.GetChild(0);
			
			while(k<iPathLen)//[getting the hierarchy upto: ListOfChild]
			{
				iChildCount = psParent.GetChildCount();
				if(iChildCount > 0)
					{
						sChildType = psParent.GetType();
						if(sChildType == aPath[k])
							psParent = psParent.GetChild(0); //[getting the hierarchy upto: Child]
						else
							{
								bValidFlag = ""False"";
								serrormessage = ""Hierarchy Mismatch"";
								break;
							}
					}//end if(iChildCount > 0)
				else
					{
						bValidFlag = ""False"";
						serrormessage = ""Tag: "" + aPath[k] + ""Not Found"";
						break;
					}
						
				k++;
			
			}//while(k<3)
			
			iChildCount = psParent.GetChildCount(); //[getting the child count]
			iRecordCount = iChildCount;
			for (i = 0; i< iChildCount; i++)//[if child exists looping all childs]
			{				
					strParent = strParent + psParent.GetChild(i).GetProperty(""OutputString1"") + sDilimiter; // To get Parent Record string
					ilistgrandchildcount = psParent.GetChild(i).GetChildCount();
					if(ilistgrandchildcount != 0)
					{
						sPathgrandchild = ""listOfGrandChild;ListOfGrandchild"";
						aPathchild = new Array;
						aPathchild = sPathgrandchild.split("";"");
						iPathLen = aPathchild.length;
						if(psParent.GetChildCount()>0)
						{
							if(psParent.GetChild(i).GetChildCount()>0)
							iParent_i_ChildCount = psParent.GetChild(i).GetChild(0).GetChildCount();
							
							for (p = 0;p<iParent_i_ChildCount ; p++) 
								{
									psChild = psParent.GetChild(i).GetChild(0).GetChild(p);
									//psChild = psParent.GetChild(i);
									l =0;
									while(l<iPathLen) //[getting the hierarchy upto: ListOfGrandChild]
									{
										igrandchildcount = psChild.GetChildCount();
										if(igrandchildcount > 0)
											{
												sChildType = psChild.GetType();
												if(sChildType == aPathchild[l])
													psChild = psChild.GetChild(0);//[getting the hierarchy upto: GrandChild]
												else
													{
														bValidFlag = ""False"";
														serrormessage = ""Hierarchy Mismatch"";
														break;
													}
											}//
										else
											{
												bValidFlag = ""False"";
												serrormessage = ""Tag: "" + aPathchild[l] + ""Not Found"";
												break;
											}
									
										l++;
									}//end while
									//igrandchildcount = psChild.GetChildCount();
									strchild = strchild + psChild.GetChild(0).GetProperty(""OutputString"") + sDilimiter ;// To get Child Record string
								
								}//for(p)
						}//if(psParent.GetChildCount()>0)
					}//endif(ilistgrandchildcount != 0)			

			}//For(i)	
		
			Outputs.SetProperty(""RecordCount"", iRecordCount);// [setting ""RecordCount"" used in calling workflow]
			Outputs.SetProperty(""ChildData"", strchild);// Setting Child String
			Outputs.SetProperty(""ParentData"", strParent);//Setting Parent string
			Outputs.SetProperty(""OutputMessage"", serrormessage);// [setting ""OutputMessage"" if any of the hierarchy is missing in the response xml]						
		  	
    } 
	catch(e)
	{	
	  LogException(e);
	}
	finally
	{
		psParent = null;
		aPath = null;
		aPathchild = null;
		psChild = null;
		appObj = null;
	}//end of finally
}
function ParseGrandchild(Inputs,Outputs)
{

	var appObj;
	var psParent;
	var psChild;
	var strchild = """";
	var strParent= """";
	var iRecordCount = 0;
	var sDilimiter;
	var sTotalParent= """";
	var sTotalChild = """";
	var i;
	var j;
	var sChildType;
	var iChildCount;
	var sPath;
	var sPathgrandchild;
	var iPathLen;
	var aPath;
	var aPathchild;
	var k =0;
	var l;
	var bValidFlag = ""True"";
	var ilistgrandchildcount;
	var igrandchildcount;
	var serrormessage = """";
	var	iParent_i_ChildCount;
	var p;
	var pstest;
	var psChild2;
	try
	{
			appObj = TheApplication(); 
			psParent = appObj.NewPropertySet();	
			pstest = appObj.NewPropertySet();	
			sDilimiter = Inputs.GetProperty(""RecordDelimiter"");
			Outputs.SetProperty(""RecordCount"", iRecordCount);
			sPath = ""InputMessage;ListOfSoapOutput;SoapOuput"";
			aPath = new Array;
			aPath = sPath.split("";"");
			iPathLen = aPath.length;
			Outputs.SetProperty(""OutputMessage"", serrormessage);	
			
			if(Inputs.GetChildCount()>0)
				psParent =	Inputs.GetChild(0);
			
			while(k<iPathLen)//[getting the hierarchy upto: ListOfChild]
			{
				iChildCount = psParent.GetChildCount();
				if(iChildCount > 0)
					{
						sChildType = psParent.GetType();
						if(sChildType == aPath[k])
							psParent = psParent.GetChild(0); //[getting the hierarchy upto: Child]
						else
							{
								bValidFlag = ""False"";
								serrormessage = ""Hierarchy Mismatch"";
								break;
							}
					}//end if(iChildCount > 0)
				else
					{
						bValidFlag = ""False"";
						serrormessage = ""Tag: "" + aPath[k] + ""Not Found"";
						break;
					}
						
				k++;
			
			}//while(k<3)
			psParent =	Inputs.GetChild(0);
			iChildCount = psParent.GetChild(0).GetChildCount(); //[getting the child count]
			iRecordCount = iChildCount;
			pstest = psParent.GetChild(0);
			//for(var m=1;m<iRecordCount;m++)
			//{
			//strParent = strParent + pstest.GetChild(m).GetChild(0).GetChild(0).GetProperty(""OutputString1"") + sDilimiter;
			for (i = 0; i< iChildCount; i++)//[if child exists looping all childs]
			{				
					strParent = strParent + pstest.GetChild(i).GetChild(0).GetChild(0).GetProperty(""OutputString1"") + sDilimiter; // To get Parent Record string
					ilistgrandchildcount = pstest.GetChild(i).GetChildCount();
					if(ilistgrandchildcount != 0)
					{
						/*sPathgrandchild = ""ListOflistOfGrandChild"";
						aPathchild = new Array;
						aPathchild = sPathgrandchild.split("";"");
						iPathLen = aPathchild.length;*/
						if(pstest.GetChildCount()>0)
						{
							if(pstest.GetChild(i).GetChildCount()>0)
							iParent_i_ChildCount = pstest.GetChild(i).GetChild(0).GetChild(0).GetChild(0).GetChildCount();
							
							for (p = 0;p<iParent_i_ChildCount ; p++) 
								{
									psChild = pstest.GetChild(i).GetChild(0).GetChild(0).GetChild(0).GetChild(p);
									//psChild = psParent.GetChild(i);
									/*l =0;
									while(l<iPathLen) //[getting the hierarchy upto: ListOfGrandChild]
									{
										igrandchildcount = psChild.GetChildCount();
										if(igrandchildcount > 0)
											{
												sChildType = psChild.GetType();
												if(sChildType == aPathchild[l])
													psChild = psChild.GetChild(0);//[getting the hierarchy upto: GrandChild]
												else
													{
														bValidFlag = ""False"";
														serrormessage = ""Hierarchy Mismatch"";
														break;
													}
											}//
										else
											{
												bValidFlag = ""False"";
												serrormessage = ""Tag: "" + aPathchild[l] + ""Not Found"";
												break;
											}
									
										l++;
									}//end while*/
									//igrandchildcount = psChild.GetChildCount();
									strchild = strchild + psChild.GetChild(0).GetChild(0).GetProperty(""OutputString"") + sDilimiter ;// To get Child Record string
								
								}//for(p)
						}//if(psParent.GetChildCount()>0)
					}//endif(ilistgrandchildcount != 0)			

			}//For(i)	
			Outputs.SetProperty(""RecordCount"", iRecordCount);// [setting ""RecordCount"" used in calling workflow]
			Outputs.SetProperty(""ChildData"", strchild);// Setting Child String
			Outputs.SetProperty(""ParentData"", strParent);//Setting Parent string
			Outputs.SetProperty(""OutputMessage"", serrormessage);// [setting ""OutputMessage"" if any of the hierarchy is missing in the response xml]						
		  	
    } 
	catch(e)
	{	
	  LogException(e);
	}
	finally
	{
		psParent = null;
		aPath = null;
		aPathchild = null;
		psChild = null;
		appObj = null;
	}//end of finally
}
function ParseUsageDetails(Inputs,Outputs)
{
	var appObj;
	var psParent;
	var pstest;
	var psChild;
	var strchild;
	var iRecordCount;
	var sDilimiter;
	var sSharedGlobalName;
	var sTotal;
	var i;
	var j;
	var sChildType;
	var iChildCount;
	var sPath;
	var sPathgrandchild;
	var iPathLen;
	var aPath;
	var aPathchild;
	var k =0;
	var l;
	var bValidFlag = ""True"";
	var ilistgrandchildcount;
	var igrandchildcount;
	var serrormessage = """";
	try
	{
			appObj = TheApplication(); 
			psParent = appObj.NewPropertySet();	
			pstest = appObj.NewPropertySet();		
			sDilimiter = Inputs.GetProperty(""RecordDelimiter"");
			sSharedGlobalName = Inputs.GetProperty(""SharedGlobalName"");
			sTotal = """";
			Outputs.SetProperty(""RecordCount"", """");
			sPath = ""InputMessage;ListOfSoapOutput;SoapOuput"";
			aPath = new Array;
			aPath = sPath.split("";"");
			iPathLen = aPath.length;
			Outputs.SetProperty(""OutputMessage"", serrormessage);	
			
			if(Inputs.GetChildCount()>0)
				psParent =	Inputs.GetChild(0);
			
			while(k<iPathLen)//[getting the hierarchy upto: ListOfChild]
			{
				iChildCount = psParent.GetChildCount();
				if(iChildCount > 0)
					{
						sChildType = psParent.GetType();
						if(sChildType == aPath[k])
							psParent = psParent.GetChild(0); //[getting the hierarchy upto: Child]
						else
							{
								bValidFlag = ""False"";
								serrormessage = ""Hierarchy Mismatch"";
								break;
							}
					}//end if(iChildCount > 0)
				else
					{
						bValidFlag = ""False"";
						serrormessage = ""Tag: "" + aPath[k] + ""Not Found"";
						break;
					}
						
				k++;
			
			}//while(k<3)
			
			psParent =	Inputs.GetChild(0);
			iChildCount = psParent.GetChild(0).GetChildCount();
			//iChildCount = psParent.GetChildCount(); //[getting the child count]
			//iRecordCount = iChildCount;
			pstest = psParent.GetChild(0);
			for (i = 0; i< iChildCount; i++)//[if child exists looping all childs]
			{
					strchild = """";
					strchild = pstest.GetChild(i).GetChild(0).GetChild(0).GetProperty(""OutputString1"");
					/*ilistgrandchildcount = psParent.GetChild(i).GetChildCount();
					if(ilistgrandchildcount != 0)
					{
						sPathgrandchild = ""Child;ListOflistOfGrandChild;listOfGrandChild"";
						aPathchild = new Array;
						aPathchild = sPathgrandchild.split("";"");
						iPathLen = aPathchild.length;
						psChild = psParent.GetChild(i);
						l =0;
						while(l<iPathLen) //[getting the hierarchy upto: ListOfGrandChild]
						{
							igrandchildcount = psChild.GetChildCount();
							if(igrandchildcount > 0)
								{
									sChildType = psChild.GetType();
									if(sChildType == aPathchild[l])
										psChild = psChild.GetChild(0);//[getting the hierarchy upto: GrandChild]
									else
										{
											bValidFlag = ""False"";
											serrormessage = ""Hierarchy Mismatch"";
											break;
										}
								}//
							else
								{
									bValidFlag = ""False"";
									serrormessage = ""Tag: "" + aPathchild[l] + ""Not Found"";
									break;
								}
						
							l++;
						}//end while
						igrandchildcount = psChild.GetChildCount();

						for (j = 0; j < igrandchildcount; j++)
						{
							strchild = strchild + ""^"" + psChild.GetChild(j).GetProperty(""OutputString"") ;
						}//end For(j)
					}//endif(ilistgrandchildcount != 0)*/
			sTotal = sTotal + strchild + sDilimiter;				

			}//For(i)	
			Outputs.SetProperty(""RecordCount"", iRecordCount);// [setting ""RecordCount"" used in calling workflow]
			Outputs.SetProperty(""OutputMessage"", serrormessage);// [setting ""OutputMessage"" if any of the hierarchy is missing in the response xml]
			if(sTotal != """")
				appObj.SetSharedGlobal(sSharedGlobalName, sTotal);
	    } 
	catch(e)
	{	
	  LogException(e);
	}
	finally
	{
		psParent = null;
		aPath = null;
		aPathchild = null;
		psChild = null;
		appObj = null;
	}//end of finally
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
var iReturn;
try
{

	iReturn = ContinueOperation;
	switch(MethodName)
	{

		case ""ParseGeneric"":
			ParseGeneric(Inputs,Outputs);
			iReturn = CancelOperation;
			break;
		case ""ParseUsageDetails"":
			ParseUsageDetails(Inputs,Outputs);
			iReturn = CancelOperation;
			break;
		case ""ParseGrandchild"":
			ParseGrandchild(Inputs,Outputs);
			iReturn = CancelOperation;
			break;
		case ""ParseGrandChildCustom"":
			ParseGrandChildCustom(Inputs,Outputs);
			iReturn = CancelOperation;
			break;
    	default:
          iReturn = ContinueOperation;
          break;
	}

	return (iReturn);
 } //end of try
 catch(e)
	{	
	   LogException(e);
	}
 finally
	{
	}
}
var vIsDevice = "No";
function AddMonths(StartDate,getmonths,inpTimeStamp,iMinsToAdd)
{
//for now just add flat hours
//Thu Dec 24 2009 15:08:31 GMT       - date object of script
//12/24/2009 15:08:31                - siebel field value in text form
var Accept;
var allowDT = """";
 var dtInp = new Date(StartDate);
 var strdate = new Date(); 
 //var strStatusChangeDate = (strdate.getMonth()+1) + ""/"" + strdate.getDate() + ""/"" + strdate.getFullYear();// + "" "" + strdate.getHours() + "":"" + strdate.getMinutes() + "":"" + strdate.getSeconds();
 var strStatusChangeDate = (strdate.getMonth()+1) + ""/"" + strdate.getDate() + ""/"" + strdate.getFullYear()+ ""00""+"":""+ ""00""+"":""+""00"";
dtInp.setMonth(dtInp.getMonth() + ToNumber(getmonths));
var aNewTime = ToNumber(strdate.getTime()); 
 var dtOp = (1+dtInp.getMonth()) + ""/"" + dtInp.getDate() + ""/"" + dtInp.getFullYear() +"" ""+ ""00""+"":""+ ""00""+"":""+""00"";
 var date = new Date(dtOp);
 var aNewExtime = ToNumber(date.getTime());
  var diff = (aNewExtime - aNewTime);  
if(aNewExtime > aNewTime)
{
Accept =true;
}
else
{
Accept=false;
}
return (Accept)
}
function AgeonNetwork(Inputs,Outputs)
{
//var AppObj=TheApplication(); 
var AccountId =Inputs.GetProperty(""AccountId"");
var ObjectId1 =Inputs.GetProperty(""Object Id"");
var PlanCat= Inputs.GetProperty(""PlanCat"");
var Masterid, vContractCat, vType= ""OCCUPATION"", sServiceType;
var TwoYrMonths, ThrYrMonths;
var ListBO=null, ListBC=null, AccountBO=null, AccountBC=null;  
var oInvoiceBO=null, oInvoiceBC=null, oCustomBO=null, oCustomBC=null, oCustomBC2=null, isRecord1;
var dCurrDate,sSysdate,Contractcat,NumLineCalc,NumLines,Occupation,AccStartDate,sDiffTime,sDiffTime1= ""0"";
var ExisCust, ExisIns, NewCust, NewIns;
var BadCus,DunnDate,ContractCat;
var NumMonths,NumEligCon=0, dunflg=""N"";
var DunniDays = TheApplication().InvokeMethod(""LookupValue"",""STC_CC_DUN"",""CCBADDays"");
var sMaxNumMonths; //Customer Classification-Adjustments SD
//TheApplication().SetProfileAttr(""CreateAct"",""Yes"");
try
{  
	//vIsDevice = CheckDevice(ObjectId1); // 22/10/2014 Anchal: Created to Set Installment as 0 for Basic Plans without Installment Product for Advance Payment Calculation
	ListBO = TheApplication().GetBusObject(""List Of Values"");
	ListBC = ListBO.GetBusComp(""List Of Values"");
	AccountBO=TheApplication().GetBusObject(""Account"");
	AccountBC=AccountBO.GetBusComp(""Account""); 
	oInvoiceBO=TheApplication().GetBusObject(""STC Billing Account"");
	oInvoiceBC=oInvoiceBO.GetBusComp(""CUT Invoice Sub Accounts"");
	oCustomBO =TheApplication().GetBusObject(""STC Custmer Admin BO"");
	oCustomBC=oCustomBO.GetBusComp(""STC Custmer Admin BC"");
	dCurrDate = new Date(); 
	sSysdate = dCurrDate.getTime();

	/*[01Nov2015][NAVINR][SD: Customer Classification Device Category]*/
	oCustomBC2=oCustomBO.GetBusComp(""STC Custmer Admin BC"");
	var DeviceCat= Inputs.GetProperty(""DeviceCat"");
	var vDefaultDeviceCat = 1, ContractCat1="""", vDefaultPlanCat=1;
	if (DeviceCat=="""" || DeviceCat == null)
		DeviceCat = vDefaultDeviceCat;

	if (PlanCat=="""" || PlanCat == null)
		PlanCat = vDefaultPlanCat;

	with(AccountBC)
	{
		SetViewMode(AllView);
		ActivateField(""Tax ID Number"");
		ActivateField(""Survey Type"");
		ActivateField(""Input On"");
		ActivateField(""STC Num Sub"");  
		// ActivateField(""STC Num of Lines"");
		ActivateField(""STC Contract Category""); 
		ActivateField(""Account Created""); 
		// ActivateField(""STC Num of Inst""); SUMANK Inactivated as this field is not part of Account BC
		ActivateField(""Household Head Occupation"");
		ActivateField(""STC Account Created Date"");
		ActivateField(""STC CAN Susp Date""); 
		ActivateField(""STC CAN Susp Reason"");
		ClearToQuery();
		SetSearchSpec(""Id"",AccountId);
		ExecuteQuery(ForwardOnly);
		isRecord = FirstRecord(); 
		if(isRecord)
		{
			Contractcat = GetFieldValue(""STC Contract Category"");
			NumLineCalc =GetFieldValue(""STC Num Sub"");
			// NumLines =GetFieldValue(""STC Num of Lines"");
			Occupation =GetFieldValue(""Household Head Occupation"");
			///Praveen Customer Clasifaction
			AccStartDate =GetFieldValue(""STC Account Created Date"");
			if(AccStartDate == null || AccStartDate == '' || AccStartDate == """")
			{
				AccStartDate = new Date();
			}
			DunnDate=GetFieldValue(""STC CAN Susp Date"");
			/////////////////////////////////////
			if(AccStartDate!=""""){
				AccStartDate = new Date(AccStartDate);
				AccStartDate = AccStartDate.getTime();
				sDiffTime = sSysdate - AccStartDate;
				sDiffTime1=sDiffTime/86400000; 
				sDiffTime1=sDiffTime1/30;
				sDiffTime1=Math.round(sDiffTime1); 
			}//endif AccStartDate!=""""

			if(DunnDate!=""""){ 
				DunnDate=new Date(DunnDate);
				DunnDate=DunnDate.getTime();
				DunnDate=sSysdate-DunnDate;
				DunnDate=DunnDate/86400000;
				DunnDate=Math.round(DunnDate);
			}//endif DunnDate
			
			with(ListBC){
				ActivateField(""Type"");    //Type
				ActivateField(""Value"");   //Display Value
				ActivateField(""Name"");    //Language Independent Code
				ActivateField(""High"");
				ActivateField(""Low"");
				ActivateField(""Description"");// Description
				ClearToQuery();
				SetViewMode(AllView);  
				SetSearchSpec(""Type"",vType);
				SetSearchSpec(""Value"",Occupation);        
				ExecuteQuery(ForwardOnly);
				var isRecord = FirstRecord();
				if(isRecord){
					ContractCat1 =GetFieldValue(""Low"");
				}
				//NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,ObjectId1);
			}//withlistbc
			with(oCustomBC){
				SetViewMode(AllView);
				ActivateField(""Contract Category"");
				ActivateField(""Exis Cust"");
				ActivateField(""Exis Inst"");
				ActivateField(""New Cust"");
				ActivateField(""New Inst"");
				ActivateField(""Bad Customer"");
				ActivateField(""Number Of Months"");     
				ActivateField(""Old Cust"");
				ActivateField(""Old Inst"");
				//Added for Customer Classification-Adjustments SD below
				ActivateField(""Max Number Of Months""); 
				ActivateField(""Old Customer Devices"");
				ActivateField(""Old Customer Installments"");
				//below 1.0
				ActivateField(""STC Three Year Inst"");
				ActivateField(""STC Three Year Devices"");
				ActivateField(""STC Two Year Devices"");
				ActivateField(""STC Two Year Inst"");
				ActivateField(""STC Three Year Month"");
				ActivateField(""STC Two Year Month"");
				//above 1.0      
				//Added for Customer Classification-Adjustments SD above
				/*[01Nov2015][NAVINR][SD: Customer Classification Device Category]*/
				ActivateField(""STC Device Category"");

				ClearToQuery();
				SetSearchSpec(""Contract Category"",ContractCat1); 
				SetSearchSpec(""Old Cust"",PlanCat);
				/*[01Nov2015][NAVINR][SD: Customer Classification Device Category]*/
				SetSearchSpec(""STC Device Category"",DeviceCat);

				ExecuteQuery(ForwardOnly);
				isRecord1 = FirstRecord();
				if(isRecord1)
				{
					ContractCat=GetFieldValue(""Contract Category"");
					NumMonths=GetFieldValue(""Number Of Months"");
					sMaxNumMonths = GetFieldValue(""Max Number Of Months"");//Added for Customer Classification-Adjustments SD
					BadCus=GetFieldValue(""Bad Customer""); 
					PlanCat=GetFieldValue(""Old Cust"");
					 TwoYrMonths = GetFieldValue(""STC Two Year Month"");
					 ThrYrMonths = GetFieldValue(""STC Three Year Month"");
					///////////////Category ""1""///////////////

					if(DunnDate!=""""){
						//if(DunnDate > 59*24*60*60*1000 && (ContractCat ==""1"" || ContractCat ==""2"" || ContractCat ==""3"" || ContractCat ==""4""))
						if(DunnDate < DunniDays && (ContractCat ==""1"" || ContractCat ==""2"" || ContractCat ==""3"" || ContractCat ==""4"")){
						NumEligCon=GetFieldValue(""Bad Customer"");
						NewIns=GetFieldValue(""Old Inst"");
						// NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice); 
						dunflg=""Y"";     
						}
					}//endif DunnDate!=""""

					if(sDiffTime1 < NumMonths && dunflg==""N"")//&& ContractCat ==""1"" && PlanCat==""1"")// || ContractCat ==""2"" || ContractCat ==""3"") 
					{
						NumEligCon=GetFieldValue(""New Cust"");
						NewIns=GetFieldValue(""New Inst"");
						// NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice);      
					}
					else if(sDiffTime1 >= NumMonths && sDiffTime1 < sMaxNumMonths && dunflg==""N"")//Added for Customer Classification-Adjustments SD
					{
						NumEligCon=GetFieldValue(""Exis Cust"");
						NewIns=GetFieldValue(""Exis Inst"");
						// NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice);
					}
					else if(sDiffTime1 >= sMaxNumMonths && sDiffTime1 < TwoYrMonths && dunflg==""N"")//Added for Customer Classification-Adjustments SD
					{
						NumEligCon=GetFieldValue(""Old Customer Devices"");
						NewIns=GetFieldValue(""Old Customer Installments"");
						//NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice);
					}
					else if(sDiffTime1 >= TwoYrMonths && sDiffTime1 < ThrYrMonths && dunflg==""N"")//Added for Customer Classification-Adjustments SD
					{
						NumEligCon=GetFieldValue(""STC Two Year Devices"");
						NewIns=GetFieldValue(""STC Two Year Inst"");
						//NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice);
					}
					else if(sDiffTime1 >= ThrYrMonths && dunflg==""N"")//Added for Customer Classification-Adjustments SD
					{
						NumEligCon=GetFieldValue(""STC Three Year Devices"");
						NewIns=GetFieldValue(""STC Three Year Inst"");
						//NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice);
					} 
				}//isRecord1
				else {
					/*[01Nov2015][NAVINR][SD: Customer Classification Device Category]*/
					DeviceCat = vDefaultDeviceCat;
					with(oCustomBC2)
					{
						SetViewMode(AllView);
						ActivateField(""Contract Category"");
						ActivateField(""Exis Cust"");
						ActivateField(""Exis Inst"");
						ActivateField(""New Cust"");
						ActivateField(""New Inst"");
						ActivateField(""Bad Customer"");
						ActivateField(""Number Of Months"");     
						ActivateField(""Old Cust"");
						ActivateField(""Old Inst"");
						//Added for Customer Classification-Adjustments SD below
						ActivateField(""Max Number Of Months""); 
						ActivateField(""Old Customer Devices"");
						ActivateField(""Old Customer Installments"");
						/*[01Nov2015][NAVINR][SD: Customer Classification Device Category]*/
						ActivateField(""STC Device Category"");

						ClearToQuery();
						SetSearchSpec(""Contract Category"",ContractCat1); 
						SetSearchSpec(""Old Cust"",PlanCat);
						SetSearchSpec(""STC Device Category"",DeviceCat);
						ExecuteQuery(ForwardOnly);
						isRecord1 = FirstRecord();
						if(isRecord1)
						{
							ContractCat=GetFieldValue(""Contract Category"");
							NumMonths=GetFieldValue(""Number Of Months"");
							sMaxNumMonths = GetFieldValue(""Max Number Of Months"");//Added for Customer Classification-Adjustments SD
							BadCus=GetFieldValue(""Bad Customer""); 
							PlanCat=GetFieldValue(""Old Cust"");
							TwoYrMonths = GetFieldValue(""STC Two Year Month"");
							ThrYrMonths = GetFieldValue(""STC Three Year Month"");

							///////////////Category ""1""///////////////

							if(DunnDate!=""""){
								if(DunnDate < DunniDays && (ContractCat ==""1"" || ContractCat ==""2"" || ContractCat ==""3"" || ContractCat ==""4"")){
									NumEligCon=GetFieldValue(""Bad Customer"");
									NewIns=GetFieldValue(""Old Inst"");
									//NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice); 
									dunflg=""Y"";     
								}
							}//endif DunnDate!=""""
							if(sDiffTime1 < NumMonths && dunflg==""N"")
							{
								NumEligCon=GetFieldValue(""New Cust"");
								NewIns=GetFieldValue(""New Inst"");
								//NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice);      
							}
							else if(sDiffTime1 >= NumMonths && sDiffTime1 < sMaxNumMonths && dunflg==""N"")//Added for Customer Classification-Adjustments SD
							{
								NumEligCon=GetFieldValue(""Exis Cust"");
								NewIns=GetFieldValue(""Exis Inst"");
								//NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice);
							}
							else if(sDiffTime1 >= sMaxNumMonths && sDiffTime1 < TwoYrMonths && dunflg==""N"")//Added for Customer Classification-Adjustments SD
							{
								NumEligCon=GetFieldValue(""Old Customer Devices"");
								NewIns=GetFieldValue(""Old Customer Installments"");
								// NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice);
							}
							else if(sDiffTime1 >= TwoYrMonths && sDiffTime1 < ThrYrMonths && dunflg==""N"")//Added for Customer Classification-Adjustments SD
							{
								NumEligCon=GetFieldValue(""STC Two Year Devices"");
								NewIns=GetFieldValue(""STC Two Year Inst"");
								// NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice);
							}
							else if(sDiffTime1 >= ThrYrMonths && dunflg==""N"")//Added for Customer Classification-Adjustments SD
							{
								NumEligCon=GetFieldValue(""STC Three Year Devices"");
								NewIns=GetFieldValue(""STC Three Year Inst"");
								// NumberOfInstalment(ContractCat1,sDiffTime1,PlanCat,NewIns,ObjectId1,vIsDevice);
							}
						}//end of if(isRecord1)
					}//end of with(oCustomBC2)
				}//end of else
			}//with (oCustomBC)
		}// isRecordAccount
	}//AccountBC  
	Outputs.SetProperty(""NewDeviceFlag"",vIsDevice); //Anchal
	Outputs.SetProperty(""DevAllowed"",NumEligCon);
}
catch(e)
{
	throw(e);
}
finally
{
	oInvoiceBC=null, ListBC=null, oCustomBC=null, oCustomBC2=null, AccountBC=null;  
	oInvoiceBO=null, ListBO=null, oCustomBO=null, AccountBO=null;
	//AppObj=null;
}
}
function QueryAccessory(Inputs,Outputs)
{
 try
 {
  var AssetBO = TheApplication().GetBusObject(""PDS Asset Management""); 
  var AssetBC = AssetBO.GetBusComp(""Asset Mgmt - Asset"");
  var AccountBO = TheApplication().GetBusObject(""STC Thin CUT Service Sub Accounts Light BO""); 
  var AccountBC = AccountBO.GetBusComp(""STC Thin CUT Service Sub Accounts Light""); 
  var AccountbillingBO = TheApplication().GetBusObject(""STC Thin Billing Account BO""); 
  var AccountBC1 = AccountbillingBO.GetBusComp(""STC Thin CUT Invoice Sub Accounts"");
  var  MasterAccountBO=   TheApplication().GetBusObject(""STC Account Thin BO""); 
  var  MasterAccountBC= MasterAccountBO.GetBusComp(""STC Account Thin""); 
  var AccountId =Inputs.GetProperty(""AccountId"");
  var BillEqipRec=""0"";
  var DeleteEqipRec=""0"";
  var RecExist;
  var vStatus=""In Active"";
  var vSExp;
  var ServiceType =""Postpaid"";
  var vSExp1;
  var billingId;
  var count1;
  var RecExist1;
  var count2;
  var billingId1;
  var device;
  var cpr,vSExpE;//Mayank: Added for Ecom
  var CountEcomDevice = ""0"";//Mayank: Added for Ecom
  with(MasterAccountBC) 
  {
   SetViewMode(AllView);   
   ActivateField(""Parent Account Id"");
   ActivateField(""Tax ID Number"");//Mayank: Added for Ecom
   ClearToQuery(); 
   vSExp  = ""[Id] = '""+ AccountId +""'"";
   SetSearchExpr(vSExp); 
   ExecuteQuery(ForwardOnly);
   RecExist = FirstRecord();
   if(RecExist)
   {
    cpr = MasterAccountBC.GetFieldValue(""Tax ID Number"");//Mayank: Added for Ecom   
    billingId = MasterAccountBC.GetFieldValue(""Id""); 
    count1 = CountRecords();
    with(AccountBC1)
    {
     SetViewMode(AllView);      
     ActivateField(""Market Class""); 
     ActivateField(""STC Contract Category"");      
     ClearToQuery(); 
     vSExp1  = ""[Parent Account Id] = '""+billingId+""'"";// AND [STC Service Type]= 'Postpaid'"";
     SetSearchExpr(vSExp1); 
     ExecuteQuery(ForwardOnly);
     RecExist1 = FirstRecord();
     while(RecExist1)
     { 
      count2 = CountRecords();
      billingId1= GetFieldValue(""Id"");
      BillEqipRec = QueryAccount(billingId1,BillEqipRec,Inputs,Outputs); 
      BillEqipRec = QueryOrder(billingId1,BillEqipRec,DeleteEqipRec,Inputs,Outputs);
      device=Outputs.GetProperty(""BillEqipRec"");
      DeleteEqipRec=Outputs.GetProperty(""DeleteEqipRec"");
      RecExist1=NextRecord();          
     }//RecExist1
    }//AccountBC1  
   }// if(RecExist)
   Outputs.SetProperty(""BillEqipRec"",device); 
   Outputs.SetProperty(""DeleteEqipRec"",DeleteEqipRec); 
  }//MasterAccountBC
 }//try
 catch(e)
 {
  throw(e)  
 }
 finally
 {
  AssetBO=null;
  AccountBO=null;
  AccountbillingBO=null;
  MasterAccountBO=null;
  AssetBC=null;
  AccountBC=null;
  MasterAccountBC=null;
  AccountBC1=null;
 }
}
function QueryAccessory(Inputs,Outputs)
{
	//[NAVIN: 03Jan2021: Query Accessory Count Performance Tunning]
	try
	{
		var MasterAccountBO=   TheApplication().GetBusObject(""STC Account Thin BO""); 
		var MasterAccountBC= MasterAccountBO.GetBusComp(""STC Account Thin"");
		//var AccountbillingBO = TheApplication().GetBusObject(""STC Thin Billing Account BO""); 
		//var AccountBC1 = AccountbillingBO.GetBusComp(""STC Thin CUT Invoice Sub Accounts"");
		var AssetBO = TheApplication().GetBusObject(""PDS Asset Management""); 
		var AssetBC = AssetBO.GetBusComp(""Asset Mgmt - Asset"");
		var AccountId =Inputs.GetProperty(""AccountId"");
		var BillEqipRec=0;
		var DeleteEqipRec=0;
		var RecExist;
		var vStatus=""In Active"";
		var vSExp;
		var ServiceType =""Postpaid"";
		var vSExp1;
		var billingId;
		var count1;
		var RecExist1;
		var count2;
		var billingId1;
		var device=0;
		var cpr,vSExpE;//Mayank: Added for Ecom
		var CountEcomDevice = ""0"";//Mayank: Added for Ecom
		with(MasterAccountBC) 
		{
			SetViewMode(AllView);   
			ActivateField(""Parent Account Id"");
			ActivateField(""Tax ID Number"");//Mayank: Added for Ecom
			ClearToQuery(); 
			vSExp  = ""[Id] = '""+ AccountId +""'"";
			SetSearchExpr(vSExp); 
			ExecuteQuery(); //Issue with ForwardOnly, use ForwardBackward instead
			RecExist = FirstRecord();
			if(RecExist)
			{
				cpr = MasterAccountBC.GetFieldValue(""Tax ID Number"");//Mayank: Added for Ecom   
				billingId = MasterAccountBC.GetFieldValue(""Id"");

				BillEqipRec = QueryAccount(AccountId,BillEqipRec,Inputs,Outputs); 
				BillEqipRec = QueryOrder(AccountId,BillEqipRec,DeleteEqipRec,Inputs,Outputs);
				device=Outputs.GetProperty(""BillEqipRec"");
				DeleteEqipRec=Outputs.GetProperty(""DeleteEqipRec"");
				/*
				count1 = CountRecords();
				with(AccountBC1)
				{
					SetViewMode(AllView);      
					ActivateField(""Market Class""); 
					ActivateField(""STC Contract Category"");      
					ClearToQuery(); 
					vSExp1  = ""[Parent Account Id] = '""+billingId+""'"";// AND [STC Service Type]= 'Postpaid'"";
					SetSearchExpr(vSExp1); 
					ExecuteQuery(ForwardOnly);
					RecExist1 = FirstRecord();
					while(RecExist1)
					{ 
						count2 = CountRecords();
						billingId1= GetFieldValue(""Id"");
						BillEqipRec = QueryAccount(billingId1,BillEqipRec,Inputs,Outputs); 
						BillEqipRec = QueryOrder(billingId1,BillEqipRec,DeleteEqipRec,Inputs,Outputs);
						device=Outputs.GetProperty(""BillEqipRec"");
						DeleteEqipRec=Outputs.GetProperty(""DeleteEqipRec"");
						RecExist1=NextRecord();          
					}//RecExist1
				}//AccountBC1
				*/
			}// if(RecExist)
			Outputs.SetProperty(""BillEqipRec"",device); 
			Outputs.SetProperty(""DeleteEqipRec"",DeleteEqipRec); 
		}//MasterAccountBC
	}//try
	catch(e)
	{
		throw(e);  
	}
	finally
	{		
		//AccountBC1=null;
		//AccountbillingBO=null;

		AssetBC=null;
		AssetBO=null;
		MasterAccountBC=null;
		MasterAccountBO=null;
	}
}
function QueryAccessory(Inputs,Outputs)
{
	//[NAVIN: 03Jan2021: Query Accessory Count Performance Tunning]
	try
	{
		var MasterAccountBO=   TheApplication().GetBusObject(""STC Account Thin BO""); 
		var MasterAccountBC= MasterAccountBO.GetBusComp(""STC Account Thin"");
		//var AccountbillingBO = TheApplication().GetBusObject(""STC Thin Billing Account BO""); 
		//var AccountBC1 = AccountbillingBO.GetBusComp(""STC Thin CUT Invoice Sub Accounts"");
		var AssetBO = TheApplication().GetBusObject(""PDS Asset Management""); 
		var AssetBC = AssetBO.GetBusComp(""Asset Mgmt - Asset"");
		var AccountId =Inputs.GetProperty(""AccountId"");
		var BillEqipRec=0;
		var DeleteEqipRec=0;
		var RecExist;
		var vStatus=""In Active"";
		var vSExp;
		var ServiceType =""Postpaid"";
		var vSExp1;
		var billingId;
		var count1;
		var RecExist1;
		var count2;
		var billingId1;
		var device=0;
		var cpr,vSExpE;//Mayank: Added for Ecom
		var CountEcomDevice = ""0"";//Mayank: Added for Ecom
		with(MasterAccountBC) 
		{
			SetViewMode(AllView);   
			ActivateField(""Parent Account Id"");
			ActivateField(""Tax ID Number"");//Mayank: Added for Ecom
			ClearToQuery(); 
			vSExp  = ""[Id] = '""+ AccountId +""'"";
			SetSearchExpr(vSExp); 
			ExecuteQuery(ForwardOnly);
			RecExist = FirstRecord();
			if(RecExist)
			{
				cpr = MasterAccountBC.GetFieldValue(""Tax ID Number"");//Mayank: Added for Ecom   
				billingId = MasterAccountBC.GetFieldValue(""Id"");

				BillEqipRec = QueryAccount(AccountId,BillEqipRec,Inputs,Outputs); 
				BillEqipRec = QueryOrder(AccountId,BillEqipRec,DeleteEqipRec,Inputs,Outputs);
				device=Outputs.GetProperty(""BillEqipRec"");
				DeleteEqipRec=Outputs.GetProperty(""DeleteEqipRec"");
				/*
				count1 = CountRecords();
				with(AccountBC1)
				{
					SetViewMode(AllView);      
					ActivateField(""Market Class""); 
					ActivateField(""STC Contract Category"");      
					ClearToQuery(); 
					vSExp1  = ""[Parent Account Id] = '""+billingId+""'"";// AND [STC Service Type]= 'Postpaid'"";
					SetSearchExpr(vSExp1); 
					ExecuteQuery(ForwardOnly);
					RecExist1 = FirstRecord();
					while(RecExist1)
					{ 
						count2 = CountRecords();
						billingId1= GetFieldValue(""Id"");
						BillEqipRec = QueryAccount(billingId1,BillEqipRec,Inputs,Outputs); 
						BillEqipRec = QueryOrder(billingId1,BillEqipRec,DeleteEqipRec,Inputs,Outputs);
						device=Outputs.GetProperty(""BillEqipRec"");
						DeleteEqipRec=Outputs.GetProperty(""DeleteEqipRec"");
						RecExist1=NextRecord();          
					}//RecExist1
				}//AccountBC1
				*/
			}// if(RecExist)
			Outputs.SetProperty(""BillEqipRec"",device); 
			Outputs.SetProperty(""DeleteEqipRec"",DeleteEqipRec); 
		}//MasterAccountBC
	}//try
	catch(e)
	{
		throw(e);  
	}
	finally
	{		
		//AccountBC1=null;
		//AccountbillingBO=null;

		AssetBC=null;
		AssetBO=null;
		MasterAccountBC=null;
		MasterAccountBO=null;
	}
}
function QueryAccount(AccountId,BillEqipRec,Inputs,Outputs)
{
	//[NAVIN: 03Jan2021: Query Accessory Count Performance Tunning]
	try
	{
		//var AccountBO = TheApplication().GetBusObject(""STC Service Account""); 
		//var AccountBC = AccountBO.GetBusComp(""CUT Service Sub Accounts"");  
		//var AssetBO = TheApplication().GetBusObject(""Asset Management - Complex""); 
		//var AssetBC = AssetBO.GetBusComp(""Asset Mgmt - Asset - Header"");
		//var ListBO = TheApplication().GetBusObject(""List Of Values"");
		//var ListBC = ListBO.GetBusComp(""List Of Values"");

		var AssetBO = TheApplication().GetBusObject(""STC Thin Asset No Sort BO""); 
        var AssetBC = AssetBO.GetBusComp(""STC Asset Mgmt - Asset Thin without sort"");
        var ParDevPlanElig="""";

		var vSExp1;  
		var strProdpart=""VIPCD*""; 
		var strName=""VIVA Contract Duration"";
		var ServiceType;
		var RecExists1;
		var vSExp2;
		var RecExist2,Accept,ServiceId;
		var RecExist3;
		var getmonths; 
		var Device;
		var StartDate,AssetId,count3;

		with(AssetBC)
		{  
			SetViewMode(AllView);
			ActivateField(""Product Part Number"");
			//ActivateField(""Type"");
			ActivateField(""Billing Account Id"");
			ActivateField(""Install Date"");
			ActivateField(""Service Length"");
			ActivateField(""STC Plan Elig"");
			ActivateField(""Product Name"");
			ActivateField(""Status"");
			ActivateField(""Root Asset Id"");
			ActivateField(""STC Parent Plan Elig"");

			//vSExp2  = ""[Product Part Number] LIKE '""+strProdpart+""*' AND [Service Account Id] = '""+ServiceId+""' AND [Status] <> 'Inactive' AND [Service Length] IS NOT NULL"";

			vSExp2  = ""[Owner Account Id]='""+AccountId+""' AND [STC Service Type]='Postpaid' AND [Product Part Number] LIKE '""+strProdpart+""' AND ([STC Parent Plan Elig]='Accessory') AND [Status] <> 'Inactive' AND [STCContractActiveFlag]='Y'"";

			SetSearchExpr(vSExp2); 
			ExecuteQuery(ForwardOnly);
			RecExist2 = FirstRecord(); 
			count3 = CountRecords();
			if(RecExist2)
			{
				BillEqipRec = ToNumber(BillEqipRec) + count3;            
				Outputs.SetProperty(""BillEqipRec"",BillEqipRec);

			}//RecExist2
		}//AssetBC
	}//try
	catch(e)
	{
		//throw(e);  
	}
	finally
	{
		//ListBC=null;
		//ListBO=null;
		//AccountBC=null;
		//AccountBO=null;
		AssetBC=null;
		AssetBO=null;
	} 
	return(BillEqipRec);
}
function QueryOrder(billingId1,BillEqipRec,DeleteEqipRec,Inputs,Outputs)
{
try
{
var OrderBO = TheApplication().GetBusObject(""Order Entry (Sales)""); 
var OrderBC = OrderBO.GetBusComp(""Order Entry - Orders"");
var OrderItemBO =TheApplication().GetBusObject(""Order Item"");
var OrderItemBC =OrderItemBO.GetBusComp(""Order Entry - Line Items (Simple)"");
var ListBO = TheApplication().GetBusObject(""List Of Values"");
var ListBC = ListBO.GetBusComp(""List Of Values"");   //var i=""0"";
var vType =""STC_DEVICE_CONTRACT""; 
var vSExp3,vSExp2,RecExists1,count1,status,PlanType,OrderType,OrderId,RecExist2,sRootItemId;
var count2,lineItemId,vSExp4,Count4;
var RecExist3;
var count3;
   with(OrderBC)
   {
   SetViewMode(AllView);
   ActivateField(""Billing Account Id"");  
   ActivateField(""Status"");
   ActivateField(""STC Order Sub Status"");
   ActivateField(""STC PlanType"");
	vSExp2  = ""[Billing Account Id] = '""+billingId1+""' AND (([STC Order SubType] = 'Provide' OR [STC Order SubType] = 'Modify') OR ([STC Order SubType] = 'Migration' AND [STC Migration Sub Type] = 'Service Migration' AND [Delivery Block] = 'Prepaid To Postpaid'))"";
    SetSearchExpr(vSExp2);  
    ExecuteQuery(ForwardBackward);  
    RecExists1 = FirstRecord(); 
    while(RecExists1)
        {
         count1 = CountRecords();
         OrderType = GetFieldValue(""STC Order SubType"");
         OrderId = GetFieldValue(""Id""); 
         status =GetFieldValue(""Status"");  
         PlanType= GetFieldValue(""STC PlanType"");      
         if((status == ""Submitted"" || status == ""Failed"" || status ==""In Progress""))
         {
          with(OrderItemBC)
          {
   SetViewMode(AllView);
   ActivateField(""Root Order Item Id"");   
   ActivateField(""Part Number"");
   ActivateField(""Action Code"");
   ActivateField(""Product Type"");  
   ActivateField(""Order Header Id"");
   ActivateField(""Service Account Id"");
   vSExp4  = ""[Order Header Id] = '""+ OrderId +""' AND [STC Plan Elig] = 'Accessory' AND [Action Code] = 'Add'"";
   SetSearchExpr(vSExp4);  
   ExecuteQuery(ForwardOnly);
   RecExist2 = FirstRecord();  
    if(RecExist2)
    {  
		BillEqipRec++;
    }//RecExist2
    ///Code for Delete
   SetViewMode(AllView);
   ActivateField(""Root Order Item Id"");   
   ActivateField(""Part Number"");
   ActivateField(""Action Code"");
   ActivateField(""Product Type"");  
   ActivateField(""Order Header Id"");
   ActivateField(""Service Account Id"");
   vSExp3  = ""[Order Header Id] = '""+ OrderId +""' AND [STC Plan Elig] = 'Accessory' AND [Action Code] = 'Delete'"";
   SetSearchExpr(vSExp3);  
   ExecuteQuery(ForwardOnly);
   RecExist3 = FirstRecord();  
   if(RecExist3)
   {
	DeleteEqipRec++;
   }
   }//OrderItemBC 
          }//status 
         RecExists1 =NextRecord();     
      }//RecExists1
     }//OrderBO 
  Outputs.SetProperty(""BillEqipRec"",BillEqipRec);     
 Outputs.SetProperty(""DeleteEqipRec"",DeleteEqipRec);        
     
 }//try
 catch(e)
{
//throw(e)  
}
finally
{
OrderItemBO=null;
ListBO=null;
OrderBO=null;
ListBC=null;
OrderItemBC=null;
ListBC=null;
}
     
 return(BillEqipRec)
}
function QueryOrder(AccountId,BillEqipRec,DeleteEqipRec,Inputs,Outputs)
{
	//[NAVIN: 03Jan2021: Query Accessory Count Performance Tunning]
	try
	{
		var OrderBO = TheApplication().GetBusObject(""MACD Performance Order""); 
        var OrderBC = OrderBO.GetBusComp(""MACD Order Entry - Orders"");
		var OrderItemBO =TheApplication().GetBusObject(""Order Item"");
		var OrderItemBC =OrderItemBO.GetBusComp(""Order Entry - Line Items (Simple)"");
		//var ListBO = TheApplication().GetBusObject(""List Of Values"");
		//var ListBC = ListBO.GetBusComp(""List Of Values"");   //var i=""0"";
		var vType =""STC_DEVICE_CONTRACT""; 
		var vSExp3,vSExp2,RecExists1,count1,status,PlanType,OrderType,OrderId,RecExist2,sRootItemId;
		var count2,lineItemId,vSExp4,Count4;
		var RecExist3;
		var count3, vAction="""";
		with(OrderBC)
		{
			SetViewMode(AllView);
			ActivateField(""Account Id"");
			ActivateField(""Billing Account Id"");  
			ActivateField(""Status"");
			ActivateField(""STC Order Sub Status"");
			//ActivateField(""STC PlanType"");

			//vSExp2  = ""[Billing Account Id] = '""+billingId1+""' AND (([STC Order SubType] = 'Provide' OR [STC Order SubType] = 'Modify') OR ([STC Order SubType] = 'Migration' AND [STC Migration Sub Type] = 'Service Migration' AND [Delivery Block] = 'Prepaid To Postpaid'))"";

			vSExp2  = ""[Account Id] = '""+AccountId+""' AND ((([STC Order SubType] = 'Provide' OR [STC Order SubType] = 'Modify') AND [STC Subscription Type]='Postpaid') OR ([STC Order SubType] = 'Migration' AND [STC Migration Sub Type] = 'Service Migration' AND [Delivery Block] = 'Prepaid To Postpaid')) AND ([Status]='Submitted' OR [Status]='Failed' OR [Status]='In Progress')"";

			SetSearchExpr(vSExp2);  
			ExecuteQuery(ForwardBackward);  
			RecExists1 = FirstRecord(); 
			while(RecExists1)
			{
				count1 = CountRecords();
				OrderType = GetFieldValue(""STC Order SubType"");
				OrderId = GetFieldValue(""Id""); 
				status =GetFieldValue(""Status"");  
				//PlanType= GetFieldValue(""STC PlanType"");      

				with(OrderItemBC)
				{
					SetViewMode(AllView);
					ActivateField(""Root Order Item Id"");   
					ActivateField(""Part Number"");
					ActivateField(""Action Code"");
					ActivateField(""Product Type"");  
					ActivateField(""Order Header Id"");
					ActivateField(""Service Account Id"");
					vSExp4  = ""[Order Header Id] = '""+ OrderId +""' AND [STC Plan Elig] = 'Accessory' AND ([Action Code] = 'Add' OR [Action Code] = 'Delete')"";
					SetSearchExpr(vSExp4);  
					ExecuteQuery(ForwardOnly);
					RecExist2 = FirstRecord();  
					if(RecExist2)
					{
						vAction = GetFieldValue(""Action Code"");
                        
                        if (vAction == ""Add"")
                        {
                            BillEqipRec = ToNumber(BillEqipRec)+1;
                        }
                        else
                        {
                            DeleteEqipRec = ToNumber(DeleteEqipRec)+1;
                        }
					}//RecExist2

				}//OrderItemBC
				RecExists1 =NextRecord();     
			}//RecExists1
		}//OrderBC
		Outputs.SetProperty(""BillEqipRec"",BillEqipRec);     
		Outputs.SetProperty(""DeleteEqipRec"",DeleteEqipRec);        

	}//try
	catch(e)
	{
		//throw(e);  
	}
	finally
	{
		//ListBC=null;
		//ListBO=null;
		OrderItemBC=null;
		OrderItemBO=null;
		OrderBC=null;
		OrderBO=null;
	}

	return(BillEqipRec);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{

	if(MethodName ==""QueryAccessory"")
	{
		QueryAccessory(Inputs,Outputs);
		return(CancelOperation);
	}

	if(MethodName ==""AgeOnNetwork"")
	{
		AgeonNetwork(Inputs,Outputs);
		return(CancelOperation);
	}
 return (ContinueOperation);
}
"//Your public declarations go here...  
"
function GetAccountAdminDetails(Inputs, Outputs)
{
	//Indrasen:25Aug2020:  SD:SelfcarePortal_Admin
	var oBC, isRec="""", NumofRecords=0, vRecFound=""FALSE"", vFstName="""", vLastName="""", vMidName="""", vCPRNumber="""", CRNumber="""", vStatus="""", vMobVerifyStat="""", vMailVerifyStat="""";
	var vMSISDN="""", vEmail="""", vPassword="""", Primary="""", vAddonApprover="""",vAdminType="""";
	var inCANId, inAdminType, inSearchSpec;
	try
	{
		inCANId = Inputs.GetProperty(""CAN Id"");
		inAdminType = Inputs.GetProperty(""Admin Type"");
		inSearchSpec = Inputs.GetProperty(""SearchSpec"");
		oBC = TheApplication().GetBusObject(""Account"").GetBusComp(""STC Account Administrators"");
		
		Outputs.SetProperty(""First Name"","""");
		Outputs.SetProperty(""Middle Name"","""");
		Outputs.SetProperty(""Last Name"","""");
		Outputs.SetProperty(""Password"","""");
		Outputs.SetProperty(""MSISDN"","""");
		Outputs.SetProperty(""STC Email"","""");
		Outputs.SetProperty(""CPR Number"","""");
		Outputs.SetProperty(""Admin Type"","""");
		Outputs.SetProperty(""CR Number"","""");
		Outputs.SetProperty(""STC Addon Approver"","""");
		Outputs.SetProperty(""STC Email Verification"","""");
		Outputs.SetProperty(""STC MSISDN Verification"","""");
		Outputs.SetProperty(""STC Status"","""");
		Outputs.SetProperty(""STC Business Tel1"","""");
		Outputs.SetProperty(""STC Business Tel2"","""");
		Outputs.SetProperty(""Fax"","""");
		Outputs.SetProperty(""Job Title"","""");
		Outputs.SetProperty(""Preferred Language"","""");
		Outputs.SetProperty(""GCC Country Code"","""");
		Outputs.SetProperty(""Customer Id"","""");
		Outputs.SetProperty(""Primary"","""");
		with(oBC)
		{
			ActivateMultipleFields(Outputs);
			ClearToQuery();
			SetViewMode(AllView);
			
			if(inSearchSpec != """" && inSearchSpec != """")
				SetSearchExpr(inSearchSpec);
			else if(inAdminType == ""Account Administrator"")
				SetSearchExpr(""[Customer Id]='""+inCANId+""' AND [Primary]='Y' AND [Admin Type]='""+inAdminType+""'"");
			else if(inAdminType == ""Primary Portal Admin"")
				SetSearchExpr(""[Customer Id]='""+inCANId+""' AND [STC Status]='Active' AND [Admin Type]='""+inAdminType+""'"");
			else
				SetSearchExpr(""[Id]='NOMATCHID'"");
			
			ExecuteQuery(ForwardBackward);
			isRec = FirstRecord();
			NumofRecords = CountRecords();
 			if(isRec)
			{	
				vRecFound = ""TRUE"";
				Outputs.SetProperty(""Id"", GetFieldValue(""Id"") );
				Outputs.SetProperty(""Customer Id"", GetFieldValue(""Customer Id"") );
				Outputs.SetProperty(""First Name"", GetFieldValue(""First Name"") );
				Outputs.SetProperty(""Middle Name"", GetFieldValue(""Middle Name"") );
				Outputs.SetProperty(""Last Name"", GetFieldValue(""Last Name"") );
				Outputs.SetProperty(""Password"", GetFieldValue(""Password"") );
				Outputs.SetProperty(""MSISDN"", GetFieldValue(""MSISDN"") );
				Outputs.SetProperty(""STC Email"", GetFieldValue(""STC Email"") );
				Outputs.SetProperty(""CPR Number"", GetFieldValue(""CPR Number"") );
				Outputs.SetProperty(""Admin Type"", GetFieldValue(""Admin Type"") );
				Outputs.SetProperty(""CR Number"", GetFieldValue(""CR Number"") );
				Outputs.SetProperty(""STC Addon Approver"", GetFieldValue(""STC Addon Approver"") );
				Outputs.SetProperty(""STC Email Verification"", GetFieldValue(""STC Email Verification"") );
				Outputs.SetProperty(""STC MSISDN Verification"", GetFieldValue(""STC MSISDN Verification"") );
				Outputs.SetProperty(""STC Status"", GetFieldValue(""STC Status"") );
				Outputs.SetProperty(""STC Business Tel1"", GetFieldValue(""STC Business Tel1"") );
				Outputs.SetProperty(""STC Business Tel2"", GetFieldValue(""STC Business Tel2"") );
				Outputs.SetProperty(""Fax"", GetFieldValue(""Fax"") );
				Outputs.SetProperty(""Job Title"", GetFieldValue(""Job Title"") );
				Outputs.SetProperty(""Preferred Language"", GetFieldValue(""Preferred Language"") );
				Outputs.SetProperty(""GCC Country Code"", GetFieldValue(""GCC Country Code"") );
				Outputs.SetProperty(""Primary"", GetFieldValue(""Primary"") );
			}
		}
	}
	catch(e)
	{
		vRecFound=""ERROR"";
		Outputs.SetProperty(""Error Message"", e);
	}
	finally
	{
		Outputs.SetProperty(""RecFound"", vRecFound);
		Outputs.SetProperty(""NumofRecords"", NumofRecords);
		oBC = null;
	}
}
function GetAccountIds(Inputs, Outputs)
{
	
	try
	{
		var SubsAccountId = Inputs.GetProperty(""Subscription Account Id"");
		var BillAccountId = Inputs.GetProperty(""Billing Account Id"");
	
		var ParAccountId;
		var AccountArray =  new Array();
		var boAccount;
		var bcSubsAccount;
		var bcAccount;
		var SearchSpec;
		
		boAccount = TheApplication().GetBusObject(""Account"");
		//bcBillAccount = boAccount.GetBusComp(""CUT Invoice Sub Accounts"");	
		bcSubsAccount = boAccount.GetBusComp(""Account"");			
	
		with(bcSubsAccount)
		{
			SetViewMode(AllView);
			ActivateField(""Account Id"");
			ActivateField(""Billing Account Id"");
			ActivateField(""Parent Account Id"");
			ClearToQuery();
			SetSearchSpec(""Id"", SubsAccountId);
			ExecuteQuery(ForwardOnly);	
		
			if(FirstRecord())
			{
				ParAccountId = GetFieldValue(""Parent Account Id"");
				if(ParAccountId != """")
				{
					AccountArray[0] =  ParAccountId;
				}
				else
				{
					Outputs.SetProperty(""Error Message"",""Parent Account Id Not Found."");
					return;
				}
			}
			else
			{
				Outputs.SetProperty(""Error Message"",""Billing Account Id Not Found."");
				return;
			}
		}//end with
		bcSubsAccount = null;
		
		bcAccount = boAccount.GetBusComp(""Account"");
		for(var i = 0; ParAccountId != """"; i++)
		{
			with (bcAccount)
			{
		    	SetViewMode(AllView);
				ActivateField(""Parent Account Id"");
				ActivateField(""Account Id"");
				ClearToQuery();
				SetSearchSpec(""Id"", ParAccountId);
				ExecuteQuery(ForwardOnly);
				
				if(FirstRecord())
				{
					AccountArray[i] = GetFieldValue(""Id"");
					AccountArray[i+1] = GetFieldValue(""Parent Account Id"");
					ParAccountId = GetFieldValue(""Parent Account Id"");
				}
				else
				{
					break;
				}
			}//end with
		}//end for
				
		SearchSpec = """";
		var Arrlen = AccountArray.length
		for(var j = 0; j < ((AccountArray.length)-1); j++)
		{
			if(SearchSpec == """")
			{				
				if(AccountArray[j+1] != """")
				{
					SearchSpec  = ""[Account.Id] = '"" + AccountArray[j] + ""' OR "" + ""[Account.Id] = '"" + AccountArray[j+1]+ ""'"";
					j= j+1;
					continue;
				}
				else
				{ //Break if only one Element ID Only One element in Array
					SearchSpec  = ""[Account.Id] = '"" + AccountArray[j] + ""'"";
					j= j+1;
					break;
				}
			}
			if(AccountArray[j+1] != """")
			{	
				SearchSpec  = ""[Account.Id] = '"" + AccountArray[j] + ""' OR "" + ""[Account.Id] = '"" + AccountArray[j+1]+ ""' OR "" + SearchSpec;
			}
			else 
			{
				SearchSpec  = ""[Account.Id] = '"" + AccountArray[j] + ""' OR "" +  SearchSpec;
			}
			j= j+1;
		}

		//SearchSpec = ""("" + SearchSpec + "" OR "" + ""[Account.Id] = '"" + BillAccountId + ""') AND "" + ""[Account.Account Type Code] = 'Billing'"";
		//SearchSpec = ""("" + SearchSpec + "" OR "" + ""[Account.Id] = '"" + BillAccountId + ""')"";
		SearchSpec = ""("" + SearchSpec + "" OR "" + ""[Account.Id] = '"" + SubsAccountId + ""')"";	

		Outputs.SetProperty(""Search Spec"", SearchSpec);
	}
	
	catch(e)
	{
		throw(e);
	}
	finally
	{
		bcAccount = null;
		boAccount = null;
	}
	
}
"//PS: Created this BS on 06/10/2010 For Corporate Hierarchy Structure//
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	var iReturn;
	
	try  
	{
		iReturn = ContinueOperation;
		switch (MethodName)
		{
			case ""GetAccountIds"":
				GetAccountIds(Inputs, Outputs);
				iReturn = CancelOperation;
				break;

			case ""GetAccountAdminDetails"":			//	Indrasen:25Aug2020:  SD:SelfcarePortal_Admin
				GetAccountAdminDetails(Inputs, Outputs);
				iReturn = CancelOperation;
				break;
							    								 
			default: 
				iReturn = ContinueOperation;
				
		} //switch
		return (iReturn);
	} 
	catch (e)
	{	
		
	}
}
function GetPLanList(Inputs, Outputs)
{
try{

	var vPlanApp = TheApplication();
	var sSrvcAccntId = vPlanApp.GetProfileAttr(""AccountId"");
	var sSrvcAccntBo = vPlanApp.GetBusObject(""STC Service Account"");
	var sSrvcAccntBc = sSrvcAccntBo.GetBusComp(""CUT Service Sub Accounts"");
	var sAssetBc = sSrvcAccntBo.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
	Outputs.SetProperty(""ErrorPlanList"",""N"");
	var sPromoBo = vPlanApp.GetBusObject(""STC Promotion Management BO"");
	var sPromoBc = sPromoBo.GetBusComp(""STC Promotion Management BC"");//Parent Applet BC	
	var sPromoEligProdBc = sPromoBo.GetBusComp(""STC Promotion Eligible Product BC"");//Child Applet BC
	var sPromoEndProdBc = sPromoBo.GetBusComp(""STC Promotion End Product BC"");//Grand Child Applet BC
	var sProdSeqNull = vPlanApp.InvokeMethod(""LookupValue"",""STC_BTL_PROMO_SEQ"",""STC_BTL_PROMO_SEQ"");
	sProdSeqNull = ToNumber(sProdSeqNull);
	var sProdType = vPlanApp.InvokeMethod(""LookupValue"",""PRODUCT_TYPE"",""Service Plan"");
	 
	with(sSrvcAccntBc)
	{
		ActivateField(""STC BTLSurvey Id"");//Added to aviod duplication of promotion survey and to aviod non-eligible customers SRINI:25082014
		ClearToQuery();
		SetViewMode(AllView);
		SetSearchSpec(""Id"",sSrvcAccntId);
		ExecuteQuery(ForwardOnly);
		var IsRec = FirstRecord();
		if(IsRec)
		{
			var sBTLRecId = GetFieldValue(""STC BTLSurvey Id"");//SRINI:25082014
			if(sBTLRecId != """" & sBTLRecId != null)
			{
			
			}//SRINI:25082014			
			else			
			vPlanApp.RaiseErrorText(""“This customer is not eligible for ARPU Optimization promotion."");//SRINI:25082014
				
			with(sAssetBc)
			{
				ActivateField(""Product Name"");
				ActivateField(""Product Part Number"");
				ClearToQuery();
				SetViewMode(AllView);
				//SetSearchSpec(""Service Type"",""Voice"");
				//SetSearchSpec(""STC Product Type"",sProdType);
				SetSearchSpec(""STC Plan Type"",sProdType);
				SetSearchSpec(""Status"",""Active"");
				ExecuteQuery(ForwardOnly);
				var IsAssetRec = FirstRecord();
				if(IsAssetRec)
				{
					var sPlanName = GetFieldValue(""Product Name"");
					var sPlanPartNum = GetFieldValue(""Product Part Number"");						
				}//endif IsAssetRec				
			}//endwith sAssetBc
		}//endif IsRec		
	}//endwith sSrvcAccntBc
	
	var sBTLPromoName = vPlanApp.InvokeMethod(""LookupValue"",""STC_BTL_PROMO_NAME"",""STC_BTL_PROMO_NAME"");	
	
	with(sPromoBc)
	{
		ClearToQuery();
		SetViewMode(AllView);
		SetSearchSpec(""Promotion Category"",sBTLPromoName);
		ExecuteQuery(ForwardOnly);
		var IsPromoRec = FirstRecord();
		if(IsPromoRec)
		{
			with(sPromoEligProdBc)
			{
				ClearToQuery();
				SetViewMode(AllView);
				SetSearchSpec(""Product Part Number"",sPlanPartNum);
				ExecuteQuery(ForwardOnly);
				var IsPromProdRec = FirstRecord();
				if(IsPromProdRec)
				{
					with(sPromoEndProdBc)
					{
						ActivateField(""Sequence"");
						ClearToQuery();
						SetViewMode(AllView);
						SetSearchSpec(""Id"","""");
						ExecuteQuery(ForwardOnly);
						var IsPromoEndProdRec = FirstRecord();
						if(IsPromoEndProdRec)
						{
							var sEndProdSeq = GetFieldValue(""Sequence"");
							//Profile Attribute to show the eligible plans at the time of the promotion Survey based on the seq.
							vPlanApp.SetProfileAttr(""sEndProdSeq"",sEndProdSeq);				
						}//endif  IsPromoEndProdRec						
					}//endwith 	sPromoEndProdBc
				}//endif IsPromProdRec
				else
				{					
					vPlanApp.SetProfileAttr(""sEndProdSeq"",sProdSeqNull);
				}	
			}//endwith 
		}//endif IsPromoRec
		
	}//endwith sPromoBc
}
catch(e)
{
	TheApplication().SetProfileAttr(""ErrorPlanList"",""Y"");
	Outputs.SetProperty(""ErrorPlanList"",""Y"");
}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
 
    switch(MethodName)
     {
		case ""GetPLanList"":
		GetPLanList(Inputs, Outputs);
		return(CancelOperation);
		break;
		
     default:
          return (ContinueOperation);
       }
 
}
function GetCampMemberId(psInputs,psOutputs)
{
/* This BS is to get latest Wave# for the campaign.
   Inputs : Campaign Id, Primary Treatment Id, Wave Number, Treatment Type
*/

	// Variables
	var vApp:Application = TheApplication();
	var vBOCampaign:BusObject, vCampMemBC:BusComp;
	var vCampaignId = """", vTreatmentId = """", vMSISDN = """", vRowId = """";
	var isRecord = """";


	try
	{ // Try Start

		vBOCampaign = vApp.GetBusObject(""Campaign"");
		vCampMemBC = vBOCampaign.GetBusComp(""Campaign Members"");
		
		vCampaignId = psInputs.GetProperty(""vCampaignId""); //Fetching Campaign Id
		vTreatmentId = psInputs.GetProperty(""vTreatmentId""); //Fetching Treatment Id
		vMSISDN = psInputs.GetProperty(""vMSISDN""); //Fetching MSISDN

		with (vCampMemBC)
		{ // Mktg System Task bc

			SetViewMode(AllView);
			
			ActivateField(""Campaign Id"");
			ActivateField(""Treatment Id"");
			ActivateField(""Contact DUNS Number"");
			ActivateField(""Prospect DUNS Number"");

			ClearToQuery();
			SetSearchExpr(""[Campaign Id] = '"" + vCampaignId + ""' AND [Treatment Id] = '"" + vTreatmentId + ""' AND ([Contact DUNS Number] = '"" + vMSISDN + ""' OR [Prospect DUNS Number] = '"" + vMSISDN + ""')"");
			SetSortSpec(""Created(DESCENDING)"");
			
			ExecuteQuery(ForwardOnly);
			isRecord = FirstRecord();
			
			if(isRecord != null)
			{ 
				vRowId = GetFieldValue(""Id"");
			} // end of if

			psOutputs.SetProperty(""vRowId"",vRowId);

		} // Mktg System Task BC end
	} // Try End
	catch(e)
	{
		
	}
	finally
	{
		vRowId = null;
		isRecord = null;
		vMSISDN = null;
		vTreatmentId = null;
		vCampaignId = null;
		vCampMemBC = null;
		vBOCampaign = null;
		vApp = null;
	}

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""GetCampMemberId"")
	{
		GetCampMemberId(Inputs,Outputs);
		return(CancelOperation);
	}
	return (ContinueOperation);
}
function GetCardDetails(Inputs, Outputs)
{
	var sXMLHierarchy;
	var xmlHierarchy, smartCardData,miscellaneousTextData, item;
	var psInputs, psChildInputs, psOutputs, XMLService;
	var countSmartCardData, countMiscellaneousTextData, countItems, countAttr, i, j, k;
	var appObj;
	var tagName, itemKey, itemValue;
	
	try
	{
		sXMLHierarchy = Inputs.GetProperty(""xmlHierarchy"");
		appObj = TheApplication();
		xmlHierarchy = appObj.NewPropertySet();
		smartCardData = appObj.NewPropertySet();
		miscellaneousTextData = appObj.NewPropertySet();
		item = appObj.NewPropertySet();
		
		psInputs = appObj.NewPropertySet();
		psOutputs = appObj.NewPropertySet();
	
		XMLService = appObj.GetService(""Workflow Process Manager"");
		psInputs.SetProperty(""ProcessName"", ""STC XML To Hierarchy"");
		psInputs.SetProperty(""XMLDoc"",sXMLHierarchy);
		XMLService.InvokeMethod(""RunProcess"", psInputs, psOutputs);
		
		xmlHierarchy = psOutputs.GetChild(""XMLHier"");
		
		countSmartCardData = xmlHierarchy.GetChildCount();
		if (countSmartCardData > 0)
		{
			smartCardData = xmlHierarchy.GetChild(""SmartcardData"");
			countMiscellaneousTextData = smartCardData.GetChildCount();
			
			for ( i = 0; i <  countMiscellaneousTextData ; i++)
			{
				tagName = smartCardData.GetChild(i).GetType();
				if (tagName == ""MiscellaneousTextData"")
				{
					miscellaneousTextData = smartCardData.GetChild(i);
					countItems = miscellaneousTextData.GetChildCount();
					
					if(countItems > 0)
					{
						for (j = 0; j < countItems; j++)
						{
							item = miscellaneousTextData.GetChild(j);
							itemKey = item.GetProperty(""key"");
							itemValue = item.GetProperty(""value"");
							
							if (itemKey == ""FirstNameEnglish"")
							{
								var itemValueFName =  itemValue.substr( 0,100);
								Outputs.SetProperty(""FirstNameEnglish"",itemValueFName);
							}
							if (itemKey == ""LastNameEnglish"")
							{
								var itemValueLName = itemValue;
								if (itemValue == null || itemValue == """")
									itemValueLName = ""-"";
								Outputs.SetProperty(""LastNameEnglish"",itemValueLName);
							}
							if (itemKey == ""MiddleName1English"")
								Outputs.SetProperty(""MiddleName1English"",itemValue);
							if (itemKey == ""FlatNo"")
								Outputs.SetProperty(""FlatNo"",itemValue);
							if (itemKey == ""BuildingNo"")
								Outputs.SetProperty(""BuildingNo"",itemValue);
							if (itemKey == ""RoadNo"")
								Outputs.SetProperty(""RoadNo"",itemValue);
							if (itemKey == ""BlockNo"")
								Outputs.SetProperty(""BlockNo"",itemValue);
							if (itemKey == ""GovernorateNameEnglish"")
								Outputs.SetProperty(""GovernorateNameEnglish"",itemValue);
							if (itemKey == ""LfpNameEnglish"")
								Outputs.SetProperty(""LaborForceParticipation"",itemValue);
						}
					}
				}
			}
		}
		//appObj.RaiseErrorText(xmlHierarchy);
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
function GetCountry(Inputs, Outputs)
{
var CountryCode = Inputs.GetProperty(""CountryCode"");
var sCardCountry = Inputs.GetProperty(""CardCountry"");
var CardOccupation = Inputs.GetProperty(""CardOccupation"");
var sApp = TheApplication();
var SystemOccupation = sApp.InvokeMethod(""LookupValue"",""OCCUPATION"",""Others"");
var StrSearch = ""[Card Occupation] = '"" + CardOccupation + ""'"";
var Nationality = sApp.InvokeMethod(""LookupValue"",""STC_ADMIN"",CountryCode);
if (Nationality == null || Nationality =="""")
{
	sApp.InvokeMethod(""LookupValue"",""STC_GCC_NATIONALITY_CODE"",CountryCode);
}
var GCCCountryCode =  sApp.InvokeMethod(""LookupValue"",""STC_GCC_COUNTRY_CODE"",sCardCountry);


if (CardOccupation != null || CardOccupation != """")
{
var OccupationBO = sApp.GetBusObject(""STC Custom Occupation BO"");
var OccupationBC = OccupationBO.GetBusComp(""STC Custom Occupation BC"");
with(OccupationBC)
{
	
		ActivateField(""System Occupation"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchExpr(StrSearch);
	//	SetSearchSpec(""Card Occupation"",CardOccupation);
		ExecuteQuery(ForwardOnly);
		if(FirstRecord())
		{
			SystemOccupation =  GetFieldValue(""System Occupation"");
		}
}
}
Outputs.SetProperty(""SystemOccupation"",SystemOccupation);
Outputs.SetProperty(""Nationality"",Nationality);
Outputs.SetProperty(""GCCCountryCode"",GCCCountryCode);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{	
	switch(MethodName)
	{
		case ""GetCountry"":
			GetCountry(Inputs, Outputs);
			break;
		
		case ""GetCardDetails"":
			GetCardDetails(Inputs, Outputs);
			break;
			
		default:		
			return (ContinueOperation);
	}
	return (CancelOperation);
}
function Init(Inputs, Outputs)
{
	try
	{
		with (Outputs)
		{
			SetProperty(""STC Plan Name"","""");			
			SetProperty(""STC Child Line Eligible"","""");
			SetProperty(""STC Child Line Requested"","""");
			SetProperty(""STC VOBB Line Eligible"","""");
			SetProperty(""STC VOBB Line Requested"","""");
			SetProperty(""STCOrderId"","""");
		}
		//return(ContinueOperation);
	}
	catch(e)
	{
	LogException(e);
	}
	finally
	{
	}
}
function LogException(e)
{

	var appObj;
  	var Input;
  	var Output;
  	var CallMessageHandler;  
	try
 	{
		  appObj = TheApplication();
		  Input = appObj.NewPropertySet();
		  Output = appObj.NewPropertySet();
		  CallMessageHandler = appObj.GetService(""STC Generic Error Handler""); 
		  Input.SetProperty(""Error Code"", e.errCode);
		  Input.SetProperty(""Error Message"", e.errText);
		  Input.SetProperty(""Object Name"", ""STC DiscountProduct Service"");
		  Input.SetProperty(""Object Type"", ""Buisness Service"");
		  CallMessageHandler.InvokeMethod(""Log Message"", Input, Output);
 	}
 	catch(e)
 	{ 
  		
 	}
 	finally
 	{
 
		  CallMessageHandler = null;
		  Output = null;
		  Input = null;
		  appObj = null;
 	}
}
"//Suman to get Eligible Number of Shared and VOBB Lines for Parent Plan
function Query(Inputs,Outputs)
{
	try
	{
		var vApp:Application = TheApplication();
		var BillAccId,PartNum,VOBBLineCount,SharedLineCount,PlanName;
		var OrderId =vApp.GetProfileAttr(""STCOrderId"");
		var MACDOrderBO:BusObject = vApp.GetBusObject(""MACD Performance Order"");
		var MACDOrderBC:BusComp = MACDOrderBO.GetBusComp(""MACD Order Entry - Orders"");
		var MACDLineItems:BusComp = MACDOrderBO.GetBusComp(""MACD Order Entry - Line Items"");
		var LOVBO:BusObject = vApp.GetBusObject(""List Of Values"");
		var LOVBC:BusComp = LOVBO.GetBusComp(""List Of Values"");
		var PsOutputs:PropertySet = vApp.NewPropertySet();
		var spec = ""[Order Header Id] = '"" + OrderId + ""' AND [STC Plan Type] = 'Service Plan'"";
		var vCount=0;
		with(MACDOrderBC)
		{
	         SetViewMode(AllView);
			 ActivateField(""Billing Account Id"");
			 ClearToQuery();
			 SetSearchSpec(""Id"",OrderId);
			 ExecuteQuery(ForwardOnly);
			 var isRecord = FirstRecord(); 
			 if(isRecord)
			 {
			 	BillAccId = GetFieldValue(""Billing Account Id"");
			 	with(MACDLineItems)
			 	{
					SetViewMode(AllView);
					ActivateField(""Product Part Number"");
					ActivateField(""Product"");
					ClearToQuery();
					SetSearchExpr(spec);
					ExecuteQuery(ForwardOnly);
					var isLineRecord = FirstRecord(); 	
					if(isLineRecord)
					{
						PartNum = GetFieldValue(""Product Part Number"");
						PlanName = GetFieldValue(""Product"");				
					}//if(isLineRecord)

					//[2-June-2020] Guru added for 5G Mena addon sharing plan
					ActivateField(""STC Product Identifier"");
					ActivateField(""Action Code"");
					ClearToQuery();
					SetSearchExpr(""[Order Header Id] = '"" + OrderId + ""' AND [STC Product Identifier] = '5GContractAddons' AND [Action Code] <> 'Delete'"");
					ExecuteQuery(ForwardOnly);
					
					if(FirstRecord())
					{
						vCount=vCount+1;
					}
				}// end of 	with(MACDLineItems)
			 }// end of if(isRecord)
		}//end of MACDOrderBC
		var ParentPlanCheck = vApp.InvokeMethod(""LookupValue"", ""STC_SHBB_PLANTYPE"",PartNum);
		if(ParentPlanCheck.substring(0,6) == ""PARENT"")
		{
			var LOVspec = ""[High] = '"" + PartNum + ""' AND [Type] = 'STC_SHBB_PLANTYPE'"";
			with(LOVBC)
			{
				SetViewMode(AllView);
				ActivateField(""Description"");
				ActivateField(""High"");
				ActivateField(""Value"");
				ActivateField(""Low"");
				ActivateField(""Target High"");
				ActivateField(""Target Low"");
				ActivateField(""Weighting Factor"");
				ClearToQuery();
				SetSearchExpr(LOVspec);
				ExecuteQuery(ForwardOnly);
				var LOVRec = FirstRecord();
				if(LOVRec)
				{
					VOBBLineCount = GetFieldValue(""Target High"");
					SharedLineCount = GetFieldValue(""Target Low"");
				}// end of if(LOVRec)
				if(vCount>0)
				{
					SharedLineCount=ToNumber(SharedLineCount)+ToNumber(GetFieldValue(""Weighting Factor""));
				}
			
			}//with(LOVBC) end
			with(PsOutputs)
			{
				SetProperty(""STC Child Line Eligible"",SharedLineCount);
				SetProperty(""STC VOBB Line Eligible"",VOBBLineCount);
				SetProperty(""STC Plan Name"",PlanName);
				SetProperty(""STCOrderId"",OrderId);
				SetProperty(""STC Child Line Requested"",""0"");
				SetProperty(""STC VOBB Line Requested"",""0"");
			}
		}// end of if ParentPlanCheck
		else
		{
			with(PsOutputs){
			SetProperty(""STC Child Line Eligible"",""Plan Not Eligible"");
			SetProperty(""STC VOBB Line Eligible"",""Plan Not Eligible"");
			SetProperty(""STC Plan Name"",PlanName);
			SetProperty(""STCOrderId"",OrderId);
			SetProperty(""STC Child Line Requested"",""0"");
			SetProperty(""STC VOBB Line Requested"",""0"");
			}
		}
		
		
		
		Outputs.AddChild(PsOutputs);
	}//endtry
	finally
	{
		vApp = null;
	
	}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{ 
	var ireturn;
	var psInputs; 
	var psOutputs;

	try
	{
		ireturn = ContinueOperation;
		switch(MethodName)
		{
			case ""Init"":
					Init(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
			case ""Query"":
					Query(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
			
			case ""PreInsert"":
			ireturn = CancelOperation;
			break;
			
			default:
					//ireturn = ContinueOperation;
			break;
		}
	return (ireturn);
	}
	catch(e)
	{
	LogException(e);
	}
	finally
	{
	}
	return (ContinueOperation);
}
function Service_PreCanInvokeMethod (MethodName, &CanInvoke)
{
	if(MethodName == ""STC Get LOV Desc"")
	{
		CanInvoke = ""TRUE"";
		return(CancelOperation);
	}
	return (ContinueOperation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	/*	
		WIPRO-Upgrade
		Date - 29.04.2016
		Created By - Tushar
		Created this Generic BS to get Filename and Filepath from LOV Description
	*/
	if(MethodName == ""STC Get LOV Desc"")
	{
		var vLOVType = Inputs.GetProperty(""Type"");
		var vLIC = Inputs.GetProperty(""LIC"");
		var vDesc = """";
		try
		{
			var isRecord;
			var vBOLOV,vBCLOV;
	 
			vBOLOV = TheApplication().GetBusObject(""List Of Values"");
			vBCLOV = vBOLOV.GetBusComp(""List Of Values"");
     
			with(vBCLOV)
			{
				ActivateField(""Type"");
				ActivateField(""Name"");
				ActivateField(""Description"");
				SetViewMode(3);
				ClearToQuery();
				SetSearchSpec(""Type"",vLOVType);
				SetSearchSpec(""Name"",vLIC);
				ExecuteQuery(ForwardOnly);
				isRecord = FirstRecord();
				if(isRecord != null)
				{  
					vDesc = GetFieldValue(""Description"");
					Outputs.SetProperty(""Description"", vDesc);
				}
			}
		}
		catch(e)
		{
			Outputs.SetProperty(""Description"", vDesc);
			TheApplication().RaiseError(e.toString);
		}
		finally
		{
			vBCLOV = null;
			vBOLOV = null;
			isRecord = null;
			vDesc = null;
			vLIC = null;
			vLOVType = null;
		} 
		return (CancelOperation) ;
	}
	return (ContinueOperation);
}
"/*
---------------+------+--------+----------------------------------------------
Date(YYYYMMDD) | Ver  | By     | Description of Change
---------------+------+--------+----------------------------------------------
20120710       | 1.0  | Chiranjeevi | Created Generic BS to get LOV Values 
---------------+------+--------+----------------------------------------------
*/
function Getvalues(Inputs,Outputs)
{
 

 try
  {
   var ListBO = TheApplication().GetBusObject(""List Of Values"");
   var ListBC = ListBO.GetBusComp(""List Of Values"");
   var vType = Inputs.GetProperty(""LOV Type"");
   var vField = Inputs.GetProperty(""LOV Field"");
   var vValue = Inputs.GetProperty(""LOV Value"");
   var vDisplayValue ="""";
   var vLangIndptCode ="""";
   var vDescription ="""";
   var vTargetHigh ="""";
   var vTargetLow ="""";
   var vHigh ="""";
   var vLow ="""";
   var vParentLIC ="""";  
   var vDesc="""";    
   
   ListBC.ActivateField(""Type"");    //Type
   ListBC.ActivateField(""Value"");   //Display Value
   ListBC.ActivateField(""Name"");    //Language Independent Code
   ListBC.ActivateField(""Parent"");  // Parent LIC
   ListBC.ActivateField(""High"");   // High
   ListBC.ActivateField(""Low"");   // Low
   ListBC.ActivateField(""Target High""); // Target High
   ListBC.ActivateField(""Target Low""); // Target Low
   ListBC.ActivateField(""Description"");// Description

   ListBC.SetViewMode(AllView);
   ListBC.ClearToQuery();
   
   ListBC.SetSearchSpec(""Type"",vType);
   ListBC.SetSearchSpec(vField,vValue);
   ListBC.ExecuteQuery();
   var isRecord = ListBC.FirstRecord();
   if(isRecord)
   {
    vType = ListBC.GetFieldValue(""Type"");
    vDisplayValue = ListBC.GetFieldValue(""Value"");
    vLangIndptCode = ListBC.GetFieldValue(""Name"");
    vParentLIC = ListBC.GetFieldValue(""Parent"");
    vHigh = ListBC.GetFieldValue(""High"");
    vLow = ListBC.GetFieldValue(""Low"");
    vTargetHigh = ListBC.GetFieldValue(""Target High"");
    vTargetLow = ListBC.GetFieldValue(""Target Low"");
    vDescription = ListBC.GetFieldValue(""Description""); 
      
   }
    Outputs.SetProperty(""Display Value"", vDisplayValue);
    Outputs.SetProperty(""Language Independent Code"", vLangIndptCode);
    Outputs.SetProperty(""Description"", vDescription);
    Outputs.SetProperty(""Target High"", vTargetHigh);
    Outputs.SetProperty(""Target Low"", vTargetLow);
    Outputs.SetProperty(""High"", vHigh);
    Outputs.SetProperty(""Low"", vLow);
    Outputs.SetProperty(""Parent LIC"", vParentLIC);
  }
 catch(e)
  {
  throw(e.toString()); 
  }
  finally
  {
   ListBC = null;
   ListBO = null;
  } 



}
"/*
---------------+------+--------+----------------------------------------------
Date(YYYYMMDD) | Ver  | By     | Description of Change
---------------+------+--------+----------------------------------------------
20120710       | 1.0  | Chiranjeevi | Created Generic BS to get LOV Values 
---------------+------+--------+----------------------------------------------
*/
/*******To Get the LOV field value by querying two fields in the List Of Value Table*********/
function Getvaluesfields(Inputs,Outputs)
{
 try
 {
  var ListBO = TheApplication().GetBusObject(""List Of Values"");
  var ListBC = ListBO.GetBusComp(""List Of Values"");
  var vType = Inputs.GetProperty(""LOV Type"");
  var vField = Inputs.GetProperty(""LOV Field"");
  var vValue = Inputs.GetProperty(""LOV Value"");
  var vField1 = Inputs.GetProperty(""LOV Field1"");
  var vValue1 = Inputs.GetProperty(""LOV Value1"");
 
  var vDisplayValue ="""";
  var vLangIndptCode ="""";
  var vDescription ="""";
  var vTargetHigh ="""";
  var vTargetLow ="""";
  var vHigh ="""";
  var vLow ="""";
  var vParentLIC ="""";     
  
  ListBC.ActivateField(""Type"");    //Type
  ListBC.ActivateField(""Value"");   //Display Value
  ListBC.ActivateField(""Name"");    //Language Independent Code
  ListBC.ActivateField(""Parent"");  // Parent LIC
  ListBC.ActivateField(""High"");   // High
  ListBC.ActivateField(""Low"");   // Low
  ListBC.ActivateField(""Target High""); // Target High
  ListBC.ActivateField(""Target Low""); // Target Low
  ListBC.ActivateField(""Description""); //Description

  ListBC.SetViewMode(AllView);
  ListBC.ClearToQuery();
  
  ListBC.SetSearchSpec(""Type"",vType);
  ListBC.SetSearchSpec(vField,vValue);
  ListBC.SetSearchSpec(vField1,vValue1);

  ListBC.ExecuteQuery();
  var isRecord = ListBC.FirstRecord();
  if(isRecord)
  {
   vType = ListBC.GetFieldValue(""Type"");
   vDisplayValue = ListBC.GetFieldValue(""Value"");
   vLangIndptCode = ListBC.GetFieldValue(""Name"");
   vParentLIC = ListBC.GetFieldValue(""Parent"");
   vHigh = ListBC.GetFieldValue(""High"");
   vLow = ListBC.GetFieldValue(""Low"");
   vTargetHigh = ListBC.GetFieldValue(""Target High"");
   vTargetLow = ListBC.GetFieldValue(""Target Low"");
   vDescription = ListBC.GetFieldValue(""Description"");  
     
  }
  Outputs.SetProperty(""Display Value"", vDisplayValue);
  Outputs.SetProperty(""Language Independent Code"", vLangIndptCode);
  Outputs.SetProperty(""Description"", vDescription);
  Outputs.SetProperty(""Target High"", vTargetHigh);
  Outputs.SetProperty(""Target Low"", vTargetLow);
  Outputs.SetProperty(""High"", vHigh);
  Outputs.SetProperty(""Low"", vLow);
  Outputs.SetProperty(""Parent LIC"", vParentLIC);
 }
 catch(e)
 {
  throw(e.toString()); 
 }
 finally
 {
  ListBC = null;
  ListBO = null;
 } 
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{

 switch(MethodName) 
   {
    case ""GetLovValues"":
     Getvalues(Inputs,Outputs);
     break;

    case ""Getvaluesfields"":
     Getvaluesfields(Inputs,Outputs);
     break;

    default:
     break;
   
   
   }
  return(CancelOperation);

}
//Your public declarations go here...
function GetNotes(Inputs,Outputs)
{
 var StrSRId = Inputs.GetProperty(""SRId"");
 var Notes= """";
 var QueueName="""";
 var StrSerAccBO = TheApplication().GetBusObject(""Service Request"");
 var StrSerAccBC = StrSerAccBO.GetBusComp(""Service Request"");
 var NotesBC = StrSerAccBO.GetBusComp(""FIN Service Request Notes"");
 with(StrSerAccBC)
 {
  ActivateField(""STC SR Queue Name For Audit"");
  SetViewMode(AllView);
  ClearToQuery();
  SetSearchSpec(""SR Number"", StrSRId);
  ExecuteQuery(ForwardBackward);
  var SRRec = FirstRecord();
  if(SRRec)
  {
  var SerReId = GetFieldValue(""Id"");
  QueueName = GetFieldValue(""STC SR Queue Name For Audit"");
   with(NotesBC)
   {
    ActivateField(""Note"");
    SetViewMode(AllView);
    ClearToQuery();
    SetSearchSpec(""Service Request Id"", SerReId);
    SetSortSpec(""Created(DESCENDING)"");
    ExecuteQuery(ForwardBackward);
    var isNoteRec = FirstRecord();
    if(isNoteRec)
    {
     Notes = GetFieldValue(""Note"");
    }// end of if(isNoteRec)
   }//with(NotesBC)
  }//if(SRRec)
 }//with(StrSerAccBC)
 Outputs.SetProperty(""Notes"",Notes);
 Outputs.SetProperty(""QueueName"",QueueName);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
  if(MethodName == ""GetNotes"")
  {
  GetNotes(Inputs,Outputs);
  return CancelOperation;
  }
 
 return (ContinueOperation);
}
"//Your public declarations go here...  
"
function GetRenewalMSISDNList(Inputs,Outputs)
{
try
{

		var CANId = Inputs.GetProperty(""CustomerId"");
		var sAccBO = TheApplication().GetBusObject(""Single View Account BO"");
		var sSANBC = sAccBO.GetBusComp(""STC Thin CUT Service Sub Accounts Single View"");
		var MSISDNList = """", MSISDN = """";
			if(CANId != """")
			{
			   with(sSANBC){
			   ActivateField(""Master Account Id"")
			   ActivateField(""DUNS Number"");
			   ActivateField(""STC Contract Renewal Alert"");
			   ActivateField(""Account Status"");
		       ClearToQuery();
			   var searchst = ""[Master Account Id] = '"" + CANId + ""' AND [Account Status] = 'Active' AND ([STC Contract Renewal Alert]='Under Review' OR [STC Contract Renewal Alert]='Cancelled')"";
			   SetSearchExpr(searchst);
		       SetViewMode(AllView);
		     ExecuteQuery(ForwardBackward);
		     var count = CountRecords();
		     var IsMSISDNAvail = FirstRecord();
		     while(IsMSISDNAvail)
		     {
			 MSISDN = GetFieldValue(""DUNS Number"");
			 MSISDNList = MSISDNList + ""|"" + MSISDN;
			
		     IsMSISDNAvail = NextRecord();
		     }
		  }//with
		  Outputs.SetProperty(""MSISDNList"",MSISDNList);
		 }
		}
catch(e)
{	
}
finally
{
	sSANBC = null;
	sAccBO = null;
	
}
	
	return CancelOperation;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
		if(MethodName == ""GetRenewalMSISDNList""){
		GetRenewalMSISDNList(Inputs,Outputs);
		return CancelOperation;
	}
	return (ContinueOperation);
}
"//Your public declarations go here...  
"
function AddToDate(sourceDate, nMonths, nDays, nHours, nMinutes, nSeconds, nsign)
 {

// Parameters : // sourceDate : Date object // nDays, nHours , nMinutes , nSeconds : Integer numbers // nsign : Can have two values : 1 or -1 // 1 indicates to ADD to the sourceDate // -1 indicates to SUBTRACT from the sourceDate // Returns : A date object, after adding/subtracting // ndays,hNours,nMinutes // and nseconds to the sourceDate. 
var retDate = sourceDate; 
retDate.setMonth(retDate.getMonth()+nsign*nMonths);
retDate.setDate(retDate.getDate()+nsign*nDays); 
retDate.setHours(retDate.getHours()+nsign*nHours); 
retDate.setMinutes(retDate.getMinutes()+nsign*nMinutes); 
retDate.setSeconds(retDate.getSeconds()+nsign*nSeconds); 
return (retDate);
}
function CheckExp(vCampId)
{
	var eInput = TheApplication().NewPropertySet();
	var eOutput = TheApplication().NewPropertySet();
	var ChkExpBS = TheApplication().GetService(""Campaign Approval Process"");
	eInput.SetProperty(""CampaignId"", vCampId);
	ChkExpBS.InvokeMethod(""CheckExpDate"", eInput, eOutput);
	var vCampExpiryFlg = eOutput.GetProperty(""DateExpired"");
	return vCampExpiryFlg;
}
function DateToString(dDate) {

// Parameters : // dDate  : Date object // Returns : A string with the format ""mm/dd/yyyy"" or ""mm/dd/yyyy hh:mm:ss"" 

var sMonth = ToString(dDate.getMonth() + 1); 
if (sMonth.length == 1)
{
sMonth = ""0"" + sMonth;
} 
var sDay = ToString(dDate.getDate()); 
if (sDay.length == 1)
{
sDay = ""0"" + sDay;
} 
var sHours = ToString(dDate.getHours()); 
if (sHours.length == 1) 
{
sHours = ""0"" + sHours;
} 
var sMinutes = ToString(dDate.getMinutes());
if (sMinutes.length == 1)
{
sMinutes = ""0"" + sMinutes;
} 
var sSeconds = ToString(dDate.getSeconds());
if (sSeconds.length == 1) 
{
sSeconds = ""0"" + sSeconds;
} 
if (sHours == ""00"" && sMinutes == ""00"" && sSeconds == ""00"")
return (sMonth +""/""+ sDay +""/"" + dDate.getFullYear()) 
else
return (sMonth +""/""+ sDay +""/"" + dDate.getFullYear()); 
//return (sMonth +""/""+ sDay +""/"" + dDate.getFullYear() +"" ""+sHours+"":""+sMinutes+"":""+sSeconds);
}
function GetMSISDN(Inputs, Outputs)
{
	try
	{
		var vCampId = Inputs.GetProperty(""vCampId"");
		var vOfferName = Inputs.GetProperty(""vOfferName"");
		var vWaveNum = Inputs.GetProperty(""vWaveNum"");
		var vTreatmentType = Inputs.GetProperty(""vTreatmentType"");
		var vTreatmentId = Inputs.GetProperty(""vTreatmentId"");
		var vProdSerLen,vProdSerLenUOM;
		var vProdCharge = 0;//MAYANK: Added for Campaign Offer
		var vCampExpiryFlg = CheckExp(vCampId);
		var vProduct = null;
		
		
		//SUMANKL added for Performance issue
		var StartDate = """";
		var StartDateFormat = """";
		var vAddStartDate = TheApplication().InvokeMethod(""LookupValue"",""STC_CAMPAIGN_ORDER_TIME"",""DELAY"");
		var clibdate = new Date();
		//var clibdate = Clib.time();
		StartDate = AddToDate(clibdate, 0, 0, 0, 0, vAddStartDate, +1);
		StartDateFormat = DateToString(StartDate);
		//SUMANKL added for Performance issue
		

		if(vCampExpiryFlg == ""N"")
		{
			var vCampaignBO = TheApplication().GetBusObject(""Campaign"");
			var vCampContactBC = vCampaignBO.GetBusComp(""Campaign List Contact"");
			var vOfferBC = vCampaignBO.GetBusComp(""Parent Offer"");
			//var vProduct = GetProduct(vOfferName);SUMANK: for New Campaign Manager SD.
			// Added below code in main method: SUMANK
			with(vOfferBC)
			{
				SetViewMode(AllView);
				ActivateField(""Name"");
				ActivateField(""STC Product Service Length"");
				ActivateField(""STC Product Service Length UOM"");
				ActivateField(""Part Num"");
				ActivateField(""STC Product Charge"");//MAYANK: Added for Campaign Offer
				ClearToQuery();
				SetSearchSpec(""Name"",vOfferName);
				ExecuteQuery(ForwardOnly);
				if(FirstRecord()){
				vProduct = GetFieldValue(""Part Num"");
				vProdSerLen = GetFieldValue(""STC Product Service Length"");
				vProdSerLenUOM = GetFieldValue(""STC Product Service Length UOM"");
				vProdCharge = GetFieldValue(""STC Product Charge"");//MAYANK: Added for Campaign Offer
				}
			}
	// Added above code in main method: SUMANK
			var vSource = TheApplication().InvokeMethod(""LookupValue"",""STC_CAMPAIGN_SOURCE"",""Order"");
	
			with(vCampContactBC)
			{
				SetViewMode(AllView);
	
				ActivateField(""DUNS Number"");
				ActivateField(""Campaign Id"");
				ActivateField(""Treatment Type"");
				ActivateField(""Treatment Id"");
				ActivateField(""Campaign Source Code"");
				ActivateField(""Contact Id"");
				ActivateField(""Prospect Id"");
	
				ClearToQuery();
	
				SetSearchSpec(""Campaign Id"",vCampId);
				SetSearchSpec(""Treatment Id"",vTreatmentId);
				SetSearchSpec(""Wave Number"",vWaveNum);
				SetSearchSpec(""Treatment Type"",vTreatmentType);
	
				ExecuteQuery(ForwardOnly);
				var isRecord = FirstRecord();
	
				while(isRecord)
				{  
					var vCampaignCode = GetFieldValue(""Campaign Source Code"");
					var vMSISDN = GetFieldValue(""DUNS Number"");
					var vContactId = GetFieldValue(""Contact Id"");
					var vProspectId = GetFieldValue(""Prospect Id"");
					
					var wfBS = TheApplication().GetService(""Server Requests"");
					var InPS = TheApplication().NewPropertySet();
					var OutPS = TheApplication().NewPropertySet();
					var ChildPS = TheApplication().NewPropertySet();
					
					InPS.SetProperty(""Component"",""WfProcMgr"");
					InPS.SetProperty(""Mode"",""DirectDb"");
					InPS.SetProperty(""StartDate"",StartDateFormat);

					ChildPS.SetProperty(""ProcessName"",""STC CM Order Treatment WF"");
					ChildPS.SetProperty(""vCampId"",vCampId);
					ChildPS.SetProperty(""vOfferName"",vOfferName);
					ChildPS.SetProperty(""vTreatmentType"",vTreatmentType);
					ChildPS.SetProperty(""vTreatID"",vTreatmentId);
					ChildPS.SetProperty(""vCampExpiryFlg"",vCampExpiryFlg);
					ChildPS.SetProperty(""vProduct"",vProduct);
					ChildPS.SetProperty(""vSource"",vSource);
					ChildPS.SetProperty(""vCampaignCode"",vCampaignCode);
					ChildPS.SetProperty(""vMSISDN"",vMSISDN);
					ChildPS.SetProperty(""vContactId"",vContactId);
					ChildPS.SetProperty(""vProspectId"",vProspectId);
					ChildPS.SetProperty(""vProdSerLen"",vProdSerLen);
					ChildPS.SetProperty(""vProdSerLenUOM"",vProdSerLenUOM);
					ChildPS.SetProperty(""vProdCharge"",vProdCharge);//MAYANK: Added for Campaign Offer
					
					InPS.AddChild(ChildPS);
					wfBS.InvokeMethod(""SubmitRequest"",InPS,OutPS);

					isRecord = NextRecord();
				}    
			}
		}
		else
			LogError(vCampId);
	}
	catch(e)
	{
	}
	finally
	{
	}
}
function GetMSISDN_NEW(Inputs, Outputs)
{
	try
	{
		var sApp = TheApplication();
		var vCampId = Inputs.GetProperty(""vCampId"");
		var vOfferName = Inputs.GetProperty(""vOfferName"");
		var vWaveNum = Inputs.GetProperty(""vWaveNum"");
		var vTreatmentType = Inputs.GetProperty(""vTreatmentType"");
		var vTreatmentId = Inputs.GetProperty(""vTreatmentId"");
		var vProdSerLen,vProdSerLenUOM;
		var vProdCharge = 0;//MAYANK: Added for Campaign Offer
		var vCampExpiryFlg = CheckExp(vCampId);
		var vProduct = null;
		var BulkReqId;

		if(vCampExpiryFlg == ""N"")
		{
			var vCampaignBO = sApp.GetBusObject(""Campaign"");
			var vCampContactBC = vCampaignBO.GetBusComp(""Campaign List Contact"");
			var vOfferBC = vCampaignBO.GetBusComp(""Parent Offer"");
			//var vProduct = GetProduct(vOfferName);SUMANK: for New Campaign Manager SD.
			// Added below code in main method: SUMANK
			with(vOfferBC)
			{
				SetViewMode(AllView);
				ActivateField(""Name"");
				ActivateField(""STC Product Service Length"");
				ActivateField(""STC Product Service Length UOM"");
				ActivateField(""Part Num"");
				ActivateField(""STC Product Charge"");//MAYANK: Added for Campaign Offer
				ClearToQuery();
				SetSearchSpec(""Name"",vOfferName);
				ExecuteQuery(ForwardOnly);
				if(FirstRecord()){
				vProduct = GetFieldValue(""Part Num"");
				vProdSerLen = GetFieldValue(""STC Product Service Length"");
				vProdSerLenUOM = GetFieldValue(""STC Product Service Length UOM"");
				vProdCharge = GetFieldValue(""STC Product Charge"");//MAYANK: Added for Campaign Offer
				}
			}
	// Added above code in main method: SUMANK
			var vSource = TheApplication().InvokeMethod(""LookupValue"",""STC_CAMPAIGN_SOURCE"",""Order"");
	
			with(vCampContactBC)
			{
				SetViewMode(AllView);
	
				ActivateField(""DUNS Number"");
				ActivateField(""Campaign Id"");
				ActivateField(""Treatment Type"");
				ActivateField(""Treatment Id"");
				ActivateField(""Campaign Source Code"");
				ActivateField(""Contact Id"");
				ActivateField(""Prospect Id"");

				ClearToQuery();
	
				SetSearchSpec(""Campaign Id"",vCampId);
				SetSearchSpec(""Treatment Id"",vTreatmentId);
				SetSearchSpec(""Wave Number"",vWaveNum);
				SetSearchSpec(""Treatment Type"",vTreatmentType);
	
				ExecuteQuery(ForwardOnly);
				var isRecord = FirstRecord();
				if(isRecord)
				{
					var vCampaignCode = GetFieldValue(""Campaign Source Code"");
					var vMSISDN = GetFieldValue(""DUNS Number"");
					var vContactId = GetFieldValue(""Contact Id"");
					var vProspectId = GetFieldValue(""Prospect Id"");
	
					var wfBS = sApp.GetService(""Workflow Process Manager"");
					var InPS = sApp.NewPropertySet();
					var OutPS = sApp.NewPropertySet();
					InPS.SetProperty(""ProcessName"",""STC Insert Campaign Order Treatment Records WF"");
					InPS.SetProperty(""vCampId"",vCampId);
					InPS.SetProperty(""vOfferName"",vOfferName);
					InPS.SetProperty(""vTreatmentType"",vTreatmentType);
					InPS.SetProperty(""vTreatID"",vTreatmentId);
					InPS.SetProperty(""vCampExpiryFlg"",vCampExpiryFlg);
					InPS.SetProperty(""vProduct"",vProduct);
					InPS.SetProperty(""vSource"",vSource);
					InPS.SetProperty(""vCampaignCode"",vCampaignCode);
					InPS.SetProperty(""vMSISDN"",vMSISDN);
					InPS.SetProperty(""vWaveNum"",vWaveNum);
					InPS.SetProperty(""vContactId"",vContactId);
					InPS.SetProperty(""vProspectId"",vProspectId);
					InPS.SetProperty(""vProdSerLen"",vProdSerLen);
					InPS.SetProperty(""vProdSerLenUOM"",vProdSerLenUOM);
					InPS.SetProperty(""vProdCharge"",vProdCharge);//MAYANK: Added for Campaign Offer
					wfBS.InvokeMethod(""RunProcess"", InPS, OutPS);
					BulkReqId = OutPS.GetProperty(""BulkReqId"");
				}
			}
				
			var wfBS2 = sApp.GetService(""Workflow Process Manager"");
			var InPS2 = sApp.NewPropertySet();
			var OutPS2 = sApp.NewPropertySet();
			InPS2.SetProperty(""ProcessName"",""STC CM Order Treatment Batch WF"");
			InPS2.SetProperty(""Object Id"",vCampId);
			InPS2.SetProperty(""BulkReqId"",BulkReqId);
			wfBS2.InvokeMethod(""RunProcess"", InPS2, OutPS2);

		}
		else
			LogError(vCampId);
	}
	catch(e)
	{
//	TheApplication().RaiseError(e.toString());
	}
	finally
	{
	}
}
function GetProduct(vOfferName)
{
	var vCampaignBO = TheApplication().GetBusObject(""Campaign"");
	var vOfferBC = vCampaignBO.GetBusComp(""Parent Offer"");

	var vProduct = null;

	with(vOfferBC)
	{
		SetViewMode(AllView);
		ActivateField(""Name"");
		ActivateField(""Part Num"");
		ClearToQuery();
		SetSearchSpec(""Name"",vOfferName);
		ExecuteQuery(ForwardOnly);
		if(FirstRecord())
			vProduct = GetFieldValue(""Part Num"");
		return vProduct;
	}
}
function LogError(vCampId)
{
	var eInput = TheApplication().NewPropertySet();
	var eOutput = TheApplication().NewPropertySet();
	var CallMessageHandler = TheApplication().GetService(""STC Generic Error Handler"");
	eInput.SetProperty(""Error Code"", ""SBL-CAMP-EXP"");
	eInput.SetProperty(""Error Message"", ""This Campaign has Expired"");
	eInput.SetProperty(""Object Name"", ""STC Get Members of Order Campaign"");
	eInput.SetProperty(""Object Type"", ""Buisness Service"");
	eInput.SetProperty(""Siebel Message Request Text"", vCampId);
	CallMessageHandler.InvokeMethod(""Log Message"", eInput, eOutput);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""GetMSISDN"")
	{
		GetMSISDN(Inputs, Outputs);
		return (CancelOperation);
	}


		if(MethodName == ""GetMSISDN_NEW"")
	{
		GetMSISDN_NEW(Inputs, Outputs);
		return (CancelOperation);
	}



	return (ContinueOperation);
}
function GetOccupation(Inputs, Outputs)
{
var CardOccupation = Inputs.GetProperty(""CardOccupation"");
var sApp = TheApplication();
var SystemOccupation = sApp.InvokeMethod(""LookupValue"",""OCCUPATION"",""Others"");
var vSearchExpr = """";//[07Mar2017:NAVIN:TRASIMREG_P2
if (CardOccupation != null || CardOccupation !="""")
{
var OccupationBO = sApp.GetBusObject(""STC Custom Occupation BO"");
var OccupationBC = OccupationBO.GetBusComp(""STC Custom Occupation BC"");
with(OccupationBC)
{
		ActivateField(""System Occupation"");
		SetViewMode(AllView);
		ClearToQuery();
		//[07Mar2017:NAVIN:TRASIMREG_P2]
		//SetSearchSpec(""Card Occupation"",CardOccupation);
		vSearchExpr = ""[Card Occupation]='""+CardOccupation+""'"";
		SetSearchExpr(vSearchExpr);

		ExecuteQuery(ForwardOnly);
		if(FirstRecord())
		{
			SystemOccupation =  GetFieldValue(""System Occupation"");
		}
		
}
}

Outputs.SetProperty(""SystemOccupation"",SystemOccupation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{	
	switch(MethodName)
	{
		case ""GetOccupation"":
			GetOccupation(Inputs, Outputs);
			return(CancelOperation);
			break;
				
		default:		
			return (ContinueOperation);
	}
	return (CancelOperation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 if(MethodName == ""GetContractTenure"")
 {
  var strCurrentDt, strEndDt, strStartDt, MonthOfTenure=0, MonthOfUse=0, strMonthDiff=0;
  strStartDt  = Inputs.GetProperty(""Start Date"");
  strEndDt  = Inputs.GetProperty(""End Date"");
  //Set Date Object
  strCurrentDt = new Date;
  strEndDt   = new Date(strEndDt);
  strStartDt   = new Date(strStartDt);
  // Set time to 00:00:00 hrs // 
  strCurrentDt = new Date(strCurrentDt.setHours(0,0,0)); 
  strEndDt  = new Date(strEndDt.setHours(0,0,0));
  strStartDt  = new Date(strStartDt.setHours(0,0,0));
  // Set Date to 1st of the month //
  strCurrentDt = ToNumber(strCurrentDt.setDate(1));
  strEndDt   = ToNumber(strEndDt.setDate(1)); 
  strStartDt   = ToNumber(strStartDt.setDate(1)); 
   
  if( strEndDt > strCurrentDt ) 
  { 
   MonthOfTenure  = Math.floor((strEndDt-strStartDt)/(1000*60*60*24*30));
   MonthOfUse   = Math.floor((strCurrentDt-strStartDt)/(1000*60*60*24*30));
   strMonthDiff   = MonthOfTenure-MonthOfUse;
  }
  Outputs.SetProperty(""Tenure"", strMonthDiff);
 }
 return (CancelOperation);
}
function CheckRetentionOffer(Inputs, Outputs)
{
try{
var sMSISDN = Inputs.GetProperty(""MSISDN"");
var sDisLevel1 = Inputs.GetProperty(""DisLevel1"");
var sDisLevel2 = Inputs.GetProperty(""DisLevel2"");
var sPricingPlanType = Inputs.GetProperty(""PricingPlanType"");
var sAppObj = TheApplication();
Outputs.SetProperty(""ErrorOccured"",""N"");

if(sMSISDN == """" || sMSISDN == null){
	sAppObj.RaiseErrorText(""Please provide the MSISDN"");
	return(CancelOperation);}
if(sDisLevel1 == """" || sDisLevel1 == null){
sAppObj.RaiseErrorText(""Please provide Dissatisfaction Level1"");
	return(CancelOperation);}
if(sDisLevel2 == """" || sDisLevel2 == null){
sAppObj.RaiseErrorText(""Please provide Dissatisfaction Level2"");
	return(CancelOperation);}
if(sPricingPlanType == """" || sPricingPlanType == null){
sAppObj.RaiseErrorText(""Please provide Pricing Plan Type"");
	return(CancelOperation);}

		var sErrMsg = """";
		var sPreErrMsg = """";
		var sAssetExpr1 = """";
		var sAssetExpr2 = """";	
		
			var sSANBo = sAppObj.GetBusObject(""STC Service Account"");
		var sSANBc = sSANBo.GetBusComp(""CUT Service Sub Accounts"");
		var sAssetBc =  sSANBo.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
				
		var sAccntStatSus = sAppObj.InvokeMethod(""LookupValue"",""ACCOUNT_STATUS"",""Suspended"");
		var sAccntStatAct = sAppObj.InvokeMethod(""LookupValue"",""ACCOUNT_STATUS"",""Active"");
		var sAccntType = sAppObj.InvokeMethod(""LookupValue"",""STC_CUST_TYPE"",""Individual"");
		var sMSISDNStatAvail = sAppObj.InvokeMethod(""LookupValue"",""NM_NUMBER_STATUS"",""AVAILABLE"");
		var sAssetSusStat = sAppObj.InvokeMethod(""LookupValue"",""IMPL_PHASE"",""Suspended"");
		var sAssetActStat = sAppObj.InvokeMethod(""LookupValue"",""IMPL_PHASE"",""Active"");
		var sSuspReason = sAppObj.InvokeMethod(""LookupValue"",""STC_RTOFFER_SUSP_REASON"",""Suspend for Termination"");
		var sRetChkAddon = sAppObj.InvokeMethod(""LookupValue"",""STC_RET_CHK_ADDON"",""RETCHKADDON"");
		
		sErrMsg = ""Retention offers are not applicable for entered subscription ""+sMSISDN;
		
		with(sSANBc){
			ActivateField(""STC Retention Behavior"");
			ActivateField(""STC Retention Priority"");
			ActivateField(""Account Status"");
			ActivateField(""Type"");
			ActivateField(""STC Suspension Reason"");
			ActivateField(""STC Pricing Plan Type"");
			ActivateField(""STC Suspension Type Reason"");
			ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""DUNS Number"",sMSISDN);
			if(sPricingPlanType == ""Postpaid"")
				SetSearchSpec(""Account Status"",""Suspended"");
			else
				SetSearchSpec(""Account Status"",""Active"");
			ExecuteQuery(ForwardOnly);
			var IsSANRec = FirstRecord();
			if(IsSANRec){
				var sSANId  = GetFieldValue(""Id"");
				var sSANStatus = GetFieldValue(""Account Status"");
				var sBehavior  = GetFieldValue(""STC Retention Behavior"");
				var sPriority = GetFieldValue(""STC Retention Priority"");
				var sCustType = GetFieldValue(""Type"");
				//var sSANSusReason = GetFieldValue(""STC Suspension Reason"");
				var sSANSusReason = GetFieldValue(""STC Suspension Type Reason"");				
				//var sPricingPlanType = GetFieldValue(""STC Pricing Plan Type"");
				//For prepaid check the configured LOV should be true,then chekc for the prepaid 
				if(sPricingPlanType == ""Prepaid""){
					var sPreValidFlg = 	sAppObj.InvokeMethod(""LookupValue"",""STC_CHECK_RET_PREPAID"",""PrepaidCheck"");	
					if(sPreValidFlg != ""true""){
						sPreErrMsg = ""Retention offers are not applicable for entered subscription ""+sMSISDN;
						sAppObj.RaiseErrorText(sPreErrMsg);
						return(CancelOperation);
					}//endif
					if(sSANStatus != sAccntStatAct){
						sAppObj.RaiseErrorText(sErrMsg);
						return(CancelOperation);}
					//sAssetExpr1 = ""[Product Part Number] LIKE 'RETOFF*' AND [Status] ='""+sAssetActStat+""'"";
					sAssetExpr1 = ""[Product Part Number] LIKE'""+sRetChkAddon+""' AND [Status] ='""+sAssetActStat+""'"";
					sAssetExpr2 = ""[STC Plan Type] = 'Service Plan' AND [Status] = '""+sAssetActStat+""'"";
				}//endif sPricingPlanType == ""Prepaid""
				if(sPricingPlanType == ""Postpaid""){
					if(sSANStatus == sAccntStatSus && sSANSusReason != sSuspReason){ // 17-Nov-2014 Anchal: Modified condition
						sAppObj.RaiseErrorText(sErrMsg);
						return(CancelOperation);
					}
					//sAssetExpr1 = ""[Product Part Number] LIKE 'RETOFF*' AND [Status] ='""+sAssetSusStat+""'"";
					sAssetExpr1 = ""[Product Part Number] LIKE'""+sRetChkAddon+""'AND [Status] ='""+sAssetSusStat+""'"";
					sAssetExpr2 = ""[STC Plan Type] = 'Service Plan' AND [Status] = '""+sAssetSusStat+""'"";
				}//endif sPricingPlanType == ""Postpaid""
				//if(sSANStatus == sAccntStatSus && sSANSusReason == sSuspReason){
					if(sCustType == sAccntType){
						//var sMSISDNStat = CheckMSISDNStatus(sMSISDN);
						//if(sMSISDNStat == sMSISDNStatAvail){
							//var sExpr = ""[Product Part Number] LIKE '%RETOFF%' AND [Status] ='""+sAssetSusStat+""'"";
							with(sAssetBc){
								//ActivateField(""Product Part Number"");
								ClearToQuery();
								SetViewMode(AllView);
								SetSearchExpr(sAssetExpr1);
								ExecuteQuery(ForwardOnly);
								var sAssetRec = FirstRecord();
								if(sAssetRec){
										sAppObj.RaiseErrorText(""Customer is already benefitting from retention offer. New offer cannot be applied."");
										return(CancelOperation);
								}//endif sAssetRec
								else{
									ActivateField(""Product Part Number"");
									ActivateField(""Product Name"");
									ClearToQuery();
									SetViewMode(AllView);
									SetSearchExpr(sAssetExpr2);
									//SetSearchSpec(""STC Plan Type"",""Service Plan"");									
									//SetSearchSpec(""Status"",sAssetSusStat);
									ExecuteQuery(ForwardOnly);
									var sPlanRec = FirstRecord();
									if(sPlanRec){
										var sPlanName = GetFieldValue(""Product Name"");
										var sPlanPartNum = GetFieldValue(""Product Part Number"");
									}//endif sPlanRec
								}//endelse sAssetRec									
							}//endwith sAssetBc
						//}//endif
						//else
							//sAppObj.RaiseErrorText(""MSISDN is not in Available status"");
					}
					else{
						sAppObj.RaiseErrorText(""This facility is available for 'Individual' customers only"");
						return(CancelOperation);
					}						
			//	}//endif sSANStatus == sACStatus
			/*	else{
					sErrMsg = ""Retention offers are not applicable for entered subscription ""+sMSISDN;
					sAppObj.RaiseErrorText(sErrMsg);
				}//endelse sSANStatus == sACStatus */
								
			}//endif IsSANRec
			else{
				sErrMsg = ""Retention offers are not applicable for entered subscription ""+ sMSISDN +"".""; // 17-Nov-2014 Anchal: Modified for message change.
				//sErrMsg = ""Entered subscription ""+sMSISDN+"" does not exist"";
				sAppObj.RaiseErrorText(sErrMsg);
				return(CancelOperation);
			}//endelse 	IsSANRec	
		}//endwith sSANBc
		
		TheApplication().SetProfileAttr(""RetMSISDN"",sMSISDN);
		TheApplication().SetProfileAttr(""RetDisLevel1"",sDisLevel1);
		TheApplication().SetProfileAttr(""RetDisLevel2"",sDisLevel2);
		TheApplication().SetProfileAttr(""RetDisPlanName"",sPlanName);
		TheApplication().SetProfileAttr(""RetPricingPlanType"",sPricingPlanType);
		TheApplication().SetProfileAttr(""RetPartNumber"",sPlanPartNum);
		TheApplication().SetProfileAttr(""RetPriority"",sPriority);
		TheApplication().SetProfileAttr(""RetBehaviour"",sBehavior);
		TheApplication().SetProfileAttr(""RetSANId"",sSANId);
}
catch(e)
{
	TheApplication().SetProfileAttr(""ErrorOccured"",""Y"");
		Outputs.SetProperty(""ErrorOccured"",""Y"");
	TheApplication().RaiseErrorText(e.toString());

}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
 
    switch(MethodName)
     {
		case ""CheckRetentionOffer"":
		CheckRetentionOffer(Inputs, Outputs);
		return(CancelOperation);
		break;
		
     default:
          return (ContinueOperation);
       }
 
}
function GetVOBBSequence(Inputs, Outputs)
{
var MSISDN = Inputs.GetProperty(""MSISDN"");
var sApp = TheApplication();
var VOBBPassword = """";
var SequenceBO = sApp.GetBusObject(""STC Generic Seq Gen BO"");
var SequenceBC = SequenceBO.GetBusComp(""STC Generic Seq Gen BC"");
var spec  = ""[MSISDN] = '"" + MSISDN + ""' AND [Status] = 'Active'"";
with(SequenceBC)
{
	ActivateField(""MSISDN"");
	SetViewMode(AllView);
	ClearToQuery();
	SetSearchExpr(spec);
	ExecuteQuery();
	var isRec = FirstRecord();
	if(isRec)
	{
		SetFieldValue(""Status"", ""Inactive"");
		WriteRecord();
		Goto:CreateNew;
	}
	else
	{
		NewRecord();
		SetFieldValue(""MSISDN"", MSISDN);
		SetFieldValue(""Status"", ""Active"");
		WriteRecord();
		VOBBPassword = GetFieldValue(""Vobb Sequence Gen"");
	}
	
}

CreateNew:





}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
 
    switch(MethodName)
     {
		case ""GetVOBBSequence"":
		GetVOBBSequence(Inputs, Outputs);
		return(CancelOperation);
		break;
 
     default:
          return (ContinueOperation);
       }
 
}
function GetMSISDNDetails(Inputs, Outputs)
{
var MSISDN = Inputs.GetProperty(""MSISDN"");
    
var CUTSerBO = TheApplication().GetBusObject(""STC Thin CUT Service Sub Accounts Light BO"");
var CUTSerBC = CUTSerBO.GetBusComp(""STC Thin CUT Service Sub Accounts Light"");

	with(CUTSerBC)
	{
		ActivateField(""Type"");
		ActivateField(""STC Pricing Plan Type"");
		ActivateField(""Account Status"");
		ActivateField(""STC Contract Category"");
		ActivateField(""STC Package Type"");
		ActivateField(""STC External Profile Type"");
		ActivateField(""STC TRA Suspension Flag"");
		//[NAVIN:08Apr2019:CRMB2CEnhancements]
		ActivateField(""STC Individual Customer Type"");
		ActivateField(""STC Individual CR Number"");
		ActivateField(""STC Individual CR Cust Type"");
		ActivateField(""STC Individual CR CAN"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchExpr(""[DUNS Number] = '"" + MSISDN + ""' AND [STC Pricing Plan Type] = 'Postpaid'""); 
		SetSortSpec(""STC Activation Date(DESCENDING)"");
		ExecuteQuery(ForwardOnly);
		var MSISDNRec = FirstRecord();

		if(MSISDNRec)
		{
			with(Outputs)
			{
				SetProperty(""Name"",GetFieldValue(""Id""));
				SetProperty(""SANRec"",""YES"");
				SetProperty(""AccountSegment"",GetFieldValue(""STC Contract Category""));
				SetProperty(""AccountType"",GetFieldValue(""Type""));
				SetProperty(""PackageType"",GetFieldValue(""STC Package Type""));
				SetProperty(""ServiceType"",GetFieldValue(""STC Pricing Plan Type""));
				SetProperty(""Status"",GetFieldValue(""Account Status"")); 
				SetProperty(""AccountPlanType"",GetFieldValue(""STC External Profile Type"")); 
				SetProperty(""TRARegistrationStatus"",GetFieldValue(""STC TRA Suspension Flag""));
				SetProperty(""IUCFlag"",GetFieldValue(""STC Individual Customer Type""));
				SetProperty(""IUCCRNum"",GetFieldValue(""STC Individual CR Number""));
				SetProperty(""IUCCRCustType"",GetFieldValue(""STC Individual CR Cust Type""));
				SetProperty(""IUCCRCAN"",GetFieldValue(""STC Individual CR CAN""));
			}//end of with(Outputs)
		}
		else
		{
			Outputs.SetProperty(""SANRec"",""No"");
		}
	}//end of with(CUTSerBC)
	CUTSerBC = null;
	CUTSerBO = null;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	switch(MethodName)
	{
		case ""GetMSISDNDetails"":
			GetMSISDNDetails(Inputs, Outputs);
			return(CancelOperation);
			break;
		
		default:
			return (ContinueOperation);
	}
}
function DateToString(dDate) {

// Parameters : // dDate  : Date object // Returns : A string with the format ""mm/dd/yyyy"" or ""mm/dd/yyyy hh:mm:ss"" 

var date = dDate

var sMonth = ToString(dDate.getMonth() + 1); 
if (sMonth.length == 1)
{
sMonth = ""0"" + sMonth;
} 
var sDay = ToString(dDate.getDate()); 
if (sDay.length == 1)
{
sDay = ""0"" + sDay;
} 
var sHours = ToString(dDate.getHours()); 
if (sHours.length == 1) 
{
sHours = ""0"" + sHours;
} 
var sMinutes = ToString(dDate.getMinutes());
if (sMinutes.length == 1)
{
sMinutes = ""0"" + sMinutes;
} 
var sSeconds = ToString(dDate.getSeconds());
if (sSeconds.length == 1) 
{
sSeconds = ""0"" + sSeconds;
} 
//if (sHours == ""00"" && sMinutes == ""00"" && sSeconds == ""00"")
//return (sDay +""/""+ sMonth +""/"" + dDate.getFullYear()) 
//else
//return (sMonth +""/""+ sDay +""/"" + dDate.getFullYear()); 
return (sDay +""/""+ sMonth +""/"" + dDate.getFullYear() +"" ""+sHours+"":""+sMinutes+"":""+sSeconds);
}
function DiffTime(psInputs,psOutputs)
{
var timediff:Number = 0;
    var HAJJExpDate = new Date(psInputs.GetProperty(""Time1""));
    var HAJJExpDateSys = HAJJExpDate.toSystem();
    
 var CurrDate = new Date();
 var CurrDateSys = new Date(CurrDate);
 var sysdateCurrDate = CurrDateSys.toSystem();
   
    
    timediff = ToNumber(HAJJExpDateSys - sysdateCurrDate);
    
    timediff = timediff - 36000;
psOutputs.SetProperty(""timediff"",timediff);
}
function GenSMSList(psInputs,psOutputs)
{
 var vApp = TheApplication();
 var AssetBC = vApp.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset"");
 var spec  = ""[Status] <> 'Inactive' AND [Product Part Number] LIKE 'VIVAHAJJDIS*'AND [Effective End Date] IS NOT NULL"";
 var vMSISDN, isRecord, isRecordTreatment;
 var vFileName;
 var vTemplateText = ""Dear Customer, Dear customer, your Unlimited Data Weekly add-on will expire."";
 var vFP;
 var vCommaFlag = ""0"";
 var strError = """";
 var vFilePathLOV = ""STC_ADMIN"";
 var vLIC = ""HAJJSMS"";
 var Product = ""Unlimited Data Weekly add-on ""
 var strFilePath = GetLOVDesc(vFilePathLOV,vLIC);
 var strFilePath1 = ""c:\\"";
 var vDTime = GetTimeStamp();
 try //Start of Try block
    {
      vFileName = ""CRM_HAJJ_SMS""+ ""_""+ vDTime +"".dat"";
     vFP = Clib.fopen(strFilePath + vFileName,""w"");
     if(vFP != null) // If vFP is NULL it means that File have not been created else continue Operation
     {  
     with(AssetBC)
        {
     ActivateField(""Effective End Date"");
     ActivateField(""Serial Number"");
     SetViewMode(AllView);
     ClearToQuery();
     SetSearchExpr(spec);
     ExecuteQuery(ForwardOnly);
     var AssRec = FirstRecord();
         while(AssRec)
          {  
           var enddate =  new Date(GetFieldValue(""Effective End Date""));
     vMSISDN = GetFieldValue(""Serial Number"");
     if(enddate != '' || enddate != null || enddate != """")
     {
     var IntDatesys = new Date(enddate);
     var sysintdate = IntDatesys.toSystem();
     var CurrDate = new Date();
     var CurrDateSys = new Date(CurrDate);
     var sysdateCurrDate = CurrDateSys.toSystem();
     var daydiff = (sysintdate - sysdateCurrDate);
    // var Finaldays = Math.round((daydiff/(60*60*24*)));
    var Finaldays = ToNumber(daydiff/(60*60*24));
            if(Finaldays >= 2)
      {
       
       enddate = new Date(enddate);
       enddate = DateToString(enddate);
       vTemplateText = enddate +""|""+""ON 7 to 98653"";
       
       if(vCommaFlag == ""0"")
       {
       Clib.fputs(vMSISDN+""|""+Product+""|""+vTemplateText, vFP);
       
       }                      
       else
       {
       Clib.fputs(""\n""+vMSISDN+""|""+Product+""|""+vTemplateText, vFP);
       }
        vCommaFlag = ""1"";
          }// end of  if(Finaldays < 2 && Finaldays > 0)
        }// end of  if(enddate != '' || enddate != null || enddate != """")
          
            AssRec = NextRecord();
        }    
    //   Clib.fputs(""\n""+""EOF"",vFP); // Marking End Of File 
   }
   
   if(Clib.fclose(vFP) != 0)
   {
    strError = strError + ""****SMS file not closed****"";
   }
  }
  else
  {
   strError = strError + ""****Could not create SMS File****"";
  } 
 } // End of Try Block
    catch(e)
    {
  TheApplication().RaiseError(strError + e.toString());
    }
    finally //Releasing all the memory occupied by the objects
    {

    }
}
function GetLOVDesc(Type, LIC)
{
 var vLOVType = Type;
 var vLIC = LIC;
 
 var vDesc ="""";
 var isRecord;
 var vBOLOV,vBCLOV;
 
 try
 {
  vBOLOV = TheApplication().GetBusObject(""List Of Values"");
     vBCLOV = vBOLOV.GetBusComp(""List Of Values"");
     
 
  with(vBCLOV)
     {
     SetViewMode(3);
      ActivateField(""Type"");
     ActivateField(""Description"");
      ActivateField(""Name"");
      ClearToQuery();
      SetSearchSpec(""Type"",vLOVType);
      SetSearchSpec(""Name"",vLIC);
      ExecuteQuery(ForwardOnly);
      isRecord = FirstRecord();
   if(isRecord != null)
   {  
          vDesc = GetFieldValue(""Description"");  
   }   
   return(vDesc);    
  }
 }
 catch(e)
 {
  TheApplication().RaiseError(e.toString);
  return(vDesc);  
 }
 finally
 {
  vBOLOV = null;
  vBCLOV = null;
 
 } 
}
function GetLOVLIC(Type, Value)
{
 var vLOVType = Type;
 var vValue = Value;
 var vLIC = """";
 var isRecord;
 var vBOLOV,vBCLOV;
 
 try
 {
  vBOLOV = TheApplication().GetBusObject(""List Of Values"");
     vBCLOV = vBOLOV.GetBusComp(""List Of Values"");
     
  with(vBCLOV)
     {
     SetViewMode(3);
      ActivateField(""Type"");
     ActivateField(""Value"");
      ActivateField(""Name"");
      ClearToQuery();
      SetSearchSpec(""Type"",vLOVType);
      SetSearchSpec(""Value"",vValue);
      ExecuteQuery(ForwardOnly);
      isRecord = FirstRecord();
   if(isRecord != null)
   {  
          vLIC = GetFieldValue(""Name"");  
   }   
   return(vLIC);    
  }
 }
 catch(e)
 {
  TheApplication().RaiseError(e.toString);
  return(vLIC);  
 }
 finally
 {
  vBOLOV = null;
  vBCLOV = null;
 
 } 
}
function GetTimeStamp()
{
 var SysDate = Clib.time();
 var ObjDate = Date.fromSystem(SysDate); 

 var Month = ToString(ObjDate.getMonth()+1);
  if(Month.length == 1)   
   {
    Month = ""0"" + Month;
   }
 var Day = ToString(ObjDate.getDate());
  if(Day.length == 1)
   {
    Day = ""0"" + Day;
   }
 var Year = ToString(ObjDate.getFullYear());
 var Hour = ToString(ObjDate.getHours());
  if(Hour.length == 1)
   {
    Hour = ""0"" + Hour;
   }
 var Minute = ToString(ObjDate.getMinutes());
  if(Minute.length == 1)
   {
    Minute = ""0"" + Minute;
   }
 var Second = ToString(ObjDate.getSeconds()); 
  if(Second.length == 1)
   {
    Second = ""0"" + Second;
   }

 var now = Day+""""+Month+""""+Year+""""+Hour+""""+Minute+""""+Second; 

 return(now);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
if(MethodName == ""GenSMSList"")
 {
  GenSMSList(Inputs,Outputs);
  return(CancelOperation);
 }

if(MethodName == ""DiffTime"")
 {
  DiffTime(Inputs,Outputs);
  return(CancelOperation);
 }
  
 return (ContinueOperation);
}
function GetBanId(Inputs,Outputs)
{
	var recCount,iRec,sumMRC,sCalcMRC;
	try
 	{
		var AppObj = TheApplication();
		var vBANId = Inputs.GetProperty(""BANId"");
		var vCL = Inputs.GetProperty(""NewCL"");
		var billAccountBO = AppObj.GetBusObject(""STC Billing Account"");
		var assetBC = billAccountBO.GetBusComp(""Asset Mgmt - Asset (Order Mgmt)"");
		
		sumMRC= 0;
		
		with (assetBC)
		{
			ActivateField(""Billing Account Id"");
			ActivateField(""Status"");
			ActivateField(""Parent Asset Id"");
			ActivateField(""STC Plan Segregation"");
			ActivateField(""STC App AddOn"");
			ActivateField(""Adjusted List Price"");
			
			ClearToQuery();
			SetViewMode(AllView);

			SetSearchExpr(""[Billing Account Id] = '"" + vBANId + ""' AND ([Status] <> 'Inactive' OR [Status] <> 'Terminated') AND [Parent Asset Id] is null"");
			ExecuteQuery(ForwardOnly);
			recCount = CountRecords();
			
			ClearToQuery();
			SetViewMode(AllView);
			
			SetSearchExpr(""[Billing Account Id] = '"" + vBANId + ""' AND ([Status] <> 'Inactive' OR [Status] <> 'Terminated') AND ([STC Plan Segregation] IS NOT NULL OR [STC App AddOn] IS NOT NULL)"");
			ExecuteQuery(ForwardOnly);
			iRec = FirstRecord();
			while(iRec)
			{
				var iMRC = GetFieldValue(""Adjusted List Price"");
				if (iMRC == """" || iMRC == null)
					iMRC = 0;
				
				sumMRC = sumMRC + ToNumber(iMRC);
				
				iRec = NextRecord();
			}
			
			sCalcMRC = sumMRC + ( recCount * 10);
			
			if(sCalcMRC > vCL)
			{
				Outputs.SetProperty(""FinalCL"",sCalcMRC);
				return(CancelOperation);
			}
			else
			{
				Outputs.SetProperty(""FinalCL"",vCL);
			}
			return(CancelOperation);
		}//end with
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
		assetBC = null;
		billAccountBO = null;
		AppObj = null;
	}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
if(MethodName == ""GetBanId"")
  { 
   GetBanId(Inputs,Outputs)
   return(CancelOperation);
   }
	return (ContinueOperation);
}
function Init(Inputs, Outputs)
{
	try
	{
		with (Outputs)
		{
			SetProperty(""MSISDN"","""");
			SetProperty(""Subscription#"","""");
			SetProperty(""SelectFlag"","""");
		}
		//return(ContinueOperation);
	}
	catch(e)
	{
	LogException(e);
	}
	finally
	{
	}
}
function LogException(e)
{

	var appObj;
  	var Input;
  	var Output;
  	var CallMessageHandler;  
	try
 	{
		  appObj = TheApplication();
		  Input = appObj.NewPropertySet();
		  Output = appObj.NewPropertySet();
		  CallMessageHandler = appObj.GetService(""STC Generic Error Handler""); 
		  Input.SetProperty(""Error Code"", e.errCode);
		  Input.SetProperty(""Error Message"", e.errText);
		  Input.SetProperty(""Object Name"", ""STC ISL VIP MSISDN Select BS"");
		  Input.SetProperty(""Object Type"", ""Buisness Service"");
		  CallMessageHandler.InvokeMethod(""Log Message"", Input, Output);
 	}
 	catch(e)
 	{ 
  		
 	}
 	finally
 	{
 
		  CallMessageHandler = null;
		  Output = null;
		  Input = null;
		  appObj = null;
 	}
}
function Query(Inputs,Outputs)
{
//***********************************************************************************************************//
//Author: Manu Antony
//Release: VIPABFPVerification
//*************************************************************************************************************//
	try
	{
  var sAccBO = TheApplication().GetBusObject(""Account"");
  var sSANBc = sAccBO.GetBusComp(""CUT Service Sub Accounts"");
  var SANId = """", AccountNumber = """", OutputPS = """";var PsChildRec = """", MSISDN = """";
  var CANId = TheApplication().GetProfileAttr(""CustomerId"");
  var spec = ""[Master Account Id] = '"" + CANId + ""' AND ([Account Status] <> 'Terminated' AND [Account Status] <> 'New') AND ([STC Registration Flag] IS NULL OR [STC Registration Flag]='N') AND [STC ISL Audit Id] IS NULL"";
  
  if(CANId != """")
  {
	   with(sSANBc){
       ActivateField(""STC Pricing Plan Type"");
	   ActivateField(""Master Account Id"")
	   ActivateField(""Account Number"");
	   ActivateField(""Account Status"");
	   ActivateField(""DUNS Number"");
	   ActivateField(""STC Registration Flag"");
	   ActivateField(""STC ISL Audit Id"");
	   SetViewMode(AllView);
       ClearToQuery();
	   SetSearchExpr(spec);
       
     ExecuteQuery(ForwardOnly);
     var count = CountRecords();
     var IsSANAvail = FirstRecord();
     while(IsSANAvail)
     {
	 PsChildRec = TheApplication().NewPropertySet();
     SANId = GetFieldValue(""Id"");
	 AccountNumber = GetFieldValue(""Account Number"");
	 MSISDN = GetFieldValue(""DUNS Number"");
     
    with (PsChildRec)
	{
		SetProperty(""Subscription#"",AccountNumber);
		SetProperty(""MSISDN"",MSISDN);
	}
			
	 Outputs.AddChild(PsChildRec);  
     IsSANAvail = NextRecord();
     }
  
  }//with
	
	
	}

}
catch(e)
 {
		LogException(e);
		var psRec = TheApplication().NewPropertySet();
		psRec.SetProperty(""MSISDN"" , ""Error Occurred"");
		psRec.SetProperty(""Subscription#"" , e.errCode() + "":"" + e.errText());
		Outputs.AddChild(psRec);
 }
 finally
 {
  sSANBc = null;
  sAccBO = null;
  SANId = null;
  AccountNumber = null;
  PsChildRec = null;
  
 }
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{ 
	var ireturn;
	var psInputs; 
	var psOutputs;

	try
	{
		ireturn = ContinueOperation;
		switch(MethodName)
		{
			case ""Init"":
					Init(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
			case ""Query"":
					Query(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
			
			case ""PreInsert"":
			ireturn = CancelOperation;
			break;		
			default:
					//ireturn = ContinueOperation;
					break;
		}
	return (ireturn);
	}
	catch(e)
	{
	LogException(e);
	}
	finally
	{
	}
	return (ContinueOperation);
}
"//function CreateAPN(APNIPAddress,APNStartPort,APNEndPort,i)
function CreateAPN(APNIPAddress,i)
{
	var RecCount = i;		
	var vBC: BusComp = TheApplication().GetBusObject(""STC APN Details BO"").GetBusComp(""STC APN IP Details BC"");
	var STCIPType = TheApplication().GetProfileAttr(""STCIPType"");
    var STCAPNName = TheApplication().GetProfileAttr(""STCAPNName"");
    var STCAPNType = TheApplication().GetProfileAttr(""STCAPNType"");
    var STCAPNId = TheApplication().GetProfileAttr(""STCAPNId"");
    var STCCNTX = TheApplication().GetProfileAttr(""STCCNTX"");//Prod Fix
    var STCTemplateId = TheApplication().GetProfileAttr(""STCTemplateId"");//Prod Fix
    
	var vImportStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_ADJ_IMP_STAT"",""Upload Success"");
	with(vBC)
	{
		while(RecCount > 1)
		{
			RecCount--;
			ClearToQuery();
			ActivateField(""STC IP Address"");
			ActivateField(""STC Service Request ID"");
			//ActivateField(""APN CNTX Id"");//Prod Fix
			//ActivateField(""APN Template Id"");//Prod Fix
			SetSearchSpec(""STC IP Address"",APNIPAddress[RecCount]);
			SetSearchSpec(""STC Service Request ID"",STCAPNId);
			ExecuteQuery(ForwardBackward);
			if(FirstRecord())
			{
			}
			else
			{
			var svcbsService = TheApplication().GetService(""Workflow Process Manager"");
		var psiPS = TheApplication().NewPropertySet();
		var psoPS = TheApplication().NewPropertySet();
		psiPS.SetProperty(""ProcessName"", ""STC Insert APN Detail Workflow"");
		psiPS.SetProperty(""Object Id"",STCAPNId);
		psiPS.SetProperty(""CNTXId"",STCCNTX);
		psiPS.SetProperty(""TempleteId"",STCTemplateId);
		psiPS.SetProperty(""STC IP Address"",APNIPAddress[RecCount]);
		psiPS.SetProperty(""STC APN Name"",STCAPNName);
		psiPS.SetProperty(""STC IP Type"",STCIPType);
		psiPS.SetProperty(""STC APN Type"",STCAPNType);
		svcbsService.InvokeMethod(""RunProcess"", psiPS, psoPS);
			/*NewRecord(NewAfter);
			//RecCount--;
			//SetFieldValue(""STC APN Start Port Num"",APNStartPort[RecCount]);
			SetFieldValue(""STC IP Address"",APNIPAddress[RecCount]);
			//SetFieldValue(""STC IP Address"",APNIPAddress[RecCount]);
			//SetFieldValue(""STC APN End Port Num"",APNEndPort[RecCount]);
			SetFieldValue(""STC IP Type"",STCIPType);
			//SetFieldValue(""APN Template Id"",STCTemplateId);//Prod Fix
			//SetFieldValue(""APN CNTX Id"",STCCNTX);//Prod Fix
			SetFieldValue(""STC APN Name"",STCAPNName);
			SetFieldValue(""STC APN Type"",STCAPNType);
			SetFieldValue(""STC Service Request ID"",STCAPNId);	
			WriteRecord();*/
			}
		}
	}
}
function ImportData(Inputs, Outputs)
{
	var vInputFile      = """";
    var vReadFromFile   = """";
    var vBulkDataArray  = """";
    var vFileName   = Inputs.GetProperty(""FileName"");
  	var vFileType     = ToString(Inputs.GetProperty(""FileType""));
  	//var vBCBRBuscomp: BusComp = TheApplication().GetBusObject(""STC Bulk Request Data BO"").GetBusComp(""STC Bulk Request Data"");
 	vFileType       = Clib.strlwr(vFileType);
 	var APNIPAddress: Array = new Array();
 	var APNStartPort: Array = new Array();
 	var APNEndPort: Array = new Array();
 	var vRecord = false;
    if( vFileType != ""csv"")
    {
       TheApplication().RaiseErrorText(""Please check the File Type , It should be :  FileName.CSV"");
    }
    vInputFile     = Clib.fopen(vFileName , ""rt"");       
    vReadFromFile  = Clib.fgets(vInputFile);	
	//var DeviceEligible = """";
	//var BlackListLvl = """";
	var i = 1;
	var ErrMsg = ""Success"";
	if(vReadFromFile != null && vFileName != '' && vFileName != """")
	{		
		if (vInputFile == null)
		{
			TheApplication().RaiseErrorText(""Error in opening the file"");
		}
		 while((vReadFromFile != null) && (vReadFromFile.length > 1))
		 {			
			ErrMsg = """"; //Nullify Error Message for each of the iteration			
			if(vReadFromFile != null && vReadFromFile != """")
			{
				vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
				var sRecData = vReadFromFile.split("","");
				APNIPAddress[i] = sRecData[0];				
				//APNStartPort[i] = sRecData[1];
				//APNEndPort[i] = sRecData[2];
				//APNEndPort[i] = APNEndPort[i].substring(0,2);			
				i++;
			}//if(sReadFromFile != null && sReadFromFile != """")
			vReadFromFile = Clib.fgets(vInputFile);
		 }//while(!Clib.feof(sFileOpen))
		 //CreateAPN(APNIPAddress,APNStartPort,APNEndPort,i);		
		 CreateAPN(APNIPAddress,i);	
		
	}//if(sFileName != null && sFileName != '' && sFileName != """")
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	 try
	 {
	    switch(MethodName)
	     {     
		     case ""ImportData"":
		     ImportData(Inputs,Outputs);
		     return(CancelOperation);
		     break;		     

	      	 default:
	         break;
	     }
	 }
	 catch (exc)
	 {
	 	throw(exc.toString());
	 }
	 finally 
	 {
	 }  
}
function AttachFile(sAbsoluteFileName){

var boTest;
var bcTestAttach;
var sGetFileReturn = """";
//var sAbsoluteFileName = ""C:\foo.doc"";
try {
boTest = TheApplication().GetBusObject(""Action"");
bcTestAttach = boTest.GetBusComp(""Action Attachment"");
with (bcTestAttach)
{
NewRecord(NewAfter);
SetFieldValue(""Name"", ""TestAttachment"");
SetFieldValue(""FileSrcType"", ""FILE"");
WriteRecord();
sGetFileReturn = InvokeMethod(""CreateFile"", sAbsoluteFileName, ""AttachmentName"", ""N"");

if (sGetFileReturn != ""Success"")

throw(""Error attaching file!"");

}

}

catch(e)

{

TheApplication().RaiseErrorText(e.toString());

}

finally

{

bcTestAttach = null;

boTestAttach = null;

}

}
function AttachFile(sAbsoluteFileName){

var boTest;
var bcTestAttach;
var sGetFileReturn = """";
//var sAbsoluteFileName = ""C:\foo.doc"";
try {
boTest = TheApplication().GetBusObject(""Action"");
bcTestAttach = boTest.GetBusComp(""Action Attachment"");
with (bcTestAttach)
{
NewRecord(NewAfter);
SetFieldValue(""Name"", ""TestAttachment"");
SetFieldValue(""FileSrcType"", ""FILE"");
WriteRecord();
sGetFileReturn = InvokeMethod(""CreateFile"", sAbsoluteFileName, ""AttachmentName"", ""N"");

if (sGetFileReturn != ""Success"")

throw(""Error attaching file!"");

}

}

catch(e)

{

TheApplication().RaiseErrorText(e.toString());

}

finally

{

bcTestAttach = null;

boTest = null;

}

}
function CreateMSISDN(MSISDNNumber,AdjustmentAmount,ChargingType,AdjustmentType,FinancialImpact,i)//[MANUJ] : [Adjustment Automation]
{
	var RecCount = i;		
	var vBC: BusComp = TheApplication().GetBusObject(""Service Request"").GetBusComp(""FS Invoice Adjustment Items"");
	var vAdjustmentId = TheApplication().GetProfileAttr(""STCAdjustmentId"");
	var vImportStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_ADJ_IMP_STAT"",""Upload Success"");
	with(vBC)
	{
		while(RecCount > 1)
		{
			NewRecord(NewAfter);
			RecCount--;
			ActivateField(""Request Currency"");
			SetFieldValue(""Request Currency"",""BHD"");
			SetFieldValue(""Billing Account Number"",MSISDNNumber[RecCount]);//[MANUJ] : [Adjustment Automation]
			SetFieldValue(""Request Amt"",AdjustmentAmount[RecCount]);
			SetFieldValue(""Charging Type"",ChargingType[RecCount]);//[MANUJ] : [Adjustment Automation]
			//[MANUJ] : [Adjustment Automation Phase 3]
			SetFieldValue(""Adjustment Type"",AdjustmentType[RecCount]);
			SetFieldValue(""Financial Impact"",FinancialImpact[RecCount]);
			SetFieldValue(""Status"",""Open"");
			SetFieldValue(""Invoice Adj ID"",vAdjustmentId);
			SetFieldValue(""STC Import Status"",vImportStatus);	
			WriteRecord();
		}
	}
}
function CreateMSISDN(MSISDNNumber,AdjustmentAmount,ChargingType,AdjustmentType,FinancialImpact,VATAdjustmentType,VATServiceType,VATApplication,UnbillFlag,StartDate,EndDate,BillNo,ProductName,ItemName,i)//[MANUJ] : [Adjustment Automation]
{
	var RecCount = i;		
	var vBC: BusComp = TheApplication().GetBusObject(""Service Request"").GetBusComp(""FS Invoice Adjustment Items"");
	var vAdjustmentId = TheApplication().GetProfileAttr(""STCAdjustmentId"");
	var vImportStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_ADJ_IMP_STAT"",""Upload Success"");
	var vCustomerType= TheApplication().GetProfileAttr(""STCCustomerType""); // OMKAR Added for VAT Enhancement
//	var  vStartDate= new Date(StartDate[RecCount]);
  // var vEndDate= new Date(EndDate[RecCount]);
	with(vBC)
	{
		while(RecCount > 1)
		{
			NewRecord(NewAfter);
			RecCount--;
			//TheApplication().RaiseErrorText(VATApplication[RecCount]);
			ActivateField(""Request Currency"");
			SetFieldValue(""STC VAT Application"",VATApplication[RecCount]);
			SetFieldValue(""Request Currency"",""BHD"");
			//TheApplication().RaiseErrorText(MSISDNNumber[RecCount]+"":""+AdjustmentAmount[RecCount]+"":""+ChargingType[RecCount]+"":""+AdjustmentType[RecCount]+"":""+FinancialImpact[RecCount]+"":""+VATApplication[RecCount]+"":""+VATAdjustmentType[RecCount]+"":""+VATServiceType[RecCount]);
			SetFieldValue(""Billing Account Number"",MSISDNNumber[RecCount]);//[MANUJ] : [Adjustment Automation]
			SetFieldValue(""Request Amt"",AdjustmentAmount[RecCount]);
			SetFieldValue(""Charging Type"",ChargingType[RecCount]);//[MANUJ] : [Adjustment Automation]
			//[MANUJ] : [Adjustment Automation Phase 3]
			SetFieldValue(""Adjustment Type"",AdjustmentType[RecCount]);
			SetFieldValue(""Financial Impact"",FinancialImpact[RecCount]);
		//TheApplication().RaiseErrorText(""StarteDate"",StartDate[RecCount]);
			SetFieldValue(""STC UnbillAdj Item Flag"",UnbillFlag[RecCount]);
		//	SetFieldValue(""STC AdjItem BillReqStartDate"",""23/11/2021 11:00:00"");
		//	SetFieldValue(""STC AdjItem BillReqEndDate"",""23/11/2021 11:00:00"");
			SetFieldValue(""STC AdjItem BillReqStartDate"",StartDate[RecCount]);
			SetFieldValue(""STC AdjItem BillReqEndDate"",EndDate[RecCount]);
			SetFieldValue(""STC AdjItem BillItem Number"",BillNo[RecCount]);
			SetFieldValue(""STC AdjItem Prod Name"",ProductName[RecCount]);
			SetFieldValue(""STC AdjItem VAT Name"",ItemName[RecCount]);

			SetFieldValue(""Status"",""Open"");
			SetFieldValue(""Invoice Adj ID"",vAdjustmentId);
			SetFieldValue(""STC Import Status"",vImportStatus);
			
			if(vCustomerType==""Business"")
			{
				SetFieldValue(""STC VAT Service Type"",VATServiceType[RecCount]);
			}
			if(vCustomerType==""Individual"")
			{
				SetFieldValue(""STC VAT Adjustment Type"",VATAdjustmentType[RecCount]);
				SetFieldValue(""STC VAT Service Type"",VATServiceType[RecCount]);
			}	
			WriteRecord();
		}
	}
}
function CreateMSISDN(MSISDNNumber,AdjustmentAmount,ChargingType,AdjustmentType,FinancialImpact,VATAdjustmentType,VATServiceType,VATApplication,i)//[MANUJ] : [Adjustment Automation]
{
	var RecCount = i;		
	var vBC: BusComp = TheApplication().GetBusObject(""Service Request"").GetBusComp(""FS Invoice Adjustment Items"");
	var vAdjustmentId = TheApplication().GetProfileAttr(""STCAdjustmentId"");
	var vImportStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_ADJ_IMP_STAT"",""Upload Success"");
	var vCustomerType= TheApplication().GetProfileAttr(""STCCustomerType""); // OMKAR Added for VAT Enhancement
	
	with(vBC)
	{
		while(RecCount > 1)
		{
			NewRecord(NewAfter);
			RecCount--;
			//TheApplication().RaiseErrorText(VATApplication[RecCount]);
			ActivateField(""Request Currency"");
			SetFieldValue(""STC VAT Application"",VATApplication[RecCount]);
			SetFieldValue(""Request Currency"",""BHD"");
			//TheApplication().RaiseErrorText(MSISDNNumber[RecCount]+"":""+AdjustmentAmount[RecCount]+"":""+ChargingType[RecCount]+"":""+AdjustmentType[RecCount]+"":""+FinancialImpact[RecCount]+"":""+VATApplication[RecCount]+"":""+VATAdjustmentType[RecCount]+"":""+VATServiceType[RecCount]);
			SetFieldValue(""Billing Account Number"",MSISDNNumber[RecCount]);//[MANUJ] : [Adjustment Automation]
			SetFieldValue(""Request Amt"",AdjustmentAmount[RecCount]);
			SetFieldValue(""Charging Type"",ChargingType[RecCount]);//[MANUJ] : [Adjustment Automation]
			//[MANUJ] : [Adjustment Automation Phase 3]
			SetFieldValue(""Adjustment Type"",AdjustmentType[RecCount]);
			SetFieldValue(""Financial Impact"",FinancialImpact[RecCount]);
			SetFieldValue(""Status"",""Open"");
			SetFieldValue(""Invoice Adj ID"",vAdjustmentId);
			SetFieldValue(""STC Import Status"",vImportStatus);
			
			if(vCustomerType==""Business"")
			{
				SetFieldValue(""STC VAT Service Type"",VATServiceType[RecCount]);
			}
			if(vCustomerType==""Individual"")
			{
				SetFieldValue(""STC VAT Adjustment Type"",VATAdjustmentType[RecCount]);
				SetFieldValue(""STC VAT Service Type"",VATServiceType[RecCount]);
			}	
			WriteRecord();
		}
	}
}
function ImportData(Inputs, Outputs)
{
	var vInputFile      = """";
    var vReadFromFile   = """";
    var vBulkDataArray  = """";
    var vAdjustmentId = TheApplication().GetProfileAttr(""STCAdjustmentId"");
	var vAdjustmentType = TheApplication().GetProfileAttr(""STCAdjustmentType"");
	var vFileName   = Inputs.GetProperty(""FileName"");
  	var vFileType     = ToString(Inputs.GetProperty(""FileType""));
  	var vBCBRBuscomp: BusComp = TheApplication().GetBusObject(""STC Bulk Request Data BO"").GetBusComp(""STC Bulk Request Data"");
 	vFileType       = Clib.strlwr(vFileType);
 	var MSISDNNumber: Array = new Array();
 	var AdjustmentAmount: Array = new Array();
	//[MANUJ] : Adjustment Automation Phase 3]
	var ChargingType: Array = new Array();
	var AdjustmentType: Array = new Array();
	var FinancialImpact: Array = new Array();

 	var vRecord = false;
    if( vFileType != ""csv"")
    {
       TheApplication().RaiseErrorText(""Please check the File Type , It should be :  FileName.CSV"");
    }
    vInputFile     = Clib.fopen(vFileName , ""rt"");       
    vReadFromFile  = Clib.fgets(vInputFile);	
	var DeviceEligible = """";
	var BlackListLvl = """";
	var i = 1;
	var ErrMsg = ""Success"";
	if(vReadFromFile != null && vFileName != '' && vFileName != """")
	{		
		if (vInputFile == null)
		{
			TheApplication().RaiseErrorText(""Error in opening the file"");
		}
		 while((vReadFromFile != null) && (vReadFromFile.length > 1))
		 {			
			ErrMsg = """"; //Nullify Error Message for each of the iteration			
			if(vReadFromFile != null && vReadFromFile != """")
			{
				vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
				var sRecData = vReadFromFile.split("","");
				MSISDNNumber[i] = sRecData[0];				
				AdjustmentAmount[i] = sRecData[1];	
				ChargingType[i] = sRecData[2];
				//[MANUJ] : Adjustment Automation Phase 3
				AdjustmentType[i] = sRecData[3];
				FinancialImpact[i] = sRecData[4];			
				i++;
			}//if(sReadFromFile != null && sReadFromFile != """")
			vReadFromFile = Clib.fgets(vInputFile);
		 }//while(!Clib.feof(sFileOpen))
		 CreateMSISDN(MSISDNNumber,AdjustmentAmount,ChargingType,AdjustmentType,FinancialImpact, i);		
	}//if(sFileName != null && sFileName != '' && sFileName != """")
}
function ImportData(Inputs, Outputs)
{
	var vInputFile      = """";
    var vReadFromFile   = """";
    var vBulkDataArray  = """";
    var vAdjustmentId = TheApplication().GetProfileAttr(""STCAdjustmentId"");
	var vAdjustmentType = TheApplication().GetProfileAttr(""STCAdjustmentType"");
	var vFileName   = Inputs.GetProperty(""FileName"");
  	var vFileType     = ToString(Inputs.GetProperty(""FileType""));
  	var vBCBRBuscomp: BusComp = TheApplication().GetBusObject(""STC Bulk Request Data BO"").GetBusComp(""STC Bulk Request Data"");
 	vFileType       = Clib.strlwr(vFileType);
 	var MSISDNNumber: Array = new Array();
 	var AdjustmentAmount: Array = new Array();
	//[MANUJ] : Adjustment Automation Phase 3]
	var ChargingType: Array = new Array();
	var AdjustmentType: Array = new Array();
	var FinancialImpact: Array = new Array();
	var VATAdjustmentType: Array = new Array(); // OMKAR Added for VAT enhancement
	var VATServiceType: Array = new Array(); // OMKAR Added for VAT enhancement
	var VATApplication: Array = new Array(); // OMKAR Added for VAT enhancement
	var UnbillFlag: Array = new Array();
	var StartDate: Array = new Array();
	var EndDate: Array = new Array();
	var BillNo: Array = new Array(); // Mark Added for VAT enhancement
	var ProductName: Array = new Array(); // Mark Added for VAT enhancement
	var ItemName: Array = new Array(); // Mark Added for VAT enhancement
 	var vRecord = false;
    if( vFileType != ""csv"")
    {
       TheApplication().RaiseErrorText(""Please check the File Type , It should be :  FileName.CSV"");
    }
    vInputFile     = Clib.fopen(vFileName , ""rt"");       
    vReadFromFile  = Clib.fgets(vInputFile);	
	var DeviceEligible = """";
	var BlackListLvl = """";
	var i = 1;
	var ErrMsg = ""Success"";
	if(vReadFromFile != null && vFileName != '' && vFileName != """")
	{		
		if (vInputFile == null)
		{
			TheApplication().RaiseErrorText(""Error in opening the file"");
		}
		 while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
		 {			
			ErrMsg = """"; //Nullify Error Message for each of the iteration			
			if(vReadFromFile != null && vReadFromFile != """")
			{
				vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
				var sRecData = vReadFromFile.split("","");
				MSISDNNumber[i] = sRecData[7];				
				AdjustmentAmount[i] = sRecData[1];	
				ChargingType[i] = sRecData[2];
				//[MANUJ] : Adjustment Automation Phase 3
				AdjustmentType[i] = sRecData[3];
				FinancialImpact[i] = sRecData[4];
				VATAdjustmentType[i] = sRecData[5];
				VATServiceType[i] = sRecData[6];
				VATApplication[i] = sRecData[0];
				UnbillFlag[i] = sRecData[8];
				StartDate[i] = sRecData[9];
				EndDate[i] = sRecData[10];
				BillNo[i] = sRecData[11];
				ProductName[i] = sRecData[12];	
				ItemName[i] = sRecData[13];
				i++;
			}//if(sReadFromFile != null && sReadFromFile != """")
			vReadFromFile = Clib.fgets(vInputFile);
		 }//while(!Clib.feof(sFileOpen))
		 
		 CreateMSISDN(MSISDNNumber,AdjustmentAmount,ChargingType,AdjustmentType,FinancialImpact,VATAdjustmentType,VATServiceType,VATApplication,UnbillFlag,StartDate,EndDate,BillNo,ProductName,ItemName,i);
	}//if(sFileName != null && sFileName != '' && sFileName != """")
}
function ImportData(Inputs, Outputs)
{
	var vInputFile      = """";
    var vReadFromFile   = """";
    var vBulkDataArray  = """";
    var vAdjustmentId = TheApplication().GetProfileAttr(""STCAdjustmentId"");
	var vAdjustmentType = TheApplication().GetProfileAttr(""STCAdjustmentType"");
	var vFileName   = Inputs.GetProperty(""FileName"");
  	var vFileType     = ToString(Inputs.GetProperty(""FileType""));
  	var vBCBRBuscomp: BusComp = TheApplication().GetBusObject(""STC Bulk Request Data BO"").GetBusComp(""STC Bulk Request Data"");
 	vFileType       = Clib.strlwr(vFileType);
 	var MSISDNNumber: Array = new Array();
 	var AdjustmentAmount: Array = new Array();
	//[MANUJ] : Adjustment Automation Phase 3]
	var ChargingType: Array = new Array();
	var AdjustmentType: Array = new Array();
	var FinancialImpact: Array = new Array();
	var VATAdjustmentType: Array = new Array(); // OMKAR Added for VAT enhancement
	var VATServiceType: Array = new Array(); // OMKAR Added for VAT enhancement
	var VATApplication: Array = new Array(); // OMKAR Added for VAT enhancement

 	var vRecord = false;
    if( vFileType != ""csv"")
    {
       TheApplication().RaiseErrorText(""Please check the File Type , It should be :  FileName.CSV"");
    }
    vInputFile     = Clib.fopen(vFileName , ""rt"");       
    vReadFromFile  = Clib.fgets(vInputFile);	
	var DeviceEligible = """";
	var BlackListLvl = """";
	var i = 1;
	var ErrMsg = ""Success"";
	if(vReadFromFile != null && vFileName != '' && vFileName != """")
	{		
		if (vInputFile == null)
		{
			TheApplication().RaiseErrorText(""Error in opening the file"");
		}
		 while((vReadFromFile != null) && (vReadFromFile.length > 1))
		 {			
			ErrMsg = """"; //Nullify Error Message for each of the iteration			
			if(vReadFromFile != null && vReadFromFile != """")
			{
				vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
				var sRecData = vReadFromFile.split("","");
				MSISDNNumber[i] = sRecData[7];				
				AdjustmentAmount[i] = sRecData[1];	
				ChargingType[i] = sRecData[2];
				//[MANUJ] : Adjustment Automation Phase 3
				AdjustmentType[i] = sRecData[3];
				FinancialImpact[i] = sRecData[4];
				VATAdjustmentType[i] = sRecData[5];
				VATServiceType[i] = sRecData[6];
				VATApplication[i] = sRecData[0];
				i++;
			}//if(sReadFromFile != null && sReadFromFile != """")
			vReadFromFile = Clib.fgets(vInputFile);
		 }//while(!Clib.feof(sFileOpen))
		 
		 CreateMSISDN(MSISDNNumber,AdjustmentAmount,ChargingType,AdjustmentType,FinancialImpact,VATAdjustmentType,VATServiceType,VATApplication,i);
	}//if(sFileName != null && sFileName != '' && sFileName != """")
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	 try
	 {
	    switch(MethodName)
	     {     
		     case ""ImportData"":
		     ImportData(Inputs,Outputs);
		     return(CancelOperation);
		     break;		     

	      	 default:
	         break;
	     }
	 }
	 catch (exc)
	 {
	 	throw(exc.toString());
	 }
	 finally 
	 {
	 }  
}
//Your public declarations go here...
function AttachFile(sAbsoluteFileName){

var boTest;
var bcTestAttach;
var sGetFileReturn = """";

try {
var boAction = TheApplication().GetBusObject(""Action"");

bcTestAttach = boAction.GetBusComp(""Action Attachment"");

var bcAction = boAction.GetBusComp(""Action"");
with(bcAction){
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"", ""1-7ENFBHE"");	
		ExecuteQuery(ForwardOnly);
		var count = CountRecords();
		var AppRec = FirstRecord();
			if(AppRec)
		{
with (bcTestAttach)
{
ActivateField(""Activity Id"");
ActivateField(""ActivityFileName"");
ActivateField(""ActivityFileDeferFlg"");
NewRecord(NewAfter);
SetFieldValue(""Activity Id"", ""1-7ENFBHE"");
/*
SetFieldValue(""ActivityFileName"", ""ActivityFileName"");
SetFieldValue(""FileName"", sAbsoluteFileName);
SetFieldValue(""ActivityFileDeferFlg"", ""R"");
SetFieldValue(""ActivityFileDockStatFlg"", ""E"");*/
//SetFieldValue(""FileName"", sAbsoluteFileName);
SetFieldValue(""ActivityFileName"", sAbsoluteFileName);
SetFieldValue(""ActivityFileDockReqFlg"", ""N"");
SetFieldValue(""ActivityFileDeferFlg"", ""R"");
SetFieldValue(""ActivityFileDockStatFlg"", ""E"");
WriteRecord();
sGetFileReturn = InvokeMethod(""CreateFile"", sAbsoluteFileName, ""ActivityFileName"", ""N"");

}
}

if (sGetFileReturn != ""Success"")

throw(""Error attaching file!"");

}



}
catch(e)

{

TheApplication().RaiseErrorText(e.toString());

}
finally

{

bcTestAttach = null;

boTest = null;

}




}
function CreateMSISDNPlanChange(MSISDNNumber,COS,COR,ExtensionType,Action,OldPlanCode,NewPlanCode,NewContract,EOL,TemplateType,i)
{
	var RecCount = i;		
	var vBC: BusComp = TheApplication().GetBusObject(""Account"").GetBusComp(""STC Avaya Extension Template Items Thin"");
	var vTemplateId = TheApplication().GetProfileAttr(""ActivityTemplateId"");
	
	var vImportStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_ADJ_IMP_STAT"",""Upload Success"");
	with(vBC)
	{
		while(RecCount > 1)
		{
			NewRecord(NewAfter);
			RecCount--;
			SetFieldValue(""Num Type"",ExtensionType[RecCount]);
			if(TemplateType != ""Delete Extension"")
			{
			SetFieldValue(""COR"",COR[RecCount]);
			SetFieldValue(""COS"",COS[RecCount]);
			}
			SetFieldValue(""MSISDN"",MSISDNNumber[RecCount]);
			if(TemplateType != ""Add Extension"" && TemplateType != ""Delete Extension"")
			{
			SetFieldValue(""Action"",Action[RecCount]);
			}
			if(TemplateType == ""Plan Change"")
			{
			SetFieldValue(""Old Plan PartCode"",OldPlanCode[RecCount]);
			SetFieldValue(""New Plan PartCode"",NewPlanCode[RecCount]);
			SetFieldValue(""NewContract"",NewContract[RecCount]);
			}
			SetFieldValue(""EOL"",""EOL"");
			SetFieldValue(	""Status"",""Open"");
			SetFieldValue(""Template Id"",vTemplateId);
			SetFieldValue(""STC Import Status"",vImportStatus);	
			WriteRecord();
		}
	}
}
function ImportData(vFileName, vFileType, TemplateType)
{
	var vInputFile      = """";
    var vReadFromFile   = """";
    var vBulkDataArray  = """";
	//var vFileName   = Inputs.GetProperty(""FileName"");
  	//var vFileType     = ToString(Inputs.GetProperty(""FileType""));
  	var vBCBRBuscomp: BusComp = TheApplication().GetBusObject(""Account"").GetBusComp(""STC Avaya Extension Template Items"");
 	vFileType       = Clib.strlwr(vFileType);
 	var MSISDNNumber: Array = new Array();
 	var COS: Array = new Array();
	var COR: Array = new Array();
	var ExtensionType: Array = new Array();
	var Action: Array = new Array();
	var OldPlanCode: Array = new Array();
	var NewPlanCode: Array = new Array();
	var NewContract: Array = new Array();
	var EOL: Array = new Array();
 	var vRecord = false;
    if( vFileType != ""csv"")
    {
       TheApplication().RaiseErrorText(""Please check the File Type , It should be :  FileName.CSV"");
    }

	//AttachFile(vFileName);
    vInputFile     = Clib.fopen(vFileName , ""rt"");       
    vReadFromFile  = Clib.fgets(vInputFile);	
	var DeviceEligible = """";
	var BlackListLvl = """";
	var i = 1;
	var ErrMsg = ""Success"";
	if(vReadFromFile != null && vFileName != '' && vFileName != """")
	{		
		if (vInputFile == null)
		{
			TheApplication().RaiseErrorText(""Error in opening the file"");
		}
		 while((vReadFromFile != null) && (vReadFromFile.length > 1))
		 {			
			ErrMsg = """"; //Nullify Error Message for each of the iteration			
			if(vReadFromFile != null && vReadFromFile != """")
			{
				vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
				var sRecData = vReadFromFile.split("","");
				ExtensionType[i] = sRecData[0];	
				MSISDNNumber[i] = sRecData[1];				
				COS[i] = sRecData[2];
				COR[i] = sRecData[3];		
				Action[i] = sRecData[4];
				OldPlanCode[i] = sRecData[5];
				NewPlanCode[i] = sRecData[6];
				NewContract[i] = sRecData[7];
				EOL[i] = sRecData[8];	
				i++;
			}//if(sReadFromFile != null && sReadFromFile != """")
			vReadFromFile = Clib.fgets(vInputFile);
		 }//while(!Clib.feof(sFileOpen))
		 CreateMSISDNPlanChange(MSISDNNumber,COS,COR,ExtensionType,Action,OldPlanCode,NewPlanCode,NewContract,EOL,TemplateType,i)
	}//if(sFileName != null && sFileName != '' && sFileName != """")
}
"//****************Author : MANUJ*******************AVAYA//12/07/2016*****************************
function ProcessAttachment(Inputs,Outputs){

var boAttach;

var bcTestAttach;

var sGetFileReturn = """";

var sAbsoluteFileName = """";

var sStatus = """";

var oFile = """";

 

try {

var AttachmentName = Inputs.GetProperty(""AttachmentName"");
var ActivityId = Inputs.GetProperty(""ActivityId"");
var TemplateType = Inputs.GetProperty(""TemplateType"");
boAttach = TheApplication().GetBusObject(""Avaya Attachment BO"");

bcTestAttach = boAttach.GetBusComp(""Avaya Activity Attachment"");

with (bcTestAttach)

{
ActivateField(""ActivityFileName"");
ActivateField(""Activity Id"");

ClearToQuery();

SetSearchSpec(""ActivityFileName"", AttachmentName);
SetSearchSpec(""Activity Id"", ActivityId);

ExecuteQuery(ForwardOnly);

if (FirstRecord())

{

sGetFileReturn = InvokeMethod(""GetFile"", ""ActivityFileName"");

	var Length = sGetFileReturn.length;

sStatus = sGetFileReturn.substring(0, sGetFileReturn.indexOf("",""));

if (sStatus == ""Success"")

{

sAbsoluteFileName = sGetFileReturn.substring(sGetFileReturn.indexOf("","") + 1, Length);

//oFile = Clib.fopen(sAbsoluteFileName,""rt"");
//Call Import Data
ImportData(sAbsoluteFileName, ""csv"",TemplateType);

}


}

}

}

catch(e)

{

TheApplication().RaiseErrorText(e.toString());

}

finally

{

//the file pointer object is destroyed

//along with BC and BO objects

oFile = null;

bcTestAttach = null;

boAttach = null;

}

}
function Service_InvokeMethod (MethodName, Inputs, Outputs)
{

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	 try
	 {
	    switch(MethodName)
	     {     
		     case ""ImportData"":
		     ImportData(Inputs,Outputs,MethodName);
		     return(CancelOperation);
		     break;	
			 
			 case ""ProcessAttachment"":
		     ProcessAttachment(Inputs,Outputs);
		     return(CancelOperation);
		     break;		     

	      	 default:
	         break;
	     }
	 }
	 catch (exc)
	 {
	 	throw(exc.toString());
	 }
	 finally 
	 {
	 }  
}
function CheckCPR(CPRNumber)
{
	var ErrorMsg = """";
	var AccThinBo = TheApplication().GetBusObject(""STC Account Thin BO"");
	var AccThinBC = AccThinBo.GetBusComp(""STC Account Thin"");
		with(AccThinBC)
		{
			ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Tax ID Number"",CPRNumber);
			ExecuteQuery(ForwardOnly);
			var isRec = FirstRecord();
			if(isRec)
			{
				ErrorMsg = ""Success"";
			}
			else
			{
				ErrorMsg = ""CPR does not exist"";
			}
		
		}
	return(ErrorMsg);
}
function CreateCPRRecError(CPRNumber,DeviceEligible,BlackListLvl,ErrorMsg,vActionPerformed,vCPRStatus)
{
	var CPRBlkListBO = TheApplication().GetBusObject(""STC CPR BLACKLIST CRM BO"");
	var CPRBlkListBC = CPRBlkListBO.GetBusComp(""STC CPR BLACKLIST CRM BC"");
	CPRBlkListBC.InvokeMethod(""SetAdminMode"", ""TRUE"");
	var searchStr = """";
	var sSExpr2 = ""[STC CPR Number] = '"" + CPRNumber + ""' AND [STC Backup] IS NULL"";
	with(CPRBlkListBC)
	{
/*			ActivateField(""STC Backup"");
			ClearToQuery();
			SetViewMode(AllView);
			SetSearchExpr(sSExpr2);
			ExecuteQuery(ForwardOnly);
			var isRec = FirstRecord();
			while(isRec)
			{
				SetFieldValue(""STC Backup"", ""Yes"");
				WriteRecord();
				isRec = NextRecord();
			}
*/
			NewRecord(NewAfter);
		//	SetFieldValue(""STC Blacklist Level"", BlackListLvl);
			SetFieldValue(""STC CPR Number"", CPRNumber);
		//	SetFieldValue(""STC Device"", DeviceEligible);
			SetFieldValue(""STC CPR Status"", vCPRStatus);
			SetFieldValue(""STC Status"", ""Failed"");
			SetFieldValue(""STC Fail Reason"", ErrorMsg);
			SetFieldValue(""STC Backup"", ""Yes"");
			WriteRecord();
	}
}
function CreateCPRRecord(CPRNumber,DeviceEligible,BlackListLvl,vActionPerformed,vCPRStatus)
{
	var CPRBlkListBO = TheApplication().GetBusObject(""STC CPR BLACKLIST CRM BO"");
	var CPRBlkListBC = CPRBlkListBO.GetBusComp(""STC CPR BLACKLIST CRM BC"");
	CPRBlkListBC.InvokeMethod(""SetAdminMode"", ""TRUE"");
	var vFlag = ""Success"";
	with(CPRBlkListBC)
	{
			ActivateField(""STC Backup"");
			ActivateField(""STC Action Performed"");		 
			ClearToQuery();
			SetViewMode(AllView);
			var sSExpr2 = ""[STC CPR Number] = '"" + CPRNumber + ""' AND [STC Backup] IS NULL""; //Checking all valid records in table
			SetSearchExpr(sSExpr2);
			ExecuteQuery(ForwardOnly);
			var isRec = FirstRecord();
			if((!isRec) && (vCPRStatus == ""UnBlackListed""))
			{
				vFlag = ""Failed"";
			}
			while(isRec)
			{
				SetFieldValue(""STC Backup"", ""Yes"");
				SetFieldValue(""STC Action Performed"", vActionPerformed);
				WriteRecord();
				isRec = NextRecord();
			}
			NewRecord(NewAfter);
			SetFieldValue(""STC Blacklist Level"", BlackListLvl);
			SetFieldValue(""STC CPR Number"", CPRNumber);
			SetFieldValue(""STC CPR Status"", vCPRStatus);
			SetFieldValue(""STC Device"", DeviceEligible);
			SetFieldValue(""STC Status"", vFlag);
			if(vFlag == ""Failed"")
			{
				SetFieldValue(""STC Backup"", ""Yes"");
				SetFieldValue(""STC Fail Reason"", ""CPR does not exist in Blacklisted Database"");
			}
			WriteRecord();
	}
}
function ImportData(Inputs, Outputs,vActionPerformed,vCPRStatus)
{
	 var vInputFile      = """";
      var vReadFromFile   = """";
      var vBulkDataArray  = """";
	 var vFileName   = Inputs.GetProperty(""FileName"");
  	var vFileType     = ToString(Inputs.GetProperty(""FileType""));
 	vFileType       = Clib.strlwr(vFileType);        
    if( vFileType != ""csv"")
    {
       TheApplication().RaiseErrorText(""Please check the File Type , It should be :  FileName.CSV"");
    } 
    vInputFile     = Clib.fopen(vFileName , ""rt"");       
    vReadFromFile  = Clib.fgets(vInputFile);
	var CPRNumber = """";
	var DeviceEligible = """";	
	var BlackListLvl = """";
	var ErrMsg = ""Success"";
	if(vReadFromFile != null && vFileName != '' && vFileName != """")
	{		
		if (vInputFile == null)
		{
			TheApplication().RaiseErrorText(""Error in opening the file"");
		}
		 while((vReadFromFile != null) && (vReadFromFile.length > 1))
		 {			
			ErrMsg = """"; //Nullify Error Message for each of the iteration			
			if(vReadFromFile != null && vReadFromFile != """")
			{
				vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n""));  			 
				var sRecData = vReadFromFile.split("","");
				CPRNumber = sRecData[0];			
				if(vCPRStatus == ""BlackListed"")
				{
					DeviceEligible = sRecData[1];
					var temp = sRecData[2].length;
	          		BlackListLvl = sRecData[2];
	          		BlackListLvl = BlackListLvl.replace(""\n"","""");	          	
	          	}	          
				if(CPRNumber != """" && CPRNumber != null && CPRNumber != '')
				{					
					var vResponse = CheckCPR(CPRNumber);					
					if(DeviceEligible != ""Y"" && DeviceEligible != ""N"" && vCPRStatus == ""BlackListed"")
					{
						ErrMsg = vResponse + "": Expected value does not match for Device Applicable field."";
					}
					if(BlackListLvl != ""Low"" && BlackListLvl != ""Medium"" && BlackListLvl != ""High"" && BlackListLvl != ""Very High"" && vCPRStatus == ""BlackListed"")
					{
						ErrMsg = vResponse + "":Expected value does not match for Blacklist Level field."";
					}
					
					if(vResponse == ""Success"" && ErrMsg != null && ErrMsg != """")
					{
						CreateCPRRecError(CPRNumber,DeviceEligible,BlackListLvl,ErrMsg,vActionPerformed,vCPRStatus);
					}
					else if(vResponse != ""Success"")
					{
						CreateCPRRecError(CPRNumber,DeviceEligible,BlackListLvl,vResponse,vActionPerformed,vCPRStatus);
					}					
					else
					{
						CreateCPRRecord(CPRNumber,DeviceEligible,BlackListLvl,vActionPerformed,vCPRStatus);
					}
				}
			}//if(sReadFromFile != null && sReadFromFile != """")
			vReadFromFile = Clib.fgets(vInputFile);
		 }//while(!Clib.feof(sFileOpen))
			
	}//if(sFileName != null && sFileName != '' && sFileName != """")
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	 try
	 {
	    switch(MethodName)
	     {     
		     case ""ImportDataBlacklist"":
		     var vActionPerformed = ""Update"";
		     var vCPRStatus = ""BlackListed"";
		     ImportData(Inputs,Outputs,vActionPerformed,vCPRStatus);
		     return(CancelOperation);
		     break;
		     
		     case ""ImportDataUnblacklist"":
		     var vActionPerformed = ""Delete"";
		     var vCPRStatus = ""UnBlackListed"";
		     ImportData(Inputs,Outputs,vActionPerformed,vCPRStatus);
		     return(CancelOperation);
		     break;
		       
	      	 default:
	         break;
	     }
	 }
	 catch (exc)
	 {
	 	throw(exc.toString());
	 }
	 finally 
	 {
	 }  
}
"//Your public declarations go here...  
"
function ImportData(Inputs, Outputs)
{
	var vInputFile      = """";
    var vReadFromFile   = """";
    var vBulkDataArray  = """";
    var vFileName   = Inputs.GetProperty(""FileName"");
  	var vFileType     = ToString(Inputs.GetProperty(""FileType""));
  	
 	vFileType       = Clib.strlwr(vFileType);

	//var BANID: Array = new Array();
	var MSISDN: Array = new Array();//Mayank: Added for Bulk Payment Enhancement
 	var Amount: Array = new Array();
	var BANNum: Array = new Array();
	var CPRNum: Array = new Array();
	var BilNum: Array = new Array();
	var PaymentAmount: Array = new Array();
	var PaymentDate: Array = new Array();
	var Paymentmethod: Array = new Array();
	var PaymentChannel: Array = new Array();

 	var vRecord = false;
    if( vFileType != ""csv"")
    {
       TheApplication().RaiseErrorText(""Please check the File Type , It should be :  FileName.CSV"");
    }
    vInputFile     = Clib.fopen(vFileName , ""rt"");       
    vReadFromFile  = Clib.fgets(vInputFile);	

	var i = 0, j = 0;
	var ErrMsg = ""Success"";

		var	STCBulkHeaderId = TheApplication().GetProfileAttr(""STCBulkHeaderId"");
	var	PaymentRequestType = TheApplication().GetProfileAttr(""PaymentRequestType"");


	if(vReadFromFile != null && vFileName != '' && vFileName != """")
	{		
		if (vInputFile == null)
		{
			TheApplication().RaiseErrorText(""Error in opening the file"");
		}

		//[Mark:SD Enhancements of Payment Channels (CRM Bulk Payment)]
		if(PaymentRequestType==""Payment Collections"")
		{
			var i = 0;
		 //while((vReadFromFile != null) && (vReadFromFile.length > 1)&&  vReadFromFile != ""END;"")
		 while((vReadFromFile != null) && (vReadFromFile.length > 1) && vReadFromFile != ""END;"")
		 {		
			ErrMsg = """"; 
			if(vReadFromFile != null && vReadFromFile != """")
			{
			vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 				
				
				if (j == 0)
				{
				j++;
				}
				else{
			//	vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
				var sRecData = vReadFromFile.split("","");				
				BANNum[i] = sRecData[0];
				CPRNum[i] = sRecData[1];
				PaymentAmount[i] = sRecData[2];
				PaymentDate[i] = sRecData[3];
				Paymentmethod[i] = sRecData[4];
				PaymentChannel[i] = sRecData[5];
				MSISDN[i]= sRecData[6];
				i++;
				j++;
				}
			}
			vReadFromFile = Clib.fgets(vInputFile);
		 }
		
		 InsetBulkPayments(BANNum,CPRNum,PaymentAmount,PaymentDate,Paymentmethod,PaymentChannel,MSISDN,i);
		}
		else if(PaymentRequestType==""isBill"")
       {
		 while((vReadFromFile != null) && (vReadFromFile.length > 1))
		 {			
			ErrMsg = """"; 
			if(vReadFromFile != null && vReadFromFile != """")
			{
				vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
				var sRecData = vReadFromFile.split("","");
				//BANID[i] = sRecData[0];				
				BilNum[i] = sRecData[0];//Mayank: Added for Bulk Payment Enhancement
				Amount[i] = sRecData[3];
				i++;
			}
			vReadFromFile = Clib.fgets(vInputFile);
		 }
		 //UpdateAmount(BANID,Amount,i);	
		 UpdateBAmount(BilNum,Amount,i);//Mayank: Added for Bulk Payment Enhancement
	} // elseif
  else{
	
		 while((vReadFromFile != null) && (vReadFromFile.length > 1))
		 {			
			ErrMsg = """"; 
			if(vReadFromFile != null && vReadFromFile != """")
			{
				vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
				var sRecData = vReadFromFile.split("","");
				//BANID[i] = sRecData[0];				
				MSISDN[i] = sRecData[2];//Mayank: Added for Bulk Payment Enhancement
				Amount[i] = sRecData[3];
				BANNum[i] = sRecData[1];//anu added
				i++;
			
			}
			vReadFromFile = Clib.fgets(vInputFile);
		 }
		 
		 
		 if(BANNum[0] != """" &&  BANNum[0] != null)
		   {
		 	 UpdateBanAmount(BANNum,Amount,i);//Anu: Added for Bulk Payment Enhancement
			
		    }
		  else
		   {
		     UpdateAmount(MSISDN,Amount,i);//Mayank: Added for Bulk Payment Enhancement
		 
		    }
		 //UpdateAmount(BANID,Amount,i);	
		// UpdateAmount(MSISDN,Amount,i);//Mayank: Added for Bulk Payment Enhancement
	}// else
		} // 
}
function InsetBulkPayments(BANNum,CPRNum,PaymentAmount,PaymentDate,Paymentmethod,PaymentChannel,MSISDN,i)
{
	try
	{
    	var svcUI = null, psIn1 = null, psOut1 = null;
	    var SearchSpec = """", sSearchSpecOpt = """";
		var RecCount = 0;
		var Num=1,NewNum=0;
		var sTotalAmount = 0;
		var sAmount = 0;
		var sSelect = ""N"";		
		var vBC: BusComp = TheApplication().GetBusObject(""STCBulkPaymentBO"").GetBusComp(""STC Bulk Payment Line Item BC"");
		var vBulkBC: BusComp = TheApplication().GetBusObject(""STCBulkPaymentBO"").GetBusComp(""STC Bulk Payment Header BC"");
		var BulkHeaderId = TheApplication().GetProfileAttr(""STCBulkHeaderId"");
		var	PaymentRequestType = TheApplication().GetProfileAttr(""PaymentRequestType"");
		var BulkOperation = ""N"";
		var sSearchSpec = """";
		var psInputs = """",psOutputs = """",svcbsService = """";
	/*	with(vBulkBC)
		{
			ClearToQuery();
			ActivateField(""Type"");
			SetSearchSpec(""Id"",BulkHeaderId);
			ExecuteQuery(ForwardBackward);
			if(FirstRecord())
			{
				SetFieldValue(""Type"", ""BulkPayment"");
				WriteRecord();	
			}
		}*/

		with(vBC)
		{
			with(vBulkBC)
			{
				ClearToQuery();
				ActivateField(""Payment Amount"");
				SetSearchSpec(""Id"",BulkHeaderId);
				ExecuteQuery(ForwardBackward);
				if(FirstRecord())
				{
					SetFieldValue(""Payment Amount"", sTotalAmount);
					WriteRecord();	
				}
			}

		if (i > 0)
				{
			while(RecCount < i)
			{
				
				ClearToQuery();
				ActivateField(""Number"");
				ActivateField(""Bulk Payment Header Id"");
				SearchSpec = ""[Bulk Payment Header Id] = '"" + BulkHeaderId + ""'"";
				SetSearchExpr(SearchSpec);
				SetSortSpec(""Number(DESCENDING)"");
				ExecuteQuery(ForwardBackward);
				if(FirstRecord())
				{
				Num = GetFieldValue(""Number"");
				Num = ToNumber(Num);
				NewNum = Num + 1;
				}
				//RecCount--;
				ClearToQuery();
				ActivateField(""Exchange Date"");
				ActivateField(""Bulk Payment Header Id"");
				ActivateField(""STC Selected Flag"");
				ActivateField(""STC Payment Amount"");
				ActivateField(""STC MSISDN"");
				ActivateField(""STC Payment MSISDN"");
				ActivateField(""Number"");
				ActivateField(""Comments""); 
				ActivateField(""Status"");
				ActivateField(""CPR Number"");
				ActivateField(""Payment Channel"");
				ActivateField(""Payment Method"");
				ActivateField(""Bulk BAN Num"");
				SearchSpec = ""[Bulk Payment Header Id] = '"" + BulkHeaderId + ""' AND [STC Payment MSISDN] ='"" +MSISDN[RecCount]+ ""'"";
				SetSearchExpr(SearchSpec);
				ExecuteQuery(ForwardBackward);
				if(FirstRecord())
				{
					sSelect = GetFieldValue(""STC Selected Flag"");
					sAmount = ToNumber(PaymentAmount[RecCount]);
					SetFieldValue(""Bulk BAN Num"",BANNum[RecCount]);
					SetFieldValue(""CPR Number"",CPRNum[RecCount]);
					SetFieldValue(""STC Payment Amount"",sAmount);
					SetFieldValue(""Payment Method"",Paymentmethod[RecCount]);
					SetFieldValue(""Payment Channel"",PaymentChannel[RecCount]);
					SetFieldValue(""Exchange Date"",PaymentDate[RecCount]);
					WriteRecord();
	
				}
				else
				{
					NewRecord(NewAfter);					
					SetFieldValue(""Bulk Payment Header Id"",BulkHeaderId);				
					SetFieldValue(""STC Selected Flag"",""Y"");
					SetFieldValue(""Bulk BAN Num"",BANNum[RecCount]);
					SetFieldValue(""CPR Number"",CPRNum[RecCount]);
					SetFieldValue(""Exchange Date"",PaymentDate[RecCount]);
					SetFieldValue(""STC Payment Amount"",PaymentAmount[RecCount]);
					SetFieldValue(""Payment Method"",Paymentmethod[RecCount]);
					SetFieldValue(""Payment Channel"",PaymentChannel[RecCount]);
					SetFieldValue(""Comments"",PaymentRequestType);
					SetFieldValue(""STC Payment MSISDN"",MSISDN[RecCount]);
					SetFieldValue(""STC MSISDN"",MSISDN[RecCount]);
					SetFieldValue(""Status"",""Imported"");
					if(ToNumber(NewNum)>0)				
					{
					SetFieldValue(""Number"",NewNum);
					}
					else
					{				
					SetFieldValue(""Number"",Num);
					}					
				    WriteRecord();
				} //else
				RecCount++;
			} //	while(RecCount > 1)
		        	svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
					psIn1 = TheApplication().NewPropertySet();
					psOut1 = TheApplication().NewPropertySet();
					psIn1.SetProperty(""Refresh All"", ""Y"");
					svcUI.InvokeMethod(""RefreshCurrentApplet"", psIn1, psOut1);
		}//end of if (i > 0)
		}
	TheApplication().SetProfileAttr(""STCBulkHeaderId"", """");
	TheApplication().SetProfileAttr(""PaymentRequestType"", """");		
		
	}
	catch(e)
	{
	throw(e);
	}
	finally
	{
		psInputs = null;
		psOutputs = null;
		svcbsService = null;
		vBC = null;
		vBulkBC = null;
	}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	 try
	 {
	    switch(MethodName)
	     {     
		     case ""ImportData"":
		     ImportData(Inputs,Outputs);
		     return(CancelOperation);
		     break;		     

	      	 default:
	         break;
	     }
	 }
	 catch (exc)
	 {
	 	throw(exc.toString());
	 }
	 finally 
	 {
	 }  
}
function UpdateAmount(MSISDN,Amount,i)
{
	try
	{
		
		var RecCount = i;
		var sTotalAmount = 0;
		var sAmount = 0;
		var sSelect = ""N"";		
		var vBC: BusComp = TheApplication().GetBusObject(""STCBulkPaymentBO"").GetBusComp(""STC Bulk Payment Line Item BC"");
		var vBulkBC: BusComp = TheApplication().GetBusObject(""STCBulkPaymentBO"").GetBusComp(""STC Bulk Payment Header BC"");
		var BulkHeaderId = TheApplication().GetProfileAttr(""STCBulkHeaderId"");
		var BulkOperation = ""N"";
		var sSearchSpec = """";
		var psInputs = """",psOutputs = """",svcbsService = """";
		with(vBC)
		{
			while(RecCount > 0)
			{
				
				RecCount--;
				ClearToQuery();
				ActivateField(""STC MSISDN"");
				ActivateField(""Bulk Payment Header Id"");
				ActivateField(""STC Selected Flag"");
				ActivateField(""STC Payment Amount"");
				ActivateField(""STC Bulk Operation Flag"");
				SetSearchSpec(""Bulk Payment Header Id"",BulkHeaderId);
				SetSearchSpec(""STC MSISDN"",MSISDN[RecCount]);
				//var sMSISDN = 	MSISDN[RecCount];
				SetSearchSpec(""STC Selected Flag"",""Y"");
				ExecuteQuery(ForwardBackward);
				if(FirstRecord())
				{
					sSelect = GetFieldValue(""STC Selected Flag"");
					BulkOperation = GetFieldValue(""STC Bulk Operation Flag"");
					sAmount = ToNumber(Amount[RecCount]);
					if(sSelect == ""Y"" && sAmount == 0)
					{
						SetFieldValue(""STC Payment Amount"",sAmount);
						WriteRecord();
						sTotalAmount = sTotalAmount + sAmount;
					}
					if(sSelect == ""Y"" && sAmount > 0)
					{
						SetFieldValue(""STC Payment Amount"",sAmount);	
						WriteRecord();
						sTotalAmount = sTotalAmount + sAmount;
					}
				}
			}
		}
		if(BulkOperation == ""Y"")
		{
			with(vBulkBC)
			{
				ClearToQuery();
				ActivateField(""Payment Amount"");
				SetSearchSpec(""Id"",BulkHeaderId);
				ExecuteQuery(ForwardBackward);
				if(FirstRecord())
				{
					SetFieldValue(""Payment Amount"", sTotalAmount);
					WriteRecord();	
				}
			}
			psInputs = TheApplication().NewPropertySet();
			psOutputs = TheApplication().NewPropertySet();
			sSearchSpec = ""[Id] = '""+BulkHeaderId+""'"";
			svcbsService = TheApplication().GetService(""SIS OM PMT Service"");
			psInputs.SetProperty(""Business Component Name"", ""STC Bulk Payment Header BC"");
			psInputs.SetProperty(""Business Object Name"", ""Account"");
			psInputs.SetProperty(""Search Specification"", sSearchSpec);
			svcbsService.InvokeMethod(""Refresh Business Component"", psInputs, psOutputs);
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
		svcbsService = null;
		vBC = null;
		vBulkBC = null;
	}
}
function UpdateBAmount(MSISDN,Amount,i)
{
	try
	{
		var RecCount = i;
		var sTotalAmount = 0;
		var sAmount = 0;
		var sSelect = ""N"";		
		var vBC: BusComp = TheApplication().GetBusObject(""STCBulkPaymentBO"").GetBusComp(""STC Bulk Payment Line Item BC"");
		var vBulkBC: BusComp = TheApplication().GetBusObject(""STCBulkPaymentBO"").GetBusComp(""STC Bulk Payment Header BC"");
		var BulkHeaderId = TheApplication().GetProfileAttr(""STCBulkHeaderId"");
		var BulkOperation = ""N"";
		var sSearchSpec = """";
		var psInputs = """",psOutputs = """",svcbsService = """";
		with(vBC)
		{
			while(RecCount > 0)
			{
				RecCount--;
				ClearToQuery();
				ActivateField(""Bill Number"");
				ActivateField(""Bulk Payment Header Id"");
				ActivateField(""STC Selected Flag"");
				ActivateField(""STC Payment Amount"");
				ActivateField(""STC Bulk Operation Flag"");
				SetSearchSpec(""Bulk Payment Header Id"",BulkHeaderId);
				SetSearchSpec(""Bill Number"",MSISDN[RecCount]);
				//var sMSISDN = 	MSISDN[RecCount];
				SetSearchSpec(""STC Selected Flag"",""Y"");
				ExecuteQuery(ForwardBackward);
				if(FirstRecord())
				{
					sSelect = GetFieldValue(""STC Selected Flag"");
					BulkOperation = GetFieldValue(""STC Bulk Operation Flag"");
					sAmount = ToNumber(Amount[RecCount]);
					if(sSelect == ""Y"" && sAmount == 0)
					{
						SetFieldValue(""STC Payment Amount"",sAmount);
						WriteRecord();
						sTotalAmount = sTotalAmount + sAmount;
					}
					if(sSelect == ""Y"" && sAmount > 0)
					{
						SetFieldValue(""STC Payment Amount"",sAmount);	
						WriteRecord();
						sTotalAmount = sTotalAmount + sAmount;
					}
				}
			}
		}
		if(BulkOperation == ""Y"")
		{
			with(vBulkBC)
			{
				ClearToQuery();
				ActivateField(""Payment Amount"");
				SetSearchSpec(""Id"",BulkHeaderId);
				ExecuteQuery(ForwardBackward);
				if(FirstRecord())
				{
					SetFieldValue(""Payment Amount"", sTotalAmount);
					WriteRecord();	
				}
			}
			psInputs = TheApplication().NewPropertySet();
			psOutputs = TheApplication().NewPropertySet();
			sSearchSpec = ""[Id] = '""+BulkHeaderId+""'"";
			svcbsService = TheApplication().GetService(""SIS OM PMT Service"");
			psInputs.SetProperty(""Business Component Name"", ""STC Bulk Payment Header BC"");
			psInputs.SetProperty(""Business Object Name"", ""Account"");
			psInputs.SetProperty(""Search Specification"", sSearchSpec);
			svcbsService.InvokeMethod(""Refresh Business Component"", psInputs, psOutputs);
		}
	}
	catch(e)
	{
	}
	finally
	{
		psInputs = null;
		psOutputs = null;
		svcbsService = null;
		vBC = null;
		vBulkBC = null;
	}
}  
"
function UpdateBanAmount(MSISDN,Amount,i)
{
	try
	{
		
		var RecCount = i;
		var sTotalAmount = 0;
		var sAmount = 0;
		var sSelect = ""N"";		
		var vBC: BusComp = TheApplication().GetBusObject(""STCBulkPaymentBO"").GetBusComp(""STC Bulk Payment Line Item BC"");
		var vBulkBC: BusComp = TheApplication().GetBusObject(""STCBulkPaymentBO"").GetBusComp(""STC Bulk Payment Header BC"");
		var BulkHeaderId = TheApplication().GetProfileAttr(""STCBulkHeaderId"");
		var BulkOperation = ""N"";
		var sSearchSpec = """";
		var psInputs = """",psOutputs = """",svcbsService = """";
		with(vBC)
		{
			while(RecCount > 0)
			{
				
				RecCount--;
				ClearToQuery();
				ActivateField(""Bill Number"");
				ActivateField(""STC BAN Number"");
				ActivateField(""Bulk Payment Header Id"");
				ActivateField(""STC Selected Flag"");
				ActivateField(""STC Payment Amount"");
				ActivateField(""STC Bulk Operation Flag"");
				SetSearchSpec(""Bulk Payment Header Id"",BulkHeaderId);
				SetSearchSpec(""STC BAN Number"",MSISDN[RecCount]);
				//var sMSISDN = 	MSISDN[RecCount];
				SetSearchSpec(""STC Selected Flag"",""Y"");
				ExecuteQuery(ForwardBackward);
				if(FirstRecord())
				{
					sSelect = GetFieldValue(""STC Selected Flag"");
					BulkOperation = GetFieldValue(""STC Bulk Operation Flag"");
					sAmount = ToNumber(Amount[RecCount]);
					if(sSelect == ""Y"" && sAmount == 0)
					{
						SetFieldValue(""STC Payment Amount"",sAmount);
						WriteRecord();
						sTotalAmount = sTotalAmount + sAmount;
					}
					if(sSelect == ""Y"" && sAmount > 0)
					{
						SetFieldValue(""STC Payment Amount"",sAmount);	
						WriteRecord();
						sTotalAmount = sTotalAmount + sAmount;
					}
				}
			}
		}
		if(BulkOperation == ""Y"")
		{
			with(vBulkBC)
			{
				ClearToQuery();
				ActivateField(""Payment Amount"");
				SetSearchSpec(""Id"",BulkHeaderId);
				ExecuteQuery(ForwardBackward);
				if(FirstRecord())
				{
					SetFieldValue(""Payment Amount"", sTotalAmount);
					WriteRecord();	
				}
			}
			psInputs = TheApplication().NewPropertySet();
			psOutputs = TheApplication().NewPropertySet();
			sSearchSpec = ""[Id] = '""+BulkHeaderId+""'"";
			svcbsService = TheApplication().GetService(""SIS OM PMT Service"");
			psInputs.SetProperty(""Business Component Name"", ""STC Bulk Payment Header BC"");
			psInputs.SetProperty(""Business Object Name"", ""Account"");
			psInputs.SetProperty(""Search Specification"", sSearchSpec);
			svcbsService.InvokeMethod(""Refresh Business Component"", psInputs, psOutputs);
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
		svcbsService = null;
		vBC = null;
		vBulkBC = null;
	}
}  
"
function CreateIP(SubnetMask,NetworkId,IPRange,IPAddress,i)
{
	var RecCount = i;		
	var vBC: BusComp = TheApplication().GetBusObject(""STC DIA IP Details"").GetBusComp(""STC DIA IP Details"");
	//var CRMId = SubnetMask[RecCount];
	//CRMId = TheApplication().InvokeMethod(""LookupValue"", ""DYNDIA_SUBNET_CRMID"", CRMId);
	var Status = TheApplication().InvokeMethod(""LookupValue"", ""STC_APN_STATUS"", ""Unassigned"");

	//Abuzar:SD: Business UltranetOffnet - 23Mar21 - Start//
	var sActiveView = TheApplication().ActiveViewName();	
	var APN = ""DYNDIAIP"";
	var Domain = ""dyn-dia.stc.com.bh"";

	if(sActiveView != null && sActiveView != """" && sActiveView == ""STC UltranetOffnet IP Inventory View"")
	{
		APN = TheApplication().InvokeMethod(""LookupValue"", ""STC_ULTRANETOFFNET_ADMIN"", ""APN"");
		Domain = TheApplication().InvokeMethod(""LookupValue"", ""STC_ULTRANETOFFNET_ADMIN"", ""Domain"");
	}

	var Headerval = """";
	var skip = ""N"";
	
    var vImportStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_ADJ_IMP_STAT"",""Upload Success"");

	with(vBC)
	{
		while(RecCount > 1)
		{
			RecCount--;
			skip = ""N"";
			ClearToQuery();
			ActivateField(""To IP Address"");
			ActivateField(""APN Template Id"");
			
			SetSearchSpec(""To IP Address"",IPAddress[RecCount]);
			SetSearchSpec(""APN Template Id"",SubnetMask[RecCount]);
			SetSearchSpec(""Apn Name"",APN); //Abuzar:31/03/2021-Aded for Business UltranetOffnet Static IP details
			ExecuteQuery(ForwardBackward);
			if(FirstRecord())
			{
			}
			else
			{
				Headerval = SubnetMask[RecCount];
				if (Headerval == ""Subnet Mask"")
									{
									skip = ""Y"";
									}
									else
									{
										skip = ""N"";
									}
					                if (skip == ""N"")
									{
									NewRecord(NewAfter);
			                        SetFieldValue(""APN Template Id"",SubnetMask[RecCount]);	
			                       SetFieldValue(""STC MPLS Circuit Id"",NetworkId[RecCount]);
			                       SetFieldValue(""STC SDM Reference"",IPRange[RecCount]);
			                       SetFieldValue(""To IP Address"",IPAddress[RecCount]);
						           SetFieldValue(""STC Status"",Status);
			                       SetFieldValue(""Apn Name"",APN);
			                       SetFieldValue(""From IP Address"",Domain);
			
				
			                           WriteRecord();
									}
		
		    
			
			}//end of else
		}//end of while
		var svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
var psIn = TheApplication().NewPropertySet();
var psOut = TheApplication().NewPropertySet();
psIn.SetProperty(""Refresh All"",""Y"");
svcUI.InvokeMethod(""RefreshCurrentApplet"",psIn,psOut);
	}//end of with
}
function ImportData(Inputs, Outputs)
{//SHAR: Created for DIA IP Inventory Import
	var vInputFile      = """";
    var vReadFromFile   = """";
    var vFileName   = Inputs.GetProperty(""FileName"");
  	var vFileType     = ToString(Inputs.GetProperty(""FileType""));
  	vFileType       = Clib.strlwr(vFileType);
 	var SubnetMask: Array = new Array();
 	var NetworkId: Array = new Array();
 	var IPRange: Array = new Array();
	var IPAddress: Array = new Array();
 	var vRecord = false;
    if( vFileType != ""csv"")
    {
       TheApplication().RaiseErrorText(""Please check the File Type , It should be :  FileName.CSV"");
    }
    vInputFile     = Clib.fopen(vFileName , ""rt"");       
    vReadFromFile  = Clib.fgets(vInputFile);	
	
	var i = 1;
	var ErrMsg = ""Success"";
	if(vReadFromFile != null && vFileName != '' && vFileName != """")
	{		
		if (vInputFile == null)
		{
			TheApplication().RaiseErrorText(""Error in opening the file"");
		}
		 while((vReadFromFile != null) && (vReadFromFile.length > 1))
		 {			
			ErrMsg = """"; //Nullify Error Message for each of the iteration			
			if(vReadFromFile != null && vReadFromFile != """")
			{
				vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
				var sRecData = vReadFromFile.split("","");
				SubnetMask[i] = sRecData[0];				
				NetworkId[i] = sRecData[1];
				IPRange[i] = sRecData[2];
				IPAddress[i] = sRecData[3];
							
				i++;
			}//if(sReadFromFile != null && sReadFromFile != """")
			vReadFromFile = Clib.fgets(vInputFile);
		 }//while(vReadFromFile != null) 
		 
		 CreateIP(SubnetMask,NetworkId,IPRange,IPAddress,i);
		
	}//if(sFileName != null && sFileName != '' && sFileName != """")
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	 try
	 {
	    switch(MethodName)
	     {     
		     case ""ImportData"":
		     ImportData(Inputs,Outputs);
		     return(CancelOperation);
		     break;		     

	      	 default:
	         break;
	     }
	 }
	 catch (exc)
	 {
	 	throw(exc.toString());
	 }
	 finally 
	 {
	 }  
}
"var sGlobFileName = """";
var vFilePathOut = """";"
function CreateMSISDN(sDealerShopName,sCRNumber,sOwnerName,sOwnerPhoneNumber,sContactPersonName,sContactPersonNumber,sRegistrationCode,sDealerCode,sDealerAddress,sCategory,sActivationDealer,sRechargeDealer,sSupervisorName,sSupervisorPhoneNumber,sSalesmanName,sSalesmanPhoneNumber,sEmailId,ErrorMsg,i)
{
	var RecCount = i;
	var ErrorFlag = ""N"";
	var boDealerDtls = TheApplication().GetBusObject(""STC Prepaid Registration Dealer Details BO"");
//	var bcDealerDtls = boDealerDtls.GetBusComp(""STC Prepaid Registration Dealer BC"");
	var bcDealerDtls = boDealerDtls.GetBusComp(""STC Prepaid Registration Dealer Import BC"");
	var vImportStatus =  TheApplication().InvokeMethod(""LookupValue"",""STC_ADJ_IMP_STAT"",""Upload Success"");
	with(bcDealerDtls)
	{
		while(RecCount > 2)
		{
			try
			{
				ActivateField(""Dealer Name"");
				ActivateField(""CR Number"");
				ActivateField(""Owner Name"");
				ActivateField(""Owner Phone Number"");
				ActivateField(""Contact Person Name"");
				ActivateField(""Contact Person Number"");
				ActivateField(""Registration Code"");
				ActivateField(""Dealer Code"");
				ActivateField(""Dealer Address"");
				ActivateField(""Category"");
				ActivateField(""Activation Dealer"");
				ActivateField(""Recharge Dealer"");
				ActivateField(""Supervisor Name"");
				ActivateField(""Supervisor Phone Number"");
				ActivateField(""Salesman Name"");
				ActivateField(""Salesman Phone Number"");
				ActivateField(""Email Id"");
				ActivateField(""Import Status"");
				NewRecord(NewAfter);
				RecCount--;
				SetFieldValue(""Dealer Name"",sDealerShopName[RecCount]);
				SetFieldValue(""CR Number"",sCRNumber[RecCount]);
				SetFieldValue(""Owner Name"",sOwnerName[RecCount]);
				SetFieldValue(""Owner Phone Number"",sOwnerPhoneNumber[RecCount]);
				SetFieldValue(""Contact Person Name"",sContactPersonName[RecCount]);
				SetFieldValue(""Contact Person Number"",sContactPersonNumber[RecCount]);
				SetFieldValue(""Registration Code"",sRegistrationCode[RecCount]);
				SetFieldValue(""Dealer Code"",sDealerCode[RecCount]);
				SetFieldValue(""Dealer Address"",sDealerAddress[RecCount]);
				SetFieldValue(""Category"",sCategory[RecCount]);
				SetFieldValue(""Activation Dealer"",sActivationDealer[RecCount]);
				SetFieldValue(""Recharge Dealer"",sRechargeDealer[RecCount]);
				SetFieldValue(""Supervisor Name"",sSupervisorName[RecCount]);
				SetFieldValue(""Supervisor Phone Number"",sSupervisorPhoneNumber[RecCount]);
				SetFieldValue(""Salesman Name"",sSalesmanName[RecCount]);
				SetFieldValue(""Salesman Phone Number"",sSalesmanPhoneNumber[RecCount]);
				SetFieldValue(""Email Id"",sEmailId[RecCount]);	
				SetFieldValue(""Import Status"",""Import Success"");
				WriteRecord();
				ErrorMsg[RecCount] = ""Success"";
			}
			catch(e)
			{
				ErrorMsg[RecCount] = e.errText;
				ErrorFlag = ""Y"";
				UndoRecord();
				UpdateLogFile(sRegistrationCode[RecCount],ErrorMsg[RecCount], RecCount);
			}
			finally
			{
			
			}
		}
	}
	return ErrorFlag;
}
"
function DealerIncentiveVal(Inputs,Outputs)
{
try
{
	var sDlrCode = Inputs.GetProperty(""DealerCode"");
	var sAdjustAmnt = Inputs.GetProperty(""IncentiveAmnt"");
	var sCallTier = Inputs.GetProperty(""Call Tier 3"");
	var CallType = Inputs.GetProperty(""Call Type"");
	var sAccountId = """"; var sAccountNum = """";
	var sUservalidation = ""0"";
	var sValdnMsg = """";

	if(sCallTier == """" || sCallTier == null)
	{
	sValdnMsg = ""Call Tier Value is null"";
	}
	else
	{
		if(sDlrCode == """" || sDlrCode == null)
		{
		sValdnMsg = ""DealerCode Value is null"";
		}
		else
		{
			if(CallType != ""Service Request"")
			{
			sValdnMsg = ""Interaction Type is not Service Request"";
			}
			else
			{
			var sUser = TheApplication().GetProfileAttr(""Login Name"");
			
			var sSvcAcntBO = TheApplication().GetBusObject(""STC Service Account"");
			var sSVCAcntThnBC = sSvcAcntBO.GetBusComp(""STC Thin CUT Service Sub Accounts"");
			
			var sDealerDBbo = TheApplication().GetBusObject(""STC Prepaid Registration Dealer Details BO"");
			var sDealerDBbc = sDealerDBbo.GetBusComp(""STC Prepaid Registration Dealer BC"");
			var sType = """";
			
			
			var sAccountStat = TheApplication().InvokeMethod(""LookupValue"", ""ACCOUNT_STATUS"", ""Active"");
			var sUser1 = TheApplication().InvokeMethod(""LookupValue"", ""STC_DEALER_SR_PROCESS"", sUser);
				if(sUser == sUser1)
				{
					with(sSVCAcntThnBC)
					{
						SetViewMode(AllView);
						ClearToQuery();
						ActivateField(""Id"");
						ActivateField(""STC Pricing Plan Type"");
						ActivateField(""Account Number"");
						SetSearchExpr(""[DUNS Number] = '""+sDlrCode+""' AND [Account Status] = '""+sAccountStat+""'"");
						ExecuteQuery(ForwardOnly);
						if(FirstRecord())
						{
							sAccountId = GetFieldValue(""Id"");
							sType = GetFieldValue(""STC Pricing Plan Type"");
							if(sType != ""Prepaid"")
							{
							sValdnMsg = ""Selected Dealer MSISDN is not Prepaid"";
							}
							sAccountId = GetFieldValue(""Id"");
							sAccountNum = GetFieldValue(""Account Number"");
						}
						else
						{
							sValdnMsg = ""Dealer Code/Dealer MSISDN is not found or not Active"";
						}
					}
					if(sValdnMsg == """" || sValdnMsg == null)
					{
						if(sAdjustAmnt == 0 || sAdjustAmnt == """" || sAdjustAmnt == null || sAdjustAmnt < 0)
						{
							sValdnMsg = ""Incentive amount should not be null or Zero or Negative"";
						}
						else
						{
							with(sDealerDBbc)
							{
								SetViewMode(AllView);
								ClearToQuery();
								SetSearchExpr(""[Dealer Code] = '""+sDlrCode+""'"");
								ExecuteQuery(ForwardOnly);
								if(!FirstRecord())
								{
									sValdnMsg = ""Dealer Code not found in Dealer Registration Details database in CRM"";
								}
							}	
						}
					}
				}
				else
				{
				sValdnMsg = ""Transaction Not allowed to be processed by User : '""+sUser+""'"";
				sUservalidation = ""1"";
				}
			}
		}
	}
	Outputs.SetProperty(""ValidationMessage"", sValdnMsg);
	Outputs.SetProperty(""AccountId"", sAccountId);
	Outputs.SetProperty(""AccountNum"", sAccountNum);
	Outputs.SetProperty(""UserValidation"", sUservalidation);
}
catch(e)
{
	throw(e);
}
finally
{
	sDealerDBbc = null; sDealerDBbo = null; sSVCAcntThnBC = null; sSvcAcntBO = null;
}
}
function GetLOVDesc(Type, LIC)
{
 var vLOVType = Type;
 var vLIC = LIC;
 
 var vDesc ="""";
 var isRecord;
 var vBOLOV,vBCLOV;
 
 try
 {
  vBOLOV = TheApplication().GetBusObject(""List Of Values"");
     vBCLOV = vBOLOV.GetBusComp(""List Of Values"");
     
 
  with(vBCLOV)
     {
     SetViewMode(3);
      ActivateField(""Type"");
     ActivateField(""Description"");
      ActivateField(""Name"");
      ClearToQuery();
      SetSearchSpec(""Type"",vLOVType);
      SetSearchSpec(""Name"",vLIC);
      ExecuteQuery(ForwardOnly);
      isRecord = FirstRecord();
   if(isRecord != null)
   {  
          vDesc = GetFieldValue(""Description"");  
   }   
   return(vDesc);    
  }
 }
 catch(e)
 {
  TheApplication().RaiseError(e.toString);
  return(vDesc);  
 }
 finally
 {
  vBOLOV = null;
  vBCLOV = null;
 
 } 
}
function GetTimeStamp()
{
	var SysDate = Clib.time();
	var ObjDate = Date.fromSystem(SysDate); 

	var Month = ToString(ObjDate.getMonth()+1);
		if(Month.length == 1)   
			{
				Month = ""0"" + Month;
			}
	var Day = ToString(ObjDate.getDate());
		if(Day.length == 1)
			{
				Day = ""0"" + Day;
			}
	var Year = ToString(ObjDate.getFullYear());
	var Hour = ToString(ObjDate.getHours());
		if(Hour.length == 1)
			{
				Hour = ""0"" + Hour;
			}
	var Minute = ToString(ObjDate.getMinutes());
		if(Minute.length == 1)
			{
				Minute = ""0"" + Minute;
			}
	var Second = ToString(ObjDate.getSeconds()); 
		if(Second.length == 1)
			{
				Second = ""0"" + Second;
			}

	var now = Day+""""+Month+""""+Year+""""+Hour+""""+Minute+""""+Second; 

	return(now);
}
function ImportData(Inputs, Outputs)
{
//try
//{
	var vInputFile      = """";
    var vReadFromFile   = """";
    var vBulkDataArray  = """";
    var vErrorFlg = ""N"";
    var vAdjustmentId = TheApplication().GetProfileAttr(""STCAdjustmentId"");
	var vAdjustmentType = TheApplication().GetProfileAttr(""STCAdjustmentType"");
	var vFileName   = Inputs.GetProperty(""FileName"");
  	var vFileType     = ToString(Inputs.GetProperty(""FileType""));
 	vFileType       = Clib.strlwr(vFileType);
 	var DealerShopName: Array = new Array();
 	var CRNumber: Array = new Array();
 	var OwnerName: Array = new Array();
 	var OwnerPhoneNumber : Array = new Array();
 	var ContactPersonName : Array = new Array();
 	var ContactPersonNumber: Array = new Array();
 	var RegistrationCode: Array = new Array();
 	var DealerCode: Array = new Array();
 	var DealerAddress: Array = new Array();
 	var Category: Array = new Array();
 	var ActivationDealer: Array = new Array();
 	var RechargeDealer: Array = new Array();
 	var SupervisorName: Array = new Array();
 	var SupervisorPhoneNumber: Array = new Array();
 	var SalesmanName: Array = new Array();
 	var SalesmanPhoneNumber: Array = new Array();
 	var EmailId: Array = new Array();
 	var ErrorMsg: Array = new Array();
 	
 	var vRecord = false;
    if( vFileType != ""csv"")
    {
       TheApplication().RaiseErrorText(""Please check the File Type , It should be :  FileName.CSV"");
    }
    vInputFile     = Clib.fopen(vFileName , ""rt"");       
    vReadFromFile  = Clib.fgets(vInputFile);	
	var DeviceEligible = """";
	var BlackListLvl = """";
	var i = 1;
	var ErrMsg = ""Success"";
	if(vReadFromFile != null && vFileName != '' && vFileName != """")
	{		
		if (vInputFile == null)
		{
			TheApplication().RaiseErrorText(""Error in opening the file"");
		}
		 while((vReadFromFile != null) && (vReadFromFile.length > 1))
		 {			
			ErrMsg = """"; //Nullify Error Message for each of the iteration			
			if(vReadFromFile != null && vReadFromFile != """")
			{
				vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
				var sRecData = vReadFromFile.split("","");
				DealerShopName[i] = sRecData[0];				
				CRNumber[i] = sRecData[1];
				OwnerName[i] = sRecData[2];
				OwnerPhoneNumber[i] = sRecData[3];
				ContactPersonName[i] = sRecData[4];
				ContactPersonNumber[i] = sRecData[5];
				RegistrationCode[i] = sRecData[6];
				DealerCode[i] = sRecData[7];
				DealerAddress[i] = sRecData[8];
				Category[i] = sRecData[9];
				ActivationDealer[i] = sRecData[10];
				RechargeDealer[i] = sRecData[11];
				SupervisorName[i] = sRecData[12];
				SupervisorPhoneNumber[i] = sRecData[13];
				SalesmanName[i] = sRecData[14];
				SalesmanPhoneNumber[i] = sRecData[15];
				EmailId[i] = sRecData[16];
				ErrorMsg[i] = """";		
				i++;
			}//if(sReadFromFile != null && sReadFromFile != """")
			vReadFromFile = Clib.fgets(vInputFile);
		 }//while(!Clib.feof(sFileOpen))
		 var psInputs = TheApplication().NewPropertySet();
		 var psOutputs = TheApplication().NewPropertySet();
		vErrorFlg = CreateMSISDN(DealerShopName,CRNumber,OwnerName,OwnerPhoneNumber,ContactPersonName,ContactPersonNumber,RegistrationCode,DealerCode,DealerAddress,Category,ActivationDealer,RechargeDealer,SupervisorName,SupervisorPhoneNumber,SalesmanName,SalesmanPhoneNumber,EmailId,ErrorMsg,i);
		if(vErrorFlg == ""Y"")
		{
			TheApplication().RaiseErrorText(""Imported File with errors, Please check the log. Path: ""+vFilePathOut);
		}
		else
		{
		//	TheApplication().RaiseErrorText(""Import Success"");
			
		}
	}//if(sFileName != null && sFileName != '' && sFileName != """")
//}
/*catch(e)
{
	throw(e);
}*/
/*finally
{
	
}*/
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
//	 try
//	 {
	    switch(MethodName)
	     {     
		     case ""ImportData"":
		     ImportData(Inputs,Outputs);
		     return(CancelOperation);
		     break;	
		     
		     case ""DealerIncentiveVal"":
		     DealerIncentiveVal(Inputs,Outputs);
		     return(CancelOperation);
		     break;	     

	      	 default:
	         break;
	     }
/*	 }
	 catch (exc)
	 {
	 	throw(exc.toString());
	 }
	 finally 
	 {
	 }  */
}
function UpdateLogFile(strRegistrationCode,strErrorMsg, iRecCount)
{
try
{
	var strError = """";
	var strFileName = """";
	var vFilePathLOV = ""STC_ADMIN"";
 	var vLIC = ""DEALERLOGPATH"";
 	var strFilePath = GetLOVDesc(vFilePathLOV,vLIC);
	var vDTime = GetTimeStamp();
	if(sGlobFileName == """" || sGlobFileName == null)
	{
		strFileName = ""DealerDetailsErrorLog""+ ""_""+ vDTime +"".csv"";
		sGlobFileName = strFileName
	}
	else
	{
		strFileName = sGlobFileName;
	}
	if(vFilePathOut == null || vFilePathOut == """")
	{
		vFilePathOut = strFilePath+strFileName;
	}
	var vFP = Clib.fopen(strFilePath + strFileName,""a+"");	//Opening the file, in append mode
	if(vFP != null)	
   	{	 
	  
	    Clib.fputs(""Failed Record Row ""+iRecCount+"",Registration Code:""+strRegistrationCode+"",Error Message:""+strErrorMsg+""\n"", vFP);	     		   
			
		if(Clib.fclose(vFP) != 0)
		{
			strError = strError + ""****Logging file not closed****"";
		}
	}
	else
	{
			strError = strError + ""****Could not create logging File****"";
	}
	if(strError != """" && strError != null)
	{
		TheApplication().RaiseErrorText(strError);
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
function ImportData(Inputs, Outputs)
{
try
{
	var vInputFile      = """";
    var vReadFromFile   = """";
    var sErrorFlag = """";
    
	var vFileName   = Inputs.GetProperty(""FileName"");
  	var vFileType     = ToString(Inputs.GetProperty(""FileType""));
 	vFileType       = Clib.strlwr(vFileType);
 //	var DealerShopName: Array = new Array();
 	var sBillAccnt = """"; var sSrSubArea = """"; var sLegalFee = 0; var sMSISDN = """"; var sCPRNumber = """"; var sAgencyName = """";
 	
 	
 	var sBulkImportBO =  TheApplication().GetBusObject(""STC Bulk SR"");
 	var sBulkImportBC = sBulkImportBO.GetBusComp(""STC Bulk Collection SR"");
 	
 	
 	var sBillingAcntBO =  TheApplication().GetBusObject(""STC Billing Account"");
 	var sBillingAcntBC = sBillingAcntBO.GetBusComp(""CUT Invoice Sub Accounts"");
 	
 	var bsSVC = TheApplication().GetService(""SIS OM PC Service"");
	var psInputs = TheApplication().NewPropertySet();
	var psOutputs = TheApplication().NewPropertySet();
 	bsSVC.InvokeMethod(""Get Next RowId"", psInputs, psOutputs);
 	var strBatchId = psOutputs.GetProperty(""RowId"");
 	
	sBulkImportBC.SetViewMode(AllView);
 	sBulkImportBC.InvokeMethod(""SetAdminMode"",""TRUE"");
    sBulkImportBC.ActivateField(""Account Number"");
    sBulkImportBC.ActivateField(""SR Sub Area"");
    sBulkImportBC.ActivateField(""STC Legal Fees"");
    sBulkImportBC.ActivateField(""MSISDN"");
    sBulkImportBC.ActivateField(""CPR Number"");
    sBulkImportBC.ActivateField(""Import Status"");
    sBulkImportBC.ActivateField(""Batch Id"");
    sBulkImportBC.ActivateField(""STC Agency Name"");
 	
 	if( vFileType != ""csv"")
    {
       TheApplication().RaiseErrorText(""Please check the File Type , It should be :  FileName.CSV"");
    }
    vInputFile     = Clib.fopen(vFileName , ""rt"");       
    vReadFromFile  = Clib.fgets(vInputFile);
    
    if(vReadFromFile != null && vFileName != '' && vFileName != """")
	{
		if (vInputFile == null)
		{
			TheApplication().RaiseErrorText(""Error in opening the file"");
		}//end of if (vInputFile == null)
		with(sBulkImportBC)
		{
			while((vReadFromFile != null) && (vReadFromFile.length > 1))
			{
				if(vReadFromFile != null && vReadFromFile != """")
				{
					vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n""));
					var sRecData = vReadFromFile.split("","");
					sBillAccnt = sRecData[0];
					sCPRNumber = sRecData[1];
					sSrSubArea = sRecData[2];
					sLegalFee = sRecData[3];
					sAgencyName = sRecData[4];
				
					if(sBillAccnt != """" && sBillAccnt != null)
					{
						
				    	NewRecord(NewAfter);
				    	SetFieldValue(""Account Number"",sBillAccnt);
				    	SetFieldValue(""Import Status"", ""Success"");
				    	SetFieldValue(""SR Sub Area"", sSrSubArea);
				    	SetFieldValue(""STC Legal Fees"", sLegalFee);
				    	SetFieldValue(""STC Agency Name"", sAgencyName);
				    	SetFieldValue(""CPR Number"", sCPRNumber);
				    	SetFieldValue(""Failure Reason"" ,"""");
				    	SetFieldValue(""Batch Id"" ,strBatchId);
					}//end of if(sBillAccnt != """" && sBillAccnt != null)
				}//end of if(vReadFromFile != null && vReadFromFile != """")
				vReadFromFile = Clib.fgets(vInputFile);
				sBillAccnt = """", sSrSubArea = """"; sLegalFee = 0; sMSISDN = """"; sCPRNumber = """";
			}//end of while((vReadFromFile != null) && (vReadFromFile.length > 1))
			WriteRecord();
		}//end of with(sBulkImportBC)	
	}//end of if(vReadFromFile != null && vFileName != '' && vFileName != """")
}
catch(e)
{	
	sErrorFlag = ""Y"";
	fnDeleteImportedRecords(strBatchId);
	throw(e);
}
finally
{
	if(sErrorFlag != ""Y"")
	{
		sBulkImportBC.WriteRecord();
	}
	else
	{
		fnDeleteImportedRecords(strBatchId);
//		Outputs.SetProperty(""ErrorBatchId"", strBatchId);
	}
	sBillingAcntBC = null; sBillingAcntBO = null; sBulkImportBC = null; sBulkImportBO = null;
}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{

	if( MethodName == ""Import"")
	{
		ImportData(Inputs,Outputs );
/*		var sBatId = """";
		sBatId = Outputs.GetProperty(""ErrorBatchId"");
		if(sBatId != """" && sBatId != null)
		{
			fnDeleteImportedRecords(sBatId);
		}*/
		return(CancelOperation);
	}
 return (ContinueOperation);
}
function fnDeleteImportedRecords(sBatchId)
{
try
{
	var boColMngmt =  TheApplication().GetBusObject(""STC Bulk SR"");
 	var bcColMngmt = boColMngmt.GetBusComp(""STC Bulk Collection SR"");
	with(bcColMngmt)
	{
		SetViewMode(AllView);
		ClearToQuery();
		ActivateField(""Account Number"");
		ActivateField(""Batch Id"");
		SetSearchSpec(""Batch Id"", sBatchId);
		ExecuteQuery(ForwardBackward);
		var iCount = CountRecords();
		var iRec= FirstRecord();
		while(iRec)
		{
			DeleteRecord();
			iRec = NextRecord();
		}
	/*	for(var i = 0; i<= iCount;)
		{
			DeleteRecord();
		//	WriteRecord();
			iRec = NextRecord();
			i++;
		}*/
	}
}
catch(e)
{
	throw(e);
}
finally
{
	bcColMngmt = null; boColMngmt = null;
}
}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}
"var vErrorMessage = """";
var vErrorCode    = """";"
function CheckDuplicate(MSISDN)
{
try
 {
 var sApp = TheApplication();
 var ServAccId = """";
 var AssetMgmtBC:BusComp =  sApp.GetBusObject(""STC Asset Mgmt - Asset Thin BO"").GetBusComp(""STC Asset Mgmt - Asset Thin"");
 //var sMSISDN = MSISDN;
 with(AssetMgmtBC)
 {
     ActivateField(""Service Account Id"");
     SetViewMode(AllView);
     ClearToQuery();
     //var spec  = ""[Serial Number] = '"" + vReadFromFile + ""' AND [Status] = 'Active' AND [STC Service Description] = 'BUSPRE'"";
     var spec  = ""[Serial Number] = '"" + MSISDN + ""' AND [Status] = 'Active' AND [STC Service Description] = 'BUSPRE'"";//Mayank
	 SetSearchExpr(spec);
     ExecuteQuery(ForwardOnly);
     //var isAssetRecord = FirstRecord();
     var isRecord = FirstRecord();
   if(FirstRecord())
   	 {  
        ServAccId = GetFieldValue(""Service Account Id"");
     }
     return(ServAccId);
     
     }
 }
 catch(e)
 {
  TheApplication().RaiseError(e.toString);
  return(ServAccId);  
 }
 finally
 {
  AssetMgmtBC = null;
 } 
}
function GetLOVDesc(Type, LIC)
{
	var vLOVType = Type;
	var vLIC = LIC;
	
	var vDesc ="""";
	var isRecord;
	var vBOLOV,vBCLOV;
	
	try
	{
		vBOLOV = TheApplication().GetBusObject(""List Of Values"");
	   	vBCLOV = vBOLOV.GetBusComp(""List Of Values"");
	   	
	
		with(vBCLOV)
	    {
		  	SetViewMode(3);
		    ActivateField(""Type"");
		  	ActivateField(""Description"");
		    ActivateField(""Name"");
		    ClearToQuery();
		    SetSearchSpec(""Type"",vLOVType);
		    SetSearchSpec(""Name"",vLIC);
		    ExecuteQuery(ForwardOnly);
		    isRecord = FirstRecord();
			if(isRecord != null)
			{  
		        vDesc = GetFieldValue(""Description"");  
			}   
			return(vDesc);				
		}
	}
	catch(e)
	{
		TheApplication().RaiseError(e.toString);
		return(vDesc);		
	}
	finally
	{
		vBOLOV = null;
		vBCLOV = null;
	
	}	
}
function Import_Bulk_File( Inputs , Outputs)
{
   try
   {
     var ProdName;
      var vInputFile      = """";
      var vReadFromFile   = """";
      var vBulkDataArray  = """"; 
      var serviceAccountId = """";
    																				 // adding for price changes below
	var PRICELOV = ""STC_BB_PRPID_PLAN_PRICE"";
      																				// adding for price changes below
      var ServAccId;
      var BillAccId;
      var sMSISDN = """";
      var sFirstName = """";
      var sLastName = """";	  
      var sDOB = """";
      var sIdType = """";
      var sIdNumber = """";
      var sGCC = """";
      var sGender = """";
      var sPhone = """";
      var sMSISDN1 = """";
      var sFirstName1 = """";
      var sLastName1 = """";	  
      var sDOB1 = """";
      var sIdType1 = """";
      var sIdNumber1 = """";
      var sGCC1 = """";
      var sGender1 = """";
      var sPhone1 = """";
      var BulkOnce = ""True"";
      var ImportFlg=TheApplication().SetProfileAttr(""ImportFlg"",""Y"");           
 	var sApp = TheApplication();
 	  var vBulkBO: BusObject =  sApp.GetBusObject(""STC Billing Account"");
      var vBulkBC: BusComp = vBulkBO.GetBusComp(""STC Business Prepaid Update BC""); 
      var AssetMgmtBC:BusComp =  sApp.GetBusObject(""STC Asset Mgmt - Asset Thin BO"").GetBusComp(""STC Asset Mgmt - Asset Thin"");
      var BillingAccId = sApp.GetProfileAttr(""BillAccountId"");
      var BatchId = sApp.GetProfileAttr(""ImportBatchId"");
      var planName;
      var Price;    
      vBulkBC.SetViewMode(AllView);
      vBulkBC.InvokeMethod(""SetAdminMode"",""TRUE"");
      vBulkBC.ActivateField(""Activate"");
      vBulkBC.ActivateField(""Batch Id"");
      vBulkBC.ActivateField(""MSISDN"");
      vBulkBC.ActivateField(""Parent BAN Id"");
      vBulkBC.ActivateField(""Plan Id"");
      vBulkBC.ActivateField(""Price"");
      vBulkBC.ActivateField(""Status"");
      vBulkBC.ActivateField(""Failure Reason"");
      vBulkBC.ActivateField(""SAN Bill Account Id"");
      vBulkBC.ActivateField(""Service Account Id"");
      //Mayank
      vBulkBC.ActivateField(""STC Last Name"");
      vBulkBC.ActivateField(""STC ID Type"");
      vBulkBC.ActivateField(""STC ID Number"");
      vBulkBC.ActivateField(""STC Gender"");
      vBulkBC.ActivateField(""STC GCC Code"");
      vBulkBC.ActivateField(""STC First Name"");
      vBulkBC.ActivateField(""STC Phone Number"");
      vBulkBC.ActivateField(""STC Birth Date"");//Mayank     
	var vFileName   = Inputs.GetProperty(""FileName"");
	var vFileType     = ToString(Inputs.GetProperty(""FileType""));
	vFileType       = Clib.strlwr(vFileType);	  
	if( vFileType != ""csv"")
	{
	   TheApplication().RaiseErrorText(""Please check the File Type , Is should be :  FileName.CSV"");
	}
	vInputFile     = Clib.fopen(vFileName , ""rt"");       
	vReadFromFile  = Clib.fgets(vInputFile);      
	if((vReadFromFile != null) && (vReadFromFile.length > 1))
	{
	while(!Clib.feof(vInputFile))
	{	
		var MRow = (Clib.fgets(vInputFile));  
		MRow = trim(MRow);
		var len = MRow.length;//840839774,Active
		var CPRNumber = MRow;
	    vBulkDataArray = vReadFromFile.split("","");
	    var vBulkDataArray1 = MRow.split("","");
	    //Mayank
	    sMSISDN = vBulkDataArray[0];//MSISDN
	    sFirstName = vBulkDataArray[1];
	    sLastName = vBulkDataArray[2];
	    sDOB = vBulkDataArray[3];
	    sIdType = vBulkDataArray[4];
	    sIdType = sApp.InvokeMethod(""LookupValue"",""STC_BUS_PREP_ID_TYPE"",sIdType);
	    sIdNumber = vBulkDataArray[5];
	    sGCC = vBulkDataArray[6];
	    sGCC = sApp.InvokeMethod(""LookupValue"",""STC_GCC_COUNTRY_CODE"",sGCC);
	    sGender = vBulkDataArray[7];
	    sGender = sApp.InvokeMethod(""LookupValue"",""SEX_MF"",sGender);
	    sPhone = vBulkDataArray[8];//Mayank
	    //Mayank
	    sMSISDN1 = vBulkDataArray1[0];//MSISDN
	    sFirstName1 = vBulkDataArray1[1];
	    sLastName1 = vBulkDataArray1[2];
	    sDOB1 = vBulkDataArray1[3];
	    sIdType1 = vBulkDataArray1[4];
	    sIdType1 = sApp.InvokeMethod(""LookupValue"",""STC_BUS_PREP_ID_TYPE"",sIdType1);
	    sIdNumber1 = vBulkDataArray1[5];
	    sGCC1 = vBulkDataArray1[6];
	    sGCC1 = sApp.InvokeMethod(""LookupValue"",""STC_GCC_COUNTRY_CODE"",sGCC1);
	    sGender1 = vBulkDataArray1[7];
	    sGender1 = sApp.InvokeMethod(""LookupValue"",""SEX_MF"",sGender1);
	    sPhone1 = vBulkDataArray1[8];//Mayank
	    vBulkBC.InvokeMethod(""SetAdminMode"", ""TRUE""); 
	if(BulkOnce == ""True""){
	if(vReadFromFile != null || vReadFromFile != """" || vReadFromFile != ''){
	    with(vBulkBC)
	    {	    vReadFromFile = trim(vReadFromFile);
	    	serviceAccountId = CheckDuplicate(sMSISDN);//Mayank:Added for Prepaid Feature
	    	var spec1 = """";
	    	ActivateField(""Service Account Id"");
			ClearToQuery();		
			//spec1 = ""[MSISDN]= '"" + vReadFromFile + ""'"";
			spec1 = ""[MSISDN]= '"" + sMSISDN + ""' AND [Service Account Id] = '"" +serviceAccountId+ ""'"";//Mayank
			SetSearchExpr(spec1);
			ExecuteQuery(ForwardOnly);
			var isAccRecord = FirstRecord();
			if(isAccRecord)
			{
				NewRecord(NewAfter);
			    //SetFieldValue(""MSISDN"",vReadFromFile);
			    SetFieldValue(""MSISDN"",sMSISDN);//Mayank
			    SetFieldValue(""Status"" ,""Failed"");
			    SetFieldValue(""Failure Reason"" ,""Duplicate Record"");
			    SetFieldValue(""Parent BAN Id"" ,BillingAccId);
			    SetFieldValue(""Batch Id"" ,BatchId);				    
			    WriteRecord();
			}//if(isAccRecord)
			else
			{  	
				with(AssetMgmtBC)
				{
					ActivateField(""STC Billing Accont Id"");
					ActivateField(""Service Account Id"");
					ActivateField(""Product Name"");
					SetViewMode(AllView);
					ClearToQuery();
					//var spec  = ""[Serial Number] = '"" + vReadFromFile + ""' AND [Status] = 'Active' AND [STC Service Description] = 'BUSPRE'"";
					var spec  = ""[Serial Number] = '"" + sMSISDN + ""' AND [Status] = 'Active' AND [STC Service Description] = 'BUSPRE'"";//Mayank
					SetSearchExpr(spec);
					ExecuteQuery(ForwardOnly);
					var isAssetRecord = FirstRecord();
					if(isAssetRecord)
					{	planName = GetFieldValue(""Product Id"");
						Price = GetLOVDesc(PRICELOV,planName);
					//	Price = sApp.InvokeMethod(""LookupValue"",""STC_BB_PRPID_PLAN_PRICE"",planName);
						ProdName = GetFieldValue(""Product Name"");
						ServAccId = GetFieldValue(""Service Account Id"");
						BillAccId = GetFieldValue(""STC Billing Accont Id"");
					}
					
				}
				if(planName == """" || planName == '' || planName == null)
				{
				NewRecord(NewAfter);
			    //SetFieldValue(""MSISDN"",vReadFromFile);
			    SetFieldValue(""MSISDN"",sMSISDN);//Mayank
			    SetFieldValue(""Status"" ,""Failed"");
			    SetFieldValue(""Failure Reason"" ,""Plan Not Eligible for Business Prepaid Registration"");
			    SetFieldValue(""Parent BAN Id"" ,BillingAccId);
			    SetFieldValue(""Batch Id"" ,BatchId);				    
			    WriteRecord();
				}
				else
				{
					NewRecord(NewAfter);
     //SetFieldValue(""MSISDN"",vReadFromFile);
					SetFieldValue(""MSISDN"",sMSISDN);//Mayank
     SetFieldValue(""Plan Id"",planName);
     SetFieldValue(""STC Plan Name"",ProdName);
     SetFieldValue(""Price"",Price);
     SetFieldValue(""Status"" ,""Imported"");
     SetFieldValue(""Parent BAN Id"" ,BillingAccId);
     SetFieldValue(""Batch Id"" ,BatchId);
     SetFieldValue(""Service Account Id"", ServAccId);
     SetFieldValue(""SAN Bill Account Id"", BillAccId);
	//Mayank
		if(sLastName == null || sLastName == """" || sLastName == ""undefined"")
	{
	}
	else
	{
	SetFieldValue(""STC Last Name"", sLastName);
	}
	if(sIdNumber == null || sIdNumber == """" || sIdNumber == ""undefined"")
	{
	}
	else
	{
	SetFieldValue(""STC ID Number"", sIdNumber);
	}
	if(sFirstName == null || sFirstName == """" || sFirstName == ""undefined"")
	{
	}
	else
	{
	SetFieldValue(""STC First Name"", sFirstName);
	}
		if(sDOB == null || sDOB == """" || sDOB == ""undefined"")
		{
		}
		else
		{
		SetFieldValue(""STC Birth Date"", sDOB);
		}
		if(sPhone == null || sPhone == """" || sPhone == ""undefined"")
		{
		}
		else
		{
		SetFieldValue(""STC Phone Number"",sPhone);
		}
		if(sGender == null || sGender == """" || sGender == ""undefined"")
		{
		}
		else
		{
		SetFieldValue(""STC Gender"", sGender);
		}
		if(sGCC == null || sGCC == """" || sGCC == ""undefined"")
		{
		}
		else
		{
		SetFieldValue(""STC GCC Code"", sGCC);
		}
		if(sIdType == null || sIdType == """" || sIdType == ""undefined"")
		{
		}
		else
		{
		SetFieldValue(""STC ID Type"", sIdType);
		}//Mayank		
		WriteRecord();
				}	
			}//	else
			BulkOnce = ""False"";	
			planName = """";
			Price = """";	
		}//with(vBulkBC)
		}//end of if
	}// end of if(BulkOnce == ""True"")
	if(CPRNumber != null && CPRNumber != """" && CPRNumber != ''){
	    with(vBulkBC)
	    {	    
	    	serviceAccountId = CheckDuplicate(sMSISDN1);//Mayank:Added for Prepaid Feature
	    	var spec1 = """";
	    	ActivateField(""Service Account Id"");
			ClearToQuery();		
			//spec1 = ""[MSISDN]= '"" + CPRNumber + ""'"";
			spec1 = ""[MSISDN]= '"" + sMSISDN1 + ""' AND [Service Account Id] = '"" +serviceAccountId+ ""'"";//Mayank:Added for Prepaid Feature
			SetSearchExpr(spec1);
			ExecuteQuery(ForwardOnly);
			var isAccRecord = FirstRecord();
			if(isAccRecord)
			{
				NewRecord(NewAfter);
			    //SetFieldValue(""MSISDN"",CPRNumber);
			    SetFieldValue(""MSISDN"",sMSISDN1);
			    SetFieldValue(""Status"" ,""Failed"");
			    SetFieldValue(""Failure Reason"" ,""Duplicate Record"");
			    SetFieldValue(""Parent BAN Id"" ,BillingAccId);
			    SetFieldValue(""Batch Id"" ,BatchId);				    
			    WriteRecord();
			}//if(isAccRecord)
			else
			{  	
				with(AssetMgmtBC)
				{
					ActivateField(""Product Name"");
					SetViewMode(AllView);
					ClearToQuery();
					//var spec  = ""[Serial Number] = '"" + CPRNumber + ""' AND [Status] = 'Active' AND [STC Service Description] = 'BUSPRE'"";
					var spec  = ""[Serial Number] = '"" + sMSISDN1 + ""' AND [Status] = 'Active' AND [STC Service Description] = 'BUSPRE'"";//Mayank
					SetSearchExpr(spec);
					ExecuteQuery(ForwardOnly);
					var isAssetRecord = FirstRecord();
					if(isAssetRecord)
					{	planName = GetFieldValue(""Product Id"");
						Price = GetLOVDesc(PRICELOV,planName);
					//	Price = sApp.InvokeMethod(""LookupValue"",""STC_BB_PRPID_PLAN_PRICE"",planName);
						ProdName = GetFieldValue(""Product Name"");
						ServAccId = GetFieldValue(""Service Account Id"");
						BillAccId = GetFieldValue(""STC Billing Accont Id"");
					}
					
				}
				if(planName == """" || planName == '' || planName == null)
				{
				NewRecord(NewAfter);
			    //SetFieldValue(""MSISDN"",CPRNumber);
			    SetFieldValue(""MSISDN"",sMSISDN1);
			    SetFieldValue(""Status"" ,""Failed"");
			    SetFieldValue(""Failure Reason"" ,""Plan Not Eligible for Business Prepaid Registration"");
			    SetFieldValue(""Parent BAN Id"" ,BillingAccId);
			    SetFieldValue(""Batch Id"" ,BatchId);				    
			    WriteRecord();
				}
				else
				{
					NewRecord(NewAfter);
					//SetFieldValue(""MSISDN"",CPRNumber);
					SetFieldValue(""MSISDN"",sMSISDN1);
					SetFieldValue(""Plan Id"",planName);
					SetFieldValue(""STC Plan Name"",ProdName);
					SetFieldValue(""Price"",Price);
					SetFieldValue(""Status"" ,""Imported"");
					SetFieldValue(""Parent BAN Id"" ,BillingAccId);
					SetFieldValue(""Batch Id"" ,BatchId);	
					SetFieldValue(""Service Account Id"", ServAccId);
					SetFieldValue(""SAN Bill Account Id"", BillAccId);
					//Mayank
					if(sLastName1 == null || sLastName1 == """" || sLastName1 == ""undefined"")
					{
					}
					else
					{
					SetFieldValue(""STC Last Name"", sLastName1);
					}
					if(sIdNumber1 == null || sIdNumber1 == """" || sIdNumber1 == ""undefined"")
					{
					}
					else
					{
					SetFieldValue(""STC ID Number"", sIdNumber1);
					}
					if(sFirstName1 == null || sFirstName1 == """" || sFirstName1 == ""undefined"")
					{
					}
					else
					{
					SetFieldValue(""STC First Name"", sFirstName1);
					}
					if(sDOB1 == null || sDOB1 == """" || sDOB1 == ""undefined"")
					{
					}
					else
					{
					SetFieldValue(""STC Birth Date"", sDOB1);
					}
					if(sPhone1 == null || sPhone1 == """" || sPhone1 == ""undefined"")
					{
					}
					else
					{
					SetFieldValue(""STC Phone Number"",sPhone1);
					}
					if(sGender1 == null || sGender1 == """")
					{
					}
					else
					{
					SetFieldValue(""STC Gender"", sGender1);
					}
					if(sGCC1 == null || sGCC1 == """")
					{
					}
					else
					{
					SetFieldValue(""STC GCC Code"", sGCC1);
					}
					if(sIdType1 == null || sIdType1 == """")
					{
					}
					else
					{
					SetFieldValue(""STC ID Type"", sIdType1);
					}//Mayank 		
					WriteRecord();
				}	
			}//	else		
			planName = """";
			Price = """";	
		}//with(vBulkBC)
		}// end of if
		}//	 	while(!Clib.feof(vInputFile))          
	//	 vReadFromFile = Clib.fgets(vInputFile);
      }//End While
      ImportFlg=TheApplication().SetProfileAttr(""ImportFlg"","""");
      //Mayank
      var svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
	  var psIn1 = TheApplication().NewPropertySet();
	  var psOut1 = TheApplication().NewPropertySet();
	  psIn1.SetProperty(""Refresh All"",""Y"");
	  svcUI.InvokeMethod(""RefreshCurrentApplet"",psIn1,psOut1);	//Mayank
   }//try
   
   catch(e)
   { 
      vErrorMessage = e.toString();
      vErrorCode    = e.errCode;      
   }
   finally
   {
   	vBulkBC = null;
   	vBulkBC = null;
   }
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{

    if( MethodName == ""Import"")
    {
      Import_Bulk_File( Inputs, Outputs );
      return(CancelOperation);
    }
 return (ContinueOperation);
}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}
function CheckExpiryDate(Inputs,Outputs)
{
var App = TheApplication();
var AssetBC = App.GetBusObject(""STC Asset Mgmt - Asset Thin BO"").GetBusComp(""STC Asset Mgmt - Asset Thin"");
//var RoamAssetBC = App.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset"");
var spec  = ""([Status] = 'Active' OR [Status] = 'Suspended') AND [Effective End Date] IS NOT NULL"";
	with(AssetBC)
	{
		ActivateField(""Effective End Date"");
		ActivateField(""Serial Number"");
		ActivateField(""Status"");
		ActivateField(""Product Part Number"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchExpr(spec);
		ExecuteQuery(ForwardOnly);
		var AssRec = FirstRecord();
		while(AssRec)
		{
			var enddate = GetFieldValue(""Effective End Date"");
			var MSISDN = GetFieldValue(""Serial Number"");
			var StrPartNum = GetFieldValue(""Product Part Number"");
			var StrPartNumLOV = App.InvokeMethod(""LookupValue"",""STC_INAC_ASSET"",StrPartNum);
			var foundLOV = StrPartNumLOV.substring(0,5);
			if(foundLOV == ""INACT"")
			{
			if(enddate != '' || enddate != null || enddate != """")
			{
				var IntDatesys = new Date(enddate);
				var sysintdate = IntDatesys.toSystem();
				var CurrDate = new Date();
				var CurrDateSys = new Date(CurrDate);
				var sysdateCurrDate = CurrDateSys.toSystem();
				var daydiff = (sysintdate - sysdateCurrDate);
				var Finaldays = Math.round((daydiff/(60*60*24)));
					if(Finaldays < 0)
					{
						SetFieldValue(""Status"", ""Inactive"");
						WriteRecord();
					}
				}
				}// end of if(foundLOV)
			AssRec = NextRecord();
		}
	}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
 try
 {
    switch(MethodName)
     {
   
     
      case ""CheckExpiryDate"":
     CheckExpiryDate(Inputs, Outputs);
     return(CancelOperation);
     break;
    
    
      default:
          return (ContinueOperation);
       }
 }
 catch (exc)
 {
 throw(exc.toString());
 }
  finally 
 {
 }  
}
function CheckExpiryDate(Inputs,Outputs)
{
var App = TheApplication();
var AssetBC = App.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset"");
var RoamAssetBC = App.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset"");
var spec  = ""[Status] <> 'Inactive' AND [Effective End Date] IS NOT NULL"";
	with(AssetBC)
	{
		ActivateField(""Effective End Date"");
		ActivateField(""Serial Number"");
		ActivateField(""Product Part Number"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchExpr(spec);
		ExecuteQuery(ForwardOnly);
		var AssRec = FirstRecord();
		while(AssRec)
		{
			var enddate = GetFieldValue(""Effective End Date"");
			var MSISDN = GetFieldValue(""Serial Number"");
			var StrPartNum = GetFieldValue(""Product Part Number"");
			var StrPartNumLOV = App.InvokeMethod(""LookupValue"",""STC_INAC_ASSET"",StrPartNum);
			var foundLOV = StrPartNumLOV.substring(0,5);
			if(foundLOV == ""INACT"")
			{
			if(enddate != '' || enddate != null || enddate != """")
			{
				var IntDatesys = new Date(enddate);
				var sysintdate = IntDatesys.toSystem();
				var CurrDate = new Date();
				var CurrDateSys = new Date(CurrDate);
				var sysdateCurrDate = CurrDateSys.toSystem();
				var daydiff = (sysintdate - sysdateCurrDate);
				var Finaldays = Math.round((daydiff/(60*60*24)));
					if(Finaldays < 0)
					{
						SetFieldValue(""Status"", ""Inactive"");
						WriteRecord();
					}
				}
				}// end of if(foundLOV)
			AssRec = NextRecord();
		}
	}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
 try
 {
    switch(MethodName)
     {
   
     
      case ""CheckExpiryDate"":
     CheckExpiryDate(Inputs, Outputs);
     return(CancelOperation);
     break;
    
    
      default:
          return (ContinueOperation);
       }
 }
 catch (exc)
 {
 throw(exc.toString());
 }
  finally 
 {
 }  
}
function AddNewAddRec(Vtel,ProdId,OrderId,rootLineId,BillAccId,VmmsParentProdId)
{
var StrOrdLine = TheApplication().GetBusObject(""Order Entry (Sales)"").GetBusComp(""Order Entry - Line Items (Simple)"");
var psPorts    = TheApplication().NewPropertySet();
//var psRootPort    = TheApplication().NewPropertySet();
with(StrOrdLine)
{
   ActivateField(""Status"");
   ActivateField(""Cfg State Code"");
  psPorts = RCOIS_GetAllPorts(VmmsParentProdId);
  
  var sToPortItemId = GetPortProperty(psPorts,""Port Item Id"",""Product Id"",ProdId);
   NewRecord(NewAfter);
   SetFieldValue(""Order Header Id"",OrderId);
   SetFieldValue(""Product Id"", ProdId);   
   SetFieldValue(""Parent Order Item Id"",Vtel); 
   SetFieldValue(""Root Order Item Id"",rootLineId);
   SetFieldValue(""Billing Account Id"",BillAccId);
   SetFieldValue(""Product Port Id"",sToPortItemId);
   SetFieldValue(""Status"",""In Progress"");
   SetFieldValue(""Cfg State Code"",""User Requested Item"");
   WriteRecord();
}
}
function FnAddLineItems(Inputs, Outputs)
{
var OrderId = Inputs.GetProperty(""ObjectId"");
var Product = Inputs.GetProperty(""Product"");
var AppObj = TheApplication();
var IsOrdLineRec;
var IsOrderLineDel;
var OrderType;
var AddRootId;
var ActionCode;
var Vgprs;
var Vtel;
var Vsms;
var Vmms;
var ParentProdId;
var VgprsParentProdId = """";
var VsmsParentProdId = """";
var VtelParentProdId = """";
var VmmsParentProdId = """";
var BillAccId;
var OrderBO = AppObj.GetBusObject(""Order Entry (Sales)"");
var OrderEntry:BusComp = OrderBO.GetBusComp(""Order Entry - Orders"");
var OrderLineItem:BusComp =OrderBO.GetBusComp(""Order Entry - Line Items (Simple)"");
var OrdType = AppObj.InvokeMethod(""LookupValue"",""STC_ORDER_SUB_TYPE"",""Modify"");
var LOVBC:BusComp = AppObj.GetBusObject(""List Of Values"").GetBusComp(""List Of Values"");
var ProdBC = AppObj.GetBusObject(""Admin ISS Product Definition"").GetBusComp(""Internal Product - ISS Admin"");
with(OrderEntry)
{
            ActivateField(""STC Order SubType"");
            ClearToQuery();
            SetViewMode(AllView);
            SetSearchSpec(""Id"",OrderId);
            ExecuteQuery();
            var IsOrdRec= FirstRecord();
            if(IsOrdRec)
            {
                        OrderType = GetFieldValue(""STC Order SubType"");
                        if(OrderType == OrdType)
                        {
                                    with(OrderLineItem)
                                    {
                                                var StrSearch = ""[Order Header Id] = '"" + OrderId + ""' AND ([Part Number] = '"" + Product + ""')"";
                                                
                                                ActivateField(""Billing Service Type"");
                                                ActivateField(""Action Code"");
                                                ActivateField(""Product Id"");
                                                ActivateField(""Product Type"");
                                                ActivateField(""Billing Account Id"");
                                              //  ActivateField(""Billing Account"");
                                                ClearToQuery();
                                                SetViewMode(AllView);
                                                SetSearchExpr(StrSearch);
                                    //          SetSearchSpec(""Order Header Id"",OrderId);
                                                ExecuteQuery();
                                                IsOrdLineRec= FirstRecord();
                                                if(!IsOrdLineRec)
                                                {
													with(LOVBC)
													{
													var LovSpec = ""[Value] = '""+ Product +""' AND [Type] = 'STC_SMSUSSDERROR'"";
													SetViewMode(AllView);
													ActivateField(""High"");
													ActivateField(""Description"");
													ActivateField(""Low"");
													ClearToQuery();
													SetSearchExpr(LovSpec);
													ExecuteQuery(ForwardOnly);
													var islovRec = FirstRecord();
                                                           
                                                            if(islovRec)
                                                            {
                                                           var disc1 = GetFieldValue(""High"");
                                                           var disc2 = GetFieldValue(""Description"");
                                                           var disc3 = GetFieldValue(""Low"");
                                                           with(OrderLineItem)
                                                           {
                                                            var StrSearch = ""[Order Header Id] = '"" + OrderId + ""' AND ([Product Type] = 'Compound')"";
                                                            ClearToQuery();
                                                            SetViewMode(AllView);
                                                            SetSearchExpr(StrSearch);
                                                            ExecuteQuery();
                                                            var OrdLineRec = FirstRecord();
                                                            while(OrdLineRec)
                                                            {
                                                             var AddBillType = GetFieldValue(""Billing Service Type"");
																	var rootLineId = GetFieldValue(""Root Order Item Id"");
																	switch (AddBillType)
																	{
																	case ""/service/telco/gprs"":
																	Vgprs = GetFieldValue(""Id"");
																	VgprsParentProdId = GetFieldValue(""Product Id"");
																	BillAccId = GetFieldValue(""Billing Account Id"");
																	break;
																	
																	case ""/service/telco/gsm/sms"":
																	Vsms = GetFieldValue(""Id"");
																	VsmsParentProdId = GetFieldValue(""Product Id"");
																	BillAccId = GetFieldValue(""Billing Account Id"");
																	break;
																	
																	case ""/service/telco/gsm/telephony"":
																	Vtel = GetFieldValue(""Id"");
																	VtelParentProdId = GetFieldValue(""Product Id"");
																	BillAccId = GetFieldValue(""Billing Account Id"");
																	break;
																	
																	case ""/service/telco/gsm/mms"":
																	Vmms = GetFieldValue(""Id"");
																	VmmsParentProdId = GetFieldValue(""Product Id"");
																	BillAccId = GetFieldValue(""Billing Account Id"");
																	break;
																	
																	default:
																	
																	}
                                                            
                                                              OrdLineRec = NextRecord();
                                                            }// while(OrdLineRec)
                                                           }
                                                           with(ProdBC)
                                                           {
                                                           var StrProdSearch = ""[Part #] = '"" + Product + ""'"";
                                                           if(disc1 != '' || disc1 != null)
                                                           {
                                                           	StrProdSearch+= ""OR [Part #] = '"" + disc1 + ""'"";
                                                           }
                                                           else if(!disc2)
                                                           {
                                                           	StrProdSearch+= ""OR [Part #] = '"" + disc2 + ""'"";
                                                           }
                                                           else if(!disc3)
                                                           {
                                                           	StrProdSearch+= ""OR [Part #] = '"" + disc3 + ""'"";
                                                           }
                                                            ActivateField(""Billing Service Type"");
                                                            ClearToQuery();
                                                            SetViewMode(AllView);
                                                            SetSearchExpr(StrProdSearch);
                                                            ExecuteQuery();
                                                            var IsProduct= FirstRecord();
                                                           while(IsProduct)
                                                            {
                                                             var ProdId = GetFieldValue(""Id"");
                                                             var BillSerType = GetFieldValue(""Billing Service Type"");
                                                             
                                                             
                                                             if(BillSerType == ""/service/telco/gsm/mms"")
                                                             {
                                                             with(OrderLineItem)
                                                             {
																var StrSearch = ""[Order Header Id] = '"" + OrderId + ""' AND ([Product Id] = '"" + ProdId + ""')"";
																ClearToQuery();
																SetViewMode(AllView);
																SetSearchExpr(StrSearch);
																ExecuteQuery();
																var OrdLineRec = FirstRecord();
																if(!OrdLineRec){
                                                              AddNewAddRec(Vmms,ProdId,OrderId,rootLineId,BillAccId,VmmsParentProdId);}
                                                             }
                                                             }
                                                             else if(BillSerType == ""/service/telco/gsm/sms"")
                                                             {
                                                               with(OrderLineItem)
                                                             {
																var StrSearch = ""[Order Header Id] = '"" + OrderId + ""' AND ([Product Id] = '"" + ProdId + ""')"";
																ClearToQuery();
																SetViewMode(AllView);
																SetSearchExpr(StrSearch);
																ExecuteQuery();
																var OrdLineRec = FirstRecord();
																if(!OrdLineRec){
                                                              AddNewAddRec(Vsms,ProdId,OrderId,rootLineId,BillAccId,VsmsParentProdId);}}
                                                             }
                                                             else if(BillSerType == ""/service/telco/gsm/telephony"")
                                                             {
                                                                with(OrderLineItem)
                                                             {
																var StrSearch = ""[Order Header Id] = '"" + OrderId + ""' AND ([Product Id] = '"" + ProdId + ""')"";
																ClearToQuery();
																SetViewMode(AllView);
																SetSearchExpr(StrSearch);
																ExecuteQuery();
																var OrdLineRec = FirstRecord();
																if(!OrdLineRec){
                                                              AddNewAddRec(Vtel,ProdId,OrderId,rootLineId,BillAccId,VtelParentProdId);}}
                                                             }
                                                             else if(BillSerType == ""/service/telco/gprs"")
                                                             {
                                                                with(OrderLineItem)
                                                             {
																var StrSearch = ""[Order Header Id] = '"" + OrderId + ""' AND ([Product Id] = '"" + ProdId + ""')"";
																ClearToQuery();
																SetViewMode(AllView);
																SetSearchExpr(StrSearch);
																ExecuteQuery();
																var OrdLineRec = FirstRecord();
																if(!OrdLineRec){
                                                              AddNewAddRec(Vgprs,ProdId,OrderId,rootLineId,BillAccId,VgprsParentProdId);}}
                                                             }
                                                             IsProduct = NextRecord();
                                                         }
                                                        }//with(ProdBC)
                                                            }// end of with(LOVBC)
                                                            }
                                                //          TheApplication().RaiseErrorText(recCount);
                                                }//         if(IsOrdLineRec)
                                    }//         with(OrderLineItem)
                        }//         if(OrderType == OrdType)
            }//         if(IsOrdRec)
}//with(OrderEntry)
return(CancelOperation);
}
function GetPortProperty(psInput,aPropName,aSearchField,aSearchValue)
{
 /** Entry point to this function is normal Product Id. **/
 /*
  Port
   Class Id, Class Name, DefCardinality, DefaultPortObject, MaxCardinality, MinCardinality,Name, 
   Port Display Name, Port Item Id
   
   PortObject
    Description, Name, Prod Item Id, Product Id, Version
 
 */
 
 var psPort   = TheApplication().NewPropertySet();
 var psPortObj = TheApplication().NewPropertySet();
 var iGotValue = "false"";

 try {
  for (var l=0;l<psInput.GetChildCount();l++) {
   psPort = psInput.GetChild(l);
   
   for (var i=0;i<psPort.GetChildCount();i++) {
    psPortObj = psPort.GetChild(i);
    if (psPortObj.GetProperty(aSearchField) == aSearchValue) {
     //return(psPortObj.GetProperty(aPropName));
     iGotValue = ""true"";
     break;
    }
   }
   if(""true"" == iGotValue) {
    switch(aPropName) {
     case ""Description"":
     case ""Name"":
     case ""Prod Item Id"":
     case ""Product Id"":
     case ""Version"":
      return(psPortObj.GetProperty(aPropName));
     default:
      return(psPort.GetProperty(aPropName));
     
    }
   }
  }
 } finally {
  psPort   = null;
  psPortObj = null;
 }
 return('');
}
function RCOIS_GetAllPorts(aProductId)
{
 /** Get All the Ports for a Product - 2IT-V1.0 **/

 var psInputs = null;
 var psOutputs  = null;


     var bsRCOIS  = TheApplication().GetService(""Remote Complex Object Instance Service"");
  psInputs = TheApplication().NewPropertySet();
  psOutputs  = TheApplication().NewPropertySet();

  psInputs.SetProperty(""Product Id"",aProductId);
  psInputs.SetProperty(""GetPortDomain"", ""Y"");

  bsRCOIS.InvokeMethod(""GetAllPorts"",psInputs,psOutputs);
  return(psOutputs.Copy());

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
  var iReturn;
 
 try  
 {
  iReturn = ContinueOperation;
  switch (MethodName)
  {
   case ""FnAddLineItems"":
     FnAddLineItems(Inputs, Outputs);
    iReturn = CancelOperation;
    break;
                    
   default: 
    iReturn = ContinueOperation;
    
  } //switch
  return (iReturn);
 } 
 catch (e)
 { 
  TheApplication().RaiseErrorText(e.toString());
 }

}
function CheckVIP(parentAccId)
{
var AcccBC = TheApplication().GetBusObject(""STC Account Thin BO"").GetBusComp(""STC Account Thin"");
var VIPCAT;	
	with(AcccBC)
	{
	ActivateField(""STC Contract Category"");
	ActivateField(""STC VIP Category"");
	SetViewMode(AllView);
	ClearToQuery();
	SetSearchSpec(""Id"", parentAccId);
	ExecuteQuery(ForwardOnly);
	var AccRec = FirstRecord();	
		if(AccRec)
		{
			var VIPCat = GetFieldValue(""STC VIP Category"");
			
			if(VIPCat != """" && VIPCat != null && VIPCat != '')
			{
				VIPCAT = ""VIP"";
			}
			else
			{
				var CustSegment = GetFieldValue(""STC Contract Category"");
				if(CustSegment == ""A"" || CustSegment == ""B"" || CustSegment == ""C"" || CustSegment == ""D"")
				{
					VIPCAT = ""VIP"";
				}
				else
				{
					VIPCAT = ""COMMON"";
				}
			}
		}
	}
return(VIPCAT);
}
function GetMSISDNDetails(Inputs, Outputs)
{
var MSISDN = Inputs.GetProperty(""MSISDN"");
Outputs.SetProperty(""VIP"","""");
Outputs.SetProperty(""Name"","""");
Outputs.SetProperty(""CustomerType"","""");
Outputs.SetProperty(""IDType"","""");
Outputs.SetProperty(""IDNumber"","""");
Outputs.SetProperty(""AccountStatus"","""");
Outputs.SetProperty(""ServiceType"","""");
Outputs.SetProperty(""Type"","""");
Outputs.SetProperty(""SANRec"",""No"");
				
var CUTSerBC = TheApplication().GetBusObject(""STC Thin Service Account BO"").GetBusComp(""STC Thin CUT Service Sub Accounts"");
try
{
with(CUTSerBC)
{
	ActivateField(""Master Account Id"");
	ActivateField(""STC Customer Plan"");
	ActivateField(""Name"");
	ActivateField(""STC Pricing Plan Type"");
	ActivateField(""STC ID #"");
	ActivateField(""STC ID Type"");
	ActivateField(""Type"");
	ActivateField(""Account Status"");
	SetViewMode(AllView);
	ClearToQuery();
	SetSearchSpec(""DUNS Number"", MSISDN);
	SetSortSpec(""STC Activation Date(ASCENDING)"");
	ExecuteQuery(ForwardOnly);
	var MSISDNRec = FirstRecord();
		if(MSISDNRec)
		{
				parentAccId = GetFieldValue(""Master Account Id"");
				VIPCus = CheckVIP(parentAccId);
				Outputs.SetProperty(""VIP"",VIPCus);
				Outputs.SetProperty(""Name"",GetFieldValue(""Name""));
				Outputs.SetProperty(""CustomerType"",GetFieldValue(""STC Customer Plan""));
				Outputs.SetProperty(""IDType"",GetFieldValue(""STC ID Type""));
				Outputs.SetProperty(""IDNumber"",GetFieldValue(""STC ID #""));
				Outputs.SetProperty(""AccountStatus"",GetFieldValue(""Account Status""));
				Outputs.SetProperty(""ServiceType"",GetFieldValue(""STC Pricing Plan Type""));
				Outputs.SetProperty(""Type"",GetFieldValue(""Type""));
				Outputs.SetProperty(""SANRec"",""YES"");
		}
		else
		{
			Outputs.SetProperty(""SANRec"",""No"");
		}
	}
	}
	catch (e)
	{	
	Outputs.SetProperty(""SANRec"",""No"");
	}
	finally
	{
		CUTSerBC = null;
	}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	
	 switch(MethodName)
     {
		case ""GetMSISDNDetails"":
		GetMSISDNDetails(Inputs, Outputs);
		return(CancelOperation);
		break;
		
		case ""UpdateSRDetails"":
		UpdateSRDetails(Inputs, Outputs);
		return(CancelOperation);
		break;
		
		
		
	   default:
          return (ContinueOperation);
       }

}
function UpdateSRDetails(Inputs, Outputs)
{
var SRId = Inputs.GetProperty(""SRId"");
var ExistingCustomer = Inputs.GetProperty(""ExistingCustomer"");
var ServiceRequestBC = TheApplication().GetBusObject(""STC Service Request BO"").GetBusComp(""STC Service Request thin"");

with(ServiceRequestBC)
{
		ActivateField(""STC Existing Customer Id"");
		ActivateField(""STC Existing Customer"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"", SRId);
		ExecuteQuery(ForwardOnly);
		var SRRec = FirstRecord();
		if(SRRec)
		{
			var PickBC = GetPicklistBusComp(""STC Existing Customer"");
			
			
			with (PickBC) 
			{
			ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Id"", ExistingCustomer);
			ExecuteQuery(ForwardOnly);
			if(FirstRecord()) 
			{
				Pick();
			}
			
			}
			WriteRecord();
		}
}



}
function CheckVIP(parentAccId)
{
var AcccBC = TheApplication().GetBusObject(""STC Account Thin BO"").GetBusComp(""STC Account Thin"");
var VIPCAT; 
 with(AcccBC)
 {
 ActivateField(""STC Contract Category"");
 ActivateField(""STC VIP Category"");
 SetViewMode(AllView);
 ClearToQuery();
 SetSearchSpec(""Id"", parentAccId);
 ExecuteQuery(ForwardOnly);
 var AccRec = FirstRecord(); 
  if(AccRec)
  {
   var VIPCat = GetFieldValue(""STC VIP Category"");
   
   if(VIPCat != """" && VIPCat != null && VIPCat != '')
   {
    VIPCAT = ""VIP"";
   }
   else
   {
    var CustSegment = GetFieldValue(""STC Contract Category"");
    if(CustSegment == ""A"" || CustSegment == ""B"" || CustSegment == ""C"" || CustSegment == ""D"")
    {
     VIPCAT = ""VIP"";
    }
    else
    {
     VIPCAT = ""COMMON"";
    }
   }
  }
 }
return(VIPCAT);
}
function GetMSISDNDetails(Inputs, Outputs)
{
var MSISDN = Inputs.GetProperty(""MSISDN"");
Outputs.SetProperty(""VIP"","""");
Outputs.SetProperty(""Name"","""");
Outputs.SetProperty(""CustomerType"","""");
Outputs.SetProperty(""IDType"","""");
Outputs.SetProperty(""IDNumber"","""");
Outputs.SetProperty(""AccountStatus"","""");
Outputs.SetProperty(""ServiceType"","""");
Outputs.SetProperty(""Type"","""");
Outputs.SetProperty(""SANRec"",""No"");
   
var CUTSerBC = TheApplication().GetBusObject(""STC Thin Service Account BO"").GetBusComp(""STC Thin CUT Service Sub Accounts"");

with(CUTSerBC)
{
 ActivateField(""Master Account Id"");
 ActivateField(""STC Customer Plan"");
 ActivateField(""Name"");
 ActivateField(""STC Pricing Plan Type"");
 ActivateField(""STC ID #"");
 ActivateField(""STC ID Type"");
 ActivateField(""Type"");
 ActivateField(""Account Status"");
 SetViewMode(AllView);
 ClearToQuery();
//SetSearchExpr(""[DUNS Number] = '"" + MSISDN + ""' AND [STC Activation Date] IS NOT NULL""); --- Mayank: Inactivated For PBI000000001158
SetSearchExpr(""[DUNS Number] = '"" + MSISDN + ""' AND [Account Status] <> 'New'""); //--- Mayank: Modified For PBI000000001158
 //SetSearchSpec(""DUNS Number"", MSISDN);
 //SetSortSpec(""STC Activation Date(DESCENDING)"");--- Mayank: Inactivated For PBI000000001158
 SetSortSpec(""Created(DESCENDING)"");
 ExecuteQuery(ForwardOnly);
 var MSISDNRec = FirstRecord();

  if(MSISDNRec)
  {
    var parentAccId = GetFieldValue(""Master Account Id"");
    var VIPCus = CheckVIP(parentAccId);
    var Id = GetFieldValue(""Id"");
    Outputs.SetProperty(""VIP"",VIPCus);
    Outputs.SetProperty(""Name"",GetFieldValue(""Name""));
    Outputs.SetProperty(""CustomerType"",GetFieldValue(""STC Customer Plan""));
    Outputs.SetProperty(""IDType"",GetFieldValue(""STC ID Type""));
    Outputs.SetProperty(""IDNumber"",GetFieldValue(""STC ID #""));
    Outputs.SetProperty(""AccountStatus"",GetFieldValue(""Account Status""));
    Outputs.SetProperty(""ServiceType"",GetFieldValue(""STC Pricing Plan Type""));
    Outputs.SetProperty(""Type"",GetFieldValue(""Type""));
    Outputs.SetProperty(""SANRec"",""YES"");
  }
  else
  {
   Outputs.SetProperty(""SANRec"",""No"");
  }
 }
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
  switch(MethodName)
     {
  case ""GetMSISDNDetails"":
  GetMSISDNDetails(Inputs, Outputs);
  return(CancelOperation);
  break;
  
    default:
          return (ContinueOperation);
       }

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 switch(MethodName)
     {
    case ""UpdateRecord"":
     UpdateRecord(Inputs, Outputs);
     return(CancelOperation);
     break;
     
     default:
          return (ContinueOperation);
       }


 return (ContinueOperation);
}
function UpdateRecord(Inputs, Outputs)
{
  try
    {
    var vMSISDN = Inputs.GetProperty(""MSISDN"");
        var vPortId = Inputs.GetProperty(""PortId"");
     var vMsgId = Inputs.GetProperty(""MsgTypeId"");
     var vErrorMsg = Inputs.GetProperty(""ErrorMessage"");
     var vErrorCode = Inputs.GetProperty(""ErrorCode"");
  
     var vSTCBO = TheApplication().GetBusObject(""STC Service Account"");
      var vMNPBC = vSTCBO.GetBusComp(""STC MNP Port Details BC"");
  
          with(vMNPBC)
         {
            SetViewMode(AllView);
            ActivateField(""Msisdn"");
             ActivateField(""Port Id"");
             ActivateField(""Msg Type"");
             ActivateField(""Error Code"");
             ActivateField(""Error Text"");
             ActivateField(""Error Cause Msg"");
             ClearToQuery();
             var sExp = ""[Msisdn] = '"" + vMSISDN+ ""' AND [Port Id] = '"" + vPortId + ""'"";
             SetSearchExpr(sExp);
             SetSortSpec(""Created(DESCENDING)"");
             ExecuteQuery(ForwardOnly);
             if(FirstRecord())
               {
               SetFieldValue(""Error Text"",vErrorMsg);
               SetFieldValue(""Error Cause Msg"",vErrorMsg);
               SetFieldValue(""Error Code"",vErrorCode);
               SetFieldValue(""Msg Type"",vMsgId);
               WriteRecord();
              }
             }
             

   }
     
  catch(e)
 {
    Outputs.SetProperty(""ErrorMessage"", e.errText);
  Outputs.SetProperty(""ErrorCode"", '999');
   
 }
 
 finally
 {
  vMNPBC = null;
  vSTCBO = null;
 }
 
 }
function CreateSoapInput(Inputs, Outputs)
{

 try
 { 
   var vAppObj = TheApplication();
   var psInputs = vAppObj.NewPropertySet();
   var psListOf = vAppObj.NewPropertySet();
   var psParam = vAppObj.NewPropertySet(); 
   psInputs.SetType(""SoapInput"");
   psInputs.SetProperty(""Message Id"", """");
   psInputs.SetProperty(""Message Type"", ""Integration Object"");
   psInputs.SetProperty(""IntObjectName"", ""SoapInput"");
   psInputs.SetProperty(""IntObjectFormat"", ""Siebel Hierarchical"");
   psListOf.SetType(""ListOfSoapInput"");
   psParam.SetType(""SoapInput"");   
   psListOf.AddChild(psParam);
   psInputs.AddChild(psListOf);
   Outputs.AddChild(psInputs);
   return (CancelOperation); 
	  }
  catch (exception)
 {
 	throw(exception.toString());
 }
 finally
 {
    psParam = null;
    psListOf = null;
    psInputs = null;
    vAppObj = null;
 }
  
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 try
 {
    switch(MethodName)
     {
	   case ""CreateSoapInput"":
	    CreateSoapInput(Inputs, Outputs);
	    return(CancelOperation);
	    break;
	    default:
          return (ContinueOperation);
       }
 }
 catch (exc)
 {
 throw(exc.toString());
 }
  finally 
 {
 }  
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""Resubmit"")
	{
		Resubmit();
		return(CancelOperation);    
	}
	else
    {    
		return(ContinueOperation);
    }
}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}





function Resubmit()
{
	var MRow="""";
	var MRowId="""";
	var Product="""";
	var Action="""";

	/*	WIPRO-Upgrade-03.05.2016-TSINGHALC - Gets the Filename along with Filepath from LOV Description	*/
	
	var svc = TheApplication().GetService(""STC Get Filename"");
	var Inputs = TheApplication().NewPropertySet();
	var Outputs = TheApplication().NewPropertySet();
	Inputs.SetProperty(""Type"",""STC_FILE_NAME"");
	Inputs.SetProperty(""LIC"",""STC_RESUBMIT_ORDER2"");
	svc.InvokeMethod(""STC Get LOV Desc"", Inputs, Outputs);
	var filepath = Outputs.GetProperty(""Description"");
	
	var file = Clib.fopen(filepath, ""rt"");
	
	/* WIPRO-Upgrade-03.05.2016-TSINGHALC - Commented the below line as the filename is received from the above lines by invoking the Generic BS */
	
	//var file=Clib.fopen(""/siebelfs/hout3.csv"", ""rt"");

	if (file==null)
    {
		TheApplication().RaiseErrorText(""Error in opening the file"");
	}
	else
    {
		while(!Clib.feof(file))
        {

			MRow = (Clib.fgets(file));  
			MRow = trim(MRow);
			var len = MRow.length;
			var ind1 = MRow.indexOf("","");
			MRowId=MRow.substring(0,ind1);
			MRow = MRow.substring(ind1+1,len);
			var ind2 = MRow .indexOf("","");
			Product = MRow .substring(0,ind2);
			Action = MRow.substring(ind2+1,len);
			 
			//TheApplication().RaiseErrorText(NetPrice);

			var MInputs = TheApplication().NewPropertySet();
			var MOutputs = TheApplication().NewPropertySet();

			if( Product != '' || Product != null)
			{
				var MWorkflowProc = TheApplication().GetService(""RMS RMS Interface Order Management"");
				MInputs.SetProperty(""Contract Id"",MRowId);    
				MInputs.SetProperty(""SIM Number"",Product);
				MInputs.SetProperty(""MSISDN Number"",Action);

				MWorkflowProc.InvokeMethod(""ActivateOrder"", MInputs, MOutputs);

			}
        }
    }
	MWorkflowProc=null;
	MOutputs=null;
	MInputs=null;
	MRowId=null;
	file = null;
	filepath = null;
	Outputs = null;
	Inputs = null;
	svc = null;

}
function Init(Inputs, Outputs)
{
	try
	{
		with (Outputs)
		{
			SetProperty(""Bill Payment"","""");
			SetProperty(""Bill Period"","""");
			SetProperty(""Bill Number"","""");
			SetProperty(""Amount Due"","""");
			SetProperty(""Billing Profile Id"","""");
			
			
		}
		//return(ContinueOperation);
	}
	catch(e)
	{
	LogException(e);
	}
	finally
	{
	}
}
function LogException(e)
{

	var appObj;
  	var Input;
  	var Output;
  	var CallMessageHandler; 
	try
 	{
		  appObj = TheApplication();
		  Input = appObj.NewPropertySet();
		  Output = appObj.NewPropertySet();
		  CallMessageHandler = appObj.GetService(""STC Generic Error Handler""); 
		  Input.SetProperty(""Error Code"", e.errCode);
		  Input.SetProperty(""Error Message"", e.errText);
		  Input.SetProperty(""Object Name"", ""STC PrePaid Balance Enquiry BS"");
		  Input.SetProperty(""Object Type"", ""Buisness Service"");
		  CallMessageHandler.InvokeMethod(""Log Message"", Input, Output);
 	}
 	catch(e)
 	{
  		
 	}
 	finally
 	{
 
		  CallMessageHandler = null;
		  Output = null;
		  Input = null;
		  appObj = null;
 	}
}
function Query(Inputs,Outputs)
{
 var appObj;
 var sAccountId;
 var svc;
 var input;
 var output;
 var StrSearchSpec;
 var strInvoiceHistory;
 var InvoiceHistoryArry;
 var AddrCount;
 var InvoiceArr;
 var InvoicePS;
 var PSInput;
 var ChildInvoiceArry;
 var ChildCount;
 var cnt;
 var i = 0;
 var j = 0;
 var k = 0;
 var ParentRecord;
 var ChildRecord;
	try
	{
			appObj = TheApplication();
		    sAccountId = appObj.GetProfileAttr(""BillAccountId"");
		    PSInput = appObj.NewPropertySet();
		    input = appObj.NewPropertySet();
		    output = appObj.NewPropertySet();
		    svc = appObj.GetService(""Workflow Process Manager"");
		    input.SetProperty(""ProcessName"",""STC Invoice History WF"");
		    input.SetProperty(""Object Id"",sAccountId);
		    svc.InvokeMethod(""RunProcess"",input,output);
		    strInvoiceHistory = appObj.GetSharedGlobal(""gInvoiceHistory"");
	
			if (strInvoiceHistory != """")
			{
			   InvoiceHistoryArry = new Array;
			   InvoiceHistoryArry = strInvoiceHistory.split("";"");
			   AddrCount = getArrayLength(InvoiceHistoryArry);
			   for (i = 0; i < AddrCount-1; i++)
			   {
			   	  InvoiceArr = InvoiceHistoryArry[i].split(""^"");
			   	  ChildCount = getArrayLength(InvoiceArr);
			   	  InvoicePS = appObj.NewPropertySet();
				  for (j = 0; j < ChildCount; j++)
				  {
				  		ChildInvoiceArry = InvoiceArr[j].split(""~"");
				  		InvoicePS.SetProperty(ChildInvoiceArry[0],ChildInvoiceArry[1]);
			   	  }//for j
				PSInput.AddChild(InvoicePS);
			   }//for i
			
				cnt = PSInput.GetChildCount();
				for (k = 0; k < cnt; k++)
				{
					Outputs.AddChild(PSInput.GetChild(k));		
				}
				appObj.SetSharedGlobal(""gInvoiceHistory"","""");
	  		}//if strInvoiceHistory
	}//try
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	input = null;
	output= null;
	svc = null;
	InvoiceHistoryArry = null;
	InvoiceArr = null;
	appObj = null;
	}

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	var ireturn;
	var psInputs;
	var psOutputs;

	try
	{
		ireturn = ContinueOperation;
		switch(MethodName)
		{
			case ""Init"":
					Init(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
			case ""Query"":
					Query(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
			default:
					//ireturn = ContinueOperation;
					break;
		}
	return (ireturn);
	}
	catch(e)
	{
	LogException(e);
	}
	finally
	{
	}
	
}
function GenerateCheckSum(tokenNumber)
{
try
{
	//var vRandom = """";
	var vCheckSum = """";
	var leftToken = """", rightToken="""", leftSum=0, rightSum=0, lengthToken=0;
	var arrSplitL = new Array, arrSplitR = new Array;
	var finalSum = 0, modTen=0;
	
	if (tokenNumber == """" || tokenNumber == null)
	{
		//vRandom = Math.random();
		vCheckSum = (Math.round(Math.random()*1000000))%10;
		//TheApplication().RaiseErrorText(""vRandomNumber=""+vRandom+"" | vCheckSum=""+vCheckSum);
	}
	else{
		lengthToken = tokenNumber.length;
		leftToken = tokenNumber.substring(0, 5);
		rightToken = tokenNumber.substring(lengthToken-3, lengthToken);
		arrSplitL = leftToken.split("""");
		arrSplitR = rightToken.split("""");
		leftSum = ToNumber(arrSplitL[0])*9 + ToNumber(arrSplitL[1])*8 + ToNumber(arrSplitL[2])*7 + ToNumber(arrSplitL[3])*6 + ToNumber(arrSplitL[4])*5;
		rightSum = ToNumber(arrSplitR[0])*4 + ToNumber(arrSplitR[1])*3 + ToNumber(arrSplitR[2])*2;
		finalSum = leftSum + rightSum;
		vCheckSum = ToNumber(finalSum) % 10;
	}
}
catch(e)
{throw(e);}
finally
{}
return vCheckSum;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	
	try{
		var oJBS = null;
		var inPS = null;
		var outPS = null;
		var inputStr="""", result="""", resultLen=0;
		var vCheckSum="""";
		
		//MethodName=Encrypt, Decrypt
		if (MethodName == ""Encrypt"" || MethodName == ""Decrypt"")
		{
			oJBS = TheApplication().GetService(""STC Encrypt Decrypt JBS Service"");
			inPS = TheApplication().NewPropertySet();
			outPS = TheApplication().NewPropertySet();
			inputStr = Inputs.GetProperty(""inputString"");
			inPS.SetProperty(""inputString"", inputStr);
			oJBS.InvokeMethod(MethodName, inPS, outPS);
			result = outPS.GetProperty(""outputString"");
			resultLen = result.length;
			vCheckSum = GenerateCheckSum(inputStr);
			
			Outputs.SetProperty(""outputString"", result);
			Outputs.SetProperty(""outputStringLen"", resultLen);
			Outputs.SetProperty(""CheckSum"", vCheckSum);
		}
		else {
			//MethodName=GenerateCheckSum
			inputStr = Inputs.GetProperty(""tokenNumber"");
			vCheckSum = GenerateCheckSum(inputStr);
			Outputs.SetProperty(""CheckSum"", vCheckSum);
		}
		return CancelOperation;
	}
	catch(e)
	{
		throw(e);
	}
	finally
	{
		inPS = null, outPS = null;
		oJBS = null;
	}
	
	return (ContinueOperation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""Resubmit"")
	{
		Resubmit();
		return(CancelOperation);    
	}
	else
    {    
		return(ContinueOperation);
    }
}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}




function Resubmit()
{
	var MRowId="""";

	/*	WIPRO-Upgrade-03.05.2016-TSINGHALC - Gets the Filename along with Filepath from LOV Description	*/
	
	var svc = TheApplication().GetService(""STC Get Filename"");
	var Inputs = TheApplication().NewPropertySet();
	var Outputs = TheApplication().NewPropertySet();
	Inputs.SetProperty(""Type"",""STC_FILE_NAME"");
	Inputs.SetProperty(""LIC"",""STC_IPHONE_MIG_SUBMIT"");
	svc.InvokeMethod(""STC Get LOV Desc"", Inputs, Outputs);
	var filepath = Outputs.GetProperty(""Description"");
	
	var file = Clib.fopen(filepath, ""rt"");
	
	/* WIPRO-Upgrade-03.05.2016-TSINGHALC - Commented the below line as the filename is received from the above lines by invoking the Generic BS */
	
	//var file=Clib.fopen(""/siebelfs/IPhoneMigration.csv"", ""rt"");

	if (file==null)
    {
		TheApplication().RaiseErrorText(""Error in opening the file"");
    }
	else
    {
		while(!Clib.feof(file))
        {

			MRowId = (Clib.fgets(file));  
			MRowId = trim(MRowId);
			var MInputs = TheApplication().NewPropertySet();
			var MOutputs = TheApplication().NewPropertySet();

			MInputs.SetProperty(""Object Id"",MRowId);    

			MInputs.SetProperty(""ProcessName"",""STC Iphone Migration Modify Order"");

			var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");

			MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);

        }
    }
	MWorkflowProc=null;
	MOutputs=null;
	MInputs=null;
	MRowId=null;
	file = null;
	filepath = null;
	Outputs = null;
	Inputs = null;
	svc = null;

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""Resubmit"")
	{
		Resubmit();
		return(CancelOperation);    
	}
	else
    {    
		return(ContinueOperation);
    }
}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}




function Resubmit()
{
	var MRowId="""";

	/*	WIPRO-Upgrade-03.05.2016-TSINGHALC - Gets the Filename along with Filepath from LOV Description	*/
	
	var svc = TheApplication().GetService(""STC Get Filename"");
	var Inputs = TheApplication().NewPropertySet();
	var Outputs = TheApplication().NewPropertySet();
	Inputs.SetProperty(""Type"",""STC_FILE_NAME"");
	Inputs.SetProperty(""LIC"",""STC_IPHONE_MIG_SUBMIT1"");
	svc.InvokeMethod(""STC Get LOV Desc"", Inputs, Outputs);
	var filepath = Outputs.GetProperty(""Description"");
	
	var file = Clib.fopen(filepath, ""rt"");
	
	/* WIPRO-Upgrade-03.05.2016-TSINGHALC - Commented the below line as the filename is received from the above lines by invoking the Generic BS */
	
	//var file=Clib.fopen(""/siebelfs/IPhoneMigration_1.csv"", ""rt"");

	if (file==null)
    {
		TheApplication().RaiseErrorText(""Error in opening the file"");
    }
	else
    {
		while(!Clib.feof(file))
        {

			MRowId = (Clib.fgets(file));  
			MRowId = trim(MRowId);
			var MInputs = TheApplication().NewPropertySet();
			var MOutputs = TheApplication().NewPropertySet();

			MInputs.SetProperty(""Object Id"",MRowId);    

			MInputs.SetProperty(""ProcessName"",""STC Iphone Migration Modify Order"");

			var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");

			MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);

		}
    }
	MWorkflowProc=null;
	MOutputs=null;
	MInputs=null;
	MRowId=null;
	file = null;
	filepath = null;
	Outputs = null;
	Inputs = null;
	svc = null;

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""Resubmit"")
	{
		Resubmit();
		return(CancelOperation);    
	}
	else
    {    
		return(ContinueOperation);
    }
}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}




function Resubmit()
{
	var MRowId="""";

	/*	WIPRO-Upgrade-03.05.2016-TSINGHALC - Gets the Filename along with Filepath from LOV Description	*/
	
	var svc = TheApplication().GetService(""STC Get Filename"");
	var Inputs = TheApplication().NewPropertySet();
	var Outputs = TheApplication().NewPropertySet();
	Inputs.SetProperty(""Type"",""STC_FILE_NAME"");
	Inputs.SetProperty(""LIC"",""STC_IPHONE_MIG_SUBMIT2"");
	svc.InvokeMethod(""STC Get LOV Desc"", Inputs, Outputs);
	var filepath = Outputs.GetProperty(""Description"");
	
	var file = Clib.fopen(filepath, ""rt"");
	
	/* WIPRO-Upgrade-03.05.2016-TSINGHALC - Commented the below line as the filename is received from the above lines by invoking the Generic BS */
	
	//var file=Clib.fopen(""/siebelfs/IPhoneMigration_2.csv"", ""rt"");

	if (file==null)
    {
		TheApplication().RaiseErrorText(""Error in opening the file"");
    }
	else
    {
		while(!Clib.feof(file))
        {

			MRowId = (Clib.fgets(file));  
			MRowId = trim(MRowId);
			var MInputs = TheApplication().NewPropertySet();
			var MOutputs = TheApplication().NewPropertySet();

			MInputs.SetProperty(""Object Id"",MRowId);    

			MInputs.SetProperty(""ProcessName"",""STC Iphone Migration Modify Order"");

			var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");

			MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);

		}
    }
	MWorkflowProc=null;
	MOutputs=null;
	MInputs=null;
	MRowId=null;
	file = null;
	filepath = null;
	Outputs = null;
	Inputs = null;
	svc = null;

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""Resubmit"")
	{
		Resubmit();
		return(CancelOperation);    
	}
	else
    {    
		return(ContinueOperation);
    }
}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}




function Resubmit()
{
	var MRowId="""";

	/*	WIPRO-Upgrade-03.05.2016-TSINGHALC - Gets the Filename along with Filepath from LOV Description	*/
	
	var svc = TheApplication().GetService(""STC Get Filename"");
	var Inputs = TheApplication().NewPropertySet();
	var Outputs = TheApplication().NewPropertySet();
	Inputs.SetProperty(""Type"",""STC_FILE_NAME"");
	Inputs.SetProperty(""LIC"",""STC_IPHONE_MIG_SUBMIT3"");
	svc.InvokeMethod(""STC Get LOV Desc"", Inputs, Outputs);
	var filepath = Outputs.GetProperty(""Description"");
	
	var file = Clib.fopen(filepath, ""rt"");
	
	/* WIPRO-Upgrade-03.05.2016-TSINGHALC - Commented the below line as the filename is received from the above lines by invoking the Generic BS */
	
	//var file=Clib.fopen(""/siebelfs/IPhoneMigration_3.csv"", ""rt"");

	if (file==null)
    {
		TheApplication().RaiseErrorText(""Error in opening the file"");
    }
	else
    {
		while(!Clib.feof(file))
        {

			MRowId = (Clib.fgets(file));  
			MRowId = trim(MRowId);
			var MInputs = TheApplication().NewPropertySet();
			var MOutputs = TheApplication().NewPropertySet();

			MInputs.SetProperty(""Object Id"",MRowId);    

			MInputs.SetProperty(""ProcessName"",""STC Iphone Migration Modify Order"");

			var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");

			MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);

        }
    }
	MWorkflowProc=null;
	MOutputs=null;
	MInputs=null;
	MRowId=null;
	file = null;
	filepath = null;
	Outputs = null;
	Inputs = null;
	svc = null;

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""Resubmit"")
	{
		Resubmit();
		return(CancelOperation);    
	}
	else
    {    
		return(ContinueOperation);
	}
}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}




function Resubmit()
{
	var MRowId="""";

	/*	WIPRO-Upgrade-03.05.2016-TSINGHALC - Gets the Filename along with Filepath from LOV Description	*/
	
	var svc = TheApplication().GetService(""STC Get Filename"");
	var Inputs = TheApplication().NewPropertySet();
	var Outputs = TheApplication().NewPropertySet();
	Inputs.SetProperty(""Type"",""STC_FILE_NAME"");
	Inputs.SetProperty(""LIC"",""STC_IPHONE_MIG_SUBMIT4"");
	svc.InvokeMethod(""STC Get LOV Desc"", Inputs, Outputs);
	var filepath = Outputs.GetProperty(""Description"");
	
	var file = Clib.fopen(filepath, ""rt"");
	
	/* WIPRO-Upgrade-03.05.2016-TSINGHALC - Commented the below line as the filename is received from the above lines by invoking the Generic BS */

	//var file=Clib.fopen(""/siebelfs/IPhoneMigration_4.csv"", ""rt"");

	if (file==null)
    {
		TheApplication().RaiseErrorText(""Error in opening the file"");
    }
	else
    {
		while(!Clib.feof(file))
        {

			MRowId = (Clib.fgets(file));  
			MRowId = trim(MRowId);
			var MInputs = TheApplication().NewPropertySet();
			var MOutputs = TheApplication().NewPropertySet();

			MInputs.SetProperty(""Object Id"",MRowId);    

			MInputs.SetProperty(""ProcessName"",""STC Iphone Migration Modify Order"");

			var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");

			MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);

        }
      }
	MWorkflowProc=null;
	MOutputs=null;
	MInputs=null;
	MRowId=null;
	file = null;
	filepath = null;
	Outputs = null;
	Inputs = null;
	svc = null;

}
function GetMultipleIssueType(Inputs,Outputs)
{
try
{
var JobCardId = Inputs.GetProperty(""JobCardId"");
var RepairBO = TheApplication().GetBusObject(""FS Repair"");
var RepairBC = RepairBO.GetBusComp(""STC FS Repair Issue Types BC"");
var IssueType= """";
var IssueTypeList = """";
var j = 0;
var spec = ""[Part Rpr Id] = '"" + JobCardId + ""'"";
 if(JobCardId != """")
 {
    with(RepairBC)
 {
  ActivateField(""Code Id"")
  ActivateField(""Code Name"");
  ActivateField(""Part Rpr Id"");
  ClearToQuery();
  SetSearchExpr(spec);
  SetViewMode(AllView);
  ExecuteQuery(ForwardOnly);
  var IsIssueTypeAvail = FirstRecord();
  if(IsIssueTypeAvail)
  {
  var count = CountRecords();
  for (j= 0; j < count; j++)
  {
  IssueType = GetFieldValue(""Code Name"");
   if (j == 0)
                        {
         IssueType =""<tr class='tr-striped'><td class='tdhead'>Issue Type</td><td class='tdborder'>""+ IssueType + ""</td></tr>"";
    IssueTypeList = IssueType;
   }
    
   else
   {
    IssueType = ""<tr class='tr-striped'><td class='tdhead'></td><td class='tdborder'>""+IssueType+""</td></tr>"";
    IssueTypeList = IssueTypeList + IssueType;

                        }
    
    IsIssueTypeAvail = NextRecord();
    
  }
  
  }
  }//with
  Outputs.SetProperty(""IssueTypeList"",IssueTypeList);
return(IssueTypeList);

 }
}
catch(e)
{ 
}
finally
{
 RepairBC = null;
 RepairBO = null;
 
}
 
 return CancelOperation;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 if(MethodName == ""GetMultipleIssueType"")
{
GetMultipleIssueType(Inputs,Outputs);
return CancelOperation;
 }
 return (ContinueOperation);
}
function QueryAsset(Inputs, Outputs)
{
var App = TheApplication();
var AssetBC = App.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset"");
var PsInputs = App.NewPropertySet();
var PSOutputs = App.NewPropertySet();
var SerialNum;
var AccountId;
var Expr = ""([Product Part Number] ='ROMADD1' OR [Product Part Number] ='ROMPADD1') AND [Status] <> 'Inactive'"";
	with(AssetBC)
	{
			SetViewMode(AllView);
			ActivateField(""Status"");
			ActivateField(""Product Part Number"");
			ActivateField(""Serial Number"");
			ActivateField(""Service Account Id"");
			ClearToQuery();
    		SetSearchExpr(Expr);
			ExecuteQuery(ForwardOnly);
			var isRec = FirstRecord();
			while(isRec)
			{
			/*	SerialNum = GetFieldValue(""Serial Number"");
				AccountId = GetFieldValue(""Service Account Id"");
				var partNum = GetFieldValue(""Product Part Number"");
				PsInputs.SetProperty(""InboundProduct"",SerialNum);
				PsInputs.SetProperty(""MSISDN"",partNum);
				PsInputs.SetProperty(""ProcessName"",""STC KSA DeActivate Modify Order WF"");
				
				STCWorkflowProc.InvokeMethod(""RunProcess"", PsInputs, PSOutputs);*/
				SetFieldValue(""Status"", ""Inactive"");
				WriteRecord();

			isRec = NextRecord();	
				
				
			}
			
	}//with(AssetBC)
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
  var iReturn;
 
 try  
 {
  iReturn = ContinueOperation;
  switch (MethodName)
  {
   case ""QueryAsset"":
     QueryAsset(Inputs, Outputs);
    iReturn = CancelOperation;
    break;
                    
   default: 
    iReturn = ContinueOperation;
    
  } //switch
  return (iReturn);
 } 
 catch (e)
 { 
  TheApplication().RaiseErrorText(e.toString());
 }

}
function AddSMSList(MSISDN)
{
 var vApp = TheApplication();
 var vBOCampaign, vBCCampListContact, vBOOffer,vBCWirelessOffer;
 var vCampaignId, vPrimaryOfferId, vPrimaryTreatmentId;
 var OldCanId = TheApplication().GetProfileAttr(""CreatePopulate"");
 var vMSISDN, isRecord, isRecordTreatment;
 var vFileName;
 var vTemplateText = """";
 var vFP;
 var vCommaFlag = ""0"";
 var strError = """";
var CanId =  Inputs.GetProperty(""CanId"");

 var vFilePathLOV = ""STC_ADMIN"";
 var vLIC = ""ROAMSMS"";
 
 var strFilePath = GetLOVDesc(vFilePathLOV,vLIC);

 var strFilePath1 = ""C:\\"";
 var vDTime = GetTimeStamp();
 
    vFileName = ""ROAMSMS""+ ""_""+ vDTime +"".csv"";
    
	if(vFP != null) 
	{  
	
			Clib.fputs(""MSISDN""+MSISDN, vFP);           
		
		if(Clib.fclose(vFP) != 0)
		{
			strError = strError + ""****Logging file not closed****"";
		}
	}
  else
  {
   strError = strError + ""****Could not create logging File****"";
  } 
}
function CheckExpiryDate(Inputs,Outputs)
{
var App = TheApplication();
var AssetBC = App.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset"");
var RoamAssetBC = App.GetBusObject(""Asset Management"").GetBusComp(""Asset Mgmt - Asset"");
var spec  = ""[Status] <> 'Inactive' AND [Effective End Date] IS NOT NULL AND [Product Part Number] LIKE 'ROM*'"";
var ROMgprs = ""[Status] <> 'Inactive' AND ([Product Part Number] = 'ROMADDGPRS1' OR [Product Part Number] = 'ROMADDSMS1')""
	with(AssetBC)
	{
		ActivateField(""Effective End Date"");
		ActivateField(""Serial Number"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchExpr(spec);
		ExecuteQuery(ForwardOnly);
		var AssRec = FirstRecord();
		while(AssRec)
		{
			var enddate = GetFieldValue(""Effective End Date"");
			var MSISDN = GetFieldValue(""Serial Number"");
			if(enddate != '' || enddate != null || enddate != """")
			{
				var IntDatesys = new Date(enddate);
				var sysintdate = IntDatesys.toSystem();
				var CurrDate = new Date();
				var CurrDateSys = new Date(CurrDate);
				var sysdateCurrDate = CurrDateSys.toSystem();
				var daydiff = (sysintdate - sysdateCurrDate);
				var Finaldays = Math.round((daydiff/(60*60*24)));
					if(Finaldays < 0)
					{
						SetFieldValue(""Status"", ""Inactive"");
						WriteRecord();
						with(RoamAssetBC)
						{
							ActivateField(""Product Part Number"");
							SetViewMode(AllView);
							ClearToQuery();
							SetSearchSpec(""Serial Number"", MSISDN);
							ExecuteQuery(ForwardOnly);
							var RoamRec = FirstRecord();
							while(RoamRec)
							{
								var statInc = GetFieldValue(""Status"");
								var ProdPartNum  = GetFieldValue(""Product Part Number"");
								if(ProdPartNum == ""ROMADDSMS1"" || ProdPartNum == ""ROMADDGPRS1"")
								{
								SetFieldValue(""Status"", ""Inactive"");
								WriteRecord();
								}
								RoamRec = NextRecord();
							}
						}
					
						
					}
				}
			AssRec = NextRecord();
		}
	}
}
function GetLOVDesc(Type, LIC)
{
 var vLOVType = Type;
 var vLIC = LIC;
 
 var vDesc ="""";
 var isRecord;
 var vBOLOV,vBCLOV;
 
 try
 {
  vBOLOV = TheApplication().GetBusObject(""List Of Values"");
     vBCLOV = vBOLOV.GetBusComp(""List Of Values"");
     
 
  with(vBCLOV)
     {
     SetViewMode(3);
      ActivateField(""Type"");
     ActivateField(""Description"");
      ActivateField(""Name"");
      ClearToQuery();
      SetSearchSpec(""Type"",vLOVType);
      SetSearchSpec(""Name"",vLIC);
      ExecuteQuery(ForwardOnly);
      isRecord = FirstRecord();
   if(isRecord != null)
   {  
          vDesc = GetFieldValue(""Description"");  
   }   
   return(vDesc);    
  }
 }
 catch(e)
 {
  TheApplication().RaiseError(e.toString);
  return(vDesc);  
 }
 finally
 {
  vBOLOV = null;
  vBCLOV = null;
 
 } 
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
 try
 {
    switch(MethodName)
     {
   
     
      case ""CheckExpiryDate"":
     CheckExpiryDate(Inputs, Outputs);
     return(CancelOperation);
     break;
    
    
      default:
          return (ContinueOperation);
       }
 }
 catch (exc)
 {
 throw(exc.toString());
 }
  finally 
 {
 }  
}
"var vErrorMessage = """";
var vErrorCode    = """";"
function Import_Bulk_File( Inputs , Outputs)
{
   try
   {
     
      var vInputFile      = """";
      var vReadFromFile   = """";
      var vBulkDataArray  = """"; 
      var ImportFlg=TheApplication().SetProfileAttr(""ImportFlg"",""Y"");           
      var vBulkBO: BusObject =  TheApplication().GetBusObject(""STC LMRA Black List BO"");
      var vBulkBC: BusComp = vBulkBO.GetBusComp(""STC LMRA BlackList BC"");      
      vBulkBC.SetViewMode(AllView);
      vBulkBC.InvokeMethod(""SetAdminMode"",""TRUE"");
      vBulkBC.ActivateField(""CPR Number"");
      vBulkBC.ActivateField(""STC Source"");	
      vBulkBC.ActivateField(""Import Status"");
      vBulkBC.ActivateField(""Black Listed""); 
      vBulkBC.ActivateField(""Comment"");
      vBulkBC.ActivateField(""STC Archive Flag"");      
	var vFileName   = Inputs.GetProperty(""FileName"");
	var vFileType     = ToString(Inputs.GetProperty(""FileType""));
	vFileType       = Clib.strlwr(vFileType);	  
	if( vFileType != ""csv"")
	{
	   TheApplication().RaiseErrorText(""Please check the File Type , Is should be :  FileName.CSV"");
	}
	vInputFile     = Clib.fopen(vFileName , ""rt"");       
	vReadFromFile  = Clib.fgets(vInputFile);      
	while((vReadFromFile != null) && (vReadFromFile.length > 1))
	{
	while(!Clib.feof(vInputFile))
	{	
		var MRow = (Clib.fgets(vInputFile));  
		MRow = trim(MRow);
		var len = MRow.length;//840839774,Active
		
		var ind1 = MRow.indexOf("","");
		var CPRNumber=MRow.substring(0,ind1);//840839774
		var LMRAStatus = MRow.substring(ind1+1,len);//Active
	


	    vBulkDataArray = vReadFromFile.split("","");
	    vBulkBC.InvokeMethod(""SetAdminMode"", ""TRUE""); 	 
	    with(vBulkBC)
	    {	    
	    	var spec1 = """";
			ClearToQuery();		
			spec1 = ""[CPR Number]= '"" + CPRNumber + ""' AND ([Black Listed]='ToBeBlacklisted')"";
			SetSearchExpr(spec1);
			ExecuteQuery(ForwardOnly);
			var isAccRecord = FirstRecord();
			if(isAccRecord)
			{
				NewRecord(NewAfter);
			    SetFieldValue(""CPR Number"",CPRNumber);
			    SetFieldValue(""STC LMRA Status"",LMRAStatus);
			    SetFieldValue(""Black Listed"" ,""Failed"");
			    SetFieldValue(""Import Status"" ,""Duplicate"");
			    SetFieldValue(""STC Source"" ,""LMRA"");				    
			    WriteRecord();
			}//if(isAccRecord)
			else
			{  	
		        var spec2 = """";
				ClearToQuery();		
				spec2 = ""[CPR Number]= '"" + CPRNumber + ""' AND ([Black Listed]='Blacklisted' OR ([Black Listed]='Unblacklisted' AND [STC Archive Flag] = 'N'))"";
				SetSearchExpr(spec2);
				ExecuteQuery(ForwardOnly);
				var isAccRecord2 = FirstRecord();
				if(isAccRecord2)
				{				   
				    var vBlkStatus = GetFieldValue(""Black Listed"");
				    var vId = GetFieldValue(""Id"");
				    if(vBlkStatus == ""Blacklisted"")
				    {  
				        NewRecord(NewAfter);
						SetFieldValue(""CPR Number"",CPRNumber);
						SetFieldValue(""STC LMRA Status"",LMRAStatus);
						SetFieldValue(""Black Listed"" ,""Failed"");
					    SetFieldValue(""Import Status"" ,""Duplicate"");
					    SetFieldValue(""STC Source"" ,""LMRA"");				    
					    WriteRecord();
				     }//if(vBlkStatus == ""Blacklisted"")
				     else if(vBlkStatus == ""Unblacklisted"")				    
				     {
				     	SetFieldValue(""STC Archive Flag"",""Y"");
				     	WriteRecord();
					    NewRecord(NewAfter);
						SetFieldValue(""CPR Number"",CPRNumber);
						SetFieldValue(""STC LMRA Status"",LMRAStatus);					   
						SetFieldValue(""Black Listed"" ,""ToBeBlacklisted"");
						SetFieldValue(""Import Status"" ,""Success"");	
						SetFieldValue(""STC Source"" ,""LMRA"");				
						WriteRecord();
					}//else if(vBlkStatus == ""Unblacklisted"")	
				}//	if(isAccRecord2)				
				else
				{
					NewRecord(NewAfter);
			    	SetFieldValue(""CPR Number"",CPRNumber);
			    	SetFieldValue(""STC LMRA Status"",LMRAStatus);
			        SetFieldValue(""Black Listed"" ,""ToBeBlacklisted"");
				    SetFieldValue(""Import Status"" ,""Success"");	
				    SetFieldValue(""STC Source"" ,""LMRA"");		  
				    WriteRecord();
				}//else
			}//	else		
		}//with(vBulkBC)
		}//	 	while(!Clib.feof(vInputFile))          
		 vReadFromFile = Clib.fgets(vInputFile);
      }//End While
      ImportFlg=TheApplication().SetProfileAttr(""ImportFlg"","""");
   }//try
   
   catch(e)
   { 
      vErrorMessage = e.toString();
      vErrorCode    = e.errCode;      
   }
   finally
   {
   	vBulkBC = null;
   	vBulkBC = null;
   }
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{

    if( MethodName == ""Import"")
    {
      Import_Bulk_File( Inputs, Outputs );
      return(CancelOperation);
    }
 return (ContinueOperation);
}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}
function RMSSendMail(Inputs,Outputs)
{

 try
 {
  var filename = Inputs.GetProperty("filename"");  
  var proc_full_path_name = Inputs.GetProperty("filepath""); 
  var Attachment=  Inputs.GetProperty(""Attachment"");
  var Email = Inputs.GetProperty(""Email"");
  var AccountName= Inputs.GetProperty(""AccountName"");
  var IDNumber= Inputs.GetProperty(""IDNumber"");
  var IDType= Inputs.GetProperty(""IDType"");
  var MSISDN= Inputs.GetProperty(""MSISDN"");
 var DealerName= Inputs.GetProperty(""DealerName"");
 var DealerNumber= Inputs.GetProperty(""DealerNumber"");
 
  
 
  Outputs.SetProperty("file"",""sh ""+proc_full_path_name+""/""+filename+ "" \"""" +Attachment+ ""\"" \"""" +AccountName+ ""\"" \"""" +IDNumber+ ""\"" \"""" +IDType+ ""\"" ""+""\"""" +MSISDN+ ""\"" ""+""\"""" +DealerNumber+ ""\"" ""+""\"""" +DealerName+ ""\"" ""+""\"""" +Email+ ""\"""") ;
  Clib.system(""sh ""+proc_full_path_name+""/""+filename+ "" \"""" +Attachment+ ""\"" \"""" +AccountName+ ""\"" \"""" +IDNumber+ ""\"" \"""" +IDType+ ""\"" ""+""\"""" +MSISDN+ ""\"" ""+""\"""" +DealerNumber+ ""\"" ""+""\"""" +DealerName+ ""\"" ""+""\"""" +Email+ ""\"""");

  return(CancelOperation);  
      
    }
 catch(e)
 {
  throw(e); 
 }
 finally
 {
 }


}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 switch(MethodName)
 {      
     case ""RMSSendMail"":
     RMSSendMail(Inputs, Outputs);
     return(CancelOperation);
     break;     
     default:
     return (ContinueOperation);
       }

 return (ContinueOperation);
}
function GetMSISDN(sBANNum,sBilledAmnt)
{
	var sBillAcntBO = TheApplication().GetBusObject(""STC Billing Account"");
	var sBillAcntBC = sBillAcntBO.GetBusComp(""CUT Invoice Sub Accounts"");
	var sSANBC = sBillAcntBO.GetBusComp(""CUT Service Sub Accounts"");
	
	var sSANExpr = ""[Account Status] <> 'Terminated' AND [Account Status] <> 'New'"";
	//var sSANExpr = ""[Account Status] <> 'Terminated' AND [Account Status] <> 'New' AND [STC Pricing Plan Type] = 'Postpaid'"";
	var sMSISDN = """";
	var sPricingType = """";
	
	with(sBillAcntBC){
		ActivateField(""Account Number"");
		ClearToQuery();
		SetViewMode(AllView);
		SetSearchSpec(""Account Number"",sBANNum);		
		ExecuteQuery(ForwardOnly);
		var IsBANRec = FirstRecord();
		with(sSANBC){
			ActivateField(""DUNS Number"");
			ActivateField(""STC Pricing Plan Type"");
			ClearToQuery();
			SetViewMode(AllView);
			SetSearchExpr(sSANExpr);
			ExecuteQuery(ForwardOnly);
			var IsSANRec = FirstRecord();
			while(IsSANRec){
				sMSISDN = GetFieldValue(""DUNS Number"");
				sPricingType = GetFieldValue(""STC Pricing Plan Type"");
				if(sPricingType == ""Postpaid"")
					UpdateLOYMemAccnt(sMSISDN,sBilledAmnt);	
				IsSANRec = NextRecord();			
			}//endwhile
		}//endiwth sSANBC
	}//endwith sBillAcntBC


	return CancelOperation;
}
function ProcessActualRedeemPoints(Inputs,Outputs)
{
	var sLMSBO = TheApplication().GetBusObject(""STC LMS BRM Processing BO"");
	var sLMSBC = sLMSBO.GetBusComp(""STC LMS BRM Processing BC"");
	var sBANNum = """";
	var sBilledAmnt = """";
	
	with(sLMSBC){
		ActivateField(""STC BAN Number"");
		ActivateField(""STC Billed Amount"");
		ActivateField(""STC DueDate"");
		ActivateField(""STC Process Flag"");
		ClearToQuery();
		SetViewMode(AllView);
		SetSearchSpec(""STC Process Flag"",""N"");
		ExecuteQuery(ForwardOnly);
		var IsFirstRec = FirstRecord();
		while(IsFirstRec){
			sBANNum = GetFieldValue(""STC BAN Number"");
			sBilledAmnt = GetFieldValue(""STC Billed Amount"");
			//Update LOY Mmeber account with the Actual redeemable Points
			GetMSISDN(sBANNum,sBilledAmnt);	
			SetFieldValue(""STC Process Flag"",""Y"");
			WriteRecord();			
			IsFirstRec = NextRecord();		
		}//endwhile		
	}//endwith sLMSBC

	return CancelOperation;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""ProcessActualRedeemPoints""){		
		ProcessActualRedeemPoints(Inputs,Outputs);
		return CancelOperation;
	}
		
	return (ContinueOperation);
}
function UpdateLOYMemAccnt(sMSISDN,sBilledAmnt)
{
	var sLOYMemBO = TheApplication().GetBusObject(""LOY Member"");
	var sLOYMemBC = sLOYMemBO.GetBusComp(""LOY Member"");
	
	var sTier = """";
	var sMultiplyFac = """";
	var sTotalAmnt = """";
	var sActualMemPoints = ""0"";
	
	with(sLOYMemBC){
		ActivateField(""Tier"");
		ActivateField(""STC Actual Redeem Points"");
		ClearToQuery();
		SetViewMode(AllView);
		SetSearchSpec(""MSISDN"",sMSISDN);
		SetSearchSpec(""Status"",""Active"");
		ExecuteQuery(ForwardOnly);
		var IsMemRec = FirstRecord();
		if(IsMemRec){
			sTier = GetFieldValue(""Tier"");
			sActualMemPoints = GetFieldValue(""STC Actual Redeem Points"");
			sMultiplyFac = TheApplication().InvokeMethod(""LookupValue"",""STC_TIER_MUL_FACTOR"",sTier);
			sTotalAmnt = ToNumber(sActualMemPoints)+ToNumber(sBilledAmnt*sMultiplyFac);
			SetFieldValue(""STC Actual Redeem Points"",sTotalAmnt);
			WriteRecord();
		}//endif IsMemRec			
		
	}//endwith LOY Member
		
	return CancelOperation;
}
function GetPTTransaction(Inputs,Outputs)
{
	var sBoLOYMember = TheApplication().GetBusObject(""LOY Member"");
	var sBcLOYMember = sBoLOYMember.GetBusComp(""LOY Member"");
	var sBcLOYTrans = sBoLOYMember.GetBusComp(""LOY Transaction"");
	var sMemberId = Inputs.GetProperty(""MemberId"");
	var IsMemberRec = """";
	var IsTransRec = """";
	var sTransId = """";
	
	//var sTransExpr = ""[Transaction Type] = 'Service' AND [Transaction Sub Type] = 'Transfer Points' AND [Status] = 'Processed'"";
	var sTransExpr = ""[Transaction Type] = 'Service' AND [Transaction Sub Type] = 'Transfer Points'"";
	
	
	with(sBcLOYMember){
		ClearToQuery();
		SetViewMode(AllView);
		SetSearchSpec(""Id"",sMemberId);
		ExecuteQuery(ForwardOnly);
		IsMemberRec = FirstRecord();
		if(IsMemberRec){
			with(sBcLOYTrans){
				ClearToQuery();
				SetViewMode(AllView);
				SetSearchExpr(sTransExpr);
				SetSortSpec(""Created(DESCENDING)"");
				ExecuteQuery(ForwardOnly);
				IsTransRec = FirstRecord();
				if(IsTransRec){
					sTransId = GetFieldValue(""Id"");
				}					
			}//endwith sBcLOYTrans
		}//endif IsMemberRec
		
		
		
	}//endwith
	
Outputs.SetProperty(""TransactionId"",sTransId);	

	return CancelOperation;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""GetPTTransaction""){
		GetPTTransaction(Inputs,Outputs);
		return CancelOperation;
	}
		
	return (ContinueOperation);
}
function AppendToFile(Inputs, Outputs)
{
	
	/*	WIPRO-Upgrade-04.05.2016-TSINGHALC - Gets the Filename along with Filepath from LOV Description	*/
	
	var svc = TheApplication().GetService(""STC Get Filename"");
	var Inputs = TheApplication().NewPropertySet();
	var Outputs = TheApplication().NewPropertySet();
	Inputs.SetProperty(""Type"",""STC_FILE_NAME"");
	Inputs.SetProperty(""LIC"",""STC_LOY_BULK_REG_OUT"");
	svc.InvokeMethod(""STC Get LOV Desc"", Inputs, Outputs);
	var filepath = Outputs.GetProperty(""Description"");
	
	var file = Clib.fopen(filepath, ""rt"");
	
	/* WIPRO-Upgrade-04.05.2016-TSINGHALC - Commented the below line as the filename is received from the above lines by invoking the Generic BS */
	
	//var oFile = Clib.fopen(""/siebelfs/BulkLOYOutput.txt"",""a"");
	
	if (null != file)
	{
		var MSISDN = Inputs.GetProperty(""MSISDN"");  
		var ErrorMessage = Inputs.GetProperty(""Error Message"");
		var Status= Inputs.GetProperty(""Status"");
		var ErrorCode = Inputs.GetProperty(""Error Code"");
		var RequestCompletedDate = Inputs.GetProperty(""Request Completed Date"");
		var MembershipId= Inputs.GetProperty(""MembershipId"");
		var MembershipNumber= Inputs.GetProperty(""MembershipNumber"");
		var SubStatus= Inputs.GetProperty(""Sub Status"");

		var fline=MSISDN + ""||""+Status+""||""+SubStatus+""||""+ErrorCode+""||""+ErrorMessage+""||""+RequestCompletedDate+""||""+MembershipId+""||""+MembershipNumber+""||\n"";
		Clib.fputs(fline,file);
		Clib.fclose(file);
	}
	file = null;
	filepath = null;
	Outputs = null;
	Inputs = null;
	svc = null;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""Append"")
	{
		AppendToFile(Inputs, Outputs);
		return(CancelOperation);    
	}
	else
	{    
		return(ContinueOperation);
	}
}
function ProcessExpiredPoints(Inputs, Outputs)
{
try
{
    var vAppObj = TheApplication();
	var vBusObj = vAppObj.GetBusObject(""LOY Member"");
	//var vLOYTranBC = vBusObj.GetBusComp(""LOY Transaction"");
	var vEBC = vBusObj.GetBusComp(""STC LOY Expired Pts EBC"");
	var inPs = vAppObj.NewPropertySet();
	var outPs = vAppObj.NewPropertySet();
	var vMemberId, vExpPts, isRec, svcBS, searchSpec,vProdId,vCalc,vAtbDef;
	
    vEBC.SetViewMode(AllView);	
    vEBC.ClearToQuery();
    vEBC.ActivateField(""MEMBER_ID""); 
	vEBC.ActivateField(""ACCRUALED_SUM"");
	vEBC.ActivateField(""Calc Today"");
	vEBC.ExecuteQuery(ForwardOnly);

	isRec = vEBC.FirstRecord();
	while(isRec)
	{	  
	  try
	  {
		   //Get expired points for each member 
		   vMemberId = vEBC.GetFieldValue(""MEMBER_ID"");
		   vExpPts = vEBC.GetFieldValue(""ACCRUALED_SUM"");
		   vCalc = vEBC.GetFieldValue(""Calc Today"");
		   vProdId  = vAppObj.InvokeMethod(""LookupValue"", ""STC_LOY_DEFAULT"", ""STC LOY Accrual Expired Points"");
		   vAtbDef = vAppObj.InvokeMethod(""LookupValue"", ""STC_LOY_DEFAULT"", ""STC LOY Attrib Definition Points1"");
		   
		   //create transaction for redemption
		   svcBS = vAppObj.GetService(""STC LOY Generic BS""); 
		   inPs.SetProperty(""Member Id"",vMemberId);
	       inPs.SetProperty(""Product Id"",vProdId);
	       inPs.SetProperty(""Points"",vExpPts);
	       inPs.SetProperty(""Transaction Type"", ""Redemption"");
	       svcBS.InvokeMethod(""CreateTransaction"",inPs,outPs);
	        var vTxnId = outPs.GetProperty(""Transaction Id"");
	       	// code set flag true for processed records
	        svcBS = null;
			inPs = vAppObj.NewPropertySet();
			outPs =vAppObj.NewPropertySet();
			inPs.SetProperty(""boName"",""LOY Member"");
			inPs.SetProperty(""bcName"",""LOY Transaction Accrual Item"");
			//inPs.SetProperty(""SearchExpr"", ""[Member Id] = '"" + vMemberId + ""' AND [Expiration Date]< '"" + vCalc +""' AND [Expiry Redemp Flag] = 'N'"");
			inPs.SetProperty(""SearchExpr"", ""[Member Id] = '"" + vMemberId + ""' AND [Expiration Date]< '"" + vCalc +""' AND [Attribute Definition Id] = '""+ vAtbDef +""' AND [Expiry Redemp Flag] = 'N'"");
			inPs.SetProperty(""FieldName0"",""Expiry Redemp Flag"");
			inPs.SetProperty(""FieldValue0"",""Y"");
			fn_SetFieldValues(inPs,outPs);
			//isRec = vEBC.NextRecord();
			// code for changing Transaction BC status to Acceptable
			svcBS = null;
			inPs = vAppObj.NewPropertySet();
			outPs =vAppObj.NewPropertySet();
			inPs.SetProperty(""boName"",""LOY Member"");
			inPs.SetProperty(""bcName"",""LOY Transaction"");
			inPs.SetProperty(""SearchExpr"", ""[Id] = '"" + vTxnId + ""'"") 
			inPs.SetProperty(""FieldName0"",""Status"");
			inPs.SetProperty(""FieldValue0"",""Acceptable"");
			fn_SetFieldValues(inPs,outPs);
			
			// Run Transaction Process Engine
			svcBS = null;
			inPs = vAppObj.NewPropertySet();
			outPs =vAppObj.NewPropertySet();	
			svcBS = vAppObj.GetService(""LOY Processing Engine""); 
			inPs.SetProperty(""ObjectType"", ""Transaction"");
			inPs.SetProperty(""RowId"", vTxnId);	
			svcBS.InvokeMethod(""ProcessObject"",inPs,outPs);	
		}
		catch(e)
		{
		}
		finally
		{
			isRec = vEBC.NextRecord();
		}
	}
 }
 catch(e)  
{
	throw(e);	
}
finally
{
	vEBC = null;
    //vLOYTranBC = null;
	vBusObj = null;
	inPs = null;
	outPs = null;
	svcBS = null;
}	
return(CancelOperation); 
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
  	var vReturn = ContinueOperation;
	switch (MethodName)
	{
		case ""ProcessExpiredPoints"":
			ProcessExpiredPoints(Inputs,Outputs);
			vReturn = CancelOperation;
			break;
		case "fn_SetFieldValues"":
			fn_SetFieldValues(Inputs,Outputs);
			vReturn = CancelOperation;
			break;
		default:
			vReturn = ContinueOperation;
			break;
	}
	return (vReturn);
}
function fn_SetFieldValues(Inputs, Outputs)
{
	var i = 0, sSearchExpr = """",bo = null,bc = null,sFieldCount = 0, isRec = """";
	try
	{
		sSearchExpr = Inputs.GetProperty(""SearchExpr"");
		bo = TheApplication().GetBusObject(Inputs.GetProperty(""boName""));
		bc = bo.GetBusComp(Inputs.GetProperty(""bcName""));
		with (bc)
		{
			SetViewMode(AllView);
			for (i = 0; ; i++)
			{
				var sFieldName = Inputs.GetProperty(""FieldName"" + i);
				if (sFieldName != """")
					ActivateField(sFieldName);
				else
				{
					sFieldCount = i;
					break;
				}
			}
			ClearToQuery();
			SetSearchExpr(sSearchExpr);
			ExecuteQuery(ForwardOnly);
			isRec = FirstRecord();
			while (isRec)
			{
				for (i = 0; i < sFieldCount; i++)
				SetFieldValue(Inputs.GetProperty(""FieldName"" + i), Inputs.GetProperty(""FieldValue"" + i));
				WriteRecord();
				isRec = NextRecord();
			}
		}
	}
	catch(e)
	{
			throw (e);
	}
	finally
	{
		bc = null;
		bo = null;
	}
	return(CancelOperation);
}
function BatchProcessExpiredPoints(Inputs, Outputs)
{
	try
	{
		var vMemberId = """", vExpPts = 0, vProdId = """", vTodayCalc, vAtbDef = """";
		var vExpPtsSCB = 0, vProdIdSCB = """", vAtbDefSCB = """";
		with(Inputs){
			vMemberId = GetProperty(""MEMBER_ID"");
			vExpPts = ToNumber(GetProperty(""ACCRUALED_SUM""));
			vExpPtsSCB = ToNumber(GetProperty(""SCB_EXPIRY_POINTS""));
			vTodayCalc = GetProperty(""Date_TODAY"");
		}
		vProdId  = TheApplication().InvokeMethod(""LookupValue"", ""STC_LOY_DEFAULT"", ""STC LOY Accrual Expired Points2"");
		vAtbDef = TheApplication().InvokeMethod(""LookupValue"", ""STC_LOY_DEFAULT"", ""STC LOY Attrib Definition Points2"");
		vProdIdSCB = TheApplication().InvokeMethod(""LookupValue"", ""STC_LOY_DEFAULT"", ""STC LOY Accrual Expired Points SCB"");
		vAtbDefSCB = TheApplication().InvokeMethod(""LookupValue"", ""STC_LOY_DEFAULT"", ""Point Type 3"");
		
		if (vMemberId != null && vMemberId != """")
		{
			if (vExpPts > 0 && vProdId != """" && vAtbDef != """")
			{
				RedeemExpiredPoints(vMemberId, vProdId, vExpPts, vTodayCalc, vAtbDef);
			}
			
			if (vExpPtsSCB > 0 && vProdIdSCB != """" && vAtbDefSCB != """")
			{
				RedeemExpiredPoints(vMemberId, vProdIdSCB, vExpPtsSCB, vTodayCalc, vAtbDefSCB);
			}
		} //end of if (vMemberId != null
	}
	catch(e)  
	{
		throw(e);	
	}
	finally
	{
	}	
return(CancelOperation); 
}
function BatchProcessExpiredPoints(Inputs, Outputs)
{
	try
	{
		var vMemberId = """", vExpPts = 0, vProdId = """", vTodayCalc, vAtbDef = """";
		var vExpPtsSCB = 0, vProdIdSCB = """", vAtbDefSCB = """";
		var vExpPtsSTCPay = 0, vProdIdSTCPay = """", vAtbDefSTCPay = """";
		with(Inputs){
			vMemberId = GetProperty(""MEMBER_ID"");
			vExpPts = ToNumber(GetProperty(""ACCRUALED_SUM""));
			vExpPtsSCB = ToNumber(GetProperty(""SCB_EXPIRY_POINTS""));
			vTodayCalc = GetProperty(""Date_TODAY"");
			vExpPtsSTCPay = ToNumber(GetProperty(""STCPAY_EXPIRY_POINTS""));
		}
		vProdId  = TheApplication().InvokeMethod(""LookupValue"", ""STC_LOY_DEFAULT"", ""STC LOY Accrual Expired Points2"");
		vAtbDef = TheApplication().InvokeMethod(""LookupValue"", ""STC_LOY_DEFAULT"", ""STC LOY Attrib Definition Points2"");
		vProdIdSCB = TheApplication().InvokeMethod(""LookupValue"", ""STC_LOY_DEFAULT"", ""STC LOY Accrual Expired Points SCB"");
		vAtbDefSCB = TheApplication().InvokeMethod(""LookupValue"", ""STC_LOY_DEFAULT"", ""Point Type 3"");
		vProdIdSTCPay = TheApplication().InvokeMethod(""LookupValue"", ""STC_LOY_DEFAULT"", ""STC LOY Accrual Expired Points stcPay"");
		vAtbDefSTCPay = TheApplication().InvokeMethod(""LookupValue"", ""STC_LOY_DEFAULT"", ""Point Type 4"");

		if (vMemberId != null && vMemberId != """")
		{
			if (vExpPts > 0 && vProdId != """" && vAtbDef != """")
			{
				RedeemExpiredPoints(vMemberId, vProdId, vExpPts, vTodayCalc, vAtbDef);
			}
			
			if (vExpPtsSCB > 0 && vProdIdSCB != """" && vAtbDefSCB != """")
			{
				RedeemExpiredPoints(vMemberId, vProdIdSCB, vExpPtsSCB, vTodayCalc, vAtbDefSCB);
			}
			if (vExpPtsSTCPay > 0 && vProdIdSTCPay != """" && vAtbDefSTCPay != """")
			{
				RedeemExpiredPoints(vMemberId, vProdIdSTCPay, vExpPtsSTCPay, vTodayCalc, vAtbDefSTCPay);
			}
		} //end of if (vMemberId != null
	}
	catch(e)  
	{
		throw(e);	
	}
	finally
	{
	}	
return(CancelOperation); 
}
function ProcessExpiredPoints(Inputs, Outputs)
{
try
{
    var vAppObj = TheApplication();
	var vBusObj = vAppObj.GetBusObject(""LOY Member"");
	//var vLOYTranBC = vBusObj.GetBusComp(""LOY Transaction"");
	var vEBC = vBusObj.GetBusComp(""STC LOY Expired Pts2 EBC"");
	var inPs = vAppObj.NewPropertySet();
	var outPs = vAppObj.NewPropertySet();
	var vMemberId, vExpPts, isRec, svcBS, searchSpec,vProdId,vCalc,vAtbDef;
	
    vEBC.SetViewMode(AllView);	
    vEBC.ClearToQuery();
    vEBC.ActivateField(""MEMBER_ID""); 
	vEBC.ActivateField(""ACCRUALED_SUM"");
	vEBC.ActivateField(""Calc Today"");
	vEBC.ExecuteQuery(ForwardOnly);

	isRec = vEBC.FirstRecord();
	while(isRec)
	{	  
	  try
	  {
		   //Get expired points for each member 
		   vMemberId = vEBC.GetFieldValue(""MEMBER_ID"");
		   vExpPts = vEBC.GetFieldValue(""ACCRUALED_SUM"");
		   vCalc = vEBC.GetFieldValue(""Calc Today"");
		   vProdId  = vAppObj.InvokeMethod(""LookupValue"", ""STC_LOY_DEFAULT"", ""STC LOY Accrual Expired Points2"");
		   vAtbDef = vAppObj.InvokeMethod(""LookupValue"", ""STC_LOY_DEFAULT"", ""STC LOY Attrib Definition Points2"");
		   //create transaction for redemption
		   svcBS = vAppObj.GetService(""STC LOY Generic BS""); 
		   inPs.SetProperty(""Member Id"",vMemberId);
	       inPs.SetProperty(""Product Id"",vProdId);
	       inPs.SetProperty(""Points"",vExpPts);
	       inPs.SetProperty(""Transaction Type"", ""Redemption"");
	       svcBS.InvokeMethod(""CreateTransaction"",inPs,outPs);
	        var vTxnId = outPs.GetProperty(""Transaction Id"");
	       	// code set flag true for processed records
	        svcBS = null;
			inPs = vAppObj.NewPropertySet();
			outPs =vAppObj.NewPropertySet();
			inPs.SetProperty(""boName"",""LOY Member"");
			inPs.SetProperty(""bcName"",""LOY Transaction Accrual Item"");
			inPs.SetProperty(""SearchExpr"", ""[Member Id] = '"" + vMemberId + ""' AND [Expiration Date]< '"" + vCalc +""' AND [Attribute Definition Id] = '""+ vAtbDef +""' AND [Expiry Redemp Flag] = 'N'"");
			inPs.SetProperty(""FieldName0"",""Expiry Redemp Flag"");
			inPs.SetProperty(""FieldValue0"",""Y"");
			fn_SetFieldValues(inPs,outPs);
			//isRec = vEBC.NextRecord();
			// code for changing Transaction BC status to Acceptable
			svcBS = null;
			inPs = vAppObj.NewPropertySet();
			outPs =vAppObj.NewPropertySet();
			inPs.SetProperty(""boName"",""LOY Member"");
			inPs.SetProperty(""bcName"",""LOY Transaction"");
			inPs.SetProperty(""SearchExpr"", ""[Id] = '"" + vTxnId + ""'"") 
			inPs.SetProperty(""FieldName0"",""Status"");
			inPs.SetProperty(""FieldValue0"",""Acceptable"");
			fn_SetFieldValues(inPs,outPs);
			
			// Run Transaction Process Engine
			svcBS = null;
			inPs = vAppObj.NewPropertySet();
			outPs =vAppObj.NewPropertySet();	
			svcBS = vAppObj.GetService(""LOY Processing Engine""); 
			inPs.SetProperty(""ObjectType"", ""Transaction"");
			inPs.SetProperty(""RowId"", vTxnId);	
			svcBS.InvokeMethod(""ProcessObject"",inPs,outPs);	
		}
		catch(e)
		{
		}
		finally
		{
			isRec = vEBC.NextRecord();
		}
	}
 }
 catch(e)  
{
	throw(e);	
}
finally
{
	vEBC = null;
    //vLOYTranBC = null;
	vBusObj = null;
	inPs = null;
	outPs = null;
	svcBS = null;
}	
return(CancelOperation); 
}
function RedeemExpiredPoints(vMemberId, vProdId, vExpPts, vTodayCalc, vAtbDef)
{//[NAVIN:07Aug2019:SCB_Enhancements_SCBCoBrandedCreditCard]
	try
	{
		var vBusObj = TheApplication().GetBusObject(""LOY Member"");
		//var vEBC = vBusObj.GetBusComp(""STC LOY Expired Pts2 EBC"");
		var isRec = false, svcBS = null, inPs = null, outPs = null, searchSpec = """";
		var vExpPtsSCB = 0, vProdIdSCB = """", vAtbDefSCB = """", vTxnId = """";
		
		svcBS = TheApplication().GetService(""STC LOY Generic BS"");
		inPs = TheApplication().NewPropertySet();
		outPs = TheApplication().NewPropertySet();
		with(inPs){
			SetProperty(""Member Id"",vMemberId);
			SetProperty(""Product Id"",vProdId);
			SetProperty(""Points"",vExpPts);
			SetProperty(""Transaction Type"", ""Redemption"");
		}
		svcBS.InvokeMethod(""CreateTransaction"",inPs,outPs);
		vTxnId = outPs.GetProperty(""Transaction Id"");
		svcBS = null;
		
		inPs = TheApplication().NewPropertySet();
		outPs =TheApplication().NewPropertySet();
		with(inPs){
			SetProperty(""boName"",""LOY Member"");
			SetProperty(""bcName"",""LOY Transaction Accrual Item"");
			SetProperty(""SearchExpr"", ""[Member Id] = '"" + vMemberId + ""' AND [Expiration Date]< '"" + vTodayCalc +""' AND [Attribute Definition Id] = '""+ vAtbDef +""' AND [Expiry Redemp Flag] = 'N'"");
			SetProperty(""FieldName0"",""Expiry Redemp Flag"");
			SetProperty(""FieldValue0"",""Y"");
		}
		fn_SetFieldValues(inPs, outPs);

		svcBS = null;
		inPs = TheApplication().NewPropertySet();
		outPs =TheApplication().NewPropertySet();
		with(inPs){
			SetProperty(""boName"",""LOY Member"");
			SetProperty(""bcName"",""LOY Transaction"");
			SetProperty(""SearchExpr"", ""[Id] = '"" + vTxnId + ""'"") 
			SetProperty(""FieldName0"",""Status"");
			SetProperty(""FieldValue0"",""Acceptable"");
		}
		fn_SetFieldValues(inPs, outPs);


		svcBS = null;
		inPs = TheApplication().NewPropertySet();
		outPs =TheApplication().NewPropertySet();	
		svcBS = TheApplication().GetService(""LOY Processing Engine""); 
		with(inPs){
			SetProperty(""ObjectType"", ""Transaction"");
			SetProperty(""RowId"", vTxnId);
		}
		svcBS.InvokeMethod(""ProcessObject"",inPs,outPs);
	}
	catch(e)
	{}
	finally
	{
		inPs = null; outPs = null;
		svcBS = null;
		vBusObj = null;
	}
	return(CancelOperation);
}
"
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
  	var vReturn = ContinueOperation;
	switch (MethodName)
	{
		case ""ProcessExpiredPoints"":
			ProcessExpiredPoints(Inputs,Outputs);
			vReturn = CancelOperation;
			break;
		case "fn_SetFieldValues"":
			fn_SetFieldValues(Inputs,Outputs);
			vReturn = CancelOperation;
			break;
		case ""BatchProcessExpiredPoints"":
			BatchProcessExpiredPoints(Inputs,Outputs);
			vReturn = CancelOperation;
			break;
		default:
			vReturn = ContinueOperation;
			break;
	}
	return (vReturn);
}
function fn_SetFieldValues(Inputs, Outputs)
{
	var i = 0, sSearchExpr = """",bo = null,bc = null,sFieldCount = 0, isRec = """";
	try
	{
		sSearchExpr = Inputs.GetProperty(""SearchExpr"");
		bo = TheApplication().GetBusObject(Inputs.GetProperty(""boName""));
		bc = bo.GetBusComp(Inputs.GetProperty(""bcName""));
		with (bc)
		{
			SetViewMode(AllView);
			for (i = 0; ; i++)
			{
				var sFieldName = Inputs.GetProperty(""FieldName"" + i);
				if (sFieldName != """")
					ActivateField(sFieldName);
				else
				{
					sFieldCount = i;
					break;
				}
			}
			ClearToQuery();
			SetSearchExpr(sSearchExpr);
			ExecuteQuery(ForwardOnly);
			isRec = FirstRecord();
			while (isRec)
			{
				for (i = 0; i < sFieldCount; i++)
				SetFieldValue(Inputs.GetProperty(""FieldName"" + i), Inputs.GetProperty(""FieldValue"" + i));
				WriteRecord();
				isRec = NextRecord();
			}
		}
	}
	catch(e)
	{
			throw (e);
	}
	finally
	{
		bc = null;
		bo = null;
	}
	return(CancelOperation);
}
function CreateEnrollmentInput(Inputs, Outputs)
{
	try
	{	
		var objAppln, objAccntBusObj, objAccntBusComp, objConBusComp, objAddrBusComp;
		var vMSISDN="""", MemberType="""", AccrualType="""", vName="""",EnChnl="""", EnrollmentType="""", ProgramName="""", vAccntId="""" ;  // Member Attribute Variables
		var vTitle="""", vGender="""", vFirstName="""", vMiddleName="""", vLastName="""", vDateofBirth="""", vEmailAddress="""", vContactId="""", vWorkPhNum="""", vIdType="""", vIdNum=""""; //Contact Attribute Variables
		var vApptNum="""", vBuildingNo="""", vRoadNo="""", vBlockNo="""", vGovernorate="""", vPostalCode="""", vCity="""", vCountry="""", vAddrId=""""; // Address Attribute Varibles
		
		var inServiceAccntId, vCustAccntId="""";
		
		inServiceAccntId = Inputs.GetProperty(""ServiceAccntId"");
		
		objAppln = TheApplication();
		objAccntBusComp = objAppln.GetBusObject(""Account"").GetBusComp(""Account"");
		objConBusComp = objAppln.GetBusObject(""Contact"").GetBusComp(""Contact"");
		objAddrBusComp = objAppln.GetBusObject(""CUT Address"").GetBusComp(""CUT Address"");
		
				
		/**************************** Get Fix Values ******************************/
		MemberType = objAppln.InvokeMethod(""LookupValue"", ""LOY_MEM_TYPE"", ""Individual"");
		AccrualType = objAppln.InvokeMethod(""LookupValue"", ""LOY_CORP_ACCR_TYPE"", ""Individual Only"");
		
		if( Inputs.PropertyExists(""Program Name"") && Inputs.GetProperty(""Program Name"") != """" )
			ProgramName = Inputs.GetProperty(""Program Name"");
		else
			ProgramName = objAppln.InvokeMethod(""LookupValue"", ""STC_LOY_DEFAULT"", ""DEFAULT_PROGRAM_NAME"");
		
		if( Inputs.PropertyExists(""Enroll Chanel"") && Inputs.GetProperty(""Enroll Chanel"") != """" )
			EnChnl = Inputs.GetProperty(""Enroll Chanel"");
		else
			EnChnl = objAppln.InvokeMethod(""LookupValue"", ""LOY_TXN_CHNNL_CD"", ""Manual Registration""); 
		
		/**************************** Get Account Details ******************************/
		with(objAccntBusComp)
		{
			ActivateField(""Primary Contact Id"");
			ActivateField(""Primary Address Id"");
			ActivateField(""Master Account Id"");
			ActivateField(""Name"");
			ActivateField(""DUNS Number"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Id"", inServiceAccntId );
			ExecuteQuery(ForwardOnly);
			if( FirstRecord() )
			{
				vContactId	= GetFieldValue(""Primary Contact Id"");
				vCustAccntId	= GetFieldValue(""Master Account Id"");
				vAddrId		= GetFieldValue(""Primary Address Id"");
				vAccntId = GetFieldValue(""Id""); 	// // 
				vName	 = GetFieldValue(""Name""); 	// //
				vMSISDN	 = GetFieldValue(""DUNS Number""); // //
			}
		}
		/**************************** Get ID Details ******************************/
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
				vIdType = GetFieldValue(""Survey Type"");		// //
				vIdNum  = GetFieldValue(""Tax ID Number"");	// //
			}
		}
		objAccntBusComp = null;
		
		/**************************** Get Contact Details ******************************/
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
			ActivateField(""STC ID Type"");
			ActivateField(""STC ID #"");
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec(""Id"", vContactId );
			ExecuteQuery(ForwardOnly);
			if( FirstRecord())
			{
				vTitle 		= GetFieldValue(""M/M"") ;			// //
				vGender 	= GetFieldValue(""M/F"") ;			// //
				vFirstName 	= GetFieldValue(""First Name"") ;     // //
				vMiddleName	= GetFieldValue(""Middle Name"") ;    // //
				vLastName	= GetFieldValue(""Last Name"") ;  	// //
				vDateofBirth = GetFieldValue(""Date of Birth"") ; // //
				vEmailAddress = GetFieldValue(""Email Address"") ; // //
				vWorkPhNum = GetFieldValue(""Work Phone #"") ;	// //
			}
		}
		objConBusComp=null;
		
		/**************************** Get Address Details ******************************/
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
				vApptNum = GetFieldValue(""Apartment Number"") ;
				vBuildingNo = GetFieldValue(""Building No"") ;
				vRoadNo		= GetFieldValue(""STC Road No"") ;
				vBlockNo	= GetFieldValue(""Block No"") ; 
				vPostalCode	= GetFieldValue(""Postal Code"");
				vGovernorate = GetFieldValue(""State"") ;
				vCity		= GetFieldValue(""City"") ;
				vCountry	= ""Bahrain"" ;
			}
		}
		objAddrBusComp=null;
		
		/**************************** Set Output ******************************/
		var Address = objAppln.NewPropertySet();
		var Contact = objAppln.NewPropertySet();
		var Member = objAppln.NewPropertySet();
		
		/**************************** Set Address Hierarchy ******************************/
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
		Outputs.AddChild(Address);
		
		/**************************** Set Contact Hierarchy ******************************/
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
		Outputs.AddChild(Contact);
		
		/**************************** Set Member Hierarchy ******************************/
		Member.SetProperty(""MSISDN"", vMSISDN );
		Member.SetProperty(""Member Type"", MemberType );
		Member.SetProperty(""Accrual Type"", AccrualType );
		Member.SetProperty(""Name"", vName );
		Member.SetProperty(""Enroll Channel"", EnChnl );
		Member.SetProperty(""Program Name"", ProgramName );
		Member.SetProperty(""Account Id"", vAccntId );
		Member.SetType(""Member"");
		Outputs.AddChild(Member);
		Outputs.SetProperty(""ReturnCode"", ""0"");	
	}
	catch(e)
	{
		Outputs.SetProperty(""ReturnCode"", ""1"");
	}
	finally
	{
		objAppln=null, objAccntBusObj=null, objAccntBusComp=null, objConBusComp=null, objAddrBusComp=null;
	}
	return (CancelOperation);
}
function EnrollRequest(Inputs, Outputs)
{
	try
	{
		var propLoyMember, propContact, propAddr, chdPropSet;
		var objAppln, objLoyBusObj, objLoyBusComp, objConBusComp, objAddrBusComp, objPickBusComp;
		var i=0;
		var ContactId, AddressId;
		var MemberId 		= """";
		var MemberNumber	= """";
		var ErrorMsg		= """";
		var ErrorCd 		= """";
		var SuccessCode		= ""1"";
		 
		objAppln 		= TheApplication();
		objLoyBusObj	= objAppln.GetBusObject(""LOY Member"");
		objLoyBusComp	= objLoyBusObj.GetBusComp(""LOY Member"");
		objConBusComp	= objLoyBusObj.GetBusComp(""Contact"");
		objAddrBusComp	= objLoyBusObj.GetBusComp(""Personal Address"");
		
		chdPropSet		= objAppln.NewPropertySet();
		propLoyMember	= objAppln.NewPropertySet();
		propContact		= objAppln.NewPropertySet();
		propAddr		= objAppln.NewPropertySet();
		
		for( i=0; i< Inputs.GetChildCount(); i++)
		{
			chdPropSet = Inputs.GetChild(i);
			if( chdPropSet.GetType() == ""Member"" )
				propLoyMember = Inputs.GetChild(i);
			else if( chdPropSet.GetType() == ""Contact"" )
				propContact = Inputs.GetChild(i);
			else if( chdPropSet.GetType() == ""Address"" )
				propAddr = Inputs.GetChild(i);	
		}
		
		/*******************Start: Create Loyalty Member *******************/
		with(objLoyBusComp)
		{
			objAppln.SetProfileAttr(""IsBS"", ""Y"");
			ActivateField(""Member Number"");
			NewRecord(NewAfter);
			SetFieldValue(""MSISDN"", 	  		propLoyMember.GetProperty(""MSISDN"") );
			SetFieldValue(""Member Type"",  		propLoyMember.GetProperty(""Member Type"") );
			SetFieldValue(""Accrual Type"", 		propLoyMember.GetProperty(""Accrual Type"") );
			SetFieldValue(""Name"", 				propLoyMember.GetProperty(""Name"") );
			SetFieldValue(""Enrollment Channel"", propLoyMember.GetProperty(""Enroll Channel""));
			
			objPickBusComp = GetPicklistBusComp(""SHM Program Name"");
			with(objPickBusComp)
			{
				ActivateField(""Name"");
				SetViewMode(AllView);
				ClearToQuery();
				if( propLoyMember.PropertyExists(""Program Name"") )
					SetSearchSpec(""Name"", propLoyMember.GetProperty(""Program Name"") );
				else
					SetSearchSpec(""Id"", propLoyMember.GetProperty(""Program Id"") );
					
				ExecuteQuery(ForwardOnly);
				if( FirstRecord() )
				{
					Pick();
				}
			}
			objPickBusComp = GetPicklistBusComp(""Account Name"");
			with(objPickBusComp)
			{
				SetViewMode(AllView);
				ClearToQuery(); 
				SetSearchSpec(""Id"", propLoyMember.GetProperty(""Account Id""));
				ExecuteQuery(ForwardOnly);
				if( FirstRecord() )
				{
					Pick();
				}
			}
			/*******************Start: Create Loyalty Contact *******************/
			with(objConBusComp)
			{
				NewRecord(NewAfter);
				SetFieldValue(""M/M"", propContact.GetProperty(""Title"") );
				SetFieldValue(""M/F"", propContact.GetProperty(""Gender"") );
				SetFieldValue(""First Name"", propContact.GetProperty(""First Name"") );
				SetFieldValue(""Middle Name"", propContact.GetProperty(""Middle Name"") );
				SetFieldValue(""Last Name"", propContact.GetProperty(""Last Name"") );
				SetFieldValue(""Birth Date"", propContact.GetProperty(""Date of Birth"") );
				SetFieldValue(""Email Address"", propContact.GetProperty(""Email Address"") );
				SetFieldValue(""Cellular Phone #"", propLoyMember.GetProperty(""MSISDN"") );
				
				//SetFieldValue(""Work Phone #"", propContact.GetProperty(""Work Phone"") );
				var sWorkPhNo = propContact.GetProperty(""Work Phone"");
				if (sWorkPhNo == null || sWorkPhNo == """")
					sWorkPhNo = propLoyMember.GetProperty(""MSISDN"");
				SetFieldValue(""Work Phone #"", sWorkPhNo);
				
				SetFieldValue(""STC ID Type"", propContact.GetProperty(""ID Type"") );
				SetFieldValue(""STC ID #"", propContact.GetProperty(""ID Number"") );
				/*******************Start: Create Loyalty Address *******************/
				with(objAddrBusComp)
				{
					NewRecord(NewAfter);
					SetFieldValue(""Apartment Number"", propAddr.GetProperty(""Apartment Number"") );
					SetFieldValue(""Street Address"", propAddr.GetProperty(""Building No"") );
					SetFieldValue(""Street Address 5"", propAddr.GetProperty(""Road No"") );
					SetFieldValue(""Street Address 2"", propAddr.GetProperty(""Block No"") );
					SetFieldValue(""State"", propAddr.GetProperty(""Governorate"") );
					SetFieldValue(""Postal Code"", propAddr.GetProperty(""Postal Code"") );
					SetFieldValue(""City"", propAddr.GetProperty(""City"") );
					SetFieldValue(""Country"", propAddr.GetProperty(""Country"") );
					WriteRecord();
					AddressId = GetFieldValue(""Id"");
				}
				/*******************End: Create Loyalty Address *******************/	
				SetFieldValue(""Primary Personal Address Id"", AddressId);
				WriteRecord();
				ContactId = GetFieldValue(""Id"");
			}
			/*******************End: Create Loyalty Contact *******************/
			SetFieldValue(""Primary Contact Id"", ContactId );
			SetFieldValue(""Primary Address Id"", AddressId );
			WriteRecord();
			MemberId = GetFieldValue(""Id"");
			MemberNumber = GetFieldValue(""Member Number"");
		}
		/*******************Start: Create Loyalty Member *******************/
		SuccessCode = ""0"";
	}
	catch(e)
	{
		ErrorMsg = e.errText;
		ErrorCd  = e.errCode;
		SuccessCode = ""1"";
	}
	finally
	{
		objAppln.SetProfileAttr(""IsBS"", ""N"");
		Outputs.SetProperty(""MemberNumber"", MemberNumber);
		Outputs.SetProperty(""MemberId"", MemberId);
		Outputs.SetProperty(""Error Message"", ErrorMsg);
		Outputs.SetProperty(""Error Code"", ErrorCd);
		Outputs.SetProperty(""SuccessCode"", SuccessCode);
		objAppln=null;
		objLoyBusObj=null;
		objLoyBusComp=null;
		objConBusComp=null;
		objAddrBusComp=null;
		objPickBusComp=null;	
	}	
	return(CancelOperation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	try
	{
		switch(MethodName)
		{
			case ""EnrollRequest"" :
					EnrollRequest(Inputs, Outputs);	
					break;
			case ""CreateRedemptionTransaction"":
					fn_CreateRedemptionTransaction(Inputs, Outputs);
					break;
			case ""CreateTransaction"":
					fn_CreateTransaction(Inputs, Outputs);
					break;
			case ""CreateEnrollmentInput"":
					CreateEnrollmentInput(Inputs, Outputs);
					break;
			case ""SetTierEndDate"":
					fn_SetTierEndDate(Inputs, Outputs);
					break;
			case ""CreateAccrualTransactionSimple"":
					fn_CreateAccrualTransactionSimple(Inputs, Outputs);
					break;
		}
	}
	catch(e)
	{
		throw(e);
	}
	return (CancelOperation);
}
function fn_CreateAccrualTransactionSimple(Inputs, Outputs)
{
	try
	{
		var vMemberId, vProdId, vTransactionId="""";
		var vTransType, vTransSubType;
		var objAppln, objMemberBusObj, objMemberBusComp, objTransBusComp, objPickBusComp;
		var outErrorCd="""",outErrorMsg="""";
		
		vMemberId 	= Inputs.GetProperty(""Member Id"");
		vProdId		= Inputs.GetProperty(""Product Id"");
		
		objAppln = TheApplication();
		objMemberBusObj = objAppln.GetBusObject(""LOY Member"");
		objMemberBusComp = objMemberBusObj.GetBusComp(""LOY Member"");
		objTransBusComp  = objMemberBusObj.GetBusComp(""LOY Transaction"");
		
		vTransType 		= objAppln.InvokeMethod(""LookupValue"", ""LOY_TXN_TYPE_CD"", ""ACCRUAL"");
		vTransSubType 	= objAppln.InvokeMethod(""LookupValue"", ""LOY_TXN_SUB_TYPE_CD"", ""Product"");
		
		with(objMemberBusComp)
		{
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec( ""Id"", vMemberId );
			ExecuteQuery(ForwardOnly);
			if( FirstRecord() )
			{
				with(objTransBusComp)
				{
					ActivateField(""Product Name"");
					NewRecord(NewAfter);
					SetFieldValue(""Transaction Type"", vTransType );
					SetFieldValue(""Transaction Sub Type"", vTransSubType);
					objPickBusComp = GetPicklistBusComp(""Product Name"");
					with(objPickBusComp)
					{
						SetViewMode(AllView);
						ClearToQuery();
						SetSearchSpec( ""Id"", vProdId );
						ExecuteQuery(ForwardOnly);
						if( FirstRecord() )
						{
							Pick();
						}
					}
					SetFieldValue(""External"", ""Y"");
					WriteRecord();
					vTransactionId = GetFieldValue(""Id"");
				}
			}
		}
		
	}
	catch(e)
	{
		outErrorCd=e.errCode;
		outErrorMsg=e.errText;
	}
	finally
	{
		objPickBusComp = null;
		objTransBusComp = null;
		objMemberBusComp = null;
		objMemberBusObj = null;
		objAppln = null;
		Outputs.SetProperty(""Transaction Id"", vTransactionId);
		Outputs.SetProperty(""Error Code"", outErrorCd);
		Outputs.SetProperty(""Error Message"", outErrorMsg);
		
	}
	return (CancelOperation);
}
function fn_CreateRedemptionTransaction(Inputs, Outputs)
{
	try
	{
		var vMemberId, vProdId, vTransactionId="""";
		//[03Apr2016][NAVINR][Viva Loyalty Air Miles Program]
		var vRedeemPoints=0, vPartnerName="""", vPartnerId="""", vPointTypeId="""";//[NAVIN:28Oct2018:SCB_Changes]
		var vTransType, vTransSubType;
		var objAppln, objMemberBusObj, objMemberBusComp, objTransBusComp, objPickBusComp;
		var outErrorCd="""",outErrorMsg="""";
		
		with(Inputs)
		{//[NAVIN:28Oct2018:SCB_Changes]
			vMemberId 	= GetProperty(""Member Id"");
			vProdId		= GetProperty(""Product Id"");
			vRedeemPoints  = ToNumber(GetProperty(""RedeemPoints""));
			vPartnerName  = GetProperty(""PartnerName"");
			vPartnerId  = GetProperty(""PartnerId"");
			vPointTypeId = GetProperty(""PointTypeId"");
		}
		
		//objAppln = TheApplication();
		objMemberBusObj = TheApplication().GetBusObject(""LOY Member"");
		objMemberBusComp = objMemberBusObj.GetBusComp(""LOY Member"");
		objTransBusComp  = objMemberBusObj.GetBusComp(""LOY Transaction"");
		
		vTransType 		= TheApplication().InvokeMethod(""LookupValue"", ""LOY_TXN_TYPE_CD"", ""REDEMPTION"");
		vTransSubType 	= TheApplication().InvokeMethod(""LookupValue"", ""LOY_TXN_SUB_TYPE_CD"", ""Product"");
		
		with(objMemberBusComp)
		{
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec( ""Id"", vMemberId );
			ExecuteQuery(ForwardOnly);
			if( FirstRecord() )
			{
				with(objTransBusComp)
				{
					ActivateField(""Product Name"");
					ActivateField(""Partner Id"");
					ActivateField(""Partner Name"");
					ActivateField(""Points"");
					ActivateField(""Point Id"");//[NAVIN:28Oct2018:SCB_Changes]
					
					NewRecord(NewAfter);
					SetFieldValue(""Transaction Type"", vTransType );
					SetFieldValue(""Transaction Sub Type"", vTransSubType);
					objPickBusComp = GetPicklistBusComp(""Product Name"");
					with(objPickBusComp)
					{
						SetViewMode(AllView);
						ClearToQuery();
						SetSearchSpec( ""Id"", vProdId );
						ExecuteQuery(ForwardOnly);
						if( FirstRecord() )
						{
							Pick();
						}
					}
					
					if (vPartnerId != """" && vPartnerId != null)
						SetFieldValue(""Partner Id"", vPartnerId);
					
	 				if (vPartnerName != """" && vPartnerName != null)
						SetFieldValue(""Partner Name"", vPartnerName);
						
					if (vRedeemPoints > 0 && vRedeemPoints != """" && vRedeemPoints != null)
					{
						SetFieldValue(""Points"", vRedeemPoints);
	 				}
					if (vPointTypeId != """" && vPointTypeId != null)
					{//[NAVIN:28Oct2018:SCB_Changes]
						SetFieldValue(""Point Id"", vPointTypeId);
	 				}
					
					WriteRecord();
					vTransactionId = GetFieldValue(""Id"");
				}
			}
		}
		
	}
	catch(e)
	{
		outErrorCd=e.errCode;
		outErrorMsg=e.errText;
	}
	finally
	{
		objPickBusComp = null;
		objTransBusComp = null;
		objMemberBusComp = null;
		objMemberBusObj = null;
		objAppln = null;
		with(Outputs){
			SetProperty(""Transaction Id"", vTransactionId);
			SetProperty(""Error Code"", outErrorCd);
			SetProperty(""Error Message"", outErrorMsg);
		}
	}
	return (CancelOperation);
}
function fn_CreateTransaction(Inputs, Outputs)
{
	try
	{
		var vMemberId, vProdId, vPoints, vPointType, vTransactionId="""";
		var vTransType, vTransSubType;
		var objAppln, objMemberBusObj, objMemberBusComp, objTransBusComp, objPickBusComp;
		var outErrorCd="""",outErrorMsg="""";
		vMemberId 	= Inputs.GetProperty(""Member Id"");
		vProdId		= Inputs.GetProperty(""Product Id"");
		vPoints		= Inputs.GetProperty(""Points"");
		//vPointType	= Inputs.GetProperty(""Point Type"");
		vTransType	= Inputs.GetProperty(""Transaction Type"");
		
		objAppln = TheApplication();
		objMemberBusObj = objAppln.GetBusObject(""LOY Member"");
		objMemberBusComp = objMemberBusObj.GetBusComp(""LOY Member"");
		objTransBusComp  = objMemberBusObj.GetBusComp(""LOY Transaction"");
		
		//vTransType 		= objAppln.InvokeMethod(""LookupValue"", ""LOY_TXN_TYPE_CD"", ""ACCRUAL"");
		vTransSubType 	= objAppln.InvokeMethod(""LookupValue"", ""LOY_TXN_SUB_TYPE_CD"", ""Product"");
		
		with(objMemberBusComp)
		{
			SetViewMode(AllView);
			ClearToQuery();
			SetSearchSpec( ""Id"", vMemberId );
			ExecuteQuery(ForwardOnly);
			if( FirstRecord() )
			{
				with(objTransBusComp)
				{
					ActivateField(""Product Name"");
					ActivateField(""Point Name"");
					NewRecord(NewAfter);
					SetFieldValue(""Transaction Type"", vTransType );
					SetFieldValue(""Transaction Sub Type"", vTransSubType);
					objPickBusComp = GetPicklistBusComp(""Product Name"");
					with(objPickBusComp)
					{
						SetViewMode(AllView);
						ClearToQuery();
						SetSearchSpec( ""Id"", vProdId );
						ExecuteQuery(ForwardOnly);
						if( FirstRecord() )
						{
							Pick();
						}
					}
					SetFieldValue(""Points"", vPoints );
					/*objPickBusComp = GetPicklistBusComp(""Point Name"");
					with(objPickBusComp)
					{
						ActivateField(""Display Name"");
						SetViewMode(AllView);
						ClearToQuery();
						SetSearchSpec(""Display Name"", vPointType );
						ExecuteQuery(ForwardOnly);
						if( FirstRecord() )
						{
							Pick();
						}
					}*/
					WriteRecord();
					vTransactionId = GetFieldValue(""Id"");
				}
			}
		}
		
	}
	catch(e)
	{
		outErrorCd=e.errCode;
		outErrorMsg=e.toString();
	}
	finally
	{
		objPickBusComp = null;
		objTransBusComp = null;
		objMemberBusComp = null;
		objMemberBusObj = null;
		objAppln = null;
		Outputs.SetProperty(""Transaction Id"", vTransactionId);
		Outputs.SetProperty(""Error Code"", outErrorCd);
		Outputs.SetProperty(""Error Message"", outErrorMsg);
	}
	return (CancelOperation);
}
function fn_SetTierEndDate(Inputs, Outputs)
{
	try
	{
		var inMemberId = Inputs.GetProperty(""Member Id"");
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
		outErrorCd=e.errCode;
		outErrorMsg=e.errText;
	}
	finally
	{
		objAppln.SetProfileAttr(""IsBS"", ""N"");
		Outputs.SetProperty(""Error Code"", outErrorCd );
		Outputs.SetProperty(""Error Message"", outErrorMsg );
		objAppln=null, objLoyMemBusObj=null, objLoyMemBusComp=null, ObjLoyMemTier=null;
	}
	return(CancelOperation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""Resubmit"")
	{
	    Resubmit();
		return(CancelOperation);    
	}
	else
    {    
		return(ContinueOperation);
    }
}
function trim(s) {
var r=/\b(.*)\b/.exec(s);
return (r==null)?"""":r[1];
}




function Resubmit()
{
	var MRowId="""";

	/*	WIPRO-Upgrade-04.05.2016-TSINGHALC - Gets the Filename along with Filepath from LOV Description	*/
	
	var svc = TheApplication().GetService(""STC Get Filename"");
	var Inputs = TheApplication().NewPropertySet();
	var Outputs = TheApplication().NewPropertySet();
	Inputs.SetProperty(""Type"",""STC_FILE_NAME"");
	Inputs.SetProperty(""LIC"",""STC_LTE_UN_PLAN_MIG"");
	svc.InvokeMethod(""STC Get LOV Desc"", Inputs, Outputs);
	var filepath = Outputs.GetProperty(""Description"");
	
	var file = Clib.fopen(filepath, ""rt"");
	
	/* WIPRO-Upgrade-04.05.2016-TSINGHALC - Commented the below line as the filename is received from the above lines by invoking the Generic BS */
	
	//var file=Clib.fopen(""/siebelfs/LTEPLANMigration.csv"", ""rt"");

	if (file==null)
    {
		TheApplication().RaiseErrorText(""Error in opening the file"");
    }
	else
    {
		while(!Clib.feof(file))
        {

			MRowId = (Clib.fgets(file));  
			MRowId = trim(MRowId);

			var MInputs = TheApplication().NewPropertySet();
			var MOutputs = TheApplication().NewPropertySet();

			MInputs.SetProperty(""Object Id"",MRowId);    

			MInputs.SetProperty(""ProcessName"",""STC LTE Migration Main Workflow"");

			var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager"");

			MWorkflowProc.InvokeMethod(""RunProcess"", MInputs, MOutputs);


        }
    }
	MWorkflowProc=null;
	MOutputs=null;
	MInputs=null;
	MRowId=null;
	file = null;
	filepath = null;
	Outputs = null;
	Inputs = null;
	svc = null;

}
function LogException(e)
{
	var appObj;
  	var psInput;
  	var psOutput;
  	var bsErrorHandler; 
	try
 	{
		  appObj = TheApplication();
		  with(appObj)
		  {
			  psInput = NewPropertySet();
			  psOutput = NewPropertySet();
			  bsErrorHandler = GetService(""STC Generic Error Handler"");
		  }
		  with(psInput)
		  {
			  SetProperty(""Error Code"", e.errCode);
			  SetProperty(""Error Message"", e.errText);
			  SetProperty(""Object Name"", ""STC Lead BS"");
			  SetProperty(""Object Type"", ""Buisness Service"");
		  }
		  bsErrorHandler.InvokeMethod(""Log Message"", psInput, psOutput);
 	}
 	catch(e)
 	{
  		// do nothing	
 	}
 	finally
 	{
 
		  bsErrorHandler = null;
		  psOutput = null;
		  psInput = null;
		  appObj = null;
 	}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
try
{
	var ireturn;
	
		ireturn = ContinueOperation;
		switch(MethodName)
		{
			case ""ValidateNewCustomerBlacklist"":
				ValidateNewCustomerBlacklist(Inputs, Outputs);		
				ireturn = CancelOperation;
				break;
			
			case ""ValidateLeadPlan"":
				ValidateLeadPlan(Inputs, Outputs);		
				ireturn = CancelOperation;
				break;

			case ""ValidateLeadDevice"":
				ValidateLeadDevice(Inputs, Outputs);		
				ireturn = CancelOperation;
				break;

			case ""ValidateNewCustomerLMRA"":
				ValidateNewCustomerLMRA(Inputs, Outputs);		
				ireturn = CancelOperation;
				break;

			case "fnGetLeadDeviceDI"":
				fnGetLeadDeviceDI(Inputs, Outputs);
				ireturn = CancelOperation;
				break;
					
			default:
				ireturn = ContinueOperation;
		}
		return(ireturn);
	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
		
	}
}
function ValidateLeadDevice(Inputs,Outputs)
{
	try
	{
		var sLeadId = Inputs.GetProperty(""LeadId"");
		var DeviceCount = Inputs.GetProperty(""DeviceCount"");
		var AccountId = Inputs.GetProperty(""AccountId"");
		var RecExist;
		var LeadDeviceCount = 0;
		var DeviceDiff = 0;
		var EligibleDevice = ""Y"";
		var LeadProdBC=TheApplication().GetBusObject(""Lead"").GetBusComp(""Lead Product"");
		with(LeadProdBC)
		{ 
			SetViewMode(AllView);
			ActivateField(""STC Prod Type"");
			ActivateField(""Lead Id""); 
			ActivateField(""STC Smart Device"");
			ClearToQuery();
			var StrSearch = ""[Lead Id] = '"" + sLeadId + ""' AND [STC Prod Type] = 'Equipment' AND [STC Smart Device] = 'Yes'"";  
			SetSearchExpr(StrSearch);    
			ExecuteQuery(ForwardOnly);
			LeadDeviceCount = CountRecords();
			RecExist = FirstRecord();  
			if(RecExist)
			{
				DeviceDiff = ToNumber(DeviceCount) - ToNumber(LeadDeviceCount);
				if(DeviceDiff >= 0)
				{
					EligibleDevice = ""Y"";
				}
				else
				{
					EligibleDevice = ""N"";
				}
			}
		}
		Outputs.SetProperty(""EligibleDevice"", EligibleDevice);
	}
	catch(e)
	{

	}
	finally
	{
	}
}
function ValidateLeadPlan(Inputs,Outputs)
{
	try
	{
		var sLeadId = Inputs.GetProperty(""LeadId"");
		var PrepaidCount = Inputs.GetProperty(""PrepaidCount"");
		var PostpaidCount = Inputs.GetProperty(""PostpaidCount"");
		var DeviceCount = Inputs.GetProperty(""DeviceCount"");
		var RecExist;
		var LeadPrepaidCount = 0;
		var LeadPostpaidCount = 0;
		var PostDiff = 0;
		var PreDiff = 0;
		var EligiblePlan = ""Y"";
		var LeadProdBC=TheApplication().GetBusObject(""Lead"").GetBusComp(""Lead Product"");
		with(LeadProdBC)
		{ 
			SetViewMode(AllView);
			ActivateField(""STC Prod Type"");
			ActivateField(""Lead Id""); 
			ActivateField(""STC Service Type"");
			ClearToQuery();
			var StrSearch1 = ""[Lead Id] = '"" + sLeadId + ""' AND [STC Prod Type] = 'Service Plan' AND ([STC Service Type] = 'Postpaid' OR [STC Service Type] = 'Prepaid')"";  
			SetSearchExpr(StrSearch1);    
			ExecuteQuery(ForwardOnly);
			RecExist = FirstRecord();
			if(RecExist)
			{
				SetViewMode(AllView);
				ActivateField(""STC Prod Type"");
				ActivateField(""Lead Id""); 
				ActivateField(""STC Service Type"");
				ClearToQuery();
				var StrSearch = ""[Lead Id] = '"" + sLeadId + ""' AND [STC Prod Type] = 'Service Plan' AND [STC Service Type] = 'Prepaid'"";  
				SetSearchExpr(StrSearch);    
				ExecuteQuery(ForwardOnly);
				LeadPrepaidCount = CountRecords();
				PreDiff = ToNumber(PrepaidCount) - ToNumber(LeadPrepaidCount);
				PreDiff = ToNumber(PreDiff);
				if(PreDiff >= 0)
				{
					EligiblePlan = ""Y"";
				}
				else
				{
					EligiblePlan = ""N"";
				}
				if(EligiblePlan == ""Y"")
				{
					SetViewMode(AllView);
					ActivateField(""STC Prod Type"");
					ActivateField(""Lead Id""); 
					ActivateField(""STC Service Type"");
					ClearToQuery();
					var StrSearch2 = ""[Lead Id] = '"" + sLeadId + ""' AND [STC Prod Type] = 'Service Plan' AND [STC Service Type] = 'Postpaid'"";  
					SetSearchExpr(StrSearch2);    
					ExecuteQuery(ForwardOnly);
					LeadPostpaidCount = CountRecords();
					PostDiff = ToNumber(PostpaidCount) - ToNumber(LeadPostpaidCount);
					PostDiff = ToNumber(PostDiff);
					if(PostDiff >= 0)
					{
						EligiblePlan = ""Y"";
					}
					else
					{
						EligiblePlan = ""N"";
					}
				}
			}
		}
		Outputs.SetProperty(""EligiblePlan"", EligiblePlan);
	}
	catch(e)
	{

	}
	finally
	{
	}
}
function ValidateNewCustomerBlacklist(Inputs,Outputs)
{
	try
	{
		var vIDType = Inputs.GetProperty(""IDType"");
		var vIDNum = Inputs.GetProperty(""IDNumber"");
		var RecExist;
		var Blacklist = ""N"";
		var CustomBO =	TheApplication().GetBusObject(""STC CPR Black List BO"");
		var CustomBC = CustomBO.GetBusComp(""STC CPR BlackList BC"");
		var CustomBONew = TheApplication().GetBusObject(""STC CPR Black List BO"");
		var CustomBCNew = CustomBONew.GetBusComp(""STC CPR BlackList BC"");
		with(CustomBC)
		{ 
			SetViewMode(AllView);
			ActivateField(""Black List Select Flg"");
			ActivateField(""Black Listed""); 
			ActivateField(""CPR Number"");
			SetSortSpec(""Updated(DESCENDING)"");
			ClearToQuery();
			var StrSearch = ""[CPR Number] = '"" + vIDNum + ""' AND [Black Listed] = 'Blacklisted'"";  
			SetSearchExpr(StrSearch);    
			ExecuteQuery(ForwardOnly); 
			RecExist = FirstRecord();  
			if(RecExist)
			{
				Blacklist = ""Y"";
			}
			else
			{
				Blacklist = ""N"";
			}
		}
		Outputs.SetProperty(""Blacklist"", Blacklist);
	}
	catch(e)
	{

	}
	finally
	{
	}
}
function ValidateNewCustomerLMRA(Inputs,Outputs)
{
	try
	{
		var vIDType = Inputs.GetProperty(""IDType"");
		var vIDNum = Inputs.GetProperty(""IDNumber"");
		var RecExist;
		var CustomBO=	TheApplication().GetBusObject(""STC CPR Black List BO"");
		var CustomBC=CustomBO.GetBusComp(""STC CPR BlackList BC"");
		var CustomBONew=	TheApplication().GetBusObject(""STC CPR Black List BO"");
		var CustomBCNew=CustomBONew.GetBusComp(""STC CPR BlackList BC"");
		var LMRAExit = ""N"";
		with(CustomBC)
		{ 
			SetViewMode(AllView);
			ActivateField(""Black List Select Flg"");
			ActivateField(""Black Listed""); 
			ActivateField(""CPR Number"");
			SetSortSpec(""Updated(DESCENDING)"");
			ClearToQuery();
			var StrSearch = ""[CPR Number] = '"" + vIDNum + ""' AND [STC LMRA Status] = 'Exit' "";  
			SetSearchExpr(StrSearch);    
			ExecuteQuery(ForwardOnly);
			var ActRec = FirstRecord(); 
			if(ActRec)
			{
				LMRAExit = ""Y""
			}
			else
			{
				LMRAExit = ""N"";
			}
		}
		Outputs.SetProperty(""LMRAExit"", LMRAExit);
	}
	catch(e)
	{

	}
	finally
	{
	}
}
function fnGetLeadDeviceDI(Inputs, Outputs)
{
	var sContractDuration, sDeviceName, sDevicePartNum, sLeadPlanType, sChannel, sDeviceContractName ;
	var sCustRRP="""", sAccountId, sDeviceRRP, vXDeviceRRPVal, sSubChannel,sNewCust =""N"";
	var svcBS, DIAmount=0, AdvancePay=0, Upfront=0, Out;
	try
	{
		sContractDuration = Inputs.GetProperty(""ContractDuration"");
		sNewCust = Inputs.GetProperty(""NewCustFlag"");
		sDeviceName = Inputs.GetProperty(""DeviceName"");
		sDevicePartNum = Inputs.GetProperty(""DevicePartNum"");
		sLeadPlanType = Inputs.GetProperty(""LeadPlanType"");
		sDeviceContractName = Inputs.GetProperty(""DeviceContractName""); //STC_GEN_CONTRACT, STC_LEAD_PLAN_CONTRACT
		sAccountId = Inputs.GetProperty(""AccountId""); 
		sChannel = TheApplication().GetProfileAttr(""STC Shop ID"");
		sSubChannel = TheApplication().GetProfileAttr(""STC Shop Sub Channel"");
		
		TheApplication().SetProfileAttr(""CatalogPlanLevel"",""Low"");
		TheApplication().SetProfileAttr(""CatalogChannel"", sChannel);
		TheApplication().SetProfileAttr(""CatalogDevice"", sDeviceName);
		TheApplication().SetProfileAttr(""CatalogPlanCat"", sLeadPlanType);
		TheApplication().SetProfileAttr(""AttribCatProd"", sLeadPlanType);
		TheApplication().SetProfileAttr(""CatalogContract"", sDeviceContractName);
		TheApplication().SetProfileAttr(""CatalogContDuration"", sContractDuration);
		TheApplication().SetProfileAttr(""STCShopSubChannelUI"", sSubChannel);

		svcBS = TheApplication().GetService(""STC Search Dynamic Price BS"");
		svcBS.InvokeMethod(""Query"", Inputs, Outputs);
	
		if(Outputs.GetChildCount() > 0)
		{
			for(var i=0; i<Outputs.GetChildCount(); i++)
			{
				Out = Outputs.GetChild(i);
				DIAmount = Out.GetProperty(""DI Amount"");
				if(DIAmount != null && DIAmount != """")
					break;
			}//for i
		}
		else
		{
			TheApplication().RaiseErrorText(""Please Select Some Other Device"");
		}
		if (sNewCust == ""Y"")
		{
			AdvancePay = 1;
		}
		else
		{
				if(sAccountId == null || sAccountId == """")
					TheApplication().RaiseErrorText(""Please associate an Account to this Lead to procedd with Device Eligibility check matrix"");
			
				TheApplication().SetProfileAttr(""STCEligibilityCustomerId"", sAccountId);
				svcBS = null; 
				Out = null;
				svcBS = TheApplication().GetService(""STC Check Customer Eligibility BS"");
				svcBS.InvokeMethod(""Query"",Inputs, Outputs);
				
				for(var j=0; j< Outputs.GetChildCount(); j++)
				{
					vXDeviceRRPVal = TheApplication().InvokeMethod(""LookupValue"",""STC_BR_RULES_DEF"",""X_VALUE_RRP"");
					Out = Outputs.GetChild(j);
					
					if( ToNumber(sCustRRP) < ToNumber(vXDeviceRRPVal))
					{
						sDeviceRRP = Out.GetProperty(""DeviceRRP"");
						if(sDeviceRRP.indexOf(""<"") >= 0)
							AdvancePay = Out.GetProperty(""STCNoOfAdvPayElig"");
					}
					else
					{
						sDeviceRRP = Out.GetProperty(""DeviceRRP"");
						if(sDeviceRRP.indexOf("">"") >= 0)
							AdvancePay = Out.GetProperty(""STCNoOfAdvPayElig"");
					}	//stringVar.substring(start[, end]);  	InStr(str1,str2);
					if(AdvancePay != null && AdvancePay != """")
						break;
				}//for j
			} //else End

	var AdvancePayAmount = ToNumber(AdvancePay)*ToNumber(DIAmount);
	Outputs.Reset();
	Outputs.SetProperty(""DIAmount"", DIAmount);
	Outputs.SetProperty(""AdvancePayTerm"", AdvancePay);
	Outputs.SetProperty(""AdvancePay"", AdvancePayAmount);
	Outputs.SetProperty(""Upfront"", Upfront);

	}
	catch(e)
	{	
		Outputs.SetProperty(""ErrorMsg"", e.toString());
		TheApplication().RaiseErrorText(e.toString());
	}
	finally
	{
	svcBS = null;
	}
}
function FindPortId(Inputs, Outputs)
{
	var RootProdId = Inputs.GetProperty(""Root Product Id"");
	var SelectedProdId;
	var PlanId = Inputs.GetProperty(""PlanId"");
	var DevId = Inputs.GetProperty(""DevId"");
	var ContractId = Inputs.GetProperty(""ContractId"");
	var ProductProdId = Inputs.GetProperty(""ProductId"");
	var PortInfo = TheApplication().NewPropertySet();
	var psPorts    = TheApplication().NewPropertySet();
	var psInputs    = TheApplication().NewPropertySet();
	var psOutputs    = TheApplication().NewPropertySet();
	psPorts = RCOIS_GetAllPorts(RootProdId);
	//var sToPortItemId = GetPortProperty(psPorts,""Port Item Id"",""Product Id"",SelectedProdId);
	if (PlanId != """")
	{
		SelectedProdId = PlanId;
		PortInfo = GetPortProperty(psPorts,""Port Item Id"",""Product Id"",SelectedProdId);
		Outputs.SetProperty(""Plan Port Id"",PortInfo.GetProperty(""Port Item Id""));
		Outputs.SetProperty(""Plan Domain Id"",PortInfo.GetProperty(""Domain Id""));
	}
	if (DevId != """")
	{
		SelectedProdId = DevId;
		PortInfo = GetPortProperty(psPorts,""Port Item Id"",""Product Id"",SelectedProdId);
		Outputs.SetProperty(""Dev Port Id"",PortInfo.GetProperty(""Port Item Id""));
		Outputs.SetProperty(""Dev Domain Id"",PortInfo.GetProperty(""Domain Id""));
	}
	if(ContractId != """")
	{
		SelectedProdId = ContractId;
		PortInfo = GetPortProperty(psPorts,""Port Item Id"",""Product Id"",SelectedProdId);
		if(PortInfo == null || PortInfo == """")
		{
			var psPorts1 = RCOIS_GetAllPorts(DevId);
			PortInfo = GetPortProperty(psPorts1,""Port Item Id"",""Product Id"",SelectedProdId);
		}
		Outputs.SetProperty(""Contract Port Id"",PortInfo.GetProperty(""Port Item Id""));
		Outputs.SetProperty(""Contract Domain Id"",PortInfo.GetProperty(""Domain Id""));
	}
	if(ProductProdId != """")
	{
		SelectedProdId = ProductProdId;
		PortInfo = GetPortProperty(psPorts,""Port Item Id"",""Product Id"",SelectedProdId);
		Outputs.SetProperty(""Product Port Id"",PortInfo.GetProperty(""Port Item Id""));
		Outputs.SetProperty(""Product Domain Id"",PortInfo.GetProperty(""Domain Id""));
	}
	/* PortInfo = GetPortProperty(psPorts,""Port Item Id"",""Product Id"",SelectedProdId);
	Outputs.SetProperty(""Port Id"",PortInfo.GetProperty(""Port Item Id""));
	Outputs.SetProperty(""Domain Id"",PortInfo.GetProperty(""Domain Id""));*/
	//Outputs.SetProperty(""Port Id"",sToPortItemId);
}
function GetPortProperty(psInput,aPropName,aSearchField,aSearchValue)
{

//(psPorts,""Port Item Id"",""Product Id"",SelectedProdId);
 /** Entry point to this function is normal Product Id. **/
 /*
  Port
   Class Id, Class Name, DefCardinality, DefaultPortObject, MaxCardinality, MinCardinality,Name, 
   Port Display Name, Port Item Id
   
   PortObject
    Description, Name, Prod Item Id, Product Id, Version
 
 */
 var returnOutput = TheApplication().NewPropertySet();
 var psPort   = TheApplication().NewPropertySet();
 var psPortObj = TheApplication().NewPropertySet();
 var iGotValue = "false"";

 try {
  for (var l=0;l<psInput.GetChildCount();l++) {
   psPort = psInput.GetChild(l);
   
   for (var i=0;i<psPort.GetChildCount();i++) {
    psPortObj = psPort.GetChild(i);
    if (psPortObj.GetProperty(aSearchField) == aSearchValue) {
     //return(psPortObj.GetProperty(aPropName));
     iGotValue = ""true"";
     break;
    }
   }
   if(""true"" == iGotValue) 
   {
    switch(aPropName) 
    {
    //Find Property Value
     case ""Description"":
     case ""Name"":
     case ""Prod Item Id"":
     case ""Product Id"":
     case ""Version"":
      return(psPortObj.GetProperty(aPropName));//return Domain
     default:
      //return(psPort.GetProperty(aPropName));//return Port
      returnOutput.SetProperty(""Port Item Id"",psPort.GetProperty(aPropName));
      returnOutput.SetProperty(""Domain Id"",psPortObj.GetProperty(""Prod Item Id""));
      return(returnOutput);
  //return Port Id & Domain Id
    }
   }
  }
 } finally {
  psPort   = null;
  psPortObj = null;
 }
 return('');
}
function RCOIS_GetAllPorts(aProductId)
{
 /** Get All the Ports for a Product - 2IT-V1.0 **/
  var psInputs = null;
  var psOutputs  = null;
  var bsRCOIS  = TheApplication().GetService(""Remote Complex Object Instance Service"");
  psInputs = TheApplication().NewPropertySet();
  psOutputs  = TheApplication().NewPropertySet();
  psInputs.SetProperty(""Product Id"",aProductId);
  psInputs.SetProperty(""GetPortDomain"", ""Y"");
  bsRCOIS.InvokeMethod(""GetAllPorts"",psInputs,psOutputs);
  return(psOutputs.Copy());

}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
  var iReturn;
 
 try  
 {
  iReturn = ContinueOperation;
  switch (MethodName)
  {
   case ""FindPortId"":
     FindPortId(Inputs, Outputs);
    iReturn = CancelOperation;
    break;
                    
   default: 
    iReturn = ContinueOperation;
    
  } //switch
  return (iReturn);
 } 
 catch (e)
 { 
  TheApplication().RaiseErrorText(e.toString());
 }

}
function CheckDuplicateMSISDN(vMenaReqId, vMSISDN, vMenaCustType)
{
	var MenaCorpBO=null, MenaDataBC=null;
	var vPendingStatus=""Pending"", vInProgStatus=""In Progress"", vFailedStatus=""FAILED"", vInactiveStatus=""INACTIVE"";
	var vSearchExpr="""", vDuplicateFlag=""FALSE"";

	
	MenaCorpBO = TheApplication().GetBusObject(""STC MENA Corporate Data BO"");
	with(MenaCorpBO)
	{	
		if(vMenaCustType == ""Individual"")
			MenaDataBC = GetBusComp(""STC MENA Individual Data BC"");
		else
			MenaDataBC = GetBusComp(""STC MENA Corporate Data BC"");
	}
	
	with(MenaDataBC)
	{
		SetViewMode(AllView);
		ClearToQuery();
		ActivateField(""MSISDN"");	
		ActivateField(""Status"");
		
		vSearchExpr = ""[MSISDN]='""+vMSISDN+""' AND ([Status] <> '""+vFailedStatus+""' AND [Status] <> '""+vInactiveStatus+""')"";
		SetSearchExpr(vSearchExpr);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			vDuplicateFlag = ""TRUE"";
			return vDuplicateFlag;
		}
		
	}//end of with(MenaDataBC)

	return vDuplicateFlag;
}
"
function CreateBusinessProductsData(vMenaReqId, vMenaCustType, RecArrMulti, RecCount, vFileName)
{//[NAVIN:14Mar2019:BusinessProducts-BulkActivation-P1]

var MenaHeaderBO=null, MenaHeaderBC=null, MenaDataBC=null, MenaProdBC=null;
var vPendingStatus=""Pending"", vInProgStatus=""In Progress"", vImportedStatus=""Imported"", vInactiveStatus=""INACTIVE"";
var psFields = TheApplication().NewPropertySet();
var	PSInputs = TheApplication().NewPropertySet();
var RecDataArr = new Array();
var i=0, RecDataArrLen=0, vReqType="""", vDuplicateFlag=""FALSE"", vDataRecId="""";
var vSearchExpr;

try
{
	MenaHeaderBO = TheApplication().GetBusObject(""STC Business Products Bulk CRM BO"");
	with(MenaHeaderBO)
	{	
		MenaHeaderBC = GetBusComp(""STC MENA Request Header BC"");
		MenaDataBC = GetBusComp(""STC Business Products Bulk Data BC"");
		//MenaProdBC = GetBusComp(""STC MENA Product Data Network BC"");
	}
	with(MenaHeaderBC)
	{
		SetViewMode(AllView);
		ClearToQuery();
		ActivateField(""Status"");
		ActivateField(""Sub-Status"");
		ActivateField(""Request Id"");
		ActivateField(""Description"");
		ActivateField(""Request Type"");

		SetSearchSpec(""Request Id"", vMenaReqId);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			vReqType = GetFieldValue(""Request Type"");
			//[MARK:14Dec2019:BusinessProducts-BulkActivation-P3]
			with(MenaDataBC)
			{
				SetViewMode(AllView);
				ClearToQuery();
				//ActivateField(""Sub-Status"");
				ActivateField(""Parent Request Id"");
				ActivateField(""STC Extraction Type"");
				ActivateField(""Status"");
				ActivateField(""Sub Status"");
				ActivateField(""MSISDN"");
				ActivateField(""MENA Parent CLI ID"");
				ActivateField(""SIM Number"");
				ActivateField(""Donor SIM"");
			//	vSearchExpr = ""[Parent Request Id]='""+vMenaReqId+""' AND ([STC Extraction Type] IS NULL)"";
				vSearchExpr = ""[Parent Request Id]='""+vMenaReqId+""' AND ([STC Extraction Type] IS NULL AND [MSISDN] IS NULL)"";
				SetSearchExpr(vSearchExpr);
				//SetSearchSpec(""Request Id AND [STC Extraction Type] IS NULL"", vMenaReqId);
				ExecuteQuery(ForwardOnly);
			var isRecord = FirstRecord();
				//if (FirstRecord())
				//{
				//SetViewMode(AllView);
				//ClearToQuery();
				//while(i < RecCount)
				while(isRecord && i < RecCount)	
				{
					RecDataArr = RecArrMulti[i];
					RecDataArrLen = RecDataArr.length;
					if(RecDataArrLen > 0)
					{
						//with(psFields)
						//{
							//SetProperty(""Parent Request Id"", vMenaReqId);

							//Check for Duplicate MSISDN and make new record INACTIVE
							//vDuplicateFlag = CheckDuplicateMSISDN(vMenaReqId, RecDataArr[44], vMenaCustType);
							if(vDuplicateFlag == ""TRUE"")
							{
							//SetProperty(""Status"", vInactiveStatus);
							MenaDataBC.SetFieldValue(""Status"", vInactiveStatus);
							}
							else
							{
							//SetProperty(""Status"", vInProgStatus);
							MenaDataBC.SetFieldValue(""Status"", vInProgStatus);
							}
						MenaDataBC.SetFieldValue(""Sub Status"", vImportedStatus);
							//SetProperty(""Sub Status"", vImportedStatus);
								//SetProperty(""Request Type"", vReqType);
							
							//SetProperty(""Customer Type"", RecDataArr[0]);
							//SetProperty(""STC ID Type"", RecDataArr[1]);
							//SetProperty(""STC ID Number"", RecDataArr[2]);
							//SetProperty(""STC Company Name"", RecDataArr[3]);
							//SetProperty(""STC DBAN Number"", RecDataArr[4]);
							//SetProperty(""DBAN Group"", RecDataArr[5]);
							//SetProperty(""DBANCL"", RecDataArr[6]);
							//SetProperty(""MENA SAN Number"", RecDataArr[7]);
							//SetProperty(""STC Parent Company Name"", RecDataArr[8]);
							//SetProperty(""STC Credit Limit"", RecDataArr[9]);
							//SetProperty(""IBAN Type"", RecDataArr[10]);
							//SetProperty(""Product Type"", RecDataArr[11]);
							//	var MENAParent=	PSInputs.
							//SetProperty(""MENA Parent CLI ID"", RecDataArr[0]);
							//SetProperty(""MSISDN"", RecDataArr[1]);
							//SetProperty(""SIM Number"", RecDataArr[2]);
							//SetProperty(""Account Status"", RecDataArr[15]);
							//	SetProperty(""STC Plan Package Details"", RecDataArr[16]);
							//SetProperty(""VIVA Plan"", RecDataArr[17]);
							//SetProperty(""STC MENA Data Attr1"", RecDataArr[18]);
							//SetProperty(""STC Port In"", RecDataArr[19]);
							//SetProperty(""Donor Operator"", RecDataArr[20]);
							// SetProperty(""Donor SIM"", RecDataArr[3]);
							//SetProperty(""Port In BR Details"", RecDataArr[22]);
							//SetProperty(""Port Out Bill Details"", RecDataArr[23]);
					//	}//end of with(psFields)
					MenaDataBC.SetFieldValue(""MENA Parent CLI ID"", RecDataArr[0]);
					MenaDataBC.SetFieldValue(""MSISDN"", RecDataArr[1]);
					MenaDataBC.SetFieldValue(""SIM Number"",  RecDataArr[2]);						
					MenaDataBC.SetFieldValue(""Donor SIM"", RecDataArr[3]);
						//ActivateMultipleFields(psFields);
						//NewRecord(NewAfter);
						//SetMultipleFieldValues(psFields);
						WriteRecord();
						vDataRecId = GetFieldValue(""Id"");

					}//end of if(RecDataArrLen > 0)
				isRecord = NextRecord();
						i++;
					}//end of while(i < RecCount)
				//} //end of if menaDataBC
			}//end of with(MenaDataBC)
			
		
			SetFieldValue(""Description"", vFileName);
			SetFieldValue(""Sub-Status"", vImportedStatus); //update header status
			WriteRecord();
		}//end of if (FirstRecord())
	}//end of with(MenaHeaderBC)
}
catch(e)
{throw(e);}
finally{
	MenaProdBC=null;
	MenaDataBC=null;
	MenaHeaderBC=null;
	MenaHeaderBO=null; 
}
//return CancelOperation;
}
function CreateLineItems(vMenaReqId, vMenaCustType, RecArrMulti, RecCount, vFileName)
{//[NAVIN:13Mar2018:MENACustomerMigration_Header]

var MenaHeaderBO=null, MenaHeaderBC=null, MenaDataBC=null, MenaProdBC=null;
var vPendingStatus=""Pending"", vInProgStatus=""In Progress"", vImportedStatus=""Imported"", vInactiveStatus=""INACTIVE"";
var psFields = TheApplication().NewPropertySet();
var RecDataArr = new Array();
var i=0, RecDataArrLen=0, vReqType="""", vDuplicateFlag=""FALSE"", vDataRecId="""";

try
{
	MenaHeaderBO = TheApplication().GetBusObject(""STC MENA Request Header BO"");
	with(MenaHeaderBO)
	{	
		MenaHeaderBC = GetBusComp(""STC MENA Request Header BC"");
		MenaDataBC = GetBusComp(""STC MENA Individual Data BC"");
		MenaProdBC = GetBusComp(""STC MENA Product Data BC"");
	}
	with(MenaHeaderBC)
	{
		SetViewMode(AllView);
		ClearToQuery();
		ActivateField(""Status"");
		ActivateField(""Sub-Status"");
		ActivateField(""Request Id"");
		ActivateField(""Description"");
		ActivateField(""Request Type"");
		
		SetSearchSpec(""Request Id"", vMenaReqId);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			vReqType = GetFieldValue(""Request Type"");
			
			with(MenaDataBC)
			{
				//SetViewMode(AllView);
				//ClearToQuery();
				while(i < RecCount)
				{
					RecDataArr = RecArrMulti[i];
					RecDataArrLen = RecDataArr.length;
					if(RecDataArrLen > 0)
					{
						with(psFields)
						{
							SetProperty(""Parent Request Id"", vMenaReqId);
							
							//Check for Duplicate MSISDN and make new record INACTIVE
							vDuplicateFlag = CheckDuplicateMSISDN(vMenaReqId, RecDataArr[29], vMenaCustType);
							if(vDuplicateFlag == ""TRUE"")
							{
								SetProperty(""Status"", vInactiveStatus);
							}
							else{
								SetProperty(""Status"", vInProgStatus);
							}

							SetProperty(""Sub-Status"", vImportedStatus);
							SetProperty(""Request Type"", vReqType);
							
							SetProperty(""Customer Type"", RecDataArr[0]);
							SetProperty(""Customer Class"", RecDataArr[1]);
							SetProperty(""Segment"", RecDataArr[2]);
							SetProperty(""Occupation"", RecDataArr[3]);
							SetProperty(""First Name"", RecDataArr[4]);
							SetProperty(""Middle Name"", RecDataArr[5]);
							SetProperty(""Last Name"", RecDataArr[6]);
							SetProperty(""MENA Account Number"", RecDataArr[7]);
							SetProperty(""MENA Service Number"", RecDataArr[8]);
							SetProperty(""ID Type"", RecDataArr[9]);
							SetProperty(""ID Number"", RecDataArr[10]);
							SetProperty(""ID Expiry Date"", RecDataArr[11]);
							SetProperty(""GCC Country Code"", RecDataArr[12]);
							SetProperty(""Age On Network"", RecDataArr[13]);
							SetProperty(""Gender"", RecDataArr[14]);
							SetProperty(""Nationality"", RecDataArr[15]);
							SetProperty(""Birth Date"", RecDataArr[16]);
							SetProperty(""Alternate Phone #"", RecDataArr[17]);
							SetProperty(""Email Address"", RecDataArr[18]);
							SetProperty(""Flat Number"", RecDataArr[19]);
							SetProperty(""Building Number"", RecDataArr[20]);
							SetProperty(""City"", RecDataArr[21]);
							SetProperty(""Block Number"", RecDataArr[22]);
							SetProperty(""Road Number"", RecDataArr[23]);
							SetProperty(""Governorate"", RecDataArr[24]);
							SetProperty(""Type"", RecDataArr[25]);
							SetProperty(""Bill Cycle"", RecDataArr[26]);
							SetProperty(""Credit Score"", RecDataArr[27]);
							SetProperty(""Bad Debt"", RecDataArr[28]);
							SetProperty(""MSISDN"", RecDataArr[29]);
							SetProperty(""MENA Parent CLI ID"", RecDataArr[30]);
							SetProperty(""SIM"", RecDataArr[31]);
							SetProperty(""Product Type"", RecDataArr[32]);
							SetProperty(""MENA Plan Name"", RecDataArr[33]);
							SetProperty(""Plan Name"", RecDataArr[34]);
							SetProperty(""Account Status"", RecDataArr[35]);
							SetProperty(""Suspension Date"", RecDataArr[36]);
							SetProperty(""Activation Date"", RecDataArr[37]);
							SetProperty(""TRA Registration Date"", RecDataArr[38]);
							SetProperty(""Authorized Number"", RecDataArr[39]);
							SetProperty(""Authorized Email Id"", RecDataArr[40]);
							SetProperty(""VOBB User Name"", RecDataArr[41]);
							SetProperty(""VOBB Password"", RecDataArr[42]);
							SetProperty(""VOBB Rental Charges"", RecDataArr[43]);
							SetProperty(""KZ Router Flag"", RecDataArr[44]);
							SetProperty(""Port ID"", RecDataArr[45]);
							SetProperty(""Port In Donor Id"", RecDataArr[46]);
							SetProperty(""Port Donor SIM"", RecDataArr[47]);
							SetProperty(""Contract Length"", RecDataArr[48]);
							SetProperty(""Contract Product"", RecDataArr[49]);
							SetProperty(""Contract Start Date"", RecDataArr[50]);
							SetProperty(""Contract End Date"", RecDataArr[51]);
							SetProperty(""Contract Termination Charge"", RecDataArr[52]);
							SetProperty(""MENA Attribute 1"", RecDataArr[53]);
							SetProperty(""MENA Attribute 2"", RecDataArr[54]);
							SetProperty(""MENA Attribute 3"", RecDataArr[55]);
							SetProperty(""MENA Attribute 4"", RecDataArr[56]);
							SetProperty(""MENA Attribute 5"", RecDataArr[57]);
							SetProperty(""MENA Attribute 6"", RecDataArr[58]);
							SetProperty(""MENA Attribute 7"", RecDataArr[59]);
							SetProperty(""MENA Attribute 8"", RecDataArr[60]);
							SetProperty(""MENA Attribute 9"", RecDataArr[61]);
							SetProperty(""MENA Attribute 10"", RecDataArr[62]);

						}//end of with(psFields)
				
						//ActivateMultipleFields(psFields);
						NewRecord(NewAfter);
						SetMultipleFieldValues(psFields);
						WriteRecord();
						vDataRecId = GetFieldValue(""Id"");
					}//end of if(RecDataArrLen > 0)

					i++;
				}//end of while(i < RecCount)
			}//end of with(MenaDataBC)
			
			SetFieldValue(""Description"", vFileName);
			SetFieldValue(""Sub-Status"", vImportedStatus); //update header status
			WriteRecord();
		}//end of if (FirstRecord())
	}//end of with(MenaHeaderBC)
}
catch(e)
{throw(e);}
finally{
	MenaProdBC=null;
	MenaDataBC=null;
	MenaHeaderBC=null;
	MenaHeaderBO=null; 
}
return CancelOperation;
}
function CreateLineItemsCorp(vMenaReqId, vMenaCustType, RecArrMulti, RecCount, vFileName)
{//[NAVIN:13Mar2018:MENACustomerMigration_Header]

var MenaHeaderBO=null, MenaHeaderBC=null, MenaDataBC=null, MenaProdBC=null;
var vPendingStatus=""Pending"", vInProgStatus=""In Progress"", vImportedStatus=""Imported"", vInactiveStatus=""INACTIVE"";
var psFields = TheApplication().NewPropertySet();
var RecDataArr = new Array();
var i=0, RecDataArrLen=0, vReqType="""", vDuplicateFlag=""FALSE"", vDataRecId="""";

try
{
	MenaHeaderBO = TheApplication().GetBusObject(""STC MENA Corp Request Header BO"");
	with(MenaHeaderBO)
	{	
		MenaHeaderBC = GetBusComp(""STC MENA Request Header BC"");
		MenaDataBC = GetBusComp(""STC MENA Corporate Data BC"");
		MenaProdBC = GetBusComp(""STC MENA Product Data BC"");
	}
	with(MenaHeaderBC)
	{
		SetViewMode(AllView);
		ClearToQuery();
		ActivateField(""Status"");
		ActivateField(""Sub-Status"");
		ActivateField(""Request Id"");
		ActivateField(""Description"");
		ActivateField(""Request Type"");

		SetSearchSpec(""Request Id"", vMenaReqId);
		ExecuteQuery(ForwardOnly);
		if (FirstRecord())
		{
			vReqType = GetFieldValue(""Request Type"");
			
			with(MenaDataBC)
			{
				//SetViewMode(AllView);
				//ClearToQuery();
				while(i < RecCount)
				{
					RecDataArr = RecArrMulti[i];
					RecDataArrLen = RecDataArr.length;
					if(RecDataArrLen > 0)
					{
						with(psFields)
						{
							SetProperty(""Parent Request Id"", vMenaReqId);

							//Check for Duplicate MSISDN and make new record INACTIVE
							vDuplicateFlag = CheckDuplicateMSISDN(vMenaReqId, RecDataArr[44], vMenaCustType);
							if(vDuplicateFlag == ""TRUE"")
							{
								SetProperty(""Status"", vInactiveStatus);
							}
							else{
								SetProperty(""Status"", vInProgStatus);
							}

							SetProperty(""Sub Status"", vImportedStatus);
							SetProperty(""Request Type"", vReqType);
							
							SetProperty(""Customer Type"", RecDataArr[0]);
							SetProperty(""STC Customer Class"", RecDataArr[1]);
							SetProperty(""STC Customer Segment"", RecDataArr[2]);
							SetProperty(""STC Company Name"", RecDataArr[3]);
							SetProperty(""STC ID Type"", RecDataArr[4]);
							SetProperty(""STC ID Number"", RecDataArr[5]);
							SetProperty(""STC ID Expiry Date"", RecDataArr[6]);
							SetProperty(""MENA CAN Number"", RecDataArr[7]);
							SetProperty(""MENA SAN Number"", RecDataArr[8]);
							SetProperty(""STC Employees Number"", RecDataArr[9]);
							SetProperty(""STC Nature Business"", RecDataArr[10]);
							SetProperty(""STC Branches Local"", RecDataArr[11]);
							SetProperty(""STC Company Type"", RecDataArr[12]);
							SetProperty(""STC Contact First Name"", RecDataArr[13]);
							SetProperty(""STC Contact Last Name"", RecDataArr[14]);
							SetProperty(""STC Contact Business Fixed Number"", RecDataArr[15]);
							SetProperty(""STC Contact Nationality"", RecDataArr[16]);
							SetProperty(""STC Contact Gender"", RecDataArr[17]);
							SetProperty(""STC Contact DOB"", RecDataArr[18]);
							SetProperty(""STC Contact Alternate Number"", RecDataArr[19]);
							SetProperty(""STC Contact Email Address"", RecDataArr[20]);
							SetProperty(""STC Contact ID Number"", RecDataArr[21]);
							SetProperty(""STC Contact GCC Country"", RecDataArr[22]);
							SetProperty(""Primary Account Admin First Name"", RecDataArr[23]);
							SetProperty(""Account Admin Last Name"", RecDataArr[24]);
							SetProperty(""Account Admin MSISDN"", RecDataArr[25]);
							SetProperty(""Admin Email Id"", RecDataArr[26]);
							SetProperty(""CPR Number"", RecDataArr[27]);
							SetProperty(""Telephone Number"", RecDataArr[28]);
							SetProperty(""STC Account Manager Name"", RecDataArr[29]);
							SetProperty(""STC Account Manager Email"", RecDataArr[30]);
							SetProperty(""STC Account Manager Number"", RecDataArr[31]);
							SetProperty(""STC Address Flat Number"", RecDataArr[32]);
							SetProperty(""STC Address Building Number"", RecDataArr[33]);
							SetProperty(""STC Address Road Number"", RecDataArr[34]);
							SetProperty(""STC Address Block Number"", RecDataArr[35]);
							SetProperty(""STC Address City"", RecDataArr[36]);
							SetProperty(""STC Address Governrate"", RecDataArr[37]);
							SetProperty(""CBANCL"", RecDataArr[38]);
							SetProperty(""DBAN Group"", RecDataArr[39]);
							SetProperty(""DBANCL"", RecDataArr[40]);
							SetProperty(""STC Credit Limit"", RecDataArr[41]);
							SetProperty(""IBAN Type"", RecDataArr[42]);
							SetProperty(""Product Type"", RecDataArr[43]);
							SetProperty(""MSISDN"", RecDataArr[44]);
							SetProperty(""MENA Parent CLI ID"", RecDataArr[45]);
							SetProperty(""SIM Number"", RecDataArr[46]);
							SetProperty(""Account Status"", RecDataArr[47]);
							SetProperty(""MENA Plan"", RecDataArr[48]);
							SetProperty(""VIVA Plan"", RecDataArr[49]);
							SetProperty(""Line Activation Date"", RecDataArr[50]);
							SetProperty(""Suspension Date"", RecDataArr[51]);
							SetProperty(""STC TRA Registation Date"", RecDataArr[52]);
							SetProperty(""STC Port In"", RecDataArr[53]);
							SetProperty(""Donor Operator"", RecDataArr[54]);
							SetProperty(""Donor SIM"", RecDataArr[55]);
							SetProperty(""Port In BR Details"", RecDataArr[56]);
							SetProperty(""Port Out Bill Details"", RecDataArr[57]);
							SetProperty(""VOBB Rental Charges"", RecDataArr[58]);
							SetProperty(""VOBB User Name"", RecDataArr[59]);
							SetProperty(""VOBB Password"", RecDataArr[60]);
							SetProperty(""Authorized Number"", RecDataArr[61]);
							SetProperty(""Authorized Email Id"", RecDataArr[62]);
							SetProperty(""Plan Contract Term"", RecDataArr[63]);
							SetProperty(""Plan Contract Product"", RecDataArr[64]);
							SetProperty(""Plan Contract Start Date"", RecDataArr[65]);
							SetProperty(""Plan Contract End Date"", RecDataArr[66]);
							SetProperty(""KZ Router Flag"", RecDataArr[67]);
							SetProperty(""STC MENA Data Attr1"", RecDataArr[68]);
							SetProperty(""STC MENA Data Attr2"", RecDataArr[69]);
							SetProperty(""STC MENA Data Attr3"", RecDataArr[70]);
							SetProperty(""STC MENA Data Attr4"", RecDataArr[71]);
							SetProperty(""STC MENA Data Attr5"", RecDataArr[72]);
							SetProperty(""STC MENA Data Attr6"", RecDataArr[73]);
							SetProperty(""STC MENA Data Attr7"", RecDataArr[74]);
							SetProperty(""STC MENA Data Attr8"", RecDataArr[75]);
							SetProperty(""STC MENA Data Attr9"", RecDataArr[76]);
							SetProperty(""STC MENA Data Attr10"", RecDataArr[77]);

						}//end of with(psFields)

						//ActivateMultipleFields(psFields);
						NewRecord(NewAfter);
						SetMultipleFieldValues(psFields);
						WriteRecord();
						vDataRecId = GetFieldValue(""Id"");

					}//end of if(RecDataArrLen > 0)

					i++;
				}//end of while(i < RecCount)
			}//end of with(MenaDataBC)
			
			SetFieldValue(""Description"", vFileName);
			SetFieldValue(""Sub-Status"", vImportedStatus); //update header status
			WriteRecord();
		}//end of if (FirstRecord())
	}//end of with(MenaHeaderBC)
}
catch(e)
{throw(e);}
finally{
	MenaProdBC=null;
	MenaDataBC=null;
	MenaHeaderBC=null;
	MenaHeaderBO=null; 
}
//return CancelOperation;
}
function ImportBulkAdmin(Inputs,Outputs)
{
		var vInputFile = """", vReadFromFile = """", vBulkDataArray = """";
		var vFileName = """", vFileType = """", sRecData="""";
		var RecArrMulti = new Array();
	 	var vRecord = false, RecDataArrLen=0;
		var RecCount = 0, ErrMsg = ""Success"", i=0;
		var WFBS = null, WFInpPS = null, WFOutPS = null;
	try
	{
		
		vFileName = Inputs.GetProperty(""FileName"");
	  	vInputFile = Clib.fopen(vFileName, ""rt"");       
	    vReadFromFile = Clib.fgets(4000, vInputFile);
		
		if(vReadFromFile != null && vFileName != '' && vFileName != """")
		{		
			if (vInputFile == null)
			{
				TheApplication().RaiseErrorText(""Error in opening the file!"");
			}
			while((vReadFromFile != null) && (vReadFromFile.length > 1))
			{		
				ErrMsg = """"; //Nullify Error Message for each of the iteration			
				if(vReadFromFile != null && vReadFromFile != """")
				{
					vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
					var RecDataArr = vReadFromFile.split("","");
					RecDataArrLen = RecDataArr.length;

					for(i=RecDataArrLen; i <= 15; i++) //Set Remaining Array elements to null to avoid undefined error
				RecDataArr[i]="""";
				
				
				if(RecCount > 0)
				{	
						WFBS = TheApplication().GetService(""Workflow Process Manager"");
						WFInpPS = TheApplication().NewPropertySet();
						WFOutPS = TheApplication().NewPropertySet();
						WFInpPS.SetProperty(""ProcessName"", ""STC MENA Bulk Admin Import Data WF"");
						WFInpPS.SetProperty(""Operation"", ""MenaBulkAdmin"");
						WFInpPS.SetProperty(""CR Number"", RecDataArr[0]);
						WFInpPS.SetProperty(""Admin ID Type"", RecDataArr[1]);
						WFInpPS.SetProperty(""Admin ID Number"", RecDataArr[2]);
						WFInpPS.SetProperty(""GCC Country Code"", RecDataArr[3]);
						WFInpPS.SetProperty(""Admin First Name"", RecDataArr[4]);
						WFInpPS.SetProperty(""Admin Last Name"", RecDataArr[5]);
						WFInpPS.SetProperty(""Admin MSISDN"", RecDataArr[6]);
						WFInpPS.SetProperty(""Admin Email Id"", RecDataArr[7]);
						WFInpPS.SetProperty(""Telephone Number"", RecDataArr[8]);
						
					WFBS.InvokeMethod(""RunProcess"", WFInpPS, WFOutPS);
				
				 }			
					RecCount++;
				}//if(sReadFromFile != null && sReadFromFile != """")
			
				vReadFromFile = Clib.fgets(4000, vInputFile);
				
			}//while((vReadFromFile != null) ...
		
		}

	}
	catch(e)
	{
		throw(e.toString());
	}
	finally
	{
	}


}
function ImportBusinessProductsData(Inputs, Outputs)
{//[NAVIN:14Mar2019:BusinessProducts-BulkActivation-P1]

	var vInputFile = """", vReadFromFile = """", vBulkDataArray = """";
    var vFileName = """", vFileType = """", sRecData="""";
	var vMenaReqId="""", vMenaReqNum="""", vMenaCustType="""";
	var RecArrMulti = new Array();
	//var RecDataArr = new Array();;
 	var vRecord = false, RecDataArrLen=0;
	var RecCount = 0, ErrMsg = ""Success"", i=0;
	var vPendingStatus=""Pending"", vImportedStatus=""Imported"";
	var svcUI = null, psIn1 = null, psOut1 = null;
	
	try {
		vFileName = Inputs.GetProperty(""FileName"");
	  	vFileType = ToString(Inputs.GetProperty(""FileType""));
		
		with(TheApplication())
		{
			vMenaReqId = GetProfileAttr(""MENAHeaderId"");
			vMenaReqNum = GetProfileAttr(""MENAHeaderNumber"");
			vMenaCustType = GetProfileAttr(""MENACustomerType"");
	
			SetProfileAttr(""MENAHeaderId"", """");
			SetProfileAttr(""MENAHeaderNumber"", """");
			SetProfileAttr(""MENACustomerType"", """");
		}

		vFileType = Clib.strlwr(vFileType);
	    if((vFileType != ""csv"") && (vFileType != ""tmp"")) //files having size more than 500KB are created with '.tmp' extension
	    {
	       TheApplication().RaiseErrorText(""Please check the File Type , It should be :  File_Name.CSV"");
	    }
	    vInputFile = Clib.fopen(vFileName, ""rt"");       
	    vReadFromFile = Clib.fgets(4000, vInputFile);
		
		if(vReadFromFile != null && vFileName != '' && vFileName != """")
		{		
			if (vInputFile == null)
			{
				TheApplication().RaiseErrorText(""Error in opening the file!"");
			}
					
			while((vReadFromFile != null) && (vReadFromFile.length > 1))
			{		
				ErrMsg = """"; //Nullify Error Message for each of the iteration			
				if(vReadFromFile != null && vReadFromFile != """")
				{
					vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
					var RecDataArr = vReadFromFile.split("","");
					RecDataArrLen = RecDataArr.length;

					for(i=RecDataArrLen; i <= 200; i++) //Set Remaining Array elements to null to avoid undefined error
						RecDataArr[i]="""";
						
					if(RecCount > 0)
						RecArrMulti[RecCount-1] = RecDataArr;
					
					RecCount++;
				}//if(sReadFromFile != null && sReadFromFile != """")
					
				vReadFromFile = Clib.fgets(4000, vInputFile);
				
			}//while((vReadFromFile != null) ...
			
			RecCount--;
			
			if(RecCount > 0)
			{
				CreateBusinessProductsData(vMenaReqId, vMenaCustType, RecArrMulti, RecCount, vFileName);
			}

			svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
			psIn1 = TheApplication().NewPropertySet();
			psOut1 = TheApplication().NewPropertySet();
			psIn1.SetProperty(""Refresh All"", ""Y"");
			svcUI.InvokeMethod(""RefreshCurrentApplet"", psIn1, psOut1);
		}//if(sFileName != null && sFileName != '' && sFileName != """")
	}//end of try
	catch(e)
	{throw(e.errText);}
	finally{
		//vInputFile = null; 
		RecArrMulti=null;
		svcUI = null; psIn1 = null; psOut1 = null;
	}
	//return CancelOperation;
}//Your public declarations go here...  
"
function ImportFileData(Inputs, Outputs)
{//[NAVIN:13Mar2018:MENACustomerMigration_Header]

	var vInputFile = """", vReadFromFile = """", vBulkDataArray = """";
    var vFileName = """", vFileType = """", sRecData="""";
	var vMenaReqId="""", vMenaReqNum="""", vMenaCustType="""";
	var RecArrMulti = new Array();
	//var RecDataArr = new Array();;
 	var vRecord = false, RecDataArrLen=0;
	var RecCount = 0, ErrMsg = ""Success"", i=0;
	var vPendingStatus=""Pending"", vImportedStatus=""Imported"";
	var svcUI = null, psIn1 = null, psOut1 = null;
	
	try {
		vFileName = Inputs.GetProperty(""FileName"");
	  	vFileType = ToString(Inputs.GetProperty(""FileType""));
		
		with(TheApplication())
		{
			vMenaReqId = GetProfileAttr(""MENAHeaderId"");
			vMenaReqNum = GetProfileAttr(""MENAHeaderNumber"");
			vMenaCustType = GetProfileAttr(""MENACustomerType"");
	
			SetProfileAttr(""MENAHeaderId"", """");
			SetProfileAttr(""MENAHeaderNumber"", """");
			SetProfileAttr(""MENACustomerType"", """");
		}

		vFileType = Clib.strlwr(vFileType);
	    if((vFileType != ""csv"") && (vFileType != ""tmp"")) //files having size more than 500KB are created with '.tmp' extension
	    {
	       TheApplication().RaiseErrorText(""Please check the File Type , It should be :  File_Name.CSV"");
	    }
	    vInputFile = Clib.fopen(vFileName, ""rt"");       
	    vReadFromFile = Clib.fgets(4000, vInputFile);
		
		if(vReadFromFile != null && vFileName != '' && vFileName != """")
		{		
			if (vInputFile == null)
			{
				TheApplication().RaiseErrorText(""Error in opening the file!"");
			}
					
			while((vReadFromFile != null) && (vReadFromFile.length > 1))
			{		
				ErrMsg = """"; //Nullify Error Message for each of the iteration			
				if(vReadFromFile != null && vReadFromFile != """")
				{
					vReadFromFile = vReadFromFile.substring(0,vReadFromFile.indexOf(""\n"")); 			 
					var RecDataArr = vReadFromFile.split("","");
					RecDataArrLen = RecDataArr.length;

					for(i=RecDataArrLen; i <= 200; i++) //Set Remaining Array elements to null to avoid undefined error
						RecDataArr[i]="""";
						
					if(RecCount > 0)
						RecArrMulti[RecCount-1] = RecDataArr;
					
					RecCount++;
				}//if(sReadFromFile != null && sReadFromFile != """")
					
				vReadFromFile = Clib.fgets(4000, vInputFile);
				
			}//while((vReadFromFile != null) ...
			
			RecCount--;
			
			if(RecCount > 0)
			{
				if(vMenaCustType == ""Individual"")
					CreateLineItems(vMenaReqId, vMenaCustType, RecArrMulti, RecCount, vFileName);
				else
					CreateLineItemsCorp(vMenaReqId, vMenaCustType, RecArrMulti, RecCount, vFileName);
			}

			svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
			psIn1 = TheApplication().NewPropertySet();
			psOut1 = TheApplication().NewPropertySet();
			psIn1.SetProperty(""Refresh All"", ""Y"");
			svcUI.InvokeMethod(""RefreshCurrentApplet"", psIn1, psOut1);
		}//if(sFileName != null && sFileName != '' && sFileName != """")
	}//end of try
	catch(e)
	{throw(e.errText);}
	finally{
		//vInputFile = null; 
		RecArrMulti=null;
		svcUI = null; psIn1 = null; psOut1 = null;
	}
	//return CancelOperation;
}
function ImportProductData(Inputs, Outputs)
{//[NAVIN:20Mar2018:MENACustomerMigration_ProductDataImport]

    var vInputFile=null, vFileName = """", vFileType = """", sRecData="""";
	var vMenaReqId="""", vMenaParId="""", vMenaCustType="""", vMenaOperation="""";
	//var vPendingStatus=""Pending"", vImportedStatus=""Imported"";
	var WFBS = null, WFInpPS = null, WFOutPS = null;
	var svcUI = null, psIn1 = null, psOut1 = null;
	
	try {
		vFileName = Inputs.GetProperty(""FileName"");
	  	vFileType = ToString(Inputs.GetProperty(""FileType""));
		
		with(TheApplication())
		{
			vMenaOperation = GetProfileAttr(""MENAOperation"");
			vMenaReqId = GetProfileAttr(""MENAHeaderId"");
			vMenaParId = GetProfileAttr(""MENAParentId"");
			vMenaCustType = GetProfileAttr(""MENACustomerType"");
			SetProfileAttr(""MENAOperation"", """");
			SetProfileAttr(""MENAHeaderId"", """");
			SetProfileAttr(""MENAParentId"", """");
			SetProfileAttr(""MENACustomerType"", """");
		}

		vFileType = Clib.strlwr(vFileType);
	    if((vFileType != ""csv"") && (vFileType != ""tmp"")) //files having size more than 500KB are created with '.tmp' extension
	    {
	       TheApplication().RaiseErrorText(""Please check the File Type , It should be :  File_Name.CSV"");
	    }
		
		if(vFileName != null && vFileName != """")
		{
			vInputFile = Clib.fopen(vFileName, ""rt""); 
			
			if (vInputFile == null)
			{
				TheApplication().RaiseErrorText(""Error in opening the file!"");
			}
	    
			WFBS = TheApplication().GetService(""Workflow Process Manager"");
			WFInpPS = TheApplication().NewPropertySet();
			WFOutPS = TheApplication().NewPropertySet();
			
			with(WFInpPS)
			{
				SetProperty(""ProcessName"", ""STC MENA Import Data WF"");
				SetProperty(""Operation"", vMenaOperation);
				SetProperty(""FileName"", vFileName);
				SetProperty(""FileType"", vFileType);
				SetProperty(""MENAHeaderId"", vMenaReqId);
				SetProperty(""MENAParentId"", vMenaParId);
				SetProperty(""CustType"", vMenaCustType);
			}
			
			WFBS.InvokeMethod(""RunProcess"", WFInpPS, WFOutPS);

			svcUI = TheApplication().GetService(""FINS Teller UI Navigation"");
			psIn1 = TheApplication().NewPropertySet();
			psOut1 = TheApplication().NewPropertySet();
			psIn1.SetProperty(""Refresh All"", ""Y"");
			svcUI.InvokeMethod(""RefreshCurrentApplet"", psIn1, psOut1);
			
		}//if(vFileName != null && vFileName != """")
	}//end of try
	catch(e)
	{throw(e.errText);}
	finally{
		WFBS = null; WFInpPS = null; WFOutPS = null;
		svcUI = null; psIn1 = null; psOut1 = null;
	}
	//return CancelOperation;
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
//var ireturn = CancelOperation;
var vMenaOperation = """";
	 try
	 {
	    switch(MethodName)
	     {     
		     case ""ImportFileData"":
		     {
			 	vMenaOperation = TheApplication().GetProfileAttr(""MENAOperation"");
				if(vMenaOperation == ""ImportProductData"")
				{
					ImportProductData(Inputs,Outputs);
				}
				else if(vMenaOperation == ""ImportBusinessProductsData"")
				{
					ImportBusinessProductsData(Inputs,Outputs);
				}
				else if(vMenaOperation == ""ImportBusinessProducts"")
				{
					ImportProductData(Inputs,Outputs);
				}
				else
				{
					ImportFileData(Inputs,Outputs);
				}
		     	return(CancelOperation);
		     	break;
		     }
			 case ""ImportBulkAdmin"":
			 {
				ImportBulkAdmin(Inputs,Outputs);
				return(CancelOperation);
		     	break;
			 }

	      	 default:
	         	break;
	     }
	 }
	 catch (exc)
	 {
	 	throw(exc.toString());
	 }
	 finally 
	 {
	 }
 //return (ContinueOperation); 
}
function CheckMNPRecords(Inputs,Outputs)
{
var StrCUTSerBC = TheApplication().GetBusObject(""STC Service Account"").GetBusComp(""CUT Service Sub Accounts"");
var StrBC = TheApplication().GetBusObject(""STC Service Account"");
var SearchExp = ""[Account Status] = 'Suspended' AND [STC MNP New] = 'MNP Termination'"";
//var SearchExp = ""[Account Status] = 'Suspended' AND [Interruption Date] IS NOT NULL"";
with(StrCUTSerBC)
{
	ActivateField(""STC Suspension Reason"");
	ActivateField(""Interruption Date"");
	SetViewMode(AllView);
	ClearToQuery();
	SetSearchExpr(SearchExp);
	//SetSearchSpec(""STC MNP Termination"",""MNP Termination"");
	ExecuteQuery();
	var Rec = CountRecords();
	var isSANRec = FirstRecord();
	while(isSANRec)
	{
		var SusReason = GetFieldValue(""STC Suspension Reason"");	
		var MSISDN = GetFieldValue(""DUNS Number"");
		if(SusReason == ""MNP SUSPENSION"")
		{
		TheApplication().RaiseErrorText(MSISDN);
		var MSISDN = GetFieldValue(""DUNS Number"");
		var IntDate  = GetFieldValue(""Interruption Date"");
		var IntDatesys = new Date(IntDate);
		var sysintdate = IntDatesys.toSystem();
		var CurrDate = new Date();
		var CurrDateSys = new Date(CurrDate);
		var sysdateCurrDate = CurrDateSys.toSystem();
		var daydiff = (sysdateCurrDate - sysintdate);
		var Finaldays = Math.round((daydiff/(60*60*24)));
		Finaldays = ToNumber(Finaldays);
		
		if( Finaldays >= 3)
		{
			
		}
		}
		
		isSANRec = NextRecord();

	}
}// end of with(StrCUTSerBC)



}
function MNPTermination(Inputs, Outputs)
{
var appObj = TheApplication();
var CUTAccBo = appObj.GetBusObject(""STC Service Account"");
var StrCUTSer = CUTAccBo.GetBusComp(""CUT Service Sub Accounts"");
var Reason = ""MNP Termination"";

var SearchExp = ""[Account Status] = 'Suspended' AND [STC MNP New] = 'MNP Termination'"";
	with(StrCUTSer)
	{
		ActivateField(""Interruption Date"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchExpr(SearchExp);
	//	SetSearchSpec(""STC MNP New"", Reason);
		ExecuteQuery();
		var isrec = FirstRecord();
		var RecCount = CountRecords();
		while(isrec)
		{
			var SANId = GetFieldValue(""Id"");
			var IntDate  = GetFieldValue(""Interruption Date"");
			var IntDatesys = new Date(IntDate);
			var sysintdate = IntDatesys.toSystem();
			var CurrDate = new Date();
			var CurrDateSys = new Date(CurrDate);
			var sysdateCurrDate = CurrDateSys.toSystem();
			var daydiff = (sysdateCurrDate - sysintdate);
			var Finaldays = Math.round((daydiff/(60*60*24)));
			Finaldays = ToNumber(Finaldays);
				if(Finaldays > 3)
				{
						var psInputs = appObj.NewPropertySet();
						var psOutputs = appObj.NewPropertySet();
						var svcbsService = appObj.GetService(""Workflow Process Manager"");
						psInputs.SetProperty(""ProcessName"", ""STC MNP Termination for Suspended Order Main WF"");
						psInputs.SetProperty(""Object Id"",SANId);
						svcbsService.InvokeMethod(""RunProcess"", psInputs, psOutputs);
						SetFieldValue(""STC MNP New"", ""Terminated"");
						WriteRecord();
				}//if(Finaldays > 3)
			isrec = NextRecord();
		}//while(isrec)
	}//with(StrCUTSer)
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
 try
 {
    switch(MethodName)
     {
    case ""CheckMNPRecords"":
     CheckMNPRecords(Inputs, Outputs);
     return(CancelOperation);
     break;
    
    case ""CheckMNPTermination"":
     MNPTermination(Inputs, Outputs);
     return(CancelOperation);
     break;


    case ""TestSegmentTermination"":
     TestSegmentTermination(Inputs, Outputs);
     return(CancelOperation);
     break;
     
      case ""SetAccId"":
     SetAccId(Inputs, Outputs);
     return(CancelOperation);
     break;
    
    
      default:
          return (ContinueOperation);
       }
 }
 catch (exc)
 {
 throw(exc.toString());
 }
  finally 
 {
 }  
}
function SetAccId(Inputs,Outputs)
{
var AccId = Inputs.GetProperty(""AccId"");
var CutSerBC = TheApplication().GetBusObject(""STC Service Account"").GetBusComp(""CUT Service Sub Accounts"");
with(CutSerBC)
{
		InvokeMethod(""SetAdminMode"", ""TRUE"")
		ActivateField(""Primary Billing Profile Id"");
		ActivateField(""Parent Account Id"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"", AccId);
		ExecuteQuery();
		var FirstRec = FirstRecord();
		if(FirstRec)
		{
			SetFieldValue(""Primary Billing Profile Id"", ""1-CQZE4T"");
			SetFieldValue(""Parent Account Id"", ""1-CQZE4A"");
			WriteRecord();
		}
}
}
function TestSegmentTermination(Inputs, Outputs)
{
var appObj = TheApplication();
var CUTAccBo = appObj.GetBusObject(""STC Service Account"");
var StrCUTSer = CUTAccBo.GetBusComp(""CUT Service Sub Accounts"");
var Reason = ""Test Segment Termination"";

var SearchExp = ""[Account Status] = 'Suspended' AND [STC MNP New] = 'Test Segment Termination'"";
	with(StrCUTSer)
	{
		ActivateField(""Interruption Date"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchExpr(SearchExp);
		SetSearchSpec(""STC MNP New"", Reason);
		ExecuteQuery();
		var isrec = FirstRecord();
		var RecCount = CountRecords();
		while(isrec)
		{
			var SANId = GetFieldValue(""Id"");
			var IntDate  = GetFieldValue(""STC Line Expiry"");
			var IntDatesys = new Date(IntDate);
			var sysintdate = IntDatesys.toSystem();
			var CurrDate = new Date();
			var CurrDateSys = new Date(CurrDate);
			var sysdateCurrDate = CurrDateSys.toSystem();
			var daydiff = (sysdateCurrDate - sysintdate);
			var Finaldays = Math.round((daydiff/(60*60*24)));
			Finaldays = ToNumber(Finaldays);
				if(Finaldays < 1)
				{
						var psInputs = appObj.NewPropertySet();
						var psOutputs = appObj.NewPropertySet();
						var svcbsService = appObj.GetService(""Workflow Process Manager"");
						psInputs.SetProperty(""ProcessName"", ""STC Test Segment Expiry Date"");
						psInputs.SetProperty(""Object Id"",SANId);
						svcbsService.InvokeMethod(""RunProcess"", psInputs, psOutputs);
						SetFieldValue(""STC MNP New"", ""Terminated"");
						WriteRecord();
				}//if(Finaldays > 3)
			isrec = NextRecord();
		}//while(isrec)
	}//with(StrCUTSer)
}
function GetPoolId(Inputs,Outputs)
{
  var sApp = TheApplication();
  var UserBC = sApp.GetBusObject(""Employee"").GetBusComp(""Employee"");
  var IntDivBC = sApp.GetBusObject(""Internal Division"").GetBusComp(""Internal Division"");
  var Postion = sApp.GetBusObject(""Position"").GetBusComp(""Position"");
  var PriPosId,IntDevId,ContactRec,IntId,PoolId=""""; 

     var CreatedUser = Inputs.GetProperty(""CreatedUser""); 
  with(UserBC)
  {
  
   ActivateField(""Login Name"");
   ActivateField(""Primary Position Id"");
   ActivateField(""OU Id"");
   ClearToQuery();
   SetViewMode(AllView);
   SetSearchSpec(""Login Name"",CreatedUser);
   ExecuteQuery(ForwardOnly);
   var EmpRec = FirstRecord();
   if(EmpRec)
   {
    var ContactRecId = GetFieldValue(""Id"");
    PriPosId = GetFieldValue(""Primary Position Id"");
    IntDevId = GetFieldValue(""OU Id"");
    with(Postion)
    {
     ActivateField(""Division Id"");
     ClearToQuery();
     SetViewMode(AllView);
     SetSearchSpec(""Id"",PriPosId);
     ExecuteQuery(ForwardOnly);
     var ContactRec = FirstRecord();
     if(ContactRec)
     {
     IntId = GetFieldValue(""Division Id"");
     }// end of if(ContactRec)

     with(IntDivBC)
     {
     ActivateField(""STC Grp Partner Id"");
     ClearToQuery();
     SetViewMode(AllView);
     SetSearchSpec(""Id"",IntId);
     ExecuteQuery(ForwardOnly);
     var ContactRec = FirstRecord();
     if(ContactRec)
     {
     PoolId = GetFieldValue(""STC Grp Partner Id"");
     }// with(IntDivBC)
     }
    }// end of with(ContactBC)
   }// end of if(EmpRec)
  }// end of with(UserBC)
Outputs.SetProperty(""PoolId"",PoolId);
Outputs.SetProperty(""PriPosId"",PriPosId);
Outputs.SetProperty(""IntId"",IntId);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
   
 switch(MethodName)  
     { 
  case ""GetPoolId"" : 
  { 
   GetPoolId(Inputs,Outputs); 
   return(CancelOperation); 
   break; 
  } 
 
     } 
  

 return (ContinueOperation);
}
function CalcAvailableDate(QuarUOM, QuarPeriod, &bcNumberMaster)
{
 
 var dtSysDate    = Clib.time();
 var dtSysDateObj   = Date.fromSystem(dtSysDate);
 
 var dtQuarantineDate  = bcNumberMaster.GetFieldValue(""Quarantine Date"");
 var dtQuarantineDateObj = new Date(dtQuarantineDate);
 
    switch (QuarUOM) {

       case ""Days"": 
   dtQuarantineDateObj.setDate(ToInteger(dtQuarantineDateObj.getDate()) + ToInteger(QuarPeriod));
         break;
              
     case ""Months"": 
   dtQuarantineDateObj.setMonth(ToNumber(ToNumber(dtQuarantineDateObj.getMonth()) + ToNumber(QuarPeriod)));
   break;
  
     case ""Weeks"":
   dtQuarantineDateObj.setDate(dtQuarantineDateObj.getDate() + (QuarPeriod * 7));
         break;
     
     case ""Year"": 
     dtQuarantineDateObj.setFullYear(ToNumber(ToNumber(dtQuarantineDateObj.getFullYear()) + ToNumber(QuarPeriod)));
   break;
   }
   
   return(dtQuarantineDateObj);
}
function DateToString (intCDate)
{
 var dtDatum = ((intCDate.getMonth() + 1) + ""/"" + intCDate.getDate() + ""/"" + intCDate.getFullYear()
 + "" "" + intCDate.getHours() + "":"" + intCDate.getMinutes()+ "":"" + intCDate.getSeconds());
 return dtDatum
}
function GetQuarantineDetails(Inputs, strSchemeId, strMSISDN, QuarEvent)
{
    var blnIsRecord   = false; 
 var boNumberScheme   = TheApplication().GetBusObject(""RMS NM Number Scheme"");
 var bcNumberScheme   = boNumberScheme.GetBusComp(""RMS NM Number Scheme"");
 var bcQuarantine     = boNumberScheme.GetBusComp(""RMS NM Number Quarantine"");


    var blnsIsQuarantine = false;
 var strSearchExp     = """";
 try{
 with(bcNumberScheme)
 {
  ClearToQuery();
  SetSearchSpec(""Id"",strSchemeId);
  ExecuteQuery(ForwardOnly);
  if(FirstRecord()) 
  {
 
   strSearchExp =    strSearchExp +""[Scheme Id] ='""+strSchemeId+""'""; 
   if(QuarEvent== TheApplication().InvokeMethod(""LookupValue"", ""NM_QUARANTINE_EVENT"", ""Change MSISDN""))
   {
    strSearchExp = strSearchExp + "" AND [Quarantine Event] = '"" + TheApplication().InvokeMethod(""LookupValue"", ""NM_QUARANTINE_EVENT"", ""Change MSISDN"") + ""'"";
   }
   else if(QuarEvent == TheApplication().InvokeMethod(""LookupValue"", ""NM_QUARANTINE_EVENT"", ""Service Termination""))
   {
    strSearchExp = strSearchExp + "" AND [Quarantine Event] = '"" + TheApplication().InvokeMethod(""LookupValue"", ""NM_QUARANTINE_EVENT"", ""Service Termination"") + ""'"";
   }
   with(bcQuarantine)
   {
    ActivateField(""Quarantine Period"");
    ActivateField(""Quarantine UOM"");
    ClearToQuery();
    SetSearchExpr(strSearchExp);
    ExecuteQuery(ForwardOnly);
    blnsIsQuarantine = FirstRecord();
    if(blnsIsQuarantine)
    {
     Inputs.SetProperty(""Quarantine Period"",bcQuarantine.GetFieldValue(""Quarantine Period""));
     Inputs.SetProperty(""Quarantine UOM"",bcQuarantine.GetFieldValue(""Quarantine UOM""));
    }//end of if(blnsIsQuarantine)
    //if no record with that quarantine event is found then query on ""Default"" quarantine event
    else{
     ClearToQuery();
     SetSearchSpec(""Scheme Id"",strSchemeId);
     SetSearchSpec(""Quarantine Event"",TheApplication().InvokeMethod(""LookupValue"", ""NM_QUARANTINE_EVENT"", ""Default""));
     ExecuteQuery(ForwardOnly);
     blnsIsQuarantine = FirstRecord();
     if(blnsIsQuarantine)
     {
      Inputs.SetProperty(""Quarantine Period"",bcQuarantine.GetFieldValue(""Quarantine Period""));
      Inputs.SetProperty(""Quarantine UOM"",bcQuarantine.GetFieldValue(""Quarantine UOM""));
     }//end of if(blnsIsQuarantine)
    }//end of else
   }//end of with(bcQuarantine)
  }//end of if(FirstRecord())
 }//end of with(bcNumberScheme)
 
 }//try
 catch(e) {
    throw(e.toString());
         }
 finally
 {
 bcNumberScheme = null;
 bcQuarantine   = null;
 boNumberScheme = null;
 
 }
 }//end of function"
function NumberReturn(Inputs,Outputs)
{
  try
  { 
   
    
      var AppObj = TheApplication();
      var vMSISDN = Inputs.GetProperty(""MSISDN"");
      var bcNumberMaster = AppObj.GetBusObject(""RMS NM Number Enquiry"").GetBusComp(""RMS NM Number Enquiry"");
    var StrSerAcc = AppObj.GetBusObject(""STC Service Account"").GetBusComp(""CUT Service Sub Accounts"");
    var strQuarantineEvent= AppObj.InvokeMethod(""LookupValue"", ""NM_QUARANTINE_EVENT"", ""Service Termination""); 
    var dtQuarantineDateObj = new Date();
    with(bcNumberMaster)
    {
 // ActivateField(""MSISDN Number""); 
  ActivateField(""Assigned Id"");
        ActivateField(""Assoc Start Id"");
        ActivateField(""Quarantine Date"");
        ActivateField(""Reserved To"");
        ActivateField(""Reservation End Date"");
        ActivateField(""Assigned Date"");
        ActivateField(""Available Date"");
        ActivateField(""Number String"");
  ActivateField(""Is Associated"");
  ActivateField(""Allocation Id"");
  ActivateField(""Reserve Id"");
  ActivateField(""Block Id"");
  ActivateField(""Scheme Id"");
  ActivateField(""Current Date"");
  ActivateField(""Disconnect Type"");
  ActivateField(""Reuse After Disconnect"");
  ActivateField(""Status Date"");
  ActivateField(""Using Type"");
  ActivateField(""Allocated To"");
  ActivateField(""Reservation End Date"");
     SetViewMode(AllView);
     ClearToQuery();
     SetSearchSpec(""Type"", ""MSISDN"");
     SetSearchSpec(""Number String"", vMSISDN);
     ExecuteQuery(ForwardOnly); 
     var isMSISDNRec = FirstRecord();
     if(isMSISDNRec)
     {
      SetFieldValue(""Quarantine Date"",GetFieldValue(""Current Date""));
      SetFieldValue(""Status Date"",GetFieldValue(""Current Date""));
      GetQuarantineDetails(Inputs,bcNumberMaster.GetFieldValue(""Scheme Id""),bcNumberMaster.GetFieldValue(""Number String""), strQuarantineEvent);
      var strQuarantinePeriod= Inputs.GetProperty(""Quarantine Period"");
      var strQuarantineUOM = Inputs.GetProperty(""Quarantine UOM"");
      dtQuarantineDateObj = CalcAvailableDate(strQuarantineUOM, strQuarantinePeriod, bcNumberMaster);
      var strToStatus = TheApplication().InvokeMethod(""LookupValue"", ""NM_NUMBER_STATUS"", ""QUARANTINE"");
      SetUserProperty(""SuppressScript"",""Y"");
      SetFieldValue(""Status"", strToStatus);
      SetFieldValue(""Assigned Id"", """");
     // SetFieldValue(""Reservation End Date"","""");
      SetFieldValue(""Assigned Date"","""");
      SetFieldValue(""Available Date"",DateToString(dtQuarantineDateObj));
      SetFieldValue(""Disconnect Type"",TheApplication().InvokeMethod(""LookupValue"", ""RMS_DISCONNECT_TYPE"", ""T""));
      WriteRecord();
     
     }
  
  } //with(RMSNMEnquiry)
 }
 catch(e)
 {
  throw(e)
   }
 finally
 {
 
 } 
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 if(MethodName == ""NumberReturn"")
  { 
   NumberReturn(Inputs,Outputs)
   return(CancelOperation);
   }
   
 return (ContinueOperation);
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 if(MethodName == ""UpdateRecord"")
  { 
   UpdateRecord(Inputs,Outputs)
   return(CancelOperation);
   }
   
 return (ContinueOperation);

}
function UpdateRecord(Inputs,Outputs)
{
 
 try
 {     //try
  var vSeqNo;
  //vSeqNo = Inputs.GetProperty(""SeqNo"");
  var vBOLOV = TheApplication().GetBusObject(""List Of Values"");
     var vBCLOV = vBOLOV.GetBusComp(""List Of Values"");
    
    // var vincSeqNo = ++vSeqNo;
    // var vincSeqNo = ToInteger(ToInteger(vSeqNo)  + 1);
     var vType = ""STC_MNP_SEQUENCE_NO"";
     var vName = ""MNPSEQUENCENO"";
      
  with(vBCLOV)
     {      //with
       SetViewMode(3);
      ActivateField(""Type"");
      ActivateField(""Value"");
      ActivateField(""Name"");
      ClearToQuery();
      SetSearchSpec(""Type"",vType);
      SetSearchSpec(""Name"",vName);
      ExecuteQuery(ForwardOnly);
     var isRecord = FirstRecord();
     vSeqNo = GetFieldValue(""Value"");
     
   if(isRecord != null)
    {  // if
     var vincSeqNo = ToInteger(ToInteger(vSeqNo)+ 1);
     SetFieldValue(""Value"",vincSeqNo);
     WriteRecord();
                                                                                InvokeMethod(""RefreshRecord"");
                                                                                 Outputs.SetProperty(""SeqNo"",vSeqNo);

                                                                     }       // if                       
  } // with
 }  // try
 catch(e)
 {
  TheApplication().RaiseError(e.toString);
   
 }
 finally
 {
  vBOLOV = null;
  vBCLOV = null;
 
 } 
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 if(MethodName == ""UpdateRecord"")
  { 
   UpdateRecord(Inputs,Outputs)
   return(CancelOperation);
   }
   
 return (ContinueOperation);

}
function UpdateRecord(Inputs,Outputs)
{
 
 try
 {     //try
  var vSeqNo;
  vSeqNo = Inputs.GetProperty(""SeqNo"");
  var vBOLOV = TheApplication().GetBusObject(""List Of Values"");
     var vBCLOV = vBOLOV.GetBusComp(""List Of Values"");
    
  
     var vType = ""STC_ORDER_RESULT_CODE"";
     var vName = ""Result"";
      
  with(vBCLOV)
     {      //with
       SetViewMode(3);
      ActivateField(""Type"");
      ActivateField(""Value"");
      ActivateField(""Name"");
      ClearToQuery();
      SetSearchSpec(""Type"",vType);
      SetSearchSpec(""Name"",vName);
      ExecuteQuery(ForwardOnly);
     var isRecord = FirstRecord();
         
   if(isRecord != null)
    {  // if
     
     SetFieldValue(""Value"",vSeqNo);
     WriteRecord();
                                                                                InvokeMethod(""RefreshRecord"");
                                                                          

                                                                     }       // if                       
  } // with
 }  // try
 catch(e)
 {
  TheApplication().RaiseError(e.toString);
   
 }
 finally
 {
  vBOLOV = null;
  vBCLOV = null;
 
 } 
}
"var vErrorMessage = """";
var vErrorCode = """";"
function Import_Bulk_File( Inputs , Outputs)
{


  // try
  // {
 var vInputFile      = """";
 var vReadFromFile   = """";
 var vBulkDataArray  = """";    
 var MInputs = TheApplication().NewPropertySet();
 var MOutputs = TheApplication().NewPropertySet();
 var vFileName   = Inputs.GetProperty(""FileName"");
 var vFileType     = ToString(Inputs.GetProperty(""FileType""));
 vFileType       = Clib.strlwr(vFileType);

      if( vFileType != ""csv"")
      {
         TheApplication().RaiseErrorText(""Please check the File Type , It should be :  FileName.CSV"");
      }
      vInputFile     = Clib.fopen(vFileName , ""rt"");       
      vReadFromFile  = Clib.fgets(vInputFile); 
//TheApplication().RaiseErrorText(vReadFromFile);     
      while((vReadFromFile != null) && (vReadFromFile.length > 1))
      {
  vBulkDataArray = vReadFromFile.split("",""); 
  var temp = vBulkDataArray[0].length;          
  vReadFromFile = Clib.fgets(vInputFile);
  Inputs.SetProperty(""MSISDN"", vBulkDataArray[0]);

  //MInputs.SetProperty(""Status"", vBulkDataArray[1]);
 Inputs.SetProperty(""MSISDN"" ,vBulkDataArray[0].substr(0 ,(temp-1))); 
  
  var MWorkflowProc = TheApplication().GetService(""Workflow Process Manager""); 
  Inputs.SetProperty(""ProcessName"",""STC Aync WF"");

  MWorkflowProc.InvokeMethod(""RunProcess"", Inputs, Outputs);           
      }
     
 //  }
  /* catch(m)  
   {
      vErrorMessage = m.toString();
      vErrorCode    = m.errCode;
   }
finally
{
}*/
 
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{

if( MethodName == ""Import"")
    {
      Import_Bulk_File( Inputs, Outputs );
      return(CancelOperation);
    }
 return (ContinueOperation);
}
function QueryMediationData(Inputs,Outputs)
{

try
{
	var appObj = TheApplication();
	var MediationBO = appObj.GetBusObject(""STC Mediation BO""); 
	var MediationBC = MediationBO.GetBusComp(""STC Mediation EBC"");
	var Msisdn = Inputs.GetProperty(""MSISDN"");   
	//var Status = Inputs.GetProperty(""Status"");  

with (MediationBC)   
   {     

    ActivateField(""Msisdn""); 
    ActivateField(""Status"");
    SetViewMode(AllView); 
    ClearToQuery(); 
    //vSExp = "" [Order Header Id] = '""+ OrderId +""'""; 
    SetSearchSpec(""Msisdn"", Msisdn); 


   	// var vSExp  = "" [Msisdn] = '""+ Msisdn +""'"";//  + ""AND "" + ""[Status] = '1'"";    
	// SetSearchExpr(vSExp); 

 	ExecuteQuery(ForwardOnly);

 	var RecExists = FirstRecord();
  
 if(RecExists)
 	{

       	var MDN = GetFieldValue(""Msisdn"");
        var Status1 = GetFieldValue(""Status"");
		//TheApplication().RaiseErrorText(MDN);
 	}
   }
}
catch(e)
{
}
finally
	{
		MediationBC = null;
		MediationBO = null;
		appObj = null
	}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
  if(MethodName ==""Query"")
    {
       QueryMediationData(Inputs,Outputs);
       return(CancelOperation);
    }
    
 return (ContinueOperation);
}
function QueryMediationData(Inputs,Outputs)
{

try
{

	var appObj = TheApplication();
	var MediationBO = appObj.GetBusObject(""STC Mediation BO""); 
	var MediationBC = MediationBO.GetBusComp(""STC Mediation EBC"");
	var Msisdn = Inputs.GetProperty(""MSISDN"");   
	//var Status = Inputs.GetProperty(""Error Message"");  
	
	var Status='1';
	var strdate = new Date; 
	var strStatusChangeDate = (strdate.getMonth()+1) + ""/"" + strdate.getDate() + ""/"" + strdate.getFullYear() + "" "" + strdate.getHours() + "":"" + strdate.getMinutes() + "":"" + strdate.getSeconds();
	
	with (MediationBC)   
   {     

    ActivateField(""Msisdn""); 
    ActivateField(""Status"");
   	ActivateField(""EventTime"");
    SetViewMode(AllView); 
    ClearToQuery();     
    var vSExp  = "" [Msisdn] = '""+ Msisdn +""'"";// AND  [Status] = '"" + Status + ""'"";   
 	SetSearchExpr(vSExp); 
 	ExecuteQuery(ForwardBackward);
 	var RecExists = FirstRecord();
 	if(RecExists)
 	{
		//TheApplication().RaiseErrorText(RecExists);
       	var MDN = GetFieldValue(""Msisdn"");
       	var Status1 = GetFieldValue(""Status"");

		SetFieldValue(""Status"" ,Status);
		// SetFieldValue(""EventTime"" ,strStatusChangeDate );
		WriteRecord();
 	}
   }
}

catch(e)
{
//TheApplication().RaiseErrorText(""e"");
}
finally
{
MediationBC = null;
MediationBO = null;
appObj = null;
}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs) 
{ 
  if(MethodName ==""Query"") 
    { 
 
       QueryMediationData(Inputs,Outputs); 
       return(CancelOperation); 
    } 
     
 return (ContinueOperation); 
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
 try
 {
    switch(MethodName)
     {

     
     case ""SetMNPPaidFalg"":
     SetMNPPaidFalg(Inputs, Outputs);
     return(CancelOperation);
     break;
      
       default:
          return (ContinueOperation);
       }
 }
 catch (exc)
 {
 throw(exc.toString());
 }
  finally 
 {
 }  
}
function SetMNPPaidFalg(Inputs, Outputs)
{
try
{
var MSISDN = Inputs.GetProperty(""MSISDN"");
var OrderId = Inputs.GetProperty(""OrderId"");
var AppObj:Application = TheApplication();
var SpecCat;
var MNP;
var MigType;
var RMSbo:BusObject = AppObj.GetBusObject(""RMS NM Number Enquiry"");
var RMSbc:BusComp = RMSbo.GetBusComp(""RMS NM Number Enquiry"");
var StrOrderbo:BusObject = AppObj.GetBusObject(""Order Entry (Sales)"");
var StrOrderbc:BusComp = StrOrderbo.GetBusComp(""Order Entry - Orders"");

with(StrOrderbc)
{
	ActivateField(""STC MNP Port Out"");
	ActivateField(""Delivery Block"");
	SetViewMode(AllView);
	ClearToQuery();
	SetSearchSpec(""Id"", OrderId);
	ExecuteQuery(ForwardOnly);
	var IsOrderRec = FirstRecord();
	if(IsOrderRec)
	{
		MigType = GetFieldValue(""Delivery Block"");
		MNP = GetFieldValue(""STC MNP Port Out"");
	}
}// end of StrOrderbc

var FoundMig = AppObj.InvokeMethod(""LookupValue"",""STC_MIG_VANITY_ALL"",MigType);
	var FoundAllMig = FoundMig.substring(0,6);
	if(FoundAllMig == ""MIGVAN"" || MNP == ""Y"")
	{
			
			with(RMSbc)
			{
				ActivateField(""STC Vanity Paid"");
				ActivateField(""Special Category Type"");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchSpec(""Number String"", MSISDN);
				ExecuteQuery(ForwardOnly);
				var IsRec = FirstRecord();
				if(IsRec)
				{
				SpecCat = GetFieldValue(""Special Category Type"");
				if(SpecCat != null || SpecCat != """")
				{
					SetFieldValue(""STC Vanity Paid"", ""Yes"");
					
				}
				else
				{
					SetFieldValue(""STC Vanity Paid"", ""No"");
				}
			    	WriteRecord();
				}
				
			}

}// end of 	if(FoundAllMig == ""MIGVAN"" || MNP == ""Y"")

}//end of try
catch (e)
{
 TheApplication().RaiseErrorText(e.toString());
}// end of catch
finally
{

}// end of finally
}// end of functi"
function CreateLineItems(Inputs, Outputs)
{

 try
 { 
   var boOrderEntry = """";
   var bcOrderEntry = """";
   var bcOrderItems = """";
   var strRootObjectId;
   var strPartNumber; 
   var searchspec;
   var record;
            var strObjectId = Inputs.GetProperty(""Object Id"");
           	var PartNumber = Inputs.GetProperty(""PartNumber"");
           if (strObjectId != """" || strObjectId != null)
           {
      			 boOrderEntry = TheApplication().GetBusObject(""Order Entry (Sales)"");
   				 bcOrderEntry = boOrderEntry.GetBusComp(""Order Entry - Orders"");  
			    with (bcOrderEntry)
			    {
			     SetViewMode(AllView);
			     ClearToQuery();
			     SetSearchSpec(""Id"", strObjectId);
			     ExecuteQuery(ForwardOnly);
			    }
                if(bcOrderEntry.FirstRecord())
                 {
                 	 bcOrderItems = boOrderEntry.GetBusComp(""Order Entry - Line Items"");
                 	 searchspec = '[Order Header Id] = ""' + strObjectId + '"" AND ([Parent Order Item Id] IS NULL OR [Parent Order Item Id] ="""")';
				      with (bcOrderItems)
				      {	
				         SetViewMode(AllView);
					     ClearToQuery();
					     SetSearchExpr(searchspec);
					     ExecuteQuery(ForwardOnly);
				       if(FirstRecord())
	                     { 
	                        // NextRecord();
					      strRootObjectId = GetFieldValue(""Id"");
					      InvokeMethod(""EnableCopyExtAttr"");
					      InvokeMethod(""EnableConfigCxProd"");
					      SetUserProperty(""Skip Loading Default Cfg Instance"",""N"");					       
				          NewRecord (NewAfter);
				          SetFieldValue(""Part Number"", PartNumber); 
				          SetFieldValue(""Root Order Item Id"", strRootObjectId);
				          SetFieldValue(""Parent Order Item Id"", strRootObjectId);
				          WriteRecord();					        
					     } 		
					    }
					    bcOrderItems = null;
					    boOrderEntry = null;
					}
				boOrderEntry = TheApplication().GetBusObject(""Order Entry (Sales)"");
   				 bcOrderEntry = boOrderEntry.GetBusComp(""Order Entry - Orders"");  
			    with (bcOrderEntry)
			    {
			     SetViewMode(AllView);
			     ClearToQuery();
			     SetSearchSpec(""Id"", strObjectId);
			     ExecuteQuery(ForwardOnly);
			    }
			      if(bcOrderEntry.FirstRecord())
                 {
                  bcOrderItems = boOrderEntry.GetBusComp(""Order Entry - Line Items"");
					  with (bcOrderItems)
				      {	
				      			       
						 SetViewMode(AllView);
					     ClearToQuery();
					     SetSearchSpec(""Order Header Id"", strObjectId);
					     ExecuteQuery(ForwardOnly);
					     var count = CountRecords();				     
					     record = FirstRecord();
					     while(record)
					     {
					     var prodname = GetFieldValue(""Part Number"");
					    if(prodname == PartNumber) 
					     SetFieldValue(""Parent Order Item Id"", strRootObjectId);
					     SetFieldValue(""Root Order Item Id"", strRootObjectId);
							record=NextRecord();				    
					     }
					      WriteRecord();
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
  bcOrderItems = null;
  bcOrderEntry = null;
  boOrderEntry = null;
 }
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	if(MethodName == ""CreateLineItems"")
	{
		CreateLineItems(Inputs, Outputs);
			return (CancelOperation);
	}
	
	return (ContinueOperation);
}
function CheckOrderActivity(Inputs,Outputs)
{
 var appObj;
 var boAction;
 var bcAction;
 var SearchStr;
 var isRecord;
 var PercentComplete;
 var SLAFlag;
  
 try
 {
    appObj = TheApplication();
    boAction = appObj.GetBusObject(""Action"");
    bcAction = boAction.GetBusComp(""Action"");
    
    
    with(bcAction)
    {
       ActivateField(""Type"");
       ActivateField(""Status"");
       ActivateField(""Order Id"");
       ActivateField(""Percent Complete"");
       SetViewMode(AllView);
       ClearToQuery();
       SearchStr = ""[Type] ="" + ""'Monitor'"" + ""AND [Status] ="" + ""'Open'"" + "" AND [Order Id] <> 'null'""
       SetSearchExpr(SearchStr);
      // SetSearchSpec(""Id"",""1-5AWKF"");
       ExecuteQuery(ForwardOnly);
       isRecord = FirstRecord();
       var count = CountRecords();
       while(isRecord)
       {
        var psInputs = appObj.NewPropertySet();
        var psOutputs = appObj.NewPropertySet();
        psInputs.SetProperty(""Object Id"",GetFieldValue(""Order Id""));
        psInputs.SetProperty(""Created Date"",GetFieldValue(""Created""));
        psInputs.SetProperty(""Commit Date"", GetFieldValue(""Due""));
        psInputs.SetProperty(""Activity Id"",GetFieldValue(""Id""));
        psInputs.SetProperty(""Percent Complete"", GetFieldValue(""Percent Complete""));
        psInputs.SetProperty(""ProcessName"",""STC Orders SLA Workflow"");
        var callWf = appObj.GetService(""Workflow Process Manager"");
        callWf.InvokeMethod(""RunProcess"",psInputs,psOutputs);
       /* SLAFlag = psOutputs.GetProperty(""SLA Completed Flag"");
        PercentComplete = psOutputs.GetProperty(""Percent Complete"");
        if(SLAFlag == ""Y"" && PercentComplete == ""4"")
        {
            SetFieldValue(""Status"",""Done"");
        }
        if(SLAFlag == ""N"" && PercentComplete != ""4"")
        {
            SetFieldValue(""Percent Complete"",PercentComplete);
        }    
         
        WriteRecord(); */
        isRecord = NextRecord();
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
function CheckSRActivity(Inputs,Outputs)
{
 var appObj;
 var boAction;
 var bcAction;
 var SearchStr;
 var isRecord;
 var SLAFlag;
 var PercentComplete;
   
 try
 {
    appObj = TheApplication();
    boAction = appObj.GetBusObject(""Action"");
    bcAction = boAction.GetBusComp(""Action"");
    
    with(bcAction)
    {
       ActivateField(""Type"");
       ActivateField(""Status"");
       ActivateField(""Activity SR Id"");
       SetViewMode(AllView);
       ClearToQuery();
       SearchStr = ""[Type] ="" + ""'Monitor'"" + ""AND [Status] ="" + ""'Open'"" + ""AND [Activity SR Id] <> 'null'""
       SetSearchExpr(SearchStr);
      // SetSearchSpec(""Id"",""1-5TSXO"");
       ExecuteQuery(ForwardOnly);
       isRecord = FirstRecord();
       var count = CountRecords();
       while(isRecord)
       {
        var psInputs = appObj.NewPropertySet();
        var psOutputs = appObj.NewPropertySet();
        psInputs.SetProperty(""Object Id"",GetFieldValue(""Activity SR Id""));
        psInputs.SetProperty(""Activity Id"",GetFieldValue(""Id""));
        psInputs.SetProperty(""Created Date"",GetFieldValue(""Created""));
        psInputs.SetProperty(""Commit Date"", GetFieldValue(""Due""));
        psInputs.SetProperty(""Percent Complete"", GetFieldValue(""Percent Complete""));
        psInputs.SetProperty(""ProcessName"",""STC Service Request SLA Workflow"");
        var callWf = appObj.GetService(""Workflow Process Manager"");
        callWf.InvokeMethod(""RunProcess"",psInputs,psOutputs);
       /* SLAFlag = psOutputs.GetProperty(""SLA Completed Flag"");
        PercentComplete = psOutputs.GetProperty(""Percent Complete"");
        if(SLAFlag == ""Y"" && PercentComplete == ""4"")
        {
            SetFieldValue(""Status"",""Done"");
        }
        if(SLAFlag == ""N"" && PercentComplete != ""4"")
        {
            SetFieldValue(""Percent Complete"",PercentComplete);
        }  */  
        isRecord = NextRecord();
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
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
var ireturn;
try
{
	 ireturn = ContinueOperation;
	 switch(MethodName)
	 {
	     case ""CheckOrderMonitorActivities"":
	     		CheckOrderActivity(Inputs,Outputs);
	     		ireturn = CancelOperation;
	     		break;
	     case ""CheckSRMonitorActivities"":
	     		CheckSRActivity(Inputs,Outputs);
	     		ireturn = CancelOperation;
	     		break; 		
	     default :
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
}    	  
 		
	
	
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
 
 try
 {
    switch(MethodName)
     {
    case ""UpdateBANs"":
     UpdateBANs(Inputs, Outputs);
     return(CancelOperation);
     break;

      default:
          return (ContinueOperation);
       }
 }
 catch (exc)
 {
 throw(exc.toString());
 }
  finally 
 {
 }  
}
function UpdateBANs(Inputs,Outputs)
{
var BatchId = Inputs.GetProperty(""BatchId"");
var sApp = TheApplication();
var BillAccBO = sApp.GetBusObject(""STC Billing Account"");
var AccountBO = sApp.GetBusObject(""Account"");
var AccountBC = AccountBO.GetBusComp(""Account"");
var BillAccBC = BillAccBO.GetBusComp(""CUT Invoice Sub Accounts"");
//var PrepaidHeaderBC = BillAccBO.GetBusComp(""STC Business Prepaid Header BC"");
var PrepaidBO = sApp.GetBusObject(""STC Business Prepaid Registration BO"");
var PrepaidHeaderBC = PrepaidBO.GetBusComp(""STC Business Prepaid Header BC"");
var PrepaidRegBC = PrepaidBO.GetBusComp(""STC Business Prepaid Registration BC"");
var ThinBillingBO = sApp.GetBusObject(""STC Thin Billing Account BO"");
var ThinBillAccBC = ThinBillingBO.GetBusComp(""STC Thin CUT Invoice Sub Accounts"");
var ThinSerAccBC = ThinBillingBO.GetBusComp(""STC Thin CUT Service Sub Accounts"");
var BillAccId;
var ParentAccId,AccountId,AccountName,ContactId,AddressId,Segment,CustomerType,IDType,IDNumber;
with(PrepaidHeaderBC)
{
	ActivateField(""Billing Account Id"");
	SetViewMode(AllView);
	ClearToQuery();
	SetSearchSpec(""Id"", BatchId);
	ExecuteQuery();
	var isRec = FirstRecord();
	if(isRec)
	{
		BillAccId = GetFieldValue(""Billing Account Id"");
	}
}
with(BillAccBC)
{	ActivateField(""Master Account Id"");
	SetViewMode(AllView);
	ClearToQuery();
	SetSearchSpec(""Id"",BillAccId);
	ExecuteQuery();
	var BillAcc = FirstRecord();
	if(BillAcc)
	{
		AccountId = GetFieldValue(""Master Account Id"");
	}
}

with(AccountBC)
{
	ActivateField(""Tax ID Number"");
	ActivateField(""Primary Contact Id"");
	ActivateField(""Primary Address Id"");
	ActivateField(""STC Contract Category"");
	ActivateField(""Type"");
	ActivateField(""Survey Type"");
	SetViewMode(AllView);
	ClearToQuery();
	SetSearchSpec(""Id"", AccountId);
	ExecuteQuery();
	var AccRec = FirstRecord();
	if(AccRec)
	{
		AccountName = GetFieldValue(""Name"");
		ContactId = GetFieldValue(""Primary Contact Id"");
		AddressId = GetFieldValue(""Primary Address Id"");
		Segment = GetFieldValue(""STC Contract Category"");
		CustomerType = GetFieldValue(""Type"");
		IDType = GetFieldValue(""Survey Type"");
		IDNumber = GetFieldValue(""Tax ID Number"");
	}
}

with(PrepaidHeaderBC)
{
		ActivateField(""Billing Account Id"");
		ActivateField(""Request Status"");
		SetViewMode(AllView);
		ClearToQuery();
		SetSearchSpec(""Id"", BatchId);
		ExecuteQuery();
		var isRec = FirstRecord();
		if(isRec)
		{
		
			with(PrepaidRegBC)
			{
				ActivateField(""SAN Bill Account Id"");
				ActivateField(""Service Account Id"");
				ActivateField(""Status"");
				SetViewMode(AllView);
				ClearToQuery();
				SetSearchSpec(""Batch Id"", BatchId);
				SetSearchSpec(""Status"", ""Submitted"");
				ExecuteQuery();
				var FRec = FirstRecord();
				while(FRec)
				{
					var SANId = GetFieldValue(""Service Account Id"");
					var PreBillId = GetFieldValue(""SAN Bill Account Id"");
					with(ThinBillAccBC)
					{
							InvokeMethod(""SetAdminMode"", ""TRUE"");
							ActivateField(""Name"");
							ActivateField(""Type"");
							ActivateField(""Primary Address Id"");
							ActivateField(""STC Contract Category"");
							ActivateField(""Primary Contact Id"");
							ActivateField(""Parent Account Id"");
							ActivateField(""Master Account Id"");
							ActivateField(""STC Corporate Type"");
							
							SetViewMode(AllView);
							ClearToQuery();
							SetSearchSpec(""Id"", PreBillId);
							ExecuteQuery();
							var BanRec = FirstRecord();
							if(BanRec)
							{
								SetFieldValue(""Name"",AccountName);
								SetFieldValue(""Type"", CustomerType);
								SetFieldValue(""Primary Address Id"",  AddressId);
								SetFieldValue(""STC Contract Category"", Segment);
								SetFieldValue(""Primary Contact Id"", ContactId);
								SetFieldValue(""Parent Account Id"", BillAccId);
								SetFieldValue(""Master Account Id"", AccountId);
								SetFieldValue(""STC Corporate Type"", ""Individual"");
								WriteRecord();
							}
						}//with(ThinBillAccBC)
						with(ThinSerAccBC)
					{
							InvokeMethod(""SetAdminMode"", ""TRUE"");
							ActivateField(""Name"");
							ActivateField(""Type"");
							ActivateField(""Primary Address Id"");
							ActivateField(""STC Contract Category"");
							ActivateField(""Primary Contact Id"");
							ActivateField(""Master Account Id"");
							ActivateField(""STC ID Type"");
							ActivateField(""STC ID #"");
							SetViewMode(AllView);
							ClearToQuery();
							SetSearchSpec(""Id"", SANId);
							ExecuteQuery();
							var BanRec = FirstRecord();
							if(BanRec)
							{
								SetFieldValue(""Name"",AccountName);
								SetFieldValue(""Type"", CustomerType);
								SetFieldValue(""Primary Address Id"",  AddressId);
								SetFieldValue(""STC Contract Category"", Segment);
								SetFieldValue(""Primary Contact Id"", ContactId);
								SetFieldValue(""Primary Contact Id"", ContactId);
								SetFieldValue(""STC ID Type"", IDType);
								SetFieldValue(""STC ID #"", IDNumber);
								SetFieldValue(""Master Account Id"", AccountId);
								WriteRecord();
							}
						}//with(ThinSerAccBC)
					SetFieldValue(""Status"", ""Completed"");
					WriteRecord();
					FRec = NextRecord();
				}//	while(FRec)
		
			}//with(PrepaidRegBC)
			SetFieldValue(""Request Status"", ""Completed"");
			WriteRecord();
		}
}


}//function UpdateBANs(Inputs,Outputs)"
"var sErrorCode = """";
var sErrorMsg = """";"
"//***********************************************************************************************************//
//Purpose: 1) To Associate the Primary Contact and Primary Address of the Customer Account to the Billing Account Created under it
//Inputs: Billing Account Id, Primary Contact Id & Primary Address Id of the Customer Account
//Outputs: 
//Author: Rajitha P G
//Release: R1.0
//Date: 29-Oct-09
//*************************************************************************************************************//
function CopyCustomerDetails(Inputs,Outputs)
{
	var sBillAccntId;
	var isRecord;
	var sConPriAddrId;
	var sCopyAddress;//NEW
	var sAccountType;//NEW
	var sContactId;
	var bcAddrMVG;
	var bcAddrAssoc;
	var bcContactMVG;
	var bcContactAssoc;
	var sCustAccntId;
	var appObj;
	var bcBillAcnt;
	var boAccount;
	var bcAccount;
	var bcContact;
	try
	{
			appObj = TheApplication();
			with(Inputs)
			{
				sCopyAddress = GetProperty(""CopyAddress"");//NEW
				sAccountType = GetProperty(""AccountType"");//NEW
				sBillAccntId = GetProperty(""BillingAccountId"");
				sConPriAddrId = GetProperty(""PrimaryAddrId"");
				sContactId = GetProperty(""PrimaryCustId"");
				sCustAccntId = GetProperty(""CustAccountId"");
			}            
			if(sBillAccntId != """" && sBillAccntId != null)
			{
				boAccount = appObj.GetBusObject(""STC Billing Account"");
				bcBillAcnt = boAccount.GetBusComp(""CUT Invoice Sub Accounts"");
				with(bcBillAcnt)
				{
					SetViewMode(AllView);
					ClearToQuery();
					SetSearchSpec(""Id"",sBillAccntId);
					ExecuteQuery(ForwardOnly);
					isRecord = FirstRecord();                                                                             
					if(isRecord)
					{
					if(sAccountType == ""Corporate"")
					{
					if(sCopyAddress == ""Y"")
					   { 
						bcAddrMVG = GetMVGBusComp(""Street Address"");
						with(bcAddrMVG)
						{
							bcAddrAssoc = GetAssocBusComp();
							with(bcAddrAssoc)
							{
								SetViewMode(AllView);
								ClearToQuery();
								SetSearchSpec(""Id"",sConPriAddrId);
								ExecuteQuery(ForwardOnly);
								isRecord = FirstRecord();                                                                             
								if(isRecord)
								{
									Associate(NewAfter);
								}
							}
							WriteRecord();
						}
					    }
					}
					else
					{
					bcAddrMVG = GetMVGBusComp(""Street Address"");
						with(bcAddrMVG)
						{
							bcAddrAssoc = GetAssocBusComp();
							with(bcAddrAssoc)
							{
								SetViewMode(AllView);
								ClearToQuery();
								SetSearchSpec(""Id"",sConPriAddrId);
								ExecuteQuery(ForwardOnly);
								isRecord = FirstRecord();                                                                             
								if(isRecord)
								{
									Associate(NewAfter);
								}
							}
							WriteRecord();
						}
					}
                                                 }
						bcContactMVG = GetMVGBusComp(""Primary Contact Last Name"");
						with(bcContactMVG)
						{
							bcContactAssoc = GetAssocBusComp();
							with(bcContactAssoc)
							{
								SetViewMode(AllView);
								ClearToQuery();
								SetSearchSpec(""Id"",sContactId);
								ExecuteQuery(ForwardOnly);
								isRecord = FirstRecord();                                                                             
								if(isRecord)
								{
									Associate(NewAfter);
								}
							}
							WriteRecord();
						}
					}
	                                    bcContact = boAccount.GetBusComp(""Contact"");
				with(bcContact)
				{
				   ActivateField(""Master Account Id"");
				   SetViewMode(AllView);
				   ClearToQuery();
				   SetSearchSpec(""Id"",sContactId);
				   ExecuteQuery(ForwardOnly);
				   isRecord = FirstRecord(); 
				   if(isRecord)
				   {
				       SetFieldValue(""Master Account Id"",sCustAccntId);
				       WriteRecord();			       
				   }
			            }      
			}
		}	
	catch(e)
	{
		LogException(e);
	}
	finally
	{
		bcAddrMVG = null;
		bcAddrAssoc = null;
		bcContactMVG = null;
		bcContactAssoc = null;
		bcBillAcnt = null;
		boAccount = null;
	 	appObj = null;
	}

}
"//***********************************************************************************************************//
//Purpose: 1) To Log the exceptions in Custom Error Log Table
//Inputs: Error Message
//Author: Rajitha P G
//Release: R1.0
//Date: 29-Oct-09
//*************************************************************************************************************//
function LogException(e)
{
	var appObj;
  	var psInput;
  	var psOutput;
  	var bsErrorHandler; 
	try
 	{
		  appObj = TheApplication();
		  with(appObj)
		  {
			  psInput = NewPropertySet();
			  psOutput = NewPropertySet();
			  bsErrorHandler = GetService(""STC Generic Error Handler"");
		  }
		  with(psInput)
		  {
			  SetProperty(""Error Code"", e.errCode);
			  SetProperty(""Error Message"", e.errText);
			  SetProperty(""Object Name"", ""STC New Customer Validation"");
			  SetProperty(""Object Type"", ""Buisness Service"");
		  }
		  bsErrorHandler.InvokeMethod(""Log Message"", psInput, psOutput);
 	}
 	catch(e)
 	{
  		// do nothing	
 	}
 	finally
 	{
 
		  bsErrorHandler = null;
		  psOutput = null;
		  psInput = null;
		  appObj = null;
 	}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
try
{
	var ireturn;
	
		ireturn = ContinueOperation;
		switch(MethodName)
		{
			case ""ValidateCustomer"":
				ValidateCustomer(Inputs, Outputs);		
				ireturn = CancelOperation;
				break;
			case ""CopyCustomerDetails"":
				CopyCustomerDetails(Inputs, Outputs);		
				ireturn = CancelOperation;
				break;	
			default:
				ireturn = ContinueOperation;
		}
		return(ireturn);
	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
		sErrorMsg = """";
		sErrorCode ="""";
	}
}
function ValidateAlternateNumber(sPhone,psOutputs)
{
try
{  
var sErrorCode = """";
var sErrorMsg = """";
var sMesg ="""";
var appObj;
//var psOutputs;

appObj = TheApplication();
//psOutputs = appObj.NewPropertySet();
var sub_strng = sPhone.substr(0,2); 
var sub_strng1 = sPhone.substr(0,1);
with(appObj)
{
  if(sPhone != """" && sPhone != null)
			{
				if(!isNaN(sPhone))
				{
				
					 if(sPhone.length < 8 || sPhone.length > 8)
					{
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0004"") +""\n"";
						sErrorCode += ""AM0004 \n"";					
					}					
										
				}
			else
			{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0005"") +""\n"";
				sErrorCode += ""AM0005 \n"";
			}			
				
		if(!(sub_strng==""33"" || sub_strng==""34""|| sub_strng==""36"" || sub_strng==""37"" || sub_strng==""38"" || sub_strng==""39""))// || sub_strng1==""1"" || sub_strng1==""7"" || sub_strng1==""8"" || sub_strng1==""9""))
		{
		sErrorMsg = LookupMessage(""User Defined Errors"",""AM0059"") +""\n"";  
		sErrorCode = ""AM0059 \n"";
		}							
	}
}//appObj
with(psOutputs)
	{
	SetProperty(""Error Code"", sErrorCode);
	SetProperty(""Error Msg"", sErrorMsg);
	}


} 
catch(e)
{
	LogException(e);
}
finally
{}
return(sErrorMsg)
}
function ValidateCustomer(Inputs, Outputs)
{
	var appObj;
	var sAccountType;
	var sLineOfBusiness;
	var sAccountName;
	var sCR;
	var sAccntLOV;
	var sEmailId;
	var sPhone;
	var sLastName;
	var sFirstName;
	var sMiddleName;
	var sFlatNumber;
	var sFax;
	var i;
	var icode;
	var bSpecCharFlag;
	var sSponsorTelephoneNumber;
	var sDateOfBirth;
	var dDateOfBirth;
	var sID;
	var sIDType;
	var bsDupIDCheck;
	var bDupIDCheckFlag;
	var psDUPInputs;
	var psDUPOutputs;
	var sIDExpiryDate;
	var sSysdate;
	var sCompareDate;
	var dCurrDate;
	var dIDExpDate;
	var sDiffTime;
	var sDateStr;
	var semailAddr;
	var sfirstChar;
    var slastChar;
    var sNot_First_Last;
    var srequiredChars;
    var sillegalChars;
    var scurrent_char;
    var iIndex;
    var ipindex;
    var sMessg;
    var SVC1;
    var psiPS;
    var psoPS;
    var sMesg;
    var sFlatVillaNo;
    var sSponsorIDExpiryDate;
    var sSelfEmployed;
    var sIncomeGroup;
    var sCurrOccupation;
    var sActiveView;
    var sIDTypeLOV;
    var sNationality;
    var sCustomerClass;
    var sManagerName;
	var sApplicantType;
	var sBranchLocal;
	var sBusTel1;
	var sBusTel2;
	var sNumEmp;
	var sOffNum;
	var sOffEmail;
	var psOutputs;
	var sOrgFlg;
	var sContractCategory;
	var sEmailReason;
	try
	{
		appObj = TheApplication();   
		sActiveView = appObj.ActiveViewName();
		with(Inputs)
		{
			sAccountType = GetProperty(""AccountType"");
			sLineOfBusiness = GetProperty(""LineOfBusiness"");
			sAccountName = GetProperty(""AccountName"");
			sPhone = GetProperty(""Phone"");
			sCR = GetProperty(""CR"");
			sEmailId = GetProperty(""EmailId"");
			sEmailReason = GetProperty(""EmailReason"");			
			sLastName = GetProperty(""LastName"");
			sFirstName = GetProperty(""FirstName"");
			sMiddleName = GetProperty(""MiddleName"");
			sDateOfBirth = GetProperty(""DateOfBirth"");
			sID = GetProperty(""ID"");
			sIDType = GetProperty(""IDType"");			
			sFax = GetProperty(""Fax"");
			sIDExpiryDate = GetProperty(""IDExpiryDate"")
			sSponsorTelephoneNumber = GetProperty(""SponsorTelephoneNumber"");
			sFlatVillaNo = GetProperty(""FlatVillaNo"");
			sSponsorIDExpiryDate = GetProperty(""SponsorIDExpiryDate"");
			sSelfEmployed = GetProperty(""SelfEmployed"");
			sIncomeGroup = GetProperty(""IncomeGroup"");
			sCurrOccupation = GetProperty(""CurrentOccupation"");
			sNationality = GetProperty(""Nationality"");
			sCustomerClass = GetProperty(""AccountClass"");
			sManagerName = GetProperty(""AccountManager"");
			sApplicantType = GetProperty(""AccountManager"");
			sBranchLocal = GetProperty(""BranchLocal"");
			sBusTel1 = GetProperty(""BusTeleph1"");
			sBusTel2 = GetProperty(""BusTeleph2"");
			sNumEmp = GetProperty(""EmpolyeeNum"");
			sOffNum = GetProperty(""OffNumber"");
			sOffEmail = GetProperty(""OffEmail"");
			sContractCategory = GetProperty(""ContractCategory"");
		}//with(Inputs)
		with(appObj)
		{
			if(sAccountType != """" && sAccountType != null)
			{
				sAccntLOV = InvokeMethod(""LookupValue"",""STC_CUST_TYPE"",sAccountType); 
				switch(sAccountType)
				{
					
					case ""Corporate"":
							psOutputs = NewPropertySet();
							sOrgFlg = ""N"";
							sErrorMsg= validateCorporate(sOrgFlg,sActiveView,sSelfEmployed,sIncomeGroup,sCurrOccupation,sAccountName,sLineOfBusiness,sNumEmp,sBranchLocal,sFirstName,sLastName,sBusTel1,sManagerName,sOffNum,sOffEmail,sCR,psOutputs);
							sErrorCode = psOutputs.GetProperty(""Error Code"");
							sErrorMsg = psOutputs.GetProperty(""Error Msg"");
							/*if(sErrorMsg!= """" || sErrorMsg!= null)
							{
							TheApplication().RaiseErrorText(sErrorMsg);	
							}*/					
							break;
					case ""Organization"":
							psOutputs = NewPropertySet();
							sOrgFlg =""Y"";
							validateCorporate(sOrgFlg,sActiveView,sSelfEmployed,sIncomeGroup,sCurrOccupation,sAccountName,sLineOfBusiness,sNumEmp,sBranchLocal,sFirstName,sLastName,sBusTel1,sManagerName,sOffNum,sOffEmail,sCR,psOutputs);
							sErrorCode = psOutputs.GetProperty(""Error Code"");
							sErrorMsg = psOutputs.GetProperty(""Error Msg"");
							break;		
					case ""Individual"":
							psOutputs = NewPropertySet();
							ValidateIndividual(sActiveView,sSelfEmployed,sIncomeGroup,sCurrOccupation,sFirstName,sLastName,psOutputs);
							sErrorCode = psOutputs.GetProperty(""Error Code"");
							sErrorMsg = psOutputs.GetProperty(""Error Msg"");
							break;
				}	
			}	
			/*if(sPhone != """" && sPhone != null)
			//{
			 	
			 sErrorMsg= ValidateAlternateNumber(sPhone,psOutputs);
			 psOutputs = NewPropertySet();
			 sErrorCode = psOutputs.GetProperty(""Error Code""); 
			// }*/
			if(sPhone != """" && sPhone != null)
			{
				if(!isNaN(sPhone))
				{
				
					if(sPhone.length < 8)
					{
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0004"") +""\n"";
						sErrorCode += ""AM0004 \n"";
						
					}
					
				}
				else
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0005"") +""\n"";
					sErrorCode += ""AM0005 \n"";
				}								
			}
			if(sBusTel2 != """" && sBusTel2 != null)
			{
				if(!isNaN(sBusTel2))
				{
					if(sBusTel2.length < 8)
					{
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0044"") +""\n"";
						sErrorCode += ""AM0044 \n"";
					}
				}
				else
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0043"") +""\n"";
					sErrorCode += ""AM0043 \n"";
				}				
			}
			if(sFax != """" && sFax != null)
			{
				if(!isNaN(sFax))
				{
					if(sFax.length < 8)
					{
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0008"") +""\n"";
						sErrorCode += ""AM0008 \n"";
					}
				}
				else
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0006"") +""\n"";
					sErrorCode += ""AM0006 \n"";
				}
			}
			if(sSponsorTelephoneNumber != """" && sSponsorTelephoneNumber != null)
			{
				if(!isNaN(sSponsorTelephoneNumber))
				{
					if(sSponsorTelephoneNumber.length < 8)
					{
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0013"") +""\n"";
						sErrorCode += ""AM0013 \n"";
					}
				}
				else
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0014"") +""\n"";
					sErrorCode += ""AM0014 \n"";
				}			
			}
			if (sMiddleName != """" && sMiddleName != null)
			{
				for (i=0;i<sMiddleName.length;i++)
				{ 
					icode = sMiddleName.charCodeAt(i); 
					if (!((icode >= 65) && (icode <= 90) || (icode >= 97) && (icode <= 122) || (icode == 32)))
					{
		
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0012"") +""\n"";
						sErrorCode += ""AM0012 \n"";
						break;
					}
				}
			}
			if (sFlatVillaNo.length>5)
			{
		             sErrorMsg += LookupMessage(""User Defined Errors"",""AM0019"") +""\n"";
					 sErrorCode += ""AM0019 \n"";
			}
			if (!(sContractCategory == ""A"" || sContractCategory == ""B"" || sContractCategory == ""C"" || sContractCategory == ""D"" ))
			{
				if (sID == """" )
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0049"") +"""";
					sErrorCode += ""AM0049"";
				}
				
			}
			if (sContractCategory == ""A"")
			{
				if(sCurrOccupation == ""A"")
				{
				}
				else
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0050"") +"""";
					sErrorCode += ""AM0050"";
				}
			}
			
			if (sContractCategory == ""B"")
			{
				if(sCurrOccupation == ""B"")
				{
				}
				else
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0051"") +"""";
					sErrorCode += ""AM0051"";
				}
			}
			
			if (sContractCategory == ""C"")
			{
				if(sCurrOccupation == ""C"")
				{
				}
				else
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0052"") +"""";
					sErrorCode += ""AM0052"";
				}
			}
			
			if (sContractCategory == ""D"")
			{
				if(sCurrOccupation == ""D"")
				{
				}
				else
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0053"") +"""";
					sErrorCode += ""AM0053"";
				}
			}		
						
			if (sCurrOccupation == ""A"")
			{
				if(sContractCategory == ""A"")
				{
				}
				else
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0050"") +"""";
					sErrorCode += ""AM0050"";
				}
			}
			
			if (sCurrOccupation == ""B"")
			{
				if(sContractCategory == ""B"")
				{
				}
				else
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0051"") +"""";
					sErrorCode += ""AM0051"";
				}
			}
			
			if (sCurrOccupation == ""C"")
			{
				if(sContractCategory == ""C"")
				{
				}
				else
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0052"") +"""";
					sErrorCode += ""AM0052"";
				}
			}
			
			if (sCurrOccupation == ""D"")
			{
				if(sContractCategory == ""D"")
				{
				}
				else
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0053"") +"""";
					sErrorCode += ""AM0053"";
				}
			}
				if ((sContractCategory == ""A"" || sContractCategory == ""B"" || sContractCategory == ""C"" || sContractCategory == ""D"" ))
			{
				if (sIDType == ""VIP"" )
				{
				}
				else
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0054"") +"""";
					sErrorCode += ""AM0054"";
				}
				
			}		
			//Below Code added for defect STC-650 by Sudeep on 29Nov2010			
			if (sIDType == ""VIP"" )
			{
				if ((sContractCategory == ""A"" || sContractCategory == ""B"" || sContractCategory == ""C"" || sContractCategory == ""D"" ))
				{
				}
				else
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0055"") +"""";
					sErrorCode += ""AM0055"";
				}
				
			}
			
			if (sIDType != """" && sIDType != null)
			if (sID != """" && sID != null)
			{			  
			  for (i =0;i<sID.length;i++)
			  {
			      icode = sID.charCodeAt(i);
			      if (!((icode >=65) && (icode <=90) || (icode >= 97) && (icode<= 122) || (icode >= 47) && (icode <=57)))
			      {
			        sErrorMsg += LookupMessage(""User Defined Errors"",""AM0029"") +""\n"";
			        sErrorCode += ""AM0029 \n"";
			        break;
			      }
			  }
			  /*with(appObj)
				{*/
					psDUPInputs = NewPropertySet();
					psDUPOutputs = NewPropertySet();
					bsDupIDCheck = GetService(""STC Contact CheckDuplicateID"");
			//	}
				with(psDUPInputs)
				{
					SetProperty(""StrAccountId"","""");
					SetProperty(""IDType"", sIDType);
					SetProperty(""IDNum"", sID);
					SetProperty(""CustType"",sAccountType);
					SetProperty(""CompId"",sCR);
											
				}
				bsDupIDCheck.InvokeMethod(""CheckDuplicate"",psDUPInputs,psDUPOutputs);
				bDupIDCheckFlag = psDUPOutputs.GetProperty(""gCombExists"");
				if (bDupIDCheckFlag == ""Y"")
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0015"") +""\n"";
					sErrorCode += ""AM0015 \n"";
				}      	  
			} //if (sID != """" && sID != null)
			if(sNationality != sCustomerClass)
			{
				if(sCustomerClass == InvokeMethod(""LookupValue"", ""STC_CUST_CLASS_TYPE"", ""Bahraini""))
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0031"") +""\n"";
					sErrorCode += ""AM0031 \n"";
				}
				if(sNationality == InvokeMethod(""LookupValue"", ""FIN_CON_CITIZENSHIP"", ""Bahraini""))  // && sCustomerClass != InvokeMethod(""LookupValue"", ""STC_CUST_CLASS_TYPE"", ""Bahraini"")
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0030"") +""\n"";
					sErrorCode += ""AM0030 \n"";
				} 
			} 
            if (sDateOfBirth != """" && sDateOfBirth != null)
            {
				dCurrDate = new Date();
				sSysdate = dCurrDate.getTime();	
				dDateOfBirth = new Date(sDateOfBirth);
				sDateStr = dDateOfBirth.getTime();
				sDiffTime = sSysdate - sDateStr;				
				if (sDiffTime < 16*365.25*24*60*60*1000)
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0016"") +""\n"";
					sErrorCode += ""AM0016 \n"";						
				}
			}	
			if (sIDExpiryDate != """" && sIDExpiryDate != null)
			{
				dIDExpDate = new Date(sIDExpiryDate);
				sCompareDate = dIDExpDate.getTime();
				if (sSysdate > sCompareDate)
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0017"") +""\n"";
					sErrorCode += ""AM0017 \n"";			
				}
			}
			if (sSponsorIDExpiryDate != """" && sSponsorIDExpiryDate != null)
			{
				dIDExpDate = new Date(sSponsorIDExpiryDate);
				sCompareDate = dIDExpDate.getTime(); 

				if (sSysdate > sCompareDate)
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0020"") +""\n"";
					sErrorCode += ""AM0020 \n"";			
				}
			}		
		 sMesg = """";	 	    	 
		 
		if(sEmailId != """" && sEmailId != null && sEmailId != ""NA"" && sEmailId != ""na"")
		{
			   semailAddr = sEmailId;
			   sfirstChar = semailAddr.substring(0,1);
			   slastChar = semailAddr.substring(semailAddr.length-1,semailAddr.length);
			   sNot_First_Last = ""@."";
			   srequiredChars = "".@"";
			   sillegalChars = "",:; <>[]{}!£$%^*()#/+~|"";
			   iIndex = semailAddr.indexOf(""@"");
			   ipindex = semailAddr.lastIndexOf(""."");
			   
			    if (semailAddr.length < 6)
			    {
				       sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
				       sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
					   sErrorCode += ""AM0018 \n"";	
				 }
				 else if (sNot_First_Last.indexOf(sfirstChar,0) != -1)
				 {
					   sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
					   sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
					   sErrorCode += ""AM0018 \n"";
				 }
				 else if (sNot_First_Last.indexOf(slastChar,0) != -1)
                 {
	                   sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
					   sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
					   sErrorCode += ""AM0018 \n"";
				 }
				 else if(iIndex > ipindex)
				 {
					   sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
					   sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
					   sErrorCode += ""AM0018 \n""; 					
				 }
                 else if (sMesg == """")
                 {
                       //Process Required Chars
                       for (i=0;i<srequiredChars.length;i++)
                       {
                             scurrent_char = srequiredChars.substring(i,i+1);
                             if (semailAddr.indexOf(scurrent_char,0) == -1)
                             {
	                               sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
					               sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
					               sErrorCode += ""AM0018 \n"";
					               break;
			             	 }
			           }  	 
			           
			     }		     
			      else if (sMesg == """")
                	{                       
                        //Process all other illegal chars
                       for (i=0;i<sillegalChars.length;i++)
                       {
                              scurrent_char = sillegalChars.substring(i,i+1);
                              if (semailAddr.indexOf(scurrent_char,0) != -1)
                              {
	                                sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
					                sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
					                sErrorCode += ""AM0018 \n"";
					                break;
				              }  
				        }
		    	  	}	    	  
				 /*Praveen 
				   	if (sEmailReason != """")
				   	{
				   	     sMesg = LookupMessage(""User Defined Errors"",""AM0058"");
					     sErrorMsg += LookupMessage(""User Defined Errors"",""AM0058"") +""\n"";  
					     sErrorCode += ""AM0058 \n"";
				   	}*/     
		    	  }	  //	if(sEmailId != """"
		     
		 /*	else(sEmailId == """" || sEmailId == null || sEmailId == ""NA"" || sEmailId == ""na"")
		 	   {  
		 	     if(sEmailId == """" || sEmailId == null &&  sEmailReason== """" || sEmailReason== null)
		 	    //if(sEmailId == """" || sEmailId == null || sEmailId == ""NA"" || sEmailId == ""na"" && sEmailReason == """" ||sEmailReason == null)		 	     
     		     {
			     sMesg = LookupMessage(""User Defined Errors"",""AM0056"");
			     sErrorMsg += LookupMessage(""User Defined Errors"",""AM0056"") +""\n""; 
			     sErrorCode += ""AM0056 \n"";
			     }	
				     if(sEmailId == ""NA"" || sEmailId == ""na"")//&& sEmailReason == """" || sEmailReason == null)
				     {
					      if(sEmailReason == """" || sEmailReason == null)
					      {
					     sMesg = LookupMessage(""User Defined Errors"",""AM0056"");
					     sErrorMsg += LookupMessage(""User Defined Errors"",""AM0056"") +""\n""; 
					     sErrorCode += ""AM0056 \n"";
					       }			       
				      	}
				      	  
    	  	} //else(sEmailId  *///praveen
    	  	 
		with(Outputs) 
		{
			SetProperty(""Error Code"", sErrorCode);
			SetProperty(""Error Message"", sErrorMsg);
		}
	 } //with(appObj)
	}//try
	catch(e)
	{
		LogException(e);
	}
	finally
	{
		psDUPInputs = null;
		psDUPOutputs = null;		
		bsDupIDCheck = null;
	}
}
function ValidateIndividual(sActiveView,sSelfEmployed,sIncomeGroup,sCurrOccupation,sFirstName,sLastName,psOutputs)
{
var i,icode,appObj;
var sErrorCode = """";
var sErrorMsg = """";
try
{
	appObj = TheApplication();
	with(appObj)
	{
		if(sActiveView == ""STC Create New Customer View"")
		{
			if(sSelfEmployed == ""Y"" && (sIncomeGroup == """" || sIncomeGroup == null))
			{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0026"") +""\n"";
				sErrorCode += ""AM0026 \n"";
			}
			if((sSelfEmployed == ""N"" || sSelfEmployed == """") && (sCurrOccupation == """" || sCurrOccupation == null))
			{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0027"") +""\n"";
				sErrorCode += ""AM0027 \n"";
			}
		}
		if(sFirstName == """" || sFirstName == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0046"") +""\n"";
			sErrorCode += ""AM0046 \n"";
		}
		else
		{
			for (i=0;i<sFirstName.length;i++)
				{ 
					icode = sFirstName.charCodeAt(i); 
					if (!((icode >= 65) && (icode <= 90) || (icode >= 97) && (icode <= 122) || (icode == 32)))
					{
		
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0009"") +""\n"";
						sErrorCode += ""AM0009 \n"";
						break;
					}
				}
		}							
		if(sLastName == """" || sLastName == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0048"") +""\n"";
			sErrorCode += ""AM0048 \n"";
		}
		else
		{
			for (i=0;i<sLastName.length;i++)
				{ 
					icode = sLastName.charCodeAt(i); 
					if (!((icode >= 65) && (icode <= 90) || (icode >= 97) && (icode <= 122) || (icode == 32)))
					{
		
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0011"") +""\n"";
						sErrorCode += ""AM0011 \n"";
						break;
					}
				}
		}
	}//with(appObj)
	with(psOutputs)
	{
		SetProperty(""Error Code"", sErrorCode);
		SetProperty(""Error Msg"", sErrorMsg);
	}
}
catch(e)
{
	LogException(e);
}
finally
{}
}
function validateCorporate(sOrgFlg,sActiveView,sSelfEmployed,sIncomeGroup,sCurrOccupation,sAccountName,sLineOfBusiness,sNumEmp,sBranchLocal,sFirstName,sLastName,sBusTel1,sManagerName,sOffNum,sOffEmail,sCR,psOutputs)
{
var appObj,i,icode,semailAddr,sfirstChar,slastChar,sNot_First_Last,srequiredChars,sillegalChars,iIndex,ipindex,scurrent_char;
var sErrorCode = """";
var sErrorMsg = """";
var sMesg ="""";
try
{
	appObj = TheApplication();
	with(appObj)
	{
		if(sOrgFlg ==""Y"")
		{
			if(sActiveView == ""STC Create New Customer View"")
			{
				if(sSelfEmployed == ""Y"" && (sIncomeGroup == """" || sIncomeGroup == null))
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0026"") +""\n"";
					sErrorCode += ""AM0026 \n"";
				}
			if((sSelfEmployed == ""N"" || sSelfEmployed == """") && (sCurrOccupation == """" || sCurrOccupation == null))
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0027"") +""\n"";
					sErrorCode += ""AM0027 \n"";
				}
			}
			if(sCR == """" || sCR == null)
			{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0002"") +""\n"";
				sErrorCode += ""AM0002 \n"";
			}
		}
		if(sAccountName == """" || sAccountName == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0001"") +""\n"";
			sErrorCode += ""AM0001 \n"";
		}
		if(sLineOfBusiness == """" || sLineOfBusiness == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0003"") +""\n"";
			sErrorCode += ""AM0003 \n"";
		}
		if(sNumEmp == """" || sNumEmp == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0034"") +""\n"";
			sErrorCode += ""AM0034 \n"";
		}
		if(sBranchLocal == """" || sBranchLocal == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0033"") +""\n"";
			sErrorCode += ""AM0033 \n"";
		}
		if(sFirstName == """" || sFirstName == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0046"") +""\n"";
			sErrorCode += ""AM0046 \n"";
		}
		else
		{
			for (i=0;i<sFirstName.length;i++)
				{ 
					icode = sFirstName.charCodeAt(i); 
					if (!((icode >= 65) && (icode <= 90) || (icode >= 97) && (icode <= 122) || (icode == 32)))
					{
		
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0009"") +""\n"";
						sErrorCode += ""AM0009 \n"";
						break;
					}
				}
		}							
		if(sLastName == """" || sLastName == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0047"") +""\n"";
			sErrorCode += ""AM0047 \n"";
		}
		else
		{
			for (i=0;i<sLastName.length;i++)
				{ 
					icode = sLastName.charCodeAt(i); 
					if (!((icode >= 65) && (icode <= 90) || (icode >= 97) && (icode <= 122) || (icode == 32)))
					{
		
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0010"") +""\n"";
						sErrorCode += ""AM0010 \n"";
						break;
					}
				}
		}
		if(sBusTel1 == """" || sBusTel1 == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0035"") +""\n"";
			sErrorCode += ""AM0035 \n"";
		}
		else
		{
			if(!isNaN(sBusTel1))
			{
				if(sBusTel1.length < 8)
				{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0041"") +""\n"";
				sErrorCode += ""AM0039 \n"";
				}
			}
			else
			{	
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0040"") +""\n"";
				sErrorCode += ""AM0038 \n"";
			}
		}
		if(sOrgFlg == ""N"")
		{
			if(sManagerName == """" || sManagerName == null)
			{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0032"") +""\n"";
				sErrorCode += ""AM0032 \n"";
			}
			else
			{
				for (i=0;i<sManagerName.length;i++)
				{ 
					icode = sManagerName.charCodeAt(i); 
					if (!((icode >= 65) && (icode <= 90) || (icode >= 97) && (icode <= 122) || (icode == 32)))
					{
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0045"") +""\n"";
						sErrorCode += ""AM0045 \n"";
						break;
					}
				}
			}
			if(sOffNum == """" || sOffNum == null)
			{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0036"") +""\n"";
				sErrorCode += ""AM0036 \n"";
			}
			else
			{
				if(!isNaN(sOffNum))
				{
					if(sOffNum.length < 8)
					{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0039"") +""\n"";
					sErrorCode += ""AM0039 \n"";
					}
				}
				else
				{	
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0038"") +""\n"";
					sErrorCode += ""AM0038 \n"";
				}
			}
			if(sOffEmail == """" || sOffEmail == null)
			{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0037"") +""\n"";
				sErrorCode += ""AM0037 \n"";
			}
			else
			{
				   semailAddr = sOffEmail;
				   sfirstChar = semailAddr.substring(0,1);
				   slastChar = semailAddr.substring(semailAddr.length-1,semailAddr.length);
				   sNot_First_Last = ""@."";
				   srequiredChars = "".@"";
				   sillegalChars = "",:; <>[]{}!£$%^*()#/+~|"";
				   iIndex = semailAddr.indexOf(""@"");
				   ipindex = semailAddr.lastIndexOf(""."");
				   
				    if (semailAddr.length < 6)
				    {
					       sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
					       sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
						   sErrorCode += ""AM0018 \n"";	
					 }
					 else if (sNot_First_Last.indexOf(sfirstChar,0) != -1)
					 {
						   sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
						   sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
						   sErrorCode += ""AM0018 \n"";
					 }
					 else if (sNot_First_Last.indexOf(slastChar,0) != -1)
	                 {
		                   sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
						   sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
						   sErrorCode += ""AM0018 \n"";
					 }
					 else if(iIndex > ipindex)
					 {
						   sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
						   sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
						   sErrorCode += ""AM0018 \n"";
					 }
	                 else if (sMesg == """")
	                 {
	                       //Process Required Chars
	                       for (i=0;i<srequiredChars.length;i++)
	                       {
	                             scurrent_char = srequiredChars.substring(i,i+1);
	                             if (semailAddr.indexOf(scurrent_char,0) == -1)
	                             {
		                               sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
						               sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
						               sErrorCode += ""AM0018 \n"";
						               break;
				             	 }
				           }  	 
				           
				     }
				     
				      else if (sMesg == """")
	                	{                       
	                        //Process all other illegal chars
	                       for (i=0;i<sillegalChars.length;i++)
	                       {
	                              scurrent_char = sillegalChars.substring(i,i+1);
	                              if (semailAddr.indexOf(scurrent_char,0) != -1)
	                              {
		                                sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
						                sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
						                sErrorCode += ""AM0018 \n"";
						                break;
					              }  
					        }
			    	  	}
			}//if(sOffEmail == """" || sOffEmail == null)
		}//if(sOrgFlg == ""N"")
	}
	with(psOutputs)
		{
			SetProperty(""Error Code"", sErrorCode);
			SetProperty(""Error Msg"", sErrorMsg);
		}
	}
catch(e)
{
	LogException(e);
}
finally
{}

}
"//Your public declarations go here... 
function GetLOVDesc(Type, LIC)
{
	var vLOVType = Type;
	var vLIC = LIC;
	
	var vDesc ="""";
	var isRecord;
	var vBOLOV,vBCLOV;
	
	try
	{
		vBOLOV = TheApplication().GetBusObject(""List Of Values"");
	   	vBCLOV = vBOLOV.GetBusComp(""List Of Values"");
	   	
	
		with(vBCLOV)
	    {
		  	SetViewMode(3);
		    ActivateField(""Type"");
		  	ActivateField(""Description"");
		    ActivateField(""Name"");
		    ClearToQuery();
		    SetSearchSpec(""Type"",vLOVType);
		    SetSearchSpec(""Name"",vLIC);
		    ExecuteQuery(ForwardOnly);
		    isRecord = FirstRecord();
			if(isRecord != null)
			{  
		        vDesc = GetFieldValue(""Description"");  
			}   
			return(vDesc);				
		}
	}
	catch(e)
	{
		TheApplication().RaiseError(e.toString);
		return(vDesc);		
	}
	finally
	{
		vBOLOV = null;
		vBCLOV = null;
	
	}	
}//Your public declarations go here..."
"//***********************************************************************************************************//
//Purpose: 1) To Initialize the fields in the BC.
//Author: Rajitha P G
//Release: R2.0
//Date: 29-Oct-09
//*************************************************************************************************************//
function Init(Inputs,Outputs)
{
	try
	{
		with(Outputs)
		{
			SetProperty(""STC Card Full Name"","""");
			SetProperty(""Status"","""");
			SetProperty(""Address Tenure Months"","""");
			SetProperty(""Address Tenure Years"","""");
			SetProperty(""Address Type"","""");
			SetProperty(""Authority Level"","""");
			SetProperty(""Block No"","""");
			SetProperty(""Building No"","""");
			SetProperty(""CR#"","""");
			SetProperty(""City"","""");
			SetProperty(""Contract Category"","""");
			SetProperty(""Country"","""");
			SetProperty(""Current Occupation"","""");
			SetProperty(""Date Of Birth"","""");
			SetProperty(""Email Id"","""");
			SetProperty(""Fax#"","""");
			SetProperty(""First Name"","""");
			SetProperty(""Flat/Villa No"","""");
			SetProperty(""Gender"","""");
			SetProperty(""Governorate"","""");
			SetProperty(""Hobby"","""");
			SetProperty(""ID"","""");
			SetProperty(""ID Expiry Date"","""");
			SetProperty(""ID Type"","""");
			SetProperty(""Income Group"","""");
			SetProperty(""Last Education Level"","""");
			SetProperty(""Last Name"","""");
			SetProperty(""Line Of Business"","""");
			SetProperty(""Fax#"","""");
			SetProperty(""Marital Status"","""");
			SetProperty(""Middle Name"","""");
			SetProperty(""Mobile Phone"","""");
			SetProperty(""Mothers Maiden Name"","""");
			SetProperty(""Account Name"","""");
			SetProperty(""Nationality"","""");
			SetProperty(""Ownership Status"","""");
			SetProperty(""PO Box"","""");
			SetProperty(""Person in Household"","""");
			SetProperty(""Phone#"","""");
			SetProperty(""Place Of Birth"","""");
			SetProperty(""PO Box"","""");
			SetProperty(""Preferred Communication Channel"","""");
			SetProperty(""Preffered Language"","""");
			SetProperty(""Province"","""");
			SetProperty(""Ref Address Type"","""");
			SetProperty(""Ref Building No"","""");
			SetProperty(""Ref City"","""");
			SetProperty(""Ref Country"","""");
			SetProperty(""Ref First Name"","""");
			SetProperty(""Ref Flat No"","""");
			SetProperty(""Ref Governorate"","""");
			SetProperty(""Ref Last Name"","""");
			SetProperty(""Ref Ownership Status"","""");
			SetProperty(""Ref PO Box"","""");
			SetProperty(""Ref Phone#"","""");
			SetProperty(""Ref Province"","""");
			SetProperty(""Ref Relationship"","""");
			SetProperty(""Ref Road No"","""");
			SetProperty(""Ref Street Name"","""");
			SetProperty(""Ref Title"","""");
			SetProperty(""Ref Zip Code"","""");
			SetProperty(""Religion"","""");
			SetProperty(""Road No"","""");
			SetProperty(""Account Class"","""");
			SetProperty(""Street Name"","""");
			SetProperty(""Title"","""");
			SetProperty(""Account Type"","""");
			SetProperty(""VIP Category"","""");
			SetProperty(""Work Phone"","""");
			SetProperty(""Segment"","""");
			SetProperty(""Current Occupation Tenure Months"","""");
			SetProperty(""Current Occupation Tenure Years"","""");
			SetProperty(""Sponsor Name"","""");
			SetProperty(""Sponsor ID Type"","""");
			SetProperty(""Sponsor ID Number"","""");
			SetProperty(""Sponsor ID Expiry Date"","""");
			SetProperty(""Sponsor ID Issue Place"","""");
			SetProperty(""Sponsor Telephone Number"","""");
			SetProperty(""Employment Type"",""N"");
			SetProperty(""Dunning Excluded"",""N"");//NEW
			SetProperty(""Copy Address"",""N"");//NEW
			SetProperty(""STC First Name"","""");
			SetProperty(""STC Last Name"","""");			
			SetProperty(""STC Middle Name"","""");
			SetProperty(""STC Title"","""");
			SetProperty(""STC Empolyee Number"","""");
			SetProperty(""STC Applicant Type"","""");
			SetProperty(""STC Branches Local"","""");
			SetProperty(""STC Branches International"","""");
			SetProperty(""STC Account Manager Name"","""");
			SetProperty(""STC Official Email Address"","""");
			SetProperty(""STC Official Contact Number"","""");
			SetProperty(""STC Parent Company Name"","""");
			SetProperty(""STC Business Tel No 1"","""");
			SetProperty(""STC Business Tel No 2"","""");
			SetProperty(""STC Campaign Id"","""");//Added by Sudeep for Campaign
			SetProperty(""STCCPRNumber"","""");
			SetProperty(""SubscriberCountry"","""");//Added to store country code for GCC nations SRINI:17022014
			SetProperty(""STC Con GCC Country"","""");//CIO
			SetProperty(""STC Con ID Type"","""");//CIO
			
			SetProperty(""Actual Occupation"","""");//Auto Populate SD
			SetProperty(""Passport No"","""");//Auto Populate SD
			SetProperty(""Passport Issue Date"","""");//Auto Populate SD
			SetProperty(""Passport Expiry Date"","""");//Auto Populate SD
			SetProperty(""Labour Force Participation"","""");//Auto Populate SD
			SetProperty(""Card Issue Date"","""");//Auto Populate SD	
			SetProperty(""Employer Number"","""");//Auto Populate SD
			SetProperty(""Employer Name"","""");//Auto Populate SD
			SetProperty(""Card Occupation"","""");
			
			//[28Jul2015][NAVINR][IUC_CorpInd]
			SetProperty(""STC Company Name"","""");
			SetProperty(""STC CR Number"","""");
			SetProperty(""STC CR CAN Id"","""");
			SetProperty(""STC CR Cust Type"","""");
			SetProperty(""SiebelMessage"","""");
			//[28Jul2016][MANUJ][SD: Guardian Minor SD]
			SetProperty(""Guardian Address Type"","""");
			SetProperty(""Guardian Block No"","""");
			SetProperty(""Guardian Building No"","""");
			SetProperty(""Guardian Road No"","""");
			SetProperty(""Guardian Card Occupation"","""");
			SetProperty(""Guardian Contract Category"","""");
			SetProperty(""Guardian Current Occupation"","""");
			SetProperty(""Guardian Date Of Birth"","""");
			SetProperty(""Guardian Employer Name"","""");
			SetProperty(""Guardian Employer Number"","""");
			SetProperty(""Guardian First Name"","""");
			SetProperty(""Guardian Flat/Villa No"","""");
			SetProperty(""Guardian Gender"","""");
			SetProperty(""Guardian ID"","""");
			SetProperty(""Guardian ID Expiry Date"","""");
			SetProperty(""Guardian Labour Force Participation"","""");
			SetProperty(""Guardian Last Name"","""");
			SetProperty(""Guardian Last Name"","""");
			SetProperty(""Guardian Middle Name"","""");
			SetProperty(""Guardian Nationality"","""");
			SetProperty(""Guardian Passport Expiry Date"","""");
			SetProperty(""Guardian Passport Issue Date"","""");
			SetProperty(""Guardian Passport No"","""");
			SetProperty(""Employment Letter"","""");
			SetProperty(""Guardian Contact No"","""");
			SetProperty(""Guardian Email Address"","""");
			SetProperty(""Guardian Info"","""");
		    SetProperty(""Guardian Type"","""");
			SetProperty(""Guardian Verified"","""");
			SetProperty(""Guardian Sponsor Name"","""");
			SetProperty(""Guardian Sponsor ID Expiry Date"","""");
			SetProperty(""Guardian Sponsor ID Number"","""");
			SetProperty(""Guardian Actual Occupation"","""");
			SetProperty(""STC Company Type"","""");//[MANUJ]: [CCS]
			//[NAVIN:15Apr2018:TRA_EmployeeRegistration]
			SetProperty(""STC Employee CPR"","""");
			SetProperty(""STC Employee CR"","""");
			//[MANUJ] : [Business VAT Registration]
			SetProperty(""VAT Flat/Villa No"","""");
			SetProperty(""VAT City"","""");
			SetProperty(""VAT Building No"","""");
			SetProperty(""VAT Street Name"","""");
			SetProperty(""VAT Block No"","""");
			SetProperty(""VAT Governorate"","""");
			SetProperty(""VAT PO Box"","""");
			SetProperty(""VAT Road No"","""");
			//ROHITR:4/5/20:CRM Order Automation:Begin
			SetProperty(""Account Name DBAN1"","""");
			SetProperty(""Account Name DBAN2"","""");
			SetProperty(""Account Name DBAN3"","""");
			SetProperty(""Account Name DBAN4"","""");
			SetProperty(""Account Name DBAN5"","""");
			SetProperty(""Credit Limit DBAN1"","""");
			SetProperty(""Credit Limit DBAN2"","""");
			SetProperty(""Credit Limit DBAN3"","""");
			SetProperty(""Credit Limit DBAN4"","""");
			SetProperty(""Credit Limit DBAN5"","""");
			//ROHITR:4/5/20:CRM Order Automation:End
			SetProperty(""STC AutoCreate Portal Admin"",""""); //Indrasen:25Aug2020:  SD:SelfcarePortal_Admin
            SetProperty(""STC Sub Segment"",""""); //VIDYAD;17-02-2021 Business Rules Automation
		}

	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
}
"//***********************************************************************************************************//
//Purpose: To process the CPR card details passed by CIO API and display it on UI
//Inputs: SiebelMessage with all the fields and values
//Author: Shreya Shah
//Date: 29-Jul-16
//*************************************************************************************************************//
function Insert(InputsIns,OutputsIns)
{
	try
	{
		var CPR,Name,Gender,Dob,CardExpiry,FName,LName,MiddleName,Address,Flat,Building,Road,BlockNo,Governorate,Nationality,Occupation,SponsorName,SponsorNo,PassportNo,PassportIssueDate,PassportExpiryDate,LabourForceParticipation,EmployerNumber,EmployerName;
		var formatDOB;
		var CardCountry;
		var CardIssueDate;
		var newformatDOB;
		var newformatExpiry;
		var newformatPassportExpiryDate;
		var newformatPassportIssueDate;
		var CheckExist;	
		var country;
		var SystemOccupation;
		var appObj = TheApplication();
		var TraceOnFlg = appObj.InvokeMethod(""LookupValue"",""STC_ADMIN"",""CUSTCREATETRACE"");
		var TraceOnpath = appObj.InvokeMethod(""LookupValue"",""STC_ADMIN"",""CUSTTRACEPATH"");
	if(TraceOnFlg = ""TRACEON"")
	{
		appObj.TraceOn(TraceOnpath+""trace_InsertAllocation_$p_$t.txt"", ""Allocation"", ""All"");
	//	appObj.TraceOn(TraceOnpath+""trace_SQL_$p_$t.txt"", ""SQL"", ""All"");	
	}// end of trace
		var proxyBS = appObj.GetService(""Workflow Process Manager"");
		var input = appObj.NewPropertySet();
		var output = appObj.NewPropertySet();
		var siebMessage = """";
		var sCount = InputsIns.GetChildCount();
		var sFN = InputsIns.GetChild(0).GetProperty(""SiebelMessage"");
		for(var k=0;k<sCount;k++)
		{
			siebMessage = InputsIns.GetChild(k).GetProperty(""SiebelMessage"");
			input.SetProperty(""XMLDOC"",siebMessage);
			
		}
		if(siebMessage != """" && siebMessage != null)
		{
			input.SetProperty(""ProcessName"",""STC Smart Card Read VBC Update WF"");
			proxyBS.InvokeMethod(""RunProcess"",input,output);
			var smartcard = output.GetChild(0);
			var row = appObj.NewPropertySet();

			Name = smartcard.GetChild(0).GetChild(0).GetProperty(""EnglishFullName"");
			CPR = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""CPRNO"");
			Gender = smartcard.GetChild(0).GetChild(0).GetProperty(""Gender"");
			Dob = smartcard.GetChild(0).GetChild(0).GetProperty(""BirthDate"");
			CardExpiry = smartcard.GetChild(0).GetChild(0).GetProperty(""CardexpiryDate"");
			CardCountry = smartcard.GetChild(0).GetChild(0).GetProperty(""CardCountry"");
			Address = smartcard.GetChild(0).GetChild(0).GetProperty(""AddressEnglish"");
			Nationality = smartcard.GetChild(0).GetChild(0).GetProperty(""NationalityCode"");
			Occupation = smartcard.GetChild(0).GetChild(0).GetProperty(""OccupationEnglish"");
			CardIssueDate = smartcard.GetChild(0).GetChild(0).GetProperty(""CardIssueDate"");
			SponsorName = smartcard.GetChild(0).GetChild(0).GetProperty(""SponserNameEnglish"");
			SponsorNo = smartcard.GetChild(0).GetChild(0).GetProperty(""SponserId"");
			PassportNo = smartcard.GetChild(0).GetChild(0).GetProperty(""PassportNumber"");
			PassportIssueDate = smartcard.GetChild(0).GetChild(0).GetProperty(""PassportIssueDate"");
			PassportExpiryDate = smartcard.GetChild(0).GetChild(0).GetProperty(""PassportExpiryDate"");
			EmployerNumber = smartcard.GetChild(0).GetChild(0).GetProperty(""EmploymentId"");
			EmployerName = smartcard.GetChild(0).GetChild(0).GetProperty(""EmploymentNameEnglish"");
			var FMiscCount = smartcard.GetChild(0).GetChild(0).GetChildCount();
			FName = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""FirstNameEnglish"");
			LName = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""LastNameEnglish"");
			Flat = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""FlatNo"");
			Building = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""BuildingNo"");
			Road = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""RoadNo"");
			BlockNo = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""BlockNo"");
			Governorate = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""GovernorateNameEnglish"");
			MiddleName = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""MiddleName1English"");
			LabourForceParticipation = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""LfpNameEnglish"");
			
			var day = Dob.substring(0,2);
			var Mon = Dob.substring(3,5);
			var Year = Dob.substring(6,10);
			//[MANUJ] : [Autopopualte Revamp]
				if(day == ""00"")
				{
				day == ""01"";
				}
				if(Mon == ""00"")
				{
				Mon == ""01"";
				}
					
			var Expday = CardExpiry.substring(0,2);
			var ExpMon = CardExpiry.substring(3,5);
			var ExpYear = CardExpiry.substring(6,10);
					
			var PExpday = PassportExpiryDate.substring(0,2);
			var PExpMon = PassportExpiryDate.substring(3,5);
			var PExpYear = PassportExpiryDate.substring(6,10);
					
			var PIssueday = PassportIssueDate.substring(0,2);
			var PIssueMon = PassportIssueDate.substring(3,5);
			var PIssueYear = PassportIssueDate.substring(6,10);
					
			formatDOB = day+""/""+Mon+""/""+Year;
			newformatDOB = Mon+""/""+day+""/""+Year;
			newformatExpiry = ExpMon+""/""+Expday+""/""+ExpYear;
			newformatPassportExpiryDate = PExpMon+""/""+PExpday+""/""+PExpYear;
			newformatPassportIssueDate = PIssueMon+""/""+PIssueday+""/""+PIssueYear;

			if(Gender == ""M"")
			{
				Gender = ""Male"";
			}
			else if(Gender == ""F"")
			{
				Gender = ""Female"";
			}

			if(LName == '-')
			{
				LName = '';
			}

			if(MiddleName == '-')
			{
				MiddleName = '';
			}
			
			var InputsNew = TheApplication().NewPropertySet();
			var OutputsNew = TheApplication().NewPropertySet();
			var svcService = TheApplication().GetService(""STC Get Country"");
			InputsNew.SetProperty(""CountryCode"",Nationality);
			InputsNew.SetProperty(""CardOccupation"",Occupation);
			InputsNew.SetProperty(""CardCountry"",CardCountry);
			svcService.InvokeMethod(""GetCountry"",InputsNew,OutputsNew);
			country = OutputsNew.GetProperty(""Nationality"");
			SystemOccupation = OutputsNew.GetProperty(""SystemOccupation"");
					
			var CustType = appObj.GetProfileAttr(""CustType"");
			var sActiveApplet = appObj.GetProfileAttr(""sActApplet"");
			var sMethodInvoked = appObj.GetProfileAttr(""CPRMethodInvoked"");
			if(sMethodInvoked == ""GetGuardianDetails"")//Mayank: Added for Open UI: START
			{
				row.SetProperty(""Guardian First Name"",FName);
				row.SetProperty(""Guardian Last Name"", LName);
				row.SetProperty(""Guardian Middle Name"", MiddleName);
				row.SetProperty(""Guardian ID"", CPR);
				row.SetProperty(""Guardian Gender"", Gender);
				row.SetProperty(""Guardian Date Of Birth"", newformatDOB);
				row.SetProperty(""Guardian ID Expiry Date"", newformatExpiry);
				row.SetProperty(""Guardian Flat/Villa No"", Flat);
				row.SetProperty(""Guardian Building No"", Building);
				row.SetProperty(""Guardian Road No"", Road);
				row.SetProperty(""Guardian Block No"", BlockNo);
				row.SetProperty(""Guardian Address Type"", ""Billing"");
				row.SetProperty(""Guardian Nationality"", country);
				row.SetProperty(""Guardian Card Occupation"",Occupation);
				row.SetProperty(""Guardian Current Occupation"",SystemOccupation);
				row.SetProperty(""Guardian Sponsor Name"",SponsorName);
				row.SetProperty(""Guardian Sponsor ID Number"",SponsorNo);
				row.SetProperty(""Guardian Passport No"",PassportNo);
				row.SetProperty(""Guardian Passport Issue Date"",newformatPassportIssueDate);
				row.SetProperty(""Guardian Passport Expiry Date"",newformatPassportExpiryDate);
				row.SetProperty(""Guardian Labour Force Participation"",LabourForceParticipation);
				row.SetProperty(""Guardian Employer Number"",EmployerNumber);
				row.SetProperty(""Guardian Employer Name"",EmployerName);
				row.SetProperty(""Guardian Verified"",""N"");
				OutputsIns.AddChild(row);
			}
			else
			{//Mayank: Added for Open UI:STOP
			if(CustType != ""Individual"")
			{
				row.SetProperty(""STC First Name"", FName);
				row.SetProperty(""STC Card Full Name"", Name);
				row.SetProperty(""STC Last Name"", LName);
				row.SetProperty(""STC Middle Name"", MiddleName);
				row.SetProperty(""ID"", CPR);
				row.SetProperty(""Gender"", Gender);
				row.SetProperty(""Date Of Birth"", newformatDOB);
				row.SetProperty(""ID Expiry Date"", newformatExpiry);
				row.SetProperty(""Flat/Villa No"", Flat);
				row.SetProperty(""Building No"", Building);
				row.SetProperty(""Road No"", Road);
				row.SetProperty(""Block No"", BlockNo);
				row.SetProperty(""Governorate"", Governorate);
				row.SetProperty(""Address Type"", ""Billing"");
				row.SetProperty(""Nationality"", country);
				OutputsIns.AddChild(row);
			}
			else
			{

				//[MANUJ] : [Autopopulate Revamp]
				if((sActiveApplet == ""STC Create New Retail Customer Applet"" || sActiveApplet == ""STC Create New Corporate Individual Customer Applet"" || sActiveApplet == ""STC Create New Customer Applet"") && sMethodInvoked == ""STCTEST"") 
				{
							if(Nationality == ""Bahraini"")
								{
								row.SetProperty(""Account Class"",""Bahraini"");
								}
								else
								{
								row.SetProperty(""Account Class"",""Foreigner"");
								}
				}
				if(sActiveApplet == ""STC Create New Customer Applet"")
				{
					row.SetProperty(""Account Type"", ""Individual"");
					row.SetProperty(""Sponsor Name"",SponsorName);
					row.SetProperty(""Sponsor ID Number"",SponsorNo);
					row.SetProperty(""Passport No"",PassportNo);
					row.SetProperty(""STC Card Full Name"", Name);
					row.SetProperty(""Passport Issue Date"",newformatPassportIssueDate);
					row.SetProperty(""Passport Expiry Date"",newformatPassportExpiryDate);
					row.SetProperty(""Labour Force Participation"",LabourForceParticipation);
					row.SetProperty(""Employer Number"",EmployerNumber);
					row.SetProperty(""Employer Name"",EmployerName);
					row.SetProperty(""Current Occupation"",SystemOccupation);
				}
			
				else if(sActiveApplet == ""STC Create New Retail Customer Applet"" || sActiveApplet == ""STC Create New Corporate Individual Customer Applet"")
				{
					row.SetProperty(""Contract Category"", ""Individual"");
					row.SetProperty(""STC Card Read Only"",""Yes"");
					row.SetProperty(""Sponsor Name"",SponsorName);
					row.SetProperty(""Sponsor ID Number"",SponsorNo);
					row.SetProperty(""Passport No"",PassportNo);
					row.SetProperty(""STC Card Full Name"", Name);
					row.SetProperty(""Passport Issue Date"",newformatPassportIssueDate);
					row.SetProperty(""Passport Expiry Date"",newformatPassportExpiryDate);
					row.SetProperty(""Labour Force Participation"",LabourForceParticipation);
					row.SetProperty(""Employer Number"",EmployerNumber);
					row.SetProperty(""Employer Name"",EmployerName);
					row.SetProperty(""Current Occupation"",SystemOccupation);
				}
				else if(sActiveApplet == ""STC Create New Customer Applet Mini"")
				{
					row.SetProperty(""Governorate"", Governorate);
					if(sMethodInvoked == ""STCTEST"")
					{
						row.SetProperty(""Current Occupation"",SystemOccupation);
					}

				}
				//Fields common to all Applets and all methods
				row.SetProperty(""First Name"", FName);
				row.SetProperty(""Last Name"", LName);
				row.SetProperty(""Middle Name"", MiddleName);
				row.SetProperty(""ID"", CPR);
				row.SetProperty(""Passport No"",PassportNo);
				row.SetProperty(""STC Card Full Name"", Name);
				row.SetProperty(""Passport Issue Date"",newformatPassportIssueDate);
				row.SetProperty(""Passport Expiry Date"",newformatPassportExpiryDate);
				row.SetProperty(""Gender"", Gender);
				row.SetProperty(""Date Of Birth"", newformatDOB);
				row.SetProperty(""ID Type"", ""Bahraini ID"");
				row.SetProperty(""ID Expiry Date"", newformatExpiry);
				row.SetProperty(""Flat/Villa No"", Flat);
				row.SetProperty(""Building No"", Building);
				row.SetProperty(""Road No"", Road);
				row.SetProperty(""Block No"", BlockNo);
     			row.SetProperty(""Address Type"", ""Billing"");
				row.SetProperty(""Nationality"", country);
				row.SetProperty(""Card Occupation"",Occupation);
				OutputsIns.AddChild(row);

row=null;
smartcard=null;
svcService=null;
OutputsNew=null;
InputsNew=null;
sFN=null;
sCount= null;
siebMessage=null;
output=null;
input=null;
proxyBS=null;
SystemOccupation=null;
country=null;
CheckExist=null;
newformatPassportIssueDate=null;
newformatPassportExpiryDate=null;
newformatExpiry=null;
newformatDOB=null;
sActiveApplet=null;



appObj=null;
				TheApplication().GetService(""FINS Teller UI Navigation"").InvokeMethod(""RefreshCurrentApplet"", TheApplication().NewPropertySet(), TheApplication().NewPropertySet());
			}
		}//Mayank: Added for Open UI -- ELSE Closed
		}
if(TraceOnFlg = ""TRACEON"")
	{
		TheApplication().TraceOff();
	}// end of trace
	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}	
	
	




}
"//***********************************************************************************************************//
//Purpose: 1) To Log the exceptions in Custom Error Log Table
//Inputs: Error Message
//Author: Rajitha P G
//Release: R1.0
//Date: 29-Oct-09
//*************************************************************************************************************//
function LogException(e)
{
	var appObj;
  	var psInput;
  	var psOutput;
  	var bsErrorHandler; 
	try
 	{
		  appObj = TheApplication();
		  with(appObj)
		  {
			  psInput = NewPropertySet();
			  psOutput = NewPropertySet();
			  bsErrorHandler = GetService(""STC Generic Error Handler"");
		  }
		  with(psInput)
		  {
			  SetProperty(""Error Code"", e.errCode);
			  SetProperty(""Error Message"", e.errText);
			  SetProperty(""Object Name"", ""STC New Customer BS"");
			  SetProperty(""Object Type"", ""Buisness Service"");
		  }
		  bsErrorHandler.InvokeMethod(""Log Message"", psInput, psOutput);
 	}
 	catch(e)
 	{
  		// do nothing	
 	}
 	finally
 	{
 
		  bsErrorHandler = null;
		  psOutput = null;
		  psInput = null;
		  appObj = null;
 	}
}
function Query(Inputs,Outputs)
{
	try
	{
	var Appobj = TheApplication();
	var sPreviousView = Appobj.GetProfileAttr(""sPreview"");
	if(sPreviousView == ""Response View"") 
	  {
	
	var vFstname = TheApplication().GetProfileAttr(""sFstname"");
	var vLstname = TheApplication().GetProfileAttr(""sLstname"");
	var vCamId = TheApplication().GetProfileAttr(""sCampaignId""); //Added by Sudeep for Campaign
	
	var PsOutputs = Appobj.NewPropertySet();
	//Outputs.SetProperty(""First Name"",sFstname);
	//Outputs.SetProperty(""Last Name"",sLstname);
	PsOutputs.SetProperty(""First Name"",vFstname);
	PsOutputs.SetProperty(""Last Name"",vLstname);
	PsOutputs.SetProperty(""STC Campaign Id"",vCamId); //Added by Sudeep for Campaign
	Outputs.AddChild(PsOutputs);
		//PsOutputs.SetProperty(""Contact First Name"",sFstname);
		//PsOutputs.SetProperty(""Contact Last Name"",sLstnmae);
		
	    }
	}
	
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
	
	
	
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
	var ireturn=ContinueOperation;
	try
	{
		switch(MethodName)
		{
			case ""Init"":
					Init(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
			case ""Query"":
					Query(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
					
			case ""PreInsert"":
					ireturn = CancelOperation;
					break;
							
			case ""Insert"":
					Insert(Inputs,Outputs);
					ireturn = CancelOperation;
					break;

			case ""Update"":
					Update(Inputs,Outputs);
					ireturn = CancelOperation;
					break;
	
			case ""Delete"":
					ireturn = CancelOperation;
					break;

			default:
					ireturn = ContinueOperation;
		}
		return(ireturn);
	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}
	
}
function StringReplace(inputStr)
{
	var sApp = TheApplication();
	var regexPat="""", replaceExpr=""\\s"", outputStr="""", regexPat2="""", replaceExpr2="""";	
	var LOVTYpe = ""STC_ADMIN"";
	var vLIC = ""REG_EXP"";

	regexPat = GetLOVDesc(LOVTYpe,vLIC);
	
	if (regexPat == null || regexPat == """")
	regexPat = ""\s"";
	
	if (replaceExpr == null || replaceExpr == """")
	replaceExpr = """";
	else if (replaceExpr == ""\\s"")
	replaceExpr = "" "";
	
	if (replaceExpr2 == null || replaceExpr2 == """")
	replaceExpr2 = """";
	else if (replaceExpr2 == ""\\s"")
	replaceExpr2 = "" "";
	
	regexPat = new RegExp(regexPat, ""g"");
	
	//stringVar.replace(pattern, replexp)
	outputStr = inputStr.replace(regexPat, replaceExpr);
	
	if (regexPat2 != null && regexPat2 != """")
	{	
	regexPat2 = new RegExp(regexPat2, ""g"");
	outputStr = outputStr.replace(regexPat2, replaceExpr2);
	}
return(outputStr);
}//Your public declarations go here..."
"//***********************************************************************************************************//
//Purpose: To process the CPR card details passed by CIO API and display it on UI in case Update method is called
//Inputs: SiebelMessage with all the fields and values
//Author: Shreya Shah
//Date: 29-Jul-16
//*************************************************************************************************************//
function Update(InputsUpd,OutputsUpd)
{
	try
	{
		var CPR,Name,Gender,Dob,CardExpiry,FName,LName,MiddleName,Address,Flat,Building,Road,BlockNo,Governorate,Nationality,Occupation,SponsorName,SponsorNo,PassportNo,PassportIssueDate,PassportExpiryDate,LabourForceParticipation,EmployerNumber,EmployerName;
		var formatDOB;
		var CardCountry;
		var CardIssueDate;
		var newformatDOB;
		var newformatExpiry;
		var newformatPassportExpiryDate;
		var newformatPassportIssueDate;
		var CheckExist;	
		var country;
		var SystemOccupation;
		var appObj = TheApplication();
		var TraceOnFlg = appObj.InvokeMethod(""LookupValue"",""STC_ADMIN"",""CUSTCREATETRACE"");
		var TraceOnpath = appObj.InvokeMethod(""LookupValue"",""STC_ADMIN"",""CUSTTRACEPATH"");
			if(TraceOnFlg = ""TRACEON"")
			{
				appObj.TraceOn(TraceOnpath+""trace_InsertAllocation_$p_$t.txt"", ""Allocation"", ""All"");
			//	appObj.TraceOn(TraceOnpath+""trace_SQL_$p_$t.txt"", ""SQL"", ""All"");	
			}// end	of trace
		var sMethodClicked = TheApplication().GetProfileAttr(""VerifyGuardian"");
		if(sMethodClicked != ""YES"")
		{//Mayank: Added For Open UI -- STOP
			var proxyBS = appObj.GetService(""Workflow Process Manager"");
			var input = appObj.NewPropertySet();
			var output = appObj.NewPropertySet();
			var siebMessage = """";
			var sCount = InputsUpd.GetChildCount();
			for(var k=0;k<sCount;k++)
			{
				switch(InputsUpd.GetChild(k).GetProperty(""Field Name""))
				{
					case ""SiebelMessage"":
						siebMessage = InputsUpd.GetChild(k).GetProperty(""Field Value"");
						input.SetProperty(""XMLDOC"",siebMessage);
						break;
				}
			}
			if(siebMessage != """" && siebMessage != null)
			{
				input.SetProperty(""ProcessName"",""STC Smart Card Read VBC Update WF"");
				proxyBS.InvokeMethod(""RunProcess"",input,output);
				var smartcard = output.GetChild(0);
				var row = appObj.NewPropertySet();
	
				CPR = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""CPRNO"");
				Name = smartcard.GetChild(0).GetChild(0).GetProperty(""EnglishFullName"");
				Gender = smartcard.GetChild(0).GetChild(0).GetProperty(""Gender"");
				Dob = smartcard.GetChild(0).GetChild(0).GetProperty(""BirthDate"");
				CardExpiry = smartcard.GetChild(0).GetChild(0).GetProperty(""CardexpiryDate"");
				CardCountry = smartcard.GetChild(0).GetChild(0).GetProperty(""CardCountry"");
				Address = smartcard.GetChild(0).GetChild(0).GetProperty(""AddressEnglish"");
				Nationality = smartcard.GetChild(0).GetChild(0).GetProperty(""NationalityCode"");
				Occupation = smartcard.GetChild(0).GetChild(0).GetProperty(""OccupationEnglish"");
				CardIssueDate = smartcard.GetChild(0).GetChild(0).GetProperty(""CardIssueDate"");
				SponsorName = smartcard.GetChild(0).GetChild(0).GetProperty(""SponserNameEnglish"");
				SponsorNo = smartcard.GetChild(0).GetChild(0).GetProperty(""SponserId"");
				PassportNo = smartcard.GetChild(0).GetChild(0).GetProperty(""PassportNumber"");
				PassportIssueDate = smartcard.GetChild(0).GetChild(0).GetProperty(""PassportIssueDate"");
				PassportExpiryDate = smartcard.GetChild(0).GetChild(0).GetProperty(""PassportExpiryDate"");
				EmployerNumber = smartcard.GetChild(0).GetChild(0).GetProperty(""EmploymentId"");
				EmployerName = smartcard.GetChild(0).GetChild(0).GetProperty(""EmploymentNameEnglish"");
				var FMiscCount = smartcard.GetChild(0).GetChild(0).GetChildCount();
				FName = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""FirstNameEnglish"");
				LName = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""LastNameEnglish"");
				Flat = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""FlatNo"");
				Building = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""BuildingNo"");
				Road = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""RoadNo"");
				BlockNo = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""BlockNo"");
				Governorate = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""GovernorateNameEnglish"");
				MiddleName = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""MiddleName1English"");
				LabourForceParticipation = smartcard.GetChild(0).GetChild(0).GetChild(1).GetChild(0).GetProperty(""LaborForceParticipation"")
			
				var day = Dob.substring(0,2);
				var Mon = Dob.substring(3,5);
				var Year = Dob.substring(6,10);
				//[MANUJ] : [Autopopualte Revamp]
				if(day == ""00"")
				{
				day == ""01"";
				}
				if(Mon == ""00"")
				{
				Mon == ""01"";
				}
						
				var Expday = CardExpiry.substring(0,2);
				var ExpMon = CardExpiry.substring(3,5);
				var ExpYear = CardExpiry.substring(6,10);
						
				var PExpday = PassportExpiryDate.substring(0,2);
				var PExpMon = PassportExpiryDate.substring(3,5);
				var PExpYear = PassportExpiryDate.substring(6,10);
						
				var PIssueday = PassportIssueDate.substring(0,2);
				var PIssueMon = PassportIssueDate.substring(3,5);
				var PIssueYear = PassportIssueDate.substring(6,10);
						
				formatDOB = day+""/""+Mon+""/""+Year;
				newformatDOB = Mon+""/""+day+""/""+Year;
				newformatExpiry = ExpMon+""/""+Expday+""/""+ExpYear;
				newformatPassportExpiryDate = PExpMon+""/""+PExpday+""/""+PExpYear;
				newformatPassportIssueDate = PIssueMon+""/""+PIssueday+""/""+PIssueYear;
	
				if(Gender == ""M"")
				{
					Gender = ""Male"";
				}
				else if(Gender == ""F"")
				{
					Gender = ""Female"";
				}
	
				if(LName == '-')
				{
					LName = '';
				}
	
				if(MiddleName == '-')
				{
					MiddleName = '';
				}
				
				
				var InputsNew = TheApplication().NewPropertySet();
				var OutputsNew = TheApplication().NewPropertySet();
				var svcService = TheApplication().GetService(""STC Get Country"");
				InputsNew.SetProperty(""CountryCode"",Nationality);
				InputsNew.SetProperty(""CardOccupation"",Occupation);
				InputsNew.SetProperty(""CardCountry"",CardCountry);
				svcService.InvokeMethod(""GetCountry"",InputsNew,OutputsNew);
				country = OutputsNew.GetProperty(""Nationality"");
				SystemOccupation = OutputsNew.GetProperty(""SystemOccupation"");
		    				
				var CustType = appObj.GetProfileAttr(""CustType"");
				var sActiveApplet = appObj.GetProfileAttr(""sActApplet"");
				var sMethodInvoked = appObj.GetProfileAttr(""CPRMethodInvoked"");
				if(sMethodInvoked == ""GetGuardianDetails"")//Mayank: Added for Open UI: START
				{
					row.SetProperty(""Guardian First Name"",FName);
					row.SetProperty(""Guardian Last Name"", LName);
					row.SetProperty(""Guardian Middle Name"", MiddleName);
					row.SetProperty(""Guardian ID"", CPR);
					row.SetProperty(""Guardian Gender"", Gender);
					row.SetProperty(""Guardian Date Of Birth"", newformatDOB);
					row.SetProperty(""Guardian ID Expiry Date"", newformatExpiry);
					row.SetProperty(""Guardian Flat/Villa No"", Flat);
					row.SetProperty(""Guardian Building No"", Building);
					row.SetProperty(""Guardian Road No"", Road);
					row.SetProperty(""Guardian Block No"", BlockNo);
					row.SetProperty(""Guardian Address Type"", ""Billing"");
					row.SetProperty(""Guardian Nationality"", country);
					row.SetProperty(""Guardian Card Occupation"",Occupation);
					row.SetProperty(""Guardian Current Occupation"",SystemOccupation);
					row.SetProperty(""Guardian Sponsor Name"",SponsorName);
					row.SetProperty(""Guardian Sponsor ID Number"",SponsorNo);
					row.SetProperty(""Guardian Passport No"",PassportNo);
					row.SetProperty(""Guardian Passport Issue Date"",newformatPassportIssueDate);
					row.SetProperty(""Guardian Passport Expiry Date"",newformatPassportExpiryDate);
					row.SetProperty(""Guardian Labour Force Participation"",LabourForceParticipation);
					row.SetProperty(""Guardian Employer Number"",EmployerNumber);
					row.SetProperty(""Guardian Employer Name"",EmployerName);
					row.SetProperty(""Guardian Verified"",""N"");
					OutputsUpd.AddChild(row);
				}
				else
				{//Mayank: Added for Open UI:STOP
				if(CustType != ""Individual"")
				{
					row.SetProperty(""STC First Name"", FName);
					row.SetProperty(""STC Last Name"", LName);
					row.SetProperty(""STC Middle Name"", MiddleName);
					row.SetProperty(""ID"", CPR);
					row.SetProperty(""Gender"", Gender);
					row.SetProperty(""Date Of Birth"", newformatDOB);
					row.SetProperty(""ID Expiry Date"", newformatExpiry);
					row.SetProperty(""Flat/Villa No"", Flat);
					row.SetProperty(""Building No"", Building);
					row.SetProperty(""Road No"", Road);
					row.SetProperty(""Block No"", BlockNo);
					row.SetProperty(""Governorate"", Governorate);
					row.SetProperty(""Address Type"", ""Billing"");
					row.SetProperty(""Nationality"", country);
					OutputsUpd.AddChild(row);
				}
				else
				{
					//[MANUJ] : [Autopopulate Revamp]
					if((sActiveApplet == ""STC Create New Retail Customer Applet"" || sActiveApplet == ""STC Create New Corporate Individual Customer Applet"" || sActiveApplet == ""STC Create New Customer Applet"") && sMethodInvoked == ""STCTEST"") 
						{
							if(Nationality == ""Bahraini"")
								{
								row.SetProperty(""Account Class"",""Bahraini"");
								}
								else
								{
								row.SetProperty(""Account Class"",""Foreigner"");
								}
						}
				
					if(sActiveApplet == ""STC Create New Customer Applet"")
					{
						row.SetProperty(""Account Type"", ""Individual"");
						row.SetProperty(""Sponsor Name"",SponsorName);
						row.SetProperty(""Sponsor ID Number"",SponsorNo);
						row.SetProperty(""Passport No"",PassportNo);
						row.SetProperty(""Passport Issue Date"",newformatPassportIssueDate);
						row.SetProperty(""Passport Expiry Date"",newformatPassportExpiryDate);
						row.SetProperty(""Labour Force Participation"",LabourForceParticipation);
						row.SetProperty(""Employer Number"",EmployerNumber);
						row.SetProperty(""Employer Name"",EmployerName);
						row.SetProperty(""Current Occupation"",SystemOccupation);
					}
					else if(sActiveApplet == ""STC Create New Retail Customer Applet"" || sActiveApplet == ""STC Create New Corporate Individual Customer Applet"")
					{
						row.SetProperty(""Contract Category"", ""Individual"");
						row.SetProperty(""STC Card Read Only"",""Yes"");
						row.SetProperty(""Sponsor Name"",SponsorName);
						row.SetProperty(""Sponsor ID Number"",SponsorNo);
						row.SetProperty(""Passport No"",PassportNo);
						row.SetProperty(""Passport Issue Date"",newformatPassportIssueDate);
						row.SetProperty(""Passport Expiry Date"",newformatPassportExpiryDate);
						row.SetProperty(""Labour Force Participation"",LabourForceParticipation);
						row.SetProperty(""Employer Number"",EmployerNumber);
						row.SetProperty(""Employer Name"",EmployerName);
						row.SetProperty(""Current Occupation"",SystemOccupation);
					}
					else if(sActiveApplet == ""STC Create New Customer Applet Mini"")
					{
						row.SetProperty(""Governorate"", Governorate);
						if(sMethodInvoked == ""STCTEST"")
						{
							row.SetProperty(""Current Occupation"",SystemOccupation);
						}
	
					}
					//Fields common to all Applets and all methods
					row.SetProperty(""First Name"", FName);
					row.SetProperty(""Last Name"", LName);
					row.SetProperty(""Middle Name"", MiddleName);
					row.SetProperty(""ID"", CPR);
					row.SetProperty(""Gender"", Gender);
					row.SetProperty(""Date Of Birth"", newformatDOB);
					row.SetProperty(""ID Type"", ""Bahraini ID"");
					row.SetProperty(""ID Expiry Date"", newformatExpiry);
					row.SetProperty(""Flat/Villa No"", Flat);
					row.SetProperty(""Building No"", Building);
					row.SetProperty(""Road No"", Road);
					row.SetProperty(""Block No"", BlockNo);
	     			row.SetProperty(""Address Type"", ""Billing"");
					row.SetProperty(""Nationality"", country);
					row.SetProperty(""Card Occupation"",Occupation);
					OutputsUpd.AddChild(row);
					TheApplication().GetService(""FINS Teller UI Navigation"").InvokeMethod(""RefreshCurrentApplet"", TheApplication().NewPropertySet(), TheApplication().NewPropertySet());
				}
				}
			}
			//Mayank: Added For Open UI	-- START
		}
		else if(sMethodClicked == ""YES"")
		{
			var row = appObj.NewPropertySet();
			row.SetProperty(""Guardian Verified"",""Y"");
			OutputsUpd.AddChild(row);
			TheApplication().SetProfileAttr(""VerifyGuardian"",""NO"");
			//TheApplication().GetService(""FINS Teller UI Navigation"").InvokeMethod(""RefreshCurrentApplet"", TheApplication().NewPropertySet(), TheApplication().NewPropertySet());
		}//Mayank: Added For Open UI -- STOP

			if(TraceOnFlg = ""TRACEON"")
			{
				TheApplication().TraceOff();
			}// end of trace
			


	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
	}	
	
	
}
"var sErrorCode = """";
var sErrorMsg = """";"
function AssociateCANVATAddress(sCustAccntId,sAccntId)
{
	var sBillAccntId;
	var isRecord;
	var sConPriAddrId;
	var sCopyAddress;//NEW
	var sAccountType;//NEW
	var sContactId;
	var bcAddrMVG;
	var bcAddrAssoc;
	var bcContactMVG;
	var bcContactAssoc;
	//var sCustAccntId;
	var appObj;
	var bcAcnt;
	var boAccount;
	var bcAccount;
	var bcContact;
	//var sAccntId;
	var NewAddressId;
	var Operation;
	try
	{
			appObj = TheApplication();
		
   var spec = ""[Account Id]= '"" + sCustAccntId + ""' AND [STC Address Type] = 'VAT'"";
    if (sCustAccntId != """" && sCustAccntId != null )
   {
    var CUTAddrBO = TheApplication().GetBusObject(""STC Account Address Thin BO"");
	var CUTAddrBC = CUTAddrBO.GetBusComp(""STC CUT Address Thin"");

	with(CUTAddrBC)
	{
	ActivateField(""Account Id"");
	ActivateField(""STC Address Type"");
	ActivateField(""Address Id"");
	ClearToQuery();
	SetViewMode(AllView);
	SetSearchExpr(spec);
	ExecuteQuery(ForwardOnly);
	var count = CountRecords();
	var isVATAddrAvailable = FirstRecord();
		if(isVATAddrAvailable)
		{
		NewAddressId = GetFieldValue(""Address Id"");

		}

     }

     }
	
			if(sAccntId != """" && sAccntId != null && NewAddressId != """" && NewAddressId != null)
			{
				boAccount = appObj.GetBusObject(""STC Account Address Thin BO"");
				bcAcnt = boAccount.GetBusComp(""STC Account Address Thin"");
				with(bcAcnt)
				{
					ActivateField(""Type"");
					 SetViewMode(AllView);
					ClearToQuery();
					SetSearchSpec(""Id"",sAccntId);
					ExecuteQuery(ForwardOnly);
					isRecord = FirstRecord();                                                                             
					if(isRecord)
					{
					sAccountType = GetFieldValue(""Type"");
 					if(sAccountType == ""Corporate"" || sAccountType == ""SME"")
					{

						bcAddrMVG = GetMVGBusComp(""Street Address"");
						with(bcAddrMVG)
						{
							bcAddrAssoc = GetAssocBusComp();
							with(bcAddrAssoc)
							{
								SetViewMode(AllView);
								ClearToQuery();
								SetSearchSpec(""Id"",NewAddressId);
								ExecuteQuery(ForwardOnly);
								isRecord = FirstRecord();                                                                             
								if(isRecord)
								{
                                                        try{
									  Associate(NewAfter);
                                                           }
										catch(e)
										{

										}
                                                      
                                                      
								}
							}
							WriteRecord();
						}
					
					}
			}//	if(isRecord)
		}//with(bcAcnt)
	}//if
	
	
	}//try
	catch(e)
	{
	LogException(e)
	}
	finally
	{
		bcAddrMVG = null;
		bcAddrAssoc = null;
		bcContactMVG = null;
		bcContactAssoc = null;
		bcAcnt = null;
		boAccount = null;
	 	appObj = null;
		CUTAddrBC = null;
		CUTAddrBO = null;
	}
}
function CheckBlacklist(IDNum)
{
try
{
var RecExist;
var CustomBO=	TheApplication().GetBusObject(""STC CPR Black List BO"");
var CustomBC=CustomBO.GetBusComp(""STC CPR BlackList BC"");
var CustomBONew=	TheApplication().GetBusObject(""STC CPR Black List BO"");
var CustomBCNew=CustomBONew.GetBusComp(""STC CPR BlackList BC"");
var CPRNumber;//=Inputs.GetProperty(""CPRNumber""); 
with(CustomBC)
{ 
SetViewMode(AllView);
ActivateField(""Black List Select Flg"");
ActivateField(""Black Listed""); 
ActivateField(""CPR Number"");
ClearToQuery();
 var StrSearch = ""[CPR Number] = '"" + IDNum + ""' AND [Black Listed] = 'Blacklisted'"";  
 SetSearchExpr(StrSearch);    
ExecuteQuery(ForwardOnly); 
RecExist = FirstRecord();  
if(RecExist)
{
with(CustomBCNew)
{ 
SetViewMode(AllView);
ActivateField(""Black List Select Flg"");
ActivateField(""Black Listed""); 
ActivateField(""CPR Number"");
ClearToQuery();
 var StrSearch = ""[CPR Number] = '"" + IDNum + ""' AND [Black Listed] = 'Unblacklisted' AND [STC LMRA Status] = 'Active' "";  
 SetSearchExpr(StrSearch);    
ExecuteQuery(ForwardOnly);
var ActRec = FirstRecord(); 
if(ActRec)
{IDNum=""N""
}
else
{
IDNum=""Y"";
}
}//with(CustomBCNew)
}//if(RecExist)
else
{
IDNum=""N"";
}
}//RecExist
}//try
catch(e)
{

}
finally
{
}
return(IDNum); 
}
function CheckDate(sCardIssueDate, sPassportIssueDate,psOutputs)
{
//MANUJ Added for SmartCard Populate SD
var sErrorCode = """";
var sErrorMsg = """";
var sMesg ="""";
var appObj;
//var psOutputs;

appObj = TheApplication();
with(appObj){
if (sCardIssueDate != """" && sCardIssueDate != null)
{
var dCardIssueDate = new Date(sCardIssueDate);
var sCompareDate = dCardIssueDate.toSystem();
var dCurrDate = new Date();
var CurrDateSys = new Date(dCurrDate);
var sysdateCurrDate = CurrDateSys.toSystem();
var diff = sCompareDate - sysdateCurrDate;
var diffDays = ToNumber(diff / (24 * 60 * 60));
if (diffDays > 0)
{
sErrorMsg += LookupMessage(""User Defined Errors"",""CC0002"") +""\n"";
sErrorCode += ""CC0002 \n"";
}

}//Passport issue date			
if (sPassportIssueDate != """" && sPassportIssueDate != null)
{
var dIDIssueDate = new Date(sPassportIssueDate);
		var sCompareDate = dIDIssueDate.toSystem(); 
		var dCurrDate = new Date();
		var CurrDateSys = new Date(dCurrDate);
		var sysdateCurrDate = CurrDateSys.toSystem();
		var diff = sCompareDate - sysdateCurrDate;
		var diffDays = ToNumber(diff / (24 * 60 * 60));//
		if (diffDays > 0){

sErrorMsg += LookupMessage(""User Defined Errors"",""CC0001"") +""\n"";
sErrorCode += ""CC0001 \n"";

}

}

}//with(appObj)
with(psOutputs)
	{
	SetProperty(""Error Code"", sErrorCode);
	SetProperty(""Error Msg"", sErrorMsg);
	}

return(psOutputs);




}
"//***********************************************************************************************************//
//Purpose: 1) To Associate the Primary Contact and Primary Address of the Customer Account to the Billing Account Created under it
//Inputs: Billing Account Id, Primary Contact Id & Primary Address Id of the Customer Account
//Outputs: 
//Author: Rajitha P G
//Release: R1.0
//Date: 29-Oct-09
//*************************************************************************************************************//
function CopyCustomerDetails(Inputs,Outputs)
{
	var sBillAccntId;
	var isRecord;
	var sConPriAddrId;
	var sCopyAddress;//NEW
	var sAccountType;//NEW
	var sContactId;
	var bcAddrMVG;
	var bcAddrAssoc;
	var bcContactMVG;
	var bcContactAssoc;
	var sCustAccntId;
	var appObj;
	var bcBillAcnt;
	var boAccount;
	var bcAccount;
	var bcContact;
	var CANId;//[MANUJ] : [Business VAT Registration]
	try
	{
			appObj = TheApplication();
			with(Inputs)
			{
				sCopyAddress = GetProperty(""CopyAddress"");//NEW
				sAccountType = GetProperty(""AccountType"");//NEW
				sBillAccntId = GetProperty(""BillingAccountId"");
				sConPriAddrId = GetProperty(""PrimaryAddrId"");
				sContactId = GetProperty(""PrimaryCustId"");
				sCustAccntId = GetProperty(""CustAccountId"");
			}            
			if(sBillAccntId != """" && sBillAccntId != null)
			{
				boAccount = appObj.GetBusObject(""STC Billing Account"");
				bcBillAcnt = boAccount.GetBusComp(""CUT Invoice Sub Accounts"");
				with(bcBillAcnt)
				{
					SetViewMode(AllView);
					ClearToQuery();
					SetSearchSpec(""Id"",sBillAccntId);
					ExecuteQuery(ForwardOnly);
					isRecord = FirstRecord();                                                                             
					if(isRecord)
					{
					CANId = GetFieldValue(""Master Account Id"");//[MANUJ] : [Business VAT Registration]
					if(sAccountType == ""Corporate"" || sAccountType == ""SME"")
					{
					if(sCopyAddress == ""Y"")
					   { 
						bcAddrMVG = GetMVGBusComp(""Street Address"");
						with(bcAddrMVG)
						{
							bcAddrAssoc = GetAssocBusComp();
							with(bcAddrAssoc)
							{
								SetViewMode(AllView);
								ClearToQuery();
								SetSearchSpec(""Id"",sConPriAddrId);
								ExecuteQuery(ForwardOnly);
								isRecord = FirstRecord();                                                                             
								if(isRecord)
								{
									Associate(NewAfter);
								}
							}
							WriteRecord();
						}
					    }
					}
					else
					{
					bcAddrMVG = GetMVGBusComp(""Street Address"");
						with(bcAddrMVG)
						{
							bcAddrAssoc = GetAssocBusComp();
							with(bcAddrAssoc)
							{
								SetViewMode(AllView);
								ClearToQuery();
								SetSearchSpec(""Id"",sConPriAddrId);
								ExecuteQuery(ForwardOnly);
								isRecord = FirstRecord();                                                                             
								if(isRecord)
								{
									Associate(NewAfter);
								}
							}
							WriteRecord();
						}
					}
                                                 }
				if(sContactId != """" && sContactId != null)
					{
						bcContactMVG = GetMVGBusComp(""Primary Contact Last Name"");
						with(bcContactMVG)
						{
							bcContactAssoc = GetAssocBusComp();
							with(bcContactAssoc)
							{
								SetViewMode(AllView);
								ClearToQuery();
								SetSearchSpec(""Id"",sContactId);
								ExecuteQuery(ForwardOnly);
								isRecord = FirstRecord();                                                                             
								if(isRecord)
								{
									Associate(NewAfter);
								}
							}
							WriteRecord();
						}
					}
				}
	                                    bcContact = boAccount.GetBusComp(""Contact"");
				if(sContactId != """" && sContactId != null)
				{
				with(bcContact)
				{
				   ActivateField(""Master Account Id"");
				   SetViewMode(AllView);
				   ClearToQuery();
				   SetSearchSpec(""Id"",sContactId);
				   ExecuteQuery(ForwardOnly);
				   isRecord = FirstRecord(); 
				   if(isRecord)
				   {
				       SetFieldValue(""Master Account Id"",sCustAccntId);
				       WriteRecord();			       
				   }
			      } 
				}
				AssociateCANVATAddress(CANId,sBillAccntId);//[MANUJ] : [Business VAT Registration]
			}
		}	
	catch(e)
	{
		LogException(e);
	}
	finally
	{
		bcAddrMVG = null;
		bcAddrAssoc = null;
		bcContactMVG = null;
		bcContactAssoc = null;
		bcBillAcnt = null;
		boAccount = null;
	 	appObj = null;
	}

}
"//***********************************************************************************************************//
//Purpose: 1) To Log the exceptions in Custom Error Log Table
//Inputs: Error Message
//Author: Rajitha P G
//Release: R1.0
//Date: 29-Oct-09
//*************************************************************************************************************//
function LogException(e)
{
	var appObj;
  	var psInput;
  	var psOutput;
  	var bsErrorHandler; 
	try
 	{
		  appObj = TheApplication();
		  with(appObj)
		  {
			  psInput = NewPropertySet();
			  psOutput = NewPropertySet();
			  bsErrorHandler = GetService(""STC Generic Error Handler"");
		  }
		  with(psInput)
		  {
			  SetProperty(""Error Code"", e.errCode);
			  SetProperty(""Error Message"", e.errText);
			  SetProperty(""Object Name"", ""STC New Customer Validation"");
			  SetProperty(""Object Type"", ""Buisness Service"");
		  }
		  bsErrorHandler.InvokeMethod(""Log Message"", psInput, psOutput);
 	}
 	catch(e)
 	{
  		// do nothing	
 	}
 	finally
 	{
 
		  bsErrorHandler = null;
		  psOutput = null;
		  psInput = null;
		  appObj = null;
 	}
}
function Service_PreInvokeMethod (MethodName, Inputs, Outputs)
{
try
{
	var ireturn;
	
		ireturn = ContinueOperation;
		switch(MethodName)
		{
			case ""ValidateCustomer"":
				ValidateCustomer(Inputs, Outputs);		
				ireturn = CancelOperation;
				break;
			case ""CopyCustomerDetails"":
				CopyCustomerDetails(Inputs, Outputs);		
				ireturn = CancelOperation;
				break;
			case ""ValidateGCCId"":
				ValidateGCCId(Inputs,Outputs);		
				ireturn = CancelOperation;				
				break;
			case ""ValidatePassport"":
				ValidatePassport(Inputs,Outputs);		
				ireturn = CancelOperation;				
				break;
			case ""ValidatePassport"":
				ValidatePassport(Inputs,Outputs);		
				ireturn = CancelOperation;				
				break;
			case ""ValidateIdNum"":
				ValidateIdNum(Inputs,Outputs);		
				ireturn = CancelOperation;				
				break;
			case ""ValidateVAT""://[NAVIN:11Feb2019:BusinessVATReg]
				ValidateVAT(Inputs,Outputs);		
				ireturn = CancelOperation;				
				break;
					
			default:
				ireturn = ContinueOperation;
		}
		return(ireturn);
	}
	catch(e)
	{
		LogException(e);
	}
	finally
	{
		sErrorMsg = """";
		sErrorCode ="""";
	}
}
function ValidateAlternateNumber(sPhone,psOutputs)
{
try
{  
var sErrorCode = """";
var sErrorMsg = """";
var sMesg ="""";
var appObj;
//var psOutputs;

appObj = TheApplication();
//psOutputs = appObj.NewPropertySet();
var sub_strng = sPhone.substr(0,2); 
var sub_strng1 = sPhone.substr(0,1);
with(appObj)
{
  if(sPhone != """" && sPhone != null)
			{
				if(!isNaN(sPhone))
				{
				
					 if(sPhone.length < 8 || sPhone.length > 8)
					{
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0004"") +""\n"";
						sErrorCode += ""AM0004 \n"";					
					}					
										
				}
			else
			{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0005"") +""\n"";
				sErrorCode += ""AM0005 \n"";
			}			
				
		if(!(sub_strng==""33"" || sub_strng==""34""|| sub_strng==""36"" || sub_strng==""37"" || sub_strng==""38"" || sub_strng==""39""))// || sub_strng1==""1"" || sub_strng1==""7"" || sub_strng1==""8"" || sub_strng1==""9""))
		{
		sErrorMsg = LookupMessage(""User Defined Errors"",""AM0059"") +""\n"";  
		sErrorCode = ""AM0059 \n"";
		}							
	}
}//appObj
with(psOutputs)
	{
	SetProperty(""Error Code"", sErrorCode);
	SetProperty(""Error Msg"", sErrorMsg);
	}


} 
catch(e)
{
	LogException(e);
}
finally
{}
return(sErrorMsg)
}
function ValidateCPR(Inputs,Outputs)
{
//[NAVIN:11May017:NumberReclaimSREnh]
//Function to validate Bahraini CPR

var vErrCode=""0"", vErrMsg="""", vErrFlag="""", vBlackFlg="""";
var vIDType="""", vIDNum="""";
var sID0="""", sID1="""", sID2="""", sID3="""", sID4="""", sID5="""", sID6="""", sID7="""", sID8="""", SIDNew="""", SIDNewext="""", Valid="""", Valid1="""";

try{
	vIDType = Inputs.GetProperty(""IDType"");
	vIDNum = Inputs.GetProperty(""IDNumber"");
	vErrFlag = Inputs.GetProperty(""ErrorFlag"");
	
	with(Outputs)
	{
		//SetProperty(""IDNumberOut"", """");
		SetProperty(""ErrorCode"", """");
		SetProperty(""ErrorMessage"", """");	
	}
	
	if (vIDType == """") 
		vIDType = ""Bahraini ID"";
	
	if (vIDType==""Bahraini ID"")
	{
		vBlackFlg=CheckBlacklist(vIDNum);
		if(vBlackFlg == ""Y"")
		{
			vErrMsg += TheApplication().LookupMessage(""User Defined Errors"",""AM00082"") +""\n"";
			vErrCode += ""AM00082 \n"";
		}   
	}
	if ((vIDType==""Bahraini ID"" || vIDType==""PNN ID"") && vIDNum.length>9)
	{
		//TheApplication().RaiseErrorText(""Please Enter 9 digit CPR Number"");
		vErrMsg += TheApplication().LookupMessage(""User Defined Errors"",""AM0063"") +""\n"";
		vErrCode += ""AM0063 \n"";					 
	}
	else if((vIDType==""Bahraini ID"" || vIDType==""PNN ID"") && vIDNum.length<9)
	{
		 //TheApplication().RaiseErrorText(""Please Enter 9 digit CPR Number"");					 
		 vErrMsg += TheApplication().LookupMessage(""User Defined Errors"",""AM0063"") +""\n"";
		 vErrCode += ""AM0063 \n"";
	}
	else if(vIDType==""Bahraini ID"" && vIDNum.length==""9"")
	{
		sID0 = vIDNum.charAt(0);//a  
		sID1 = vIDNum.charAt(1); //b
		sID2 = vIDNum.charAt(2); //c            
		sID3 = vIDNum.charAt(3);//d
		sID4 = vIDNum.charAt(4);//e
		sID5 = vIDNum.charAt(5);//f
		sID6 = vIDNum.charAt(6);//g
		sID7 = vIDNum.charAt(7);//h

		sID8 = vIDNum.charAt(8);  //i                   
		Valid =((sID7*2+sID6*3+sID5*4+sID4*5+sID3*6+sID2*7+sID1*8+sID0*9)%11);
		Valid1=(11-Valid);
	 }      
			
	if(Valid == ""0""|| Valid == ""1"")
	{
		SIDNew = ""0"";
	}
	else
	{
		SIDNewext = Valid1;
	}
	if(SIDNew != sID8)
	{
		if(SIDNewext != sID8)
		{
			vErrMsg += TheApplication().LookupMessage(""User Defined Errors"",""AM0062"") +""\n"";
			vErrCode += ""AM0062 \n"";
		}
	}
	
	with(Outputs)
	{
		SetProperty(""ErrorCode"", vErrCode);
		SetProperty(""ErrorMessage"", vErrMsg);
	}
	if (vErrCode != ""0"" && (vErrFlag == ""THROW"" || vErrFlag == ""throw"" || vErrFlag == ""Y""))
	{
		TheApplication().RaiseErrorText(vErrMsg);
	}
}
catch(e){
	vErrMsg = e.errText;
	vErrCode = e.errCode;
	with(Outputs)
	{
		SetProperty(""ErrorCode"", vErrCode);
		SetProperty(""ErrorMessage"", vErrMsg);
	}
	if (vErrFlag == ""THROW"" || vErrFlag == ""throw"" || vErrFlag == ""Y"")
	{
		TheApplication().RaiseErrorText(vErrMsg);
	}
}
finally{

}
		
	return CancelOperation;
}
"//ROHITR:7/5/20:CRM Order Automation
function ValidateCRMOA(Inputs,Outputs)
{
 var sDBAN1 = """",sDBAN2 = """",sDBAN3 = """",sDBAN4 = """",sDBAN5 = """";
 var sCL1 = """",sCL2 = """",sCL3 = """",sCL4="""",sCL5="""",sTotCL = ""0"",sCBANCL=""0"";
 var sErrorCode = """",sErrorMsg = """";
 var sAccountType = """",sContractCat = """";
 var sApp = """";
 with(Inputs)
     {
      sAccountType = GetProperty(""AccountType"");
      sContractCat = GetProperty(""ContractCategory"");
      sDBAN1 = GetProperty(""DBAN1"");
      sDBAN2 = GetProperty(""DBAN2"");
      sDBAN3 = GetProperty(""DBAN3"");
      sDBAN4 = GetProperty(""DBAN4"");
      sDBAN5 = GetProperty(""DBAN5"");
  	  sCL1 = GetProperty(""CL1"");
      sCL2 = GetProperty(""CL2"");
      sCL3 = GetProperty(""CL3"");
      sCL4 = GetProperty(""CL4"");
      sCL5 = GetProperty(""CL5"");
     }//end with psInputs
if(((sDBAN1 != """" && sDBAN1 != null) && (sCL1 == """" || sCL1 == null || sCL1.length == 0)) || ((sDBAN2 != """" && sDBAN2 != null) && (sCL2 == """" || sCL2 == null || sCL2.length == 0)) || ((sDBAN3 != """" && sDBAN3 != null) && (sCL3 == """" || sCL3 == null || sCL3.length == 0)) || ((sDBAN4 != """" && sDBAN4 != null) && (sCL4 == """" || sCL4 == null || sCL4.length == 0)) || ((sDBAN5 != """" && sDBAN5 != null) && (sCL5 == """" || sCL5 == null || sCL5.length == 0)))
        {
		sErrorMsg += ""Credit Limit for Department is a Required Field. Please Enter a value for the field.\n"";
		sErrorCode += ""COA001 \n""
     }//end if sDBAN
   else
     {
   sTotCL = ToNumber(sCL1) + ToNumber(sCL2) + ToNumber(sCL3) + ToNumber(sCL4) + ToNumber(sCL5);
   sApp = TheApplication();
   var sInput = sApp.NewPropertySet();
   var sOutput = sApp.NewPropertySet();
   sInput.SetProperty(""AccountType"",sAccountType);
   sInput.SetProperty(""ContractCategory"",sContractCat);
   sInput.SetProperty(""ProcessName"", ""STC Get Corporate Credit Limit"");
   var sBS = sApp.GetService(""Workflow Process Manager"");
   sBS.InvokeMethod(""RunProcess"",sInput,sOutput);
   sCBANCL = sOutput.GetProperty(""CreditScore"");
   if(ToNumber(sCBANCL) < ToNumber(sTotCL))
	  {
          sErrorMsg += ""Total Credit Limit for Departments exceeds the allowed Credit Limit of "" + sCBANCL + "". Please change the values entered.\n"";
		  sErrorCode += ""COA002 \n""
	  }//end if sCBANCL
      }//end else
  with(Outputs)
	{
	 SetProperty(""ErrorCode"", sErrorCode);
	 SetProperty(""ErrorMessage"", sErrorMsg);
    }
}
//ROHITR:7/5/20:CRM Order Automation"
function ValidateCustomer(Inputs, Outputs)
{
	var appObj,sAccountType,sLineOfBusiness,sAccountName,sCR,sAccntLOV,bDupIDleadCheckFlag;
	var sEmailId,sPhone,sLastName,sFirstName,sMiddleName,sFlatNumber,sFax,icode,bSpecCharFlag,sSponsorTelephoneNumber;
    var i,sDateOfBirth,dDateOfBirth,sID,sIDType,bsDupIDCheck,bDupIDCheckFlag,psDUPInputs,psDUPOutputs,sIDExpiryDate,scurrent_char;
	var sSysdate,sCompareDate,dCurrDate,dIDExpDate,sDiffTime,sDateStr,semailAddr,sfirstChar,slastChar,sNot_First_Last;  
    var srequiredChars,sillegalChars,iIndex,ipindex,sMessg,SVC1,psiPS,psoPS,sMesg,sFlatVillaNo,sSponsorIDExpiryDate;
    var sSelfEmployed,sIncomeGroup,sCurrOccupation,sActiveView,sIDTypeLOV,sNationality,sCustomerClass,sManagerName,sApplicantType;
	var sBranchLocal,sBusTel1,sBusTel2,sNumEmp,sOffNum,sOffEmail,psOutputs,sOrgFlg,sContractCategory,sEmailReason,sErrorMsg,sCPRNumber,sBlackService,vBlackFlg,sGCCcountryCode,sConGccCntryCode,sConIDType;
	var sCardIssueDate,sPassportIssueDate;
	var sCompanyName="""", sCRNumber="""", sCustProvisionType="""", sEmpCPR="""", sEmpCR="""",vErrMsg = """";
	var IDType,sCompanyType,sGEmailAddress;
	var ByPassCPRCheck;
	try
	{
		appObj = TheApplication();   
		sActiveView = appObj.ActiveViewName();
		with(Inputs)
		{
			sAccountType = GetProperty(""AccountType"");
			sLineOfBusiness = GetProperty(""LineOfBusiness"");
			sAccountName = GetProperty(""AccountName"");
			sPhone = GetProperty(""Phone"");
			sCR = GetProperty(""CR"");
			sEmailId = GetProperty(""EmailId""); 
			sEmailReason = GetProperty(""EmailReason"");			
			sLastName = GetProperty(""LastName"");
			sFirstName = GetProperty(""FirstName"");
			sMiddleName = GetProperty(""MiddleName"");
			sDateOfBirth = GetProperty(""DateOfBirth"");
			sID = GetProperty(""ID"");
			sIDType = GetProperty(""IDType"");			
			sFax = GetProperty(""Fax"");
			sIDExpiryDate = GetProperty(""IDExpiryDate"");
			sSponsorTelephoneNumber = GetProperty(""SponsorTelephoneNumber"");
			sFlatVillaNo = GetProperty(""FlatVillaNo"");
			sSponsorIDExpiryDate = GetProperty(""SponsorIDExpiryDate"");
			sSelfEmployed = GetProperty(""SelfEmployed"");
			sIncomeGroup = GetProperty(""IncomeGroup"");
			sCurrOccupation = GetProperty(""CurrentOccupation"");
			sNationality = GetProperty(""Nationality"");
			sCustomerClass = GetProperty(""AccountClass"");
			sManagerName = GetProperty(""AccountManager"");
			sApplicantType = GetProperty(""ApplicantType"");
			sBranchLocal = GetProperty(""BranchLocal"");
			sBusTel1 = GetProperty(""BusTeleph1"");
			sBusTel2 = GetProperty(""BusTeleph2"");
			sNumEmp = GetProperty(""EmpolyeeNum"");
			sOffNum = GetProperty(""OffNumber"");
			sOffEmail = GetProperty(""OffEmail"");
			sContractCategory = GetProperty(""ContractCategory"");
			sCPRNumber = GetProperty(""STCCPRNumber"");
			sGCCcountryCode = GetProperty(""GCCCountryCode"");
			sConGccCntryCode = GetProperty(""ConGccCntryCode"");
			sConIDType = GetProperty(""ConIDType"");
			sCardIssueDate = GetProperty(""sCardIssueDate"");
			sPassportIssueDate = GetProperty(""sPassportIssueDate"");
			sCustProvisionType = GetProperty(""CustProvisionType"");
			sCompanyName = GetProperty(""CompanyName"");
			sCRNumber = GetProperty(""CRNumber"");
			sCompanyType = GetProperty(""sCompanyType"");
			sGEmailAddress = GetProperty(""sGEmailAddress"");//Mayank: Added for Email Data Capture
			sEmpCPR = GetProperty(""EmployeeCPR"");
			sEmpCR = GetProperty(""EmployeeCR"");
			ByPassCPRCheck = GetProperty(""ByPassBlackList"");

		}//with
		with(appObj)
		{
			if(sAccountType != """" && sAccountType != null)
			{
				sAccntLOV = InvokeMethod(""LookupValue"",""STC_CUST_TYPE"",sAccountType); 
				switch(sAccountType)
				{					
					case ""Corporate"":
							psOutputs = NewPropertySet();
							sOrgFlg = ""N"";
							sErrorMsg= validateCorporate(sOrgFlg,sActiveView,sSelfEmployed,sIncomeGroup,sCurrOccupation,sAccountName,sLineOfBusiness,sNumEmp,sBranchLocal,sFirstName,sLastName,sBusTel1,sManagerName,sOffNum,sOffEmail,sCR,sGCCcountryCode,sID,sIDType,psOutputs);
							sErrorCode = psOutputs.GetProperty(""Error Code"");
							sErrorMsg = psOutputs.GetProperty(""Error Msg"");
							break;
					case ""SME"":
							psOutputs = NewPropertySet();
							sOrgFlg = ""N"";
							sErrorMsg= validateSME(sOrgFlg,sActiveView,sSelfEmployed,sIncomeGroup,sCurrOccupation,sAccountName,sLineOfBusiness,sNumEmp,sBranchLocal,sFirstName,sLastName,sBusTel1,sManagerName,sOffNum,sOffEmail,sCR,sBusTel2,sContractCategory,sCPRNumber,sGCCcountryCode,sID,sConGccCntryCode,sConIDType,sCompanyType,psOutputs);
							sErrorCode = psOutputs.GetProperty(""Error Code"");
							sErrorMsg = psOutputs.GetProperty(""Error Msg""); 
							break;
					case ""Organization"":
							psOutputs = NewPropertySet();
							sOrgFlg =""Y"";
							validateCorporate(sOrgFlg,sActiveView,sSelfEmployed,sIncomeGroup,sCurrOccupation,sAccountName,sLineOfBusiness,sNumEmp,sBranchLocal,sFirstName,sLastName,sBusTel1,sManagerName,sOffNum,sOffEmail,sCR,sGCCcountryCode,sID,sIDType,psOutputs);
							sErrorCode = psOutputs.GetProperty(""Error Code"");
							sErrorMsg = psOutputs.GetProperty(""Error Msg"");
							break;		
					case ""Individual"":
							psOutputs = NewPropertySet();
							ValidateIndividual(sActiveView,sSelfEmployed,sIncomeGroup,sCurrOccupation,sFirstName,sLastName,sIDType,sID,sDateOfBirth,sGCCcountryCode,sCustomerClass,sCustProvisionType,sCompanyName,sCRNumber,sEmpCPR,sEmpCR,ByPassCPRCheck,psOutputs);
							sErrorCode = psOutputs.GetProperty(""Error Code"");
							sErrorMsg = psOutputs.GetProperty(""Error Msg"");
							break;
				}	
			}

			vErrMsg = ValidateVAT(Inputs,Outputs);//[NAVIN:11Feb2019:BusinessVATReg]
			if(vErrMsg != null && vErrMsg != """")
			{	sErrorMsg += vErrMsg;
				sErrorCode += Outputs.GetProperty(""ErrorCode"");}
            //ROHITR:7/5/2020:CRM Order Automation
           if (sAccountType == ""Corporate"" || sAccountType == ""SME"")
			  {
			   ValidateCRMOA(Inputs,Outputs,sErrorCode,sErrorMsg);
		   if(Outputs.GetProperty(""ErrorMessage"") != null && Outputs.GetProperty(""ErrorMessage"") != """")
			  {
			   sErrorMsg += Outputs.GetProperty(""ErrorMessage"");
               sErrorCode += Outputs.GetProperty(""ErrorCode"");
			  }//end if Outputs
              }//end if sAccType
			//ROHITR:7/5/2020:CRM Order Automation
			if(sPhone != """" && sPhone != null){
				if(!isNaN(sPhone)){
				
					if(sPhone.length < 8){
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0004"") +""\n"";
						sErrorCode += ""AM0004 \n"";						
					}					
				}
				else{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0005"") +""\n"";
					sErrorCode += ""AM0005 \n"";
				}								
			}
				if(sAccountType ==""Individual"" || sAccountType == ""Corporate"" || sAccountType ==""Organization""){
				  if(sApplicantType == """" || sApplicantType ==null){
				  	sErrorMsg += LookupMessage(""User Defined Errors"",""AM0060"") +""\n"";
					sErrorCode += ""AM0060 \n"";
				  }
				}
			if(sBusTel2 != """" && sBusTel2 != null){
				if(!isNaN(sBusTel2)){
					if(sBusTel2.length < 8){
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0044"") +""\n"";
						sErrorCode += ""AM0044 \n"";
					}
				}
				else{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0043"") +""\n"";
					sErrorCode += ""AM0043 \n"";
				}				
			}
			if(sFax != """" && sFax != null){
				if(!isNaN(sFax)){
					if(sFax.length < 8){
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0008"") +""\n"";
						sErrorCode += ""AM0008 \n"";
					}
				}
				else{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0006"") +""\n"";
					sErrorCode += ""AM0006 \n"";
				}
			}
			if (sMiddleName != """" && sMiddleName != null){
				for (i=0;i<sMiddleName.length;i++){ 
					icode = sMiddleName.charCodeAt(i); 
					if (!((icode >= 65) && (icode <= 90) || (icode >= 97) && (icode <= 122) || (icode == 32))){		
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0012"") +""\n"";
						sErrorCode += ""AM0012 \n"";
						break;
					}
				}
			}
			if (sFlatVillaNo.length>5){
		             sErrorMsg += LookupMessage(""User Defined Errors"",""AM0019"") +""\n"";
					 sErrorCode += ""AM0019 \n"";
			}
			if (!(sContractCategory == ""A"" || sContractCategory == ""B"" || sContractCategory == ""C"" || sContractCategory == ""D"" )){
				if (sID == """" ){
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0049"") +"""";
					sErrorCode += ""AM0049"";}
			}
			if (sContractCategory == ""A""){
				if(sCurrOccupation != ""A"")
				{	sErrorMsg += LookupMessage(""User Defined Errors"",""AM0050"") +"""";
					sErrorCode += ""AM0050"";}
			}
			if (sContractCategory == ""B""){
				if(sCurrOccupation != ""B"")
				{	sErrorMsg += LookupMessage(""User Defined Errors"",""AM0051"") +"""";
					sErrorCode += ""AM0051"";}
			}
			if (sContractCategory == ""C""){
				if(sCurrOccupation != ""C"")
				{	sErrorMsg += LookupMessage(""User Defined Errors"",""AM0052"") +"""";
					sErrorCode += ""AM0052"";}
			}
			if (sContractCategory == ""D""){
				if(sCurrOccupation != ""D"")
				{	sErrorMsg += LookupMessage(""User Defined Errors"",""AM0053"") +"""";
					sErrorCode += ""AM0053"";}
			}			
			if (sCurrOccupation == ""A""){
				if(sContractCategory != ""A"")
				{sErrorMsg += LookupMessage(""User Defined Errors"",""AM0050"") +"""";
					sErrorCode += ""AM0050"";	}
			}
			if (sCurrOccupation == ""B""){
				if(sContractCategory != ""B"")
				{	sErrorMsg += LookupMessage(""User Defined Errors"",""AM0051"") +"""";
					sErrorCode += ""AM0051"";	}
			}
			if (sCurrOccupation == ""C""){
				if(sContractCategory != ""C"")
				{sErrorMsg += LookupMessage(""User Defined Errors"",""AM0052"") +"""";
					sErrorCode += ""AM0052"";
				}
			}
			if (sCurrOccupation == ""D""){
				if(sContractCategory != ""D"")
				{sErrorMsg += LookupMessage(""User Defined Errors"",""AM0053"") +"""";
					sErrorCode += ""AM0053"";}
			}
			//Mayank: Commented the Code For Smart Card Data Enhance --------START-------
			/*if ((sContractCategory == ""A"" || sContractCategory == ""B"" || sContractCategory == ""C"" || sContractCategory == ""D"" ))
			{
				if (sIDType == ""VIP"" )
				{}
				else
				{sErrorMsg += LookupMessage(""User Defined Errors"",""AM0054"") +"""";
				sErrorCode += ""AM0054"";}	
			}*///Mayank: Commented the Code For Smart Card Data Enhance --------STOP-------
			if (sIDType == ""VIP"" ){
				if ((sContractCategory == ""A"" || sContractCategory == ""B"" || sContractCategory == ""C"" || sContractCategory == ""D"" ))
				{}
				else
				{	sErrorMsg += LookupMessage(""User Defined Errors"",""AM0055"") +"""";
					sErrorCode += ""AM0055"";	}	
			}
			
			if (sIDType != """" && sIDType != null)
			if (sID != """" && sID != null)
			{			  
			  for (i =0;i<sID.length;i++)
			  {
			      icode = sID.charCodeAt(i);
			      if (!((icode >=65) && (icode <=90) || (icode >= 97) && (icode<= 122) || (icode >= 47) && (icode <=57)))
			      {
			        sErrorMsg += LookupMessage(""User Defined Errors"",""AM0029"") +""\n"";
			        sErrorCode += ""AM0029 \n"";
			        break;
			      }
			  }
			  		psDUPInputs = NewPropertySet();
					psDUPOutputs = NewPropertySet();
					bsDupIDCheck = GetService(""STC-CheckDuplicateID"");			//	}
				with(psDUPInputs)
				{
					SetProperty(""StrAccountId"","""");
					SetProperty(""IDType"", sIDType);
					SetProperty(""IDNum"", sID);
					SetProperty(""CustType"",sAccountType);
					SetProperty(""CompId"",sCR);
											
				}
				bsDupIDCheck.InvokeMethod(""CheckDuplicate"",psDUPInputs,psDUPOutputs);
				bDupIDCheckFlag = psDUPOutputs.GetProperty(""gCombExists"");
				bDupIDleadCheckFlag = psDUPOutputs.GetProperty(""gLeadExists"");
				if (bDupIDCheckFlag == ""Y"")
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0015"") +""\n"";
					sErrorCode += ""AM0015 \n"";
				} 
				if(bDupIDleadCheckFlag == ""Y"") // [MARK:7-Oct-2019 SD:: Business Products Bulk Activation – Phase II] 
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""LEAD0015"") +""\n"";
					sErrorCode += ""LEAD0015 \n"";
				}  
		/*		vBlackFlg=CheckBlacklist(sID);
				if(vBlackFlg ==""Y"")
				{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM00082"") +""\n"";
				sErrorCode += ""AM00082 \n"";
				}   */	  
			}
			if(sNationality != sCustomerClass){
				if(sCustomerClass == InvokeMethod(""LookupValue"", ""STC_CUST_CLASS_TYPE"", ""Bahraini""))
				{	sErrorMsg += LookupMessage(""User Defined Errors"",""AM0031"") +""\n"";
					sErrorCode += ""AM0031 \n"";}
				if(sNationality == InvokeMethod(""LookupValue"", ""FIN_CON_CITIZENSHIP"", ""Bahraini"")) 
				{	sErrorMsg += LookupMessage(""User Defined Errors"",""AM0030"") +""\n"";
					sErrorCode += ""AM0030 \n"";} 
			} 
            if (sDateOfBirth != """" && sDateOfBirth != null)
			{	dCurrDate = new Date();
				sSysdate = dCurrDate.getTime();
				dDateOfBirth = new Date(sDateOfBirth);
				sDateStr = dDateOfBirth.getTime();
				sDiffTime = sSysdate - sDateStr;
				/*[12Aug2015][NAVINR][SD: Corporate Individual Customer creation]*/
				if (sCustProvisionType == ""Corporate Individual""){
					if (sDiffTime < 18*365.25*24*60*60*1000)
					{	sErrorMsg += LookupMessage(""User Defined Errors"",""AM00078"") +""\n"";
						sErrorCode += ""AM00078 \n"";	}
				}else if (sDiffTime < 16*365.25*24*60*60*1000)
					{	sErrorMsg += LookupMessage(""User Defined Errors"",""AM0016"") +""\n"";
						sErrorCode += ""AM0016 \n"";	}
			}	
			if ((sIDExpiryDate != """" && sIDExpiryDate != null) && (sIDType != ""Passport"")){
				dIDExpDate = new Date(sIDExpiryDate);
				sCompareDate = dIDExpDate.getTime();
				if (sSysdate > sCompareDate){
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0017"") +""\n"";
					sErrorCode += ""AM0017 \n"";}
			}
			if (sSponsorIDExpiryDate != """" && sSponsorIDExpiryDate != null){
				dIDExpDate = new Date(sSponsorIDExpiryDate);
				sCompareDate = dIDExpDate.getTime(); 
				if (sSysdate > sCompareDate){
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0020"") +""\n"";
					sErrorCode += ""AM0020 \n"";}
			}
			var psOutputs2 = NewPropertySet();
			CheckDate(sCardIssueDate, sPassportIssueDate, psOutputs2);
			sErrorCode += psOutputs2.GetProperty(""Error Code"");
			sErrorMsg += psOutputs2.GetProperty(""Error Msg"");
			//Mayank: Added for EMail Data Capture-------------------START---------- Removed code from Email Varification and added in ValidateEmail
			var psOutputs3 = NewPropertySet();
			if(sGEmailAddress != null && sGEmailAddress != """")
			{
				//var psOutputs4 = NewPropertySet();
				ValidateEmail(sGEmailAddress, psOutputs3);
				sErrorCode += psOutputs3.GetProperty(""Error Code"");
				sErrorMsg += psOutputs3.GetProperty(""Error Msg"");
				if(sErrorCode != """" && sErrorCode != null)
				{
					if(sErrorCode == ""SBL_DOMAIN_ERROR"")
					{
						sErrorMsg = ""Gaurdian Email Address doesnt have a proper Domain. Please select a proper Domain.""
					}
				}
			}
			//Mayank: Added for EMail Data Capture-------------------STOP---------- 
			if(sEmailId == """" || sEmailId == null)
    	  	{	
				sMesg = LookupMessage(""User Defined Errors"",""AM0056"");
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0056"") +""\n""; 
				sErrorCode += ""AM0056 \n"";    	  	
				sMesg = LookupMessage(""User Defined Errors"",""AM0082"");
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0082"") +""\n""; 
				sErrorCode += ""AM0082 \n"";

    	  	}
    	  	else if((sEmailId == ""na"" || sEmailId == ""NA"") && (sEmailReason == """" || sEmailReason== null))
    	  	{
					sMesg = LookupMessage(""User Defined Errors"",""AM0081"");
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0081"") +""\n""; 
					sErrorCode += ""AM0081 \n"";	
    	  	}
			//Mayank: Added for EMail Data Capture-------------------START---------- Removed code from Email Varification and added in ValidateEmail
			if(sEmailId != ""na"" && sEmailId != ""NA"")
			{
				//var psOutputs3 = NewPropertySet();
				ValidateEmail(sEmailId, psOutputs3);
				sErrorCode += psOutputs3.GetProperty(""Error Code"");
				sErrorMsg += psOutputs3.GetProperty(""Error Msg"");
				if(sErrorCode != """" && sErrorCode != null)
				{
					if(sErrorCode == ""SBL_DOMAIN_ERROR"")
					{
						sErrorMsg = ""EMail Address doesnt have a proper Domain. Please select a proper Domain.""
					}
				}
			}//Mayank: Added for EMail Data Capture-------------------STOP---------- 
		with(Outputs) 
		{
			SetProperty(""Error Code"", sErrorCode);
			SetProperty(""Error Message"", sErrorMsg);
		}
	 } //with(appObj)
	}//try
	catch(e)
	{LogException(e);}
	finally
	{
		psDUPInputs = null;
		psDUPOutputs = null;		
		bsDupIDCheck = null;
	}
}
"//Mayank: Added for Email Data Capture
function ValidateEmail(sEmailId, psOutputs3)
{
	try
	{
		var sApp = TheApplication();
		var psInputs = sApp.NewPropertySet();
		var psOutputs = sApp.NewPropertySet();
		var svcbsService = sApp.GetService(""STC Siebel Operation BS"");
		psInputs.SetProperty(""EmailId"", sEmailId);
		svcbsService.InvokeMethod(""EmailFormatValidation"", psInputs, psOutputs);
		var sError = psOutputs.GetProperty(""ErrorCode"");
		var sErrorMsg = psOutputs.GetProperty(""ErrorMessage"");
		var vNewEmail = psOutputs.GetProperty(""EmailId"");
		with(psOutputs3)
		{
			if(sError != ""0"" && sErrorMsg != ""SUCCESS"")
			{
				SetProperty(""Error Code"", sError);
				SetProperty(""Error Msg"", sErrorMsg);
			}
			else
			{
				SetProperty(""Error Code"", """");
				SetProperty(""Error Msg"", """");
			}
		}
	}//try
	catch(e)
	{

	}
	finally
	{
	}
	return(psOutputs3); 
}
function ValidateGCCId(Inputs,Outputs)
{
//Function to validate the length of the ID # based on the country
//Added for the CIO software upgrade SD purpose SRINI:17022014

	var sCountryCode = Inputs.GetProperty(""GCCCountryCode"");
	var sGCCId = Inputs.GetProperty(""GCCId"");
	var sErCode = Inputs.GetProperty(""sErrorCode"");
	var sErMssg = Inputs.GetProperty(""sErrorMsg"");	
	var sGCCIDLovLen = """";
	var vGccIdMaxLen=0, vGccIdMinLen=0; //[NAVIN:11May017:NumberReclaimSREnh]
	
	var sGCCIdLen = sGCCId.length;
	var sBoLOV = TheApplication().GetBusObject(""List Of Values"");
	var sBcLOV = sBoLOV.GetBusComp(""List Of Values"");

	if (sCountryCode != """")
	{
		with(sBcLOV){
			ActivateField(""High"");
			ActivateField(""Value"");
			ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Type"",""STC_GCC_COUNTRY_CODE"");
			SetSearchSpec(""Name"",sCountryCode);
			ExecuteQuery(ForwardOnly);
			var IsRec = FirstRecord();
			if(IsRec){
				sGCCIDLovLen = GetFieldValue(""High"");
			}//endif IsRec
		}//endwith
	}
	else{//[NAVIN:11May017:NumberReclaimSREnh]
		with(sBcLOV){
			ActivateField(""High"");
			ActivateField(""Low"");
			ActivateField(""Value"");
			ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Type"", ""STC_CUST_ID_IND_TYPE"");
			SetSearchSpec(""Name"", ""GCC"");
			SetSearchSpec(""Active"", ""Y"");
			ExecuteQuery(ForwardOnly);
			var IsRec = FirstRecord();
			if(IsRec){
				vGccIdMaxLen = ToNumber(GetFieldValue(""High""));
				vGccIdMinLen = ToNumber(GetFieldValue(""Low""));
			}//endif IsRec
		}//endwith
	}//end if(sCountryCode != """")
	
	if(sGCCIdLen != sGCCIDLovLen && sCountryCode != """"){		
		sErMssg += TheApplication().LookupMessage(""User Defined Errors"",""AM0083"") +""\n"";
		sErCode += ""AM0083 \n"";
	}//endif
	else if((sCountryCode == """" || sCountryCode == null) && ((sGCCIdLen < vGccIdMinLen) || (sGCCIdLen > vGccIdMaxLen)))
	{//[NAVIN:11May017:NumberReclaimSREnh]
		sErMssg += TheApplication().LookupMessage(""User Defined Errors"",""AM0091"") +""\n"";
		sErCode += ""AM0083 \n"";
	}else{
		var sValid = ""N"";
		var i;
		for(i=0;i< sGCCIdLen;i++){
			var sIDNum = ToNumber(sGCCId.charAt(i));
			if(sIDNum <= 9 && sIDNum >= 0){			
				sValid = ""Y"";
				i = i++;
			}//endif sIDNum <= 9 && sIDNum >= 0
			else{
				sValid = ""N"";
				i = sGCCIdLen;
			}//endelse	sIDNum <= 9 && sIDNum >= 0						
		}//endfor
	}//endelse	
	if(sValid == ""N""){
		sErMssg += TheApplication().LookupMessage(""User Defined Errors"",""AM0088"") +""\n"";
		sErCode += ""AM0088 \n"";			
	}//endif sValid	= ""N""
	with(Outputs)
	{
		SetProperty(""ErrorCode"",sErCode);
		SetProperty(""ErrorMsg"",sErMssg);
		SetProperty(""sErrorCode"",sErCode);
		SetProperty(""sErrorMsg"",sErMssg);
	}//endwith
		
	return CancelOperation;
}
function ValidateGCCId(Inputs,Outputs)
{
//Function to validate the length of the ID # based on the country

	var sCountryCode = Inputs.GetProperty(""GCCCountryCode"");
	var sGCCId = Inputs.GetProperty(""GCCId"");
	var sErCode = Inputs.GetProperty(""sErrorCode"");
	var sErMssg = Inputs.GetProperty(""sErrorMsg"");	
	var sGCCIDLovLen = """";
	var vGccIdMaxLen=0, vGccIdMinLen=0; //[NAVIN:11May017:NumberReclaimSREnh]
	
	var sGCCIdLen = sGCCId.length;
	var sBoLOV = TheApplication().GetBusObject(""List Of Values"");
	var sBcLOV = sBoLOV.GetBusComp(""List Of Values"");

	if (sCountryCode != """")
	{
		with(sBcLOV){
			ActivateField(""High"");
			ActivateField(""Value"");
			ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Type"",""STC_GCC_COUNTRY_CODE"");
			SetSearchSpec(""Name"",sCountryCode);
			ExecuteQuery(ForwardOnly);
			var IsRec = FirstRecord();
			if(IsRec){
				sGCCIDLovLen = GetFieldValue(""High"");
			}//endif IsRec
		}//endwith
	}
	else{//[NAVIN:11May017:NumberReclaimSREnh]
		with(sBcLOV){
			ActivateField(""High"");
			ActivateField(""Low"");
			ActivateField(""Value"");
			ClearToQuery();
			SetViewMode(AllView);
			SetSearchSpec(""Type"", ""STC_CUST_ID_IND_TYPE"");
			SetSearchSpec(""Name"", ""GCC"");
			SetSearchSpec(""Active"", ""Y"");
			ExecuteQuery(ForwardOnly);
			var IsRec = FirstRecord();
			if(IsRec){
				vGccIdMaxLen = ToNumber(GetFieldValue(""High""));
				vGccIdMinLen = ToNumber(GetFieldValue(""Low""));
			}//endif IsRec
		}//endwith
	}//end if(sCountryCode != """")
	
	if(sGCCIdLen != sGCCIDLovLen && sCountryCode != """"){		
		sErMssg += TheApplication().LookupMessage(""User Defined Errors"",""AM0083"") +""\n"";
		sErCode += ""AM0083 \n"";
	}//endif
	else if((sCountryCode == """" || sCountryCode == null) && ((sGCCIdLen < vGccIdMinLen) || (sGCCIdLen > vGccIdMaxLen)))
	{//[NAVIN:11May017:NumberReclaimSREnh]
		sErMssg += TheApplication().LookupMessage(""User Defined Errors"",""AM0091"") +""\n"";
		sErCode += ""AM0091 \n"";
	}
	else if((sCountryCode == """" || sCountryCode == null) && (sGCCIdLen == 9))
	{//[NAVIN:03Nov2020:NumberReclaimSREnh]
		sErMssg += TheApplication().LookupMessage(""User Defined Errors"",""AM0086"") +""\n"";
		sErCode += ""AM0086 \n"";
	}
	else{
		var sValid = ""N"";
		var i;
		for(i=0;i< sGCCIdLen;i++){
			var sIDNum = ToNumber(sGCCId.charAt(i));
			if(sIDNum <= 9 && sIDNum >= 0){			
				sValid = ""Y"";
				i = i++;
			}//endif sIDNum <= 9 && sIDNum >= 0
			else{
				sValid = ""N"";
				i = sGCCIdLen;
			}//endelse	sIDNum <= 9 && sIDNum >= 0						
		}//endfor
	}//endelse	
	if(sValid == ""N""){
		sErMssg += TheApplication().LookupMessage(""User Defined Errors"",""AM0088"") +""\n"";
		sErCode += ""AM0088 \n"";			
	}//endif sValid	= ""N""
	with(Outputs)
	{
		SetProperty(""ErrorCode"",sErCode);
		SetProperty(""ErrorMsg"",sErMssg);
		SetProperty(""sErrorCode"",sErCode);
		SetProperty(""sErrorMsg"",sErMssg);
	}//endwith
		
	return CancelOperation;
}
function ValidateIdNum(Inputs, Outputs)
{
//[NAVIN:11May017:NumberReclaimSREnh]
//Function to validate Bahraini CPR

var vErrCode=""0"", vErrMsg="""", vErrFlag="""", vBlackFlg="""";
var vIDType="""", vIDNum="""", vGccConCode="""", vCustClass="""", vIDNumOut="""";

	with(Inputs)
	{
		vIDType = GetProperty(""IDType"");
		vIDNum = GetProperty(""IDNumber"");
		vGccConCode = GetProperty(""GCCCountryCode"");
		vCustClass = GetProperty(""CustomerClass"");
		vErrFlag = GetProperty(""ErrorFlag"");
	}
	
	//Initialize the Output Arguments:
	with(Outputs)
	{
		SetProperty(""IDNumberOut"", """");
		SetProperty(""ErrorCode"", """");
		SetProperty(""ErrorMessage"", """");	
	}
	
	
	if ((vIDType == ""Bahraini ID"") || (vIDType == ""PNN ID""))
	{
		with(Inputs){
			SetProperty(""IDType"", vIDType);
			SetProperty(""IDNumber"", vIDNum);
			SetProperty(""ErrorFlag"", ""N"");
		}
		ValidateCPR(Inputs, Outputs);
		
		with(Outputs){
			vErrCode = GetProperty(""ErrorCode"");
			vErrMsg = GetProperty(""ErrorMessage"");
		}
	}
	else if (vIDType == ""GCC"")
	{
		vErrCode = """";
		
		if(vCustClass == ""Bahraini""){
			vErrMsg += TheApplication().LookupMessage(""User Defined Errors"",""AM0094"") +""\n"";
			vErrCode += ""AM0094 \n"";
		}
		//Validation,ID Type 'GCC' should not be allowed for the GCC Country Code ""BH""
		var vGccConCodeBH = TheApplication().InvokeMethod(""LookupValue"",""STC_GCC_COUNTRY_CODE"",""BH"")
		if(vGccConCode == vGccConCodeBH){
			vErrMsg += TheApplication().LookupMessage(""User Defined Errors"",""AM0086"") +""\n"";
			vErrCode += ""AM0086 \n"";
		}
		if (vIDNum != """"){
			with(Inputs){
				SetProperty(""GCCId"", vIDNum);
				SetProperty(""GCCCountryCode"", vGccConCode);
				SetProperty(""sErrorMsg"", """");
				SetProperty(""sErrorCode"", """");
			}	
			ValidateGCCId(Inputs, Outputs);
			
			with(Outputs){
				vErrCode += GetProperty(""ErrorCode"");
				vErrMsg += GetProperty(""ErrorMsg"");
			}
			
			if (vErrCode == """")
				vErrCode = ""0"";
		}
	}
	else if (vIDType == ""Passport"")
	{
		with(Inputs){
			SetProperty(""PassportNum"", vIDNum);
			SetProperty(""ErrorFlag"", ""N"");
		}
		ValidatePassport(Inputs, Outputs);
		
		with(Outputs){
			vIDNumOut = GetProperty(""PassportNumOut"");
			vErrCode = GetProperty(""ErrorCode"");
			vErrMsg = GetProperty(""ErrorMessage"");
		}
	}
	else if (vIDType == ""CR"")
	{//[NAVIN:07Jul2020:NumberReclaimEnhancementsPhase3]
		var vBusSvc = TheApplication().GetService(""STC SMECR Validation"");
		var vInpPS = TheApplication().NewPropertySet();
		var vOutPS = TheApplication().NewPropertySet();
		with (vInpPS)
		{
			vInpPS.SetProperty(""IDType"", vIDType);
			vInpPS.SetProperty(""IDNumber"", vIDNum);
			vInpPS.SetProperty(""CompanyName"", """");
		}
		try{
			vBusSvc.InvokeMethod(""ValidateCustomer"", vInpPS, vOutPS);

			vErrCode = vOutPS.GetProperty(""Error Code"");
			vErrMsg = vOutPS.GetProperty(""Error Message"");
		}catch(e){
			vErrCode = vOutPS.GetProperty(""Error Code"");
			vErrMsg = vOutPS.GetProperty(""Error Message"");
		}
		if (vErrCode == """")
			vErrCode = ""0"";
	}
	else
	{
		vIDNumOut = """"; vErrCode = ""0""; vErrMsg="""";
	}
	
	
	with(Outputs)
	{
		SetProperty(""IDNumberOut"", vIDNumOut);
		SetProperty(""ErrorCode"", vErrCode);
		SetProperty(""ErrorMessage"", vErrMsg);
	}
	if ((vErrCode != ""0"" && vErrCode != """") && (vErrFlag == ""THROW"" || vErrFlag == ""throw"" || vErrFlag == ""Y""))
	{
		TheApplication().RaiseErrorText(vErrMsg);
	}
		
	return CancelOperation;
}
function ValidateIndividual(sActiveView,sSelfEmployed,sIncomeGroup,sCurrOccupation,sFirstName,sLastName,sIDType,sID,sDateOfBirth,sGCCcountryCode,sCustomerClass,sCustProvisionType,sCompanyName,sCRNumber,sEmpCPR,sEmpCR,ByPassCPRCheck,psOutputs)
{
var i,icode,appObj;
var sErrorCode = """";
var sErrorMsg = """";
try
{
	appObj = TheApplication();
	with(appObj)
	{
		var sGCCType = TheApplication().InvokeMethod(""LookupValue"",""STC_CUST_ID_TYPE"",""GCC"");//CIO Software Update SD SRINI:23022014
		if(sIDType == sGCCType){			
				var sLoginName = TheApplication().LoginName();
				var sSuperUser = TheApplication().InvokeMethod(""LookupValue"",""STC_GCC_SUPER_USER"",sLoginName);
				if(sSuperUser!= sLoginName){
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0084"") +""\n"";
					sErrorCode += ""AM0084 \n"";					
				}//endif sSuperUser!= sLoginName
				else{
					if(sCustomerClass == ""Bahraini""){
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0094"") +""\n"";
						sErrorCode += ""AM0094 \n"";
					}//endif
					//Validation,ID Type 'GCC' should not be allowed for the GCC Country Code ""BH""
					var sGCCCntCode = TheApplication().InvokeMethod(""LookupValue"",""STC_GCC_COUNTRY_CODE"",""BH"")
					if(sGCCcountryCode == sGCCCntCode){
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0086"") +""\n"";
						sErrorCode += ""AM0086 \n"";
					}//endif sGCCcountryCode == sGCCCntCode
					//Validation of the ID# length for the respective country for the GCCID SRINI:17022014
					if(sGCCcountryCode != """"){
						var sOutps = TheApplication().NewPropertySet();
						var sInps = TheApplication().NewPropertySet();
						sInps.SetProperty(""GCCId"",sID);
						sInps.SetProperty(""GCCCountryCode"",sGCCcountryCode);
						sInps.SetProperty(""sErrorMsg"",sErrorMsg);
						sInps.SetProperty(""sErrorCode"",sErrorCode);		
						ValidateGCCId(sInps,sOutps);
						sErrorCode = sOutps.GetProperty(""ErrorCode"");
						sErrorMsg = sOutps.GetProperty(""ErrorMsg"");
					}//endif sGCCCountryCode
					else{
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0085"") +""\n"";
						sErrorCode += ""AM0085 \n"";
					}//endelse sGCCCountryCode					
				}//end else							
		}//endif sIDType
		if(sActiveView == ""STC Create New Customer View"")
		{
			if(sSelfEmployed == ""Y"" && (sIncomeGroup == """" || sIncomeGroup == null))
			{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0026"") +""\n"";
				sErrorCode += ""AM0026 \n"";
			}
			if((sSelfEmployed == ""N"" || sSelfEmployed == """") && (sCurrOccupation == """" || sCurrOccupation == null))
			{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0027"") +""\n"";
				sErrorCode += ""AM0027 \n"";
			}
		}
		
		if(sCustProvisionType == ""Corporate Individual"" || sActiveView == ""STC Create New Corporate Individual Account View"")
		{//[04Aug2015][NAVINR][SD: Corporate Individual Customer creation]
			if(sCompanyName == """" || sCompanyName == null)
			{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0001"") +""\n"";
				sErrorCode += ""AM0001 \n"";
			}
			if(sCRNumber == """" || sCRNumber == null)
			{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0064"") +""\n"";
				sErrorCode += ""AM0064 \n"";
			}
			else
			{	var vBusSvc = TheApplication().GetService(""STC SMECR Validation"");
				var vInpPS = TheApplication().NewPropertySet();
				var vOutPS = TheApplication().NewPropertySet();
				with (vInpPS)
				{
					vInpPS.SetProperty(""IDType"", ""CR"");
					vInpPS.SetProperty(""IDNumber"", sCRNumber);
					vInpPS.SetProperty(""CompanyName"", sCompanyName);
				}
				try{
					vBusSvc.InvokeMethod(""ValidateCustomer"", vInpPS, vOutPS);
				}catch(e){
					sErrorMsg += vOutPS.GetProperty(""Error Message"")+""\n"";
					sErrorCode += vOutPS.GetProperty(""Error Code"");
				}
			}
		}//end of if(sCustProvisionType == ""Corporate Individual""
		
		if(sFirstName == """" || sFirstName == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0046"") +""\n"";
			sErrorCode += ""AM0046 \n"";
		}
		else
		{
			for (i=0;i<sFirstName.length;i++)
				{ 
					icode = sFirstName.charCodeAt(i); 
					if (!((icode >= 65) && (icode <= 90) || (icode >= 97) && (icode <= 122) || (icode == 32)))
					{
		
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0009"") +""\n"";
						sErrorCode += ""AM0009 \n"";
						break;
					}
				}
		}							
		if(sLastName == """" || sLastName == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0048"") +""\n"";
			sErrorCode += ""AM0048 \n"";
		}
		else
		{
			for (i=0;i<sLastName.length;i++)
				{ 
					icode = sLastName.charCodeAt(i); 
					if (!((icode >= 65) && (icode <= 90) || (icode >= 97) && (icode <= 122) || (icode == 32)))
					{
		
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0011"") +""\n"";
						sErrorCode += ""AM0011 \n"";
						break;
					}
				}
		}
		
		//[NAVIN: 05Mar2017: IndCust_ID_Segment_FieldRestrictions]
		var vPassportType = TheApplication().InvokeMethod(""LookupValue"",""STC_CUST_ID_IND_TYPE"",""Passport"");
		if (sIDType == vPassportType)
		{
			var vPassportNumOut="""", vErrCodePP=""0"", vErrMsgPP=""""; 
			var pOutps = TheApplication().NewPropertySet();
			var pInps = TheApplication().NewPropertySet();
			with (pInps){
				SetProperty(""PassportNum"", sID);
				SetProperty(""ErrorFlag"", """");
			}
			ValidatePassport(pInps, pOutps);
			
			with(pOutps){
				vPassportNumOut = GetProperty(""PassportNumOut"");
				vErrCodePP = GetProperty(""ErrorCode"");
				vErrMsgPP = GetProperty(""ErrorMessage"");
			}
			if(vErrCodePP != ""0""){
				sErrorMsg += vErrMsgPP;
				sErrorCode += vErrCodePP;
			}   
		}//end of if (sIDType == vPassportType)
			
		if (sIDType == ""Employee Id"")
		{//[NAVIN:15Apr2018:TRA_EmployeeRegistration]
			if(sEmpCPR == null || sEmpCPR == """")
			{	sErrorMsg += ""Employee CPR Number is mandatory\n"";
				sErrorCode = sErrorCode + ""EMPLOYEE_CR_ERROR\n"";}
			if(sEmpCR == null || sEmpCR == """")
			{	sErrorMsg += ""Company CR Number is mandatory\n"";
				sErrorCode = sErrorCode + ""EMPLOYEE_CR_ERROR\n"";}
			if(sEmpCPR != """" && sEmpCPR != '' && sEmpCPR != null)
			{	var vErrCodeE=""0"", vErrMsgE=""""; 
				var eOutps = TheApplication().NewPropertySet();
				var eInps = TheApplication().NewPropertySet();
				with (eInps){
					SetProperty(""IDType"", ""Bahraini ID"");
					SetProperty(""IDNumber"", sEmpCPR);
					SetProperty(""ErrorFlag"", """");
				}
				ValidateCPR(eInps, eOutps);
				
				with(eOutps){
					vErrCodeE = GetProperty(""ErrorCode"");
					vErrMsgE = GetProperty(""ErrorMessage"");
				}
				if(vErrCodeE != ""0""){
					sErrorMsg += ""Please enter a valid 9 digit Employee CPR\n"";
					sErrorCode = sErrorCode + vErrCodeE + ""\n"";
				}
			}
		}
		
		if (sIDType==""Bahraini ID"" && ByPassCPRCheck != ""Y"")
		{//Praveen Perala
			var vBlackFlg=CheckBlacklist(sID);
				if(vBlackFlg ==""Y"")
				{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM00082"") +""\n"";
				sErrorCode += ""AM00082 \n"";
				}   
		}
		if ((sIDType==""Bahraini ID"" || sIDType==""PNN ID"") && sID.length>9)
			{
		     //TheApplication().RaiseErrorText(""Please Enter 9 digit CPR Number"");
		     	sErrorMsg += LookupMessage(""User Defined Errors"",""AM0063"") +""\n"";
				sErrorCode += ""AM0063 \n"";					 
			}
			else if((sIDType==""Bahraini ID"" || sIDType==""PNN ID"") && sID.length<9)
			{
		     //TheApplication().RaiseErrorText(""Please Enter 11 digit CPR Number"");					 
		     sErrorMsg += LookupMessage(""User Defined Errors"",""AM0063"") +""\n"";
			 sErrorCode += ""AM0063 \n"";
			}
			else if(sIDType==""Bahraini ID"" && sID.length==""9"")
			{
			 var sID0 = sID.charAt(0);//a  
             var sID1 = sID.charAt(1); //b
             var sID2 = sID.charAt(2); //c            
             var sID3 = sID.charAt(3);//d
             var sID4 = sID.charAt(4);//e
             var sID5 = sID.charAt(5);//f
             var sID6 = sID.charAt(6);//g
             var sID7 = sID.charAt(7);//h
             
             var sID8 = sID.charAt(8);  //i                   
             var Valid =((sID7*2+sID6*3+sID5*4+sID4*5+sID3*6+sID2*7+sID1*8+sID0*9)%11);
             var Valid1=(11-Valid);
             }      
        
           if(Valid == ""0""|| Valid == ""1"")
           {
           	var SIDNew = ""0"";
           }
           else
           {
           	var SIDNewext = Valid1;
           }
			if(SIDNew != sID8)
			{
				if(SIDNewext != sID8)
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0062"") +""\n"";
					sErrorCode += ""AM0062 \n"";
				}
			}
		
		//Praveen CPR Validation
		
	}//with(appObj)
	with(psOutputs)
	{
		SetProperty(""Error Code"", sErrorCode);
		SetProperty(""Error Msg"", sErrorMsg);
	}
}
catch(e)
{
	LogException(e);
}
finally
{}
}
function ValidatePassport(Inputs,Outputs)
{
/*
[NAVIN: 05Mar2017: IndCust_ID_Segment_FieldRestrictions]
Desc: Function to validate the Passport#
*/
var vErrCode=""0"", vErrMsg="""", vErrFlag="""";
var vPassportNum="""", vPassportLen=0, vPassportMaxLen=0, vPassportMinLen=0;
var sBoLOV=null, sBcLOV=null, IsRec=false;
var vPassportID="""", vFirstChar="""",  vLastChar="""";

try
{	
	with(Inputs)
	{
		vPassportNum = GetProperty(""PassportNum"");
		vErrFlag = GetProperty(""ErrorFlag"");
		
		vPassportNum = vPassportNum.toUpperCase();
		vPassportID = vPassportNum;
	}
	with(Outputs)
	{
		SetProperty(""PassportNumOut"", """");
		SetProperty(""ErrorCode"", """");
		SetProperty(""ErrorMessage"", """");	
	}
	
	vPassportLen = vPassportID.length;
	
	sBoLOV = TheApplication().GetBusObject(""List Of Values"");
	sBcLOV = sBoLOV.GetBusComp(""List Of Values"");
	with(sBcLOV){
		ActivateField(""Low"");
		ActivateField(""High"");
		ClearToQuery();
		SetViewMode(AllView);
		SetSearchSpec(""Type"",""STC_CUST_ID_IND_TYPE"");
		SetSearchSpec(""Name"", ""Passport"");
		ExecuteQuery(ForwardOnly);
		IsRec = FirstRecord();
		if(IsRec){
			vPassportMinLen = ToNumber(GetFieldValue(""Low""));
			vPassportMaxLen = ToNumber(GetFieldValue(""High""));
		}//endif IsRec
	}//end of with(sBcLOV)
	
	if((vPassportLen < vPassportMinLen) || (vPassportLen > vPassportMaxLen))
	{//Rule1: Validate Passport Length		
		vErrMsg += TheApplication().LookupMessage(""User Defined Errors"",""AM0065"") +""\n"";
		vErrCode += ""AM0065 \n"";
	}
	else //else1
	{
		var vValidFlag = ""N"", vDigitFlag=""N"", i=0, vIdChar="""", vIdCharCode="""";
		vFirstChar = vPassportID.substring(0,1);
		vLastChar = vPassportID.substring(vPassportLen-1, vPassportLen);
		
		/*if (vFirstChar == ""0"" || vLastChar == ""0"")
		{//Rule2: Validate First and Last Char
			vErrMsg += TheApplication().LookupMessage(""User Defined Errors"",""AM0067"") +""\n"";
			vErrCode += ""AM0067 \n"";	
		}
		else //else2
		*/
		{
			for(i=0; i < vPassportLen; i++)
			{
				vIdChar = vPassportID.charAt(i);
				vIdCharCode = vPassportID.charCodeAt(i);
				
				if (((vIdCharCode >= 65) && (vIdCharCode <= 90)) || ((vIdCharCode >= 97) && (vIdCharCode <= 122)))
				{
					vValidFlag = ""Y"";
					i = i++;
				}
				else
				{
					vIdChar = ToNumber(vIdChar);
					if(vIdChar <= 9 && vIdChar >= 0)
					{		
						vValidFlag = ""Y"";
						vDigitFlag = ""Y"";
						i = i++;
					}
					else
					{
						vValidFlag = ""N"";
						i = vPassportLen;
						break;
					}
				}//end of if (((vIdCharCode >= 65) ...					
			}//end for
			
			if(vValidFlag == ""N"")
			{//Rule3: Validate Invalid Characters
				vErrMsg += TheApplication().LookupMessage(""User Defined Errors"",""AM0066"") +""\n"";
				vErrCode += ""AM0066 \n"";			
			} 
			else if(vDigitFlag == ""N"")
			{//Rule4: Validate Only Letter
				vErrMsg = TheApplication().LookupMessage(""User Defined Errors"",""AM0068"")+""\n"";
				vErrCode = ""AM0068 \n"";			
			}
		}//end of else2
	}//end of else1
		
	with(Outputs)
	{
		SetProperty(""PassportNumOut"", vPassportNum);
		SetProperty(""ErrorCode"", vErrCode);
		SetProperty(""ErrorMessage"", vErrMsg);
	}
	if (vErrCode != ""0"" && (vErrFlag == ""THROW"" || vErrFlag == ""throw"" || vErrFlag == ""Y""))
	{
		TheApplication().RaiseErrorText(vErrMsg);
	}
}//end of try
catch(e)
{
	//vErrMsg = TheApplication().LookupMessage(""User Defined Errors"",""AM0066"") +""\n"";
	//vErrCode = ""AM0066 \n"";
	vErrMsg = e.errText;
	vErrCode = e.errCode;
	with(Outputs)
	{
		SetProperty(""PassportNumOut"", vPassportNum);
		SetProperty(""ErrorCode"", vErrCode);
		SetProperty(""ErrorMessage"", vErrMsg);
	}
	if (vErrFlag == ""THROW"" || vErrFlag == ""throw"" || vErrFlag == ""Y"")
	{
		TheApplication().RaiseErrorText(vErrMsg);
	}
}
finally{
	sBcLOV=null;
	sBoLOV=null;	
}
		
return CancelOperation;
}
function ValidateVAT(Inputs,Outputs)
{//[NAVIN:11Feb2019:BusinessVATReg]

	var vErrCode=""0"", vErrMsg="""", vErrFlag="""";
	var sTaxCategory="""", sCorpVATNum="""", sAccountType="""";
	var VFNo= """",VCity="""",VBldNo="""",VStNo="""",VBlckNo="""",VGov="""",VPBoxNo="""",VRoadNo="""";

	try{
		with(Inputs){
			vErrFlag = GetProperty(""ErrorFlag"");
			sAccountType = GetProperty(""AccountType"");
			sTaxCategory = GetProperty(""TaxCategory"");
			sCorpVATNum = GetProperty(""CorpVATNum"");
			VFNo = GetProperty(""VFNo"");
			VCity = GetProperty(""VCity"");
			VBldNo = GetProperty(""VBldNo"");
			VStNo = GetProperty(""VStNo"");
			VBlckNo = GetProperty(""VBlckNo"");
			VGov = GetProperty(""VGov"");
			VPBoxNo = GetProperty(""VPBoxNo"");
			VRoadNo = GetProperty(""VRoadNo"");
		}
		with(Outputs)
		{
			SetProperty(""ErrorCode"", """");
			SetProperty(""ErrorMessage"", """");	
		}
		
		//Mayank: Added for VAT May18 ----- START --------
		if(sTaxCategory == null || sTaxCategory == """")
		{
			vErrMsg += ""Taxation Category is a Required. Please populate the value and Proceed.\n"";
			vErrCode += ""AM0071 \n"";
		}
		if((sAccountType == ""Corporate"" || sAccountType == ""SME"") && (sCorpVATNum == null || sCorpVATNum == """"))
		{
			vErrMsg += ""Corporate VAT Number is a Required. Please populate the value and Proceed.\n"";
			vErrCode += ""AM0072 \n"";
		}
		
		if(sAccountType == ""Corporate"" || sAccountType == ""SME"")
		{//[MANUJ] : [BVATRegistration] -- STart
			var sCorpVATNumLen = sCorpVATNum.length;
			if((sCorpVATNumLen != 15) || isNaN(parseInt(sCorpVATNum))){
				vErrMsg += ""Corporate VAT Number should have 15 digits numeric value.\n"";
				vErrCode += ""AM0073\n"";
			}
				
			if(VBlckNo == """" || VBlckNo == null){
				vErrMsg += ""VAT Block No is Required Field. Please Enter a value for the field.\n"";
				vErrCode += ""AM0074\n"";
			}
			
			if(VBldNo == """" || VBldNo == null){
				vErrMsg += ""VAT Building No is Required Field. Please Enter a value for the field.\n"";
				vErrCode += ""AM0075\n"";
			}
			
			if(VCity == """" || VCity == null){
				vErrMsg += ""VAT City is Required Field. Please Enter a value for the field.\n"";
				vErrCode += ""AM0076\n"";
			}
			
			if(VFNo == """" || VFNo == null){
				vErrMsg += ""VAT FlatVillaNo is Required Field. Please Enter a value for the field.\n"";
				vErrCode += ""AM0077\n"";
			}
			
			if(VGov == """" || VGov == null ){
				vErrMsg += ""VAT Governorate is Required Field. Please Enter a value for the field.\n"";
				vErrCode += ""AM0078\n"";
			}
		
			if(VRoadNo == """" || VRoadNo == null ){
				vErrMsg += ""VAT Road No is Required Field. Please Enter a value for the field.\n"";
				vErrCode += ""AM0079\n"";
			}
		
			if (VFNo.length > 5){
				vErrMsg += ""VAT Flat/Villa No shouldn't be greater than 5 digits.\n"";
				vErrCode += ""AM0077\n"";
			}
		}
		
		with(Outputs)
		{
			SetProperty(""ErrorMessage"", vErrMsg);
			SetProperty(""ErrorCode"", vErrCode);
		}
		
		if (vErrCode != ""0"" && (vErrFlag == ""THROW"" || vErrFlag == ""throw"" || vErrFlag == ""Y""))
		{
			TheApplication().RaiseErrorText(vErrMsg);
		}

		return vErrMsg;
	}
	catch(e){
		vErrMsg = e.errText;
		vErrCode = e.errCode;
		with(Outputs)
		{
			SetProperty(""ErrorCode"", vErrCode);
			SetProperty(""ErrorMessage"", vErrMsg);
		}
		if (vErrFlag == ""THROW"" || vErrFlag == ""throw"" || vErrFlag == ""Y"")
		{
			TheApplication().RaiseErrorText(vErrMsg);
		}
		return vErrMsg;
	}
	finally{

	}
		
	return CancelOperation;
}
function validateCorporate(sOrgFlg,sActiveView,sSelfEmployed,sIncomeGroup,sCurrOccupation,sAccountName,sLineOfBusiness,sNumEmp,sBranchLocal,sFirstName,sLastName,sBusTel1,sManagerName,sOffNum,sOffEmail,sCR,sGCCcountryCode,sID,sIDType,psOutputs)
{
var appObj,i,icode,semailAddr,sfirstChar,slastChar,sNot_First_Last,srequiredChars,sillegalChars,iIndex,ipindex,scurrent_char;
var sErrorCode = """";
var sErrorMsg = """";
var sMesg ="""";
try
{
	appObj = TheApplication();
	with(appObj)
	{
		var sGCCType = TheApplication().InvokeMethod(""LookupValue"",""STC_CUST_ID_TYPE"",""GCC"");//CIO Software Update SD SRINI:23022014
		if(sIDType == sGCCType){			
				var sLoginName = TheApplication().LoginName();
				var sSuperUser = TheApplication().InvokeMethod(""LookupValue"",""STC_GCC_SUPER_USER"",sLoginName);
				if(sSuperUser!= sLoginName){
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0084"") +""\n"";
					sErrorCode += ""AM0084 \n"";					
				}//endif sSuperUser!= sLoginName
				else{
					//Validation,ID Type 'GCC' should not be allowed for the GCC Country Code ""BH""
					var sGCCCntCode = TheApplication().InvokeMethod(""LookupValue"",""STC_GCC_COUNTRY_CODE"",""BH"")
					if(sGCCcountryCode == sGCCCntCode){
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0086"") +""\n"";
						sErrorCode += ""AM0086 \n"";
					}//endif sGCCcountryCode == sGCCCntCode
					//Validation of the ID# length for the respective country for the GCCID SRINI:17022014
					if(sGCCcountryCode != """"){
						var sOutps = TheApplication().NewPropertySet();
						var sInps = TheApplication().NewPropertySet();
						sInps.SetProperty(""GCCId"",sID);
						sInps.SetProperty(""GCCCountryCode"",sGCCcountryCode);
						sInps.SetProperty(""sErrorMsg"",sErrorMsg);
						sInps.SetProperty(""sErrorCode"",sErrorCode);		
						ValidateGCCId(sInps,sOutps);
						sErrorCode = sOutps.GetProperty(""ErrorCode"");
						sErrorMsg = sOutps.GetProperty(""ErrorMsg"");
					}//endif sGCCCountryCode
					else{
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0085"") +""\n"";
						sErrorCode += ""AM0085 \n"";
					}//endelse sGCCCountryCode					
				}//end else							
		}//endif sIDType
		
		if(sOrgFlg ==""Y"")
		{
			if(sActiveView == ""STC Create New Customer View"")
			{
				if(sSelfEmployed == ""Y"" && (sIncomeGroup == """" || sIncomeGroup == null))
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0026"") +""\n"";
					sErrorCode += ""AM0026 \n"";
				}
			if((sSelfEmployed == ""N"" || sSelfEmployed == """") && (sCurrOccupation == """" || sCurrOccupation == null))
				{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0027"") +""\n"";
					sErrorCode += ""AM0027 \n"";
				}
			}
			if(sCR == """" || sCR == null)
			{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0002"") +""\n"";
				sErrorCode += ""AM0002 \n"";
			}
		}
		if(sAccountName == """" || sAccountName == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0001"") +""\n"";
			sErrorCode += ""AM0001 \n"";
		}
		if(sLineOfBusiness == """" || sLineOfBusiness == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0003"") +""\n"";
			sErrorCode += ""AM0003 \n"";
		}
		if(sNumEmp == """" || sNumEmp == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0034"") +""\n"";
			sErrorCode += ""AM0034 \n"";
		}
		else
		{
		if(!isNaN(sNumEmp))//[MANUJ] : [CCS]
		{
		if (sNumEmp < 1)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""CCS001"") +""\n"";
			sErrorCode += ""CCS001 \n"";
		}
		
		}
//No Of Employees is a Number Field.
		else
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""CCS002"") +""\n"";
			sErrorCode += ""CCS002 \n"";
		}
		}
		if(sBranchLocal == """" || sBranchLocal == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0033"") +""\n"";
			sErrorCode += ""AM0033 \n"";
		}
		if(sFirstName == """" || sFirstName == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0046"") +""\n"";
			sErrorCode += ""AM0046 \n"";
		}
		else
		{
			for (i=0;i<sFirstName.length;i++)
				{ 
					icode = sFirstName.charCodeAt(i); 
					if (!((icode >= 65) && (icode <= 90) || (icode >= 97) && (icode <= 122) || (icode == 32)))
					{
		
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0009"") +""\n"";
						sErrorCode += ""AM0009 \n"";
						break;
					}
				}
		}							
		if(sLastName == """" || sLastName == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0047"") +""\n"";
			sErrorCode += ""AM0047 \n"";
		}
		else
		{
			for (i=0;i<sLastName.length;i++)
				{ 
					icode = sLastName.charCodeAt(i); 
					if (!((icode >= 65) && (icode <= 90) || (icode >= 97) && (icode <= 122) || (icode == 32)))
					{
		
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0010"") +""\n"";
						sErrorCode += ""AM0010 \n"";
						break;
					}
				}
		}
		if(sBusTel1 == """" || sBusTel1 == null)
		{
			sErrorMsg += LookupMessage(""User Defined Errors"",""AM0035"") +""\n"";
			sErrorCode += ""AM0035 \n"";
		}
		else
		{
			if(!isNaN(sBusTel1))
			{
				if(sBusTel1.length < 8)
				{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0041"") +""\n"";
				sErrorCode += ""AM0039 \n"";
				}
			}
			else
			{	
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0040"") +""\n"";
				sErrorCode += ""AM0038 \n"";
			}
		}
		if(sOrgFlg == ""N"")
		{
			if(sManagerName == """" || sManagerName == null)
			{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0032"") +""\n"";
				sErrorCode += ""AM0032 \n"";
			}
			else
			{
				for (i=0;i<sManagerName.length;i++)
				{ 
					icode = sManagerName.charCodeAt(i); 
					if (!((icode >= 65) && (icode <= 90) || (icode >= 97) && (icode <= 122) || (icode == 32)))
					{
						sErrorMsg += LookupMessage(""User Defined Errors"",""AM0045"") +""\n"";
						sErrorCode += ""AM0045 \n"";
						break;
					}
				}
			}
			if(sOffNum == """" || sOffNum == null)
			{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0036"") +""\n"";
				sErrorCode += ""AM0036 \n"";
			}
			else
			{
				if(!isNaN(sOffNum))
				{
					if(sOffNum.length < 8)
					{
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0039"") +""\n"";
					sErrorCode += ""AM0039 \n"";
					}
				}
				else
				{	
					sErrorMsg += LookupMessage(""User Defined Errors"",""AM0038"") +""\n"";
					sErrorCode += ""AM0038 \n"";
				}
			}
			if(sOffEmail == """" || sOffEmail == null)
			{
				sErrorMsg += LookupMessage(""User Defined Errors"",""AM0037"") +""\n"";
				sErrorCode += ""AM0037 \n"";
			}
			else
			{
				   semailAddr = sOffEmail;
				   sfirstChar = semailAddr.substring(0,1);
				   slastChar = semailAddr.substring(semailAddr.length-1,semailAddr.length);
				   sNot_First_Last = ""@."";
				   srequiredChars = "".@"";
				   sillegalChars = "",:; <>[]{}!£$%^*()#/+~|"";
				   iIndex = semailAddr.indexOf(""@"");
				   ipindex = semailAddr.lastIndexOf(""."");
				   
				    if (semailAddr.length < 6)
				    {
					       sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
					       sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
						   sErrorCode += ""AM0018 \n"";	
					 }
					 else if (sNot_First_Last.indexOf(sfirstChar,0) != -1)
					 {
						   sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
						   sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
						   sErrorCode += ""AM0018 \n"";
					 }
					 else if (sNot_First_Last.indexOf(slastChar,0) != -1)
	                 {
		                   sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
						   sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
						   sErrorCode += ""AM0018 \n"";
					 }
					 else if(iIndex > ipindex)
					 {
						   sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
						   sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
						   sErrorCode += ""AM0018 \n"";
					 }
	                 else if (sMesg == """")
	                 {
	                       //Process Required Chars
	                       for (i=0;i<srequiredChars.length;i++)
	                       {
	                             scurrent_char = srequiredChars.substring(i,i+1);
	                             if (semailAddr.indexOf(scurrent_char,0) == -1)
	                             {
		                               sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
						               sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
						               sErrorCode += ""AM0018 \n"";
						               break;
				             	 }
				           }  	 
				           
				     }
				     
				      else if (sMesg == """")
	                	{                       
	                        //Process all other illegal chars
	                       for (i=0;i<sillegalChars.length;i++)
	                       {
	                              scurrent_char = sillegalChars.substring(i,i+1);
	                              if (semailAddr.indexOf(scurrent_char,0) != -1)
	                              {
		                                sMesg = LookupMessage(""User Defined Errors"",""AM0018"");
						                sErrorMsg += LookupMessage(""User Defined Errors"",""AM0018"") +""\n"";
						                sErrorCode += ""AM0018 \n"";
						                break;
					              }  
					        }
			    	  	}
			}//if(sOffEmail == """" || sOffEmail == null)
		}//if(sOrgFlg == ""N"")
	}
	with(psOutputs)
		{
			SetProperty(""Error Code"", sErrorCode);
			SetProperty(""Error Msg"", sErrorMsg);
		}
	}
catch(e)
{
	LogException(e);
}
finally
{}

}
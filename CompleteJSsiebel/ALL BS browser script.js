//var ForReading = 1, ForWriting = 2;
function ReadLocalFile (inputPropSet, outputPropSet,psFile)
{
/*	
	var strFilePath = inputPropSet.GetProperty(""FilePath"");
	var iReadLine 	= 1;
    var axoFileObject;
	var ptrFile;	
	
    if(strFilePath ==null) {
    	strFilePath = prompt(""Please Enter full File Path (including file name)."");
    }

    if(strFilePath != """") {
    	try {
	     	axoFileObject = new ActiveXObject(""Scripting.FileSystemObject"");
	        ptrFile = axoFileObject.OpenTextFile(strFilePath, ForReading);
        	var strFileTxt = ptrFile.ReadLine();
        	psFile.SetType(""FileContent"");	        	
        	while(strFileTxt != null) {
        		psFile.SetProperty(iReadLine++,strFileTxt);
        		strFileTxt = ptrFile.ReadLine();
        	}
	        
	        ptrFile.Close();
     	} catch(e) {
     		if(ptrFile != null)
	   			ptrFile.Close();
     		outputPropSet.SetProperty(""ErrCode"",""ERROR"");
     		outputPropSet.SetProperty(""ErrMessage"",e.message);
     	
     	} finally {
     	
     		if(axoFileObject != null)
    			axoFileObject = null;
     		outputPropSet.AddChild(psFile);
     	}
   	} else {
   		outputPropSet.SetProperty(""ErrCode"",""ERROR"");
    	outputPropSet.SetProperty(""ErrMessage"",""Please specify a file path"");
   	}*/
 
}
function Service_PreInvokeMethod (methodName, inputPropSet, outputPropSet)
{
	
  /*  var psFile 	= inputPropSet;
    
    outputPropSet.SetProperty(""ErrCode"","""");
    outputPropSet.SetProperty(""ErrMessage"","""");
        
	switch(methodName) {
		case ""ReadLocalFile"":
	      	ReadLocalFile (inputPropSet, outputPropSet,psFile)
			break;
		case ""WriteLocalFile"":
			WriteLocalFile(inputPropSet,outputPropSet,psFile);
			break;
		default:
			return(""ContinueOperation"");
			
	}
	return(""CancelOperation"");*/
	
}
function WriteLocalFile (inputPropSet, outputPropSet, psFile)
{
	
/*	var strFilePath = inputPropSet.GetProperty(""FilePath"");
	var iWriteLine 	= 1;
	var axoFileObject;
	var ptrFile;
    if(strFilePath =="""") {
    	strFilePath = prompt(""Please Enter full File Path (including file name)."");
    	//alert(strFilePath);
    }
 
    if(strFilePath != null) {
    	try {
	       	axoFileObject = new ActiveXObject(""Scripting.FileSystemObject"");
	        ptrFile = axoFileObject.OpenTextFile(strFilePath,ForWriting,true);
//			ptrFile = axoFileObject.CreateTextFile(strFilePath,true);

	       if((inputPropSet.GetProperty(""FileContentString"") != """") && (inputPropSet.GetProperty(""FileContentString"") != null)) {
	        	ptrFile.Write(inputPropSet.GetProperty(""FileContentString""));
	        }
	        else if(inputPropSet.GetChildCount() != 0){
	        	for(var iChildCnt = 0; iChildCnt < inputPropSet.GetChildCount();iChildCnt++) {
	        		if(inputPropSet.GetChild(iChildCnt).GetType() == ""FileContent"") {
	        			psFile = inputPropSet.GetChild(iChildCnt);
	        			break;
	        		}
	        	}
	        	if(psFile == null) {
	        		outputPropSet.SetProperty(""ErrCode"",""ERROR"");
	     			outputPropSet.SetProperty(""ErrMessage"",""Input property set not found"");
	        	} else {
		        	
		        	while(psFile.GetProperty(iWriteLine) != null) {
		        		ptrFile.WriteLine(psFile.GetProperty(iWriteLine++));
		        	}
		        	
		        }
	        }
	        ptrFile.Close();
     	} catch(e) {

     		if(ptrFile != null)
   			ptrFile.Close();
     		outputPropSet.SetProperty(""ErrCode"",""ERROR"");
     		outputPropSet.SetProperty(""ErrMessage"",e.message);
     	
     	} finally {
     	
     		if(axoFileObject != null)
     			axoFileObject = null;
     	}
   	} else {
   		outputPropSet.SetProperty(""ErrCode"",""FILE_NULL"");
    	outputPropSet.SetProperty(""ErrMessage"",""Please specify a file path"");
   	}*/

}

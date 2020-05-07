sap.ui.define([
    "sap/m/MessageBox",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/Text",
	"sap/ui/export/Spreadsheet",
	"sap/ui/model/odata/v2/ODataModel",
	"sobeys/libraries/Utilities"], 
	function(MessageBox,Button, Dialog, Text,Spreadsheet,ODataModel,Utilities) {
	"use strict";
	return ("sobeys.libraries.Utilities" ,{

            // this function performs that validation of the characteristics and is called from the onValidateContents functions in the FileUpload controllers of various applications
			validateCharacteristic: function(pContoller,pArrayFileValues,pCharacteristicData,pLength,pAllowBlanks) {
                try {
                    // fill an array with the list of unique values passed in with the parameter pArrayFileValues
                    var aList = [];
                    var rReturn = { flag : true, errors : [] };
                    var iCharacteristicWidth = 0;
                    var iPadLength = 0;
                    var aCharacteristicData = pCharacteristicData;
                    var oController = pContoller;
                    
                    // fill the array of unique characterisic values which are in the upload file
                    if(!Array.isArray(pArrayFileValues)) {
                        aList.push(pArrayFileValues);   
                    } else {
                        aList = pArrayFileValues;
                    }

                    if(pLength!==null){iPadLength = pLength;}
                    // loop through the array of unique values and pad the values if the value is not blank
                    for (var iLoop = 0; iLoop < aList.length; iLoop++) {
                        if(pAllowBlanks &&  aList[iLoop].replace(/(\r\n|\n|\r)/gm, "")===''){  // check to see if a blank value is allowed using the parameter, and if it allowed and it is blank skip the current loop iteration
                            continue;
                        }
                        var cListValuePadded = '';
                        cListValuePadded = aList[iLoop].padStart(iPadLength,'0').replace(/(\r\n|\n|\r)/gm, "");
                        // and then check if padded unique value from the upload is in the array which contains the master data for the characteristic
    				    if(!aCharacteristicData.includes(cListValuePadded)) {
    				        // if the value is not found set the flag and value on the return variable to indicate a validation failure.
    				        rReturn.flag = false;
    				        rReturn.errors.push(aList[iLoop]); 
    				    }
                    }
                    return rReturn;
                } catch(err) {
                    Utilities.InputMessage('Processing stopped!  An error was raised and the error stack is: \n ' + err.stack,'Upload Process Stopped','Message','Error',false);
                    Utilities.createLogTableEntryOData(oController.cApplicationName,oController.cUserID,err.stack,oController.cErrorLoggingODataPath,oController.oDataModel_Logs);
                    throw new Error();
		        }                        
            },
            
			//Function that checks for duplicate records in the upload files based using an array of values which is passed in
			findDuplicates : function(pController,pRecordsArray) {
			    try { 
                var iRow,
                    aDuplicateRecords=[],
                    rDuplicateRecord = {},
                    aCheckedRecords={},
                    aRecordsArray = pRecordsArray;
                var oController = pController;
                for (iRow=0;iRow < aRecordsArray.length;iRow++) {
                    // this process is quite simple, loop through the array provided in the parameter and check if the records is in oCheckedRecords array.
                    // if it is the array it is a duplicate and enter the IF and capture the informatiom about the record into an array that is the return value.
                    // If a match is not found, its not a duplicate record (yet....), and will be added to the oCheckedRecords array in the ELSE.
                    if (aCheckedRecords[aRecordsArray[iRow]] != null) {
                        // get the information for the current record which has been identified as a duplicate
                            rDuplicateRecord = 'Duplicate Record with Characteric Key: ' + 
                            aRecordsArray[iRow].replace(/"/g,'').replace(/:/g,'=').replace('{','').replace('}','') + ' - Upload File Row: ' + Number(iRow+2).toLocaleString(); 
                        aDuplicateRecords.push(rDuplicateRecord);
                         rDuplicateRecord = {};
                        // get the information for the last occurance of the duplicate record 
                            rDuplicateRecord = 'Duplicate Record with Characteric Key: ' + 
                            aRecordsArray[iRow].replace(/"/g,'').replace(/:/g,'=').replace('{','').replace('}','') + ' - Upload File Row: ' + Number(aCheckedRecords[aRecordsArray[iRow]]+1).toLocaleString();
                        aDuplicateRecords.push(rDuplicateRecord);
                        aCheckedRecords[aRecordsArray[iRow]] = iRow + 1;
                        rDuplicateRecord = {};
                    } else {
                        // this will be entered on the first record in the loop and in any loop where the loop record is not found in this array.
                        aCheckedRecords[aRecordsArray[iRow]] = iRow + 1;            
                    }
                }
                aDuplicateRecords.sort();
                return aDuplicateRecords;
			    }  // closing for Try 
			    catch(err) {
                    Utilities.InputMessage('Processing stopped!  An error was raised and the error stack is: \n ' + err.stack,'Upload Process Stopped','Message','Error',false);
                    Utilities.createLogTableEntryOData(oController.cApplicationName,oController.cUserID,err.stack,oController.cErrorLoggingODataPath,oController.oDataModel_Logs);
		        }                        
            }            
	});	
});
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

		formatUpperCase : function(sName) {
			return sName && sName.toUpperCase();
		},
		
		formatUserInfo : function(sUser,sSid,sHost) {			
			return sUser + " | " + sSid + " | " + sHost;
		},
		
    	// dialog messagebox function
		InputMessage: function(varMessage,varTitle,varType,varState,varStretch){ 
		    if(varStretch === undefined){ varStretch = false;}
			var dialog = new sap.m.Dialog({
			    draggable: true,
			    resizable: true,
			    stretch: varStretch,
			    title: varTitle,
			    type: varType,
			    state: varState,
			    content: new Text({text: varMessage}),
			    beginButton: new Button({
				    text: 'OK',
    			    press: function () {
    				    dialog.close();
    			    }
			    }),
    			    afterClose: function() {
    			        dialog.destroy();
    			    }
    			});
			dialog.open();
		},
				
   	// dialog messagebox function
		InputMessageYesNo: function(varMessage,varTitle,varType,varState) {
		    var vReturnValue = false;
			var dialog = new Dialog({
			title: varTitle,
			type: varType,
			state: varState,
			content: new Text({text: varMessage}),
			beginButton: new Button({
				text: 'Yes',
			press: function () {
				vReturnValue = true;
				dialog.close();
				return vReturnValue;
			}
			}),
		    endButton: new Button({
				text: 'No',
				press: function () {
				dialog.close();
        	}
        	}),
			beforeClose: function() {
			    return vReturnValue;
			    },        	
			afterClose: function() {
			    dialog.destroy();
			    }
			    });
			    dialog.open();
    		},
    		
    		AddZero: function(num) {
                return (num >= 0 && num < 10) ? "0" + num : num + "";
    		},
    		
    		CurrentDateTime: function() {
    		    var now = new Date();
                var strDateTime = [[this.AddZero(now.getDate()), 
                    this.AddZero(now.getMonth() + 1), 
                    now.getFullYear()].join("/"), 
                    [this.AddZero(now.getHours()), 
                    this.AddZero(now.getMinutes()),this.AddZero(now.getSeconds())].join(":"), 
                    now.getHours() >= 12 ? "PM" : "AM"].join(" ");
    		    return strDateTime;
    		},
    		
    		Wait: function (ms) {
                var d = new Date();
                var d2 = null;
                do { d2 = new Date(); }
                while(d2-d < ms);
            },
                
    		createLogTableEntry : function(pApplication,pErrorStack,pURL){
                var aEntry = {};
                var aEntryList = [];
                aEntry.APPLICATION = pApplication;
                aEntry.ERROR_TEXT = pErrorStack;
                aEntryList.push(aEntry);
    	    
           		$.ajax({
                    url: pURL,
                    async :false,
                    data: JSON.stringify(aEntryList),
                    contentType: "aplication/json",
                    method: 'POST'
           		});
		    },

    		createLogTableEntryOData : function(pApplication,pUserID,pErrorStack,pODataPath,pModel){
                var rEntry = {};
                var dDateTime = Date.now();
                var cDateTime = dDateTime.toString();
                rEntry.LOG_ID = cDateTime;
                rEntry.APPLICATION = pApplication;
                rEntry.LOG_ENTRY = pErrorStack;
				rEntry.CREATED_BY = pUserID;
				rEntry.CREATED_ON = new Date();
//                var oModel =  new ODataModel(pModelURL);
                pModel.create(pODataPath,rEntry,
                { success : function(oData,oReponse) {
                        return;
                    },
                    error: function(err) {
                        var cError = 'Error Message: ' + err.message +  
                            '\nResponse Text: ' + err.responseText +  
                            '\nStatus Code and Text: ' + err.statusCode + ' ' + err.statusText;
//                    InputMessage('Unable to Crate Errog Logging Record!  An error was raised and the error stack is: \n ' + err.stack,'Error','Message','Error',false);
                    return;
                    }
			    });
		    },

            onDataExport: function(pDownLoadType,pFilters,pExportModelURL,pPath,pDummyKey,pFileName,pColumnModelURL,pErrorLoggingApplication,pErrorLoggingURL) {
                sap.ui.core.BusyIndicator.show(0);
                var oExportModel =  new ODataModel(pExportModelURL);
				oExportModel.setSizeLimit(10000000);
                oExportModel.read(pPath+'/$count',{
                    filters : pFilters,
                    success: function(pData,pResponse){
                        sap.ui.core.BusyIndicator.hide();
                        if (isNaN(pResponse.body)){
                            var iRecords = null;
                        } else {
                            var iRecords = parseInt(pResponse.body);
                        }
                        // this is a dummy control that is required to get the oData binding items for the datasource section 
                        // of the oSpreadsheet defintion.  This control simply needs to have the key mapped to any field that is 
                        // in the ODataModel being used.
                        var oDummyInput = new sap.m.Select();
        				oDummyInput.setModel(oExportModel);
        				oDummyInput.bindAggregation("items", { 
        				    path : pPath,
        					template : new sap.ui.core.ListItem({
        						key : pDummyKey
        					}),
        					filters : pFilters});
                        var oBinding = oDummyInput.getBinding("items");    
                        
                        // create the model for the columns and populate it from the JSON file
                	    var oModelColumns = new sap.ui.model.json.JSONModel(pColumnModelURL);
                        oModelColumns.loadData(pColumnModelURL, "GET", false);
                        var oColumnData = oModelColumns.getData('/columns');
                        var aCols = [];
                         for (var iLoop = 0; iLoop < oColumnData.columns.length; iLoop++) {
                            aCols.push(oColumnData.columns[iLoop]); 
                         }     
                        
                        var oSpreadsheet = new Spreadsheet({
                            dataSource: {
                                type: 'odata',
                                dataUrl : oBinding.getDownloadUrl ? oBinding.getDownloadUrl() : null,
                                serviceUrl : oExportModel.sServiceUrl,
                                headers : oExportModel.getHeaders ? oExportModel.getHeaders() : null,
                                count : iRecords,
                                useBatch : true,
                                sizeLimit : 10000
                            },
                            worker : true,
                            fileName: pFileName + Date(),
                            workbook : {columns: aCols}
                        });
                         oSpreadsheet.onprogress = function (iValue) {
                            jQuery.sap.log.debug("Export: " + iValue + "% completed");
                        };
                        oSpreadsheet.build().then(function () { 
                            jQuery.sap.log.debug("Export is finished"); }).catch(function (sMessage) { jQuery.sap.log.error("Export error: " + sMessage); });                        
                    },
                    error: function(err){
                        sap.ui.core.BusyIndicator.hide();
                        this.InputMessage('Processing stopped!  An error was raised and the error stack is: \n ' + err.stack,'Error','Message','Error',false);
                        this.createLogTableEntry(pErrorLoggingApplication,err.stack,pErrorLoggingURL);
                    }
                });
            }
	});	
});
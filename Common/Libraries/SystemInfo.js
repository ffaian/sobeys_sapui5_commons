sap.ui.define(["sap/ui/base/Object"], function(Object) {
	"use strict";
	return Object.extend("sobeys.libraries.SystemInfo", {

		getSystemInfoJSONModel: function() {
			// your code here
			var oSystemInfo = new sap.ui.model.json.JSONModel();
			oSystemInfo.loadData(
				"/sap/hana/ide/common/plugin/init/server/serviceAPI.xsjs?action=getSystemInfo", "GET", false);
			return oSystemInfo;
		},

		Systemlogout: function() {
			$.ajax({
				url: "/sap/hana/xs/formLogin/token.xsjs",
				type: "GET",
				beforeSend: function(request) {
					request.setRequestHeader("X-CSRF-Token", "Fetch");
				},
				success: function(data, textStatus, XMLHttpRequest) {
					var token = XMLHttpRequest.getResponseHeader("X-CSRF-Token");
					$.ajax({
						url: "/sap/hana/xs/formLogin/logout.xscfunc",
						type: "POST",
						beforeSend: function(request) {
							request.setRequestHeader("X-CSRF-Token", token);
						},
						success: function(data, textStatus, XMLHttpRequest) {
				// 			var mLayout = sap.ui.getCore().byId("mainPage");
							// 		 var mLayout = sap.ui.getCore().byId("__xmlview1--mainPage");
							var mLayout = sap.ui.getCore().byId("__xmlview1--mainPage") !== undefined ? sap.ui.getCore().byId("__xmlview1--mainPage") : sap.ui
								.getCore().byId("mainPage");
							//mLayout is the id of main layout. Change it accordingly
							if (mLayout !== undefined) { mLayout.destroy(); }
							sap.ui.getCore().applyChanges();
							jQuery(document.body).html("<span>Logged out successfully.</span>");
							window.location.reload();
						}
					});
				}
			});
		},

		CheckConnection: function() {
			$.ajax({
				url: "/sap/hana/xs/formLogin/token.xsjs",
				type: "GET",
				beforeSend: function(request) {
					request.setRequestHeader("X-CSRF-Token", "Fetch");
				},
				success: function(data, textStatus, XMLHttpRequest) {
					var token = XMLHttpRequest.getResponseHeader("X-CSRF-Token");
					if (token && token.length != 32) {
						var mLayout = sap.ui.getCore().byId("mainPage");
						//mLayout is the id of main layout. Change it accordingly
						mLayout.destroy();
						sap.ui.getCore().applyChanges();
						jQuery(document.body).html("<span>Timeout reached. Please sign in.</span>");
						window.location.reload();
					}
				}
			});
		},

		hideBusyIndicator: function() {
			sap.ui.core.BusyIndicator.hide();
		},

		showBusyIndicator: function(iDuration, iDelay) {
			sap.ui.core.BusyIndicator.show(iDelay);

			if (iDuration && iDuration > 0) {
				if (this._sTimeoutId) {
					jQuery.sap.clearDelayedCall(this._sTimeoutId);
					this._sTimeoutId = null;
				}

				this._sTimeoutId = jQuery.sap.delayedCall(iDuration, this, function() {
					this.hideBusyIndicator();
				});
			}
		}
	});
});
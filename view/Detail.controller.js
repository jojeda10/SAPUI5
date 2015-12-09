sap.ui.core.mvc.Controller.extend("catalog.view.Detail", {

		onInit: function() {

			this.oInitialLoadFinishedDeferred = jQuery.Deferred();

			if (sap.ui.Device.system.phone) {
				//Do not wait for the master when in mobile phone resolution
				this.oInitialLoadFinishedDeferred.resolve();
			} else {
				//	this.getView().setBusy(true);
				var oEventBus = this.getEventBus();
				oEventBus.subscribe("Component", "MetadataFailed", this.onMetadataFailed, this);
				oEventBus.subscribe("Master", "InitialLoadFinished", this.onMasterLoaded, this);
			}

			this.getRouter().attachRouteMatched(this.onRouteMatched, this);
			this.getRouter().attachRoutePatternMatched(this.onRoutePatternMatched, this);

			// alert(sap.ui.getCore().getConfiguration().getLanguage());
			// var aTest = sap.ui.getCore().getFieldGroupIds();
			//      alert(aTest);
			//	this.bindLandingPage();
		},

		onMasterLoaded: function(sChannel, sEvent) {
			this.getView().setBusy(false);
			this.oInitialLoadFinishedDeferred.resolve();
		},

		onMetadataFailed: function() {
			this.getView().setBusy(false);
			this.oInitialLoadFinishedDeferred.resolve();
			this.showEmptyView();
		},

		onRoutePatternMatched: function(oEvent) {
			this.manageFloorplans();
	  		this.attachHandlers("UISettings/Heabut", "heabut");
			this.attachHandlers("UISettings/Lowbut", "lowbut");
		},		
				onRouteMatched: function(oEvent) {

					var oParameters = oEvent.getParameters();
					var oView = this.getView();

					// When navigating in the Detail page, update the binding context 
					// if (oParameters.name !== "detail") {
					// 	return;
					// }

					//Store object context in a global variable     

					var sEntityPath = "/" + oParameters.arguments.entity;
					this.bindView(sEntityPath);
					//Perform initialization
					this.oObject = this.getView().getBindingContext().getObject();
					this.performInitialization();
					
				},

				performInitialization: function(oEvent) {
					//First tab selected by default. Run its handler first.
					this[this.oObject.UISettings.Tab1Hand]();  
					//Initialize tab
					var oTabBar = this.getView().byId("idIconTabBar");
					if (oTabBar.getSelectedKey() == "tab2" || oTabBar.getExpanded() == "false") {
						oTabBar.setSelectedKey("tab1");
						oTabBar.setExpanded(true);
					}
					
					//Initialize selectors
					// this.clearText(this.getView().byId("amtinv"));
					// this.clearText(this.getView().byId("valinv"));
					// this.clearText(this.getView().byId("cosinv"));		
					// this.clearValue(this.getView().byId("idInput"));
					// this.clearValue(this.getView().byId("idSlider"));
				},

				//Load tab
				loadTab: function(oEvent) {

				},

				//Pick fragment from repository, load it and pass it back
				loadFragment: function(oFragmentName, oFragmentID) {
					return sap.ui.xmlfragment(oFragmentName, "fragments." + oFragmentID + "", this.getView().getController());
				},

				manageFloorplans: function(oObject) {
					//Do Iter model 4 times
					var iter;
					for (iter = 1; iter < 5; iter++) {
						if (this.getView().getBindingContext().getObject("UISettings/Tab" + iter) === true) {
							this.getView().byId("iconTabFilter" + iter).addContent(this.loadFragment(this.createFragmentName("Tab" + iter,
									this.getView().getBindingContext().getObject("UISettings/Tab" + iter + "Fcat")),
								this.getView().getBindingContext().getObject("UISettings/Tab" + iter + "Fcat")));
						}
					}
				},
				//
				attachHandlers: function(path, mControl) {
					var iter;
					for (iter = 1; iter < 5; iter++) {
						if (this.getView().getBindingContext().getObject(path + iter) === true) {
							// alert(this.getView().getBindingContext().getObject(path + iter + "Hand"));
							// alert(mControl + iter);
					    	this.getView().byId(mControl + iter).attachPress(this[this.getView().getBindingContext().getObject(path + iter + "Hand")]);  
						}
					}
				},

				clearText: function(oObject) {
					oObject.setText("");
				},

				clearValue: function(oObject) {
					oObject.setValue("0");
				},

				createFragmentName: function(oTab, oCatalogID) {
					return oTab + oCatalogID;
				},
				handleTabSelect: function(oEvent) {
					this[this.getView().getBindingContext().getObject("UISettings/Tab" + oEvent.getParameter("key").substring(3, 4) + "Hand")]();
				},

				// setSliderStep: function() {
				// 	//Calculate step value -> max - min
				// 	var oStepValue = 25;
				// 	this.getView().byId("idSlider").setStep(parseFloat(oStepValue));
				// },

				bindView: function(sEntityPath) {
					var oView = this.getView();
					oView.bindElement(sEntityPath);

					//Check if the data is already on the client
					if (!oView.getModel().getData(sEntityPath)) {

						// Check that the entity specified was found.
						oView.getElementBinding().attachEventOnce("dataReceived", jQuery.proxy(function() {
							var oData = oView.getModel().getData(sEntityPath);
							if (!oData) {
								this.showEmptyView();
								this.fireDetailNotFound();
							} else {
								this.fireDetailChanged(sEntityPath);
							}
						}, this));

					} else {
						this.fireDetailChanged(sEntityPath);
					}

				},

				showEmptyView: function() {
					this.getRouter().myNavToWithoutHash({
						currentView: this.getView(),
						targetViewName: "catalog.view.NotFound",
						targetViewType: "XML"
					});
				},

				fireDetailChanged: function(sEntityPath) {
					this.getEventBus().publish("Detail", "Changed", {
						sEntityPath: sEntityPath
					});
				},

				fireDetailNotFound: function() {
					this.getEventBus().publish("Detail", "NotFound");
				},

				onNavBack: function() {
					// This is only relevant when running on phone devices
					this.getRouter().myNavBack("main");
				},

				onDetailSelect: function(oEvent) {
					sap.ui.core.UIComponent.getRouterFor(this).navTo("detail", {
						entity: oEvent.getSource().getBindingContext().getPath().slice(1),
						tab: oEvent.getParameter("selectedKey")
					}, true);
				},

				onInputChange: function(oEvent) {
					if (oEvent.getParameters().value < this.oObject.Fcat.UnitMin) {
						var message = this.getView().getModel("i18n").getResourceBundle().getText("unitMin", [this.oObject.Fcat.UnitMin]);
						sap.ui.getCore().byId(oEvent.getSource().getId().substring(0, 10) + "idInput").setValue(this.oObject.Fcat.UnitMin);
						sap.m.MessageToast.show(message, {
							duration: 4000
						});
					} else if (oEvent.getParameters().value > this.oObject.Fcat.UnitMax) {
						var message = this.getView().getModel("i18n").getResourceBundle().getText("unitMax", [this.oObject.Fcat.UnitMax]);
						sap.ui.getCore().byId(oEvent.getSource().getId().substring(0, 10) + "idInput").setValue(this.oObject.Fcat.UnitMax);
						sap.m.MessageToast.show(message, {
							duration: 4000
						});
					} else {
						sap.ui.getCore().byId(oEvent.getSource().getId().substring(0, 10) + "idSlider").setValue(parseFloat(oEvent.getParameters().value));
					}
				},

				onSliderChange: function(oEvent) {
					if (oEvent.getSource().getId()) {
						//Calculate step value -> max - min
						sap.ui.getCore().byId(oEvent.getSource().getId().substring(0, 10) + "idSlider").setStep(parseFloat(this.getStepValue()));
						sap.ui.getCore().byId(oEvent.getSource().getId().substring(0, 10) + "idInput").setValue(oEvent.getParameters().value);
						sap.ui.getCore().byId(oEvent.getSource().getId().substring(0, 10) + "amtinv").setText(oEvent.getParameters().value);
						this.calculateValueFLECS(oEvent.getSource().getId().substring(0, 10));
					}
				},

				calculateValueFLECS: function(oId) {
					sap.ui.getCore().byId(oId + "valorization").setText(catalog.util.Utilities.calculateValue(sap.ui.getCore().byId(oId + "amtinv").getText(),
						sap.ui.getCore().byId(oId + "valinv").getText(),
						sap.ui.getCore().byId(oId + "cosinv").getText()));
					sap.ui.getCore().byId(oId + "options").setText(catalog.util.Utilities.calculateOptions(sap.ui.getCore().byId(oId + "valorization").getText()));
				},

				getStepValue: function(oEvent) {
					//Max - Min / 10
					return ((this.oObject.Fcat.UnitMax - this.oObject.Fcat.UnitMin) / 10);
				},

				openActionSheet: function() {

					if (!this._oActionSheet) {
						this._oActionSheet = new sap.m.ActionSheet({
							buttons: new sap.ushell.ui.footerbar.AddBookmarkButton()
						});
						this._oActionSheet.setShowCancelButton(true);
						this._oActionSheet.setPlacement(sap.m.PlacementType.Top);
					}

					this._oActionSheet.openBy(this.getView().byId("actionButton"));
				},

				getEventBus: function() {
					return sap.ui.getCore().getEventBus();
				},

				getRouter: function() {
					return sap.ui.core.UIComponent.getRouterFor(this);
				},


				handleTabs: function(iter) {
					var method;
					switch (iter) {
						case 1:
							// method = ""
							// this.onTest();
							var a = 'onTest';
								this[a]();
							//method = this.getView().getController().onTest;
							break;
						case 2:
							method = this.getView().getController().onGoMyBenefits;
							break;
						case 3:
							method = this.getView().getController().onGoMyBenefits;
							break;
						case 4:
							method = this.getView().getController().onGoMyBenefits;
							break;
						default:
					}
					return method;
				},
				
				onSelectInformation: function(oEvent) {
			     this.getView().byId("lowbut1").setVisible(false);
				},
				
				onSelectEnrollment: function(oEvent) {
			     this.getView().byId("lowbut1").setVisible(true);
				},
				
				onGoMyBenefits: function(oEvent) {
					alert("bonituda");
				},

				onAddBenefit: function(oEvent) {
					alert("test");
				},

				onExit: function(oEvent) {
					var oEventBus = this.getEventBus();
					oEventBus.unsubscribe("Master", "InitialLoadFinished", this.onMasterLoaded, this);
					oEventBus.unsubscribe("Component", "MetadataFailed", this.onMetadataFailed, this);
					if (this._oActionSheet) {
						this._oActionSheet.destroy();
						this._oActionSheet = null;
					}
				}
			});
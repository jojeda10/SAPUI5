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
		this.setSliderStep();
		// var aTest = sap.ui.getCore().getFieldGroupIds();
		//      alert(aTest);
		//	this.bindLandingPage();
	},

	onMasterLoaded: function(sChannel, sEvent) {
		this.getView().setBusy(false);
		this.oInitialLoadFinishedDeferred.resolve();
		//if FLECS -> Calculate val

	},

	onMetadataFailed: function() {
		this.getView().setBusy(false);
		this.oInitialLoadFinishedDeferred.resolve();
		this.showEmptyView();
	},

	onRouteMatched: function(oEvent) {

		var oParameters = oEvent.getParameters();

		// jQuery.when(this.oInitialLoadFinishedDeferred).then(jQuery.proxy(function() {

		var oView = this.getView();

		// When navigating in the Detail page, update the binding context 
		// if (oParameters.name !== "detail") {
		// 	return;
		// }

		//Store object context in a global variable     

		var sEntityPath = "/" + oParameters.arguments.entity;
		this.bindView(sEntityPath);
		//alert(sEntityPath);
		//Perform initialization
		this.performInitialization();
		this.oObject = this.getView().getBindingContext().getObject();

		//   alert(value);
		// var value = oModel.getData().LandingPage[1].Title;

		// var oIconTabBar = oView.byId("idIconTabBar");
		// oIconTabBar.getItems().forEach(function(oItem) {
		// 	if (oItem.getKey() !== "selfInfo") {
		// 		oItem.bindElement(oItem.getKey());
		// 	}
		//  });

		// // Specify the tab being focused
		// var sTabKey = oParameters.arguments.tab;
		// this.getEventBus().publish("Detail", "TabChanged", {
		// 	sTabKey: sTabKey
		// });

		// if (oIconTabBar.getSelectedKey() !== sTabKey) {
		// 	oIconTabBar.setSelectedKey(sTabKey);
		// }
		// }, this));

	},

	performInitialization: function(oEvent) {
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

		var oTab = oEvent.getParameter("key");

		if (oTab == "tab1") {
			if (this.oObject.UISettings.Tab1) {
				// 
				var oFragment = this.loadFragment(this.createFragmentName(oTab, this.oObject.UISettings.Tab1Fcat), this.oObject.UISettings.Tab1Fcat);
				alert(oFragment);
			}
		} else if (oTab == "tab2") {
			if (this.oObject.UISettings.Tab2) {
				// 
			}
		} else if (oTab == "tab3") {
			if (this.oObject.UISettings.Tab3) {
				// 
			}
		} else {
			if (this.oObject.UISettings.Tab4) {
				// 
			}
		}

		// if (oTab == "tab2") {
		// 	this.getView().byId("addButton").setVisible(true);
		// 	this.calculateValueFLECS();
		// } else {
		// 	this.getView().byId("addButton").setVisible(false);
		// }
	},

	setSliderStep: function() {
		//Calculate step value -> max - min
		var oStepValue = 25;
		this.getView().byId("idSlider").setStep(parseFloat(oStepValue));
	},

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
		this.getView().byId("idSlider").setValue(parseFloat(oEvent.getParameters().value));
	},

	onSliderChange: function(oEvent) {
		this.getView().byId("idInput").setValue(oEvent.getParameters().value);
		this.getView().byId("amtinv").setText(oEvent.getParameters().value);
		this.calculateValueFLECS();
	},

	calculateValueFLECS: function(oEvent) {
		// alert(this.getView().byId("idInput").getValue());
		// alert(this.getView().byId("amtinv").getText());
		this.getView().byId("valorization").setText(catalog.util.Utilities.calculateValue(this.getView().byId("amtinv").getText(), this.getView()
			.byId("valinv").getText(),
			this.getView().byId("cosinv").getText()));
		//	alert(this.getView().byId("valorization").getText());
		this.getView().byId("options").setText(catalog.util.Utilities.calculateOptions(this.getView().byId("valorization").getText()));
	},

	onAddBenefit: function(oEvent) {

		var oEntry = {};
		oEntry.YourID = "0001";
		oEntry.Name = "Peter";

		var oView = this.getView();
		var oModel = oView.getModel();

		oModel.update('/Benefits', oEntry, null);

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
sap.ui.core.mvc.Controller.extend("catalog.view.Empty", {

	onInit: function() {
		this.oInitialLoadFinishedDeferred = jQuery.Deferred();

		//Load picture
		var oRootPath = jQuery.sap.getModulePath("image");
		this.getView().byId("idpicpart").setSrc(oRootPath + "/EmptyPic.PNG");
		if (sap.ui.Device.system.phone) {
			//Do not wait for the master when in mobile phone resolution
			this.oInitialLoadFinishedDeferred.resolve();
		} else {
			this.getView().setBusy(true);
			var oEventBus = this.getEventBus();
			oEventBus.subscribe("Component", "MetadataFailed", this.onMetadataFailed, this);
			oEventBus.subscribe("Master", "InitialLoadFinished", this.onMasterLoaded, this);
		}

		this.getRouter().attachRouteMatched(this.onRouteMatched, this);

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

	onRouteMatched: function(oEvent) {

		var oParameters = oEvent.getParameters();

		// jQuery.when(this.oInitialLoadFinishedDeferred).then(jQuery.proxy(function() {
			var oView = this.getView();

			// When navigating in the Empty page, update the binding context 
			// if (oParameters.name !== "Empty") {
			// 	return;
			// }

			var sEntityPath = "/" + oParameters.arguments.entity;
			this.bindView(sEntityPath);
			// var oIconTabBar = oView.byId("idIconTabBar");
			// oIconTabBar.getItems().forEach(function(oItem) {
			// 	if (oItem.getKey() !== "selfInfo") {
			// 		oItem.bindElement(oItem.getKey());
			// 	}
			// }
			// );

			// Specify the tab being focused
		// 	var sTabKey = oParameters.arguments.tab;
		// 	this.getEventBus().publish("Empty", "TabChanged", {
		// 		sTabKey: sTabKey
		// 	});

		// 	if (oIconTabBar.getSelectedKey() !== sTabKey) {
		// 		oIconTabBar.setSelectedKey(sTabKey);
		// 	}
		// }, this));
		
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
					this.fireEmptyNotFound();
				} else {
					this.fireEmptyChanged(sEntityPath);
				}
			}, this));

		} else {
			this.fireEmptyChanged(sEntityPath);
		}

	},

	showEmptyView: function() {
		this.getRouter().myNavToWithoutHash({
			currentView: this.getView(),
			targetViewName: "catalog.view.NotFound",
			targetViewType: "XML"
		});
	},

	fireEmptyChanged: function(sEntityPath) {
		this.getEventBus().publish("Empty", "Changed", {
			sEntityPath: sEntityPath
		});
	},

	fireEmptyNotFound: function() {
		this.getEventBus().publish("Empty", "NotFound");
	},

	onNavBack: function() {
		// This is only relevant when running on phone devices
		this.getRouter().myNavBack("main");
	},

	onEmptySelect: function(oEvent) {
		sap.ui.core.UIComponent.getRouterFor(this).navTo("Empty", {
			entity: oEvent.getSource().getBindingContext().getPath().slice(1),
			tab: oEvent.getParameter("selectedKey")
		}, true);
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
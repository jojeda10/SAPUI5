jQuery.sap.declare("catalog.Component");
jQuery.sap.require("catalog.MyRouter");

sap.ui.core.UIComponent.extend("catalog.Component", {
  metadata: {
    name: "catalog",
    version: "1.0",
    includes: ["Style/myCSS.css"],
    dependencies: {
      libs: ["sap.m", "sap.ui.layout"],
      components: []
    },

    rootView: "catalog.view.App",

    "config": {
      resourceBundle: "i18n/messageBundle.properties",
      serviceConfig: {
        name: "NorthwindModel",
        serviceUrl: "/sap/opu/odata/sap/ZHR_BENEFITS_SRV/"
      }
    },

    routing: {
      config: {
        routerClass: catalog.MyRouter,
        viewType: "XML",
        viewPath: "catalog.view",
        targetAggregation: "detailPages",
        clearTarget: false
      },
      routes: [{
        pattern: "",
        name: "main",
        view: "Master",
        targetAggregation: "masterPages",
        targetControl: "idAppControl",
        subroutes: [{
          pattern: "{entity}/:tab:",
          name: "detail",
          view: "Detail"
        },
        {
            pattern: "{entity}/:tab:",
            name: "empty",
            view: "Empty"
          }
        ]
      }, {
        name: "catchallMaster",
        view: "Master",
        targetAggregation: "masterPages",
        targetControl: "idAppControl",
        subroutes: [{
          pattern: ":all*:",
          name: "catchallDetail",
          view: "NotFound",
          transition: "show"
        }]
      }]
    }
  },

  init: function() {
    sap.ui.localResources("util");
    sap.ui.localResources("fragments");
    sap.ui.localResources("image");
    jQuery.sap.require("catalog.util.Formatter");
    jQuery.sap.require("catalog.util.Utilities");
    jQuery.sap.require("jquery.sap.resources");
    sap.ui.core.UIComponent.prototype.init.apply(this, arguments);

    var mConfig = this.getMetadata().getConfig();

    // Always use absolute paths relative to our own component
    // (relative paths will fail if running in the Fiori Launchpad)
    var oRootPath = jQuery.sap.getModulePath("catalog");
					jQuery.sap.registerModulePath('fragments', [oRootPath, "fragments" ].join("/"));
					jQuery.sap.registerModulePath('image', [oRootPath, "image" ].join("/"));
					jQuery.sap.registerModulePath('view', [oRootPath, "view" ].join("/"));

    // Set i18n model
    var i18nModel = new sap.ui.model.resource.ResourceModel({
      bundleUrl: [oRootPath, mConfig.resourceBundle].join("/")
    });
    this.setModel(i18nModel, "i18n");

    var sServiceUrl = mConfig.serviceConfig.serviceUrl;

   // code is only needed for testing the application when there is no local proxy available
    // var bIsMocked = jQuery.sap.getUriParameters().get("responderOn") ==="true"; //"true";

  //tart the mock server for the domain model
    // if (bIsMocked) {

  //    this._startMockServer(sServiceUrl);
    // }

    // Create and set domain model to the component
    var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, {
      json: true,
      loadMetadataAsync: true
    });
    oModel.attachMetadataFailed(function() {
      this.getEventBus().publish("Component", "MetadataFailed");
    }, this);
    this.setModel(oModel);

    // Set device model
    var oDeviceModel = new sap.ui.model.json.JSONModel({
      isTouch: sap.ui.Device.support.touch,
      isNoTouch: !sap.ui.Device.support.touch,
      isPhone: sap.ui.Device.system.phone,
      isNoPhone: !sap.ui.Device.system.phone,
      listMode: sap.ui.Device.system.phone ? "None" : "SingleSelectMaster",
      listItemType: sap.ui.Device.system.phone ? "Active" : "Inactive"
    });
    oDeviceModel.setDefaultBindingMode("OneWay");
    this.setModel(oDeviceModel, "device");

    this.getRouter().initialize();
  },

  _startMockServer: function(sServiceUrl) {

    jQuery.sap.require("sap.ui.core.util.MockServer");
    
    var oMockServer = new sap.ui.core.util.MockServer({
      rootUri: sServiceUrl
    });

    var iDelay = +(jQuery.sap.getUriParameters().get("responderDelay") || 0);
    sap.ui.core.util.MockServer.config({
      autoRespondAfter: iDelay
    });

    oMockServer.simulate("model/metadata.xml", "model/");
    oMockServer.start();

    sap.m.MessageToast.show("Running in demo mode with mock data.", {
      duration: 4000
    });
  },

  getEventBus: function() {
    return sap.ui.getCore().getEventBus();
  }
});
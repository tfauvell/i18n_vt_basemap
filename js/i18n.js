/**************************************************************
 * ArcGIS JSAPI - Vector Tile Layer Sample: 
 * https://developers.arcgis.com/javascript/latest/sample-code/layers-vectortilelayer-style/
 * 
 **************************************************************/
require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/VectorTileLayer",
    "esri/geometry/Point",
    "dojo/store/Memory",
    "dojo/data/ObjectStore",
    "dijit/form/Select",
    "dojo/window",
    "dojo/dom-class"
  ], function (Map, MapView, VectorTileLayer, Point, Memory, ObjectStore, FilteringSelect, win, domClass) {
    
    var checkViewPort = function(){
      var vs = win.getBox();
      if (vs.w < 600 || vs.h < 630 || (vs.h < 750 && vs.w < 1000)){
        domClass.add(document.body,"mobile");
      } else {
        domClass.remove(document.body,"mobile");
      }
    };
    window.onresize = checkViewPort;
    checkViewPort();
    
    // Language Dropdown List
    var languageStore = new Memory({data: [
      {name:"English",id:"{NAME_ENGLISH}"},
      {name:"Arabic",id:"{NAME_ARABIC}"},
      {name:"Chinese",id:"{NAME_CHINESE}"},
      {name:"French",id:"{NAME_FRENCH}"},
      {name:"Spanish",id:"{NAME_SPANISH}"},
      {name:"Russian",id:"{NAME_RUSSIAN}"}
    ]});

    // Country Dropdown List
    var countryStore = new Memory({data: [
      {name:"None",id:"None"},
      {name:"Australia",id:"Australia"},
      {name:"China",id:"China"},
      {name:"Egypt",id:"Egypt"},
      {name:"France",id:"France"},
      {name:"Japan",id:"Japan"},
      {name:"Russia",id:"Russia"},
      {name:"Spain",id:"Spain"},
      {name:"UK",id:"United Kingdom"},
      {name:"US",id:"United States"}
    ]});

    // Create a Map
    const map = new Map();

    // Make map view and bind it to the map
    const view = new MapView({
      container: "viewDiv",
      map: map,
      zoom: 3.5,
      // center: [-10, 45] //not working with Equal Earth
      center: new Point({ x: 3738240.522688661, y: 3947081.157551732, spatialReference: 8857 }), // Needed to use the CRS of the basemap and appropriate xy units
      constraints: {
        snapToZoom: false,        // continuous zoom
        rotationEnabled: false    // prevent rotation, especially helpful on mobile when pinch-zooming
      }
    });

    // County Boundaries
    const layer = new VectorTileLayer({
      url: "https://tfdev.maps.arcgis.com/sharing/rest/content/items/24cb345c4ccc4dbf8c84f9db3e520b37/resources/styles/root.json"
    });
    map.add(layer);
    // view.ui.add("topbar", "top-left");

    window.layer = layer;
    window.map = map;
    window.view = view;

    // view.watch('scale', (x) => console.log(x));
    // view.watch('extent', (bbox) => console.log(bbox));

    // Get the screen point from the view's click event
    view.on("click", (event) => {
      // Search for graphics at the clicked location. View events can be used
      // as screen locations as they expose an x,y coordinate that conforms
      // to the ScreenPoint definition.
      view.hitTest(event).then((response) => {
        if (response.results.length) {
          // do something with the result graphic
          console.log(layer.getStyleLayer(response.results[0].graphic.attributes.layerName),
            response.results[0].graphic.attributes
          );
        }
      });
    });

    // Language Selector
    var languageSelector = new FilteringSelect({
      store: new ObjectStore({objectStore: languageStore}),
      labelAttr: "name",
      value: "English"
    },"languageSelector");

    languageSelector.startup();
    
    languageSelector.on("change",function(value){
      setLanguage(layer,value);
    });

    // Country Mask Selector
    var countrySelector = new FilteringSelect({
      store: new ObjectStore({objectStore: countryStore}),
      labelAttr: "name",
      value: "No Mask"
    },"countrySelector");

    countrySelector.startup();

    countrySelector.on("change",function(value){
      setMask(value);
    });

    // Go To Country

    // Set Mask
    let maskLayer = "GADM Admin0/1"
    var setMask = function(country) {
      const styleLayer = layer.getStyleLayer(maskLayer);
      if (country === "None") {
        if (styleLayer.filter) {
          delete styleLayer.filter; // remove the filter object
        } 
        layer.setStyleLayer(styleLayer); // commit style changes
        layer.setStyleLayerVisibility(maskLayer, "none");
      } else {
        styleLayer.filter = ["!=", "NAME_ENGLISH", country];
        styleLayer.paint["fill-color"] = "rgba(143,143,143,0.25)";
        layer.setStyleLayer(styleLayer); // commit style changes
        layer.setStyleLayerVisibility(maskLayer, "visible");
      }
    };
    
    // Set Language
    let admin0LayerNames = [
      "GADM Admin0/0", // fill
      "GADM Admin0/2"  // stroke
    ];
    
    let admin0LabelNames = [
      "GADM Admin0/label/Default" // label layer
    ];

    var setLanguage = function(layer,language) {
      admin0LabelNames.forEach((labelName) => {
        const styleLayer = layer.getStyleLayer(labelName);
        styleLayer.layout["text-field"] = language;
        styleLayer.layout["text-size"] = 16;
        styleLayer.layout["text-letter-spacing"] = 0;
        styleLayer.layout["text-transform"] = "none";
        styleLayer.paint["text-color"] = "#4E4E4E";
        styleLayer.paint["text-halo-color"] = "#FFFFFF";
        styleLayer.paint["text-halo-width"] = 1.5;
        styleLayer.paint["text-halo-blur"] = 0.5;
        if (language === "{NAME_ARABIC}") {
          // styleLayer.layout["text-font"] = ["Lemonada Regular"];
          // styleLayer.layout["text-font"] = ["Katibeh Regular"];
          styleLayer.layout["text-font"] = ["Harmattan Regular"];
          styleLayer.layout["text-size"] = 20;
          styleLayer.layout["text-letter-spacing"] = 0;
        } else if (language === "{NAME_CHINESE}") {
          // styleLayer.layout["text-font"] = ["Long Cang Regular"];
          // tyleLayer.layout["text-font"] = ["Noto Serif SC Regular"];
          styleLayer.layout["text-font"] = ["Noto Sans SC Regular"];
          styleLayer.layout["text-size"] = 16;
          styleLayer.layout["text-letter-spacing"] = 0.1;
        } else if (language === "{NAME_RUSSIAN}") {
          // styleLayer.layout["text-font"] = ["Oswald Regular"];
          styleLayer.layout["text-font"] = ["Source Sans Pro SemiBold Regular"];
          styleLayer.layout["text-letter-spacing"] = 0;
          styleLayer.layout["text-transform"] = "none";
        } else {
          styleLayer.layout["text-font"] = ["Source Sans Pro SemiBold Regular"];
        }
        layer.setStyleLayer(styleLayer); // commit style changes
      });
    };
});
// Select Next Layer (invisible or not).jsx
// https://gist.github.com/joonaspaakko/048c9b58ccbb6e6f44c894bf4ce30b68

nextLayer('down');

// direction (↑): "up" or "above"
// direction (↓): "down" or "below"
function nextLayer( direction ) {
  
  var doc = app.activeDocument;
   // Doc duplication is necessary because while the History panel can record visibility change, but for some reason it doesn't do that when the visibility command comes from a script... (AFAIK)
  var tempDoc = doc.duplicate();
  var layer1 = tempDoc.activeLayer;
  
  // Turn background layer into a normal layer
  var lastLayer = tempDoc.layers[ tempDoc.layers.length-1 ];
  function cTID(s) { return app.charIDToTypeID(s); };
  function sTID(s) { return app.stringIDToTypeID(s); };
  var layer1ID = activeLayerID();
  tempDoc.activeLayer = lastLayer;
  var bgLayerExists = lastLayer.isBackgroundLayer;
  if ( bgLayerExists ) { lastLayer.isBackgroundLayer = false; }
  try { selectLayerByID( layer1ID ); } catch(e) {}
  // Select all layers
  var desc23 = new ActionDescriptor();
  var ref5 = new ActionReference();
  ref5.putEnumerated( cTID('Lyr '), cTID('Ordn'), cTID('Trgt') );
  desc23.putReference( cTID('null'), ref5 );
  executeAction( sTID('selectAllLayers'), desc23, DialogModes.NO );
  // Make active layers visible
  var desc209 = new ActionDescriptor();
  var list93 = new ActionList();
  var ref129 = new ActionReference();
  ref129.putEnumerated( cTID('Lyr '), cTID('Ordn'), cTID('Trgt') );
  list93.putReference( ref129 );
  desc209.putList( cTID('null'), list93 );
  executeAction( cTID('Shw '), desc209, DialogModes.NO );
  // Reselect the starting layer
  if ( bgLayerExists ) { lastLayer.isBackgroundLayer = true; }
  selectLayerByID( layer1ID );
  // Select next layer
  try { snl( direction ); } catch(e) {}
  // Store the layer
  var nextLayer = activeLayerID();
  tempDoc.close( SaveOptions.DONOTSAVECHANGES );
  // Try to select the next layer using its ID
  try {
    selectLayerByID( nextLayer );
  }
  // If it fails, well assume it did so because it was a background layer... and use another method for selecting that.
  catch(e) {
    var desc299 = new ActionDescriptor();
        var ref187 = new ActionReference();
        ref187.putName( cTID('Lyr '), "Background" );
    desc299.putReference( cTID('null'), ref187 );
    desc299.putBoolean( cTID('MkVs'), false );
        var list138 = new ActionList();
        list138.putInteger( 1 );
    desc299.putList( cTID('LyrI'), list138 );
    executeAction( cTID('slct'), desc299, DialogModes.NO );
  }
  
  function snl( direction ) {
    
    var select;
    if ( direction == 'up' || direction == 'above' ) {
      select = cTID('Frwr');
    }
    else if ( direction == 'down' || direction == 'below' ) {
      select = cTID('Bckw');
    }
    
    var desc67 = new ActionDescriptor();
    var ref41 = new ActionReference();
    ref41.putEnumerated( cTID('Lyr '), cTID('Ordn'), select );
    desc67.putReference( cTID('null'), ref41 );
    desc67.putBoolean( cTID('MkVs'), false );
    var list17 = new ActionList();
    list17.putInteger( 5 );
    desc67.putList( cTID('LyrI'), list17 );
    executeAction( cTID('slct'), desc67, DialogModes.NO );
  }
  
  function activeLayerID() {
      var ref = new ActionReference();
      ref.putProperty( charIDToTypeID("Prpr") , charIDToTypeID( "LyrI" ));
      ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
  	return executeActionGet(ref).getInteger( stringIDToTypeID( "layerID" ) );
  }
  
  function selectLayerByID(id, add){
     add = (add == undefined) ? add = false : add;
     var ref = new ActionReference();
     ref.putIdentifier(cTID('Lyr '), id);
     var desc = new ActionDescriptor();
     desc.putReference(cTID('null'), ref);
     if(add){
        desc.putEnumerated(sTID('selectionModifier'), sTID('selectionModifierType'), sTID('addToSelection'));
     }
     desc.putBoolean(cTID('MkVs'), false);
     executeAction(cTID('slct'), desc, DialogModes.NO);
  }
  
}

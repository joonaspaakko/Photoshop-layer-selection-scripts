// Select Children.jsx
// v.1.0.

// • Selects child layers.
// • You can select children of multiple groups at the same time.
// • All non-group layers inside the active selection are discarded.

#target Photoshop

var doc = app.activeDocument;
var selectedLayers = getSelectedLayers();
var noActiveLayers = selectedLayers.id.length === 0;
selectedLayers = noActiveLayers ? false : selectedLayers.obj;
var ids = [];

if ( selectedLayers !== false ) {
  for ( var sl = 0; sl < selectedLayers.length; sl++ ) {
    
    var group = selectedLayers[ sl ];
    var children = group.layers;
    if ( children.length ) {
      
      for ( var i=0; i < children.length; i++ ) {
        var layer = children[i];
        var id = layer.id;
        ids.push( id );
      }
      
      buildSelectionWithIDs( ids );
      
    }
    
  }
}

// FUNCTION WASTELAND
// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

function buildSelectionWithIDs( ids ) {
  for ( var i = 0; i < ids.length; i++ ) {
    selectLayerByID( ids[i], (i===0) ? false : "add" );
  }
}

function selectLayerByID( id, action ) {
  function cTID(s) { return app.charIDToTypeID(s); };
  function sTID(s) { return app.stringIDToTypeID(s); };
  var ref = new ActionReference();
  ref.putIdentifier(cTID('Lyr '), id);
  var desc = new ActionDescriptor();
  desc.putReference(cTID('null'), ref);
  if ( action ) {
    desc.putEnumerated(
      sTID('selectionModifier'),
      sTID('selectionModifierType'),
      ( action === 'remove' ? sTID('removeFromSelection') : sTID('addToSelection') )
    );
  }
  desc.putBoolean(cTID('MkVs'), false);
  executeAction(cTID('slct'), desc, DialogModes.NO);
}

function getSelectedLayers() {
  function cTID(s) { return app.charIDToTypeID(s); };
  function sTID(s) { return app.stringIDToTypeID(s); };
  var ids = [];
  var objs = [];
  var ref = new ActionReference();
  ref.putEnumerated( cTID('Dcmn'), cTID('Ordn'), cTID('Trgt') );
  var desc = executeActionGet(ref);
  if ( desc.hasKey(sTID('targetLayers')) ) {
    desc = desc.getList( sTID( 'targetLayers' ));
    var c = desc.count;
    for ( var i=0; i<c; i++ ) {
      var n = 0;
      try { activeDocument.backgroundLayer; } catch(e) { n = 1; }
      var idx = desc.getReference( i ).getIndex()+n;
      toIdRef = new ActionReference();
      toIdRef.putProperty( cTID("Prpr") , cTID( "LyrI" ));
      toIdRef.putIndex( cTID( "Lyr " ), idx );
      var id = executeActionGet(toIdRef).getInteger( sTID( "layerID" ));
      selectLayerByID( id );
      if ( app.activeDocument.activeLayer.typename === "LayerSet" ) {
        ids.push( id );
        objs.push( app.activeDocument.activeLayer );
      }
    }
  }
  return {id:ids, obj:objs};
}

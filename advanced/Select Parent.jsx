// Select Parent.jsx
// v.1.0.

// • Selects parent layer(s)
// • Works with a selection with multiple layers.
// • The layers in the selection can also be in separate groups.

// This script may be a overkill for most things. The reason it's such a
// bulky thing is that I wanted to make it so you can select multiple parents.
// If you just want to select a single parent, you could use the code below ↓
// That said, this script works just fine even for selecting one parent.
/*

var doc = app.activeDocument;
if ( doc.activeLayer.parent !== doc ) doc.activeLayer = doc.activeLayer.parent;

*/

#target Photoshop

var selectedLayers = getSelectedLayers();
var parentIDs = [];

// Get parents
for ( var i = 0; i < selectedLayers.obj.length; i++ ) {
  
  var layer = selectedLayers.obj[ i ];
  var parentID = layer.parent.id;
  if ( parentID !== false ) {
    if ( !parentExists(parentIDs, parentID) ) parentIDs.push( parentID );
  }
  
}

buildSelectionWithIDs( parentIDs );

// FUNCTION WASTELAND
// ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

function parentExists( parents, parent ) {
  var inArray = false;
  for ( var i = 0; i < parents.length; i++ ) {
    if ( parents[i] == parent ) {
      inArray = true;
      break;
    }
  }
  return inArray;
}

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
      ids.push( id );
      selectLayerByID( id );
      objs.push( app.activeDocument.activeLayer );
    }
  }
  return {id:ids, obj:objs};
}

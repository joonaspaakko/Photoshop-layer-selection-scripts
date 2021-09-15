// Select Siblings.jsx
// v.1.0.

// • Selects sibling layers.
// • You can choose to include the active layers in the selection.
// • Supports a selection with multiple layers.
// • The layers in the selection can also be inside separate groups.

#target Photoshop

var doc = app.activeDocument;
var parent = app.activeDocument.activeLayer.parent;
var siblings = parent.layers;
var selectedLayers = getSelectedLayers();

if ( selectedLayers.id.length > 0 ) {
  
  var activeLayerPrompt = confirm("Decision time:\nInclude active layer(s) in the selection?");
  var parents = [];
  
  // Get parents
  for ( var sl = 0; sl < selectedLayers.obj.length; sl++ ) {
    
    var layer = selectedLayers.obj[ sl ];
    var parent = layer.parent;
    if ( !parentExists(parents, parent) ) parents.push( parent );
    
  }
  
  // Pay each parent a visit
  var ids = [];
  for ( var p = 0; p < parents.length; p++ ) {
    
    var parent = parents[ p ];
    var siblings = parent.layers;
    
    for ( var i=0; i < siblings.length; i++ ) {
      
      var layer = siblings[i];
      
      var push = true;
      var id = layer.id;
      
      if ( !activeLayerPrompt && selectedLayers.id.length !== siblings.length ) {
        if ( siblingInActiveLayers( id, selectedLayers.id ) ) {
          push = false;
        }
      }
      
      if ( push ) {
        ids.push( id );
      }
      
    }
  }
  
  buildSelectionWithIDs( ids );
}

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

function siblingInActiveLayers( layerID, selectionID ) {
  for ( var i=0; i < selectionID.length; i++ ) {
    var selID = selectionID[i];
    if ( layerID === selID ) {
      return true;
    }
  }
}

function buildSelectionWithIDs( ids ) {
  for ( var i = 0; i < ids.length; i++ ) {
    selectLayerWidthID( ids[i], (i===0) ? false : "add" );
  }
}

function getSelectedLayers() {
  var idxs = [];
  var ids = [];
  var objs = [];
  var ref = new ActionReference();
  ref.putEnumerated( charIDToTypeID('Dcmn'), charIDToTypeID('Ordn'), charIDToTypeID('Trgt') );
  var desc = executeActionGet(ref);
  if ( desc.hasKey(stringIDToTypeID('targetLayers')) ) {
    desc = desc.getList( stringIDToTypeID( 'targetLayers' ));
    var c = desc.count;
    for ( var i=0; i<c; i++ ) {
      var n = 0; try { activeDocument.backgroundLayer; } catch(e) { n = 1; }
      var idx = desc.getReference( i ).getIndex()+n;
      n = n == 0 ? 1 : 0;
      idxs.push( idx+n );
      toIdRef = new ActionReference();
      toIdRef.putIndex( charIDToTypeID("Lyr "), idx );
      var id = executeActionGet(toIdRef).getInteger( stringIDToTypeID( "layerID" ));
      ids.push( id );
      var ref2 = new ActionReference();
      ref2.putIdentifier(charIDToTypeID('Lyr '), id);
      var desc2 = new ActionDescriptor();
      desc2.putReference(charIDToTypeID('null'), ref2);
      desc2.putBoolean(charIDToTypeID('MkVs'), false);
      executeAction(charIDToTypeID('slct'), desc2, DialogModes.NO);
      objs.push( app.activeDocument.activeLayer );
    }
  }
  return {
    idx: idxs,
    id: ids,
    obj: objs
  };
}

function selectLayerWidthID( id, action ) {
  var ref = new ActionReference();
  var desc = new ActionDescriptor();
  ref.putIdentifier(charIDToTypeID('Lyr '), id);
  desc.putReference(charIDToTypeID('null'), ref);
  if ( action ) {
    desc.putEnumerated( stringIDToTypeID('selectionModifier'), stringIDToTypeID('selectionModifierType'),
      ( action === 'remove' ? stringIDToTypeID('removeFromSelection') : stringIDToTypeID('addToSelection') )
    );
  }
  desc.putBoolean(charIDToTypeID('MkVs'), false);
  executeAction(charIDToTypeID('slct'), desc, DialogModes.NO);
}

// Show Active & Hide Siblings.jsx
// v.1.0.

// • Makes selected layers visible and hides their sibling layers.
// • Works multiple selected layers.
// • The layers in the selection can also be inside separate groups.

// • GOOD TO KNOW: For some reason when the "Make layer visibility changes undoable"
//   option is checked in the history panel and layer visibility is changed
//   using a script, it doesn't record a history step. SuspendHistory
//   method is used so that you can undo what the script does.

// • NOTE: Parent layer is not made visible automatically and
//   same applies to clipping mask base layer. So if you got a
//   parent layer that is hidden, the active layer(s) will remain
//   visually hidden until you make the parent layer visible.

// • WARNING: Make sure you don't accidentally select
//   nested layers. Shift selecting across groups is a good
//   way to select nested layers without realizing it.

#target Photoshop

var doc = app.activeDocument;

doc.suspendHistory("Show Active & Hide Siblings (script)", "showActiveHideSiblings()");

function showActiveHideSiblings() {
  
  var selectedLayers = getSelectedLayers();
  var parents = [];
  
  // Get parents
  for ( var sl = 0; sl < selectedLayers.obj.length; sl++ ) {
    
    var layer = selectedLayers.obj[ sl ];
    var parent = layer.parent;
    if ( !parentExists(parents, parent) ) parents.push( parent );
    
  }
  
  // Pay each parent a visit
  for ( var p = 0; p < parents.length; p++ ) {
    
    var parent = parents[ p ];
    var siblings = parent.layers;
    
    // Say hello to my little siblings
    for ( var s=0; s < siblings.length; s++ ) {
      
      var layer = siblings[s];
      var id = layer.id;
      if ( siblingInActiveLayers(id, selectedLayers.id) ) {
        layer.visible = true;
      }
      else {
        layer.visible = false;
      }
      
    }
  }
  
  // Rebuilds the initial selection
  buildSelectionWithIDs( selectedLayers.id );
  
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
  var idxs = [];
  var ids = [];
  var objs = [];
  var ref = new ActionReference();
  ref.putEnumerated( cTID('Dcmn'), cTID('Ordn'), cTID('Trgt') );
  var desc = executeActionGet(ref);
  if ( desc.hasKey(sTID('targetLayers')) ) {
    desc = desc.getList( sTID( 'targetLayers' ));
    var c = desc.count;
    for ( var i=0; i<c; i++ ) {
      var n = 0; try { activeDocument.backgroundLayer; } catch(e) { n = 1; }
      var idx = desc.getReference( i ).getIndex()+n;
      n = n == 0 ? 1 : 0;
      idxs.push( idx+n );
      toIdRef = new ActionReference();
      toIdRef.putIndex( cTID("Lyr "), idx );
      var id = executeActionGet(toIdRef).getInteger( sTID( "layerID" ));
      ids.push( id );
      selectLayerByID( id );
      objs.push( app.activeDocument.activeLayer );
    }
  }
  return {
    idx: idxs,
    id: ids,
    obj: objs
  };
}

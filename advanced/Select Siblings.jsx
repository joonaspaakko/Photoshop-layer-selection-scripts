// Select Siblings.jsx
// v.1.1

// CHANGELOG:
// v.1.1 
//  - Fixed an issue with multi-group scopes where it ended selecting the wrong layers when choosing not to include the active layers.
//  - I also did some cleanup...
// v.1.0 
//  - First version

// • Selects sibling layers.
// • You can choose to include the active layers in the selection.
// • Supports a selection with multiple layers.
// • The layers in the selection can also be inside separate groups.

#target Photoshop

var doc = app.activeDocument;
var parent = app.activeDocument.activeLayer.parent;
var siblings = parent.layers;
var activeLayerPrompt = confirm("Include active layer(s) in the selection?");
var selectedLayers = getSelectedLayers();

if ( selectedLayers.id.length > 0 ) {
  
  var parents = [];
  
  // Get parents
  each( selectedLayers.obj, function( layer ) {
    var parent = layer.parent;
    if ( !parentExists(parents, parent) ) parents.push( parent );
  });
  
  // Pay each parent a visit
  var ids = [];
  each( parents, function( parent ) {
    
    var siblings = parent.layers; // Also includes the active layer...
    
    each( siblings, function( layer ) {
      
      var push = true;
      var id = layer.id;
      var dontSelectActiveLayer = !activeLayerPrompt;
      
      if ( dontSelectActiveLayer ) {
        var isActiveLayer = siblingInActiveLayers( id, selectedLayers.id );
        if ( isActiveLayer ) push = false;
      } 
      
      if ( push ) ids.push( id );
      
    });
    
  });
  
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

function each( array, reverse, callback ) {
  if ( typeof reverse === 'function' ) { callback = reverse; reverse = false; }
	var result;
  var isArray = array && typeof array === 'object' && array[0];
	if ( isArray && callback ) {

    if ( reverse ) array = array.slice().reverse();
		for ( var i=0; i < array.length; i++ ) {
			if ( callback( array[i], i  ) !== undefined ) break;
		}
    result = array;
    
	} else { result = 'invalid input' }
	return result;
}

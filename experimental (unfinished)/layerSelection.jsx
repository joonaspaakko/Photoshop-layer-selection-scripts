// Example where the script selects the next two layers above the active selection
// selectNextLayer('up');
// selectNextLayer('up', 'add');

// layerSelection({
//   dir: 'down',
//   action: 'remove',
//   loop: true
// });

/*
  
  _layerSelection.jsx (V.1.2.) — a.k.a. "select next layer.jsx"
  
  The script primarily gets around the issue with the native shortcuts,
  that won't select the next layer above or below if it's hidden.

  Main functionality:
  - Select layer → above or below the active layer(s)
  - Add layer to selection → above or below the active layer(s)
  - Remove layer from selection → top or bottom of the selection
  
  Pro tip: If you don't need to care about hidden layers, maybe consider
  recording the native actions the Scripting Listener plugin and using those.
  
  KNOWN ISSUES:
  =============
  
  - The loop option really only works reliably with the action "select" when the starting point is 1 selected layer. Issues start piling up when the top and bottom layer are selected.
    The script sees the active layers in a very linear way, unlike your human brain. Let's say you have the top and the bottom layer selected, and your selection direction is up.
    Well, the script will think the top layer is the top most layer, so it will select the last layer
  
  SETTINGS:
  =========
  
  {
    direction: 'up'           // String: 'up', 'down', 'above', 'below' || Default: 'down'
    // dir: 'down'            // Same as above... Alternative name for the setting
    action: 'remove'          // String: 'select', 'add', 'remove' || Default: 'select'
    keepLastOnRemove: false,  // Boolean || Default: true || Description: Last layer will never be removed from the selection if true
    loop: true                // Booldean || Default false || Description: When set to true, the selection doesn't stop at the first or last layer, but loops to the other end.
  }
  
  *********
  CHANGELOG
  *********

  v.1.2.
  - A complete rewrite
  - Methods:
      1. select
      2. add to selection
      3. remove from selection
  -

  v.1.0.
  - First version can still be found here: https://gist.github.com/joonaspaakko/048c9b58ccbb6e6f44c894bf4ce30b68/878c7240aa04bace0bfd24c51a37c507a2f1847b
  - Selects the next layer above or below
  - Doesn't care if the layer invisible
  - Much like the native methods, this jumps over collapsed groups
  - This script was made to get around the issue where the native methods jump over invisible layers and the way it does it is this:
    1. It duplicates the whole document
    2. Makes all layers visible
    3. Uses the native method to select the next layer above or below and makes a note of that layer
    4. Closes the temporary document
    5. Selects the next layer in the original document using its ID
    
*/
function layerSelection( settings ) {
  
  // app.activeDocument.suspendHistory("Select Next Layer.jsx", "init( settings )");
  init( settings );
  
  function init( settings ) {
    
    var direction  = settings.direction || settings.dir || 'down';
    var action     = settings.action || 'select';
    var keepLast   = settings.keepLastOnRemove != undefined ? settings.keepLastOnRemove : true;
    var loopDeLoop = settings.loop || false;
    
    var dirDown = direction === 'below' || direction === 'down';
    var selectedLayers = getSelectedLayers();
    if ( selectedLayers.idxs.length > 0 ) {
      var idx;
      var topLayerIdx = app.activeDocument.layers[ 0 ].itemIndex;
      var bottomLayerIdx = app.activeDocument.layers[ app.activeDocument.layers.length-1 ].itemIndex;
    
      if ( action === 'remove' ) {
        if ( selectedLayers.idxs.length > 1 ) {
          idx = dirDown ? selectedLayers.idxs[ selectedLayers.idxs.length-1 ] : selectedLayers.idxs[ 0 ];
          selectLayerByIdx( idx, action );
        }
        else if ( keepLast === false ) {
          // There seemed to be a quirk where it would fail to remove the last
          // layer from the selection if the selection started out bigger than
          // 1 layer or something... So rather than try that at all I decided to
          // just use deselect when there's just one layer left in the selection.
          deselectLayers();
        }
      }
      else {
        idx = dirDown ? selectedLayers.idxs[ 0 ] : selectedLayers.idxs[ selectedLayers.idxs.length-1 ];
        // Groups can cause big gaps between layer indexes. I put an example at the
        // bottom of this file. In this function, if selecting the next index fails,
        // then the script tries the next index until a layer is selected. Or it
        // there's an error selecting the next layer, it stops. This is what happens
        // at the first and the last layer.
        testTheWaters( idx, selectedLayers, dirDown, direction, action, keepLast );
        if ( action !== 'remove' ) groupExpansion( dirDown, direction, action, keepLast );
      }
    }
    
    function testTheWaters( idx, selectedLayers, dirDown, direction, action, keepLast, noChangeInLength ) {
      if ( selectedLayers.idxs.length > 0 ) {
        
        var previousIndex = idx;
        var i = dirDown ? idx-1 : idx+1;
        
        var docTopIndex = app.activeDocument.layers[ 0 ].itemIndex;
        var docBottomIndex = app.activeDocument.layers[ app.activeDocument.layers.length-1 ].itemIndex;
        var firstIndex = selectedLayers.idxs[ 0 ];
        var lastIndex = selectedLayers.idxs[ selectedLayers.idxs.length-1 ];
        var topAndBottomSelected = docBottomIndex === firstIndex && docTopIndex === lastIndex;
        
        if ( loopDeLoop && !topAndBottomSelected ) {
          var currentIndex = dirDown ? firstIndex : lastIndex;
          if ( currentIndex === docTopIndex && !dirDown ) {
            i = docBottomIndex;
          }
          else if ( currentIndex === docBottomIndex && dirDown ) {
            i = docTopIndex;
          }
        }
        else if ( topAndBottomSelected && !noChangeInLength ) {
          
          var mindthegap = (function() {
            var indexes = dirDown ? selectedLayers.idxs.slice().reverse() : selectedLayers.idxs;
            for (var i = 0; i < indexes.length; i++) {
              var thisIndex = indexes[i];
              var thatIndex = indexes[i+1];
              var fetchQuest = thisIndex+(dirDown ? -1 : +1);
              // alert( 'fetchQuest: ' + fetchQuest + ' ' + (fetchQuest !== thatIndex) );
              // alert( indexes + '\n' + 'thisIndex: ' +  thisIndex + '\n' + 'thatIndex: ' + thatIndex + '\n' + 'fetchQuest: ' + fetchQuest );
              if ( fetchQuest !== thatIndex ) return fetchQuest;
            }
          }());
          
          if ( mindthegap != undefined ) {
            i = (mindthegap === idx) ? mindthegap+(dirDown ? -1 : +1) : mindthegap;
          }
          
        }
        
        var endIndex = dirDown ? selectedLayers.idxs.length-1 : 0;
        var actionSelect = action === undefined || action === 'select';
        var layerBefore = selectedLayers.ids[0];
        var layers = selectedLayers;
        
        var topOrBottomSelected = ( docBottomIndex === layers.idxs[endIndex] ) || 
                                  ( docTopIndex    === layers.idxs[endIndex] );
                                  
        var endOfTheLine = (  dirDown && docBottomIndex === layers.idxs[endIndex] ) || 
                           ( !dirDown && docTopIndex    === layers.idxs[endIndex] );
        
        if ( settings.endOfTheLine && endOfTheLine ) {
          settings.endOfTheLine( layers );
        };
        
        if ( !loopDeLoop && endOfTheLine ) return;
        
        // SELECT LAYER 
        var selectionSuccess = selectLayerByIdx( i, action );
        
        layers = getSelectedLayers();
        var layerAfter = layers.ids[0];
        var sameLayerSelected = layerBefore === layerAfter;
        noChangeInLength = selectedLayers.idxs.length === layers.idxs.length;
        
        // Layer doesn't exist... try the next index...
        var conditions =
          (action === 'add' && noChangeInLength) ||
          (actionSelect && (layers.idxs.length === 0 || sameLayerSelected) ) || 
          (actionSelect && settings.group && !layers.groups[endIndex]);
          
        if ( conditions ) {
          testTheWaters( i, layers, dirDown, direction, action, keepLast, noChangeInLength );
        }
        
      }
    }
    
    function groupExpansion( dirDown, direction, action, keepLast ) {
    	 
      var selectedLayers = getSelectedLayers();
      var firstIndex = selectedLayers.idxs[ 0 ];
      var lastIndex = selectedLayers.idxs[ selectedLayers.idxs.length-1 ];
      var nextIndex = dirDown ? firstIndex : lastIndex;
      selectLayerByIdx( nextIndex );
      var parentIndex;
      if ( app.activeDocument.activeLayer.parent !== app.activeDocument ) {
        parentIndex = app.activeDocument.activeLayer.parent.itemIndex;
      }
      buildSelectionWithIdxs( selectedLayers.idxs );
      if ( parentIndex ) groupExpand( parentIndex );
      
    }
    
    function getLayerNameByID( id ) {
      ref = new ActionReference();
      ref.putProperty( charIDToTypeID("Prpr") , charIDToTypeID( "Nm  " ));
      ref.putIdentifier( charIDToTypeID( "Lyr " ), id );
      return executeActionGet(ref).getString(charIDToTypeID( "Nm  " ));
    }
    
    function groupExpand( idx, nested ) {
      if ( !checkIfExpanded( idx ) ) {
        nested = nested || false;
        var expand = true;
        var desc = new ActionDescriptor();
        var ref = new ActionReference();
        ref.putProperty(charIDToTypeID('Prpr'), stringIDToTypeID('layerSectionExpanded'));
        var n = -1; try { activeDocument.backgroundLayer; } catch(e) { n = 0; }
        ref.putIndex(charIDToTypeID('Lyr '), idx + n);
        desc.putBoolean(stringIDToTypeID('to'), expand);
        desc.putBoolean(stringIDToTypeID('recursive'), nested );
        desc.putReference(charIDToTypeID('null'), ref);
        executeAction(charIDToTypeID('setd'), desc, DialogModes.NO);
      }
    }
    
    function checkIfExpanded( idx ) {
      var ref = new ActionReference();
      ref.putProperty( charIDToTypeID("Prpr"), stringIDToTypeID('layerSectionExpanded'));
      var n = -1; try { activeDocument.backgroundLayer; } catch(e) { n = 0; }
      ref.putIndex(charIDToTypeID('Lyr '), idx + n);
      return executeActionGet(ref).getUnitDoubleValue( stringIDToTypeID('layerSectionExpanded') );
    }
    
    function buildSelectionWithIdxs( idxs ) {
      for ( var i = 0; i < idxs.length; i++ ) {
        selectLayerByIdx( idxs[i], (i===0) ? false : "add" );
      }
    }
    
    function selectLayerByIdx( idx, action ) {
      var result = false;
      try {
        function cTID(s) { return app.charIDToTypeID(s); };
        function sTID(s) { return app.stringIDToTypeID(s); };
        var ref = new ActionReference();
        var n = -1;
        try { activeDocument.backgroundLayer; } catch(e) { n = 0; }
        ref.putIndex(cTID('Lyr '), idx + n);
        var desc = new ActionDescriptor();
        desc.putReference(cTID('null'), ref);
        if ( action === 'add' || action === 'remove' ) {
          desc.putEnumerated(
            sTID('selectionModifier'),
            sTID('selectionModifierType'),
            ( action === 'remove' ? sTID('removeFromSelection') : sTID('addToSelection') )
          );
        }
        desc.putBoolean(cTID('MkVs'), false);
        executeAction(cTID('slct'), desc, DialogModes.NO);
        result = true;
      } catch(e) {}
      return result;
    }
    
    function getSelectedLayers() {
      var layers = {
        idxs: [],
        ids: [],
        names: [],
        groups: [],
      };
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
          layers.idxs.push( idx+n );
          toIdRef = new ActionReference();
          toIdRef.putIndex( charIDToTypeID("Lyr "), idx );
          var id = executeActionGet(toIdRef).getInteger( stringIDToTypeID( "layerID" ));
          layers.ids.push( id );
          layers.names.push( getLayerNameByID( id ) );
          layers.groups.push( checkIfGroupById( id ) );
        }
      }
      return layers;
    }
    
  }
}

function deselectLayers() {
  function cTID(s) { return app.charIDToTypeID(s); };
  function sTID(s) { return app.stringIDToTypeID(s); };
  var desc677 = new ActionDescriptor();
  var ref89 = new ActionReference();
  ref89.putEnumerated( cTID('Lyr '), cTID('Ordn'), cTID('Trgt') );
  desc677.putReference( cTID('null'), ref89 );
  executeAction( sTID('selectNoLayers'), desc677, DialogModes.NO );
}

function checkIfGroupById( id ) {
  var ref = new ActionReference();
  ref.putProperty( charIDToTypeID("Prpr") , stringIDToTypeID( "layerKind" ));
  ref.putIdentifier( charIDToTypeID( "Lyr " ), id );
  return executeActionGet(ref).getInteger( stringIDToTypeID( "layerKind" )) == 7 ? true : false;
}

#include "../layerSelection.jsx"

layerSelection({
  dir: 'down',
  loop: true,
  endOfTheLine: function( selection ) {
    alert( selection.idxs );
  }
});

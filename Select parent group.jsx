
// Select parent group
var doc = app.activeDocument;
var layerParent = doc.activeLayer.parent;
if ( layerParent !== doc ) doc.activeLayer = layerParent;

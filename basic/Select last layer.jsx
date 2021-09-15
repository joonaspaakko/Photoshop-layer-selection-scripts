
// Select last layer (bottom)
var select = charIDToTypeID( "slct" );
    var aDescriptor = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
        var aReference = new ActionReference();
            var layer = charIDToTypeID( "Lyr " );
            var ordinal = charIDToTypeID( "Ordn" );
            var last = charIDToTypeID( "Back" );
        aReference.putEnumerated( layer, ordinal, last );
    aDescriptor.putReference( idnull, aReference );
executeAction( select, aDescriptor, DialogModes.NO );

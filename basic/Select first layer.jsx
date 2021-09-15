
// Select first layer ( top )
var select = charIDToTypeID( "slct" );
    var aDescriptor = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
        var aReference = new ActionReference();
            var layer = charIDToTypeID( "Lyr " );
            var ordinal = charIDToTypeID( "Ordn" );
            var first = charIDToTypeID( "Frnt" );
        aReference.putEnumerated( layer, ordinal, first );
    aDescriptor.putReference( idnull, aReference );
executeAction( select, aDescriptor, DialogModes.NO );

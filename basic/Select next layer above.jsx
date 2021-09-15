
// Select next layer above
var select = charIDToTypeID( "slct" );
    var aDescriptor = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
        var aReference = new ActionReference();
            var layer = charIDToTypeID( "Lyr " );
            var ordinal = charIDToTypeID( "Ordn" );
            var forward = charIDToTypeID( "Frwr" );
        aReference.putEnumerated( layer, ordinal, forward );
    aDescriptor.putReference( idnull, aReference );
executeAction( select, aDescriptor, DialogModes.NO );

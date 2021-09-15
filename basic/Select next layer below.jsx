
// Select next layer below
var select = charIDToTypeID( "slct" );
    var aDescriptor = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
        var aReference = new ActionReference();
            var layer = charIDToTypeID( "Lyr " );
            var ordinal = charIDToTypeID( "Ordn" );
            var backward = charIDToTypeID( "Bckw" );
        aReference.putEnumerated( layer, ordinal, backward );
    aDescriptor.putReference( idnull, aReference );
executeAction( select, aDescriptor, DialogModes.NO );

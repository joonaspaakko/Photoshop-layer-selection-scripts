// Add next layer above to selection
var select = charIDToTypeID( "slct" );
    var aDescriptor = new ActionDescriptor();
        var idnull = charIDToTypeID( "null" );
        var aReference = new ActionReference();
            var layer = charIDToTypeID( "Lyr " );
            var ordinal = charIDToTypeID( "Ordn" );
            var forward = charIDToTypeID( "Frwr" );
        aReference.putEnumerated( layer, ordinal, forward );
    aDescriptor.putReference( idnull, aReference );
    var idselectionModifier = stringIDToTypeID( "selectionModifier" );
    var idselectionModifierType = stringIDToTypeID( "selectionModifierType" );
    var idaddToSelection = stringIDToTypeID( "addToSelection" );
    aDescriptor.putEnumerated( idselectionModifier, idselectionModifierType, idaddToSelection );
executeAction( select, aDescriptor, DialogModes.NO );

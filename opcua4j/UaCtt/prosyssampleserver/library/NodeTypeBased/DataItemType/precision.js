// Function to generate a value with the requested precision
// Note: Not valid for DateTime type DataItem
function generateValueWithPrecision ( precision, startingValue )
{
    // We should be provided at least with the precision
    if( arguments.length < 1 )
    {
        throw( "generateValueWithPrecision() function requires 1 argument." );
    }
    
    // Sanity check
    if ( precision <= 0 )
    {
        throw ( "Invalid precision requested in generateValueWithPrecision()" );
    }
    
    // Chose an arbitrary starting value, if none specified
    if ( startingValue == undefined )
    {
        startingValue = 1.2;
    }
    
    // Final value that this function returns
    var generatedValue = "";
    
    // Get required values 
    var startingValueStringFormat = startingValue.toString ();
    var splitArrayDecimal = new Array ();
    splitArrayDecimal = startingValueStringFormat.split('.');
    // Number before the decimal (we build a value off this)
    var numBeforeDecimal = splitArrayDecimal[0];
    // If the exponent is present, we read it. The final value will have the same exponent
    var eValue = 0;
    // If we have a number after the decimal
    if ( splitArrayDecimal.length > 1 )
    {
        var splitArrayExponent = new Array ();
        var splitArrayAfterDecimalStringFormat = splitArrayDecimal[1].toString ();
        splitArrayExponent = splitArrayAfterDecimalStringFormat.split('+');
        // If we have the exponent part
        if ( splitArrayExponent.length > 1 )
        {
            eValue = splitArrayExponent[1];
        }
    }
    
    // Create value 
    var numberIncrementer = 1;
    // Initial value
    var tempGeneratedValue = numBeforeDecimal + "." + numberIncrementer;
    for ( var n=0; n<precision-1; n++ )
    {
        numberIncrementer++;
        if ( numberIncrementer == 10) numberIncrementer = 1;        
        tempGeneratedValue = tempGeneratedValue + numberIncrementer;
    }
    
    generatedValue = tempGeneratedValue;
    // Add the exponent if present
    if ( eValue > 0)
    {
        generatedValue = tempGeneratedValue + "e+" + eValue;
    }
    
    // Return final value
    return ( generatedValue );
}

// Function to get the precision of a DataItem node value 
// Note: Not valid for DateTime type DataItem
function getPrecision ( value )
{
    // We should be provided at least with the precision
    if( arguments.length < 1 )
    {
        throw( "getPrecision() function requires 1 argument." );
    }
    
    // Get required values 
    var valueStringFormat = value.toString ();
    var splitArrayDecimal = new Array ();
    splitArrayDecimal = valueStringFormat.split('.');
    // Do we have a number after the decimal
    if ( splitArrayDecimal.length > 1 )
    {
        var splitArrayExponent = new Array ();
        var splitArrayAfterDecimalStringFormat = splitArrayDecimal[1].toString ();
        splitArrayExponent = splitArrayAfterDecimalStringFormat.split('e');
        var precisionValueStringFormat = splitArrayExponent[0].toString ();
        return ( precisionValueStringFormat.length );
    }
    // No decimal portion, zero precision
    else
    {
        return ( 0 );
    }
}
    
    
    
    
    
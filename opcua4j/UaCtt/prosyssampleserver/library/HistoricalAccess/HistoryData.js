function ValidateHistoryData( dataObject, noWarnings )
{
    var result = false;
    if( dataObject === undefined || dataObject === null )
    {
        addError( "ValidateHistoryData received null data." );
    }
    else
    {
        // dataObject is a collection of "DataValue" objects
        for( var v=0; v<dataObject.length; v++ )
        {
            // check each parameter:
            // Value
            if( dataObject[v].Value === null ){ addError( "DataObject[" + v + "] is null." ); }
            // StatusCode
            if( dataObject[v].StatusCode.isNotGood() )
            {
                if( !noWarnings )
                {
                    addWarning( "DataObject[" + v + "].StatusCode is not Good, but is actually: " + dataObject[v].StatusCode );
                }
            }
            // SourceTimestamp
            if( dataObject[v].SourceTimestamp === null || dataObject[v].SourceTimestamp.isNull() )
            {
                if( !noWarnings )
                {
                    addWarning( "DataObject[" + v + "].SourceTimestamp is null." );
                }
            }
            // ServerTimestamp
            if( dataObject[v].ServerTimestamp === null || dataObject[v].ServerTimestamp.isNull() )
            {
                if( !noWarnings )
                {
                    addWarning( "DataObject[" + v + "].ServerTimestamp is null." );
                }
            }
        }
    }
    return( result );
}
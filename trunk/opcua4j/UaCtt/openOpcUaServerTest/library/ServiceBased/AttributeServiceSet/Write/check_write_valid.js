/*
    Description:
        Validates the Write() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP: REVIEWED.
*/

include( "./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js" );
include( "./library/Base/UaVariantToSimpleType.js" );
include( "./library/ServiceBased/AttributeServiceSet/Read/check_read_valid.js" );

function charCodesStringToString( charCodeString )
{
    var plainString = "";
    for( var i=0; i<charCodeString.length; i += 2 )
    {
        plainString += String.fromCharCode( parseInt( charCodeString.substring( i, i + 2 ), 16 ) );
    }
    return plainString;
}

function comparePartialStringWrittenToRead( jsWrittenValue, indexRange, jsReadValue, dataType )
{
    var success;
    // extract written characters from read String or ByteString
    var startIndex = parseInt( indexRange.match( /^[0-9]+/ ), 10 );
    var endIndex = parseInt( indexRange.match( /[0-9]+$/ ), 10 );
    if( dataType === BuiltInType.String )
    {
        success = AssertGreaterThan( endIndex, jsReadValue.length, "String was too short: written size was greater than read size" );
        jsReadValue = jsReadValue.substring( startIndex, endIndex + 1 );
    }
    else if( dataType === BuiltInType.ByteString )
    {
        success = AssertGreaterThan( endIndex, jsReadValue.length, "ByteString was too short: written size was greater than read size" );
        var dataPart = jsReadValue.toString().match( /[0-9A-F]+$/ ).toString();
        dataPart = dataPart.substring( startIndex * 2, ( endIndex + 1 ) * 2 );
        jsReadValue = UaByteString.fromStringData( charCodesStringToString( dataPart ) );
    }
    else
    {
        return null; // ignore unsupported data types
    }
    var rangeMessage = " at ";
    rangeMessage += ( startIndex === endIndex ) ? "index " + startIndex : "index range " + startIndex + ":" + endIndex;
    if( !AssertEqual( jsWrittenValue, jsReadValue, "Value written" + rangeMessage + " did not match value read" + rangeMessage ) )
    {
        success = false;
    }
    return success;
}

function compareArrayWrittenToRead( writeRequest, readResponse, i, NodeSettings )
{
    var success;
    var readArrayAsNative  = GetArrayTypeToNativeType( readResponse.Results[i].Value );
    var writeArrayAsNative = GetArrayTypeToNativeType( writeRequest.NodesToWrite[i].Value.Value );
    var dimensions;
    var startIndex;
    var endIndex;
    var useSettings = ( NodeSettings !== undefined && NodeSettings !== null && NodeSettings.length == writeRequest.NodesToWrite.length );
    if( writeRequest.NodesToWrite[i].IndexRange !== "" )
    {
        dimensions = writeRequest.NodesToWrite[i].IndexRange.split( "," );
        startIndex = parseInt( dimensions[0].match( /^[0-9]+/ ), 10 );
        endIndex = parseInt( dimensions[0].match( /[0-9]+$/ ), 10 );
        var message = "Array was too short: written size was greater than read size. ";
        if( useSettings )
        {
            message += "NodeId: '" + writeRequest.NodesToWrite[i].NodeId + "'; Setting: '" + NodeSettings[i];
        }
        success = AssertGreaterThan( endIndex, readArrayAsNative.length, message );
    }
    else
    {
        startIndex = 0;
        endIndex = writeArrayAsNative.length - 1;
        dimensions = [ startIndex + ":" + endIndex ];
        var message = "Array length mismatch: written size did not match read size. ";
        if( useSettings )
        {
            message += "NodeId: '" + writeRequest.NodesToWrite[i].NodeId + "'; Setting: '" + NodeSettings[i] + "')";
        }
        success = AssertEqual( writeArrayAsNative.length, readArrayAsNative.length, message );
    }
    // iterate thru the array values comparing the read to write, element by element
    for( var v = startIndex; v <= endIndex; v++ )
    {
        var readArrayElementValue = readArrayAsNative[v] ;
        var writeArrayElementValue = writeArrayAsNative[v - startIndex];
        if( dimensions.length === 1 )
        {
            var message =  "Element # " + v + " mismatch.";
            if( useSettings )
            {
                message += "NodeId: '" + writeRequest.NodesToWrite[i].NodeId + "'; Setting: '" + NodeSettings[i] + "')";
            }
            if( !AssertEqual( writeArrayElementValue, readArrayElementValue, message ) )
            {
                success = false;
            }
        }
        else
        {
            try
            {
                if( readArrayAsNative[v].getArraySize() !== -1 )
                {
                    addError( "compareWrittenToRead() does not handle 2-d arrays (just 1-d arrays with Strings or ByteStrings)" );
                    continue;
                }
            }
            catch ( e )
            {
            }
            if( dimensions > 2 )
            {
                addError( "compareWrittenToRead() does not handle arrays with more than two dimensions" );
                continue;
            }
            if( readArrayElementValue !== undefined )
            {
                comparePartialStringWrittenToRead( writeArrayElementValue, dimensions[1], readArrayElementValue, writeRequest.NodesToWrite[i].Value.Value.DataType );
            }
            else
            {
                addError( "No value read from array at index " + v );
            }
        }
    }// for v...
    return success;
}

function compareWritesToRead( writeRequest, writeResponse, NodeSettings )
{
    var success = true;
    addLog( "\nComparing Written values, by reading them back from the UA Server..." );
    // define the Read request headers
    var readRequest = new UaReadRequest();
    var readResponse = new UaReadResponse();
    g_session.buildRequestHeader( readRequest.RequestHeader );

    // define the items to read, which are the same as those we just wrote
    for( var i=0; i<writeRequest.NodesToWrite.length; i++ )
    {
        readRequest.NodesToRead[i].NodeId      = writeRequest.NodesToWrite[i].NodeId;
        readRequest.NodesToRead[i].IndexRange  = writeRequest.NodesToWrite[i].IndexRange;
        readRequest.NodesToRead[i].AttributeId = writeRequest.NodesToWrite[i].AttributeId;
    }// for i...

    var uaStatus = g_session.read( readRequest, readResponse );
    if( uaStatus.isGood() )
    {
        // check all the parameters are valid still...
        checkReadValidParameter( readRequest, readResponse, NodeSettings );
        //now to compare the values
        for( i=0; i<readRequest.NodesToRead.length; i++ )
        {
            // we will skip over any items that failed to WRITE
            if( writeResponse.Results[i].isGood() )
            {
                // are we dealing with an array type, or a simple type?
                var arraySize = readResponse.Results[i].Value.getArraySize();
                if( arraySize > -1 )
                {
                    // ARRAY TYPE WE'RE DEALING WITH HERE....
                    var comparissonIsSuccess = compareArrayWrittenToRead( writeRequest, readResponse, i, NodeSettings );
                    if( comparissonIsSuccess )
                    {
                        var message = "Array values written match the values just read! (NodeId: '" + writeRequest.NodesToWrite[i].NodeId + "''; Setting: '";
                        if( NodeSettings !== undefined && NodeSettings !== null && NodeSettings.length > 0 )
                        {
                            message += NodeSettings[i] + "') ";
                        }
                        addLog( message );
                        success = true;
                    }
                }// if( readRequest.NodesToRead[i].Value.getArraySize() > -1 )
                else
                {
                    // SIMPLE TYPE WE'RE DEALING WITH HERE....
                    var writeVal = UaVariantToSimpleType( writeRequest.NodesToWrite[i].Value.Value );
                    var readVal  = UaVariantToSimpleType( readResponse.Results[i].Value );

                    // check if a range is specified (for String or ByteString)
                    var valueChecked = false;
                    if( writeRequest.NodesToWrite[i].IndexRange !== "" )
                    {
                        // check Strings and ByteStrings at specified index range
                        valueChecked = ( comparePartialStringWrittenToRead( writeVal, writeRequest.NodesToWrite[i].IndexRange, readVal, writeRequest.NodesToWrite[i].Value.Value.DataType ) !== null );
                    }
                    if( !valueChecked )
                    {
                        if( writeVal !== readVal && writeVal != readVal )
                        {
                            if( writeVal === null ) { writeVal = ""; }
                            if( readVal === null ) { readVal = ""; }
                            if( writeVal.toString() !== readVal.toString() )
                            {            
                                var message = "Write verification failure:\n" +
                                    "\tNodeId: '" + writeRequest.NodesToWrite[i].NodeId + 
                                    "; AttributeId: '" + writeRequest.NodesToWrite[i].AttributeId + "'" +
                                    "\n\t  WRITE Value: '" + writeVal + "'" +
                                    "\n\t  READ Value: '" + readVal + "'";
                                if( NodeSettings !== undefined && NodeSettings !== null && NodeSettings.length > 0 )
                                {
                                    message += "' (Setting: '" + NodeSettings[i] + "') ";
                                }
                                addError( message );
                                success = false;
                            }
                        }
                    }
                }// else... if( readRequest.NodesToRead[i].Value.getArraySize() > 1 )
            }// if write succeeded
            else
            {
                addLog( "Skipping the write verification of failed-write for Node: " + writeRequest.NodesToWrite[i].NodeId );
            }
        }// for i...
    }
    else
    {
        addError( "read (used for Write verification) failed with status " + uaStatus, uaStatus );
        success = false;
    }
    
    return( success );
}

function compareLastWriteToRead( writeRequest, writeResponse )
{
    // define the Read request headers
    var readRequest = new UaReadRequest();
    var readResponse = new UaReadResponse();
    g_session.buildRequestHeader( readRequest.RequestHeader );

    // define the items to read, which is ONLY the last item we just wrote
    var numWrites = writeRequest.NodesToWrite.length - 1;
    if( numWrites < 0 )
    {
        addError( "Nothing was written; cannot perform read validation" );
        return;
    }
    readRequest.NodesToRead[0].NodeId = writeRequest.NodesToWrite[numWrites].NodeId;
    readRequest.NodesToRead[0].AttributeId = Attribute.Value;
    
    var uaStatus = g_session.read( readRequest, readResponse );
    if( uaStatus.isGood() )
    {
        // check all the parameters are valid still...
        checkReadValidParameter( readRequest, readResponse );
        
        //now to compare the value
        var writeVal = UaVariantToSimpleType( writeRequest.NodesToWrite[numWrites].Value.Value );
        var readVal  = UaVariantToSimpleType( readResponse.Results[0].Value );
        print( "Comparing written value '" + writeVal + "' to value just read '" + readVal + "'" );
        AssertEqual( writeVal, readVal, "Expected to read back the value previously wrote!" );
    }
    else
    {
        addError( "Read() (Write verification ) status " + uaStatus, uaStatus );
    }
    
    return( true );
}

// Read the arrays and compare them to how they should look after having been written.
function checkArraysAfterElementsWritten( session, writeReq, writeResp, originalArrays )
{
    for( var i = 0; i < writeReq.NodesToWrite.length; i++)
    {
        // check the write was successful first
        if( writeResp.Results[i].isBad() )
        {
            addLog( "Skipping the array-write verification of index " + i +", because the write failed with error: " + writeResp.Results[i] );
            continue;
        }
        
        var expectedArray = GetArrayTypeToNativeType( originalArrays[i] );
        var writtenArray = GetArrayTypeToNativeType( writeReq.NodesToWrite[i].Value.Value );
        
        // determine the index range actually written
        var indexRange = writeReq.NodesToWrite[i].IndexRange;
        var firstIndexWritten = 0;
        var lastIndexWritten = -1;
        if( /^[0-9]+$/.test( indexRange ) )
        {
            // IndexRange was a single value (e.g., "2")
            firstIndexWritten = parseInt( indexRange, 10 );
            lastIndexWritten = firstIndexWritten;
        }
        else
        {
            var matches = indexRange.match( /^([0-9]+):([0-9]+)$/ );
            if( matches !== null )
            {
                // IndexRange was a correctly formatted range
                firstIndexWritten = parseInt( matches[1], 10 );
                if( matches[2] !== matches[1] )
                {
                    lastIndexWritten = parseInt( matches[2], 10 );
                }
            }
        }
        
        // set expected array with writeReq values
        if( firstIndexWritten <= expectedArray.length )
        {
            for( var j = firstIndexWritten; j <= lastIndexWritten; j++ )
            {
                expectedArray[j] = writtenArray[j - firstIndexWritten];
            }
        }

        var item = new MonitoredItem( writeReq.NodesToWrite[i].NodeId, 1 );
        var readValues = new Read( session );
        readValues.Execute( [ item ], TimestampsToReturn.Neither, 0 );
        var readNativeValues = GetArrayTypeToNativeType( readValues.readResponse.Results[0].Value );

        AssertArraysEqual( expectedArray, readNativeValues, "Written array is not as expected." );
    }
}

/*  Validates the Write response header, and results.
    Parameters: 
        Request       : UaWriteRequest object
        Response      : UaWriteResponse object
        ValidateValues: True/False; true=READ the value back from the Server 
        NodeSettings  : string[]; setting names that map in order to nodes in Request.NodesToRead
        optionalCUCheckNotSupported : true = check if Bad_WriteNotSupported returned */
function checkWriteValidParameter( Request, Response, ValidateValues, NodeSettings, optionalCUCheckNotSupported, suppressMessaging )
{
    var bSucceeded = true;
    var useSettings = false;
    if( NodeSettings !== undefined && NodeSettings !== null )
    {
        if( NodeSettings.length == Request.NodesToWrite.length )
        {
            useSettings = true;
        }
    }
    // check in parameters
    if( arguments.length < 3 )
    {
        addError( "function checkWriteValidParameter(Request, Response, ValidateValues): Number of arguments must be 3!" );
        return false;
    }
    // as this is a valid parameter test we don't expect any diagnositcinfo        
    if( Response.DiagnosticInfos.length !== 0 )
    {
        addError( "ReadResponse.DiagnosticInfos was returned. No DiagnosticInfos were expected" );
        bSucceeded = false;
    }
    // check response header
    bSucceeded = checkResponseHeaderValid( Request.RequestHeader, Response.ResponseHeader );
    // check results        
    // check number of results
    if( Response.Results.length !== Request.NodesToWrite.length )
    {
        addError( "The number of results does not match the number of NodesToWrite." );
        addError( "NodesToWrite.length = " + Request.NodesToWrite.length + " Results.length = " + Response.Results.length );
        bSucceeded = false;
    }
    else
    {        
        // check each result all are expected to be good
        for( var i=0; i<Response.Results.length; i++ )
        {
            if( optionalCUCheckNotSupported !== undefined && optionalCUCheckNotSupported !== null 
                && optionalCUCheckNotSupported == true )
            {
                if( Response.Results[i].StatusCode == StatusCode.BadWriteNotSupported
                    || Response.Results[i].StatusCode === StatusCode.BadNotSupported )
                {
                    addNotSupported( "Server responded that it does not support the operation." );
                    // override the "validateValues" since we know the write failed!
                    ValidateValues = false;
                    continue;
                }
            }
            if( Response.Results[i].isNotGood() )
            {
                var errorMessage = "Response.Results[" + i + "] is not good: " + Response.Results[i] + "";
                if( useSettings )
                {
                    errorMessage += "; (Node Setting: '" + NodeSettings[i] + "') ";
                }
                addError( errorMessage, Response.Results[i] );
                bSucceeded = false;
            }
        }
        // read the written values and check if the value is the same
        if( ValidateValues && bSucceeded )
        {
            // here, we will do a READ to compare the values we wrote to those
            // the server is reporting.
            bSucceeded = compareWritesToRead( Request, Response, NodeSettings );
        }
    }
    return bSucceeded;
}
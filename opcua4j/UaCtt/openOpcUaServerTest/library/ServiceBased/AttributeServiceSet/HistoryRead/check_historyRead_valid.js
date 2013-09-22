/*
    Description:
        Validates the HistoryRead() response by analyzing the parameters.

    Revision History:
        27-Sep-2010 NP: Initial Version.
*/

include( "./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js" );
include( "./library/ServiceBased/AttributeServiceSet/HistoryRead/historyRead.js" );

// the service is expected to succeed
// all operations are expected to succeed
HistoryRead.checkHistoryReadValidParameter( Request, Response, monitoredItems )
{
    var timeTolerence = readSetting( "/Server Test/Time Tolerence" ); // ms tolerance for checking the server timestamp in the datavalue
    var bSucceeded = true;
    var currentTime = UaDateTime.utcNow();
    // check in parameters
    if( arguments.length < 2 )
    {
        addError( "function checkHistoryReadValidParameter(): Number of arguments must be 2!" );
        return( false );
    }
    // as this is a valid parameter test we don't expect any diagnositcinfo
    if( Response.DiagnosticInfos.length !== 0 )
    {
        addError( "HistoryReadResponse.DiagnosticInfos was returned. No DiagnosticInfos were expected." );
        bSucceeded = false;
    }
    // check response header
    bSucceeded = checkResponseHeaderValid( Request.RequestHeader, Response.ResponseHeader, StatusCode.Good );
    // check results
    // check number of results
    if( !AssertEqual( request.NodesToRead.length, response.Results.length, "The number of NodesToRead does not match the number of results." ) )
    {
        bSucceeded = false;
    }
    else
    {
        // check each result
        for( var i=0; i<response.Results.length; i++ )
        {
            var nodeHistoryResult = response.Results[i];
            AssertStatusCodeIs( StatusCode.Good, nodeHistoryResult.StatusCode, "Results[" + i + "].StatusCode is not Good" );
            var nodeHistoryDataValues = nodeHistoryResult.HistoryData.toHistoryData().DataValues;
            addLog( "Number of values returned in Result[" + i + "]: " + nodeHistoryDataValues.length );
            for( var j = 0; j < nodeHistoryDataValues.length; j++ )
            {
                var dataValue = nodeHistoryDataValues[j];
                
                // check for null
                if( dataValue === null || dataValue.Value === null || dataValue.Value.isEmpty() )
                {
                    addError( "  DataValues[" + j + "].Value is empty/null." );
                    bSucceeded = false;
                }

                // check status code
                // get the code bits
                var codeOnly = new UaStatusCode( dataValue.StatusCode.StatusCode & 0xFFFF0000 );
                AssertStatusCodeIs( StatusCode.Good, codeOnly, "  DataValues[" + j + "].StatusCode is not Good: " );

                // check the status flags
                AssertEqual( 0, dataValue.StatusCode.StatusCode & 0x00008000, "  StatusCode StructureChanged flag is set" );
                AssertEqual( 0, dataValue.StatusCode.StatusCode & 0x00004000, "  StatusCode SemanticsChanged flag is set" );
                AssertEqual( 0, dataValue.StatusCode.StatusCode & 0x00003000, "  StatusCode reserved bits, 12 and 13, are set" );
                AssertEqual( 0x400, dataValue.StatusCode.StatusCode & 0x00000c00, "  StatusCode InfoType bits are not set to 01" );
                // bits 8 and 9 aren't tested
                AssertEqual( 0, dataValue.StatusCode.StatusCode & 0x00000080, "  StatusCode Overflow flag is set" );
                AssertEqual( 0, dataValue.StatusCode.StatusCode & 0x00000060, "  StatusCode reserved bits, 5 and 6, are set" );
                AssertEqual( 0, dataValue.StatusCode.StatusCode & 0x00000060, "  StatusCode reserved bits, 5 and 6, are set" );
                var historianBitsType = dataValue.StatusCode.StatusCode & 0x00000003;
                AssertNotEqual( 3, historianBitsType, "  StatusCode HistorianBits set to XXX11" );
                var historianBitsPartial = dataValue.StatusCode.StatusCode & 0x00000004;
                var historianBitsExtraData = dataValue.StatusCode.StatusCode & 0x00000008;
                var historianBitsMultiValue = dataValue.StatusCode.StatusCode & 0x00000010;

                // check requested timestamps are returned
                if( request.TimestampsToReturn === TimestampsToReturn.Neither )
                {
                    AssertEqual( new UaDateTime(), dataValue.ServerTimestamp, "SERVER timestamp NOT expected." );
                    AssertEqual( new UaDateTime(), dataValue.SourceTimestamp, "SOURCE timestamp NOT expected." );
                }
                else if( request.TimestampsToReturn === TimestampsToReturn.Both )
                {
                    AssertNotEqual( new UaDateTime(), dataValue.ServerTimestamp, "Expected a SERVER timestamp." );
                    AssertNotEqual( new UaDateTime(), dataValue.SourceTimestamp, "Expected a SOURCE timestamp." );
                }
                else if( request.TimestampsToReturn === TimestampsToReturn.Server )
                {
                    AssertNotEqual( new UaDateTime(), dataValue.ServerTimestamp, "Expected a SERVER timestamp." );
                    AssertEqual( new UaDateTime(), dataValue.SourceTimestamp, "SOURCE timestamp NOT expected." );
                }
                else if( request.TimestampsToReturn === TimestampsToReturn.Source )
                {
                    AssertNotEqual( new UaDateTime(), dataValue.SourceTimestamp, "Expected a SOURCE timestamp." );
                    AssertEqual( new UaDateTime(), dataValue.ServerTimestamp, "SERVER timestamp NOT expected." );
                }

                // check the server timestamp is not too old (or too new)
                if( request.TimestampsToReturn === TimestampsToReturn.Both || request.TimestampsToReturn === TimestampsToReturn.Server )
                {
                    var serverTime = currentTime.clone();
                    serverTime.addMilliSeconds( g_ServerTimeDiff );
                    // timestamp should not be in the future
                    if( serverTime.msecsTo( dataValue.ServerTimestamp ) > timeTolerence )
                    {
                        addError( "  ServerTimestamp is in the future: " + dataValue.ServerTimestamp );
                        addError( "  Current time on the server = " + serverTime );
                        bSucceeded = false;
                    }
                    // timestamp should not be too old
                    if( dataValue.ServerTimestamp.msecsTo( serverTime ) > timeTolerence )
                    {
                        addLog( "  Current time on the server = " + serverTime );
                        addLog( "  ServerTimestamp = " + dataValue.ServerTimestamp );
                        addError( "  ServerTimestamp is too old: Age of ServerTimestamp = " + dataValue.ServerTimestamp.msecsTo( serverTime ) );
                        bSucceeded = false;
                    }
                }

                // print the values
                var historyType = "";
                var historyInfo = "";
                if( historianBitsType === 0 )
                {
                    historyType = "Raw";
                }
                else if( historianBitsType === 1 )
                {
                    historyType = "Calculated";
                }
                else if( historianBitsType === 2 )
                {
                    historyType = "Interpolated";
                }
                if( historianBitsPartial !== 0 )
                {
                    historyInfo = historyInfo + "  Partial";
                }
                if( historianBitsExtraData !== 0 )
                {
                    historyInfo = historyInfo + "  ExtraData";
                }
                if( historianBitsMultiValue !== 0 )
                {
                    historyInfo = historyInfo + "  MultiValue";
                }
                with( nodeHistoryDataValues[j] )
                {
                    addLog( "  " + historyType + "  " + ServerTimestamp + "  " + SourceTimestamp + "  " + codeOnly + "  " + Value + historyInfo );
                }
            }
        }
    }
    return bSucceeded;
}


function checkHistoryReadValidParameterArray( Request, Response )
{
    var isGood = true;
    if( checkReadValidParameter( Request, Response ) )
    {
        // iterate thru each item in results
        for( var itemCount=0; itemCount<Response.Results.length; itemCount++ )
        {
            // make sure the item is an array type
            if( Response.Results[itemCount].Value.getArraySize() < 1 )
            {
                // check if a ByteArray, which comes back as a string instead
                if( Response.Results[itemCount].Value.DataType == BuiltInType.ByteString &&
                    Response.Results[itemCount].Value.toString().length > 13 )
                {
                    continue;
                }
                else if( Response.Results[itemCount].Value.getArraySize() < 0 )
                {
                    addError( "Results[" + itemCount + "] is not an array" );
                    isGood = false;
                }
            }
        }// for itemCount...
        return( isGood );
    }
    else
    {
        return( false );
    }
}


function checkHistoryReadSourceTimestampsInRange( response, startTime, endTime )
{
    var bSucceeded = true;

    // check in parameters
    if( arguments.length !== 3 )
    {
        addError( "function checkHistoryReadSourceTimestampsInRange(): Number of arguments must be 3!" );
        return( false );
    }

    var lastTime;

    // check each result
    for( var i=0; i<response.Results.length; i++ )
    {
        var nodeHistoryResult = response.Results[i];
        var nodeHistoryDataValues = nodeHistoryResult.HistoryData.toHistoryData().DataValues;
        lastTime = startTime.clone();
        for( var j = 0; j < nodeHistoryDataValues.length; j++ )
        {
            var dataValue = nodeHistoryDataValues[j];

            // check the source timestamp is in range and in order
            if( request.TimestampsToReturn === TimestampsToReturn.Both || request.TimestampsToReturn === TimestampsToReturn.Source )
            {
                var fromTime = startTime;
                var toTime = endTime;
                if( startTime > endTime )
                {
                    fromTime = endTime;
                    toTime = startTime;
                }
                if( AssertInRange( fromTime, toTime, dataValue.SourceTimestamp, "SourceTimestamp is out of range" ) )
                {
                    if( startTime < endTime )
                    {
                        // check order
                        if( dataValue.SourceTimestamp < lastTime )
                        {
                            addError( "SourceTimestamp is out of order" );
                            addError( "Previous timestamp: " + lastTime );
                            addError( "Current timestamp: " + dataValue.SourceTimestamp );
                        }
                    }
                    else
                    {
                        if( dataValue.SourceTimestamp > lastTime )
                        {
                            addError( "SourceTimestamp is out of order" );
                            addError( "Previous timestamp: " + lastTime );
                            addError( "Current timestamp: " + dataValue.SourceTimestamp );
                        }
                    }
                    lastTime = dataValue.SourceTimestamp;
                }
            }
        }
    }
    return bSucceeded;
}
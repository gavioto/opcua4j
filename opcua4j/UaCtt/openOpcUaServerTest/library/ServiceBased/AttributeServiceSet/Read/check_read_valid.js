/*
    Description:
        Validates the Read() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP: REVIEWED.
*/

include( "./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js" );

// the service is expected to succeed
// all operations are expected to succeed
function checkReadValidParameter( Request, Response, NodeSettings, suppressMessaging )
{
    var timeTolerenz = readSetting( "/Server Test/Time Tolerence" ); // ms tolerance for checking the server timestamp in the datavalue
    var bSucceeded = true;
    var currentTime = UaDateTime.utcNow();
    // check in parameters
    if( arguments.length < 2 )
    {
        addError( "function checkReadValidParameter(): Number of arguments must be 2!" );
        return( false );
    }
    // can we specify the node id settings when outputting messages? (preference=yes)
    var useSettings = false;
    if( NodeSettings !== undefined && NodeSettings !== null )
    {
        if( NodeSettings.length == Request.NodesToRead.length )
        {
            useSettings = true;
        }
    }
    // as this is a valid parameter test we don't expect any diagnositcinfo
    if( Response.DiagnosticInfos.length !== 0 )
    {
        addError( "ReadResponse.DiagnosticInfos was returned. No DiagnosticInfos were expected" );
        bSucceeded = false;
    }
    // check response header
    bSucceeded = checkResponseHeaderValid( Request.RequestHeader, Response.ResponseHeader, StatusCode.Good );
    // check results
    // check number of results
    if( Response.Results.length !== Request.NodesToRead.length )
    {
        addError( "The number of results does not match the number of NodesToRead." );
        addError( "NodeToRead.length = " + Request.NodesToRead.length + " Results.length = " + Response.Results.length );
        bSucceeded = false;
    }
    else
    {
        // check each result
        for( var i=0; i<Response.Results.length; i++ )
        {
            var errorMessage = "Results[" + i + "] ";
            if( useSettings )
            {
                errorMessage += " (Setting: '" + NodeSettings[i] + "') ";
            }

            var dataValue = Response.Results[i];
            if( dataValue === null )
            {
                addError( errorMessage + "Value is empty/null." );
                bSucceeded = false;
            }
            var logMessage = "Checking element[" + i + "] NodeId = " + Request.NodesToRead[i].NodeId + ", AttributeId = " + Attribute.toString( Request.NodesToRead[i].AttributeId ) + " (" + Request.NodesToRead[i].AttributeId + ")";
            if( useSettings )
            {
                logMessage += " (Setting: '" + NodeSettings[i] + "')";
            }
            if( suppressMessaging === undefined || suppressMessaging === false ) print( logMessage );
            // status code
            if( dataValue.StatusCode.isNotGood() )
            {
                addError( errorMessage + "StatusCode is not good: " + dataValue.StatusCode, dataValue.StatusCode );
                bSucceeded = false;
                continue;
            }
            // check type of attribute - only the attribute value has a SourceTimestamp
            if( Request.NodesToRead[i].AttributeId == Attribute.Value )
            {
                // SourceTimestamp
                if( Request.TimestampsToReturn == TimestampsToReturn.Source || Request.TimestampsToReturn == TimestampsToReturn.Both )
                {
                    if( dataValue.SourceTimestamp.isNull() )
                    {
                        addError( errorMessage + "SourceTimestamp not set. Requested timestamps: " + TimestampsToReturn.toString( Request.TimestampsToReturn ) + ". Received value: " + dataValue.SourceTimestamp );
                        bSucceeded = false;
                    }
                }
                else
                {
                    if( !dataValue.SourceTimestamp.isNull() )
                    {
                        addWarning( errorMessage + "SourceTimestamp is set but wasn't requested." );
                    }
                }
            }
            // no SourceTimestamp expected
            else
            {
                if( !dataValue.SourceTimestamp.isNull() )
                {
                    addError( errorMessage + "SourceTimestamp is set but SourceTimestamps should only be returned for a Value Attribute. See UA Part 4, Clause 7.7, sub-topic: SourceTimestamp, final sentence of the passage." );
                    bSucceeded = false;
                }
            }
            // check type of attribute - only the attribute value has a SourceTimestamp
            if( Request.NodesToRead[i].AttributeId == Attribute.Value )
            {
                // ServerTimestamp
                if( Request.TimestampsToReturn == TimestampsToReturn.Server || Request.TimestampsToReturn == TimestampsToReturn.Both )
                {
                    if( dataValue.ServerTimestamp.isNull() )
                    {
                        addError( errorMessage + "ServerTimestamp not set. Requested timestamps: " + TimestampsToReturn.toString( Request.TimestampsToReturn ) + ". Value received: " + dataValue.ServerTimestamp.toString() );
                        bSucceeded = false;
                    }
                    // check that the timestamp is not older than maxage
                    else
                    {
                        if( Request.MaxAge === 0 )
                        {
                            addLog( "Ignoring age of response because MaxAge is set to zero: " + Request.MaxAge );
                        }
                        else
                        {
                            var serverTime = currentTime.clone();
                            serverTime.addMilliSeconds( g_ServerTimeDiff );
                            // timestamp should not be in the future
                            var msecDiff = serverTime.msecsTo( dataValue.ServerTimestamp );
                            //if( serverTime.msecsTo( dataValue.ServerTimestamp ) > timeTolerenz )
                            if( msecDiff > timeTolerenz )
                            {
                                addError( errorMessage + "ServerTimestamp is in the future: " + dataValue.ServerTimestamp + "; Current time on the server = " + serverTime );
                                bSucceeded = false;
                            }
                            // timestamp should not be to old
                            var msecOldAge =  parseInt( Request.MaxAge ) + parseInt( timeTolerenz );
                            if( dataValue.ServerTimestamp.msecsTo( serverTime ) > msecOldAge )
                            {
                                addError( errorMessage + "ServerTimestamp is too old. MaxAge = " + Request.MaxAge 
                                    + "\nCurrent time on the server = " + serverTime
                                    + "\nServerTimestamp = " + dataValue.ServerTimestamp
                                    + "\nAge of ServerTimestamp = " + dataValue.ServerTimestamp.msecsTo( serverTime ) );
                                bSucceeded = false;
                            }
                        }
                    }
                }
                else
                {
                    if( !dataValue.ServerTimestamp.isNull() )
                    {
                        addWarning( errorMessage + "ServerTimestamp is set for Results[" + i + "] but wasn't requested. Requested TimestampsToReturn: '" + TimestampsToReturn.toString( Request.TimestampsToReturn ) + "'. Timestamp received: " + dataValue.ServerTimestamp );
                    }
                }
            }
        }
    }
    return bSucceeded;
}

function checkReadValidParameterArray( Request, Response )
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
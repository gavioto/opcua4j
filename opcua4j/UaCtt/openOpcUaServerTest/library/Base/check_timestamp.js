include( "./library/Base/connect.js" );
include( "./library/Base/disconnect.js" );
var g_ServerTimeDiff = null;

// get the timeDifference between client and server and write the result into g_ServerTimeDiff
function getServerTimeDiff( session )
{
    // check the settings to see if we should even check the time
    if( readSetting( "/Server Test/Time Synchronization Checking" ).toString() == "0" )
    {
        print( "** Skipping time synchronization check." );
        return;
    }

    var result = true;

    var sessionCreated = false;
    if( session === undefined || session === null )
    {
        // connect to the server 
        print( "\nTemporarily creating a channel/session to Server so as to read the time on the Server." );
        var getTimeDiff_channel = new UaChannel();
        session = new UaSession( getTimeDiff_channel );
        connect( getTimeDiff_channel, session );
        sessionCreated = true;
    }

    // read the time
    var readRequest = new UaReadRequest();
    var readResponse = new UaReadResponse();
    session.buildRequestHeader( readRequest.RequestHeader );

    readRequest.MaxAge = 0;
    readRequest.TimestampsToReturn = TimestampsToReturn.Both;
    readRequest.NodesToRead[0].NodeId = new UaNodeId( Identifier.Server_ServerStatus_CurrentTime , 0 );
    readRequest.NodesToRead[0].AttributeId = Attribute.Value;
    var uaStatus = session.read( readRequest, readResponse );

    var ClientTime = UaDateTime.utcNow();

    // check result
    if( uaStatus.isNotGood() )
    {
        addError( "Read() status " + uaStatus, uaStatus );
        result = false;
    }
    else
    {
        // make sure we have some results to work with
        if( AssertGreaterThan( 0, readResponse.Results.length, "Expected to receive a value when calling Read() to obtain the UA Servers' current time." ) )
        {
            // make sure the value is good
            if( AssertTrue( readResponse.Results[0].StatusCode.isGood(), "Expected the Read() call to return a GOOD quality statusCode when requesting the Server's time node (NodeId: " + readRequest.NodesToRead[0].NodeId + ")." ) )
            {
                g_ServerTimeDiff = ClientTime.msecsTo( readResponse.Results[0].Value.toDateTime() );
                print( "ActivateSession complete, checking the clock times on Server and Client:" );
                print( "\tCurrent time on server = " + readResponse.Results[0].Value.toDateTime() );
                print( "\tCurrent time on client = " + ClientTime );
                print( "\tDifference between server and client time = " + g_ServerTimeDiff + "ms. Slight differences (+/- 20ms) can be expected here due to the timing of making the call." );
            }
        }
    }
    // clean-up
    if( sessionCreated )
    {
        // disconnect from server
        print( "\nDisconnecting the temporary channel/session used for reading the Server's time." );
        disconnect( getTimeDiff_channel, session );
        getTimeDiff_channel = null;
    }
    ClientTime = null;
    uaStatus = null;
    readResponse = null;
    readRequest = null;
    // exit
    return( result )
}

/* check if ServerTimeStamp is appropriate i.e. within the tolerance
    Revision History: 
        7-Mar-2011 NP: No longer using Assertion which can cause a FAIL. The timestamps in the headers are purely for 
                       Diagnostics purposes only. The information in this function is purely for determining a problem
                       with latency between the CTT and the Server being tested. MANTIS 1449.
*/
function validateTimestamp( ServerTimeStamp, ClientTime, millesecTolerance, logAsWarning, suppressMessaging )
{
    //print( "validateTimestamp:\n\tServerTimeStamp = " + ServerTimeStamp + "\n\tClientTime: " + ClientTime + "\n\tmillisecTolerance: " + millesecTolerance + "\n\tlogAsWarning: " + logAsWarning );
    if ( g_ServerTimeDiff !== null )
    {
        //  the difference in ms between the current time on the client machine and the ServerTimeStamp
        var timediff = ServerTimeStamp.msecsTo( ClientTime );
        timediff += g_ServerTimeDiff;

        if( logAsWarning === undefined || logAsWarning === null ){ logAsWarning = false; }
        //return AssertInRange( -millesecTolerance, millesecTolerance, timediff, ("Timestamp received differs from the server time by more than " + millesecTolerance + "ms."), logAsWarning );
        if( timediff >= -millesecTolerance && timediff <= millesecTolerance )
        {
            if( suppressMessaging === undefined || suppressMessaging == false ) print( "Timestamp received (indicates a delay of " + timediff + " ms) is within our tolerance range of " + millesecTolerance + "ms." );
        }
        else
        {
            if( suppressMessaging === undefined || suppressMessaging == false ) addLog( "Timestamp received (indicates a delay of " + timediff + " ms) exceeds the allowed tolerence by more than " + millesecTolerance + "ms." );
        }
    }
    return true;
}
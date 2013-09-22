/*  Test 5.8.1 Error Test 11; prepared by Development; compliance@opcfoundation.org

    Description:
        Specifies a null nodes array for reading.

    Revision History
        24-Aug-2009 Dev: Initial version.
        11-Nov-2009 NP : REVIEWED.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581Err011()
{
    var readReq = new UaReadRequest();
    var readRes = new UaReadResponse();

    g_session.buildRequestHeader( readReq.RequestHeader );
    readReq.RequestHeader.ReturnDiagnostics = 0x03FF;

    readReq.MaxAge = 100;
    readReq.TimestampsToReturn = TimestampsToReturn.None;

    addLog( "Reading without specifying any items..." );
    uaStatus = g_session.read( readReq, readRes );
    if( uaStatus.isGood() )
    {
        var ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );   
        checkReadFailed( readReq, readRes, ExpectedServiceResult );
    }
    else
    {
        addError( "Read(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( read581Err011 );
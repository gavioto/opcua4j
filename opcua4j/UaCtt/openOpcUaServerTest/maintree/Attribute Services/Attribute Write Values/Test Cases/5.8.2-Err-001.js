/*  Test 5.8.2 Error Test 2; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        nodesToWrite array empty
        expected service result = BadNothingToDo.

    Revision History
        24-Aug-2009 NP: Initial version.
        16-Nov-2009 NP: REVIEWED.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582Err001()
{
    var writeReq = new UaWriteRequest();
    var writeRes = new UaWriteResponse();

    g_session.buildRequestHeader( writeReq.RequestHeader );
    writeReq.RequestHeader.ReturnDiagnostics = 0x03FF;

    uaStatus = g_session.write( writeReq, writeRes );

    // check result
    if(uaStatus.isGood())
    {
        var ExpectedServiceResult = new  ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
        checkWriteFailed( writeReq, writeRes, ExpectedServiceResult );
    }
    else
    {
        addError( "Write(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( write582Err001 );
/*  Test 5.8.1 Error Test 5; prepared by Development; compliance@opcfoundation.org

    Description:
        Read a valid attribute from a node id with invalid syntax:
        1.    String Id: Empty/null
        2.    Byte Id: Empty/null
        3.    Byte Id: Huge payload of bytes, e.g. 4096kb.

    Revision History
        24-Aug-2009 Dev: Initial version.
        11-Nov-2009 NP : REVIEWED.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581Err005()
{
    var readReq = new UaReadRequest();
    var readRes = new UaReadResponse();
    g_session.buildRequestHeader( readReq.RequestHeader );

    readReq.MaxAge = 100;
    readReq.TimestampsToReturn = TimestampsToReturn.None;

    readReq.NodesToRead[0].NodeId = new UaNodeId( "", 0 );
    readReq.NodesToRead[0].AttributeId = Attribute.BrowseName;

    addLog( "Reading invalid NodeId: '" + readReq.NodesToRead[0].NodeId + "'; Attribute: BrowseName" );

    uaStatus = g_session.read( readReq, readRes );

    // check result
    if( uaStatus.isGood() )
    {
        // this is an array of ExpectedAndAcceptedResult. Size of the array = number of nodes to read
        var ExpectedOperationResultsArray = new Array(1);
        ExpectedOperationResultsArray[0] = new ExpectedAndAcceptedResults( StatusCode.BadNodeIdInvalid );
        ExpectedOperationResultsArray[0].addExpectedResult( StatusCode.BadNodeIdUnknown );
        checkReadError( readReq, readRes, ExpectedOperationResultsArray );
    }
    else
    {
        addError( "Read(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( read581Err005 );
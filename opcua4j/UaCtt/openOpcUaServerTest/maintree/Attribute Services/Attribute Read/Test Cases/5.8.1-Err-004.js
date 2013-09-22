/*  Test 5.8.1 Error Test 4; prepared by Development; compliance@opcfoundation.org

    Description:
         Read a valid attribute from a non-existent node.

    Revision History
        24-Aug-2009 Dev: Initial version.
        11-Nov-2009 NP : REVIEWED.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581Err004()
{
    const NODESETTING = "/Advanced/NodeIds/Invalid/InvalidNodeId1";
    var readReq = new UaReadRequest();
    var readRes = new UaReadResponse();
    g_session.buildRequestHeader( readReq.RequestHeader );

    readReq.MaxAge = 100;
    readReq.TimestampsToReturn = TimestampsToReturn.None;

    readReq.NodesToRead[0].NodeId = UaNodeId.fromString( readSetting( NODESETTING ).toString() );
    readReq.NodesToRead[0].AttributeId = Attribute.BrowseName;

    addLog( "Reading invalid NodeId: '" + readReq.NodesToRead[0].NodeId + "' (setting: '" + NODESETTING + "')" );
    uaStatus = g_session.read( readReq, readRes );

    // check result
    if( uaStatus.isGood() )
    {
        // this is an array of ExpectedAndAcceptedResult. Size of the array = number of nodes to read
        var ExpectedOperationResultsArray = [ new ExpectedAndAcceptedResults( StatusCode.BadNodeIdUnknown, StatusCode.BadNodeIdInvalid ) ];
        checkReadError( readReq, readRes, ExpectedOperationResultsArray );
    }
    else
    {
        addError( "Read(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( read581Err004 );
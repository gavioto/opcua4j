/*  Test 5.8.1 Error Test 6; prepared by Mark Rice; mrice@canarylabs.com

    Description:
        Read a valid attribute from a node id with invalid
        syntax: Byte Id: Empty/null.

    Revision History
        11-Sep-2009 MR: Initial version.
        11-Nov-2009 NP: REVIEWED.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581Err006()
{
    var readReq = new UaReadRequest();
    var readRes = new UaReadResponse();
    g_session.buildRequestHeader( readReq.RequestHeader );

    readReq.MaxAge = 10000;
    readReq.TimestampsToReturn = TimestampsToReturn.Both;

    // Request a NodeId that is an empty/null byte string
    var bs = new UaByteString();
    bs.setUtf8FromString( "" );
    var nId = new UaNodeId();
    nId.setIdentifierOpaque( bs );
    readReq.NodesToRead[0].NodeId = nId;
    readReq.NodesToRead[0].AttributeId = Attribute.Value;

    // return diagnostics
    readReq.RequestHeader.ReturnDiagnostics = 0x03FF;

    addLog( "Reading invalid NodeId: '" + readReq.NodesToRead[0].NodeId + "'" );
    uaStatus = g_session.read( readReq, readRes );

    // check result
    if( uaStatus.isGood() )
    {
        // this is an array of ExpectedAndAcceptedResult. Size of the array = number of nodes to read
        var ExpectedOperationResultsArray = new Array(1);
        ExpectedOperationResultsArray[0] = new ExpectedAndAcceptedResults();
        ExpectedOperationResultsArray[0].addExpectedResult( StatusCode.BadNodeIdInvalid );
        ExpectedOperationResultsArray[0].addExpectedResult( StatusCode.BadNodeIdUnknown );

        checkReadError( readReq, readRes, ExpectedOperationResultsArray );
    }
    else
    {
        addError( "Read(); status " + uaStatus, uaStatus );
    }
}

safelyInvoke( read581Err006 );
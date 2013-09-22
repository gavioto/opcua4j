/*  Test 5.8.1 Error Test 2; prepared by Development; compliance@opcfoundation.org

    Description:
        Read multiple valid attributes and one invalid attribute from the same node

    Revision History
        24-Aug-2009 Dev: Initial version.
        11-Nov-2009 NP : REVIEWED.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581Err002()
{
    const VARIABLE_NODE = "/Server Test/NodeIds/NodeClasses/Variable";
    var nodeId = UaNodeId.fromString( readSetting( VARIABLE_NODE ).toString() );
    if( nodeId == null || nodeId == undefined )
    {
        addWarning( "Setting '" + VARIABLE_NODE + "'." );
        return;
    }

    var readReq = new UaReadRequest();
    var readRes = new UaReadResponse();
    g_session.buildRequestHeader( readReq.RequestHeader );

    readReq.MaxAge = 100;
    readReq.TimestampsToReturn = TimestampsToReturn.None;
    readReq.RequestHeader.ReturnDiagnostics = 0x03FF;

    readReq.NodesToRead[0].NodeId = nodeId;
    readReq.NodesToRead[0].AttributeId = Attribute.AccessLevel;
    readReq.NodesToRead[1].NodeId = nodeId;
    readReq.NodesToRead[1].AttributeId = Attribute.BrowseName;
    readReq.NodesToRead[2].NodeId = nodeId;
    readReq.NodesToRead[2].AttributeId = Attribute.DataType;
    readReq.NodesToRead[3].NodeId = nodeId;
    readReq.NodesToRead[3].AttributeId = Attribute.DisplayName;
    readReq.NodesToRead[4].NodeId = nodeId;
    readReq.NodesToRead[4].AttributeId = ATTRIBUTE_READ_INVALIDATTRIBUTEID;

    addLog( "Reading node '" + nodeId + "' (setting: '" + VARIABLE_NODE + "') attributes: AccessLevel, BrowseName, DataType, DisplayName and one invalid attribute of '" + ATTRIBUTE_READ_INVALIDATTRIBUTEID + "'" );
    uaStatus = g_session.read( readReq, readRes );

    // check result
    if( uaStatus.isGood() )
    {    
        // this is an array of ExpectedAndAcceptedResult. Size of the array = number of nodes to read
        var ExpectedOperationResultsArray = new Array(5);
        ExpectedOperationResultsArray[0] = new ExpectedAndAcceptedResults( StatusCode.Good );
        ExpectedOperationResultsArray[1] = new ExpectedAndAcceptedResults( StatusCode.Good );
        ExpectedOperationResultsArray[2] = new ExpectedAndAcceptedResults( StatusCode.Good );
        ExpectedOperationResultsArray[3] = new ExpectedAndAcceptedResults( StatusCode.Good );
        ExpectedOperationResultsArray[4] = new ExpectedAndAcceptedResults( StatusCode.BadAttributeIdInvalid );

        checkReadError( readReq, readRes, ExpectedOperationResultsArray );
    }
    else
    {
        addError( "Read(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( read581Err002 );
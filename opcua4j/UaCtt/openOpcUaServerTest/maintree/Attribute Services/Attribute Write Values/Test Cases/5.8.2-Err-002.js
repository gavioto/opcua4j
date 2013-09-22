/*  Test 5.8.2 Error Test 2; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to a single valid attribute for an invalid node.

    Revision History
        25-Sep-2009 NP: Initial version.
        16-Nov-2009 NP: REVIEWED.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582Err002()
{
    const INVALIDNODESETTING = "/Advanced/NodeIds/Invalid/UnknownNodeId1";

    var writeReq = new UaWriteRequest();
    var writeRes = new UaWriteResponse();
    g_session.buildRequestHeader(writeReq.RequestHeader);

    writeReq.NodesToWrite[0].NodeId = UaNodeId.fromString( readSetting( INVALIDNODESETTING ).toString() );
    writeReq.NodesToWrite[0].AttributeId = Attribute.Value;
    writeReq.NodesToWrite[0].Value.Value = new UaVariant();
    writeReq.NodesToWrite[0].Value.Value.setDouble( 13.523 );

    var uaStatus = g_session.write( writeReq, writeRes );

    // check result
    if( uaStatus.isGood() )
    {
        var errorsExpected = [];
        errorsExpected[0] = new ExpectedAndAcceptedResults( StatusCode.BadNodeIdInvalid );
        errorsExpected[0].addExpectedResult( StatusCode.BadNodeIdUnknown );
        checkWriteError( writeReq, writeRes, errorsExpected, false, [INVALIDNODESETTING], OPTIONAL_CONFORMANCEUNIT );
    }
    else
    {
        addError( "Write(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( write582Err002 );
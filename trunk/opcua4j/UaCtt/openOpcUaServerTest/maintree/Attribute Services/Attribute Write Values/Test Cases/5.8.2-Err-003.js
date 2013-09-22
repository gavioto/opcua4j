/*  Test 5.8.2 Error Test 3; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to a single valid attribute for an invalid node.
        Operation level result is “Bad_NodeIdInvalid” or “Bad_NodeIdUnknown”.

    Revision History
        25-Sep-2009 NP: Initial version.
        16-Nov-2009 NP: REVIEWED.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582Err006()
{
    var invalidNodeNames = NodeIdSettings.InvalidNodeIds();

    var writeReq = new UaWriteRequest();
    var writeRes = new UaWriteResponse();
    g_session.buildRequestHeader(writeReq.RequestHeader);

    var errorsExpected = new Array();
    for( var i=0; i<invalidNodeNames.length; i++ )
    {
        writeReq.NodesToWrite[i].NodeId = UaNodeId.fromString( readSetting( invalidNodeNames[i] ).toString() );
        writeReq.NodesToWrite[i].AttributeId = Attribute.Value;
        writeReq.NodesToWrite[i].Value.Value = new UaVariant();
        writeReq.NodesToWrite[i].Value.Value.setDouble( 13.523 );

        errorsExpected[i] = new ExpectedAndAcceptedResults( StatusCode.BadNodeIdInvalid );
        errorsExpected[i].addExpectedResult( StatusCode.BadNodeIdUnknown );
    }

    addLog( "Writing to: " + invalidNodeNames[i] );
    uaStatus = g_session.write( writeReq, writeRes );
    if( uaStatus.isGood() )
    {
        checkWriteError( writeReq, writeRes, errorsExpected, false, invalidNodeNames, OPTIONAL_CONFORMANCEUNIT );
    }
    else
    {
        addError( "Write(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( write582Err006 );
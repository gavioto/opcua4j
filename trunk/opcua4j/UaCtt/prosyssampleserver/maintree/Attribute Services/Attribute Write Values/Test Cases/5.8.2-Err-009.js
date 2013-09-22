/*  Test 5.8.2 Error Test 9; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to an invalid attribute of a valid node, multiple times in
        the same call.

    Revision History
        25-Sep-2009 NP: Initial version.
        16-Nov-2009 NP: REVIEWED.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582Err008()
{
    const NODEID_SETTING = "/Server Test/NodeIds/Static/All Profiles/Scalar/NodeId1";
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true );
    if( items == null || items.length == 0 )
    {
        addSkipped( "Static Scalar" );
        return;
    }


    const INVALIDATTRIBUTEID = 0x999;

    var writeReq = new UaWriteRequest()
    var writeRes = new UaWriteResponse()
    g_session.buildRequestHeader( writeReq.RequestHeader )
    
    // prepare our expected error array
    var errorsExpected = new Array();

    // write to the same invalid attribute, 5 times.
    for( var i=0; i<5; i++ )
    {
        // setup the write 
        writeReq.NodesToWrite[i].NodeId = items[0].NodeId;
        writeReq.NodesToWrite[i].AttributeId = INVALIDATTRIBUTEID;
        writeReq.NodesToWrite[i].Value.Value = new UaVariant();
        writeReq.NodesToWrite[i].Value.Value.setDouble( 13.523 );

        // prepare our expected error
        errorsExpected[i] = new ExpectedAndAcceptedResults( StatusCode.BadAttributeIdInvalid );
    }

    uaStatus = g_session.write( writeReq, writeRes );
    if( uaStatus.isGood() )
    {
        checkWriteError( writeReq, writeRes, errorsExpected, false, [NODEID_SETTING], OPTIONAL_CONFORMANCEUNIT );
    }
    else
    {
        addError( "Write(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( write582Err008 );
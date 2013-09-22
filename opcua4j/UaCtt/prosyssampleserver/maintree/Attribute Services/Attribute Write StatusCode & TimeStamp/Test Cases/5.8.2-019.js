/*  Test 5.8.2 Test 19; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to a single valid Node a Value and ServerTimestamp only.
        Expect Good or Bad_WriteNotSupported.

    Revision History:
        26-Sep-2009 NP: Initial version.
        24-Nov-2009 NP: REVIEWED.
        02-Dec-2009 DP: Changed test to use the NodeId stored by initialize.js.
        22-Mar-2010 NP: Revised to meet new test-case requirements.
        24-Jan-2011 NP: Removed allowance for Bad_WriteNotSupported. Doesn't make sense in this CU.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582017()
{
    var writeReq = new UaWriteRequest();
    var writeRes = new UaWriteResponse();
    g_session.buildRequestHeader(writeReq.RequestHeader);

    writeReq.NodesToWrite[0].NodeId = scalarNodes[0].NodeId;
    writeReq.NodesToWrite[0].AttributeId = Attribute.Value;
    InitializeValue( writeReq.NodesToWrite[0].Value.Value, NodeIdSettings.guessType( scalarNodes[0].NodeSetting ) );

    // write the sourceTimestamp only
    writeReq.NodesToWrite[0].Value.ServerTimestamp = UaDateTime.utcNow();

    var uaStatus = g_session.write( writeReq, writeRes );
    if( uaStatus.isGood() )
    {
        //checkWriteValidParameter( writeReq, writeRes, true );
        var expectedOpResult = [];
        expectedOpResult[0] = new ExpectedAndAcceptedResults( StatusCode.Good );
//        expectedOpResult[0].addExpectedResult( StatusCode.BadWriteNotSupported );
        checkWriteError( writeReq, writeRes, expectedOpResult, false, undefined, OPTIONAL_CONFORMANCEUNIT );
        if( writeRes.Results[0].StatusCode === StatusCode.BadWriteNotSupported )
        {
            addNotSupported( "Write VQTT" );
        }
    }
    else
    {
        addError( "Write(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( write582017 );
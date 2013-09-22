/*  Test 5.8.2 Test 10; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to a single valid Node a VTQ by passing the Value and 
        Quality only.

    Revision History
        26-Sep-2009 NP: Initial version.
        16-Nov-2009 NP: Added a verification step.
                        REVIEWED.
        18-Nov-2009 DP: Changed written status code to a value quality code.
                        Clarified failure message.
        26-Nov-2009 DP: Changed service failure expectation to operation failure.
                        Prevented read validation if the write is not Good.
                        Added warning in the case of BadWriteNotSupported.
        02-Dec-2009 DP: Changed initialize.js to store a NodeId that will be 
                        used by all these tests.
                        Changed test to use the NodeId stored by initialize.js.
        20-Apr-2010 DP: Removed addWarning covered by checkWriteError.
        24-Jan-2011 NP: Removed allowance for Bad_WriteNotSupported. Doesn't make sense in this CU.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582010()
{
    const QUALITY_TO_WRITE = StatusCode.GoodOverload;

    var writeReq = new UaWriteRequest();
    var writeRes = new UaWriteResponse();
    g_session.buildRequestHeader( writeReq.RequestHeader );

    writeReq.NodesToWrite[0].NodeId = scalarNodes[0].NodeId;
    writeReq.NodesToWrite[0].AttributeId = Attribute.Value;

    // write the value and quality
    GenerateScalarValue( writeReq.NodesToWrite[0].Value.Value, NodeIdSettings.guessType( scalarNodes[0].NodeSetting ) );
    writeReq.NodesToWrite[0].Value.StatusCode.StatusCode = QUALITY_TO_WRITE;

    addLog( "Writing the Value and Quality only, for NodeId: '" + scalarNodes[0].NodeId + "' (setting: '" + scalarNodes[0].NodeSetting + "')" );
    var uaStatus = g_session.write( writeReq, writeRes );
    if( uaStatus.isGood() )
    {
        var expectedOpResult = [];
        expectedOpResult[0] = new ExpectedAndAcceptedResults( StatusCode.Good );
//        expectedOpResult[0].addExpectedResult( StatusCode.BadWriteNotSupported );
        if( checkWriteError( writeReq, writeRes, expectedOpResult, false, undefined, OPTIONAL_CONFORMANCEUNIT ) )
        {
            if( writeRes.Results[0].StatusCode === StatusCode.Good )
            {
                // read back the vtq to verify
                if( ReadHelper.Execute( scalarNodes[0] ) )
                {
                    AssertEqual( writeReq.NodesToWrite[0].Value.Value,      scalarNodes[0].Value.Value     , "Value was not as written" );
                    AssertEqual( writeReq.NodesToWrite[0].Value.StatusCode, scalarNodes[0].Value.StatusCode, "Quality was not as written" );
                }
            }
        }
    }
    else
    {
        addError( "Write(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( write582010 );
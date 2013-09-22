/*  Test 5.8.2 Test 14; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to a single valid Node a Value only.
        Do not specify a StatusCode or any Timestamps.

    Revision History
        26-Sep-2009 NP: Initial version.
        16-Nov-2009 NP: Added a verification step.
                        REVIEWED.
        18-Nov-2009 DP: Changed written status code to a value quality code.
                        Clarified failure message.
        26-Nov-2009 DP: Prevented read validation if the write is not Good.  
                        Added warning in the case of BadWriteNotSupported.
        02-Dec-2009 DP: Changed test to use the NodeId stored by initialize.js.
        22-Mar-2010 NP: Revised to meet new test-case requirements.
        27-Apr-2010 NP: Improved output to show NodeId/Setting for reads/writes.
        24-Jan-2011 NP: Removed allowance for Bad_WriteNotSupported. Doesn't make sense in this CU.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582014()
{
    var writeReq = new UaWriteRequest();
    var writeRes = new UaWriteResponse();
    g_session.buildRequestHeader( writeReq.RequestHeader );

    writeReq.NodesToWrite[0].NodeId = scalarNodes[0].NodeId;
    writeReq.NodesToWrite[0].AttributeId = Attribute.Value;
    InitializeValue( writeReq.NodesToWrite[0].Value.Value, NodeIdSettings.guessType( scalarNodes[0].NodeSetting ) );

    addLog( "Writing to NodeId: '" + scalarNodes[0].NodeId + "' (setting'" + scalarNodes[0].NodeSetting + "'); Value: '" + writeReq.NodesToWrite[0].Value.Value.toString() + "'" );
    var uaStatus = g_session.write( writeReq, writeRes );
    if( uaStatus.isGood() )
    {
        //checkWriteValidParameter( writeReq, writeRes, true );
        var expectedOpResult = [];
        expectedOpResult[0] = new ExpectedAndAcceptedResults( StatusCode.Good );
//        expectedOpResult[0].addExpectedResult( StatusCode.BadWriteNotSupported );
        if( checkWriteError( writeReq, writeRes, expectedOpResult, false ) )
        {
            if( writeRes.Results[0].StatusCode === StatusCode.Good )
            {
                // read back the vtq to verify
                if( ReadHelper.Execute( scalarNodes[0] ) )
                {
                    AssertEqual( writeReq.NodesToWrite[0].Value.StatusCode, scalarNodes[0].Value.StatusCode, "Quality was not as written" );
                }
            }
            else if( writeRes.Results[0].StatusCode === StatusCode.BadWriteNotSupported )
            {
                addNotSupported( "Write VQTT" );
            }
            else
            {
                addError( "Write result: " + writeRes.Results[0].StatusCode, writeRes.Results[0].StatusCode );
            }
        }
    }
    else
    {
        addError( "Write(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( write582014 );
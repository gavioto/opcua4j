/*  Test 5.8.2 Test 11; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to a single valid Node a VTQ by passing the Value,  
        Quality and sourceTimestamp.

    Revision History
        26-Sep-2009 NP: Initial version.
        16-Nov-2009 NP: Added a verification step.
                        REVIEWED.
        18-Nov-2009 DP: Changed written status code to a value quality code.
                        Clarified failure message.
        26-Nov-2009 DP: Prevented read validation if the write is not Good.  
                        Added warning in the case of BadWriteNotSupported.
        02-Dec-2009 DP: Changed test to use the NodeId stored by initialize.js.
        20-Apr-2010 DP: Removed addWarning covered by checkWriteError.
        24-Jan-2011 NP: Removed allowance for Bad_WriteNotSupported. Doesn't make sense in this CU.
        18-Apr-2011 NP: Uses numeric static scalar now. Fixed bug with timestamp/offset using secs instead of msec. (Credit TM)

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582011()
{
    var item = MonitoredItem.fromSetting( NodeIdSettings.GetAScalarNodeIdSetting( NodeIdSettings.ScalarStatic(), "iud" ).name );
    if( item === undefined || item === null )
    {
        addSkipped( "No Numeric Static Scalar Items defined." );
        return;
    }

    const QUALITY_TO_WRITE = StatusCode.GoodClamped;
    var sourceTimeOffset = 5000; // milliseconds (in the future)

    var writeReq = new UaWriteRequest();
    var writeRes = new UaWriteResponse();
    g_session.buildRequestHeader(writeReq.RequestHeader);

    writeReq.NodesToWrite[0].NodeId = item.NodeId;
    writeReq.NodesToWrite[0].AttributeId = Attribute.Value;

    // write the value and quality and source timestamp
    GenerateScalarValue( item.Value.Value, NodeIdSettings.guessType( item.NodeSetting ) );
    writeReq.NodesToWrite[0].Value = item.Value;
    writeReq.NodesToWrite[0].Value.StatusCode.StatusCode = QUALITY_TO_WRITE;
    writeReq.NodesToWrite[0].Value.SourceTimestamp = UaDateTime.utcNow();
    writeReq.NodesToWrite[0].Value.SourceTimestamp.addMilliSeconds(sourceTimeOffset);

    addLog( "Writing the Value, Quality and SourceTimestamp only for NodeId: '" + scalarNodes[0].NodeId + "' (setting: '" + scalarNodes[0].NodeSetting + "')" );
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
                if( ReadHelper.Execute( item ) )
                {
                    AssertEqual( writeReq.NodesToWrite[0].Value.Value,           item.Value.Value          , "Value was not as written" );
                    AssertEqual( writeReq.NodesToWrite[0].Value.StatusCode,      item.Value.StatusCode     , "Quality was not as written" );
                    AssertEqual( writeReq.NodesToWrite[0].Value.SourceTimestamp, item.Value.SourceTimestamp, "Source timestamp was not as written" );
                }
            }
            else if( writeRes.Results[0].StatusCode === StatusCode.BadWriteNotSupported )
            {
                addNotSupported( "Write VQTT" );
            }
        }
    }
    else
    {
        addError( "Write(): status " + uaStatus, uaStatus );
    }
    wait( sourceTimeOffset ); // let the value written move into the past
}

safelyInvoke( write582011 );
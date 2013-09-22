/*  Test 5.8.2 Test 16; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to the Value attribute a Value, StatusCode and TimestampSource,
        but do not specify a TimestampServer.

    Revision History:
        26-Sep-2009 NP: Initial version.
        16-Nov-2009 NP: Added a verification step.
                        REVIEWED.
        18-Nov-2009 DP: Clarified failure message.
        26-Nov-2009 DP: Prevented read validation if the write is not Good.  
                        Added warning in the case of BadWriteNotSupported.
        02-Dec-2009 DP: Changed test to use the NodeId stored by initialize.js.
        22-Mar-2010 NP: Revised to meet new test-case requirements.
        20-Apr-2010 DP: Removed addWarning covered by checkWriteError.
        27-Apr-2010 NP: Revised slightly so as to show the NodeId & setting for items being read/written
        24-Jan-2011 NP: Removed allowance for Bad_WriteNotSupported. Doesn't make sense in this CU.
        18-Apr-2011 NP: Uses numeric static scalar now. Fixed bug with timestamp/offset using secs instead of msec. (Credit TM)

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582016()
{
    var item = MonitoredItem.fromSetting( NodeIdSettings.GetAScalarNodeIdSetting( NodeIdSettings.ScalarStatic(), "iud" ).name );
    if( item === undefined || item === null )
    {
        addSkipped( "No Numeric Static Scalar Items defined." );
        return;
    }

    var writeReq = new UaWriteRequest();
    var writeRes = new UaWriteResponse();
    g_session.buildRequestHeader( writeReq.RequestHeader );

    writeReq.NodesToWrite[0].NodeId = item.NodeId;
    writeReq.NodesToWrite[0].AttributeId = Attribute.Value;

    GenerateScalarValue( item.Value.Value, NodeIdSettings.guessType( item.NodeSetting ) );
    writeReq.NodesToWrite[0].Value = item.Value;

    // also write the quality and sourceTimestamp
    writeReq.NodesToWrite[0].Value.StatusCode.StatusCode = StatusCode.GoodLocalOverride;
    writeReq.NodesToWrite[0].Value.SourceTimestamp = UaDateTime.utcNow();
    
    addLog( "Writing to NodeId: '" + item.NodeId + "' (setting: '" + item.NodeSetting + "'); Value: '" + writeReq.NodesToWrite[0].Value.Value + "'; SourceTimestamp: '" + writeReq.NodesToWrite[0].Value.SourceTimestamp + "'; StatusCode: '" + writeReq.NodesToWrite[0].Value.StatusCode.toString() + "'." );
    
    var uaStatus = g_session.write( writeReq, writeRes );
    if( uaStatus.isGood() )
    {
        var expectedOpResult = [];
        expectedOpResult[0] = new ExpectedAndAcceptedResults( StatusCode.Good );
        if( checkWriteError( writeReq, writeRes, expectedOpResult, false, undefined, OPTIONAL_CONFORMANCEUNIT ) )
        {
            if( writeRes.Results[0].StatusCode === StatusCode.Good )
            {
                // read back the vtq to verify
                addLog( "Write was successful, reading the timestamps to compare the values received vs. those we previously wrote." );
                if( ReadHelper.Execute( item, TimestampsToReturn.Both, 0 ) )
                {
                    AssertEqual( writeReq.NodesToWrite[0].Value.SourceTimestamp, item.Value.SourceTimestamp, "Source timestamp was different?" );
                }
            }
        }
    }
    else
    {
        addError( "Write(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( write582016 );
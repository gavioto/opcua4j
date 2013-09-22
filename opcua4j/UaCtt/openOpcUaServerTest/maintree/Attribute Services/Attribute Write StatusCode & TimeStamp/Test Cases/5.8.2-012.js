/*  Test 5.8.2 Test 12; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to a single valid Node a VTQ by passing the Value,  
        Quality, sourceTimestamp and serverTimestamp.

    Revision History
        26-Sep-2009 NP: Initial version.
        16-Nov-2009 NP: Added a verification step.
                        REVIEWED.
        18-Nov-2009 DP: Changed written status code to a value quality code.
                        Clarified failure message.
        26-Nov-2009 DP: Prevented read validation if the write is not Good.  
                        Added warning in the case of BadWriteNotSupported.
        02-Dec-2009 DP: Changed test to use the NodeId stored by initialize.js.
        24-Jan-2011 NP: Removed allowance for Bad_WriteNotSupported. Doesn't make sense in this CU.
        02-Mar-2011 DP: Replaced excatly-equal validation of ServerTimestamp with a range of time.
                        In the read-back, a server can legitimately return the written 
                        ServerTimestamp, the current time, or any value in between (any time at
                        which the server knows the value is accurate).
        18-Apr-2011 NP: Uses numeric static scalar now. Fixed bug with timestamp/offset using secs instead of msec. (Credit TM)

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582012()
{
    var item = MonitoredItem.fromSetting( NodeIdSettings.GetAScalarNodeIdSetting( NodeIdSettings.ScalarStatic(), "iud" ).name );
    if( item === undefined || item === null )
    {
        addSkipped( "No Numeric Static Scalar Items defined." );
        return;
    }

    const QUALITY_TO_WRITE = StatusCode.GoodLocalOverride;
    var sourceTimeOffset = 5000; // milliseconds (in the past)
    var serverTimeOffset = 6000;

    // create a "blank space" in which it is safe to write values into the past
    // without interference from previous writes
    var waitTime = serverTimeOffset > sourceTimeOffset ? serverTimeOffset : sourceTimeOffset;
    addLog( "Waiting " + waitTime + " msecs before writing..." );
    wait( waitTime );

    var writeReq = new UaWriteRequest();
    var writeRes = new UaWriteResponse();
    g_session.buildRequestHeader( writeReq.RequestHeader );

    writeReq.NodesToWrite[0].NodeId = item.NodeId;
    writeReq.NodesToWrite[0].AttributeId = Attribute.Value;

    // write the value and quality and both timestamps
    GenerateScalarValue( item.Value.Value, NodeIdSettings.guessType( item.NodeSetting ) );
    writeReq.NodesToWrite[0].Value = item.Value;
    writeReq.NodesToWrite[0].Value.StatusCode.StatusCode = QUALITY_TO_WRITE;
    writeReq.NodesToWrite[0].Value.SourceTimestamp = UaDateTime.utcNow();
    writeReq.NodesToWrite[0].Value.SourceTimestamp.addMilliSeconds(-sourceTimeOffset);
    writeReq.NodesToWrite[0].Value.ServerTimestamp = UaDateTime.utcNow();
    writeReq.NodesToWrite[0].Value.ServerTimestamp.addMilliSeconds(-serverTimeOffset);

    addLog( "Writing the Value, Quality, SourceTimestamp and ServerTimestamp to Node: " + item.NodeSetting.toString() +
        "\n\t" + writeReq.NodesToWrite[0].Value.toString() );
    var uaStatus = g_session.write( writeReq, writeRes );
    if( uaStatus.isGood() )
    {
        var expectedOpResult = [];
        expectedOpResult[0] = new ExpectedAndAcceptedResults( StatusCode.Good );
        if( checkWriteError( writeReq, writeRes, expectedOpResult, false, undefined, OPTIONAL_CONFORMANCEUNIT ) )
        {
            if( StatusCode.Good === writeRes.Results[0].StatusCode )
            {
                // read back the vtq to verify
                print( "\tReading back the value to compare to the values previously written." );
                if( ReadHelper.Execute( item ) )
                {
                    AssertEqual( writeReq.NodesToWrite[0].Value.Value,           item.Value.Value          , "Value was not as written" );
                    AssertEqual( writeReq.NodesToWrite[0].Value.StatusCode,      item.Value.StatusCode     , "Quality was not as written" );
                    AssertEqual( writeReq.NodesToWrite[0].Value.SourceTimestamp, item.Value.SourceTimestamp, "Source timestamp was not as written" );
                    var acceptableTimeRange = writeReq.NodesToWrite[0].Value.ServerTimestamp.msecsTo( UaDateTime.utcNow() );
                    var actualTimeRange = writeReq.NodesToWrite[0].Value.ServerTimestamp.msecsTo( item.Value.ServerTimestamp );
                    AssertInRange( 0, acceptableTimeRange, actualTimeRange, "Server timestamp was not within the expected time range" );
                }
            }
        }
    }
    else
    {
        addError( "Write(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( write582012 );
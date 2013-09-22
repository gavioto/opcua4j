/*  Test 5.8.2 Test 13; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to a single valid Node a Value and SourceTimestamp.
        
    Revision History
        26-Sep-2009 NP: Initial version.
        16-Nov-2009 NP: Added a verification step.
                        REVIEWED.
        18-Nov-2009 DP: Clarified failure message.
        26-Nov-2009 DP: Prevented read validation if the write is not Good.  
                        Added warning in the case of BadWriteNotSupported.
        02-Dec-2009 DP: Changed test to use the NodeId stored by initialize.js.
        31-Mar-2010 NP: Fixed to use new library routines for easier settings access.
        20-Apr-2010 DP: Removed addWarning covered by checkWriteError.
        24-Jan-2011 NP: Removed allowance for Bad_WriteNotSupported. Doesn't make sense in this CU.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582013()
{
    var sourceTimeOffset = 5000; // milliseconds (in the future)
    var setting = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    if( setting === undefined || setting === null )
    {
        _dataTypeUnavailable.store( "Static Scalar (numeric)" );
        return;
    }
    var item = MonitoredItem.fromSetting( setting.name, 0 );
    if( item === null )
    {
        addWarning( "Not enough nodes defined. Aborting test." );
        return;
    }
    GenerateScalarValue( item.Value.Value, NodeIdSettings.guessType( item.NodeSetting ) );

    var writeReq = new UaWriteRequest();
    var writeRes = new UaWriteResponse();
    g_session.buildRequestHeader( writeReq.RequestHeader );

    writeReq.NodesToWrite[0].NodeId = item.NodeId;
    writeReq.NodesToWrite[0].AttributeId = Attribute.Value;

    // write the value and sourceTimestamp only
    writeReq.NodesToWrite[0].Value.Value = item.Value.Value;
    writeReq.NodesToWrite[0].Value.SourceTimestamp = UaDateTime.utcNow();
    writeReq.NodesToWrite[0].Value.SourceTimestamp.addHours(1);
    addLog( "Writing to NodeId: '" + item.NodeId + "' (setting: '" + item.NodeSetting + "'); Value = '" + writeReq.NodesToWrite[0].Value.Value + "'; SourceTimestamp: " + writeReq.NodesToWrite[0].Value.SourceTimestamp );
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
                    AssertEqual( writeReq.NodesToWrite[0].Value.Value,           item.Value.Value          , "Value is not as written" );
                    AssertEqual( writeReq.NodesToWrite[0].Value.SourceTimestamp, item.Value.SourceTimestamp, "Source timestamp is not as written" );
                }
            }
        }
    }
    else
    {
        addError( "Write(): status " + uaStatus, uaStatus );
    }
    wait( sourceTimeOffset ); // let the value written move into the past
}

safelyInvoke( write582013 );
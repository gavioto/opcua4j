/*  Test 5.6.4 Test #3, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Cancel a completed call.

        How this test works:
            1. Issue a READ request of a Valid node. The call will complete with success.
            2. Cancel the call to Read.
        
    Revision History
        07-Oct-2009 NP: Initial version.
        24-Nov-2009 NP: REVIEWED/INCORRECT. Can't use Sync API with this service.
        21-May-2010 NP: Renamed from 5.6.4-Err-001.
        27-May-2010 RTD: using checkCancelValidParameter().

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.6.4.
*/

function cancel564003()
{
    var item1 = MonitoredItem.fromSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting("iud").name );
    if( item1 === null )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    // STEP 1: READ
    var readReq = new UaReadRequest();
    var readRes = new UaReadResponse();
    g_session.buildRequestHeader( readReq.RequestHeader );

    readReq.NodesToRead[0].NodeId = item1.NodeId;
    readReq.NodesToRead[0].AttributeId = Attribute.Value;

    uaStatus = g_session.read( readReq, readRes );
    if( uaStatus.isGood() )
    {
        checkReadValidParameter( readReq, readRes );
        print( "Value[0]   = " + readRes.Results[0].Value );
        print( "Quality[0] = " + readRes.Results[0].StatusCode );
        print( "TimeSrc[0] = " + readRes.Results[0].SourceTimestamp );
        print( "TimeSvr[0] = " + readRes.Results[0].ServerTimestamp );
    }
    else
    {
        addError( "Read() status " + uaStatus, uaStatus );
    }

    var readRequestHandle = readReq.RequestHeader.RequestHandle;


    // STEP 2: CALL CANCEL
    var cancelRequest = new UaCancelRequest();
    var cancelResponse = new UaCancelResponse();
    g_session.buildRequestHeader( cancelRequest.RequestHeader );
    cancelRequest.RequestHandle = readRequestHandle;

    uaStatus = g_session.cancel( cancelRequest, cancelResponse );
    if( uaStatus.isGood() )
    {
        checkCancelValidParameter( cancelRequest, cancelResponse );
        // make sure cancelCount is zero
        print( "\nCall was successful. Result is: " + cancelResponse.ResponseHeader.ServiceResult + 
            "\n\tCancelCount is: " + cancelResponse.CancelCount );
        AssertEqual( 0, cancelResponse.CancelCount, "Expected CancelCount to return ZERO (0)." );
    }
    else
    {
        addError( "Cancel() status " + uaStatus, uaStatus );
    }
}

safelyInvoke( cancel564003 );
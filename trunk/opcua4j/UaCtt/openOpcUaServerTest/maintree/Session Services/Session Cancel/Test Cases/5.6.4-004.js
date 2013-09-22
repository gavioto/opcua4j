/*  Test 5.6.4 Test #4, prepared by Development; compliance@opcfoundation.org

    Description:
        Call cancel with an unknown request handle
        
    Revision History
        28-Aug-2008 DEV: Initial version
        24-Nov-2009 NP: REVIEWED/INCORRECT. Can't use Sync API with this service.
        21-May-2010 NP: Renamed from 5.6.4-Error-002.
        27-May-2010 RTD: using checkCancelValidParameter().
        10-Dec-2010 NP: Allowed for Bad_ServiceNotSupported.
*/

function cancel564004()
{
    var cancelRequest = new UaCancelRequest();
    var cancelResponse = new UaCancelResponse();
    g_session.buildRequestHeader( cancelRequest.RequestHeader );
    cancelRequest.RequestHandle = 0x1234;

    uaStatus = g_session.cancel( cancelRequest, cancelResponse );
    if( uaStatus.isGood() )
    {
        checkCancelValidParameter( cancelRequest, cancelResponse );
        // make sure cancelCount is zero
        print( "\nCANCEL Call was successful. Result is: " + cancelResponse.ResponseHeader.ServiceResult + 
            "\n\tCancelCount is: " + cancelResponse.CancelCount );
        AssertEqual( 0, cancelResponse.CancelCount, "Expected CancelCount to return ZERO (0)." );
    }
    else
    {
        // is the service supported?
        if( cancelResponse.ResponseHeader.ServiceResult.StatusCode === StatusCode.BadServiceUnsupported )
        {
            addNotSupported( "Cancel" );
        }
        else
        {
            addError( "Cancel() status " + uaStatus, uaStatus );
        }
    }
}

safelyInvoke( cancel564004 );
/*  Test 5.9.3 Error Test 1 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script modifies monitor mode with an unknown monitoredItemId.

    Revision History
        05-Oct-2009 AT: Initial version.
        18-Nov-2009 NP: REVIEWED.
*/

function setMonitoring593Err001()
{
    // subscription is created and deleted in initialize and cleanup scripts
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
    }
    else
    {
        // No need to create monitored item for this test
        // set the monitoringmode to disabled for one valid item
        var setMonitoringModeRequest = new UaSetMonitoringModeRequest ();
        var setMonitoringModeResponse = new UaSetMonitoringModeResponse();
        g_session.buildRequestHeader( setMonitoringModeRequest.RequestHeader );

        setMonitoringModeRequest.MonitoringMode = MonitoringMode.Disabled;
        setMonitoringModeRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
        setMonitoringModeRequest.MonitoredItemIds[0] = -1;

        uaStatus = g_session.setMonitoringMode( setMonitoringModeRequest, setMonitoringModeResponse );
        if(uaStatus.isGood())
        {
            var ExpectedOperationResultArray = [];
            ExpectedOperationResultArray[0] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );
            checkSetMonitoringModeError ( setMonitoringModeRequest, setMonitoringModeResponse, ExpectedOperationResultArray );
        }
        else
        {
            addError( "SetMonitoringMode() status " + uaStatus, uaStatus );
        }
    }
}

safelyInvoke( setMonitoring593Err001 );
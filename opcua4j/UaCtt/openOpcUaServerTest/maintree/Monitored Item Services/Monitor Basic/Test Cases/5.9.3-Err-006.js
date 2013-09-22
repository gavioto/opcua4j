/*    Test 5.9.3 Error Test 6 prepared by Anand Taparia; ataparia@kepware.com
      Description:
          Script specifies empty monitoredItemIds array.

      Revision History
        Sep-26-2009 AT: Initial version.
        Nov-18-2009 NP: REVIEWED.
*/

function setMonitoringMode593Err006()
{
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
    }
    else
    {
        // No need to create monitor items since we will be using empty monitoritemids array anyway
        // Set the monitoringmode
        var setMonitoringModeRequest = new UaSetMonitoringModeRequest ();
        var setMonitoringModeResponse = new UaSetMonitoringModeResponse();
        g_session.buildRequestHeader( setMonitoringModeRequest.RequestHeader );

        setMonitoringModeRequest.MonitoringMode = MonitoringMode.Disabled;
        setMonitoringModeRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;

        //  Empty MonitoredItemIds!
        uaStatus = g_session.setMonitoringMode( setMonitoringModeRequest, setMonitoringModeResponse );
        if( uaStatus.isGood() )
        {
            var ExpectedOperationResult = new ExpectedAndAcceptedResults( StatusCode.BadNothingToDo );
            checkSetMonitoringModeFailed( setMonitoringModeRequest, setMonitoringModeResponse, ExpectedOperationResult );
        }
        else
        {
            addError("SetMonitoringMode() status " + uaStatus, uaStatus);
        }
    }
}

safelyInvoke( setMonitoringMode593Err006 );
/*    Test 5.9.3 Error Test 2 prepared by Anand Taparia; ataparia@kepware.com
      Description:
          Script specifies multiple invalid monitoredItemIds.
          Expected results are Bad_MonitoredItemIdInvalid for all invalid items.

        Revision History
            Sep-24-2009 AT: Initial version.
            18-Nov-2009 NP: REVIEWED.
*/

function setMonitoringMode593Err002()
{
    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
    }
    else
    {
        // No need to create monitor items since we will be using invalid monitoritemids anyway
        // Set the monitoringmode
        var setMonitoringModeRequest = new UaSetMonitoringModeRequest ();
        var setMonitoringModeResponse = new UaSetMonitoringModeResponse();
        g_session.buildRequestHeader( setMonitoringModeRequest.RequestHeader );

        setMonitoringModeRequest.MonitoringMode = MonitoringMode.Disabled;
        setMonitoringModeRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;

        //  Invalid MonitoredItemIds
        setMonitoringModeRequest.MonitoredItemIds[0] = 0x1234;
        setMonitoringModeRequest.MonitoredItemIds[1] = 0x1235;
        setMonitoringModeRequest.MonitoredItemIds[2] = 0x1236;
        setMonitoringModeRequest.MonitoredItemIds[3] = 0x1237;

        uaStatus = g_session.setMonitoringMode( setMonitoringModeRequest, setMonitoringModeResponse );
        if( uaStatus.isGood() )
        {
            // this is an array of ExpectedAndAcceptedResult. Size of the array = number of nodes to readSetting
            var ExpectedOperationResultsArray = [];
            ExpectedOperationResultsArray[0] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );
            ExpectedOperationResultsArray[1] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );
            ExpectedOperationResultsArray[2] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );
            ExpectedOperationResultsArray[3] = new ExpectedAndAcceptedResults( StatusCode.BadMonitoredItemIdInvalid );

            checkSetMonitoringModeError( setMonitoringModeRequest, setMonitoringModeResponse, ExpectedOperationResultsArray );
        }
        else
        {
            addError( "SetMonitoringMode() status " + uaStatus, uaStatus);
        }
    }
}

safelyInvoke( setMonitoringMode593Err002 );
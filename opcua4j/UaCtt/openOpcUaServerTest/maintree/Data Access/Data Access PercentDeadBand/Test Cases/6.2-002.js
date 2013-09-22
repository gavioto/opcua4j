/*  Test 6.2 Test 2 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script specifies MonitoringMode = Sampling, Filter = PercentDeadband, 
        DeadbandValue = 0. Calls Publish.
        Expected Result: ServiceResult/OperationResults: Good
            - On publish no datachange notification should be received.

    Revision History
            12-Oct-2009 AT: Initial Version
            16-Nov-2009 NP: REVIEWED/INCONCLUSIVE. Server returns BadFilterNotAllowed.
            26-Nov-2009 DP: Changed test to use a node that's valid for PercentDeadbands.
                            Script still needs more work as PercentDeadband does not work
                            the way it is tested here (see spec Part 8).
            10-Dec-2009 NP: Revised to use new library test-script for testing deadbands.
             1-Apr-2010 DP: Flag as not supported if no AnalogItem settings have been configured.
*/

/*globals addNotSupported, ArrayToFormattedString, CreateMonitoredItemDeadbandPercent_VerifyWithPublish,
  MonitorBasicSubscription, MonitoredItem, MonitoringMode, NodeIdSettings, PublishHelper, ReadHelper,
  safelyInvoke, WriteHelper
*/

function createMonitoredItems612002()
{
    var settings = NodeIdSettings.DAStaticAnalog();
    var item = MonitoredItem.fromSettings( settings, 0 )[0];
    if( item === undefined )
    {
        addSkipped( "Static Analog" );
        return;
    }

    const DEADBANDVALUE = 0;
    const QUEUESIZE = 1;

    // before we do the test, read the analogType so that we can figure out
    // the data-type of the node. We'll need this information so that we can
    // properly specify the value that we'll WRITE to when seeing if the deadband
    // filters the write or not.
    if( ReadHelper.Execute( item ) )
    {
        CreateMonitoredItemDeadbandPercent_VerifyWithPublish( 
            item.NodeSetting, MonitoringMode.Sampling, DEADBANDVALUE, MonitorBasicSubscription,
            PublishHelper, WriteHelper, item.Value.Value.DataType, QUEUESIZE );
    }
    PublishHelper.Clear();
}

safelyInvoke( createMonitoredItems612002 );
/*  Test 6.2 Test 1 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Creates a Disabled monitoredItem with a deadbandPercent=0.

    Revision History
        9-Dec-2009 NP: Initial version.
        1-Apr-2010 DP: Flag as not supported if no AnalogItem settings have been configured.
*/

/*globals addNotSupported, ArrayToFormattedString, CreateMonitoredItemDeadbandPercent_VerifyWithPublish,
  MonitorBasicSubscription, MonitoredItem, MonitoringMode, NodeIdSettings, PublishHelper, ReadHelper,
  safelyInvoke, WriteHelper
*/

function createMonitoredItems612001()
{
    var settings = NodeIdSettings.DAStaticAnalog();
    var item = MonitoredItem.fromSettings( settings, 0 )[0];
    if( item === undefined )
    {
        addSkipped( "Static Analog" );
        return;
    }

    const DEADBANDVALUE = 0;
    const QUEUESIZE = 0;

    // before we do the test, read the analogType so that we can figure out
    // the data-type of the node. We'll need this information so that we can
    // properly specify the value that we'll WRITE to when seeing if the deadband
    // filters the write or not.
    if( ReadHelper.Execute( item ) )
    {
        CreateMonitoredItemDeadbandPercent_VerifyWithPublish(
            item.NodeSetting, MonitoringMode.Disabled, DEADBANDVALUE, MonitorBasicSubscription,
            PublishHelper, WriteHelper, item.Value.Value.DataType, QUEUESIZE );
    }
    PublishHelper.Clear();
}

safelyInvoke( createMonitoredItems612001 );
/*  Test 5.10.1 Test 18, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Create 2 subscriptions per session.
        Create 2 sessions.

    Revision History
        02-Sep-2009 NP: Initial version.
        17-Nov-2009 NP: REVIEWED.
*/

function session5101018()
{
    const SESSIONCOUNT = 2;
    const SUBSCRIPTIONCOUNT = 2;

    var monitoredItem = MonitoredItem.fromSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" ).name );
    if( monitoredItem === undefined || monitoredItem === null )
    {
        return;
    }

    MultiSessionMultiSubscribeTest( g_channel, SESSIONCOUNT, SUBSCRIPTIONCOUNT, monitoredItem );
}

safelyInvoke( session5101018 );
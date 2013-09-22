// Objects
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/Objects/integerSet.js" );
// utility functions
include( "./library/Base/connect.js" );
include( "./library/Base/disconnect.js" );
include( "./library/Base/safeInvoke.js" );
include( "./library/Base/check_timestamp.js" );
include( "./library/Base/assertions.js" );
include( "./library/Base/SettingsUtilities/validate_setting.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
// include all library scripts specific to:
// Write
include( "./library/ServiceBased/AttributeServiceSet/Write/write.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write_attribute.js" );
// CreateSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
// DeleteSubscriptions
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
// ModifySubscription
include( "./library/ServiceBased/SubscriptionServiceSet/ModifySubscription/modifySubscription.js" );
// CreateMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
// DeleteMonitoredItems
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );
// SetMonitoringMode
include( "./library/ServiceBased/MonitoredItemServiceSet/SetMonitoringMode/check_setMonitoringMode_failed.js" );
// TransferSubscription
include( "./library/ServiceBased/SubscriptionServiceSet/TransferSubscriptions/transferSubscription.js");
include( "./library/ServiceBased/SubscriptionServiceSet/TransferSubscriptions/check_transferSubscription_error.js");
// SetPublishingMode
include( "./library/ServiceBased/SubscriptionServiceSet/SetPublishingMode/setPublishingMode.js" );
// Publish
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/publish.js");
// Republish
include( "./library/ServiceBased/SubscriptionServiceSet/Republish/check_republish_failed.js");
// CloseSession
include( "./library/ServiceBased/SessionServiceSet/CloseSession/closeSession.js");

// Two sessions for this test
var SESSIONCREATECOUNT = 2;

// Create the sessions
var g_session = [];

// Connect to the server
var g_channel = new UaChannel();
if( !connectChannel( g_channel ) || !SubscriptionTransferCreateSessions() )
{
    addError( "Unable to connect to UA Server. Unable to continue tests within this Conformance Unit. Aborting Conformance Unit testing of \"Subscription Transfer\"." );
    stopCurrentUnit();
}


function SubscriptionTransferCreateSessions()
{
    var i;
    var success = true;
    for( i=0; i<SESSIONCREATECOUNT; i++ )
    {
        g_session[i] = new UaSession( g_channel );
        g_session[i].DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );
        if( createSession( g_session[i] ) )
        {
            if( !activateSession( g_session[i] ) )
            {
                success = false;
            }
        }
        else
        {
            break;
            success = false;
        }
    }// for i
    return( success );
}
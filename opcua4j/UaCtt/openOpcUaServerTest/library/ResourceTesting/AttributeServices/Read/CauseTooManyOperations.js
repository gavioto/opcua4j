/*  RESOURCE TESTING;
    prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Establishes a connection to a UA Server.
        Create a single Subscription.
        Creates 1 monitoredItem per line in the CSV file.
        In a loop:
            Read all of the Nodes in a single call.
            Write a new value to all of the Nodes, in a single call.
            Call Publish.
            Some errors may be received in the WRITE call, which is OK.
        Deletes the monitoredItems.
        Deletes the Subscription.
        Closes the connection to the UA Server.

    Revision History
        25-Jan-2011 NP: Initial version.
        26-Jan-2011 MI: Revised to directly invoke UA objects and not use the Wrapper objects with their validation.
*/

const DELAY_BETWEEN_READWRITEPUBLISH = 1; //time is in msec

include( "./library/ResourceTesting/csvFile.js" );
include( "./library/ResourceTesting/repetitiveCall.js" );
include( "./library/Base/Objects/subscription.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write.js" );
include( "./library/ServiceBased/AttributeServiceSet/Write/write_attribute.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/CreateSubscription/createSubscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/DeleteSubscription/deleteSubscription.js" );
include( "./library/ServiceBased/SubscriptionServiceSet/Publish/publish.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/CreateMonitoredItems/createMonitoredItems.js" );
include( "./library/ServiceBased/MonitoredItemServiceSet/DeleteMonitoredItems/deleteMonitoredItems.js" );

var g_session;
var g_channel;

// this function parses the CSV file and returns "MonitoredItem" objects array,
// or an empty array.
function getItemsFromCSV()
{
    var nodes = [];
    var s = getCsvFile();
    var lines = s.split( "\n" );
    if( lines.length > 1 )
    {
        // skip the first line as it contains the end point
        var line;
        var nodeIds = [];
        for( line=1; line<lines.length; line++ )
        {
            //var colonPosition = lines[line].indexOf( ";", 6 ); //skip first 6 characters containing namespace index
            //var nodeId = lines[line].substring( 0, colonPosition );
            var nodeId = lines[line];
            if( nodeId !== null && nodeId.length > 1 )
            {
                nodeIds.push( UaNodeId.fromString( nodeId ) );
            }
        }//for line
        nodes = MonitoredItem.fromNodeIds( nodeIds );
    }
    return( nodes );
}

function initialize()
{
    g_channel = new UaChannel();
    g_session = new UaSession( g_channel );
    g_session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );
    if( !connect( g_channel, g_session ) )
    {
        addError("connect failed");
    }
}

function disconnectOverride()
{
    disconnect( g_channel, g_session );
}

// Get a list of items to read from settings
var originalScalarItems = getItemsFromCSV();
if( originalScalarItems !== null && originalScalarItems.length > 0 )
{
    // Get the test control parameters from the settings
    var i;
    var a=0;
    var keepGoing = true;
    
    var readRequest = new UaReadRequest();
    var readResponse = new UaReadResponse();
    
    initialize();
    
    // Read all values
    g_session.buildRequestHeader(readRequest.RequestHeader);

    // go into the loop to invoke the desired error
    var status;
    do
    {
        for(i = 0; i < originalScalarItems.length; i++)
        {
            readRequest.NodesToRead[a].NodeId = originalScalarItems[i].NodeId;
            readRequest.NodesToRead[a].AttributeId = Attribute.Value;
            readRequest.NodesToRead[a++].NodeId = originalScalarItems[i].NodeId;
            readRequest.NodesToRead[a].AttributeId = Attribute.NodeClass;
            readRequest.NodesToRead[a++].NodeId = originalScalarItems[i].NodeId;
            readRequest.NodesToRead[a].AttributeId = Attribute.BrowseName;
            readRequest.NodesToRead[a++].NodeId = originalScalarItems[i].NodeId;
            readRequest.NodesToRead[a].AttributeId = Attribute.DisplayName;
        }
        status = g_session.read( readRequest, readResponse );
        if( status.isGood() && readResponse.ResponseHeader.ServiceResult.isGood() )
        {
            addLog( UaDateTime.utcNow() + ": Read " + readRequest.NodesToRead.length + " nodes." );
            wait( 10 );
        }
        else
        {
            addLog( "Finally, result: " + status.toString() + "; serviceResult: " + readResponse.ResponseHeader.ServiceResult );
            break;
        }
    }while( status.isGood() );

    disconnectOverride()
}
else
{
    addError( "No items to use!" );
}
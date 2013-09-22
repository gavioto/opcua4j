/*  RESOURCE TESTING;
    prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    NOTE: This script uses a the following file:
        NODESFILE.CSV
            which is located in the root of your project directory. Simply populate this file with your
            nodes and then this script will continuously invoke Read and Write calls specifying all nodes within 
            that file.

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
        24-Aug-2011 NP: Revised to use new File I/O capability. Test lasts for 1-hour.
*/

const DELAY_BETWEEN_READWRITEPUBLISH = 1; //time is in msec

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
    var s = readFile( "./nodesFile.csv" );
    var lines = s.toString().split( "\n" );
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
    var j;
    var writeValues = new UaWriteValues();
    
    var readRequest = new UaReadRequest();
    var readResponse = new UaReadResponse();
    var writeRequest = new UaWriteRequest();
    var writeResponse = new UaWriteResponse();
    var checkItemResults = false;
    
    initialize();
    
    // Read all values
    g_session.buildRequestHeader(readRequest.RequestHeader);
    for(i = 0; i < originalScalarItems.length; i++)
    {
        readRequest.NodesToRead[i].NodeId = originalScalarItems[i].NodeId;
        readRequest.NodesToRead[i].AttributeId = Attribute.Value;

        writeValues[i].NodeId = originalScalarItems[i].NodeId;
        writeValues[i].AttributeId = Attribute.Value;
    }

    var status = g_session.read(readRequest, readResponse);
    
    if(status.isBad())
    {
        addError("initial read returned error", status);
    }
    else if(readResponse.ResponseHeader.ServiceResult.isBad())
    {
        addError("initial read service failed", readResponse.ResponseHeader.ServiceResult);
    }
    else
    {
        // save values
        for(i = 0; i < readResponse.Results.length; i++)
        {
            writeValues[i].Value.Value = readResponse.Results[i].Value;
        }
    }

    writeRequest.NodesToWrite = writeValues;

    // do the following for 1 hrs
    var startTime = UaDateTime.utcNow();
    print( startTime );
    var endTime = startTime.clone();
    endTime.addSeconds( 60 );
    var i=0;
    var errCountRead = 0;
    var errCountWrite = 0;
    while( UaDateTime.utcNow() < endTime )
    {
        if( i++ === 500 )
        {
            print( "500th loop iteration at: " + UaDateTime.utcNow() + "; ending at: " + endTime );
            i=0;
        }

        // Read all 
        g_session.buildRequestHeader(readRequest.RequestHeader);
        status = g_session.read(readRequest, readResponse);
        if(status.isBad())
        {
            addError("read failed in loop " + i + " at: " + UaDateTime.utcNow(), status);
            if( errCountRead++ > 100 )
            {
                break;
            }
        }
        else if(readResponse.ResponseHeader.ServiceResult.isBad())
        {
            addError("read service failed in loop " + i, readResponse.ResponseHeader.ServiceResult);
            if( errCountRead++ > 100 )
            {
                break;
            }
        }
        
        if(checkItemResults)
        {
            for(j = 0; j < readResponse.Results.length; j++)
            {
                if(readResponse.Results[j].StatusCode.isBad())
                {
                    addError("read error in loop " + i + " item " + j);
                }
            }
        }
        
        // Write all
        g_session.buildRequestHeader(writeRequest.RequestHeader);
        status = g_session.write(writeRequest, writeResponse);
        
        if(status.isBad())
        {
            addError("write failed in loop " + i + " at: " + UaDateTime.utcNow(), status);
            if( errCountWrite++ > 100 )
            {
                break;
            }
        }
        else if(writeResponse.ResponseHeader.ServiceResult.isBad())
        {
            addError("write service failed in loop " + i, writeResponse.ResponseHeader.ServiceResult);
            if( errCountWrite++ > 100 )
            {
                break;
            }
        }
        
        if(checkItemResults)
        {
            for(j = 0; j < writeResponse.Results.length; j++)
            {
                if(writeResponse.Results[j].isBad())
                {
                    addError("write error in loop " + i + " item " + j);
                }
            }
        }
    }
    disconnectOverride()
}
else
{
    addError( "No items to use!" );
}
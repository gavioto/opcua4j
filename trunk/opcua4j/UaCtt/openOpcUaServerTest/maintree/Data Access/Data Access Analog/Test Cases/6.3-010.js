/*  Test 6.3 Test 10 prepared by Anand Taparia; ataparia@kepware.com    
    Description:
        Add monitored items of analog type (each supported datatype) to an enabled subscription.
        Wait for a publishing interval and call publish to verify the values received match the
        expected datatype of each node.

    Revision History
        10-Feb-2010 Anand Taparia: Initial version.
        04-Mar-2010 NP: REVIEWED.
*/

function subscribe613010()
{
    // Get accees to the analog items for this test
    var monitoredItems = MonitoredItem.fromSettings( NodeIdSettings.DAStaticAnalog(), 1 );
    if( monitoredItems.length == 0 )
    {
        addSkipped( "Static Analog" );
        return;
    }

    // Create the subscription
    var subscription = new Subscription();
    if( createSubscription( subscription, g_session ) == false )
    {
        print( "Test aborted: Unable to create subscription." );
        return;
    }

    // Create and add monitored items to the subscription
    if ( createMonitoredItems( monitoredItems, TimestampsToReturn.Both, subscription, g_session ) == false )
    {
        print( "Test aborted: Unable to add the monitored items to the subscription." );
        return;
    }

    // Wait for one publishing interval
    wait( subscription.RevisedPublishingInterval );

    // Call publish
    print( "Calling publish." );
    if ( PublishHelper.Execute () )
    {
        if( PublishHelper.CurrentlyContainsData )
        {
            var nNumSuccess = 0;
            var nNumFailure = 0;
            for( var d=0; d<PublishHelper.CurrentDataChanges.length; d++ ) // 'd' for DataChange 
            {
                for( var m=0; m<PublishHelper.CurrentDataChanges[d].MonitoredItems.length; m++ ) // 'm' for MonitoredItem
                {
                    var mi = 0;
                    // search item in current data changes
                    for (mi = 0; mi < PublishHelper.CurrentDataChanges[d].MonitoredItems.length; mi++) {
                        if (monitoredItems[m].ClientHandle == PublishHelper.CurrentDataChanges[d].MonitoredItems[mi].ClientHandle)
                            break;
                    }
                    if (mi == PublishHelper.CurrentDataChanges[d].MonitoredItems.length)
                    {
                        addLog( "no Data received for analog node '" + monitoredItems[m].NodeSetting + "'");
                        nNumFailure++;
                    }
                    else
                    {
                        var currentNodeDataType = NodeIdSettings.guessType ( monitoredItems[m].NodeSetting );
                        if ( PublishHelper.CurrentDataChanges[d].MonitoredItems[mi].Value.Value.DataType == currentNodeDataType )
                        {
                            addLog( "DataType received for analog node '" + monitoredItems[m].NodeSetting + "' matches the expected type of '" + BuiltInType.toString ( currentNodeDataType ) + "'." );
                            nNumSuccess++;
                        }
                        else
                        {
                            addError( "DataType received for analog node '" + monitoredItems[m].NodeSetting + "' does not match the expected type.\n\t Expected datatype: " + BuiltInType.toString ( currentNodeDataType ) + "\n\t Received datatype: " + BuiltInType.toString ( PublishHelper.CurrentDataChanges[d].MonitoredItems[mi].Value.Value.DataType) );
                            nNumFailure++;
                        }
                    }
                }
            }
            // Just check if we received responses for all our analog nodes
            if ( ( nNumSuccess + nNumFailure ) != monitoredItems.length )
            {
                addError( "Datatypes of all the analog nodes was not verified.\n\tNum of analog nodes: " + monitoredItems.length + "\n\tSuccessfull verification: " + nNumSuccess + "\n\tFailed verification: " + nNumFailure );
            }
            else
            {
                addLog( "All data-types received and are correct!" );
            }
        }
        else
        {
            addError( "No dataChange received after the publish as was expected." );
        }
    }

    // Clean up
    deleteMonitoredItems( monitoredItems, subscription, g_session );
    deleteSubscription( subscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke ( subscribe613010 );
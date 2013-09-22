/*  Test 6.3 Test 11 prepared by Anand Taparia; ataparia@kepware.com    
    Description:
        Add monitored items of analog type (each supported datatype) to an enabled subscription.
        Wait for a publishing interval and call publish to verify the values received match the
        expected datatype of each node.

    Revision History
        10-Feb-2010 Anand Taparia: Initial version.
        04-Mar-2010 NP: REVIEWED.
        28-Jun-2011: Matthias Lechner: Assigning unique ClientHandles to MonitoredItems.
        23-Aug-2011 NP: Script checks for Max Supported MonitoredItems setting and reduces items accordingly.
                        This is important for embedded systems of limited resources.
*/

function subscribe613011()
{
    var monitoredItems = [];
    
    // Get accees to the analog items for this test
    var analogMonitoredItems = MonitoredItem.fromSettings( NodeIdSettings.DAStaticAnalog() );
    if( analogMonitoredItems.length == 0 )
    {
        _dataTypeUnavailable.store( "Static Analog" );
    }
    else
    {
        // Add the monitored items to our single common monitoreditems array
        for( var n=0; n<analogMonitoredItems.length; n++ )
        {
            monitoredItems.push( analogMonitoredItems[n] );
        }
    }

    // Get accees to the TwoStateDiscrete items for this test
    var twoStateDiscreteMonitoredItems = MonitoredItem.fromSettings( NodeIdSettings.DAStaticTwoStateDiscreteItems() );
    if( twoStateDiscreteMonitoredItems.length == 0 )
    {
        _dataTypeUnavailable.store( "TwoStateDiscrete" );
    }
    else
    {
        // Add the monitored items to our single common monitoreditems array
        for ( var n=0; n<twoStateDiscreteMonitoredItems.length; n++)
        {
            monitoredItems.push( twoStateDiscreteMonitoredItems[n] );
        }
    }
    
    // Get accees to the MultiStateDiscrete items for this test
    var multiStateDiscreteMonitoredItems = MonitoredItem.fromSettings( NodeIdSettings.DAStaticMultiStateDiscreteItems() );
    if( multiStateDiscreteMonitoredItems.length == 0 )
    {
        _dataTypeUnavailable.store( "MultiStateDiscrete" );
    }
    else
    {
        // Add the monitored items to our single common monitoreditems array
        for ( var n=0; n<multiStateDiscreteMonitoredItems.length; n++)
        {
            monitoredItems.push( multiStateDiscreteMonitoredItems[n] );
        }
    }

    // check the MaxSupportedMonitoredItems setting and reduce our item count accordingly
    var maxItems = parseInt( readSetting( "/Server Test/Max Supported MonitoredItems" ) );
    if( maxItems !== 0 )
    {
        // 0 means unlimited, so we have a restriction here...
        while( maxItems < monitoredItems.length )
        {
            // reduce the monitoredItems to match the setting size requirements
            monitoredItems.pop();
        }
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
    print ( "Calling publish." );
    if ( PublishHelper.Execute () )
    {
        if( PublishHelper.CurrentlyContainsData() )
        {
            var nNumSuccess = 0;
            var nNumFailure = 0;
            for( var d=0; d<PublishHelper.CurrentDataChanges.length; d++ ) // 'd' for DataChange 
            {
                for( var m=0; m<PublishHelper.CurrentDataChanges[d].MonitoredItems.length; m++ ) // 'm' for MonitoredItem
                {
                    var mi = 0;
                    // search item in monitored items list
                    for (mi = 0; mi < monitoredItems.length; mi++) {
                        if (PublishHelper.CurrentDataChanges[d].MonitoredItems[m].ClientHandle == monitoredItems[mi].ClientHandle)
                            break;
                    }
                    if (mi == monitoredItems.length)
                    {
                        addLog( "no Data received for analog node '" + monitoredItems[mi].NodeSetting + "'");
                        nNumFailure++;
                    }
                    else
                    {
                        var currentNodeDataType = NodeIdSettings.guessType ( monitoredItems[mi].NodeSetting );
                        // We we are not able to determine the datatype above, use this alternative method 
                        if( currentNodeDataType == "undefined" || currentNodeDataType == "")
                        {
                            if( ReadHelper.Execute ( monitoredItems[mi] ) )
                            {
                                currentNodeDataType = monitoredItems[mi].DataType;        
                            }
                        }
                        if( PublishHelper.CurrentDataChanges[d].MonitoredItems[m].Value.Value.DataType == currentNodeDataType )
                        {
                            addLog ( "DataType received for monitored item '" + monitoredItems[mi].NodeSetting + "' matches the expected type of '" + BuiltInType.toString ( currentNodeDataType ) + "'." );
                            nNumSuccess++;
                        }
                        else
                        {
                            addError ( "DataType received for monitored item '" + monitoredItems[mi].NodeSetting + "' does not match the expected type.\n\t Expected datatype: " + BuiltInType.toString ( currentNodeDataType ) + "\n\t Received datatype: " + BuiltInType.toString ( PublishHelper.CurrentDataChanges[d].MonitoredItems[m].Value.Value.DataType ) );
                            nNumFailure++;
                        }
                    }
                }
            }
            // Just check if we received responses for all our nodes
            if( ( nNumSuccess + nNumFailure ) !== monitoredItems.length )
            {
                addError( "Datatypes of all the nodes was not verified.\n\tNum of nodes: " + monitoredItems.length + "\n\tSuccessfull verification: " + nNumSuccess + "\n\tFailed verification: " + nNumFailure );
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

safelyInvoke ( subscribe613011 );
/*  Test 6.4 Test 13 prepared by Anand Taparia; ataparia@kepware.com    
    Description:
        Add monitored items of DataItem type (each supported datatype) to an enabled subscription.
        Call publish to verify the values received match the expected values of each node.

    Revision History
        19-Feb-2010 Anand Taparia: Initial version.
        03-Mar-2010 NP: REVIEWED.
        22-Jun-2010 DP: Removed redundant data-types-missing warning.
*/

function subscribe614013 ()
{
    // Get accees to the DataItem nodes for this test
    var monitoredItems = MonitoredItem.fromSettings( NodeIdSettings.DAAStaticDataItem (), 1 );
    if ( monitoredItems.length == 0 )
    {
        addSkipped( "Static DataItem" );
        return;
    }

    // Create the subscription
    var subscription = new Subscription();
    if ( createSubscription( subscription, g_session ) == false )
    {
        print( "Test aborted: Unable to create subscription." );
        return;
    }

    // Create and add monitored items to the subscription
    if ( createMonitoredItems( monitoredItems, TimestampsToReturn.Both, subscription, g_session ) == false )
    {
        print( "Test aborted: Unable to add the monitored items to the subscription." );
        deleteSubscription( subscription, g_session );
        return;
    }
    
    // Wait for one publishing interval
    wait( subscription.RevisedPublishingInterval );
    
    // Call publish
    print( "Calling publish." );
    if ( PublishHelper.Execute () )
    {
        if ( PublishHelper.CurrentlyContainsData )
        {
            for ( var d=0; d<PublishHelper.CurrentDataChanges.length; d++ ) // 'd' for DataChange 
            {
                for ( var m=0; m<PublishHelper.CurrentDataChanges[d].MonitoredItems.length; m++ ) // 'm' for MonitoredItem
                {
                    // Print the initial values of the nodes
                    if ( PublishHelper.CurrentDataChanges[d].MonitoredItems[m].Value.Value.isEmpty() )
                    {
                        addError ( "NULL value received for node '" + monitoredItems[m].NodeSetting + "'." );
                    }
                    else
                    {
                        addLog ( "Value received on publish for the dataitem node '" + monitoredItems[m].NodeSetting + "' is: " + UaVariantToSimpleType ( PublishHelper.CurrentDataChanges[d].MonitoredItems[m].Value.Value ) );
                    }
                }
            }
        }
        else
        {
            addError ( "No dataChange received after the publish as was expected." );
        }
    }
    // Clean up
    deleteMonitoredItems( monitoredItems, subscription, g_session );
    deleteSubscription( subscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke ( subscribe614013 );
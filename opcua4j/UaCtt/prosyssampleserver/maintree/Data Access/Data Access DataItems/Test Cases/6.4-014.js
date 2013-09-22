/*  Test 6.4 Test #14, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
        Add monitored item for each supported data-type to an enabled subscription. 
        Write the max value of the corresponding data-type. Call Publish.

    Revision History: 
        19-Feb-2010 Anand Taparia: Initial version.
        03-Mar-2010 NP: REVIEWED.
        22-Jun-2010 DP: Removed redundant data-types-missing warning.
*/

function subscribe614014 ()
{
    // Get acces to nodes
    var items = MonitoredItem.fromSettings( NodeIdSettings.DAAStaticDataItem(), 0, Attribute.Value, "", MonitoringMode.Reporting );
    if( items.length == 0 )
    {
        addSkipped( "Static DataItem" );
        return;
    }

    // Create subscription for this test
    subscription = new Subscription();
    if( !createSubscription( subscription, g_session ) )
    {
        return;
    }
    
    // Create and add the items to the subscription
    if( !createMonitoredItems( items, TimestampsToReturn.Both, subscription, g_session ) )
    {
        addError( "Create monitored items failed with status '" + uaStatus + "'.");
        deleteSubscription( subscription, g_session );
        return;
    }

    // After a publish call wait for the longest of these two intervals
    var waitInterval = subscription.RevisedPublishingInterval;

    // Assign write value for each item
    for( var w=0; w<items.length; w++ )
    {
        var currentNodeDataType = NodeIdSettings.guessType ( items[w].NodeSetting );
        var maxDataTypevalue = getMaxValueDataType ( currentNodeDataType );
        items[w].SafelySetValueTypeKnown( maxDataTypevalue, currentNodeDataType );
        print ( "Writing max datatype value for dataitem node '" + items[w].NodeSetting + "': " + UaVariantToSimpleType ( items[w].Value.Value ) );
    }    
    // Issue the write    
    if ( WriteHelper.Execute( items ) == false )
    {
        addError( "Write failed for the DataItem nodes, writing MAX value for each data-type." );
    }
    else
    {
        // Wait such that the latest writes get polled by the server
        wait( waitInterval );
    
        // 2nd publish call
        print ( "Making the publish call..." );
        if( PublishHelper.Execute() )
        {
            if ( PublishHelper.CurrentlyContainsData() ) 
            {
                PublishHelper.PrintDataChanges();
                // Now compare the values received with those written
                for( var w=0; w<items.length; w++ )
                {
                    var writeVal = UaVariantToSimpleType ( items[w].Value.Value );
                    var publishVal = UaVariantToSimpleType ( PublishHelper.CurrentDataChanges[0].MonitoredItems[w].Value.Value ); 

                    var match = true;
                    if( writeVal !== publishVal && writeVal != publishVal )
                    {
                        if( writeVal === null ) { writeVal = ""; }
                        if( publishVal === null ) { publishVal = ""; }
                        if( publishVal.toString() !== publishVal.toString() )
                        { 
                            match = false;
                        }
                    }

                    if (match)
                    {
                        addLog ( "Value received on publish for node '" + items[w].NodeSetting + "' matches what was written. Value = " + writeVal );
                    }
                    else
                    {
                        addError ( "Value received on publish for node '" + items[w].NodeSetting + "' does not matches what was written.\n\tWrite value: " + writeVal + "\n\tValue received on publish: " + publishVal );
                    }
                }
            }
            else
            {
                addLog ( "No dataChange notifications received." );
            }
        }
    }
    // Clean-up
    deleteMonitoredItems( items, subscription, g_session );
    deleteSubscription( subscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke( subscribe614014 );
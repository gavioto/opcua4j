/*  Test 6.3 Test #12, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
        Add monitored item for each supported data-type to an enabled subscription. Each monitored 
        item is configured with an EURange and a PercentDeadband filter value of 10. Call publish.
        Perform two writes to each item: 1) Will pass the deadband, 2) Will not pass the deadband. 
        Call publish after each write.

    Revision History: 
        10-Feb-2010 Anand Taparia: Initial Version (based on script 6.1.2-004 by NP)
        04-Mar-2010 NP: REVIEWED.
        29-Jun-2011 Matthias Lechner: Fixed the wrong assumption that Monitored Items appear
                    in Publish responses in the same order as specified in the CreateMonitoredItems()
                    request.
*/

function subscribe613012()
{
    const DEADBANDVALUE = 10;

    // Get acces to nodes that would have EURange defined
    var items = MonitoredItem.fromSettings( NodeIdSettings.DAStaticAnalog(), 0, Attribute.Value, "", MonitoringMode.Reporting );
    if( items.length == 0 )
    {
        addSkipped( "Static Analog" );
        return;
    }

    // Create subscription for this test
    subscription = new Subscription();
    createSubscription( subscription, g_session );    

    // Loop through each item and save the items that have an EURange defined
    var itemsToTestCounter = 0;
    var itemsToTestArray = [];
    var writesToPassArray = [];
    var writesToFailArray = [];
    for ( var i=0; i<items.length; i++ )
    {
        var eurange = GetNodeIdEURange( items[i].NodeSetting );
        if( eurange == null )
        {
            print ( "Node '" + items[i].NodeSetting + "' does not have an EURange defined. Skipping the node." );
            continue;
        }

        // Read the node to get the current value 
        if ( ReadHelper.Execute ( items[i] ) == false )
        {
            print ( "Unable to read the node '" + items[i].NodeSetting + "' to determine the current value. Skipping node." );
            continue;
        }

        // Configure percent deadband filter of DEADBANDVALUE
        items[i].Filter = Event.GetDataChangeFilter( DeadbandType.Percent, DEADBANDVALUE, DataChangeTrigger.StatusValue );
        // EURange defined for this item, save it
        itemsToTestArray[itemsToTestCounter] = items[i];

        // Now save the write values (that will pass/fail)
        var getEURangeSize = GetEURangeAsSize( eurange );
        var passValues = GetEURangeWriteValues( 1, eurange, 10, true, UaVariantToSimpleType ( items[i].Value.Value ) );
        print ( "Value that will pass the deadband for the node '" + items[i].NodeSetting + "' based on the current value of '" + UaVariantToSimpleType ( items[i].Value.Value ) + "' is: " + passValues[0] );
        var failValues = GetEURangeWriteValues( 1, eurange, 10, false, passValues[0] );
        print ( "Value that will fail the deadband for the node '" + items[i].NodeSetting + "' based on the current value of '" + passValues[0] + "' is: " + failValues[0] );
        writesToPassArray[itemsToTestCounter] = passValues[0];
        writesToFailArray[itemsToTestCounter] = failValues[0];
        itemsToTestCounter++;
    }

    // Create and add the items to the subscription
    if( !createMonitoredItems( itemsToTestArray, TimestampsToReturn.Both, subscription, g_session ) )
    {
        addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        return;
    }

    // Wait for the revised publish interval
    wait ( subscription.RevisedPublishingInterval );

    // First publish call. We should get initial values.
    print ( "Monitored items for this test successfuly added to the subscription. Making the first publish call..." );
    if ( PublishHelper.Execute() )
    {
        if ( PublishHelper.CurrentlyContainsData() )
        {
            addLog( "Data change notification received after the first publish call as expected." );
        }
        else
        {
            addError( "Expected to receive initial dataChange after the first publish call." );
        }
    }

    // Write the values that will pass
    print ( "Writing values to the monitored items that will pass the deadband." );
    for( var w=0; w<itemsToTestArray.length; w++ )
    {
        var currentItemDataType = NodeIdSettings.guessType ( itemsToTestArray[w].NodeSetting );
        itemsToTestArray[w].SafelySetValueTypeKnown( writesToPassArray[w], currentItemDataType );
    }
    // Issue the write    
    if( WriteHelper.Execute( itemsToTestArray ) )
    {
        // Wait such that the latest writes get polled by the server
        wait ( subscription.RevisedPublishingInterval );

        // 2nd publish call
        print ( "Making the second publish call..." );
        if( PublishHelper.Execute() )
        {
            if ( PublishHelper.CurrentlyContainsData() ) 
            {
                PublishHelper.PrintDataChanges();
                // Now compare the values received with those written
                for( var w=0; w<itemsToTestArray.length; w++ )
                {
                    // Look up the item-to-test in the publish response array
                    var foundItem = false;
                    var publishResponseIndex = 0;
                    for( publishResponseIndex = 0; publishResponseIndex < PublishHelper.CurrentDataChanges[0].MonitoredItems.length; publishResponseIndex++ )
                    {
                        if( PublishHelper.CurrentDataChanges[0].MonitoredItems[publishResponseIndex].ClientHandle == itemsToTestArray[w].ClientHandle )
                        {
                            foundItem = true;
                            break;
                        }
                    }
                    
                    if( foundItem == true )
                    {
                        if ( writesToPassArray[w] == UaVariantToSimpleType ( PublishHelper.CurrentDataChanges[0].MonitoredItems[publishResponseIndex].Value.Value ) )
                        {
                            addLog( "Value received on publish for node '" + itemsToTestArray[w].NodeSetting + "' matches what was written(pass deadband). Value = " + writesToPassArray[w] );
                        }
                        else
                        {
                            addError( "Value received on publish for node '" + itemsToTestArray[w].NodeSetting + "' does not match what was written (pass deadband).\n\tWrite value: " + writesToPassArray[w] + "\n\tValue received on publish: " + UaVariantToSimpleType ( PublishHelper.CurrentDataChanges[0].MonitoredItems[w].Value.Value ) );
                        }
                    }
                    else
                    {
                        addError( "No value received on publish for node '" + itemsToTestArray[w].NodeSetting + "' although the written value should pass the deadband. Value =  " + writesToPassArray[w] );
                    }
                }
            }
            else
            {
                addError( "Expected " + DEADBANDVALUE + "% deadband to yield the dataChange results that echo the values written." );
            }
        }
        else
        {
            addError( "Second publish call failed." );   
        }
    }

    // Write the value that will fail
    print( "Writing values to the monitored items that will fail the deadband." );
    for( var w=0; w<itemsToTestArray.length; w++ )
    {
        var currentItemDataType = NodeIdSettings.guessType ( itemsToTestArray[w].NodeSetting );
        itemsToTestArray[w].SafelySetValueTypeKnown( writesToFailArray[w], currentItemDataType );
    }    
    // Issue the write    
    if ( WriteHelper.Execute( itemsToTestArray ) )
    {
        // Wait such that the latest writes get polled by the server
        wait( subscription.RevisedPublishingInterval );

        // 3rd publish call
        print( "Making the third publish call..." );
        if( PublishHelper.Execute() )
        {
            if ( PublishHelper.CurrentlyContainsData() ) 
            {
                addError( "dataChange for the third publish call was not expected." );
            }
            else
            {
                addLog( "No datachange received for the third publish call as expected." );
            }
        }
    }

    // Clean-up
    deleteMonitoredItems( itemsToTestArray, subscription, g_session );
    deleteSubscription( subscription, g_session );
    PublishHelper.Clear();
}

safelyInvoke( subscribe613012 );
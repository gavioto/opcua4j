/*  Test 6.4 Test #15, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
        Add monitored item for each supported data-type to an enabled subscription. Each monitored 
        item is configured DeadbandAbsolute filter of 10. Call publish.
        Perform two writes to each item: 1) Will pass the deadband, 2) Will not pass the deadband. 
        Call publish after each write.

    Revision History: 
        19-Feb-2010 Anand Taparia: Initial version.
        03-Mar-2010 NP: REVIEWED.
        09-Dec-2010 NP: Bad_MonitoredItemFilterUnsupported permitted on CreateMonitoredItems call.
*/

function subscribe614015 ()
{
    const DEADBANDVALUE = 10;

    // Get acces to the DataItem nodes
    var initialItems = MonitoredItem.fromSettings( NodeIdSettings.DAAStaticDataItem(), 0, Attribute.Value, "", MonitoringMode.Reporting );
    if( initialItems.length == 0 )
    {
        addSkipped( "Static DataItem" );
        return;
    }

    // we are going to set the values to zero for all nodes, but first record the initial value so that
    // we can revert it at the end
    ReadHelper.Execute( initialItems );
    var items = [];
    for( var i=0; i<initialItems.length; i++ )
    {
        initialItems[i].InitialValue = initialItems[i].Value.Value.clone();
        // now set value to zero
        initialItems[i].SafelySetValueTypeKnown( 0, initialItems[i].DataType );
        // now to drop undesirable data-types for this test: DateTime/String 
        if( initialItems[i].DataType !== BuiltInType.DateTime &&
            initialItems[i].DataType !== BuiltInType.String )
            {
                items.push( initialItems[i] );
            }
            else
            {
                print( "Skipping node '" + initialItems[i].NodeSetting + "' because it is of type '" + BuiltInType.toString( initialItems[i].DataType ) + "'" );
            }
    }

    // Loop through each item and save the items that have an EURange defined
    var itemsToTestCounter = 0;
    var itemsToTestArray = [];
    var writesToPassArray = [];
    var writesToFailArray = [];
    for ( var i=0; i<items.length; i++ )
    {
        print( "\n\n\nSearching EURange on item: '" + items[i].NodeSetting + "'; Initial Value: " + items[i].InitialValue + "; DataType: " + BuiltInType.toString( items[i].DataType ) );

        // Configure absolute deadband filter of DEADBANDVALUE
        items[i].Filter = Event.GetDataChangeFilter( DeadbandType.Absolute, DEADBANDVALUE, DataChangeTrigger.StatusValue );
        
        // Save the item
        itemsToTestArray[itemsToTestCounter] = items[i];

        // Now save the write values (that will pass/fail)
        var passValue = UaVariantToSimpleType ( items[i].Value.Value ) + DEADBANDVALUE + 1;
        print ( "\tValue that will pass the deadband (Absolute: " + DEADBANDVALUE + ") for the node '" + items[i].NodeSetting + "' based on the current value of '" + UaVariantToSimpleType ( items[i].Value.Value ) + "' is: " + passValue );
        var failValue = passValue +  DEADBANDVALUE - 1;
        print ( "\tValue that will fail the deadband (Absolute: " + DEADBANDVALUE + ") for the node '" + items[i].NodeSetting + "' based on the current value of '" + passValue + "' is: " + failValue );
        writesToPassArray[itemsToTestCounter] = passValue;
        writesToFailArray[itemsToTestCounter] = failValue;
        itemsToTestCounter++;
    }


    // Create subscription for this test
    subscription = new Subscription();
    createSubscription( subscription, g_session );

    // the CreateMonitoredItems call may succeed, or fail if deadbandAbsolute is not supported.
    var anticipatedResults = [];
    for( var z=0; z<itemsToTestArray.length; z++ )
    {
        anticipatedResults[z] = new ExpectedAndAcceptedResults( StatusCode.Good );
        anticipatedResults[z].addExpectedResult( StatusCode.BadMonitoredItemFilterUnsupported );
    }

    // Create and add the items to the subscription
    if( !createMonitoredItems( itemsToTestArray, TimestampsToReturn.Both, subscription, g_session, anticipatedResults, true ) )
    {
        deleteSubscription( subscription, g_session );
        addError( "CreateMonitoredItems(): status '" + uaStatus, uaStatus );
        return;
    }
    if( createMonItemsResp.Results[0].StatusCode.StatusCode === StatusCode.BadMonitoredItemFilterUnsupported )
    {
        addNotSupported( "DeadbandAbsolute" );
        deleteSubscription( subscription, g_session );
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
            addLog ( "Data change notification received after the first publish call as expected." );
        }
        else
        {
            addError ( "Expected to receive initial dataChange after the first publish call." );
        }
    }
    else
    {
        addError ( "First publish call failed." );   
    }
        
    // Write the values that will pass
    print ( "Writing values to the monitored items that will pass the deadband." );
    for( var w=0; w<itemsToTestArray.length; w++ )
    {
        var currentItemDataType = NodeIdSettings.guessType ( itemsToTestArray[w].NodeSetting );
        itemsToTestArray[w].SafelySetValueTypeKnown( writesToPassArray[w], currentItemDataType );
    }
    // Issue the write    
    if ( WriteHelper.Execute( itemsToTestArray ) == false )
    {
        addError ( "Write failed (writing values that will pass the deadband)." );
    }
    else
    {
        // Wait such that the latest writes get polled by the server
        wait ( subscription.RevisedPublishingInterval );
    
        // 2nd publish call
        print ( "Making the second publish call..." );
        if( PublishHelper.Execute() )
        {
            if ( PublishHelper.CurrentlyContainsData() ) 
            {
                AssertEqual( itemsToTestArray.length, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive 1 notification per Node." );
                PublishHelper.PrintDataChanges();
                PublishHelper.SetItemValuesFromDataChange( itemsToTestArray, "v" );
                // Now compare the values received with those written
                for( var w=0; w<itemsToTestArray.length; w++ )
                {
                    var originalValue = writesToPassArray[w];
                    var receivedValue = itemsToTestArray[w].Value.Value;
                    switch( itemsToTestArray[w].DataType )
                    {
                        case BuiltInType.Float:
                            receivedValue = itemsToTestArray[w].Value.Value.toFloat();
                            break;
                        case BuiltInType.Double:
                            receivedValue = itemsToTestArray[w].Value.Value.toDouble();
                            break;
                        case BuiltInType.SByte:
                            receivedValue = itemsToTestArray[w].Value.Value.toSByte();
                            break;
                    }
                    if( AssertCoercedEqual( originalValue, receivedValue, ( "Value received on publish for node '" + itemsToTestArray[w].NodeSetting + "' does not matches what was written (pass deadband).\n\tWrite value: " + writesToPassArray[w] ) ) )
                    {
                        addLog ( "Value received on publish for node '" + itemsToTestArray[w].NodeSetting + "' matches what was written (pass deadband). Value = " + writesToPassArray[w] );
                    }
                }
            }
            else
            {
                addError ( "Expected to receive the dataChange results that echo the values written." );
            }
        }
        else
        {
            addError ( "Second publish call failed." );   
        }
    }
    
    // Write the value that will fail
    print ( "\n\n\n\n\nWriting values to the monitored items that will fail the deadband." );
    for( var w=0; w<itemsToTestArray.length; w++ )
    {
        var currentItemDataType = NodeIdSettings.guessType ( itemsToTestArray[w].NodeSetting );
        itemsToTestArray[w].SafelySetValueTypeKnown( writesToFailArray[w], currentItemDataType );
    }    
    // Issue the write    
    if ( WriteHelper.Execute( itemsToTestArray ) == false )
    {
        addError ( "Write failed (writing values that will fail the deadband)." );
    }
    else
    {
        // Wait such that the latest writes get polled by the server
        wait ( subscription.RevisedPublishingInterval );
    
        // 3rd publish call
        print ( "Making the third publish call..." );
        if( PublishHelper.Execute() )
        {
            if ( PublishHelper.CurrentlyContainsData() ) 
            {
                addError ( "dataChange for the third publish call was not expected." );
            }
            else
            {
                addLog ( "No datachange received for the third publish call as expected." );
            }
        }
        else
        {
            addError ( "Third publish call failed." );   
        }
    }
    // Clean-up
    deleteMonitoredItems( itemsToTestArray, subscription, g_session );
    deleteSubscription( subscription, g_session );
    PublishHelper.Clear();
    // revert to original values
    print( "\n\n\n\nReverting Nodes back to their original values..." );
    for( var i=0; i<itemsToTestArray.length; i++ )
    {
        itemsToTestArray[i].Value.Value = itemsToTestArray[i].InitialValue;
    }
    WriteHelper.Execute( itemsToTestArray );
}

safelyInvoke( subscribe614015 );
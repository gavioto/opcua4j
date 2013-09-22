/*  Test 5.9.2 Test 15 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script modifies multiple monitored items, where: 
        1) Sampling period alternates 5000 & 500 msec. 
        2) Monitoring mode is 'Reporting' for first half of items and 'Disabled' for the remaining.
        3) QueueSize increments by 2 for each item.
        4) DiscardOldest is True for first half of items anf False for the remaining.
        And the initial configuration is:
            A subscription of as many monitoredItems as configured in the CTT, using default parameters.

    Revision History
        08-Oct-2009 AT: Initial Version.
        18-Nov-2009 NP: REVIEWED.
        20-Jan-2010 DP: Changed to get node settings from NodeIdSettings functions.
        06-May-2011 NP: Remove the 25 node limit and allow for a minimum of 5.
*/

function modifyMonitoredItems592015()
{
    // specify more items than we need, just in case any are not configured
    var itemsToMonitorSettingNames = NodeIdSettings.ScalarStatic().concat( NodeIdSettings.DAAStaticDataItem() );
    var nNumItemsToModify = 5;

    // array to store the NodeIds from the settings
    var itemsToMonitorNodeIds = [];

    // get the values of the settings
    for( var s=0; s<itemsToMonitorSettingNames.length; s++ )
    {
        var settingValue = readSetting( itemsToMonitorSettingNames[s] );
        if( settingValue !== undefined && settingValue !== null && settingValue.toString() !== "" )
        {
            itemsToMonitorNodeIds.push( settingValue.toString() );
        }
    }

    // check that we have enough nodes to work with
    if( itemsToMonitorNodeIds.length < nNumItemsToModify )
    {
        addWarning( "Can't test because not enough nodes are defined. We need " + nNumItemsToModify + ", but only " + itemsToMonitorNodeIds.length + " exist." );
    }
    else
    {
        if( !MonitorQueueSize2Subscription.SubscriptionCreated )
        {
            addError( "Subscription for Monitor Basic was not created" );
            return;
        }

        // Add the monitored items using default parameters
        var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
        var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
        g_session.buildRequestHeader(createMonitoredItemsRequest.RequestHeader);

        createMonitoredItemsRequest.SubscriptionId = MonitorQueueSize2Subscription.SubscriptionId;
        createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Server;

        var clientHandle = 0;
        addLog ( "Creating " + nNumItemsToModify + " monitored items using the default parameters." );
        for( var i = 0; i< nNumItemsToModify; i++ )
        {
            createMonitoredItemsRequest.ItemsToCreate[i] = new UaMonitoredItemCreateRequest();
            createMonitoredItemsRequest.ItemsToCreate[i].ItemToMonitor.NodeId = UaNodeId.fromString( itemsToMonitorNodeIds[i] );
            createMonitoredItemsRequest.ItemsToCreate[i].ItemToMonitor.AttributeId = Attribute.Value;
            createMonitoredItemsRequest.ItemsToCreate[i].MonitoringMode = MonitoringMode.Reporting;
            createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.ClientHandle = clientHandle++;
            createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.SamplingInterval = -1;
            createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.QueueSize = 1;
            createMonitoredItemsRequest.ItemsToCreate[i].RequestedParameters.DiscardOldest = true;
        }

        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        if ( !uaStatus.isGood() )
        {
            addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        }
        else
        {
            checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse );
            addLog ( "Successfully created the " + nNumItemsToModify + " monitored items." );

            // Now modify the monitored items
            addLog ( "Modifying the " + nNumItemsToModify + " items.");

            var modifyMonitoredItemsRequest = new UaModifyMonitoredItemsRequest();
            var modifyMonitoredItemsResponse = new UaModifyMonitoredItemsResponse();
            g_session.buildRequestHeader( modifyMonitoredItemsRequest.RequestHeader );

            modifyMonitoredItemsRequest.SubscriptionId = MonitorQueueSize2Subscription.SubscriptionId;
            modifyMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Server;

            // Add the items
            for( i = 0; i< nNumItemsToModify; i++ )
            {
                modifyMonitoredItemsRequest.ItemsToModify[i].MonitoredItemId = createMonitoredItemsResponse.Results[i].MonitoredItemId;
            }

            var nInitialQueueSize = 0;
            for( i = 0; i< nNumItemsToModify; i++)
            {
                // Sampling period alternates 5000 & 500 ms
                if ( (i%2) == 0)
                {
                    addLog ( "\tSetting the SamplingInterval for item #" + i + " to 5000 ms."  );
                    modifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.SamplingInterval = 5000;
                }
                else
                {
                    addLog ( "\tSetting the SamplingInterval for item #" + i + " to 500 ms."  );
                    modifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.SamplingInterval = 500;
                }

                addLog ( "\tSetting the QueueSize for item #" + i + " to " + nInitialQueueSize + "."  );
                modifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.QueueSize = nInitialQueueSize;
                // QueueSize increments by 2 for the next item
                nInitialQueueSize = nInitialQueueSize + 2;            

                // DiscardOldest and Monitoring mode for the first half items
                if ( i < (nNumItemsToModify/2) )
                {
                    // DiscardOldest is True for first half of items
                    addLog ( "\tSetting DiscardOldest for item #" + i + " to true."  );
                    modifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.DiscardOldest = true;
    
                    // Monitoring mode is 'Reporting' for first half of items
                    addLog ( "\tSetting MonitoringMode for item #" + i + " to 'Reporting'."  );
                    modifyMonitoredItemsRequest.ItemsToModify[i].MonitoringMode = MonitoringMode.Reporting;
                }

                // DiscardOldest and Monitoring mode for the second half items
                if ( i >= (nNumItemsToModify/2) )
                {
                    // DiscardOldest is False for second half of items
                    addLog ( "\tSetting DiscardOldest for item #" + i + " to false."  );
                    modifyMonitoredItemsRequest.ItemsToModify[i].RequestedParameters.DiscardOldest = false;
    
                    // Monitoring mode is 'Disabled' for second half of items
                    addLog ( "\tSetting MonitoringMode for item #" + i + " to 'Disabled'."  );
                    modifyMonitoredItemsRequest.ItemsToModify[i].MonitoringMode = MonitoringMode.Disabled;
                }
            }

            uaStatus = g_session.modifyMonitoredItems( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );        
            if( !uaStatus.isGood() )
            {
                addError( "ModifyMonitoredItems() status " + uaStatus, uaStatus );
            }

            print( "Modified the items. The results are:" );
            // Check the results of the modification.
            checkModifyMonitoredItemsValidParameter( modifyMonitoredItemsRequest, modifyMonitoredItemsResponse );

            // Compare what we got with what we set
            nInitialQueueSize = 1;
            for( i = 0; i< nNumItemsToModify; i++)
            {
                // Sampling period was alternated at 5000 & 500 ms
                if ( (i%2) == 0)
                {
                    if ( modifyMonitoredItemsResponse.Results[i].RevisedSamplingInterval == 5000 )
                    {
                        addLog ( "\tThe UA server accepted the requested SamplingInterval of 5000 ms for item #" + i + "."  );
                    }
                    else
                    {
                        addLog ( "\tThe UA server revised the requested SamplingInterval of 5000 ms for item #" + i + " to " + modifyMonitoredItemsResponse.Results[i].RevisedSamplingInterval + "."  );
                    }
                }
                else
                {
                    if ( modifyMonitoredItemsResponse.Results[i].RevisedSamplingInterval == 500 )
                    {
                        addLog ( "\tThe UA server accepted the requested SamplingInterval of 500 ms for item #" + i + "."  );
                    }
                    else
                    {
                        addLog ( "\tThe UA server revised the requested SamplingInterval of 500 ms for item #" + i + " to " + modifyMonitoredItemsResponse.Results[i].RevisedSamplingInterval + "."  );
                    }
                }

                // QueueSize was incremented by 2 for each item (with the first item set to '1')
                if ( modifyMonitoredItemsResponse.Results[i].RevisedQueueSize == nInitialQueueSize )
                {
                    addLog ( "\tThe UA server accepted the requested QueueSize of " + nInitialQueueSize + " for item #" + i + "."  );
                }
                else
                {
                    addLog ( "\tThe UA server revised the requested QueueSize of " + nInitialQueueSize + " for item #" + i + " to " + modifyMonitoredItemsResponse.Results[i].RevisedQueueSize + "."  );
                }

                // QueueSize for the next item
                nInitialQueueSize = nInitialQueueSize + 2;
            }
        }

        // Cleanup
        // Delete the items we added in this test
        var monitoredItemsIdsToDelete = new UaUInt32s();
        for( var i = 0; i< createMonitoredItemsResponse.Results.length; i++ )
        {
            monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
        }        
        deleteMonitoredItems( monitoredItemsIdsToDelete, MonitorQueueSize2Subscription, g_session );
    }
}

safelyInvoke( modifyMonitoredItems592015 );
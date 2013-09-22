/*  Test 5.9.1 Error Test 13 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script creates a monitored item with index range where the specified attribute 
        is not an array or structure for the following data types:
            Bool, Byte, SByte, DateTime, Double, Float, Guid
            Int16, UInt16, Int32, UInt32, Int64, UInt64, XmlElement

    Revision History
        09-Oct-2009 AT: Initial Version.
        16-Nov-2009 NP: REVIEWED.
        23-Feb-2011 MI: Allow operation to succeed until issue is clarified (mantis 1437).
*/

function createMonitoredItems591Err013()
{
    // Nodes for all of the data types for this test
    var nodeNames = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic() );

    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for MonitoredItemsServiceSet was not created." );
    }
    else
    {
        var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
        var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
        g_session.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );
        
        var nCounter = 0;
        // Create our items one by one here
        for( var i=0; i<nodeNames.length; i++ )
        {
            createMonitoredItemsRequest.ItemsToCreate[nCounter] = new UaMonitoredItemCreateRequest();
            createMonitoredItemsRequest.ItemsToCreate[nCounter].ItemToMonitor.NodeId = nodeNames[i].NodeId;
            // Our non-array attribute for this test
            createMonitoredItemsRequest.ItemsToCreate[nCounter].ItemToMonitor.AttributeId = Attribute.DisplayName;
            createMonitoredItemsRequest.ItemsToCreate[nCounter].MonitoringMode = MonitoringMode.Reporting;
            createMonitoredItemsRequest.ItemsToCreate[nCounter].ItemToMonitor.IndexRange = "0:1";
            createMonitoredItemsRequest.ItemsToCreate[nCounter].RequestedParameters.ClientHandle = i;
            createMonitoredItemsRequest.ItemsToCreate[nCounter].RequestedParameters.SamplingInterval = 1000;
            createMonitoredItemsRequest.ItemsToCreate[nCounter].RequestedParameters.QueueSize = 1;
            createMonitoredItemsRequest.ItemsToCreate[nCounter].RequestedParameters.DiscardOldest = true;
            
            // Next index
            nCounter++;
        }
        
        // This better be equal
        AssertEqual( nCounter, createMonitoredItemsRequest.ItemsToCreate.length, "No. of items to create:" );
        
        createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
        createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;
        
        addLog( "Calling CreateMonitoredItems with '" + createMonitoredItemsRequest.ItemsToCreate.length + "' items being requested. Specifying index range for the non-array attribute 'DisplayName'." );
        
        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        addLog ( "The results are:" );
        if( uaStatus.isGood() )
        {
            var expectedServiceResult = [];
            for( var i=0; i<createMonitoredItemsRequest.ItemsToCreate.length; i++ )
            {
                expectedServiceResult[i] = new ExpectedAndAcceptedResults( StatusCode.BadIndexRangeInvalid);
                expectedServiceResult[i].addExpectedResult(StatusCode.Good);
            }
            
            // check the results and look for the above errors.
            checkCreateMonitoredItemsError( createMonitoredItemsRequest, createMonitoredItemsResponse, expectedServiceResult );
            
            // if the server failed and did in fact the create the monitored items, clean them up
            for( i = 0; i < createMonitoredItemsResponse.Results.length; i++ )
            {
                if( createMonitoredItemsResponse.Results[i].StatusCode.isGood() )
                {
                    deleteMonitoredItems( [ createMonitoredItemsResponse.Results[i].MonitoredItemId ], MonitorBasicSubscription, g_session );
                }
            }
        }
        else
        {
            addError( "createMonitoredItems() returned bad status: " + uaStatus, uaStatus );
        }
    }
}

safelyInvoke( createMonitoredItems591Err013 );
/*  Test 5.9.1 Error Test 27 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script creates a ByteStringArray and StringArray item with an invalid
        IndexRange: “0-0,2-1”.

    Revision History
        09-Oct-2009 AT: Initial Version.
        16-Nov-2009 NP: REVIEWED.
        13-Dec-2009 DP: Exit with a warning (rather than an error) if no array settings are set.
*/

function createMonitoredItems591Err027()
{
    // Nodes for all of the data types for this test
    var nodeNames = [
        "/Server Test/NodeIds/Static/All Profiles/Arrays/ByteString",
        "/Server Test/NodeIds/Static/All Profiles/Arrays/String"
    ];

    var items = MonitoredItem.fromSettings( NodeIdSettings.ArraysStatic(), 0 );
    if( items === null || items.length === 0 )
    {
        addSkipped( "Arrays" );
        return;
    }

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
        for( var i=0; i<items.length; i++ )
        {
            // Get the value of the setting, and make sure it contains a value
            createMonitoredItemsRequest.ItemsToCreate[nCounter] = new UaMonitoredItemCreateRequest();
            createMonitoredItemsRequest.ItemsToCreate[nCounter].ItemToMonitor.NodeId = items[i].NodeId;
            createMonitoredItemsRequest.ItemsToCreate[nCounter].ItemToMonitor.AttributeId = Attribute.Value;
            createMonitoredItemsRequest.ItemsToCreate[nCounter].MonitoringMode = MonitoringMode.Reporting;
            createMonitoredItemsRequest.ItemsToCreate[nCounter].ItemToMonitor.IndexRange = "0-0,2-1";
            createMonitoredItemsRequest.ItemsToCreate[nCounter].RequestedParameters.ClientHandle = i;
            createMonitoredItemsRequest.ItemsToCreate[nCounter].RequestedParameters.SamplingInterval = 1000;
            createMonitoredItemsRequest.ItemsToCreate[nCounter].RequestedParameters.QueueSize = 1;
            createMonitoredItemsRequest.ItemsToCreate[nCounter].RequestedParameters.DiscardOldest = true;

            // Next index
            nCounter++;
        }
        if( createMonitoredItemsRequest.ItemsToCreate.length === 0 )
        {
            addWarning( "Test cannot be completed: no ByteString or String array nodes have been specified in settings." );
            return;
        }

        // This better be equal
        AssertEqual( nCounter, createMonitoredItemsRequest.ItemsToCreate.length, "No. of items to create:" );

        createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
        createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;

        addLog( "Calling CreateMonitoredItems with '" + createMonitoredItemsRequest.ItemsToCreate.length + "' items being requested. Specifying index range: '0-0,2-1'. for the items." );

        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        addLog ( "The results are:" );
        if( uaStatus.isGood() )
        {
            var expectedServiceResult = [];
            for( i=0; i<createMonitoredItemsRequest.ItemsToCreate.length; i++ )
            {
                expectedServiceResult[i] = new ExpectedAndAcceptedResults( StatusCode.BadIndexRangeInvalid);                
            }

            // check the results and look for the above errors.
            checkCreateMonitoredItemsError( createMonitoredItemsRequest, createMonitoredItemsResponse, expectedServiceResult );

            // clean up (if required)
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
            addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        }
    }
}

safelyInvoke( createMonitoredItems591Err027 );
/*  
    Description:
        Example for receiving events
*/

eventsExample1();

function eventsExample1()
{
    const FILTERNAMES = ["SourceName", "Message", "Severity", "ReceiveTime"];

    // set event filter
    var filter = new UaExtensionObject();
    var eventFilter = new UaEventFilter();

    // WHERE CLAUSE(s)
    /* Structure is:
            Where = UaContentFilter()
                Elements[0] = new UaContentFilterElement();
                    Elements[0].FilterOperator = Equals (equals, requires 2 operands
                    Elements[0].FilterOperands[0] = new ...
                    Elements[0].FilterOperands[1] = new ...
    */
    
    // This works by adding 2 WHERE clauses, as follows:
    //    Clause #1 -- CAST statement, to convert "message" into a String 
    //    Clause #2 -- Use the LIKE predicate to compare the above element to "%"

    eventFilter.WhereClause = new UaContentFilter();
    eventFilter.WhereClause.Elements = new UaContentFilterElements();

    var filterOperand1 = new UaExtensionObject();
    var operand1 = new UaSimpleAttributeOperand();
    operand1.AttributeId = Attribute.Value;
    operand1.BrowsePath = new UaQualifiedNames();
    operand1.BrowsePath[0].Name = "Severity";
    operand1.BrowsePath[0].NamespaceIndex = 0;
    operand1.TypeDefinitionId = new UaNodeId( Identifier.BaseEventType );
    filterOperand1.setSimpleAttributeOperand( operand1 );

    // Now to add the % symbol that we want to search/filter on
    var filterOperand2 = new UaExtensionObject();
    var operand2 = new UaLiteralOperand();
    operand2.Value = new UaVariant();
    operand2.Value.setInt16( 500 ); // CHANGE THIS NUMBER TO 900 = NO MORE EVENTS!
    filterOperand2.setLiteralOperand( operand2 );
    
    eventFilter.WhereClause.Elements[0] = new UaContentFilterElement();
    eventFilter.WhereClause.Elements[0].FilterOperator = FilterOperator.GreaterThanOrEqual;
    eventFilter.WhereClause.Elements[0].FilterOperands = new UaExtensionObjects();
    eventFilter.WhereClause.Elements[0].FilterOperands[0] = filterOperand1;
    eventFilter.WhereClause.Elements[0].FilterOperands[1] = filterOperand2;
    

    // SELECT CLAUSE(s)
    eventFilter.SelectClauses = new UaSimpleAttributeOperands();
    for( var s=0; s<FILTERNAMES.length; s++ ) // 's' for Select
    {
        // fill clause for SourceName
        eventFilter.SelectClauses[s].AttributeId = Attribute.Value;
        eventFilter.SelectClauses[s].TypeDefinitionId = new UaNodeId(Identifier.BaseEventType, 0);
        eventFilter.SelectClauses[s].BrowsePath[0].Name = FILTERNAMES[s];
        eventFilter.SelectClauses[s].BrowsePath[0].NamespaceIndex = 0;
    }// for e...


    // set filter
    filter.setEventFilter( eventFilter );

    

    var monitoredItems = MonitoredItem.fromNodeIds( [ new UaNodeId( Identifier.Server, 0 ) ], Attribute.EventNotifier, "", MonitoringMode.Reporting, true, filter, 10, 0, TimestampsToReturn.Both );
    
    if( createMonitoredItems( monitoredItems, TimestampsToReturn.Both, MonitorEventsSubscription, g_session ) )
    {
        const MAXCOUNT = 10;
        var publishService = new Publish( g_session );
        for( var publishCount=0; publishCount<MAXCOUNT; publishCount++ )
        {
            print( "Publish() call " + (1 + publishCount) + " of " + MAXCOUNT );
            if( publishService.Execute() )
            {
                if( publishService.CurrentlyContainsData )
                {
                    publishService.PrintEvents();
                }
            }
        }
        
        deleteMonitoredItems( monitoredItems, MonitorEventsSubscription, g_session );
    }
}

function eventsExample_WhereLIKE()
{
    const FILTERNAMES = ["SourceName", "Message", "Severity", "ReceiveTime"];

    // set event filter
    var filter = new UaExtensionObject();
    var eventFilter = new UaEventFilter();

    // WHERE CLAUSE(s)
    /* Structure is:
            Where = UaContentFilter()
                Elements[0] = new UaContentFilterElement();
                    Elements[0].FilterOperator = Equals (equals, requires 2 operands
                    Elements[0].FilterOperands[0] = new ...
                    Elements[0].FilterOperands[1] = new ...
    */
    
    // This works by adding 2 WHERE clauses, as follows:
    //    Clause #1 -- CAST statement, to convert "message" into a String 
    //    Clause #2 -- Use the LIKE predicate to compare the above element to "%"

    // STEP 1, is to add a CAST... to convert "Message" into a STRING
    var filterOperand1 = new UaExtensionObject();
    var operand1 = new UaSimpleAttributeOperand();
    operand1.AttributeId = Attribute.Value;
    operand1.BrowsePath = new UaQualifiedNames();
    operand1.BrowsePath[0].Name = "Message";
    operand1.BrowsePath[0].NamespaceIndex = 0;
    operand1.TypeDefinitionId = new UaNodeId( Identifier.BaseEventType );
    filterOperand1.setSimpleAttributeOperand( operand1 );
    // now add the other operand, which in this case is the data-type we want to CAST TO! (string)
    var filterOperand2 = new UaExtensionObject();
    var operand2 = new UaLiteralOperand();
    operand2.Value = new UaVariant();
    operand2.Value.setNodeId( new UaNodeId( Identifier.String ) );
    filterOperand2.setLiteralOperand( operand2 );

    eventFilter.WhereClause = new UaContentFilter();
    eventFilter.WhereClause.Elements = new UaContentFilterElements();

    // add the above into an element, which will be inserted into the WHERE clause.
    var element1 = new UaContentFilterElement();
    element1.FilterOperator = FilterOperator.Cast;
    element1.FilterOperands = new UaExtensionObjects();
    element1.FilterOperands[0] = filterOperand1;
    element1.FilterOperands[1] = filterOperand2;
    eventFilter.WhereClause.Elements[0] = element1;
    
    // Now to add the % symbol that we want to search/filter on
    var filterOperand3 = new UaExtensionObject();
    var operand3 = new UaLiteralOperand();
    operand3.Value = new UaVariant();
    operand3.Value.setString( "%" );
    filterOperand3.setLiteralOperand( operand3 );
    
    eventFilter.WhereClause.Elements[1] = new UaContentFilterElement();
    eventFilter.WhereClause.Elements[1].FilterOperator = FilterOperator.Like;
    eventFilter.WhereClause.Elements[1].FilterOperands = new UaExtensionObjects();
    eventFilter.WhereClause.Elements[1].FilterOperands[0] = element1; // this is the CAST element
    eventFilter.WhereClause.Elements[1].FilterOperands[1] = filterOperand3;
    

    // SELECT CLAUSE(s)
    eventFilter.SelectClauses = new UaSimpleAttributeOperands();
    for( var s=0; s<FILTERNAMES.length; s++ ) // 's' for Select
    {
        // fill clause for SourceName
        eventFilter.SelectClauses[s].AttributeId = Attribute.Value;
        eventFilter.SelectClauses[s].TypeDefinitionId = new UaNodeId(Identifier.BaseEventType, 0);
        eventFilter.SelectClauses[s].BrowsePath[0].Name = FILTERNAMES[s];
        eventFilter.SelectClauses[s].BrowsePath[0].NamespaceIndex = 0;
    }// for e...


    // set filter
    filter.setEventFilter( eventFilter );

    

    var monitoredItems = MonitoredItem.fromNodeIds( [ new UaNodeId( Identifier.Server, 0 ) ], Attribute.EventNotifier, "", MonitoringMode.Reporting, true, filter, 10, 0, TimestampsToReturn.Both );
    
    if( createMonitoredItems( monitoredItems, TimestampsToReturn.Both, MonitorEventsSubscription, g_session ) )
    {
        const MAXCOUNT = 10;
        var publishService = new Publish( g_session );
        for( var publishCount=0; publishCount<MAXCOUNT; publishCount++ )
        {
            print( "Publish() call " + (1 + publishCount) + " of " + MAXCOUNT );
            if( publishService.Execute() )
            {
                if( publishService.CurrentlyContainsData )
                {
                    publishService.PrintEvents();
                }
            }
        }
        
        deleteMonitoredItems( monitoredItems, MonitorEventsSubscription, g_session );
    }
}

function eventsExample2()
{
    if( !MonitorEventsSubscription.SubscriptionCreated )
    {
        addError( "Subscription for Monitor Events was not created." );
    }
    else
    {
        var eventsNode = new UaNodeId( Identifier.Server, 0 );
        
        // Create a single monitored item
        var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
        var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
        g_session.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );
        
        createMonitoredItemsRequest.SubscriptionId = MonitorEventsSubscription.SubscriptionId;
        createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;
        createMonitoredItemsRequest.ItemsToCreate[0] = new UaMonitoredItemCreateRequest();
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = eventsNode; //new UaNodeId("MyDemoObject", 5);
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.AttributeId = Attribute.EventNotifier;
        createMonitoredItemsRequest.ItemsToCreate[0].MonitoringMode = MonitoringMode.Reporting;
        
        // fill requested parameters
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.ClientHandle = 0x1234;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.SamplingInterval = 0;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.QueueSize = 0;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.DiscardOldest = true;
        
        // set event filter
        var filter = new UaExtensionObject();
        var eventFilter = new UaEventFilter();
        eventFilter.SelectClauses = new UaSimpleAttributeOperands();
        
        // fill clause for SourceName
        eventFilter.SelectClauses[0].AttributeId = Attribute.Value;
        eventFilter.SelectClauses[0].TypeDefinitionId = new UaNodeId(Identifier.BaseEventType, 0);
        eventFilter.SelectClauses[0].BrowsePath[0].Name = "SourceName";
        eventFilter.SelectClauses[0].BrowsePath[0].NamespaceIndex = 0;
        
        // fill clause for Message
        eventFilter.SelectClauses[1].AttributeId = Attribute.Value;
        eventFilter.SelectClauses[1].TypeDefinitionId = new UaNodeId(Identifier.BaseEventType, 0);
        eventFilter.SelectClauses[1].BrowsePath[0].Name = "Message";
        eventFilter.SelectClauses[1].BrowsePath[0].NamespaceIndex = 0;
        
        // fill clause for Severity
        eventFilter.SelectClauses[2].AttributeId = Attribute.Value;
        eventFilter.SelectClauses[2].TypeDefinitionId = new UaNodeId(Identifier.BaseEventType, 0);
        eventFilter.SelectClauses[2].BrowsePath[0].Name = "Severity";
        eventFilter.SelectClauses[2].BrowsePath[0].NamespaceIndex = 0;
        
        // fill clause for ReceiveTime
        eventFilter.SelectClauses[3].AttributeId = Attribute.Value;
        eventFilter.SelectClauses[3].TypeDefinitionId = new UaNodeId(Identifier.BaseEventType, 0);
        eventFilter.SelectClauses[3].BrowsePath[0].Name = "ReceiveTime";
        eventFilter.SelectClauses[3].BrowsePath[0].NamespaceIndex = 0;
        
        // set filter
        filter.setEventFilter(eventFilter);    
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.Filter = filter;
        
        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        if( uaStatus.isGood() )
        {
            checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse);
    
            var unacknowledgedSequenceNumbers = new IntegerSet();        
            var maxNumberOfEventNotificationsToReceive = 3;
            var numberOfEventNotificationsReceived = 0;
            
            for(var i = 0; i < 20; i++)
            { 
                // call publish
                var publishRequest = new UaPublishRequest();
                var publishResponse = new UaPublishResponse();
                g_session.buildRequestHeader( publishRequest.RequestHeader );
    
                // if we have unacknowledged sequence numbers add them to the request
                var counter = 0;
                while(unacknowledgedSequenceNumbers.size() > 0)
                {
                    publishRequest.SubscriptionAcknowledgements[counter].SequenceNumber = unacknowledgedSequenceNumbers.atIndex(0);
                    publishRequest.SubscriptionAcknowledgements[counter].SubscriptionId = MonitorEventsSubscription.SubscriptionId;
                    unacknowledgedSequenceNumbers.remove(unacknowledgedSequenceNumbers.atIndex(0));                
                    counter++;
                }
    
                var uaStatus = g_session.publish( publishRequest, publishResponse );
                if( uaStatus.isGood() )
                {
                    checkPublishValidParameter( publishRequest, publishResponse );
                    
                    // add sequence number to list 
                    unacknowledgedSequenceNumbers.insert( publishResponse.NotificationMessage.SequenceNumber );
                    
                    if( publishResponse.NotificationMessage.NotificationData.length > 0 )
                    {
                        var eventNotificationList = publishResponse.NotificationMessage.NotificationData[0].toEventNotificationList();
                        
                        addLog( "Received EventNotificationList with " + eventNotificationList.Events.length + " Events" );
                        
                        for(var j = 0; j < eventNotificationList.Events.length; j++)
                        {
                            addLog( "Event[" + j + "]: " + eventNotificationList.Events[j]);                        
                        }
                        
                        numberOfEventNotificationsReceived++;
                        if(numberOfEventNotificationsReceived == maxNumberOfEventNotificationsToReceive)
                        {
                            break;
                        }
                    }
                    else
                    {
                        addLog("No Data");
                    }
                }
                else
                {
                    addError( "Publish() status " + uaStatus, uaStatus );
                }
                wait(1000);
            }
            
    
            // delete the items we added in this test
            var monitoredItemsIdsToDelete = new UaUInt32s();
            for( var i=0; i< createMonitoredItemsResponse.Results.length; i++ )
            {
                monitoredItemsIdsToDelete[i] = createMonitoredItemsResponse.Results[i].MonitoredItemId;
            }        
            deleteMonitoredItems( monitoredItemsIdsToDelete, MonitorEventsSubscription, g_session );
    
        }
        else
        {
            addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
        }
    }
}
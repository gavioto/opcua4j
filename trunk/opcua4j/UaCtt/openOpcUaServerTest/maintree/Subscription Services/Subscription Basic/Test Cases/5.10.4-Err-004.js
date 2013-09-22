/*  Test 5.10.4 Error test 4 prepared by Matthias Isele; matthias.isele@ascolab.com
    Description:
        Acknowledge the same sequence number twice, in 2 different calls.
        Accept a return of Bad_SequenceNumberUnknown or Bad_SequenceNumberInvalid.

    Revision History
        2009-08-14 MI: Initial version.
        2009-11-19 NP: Revised to meet the new test-case definition.
                       REVIEWED.
        22-Mar-2010 NP: Added "TimeoutHint" selection to the Publish header.
        07-Feb-2011 NP: Added Bad_SequenceNumberInvalid as accepted reply (credit: MI)
*/

function publish5104Err004()
{
    // create subscription    
    basicSubscription = new Subscription();
    createSubscription( basicSubscription, g_session );

    // create monitored items
    var MonitoredItems = MonitoredItem.fromSettings( [
        NodeIdSettings.GetAScalarStaticNodeIdSetting("iud").name,
        NodeIdSettings.GetAScalarStaticNodeIdSetting("udi").name ], 0 );
 
    if( MonitoredItems === null || MonitoredItems.length === 0 )
    {
        addSkipped( "Static Scalar - 2 Nodes needed" );
    }

    if( !createMonitoredItems( MonitoredItems, TimestampsToReturn.Both, basicSubscription, g_session ) )
    {
        return;
    }

    addLog( "Waiting 1 publish cycle: " + basicSubscription.RevisedPublishingInterval + " msecs" );
    wait( basicSubscription.RevisedPublishingInterval );

    // call publish to get the first sequence number
    var receivedSequenceNumbers = new IntegerSet();
    var unacknowledgedSequenceNumbers = new IntegerSet();
    var acknowledgedSequenceNumbers = new IntegerSet();

    var publishRequest = new UaPublishRequest();
    var publishResponse = new UaPublishResponse();
    g_session.buildRequestHeader( publishRequest.RequestHeader );
    publishRequest.RequestHeader.TimeoutRequest = basicSubscription.TimeoutHint;

    var uaStatus = g_session.publish( publishRequest, publishResponse );
    if( uaStatus.isGood() )
    {
        checkPublishValidParameter( publishRequest, publishResponse );

        // add new sequence number to list of received SequenceNumbers
        receivedSequenceNumbers.insert( publishResponse.NotificationMessage.SequenceNumber );

        // add all unacknowledged SequenceNumbers to list of unacknowledged SequenceNumbers
        for( var i = 0; i < publishResponse.AvailableSequenceNumbers.length; i++ )
        {
            unacknowledgedSequenceNumbers.insert( publishResponse.AvailableSequenceNumbers[i] );
        }
    }
    else
    {
        addError( "Publish() status " + uaStatus, uaStatus );
    }

    addLog( "receivedSequenceNumbers = " + receivedSequenceNumbers );
    addLog( "unacknowledgedSequenceNumbers = " + unacknowledgedSequenceNumbers );
    addLog( "acknowledgedSequenceNumbers = " + acknowledgedSequenceNumbers );

    // call publish acknowledging the sequence number received above
    var publishRequest = new UaPublishRequest();
    var publishResponse = new UaPublishResponse();
    g_session.buildRequestHeader( publishRequest.RequestHeader );

    var sequenceNumber = receivedSequenceNumbers.atIndex( 0 );

    publishRequest.SubscriptionAcknowledgements[0].SequenceNumber = sequenceNumber;
    publishRequest.SubscriptionAcknowledgements[0].SubscriptionId = basicSubscription.SubscriptionId;

    var uaStatus = g_session.publish( publishRequest, publishResponse );
    if( uaStatus.isGood() )
    {
        checkPublishValidParameter( publishRequest, publishResponse );

        // remove acknowledged sequence numbers from list of unacknowledged SequenceNumbers
        // add acknowledged sequence numbers to list of acknowledged SequenceNumbers
        for( var i = 0; i < publishResponse.Results.length; i++ )
        {
            if( publishResponse.Results[i].isGood() )
            {
                unacknowledgedSequenceNumbers.remove( publishRequest.SubscriptionAcknowledgements[i].SequenceNumber );
                acknowledgedSequenceNumbers.insert( publishRequest.SubscriptionAcknowledgements[i].SequenceNumber );
            }
        }

        // add new sequence numbers to list of unacknowledged SequenceNumbers
        // add new sequence numbers to list of received SequenceNumbers
        for( var i = 0; i < publishResponse.AvailableSequenceNumbers.length; i++ )
        {        
            unacknowledgedSequenceNumbers.insert( publishResponse.AvailableSequenceNumbers[i] );
            receivedSequenceNumbers.insert( publishResponse.AvailableSequenceNumbers[i] );
        }
    }
    else
    {
        addError( "Publish() status " + uaStatus, uaStatus );
    }

    addLog( "receivedSequenceNumbers = " + receivedSequenceNumbers );
    addLog( "unacknowledgedSequenceNumbers = " + unacknowledgedSequenceNumbers );
    addLog( "acknowledgedSequenceNumbers = " + acknowledgedSequenceNumbers );

    //call publish again acknowledging the same sequence number as above
    var publishRequest = new UaPublishRequest();
    var publishResponse = new UaPublishResponse();
    g_session.buildRequestHeader( publishRequest.RequestHeader );

    publishRequest.SubscriptionAcknowledgements[0].SequenceNumber = sequenceNumber;
    publishRequest.SubscriptionAcknowledgements[0].SubscriptionId = basicSubscription.SubscriptionId;

    var uaStatus = g_session.publish( publishRequest, publishResponse );
    if( uaStatus.isGood() )
    {
        // this is an array of ExpectedAndAcceptedResult. Size of the array = number of SubscriptionIds
        var expectedOperationResultsArray = [];
        expectedOperationResultsArray[0] = new ExpectedAndAcceptedResults( StatusCode.BadSequenceNumberUnknown );
        expectedOperationResultsArray[0].addAcceptedResult( StatusCode.BadSequenceNumberInvalid );
        checkPublishError( publishRequest, publishResponse, expectedOperationResultsArray );

        // add "deprecated" message if BadSequenceNumberInvalid was found
        if( publishResponse.Results[0].StatusCode == StatusCode.BadSequenceNumberInvalid )
        {
            addWarning( "The Bad_SequenceNumberInvalid return code has been deprecated, use Bad_SequenceNumberUnknown instead." );
        }

        // remove acknowledged sequence numbers from list of unacknowledged SequenceNumbers
        // add acknowledged sequence numbers to list of acknowledged SequenceNumbers
        for( var i = 0; i < publishResponse.Results.length; i++ )
        {
            if( publishResponse.Results[i].isGood() )
            {
                unacknowledgedSequenceNumbers.remove( publishRequest.SubscriptionAcknowledgements[i].SequenceNumber );
                acknowledgedSequenceNumbers.insert( publishRequest.SubscriptionAcknowledgements[i].SequenceNumber );
            }
        }

        // add new sequence numbers to list of unacknowledged SequenceNumbers
        // add new sequence numbers to list of received SequenceNumbers
        for( var i = 0; i < publishResponse.AvailableSequenceNumbers.length; i++ )
        {
            unacknowledgedSequenceNumbers.insert( publishResponse.AvailableSequenceNumbers[i] );
            receivedSequenceNumbers.insert( publishResponse.AvailableSequenceNumbers[i] );
        }
    }
    else
    {
        addError( "Publish() status " + uaStatus, uaStatus );
    }
    addLog( "receivedSequenceNumbers = " + receivedSequenceNumbers );
    addLog( "unacknowledgedSequenceNumbers = " + unacknowledgedSequenceNumbers );
    addLog( "acknowledgedSequenceNumbers = " + acknowledgedSequenceNumbers );

    // delete the items we added in this test
    var monitoredItemsIdsToDelete = new UaUInt32s();
    var j = 0;
    for( var i = 0; i< MonitoredItems.length; i++ )
    {
        if( MonitoredItems[i].IsCreated )
        {
            monitoredItemsIdsToDelete[j++] = MonitoredItems[i].MonitoredItemId;
        }
    }
    deleteMonitoredItems( monitoredItemsIdsToDelete, basicSubscription, g_session );
    // delete the subscription we added here 
    deleteSubscription( basicSubscription, g_session );
}

safelyInvoke( publish5104Err004 );
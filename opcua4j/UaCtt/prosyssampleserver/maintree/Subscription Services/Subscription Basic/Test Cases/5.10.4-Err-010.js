/*  Test 5.10.4 Error Test 10 prepared by Anand Taparia; ataparia@kepwaare.com
    Description:
        Script calls publish more than the server can handle.

    Revision History
        29-Sep-2009 AT: Initial version.
        20-Nov-2009 NP: REVIEWED/INCORRECT. Needs to be re-written once Async Publish available in the CTT.
        22-Mar-2010 NP: Added "TimeoutHint" selection to the Publish header.
*/

function publish5104Err010()
{
    notImplemented( "This script is partially complete. The method that controls the MAX # of publish() calls that are supported needs to be implemented. It is currently hard-coded and is therefore unreliable." );
return;
    const MAXPUBLISHREQUESTSALLOWED = 100;

    // step 1, create the subscription
    basicSubscription = new Subscription();
    createSubscription( basicSubscription, g_session );

    // step 2 - adding some items to subscribe to (monitor).
    // define the monitored items and then make the call to monitor them!
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 2 );
    
    // 4 params are: (1) items to monitor (2) timestamps (3) subscription (4) sesssion
    createMonitoredItems( items, TimestampsToReturn.Both, basicSubscription, g_session );
    
    // call publish
    // Stree the server here with publish requests. Lets see when the server
    // reaches its limit (max no. of publish requests it can queue)     
    var publishRequest = new UaPublishRequest();
    var publishResponse = new UaPublishResponse();
    g_session.buildRequestHeader( publishRequest.RequestHeader );
    publishRequest.RequestHeader.TimeoutRequest = basicSubscription.TimeoutHint;

    var nCountOfPublishRequests = 0;
    while (true)
    {
        var uaStatus = g_session.publish( publishRequest, publishResponse );
        nCountOfPublishRequests++;
        if( uaStatus.isGood() )
        {
            // Check if the server has reached it's limit
            if( publishResponse.ResponseHeader.ServiceResult.StatusCode == StatusCode.BadTooManyPublishRequests )
            {
                addLog( "The server has reached its limit. The maximum no. of publish calls it allowed is: " + nCountOfPublishRequests );
                
                // Just a check for other returned parameters in the response 
                var expectedError = new ExpectedAndAcceptedResults();
                expectedError.addExpectedResult( StatusCode.BadTooManyPublishRequests );
                checkPublishFailed ( publishRequest, publishResponse, expectedError );
                break;
            }
            
            // We do not know the limits of individual servers. For now we will stop
            // at MAXPUBLISHREQUESTSALLOWED
            if ( nCountOfPublishRequests >= MAXPUBLISHREQUESTSALLOWED)
            {
                addLog( "Stopping the test at " + nCountOfPublishRequests + " publish requests. The server hasn't reached it's limit yet." );
                break;
            }
        }
        else
        {
            addError( "Publish() status " + uaStatus, uaStatus );
            break;
        }
        
        addLog( "Publish count #" + nCountOfPublishRequests );
    }

    // delete the items we added in this test
    var monitoredItemsIdsToDelete = new UaUInt32s()
    var j = 0
    for(var i = 0; i< items.length; i++)
    {
        if(items[i].IsCreated)
        {
            monitoredItemsIdsToDelete[j++] = items[i].MonitoredItemId
        }
    }        
    deleteMonitoredItems(monitoredItemsIdsToDelete, basicSubscription, g_session)

    // delete the subscription we added here 
    deleteSubscription( basicSubscription, g_session );
}

safelyInvoke( publish5104Err010 );
/*  Test 5.10.5 Error Test 1 prepared by Anand Taparia; ataparia@kepwaare.com
    Description:
        Script calls republish when no subscriptions have been created.

    Revision History
        22-Sep-2009 AT: Initial version.
        24-Nov-2009 NP: Revised to meet new test-case requirements.
                        REVIEWED.
*/

function republish5105err001()
{
    // No subscription/monitored items required for this test
    // Call republish
    var republishRequest = new UaRepublishRequest();
    var republishResponse = new UaRepublishResponse();
    g_session.buildRequestHeader(republishRequest.RequestHeader);
    var uaStatus = g_session.republish(republishRequest, republishResponse);
    if( uaStatus.isGood() )
    {
        var ExpectedOperationResultsArray = new ExpectedAndAcceptedResults( StatusCode.BadSubscriptionIdInvalid );
        checkRepublishFailed( republishRequest, republishResponse, ExpectedOperationResultsArray );
    }
    else
    {
        addError( "Republish() status " + uaStatus, uaStatus );
    }
}

safelyInvoke( republish5105err001 );
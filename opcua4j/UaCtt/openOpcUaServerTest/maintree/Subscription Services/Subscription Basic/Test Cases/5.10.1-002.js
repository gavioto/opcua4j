/*  Test 5.10.1 test 2 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Creates a subscription passing the requestedPublishingInterval as 1.

    Revision History
        01-Sep-2009 NP: Initial version.
        22-Oct-2009 NP: Revised to use new script library class objects.
        20-Nov-2009 NP: REVIEWED.
        27-Nov-2009 DP: Changed publish delay to the revised publishing interval.

    MORE INFORMATION:
        Refer to Test Lab Part 8 specifications, section 5.10.1.
*/

function createSubscription5101002()
{
    const REQUESTEDPUBLISHINGINTERVAL = 1;
    const PUBLISHINGENABLED = true;
    const REQUESTEDLIFTETIME = 15;
    const REQUESTEDMAXKEEPALIVE = 5;
    const MAXNOTIFICATIONS = 0;
    const PRIORITY = 0;
    
    var subscription = new Subscription( REQUESTEDPUBLISHINGINTERVAL, PUBLISHINGENABLED, REQUESTEDLIFTETIME, REQUESTEDMAXKEEPALIVE, MAXNOTIFICATIONS, PRIORITY );
    if( createSubscription( subscription, g_session ) )
    {
        /* check the value of the revisedPublishingInterval.... we're looking
           to see if it is still 1, or if it has been changed. */
        if( subscription.RevisedPublishingInterval == 0 )
        {
            addError( "Server revised the publishing interval to 0, which is not allowed." );
        }
        else
        {
            // check that the subscription works anyway.
            if( createMonitoredItems( defaultStaticItem, TimestampsToReturn.Both, subscription, g_session ) )
            {
                wait( subscription.RevisedPublishingInterval );
                AssertEqual( true, publishService.Execute() && publishService.CurrentlyContainsData() );
                deleteMonitoredItems( defaultStaticItem, subscription, g_session );
            }
        }
    }

    // delete the subscription we just created
    deleteSubscription( subscription, g_session );
    // clear the publish object's properties...
    publishService.Clear();
}

safelyInvoke( createSubscription5101002 );
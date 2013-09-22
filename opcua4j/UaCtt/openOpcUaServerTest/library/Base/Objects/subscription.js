/* Object holding all parameters needed for a subscription
   Revision History:
       01-Jul-2009 DEV: Initial version.
       22-Mar-2010 NP: Added "TimeoutHint" property.
*/

include( "./library/Base/SettingsUtilities/validate_setting.js" );

function Subscription( publishingInterval, publishingEnabled, requestedLifetimeCount, requestedMaxKeepAliveCount, maxNotificationsPerPublish, priority )
{
    this.SubscriptionId = 0;
    this.LifetimeCount = 15;
    this.MaxKeepAliveCount = 5;
    this.MaxNotificationsPerPublish = 0;
    this.Priority = 0;
    this.SubscriptionCreated = false;

    // adding properties to capture the Revised parameters
    this.PublishingInterval = 1000;
    this.PublishingEnabled = true;
    this.RevisedPublishingInterval = -1;
    this.RevisedLifetimeCount = -1;
    this.RevisedMaxKeepAliveCount = -1;
    this.TimeoutHint = -1;

    // some statistics
    this.DataChangeNotificationCount = 0;
    this.SequenceNumber = -1;

    this.SetParameters = function( publishingInterval, publishingEnabled, requestedLifetimeCount, requestedMaxKeepAliveCount, maxNotificationsPerPublish, priority )
    {
        if( requestedLifetimeCount !== undefined && requestedLifetimeCount !== null )
        {
            this.LifetimeCount = requestedLifetimeCount;
        }
        if( requestedMaxKeepAliveCount !== undefined && requestedMaxKeepAliveCount !== null )
        {
            this.MaxKeepAliveCount = requestedMaxKeepAliveCount;
        }
        if( publishingInterval !== undefined && publishingInterval !== null )
        {
            this.PublishingInterval = publishingInterval;
        }
        else
        {
            // no publishingInterval specified, check the settings.
            this.PublishingInterval = getSettingValueOrDefaultValue( "/Server Test/Default Subscription Publish Interval", 250 );
            // value validation
            if( this.PublishingInterval < 1 )
            {
                addError( "The setting \"/Server Test/Default Subscription Publish Interval\" must be at least one" );
                this.PublishingInterval = 1000;
            }
        }
        
        if( requestedLifetimeCount == undefined )
        {
            // calculate a lifetime based on our setting (+ 2 to ensure a value of at least 3)
            var totalTimeInSec = getSettingValueOrDefaultValue( "/Server Test/Subscription Timeout", 15 );
            var totalTimeInMsec = 1000 * totalTimeInSec;
            this.LifetimeCount = Math.ceil( totalTimeInMsec / this.PublishingInterval ) + 2;
            if( requestedMaxKeepAliveCount == undefined && ( this.MaxKeepAliveCount * 3 ) > this.LifetimeCount )
            {
                // adjust MaxKeepAliveCount to a valid value
                this.MaxKeepAliveCount = Math.floor( this.LifetimeCount / 3 );
            }
        }

        if( publishingEnabled !== undefined && publishingEnabled !== null )
        {
            this.PublishingEnabled = publishingEnabled;
        }
        // set the optional parameters
        if( maxNotificationsPerPublish !== undefined && maxNotificationsPerPublish !== null )
        {
            this.MaxNotificationsPerPublish = maxNotificationsPerPublish;
        }
        if( priority !== undefined && priority !== null )
        {
            this.Priority = priority;
        }
    };

    if( arguments.length > 0 )
    {
        this.SetParameters( publishingInterval, publishingEnabled, requestedLifetimeCount, requestedMaxKeepAliveCount, maxNotificationsPerPublish, priority );
    }
    else
    {
        this.SetParameters( null );
    }
    
    this.Clone = function()
    {
        var newSubscription = new Subscription( this.PublishingInterval, this.PublishingEnabled, 
            this.LifetimeCount, this.MaxKeepAliveCount, this.MaxNotificationsPerPublish, this.Priority );
        newSubscription.RevisedPublishingInterval = this.RevisedPublishingInterval;
        newSubscription.RevisedLifetimeCount = this.RevisedLifetimeCount;
        newSubscription.RevisedMaxKeepAliveCount = this.RevisedMaxKeepAliveCount;
        return( newSubscription );
    }
}

function SubscriptionsToIdsArray( subscriptions )
{
    if( arguments.length !== 1 )
    {
        throw( "'SubscriptionsToIdsArray' requires 1 parameter of type 'Subscription' array." );
    }

    var ids = [];
    if( subscriptions.length !== undefined )
    {
        for( var s=0; s<subscriptions.length; s++ ) // 's' = Subscription
        {
            ids.push( subscriptions[s].SubscriptionId );
        }// for s...
    }
    else if( subscriptions.SubscriptionId !== undefined )
    {
        ids.push( subscriptions.SubscriptionId );
    }
    else
    {
        throw( "'SubscriptionsToIdsArray' parameter not of type 'Subscription' or as an array of." );
    }
    return( ids );
}

/* TEST
include( "./library/Base/assertions.js" );
include( "./library/Base/SettingsUtilities/validate_setting.js")

var s
// no parameters
s = new Subscription();
// 1 param
s = new Subscription(333);
AssertEqual(333,s.PublishingInterval);
// 2 param
s = new Subscription(333,false);
AssertEqual(333,s.PublishingInterval);
AssertEqual(false,s.PublishingEnabled);
// 3 param
 s =new Subscription(333,false,17);
 AssertEqual(333,s.PublishingInterval);
 AssertEqual(false,s.PublishingEnabled);
 AssertEqual(17,s.LifetimeCount);
// 4 param
s = new Subscription(333,false,17,4);
AssertEqual(333,s.PublishingInterval);
AssertEqual(false,s.PublishingEnabled);
AssertEqual(17,s.LifetimeCount);
AssertEqual(4,s.MaxKeepAliveCount);
// 5 param
s = new Subscription(333,false,17,4,100);
AssertEqual(333,s.PublishingInterval);
AssertEqual(false,s.PublishingEnabled);
AssertEqual(17,s.LifetimeCount);
AssertEqual(4,s.MaxKeepAliveCount);
AssertEqual(100,s.MaxNotificationsPerPublish);
// 6 param
s = new Subscription(333,false,17,4,100,10);
AssertEqual(333,s.PublishingInterval);
AssertEqual(false,s.PublishingEnabled);
AssertEqual(17,s.LifetimeCount);
AssertEqual(4,s.MaxKeepAliveCount);
AssertEqual(100,s.MaxNotificationsPerPublish);
AssertEqual(10,s.Priority);
//*/
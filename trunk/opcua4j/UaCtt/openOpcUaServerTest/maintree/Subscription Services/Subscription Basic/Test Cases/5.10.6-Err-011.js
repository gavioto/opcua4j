/*  Test 5.10.6-Err-011 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Script creates more Subscriptions than a server can handle.
        Expects to receive Bad_TooManyOperations when creating that subscription that is beyond the server's ability.

    Revision History
        9-Jun-2011 NP: Initial version
*/

var subs = [];
var keepGoing = true;
var i=0;

var expectedResult = new ExpectedAndAcceptedResults( StatusCode.Good );
expectedResult.addExpectedResult( StatusCode.BadTooManySubscriptions );
expectedResult.addExpectedResult( StatusCode.BadTooManyOperations );
do
{
    addLog( "CREATING SUBSCRIPTION " + ( 1 + i ) );
    subs[i] = new Subscription();
    subs[i].LifetimeCount *= 10;
    subs[i].MaxKeepAliveCount *= 10;
    keepGoing = createSubscription( subs[i], g_session, expectedResult, true );
    if( keepGoing && subs[i].ServiceResult.isGood() )
    {
        i++;
    }
    else
    {
        keepGoing = false;
    }
    // fail-safe, for those systems without hard-limits
    if( i >= 1000 )
    {
        keepGoing = false;
        addLog( "ABORTING TEST after successfully creating 1,000 Subscriptions. This server appears to be constrained by the available resources only." );
    }
}while( keepGoing );

var maxSubs = i;
addLog( "SUBSCRIPTION LIMITED REACHED: " + maxSubs );

for( i=0; i<subs.length - 1; i++ )
{
    deleteSubscription( subs[i], g_session );
}//for i

//clean-up
subs = null;

addLog( maxSubs + " SUBSCRIPTIONS WERE CREATED." );
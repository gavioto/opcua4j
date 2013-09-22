/*  RESOURCE TESTING;
    prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        In a loop: 
            Calls BrowseNext() on the Server object in the address-space.
            The max # of references to return is 1, to ensure "paging" is possible.

    User Configurable Parameters:
        BROWSEDIRECTION = The browseDirection for the Browse call.

    Revision History
        06-Jan-2010 NP: Initial version.
*/

const BROWSEDIRECTION = BrowseDirection.Forward;

include( "./library/ResourceTesting/repetitiveCall.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/Browse.js" );
include( "./library/ServiceBased/ViewServiceSet/BrowseNext/BrowseNext.js" );

// this is the function that will be called repetitvely
function browseNextServerObject()
{
    if( browseNextHelper.Execute( serverObject, false ) )
    {
        print( browseNextHelper.ResultsToString() );
        // check if there is a continuationPoint, if not then we need to start
        // over by calling Browse().
        if( serverObject.ContinuationPoint.isEmpty() )
        {
            print( "*** END OF References Reached... starting test over by calling Browse()..." );
            browseHelper.Execute( serverObject, 1 );
        }
    }
}

function initializeBrowser()
{
    browseHelper = new Browse( g_session );
    if( !browseHelper.Execute( serverObject, 1 ) )
    {
        throw( "Browse failed, cannot move onto BrowseNext testing." );
    }
    browseNextHelper = new BrowseNext( g_session );
}

// create the variables needed in this script
var browseHelper;
var browseNextHelper;

var serverObject = new MonitoredItem( new UaNodeId( Identifier.ServerType ), 1 );
serverObject.BrowseDirection = BROWSEDIRECTION;

// Get the test control parameters from the settings
var loopCount = parseInt( readSetting( "/Advanced/ResourceTesting/SubscriptionServiceSetCallCount" ).toString() );

// Perform the iterative call loop
repetitivelyInvoke( initializeBrowser, browseNextServerObject, loopCount );

// clean-up
browseHelper = null;
serverObject = null;
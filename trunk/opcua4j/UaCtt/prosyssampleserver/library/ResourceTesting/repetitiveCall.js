/*  RESOURCE TESTING;
    prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Establishes a connection to a UA Server.
        Invokes a method (passed into the function) multiple times.
        Closes the connection to the UA Server.

    Revision History
        04-Jan-2010 NP: Initial version.
*/

include( "./library/Base/connect.js" );
include( "./library/Base/disconnect.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );
include( "./library/Base/warnOnce.js" );

// ************************************
// DEFINE a LOG file dedicated to storing log messages for resource checking
function resLog()
{
    this.inheritFrom = baseLogger;
    this.inheritFrom();
    this.baseMessage = "";
    this.baseOutput = addNotSupported;
    this.usage = "Auditing of the Resource checking routines.";
}
var _resLog;
if( _resLog=== undefined )
{
    _resLog= new resLog();
}

// ************************************

var g_session;
var g_channel;
var timeAtStart;

function repetitivelyInvoke( initializeFunction, functionToInvoke, numberOfIterations, connectOverride, disconnectOverride, timeoutOverride, testName )
{
    // Metrics on overall length of the test, start to finish
    timeAtStart = UaDateTime.utcNow();
    var timeoutTime = UaDateTime.utcNow();
    var maxTestTimeInSecs = parseInt( readSetting( "/Advanced/ResourceTesting/MaxTestTimeInSeconds" ).toString() );
    timeoutTime.addSeconds( maxTestTimeInSecs );
    var timeAtEnd = null;

    _resLog.store( "Beginning test " + ( testName !== undefined && testName !== null ? "'" + testName + "'" : "" ) + " starting at: " + timeAtStart );

    // Connect to the server 
    if( connectOverride === undefined || connectOverride === null )
    {
        g_channel = new UaChannel();
        g_session = new UaSession( g_channel );
        g_session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );
        if( !connect( g_channel, g_session ) ){ return; }
    }
    else
    {
        try
        {
            connectOverride();
        }
        catch( e )
        {
            addError( e.toString() );
            return; 
        }
    }

    // Get the test control parameters from the settings
    var callDelay = parseInt( readSetting( "/Advanced/ResourceTesting/InterCallDelay" ).toString() );

    // Safely try to execute the test. If an exception occurs then gracefully disconnect
    var i;
    try
    {
        // Invoke any initialize function, if applicable
        if( initializeFunction !== undefined && initializeFunction !== null )
        {
            initializeFunction();
        }

        // Metrics on length of the repetive testing
        var startOfRepetitive = UaDateTime.utcNow();
        var endOfRepetitive = null;

        // Perform the iterative call loop
        for( i=0; i<numberOfIterations; i++ )
        {
            // did the timeout period expire? if so then get out of this loop
            // BUT, do not do this if there is an override in place
            if( timeoutOverride === undefined || timeoutOverride === false )
            {
                if( UaDateTime.utcNow() > timeoutTime )
                {
                    print( "***** Prematurely exiting test. The Max Test Time (" + maxTestTimeInSecs + " seconds) has expired." );
                    break;
                }
            }
            print( "\nInvoking Test; call # " + (1+i) + " of " + numberOfIterations + "..." );
            functionToInvoke();
            if( callDelay !== 0 && i<(numberOfIterations-1) )
            {
                if( callDelay >= 1000 ) print( "Waiting " + callDelay + "ms before invoking next call..." );
                wait( callDelay );
            }
        }

        // calculate the difference from repetive testing
        endOfRepetitive = UaDateTime.utcNow();
    }
    catch( ex )
    {
        addError( ex.toString() );
    }

    // disconnect from server
    if( disconnectOverride !== undefined && disconnectOverride !== null )
    {
        disconnectOverride();
    }
    else
    {
        disconnect( g_channel, g_session );
    }

    // clean-up
    g_session = null;
    g_channel = null;

    // calculate total length of test
    timeAtEnd = UaDateTime.utcNow();
    var totalDiff = timeAtStart.msecsTo( timeAtEnd );
    var repetitiveDiff = startOfRepetitive.msecsTo( endOfRepetitive );

    print( "\n\n\nALL DONE!" );
    _resLog.store( "\tCalls: " + i, undefined, false );
    _resLog.store( "\tDuration: " + Math.ceil( totalDiff/1000 ) + " seconds (approx.)", undefined, false );
    _resLog.store( "Ending test " + ( testName !== undefined && testName !== null ? "'" + testName + "'" : "" ) + " at: " + timeAtEnd );
    print( "Total Test Took: " + totalDiff + " ms; or about " + Math.ceil(totalDiff/1000) + " secs. This includes connecting/disconnecting the UA Server." );
    print( "Task Repeat Count: " + numberOfIterations );
    print( "Repetitive Tasks Took: " + repetitiveDiff + " ms; or about " + Math.ceil(repetitiveDiff/1000) + " secs." );
}
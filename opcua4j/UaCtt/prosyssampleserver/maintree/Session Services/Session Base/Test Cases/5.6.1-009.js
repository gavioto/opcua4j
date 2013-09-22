/*  Prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Invoke CreateSession and then check if the session appears within the 
        server diagnostics.
        This script must first read the servers profile to see if diagnostics are 
        supported and if not then the test will simply exit (not a fail!).

    Revision History:
        21-Oct-2009 NP: Initial version.
        30-Nov-2009 NP: REVIEWED. Tested against Unified Automation Demo Server.
        04-Mar-2010 RTD: Using activateSession() to handle security when the connection is secure.

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.6.1.
*/

include( "./library/Base/safeInvoke.js" );
include( "./library/ClassBased/UaDiagnosticInfo/check_serverSupportsDiagnostics.js" );

function createSession561009()
{
    var createSessionRequest = CreateDefaultCreateSessionRequest( g_session );
    var createSessionResponse = new UaCreateSessionResponse();

    var uaStatus = g_session.createSession( createSessionRequest, createSessionResponse );

    // check result
    if( uaStatus.isGood() )
    {
        if ( activateSession( g_session ) )
        {
            checkCreateSessionValidParameter( g_session, createSessionRequest, createSessionResponse );            
            // read the 'Server Diagnostics -> EnabledFlag' node
            if( !check_serverSupportsDiagnostics( g_session ) )
            {
                addNotSupported( "Diagnostics" );
            }
            else
            {
                // lets read the current Session count
                print( "\tFetching the initial sessionCount value..." );
                var currentSessionCountItem = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_ServerDiagnosticsSummary_CurrentSessionCount ) ); //ServerDiagnosticsSummaryType_CurrentSessionCount
                var reader = new Read( g_session );
                if( reader.Execute( currentSessionCountItem ) )
                {
                    var firstSessionCount = currentSessionCountItem[0].Value.Value;
                    
                    // now to create another session, does sessionCount increase?
                    print( "\tCreating another (temporary) connection (channel & session) to the UA Server." );
                    var tempChannel = new UaChannel();
                    var tempSession = new UaSession( tempChannel );
                    tempSession.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );
                    if( connect( tempChannel, tempSession ) )
                    {
                        // read the sessionCount again
                        print( "\tReading the new sessionCount value..." );
                        if( reader.Execute( currentSessionCountItem ) )
                        {
                            var secondSessionCount = currentSessionCountItem[0].Value.Value;
                            print("\tChecking the sessionCount increased. Was: " + firstSessionCount + ", is now: " + secondSessionCount );
                            AssertGreaterThan( firstSessionCount, secondSessionCount, "Expected session count to increase." );
                        }
                        // disconnect the temp channel & session
                        disconnect( tempChannel, tempSession );
                    }
                    // clean-up
                    tempSession = null;
                    tempChannel = null;
                }

            }
            // clean-up
            closeSession( g_session );
        }
    }// if( uaStatus.isGood() )
}

safelyInvoke( createSession561009 );
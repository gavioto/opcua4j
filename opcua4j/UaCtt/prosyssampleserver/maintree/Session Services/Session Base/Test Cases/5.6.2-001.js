/*  Test 5.6.2 Test 1 prepared by Development; compliance@opcfoundation.org
    Description:
        activate a session using default parameters.

    Revision History
        28-Aug-2008 DEV: Initial version.
        24-Nov-2009 NP:  REVIEWED.
        26-Mar-2010 NP:  Revised to use 'activateSession' helper, which manages security automatically.
*/

function activateSession562001()
{
    var session = new UaSession( g_channel );
    session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );
    if( createSession( session ) )
    {
        activateSession( session );
        closeSession( session );
    }
}

safelyInvoke( activateSession562001 );
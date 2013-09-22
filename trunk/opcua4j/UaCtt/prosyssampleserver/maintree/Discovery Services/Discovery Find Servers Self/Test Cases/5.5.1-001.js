/*  Prepared by Ronaldo T. Duarte ronaldotd@smar.com.br

    Description:
        Invoke FindServers with default parameters.

    Revision History
        25-Aug-2009 RTD: Initial version.
        23-Nov-2009 NP: REVIEWED.

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.5.1.
*/

function findServers551001()
{
    var findServersRequest = CreateDefaultFindServersRequest();
    var findServersResponse = new UaFindServersResponse();

    var uaStatus = g_discovery.findServers( findServersRequest, findServersResponse);
    if ( uaStatus.isBad() )
    {
        addError( "FindServers() status " + uaStatus, uaStatus );
    }
    else
    {
        if( findServersResponse.Servers.length > 0 )
        {
            addLog( "FindServers() returned " + findServersResponse.Servers.length + " description(s)." );
        }
        else
        {
            addWarning( "FindServers() returned " + findServersResponse.Servers.length + " description(s)." );
        }
        checkFindServersValidParameter( findServersRequest, findServersResponse );
    }
}

safelyInvoke( findServers551001 );
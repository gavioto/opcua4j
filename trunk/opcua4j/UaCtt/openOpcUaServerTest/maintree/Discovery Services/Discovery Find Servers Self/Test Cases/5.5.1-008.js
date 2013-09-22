/*  Prepared by Ronaldo T. Duarte ronaldotd@smar.com.br

    Description:
        Provide a serverUri that does not match any servers provided by
        previous call to FindServers.

    Revision History:
        27-Aug-2009 RTD: Initial version.
        23-Nov-2009 NP: REVIEWED.

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.5.1.
*/

function findServers551008()
{
    var findServersRequest = CreateDefaultFindServersRequest();
    var findServersResponse = new UaFindServersResponse();
    var succeeded = true;

    findServersRequest.ServerUris[0] = "www.tempuri.org";

    // call FindServers with unmatched server URI.
    uaStatus = g_discovery.findServers( findServersRequest, findServersResponse );

    if ( uaStatus.isGood() )
    {
        succeeded = checkFindServersValidParameter( findServersRequest, findServersResponse );
        if ( succeeded )
        {  
            // check that no descriptions are returned.
            if (findServersResponse.Servers.length !== 0)
            {
                addError( "FindServers: server did not filter unmatched server URI" );
            }
        }
    }
    else
    {
        addError( "FindServers() status " + uaStatus, uaStatus);    
    }
}

safelyInvoke( findServers551008 );
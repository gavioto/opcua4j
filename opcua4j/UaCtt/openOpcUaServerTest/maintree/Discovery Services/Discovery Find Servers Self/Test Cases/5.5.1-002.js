/*  Prepared by Ronaldo T. Duarte ronaldotd@smar.com.br

    Description:
        Filter the list of servers by server URI.

    Revision History:
        26-Aug-2009 RTD: Initial version.
        23-Nov-2009 NP: REVIEWED.

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.5.1.
*/

function findServers551002()
{
    var findServersRequest = CreateDefaultFindServersRequest();
    var findServersResponse = new UaFindServersResponse();
    var succeeded = true;

    // call FindServers without filters. 
    var uaStatus = g_discovery.findServers( findServersRequest, findServersResponse );
    if( uaStatus.isBad() )
    {
        addError( "FindServers() status " + uaStatus, uaStatus);      
    }
    else
    {
        var initialCount = findServersResponse.Servers.length;
        addLog( "FindServers() returned " + initialCount + " description(s)." );      
        succeeded = checkFindServersValidParameter( findServersRequest, findServersResponse );
        if ( succeeded )
        {
            // now filter using one the returned server URIs.
            var serverUri = findServersResponse.Servers[0].ApplicationUri;
            findServersRequest = CreateDefaultFindServersRequest();
            findServersResponse = new UaFindServersResponse();
            findServersRequest.ServerUris[0] = serverUri;

            // call FindServers with server URI filter.
            uaStatus = g_discovery.findServers( findServersRequest, findServersResponse);
            if ( uaStatus.isBad() )
            {
                addError( "FindServers() status " + uaStatus, uaStatus );              
            }
            else
            {
                addLog( "FindServers() returned " + findServersResponse.Servers.length + " description(s)." );      
                succeeded = checkFindServersValidParameter( findServersRequest, findServersResponse );
                if( succeeded )
                {
                    // is the count the same?
                    var filteredCount = findServersResponse.Servers.length;
                    if( filteredCount == initialCount && initialCount > 1 )
                    {
                        addWarning( "The unfiltered results count is the same as the filtered results count. original count: " + initialCount + "; filtered count: " + filteredCount );
                    }

                    // check that returned descriptions were correctly filtered.
                    for ( var i=0; i<findServersResponse.Servers.length; i++)
                    {
                        var description = findServersResponse.Servers[i];  
                        if ( description.ApplicationUri != serverUri )
                        {
                            addError( "FindServers: filter:  " + serverUri + ", but server returned: " + description.ApplicationUri );
                        }
                    }// for i...
                }
            }// if findServers is Bad
        }
    }// if findServers is Bad
}

safelyInvoke( findServers551002 );
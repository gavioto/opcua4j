/*  Prepared by Ronaldo T. Duarte ronaldotd@smar.com.br

    Description:
        Provide a list of locales not conforming to RFC 3066.

    Revision History:
        04-Sep-2009 RTD: Initial version.
        23-Nov-2009 NP:  REVIEWED.

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.5.1.
*/

function findServers551011()
{
    var findServersRequest = CreateDefaultFindServersRequest();
    var findServersResponse = new UaFindServersResponse();
    findServersRequest.LocaleIds = CreateNonConformingLocaleArray();

    var uaStatus = g_discovery.findServers( findServersRequest, findServersResponse );
    if ( uaStatus.isBad() )
    {
        addError( "FindServers() status " + uaStatus, uaStatus );
    }
    else
    {
        addLog( "FindServers() returned " + findServersResponse.Servers.length + " description(s)." );      
        var succeeded = checkFindServersValidParameter( findServersRequest, findServersResponse );
        if ( succeeded )
        {
            // check that server returns at least its own description with a default locale.
            if ( findServersResponse.Servers.length <= 0 )
            {
                addError( "FindServers() no default locale returned" );
            }
        }
    }
}

safelyInvoke( findServers551011 );
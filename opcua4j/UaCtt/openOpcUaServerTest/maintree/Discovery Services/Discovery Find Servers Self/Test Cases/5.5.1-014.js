/*  Prepared by Ronaldo T. Duarte ronaldotd@smar.com.br

    Description:
        Provide an invalid endpoint URL (string, but sintactically not a URL).

    Revision History:
        04-Sep-2009 RTD: Initial version.
        23-Nov-2009 NP:  REVIEWED.

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.5.1.
*/

function findServers551014()
{
    var findServersRequest = new UaFindServersRequest();
    var findServersResponse = new UaFindServersResponse();

    findServersRequest.RequestHeader.Timestamp = UaDateTime.utcNow();
    findServersRequest.EndpointUrl = "This is my endpoint";

    var uaStatus = g_discovery.findServers( findServersRequest,findServersResponse );
    if( uaStatus.isGood() )
    {
        var succeeded = checkFindServersValidParameter( findServersRequest, findServersResponse );
        if ( succeeded )
        {
            // check that server returns at least its own description with a default endpoint URL.
            if ( findServersResponse.Servers.length === 0 )
            {
                addError( "FindServers: no default endpoint URL returned." );
            }
        }  
    }
    else
    {
        addError( "FindServers() status " + uaStatus, uaStatus );
    }
}

safelyInvoke( findServers551014 );
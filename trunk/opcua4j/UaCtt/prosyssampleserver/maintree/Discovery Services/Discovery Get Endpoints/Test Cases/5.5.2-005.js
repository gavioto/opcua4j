/*  Prepared by Ronaldo T. Duarte ronaldotd@smar.com.br

    Description:
        Provide a list of locales not conforming to RFC 3066.
    Revision History
        15-Sep-2009 RTD Initial version
        19-Nov-2009 UJ: REVIEWED

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.5.2.
*/

function getEndpoints552005()
{
    var getEndpointsRequest = CreateDefaultGetEndpointsRequest();
    var getEndpointsResponse = new UaGetEndpointsResponse();
    getEndpointsRequest.LocaleIds = CreateNonConformingLocaleArray();
    
    var uaStatus = g_discovery.getEndpoints(getEndpointsRequest, getEndpointsResponse);
    
    if (uaStatus.isBad())
    {
        addError( "GetEndpoints() status " + uaStatus, uaStatus);
    }
    else
    {
        addLog( "GetEndpoints() returned " + getEndpointsResponse.Endpoints.length + " description(s)." );
        var succeeded = checkGetEndpointsValidParameter(getEndpointsRequest, getEndpointsResponse);
        if( succeeded )
        {
            // check that server returns at least one endpoint with a default locale.
            if (getEndpointsResponse.Endpoints.length === 0)
            {
                addError( "GetEndpoints: no default locale returned." );
            }
            else
            {
                for (var jj = 0; jj < getEndpointsResponse.Endpoints.length; jj++)
                {
                    var description = getEndpointsResponse.Endpoints[jj];
                    addLog( "Application name #" + jj + ": locale: \"" + description.Server.ApplicationName.Locale + "\" text: \"" + description.Server.ApplicationName.Text + "\"" );
                }
            }
        }
    }
}

safelyInvoke( getEndpoints552005 );
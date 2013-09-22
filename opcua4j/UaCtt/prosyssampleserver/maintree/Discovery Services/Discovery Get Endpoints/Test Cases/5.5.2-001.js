/*  Prepared by Ronaldo T. Duarte ronaldotd@smar.com.br

    Description:
        Invoke GetEndpoints with default parameters.
    Revision History
        04-Sep-2009 RTD Initial version
        19-Nov-2009 UJ: REVIEWED

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.5.2.
*/

function getEndpoints552001()
{
    var getEndpointsRequest = CreateDefaultGetEndpointsRequest();
    var getEndpointsResponse = new UaGetEndpointsResponse();
    
    var uaStatus = g_discovery.getEndpoints( getEndpointsRequest, getEndpointsResponse );
    
    if( uaStatus.isBad() )
    {
        addError( "GetEndpoints() status " + uaStatus, uaStatus );
    }
    else
    {
        addLog( "GetEndpoints() returned " + getEndpointsResponse.Endpoints.length + " description(s)." );
        for( var i = 0; i < getEndpointsResponse.Endpoints.length; i++ )
        {
            addLog( "Endpoints[" + i + "] = " + getEndpointsResponse.Endpoints[i] );
        }
        checkGetEndpointsValidParameter( getEndpointsRequest, getEndpointsResponse );
    }
}

safelyInvoke( getEndpoints552001 );
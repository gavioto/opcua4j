/*  Prepared by Ronaldo T. Duarte ronaldotd@smar.com.br

    Description:
        Provide an invalid endpoint URL (string, but syntactically not a URL).
    Expected Result:
        Server returns a DEFAULT endpoint URL.

    Revision History
        16-Sep-2009 RTD: Initial version.
        19-Nov-2009 UJ: REVIEWED.
        20-Dec-2010 NP: Improved the error message in the Assertion.

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.5.2.
*/


function getEndpoints552010()
{
    var getEndpointsRequest = new UaGetEndpointsRequest();
    var getEndpointsResponse = new UaGetEndpointsResponse();
    
    getEndpointsRequest.RequestHeader.Timestamp = UaDateTime.utcNow();
    getEndpointsRequest.EndpointUrl = "This is my endpoint";
    
    var uaStatus = g_discovery.getEndpoints( getEndpointsRequest, getEndpointsResponse );
    
    // check result
    if(uaStatus.isGood())
    {
        var succeeded = checkGetEndpointsValidParameter( getEndpointsRequest, getEndpointsResponse );
        if (succeeded)
        {
            // check that server returns at least one endpoint.
            if ( getEndpointsResponse.Endpoints.length <= 0 )
            {
                addError( "Expected to receive a DEFAULT EndPoint even though the request was not valid. Endpoints received: " + getEndpointsResponse.Endpoints.length );
            }
        }
    }
    else
    {
        addError( "GetEndpoints() status " + uaStatus, uaStatus );
    }
}

safelyInvoke( getEndpoints552010 );
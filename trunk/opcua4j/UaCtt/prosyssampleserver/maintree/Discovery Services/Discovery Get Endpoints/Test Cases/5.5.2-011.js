/*  Prepared by Ronaldo T. Duarte ronaldotd@smar.com.br

    Description:
        Unsupported profile URI.

    Revision History
        16-Sep-2009 RTD Initial version
        19-Nov-2009 UJ: REVIEWED
        08-Feb-2010 NP: Corrected the URIs after solving discrepency between API code vs Spec.

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.5.2.
*/

function GetUnsupportedProfileUri( supportedProfileUris )
{
    var profiles = [];
    profiles[0] = "http://opcfoundation.org/UAProfile/Transport/uactp-uasc-uabinary"; //"http://opcfoundation.org/UA/profiles/transport/uatcp";
    profiles[1] = "http://opcfoundation.org/UAProfile/Transport/soaphttp-wssc-uaxml"; //"http://opcfoundation.org/UA/profiles/transport/wsxml";
    profiles[2] = "http://opcfoundation.org/UAProfile/Transport/soaphttp-wssc-uaxml-uabinary"; //"http://opcfoundation.org/UA/profiles/transport/wsxmlorbinary";
    profiles[3] = "http://opcfoundation.org/UAProfile/Transport/uatcp-uasc-uabinary"; //"http://opcfoundation.org/UA/profiles/transport/wsbinary";

    var unsupportedProfile = null;
    for ( var ii = 0; ii < profiles.length; ii++ )
    {
        var found = false;
        for ( var jj = 0; jj < supportedProfileUris.length; jj++ )
        {
            if ( profiles[ii] === supportedProfileUris[jj] )
            {
                found = true;
                break;
            }
        }
        if ( found === false )
        {
            unsupportedProfile = profiles[ii];
            break;
        }
    }

    return unsupportedProfile;
}


function getEndpoints552011()
{
    var supportedProfileUris = [];
    var getEndpointsRequest = CreateDefaultGetEndpointsRequest();
    var getEndpointsResponse = new UaGetEndpointsResponse();
    
    // GetEndpoints with default parameters to get the supported profile URIs.
    var uaStatus = g_discovery.getEndpoints( getEndpointsRequest, getEndpointsResponse );
    if ( uaStatus.isGood() )
    {
        var succeeded = checkGetEndpointsValidParameter( getEndpointsRequest, getEndpointsResponse);
        if ( succeeded )
        {
            for ( var ii = 0; ii < getEndpointsResponse.Endpoints.length; ii++ )
            {
                supportedProfileUris[ii] = getEndpointsResponse.Endpoints[ii].TransportProfileUri;
            }
            var unsupportedProfile = GetUnsupportedProfileUri( supportedProfileUris );
            if ( unsupportedProfile === null )
            {
                addLog( "Server supports all profile URIs" );
            }
            else
            {
                // Filter using the unsupported profile.
                getEndpointsRequest = CreateDefaultGetEndpointsRequest();
                getEndpointsRequest.ProfileUris[0] = unsupportedProfile;
                uaStatus = g_discovery.getEndpoints(getEndpointsRequest, getEndpointsResponse);
                if ( uaStatus.isGood() )
                {
                    succeeded = checkGetEndpointsValidParameter(getEndpointsRequest, getEndpointsResponse);
                    if ( succeeded )
                    {
                        // Check that no endpoint is returned.
                        AssertEqual( 0, getEndpointsResponse.Endpoints.length, "GetEndpoints: server did not filter unsupported profile URI; returned wrong number of Endpoints" );
                    }
                }
                else
                {
                    addError( "GetEndpoints() status " + uaStatus, uaStatus );
                }
            }
        }
    }
    else
    {
        addError( "GetEndpoints() status " + uaStatus, uaStatus );
    }
}

safelyInvoke( getEndpoints552011 );
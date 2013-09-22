/*  Prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Invoke GetEndpoints with default parameters while specifying 
        a list of transport ProfileUris to filter.
        
        How this test works:
            1.) call getEndpoints using default parameters only
            2.) record the list of endpoints returned
            3.) specify a single filter
            4.) issue another call to getEndpoints
            5.) compare the 2nd list with the first!

    Revision History
        05-Oct-2009 NP Initial version
        19-Nov-2009 UJ: REVIEWED
        08-Feb-2010 NP: Corrected the URIs after solving discrepency between API code vs Spec.
        17-May-2010 DP: Corrected the URIs (inserted hyphen in "UA-Profile").

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.5.2.
*/

function testFilteredEndpoints552003( profileUri, expectedEndpointCount )
{
    var getEndpointsRequest2 = CreateDefaultGetEndpointsRequest();
    var getEndpointsResponse2 = new UaGetEndpointsResponse();
    
    getEndpointsRequest2.ProfileUris[0] = profileUri;

    var uaStatus = g_discovery.getEndpoints( getEndpointsRequest2, getEndpointsResponse2 );
    
    // check the results
    if( uaStatus.isBad() )
    {
        addError( "GetEndpoints() status " + uaStatus, uaStatus );
    }
    else
    {
        checkGetEndpointsValidParameter( getEndpointsRequest2, getEndpointsResponse2 );
        AssertEqual( expectedEndpointCount, getEndpointsResponse2.Endpoints.length, "Filtering with ProfileUri " + profileUri + " returned the wrong number of endpoints" ); 
    }
}


function getEndpoints552003()
{
    const XMLSECURITYPROFILEURI = "http://opcfoundation.org/UA-Profile/Transport/soaphttp-wssc-uaxml-uabinary";
    const TCPSECURITYPROFILEURI = "http://opcfoundation.org/UA-Profile/Transport/uatcp-uasc-uabinary";

    var uatcpCount = 0;
    var uaxmlCount = 0;
    
    var getEndpointsRequest1 = CreateDefaultGetEndpointsRequest();
    var getEndpointsResponse1 = new UaGetEndpointsResponse();
    
    var uaStatus = g_discovery.getEndpoints( getEndpointsRequest1, getEndpointsResponse1 );
    
    if( uaStatus.isBad() )
    {
        addError( "GetEndpoints() status " + uaStatus, uaStatus );
    }
    else
    {
        checkGetEndpointsValidParameter( getEndpointsRequest1, getEndpointsResponse1 );

        // count the UA TCP and UA XML profiles returned
        print( "\nTransport Profiles returned:" );
        for( var i = 0; i < getEndpointsResponse1.Endpoints.length; i++ )
        {
            switch( getEndpointsResponse1.Endpoints[i].TransportProfileUri )
            {
                case XMLSECURITYPROFILEURI:
                    uaxmlCount++;
                    break;
                case TCPSECURITYPROFILEURI:
                    uatcpCount++;
                    break;
                default:
                    addError( "Unexpected type: " + getEndpointsResponse1.Endpoints[i].TransportProfileUri );
                    break;
            }
        }

        print( "Discovery Server returned " + uaxmlCount + " Endpoints with TransportProfileUri " + XMLSECURITYPROFILEURI );
        print( "Discovery Server returned " + uatcpCount + " Endpoints with TransportProfileUri " + TCPSECURITYPROFILEURI );

        if( uatcpCount === 0 && uaxmlCount === 0 ) // both empty
        {
            addWarning( "Can't test Transport Profile Uri filter. No Endpoints were of an expected TransportProfileUri type." );
        }
        else
        {
            testFilteredEndpoints552003( XMLSECURITYPROFILEURI, uaxmlCount );
            testFilteredEndpoints552003( TCPSECURITYPROFILEURI, uatcpCount );
        }
    }
}

safelyInvoke( getEndpoints552003 );
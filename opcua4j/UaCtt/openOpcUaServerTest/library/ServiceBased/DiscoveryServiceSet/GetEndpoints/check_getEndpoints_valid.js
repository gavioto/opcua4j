/*
    Description:
        Validates the GetEndpoints() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP : REVIEWED.
*/

include( "./library/Base/objects/hostnames.js" );
include( "./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js" );
include( "./library/Base/StringMatching.js" );
include( "./library/Base/warnOnce.js" );

function checkCertificateIsValid( currentEndpoint )
{
    // validate the server certificate
    var validationStatus = g_pkiProvider.validateCertificate( currentEndpoint.ServerCertificate );
    if ( validationStatus.isBad() )
    {
        addError( "Server application instance certificate does not validate (according to pkiProvider)." );
        return( false );
    }

    var certMsg = "";
    var errMsg = "";
    var warnMsg = "";
    var logMsg = "";

    // go ahead and validate the certificate parameters. Useful info for programmers.
    // check the hostnames match in the server certificate and endpointUrls
    var serverCertificate = UaPkiCertificate.fromDER( currentEndpoint.ServerCertificate );

    // get hostname from endpoint url
    var serverEndpointUrlHostname = getHostnameFromUrl( currentEndpoint.EndpointUrl.toString() );
    // get hostname from certificate
    var serverCertificateHostName;
    if( serverCertificate.Hostnames !== null && serverCertificate.Hostnames.length > 0 )
    {
        serverCertificateHostName = serverCertificate.Hostnames[0];
    }
    // validate these names
    certMsg += "Server Hostname:\n\tEndpoint: '" + serverEndpointUrlHostname + "'";
    certMsg += "\tCertificate: '" + serverCertificateHostName + "'";
    // if the serverEndpoint hostname doesn't match the hostname in the certificate then we shall 
    // use the Hostnames helper to see if a match can be found there
    if( serverEndpointUrlHostname !== serverCertificateHostName )
    {
        HOSTNAMES.QueryHostnames( serverCertificateHostName );
        if( AssertTrue( HOSTNAMES.Contains( serverCertificateHostName ), "Expected hostname in EndpointUrl ('" + serverEndpointUrlHostname + "') to match the Endpoint in the Server's Certificate. Also, expected the hostname in the Server's Certificate ('" + serverCertificateHostName + "') to match at least one of the Hostnames assigned to the computer (check DNS)." ) )
        {
            logMsg += "Hostname in Server's Certificate is valid and matches the hostname in the EndpointURL and/or the Hostname determined by the DNS records.";
        }
    }

    if( true )
    {
        certMsg += "\nServer Certificate: ";
        certMsg += "\n\tApplicationUri: '" + serverCertificate.ApplicationUri + "'";
        if( serverCertificate.ApplicationUri == null || serverCertificate.ApplicationUri.length == 0 )
        {
            errMsg += "Server Certificate URI is empty!";
        }

        certMsg += "\n\tHostnames: '" + serverCertificate.Hostnames + "'";
        if( serverCertificate.Hostnames == null || serverCertificate.Hostnames.length == 0 )
        {
            // if this parameter is invalid, then check the IP
            errMsg += "\nServer Certificate DNS is empty.";
        }

        certMsg += "\n\tValidFrom: '" + serverCertificate.ValidFrom + "'";
        if( serverCertificate.ValidFrom == null || serverCertificate.ValidFrom.length == 0 )
        {
            errMsg += "\nServer Certificate ValidFrom is empty.";
        }
        else
        {
            var validFromDT = Date.parse( serverCertificate.ValidFrom );
            if( validFromDT == null )
            {
                errMsg += "\nServer Certificate ValidFrom is not a valid date.";
            }
            if( validFromDT > UaDateTime.utcNow() )
            {
                errMsg += "\nServer Certificate ValidFrom is IN THE FUTURE!??";
            }
        }

        certMsg += "\n\tValidTo: '" + serverCertificate.ValidTo + "'";
        if( serverCertificate.ValidTo == null || serverCertificate.ValidTo.length == 0 )
        {
            errMsg += "Server Certificate ValidTo is empty.";
        }
        else
        {
            var validToDT = Date.parse( serverCertificate.ValidTo );
            if( validToDT == null )
            {
                errMsg += "Server Certificate ValidTo is not a valid date.";
            }
            if( validToDT < UaDateTime.utcNow() )
            {
                warnMsg += "Server Certificate ValidTo has Expired!??";
            }
        }

        certMsg += "\n\tSerialNumber: '" + serverCertificate.SerialNumber + "'";
        if( serverCertificate.SerialNumber == null || serverCertificate.SerialNumber.length == 0 )
        {
            errMsg += "\nServer Certificate SerialNumber is empty.";
        }

        certMsg += "\n\tSignatureAlgorithm: '" + serverCertificate.SignatureAlgorithm + "'";
        if( serverCertificate.SignatureAlgorithm == null || serverCertificate.length == 0 )
        {
            logMsg += "\nServer Certificate SignatureAlgorithm is empty.";
        }
        else
        {
            var found = false;
            var acceptedSignatureTypes = [ "RSA-SHA1" ];
            for( var s=0; s<acceptedSignatureTypes.length; s++ )
            {
                if( acceptedSignatureTypes == serverCertificate.SignatureAlgorithm )
                {
                    found = true;
                    break;
                }
            }// for s...
            if( !found )
            {
                warnMsg += "\nServer Certificate SignatureAlgorithm is not a recognized algorithm string: " + serverCertificate.SignatureTypeString;
            }
        }

        var subject = serverCertificate.Subject;
        certMsg += "\n\t--- Subject ---";
        certMsg += "\n\t\tOrganization: '" + subject.Organization + "'";
        if( subject.Organization == null || subject.Organization.length == 0 )
        {
            logMsg += "\nServer Certificate Organization is empty.";
        }

        certMsg += "\n\t\tOrganizationUnit: '" + subject.OrganizationUnit + "'";
        if( subject.OrganizationUnit == null || subject.OrganizationUnit.length == 0 )
        {
            logMsg += "\nServer Certificate OrganizationUnit is empty.";
        }
        else if( subject.OrganizationUnit.length > 64 )
        {
            warnMsg += "Server Certificate Subject.Organization is too long. 64 is max length. Received length: " + subject.OrganizationUnit.length;
        }

        certMsg += "\n\t\tLocality: '" + subject.Locality + "'";
        if( subject.Locality == null || subject.Locality.length == 0 )
        {
            if( subject.DomainComponent.length > 0 && subject.DomainComponent.length < 128 )
            {
                logMsg += "\nServer Certificate Subject Locality is empty. This is allowed because the Subject.DomainComponent is populated.";
            }
            else
            {
                warnMsg += "\nServer Certificate Subject Locality is empty. But, so is the Subject.DomainComponent and one these must be populated.";
            }
        }
        else if( subject.Locality.length > 128 )
        {
            warnMsg += "\nServer Certificate Subject.Locality is too long. 128 is max length. Received length: " + subject.Locality.length;
        }
        else
        {
            if( subject.DomainComponent.length !== 0 )
            {
                warnMsg += "\nServer Certificate Subject.Locality is used, but so is Subject.DomainComponent. Only one of these should be used.";
            }
        }

        certMsg += "\n\t\tState: '" + subject.State + "'";
        if( subject.State == null || subject.State.length == 0 )
        {
            logMsg += "\nServer Certificate Subject State is empty.";
        }
        else if( subject.State.length > 128 )
        {
            warnMsg += "\nServer Certificate Subject.State is too long. 128 is max length. Received length: " + subject.State.length;
        }

        certMsg += "\n\t\tCountry: '" + subject.Country + "'";
        if( subject.Country == null || subject.Country.length == 0 )
        {
            logMsg += "\nServer Certificate Subject Country is empty.";
        }
        else if( subject.Country.length > 2 )
        {
            warnMsg += "\nServer Certificate Subject.Country is too long, it should contain a 2-digit region code. Currently: " + subject.Country;
        }

        certMsg += "\n\t\tCommonName: '" + subject.CommonName + "'";
        if( subject.CommonName == null || subject.CommonName.length == 0 )
        {
            errMsg += "\nServer Certificate Subject CommonName is empty.";
        }
        else if( subject.CommonName.length > 64 )
        {
            warnMsg += "\nServer Certificate Subject.CommonName is too long. 64 is max length. Received length: " + subject.CommonName.length;
        }

        certMsg += "\n\t\tDomainComponent: '" + subject.DomainComponent + "'";
        if( subject.DomainComponent == null || subject.DomainComponent.length == 0 )
        {
            if( subject.Locality.length > 0 && subject.Locality.length < 128 )
            {
                logMsg += "\nServer Certificate Subject DomainComponent is empty. This is allowed because Subject.Locality is populated.";
            }
            else
            {
                warnMsg += "\nServer Certificate Subject DomainComponent is empty. But, so is the Subject.Locality. One of these must be used!";
            }
        }
        else if( subject.DomainComponent.length > 128 )
        {
            warnMsg += "\nServer Certificate Subject.DomainComponent is too long. 128 is max length. Received length: " + subject.DomainComponent.length;
        }
        else
        {
            if( subject.Locality.length !== 0 )
            {
                warnMsg += "\nServer Certificate Subject.DomainComponent is used, but so is Subject.Locality. Only one of these should be used.";
            }
        }

        var issuer = serverCertificate.Issuer;
        certMsg += "\n\t--- Issuer ---";
        certMsg += "\n\t\tOrganization: '" + issuer.Organization + "'";
        if( issuer.Organization == null || issuer.Organization.length == 0 )
        {
            logMsg += "\nServer Certificate Issuer Organization is empty.";
        }

        certMsg += "\n\t\tOrganizationUnit: '" + issuer.OrganizationUnit + "'";
        if( issuer.OrganizationUnit == null || issuer.OrganizationUnit.length == 0 )
        {
            logMsg += "\nServer Certificate Issuer OrganizationUnit is empty.";
        }
        else if( issuer.OrganizationUnit.length > 64 )
        {
            warnMsg += "\nServer Certificate issuer.Organization is too long. 64 is max length. Received length: " + issuer.OrganizationUnit.length;
        }

        certMsg += "\n\t\tLocality: '" + issuer.Locality + "'";
        if( issuer.Locality == null || issuer.Locality.length == 0 )
        {
            logMsg += "\nServer Certificate Issuer Locality is empty.";
        }
        else if( issuer.Locality.length > 128 )
        {
            warnMsg += "\nServer Certificate issuer.Locality is too long. 128 is max length. Received length: " + issuer.Locality.length;
        }
        certMsg += "\n\t\tState: '" + issuer.State + "'";
        if( issuer.State == null || issuer.State.length == 0 )
        {
            logMsg += "\nServer Certificate Issuer State is empty.";
        }
        else if( issuer.State.length > 128 )
        {
            warnMsg += "\nServer Certificate issuer.State is too long. 128 is max length. Received length: " + issuer.State.length;
        }
        certMsg += "\n\t\tCountry: '" + issuer.Country + "'";
        if( issuer.Country == null || issuer.Country.length == 0 )
        {
            logMsg += "\nServer Certificate Issuer Country is empty.";
        }
        else if( issuer.Country.length > 2 )
        {
            warnMsg += "\nServer Certificate Issuer.Country is too long, it should contain a 2-digit region code. Currently: " + issuer.Country;
        }
        certMsg += "\n\t\tCommonName: '" + issuer.CommonName + "'";
        if( issuer.CommonName == null || issuer.CommonName.length == 0 )
        {
            errMsg += "\nServer Certificate Issuer CommonName is empty.";
        }
        else if( issuer.CommonName.length > 64 )
        {
            warnMsg += "\nServer Certificate issuer.CommonName is too long. 64 is max length. Received length: " + issuer.CommonName.length;
        }
        certMsg += "\n\t\tDomainComponent: '" + issuer.DomainComponent + "'";
        if( issuer.DomainComponent == null || issuer.DomainComponent.length == 0 )
        {
            warnMsg += "\nServer Certificate Issuer DomainComponent is empty.";
        }
        else if( issuer.DomainComponent.length > 128 )
        {
            warnMsg += "\nServer Certificate issuer.DomainComponent is too long. 128 is max length. Received length: " + issuer.DomainComponent.length;
        }
        addLog( "Server Certificate details...\n" + certMsg );
        if( logMsg  !== "" )
        {
            addLog( logMsg );
        }
        if( warnMsg !== "" )
        {
            addWarning( warnMsg );
        }
        if( errMsg  !== "" )
        {
            addError( errMsg );
            return( false );
        }
    }
    return( true );
}


// the service is expected to succeed
// all operations are expected to succeed
function checkGetEndpointsValidParameter( Request, Response, suppressMessaging )
{
    var result = true;
    // check in parameters
    if( arguments.length < 2 )
    {
        addError( "function checkGetEndpointsValidParameter(): Number of arguments must be a minimum of 2!" );
        result = false;
    }
    // check response header
    bSucceeded = checkResponseHeaderValid( Request.RequestHeader, Response.ResponseHeader );
   // check the contents of the endpoints
   if( suppressMessaging === undefined || suppressMessaging === false ) print( "There are " + Response.Endpoints.length + " available that require validation..." );
   for( var i=0; i<Response.Endpoints.length; i++ )
   {
        if( suppressMessaging === undefined || suppressMessaging === false ) print( "validating endpoint # " + i + ": EndpointUrl:" + Response.Endpoints[i].EndpointUrl + "; SecurityPolicyUri: " + Response.Endpoints[i].SecurityPolicyUri );
        var currentEndpoint = Response.Endpoints[i];
        // check the application description.
        if( currentEndpoint.Server.ApplicationName.Text.length == 0 )
        {
          addError( "function checkGetEndpointsValidParameter(): application name (text) is empty." );        
          result = false;
        }
        // check that application uri is not empty.
        if( currentEndpoint.Server.ApplicationUri.length == 0 )
        {
          addError( "function checkGetEndpointsValidParameter(): application uri is empty." );        
          result = false;
        }
        // check that product uri is not empty.
        if( currentEndpoint.Server.ProductUri.length == 0 )
        {
          addError( "function checkGetEndpointsValidParameter(): product uri is empty." );        
          result = false;
        }
        // check that application type is not client.
        if( currentEndpoint.Server.ApplicationType == ApplicationType.Client )
        {
          addError( "function checkGetEndpointsValidParameter(): application type is client." );        
          result = false;
        }
        // check that EndpointUri is not empty.
        if( currentEndpoint.EndpointUrl == null || currentEndpoint.EndpointUrl.length == 0 || currentEndpoint.EndpointUrl == "" )
        {
          addError( "Endpoint #" + i + " EndpointUrl is empty." );        
          result = false;
        }
        // check that SecurityPolicyUri is not empty.
        if( currentEndpoint.SecurityPolicyUri == "" )
        {
          addError( "Endpoint #" + i + " SecurityPolicyUri is empty." );        
          result = false;
        }
        // check that TransportProfileUri is not empty.
        if( currentEndpoint.TransportProfileUri == "" )
        {
          addError( "Endpoint #" + i + " TransportProfileUri is empty." );        
          result = false;
        }
        // check serverCertificate is not empty
        if( currentEndpoint.ServerCertificate == "" )
        {
          addError( "Endpoint #" + i + " ServerCertificate is empty." );        
          result = false;
        }
        else
        {
            // check certificate is valid
            if( !checkCertificateIsValid( currentEndpoint ) )
            {
                result = false;
            }
        }
    }

    if( result &&( suppressMessaging === undefined || suppressMessaging === false ) )
    {
        addLog( "GetEndpoints and ServerCertificate validation succeeded." );
    }
    return( result );
}
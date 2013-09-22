/* Function listing

    function getHostnameFromUrl( str )
    function getHostnameFromUrn( str )

*/

/*  Retrieves the HOSTNAME from a URL
    Parameters:
        str = the URL to parse.
    Example URLs:
        opc.tcp://localhost:51210
        http://localhost:51211
        opc.tcp://localhost:51210/UA/SampleServer
*/
function getHostnameFromUrl( str )
{
    if( str == undefined || str == null || str == "" )
    {
        return( "" );
    }
    var re = new RegExp( '^(?:opc.tcp|http)(?:s)?\://([^/]+):', 'im' );
    var matches = str.match( re );
    if( matches !== null && matches.length !== undefined && matches.length > 0 )
    {
        return matches[1];
    }
    else
    {
        return( "" );
    }
}
/* Test code *//*
print( "url testing: " );
var validTest = [ "opc.tcp://localhost:51210", "http://localhost:51211", "opc.tcp://localhost:51210/UA/SampleServer",
                  "opc.tcp://localhost.opcfoundation.org:51210", "opc.tcp://local123host:51210", "opc.tcp://localhost123.opcfoundation.org",
                  "opc.tcp://123localhost.opcfoundation.org:512210" ];
var invalidTest = [ "not-me", "abc.def" ];
print( "\nVALID TESTS" );
for( var v=0; v<validTest.length; v++ )
    {print( "value '" + validTest[v] + "' hostname: " + getHostnameFromUrl( validTest[v] ) );}
print( "\nINVALID TESTS" );
for( var i=0; i<invalidTest.length; i++ )
    {print( "value '" + invalidTest[i] + "' hostname: " + getHostnameFromUrl( invalidTest[i] ) );}*/




/*  Retrieves the HOSTNAME from a URN
    Parameters:
        str = the URL to parse.
    Example URNs:
        urn:localhost:OPCFoundation:SampleServer
*/
function getHostnameFromUrn( str )
{
    if( str == undefined || str == null || str == "" )
    {
        return( "" );
    }
    var indexOfColon = str.indexOf( ":" );
    if( indexOfColon > 0 )
    {
        var urnSplit = str.split( ":" );
        if( urnSplit !== null && urnSplit.length >= 3 )
        {
            // we'll assume that the 2nd value in the Urn is the hostname because
            // the first is the "urn:" prefix.
            return( urnSplit[1] );
        }
    }
    return( "" );
}
/* Test code *//*
print( "url testing: " );
var validTest = [ "urn:localhost:OPCFoundation:SampleServer", "urn:localhost.opcfoundation.org:OPCFoundation:SampleServer" ];
var invalidTest = [ "not-me", "abc.def" ];
print( "\nVALID TESTS" );
for( var v=0; v<validTest.length; v++ )
    {print( "value '" + validTest[v] + "' hostname: " + getHostnameFromUrn( validTest[v] ) );}
print( "\nINVALID TESTS" );
for( var i=0; i<invalidTest.length; i++ )
    {print( "value '" + invalidTest[i] + "' hostname: " + getHostnameFromUrn( invalidTest[i] ) );}*/
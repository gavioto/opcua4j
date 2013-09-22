/* Hostnames class.
    Purpose: To simplify the querying of, and use of hostnames for testing against UA Server 
             Certificates, particularly in FindServers and/or GetEndpoints.
    Revision History: 
        Apr-12-2010 NP: Initial version.
*/

// Create a single instance of this helper. We will only ever need one.
var HOSTNAMES;
if( HOSTNAMES == null )
{
    HOSTNAMES = new Hostnames();
}

function Hostnames( hostname )
{
    this.Host;            // the computer that was last queried
    this.Hostnames = [];  // the hostnames (string array)
    this.hostInf;         // holder for the HostInfo helper class

    // constructor defined at the bottom of the class

    // queries the hostnames on a given computer (name or IP address)
    this.QueryHostnames = function( host )
    {
        print( "Querying for hostnames at '" + host + "'" );
        // check the parameter, default to "localhost" if bad value specified
        if( host === undefined || host === null || host === "" || host === "undefined" )
        {
            host = "localhost";
            print( "no hostname was specified, defaulting to '" + host + "'" );
        }
        // persist our values to our class
        if( this.hostInf == null )
        {
            this.hostInf = new HostInfo();
        }
        var result;
        result = this.hostInf.lookupHost( host );
        if( result.isGood() )
        {
            this.Host = host;
            var names = this.hostInf.hostName();
            var ips = this.hostInf.addresses();
            this.Hostnames = [].concat( names );
            for( var a=0; a<ips.length; a++ )
            {
                this.Hostnames.push( ips[a] );
            }
            print( "\tHost name helper identified and is currently holding these hostnames: " + this.Hostnames.toString() );
        }
        else
        {
            addError( "Error retrieving host info: " + hostinf.errorString() );
        }
    }

    // queries the current cache to see if a specified name exists. Returns True/False.
    this.Contains = function( hostname )
    {
        if( hostname === undefined || hostname === null )
        {
            return( false );
        }
        if( this.Hostnames === null || this.Hostnames.length === 0 )
        {
            return( false );
        }
        for( var i=0; i<this.Hostnames.length; i++ )
        {
            if( this.Hostnames[i] == hostname )
            {
                return( true );
            }
        }//for i...
        return( false );
    }

    // constructor
    this.QueryHostnames( hostname );

}// Hostnames class


/* Test code
print( "hostnames: " + HOSTNAMES.Hostnames );
var validTest = [ "nate-laptop", "localhost", "opc-laptop", "opc-123", "opc123opc", "123opc" ];
var invalidTest = [ "not-me", "123.456", "abc.def" ];
for( var v=0; v<validTest.length; v++ )
    {print( "value '" + validTest[v] + "' exist? " + HOSTNAMES.Contains( validTest[v] ) );}
for( var i=0; i<invalidTest.length; i++ )
    {print( "value '" + invalidTest[i] + "' exist? " + HOSTNAMES.Contains( invalidTest[i] ) );}*/
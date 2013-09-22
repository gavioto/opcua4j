/*global UaStatusCode */

// Object holding an array of expected results and array of accepted results
// this object is unsed in other functions checking the response
function ExpectedAndAcceptedResults()
{
    this.ExpectedResults = [];
    this.AcceptedResults = [];

    if( arguments.length > 0 )
    {
        this.ExpectedResults.push( new UaStatusCode( arguments[0] ) );
    }

    // Adds an expected result to the list 
    // ExpectedResult must be of type StatusCode
    this.addExpectedResult = function( ExpectedResult )
    {
        this.ExpectedResults.push( new UaStatusCode( ExpectedResult ) );
    };

    // Adds an accepted result to the list 
    // AcceptedResult must be of type StatusCode
    this.addAcceptedResult = function( AcceptedResult )
    {
        this.AcceptedResults.push( new UaStatusCode( AcceptedResult ) );
    };

    // Check if the expected array contains the given status
    this.containsExpectedStatus = function( statusCode )
    {
        var i;
        for( i = 0; i < this.ExpectedResults.length; i++ )
        {
            if( this.ExpectedResults[i].equals( statusCode ) )
            {
                return true;
            }
        }
        return false;
    };

    // Check if the accepted array contains the given status
    this.containsAcceptedStatus = function( statusCode )
    {
        var i;
        for( i = 0; i < this.AcceptedResults.length; i++ )
        {
            if( this.AcceptedResults[i].equals( statusCode ) )
            {
                return true;
            }
        }
        return false;
    };

    // Check if either Accepted or Expected contain the given status
    this.containsStatusCode = function( statusCode )
    {
        print( "\tChecking if ExpectedAndAccepted results contains code '" + statusCode + "'" );
        if( this.containsExpectedStatus( new UaStatusCode( statusCode ) ) )
        {
            print( "\t\tFound statusCode in Expected!" );
            return( true );
        }
        else if( this.containsAcceptedStatus( new UaStatusCode( statusCode ) ) )
        {
            print( "\t\tFound statusCode in Accepted!" );
            return( true );
        }
        print( "\t\tNot found!" );
        return( false );
    }

    this.toString = function()
    {
        var s = "Collection of StatusCodes that were either REQUIRED or would be considered ACCEPTABLE: ";
        if( this.ExpectedResults.length > 0 )
        {
            s += "\r\n\tExpected: (any one of the following)";
            for( var e=0; e<this.ExpectedResults.length; e++ )
            {
                s+= "\r\n\t\t" + this.ExpectedResults[e].toString();
            }
        }
        if( this.AcceptedResults.length > 0 )
        {
            s += "\r\n\tAcceptable: (any one of the following)";
            for( var a=0; a<this.AcceptedResults.length; a++ )
            {
                s += "\r\n\t\t" + this.AcceptedResults[a].toString();
            }
        }
        return( s );
    }
}

// Test Code
/*var exp = new ExpectedAndAcceptedResults( StatusCode.Good );
exp.addExpectedResult( StatusCode.BadUnexpectedError );
exp.addAcceptedResult( StatusCode.BadOutOfMemory );
print( exp.containsStatusCode( StatusCode.BadOutOfMemory ) );*/
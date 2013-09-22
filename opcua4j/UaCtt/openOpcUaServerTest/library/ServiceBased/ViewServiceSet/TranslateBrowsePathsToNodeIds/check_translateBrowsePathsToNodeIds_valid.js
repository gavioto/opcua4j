/*
    Description:
        Validates the TranslateBrowsePathsToNodeIds() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP: REVIEWED.
*/

/*global include, addError, checkResponseHeaderValid */

include( "./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js" );

// the service is expected to succeed
// all operations are expected to succeed
function checkTranslateBrowsePathsToNodeIdsValidParameter( request, response )
{
    var succeeded = true;
    // check in parameters
    if( arguments.length !== 2 )
    {
        addError( "function checkTranslateBrowsePathsToNodeIdsValidParameter(): Number of arguments must be 2!" );
        return false;
    }
    // as this is a valid parameter test we don't expect any diagnosticinfo        
    if( response.DiagnosticInfos.length !== 0 )
    {
        addError( "UaTranslateBrowsePathsToNodeIdsResponse.DiagnosticInfos was returned. No DiagnosticInfos were expected" );
        succeeded = false;
    }
    // check response header
    succeeded = checkResponseHeaderValid( request.RequestHeader, response.ResponseHeader, StatusCode.Good );
    // check results        
    // check number of results
    if( response.Results.length !== request.BrowsePaths.length )
    {
        addError( "The number of results does not match the number of BrowsePaths." );
        addError( "BrowsePaths.length = " + request.BrowsePaths.length + "; Results.length = " + response.Results.length );
        succeeded = false;
    }
    else
    {
        // check each result
        for( var i=0; i<response.Results.length; i++ )
        {
            var browsePathResult = response.Results[i];
            // status code
            if( !AssertStatusCodeIs( StatusCode.Good, browsePathResult.StatusCode, "Results[" + i + "].StatusCode is not Good" ) )
            {
                succeeded = false;
                continue;
            }
        }
    }
    return succeeded;
}
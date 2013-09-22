/*
    Description:
        Validates the Browse() response by analyzing the parameters.

    Revision History:
        25-Nov-2009 NP: REVIEWED.
*/

include("./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js")

// the service is expected to succeed
// all operations are expected to succeed
function checkBrowseValidParameter( Request, Response )
{
    var bSucceeded = true;
    // check in parameters
    if( arguments.length !== 2 )
    {
        addError( "function checkBrowseValidParameter(): Number of arguments must be 2!" );
        return false;
    }
    // as this is a valid parameter test we don't expect any diagnosticinfo        
    if( Response.DiagnosticInfos.length !== 0 )
    {
        addError( "BrowseResponse.DiagnosticInfos was returned. No DiagnosticInfos were expected" );
        bSucceeded = false;
    }
    // check response header
    bSucceeded = checkResponseHeaderValid( Request.RequestHeader, Response.ResponseHeader );
    // check results        
    // check number of results
    if( Response.Results.length !== Request.NodesToBrowse.length )
    {
        addError( "The number of results does not match the number of NodesToBrowse." );
        addError( "NodesToBrowse.length = " + Request.NodesToBrowse.length + "; Results.length = " + Response.Results.length );
        bSucceeded = false;
    }
    else
    {        
        // check each result
        for( var i=0; i<Response.Results.length; i++ )
        {
            var browseResult = Response.Results[i];
            // status code
            if( browseResult.StatusCode.isNotGood() )
            {
                addError( "Results[" + i + "].StatusCode is not good.", browseResult.StatusCode );
                bSucceeded = false;
                continue;
            }
            // max references per node
            if( ( Request.RequestedMaxReferencesPerNode != 0 ) && ( browseResult.References.length > Request.RequestedMaxReferencesPerNode ) )
            {
                addError( "The server returned more references than requested." );
                addError( "Results[" + i + "].References.length = " + browseResult.References.length + " but Request.RequestedMaxReferencesPerNode = " + Request.RequestedMaxReferencesPerNode );
                bSucceeded = false;
                continue;
            }
        }
    }
    return bSucceeded;
}
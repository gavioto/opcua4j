/*globals addError, addLog, addWarning, AssertDiagnosticInfosEmpty, AssertEqual,
  AssertExpandedNodeIdsEqual, AssertFalse, AssertInRange, 
  AssertLocalizedTextsEqual, AssertNodeIdsEqual, AssertNullExpandedNodeId,
  AssertNullLocalizedText, AssertNullNodeId, AssertNullQualifiedName, 
  AssertQualifiedNamesEqual, AssertStatusCodeIsOneOf, AssertTrue, 
  checkResponseHeaderValid, include, StatusCode
*/

include( "./library/Base/assertions.js" );
include( "./library/ClassBased/UaResponseHeader/check_responseHeader_valid.js" );

// the service is expected to succeed
// all operations are expected to succeed
function AssertBrowseValidParameter( request, response )
{
    if ( !AssertEqual( 2, arguments.length, "assertBrowseValidParameter(): Number of arguments must be 2!" ) )
    {
        return;
    }

    // check response header
    checkResponseHeaderValid( request.RequestHeader, response.ResponseHeader, StatusCode.Good );
    
    // check results        
    // check number of results
    if( AssertEqual( request.NodesToBrowse.length, response.Results.length, "The number of NodesToBrowse does not match the number of Results." ) )
    {        
        // check each result
        for( var i = 0; i < response.Results.length; i++ )
        {
            var browseResult = response.Results[i];
            
            // status code
            if( browseResult.StatusCode.isNotGood() )
            {
                addError( "Results[" + i + "].StatusCode is not good: " + browseResult.StatusCode, browseResult.StatusCode );
                continue;
            }
            
            if( browseResult.StatusCode.StatusCode !== StatusCode.Good )
            {
                addError( "Results[" + i + "].StatusCode is unexpected: " + browseResult.StatusCode, browseResult.StatusCode );
            }
            if( !browseResult.ContinuationPoint.isEmpty() )
            {
                addLog( "Results[" + i + "].ContinuationPoint is not empty." );
            }
        }
    }
    
    // check diagnostic infos
    // no error is expected so the DiagnosticInfos should be empty
    AssertDiagnosticInfosEmpty( response.DiagnosticInfos );
}


// the service is expected to succeed
// operations can fail or succeed
function AssertBrowseMixedParameter( request, response, expectedOperationResults )
{
    if( !AssertEqual( 3, arguments.length, "AssertBrowseMixedParameter(): Number of arguments must be 3!" ) )
    {
        return;
    }

    // check response header
    checkResponseHeaderValid( request.RequestHeader, response.ResponseHeader );
    
    // check results        
    // check number of results
    if( AssertEqual( request.NodesToBrowse.length, response.Results.length, "The number of NodesToBrowse does not match the number of Results." ) )
    {        
        // check each result
        for( var i = 0; i < response.Results.length; i++ )
        {
            var browseResult = response.Results[i];
            
            // status code
            if( expectedOperationResults[i] === undefined || expectedOperationResults[i] === null )
            {
                if( browseResult.StatusCode.isNotGood() )
                {
                    addError( "Results[" + i + "].StatusCode is not good: " + browseResult.StatusCode, browseResult.StatusCode );
                    continue;
                }
            }
            else
            {
                AssertStatusCodeIsOneOf( expectedOperationResults[i], browseResult.StatusCode, "Results[" + i + "].StatusCode"  );
                if( browseResult.StatusCode.isNotGood() )
                {
                    continue;
                }
            }
            
            if( browseResult.StatusCode.StatusCode !== StatusCode.Good )
            {
                addError( "Results[" + i + "].StatusCode is unexpected: " + browseResult.StatusCode, browseResult.StatusCode );
            }
            if( !browseResult.ContinuationPoint.isEmpty() )
            {
                addLog( "Results[" + i + "].ContinuationPoint is not empty." );
            }
        }
    }
    
    // check diagnostic infos
    // no error is expected so the DiagnosticInfos should be empty
    AssertDiagnosticInfosEmpty( response.DiagnosticInfos );
}


// Verify that a Browse or BrowseNext "fundamentally" succeeded at the ServiceResult level
function AssertBasicBrowseServiceSuccess( uaStatus, response, numNodesToBrowse )
{
    var rc = false;
    if( !uaStatus.isGood() )
    {
        addError( "Browse() status " + uaStatus, uaStatus );
    }
    else if( !response.ResponseHeader.ServiceResult.isGood() )
    {
        addError( "Browse() status " + response.ResponseHeader.ServiceResult, response.ResponseHeader.ServiceResult );
    }
    else if( response.Results.length != numNodesToBrowse )
    {
        addError( "Browse() Results not correct length" );
    }
    else
    {
        rc = true;
    }
    
    return rc;
}


/* Verify that a Browse or BrowseNext "fundamentally" appears to have succeeded.
   expectedStatusResults is an array of ExpectedAndAcceptedResults objects.
   If expectedStatusResults is not provided, the operation status codes must be good.
   If expectedStatusResults is provided, the operation status codes must match a status code
   in expectedStatusResults.
*/
function AssertBasicBrowseSuccess( uaStatus, response, request, expectedStatusResults )
{
    var pass = AssertBasicBrowseServiceSuccess( uaStatus, response, request.NodesToBrowse.length );
    if( pass )
    {
        var mustBeGood = ( expectedStatusResults === undefined || expectedStatusResults === null );

        for( var i = 0; i < response.Results.length; i++ )
        {
            if ( mustBeGood )
            {
                if( !response.Results[i].StatusCode.isGood() )
                {
                    var errMessage = "Browse() Results[" + i + "].StatusCode is not good: " + response.Results[i].StatusCode + 
                            " reading NodeId: '" + request.NodesToBrowse[i].NodeId + "' (setting: '" + 
                            findSettings( request.NodesToBrowse[i].NodeId ) + "')";
                    pass = false;
                    if( response.Results[i].StatusCode.StatusCode !== StatusCode.BadNotSupported )
                    {
                        if( response.Results[i].StatusCode.StatusCode === StatusCode.BadNodeIdUnknown )
                        {
                            addWarning( errMessage, response.Results[i].StatusCode );
                        }
                        else
                        {
                            addError( errMessage, response.Results[i].StatusCode );
                        }
                    }
                }
            }
            else
            {
                pass = AssertStatusCodeIsOneOf( expectedStatusResults[i], response.Results[i].StatusCode, "Response.Results[" + i + "].StatusCode" );
            }
        }
    }
    
    return pass;
}


// ReferenceDescription equality comparison. Just using toString(); is that safe?
function AssertReferenceDescriptionsEqual( expectedReference, actualReference, message )
{
    return AssertEqual( expectedReference.toString(), actualReference.toString(), message );
}


// Compare the contents of two arrays of ReferenceDescriptions.
// The actualReferences need not contain every expectedReference.
function AssertArrayContainsReferences( expectedReferences, actualReferences )
{
    for( var i = 0; i < actualReferences.length; i++ )
    {
        AssertReferenceDescriptionsEqual( expectedReferences[i], actualReferences[i], "Expected reference does not match browsed reference.");
    }
}


// Compare two arrays of references for equality.
function AssertReferenceArraysEqual( expectedReferences, actualReferences)
{
    if( AssertEqual( expectedReferences.length, actualReferences.length, "Number of expected references did not match number number of browsed references." ) )
    {
        AssertArrayContainsReferences( expectedReferences, actualReferences );
        addLog("All " + actualReferences.length + " expected references checked");
    }
}


// Compare two arrays of references. All actualReferences must be in 
// expectedReferences, but expectedReferences may be bigger.
function AssertReferenceArrayContainsSome( expectedReferences, actualReferences )
{
    if( expectedReferences.length >= actualReferences.length )
    {
        AssertArrayContainsReferences( expectedReferences, actualReferences );
        addLog( "Returned references (" + actualReferences.length + ") checked" );
    }
    else
    {
        addError( "Too many references returned" );
    }
}


// The result should contain the expected references (unless there
// were too many references in the result).
function AssertResultHasExpectedReferences( expectedReferences, result, maxReferences )
{
    if( result.StatusCode.StatusCode === StatusCode.Good )
    {
        if( result.ContinuationPoint.isEmpty() )
        {
            // verify all returned references are equal to all expected references
            AssertReferenceArraysEqual( expectedReferences, result.References );
        }
        else
        {
            addWarning( "ContinuationPoint indicates more references exist. Only the first returned references will be validated." );
            
            // there should be at least one reference and fewer than all the references
            if( AssertInRange( 1, maxReferences-1, result.References.length, "Invalid number of references returned." ) )
            {
                AssertReferenceArrayContainsSome( expectedReferences, result.References );
            }
        }
    }
    else
    {
        addError( "Operation result status code is not Good: " + result.StatusCode, result.StatusCode );
    }
}


/* This function will take an array of nodesToFind, these are the nodes that we have received, and we will then
   see if they exist in a cached nodeList. The nodes may or may not be in order.
   This function is used in the Browsing cases where the order of the results may come back differently on
   successive calls.
   
   Revision History:
       11-Mar-2011 NP: Initial version. */
function AssertNodeReferencesInListNotOrdered( nodesToFind, nodeList )
{
    // turn nodeList into an array if it is not already one.
    if( nodeList.length === undefined )
    {
        nodeList = [nodeList];
    }
    var result = true;
    var i; // i is the nodesToFind loop
    var l; // l is the nodeList loop.
    var found;
    for( i=0; i<nodesToFind.length; i++ )
    {
        found = false;
        // can we find nodesToFind[i] in nodeList?
        for( l=0; l<nodeList.length; l++ )
        {
            if( nodesToFind[i].ReferenceTypeId.equals( nodeList[l].ReferenceTypeId ) )
            {
                found = true;
                break; //break from "l" loop
            }//we have a match
        }//for l
        // if we got here and we didn't find the node, then the function fails
        if( found )
        {
            addLog( "Found Reference '" + nodesToFind[i] + "' in the response as expected." );
        }
        else
        {
            result = false;
            addError( "Expected to find Reference '" + nodesToFind[i] + "' somewhere in the response (not expecting the results to be sorted) but could not find it in the response anywhere." );
        }
    }//for i
    return( result );
}

// Each reference in references should be of one of the expectedTypes.
function AssertReferencesAreOfTypes( expectedTypes, references )
{
    for( var i = 0; i < references.length; i++ )
    {
        var found = false;
        for( var n = 0; n < expectedTypes.length; n++)
        {
            if( expectedTypes[n].equals( references[i].ReferenceTypeId ) )
            {
                found = true;
                break;
            }
        }
        AssertTrue( found, "ReferenceTypeId <" + references[i].ReferenceTypeId + "> not expected." );
    }
}


// Validate that ReferenceDescription fields are either null or match the
// expectedReference depending on the resultMask.
function AssertReferenceDescriptionFieldsMatchMask( resultMask, expectedReference, reference, referenceText )
{
    if( resultMask & 1 )
    {
        AssertNodeIdsEqual( expectedReference.ReferenceTypeId, reference.ReferenceTypeId, referenceText + "ReferenceTypeId does not match" );
    }
    else
    {
        AssertNullNodeId( reference.ReferenceTypeId, referenceText + "ReferenceTypeId is not a null NodeId" );
    }
    if( resultMask & 2 )
    {
        AssertEqual( expectedReference.IsForward, reference.IsForward, referenceText + "IsFoward does not match" );
    }
    else
    {
        // I don't think this will ever be null, so ensure it's false
        AssertFalse( reference.IsForward, referenceText + "IsForward is not false" );
    }
    if( resultMask & 4 )
    {
        AssertEqual( expectedReference.NodeClass, reference.NodeClass, referenceText + "NodeClass does not match" );
    }
    else
    {
        // I don't think this will ever be null, so ensure it's 0
        AssertEqual( 0, reference.NodeClass, referenceText + "NodeClass is not zero" );
    }
    if( resultMask & 8 )
    {
        AssertQualifiedNamesEqual( expectedReference.BrowseName, reference.BrowseName, referenceText + "BrowseName does not match" );
    }
    else
    {
        AssertNullQualifiedName( reference.BrowseName, referenceText + "BrowseName is not null or empty" );
    }
    if( resultMask & 16 )
    {
        AssertLocalizedTextsEqual( expectedReference.DisplayName, reference.DisplayName, referenceText + "DisplayName does not match" );
    }
    else
    {
        AssertNullLocalizedText( reference.DisplayName, referenceText + "DisplayName is not null or empty" );
    }
    if( resultMask & 32 )
    {
        AssertExpandedNodeIdsEqual( expectedReference.TypeDefinition, reference.TypeDefinition, referenceText + "TypeDefinition does not match" );
    }
    else
    {
        AssertNullExpandedNodeId( reference.TypeDefinition, referenceText + "TypeDefinition is not null or empty" );
    }
}
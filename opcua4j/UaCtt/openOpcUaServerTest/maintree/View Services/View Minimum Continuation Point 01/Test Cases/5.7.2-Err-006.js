/*    Test 5.7.2-Err-6 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node exists
            And the node has at least three forward references
            And RequestedMaxReferencesPerNode is 1
            And Browse has been called
            And BrowseNext has been called
            And ReleaseContinuationPoints was false
          When BrowseNext is called
            And ContinuationPoint is as from Browse result
          Then the server returns operation result Bad_ContinuationPointInvalid

          This test is only needed when the server returns a different ContinuationPoint
          for each Browse and BrowseNext call (servers may just re-use the same value).
      Revision History:
          2009-09-13 Dale Pope: Initial version.
          2009-11-30 NP: REVIEWED.
*/

/*global include, TestBrowseNextWhenMoreReferencesExist,  CreateDefaultBrowseNextRequest,
  Session, UaBrowseNextResponse, ExpectedAndAcceptedResults, StatusCode,
  checkBrowseNextError, addError
*/

include( "./library/ServiceBased/ViewServiceSet/BrowseNext/release_continuationpoints_test.js" );

function Test572Err6( returnDiagnostics )
{
    // BrowseNext with ReleaseContinuationPoints = true (when more references exist)
    var firstResponses = TestBrowseNextWhenMoreReferencesExist( false );
    if( firstResponses === -1 || firstResponses === undefined )
    {
        return;
    }

    // test is not needed if the server re-uses the ContinuationPoint handle
    if( firstResponses[0].Results[0].ContinuationPoint.equals( firstResponses[1].Results[0].ContinuationPoint ) )
    {
        addLog( "Server re-used the ContinuationPoint handle in the BrowseNext response." );
        return;
    }

    // BrowseNext with old ContinuationPoint
    var request = CreateDefaultBrowseNextRequest( Session );
    var response = new UaBrowseNextResponse();
    request.RequestHeader.ReturnDiagnostics = returnDiagnostics;
    request.ContinuationPoints[0] = firstResponses[0].Results[0].ContinuationPoint;
    var uaStatus = Session.browseNext( request, response );

    // check result
    if( uaStatus.isGood() )
    {
        var expectedOperationResultsArray = [];
        expectedOperationResultsArray[0] = new ExpectedAndAcceptedResults();
        expectedOperationResultsArray[0].addExpectedResult( StatusCode.BadContinuationPointInvalid );
        checkBrowseNextError( request, response, expectedOperationResultsArray );
    }
    else
    {
        addError( "browseNext() failed", uaStatus );
    }

    // clean-up any continuationPoints
    releaseContinuationPoints( Session, response );
}

function browseNext572err006()
{
    Test572Err6( 0 );
    Test572Err6( 0x3ff );
}

safelyInvoke( browseNext572err006 );
/*    Test 5.7.1-Err-8 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given multiple nodes to browse
            And the nodes exist
            And the nodes have at least one forward reference
            And the server limits the maximum number of continuation points
            And the number of nodes is equal to MaxBrowseContinuationPoints + 1
          When Browse is called
          Then the server returns a final operation result of Bad_NoContinuationPoints
            And all preceding operation results are Good

          Or, if there is limit, try getting 100 continuation points. UA Spec
          doesn't define this (or even suggest it), it just seemed like a
          reasonable number. The test, in this case, won't fail if fewer than
          100 can be allocated, but it will log a warning:

          Given multiple nodes to browse
            And the nodes exist
            And the server does not limit the maximum number of continuation points
            And the number of nodes is equal to 100
          When Browse is called
          Then the server returns all operation results as Good

          Note: it is OK to use the same node over and over (as this script does)
          because the ContinuationPoint will be unique for each.

      Revision History
          2009-08-28 DP: Initial version.
          2009-11-28 NP: REVIEWED.
*/

include( "./library/ServiceBased/ViewServiceSet/Browse/get_max_browse_continuation_points.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/number_of_continuation_points_test.js" );

function browse571Err8()
{
    // determine the maximum number of continuation points
    var maxContinuationPoints = GetMaxBrowseContinuationPoints();
    var unlimited = false;
    if( maxContinuationPoints == 0 )
    {
        addLog( "Server does not put a limit on the number of continuation points that can be allocated. Will try 100." );
        maxContinuationPoints = 99;
        unlimited = true;
    }
    else if( maxContinuationPoints < 0 )
    {
        addError( "Test cannot be completed: could not retrieve the value of MaxBrowseContinuationPoints from the server." );
        return
    }
    var continuationPointsToTry = parseInt( maxContinuationPoints ) + 1

    // run the test to get the point of first failure
    var nodeId = UaNodeId.fromString( readSetting( "/Server Test/NodeIds/References/Has Inverse And Forward References" ).toString() );
    if( nodeId === undefined || nodeId === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting 'Has Inverse And Forward References'." );
        return;
    }
    var failurePoint = BrowseNodesUntilOutOfContinuationPoints( nodeId, continuationPointsToTry, 0 );
    if( failurePoint < 0 )
    {
        addError( "Test cannot be completed." );
    }
    else if( failurePoint == 0 )
    {
        if( !unlimited )
        {
            addError( "Server allocated " + continuationPointsToTry + " continuation points, but it indicates it is able to have only " + maxContinuationPoints + " continuation points." );
        }
        // otherwise we're good: the server has no limit and the number we tried was successful
    }
    else if( failurePoint == 1 )
    {
        addError( "Server did not allocate any continuation points; it must be able to allocate at least one continuation point." );
    }
    else if( failurePoint < maxContinuationPoints )
    {
        if( !unlimited )
        {
            addError( "Server ran out of continuation points on node " + failurePoint + ", but server indicates it is able to have " + maxContinuationPoints + " continuation points." );
        }
        else
        {
            addWarning( "Server ran out of continuation points on node " + failurePoint + ", but server indicates it has no limit. Consider imposing a limit." );
        }
    }
}

safelyInvoke( browse571Err8 );
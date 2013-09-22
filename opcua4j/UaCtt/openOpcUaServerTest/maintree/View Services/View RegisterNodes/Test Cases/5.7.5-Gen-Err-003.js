/*    Test 5.4-Err-3 applied to RegisterNodes (5.7.5) 
        prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given a non-existent authenticationToken
          When UnregisterNodes is called
          Then the server returns service error Bad_SecurityChecksFailed

      Revision History
          2009-10-06 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED/INCONCLUSIVE. Server doesn't support UnRegisterNodes.
*/

/*global include, Session, checkUnregisterNodesFailed,
  UaNodeId, GetMultipleUniqueNodeIds,
  CreateDefaultUnregisterNodesRequest, 
  UaUnregisterNodesResponse, addError, 
  TestNonexistentAuthenticationToken
*/

include( "./library/ClassBased/UaRequestHeader/5.4-Err-003.js" );

function Test575GenErr003UnregisterNodes( request, response )
{
    return Session.unregisterNodes( request, response );
}

function Test575GenErr003Assert( request, response, expectedServiceResult )
{
    return checkUnregisterNodesFailed( request, response, expectedServiceResult );
}

function Test575GenErr003()
{
    var nodesToUnregister = GetMultipleUniqueNodeIds( 1 );

    var request = CreateDefaultUnregisterNodesRequest( Session );
    var response = new UaUnregisterNodesResponse();
    
    // setup a valid request
    for( var i = 0; i < nodesToUnregister.length; i++ )
    {
        request.NodesToUnregister[i] = nodesToUnregister[i];
    }

    TestNonexistentAuthenticationToken( Test575GenErr003UnregisterNodes, Test575GenErr003Assert, request, response );
}

safelyInvoke( Test575GenErr003 );

/*    Test 5.4-Err-3 applied to RegisterNodes (5.7.4) 
        prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given a non-existent authenticationToken
          When RegisterNodes is called
          Then the server returns service error Bad_SecurityChecksFailed

      Revision History:
          2009-10-06 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED/INCONCLUSIVE. Server doesn't support RegisterNodes.
*/

/*global include, Session, checkRegisterNodesFailed,
  UaNodeId, GetMultipleUniqueNodeIds,
  CreateDefaultRegisterNodesRequest, 
  UaRegisterNodesResponse, addError, 
  TestNonexistentAuthenticationToken
*/

include( "./library/ClassBased/UaRequestHeader/5.4-Err-003.js" );

function Test574GenErr003RegisterNodes( request, response )
{
    return Session.registerNodes( request, response );
}

function Test574GenErr003Assert( request, response, expectedServiceResult )
{
    return checkRegisterNodesFailed( request, response, expectedServiceResult );
}

function Test574GenErr003()
{
    var nodesToRegister = GetMultipleUniqueNodeIds( 1 );

    var request = CreateDefaultRegisterNodesRequest( Session );
    var response = new UaRegisterNodesResponse();
    
    // setup a valid request
    for( var i = 0; i < nodesToRegister.length; i++ )
    {
        request.NodesToRegister[i] = nodesToRegister[i];
    }

    TestNonexistentAuthenticationToken( Test574GenErr003RegisterNodes, Test574GenErr003Assert, request, response );
}

safelyInvoke( Test574GenErr003 );

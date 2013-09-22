/*    Test 5.4-Err-4 applied to UnregisterNodes (5.7.5) 
        prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given a RequestHeader.Timestamp of 0
          When UnregisterNodes is called
          Then the server returns service error Bad_InvalidTimestamp

      Revision History
          2009-10-06 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED/INCONCLUSIVE. Server doesn't support UnRegisterNodes.
*/

/*global include, Session, checkRegisterNodesFailed,
  UaNodeId, GetMultipleUniqueNodeIds,
  CreateDefaultUnregisterNodesRequest, addError,
  UaUnregisterNodesResponse, TestInvalidRequestHeaderTimestamp
*/

include( "./library/ClassBased/UaRequestHeader/5.4-Err-004.js" );

function Test575GenErr004UnregisterNodes( request, response )
{
    return Session.unregisterNodes( request, response );
}

function Test575GenErr004Assert( request, response, expectedServiceResult )
{
    return checkRegisterNodesFailed( request, response, expectedServiceResult );
}

function Test575GenErr004()
{
    var nodesToUnregister = GetMultipleUniqueNodeIds( 1 );

    var request = CreateDefaultUnregisterNodesRequest( Session );
    var response = new UaUnregisterNodesResponse();
    
    // setup a valid request
    for( var i = 0; i < nodesToUnregister.length; i++ )
    {
        request.NodesToUnregister[i] = nodesToUnregister[i];
    }
    
    TestInvalidRequestHeaderTimestamp( Test575GenErr004UnregisterNodes, Test575GenErr004Assert, request, response );
}

safelyInvoke( Test575GenErr004 );

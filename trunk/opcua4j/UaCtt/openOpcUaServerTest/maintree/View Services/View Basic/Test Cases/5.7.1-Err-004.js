/*    Test 5.7.1-Err-4 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node exists
            And the View request parameter is set to a non-empty ViewDescription
            And the ViewDescription.ViewId is a node that does not exist
          When Browse is called
          Then the server returns an service result of BadViewIdUnknown

      Revision History
          2009-08-27 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED.
          2009-11-27 DP: Fixed TestBrowseNodeWithInvalidView to expect the
                         service to fail (instead of the operation).
*/

include( "./library/ServiceBased/ViewServiceSet/Browse/invalid_view_test.js" );

function Test571Err4()
{
    var nodeId = UaNodeId.fromString( readSetting( "/Server Test/NodeIds/References/Has Inverse And Forward References" ).toString() );
    if( nodeId === undefined || nodeId === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting '/Server Test/NodeIds/References/Has Inverse And Forward References'." );
        return;
    }
    var viewId = UaNodeId.fromString( readSetting( "/Advanced/NodeIds/Invalid/UnknownNodeId1" ).toString() );
    TestBrowseNodeWithInvalidView( nodeId, viewId, 0 );
    TestBrowseNodeWithInvalidView( nodeId, viewId, 0x3ff );
}

safelyInvoke( Test571Err4 );
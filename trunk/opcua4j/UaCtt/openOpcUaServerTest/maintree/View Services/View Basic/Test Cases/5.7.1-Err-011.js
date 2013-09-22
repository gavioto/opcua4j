/*    Test 5.7.1-Err-11 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node exists
            And the ReferenceTypeId is set to an existent node ID
            And the ReferenceTypeId is not a reference type
          When Browse is called
          Then the server returns an operation result of BadReferenceTypeIdInvalid

      Revision History
          2009-09-08 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED.
*/

include( "./library/ServiceBased/ViewServiceSet/Browse/bad_referencetypeid_test.js" );

function view571err011()
{
    const NODE_SETTING = "/Server Test/NodeIds/NodeClasses/Variable";

    var item = MonitoredItem.fromSetting( NODE_SETTING, 0 );
    if( item == undefined || item == null )
    {
        addWarning( "Setting not configured! Setting: '" + NODE_SETTING + "'" );
        return;
    }

    TestBrowseBadReferenceTypeId( item.NodeId, 0 );
    TestBrowseBadReferenceTypeId( item.NodeId, 0x3ff );
}

safelyInvoke( view571err011 );
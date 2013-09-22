/*    Test 5.7.2-10 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node exists
            And the node has at least two references of the same node class
            And RequestedMaxReferencesPerNode is 1
            And NodeClassMask is set to the node class
            And Browse has been called
          When BrowseNext is called
            And ReleaseContinuationPoints is false
          Then the server returns the second reference
            And ContinuationPoint is not empty

          Validation is accomplished by first browsing all references matching 
          the node class, then performing the test and comparing the second 
          reference to the reference returned by the BrowseNext call. So this
          test only validates that Browse two references is consistent with 
          Browse one reference followed by BrowseNext.

      Revision History:
          2009-09-09 Dale Pope: Initial version.
          2009-11-30 NP: REVIEWED.
          2010-12-17 NP: Test is more dynamic now and will test nodeClasses that are configured in the settings.
          2011-03-28 MI: added missing break statements in switch case
*/

include( "./library/ServiceBased/ViewServiceSet/BrowseNext/node_class_mask_test.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/SettingsUtilities/NodeIds.js" );

// BrowseNext for references matching a NodeClassMask
function Test572010()
{
    var nodesForBrowsing = MonitoredItem.fromSettings( NodeIdSettings.NodeClasses() );
    // do we have enough nodes for testing?
    if( 0 === nodesForBrowsing.length )
    {
        addSkipped( "Unable to complete test. Zero nodes configured for nodeClass testing." );
        return;
    }
    if( nodesForBrowsing.length !== NodeIdSettings.NodeClasses().length )
    {
        addWarning( "Some NodeClasses wil not be tested because they are not configured." );
    }

    var nodeClasses = [];
    var nodesToBrowse = [];
    for( var i=0; i<nodesForBrowsing.length; i++ )
    {
        nodesToBrowse.push( nodesForBrowsing[i].NodeId );
        switch( nodesForBrowsing[i].NodeSetting )
        {
            case "/Server Test/NodeIds/NodeClasses/HasObject":
                nodeClasses.push( NodeClass.Object );
                break;
            case "/Server Test/NodeIds/NodeClasses/HasVariable":
                nodeClasses.push( NodeClass.Variable );
                break;
            case "/Server Test/NodeIds/NodeClasses/HasMethod":
                nodeClasses.push( NodeClass.Method );
                break;
            case "/Server Test/NodeIds/NodeClasses/HasObjectType":
                nodeClasses.push( NodeClass.ObjectType );
                break;
            case "/Server Test/NodeIds/NodeClasses/HasVariableType":
                nodeClasses.push( NodeClass.VariableType );
                break;
            case "/Server Test/NodeIds/NodeClasses/HasReferenceType":
                nodeClasses.push( NodeClass.ReferenceType );
                break;
            case "/Server Test/NodeIds/NodeClasses/HasDataType":
                nodeClasses.push( NodeClass.DataType );
                break;
        }
    }

    // now test each nodeClass that is configured
    for( var i=0; i<nodesToBrowse.length; i++ )
    {
        addLog( "Testing nodeClassMask <" + NodeClass.toString(nodeClasses[i]) + "> on Node '" + nodesToBrowse[i] + "'." );
        TestBrowseNextWhenMoreNodeClassReferencesExist( nodesToBrowse[i], nodeClasses[i] );
    }
}

safelyInvoke( Test572010 );
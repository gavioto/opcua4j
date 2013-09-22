/*    Test 5.7.1-7 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node has a reference matching the nodeClassMask
            And the nodeClassMask is set to one node class
          When Browse is called
          Then the server returns references with node classes matching the mask
          
          Validation is accomplished by first browsing all references on a node
          with nodeClassMask = 0xFF, storing the found references, and comparing
          them to the nodeClassMask.
          
          Test once with a node that has a reference of node class matching the 
          NodeClassMask. If the node does not also have references of a different 
          node class, then perform another test where references of a different 
          node class do exist.

      Revision History
          2009-08-25 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED.
          2010-12-17 NP: Script now uses the "nodesToBrowse" from initialize.
*/

include( "./library/ServiceBased/ViewServiceSet/Browse/node_class_mask_test.js" );

// The test
function Test571007()
{
    for( var i = 0; i < nodesToBrowse.length; i++ )
    {
        var nodeClassMask = 1 << i;
        addLog( "Testing nodeClassMask <" + NodeClass.toString(nodeClassMask) + "> with returnDiagnositcs <0>" );
        BrowseOneNodeWithClassMaskMatchAndNoMatch( nodesToBrowse[i], nodeClassMask, nodesToBrowse, 0 );
        
        addLog( "Testing nodeClassMask <" + NodeClass.toString(nodeClassMask) + "> with returnDiagnositcs <0x3FF>" );
        BrowseOneNodeWithClassMaskMatchAndNoMatch( nodesToBrowse[i], nodeClassMask, nodesToBrowse, 0x3FF );
    }
}

safelyInvoke( Test571007 );
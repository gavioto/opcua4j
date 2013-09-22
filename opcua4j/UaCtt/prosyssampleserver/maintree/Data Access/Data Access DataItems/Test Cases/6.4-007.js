/*  Test 6.4 Test #7, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
        Write to "ValuePrecision" property of a DataItem. Acquire the handle to the
        "ValuePrecision" nodeId using the TranslateBrowsePathsToNodeIds service.

    Revision History: 
        19-Feb-2010 Anand Taparia: Initial version.
        03-Mar-2010 NP: REVIEWED. Inconclusive.
*/

function write614007 ()
{
    var monitoredItems = MonitoredItem.fromSettings( NodeIdSettings.DAAStaticDataItem(), 1 );
    if ( monitoredItems.length == 0 )
    {
        addSkipped( "Static DataItem" );
        return;
    }

    // Only these datatypes need to be tested (only thesse have ValuePrecision property)
    var dataTypesToTest = [ BuiltInType.Float, BuiltInType.Double, BuiltInType.DateTime ];

    // Loop through the items and test the datatypes of interest
    for ( var i=0; i<monitoredItems.length; i++ )
    {
        // Continue only if datatype of interest
        var currentNodeDataType = NodeIdSettings.guessType ( monitoredItems[i].NodeSetting );
        var dataTypesToTestIndex = 0;
        for ( dataTypesToTestIndex=0; dataTypesToTestIndex<dataTypesToTest.length; dataTypesToTestIndex++ )
        {
            if ( dataTypesToTest[ dataTypesToTestIndex ] == currentNodeDataType ) break;
        }
        // If not the correct type, move to the next item
        if ( dataTypesToTestIndex >= dataTypesToTest.length) continue;

        // Get the nodeID of the "ValuePrecision" property
        var returnedNodeIds = getPropertyNodeId( g_session, monitoredItems[i].NodeId, "0:ValuePrecision" );

        // Did we actually find the property
        if( returnedNodeIds !== null && returnedNodeIds !== undefined )
        {
            if ( returnedNodeIds.length > 0)
            {
                AssertEqual ( returnedNodeIds.length, 1, "Expected a single nodeID from the translate operation on node '" + monitoredItems[i].NodeSetting + "'.");

                // Do the write
                var writeMonitoredItems = MonitoredItem.fromNodeIds ( returnedNodeIds );
                writeMonitoredItems[0].SafelySetValueTypeKnown( 2.0, BuiltInType.Double );
                results = [];
                results[0] = new ExpectedAndAcceptedResults( StatusCode.Good );
                results[0].addAcceptedResult ( StatusCode.BadUserAccessDenied );
                if ( WriteHelper.Execute ( writeMonitoredItems[0], results, true ) == false)
                {
                    addError ( "write() failed for the 'ValuePrecision' property of the node '" + monitoredItems[i].NodeSetting + "'." );
                }
            }
            else
            {
                addLog ( "The optional 'ValuePrecision' property not found in node '" + monitoredItems[i].NodeSetting + "'." );
            }
        }
        else
        {
            addLog ( "The optional 'ValuePrecision' property not found in node '" + monitoredItems[i].NodeSetting + "'." );
        }
    }
}

safelyInvoke ( write614007 );
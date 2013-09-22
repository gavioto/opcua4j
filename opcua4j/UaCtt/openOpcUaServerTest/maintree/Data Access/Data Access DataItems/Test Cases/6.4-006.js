/*  Test 6.4 Test #6, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
        Write to "Definition" property of a DataItem. Acquire the handle to the
        "Definition" nodeId using the TranslateBrowsePathsToNodeIds service.

    Revision History: 
        19-Feb-2010 Anand Taparia: Initial version.
        03-Mar-2010 NP: REVIEWED.
*/

function write614006()
{
    var monitoredItems = MonitoredItem.fromSettings( NodeIdSettings.DAAStaticDataItem(), 1 );
    if ( monitoredItems.length == 0 )
    {
        addSkipped( "Static DataItem" );
        return;
    }
    
    // Get the nodeID of the "Definition" property
    var returnedNodeIds = getPropertyNodeId( g_session, monitoredItems[0].NodeId, "0:Definition" );
    
    // Did we actually find the property
    if( returnedNodeIds !== null && returnedNodeIds !== undefined )
    {
        if( returnedNodeIds.length > 0)
        {
            AssertEqual ( returnedNodeIds.length, 1, "Expected a single nodeID from the translate operation.");

            // Let's do the read first and cache the value 
            var cachedDefinitionValue = "ThisIsANonCachedValue";
            var readMonitoredItems = MonitoredItem.fromNodeIds ( returnedNodeIds );
            var results = [];
            results[0] = new ExpectedAndAcceptedResults( StatusCode.Good );
            if ( ReadHelper.Execute ( readMonitoredItems[0], results, true ) == false )
            {
                addWarning ( "read() failed for the 'Definition' property of the node '" + monitoredItems[0].NodeSetting + "'." );
            }
            else
            {
                // Cache the value here
                cachedDefinitionValue = readMonitoredItem.Value.Value.toString ();
            }

            // Now do the write
            var writeMonitoredItems = MonitoredItem.fromNodeIds ( returnedNodeIds );
            writeMonitoredItems[0].SafelySetValueTypeKnown( cachedDefinitionValue, BuiltInType.String );
            results = [];
            results[0] = new ExpectedAndAcceptedResults( StatusCode.Good );
            results[0].addAcceptedResult ( StatusCode.BadUserAccessDenied );
            if ( WriteHelper.Execute ( writeMonitoredItems[0], results, true ) == false)
            {
                addError ( "write() failed for the 'Definition' property of the node '" + monitoredItems[0].NodeSetting + "'." );
            }
        }
        else
        {
            addLog ( "The optional 'Definition' property not found in node '" + monitoredItems[0].NodeSetting + "'." );
        }
    }
    else
    {
        addLog ( "The optional 'Definition' property not found in node '" + monitoredItems[0].NodeSetting + "'." );
    }
}

safelyInvoke ( write614006 );
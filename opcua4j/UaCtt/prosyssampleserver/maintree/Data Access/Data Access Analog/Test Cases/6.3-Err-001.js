/*  Test 6.3 Error Test #1, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
        Write a complex structure (incorrect type) to an analog item.

    Revision History: 
        10-Feb-2010 Anand Taparia: Initial Version.
        04-Mar-2010 NP: REVIEWED.
*/

function write613Err001()
{
    // Get handle to an analog node
    var monitoredItems = MonitoredItem.fromSettings( NodeIdSettings.DAStaticAnalog(), 1 );
    if( monitoredItems.length == 0 )
    {
        addSkipped( "Static Analog" );
        return;
    }

    // We are interested in a single item for this test
    var writeMonitoredItem = monitoredItems[0];
    
    // Write
    print ( "Writing an 'XmlElement' to analog node '" + writeMonitoredItem.NodeSetting + "' of datatype '" + BuiltInType.toString ( NodeIdSettings.guessType( writeMonitoredItem.NodeSetting ) ) + "'." );
    var xmle = new UaXmlElement();
    xmle.setString( "<xml1>6.3-Err-001</xml1>" );
    writeMonitoredItem.SafelySetValueTypeKnown( xmle, BuiltInType.XmlElement );
    // Expected result
    var results = [];
    results[0] = new ExpectedAndAcceptedResults( StatusCode.BadTypeMismatch );
    if( WriteHelper.Execute( writeMonitoredItem, results, true ) == false )
    {
        addError( "Write failed for node: '" + writeMonitoredItem.NodeSetting + "'." );
    }
}

safelyInvoke( write613Err001 );
/*  Test 5.8.2 Test 2; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to the Value attribute for multiple valid nodes.

    Revision History
        24-Aug-2009 NP: Initial version.
        12-Nov-2009 NP: REVIEWED.
        16-Nov-2009 DP: Added check for number of nodes that will actually be written to,
                        declared the uaStatus variable.
        09-Dec-2009 DP: Write to all available static scalar NodeIds (from settings).
        12-Jan-2010 DP: Include additional static scalar NodeIds.
        19-Mar-2010 NP: Rewritten portions to use new script library objects.
                        Added expected Read results to accept Good/BadWriteNotSupported.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582002()
{
    var scalarNodes = NodeIdSettings.ScalarStatic();
    var items = MonitoredItem.fromSettings( scalarNodes, 0, Attribute.Value );
    if( items == null || items.length < 2 )
    {
        addSkipped( "Static Scalar" );
        return;
    }
    // setup some expectations that would allow the write to succeed or fail
    // if writes are not supported
    var readResults = [];
    for( var i=0; i<items.length; i++ )
    {
        readResults[i] = new ExpectedAndAcceptedResults( StatusCode.Good );
        readResults[i].addExpectedResult( StatusCode.BadWriteNotSupported );
        GenerateScalarValue( items[i].Value.Value, NodeIdSettings.guessType( items[i].NodeSetting ), 2 );
    }//for i...
    writeService.Execute( items, readResults, true, OPTIONAL_CONFORMANCEUNIT );
}

safelyInvoke( write582002 );
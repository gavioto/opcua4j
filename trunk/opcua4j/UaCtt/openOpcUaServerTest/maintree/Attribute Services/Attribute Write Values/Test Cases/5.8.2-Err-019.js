/*  Test 5.8.2 Error Test 19; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write a NULL value for each supported data-type.
        Expect a Bad_TypeMismatch for each operation level result.

    Revision History
        05-Oct-2009 NP: Initial version.
        16-Nov-2009 NP: REVIEWED.
        26-Nov-2009 DP: Fixed expectedResults array to be in sync with the NodesToWrite array.
        16-Dec-2009 DP: Write initial values after attempting to write nulls (in case nulls are accepted).
        19-Mar-2010 NP: Rewritten portions to use new script library objects.
                        Also, provides the setting name for a node

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582019()
{
    var scalarNodes = NodeIdSettings.ScalarStatic();
    var items = MonitoredItem.fromSettings( scalarNodes, 0, Attribute.Value );
    if( items == null || items.length < 2 )
    {
        addSkipped( "Static Scalar" );
        return;
    }
    // read the nodes first
    if( !READ.Execute( items ) )
    {
        addError( "Read(): status " + READ.uaStatus, READ.uaStatus );
        return;
    }

    var expectedResults   = [];
    var replacementValues = [];
    //dynamically construct IDs of nodes to write, specifically their values.
    for( var i=0; i<items.length; i++ )
    {
        // store the value retrieved first
        replacementValues[i] = items[i].Value.Value;
        //get the value of the setting, and make sure it contains a value
        items[i].Value.Value = new UaVariant();
        expectedResults[i] = new ExpectedAndAcceptedResults( StatusCode.BadTypeMismatch );
        expectedResults[i].addExpectedResult( StatusCode.Good );
    }//for

    //WRITE the nodes.
    writeService.Execute( items, expectedResults, true );

    // in case we did write nulls, replace them with normal values
    // (having nulls can screw up following scripts)
    for( i=0; i<replacementValues.length; i++ )
    {
        items[i].Value.Value = replacementValues[i];
        expectedResults[i] = new ExpectedAndAcceptedResults( StatusCode.Good );
        expectedResults[i].addExpectedResult( StatusCode.BadWriteNotSupported );
    }
    writeService.Execute( items, undefined, undefined, OPTIONAL_CONFORMANCEUNIT );
}

safelyInvoke( write582019 );
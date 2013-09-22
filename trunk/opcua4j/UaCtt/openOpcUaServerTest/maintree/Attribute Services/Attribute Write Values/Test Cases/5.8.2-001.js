/*  Test 5.8.2 Test 1; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to the Value attribute (without statusCode, sourceTimestamp, or 
        serverTimestamp) of a valid nodeId.

    Revision History
        24-Aug-2009 NP: Initial version.
        12-Nov-2009 NP: Revised to use new Script library objects.
        12-Nov-2009 NP: REVIEWED.
        12-Jan-2010 DP: Replaced references to Int16 setting with any setting.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582001()
{
    var nodeSetting = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iud" );
    if( nodeSetting === undefined || nodeSetting == null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }
    var item = MonitoredItem.fromSetting( nodeSetting.name, 0, Attribute.Value );
    if( item == null ) { return };
    GenerateScalarValue( item.Value.Value, nodeSetting.datatype, 1 );
    var readResults = [ new ExpectedAndAcceptedResults( StatusCode.Good ) ];
        readResults[0].addExpectedResult( StatusCode.BadWriteNotSupported );
    writeService.Execute( item, readResults, true, OPTIONAL_CONFORMANCEUNIT );
}

safelyInvoke( write582001 );
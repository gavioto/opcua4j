/*  Test 5.8.1 Test 25; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Read a single attribute from multiple valid node where the type is 
        an array data type.

    Revision History
        22-Sep-2009 NP: Initial version
        10-Nov-2009 NP: Revised to use new Script library objects.
        10-Nov-2009 NP: Added code to verify the data-types of each value returned.
        10-Nov-2009 NP: REVIEWED.
        19-Mar-2010 NP: Revised to treat Byte[] as a ByteString.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581025()
{
    const MAXSTRINGSIZE = 100;
    var items = MonitoredItem.fromSettings( NodeIdSettings.ArraysStatic(), 0 );
    if( items == null || items.length < 1 )
    {
        addSkipped( "Arrays" );
        return;
    }

    if( ReadHelper.Execute( items, TimestampsToReturn.Both, 100 ) )
    {
        // we're looping based on the 'nodeNumber' which is based on the number of
        // settings that were found to be valid, i.e. set and not empty!
        for( var r=0; r<items.length; r++ )
        {
            // display the values
            var resultsString = ReadHelper.readResponse.Results[r].Value.toString();
            if( resultsString.length > MAXSTRINGSIZE )
            {
                resultsString = resultsString.substring( 0, MAXSTRINGSIZE ) + "... (truncated by script)";
            }
            print( "Array value: '" + resultsString + "'" );

            switch( items[r].NodeSetting )
            {
                case "/Server Test/NodeIds/Static/All Profiles/Arrays/Bool":
                    AssertUaValueOfType( BuiltInType.Boolean, ReadHelper.readResponse.Results[r].Value );
                    break;
                case  "/Server Test/NodeIds/Static/All Profiles/Arrays/Byte":
                    AssertUaValueOfType( BuiltInType.Byte, ReadHelper.readResponse.Results[r].Value );
                    break;
                case  "/Server Test/NodeIds/Static/All Profiles/Arrays/ByteString":
                    AssertUaValueOfType( BuiltInType.ByteString, ReadHelper.readResponse.Results[r].Value );
                    break;
                case "/Server Test/NodeIds/Static/All Profiles/Arrays/DateTime":
                    AssertUaValueOfType( BuiltInType.DateTime, ReadHelper.readResponse.Results[r].Value );
                    break;
                case "/Server Test/NodeIds/Static/All Profiles/Arrays/Double":
                    AssertUaValueOfType( BuiltInType.Double, ReadHelper.readResponse.Results[r].Value );
                    break;
                case "/Server Test/NodeIds/Static/All Profiles/Arrays/Float":
                    AssertUaValueOfType( BuiltInType.Float, ReadHelper.readResponse.Results[r].Value );
                    break;
                case "/Server Test/NodeIds/Static/All Profiles/Arrays/Guid":
                    AssertUaValueOfType( BuiltInType.Guid, ReadHelper.readResponse.Results[r].Value );
                    break;
                case "/Server Test/NodeIds/Static/All Profiles/Arrays/Int16":
                    AssertUaValueOfType( BuiltInType.Int16, ReadHelper.readResponse.Results[r].Value );
                    break;
                case "/Server Test/NodeIds/Static/All Profiles/Arrays/Int32":
                    AssertUaValueOfType( BuiltInType.Int32, ReadHelper.readResponse.Results[r].Value );
                    break;
                case "/Server Test/NodeIds/Static/All Profiles/Arrays/Int64":
                    AssertUaValueOfType( BuiltInType.Int64, ReadHelper.readResponse.Results[r].Value );
                    break;
                case "/Server Test/NodeIds/Static/All Profiles/Arrays/SByte":
                    AssertUaValueOfType( BuiltInType.SByte, ReadHelper.readResponse.Results[r].Value );
                    break;
                case "/Server Test/NodeIds/Static/All Profiles/Arrays/String":
                    AssertUaValueOfType( BuiltInType.String, ReadHelper.readResponse.Results[r].Value );
                    break;
                case "/Server Test/NodeIds/Static/All Profiles/Arrays/UInt16":
                    AssertUaValueOfType( BuiltInType.UInt16, ReadHelper.readResponse.Results[r].Value );
                    break;
                case "/Server Test/NodeIds/Static/All Profiles/Arrays/UInt32":
                    AssertUaValueOfType( BuiltInType.UInt32, ReadHelper.readResponse.Results[r].Value );
                    break;
                case "/Server Test/NodeIds/Static/All Profiles/Arrays/UInt64":
                    AssertUaValueOfType( BuiltInType.UInt64, ReadHelper.readResponse.Results[r].Value );
                    break;
                case "/Server Test/NodeIds/Static/All Profiles/Arrays/XmlElement":
                    AssertUaValueOfType( BuiltInType.XmlElement, ReadHelper.readResponse.Results[r].Value );
                    break;
                default:
                    addError( "Built in type not specified: " + items[r].NodeSetting );
            }// switch
            if( ReadHelper.readResponse.Results[r].Value.DataType !== BuiltInType.ByteString )
            {
                AssertEqual( 1, ReadHelper.readResponse.Results[r].Value.ArrayType, "Not an Array type: " + items[r].NodeSetting );
            }
        }// for r....
    }// if Read....
}

safelyInvoke( read581025 );
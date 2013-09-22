/*  Test 5.8.2 Test 18; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write the MAXIMUM value for each supported data-type.

    Revision History
        24-Sep-2009 NP: Initial version.
        16-Nov-2009 NP: REVIEWED.
        19-Mar-2010 NP: Rewritten to use new script library helper objects.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582016()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, Attribute.Value );
    if( items == null || items.length < 3 )
    {
        addSkipped( "Static Scalar" );
        return;
    }
    // do a reading of the items first, to get the values and DATA TYPES!!!!
    if( READ.Execute( items ) )
    {
        var itemsToWrite = []; // these are the items that we will use for Writing 
        var expectedResults = [];
        
        for( var i=0; i<items.length; i++ )
        {
            var addItemToWriteList = true;
            // generate a value based on the type
            switch( items[i].Value.Value.DataType )
            {
                case BuiltInType.Boolean: 
                    items[i].Value.Value.setBoolean( true );break;
                case BuiltInType.SByte:
                    items[i].Value.Value.setSByte( Constants.SByte_Max ); break;
                case BuiltInType.Byte:
                    items[i].Value.Value.setByte( Constants.Byte_Max ); break;
                case BuiltInType.Int16:
                    items[i].Value.Value.setInt16( Constants.Int16_Max ); break;
                case BuiltInType.Int32:
                    items[i].Value.Value.setInt32( Constants.Int32_Max ); break;
                case BuiltInType.Int64:
                    items[i].Value.Value.setInt64( Constants.Int64_Max ); break;
                case BuiltInType.UInt16:
                    items[i].Value.Value.setUInt16( Constants.UInt16_Max ); break;
                case BuiltInType.UInt32:
                    items[i].Value.Value.setUInt32( Constants.UInt32_Max ); break;
                case BuiltInType.UInt64:
                    items[i].Value.Value.setUInt64( Constants.UInt64_Max ); break;
                case BuiltInType.Float:
                    items[i].Value.Value.setFloat( Constants.Float_Max ); break;
                case BuiltInType.Double:
                    items[i].Value.Value.setDouble( Constants.Double_Max ); break;
                default:
                    print( "Data Type not defined for testing: " + BuiltInType.toString( items[i].Value.Value.DataType ) );
                    addItemToWriteList = false;
            }
            if( addItemToWriteList )
            {
                // add the item to our list of items to write to
                itemsToWrite.push( items[i] );
                // now specify the expected results for this individual write transaction
                var newErr = new ExpectedAndAcceptedResults( StatusCode.Good );
                newErr.addExpectedResult( StatusCode.BadWriteNotSupported );
                expectedResults.push( newErr );
            }
        }// for i...
        // now Write
        if( itemsToWrite == null || itemsToWrite.length < 3 )
        {
            addWarning( "Not enough nodes to test with. Aborting test." );
            return;
        }
        writeService.Execute( itemsToWrite, expectedResults, true, OPTIONAL_CONFORMANCEUNIT );
    }
    else
    {
        addError( "Read(): status " + READ.uaStatus, READ.uaStatus );
    }
}

safelyInvoke( write582016 );
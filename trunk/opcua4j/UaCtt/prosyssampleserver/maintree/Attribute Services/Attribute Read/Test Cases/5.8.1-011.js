/*  Test 5.8.1 Test 11; prepared by Nathan Pocock: nathan.pocock@opcfoundation.org

    Description:
        Reads the BROWSENAME attribute of multiple valid nodes.
        Checks the length of the results > 0.

    Revision History
        24-Aug-2009 NP: Initial version.
        06-Nov-2009 NP: Revised to use new script library objects.
        06-Nov-2009 NP: Reviewed.
        08-Dec-2009 DP: Added more NodeIds that might be used.
                        Ensured at least three NodeIds exist (rather than all of them).

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581011()
{
    var nodeSettings = NodeIdSettings.ScalarStatic();
    
    var items = MonitoredItem.fromSettings( nodeSettings, 0, Attribute.BrowseName, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true );
    if( items.length < 3 )
    {
        _dataTypeUnavailable.store( [ "Static Scalar", "Scalar Static One Type" ] );
        addSkipped( [ "Static Scalar", "Scalar Static One Type" ] );
        return;
    }

    if( ReadHelper.Execute( items, TimestampsToReturn.Both, 10000 ) )
    {
        //iterate thru item results checking for good data
        for( var i=0; i<ReadHelper.readResponse.Results.length; i++ )
        {
            //see *this* item is not in good quality
            if( false == ReadHelper.readResponse.Results[i].StatusCode.isGood() )
            {
                addError( "Item (" + i + ") (setting: '" + items[i].NodeSetting + "') is not good quality, but is actually: " + readService.readResponse.Results[i].StatusCode.toString() );
            }
            else
            {
                //checking the length > 0 because checking for null
                //would cause script compiler to exit (no error thrown).
                if( ReadHelper.readResponse.Results[i].Value.toString().length == 0 )
                {
                    addError( "BrowseName is empty/null" );
                }
                else
                {
                    addLog( "  (" + i + ") BrowseName = " + ReadHelper.readResponse.Results[i].Value.toString() + " (setting: '" + items[i].NodeSetting + "') " );
                }
            }//else...if...
        }//for i...
    }
}

safelyInvoke( read581011 );
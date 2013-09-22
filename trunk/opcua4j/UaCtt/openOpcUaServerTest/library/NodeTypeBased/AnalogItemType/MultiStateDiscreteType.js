/*  Nathan Pocock; nathan.pocock@opcfoundation.org
    This function returns the TwoStateDiscrete of a given node, or a NULL.
*/
function GetMultiStateDiscreteEnumStrings( nodeSetting, sessionObject, readHelper )
{
    var item = MonitoredItem.fromSetting( nodeSetting, 0 );
    var result = null;
    var browseRequest = GetDefaultBrowseRequest( g_session, item.NodeId );

    var browseResponse = new UaBrowseResponse();
    var uaStatus = sessionObject.browse( browseRequest, browseResponse );
    if( uaStatus.isGood() )
    {
        AssertBrowseValidParameter( browseRequest, browseResponse );
        var isMultiStateDiscreteItem = false;
        var enumStrings = null;
        print( "\n\tThere are " + browseResponse.Results.length + " Browse() results." );
        for( var i=0; i<browseResponse.Results.length; i++ )
        {
            print( "\tResults[" + i + "] = " + browseResponse.Results[i] );
            for( var r=0; r<browseResponse.Results[i].References.length; r++ )
            {
                if( browseResponse.Results[i].References[r].BrowseName.Name == "MultiStateDiscreteType" )
                {
                    print( "\tMultiStateDiscreteType HasTypeDefinition Found!" );
                    isMultiStateDiscreteItem = true;
                }
                if( browseResponse.Results[i].References[r].BrowseName.Name == "EnumStrings" )
                {
                    print( "\tEnumStrings Variable Found!" );
                    enumStrings = MonitoredItem.fromNodeIds( [browseResponse.Results[i].References[r].NodeId.NodeId] )[0];
                }
            }
            AssertTrue( isMultiStateDiscreteItem, "Specified node '" + item.NodeId + "' (setting: " + item.NodeSetting + ") is not of type MultiStateDiscreteType" );
        }
        if( enumStrings !== null )
        {
            // now to extract the EnumStrings variable
            if( readHelper.Execute( enumStrings ) )
            {
                result = enumStrings.Value.Value.toLocalizedTextArray();

                // lets do some validation here, then it'll be global
                print( "\n\tEnumerated values length: " + result.length + "; and are listed here:" );
                AssertGreaterThan( 0, result.length, "Enumeration should have at least 1 element defined!" );
                for( var i=0; i<result.length; i++ )
                {
                    print( "\t\t" + result[i].Text );
                    AssertNotNullOrEmpty( result[i].Text, "Enumeration (element) should not be empty!" );
                }
            }
        }
        else
        {
            addError( "Test Aborted. Specified Node does not have a TrueState/FalseState property." );
        }
    }
    else
    {
        addError( "Test aborted. Browse failed: " + uaStatus, uaStatus );
    }
    return( result );
}
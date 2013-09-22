include( "./library/ServiceBased/ViewServiceSet/Browse/get_default_request.js" );

function TrueStateFalseStateObject( trueState, falseState )
{
    this.TrueState = null;
    this.FalseState = null;
    this.TrueStateLocalized = null;
    this.FalseStateLocalized = null;
    
    if( arguments.length !== 2 )
    {
        throw( "Invalid argument count. 2 values required: TrueState and FalseState." );
    }
    else
    {
        var localizedValue = null;
        if( trueState !== undefined && trueState !== null )
        {
            this.TrueState = trueState;
            this.TrueStateLocalized = trueState.Value.Value.toLocalizedText();
        }
        if( falseState !== undefined && falseState !== null )
        {
            this.FalseState = falseState;
            this.FalseStateLocalized = falseState.Value.Value.toLocalizedText();
        }
        if( this.TrueState == null || this.FalseState == null )
        {
            throw( "Invalid arguments specified!" );
        }
    }
}

/*  Nathan Pocock; nathan.pocock@opcfoundation.org
    This function returns the TwoStateDiscrete of a given node, or a NULL.
*/
function GetTrueStateFalseState( nodeSetting, sessionObject, readHelper )
{
    var item = MonitoredItem.fromSetting( nodeSetting, 0 );
    var result = null;
    var browseRequest = GetDefaultBrowseRequest( g_session, item.NodeId );

    var browseResponse = new UaBrowseResponse();
    var uaStatus = sessionObject.browse( browseRequest, browseResponse );
    if( uaStatus.isGood() )
    {
        AssertBrowseValidParameter( browseRequest, browseResponse );
        var isTrueStateFalseState = false;
        var trueStateItem = null;
        var falseStateItem = null;
        print( "\n\tThere are " + browseResponse.Results.length + " Browse() results." );
        for( var i=0; i<browseResponse.Results.length; i++ )
        {
            print( "\tResults[" + i + "] = " + browseResponse.Results[i] );
            for( var r=0; r<browseResponse.Results[i].References.length; r++ )
            {
                if( browseResponse.Results[i].References[r].BrowseName.Name == "TwoStateDiscreteType" )
                {
                    print( "\tTwoStateDiscreteType HasTypeDefinition Found!" );
                    isTrueStateFalseState = true;
                }
                if( browseResponse.Results[i].References[r].BrowseName.Name == "TrueState" )
                {
                    print( "\tTrueState Variable Found!" );
                    trueStateItem = MonitoredItem.fromNodeIds( [browseResponse.Results[i].References[r].NodeId.NodeId] )[0];
                }
                if( browseResponse.Results[i].References[r].BrowseName.Name == "FalseState" )
                {
                    print( "\tFalseState Variable Found!" );
                    falseStateItem = MonitoredItem.fromNodeIds( [browseResponse.Results[i].References[r].NodeId.NodeId] )[0];
                }
            }
            AssertTrue( isTrueStateFalseState, "Specified node '" + item.NodeId + "' (setting: " + item.NodeSetting + ") is not of type TwoStateDiscreteType" );
        }
        if( falseStateItem !== null && trueStateItem !== null )
        {
            // now to extract the LOW and HIGH range
            if( readHelper.Execute( [trueStateItem, falseStateItem] ) )
            {
                result = new TrueStateFalseStateObject( trueStateItem, falseStateItem );
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

function WriteValue( item, value, type, writeHelper )
{
    switch( type )
    {
        case BuiltInType.String:
            item.Value.Value.setString( value );
            break;
        case BuiltInType.Int16:
            item.Value.Value.setInt16( value );
            break;
    }
    var expectedErrors = [ new ExpectedAndAcceptedResults( StatusCode.BadTypeMismatch ) ];
    writeHelper.Execute( item, expectedErrors, true );
}
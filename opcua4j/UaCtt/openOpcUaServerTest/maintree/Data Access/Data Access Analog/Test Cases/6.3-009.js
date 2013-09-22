/*  Test 6.3 Test #9, prepared by Anand Taparia; ataparia@kepware.com

    Description: 
        Write to the EURange attribute.

    Revision History: 
        09-Feb-2010 Anand Taparia: Initial Version (based on the function 'GetNodeIdEURange' by NP)
        04-Mar-2010 NP: REVIEWED.
        24-Aug-2010 NP: Revised to WRITE the original EURange after testing.
        03-Feb-2011 MI: Fix. If write does not succeed don't read back the written value.
        03-Feb-2011 NP: Fix. Does not revert EURange if write failed. Added more checks on specific StatusCodes.
*/

function write613009()
{
    // Get handle to an analog node
    if( AnalogItems == null || AnalogItems.length == 0 )
    {
        addSkipped( "Static Analog" );
        return;
    }
    
    var hasPropertyReferenceType = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.HasProperty ) )[0];//fromSetting( "/Server Test/NodeIds/References/HasProperty", 1 );
    if( hasPropertyReferenceType == null )
    {
        _dataTypeUnavailable.store( "HasPropertyType" );
        print( "Test cannot be completed: HasProperty types not set in settings." );
        return;
    }
    
    var browseRequest = GetDefaultBrowseRequest( g_session, AnalogItems[0].NodeId );
    var browseResponse = new UaBrowseResponse();
    browseRequest.NodesToBrowse[0].ReferenceTypeId = hasPropertyReferenceType.NodeId;
    print ( "Browsing the EURange property of the anlog node '" + AnalogItems[0].NodeSetting + "'." );
    var uaStatus = g_session.browse( browseRequest, browseResponse );
    if( uaStatus.isGood() )
    {
        AssertBrowseValidParameter( browseRequest, browseResponse );
        
        var euRangeFound = false;
        var euRangeItem  = null;
        for( var i=0; i<browseResponse.Results.length; i++ )
        {
            for( var r=0; r<browseResponse.Results[i].References.length; r++ )
            {
                if( browseResponse.Results[i].References[r].BrowseName.Name == "EURange" )
                {
                    addLog( "EURange property found." );
                    euRangeFound = true;
                    euRangeItem = MonitoredItem.fromNodeIds( [browseResponse.Results[i].References[r].NodeId.NodeId] )[0];
                    break;
                }
            }
            // Our work here is done if we have found the EURange property
            if ( euRangeFound ) break;
        }
        if( euRangeFound )
        {
            // Extract the LOW and HIGH range (not really required for this test.
            // We read it so that we when we write to the EURange, we are able
            // to write a value in the vicinity of the existing EURange and not 
            // something totally off)
            var analogNodeEURange;
            if( ReadHelper.Execute( euRangeItem ) )
            {
                var extensionObject = euRangeItem.Value.Value.toExtensionObject();
                analogNodeEURange = extensionObject.toRange();
            }
            
            // Now to write to the EURange
            var newEURangeWriteValue = new UaRange;
            newEURangeWriteValue.Low = analogNodeEURange.Low - 1;
            newEURangeWriteValue.High = analogNodeEURange.High + 1;
            var newExtensionObject = new UaExtensionObject();
            newExtensionObject.setRange ( newEURangeWriteValue );            
            euRangeItem.Value = new UaDataValue();
            euRangeItem.Value.Value.setExtensionObject ( newExtensionObject );
            
            // Expected result
            var results = [];
            results[0] = new ExpectedAndAcceptedResults( StatusCode.Good );
            results[0].addAcceptedResult( StatusCode.BadNotWritable );
            results[0].addExpectedResult( StatusCode.BadNotSupported );
            results[0].addExpectedResult( StatusCode.BadUserAccessDenied );
            if( WriteHelper.Execute( euRangeItem, results, true ) )
            {
                // if Write didn't succeed, then don't compare
                if( !WriteHelper.writeResponse.Results[0].isGood() )
                {
                    if( WriteHelper.writeResponse.Results[0].StatusCode === StatusCode.BadNotSupported )
                    {
                        _notSupported.store( "Write EURange", undefined, false );
                    }
                    else
                    {
                        addWarning( "Write to EURange failed (" + WriteHelper.writeResponse.Results[0] + "); Aborting the READ verification of the Write." );
                    }
                }
                else
                {
                    // Read the EURange back to verify that the write was indeed successful
                    var readEURangeValueAfterWrite = GetNodeIdEURange( AnalogItems[0].NodeSetting );
                    if ( ( readEURangeValueAfterWrite.Low == newEURangeWriteValue.Low )
                    &&
                    ( readEURangeValueAfterWrite.High == newEURangeWriteValue.High ) )
                    {
                        addLog( "Verified that the EURange was successfully written to." );
                    }
                    else
                    {
                        addError( "Write to EURange property failed." );
                    }

                    // now to write the original EURange back to the node
                    newEURangeWriteValue.Low = analogNodeEURange.Low;
                    newEURangeWriteValue.High = analogNodeEURange.High;
                    newExtensionObject = new UaExtensionObject();
                    newExtensionObject.setRange ( newEURangeWriteValue );            
                    euRangeItem.Value = new UaDataValue();
                    euRangeItem.Value.Value.setExtensionObject ( newExtensionObject );
                    if( !WriteHelper.Execute( euRangeItem, results, true ) )
                    {
                        addError( "Unable to revert the EURange back to its original value." );
                    }
                }
            }
        }
        else
        {
            addError( "Specified node '" + AnalogItems[0].NodeSetting + "' does not have an EURange property." );
        }
    }
    else
    {
        addError( "Browse(): status " + uaStatus, uaStatus );
    }

    // Test complete
    print ( "********************" );
    print ( "Test Complete." );
    print ( "********************" ); 
}

safelyInvoke( write613009 );
/*  Test 6.2 Test 9 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Create a monitoredItem of type Array (of each analog type) with a 
        deadbandPercent = 10%.
        In a loop:
        Write a value to a single element within the array. Some values will exceed
        the deadband value, others will not.
        Call Publish.

    Expected results:
        All service and operation level results are successful.
        Publish will yield dataChanges for the entire Array, but only when those
        values written exceeded the deadband value.

    Revision History:
        04-Jan-2010 NP: Initial version.
*/

function createMonitoredItems612009()
{
    const ARRAY_NODES_NEEDED = 3;
    var items = MonitoredItem.getMaxNoOfMIs( NodeIdSettings.ArraysDAAnalogType( ARRAY_NODES_NEEDED ) );
    if( items == null || items.length < ARRAY_NODES_NEEDED )
    {
        addSkipped( "Arrays" );
        return;
    }

    var i;
    var deadbandValue = 10;

    // before we do the test, read the analogType so that we can figure out
    // the data-type of the node. We'll need this information so that we can
    // properly specify the value that we'll WRITE to when seeing if the deadband
    // filters the write or not.
    var testedTypes = [];
    if( ReadHelper.Execute( items ) )
    {
        var currentType;
        // get the EURange for each item
        for( i=0; i<items.length; i++ )
        {
            currentType = BuiltInType.toString( items[i].DataType );
            testedTypes.push( currentType );
            print( "\n\n\n\n~~~~~~~~~ Testing type " + currentType + " ~~~~~~~~" );
            // is the item of type Array?
            if( items[i].Value.ValueRank < 0 )
            {
                addWarning( "Not an array type, can't test Setting '" + items[i].NodeSetting + "'" );
                continue;
            }

            // get the EURange, and generate some values to write to test the deadband
            var eurange = GetNodeIdEURange( items[i].NodeSetting );
            if( eurange == null )
            {
                addWarning( "Skipping the test of Setting '" + items[i].NodeSetting + "' because the node is not configured with an EURange as needed by this test." );
                continue;
            }

            // get the EURange, and then define values to test the deadband
            var getEURangeSize = GetEURangeAsSize( eurange );
            var writesToPass = GetEURangeWriteValues( 3, eurange, deadbandValue, true,  eurange.Low )
            var writesToFail = GetEURangeWriteValues( 3, eurange, deadbandValue, false, writesToPass[writesToPass.length-1] )

            // set the value to EURange.Min
            items[i].InitialValue = items[i].Value.Value.clone();
            var overrideValue = [ eurange.Low ];
            items[i].SafelySetArrayTypeKnown( overrideValue, items[i].Value.Value.DataType );
            items[i].IndexRange = "0";
            print( "\tResetting value for testing. Initial value is: " + items[i].InitialValue + "; but will become: " + items[i].Value );
            WriteHelper.Execute( items[i] );

            // define the deadband filter and create the monitoredItem
            items[i].Filter = Event.GetDataChangeFilter( DeadbandType.Percent, deadbandValue, DataChangeTrigger.StatusValue );
            if( !createMonitoredItems( items[i], TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
            {
                addError( "Test aborted. Couldn't create the monitoredItems." );
                return;
            }
            // get the initial publish out of the way
            wait( MonitorBasicSubscription.RevisedPublishingInterval );
            PublishHelper.Execute();

            // test the 10% deadband by writing our values expect to PASS
            print( "\n\n\n~~~~~~~~~~~~~ Deadband testing: values expected to PASS ~ " + BuiltInType.toString( items[i].DataType ) + " ~~~~~~~~~~~~~~~~~" );
            for( var w=0; w<writesToPass.length; w++ )
            {
                // set the value, wait to allow UA server to poll the new value
                var overrideValue = [ writesToPass[w] ];
                items[i].SafelySetArrayTypeKnown( overrideValue, items[i].Value.Value.DataType );
                items[i].IndexRange = "0";
                if( WriteHelper.Execute( items[i] ) )
                {
                    wait( MonitorBasicSubscription.RevisedPublishingInterval );
                    PublishHelper.Execute();
                    PublishHelper.SetItemValuesFromDataChange( items[i] );
                    if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a dataChange for a value expected to exceed the deadband." ) )
                    {
                        PublishHelper.PrintDataChanges();
                        var receivedArray = GetArrayTypeToNativeType( PublishHelper.CurrentDataChanges[0].MonitoredItems[0].Value.Value );
                        for( var l=0; l<overrideValue.length; l++ )
                        {
                            AssertCoercedEqual( overrideValue[l], receivedArray[l], "Expected to receive the value we just wrote." );
                        }
                    }
                }
                else
                {
                    addError( "Write(): status " + WriteHelper.uaStatus, WriteHelper.uaStatus );
                }
            }

            var publishCountBeforeFailTest = PublishHelper.ReceivedDataChanges.length;
            // test the 10% deadband by writing our values expect to FAIL
            print( "\n\n\n~~~~~~~~~~~~~ Deadband testing: values expected to FAIL ~ " + BuiltInType.toString( items[i].DataType ) + " ~~~~~~~~~~~~~~~~~" );
            for( var f=0; f<writesToFail.length; f++ )
            {
                // set the value, wait to allow UA server to poll the new value 
                var overrideValue = GetArrayTypeToNativeType( items[i].Value.Value );
                overrideValue[0] = writesToFail[f];
                items[i].SafelySetArrayTypeKnown( overrideValue, items[i].Value.Value.DataType );
                items[i].IndexRange = "0";
                items[i].Value.Value[0] = writesToFail[f];
                WriteHelper.Execute( items[i] );
                wait( MonitorBasicSubscription.RevisedPublishingInterval );
                PublishHelper.Execute();
                AssertFalse( PublishHelper.CurrentlyContainsData(), "Did not expect to receive a dataChange for a value expected to stay within the bounds of the deadband." );
            }
            AssertEqual( publishCountBeforeFailTest, PublishHelper.ReceivedDataChanges.length, "Expected the number of DataChanges to remain the same since the values written should've filtered by the deadband." );

            // clean-up
            deleteMonitoredItems( items[i], MonitorBasicSubscription, g_session );
            // revert to the original value 
            print( "Reverting to initial value." );
            var initialValueAsNativeArray = GetArrayTypeToNativeType( items[i].InitialValue );
            items[i].SafelySetArrayTypeKnown( [ initialValueAsNativeArray[0] ], items[i].Value.Value.DataType );
            items[i].IndexRange = "0";
            print( "\tResetting value for testing. Initial value is: " + items[i].InitialValue + "; but will become: " + items[i].Value );
            WriteHelper.Execute( items[i] );
        }// iterate over each array type
    }// read
    PublishHelper.Clear();
    // display the data-types tested:
    print( "Data Types tested:" );
    for( i=0; i<testedTypes.length; i++ )
    {
        print( "\t" + testedTypes[i] );
    }
}

safelyInvoke( createMonitoredItems612009 );
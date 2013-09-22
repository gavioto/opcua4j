/*  Test 6.2 Test 10 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Create a monitoredItem of type Array (of each analog type) with a PercentDeadband = 10%
        specifying an IndexRange of “2:3”.
        In a loop:
            Write a value to a single element within the IndexRange. Some values will exceed the
            deadband value, others not.
            Call Publish.
            In another loop:
                Write a value to a single element of the array that’s outside of the IndexRange.
                Some values will exceed the deadband filter, others will not.
                Call Publish.

    Expected results:
        If the server does not support deadbands with arrays then the operation level result will
        be bad Bad_MonitoredItemFilterUnsupported. Otherwise, all service and operation level results
        are successful.
        The first call to Publish will yield dataChanges for the entire Array, but only when those
        values written exceeded the deadband value. The second call to Publish will not yield
        any dataChanges.

    Revision History:
        04-Jan-2010 NP: Initial version.
        18-Feb-2011 NP: Fixed to test ALL array types configured.
                        Fixed to write the values as an array (although the length is 1).
*/

include( "./library/ServiceBased/MonitoredItemServiceSet/ModifyMonitoredItems/modifyMonitoredItems.js" );

function createMonitoredItems612010()
{
    var dataTypesTest = [];
    var items = MonitoredItem.fromSettings( NodeIdSettings.ArraysDAAnalogType() );
    if( items == null || items.length === 0 )
    {
        addSkipped( "Arrays. No Array items (NodeIds\Static\DA Profile\Deadband) to test with." );
        return;
    }

    // reset any stats in the publish helper.
    PublishHelper.Clear();

    var i = 0;
    var deadbandValue = 10;

    for( i=0; i<items.length; i++ )
    {
        print( "\n\n\nTesting item: " + items[i].NodeSetting );

        // before we do the test, read the analogType so that we can figure out
        // the data-type of the node. We'll need this information so that we can
        // properly specify the value that we'll WRITE to when seeing if the deadband
        // filters the write or not.
        if( ReadHelper.Execute( items[i] ) )
        {
            // is the item of type Array?
            if( !AssertEqual( 1, items[i].Value.Value.ArrayType, "Not an Array type!" ) )
            {
                addWarning( "Not an array type, can't test Setting '" + items[i].NodeSetting + "'" );
                return;
            }

            dataTypesTest.push( items[i].NodeSetting );

            // get the EURange, and generate some values to write to test the deadband
            var eurange = GetNodeIdEURange( items[i].NodeSetting );
            if( eurange == null )
            {
                addWarning( "Skipping the test of Setting '" + items[i].NodeSetting + "' because the node is not configured with an EURange as needed by this test." );
                return;
            }

            // get the EURange, and then define values to test the deadband
            var getEURangeSize = GetEURangeAsSize( eurange );
            // modify the writes to pass/succeed based on the indexRange of the array
            var writesToPass = GetEURangeWriteValues( 3, eurange, deadbandValue, true,  eurange.Low )
            var writesToFail = GetEURangeWriteValues( 3, eurange, deadbandValue, false, writesToPass[writesToPass.length-1] )

            // define the deadband filter and create the monitoredItem with an indexRange of "2:3"
            items[i].IndexRange = "2:3";
            items[i].Filter = Event.GetDataChangeFilter( DeadbandType.Percent, deadbandValue, DataChangeTrigger.StatusValue );
            if( !createMonitoredItems( items[i], TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
            {
                addError( "Test aborted. Couldn't create the monitoredItems." );
                return;
            }

            // test the 10% deadband by writing our values expect to PASS
            print( "\n\n\n~~~~~~~~~~~~~ Deadband testing: values expected to PASS ~~~~~~~~~~~~~~~~~" );
            for( var w=0; w<writesToPass.length; w++ )
            {
                // set the value, wait to allow UA server to poll the new value
                //items[i].SafelySetValueTypeKnown( writesToPass[w], items[i].Value.Value.DataType );
                setValue( items[i], writesToPass[w], items[i].Value.Value.DataType, true );
                items[i].Value.Value[0] = writesToPass[i];
                items[i].IndexRange = "2";
                WriteHelper.Execute( items[i] );
                wait( MonitorBasicSubscription.RevisedPublishingInterval );
                PublishHelper.Execute();
                PublishHelper.SetItemValuesFromDataChange( items[i] );
                if( AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive a dataChange for a value expected to exceed the deadband." ) )
                {
                    // we should receive an array of values back, although the length is only 1.
                    // lets check that!
                    if( AssertEqual( 1, items[i].Value.Value.ArrayType, "Expected the dataChange value to be an Array (albeit with a length of 1). Skipping check that the value received matches the value written." ) )
                    {
                        // convert the array value into a single value 
                        var arrayValue = GetArrayTypeToNativeType( items[i].Value.Value )[0];
                        AssertEqual( writesToPass[w], arrayValue, "Expected to receive the same value as previously written." );
                    }
                }
            }

            var publishCountBeforeFailTest = PublishHelper.ReceivedDataChanges.length;
            // test the 10% deadband by writing our values expect to FAIL
            print( "\n\n\n~~~~~~~~~~~~~ Deadband testing: values expected to FAIL ~~~~~~~~~~~~~~~~~" );
            for( var w=0; w<writesToFail.length; w++ )
            {
                // set the value, wait to allow UA server to poll the new value
                items[i].IndexRange = "0";
                setValue( items[i], writesToFail[w], items[i].Value.Value.DataType, true );
                WriteHelper.Execute( items[i] );
                wait( MonitorBasicSubscription.RevisedPublishingInterval );
                PublishHelper.Execute();
                PublishHelper.SetItemValuesFromDataChange( items[i] );
                AssertFalse( PublishHelper.CurrentlyContainsData(), "Did not expect to receive a dataChange for a value expected to stay within the bounds of the deadband." );
            }
            AssertEqual( publishCountBeforeFailTest, PublishHelper.ReceivedDataChanges.length, "Expected the number of DataChanges to remain the same since the values written should've filtered by the deadband." );

            // clean-up
            deleteMonitoredItems( items[i], MonitorBasicSubscription, g_session );
        }// read
    }// for i...
    PublishHelper.Clear();
    //print a summary
    print( "\nData Types tested:" );
    for( i=0; i<dataTypesTest.length; i++ )
    {
        print( "\t" + dataTypesTest[i] );
    }
}

safelyInvoke( createMonitoredItems612010 );
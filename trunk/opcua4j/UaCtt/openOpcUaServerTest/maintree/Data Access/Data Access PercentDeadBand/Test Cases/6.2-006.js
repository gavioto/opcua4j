/*  Test 6.2 Test #6, prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Modifies the first 2 monitoredItems to use a deadband filter of 100%, 
        where there are 5 monitoredItems in the subscription.
    Expected results:
        All ServiceResults are “Good”. The operation level results are Good for the
        subscription creation and modification. For the writes where the value exceeds the
        deadband: if the call is accepted then we expect to see the value(s) in the
        Publish response. Otherwise we expect the Publish response to be a KeepAlive.

    Revision History: 
        07-Oct-2009 NP: Initial Version.
        16-Nov-2009 NP: REVIEWED/INCONCLUSIVE. Server does not support deadbands.
        26-Nov-2009 DP: Changed test to use a node that's valid for PercentDeadbands.
                        Script still needs more work as PercentDeadband does not work
                        the way it is tested here (see spec Part 8).
        16-Dec-2009 NP: Completely re-written to use new script library objects, and
                        meet new test case criteria.
        18-Dec-2009 NP: Revised to meet new test-case requirements.
        15-Jan-2010 NP: Revised per the new test-case requirements as of CMP WG Call 14-Jan-2010.
                        Added writes and publish calls to the mix checking if deadband 100% is valid.
         2-Apr-2010 DP: Flag as not supported if no AnalogItem settings have been configured.
*/

/*globals addError, addLog, addNotSupported, ArrayToFormattedString, AssertEqual, AssertTrue,
  createMonitoredItems, DataChangeTrigger, DeadbandType, deleteMonitoredItems, Event, 
  ExpectedAndAcceptedResults, g_session, GetEURangeAsSize, GetNodeIdEURange, 
  MonitorBasicSubscription, MonitoredItem, NodeIdSettings, print, PublishHelper, ReadHelper, 
  safelyInvoke, StatusCode, TimestampsToReturn, wait, WriteHelper
*/

function modifyMonitoredItems612006()
{
    const INITIAL_DEADBAND = 100;

    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Test cannot be completed: Subscription for Monitor Basic was not created" );
        return;
    }

    var settings = NodeIdSettings.DAStaticAnalog();
    var items = MonitoredItem.fromSettings( settings, 0 );
    if( items.length === 0 )
    {
        addSkipped( "Static Analog" );
        return;
    }
    else if( items.length < 5 )
    {
        addError( "Test cannot be completed: " + items.length + " of 5 required AnalogItem nodes configured in settings (see " + ArrayToFormattedString( NodeIdSettings.GetUniqueSettingsParents( settings ), "and" ) + ")." );
        return;
    }
    else
    {
        // reduce the size down to 5 items, per the test case definition
        while( items.length > 5 )
        {
            print( "items length was: " + items.length );
            items.shift();
            print( "items length now: " + items.length );
        }
    }

    // read all the items first, to get their data-types
    if( ! ReadHelper.Execute( items ) )
    {
        addError( "Test aborted: Could not read nodes specified by " + ArrayToFormattedString( MonitoredItem.GetSettingNames( items ), "and" ) + "." );
        return;
    }
    else
    {
        //store these initial values so that we can revert to them at the end
        for( var i=0; i<items.length; i++ )
        {
            // store the initial value so we can revert to it later
            items[i].InitialValue = items[i].Value.Value;
            if( i > 2 ) continue;
            // figure out the EURange etc.
            items[i].EURange = GetNodeIdEURange( items[i].NodeSetting );
            items[i].FutureFilter = Event.GetDataChangeFilter( DeadbandType.Percent, INITIAL_DEADBAND, DataChangeTrigger.StatusValue );
            // does the current value fall outside the range of the EURange
            print( "\tChecking if initial value is within the EURange. Value: " + items[i].Value.Value + "; EURange: " + items[i].EURange );
            var initialValue = UaVariantToSimpleType( items[i].Value.Value );
            var minValue = UaVariantToSimpleType( items[i].EURange.Low );
            var maxValue = UaVariantToSimpleType( items[i].EURange.High );
            if( !( initialValue >= minValue && initialValue <= maxValue ) )
            {
                // reset the value to the middle of the EURange
                var midwayValue = GetEURangeMidPoint( items[i].EURange.Low, items[i].EURange.High );
                items[i].SafelySetValueTypeKnown( midwayValue, items[i].DataType );
                addError( "Initial value for item '" + items[i].NodeSetting + "' is: " + items[i].Value.Value + "; which is outside the range: " + 
                    items[i].EURange.Low + "-" + items[i].EURange.High + ". Resetting to Value: " + midwayValue );
                if( WriteHelper.Execute( items[i] ) )
                {
                    initialValue = midwayValue;
                }
            }
            // get the size of the EURange
            var eURangeAsSize = GetEURangeAsSize( items[i].EURange );
            items[i].writesToPass = [items[i].EURange.Low - eURangeAsSize, items[i].EURange.High + eURangeAsSize ];
            items[i].writesToFail = [items[i].EURange.Low + 1, items[i].EURange.High - 1];
            print( "\t\tItem (" + i + ") writes to Pass: " + items[i].writesToPass );
            print( "\t\tItem (" + i + ") writes to Fail: " + items[i].writesToFail );
        }
    }

    var expectedResults = [
        new ExpectedAndAcceptedResults( StatusCode.Good ),
        new ExpectedAndAcceptedResults( StatusCode.Good ),
        new ExpectedAndAcceptedResults( StatusCode.Good ),
        new ExpectedAndAcceptedResults( StatusCode.Good ),
        new ExpectedAndAcceptedResults( StatusCode.Good )
        ];
    if( ! createMonitoredItems( items, TimestampsToReturn.Both, MonitorBasicSubscription, g_session, expectedResults, true ) )
    {
        addError( "Test aborted: Could not monitor the nodes specified by " + ArrayToFormattedString( MonitoredItem.GetSettingNames( items ), "and" ) + "." );
        return;
    }

    // wait one publishing cycle before calling publish
    wait( MonitorBasicSubscription.RevisedPublishingInterval );

    // call Publish, to get the initial values for all nodes.
    PublishHelper.Execute();
    if( !AssertTrue( PublishHelper.CurrentlyContainsData(), "Expected to receive initial values." ) )
    {
        deleteMonitoredItems( items, MonitorBasicSubscription, g_session );
        return;
    }


    // now to modify the first two items
    for( var i=0; i<2; i++ )
    {
        items[i].Filter = items[i].FutureFilter;
    }
    // modify the first two items so that they contain a dataChange filter
    if (!ModifyMIsHelper.Execute( [items[0], items[1]], TimestampsToReturn.Both, MonitorBasicSubscription ) )
    {
        addError( "Aborting test. Unable to modify the first 2 items." );
        deleteMonitoredItems( items, MonitorBasicSubscription, g_session );
        return;
    }

    PublishHelper.Execute();

    // issue the writes for the items with the deadband set
    // first: issue writes that MIGHT pass...
    var expectedErrors = [
        new ExpectedAndAcceptedResults( StatusCode.BadOutOfRange ),
        new ExpectedAndAcceptedResults( StatusCode.BadOutOfRange )
        ];
    expectedErrors[0].addAcceptedResult( StatusCode.Good );
    expectedErrors[1].addAcceptedResult( StatusCode.Good );
    var expectPublishDataChangeResponse = false;
    // store the number of writes, we will compare to publish notifications shortly
    var cumulativeWriteCount = 0;
    print( "\n\nWrite Tests to PASS -->" );
    for( i=0; i<2; i++ )
    {
        print( "\tWrite #" + ( 1+i ) );
        items[0].SafelySetValueTypeKnown( items[0].writesToPass[i], items[0].DataType );
        items[1].SafelySetValueTypeKnown( items[1].writesToPass[i], items[1].DataType );
        WriteHelper.Execute( [items[0], items[1]], expectedErrors, true );
        // check the results. If a value was accepted then we'lll check it in the publish response
        cumulativeWriteCount += WriteHelper.writeResponse.Results[0].isGood()? 1: 0;
        cumulativeWriteCount += WriteHelper.writeResponse.Results[1].isGood()? 1: 0;
        if( WriteHelper.writeResponse.Results[0].StatusCode === StatusCode.Good ||
            WriteHelper.writeResponse.Results[1].StatusCode === StatusCode.Good )
        {
            addLog( "A write OUTSIDE the bounds of the EURange WAS ACCEPTED. We will check to see if it is received in the Publish response." );
            expectPublishDataChangeResponse = true;
            print( "Currently expecting " + cumulativeWriteCount + " dataChange notification." );
        }
        else
        {
            addLog( "SERVER DOES NOT permit writing out of the bounds of the EURange. This is perfectly legal. Will not expect to receive the previous writes in the upcoming Publish call." );
        }
        wait( MonitorBasicSubscription.RevisedPublishingInterval );
    }
    // second: write values we expect to fail...
    print( "\n\nWrite Tests to FAIL -->" );
    for( i=0; i<2; i++ )
    {
        items[0].SafelySetValueTypeKnown( items[0].writesToFail[i], items[0].DataType );
        items[1].SafelySetValueTypeKnown( items[1].writesToFail[i], items[1].DataType );
        WriteHelper.Execute( [items[0], items[1]], expectedErrors, true );
        wait( MonitorBasicSubscription.RevisedPublishingInterval );
        // check the write response, if they were accepted (server MIGHT allow this) then
        // we need to increase our expected write results by two.
        cumulativeWriteCount += ( WriteHelper.writeResponse.Results[0].isGood() == true? 1 : 0 );
        cumulativeWriteCount += ( WriteHelper.writeResponse.Results[1].isGood() == true? 1 : 0 );
    }

    // call publish
    PublishHelper.Execute();
    AssertEqual( expectPublishDataChangeResponse, PublishHelper.CurrentlyContainsData(), ( "Based on the write result a dataChange was " + (expectPublishDataChangeResponse?"":"NOT") + " expected." ) );
    if( PublishHelper.CurrentlyContainsData() )
    {
        AssertEqual( cumulativeWriteCount, PublishHelper.CurrentDataChanges[0].MonitoredItems.length, "Expected to receive the same number of dataChange notifications as the number of writes successfully committed." );
    }
    PublishHelper.PrintDataChanges();

    // clean up
    deleteMonitoredItems( items, MonitorBasicSubscription, g_session );
    PublishHelper.Clear();

    // revert the values back to their original state
    for( var i=0; i<items.length; i++ )
    {
        items[i].Value.Value = items[i].InitialValue;
    }
    WriteHelper.Execute( items );
}

safelyInvoke( modifyMonitoredItems612006 );
include( "./library/Base/objects/event.js" );

var deadbandTypesTested;
var undesirableTypes = [ BuiltInType.Boolean, BuiltInType.ByteString, BuiltInType.DateTime, BuiltInType.Guid,
                         BuiltInType.String,  BuiltInType.XmlElement ];

/* writeToDeadbandAndCheckWithPublish( valuesToWrite, expectedToPass )
   Parameters:
      item           - a monitoredItem object that is being tested
      valuesToWrite  - an array of values to write
      expectedToPass - simple True/False to indicate if values should pass the deadband
      subscription   - a subscription object
      publishService - reference to a Publish object helper
      writeService   - reference to a Write object helper
      typeToTest     - BuiltInType of the node being tested
      */
function writeToDeadbandAndCheckWithPublish( item, valuesToWrite, expectedToPass, subscription, publishService, writeService, typeToTest )
{
    if( arguments.length !== 7 ) { throw( "writeToDeadbandAndCheckWithPublish() argument error. Expected 7 arguments but received: " + arguments.length ); }
    var initialDatachangeCount = publishService.ReceivedDataChanges.length;
    var i;
    print( "\n\n********* Testing with Values expected to " + (expectedToPass===true?"Pass":"FAIL") + " filtering *********" );
    print( "MonitoringMode=Reporting? = " + ( item.MonitoringMode === MonitoringMode.Reporting ) + "; expectedToPass=" + expectedToPass + "; override needed?=" + (item.MonitoringMode !== MonitoringMode.Reporting && expectedToPass ) );
    if( item.MonitoringMode !== MonitoringMode.Reporting && expectedToPass )
    {
        expectedToPass = false;
    }
    print( "\tInitial DataChange count = " + initialDatachangeCount );
    for( i=0; i<valuesToWrite.length; i++ )
    {
        // now set the item value and write it
        setValue( item, valuesToWrite[i], typeToTest );
        print( "\n\nWriting: " + valuesToWrite[i] );
        if( writeService.Execute( item ) )
        {
            // wait 1 sampling interval cycle
            wait( subscription.RevisedPublishingInterval );
            if( publishService.Execute() )
            {
                // did we receive a dataChange when we expected?
                publishService.PrintDataChanges();
                if( AssertFalse( item.MonitoringMode !== MonitoringMode.Reporting && publishService.CurrentlyContainsData(), "Was NOT expecting a Publish since the MonitoringMode of the item is Disabled. Verification: MonitoringMode=" + item.MonitoringMode + "; DataChanges received=" + publishService.CurrentlyContainsData() ) )
                {
                    if( AssertEqual( expectedToPass, publishService.CurrentlyContainsData(), "Publish() did not yield the expected results per the Deadband configuration. Verification: expectedToPass=" + expectedToPass + "; dataReceived=" + publishService.CurrentlyContainsData() ) )
                    {
                        if( expectedToPass )
                        {
                            // we expect to receive the same value we wrote
                            if( AssertEqual( item.ClientHandle, publishService.CurrentDataChanges[0].MonitoredItems[0].ClientHandle, "Expected to receive just the monitoredItem used in this test." ) )
                            {
                                AssertCoercedEqual( valuesToWrite[i], publishService.CurrentDataChanges[0].MonitoredItems[0].Value.Value, "Expected to receive the same value we wrote." );
                            }
                        }
                    }
                }
            }// publish
        }//write
    }
    // final check... make sure that the dataChange count increased by the same number
    // of writes we made.
    print( "\n\n\nChecking dataChange count. Initial count = " + initialDatachangeCount + " + length of " + valuesToWrite.length + "; and current count is: " + publishService.ReceivedDataChanges.length );
    if( expectedToPass )
    {
        AssertEqual( initialDatachangeCount + valuesToWrite.length, publishService.ReceivedDataChanges.length, "Expected to receive a dataChange for each write." );
    }
    else
    {
        AssertEqual( initialDatachangeCount, publishService.ReceivedDataChanges.length, "Expected to NOT receive any dataChanges for any of the writes." );
    }
}

/* CreateMonitoredItemDeadbandAbsolute_VerifyWithPublish( nodeSettingName, publishHelper )
   Parameters:
      nodeSettingName       - a monitoredItem object that is being tested.
      absoluteDeadbandValue - the value to specify for the deadband.
      subscriptionObject    - a Subscription object.
      publishHelper         - a Publish helper object.
      writeHelper           - a Write helper object.
      writesToSucceed       - an array of integer values to write, which are expected to pass the filter.
      writesToFail          - an array of integer values to write, expected to be filtered out.
      typeToTest            - BuiltInType of the node being tested
*/
function CreateMonitoredItemDeadbandAbsolute_VerifyWithPublish( nodeSettingName, absoluteDeadbandValue, subscriptionObject, publishHelper, writeHelper, writesToSucceed, writesToFail, typeToTest )
{
    createMonitoredItemDeadbandXX_VerifyWithPublish( DeadbandType.Absolute, nodeSettingName, absoluteDeadbandValue, subscriptionObject, publishHelper, writeHelper, writesToSucceed, writesToFail, typeToTest, MonitoringMode.Reporting, 0 );
}

/* CreateMonitoredItemDeadbandPercent_VerifyWithPublish( nodeSettingName, publishHelper )
   Parameters:
      nodeSettingName       - a monitoredItem object that is being tested.
      monitoringmode        - the monitoringMode for the item being tested
      percentDeadbandValue  - the value to specify for the deadband.
      subscriptionObject    - a Subscription object.
      publishHelper         - a Publish helper object.
      writeHelper           - a Write helper object.
      typeToTest            - BuiltInType of the node being tested
      queueSize             - monitoredItem queueSize
*/
function CreateMonitoredItemDeadbandPercent_VerifyWithPublish( nodeSettingName, monitoringMode, percentDeadbandValue, subscriptionObject, publishHelper, writeHelper, typeToTest, queueSize )
{
    var eurange = GetNodeIdEURange( nodeSettingName );
    if( eurange == null )
    {
        addWarning( "Test aborted. Setting '" + nodeSettingName + "' did not yield a valid nodeId to test." );
        return;
    }
    print( "\n\tLo = " + eurange.Low + "\n\tHi = " + eurange.High );
    // get the size of the EURange
    var getEURangeSize = GetEURangeAsSize( eurange );
    print( "getEURangeSize = " + getEURangeSize );
    // determine the values to test against the deadband
    // get any range of numbers to start with
    var writesToPass = GetEURangeWriteValues( 5, eurange, 10, true,  eurange.Low );
    // start the number where the last write takes place
    var writesToFail = GetEURangeWriteValues( 5, eurange, 10, false, writesToPass[writesToPass.length-1] );
    // issue the test
    createMonitoredItemDeadbandXX_VerifyWithPublish( DeadbandType.Percent, nodeSettingName, percentDeadbandValue, 
        subscriptionObject, publishHelper, writeHelper, writesToPass, writesToFail, typeToTest, monitoringMode, queueSize );
}

function createMonitoredItemDeadbandXX_VerifyWithPublish( deadbandType, nodeSettingName, deadbandValue, subscriptionObject, publishHelper, writeHelper, writesToSucceed, writesToFail, typeToTest, monitoringMode, queueSize )
{
    const SAMPLING_RATE = 0;
    var i;
    if( nodeSettingName == null || nodeSettingName == "" || 
        deadbandValue == null ||
        subscriptionObject == null ||
        publishHelper == null ||
        writeHelper == null ||
        writesToSucceed == null || writesToSucceed.length === 0 ||
        writesToFail == null || writesToFail.length === 0 ||
        typeToTest == null ||
        monitoringMode == null ||
        queueSize == null )
    {
        var errMsg = "createMonitoredItemDeadbandXX_VerifyWithPublish() argument error." +
            "\nnodeSettingName: " + nodeSettingName +
            "\ndeadbandValue: " + deadbandValue + 
            "\nsubscriptionObject: " + (subscriptionObject == null ? "<null>" : "ok") +
            "\npublishHelper: " + (publishHelper == null ? "<null>" : "ok") +
            "\nwriteHelper: " + (writeHelper == null ? "<null>" : "ok") +
            "\nwritesToSucceed: " + writesToSucceed +
            "\nwritesToFail: " + writesToFail +
            "\ntypeToTest: " + typeToTest +
            "\nmonitoringMode: " + monitoringMode +
            "\nqueueSize: " + queueSize;
        throw( errMsg );
    }

    var guessedType = NodeIdSettings.guessType( nodeSettingName );
    if( guessedType !== null && guessedType.length === 0 )
    {
        addError( "Could not determine node Type from the name." );
        return;
    }
    for( i=0; i<undesirableTypes.length; i++ )
    {
        if( guessedType === undesirableTypes[i] )
        {
            addLog( "Skipping test of node setting '" + nodeSettingName + "' because it appears to be of Type that does not makes sense when testing Deadbands." );
            return;
        }
    }

    if( deadbandTypesTested == null )
    {
        deadbandTypesTested = [];
    }
    deadbandTypesTested.push( BuiltInType.toString( typeToTest ) );
    print( "\n\n\n\n\nType: " + BuiltInType.toString( typeToTest ) );
    var deadbandTypeName = "None";
    if( deadbandType === DeadbandType.Absolute ) { deadbandTypeName = "Absolute"; }
    if( deadbandType === DeadbandType.Percent  ) { deadbandTypeName = "Percent"; }
    print( "********* Testing Deadband" + deadbandTypeName + ".Value = " + deadbandValue + " *********" );
    addLog( "Testing Deadband on Node: " + nodeSettingName + "; deadband Type: " + deadbandTypeName + "; deadband value: " + deadbandValue );

    // clear the publish statistics
    publishHelper.Clear();

    var filter = Event.GetDataChangeFilter( deadbandType, deadbandValue, DataChangeTrigger.StatusValue );
    
    // get the Nodes to test with..
    var item = MonitoredItem.fromSetting( nodeSettingName, 0, Attribute.Value, "", monitoringMode, true, filter, queueSize, SAMPLING_RATE, TimestampsToReturn.Both );
    if( item == null )
    {
        return;
    }

    item.Filter = filter;
    
    // Set the Value to 0 (or euRange.Low if appropriate), just to guarantee a starting point
    var zeroValue = 0;
    
    // TODO: If the node has an euRange then set zeroValue = euRange.Low
    
    print( "\tResetting value to " + zeroValue );
    setValue( item, zeroValue, typeToTest );
    writeHelper.Execute( item );

    // create the monitored items - we this will succeed
    var expectedResults = new ExpectedAndAcceptedResults( StatusCode.Good );
    if( createMonitoredItems( item, TimestampsToReturn.Both, subscriptionObject, g_session, [ expectedResults ], true ) )
    {
        // did the call truly succeed?
        if( createMonItemsResp.Results[0].StatusCode.isGood() )
        {
            // call Publish(), just to get the initial sequenceNumber of "1" out of the way
            wait( subscriptionObject.RevisedPublishingInterval );
            publishHelper.Execute();

            // Do the writes that we DO expect to pass through the deadband
            // [NEW] monitoringMode parameter causes us to rethink HOW to verify the
            // deadband is working. This can ONLY be tested if the monitoringMode
            // is REPORTING. Otherwise, we'll never get a dataChange to verify.
            writeToDeadbandAndCheckWithPublish( item, writesToSucceed, monitoringMode === MonitoringMode.Reporting, subscriptionObject, publishHelper, writeHelper, typeToTest );

            // do the writes that we expect to FAIL (not pass the deadband)
            // [NEW] the deadbandValue of 0 essentially means NO DEADBAND! so adjust
            // our expectations of success/fail accordingly.
            var expectToPass = deadbandValue === 0;
            writeToDeadbandAndCheckWithPublish( item, writesToFail, expectToPass, subscriptionObject, publishHelper, writeHelper, typeToTest );
        }
        else
        {
            addError( "DeadbandAbsolute doesn't appear to be supported. Deadband is REQUIRED." );
        }
    }
    // clean-up
    deleteMonitoredItems( item, subscriptionObject, g_session );
}

function DeadbandAbsoluteFiltering_WritePublishTesting( subscriptionObject, readHelper, writeHelper, publishHelper, integerDeadband, integerWritesPass, integerWritesFail, floatDeadband, floatWritesPass, floatWritesFail )
{
    // argument check
    if( arguments.length !== 10 )
    {
        var errMessage = "DeadbandAbsoluteFiltering_WritePublishTesting() argument error." +
            "\nsubscriptionObject=" + ( subscriptionObject === null ? "<null>" : "ok" ) +
            "\nreadHelper=" + ( readHelper === null ? "<null>" : "ok" ) +
            "\nwriteHelper=" + ( writeHelper === null ? "<null>" : "ok" ) +
            "\npublishHelper=" + ( publishHelper === null ? "<null>" : "ok" ) +
            "\nintegerDeadband="  + ( integerDeadband === null ? "<null>" : "ok" ) +
            "\nintegerWritesPass=" + ( integerWritesPass === null ? "<null>" : "ok" ) +
            "\nintegerWritesFail=" + ( integerWritesFail === null ? "<null>" : "ok" ) +
            "\nfloatDeadband=" + ( floatDeadband === null ? "<null>" : "ok" ) +
            "\nfloatWritesPass=" + ( floatWritesPass === null ? "<null>" : "ok" ) +
            "\nfloatWritesFail=" + ( floatWritesFail === null ? "<null>" : "ok" );
        throw( errMessage );
    }

    // clear the array that we will use to record (and subsequently display) for the data-types tested
    deadbandTypesTested = [];
    
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic() );
    var i;
    // do a read of the items to get their data-types
    if( readHelper.Execute( items ) )
    {
        for( i=0; i<items.length; i++ )
        {
            CreateMonitoredItemDeadbandAbsolute_VerifyWithPublish(
                    items[i].NodeSetting,
                    integerDeadband,
                    subscriptionObject,
                    publishHelper,
                    writeHelper,
                    integerWritesPass,
                    integerWritesFail,
                    NodeIdSettings.guessType( items[i].NodeSetting ) );
        }
        // now to print a "report" of the data-types tested.
        addLog( "\nThe following data-types were tested with a Deadband Absolute:\n" + deadbandTypesTested + "\n" );
    }
}
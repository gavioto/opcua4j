/*  Test 5.9.3 Test 9 prepared by Anand Taparia; ataparia@kepware.com
    Description:
        Script sets monitoring mode to 'Reporting' for an already 'Reporting' monitor item. 
        Calls publish each time to verify that notifications were received.

    Revision History
        06-Oct-2009 AT: Initial version.
        18-Nov-2009 NP: REVIEWED.
        23-Mar-2010 NP: Revised to use new library script objects.
                        Also added WRITES to cause dataChanges of the Static nodes.
*/

function setMonitoringMode593009()
{
    var setting1 = NodeIdSettings.GetAScalarStaticNodeIdSetting( "iu" );
    if( setting1 === undefined || setting1 === null )
    {
        addSkipped( "Static Scalar (numeric)" );
        return;
    }

    var items = [ MonitoredItem.fromSetting( setting1.name, 0 ) ];
    if( items == null || items.length == 0 )
    {
        addWarning( "Not enough nodes configured in Static Scalar!" );
        return;
    }

    if( !MonitorBasicSubscription.SubscriptionCreated )
    {
        addError( "Subscription for Monitor Basic was not created" );
        return;
    }

    // Initialize an item (above) first:
    InitializeValue( items[0].Value.Value, NodeIdSettings.guessType( items[0].NodeSetting ) );
    if( !WriteHelper.Execute( items[0] ) )
    {
        addWarning( "Write failed. Aborting test." );
        return;
    }


    // Add 1 monitored item (Reporting)
    if( !createMonitoredItems( items[0], TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
    {
        addError( "CreateMonitoredItems() status " + uaStatus, uaStatus );
    }
    else
    {
        // wait, to allow sampling engine (in UA Server) to initialize
        print( "\tWaiting " + items[0].RevisedSamplingInterval + " msecs before calling Publish..." );
        wait( MonitorBasicSubscription.RevisedPublishingInterval );

        // Call publish, we should receive datachange notification
        addLog( "Calling Publish (first call) and initial data collection." );
        publishService.Execute();

        // Make sure we received datachange notification
        if( AssertEqual( true, publishService.CurrentlyContainsData(), "NotificationData not received (first publish call) when expected for the 'Reporting' monitored item" ) )
        {
            addLog( "NotificationData was received as expected. Setting the monitoring mode to 'Reporting' again." );

            // Set the monitoring mode to 'Reporting'
            if( !setMonitoringService.Execute( MonitoringMode.Reporting, items[0], MonitorBasicSubscription ) )
            {
                addError( "SetMonitoringMode() status " + uaStatus, uaStatus );
            }
            else
            {
                // now WRITE some new values to the static nodes, to check for a dataChange
                addLog( "Writing new Value to Node. Will check for a DataChange after." );
                GenerateScalarValue( items[0].Value.Value, NodeIdSettings.guessType( items[0].NodeSetting ) );
                WriteHelper.Execute( items[0] );

                // wait, to allow the sampling Engine (in UA Server) to detect the change
                print( "\tWaiting " + MonitorBasicSubscription.RevisedPublishingInterval + " msecs before calling Publish..." );
                wait( MonitorBasicSubscription.RevisedPublishingInterval );

                // Call Publish again to verify that receive datachange notification this time as well
                addLog ( "Calling publish again. We should receive NotificationData this time as well." );
                publishService.Execute();

                // Make sure we received datachange notification
                AssertEqual( true, publishService.CurrentlyContainsData(), "NotificationData not received (second publish call) when expected for the 'Reporting' monitored item" );
            }
        }
    }
    // delete the items we added in this test
    deleteMonitoredItems( items[0], MonitorBasicSubscription, g_session );
    publishService.Clear();
}

safelyInvoke( setMonitoringMode593009 );
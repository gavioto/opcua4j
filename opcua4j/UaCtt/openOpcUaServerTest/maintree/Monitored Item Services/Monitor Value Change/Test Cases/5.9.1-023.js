/*  Test 5.9.1 Test 23 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Specify an item of type array. Do this for all supported data types: 
            a. Bool         b. Byte         c. SByte        d. ByteString
            e.              f. DateTime     g.              h. Double
            i. Float        j. Guid         k. Int16        l. UInt16
            m. Int32        n. UInt32       o. Int64        p. UInt64
            q. String       r. XmlElement

        Create a subscription and call Publish. Verify that all data coming 
        back is of type Array.

    Revision History
        15-Oct-2009 NP: Initial Version.
        16-Nov-2009 NP: Added a check to verify the value quality is Good.
                        REVIEWED.
        09-Dec-2009 DP: Added warning when no array items have been specified.
        18-May-2010 DP: Fixed to show the StatusCode name (instead of just the value) when the StatusCode is not expected.
        03-Dec-2010 NP: Array of byte is now of type Byte[] instead of ByteString (was excluded as is string/bytestring)
*/

function createMonitoredItems591023()
{
    PublishHelper.Clear();
    
    // get the Nodes to test with.. each node is of Type Array (defined in the Settings )
    var monitoredItems = MonitoredItem.fromNodeIds( NodeIdSettings.GetArrayStaticNodeIds(), Attribute.Value, "", MonitoringMode.Reporting, true, null, 10, 1000, TimestampsToReturn.Both );
    if( monitoredItems.length === 0 )
    {
        addSkipped( "Arrays" );
        return;
    }

    // create the monitored items
    if( createMonitoredItems( monitoredItems, TimestampsToReturn.Both, MonitorBasicSubscription, g_session ) )
    {
        // wait one publishing cycle before calling publish
        wait( MonitorBasicSubscription.RevisedPublishingInterval );

        // Call Publish, and make sure we receive data for all MonitoredItems, and that each 
        // dataset received is of type array.
        PublishHelper.Execute();

        // is dataChange value received of type array?
        if( PublishHelper.CurrentlyContainsData )
        {
            for( var d=0; d<PublishHelper.CurrentDataChanges.length; d++ ) // 'd' for DataChange 
            {
                for( var m=0; m<PublishHelper.CurrentDataChanges[d].MonitoredItems.length; m++ ) // 'm' for MonitoredItem
                {
                    if( AssertStatusCodeIs( StatusCode.Good, PublishHelper.CurrentDataChanges[d].MonitoredItems[m].Value.StatusCode, "Expected only GOOD quality data but got" ) )
                    {
                        // is the value an array?
                        if( PublishHelper.CurrentDataChanges[d].MonitoredItems[m].Value.Value.getArraySize() === -1 )
                        {
                            var currentType = PublishHelper.CurrentDataChanges[d].MonitoredItems[m].Value.Value.DataType;
                            switch( currentType )
                            {
                                case BuiltInType.ByteString: break;
                                case BuiltInType.String:     break;
                                default:
                                    addError( "Type: " + BuiltInType.toString( currentType ) + "; Non array value received: " + p.CurrentDataChanges[d].MonitoredItems[m].Value.toString() );
                                    break;
                            }
                        }
                    }// if good quality
                }// for m...
            }//for d...
        }//if( p.CurrentlyContainsData )
        else
        {
            addError( "No data received in callback, we expected data!" );
        }//else...if( p.CurrentlyContainsData )
    }
    // clean-up
    deleteMonitoredItems( monitoredItems, MonitorBasicSubscription, g_session );
    PublishHelper.Clear();
    revertOriginalValuesScalarStatic();
}

safelyInvoke( createMonitoredItems591023 );
/*  Test 5.8.1 Test 13; prepared by Nathan Pocock: nathan.pocock@opcfoundation.org

    Description:
        Reads the same (valid) attribute from the same (valid) node multiple times
        in the same call, checking the values are the same for all returned results.

    Revision History
        24-Aug-2009 NP Initial version

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581013()
{
//( settingNames, clientHandle, attributeId, indexRange, monitorMode, discardOldest, filter, queue, interval, timestampsToReturn, suppressWarnings )
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true );
    if( items == null || items.length == 0 )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    var readReq = new UaReadRequest();
    var readRes = new UaReadResponse();
    g_session.buildRequestHeader( readReq.RequestHeader );

    readReq.MaxAge = 10000;
    readReq.TimestampsToReturn = TimestampsToReturn.Both;

    for( var n=0; n<5; n++ )
    {
        readReq.NodesToRead[n].NodeId = items[0].NodeId;
        readReq.NodesToRead[n].AttributeId = Attribute.Value;
        addLog( "Reading Node: '" + items[0].NodeId + "' (setting: '" + items[0].NodeSetting + "')" );
    }

    uaStatus = g_session.read( readReq, readRes );

    // check results
    // check the service call was GOOD
    if( uaStatus.isGood() )
    {
        //check the read for usual errors etc.
        checkReadValidParameter( readReq, readRes );

        //store the value here for comparing to each item read.
        var cachedValue = readRes.Results[0].Value;
        addLog( "Cached value is: " + cachedValue.toString() );

        //iterate thru item results checking for good data
        for( var i=0; i<readRes.Results.length; i++ )
        {
            //compare this value to the value in our variable 'cachedValue'
            if( !cachedValue.equals( readRes.Results[i].Value ) )
            {
                addError( "Value difference detected. Cached = '" + cachedValue.toString() + "' vs '" + readRes.Results[i].Value.toString() + "'" );
            }
            else
            {
                print( "  (" + i + ") Value = " + readRes.Results[i].Value.toString() );
            }
        }//for
    }
    else
    {
        addError( "Read(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( read581013 );
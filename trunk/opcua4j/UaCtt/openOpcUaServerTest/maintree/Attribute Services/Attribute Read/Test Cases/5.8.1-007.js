/*  Test 5.8.1 Test 7; prepared by Mark Rice: mrice@canarylabs.com

    Description:
        Read a data value with timestampsToReturn = SOURCE.
        Lab: verify the source timestamp is returned.

    Revision History
        09-Sep-2009 MR: Initial version.
        06-Nov-2009 NP: Added checks on the timestamps received.
        06-Nov-2009 NP: Reviewed.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581007()
{
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
    readReq.TimestampsToReturn = TimestampsToReturn.Source;

    readReq.NodesToRead[0].NodeId = items[0].NodeId;
    readReq.NodesToRead[0].AttributeId = Attribute.Value;

    addLog( "Reading Node: '" + items[0].NodeId + "' (setting: '" + items[0].NodeSetting + "')" );

    uaStatus = g_session.read( readReq, readRes );

    // check result
    if( uaStatus.isGood() )
    {
      // This will verify that the appropriate timestamps where returned.
      checkReadValidParameter( readReq, readRes );
    }
    else
    {
        addError( "read() failed with status " + uaStatus, uaStatus );
    }
}

safelyInvoke( read581007 );
/*  Test 5.8.1 Test 10; prepared by Nathan Pocock nathan.pocock@opcfoundation.org

    Description:
        Reads the BROWSENAME attribute of a valid node.

    Revision History
        24-Aug-2009 NP: Initial version.
        06-Nov-2009 NP: Reviewed.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581010()
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
    readReq.TimestampsToReturn = TimestampsToReturn.Both;

    readReq.NodesToRead[0].NodeId = items[0].NodeId;
    readReq.NodesToRead[0].AttributeId = Attribute.BrowseName;

    addLog( "Reading Node: '" + items[0].NodeId + "' (setting: '" + items[0].NodeSetting + "')" );

    uaStatus = g_session.read( readReq, readRes );

    // check result
    if( uaStatus.isGood() )
    {
      checkReadValidParameter( readReq, readRes );

      if( readRes.Results[0].StatusCode.isGood() )
      {
          //checking the length > 0 because checking for null
          //would cause script compiler to exit (no error thrown).
          if( readRes.Results[0].Value.toString().length == 0 )
          {
              addError( "BrowseName is empty/null" );
          }
      }
      else
      {
          addError(" BrowseName attribute read yielded BAD quality." );
      }
    }
    else
    {
        addError( "Read(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( read581010 );
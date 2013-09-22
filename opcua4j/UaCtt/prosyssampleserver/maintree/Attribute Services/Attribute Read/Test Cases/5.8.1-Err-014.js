/*  Test 5.8.1 Error Test 14; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Read a single attribute from a valid node.

    Revision History
        24-Aug-2009 NP: Initial version.
        11-Nov-2009 NP: REVIEWED.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read5810Err014()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true );
    if( items == null || items.length == 0 )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    const INVALIDMAXAGE = -100;

    var readReq = new UaReadRequest();
    var readRes = new UaReadResponse();
    g_session.buildRequestHeader( readReq.RequestHeader );

    readReq.MaxAge = INVALIDMAXAGE;
    readReq.TimestampsToReturn = TimestampsToReturn.Both;

    readReq.NodesToRead[0].NodeId = items[0].NodeId;
    readReq.NodesToRead[0].AttributeId = Attribute.Value;

    addLog( "Reading Node '" + items[0].NodeId + "'; Attribute: Value" );
    var uaStatus = g_session.read( readReq, readRes );

    // check result
    if( uaStatus.isGood() )
    {
        var ExpectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadMaxAgeInvalid );   
        checkReadFailed( readReq, readRes, ExpectedServiceResult );
    }
    else
    {
        addError( "Read(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( read5810Err014 );
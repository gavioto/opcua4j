/*  Test 5.8.1 Error Test 15; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Read a single node specifying an IndexRange for attributes that can't be used
        with IndexRange, as in:
        • AccessLevel           • BrowseName
        • DataType              • DisplayName
        • Historizing             • NodeClass
        • NodeId                • UserAccessLevel
        • ValueRank

    Revision History
        24-Sep-2009 NP: Initial version.
        11-Nov-2009 NP: REVIEWED.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581Err015()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true );
    if( items == null || items.length == 0 )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    var attributeToRead = [
        Attribute.AccessLevel,
        Attribute.BrowseName,
        Attribute.DataType,
        Attribute.DisplayName,
        Attribute.Historizing,
        Attribute.NodeClass,
        Attribute.UserAccessLevel,
        Attribute.ValueRank
        ];

    // build the request/response headers
    var readReq = new UaReadRequest();
    var readRes = new UaReadResponse();
    g_session.buildRequestHeader( readReq.RequestHeader );

    readReq.MaxAge = 100;
    readReq.TimestampsToReturn = TimestampsToReturn.Both;

    var expectedResults = [];
    for( var i=0; i<attributeToRead.length; i++ )
    {
        readReq.NodesToRead[i].NodeId = items[0].NodeId;
        readReq.NodesToRead[i].AttributeId = attributeToRead[i];
        readReq.NodesToRead[i].IndexRange = "1:2";
        expectedResults[i] = new ExpectedAndAcceptedResults( StatusCode.BadIndexRangeInvalid );
        addLog( "Reading Node '" + items[0].NodeId + "'; Attribute: " + Attribute.toString( attributeToRead[i] ) + "; IndexRange: 1:2" );
    }

    uaStatus = g_session.read( readReq, readRes );
    if( uaStatus.isGood() )
    {
        checkReadError( readReq, readRes, expectedResults );
    }
    else
    {
        addError( "Read(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( read581Err015 );
// Retrieve the maximum number of continuation points that the server can allocate.
// The value comes from Objects/Server/ServerCapabilities/MaxBrowseContinuationPoints.
function GetMaxBrowseContinuationPoints()
{
    var readReq = new UaReadRequest();
    var readRes = new UaReadResponse();
    Session.buildRequestHeader( readReq.RequestHeader );

    readReq.MaxAge = 100;
    readReq.TimestampsToReturn = TimestampsToReturn.Both;

    readReq.NodesToRead[0].NodeId = new UaNodeId( Identifier.Server_ServerCapabilities_MaxBrowseContinuationPoints, 0 );
    readReq.NodesToRead[0].AttributeId = Attribute.Value;

    uaStatus = Session.read( readReq, readRes );

    // check result
    if( uaStatus.isGood() )
    {
        if( readRes.ResponseHeader.ServiceResult.isGood() )
        {
            if( readRes.Results.length == 1 )
            {
                if( readRes.Results[0].StatusCode.isGood() )
                {
                    return readRes.Results[0].Value; 
                }
            }
        }
    }
    return -1;
}
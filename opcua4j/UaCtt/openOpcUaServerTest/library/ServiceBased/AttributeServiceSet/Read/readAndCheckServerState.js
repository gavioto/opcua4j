/* This function readAndCheckServerState( expectedState ) is provided to 
   read the value of the ServerStatus.State value, which describes the current
   state of the OPC UA Server and whether or not it is in a suitable state 
   to be used by a Client.
*/
function readAndCheckServerState( expectedState, sessionObject )
{
    if( arguments.length != 2 )
    {
        throw( "readAndCheckServerState() argument error. 2 parameters needed: expectedState & sessionObject." );
    }
    var item = MonitoredItem.fromNodeIds(  new UaNodeId( Identifier.Server_ServerStatus_State, 0 ) );
    var readService = new Read( sessionObject );
    if( readService.Execute( item, TimestampsToReturn.Both, 100 ) )
    {
        AssertCoercedEqual( expectedState, readService.readResponse.Results[0].Value, "Server State is not what was expected." );
    }
}
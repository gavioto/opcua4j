function check_serverSupportsDiagnostics( sessionObject )
{
    var reader = new Read( sessionObject );
    var item = MonitoredItem.fromNodeIds( new UaNodeId( Identifier.Server_ServerDiagnostics_EnabledFlag ) )
    if( reader.Execute( item ) )
    {
        // check the status and quality
        if( AssertEqual( true, reader.readResponse.Results[0].StatusCode.isGood() ) )
        {
            return( reader.readResponse.Results[0].Value == 1 || reader.readResponse.Results[0].Value == true );
        }
    }
    //clean-up
    reader = null;
    item = null;
    return false;
}
function populateNodesToWriteFromWriteMask( writeRequest, nodeIdString, writeMask )
{
    var initialNodeCount = writeRequest.NodesToWrite.length;    
    var currentNodeNumber = initialNodeCount - 1;

    // now go through and see which attributes we can write to, and then
    // write to each one that is writeable!
    if( writeMask & AttributeWriteMask.AccessLevel )
    {
        writeRequest.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.AccessLevel;
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setUInt32( 256 ); //256 = Executable attribute
    }

    if( writeMask & AttributeWriteMask.ArrayDimensions )
    {
        writeRequest.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.ArrayDimensions;
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setInt16( 20 );
    }

    if( writeMask & AttributeWriteMask.BrowseName )
    {
        writeRequest.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.BrowseName;
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setString( "Browse_5.8.2-003") ;
    }

    if( writeMask & AttributeWriteMask.ContainsNoLoops )
    {
        writeRequest.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.ContainsNoLoops;
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setBoolean( false );
    }

    if( writeMask & AttributeWriteMask.DataType )
    {
        writeRequest.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.DataType;
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setInt16( 0 ); // ??? what should be here ??
    }

    if( writeMask & AttributeWriteMask.Description )
    {
        writeRequest.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.Description;
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
        var lt = new UaLocalizedText();
        lt.Text = "Description_5.8.2-003";
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setLocalizedText( lt );
    }

    if( writeMask & AttributeWriteMask.DisplayName )
    {
        writeRequest.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.DisplayName;
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
        var lt = new UaLocalizedText();
        lt.Text = "Display_5.8.2-003";
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setLocalizedText( lt );
    }

    if( writeMask & AttributeWriteMask.EventNotifier )
    {
        writeRequest.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.EventNotifier;
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setByte( 8 ); // 8 = HistoryWrite
    }

    if( writeMask & AttributeWriteMask.Executable )
    {
        // define a NodeId of a data-type
        writeRequest.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.Executable;
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setBoolean( false );
    }

    if( writeMask & AttributeWriteMask.Historizing )
    {
        // define a NodeId of a data-type
        writeRequest.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.Historizing;
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setBoolean( false );
    }


    if( writeMask & AttributeWriteMask.InverseName )
    {
        writeRequest.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.InverseName;
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setLocalizedText( new UaLocalizedText( "local582-003" ) );
    }

    if( writeMask & AttributeWriteMask.IsAbstract )
    {
        writeRequest.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.IsAbstract;
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setBoolean( false );
    }

    if( writeMask & AttributeWriteMask.MinimumSamplingInterval )
    {
        // define a NodeId of a data-type
        writeRequest.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.MinimumSamplingInterval;
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setDouble( 5000 );
    }

    if( writeMask & AttributeWriteMask.NodeClass )
    {
        writeRequest.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.NodeClass;
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setInt16( 0 ); //?? what to put here ??
    }

    if( writeMask & AttributeWriteMask.NodeId )
    {
        writeRequest.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.NodeId;
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setNodeId( new UaNodeId() );
    }

    if( writeMask & AttributeWriteMask.Symmetric )
    {
        writeRequest.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.Symmetric;
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setBoolean( false );
    }

    if( writeMask & AttributeWriteMask.UserAccessLevel )
    {
        // define a NodeId of a data-type
        writeRequest.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.UserAccessLevel;
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setByte( 4 ) // 4 = historyRead
    }

    if( writeMask & AttributeWriteMask.UserExecutable )
    {
        // define a NodeId of a data-type
        writeRequest.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.UserExecutable;
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setBoolean( false );
    }

    if( writeMask & AttributeWriteMask.UserWriteMask )
    {
        // define a NodeId of a data-type
        writeRequest.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.UserWriteMask;
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setInt32( 0 ); // 0 = AccessLevel
    }

    if( writeMask & AttributeWriteMask.ValueRank )
    {
        // define a NodeId of a data-type
        writeRequest.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.ValueRank;
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setInt32( -1 ); // -1 = not an array!
    }

    if( writeMask & AttributeWriteMask.WriteMask )
    {
        // define a NodeId of a data-type
        writeRequest.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.WriteMask;
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setInt32( 0 ); // 0 = AccessLevel
    }

    if( writeMask & AttributeWriteMask.ValueForVariableType )
    {
        // define a NodeId of a data-type
        writeRequest.NodesToWrite[++currentNodeNumber].AttributeId = Attribute.WriteMask;
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
        writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setInt16( 0 ); //?? what to put here??
    }
    // loop thru all the nodeToWrite that we just created, and define the nodeIds
    for( var n=initialNodeCount; n<=currentNodeNumber; n++ )
    {
        writeRequest.NodesToWrite[n].NodeId = UaNodeId.fromString( nodeIdString );
    }

}
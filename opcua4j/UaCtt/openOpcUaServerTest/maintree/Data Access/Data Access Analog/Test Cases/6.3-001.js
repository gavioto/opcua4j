/*  Test 6.3 Test 1 prepared by Anand Taparia; ataparia@kepware.com

    Description:
        Read value attribute of an analog node of each of the following data type: 
        Double, Float, Int16, UInt16, Int32, UInt32, Int64, UInt64.
        Perform each read separately.

    Revision History:
        08-Feb-2010 Anand Taparia: Initial version.
        04-Mar-2010 NP: REVIEWED.
        22-Dec-2010 NP: Allows "BadWriteNotSupported" if Server doesn't support writing VQTT's.
        03-Feb-2011 NP: Bad_WriteNotSupported will not continue to validate the write! (credit: MI)
*/

function read613001()
{
    // Analog type nodes array
    var analogTypeNodes = NodeIdSettings.DAStaticAnalog ();

    // Check that we are covering all the data types as required by this test
    if ( analogTypeNodes.length < 8 )
    {
        // Post a warning message, but continue
        print( "\nNot all the datatypes are being covered by this test. Add additional analog items." );
    }

    // Test each of the analog item one by one
    for( var i=0; i<analogTypeNodes.length; i++ )
    {
        // Get the datatype of the current node we are processing
        currentNodeDataType = NodeIdSettings.guessType( analogTypeNodes[i] );

        // does this node exist? (is the setting configured)
        var nodeExists = UaNodeId.fromString( readSetting( analogTypeNodes[i] ).toString() );
        if( nodeExists === null )
        {
            _dataTypeUnavailable.store( BuiltInType.toString( currentNodeDataType ) );
            continue;
        }

        // We will preset the item with a VQT, and then do a read
        var writeRequest = new UaWriteRequest ();
        var writeResponse = new UaWriteResponse ();
        g_session.buildRequestHeader( writeRequest.RequestHeader );
        writeRequest.NodesToWrite[0].NodeId = UaNodeId.fromString( readSetting( analogTypeNodes[i] ).toString() );
        writeRequest.NodesToWrite[0].AttributeId = Attribute.Value;

        // Write VQT here
        // Generate a value to write (safest value to not fail would be somewhere in the EURange)
        var currentNodeEURange = GetNodeIdEURange ( analogTypeNodes[i] );
        var writeValue = ( currentNodeEURange.Low + GetEURangeAsSize( currentNodeEURange ) / 2 );
        setValue( writeRequest.NodesToWrite[0], writeValue, currentNodeDataType );
        writeRequest.NodesToWrite[0].Value.StatusCode.StatusCode = StatusCode.GoodOverload;
        writeRequest.NodesToWrite[0].Value.SourceTimestamp = UaDateTime.utcNow();

        print ( "\nPresetting for test: Writing VQT to node '" + analogTypeNodes[i] + "'." );
        print ( "\tValue: " + UaVariantToSimpleType ( writeRequest.NodesToWrite[0].Value.Value ) );
        print ( "\tStatusCode: " +  writeRequest.NodesToWrite[0].Value.StatusCode );
        print ( "\tSourceTimestamp: " +  writeRequest.NodesToWrite[0].Value.SourceTimestamp );

        var uaStatus = g_session.write( writeRequest, writeResponse );
        if( uaStatus.isGood() )
        {
            // define the results that we will accept
            var expectedResults = [ new ExpectedAndAcceptedResults( StatusCode.Good ) ];
            expectedResults[0].addExpectedResult( StatusCode.BadWriteNotSupported );
            // validate the response, but don't validate the writes themselves (i.e. read back the values)
            if( !checkWriteError( writeRequest, writeResponse, expectedResults, false ) )
            {
                addError( "Write failed. Aborting test." );
                return;
            }
            if( writeResponse.Results[0].StatusCode === StatusCode.BadWriteNotSupported )
            {
                _notSupported.store( "Write VQT", undefined, false );
                return;
            }

            // Start read (to verify written values)
            var readRequest = new UaReadRequest ();
            var readResult = new UaReadResponse ();
            g_session.buildRequestHeader( readRequest.RequestHeader );

            readRequest.NodesToRead[0].NodeId = UaNodeId.fromString( readSetting( analogTypeNodes[i] ).toString() );
            readRequest.NodesToRead[0].AttributeId = Attribute.Value;
            readRequest.TimestampsToReturn = TimestampsToReturn.Both;

            // Perform the read
            addLog( "Write completed Successfully. Now to READ back the values and compare them to the Write." );
            print ( "Reading node '" + analogTypeNodes[i] + "' after the write to check the written values." );
            uaStatus = g_session.read( readRequest, readResult );            
            // Check results
            if( uaStatus.isGood() )
            {
                // Check the read for usual errors etc.
                if( checkReadValidParameter( readRequest, readResult ) )
                {
                    // We only expect one read result!
                    AssertEqual (readResult.Results.length, 1, "Incorrect length of read results: Received: " + readResult.Results.length + " Expected: 1"  );

                    // This has to succeed for any other checks!
                    if( readResult.Results[0].Value.isEmpty() )
                    {
                        addError ( "NULL value received for node '" + analogTypeNodes[i] + "'." );
                        continue;
                    }

                    // Check#1: DataType
                    print( "Checking the data type..." );
                    if ( currentNodeDataType == readResult.Results[0].Value.DataType )
                    {
                        addLog ( "The expected and received datatype for the node '" + analogTypeNodes[i] + "' are the same(datatype = " + BuiltInType.toString ( currentNodeDataType ) + ")." );
                    }
                    else
                    {
                        addError ( "The expected and received datatype for the node '" + analogTypeNodes[i] + "' are the different.\n\t Expected datatype = " + BuiltInType.toString ( currentNodeDataType ) + "\n\t Received datatype = " + BuiltInType.toString ( readResult.Results[0].Value.DataType ) + "" );
                    }

                    // Check#2: Value
                    print( "Checking the value..." );
                    var writeVal = UaVariantToSimpleType( writeRequest.NodesToWrite[0].Value.Value );
                    var readVal  = UaVariantToSimpleType( readResult.Results[0].Value );                    
                    if ( writeVal == readVal  )
                    {
                        addLog ( "The expected and received value for the node '" + analogTypeNodes[i] + "' are the same(value = " + readVal + ")." );
                    }
                    else
                    {
                        addError ( "The expected and received value for the node '" + analogTypeNodes[i] + "' are the different.\n\t Expected value = " + writeVal + "\n\t Received value = " + readVal + "" );
                    }

                    // Check#3: StatusCode
                    print( "Checking the statuscode..." );                
                    if ( writeRequest.NodesToWrite[0].Value.StatusCode.StatusCode == readResult.Results[0].StatusCode.StatusCode  )
                    {
                        addLog ( "The expected and received statuscode for the node '" + analogTypeNodes[i] + "' are the same(statuscode= " + writeRequest.NodesToWrite[0].Value.StatusCode + ")." );
                    }
                    else
                    {
                        addError ( "The expected and received statuscode for the node '" + analogTypeNodes[i] + "' are the different.\n\t Expected statuscode = " + writeRequest.NodesToWrite[0].Value.StatusCode + "\n\t Received statuscode = " + readResult.Results[0].StatusCode + "" );
                    }

                    // Check#4: Timestamp
                    var writeSourceTimestamp = writeRequest.NodesToWrite[0].Value.SourceTimestamp;
                    var readSourceTimestamp  = readResult.Results[0].SourceTimestamp;
                    print( "Checking the sourcetimestamp..." );
                    if ( readSourceTimestamp.isNull () )
                    {
                        addError( "NULL sourcetimestamp received for node '" + analogTypeNodes[i] + "'." );
                    }
                    else
                    {
                        if ( writeSourceTimestamp.equals ( readSourceTimestamp ) )
                        {
                            addLog( "The expected and received sourcetimestamp for the node '" + analogTypeNodes[i] + "' are the same(sourcetimestamp = " + writeRequest.NodesToWrite[0].Value.SourceTimestamp + ")." );
                        }
                        else
                        {
                            addError( "The expected and received sourcetimestamp for the node '" + analogTypeNodes[i] + "' are the different.\n\t Expected sourcetimestamp = " + writeRequest.NodesToWrite[0].Value.SourceTimestamp + "\n\t Received sourcetimestamp = " + readResult.Results[0].SourceTimestamp + "" );
                        }
                    }
                    // Post servertimestamp if received
                    if ( !readResult.Results[0].ServerTimestamp.isNull () )
                    {
                        addLog( "Received ServerTimestamp:" + readResult.Results[0].ServerTimestamp.toString () + " for the node '" + analogTypeNodes[i] + "'" );
                    }
                }
                else
                {
                    addError( "Read() status " + uaStatus, uaStatus );
                }
            }
        }
        else
        {
            addError( "Write() status " + uaStatus, uaStatus );
        }
    }
    // Test complete
    print( "********************" );
    print( "Test Complete." );
    print( "********************" );
}

safelyInvoke( read613001 );
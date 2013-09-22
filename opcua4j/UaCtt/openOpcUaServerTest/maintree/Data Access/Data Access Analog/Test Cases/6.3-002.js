/*  Test 6.3 Test 2 prepared by Anand Taparia; ataparia@kepware.com

    Description:
        Read value attribute of an analog node of each of the following data type: 
        Double, Float, Int16, UInt16, Int32, UInt32, Int64, UInt64.
        Perform the reads in a single call.

    Revision History
        08-Feb-2010 Anand Taparia: Initial version.
        04-Mar-2010 NP: REVIEWED.
        22-Dec-2010 NP: Allows "BadWriteNotSupported" if Server doesn't support writing VQTT's.
*/

function read613002()
{
    // Analog type nodes array
    var analogTypeNodes = NodeIdSettings.DAStaticAnalog();

    // Check that we are covering all the data types as required by this test
    if( analogTypeNodes.length < 8 )
    {
        // Post a warning message, but continue
        print( "\nNot all the datatypes are being covered by this test. Add additional analog items." );
    }

    // Write to all the analog items: VQT (and later do a single read of all the items)
    var writeRequest = new UaWriteRequest ();
    var writeResponse = new UaWriteResponse ();
    g_session.buildRequestHeader( writeRequest.RequestHeader );

    var nRunningIndex = 0;
    var readIndexArray = []; // To save index of items that we are writing to for read later
    var expectedResults = [];
    for( var i=0; i<analogTypeNodes.length; i++ )
    {
        // Get the datatype of the current node we are processing
        currentNodeDataType = NodeIdSettings.guessType( analogTypeNodes[i] ) ;

        // does this node exist? (is the setting configured)
        var nodeExists = UaNodeId.fromString( readSetting( analogTypeNodes[i] ).toString() );
        if( nodeExists === null )
        {
            _dataTypeUnavailable.store( BuiltInType.toString( currentNodeDataType ) );
            continue;
        }

        // Fill write parameters
        writeRequest.NodesToWrite[nRunningIndex].NodeId = UaNodeId.fromString( readSetting( analogTypeNodes[i] ).toString() );
        writeRequest.NodesToWrite[nRunningIndex].AttributeId = Attribute.Value;

        // Write VQT here
        // Generate a value to write (safest value to not fail would be somewhere in the EURange)
        var currentNodeEURange = GetNodeIdEURange ( analogTypeNodes[i] );
        var writeValue = ( currentNodeEURange.Low + GetEURangeAsSize( currentNodeEURange ) / 2 );
        setValue( writeRequest.NodesToWrite[nRunningIndex], writeValue, currentNodeDataType );
        writeRequest.NodesToWrite[nRunningIndex].Value.StatusCode.StatusCode = StatusCode.GoodOverload;
        writeRequest.NodesToWrite[nRunningIndex].Value.SourceTimestamp = UaDateTime.utcNow();

        print ( "\nPresetting for test: Writing VQT to node '" + analogTypeNodes[i] + "'." );
        print ( "\tValue: " + UaVariantToSimpleType ( writeRequest.NodesToWrite[nRunningIndex].Value.Value ) );
        print ( "\tStatusCode: " +  writeRequest.NodesToWrite[nRunningIndex].Value.StatusCode );
        print ( "\tSourceTimestamp: " +  writeRequest.NodesToWrite[nRunningIndex].Value.SourceTimestamp );

        // define the results that we will accept
        var expectedResult = new ExpectedAndAcceptedResults( StatusCode.Good );
        expectedResult.addExpectedResult( StatusCode.BadWriteNotSupported );
        expectedResults.push( expectedResult );

        // Save the indices we are writing to (we want to read these items later)
        readIndexArray [nRunningIndex] = i;            
        // Next index
        nRunningIndex++;
    }

    // Issue write
    var uaStatus = g_session.write( writeRequest, writeResponse );
    if( uaStatus.isGood() )
    {
        // false: Don't validate written values here, we will do the checks separately
        if( !checkWriteError( writeRequest, writeResponse, expectedResults, false ) )
        {
            addError ( "Write failed when presetting analog items." );
            return;
        }
        if( writeResponse.Results[0].StatusCode === StatusCode.BadWriteNotSupported )
        {
            _notSupported.store( "Write VQT", undefined, false );
            return;
        }

        addLog( "Write succeeded. Now to READ the valies and compare them to what we wrote." );
        // At this point the writes have been completed. Now we will do a single read of all the 
        // items that were written. Read values will be compared to what was written
        // Start read (to verify written values)
        var readRequest = new UaReadRequest ();
        var readResult = new UaReadResponse ();
        g_session.buildRequestHeader( readRequest.RequestHeader );

        for( var i=0; i<readIndexArray.length; i++ )
        {
            print ( "Adding node '" + analogTypeNodes[readIndexArray[i]] + "' for read." );
            readRequest.NodesToRead[i].NodeId = UaNodeId.fromString( readSetting( analogTypeNodes[readIndexArray[i]] ).toString() );
            readRequest.NodesToRead[i].AttributeId = Attribute.Value;        
        }

        // Both timestamp
        readRequest.TimestampsToReturn = TimestampsToReturn.Both;

        // Perform the single read
        uaStatus = g_session.read( readRequest, readResult );
        // Check results
        if( uaStatus.isGood() )
        {
            // Check the read for usual errors etc.
            checkReadValidParameter( readRequest, readResult );

            // Check the no. of read results!
            AssertEqual (readResult.Results.length, readIndexArray.length , "Incorrect length of read results: Received: " + readResult.Results.length + " Expected: " + readIndexArray );

            // Now verify the read results of each item
            for( i=0; i<readResult.Results.length; i++ )
            {
                // This has to succeed for any other checks!
                if( readResult.Results[i].Value.isEmpty() )
                {
                    addError ( "NULL value received for node '" + analogTypeNodes[readIndexArray[i]] + "'." );
                    continue;
                }

                // Get the datatype of the current node we are processing
                var currentNodeDataType = NodeIdSettings.guessType( analogTypeNodes[readIndexArray[i]] ) ;
                // Check#1: DataType
                print( "Checking the data type..." );
                if ( currentNodeDataType == readResult.Results[i].Value.DataType )
                {
                    addLog( "The expected and received datatype for the node '" + analogTypeNodes[readIndexArray[i]] + "' are the same(datatype = " + BuiltInType.toString ( currentNodeDataType ) + ")." );
                }
                else
                {
                    addError( "The expected and received datatype for the node '" + analogTypeNodes[readIndexArray[i]] + "' are the different.\n\t Expected datatype = " + BuiltInType.toString ( currentNodeDataType ) + "\n\t Received datatype = " + BuiltInType.toString ( readResult.Results[i].Value.DataType ) + "" );
                }

                // Check#2: Value
                print ( "Checking the value..." );
                var writeVal = UaVariantToSimpleType( writeRequest.NodesToWrite[i].Value.Value );
                var readVal  = UaVariantToSimpleType( readResult.Results[i].Value );                    
                if ( writeVal == readVal  )
                {
                    addLog ( "The expected and received value for the node '" + analogTypeNodes[readIndexArray[i]]  + "' are the same(value = " + readVal + ")." );
                }
                else
                {
                    addError ( "The expected and received value for the node '" + analogTypeNodes[readIndexArray[i]]  + "' are the different.\n\t Expected value = " + writeVal + "\n\t Received value = " + readVal + "" );
                }

                // Check#3: StatusCode
                print ( "Checking the statuscode..." );
                if ( writeRequest.NodesToWrite[i].Value.StatusCode.StatusCode = readResult.Results[i].StatusCode.StatusCode  )
                {
                    addLog ( "The expected and received statuscode for the node '" + analogTypeNodes[readIndexArray[i]] + "' are the same(statuscode= " + writeRequest.NodesToWrite[i].Value.StatusCode + ")." );
                }
                else
                {
                    addError ( "The expected and received statuscode for the node '" + analogTypeNodes[readIndexArray[i]] + "' are the different.\n\t Expected statuscode = " + writeRequest.NodesToWrite[i].Value.StatusCode + "\n\t Received statuscode = " + readResult.Results[i].StatusCode + "" );
                }

                // Check#4: Timestamp
                var writeSourceTimestamp = writeRequest.NodesToWrite[i].Value.SourceTimestamp;
                var readSourceTimestamp  = readResult.Results[i].SourceTimestamp;
                print ( "Checking the sourcetimestamp..." );
                if ( readSourceTimestamp.isNull () )
                {
                    addError ( "NULL sourcetimestamp received for node '" + analogTypeNodes[readIndexArray[i]] + "'." );
                }
                else
                {
                    if ( writeSourceTimestamp.equals ( readSourceTimestamp ) )
                    {
                        addLog( "The expected and received sourcetimestamp for the node '" + analogTypeNodes[readIndexArray[i]] + "' are the same(sourcetimestamp = " + writeRequest.NodesToWrite[i].Value.SourceTimestamp + ")." );
                    }
                    else
                    {
                        addError( "The expected and received sourcetimestamp for the node '" + analogTypeNodes[readIndexArray[i]] + "' are the different.\n\t Expected sourcetimestamp = " + writeRequest.NodesToWrite[i].Value.SourceTimestamp + "\n\t Received sourcetimestamp = " + readResult.Results[i].SourceTimestamp + "" );
                    }
                }
                // Post servertimestamp if received
                if ( !readResult.Results[i].ServerTimestamp.isNull () )
                {
                    addLog( "Received ServerTimestamp:" + readResult.Results[i].ServerTimestamp.toString () + " for the node '" + analogTypeNodes[readIndexArray[i]] + "'" );
                }
            }
        }
        else
        {
            addError( "Read(): status " + uaStatus, uaStatus );
        }
    }
    else
    {
        addError( "Write(): status " + uaStatus, uaStatus );
    }

    // Test complete
    print ( "********************" );
    print ( "Test Complete." );
    print ( "********************" );
}

safelyInvoke( read613002 );
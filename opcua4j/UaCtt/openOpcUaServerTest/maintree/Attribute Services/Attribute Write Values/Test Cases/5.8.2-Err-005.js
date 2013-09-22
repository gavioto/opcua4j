/*  Test 5.8.2 Error Test 5; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to an invalid attribute of a valid node, multiple times in
        the same call.

        How this script works:
            1.) Read an array of NodeIds, particularly the writeMask attribute
            2.) Construct a list of attributes to write (based on writeMask) per node
            3.) Issue the write call.

    Revision History
        25-Sep-2009 NP: Initial version.
        05-Oct-2009 NP: Enhanced to be more dynamic, NOW based on initial Read of WriteMask attribute.
        16-Nov-2009 NP: REVIEWED & INCONCLUSIVE. Server does not appear to use WriteMask.
        11-Dec-2009 DP: Provide a warning if the WriteMask is 0 (instead of a "skip" message).

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function settingsToNodes( settingNames )
{
    var currentNodeNumber = 0;
    var nodes = [];
    for( var s=0; s<settingNames.length; s++ )
    {
        var settingValue = readSetting( settingNames[s] ).toString();
        if( settingValue != undefined && settingValue != "undefined" && settingValue.length > 1 )
        {
            nodes[currentNodeNumber++] = UaNodeId.fromString( settingValue );
        }
    }
    return( nodes );
}

function write582Err009()
{
    const INVALIDATTRIBUTEID = 0x999;

    // define the nodeIds we're going to read from the settings
    var validNodeNames = [ NodeIdSettings.GetAScalarNodeIdSetting( NodeIdSettings.ScalarStatic(), "iud" ).name ];

    var invalidNodeNames = [
        "/Advanced/NodeIds/Invalid/InvalidNodeId1"
        ];

    var invalidSyntaxNodeNames = NodeIdSettings.InvalidNodeIds();

    var unknownNodeNames = [
        "/Advanced/NodeIds/Invalid/UnknownNodeId1",
        "/Advanced/NodeIds/Invalid/UnknownNodeId2",
        "/Advanced/NodeIds/Invalid/UnknownNodeId3",
        "/Advanced/NodeIds/Invalid/UnknownNodeId4",
        ];


    // prepare the READ request
    var validNodes = settingsToNodes( validNodeNames );

    var readRequest = new UaReadRequest();
    var readResponse = new UaReadResponse();
    g_session.buildRequestHeader( readRequest.RequestHeader );

    // specify each node to read 
    for( var i=0; i<validNodes.length; i++ )
    {
        readRequest.NodesToRead[i].NodeId = validNodes[i];
        readRequest.NodesToRead[i].AttributeId = Attribute.WriteMask;
    }

    // issue the READ
    var uaStatus = g_session.read( readRequest, readResponse );
    if( uaStatus.isGood() )
    {
        checkReadValidParameter( readRequest, readResponse );
        print( "Value[0]   = " + readResponse.Results[0].Value );
        print( "Quality[0] = " + readResponse.Results[0].StatusCode );
        print( "TimeSrc[0] = " + readResponse.Results[0].SourceTimestamp );
        print( "TimeSvr[0] = " + readResponse.Results[0].ServerTimestamp );

        // store the writeMask value
        var writeMask = readResponse.Results[0].Value;


        // build the write header objects
        var writeRequest = new UaWriteRequest()
        var writeResponse = new UaWriteResponse()
        g_session.buildRequestHeader( writeRequest.RequestHeader )

        // prepare our expected error array
        var errorsExpected = new Array();





        // --------------< VALID NODE >---------------------
        populateNodesToWriteFromWriteMask( writeRequest, readSetting( validNodeNames[0] ).toString(), writeMask );

        // do we have any attributes to write to?
        if( writeRequest.NodesToWrite.length == 0 )
        {
            addWarning( "Test cannot be completed: WriteMask indicates that no attributes are writeable." );
        }
        else
        {
            // prepare our expected error
            for( var e=0; e<writeRequest.NodesToWrite.length; e++ )
            {
                errorsExpected[e] = new ExpectedAndAcceptedResults( StatusCode.Good );
            }

            // write to the non-existent attribute
            writeRequest.NodesToWrite[e].NodeId = UaNodeId.fromString( readSetting( validNodeNames[0] ).toString() );
            writeRequest.NodesToWrite[e].AttributeId = INVALIDATTRIBUTEID;
            writeRequest.NodesToWrite[e].Value.Value = new UaVariant();
            writeRequest.NodesToWrite[e].Value.Value.setString( "will not write" );

            // prepare our expected error
            errorsExpected[e] = new ExpectedAndAcceptedResults( StatusCode.BadAttributeIdInvalid );



            var currentNodeNumber = writeRequest.NodesToWrite.length;

            // --------------< INVALID NODE >---------------------
            //write to the Value, as int 16
            writeRequest.NodesToWrite[currentNodeNumber].NodeId = UaNodeId.fromString( readSetting( invalidNodeNames[0] ).toString() );
            writeRequest.NodesToWrite[currentNodeNumber].AttributeId = Attribute.Value;
            writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
            writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setInt16( 100 );

            // prepare our expected error
            errorsExpected[currentNodeNumber] = new ExpectedAndAcceptedResults( StatusCode.BadNodeIdInvalid );
            errorsExpected[currentNodeNumber].addExpectedResult( StatusCode.BadNodeIdUnknown );

            // write to the DisplayName
            writeRequest.NodesToWrite[++currentNodeNumber].NodeId = UaNodeId.fromString( readSetting( invalidNodeNames[0] ).toString() );
            writeRequest.NodesToWrite[currentNodeNumber].AttributeId = Attribute.DisplayName;
            writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
            writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setString( "display #1" );

            // prepare our expected error
            errorsExpected[currentNodeNumber] = new ExpectedAndAcceptedResults( StatusCode.BadNodeIdInvalid );
            errorsExpected[currentNodeNumber].addExpectedResult( StatusCode.BadNodeIdUnknown );



            // --------------< INVALID SYNTAX NODE >---------------------
            for( var i=0; i<invalidSyntaxNodeNames.length; i++ )
            {
                //write to the Value, as int 16
                writeRequest.NodesToWrite[++currentNodeNumber].NodeId = UaNodeId.fromString( readSetting( invalidSyntaxNodeNames[i] ).toString() );
                writeRequest.NodesToWrite[currentNodeNumber].AttributeId = Attribute.Value;
                writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
                writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setInt16( 100 );

                // prepare our expected error
                errorsExpected[currentNodeNumber] = new ExpectedAndAcceptedResults( StatusCode.BadNodeIdInvalid );
                errorsExpected[currentNodeNumber].addExpectedResult( StatusCode.BadNodeIdUnknown );

                // write to the DisplayName
                writeRequest.NodesToWrite[++currentNodeNumber].NodeId = UaNodeId.fromString( readSetting( invalidSyntaxNodeNames[i] ).toString() );
                writeRequest.NodesToWrite[currentNodeNumber].AttributeId = Attribute.DisplayName;
                writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
                writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setString( "display #1" );

                // prepare our expected error
                errorsExpected[currentNodeNumber] = new ExpectedAndAcceptedResults( StatusCode.BadNodeIdInvalid );
                errorsExpected[currentNodeNumber].addExpectedResult( StatusCode.BadNodeIdUnknown );
            }



            // --------------< UNKNOWN SYNTAX NODE >---------------------
            for( var i=0; i<unknownNodeNames.length; i++ )
            {
                //write to the Value, as int 16
                writeRequest.NodesToWrite[++currentNodeNumber].NodeId = UaNodeId.fromString( readSetting( unknownNodeNames[i] ).toString() );
                writeRequest.NodesToWrite[currentNodeNumber].AttributeId = Attribute.Value;
                writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
                writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setInt16( 100 );

                // prepare our expected error
                errorsExpected[currentNodeNumber] = new ExpectedAndAcceptedResults( StatusCode.BadNodeIdInvalid );
                errorsExpected[currentNodeNumber].addExpectedResult( StatusCode.BadNodeIdUnknown );

                // write to the DisplayName
                writeRequest.NodesToWrite[++currentNodeNumber].NodeId = UaNodeId.fromString( readSetting( unknownNodeNames[i] ).toString() );
                writeRequest.NodesToWrite[currentNodeNumber].AttributeId = Attribute.DisplayName;
                writeRequest.NodesToWrite[currentNodeNumber].Value.Value = new UaVariant();
                writeRequest.NodesToWrite[currentNodeNumber].Value.Value.setString( "display #1" );

                // prepare our expected error
                errorsExpected[currentNodeNumber] = new ExpectedAndAcceptedResults( StatusCode.BadNodeIdInvalid );
                errorsExpected[currentNodeNumber].addExpectedResult( StatusCode.BadNodeIdUnknown );
            }


            var uaStatus = g_session.write( writeRequest, writeResponse );
            if( uaStatus.isGood() )
            {
                // this is an array of ExpectedAndAcceptedResult. Size of the array = number of nodes to read
                checkWriteError( writeRequest, writeResponse, errorsExpected, false, undefined, OPTIONAL_CONFORMANCEUNIT );
            }
            else
            {
                addError( "Write(): status " + uaStatus, uaStatus );
            }
        }
    }
    else
    {
        addError( "Read(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( write582Err009 );
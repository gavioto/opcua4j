/*  Test 5.8.1 Error Test 8; prepared by Mark Rice; mrice@canarylabs.com

    Description:
        Read valid attributes (ids: 1, 3, 4) from a set of nodes
        containing valid nodes, non-existent nodes, and nodes with
        invalid node id syntaxes.
        Script verifies this by using globally defined variables to
        specify the invalid and non-existent nodes etc.

    Revision History
        11-Sep-2009 MR: Initial version.
        11-Nov-2009 NP: REVIEWED.
        16-Nov-2009 DP: Replaced "new Array()" syntax with "[]" syntax,
                        removed duplicate variable declarations,
                        explicitly declare variables that weren't.
        26-Jan-2010 NP: Removed (optional) DESCRIPTION attribute. Script now checks for REQUIRED attributes.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581Err008()
{
    //define the names of the options in an array. 
    //This will make for an easier script.
    //This list SHOULD match whatever is defined in the options.
    var goodNodeNames = NodeIdSettings.ScalarStatic();
    var unknownNodeNames = NodeIdSettings.UnknownNodeIds();
    var invalidNodeNames = NodeIdSettings.InvalidNodeIds();
    var attributesToRead = [
        Attribute.NodeId,
        Attribute.BrowseName,
        Attribute.DisplayName
    ];

    // this is an array of ExpectedAndAcceptedResult. Size of the array = number of nodes to read
    var ExpectedOperationResultsArray = [];

    var readReq = new UaReadRequest();
    var readRes = new UaReadResponse();
    g_session.buildRequestHeader( readReq.RequestHeader );

    readReq.MaxAge = 10000;
    readReq.TimestampsToReturn = TimestampsToReturn.Both;

    //stores the current node number that we're processing
    var nodeNumber = 0;
    var settingValue;
    var i, j;

    //dynamically construct the IDs of the nodes we want to read, specifically their values.
    for( i=0; i<goodNodeNames.length; i++ )
    {

        //get the value of the setting, and make sure it contains a value
        settingValue = readSetting( goodNodeNames[i] );
        if( settingValue == null || settingValue == undefined || settingValue.toString() == "undefined" )
        {
            settingValue = "";
        }

        if( settingValue.toString().length > 0 )
        {
            //include all of the attributes
            for ( j=0; j<attributesToRead.length; j++)
            {
                readReq.NodesToRead[nodeNumber].NodeId = UaNodeId.fromString( settingValue.toString() );
                readReq.NodesToRead[nodeNumber].AttributeId = attributesToRead[j];
                addLog( "Reading Node: '" + readReq.NodesToRead[nodeNumber].NodeId + "'; Attribute: " + Attribute.toString( attributesToRead[j] ) +
                    " (setting: '" + goodNodeNames[i] + "')" );
                ExpectedOperationResultsArray[nodeNumber] = new ExpectedAndAcceptedResults();
                ExpectedOperationResultsArray[nodeNumber++].addExpectedResult( StatusCode.Good );
            }
        }
        else
        {
            //skip this node for the results check.
            goodNodeNames[i] = "";
        }
    }
    for( i=0; i<unknownNodeNames.length; i++ )
    {
        //get the value of the setting, and make sure it contains a value
        settingValue = readSetting( unknownNodeNames[i] );
        if( settingValue == undefined || settingValue == null || settingValue.toString() == "undefined" )
        {
            settingValue = "";
        }

        if( settingValue.toString().length > 0 )
        {
            //include all of the attributes
            for ( j=0; j<attributesToRead.length; j++)
            {
                print( "\t\tGenerating NodeId from string: " + settingValue.toString() );
                readReq.NodesToRead[nodeNumber].NodeId = UaNodeId.fromString( settingValue.toString() );
                readReq.NodesToRead[nodeNumber].AttributeId = attributesToRead[j];
                addLog( "Reading UNKNOWN Node: '" + readReq.NodesToRead[nodeNumber].NodeId + "'; Attribute: " + Attribute.toString( attributesToRead[j] ) +
                    " (setting: '" + unknownNodeNames[i] + "')" );
                ExpectedOperationResultsArray[nodeNumber] = new ExpectedAndAcceptedResults();
                ExpectedOperationResultsArray[nodeNumber].addExpectedResult( StatusCode.BadNodeIdInvalid );
                ExpectedOperationResultsArray[nodeNumber++].addExpectedResult( StatusCode.BadNodeIdUnknown );
            }
        }
        else
        {
            //skip this node for the results check.
            unknownNodeNames[i] = "";
        }
    }
    for( i=0; i<invalidNodeNames.length; i++ )
    {
        //get the value of the setting, and make sure it contains a value
        settingValue = readSetting( invalidNodeNames[i] );
        if( settingValue == undefined || settingValue == null || settingValue.toString() == "undefined" )
        {
            settingValue = "";
        }

        if( settingValue.toString().length > 0 )
        {
            //include all of the attributes
            for ( j=0; j<attributesToRead.length; j++)
            {
                readReq.NodesToRead[nodeNumber].NodeId = UaNodeId.fromString( settingValue.toString() );
                readReq.NodesToRead[nodeNumber].AttributeId = attributesToRead[j];
                addLog( "Reading INVALID Node: '" + readReq.NodesToRead[nodeNumber].NodeId + "'; Attribute: " + Attribute.toString( attributesToRead[j] ) +
                    " (setting: '" + invalidNodeNames[i] + "')" );
                ExpectedOperationResultsArray[nodeNumber] = new ExpectedAndAcceptedResults();
                ExpectedOperationResultsArray[nodeNumber].addExpectedResult( StatusCode.BadNodeIdInvalid );
                ExpectedOperationResultsArray[nodeNumber++].addExpectedResult( StatusCode.BadNodeIdUnknown );
            }
        }
        else
        {
            //skip this node for the results check.
            invalidNodeNames[i] = "";
        }
    }

    // return diagnostics
    readReq.RequestHeader.ReturnDiagnostics = 0x03FF;

    print( "\nReading all configured Nodes now, looking for the following attributes:\n\tNodeId\n\tBrowseName\n\tDisplayName" );
    var uaStatus = g_session.read( readReq, readRes );
    if( uaStatus.isGood() )
    {
        checkReadError( readReq, readRes, ExpectedOperationResultsArray );
    }
    else
    {
        addError( "Read(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( read581Err008 );
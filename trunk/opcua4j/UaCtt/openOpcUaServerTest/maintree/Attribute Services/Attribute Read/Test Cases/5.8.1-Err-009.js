/*  Test 5.8.1 Error Test 9; prepared by Mark Rice; mrice@canarylabs.com

    Description:
        Read valid attributes (ids: 1, 3, 4, 5) from multiple non-existent nodes

    Revision History
        11-Sep-2009 MR: Initial version.
        11-Nov-2009 NP: REVIEWED.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581Err009()
{
    //define the names of the options in an array. 
    //This will make for an easier script.
    //This list SHOULD match whatever is defined in the options.
    var unknownNodeNames = NodeIdSettings.UnknownNodeIds();
    var attributesToRead = new Array(
        Attribute.NodeId,
        Attribute.BrowseName,
        Attribute.DisplayName,
        Attribute.Description
    );
    
    var readReq = new UaReadRequest();
    var readRes = new UaReadResponse();
    g_session.buildRequestHeader( readReq.RequestHeader );
    
    readReq.MaxAge = 10000;
    readReq.TimestampsToReturn = TimestampsToReturn.Both;

    // this is an array of ExpectedAndAcceptedResult. Size of the array = number of nodes to read
    var ExpectedOperationResultsArray = new Array(nodeNumber);
    //stores the current node number that we're processing
    var nodeNumber = 0;

    //dynamically construct the IDs of the nodes we want to read, specifically their values.
    for( var i=0; i<unknownNodeNames.length; i++ )
    {
        //get the value of the setting, and make sure it contains a value
        var settingValue = readSetting( unknownNodeNames[i] );
        if( settingValue.toString() == "undefined" )
        {
            settingValue = "";
        }

        if( settingValue.toString().length > 0 )
        {
            //include all of the attributes
            for ( var j=0; j<attributesToRead.length; j++)
            {
                readReq.NodesToRead[nodeNumber].NodeId = UaNodeId.fromString( settingValue.toString() );
                readReq.NodesToRead[nodeNumber].AttributeId = attributesToRead[j];
                addLog( "Reading UNKNOWN NodeId '" + readReq.NodesToRead[nodeNumber].NodeId + "'; Attribute: " + Attribute.toString( attributesToRead[j] ) +
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

    // return diagnostics
    readReq.RequestHeader.ReturnDiagnostics = 0x03FF;

    uaStatus = g_session.read( readReq, readRes );
    if( uaStatus.isGood() )
    {
        checkReadError( readReq, readRes, ExpectedOperationResultsArray );
    }
    else
    {
        addError( "Read(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( read581Err009 );
/*    Test 5.7.1-9 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given 13 nodes to browse
            And half the nodes exist
            And half the nodes result in an operation error of some type
            And at least one node does not exist
            And at least one referenceTypeId does not exist
          When Browse is called
          Then the server returns references of the existent nodes
            And appropriate status codes for the browse-failure nodes
          
          Validation is accomplished by first browsing each node individually,
          collecting the references, then browsing the nodes simultaneously and
          comparing these references to the first.

      Revision History
          2009-08-30 Dale Pope: Initial version.
          2009-11-25 NP: REVIEWED.
          2010-12-17 NP: Added initial check to continue script only if all NodeClass settings are configured.
          2011-05-18 NP: Also allowing Bad_NodeIdInvalid where Bad_NodeIdUnknown is expected.
*/

function Test571009( returnDiagnostics )
{
    // check all of the nodeClass options are configured
    if( nodeClassItems.length !== NodeIdSettings.NodeClasses().length )
    {
        addWarning( "Skipping test. Some NodeClasses are not configured. All NodeClass settings are required by this test." );
        return;
    }

    var nodeIdsToBrowse = [
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasObject" ).toString() ),
        UaNodeId.fromString( readSetting( "/Advanced/NodeIds/Invalid/UnknownNodeId1" ).toString() ),
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasVariable" ).toString() ),
        UaNodeId.fromString( readSetting( "/Advanced/NodeIds/Invalid/UnknownNodeId2" ).toString() ),
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasMethod" ).toString() ),
        UaNodeId.fromString( readSetting( "/Advanced/NodeIds/Invalid/UnknownNodeId3" ).toString() ),
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasObjectType" ).toString() ),
        UaNodeId.fromString( readSetting( "/Advanced/NodeIds/Invalid/InvalidSyntaxNodeId1" ).toString() ),
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasVariableType" ).toString() ),
        UaNodeId.fromString( readSetting( "/Advanced/NodeIds/Invalid/InvalidSyntaxNodeId2" ).toString() ),
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasReferenceType" ).toString() ),
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasObject" ).toString() ),
        UaNodeId.fromString( readSetting( "/Server Test/NodeIds/NodeClasses/HasDataType" ).toString() ),
    ];
    
    var expectedReferences = [];
    var expectedOperationResultsArray = [];

    // Browse each node individually to get expected references and expected operation status codes
    for( var i=0; i<nodeIdsToBrowse.length; i++ )
    {
        if( ( i % 2 ) == 0 )
        {
            // good node
            expectedReferences[i] = GetTest1ReferencesFromNodeId( Session, nodeIdsToBrowse[i] );
        }
        else
        {
            // bad node
            expectedOperationResultsArray[i] = new ExpectedAndAcceptedResults();
            if( i < 11 )
            {
                // set expected status codes
                expectedOperationResultsArray[i].addExpectedResult( StatusCode.BadNodeIdUnknown );
                expectedOperationResultsArray[i].addExpectedResult( StatusCode.BadNodeIdInvalid );
            }
            else
            {
                expectedOperationResultsArray[i].addExpectedResult( StatusCode.BadReferenceTypeIdInvalid );
            }
            
            expectedReferences[i] = [];

            //expectedReferences[i] = GetTest1ReferencesFromNodeId( Session, nodeIdsToBrowse[i], expectedOperationResultsArray[i] );
        }
    }

    // make request and browse
    var request = CreateTest1BrowseRequests( Session, nodeIdsToBrowse );
    request.NodesToBrowse[11].ReferenceTypeId = UaNodeId.fromString( readSetting( "/Advanced/NodeIds/Invalid/UnknownNodeId1" ).toString() );
    var response = new UaBrowseResponse();

    request.RequestHeader.ReturnDiagnostics = returnDiagnostics;

    uaStatus = Session.browse( request, response );
    
    var references = [];

    // check result
    if( uaStatus.isGood() )
    {
        AssertBrowseMixedParameter( request, response, expectedOperationResultsArray );

        // compare expected references to returned references
        if( AssertEqual( request.NodesToBrowse.length, response.Results.length, "The number of NodesToBrowse does not match the number of Results." ) )
        {
            for( var i = 0; i < response.Results.length; i++ )
            {
                if( expectedReferences[i].length > 0 )
                {
                    AssertResultHasExpectedReferences( expectedReferences[i], response.Results[i], expectedReferences[i].length )
                }
            }
        }
    }
    else
    {
        addError( "browse() failed: " + uaStatus );
    }
}

Test571009( 0 );
//Test571008( 0x3FF );
/*    Test 5.7.1-8 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given seven nodes to browse
          When Browse is called
          Then the server returns each nodes references
          
          Validation is accomplished by first browsing each node individually,
          collecting the references, then browsing the nodes simultaneously and
          comparing these references to the first.

      Revision History
          2009-08-26 Dale Pope: Initial version
          2009-11-25 NP: REVIEWED.
          2010-12-17 NP: Script now uses the "nodesToBrowse" from initialize.
*/

function Test571008( returnDiagnostics )
{
    // check all of the nodeClass options are configured
    if( nodeClassItems.length !== NodeIdSettings.NodeClasses().length )
    {
        addWarning( "Some NodeClasses are not configured and will not be tested by this script." );
    }

    var expectedReferences = [];
    
    // Browse each node individually
    for( var i = 0; i < nodesToBrowse.length; i++ )
    {
        expectedReferences[i] = GetTest1ReferencesFromNodeId( Session, nodesToBrowse[i] );
    }
    
    // make request and browse
    var request = CreateTest1BrowseRequests( Session, nodesToBrowse );
    var response = new UaBrowseResponse();

    request.RequestHeader.ReturnDiagnostics = returnDiagnostics;

    uaStatus = Session.browse( request, response );
    
    var references = [];

    // check result
    if( uaStatus.isGood() )
    {
        AssertBrowseValidParameter( request, response );

        // compare expected references to returned references
        if( AssertEqual( request.NodesToBrowse.length, response.Results.length, "The number of NodesToBrowse does not match the number of Results." ) )
        {
            for( var i = 0; i < response.Results.length; i++ )
            {
                AssertResultHasExpectedReferences( expectedReferences[i], response.Results[i], expectedReferences[i].length )
            }
        }
    }
    else
    {
        addError( "browse() failed: " + uaStatus );
    }
}

function test571008core()
{
    // check the nodesToBrowse
    if( nodesToBrowse === undefined || nodesToBrowse === null || nodesToBrowse.length === 0 )
    {
        addSkipped( "[Configuration Issue?] Unable to complete test. Check settings 'NodeClasses' category." );
        return;
    }
    Test571008( 0 );
    Test571008( 0x3FF );
}

safelyInvoke( test571008core );
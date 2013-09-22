/*  This function is responsible for validating a Node of a specific type and the validation
    that every entity of the Node is correct, per the UA Specifications.

    Revision History:
        12-Nov-2010 NP: Initial version.
*/
include( "./library/Base/assertions.js" );
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/ServiceBased/AttributeServiceSet/Read/read.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/Browse.js" );
include( "./library/Information/_Base/CttObjectHelpers.js" );
include( "./library/Information/_Base/UaRefDescHelper.js" );

String.prototype.repeat = function(num) {    return new Array(isNaN(num)? 1 : ++num).join(this);    }

var __maxNodesToTest = 0;
var __nodesCounted = 0;

var __maxNodesReached;
function endOfWalkthroughTest()
{
    if( __maxNodesReached === undefined )
    {
        addWarning( "Maximum number of nodes to test reached: " + __maxNodesToTest + ". Exiting test." );
        __maxNodesReached = true;
    }
}

function resetWalkthroughTest( newMaxValue )
{
    __maxNodesReached = undefined;
    __maxNodesToTest = newMaxValue;
    __nodesCounted = 0;
}

/* FUNCTIONS IN THIS SCRIPT:
    Public: 
        function NodeAttributesComply( nodesToTest, validationFactory )
        function NodeReferencesComply( nodesToTest, validationFactory )
        function NodeStructureIsCompliant( nodeToTest, validationSub, level )
        function ReadNode( nodesToTest )
    Private: 
        function assertReferenceInReferences( referencesToFind, referencesToSearch, indent )
*/



/*  Description: 
        Reads the ATTRIBUTES of 'nodeToTest' and compares them to the definition 
        specified by 'validationSub'.

    Arguments:
        nodesToTest:   a UaNode to test of type MONITOREDITEM. This parameter may also be an array of MONITOREDITEM.
        validationSub: a reference to an actual function containing a single argument: NodeId
*/
function NodeAttributesComply( nodesToTest, validationFactory )
{
    // validate parameters
    if( nodesToTest === undefined || nodesToTest === null ){ throw( "[NodeAttributesComply] Argument error: 'nodeToTest' not specified." ); }
    if( validationFactory === undefined || validationFactory === null ){ throw( "[NodeAttributesComply] Argument error: 'validationFactory' not specified." ); }

    var result = true;

    var expectedResults = [];
    var itemsToRead = [];
    for( var i=0; i<nodesToTest.length; i++ )
    {
        // get the applicable attributes that we need to read from the factory
        var validationSub = validationFactory( nodesToTest[i].NodeClass );

        addLog( "\nValidating ATTRIBUTES of Node '" + nodesToTest[i].NodeId + "' comply with the definition of '" + validationSub.Name + "'." );

        // specify Read options, i.e. read all Attributes defined in validationSub , this basically means 
        // that we need to take the 'nodeToTest' and clone it multiple times, once per attribute needed.
        // We also need to prepare the read to accept missing attributes, i.e. those that are OPTIONAL
        for( var a=0; a<validationSub.Attributes.length; a++ )
        {
            // clone the item and define the attribute to read on it
            var mClone = MonitoredItem.Clone( nodesToTest[i] );
            mClone.AttributeId = validationSub.Attributes[a].AttributeId;
            itemsToRead.push( mClone );
            // define the expectation for reading this attribute
            var expectedResult = new ExpectedAndAcceptedResults( StatusCode.Good );
            if( false === validationSub.Attributes[a].Required )
            {
                expectedResult.addAcceptedResult( StatusCode.BadAttributeIdInvalid );
            }
            expectedResults.push( expectedResult );
        }//for a=... (a = attributes)

        // clean-up
        Reader = null;
        validationSub = null;
    }
    // Read all of the attributes
    var Reader = new Read( g_session );
    AssertTrue( Reader.Execute( itemsToRead, TimestampsToReturn.Both, 0, expectedResults, true ), "The address space does not appear to be compliant. Check the NodeClass definition against the attributes read here for each node." );

    // clean-up
    Reader = null;
    itemsToRead = null;
    expectedResults = null;
    return( result );
}


/*  Description: 
        Browse the REFERENCES of 'nodeToTest' and compare them to the definition 
        specified by 'validationSub'.

    Arguments:
        nodesToTest:       a UaNode to test of type MONITOREDITEM. May also be an Array of MONITOREDITEM.
        validationFactory: a reference to a factory pattern object that will return the definition of the specified object.
*/
function NodeReferencesComply( nodesToTest, validationFactory )
{
    // if 'nodesToTest' is not an array, then turn it into one!
    if( nodesToTest.length === undefined ){ nodesToTest = [ nodesToTest ]; }

    // we need a browser helper
    var browseHelper = new Browse( g_session );

    // specify browse options, incl. inclSubTypes, nodeMask=unspecified, refType=hierarchical, resultMask=all;
    for( var i=0; i<nodesToTest.length; i++ )
    {
        nodesToTest[i].SetBrowseOptions( BrowseDirection.Forward, true, NodeClass.Unspecified, new UaNodeId( Identifier.References ), BrowseResultMask.All );
    }//for i... (i = item)

    // read the references for all specified nodes
    if( browseHelper.Execute( nodesToTest ) )
    {
        // recursively check each reference returned - if any
        for( var i=0; i<browseHelper.response.Results.length; i++ )
        {
            if( browseHelper.response.Results[i].References.length === 0 )
            {
                result = true;
            }
            else
            {
                // prepare a list of items to read and validate
                var nextItemSet = [];
                for( var r=0; r<browseHelper.response.Results[i].References.length; r++ )
                {
print( browseHelper.response.Results[i].References[r] );
                    // turn the reference NodeId into a MonitoredItem object because we will test it next...
                    var newMi = MonitoredItem.fromNodeIds( browseHelper.response.Results[i].References[r].NodeId.NodeId, 0 )[0];
                    newMi.NodeClass = browseHelper.response.Results[i].References[r].NodeClass;
                    nextItemSet.push( newMi );
                    // validate the references received for this item match what is expected, if any are defined!
                    var validationObject = validationFactory( browseHelper.response.Results[i].References[r].NodeClass );
                    if( validationObject !== null && validationObject.References !== undefined )
                    {
                        result = assertReferenceInReferences( validationObject.References, browseHelper.response.Results[i].References )
                    }
                }//for r... (r = References)

                // recursively dive deeper into these nodes... if the validation so far is good!
                if( result )
                {
                    result = ReadNode( nextItemSet, browseHelper );
                    if( result === null ){ break; }
                    if( !result )
                    {
                        addError( "ReadNode returned " + result );
                        break; 
                    }
                }
            }
        }// for i... (i = item)
    }
    // clean-up
    browseHelper = null;
}

/*  Description: 
        Reads the REFERENCES of 'nodeToTest' and compares its structure to the 
        definition specified by the 'validationSub' object.

    Arguments:
        nodeToTest:    a UaNode to test of type MONITOREDITEM.
        validationSub: a reference to an actual function containing a single argument: NodeId
        level:         internal use only; used for indenting messages
*/
function NodeStructureIsCompliant( nodeToTest, validationSub, level )
{
    var lv = ( level === undefined || level === null? 1 : level );
    var indent = "\t".repeat(lv);

    // validate the parameters
    if( nodeToTest === undefined || nodeToTest === null ){ throw( "[NodeStructureIsCompliant] Argument error: 'nodeToTest' not specified." ); }
    if( validationSub === undefined || validationSub === null ){ throw( "[NodeStructureIsCompliant] Argument error: 'validationSub' not specified." ); }
    if( validationSub.References === undefined || validationSub.References === null ){ throw( "[NodeStructureIsCompliant] Argument error: 'validationSub' is not of the correct type; 'References' property not found." ); }

    // specify browse options, incl. inclSubTypes, nodeMask=unspecified, refType=hierarchical, resultMask=all;
    nodeToTest.SetBrowseOptions( BrowseDirection.Forward, true, NodeClass.Unspecified, new UaNodeId( Identifier.References ), BrowseResultMask.All );

    var Browser = new Browse( g_session );

    // our return variable 
    var result = true;

    // browse all references of the target node 
    if( Browser.Execute( nodeToTest ) )
    {
        addLog( indent + "Validating " + validationSub.Name + "; received " + Browser.response.Results[0].References.length + " references." );
        // iterate thru the References returned and compare to our definition in validationSub
        for( var r=0; r<validationSub.References.length; r++ )
        {
            var currentRef = validationSub.References[r];
            var foundRefNodeId = assertReferenceInReferences( currentRef, Browser.response.Results[0].References, indent );

            // is this a nested type (sub-references)? if so, then recursively drill down further...
            if( foundRefNodeId !== null && currentRef.TypeInstance !== undefined && currentRef.TypeInstance !== null )
            {
                var subNode = MonitoredItem.fromUaRefDescHelper( foundRefNodeId.NodeId, nodeToTest.BrowseDirection, nodeToTest.IncludeSubTypes, currentRef );
                AssertTrue( NodeStructureIsCompliant( subNode, currentRef.TypeInstance, lv+1 ), currentRef.TypeInstance.Name + " object type is not compliant per the UA Specifications." );
            }
        }//for r (references)
    }
    // clean-up
    Browser = null;
    return( result );
}

/* Internal only function that serves the methods above.
   This function looks for all of the references specified in 'referencesToFind' to see if they are present in
   the parameter 'referencesToSearch'.
*/
function assertReferenceInReferences( referencesToFind, referencesToSearch, indent )
{
    var debugMsg = "Searching for Reference '";
    var result = false;
    if( referencesToFind === undefined || referencesToFind === null ){ return( result ); }
    if( referencesToSearch === undefined || referencesToSearch === null ){ return( result ); }
    // turn 'referenceToFind' into an array if itsn't already one!
    if( referencesToFind.length === undefined ){ referencesToFind = [ referencesToFind ]; }
    // iterate thru referencesToSearch looking for referenceToFind
    for( var f=0; f<referencesToFind.length; f++ )
    {
        var found = false;
        var currentlySoughtRef = referencesToFind[f];
        debugMsg += currentlySoughtRef.BrowseName;
        for( var s=0; s<referencesToSearch.length; s++ )
        {
            var currentRef = referencesToSearch[s];
            // check BrowseName (standard name, DisplayName is not important)
            if( !(currentlySoughtRef.BrowseName instanceof Array ) )
            {
                currentlySoughtRef.BrowseName = [ currentlySoughtRef.BrowseName ];
            }
            for( var b=0; b<currentlySoughtRef.BrowseName.length; b++ )
            {
                if( currentRef.BrowseName.Name == currentlySoughtRef.BrowseName[b] )
                {
                    AssertEqual( currentlySoughtRef.NodeClass, currentRef.NodeClass, "NodeClass mismatch. Expected '" + NodeClass.toString(currentlySoughtRef.NodeClass) + "' but received '" + NodeClass.toString(currentRef.NodeClass) + "'" );
                    AssertEqual( currentlySoughtRef.ReferenceTypeId, currentRef.ReferenceTypeId, "ReferenceTypeId mismatch." );
                    found = true;
                    if( referencesToFind.length === 1 )
                    {
                        result = currentRef.NodeId;
                    }
                    else
                    {
                        result = true;
                    }
                    break;
                }
            }
            if( found )break;
        }//for s... (s = searchable references)
        if( !found )
        {
            // we didn't find the reference, but is it optional?
            var msg = "The Reference (type: '" + currentlySoughtRef.ReferenceTypeId + "') could not be found containing BrowseName(s): " + currentlySoughtRef.BrowseName;
            if( currentlySoughtRef.BrowseName instanceof Array && currentlySoughtRef.BrowseName.length > 1 )
            {
                msg += " (only one would be necessary since they derive from the same type)";
            }
            if( currentlySoughtRef.Required )
            {
                msg += " , although it is required!";
                addError( msg  );
            }
            else
            {
                msg += ", but it is OPTIONAL!";
                addWarning( msg  );
                result = true;
            }
        }
    }//for f... (f = find reference);
    print( debugMsg + "' was " + ( found === true? "found" : "NOT FOUND" ) );
    return( result );
}



/* Validates a node for compliance by doing two things:
     1.) Reads the attributes of a node and validates all required attributes exist.
     2.) Reads all FORWARD references of the same node to validate all required references exist.

   Arguments:
       nodeToTest:    the MonitoredItem object that will receive testing.

    Revision History
        25-May-2011 NP: Initial version.
*/
function ReadNode( nodesToTest )
{
    // if the 'nodesToTest' parameter is not an array then turn it into one.
    if( nodesToTest.length === undefined )
    {
        nodesToTest = [ nodesToTest ];
    }
    if( __nodesCounted >= __maxNodesToTest )
    {
        endOfWalkthroughTest();
        return( true );
    }
    __nodesCounted += nodesToTest.length;
    var result = false;
    // read the item first; if it complies then read its references and follow them
    if( NodeAttributesComply( nodesToTest, factoryNodeValidator ) )
    {
        // we need a browser helper
        var browseHelper = new Browse( g_session );

        // specify Browse options, incl. inclSubTypes, nodeMask=unspecified, refType=hierarchical, resultMask=all;
        for( var i=0; i<nodesToTest.length; i++ )
        {
            nodesToTest[i].SetBrowseOptions( BrowseDirection.Forward, true, NodeClass.Unspecified, new UaNodeId( Identifier.References ), BrowseResultMask.All );
        }
        // issue the Browse call
        if( browseHelper.Execute( nodesToTest ) )
        {
            if( browseHelper.response.Results.length > 0 )
            {
                // loop thru each browseResult and follow each link (reference)
                var items = [];
                for( var br=0; br<browseHelper.response.Results.length; br++ )
                {
                    // read all child items in a single call for efficiency purposes
                    var items = [];
                    for( var r=0; r<browseHelper.response.Results[br].References.length; r++ )
                    {
                        // turn the reference NodeId into a MonitoredItem object
                        var newMi = MonitoredItem.fromNodeIds( browseHelper.response.Results[br].References[r].NodeId.NodeId, 0 )[0];
                        newMi.SetBrowseOptions( BrowseDirection.Forward, true, browseHelper.response.Results[br].References[r].NodeClass, new UaNodeId( Identifier.References ), BrowseResultMask.All );
                        items.push( newMi );
                    }// for r (r = references)
                    if( items.length > 0 )
                    {
                        result = ReadNode( items, browseHelper );
                        if( !result )
                        {
                            break; 
                        }
                    }
                    result = true; // [DEBUG NP] not sure if this is the right place yet.
                }//for br... (br = Browse Result) 
            }
        }
        // clean-up
        browseHelper = null;
        if( nodesToTest.length > 0 && __nodesCounted < __maxNodesToTest )
        {
            NodeReferencesComply( nodesToTest, factoryNodeValidator );
        }
    }
    AssertTrue( result, "Expected validation of " + nodesToTest.length + " nodes to succeed." );
    return( result );
}
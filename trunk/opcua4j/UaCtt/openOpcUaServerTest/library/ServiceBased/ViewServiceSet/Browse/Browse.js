/*  Browse Service call helper object. This object is intended to reduce the level of scripting required for testing
    of the Browse service to just 1 line of code.
    Test code at the bottom of this file demonstrates the use of this class.

    Properties:
        - session:    A live UA Session that will be used to invoke the Browse service call.
        - request:    The current (last used) BrowseRequest object.
        - response:   The current (last received) BrowseResponse object.

    Methods: 
        - Execute:         Invokes the Browse service call.
        - ResultsToString: Returns the Browse response details in a string.

    Revision History
        17-Dec-2010 NP: Initial version.
*/

include( "./library/ServiceBased/ViewServiceSet/Browse/check_browse_valid.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/check_browse_error.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/check_browse_failed.js" );

function Browse( session )
{

    this.session  = session;
    this.request  = null;
    this.response = null;
    this.uaStatus = null;

    if( arguments.length < 1 ) { throw( "Invalid use of the Browse helper method. A session object must be specified when instanciating this class helper." ); }

    /* Invokes the call to Browse.
        Parameters: 
            - nodesToBrowse:    a node or an array of MonitoredItem objects to Browse
            - maxRefsToReturn:  max # of references to return.
            - view:             view (a UaViewDescription object).
            - expectedErrors:   expected results, can be 1 or an array of...
            - expectErrorNotFail: boolean specifying if browse should fail, or values within */
    this.Execute = function( nodesToBrowse, maxRefsToReturn, view, expectedErrors, expectErrorNotFail  )
    {
        // create the request/response objects
        this.request = new UaBrowseRequest();
        this.response = new UaBrowseResponse();
        this.session.buildRequestHeader( this.request.RequestHeader );
        // populate the request header with the specified parameters
        if( nodesToBrowse !== undefined && nodesToBrowse !== null )
        {
            // configure the BrowseNext request
            if( maxRefsToReturn === undefined || maxRefsToReturn === null ){ maxRefsToReturn = 0; }
            this.request.RequestedMaxReferencesPerNode = maxRefsToReturn;
            if( view !== undefined && view !== null )
            {
                this.request.View = view;
            }
            // if nodes to Browse is not an array, force it to become an array.
            if( nodesToBrowse.length === undefined )
            {
                nodesToBrowse = [nodesToBrowse];
            }
            print( "Creating BROWSE request:" );
            // now loop through all nodes to browse and build UaBrowseDescription objects
            for( var n=0; n<nodesToBrowse.length; n++ )
            {
                // create the browseDescription object for this monitoredItem
                var uaBD = new UaBrowseDescription();
                uaBD.NodeId = nodesToBrowse[n].NodeId;
                if( nodesToBrowse[n].BrowseDirection !== undefined && nodesToBrowse[n].BrowseDirection !== null ){ uaBD.BrowseDirection = nodesToBrowse[n].BrowseDirection; }
                if( nodesToBrowse[n].IncludeSubtypes !== undefined && nodesToBrowse[n].IncludeSubtypes !== null ){ uaBD.IncludeSubtypes = nodesToBrowse[n].IncludeSubtypes; }
                if( nodesToBrowse[n].NodeClassMask   !== undefined && nodesToBrowse[n].NodeClassMask   !== null ){ uaBD.NodeClassMask   = nodesToBrowse[n].NodeClassMask; }
                if( nodesToBrowse[n].ReferenceTypeId !== undefined && nodesToBrowse[n].ReferenceTypeId !== null ){ uaBD.ReferenceTypeId = nodesToBrowse[n].ReferenceTypeId; }
                if( nodesToBrowse[n].ResultMask      !== undefined && nodesToBrowse[n].ResultMask      !== null ){ uaBD.ResultMask      = nodesToBrowse[n].ResultMask; }
                // add this browseDescription to the request
                print( "\t[" + n + "] NodeId: " + uaBD.NodeId
                    + "; BrowseDirection: " + BrowseDirection.toString( uaBD.BrowseDirection )
                    + "; IncludeSubtypes: " + uaBD.IncludeSubtypes
                    + "; NodeClassMask: " + uaBD.NodeClassMask
                    + "; ReferenceTypeId: " + uaBD.ReferenceTypeId
                    + "; ResultMask: " + BrowseResultMask.toString( uaBD.ResultMask ) );
                this.request.NodesToBrowse[n] = uaBD;
            }//for n
            print( "Created " + this.request.NodesToBrowse.length + " Request.NodesToBrowse objects. Invoking BROWSE..." );

            // now to invoke Browse 
            this.uaStatus = this.session.browse( this.request, this.response );

            // now to check the results
            var result = false;
            if( this.uaStatus.isGood() )
            {
                if( expectErrorNotFail === undefined )
                {
                    result = checkBrowseValidParameter( this.request, this.response );
                }
                else
                {
                    if( expectErrorNotFail )
                    {
                        result = checkBrowseError( this.request, this.response, expectedErrors );
                    }
                    else
                    {
                        result = checkBrowseFailed( this.request, this.response, expectedErrors );
                    }
                }
            }
            else
            {
                addError( "Browse() status " + this.uaStatus, this.uaStatus );
            }

            // now to record any continuationPoints into the monitoredItem objects
            if( this.uaStatus.isGood() )
            {
                for( i=0; i<this.response.Results.length; i++ )
                {
                    nodesToBrowse[i].ContinuationPoint = this.response.Results[i].ContinuationPoint;
                }//for i
            }

            return( result );
        }
    }//Execute
    
    this.ResultsToString = function()
    {
        var s = "Browse Response:\n\tDiagnosticInfos:";
        // get the diags
        if( this.response.DiagnosticInfos.length > 0 )
        {
            for( var d=0; d<this.response.DiagnosticInfos.length; d++ )
            {
                s += "\n\t\t" + this.response.DiagnosticInfos[d].toString();
            }//for s...
        }
        else{ s += "\n\t\tNone."; }
        // get the results
        s += "\n\tResults:";
        if( this.response.Results.length > 0 )
        {
            var currResult;
            // loop thru each result
            for( var r=0; r<this.response.Results.length; r++ )
            {
                currResult = this.response.Results[r]
                s += "\n\t[" + r + "] Status: " + currResult.StatusCode.toString() +
                    "; ContinuationPoint: " + currResult.ContinuationPoint.toString() +
                    "; References: " + currResult.References.length;
                // loop thru all references 
                var currRef;
                for( var f=0; f<currResult.References.length; f++ )
                {
                    currRef = currResult.References[f];
                    s += "\n\t\t[" + f + "] BrowseName: " + currRef.BrowseName.Name +
                        "; IsForward: " + currRef.IsForward +
                        "; NodeClass: " +  NodeClass.toString( currRef.NodeClass ) +
                        "; NodeId: " + currRef.NodeId.toString() +
                        "; ReferenceType: " + currRef.ReferenceTypeId;
                }//for f
            }//for r...
        }
        else{ s+= "\n\t\tNone." }
        return( s );
    }

}// Browse

// test code
/*
include( "./library/Base/connect.js" );
include( "./library/Base/disconnect.js" );
include( "./library/Base/Objects/monitoredItem.js" );
include( "./library/Base/Objects/expectedResults.js" );
// create a monitoredItem object for browsing
var m1 = MonitoredItem.fromSetting( "/Server Test/NodeIds/References/Has 3 Forward References 1" );
// helper function to quickly set parameter values for browsing
m1.SetBrowse( BrowseDirection.Both, true, 0xff, null, 0x3f );
// connect to a ua server
var channel = new UaChannel();
var session = new UaSession( channel );
if( !connect( channel, session ) )
{
    addError( "Connect failed. Stopping execution of current conformance unit." );
    return;
}
// set the expected results and then invoke Browse 
var er = [ new ExpectedAndAcceptedResults( StatusCode.Good ) ];
var b = new Browse( session );
b.Execute( m1, er, true );    // "true" parameter = compare results with expectations; false = compare service code with expectations.
// disconnect from server
disconnect( channel, session );
// clean-up
session = null;
channel = null;
*/
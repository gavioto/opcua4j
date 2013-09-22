/*  BrowseNext Service call helper object. This object is intended to reduce the level of scripting required for testing
    of the BrowseNext service to just 1 line of code.
    Test code at the bottom of this file demonstrates the use of this class.

    Properties:
        - session:    A live UA Session that will be used to invoke the Browse service call.
        - request:    The current (last used) BrowseNextRequest object.
        - response:   The current (last received) BrowseNextResponse object.

    Methods: 
        - Execute:         Invokes the BrowseNext service call.
        - ResultsToString: Returns the BrowseNext response details in a string.

    Revision History
        06-Dec-2010 NP: Initial version.
*/

include( "./library/ServiceBased/ViewServiceSet/BrowseNext/check_browseNext_valid.js" );
include( "./library/ServiceBased/ViewServiceSet/BrowseNext/check_browseNext_error.js" );
include( "./library/ServiceBased/ViewServiceSet/BrowseNext/check_browseNext_failed.js" );

function BrowseNext( session )
{

    this.session  = session;
    this.request  = null;
    this.response = null;
    this.uaStatus = null;

    if( arguments.length < 1 ) { throw( "Invalid use of the BrowseNext helper method. A session object must be specified when instanciating this class helper." ); }

    /* Invokes the call to BrowseNext.
        Parameters: 
            - continuationPoints: an array of MonitoredItem objects to Browse
            - releaseCPs:         release continuationPoints? (boolean)
            - expectedErrors:     expected results, can be 1 or an array of...
            - expectErrorNotFail: boolean specifying if browse should fail, or values within */
    this.Execute = function( continuationPoints, releaseCPs, expectedErrors, expectErrorNotFail  )
    {
        // create the request/response objects
        this.request = new UaBrowseNextRequest();
        this.response = new UaBrowseNextResponse();
        this.session.buildRequestHeader( this.request.RequestHeader );
        // populate the request header with the specified parameters
        if( continuationPoints !== undefined && continuationPoints !== null )
        {
            // if nodes to Browse is not an array, force it to become an array.
            if( continuationPoints.length === undefined )
            {
                continuationPoints = [continuationPoints];
            }
            if( releaseCPs === undefined || releaseCPs === null ){ releaseCPs = false; }
            print( "Creating BROWSENEXT request (releaseContinuationPoints: " + releaseCPs + "):" );
            this.request.ReleaseContinuationPoints = releaseCPs;
            // now loop through all nodes to browse and build UaBrowseDescription objects
            for( var n=0; n<continuationPoints.length; n++ )
            {
                this.request.ContinuationPoints[n] = continuationPoints[n].ContinuationPoint;
                // add this browseDescription to the request
                print( "\t[" + n + "] NodeId: " + continuationPoints[n].NodeId
                    + "; ContinuationPoint: " + continuationPoints[n].ContinuationPoint );
            }//for n

            // now to invoke Browse 
            this.uaStatus = this.session.browseNext( this.request, this.response );

            // now to check the results
            var result = false;
            if( this.uaStatus.isGood() )
            {
                if( expectErrorNotFail === undefined )
                {
                    result = checkBrowseNextValidParameter( this.request, this.response );
                }
                else
                {
                    if( expectErrorNotFail )
                    {
                        result = checkBrowseNextError( this.request, this.response, expectedErrors );
                    }
                    else
                    {
                        result = checkBrowseNextFailed( this.request, this.response, expectedErrors );
                    }
                }
            }
            else
            {
                addError( "BrowseNext() status " + this.uaStatus, this.uaStatus );
            }

            // now to record any continuationPoints into the monitoredItem objects
            if( this.uaStatus.isGood() )
            {
                for( i=0; i<this.response.Results.length; i++ )
                {
                    continuationPoints[i].ContinuationPoint = this.response.Results[i].ContinuationPoint;
                }//for i
            }

            return( result );
        }
    }//Execute
    
    this.ResultsToString = function()
    {
        var s = "BrowseNext Response:\n\tDiagnosticInfos:";
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

}// BrowseNext
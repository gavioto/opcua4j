include( "./library/base/Objects/expectedResults.js" );
include( "./library/ServiceBased/AttributeServiceSet/Read/check_read_error.js" );

const SUPPRESS_SESSIONNAME_VALIDATION = true;

/*
    Revision History:
        21-Nov-2009 NP: REVIEWED.
        04-Dec-2009 DP: Added check for NodeClass of the session node.
*/
function MinimumParallelSessions( sessions, count )
{
    var createSessionRequest = [];
    var createSessionResponse = [];
    var succeeded = true;
    var diagsSupported;

    for( var ii = 0; ii < count; ii++ )
    {
        createSessionRequest[ii] = CreateDefaultCreateSessionRequest( sessions[ii] );
        createSessionResponse[ii] = new UaCreateSessionResponse();

        print( "Creating session " + ( ii + 1 ) + " Name: " + createSessionRequest[ii].SessionName + " ..." );
        var uaStatus = sessions[ii].createSession( createSessionRequest[ii], createSessionResponse[ii] );
        print( "CreateSession (iteration #" + ii + ") returned a SessionId of: " + createSessionResponse[ii].SessionId );
        if( uaStatus.isGood() )
        {
            if( !checkCreateSessionValidParameter( sessions[ii], createSessionRequest[ii], createSessionResponse[ii], SUPPRESS_SESSIONNAME_VALIDATION ) )
            {
                break;
            }
            else
            {
                if ( activateSession( sessions[ii] ) )
                {
                    sessions[ii].Connected = true;
                    var readRequest = new UaReadRequest();
                    var readResponse = new UaReadResponse();
                    sessions[ii].buildRequestHeader( readRequest.RequestHeader );

                    readRequest.NodesToRead[0].NodeId = createSessionResponse[ii].SessionId;
                    readRequest.NodesToRead[0].AttributeId = Attribute.BrowseName;
                    readRequest.NodesToRead[1].NodeId = createSessionResponse[ii].SessionId;
                    readRequest.NodesToRead[1].AttributeId = Attribute.NodeClass;
                    uaStatus = sessions[ii].read( readRequest, readResponse );

                    if ( uaStatus.isBad() )
                    {
                        addError( "Read() status " + uaStatus, uaStatus );
                    }
                    else
                    {
                        if( diagsSupported === undefined || diagsSupported === true )
                        {
                            // the read may succeed or fail if session diagnostics are not supported
                            var anticipatedResults = [ new ExpectedAndAcceptedResults( StatusCode.Good ) ];
                            anticipatedResults[0].addExpectedResult( StatusCode.BadNodeIdUnknown );
                            anticipatedResults[1] = new ExpectedAndAcceptedResults( StatusCode.Good );
                            anticipatedResults[1].addExpectedResult( StatusCode.BadNodeIdUnknown );
                            succeeded = checkReadError( readRequest, readResponse, anticipatedResults, true );      
                            if ( succeeded )
                            {
                                // not supported?
                                if( readResponse.Results[0].StatusCode.StatusCode === StatusCode.BadNodeIdUnknown )
                                {
                                    addNotSupported( "Session Diagnostics" );
                                    diagsSupported = false;
                                    continue;
                                }
                                AssertEqual( NodeClass.Object, readResponse.Results[1].Value.toInt32(), "NodeClass of the session node is not Object" );
                                succeeded = !readResponse.Results[0].Value.isEmpty();
                                if ( !succeeded )
                                {
                                    addError( "CreateSession: Browse name of session diagnostic object is empty." );
                                }
                                else
                                {
                                    var sessionName = readResponse.Results[0].Value.toQualifiedName();
                                    if ( sessionName.Name != "" )
                                    {
                                        addLog( "Session name is: " + sessionName.Name);
                                    }
                                    else
                                    {
                                        addError( "CreateSession: session name is empty." );
                                    }
                                }
                            }//if read succeeded
                        }//if diags supported
                    }
                }
                else
                {
    //                closeSession( sessions[ii] );
    //                sessions[ii] = null;
                }
            }
        }
        else
        {
            addError( "CreateSession() status " + uaStatus, uaStatus );
            break;
        }
    }
}
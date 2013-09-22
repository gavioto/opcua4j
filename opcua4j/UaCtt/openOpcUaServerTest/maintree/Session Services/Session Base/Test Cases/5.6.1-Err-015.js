/*  CreateSession 5.6.1 Error test #15. Prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Invoke any service call after CreateSession without previously activating the session.
        Expects “Bad_SessionNotActivated” or “Bad_SessionClosed”.

    Revision History
        14-Oct-2009 NP: Initial version.
        05-Nov-2009 NP: Revised to use new script objects.
        23-Nov-2009 NP: REVIEWED. ON PAPER THE SCRIPT IS PERFECT, BUT TEST RESULT INDICATES ACTIVATESESSION IS BEING CALLED SOMEWHERE!
        04-Dec-2009 DP: Thought checking of Read return value may be incorrect; added
                        alternative but did not replace current check.
        04-Mar-2010 RTD: The service result for the Read service call was not being verified correctly.
          activateSession() used to handle security parameters in the ActivateSession service.
        10-Dec-2010 NP: Added more info to show Read results, if read is permitted. Also added more info if Session can be activated after a hijack attempt.
                        Also, changed CloseSession to expect Bad_SessionIdInvalid instead of Bad_SessionClosed per Part 4 clause 5.6.4.3 table 26.
        03-Feb-2011 NP: Bad_SessionClosed is now Expected (additionally) vs. Accepted (as was previously).

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.6.1.
*/

include( "./library/Base/safeInvoke.js" );
include( "./library/Base/Objects/expectedResults.js" );
include( "./library/ServiceBased/AttributeServiceSet/Read/check_read_failed.js" );

function createSession561Err015()
{
    var item = MonitoredItem.fromSetting( NodeIdSettings.GetAScalarStaticNodeIdSetting("iud").name, 0 );
    if( item == undefined || item == null )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    var createSessionRequest = CreateDefaultCreateSessionRequest( g_session );
    var createSessionResponse = new UaCreateSessionResponse();

    var uaStatus = g_session.createSession( createSessionRequest, createSessionResponse );

    if( uaStatus.isGood() )
    {
        if( checkCreateSessionValidParameter( g_session, createSessionRequest, createSessionResponse, true ) )
        {
            var readRequest  = new UaReadRequest();
            var readResponse = new UaReadResponse();
            g_session.buildRequestHeader( readRequest.RequestHeader );

            readRequest.TimestampsToReturn = TimestampsToReturn.Both;
            readRequest.MaxAge = 100;

            readRequest.NodesToRead[0].NodeId      = item.NodeId;
            readRequest.NodesToRead[0].AttributeId = Attribute.Value;

            uaStatus = g_session.read( readRequest, readResponse );
            expectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadSessionNotActivated );
            checkReadFailed( readRequest, readResponse, expectedServiceResult );
            //print the results so we can see them:
            if( readResponse.ResponseHeader.ServiceResult.isGood() )
            {
                var readErr = "Read was successful even though the Session was not activated.";
                for( var i=0; i<readResponse.Results.length; i++ )
                {
                    readErr += "\n\tResult[" + i + "].Value=" + readResponse.Results[i].Value.toString() + "; StatusCode: " + readResponse.Results[i].StatusCode;
                }
                addError( readErr );
            }

            // verify the session can no longer be used
            var expectedResults = new ExpectedAndAcceptedResults( StatusCode.BadSessionIdInvalid );
            expectedResults.addExpectedResult( StatusCode.BadSessionClosed );
            var activated = activateSession( g_session, null, expectedResults, false );
            if( activated == true )
            {
                if( activateSessionResponse.ResponseHeader.ServiceResult.isGood() )
                {
                    addError( "The server allowed the session to be created, even though an attempt was made to use without activation. It should close it and generate new Id." );
                    closeSession( g_session );
                }
            }
        }
    }
    else
    {
        addError( "CreateSession() status " + uaStatus, uaStatus );
    }
}

safelyInvoke( createSession561Err015 );
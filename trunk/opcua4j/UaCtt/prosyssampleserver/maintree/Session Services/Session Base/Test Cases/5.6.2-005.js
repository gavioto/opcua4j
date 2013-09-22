/*  Test 5.6.2 Test 5 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        activate a session that has been transferred to another channel.

    Revision History
        06-Oct-2008 NP: Initial version.
        24-Nov-2009 NP: REVIEWED/INCOMPLETE.
        26-Mar-2010 NP: Added security checks to add more info if using Secured channel.
                        Revised to use 'closeSession' helper.
        30-Nov-2010 NP: Set session timeout to use value from settings
*/

include( "./library/Base/safeInvoke.js" );
include( "./library/ServiceBased/ViewServiceSet/Browse/get_default_request.js" );

function activateSession562005()
{
    // activate a session on the first channel
    var session = new UaSession( g_channel );
    session.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );

    if( createSession( session ) )
    {
        if ( activateSession( session ) )
        {
            // create the new channel
            var channel2 = new UaChannel();
            if ( connectChannel( channel2 ) )
            {
                var session2 = new UaSession( channel2 );
                session2.AuthenticationToken = session.AuthenticationToken;
                session2.DefaultTimeoutHint = parseInt( readSetting( "/Ua Settings/Session/DefaultTimeoutHint" ) );
                session2.ServerNonce.append( session.ServerNonce );
                session2.SessionId = session.SessionId;

                // transfer the session to the new channel
                if ( activateSession( session2 ) )
                {
                    // invoke a browse call to test the server
                    var ids = new UaNodeIds();
                    ids[0] = new UaNodeId();
                    ids[0].setIdentifierNumeric( Identifier.RootFolder );
                    var browseRequest = CreateDefaultBrowseRequests( session, ids );
                    var browseResponse = new UaBrowseResponse();
                    session.buildRequestHeader( browseRequest.RequestHeader );
                    var status = session.browse( browseRequest, browseResponse );
                    if ( status.isGood() )
                    {
                        AssertStatusCodeIs( StatusCode.BadSecureChannelIdInvalid, browseResponse.ResponseHeader.ServiceResult, "Server accepted call on the wrong channel!" );
                    }
                    else
                    {
                        addError( "Browse() status " + status, status );
                    }
                    
                    // close the session using the new channel
                    closeSession( session2 );
                }
                else
                {
                    // session transfer failed, close it using the old channel
                    closeSession( session );
                }
                disconnectChannel( channel2 );
            }
        }
    }

}

safelyInvoke( activateSession562005 );
/*  Prepared by Ronaldo T. Duarte ronaldotd@smar.com.br

    Description:
        Use unsupported locale id.

    Revision History:
        27-Aug-2009 RTD: Initial version.
        23-Nov-2009 NP: REVIEWED.

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.5.1.
*/

function findServers551009()
{
    // read the locale id array.
    var localeChannel = new UaChannel();
    var localeSession = new UaSession( localeChannel );   
    var connected = connect( localeChannel, localeSession );
    if ( !connected )
    {
        addError( "Connect()" );      
    }
    else
    {  
        var localeReadRequest = new UaReadRequest();
        var localeReadResponse = new UaReadResponse();
        var succeeded = true;
        localeSession.buildRequestHeader( localeReadRequest.RequestHeader );

        localeReadRequest.MaxAge = 0;
        localeReadRequest.TimestampsToReturn = TimestampsToReturn.Both;
        localeReadRequest.NodesToRead[0].NodeId = new UaNodeId( Identifier.Server_ServerCapabilities_LocaleIdArray, 0 );
        localeReadRequest.NodesToRead[0].AttributeId = Attribute.Value;
        var uaStatus = localeSession.read( localeReadRequest, localeReadResponse );

        disconnect( localeChannel, localeSession );
        if ( uaStatus.isBad() )
        {
            addError( "Read() status " + uaStatus, uaStatus );        
        }
        else
        {
            succeeded = checkReadValidParameter( localeReadRequest, localeReadResponse );      
            if ( succeeded )
            {
                succeeded = ( localeReadResponse.Results[0].Value.DataType !== BuiltInType.Null );
                if ( !succeeded )
                {
                    addError( "FindServers() Locale ID array is null" );
                }
                else
                {
                    print( "\n\n\n*** Success reading Locales, now to select one that doesn't exist..." );
                    // now filter using one unsupported locale id.
                    var findServersRequest = CreateDefaultFindServersRequest();
                    var findServersResponse = new UaFindServersResponse();
                    //var supportedLocales = ["en", "de"];  // debug code
                    var supportedLocales = null;
                    if( localeReadResponse.Results[0].Value.ArrayType === 1 )
                    {
                        supportedLocales = localeReadResponse.Results[0].Value.toString();
                    }
                    else
                    {
                        supportedLocales = localeReadResponse.Results[0].Value.toStringArray();
                    }
                    print( "\n\n\n*** About to call GetUnsupportedLocale..." );
                    print( "Supported Locales currently shows:\n\t" + supportedLocales );
                    findServersRequest.LocaleIds[0] = GetUnsupportedLocale( supportedLocales );
    
                    uaStatus = g_discovery.findServers( findServersRequest, findServersResponse );
                    if ( uaStatus.isGood() )
                    {
                        succeeded = checkFindServersValidParameter( findServersRequest, findServersResponse );
                        if ( succeeded )
                        {
                            // check that server returns at least its own description with a default locale.
                            if ( findServersResponse.Servers.length > 0 )
                            {
                                for ( var jj=0; jj<findServersResponse.Servers.length; jj++ )
                                {
                                    var description = findServersResponse.Servers[jj];
                                    addLog( "Application name #" + jj + ": locale: \"" + description.ApplicationName.Locale + "\" text: \"" + description.ApplicationName.Text + "\"" );
                                }
                            }
                            else
                            {
                                addError( "FindServers() no default locale returned" );
                            }              
                        }
                    }
                    else
                    {
                        addError( "FindServers() status " + uaStatus, uaStatus );    
                    }
                }
            }
        }
    }
}

safelyInvoke( findServers551009 );
/*  Prepared by Ronaldo T. Duarte ronaldotd@smar.com.br

    Description:
        List with supported and unsupported locales.

    Revision History:
        04-Sep-2009 RTD: Initial version.
        23-Nov-2009 NP: REVIEWED.

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.5.1.
*/

function findServers551004()
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
            addError( "Read() failed", uaStatus );        
        }
        else
        {
            succeeded = checkReadValidParameter( localeReadRequest, localeReadResponse );      
            if ( succeeded )
            {
                succeeded = localeReadResponse.Results[0].Value.DataType !== BuiltInType.Null;
                // or with new version of CTT
                //succeeded = !localeReadResponse.Results[0].Value.isEmpty();
                if ( !succeeded )
                {
                    addError( "FindServers() Locale ID array is empty" );
                }
                else
                {
                    // now filter using one unsupported locale id.
                    var findServersRequest = CreateDefaultFindServersRequest();
                    var findServersResponse = new UaFindServersResponse();
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

                    //var supportedLocales = ["en", "de"];  // debug code
                    supportedLocales = CreateSupportedLocaleArray( supportedLocales, supportedLocales.length - 1 );
                    var unsupportedLocale = GetUnsupportedLocale( supportedLocales );

                    findServersRequest.LocaleIds[0] = unsupportedLocale;
                    var expectedLocale;
                    for ( var ii = 0; ii < supportedLocales.length; ii++ )
                    {
                        if ( ii === 0 )
                        {
                            expectedLocale = supportedLocales[ii];
                        }
                        findServersRequest.LocaleIds[ii + 1] = supportedLocales[ii];
                    }

                    uaStatus = g_discovery.findServers( findServersRequest, findServersResponse );
                    if ( uaStatus.isGood() )
                    {
                        succeeded = checkFindServersValidParameter( findServersRequest, findServersResponse );
                        if ( succeeded )
                        {
                            // check that server returns at least its own description with a default locale.
                            if ( findServersResponse.Servers.length === 0 )
                            {
                                addError( "FindServers() no server description returned" );
                            }
                            else
                            {
                                addLog( "Expected locale for localized application names: \"" + expectedLocale + "\"." );
                                for ( var jj = 0; jj < findServersResponse.Servers.length; jj++ )
                                {
                                    var description = findServersResponse.Servers[jj];
                                    addLog( "Application name #" + jj + ": locale: \"" + description.ApplicationName.Locale + "\" text: \"" + description.ApplicationName.Text + "\"" );
                                    if ( description.ApplicationName.Locale.length > 0 && description.ApplicationName.Locale != expectedLocale )
                                    {
                                        addWarning( "Returned locale is not the expected one." );
                                    }
                                }
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

safelyInvoke( findServers551004 );
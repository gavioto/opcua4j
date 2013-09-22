/*  Prepared by Ronaldo T. Duarte ronaldotd@smar.com.br

    Description:
        Provide a list of supported locales.

    Revision History:
        03-Sep-2009 RTD: Initial version.
        23-Nov-2009 NP: REVIEWED.

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.5.1.
*/

function findServers551010()
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
                //succeeded = true; // debug code.
                if ( !succeeded )
                {
                    addError( "FindServers() Locale ID array is null" );
                }
                else
                {
                    // Now filter using several combinations of supported locales.
                    var supportedLocales = null;
                    supportedLocales = localeReadResponse.Results[0].Value.toStringArray();
                    print( "\n\n\n*** About to call GetUnsupportedLocale..." );
                    print( "Supported Locales currently shows:\n\t" + supportedLocales );

                    //var supportedLocales = ["en", "de"];  // debug code
                    var numberOfSupportedLocales = supportedLocales.length;

                    for ( var ii=0; ii<numberOfSupportedLocales; ii++ )
                    {            
                        var findServersRequest = CreateDefaultFindServersRequest();
                        var findServersResponse = new UaFindServersResponse();
                        findServersRequest.LocaleIds = CreateSupportedLocaleArray( supportedLocales, ii );
                        var expectedLocale = findServersRequest.LocaleIds[0];

                        uaStatus = g_discovery.findServers( findServersRequest, findServersResponse );
                        if ( uaStatus.isGood() )
                        {
                            succeeded = checkFindServersValidParameter( findServersRequest, findServersResponse );
                            if ( succeeded )
                            {
                                // check that server returns at least its own description with a default locale.
                                if ( findServersResponse.Servers.length > 0 )
                                {
                                    addLog( "Expected locale for localized application names: \"" + expectedLocale + "\"." );
                                    for ( var jj = 0; jj < findServersResponse.Servers.length; jj++ )
                                    {
                                        var description = findServersResponse.Servers[jj];
                                        addLog( "Application name #" + jj + ": locale: \"" + description.ApplicationName.Locale + "\" text: \"" + description.ApplicationName.Text + "\"" );
                                        if ( description.ApplicationName.Locale.length > 0 && description.ApplicationName.Locale !== expectedLocale )
                                        {
                                            addWarning("Returned locale is not the expected one." );
                                        }
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
}

safelyInvoke( findServers551010 );
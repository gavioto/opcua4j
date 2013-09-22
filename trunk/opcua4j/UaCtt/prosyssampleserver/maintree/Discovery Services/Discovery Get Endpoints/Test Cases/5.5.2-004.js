/*  Prepared by Ronaldo T. Duarte ronaldotd@smar.com.br

    Description:
        List with supported and unsupported locales.
    Revision History
        15-Sep-2009 RTD Initial version
        19-Nov-2009 UJ: REVIEWED

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.5.2.
*/

function getEndpoints552004()
{
    // read the locale id array.
    var localeChannel = new UaChannel();
    var localeSession = new UaSession( localeChannel );
    var connected = connect( localeChannel, localeSession );
    
    if ( !connected )
    {
        addError( "Connect()" );
        return;
    }
    
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
            succeeded = localeReadResponse.Results[0].Value.DataType !== BuiltInType.Null;
            //succeeded = true; // debug code.
            if ( !succeeded )
            {
                addError( "FindServers: Locale ID array is empty." );
            }
            else
            {
                // now filter using one unsupported locale id.
                var getEndpointsRequest = CreateDefaultGetEndpointsRequest();
                var getEndpointsResponse = new UaGetEndpointsResponse();
                var supportedLocales = localeReadResponse.Results[0].Value.toStringArray();
                //var supportedLocales = ["en", "de"];  // debug code                    
                supportedLocales = CreateSupportedLocaleArray( supportedLocales, supportedLocales.length - 1 );
                var unsupportedLocale = GetUnsupportedLocale( supportedLocales );

                getEndpointsRequest.LocaleIds[0] = unsupportedLocale;
                var expectedLocale;
                for (var ii = 0; ii < supportedLocales.length; ii++)
                {
                    if (ii === 0)
                    {
                        expectedLocale = supportedLocales[ii];
                    }
                    getEndpointsRequest.LocaleIds[ii + 1] = supportedLocales[ii];
                }

                uaStatus = g_discovery.getEndpoints(getEndpointsRequest, getEndpointsResponse);

                if (uaStatus.isGood())
                {
                    succeeded = checkGetEndpointsValidParameter(getEndpointsRequest, getEndpointsResponse);
                    if (succeeded)
                    {
                        // check that server returns at least one endpoint.
                        if ( getEndpointsResponse.Endpoints.length === 0 )
                        {
                            addError( "GetEndpoints: no endpoint returned." );
                        }
                        else
                        {
                            addLog("Expected locale for localized application names: \"" + expectedLocale + "\".");
                            for (var jj = 0; jj < getEndpointsResponse.Endpoints.length; jj++)
                            {
                                var description = getEndpointsResponse.Endpoints[jj];
                                addLog("Application name #" + jj + ": locale: \"" + description.Server.ApplicationName.Locale + "\" text: \"" + description.Server.ApplicationName.Text + "\"");
                                if (description.Server.ApplicationName.Locale.length > 0 && description.Server.ApplicationName.Locale != expectedLocale)
                                {
                                    addWarning("Returned locale is not the expected one.");
                                }
                            }
                        }
                    }
                }
                else
                {
                    addError( "GetEndpoints() status " + uaStatus, uaStatus );    
                }
            }
        }
    }
}

safelyInvoke( getEndpoints552004 );
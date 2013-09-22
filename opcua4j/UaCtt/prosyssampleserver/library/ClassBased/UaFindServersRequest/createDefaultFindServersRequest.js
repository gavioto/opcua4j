/*  Prepared by Ronaldo T. Duarte ronaldotd@smar.com.br

    Description:
        Creates the default FindServers request.

    Revision History:
        18-Aug-2009 RTD: Initial version.
        23-Nov-2009 NP:  REVIEWED.
*/

include( "./library/ClassBased/UaRequestHeader/createDefaultRequestHeader.js" );

function CreateDefaultFindServersRequest()
{
  var request = new UaFindServersRequest();

  request.EndpointUrl = readSetting( "/Server Test/Discovery URL" );
  request.LocaleIds = new UaStrings();
  request.RequestHeader = CreateDefaultRequestHeader();
  request.ServerUris = new UaStrings();

  return request;
}
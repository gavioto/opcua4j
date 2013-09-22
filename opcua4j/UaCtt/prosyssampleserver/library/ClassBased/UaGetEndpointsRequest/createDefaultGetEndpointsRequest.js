/*  Prepared by Ronaldo T. Duarte ronaldotd@smar.com.br

    Description:
        Creates the default GetEndpoints request.
    Revision History
        04-Sep-2009 RTD Initial version
*/

include("./library/ClassBased/UaRequestHeader/createDefaultRequestHeader.js");

function CreateDefaultGetEndpointsRequest()
{
  var request = new UaGetEndpointsRequest();
  
  request.EndpointUrl = readSetting("/Server Test/Discovery URL");
  request.LocaleIds = new UaStrings();
  request.RequestHeader = CreateDefaultRequestHeader();
  request.ProfileUris = new UaStrings();
  
  return request;
}
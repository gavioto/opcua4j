/*  Prepared by Ronaldo T. Duarte ronaldotd@smar.com.br

    Description:
        Creates the default request header.
    Revision History
        18-Aug-2009 RTD Initial version

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.4.
*/

var RequestHandle = 1;

function CreateRequestHandle()
{
  var handle = RequestHandle++;
  if (RequestHandle >= 1000000)
  {
    RequestHandle = 1;
  }
  return handle;
}

function CreateDefaultRequestHeader()
{
   header = new UaRequestHeader();
   
   header.AdditionalHeader = new UaExtensionObject();
   header.AuditEntryId = "";
   header.AuthenticationToken = new UaNodeId();
   header.RequestHandle = CreateRequestHandle();
   header.ReturnDiagnostics = DiagnosticsMask.None;
   header.TimeoutHint = readSetting( "/Ua Settings/Session/DefaultTimeoutHint" );
   header.Timestamp = UaDateTime.utcNow();
   
   return header;
}
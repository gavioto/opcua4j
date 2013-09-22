/*
    Revision History:
        04-Sep-2009 RTD: Initial version
        23-Nov-2009 NP:  REVIEWED.

 Receives the list of locales supported by the server and tries to find an
 unsupported one. */
function GetUnsupportedLocale( serverLocales )
{
  // These are the candidates for an unsupported locale.
  var locales = ["zh", "nl", "en", "en-US", "fr", "de", "it", "ja", "pt", "pt-BR", "ru",
                 "es", "sv", "fi"];

  // Find one candidate not supported by the server.
  for (var ii = 0; ii < locales.length; ii++)
  {
    var found = false;
    for (var jj = 0; jj < serverLocales.length; jj++)   
    {
      if (locales[ii] == serverLocales[jj])
      {
        found = true;
        break;
      }
    }
    if (found == false)
    {
      return locales[ii];
    }
  }
}

// Receives a list with the locales supported by the server and create permutations on it.
// index specifies what will the first locale of the permutation.
function CreateSupportedLocaleArray(serverLocales, index)
{
  var locales = new UaStrings();
  for (var ii = 0; ii < serverLocales.length; ii++)
  {
    locales[ii] = serverLocales[(ii + index) % serverLocales.length];
  }
  return locales;
}

function CreateNonConformingLocaleArray()
{
  var locales = new UaStrings();
  locales[0] = "english";
  locales[1] = "deutsch";
  locales[2] = "spanish";
  locales[3] = "french";
  locales[4] = "portuguese";
  locales[5] = "italian";
  return locales;  
}
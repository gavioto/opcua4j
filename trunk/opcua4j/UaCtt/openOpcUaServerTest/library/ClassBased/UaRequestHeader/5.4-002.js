/* Call the specified testFunction (passing a diagnostic bit
   mask of 0). For example usage, see View Services/View Basic/
   Test Cases/5.7.1-Gen-002.js.
   
   This scenario is probably tested during the other tests of
   a given service, but there's nothing wrong with explicitly 
   testing it.
*/
function TestDiagnosticMaskZero( testFunction )
{
    testFunction( 0 );
}

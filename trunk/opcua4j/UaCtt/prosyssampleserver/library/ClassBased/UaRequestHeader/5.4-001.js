/* For each pairwise combination of diagnostic bits, call
   the specified testFunction (passing the diagnostic bit
   mask). For example usage, see View Services/View Basic/
   Test Cases/5.7.1-Gen-001.js.
*/
function TestDiagnosticMasks( testFunction )
{
    // pairwise combination of diagnostic bits
    var diagnosticMaskCombinations = [ 
        0x3FF, // all bits
        0x43,   
        0x2EA, 
        0x156, 
        0x27B,
        0x1C7,
        0x3E2,
        0x5E,
        0x35A,
        0xFB
    ];

    for( var i = 0; i < diagnosticMaskCombinations.length; i++ )
    {
        testFunction( diagnosticMaskCombinations[i] );
    }
}

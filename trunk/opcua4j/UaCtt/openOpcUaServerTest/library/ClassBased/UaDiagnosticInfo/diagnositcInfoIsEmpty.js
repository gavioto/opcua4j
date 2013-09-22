//  if the flag is set this function will add errors if the diagnostic info is not empty
function diagnosticInfoIsEmpty( DiagnosticInfo, bAddErrors )
{
    var result = true;;

    // check in parameters
    if( arguments.length !== 2 )
    {
        addError( "function diagnosticInfoIsEmpty(): Number of arguments must be 2!" );
        bAddErrors = false;
    }

    //  ServiceDiagnostics
    if( DiagnosticInfo.NamespaceUri !== -1 )
    {
        if( bAddErrors )
        {
            addError( "NamespaceUri is not -1" );
        }
        
        result = false;
    }

    if( DiagnosticInfo.SymbolicId !== -1 )
    {
        if( bAddErrors )
        {
            addError( "SymbolicId is not -1" );
        }
        result = false;
    }

    if( DiagnosticInfo.Locale !== -1 )
    {
        if( bAddErrors )
        {
            addError( "Locale is not -1" );
        }
        result = false;
    }

    if( DiagnosticInfo.LocalizedText !== -1 )
    {
        if( bAddErrors )
        {       
            addError( "LocalizedText is not -1" );
        }
        result = false;
    }

    // check any INNER diagnosticInfos too, and if any of these nested objects are empty
    // then that will cause a failure to apply at this level also.
    if( DiagnosticInfo.InnerDiagnosticInfo !== null )
    {
        for( var i=0; i<DiagnosticInfo.InnerDiagnosticInfo.length; i++ )
        {
            if( !diagnosticInfoIsEmpty( DiagnosticInfo.InnerDiagnosticInfo[i], bAddErrors ) )
            {
                result = false;
            }
        }// for i...
    }

    return result;
}
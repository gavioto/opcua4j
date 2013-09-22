/*global include, addError, diagnosticInfoIsEmpty, addLog */
/*
    Revision History:
        26-Jan-2010 NP: Added an OR condition to allow diagnostics length to equal 0
        15-Jun-2010 NP: First test now returns TRUE instead of Return. (Thanks Hannes).
*/
include( "./library/ClassBased/UaDiagnosticInfo/diagnositcInfoIsEmpty.js" );

function checkDiagnosticInfosError( RequestHeader, ExpectedOperationResultsArray, DiagnosticInfos, StringTable )
{
    if( readSetting( "/Server Test/DiagnosticInfo Response Testing" ).toString() == "0" )
    {
        print( "Skipping DiagnosticInfo checking, see Setting: '/Server Test/DiagnosticInfo Response Testing' to re-activate." );
        return( true );
    }

    // check in parameters
    if( arguments.length != 4 )
    {
        addError( "function checkDiagnosticInfosError(): Number of arguments must be 4!" );
        return( false );
    }

    var success = true;

    // check if diagnostic  on operation level was requested
    var operationLevelMask = 0x03E0;
    var bOperationLevelDiagnosticsRequested = false;
    if( ( RequestHeader.ReturnDiagnostics & operationLevelMask ) !== 0 )
    {
        bOperationLevelDiagnosticsRequested = true;
    }

    // early check-out, if both StringTable and DiagnosticInfos are empty, then exit
    if( StringTable.length === 0 && DiagnosticInfos.length === 0 )
    {
        return( true );
    }

    // check StringTable length. If zero then we should not have received ANY diags
    if( StringTable.length === 0 && DiagnosticInfos.length > 0 )
    {
        addError( "StringTable returned is empty, but we have received DiagnosticInfo objects. Zero entries in StringTable is indicator that the Server has no Diagnostic information to return." );
        success = false;
    }

    // diagnostics requested -> diagnostics should be returned
    if( bOperationLevelDiagnosticsRequested )
    {
        if( DiagnosticInfos.length !== 0
            && ExpectedOperationResultsArray.length !== DiagnosticInfos.length )
        {
            addError( "ExpectedOperationResultsArray.length = " + ExpectedOperationResultsArray.length +" DiagnosticInfos.length = " +DiagnosticInfos.length );
            success = false;
        }
    }
    // no diagnostics requested -> no diagnostics should be returned
    else
    {
        if( DiagnosticInfos.length !== 0 )
        {
            addError( "DiagnosticInfos.length = " + DiagnosticInfos.length + " but no diagnostics was requested" );
            success = false;
        }
    }
    
    // check each diagnosticInfo on operation level
    if( bOperationLevelDiagnosticsRequested )
    {
        for( var i = 0; i < ExpectedOperationResultsArray.length; i++ )
        {
            // Operation is expected to fail
            if( ExpectedOperationResultsArray[i].ExpectedResults[0].isBad() )
            {
                if( diagnosticInfoIsEmpty( DiagnosticInfos[i], false ) )
                {
                    addError( "DiagnosticInfos[" + i + "] is empty although diagnostics were requested" );
                    success = false;
                }
                else
                {
                    addLog( "DiagnosticInfos[" + i + "]: " + DiagnosticInfos[i] );
                    // check for a SymbolidId and LocalizedText, it doesn't make sense to have but not the other
                    // check if the StringTable contains an entry based on the SymbolicId 
                    if( DiagnosticInfos[i].SymbolicId === -1 && DiagnosticInfos[i].LocalizedText !== -1 )
                    {
                        addWarning( "The SymbolicId is not specified, but a LocalizedText is. In this case both should be specified." );
                    }
                    if( DiagnosticInfos[i].LocalizedText === -1 && DiagnosticInfos[i].SymbolicId !== -1 )
                    {
                        addWarning( "The LocalizedText is not specified, but a SymbolicId is. In this case both should be specified." );
                    }
                    // use SymbolicId?
                    if( DiagnosticInfos[i].SymbolicId !== -1 )
                    {
                         addLog( "DiagnosticInfos[" + i + "].SymbolicId is '" + DiagnosticInfos[i].SymbolicId + "' corresponding to StringTable[" + DiagnosticInfos[i].SymbolicId + "] = " + StringTable[DiagnosticInfos[i].SymbolicId] );
                    }
                    // use LocalizedText?
                    if( DiagnosticInfos[i].LocalizedText !== -1 )
                    {
                         addLog( "DiagnosticInfos[" + i + "].LocalizedText is '" + DiagnosticInfos[i].LocalizedText + "' corresponding to StringTable[" + DiagnosticInfos[i].LocalizedText + "] = " + StringTable[DiagnosticInfos[i].LocalizedText] );
                    }
                }
            }
            // Operation is expected to succeed
            else
            {
                if( !diagnosticInfoIsEmpty( DiagnosticInfos[i], true ) )
                {
                    addError( "DiagnosticInfos[" + i + "] is not empty but no diagnostics were requested" );
                    success = false;
                }
            }
        }
    }
    return( success );
}
include( "./library/Base/warnOnce.js" );


// print the warnings/errors etc. 
addLog( "\tscript afterTest.js executed" );
print( "\t******************************************" );
print( "\tCOMPLIANCE TEST RUN COMPLETE" );
print( "\t******************************************" );
print( "\tFINAL REPORT" );
print( "\t******************************************" );
print( "\tSessions Used: " + ( __GLOBAL_SessionNumber - 1 ) );
addLog( "Sessions Used: " + ( __GLOBAL_SessionNumber - 1 ) );
print( "\t******************************************" );
printLog( "FUNCTIONALITY NOT SUPPORTED", _notSupported );
printLog( "DATA TYPES NOT AVAILABLE FOR TESTING", _dataTypeUnavailable );
printLog( "WARNINGS DETECTED DURING TESTING", _warning );
//printLog( "TESTS SKIPPED", _skipped );

function printLog( message, log )
{
    if( log.length() > 0 )
    {
        print( "--- " + message + " ---" );
        addLog( message );
        print( "Purpose of this log: " + log.usage );
        addLog( log.usage );
        var logs = log.toStrings();
        for( var s=0; s<logs.length; s++ )
        {
            addLog( "\t\t" + logs[s].toString() );
            print( logs[s].toString() );
        }
    }
}
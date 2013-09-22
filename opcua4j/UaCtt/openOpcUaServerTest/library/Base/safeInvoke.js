// Safely invokes a named method within a Try/Catch/Finally block.
// Optionally, you can also specify methods to invoke within the
// catch and finally blocks too.

function durationToString(milliSeconds)
{
    if(milliSeconds < 1000)
    {
        return milliSeconds + " msecs"
    }
    
    var seconds = milliSeconds / 1000;
    seconds = parseInt(seconds);
    milliSeconds = milliSeconds % 1000;
    
    if(seconds < 60)
    {
        return seconds + " sec " + milliSeconds + " msec";
    }
    
    var minutes = seconds / 60;
    minutes = parseInt(minutes);
    seconds = seconds % 60;
    
    if(minutes < 60)
    {
        return minutes + " min " + seconds + " sec " + milliSeconds + " msec";
    }
    
    var hours = minutes / 60;
    hours = parseInt(hours);
    minutes = minutes % 60;
    
    return hours + " hours " + minutes + " min " + seconds + " sec " + milliSeconds + " msec";
}

function safelyInvoke( methodInTry, methodInCatch, methodInFinally )
{
    var testTimeStart = UaDateTime.utcNow();
    try
    {
        if( methodInTry != undefined )
        {
            print( "\n\n~~~ Invoking test script: " + methodInTry.name + " ~~~\n" );
            methodInTry();
        }
    }
    catch( exception )
    {
        addError( "Unexpected error: " + exception.toString() );
        if( methodInCatch != undefined )
        {
            methodInCatch();
        }
    }
    finally
    {
        if( methodInFinally != undefined )
        {
            methodInFinally();
        }
        var testTimeEnd = UaDateTime.utcNow();
        var testDuration = testTimeStart.msecsTo( testTimeEnd );
        
        var siMsg = ("------------------------ Test Case Metrics -------------------" );
        siMsg += "\n\tStarted at: " + testTimeStart.toString();
        siMsg += "\n\tEnded at: " + testTimeEnd.toString();        
        siMsg += "\n\tDuration: " + durationToString(testDuration);
        siMsg += "\n--------------------------------------------------------------";
        addLog( siMsg );
    }
}
/*    Base Event Logging Class/Helpers:
      These helpers are used to capture and report messages such as Errors, Warnings, NotImplemented or other things.
      Whenever a message is logged it will be logged only once. But each time that message is reported the helper
          will identify the root calling function by name and will log it against the message.
      Helpers available include (with sample usage):
          _notSupported.store( "DeadbandPercent" );
          _dataTypeUnavailable.store( "Int32" );
          _warning.store( "Received incorrect value" );
          _error.store( "Browse() status " + uaStatus, uaStatus );
          _skipped.store( "Static Scalar" );
*/

function baseLogger()
{
    this.log = [];
    this.baseMessage = "<base message>: ";
    this.baseOutput = print;
    this.usage = "";

    if( arguments.length >= 0 )
    {
        print( "-- NEW INSTANCE OF BASELOGGER --" );
    }

    function messageScriptTracker( msg )
    {
        this.message;
        this.scripts = [];
        
        // constructor
        if( arguments.length > 0 )
        {
            this.message = msg;
        }
    
        // add a function name to the list
        this.addScript = function()
        {
            var f = this.addScript;
            var name = "";
            while( ( f=f.caller ) !== null )
            {
                if( f.name !== "safelyInvoke" && f.name !== "repetitivelyInvoke" )
                { 
                    name = f.name; 
                }
            }
            // make sure the parameter is worth recording
            if( name !== undefined && name !== null && name.length > 0 )
            {
                var found = false;
                // make sure we haven't already recorded it
                for( var _scriptFinder=0; _scriptFinder<this.scripts.length; _scriptFinder++ )
                {
                    if( this.scripts[_scriptFinder] === name )
                    {
                        found = true;
                        break;
                    }
                }//for
                if( !found )
                {
                    this.scripts.push( name );
                }
            }
        }
    }

    this.store = function( msg, status, suppress )
    {
        var i;
        var index=-1;
        // is msg an array of messages? if not then turn it into one
        if( !( msg instanceof Array ) )
        { 
            msg = [msg]; 
        }
        // observe the "suppress" parameter?
        if( suppress === undefined || suppress === null )
        {
            suppress = true;
        }
        // iterate thru each message received
        for( var m=0; m<msg.length; m++ )
        {
            // has the message been logged before?
            if( suppress === true )
            {
                for( i=0; i<this.log.length; i++ )
                {
                    if( this.log[i].message === msg[m] )
                    {
                        index = i;
                        break;
                    }
                }//for i...
            }
            if( index === -1 )
            {
                var mst = new messageScriptTracker( msg[m] );
                this.log.push( mst );
                index = this.log.length - 1;
                if( status === undefined || status === null )
                {
                    this.baseOutput( this.baseMessage + mst.message );
                }
                else
                {
                    this.baseOutput( this.baseMessage + mst.message, status );
                }
            }
        }
        // record the script against the message
        this.log[index].addScript();
    }

    // returns the log collection in one formatted string
    this.toString = function()
    {
        var str = "";
        // loop thru each log
        for( var l=0; l<this.log.length; l++ )
        {
            str += "\n\t" + this.log[l].message;
            // loop thru each script reporting that message
            for( var s=0; s<this.log[l].scripts.length; s++ )
            {
                str += ( "\n\t\t" + this.log[l].scripts[s].toString() );
            }//for s
        }//for i
        return( str );
    }

    // returns the log collection as an array of strings, where each message is formatted and returned
    this.toStrings = function()
    {
        var strArray = [];
        // loop thru each log
        for( var l=0; l<this.log.length; l++ )
        {
            var str = "\n\t" + this.log[l].message;
            // loop thru each script reporting that message
            for( var s=0; s<this.log[l].scripts.length; s++ )
            {
                str += ( "\n\t\t" + this.log[l].scripts[s].toString() );
            }//for s
            strArray.push( str );
        }//for i
        return( strArray );
    }

    this.length = function()
    {
        return( this.log.length );
    }
}

function notSupported()
{
    this.inheritFrom = baseLogger;
    this.inheritFrom();
    this.baseMessage = "The following is not supported: ";
    this.baseOutput = addNotSupported;
    this.usage = "When UA Server specifically replies Bad_NotSupported";
}
var _notSupported;
if( _notSupported === undefined )
{
    _notSupported = new notSupported();
}

function dataTypeUnavailable()
{
    this.inheritFrom = baseLogger;
    this.inheritFrom();
    this.baseMessage = "The following data type is not configured for testing: ";
    this.baseOutput = addWarning;
    this.usage = "To list the Data Type that were not configured and therefore could not be tested.";
}
var _dataTypeUnavailable;
if( _dataTypeUnavailable === undefined )
{
    _dataTypeUnavailable = new dataTypeUnavailable();
}

function warning()
{
    this.inerhitFrom = baseLogger;
    this.inerhitFrom();
    this.baseMessage = "";
    this.baseOutput = addWarning;
    this.usage = "Warnings are 'flags' that indicate a potential interoperability problem, or deviance from the test-expectations and/or UA Specifications that are generally not serious enough to cause a failure.";
}
var _warning;
if( _warning === undefined )
{
    _warning = new warning();
}
/*
function error()
{
    this.inerhitFrom = baseLogger;
    this.inerhitFrom();
    this.baseMessage = "The following error was encountered: ";
    this.baseOutput = addError;
    this.usage = "Whenever a common error message should be used.";
}
var _error;
if( _error === undefined )
{
    _error = new error();
}


function skipped()
{
    this.inerhitFrom = baseLogger;
    this.inerhitFrom();
    this.baseMessage = "The following reason caused Scripts to be skipped: ";
    this.baseOutput = addSkipped;
    this.usage = "Whenever a script cannot be executed and is therefore skipped.";
}
var _skipped;
if( _skipped === undefined )
{
    _skipped = new skipped();
}
*/

// test code
/*
_notSupported.store( "hello" );
_notSupported.store( "world" );
_notSupported.store( "hello" );
_notSupported.store( [ "Hello", "World", "Hello", "world", "hello" ] );
_notSupported.store( "hello", undefined, false );
_notSupported.store( "hello", undefined, true );
_notSupported.store( "hello" );
print( "The following entries were captured:\n\t" + _notSupported.toString() );*/
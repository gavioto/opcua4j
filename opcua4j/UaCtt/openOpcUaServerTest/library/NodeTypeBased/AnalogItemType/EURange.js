/*  Nathan Pocock; nathan.pocock@opcfoundation.org
    This function returns the EURange of a given node, or a NULL.
*/
function GetNodeIdEURange( nodeSetting )
{
    var result = null;
    var item = MonitoredItem.fromSetting( nodeSetting, 0 );
    var hasPropertyReferenceType = new MonitoredItem( new UaNodeId( Identifier.HasProperty ), 0 );
    if( item == null || hasPropertyReferenceType == null )
    {
        addError( "Test aborted. AnalogType and/or HasProperty types not set in the SETTINGS." );
        return;
    }
    var browseRequest = GetDefaultBrowseRequest( g_session, item.NodeId );
    browseRequest.NodesToBrowse[0].ReferenceTypeId = hasPropertyReferenceType.NodeId;

    var browseResponse = new UaBrowseResponse();
    var uaStatus = g_session.browse( browseRequest, browseResponse );
    if( uaStatus.isGood() )
    {
        AssertBrowseValidParameter( browseRequest, browseResponse );
        var euRangeFound = false;
        var euRangeItem  = null;
        for( var i=0; i<browseResponse.Results.length; i++ )
        {
            print( "\tResults[" + i + "] = " + browseResponse.Results[i] );
            for( var r=0; r<browseResponse.Results[i].References.length; r++ )
            {
                if( browseResponse.Results[i].References[r].BrowseName.Name == "EURange" )
                {
                    print( "found!\n\n" );
                    euRangeFound = true;
                    euRangeItem = MonitoredItem.fromNodeIds( [browseResponse.Results[i].References[r].NodeId.NodeId] )[0];
                    break;
                }
            }
            if( euRangeFound ) break;
        }
        if( euRangeFound )
        {
            // now to extract the LOW and HIGH range
            var highValue, lowValue;
            if( ReadHelper.Execute( euRangeItem ) )
            {
                var extensionObject = euRangeItem.Value.Value.toExtensionObject();
                result = extensionObject.toRange();
                print( "\tGetEURange determined:\n\t\tLo = " + result.Low + "\n\t\tHi = " + result.High );
            }
        }
        else
        {
            addError( "Test Aborted. Specified Node does not have an EURange property." );
        }
    }
    else
    {
        addError( "Test aborted. Browse failed: " + uaStatus, uaStatus );
    }
    return( result );
}

/*  Nathan Pocock; nathan.pocock@opcfoundation.org
    This function returns the size of the EURange, i.e.
        ( LowRange + HighRange )
        e.g.
        LowRange = 10; HighRange = 50; Size = 40!
*/
function GetEURangeAsSize( euRange )
{
    if( euRange.Low == undefined || euRange.High == undefined )
    {
        return( null );
    }
    if( euRange.Low < 0 )
    {
        result = Math.abs( euRange.Low ) + Math.abs( euRange.High );
    }
    else
    {
        result = Math.abs( euRange.High ) - Math.abs( euRange.Low );
    }
    print( "\tGetEURange as Size determined the size is: " + result );
    return( result );
}

/*  Nathan Pocock; nathan.pocock@opcfoundation.org
    This function simply returns the % of an EURange.
        e.g. Range is 0-50.
            You seek 10 percent, the value is therefore 5.
*/
function GetEURangeValueFromPercent( euRange, percentage )
{
    var result = null;
    if( euRange !== null )
    {
        var euRangeSize = GetEURangeAsSize( euRange );
        if( euRange != null )
        {
            result = ( euRangeSize / 100 ) * percentage;
        }
    }
    return( result );
}

/*
    Parameters:
        valuesToCreate : how many values to generate
        euRange        : EURange object containing High/Low values
        percentage     : the % for the deadband testing
        toPassFilter   : if the values should PASS the filter, or not!
        startingNumber : the starting point for generating values
*/
function GetEURangeWriteValues( valuesToCreate, euRange, percentage, toPassFilter, startingNumber )
{
    var results = [];
    if( arguments.length == 5 )
    {
        print( "\tGenerating " + valuesToCreate + " values for deadband testing. Values to pass deadband filtering?" + toPassFilter + ". Range is: " + euRange.Low + " to " + euRange.High + ", percentage being tested: " + percentage );
        var offsetSize = GetEURangeValueFromPercent( euRange, percentage );
        var currentValue = startingNumber;
        var doAdd = true;
        if( toPassFilter )
        {
            // generate values that exceed the range of the EURange percent
            while( results.length < valuesToCreate )
            {
                if( doAdd )
                {
                    currentValue = parseFloat( currentValue ) + parseFloat( offsetSize + 1 );
                }
                else
                {
                    currentValue = parseFloat( currentValue ) - parseFloat( offsetSize + 1 );
                }
                // prevent any OUT OF RANGE values from entering the mix
                if( currentValue < euRange.Low || currentValue > euRange.High )
                {
                    currentValue = euRange.Low;
                }
                // add whatever has been generated to the array
                // is the number a decimal and if so restrict to 1 decimal place
                if( currentValue.toString().indexOf( "." ) > 0 )
                {
                    currentValue = Number( currentValue);
                    currentValue = Number( currentValue.toFixed( 2 ) );
                }
                results.push( currentValue );
            }// while...
        }
        else
        {
            // figure out the min/max values that do NOT exceed the deadband
            // and generate a range of values to fill that gap.
            var incrementalValue = 0;
            var minBoundValue = parseFloat( startingNumber ) - parseFloat( offsetSize );
            if( minBoundValue < euRange.Low )  minBoundValue = startingNumber;
            var maxBoundValue = parseFloat( startingNumber ) + parseFloat( offsetSize );
            if( maxBoundValue > euRange.High ) maxBoundValue = euRange.High;
            print( "\tMin bound number = " + minBoundValue + "; Max bound number = " + maxBoundValue );
            while( results.length < valuesToCreate )
            {
                incrementalValue = Math.round( Math.random() * offsetSize );
                if( doAdd )
                {
                    currentValue = parseFloat( currentValue ) + parseFloat( incrementalValue );
                }
                else
                {
                    currentValue = parseFloat( currentValue ) - parseFloat( incrementalValue );
                }
                // prevent any OUT OF RANGE values from entering the mix
                if( currentValue < minBoundValue || currentValue < euRange.Low )
                {
                    doAdd = true;
                    continue;
                }
                if( currentValue > maxBoundValue || currentValue > euRange.High )
                {
                    doAdd = false;
                    continue;
                }
                // add whatever has been generated to the array, providing it is not a duplicate
                // of the last value written.
                if( currentValue != results[ results.length - 1] )
                {
                // is the number a decimal and if so restrict to 1 decimal place
                    if( currentValue.toString().indexOf( "." ) > 0 )
                    {
                        currentValue = Number( currentValue);
                        currentValue = Number( currentValue.toFixed( 2 ) );
                    }
                    results.push( currentValue );
                }
            }// while...
        }
    }
    print( "\tValues to " + ( toPassFilter?"Pass":"Fail" ) + " deadband filtering based on starting number '" + startingNumber + "' are:\n\t\t" + results );
    return( results );
}

/*
    Parameters:
        low:    the EURange.Low value 
        high:   the EURange.High value 
*/
function GetEURangeMidPoint( low, high )
{
    if( low === undefined || low === null || high === undefined || high === null ) { return( 0 ); }
    if( low === high ){ return( 0 ); }
    var diff = high - low;
    var mid = high - ( diff / 2 );
    return( mid );
}
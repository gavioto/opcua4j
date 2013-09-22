/*  Test 5.8.1 Test 18; prepared by Mark Rice: mrice@canarylabs.com

    Description:
        MaxAge > Int32.
        Perform 2 reads where each read has a MaxAge > Int32. Request both Server and Source timestamps.
        The cached value ServerTimestamp should update, but the SourceTimestamp should not – if the value hasn’t changed
    Expectation:
        ServiceResult = “Good”.
        Ideally, the server will return a cached value, but it may obtain and return a new value from the Device. If
        the SourceTimestamp was the same on both reads, the second value, at least, was probably from the cache.
         [Warning issued if no caching]

    Revision History
        23-Sep-2009 MR: Initial version.
        10-Nov-2009 NP: Revised the description (above) to be more descriptive.
        10-Nov-2009 NP: Revised to use new Script library objects.
        10-Nov-2009 NP: Reviewed.
        18-Mar-2010 NP: Revised. Incorrect assumption used previously. Caching does not necessarily mean 2 reads yield same value(s).

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581018()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true );
    if( items == null || items.length == 0 )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    var firstTimestamp, secondTimestamp;
    var firstValue, secondValue;

    const MAX_AGE = Constants.Int32_Max + 1;
    var readService = new Read( g_session );

    // Read() and log the timestamp
    if( readService.Execute( items[0], TimestampsToReturn.Both, MAX_AGE ) )
    {
        firstValue     = UaVariantToSimpleType( readService.readResponse.Results[0].Value );
        firstTimestamp = readService.readResponse.Results[0].SourceTimestamp;
    }

    // Read() again and log the timestamp
    if( readService.Execute( items[0], TimestampsToReturn.Both, MAX_AGE ) )
    {
        secondValue     = UaVariantToSimpleType( readService.readResponse.Results[0].Value );
        secondTimestamp = readService.readResponse.Results[0].SourceTimestamp;
    }

    // are the timestamps the same?
    if( firstTimestamp === secondTimestamp )
    {
        addLog( "The timestamps (Source) are the same." );
    }
    else
    {
        addLog( "The timestamps (Source) are different, which is acceptable. Perhaps caching is fast, or not implemented." );
    }

    // are the values the same?
    if( firstValue === secondValue )
    {
        addLog( "The two values are the same." );
        if( firstTimestamp === secondTimestamp )
        {
            addLog( "The timestamps (Source) are ALSO the same. This Server must be Caching." );
        }
    }
    else
    {
        addLog( "The two values are different, which is acceptable. Perhaps the caching is fast, or not implemented." );
    }
}

safelyInvoke( read581018 );
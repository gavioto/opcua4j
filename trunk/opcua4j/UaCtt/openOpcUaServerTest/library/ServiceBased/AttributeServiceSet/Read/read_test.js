/* Changelog:
    19-Mar-2010 NP: Added an acceptedResult of GOOD. Pending change to UA Part 4 specifications
                    that would allow a range of "5:5" (same-digit) to be valid.
*/
function readInvalidRangeOfArray( item, sessionObject )
{
    var readService = new Read( sessionObject );
    var expectedResults = [];
    expectedResults[0] = new ExpectedAndAcceptedResults( StatusCode.BadIndexRangeInvalid );
    expectedResults[0].addAcceptedResult( StatusCode.Good );
    addLog( "Reading ARRAY node: '" + item.NodeId + "' with range " + item.IndexRange );
    readService.Execute( item, TimestampsToReturn.Both, 100, expectedResults, true );
}
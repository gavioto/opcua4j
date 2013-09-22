/*  Test 5.10.4 Error 1 prepared by Development: compliance@opcfoundation.org
    Description:
        Calls publish when no subscriptions exist.

    Revision History
        24-Aug-2009 DEV: Initial version.
        20-Nov-2009 NP : REVIEWED.
*/

function publish5104Err001()
{
    // call publish
    var expectedServiceResult = new ExpectedAndAcceptedResults( StatusCode.BadNoSubscription );
    AssertEqual( true, publishService.Execute( null, expectedServiceResult, false ) )
    publishService.Clear();
}

safelyInvoke( publish5104Err001 );
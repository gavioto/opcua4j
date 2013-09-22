/*  Prepared by Ronaldo T. Duarte ronaldotd@smar.com.br

    Description:
        Invoke FindServers in a loop of iterations. Verify time taken to process
        the requests.

    Revision History:
        26-Aug-2009 RTD: Initial version.
        23-Nov-2009 NP: REVIEWED.

    FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
        Test Lab Specifications Part 8 - UA Server Section 5.5.1.
*/

function findServers551007()
{
    const MAX_DELAY = 10; // in seconds.

    var findServersResponse = new UaFindServersResponse();
    for ( var ii = 1; ii <= 100; ii++ )
    {
        var findServersRequest = CreateDefaultFindServersRequest();    
        var timeBefore = UaDateTime.utcNow();
        var uaStatus = g_discovery.findServers( findServersRequest, findServersResponse );
        var timeAfter = UaDateTime.utcNow();
        var succeeded = true;

        if ( uaStatus.isGood() )
        {
            succeeded = checkFindServersValidParameter( findServersRequest, findServersResponse );
            if ( succeeded )
            {
                var time = timeBefore.msecsTo( timeAfter );
                addLog( "FindServers call #" + ii + " took " + time + " ms." );
                if ( time > MAX_DELAY * 1000 )
                {
                    addError( "FindServers call #" + ii + " took more than " + MAX_DELAY + " seconds." );
                    break;
                }
            }
            else
            {
                break;
            }
        }
        else
        {
            addError( "FindServers() status " + uaStatus, uaStatus );    
        }
    }
}

safelyInvoke( findServers551007 );
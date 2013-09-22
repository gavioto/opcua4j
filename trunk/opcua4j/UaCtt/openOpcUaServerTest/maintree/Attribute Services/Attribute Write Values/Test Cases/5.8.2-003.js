/*  Test 5.8.2 Test 3; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to all writable attributes of a Node, based on the value of the writeMask.

        NOTE: The writeMask attribute is optional, so this test may also fail if it is 
              not supported with error Bad_NotSupported.

        How this test works:
            1. READ a node, specifically the WriteMask attribute.
            2. Build a list of attributes that we can write to.
            3. WRITE to all of the allowable write attributes with some hard-coded values.

    Revision History:
        02-Oct-2009 NP: Initial version.
        24-Nov-2009 NP: REVIEWED/INCONCLUSIVE. Server provides no Nodes with WriteMask set!
        11-Dec-2009 DP: Provide a warning if the WriteMask is 0 (instead of a "skip" message).

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582003()
{
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true );
    if( items == null || items.length == 0 )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    //~~~~~~~~~~~~~~~~~~~ STEP ONE - READ The WriteMask ~~~~~~~~~~~~~~~~~~~~~~~~~~
    var readReq = new UaReadRequest();
    var readRes = new UaReadResponse();
    g_session.buildRequestHeader( readReq.RequestHeader );

    readReq.TimestampsToReturn = TimestampsToReturn.Neither;

    readReq.NodesToRead[0].NodeId = items[0].NodeId;
    readReq.NodesToRead[0].AttributeId = Attribute.WriteMask;

    // issue the READ
    var uaStatus = g_session.read( readReq, readRes );

    // check the result
    if( uaStatus.isGood() )
    {
        if( checkReadValidParameter( readReq, readRes ) )
        {
            //~~~~~~~~~~~~~~~~~~~ STEP TWO - Prepare Write based on WriteMask ~~~~~~~~~~~~~~~~~~~~~~~~~~
            var currentNodeNumber = -1;

            var writeReq = new UaWriteRequest();
            var writeRes = new UaWriteResponse();
            g_session.buildRequestHeader(writeReq.RequestHeader);

            // we'll look at each bit, and then build a write for each one that is TRUE.
            var writeMaskValue = readRes.Results[0].Value;

            populateNodesToWriteFromWriteMask( writeReq, items[0].NodeId.toString(), writeMaskValue );



            //~~~~~~~~~~~~~~~~~~~ STEP THREE - WRITE! ~~~~~~~~~~~~~~~~~~~~~~~~~~
            if( writeReq.NodesToWrite.length <= 1 )
            {
                addWarning( "Test cannot be completed: WriteMask indicates that no attributes are writeable. NodeId: '" + items[0].NodeId + "' (setting: '" + items[0].NodeSetting + "')" );
            }
            else
            {
                //do the Write
                uaStatus = g_session.write( writeReq, writeRes );
                if( uaStatus.isGood() )
                {
                    checkWriteValidParameter( writeReq, writeRes, true, undefined, OPTIONAL_CONFORMANCEUNIT );
                }
                else
                {
                    addError( "Write(): status " + uaStatus, uaStatus );
                }
            }
        }
    }
    else
    {
        addError( "Read(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( write582003 );
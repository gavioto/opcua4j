/*  Test 5.8.2 Error Test 4; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to multiple valid attributes for a single node, while also 
        specifying an invalid attribute.

        We expect good results for the valid writes, but a
        Bad_AttributeIdInvalid for the invalid one.

    Revision History
        25-Sep-2009 NP: Initial version.
        11-Dec-2009 DP: Provide a warning if the WriteMask is 0 (instead of a "skip" message).

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582Err004()
{
    const INVALIDATTRIBUTEID = 0x1234;
    var items = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic(), 0, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, true );
    if( items == null || items.length == 0 )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    var settingNames = MonitoredItem.GetSettingNames( items );

    //~~~~~~~~~~~~~~~~~~~ STEP ONE - READ The WriteMask ~~~~~~~~~~~~~~~~~~~~~~~~~~
    var readReq = new UaReadRequest();
    var readRes = new UaReadResponse();
    g_session.buildRequestHeader( readReq.RequestHeader );

    readReq.TimestampsToReturn = TimestampsToReturn.Neither;
    readReq.NodesToRead[0].NodeId = items[0].NodeId;
    readReq.NodesToRead[0].AttributeId = Attribute.WriteMask;

    // issue the READ
    var uaStatus = g_session.read( readReq, readRes );
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
            print( "\n\tWriteMask is: " + writeMaskValue );

            populateNodesToWriteFromWriteMask( writeReq, items[0].NodeId.toString(), writeMaskValue );

            // now create the invalid attributeId
            var nextNodePosition = writeReq.NodesToWrite.length;
            writeReq.NodesToWrite[nextNodePosition].NodeId = items[0].NodeId;
            writeReq.NodesToWrite[nextNodePosition].AttributeId = INVALIDATTRIBUTEID;
            writeReq.NodesToWrite[nextNodePosition].Value.Value = new UaVariant();
            writeReq.NodesToWrite[nextNodePosition].Value.Value.setInt16( 100 );


            //~~~~~~~~~~~~~~~~~~~ STEP THREE - WRITE! ~~~~~~~~~~~~~~~~~~~~~~~~~~
            if( writeReq.NodesToWrite.length <= 1 )
            {
                addWarning( "Test cannot be completed: WriteMask indicates that no attributes are writeable." );
            }
            else
            {
                for( var i=0; i<=nextNodePosition; i++ )
                {
                    writeReq.NodesToWrite[i].NodeId = items[0].NodeId;
                }


                //do the Write
                uaStatus = g_session.write( writeReq, writeRes );
                if( uaStatus.isGood() )
                {
                    var expectedResults = [];

                    // prepare the expected results, which are simply all are good
                    // except for the last one (which we injected)
                    for( var e=0; e<writeReq.NodesToWrite.length - 1; e++ )
                    {
                        expectedResults[e] = new ExpectedAndAcceptedResults( StatusCode.Good );
                    }
                    expectedResults[e] = new ExpectedAndAcceptedResults( StatusCode.BadAttributeIdInvalid );

                    // check the results match our expectations
                    checkWriteError( writeReq, writeRes, expectedResults, false, settingNames, OPTIONAL_CONFORMANCEUNIT );
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

safelyInvoke( write582Err004 );
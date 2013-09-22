/*  Test 5.8.2 Error Test 8; prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        Write to an invalid attribute of a valid node.

    Revision History
        24-Aug-2009 NP: Initial version.
        16-Nov-2009 NP: REVIEWED.
        09-Dec-2009 DP: Changed to use any static scalar node.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.2.
*/

function write582Err008()
{
    var writeReq = new UaWriteRequest();
    var writeRes = new UaWriteResponse();
    g_session.buildRequestHeader( writeReq.RequestHeader );

    var nodeSetting = NodeIdSettings.GetAScalarStaticNodeIdSetting( "diu" );
    if( nodeSetting !== undefined && nodeSetting !== null )
    {
        writeReq.NodesToWrite[0].NodeId = nodeSetting.id;
        writeReq.NodesToWrite[0].AttributeId = 0;
        GenerateScalarValue( writeReq.NodesToWrite[0].Value.Value, nodeSetting.Datatype );
    }
    else
    {
        _dataTypeUnavailable.store( "Static Scalar (numeric)" );
        return;
    }

    var uaStatus = g_session.write( writeReq, writeRes );
    if( uaStatus.isGood() )
    {
        // this is an array of ExpectedAndAcceptedResult. Size of the array = number of nodes to read
        var ExpectedOperationResultsArray = [];
        ExpectedOperationResultsArray[0] = new ExpectedAndAcceptedResults( StatusCode.BadAttributeIdInvalid );
        checkWriteError( writeReq, writeRes, ExpectedOperationResultsArray, false, [nodeSetting.Setting], OPTIONAL_CONFORMANCEUNIT );
    }
    else
    {
        addError( "Write(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( write582Err008 );
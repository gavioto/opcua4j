/*  Test 5.8.1 Test 16; prepared by Nathan Pocock: nathan.pocock@opcfoundation.org

    Description:
        Read a node of each supported Data Type:
            Bool, Byte, SByte, ByteString, DateTime
            Double, Float, Guid, Int16, UInt16
            Int32, UInt32, Int64, UInt64, String, XmlElement.

    Revision History
        24-Aug-2009 NP: Initial version.
        09-Aug-2009 MR: Fixed Description in comment above.
        06-Nov-2009 NP: Reviewed.
        25-Nov-2009 DP: Updated array syntax.
        19-Mar-2010 NP: Revised to show the NodeId Setting in messages.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581016()
{
    //define the names of the options in an array. 
    //This will make for an easier script.
    //This list SHOULD match whatever is defined in the options to get the data-type coverage.
    var dataTypeNodeNames = [
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Bool",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Byte",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/DateTime",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Double",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Float",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Guid",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Int16",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Int32",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/Int64",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/String",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/SByte",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/ByteString",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/String",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt16",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt32",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/UInt64",
        "/Server Test/NodeIds/Static/All Profiles/Scalar/XmlElement"
        ];

    var dataTypeTypes = [
        BuiltInType.Boolean,
        BuiltInType.Byte,
        BuiltInType.DateTime,
        BuiltInType.Double,
        BuiltInType.Float,
        BuiltInType.Guid,
        BuiltInType.Int16,
        BuiltInType.Int32,
        BuiltInType.Int64,
        BuiltInType.String,
        BuiltInType.SByte,
        BuiltInType.ByteString,
        BuiltInType.String,
        BuiltInType.UInt16,
        BuiltInType.UInt32,
        BuiltInType.UInt64,
        BuiltInType.XmlElement
        ];

    var readReq = new UaReadRequest();
    var readRes = new UaReadResponse();
    g_session.buildRequestHeader( readReq.RequestHeader );

    readReq.MaxAge = 10000;
    readReq.TimestampsToReturn = TimestampsToReturn.Both;

    //stores the current node number that we're processing
    var nodeNumber = 0;

    //stores the data type Types that we'll compare to
    var typeNodeNames = [];
    var typesToCompareAgainst = [];

    //dynamically construct the IDs of the nodes we want to read, specifically their values.
    for( var i=0; i<dataTypeNodeNames.length; i++ )
    {
        //get the value of the setting, and make sure it contains a value
        var settingValue = readSetting( dataTypeNodeNames[i] );
        if( settingValue == undefined || settingValue == "undefined" || settingValue == null )
        {
            settingValue = "";
        }

        if( settingValue.toString().length > 0 )
        {
            //store the datatype in a variable for comparing against
            typesToCompareAgainst[nodeNumber] = dataTypeTypes[i];
            typeNodeNames[nodeNumber] = dataTypeNodeNames[i];

            //add the nodeId of the current type to the read request
            readReq.NodesToRead[nodeNumber].NodeId = UaNodeId.fromString( settingValue.toString() );
            readReq.NodesToRead[nodeNumber].AttributeId = Attribute.Value;
            addLog( "Reading Node: '" + readReq.NodesToRead[nodeNumber].NodeId + "' (setting: '" + dataTypeNodeNames[i] + "')" );
            nodeNumber++;
        }
        else
        {
            _dataTypeUnavailable.store( BuiltInType.toString( dataTypeTypes[i] ) );
        }
    }

    //issue the READ
    uaStatus = g_session.read( readReq, readRes );

    // check results
    // check the service call was GOOD
    if( uaStatus.isGood() )
    {
        //check the read for usual errors etc.
        checkReadValidParameter( readReq, readRes, typeNodeNames );

        addLog( "Checking the results[*] data types match what was expected..." );
        for( var i=0; i<typeNodeNames.length; i++ )
        {
            if( readRes.Results[i].Value.isEmpty() )
            {
                addLog( "NodeId: " + readReq.NodesToRead[i].NodeId
                    + "; Type expected: " + BuiltInType.toString( typesToCompareAgainst[i] )
                    + "; Type actual: UNKNOWN BECAUSE THE VALUE IS NULL." );
            }
            else
            {
                addLog( "NodeId: " + readReq.NodesToRead[i].NodeId + " (setting: " + dataTypeNodeNames[i] + "') "
                    + "; Type expected: " + BuiltInType.toString( typesToCompareAgainst[i] )
                    + "; Type actual: " + BuiltInType.toString( readRes.Results[i].Value.DataType )
                    + "; Value: " + readRes.Results[i].Value.toString() );
                if( ! AssertEqual( BuiltInType.toString( typesToCompareAgainst[i] ), BuiltInType.toString( readRes.Results[i].Value.DataType ) ) )
                {
                    addLog( "*" + i + ") " + typeNodeNames[i] + "; Node '" + readReq.NodesToRead[i].NodeId + "' expected to be of type: " + BuiltInType.toString( dataTypeTypes[i] ) +", but was actually: " + BuiltInType.toString( readRes.Results[i].Value.DataType ) + ". Value=" + readRes.Results[i].Value.toString() );
                }
            }
        }
    }
    else
    {
        addError( "Read(): status " + uaStatus, uaStatus );
    }
}

safelyInvoke( read581016 );
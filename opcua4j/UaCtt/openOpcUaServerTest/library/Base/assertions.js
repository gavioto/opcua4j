/* FUNCTION LIST 
    Reference types:
        AssertReferencesContainsBrowseName( references, browseName, message, isOptional )
        AssertReferencesContainsReferenceTypeId( references, referenceTypeId, message, isOptional )

  global addError, addLog, addWarning, BuiltInType, print, UaExpandedNodeId,
  UaLocalizedText, UaNodeId, UaQualifiedName
*/

//#region boolean assertions
    
function AssertTrue( expectedResult, message )
{
    if( !expectedResult )
    {
        addError( message );
    }
    return expectedResult;
}


function AssertFalse( expectedResult, message )
{
    return AssertTrue( !expectedResult, message );
}

//#endregion


//#region standard datatype assertions
    
// General equality comparison (exactly equal; see AssertCoercedEqual for type coercion)
function AssertEqual( expectedResult, actualResult, message, optionalGoodMessage )
{
    var isEqual = false;
    try
    {
        isEqual = expectedResult.equals( actualResult );
    }
    catch( e )
    {
        isEqual = ( expectedResult === actualResult );
    }
    
    if( !isEqual || (expectedResult === undefined && actualResult === undefined) )
    {
        var errMessage = "";
        if( message !== null && message !== undefined && message !== "" )
        {
            errMessage = message;
        }
        addError( "Expected <" + expectedResult + "> but got <" + actualResult + ">. " + errMessage );
    }
    // display the optional "good" message?
    if( isEqual && optionalGoodMessage !== undefined && optionalGoodMessage !== null && optionalGoodMessage.length > 0 )
    {
        addLog( optionalGoodMessage );
    }
    return isEqual;
}

function AssertCoercedEqual( expectedResult, actualResult, message )
{
    var isEqual = false;
    if( expectedResult.equals !== undefined )
    {
        try
        {
            isEqual = expectedResult.equals( actualResult );
        }
        catch ( e )
        {
        }
    }
    else
    {
        isEqual = ( expectedResult == actualResult );
    }
    
    if( !isEqual )
    {
        var errMessage = "";
        if( message !== null && message !== undefined && message !== "" )
        {
            errMessage = message;
        }
        addError( "Expected <" + expectedResult + "> but got <" + actualResult + ">." + errMessage );
    }
    return isEqual;
}

function AssertNotEqual( var1, var2, message )
{
    var isEqual = true;
    if( var1.equals !== undefined )
    {
        isEqual = var1.equals( var2 );
    }
    else
    {
        isEqual = var1 == var2;
        if( isEqual )
        {
            var errMessage = "";
            if( message !== null && message !== undefined )
            {
                errMessage = message;
            }
            addError( "Expected other than <" + var1 + "> but got <" + var2 + ">. " + errMessage );
        }
    }
    return( ! isEqual );
}


function AssertArraysEqual( expectedResult, actualResult, message )
{
    if( AssertEqual( expectedResult.length, actualResult.length, message + " Array lengths differ.") )
    {
        // is this a string/byteString?
        if( expectedResult.isEmpty !== undefined )
        {
            // bytestring/string
            AssertEqual( expectedResult, actualResult, message + " Array content differs." );
        }
        else
        {
            // regular array
            for( var i = 0; i < expectedResult.length; i++ )
            {
                AssertEqual( expectedResult[i], actualResult[i], message + " Array content differs at index " + i);
            }
        }
    }
    else
    {
        if( ( expectedResult.length < 10 ) && ( actualResult.length < 10 ) )
        {
            addError( "Expected array: " + expectedResult + "; Actual array: " + actualResult );
        }
    }
}
//#endregion


//#region numeric assertions
    
// Value is within a specified range (inclusive)
function AssertInRange( expectedMin, expectedMax, actualValue, message, showAsWarning )
{
    var localMessage = "";
    var result = false;
    // NaN comparisons always evaluate to false, so check not in range instead of out of range
    if( !( expectedMin <= actualValue ) )
    {
        localMessage = "Expected a value greater than <" + expectedMin + "> but got <" + actualValue + ">. " + message;
    }
    else if( !( expectedMax >= actualValue ) )
    {
        localMessage = "Expected a value less than <" + expectedMax + "> but got <" + actualValue + ">. " + message;
    }
    else
    {
        result = true;
    }
    if( localMessage !== "" )
    {
        if( showAsWarning !== undefined && showAsWarning !== null && showAsWarning === true )
        {
            addWarning( localMessage );
        }
        else
        {
            addError( localMessage );
        }
    }
    return result;
}

// Value is greater than a specified value
function AssertGreaterThan( expectedMin, actualValue, message )
{
    var result = false;
    if( expectedMin >= actualValue )
    {
        addError( "Expected a value greater than <" + expectedMin + "> but got <" + actualValue + ">. " + message );
    }
    else
    {
        result = true;
    }
    
    return result;
}

//#endregion


//#region string assertions

// Checks if the 'actual' parameter is null/undefined
function AssertNull( actual, message )
{
    if( actual === null || actual === undefined )
    {
        return( true );
    }
    else
    {
        addError( "Expected null but got <" + actual + ">. " + message );
        return( false );
    }
}

// String is not null and not empty
function AssertNotNullOrEmpty( actual, message )
{
    if( actual === "" || actual === null || actual === undefined )
    {
        addError( "Expected not-empty but got <" + actual + ">. " + message );
        return false;
    }
    
    return true;
}

//#endregion


//#region NodeId assertions
    
// NodeIds equality comparison
function AssertNodeIdsEqual( expectedNodeId, actualNodeId, message )
{
    var match = false;
    try
    {
        match = expectedNodeId.equals( actualNodeId );
    }
    catch (e)
    {
    }
    if( !match )
    {
        addError( "Expected <" + expectedNodeId + "> but got <" + actualNodeId + ">. " + message );
    }
    return match;
}


// NodeId is a null NodeId
function AssertNullNodeId( actualNodeId, message )
{
    if( !actualNodeId.equals( new UaNodeId() ) )
    {
        addError( "NodeId is not a null NodeId: " + actualNodeId + ". " + message );
    }
}


// NodeId is not a null NodeId
function AssertNotNullNodeId( actualNodeId, message )
{
    if( actualNodeId === null )
    {
        addError( "NodeId is null. " + message );
        return false;
    }
    else if( actualNodeId === undefined )
    {
        addError( "NodeId is undefined. " + message );
        return false;
    }
    else if( actualNodeId.equals( new UaNodeId() ) )
    {
        addError( "NodeId is a null NodeId. " + message );
        return false;
    }
    return true;
}

//#endregion


//#region ExpandedNodeIds assertions
    
function AssertExpandedNodeIdsEqual( expectedNodeId, actualNodeId, message )
{
    if( !expectedNodeId.equals( actualNodeId ) )
    {
        addError( "Expected <" + expectedNodeId + "> but got <" + actualNodeId + ">. " + message );
        return false;
    }
    return true;
}


function AssertNullExpandedNodeId( actualNodeId, message )
{
    if( !actualNodeId.equals( new UaExpandedNodeId() ) )
    {
        addError( "ExpandedNodeId is a null ExpandedNodeId: " + actualNodeId + ". " + message );
    }
}


function AssertNotNullExpandedNodeId( actualNodeId, message )
{
    if( actualNodeId === null )
    {
        addError( "ExpandedNodeId is null. " + message );
    }
    else if( actualNodeId.equals( new UaExpandedNodeId() ) )
    {
        addError( "ExpandedNodeId is a null ExpandedNodeId. " + message );
    }
}

//#endregion


//#region QualifiedName assertions
    
function AssertQualifiedNamesEqual( expectedName, actualName, message )
{
    if( !expectedName.equals( actualName ) )
    {
        addError( "Expected <" + expectedName + "> but got <" + actualName + ">. " + message );
        return false;
    }
}


function AssertNullQualifiedName( actualName, message )
{
    if( !actualName.equals( new UaQualifiedName() ) )
    {
        addError( "QualifiedName is not a null QualifiedName. " + message );
    }
}


function AssertNotNullQualifiedName( actualName, message )
{
    if( actualName === null )
    {
        addError( "QualifiedName is null. " + message );
    }
    else if( actualName.equals( new UaQualifiedName() ) )
    {
        addError( "QualifiedName is a null QualifiedName. " + message );
    }
}

//#endregion


//#region LocalizedText assertions
    
function AssertLocalizedTextsEqual( expectedText, actualText, message )
{
    if( !expectedText.equals( actualText ) )
    {
        addError( "Expected <" + expectedText + "> but got <" + actualText + ">. " + message );
        return false;
    }
}


function AssertNullLocalizedText( actualText, message )
{
    if( !actualText.equals( new UaLocalizedText() ) )
    {
        addError( "LocalizedText is not a null LocalizedText. " + message );
    }
}


function AssertNotNullLocalizedText( actualText, message )
{
    if( actualText === null )
    {
        addError( "LocalizedText is null. " + message );
    }
    else if( actualText.equals( new UaLocalizedText() ) )
    {
        addError( "LocalizedText is a null LocalizedText. " + message );
    }
}

//#endregion


//#region BrowseName assertions
    
// BrowseName equality comparison
function AssertBrowseNamesEqual( expectedName, actualName, message )
{
    var result = ( expectedName.NamespaceIndex == actualName.NamespaceIndex );
    result = result && ( expectedName.Name == actualName.Name );
    if ( !result )
    {
        addError( "Expected <" + expectedName + "> but got <" + actualName + ">. " + message );
    }
    return result;
}

//#endregion


//#region DiagnosticInfos assertions
    
// Empty DiagnosticInfos
function AssertDiagnosticInfosEmpty( diagnosticInfos )
{
    if( diagnosticInfos.length !== 0 )
    {
        addError( "DiagnosticInfos are not empty. DiagnosticInfos: " + diagnosticInfos );
    }
}

//#endrgion


//#region StatusCode assertions

// expectedStatusCode is a StatusCode enum value
// actualUaStatusCode is a UaStatusCode object
function AssertStatusCodeIs( expectedStatusCode, actualUaStatusCode, message )
{
    if( actualUaStatusCode.StatusCode !== expectedStatusCode )
    {
        addError( message + ": " + actualUaStatusCode, actualUaStatusCode );
        return false;
    }
    return true;
}


function StatusCodeIsIn( statusCodeArray, statusCode )
{
    for( var j in statusCodeArray )
    {
        if( statusCode.StatusCode == statusCodeArray[j].StatusCode )
        {
            return true;
        }
    }
    return false;
}


// The actualStatusCode should be one of the expectedStatusCodes.
// expectedStatusCodes is an ExpectedAndAcceptedResults object.
function AssertStatusCodeIsOneOf( expectedStatusCodes, actualStatusCode, message )
{
    // check if result matches any of the expected status code
    var match = StatusCodeIsIn( expectedStatusCodes.ExpectedResults, actualStatusCode );
    if( match )
    {
        addLog( message + ": " + actualStatusCode, actualStatusCode );
    }
    else
    {
        // check if result matches any of the accepted status codes
        match = StatusCodeIsIn( expectedStatusCodes.AcceptedResults, actualStatusCode );
        
        if( match )
        {
            addWarning( message + ": " + actualStatusCode + " but " + expectedStatusCodes.ExpectedResults[0] + " was expected", actualStatusCode );
        }
        else
        {
            addError( message + ": " + actualStatusCode + " but " + expectedStatusCodes.ExpectedResults[0] + " was expected", actualStatusCode );
        }
    }
    
    return match;
}

//#endregion

//#region UaValue
// Checks the specified value is of the expected Type
function AssertUaValueOfType( expectedType, uaVariantValue )
{
    return( AssertEqual( expectedType, uaVariantValue.DataType, "Expected type <" + BuiltInType.toString( expectedType ) + "> but received <" + BuiltInType.toString( uaVariantValue.DataType ) + ">" ) );
}

// Checks the subscriptions objects (/Library/Base/Subscription) to see which subscriptions are
// enabled/disabled and compares to what the Publish object (/Library/ServiceBased/Subscription/Publish/Publish)
// has received.
function AssertSubscriptionCallbacks( subscriptions, publishObject )
{
    // now check which subscriptions provided dataChanges
    var subscriptionFound = false;
    print( "\nAssertSubscriptionCallbacks for " + subscriptions.length + " subscriptions... There are " + publishObject.SubscriptionIds.length + " subscriptionIds in the queue of received DataChanges." );
    for( var s=0; s<subscriptions.length; s++ )
    {
        for( var i=0; i<publishObject.SubscriptionIds.length; i++ )
        {
            if( subscriptions[s].SubscriptionId ===  publishObject.SubscriptionIds[i] )
            {
                AssertEqual( true, subscriptions[s].PublishingEnabled, "DataChanges for subscription: " + subscriptions[s].SubscriptionId + " (enabled=" + subscriptions[s].PublishingEnabled + " ) expected." );
                subscriptionFound = true;
                break;
            }
        }
        if( !subscriptionFound )
        {
            AssertEqual( false, subscriptions[s].PublishingEnabled, "Did not receive dataChanges for Enabled subscription: " + subscriptions[s].SubscriptionId );
        }
    }
}

function AssertReferencesContainsBrowseName( references, browseName, message, isOptional )
{
    var result = false;
    for( var r=0; r<references.length; r++ )
    {
        if( references[r].BrowseName.Name == browseName )
        {
            result = true;
            break;
        }
    }// for r...
    if( isOptional !== undefined && isOptional !== null && isOptional === true )
    {
        if( !result )
        {
            addLog( "Could not find OPTIONAL BrowseName '" + browseName + "' in any of the specified references." );
        }
    }
    else
    {
        if( !AssertTrue( result, "Could not find '" + browseName + "' in any of the specified references." ) )
        {
            if( message !== undefined && message !== null )
            {
                addError( message );
            }
        }
    }
    return( result );
}

function AssertReferencesContainsReferenceTypeId( references, referenceTypeId, message, isOptional )
{
    var result = false;
    for( var r=0; r<references.length; r++ )
    {
        if( references[r].ReferenceTypeId.equals( referenceTypeId ) )
        {
            result = true;
            break;
        }
    }//for r
    if( isOptional !== undefined && isOptional !== null && isOptional === true )
    {
        if( !result )
        {
            addLog( "Could not find OPTIONAL ReferenceType '" + referenceTypeId + "' in any of the specified references." );
        }
    }
    else
    {
        if( !AssertTrue( result, "Could not find ReferenceType '" + referenceTypeId + "' in any of the specified references." ) )
        {
            if( message !== undefined && message !== null )
            {
                addError( message );
            }
        }
    }
    return( result );
}

function AssertIsNumeric( value, message )
{
    var result = true;
    if( value !== undefined && value !== null && value !== "" )
    {
        var inError = false;
        var foundNumeric = value.match( "(\\d*)" )[1];
        if ( foundNumeric == undefined || foundNumeric == null || foundNumeric == "" )
        {
            inError = true;
        }
        if( foundNumeric !== value )
        {
            inError = true;
        }
        if( inError )
        {
            var optionalMessage = "";
            if( message !== undefined && message !== null && message !== "" )
            {
                optionalMessage = message;
            }
            addError( "Value '" + value + "' is not numeric! " + optionalMessage );
            result = false;
       }
    }
    return( result );
}

function AssertSettingGood( settingName, message )
{
    var result = false;
    if( settingName !== undefined && settingName !== null && settingName !== "" )
    {
        var settingValue = readSetting( settingName );
        if( settingValue !== undefined && settingValue !== null && settingValue.toString().length > 0 )
        {
            result = true;
        }
    }
    if( !result )
    {
        var errMessage = "Setting not configured: '" + settingName + "'.";
        if( message !== undefined && message !== null && message.length > 0 )
        {
            errMessage += message;
        }
        _warning.store( errMessage );
    }
    return( result );
}

function AssertOptionalSetting( settingName, message, isDataType )
{
    var result = false;
    if( settingName !== undefined && settingName !== null && settingName !== "" )
    {
        var settingValue = readSetting( settingName );
        if( settingValue !== undefined && settingValue !== null && settingValue.toString().length > 0 )
        {
            result = true;
        }
    }
    if( !result )
    {
        var errMessage = "Setting not configured: '" + settingName + "'.";
        if( message !== undefined && message !== null && message.toString().length > 0 )
        {
            errMessage += message;
        }
        _warning.store( errMessage );
        if( isDataType !== undefined && isDataType !== null && isDataType === true )
        {
            _dataTypeUnavailable.store( BuiltInType.toString( NodeIdSettings.guessType( settingName ) ) );
        }
    }
    return( result );
}

function AssertOptionalDataTypeSetting( settingName, message )
{
    return( AssertOptionalSetting( settingName, message, true ) );
}

/*
    Parameters:
        valueReceived:    the value received when reading the Node's value 
        valueSent:        the value that was written to the Server 
        precisionValue:   the level of precision the Server supports for the Node 
        errMessage:       an optional error message to be reported 
*/
function AssertValueWithinPrecision( valueReceived, valueSent, precisionValue, errMessage )
{
    valueReceived = parseFloat( valueReceived );
    valueSent = parseFloat( valueSent );
    precisionValue = parseInt( precisionValue );
    print( "AssertValueWithinPrecision:\n\tValue Received: " + valueReceived + 
        "\n\tValue Sent: " + valueSent + "\n\tPrecision: " + precisionValue );
    var left = ( Math.abs( valueSent - valueReceived ) );
        print(" \tAbs( " + valueSent + " - " + valueReceived + " ) = " + left );
    var valueToPrec = valueSent.toFixed( precisionValue );
    var right = (Math.abs( valueSent - valueToPrec ));
        print( "\tAbs( " + valueSent + " - trunc( " + valueSent + ", " + precisionValue + " )) = " + right );
    var diff = left <= right;
        print( "\tResult (" + left + " <= " + right + ") = " + diff );
    if( !diff )
    {
        if( errMessage !== undefined && errMessage !== null && errMessage.length !== 0 )
        {
            addError( errMessage );
        }
        else
        {
            addError( "The value received differs by more than the ValuePrecision configured. ValuePrecision=" + precisionValue + "; ValueReceived: " + valueReceived + " vs. Written: " + valueSent );
        }
    }
    return( diff );
}

//#endregion
/*
AssertNotEqual( 1, 1 );
AssertNotEqual( 1, 2 );
AssertNotEqual( "hello", "hello" );
AssertNotEqual( "hello", "world" );
*/
/*
 This function creates a IndexRange string given the following parameters:
  
  Parameters:
    arrayIndexStart:      Numeric. Can be = -1 or != -1. IndexRange string created in conjuction with arrayIndexEnd (see below)
    arrayIndexEnd:        Numeric. If = -1, means the request IndexRange is for a single-dimension array. IndexRange
                                   created using elementIndexStart and elementIndexStart.
                                   If != -1 and arrayIndexStart also != -1, then range specified (arrayIndexStart:arrayIndexEnd)
                                   If != -1 and arrayIndexStart = -1, then single element specified by arrayIndexEnd
    elementIndexStart:    Numeric. Can be = -1 or != -1. IndexRange string created in conjuction with elementIndexEnd (see below)
    elementIndexEnd:      Numeric. Cannot be -1. If elementIndexStart != -1, then range specified (elementIndexStart:elementIndexEnd)
                                   If elementIndexStart = -1, then a single element specified by elementIndexEnd
                                   
    Format:   "arrayIndexStart:arrayIndexEnd,elementIndexStart:elementIndexEnd"
*/

function getIndexRangeString ( arrayIndexStart, arrayIndexEnd, elementIndexStart, elementIndexEnd )
{
    // Sanity check
    if ( arrayIndexStart < -1 || arrayIndexEnd < -1 || elementIndexStart < -1 || elementIndexEnd < -1 )
    {
        return "";
    }
    
    // Not allowed as per the requirements of this function (at least a single element has to be specified, right!)
    if ( elementIndexEnd == -1 )
    {
        return "";
    }
        
    // These values create an invalid IndexRange, so reject them here
    if ( elementIndexStart >= elementIndexEnd )
    {
        return "";
    }
        
    // Interested in the arrayIndexStart setting only if arrayIndexEnd != -1 (because else arrayIndexStart is not used)
    if ( arrayIndexEnd != -1)
    {
        // These values create an invalid IndexRange, so reject them here
        if ( arrayIndexStart >= arrayIndexEnd )
        {
            return "";
        }
    }
    
    var indexRangeStringMultiDimension = "";
    var indexRangeStringSingleDimension = "";
    
    // Multi-dimensional array
    if ( arrayIndexEnd != -1)
    {
        // Range specified for the 1st dimension of the multi-dimension array
        if ( arrayIndexStart != -1)
        {
            indexRangeStringMultiDimension = "" + arrayIndexStart + ":" + arrayIndexEnd;
        }
        // Single element specified of the multi-dimension array
        else
        {
            indexRangeStringMultiDimension = "" + arrayIndexEnd;
        }
    }
    
    // Single dimension array or element of the multi-dimension array
    // Dealing with a range
    if ( elementIndexStart != -1)
    {
        indexRangeStringSingleDimension = "" + elementIndexStart + ":" + elementIndexEnd;
    }
    // Single element specified
    else
    {
        indexRangeStringSingleDimension = "" + elementIndexEnd;
    }
    
    // We can create our final IndexRange string at this point
    if ( indexRangeStringMultiDimension != "")
    {
        return ( indexRangeStringMultiDimension + "," + indexRangeStringSingleDimension );
    }
    else
    {
        return ( indexRangeStringSingleDimension );
    }
}

/*
  This function returns the max bound of the given nodeID of the item.
  
  Parameters:
      
      nodeIdOfItem:        UaNodeId. NodeId of the item was are interested in.
*/
function getMaxBoundItem ( nodeIdOfItem )
{
    var readReq = new UaReadRequest();
    var readRes = new UaReadResponse();
    
    g_session.buildRequestHeader( readReq.RequestHeader );
    
    readReq.TimestampsToReturn = TimestampsToReturn.Both;
    readReq.NodesToRead[0].NodeId = nodeIdOfItem;
    readReq.NodesToRead[0].AttributeId = Attribute.Value;
    
    var uaStatus = g_session.read( readReq, readRes );
    
    // check result
    if( uaStatus.isGood() )
    {
        if( checkReadValidParameter( readReq, readRes ) )
        {
            // Get the max bound
            switch( readRes.Results[0].Value.DataType )
            {
                case BuiltInType.String:
                    return readRes.Results[0].Value.toString().length;
                case BuiltInType.ByteString:
                    return readRes.Results[0].Value.toByteString().length;
            }
        }
    }
    
    // Failed to get the max bound of the item
    return -1;
}

/*
  This function creates the values to write to the InnexRangespecified
*/
function getWriteValues ( elementIndexStart, elementIndexEnd, dataType )
{
    // How much to pack into the element
    var sizeOfElement = 0;
    if ( elementIndexStart == -1 )
    {
        sizeOfElement = 1;
    }
    else
    {
        sizeOfElement = ( elementIndexEnd - elementIndexStart + 1);
    }

    // We keep incrementing this number and create our write values
    var nNumberIncrementer = 1;
    var y;

    switch ( dataType )
    {
        case BuiltInType.Boolean:
            writeValues = new UaBooleans ();
            for ( y=0; y<sizeOfElement; y++ )
            {
                writeValues[y] = ( ( (nNumberIncrementer++) % 2 ) === 0 );
            }
            break;

        case BuiltInType.Byte:
            writeValues = new UaBytes ();
            for ( y=0; y<sizeOfElement; y++ )
            {
                writeValues[y] = nNumberIncrementer++;
            }
            break;

        case BuiltInType.SByte:
            writeValues = new UaSBytes ();
            for ( y=0; y<sizeOfElement; y++ )
            {
                writeValues[y] = nNumberIncrementer++;
            }
            break;

        case BuiltInType.DateTime:
            writeValues = new UaDateTimes();
            for ( y=0; y<sizeOfElement; y++ )
            {
                var dateTimeValue = UaDateTime.utcNow ();
                writeValues[y] = dateTimeValue.addHours ( nNumberIncrementer++ );
            }
            break;

        case BuiltInType.Double:
            writeValues = new UaDoubles ();
            for ( y=0; y<sizeOfElement; y++ )
            {
                writeValues[y] = ( nNumberIncrementer++ ) / 0.123;
            }
            break;

        case BuiltInType.Float:
            writeValues = new UaFloats ();
            for ( y=0; y<sizeOfElement; y++ )
            {
                writeValues[y] = ( nNumberIncrementer++ )/ 0.123;
            }
            break;

        case BuiltInType.Guid:
            writeValues = new UaGuids ();
            for ( y=0; y<sizeOfElement; y++ )
            {
                writeValues[y] = new UaGuid ( nNumberIncrementer++ );
            }
            break;

        case BuiltInType.Int16:
            writeValues = new UaInt16s ();
            for ( y=0; y<sizeOfElement; y++ )
            {
                writeValues[y] = 0 - nNumberIncrementer++;
            }
            break;

        case BuiltInType.UInt16:
            writeValues = new UaUInt16s ();
            for ( y=0; y<sizeOfElement; y++ )
            {
                writeValues[y] = nNumberIncrementer++;
            }
            break;

        case BuiltInType.Int32:
            writeValues = new UaInt32s ();
            for ( y=0; y<sizeOfElement; y++ )
            {
                writeValues[y] = 0 - nNumberIncrementer++;
            }
            break;

        case BuiltInType.UInt32:
            writeValues = new UaUInt32s ();
            for ( y=0; y<sizeOfElement; y++ )
            {
                writeValues[y] = nNumberIncrementer++;
            }
            break;

        case BuiltInType.Int64:
            writeValues = new UaInt64s ();
            for ( y=0; y<sizeOfElement; y++ )
            {
                writeValues[y] = 0 - nNumberIncrementer++;
            }
            break;

        case BuiltInType.UInt64:
            writeValues = new UaUInt64s ();
            for ( y=0; y<sizeOfElement; y++ )
            {
                writeValues[y] = nNumberIncrementer++;
            }
            break;

        case BuiltInType.String:
            if( sizeOfElement == 1 )
            {
                writeValues = "";
                for( y=0; y<sizeOfElement; y++ )
                {
                    var chrVal = y+("A".charCodeAt( 0 ));
                    writeValues += String.fromCharCode( chrVal );
                }
            }
            else
            {
                writeValues = new UaStrings();
                for( y=0; y<sizeOfElement; y++ )
                {
                    var strVal = "";
                    for( var z=0; z<sizeOfElement; z++ )
                    {
                        var chrVal = z+("A".charCodeAt( 0 ));
                        strVal += String.fromCharCode( chrVal );
                    }
                    writeValues[y] = strVal;
                }
            }
            break;

        case BuiltInType.ByteString:
            if( sizeOfElement == 1 )
            {
                var strVal = "";
                for( var z=0; z<sizeOfElement; z++ )
                {
                    var chrVal = z+("A".charCodeAt( 0 ));
                    strVal += String.fromCharCode( chrVal );
                }
                writeValues = UaByteString.fromStringData( strVal );
            }
            else
            {
                writeValues = new UaByteStrings();
                for( y=0; y<sizeOfElement; y++ )
                {
                    var strVal = "";
                    for( var z=0; z<sizeOfElement; z++ )
                    {
                        var chrVal = z+("A".charCodeAt( 0 ));
                        strVal += String.fromCharCode( chrVal );
                    }
                    writeValues[y] = UaByteString.fromStringData( strVal );
                }
            }
            break;

        case BuiltInType.XmlElement:
            writeValues = new UaXmlElements ();
            for ( y=0; y<sizeOfElement; y++ )
            {
                writeValues[y] = new UaXmlElement ();
                writeValues[y].setString( "<uactt" + y + ">HelloWorld</uactt" + y + ">" );
            }
            break;

        default:
            addWarning ( "Error is getWriteValues(): Unsupported datatype requested." );
            break;
    }

    // Write values created at this point
    return ( writeValues );
}


function generateArrayWriteValue( startIndex, endIndex, dataType )
{
    var localArray = getWriteValues( startIndex, endIndex, dataType );
    var value = new UaVariant();
    switch ( dataType )
    {
        case BuiltInType.Boolean:
            value.setBooleanArray( localArray );
            break;
        case BuiltInType.Byte:
            value.setByteArray( localArray );
            break;
        case BuiltInType.SByte:
            value.setSByteArray( localArray );
            break;
        case BuiltInType.DateTime:
            value.setDateTimeArray( localArray );
            break;
        case BuiltInType.Double:
            value.setDoubleArray( localArray );
            break;
        case BuiltInType.Float:
            value.setFloatArray( localArray );
            break;
        case BuiltInType.Guid:
            value.setGuidArray( localArray );
            break;
        case BuiltInType.Int16:
            value.setInt16Array( localArray );
            break;
        case BuiltInType.UInt16:
            value.setUInt16Array( localArray );
            break;
        case BuiltInType.Int32:
            value.setInt32Array( localArray );
            break;
        case BuiltInType.UInt32:
            value.setUInt32Array( localArray );
            break;
        case BuiltInType.Int64:
            value.setInt64Array( localArray );
            break;
        case BuiltInType.UInt64:
            value.setUInt64Array( localArray );
            break;
        case BuiltInType.String:
            value.setStringArray( localArray );
            break;
        case BuiltInType.ByteString:
            try
            {
                if( localArray.getRange() !== undefined )
                {
                    value.setByteString( localArray );
                }
            }
            catch( excep )
            {
                value.setByteStringArray( localArray );
            }
            break;
        case BuiltInType.XmlElement:
            value.setXmlElementArray( localArray );
            break;
        default:
            throw ( "generateArrayWriteValue(): Unsupported datatype requested: " + dataType );
    }
    return value;
}


/*
  This function reads the last 'numChars' characters from the given item.
  
    Parameters:
    Subscription:                 Subscription.
    itemString:                   String: Path of the item we want to read from.
    dataType:                     BuiltInType. Has to match the datatype of theitem specified in itemString.Currently only String/ByteString supported
    numChars:                     Numeric. Number of characters to read.
   
*/
function readLastXCharacters( Subscription, itemString, dataType, numChars )
{
    try
    {
        if( !Subscription.SubscriptionCreated )
        {
            addError( "Subscription (in readLastXCharacters) was not created." );
        }
        else
        {
            // Sanity check
            if ( numChars <= 0 )
            {
                throw ( "Invalid number of characters to read: " + numChars );
            }
            
            const ITEM_HANDLE = 0x1234;
            
            // Check if the supplied datatype is supported and get the datatype name for display purposes
            var dataTypeName = "";
            switch ( dataType )
            {
                case BuiltInType.String:
                    dataTypeName = "String";
                    break;
                
                case BuiltInType.ByteString:
                    dataTypeName = "ByteString";
                    break;
                
                default:
                    throw ( "Error in readLastXCharacters(). The only supported datatypes are String/ByteString." );
                
            }
    
            var nodeIdOfItem = UaNodeId.fromString( readSetting( itemString ).toString() );
            var maxBoundOfItem = 0;
            addLog ( "\nSTEP 1: Get the bounds of the '" + dataTypeName + "' item used in this test:\n\t" + nodeIdOfItem.toString() + ".\n" );

            // Write an initial value
            var writeValue = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".substring( 0, numChars + 2 );
            switch ( dataType )
            {
                case BuiltInType.String:
                    writeStringToValue( g_session, nodeIdOfItem, writeValue );
                    break;
                
                case BuiltInType.ByteString:
                    writeByteStringToValue( g_session, nodeIdOfItem, new UaByteString( writeValue ) );
                    break;
            }

            // Get the max bound
            maxBoundOfItem = getMaxBoundItem ( nodeIdOfItem );
            if ( maxBoundOfItem > 0 )
            {
                addLog ( "\n\tMax bound of the item is: " + maxBoundOfItem );
                if ( maxBoundOfItem <= numChars )
                {
                    throw ( "Number of characters to read cannot be greater than the max bound." );
                }
            }
            else
            {
                throw ( "\n\tInvalid Max bound of the item: " + maxBoundOfItem );
            }
            
            // Now, Create the monitored item with the indexrange "maxBoundOfItem-numChars:maxBoundOfItem-1"
            var indexRange = "";
            if ( numChars == 1)
            {
                indexRange = getIndexRangeString( -1, -1, -1, ( maxBoundOfItem - 1 ) );
            }
            else
            {
                indexRange = getIndexRangeString( -1, -1, ( maxBoundOfItem-numChars ), ( maxBoundOfItem-1 ) );
            }
            
            var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
            var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
            g_session.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );
            
            createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
            createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;
            createMonitoredItemsRequest.ItemsToCreate[0] = new UaMonitoredItemCreateRequest();
            createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = nodeIdOfItem;
            createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.IndexRange = indexRange;
            createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.AttributeId = Attribute.Value;
            createMonitoredItemsRequest.ItemsToCreate[0].MonitoringMode = MonitoringMode.Reporting;
            createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.ClientHandle = ITEM_HANDLE;
            createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.SamplingInterval = -1;
            createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.QueueSize = 1;
            createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.DiscardOldest = true;
            
            addLog ( "\nSTEP 2: Creating '" + dataTypeName + "' monitored item with index range of '" + indexRange + "'." );
            uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
            if( uaStatus.isGood() )
            {
                addLog ( "Result:" );
                if ( checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse ) )
                {
                     addLog ( "Item created successfully." );
                }
                else
                {
                    throw ( "Unable to create monitored item." );
                }
                
                // Now, let's write to this item, and read back via publish
                // Create a string here that fills the last three bytes of the ByteString item
                var writeTempString = "";
                var writeValueString = "";
                for ( var x=1; x<=numChars; x++)
                {
                    writeTempString = writeTempString + x;
                }
                writeValueString = writeTempString.substring( 0, numChars );
    
                addLog ( "\nSTEP 3: Writing " + dataTypeName + " '" + writeValueString + "' to the index range '" + indexRange + "' of the item." );
                
                writeReq = new UaWriteRequest();
                writeRes = new UaWriteResponse();
                g_session.buildRequestHeader( writeReq.RequestHeader );
                
                writeReq.NodesToWrite[0].NodeId = createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId;
                writeReq.NodesToWrite[0].AttributeId = Attribute.Value;
                writeReq.NodesToWrite[0].IndexRange = indexRange;
                writeReq.NodesToWrite[0].Value.Value = new UaVariant();
                // Set value according to datatype
                switch ( dataType )
                {
                    case BuiltInType.String:
                        writeReq.NodesToWrite[0].Value.Value.setString( writeValueString );
                        break;
                     
                     case BuiltInType.ByteString:
                        writeValue = new UaByteString( writeValueString );
                        writeReq.NodesToWrite[0].Value.Value.setByteString( writeValue );
                        break;
                }
                
                uaStatus = g_session.write( writeReq, writeRes );
                
                // check result
                if( uaStatus.isGood() )
                {
                    checkWriteValidParameter( writeReq, writeRes, true );
                }
                else
                {
                    addError( "write() failed with status " + uaStatus, uaStatus );
                }
                
                // Wait for Subscription.RevisedPublishingInterval for the write to commit and the datachange to be picked up
                wait( Subscription.RevisedPublishingInterval );
                
                // Next, do a publish to read the value
                addLog ( "\nSTEP 4: Calling publish to read the current value of the item." );
                
                var publishRequest = new UaPublishRequest();
                var publishResponse = new UaPublishResponse();
                g_session.buildRequestHeader( publishRequest.RequestHeader );
                uaStatus = g_session.publish( publishRequest, publishResponse );
                
                if( !uaStatus.isGood() )
                {
                    throw ( "publish() returned bad status: " + uaStatus + ". Stopping test." );
                }
            
                // Check the response parameters are all good
                checkPublishValidParameter( publishRequest, publishResponse );
                
                var publishReceivedValue;
                if( publishResponse.NotificationMessage.NotificationData.length > 0 )
                {
                    var dataChangeEvent = publishResponse.NotificationMessage.NotificationData[0].toDataChangeNotification();
                    if (dataChangeEvent.MonitoredItems.length != 1)
                    {
                        throw ( "Received " + dataChangeEvent.MonitoredItems.length + " datachange notifications when expected 1." );
                    }
    
                   // Check the returned item handle
                   if( dataChangeEvent.MonitoredItems[0].ClientHandle != ITEM_HANDLE )
                   {
                       throw ( "Received datachange notification for incorrect item." );
                   }
                    
                   // Get the data based on the datatype
                   switch ( dataType )
                   {
                       case BuiltInType.String:
                           publishReceivedValue = dataChangeEvent.MonitoredItems[0].Value.Value.toString();
                           break;
                       
                       case BuiltInType.ByteString:
                           publishReceivedValue = dataChangeEvent.MonitoredItems[0].Value.Value.toByteString();
                           break;
                   }
                   
                   if ( publishReceivedValue == null )
                   {
                       throw ( "Error when reading value on publish." );
                   }
                   
                   // Check that the returned string is of length specified in IndexRange i.e 'numChars'
                   // and the returned string is 'writeValueString'
                   var expectedStringValue = writeValueString;
                   
                   addLog ( "\n STEP 5: Verifying the returned " + dataTypeName + " value. Expected length=" + numChars + ", and expected " + dataTypeName + "=" + expectedStringValue + "." );
                   if ( publishReceivedValue.length != numChars)
                   {
                       throw ( "Error! Received " + dataTypeName + " of length " + publishReceivedValue.length + " when expected " + numChars + ".\n\tReceived " + dataTypeName + ": " + publishReceivedValue + ".\n" );
                   }
                   else
                   {
                       var isEqual = false;
                       switch ( dataType )
                       {
                           case BuiltInType.String:
                               isEqual = ( publishReceivedValue == expectedStringValue );
                               break;
                           
                           case BuiltInType.ByteString:
                               var expectedByteStringValue = new UaByteString ( expectedStringValue );
                               isEqual = publishReceivedValue.equals( expectedByteStringValue );
                               break;
                        }
                       
                       if ( isEqual )
                       {
                           addLog ( "Success! We received a " + dataTypeName + " of length '" + numChars + "' and value of '" + expectedStringValue + "' as expected.\n\tReceived " + dataTypeName + ": " + publishReceivedValue + ".\n" );
                       }
                       else
                       {
                           throw ( "Error! Received incorrect "+ dataTypeName + ": \n\t" + publishReceivedValue + ".\n" );
                       }
                   }
                }
                else
                {
                    throw ( "No datachange notification received for item." );
                }
                
                // Cleanup
                // Delete the items we added in this test
                var monitoredItemsIdsToDelete = new UaUInt32s();
                for ( x=0; x<createMonitoredItemsResponse.Results.length; x++)
                {
                    monitoredItemsIdsToDelete[x] = createMonitoredItemsResponse.Results[x].MonitoredItemId;
                }
                deleteMonitoredItems( monitoredItemsIdsToDelete, MonitorBasicSubscription, g_session );
            }
            else
            {
                addError( "createMonitoredItems() returned bad status: " + uaStatus, uaStatus );
            }
        }
    }
    catch ( exception )
    {
        addError ( exception.toString () );
    }
}


/*
  This function reads the range of values specified in the IndexRange of the non-array item.
  
    Parameters:
    Subscription:                 Subscription.
    itemString:                   String: Path of the item we want to read from.
    dataType:                     BuiltInType. Has to match the datatype of theitem specified in itemString.Currently only String/ByteString supported
    elementIndexStart,
    elementIndexEnd               Numeric. Specify the IndexRange. See function getIndexRangeString().
    typeOfWrite                   Numeric: 0: Write inside the index range (datachange notification received)
                                           1: Write outside the index range (no datachange notification received)
                                           2: Write inside the index range as well as outside
*/
function readIndexRangeValues( Subscription, itemString, dataType, elementIndexStart, elementIndexEnd, typeOfWrite )
{
    const ITEM_HANDLE = 0x1234;

    if( !Subscription.SubscriptionCreated )
    {
        addError( "Subscription (in readIndexRangeValues()) was not created." );
    }
    else
    {
        // Sanity checks
        if ( typeOfWrite > 2 )
        {
            throw ( "Error in readIndexRangeValues(): Illegal value for 'typeOfWrite' parameter. Allowed values are:\n\t0: Write inside the index range.\n\t1: Write outside the index range.\n\t2: Write inside the index range as well as outside." );
        }

        if ( elementIndexEnd == -1)
        {
            throw ( "Error in readIndexRangeValues(): At least a single element has to be specified. Check the index range parameters." );
        }

        // Check if the supplied datatype is supported and get the datatype name for display purposes
        var dataTypeName = BuiltInType.toString( dataType );

        // Create our index range string from the given parameters
        var indexString = getIndexRangeString ( -1, -1, elementIndexStart, elementIndexEnd );
        if ( indexString === "" || indexString.islength === 0 )
        {
            throw ( "Error in readIndexRangeValues(): InvalidIndexRange specified." );
        }

        // Write inside/outside range?
        var writeInsideIndexRange = false;
        var numOfWrites = 0;
        if ( typeOfWrite === 0 )
        {
            writeInsideIndexRange = true;
            numOfWrites = 1;
        }
        else if ( typeOfWrite === 1 )
        {
            writeInsideIndexRange = false;
            numOfWrites = 1;
        }
        else
        {
            writeInsideIndexRange = true;
            numOfWrites = 2;
        }

        // Create a single monitored item
        var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
        var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
        g_session.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );
        
        createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
        createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;
        createMonitoredItemsRequest.ItemsToCreate[0] = new UaMonitoredItemCreateRequest();
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = UaNodeId.fromString( readSetting( itemString ).toString() );
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.IndexRange = indexString;
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.AttributeId = Attribute.Value;
        createMonitoredItemsRequest.ItemsToCreate[0].MonitoringMode = MonitoringMode.Reporting;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.ClientHandle = ITEM_HANDLE;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.SamplingInterval = -1;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.QueueSize = 1;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.DiscardOldest = true;
        
        addLog ( "\nSTEP 1: Creating '" + dataTypeName + "' monitored item with index range of '" + indexString + "': \n\t" + createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId );
        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        var x;
        if( uaStatus.isGood() )
        {
            addLog ( "Result:" );
            if ( checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse ) )
            {
                 addLog ( "Item created successfully." );
            }
            else
            {
                throw ( "Unable to create monitored item." );
            }
                
            // Now, let's write to this item, and read back via publish
            for ( var n=0; n<numOfWrites; n++)
            {
                if ( writeInsideIndexRange )
                {
                    // In this case the index range is the same as what was created above
                    addLog ( "\nSTEP 2.a: Writing to the index range '" + indexString + "' of the " + dataTypeName + " item. \nThis index range is the same as the one for the monitored item created above. Datachange notification is expected for this write.");
                }
                // Create a new index range string here
                else
                {
                    // Single element specified
                    if ( elementIndexStart == -1 )
                    {
                        // Simply increment that element, this makes it outside the range.
                        elementIndexEnd = elementIndexEnd + 1;
                    }
                    // Range specified
                    else
                    {
                        // Convert the range to a single element, one higher than elementIndexEnd, this makes it outside the range
                        elementIndexStart = -1;
                        elementIndexEnd = elementIndexEnd + 1;
                    }

                    indexString = getIndexRangeString ( -1, -1, elementIndexStart, elementIndexEnd );
                    if ( indexString === "" || indexString.islength === 0 )
                    {
                        throw ( "Error in readIndexRangeValues(): InvalidIndexRange outside the given range created!" );
                    }

                    addLog ( "\nSTEP 2.a: Writing to the index range '" + indexString + "' of the " + dataTypeName + " item. \nThis index range is outside the index range of the monitored item. Datachange notification is NOT expected for this write.");
                }

                // Now, create our write values
                var writeValues = getWriteValues( elementIndexStart, elementIndexEnd, dataType );
                if ( writeValues.length === 0 )
                {
                    throw ( "Error in readIndexRangeValues(): Unable to create write values." );
                }

                // Display our write values
                addLog ( "\nSTEP 2.b: Writing the following value to the item:");
                addLog ( "\tValue: " + writeValues);

                // Actual write here
                var writeReq = new UaWriteRequest();
                var writeRes = new UaWriteResponse();
                g_session.buildRequestHeader( writeReq.RequestHeader );

                writeReq.NodesToWrite[0].NodeId = createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId;
                writeReq.NodesToWrite[0].AttributeId = Attribute.Value;
                writeReq.NodesToWrite[0].IndexRange = indexString;
                writeReq.NodesToWrite[0].Value.Value = new UaVariant();
                // Write the values based on the datatype
                switch ( dataType )
                {
                    case BuiltInType.Boolean:
                        writeReq.NodesToWrite[0].Value.Value.setBooleanArray( writeValues );
                        break;
                    
                    case BuiltInType.SByte:
                        writeReq.NodesToWrite[0].Value.Value.setSByteArray( writeValues );
                        break;
                        
                    case BuiltInType.DateTime:
                        writeReq.NodesToWrite[0].Value.Value.setDateTimeArray( writeValues );
                        break;
                        
                    case BuiltInType.Double:
                        writeReq.NodesToWrite[0].Value.Value.setDoubleArray( writeValues );
                        break;
                        
                    case BuiltInType.Float:
                        writeReq.NodesToWrite[0].Value.Value.setFloatArray( writeValues );
                        break;
                        
                    case BuiltInType.Guid:
                        writeReq.NodesToWrite[0].Value.Value.setGuidArray( writeValues );
                        break;
                        
                    case BuiltInType.Int16:
                        writeReq.NodesToWrite[0].Value.Value.setInt16Array( writeValues );
                        break;
                        
                    case BuiltInType.UInt16:
                        writeReq.NodesToWrite[0].Value.Value.setUInt16Array( writeValues );
                        break;
                        
                    case BuiltInType.Int32:
                        writeReq.NodesToWrite[0].Value.Value.setInt32Array( writeValues );
                        break;
                        
                    case BuiltInType.UInt32:
                        writeReq.NodesToWrite[0].Value.Value.setUInt32Array( writeValues );
                        break;
                        
                    case BuiltInType.Int64:
                        writeReq.NodesToWrite[0].Value.Value.setInt64Array( writeValues );
                        break;
                        
                    case BuiltInType.UInt64:
                        writeReq.NodesToWrite[0].Value.Value.setUInt64Array( writeValues );
                        break;
                        
                    case BuiltInType.String:
                        writeReq.NodesToWrite[0].Value.Value.setString( writeValues );
                        break;
                    
                    case BuiltInType.ByteString:
                        writeReq.NodesToWrite[0].Value.Value.setByteString( writeValues );
                        break;
                        
                    case BuiltInType.XmlElement:
                        writeReq.NodesToWrite[0].Value.Value.setXmlElementArray( writeValues );
                        break;
                }
                        
                uaStatus = g_session.write( writeReq, writeRes );
                
                // check result
                if( uaStatus.isGood() )
                {
                    checkWriteValidParameter( writeReq, writeRes, true, undefined, true );
                }
                else
                {
                    addError( "write() failed with status " + uaStatus, uaStatus );
                }
                // check if first item failed with Bad_WriteNotSupported. If it failed then it is 
                // highly likely the others did too.
                if( writeRes.Results[0].StatusCode !== StatusCode.BadWriteNotSupported )
                {
                    // Wait for Subscription.RevisedPublishingInterval for the write to commit and the datachange to be picked up
                    wait ( Subscription.RevisedPublishingInterval );

                    // Next, do a publish to read the value
                    addLog ( "\nSTEP 3: Calling publish to read the current value of the item." );

                    var publishRequest = new UaPublishRequest();
                    var publishResponse = new UaPublishResponse();
                    g_session.buildRequestHeader( publishRequest.RequestHeader );
                    uaStatus = g_session.publish( publishRequest, publishResponse );

                    if( !uaStatus.isGood() )
                    {
                        throw ( "publish() returned bad status: " + uaStatus + ". Stopping test." );
                    }

                    // Check the response parameters are all good
                    checkPublishValidParameter( publishRequest, publishResponse );

                    var publishReceivedValue = null;
                    if( publishResponse.NotificationMessage.NotificationData.length > 0 )
                    {
                        if ( writeInsideIndexRange )
                        {
                            addLog ( "Datachange notification received as expected while writing inside the IndexRange.\n" );
                        }
                        else
                        {
                            throw ( "Datachange notification received while writing outside the IndexRange.\n" );
                        }

                        var dataChangeEvent = publishResponse.NotificationMessage.NotificationData[0].toDataChangeNotification();
                        if (dataChangeEvent.MonitoredItems.length != 1)
                        {
                            throw ( "Received " + dataChangeEvent.MonitoredItems.length + " datachange notifications when expected 1." );
                        }

                       // Check the returned item handle
                       if( dataChangeEvent.MonitoredItems[0].ClientHandle != ITEM_HANDLE )
                       {
                           throw ( "Received datachange notification for incorrect item." );
                       }

                       // Get the values based on the datatype
                       print( "\n\n\ndatatype: " + BuiltInType.toString( dataType ) );
                       switch ( dataType )
                       {
                           case BuiltInType.Boolean:
                               publishReceivedValue = dataChangeEvent.MonitoredItems[0].Value.Value.toBooleanArray();
                               break;
                               
                           case BuiltInType.SByte:
                               publishReceivedValue = dataChangeEvent.MonitoredItems[0].Value.Value.toSByteArray();
                               break;
                               
                           case BuiltInType.DateTime:
                               publishReceivedValue = dataChangeEvent.MonitoredItems[0].Value.Value.toDateTimeArray();
                               break;
                           
                           case BuiltInType.Double:
                               publishReceivedValue = dataChangeEvent.MonitoredItems[0].Value.Value.toDoubleArray();
                               break;
                               
                           case BuiltInType.Float:
                               publishReceivedValue = dataChangeEvent.MonitoredItems[0].Value.Value.toFloatArray();
                               break;

                           case BuiltInType.Guid:
                                publishReceivedValue = dataChangeEvent.MonitoredItems[0].Value.Value.toGuidArray();
                                break;

                            case BuiltInType.Int16:
                                publishReceivedValue = dataChangeEvent.MonitoredItems[0].Value.Value.toInt16Array();
                                break;

                            case BuiltInType.UInt16:
                                publishReceivedValue = dataChangeEvent.MonitoredItems[0].Value.Value.toUInt16Array();
                                break;

                            case BuiltInType.Int32:
                                publishReceivedValue = dataChangeEvent.MonitoredItems[0].Value.Value.toInt32Array();
                                break;

                            case BuiltInType.UInt32:
                                publishReceivedValue = dataChangeEvent.MonitoredItems[0].Value.Value.toUInt32Array();
                                break;

                            case BuiltInType.Int64:
                                publishReceivedValue = dataChangeEvent.MonitoredItems[0].Value.Value.toInt64Array();
                                break;

                            case BuiltInType.UInt64:
                                publishReceivedValue = dataChangeEvent.MonitoredItems[0].Value.Value.toUInt64Array();
                                break;

                           case BuiltInType.String:
                               publishReceivedValue = dataChangeEvent.MonitoredItems[0].Value.Value.toString();
                               break;

                           case BuiltInType.ByteString:
                               publishReceivedValue = dataChangeEvent.MonitoredItems[0].Value.Value.toByteString();
                               break;

                          case BuiltInType.XmlElement:
                              publishReceivedValue = dataChangeEvent.MonitoredItems[0].Value.Value.toXmlElementArray();
                              break;
                       }
                       print( "value received: " + publishReceivedValue );
    
                       // Check that the returned array is of length specified in IndexRange
                       // and the returned values are same as what we wrote
                       addLog ( "\nSTEP 4: Verifying the returned " + dataTypeName + " values. Expected " + dataTypeName + " length=" + writeValues.length + ", and expected " + dataTypeName + " values:" );
                       addLog ( "\tValue : " + writeValues + "\n");
     
                        if ( publishReceivedValue == null )
                        {
                           throw ( "Error when reading value on publish." );
                        }

                       if ( publishReceivedValue.length != writeValues.length)
                       {
                           addError ( "Error! Received value of length " + publishReceivedValue.length + " when expected " + writeValues.length + ".\n" );
                       }
                       else
                       {
                           switch ( dataType )
                           {
                               case BuiltInType.Boolean:
                               case BuiltInType.SByte:
                               case BuiltInType.Double:
                               case BuiltInType.Float:
                               case BuiltInType.Int16:
                               case BuiltInType.UInt16:
                               case BuiltInType.Int32:
                               case BuiltInType.UInt32:
                               case BuiltInType.Int64:
                               case BuiltInType.UInt64:
                                   for ( x=0; x<publishReceivedValue.length; x++)
                                   {
                                       if ( publishReceivedValue[x] == writeValues[x] )
                                       {
                                           addLog ( "Success! We received the value of '" + publishReceivedValue[x] + "' as expected for value #" + x );
                                       }
                                       else
                                       {
                                           addError ( "Error! Received incorrect value for value #" + x + " : \n\t" + publishReceivedValue + ".\n" );
                                       }
                                   }
                                   break;
                                   
                               case BuiltInType.DateTime:
                               case BuiltInType.Guid:
                               case BuiltInType.XmlElement:
                                   for ( x=0; x<publishReceivedValue.length; x++)
                                   {
                                       if ( publishReceivedValue[x].equals( writeValues[x] ) )
                                       {
                                           addLog ( "Success! We received the value of '" + publishReceivedValue[x] + "' as expected for value #" + x );
                                       }
                                       else
                                       {
                                           addError ( "Error! Received incorrect value for value #" + x + " : \n\t" + publishReceivedValue + ".\n" );
                                       }
                                   }
                                   break;
                                   
                               case BuiltInType.String:
                                   if ( publishReceivedValue == writeValues )
                                   {
                                       addLog ( "Success! We received the value of '" + publishReceivedValue + "' as expected." );
                                   }
                                   else
                                   {
                                       addError ( "Error! Received incorrect value: \n\t" + publishReceivedValue + ".\n" );
                                   }
                                   break;
                                   
                               case BuiltInType.ByteString:
                                   if ( publishReceivedValue.equals( writeValues ) )
                                   {
                                       addLog ( "Success! We received the value of '" + publishReceivedValue + "' as expected. Received value: \n\t"  + publishReceivedValue );
                                   }
                                   else
                                   {
                                       addError ( "Error! Received incorrect value: \n\t" + publishReceivedValue + ".\n" );
                                   }
                                   break;
                           }
                       }
                    }
                    else
                    {
                        if ( writeInsideIndexRange )
                        {
                            addError ( "No datachange notification received for item.\n" );
                        }
                        else
                        {
                            addLog ( "No datachange notification received as expected while writing outside the IndexRange.\n" );
                        }
                    }

                    // If typeOfWrite == 2, then on the first iteration, writeInsideIndexRange is always true.
                    // Turn this off for the second iteration. If this is the only iteration (typeOfWrite == 0/1), then
                    // the following will have no affect. We will punt out of this for loop anyway.
                    writeInsideIndexRange = false;
                }
            }

            // Cleanup
            // Delete the items we added in this test
            var monitoredItemsIdsToDelete = new UaUInt32s();
            for ( x=0; x<createMonitoredItemsResponse.Results.length; x++)
            {
                monitoredItemsIdsToDelete[x] = createMonitoredItemsResponse.Results[x].MonitoredItemId;
            }
            deleteMonitoredItems( monitoredItemsIdsToDelete, MonitorBasicSubscription, g_session );
        }
        else
        {
            addError( "createMonitoredItems() returned bad status: " + uaStatus, uaStatus );
        }
    }
}

/*
  This function reads the range of values specified in the IndexRange of the array item.
  
    Parameters:
    Subscription:                 Subscription.
    itemString:                   String: Path of the item we want to read from.
    dataType:                     BuiltInType. Has to match the datatype of theitem specified in itemString.Currently only StringArray/ByteStringArray supported
    arrayIndexStart,
    arrayIndexEnd,
    elementIndexStart,
    elementIndexEnd               Numeric. Specify the IndexRange. See function getIndexRangeString().
    typeOfWrite                   Numeric: 0: Write inside the index range (datachange notification received)
                                           1: Write outside the index range (no datachange notification received)
                                           2: Write inside the index range as well as outside
*/
function readIndexRangeArrayValues( Subscription, itemString, dataType, arrayIndexStart, arrayIndexEnd, elementIndexStart, elementIndexEnd, typeOfWrite )
{
    const ITEM_HANDLE = 0x1234;
    if( !Subscription.SubscriptionCreated )
    {
        addError( "Subscription (in readIndexRangeArrayValues()) was not created." );
    }
    else
    {
        // Sanity checks
        if ( typeOfWrite > 2 )
        {
            throw ( "Error in readIndexRangeArrayValues(): Illegal value for 'typeOfWrite' parameter. Allowed values are:\n\t0: Write inside the index range.\n\t1: Write outside the index range.\n\t2: Write inside the index range as well as outside." );
        }

        if ( arrayIndexEnd == -1)
        {
            throw ( "Error in readIndexRangeArrayValues(): Only multi-dimension arrays supported." );
        }

        // Check if the supplied datatype is supported and get the datatype name for display purposes
        var dataTypeName = "";
        switch ( dataType )
        {
            case BuiltInType.String:
                dataTypeName = "StringArray";
                break;
            
            case BuiltInType.ByteString:
                dataTypeName = "ByteStringArray";
                break;
            
            default:
                throw ( "Error in readIndexRangeArrayValues(): The only supported datatypes are String and ByteString." );
        }

        // Create our index range string from the given parameters
        var indexString = getIndexRangeString ( arrayIndexStart, arrayIndexEnd, elementIndexStart, elementIndexEnd );
        if ( indexString == "" || indexString.islength === 0 )
        {
            throw ( "Error in readIndexRangeValues(): InvalidIndexRange specified." );
        }

        // Write inside/outside range?
        var writeInsideIndexRange = false;
        var numOfWrites = 0;
        if ( typeOfWrite === 0 )
        {
            writeInsideIndexRange = true;
            numOfWrites = 1;
        }
        else if ( typeOfWrite === 1 )
        {
            writeInsideIndexRange = false;
            numOfWrites = 1;
        }
        else
        {
            writeInsideIndexRange = true;
            numOfWrites = 2;
        }

        // Create a single monitored item
        var createMonitoredItemsRequest = new UaCreateMonitoredItemsRequest();
        var createMonitoredItemsResponse = new UaCreateMonitoredItemsResponse();
        g_session.buildRequestHeader( createMonitoredItemsRequest.RequestHeader );

        createMonitoredItemsRequest.SubscriptionId = MonitorBasicSubscription.SubscriptionId;
        createMonitoredItemsRequest.TimestampsToReturn = TimestampsToReturn.Both;
        createMonitoredItemsRequest.ItemsToCreate[0] = new UaMonitoredItemCreateRequest();
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId = UaNodeId.fromString( readSetting( itemString ).toString() );
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.IndexRange = indexString;
        createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.AttributeId = Attribute.Value;
        createMonitoredItemsRequest.ItemsToCreate[0].MonitoringMode = MonitoringMode.Reporting;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.ClientHandle = ITEM_HANDLE;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.SamplingInterval = 0;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.QueueSize = 1;
        createMonitoredItemsRequest.ItemsToCreate[0].RequestedParameters.DiscardOldest = true;

        addLog ( "\nSTEP 1: Creating '" + dataTypeName + "' monitored item with index range of '" + indexString + "': \n\t" + createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId );
        var uaStatus = g_session.createMonitoredItems( createMonitoredItemsRequest, createMonitoredItemsResponse );
        if( uaStatus.isGood() )
        {
            addLog ( "Result:" );
            if ( checkCreateMonitoredItemsValidParameter( createMonitoredItemsRequest, createMonitoredItemsResponse ) )
            {
                 addLog ( "Item created successfully." );
            }
            else
            {
                throw ( "Unable to create monitored item." );
            }

            // We keep incrementing this number and create our write values
            var nNumberIncrementer = 1;
            var x;

            // Now, let's write to this item, and read back via publish
            for ( var n=0; n<numOfWrites; n++)
            {
                if ( writeInsideIndexRange )
                {
                    // In this case the index range is the same as what was created above
                    addLog ( "\nSTEP 2.a: Writing to the index range '" + indexString + "' of the " + dataTypeName + " item. \nThis index range is the same as the one for the monitored item created above. Datachange notification is expected for this write.");
                }
                // Create a new index range string here
                else
                {
                    // Single dimension
                    if ( arrayIndexEnd == -1 )
                    {
                        // Single element specified
                        if ( elementIndexStart == -1 )
                        {
                            // Simply increment that element, this makes it outside the range.
                            elementIndexEnd = elementIndexEnd + 1;
                        }
                        // Range specified
                        else
                        {
                            // Convert the range to a single element, one higher than elementIndexEnd, this makes it outside the range
                            elementIndexStart = -1;
                            elementIndexEnd = elementIndexEnd + 1;
                        }
                    }
                    // Multi-dimension array and Single array element specified
                    else if ( arrayIndexStart == -1 )
                    {
                        // Simply increment arrayIndexEnd, this makes it outside the range
                        arrayIndexEnd = arrayIndexEnd + 1;
                    }
                    // Multi-dimension array and array range specified
                    else
                    {
                        // Convert the range to a single array, one higher than arrayIndexEnd, this makes it outside the range
                        arrayIndexStart = -1;
                        arrayIndexEnd = arrayIndexEnd + 1;
                    }

                    indexString = getIndexRangeString ( arrayIndexStart, arrayIndexEnd, elementIndexStart, elementIndexEnd );
                    if ( indexString === "" || indexString.islength === 0 )
                    {
                        throw ( "Error in readIndexRangeValues(): InvalidIndexRange outside the given range created!" );
                    }

                    addLog ( "\nSTEP 2.a: Writing to the index range '" + indexString + "' of the " + dataTypeName + " item. \nThis index range is outside the index range of the monitored item. Datachange notification is NOT expected for this write.");
                }

                // Now, create our write values
                // To store our write values (type depends on the datatype)
                var writeValuesArray;
                if ( dataType == BuiltInType.String )
                {
                    writeValuesArray = UaStrings();
                }
                else
                {
                    writeValuesArray = UaByteStrings();
                }

                // For this multi-dimension array, how many elements to create
                var numElementsToCreate = 0;
                if ( arrayIndexStart === -1 )
                {
                    numElementsToCreate = 1;
                }
                else
                {
                    numElementsToCreate = ( arrayIndexEnd - arrayIndexStart + 1 );
                }

                // How much to pack into each element
                var sizeOfElement = 0;
                if ( elementIndexStart === -1 )
                {
                    sizeOfElement = 1;
                }
                else
                {
                    sizeOfElement = elementIndexEnd - elementIndexStart + 1;
                }

                for ( x=0; x<numElementsToCreate; x++ )
                {
                    var writeValue = "";
                    var writeTempValue = "";
                    for ( var y=0; y<sizeOfElement; y++ )
                    {
                        writeTempValue = writeTempValue + ( nNumberIncrementer++ );
                    }
                    // Truncate if needed
                    writeValue = writeTempValue.substring( 0, sizeOfElement );
                    // Store the final value in the array index
                    if ( dataType == BuiltInType.String )
                    {
                        writeValuesArray[x] = writeValue;
                    }
                    else
                    {
                        writeValuesArray[x] = UaByteString.fromStringData( writeValue );
                    }
                }

                // Display our write values
                addLog ( "\nSTEP 2.b: Writing the following " + writeValuesArray.length + " values to the item:");
                for ( x=0; x<writeValuesArray.length; x++ )
                {
                    addLog ( "\tValue #" + x + ": " + writeValuesArray[x]);
                }

                // Actual write here
                var writeReq = new UaWriteRequest();
                var writeRes = new UaWriteResponse();
                g_session.buildRequestHeader( writeReq.RequestHeader );

                writeReq.NodesToWrite[0].NodeId = createMonitoredItemsRequest.ItemsToCreate[0].ItemToMonitor.NodeId;
                writeReq.NodesToWrite[0].AttributeId = Attribute.Value;

                writeReq.NodesToWrite[0].IndexRange = indexString;
                writeReq.NodesToWrite[0].Value.Value = new UaVariant();
                // Wite the vlues based on the datatype
                switch ( dataType )
                {
                    case BuiltInType.String:
                        writeReq.NodesToWrite[0].Value.Value.setStringArray( writeValuesArray );
                        break;
                    
                    case BuiltInType.ByteString:
                        writeReq.NodesToWrite[0].Value.Value.setByteStringArray( writeValuesArray );
                        break;
                }

                uaStatus = g_session.write( writeReq, writeRes );

                // check result
                if( uaStatus.isGood() )
                {
                    checkWriteValidParameter( writeReq, writeRes, false, undefined, true );
                }
                else
                {
                    addError( "write() failed with status " + uaStatus, uaStatus );
                }
                // did the write fail for the first item with Bad_WriteNotSupported? if so then it is 
                // highly likely the others failed too:
                if( writeRes.Results[0].StatusCode !== StatusCode.BadWriteNotSupported )
                {
                    // Wait for Subscription.RevisedPublishing Interval for the write to commit and the datachange to be picked up
                    addLog( "Waiting one publish interval: " + Subscription.RevisedPublishingInterval + " ms..." );
                    wait( Subscription.RevisedPublishingInterval );

                    // Next, do a publish to read the value
                    addLog ( "\nSTEP 3: Calling publish to read the current value of the item." );

                    var publishRequest = new UaPublishRequest();
                    var publishResponse = new UaPublishResponse();
                    g_session.buildRequestHeader( publishRequest.RequestHeader );
                    uaStatus = g_session.publish( publishRequest, publishResponse );

                    if( !uaStatus.isGood() )
                    {
                        throw ( "publish() returned bad status: " + uaStatus + ". Stopping test." );
                    }

                    // Check the response parameters are all good
                    checkPublishValidParameter( publishRequest, publishResponse );

                    var publishReceivedValue;
                    if( publishResponse.NotificationMessage.NotificationData.length > 0 )
                    {
                        if ( writeInsideIndexRange )
                        {
                            addLog ( "Datachange notification received as expected while writing inside the IndexRange.\n" );
                        }
                        else
                        {
                            throw ( "Datachange notification received while writing outside the IndexRange.\n" );
                        }

                        var dataChangeEvent = publishResponse.NotificationMessage.NotificationData[0].toDataChangeNotification();
                        if (dataChangeEvent.MonitoredItems.length != 1)
                        {
                            throw ( "Received " + dataChangeEvent.MonitoredItems.length + " datachange notifications when expected 1." );
                        }

                       // Check the returned item handle
                       if( dataChangeEvent.MonitoredItems[0].ClientHandle != ITEM_HANDLE )
                       {
                           throw ( "Received datachange notification for incorrect item." );
                       }

                       // Get the values based on the datatype
                       switch ( dataType )
                       {
                           case BuiltInType.String:
                               publishReceivedValue = dataChangeEvent.MonitoredItems[0].Value.Value.toStringArray();
                               break;
                           
                           case BuiltInType.ByteString:
                               publishReceivedValue = dataChangeEvent.MonitoredItems[0].Value.Value.toByteStringArray();
                               break;
                       }
                       // Check that the returned array is of length specified in IndexRange
                       // and the returned values are same as what we wrote
                       addLog ( "\n STEP 4: Verifying the returned " + dataTypeName + " values. Expected " + dataTypeName + " length=" + writeValuesArray.length + ", and expected " + dataTypeName + " values:" );
                       for ( x=0; x<writeValuesArray.length; x++ )
                       {
                           addLog ( "\tValue  #" + x + ": " + writeValuesArray[x]);
                       }

                       if ( publishReceivedValue.length !== writeValuesArray.length )
                       {
                           addError ( "Error! Received value of length " + publishReceivedValue.length + " when expected " + writeValuesArray.length + ".\n" );
                       }
                       else
                       {
                           for ( x=0; x<writeValuesArray.length; x++ )
                           {
                               var isEqual = false;
                               switch ( dataType )
                               {
                                   case BuiltInType.String:
                                       isEqual = ( publishReceivedValue[x] == writeValuesArray[x] );
                                       break;
                                       
                                   case BuiltInType.ByteString:
                                       isEqual = publishReceivedValue[x].equals( writeValuesArray[x] );
                                       break;
                               }
                               
                               if ( isEqual )
                               {
                                   addLog ( "Success! We received the values written '" + writeValuesArray[x] + "' as expected.\n\tReceived value #" + x + ": " + publishReceivedValue[x] + ".\n" );
                               }
                               else
                               {
                                   addError ( "Error! Received incorrect value, we wrote: " + writeValuesArray[x] + " but received: '" + publishReceivedValue[x] + "'" );
                               }
                           }
                       }
                    }
                    else
                    {
                        if ( writeInsideIndexRange )
                        {
                            addError ( "No datachange notification received for item.\n" );
                        }
                        else
                        {
                            addLog ( "No datachange notification received as expected while writing outside the IndexRange.\n" );
                        }
                    }

                    // If typeOfWrite == 2, then on the first iteration, writeInsideIndexRange is always true.
                    // Turn this off for the second iteration. If this is the only iteration (typeOfWrite == 0/1), then
                    // the following will have no affect. We will punt out of this for loop anyway.
                    writeInsideIndexRange = false;
                }
            }

            // Cleanup
            // Delete the items we added in this test
            var monitoredItemsIdsToDelete = new UaUInt32s();
            for ( x=0; x<createMonitoredItemsResponse.Results.length; x++)
            {
                monitoredItemsIdsToDelete[x] = createMonitoredItemsResponse.Results[x].MonitoredItemId;
            }
            deleteMonitoredItems( monitoredItemsIdsToDelete, MonitorBasicSubscription, g_session );
        }
        else
        {
            addError( "createMonitoredItems() returned bad status: " + uaStatus, uaStatus );
        }
    }
}



function GetByteStringsAtIndexRange( val, ir )
{
    var uabs = new UaByteStrings();
    print( "ir = " + ir );
    //first, get the bytestrings of interest
    var twoDims = ir.split( ',' );
    if( twoDims.length !== 2 )
    {
        addError( "invalid indexRange specified." );
    }
    else
    {
        var dim1 = twoDims[0].split( ':' );
        var dim2 = twoDims[1].split( ':' );
        if( dim1.length !== 2 || dim2.length !== 2 )
        {
            addError( "invalid indexRange specified." );
        }
        else
        {
            // now to fetch only the array values of interest
            // which are the first indexRange. 
            //     received "1:2,3:4"; then we care about "1" and "2" [These are the ROWS].
            var i=0;
            for( var d=dim1[0]; d<=dim1[1]; d++ )
            {
                var rawValue = val[d].clone();
                if( rawValue === undefined || rawValue === null || rawValue.length === 0 )
                {
                    addError( "Value unavailable within array at position # " + d );
                    continue;
                }
                // now to replace the contents of each raw element with only a subset
                // value as defined in the remaining indexRange values, e.g.
                //     received "1:2,3:4"; then we care about "3" and "4" [These are the COLUMNS].
                uabs[i++] = rawValue.getRange( dim2[0], dim2[1] );
            }
        }
    }
    return( uabs );
};



function GetStringsAtIndexRange( val, ir )
{
    var uas = new UaStrings();
    print( "ir = " + ir );
    //first, get the bytestrings of interest
    var twoDims = ir.split( ',' );
    if( twoDims.length !== 2 )
    {
        addError( "invalid indexRange specified." );
    }
    else
    {
        var dim1 = twoDims[0].split( ':' );
        var dim2 = twoDims[1].split( ':' );
        if( dim1.length !== 2 || dim2.length !== 2 )
        {
            addError( "invalid indexRange specified." );
        }
        else
        {
            // now to fetch only the array values of interest
            // which are the first index rage, e.g. 
            //     received "1:2,3:4"; then we care about "1" and "2" [These are the ROWS].
            var i=0;
            for( var d=dim1[0]; d<=dim1[1]; d++ )
            {
                var rawValue = val[d];
                if( rawValue === undefined || rawValue === null || rawValue.length === 0 )
                {
                    addError( "Value unavailable within array at position # " + d );
                    continue;
                }
                // now to replace the contents of each raw element with only a subset
                // value as defined in the remaining indexRange values, e.g.
                //     received "1:2,3:4"; then we care about "3" and "4" [These are the COLUMNS].
                print( "read value: " + rawValue + "; start: " + dim2[0] + "; end: " + dim2[1] );
                var startPosition = dim2[0];
                var endPosition = 1 + parseInt( dim2[1] );
                var parsedValue = rawValue.substring( startPosition, endPosition );
                uas[i++] = parsedValue;
            }
        }
    }
    return( uas );
};
/*    Revision History: 
        May-18-2011 NP: Remove WriteHelper reference.
*/

print( "\n\n\n***** CONFORMANCE UNIT 'Attribute Read' TEST SCRIPTS COMPLETE ******\n" );

// revert all nodes back to original values - none should've changed, this is a fail safe
//revertOriginalValuesScalarStatic();

// disconnect from server
disconnect( g_channel, g_session );

// clean-up
//writeHelper = null;
ReadHelper = null;
originalScalarItems = null;
g_session = null;
g_channel = null;
ATTRIBUTE_READ_INVALIDATTRIBUTEID = null;

print( "\n\n\n***** CONFORMANCE UNIT 'Attribute Read' TESTING COMPLETE ******\n" );
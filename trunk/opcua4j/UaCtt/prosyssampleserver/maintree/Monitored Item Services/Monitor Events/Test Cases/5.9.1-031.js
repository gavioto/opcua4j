/*  Test 5.9.1 Test 31 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Monitors the SERVER object specifying an EventFilter where:
            - AttributeId  = Value (13)
            - NodeId       = Specific ARRAY node

        Invoke writes or calls to raise events outside of the filter. 
        For example, if the array is 5 elements long, specify an IndexRange 
        of “2:3” and then write values to elements 0, 1 and 5...

        Invokes writes or calls a method to invoke the Event.
        Calls Publish to make sure the event is received.

    Revision History:
        19-Oct-2009 NP: Initial Version.
*/

function createMonitoredItems591031()
{
    notImplemented( "TODO: Currently awaiting 'FilterOperand' object" );
}

 safelyInvoke( createMonitoredItems591031 );
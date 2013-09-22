/*  RESOURCE TESTING;
    prepared by Nathan Pocock; nathan.pocock@opcfoundation.org

    Description:
        This script will sequentially execute each test script located in the following library location:
            ./Library/ResourceTesting/

        These routines repetitively call a UA Service allowing you to measure the resources used by your
        UA application. The use of a profiling tool is required to obtain valuable resource information, 
        such as the use of Windows Performance Monitor. See the HELP DOCUMENTATION for more information
        on using the CTT and these scripts for resource efficiency checking.

    Revision History
        06-May-2011 NP: Initial version.
*/

// Execute the ATTRIBUTE services tests
include( "./library/ResourceTesting/AttributeServices/Read/ScalarReads.js" );
include( "./library/ResourceTesting/AttributeServices/Read/ScalarMultipleAttributes.js" );
include( "./library/ResourceTesting/AttributeServices/Write/ScalarWrites.js" );
include( "./library/ResourceTesting/AttributeServices/Write/ScalarArrayWrites.js" );

// Execute DISCOVERY services tests
include( "./library/ResourceTesting/DiscoveryServices/FindServers/FindServers.js" );
include( "./library/ResourceTesting/DiscoveryServices/GetEndpoints/GetEndpoints.js" );
include( "./library/ResourceTesting/DiscoveryServices/RegisterServer/RegisterServer.js" );

// MONITORED ITEMS services tests
include( "./library/ResourceTesting/MonitoredItemServices/CreateMonitoredItems/CMIScalar-Disabled.js" );
include( "./library/ResourceTesting/MonitoredItemServices/ModifyMonitoredItems/TimestampsToReturn.js" );
include( "./library/ResourceTesting/MonitoredItemServices/ModifyMonitoredItems/QueueSize.js" );
include( "./library/ResourceTesting/MonitoredItemServices/ModifyMonitoredItems/SamplingInterval.js" );

// Print the audit log
print( "\n\n" + _resLog.toString() );
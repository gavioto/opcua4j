/*  Test 5.7.1-001 prepared by Nathan Pocock; nathan.pocock@opcfoundation.org
    Description:
        Full browse of a valid node, without filters, view=null, browseDirection = Both,
        requestedMaxReferencesPerNode = 0, referenceTypeId = null, nodeClassMask = 0xFF, resultMask = 0x3F.

    Expected result: 
        Service result = Good. Operation result = Good . One element in results[]; browsed references
        in results[0] are correct – which means that all references have been returned (forward and reverse).

    Revision History:
        17-Dec-2010 NP: Initial version.
*/

function Browse_5_7_1_001()
{
    var m1 = MonitoredItem.fromSetting( "/Server Test/NodeIds/References/Has 3 Forward References 1" );
    if( m1 === undefined || m1 === null )
    {
        addSkipped( "[Configuration Issue?] Unable to conduct test. Check setting '/Server Test/NodeIds/References/Has 3 Forward References 1'." );
        return;
    }

    // helper function to quickly set parameter values for browsing
    m1.SetBrowse( BrowseDirection.Both, true, 0xff, null, 0x3f );
    // we are expecting/assuming that the node specified in the settings has 1+ references
    if( BrowseHelper.Execute( m1 ) )
    {
        // all we can do here is to expect the reference count to be greater than zero.
        AssertGreaterThan( 0, BrowseHelper.response.Results[0].References.length, "Expected 1 or more References. Either this node is not configured with References, or, the Server did not assume a <null> ReferenceTypeId means to return all references." );
        // print the results, for debug purposes
        print( BrowseHelper.ResultsToString() );
    }
    // clean-up
    m1 = null;
}

safelyInvoke( Browse_5_7_1_001() );
/*    Test 5.7.2-2 prepared by Dale Pope dale.pope@matrikon.com
      Description:
          Given one node to browse
            And the node exists
            And the node has at least three forward references
            And RequestedMaxReferencesPerNode is 1
            And Browse has been called
          When BrowseNext is called
            And ReleaseContinuationPoints is false
          Then the server returns the second reference
            And ContinuationPoint is not empty

          Validation is accomplished by first browsing all references on a node,
          then performing the test and comparing the second reference to the 
          reference returned by the BrowseNext call. So this test only validates
          that Browse two references is consistent with Browse one reference
          followed by BrowseNext.

      Revision History:
          2009-09-03 DP: Initial version.
          2009-11-28 NP: REVIEWED.
*/

/*global include, TestBrowseNextWhenMoreReferencesExist */

include( "./library/ServiceBased/ViewServiceSet/BrowseNext/release_continuationpoints_test.js" );

// BrowseNext with ReleaseContinuationPoints = false (when more references exist)
TestBrowseNextWhenMoreReferencesExist( false, true );
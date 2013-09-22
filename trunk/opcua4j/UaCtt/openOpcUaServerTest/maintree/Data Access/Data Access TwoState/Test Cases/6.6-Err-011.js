/*  Test 6.6 Error Test 11; prepared by Nathan Pocock nathan.pocock@opcfoundation.org

    Description:
        Write a value of FALSE (as a string).
    Expectations:
        ServiceResult=Good. Results[0]=Bad_TypeMismatch.

    Revision History:
        18-Feb-2010 NP: Initial version.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function write66Err011()
{
    if( twoStateItems == null || twoStateItems.length == 0 )
    {
        _dataTypeUnavailable.store( TSDT );
        addSkipped( TSDT );
        return;
    }
    WriteValue( twoStateItems[0], "0", BuiltInType.String, WriteHelper )
}

safelyInvoke( write66Err011 );
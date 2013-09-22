/*  Test 6.6 Error Test 10; prepared by Nathan Pocock nathan.pocock@opcfoundation.org

    Description:
        Write a value of 0 (as an integer).
    Expectations:
        ServiceResult=Good. Results[0]=Bad_TypeMismatch.

    Revision History:
        18-Feb-2010 NP: Initial version.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function browse66Err010()
{
    if( twoStateItems == null || twoStateItems.length == 0 )
    {
        addSkipped( TSDT );
        return;
    }
    WriteValue( twoStateItems[0], 0, BuiltInType.Int16, WriteHelper )
}

safelyInvoke( browse66Err010 );
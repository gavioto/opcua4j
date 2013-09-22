/*  Test 5.8.1 Test 3; prepared by Development; compliance@opcfoundation.org

    Description:
        Read all attributes from a valid node.

    Revision History
        24-Aug-2009 Dev: Initial version
        06-Nov-2009 NP:  Verified.

     FOR MORE INFORMATION ABOUT THIS AND OTHER TEST CASES, PLEASE REVIEW:
         Test Lab Specifications Part 8 - UA Server Section 5.8.1.
*/

function read581003()
{
    var item = MonitoredItem.fromSettings( NodeIdSettings.ScalarStatic() )[0];
    if( item === null )
    {
        addSkipped( "Static Scalar" );
        return;
    }

    var itemsToRead = [];

    var attribs = new NodeTypeAttributesMatrix();
    var attributeSize = attribs.Variable.size();
    for( var i=0; i<attributeSize; i++ )
    {
        itemsToRead[i] = MonitoredItem.Clone( item );
        itemsToRead[i].AttributeId = attribs.Variable.atIndex(i);
    }
    ReadHelper.Execute( itemsToRead );
}

safelyInvoke( read581003 );
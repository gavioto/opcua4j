/*  This script is responsible for the simple creation of various CTT object types
    in as little as one line of code.

    CTT OBJECT TYPE       | FUNCTION HELPER NAME
    ----------------------|---------------------
    UaExpandedNodeId      | UaExpandedNIDHelper
    UaQualifiedName       | UaQNameHelper

    Revision History:
        12-Nov-2010 NP: Initial version.
*/

/*  UaExpandedNodeId:
        numericId: [integer] the identifier reference (Identifier object).
*/
function UaExpandedNIDHelper( numericId )
{
    var m = new UaExpandedNodeId();
    if( numericId !== undefined && numericId !== null )
    {
        m.NodeId = new UaNodeId( numericId );
    }
    return( m );
}

/*  UaQualifiedName:
        name:   [string] the name to put inside the QualifiedName
        nspace: [int] namespace index (optional);
*/
function UaQNameHelper( name, nspace )
{
    var q = new UaQualifiedName();
    if( name !== undefined && name !== null )
    {
        q.Name = name;
    }
    if( nspace !== undefined && nspace !== null )
    {
        q.NamespaceIndex = nspace;s
    }
    return( q );
}
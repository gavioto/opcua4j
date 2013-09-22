/*  This function is responsible for the simple creation of a UaReferenceDescription
    in as little as one line of code.

    Revision History:
        12-Nov-2010 NP: Initial version.
*/

if ( __INDENT === undefined || __INDENT === null )
{
    var __INDENT = 0;
}

/*  Helper function for defining a ReferenceDescription. Used for InformationModel testing.

    Arguments:
        browseName: [string] the BrowseName of the reference description.
        nodeClass:  [NodeId] the NodeId of the nodeClass.
        typeDef:    [NodeId] the NodeId of the reference type.
        scalarType: [type]   the data-type of the reference type.
        isArray:    [bool]   whether or not the scalar type is an array.
        isRequired: [bool]   whether or not the reference description is required or optional.

    Revision History:
        25-May-2011 NP: Initial version.
*/
function UaRefDescHelper( refType, browseName, nodeClass, typeDef, scalarType, isArray, isRequired, typeInstance )
{
/*    this.referenceDescription = new UaReferenceDescription();
    this.referenceDescription.ReferenceTypeId = new UaNodeId( refType );
    this.referenceDescription.BrowseName.Name = browseName;
    if( nodeClass !== undefined && nodeClass !== null ){ this.referenceDescription.NodeClass = nodeClass; }
    if( typeDef !== undefined && typeDef !== null ){ this.referenceDescription.TypeDefinition = typeDef; }   //e.g. PropertyType, ServerStatusType, VendorServerType etc.*/

    this.ReferenceTypeId = new UaNodeId( refType );
    this.BrowseName = browseName;
    this.NodeClass = nodeClass;
    this.TypeDefinition = typeDef;

    this.DataType = scalarType;
    this.ArrayType = isArray;
    this.Required = isRequired;

    this.TypeInstance = typeInstance;    //e.g. an instance of the type as defined for testing

    this.currentIndent = 0;              //tab control for toString method, indents get further
    this.toString = function()
    {
        var s = "BrowseName: " + this.BrowseName + //referenceDescription.BrowseName +
            "; NodeClass: " + this.NodeClass + //referenceDescription.NodeClass +
            "; TypeDefinition: " + this.TypeDefinition + //referenceDescription.TypeDefinition +
            "; DataType: " + this.DataType +
            "; ArrayType: " + this.ArrayType +
            "; ModellingRule: " + this.Required;
        if( this.TypeInstance !== undefined && this.TypeInstance !== null )
        {
            __INDENT += 1;
            s += this.__refsToString( __INDENT, this.typeInstance );
            __INDENT -= 1;
        }
        return( s );
    }

    this.__refsToString = function( indent, refs )
    {
        var i = 0;
        var s = "";
        if( refs === undefined || refs === null || refs.References === undefined || refs.References.length === 0 )return( s );
        for( i=0; i<refs.References.length; i++ )
        {
            s += "\n";
            for( t=0; t<indent; t++ ){ s += "    " };
            s += ( (1 + i) + ". " + refs.References[i].toString() );
            // see if any nested references exist
/*            if( refs.References[i].typeInstance !== undefined && refs.References[i].typeInstance !== null )
            {
                s += this.__refsToString( (indent + 1), refs.References[i].typeInstance );
            }*/
        }
        return( s );
    }

}

UaRefDescHelper.prototype.toString = function()
{
    return( this.toString() );
}
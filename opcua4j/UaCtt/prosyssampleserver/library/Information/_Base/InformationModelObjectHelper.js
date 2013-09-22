/*  Base class for defining an object for use with information model checking.

    Revision History:
        25-May-2011 NP: Initial version.
*/

const ARRAY    = true;
const NOTARRAY = false;
const REQUIRED = true;
const OPTIONAL = false;

/*  Base InformationModel object class. Used for InformationModel testing.

    Revision History:
        25-May-2011 NP: Initial version.
*/
function IM()
{
    this.Name = "";
    this.References = [];
    this.toString = function()
    {
        var s = this.Name + "; References size: " + this.References.length;
        for( r=0; r<this.References.length; r++ )
        {
            s += "\n" + (1 + r) + ". " + this.References[r].toString();
        }
        return( s );
    }
}


/*  Helper function for defining Attribute details. Used for InformationModel testing.

    Arguments:
        name: string - The name of the attribute
        id: number - AttributeId 
        dataType: number - Identifier data type
        required: bool - Mandatory requirement?
        isArray: bool - If the data-type is an array

    Revision History:
        25-May-2011 NP: Initial version.
*/
function IM_AttributeDetail( name, id, dataType, required, isArray )
{
    this.Name = "";
    this.DataType = Identifier.BaseDataType;
    this.Required = false;
    this.AttributeId = Attribute.Value;
    this.Array = false;

    // constructor
    if( arguments.length > 0 )
    {
        if( name !== undefined && name !== null ){ this.Name = name; }
        if( id !== undefined && id !== null ){ this.AttributeId = id; }
        if( dataType !== undefined && dataType !== null ){ this.DataType = dataType; }
        if( required !== undefined && required !== null ){ this.Required = required; }
        if( isArray !== undefined && isArray !== null ){ this.Array = isArray; }
    }
}

/*  Helper function for defining a REFERENCE. Used for InformationModel testing.

    Revision History:
        25-May-2011 NP: Initial version.
*/
function IM_ReferenceDefinition( name, isRequired, arrayMin, arrayMax, refTypeId )
{
    this.Name = "";
    this.Required = false;
    this.ArrayMin = 0;
    this.ArrayMax = 0;
    this.ReferenceTypeId = null;

    // constructor
    if( arguments.length !== 5 )
    {
        if( name !== undefined && name !== null ){ this.Name = name; }
        if( isRequired !== undefined && isRequired !== null ){ this.Required = isRequired; }
        if( arrayMin !== undefined && arrayMin !== null ){ this.ArrayMin = arrayMin; }
        if( arrayMax !== undefined && arrayMax !== null ){ this.ArrayMax = arrayMax; }
        if( refTypeId !== undefined && refTypeId !== null ){ this.ReferenceTypeId = refTypeId; }
    }
}


/*  Helper function for defining a STANDARD PROPERTY. Used for InformationModel testing.

    Revision History:
        25-May-2011 NP: Initial version.
*/
function IM_PropertyDefinition( name, isRequired, dataType, isArray )
{
    this.Name = "";
    this.Required = false;
    this.DataType = Identifier.Integer;
    this.Array = false;

    // constructor
    if( arguments.length > 0 )
    {
        if( name !== undefined && name !== null ){ this.Name = name; }
        if( isRequired !== undefined && isRequired !== null ){ this.Required = isRequired; }
        if( dataType !== undefined && dataType !== null ){ this.DataType = dataType; }
        if( isArray !== undefined && isArray !== null ){ this.Array = isArray; }
    }
}


/*  Helper function for defining a NODECLASS. Used for InformationModel testing.

    Arguments:
        name: string - The name of the attribute
        attributeDetails: Array of IM_AttributeDetail objects.
        references: Array of IM_ReferenceDefinition objects.
        properties: Array of IM_PropertyDefinition objects.

    Revision History:
        25-May-2011 NP: Initial version.
*/
function IM_NodeClassDefinition( name, attributes, references, properties )
{
    this.Name = "";
    this.Attributes = [];
    this.References = [];
    this.Properties = [];

    // constructor
    if( arguments.length > 0 )
    {
        if( name !== undefined && name !== null ){ this.Name = name; }
        if( attributes !== undefined && attributes !== null ){ this.Attributes = attributes; }
        if( references !== undefined && references !== null ){ this.References = references; }
        if( properties !== undefined && properties !== null ){ this.Properties = properties; }
    }
}
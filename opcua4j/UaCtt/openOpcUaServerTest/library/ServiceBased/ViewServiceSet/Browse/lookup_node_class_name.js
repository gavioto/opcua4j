// Return the name of the given node class enum value
function LookupNodeClassName( nodeClass )
{
    switch( nodeClass )
    {
        case NodeClass.Object:
            return "Object";
        case NodeClass.Variable:
            return "Variable";
        case NodeClass.Method:
            return "Method";
        case NodeClass.ObjectType:
            return "ObjectType";
        case NodeClass.VariableType:
            return "VariableType";
        case NodeClass.ReferenceType:
            return "ReferenceType";
        case NodeClass.DataType:
            return "DataType";
        case NodeClass.View:
            return "View";
    }
    return nodeClass;
}
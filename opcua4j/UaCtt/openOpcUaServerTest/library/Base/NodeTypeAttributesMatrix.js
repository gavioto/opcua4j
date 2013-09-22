function NodeTypeAttributesMatrix()
{
    
    //VARIABLE
    this.Variable = new IntegerSet();
    this.Variable.insert( [
            Attribute.AccessLevel,
            Attribute.BrowseName,
            Attribute.DateType,
            Attribute.DisplayName,
            Attribute.Historizing,
            Attribute.NodeClass,
            Attribute.NodeI,
            Attribute.UserAccessLevel,
            Attribute.Value,
            Attribute.ValueRank
        ] );
        
    //VARIABLETYPE
    this.VariableType = new IntegerSet();
    this.VariableType.insert( [
            Attribute.BrowseName,
            Attribute.DataType,
            Attribute.DisplayName,
            Attribute.IsAbstract,
            Attribute.NodeClass,
        ] );
        
    //OBJECT
    this.Object = new IntegerSet();
    this.Object.insert( [
            Attribute.BrowseName,
            Attribute.DisplayName,
            Attribute.EventNotifier,
            Attribute.NodeClass,
            Attribute.NodeId
        ] );
        
    //OBJECTTYPE
    this.ObjectType = new IntegerSet();
    this.ObjectType.insert( [
            Attribute.BrowseName,
            Attribute.DisplayName,
            Attribute.IsAbstract,
            Attribute.NodeClass,
            Attribute.NodeId
        ] );

    //REFERENCETYPE
    this.ReferenceType = new IntegerSet();
    this.ReferenceType.insert( [
            Attribute.BrowseName,
            Attribute.DisplayName,
            Attribute.IsAbstract,
            Attribute.NodeClass,
            Attribute.NodeId,
            Attribute.Symmetric
        ] );
    
    //DATATYPE
    this.DataType = new IntegerSet();
    this.DataType.insert( [
            Attribute.BrowseName,
            Attribute.DisplayName,
            Attribute.IsAbstract,
            Attribute.NodeClass,
            Attribute.NodeId
        ] );
        
    //METHOD
    this.Method = new IntegerSet();
    this.Method.insert( [
            Attribute.BrowseName,
            Attribute.DisplayName,
            Attribute.Executable,
            Attribute.NodeClass,
            Attribute.NodeId,
            Attribute.UserExecutable
        ] );
    
    //VIEW
    this.View = new IntegerSet();
    this.View.insert( [
            Attribute.BrowseName,
            Attribute.ContainsNoLoops,
            Attribute.DisplayName,
            Attribute.EventNotifier,
            Attribute.NodeClass,
            Attribute.NodeId
        ] );
}

/*******************************************
// test code for NodeTypeAttributesMatrix

var matrix = new NodeTypeAttributesMatrix();
print( "Variable.size = " + matrix.Variable.size() + "; contents " + matrix.Variable.toString() );
print( "VariableType.size = " + matrix.VariableType.size() + "; contents " + matrix.VariableType.toString() );
print( "Object.size = " + matrix.Object.size() + "; contents " + matrix.Object.toString() );
print( "ObjectType.size = " + matrix.ObjectType.size() + "; contents " + matrix.ObjectType.toString() );
print( "ReferenceType.size = " + matrix.ReferenceType.size() + "; contents " + matrix.ReferenceType.toString() );
print( "DataType.size = " + matrix.DataType.size() + "; contents " + matrix.DataType.toString() );
print( "Method.size = " + matrix.Method.size() + "; contents " + matrix.Method.toString() );
print( "View.size = " + matrix.View.size() + "; contents " + matrix.View.toString() );

*/
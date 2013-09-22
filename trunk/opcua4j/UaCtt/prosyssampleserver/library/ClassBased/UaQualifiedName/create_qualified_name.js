/*global UaQualifiedName */

function CreateQualifiedName( namespaceIndex, name )
{
    var qualifiedName = new UaQualifiedName();
    qualifiedName.NamespaceIndex = namespaceIndex;
    qualifiedName.Name = name;
    return qualifiedName;
}


// Create a QualifiedName from a string of format "0:MyBrowseName"
function CreateQualifiedNameFromString( str )
{
    var ar = str.split(":");
    ar[0] = ar[0].replace( /([0-9]+)/, "$1" );
    ar[1] = ar[1].replace( /^\s+/, "" );
    ar[1] = ar[1].replace( /\s+$/, "" );
    return CreateQualifiedName( ar[0], ar[1] );
}


// Create an array of QualifiedNames from a string of format
// "0:MyBrowseName1 / 1:MyBrowseName2"
function CreateQualifiedNamesArrayFromString( str )
{
    var qualifiedNames = str.split( "/" );
    for( var i = 0; i < qualifiedNames.length; i++ )
    {
        qualifiedNames[i] = CreateQualifiedNameFromString( qualifiedNames[i] );
    }
    return qualifiedNames;
}
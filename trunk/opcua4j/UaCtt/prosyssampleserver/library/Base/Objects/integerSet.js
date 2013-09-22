// Object representing a set of numbers
// available methods:
// insert(), contains(), remove(), size(), atIndex(), clear()
function IntegerSet( values )
{
    this.numElements = 0;
    
    // add element to set
    this.insert = function(value)
    {
        if( arguments.length == 1 && typeof( value ) == "number" )
        {
            this[value] = value;
            this.numElements++;
            return true;
        }
        else
        {
            if( value.length > 1 )
            {
                for( var i=0; i<value.length; i++ )
                {
                    if( typeof( value[i] ) == "number" )
                    {
                        this[value[i]] = value[i];
                        this.numElements++;
                    }
                    else
                    {
                        //temp code - TODO: Remove IF but keep Return
                        if( value[i] != null )
                        {
                            return( false );
                        }
                    }
                }
                return( true );
            }
        }
        
        return false;
    }
    
    // return the element at index index
    this.atIndex = function(index)
    {
        if( arguments.length == 1 && typeof(index) == "number" && 0 <= index && index < this.numElements )
        {
            // values has index 0 -> numElements-1
            // properties index is numOwnProperties -> numOwnProperties + numElements
            var propIndex = this.numOwnProperties + index;
            
            var currentProp = 0;
            for( var i in this )
            {   
                if( currentProp++ == propIndex )
                {
                    return parseInt( i ); //NP 15-Sep-2009: added "parseInt" because return value was coming back as a STRING
                }
            }
        }
        
        return undefined;
    } 
    
    // check if set contains this element
    this.contains = function(value)
    {
        if( arguments.length == 1 && typeof(value) == "number" )
        {
            if( this.hasOwnProperty( value ) )
            {
                return true;
            }
        }
        
        return false;
    } 
    
    // remove element from set
    this.remove = function(value)
    {
        if( arguments.length == 1 && typeof(value) == "number" )
        {
            if( this.hasOwnProperty( value ) )
            {
                delete this[value];
                this.numElements--;
                return true;
            }
        }
        
        return false;
    }

    // return number of elements in the set
    this.size = function()
    {
        return fct_util_getNumProperties(this) - this.numOwnProperties;
    }
    
    // return number of elements in the set
    this.length = function()
    {
        return fct_util_getNumProperties(this) - this.numOwnProperties;
    }
    
    // clear all entries
    this.clear = function()
    {
        var count = 0;
        for( var i in this )
        {  
            if( ++count > this.numOwnProperties )
            {
                delete this[i];
            }
        }
        numElements = 0;
    }
    
    // number of properties held by the Integerset object
    this.numOwnProperties = 0;
    
    // print all elements
    this.toString = function()
    {
        var propIndex = 0;
        var result = "[";
        var numElement = 0;
        for( var i in this )
        {
            if( ++propIndex > this.numOwnProperties )
            {
                if( numElement++ > 0 )
                {
                    result += "|";
                }
                result += i.toString();
            }
        }
        result += "]";
        return result;
    }
    
    // Class constructor
    if( values !== undefined )
    {
        if( values.length !== undefined )
        {
            // an array of values
            for( v=0; v<values.length; v++ )
            {
                if( typeof( values[v] ) == "number" )
                {
                    this.insert( values[v] );
                }
            }// for v...
        }
        else
        {
            // single value
            if( typeof( values ) == "number" )
            {
                this.insert( values );
            }
        }
    }

    this.numOwnProperties = fct_util_getNumProperties( this );
}

function fct_util_getNumProperties(object)
{
    var count = 0;
    for( var i in object )
    {
        count++;
    }
    return count;
}


/****************************
// test code for IntegerSet

var mySet = new IntegerSet()

mySet.insert(2)
mySet.insert(8)
mySet.insert(3)

print("mySet.size = " + mySet.size())

for(var i = 0; i < mySet.size(); i++)
{
    print("mySet.atIndex(" + i + ") = " + mySet.atIndex(i))
}

print("mySet = " + mySet)
mySet.remove(8)
print("mySet = " + mySet)
mySet.remove(3)
print("mySet = " + mySet)
mySet.clear()
print("mySet = " + mySet)

print("IntegerSet.prototype.isPrototypeOf(mySet) = " + IntegerSet.prototype.isPrototypeOf(mySet))
print("mySet instanceof IntegerSet = " + (mySet instanceof IntegerSet))


//****************************/

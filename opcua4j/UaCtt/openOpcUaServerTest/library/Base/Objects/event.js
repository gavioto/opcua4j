/*    Class object for OPC UA Events

      Revision History:
          19-Oct-2009 NP: 
*/
function Event()
{

    this.Id = 0;
}
/*    Takes an array of SelectClauses, and turns into a fully qualified EventFilter.
      Example:
          var eventFilter = Event.GetEventFilter( ["SourceName", "Message", "Severity", "ReceiveTime"] );
*/
Event.GetEventFilter = function( selectClause, whereClause )
{
    if( arguments.length == 0 || arguments.length > 2 )
    {
        throw( "Event.GetEventFilter() arguments requires selectClauses (array of Strings) AND OPTIONALLY whereClause (array of Strings)" );
    }

    // set event filter
    var filter = new UaExtensionObject();
    var eventFilter = new UaEventFilter();

    // SELECT CLAUSE(s)
    eventFilter.SelectClauses = new UaSimpleAttributeOperands();
    if( selectClause !== undefined )
    {
        if( selectClause.length == undefined )
        {
            selectClause = [selectClause];
        }
        for( var s=0; s<selectClause.length; s++ ) // 's' for Select
        {
            // fill clause for SourceName
            eventFilter.SelectClauses[s].AttributeId = Attribute.Value;
            eventFilter.SelectClauses[s].TypeDefinitionId = new UaNodeId(Identifier.BaseEventType, 0);
            eventFilter.SelectClauses[s].BrowsePath[0].Name = selectClause[s];
            eventFilter.SelectClauses[s].BrowsePath[0].NamespaceIndex = 0;
        }// for e...
    }


    // WHERE CLAUSE(s)
    if( whereClause !== undefined )
    {
        eventFilter.WhereClause = new UaContentFilter();
        if( whereClause.length == undefined )
        {
            whereClause = [whereClause]; // turn the parameter into an array of one object
        }
        for( var w=0; w<whereClause.length; w++ ) // 'w' for Where
        {
            /* Structure is:
                    Where = UaContentFilter()
                        Elements[0] = new UaContentFilterElement();
                            Elements[0].FilterOperator = Equals (equals, requires 2 operands
                            Elements[0].FilterOperands[0] = new ...
                            Elements[0].FilterOperands[1] = new ...
            */
            var eventWhereClause = this.parseWhereArg( whereClause[w] );
            eventFilter.WhereClause[w].Elements[0] = new UaContentFilterElement();
            eventFilter.WhereClause[w].Elements[0].FilterOperator = FilterOperator.Like;
            eventFilter.WhereClause[w].Elements[0].FilterOperands[0] = eventWhereClause;
            //eventFilter.WhereClause[w].Elements[0].FilterOperands[0].setAttributeOperand( eventWhereClause );
        }// for w...
    }

    // set filter
    filter.setEventFilter( eventFilter );

    return( filter );
}// GetEventFilter()
    
    
/*    Takes dataChange filter settings and returns a UaDataChangeFilter object.
      Parameters are:
          - deadbandType      - This is the DeadbandType enum.
          - deadbandValue     - Value to specify for the deadband.
          - dataChangeTrigger - This is the DataChangeTrigger enum.
*/
Event.GetDataChangeFilter = function( deadbandType, deadbandValue, dataChangeTrigger )
    {
        if( arguments.length != 3 )
        {
            throw( "Arguments missing! 'deadbandType', 'deadbandValue', 'dataChangeTrigger'. Returned by 'Event.GetDataChangeFilter()'" );
        }
        
        var filter = new UaExtensionObject();
        var dataChangeFilter = new UaDataChangeFilter();
        dataChangeFilter.DeadbandType = deadbandType;
        dataChangeFilter.DeadbandValue = deadbandValue;
        dataChangeFilter.Trigger = dataChangeTrigger;
        filter.setDataChangeFilter(dataChangeFilter);
        
        return( filter );
    }


/*    Takes a formatted string and returns as a WHERE clause, as follows:
        <attributeId>:<browsePath>:<IndexRange>:<NodeId>
        e.g.
            Attribute.Value:"":"1:2":"NS0|IdentifierTypeNumeric:1234"
*/
Event.parseWhereArg = function( clause )
    {
        if( clause == undefined )
        {
            throw( "Argument error, 'clause' not specified in parseWhereArg()" );
        }
        var clauseSplit = clause.split( ":" );
        if( clauseSplit.length != 4 )
        {
            throw( "Argument error, 'clause' syntax error. Not enough values specified. Length expected=4, but received: " + clauseSplit.length );
        }
        var where = new UaAttributeOperand();
        where.AttributeId = clauseSplit[0];
        //where.BrowsePath  = clauseSplit[1];
        where.IndexRange  = clauseSplit[2];
        
        // NodeId might have different syntax, i.e.
        //   1234  = just the id
        //   NS0 | IdentifierTypeNumeric | 1234 = fully qualified
        var splitNodeId = clauseSplit[3].split("|");
        if( splitNodeId.length == 1 )
        {
            where.Node = new UaNodeId( clauseSplit[3] );
        }
        else
        {
            where.NodeId = new UaNodeId.fromString( clauseSplit[3] );
        }
        return( where );
    }
    
Event.whereArgToString = function( clause )
{
    var whereString = "";
    if( clause != undefined && clause.AttributeId != undefined )
    {
        whereString = clause.AttributeId +
                      ":" + clause.BrowsePath +
                      ":" + clause.IndexRange +
                      ":" + clause.NodeId;
    }
    return( whereString );
}


/* TESTING
include( "./library/Base/assertions.js" );
var e = new Event();

// this.parseWhereArg = function( clause )
//    no args, should fail
try{var w=e.parseWhereArg();AssertEqual("", w);}catch( ex ){print("Error received=GOOD:"+ex.toString());}
//    one arg, invalid string, expect empty string
try{var w=e.parseWhereArg("?1235");AssertEqual("",w);}catch(ex){print("Error received=GOOD:"+ex.toString());}
//    one arg, valid syntax - all params
try{var w=e.parseWhereArg(Attribute.Value+":browsePath:1-2:"+Identifier.Server);AssertNotNullOrEmpty(w);}catch(ex){print("Error received=BAD:"+ex.toString());}

// this.GetDataChangeFilter = function( deadbandType, deadbandValue, dataChangeTrigger )

// this.GetEventFilter = function( selectClause, whereClause )
// no params
try{var w=e.GetEventFilter();AssertNotNullOrEmpty(w);}catch(ex){print("Error received=GOOD:"+ex.toString());}
// 3 params
try{var iv1=0;var iv2=0;var iv3=0;var w=e.GetEventFilter(iv1,iv2,iv3);AssertNotNullOrEmpty(w);}catch(ex){print("Error received=GOOD:"+ex.toString());}
// 1 param, select
try{var w=e.GetEventFilter(["SourceName","Message","Severity","ReceiveTime"]);AssertNotNullOrEmpty(w);}catch(ex){print("Error received=BAD:"+ex.toString());}
// 2 params, select + where
try{var w=e.GetEventFilter(["SourceName","Message","Severity","ReceiveTime"],[""+Attribute.Value+":browsePath:1-2:"+Identifier.Server]);AssertNotNullOrEmpty(e);}catch(ex){print("Error received=BAD:"+ex.toString());}
*/
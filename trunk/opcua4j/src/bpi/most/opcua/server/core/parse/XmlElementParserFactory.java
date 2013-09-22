package bpi.most.opcua.server.core.parse;

public class XmlElementParserFactory {

	public static IXmlElementParser getInstance(String elementName){
		IXmlElementParser parserInstance = null;
		
		if ("Object".equals(elementName)){
			parserInstance = new ObjectElementParser();
		}else if ("DataType".equals(elementName)){
			parserInstance = new DataTypeElementParser();
		}else if ("ReferenceType".equals(elementName)){
			parserInstance = new ReferenceTypeElementParser();
		}else if ("ObjectType".equals(elementName)){
			parserInstance = new ObjectTypeElementParser();
		}else if ("VariableType".equals(elementName)){
			parserInstance = new VariableTypeElementParser();
		}else if ("Property".equals(elementName)){
			parserInstance = new PropertyElementParser();
		}else if ("Variable".equals(elementName)){
			parserInstance = new VariableElementParser();
		} 
		
		return parserInstance;
	}
	
}

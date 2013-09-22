package bpi.most.opcua.server.core.parse;

import java.util.Locale;

import org.jdom2.Element;

import bpi.most.opcua.server.core.adressspace.INodeIDs;

/**
 * is able to parse a specific xml element
 * 
 * @author harald
 *
 */
public interface IXmlElementParser {

	public ParsedElement parseElement(Element elem, INodeIDs nodeIds, Locale locale);
	
}

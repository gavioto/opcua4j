package bpi.most.opcua.server.core.parse;

import java.util.Locale;

import org.jdom2.Element;

import bpi.most.opcua.server.core.adressspace.INodeIDs;

public class VariableElementParser extends AbstractElementParser {

	@Override
	public ParsedElement parseElement(Element elem, INodeIDs nodeIds,
			Locale locale) {

		return new ParsedElement();
	}

}

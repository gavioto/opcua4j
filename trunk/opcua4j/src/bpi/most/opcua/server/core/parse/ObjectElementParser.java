package bpi.most.opcua.server.core.parse;

import java.util.List;
import java.util.Locale;

import org.apache.log4j.Logger;
import org.jdom2.Element;
import org.opcfoundation.ua.builtintypes.NodeId;
import org.opcfoundation.ua.builtintypes.UnsignedByte;
import org.opcfoundation.ua.core.AddReferencesItem;
import org.opcfoundation.ua.core.Identifiers;
import org.opcfoundation.ua.core.Node;

import bpi.most.opcua.server.core.adressspace.INodeIDs;
import bpi.most.opcua.server.core.adressspace.NodeFactory;
import bpi.most.opcua.server.core.util.NodeUtils;

/**
 * is able to parse an object-element
 * 
 * @author harald
 * 
 */
public class ObjectElementParser extends AbstractElementParser {

	private static final Logger LOG = Logger
			.getLogger(ObjectElementParser.class);

	@Override
	public ParsedElement parseElement(Element elem, INodeIDs nodeIds,
			Locale locale) {
		this.elem = elem;
		this.nodeIds = nodeIds;
		this.locale = locale;

		ParsedElement pe = new ParsedElement();

		String browseName = readBrowseName();
		NodeId nodeId = getNodeIdBySymName();
		if (nodeId != null) {
			Node newNode = NodeFactory.getObjectNodeInstance(browseName, "desc goes here", browseName, locale, nodeId, new UnsignedByte(0));

			
			// parse references
			List<AddReferencesItem> referenceList = readReferences(newNode);
			
			NodeId typeDef = readTypeDefinition();
			
			if (typeDef != null){
				//add a reference to the typedef
				AddReferencesItem newRef = new AddReferencesItem(newNode.getNodeId(),
						Identifiers.HasTypeDefinition, true, null,
						NodeUtils.toExpandedNodeId(typeDef), NodeUtils.getTypeClass(newNode.getNodeClass()));
				pe.addAddReferencesItem(newRef);
			}
			
			pe.addNode(newNode);
			pe.addAddReferencesItemList(referenceList);
			
			//parse children
			ParsedElement children = readChildren(newNode);
//			LOG.debug(String.format("got %d children", children.getNodes().size()));
			pe.addNodeList(children.getNodes());
			pe.addAddReferencesItemList(children.getRefItems());

//			LOG.debug("parsed browsename: " + browseName);
		}else{
			LOG.debug("no nodeid found four element " + readSymbolicName());
		}

		return pe;
	}
}

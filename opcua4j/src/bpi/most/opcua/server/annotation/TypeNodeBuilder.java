package bpi.most.opcua.server.annotation;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.apache.log4j.Logger;
import org.opcfoundation.ua.builtintypes.ExpandedNodeId;
import org.opcfoundation.ua.builtintypes.LocalizedText;
import org.opcfoundation.ua.builtintypes.NodeId;
import org.opcfoundation.ua.builtintypes.QualifiedName;
import org.opcfoundation.ua.builtintypes.UnsignedByte;
import org.opcfoundation.ua.builtintypes.UnsignedInteger;
import org.opcfoundation.ua.builtintypes.Variant;
import org.opcfoundation.ua.core.AccessLevel;
import org.opcfoundation.ua.core.Identifiers;
import org.opcfoundation.ua.core.Node;
import org.opcfoundation.ua.core.NodeClass;
import org.opcfoundation.ua.core.ObjectNode;
import org.opcfoundation.ua.core.ObjectTypeNode;
import org.opcfoundation.ua.core.ReferenceNode;
import org.opcfoundation.ua.core.VariableNode;

import bpi.most.opcua.server.core.UAServerException;
import bpi.most.opcua.server.core.adressspace.AddressSpace;
import bpi.most.opcua.server.core.adressspace.NodeFactory;
import bpi.most.opcua.server.core.util.NodeUtils;

/**
 * builds type nodes for a given nodemapping
 * 
 * @author harald
 *
 */
public class TypeNodeBuilder {

	private static final String TYPE_SUFFIX = "Type";
	private static final Logger LOG = Logger.getLogger(TypeNodeBuilder.class);
	
	private Locale locale;
	private int nsIndex;
	private AddressSpace addrSpace;
	
	public TypeNodeBuilder(Locale locale, int nsIndex) {
		this.locale = locale;
		this.nsIndex = nsIndex;
		addrSpace = AddressSpace.getInstance();
	}

	/**
	 * builds a typenode for the given nodeMapping. the typenode is wired up with all child instance declarations.
	 * the built node and all its child nodes are returned as a flat list. the first node in the list
	 * is allways the typenode as root. the nodes are not added to the addressspace here, the caller has to handle this
	 * @param nodeMapping
	 * @return
	 */
	public List<Node> buildTypeNode(NodeMapping nodeMapping){
		List<Node> createdNodes = new ArrayList<Node>();
		
		/*
		 * the name of the type is unique.
		 */
		String typeName = nodeMapping.getNodeName() + TYPE_SUFFIX;
		NodeId typeId = new NodeId(nsIndex, typeName);
		
		Node typeNode = null;
		
		if (NodeClass.Object.equals(nodeMapping.getNodeClass())){
			typeNode = NodeFactory.getObjectTypeNodeInstance(typeName, null, typeName, locale, typeId, false);
		}else if (NodeClass.Variable.equals(nodeMapping.getNodeClass())){
			typeNode = NodeFactory.getVariableTypeNodeInstance(typeName, null, typeName, locale, typeId, false);
		}
		
		createdNodes.add(typeNode);
		
		//add properties
		for (String fieldName: nodeMapping.getReferencesByName().keySet()){
			ReferenceMapping refMapping = nodeMapping.getReferenceByName(fieldName);
			
			//Create the instance declaration
			Node instDecl = buildInstanceDeclaration(refMapping, typeName);
			
			//create a reference to them
			NodeUtils.addReferenceToNode(typeNode, new ReferenceNode(refMapping.getReferenceType(), false, new ExpandedNodeId(instDecl.getNodeId())));
			
			//collect nodes to return them later on
			createdNodes.add(instDecl);
		}
		
		try {
			//add reference to the parent type
			Node parentType = addrSpace.getNode(nodeMapping.getParentType());
			NodeUtils.addReferenceToNode(parentType, new ReferenceNode(Identifiers.HasSubtype, false, new ExpandedNodeId(typeNode.getNodeId())));
		} catch (UAServerException e) {
			LOG.error(e.getMessage(), e);
		}
		
		return createdNodes;
	}
	
	/**
	 * builds an Instance Declaration fitting the given {@link ReferenceMapping}.
	 * @param refMapping
	 * @return
	 */
	public Node buildInstanceDeclaration(ReferenceMapping refMapping, String parentTypeName){
		//generate an id by concatenating the parents typename with the browsename. for example FloorType:fireDoor
		NodeId id = new NodeId(nsIndex, parentTypeName + ":" + refMapping.getBrowseName());
		
		Node newNode = null;
		if (NodeClass.Object.equals(refMapping.getNodeClass())){
			
			newNode = new ObjectNode();
			
		}else if (NodeClass.Variable.equals(refMapping.getNodeClass())){
			UnsignedByte access = AccessLevel.getMask(AccessLevel.CurrentRead, AccessLevel.HistoryRead);
			
			VariableNode vn = new VariableNode();
			UaNodeAnnoIntrospector.setDataTypeFields(vn, refMapping.getField());
			vn.setValue(new Variant(null));
			vn.setUserAccessLevel(access);
			vn.setAccessLevel(access);
			newNode = vn;
		
		}
		
		//generate the node
		newNode.setNodeId(id);
		newNode.setNodeClass(refMapping.getNodeClass());
		newNode.setBrowseName(new QualifiedName(nsIndex, refMapping.getBrowseName()));
		newNode.setDisplayName(new LocalizedText(refMapping.getDisplayName(),  locale));
		newNode.setDescription(new LocalizedText(refMapping.getDescription(),  locale));
		newNode.setWriteMask(UnsignedInteger.ZERO);
		newNode.setUserWriteMask(UnsignedInteger.ZERO);
		
		//add typedefinition
		NodeUtils.addReferenceToNode(newNode, new ReferenceNode(Identifiers.HasTypeDefinition, false, new ExpandedNodeId(refMapping.getTypeDefinition())));
		
		//TODO add modelling rule; are they really mandatory?
		
		return newNode;
	}
	
	/**
	 * creates either a Mandatory or Optional Modelling Rule for the given node
	 * and adds it to his references.
	 * @param node
	 * @param mandatory
	 */
	private void addModellingRuleNode(Node node, boolean mandatory){
	}
}

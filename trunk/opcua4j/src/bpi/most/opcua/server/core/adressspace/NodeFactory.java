package bpi.most.opcua.server.core.adressspace;

import java.util.Locale;

import org.opcfoundation.ua.builtintypes.BuiltinsMap;
import org.opcfoundation.ua.builtintypes.ExpandedNodeId;
import org.opcfoundation.ua.builtintypes.LocalizedText;
import org.opcfoundation.ua.builtintypes.NodeId;
import org.opcfoundation.ua.builtintypes.QualifiedName;
import org.opcfoundation.ua.builtintypes.UnsignedByte;
import org.opcfoundation.ua.builtintypes.UnsignedInteger;
import org.opcfoundation.ua.builtintypes.Variant;
import org.opcfoundation.ua.core.AccessLevel;
import org.opcfoundation.ua.core.DataTypeNode;
import org.opcfoundation.ua.core.Identifiers;
import org.opcfoundation.ua.core.Node;
import org.opcfoundation.ua.core.NodeClass;
import org.opcfoundation.ua.core.ObjectNode;
import org.opcfoundation.ua.core.ObjectTypeNode;
import org.opcfoundation.ua.core.ReferenceNode;
import org.opcfoundation.ua.core.ReferenceTypeNode;
import org.opcfoundation.ua.core.VariableNode;
import org.opcfoundation.ua.core.VariableTypeNode;

/**
 * methods to create {@link Node}s from differenct NodeClasses.
 * @author harald
 *
 */
public class NodeFactory {
	
	private static void fillNodeData(Node node, String browseName, String description, String displayName, Locale locale, NodeClass nodeClass, NodeId nodeId){
		node.setBrowseName(new QualifiedName(browseName));
		node.setDescription(new LocalizedText(description, locale));
		node.setDisplayName(new LocalizedText(displayName, locale));
		node.setNodeClass(nodeClass);
		node.setNodeId(nodeId);
		node.setWriteMask(UnsignedInteger.ZERO);
		node.setUserWriteMask(UnsignedInteger.ZERO);
		node.setReferences(new ReferenceNode[]{}); //define an empty array to avoid nullpointers.
	}

	public static Node getNodeInstance(String browseName, String description, String displayName, Locale locale, NodeClass nodeClass, NodeId nodeId){
		Node node = new Node();
		
		fillNodeData(node, browseName, description, displayName, locale, nodeClass, nodeId);
		
		return node;
	}
	
	public static DataTypeNode getDataTypeNodeInstance(String browseName, String description, String displayName, Locale locale, NodeId nodeId, boolean isAbstract){
		DataTypeNode node = new DataTypeNode();
		
		fillNodeData(node, browseName, description, displayName, locale, NodeClass.DataType, nodeId);
		node.setIsAbstract(isAbstract);
		
		return node;
	}
	
	public static ReferenceTypeNode getReferenceTypeNodeInstance(String browseName, String description, String displayName, Locale locale, NodeId nodeId, boolean isAbstract, boolean isSymmetric, String inverseName){
		ReferenceTypeNode node = new ReferenceTypeNode();
		
		fillNodeData(node, browseName, description, displayName, locale, NodeClass.ReferenceType, nodeId);
		node.setIsAbstract(isAbstract);
		node.setSymmetric(isSymmetric);
		node.setInverseName(new LocalizedText(inverseName, locale));
		
		return node;
	}
	
	public static VariableTypeNode getVariableTypeNodeInstance(String browseName, String description, String displayName, Locale locale, NodeId nodeId, Variant value, NodeId dataType, Integer valueRank, UnsignedInteger[] arrayDimensions, Boolean isAbstract){
		VariableTypeNode node = new VariableTypeNode();
		
		fillNodeData(node, browseName, description, displayName, locale, NodeClass.ReferenceType, nodeId);
		node.setValue(value);
		node.setDataType(dataType);
		node.setValueRank(valueRank);
		node.setArrayDimensions(arrayDimensions);
		node.setIsAbstract(isAbstract);
		
		return node;
	}
	
	public static ObjectTypeNode getObjectTypeNodeInstance(String browseName, String description, String displayName, Locale locale, NodeId nodeId, boolean isAbstract){
		ObjectTypeNode node = new ObjectTypeNode();
		
		fillNodeData(node, browseName, description, displayName, locale, NodeClass.ObjectType, nodeId);
		node.setIsAbstract(isAbstract);
		
		return node;
	}
	
	public static VariableTypeNode getVariableTypeNodeInstance(String browseName, String description, String displayName, Locale locale, NodeId nodeId, Variant value, NodeId dataType, Integer valueRank, UnsignedInteger[] arrayDimensions, boolean isAbstract){
		VariableTypeNode node = new VariableTypeNode();
		
		fillNodeData(node, browseName, description, displayName, locale, NodeClass.ObjectType, nodeId);
		node.setValue(value);
		node.setDataType(dataType);
		node.setValueRank(valueRank);
		node.setArrayDimensions(arrayDimensions);
		node.setIsAbstract(isAbstract);
		
		return node;
	}
	
	public static VariableTypeNode getVariableTypeNodeInstance(String browseName, String description, String displayName, Locale locale, NodeId nodeId, boolean isAbstract){
		return NodeFactory.getVariableTypeNodeInstance(browseName, description, displayName, locale, nodeId, null, null, null, null, isAbstract);
	}
	
	public static ObjectNode getObjectNodeInstance(String browseName, String description, String displayName, Locale locale, NodeId nodeId, UnsignedByte eventNotifier){
		ObjectNode node = new ObjectNode();
		
		fillNodeData(node, browseName, description, displayName, locale, NodeClass.Object, nodeId);
		node.setEventNotifier(eventNotifier);
		
		return node;
	}
	
	public static VariableNode getVariableNodeInstance(String browseName, String description, String displayName, Locale locale, NodeId nodeId, Variant value, NodeId dataType, Integer valueRank, UnsignedInteger[] arrayDimensions, UnsignedByte accessLevel, UnsignedByte userAccessLevel, Double minimumSamplingInterval, Boolean historizing){
		VariableNode node = new VariableNode();
		
		fillNodeData(node, browseName, description, displayName, locale, NodeClass.Variable, nodeId);
		node.setValue(value);
		node.setDataType(dataType);
		node.setValueRank(valueRank);
		node.setArrayDimensions(arrayDimensions);
		node.setAccessLevel(accessLevel);
		node.setUserAccessLevel(userAccessLevel);
		node.setMinimumSamplingInterval(minimumSamplingInterval);
		node.setHistorizing(historizing);
		
		return node;
	}
	
	public static VariableNode getScalarVariableNodeInstance(String browseName, String description, String displayName, Locale locale, NodeId nodeId, Variant value, NodeId dataType){
		UnsignedByte access = AccessLevel.getMask(AccessLevel.CurrentRead, AccessLevel.HistoryRead);
		return getVariableNodeInstance(browseName, description, displayName, locale, nodeId, value, dataType, -1, null, access, access, 0.0, false);
	}
	
	public static VariableNode getStringVariableNodeInstance(String browseName, String description, String displayName, Locale locale, NodeId nodeId, String value){
		return getScalarVariableNodeInstance(browseName, description, displayName, locale, nodeId, new Variant(value), Identifiers.String);
	}
	
	public static ReferenceNode getReferenceNodeInstance(NodeId referenceTypeId, Boolean isInverse, ExpandedNodeId targetId){
		ReferenceNode node = new ReferenceNode();
		node.setReferenceTypeId(referenceTypeId);
		node.setIsInverse(isInverse);
		node.setTargetId(targetId);
		return node;
	}
	
	public static ReferenceNode getReferenceNodeInstance(NodeId referenceTypeId, Boolean isInverse, NodeId targetId){
		return getReferenceNodeInstance(referenceTypeId, isInverse, new ExpandedNodeId(targetId));
	}
	
	public static NodeId getNodeIdByDataType(Class<?> type){
		NodeId id = null;

		if (type.isArray()){
			id = BuiltinsMap.ID_CLASS_MAP.getLeft(type.getComponentType());
		}else{
			id = BuiltinsMap.ID_CLASS_MAP.getLeft(type);
		}
		
		return id;
	}
	
}



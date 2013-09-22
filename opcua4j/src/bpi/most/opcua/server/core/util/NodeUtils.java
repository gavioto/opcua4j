package bpi.most.opcua.server.core.util;

import java.util.List;
import java.util.UUID;

import org.apache.log4j.Logger;
import org.opcfoundation.ua.builtintypes.BuiltinsMap;
import org.opcfoundation.ua.builtintypes.ExpandedNodeId;
import org.opcfoundation.ua.builtintypes.NodeId;
import org.opcfoundation.ua.builtintypes.UnsignedInteger;
import org.opcfoundation.ua.core.Identifiers;
import org.opcfoundation.ua.core.Node;
import org.opcfoundation.ua.core.NodeClass;
import org.opcfoundation.ua.core.ReferenceDescription;
import org.opcfoundation.ua.core.ReferenceNode;

public class NodeUtils {

	private static final Logger LOG = Logger.getLogger(NodeUtils.class);

	public static void addReferenceToNode(Node node, ReferenceNode refNode) {
		ReferenceNode[] newRefNode = new ReferenceNode[] { refNode };
		if (node != null) {
			if (node.getReferences() == null) {
				node.setReferences(newRefNode);
			} else {
				node.setReferences(ArrayUtils.concat(node.getReferences(), newRefNode));
			}
		}
	}

	public static void addReferenceListToNode(Node node, List<ReferenceNode> refNodeList) {
		ReferenceNode[] newRefNode = refNodeList.toArray(new ReferenceNode[refNodeList.size()]);
		if (node.getReferences() == null) {
			node.setReferences(newRefNode);
		} else {
			node.setReferences(ArrayUtils.concat(node.getReferences(), newRefNode));
		}
	}

	public static boolean NodeIsValid(Node node) {
		return node != null && node.getNodeId() != null;
	}

	public static ReferenceDescription mapReferenceNodeToDesc(ReferenceNode refNode, Node targetNode) {
		ReferenceDescription refDesc;

		refDesc = getRefDescForNode(targetNode, refNode.getReferenceTypeId(), !refNode.getIsInverse());

		return refDesc;
	}

	public static ReferenceDescription getRefDescForNode(Node targetNode, NodeId referenceType, boolean isForward) {
		ReferenceDescription refDesc = new ReferenceDescription();

		refDesc.setBrowseName(targetNode.getBrowseName());
		refDesc.setDisplayName(targetNode.getDisplayName());
		refDesc.setNodeClass(targetNode.getNodeClass());
		refDesc.setReferenceTypeId(referenceType);
		refDesc.setTypeDefinition(getTypeDefinition(targetNode));
		refDesc.setNodeId(toExpandedNodeId(targetNode.getNodeId()));
		refDesc.setIsForward(isForward);

		return refDesc;
	}

	/**
	 * searches all references of the given {@link Node} to find the one from
	 * type hasTypeDefinition. the target ID of the first match is returned.
	 * 
	 * @param node
	 * @return
	 */
	public static ExpandedNodeId getTypeDefinition(Node node) {
		ExpandedNodeId typeDef = null;

		if (node != null && node.getReferences() != null) {
			for (ReferenceNode refNode : node.getReferences()) {
				if (!refNode.getIsInverse() && Identifiers.HasTypeDefinition.equals(refNode.getReferenceTypeId())) {
					typeDef = refNode.getTargetId();
					LOG.info("found typedefinition " + typeDef + " for node " + node.getNodeId());
					break;
				}
			}
		}

		return typeDef;
	}

	public static ExpandedNodeId toExpandedNodeId(NodeId nodeId) {
		return new ExpandedNodeId(nodeId);
	}

	public static NodeId toNodeId(ExpandedNodeId expNodeId) {
		NodeId nodeId = null;
		switch (expNodeId.getIdType()) {
		case Guid:
			nodeId = new NodeId(expNodeId.getNamespaceIndex(), (UUID) expNodeId.getValue());
			break;
		case Numeric:
			nodeId = new NodeId(expNodeId.getNamespaceIndex(), (UnsignedInteger) expNodeId.getValue());
			break;
		case Opaque:
			nodeId = new NodeId(expNodeId.getNamespaceIndex(), (byte[]) expNodeId.getValue());
			break;
		case String:
			nodeId = new NodeId(expNodeId.getNamespaceIndex(), (String) expNodeId.getValue());
			break;
		}

		return nodeId;
	}

	public static NodeClass getTypeClass(NodeClass nodeClass) {
		NodeClass typeClass = null;

		if (NodeClass.Object.equals(nodeClass)) {
			typeClass = NodeClass.ObjectType;
		} else if (NodeClass.Variable.equals(nodeClass)) {
			typeClass = NodeClass.VariableType;
		}
		// TODO map the others

		return typeClass;
	}

	/**
	 * returns the basetype for a given {@link NodeClass}
	 * 
	 * @param nodeClass
	 * @return
	 */
	public static NodeId getBaseTypeNodeId(NodeClass nodeClass) {
		NodeId result = null;

		if (NodeClass.Object.equals(nodeClass)) {
			result = Identifiers.BaseObjectType;
		} else if (NodeClass.Variable.equals(nodeClass)) {
			result = Identifiers.BaseDataVariableType;
		}

		return result;
	}

	/**
	 * returns true if the given Object is from any builtin type. otherwhise
	 * false
	 * 
	 * @param obj
	 * @return
	 */
	public static boolean isBuiltinType(Class<?> clazz) {
		boolean isBuiltinType = false;

		isBuiltinType = BuiltinsMap.ID_CLASS_MAP.containsRight(clazz);

		return isBuiltinType;
	}

	/**
	 * returns the value rank for the given class. remember:
	 * -3: scalar or one dimensional array
	 * -2: any, i.e. scalar or array with any dimension
	 * -1: scalar
	 *  0: array with one or more dimensions
	 *  1: array with one dimension
	 * >1: array with the number of dimensions
	 * 
	 * @param clazz
	 * @return
	 */
	public static Integer getValueRank(Class<?> clazz) {
		Integer valueRank;

		if (clazz.isArray()) {
			valueRank = getArrayDimensions(clazz);
		} else {
			//scalar
			valueRank = -1;
		}

		return valueRank;
	}
	
	public static Integer getArrayDimensions(Class<?> clazz){
		Integer arrDim = null;
		if (clazz.isArray()) {
			//count dimensions
			Class<?> arrayClass = clazz;
			int count = 0;
			while (arrayClass.isArray()) {
				count++;
				arrayClass = arrayClass.getComponentType();
			}
			arrDim = count;
		}
		return arrDim;
	}
}

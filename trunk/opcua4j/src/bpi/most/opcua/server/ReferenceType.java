package bpi.most.opcua.server;

import org.opcfoundation.ua.builtintypes.NodeId;
import org.opcfoundation.ua.core.Identifiers;

/**
 * reference types which can be used to structure
 * different javaobjects.
 * 
 * @author harald
 *
 */
public enum ReferenceType {

	hasChild(Identifiers.HasChild),
	organizes(Identifiers.Organizes),
	hasDescription(Identifiers.HasDescription),
	aggregates(Identifiers.Aggregates),
	hasComponent(Identifiers.HasComponent),
	hasProperty(Identifiers.HasProperty),
	hasOrderedComponent(Identifiers.HasOrderedComponent);
	
	private ReferenceType(NodeId nodeId){
		this.nodeId = nodeId;
	}
	
	private NodeId nodeId;
	
	public NodeId nodeId(){
		return nodeId;
	}
}

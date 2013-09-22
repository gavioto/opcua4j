package bpi.most.opcua.server.annotation;

import org.opcfoundation.ua.builtintypes.NodeId;
import org.opcfoundation.ua.builtintypes.UnsignedByte;
import org.opcfoundation.ua.builtintypes.UnsignedInteger;
import org.opcfoundation.ua.core.NodeClass;

public class NodeInfo {

	private NodeId nodeId;
	private String displayName;
	private String description;
	private NodeClass nodeClass;
	
	private UnsignedByte eventNotifier = UnsignedByte.ZERO;
	private UnsignedInteger userWriteMask = UnsignedInteger.ZERO;
	private UnsignedInteger writeMask = UnsignedInteger.ZERO;
	
	/**
	 * @param nodeId
	 * @param displayName
	 * @param description
	 * @param nodeClass
	 */
	public NodeInfo(NodeId nodeId, String displayName, String description,
			NodeClass nodeClass) {
		this.nodeId = nodeId;
		this.displayName = displayName;
		this.description = description;
		this.nodeClass = nodeClass;
	}
	/**
	 * @return the nodeId
	 */
	public NodeId getNodeId() {
		return nodeId;
	}
	/**
	 * @param nodeId the nodeId to set
	 */
	public void setNodeId(NodeId nodeId) {
		this.nodeId = nodeId;
	}
	/**
	 * @return the displayName
	 */
	public String getDisplayName() {
		return displayName;
	}
	/**
	 * @param displayName the displayName to set
	 */
	public void setDisplayName(String displayName) {
		this.displayName = displayName;
	}
	/**
	 * @return the description
	 */
	public String getDescription() {
		return description;
	}
	/**
	 * @param description the description to set
	 */
	public void setDescription(String description) {
		this.description = description;
	}
	/**
	 * @return the nodeClass
	 */
	public NodeClass getNodeClass() {
		return nodeClass;
	}
	/**
	 * @param nodeClass the nodeClass to set
	 */
	public void setNodeClass(NodeClass nodeClass) {
		this.nodeClass = nodeClass;
	}
	/**
	 * @return the eventNotifier
	 */
	public UnsignedByte getEventNotifier() {
		return eventNotifier;
	}
	/**
	 * @param eventNotifier the eventNotifier to set
	 */
	public void setEventNotifier(UnsignedByte eventNotifier) {
		this.eventNotifier = eventNotifier;
	}
	/**
	 * @return the userWriteMask
	 */
	public UnsignedInteger getUserWriteMask() {
		return userWriteMask;
	}
	/**
	 * @param userWriteMask the userWriteMask to set
	 */
	public void setUserWriteMask(UnsignedInteger userWriteMask) {
		this.userWriteMask = userWriteMask;
	}
	/**
	 * @return the writeMask
	 */
	public UnsignedInteger getWriteMask() {
		return writeMask;
	}
	/**
	 * @param writeMask the writeMask to set
	 */
	public void setWriteMask(UnsignedInteger writeMask) {
		this.writeMask = writeMask;
	}
}

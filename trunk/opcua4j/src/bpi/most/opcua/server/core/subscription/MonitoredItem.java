package bpi.most.opcua.server.core.subscription;

import org.opcfoundation.ua.builtintypes.NodeId;
import org.opcfoundation.ua.builtintypes.UnsignedInteger;
import org.opcfoundation.ua.core.MonitoringMode;

public class MonitoredItem {
	
	private int id;
	private NodeId nodeId;
    private UnsignedInteger attributeId;
    private MonitoringMode mode;
    
    private UnsignedInteger clientHandle;
    private Double samplingInterval;
    private UnsignedInteger queueSize;
    private Boolean discardOldest;
	
    /**
     * Subscription this MonitoredItem belongs to
     */
    private Subscription subscription;
    
	/**
	 * @param id
	 */
	public MonitoredItem(int id, Subscription subscription) {
		super();
		this.id = id;
		this.subscription = subscription;
	}

	/**
	 * @return the id
	 */
	public int getId() {
		return id;
	}

	/**
	 * @param id the id to set
	 */
	public void setId(int id) {
		this.id = id;
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
	 * @return the attributeId
	 */
	public UnsignedInteger getAttributeId() {
		return attributeId;
	}

	/**
	 * @param attributeId the attributeId to set
	 */
	public void setAttributeId(UnsignedInteger attributeId) {
		this.attributeId = attributeId;
	}

	/**
	 * @return the mode
	 */
	public MonitoringMode getMode() {
		return mode;
	}

	/**
	 * @param mode the mode to set
	 */
	public void setMode(MonitoringMode mode) {
		this.mode = mode;
	}

	/**
	 * @return the clientHandle
	 */
	public UnsignedInteger getClientHandle() {
		return clientHandle;
	}

	/**
	 * @param clientHandle the clientHandle to set
	 */
	public void setClientHandle(UnsignedInteger clientHandle) {
		this.clientHandle = clientHandle;
	}

	/**
	 * @return the samplingInterval
	 */
	public Double getSamplingInterval() {
		return samplingInterval;
	}

	/**
	 * @param samplingInterval the samplingInterval to set
	 */
	public void setSamplingInterval(Double samplingInterval) {
		this.samplingInterval = samplingInterval;
	}

	/**
	 * @return the queueSize
	 */
	public UnsignedInteger getQueueSize() {
		return queueSize;
	}

	/**
	 * @param queueSize the queueSize to set
	 */
	public void setQueueSize(UnsignedInteger queueSize) {
		this.queueSize = queueSize;
	}

	/**
	 * @return the discardOldest
	 */
	public Boolean getDiscardOldest() {
		return discardOldest;
	}

	/**
	 * @param discardOldest the discardOldest to set
	 */
	public void setDiscardOldest(Boolean discardOldest) {
		this.discardOldest = discardOldest;
	}

	/**
	 * @return the subscription
	 */
	public Subscription getSubscription() {
		return subscription;
	}

	/**
	 * @param subscription the subscription to set
	 */
	public void setSubscription(Subscription subscription) {
		this.subscription = subscription;
	}
	
	
}

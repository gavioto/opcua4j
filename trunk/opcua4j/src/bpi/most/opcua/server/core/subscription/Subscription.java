package bpi.most.opcua.server.core.subscription;

import java.util.HashMap;
import java.util.Map;


public class Subscription {

	private int id;
	
	/**
	 * cyclic rate in milliseconds that the Subscription returns Notifications to the Client
	 */
    private double publishingInterval;
    
    /**
     * lifetime count (see 7.5 for Counter definition). The lifetime count shall
be a mimimum of three times the keep keep-alive count.
When the publishing timer has expired this number of times without a Publish
request being available to send a NotificationMessage, then the Subscription
shall be deleted by the Server.
     */
	private int lifetimeCount;
	
	/**
	 * When the
publishing timer has expired this number of times without requiring any
NotificationMessage to be sent, the Subscription sends a keep-alive Message to
the Client.
	 */
	private int maxKeepAliveCount;
	
	/**
	 * The maximum number of notifications that the Client wishes to receive in a single Publish response. A value of zero indicates that there is no limit.
	 */
	private int maxNotificationsPerPublish;
	
	/**
	 * indicates if publishing is enabled for this Subscription
	 */
	private boolean publishingEnabled;
	
	/**
	 * Indicates the relative priority of the Subscription. When more than one
Subscription needs to send Notifications, the Server should dequeue a Publish
request to the Subscription with the highest priority number. For Subscriptions
with equal priority the Server should dequeue Publish requests in a round-robin
fashion. When the keep-alive period expires for a Subscription it shall take
precedence regardless of its priority, in order to prevent the Subscription from
expiring.
A Client that does not require special priority settings should set this value to
zero.
	 * 
	 * not supported at the moment!!
	 */
	private int priority;
	
	private Map<Integer, MonitoredItem> monitoredItems;
	
	
	/**
	 * @param id
	 */
	public Subscription(int id) {
		this.id = id;
		monitoredItems = new HashMap<Integer, MonitoredItem>();
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
	 * @return the publishingInterval
	 */
	public double getPublishingInterval() {
		return publishingInterval;
	}

	/**
	 * @param publishingInterval the publishingInterval to set
	 */
	public void setPublishingInterval(double publishingInterval) {
		this.publishingInterval = publishingInterval;
	}

	/**
	 * @return the lifetimeCount
	 */
	public int getLifetimeCount() {
		return lifetimeCount;
	}

	/**
	 * @param lifetimeCount the lifetimeCount to set
	 */
	public void setLifetimeCount(int lifetimeCount) {
		this.lifetimeCount = lifetimeCount;
	}

	/**
	 * @return the maxKeepAliveCount
	 */
	public int getMaxKeepAliveCount() {
		return maxKeepAliveCount;
	}

	/**
	 * @param maxKeepAliveCount the maxKeepAliveCount to set
	 */
	public void setMaxKeepAliveCount(int maxKeepAliveCount) {
		this.maxKeepAliveCount = maxKeepAliveCount;
	}

	/**
	 * @return the maxNotificationsPerPublish
	 */
	public int getMaxNotificationsPerPublish() {
		return maxNotificationsPerPublish;
	}

	/**
	 * @param maxNotificationsPerPublish the maxNotificationsPerPublish to set
	 */
	public void setMaxNotificationsPerPublish(int maxNotificationsPerPublish) {
		this.maxNotificationsPerPublish = maxNotificationsPerPublish;
	}

	/**
	 * @return the publishingEnabled
	 */
	public boolean isPublishingEnabled() {
		return publishingEnabled;
	}

	/**
	 * @param publishingEnabled the publishingEnabled to set
	 */
	public void setPublishingEnabled(boolean publishingEnabled) {
		this.publishingEnabled = publishingEnabled;
	}

	/**
	 * @return the priority
	 */
	public int getPriority() {
		return priority;
	}

	/**
	 * @param priority the priority to set
	 */
	public void setPriority(int priority) {
		this.priority = priority;
	}
	
	public void addMonitoredItem(MonitoredItem item){
		
	}
	
}

package bpi.most.opcua.server.core.subscription;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.opcfoundation.ua.builtintypes.NodeId;
import org.opcfoundation.ua.builtintypes.UnsignedInteger;
import org.opcfoundation.ua.core.CreateMonitoredItemsRequest;
import org.opcfoundation.ua.core.CreateSubscriptionRequest;
import org.opcfoundation.ua.core.DeleteSubscriptionsRequest;
import org.opcfoundation.ua.core.ModifySubscriptionRequest;
import org.opcfoundation.ua.core.MonitoredItemCreateRequest;
import org.opcfoundation.ua.core.PublishRequest;
import org.opcfoundation.ua.core.PublishResponse;
import org.opcfoundation.ua.core.SetPublishingModeRequest;
import org.opcfoundation.ua.transport.EndpointServiceRequest;

import bpi.most.opcua.server.core.RequestContext;


/**
 * 
 * 
 * 
 * 
 * +---------+         +--------------+         +-----------------+
 * | Session | 1-----n | Subscription | 1-----n | Monitored Items | 
 * +---------+         +--------------+         +-----------------+ 
 * 
 * 
 * @author harald
 *
 */
public class SubscriptionManager {

	private static final Logger LOG = Logger.getLogger(SubscriptionManager.class);

	/*
	 * theory: OPC Unified Architecture book (the green one) 5.7.1, especially
	 * 5.7.1.1
	 * 
	 * 
	 * theory: specs/opc ua part 4: 5.12 MonitoredItem Service Set 5.13.5
	 * publish request. 1. the client sends a publish request, 2. the server
	 * stores this requests and does not answer immediately 3. as soon as the
	 * sample interval ends, the publish request is taken to publish the new
	 * data on its response
	 * 
	 * that means, the client has open connections which are used by the server
	 * to respond! the server collects the requests in a FIFO (which can have a
	 * max) and takes out the oldest request to respond to.
	 * 
	 * when: new publish cycle{ publishReq: publishRequests.pop();
	 * publishReq.setREsponse(publish response) }
	 */

	/**
	 * counts up to generate unique subscription IDs
	 */
	private static int subscriptionIndex = 0;
	
	private static int monitoredItemIndex = 0;

	/**
	 * subscriptions per id
	 */
	private Map<Integer, Subscription> subscriptions;

	/**
	 * queue of pending PublishRequests we can use to send notifications,
	 * accessible by Session-id
	 */
	private PublishReqCollection publishRequests;

	public SubscriptionManager() {
		subscriptions = new HashMap<Integer, Subscription>();
		publishRequests = new PublishReqCollection();
	}

	/**
	 * creates the subscription and adds it to the managed ones
	 * 
	 * @return
	 */
	public synchronized Subscription createSubscription(CreateSubscriptionRequest req, NodeId sessionId) {
		Subscription subscription = new Subscription(subscriptionIndex++, sessionId);

		// TODO validate all requested values
		subscription.setLifetimeCount(req.getRequestedLifetimeCount().intValue());
		subscription.setMaxKeepAliveCount(req.getRequestedMaxKeepAliveCount().intValue());
		subscription.setMaxNotificationsPerPublish(req.getMaxNotificationsPerPublish().intValue());
		subscription.setPriority(req.getPriority().intValue());
		subscription.setPublishingEnabled(req.getPublishingEnabled());
		subscription.setPublishingInterval(req.getRequestedPublishingInterval());
		subscriptions.put(subscription.getId(), subscription);
			
		subscription.setPublisher(new Publisher(subscription, publishRequests));
		
		return subscription;
	}

	/**
	 * updates the subscription and returns it with the new values set
	 * 
	 * @param req
	 */
	public synchronized Subscription modifySubscription(ModifySubscriptionRequest req) {
		Subscription subscription = getSubscription(req.getSubscriptionId().intValue());

		subscription.setLifetimeCount(req.getRequestedLifetimeCount().intValue());
		subscription.setMaxKeepAliveCount(req.getRequestedMaxKeepAliveCount().intValue());
		subscription.setMaxNotificationsPerPublish(req.getMaxNotificationsPerPublish().intValue());
		subscription.setPriority(req.getPriority().intValue());
		subscription.setPublishingInterval(req.getRequestedPublishingInterval());

		subscription.getPublisher().configure();
		// TODO modify timers

		return subscription;
	}

	public synchronized Subscription getSubscription(int id) {
		Subscription s = subscriptions.get(id);

		if (s == null) {
			// TODO throw runtime exception
		}

		return s;
	}

	public synchronized void setPublishingMode(SetPublishingModeRequest req) {
		for (UnsignedInteger id : req.getSubscriptionIds()) {
			if (subscriptions.containsKey(id)) {
				subscriptions.get(id).setPublishingEnabled(req.getPublishingEnabled());
			} else {
				LOG.debug("clients wants to set publishing mode for subscriptionid " + id + ", but does not exist");
			}
		}
	}

	public synchronized void deleteSubscription(DeleteSubscriptionsRequest req) {
		for (UnsignedInteger id : req.getSubscriptionIds()) {
			if (subscriptions.containsKey(id)) {
				Subscription subscription = subscriptions.remove(id);
				subscription.getPublisher().stopPublishing();
			} else {
				LOG.debug("clients wants to remove subscription with id " + id + ", but does not exist");
			}
		}
	}

	/**
	 * three responsibilities: 1. heardbeat from client --> 2. clear
	 * acknowledged notifications 3. keep request to send out notifications
	 * 
	 * @param serviceReq
	 */
	public void onPublish(EndpointServiceRequest<PublishRequest, PublishResponse> serviceReq) {
		// ad 1.
		//TODO clear client-timeout timer

		// ad 2.
		//is done when the respond is published

		// ad 3.
		NodeId sessionID = RequestContext.get().getSession().getSessionID();
		publishRequests.offer(sessionID, serviceReq);
	}

	public synchronized List<MonitoredItem> createMonitoredItems(CreateMonitoredItemsRequest req){
		List<MonitoredItem> createdItems = new ArrayList<MonitoredItem>();
		Subscription subscription = getSubscription(req.getSubscriptionId().intValue());
		if (req.getItemsToCreate() != null){
			for (MonitoredItemCreateRequest itemReq: req.getItemsToCreate()){
				MonitoredItem item = new MonitoredItem(monitoredItemIndex++, subscription);
				item.setNodeId(itemReq.getItemToMonitor().getNodeId());
				item.setAttributeId(itemReq.getItemToMonitor().getAttributeId());
				item.setMode(itemReq.getMonitoringMode());
				
				//TODO revise samplinginterval and queuesize
				item.setClientHandle(itemReq.getRequestedParameters().getClientHandle());
				if (itemReq.getRequestedParameters().getSamplingInterval() == -1){
					//use the default sampling interval from the Subscription
					item.setSamplingInterval(subscription.getPublishingInterval());
				}else{
					item.setSamplingInterval(itemReq.getRequestedParameters().getSamplingInterval());
				}
				
				item.setQueueSize(itemReq.getRequestedParameters().getQueueSize());
				item.setDiscardOldest(itemReq.getRequestedParameters().getDiscardOldest());
				
				createdItems.add(item);
				subscription.addMonitoredItem(item);
			}
		}
		
		return createdItems;
	}
}

package bpi.most.opcua.server.core.subscription;

import java.util.HashMap;
import java.util.Map;

import org.apache.log4j.Logger;
import org.opcfoundation.ua.builtintypes.UnsignedInteger;
import org.opcfoundation.ua.core.CreateSubscriptionRequest;
import org.opcfoundation.ua.core.DeleteSubscriptionsRequest;
import org.opcfoundation.ua.core.PublishRequest;
import org.opcfoundation.ua.core.PublishResponse;
import org.opcfoundation.ua.core.SetPublishingModeRequest;
import org.opcfoundation.ua.transport.EndpointServiceRequest;

import bpi.most.opcua.server.handler.SessionServiceHandler;


public class SubscriptionManager {

	private static final Logger LOG = Logger.getLogger(SubscriptionManager.class);
	
	/*
	 * theory: OPC Unified Architecture book (the green one) 5.7.1, especially 5.7.1.1
	 * 
	 * 
	 * theory: specs/opc ua part 4: 5.12 MonitoredItem Service Set
	 * 5.13.5 publish request.
	 *  1. the client sends a publish request, 
	 *  2. the server stores this requests and does not answer immediately
	 *  3. as soon as the sample interval ends, the publish request is taken to publish the new data on its response
	 *  
	 * that means, the client has open connections which are used by the server to respond!
	 * the server collects the requests in a FIFO (which can have a max) and takes out the oldest request to respond to.
	 * 
	 * when: new publish cycle{
	 * 		publishReq: publishRequests.pop();
	 * 		publishReq.setREsponse(publish response)
	 * }
	 * 
	 */
	
	/**
	 * counts up to generate unique subscription IDs
	 */
	private static int subscriptionIndex = 0;
	
	private Map<Integer, Subscription> subscriptions;
	
	public SubscriptionManager() {
		subscriptions = new HashMap<Integer, Subscription>();
	}

	/**
	 * creates the subscription and adds it to the
	 * managed ones
	 * @return
	 */
	public synchronized Subscription createSubscription(CreateSubscriptionRequest req){
		Subscription subscription = new Subscription(subscriptionIndex++);
		
		//TODO validate all requested values
		subscription.setLifetimeCount(req.getRequestedLifetimeCount().intValue());
		subscription.setMaxKeepAliveCount(req.getRequestedMaxKeepAliveCount().intValue());
		subscription.setMaxNotificationsPerPublish(req.getMaxNotificationsPerPublish().intValue());
		subscription.setPriority(req.getPriority().intValue());
		subscription.setPublishingEnabled(req.getPublishingEnabled());
		subscription.setPublishingInterval(req.getRequestedPublishingInterval());
		
		subscriptions.put(subscription.getId(), subscription);
		return subscription;
	}
	
	public synchronized void setPublishingMode(SetPublishingModeRequest req){
		for (UnsignedInteger id: req.getSubscriptionIds()){
			if (subscriptions.containsKey(id)){
				subscriptions.get(id).setPublishingEnabled(req.getPublishingEnabled());
			}else{
				LOG.debug("clients wants to set publishing mode for subscriptionid " + id + ", but does not exist");
			}
		}
	}
	
	public synchronized void deleteSubscription(DeleteSubscriptionsRequest req){
		for (UnsignedInteger id: req.getSubscriptionIds()){
			if (subscriptions.containsKey(id)){
				subscriptions.remove(id);
			}else{
				LOG.debug("clients wants to remove subscription with id " + id + ", but does not exist");
			}
		}
	}
	
	
	private void bla(){
		//thats it
		EndpointServiceRequest<PublishRequest, PublishResponse> serviceReq = getReq();
		
		PublishRequest req = serviceReq.getRequest();
		PublishResponse resp = new PublishResponse();
		serviceReq.sendResponse(resp);
	}
	
	private EndpointServiceRequest<PublishRequest, PublishResponse> getReq(){
		return null;
	}
}

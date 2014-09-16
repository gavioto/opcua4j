package bpi.most.opcua.server.core.subscription;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

import org.opcfoundation.ua.builtintypes.NodeId;
import org.opcfoundation.ua.core.PublishRequest;
import org.opcfoundation.ua.core.PublishResponse;
import org.opcfoundation.ua.transport.EndpointServiceRequest;

/**
 * holds publishRequests per session. PublishRequests can be used for any Subscription in the same context, therefore
 * they are collected by session and taken one after an other.
 * 
 * Several Publisher (from different Subscriptions) concur for PublishRequests to send their notifications to the client. Here
 * we have to enforce priority which Subscription is allowed to send first. This is not implemented now.
 * 
 * @author harald
 *
 */
public class PublishReqCollection {

	private int queueCapacity = 20;
	
	private Map<NodeId, BlockingQueue<EndpointServiceRequest<PublishRequest, PublishResponse>>> publishRequestsBySession;
	
	/**
	 * @param queue
	 */
	public PublishReqCollection() {
		//queue = new ArrayBlockingQueue<EndpointServiceRequest<PublishRequest,PublishResponse>>(capacity);
		publishRequestsBySession = new HashMap<NodeId, BlockingQueue<EndpointServiceRequest<PublishRequest,PublishResponse>>>();
	}
	
	public synchronized void offer(NodeId sessionId, EndpointServiceRequest<PublishRequest, PublishResponse> req){
		BlockingQueue<EndpointServiceRequest<PublishRequest, PublishResponse>> queue = publishRequestsBySession.get(sessionId);
		if (queue == null){
			queue = new ArrayBlockingQueue<EndpointServiceRequest<PublishRequest,PublishResponse>>(queueCapacity);
			publishRequestsBySession.put(sessionId, queue);
		}
		
		queue.offer(req);
	}
	
	public EndpointServiceRequest<PublishRequest, PublishResponse> take(NodeId sessionId) throws InterruptedException{
		BlockingQueue<EndpointServiceRequest<PublishRequest, PublishResponse>> queue = publishRequestsBySession.get(sessionId);
		if (queue != null){
			return queue.take();
		}
		return null;
	}
	
}

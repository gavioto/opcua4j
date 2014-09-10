package bpi.most.opcua.server.core.subscription;

import org.opcfoundation.ua.core.PublishRequest;
import org.opcfoundation.ua.core.PublishResponse;
import org.opcfoundation.ua.transport.EndpointServiceRequest;


public class SubscriptionManager {

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

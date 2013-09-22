package bpi.most.opcua.server.handler;

import org.opcfoundation.ua.common.ServiceFaultException;
import org.opcfoundation.ua.core.TestServiceSetHandler;
import org.opcfoundation.ua.core.TestStackExRequest;
import org.opcfoundation.ua.core.TestStackExResponse;
import org.opcfoundation.ua.core.TestStackRequest;
import org.opcfoundation.ua.core.TestStackResponse;
import org.opcfoundation.ua.transport.EndpointServiceRequest;

public class TestServiceHandler implements TestServiceSetHandler{

	public void onTestStack(EndpointServiceRequest<TestStackRequest, TestStackResponse> req){
		System.out.println("got testStack request");
		TestStackResponse resp = new TestStackResponse(null, req.getRequest().getInput());
		
		req.sendResponse(resp);
		System.out.println("sent testStack response");
	}

	@Override
	public void onTestStackEx(
			EndpointServiceRequest<TestStackExRequest, TestStackExResponse> req)
			throws ServiceFaultException {
		req.sendResponse(new TestStackExResponse(null, req.getRequest().getInput()));
	}
	
}

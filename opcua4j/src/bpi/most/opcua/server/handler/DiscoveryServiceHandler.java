package bpi.most.opcua.server.handler;

import java.util.List;

import org.apache.log4j.Logger;
import org.opcfoundation.ua.builtintypes.DateTime;
import org.opcfoundation.ua.common.ServiceFaultException;
import org.opcfoundation.ua.core.DiscoveryServiceSetHandler;
import org.opcfoundation.ua.core.EndpointDescription;
import org.opcfoundation.ua.core.FindServersRequest;
import org.opcfoundation.ua.core.FindServersResponse;
import org.opcfoundation.ua.core.GetEndpointsRequest;
import org.opcfoundation.ua.core.GetEndpointsResponse;
import org.opcfoundation.ua.core.RegisterServerRequest;
import org.opcfoundation.ua.core.RegisterServerResponse;
import org.opcfoundation.ua.core.ResponseHeader;
import org.opcfoundation.ua.transport.EndpointServiceRequest;

import bpi.most.opcua.server.core.UAServer;

public class DiscoveryServiceHandler implements DiscoveryServiceSetHandler {

	private static final Logger LOG = Logger.getLogger(DiscoveryServiceHandler.class);
	
	/**
	 * Server this handler is bound to
	 */
	UAServer server;
	
	public DiscoveryServiceHandler(UAServer server) {
		this.server = server;
	}

	@Override
	public void onFindServers(
			EndpointServiceRequest<FindServersRequest, FindServersResponse> req)
			throws ServiceFaultException {
		// TODO Auto-generated method stub

	}

	@Override
	public void onGetEndpoints(
			EndpointServiceRequest<GetEndpointsRequest, GetEndpointsResponse> req)
			throws ServiceFaultException {
		
		GetEndpointsResponse resp = new GetEndpointsResponse();
		
		//build response header
		ResponseHeader respHeader = new ResponseHeader();
		respHeader.setTimestamp(new DateTime());
		
		//requesthandle is always the one the client sent in its request
		respHeader.setRequestHandle(req.getRequest().getRequestHeader().getRequestHandle());
		
		//set responseheader
		resp.setResponseHeader(respHeader);
		
		//process the actual request by finding the matching endpoints
		List<EndpointDescription> matchingEndpoints = server.getEndpointDescriptionsForUri(req.getRequest().getEndpointUrl());
		resp.setEndpoints((EndpointDescription[]) matchingEndpoints.toArray());
		
		req.sendResponse(resp);
		
		LOG.debug("sent response");
	}

	@Override
	public void onRegisterServer(
			EndpointServiceRequest<RegisterServerRequest, RegisterServerResponse> req)
			throws ServiceFaultException {
		// TODO Auto-generated method stub

	}

}

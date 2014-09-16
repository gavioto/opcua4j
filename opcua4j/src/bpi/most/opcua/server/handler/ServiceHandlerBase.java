package bpi.most.opcua.server.handler;

import java.util.Calendar;

import org.opcfoundation.ua.builtintypes.DateTime;
import org.opcfoundation.ua.builtintypes.DiagnosticInfo;
import org.opcfoundation.ua.builtintypes.NodeId;
import org.opcfoundation.ua.builtintypes.ServiceRequest;
import org.opcfoundation.ua.builtintypes.ServiceResponse;
import org.opcfoundation.ua.builtintypes.StatusCode;
import org.opcfoundation.ua.builtintypes.UnsignedInteger;
import org.opcfoundation.ua.core.RequestHeader;
import org.opcfoundation.ua.core.ResponseHeader;
import org.opcfoundation.ua.transport.EndpointServiceRequest;

import bpi.most.opcua.server.core.RequestContext;
import bpi.most.opcua.server.core.Session;
import bpi.most.opcua.server.core.SessionManager;
import bpi.most.opcua.server.core.UAServer;
import bpi.most.opcua.server.core.adressspace.AddressSpace;
import bpi.most.opcua.server.core.subscription.SubscriptionManager;

public class ServiceHandlerBase {

	protected UAServer server;

	public static DiagnosticInfo buildDiagnostics() {
		return null;
	}

	public static void validateHeader(RequestHeader reqHeader) {
		// TODO do header validation here

		// TODO validate authtoken if it matches the session
	}

	public static ResponseHeader buildRespHeader(ServiceRequest req) {
		// TODO common validation

		// TODO logging

		// build response header
		ResponseHeader respHeader = new ResponseHeader();
		
		respHeader.setTimestamp(new DateTime(Calendar.getInstance()));

		// requesthandle is always the one the client sent in its request
		respHeader.setRequestHandle(req.getRequestHeader().getRequestHandle());

		respHeader.setServiceResult(StatusCode.GOOD);
		respHeader.setServiceDiagnostics(buildDiagnostics());

		return respHeader;
	}

	/**
	 * builds a response header with an error set
	 * 
	 * @param req
	 * @return
	 */
	public static ResponseHeader buildErrRespHeader(ServiceRequest req, UnsignedInteger errCode) {
		ResponseHeader respHeader = new ResponseHeader();
		respHeader.setTimestamp(new DateTime());
		// requesthandle is always the one the client sent in its request
		respHeader.setRequestHandle(req.getRequestHeader().getRequestHandle());

		respHeader.setServiceResult(new StatusCode(errCode));
		respHeader.setServiceDiagnostics(buildDiagnostics());

		return respHeader;
	}

	/**
	 * common send response method
	 * 
	 * @param req
	 * @param resp
	 */
	protected <T extends ServiceResponse> void sendResp(EndpointServiceRequest<? extends ServiceRequest, T> req, T resp) {
		// TODO some logging and maybe validation here

		req.sendResponse(resp);
	}
	
	/**
	 * fills the {@link RequestContext} object with common information like the associated session and the given {@link ServiceRequest};
	 * @param serviceReq
	 */
	protected void initRequestContext(EndpointServiceRequest<? extends ServiceRequest, ? extends ServiceResponse> req){
		RequestContext ctx = RequestContext.get();
		
		NodeId authToken = req.getRequest().getRequestHeader().getAuthenticationToken();
		Session session = server.getSessionManager().getSession(authToken);
		
		ctx.setSession(session);
		ctx.setServiceRequest(req.getRequest());
	}
	
	/**
	 * returns the {@link Session} associated with the client
	 * @param req
	 * @return
	 */
	protected Session getSession(ServiceRequest req){
		return server.getSessionManager().getSession(req.getRequestHeader().getAuthenticationToken());
	}
	
	public void init(UAServer server) {			// TODO may change this here

		this.server = server;
	}

	protected SessionManager getSessionManager() {
		return server.getSessionManager();
	}

	protected AddressSpace getAddressSpace() {
		return server.getAddrSpace();
	}
	
	protected SubscriptionManager getSubscriptionManager(){
		return server.getSubscriptionManager();
	}
}

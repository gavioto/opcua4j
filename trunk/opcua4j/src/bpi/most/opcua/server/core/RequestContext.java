package bpi.most.opcua.server.core;

import org.opcfoundation.ua.builtintypes.ServiceRequest;


/**
 * hold context information for a single request. this context object is
 * realized with thread locals, hence it is unique for every request. but with
 * the static getter it is accessible from everywhere. we can use thread locals
 * because the OPC UA stack handles every request by it's own thread
 * 
 * @author harald
 * 
 */
public class RequestContext {

	/**
	 * session of the client
	 */
	private Session session;
	
	private ServiceRequest serviceRequest;

	/**
	 * @return the session
	 */
	public Session getSession() {
		return session;
	}

	/**
	 * @param session
	 *            the session to set
	 */
	public void setSession(Session session) {
		this.session = session;
	}
	
	/**
	 * @return the serviceRequest
	 */
	public ServiceRequest getServiceRequest() {
		return serviceRequest;
	}

	/**
	 * @param serviceRequest the serviceRequest to set
	 */
	public void setServiceRequest(ServiceRequest serviceRequest) {
		this.serviceRequest = serviceRequest;
	}

	private static final ThreadLocal<RequestContext> CONTEXT = new ThreadLocal<RequestContext>() {

		/**
		 * init the current variable so that it is not null when {@link ThreadLocal#get()} is called.
		 */
		@Override
		protected RequestContext initialValue() {
			return new RequestContext();
		}

	};

	public static RequestContext get() {
		return CONTEXT.get();
	}
}

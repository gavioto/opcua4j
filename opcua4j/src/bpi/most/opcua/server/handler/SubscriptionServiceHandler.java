package bpi.most.opcua.server.handler;

import org.apache.log4j.Logger;
import org.opcfoundation.ua.builtintypes.UnsignedInteger;
import org.opcfoundation.ua.common.ServiceFaultException;
import org.opcfoundation.ua.core.CreateSubscriptionRequest;
import org.opcfoundation.ua.core.CreateSubscriptionResponse;
import org.opcfoundation.ua.core.DeleteSubscriptionsRequest;
import org.opcfoundation.ua.core.DeleteSubscriptionsResponse;
import org.opcfoundation.ua.core.ModifySubscriptionRequest;
import org.opcfoundation.ua.core.ModifySubscriptionResponse;
import org.opcfoundation.ua.core.PublishRequest;
import org.opcfoundation.ua.core.PublishResponse;
import org.opcfoundation.ua.core.RepublishRequest;
import org.opcfoundation.ua.core.RepublishResponse;
import org.opcfoundation.ua.core.SetPublishingModeRequest;
import org.opcfoundation.ua.core.SetPublishingModeResponse;
import org.opcfoundation.ua.core.StatusCodes;
import org.opcfoundation.ua.core.SubscriptionServiceSetHandler;
import org.opcfoundation.ua.core.TransferSubscriptionsRequest;
import org.opcfoundation.ua.core.TransferSubscriptionsResponse;
import org.opcfoundation.ua.transport.EndpointServiceRequest;

public class SubscriptionServiceHandler extends ServiceHandlerBase implements SubscriptionServiceSetHandler {

	/**
	 * counts up to generate unique subscription IDs
	 */
	private static long subscriptionIndex = 0;
	
	private static final Logger LOG = Logger
			.getLogger(SubscriptionServiceHandler.class);
	
	@Override
	public void onCreateSubscription(EndpointServiceRequest<CreateSubscriptionRequest, CreateSubscriptionResponse> serviceReq) throws ServiceFaultException {
		
		LOG.info("onCreateSubscription");
		
		initRequestContext(serviceReq);
		CreateSubscriptionRequest req = serviceReq.getRequest();
		CreateSubscriptionResponse resp = new CreateSubscriptionResponse();
		
		LOG.info("request: " + req.toString());
		
		resp.setResponseHeader(buildRespHeader(req));
		
		resp.setSubscriptionId(new UnsignedInteger(subscriptionIndex++));
		resp.setRevisedLifetimeCount(req.getRequestedLifetimeCount());
		resp.setRevisedMaxKeepAliveCount(req.getRequestedMaxKeepAliveCount());
		resp.setRevisedPublishingInterval(req.getRequestedPublishingInterval());
		
		sendResp(serviceReq, resp);
	}

	@Override
	public void onModifySubscription(EndpointServiceRequest<ModifySubscriptionRequest, ModifySubscriptionResponse> serviceReq) throws ServiceFaultException {
		initRequestContext(serviceReq);
		ModifySubscriptionRequest req = serviceReq.getRequest();
		ModifySubscriptionResponse resp = new ModifySubscriptionResponse();
		
		resp.setResponseHeader(buildErrRespHeader(req, StatusCodes.Bad_ServiceUnsupported));
		sendResp(serviceReq, resp);
	}

	@Override
	public void onSetPublishingMode(EndpointServiceRequest<SetPublishingModeRequest, SetPublishingModeResponse> serviceReq) throws ServiceFaultException {
		initRequestContext(serviceReq);
		SetPublishingModeRequest req = serviceReq.getRequest();
		SetPublishingModeResponse resp = new SetPublishingModeResponse();
		
		resp.setResponseHeader(buildErrRespHeader(req, StatusCodes.Bad_ServiceUnsupported));
		sendResp(serviceReq, resp);
	}

	@Override
	public void onPublish(EndpointServiceRequest<PublishRequest, PublishResponse> serviceReq) throws ServiceFaultException {
		initRequestContext(serviceReq);
		PublishRequest req = serviceReq.getRequest();
		PublishResponse resp = new PublishResponse();
		
		resp.setResponseHeader(buildErrRespHeader(req, StatusCodes.Bad_ServiceUnsupported));
		sendResp(serviceReq, resp);
	}

	@Override
	public void onRepublish(EndpointServiceRequest<RepublishRequest, RepublishResponse> serviceReq) throws ServiceFaultException {
		initRequestContext(serviceReq);
		RepublishRequest req = serviceReq.getRequest();
		RepublishResponse resp = new RepublishResponse();
		
		resp.setResponseHeader(buildErrRespHeader(req, StatusCodes.Bad_ServiceUnsupported));
		sendResp(serviceReq, resp);
	}

	@Override
	public void onTransferSubscriptions(EndpointServiceRequest<TransferSubscriptionsRequest, TransferSubscriptionsResponse> serviceReq) throws ServiceFaultException {
		initRequestContext(serviceReq);
		TransferSubscriptionsRequest req = serviceReq.getRequest();
		TransferSubscriptionsResponse resp = new TransferSubscriptionsResponse();
		
		resp.setResponseHeader(buildErrRespHeader(req, StatusCodes.Bad_ServiceUnsupported));
		sendResp(serviceReq, resp);
	}

	@Override
	public void onDeleteSubscriptions(EndpointServiceRequest<DeleteSubscriptionsRequest, DeleteSubscriptionsResponse> serviceReq) throws ServiceFaultException {
		initRequestContext(serviceReq);
		DeleteSubscriptionsRequest req = serviceReq.getRequest();
		DeleteSubscriptionsResponse resp = new DeleteSubscriptionsResponse();
		
		resp.setResponseHeader(buildErrRespHeader(req, StatusCodes.Bad_ServiceUnsupported));
		sendResp(serviceReq, resp);
	}

}

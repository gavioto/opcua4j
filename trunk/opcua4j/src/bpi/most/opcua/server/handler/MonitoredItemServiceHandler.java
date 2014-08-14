package bpi.most.opcua.server.handler;

import org.apache.log4j.Logger;
import org.opcfoundation.ua.common.ServiceFaultException;
import org.opcfoundation.ua.core.CreateMonitoredItemsRequest;
import org.opcfoundation.ua.core.CreateMonitoredItemsResponse;
import org.opcfoundation.ua.core.DeleteMonitoredItemsRequest;
import org.opcfoundation.ua.core.DeleteMonitoredItemsResponse;
import org.opcfoundation.ua.core.ModifyMonitoredItemsRequest;
import org.opcfoundation.ua.core.ModifyMonitoredItemsResponse;
import org.opcfoundation.ua.core.MonitoredItemServiceSetHandler;
import org.opcfoundation.ua.core.SetMonitoringModeRequest;
import org.opcfoundation.ua.core.SetMonitoringModeResponse;
import org.opcfoundation.ua.core.SetTriggeringRequest;
import org.opcfoundation.ua.core.SetTriggeringResponse;
import org.opcfoundation.ua.core.StatusCodes;
import org.opcfoundation.ua.transport.EndpointServiceRequest;

public class MonitoredItemServiceHandler extends ServiceHandlerBase implements MonitoredItemServiceSetHandler {

	private static final Logger LOG = Logger
			.getLogger(MonitoredItemServiceHandler.class);
	
	@Override
	public void onCreateMonitoredItems(EndpointServiceRequest<CreateMonitoredItemsRequest, CreateMonitoredItemsResponse> serviceReq) throws ServiceFaultException {
		
		LOG.info("onCreateMonitoredItems");
		
		initRequestContext(serviceReq);
		CreateMonitoredItemsRequest req = serviceReq.getRequest();
		CreateMonitoredItemsResponse resp = new CreateMonitoredItemsResponse();
		
		LOG.info("request: " + req.toString());
		
		resp.setResponseHeader(buildErrRespHeader(req, StatusCodes.Bad_ServiceUnsupported));
		sendResp(serviceReq, resp);
	}

	@Override
	public void onModifyMonitoredItems(EndpointServiceRequest<ModifyMonitoredItemsRequest, ModifyMonitoredItemsResponse> serviceReq) throws ServiceFaultException {
		initRequestContext(serviceReq);
		ModifyMonitoredItemsRequest req = serviceReq.getRequest();
		ModifyMonitoredItemsResponse resp = new ModifyMonitoredItemsResponse();
		
		resp.setResponseHeader(buildErrRespHeader(req, StatusCodes.Bad_ServiceUnsupported));
		sendResp(serviceReq, resp);
	}

	@Override
	public void onSetMonitoringMode(EndpointServiceRequest<SetMonitoringModeRequest, SetMonitoringModeResponse> serviceReq) throws ServiceFaultException {
		initRequestContext(serviceReq);
		SetMonitoringModeRequest req = serviceReq.getRequest();
		SetMonitoringModeResponse resp = new SetMonitoringModeResponse();
		
		resp.setResponseHeader(buildErrRespHeader(req, StatusCodes.Bad_ServiceUnsupported));
		sendResp(serviceReq, resp);
	}

	@Override
	public void onSetTriggering(EndpointServiceRequest<SetTriggeringRequest, SetTriggeringResponse> serviceReq) throws ServiceFaultException {
		initRequestContext(serviceReq);
		SetTriggeringRequest req = serviceReq.getRequest();
		SetTriggeringResponse resp = new SetTriggeringResponse();
		
		resp.setResponseHeader(buildErrRespHeader(req, StatusCodes.Bad_ServiceUnsupported));
		sendResp(serviceReq, resp);
	}

	@Override
	public void onDeleteMonitoredItems(EndpointServiceRequest<DeleteMonitoredItemsRequest, DeleteMonitoredItemsResponse> serviceReq) throws ServiceFaultException {
		initRequestContext(serviceReq);
		DeleteMonitoredItemsRequest req = serviceReq.getRequest();
		DeleteMonitoredItemsResponse resp = new DeleteMonitoredItemsResponse();
		
		resp.setResponseHeader(buildErrRespHeader(req, StatusCodes.Bad_ServiceUnsupported));
		sendResp(serviceReq, resp);
	}

}

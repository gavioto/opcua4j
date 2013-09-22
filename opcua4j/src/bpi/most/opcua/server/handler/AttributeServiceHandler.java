package bpi.most.opcua.server.handler;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.opcfoundation.ua.builtintypes.DataValue;
import org.opcfoundation.ua.builtintypes.DateTime;
import org.opcfoundation.ua.builtintypes.NodeId;
import org.opcfoundation.ua.builtintypes.StatusCode;
import org.opcfoundation.ua.builtintypes.UnsignedInteger;
import org.opcfoundation.ua.common.ServiceFaultException;
import org.opcfoundation.ua.core.AttributeServiceSetHandler;
import org.opcfoundation.ua.core.HistoryReadRequest;
import org.opcfoundation.ua.core.HistoryReadResponse;
import org.opcfoundation.ua.core.HistoryReadResult;
import org.opcfoundation.ua.core.HistoryReadValueId;
import org.opcfoundation.ua.core.HistoryUpdateRequest;
import org.opcfoundation.ua.core.HistoryUpdateResponse;
import org.opcfoundation.ua.core.Node;
import org.opcfoundation.ua.core.ReadAtTimeDetails;
import org.opcfoundation.ua.core.ReadEventDetails;
import org.opcfoundation.ua.core.ReadProcessedDetails;
import org.opcfoundation.ua.core.ReadRawModifiedDetails;
import org.opcfoundation.ua.core.ReadRequest;
import org.opcfoundation.ua.core.ReadResponse;
import org.opcfoundation.ua.core.ReadValueId;
import org.opcfoundation.ua.core.StatusCodes;
import org.opcfoundation.ua.core.WriteRequest;
import org.opcfoundation.ua.core.WriteResponse;
import org.opcfoundation.ua.transport.EndpointServiceRequest;

import bpi.most.opcua.server.core.UAServerException;
import bpi.most.opcua.server.core.adressspace.INodeManager;
import bpi.most.opcua.server.core.history.IHistoryManager;
import bpi.most.opcua.server.core.util.ArrayUtils;

public class AttributeServiceHandler extends ServiceHandlerBase implements AttributeServiceSetHandler {

	private static final Logger LOG = Logger
	.getLogger(AttributeServiceHandler.class);
	
	
	/**
	 * history read only for variables and properties -> historydatanodes
	 * 
	 */
	@Override
	public void onHistoryRead(
			EndpointServiceRequest<HistoryReadRequest, HistoryReadResponse> serviceReq)
			throws ServiceFaultException {
		initRequestContext(serviceReq);
		HistoryReadRequest req = serviceReq.getRequest();
		HistoryReadResponse resp = new HistoryReadResponse();
		LOG.info("---------------  got history read request: ");
		
		List<HistoryReadResult> resultList = new ArrayList<HistoryReadResult>();
		try {
			Object historyDetails = req.getHistoryReadDetails().decode();
			if (historyDetails instanceof ReadEventDetails){
				//we wont support that
			}else if (historyDetails instanceof ReadAtTimeDetails){
				//reads values at specific timestamps
			}else if (historyDetails instanceof ReadProcessedDetails){
				//read processed values for a specified resampleinterval
				ReadProcessedDetails processedDetails = (ReadProcessedDetails) historyDetails;
				/*
				 * entries in the array returned by processedDetails.getAggregateType()
				 * correlate with the entries in req.getNodesToRead(). this means for every node
				 * a different aggregate type can be read.
				 * 
				 * see OPC UA Part 11, page 38, part 6.4.4.2
				 * 
				 */
				
				if (processedDetails.getAggregateType().length != req.getNodesToRead().length){
					/*
					 * return Bad_AggregateListMismatch; but this code does not exist!?
					 */
				}else{
					for (int i = 0; i < req.getNodesToRead().length; i++){
						@SuppressWarnings("unused")
						HistoryReadValueId id = req.getNodesToRead()[i];
						@SuppressWarnings("unused")
						NodeId aggregateType = processedDetails.getAggregateType()[i];
					}
				}
				
			}else if (historyDetails instanceof ReadRawModifiedDetails){
				ReadRawModifiedDetails rawModifiedDetails = (ReadRawModifiedDetails) historyDetails;
				
				
				for (HistoryReadValueId id: req.getNodesToRead()){
					LOG.debug("nodeid: " + id.getNodeId());
					INodeManager nodeMngr = getAddressSpace().getNodeManager(id.getNodeId().getNamespaceIndex());
					IHistoryManager histMngr = nodeMngr.getHistoryManager();
					
					HistoryReadResult histResult = null;
					if (histMngr != null){
						histResult = histMngr.readRawModifiedDetails(id, rawModifiedDetails);
					}
					if (histResult == null){
						//we did not have a nodemanger for this ns-index, or he returned null
						histResult = new HistoryReadResult(new StatusCode(StatusCodes.Bad_HistoryOperationUnsupported), null, null);
					}
					resultList.add(histResult);
				}
				
			}
		} catch (Exception e) {
			LOG.error(e.getMessage(), e);
		}
		
		resp.setResults(ArrayUtils.toArray(resultList, HistoryReadResult.class));
		resp.setResponseHeader(buildRespHeader(req));
		serviceReq.sendResponse(resp);
	}

	@Override
	public void onHistoryUpdate(
			EndpointServiceRequest<HistoryUpdateRequest, HistoryUpdateResponse> serviceReq)
			throws ServiceFaultException {
		
		initRequestContext(serviceReq);
		HistoryUpdateRequest req = serviceReq.getRequest();
		HistoryUpdateResponse resp = new HistoryUpdateResponse();
		
		resp.setResponseHeader(buildErrRespHeader(req, StatusCodes.Bad_ServiceUnsupported));
		sendResp(serviceReq, resp);
	}

	@Override
	public void onRead(EndpointServiceRequest<ReadRequest, ReadResponse> serviceReq)
			throws ServiceFaultException {
		initRequestContext(serviceReq);
		ReadRequest req = serviceReq.getRequest();
		ReadResponse resp = new ReadResponse();
		
		//contains all DataValues which are sent pack to the clients read request
		List<DataValue> dataValues = new ArrayList<DataValue>();
		
		/*
		 * a small temporary map for read nodes from the addressspace,
		 * because we may want to read different attributes from one node 
		 * and do not want to fetch the node again from the addressspace
		 */
		Map<NodeId, Node> readNodes = new HashMap<NodeId, Node>();
		
		//read all nodes the client wants
		for (ReadValueId readId: req.getNodesToRead()){
			LOG.debug("client sent read request. nodeid: " + readId.getNodeId() + "; attrId:" + readId.getAttributeId());
			//check temp map
			Node nodeToRead = readNodes.get(readId.getNodeId());
			if (nodeToRead == null){
				try {
					nodeToRead = getAddressSpace().getNode(readId.getNodeId());
				} catch (UAServerException e) {
					LOG.error(e.getMessage(), e);
					
					//set a bad datavalue for this node and get on with the next one
					dataValues.add(new DataValue(StatusCode.BAD));// buildDataValue(nodeToRead, readId.getAttributeId()));
					continue;
				}
				//read it from addressspace and store it in the map
				readNodes.put(readId.getNodeId(), nodeToRead);
			}
			
			if (nodeToRead == null){
				LOG.warn("did not find node with id " + readId.getNodeId());
			}
			
			dataValues.add(buildDataValue(nodeToRead, readId.getAttributeId()));
		}
		
		//build response and send it to the client
		resp.setResponseHeader(buildRespHeader(req));
		resp.setResults(dataValues.toArray(new DataValue[dataValues.size()]));
		serviceReq.sendResponse(resp);
	}
	
	/**
	 * builds a DataValue for the given {@link ReadValueId}.
	 * what the clients wants to read is defined by
	 * {@link ReadValueId#getNodeId()} and {@link ReadValueId#getAttributeId()}
	 * @param readId
	 * @return
	 */
	private DataValue buildDataValue(Node nodeToRead, UnsignedInteger attrId){
		DataValue val = new DataValue();
		
		if (nodeToRead != null){
			nodeToRead.readAttributeValue(attrId, val);
			
			val.setStatusCode(StatusCode.GOOD);
			val.setServerTimestamp(new DateTime());
			val.setSourceTimestamp(new DateTime());
		}else{
			val.setStatusCode(StatusCode.BAD);
		}
		
	//	LOG.debug("read value " + val.getValue().getValue());
		
		return val;
	}

	@Override
	public void onWrite(EndpointServiceRequest<WriteRequest, WriteResponse> serviceReq)
			throws ServiceFaultException {
		
		initRequestContext(serviceReq);
		WriteRequest req = serviceReq.getRequest();
		WriteResponse resp = new WriteResponse();
		
		resp.setResponseHeader(buildErrRespHeader(req, StatusCodes.Bad_ServiceUnsupported));
		sendResp(serviceReq, resp);
	}
}

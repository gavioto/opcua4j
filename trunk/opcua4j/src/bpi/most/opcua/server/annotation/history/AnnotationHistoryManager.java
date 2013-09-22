package bpi.most.opcua.server.annotation.history;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.apache.log4j.Logger;
import org.opcfoundation.ua.builtintypes.DataValue;
import org.opcfoundation.ua.builtintypes.DateTime;
import org.opcfoundation.ua.builtintypes.ExtensionObject;
import org.opcfoundation.ua.builtintypes.StatusCode;
import org.opcfoundation.ua.builtintypes.Variant;
import org.opcfoundation.ua.core.HistoryData;
import org.opcfoundation.ua.core.HistoryReadResult;
import org.opcfoundation.ua.core.HistoryReadValueId;
import org.opcfoundation.ua.core.ReadRawModifiedDetails;
import org.opcfoundation.ua.encoding.EncodingException;

import bpi.most.opcua.server.annotation.AnnotationNodeManager;
import bpi.most.opcua.server.annotation.IAnnotationHistoryManager;
import bpi.most.opcua.server.annotation.NodeMapping;
import bpi.most.opcua.server.core.history.HistoryValue;
import bpi.most.opcua.server.core.history.IHistoryManager;
import bpi.most.opcua.server.core.util.ArrayUtils;

public class AnnotationHistoryManager implements IHistoryManager {

	private static final Logger LOG = Logger.getLogger(AnnotationHistoryManager.class);

	private AnnotationNodeManager nodeMngr;
	private IAnnotationHistoryManager histMngr;

	/**
	 * @param nodeMngr
	 */
	public AnnotationHistoryManager(AnnotationNodeManager nodeMngr, IAnnotationHistoryManager histMngr) {
		this.nodeMngr = nodeMngr;
		this.histMngr = histMngr;
	}

	@Override
	public HistoryReadResult readRawModifiedDetails(HistoryReadValueId histReadValId, ReadRawModifiedDetails rawModifiedDetails) {
		String nodeid = (String) histReadValId.getNodeId().getValue();
		String[] idParts = nodeid.split(AnnotationNodeManager.ID_SEPARATOR);

		String nodeName = idParts[0];
		String beanId = idParts[1];

		List<HistoryValue> historyValues = null;
		if (idParts.length == 2) {

		} else if (idParts.length == 3) {
			
			/*
			 * this is pretty hardcoded for our desires here. after the structure nodemapping->referenceMapping->nodemapping is refactored
			 * this can be changed to support different combinations of nodes. for now we assume that only Variables classes linked with @Reference
			 * are annotated with @HistoryRead
			 */
			
			String fieldName = idParts[2];

			NodeMapping nodeMapping;
			nodeMapping = nodeMngr.getNodeMapping(nodeName);
			Class<?> targetType = nodeMapping.getReferencedDataType(fieldName);
			
			NodeMapping fieldMapping = nodeMngr.getNodeMapping(targetType.getSimpleName());

			Date start = new Date(rawModifiedDetails.getStartTime().getTimeInMillis());
			Date end = new Date(rawModifiedDetails.getEndTime().getTimeInMillis());

			if (histMngr != null) {
				// TODO find out the actual historyRead ID and do not call the implementation with the "fieldName"
				historyValues = histMngr.getHistoryValues(nodeMapping.getClazz(), beanId, fieldName, start, end);
			}

		}
		
		HistoryReadResult historyResult = null;
		if (historyValues != null){
			historyResult = new HistoryReadResult();
			HistoryData data = new HistoryData();
			
			//map the values from the client(implementor of (IAnnotationHistoryManager) to an valid opc DataValue object
			List<DataValue> opcDataValues = new ArrayList<DataValue>();
			for (HistoryValue histValue: historyValues) {
				Calendar cal = Calendar.getInstance();
				cal.setTime(histValue.getTimestamp());
				DateTime dateTime = new DateTime(cal);
				opcDataValues.add(new DataValue(new Variant(histValue.getValue()), StatusCode.GOOD, dateTime, dateTime));
			}
			
			data.setDataValues(ArrayUtils.toArray(opcDataValues, DataValue.class));
			try {
				historyResult.setHistoryData(ExtensionObject.binaryEncode(data));
			} catch (EncodingException e) {
				LOG.error(e.getMessage(), e);
			}
		}

		return historyResult;
	}

}

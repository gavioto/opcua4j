package bpi.most.opcua.server.core.history;

import org.apache.log4j.Logger;
import org.opcfoundation.ua.core.HistoryReadResult;
import org.opcfoundation.ua.core.HistoryReadValueId;
import org.opcfoundation.ua.core.ReadRawModifiedDetails;

public class HistoryManagerAdapter implements IHistoryManager {

	private static final Logger LOG = Logger.getLogger(HistoryManagerAdapter.class);

	@Override
	public HistoryReadResult readRawModifiedDetails(HistoryReadValueId histReadValId, ReadRawModifiedDetails rawModifiedDetails) {
		LOG.debug("handling readRawModifiedDetails-history-request");
		return null;
	}

}

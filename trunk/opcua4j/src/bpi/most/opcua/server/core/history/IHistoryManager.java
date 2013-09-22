package bpi.most.opcua.server.core.history;

import org.opcfoundation.ua.core.HistoryReadResult;
import org.opcfoundation.ua.core.HistoryReadValueId;
import org.opcfoundation.ua.core.ReadRawModifiedDetails;

/**
 * is able to process history read requests on Properties and Data Variables
 * @author harald
 *
 */
public interface IHistoryManager {

	public HistoryReadResult readRawModifiedDetails(HistoryReadValueId histReadValId, ReadRawModifiedDetails rawModifiedDetails);
	
}

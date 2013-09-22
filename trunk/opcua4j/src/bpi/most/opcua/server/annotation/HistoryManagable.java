package bpi.most.opcua.server.annotation;

import java.util.List;

/**
 * has to be implemented if a INodeManager wants to support history
 * reads and writes.
 * 
 * @author harald
 *
 */
public interface HistoryManagable {

	List<Object> getObjectHistoryValues(String className, String id);
	
}

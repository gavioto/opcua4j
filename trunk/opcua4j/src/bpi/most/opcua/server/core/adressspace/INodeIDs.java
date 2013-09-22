package bpi.most.opcua.server.core.adressspace;

import java.util.Map;

import org.opcfoundation.ua.builtintypes.NodeId;

/**
 * returns a Map of nodeids sorted by a special
 * type
 * 
 * @author harald
 *
 */
public interface INodeIDs {

	/**
	 * returns a map of NodeIds with the nodename as key.
	 * e.g the key "RootFolder" for standard node types would
	 * return the nodeid of 84.
	 * @return
	 */
	public Map<String, NodeId> getNodeIdsByNodeName();
	
	public NodeId getNodeIdByName(String name);
}

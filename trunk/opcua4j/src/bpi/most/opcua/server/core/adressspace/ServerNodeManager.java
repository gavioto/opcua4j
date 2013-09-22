package bpi.most.opcua.server.core.adressspace;

import org.apache.log4j.Logger;
import org.opcfoundation.ua.builtintypes.DataValue;
import org.opcfoundation.ua.builtintypes.NodeId;
import org.opcfoundation.ua.builtintypes.UnsignedInteger;
import org.opcfoundation.ua.core.Node;
import org.opcfoundation.ua.core.ReferenceNode;

import bpi.most.opcua.server.core.history.HistoryManagerAdapter;
import bpi.most.opcua.server.core.history.IHistoryManager;

/**
 * manages all nodes of the local server instance. this includes for example
 * session-nodes for every active session and server diagnostics nodes
 * 
 * @author harald
 * 
 */
public class ServerNodeManager implements INodeManager {

	private static final Logger LOG = Logger.getLogger(ServerNodeManager.class);

	@Override
	public void init(AddressSpace addrSpace, int nsIndex) {
		// TODO Auto-generated method stub

	}

	@Override
	public ReferenceNode[] getReferences(NodeId nodeId) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public DataValue readNodeAttribute(NodeId nodeId, UnsignedInteger attrId) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void addNode(Node node, NodeId parentNode, NodeId referenceId) {
		// TODO to add session nodes and so on
	}

	@Override
	public Node getNode(NodeId nodeId) {
		Node node = null;
		
		
		return node;
	}

	@Override
	public IHistoryManager getHistoryManager() {
		return new HistoryManagerAdapter();
	}
}

package bpi.most.opcua.server.core.adressspace;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.log4j.Logger;
import org.opcfoundation.ua.builtintypes.ExpandedNodeId;
import org.opcfoundation.ua.builtintypes.NodeId;
import org.opcfoundation.ua.core.Node;
import org.opcfoundation.ua.core.ReferenceDescription;
import org.opcfoundation.ua.core.ReferenceNode;

import bpi.most.opcua.server.core.UAServerException;
import bpi.most.opcua.server.core.util.NodeUtils;

/**
 * manages the address space of the underlying system. the whole address space is the
 * union of all used {@link INodeManager}s. the {@link AddressSpace} delegates request
 * to the correct INodeManager or queries all of them.
 * 
 * @author harald
 *
 * TODO think of concurrency! (concurrent collections, not synchronized ones!)
 * TODO handle standard objects (server, session, types, ...)
 * 	ServerStatusDataType
 *
 */
public class AddressSpace {
	
	private static final Logger LOG = Logger.getLogger(AddressSpace.class);
	
	//there is only one addressspace
	private static final AddressSpace INSTANCE = new AddressSpace();
	private AddressSpace(){}
	public static AddressSpace getInstance(){
		return INSTANCE;
	}
	
	/**
	 * an insert-ordered map of all namespace (NS) nodeMgrs of the addressspace. key is the NS-index of the servers namespacearray,
	 * value is an {@link INodeManager}. the nodeMgrs are called
	 * on their insert order for initialization
	 */
	private Map<Integer, INodeManager> nodeMgrs = new LinkedHashMap<Integer, INodeManager>();
	
	public Node getNode(NodeId nodeId) throws UAServerException{
		//get the node from the managed nodes (the addressspace)
		
		Node node = null;
		
		int nsIndex = nodeId.getNamespaceIndex();
		if (nodeMgrs.containsKey(nsIndex)){
			LOG.debug("ns index for nodeid " + nodeId.toString() + " is " + nsIndex);
			node = nodeMgrs.get(nsIndex).getNode(nodeId);
		}
		
		return node;
	}
	
	public Node getNode(ExpandedNodeId expNodeId) throws UAServerException{
		return getNode(NodeUtils.toNodeId(expNodeId));
	}
	
	public List<ReferenceDescription> browseNode(NodeId nodeId){
		List<ReferenceDescription> refDescs = new ArrayList<ReferenceDescription>();
		
		//collect all references for this node
		ReferenceNode[] temp = null;
		for (INodeManager nm: nodeMgrs.values()){
			try{
				temp = nm.getReferences(nodeId);
				//we do not trust INodeManager implementations here :)
				if (temp != null){
					LOG.debug("got " + temp.length + " references from " + nm.getClass().getName());
					refDescs.addAll(refToRefDesc(temp));
				}
			}catch(UAServerException e){
				//here we catch the exception because we may be able to collect references from at least one nodemanager
				LOG.error(e.getMessage(), e);
			}
		}
	
		return refDescs;
	}
	
	/**
	 * for all given {@link ReferenceNode} a {@link ReferenceDescription} is created which can
	 * be returned in the browseRequest.
	 * 
	 * @param refList
	 * @return
	 * @throws UAServerException
	 */
	private List<ReferenceDescription> refToRefDesc(ReferenceNode[] refList) throws UAServerException{
		List<ReferenceDescription> refDescList = new ArrayList<ReferenceDescription>();
		
		if (refList != null){
			for (ReferenceNode refNode: refList){
				Node targetNode = getNode(refNode.getTargetId());
				if (targetNode != null){
					//the target node does really exist. it can be in opc ua that only a reference exists, but the target node does not!
					ReferenceDescription refDesc = NodeUtils.mapReferenceNodeToDesc(refNode, targetNode);
					refDescList.add(refDesc);
				}
			}
		}
		
		return refDescList;
	}
	
	public void addNodeManager(int nsIndex, INodeManager partition){
		if (nodeMgrs.containsKey(nsIndex)){
			//TODO throw new exception - not supported to change nodeMgrs for namespace
		}
		
		nodeMgrs.put(nsIndex, partition);
	}
	
	public INodeManager getNodeManager(int nsIndex){
		return nodeMgrs.get(nsIndex);
	}
	
	public CoreNodeManager getCoreNodeManager(){
		return (CoreNodeManager) nodeMgrs.get(0);
	}

}

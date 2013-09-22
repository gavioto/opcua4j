package bpi.most.opcua.server.core.parse;

import java.util.Map;

import org.opcfoundation.ua.builtintypes.NodeId;

import bpi.most.opcua.server.core.adressspace.INodeIDs;

/**
 * this class decorates anny {@link INodeIDs} so that is always prefixes the given prefix to the desired node-name
 * when a client uses {@link INodeIDs#getNodeIdByName(String)}.
 * it can be set so that a client can transparently read a subset of {@link NodeId}s.
 * <br />
 * <br />
 * for example when parsing an xml file the child-elements often have their parents name prefixed.
 * <br />
 * example: the objecttype "ServerType" has several children like "ServerArray" but the "ServerArray"s NodeId is
 * accessed by "ServerType_ServerArray", hence "ServerType_" would be a useful prefix in that case.
 */

public class NodeIDsPrefixDecorator implements INodeIDs {

	/**
	 * the prefix which is used on access by name
	 */
	private String readPrefix = "";
	
	/**
	 * the source INodeIDs from which NodeID's are read
	 */
	private INodeIDs nodeIDs;
	
	/**
	 * @param readPrefix
	 * @param nodeIDs
	 */
	public NodeIDsPrefixDecorator(String readPrefix, INodeIDs nodeIDs) {
		super();

		if (nodeIDs instanceof NodeIDsPrefixDecorator){
			NodeIDsPrefixDecorator innerOne = (NodeIDsPrefixDecorator) nodeIDs;
			
			/*
			 * if the given one is another prefix decorator, we use his INodeIDs implementation and append his prefix to our one
			 */
			this.nodeIDs = innerOne.getNodeIDs();
			this.readPrefix = readPrefix + innerOne.getReadPrefix();
		}else{
			this.readPrefix = readPrefix;
			this.nodeIDs = nodeIDs;
		}
	}
	
	@Override
	public Map<String, NodeId> getNodeIdsByNodeName() {
		return nodeIDs.getNodeIdsByNodeName();
	}

	@Override
	public NodeId getNodeIdByName(String name) {
		String nameToFind;
		
		//if the given name does already begin with the prefix, we do not add it a second time!
		if (name.startsWith(readPrefix)){
			nameToFind = name;
		}else{
			nameToFind = readPrefix + name;
		}
		
	//	System.out.println("returning nodeid for " + nameToFind);
		
		NodeId nodeId = nodeIDs.getNodeIdByName(nameToFind);
		
		//lets try to find it without the prefix
		if (nodeId == null){
			nodeId = nodeIDs.getNodeIdByName(name);
		}
		
		return nodeId;
	}

	/**
	 * @return the nodeIDs
	 */
	public INodeIDs getNodeIDs() {
		return nodeIDs;
	}

	/**
	 * @return the readPrefix
	 */
	public String getReadPrefix() {
		return readPrefix;
	}
	
	
}

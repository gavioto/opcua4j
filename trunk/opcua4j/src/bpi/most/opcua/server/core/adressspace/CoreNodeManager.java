package bpi.most.opcua.server.core.adressspace;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.apache.log4j.Logger;
import org.opcfoundation.ua.builtintypes.DataValue;
import org.opcfoundation.ua.builtintypes.DateTime;
import org.opcfoundation.ua.builtintypes.LocalizedText;
import org.opcfoundation.ua.builtintypes.NodeId;
import org.opcfoundation.ua.builtintypes.QualifiedName;
import org.opcfoundation.ua.builtintypes.UnsignedInteger;
import org.opcfoundation.ua.builtintypes.Variant;
import org.opcfoundation.ua.common.NamespaceTable;
import org.opcfoundation.ua.core.AccessLevel;
import org.opcfoundation.ua.core.AddReferencesItem;
import org.opcfoundation.ua.core.BuildInfo;
import org.opcfoundation.ua.core.Identifiers;
import org.opcfoundation.ua.core.Node;
import org.opcfoundation.ua.core.NodeClass;
import org.opcfoundation.ua.core.ReferenceDescription;
import org.opcfoundation.ua.core.ReferenceNode;
import org.opcfoundation.ua.core.ServerState;
import org.opcfoundation.ua.core.ServerStatusDataType;
import org.opcfoundation.ua.core.VariableNode;

import bpi.most.opcua.server.core.UAServerException;
import bpi.most.opcua.server.core.history.HistoryManagerAdapter;
import bpi.most.opcua.server.core.history.IHistoryManager;
import bpi.most.opcua.server.core.parse.CsvNodeIDParser;
import bpi.most.opcua.server.core.parse.ParsedElement;
import bpi.most.opcua.server.core.parse.XmlModelParser;
import bpi.most.opcua.server.core.util.FileUtils;
import bpi.most.opcua.server.core.util.NodeUtils;

/**
 * manages all Nodes of the standard opc ua information model in
 * the http://opcfoundation.org/UA/ namespace. he parses the standard
 * nodes from an XML and stores them in a map for accessing.
 * 
 * @author harald
 *
 */
public class CoreNodeManager implements INodeManager {

	private static final String CSV_FILE_PATH = "/addressspace/StandardTypes.csv";
	private static final String XML_FILE_PATH = "/addressspace/UADefinedTypes.xml";
	
	private static final Logger LOG = Logger.getLogger(CoreNodeManager.class);
	
	//this is the starttime which should be set in the UAServer
	private DateTime start = new DateTime(); 
	
	/**
	 * managed nodes of the address space
	 */
	private Map<NodeId, Node> nodes;
	private int nsIndex = 0;
	private AddressSpace addrSpace;
	
	public CoreNodeManager(){
		nodes = new HashMap<NodeId, Node>();
	}
	
	/**
	 * fills the nodes map with needed nodes of the standard information model
	 */
	@Override
	public void init(AddressSpace addrSpace, int nsIndex) {
		this.addrSpace = addrSpace;
		this.nsIndex = nsIndex;
		
		INodeIDs nodeIds = new CsvNodeIDParser(FileUtils.getFileFromResource2(CSV_FILE_PATH));
		
		XmlModelParser modelParser = new XmlModelParser(FileUtils.getFileFromResource2(XML_FILE_PATH), nodeIds);
		
		//parse the xml file
		List<ParsedElement> parsedElements = modelParser.parseNodes();
		
		LOG.debug("parsed elements " + parsedElements.size());
		
		/*
		 * add all parsed elements (nodes and references) to our nodes-map.
		 * all nodes are added at the beginning because references can only
		 * be added to existing nodes in our map.
		 */
		for (ParsedElement pe: parsedElements){
			addNodes(pe.getNodes());
		}
		for (ParsedElement pe: parsedElements){
			addReferences(pe.getRefItems(), true);
		}
		
		
		//we add one extra hardcode server status node
		//TODO support serverstatus
//		addServerStatNode();
		
//		addZoneSerializer();
//		
//		addZoneNode();
	}
	
	public void addReferences(List<AddReferencesItem> refItems, boolean bidirectional){
		for (AddReferencesItem refItem: refItems){
			addReference(refItem, bidirectional);
		}
	}
	
	public void addReference(AddReferencesItem refItem, boolean bidirectional){
		addReference(refItem.getSourceNodeId(), NodeUtils.toNodeId(refItem.getTargetNodeId()), refItem.getReferenceTypeId(), refItem.getIsForward(), bidirectional);
	}
	
	public void addReference(NodeId srcNode, NodeId targetNode, NodeId referenceTypeId, boolean isForward){
		
		/*
		 * TODO
		 *  insert inverse references to have bidirectional references.
		 *  for example a node with hasTypedefinition reference is one direction.
		 *  it's type node would then have a reference TypeDefinitionOf (which is the inverseName, hence inverse=true) to the first one. 
		 */
		
		ReferenceNode newRef = NodeFactory.getReferenceNodeInstance(referenceTypeId, !isForward, targetNode);
		NodeUtils.addReferenceToNode(getNode(srcNode), newRef);
	}
	
	public void addReference(NodeId srcNode, NodeId targetNode, NodeId referenceTypeId, boolean isForward, boolean bidirectional){
		addReference(srcNode, targetNode, referenceTypeId, isForward);
		if (bidirectional){
			addReference(targetNode, srcNode, referenceTypeId, !isForward);
		}
	}
	
	public void addNode(Node node){
		if (NodeUtils.NodeIsValid(node)){
			nodes.put(node.getNodeId(), node);
		}else{
			LOG.debug("node is not valid!\n" + node);
		}
	}
	
	public void addNodes(List<Node> nodes){
		for (Node node: nodes){
			addNode(node);
		}
	}
	
	@Override
	public void addNode(Node node, NodeId parentNode, NodeId referenceId){
		addNode(node);
		//add reference
		addReference(parentNode, node.getNodeId(), referenceId, true);
	}
	
	public Node getNode(NodeId nodeId){
		Node node = null;
		
		if (nodeId.equals(Identifiers.Server_NamespaceArray)) {
			VariableNode v = new VariableNode();
			v.setNodeClass(NodeClass.Variable);
			v.setValue(new Variant(NamespaceTable.DEFAULT.toArray()));
			node = v;
		}

		else if (Identifiers.Server_ServerStatus.equals(nodeId)) {
			LOG.info("creating serverstatus variable node");
			VariableNode v = new VariableNode();
			v.setNodeClass(NodeClass.Variable);
			v.setNodeId(nodeId);
			v.setDataType(Identifiers.ServerStatusDataType);
			v.setValueRank(-1);
			v.setAccessLevel(AccessLevel.getMask(AccessLevel.CurrentRead));
			v.setUserAccessLevel(AccessLevel.getMask(AccessLevel.CurrentRead));
			v.setDisplayName(new LocalizedText("Server Status", Locale.ENGLISH));

			ServerStatusDataType serverState = new ServerStatusDataType();
			serverState.setBuildInfo(new BuildInfo("www.producturi.com",
					"manufacturer", "productname", "sw-version", "buildnumber",
					new DateTime()));
			serverState.setCurrentTime(new DateTime());
			serverState.setStartTime(start);
			serverState.setState(ServerState.Running);
			// serverState.setSecondsTillShutdown(new UnsignedInteger(1000));
			// serverState.setShutdownReason(new LocalizedText("afoch so",
			// Locale.ENGLISH));

			v.setValue(new Variant(serverState));
			node = v;
		}

		else if (nodeId.equals(Identifiers.Server_ServerStatus_State)) {
			LOG.info("creating serverstatus state variable node");
			VariableNode v = new VariableNode();
			v.setNodeClass(NodeClass.Variable);
			v.setNodeId(nodeId);
			v.setDataType(Identifiers.ServerStatusDataType);
			v.setValueRank(-1);
			v.setArrayDimensions(null);
			v.setBrowseName(new QualifiedName("State"));
			v.setAccessLevel(AccessLevel.getMask(AccessLevel.CurrentRead));
			v.setUserAccessLevel(AccessLevel.getMask(AccessLevel.CurrentRead));
			v.setDisplayName(new LocalizedText("State", Locale.ENGLISH));
			v.setMinimumSamplingInterval(-1.0);
			v.setHistorizing(false);

			v.setValue(new Variant(ServerState.Running));
			node = v;
		}
		
		else if (nodeId.equals(Identifiers.Server_ServerStatus_CurrentTime)) {
			LOG.info("creating serverstatus currentTime variable");
			VariableNode v = new VariableNode();
			v.setNodeClass(NodeClass.Variable);
			v.setNodeId(nodeId);
			v.setDataType(Identifiers.UtcTime);
			v.setValueRank(-1);
			v.setArrayDimensions(null);
			v.setBrowseName(new QualifiedName("State"));
			v.setAccessLevel(AccessLevel.getMask(AccessLevel.CurrentRead));
			v.setUserAccessLevel(AccessLevel.getMask(AccessLevel.CurrentRead));
			v.setDisplayName(new LocalizedText("State", Locale.ENGLISH));
			v.setMinimumSamplingInterval(-1.0);
			v.setHistorizing(false);

			v.setValue(new Variant(new DateTime(Calendar.getInstance())));
			node = v;
		}
		
		else{
			//get the node from the managed nodes
			node = nodes.get(nodeId);
		}
		
		return node;
	}

	@Override
	public ReferenceNode[] getReferences(NodeId nodeId) throws UAServerException {
		ReferenceNode[] refs = null;
		
		//get the node
		Node node = getNode(nodeId);
		
		//map the references
		if (node != null){
			refs = node.getReferences();
		}
		
		return refs;
	}

	@Override
	public DataValue readNodeAttribute(NodeId nodeId, UnsignedInteger attrId) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public IHistoryManager getHistoryManager() {
		return new HistoryManagerAdapter();
	}
}

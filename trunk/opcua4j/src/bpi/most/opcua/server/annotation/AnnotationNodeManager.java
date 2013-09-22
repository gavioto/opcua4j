package bpi.most.opcua.server.annotation;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.apache.log4j.Logger;
import org.opcfoundation.ua.builtintypes.DataValue;
import org.opcfoundation.ua.builtintypes.ExpandedNodeId;
import org.opcfoundation.ua.builtintypes.LocalizedText;
import org.opcfoundation.ua.builtintypes.NodeId;
import org.opcfoundation.ua.builtintypes.QualifiedName;
import org.opcfoundation.ua.builtintypes.UnsignedByte;
import org.opcfoundation.ua.builtintypes.UnsignedInteger;
import org.opcfoundation.ua.builtintypes.Variant;
import org.opcfoundation.ua.core.HistoryReadResult;
import org.opcfoundation.ua.core.IdType;
import org.opcfoundation.ua.core.Identifiers;
import org.opcfoundation.ua.core.Node;
import org.opcfoundation.ua.core.ObjectNode;
import org.opcfoundation.ua.core.ReadRawModifiedDetails;
import org.opcfoundation.ua.core.ReferenceDescription;
import org.opcfoundation.ua.core.ReferenceNode;

import bpi.most.opcua.server.annotation.history.AnnotationHistoryManager;
import bpi.most.opcua.server.core.UAServerException;
import bpi.most.opcua.server.core.adressspace.AddressSpace;
import bpi.most.opcua.server.core.adressspace.INodeManager;
import bpi.most.opcua.server.core.adressspace.NodeFactory;
import bpi.most.opcua.server.core.history.IHistoryManager;
import bpi.most.opcua.server.core.util.ArrayUtils;
import bpi.most.opcua.server.core.util.NodeUtils;
import bpi.most.opcua.server.mock.MockHistoryManager;

/**
 * generating classes at runtime for faster access:
 * http://www.ibm.com/developerworks/java/library/j-dyn0610/
 * 
 * throwing exceptions if the bean-class is not annotated.
 * 
 * TODO handle exceptions of the INodeSource object. cause maybe the system is unreachable or
 * there exists an implementation failure.
 * 
 * @author harald
 *
 */
public class AnnotationNodeManager implements INodeManager{

	private static final Logger LOG = Logger.getLogger(AnnotationNodeManager.class);
	public static final String ID_SEPARATOR = ":";
	
	private Locale locale = Locale.ENGLISH;
	
	private int nsIndex;
	private AddressSpace addrSpace;
	
	/**
	 * we manage all created typenodes (from annotated POJOs) on our own. this
	 * is because they belong to our namespace index, hence we are called from
	 * the {@link AddressSpace} for them. 
	 */
	private Map<NodeId, Node> typeNodes = new HashMap<NodeId, Node>();
	
	/**
	 * created rootnote for nodes managed by this nodemanager.
	 * if another root was given to the constructor this object
	 * will be null!
	 */
	private ObjectNode myRoot;
	
	/**
	 * NodeId of the rootnode for this nodemanager.
	 */
	private NodeId myRootId;
	
	/*
	 * all nodes of this nodemanager are added under a single root node. how
	 * this rootnode looks like is described by the following properties.
	 */
	private String browseName; //browsename of the rootnode
	private String displayName; //displayname of the rootnode
	private String description; //description of the rootnode
	private NodeId referenceType;
	
	/**
	 * parent node for our root here
	 */
	private NodeId parentNodeOfRoot = Identifiers.ObjectsFolder;
	
	/**
	 * source for domain specific nodes.
	 */
	private IAnnotatedNodeSource annoNodeSource;
	
	/**
	 * key: classname; value: nodemapping for the classname of the associated key.
	 * actually key should equal the values {@link NodeMapping#getNodeName()}.
	 */
	Map<String, NodeMapping> nodeMappingsPerClassName;
	
	/**
	 * handles history requests
	 */
	AnnotationHistoryManager annoHistManager;
	
	/**
	 * rootNode as NodeId was given -> all nodes for this nodemanager will be
	 * added as children to this root node
	 * 
	 * @param annoNodeSource
	 * @param rootNode
	 */
	public AnnotationNodeManager(IAnnotatedNodeSource annoNodeSource, NodeId rootNode) {
		this.annoNodeSource = annoNodeSource;
		this.myRootId = rootNode;
		nodeMappingsPerClassName = new HashMap<String, NodeMapping>();
	}
	
	/**
	 * infos to build a root node were given -> build a new root node and add
	 * it as children of the ObjectsFolder to the address space
	 * 
	 * @param annoNodeSource
	 * @param displayName
	 * @param description
	 * @param browseName
	 */
	public AnnotationNodeManager(IAnnotatedNodeSource annoNodeSource, String displayName, String description, String browseName) {
		this.annoNodeSource = annoNodeSource;
		this.displayName = displayName;
		this.description = description;
		this.browseName = browseName;
		nodeMappingsPerClassName = new HashMap<String, NodeMapping>();
	}
	
	/**
	 * 
	 * infos to build a root node and a parend root id  
	 * where given -> build a new root node and add it
	 * as children of the given nodeId to the address space
	 * 
	 * @param annoNodeSource
	 * @param displayName
	 * @param description
	 * @param browseName
	 * @param parentNode
	 */
	public AnnotationNodeManager(IAnnotatedNodeSource annoNodeSource, String displayName, String description, String browseName, NodeId parentNode) {
		this.annoNodeSource = annoNodeSource;
		this.displayName = displayName;
		this.description = description;
		this.browseName = browseName;
		this.parentNodeOfRoot = parentNode;
		nodeMappingsPerClassName = new HashMap<String, NodeMapping>();
	}
	
	/**
	 * builds a node from an annotated object
	 * @param obj
	 * @return
	 */
	public Node buildNode(Object bean){
		try {
			NodeMapping nodeMapping = getNodeMapping(bean);
			
			ObjectNode node = new ObjectNode();
			node.setNodeClass(nodeMapping.getNodeClass()); //this is because we now the bean is annotated with UaNode
			
			node.setDisplayName(new LocalizedText(nodeMapping.readDisplNameField(bean), locale));
			node.setDescription(new LocalizedText(nodeMapping.readDescField(bean), locale));
			node.setNodeId(NodeId.get(IdType.String, nsIndex, buildID(nodeMapping, nodeMapping.readIdField(bean).toString())));
			
			//TODO set browse name here!!
			node.setBrowseName(new QualifiedName(nodeMapping.getFieldName(nodeMapping.getIdField())));
			
			node.setEventNotifier(UnsignedByte.ZERO);
			node.setUserWriteMask(UnsignedInteger.ZERO);
			node.setWriteMask(UnsignedInteger.ZERO);
			
			//create typedefinition reference for the node
			ExpandedNodeId typeDef;
			if (nodeMapping.getTypeDefinition() != null){
				typeDef = nodeMapping.getTypeDefinition();
			}else{
				//TODO this case should not happen
				typeDef = new ExpandedNodeId(Identifiers.BaseObjectType);
			}
			NodeUtils.addReferenceToNode(node, new ReferenceNode(Identifiers.HasTypeDefinition, false, typeDef));
			
			return node;
		} catch (Exception e) {
			e.printStackTrace();
			LOG.error(e.getMessage(), e);
		}
		//TODO throw server exception
		return null;
	}
	
	/**
	 * builds an String which is should be unique in the addressspace.
	 * here, different ID-strategies could be used.
	 * for know we concatenate the beans classname with the given
	 * idValue
	 * @return
	 */
	protected String buildID(NodeMapping nodeMapping, String idValue){
		return nodeMapping.getNodeName() + ID_SEPARATOR + idValue;
	}
	
	protected String extractOriginalID(String id){
		String[] idParts = id.split(ID_SEPARATOR);
		return idParts[1];
	}
	
	/**
	 * 1. builds the root node so the client has an access point for our nodes.
	 * 2. creates typedefinition nodes for all {@link NodeMapping}s we have.
	 */
	@Override
	public void init(AddressSpace addrSpace, int nsIndex) {
		this.addrSpace = addrSpace;
		this.nsIndex = nsIndex;
		
		buildRootNode();
		
		//for all nodemappings we have, we build typenodes
		for (NodeMapping nodeMapping: nodeMappingsPerClassName.values()){
			//create a typenode for the object.
			TypeNodeBuilder typeBuilder = new TypeNodeBuilder(locale, nsIndex);
			List<Node> nodes = typeBuilder.buildTypeNode(nodeMapping);
			Node typeNode = nodes.get(0);

			//set the created typedefinition for this nodemapping
			nodeMapping.setTypeDefinition(NodeUtils.toExpandedNodeId(typeNode.getNodeId()));
			
			//add all created nodes to our typenode map
			for (Node n: nodes){
				typeNodes.put(n.getNodeId(), n);
			}
			
			try {
				/*
				 * typenodes are not only referenced by nodes using them as type (room -> hasTypeDefinition -> roomType)
				 * but also have to be added as subtypes in the opc ua typesystem (baseobjecttype -> hasSubType -> roomType) - and this is done here.
				 */
				NodeUtils.addReferenceToNode(addrSpace.getNode(Identifiers.BaseObjectType), new ReferenceNode(Identifiers.HasSubtype, false, NodeUtils.toExpandedNodeId(typeNode.getNodeId())));
			} catch (UAServerException e) {
				LOG.error(e.getMessage(), e);
			}
		}
	}
	
	/**
	 * creats a new root node if no explicit rootnode
	 * was given in constructor.
	 */
	private void buildRootNode(){
		if (myRootId == null){
			myRoot = NodeFactory.getObjectNodeInstance(browseName, description, displayName, locale, new NodeId(nsIndex, browseName), UnsignedByte.ZERO);
			myRootId = myRoot.getNodeId();

			//set typedefinition for node
			NodeUtils.addReferenceToNode(myRoot, new ReferenceNode(Identifiers.HasTypeDefinition, false, new ExpandedNodeId(Identifiers.BaseObjectType)));
			
			//add the root to the namespace
			addrSpace.getCoreNodeManager().addReference(parentNodeOfRoot, myRoot.getNodeId(), Identifiers.Organizes, true);
		}
	}

	/**
	 * returns the {@link Node} for the given NodeId. Either
	 * the root is returned which is managed by this manager,
	 * or finding the node is delegated.
	 * @throws UAServerException 
	 */
	@Override
	public Node getNode(NodeId nodeId) throws UAServerException {
		Node node = null;
		if (nodeId.equals(myRootId) && myRoot != null){
			return myRoot;
		}else{
			node = findNode(nodeId);
		}
		return node;
	}
	
	/**
	 * creates a node based on the given nodeid
	 * @param nodeId
	 * @return
	 * @throws UAServerException 
	 * @throws UaServerException 
	 */
	private Node findNode(NodeId nodeId) throws UAServerException{
		Node node = null;
		
		String nodeid = (String) nodeId.getValue();
		String[] idParts = nodeid.split(ID_SEPARATOR);
		
		if (((String)nodeId.getValue()).contains("Type")){
			//TODO check if it is a type node of our nodemappings, if so --> return node from corenodemanager
			return typeNodes.get(nodeId);
		}
		
		LOG.debug(String.format("finding %s with id %s", idParts[0], idParts[1]));
		
		String nodeName = idParts[0];
		String beanId = idParts[1];
		
		NodeMapping nodeMapping = getNodeMapping(nodeName);
		if (nodeMapping == null){
			throw new UAServerException("there does not exist a nodemapping for the name: " + nodeName);
		}
		
		//get the desired object from the domain specific implementations
		Object obj = annoNodeSource.getObjectById(nodeMapping.getClazz(), beanId);
		
		if (idParts.length == 2){
			//the object identified by className and beanId is looked for
			node = buildNode(obj);
		}else{
			String fieldName = idParts[2];
			Object oValue = null;
			Class<?> type = null;
			try {
				//we check the datatype of the object which should be returned
				type = nodeMapping.getReferencedDataType(fieldName);
				/*
				 * read the value of the field.
				 * if its a builtin-type, the oValue is the value we are looking for.
				 * if not, we introspect the object and try to find the field annotated with @value
				 */
				oValue = nodeMapping.readProperty(fieldName, obj);
				
				if (!NodeUtils.isBuiltinType(type)){
					LOG.info("no builtintype: " + type.getName());
					//not builtin type, so we have to find the @value field of the read object and read that's value
					NodeMapping another = getNodeMapping(type.getName() , oValue);
					
					//set the correct value and type
					if (oValue != null){
						oValue = another.readValueField(oValue);
					}
					
					type = another.getValueField().getType();
					
					LOG.debug("read value from annotated value field: " + oValue);
				}else{
					LOG.debug("read builtin type: " + oValue);
				}
				
			} catch (Exception e) {
				LOG.error(e.getMessage(), e);
				//TODO throw server exception here
			}
			
			NodeId dataType = NodeFactory.getNodeIdByDataType(type);
			String fieldId = nodeName + ID_SEPARATOR + beanId + ID_SEPARATOR + fieldName;
			node = NodeFactory.getScalarVariableNodeInstance(fieldId, "", fieldName, locale, new NodeId(nsIndex, fieldId), new Variant(oValue), dataType);
			
			//TODO add typedefinition reference. take the one from the nodeMApping
			//Identifiers.BaseDataVariableType
			NodeUtils.addReferenceToNode(node, new ReferenceNode(Identifiers.HasTypeDefinition, false, new ExpandedNodeId(Identifiers.PropertyType)));
		}
		
		return node;
	}
	
	@Override
	public ReferenceNode[] getReferences(NodeId nodeId) throws UAServerException {
		List<ReferenceNode> refs = null;
		
		/*
		 * we only have references for our own index
		 */
		if (nodeId.getNamespaceIndex() == nsIndex){
			if (myRootId.equals(nodeId)){
				refs = getTopLevelReferences();
			}else{
				refs = getReferencesForNodeId(nodeId);
			}
		}
		
		return ArrayUtils.toArray(refs, ReferenceNode.class);
	}
	
	private List<ReferenceNode> getTopLevelReferences(){
		List<ReferenceNode> topLevelRefs = new ArrayList<ReferenceNode>();
		
		//add references we added ourselfs to the root
		if (myRoot.getReferences() != null){
			topLevelRefs.addAll(Arrays.asList(myRoot.getReferences()));
		}
		
		//add all references we get from the implementation
		topLevelRefs.addAll(mapBeanListToRefDescList(annoNodeSource.getTopLevelElements()));
		
		return topLevelRefs;
	}
	
	private List<ReferenceNode> getReferencesForNodeId(NodeId nodeId) throws UAServerException{
		LOG.info(nodeId.getValue());
		List<ReferenceNode> refs = new ArrayList<ReferenceNode>();
		String[] idParts = ((String)nodeId.getValue()).split(ID_SEPARATOR);
		
		if (typeNodes.containsKey(nodeId)){
			//check if it is a type node of our nodemappings
			Node node = typeNodes.get(nodeId);
			refs.addAll(Arrays.asList(node.getReferences()));
			return refs;
		}
		
		
		String nodeName = idParts[0];
		String beanId = idParts[1];		
		NodeMapping nodeMapping = getNodeMapping(nodeName);
		
		if (idParts.length == 2){
			//here we have references to children - of the given nodeId
			List<?> children = annoNodeSource.getChildren(nodeMapping.getClazz(), beanId);
			if (children != null){
				refs.addAll(mapBeanListToRefDescList(children));
			}
			
			/*
			 * we also have to add all annotated children of the object of the given node
			 * that are fields annotated with
			 *  @Property
			 *  @Reference
			 *  @Variable
			 *  ....
			 */
			refs.addAll(buildInBeanReferences(nodeName, beanId));
			
			//create typedefinition for the node
			ReferenceNode typeRefNode = new ReferenceNode(Identifiers.HasTypeDefinition, false, nodeMapping.getTypeDefinition());
//			ReferenceDescription typeRef = NodeUtils.mapReferenceNodeToDesc(typeRefNode, addrSpace.getNode(nodeMapping.getTypeDefinition()));
			refs.add(typeRefNode);
		}else if (idParts.length == 3){
			String name = idParts[2];
			
			//we want to fetch the references of another member-variable of the bean.
			
			ReferenceMapping refMapping = nodeMapping.getReferenceByName(name);
			ReferenceNode typeRefNode = new ReferenceNode(Identifiers.HasTypeDefinition, false, new ExpandedNodeId(refMapping.getTypeDefinition()));
			
			// if its an @Ref --> check the bean for its references
			// do not forget typedefinition!
			
			refs.add(typeRefNode);
		}
		
		
		
		return refs;
	}
	
	/**
	 * builds all so called "inBean" references.
	 * 
	 * @param id
	 * @return
	 * @throws UAServerException 
	 */
	private List<ReferenceNode> buildInBeanReferences(String nodeName, String id) throws UAServerException{
		List<ReferenceNode> inBeanReferences = new ArrayList<ReferenceNode>();
		
		/*
		 * the nodemapping contains all information to 
		 * create a reference for each property, variable, reference in the bean 
		 */
		NodeMapping nodeMapping = getNodeMapping(nodeName);
		
		/**
		 * the obj we extract properties and so on from.
		 */
		Object obj = annoNodeSource.getObjectById(nodeMapping.getClazz(), id);
		//only if obj really exists, we build referenced for it. notice we do not need actual values from it
		if (obj != null){
			for (ReferenceMapping refMapping: nodeMapping.getReferencesByName().values()){
				try {
					String fieldName = refMapping.getFieldName();
					String fieldId = nodeMapping.getNodeName() + ID_SEPARATOR + id + ID_SEPARATOR + fieldName;
					NodeId nodeId = new NodeId(nsIndex, fieldId);
//					String displayName = fieldName;
	/*				
					//build the reference description
					Node referencedNode = NodeFactory.getNodeInstance(fieldId, refMapping.getDescription(), displayName, locale, refMapping.getNodeClass(), new NodeId(nsIndex, fieldId));
					
					//TODO add typedefinition reference. take the one from the nodeMApping
					NodeUtils.addReferenceToNode(referencedNode, new ReferenceNode(Identifiers.HasTypeDefinition, false, new ExpandedNodeId(Identifiers.PropertyType)));
	*/
					ReferenceNode ref = new ReferenceNode(refMapping.getReferenceType(), false, NodeUtils.toExpandedNodeId(nodeId));
					inBeanReferences.add(ref);
				} catch (Exception e) {
					LOG.error(e.getMessage(), e);
				}
			}
		}
		
		
		
		return inBeanReferences;
	}
	
	private List<ReferenceNode> mapBeanListToRefDescList(List<?> objectsToIntrospect){
		List<ReferenceNode> refDescList = new ArrayList<ReferenceNode>();
		for (Object obj: objectsToIntrospect){
			refDescList.add(mapBeanToRefDesc(obj));
		}
		return refDescList;
	}
	
	private ReferenceNode mapBeanToRefDesc(Object obj){
		Node objAsNode = buildNode(obj);
		ReferenceNode ref = new ReferenceNode(Identifiers.HasComponent, false, NodeUtils.toExpandedNodeId(objAsNode.getNodeId()));
		return ref;
	}
	
	@Override
	public DataValue readNodeAttribute(NodeId nodeId, UnsignedInteger attrId) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void addNode(Node node, NodeId parentNode, NodeId referenceId) {
		// TODO Auto-generated method stub

	}
	
	/**
	 * returns the nodemapping for the given object. if there does not exist
	 * one, the object is introspected to create a nodemapping.
	 * 
	 * if the given object is null, null is returned. because we can neither introspect
	 * null nor can we return a nodemapping for it.
	 * 
	 * @param obj
	 * @return
	 * @throws UAServerException 
	 */
	private NodeMapping getNodeMapping(Object obj) throws UAServerException{
		NodeMapping nm = null;
		
		if (obj != null){
			nm = nodeMappingsPerClassName.get(obj.getClass().getName());
			if (nm == null){
				//there does not existing an nodemapping for the giving class, lets create one
				nm = UaNodeAnnoIntrospector.introspect(obj);
				nodeMappingsPerClassName.put(nm.getNodeName(), nm);
			}
		}
		
		return nm;
	}

	public NodeMapping getNodeMapping(String nodeName){
		return nodeMappingsPerClassName.get(nodeName);
	}
	
	/**
	 * tries to get the nodemapping by className, otherwhise by the given
	 * obj.
	 * 
	 * @param obj
	 * @param className
	 * @return
	 * @throws UAServerException 
	 */
	private NodeMapping getNodeMapping(String nodeName, Object obj) throws UAServerException{
		//try to get a nodemapping for the object (or its nodeName)
		NodeMapping nodeMapping = getNodeMapping(nodeName);
		if (nodeMapping == null){
			nodeMapping = getNodeMapping(obj);
		}
		return nodeMapping;
	}
	
	/**
	 * introspects the given object for annotations and
	 * saves a NodeMapping for it. this is useful to introspect
	 * objects at startup to have nodemappings for the different
	 * classes. otherwise it could happen that a fetched object
	 * is null and no nodemapping exists for its class. this would
	 * lead to an uaserverexception, because no nodemapping can
	 * be extracted from NULL.
	 * 
	 * returns true if a nodemapping could be extracted, false otherwhise.
	 * 
	 * 
	 * @param object
	 * @throws UAServerException 
	 */
	public boolean addObjectToIntrospect(Object object){
		boolean success = false;
		try{
			success = getNodeMapping(object) != null;
		}catch(UAServerException e){
			LOG.error(e.getMessage(), e);
		}
		return success;
	}
	
	/**
	 * creates a type node for the given nodemapping
	 * 
	 * @param nodeMapping
	 * @return
	 */
	private Node buildTypeNode(NodeMapping nodeMapping){
		return null;
	}
	
	public void setHistoryManager(IAnnotationHistoryManager histMngr){
		annoHistManager = new AnnotationHistoryManager(this, histMngr);
	}

	@Override
	public IHistoryManager getHistoryManager() {
		return annoHistManager;
	}

}

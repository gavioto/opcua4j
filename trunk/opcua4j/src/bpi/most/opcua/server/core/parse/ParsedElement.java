package bpi.most.opcua.server.core.parse;

import java.util.ArrayList;
import java.util.List;

import org.opcfoundation.ua.core.AddReferencesItem;
import org.opcfoundation.ua.core.Node;

import bpi.most.opcua.server.core.adressspace.AddressSpace;

/**
 * wrapper class which contains a list of parsed
 * elements and a list of {@link AddReferencesItem}s. both
 * have to be added to the {@link AddressSpace}
 * 
 * @author harald
 *
 */
public class ParsedElement {

	private List<Node> nodes;
	private List<AddReferencesItem> refItems;

	/**
	 * 
	 */
	public ParsedElement() {
		nodes = new ArrayList<Node>();
		refItems = new ArrayList<AddReferencesItem>();
	}

	public void addAddReferencesItem(AddReferencesItem refItem){
		refItems.add(refItem);
	}
	
	public void addAddReferencesItemList(List<AddReferencesItem> refItemList){
		refItems.addAll(refItemList);
	} 
	
	public void addNode(Node node){
		nodes.add(node);
	}
	
	public void addNodeList(List<Node> nodeList){
		nodes.addAll(nodeList);
	}
	
	/**
	 * @return the nodes
	 */
	public List<Node> getNodes() {
		return nodes;
	}
	/**
	 * @return the refItems
	 */
	public List<AddReferencesItem> getRefItems() {
		return refItems;
	}
}

package bpi.most.opcua.server.core.adressspace;

import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.log4j.Logger;

/**
 * builds an {@link AddressSpace} object and supports adding different
 * {@link INodeManager}s before the {@link AddressSpace} object is built.
 * the {@link INodeManager#init(AddressSpace)} method is called in exact
 * the insert order. means if one manager is inserted after another, the second
 * one can already make use of the first one in its own init-method.
 *
 * @author harald
 *
 */
public class AddrSpaceBuilder {
	
	private static final Logger LOG = Logger.getLogger(AddrSpaceBuilder.class);
	
	private AddressSpace addrSpace;
	private Map<Integer, INodeManager> managers;
	
	public AddrSpaceBuilder(){
		//create a new instance
		addrSpace = AddressSpace.getInstance();
		
		managers = new LinkedHashMap<Integer, INodeManager>();
		managers.put(0, new CoreNodeManager());
		managers.put(1, new ServerNodeManager());
	}
	
	public void addNodeManager(int nsIndex, INodeManager nsManager){
		managers.put(nsIndex, nsManager);
	}
	
	public AddressSpace build(){
		//we call on every manager the init method and add it to the addrSpace afterwards
		for (Integer nsIndex: managers.keySet()){
			INodeManager manager = managers.get(nsIndex);
			manager.init(addrSpace, nsIndex);
			
			addrSpace.addNodeManager(nsIndex, manager);
		}
		
		return addrSpace;
	}
}

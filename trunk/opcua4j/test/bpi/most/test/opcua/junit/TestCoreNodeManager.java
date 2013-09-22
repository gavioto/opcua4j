package bpi.most.test.opcua.junit;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.opcfoundation.ua.core.Identifiers;
import org.opcfoundation.ua.core.Node;
import org.opcfoundation.ua.core.ReferenceDescription;
import org.opcfoundation.ua.core.ReferenceNode;

import bpi.most.opcua.server.core.UAServerException;
import bpi.most.opcua.server.core.adressspace.AddressSpace;
import bpi.most.opcua.server.core.adressspace.CoreNodeManager;
import bpi.most.opcua.server.core.util.NodeUtils;

public class TestCoreNodeManager {

	private CoreNodeManager mngr;
	
	@Before
	public void setUp() throws Exception {
		mngr = new CoreNodeManager();
	}
	
	@Test
	public void testObjectsFolder() {
		mngr.init(null, 3);
		
		Node objects = mngr.getNode(Identifiers.ObjectsFolder);
		assertNotNull(objects);
		
		System.out.println("objects has references: " + objects.getReferences().length);
		
		for (ReferenceNode r: objects.getReferences()){
			if (Identifiers.FolderType.equals(r.getTargetId())){
				//folder type is a forward reference
				assertFalse(r.getIsInverse());
			}else if(Identifiers.RootFolder.equals(r.getTargetId())){
				//to rootfolder it is a inverse reference
				assertTrue(r.getIsInverse());
			}
			System.out.println("--> reference to: " + mngr.getNode(NodeUtils.toNodeId(r.getTargetId())).getBrowseName().getName());
			System.out.println("details:" + r);
		}
	}

	/**
	 * tests the structure of the complex ServerType
	 * @throws UAServerException 
	 */
	@Test
	public void testServerType() throws UAServerException{
		//set up nodemanager and addressspace
		final int nsIndex = 0;
		AddressSpace as = AddressSpace.getInstance();
		as.addNodeManager(nsIndex, mngr);
		mngr.init(as, nsIndex);
		
		ReferenceNode[] refs = mngr.getReferences(Identifiers.ServerType);
		assertNotNull(refs);
		assertTrue(refs.length > 0);
	}
}

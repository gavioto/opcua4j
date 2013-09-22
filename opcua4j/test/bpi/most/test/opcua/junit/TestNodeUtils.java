package bpi.most.test.opcua.junit;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.opcfoundation.ua.core.Identifiers;

import bpi.most.opcua.server.core.adressspace.NodeFactory;
import bpi.most.opcua.server.core.util.NodeUtils;

public class TestNodeUtils {

	@Test
	public void testPrimitiveTypes() {
		int i = 23;
		float f = 23.2f;
		Object o;

		o = i;
		assertTrue(NodeUtils.isBuiltinType(o.getClass()));
		o = f;
		assertTrue(NodeUtils.isBuiltinType(o.getClass()));
	}

	@Test
	public void testArrays(){
		Boolean[] bools = new Boolean[3];
		System.out.println(bools.getClass());
		assertEquals(Identifiers.Boolean, NodeFactory.getNodeIdByDataType(bools.getClass()));
	}
	
	@Test
	public void testValueRank(){
		assertEquals(3, (int) NodeUtils.getValueRank(Integer[][][].class));
		assertEquals(-1, (int) NodeUtils.getValueRank(Integer.class));
	}
}

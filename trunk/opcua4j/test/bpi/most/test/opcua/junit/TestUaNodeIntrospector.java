package bpi.most.test.opcua.junit;

import static org.junit.Assert.*;

import org.junit.Test;
import org.opcfoundation.ua.core.Identifiers;
import org.opcfoundation.ua.core.NodeClass;

import bpi.most.opcua.server.annotation.NodeMapping;
import bpi.most.opcua.server.annotation.ReferenceMapping;
import bpi.most.opcua.server.annotation.UaNodeAnnoIntrospector;
import bpi.most.opcua.server.core.UAServerException;
import bpi.most.test.opcua.junit.data.SomeObject;
import bpi.most.test.opcua.junit.data.TestNode;

public class TestUaNodeIntrospector {

	@Test
	public void testCorrectlyAnnotatedBean() throws IllegalArgumentException, IllegalAccessException, UAServerException {
		TestNode testNode = new TestNode("some id", "some name", "some desc", "austria", "vienna");
		NodeMapping mapping = UaNodeAnnoIntrospector.introspect(testNode);
		
		//standard info
		assertEquals(testNode.getDescription(), mapping.readDescField(testNode));
		assertEquals(testNode.getID(), mapping.readIdField(testNode));
		assertEquals(testNode.getName(), mapping.readDisplNameField(testNode));
		assertEquals(testNode.getClass(), mapping.getClazz());
		
		//properties
		assertEquals(2, mapping.getReferencesByName().size());
		assertEquals(testNode.getState(), mapping.readProperty("state", testNode));
		assertEquals(testNode.getCountry(), mapping.readProperty("country", testNode));
		
		ReferenceMapping stateMapping = mapping.getReferenceByName("state");
		assertEquals(Identifiers.HasProperty, stateMapping.getReferenceType());
		assertEquals(NodeClass.Variable, stateMapping.getNodeClass());
		
	}

	//TODO change exception when server exception is introduced
	@Test(expected=UAServerException.class)
	public void testIntrospectNoUaNodeBean() throws UAServerException{
		UaNodeAnnoIntrospector.introspect(new SomeObject());
	}

	@Test()
	public void testTryIntrospectNoUaNodeBean(){
		NodeMapping nm = UaNodeAnnoIntrospector.tryIntrospect(new SomeObject());
		assertNull(nm);
	}
}

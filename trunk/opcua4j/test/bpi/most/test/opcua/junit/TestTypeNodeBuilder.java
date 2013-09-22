package bpi.most.test.opcua.junit;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.util.Locale;

import org.apache.log4j.Logger;
import org.junit.Before;
import org.junit.Test;
import org.opcfoundation.ua.builtintypes.LocalizedText;
import org.opcfoundation.ua.builtintypes.NodeId;
import org.opcfoundation.ua.builtintypes.QualifiedName;
import org.opcfoundation.ua.core.Identifiers;
import org.opcfoundation.ua.core.Node;
import org.opcfoundation.ua.core.NodeClass;
import org.opcfoundation.ua.core.VariableNode;

import bpi.most.opcua.server.annotation.NodeMapping;
import bpi.most.opcua.server.annotation.TypeNodeBuilder;
import bpi.most.opcua.server.annotation.UaNodeAnnoIntrospector;
import bpi.most.opcua.server.core.UAServerException;
import bpi.most.test.opcua.junit.data.TestNode;

public class TestTypeNodeBuilder {

	private static final Logger LOG = Logger.getLogger(TestTypeNodeBuilder.class);
	private static final Locale LOCALE = Locale.ENGLISH;
	private static final int NS_INDEX = 3;

	private static final String TESTNODE_TYPE_NAME = "TestNodeType";
	
	private TestNode testNode;
	private NodeMapping mapping;
	private TypeNodeBuilder typeBuilder;

	@Before
	public void before() throws UAServerException{
		testNode = new TestNode("some id", "some name", "some desc", "austria", "vienna");
		mapping = UaNodeAnnoIntrospector.introspect(testNode);
		typeBuilder = new TypeNodeBuilder(LOCALE, NS_INDEX);
	}
	
	@Test
	public void testBuildPropertyInstanceDeclaration() throws UAServerException {
		Node instDecl = typeBuilder.buildInstanceDeclaration(mapping.getReferenceByName("state"), TESTNODE_TYPE_NAME);
		
		assertNotNull(instDecl);
		assertEquals(NodeClass.Variable, instDecl.getNodeClass());
		assertEquals(new NodeId(NS_INDEX, TESTNODE_TYPE_NAME + ":state"), instDecl.getNodeId());
		assertEquals(new QualifiedName(NS_INDEX, "state"), instDecl.getBrowseName());
		assertEquals(new LocalizedText("state", LOCALE), instDecl.getDisplayName());
		assertEquals(VariableNode.class, instDecl.getClass());
		VariableNode casted = (VariableNode) instDecl;
		assertEquals(-1, (int) casted.getValueRank());
		assertEquals(Identifiers.String, casted.getDataType());
		
		LOG.debug(instDecl);
	}
}

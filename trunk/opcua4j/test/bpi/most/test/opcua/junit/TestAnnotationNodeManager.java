package bpi.most.test.opcua.junit;

import static org.junit.Assert.assertEquals;

import org.junit.Test;
import org.opcfoundation.ua.core.Node;
import org.opcfoundation.ua.core.NodeClass;

import bpi.most.opcua.example.basic.SampleNodeManager;
import bpi.most.opcua.example.basic.nodes.Room;
import bpi.most.opcua.server.annotation.AnnotationNodeManager;

public class TestAnnotationNodeManager {

	@Test
	public void testBuildNode() {
		AnnotationNodeManager annoMgr = new AnnotationNodeManager(new SampleNodeManager(), "my building", "contains some sample nodes of a building", "sampleBuilding");
		
		Room room = new Room(11, "kitchen", "kitchen in the first floor", 23.4, 2, null, null);
		
		Node node = annoMgr.buildNode(room);
		assertEquals(NodeClass.Object, node.getNodeClass());
		assertEquals("Room:" + room.getNumber(), node.getNodeId().getValue());
		assertEquals(room.getDescription(), node.getDescription().getText());
		assertEquals(room.getName(), node.getDisplayName().getText());
	}

}

package bpi.most.test.opcua.junit;

import static org.junit.Assert.assertEquals;

import java.io.InputStream;

import org.junit.Before;
import org.junit.Test;
import org.opcfoundation.ua.core.Identifiers;

import bpi.most.opcua.server.core.adressspace.INodeIDs;
import bpi.most.opcua.server.core.parse.CsvNodeIDParser;
import bpi.most.opcua.server.core.parse.NodeIDsPrefixDecorator;
import bpi.most.opcua.server.core.util.FileUtils;

public class TestNodeIDsPrefixDecorator {

	private INodeIDs nodeIds;
	
	private InputStream fileStream;
	
	@Before
	public void setUp(){
		fileStream = FileUtils.getFileFromResource2(TestCsvNodeIDParser.CSV_FILE_PATH);
	}
	
	/**
	 * tests a single decorator
	 */
	@Test
	public void testGetNodeIdByNameSinglePrefix() {
		nodeIds = new NodeIDsPrefixDecorator("ServerType_", new CsvNodeIDParser(fileStream));
		
		assertEquals(Identifiers.ServerType_ServerArray, nodeIds.getNodeIdByName("ServerArray"));
	}

	
	/**
	 * tests a decorator, decorating another one.
	 */
	@Test
	public void testGetNodeIdByNameTwoPrefixes() {
		nodeIds = 	new NodeIDsPrefixDecorator("TripAlarmType_",
					new NodeIDsPrefixDecorator("SuppressedState_",
					new CsvNodeIDParser(fileStream)));
		
		assertEquals(Identifiers.TripAlarmType_SuppressedState_TransitionTime, nodeIds.getNodeIdByName("TransitionTime"));
	}
	
	@Test
	public void testGetNodeIdByNameThreePrefixes(){
		nodeIds = 	new NodeIDsPrefixDecorator("TripAlarmType_",
					new NodeIDsPrefixDecorator("ShelvingState_",
					new NodeIDsPrefixDecorator("CurrentState_",
					new CsvNodeIDParser(fileStream))));

		assertEquals(Identifiers.TripAlarmType_ShelvingState_CurrentState_EffectiveDisplayName, nodeIds.getNodeIdByName("EffectiveDisplayName"));
		
	}
}

package bpi.most.test.opcua.junit;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import org.junit.Test;
import org.opcfoundation.ua.builtintypes.NodeId;
import org.opcfoundation.ua.builtintypes.UnsignedInteger;

import bpi.most.opcua.server.core.adressspace.INodeIDs;
import bpi.most.opcua.server.core.parse.CsvNodeIDParser;
import bpi.most.opcua.server.core.util.FileUtils;

public class TestCsvNodeIDParser {

	static final String CSV_FILE_PATH = "/addressspace/StandardTypes.csv";
	static final int NODE_COUNT = 5343; //nodes in the csv file
	
	@Test
	public void testParseFile() {
		INodeIDs nodeIds = new CsvNodeIDParser(FileUtils.getFileFromResource2(CSV_FILE_PATH));
		
		NodeId rootFolder = nodeIds.getNodeIdByName("RootFolder");
		assertNotNull(rootFolder);
		assertEquals(84, ((UnsignedInteger)rootFolder.getValue()).intValue());
		
		assertEquals(NODE_COUNT, nodeIds.getNodeIdsByNodeName().size());
	}

}

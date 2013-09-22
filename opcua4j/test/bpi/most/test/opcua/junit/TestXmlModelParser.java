package bpi.most.test.opcua.junit;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;

import java.util.List;

import org.apache.log4j.ConsoleAppender;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.apache.log4j.PatternLayout;
import org.junit.BeforeClass;
import org.junit.Test;
import org.opcfoundation.ua.core.AddReferencesItem;
import org.opcfoundation.ua.core.Identifiers;

import bpi.most.opcua.server.core.adressspace.INodeIDs;
import bpi.most.opcua.server.core.parse.CsvNodeIDParser;
import bpi.most.opcua.server.core.parse.ParsedElement;
import bpi.most.opcua.server.core.parse.XmlModelParser;
import bpi.most.opcua.server.core.util.FileUtils;

public class TestXmlModelParser{

	private static final Logger LOG = Logger.getLogger(TestXmlModelParser.class);
	
	private static final String CSV_FILE_PATH = "/addressspace/StandardTypes.csv";
	private static final String XML_FILE_PATH = "/addressspace/UADefinedTypes.xml";
	
	@BeforeClass
	public static void setUp(){
		Logger root = Logger.getRootLogger();
		root.addAppender(new ConsoleAppender(new PatternLayout(
				PatternLayout.TTCC_CONVERSION_PATTERN)));
		root.setLevel(Level.DEBUG);
	}
	
	@Test
	public void testFillAddressSpace() {
		
		INodeIDs nodeIds = new CsvNodeIDParser(FileUtils.getFileFromResource2(CSV_FILE_PATH));
		
		XmlModelParser modelParser = new XmlModelParser(FileUtils.getFileFromResource2(XML_FILE_PATH), nodeIds);
		
		List<ParsedElement> elements = modelParser.parseNodes();
		
		assertNotNull(elements);
		assertFalse(elements.isEmpty());
		
		LOG.debug("--> parsed elements");
		int i = 0;
		for (ParsedElement pe: elements){
//			for (Node n: pe.getNodes()){
//				LOG.debug("node: " + n.getBrowseName().getName());
				
				
//				if (n.getReferences() != null){
//					for (ReferenceNode r: n.getReferences()){
//						LOG.debug(String.format("\ttarget: %s, type: %s, isinverse: %s", r.getTargetId(), r.getTypeId(), r.getIsInverse()));
//					}
//				}else{
//					LOG.debug("does not have references");
//				}
//			}
			
			for (AddReferencesItem ri: pe.getRefItems()){
//				LOG.debug(String.format("source: %s, target: %s, type: %s, isforward: %s", ri.getSourceNodeId(), ri.getTargetNodeId(), ri.getReferenceTypeId(), ri.getIsForward()));
				if (Identifiers.ObjectsFolder.equals(ri.getSourceNodeId())){
					LOG.debug("objectsfolder to " + ri.getTargetNodeId() + " found at index: " + i);
				}
			}
			i++;
		}
	}

}

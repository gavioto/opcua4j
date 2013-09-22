package bpi.most.opcua.server.core.parse;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;

import org.apache.log4j.Logger;
import org.opcfoundation.ua.builtintypes.NodeId;

import bpi.most.opcua.server.core.adressspace.INodeIDs;

/**
 * parses standard ua-csv files which contains nodeids
 * and classes
 * 
 * @author harald
 *
 */
public class CsvNodeIDParser implements INodeIDs {

	private static final Logger LOG = Logger.getLogger(CsvNodeIDParser.class);
	
	/**
	 * cell-delimiter in csv
	 */
	private String delimiter = ",";
	
	/**
	 * file stream to the csv file
	 */
	private InputStream fileStream;
	
	/**
	 * The namespaceindex in the namespace-array of the server 
	 * the parsed nodeIds belong to
	 */
	private int namespaceIndex = 0;
	
	/**
	 * parsed nodeIds ordered by there name
	 */
	private Map<String, NodeId> nodeIdsByName = null;
	
	/**
	 * @param file
	 */
	public CsvNodeIDParser(InputStream fileStream) {
		super();
		this.fileStream = fileStream;
	}
	
	/**
	 * @param delimiter
	 * @param file
	 */
	public CsvNodeIDParser(String delimiter, InputStream fileStream) {
		this.delimiter = delimiter;
		this.fileStream = fileStream;
	}

	/**
	 * @param file
	 * @param namespaceIndex
	 */
	public CsvNodeIDParser(InputStream fileStream, int namespaceIndex) {
		super();
		this.fileStream = fileStream;
		this.namespaceIndex = namespaceIndex;
	}

	/**
	 * @param delimiter
	 * @param file
	 * @param namespaceIndex
	 */
	public CsvNodeIDParser(String delimiter, InputStream fileStream, int namespaceIndex) {
		this.delimiter = delimiter;
		this.fileStream = fileStream;
		this.namespaceIndex = namespaceIndex;
	}

	@Override
	public Map<String, NodeId> getNodeIdsByNodeName() {
		if (nodeIdsByName == null){
			parseFile();
		}
		
		return nodeIdsByName;
	}
	
	@Override
	public NodeId getNodeIdByName(String name) {
		if (nodeIdsByName == null){
			parseFile();
		}
		
		NodeId id = nodeIdsByName.get(name);
		
//		if (id == null){
//			LOG.debug("no nodeid found for " + name);
//		}
		
		return id;
	}

	/**
	 * parses a csv file of the structure
	 * <pre>
	 * NodeName,NodeId,Nodeclass
	 * 
	 * e.g:
	 * ...
	 * RootFolder,84,Object
	 * ObjectsFolder,85,Object
	 * TypesFolder,86,Object
	 * ViewsFolder,87,Object
	 * ...
	 * </pre>
	 */
	private void parseFile() {
		nodeIdsByName = new HashMap<String, NodeId>();
		
		if (fileStream != null){
			try {
				BufferedReader reader = new BufferedReader(new InputStreamReader(fileStream));
				String line;
				while ((line = reader.readLine()) != null){
					String[] cells = line.split(delimiter);
					String nodeName = cells[0];
					String nodeId = cells[1];
					nodeIdsByName.put(nodeName, buildNodeId(nodeId));
				}
			} catch (Exception e) {
				LOG.error(e.getMessage(), e);
			}
		}else{
			LOG.debug("no filestream given. hence no NodeIds parsed");
		}
	}
	
	/**
	 * builds a {@link NodeId} with the given sId and the
	 * set {@link CsvNodeIDParser#namespaceIndex}. it tries
	 * to parse the given sId to integer, if it fails, the
	 * string value is used as ID.
	 * @param sId
	 * @return
	 */
	private NodeId buildNodeId(String sId){
		NodeId nodeId = null;
		try{
			nodeId = new NodeId(namespaceIndex, Integer.parseInt(sId));
		}catch (NumberFormatException e){
			//the nodeid was no integer, use the raw string value
			nodeId = new NodeId(namespaceIndex, sId);
		}
		return nodeId;
	}
}

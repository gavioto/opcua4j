package bpi.most.opcua.server.core.parse;

import java.io.File;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.apache.log4j.Logger;
import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.Namespace;
import org.jdom2.filter.Filters;
import org.jdom2.input.SAXBuilder;
import org.jdom2.xpath.XPathExpression;
import org.jdom2.xpath.XPathFactory;
import org.opcfoundation.ua.builtintypes.NodeId;

import bpi.most.opcua.server.core.adressspace.AddressSpace;
import bpi.most.opcua.server.core.adressspace.INodeIDs;

/**
 * is able to parse xml files which are valid against
 * http://opcfoundation.org/UA/ModelDesign.xsd
 * 
 * for example the UA Defined Types.xml defines all standard types which are
 * parsed and added to the {@link AddressSpace}.
 * 
 * @author harald
 * 
 */
public class XmlModelParser {

	private static final Logger LOG = Logger.getLogger(XmlModelParser.class);

	public static final Namespace NS = Namespace
			.getNamespace("http://opcfoundation.org/UA/ModelDesign.xsd");

	private Locale locale = Locale.ENGLISH;

	/**
	 * file handle to the xml file
	 */
	private File file;

	/**
	 * stream to the xml file
	 */
	private InputStream inStream;
	
	/**
	 * {@link INodeIDs} to be able to match nodenames to {@link NodeId}s
	 */
	private INodeIDs nodeIds;

	/**
	 * @param file
	 * @param nodeIds
	 */
	public XmlModelParser(File file, INodeIDs nodeIds) {
		this.file = file;
		this.nodeIds = nodeIds;
	}
	
	public XmlModelParser(InputStream inStream, INodeIDs nodeIds) {
		this.inStream = inStream;
		this.nodeIds = nodeIds;
	}

	/**
	 * inserts parsed nodes from the xml file into the {@link AddressSpace}
	 * 
	 * @param addrSpace
	 */
	public List<ParsedElement> parseNodes() {
		List<ParsedElement> parsedElements = new ArrayList<ParsedElement>();
		
		SAXBuilder builder = new SAXBuilder();
		Document doc;
		
		if (file != null){
			if (file.exists()) {
				try {
					doc = (Document) builder.build(file);
					//collect parsed rest of nodes
					parsedElements.addAll(parseElements(doc));
				} catch (Exception e) {
					LOG.error(e.getMessage(), e);
				}
			} else {
				LOG.info(file.getPath()
						+ " does not exist, no nodes added to addressspace");
			}
		}else if (inStream != null){
			try {
				doc = (Document) builder.build(inStream);
				//collect parsed rest of nodes
				parsedElements.addAll(parseElements(doc));
			} catch (Exception e) {
				LOG.error(e.getMessage(), e);
			}
		}else{
			LOG.warn("nothing given to parse");
		}
		
		return parsedElements;
	}
	
	private List<ParsedElement> parseElements(Document doc) {
		List<ParsedElement> parsedElements = new ArrayList<ParsedElement>();
		
		for (Element elem: doc.getRootElement().getChildren()) {
			
			ParsedElement pe = parseElement(elem);
			if (pe != null){
				parsedElements.add(pe);
			}
		}
		
		return parsedElements;
	}

	/**
	 * parses one element and all its childelements to nodes and references and
	 * wrapps all parsed objects in an {@link ParsedElement}.
	 * a factory is used to use the correct parse-implementation dependent
	 * on the xml-elements name which should be parsed
	 * 
	 * @param elem
	 * @param addrSpace
	 * @return
	 */
	private ParsedElement parseElement(Element elem) {
		String elemName = elem.getName();

		ParsedElement pe = null;
		
		IXmlElementParser elemParser = XmlElementParserFactory
				.getInstance(elemName);
		if (elemParser != null){
			pe = elemParser.parseElement(elem, nodeIds, locale);
		}
		
		return pe;
	}

	/**
	 * returns the element in the {@link Document} whose attribute
	 * "SymbolicName" equals to the given symbolicName.
	 * 
	 * @param doc
	 * @param symbolicName
	 * @return
	 */
	private Element getElementBySymbolicName(Document doc, String symbolicName) {
		XPathExpression<Element> xpath = XPathFactory.instance().compile(
				String.format("//*[@SymbolicName='%s']", symbolicName),
				Filters.element());
		Element element = xpath.evaluateFirst(doc);
		return element;
	}
}

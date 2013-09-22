package bpi.most.opcua.server.handler.referencefilter;

import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;

import org.apache.log4j.Logger;
import org.opcfoundation.ua.core.BrowseDescription;
import org.opcfoundation.ua.core.NodeClass;
import org.opcfoundation.ua.core.ReferenceDescription;

/**
 * filters {@link ReferenceDescription}s based on the target Node's type.
 * @author harald
 *
 */
public class TargetNodeTypeFilter implements IReferenceFilter {

	private static final Logger LOG = Logger.getLogger(TargetNodeTypeFilter.class);
	
	@Override
	public List<ReferenceDescription> filter(List<ReferenceDescription> refsToFilter, BrowseDescription browseDesc) {
		List<ReferenceDescription> filteredReferences = new ArrayList<ReferenceDescription>();
		
		if (browseDesc.getNodeClassMask().intValue() == 0){
			//return all nodes, no filtering
			filteredReferences = refsToFilter;
		}else{
			//consider node class
			EnumSet<NodeClass> classMask = NodeClass.getSet(browseDesc.getNodeClassMask());
			LOG.debug("returning only target nodes of type : " + classMask.toString());
			for (ReferenceDescription refDesc : refsToFilter) {
				if (classMask.contains(refDesc.getNodeClass())){
					filteredReferences.add(refDesc);
				}
			}
		}
		
		return filteredReferences;
	}

}

package bpi.most.opcua.server.handler.referencefilter;

import java.util.List;

import org.opcfoundation.ua.core.BrowseDescription;
import org.opcfoundation.ua.core.ReferenceDescription;

/**
 * 
 * common interface for different filter on {@link ReferenceDescription}s.
 *  
 * @author harald
 *
 */
public interface IReferenceFilter {

	/**
	 * filters references based on the {@link BrowseDescription}.
	 * @param refsToFilter
	 * @param browseDesc
	 * @return
	 */
	public List<ReferenceDescription> filter(List<ReferenceDescription> refsToFilter, BrowseDescription browseDesc);
	
}

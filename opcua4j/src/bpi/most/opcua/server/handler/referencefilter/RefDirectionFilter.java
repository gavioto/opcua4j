package bpi.most.opcua.server.handler.referencefilter;

import java.util.ArrayList;
import java.util.List;

import org.opcfoundation.ua.core.BrowseDescription;
import org.opcfoundation.ua.core.BrowseDirection;
import org.opcfoundation.ua.core.ReferenceDescription;

/**
 * filters {@link ReferenceDescription} based on the browse direction.
 * 
 * @author harald
 * 
 */
public class RefDirectionFilter implements IReferenceFilter {

	/**
	 * several cases:
	 * <ul>
	 * <li>browsedirection is forward: include only forward references</li>
	 * <li>browsedirection is inverse: include only inverse references</li>
	 * <li>browsedirection is both: do no filtering at all</li>
	 * </ul>
	 */
	@Override
	public List<ReferenceDescription> filter(List<ReferenceDescription> refsToFilter, BrowseDescription browseDesc) {
		List<ReferenceDescription> filteredReferences = new ArrayList<ReferenceDescription>();

		if (browseDesc.getBrowseDirection().equals(BrowseDirection.Both)) {
			// no filtering needed
			filteredReferences = refsToFilter;
		} else {
			// consider borwse direction
			for (ReferenceDescription refDesc : refsToFilter) {
				boolean isForward = BrowseDirection.Forward.equals(browseDesc.getBrowseDirection());
				if (refDesc.getIsForward() == isForward) {
					filteredReferences.add(refDesc);
				}
			}
		}

		return filteredReferences;
	}

}

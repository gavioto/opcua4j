package bpi.most.opcua.server.handler.referencefilter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.opcfoundation.ua.builtintypes.NodeId;
import org.opcfoundation.ua.core.BrowseDescription;
import org.opcfoundation.ua.core.Identifiers;
import org.opcfoundation.ua.core.ReferenceDescription;

/**
 * filters {@link ReferenceDescription}s based on the reference's type. <br/>
 * <br/>
 * this is'nt trivial because Servers can define their own references and expose
 * them in the address space. Therefore some central component would need to
 * keep track of all references and their inheritance relationship. <br/>
 * <br/>
 * for know, we just distinguish between hierarchical and non-hierarchical
 * relationships. this hardcoded solution is absolutely not perfect, but works
 * for the moment.
 * 
 * 
 * @author harald
 * 
 */
public class RefTypeFilter implements IReferenceFilter {

	private static Set<NodeId> hierarchicalRefs = new HashSet<NodeId>(Arrays.asList(Identifiers.HierarchicalReferences, Identifiers.HasChild, Identifiers.Aggregates, Identifiers.HasComponent,
			Identifiers.HasOrderedComponent, Identifiers.HasProperty, Identifiers.HasSubtype, Identifiers.HasEventSource, Identifiers.HasNotifier, Identifiers.Organizes));

	@Override
	public List<ReferenceDescription> filter(List<ReferenceDescription> refsToFilter, BrowseDescription browseDesc) {
		List<ReferenceDescription> filteredReferences = new ArrayList<ReferenceDescription>();

		NodeId refType = browseDesc.getReferenceTypeId();
		if (refType == null || NodeId.ZERO.equals(refType) || Identifiers.References.equals(refType)) {
			// return all nodes, no filtering
			filteredReferences = refsToFilter;
		} else {
			boolean inclSubtypes = browseDesc.getIncludeSubtypes() == null ? false : browseDesc.getIncludeSubtypes().booleanValue();
			for (ReferenceDescription refDesc : refsToFilter) {
				if (inclSubtypes) {
					// also include subtypes.

					// TODO change this implementation so that it is not
					// hardcoded. get information from adressspace
					// (ReferenceTypes Node: where references are published)
					// or somewhere else.
					if (Identifiers.HierarchicalReferences.equals(refType)) {
						// Return hierarchical ones
						if (hierarchicalRefs.contains(refDesc.getReferenceTypeId())) {
							filteredReferences.add(refDesc);
						}
					} else {
						// Return not hierarchical ones
						if (!hierarchicalRefs.contains(refDesc.getReferenceTypeId())) {
							filteredReferences.add(refDesc);
						}
					}
				} else {
					// only return the matching reference tpye
					if (refType.equals(refDesc.getReferenceTypeId())) {
						filteredReferences.add(refDesc);
					}
				}
			}
		}

		return filteredReferences;
	}

}

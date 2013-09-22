package bpi.most.opcua.server.annotation;

import bpi.most.opcua.server.core.adressspace.INodeManager;

/**
 * has to be implemented if {@link INodeManager}s want to support
 * monitored items and hence notify clients about value changes
 * in the addressspace
 * 
 * @author harald
 *
 */
public interface MonitorItemManagable {

}

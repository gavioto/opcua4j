package bpi.most.opcua.example.basic.nodes;

import org.opcfoundation.ua.core.NodeClass;

import bpi.most.opcua.server.annotation.UaNode;

@UaNode(nodeClass = NodeClass.Variable)
public interface ISensor {

}

# Introduction #

The folder "examples" an example server. Let's assume the following scenario: Our domain model consists of floors which contain rooms. The latter again contain sensors to measure the current temperature and humidity. All data should be published in the OPC UA adress space.

# Classes #

In the package bpi.most.opcua.example.basic is a basic OPC UA server included. It uses the annotation-strategy to map Java Beans to OPC UA Nodes.

## `SampleServer` ##

It creates an instance of an `UAServer` and configures it properly. Amongst others it sets an endpoint the server should listen on and an `AnnotationNodeManager` backed by the custom implemenation `SampleNodeManager`.

## `SampleNodeManager` ##

To use an `AnnotationNodeManager`, an implemenation of `IAnnotatedNodeSource` has to be given -- `SampleNodeManager` implements it. It represents the connection to our actual data we want to represent in the OPC UA adress space. For the sake of simplicity, it wires up some mock data instead of querying any other datasource like a database or reading live data from actual sensors.

## Beans ##

The beans representing our domain model are annotated. Have a look at AnnoWiki for more details.

### `Room` ###
Rooms are represented as UA Objects, therefore the class is annoated with `@UaNode(nodeClass = NodeClass.Object)`. Rooms are identified by their number and have a display name and a description.

Properties are values which are typical for an object, but they usually do not change. For changing values, variables are used. For example the `HumidySensor` is linked which represents a UA Variable. His current value is annotated with @Value to get correctly mapped into the address space.
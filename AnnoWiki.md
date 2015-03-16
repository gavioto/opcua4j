# Overview #

Annotations are probably the easiest way to publish data into the OPC UA address space. To use annotations 2 things have to be done:
  * Annotate the beans as desired
  * Use an instance of `AnnotationNodeManager` with an custom implementation of the IAnnotationSource interface

All snippets here are taken from classes in the package `bpi.most.opcua.example.basic`

# Annotations #

## Node Attributes ##

Classes which are should be mapped to OPC UA Nodes have to be annotated with `@UaNode`
```
@UaNode
public class Floor {
...
```
The `@UaNode` annotations has a property nodeClass whose default value is  `NodeClass.Object`. Hence omitting this property leads the bean to be an OPC UA Object Node. The only values which are supported for nodeClass are
  * `NodeClass.Object` and
  * `NodeClass.Variable`

Every node has to be uniquely identified in the address space and needs a name which is displayed to the client. Therefore the `@ID` and `@DisplayName` annotations are used:
```
...

 /**
  * level of the floor
  */
 @ID
 private int level;

 /**
  * name of the floor
  */
 @DisplayName
 private String name;

...
```

With the annotations so far, every instance of `Floor` will be represented in the address space as a own node with the display name set to the `name` field and the `level` field will be part of the created ID for the node.

## ID Generation ##

Nodes in the address space have to be uniquely identifiable, therefore some ID generation strategy has to be used. The current implementation concatenates the class name (without package information) with the value of the field which is annotated with @ID. So for example an instance of `Floor` with the field `level` set to 3 would be mapped to an OPC UA Node with an ID of `Floor:3`. But this is an implementation detail which should not bother you. Because only the class' name is used, no two classes with the same name (but different packages) are supported.

For the @ID field, every type which can be represented as `String` can be used.

Custom ID generators could be supported sometime in the future.

## Parent-Child relationships ##

Also known as one-to-many relationships are not describable by annotations at the moment, [issue 4](https://code.google.com/p/opcua4j/issues/detail?id=4) will tackle this problem. For know this kind of relationship is realized by implementing the `IAnnotationNodeSource#getChildren(Class<?> parentClazz, String parentId)` method. This method should return all children for a parent node of the given `parent Class` and `parentId`.

The implementor of this method has to distinguish classes and return the children for the correct id. For example returning all `Room`s for a given `Floor`
```
@Override
public List<?> getChildren(Class<?> parentClazz, String parentId) {
   List<?> result = null;
   if (Floor.class.equals(parentClazz)){
      result = allFloors.get(Integer.parseInt(parentId)).getRooms();
   }
   return result;
}
```

## Properties ##

Properties represent the characteristics of a Node. Properties do not change their value in contrast to Variables. To create a Property, annotate the desired field with an `@Property` annotation. Only primitive Types and Strings are supported. Let's have a look at the Room class
```
@UaNode
public class Room {
...

   /**
    * area of the room in square meter
    */
   @Property
   private Double area;
	
   /**
    * amount of windows
    */
   @Property
   private Integer windowCount;

...
```

## Variables ##
Variables are used to represent the actual data of an Object. For now only simple Variable Values are supported, no complex ones. Variables are annotated with `@UaNode(nodeClass = NodeClass.Variable)` and need to have a field annotated with `@Value` which represents the current value of the variable. So that a Variable appears in the address space it somehow has to be referenced. This is done with the `@Reference` annotation. For the following example consider that a `Room` has a `HumiditySensor`

```

@UaNode
public class Room {
...

   @Reference(refType = ReferenceType.hasComponent)
   private HumiditySensor humSens;

...
}

@UaNode(nodeClass = NodeClass.Variable)
public class HumiditySensor{

   /**
    * current value of the sensor
    */
   @Value
   private Double value;
	
   @DisplayName
   private String displName = "Relative Humidity";

   @Property
   private String unit = "value between 0 and 1";

...
}

```

Annotating a single field with @Variable as you would annotate a Property with @Property is not supported. See [issue 6](https://code.google.com/p/opcua4j/issues/detail?id=6) for this feature.

# Wiring everything up #

So that all annotated beans are really used an implementation of `IAnnotationNodeSource` has to be given to a new `AnnotationNodeManager`. The latter has to be added to the created `UAServer` Object.

It is useful to introspect annotated classes before the server is started, so that the mapping is available when clients want to read values. This is done with the `AnnotationNodeManager#addObjectToIntrospect(Object obj)` method. This also prevents the server throwing an exception if the custom `IAnnotationNodeSource` returns null on an unknown Type.

```
UAServer s = new UAServer();
...

AnnotationNodeManager annoNMgr = 
   new AnnotationNodeManager(
      new SampleNodeManager(),
      "my building",
      "contains some sample nodes of a building",
      "sampleBuilding"
   );

//add nodes to get introspected at startup -> this is a good practice
annoNMgr.addObjectToIntrospect(new Floor());
annoNMgr.addObjectToIntrospect(new Room());
s.addNodeManager(annoNMgr);

...
```

## Limitations ##
It is not possible to design other Attributs of Nodes like `WriteMask` or `UserWriteMask`
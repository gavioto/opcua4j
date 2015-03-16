# Introduction #

Mapping domain specific data to OPC UA nodes is repetitive and failure prone. For example to create the correct OPC UA nodes out of a complex Java bean you have to deal with OPC UA references to design the bean-in-bean relationships.

## Example ##
Consider we want to create an OPC UA Node for the following Java Bean:

```
public class Student{
  private String name;
  private String registrationNumber;
  private Date birthday;
  private University uni;

  ...
}
```

Therefore you would have to do a lot of things:
  * Instantiate a Object Node for the Student
  * Set all attributes like ID, displayname, ...
  * Instantiate a Variable Node for the birthday
  * Set all attributes like ID, displayname for this new Node
  * Set the value of the Variable Node to the value of the birthday field
  * Create a Reference from the Student's Object Node to the birthday's Variable Node
  * Instantiate another Object Node for the University
  * Set all attributes on that Node
  * Create a Reference from the Student's Object Node to the University's Object Node

Well, quite a lot to do :). There are a lot of tasks which can be generalized like creating `References` and setting `Attributes`. If you use the `AnnotationNodeManager` you can do all this in a declarative way:

```
@UaNode
public class Student{
  @DisplayName
  private String name;
  
  @ID
  private String registrationNumber;
  
  @Variable
  private Date birthday;

  @Reference(refType = ReferenceType.hasComponent)
  private University uni;

  ...
}
```

Consider that annotating fields with @Variable is not supported now, follow [issue 6](https://code.google.com/p/opcua4j/issues/detail?id=6) to see when it is available. Variables are supported but only as own Java Beans. Have a look at AnnoWiki#Variables for that
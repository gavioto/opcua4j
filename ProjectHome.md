# New #
  * First beta of history service (documentation will be available soon)
  * Custom authentication is supported for username and password (see [Authentication](Authentication.md))
  * Created own download for example server using all supported features.

I recently started to test opcua4j with the [OPC UA Compliance Test Tool](https://www.opcfoundation.org/Default.aspx/ua/ctt/Default.asp?MID=Compliance). This test tool helps to build OPC UA conform clients and servers. As a consequence this leads to compatibility between different products.

# Introduction #

opcua4j should help you developing a domain specific OPC UA Server without managing a lot of the OPC UA stuff. You should be able to concentrate on your own business logic. The main feature by now is to map any Java Objects into the OPC UA Address Space in a descriptive way - namely Java Annotations. opcua4j handles generating of Nodes and References in the Address Space.

At the moment their does not exist any open source implementation of an OPC UA Server in Java. There is an OPC UA Java Stack available from the [OPC Foundation](https://www.opcfoundation.org/), but this only abstracts the communication and protocol details. If you want to develop at a higher abstraction level, you have to use some (expensive) commercial SDKs nowadays.

This project is still in beta stage, but implementation is going on. Next steps will be to fix the known issues so that an OPC UA standard compliant server can be built.

opcua4j is part of a bigger project called [Monitoring System Toolkit (MOST)](http://most.bpi.tuwien.ac.at) which is developed at the [Technical University in Vienna](http://www.tuwien.ac.at/en/tuwien_home) by the [BPI](http://www.bpi.tuwien.ac.at/). MOST is a vendor and technology independent set of tools to simplify measuring, processing, and visualizing different building data streams (energy use, occupancy, comfort, etc.). Because MOST needed an interface to connect OPC UA Clients the idea was to build a generic OPC UA Server which can be used by everyone. opcua4j started as a Google Summer Of Code 2012 project and is now continued by the BPI.

# Features #
## Implemented ##
  * Annotation based nodes
  * Browsing through address space
  * Reading nodes

## Upcoming ##
There are some other features planed in the future. Namely
  * Generics in session management to store a custom object in the clients session
  * History Access
  * Registering to Monitored Items
  * Enhancing the possibilities to annotate nodes
  * Enhancing custom node management to gain full control about behavior of the address space

# Dependencies #
opcua4j depends on several libraries which are all included in the download called "... Redistributables ..." since version 0.9.4.

# Questions? #
If you have any questions or want to give me some feedback just drop me a line. My email address should be visible in the left box.
package bpi.most.test.opcua.junit.data;

import bpi.most.opcua.server.annotation.DisplayName;
import bpi.most.opcua.server.annotation.ID;

public class SomeObject {

	@ID
	private String ID = "some id";
	
	@DisplayName
	private String name = "some name";
	
}

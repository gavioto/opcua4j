package bpi.most.test.opcua.junit.data;

import org.opcfoundation.ua.core.NodeClass;

import bpi.most.opcua.server.annotation.Description;
import bpi.most.opcua.server.annotation.DisplayName;
import bpi.most.opcua.server.annotation.ID;
import bpi.most.opcua.server.annotation.Property;
import bpi.most.opcua.server.annotation.UaNode;

@UaNode(nodeClass=NodeClass.Object)
public class TestNode {

	@ID
	private String ID;
	
	@DisplayName
	private String name;
	
	@Description
	private String description;
	
	@Property
	private String country;
	
	@Property
	private String state;

	/**
	 * @param iD
	 * @param name
	 * @param description
	 * @param country
	 * @param state
	 */
	public TestNode(String iD, String name, String description, String country,
			String state) {
		super();
		ID = iD;
		this.name = name;
		this.description = description;
		this.country = country;
		this.state = state;
	}

	/**
	 * @return the iD
	 */
	public String getID() {
		return ID;
	}

	/**
	 * @param iD the iD to set
	 */
	public void setID(String iD) {
		ID = iD;
	}

	/**
	 * @return the name
	 */
	public String getName() {
		return name;
	}

	/**
	 * @param name the name to set
	 */
	public void setName(String name) {
		this.name = name;
	}

	/**
	 * @return the description
	 */
	public String getDescription() {
		return description;
	}

	/**
	 * @param description the description to set
	 */
	public void setDescription(String description) {
		this.description = description;
	}

	/**
	 * @return the country
	 */
	public String getCountry() {
		return country;
	}

	/**
	 * @param country the country to set
	 */
	public void setCountry(String country) {
		this.country = country;
	}

	/**
	 * @return the state
	 */
	public String getState() {
		return state;
	}

	/**
	 * @param state the state to set
	 */
	public void setState(String state) {
		this.state = state;
	}
}

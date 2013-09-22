package bpi.most.opcua.example.basic.nodes;

import bpi.most.opcua.server.ReferenceType;
import bpi.most.opcua.server.annotation.AnnotationNodeManager;
import bpi.most.opcua.server.annotation.Description;
import bpi.most.opcua.server.annotation.DisplayName;
import bpi.most.opcua.server.annotation.ID;
import bpi.most.opcua.server.annotation.Property;
import bpi.most.opcua.server.annotation.Reference;
import bpi.most.opcua.server.annotation.UaNode;

@UaNode
public class Room {

	@ID
	private int number;
	
	@DisplayName
	private String name;
	
	@Description
	private String description;
	
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
	
	@Reference(refType = ReferenceType.hasComponent)
	private HumiditySensor humSens;
	
	@Reference(refType = ReferenceType.hasComponent)
	private TemperatureSensor tempSens;
	
	/**
	 * empty constructor is mandatory when using {@link AnnotationNodeManager}
	 */
	public Room() {
	}

	/**
	 * @param number
	 * @param name
	 * @param description
	 * @param area
	 * @param windowCount
	 * @param humSens
	 * @param tempSens
	 */
	public Room(int number, String name, String description, double area,
			int windowCount, HumiditySensor humSens, TemperatureSensor tempSens) {
		this.number = number;
		this.name = name;
		this.description = description;
		this.area = area;
		this.windowCount = windowCount;
		this.humSens = humSens;
		this.tempSens = tempSens;
	}

	/**
	 * @return the humSens
	 */
	public HumiditySensor getHumSens() {
		return humSens;
	}

	/**
	 * @param humSens the humSens to set
	 */
	public void setHumSens(HumiditySensor humSens) {
		this.humSens = humSens;
	}

	/**
	 * @return the tempSens
	 */
	public TemperatureSensor getTempSens() {
		return tempSens;
	}

	/**
	 * @param tempSens the tempSens to set
	 */
	public void setTempSens(TemperatureSensor tempSens) {
		this.tempSens = tempSens;
	}

	/**
	 * @return the number
	 */
	public int getNumber() {
		return number;
	}

	/**
	 * @param number the number to set
	 */
	public void setNumber(int number) {
		this.number = number;
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
	 * @return the area
	 */
	public double getArea() {
		return area;
	}

	/**
	 * @param area the area to set
	 */
	public void setArea(double area) {
		this.area = area;
	}

	/**
	 * @return the windowCount
	 */
	public int getWindowCount() {
		return windowCount;
	}

	/**
	 * @param windowCount the windowCount to set
	 */
	public void setWindowCount(int windowCount) {
		this.windowCount = windowCount;
	}
}

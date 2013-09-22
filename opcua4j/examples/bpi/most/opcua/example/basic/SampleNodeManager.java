package bpi.most.opcua.example.basic;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import bpi.most.opcua.example.basic.nodes.Floor;
import bpi.most.opcua.example.basic.nodes.HumiditySensor;
import bpi.most.opcua.example.basic.nodes.Room;
import bpi.most.opcua.example.basic.nodes.TemperatureSensor;
import bpi.most.opcua.server.annotation.IAnnotatedNodeSource;

/**
 * this node manager creates some mock data objects.
 * 
 * lets assume the following scenario: we want to represent
 * sensors in a building. a building has several floors,
 * a floor has several rooms and a room has several sensors
 * like temperature, humidity, ...
 * 
 * @author harald
 *
 */
public class SampleNodeManager implements IAnnotatedNodeSource{

	/**
	 * two maps to access floors and rooms by their ID
	 */
	private Map<Integer, Floor> allFloors;
	private Map<Integer, Room> allRooms;
	
	
	public SampleNodeManager(){
		allFloors = new HashMap<Integer, Floor>();
		allRooms = new HashMap<Integer, Room>();
		
		Floor f0 = new Floor(0, "ground floor", "just the ground floor", false);
		Floor f1 = new Floor(1, "first floor", "the first and last floor", true);
		
		//rooms for ground floor
		Room r01 = new Room(1, "room 01", "big room", 45.34, 3, new HumiditySensor(0.321), new TemperatureSensor(21.2));
		Room r02 = new Room(2, "room 02", "middle room", 32, 3, new HumiditySensor(0.318), new TemperatureSensor(21.4));
		Room r03 = new Room(3, "room 03", "middle room", 32, 3, new HumiditySensor(0.335), new TemperatureSensor(22.3));
		f0.setRooms(Arrays.asList(new Room[]{r01, r02, r03}));
		
		//rooms for floor 1
		Room r11 = new Room(11, "room 11", "middle room", 31.34, 2, new HumiditySensor(null), new TemperatureSensor(22.1));
		Room r12 = new Room(12, "room 12", "small room", 18, 2, new HumiditySensor(0.324), new TemperatureSensor(21.9));
		f1.setRooms(Arrays.asList(new Room[]{r11, r12}));
		
		//save everything in maps for random access
		allFloors.put(f0.getLevel(), f0);
		allFloors.put(f1.getLevel(), f1);
		allRooms.put(r01.getNumber(), r01);
		allRooms.put(r02.getNumber(), r02);
		allRooms.put(r03.getNumber(), r03);
		allRooms.put(r11.getNumber(), r11);
		allRooms.put(r12.getNumber(), r12);
	}
	
	/**
	 * distinguishes which class is wanted and afterwards does a simple value by key
	 * lookup in the correct map (allFloors vs allRooms)
	 */
	@Override
	public Object getObjectById(Class<?> clazz, String id) {
		Object result = null;
		
		if (Floor.class.equals(clazz)){
			result = allFloors.get(Integer.parseInt(id));
		}else if (Room.class.equals(clazz)){
			result = allRooms.get(Integer.parseInt(id));
		}
		
		return result;
	}

	/**
	 * the top level elements are floors, therefore we return all {@link Floor}s
	 */
	@Override
	public List<?> getTopLevelElements() {
		return new ArrayList<Object>(allFloors.values());
	}

	/**
	 * only floors do have children, namely rooms. hence we return for a floor -- identified
	 * by the given parentId -- all rooms in it.
	 * <br/>
	 * <br/>
	 * if we would also have buildings, then of course we would have to distinguish to 
	 * return floors for a particular buildings, or rooms for a floor.
	 */
	@Override
	public List<?> getChildren(Class<?> parentClazz, String parentId) {
		List<?> result = null;
		if (Floor.class.equals(parentClazz)){
			result = allFloors.get(Integer.parseInt(parentId)).getRooms();
		}
		return result;
	}
}

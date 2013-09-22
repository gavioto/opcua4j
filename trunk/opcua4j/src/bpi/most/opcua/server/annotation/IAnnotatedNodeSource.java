package bpi.most.opcua.server.annotation;

import java.util.List;

/**
 * 
 * Is used by an {@link AnnotationNodeManager} to get the actual domain specific
 * data. A AnnotationNodeManager does query all data he needs from the
 * implementing class of this interface. Because their are typically more than
 * one class representing domain specific data, there is always the class
 * given, for which data should be fetched.
 * 
 * @author harald
 * 
 */
public interface IAnnotatedNodeSource {

	/**
	 * Returns an instance from type className which is identified by the given
	 * id. If such an instance does not exist, null should be returned.
	 * 
	 * @param className
	 *            simple class name identifying the desired type. Because only
	 *            the simple class name is used (without package information)
	 *            two classes having the same name are not supported.
	 * @param id
	 *            identifier of the desired object.
	 * @return an object from type className identified by the given id or null
	 *         if such an object does not exist.
	 */
	public Object getObjectById(Class<?> clazz, String id);

	/**
	 * Returns all Objects which represent the first level of information.
	 * Different Object types are allowed to be returned. If no top level
	 * elements exist, null or an empty list should be returned.
	 * 
	 * @return All top level Objects.
	 */
	public List<?> getTopLevelElements();

	/**
	 * Returns all children of a specific object. The objects type is the
	 * parentClassName and it is identified by the given parentId. If such an
	 * object does not exist, or it does not have any children, null or an empty
	 * list should be returned.
	 * 
	 * @param parentClassName
	 *            simple class name (without package information) for the
	 *            desired parent type.
	 * @param parentId
	 *            identifier of the parent Object
	 * @return All children of the identified parent Object.
	 */
	public List<?> getChildren(Class<?> parentClazz, String parentId);

}

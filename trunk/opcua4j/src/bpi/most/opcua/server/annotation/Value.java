package bpi.most.opcua.server.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Value is only available for {@link UaNode}s of type
 * Variable or Property. its used for custom types to know which
 * field represents the value of the Varaible or Property
 * @author harald
 *
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface Value{

	
}

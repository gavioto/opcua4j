package bpi.most.opcua.server.annotation;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * a property is just a short form for creating
 * a {@link Reference} with referenceType
 * set to hasProperty 
 * @author harald
 *
 */
@Retention(RetentionPolicy.RUNTIME)  
public @interface Property{

	String displayName() default "";
	
}

package bpi.most.opcua.server.annotation;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * marks the annotated field as identifier to use it when generating an ID for
 * the node the object is represented by.
 * 
 * @author harald
 * 
 */
@Retention(RetentionPolicy.RUNTIME)
public @interface ID {

}

package bpi.most.opcua.server.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 
 * annotates a field that it supports history read. it is only used
 * in combination with {@link Property}, {@link Variable} and {@link Value}
 * 
 * @author harald
 *
 */
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.FIELD)
public @interface HistoryRead {
	
	String qualifier () default "";

}

package bpi.most.opcua.server.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import org.opcfoundation.ua.core.NodeClass;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface UaNode{
	NodeClass nodeClass() default NodeClass.Object;
}

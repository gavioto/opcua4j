package bpi.most.opcua.server.core;

/**
 * will be thrown if an internal exception is thrown
 * by the UAServer. so the transport layer knows about
 * a exception and can react by sending the correct
 * response resultcode to the client.
 * 
 * @author harald
 *
 */
public class UAServerException extends Exception{

	public UAServerException(String message) {
		super(message);
	}

	private static final long serialVersionUID = 753930035521172608L;
	
}

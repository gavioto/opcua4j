package bpi.most.opcua.server.core;

/**
 * identifies the client. only username and password
 * is supported at the moment.
 * 
 * @author harald
 *
 */
public class ClientIdentity {

	/**
	 * username the client used for authentication. if username is null, the client
	 * uses an anonymous session.
	 */
	private String username;
	
	/**
	 * password the client used for authentication
	 */
	private String password;
	
	/**
	 * @param username
	 * @param password
	 */
	public ClientIdentity(String username, String password) {
		super();
		this.username = username;
		this.password = password;
	}
	
	/**
	 * @return the username
	 */
	public String getUsername() {
		return username;
	}
	/**
	 * @param username the username to set
	 */
	public void setUsername(String username) {
		this.username = username;
	}
	/**
	 * @return the password
	 */
	public String getPassword() {
		return password;
	}
	/**
	 * @param password the password to set
	 */
	public void setPassword(String password) {
		this.password = password;
	}
}

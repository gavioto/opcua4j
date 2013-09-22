package bpi.most.opcua.server.core.auth;

import bpi.most.opcua.server.core.ClientIdentity;

/**
 * authenticates a {@link ClientIdentity}
 * 
 * @author harald
 *
 */
public interface IUserPasswordAuthenticator {

	/**
	 * returns true or false, depending if access to the given {@link ClientIdentity} is
	 * granted
	 * 
	 * @param clientIdentity
	 * @return
	 */
	public boolean authenticate(ClientIdentity clientIdentity);

}

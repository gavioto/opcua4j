package bpi.most.opcua.server.core;

import org.opcfoundation.ua.core.ApplicationDescription;
import org.opcfoundation.ua.transport.security.Cert;

/**
 * Contains all information which is specific to the active client
 * 
 * @author harald
 *
 */
public class ClientInfo {

	/**
	 * identity of the client. this may be null if the client uses an anonymous session and therefore did
	 * not pass any authentication information like usernamen and password
	 */
	private ClientIdentity clientIdentity;
	
	/**
	 * Information that describes the Client application
	 */
	private ApplicationDescription clientDescription;

	/**
	 * The application instance Certificate issued to the Client
	 */
	private Cert clientCertificate;
	
	/**
	 * @return the identity
	 */
	public ClientIdentity getClientIdentity() {
		return clientIdentity;
	}

	/**
	 * @param identity the identity to set
	 */
	public void setClientIdentity(ClientIdentity identity) {
		this.clientIdentity = identity;
	}

	/**
	 * @return the clientDescription
	 */
	public ApplicationDescription getClientDescription() {
		return clientDescription;
	}

	/**
	 * @param clientDescription
	 *            the clientDescription to set
	 */
	public void setClientDescription(ApplicationDescription clientDescription) {
		this.clientDescription = clientDescription;
	}
	
	/**
	 * @return the clientCertificate
	 */
	public Cert getClientCertificate() {
		return clientCertificate;
	}

	/**
	 * @param clientCertificate
	 *            the clientCertificate to set
	 */
	public void setClientCertificate(Cert clientCertificate) {
		this.clientCertificate = clientCertificate;
	}
}

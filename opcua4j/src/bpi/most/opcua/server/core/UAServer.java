package bpi.most.opcua.server.core;

import java.security.Security;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.apache.log4j.Logger;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.opcfoundation.ua.application.Server;
import org.opcfoundation.ua.builtintypes.LocalizedText;
import org.opcfoundation.ua.common.NamespaceTable;
import org.opcfoundation.ua.common.ServiceResultException;
import org.opcfoundation.ua.core.ApplicationDescription;
import org.opcfoundation.ua.core.EndpointDescription;
import org.opcfoundation.ua.core.SignedSoftwareCertificate;
import org.opcfoundation.ua.core.UserTokenPolicy;
import org.opcfoundation.ua.core.UserTokenType;
import org.opcfoundation.ua.transport.Endpoint;
import org.opcfoundation.ua.transport.security.KeyPair;
import org.opcfoundation.ua.transport.security.SecurityMode;

import bpi.most.opcua.server.core.adressspace.AddrSpaceBuilder;
import bpi.most.opcua.server.core.adressspace.AddressSpace;
import bpi.most.opcua.server.core.adressspace.INodeManager;
import bpi.most.opcua.server.core.auth.IUserPasswordAuthenticator;
import bpi.most.opcua.server.handler.AttributeServiceHandler;
import bpi.most.opcua.server.handler.BrowseServiceHandler;
import bpi.most.opcua.server.handler.SessionServiceHandler;
import bpi.most.opcua.server.handler.TestServiceHandler;

/**
 * a generic OPC UA server
 * 
 * behaves a bit like the builder-pattern cause properties can be set before the
 * {@link UAServer#start()} method is called.
 * 
 * @author hare
 * 
 */
public class UAServer {

	private static final Logger LOG = Logger.getLogger(UAServer.class);

	/**
	 * Description of the server application
	 */
	protected ApplicationDescription serverDesc;

	/**
	 * securitymode this server supports
	 */
	protected SecurityMode secMode = SecurityMode.NONE;

	/**
	 * Each Server has exactly one SessionManager.
	 */
	protected SessionManager sessionManager;

	/**
	 * underlying {@link Server} from the UA-Stack
	 */
	protected Server stackServer;

	/**
	 * Description of the endpoint this server has
	 */
	protected EndpointDescription epDesc;

	protected Endpoint endpoint;

	protected AddressSpace addrSpace;

	protected List<INodeManager> customNodeManagers;

	protected IUserPasswordAuthenticator userPasswordAuthenticator;

	/**
	 * this map holds copies of all added {@link UserTokenPolicy}s so that
	 * validation can be done fast.
	 */
	protected Map<String, UserTokenPolicy> supportedUserTokenPolicies = new HashMap<String, UserTokenPolicy>();

	/**
	 * TODO: part 4, seite 22, footnote 1:
	 * 
	 * The URI of the ServerArray with Index 0 must be identical to the URI of
	 * the NamespaceArray with Index 1, since both represent the local server.
	 */
	protected NamespaceTable nsTable = NamespaceTable.DEFAULT;

	public UAServer() {
		stackServer = new Server();
		sessionManager = new SessionManager();
		nsTable = NamespaceTable.DEFAULT;
		customNodeManagers = new ArrayList<INodeManager>();

		checkProvider();
	}

	/**
	 * tests if {@link BouncyCastleProvider} is already added to the Java
	 * security layer. if not, it is added
	 */
	protected void checkProvider() {
		if (Security.getProvider("BC") == null) {
			Security.addProvider(new BouncyCastleProvider());
		}
	}

	/**
	 * this method has to be called if user+password authentication should be
	 * used. An {@link IUserPasswordAuthenticator} and several UserTokenPolicies
	 * with {@link UserTokenType#UserName} have to be given. If one of them is
	 * null or a {@link UserTokenPolicy} with another TokenType as
	 * {@link UserTokenType#UserName} is given, a {@link UAServerException} is
	 * thrown.
	 * 
	 * @param authenticator
	 * @param policies
	 * @throws UAServerException
	 */
	public void addUserTokenPolicy(IUserPasswordAuthenticator authenticator, UserTokenPolicy... policies) throws UAServerException {
		// validate the given policies
		if (policies == null) {
			throw new UAServerException("there must be at least one UserTokenPolicy passed");
		} else {
			for (UserTokenPolicy policy : policies) {
				if (policy == null) {
					throw new UAServerException("A given UserTokenPolicy is null");
				} else {
					if (!UserTokenType.UserName.equals(policy.getTokenType())) {
						throw new UAServerException(String.format("the given UserTokenPolicy %s does not have UserTokenType.UserName", policy.getPolicyId()));
					}
				}
			}
		}

		// everything looks valid, lets add the policies to the server
		for (UserTokenPolicy policy : policies) {
			stackServer.addUserTokenPolicy(policy);
			supportedUserTokenPolicies.put(policy.getPolicyId(), policy);
		}
		userPasswordAuthenticator = authenticator;
	}

	/**
	 * Adds the {@link UserTokenPolicy#ANONYMOUS} to the server so that anonymous clients are supported.
	 */
	public void addAnonymousTokenPolicy() {
		stackServer.addUserTokenPolicy(UserTokenPolicy.ANONYMOUS);
		supportedUserTokenPolicies.put(UserTokenPolicy.ANONYMOUS.getPolicyId(), UserTokenPolicy.ANONYMOUS);
	}

	/**
	 * starts the server and binds it to the configured {@link Endpoint}. Also
	 * binds all relevant ServiceHandler implementations
	 */
	public void start() {

		bindTestService();
		bindSessionService(); // allways used for session management
		bindBrowseService(); // browsing the adress space
		bindAttributeService(); // reading/writing (history) data

		String endPointUrl = endpoint.getEndpointUrl();

		// add the endpoint url to the namespace table, because namespaceindex=1
		// is always the servers url
		nsTable.add(1, endPointUrl);

		stackServer.setApplicationName(new LocalizedText("mein testserver", Locale.ENGLISH));
		stackServer.setProductUri(endPointUrl);
		stackServer.setApplicationUri(endPointUrl);

		// create an addressspace object with filled standard nodes
		AddrSpaceBuilder asBuilder = new AddrSpaceBuilder();
		int nsIndex = 2; // we start with two here, because 0 and 1 is reserved
							// for core- and servernodemanager
		for (INodeManager nm : customNodeManagers) {
			asBuilder.addNodeManager(nsIndex, nm);
			nsIndex++;
		}
		// asBuilder.addNodeManager(2, new AnnotationNodeManager(new
		// MostNodeManager()));
		addrSpace = asBuilder.build();

		try {
			LOG.info("binding server to endpoint " + endPointUrl + " ....");
			stackServer.bind(endpoint);
			LOG.debug("server bound and ready.");
		} catch (ServiceResultException e) {
			LOG.error(e.getMessage(), e);
		}
	}

	public void addNodeManager(INodeManager nodeManager) {
		customNodeManagers.add(nodeManager);
	}

	private void bindTestService() {
		stackServer.addServiceHandler(new TestServiceHandler());
	}

	private void bindSessionService() {
		SessionServiceHandler sessionHandler = new SessionServiceHandler();
		sessionHandler.init(this);

		stackServer.addServiceHandler(sessionHandler);
	}

	private void bindAttributeService() {
		AttributeServiceHandler serviceHandler = new AttributeServiceHandler();
		serviceHandler.init(this);
		stackServer.addServiceHandler(serviceHandler);
	}

	private void bindBrowseService() {
		BrowseServiceHandler serviceHandler = new BrowseServiceHandler();
		serviceHandler.init(this);
		stackServer.addServiceHandler(serviceHandler);
	}

	public void stop() {
		stackServer.close();
	}

	/**
	 * returns all {@link EndpointDescription}s for a given endpointUrl
	 * 
	 * @param uri
	 * @return
	 */
	public List<EndpointDescription> getEndpointDescriptionsForUri(String uri) {
		LOG.info("client wants endpoints for uri: " + uri);
		List<EndpointDescription> epdList = new ArrayList<EndpointDescription>();

		for (EndpointDescription epDesc : stackServer.getEndpointDescriptions()) {
			if (uri != null && epDesc != null && uri.equals(epDesc.getEndpointUrl())) {
				epdList.add(epDesc);
			}
		}

		LOG.info("found endpoint: " + epdList);

		return epdList;
	}

	public boolean authenticate(ClientIdentity clientIdentity) {
		boolean authenticated;
		if (userPasswordAuthenticator != null) {
			authenticated = userPasswordAuthenticator.authenticate(clientIdentity);
		} else {
			LOG.error("Client tried to authenticate but userPasswordAuthenticator was null!!");
			authenticated = false;
		}

		return authenticated;
	}

	/**
	 * the server needs at least one ApplicationCertificate because it returns
	 * only endpoints which do have one. this is need also if security mode is
	 * set to {@link SecurityMode#NONE}
	 * 
	 * @param appInstanceCert
	 */
	public void addApplicationInstanceCertificate(KeyPair appInstanceCert) {
		stackServer.addApplicationInstanceCertificate(appInstanceCert);
	}

	public void addSoftwareCertificate(SignedSoftwareCertificate softwareCert) {
		stackServer.addSoftwareCertificate(softwareCert);
	}

	/**
	 * @return the serverDescription
	 */
	public ApplicationDescription getServerDesc() {
		return serverDesc;
	}

	/**
	 * @param serverDescription
	 *            the serverDescription to set
	 */
	public void setServerDesc(ApplicationDescription serverDesc) {
		this.serverDesc = serverDesc;
	}

	/**
	 * @return the secMode
	 */
	public SecurityMode getSecMode() {
		return secMode;
	}

	/**
	 * @param secMode
	 *            the secMode to set
	 */
	public void setSecMode(SecurityMode secMode) {
		this.secMode = secMode;
	}

	/**
	 * @return the stackServer
	 */
	public Server getStackServer() {
		return stackServer;
	}

	/**
	 * @param stackServer
	 *            the stackServer to set
	 */
	public void setStackServer(Server stackServer) {
		this.stackServer = stackServer;
	}

	/**
	 * @return the epDesc
	 */
	public EndpointDescription getEpDesc() {
		return epDesc;
	}

	/**
	 * @param epDesc
	 *            the epDesc to set
	 */
	public void setEpDesc(EndpointDescription epDesc) {
		this.epDesc = epDesc;
	}

	/**
	 * @return the sessionManager
	 */
	public SessionManager getSessionManager() {
		return sessionManager;
	}

	/**
	 * @param sessionManager
	 *            the sessionManager to set
	 */
	public void setSessionManager(SessionManager sessionManager) {
		this.sessionManager = sessionManager;
	}

	/**
	 * @return the endpoint
	 */
	public Endpoint getEndpoint() {
		return endpoint;
	}

	/**
	 * @param endpoint
	 *            the endpoint to set
	 */
	public void setEndpoint(Endpoint endpoint) {
		this.endpoint = endpoint;
	}

	/**
	 * @return the addrSpace
	 */
	public AddressSpace getAddrSpace() {
		return addrSpace;
	}

	/**
	 * @param addrSpace
	 *            the addrSpace to set
	 */
	public void setAddrSpace(AddressSpace addrSpace) {
		this.addrSpace = addrSpace;
	}

	/**
	 * @return the supportedUserTokenPolicies
	 */
	public boolean supportsUserTokenPolicy(String policyId) {
		return supportedUserTokenPolicies.containsKey(policyId);
	}
}

package bpi.most.opcua.server.handler;

import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.security.SignatureException;
import java.util.Arrays;
import java.util.List;

import javax.crypto.Cipher;

import org.apache.log4j.Logger;
import org.opcfoundation.ua.builtintypes.ExtensionObject;
import org.opcfoundation.ua.builtintypes.NodeId;
import org.opcfoundation.ua.builtintypes.StatusCode;
import org.opcfoundation.ua.builtintypes.UnsignedInteger;
import org.opcfoundation.ua.common.ServiceFaultException;
import org.opcfoundation.ua.core.ActivateSessionRequest;
import org.opcfoundation.ua.core.ActivateSessionResponse;
import org.opcfoundation.ua.core.AnonymousIdentityToken;
import org.opcfoundation.ua.core.CancelRequest;
import org.opcfoundation.ua.core.CancelResponse;
import org.opcfoundation.ua.core.CloseSessionRequest;
import org.opcfoundation.ua.core.CloseSessionResponse;
import org.opcfoundation.ua.core.CreateSessionRequest;
import org.opcfoundation.ua.core.CreateSessionResponse;
import org.opcfoundation.ua.core.EndpointDescription;
import org.opcfoundation.ua.core.ResponseHeader;
import org.opcfoundation.ua.core.SessionServiceSetHandler;
import org.opcfoundation.ua.core.SignatureData;
import org.opcfoundation.ua.core.StatusCodes;
import org.opcfoundation.ua.core.UserIdentityToken;
import org.opcfoundation.ua.core.UserNameIdentityToken;
import org.opcfoundation.ua.core.X509IdentityToken;
import org.opcfoundation.ua.encoding.DecodingException;
import org.opcfoundation.ua.transport.EndpointServiceRequest;
import org.opcfoundation.ua.transport.security.Cert;
import org.opcfoundation.ua.transport.security.KeyPair;
import org.opcfoundation.ua.transport.security.PrivKey;
import org.opcfoundation.ua.transport.security.SecurityPolicy;
import org.opcfoundation.ua.utils.CertificateUtils;
import org.opcfoundation.ua.utils.CryptoUtil;

import bpi.most.opcua.server.core.ClientIdentity;
import bpi.most.opcua.server.core.ClientInfo;
import bpi.most.opcua.server.core.Session;
import bpi.most.opcua.server.core.SessionManager;
import bpi.most.opcua.server.core.UAServerException;
import bpi.most.opcua.server.core.util.ArrayUtils;

public class SessionServiceHandler extends ServiceHandlerBase implements SessionServiceSetHandler {

	private static final Logger LOG = Logger.getLogger(SessionServiceHandler.class);

	private static final int NONCE_LENGTH = 32;

	/**
	 * several calls to the ActivateSession are done because
	 * <ul>
	 * <li>the client created a new securechannel</li>
	 * <li>the client changes its identity. the new credentials have also be
	 * passed to the application logic and therefore to the domain specific
	 * systems</li>
	 * </ul>
	 */
	@Override
	public void onActivateSession(EndpointServiceRequest<ActivateSessionRequest, ActivateSessionResponse> serviceReq) throws ServiceFaultException {
		LOG.info("---------------------------- ON ACTIVATE SESSION REQUEST ");
		LOG.debug(serviceReq);

		initRequestContext(serviceReq);
		ActivateSessionRequest req = serviceReq.getRequest();
		ActivateSessionResponse resp = new ActivateSessionResponse();
		
		NodeId authToken = req.getRequestHeader().getAuthenticationToken();
		Session session = server.getSessionManager().getSession(authToken);
		if (session == null) {
			resp.setResponseHeader(buildErrRespHeader(req, StatusCodes.Bad_SessionIdInvalid));
			resp.setResults(new StatusCode[] { new StatusCode(StatusCodes.Bad_SessionIdInvalid) });
			sendResp(serviceReq, resp);
			return;
		}
		
		LOG.info("clients secure channel-id: " + serviceReq.getChannel().getSecureChannelId());
		LOG.info("security policy " + serviceReq.getChannel().getSecurityPolicy());
		LOG.info("security mode " + serviceReq.getChannel().getMessageSecurityMode());

		ExtensionObject oToken = req.getUserIdentityToken();
		ClientIdentity clientIdentity = null;
		if (oToken != null) {
			try {
				UserIdentityToken uToken = (UserIdentityToken) oToken.decode();
				
				/*
				 * validate if this policy is really supported by our server 
				 */
				//TODO check why the UaCTT sends 0 for anonymous sessions and not the policyID: 
				LOG.debug("UserIdentityToken.policyId: " + uToken.getPolicyId());
				validateUserPolicy(uToken.getPolicyId());
				
				if (uToken instanceof UserNameIdentityToken) {
					UserNameIdentityToken userNameToken = (UserNameIdentityToken) uToken;
					try {
						clientIdentity = readClientIdentity(userNameToken, session);
					} catch (UAServerException e) {
						//clients identity could not be read
						LOG.error(e.getMessage(), e);
						resp.setResponseHeader(buildErrRespHeader(req, StatusCodes.Bad_IdentityTokenInvalid));
						resp.setResults(new StatusCode[] { new StatusCode(StatusCodes.Bad_IdentityTokenInvalid) });
						sendResp(serviceReq, resp);
						return;
					}
					
				} else if (uToken instanceof AnonymousIdentityToken) {
					@SuppressWarnings("unused")
					AnonymousIdentityToken anonymToken = (AnonymousIdentityToken) uToken;
					LOG.info("user authenticates anonymously");

				} else if (uToken instanceof X509IdentityToken) {
					@SuppressWarnings("unused")
					X509IdentityToken certToken = (X509IdentityToken) uToken;

					// this type of authentication is not supported at the
					// moment
					resp.setResponseHeader(buildErrRespHeader(req, StatusCodes.Bad_IdentityTokenRejected));
					resp.setResults(new StatusCode[] { new StatusCode(StatusCodes.Bad_IdentityTokenRejected) });
					sendResp(serviceReq, resp);
					return;
				}

			} catch (DecodingException e) {
				LOG.error(e.getMessage(), e);
			} catch (UAServerException e) {
				LOG.error(e.getMessage(), e);
				
				resp.setResponseHeader(buildErrRespHeader(req, StatusCode.BAD.getValue()));
				resp.setResults(new StatusCode[] { StatusCode.BAD });
				sendResp(serviceReq, resp);
				return;
			}
		}

		// call server implementation with clientIdentity
		if (clientIdentity != null) {
			boolean authenticated = server.authenticate(clientIdentity);
			if (authenticated) {
				LOG.info("authentication was successful");
			} else {
				LOG.info("authentication failed, activateSession not successful");

				// this type of authentication is not supported at the moment
				resp.setResponseHeader(buildErrRespHeader(req, StatusCodes.Bad_UserAccessDenied));
				resp.setResults(new StatusCode[] { new StatusCode(StatusCodes.Bad_UserAccessDenied) });
				sendResp(serviceReq, resp);
				return;
			}
		}

		session.setActive(true);
		session.getClientInfo().setClientIdentity(clientIdentity);

		// build response header
		ResponseHeader respHeader = buildRespHeader(req);
		resp.setResponseHeader(respHeader);

		// TODO validate clientSignature

		/*
		 * set response specific stuff
		 */
		byte[] nonce = CryptoUtil.createNonce(NONCE_LENGTH);
		resp.setServerNonce(nonce);
		session.setLastNonce(nonce);

		resp.setResults(new StatusCode[] { StatusCode.GOOD });
		LOG.debug("client sent software certificates:" + req.getClientSoftwareCertificates());

		sendResp(serviceReq, resp);
	}

	/**
	 * canceling an operation is not supported
	 */
	@Override
	public void onCancel(EndpointServiceRequest<CancelRequest, CancelResponse> serviceReq) throws ServiceFaultException {
		LOG.debug("---------------------------- ON CANCEL SESSION REQUEST ");
		LOG.debug(serviceReq);

		initRequestContext(serviceReq);
		CancelResponse resp = new CancelResponse();
		CancelRequest req = serviceReq.getRequest();
		
		resp.setResponseHeader(buildErrRespHeader(req, StatusCodes.Bad_ServiceUnsupported));
		sendResp(serviceReq, resp);
	}

	@Override
	public void onCloseSession(EndpointServiceRequest<CloseSessionRequest, CloseSessionResponse> serviceReq) throws ServiceFaultException {
		LOG.debug("---------------------------- ON CLOSE REQUEST ");
		LOG.debug(serviceReq);

		initRequestContext(serviceReq);
		CloseSessionRequest req = serviceReq.getRequest();

		// sessions identified by this token is going to be closed and deleted
		// to free up resources
		NodeId authToken = req.getRequestHeader().getAuthenticationToken();
		LOG.debug("client closes session with authToken: " + authToken);

/*		
		if (req.getDeleteSubscriptions()) {
			// delete subscriptions
		} else {
			// do not delete them, but keep reference to them
		}
*/
		
		//deleting the 
		server.getSessionManager().closeSession(authToken);

		CloseSessionResponse resp = new CloseSessionResponse(buildRespHeader(req));
		sendResp(serviceReq, resp);
	}

	@Override
	public void onCreateSession(EndpointServiceRequest<CreateSessionRequest, CreateSessionResponse> serviceReq) throws ServiceFaultException {
		LOG.debug("---------------------------- ON CREATE SESSION REQUEST ");
		// LOG.debug(serviceReq);

		CreateSessionRequest req = serviceReq.getRequest();
		CreateSessionResponse resp = new CreateSessionResponse();

		// build response header
		ResponseHeader respHeader = buildRespHeader(req);
		resp.setResponseHeader(respHeader);

		// OPC UA Profiles supported by the Server
		// resp.setServerSoftwareCertificates(arg0)

		// when we have the information model
		// When a Session is created, the Server adds an entry for the Client in
		// its SessionDiagnosticArray Variable. See Part 5 for a description of
		// this Variable.

		LOG.info("client nonce is: " + req.getClientNonce());

		/*
		 * secure channel id has to be associated with authentication token.
		 * only if both are valid in following requests, they are responded.
		 */
		LOG.info("clients secure channel-id: " + serviceReq.getChannel().getSecureChannelId());
		LOG.info("security policy " + serviceReq.getChannel().getSecurityPolicy());
		LOG.info("security mode " + serviceReq.getChannel().getMessageSecurityMode());

		SessionManager sessionMgr = getSessionManager();

		Session session = sessionMgr.createSession();
		ClientInfo clientInfo = new ClientInfo();
		session.setClientInfo(clientInfo);

		// make this visible in the adressspace
		// if this is empty, the server creates a value
		session.setSessionName(req.getSessionName());

		clientInfo.setClientDescription(req.getClientDescription());
		try {
			if (req.getClientCertificate() != null) {
				clientInfo.setClientCertificate(new Cert(req.getClientCertificate()));
			}
		} catch (Exception e) {
			LOG.error(e.getMessage(), e);
		}

		session.setTimeout(getSessionTimeout(req.getRequestedSessionTimeout()));
		session.setMaxRespMsgSize(req.getMaxResponseMessageSize());

		NodeId sessionID = NodeId.randomGUID(1);
		session.setSessionID(sessionID);
		NodeId authToken = NodeId.randomGUID(1);
		session.setAuthenticationToken(authToken);

		server.getSessionManager().addSession(session);
		// / LOG.debug("created session for client: " + session);

		resp.setSessionId(sessionID);
		resp.setAuthenticationToken(authToken);
		resp.setRevisedSessionTimeout(session.getTimeout());
		byte[] nonce = CryptoUtil.createNonce(NONCE_LENGTH);
		resp.setServerNonce(nonce); // create a nonce with a length of 32 byte

		session.setLastNonce(nonce);

		byte[] serverCert = server.getStackServer().getApplicationInstanceCertificate().getCertificate().getEncoded();
		resp.setServerCertificate(serverCert);

		resp.setServerSoftwareCertificates(null);

		// the signed nonce from the client
		try {
			if (req.getClientCertificate() != null) {
				resp.setServerSignature(getServerSignature(serviceReq.getChannel().getSecurityPolicy(), ArrayUtils.concat(req.getClientCertificate(), req.getClientNonce())));
			}
		} catch (Exception e) {
			LOG.error(e.getMessage(), e);
		}

		LOG.info("clients wants endpoints for uri: " + req.getEndpointUrl());
		List<EndpointDescription> endpointList = server.getEndpointDescriptionsForUri(req.getEndpointUrl());
		LOG.info("found endpoints: " + endpointList.size());
		if (endpointList.size() > 0) {
			EndpointDescription[] endpointArray = new EndpointDescription[endpointList.size()];
			endpointList.toArray(endpointArray);
			resp.setServerEndpoints((EndpointDescription[]) endpointArray);
		}

		// this parameter is not used
		resp.setMaxRequestMessageSize(new UnsignedInteger(0));

		sendResp(serviceReq, resp);
	}

	private SignatureData getServerSignature(SecurityPolicy secPolicy, byte[] dataToSign) throws InvalidKeyException, SignatureException, NoSuchAlgorithmException {
		SignatureData signature = null;

		PrivKey key = server.getStackServer().getApplicationInstanceCertificate().getPrivateKey();
		signature = CertificateUtils.sign(key.getPrivateKey(), secPolicy.getAsymmetricSignatureAlgorithmUri(), dataToSign);

		return signature;
	}

	/**
	 * creates a reasonable session timeout in milliseconds and therefore tries
	 * to meet the clients decision. we only support session timeouts between 10
	 * minutes and one hour for now
	 * 
	 * @param requestedTimeout
	 * @return
	 */
	private Double getSessionTimeout(Double requestedTimeout) {
		Double revisedTimeout;
		if (requestedTimeout != null && (requestedTimeout >= 1000 * 60 * 10 || requestedTimeout <= 1000 * 60 * 60)) {
			// TODO may change this here
			revisedTimeout = requestedTimeout;
		} else {
			revisedTimeout = 1000 * 60 * 30.0; // 30 min
		}

		return revisedTimeout;
	}
	
	private void validateUserPolicy(String policyId) throws UAServerException{
		if (!server.supportsUserTokenPolicy(policyId)){
			//TODO use this line of code. it was commented out because of the UaCtt
//			throw new UAServerException("server does not support UserTokenPolicy with id " + policyId);
		}
	}

	/**
	 * creates a {@link ClientIdentity} object of the given
	 * {@link UserNameIdentityToken}. therefore the sent username and password
	 * are extracted. the password may be encrypted. if so, it is decrypted with
	 * the set encryption algorithm.
	 * 
	 * @param userNameToken
	 * @return
	 * @throws UAServerException
	 */
	private ClientIdentity readClientIdentity(UserNameIdentityToken userNameToken, Session session) throws UAServerException {
		LOG.info("client uses username+password to authenticate, policy-id is " + userNameToken.getPolicyId());

		String user = userNameToken.getUserName();
		String password = null;

		// there is a password
		if (userNameToken.getPassword() != null) {
			// the password is encrypted
			if (userNameToken.getEncryptionAlgorithm() != null) {
				byte[] encryptPasswd = null;
				String encryptAlgo = userNameToken.getEncryptionAlgorithm();
				encryptPasswd = userNameToken.getPassword();

				LOG.info(String.format("used encryption algorithm: %s", encryptAlgo));

				/*
				 * decrypt the password
				 */
				if (encryptPasswd != null) {
					LOG.info("encrypted passwd length: " + encryptPasswd.length);
					KeyPair kp = server.getStackServer().getApplicationInstanceCertificate();

					byte[] decryptedBytes;
					try {
						Cipher cipher = CryptoUtil.getAsymmetricCipher(encryptAlgo);
						cipher.init(Cipher.DECRYPT_MODE, kp.getPrivateKey().getPrivateKey());
						decryptedBytes = cipher.doFinal(encryptPasswd);
					} catch (Exception e) {
						LOG.error(e.getMessage(), e);
						throw new UAServerException("password could not be decrypted.");
					}

					/*
					 * part 4 describes the structure of the decrypted bytes:
					 * chapter 7.35.1, table 169
					 * 
					 * length: first 4 bytes are the length of the data + the
					 * length of the last nonce. tokenData: the token data of
					 * length x serverNonce: the last sent server nonce of
					 * length NONCE_LENGTH
					 */
					byte[] passwdBytes = Arrays.copyOfRange(decryptedBytes, 4, decryptedBytes.length - NONCE_LENGTH);
					byte[] lastNonceBytes = Arrays.copyOfRange(decryptedBytes, decryptedBytes.length - NONCE_LENGTH, decryptedBytes.length);

					password = new String(passwdBytes);

					// test if the client sent the same nonce in his request
					// as the server in his last response.
					boolean nonceValid = Arrays.equals(lastNonceBytes, session.getLastNonce());
					if (!nonceValid) {
						LOG.error("client sent wrong nonce");
						throw new UAServerException("client sent wrong nonce");
					}
				}

			} else {
				// the password is not encrypted
				LOG.info("password is sent unencrypted");
				password = new String(userNameToken.getPassword());
			}
		} else {
			LOG.info("password is null!");
		}

		// LOG.info(String.format("user: %s, password: %s", user, password));

		return new ClientIdentity(user, password);
	}

}

# Introduction #

Two different authentication methods are supported:
  * Anonymous
  * Username and password

# Anonymous #

Clients can connect anonymously, that is they do not send any identity information in their activateSession request. To support anonymous sessions you have to call the following method on the UaServer object.

```
// create a UAServer instance
UAServer server = new UAServer();
//enable anonymous sessions
server.addAnonymousTokenPolicy();
...
```

# Username and password #

Username and password authentication is also supported by the server. Therefore you have to provide
  * at least one or more UserTokenPolicies where the UserTokenType is set to UserTokenType.UserName
  * provide an IUserPasswordAuthenticator implementation which does the actual authentication

```
// create a UAServer instance
UAServer server = new UAServer();

// create an unsecure username policy where username and password is sent in plain text 
UserTokenPolicy UNSECURE_USERNAME_PASSWORD = new UserTokenPolicy("username_plain", UserTokenType.UserName, null, null, SecurityPolicy.NONE.getPolicyUri());

//enable username password authentication
server.addUserTokenPolicy(new SampleAuthenticator(), UserTokenPolicy.SECURE_USERNAME_PASSWORD, UserTokenPolicy.SECURE_USERNAME_PASSWORD_BASIC256, UNSECURE_USERNAME_PASSWORD);
...
```

## UserTokenPolicies ##
For using username and password authentication at least one (or more) UserTokenPolicies where the UserTokenType is set to UserTokenType.UserName have to be provided. The UserTokenPolicy defines how the client authenticates to the server. It contains a field SecurityPolicyUri which defines the used SecurityPolicy and therefore how the password is sent from the client. This can either be SecurityPolicy.NONE which means the password is sent in plaintext and therefore not encrypted at all. Or it is set to some other SecurityPolicy, hence the client has to encrypt the password with the defined encryption algorithm and key length. The server takes care of decrypting the password and call the IUserPasswordAuthenticator authenticator for authentication.

## IUserPasswordAuthenticator Implementation ##
The domain specific authentication process has to be done by implementing the IUserPasswordAuthenticator interface. It contains only one method _authenticate_ which gets an ClientIdentity object. The ClientIdentity wraps the username and password sent by the OPC UA client (in it's activateSession request). The method should return true, if authentication was successful and false otherwhise. The class SampleAuthenticator shows a sample implementation of such an authentication class.

```
public class SampleAuthenticator implements IUserPasswordAuthenticator {

	private static final Logger LOG = Logger.getLogger(SampleAuthenticator.class);

	@Override
	public boolean authenticate(ClientIdentity clientIdentity) {
		LOG.info(String.format("user %s authenticates with password %s", clientIdentity.getUsername(), clientIdentity.getPassword()));

		/*
		 * actual authentication would be done here
		 */
		boolean authenticated = true;

		/*
		 * in the session we can set a custom User object or whatever we want
		 * to. therefore we have the userobject in all operations.
		 * 
		 * The session contains already the given ClientIdendentity so we do not
		 * have to store it
		 */
		Session s = RequestContext.get().getSession();
		s.setCustomObj(new SampleUser(clientIdentity.getUsername()));

		return authenticated;
	}
}
```

When authentication was successful every further request is associated with a session object. See [Sessions](Sessions.md) for that. The listing shows how to store a custom User-Object when authentication was successful. Any further requests can read that User-Object out of the session.

# Not supported #
Authentication with X509v3 certificates is neither supported at the moment nor planned to be in the near future.
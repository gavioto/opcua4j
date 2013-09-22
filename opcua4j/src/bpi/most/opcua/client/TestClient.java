package bpi.most.opcua.client;

import org.opcfoundation.ua.application.Client;
import org.opcfoundation.ua.builtintypes.UnsignedInteger;
import org.opcfoundation.ua.common.ServiceResultException;
import org.opcfoundation.ua.core.GetEndpointsRequest;
import org.opcfoundation.ua.core.GetEndpointsResponse;
import org.opcfoundation.ua.core.TestStackRequest;
import org.opcfoundation.ua.core.TestStackResponse;
import org.opcfoundation.ua.transport.SecureChannel;
import org.opcfoundation.ua.transport.security.SecurityMode;

public class TestClient {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		Client c = new Client();
		try {
			String server = "opc.tcp://localhost:6001/TestUA";
//			String server = "opc.tcp://hareNote:52520/OPCUA/SampleConsoleServer";
			
			SecureChannel channel = c.createSecureChannel(server, SecurityMode.NONE, null);
			
			TestStackRequest testReq = new TestStackRequest(null, new UnsignedInteger(1), 2, null);

			boolean opened = channel.isOpen();
			System.out.println("opened channel to server: " + opened);
			
			TestStackResponse resp = (TestStackResponse) channel.serviceRequest(testReq);
			
			System.out.println(resp);
			
			GetEndpointsRequest epReq = new GetEndpointsRequest(null, "opc.tcp://localhost:6001/testua", null, null);
			GetEndpointsResponse epResp = (GetEndpointsResponse) channel.serviceRequest(epReq);
			
			System.out.println(epResp.getEndpoints()[0]);
			
			
			channel.close();
		} catch (ServiceResultException e) {
			e.printStackTrace();
		}
	}

}

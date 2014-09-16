package bpi.most.opcua.server.core.subscription;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import org.apache.log4j.Logger;
import org.opcfoundation.ua.builtintypes.DataValue;
import org.opcfoundation.ua.builtintypes.DateTime;
import org.opcfoundation.ua.builtintypes.ExtensionObject;
import org.opcfoundation.ua.builtintypes.StatusCode;
import org.opcfoundation.ua.builtintypes.UnsignedInteger;
import org.opcfoundation.ua.builtintypes.Variant;
import org.opcfoundation.ua.core.DataChangeNotification;
import org.opcfoundation.ua.core.MonitoredItemNotification;
import org.opcfoundation.ua.core.NotificationMessage;
import org.opcfoundation.ua.core.PublishRequest;
import org.opcfoundation.ua.core.PublishResponse;
import org.opcfoundation.ua.core.SubscriptionAcknowledgement;
import org.opcfoundation.ua.encoding.EncodingException;
import org.opcfoundation.ua.transport.EndpointServiceRequest;

import bpi.most.opcua.server.handler.ServiceHandlerBase;

public class Publisher {

	private Subscription subscription;
	private PublishReqCollection publishRequests;

	private ScheduledExecutorService scheduledThreadPool = Executors.newScheduledThreadPool(1);
	private ScheduledFuture<?> schedule;
	private int sequenceNumber = 0;

	/**
	 * @param subscription
	 */
	public Publisher(Subscription subscription, PublishReqCollection publishRequests) {
		this.subscription = subscription;
		this.publishRequests = publishRequests;

		configure();
	}

	/**
	 * configures timeouts, queuesizes, ... based on the Subscription. If values
	 * of the Subscription change, this method has to be called to adapt
	 * publishinginterval and so on to the new values.
	 */
	public void configure() {
		if (subscription.isPublishingEnabled()) {
			stopPublishing();
			startPublishing();
		} else {
			stopPublishing();
		}
	}

	private void startPublishing() {
		schedule = scheduledThreadPool.scheduleWithFixedDelay(new PublishTask(), 0, (long) subscription.getPublishingInterval(), TimeUnit.MILLISECONDS);
	}

	public void stopPublishing() {
		if (schedule != null && !schedule.isCancelled()) {
			schedule.cancel(false);
		}
	}

	class PublishTask implements Runnable {

		private final Logger LOG = Logger.getLogger(PublishTask.class);

		@Override
		public void run() {
			try {
				LOG.info("preparing notification for subscription " + subscription.getId());

				EndpointServiceRequest<PublishRequest, PublishResponse> serviceReq;
				try {
					serviceReq = publishRequests.take(subscription.getSessionId());
					if (serviceReq == null) {
						// TODO what to do here? we cannot send a message
						// because there is no publish request we can use
						return;
					}
					LOG.info("got publishing request");
				} catch (InterruptedException e) {
					LOG.error(e.getMessage(), e);
					// TODO what to do here? we cannot send a message because
					// there is no publish request we can use
					return;
				}

				PublishRequest req = serviceReq.getRequest();
				PublishResponse resp = new PublishResponse();

				/*
				 * clear resources for acknowledged notifications from the last
				 * publish response and create results StausCodes
				 */
				SubscriptionAcknowledgement[] acks = req.getSubscriptionAcknowledgements();
				StatusCode[] results = null;
				if (acks != null) {
					results = new StatusCode[acks.length];
					int i = 0;
					for (SubscriptionAcknowledgement ack : acks) {
						// TODO clear acknowledged Notification

						results[i++] = StatusCode.GOOD;
					}
				}

				resp.setResults(results);

				/*
				 * create new Notifications message for this publishing-cycle
				 */
				resp.setSubscriptionId(new UnsignedInteger(subscription.getId()));
				resp.setMoreNotifications(false);
				NotificationMessage notificatioMsg = new NotificationMessage();
				notificatioMsg.setPublishTime(new DateTime());
				notificatioMsg.setSequenceNumber(new UnsignedInteger(sequenceNumber));

				// TODO build notification message
				ExtensionObject[] dataArray = new ExtensionObject[1];
				DataChangeNotification dataChangeNotification = new DataChangeNotification();

				try {
					List<MonitoredItemNotification> itemNotifications = new ArrayList<MonitoredItemNotification>();

					/*
					 * we hard code notification for every item in the session.
					 * 
					 * TODO get notification for every monitored item and add it
					 * here
					 */
					LOG.info("adding monitored items: " + subscription.getMonitoredItems().size());
					for (MonitoredItem item : subscription.getMonitoredItems().values()) {

						// TODO get new values from MonitoredItem.

						MonitoredItemNotification notification = new MonitoredItemNotification();
						notification.setClientHandle(item.getClientHandle());
						notification.setValue(new DataValue(new Variant(23.5)));
						itemNotifications.add(notification);
					}

					dataChangeNotification.setMonitoredItems(itemNotifications.toArray(new MonitoredItemNotification[itemNotifications.size()]));
					dataArray[0] = ExtensionObject.binaryEncode(dataChangeNotification);
				} catch (EncodingException e) {
					LOG.error(e.getMessage(), e);
					// TODO send ERROR CODE
				}
				notificatioMsg.setNotificationData(dataArray);

				LOG.info("publishing...");

				resp.setResponseHeader(ServiceHandlerBase.buildRespHeader(req));
				serviceReq.sendResponse(resp);

				LOG.info("published");

				// sequencenumber is not allowed to be negative; but we may be
				// negative because of an underflow
				if (++sequenceNumber < 0) {
					sequenceNumber = 0;
				}
			} catch (Exception e) {
				LOG.error(e.getMessage(), e);
			}
		}

	}
}

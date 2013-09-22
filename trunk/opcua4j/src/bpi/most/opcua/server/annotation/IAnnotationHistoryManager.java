package bpi.most.opcua.server.annotation;

import java.util.Date;
import java.util.List;

import bpi.most.opcua.server.core.history.HistoryValue;

public interface IAnnotationHistoryManager {

	/**
	 * is called for simple history nodes
	 * @param clazz
	 * @param id
	 * @param historyQualfier
	 * @param startTime
	 * @param endTime
	 * @return
	 */
	public List<HistoryValue> getHistoryValues(Class<?> clazz, String id, String historyQualfier,  Date startTime, Date endTime);

}

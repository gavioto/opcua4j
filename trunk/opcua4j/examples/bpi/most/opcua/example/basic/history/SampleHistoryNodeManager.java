package bpi.most.opcua.example.basic.history;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Random;

import bpi.most.opcua.server.annotation.IAnnotationHistoryManager;
import bpi.most.opcua.server.core.history.HistoryValue;

public class SampleHistoryNodeManager implements IAnnotationHistoryManager {

	@Override
	public List<HistoryValue> getHistoryValues(Class<?> clazz, String id, String historyQualfier, Date startTime, Date endTime) {

		List<HistoryValue> values = new ArrayList<HistoryValue>();

		System.out.println(String.format("data for %s, %s, %s", clazz.getName(), id, historyQualfier));
		
		// lets mock some data
		Double[] mockData = new Double[] {  };
		
		//mock data for different sensors
		//TODO here the variable names are hardcoded. we actually want to use the qualifiers from the @HistoryRead annotations
		if ("humSens".equals(historyQualfier)){
			mockData = new Double[] { 19.2, 19.7, 19.4, 19.6, 19.5, 19.4, 19.6};
		}else if ("tempSens".equals(historyQualfier)){
			mockData = new Double[] { 1.12, 1.23, 1.55, 1.22, 1.65, 2.75, 2.03, 2.23, 2.11, 1.77, 1.23, 1.66 };
		} 
		
		Random rand = new Random(System.currentTimeMillis());
		double randFactor = 1; //rand.nextInt(10 - 1 + 1) + 1;
		long diff = startTime.getTime() - endTime.getTime();
		for (int i = 0; i < mockData.length; i++) {
			// create timestamps so that the datavalues are equally distributed
			// over the requested time range
			Date dateTime = new Date(diff / (mockData.length - 1) * i + startTime.getTime());
			values.add(new HistoryValue(randFactor * mockData[i], dateTime));
		}

		return values;
	}

}

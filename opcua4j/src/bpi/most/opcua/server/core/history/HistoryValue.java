package bpi.most.opcua.server.core.history;

import java.util.Date;

/**
 * 
 * represents one History entry of a value (from an Property or Variable).
 * may be used for read and write requests.
 * 
 * @author harald
 *
 */
public class HistoryValue {

	private Object value;
	private Date timestamp;
	
	/**
	 * @param value
	 * @param timestamp
	 */
	public HistoryValue(Object value, Date timestamp) {
		this.value = value;
		this.timestamp = timestamp;
	}

	/**
	 * @return the value
	 */
	public Object getValue() {
		return value;
	}

	/**
	 * @param value the value to set
	 */
	public void setValue(Object value) {
		this.value = value;
	}

	/**
	 * @return the timestamp
	 */
	public Date getTimestamp() {
		return timestamp;
	}

	/**
	 * @param timestamp the timestamp to set
	 */
	public void setTimestamp(Date timestamp) {
		this.timestamp = timestamp;
	}
}

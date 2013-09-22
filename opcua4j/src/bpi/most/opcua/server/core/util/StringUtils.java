package bpi.most.opcua.server.core.util;

public class StringUtils {

	public static boolean isNullOrEmtpy(String s){
		return s == null || s.trim().isEmpty();
	}
	
	/**
	 * cuts away the namespace präfix
	 * @param s
	 * @return
	 */
	public static String removeNamespacePraefix(String s){
		String cleaned = s;
		
		if (!isNullOrEmtpy(s)){
			cleaned = s.substring(s.lastIndexOf(":") + 1, s.length());
		}
		
		return cleaned;
	}
}

package bpi.most.opcua.server.core.util;

public class Stopwatch {

	private Long start;
	private Long end;
	
	public void start(){
		start = System.currentTimeMillis();
	}
	
	public void stop(){
		end = System.currentTimeMillis();
	}
	
	public Long getDuration(){
		return end - start;
	}
}

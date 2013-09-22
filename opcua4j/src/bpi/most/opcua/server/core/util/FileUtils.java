package bpi.most.opcua.server.core.util;

import java.io.File;
import java.io.InputStream;
import java.net.URL;

public class FileUtils {

	public static File getFileFromResource(String filePath){
		File f = new File("");
		URL fileUrl = FileUtils.class.getResource(filePath);
		if (fileUrl != null){
			f = new File(fileUrl.getPath());
		}
		return f;
	}
	
	public static String getFilePathFromResource(String filePath){
		return ClassLoader.getSystemResource(filePath).getFile();
	}
	
	public static InputStream getFileFromResource2(String filePath){
		return FileUtils.class.getResourceAsStream(filePath);
	}
}

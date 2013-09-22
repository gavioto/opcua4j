package bpi.most.opcua.server.core.util;

import java.lang.reflect.Array;
import java.util.Arrays;
import java.util.List;

public class ArrayUtils {

	public static byte[] concat(byte[] first, byte[] second) {
		byte[] result = new byte[first.length + second.length];
		System.arraycopy(first, 0, result, 0, first.length);
		System.arraycopy(second, 0, result, first.length, second.length);
		return result;
	}

	public static <T> T[] concat(T[] first, T[] second) {
		T[] result = Arrays.copyOf(first, first.length + second.length);
		System.arraycopy(second, 0, result, first.length, second.length);
		return result;
	}

	public static <T> T[] concatAll(T[] first, T[]... rest) {
		int totalLength = first.length;
		for (T[] array : rest) {
			totalLength += array.length;
		}
		T[] result = Arrays.copyOf(first, totalLength);
		int offset = first.length;
		for (T[] array : rest) {
			System.arraycopy(array, 0, result, offset, array.length);
			offset += array.length;
		}
		return result;
	}

	@SuppressWarnings({ "unchecked" })
	public static <T> T[] toArray(List<T> list, Class<T> clazz) {
		if (list != null) {
			T[] array = (T[]) Array.newInstance(clazz, list.size());
			list.toArray(array);
			return array;
		} else {
			return null;
		}
	}
}

package com.apiiro.avigtest.sast;

import java.io.ByteArrayInputStream;
import java.io.ObjectInputStream;

/**
 * SAST risk: Insecure deserialization - untrusted data deserialized with ObjectInputStream.
 */
public class InsecureDeserializationExample {

    public Object deserialize(byte[] data) throws Exception {
        // SAST: Insecure deserialization - untrusted bytes deserialized without validation
        ByteArrayInputStream bis = new ByteArrayInputStream(data);
        ObjectInputStream ois = new ObjectInputStream(bis);
        return ois.readObject();
    }
}

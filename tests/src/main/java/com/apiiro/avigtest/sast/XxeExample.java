package com.apiiro.avigtest.sast;

import org.w3c.dom.Document;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.InputStream;

/**
 * SAST risk: XXE (XML External Entity) - DocumentBuilderFactory not configured to disable external entities.
 */
public class XxeExample {

    public Document parseXml(InputStream xmlInput) throws Exception {
        // SAST: XXE - external entities not disabled
        DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = factory.newDocumentBuilder();
        return builder.parse(xmlInput);
    }
}

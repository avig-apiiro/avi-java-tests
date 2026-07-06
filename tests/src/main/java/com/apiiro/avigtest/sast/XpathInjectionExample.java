package com.apiiro.avigtest.sast;

import org.w3c.dom.Document;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathFactory;

/**
 * Semgrep: java.lang.security.audit.xpath-injection
 * User input concatenated into XPath expression.
 */
public class XpathInjectionExample {

    // semgrep: XPath injection - username from user input concatenated into XPath expression
    public Object findUser(Document doc, String username, String password) throws Exception {
        XPath xpath = XPathFactory.newInstance().newXPath();
        String expression = "//user[username/text()='" + username + "' and password/text()='" + password + "']";
        return xpath.evaluate(expression, doc, XPathConstants.NODE);
    }
}

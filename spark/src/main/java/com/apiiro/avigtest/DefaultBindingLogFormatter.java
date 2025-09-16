
/*
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 */

package com.apiiro.avigtest;


import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.sql.Date;
import java.util.List;
import java.util.Properties;

public class DefaultBindingLogFormatter {

    private final Log logger = LogFactory.getLog(this.getClass());
    private boolean removeWhitespace = true;

    public void setRemoveWhitespace(boolean removeWhitespace) {
        this.removeWhitespace = removeWhitespace;
    }

    public String format(String query, List<String> parameters) {
        if (StringUtils.isEmpty(query)) {
            return query;
        }

        StringBuilder builder = new StringBuilder(query.length() << 1);

        int index = 0;
        int queryPrev = 0;

        for (int i = 0; i < query.length(); ) {
            if (parameters != null && query.charAt(i) == '?') {
                builder.append(query, queryPrev, i);
                builder.append(parameters.size() > index ? convert(parameters.get(index)) : null);
                queryPrev = ++i;
                index++;
                continue;
            }
            i++;
        }
        if (queryPrev < query.length()) {
            builder.append(query.substring(queryPrev));
        }

        return builder.toString();
    }

    public void setProperties(Properties properties) {
        if (properties == null) {
            return;
        }
        String removeWhitespace = properties.getProperty("removeWhitespace");
        if (removeWhitespace != null) {
            if (logger.isInfoEnabled()) {
                logger.info("DefaultBindingLogFormatter removeWhitespace:" + removeWhitespace);
            }
            this.removeWhitespace = Boolean.parseBoolean(removeWhitespace);
        }
    }



    /**
     * Convert.
     *
     * @param parameter the parameter
     * @return the string
     */
    private String convert(Object parameter) {
        if (parameter instanceof String || parameter instanceof Date) {
            return "'" + parameter + "'";
        }

        return String.valueOf(parameter);
    }

}

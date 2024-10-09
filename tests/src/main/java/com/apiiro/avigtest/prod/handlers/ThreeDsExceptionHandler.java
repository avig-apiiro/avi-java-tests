package com.apiiro.avigtest.prod.handlers;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;

public class ThreeDsExceptionHandler {

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.OK)
    @ResponseBody
    public ErrorMessageWrapper error(final Exception exception) {
        return new ErrorMessageWrapper(exception.toString());
    }
}

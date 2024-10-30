package com.airsensewireless.hypernet.api.controller;

import java.io.UnsupportedEncodingException;
import java.sql.BatchUpdateException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.validation.ConstraintViolationException;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DataRetrievalFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.oauth2.common.exceptions.InvalidGrantException;
import org.springframework.security.web.firewall.RequestRejectedException;
import org.springframework.transaction.TransactionSystemException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.WebUtils;
import org.springframework.ws.client.WebServiceIOException;

import com.airsensewireless.hypernet.api.exception.PinxtException;
import com.airsensewireless.hypernet.shared.interchange.ErrorResponse;
import com.airsensewireless.hypernet.shared.utilities.HttpUtilities;

/**
 * This will support handling errors and exceptions from the controllers.
 */
@RestControllerAdvice(annotations = RestController.class)
public class ControllerAdvice {

    private static final Log LOGGER = LogFactory.getLog(ControllerAdvice.class);

    private static final String EXCEPTION_MESSAGE_TEMPLATE = "%s Exception: %s";
    private static final String VALIDATION_ERROR_MESSAGE = "Validation Error";

    //401

    /**
     * This will handle security exception.
     *
     * @param exception The exception
     * @return The error response object. 401
     */
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler(SecurityException.class)
    public ErrorResponse handleSecurityException(
            final HttpServletRequest request, final SecurityException exception) {
        LOGGER.warn(String.format("%s Security Exception thrown",
                createPrefix(request)), exception);
        final ErrorResponse response = new ErrorResponse();
        response.setMessage(exception.getMessage());
        return response;
    }

    /**
     * This will handle security exception from the device direct login.
     *
     * @param exception The exception
     * @return The error response object. 401
     */
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler(InvalidGrantException.class)
    public ErrorResponse handleInvalidGrantException(
            final HttpServletRequest request, final InvalidGrantException exception) {
        LOGGER.warn(String.format("%s Bad Credentials from device (Invalid Grant) %s",
                createPrefix(request), exception.getMessage()));
        final ErrorResponse response = new ErrorResponse();
        response.setMessage(exception.getMessage());
        return response;
    }

    /**
     * This will handle security exception from the device direct login.
     *
     * @param exception The exception
     * @return The error response object. 401
     */
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler(BadCredentialsException.class)
    public ErrorResponse handleBadCredentialsException(
            final HttpServletRequest request, final BadCredentialsException exception) {
        LOGGER.warn(String.format("%s Bad Credentials from device (Bad Credentials) %s",
                createPrefix(request), exception.getMessage()));
        final ErrorResponse response = new ErrorResponse();
        response.setMessage(exception.getMessage());
        return response;
    }

    //400

    /**
     * This will handle ConstraintViolationException.
     *
     * @param exception The exception
     * @return The error response object. 400
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(ConstraintViolationException.class)
    public ErrorResponse handleConstraintViolationException(
            final HttpServletRequest request, final ConstraintViolationException exception) {
        final ErrorResponse response = new ErrorResponse();
        response.setMessage(exception.getMessage());
        return response;
    }

    /**
     * This will handle HttpMediaTypeNotSupportedException. This can happen, for example,
     * when a post mapping receives a request with absent or improper 'Content-Type'
     * header. All post mappings require 'Content-Type' header with value 'application/json'.
     *
     * @param exception The exception
     * @return The error response object. 400
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ErrorResponse handleHttpMediaTypeNotSupportedException(
            final HttpServletRequest request, final HttpMediaTypeNotSupportedException exception) {
        final ErrorResponse response = new ErrorResponse();
        response.setMessage(exception.getMessage());
        return response;
    }

    /**
     * This will handle HttpMessageNotReadableException. This can happen, for example,
     * when a post mapping receives an empty body or malformed payload.
     *
     * @param exception The exception
     * @return The error response object. 400
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ErrorResponse handleHttpMessageNotReadableException(
            final HttpServletRequest request, final HttpMessageNotReadableException exception) {
        final ErrorResponse response = new ErrorResponse();
        response.setMessage(exception.getMessage());
        return response;
    }

    /**
     * This will handle IllegalArgumentException.
     *
     * @param exception The exception
     * @return The error response object. 400
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(IllegalArgumentException.class)
    public ErrorResponse handleIllegalArgumentException(
            final HttpServletRequest request, final IllegalArgumentException exception) {
        LOGGER.warn(createPrefix(request), exception);
        final ErrorResponse response = new ErrorResponse();
        response.setMessage(exception.getMessage());
        return response;
    }

    /**
     * This will handle MethodArgumentTypeMismatchException.
     *
     * @param exception The exception
     * @return The error response object. 400
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ErrorResponse handleMethodArgumentTypeMismatchException(
            final MethodArgumentTypeMismatchException exception) {
        final ErrorResponse response = new ErrorResponse();
        response.setMessage(exception.getMessage());
        return response;
    }

    /**
     * This will handle MissingServletRequestParameterException.
     *
     * @param exception The exception
     * @return The error response object. 400
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ErrorResponse handleConstraintViolationException(
            final HttpServletRequest request, final MissingServletRequestParameterException exception) {
        final ErrorResponse response = new ErrorResponse();
        response.setMessage(exception.getMessage());
        return response;
    }

    /**
     * This will handle MethodArgumentNotValidException.
     *
     * @param exception The exception
     * @return The error response object. 400
     */
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ResponseBody
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ValidationError methodArgumentNotValidException(final HttpServletRequest request,
                                                           final MethodArgumentNotValidException exception) {
        final BindingResult result = exception.getBindingResult();
        LOGGER.debug(String.format("%s : [400] - Validation Error [%s]",
                createPrefix(request), result.getObjectName()));
        final ValidationError error = new ValidationError(VALIDATION_ERROR_MESSAGE);
        result.getFieldErrors().forEach(fieldError -> error.addFieldError(fieldError.getObjectName(),
                fieldError.getField(), fieldError.getDefaultMessage()));
        return error;
    }

    static class ValidationError {
        private final String message;
        private List<FieldError> fieldErrors = new ArrayList<>();

        ValidationError(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }

        public void addFieldError(String objectName, String field, String message) {
            fieldErrors.add(new FieldError(objectName, field, message));
        }

        public List<FieldError> getFieldErrors() {
            return fieldErrors;
        }
    }

    //404

    /**
     * This will handle RequestRejectedException.
     *
     * @param exception The exception
     * @return The error response object. 404
     */
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(RequestRejectedException.class)
    public ErrorResponse handleRequestRejectedException(
            final HttpServletRequest request, final RequestRejectedException exception) {
        LOGGER.warn(String.format("%s : [404] Invalid URL call",
                createPrefix(request)), exception);
        final ErrorResponse response = new ErrorResponse();
        response.setMessage(exception.getMessage());
        return response;
    }

    /**
     * This will handle DataRetrievalFailureException.
     *
     * @param exception The exception
     * @return The error response object. 404
     */
    @ResponseStatus(HttpStatus.NOT_FOUND)
    @ExceptionHandler(DataRetrievalFailureException.class)
    public ErrorResponse handleDataRetrievalException(
            final HttpServletRequest request, final DataRetrievalFailureException exception) {
        LOGGER.debug(String.format("%s : [404] %s",
                createPrefix(request), exception.getMessage()));
        final ErrorResponse response = new ErrorResponse();
        response.setMessage(exception.getMessage());
        return response;
    }

    //409 - Conflict

    /**
     * This will handle BatchUpdateException.
     *
     * @param exception The exception
     * @return The error response object. 409
     */
    @ResponseStatus(HttpStatus.CONFLICT)
    @ExceptionHandler(BatchUpdateException.class)
    public ErrorResponse handleBatchUpdateException(
            final HttpServletRequest request, final BatchUpdateException exception) {
        LOGGER.error(createPrefix(request), exception);
        final ErrorResponse response = new ErrorResponse();
        response.setMessage(String.format(EXCEPTION_MESSAGE_TEMPLATE,
                createPrefix(request), exception.getMessage()));
        return response;
    }

    /**
     * This will handle ObjectOptimisticLockingFailureException.
     *
     * @param exception The exception
     * @return The error response object. 409
     */
    @ResponseStatus(HttpStatus.CONFLICT)
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ErrorResponse handleObjectOptimisticLockingFailureException(
            final HttpServletRequest request, final ObjectOptimisticLockingFailureException exception) {
        LOGGER.error(createPrefix(request), exception);
        final ErrorResponse response = new ErrorResponse();
        response.setMessage(exception.getMessage());
        return response;
    }

    /**
     * This will handle DataIntegrityViolationException.
     *
     * @param exception The exception
     * @return The error response object. 409
     */
    @ResponseStatus(HttpStatus.CONFLICT)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ErrorResponse handleDataIntegrityViolationException(
            final HttpServletRequest request, final DataIntegrityViolationException exception) {
        LOGGER.error(createPrefix(request), exception);
        final ErrorResponse response = new ErrorResponse();
        response.setMessage(String.format(EXCEPTION_MESSAGE_TEMPLATE,
                createPrefix(request), ExceptionUtils.getRootCauseMessage(exception)));
        return response;
    }

    //500

    /**
     * This will handle IllegalStateException.
     *
     * @param exception The exception
     * @return The error response object. 500
     */
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(IllegalStateException.class)
    public ErrorResponse handleIllegalStatusException(
            final HttpServletRequest request, final IllegalStateException exception) {
        LOGGER.error(createPrefix(request), exception);
        final ErrorResponse response = new ErrorResponse();
        response.setMessage(exception.getMessage());
        return response;
    }

    /**
     * This will handle exceptions that are not mapped.  If one is encountered then it should be added
     * above and handled specifically.  If this ever gets test coverage then it should be investigated.
     *
     * @param exception The exception
     * @return The error response object 500
     */
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(Exception.class)
    public ErrorResponse handleException(final HttpServletRequest request, final Exception exception) {
        LOGGER.error(createPrefix(request), exception);
        final ErrorResponse response = new ErrorResponse();
        response.setMessage(String.format(EXCEPTION_MESSAGE_TEMPLATE,
                createPrefix(request), exception.getMessage()));
        return response;
    }

    /**
     * This will handle NullPointerException.
     *
     * @param exception The exception
     * @return The error response object. 500
     */
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(NullPointerException.class)
    public ErrorResponse handleNullPointerException(
            final HttpServletRequest request, final NullPointerException exception) {
        LOGGER.error(createPrefix(request), exception);
        final ErrorResponse response = new ErrorResponse();
        response.setMessage(String.format("Null Pointer Exception: %s",
                exception.getMessage()));
        return response;
    }

    /**
     * This will handle TransactionSystemException.
     *
     * @param exception The exception
     * @return The error response object. 500
     */
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(TransactionSystemException.class)
    public ErrorResponse handleTransactionSystemException(
            final HttpServletRequest request, final TransactionSystemException exception) {
        LOGGER.error(createPrefix(request), exception);
        final ErrorResponse response = new ErrorResponse();
        response.setMessage(String.format(EXCEPTION_MESSAGE_TEMPLATE,
                createPrefix(request), exception.getMessage()));
        return response;
    }

    /**
     * This will handle WebServiceIOException.
     *
     * @param exception The exception
     * @return The error response object. 500
     */
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(WebServiceIOException.class)
    public ErrorResponse handleWebServiceIoException(
            final HttpServletRequest request, final WebServiceIOException exception) {
        LOGGER.error(createPrefix(request), exception);
        final ErrorResponse response = new ErrorResponse();
        response.setMessage(String.format(EXCEPTION_MESSAGE_TEMPLATE,
                createPrefix(request), exception.getMessage()));
        return response;
    }

    @ExceptionHandler(value = PinxtException.class)
    protected ResponseEntity<ErrorResponse> handlePiNxtException(final PinxtException exception) {
        final ErrorResponse response = new ErrorResponse();
        response.setMessage(exception.getMessage());
        return new ResponseEntity<>(response, HttpStatus.valueOf(exception.getCode()));
    }

    private String createPrefix(final HttpServletRequest request) {
        final StringBuilder msg = new StringBuilder();
        msg.append(String.format("EXP - [%s][%s] uri=%s", HttpUtilities.getRemoteAddr(request),
                request.getMethod(), request.getRequestURI()));
        final String queryString = request.getQueryString();
        if (StringUtils.isNotBlank(queryString)) { msg.append('?').append(queryString); }
        final String payload = getMessagePayload(request);
        if (StringUtils.isNotBlank(payload)) { msg.append(";payload=").append(payload); }
        return msg.toString().trim();
    }

    private String getMessagePayload(final HttpServletRequest request) {
        final ContentCachingRequestWrapper wrapper = WebUtils.getNativeRequest(request,
                ContentCachingRequestWrapper.class);
        if (wrapper == null) { return null; }
        final byte[] buf = wrapper.getContentAsByteArray();
        if (buf.length < 1) { return null; }
        final int length = Math.min(buf.length, 10000);
        try { return new String(buf, 0, length, wrapper.getCharacterEncoding()); }
        catch (final UnsupportedEncodingException e) { return "[unknown]"; }
    }

}

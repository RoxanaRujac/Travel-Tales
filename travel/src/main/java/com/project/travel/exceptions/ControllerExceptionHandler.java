package com.project.travel.exceptions;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.Collections;
import java.util.NoSuchElementException;

@ControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class ControllerExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(value = ApiExceptionResponse.class)
    protected ResponseEntity<Object> handleApiExceptionResponse(ApiExceptionResponse ex) {
        HttpStatus status = ex.getStatus() != null ? ex.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        return responseEntityBuilder(ApiExceptionResponse.builder()
                .errors(ex.getErrors())
                .status(status)
                .message(ex.getMessage())
                .build());
    }

    @ExceptionHandler(value = NoSuchElementException.class)
    protected ResponseEntity<Object> handleNoSuchElementResponse(NoSuchElementException ex) {
        HttpStatus status = HttpStatus.NOT_FOUND;
        return responseEntityBuilder(ApiExceptionResponse.builder()
                .status(status)
                .message(ex.getMessage())
                .build());
    }

    private ResponseEntity<Object> responseEntityBuilder(ApiExceptionResponse ex) {
        return new ResponseEntity<>(ex, ex.getStatus());
    }
}
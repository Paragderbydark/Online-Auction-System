package com.onepiece.api_gateway.exception;


public class PasswordValidationException extends RuntimeException {
    
    public PasswordValidationException(String message) {
        super(message);
    }
    
    public PasswordValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}

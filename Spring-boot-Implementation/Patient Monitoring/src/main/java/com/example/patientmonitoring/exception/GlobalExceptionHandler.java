package com.example.patientmonitoring.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<String> handleNotFound(ResourceNotFoundException ex){
        return ResponseEntity.status(404).body(ex.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGeneral(Exception ex){
        return ResponseEntity.status(500).body("Internal Server Error: " + ex.getMessage());
    }
}

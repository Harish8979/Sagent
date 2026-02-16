package com.example.patientmonitoring.controller;

import com.example.patientmonitoring.model.Patient;
import com.example.patientmonitoring.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class PatientController {

    private final PatientService service;

    // GET ALL
    @GetMapping
    public ResponseEntity<List<Patient>> getAll(){
        return ResponseEntity.ok(service.getAll());
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Patient> getById(@PathVariable Integer id){
        return ResponseEntity.ok(service.getById(id));
    }

    // CREATE
    @PostMapping
    public ResponseEntity<Patient> create(@RequestBody Patient obj){
        return ResponseEntity.status(201).body(service.save(obj));
    }

    // UPDATE SAFE ⭐
    @PutMapping("/{id}")
    public ResponseEntity<Patient> update(@PathVariable Integer id,
                                          @RequestBody Patient obj){
        return ResponseEntity.ok(service.update(id, obj));
    }

    // DELETE SAFE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id){
        service.delete(id);
        return ResponseEntity.ok("Patient deleted successfully");
    }
}


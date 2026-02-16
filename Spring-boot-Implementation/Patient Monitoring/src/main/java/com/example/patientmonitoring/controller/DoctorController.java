package com.example.patientmonitoring.controller;

import com.example.patientmonitoring.model.Doctor;
import com.example.patientmonitoring.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctors")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class DoctorController {

    private final DoctorService service;

    // GET ALL
    @GetMapping
    public ResponseEntity<List<Doctor>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // CREATE
    @PostMapping
    public ResponseEntity<Doctor> create(@RequestBody Doctor obj) {
        return ResponseEntity.status(201).body(service.save(obj));
    }

    // UPDATE SAFE
    @PutMapping("/{id}")
    public ResponseEntity<Doctor> update(@PathVariable Integer id,
                                         @RequestBody Doctor obj) {
        return ResponseEntity.ok(service.update(id, obj));
    }

    // DELETE SAFE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.ok("Doctor deleted successfully");
    }
}


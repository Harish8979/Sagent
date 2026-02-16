package com.example.patientmonitoring.controller;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.example.patientmonitoring.model.HealthRecord;
import com.example.patientmonitoring.service.HealthRecordService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/healthrecords")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class HealthRecordController {

    private final HealthRecordService service;

    // GET ALL
    @GetMapping
    public ResponseEntity<List<HealthRecord>> getAll(){
        return ResponseEntity.ok(service.getAll());
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<HealthRecord> getById(@PathVariable Integer id){
        return ResponseEntity.ok(service.getById(id));
    }

    // CREATE
    @PostMapping
    public ResponseEntity<HealthRecord> create(@RequestBody HealthRecord obj){
        return ResponseEntity.status(201).body(service.save(obj));
    }

    // UPDATE SAFE
    @PutMapping("/{id}")
    public ResponseEntity<HealthRecord> update(@PathVariable Integer id,
                                               @RequestBody HealthRecord obj){
        return ResponseEntity.ok(service.update(id, obj));
    }

    // DELETE SAFE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id){
        service.delete(id);
        return ResponseEntity.ok("Health Record deleted successfully");
    }
}


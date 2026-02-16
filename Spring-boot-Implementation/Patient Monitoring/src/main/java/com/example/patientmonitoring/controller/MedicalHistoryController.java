package com.example.patientmonitoring.controller;

import com.example.patientmonitoring.model.MedicalHistory;
import com.example.patientmonitoring.service.MedicalHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/medicalhistory")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class MedicalHistoryController {

    private final MedicalHistoryService service;

    @GetMapping
    public ResponseEntity<List<MedicalHistory>> getAll(){
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalHistory> getById(@PathVariable Integer id){
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<MedicalHistory> create(@RequestBody MedicalHistory obj){
        return ResponseEntity.status(201).body(service.save(obj));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalHistory> update(@PathVariable Integer id,
                                                 @RequestBody MedicalHistory obj){
        return ResponseEntity.ok(service.update(id, obj));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id){
        service.delete(id);
        return ResponseEntity.ok("Medical History deleted successfully");
    }
}


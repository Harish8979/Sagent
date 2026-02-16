package com.example.patientmonitoring.controller;

import com.example.patientmonitoring.model.Consultation;
import com.example.patientmonitoring.service.ConsultationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/consultations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ConsultationController {

    private final ConsultationService service;

    @GetMapping
    public ResponseEntity<List<Consultation>> getAll(){
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Consultation> getById(@PathVariable Integer id){
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<Consultation> create(@RequestBody Consultation obj){
        return ResponseEntity.status(201).body(service.save(obj));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Consultation> update(@PathVariable Integer id,
                                               @RequestBody Consultation obj){
        return ResponseEntity.ok(service.update(id, obj));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id){
        service.delete(id);
        return ResponseEntity.ok("Consultation deleted successfully");
    }
}


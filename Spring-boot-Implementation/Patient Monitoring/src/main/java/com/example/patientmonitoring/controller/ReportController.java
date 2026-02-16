package com.example.patientmonitoring.controller;

import com.example.patientmonitoring.model.Report;
import com.example.patientmonitoring.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ReportController {

    private final ReportService service;

    // GET ALL
    @GetMapping
    public ResponseEntity<List<Report>> getAll(){
        return ResponseEntity.ok(service.getAll());
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Report> getById(@PathVariable Integer id){
        return ResponseEntity.ok(service.getById(id));
    }

    // CREATE
    @PostMapping
    public ResponseEntity<Report> create(@RequestBody Report obj){
        return ResponseEntity.status(201).body(service.save(obj));
    }

    // UPDATE SAFE ⭐
    @PutMapping("/{id}")
    public ResponseEntity<Report> update(@PathVariable Integer id,
                                         @RequestBody Report obj){
        return ResponseEntity.ok(service.update(id, obj));
    }

    // DELETE SAFE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id){
        service.delete(id);
        return ResponseEntity.ok("Report deleted successfully");
    }
}


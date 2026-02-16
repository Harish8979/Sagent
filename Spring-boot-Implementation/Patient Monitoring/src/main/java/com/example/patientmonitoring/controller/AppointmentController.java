package com.example.patientmonitoring.controller;

import com.example.patientmonitoring.model.Appointment;
import com.example.patientmonitoring.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {

    private final AppointmentService service;

    @GetMapping
    public ResponseEntity<List<Appointment>> getAll(){
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getById(@PathVariable Integer id){
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<Appointment> create(@RequestBody Appointment obj){
        return ResponseEntity.status(201).body(service.save(obj));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Appointment> update(@PathVariable Integer id,
                                              @RequestBody Appointment obj){
        return ResponseEntity.ok(service.update(id, obj));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id){
        service.delete(id);
        return ResponseEntity.ok("Appointment deleted successfully");
    }
}


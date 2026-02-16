package com.example.patientmonitoring.controller;

import com.example.patientmonitoring.model.Notification;
import com.example.patientmonitoring.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class NotificationController {

    private final NotificationService service;

    // GET ALL
    @GetMapping
    public ResponseEntity<List<Notification>> getAll(){
        return ResponseEntity.ok(service.getAll());
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Notification> getById(@PathVariable Integer id){
        return ResponseEntity.ok(service.getById(id));
    }

    // CREATE
    @PostMapping
    public ResponseEntity<Notification> create(@RequestBody Notification obj){
        return ResponseEntity.status(201).body(service.save(obj));
    }

    // UPDATE SAFE ⭐
    @PutMapping("/{id}")
    public ResponseEntity<Notification> update(@PathVariable Integer id,
                                               @RequestBody Notification obj){
        return ResponseEntity.ok(service.update(id, obj));
    }

    // DELETE SAFE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id){
        service.delete(id);
        return ResponseEntity.ok("Notification deleted successfully");
    }
}


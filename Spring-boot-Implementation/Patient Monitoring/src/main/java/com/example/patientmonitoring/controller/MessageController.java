package com.example.patientmonitoring.controller;

import com.example.patientmonitoring.model.Message;
import com.example.patientmonitoring.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class MessageController {

    private final MessageService service;

    // GET ALL
    @GetMapping
    public ResponseEntity<List<Message>> getAll(){
        return ResponseEntity.ok(service.getAll());
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Message> getById(@PathVariable Integer id){
        return ResponseEntity.ok(service.getById(id));
    }

    // CREATE
    @PostMapping
    public ResponseEntity<Message> create(@RequestBody Message obj){
        return ResponseEntity.status(201).body(service.save(obj));
    }

    // UPDATE SAFE
    @PutMapping("/{id}")
    public ResponseEntity<Message> update(@PathVariable Integer id,
                                          @RequestBody Message obj){
        return ResponseEntity.ok(service.update(id, obj));
    }

    // DELETE SAFE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id){
        service.delete(id);
        return ResponseEntity.ok("Message deleted successfully");
    }
}


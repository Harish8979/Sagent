package com.example.patientmonitoring.controller;

import com.example.patientmonitoring.model.User;
import com.example.patientmonitoring.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService service;

    // GET ALL
    @GetMapping
    public ResponseEntity<List<User>> getAll(){
        return ResponseEntity.ok(service.getAll());
    }

    // GET BY ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Integer id){
        return ResponseEntity.ok(service.getById(id));
    }

    // CREATE
    @PostMapping
    public ResponseEntity<User> create(@RequestBody User obj){
        return ResponseEntity.status(201).body(service.save(obj));
    }

    // UPDATE SAFE ⭐
    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable Integer id,
                                       @RequestBody User obj){
        return ResponseEntity.ok(service.update(id, obj));
    }

    // DELETE SAFE
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Integer id){
        service.delete(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}

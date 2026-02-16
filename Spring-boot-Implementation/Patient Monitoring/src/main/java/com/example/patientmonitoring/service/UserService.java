package com.example.patientmonitoring.service;

import com.example.patientmonitoring.model.User;
import com.example.patientmonitoring.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository repo;

    // GET ALL
    public List<User> getAll(){
        return repo.findAll();
    }

    // GET BY ID
    public User getById(Integer id){
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id " + id));
    }

    // CREATE
    public User save(User obj){
        return repo.save(obj);
    }

    // UPDATE SAFE ⭐
    public User update(Integer id, User obj){

        User existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id " + id));

        existing.setEmail(obj.getEmail());
        existing.setPasswordHash(obj.getPasswordHash());
        existing.setRole(obj.getRole());
        existing.setLastLogin(obj.getLastLogin());

        // ❌ Usually DO NOT update createdAt
        // existing.setCreatedAt(obj.getCreatedAt());

        return repo.save(existing);
    }

    // DELETE SAFE
    public void delete(Integer id){

        if(!repo.existsById(id)){
            throw new RuntimeException("User not found with id " + id);
        }

        repo.deleteById(id);
    }
}



package com.example.patientmonitoring.service;

import com.example.patientmonitoring.exception.ResourceNotFoundException;
import com.example.patientmonitoring.model.Notification;
import com.example.patientmonitoring.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repo;

    // GET ALL
    public List<Notification> getAll(){
        return repo.findAll();
    }

    // GET BY ID
    public Notification getById(Integer id){
        return repo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Notification not found with id: " + id));
    }

    // CREATE
    public Notification save(Notification obj){
        return repo.save(obj);
    }

    // UPDATE SAFE ⭐
    public Notification update(Integer id, Notification obj){

        Notification existing = repo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Notification not found with id: " + id));

        existing.setUserID(obj.getUserID());
        existing.setMessage(obj.getMessage());
        existing.setType(obj.getType());
        existing.setIsRead(obj.getIsRead());
        existing.setCreatedAt(obj.getCreatedAt());

        return repo.save(existing);
    }

    // DELETE SAFE
    public void delete(Integer id){

        Notification notification = repo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Notification not found with id: " + id));

        repo.delete(notification);
    }
}

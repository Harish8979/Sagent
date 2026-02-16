package com.example.patientmonitoring.service;

import com.example.patientmonitoring.model.Message;
import com.example.patientmonitoring.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository repo;

    // GET ALL
    public List<Message> getAll(){
        return repo.findAll();
    }

    // GET BY ID
    public Message getById(Integer id){
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found with id " + id));
    }

    // CREATE
    public Message save(Message obj){
        return repo.save(obj);
    }

    // UPDATE SAFE
    public Message update(Integer id, Message obj){

        Message existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Message not found with id " + id));

        existing.setSenderID(obj.getSenderID());
        existing.setReceiverID(obj.getReceiverID());
        existing.setContent(obj.getContent());
        existing.setSentAt(obj.getSentAt());

        return repo.save(existing);
    }

    // DELETE SAFE
    public void delete(Integer id){

        if(!repo.existsById(id)){
            throw new RuntimeException("Message not found with id " + id);
        }

        repo.deleteById(id);
    }
}


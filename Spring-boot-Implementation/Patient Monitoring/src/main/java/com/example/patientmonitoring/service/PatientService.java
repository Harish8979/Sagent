package com.example.patientmonitoring.service;

import com.example.patientmonitoring.exception.ResourceNotFoundException;
import com.example.patientmonitoring.model.Patient;
import com.example.patientmonitoring.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository repo;

    // GET ALL
    public List<Patient> getAll(){
        return repo.findAll();
    }

    // GET BY ID
    public Patient getById(Integer id){
        return repo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Patient not found with id: " + id));
    }

    // CREATE
    public Patient save(Patient obj){
        return repo.save(obj);
    }

    // UPDATE SAFE ⭐
    public Patient update(Integer id, Patient obj){

        Patient existing = repo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Patient not found with id: " + id));

        existing.setName(obj.getName());
        existing.setAge(obj.getAge());
        existing.setGender(obj.getGender());
        existing.setPhone(obj.getPhone());

        return repo.save(existing);
    }

    // DELETE SAFE
    public void delete(Integer id){

        Patient patient = repo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Patient not found with id: " + id));

        repo.delete(patient);
    }
}


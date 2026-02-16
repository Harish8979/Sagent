package com.example.patientmonitoring.service;

import com.example.patientmonitoring.model.MedicalHistory;
import com.example.patientmonitoring.repository.MedicalHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MedicalHistoryService {

    private final MedicalHistoryRepository repo;

    public List<MedicalHistory> getAll(){
        return repo.findAll();
    }

    public MedicalHistory getById(Integer id){
        return repo.findById(id).orElseThrow();
    }

    public MedicalHistory save(MedicalHistory obj){
        return repo.save(obj);
    }

    public MedicalHistory update(Integer id, MedicalHistory obj){

        MedicalHistory existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Medical History not found with id " + id));

        existing.setPatientID(obj.getPatientID());
        existing.setMedicalCondition(obj.getMedicalCondition());
        existing.setDiagnosisDate(obj.getDiagnosisDate());
        existing.setDetails(obj.getDetails());

        return repo.save(existing);
    }

    public void delete(Integer id){
        repo.deleteById(id);
    }
}


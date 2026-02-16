package com.example.patientmonitoring.service;

import com.example.patientmonitoring.model.Consultation;
import com.example.patientmonitoring.repository.ConsultationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository repo;

    // GET ALL
    public List<Consultation> getAll(){
        return repo.findAll();
    }

    // GET BY ID
    public Consultation getById(Integer id){
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultation not found with id " + id));
    }

    // CREATE
    public Consultation save(Consultation obj){
        return repo.save(obj);
    }

    // UPDATE SAFE ⭐
    public Consultation update(Integer id, Consultation obj){

        Consultation existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultation not found with id " + id));

        existing.setAppointmentID(obj.getAppointmentID());
        existing.setSummary(obj.getSummary());
        existing.setAdvice(obj.getAdvice());
        existing.setPrescription(obj.getPrescription());
        existing.setFollowUpDate(obj.getFollowUpDate());

        return repo.save(existing);
    }

    // DELETE SAFE
    public void delete(Integer id){

        if(!repo.existsById(id)){
            throw new RuntimeException("Consultation not found with id " + id);
        }

        repo.deleteById(id);
    }
}



package com.example.patientmonitoring.service;

import com.example.patientmonitoring.model.Appointment;
import com.example.patientmonitoring.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository repo;

    // GET ALL
    public List<Appointment> getAll(){
        return repo.findAll();
    }

    // GET BY ID
    public Appointment getById(Integer id){
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id " + id));
    }

    // CREATE
    public Appointment save(Appointment obj){
        return repo.save(obj);
    }

    // UPDATE SAFE
    public Appointment update(Integer id, Appointment obj){

        Appointment existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with id " + id));

        existing.setPatientID(obj.getPatientID());
        existing.setDoctorID(obj.getDoctorID());
        existing.setDateTime(obj.getDateTime());
        existing.setStatus(obj.getStatus());

        return repo.save(existing);
    }

    // DELETE SAFE
    public void delete(Integer id){

        if(!repo.existsById(id)){
            throw new RuntimeException("Appointment not found with id " + id);
        }

        repo.deleteById(id);
    }
}


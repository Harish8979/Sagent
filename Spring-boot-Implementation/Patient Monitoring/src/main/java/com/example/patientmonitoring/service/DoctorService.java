package com.example.patientmonitoring.service;

import com.example.patientmonitoring.model.Doctor;
import com.example.patientmonitoring.model.User;
import com.example.patientmonitoring.repository.DoctorRepository;
import com.example.patientmonitoring.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DoctorService {

    private final DoctorRepository repo;

    public List<Doctor> getAll(){
        return repo.findAll();
    }

    public Doctor getById(Integer id){
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id " + id));
    }

    public Doctor save(Doctor obj){
        return repo.save(obj);
    }

    public Doctor update(Integer id, Doctor obj){

        Doctor existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found with id " + id));

        existing.setName(obj.getName());
        existing.setSpecialization(obj.getSpecialization());
        existing.setPhone(obj.getPhone());
        existing.setEmail(obj.getEmail());
        existing.setLicenseNumber(obj.getLicenseNumber());

        return repo.save(existing);
    }

    public void delete(Integer id){

        if(!repo.existsById(id)){
            throw new RuntimeException("Doctor not found with id " + id);
        }

        repo.deleteById(id);
    }
}



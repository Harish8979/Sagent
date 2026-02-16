package com.example.patientmonitoring.service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import com.example.patientmonitoring.model.HealthRecord;
import com.example.patientmonitoring.repository.HealthRecordRepository;
@Service
@RequiredArgsConstructor
public class HealthRecordService {

    private final HealthRecordRepository repo;

    // GET ALL
    public List<HealthRecord> getAll(){
        return repo.findAll();
    }

    // GET BY ID
    public HealthRecord getById(Integer id){
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("HealthRecord not found with id " + id));
    }

    // CREATE
    public HealthRecord save(HealthRecord obj){
        return repo.save(obj);
    }

    // UPDATE SAFE
    public HealthRecord update(Integer id, HealthRecord obj){

        HealthRecord existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("HealthRecord not found with id " + id));

        existing.setPatientID(obj.getPatientID());
        existing.setTemperature(obj.getTemperature());
        existing.setBloodPressureSystolic(obj.getBloodPressureSystolic());
        existing.setBloodPressureDiastolic(obj.getBloodPressureDiastolic());
        existing.setOxygenLevel(obj.getOxygenLevel());
        existing.setNotes(obj.getNotes());
        existing.setDate(obj.getDate());

        return repo.save(existing);
    }

    // DELETE SAFE
    public void delete(Integer id){

        if(!repo.existsById(id)){
            throw new RuntimeException("HealthRecord not found with id " + id);
        }

        repo.deleteById(id);
    }
}


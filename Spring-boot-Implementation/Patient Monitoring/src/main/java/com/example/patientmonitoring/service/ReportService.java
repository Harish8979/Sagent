package com.example.patientmonitoring.service;

import com.example.patientmonitoring.model.Report;
import com.example.patientmonitoring.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository repo;

    // GET ALL
    public List<Report> getAll(){
        return repo.findAll();
    }

    // GET BY ID
    public Report getById(Integer id){
        return repo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Report not found with id " + id));
    }

    // CREATE
    public Report save(Report obj){
        return repo.save(obj);
    }

    // UPDATE SAFE ⭐
    public Report update(Integer id, Report obj){

        Report existing = repo.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Report not found with id " + id));

        existing.setGeneratedBy(obj.getGeneratedBy());
        existing.setReportType(obj.getReportType());
        existing.setFileURL(obj.getFileURL());

        // Usually don't update createdAt
        // existing.setCreatedAt(obj.getCreatedAt());

        return repo.save(existing);
    }

    // DELETE SAFE
    public void delete(Integer id){

        if(!repo.existsById(id)){
            throw new RuntimeException("Report not found with id " + id);
        }

        repo.deleteById(id);
    }
}


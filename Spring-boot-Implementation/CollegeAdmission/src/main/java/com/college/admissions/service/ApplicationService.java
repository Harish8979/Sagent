package com.college.admissions.service;

import com.college.admissions.entity.Application;
import com.college.admissions.repository.ApplicationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicationService {

    private final ApplicationRepository applicationRepository;

    public ApplicationService(ApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    public Application save(Application application) {
        return applicationRepository.save(application);
    }

    public List<Application> getAll() {
        return applicationRepository.findAll();
    }

    public Application getById(Integer id) {
        return applicationRepository.findById(id).orElse(null);
    }

    public Application startReview(Integer id) {
        Application app = applicationRepository.findById(id).orElse(null);
        if (app == null) {
            throw new RuntimeException("Application not found");
        }
        app.setStatus(Application.Status.UNDER_REVIEW);
        return applicationRepository.save(app);
    }

    public Application approve(Integer id) {
        Application app = applicationRepository.findById(id).orElse(null);
        if (app == null) {
            throw new RuntimeException("Application not found");
        }
        app.setStatus(Application.Status.APPROVED);
        return applicationRepository.save(app);
    }

    public Application reject(Integer id) {
        Application app = applicationRepository.findById(id).orElse(null);
        if (app == null) {
            throw new RuntimeException("Application not found");
        }
        app.setStatus(Application.Status.REJECTED);
        return applicationRepository.save(app);
    }
}

package com.college.admissions.controller;

import com.college.admissions.entity.Application;
import com.college.admissions.service.ApplicationService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @GetMapping
    public List<Application> getAll() {
        return applicationService.getAll();
    }

    @GetMapping("/{id}")
    public Application getById(@PathVariable Integer id) {
        return applicationService.getById(id);
    }

    @PutMapping("/{id}/review")
    public Application review(@PathVariable Integer id) {
        return applicationService.startReview(id);
    }

    @PutMapping("/{id}/approve")
    public Application approve(@PathVariable Integer id) {
        return applicationService.approve(id);
    }

    @PutMapping("/{id}/reject")
    public Application reject(@PathVariable Integer id) {
        return applicationService.reject(id);
    }
}

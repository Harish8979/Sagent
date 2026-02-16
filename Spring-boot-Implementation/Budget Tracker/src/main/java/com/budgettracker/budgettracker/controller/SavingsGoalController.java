package com.budgettracker.budgettracker.controller;

import com.budgettracker.budgettracker.entity.SavingsGoal;
import com.budgettracker.budgettracker.service.SavingsGoalService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/goals")
public class SavingsGoalController {

    private final SavingsGoalService service;

    public SavingsGoalController(SavingsGoalService service) {
        this.service = service;
    }

    @PostMapping
    public SavingsGoal create(@RequestBody SavingsGoal goal) {
        return service.save(goal);
    }

    @GetMapping
    public List<SavingsGoal> getAll() {
        return service.getAll();
    }
}

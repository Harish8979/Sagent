package com.budgettracker.budgettracker.service;

import com.budgettracker.budgettracker.entity.SavingsGoal;
import com.budgettracker.budgettracker.repository.SavingsGoalRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SavingsGoalService {

    private final SavingsGoalRepository repository;

    public SavingsGoalService(SavingsGoalRepository repository) {
        this.repository = repository;
    }

    public SavingsGoal save(SavingsGoal goal) {
        return repository.save(goal);
    }

    public List<SavingsGoal> getAll() {
        return repository.findAll();
    }
}

package com.budgettracker.budgettracker.service;

import com.budgettracker.budgettracker.entity.Budget;
import com.budgettracker.budgettracker.repository.BudgetRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository repository;

    public BudgetService(BudgetRepository repository) {
        this.repository = repository;
    }

    public Budget save(Budget budget) {
        return repository.save(budget);
    }

    public List<Budget> getAll() {
        return repository.findAll();
    }
}

package com.budgettracker.budgettracker.service;

import com.budgettracker.budgettracker.entity.Income;
import com.budgettracker.budgettracker.repository.IncomeRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class IncomeService {

    private final IncomeRepository repository;

    public IncomeService(IncomeRepository repository) {
        this.repository = repository;
    }

    public Income save(Income income) {
        return repository.save(income);
    }

    public List<Income> getAll() {
        return repository.findAll();
    }
}

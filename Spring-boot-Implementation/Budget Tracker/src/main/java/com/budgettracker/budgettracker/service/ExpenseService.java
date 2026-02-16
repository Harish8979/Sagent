package com.budgettracker.budgettracker.service;

import com.budgettracker.budgettracker.entity.Expense;
import com.budgettracker.budgettracker.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository repository;

    public ExpenseService(ExpenseRepository repository) {
        this.repository = repository;
    }

    public Expense save(Expense expense) {
        return repository.save(expense);
    }

    public List<Expense> getAll() {
        return repository.findAll();
    }
}

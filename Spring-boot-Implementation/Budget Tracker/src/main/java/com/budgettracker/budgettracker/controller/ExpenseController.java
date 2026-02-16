package com.budgettracker.budgettracker.controller;

import com.budgettracker.budgettracker.entity.Expense;
import com.budgettracker.budgettracker.service.ExpenseService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/expenses")
public class ExpenseController {

    private final ExpenseService service;

    public ExpenseController(ExpenseService service) {
        this.service = service;
    }

    @PostMapping
    public Expense create(@RequestBody Expense expense) {
        return service.save(expense);
    }

    @GetMapping
    public List<Expense> getAll() {
        return service.getAll();
    }
}

package com.budgettracker.budgettracker.controller;

import com.budgettracker.budgettracker.entity.Budget;
import com.budgettracker.budgettracker.service.BudgetService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/budgets")
public class BudgetController {

    private final BudgetService service;

    public BudgetController(BudgetService service) {
        this.service = service;
    }

    @PostMapping
    public Budget create(@RequestBody Budget budget) {
        return service.save(budget);
    }

    @GetMapping
    public List<Budget> getAll() {
        return service.getAll();
    }
}

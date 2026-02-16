package com.budgettracker.budgettracker.controller;

import com.budgettracker.budgettracker.entity.Income;
import com.budgettracker.budgettracker.service.IncomeService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/income")
public class IncomeController {

    private final IncomeService service;

    public IncomeController(IncomeService service) {
        this.service = service;
    }

    @PostMapping
    public Income create(@RequestBody Income income) {
        return service.save(income);
    }

    @GetMapping
    public List<Income> getAll() {
        return service.getAll();
    }
}

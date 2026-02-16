package com.budgettracker.budgettracker.controller;

import com.budgettracker.budgettracker.entity.Category;
import com.budgettracker.budgettracker.service.CategoryService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/categories")
public class CategoryController {

    private final CategoryService service;

    public CategoryController(CategoryService service) {
        this.service = service;
    }

    @PostMapping
    public Category create(@RequestBody Category category) {
        return service.save(category);
    }

    @GetMapping
    public List<Category> getAll() {
        return service.getAll();
    }
}

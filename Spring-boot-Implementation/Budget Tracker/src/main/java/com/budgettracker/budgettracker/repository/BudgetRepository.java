package com.budgettracker.budgettracker.repository;

import com.budgettracker.budgettracker.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
}

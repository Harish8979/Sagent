package com.budgettracker.budgettracker.repository;

import com.budgettracker.budgettracker.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
}

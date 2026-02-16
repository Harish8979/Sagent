package com.budgettracker.budgettracker.repository;

import com.budgettracker.budgettracker.entity.Income;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncomeRepository extends JpaRepository<Income, Long> {
}

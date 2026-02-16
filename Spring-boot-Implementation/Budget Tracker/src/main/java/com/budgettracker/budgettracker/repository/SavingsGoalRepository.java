package com.budgettracker.budgettracker.repository;

import com.budgettracker.budgettracker.entity.SavingsGoal;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SavingsGoalRepository extends JpaRepository<SavingsGoal, Long> {
}

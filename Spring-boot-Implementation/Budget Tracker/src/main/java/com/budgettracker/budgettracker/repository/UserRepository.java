package com.budgettracker.budgettracker.repository;

import com.budgettracker.budgettracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}

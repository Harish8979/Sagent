package com.example.patientmonitoring.repository;

import com.example.patientmonitoring.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User,Integer> {
}

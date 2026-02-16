package com.grocery.groceryapp.repository;

import com.grocery.groceryapp.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Integer> {
}

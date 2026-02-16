package com.grocery.groceryapp.repository;

import com.grocery.groceryapp.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUserUserId(int userId);
    List<Order> findByStatus(String status);
}

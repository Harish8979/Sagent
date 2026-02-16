package com.grocery.groceryapp.repository;

import com.grocery.groceryapp.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
}

package com.grocery.groceryapp.repository;

import com.grocery.groceryapp.entity.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryRepository extends JpaRepository<Delivery, Integer> {
}

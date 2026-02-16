package com.grocery.groceryapp.repository;

import com.grocery.groceryapp.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Integer> {
}

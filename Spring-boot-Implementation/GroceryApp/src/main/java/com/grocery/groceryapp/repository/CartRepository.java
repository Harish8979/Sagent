package com.grocery.groceryapp.repository;

import com.grocery.groceryapp.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<Cart, Integer> {

    Cart findByUserUserId(Integer userId);

}

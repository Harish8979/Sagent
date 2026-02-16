package com.grocery.groceryapp.repository;

import com.grocery.groceryapp.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCartCartId(Integer cartId);
}

package com.grocery.groceryapp.service;

import com.grocery.groceryapp.entity.Cart;
import com.grocery.groceryapp.entity.User;
import com.grocery.groceryapp.repository.CartRepository;
import com.grocery.groceryapp.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository,
                       UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.userRepository = userRepository;
    }

    public Cart createOrUpdateCart(Integer userId, double totalAmount) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUserUserId(userId);

        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
        }

        cart.setTotalAmount(totalAmount);

        return cartRepository.save(cart);
    }
}

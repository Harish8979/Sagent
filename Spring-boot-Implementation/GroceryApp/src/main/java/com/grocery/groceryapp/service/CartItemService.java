package com.grocery.groceryapp.service;

import com.grocery.groceryapp.entity.*;
import com.grocery.groceryapp.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CartItemService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public CartItem addItem(Integer userId, Integer productId, int quantity) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUserUserId(userId);

        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            cart.setTotalAmount(0);
            cart = cartRepository.save(cart);
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        CartItem item = new CartItem();
        item.setCart(cart);
        item.setProduct(product);
        item.setQuantity(quantity);

        cart.setTotalAmount(
                cart.getTotalAmount() + product.getPrice() * quantity
        );

        cartRepository.save(cart);

        return cartItemRepository.save(item);
    }
}

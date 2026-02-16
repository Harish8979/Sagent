package com.grocery.groceryapp.controller;

import com.grocery.groceryapp.entity.Cart;
import com.grocery.groceryapp.service.CartService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/{userId}/{amount}")
    public Cart createCart(
            @PathVariable Integer userId,
            @PathVariable double amount) {

        return cartService.createOrUpdateCart(userId, amount);
    }
}

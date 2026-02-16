package com.grocery.groceryapp.controller;

import com.grocery.groceryapp.entity.CartItem;
import com.grocery.groceryapp.service.CartItemService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart-item")
public class CartItemController {

    private final CartItemService cartItemService;

    public CartItemController(CartItemService cartItemService) {
        this.cartItemService = cartItemService;
    }

    @PostMapping("/{userId}/{productId}/{qty}")
    public CartItem addItem(
            @PathVariable Integer userId,
            @PathVariable Integer productId,
            @PathVariable int qty) {

        return cartItemService.addItem(userId, productId, qty);
    }
}

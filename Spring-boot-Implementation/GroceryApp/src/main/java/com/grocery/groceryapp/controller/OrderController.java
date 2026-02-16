package com.grocery.groceryapp.controller;

import com.grocery.groceryapp.entity.Order;
import com.grocery.groceryapp.service.OrderService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/{userId}")
    public Order placeOrder(@PathVariable Integer userId) {
        return orderService.placeOrder(userId);
    }
}

package com.grocery.groceryapp.controller;

import com.grocery.groceryapp.entity.Delivery;
import com.grocery.groceryapp.service.DeliveryService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/delivery")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    @PostMapping("/{orderId}")
    public Delivery assignDelivery(@PathVariable Integer orderId) {
        return deliveryService.assignDelivery(orderId);
    }
}

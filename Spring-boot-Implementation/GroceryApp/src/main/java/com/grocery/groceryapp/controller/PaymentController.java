package com.grocery.groceryapp.controller;

import com.grocery.groceryapp.entity.Payment;
import com.grocery.groceryapp.service.PaymentService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payment")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // MAKE PAYMENT
    @PostMapping("/{orderId}")
    public Payment makePayment(@PathVariable Integer orderId) {
        return paymentService.makePayment(orderId);
    }
}

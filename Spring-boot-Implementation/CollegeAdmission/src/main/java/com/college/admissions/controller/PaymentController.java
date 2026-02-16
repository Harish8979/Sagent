package com.college.admissions.controller;

import com.college.admissions.entity.Payment;
import com.college.admissions.service.PaymentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public Payment create(@RequestBody Payment payment) {
        return paymentService.save(payment);
    }

    @GetMapping
    public List<Payment> getAll() {
        return paymentService.getAll();
    }

    @GetMapping("/{id}")
    public Payment get(@PathVariable Integer id) {
        return paymentService.getById(id);
    }
}

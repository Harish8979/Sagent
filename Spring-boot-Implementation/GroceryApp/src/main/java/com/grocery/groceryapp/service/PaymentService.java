package com.grocery.groceryapp.service;

import com.grocery.groceryapp.entity.Order;
import com.grocery.groceryapp.entity.Payment;
import com.grocery.groceryapp.repository.OrderRepository;
import com.grocery.groceryapp.repository.PaymentRepository;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    public PaymentService(PaymentRepository paymentRepository,
                          OrderRepository orderRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
    }

    public Payment makePayment(int orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getFinalAmount());
        payment.setPaymentStatus("SUCCESS");

        order.setStatus("CONFIRMED");
        orderRepository.save(order);

        return paymentRepository.save(payment);
    }
}

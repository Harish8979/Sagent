package com.ticketbooking.service;

import java.math.BigDecimal;

public interface RazorpayService {

    RazorpayOrder createOrder(BigDecimal amount, String receiptId);

    String capturePayment(String razorpayOrderId, String razorpayPaymentId);

    record RazorpayOrder(String orderId, BigDecimal amount, String currency, String receiptId) {
    }
}

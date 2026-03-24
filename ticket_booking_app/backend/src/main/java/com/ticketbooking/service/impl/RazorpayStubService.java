package com.ticketbooking.service.impl;

import java.math.BigDecimal;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.ticketbooking.exception.BadRequestException;
import com.ticketbooking.service.RazorpayService;

@Service
public class RazorpayStubService implements RazorpayService {

    private static final Logger log = LoggerFactory.getLogger(RazorpayStubService.class);

    @Override
    public RazorpayOrder createOrder(BigDecimal amount, String receiptId) {
        String orderId = "order_" + UUID.randomUUID().toString().replace("-", "");
        log.info("Created Razorpay stub order {} for receipt {} amount {}", orderId, receiptId, amount);
        return new RazorpayOrder(orderId, amount, "INR", receiptId);
    }

    @Override
    public String capturePayment(String razorpayOrderId, String razorpayPaymentId) {
        if (!StringUtils.hasText(razorpayOrderId) || !razorpayOrderId.startsWith("order_")) {
            throw new BadRequestException("Invalid Razorpay order reference");
        }
        String paymentId = StringUtils.hasText(razorpayPaymentId)
                ? razorpayPaymentId
                : "pay_" + UUID.randomUUID().toString().replace("-", "");
        log.info("Captured Razorpay stub payment {} for order {}", paymentId, razorpayOrderId);
        return paymentId;
    }
}

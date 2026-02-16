package com.grocery.groceryapp.service;

import com.grocery.groceryapp.entity.*;
import com.grocery.groceryapp.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final OrderItemRepository orderItemRepository;

    public OrderService(OrderRepository orderRepository,
                        CartRepository cartRepository,
                        CartItemRepository cartItemRepository,
                        OrderItemRepository orderItemRepository) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.orderItemRepository = orderItemRepository;
    }

    public Order placeOrder(Integer userId) {

        Cart cart = cartRepository.findByUserUserId(userId);

        if (cart == null)
            throw new RuntimeException("Cart not found");

        Order order = new Order();
        order.setUser(cart.getUser());
        order.setStatus("PLACED");
        order.setOrderDate(LocalDateTime.now());

        Order savedOrder = orderRepository.save(order);

        List<CartItem> items =
                cartItemRepository.findByCartCartId(cart.getCartId());

        double total = 0;

        for (CartItem c : items) {

            OrderItem oi = new OrderItem();
            oi.setOrder(savedOrder);
            oi.setProduct(c.getProduct());
            oi.setQuantity(c.getQuantity());
            oi.setPriceAtTime(c.getProduct().getPrice());

            total += oi.getPriceAtTime() * oi.getQuantity();

            orderItemRepository.save(oi);
        }

        savedOrder.setTotalAmount(total);
        savedOrder.setFinalAmount(total > 200 ? total - 25 : total);

        return orderRepository.save(savedOrder);
    }
}

package com.grocery.groceryapp.service;

import com.grocery.groceryapp.entity.Delivery;
import com.grocery.groceryapp.entity.Order;
import com.grocery.groceryapp.repository.DeliveryRepository;
import com.grocery.groceryapp.repository.OrderRepository;
import org.springframework.stereotype.Service;

@Service
public class DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final OrderRepository orderRepository;

    public DeliveryService(DeliveryRepository deliveryRepository,
                           OrderRepository orderRepository) {
        this.deliveryRepository = deliveryRepository;
        this.orderRepository = orderRepository;
    }

    public Delivery assignDelivery(Integer orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Delivery delivery = new Delivery();
        delivery.setOrder(order);
        delivery.setDeliveryPerson("Ravi");
        delivery.setDeliveryStatus("ASSIGNED");

        order.setStatus("OUT_FOR_DELIVERY");
        orderRepository.save(order);

        return deliveryRepository.save(delivery);
    }
}

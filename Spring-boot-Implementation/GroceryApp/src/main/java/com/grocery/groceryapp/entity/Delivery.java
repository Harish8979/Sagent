package com.grocery.groceryapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "delivery")
@JsonIgnoreProperties("order")
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int deliveryId;

    private String deliveryPerson;
    private String deliveryStatus;

    @OneToOne
    @JoinColumn(name = "order_id")
    private Order order;

    public Delivery() {}

    public int getDeliveryId() { return deliveryId; }
    public void setDeliveryId(int deliveryId) { this.deliveryId = deliveryId; }

    public String getDeliveryPerson() { return deliveryPerson; }
    public void setDeliveryPerson(String deliveryPerson) { this.deliveryPerson = deliveryPerson; }

    public String getDeliveryStatus() { return deliveryStatus; }
    public void setDeliveryStatus(String deliveryStatus) { this.deliveryStatus = deliveryStatus; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
}

package com.grocery.groceryapp.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int orderId;

    private double totalAmount;
    private double finalAmount;
    private String status;
    private LocalDateTime orderDate;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties("orders")
    private User user;

    public Order() {
    }

    // ===== GETTERS =====
    public int getOrderId() {
        return orderId;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public double getFinalAmount() {
        return finalAmount;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public User getUser() {
        return user;
    }

    // ===== SETTERS =====
    public void setOrderId(int orderId) {
        this.orderId = orderId;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public void setFinalAmount(double finalAmount) {
        this.finalAmount = finalAmount;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public void setUser(User user) {
        this.user = user;
    }
}

package com.budgettracker.budgettracker.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "income")
public class Income {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "income_id")
    private Integer incomeId;

    private Double amount;
    private String source;

    @Column(name = "income_date")
    private LocalDate incomeDate;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // No-arg constructor
    public Income() {
    }

    // Getters and Setters

    public Integer getIncomeId() {
        return incomeId;
    }

    public void setIncomeId(Integer incomeId) {
        this.incomeId = incomeId;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public LocalDate getIncomeDate() {
        return incomeDate;
    }

    public void setIncomeDate(LocalDate incomeDate) {
        this.incomeDate = incomeDate;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}

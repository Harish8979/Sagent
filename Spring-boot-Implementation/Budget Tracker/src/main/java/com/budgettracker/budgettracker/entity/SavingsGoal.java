package com.budgettracker.budgettracker.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "savings_goal")
public class SavingsGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "goal_id")
    private Integer goalId;

    @Column(name = "goal_name")
    private String goalName;

    @Column(name = "target_amount")
    private Double targetAmount;

    @Column(name = "current_amount")
    private Double currentAmount;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    // No-arg constructor
    public SavingsGoal() {
    }

    // Getters and Setters

    public Integer getGoalId() {
        return goalId;
    }

    public void setGoalId(Integer goalId) {
        this.goalId = goalId;
    }

    public String getGoalName() {
        return goalName;
    }

    public void setGoalName(String goalName) {
        this.goalName = goalName;
    }

    public Double getTargetAmount() {
        return targetAmount;
    }

    public void setTargetAmount(Double targetAmount) {
        this.targetAmount = targetAmount;
    }

    public Double getCurrentAmount() {
        return currentAmount;
    }

    public void setCurrentAmount(Double currentAmount) {
        this.currentAmount = currentAmount;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}

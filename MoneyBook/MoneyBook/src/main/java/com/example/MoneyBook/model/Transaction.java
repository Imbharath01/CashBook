package com.example.MoneyBook.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal cashIn = BigDecimal.ZERO;
    
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal cashOut = BigDecimal.ZERO;
    
    @Column(nullable = false)
    private LocalDateTime transactionDate;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TransactionType type;
    
    @Column(length = 500)
    private String notes;
    
    public enum TransactionType {
        CASHIN, CASHOUT
    }
    
    // Constructors
    public Transaction() {
        this.transactionDate = LocalDateTime.now();
    }
    
    public Transaction(User user, BigDecimal cashIn, BigDecimal cashOut, TransactionType type) {
        this.user = user;
        this.cashIn = cashIn;
        this.cashOut = cashOut;
        this.type = type;
        this.transactionDate = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(@JsonProperty("user") User user) {
        this.user = user;
    }
    
    public BigDecimal getCashIn() {
        return cashIn;
    }
    public void setCashIn(BigDecimal cashIn) {
        this.cashIn = cashIn;
    }
    public BigDecimal getCashOut() {
        return cashOut;
    }
    public void setCashOut(BigDecimal cashOut) {
        this.cashOut = cashOut;
    }
    
    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }
    
    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }
    
    public TransactionType getType() {
        return type;
    }
    
    public void setType(TransactionType type) {
        this.type = type;
    }
    
    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Long getUserId() {
        return user != null ? user.getId() : null;
    }
    
    @Override
    public String toString() {
        return "Transaction{" +
                "id=" + id +
                ", user=" + user.getUsername() +
                ", cashIn=" + cashIn +
                ", cashOut=" + cashOut +
                ", transactionDate=" + transactionDate +
                ", type=" + type +
                ", notes=" + notes +
                '}';
    }
}

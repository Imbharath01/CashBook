package com.example.MoneyBook.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "username", unique = true, nullable = false)
    private String username;
    
    @Column(name = "name", nullable = true)
    private String name;
    
    @Column(nullable = false)
    private String password;
    
    @Column(precision = 10, scale = 2, nullable = false)
    private BigDecimal balance = BigDecimal.valueOf(500.00);
    
    // Constructors
    public User() {}
    
    public User(String username, String password) {
        this.username = username;
        this.name = username; // Set name to same as username for compatibility
        this.password = password;
        this.balance = BigDecimal.valueOf(500.00);
    }
    
    public User(String username, String password, BigDecimal balance) {
        this.username = username;
        this.name = username; // Set name to same as username for compatibility
        this.password = password;
        this.balance = balance;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
        // Also set name for database compatibility
        if (this.name == null) {
            this.name = username;
        }
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public BigDecimal getBalance() {
        return balance;
    }
    
    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }
    
    @Override
    public String toString() {
        return "User{" +
                "id=" + id +
                ", username='" + username + '\'' +
                ", name='" + name + '\'' +
                ", password='" + password + '\'' +
                ", balance=" + balance +
                '}';
    }
}

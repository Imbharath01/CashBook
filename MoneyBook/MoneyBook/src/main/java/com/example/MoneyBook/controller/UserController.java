package com.example.MoneyBook.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.MoneyBook.model.User;
import com.example.MoneyBook.repo.UserRepository;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Register new user
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        System.out.println("=== REGISTRATION REQUEST ===");
        System.out.println("Received registration request for user: " + user.getUsername());
        System.out.println("Password: " + user.getPassword());
        System.out.println("Balance: " + user.getBalance());
        System.out.println("User object: " + user);
        
        // Validate input
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            System.out.println("ERROR: Username is null or empty");
            return ResponseEntity.badRequest().body("Username is required");
        }
        
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            System.out.println("ERROR: Password is null or empty");
            return ResponseEntity.badRequest().body("Password is required");
        }
        
        if (user.getBalance() == null) {
            user.setBalance(BigDecimal.valueOf(500.00));
            System.out.println("Set default balance to: " + user.getBalance());
        }
        
        try {
            System.out.println("Saving user with balance: " + user.getBalance());
            User savedUser = userRepository.save(user);
            System.out.println("User saved successfully with ID: " + savedUser.getId());
            System.out.println("Final saved user: " + savedUser.getUsername() + ", Balance: " + savedUser.getBalance());
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            System.out.println("Error during registration: " + e.getMessage());
            e.printStackTrace();
            
            // Show existing users for debugging
            List<User> existingUsers = userRepository.findAll();
            System.out.println("Existing users in database:");
            for (User existingUser : existingUsers) {
                System.out.println("- " + existingUser.getUsername() + " (ID: " + existingUser.getId() + ")");
            }
            
            return ResponseEntity.badRequest().body("Username already exists");
        }
    }

    // Login user
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody User loginUser) {
        System.out.println("Login attempt for user: " + loginUser.getUsername());
        System.out.println("Password provided: " + loginUser.getPassword());
        
        List<User> users = userRepository.findAll();
        System.out.println("Total users in database: " + users.size());
        
        for (User user : users) {
            System.out.println("Checking against user: " + user.getUsername() + " (ID: " + user.getId() + ")");
            if (user.getUsername().equals(loginUser.getUsername()) && user.getPassword().equals(loginUser.getPassword())) {
                System.out.println("Login successful for user: " + user.getUsername());
                return ResponseEntity.ok(user);
            }
        }
        System.out.println("Login failed - no matching credentials found");
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> ResponseEntity.ok(user))
                .orElse(ResponseEntity.notFound().build());
    }

    // Update user balance
    @PutMapping("/{id}/balance")
    public ResponseEntity<?> updateBalance(@PathVariable Long id, @RequestBody User userUpdate) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setBalance(userUpdate.getBalance());
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Get all users
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
} 
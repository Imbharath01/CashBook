package com.example.MoneyBook.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.MoneyBook.model.Transaction;
import com.example.MoneyBook.model.User;
import com.example.MoneyBook.repo.TransactionRepository;
import com.example.MoneyBook.repo.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*")
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    // Get all transactions for a user
    @GetMapping("/user/{userId}")
    public List<Transaction> getUserTransactions(@PathVariable Long userId) {
        return transactionRepository.findAll()
                .stream()
                .filter(t -> t.getUser().getId().equals(userId))
                .toList();
    }

    // Deposit money (Cash In)
    @PostMapping("/deposit")
    public ResponseEntity<?> deposit(@RequestBody Transaction depositRequest) {
        System.out.println("=== DEPOSIT REQUEST ===");
        System.out.println("Received deposit request: " + depositRequest);
        System.out.println("User from request: " + depositRequest.getUser());
        
        Long userId = depositRequest.getUser() != null ? depositRequest.getUser().getId() : null;
        System.out.println("User ID: " + userId);
        
        if (userId == null) {
            System.out.println("ERROR: User or User ID must not be null");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User or User ID must not be null");
        }
        
        User user = userRepository.findById(userId).orElse(null);
        System.out.println("Found user: " + user);
        
        if (user == null) {
            System.out.println("ERROR: User not found");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not found");
        }
        
        try {
            BigDecimal cashInAmount = depositRequest.getCashIn();
            System.out.println("Cash in amount: " + cashInAmount);
            
            user.setBalance(user.getBalance().add(cashInAmount));
            System.out.println("Updated balance: " + user.getBalance());
            
            User savedUser = userRepository.save(user);
            System.out.println("User saved successfully");
            
            Transaction transaction = new Transaction(user, cashInAmount, BigDecimal.ZERO, Transaction.TransactionType.CASHIN);
            transaction.setNotes(depositRequest.getNotes());
            
            System.out.println("Creating transaction: " + transaction);
            Transaction savedTransaction = transactionRepository.save(transaction);
            System.out.println("Transaction saved successfully with ID: " + savedTransaction.getId());
            
            return ResponseEntity.ok(savedTransaction);
        } catch (Exception e) {
            System.out.println("ERROR during deposit: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing deposit: " + e.getMessage());
        }
    }

    // Withdraw money (Cash Out)
    @PostMapping("/withdraw")
    public ResponseEntity<?> withdraw(@RequestBody Transaction withdrawRequest) {
        System.out.println("=== WITHDRAW REQUEST ===");
        System.out.println("Received withdraw request: " + withdrawRequest);
        
        Long userId = withdrawRequest.getUser() != null ? withdrawRequest.getUser().getId() : null;
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User or User ID must not be null");
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("User not found");
        }
        if (user.getBalance().compareTo(withdrawRequest.getCashOut()) < 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Insufficient funds");
        }
        user.setBalance(user.getBalance().subtract(withdrawRequest.getCashOut()));
        userRepository.save(user);
        Transaction transaction = new Transaction(user, BigDecimal.ZERO, withdrawRequest.getCashOut(), Transaction.TransactionType.CASHOUT);
        transaction.setNotes(withdrawRequest.getNotes());
        return ResponseEntity.ok(transactionRepository.save(transaction));
    }

    // Get recent transactions for a user (up to 5)
    @GetMapping("/recent/{userId}")
    public List<Transaction> getRecentTransactions(@PathVariable Long userId) {
        return transactionRepository.findAll()
                .stream()
                .filter(t -> t.getUser().getId().equals(userId))
                .limit(5)
                .toList();
    }

    // Update transaction
    @PutMapping("/{transactionId}")
    public ResponseEntity<?> updateTransaction(@PathVariable Long transactionId, @RequestBody Transaction updatedTransaction) {
        System.out.println("=== UPDATE TRANSACTION REQUEST ===");
        System.out.println("Transaction ID: " + transactionId);
        System.out.println("Updated transaction: " + updatedTransaction);
        
        try {
            Transaction existingTransaction = transactionRepository.findById(transactionId).orElse(null);
            if (existingTransaction == null) {
                System.out.println("ERROR: Transaction not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Transaction not found");
            }
            
            User user = existingTransaction.getUser();
            System.out.println("Found user: " + user.getUsername());
            
            // Calculate the difference to update user balance
            BigDecimal oldAmount = existingTransaction.getType() == Transaction.TransactionType.CASHIN 
                ? existingTransaction.getCashIn() 
                : existingTransaction.getCashOut();
            BigDecimal newAmount = updatedTransaction.getType() == Transaction.TransactionType.CASHIN 
                ? updatedTransaction.getCashIn() 
                : updatedTransaction.getCashOut();
            
            System.out.println("Old amount: " + oldAmount + ", New amount: " + newAmount);
            
            // Update user balance based on the difference
            if (existingTransaction.getType() == Transaction.TransactionType.CASHIN) {
                // For cash in: subtract old amount, add new amount
                user.setBalance(user.getBalance().subtract(oldAmount).add(newAmount));
            } else {
                // For cash out: add back old amount, subtract new amount
                user.setBalance(user.getBalance().add(oldAmount).subtract(newAmount));
            }
            
            System.out.println("Updated user balance: " + user.getBalance());
            
            // Update transaction details
            existingTransaction.setCashIn(updatedTransaction.getCashIn());
            existingTransaction.setCashOut(updatedTransaction.getCashOut());
            existingTransaction.setNotes(updatedTransaction.getNotes());
            
            // Save both user and transaction
            userRepository.save(user);
            Transaction savedTransaction = transactionRepository.save(existingTransaction);
            
            System.out.println("Transaction updated successfully");
            return ResponseEntity.ok(savedTransaction);
            
        } catch (Exception e) {
            System.out.println("ERROR during transaction update: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating transaction: " + e.getMessage());
        }
    }

    // Delete transaction
    @DeleteMapping("/{transactionId}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long transactionId) {
        System.out.println("=== DELETE TRANSACTION REQUEST ===");
        System.out.println("Transaction ID: " + transactionId);
        
        try {
            Transaction transaction = transactionRepository.findById(transactionId).orElse(null);
            if (transaction == null) {
                System.out.println("ERROR: Transaction not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Transaction not found");
            }
            
            User user = transaction.getUser();
            System.out.println("Found user: " + user.getUsername());
            System.out.println("Transaction type: " + transaction.getType());
            
            // Reverse the transaction effect on user balance
            if (transaction.getType() == Transaction.TransactionType.CASHIN) {
                // Subtract the cash in amount from balance
                user.setBalance(user.getBalance().subtract(transaction.getCashIn()));
                System.out.println("Reversed cash in of: " + transaction.getCashIn());
            } else {
                // Add back the cash out amount to balance
                user.setBalance(user.getBalance().add(transaction.getCashOut()));
                System.out.println("Reversed cash out of: " + transaction.getCashOut());
            }
            
            System.out.println("Updated user balance: " + user.getBalance());
            
            // Save user and delete transaction
            userRepository.save(user);
            transactionRepository.delete(transaction);
            
            System.out.println("Transaction deleted successfully");
            return ResponseEntity.ok("Transaction deleted successfully");
            
        } catch (Exception e) {
            System.out.println("ERROR during transaction deletion: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting transaction: " + e.getMessage());
        }
    }
}


package com.apextrade.controller;

import com.apextrade.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @GetMapping
    public ResponseEntity<?> getTransactions() {
        UUID userId = (UUID) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return ResponseEntity.ok(transactionService.getTransactions(userId));
    }
}
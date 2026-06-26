package com.apextrade.controller;

import com.apextrade.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @GetMapping("/balance")
    public ResponseEntity<?> getBalance() {
        UUID userId = (UUID) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return ResponseEntity.ok(walletService.getBalance(userId));
    }
}
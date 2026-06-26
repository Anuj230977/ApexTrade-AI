package com.apextrade.service;

import com.apextrade.entity.Wallet;
import com.apextrade.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;

    public Map<String, Object> getBalance(UUID userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
        return Map.of(
            "userId", userId,
            "balance", wallet.getCashBalance()
        );
    }
}
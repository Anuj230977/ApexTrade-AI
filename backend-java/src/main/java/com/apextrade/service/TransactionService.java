package com.apextrade.service;

import com.apextrade.entity.Transaction;
import com.apextrade.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    public List<Map<String, Object>> getTransactions(UUID userId) {
        List<Transaction> transactions = transactionRepository
                .findByUserIdOrderByCreatedAtDesc(userId);

        List<Map<String, Object>> result = new ArrayList<>();
        for (Transaction tx : transactions) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", tx.getId());
            map.put("symbol", tx.getSymbol());
            map.put("type", tx.getTransactionType());
            map.put("quantity", tx.getQuantity());
            map.put("price", tx.getPrice());
            map.put("totalAmount", tx.getTotalAmount());
            map.put("createdAt", tx.getCreatedAt().toString());
            result.add(map);
        }
        return result;
    }
}
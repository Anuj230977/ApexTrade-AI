package com.apextrade.controller;

import com.apextrade.service.TradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/trade")
public class TradeController {

    @Autowired
    private TradeService tradeService;

    @PostMapping("/buy")
    public ResponseEntity<?> buy(@RequestBody Map<String, String> request) {
        UUID userId = (UUID) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String symbol = request.get("symbol");
        BigDecimal quantity = new BigDecimal(request.get("quantity"));
        return ResponseEntity.ok(tradeService.buy(userId, symbol, quantity));
    }

    @PostMapping("/sell")
    public ResponseEntity<?> sell(@RequestBody Map<String, String> request) {
        UUID userId = (UUID) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        String symbol = request.get("symbol");
        BigDecimal quantity = new BigDecimal(request.get("quantity"));
        return ResponseEntity.ok(tradeService.sell(userId, symbol, quantity));
    }
}
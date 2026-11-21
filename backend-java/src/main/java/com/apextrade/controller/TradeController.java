package com.apextrade.controller;

import com.apextrade.dto.TradeRequest;
import com.apextrade.service.TradeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/trade")
public class TradeController {

    private final TradeService tradeService;

    public TradeController(TradeService tradeService) {
        this.tradeService = tradeService;
    }

    @PostMapping("/buy")
    public ResponseEntity<?> buy(@Valid @RequestBody TradeRequest request) {
        UUID userId = (UUID) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return ResponseEntity.ok(tradeService.buy(userId, request.getSymbol(), request.getQuantity()));
    }

    @PostMapping("/sell")
    public ResponseEntity<?> sell(@Valid @RequestBody TradeRequest request) {
        UUID userId = (UUID) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        return ResponseEntity.ok(tradeService.sell(userId, request.getSymbol(), request.getQuantity()));
    }
}

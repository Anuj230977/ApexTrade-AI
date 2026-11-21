package com.apextrade.service;

import com.apextrade.entity.*;
import com.apextrade.exception.ApiException;
import com.apextrade.repository.*;
import com.apextrade.validation.TradeRules;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.UUID;

@Service
public class TradeService {

    private final WalletRepository walletRepository;
    private final PortfolioRepository portfolioRepository;
    private final PositionRepository positionRepository;
    private final TransactionRepository transactionRepository;
    private final RestTemplate restTemplate;

    @Value("${python.service.url}")
    private String pythonServiceUrl;

    public TradeService(WalletRepository walletRepository,
                        PortfolioRepository portfolioRepository,
                        PositionRepository positionRepository,
                        TransactionRepository transactionRepository,
                        RestTemplate restTemplate) {
        this.walletRepository = walletRepository;
        this.portfolioRepository = portfolioRepository;
        this.positionRepository = positionRepository;
        this.transactionRepository = transactionRepository;
        this.restTemplate = restTemplate;
    }

    private BigDecimal fetchPrice(String symbol) {
        String url = pythonServiceUrl + "/price/" + symbol;
        try {
            Map<?, ?> response = restTemplate.getForObject(url, Map.class);
            if (response == null) {
                throw new ApiException(503, "UPSTREAM_INVALID_PRICE", "Market price is unavailable");
            }
            return TradeRules.validatePrice(response.get("price"));
        } catch (RestClientException e) {
            throw new ApiException(503, "UPSTREAM_UNAVAILABLE", "Market price service is unavailable");
        }
    }

    @Transactional
    public Map<String, Object> buy(UUID userId, String symbol, BigDecimal quantity) {
        String normalizedSymbol = TradeRules.normalizeSymbol(symbol);
        TradeRules.validateQuantity(quantity);
        BigDecimal price = fetchPrice(normalizedSymbol);
        BigDecimal totalCost = price.multiply(quantity).setScale(2, RoundingMode.HALF_UP);

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException(400, "POSITION_NOT_FOUND", "Wallet not found"));

        if (wallet.getCashBalance() == null || wallet.getCashBalance().compareTo(totalCost) < 0) {
            throw new ApiException(400, "INSUFFICIENT_FUNDS", "Insufficient funds");
        }

        Portfolio portfolio = portfolioRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException(400, "POSITION_NOT_FOUND", "Portfolio not found"));

        Position position = positionRepository
                .findByPortfolioIdAndSymbol(portfolio.getId(), normalizedSymbol)
                .orElseGet(() -> {
                    Position p = new Position();
                    p.setPortfolioId(portfolio.getId());
                    p.setSymbol(normalizedSymbol);
                    p.setQuantity(BigDecimal.ZERO);
                    p.setAverageCost(BigDecimal.ZERO);
                    return p;
                });

        BigDecimal oldQty = position.getQuantity() == null ? BigDecimal.ZERO : position.getQuantity();
        BigDecimal oldCost = position.getAverageCost() == null ? BigDecimal.ZERO : position.getAverageCost();
        BigDecimal newQty = oldQty.add(quantity);
        BigDecimal newAvgCost = oldQty.signum() == 0
                ? price
                : oldCost.multiply(oldQty).add(price.multiply(quantity)).divide(newQty, 2, RoundingMode.HALF_UP);

        position.setQuantity(newQty);
        position.setAverageCost(newAvgCost);
        wallet.setCashBalance(wallet.getCashBalance().subtract(totalCost));

        walletRepository.save(wallet);
        positionRepository.save(position);

        Transaction tx = new Transaction();
        tx.setUserId(userId);
        tx.setSymbol(normalizedSymbol);
        tx.setTransactionType("BUY");
        tx.setQuantity(quantity);
        tx.setPrice(price);
        tx.setTotalAmount(totalCost);
        transactionRepository.save(tx);

        return Map.of("symbol", normalizedSymbol, "quantity", quantity, "price", price,
                "totalCost", totalCost, "remainingBalance", wallet.getCashBalance());
    }

    @Transactional
    public Map<String, Object> sell(UUID userId, String symbol, BigDecimal quantity) {
        String normalizedSymbol = TradeRules.normalizeSymbol(symbol);
        TradeRules.validateQuantity(quantity);
        BigDecimal price = fetchPrice(normalizedSymbol);
        BigDecimal totalProceeds = price.multiply(quantity).setScale(2, RoundingMode.HALF_UP);

        Portfolio portfolio = portfolioRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException(400, "POSITION_NOT_FOUND", "Portfolio not found"));

        Position position = positionRepository
                .findByPortfolioIdAndSymbol(portfolio.getId(), normalizedSymbol)
                .orElseThrow(() -> new ApiException(400, "POSITION_NOT_FOUND", "Position not found"));

        if (position.getQuantity() == null || position.getQuantity().compareTo(quantity) < 0) {
            throw new ApiException(400, "INSUFFICIENT_SHARES", "Insufficient shares");
        }

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException(400, "POSITION_NOT_FOUND", "Wallet not found"));

        BigDecimal newQuantity = position.getQuantity().subtract(quantity);
        if (newQuantity.signum() == 0) {
            positionRepository.delete(position);
        } else {
            position.setQuantity(newQuantity);
            positionRepository.save(position);
        }

        wallet.setCashBalance(wallet.getCashBalance().add(totalProceeds));
        walletRepository.save(wallet);

        Transaction tx = new Transaction();
        tx.setUserId(userId);
        tx.setSymbol(normalizedSymbol);
        tx.setTransactionType("SELL");
        tx.setQuantity(quantity);
        tx.setPrice(price);
        tx.setTotalAmount(totalProceeds);
        transactionRepository.save(tx);

        return Map.of("symbol", normalizedSymbol, "quantity", quantity, "price", price,
                "totalProceeds", totalProceeds, "remainingBalance", wallet.getCashBalance());
    }
}

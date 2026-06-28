package com.apextrade.service;

import com.apextrade.entity.*;
import com.apextrade.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.UUID;

@Service
public class TradeService {

    @Autowired private WalletRepository walletRepository;
    @Autowired private PortfolioRepository portfolioRepository;
    @Autowired private PositionRepository positionRepository;
    @Autowired private TransactionRepository transactionRepository;

    @Value("${python.service.url}")
    private String pythonServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    private BigDecimal fetchPrice(String symbol) {
        String url = pythonServiceUrl + "/price/" + symbol;
        Map response = restTemplate.getForObject(url, Map.class);
        return new BigDecimal(response.get("price").toString());
    }

    @Transactional
    public Map<String, Object> buy(UUID userId, String symbol, BigDecimal quantity) {
        BigDecimal price = fetchPrice(symbol);
        BigDecimal totalCost = price.multiply(quantity).setScale(2, RoundingMode.HALF_UP);

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        if (wallet.getCashBalance().compareTo(totalCost) < 0)
            throw new RuntimeException("Insufficient funds");

        wallet.setCashBalance(wallet.getCashBalance().subtract(totalCost));
        walletRepository.save(wallet);

        Portfolio portfolio = portfolioRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));

        Position position = positionRepository
                .findByPortfolioIdAndSymbol(portfolio.getId(), symbol)
                .orElseGet(() -> {
                    Position p = new Position();
                    p.setPortfolioId(portfolio.getId());
                    p.setSymbol(symbol);
                    p.setQuantity(BigDecimal.ZERO);
                    p.setAverageCost(BigDecimal.ZERO);
                    return p;
                });

        BigDecimal oldQty = position.getQuantity();
        BigDecimal oldCost = position.getAverageCost();
        BigDecimal newQty = oldQty.add(quantity);
        BigDecimal newAvgCost = (oldCost.multiply(oldQty).add(price.multiply(quantity)))
                .divide(newQty, 2, RoundingMode.HALF_UP);

        position.setQuantity(newQty);
        position.setAverageCost(newAvgCost);
        positionRepository.save(position);

        Transaction tx = new Transaction();
        tx.setUserId(userId);
        tx.setSymbol(symbol);
        tx.setTransactionType("BUY");
        tx.setQuantity(quantity);
        tx.setPrice(price);
        tx.setTotalAmount(totalCost);
        transactionRepository.save(tx);

        return Map.of(
            "symbol", symbol,
            "quantity", quantity,
            "price", price,
            "totalCost", totalCost,
            "remainingBalance", wallet.getCashBalance()
        );
    }

    @Transactional
    public Map<String, Object> sell(UUID userId, String symbol, BigDecimal quantity) {
        BigDecimal price = fetchPrice(symbol);
        BigDecimal totalProceeds = price.multiply(quantity).setScale(2, RoundingMode.HALF_UP);

        Portfolio portfolio = portfolioRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));

        Position position = positionRepository
                .findByPortfolioIdAndSymbol(portfolio.getId(), symbol)
                .orElseThrow(() -> new RuntimeException("Position not found"));

        if (position.getQuantity().compareTo(quantity) < 0)
            throw new RuntimeException("Insufficient shares");

        position.setQuantity(position.getQuantity().subtract(quantity));
        positionRepository.save(position);

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        wallet.setCashBalance(wallet.getCashBalance().add(totalProceeds));
        walletRepository.save(wallet);

        Transaction tx = new Transaction();
        tx.setUserId(userId);
        tx.setSymbol(symbol);
        tx.setTransactionType("SELL");
        tx.setQuantity(quantity);
        tx.setPrice(price);
        tx.setTotalAmount(totalProceeds);
        transactionRepository.save(tx);

        return Map.of(
            "symbol", symbol,
            "quantity", quantity,
            "price", price,
            "totalProceeds", totalProceeds,
            "remainingBalance", wallet.getCashBalance()
        );
    }
}
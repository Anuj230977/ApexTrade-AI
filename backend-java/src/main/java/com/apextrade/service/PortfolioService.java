package com.apextrade.service;

import com.apextrade.entity.Position;
import com.apextrade.entity.Portfolio;
import com.apextrade.entity.Wallet;
import com.apextrade.repository.PortfolioRepository;
import com.apextrade.repository.PositionRepository;
import com.apextrade.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class PortfolioService {

    @Autowired private PortfolioRepository portfolioRepository;
    @Autowired private PositionRepository positionRepository;
    @Autowired private WalletRepository walletRepository;

    @Value("${python.service.url}")
    private String pythonServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    private BigDecimal fetchPrice(String symbol) {
        String url = pythonServiceUrl + "/price/" + symbol;
        Map response = restTemplate.getForObject(url, Map.class);
        return new BigDecimal(response.get("price").toString());
    }

    public Map<String, Object> getPortfolio(UUID userId) {
        Portfolio portfolio = portfolioRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Portfolio not found"));

        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        List<Position> positions = positionRepository.findByPortfolioId(portfolio.getId());

        BigDecimal totalMarketValue = BigDecimal.ZERO;
        List<Map<String, Object>> positionData = new ArrayList<>();

        for (Position pos : positions) {
            if (pos.getQuantity().compareTo(BigDecimal.ZERO) == 0) continue;

            BigDecimal currentPrice = fetchPrice(pos.getSymbol());
            BigDecimal marketValue = currentPrice.multiply(pos.getQuantity())
                    .setScale(2, RoundingMode.HALF_UP);
            BigDecimal unrealizedPnL = currentPrice.subtract(pos.getAverageCost())
                    .multiply(pos.getQuantity())
                    .setScale(2, RoundingMode.HALF_UP);

            totalMarketValue = totalMarketValue.add(marketValue);

            positionData.add(Map.of(
                "symbol", pos.getSymbol(),
                "quantity", pos.getQuantity(),
                "averageCost", pos.getAverageCost(),
                "currentPrice", currentPrice,
                "marketValue", marketValue,
                "unrealizedPnL", unrealizedPnL
            ));
        }

        BigDecimal totalValue = totalMarketValue.add(wallet.getCashBalance())
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal startingValue = new BigDecimal("10000.00");
        BigDecimal totalReturnPercent = totalValue.subtract(startingValue)
                .divide(startingValue, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .setScale(2, RoundingMode.HALF_UP);

        return Map.of(
            "positions", positionData,
            "cashBalance", wallet.getCashBalance(),
            "totalValue", totalValue,
            "totalReturnPercent", totalReturnPercent
        );
    }
}
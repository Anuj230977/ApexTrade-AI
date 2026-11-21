package com.apextrade.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class TradingModeGuard {

    @Value("${trading.mode:PAPER}")
    private String tradingMode;

    @PostConstruct
    public void enforcePaperMode() {
        if (!"PAPER".equalsIgnoreCase(tradingMode == null ? "" : tradingMode.trim())) {
            throw new IllegalStateException("Trading mode must be PAPER; refusing to start with mode " + tradingMode);
        }
    }
}

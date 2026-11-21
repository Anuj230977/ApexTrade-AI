package com.apextrade.service;

import com.apextrade.entity.*;
import com.apextrade.exception.ApiException;
import com.apextrade.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestTemplate;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class TradeServiceTest {

    private WalletRepository walletRepository;
    private PortfolioRepository portfolioRepository;
    private PositionRepository positionRepository;
    private TransactionRepository transactionRepository;
    private RestTemplate restTemplate;
    private TradeService service;

    @BeforeEach
    void setup() throws Exception {
        walletRepository = mock(WalletRepository.class);
        portfolioRepository = mock(PortfolioRepository.class);
        positionRepository = mock(PositionRepository.class);
        transactionRepository = mock(TransactionRepository.class);
        restTemplate = mock(RestTemplate.class);
        service = new TradeService(walletRepository, portfolioRepository, positionRepository, transactionRepository, restTemplate);
        Field field = TradeService.class.getDeclaredField("pythonServiceUrl");
        field.setAccessible(true);
        field.set(service, "http://market");
    }

    @Test
    void invalidBuyInputMakesNoRepositoryCalls() {
        ApiException exception = assertThrows(ApiException.class,
                () -> service.buy(UUID.randomUUID(), "AAPL", BigDecimal.ZERO));
        assertEquals("INVALID_QUANTITY", exception.getCode());
        verifyNoInteractions(walletRepository, portfolioRepository, positionRepository, transactionRepository, restTemplate);
    }

    @Test
    void insufficientFundsMakesNoStateChange() {
        UUID userId = UUID.randomUUID();
        Wallet wallet = new Wallet();
        wallet.setCashBalance(new BigDecimal("10.00"));
        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(java.util.Map.of("price", "100.00"));
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));

        assertThrows(ApiException.class,
                () -> service.buy(userId, "AAPL", new BigDecimal("1")));

        assertEquals(new BigDecimal("10.00"), wallet.getCashBalance());
        verify(walletRepository, never()).save(any());
        verify(positionRepository, never()).save(any());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void insufficientSharesMakesNoStateChange() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID portfolioId = UUID.randomUUID();
        Portfolio portfolio = new Portfolio();
        portfolio.setId(portfolioId);
        Position position = new Position();
        position.setQuantity(new BigDecimal("1.0000"));
        Wallet wallet = new Wallet();
        wallet.setCashBalance(new BigDecimal("100.00"));

        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(java.util.Map.of("price", "10.00"));
        when(portfolioRepository.findByUserId(userId)).thenReturn(Optional.of(portfolio));
        when(positionRepository.findByPortfolioIdAndSymbol(portfolioId, "AAPL")).thenReturn(Optional.of(position));
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));

        assertThrows(ApiException.class,
                () -> service.sell(userId, "aapl", new BigDecimal("2")));

        assertEquals(new BigDecimal("1.0000"), position.getQuantity());
        assertEquals(new BigDecimal("100.00"), wallet.getCashBalance());
        verify(positionRepository, never()).save(any());
        verify(positionRepository, never()).delete(any());
        verify(walletRepository, never()).save(any());
    }

    @Test
    void fullSellDeletesPosition() {
        UUID userId = UUID.randomUUID();
        UUID portfolioId = UUID.randomUUID();
        Portfolio portfolio = new Portfolio();
        portfolio.setId(portfolioId);
        Position position = new Position();
        position.setQuantity(new BigDecimal("2.0000"));
        Wallet wallet = new Wallet();
        wallet.setCashBalance(new BigDecimal("100.00"));

        when(restTemplate.getForObject(anyString(), eq(Map.class))).thenReturn(java.util.Map.of("price", "10.00"));
        when(portfolioRepository.findByUserId(userId)).thenReturn(Optional.of(portfolio));
        when(positionRepository.findByPortfolioIdAndSymbol(portfolioId, "AAPL")).thenReturn(Optional.of(position));
        when(walletRepository.findByUserId(userId)).thenReturn(Optional.of(wallet));

        service.sell(userId, " aapl ", new BigDecimal("2"));

        verify(positionRepository).delete(position);
        verify(positionRepository, never()).save(position);
        assertEquals(new BigDecimal("120.00"), wallet.getCashBalance());
    }
}

package com.apextrade.validation;

import com.apextrade.exception.ApiException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class TradeRulesTest {

    @Test
    void normalizesValidSymbol() {
        assertEquals("AAPL", TradeRules.normalizeSymbol("  aapl  "));
    }

    @Test
    void rejectsInvalidSymbol() {
        assertThrows(ApiException.class, () -> TradeRules.normalizeSymbol("AAPL.US"));
        assertThrows(ApiException.class, () -> TradeRules.normalizeSymbol("../AAPL"));
    }

    @Test
    void rejectsInvalidQuantity() {
        assertThrows(ApiException.class, () -> TradeRules.validateQuantity(null));
        assertThrows(ApiException.class, () -> TradeRules.validateQuantity(BigDecimal.ZERO));
        assertThrows(ApiException.class, () -> TradeRules.validateQuantity(new BigDecimal("-1")));
        assertThrows(ApiException.class, () -> TradeRules.validateQuantity(new BigDecimal("0.00001")));
        assertThrows(ApiException.class, () -> TradeRules.validateQuantity(new BigDecimal("1000000.0001")));
    }

    @Test
    void acceptsValidQuantityAndNormalizesValidPrice() {
        assertDoesNotThrow(() -> TradeRules.validateQuantity(new BigDecimal("12.3456")));
        assertEquals(new BigDecimal("123.46"), TradeRules.validatePrice("123.456"));
    }

    @Test
    void rejectsInvalidPrices() {
        assertThrows(ApiException.class, () -> TradeRules.validatePrice(null));
        assertThrows(ApiException.class, () -> TradeRules.validatePrice("not-a-number"));
        assertThrows(ApiException.class, () -> TradeRules.validatePrice("0"));
        assertThrows(ApiException.class, () -> TradeRules.validatePrice("-1"));
        assertThrows(ApiException.class, () -> TradeRules.validatePrice("1000001"));
    }
}

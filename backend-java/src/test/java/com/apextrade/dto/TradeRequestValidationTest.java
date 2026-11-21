package com.apextrade.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TradeRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setup() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    private Set<ConstraintViolation<TradeRequest>> validate(String symbol, BigDecimal quantity) {
        TradeRequest request = new TradeRequest();
        request.setSymbol(symbol);
        request.setQuantity(quantity);
        return validator.validate(request);
    }

    @Test
    void rejectsMissingRequiredFields() {
        assertFalse(validate(null, null).isEmpty());
        assertFalse(validate("", BigDecimal.ONE).isEmpty());
    }

    @Test
    void rejectsInvalidQuantities() {
        assertFalse(validate("AAPL", BigDecimal.ZERO).isEmpty());
        assertFalse(validate("AAPL", new BigDecimal("-1")).isEmpty());
        assertFalse(validate("AAPL", new BigDecimal("0.00001")).isEmpty());
        assertFalse(validate("AAPL", new BigDecimal("1000001")).isEmpty());
    }

    @Test
    void acceptsValidRequest() {
        assertTrue(validate("AAPL", new BigDecimal("12.3456")).isEmpty());
    }
}

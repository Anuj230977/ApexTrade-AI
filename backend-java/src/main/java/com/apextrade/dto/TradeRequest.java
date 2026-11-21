package com.apextrade.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class TradeRequest {

    @NotBlank(message = "symbol is required")
    private String symbol;

    @NotNull(message = "quantity is required")
    @Positive(message = "quantity must be greater than 0")
    @Digits(integer = 7, fraction = 4, message = "quantity has invalid precision")
    @DecimalMax(value = "1000000.0000", message = "quantity exceeds the allowed maximum")
    private BigDecimal quantity;

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
}

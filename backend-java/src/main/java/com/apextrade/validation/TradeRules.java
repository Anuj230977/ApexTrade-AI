package com.apextrade.validation;

import com.apextrade.exception.ApiException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Locale;
import java.util.regex.Pattern;

public final class TradeRules {

    private static final Pattern SYMBOL_PATTERN = Pattern.compile("^[A-Z]{1,10}$");
    private static final BigDecimal MAX_QUANTITY = new BigDecimal("1000000.0000");
    private static final BigDecimal MAX_PRICE = new BigDecimal("1000000.00");

    private TradeRules() {}

    public static String normalizeSymbol(String symbol) {
        if (symbol == null) {
            throw new ApiException(400, "INVALID_SYMBOL", "Symbol is required");
        }
        String normalized = symbol.trim().toUpperCase(Locale.ROOT);
        if (!SYMBOL_PATTERN.matcher(normalized).matches()) {
            throw new ApiException(400, "INVALID_SYMBOL", "Symbol must contain 1 to 10 uppercase letters");
        }
        return normalized;
    }

    public static void validateQuantity(BigDecimal quantity) {
        if (quantity == null || quantity.signum() <= 0) {
            throw new ApiException(400, "INVALID_QUANTITY", "Quantity must be greater than zero");
        }
        if (quantity.scale() > 4 || quantity.compareTo(MAX_QUANTITY) > 0) {
            throw new ApiException(400, "INVALID_QUANTITY", "Quantity has invalid precision or exceeds the allowed maximum");
        }
    }

    public static BigDecimal validatePrice(Object rawPrice) {
        if (rawPrice == null) {
            throw new ApiException(503, "UPSTREAM_INVALID_PRICE", "Market price is unavailable");
        }
        try {
            String text = rawPrice.toString().trim();
            if (text.isEmpty()) {
                throw new NumberFormatException("empty price");
            }
            BigDecimal price = new BigDecimal(text);
            if (price.signum() <= 0 || price.compareTo(MAX_PRICE) > 0) {
                throw new ApiException(503, "UPSTREAM_INVALID_PRICE", "Market price is invalid");
            }
            return price.setScale(2, RoundingMode.HALF_UP);
        } catch (ApiException e) {
            throw e;
        } catch (NumberFormatException e) {
            throw new ApiException(503, "UPSTREAM_INVALID_PRICE", "Market price is invalid");
        }
    }
}

package com.apextrade.config;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class TradingModeGuardTest {

    private TradingModeGuard guard(String mode) throws Exception {
        TradingModeGuard guard = new TradingModeGuard();
        Field field = TradingModeGuard.class.getDeclaredField("tradingMode");
        field.setAccessible(true);
        field.set(guard, mode);
        return guard;
    }

    @Test
    void acceptsPaperCaseInsensitively() throws Exception {
        assertDoesNotThrow(() -> guard("PAPER").enforcePaperMode());
        assertDoesNotThrow(() -> guard("paper").enforcePaperMode());
    }

    @Test
    void refusesOtherOrBlankModes() throws Exception {
        assertThrows(IllegalStateException.class, () -> guard("LIVE").enforcePaperMode());
        assertThrows(IllegalStateException.class, () -> guard("SANDBOX").enforcePaperMode());
        assertThrows(IllegalStateException.class, () -> guard(" ").enforcePaperMode());
    }
}

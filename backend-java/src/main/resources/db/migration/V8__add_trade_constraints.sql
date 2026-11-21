ALTER TABLE wallets
    ADD CONSTRAINT chk_wallets_cash_balance_non_negative
    CHECK (cash_balance >= 0) NOT VALID;

ALTER TABLE positions
    ADD CONSTRAINT chk_positions_quantity_positive
    CHECK (quantity > 0) NOT VALID;

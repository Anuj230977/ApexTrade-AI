CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    average_cost DECIMAL(15,2) NOT NULL,

    CONSTRAINT fk_position_portfolio
        FOREIGN KEY(portfolio_id)
        REFERENCES portfolios(id)
        ON DELETE CASCADE,

    UNIQUE(portfolio_id, symbol)
);
CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL,
    total_value DECIMAL(15,2) DEFAULT 10000.00,
    total_return_percent DECIMAL(10,2) DEFAULT 0,

    CONSTRAINT fk_portfolio_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
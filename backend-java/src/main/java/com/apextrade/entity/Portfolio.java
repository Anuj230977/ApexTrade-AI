package com.apextrade.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "portfolios")
@Getter
@Setter
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", unique = true, nullable = false)
    private UUID userId;

    @Column(name = "total_value", precision = 15, scale = 2)
    private BigDecimal totalValue = new BigDecimal("10000.00");

    @Column(name = "total_return_percent", precision = 10, scale = 2)
    private BigDecimal totalReturnPercent = BigDecimal.ZERO;
}
package com.apextrade.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "positions")
@Getter
@Setter
public class Position {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "portfolio_id", nullable = false)
    private UUID portfolioId;

    @Column(name = "symbol", nullable = false)
    private String symbol;

    @Column(name = "quantity", precision = 15, scale = 4)
    private BigDecimal quantity;

    @Column(name = "average_cost", precision = 15, scale = 2)
    private BigDecimal averageCost;
}
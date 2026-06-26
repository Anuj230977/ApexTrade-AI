package com.apextrade.repository;

import com.apextrade.entity.Position;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PositionRepository extends JpaRepository<Position, UUID> {
    Optional<Position> findByPortfolioIdAndSymbol(UUID portfolioId, String symbol);
}
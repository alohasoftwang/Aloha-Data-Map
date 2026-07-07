package com.aloha.datamap.repository;

import com.aloha.datamap.entity.WbGdpValue;
import com.aloha.datamap.entity.WbIndicator;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WbGdpValueRepository
        extends JpaRepository<WbGdpValue, String>, JpaSpecificationExecutor<WbGdpValue> {

    long countByIndicator(WbIndicator indicator);

    @Query("""
            SELECT g FROM WbGdpValue g
            JOIN FETCH g.country c
            WHERE g.indicator = :indicator
              AND g.year = :year
              AND g.valueUsd IS NOT NULL
              AND c.region IS NOT NULL
            ORDER BY g.valueUsd DESC
            """)
    List<WbGdpValue> findTopByYear(
            @Param("indicator") WbIndicator indicator,
            @Param("year") Integer year);
}

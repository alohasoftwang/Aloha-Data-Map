package com.aloha.datamap.repository;

import com.aloha.datamap.entity.WbIndicator;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface WbIndicatorRepository
        extends JpaRepository<WbIndicator, String>, JpaSpecificationExecutor<WbIndicator> {

    Optional<WbIndicator> findByIndicatorCode(String indicatorCode);
}

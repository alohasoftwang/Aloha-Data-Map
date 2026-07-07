package com.aloha.datamap.repository;

import com.aloha.datamap.entity.WbCountry;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface WbCountryRepository
        extends JpaRepository<WbCountry, String>, JpaSpecificationExecutor<WbCountry> {

    Optional<WbCountry> findByCountryCode(String countryCode);
}

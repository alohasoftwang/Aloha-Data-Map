package com.aloha.datamap.config;

import com.aloha.datamap.service.WbDataImportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WbImportConfig {

    private static final Logger log = LoggerFactory.getLogger(WbImportConfig.class);

    @Bean
    CommandLineRunner importWorldBankData(
            WbDataImportService importService,
            @Value("${app.wb.import-on-startup:true}") boolean importOnStartup) {
        return args -> {
            if (!importOnStartup) {
                return;
            }
            if (importService.isImported()) {
                log.info("World Bank data already imported, skipping.");
                return;
            }
            try {
                var result = importService.importFromExcel();
                log.info(
                        "World Bank import complete: countries={}, indicators={}, gdpValues={}",
                        result.countries(),
                        result.indicators(),
                        result.gdpValues());
            } catch (Exception ex) {
                log.warn("World Bank import skipped: {}", ex.getMessage());
            }
        };
    }
}

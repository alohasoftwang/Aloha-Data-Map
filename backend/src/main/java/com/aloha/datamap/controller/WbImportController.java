package com.aloha.datamap.controller;

import com.aloha.datamap.service.WbDataImportService;
import com.aloha.datamap.service.WbDataImportService.ImportResult;
import java.io.IOException;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wb")
public class WbImportController {

    private final WbDataImportService importService;

    public WbImportController(WbDataImportService importService) {
        this.importService = importService;
    }

    @GetMapping("/status")
    public Map<String, Object> status() {
        return Map.of(
                "imported", importService.isImported(),
                "excelPath", importService.getExcelPath().toString());
    }

    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importExcel() throws IOException {
        ImportResult result = importService.importFromExcel();
        return ResponseEntity.ok(Map.of(
                "message", "World Bank data imported",
                "countries", result.countries(),
                "indicators", result.indicators(),
                "gdpValues", result.gdpValues(),
                "importedRows", result.importedRows()));
    }
}

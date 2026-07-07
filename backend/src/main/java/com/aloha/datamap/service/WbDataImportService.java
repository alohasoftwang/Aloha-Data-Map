package com.aloha.datamap.service;

import com.aloha.datamap.entity.WbCountry;
import com.aloha.datamap.entity.WbGdpValue;
import com.aloha.datamap.entity.WbIndicator;
import com.aloha.datamap.repository.WbCountryRepository;
import com.aloha.datamap.repository.WbGdpValueRepository;
import com.aloha.datamap.repository.WbIndicatorRepository;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import com.aloha.datamap.util.SnowflakeIdGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WbDataImportService {

    private static final String SHEET_DATA = "Data";
    private static final String SHEET_COUNTRIES = "Metadata - Countries";
    private static final String SHEET_INDICATORS = "Metadata - Indicators";
    private static final int HEADER_ROW_INDEX = 3;
    private static final int DATA_START_ROW = 4;

    private final WbCountryRepository countryRepository;
    private final WbIndicatorRepository indicatorRepository;
    private final WbGdpValueRepository gdpValueRepository;
    private final Path excelPath;
    private final SnowflakeIdGenerator idGenerator;
    private final DataFormatter formatter = new DataFormatter();

    public WbDataImportService(
            WbCountryRepository countryRepository,
            WbIndicatorRepository indicatorRepository,
            WbGdpValueRepository gdpValueRepository,
            SnowflakeIdGenerator idGenerator,
            @Value("${app.wb.excel-path}") String excelPath) {
        this.countryRepository = countryRepository;
        this.indicatorRepository = indicatorRepository;
        this.gdpValueRepository = gdpValueRepository;
        this.idGenerator = idGenerator;
        this.excelPath = Paths.get(excelPath).toAbsolutePath().normalize();
    }

    public boolean isImported() {
        return indicatorRepository.count() > 0
                && countryRepository.count() > 0
                && gdpValueRepository.count() > 0;
    }

    @Transactional
    public ImportResult importFromExcel() throws IOException {
        if (!Files.exists(excelPath)) {
            throw new IOException("Excel file not found: " + excelPath);
        }

        try (InputStream input = Files.newInputStream(excelPath);
             Workbook workbook = new HSSFWorkbook(input)) {

            importCountries(workbook.getSheet(SHEET_COUNTRIES));
            importIndicators(workbook.getSheet(SHEET_INDICATORS));
            int gdpRows = importGdpData(workbook.getSheet(SHEET_DATA));

            return new ImportResult(
                    countryRepository.count(),
                    indicatorRepository.count(),
                    gdpValueRepository.count(),
                    gdpRows);
        }
    }

    private void importCountries(Sheet sheet) {
        if (sheet == null) {
            return;
        }

        Map<String, WbCountry> countries = new HashMap<>();
        countryRepository.findAll().forEach(c -> countries.put(c.getCountryCode(), c));

        for (int r = 1; r <= sheet.getLastRowNum(); r++) {
            Row row = sheet.getRow(r);
            if (row == null) {
                continue;
            }

            String countryCode = cellText(row, 0);
            if (countryCode.isBlank()) {
                continue;
            }

            WbCountry country = countries.computeIfAbsent(countryCode, code -> {
                WbCountry created = new WbCountry();
                created.setId(idGenerator.nextId());
                created.setCountryCode(code);
                return created;
            });

            country.setRegion(emptyToNull(cellText(row, 1)));
            country.setIncomeGroup(emptyToNull(cellText(row, 2)));
            country.setTableName(emptyToNull(cellText(row, 4)));
            if (country.getCountryName() == null || country.getCountryName().isBlank()) {
                country.setCountryName(
                        country.getTableName() != null ? country.getTableName() : countryCode);
            }
        }

        countryRepository.saveAll(countries.values());
    }

    private void importIndicators(Sheet sheet) {
        if (sheet == null) {
            return;
        }

        for (int r = 1; r <= sheet.getLastRowNum(); r++) {
            Row row = sheet.getRow(r);
            if (row == null) {
                continue;
            }

            String indicatorCode = cellText(row, 0);
            if (indicatorCode.isBlank()) {
                continue;
            }

            WbIndicator indicator = indicatorRepository
                    .findByIndicatorCode(indicatorCode)
                    .orElseGet(() -> {
                        WbIndicator created = new WbIndicator();
                        created.setId(idGenerator.nextId());
                        created.setIndicatorCode(indicatorCode);
                        return created;
                    });

            indicator.setIndicatorName(cellText(row, 1));
            indicator.setSourceNote(emptyToNull(cellText(row, 2)));
            indicator.setSourceOrganization(emptyToNull(cellText(row, 3)));
            indicatorRepository.save(indicator);
        }
    }

    private int importGdpData(Sheet sheet) {
        if (sheet == null) {
            return 0;
        }

        Row headerRow = sheet.getRow(HEADER_ROW_INDEX);
        if (headerRow == null) {
            return 0;
        }

        List<YearColumn> yearColumns = new ArrayList<>();
        for (int c = 4; c < headerRow.getLastCellNum(); c++) {
            Integer year = parseYear(cellText(headerRow, c));
            if (year != null) {
                yearColumns.add(new YearColumn(c, year));
            }
        }

        Map<String, WbCountry> countriesByCode = new HashMap<>();
        countryRepository.findAll().forEach(c -> countriesByCode.put(c.getCountryCode(), c));

        Map<String, WbIndicator> indicatorsByCode = new HashMap<>();
        indicatorRepository.findAll().forEach(i -> indicatorsByCode.put(i.getIndicatorCode(), i));

        gdpValueRepository.deleteAll();

        List<WbGdpValue> batch = new ArrayList<>();
        int importedRows = 0;

        for (int r = DATA_START_ROW; r <= sheet.getLastRowNum(); r++) {
            Row row = sheet.getRow(r);
            if (row == null) {
                continue;
            }

            String countryName = cellText(row, 0);
            String countryCode = cellText(row, 1);
            String indicatorCode = cellText(row, 3);

            if (countryCode.isBlank() || indicatorCode.isBlank()) {
                continue;
            }

            WbCountry country = countriesByCode.get(countryCode);
            if (country == null) {
                country = new WbCountry();
                country.setId(idGenerator.nextId());
                country.setCountryCode(countryCode);
                country.setCountryName(countryName.isBlank() ? countryCode : countryName);
                country = countryRepository.save(country);
                countriesByCode.put(countryCode, country);
            } else if (countryName != null && !countryName.isBlank()) {
                country.setCountryName(countryName);
            }

            WbIndicator indicator = indicatorsByCode.get(indicatorCode);
            if (indicator == null) {
                indicator = new WbIndicator();
                indicator.setId(idGenerator.nextId());
                indicator.setIndicatorCode(indicatorCode);
                indicator.setIndicatorName(cellText(row, 2));
                indicator = indicatorRepository.save(indicator);
                indicatorsByCode.put(indicatorCode, indicator);
            }

            for (YearColumn yearColumn : yearColumns) {
                BigDecimal value = parseAmount(cellText(row, yearColumn.columnIndex()));
                if (value == null) {
                    continue;
                }

                WbGdpValue gdpValue = new WbGdpValue();
                gdpValue.setId(idGenerator.nextId());
                gdpValue.setCountry(country);
                gdpValue.setIndicator(indicator);
                gdpValue.setYear(yearColumn.year());
                gdpValue.setValueUsd(value);
                batch.add(gdpValue);
                importedRows++;

                if (batch.size() >= 500) {
                    gdpValueRepository.saveAll(batch);
                    batch.clear();
                }
            }
        }

        if (!batch.isEmpty()) {
            gdpValueRepository.saveAll(batch);
        }

        countryRepository.saveAll(countriesByCode.values());
        return importedRows;
    }

    private String cellText(Row row, int columnIndex) {
        Cell cell = row.getCell(columnIndex);
        if (cell == null) {
            return "";
        }
        return formatter.formatCellValue(cell).trim();
    }

    private Integer parseYear(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        try {
            return (int) Double.parseDouble(text);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private BigDecimal parseAmount(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }
        try {
            return BigDecimal.valueOf(Double.parseDouble(text));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private String emptyToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    public Path getExcelPath() {
        return excelPath;
    }

    private record YearColumn(int columnIndex, int year) {
    }

    public record ImportResult(long countries, long indicators, long gdpValues, int importedRows) {
    }
}

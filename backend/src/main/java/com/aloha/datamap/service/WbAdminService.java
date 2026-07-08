package com.aloha.datamap.service;

import com.aloha.datamap.dto.PageResponse;
import com.aloha.datamap.dto.WbAdminStatsDto;
import com.aloha.datamap.dto.WbCountryDto;
import com.aloha.datamap.dto.WbCountryRequest;
import com.aloha.datamap.dto.WbGdpValueDto;
import com.aloha.datamap.dto.WbGdpValueRequest;
import com.aloha.datamap.dto.WbIndicatorDto;
import com.aloha.datamap.dto.WbIndicatorRequest;
import com.aloha.datamap.entity.WbCountry;
import com.aloha.datamap.entity.WbGdpValue;
import com.aloha.datamap.entity.WbIndicator;
import com.aloha.datamap.repository.WbCountryRepository;
import com.aloha.datamap.repository.WbGdpValueRepository;
import com.aloha.datamap.repository.WbIndicatorRepository;
import com.aloha.datamap.util.SnowflakeIdGenerator;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class WbAdminService {

    private final WbCountryRepository countryRepository;
    private final WbIndicatorRepository indicatorRepository;
    private final WbGdpValueRepository gdpValueRepository;
    private final SnowflakeIdGenerator idGenerator;

    public WbAdminService(
            WbCountryRepository countryRepository,
            WbIndicatorRepository indicatorRepository,
            WbGdpValueRepository gdpValueRepository,
            SnowflakeIdGenerator idGenerator) {
        this.countryRepository = countryRepository;
        this.indicatorRepository = indicatorRepository;
        this.gdpValueRepository = gdpValueRepository;
        this.idGenerator = idGenerator;
    }

    @Transactional(readOnly = true)
    public WbAdminStatsDto getStats() {
        long countries = countryRepository.count();
        long indicators = indicatorRepository.count();
        long gdpValues = gdpValueRepository.count();
        return new WbAdminStatsDto(countries, indicators, gdpValues, countries > 0 && gdpValues > 0);
    }

    @Transactional(readOnly = true)
    public PageResponse<WbCountryDto> listCountries(String keyword, int page, int size) {
        Page<WbCountry> result = countryRepository.findAll(
                countryKeywordSpec(keyword),
                PageRequest.of(page, size, Sort.by("countryCode").ascending()));
        return toPage(result.map(this::toCountryDto));
    }

    @Transactional(readOnly = true)
    public WbCountryDto getCountry(String id) {
        return toCountryDto(findCountry(id));
    }

    public WbCountryDto createCountry(WbCountryRequest request) {
        validateCountryRequest(request);
        if (countryRepository.findByCountryCode(request.countryCode().trim()).isPresent()) {
            throw conflict("Entity code already exists: " + request.countryCode());
        }
        WbCountry country = new WbCountry();
        country.setId(idGenerator.nextId());
        applyCountry(country, request);
        return toCountryDto(countryRepository.save(country));
    }

    public WbCountryDto updateCountry(String id, WbCountryRequest request) {
        validateCountryRequest(request);
        WbCountry country = findCountry(id);
        countryRepository.findByCountryCode(request.countryCode().trim())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw conflict("Entity code already exists: " + request.countryCode());
                });
        applyCountry(country, request);
        return toCountryDto(countryRepository.save(country));
    }

    public void deleteCountry(String id) {
        WbCountry country = findCountry(id);
        countryRepository.delete(country);
    }

    @Transactional(readOnly = true)
    public PageResponse<WbIndicatorDto> listIndicators(String keyword, int page, int size) {
        Page<WbIndicator> result = indicatorRepository.findAll(
                indicatorKeywordSpec(keyword),
                PageRequest.of(page, size, Sort.by("indicatorCode").ascending()));
        return toPage(result.map(this::toIndicatorDto));
    }

    @Transactional(readOnly = true)
    public WbIndicatorDto getIndicator(String id) {
        return toIndicatorDto(findIndicator(id));
    }

    public WbIndicatorDto createIndicator(WbIndicatorRequest request) {
        validateIndicatorRequest(request);
        if (indicatorRepository.findByIndicatorCode(request.indicatorCode().trim()).isPresent()) {
            throw conflict("Indicator code already exists: " + request.indicatorCode());
        }
        WbIndicator indicator = new WbIndicator();
        indicator.setId(idGenerator.nextId());
        applyIndicator(indicator, request);
        return toIndicatorDto(indicatorRepository.save(indicator));
    }

    public WbIndicatorDto updateIndicator(String id, WbIndicatorRequest request) {
        validateIndicatorRequest(request);
        WbIndicator indicator = findIndicator(id);
        indicatorRepository.findByIndicatorCode(request.indicatorCode().trim())
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw conflict("Indicator code already exists: " + request.indicatorCode());
                });
        applyIndicator(indicator, request);
        return toIndicatorDto(indicatorRepository.save(indicator));
    }

    public void deleteIndicator(String id) {
        WbIndicator indicator = findIndicator(id);
        indicatorRepository.delete(indicator);
    }

    @Transactional(readOnly = true)
    public PageResponse<WbGdpValueDto> listGdpValues(
            String countryCode, Integer year, int page, int size) {
        Page<WbGdpValue> result = gdpValueRepository.findAll(
                gdpFilterSpec(countryCode, year),
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "year", "valueUsd")));
        return toPage(result.map(this::toGdpDto));
    }

    @Transactional(readOnly = true)
    public WbGdpValueDto getGdpValue(String id) {
        return toGdpDto(findGdpValue(id));
    }

    public WbGdpValueDto createGdpValue(WbGdpValueRequest request) {
        validateGdpRequest(request);
        WbCountry country = findCountry(request.countryId());
        WbIndicator indicator = findIndicator(request.indicatorId());
        ensureGdpUnique(country, indicator, request.gdpYear(), null);

        WbGdpValue gdpValue = new WbGdpValue();
        gdpValue.setId(idGenerator.nextId());
        gdpValue.setCountry(country);
        gdpValue.setIndicator(indicator);
        gdpValue.setYear(request.gdpYear());
        gdpValue.setValueUsd(request.valueUsd());
        return toGdpDto(gdpValueRepository.save(gdpValue));
    }

    public WbGdpValueDto updateGdpValue(String id, WbGdpValueRequest request) {
        validateGdpRequest(request);
        WbGdpValue gdpValue = findGdpValue(id);
        WbCountry country = findCountry(request.countryId());
        WbIndicator indicator = findIndicator(request.indicatorId());
        ensureGdpUnique(country, indicator, request.gdpYear(), id);

        gdpValue.setCountry(country);
        gdpValue.setIndicator(indicator);
        gdpValue.setYear(request.gdpYear());
        gdpValue.setValueUsd(request.valueUsd());
        return toGdpDto(gdpValueRepository.save(gdpValue));
    }

    public void deleteGdpValue(String id) {
        gdpValueRepository.delete(findGdpValue(id));
    }

    @Transactional(readOnly = true)
    public List<WbCountryDto> listAllCountriesBrief() {
        return countryRepository.findAll(Sort.by("countryCode")).stream()
                .map(this::toCountryDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WbIndicatorDto> listAllIndicatorsBrief() {
        return indicatorRepository.findAll(Sort.by("indicatorCode")).stream()
                .map(this::toIndicatorDto)
                .toList();
    }

    private Specification<WbCountry> countryKeywordSpec(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return cb.conjunction();
            }
            String pattern = "%" + keyword.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("countryCode")), pattern),
                    cb.like(cb.lower(root.get("countryName")), pattern),
                    cb.like(cb.lower(root.get("region")), pattern));
        };
    }

    private Specification<WbIndicator> indicatorKeywordSpec(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return cb.conjunction();
            }
            String pattern = "%" + keyword.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("indicatorCode")), pattern),
                    cb.like(cb.lower(root.get("indicatorName")), pattern));
        };
    }

    private Specification<WbGdpValue> gdpFilterSpec(String countryCode, Integer year) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (countryCode != null && !countryCode.isBlank()) {
                Join<WbGdpValue, WbCountry> country = root.join("country");
                predicates.add(cb.equal(country.get("countryCode"), countryCode.trim().toUpperCase()));
            }
            if (year != null) {
                predicates.add(cb.equal(root.get("year"), year));
            }
            query.distinct(true);
            return cb.and(predicates.toArray(Predicate[]::new));
        };
    }

    private void ensureGdpUnique(
            WbCountry country, WbIndicator indicator, Integer year, String excludeId) {
        Specification<WbGdpValue> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("country"), country));
            predicates.add(cb.equal(root.get("indicator"), indicator));
            predicates.add(cb.equal(root.get("year"), year));
            if (excludeId != null) {
                predicates.add(cb.notEqual(root.get("id"), excludeId));
            }
            return cb.and(predicates.toArray(Predicate[]::new));
        };
        if (gdpValueRepository.count(spec) > 0) {
            throw conflict("GDP record already exists for this entity, indicator and year");
        }
    }

    private void validateCountryRequest(WbCountryRequest request) {
        if (request.countryCode() == null || request.countryCode().isBlank()) {
            throw badRequest("countryCode is required");
        }
        if (request.countryName() == null || request.countryName().isBlank()) {
            throw badRequest("countryName is required");
        }
    }

    private void validateIndicatorRequest(WbIndicatorRequest request) {
        if (request.indicatorCode() == null || request.indicatorCode().isBlank()) {
            throw badRequest("indicatorCode is required");
        }
        if (request.indicatorName() == null || request.indicatorName().isBlank()) {
            throw badRequest("indicatorName is required");
        }
    }

    private void validateGdpRequest(WbGdpValueRequest request) {
        if (request.countryId() == null || request.countryId().isBlank()) {
            throw badRequest("countryId is required");
        }
        if (request.indicatorId() == null || request.indicatorId().isBlank()) {
            throw badRequest("indicatorId is required");
        }
        if (request.gdpYear() == null) {
            throw badRequest("gdpYear is required");
        }
    }

    private void applyCountry(WbCountry country, WbCountryRequest request) {
        country.setCountryCode(request.countryCode().trim().toUpperCase());
        country.setCountryName(request.countryName().trim());
        country.setRegion(emptyToNull(request.region()));
        country.setIncomeGroup(emptyToNull(request.incomeGroup()));
        country.setTableName(emptyToNull(request.tableName()));
    }

    private void applyIndicator(WbIndicator indicator, WbIndicatorRequest request) {
        indicator.setIndicatorCode(request.indicatorCode().trim());
        indicator.setIndicatorName(request.indicatorName().trim());
        indicator.setSourceNote(emptyToNull(request.sourceNote()));
        indicator.setSourceOrganization(emptyToNull(request.sourceOrganization()));
    }

    private WbCountry findCountry(String id) {
        return countryRepository.findById(id)
                .orElseThrow(() -> notFound("Entity not found: " + id));
    }

    private WbIndicator findIndicator(String id) {
        return indicatorRepository.findById(id)
                .orElseThrow(() -> notFound("Indicator not found: " + id));
    }

    private WbGdpValue findGdpValue(String id) {
        return gdpValueRepository.findById(id)
                .orElseThrow(() -> notFound("GDP value not found: " + id));
    }

    private WbCountryDto toCountryDto(WbCountry country) {
        return new WbCountryDto(
                country.getId(),
                country.getCountryCode(),
                country.getCountryName(),
                country.getRegion(),
                country.getIncomeGroup(),
                country.getTableName());
    }

    private WbIndicatorDto toIndicatorDto(WbIndicator indicator) {
        return new WbIndicatorDto(
                indicator.getId(),
                indicator.getIndicatorCode(),
                indicator.getIndicatorName(),
                indicator.getSourceNote(),
                indicator.getSourceOrganization());
    }

    private WbGdpValueDto toGdpDto(WbGdpValue gdpValue) {
        WbCountry country = gdpValue.getCountry();
        WbIndicator indicator = gdpValue.getIndicator();
        return new WbGdpValueDto(
                gdpValue.getId(),
                country.getId(),
                country.getCountryCode(),
                country.getCountryName(),
                indicator.getId(),
                indicator.getIndicatorCode(),
                gdpValue.getYear(),
                gdpValue.getValueUsd());
    }

    private <T> PageResponse<T> toPage(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages());
    }

    private String emptyToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }

    private ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }
}

package com.aloha.datamap.controller;

import com.aloha.datamap.dto.PageResponse;
import com.aloha.datamap.dto.WbAdminStatsDto;
import com.aloha.datamap.dto.WbCountryDto;
import com.aloha.datamap.dto.WbCountryRequest;
import com.aloha.datamap.dto.WbGdpValueDto;
import com.aloha.datamap.dto.WbGdpValueRequest;
import com.aloha.datamap.dto.WbIndicatorDto;
import com.aloha.datamap.dto.WbIndicatorRequest;
import com.aloha.datamap.service.WbAdminService;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wb/admin")
public class WbAdminController {

    private final WbAdminService adminService;

    public WbAdminController(WbAdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public WbAdminStatsDto stats() {
        return adminService.getStats();
    }

    @GetMapping("/countries")
    public PageResponse<WbCountryDto> listCountries(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String codes,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return adminService.listCountries(keyword, codes, page, size);
    }

    @GetMapping("/countries/all")
    public List<WbCountryDto> listAllCountries() {
        return adminService.listAllCountriesBrief();
    }

    @GetMapping("/countries/{id}")
    public WbCountryDto getCountry(@PathVariable String id) {
        return adminService.getCountry(id);
    }

    @PostMapping("/countries")
    public WbCountryDto createCountry(@RequestBody WbCountryRequest request) {
        return adminService.createCountry(request);
    }

    @PutMapping("/countries/{id}")
    public WbCountryDto updateCountry(@PathVariable String id, @RequestBody WbCountryRequest request) {
        return adminService.updateCountry(id, request);
    }

    @DeleteMapping("/countries/{id}")
    public void deleteCountry(@PathVariable String id) {
        adminService.deleteCountry(id);
    }

    @GetMapping("/indicators")
    public PageResponse<WbIndicatorDto> listIndicators(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return adminService.listIndicators(keyword, page, size);
    }

    @GetMapping("/indicators/all")
    public List<WbIndicatorDto> listAllIndicators() {
        return adminService.listAllIndicatorsBrief();
    }

    @GetMapping("/indicators/{id}")
    public WbIndicatorDto getIndicator(@PathVariable String id) {
        return adminService.getIndicator(id);
    }

    @PostMapping("/indicators")
    public WbIndicatorDto createIndicator(@RequestBody WbIndicatorRequest request) {
        return adminService.createIndicator(request);
    }

    @PutMapping("/indicators/{id}")
    public WbIndicatorDto updateIndicator(@PathVariable String id, @RequestBody WbIndicatorRequest request) {
        return adminService.updateIndicator(id, request);
    }

    @DeleteMapping("/indicators/{id}")
    public void deleteIndicator(@PathVariable String id) {
        adminService.deleteIndicator(id);
    }

    @GetMapping("/gdp-values")
    public PageResponse<WbGdpValueDto> listGdpValues(
            @RequestParam(required = false) String countryCode,
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return adminService.listGdpValues(countryCode, year, page, size);
    }

    @GetMapping("/gdp-values/{id}")
    public WbGdpValueDto getGdpValue(@PathVariable String id) {
        return adminService.getGdpValue(id);
    }

    @PostMapping("/gdp-values")
    public WbGdpValueDto createGdpValue(@RequestBody WbGdpValueRequest request) {
        return adminService.createGdpValue(request);
    }

    @PutMapping("/gdp-values/{id}")
    public WbGdpValueDto updateGdpValue(@PathVariable String id, @RequestBody WbGdpValueRequest request) {
        return adminService.updateGdpValue(id, request);
    }

    @DeleteMapping("/gdp-values/{id}")
    public void deleteGdpValue(@PathVariable String id) {
        adminService.deleteGdpValue(id);
    }
}

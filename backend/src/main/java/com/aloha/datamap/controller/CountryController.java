package com.aloha.datamap.controller;

import com.aloha.datamap.dto.WbCountryDto;
import com.aloha.datamap.dto.CountryYearGdpDto;
import com.aloha.datamap.service.WbAdminService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/countries")
public class CountryController {

    private final WbAdminService adminService;

    public CountryController(WbAdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping
    public List<WbCountryDto> listCountries() {
        return adminService.listCountriesForCatalog();
    }

    @GetMapping("/gdp-by-year")
    public List<CountryYearGdpDto> listGdpByYear(
            @RequestParam(defaultValue = "2025") int year) {
        return adminService.listGdpByYear(year);
    }
}

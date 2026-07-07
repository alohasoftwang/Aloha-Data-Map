package com.aloha.datamap.dto;

public record WbCountryDto(
        String id,
        String countryCode,
        String countryName,
        String region,
        String incomeGroup,
        String tableName) {
}

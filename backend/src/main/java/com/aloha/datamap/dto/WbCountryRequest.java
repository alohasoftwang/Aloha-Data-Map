package com.aloha.datamap.dto;

public record WbCountryRequest(
        String countryCode,
        String countryName,
        String region,
        String incomeGroup,
        String tableName) {
}

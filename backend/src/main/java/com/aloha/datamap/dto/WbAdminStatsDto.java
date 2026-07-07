package com.aloha.datamap.dto;

public record WbAdminStatsDto(
        long countryCount,
        long indicatorCount,
        long gdpValueCount,
        boolean imported) {
}

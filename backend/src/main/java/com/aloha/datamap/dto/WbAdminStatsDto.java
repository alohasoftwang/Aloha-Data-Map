package com.aloha.datamap.dto;

public record WbAdminStatsDto(
        long entityCount,
        long indicatorCount,
        long gdpValueCount,
        boolean imported) {
}

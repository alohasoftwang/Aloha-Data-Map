package com.aloha.datamap.dto;

import java.math.BigDecimal;

public record WbGdpValueDto(
        String id,
        String countryId,
        String countryCode,
        String countryName,
        String indicatorId,
        String indicatorCode,
        Integer gdpYear,
        BigDecimal valueUsd) {
}

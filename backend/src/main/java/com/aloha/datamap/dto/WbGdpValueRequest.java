package com.aloha.datamap.dto;

import java.math.BigDecimal;

public record WbGdpValueRequest(
        String countryId,
        String indicatorId,
        Integer gdpYear,
        BigDecimal valueUsd) {
}

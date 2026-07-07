package com.aloha.datamap.dto;

public record WbIndicatorDto(
        String id,
        String indicatorCode,
        String indicatorName,
        String sourceNote,
        String sourceOrganization) {
}

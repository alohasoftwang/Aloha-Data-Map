package com.aloha.datamap.dto;

public record WbIndicatorRequest(
        String indicatorCode,
        String indicatorName,
        String sourceNote,
        String sourceOrganization) {
}

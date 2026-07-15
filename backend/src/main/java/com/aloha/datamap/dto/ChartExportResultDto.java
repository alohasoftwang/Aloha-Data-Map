package com.aloha.datamap.dto;

import java.util.List;

public record ChartExportResultDto(
        String message,
        List<ExportedFile> files
) {
    public record ExportedFile(
            String id,
            String path,
            int startYear,
            int endYear,
            int entityCount,
            int rowCount
    ) {
    }
}

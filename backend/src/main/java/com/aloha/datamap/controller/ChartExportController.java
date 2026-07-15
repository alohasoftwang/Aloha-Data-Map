package com.aloha.datamap.controller;

import com.aloha.datamap.dto.ChartExportResultDto;
import com.aloha.datamap.service.ChartJsonExportService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/charts")
public class ChartExportController {

    private final ChartJsonExportService exportService;

    public ChartExportController(ChartJsonExportService exportService) {
        this.exportService = exportService;
    }

    /** 从数据库重新生成全部图表 JSON，写入本地 public/data */
    @PostMapping("/refresh")
    public ChartExportResultDto refresh() {
        return exportService.exportAll();
    }

    /** 只刷新指定图表 JSON，例如 asia-gdp-top15 */
    @PostMapping("/refresh/{chartId}")
    public ChartExportResultDto refreshOne(@PathVariable String chartId) {
        return exportService.exportOne(chartId);
    }
}

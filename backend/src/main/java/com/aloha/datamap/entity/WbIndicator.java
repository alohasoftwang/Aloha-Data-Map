package com.aloha.datamap.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "wb_indicator")
public class WbIndicator {

    @Id
    @Column(length = 20)
    private String id;

    @Column(name = "indicator_code", nullable = false, unique = true, length = 32)
    private String indicatorCode;

    @Column(name = "indicator_name", nullable = false, length = 256)
    private String indicatorName;

    @Lob
    @Column(name = "source_note")
    private String sourceNote;

    @Lob
    @Column(name = "source_organization")
    private String sourceOrganization;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getIndicatorCode() {
        return indicatorCode;
    }

    public void setIndicatorCode(String indicatorCode) {
        this.indicatorCode = indicatorCode;
    }

    public String getIndicatorName() {
        return indicatorName;
    }

    public void setIndicatorName(String indicatorName) {
        this.indicatorName = indicatorName;
    }

    public String getSourceNote() {
        return sourceNote;
    }

    public void setSourceNote(String sourceNote) {
        this.sourceNote = sourceNote;
    }

    public String getSourceOrganization() {
        return sourceOrganization;
    }

    public void setSourceOrganization(String sourceOrganization) {
        this.sourceOrganization = sourceOrganization;
    }
}

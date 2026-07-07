package com.aloha.datamap.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "wb_country")
public class WbCountry {

    @Id
    @Column(length = 20)
    private String id;

    @Column(name = "country_code", nullable = false, unique = true, length = 3)
    private String countryCode;

    @Column(name = "country_name", nullable = false, length = 128)
    private String countryName;

    @Column(length = 64)
    private String region;

    @Column(name = "income_group", length = 32)
    private String incomeGroup;

    @Column(name = "table_name", length = 128)
    private String tableName;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCountryCode() {
        return countryCode;
    }

    public void setCountryCode(String countryCode) {
        this.countryCode = countryCode;
    }

    public String getCountryName() {
        return countryName;
    }

    public void setCountryName(String countryName) {
        this.countryName = countryName;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getIncomeGroup() {
        return incomeGroup;
    }

    public void setIncomeGroup(String incomeGroup) {
        this.incomeGroup = incomeGroup;
    }

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }
}

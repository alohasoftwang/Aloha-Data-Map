package com.aloha.datamap.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;

@Entity
@Table(
        name = "wb_gdp_value",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_wb_gdp_country_indicator_year",
                columnNames = {"country_id", "indicator_id", "gdp_year"}
        )
)
public class WbGdpValue {

    @Id
    @Column(length = 20)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "country_id", nullable = false)
    private WbCountry country;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "indicator_id", nullable = false)
    private WbIndicator indicator;

    @Column(name = "gdp_year", nullable = false)
    private Integer year;

    @Column(name = "value_usd", precision = 24, scale = 2)
    private BigDecimal valueUsd;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public WbCountry getCountry() {
        return country;
    }

    public void setCountry(WbCountry country) {
        this.country = country;
    }

    public WbIndicator getIndicator() {
        return indicator;
    }

    public void setIndicator(WbIndicator indicator) {
        this.indicator = indicator;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public BigDecimal getValueUsd() {
        return valueUsd;
    }

    public void setValueUsd(BigDecimal valueUsd) {
        this.valueUsd = valueUsd;
    }
}

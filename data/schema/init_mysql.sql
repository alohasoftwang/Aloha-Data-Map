-- =============================================================================
-- Aloha Data Map — MySQL 数据库初始化脚本
-- =============================================================================
--
-- 用途：创建数据库及世界银行 GDP 相关表结构
--
-- 执行方式（任选其一）：
--
--   1) 命令行
--      mysql -u root -p < data/schema/init_mysql.sql
--
--   2) MySQL Workbench
--      打开本文件 → 全选 → 执行
--
-- 说明：
--   - 表结构由 JPA 也会自动创建（ddl-auto=update），本脚本供手动初始化或核对
--   - 数据导入：执行 data/schema/import_data.sql（由 scripts/generate_import_sql.py 从 Excel 生成）
--   - Excel 源文件：data/world-bank.xls
--
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. 创建数据库
-- -----------------------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS aloha_datamap
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE aloha_datamap;


-- -----------------------------------------------------------------------------
-- 2. 国家/地区表 wb_country
--    来源：世界银行.xls → Metadata - Countries
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS wb_country (
    id            VARCHAR(20)  NOT NULL                COMMENT '主键（雪花算法，字符串）',
    country_code  VARCHAR(3)   NOT NULL                COMMENT '世界银行三字码，如 CHN、USA',
    country_name  VARCHAR(128) NOT NULL                COMMENT '国家/地区英文名',
    region        VARCHAR(64)  NULL                    COMMENT '区域，如 East Asia & Pacific',
    income_group  VARCHAR(32)  NULL                    COMMENT '收入分组，如 High income',
    table_name    VARCHAR(128) NULL                    COMMENT '元数据 TableName',
    PRIMARY KEY (id),
    CONSTRAINT uk_wb_country_code UNIQUE (country_code)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='世界银行国家/地区元数据';


-- -----------------------------------------------------------------------------
-- 3. 指标表 wb_indicator
--    来源：世界银行.xls → Metadata - Indicators
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS wb_indicator (
    id                   VARCHAR(20)  NOT NULL                COMMENT '主键（雪花算法，字符串）',
    indicator_code       VARCHAR(32)  NOT NULL                COMMENT '指标代码，如 NY.GDP.MKTP.CD',
    indicator_name       VARCHAR(256) NOT NULL                COMMENT '指标名称',
    source_note          LONGTEXT     NULL                    COMMENT '指标说明',
    source_organization  LONGTEXT     NULL                    COMMENT '数据来源机构',
    PRIMARY KEY (id),
    CONSTRAINT uk_wb_indicator_code UNIQUE (indicator_code)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='世界银行指标元数据';


-- -----------------------------------------------------------------------------
-- 4. GDP 事实表 wb_gdp_value（核心）
--    来源：世界银行.xls → Data（宽表转窄表）
--    单位：value_usd 为美元（USD），前端展示需 ÷ 1,000,000 得到 million $
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS wb_gdp_value (
    id            VARCHAR(20)   NOT NULL                COMMENT '主键（雪花算法，字符串）',
    country_id    VARCHAR(20)   NOT NULL                COMMENT '关联 wb_country.id',
    indicator_id  VARCHAR(20)   NOT NULL                COMMENT '关联 wb_indicator.id',
    gdp_year      SMALLINT      NOT NULL                COMMENT '年份，1960–2025',
    value_usd     DECIMAL(24,2) NULL                    COMMENT 'GDP 现值（美元）',
    PRIMARY KEY (id),
    CONSTRAINT uk_wb_gdp_country_indicator_year
        UNIQUE (country_id, indicator_id, gdp_year),
    CONSTRAINT fk_wb_gdp_country
        FOREIGN KEY (country_id) REFERENCES wb_country (id),
    CONSTRAINT fk_wb_gdp_indicator
        FOREIGN KEY (indicator_id) REFERENCES wb_indicator (id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='GDP 年度数据（一国一年一行）';


-- -----------------------------------------------------------------------------
-- 5. 索引
-- -----------------------------------------------------------------------------

CREATE INDEX idx_wb_gdp_year
    ON wb_gdp_value (gdp_year);

CREATE INDEX idx_wb_gdp_country_year
    ON wb_gdp_value (country_id, gdp_year);


-- -----------------------------------------------------------------------------
-- 完成
-- -----------------------------------------------------------------------------
-- 下一步：
--   1. 配置 backend/src/main/resources/application.properties 中的 MySQL 账号密码
--   2. 启动后端：cd backend && mvn spring-boot:run
--   3. 首次启动将自动从 data/world-bank.xls 导入数据
-- =============================================================================

-- =============================================================================
-- 已有表迁移：主键改为 VARCHAR 雪花 ID
-- =============================================================================
--
-- 执行：mysql -u root -p aloha_datamap < data/schema/migrate_snowflake_id.sql
-- 然后：mysql -u root -p aloha_datamap < data/schema/import_data_only.sql
--
-- =============================================================================

USE aloha_datamap;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE wb_gdp_value;
TRUNCATE TABLE wb_country;
TRUNCATE TABLE wb_indicator;

ALTER TABLE wb_country
    MODIFY id VARCHAR(20) NOT NULL COMMENT '主键（雪花算法，字符串）';

ALTER TABLE wb_indicator
    MODIFY id VARCHAR(20) NOT NULL COMMENT '主键（雪花算法，字符串）';

ALTER TABLE wb_gdp_value
    MODIFY id VARCHAR(20) NOT NULL COMMENT '主键（雪花算法，字符串）',
    MODIFY country_id VARCHAR(20) NOT NULL COMMENT '关联 wb_country.id',
    MODIFY indicator_id VARCHAR(20) NOT NULL COMMENT '关联 wb_indicator.id';

SET FOREIGN_KEY_CHECKS = 1;

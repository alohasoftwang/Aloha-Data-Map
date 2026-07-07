-- =============================================================================
-- Aloha Data Map — 清空世界银行 GDP 表（重置用）
-- =============================================================================
--
-- 警告：将删除所有已导入的 GDP 数据！执行后需重启后端重新导入。
--
-- 执行：mysql -u root -p aloha_datamap < data/schema/reset_mysql.sql
--
-- =============================================================================

USE aloha_datamap;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS wb_gdp_value;
DROP TABLE IF EXISTS wb_country;
DROP TABLE IF EXISTS wb_indicator;

SET FOREIGN_KEY_CHECKS = 1;

-- 重新建表请执行：init_mysql.sql
-- 重新导入数据请重启后端，或 POST /api/wb/import

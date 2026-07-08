# 世界银行 GDP 数据库设计

本文档描述用于存储 `data/世界银行.xls` 中 World Development Indicators 数据的关系型数据库结构。

---

## 1. 数据源说明

### Excel 文件结构（`世界银行.xls`）

| Sheet | 行数 | 说明 |
|-------|------|------|
| **Data** | 269 | 主数据：各经济体 GDP 按年份展开 |
| **Metadata - Entities** | 265 | 经济体元数据（区域、收入分组等） |
| **Metadata - Indicators** | 2 | 指标元数据 |

### Data 表列结构

```
Row 0-2 : 文件元信息（数据来源、更新日期）
Row 3   : 表头
Row 4+  : 数据行
```

| 列 | 字段 | 示例 |
|----|------|------|
| A | Entity Name | China |
| B | Entity Code | CHN |
| C | Indicator Name | GDP (current US$) |
| D | Indicator Code | NY.GDP.MKTP.CD |
| E+ | 1960 … 2025 | 各年 GDP 数值（美元） |

- **指标**：`NY.GDP.MKTP.CD` = GDP (current US$)，名义 GDP，单位 **美元（USD）**
- **年份范围**：1960 – 2025（共 66 年）
- **经济体数量**：约 265 条（含部分区域合计行，如 AFE、AFW）

### 数值单位换算

| 存储字段 | 单位 | 与前端关系 |
|----------|------|------------|
| `value_usd` | 美元（世界银行原始值） | 数据库原样保存 |
| 前端展示 | million USD | `value_usd / 1_000_000` |

示例：

| 经济体 | 年份 | value_usd | 前端 million $ |
|------|------|-----------|----------------|
| China | 1985 | 310,064,625,850 | 310,065 |
| United States | 2024 | 29,298,013,000,000 | 29,298,013 |

---

## 2. ER 关系图

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│   wb_country    │       │   wb_gdp_value   │       │  wb_indicator   │
├─────────────────┤       ├──────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)          │    ┌──│ id (PK)         │
│ country_code UK │  └───>│ country_id (FK)  │    │  │ indicator_code  │
│ country_name    │       │ indicator_id(FK) │<───┘  │ indicator_name  │
│ region          │       │ year             │       │ source_note     │
│ income_group    │       │ value_usd        │       │ source_org      │
│ table_name      │       │                  │       └─────────────────┘
└─────────────────┘       └──────────────────┘
                                    │
                          UNIQUE(country_id, indicator_id, year)
```

---

## 3. 表结构

### 3.1 `wb_country` — 经济体（世行原始表名保留）

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 主键 |
| country_code | VARCHAR(3) | NOT NULL, UNIQUE | 世界银行三字码，如 CHN、USA |
| country_name | VARCHAR(128) | NOT NULL | 英文名称 |
| region | VARCHAR(64) | NULL | 区域，如 East Asia & Pacific |
| income_group | VARCHAR(32) | NULL | 收入分组，如 High income |
| table_name | VARCHAR(128) | NULL | 元数据中的 TableName |

### 3.2 `wb_indicator` — 指标

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 主键 |
| indicator_code | VARCHAR(32) | NOT NULL, UNIQUE | 如 NY.GDP.MKTP.CD |
| indicator_name | VARCHAR(256) | NOT NULL | 指标名称 |
| source_note | CLOB | NULL | 指标说明 |
| source_organization | CLOB | NULL | 数据来源机构 |

### 3.3 `wb_gdp_value` — GDP 事实表（核心）

| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 主键 |
| country_id | BIGINT | NOT NULL, FK → wb_country | 经济体 |
| indicator_id | BIGINT | NOT NULL, FK → wb_indicator | 指标 |
| gdp_year | SMALLINT | NOT NULL | 年份，1960–2025 |
| value_usd | DECIMAL(24,2) | NULL | GDP 现值美元；空表示该年无数据 |

**唯一约束**：`(country_id, indicator_id, gdp_year)` — 一实体一年一指标仅一条记录。

**索引建议**：

- `idx_gdp_year` ON `(gdp_year)`
- `idx_gdp_country_year` ON `(country_id, gdp_year)`

---

## 4. 典型查询

### 某年 GDP TOP 10（全球）

```sql
SELECT c.country_name, c.country_code, g.value_usd
FROM wb_gdp_value g
JOIN wb_country c ON c.id = g.country_id
JOIN wb_indicator i ON i.id = g.indicator_id
WHERE g.gdp_year = 2024
  AND i.indicator_code = 'NY.GDP.MKTP.CD'
  AND g.value_usd IS NOT NULL
  AND c.region IS NOT NULL          -- 排除区域合计行（可选）
ORDER BY g.value_usd DESC
LIMIT 10;
```

### 某实体历年 GDP

```sql
SELECT g.year, g.value_usd
FROM wb_gdp_value g
JOIN wb_country c ON c.id = g.country_id
WHERE c.country_code = 'CHN'
ORDER BY g.gdp_year;
```

### 亚洲经济体某年 GDP（按区域筛选）

```sql
SELECT c.country_name, g.value_usd
FROM wb_gdp_value g
JOIN wb_country c ON c.id = g.country_id
WHERE g.gdp_year = 2024
  AND c.region LIKE '%Asia%'
ORDER BY g.value_usd DESC;
```

---

## 5. 导入流程

```
世界银行.xls
    │
    ├─ Metadata - Entities  ──> wb_country
    ├─ Metadata - Indicators ──> wb_indicator
    └─ Data (宽表)           ──> wb_gdp_value (窄表：一实体一年一行)
```

后端启动时可自动导入（配置 `app.wb.import-on-startup=true`），或手动调用：

```
POST /api/wb/import
```

导入文件路径（默认）：`data/world-bank.xls`（与 `data/世界银行.xls` 内容相同，建议使用英文文件名避免编码问题）

### 补充经济体（世行 Excel 未包含）

| 代码 | 说明 | 数据文件 | 收集 / 导入 |
|------|------|----------|-------------|
| `SUN` | 苏联（1991 年前） | `data/ussr_gdp_usd.json` | `python scripts/import_ussr_gdp.py` |
| `TWN` | `TWN` | `data/twn_gdp_usd.json` | 见下方 |

**`TWN`**：世行 `世界银行.xls` / WDI 公开 Excel **不含** `TWN`。需单独收集后写入库：

```bash
# 1. 拉取 IMF WEO 名义 GDP（1980+）并合并 1960-1979 补充序列
python scripts/fetch_twn_gdp.py

# 2. 写入 MySQL
python scripts/import_twn_gdp.py

# 3. 重新生成图表 JSON
python scripts/generate_asia_gdp_top15.py
python scripts/generate_world_gdp_top10.py
```

| 年份段 | 来源 |
|--------|------|
| 1960–1979 | `data/twn_gdp_supplement_1960_1979.json`（IMF WEO 历史名义美元，可手工校对） |
| 1980–最新 | IMF DataMapper `NGDPD`（[API](https://www.imf.org/external/datamapper/api/v1/NGDPD/TWN)，现价美元） |

指标口径与主库一致：`NY.GDP.MKTP.CD`（GDP, current US$）。`TWN` 在 `wb_country.region` 记为 `East Asia & Pacific`。

---

## 6. 与前端图表数据映射

前端 `bar-race` 所需 JSON 可由数据库查询生成：

| 前端字段 | 数据库来源 |
|----------|------------|
| dataset[].GDP | `value_usd / 1_000_000` |
| dataset[].Entity | `country_name`（可转大写） |
| dataset[].Year | `year` |
| entityCodes | `country_code` 映射为 ISO2（需额外映射表或配置） |
| entityFlagImages | `/flags/{iso2}.png` |

> 世界银行使用 ISO3（CHN），国旗常用 ISO2（cn），导入或 API 层需维护 `CHN → cn` 映射。

---

## 7. 文件位置

| 文件 | 说明 |
|------|------|
| `data/世界银行.xls` | 原始 Excel 数据 |
| `data/world-bank.xls` | 程序读取用的 Excel（英文文件名） |
| `data/schema/init_mysql.sql` | **MySQL 一键初始化**（建库 + 建表 + 索引） |
| `data/schema/reset_mysql.sql` | 清空表（重置用） |
| `backend/.../application.properties` | MySQL 连接配置 |
| `backend/.../entity/Wb*.java` | JPA 实体 |
| `backend/.../service/WbDataImportService.java` | Excel 导入服务 |

---

## 8. 数据库配置（MySQL）

当前默认使用 **MySQL**，PostgreSQL 就绪后只需改 `application.properties` 数据源。

### 1. 创建数据库与表

执行一键初始化脚本：

```bash
mysql -u root -p < data/schema/init_mysql.sql
```

或在 MySQL Workbench 中打开 `data/schema/init_mysql.sql` 执行。

脚本内容包括：
- 创建数据库 `aloha_datamap`（utf8mb4）
- 创建表 `wb_country`、`wb_indicator`、`wb_gdp_value`
- 创建索引

如需清空重来：

```bash
mysql -u root -p < data/schema/reset_mysql.sql
mysql -u root -p < data/schema/init_mysql.sql
```

### 2. 配置连接

编辑 `backend/src/main/resources/application.properties`：

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/aloha_datamap?...
spring.datasource.username=root
spring.datasource.password=你的密码
```

或复制 `application-local.properties.example` 为 `application-local.properties` 覆盖账号密码。

### 3. 启动并自动导入

```bash
cd backend
mvn spring-boot:run
```

首次启动会自动从 `data/world-bank.xls` 导入数据。

---

## 9. 后续扩展（可选）

- `wb_country_iso2`：ISO3 → ISO2 映射，用于国旗
- `chart_dataset`：预生成的图表 JSON 缓存
- 支持 PostgreSQL：替换 `application.properties` 数据源即可，表结构不变

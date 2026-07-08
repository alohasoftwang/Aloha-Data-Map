# 数据格式说明

本文档描述 **动态排序柱状图（bar-race）** 所需的数据结构，供准备 `data/*.json` 或后端 API 返回数据时参考。

当前前端示例：**TOP 10 ASIA GDP**（`frontend/src/mock/asia-gdp.js`）。

---

## 1. 文件位置

| 方式 | 路径 / 接口 |
|------|-------------|
| 静态 JSON | `data/asia-gdp.json` |
| 前端模拟数据 | `frontend/src/mock/asia-gdp.js` |
| 后端 API（可选） | `GET /api/asia-gdp` |

---

## 2. 根对象字段

```json
{
  "id": "asia-gdp",
  "title": "TOP 10 ASIA GDP",
  "unit": "(IN MILLION $)",
  "chartType": "bar-race",
  "updateFrequency": 1500,
  "maxBars": 10,
  "startYear": 1985,
  "endYear": 2024,
  "years": [1985, 1986, "...", 2024],
  "entityColors": { },
  "entityCodes": { },
  "entityFlagImages": { },
  "dataset": [ ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 图表唯一标识，如 `asia-gdp` |
| `title` | string | 是 | 主标题，建议英文大写 |
| `unit` | string | 否 | 单位说明，显示在标题后，如 `(IN MILLION $)` |
| `chartType` | string | 是 | 固定为 `bar-race` |
| `updateFrequency` | number | 是 | 每年切换间隔（毫秒），如 `1500` = 1.5 秒 |
| `maxBars` | number | 是 | 同时显示的排名数量，当前为 `10` |
| `startYear` | number | 是 | 动画起始年份 |
| `endYear` | number | 是 | 动画结束年份 |
| `years` | number[] | 是 | 所有年份列表，需连续，如 `[1985, 1986, ..., 2024]` |
| `entityColors` | object | 是 | 经济体名 → 柱条颜色（十六进制） |
| `entityCodes` | object | 是 | 经济体名 → ISO 两位代码（小写） |
| `entityFlagImages` | object | 是 | 经济体名 → 国旗图片 URL 路径 |
| `dataset` | array | 是 | ECharts 数据集，见下文 |

---

## 3. dataset 格式（核心）

`dataset` 是 **二维表**，第一行为表头，之后每行一条记录。

### 表头（固定顺序）

```json
["GDP", "Entity", "Year"]
```

| 列序号 | 列名 | 类型 | 说明 |
|--------|------|------|------|
| 0 | GDP | number | 数值，单位与 `unit` 一致（当前为 **百万美元**） |
| 1 | Entity | string | 经济体名称，建议英文大写，如 `CHINA` |
| 2 | Year | number | 年份，如 `2024` |

### 数据行示例

```json
[18270000, "CHINA", 2024],
[4110000, "JAPAN", 2024],
[310000, "CHINA", 1985]
```

### 完整性要求

- **每个经济体 × 每个年份** 都应有一条记录
- 若有 15 个经济体、40 年，则应有 `15 × 40 = 600` 条数据行（不含表头）
- 同一 `(Entity, Year)` 组合不能重复
- `Year` 必须落在 `startYear` ~ `endYear` 范围内
- `years` 数组应与数据中的年份一致

---

## 4. 经济体元数据

### entityColors

柱条颜色，键为经济体名（与 dataset 中 `Entity` 完全一致）：

```json
{
  "CHINA": "#e85d6a",
  "JAPAN": "#c77dba",
  "INDIA": "#f0a070"
}
```

### entityCodes

ISO 3166-1 alpha-2 两位代码（小写），用于匹配国旗文件：

```json
{
  "CHINA": "cn",
  "JAPAN": "jp",
  "SOUTH KOREA": "kr"
}
```

### entityFlagImages

国旗图片路径，通常放在 `frontend/public/flags/`：

```json
{
  "CHINA": "/flags/cn.png",
  "JAPAN": "/flags/jp.png",
  "SOUTH KOREA": "/flags/kr.png"
}
```

**国旗文件命名**：`{code}.png`，例如 `cn.png`、`jp.png`。

---

## 5. 完整示例（精简版）

```json
{
  "id": "asia-gdp",
  "title": "TOP 10 ASIA GDP",
  "unit": "(IN MILLION $)",
  "chartType": "bar-race",
  "updateFrequency": 1500,
  "maxBars": 10,
  "startYear": 1985,
  "endYear": 1987,
  "years": [1985, 1986, 1987],
  "entityColors": {
    "CHINA": "#e85d6a",
    "JAPAN": "#c77dba"
  },
  "entityCodes": {
    "CHINA": "cn",
    "JAPAN": "jp"
  },
  "entityFlagImages": {
    "CHINA": "/flags/cn.png",
    "JAPAN": "/flags/jp.png"
  },
  "dataset": [
    ["GDP", "Entity", "Year"],
    [310000, "CHINA", 1985],
    [1380000, "JAPAN", 1985],
    [350000, "CHINA", 1986],
    [1400000, "JAPAN", 1986],
    [400000, "CHINA", 1987],
    [1420000, "JAPAN", 1987]
  ]
}
```

---

## 6. 用 Excel / CSV 准备数据

推荐先在表格中整理，再转为 JSON。

### 建议表结构（长表）

| GDP | Entity | Year |
|-----|---------|------|
| 310000 | CHINA | 1985 |
| 1380000 | JAPAN | 1985 |
| 3940000 | INDIA | 2024 |

### 注意事项

1. **经济体名统一**：`CHINA` 与 `China` 会被视为不同经济体，请全程保持一致
2. **数值单位统一**：当前为 **million USD（百万美元）**，不要在同一数据集中混用 billion
3. **排名展示**：图表只显示每年 GDP 最高的前 `maxBars` 名（默认 10），但 dataset 可包含更多经济体
4. **缺失年份**：若某实体某年无数据，请不要留空行，应补 0 或从数据源中剔除该经济体

---

## 7. 单位换算参考

| 原始单位 | 转为 million USD |
|----------|------------------|
| 10 亿美元（billion） | × 1000 |
| 1 万亿美元（trillion） | × 1,000,000 |
| 100 万美元 | ÷ 1 |

示例：CHN GDP 18.27 万亿美元 ≈ `18270000`（million USD）

---

## 8. 后端导出（可选）

若使用 Spring Boot 后端生成 JSON，可导出到：

```
data/asia-gdp.json
```

调用接口：

```
POST /api/asia-gdp/export
```

后端从数据库读取后，需组装为与上文相同的 JSON 结构（含 `dataset`、`entityColors` 等字段）。

---

## 9. 校验清单

准备完数据后，请确认：

- [ ] `chartType` 为 `bar-race`
- [ ] `dataset` 第一行是 `["GDP", "Entity", "Year"]`
- [ ] 所有 `Entity` 在 `entityColors` / `entityCodes` / `entityFlagImages` 中均有配置
- [ ] 对应国旗文件已放入 `frontend/public/flags/`
- [ ] `years` 数组连续且与数据年份匹配
- [ ] GDP 数值为正数
- [ ] 经济体名、单位、年份在整个文件中保持一致

---

## 10. 相关文件

| 文件 | 说明 |
|------|------|
| `frontend/src/mock/asia-gdp.js` | 当前使用的模拟数据 |
| `frontend/src/utils/buildBarRaceOption.js` | 图表渲染逻辑 |
| `frontend/public/flags/*.png` | 国旗图片资源 |

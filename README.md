# Aloha-Data-Map

根据数据生成分析图形的项目，分为前端、后端和 data 三个部分。

## 项目结构

```
Aloha-Data-Map/
├── backend/     # Spring Boot 后端，从数据库读取数据并生成 JSON
├── frontend/    # Vue3 + ECharts 前端，左侧菜单 + 右侧图表
└── data/        # 后端导出的 data.json 文件
```

## 数据流

1. 后端从数据库（H2 内存库）读取亚洲各国 GDP 数据
2. 调用 `POST /api/asia-gdp/export` 可导出 `data/asia-gdp.json`
3. 前端通过 `GET /api/asia-gdp` 获取数据，用 ECharts 渲染柱状图

## 启动方式

### 后端

```bash
cd backend
mvn spring-boot:run
```

服务地址：`http://localhost:8080`

### 前端

```bash
cd frontend
npm install
npm run dev
```

访问地址：`http://localhost:5173`

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/asia-gdp` | 获取亚洲 GDP 图表数据 |
| POST | `/api/asia-gdp/export` | 导出到 `data/asia-gdp.json` |

## 当前菜单

- **亚洲GDP** — 亚洲主要国家 GDP 柱状图（单位：万亿美元）

# 中国艺术史时空地图

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=flat&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-5-6E9F18?style=flat&logo=vitest&logoColor=white)
![Baidu Map](https://img.shields.io/badge/Baidu_Map-JS_API_2.0-2932E1?style=flat)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat)

> 一张会随时间变化的地图，三分钟看懂「中国美术的中心为什么一路往南走」。

## 这是什么

**时间 × 空间双轴叙事**的中国艺术史可视化作品。拖动底部朝代时间轴（唐 → 五代 → 北宋 → 南宋 → 元 → 明 → 清），中国地图上的艺术中心气泡随朝代变化、迁移轨迹线一路向南生长，点任意城市看详情。

核心史学观点：**中国美术中心沿三条逻辑南移**——先跟着首都走（政治），后来跟着文人走（文化），最后跟着市场走（经济）。主线：长安 → 南京 → 开封 → 杭州 → 苏州 → 北京。

## 功能

- 中国地图可视化（百度地图 JS API 2.0，内置自绘 SVG 兜底）
- 朝代时间轴 + 自动播放
- 艺术中心气泡 + 迁移轨迹线生长动画
- 「为什么一路往南」主线导读
- 全局搜索 + 画派筛选
- 城市详情（画派 / 时代背景 / 代表画家 / 今日可看的博物馆）
- AI 讲解（语音朗读）
- 分享海报

## 快速开始

```bash
cd frontend
npm install
cp .env.example .env   # 填入 VITE_BAIDU_AK（百度地图浏览器端 AK）
npm run dev            # http://localhost:5173
```

> AI 讲解需要可选后端：`cd backend && cp .env.example .env && node server.mjs`（填 SILICONFLOW_API_KEY）。

## 文档

- [DEMO.md](./DEMO.md)：产品说明与演示
- [frontend/README.md](./frontend/README.md)：前端详细启动 / 验证 / 数据说明
- [项目状态.md](./项目状态.md)：进度与决策台账

## 技术栈

Vite + React 19 + TypeScript（strict）· Tailwind CSS 4 · 百度地图 JS API 2.0 · Vitest

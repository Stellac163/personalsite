---
type: project
title: 时间管理助手（life-manager）
summary: 一个本地优先的个人效率工具，集 **番茄钟 · 课表 · 备忘录 · 日历** 于一体。
cover: ''
tags:
  - coding
published: true
date: '2026-09-03'
---
https://stellac163.github.io/life-manager/
已经完成页面部署

一个本地优先的个人效率工具，集 **番茄钟 · 课表 · 备忘录 · 日历** 于一体。
- PWA 网页版，部署到 GitHub Pages，可以安装到本地
- 通过 GitHub 私有仓库自动多端同步，本地离线可用

## 功能

| 功能 | 说明 |
|---|---|
| 番茄钟 | 专注/休息时长可调，倒计时，今日专注统计 |
| 课表 | 周视图，课程增删改，单双周 / 教室 / 颜色 |
| 备忘录 | 增删改，标签，置顶，关联日期 |
| 日历 | 月视图，日程管理，自动展示当天关联的备忘录 |

## 配置同步

首次打开应用，填写：

- 用户名：GitHub 用户名
- 仓库名：存放数据的**私有**仓库（需要提前构建）
- 访问令牌：一个最小权限的 fine-grained token（仅该数据仓库的 Contents 读写权限）
- 之后打开自动同步、改动后将同步你的内容。

Github链接：https://github.com/Stellac163/life-manager

# Yinwwwwww.github.io

我的个人博客 / 作品集 —— 基于 [Hugo](https://gohugo.io/) 与 [Stack 主题](https://github.com/CaiJimmy/hugo-theme-stack)（与 <https://demo.stack.cai.im/> 同款模板）。

在线访问：<https://yinwwwwww.github.io/>

## 本地开发

```bash
# 安装 Hugo（extended 版，需要 v0.157+）
brew install hugo

# 克隆仓库（主题是子模块）
git clone --recurse-submodules https://github.com/Yinwwwwww/Yinwwwwww.github.io.git
cd Yinwwwwww.github.io

# 本地预览
hugo server -D
# 打开 http://localhost:1313/

# 生产构建（输出到 public/）
hugo build --minify
```

## 写文章

```bash
# 中文文章
hugo new content post/我的文章/index.zh.md
# 英文文章
hugo new content post/my-post/index.en.md
```

文章 front matter 示例：

```yaml
---
title: 文章标题
date: 2026-08-30
description: 文章摘要
tags:
    - Hugo
categories:
    - 教程
---
```

## 部署

推送 `main` 分支后，[GitHub Actions](.github/workflows/deploy.yml) 会自动构建并部署到 GitHub Pages。

首次使用需在仓库 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。

## 目录结构

- `config/_default/`：站点配置（hugo、语言、参数、菜单、markup）
- `content/post/`：博客文章（`index.zh.md` 中文 / `index.en.md` 英文）
- `content/page/`：独立页面（关于、归档、搜索、链接）
- `themes/hugo-theme-stack/`：主题子模块，更新：`git submodule update --remote themes/hugo-theme-stack`

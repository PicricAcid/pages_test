---
title: GitHubメモ
author: PicricAcid
date: 2025-08-16
lastmod: 2025-08-16
tags: [GitHub, memo]
---

## 概要
- GitHub Pages + JekyllでMarkdownから静的ページを作成する

## Page作成の流れ
- リポジトリを作成
- 以下のファイル構成を作成
```
my-docs/
├── docs/
│   ├── index.md
│   └── other.md
└── README.md
```
- リポジトリの「Setting」- 「Pages」
-  **Source**で以下を設定：
	-  **Branch**：`main`
    - **フォルダ**：`/docs` 
- 「Save」すると、`https://<ユーザ名>.github.io/<リポジトリ名>/` で公開される

## タグ付け
- Markdownのヘッダにタグを追加
```
---
title: test
tags: [tag1, tag2]
---
```
- default.htmlでリンク化(タグページは別途必要)

## \_config.yml
```yml
title: test
permalink: pretty
markdown: kramdown
highlighter: rouge
```


## リンク
- [GitHub PagesとJekyllについて](https://docs.github.com/ja/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll)
- [Jekyll を使用して GitHub Pages サイトをローカルでテストする](https://docs.github.com/ja/pages/setting-up-a-github-pages-site-with-jekyll/testing-your-github-pages-site-locally-with-jekyll)
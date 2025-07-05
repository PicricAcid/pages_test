---
title: トップ
layout: default
---

# テストサイト

ようこそ！

<div class="notice-box">
<h2>📢 お知らせ</h2>
<ul>
  {% assign news_items = site.data.news | sort: "date" | reverse %}
  {% for item in news_items limit:3 %}
    <li><strong>{{ item.date }}：</strong> {{ item.text }}</li>
  {% endfor %}
</ul>
</div>

## 🆕 最新記事
<ul>
  {% assign pages_sorted = site.pages | where_exp: "p", "p.path contains 'contents/'" | sort: "date" | reverse %}
  {% for p in pages_sorted limit:5 %}
    <li>
      <a href="{{ site.baseurl }}{{ p.url }}">{{ p.title }}</a>
      {% if p.date %}
        <span style="font-size: 0.85em; color: #666;">（{{ p.date | date: "%Y-%m-%d" }}）</span>
      {% endif %}
    </li>
  {% endfor %}
</ul>

[▶ 全記事を見る](all_contents_list.md)

---

## 🏷 タグから探す

[▶ タグ一覧を見る](tags/index.html)

---

## ✅ 拡張機能のダウンロード

- [拡張機能（.vsixファイル）をダウンロード](https://github.com/PicricAcid/manual-site-extension/releases/download/v0.0.1/manual-site-extension-0.0.1.vsix)
- VSCodeの「Install from VSIX」でインストールしてください

---

## 🧭 よく使うページ

- 📖 用語集   🚧 準備中! 🚧
- 📬 FAQ   🚧 準備中! 🚧
- [🔍 検索ページ](search.html)

---

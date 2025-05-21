---
title: トップ
layout: default
---

# テストサイト

ようこそ！

---

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

▶ 全記事を見る 🚧 準備中! 🚧

## 記事一覧

<ul>
  {% assign pages = site.pages | where_exp: "p", "p.path contains 'contents/'" %}
  {% for p in pages %}
    <li>
      <a href="{{ site.baseurl }}{{ p.url }}">{{ p.title }}</a>
    </li>
  {% endfor %}
</ul>

---

## 🏷 タグから探す

<ul>
  {% assign pages = site.pages | where_exp: "p", "p.path contains 'tags/'" %}
  {% for p in pages %}
    <li><a href="{{ site.baseurl }}{{ p.url }}">{{ p.title }}</a></li>
  {% endfor %}
</ul>

---

## 🧭 よく使うページ

- 📖 用語集   🚧 準備中! 🚧
- 📬 FAQ   🚧 準備中! 🚧
- 🔍 検索ページ   🚧 準備中! 🚧

---

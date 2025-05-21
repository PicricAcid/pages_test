---
title: トップ
layout: default
---

# テストサイト

ようこそ！

---

## 📢 お知らせ

<div class="notice">
<ul>
  {% assign news_items = site.data.news | sort: "date" | reverse %}
  {% for item in news_items %}
    <li><strong>{{ item.date }}：</strong> {{ item.text }}</li>
  {% endfor %}
</ul>
</div>

---

## 記事一覧

<ul>
  {% assign pages = site.pages | where_exp: "p", "p.path contains 'contents/'" %}
  {% for p in pages %}
    <li><a href="{{ site.baseurl }}{{ p.url }}">{{ p.title }}</a></li>
  {% endfor %}
</ul>

## タグ一覧

<ul>
  {% assign pages = site.pages | where_exp: "p", "p.path contains 'tags/'" %}
  {% for p in pages %}
    <li><a href="{{ site.baseurl }}{{ p.url }}">{{ p.title }}</a></li>
  {% endfor %}
</ul>

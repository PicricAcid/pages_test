---
title: トップ
layout: default
---

# テストサイト

ようこそ！

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

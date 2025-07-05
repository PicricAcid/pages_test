---
layout: default
title: タグ一覧
---

# タグ一覧

<ul>
  {% assign tags = site.tags | sort %}
  {% for tag in tags %}
    <li>
      <a href="{{ '/tags/' | append: tag[0] | append: '.html' | relative_url }}">
        {{ tag[0] }} ({{ tag[1].size }})
      </a>
    </li>
  {% endfor %}
</ul>

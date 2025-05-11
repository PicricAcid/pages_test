---
layout: dafault
title: タグ一覧
---

<h2>タグ一覧</h2>

<ul>
  {% assign tag_counts = {} %}

  {% for page in site.pages %}
    {% if page.tags %}
      {% for tag in page.tags %}
        {% assign current_count = tag_counts[tag] | default: 0 %}
        {% assign tag_counts = tag_counts | merge: {{ tag | jsonify }}: {{ current_count | plus: 1 }} %}
      {% endfor %}
    {% endif %}
  {% endfor %}

  {% for tag in tag_counts %}
    <li>
      <a href="{{ site.baseurl }}/tags/{{ tag[0] | downcase | uri_escape }}">
        {{ tag[0] }} ({{ tag[1] }})
      </a>
    </li>
  {% endfor %}
</ul>

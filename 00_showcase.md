---
layout: page
title: Games
permalink: '/js-dos.com/games/'
---

There are listing of many games that can be run in browser with js-dos.
You can search for your favorite game through form:

<input type="search" placeholder="Game">

<div class="posts">
  {% for post in site.posts %}
    {% if post.showcase == true %}
    <div class="post">
      <h1 class="post-title">
        <a href="{{ site.baseurl }}{{ post.url }}">
          {{ post.title }}
        </a>
      </h1>

      <span class="post-date">{{ post.date | date_to_string }}</span>

      {{ post.excerpt }}
    </div>
    {% endif %}
  {% endfor %}
</div>

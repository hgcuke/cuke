# cuke

> 一个简洁的hugo主题，取名cuke以纪念我的狗子：黄瓜。

主题参考了

- [janraasch/hugo-bearblog](https://github.com/janraasch/hugo-bearblog)
- [rokcso/hugo-bearneo](https://github.com/rokcso/hugo-bearneo)

感谢！

## 文章

添加一篇文章

```
hugo new posts/标题.md
```

```
---
title: "标题"
date: 2026-01-21
toc: true # 是否启用目录
hide_title: false # 是否隐藏标题
summary: "概要"
post_tags:
  - 标签1
  - 标签2
---
```

## 相册

添加一个相册

```
hugo new gallery/标题.md
```

```
---
title: "标题"
hide_title: false
date: 2026-06-12
summary: "概要"
gallery_tags:
  - 标签1
  - 标签2
params:
  remote_images:
    - url: ""
    - url: ""
    - url: ""
    - url: ""
    - url: ""
    - url: ""
    - url: ""
    - url: ""
    - url: ""
    - url: ""
  sort_by: "Date"
  sort_order: "desc"
---
```

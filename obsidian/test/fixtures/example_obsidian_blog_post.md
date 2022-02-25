---
title: "Reading a Ruby gem with VSCode"
date: "2022-02-15"
description: "Steps to try when investigating a gem's implementation in VSCode, using mocha's any_instance as an example."
published: true
tags: ["ruby", 'vscode']
---

Whether out of curiosity or trying to understand a method for debugging, it's helpful to know how to dig into a Ruby gem. Recently I was curious over how [mocha](https://github.com/freerange/mocha/), a mocking library for minitest, allowed stubbing on `any_instance` of a Class (as opposed to injecting a stubbed object), for example:

```ruby
puts
```
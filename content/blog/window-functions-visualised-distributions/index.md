---
title: Window Functions, Visualised - Distribution
date: "2021-01-09"
description: "Picturing cume_dist and ntile window functions."
published: false
---

Let's look at the window functions `cume_dist` and `ntile`, which I've dubbed "distribution functions".

## cume_dist
Shortform for [cumulative distribution](https://en.wikipedia.org/wiki/Cumulative_distribution_function),

percentiles?




## ntile

I liken `ntile` to dividing your window frame equally into "buckets":

An example:
```sql
SELECT
  ntile(3) OVER(ORDER BY cost DESC),
  ...
FROM expenses;
```
In the above, we're asking Postgres to divide the frame into 3 buckets:





Following from window functions for [rankings](/blog/window-function-visualised-rankings)

---
title: Window Functions, Visualized - Rankings
date: "2021-01-04"
description: "Picturing the differences between row_number, rank and dense_rank."
---

Leading from an [introduction to Window Function Calls](/blog/window-function-calls-an-introduction/), let's dive deeper into the different Window Functions that are available. Today, we'll look at `row_number`, `rank` and `dense_rank`. We'll be using the same expenses table from the previous post, which looks something like:

| description | cost |
| ----------- | ---- |
| bus ride    | 3    |
| lunch       | 15   |
| ...         |      |

In the following examples, our window frame will be the whole expenses table, ordered by highest to lowest cost:
```sql
SELECT
  [ window function ] OVER(ORDER BY cost DESC),
  expenses.description,
  expenses.cost
FROM expenses
```

![picture]



# row_number
Let's start with `row_number`:
```sql
... ROW_NUMBER() OVER(ORDER BY cost DESC), ...
```

All `row_number` does is add a running number for each row in the frame, starting from 1:

| row_number | description | cost |
| ---------- | ----------- | ---- |
| 1          | groceries   | 60   |
| 2          | dinner      | 35   |
| 3          | taxi        | 20   |
| 4          | lunch       | 15   |
| 5          | lunch       | 15   |
| 6          | supper      | 15   |
| 7          | tea break   | 5    |
| 8          | bus ride    | 4    |
| 9          | bus ride    | 3    |
| 10         | bus ride    | 3    |


# dense_rank
`dense_rank` is more interesting. Reviewing the previous example, we can see that there were a few entries that "tie" for the same level. The Postgres documentation refers to these as **peer groups**:

![picture]


What `dense_rank` does is add a running number for each _peer group_ in the frame, starting from 1:

| dense_rank |      description | cost |
|------------|------------------|------|
|          1 |        groceries |   60 |
|          2 |           dinner |   35 |
|          3 |     taxi to home |   20 |
|          4 |            lunch |   15 |
|          4 |            lunch |   15 |
|          4 |           supper |   15 |
|          5 |        tea break |    5 |
|          6 |    bus ride home |    4 |
|          7 | bus ride to work |    3 |
|          7 | bus ride to work |    3 |

**Note**: I'm actually not sure how Postgres "breaks the tie" within a peer group - in my small example, it looks like an implicit `ORDER BY ID DESC` was added, but the Postgres [docs](https://www.postgresql.org/docs/current/queries-order.html) also say _if sorting is not chosen, the rows will be returned in an unspecified order_ 🤷‍♂️.


# rank
`rank` has one big difference from `dense_rank` - instead of a running number, it considers "gaps":

![picture]

Comparing the results of each function makes the difference clearer:

| dense_rank | rank |      description | cost |
|------------|------|------------------|------|
|          1 |    1 | ... |  ... |
|          2 |    2 | ... |  ... |
|          3 |    3 | ... |  ... |
|          4 |    4 | ... |  ... |
|          4 |    4 | ... |  ... |
|          4 |    4 | ... |  ... |
|          5 |    7 | ... |  ... |
|          6 |    8 | ... |  ... |
|          7 |    9 | ... |  ... |
|          7 |    9 | ... |  ... |



# Side by side

Finally, let's look at results side by side:

| row_number | dense_rank | rank | description | cost |
| ---------- | ---------- | ---- | ----------- | ---- |
| 1          | 1          | 1    | groceries   | 60   |
| 2          | 2          | 2    | dinner      | 35   |
| 3          | 3          | 3    | taxi        | 20   |
| 4          | 4          | 4    | lunch       | 15   |
| 5          | 4          | 4    | lunch       | 15   |
| 6          | 4          | 4    | supper      | 15   |
| 7          | 5          | 7    | tea break   | 5    |
| 8          | 6          | 8    | bus ride    | 4    |
| 9          | 7          | 9    | bus ride    | 3    |
| 10         | 7          | 9    | bus ride    | 3    |


I hope that helped! Here's an [sqlfiddle](http://sqlfiddle.com/#!17/e9ac4/6) you can play around with.

For further reading, take a look at the Postgres docs on [Window Functions](https://www.postgresql.org/docs/13/functions-window.html).


---
title: "Meta-Postgres: What constraints does a table have?"
date: "2021-05-16"
description: "TIL about information_schema and system catalogs that you can use to query the structure of the database itself."
published: true
tags: ["postgres"]
---
TIL that checking the structure of your database is just another query away! I needed to find whether a CHECK constraint existed and learnt that Postgres has [information_schema](https://www.postgresql.org/docs/current/information-schema.html) views and [system catalogs](https://www.postgresql.org/docs/current/catalogs.html) which you can query like regular tables.

The `information_schema` is actually defined by the SQL standard, so other SQL-compliant databases should have them too. I tried looking first at [columns](https://www.postgresql.org/docs/current/infoschema-columns.html), then [constraint\_column\_usage](https://www.postgresql.org/docs/current/infoschema-constraint-column-usage.html). Neither had quite what I was looking for, as they did not include the constraint definition.

Then I found out that each `information_schema` is actually just a view based upon Postgres’ [system catalog](https://postgresql.org/docs/13/interactive/catalogs-overview.html) tables 🤯 For example, check out the SQL for [constraint\_column\_usage](https://github.com/postgres/postgres/blob/272d82ec6febb97ab25fd7c67e9c84f4660b16ac/src/backend/catalog/information_schema.sql#L801).

This meant I had the building blocks to make exactly what I needed! The `pg_node_tree` column contains a representation of the CHECK definition, which can be parsed with `pg_get_constraintdef`:

```sql
SELECT pg_get_constraintdef((
  SELECT c.oid
  FROM   pg_constraint c
  WHERE  c.conrelid = 'my_table'::regclass
));
```
(Note to self: the additional parentheses is to evaluate the select result as a value expression / scalar, as opposed to a table.)

That would give you a result like:

|pg\_get\_constraintdef|
|---|
|```CHECK ((description <> ''::text))```|

## Appendix
### Pro-Tips
Twitter user [ascherbaum](https://twitter.com/ascherbaum) has pointed out that when using `psql`, you can use `-e -E` arguments to show the underlying SQL which Postgres uses. Pretty neat!

### Follow-up Questions

- Are the catalogs stored like any other table, or is there some magic that makes them table-like?
- Does pg\_get\_constraintdef work with other types of constraints? The docs suggest not.

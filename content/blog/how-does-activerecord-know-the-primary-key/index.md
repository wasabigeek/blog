---
title: How does ActiveRecord know the primary_key?
date: "2021-02-13"
description: "A tiny excursion into the world of ActiveRecord, prompted by trying to debug an UnknownPrimaryKey error."
published: true
tags: ["rails"]
---

While trying to help someone debug an `ActiveRecord::UnknownPrimaryKey` error, I went down a rabbit-hole trying to figure out how Rails determines the primary key. Hopefully this provides a tiny bit more insight on how Rails works!

## TL;DR

If you're using Postgres, ActiveRecord searches for a primary key index on the table. If you're using a different database, the answer probably lies in the respective `SchemaStatements` of the adapter, e.g. `ActiveRecord::ConnectionAdapters::MySQL::SchemaStatements` ([source](https://github.com/rails/rails/blob/main/activerecord/lib/active_record/connection_adapters/mysql/schema_statements.rb)).

## Finding the Primary Key

`ActiveRecord::Base` includes the `AttributeMethods` module, which in turn includes `PrimaryKey`. The module has a `#primary_key` [method](https://github.com/rails/rails/blob/main/activerecord/lib/active_record/attribute_methods/primary_key.rb#L70):

```ruby
def primary_key
  @primary_key = reset_primary_key unless defined? @primary_key
  @primary_key
end
```

If we follow the `#reset_primary_key` method, we'll eventually reach `#get_primary_key`, which tries to get the key from the `SchemaCache`:

```ruby
def get_primary_key(base_name)
  if # ...
  else
    if ActiveRecord::Base != self && table_exists?
      pk = connection.schema_cache.primary_keys(table_name)
			# ...
    else
      # ...
    end
  end
end
```

In the [SchemaCache](https://github.com/rails/rails/blob/v6.1.2.1/activerecord/lib/active_record/connection_adapters/schema_cache.rb), we see that if the `primary_keys` cache does not already have the key, it will attempt to call `connection.primary_key(table_name)`:

```ruby
def primary_keys(table_name)
  @primary_keys.fetch(table_name) do # if the table_name key isn't in the Hash, execute this block
		# ...
    @primary_keys[deep_deduplicate(table_name)] = deep_deduplicate(connection.primary_key(table_name))
    # ...
  end
end
```

This method is found in [SchemaStatements](https://github.com/rails/rails/blob/v6.1.2.1/activerecord/lib/active_record/connection_adapters/abstract/schema_statements.rb#L148), and it in turn attempts to call `#primary_keys`. This call goes to the database adapter, in my case [PostgreSQL::SchemaStatements](https://github.com/rails/rails/blob/main/activerecord/lib/active_record/connection_adapters/postgresql/schema_statements.rb#L356):

```ruby
def primary_keys(table_name) # :nodoc:
  query_values(<<~SQL, "SCHEMA")
    SELECT a.attname
      FROM (
             SELECT
               FROM pg_index
              WHERE indrelid = #{quote(quote_table_name(table_name))}::regclass
                AND indisprimary
           ) i
      JOIN pg_attribute a
        ON a.attrelid = i.indrelid
       AND a.attnum = i.indkey[i.idx]
     ORDER BY i.idx
  SQL
end
```

The subquery in particular is crucial - basically, Rails looks for a primary key index belonging to the table. Let's focus on the important bits:

```sql
SELECT ...
/* from all the indexes */
FROM pg_index
/* find those for table_name */
/* you can google for regclass, it's another Postgres rabbit-hole */
WHERE indrelid = table_name::regclass
/* that are primary keys */
AND indisprimary
```

This is usually automatically created during a migration - Rails will add an `id` column and make it a primary key. If you have a `structure.sql` file, you'd find statements like `ADD CONSTRAINT table_name_pkey PRIMARY KEY (id)` which do exactly that.

## Bonus: How did I find it?

It took me quite a while to figure this out, I'm sharing my abridged (because I was flailing around a _lot_) methodology in hopes that it might be helpful to you when debugging - if you know a better way, do share!

- Did a GitHub search in the Rails repo for the UnknownPrimaryKey error. There were a few results that were in the form `finder_class.primary_key`, so I assumed it was a method on the model (and confirmed that by playing around in the rails console).
- Did another search for `"def primary_key"` ("primary_key" alone gave too many results), this led to `ActiveRecord::AttributeMethods::PrimaryKey`.
- Wasn't sure that this was the correct method but I attempted to follow the code through (GitHub's [jump to definition](https://docs.github.com/en/github/managing-files-in-a-repository/navigating-code-on-github#jumping-to-the-definition-of-a-function-or-method) was a godsend) and got a little stuck/distracted by trying to figure out what class `connection` referred to.
- After a bit of poking around in the console, I recalled seeing this class called [TracePoint](https://ruby-doc.org/core-2.7.2/TracePoint.html), and decided to give it a try:

  ```sql
  trace = TracePoint.new(:raise) do |tp|
      p [tp.lineno, tp.event, tp.raised_exception]
  end

  trace.enable { ExampleModel.first }
  ```

- This gave an extremely long trace 🤯 good thing I could search in my terminal, after grepping for `primary_keys` I came across this set of calls, which confirmed that the method was in `PostgreSQL::SchemaStatements`

```bash
[48, ActiveRecord::ConnectionAdapters::SchemaCache, :primary_keys, :call]
[53, ActiveRecord::ConnectionAdapters::SchemaCache, :data_source_exists?, :call]
[146, ActiveRecord::ConnectionAdapters::SchemaStatements, :primary_key, :call]
[355, ActiveRecord::ConnectionAdapters::PostgreSQL::SchemaStatements, :primary_keys, :call]
```

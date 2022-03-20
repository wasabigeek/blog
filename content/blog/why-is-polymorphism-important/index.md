---
title: Why is Polymorphism important?
date: "2022-03-20"
description: "When I first came across the concept of Polymorphism in Object-Oriented Programming, it wasn't obvious why it was important. Could we develop a better intuition for it's importance?"
published: true
tags: ["object-oriented", "software-design", "dependency-inversion-principle"]
---

When I first came across the concept of Polymorphism in Object-Oriented Programming (OOP), it wasn't obvious to me _why_ it was important. The top search results generally explain _what_ it is and _how_ to use it, but handwave the _why_ and treat it as yet-another-language-feature. 

A [blog post](https://blog.cleancoder.com/uncle-bob/2018/04/13/FPvsOO.html) by Robert Martin (who coined the SOLID acronym) caught my eye recently, in particular this statement:

> ...the thing that truly differentiates OO programs from non-OO programs is polymorphism.

Whoa! Now he doesn't mean that encapsulation, inheritance and other concepts associated with OOP are not important, but argues that they are achievable in "non-OOP" as well. Still, I wondered why most material skims over something that he considered core to OOP. Could we build a stronger intuition for _why_ polymorphism is important?

## What is polymorphism?
Let's set the stage by aligning on what Polymorphism in OOP is. In the same post, Martin explains Polymorphism as different kinds of objects being able to accept the same message, implementing their own behaviour. I'll paraphase his example:
```
some_object.do_the_right_thing(input)
```
We don't actually know what `some_object` is! Many different implementations could replace `some_object`, and the program would still run as long as they had the same interface (i.e. have the method `#do_the_right_thing`).

## Why polymorphism?
In another [blog post](https://blog.cleancoder.com/uncle-bob/2014/11/24/FPvsOO.html), Martin says:

> There really is only one benefit to Polymorphism; but it’s a big one. It is the inversion of source code and run time dependencies.

Let's concretise this with an example: caching in a web framework like Rails. There are multiple options out there for caches - for example, Rails supports a `FileStore`, a `MemCacheStore` and a `RedisCacheStore`. For the sake of illustration, imagine that the caches all had their own interfaces:
```ruby
def example_method
  # do stuff
  if Rails.cache.is_a? NaiveFileStore
    data = Rails.cache.search_for(key)
  elsif Rails.cache.is_a? NaiveRedisCacheStore
    data = Rails.cache.get(key)
  end
  # do not stuff
end
```

Above, our `example_method` has a direct dependency on `NaiveFileStore` and `NaiveRedisCacheStore`. If their interfaces change, or new kinds of stores are supported, it will require changes in `example_method`.

Martin talks about an inversion of dependencies (D in SOLID) - practically this means  `example_method` and the different cache stores instead depend on an agreed interface. This makes all cache stores polymorphic! In Rails all [cache stores](https://guides.rubyonrails.org/caching_with_rails.html#activesupport-cache-store) implement a `#fetch` method, so the above becomes:

```ruby
def example_method
  # do stuff
  data = Rails.cache.fetch(key)
  # do not stuff
end
```

The code in `example_method` is more concise now, but that's a side benefit; what's important is it's shielded from knowledge which exact cache store is used, and how the store works. It just knows that _some_ cache store exists (`Rails.cache`), and the cache store has agreed to implement `#fetch` method.

We can visualise the new "dependency directions" changing with the arrows below:
![polymorphic.png](./polymorphic.png)

Martin describes this as a "plugin architecture":

> This inversion allows the called module to act like a plugin. Indeed, this is how all plugins work.
> ...
> Plugin architectures are very robust because stable high value business rules can be kept from depending upon volatile low value modules such as user interfaces and databases.

With the new setup, the polymorphic cache stores can be swapped for each other without changing the code in `example_method`. New kinds of cache stores can also be supported by creating classes that have `#fetch`, for example by inheriting from the abstract [ActiveSupport::Cache::Store](https://guides.rubyonrails.org/caching_with_rails.html#activesupport-cache-store).




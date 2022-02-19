---
title: "Polymorphism, with fries please"
date: "2022-02-19"
description: "One way to advantage of Polymorphism, explained through the eyes of a growing food business."
published: false
tags: ["ruby", "object-oriented"]
---

Imagine you're the chef-owner of a new food truck. You're the only staff for now, so you do everything, taking the order and making it:

```ruby
def handle_order(item_name)
  if item_name == "burger"
    toast_buns
    grill_patties
    ...
  elsif item_name == "tacos"
    ...
  end
end
```

After some coverage in the local news, an investor has approached you to expand into a nationwide chain. As you hire new staff, you first try teaching them to operate the way you do i.e. they know how to do everything:

```ruby
class FastFoodOutletStaff
  def handle_order(item_name)
    if item_name == "burger"
      ...
    elsif item_name == "tacos"
      ...
    end
  end
end

class FoodTruckStaff
  def handle_order(item_name)
    if item_name == "burger"
      ...
    elsif item_name == "tacos"
      ...
    end
  end
end
```

This works, but there are problems. Sure, new staff have to be taught everything, but that's not the thing that bothers you the most. You're trying to innovate - tweaking recipes, adding new menu items. But when you change or add a new recipe, you have to retrain everyone, which is error prone:

```ruby
class FastFoodOutletStaff
  def handle_order(item_name)
    if item_name == "burger"
      butter_buns
      grill_buns
      ...
    elsif item_name == "tacos"
      ...
    elsif item_name == "fried rice"
    end
  end
end

class FoodTruckStaff
  def handle_order(item_name)
    if item_name == "burger"
	  # Oh no! Forgot to teach about buttering before grilling.
      # Now customers are complaining about a lot of burnt buns!
      grill_buns
      ...
    elsif item_name == "tacos"
      ...
	# Oh no! Forgot to teach the new menu item.
    # Now customers are complaining that fried rice isn't available!
    end
  end
end
```

After a while, **it feels really hard to change things, and you feel hesitant to add new menu items**. To solve this, you decide to have individual KitchenStaff specialised in each menu item. That way, only the relevant staff need to be retrained:

```ruby
class BurgerDude < KitchenStaff
  def make_burger
    # Nice, now every BurgerDude will know to butter buns before grilling!
  end
end

class FriedRiceGal < KitchenStaff
  def make_fried_rice
  end
end

class TacoCat < ...
```

There's a problem here though - because each staff is specialised, customers would have to know which staff to talk to, and what to tell them!

```ruby
class Customer
  # def get_lunch_v1
  #   FoodTruckStaff.new.handle_order("fried rice")
  # end

  def get_lunch_v2
	BurgerDude.new.make_fried_rice # => NotMyJobError
  end
end
```

So you do two things:

1. Add a Signboard, which tells Customers who to talk to for each order. This way, Customers don't need to remember who to talk to.
2. Train each KitchenStaff to take orders the same way, so Customers can talk to them the same way regardless of their orders.

```ruby
class Signboard
  def self.find_staff_for(item_name)
    if item_name == "burger"
      BurgerDude.new
    ...
    end
  end
end

class BurgerDude < KitchenStaff
  def handle_order
    make_burger
  end
end

class Customer
  def get_lunch
	Signboard.find_staff_for("burger").handle_order
  end
end
```

Seems like you're in a good place now - regardless of whether it's a food truck or fast food outlet, it'll be easier to make changes to the menu! Although you'd have to teach Customers a new way of ordering, it's a one-time cost and you feel the benefits outweigh it.

And then you think - wait a minute, how do all these people fit into a food truck? And I don't actually want customers to talk directly to the kitchen staff, do I? Which is the exact point you wake up and realise it was all a dream, and the point where this analogy starts to break down.

## Afterword

This is just one example of how you might take advantage of Polymorphism, albeit a common one - in Martin Fowler's [Refactoring](https://martinfowler.com/books/refactoring.html), this is "Replace Conditional with Polymorphism", and you'll see Sandi Metz do something similar in her [All the Little Things](https://www.youtube.com/watch?v=8bZh5LMaSmE) talk. The _actual_ Polymorphism in this story is really just how all KitchenStaff can take orders the same way (`handle_order`).

Polymorphism, in my own words, is about being able to talk to different objects the same way. Concretely, this means the objects share an interface and have some common methods. This is sometimes referred to as sharing the same "role". For example, each `KitchenStaff` above could be said to play the role of "Orderable" (represented as a contrived module below):

```ruby
module Orderable
  def handle_order
    public_send(:prepare_method)
  end

  def prepare_method
    raise NotImplementedError
  end
end

class BurgerDude
  include Orderable

  def prepare_method
    :make_burger
  end

  def make_burger
    ...
  end
end
```

As we saw in the analogy, the benefit of Polymorphism is it can help us hide knowledge about underlying classes from callers, making it easier to change the underlying logic without breaking things. The cost is more classes for the programmer to deal with.

I think it's worth mentioning that because it's about roles, seemingly unrelated objects could still be polymorphic. For example, most objects in Ruby have a `inspect` instance method, which is used when printing the object:

```
irb(main):001:0> class KitchenStaff; end
irb(main):002:0> p KitchenStaff
=> KitchenStaff
irb(main):003:1* def KitchenStaff.inspect
irb(main):004:1*   "I am a KitchenStaff"
irb(main):005:0> end
irb(main):006:0> p KitchenStaff
=> I am a KitchenStaff
```

So don't limit Polymorphic thinking to just things that have an "is a" relationship (subclasses)! What other examples do you have that take advantage of Polymorphism?

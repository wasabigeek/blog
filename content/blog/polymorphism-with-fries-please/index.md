---
title: "Polymorphism, with fries please"
date: "2022-02-19"
description: "What is Polymorphism, and why use it? We answer this by looking through the eyes of fictional, growing food business (yum)."
published: false
tags: ["ruby", "object-oriented"]
---

Imagine you're the chef-owner of a new food truck. You're the only staff for now, so you do everything, from taking the order and making it:
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

After some coverage in the local news, an investor has approached you to expand into a nationwide Fast Food chain. As you hire new staff, you first try to teach them to cook everything:

```ruby
class FoodTruckStaff
  def handle_order(item_name)
    if item_name == "burger"
      ...
    elsif item_name == "tacos"
      ...
    end
  end
end

class FastFoodOutletKitchenStaff
  def make_item(item_name)
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
class FoodTruckStaff
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

class FastFoodOutletKitchenStaff
  def make_item(item_name)
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

After a while, **it feels really hard to change things, and you feel hesitant to add new menu items**. To solve this, you decide to separate some responsibilities. In particular, each KitchenStaff is specialised in a single menu item. That way, only the relevant staff need to be retrained:

```ruby
class BurgerDude < KitchenStaff
  def make_burger
    # Nice, now every BurgerDude will know to butter buns before grilling!
  end
end

class FriedRiceGal < KitchenStaff
  def make_fried_rice
    ...
  end
end

class TacoCat < ...
```

There's a problem here though - because each staff is specialised, Customers would have to know who to talk to, and what to tell them!

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
1. Add an **OrderKiosk**, which lets Customers specify their order and will call the right KitchenStaff for it. This way, Customers don't need to remember who to ask. (In Object-Oriented Programming, this is usually called a **Factory**.)
2. Train each KitchenStaff to take orders the same way (`#handle_order`), so Customers can talk to them the same way, regardless of their orders. (This is **Polymorphism**, explained in greater detail later.)

```ruby
class OrderKiosk
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
  	OrderKiosk.find_staff_for("burger").handle_order
  end
end
```

Seems like you're in a good place now - regardless of whether it's a food truck or fast food outlet, it'll be easier to make changes to the menu! Although you'd have to teach Customers a new way of ordering, it's a one-time cost and you feel the benefits outweigh it.

And then you think - wait a minute, how do all these people fit into a food truck? And I don't actually want customers to talk directly to the kitchen staff, do I? Which is the exact point you wake up and realise it was all a dream, and where this analogy starts to fall apart.

## What is Polymorphism, and why use it?

**Polymorphism**, in my own words, is about being able to talk to different objects the same way. Concretely, this means the objects share an interface and have some common methods. As we saw in the analogy, the benefit of this is allowing us to hide knowledge about underlying Classes from callers - in our story, the **Customer** didn't have to know which **KitchenStaff** was instantiated. This makes it easier to change the underlying logic without needing Customers to change their logic (e.g. we could "retrain" KitchenStaff to cook more than one item).

While the *actual* Polymorphism in this story is really just how all KitchenStaff can take orders the same way (`#handle_order`), the creation of a Factory to return the right polymorphic object is a common pattern. In Martin Fowler's [Refactoring](https://martinfowler.com/books/refactoring.html), this is "Replace Conditional with Polymorphism", and you'll see Sandi Metz do something similar in her [All the Little Things](https://www.youtube.com/watch?v=8bZh5LMaSmE) talk. 

Don't limit polymorphic thinking to objects that have an "is-a" relationship (i.e. are subclasses)!  Seemingly unrelated objects can still benefit from Polymorphism. For example, all objects in Ruby have an `#inspect` method, which is used to print it:

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

(OK, *technically* most Ruby objects are subclasses of **Object**, where this method is defined, but you get the idea.)

What's the coolest example of Polymorphism you've seen?




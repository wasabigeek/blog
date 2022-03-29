---
title: "Practical Metaprogramming in Ruby: minitest/mock"
date: "2022-01-22"
description: "minitest/mock is a tiny library that nevertheless provides a wealth of examples for metaprogramming in Ruby - let's take a look!"
published: true
tags: ["ruby", "metaprogramming", "testing"]
---

`minitest/mock` ([repo](https://github.com/seattlerb/minitest/blob/v5.15.0/lib/minitest/mock.rb)) is a tiny mocking library (< 250 lines of code, _including_ comments) that's also a great showcase for how metaprogramming can be used in Ruby - let's take a look! If you're new-ish to Ruby, I hope this gives you concrete examples of what metaprogramming is possible, and how to do it.

## What is metaprogramming?
In the context of this article, I'm referring to programs and code that are able to do _introspection_ (inspect themselves e.g. type or properties) and _reflection_ (modify their behaviour).

## First example: Set expectations with method_missing
The main feature of `minitest/mock` is the `Minitest::Mock` class, which can be used to test that a method is called, for example:
```ruby
require 'minitest/mock'

class ClassUnderTest
  def initialize(foo)
    @foo = foo
  end

  def call
    @foo.bar
  end
end

# create an instance of Mock and set an expectation
# that the method `bar` will be called on it
mock_foo = Minitest::Mock.new
mock_foo.expect(:bar, 'example_return_value')

# inject the mock into the Object-Under-Test
# which essentially calls `mock_foo.bar`
ClassUnderTest.new(mock_foo).call # => returns 'example_return_value'

# check that `bar` was called
mock_foo.verify
```

Notice that there's nowhere in the library where the method `bar` is explicitly defined, yet running the above doesn't raise a `NoMethodError`. We were able "define" (well, not exactly, but we'll get to that) a new method _after_ the mock object was already instantiated, via the `expect` call.

The truth is `expect` ([source code](https://github.com/seattlerb/minitest/blob/v5.15.0/lib/minitest/mock.rb#L81-L92)) is straightforward Ruby; it saves the expected call to an Array instance variable - no new method gets defined. The real magic happens in `method_missing` :
```ruby
# lib/minitest/mock.rb#L118
def method_missing sym, *args, &block
  # ...
  expected_call = @expected_calls[sym][index]
  # ...
  expected_args, retval, val_block = expected_call.values_at(:args, :retval, :block)
  # ...
  @actual_calls[sym] << {
    :retval => retval,
    :args => zipped_args.map! { |mod, a| mod === a ? mod : a },
  }
end
```
If a method is called that doesn't exist, Ruby will invoke `method_missing` with a few arguments:
- the method's name in symbol form (`sym` in the above example)
- the arguments (`*args` ) and block (`&block`) passed to the non-existent method

`Minitest::Mock` uses this to catch any undefined method that is called, checking it against the saved expectations. This makes it seem like the object has that method defined!

## Remove inherited methods via undef_method
While `Minitest::Mock` doesn't explicitly define many methods, it does inherit methods from Ruby's `Object` class, such as `#nil?`.

What if we want to check that a mock receives a method call, like `#nil?`? Without any intervention, `method_missing` would _not_ be invoked, since those methods exist! Something like this would happen:
```ruby
mock.expects(:nil?, true)
mock.nil? # => false (this is the default for Object!)
mock.verify # raises MockExpectationError, because the original `#nil?` method is called instead of `method_missing`!
```

So what the library does here is to undefine them when the class is interpreted. `instance_methods` is used to introspect the class for any instance methods, which are removed via `undef_method`:
```ruby
# lib/minitest/mock.rb#L26
instance_methods.each do |m|
  undef_method m unless overridden_methods.include?(m.to_s) || m =~ /^__/
end
```

Calling `#nil?` now would properly invoke `method_missing`.

## Redefining Methods with define_method
In the code above, we saw that not all `instance_methods` were removed, there are some `overridden_methods` (e.g. `inspect`) where the library opts to keep the default implementation _unless_ the user has explicitly set an expectation. This is done by re-defining them via `define_method`:
```ruby
# lib/minitest/mock.rb#L30
overridden_methods.map(&:to_sym).each do |method_id|
  define_method method_id do |*args, &b|	
    if @expected_calls.key? method_id then
  	  method_missing(method_id, *args, &b)
    else
  	  super(*args, &b)
    end
  end
end
```
The goal seems to be so that a `Minitest::Mock` instance still responds like a Ruby object e.g. when printing it in the terminal 😄.

## Stubbing by redefining methods on "Metaclasses"
`minitest/mock` also has a stubbing feature, which allows you to redefine the return value of an object within a block:
```ruby
Time.stub(:now, "example") do
  Time.now # => "example"
end
Time.now # => actual time...
```

Let's look at the implementation - the library first opens the `Object` class, and defines a `stub` method there:
```ruby
class Object
  # lib/minitest/mock.rb#L214
  def stub name, val_or_callable, *block_args
    # ...
  end
end
```

Since `Object` is the ancestor of all almost everything in Ruby (including Classes and Modules), we are able to call `stub` on basically anything. The actual implementation of `stub` is the interesting bit, introducing us to Ruby's "metaclasses" (also known as "singleton classes" or "eigenclasses"):
```ruby
class Object
  # lib/minitest/mock.rb#L214
  def stub name, val_or_callable, *block_args
  	new_name = "__minitest_stub__#{name}"
	
  	metaclass = class << self; self; end
  	# ...
    metaclass.send :alias_method, new_name, name

  	metaclass.send :define_method, name do |*args, &blk|
	  # return or execute val_or_callable
	end

    # ...
    yield self
  ensure
    # cleanup...
  end
end
```

There's some further reading on metaclasses and that mysterious `class << self` syntax in the footnotes, but one way to understand the above is to replace the following lines:
```ruby
metaclass = class << self; self; end
metaclass.send :define_method, name do |*args, &blk|
  # ...
end
```

...with:
```ruby
def self.name(*args, &blk)
  # ...
end
```

In other words, `stub` is defining (or overwriting) the method on the object - the type of method (class/instance) being neatly handled by accessing the metaclass. (Note: `self.define_method` would not work for class methods, since `self` returns the class, it would define instance methods.)

The original logic is kept safe by renaming it via `alias_method`, and in the `ensure` block, there is code to reverse this change. These ensure stubbing only takes effect in the stub block.

## Footnotes
Note that metaprogramming, while powerful, comes with a performance and readability cost. Use with care!

For further reading on various topics touched in this article, check these out:
- [Mocks aren't Stubs](https://martinfowler.com/articles/mocksArentStubs.html) by Martin Fowler
- Notes on [Metaprogramming](https://cs.lmu.edu/~ray/notes/metaprogramming/) by Ray Toal
- Ruby metaclasses:
  - [Ruby Metaprogramming Is Even Cooler Than It Sounds](https://www.toptal.com/ruby/ruby-metaprogramming-cooler-than-it-sounds) by Nikola Todorovic
  - [Diving into Ruby Singleton Classes](https://medium.com/@leo_hetsch/demystifying-singleton-classes-in-ruby-caf3fa4c9d91) by Léonard Hetsch
  - [Metaprogramming in Ruby: It's All About the Self](https://yehudakatz.com/2009/11/15/metaprogramming-in-ruby-its-all-about-the-self/) by Yehuda Katz
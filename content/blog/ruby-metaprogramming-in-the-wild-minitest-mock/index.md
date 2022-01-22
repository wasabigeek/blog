---
title: "Ruby Metaprogramming in the Wild: minitest/mock"
date: "2022-01-22"
description: "minitest/mock is a tiny library that nevertheless provides a wealth of examples for metaprogramming in Ruby - let's take a look!"
published: false
tags: ["ruby", "metaprogramming", "testing"]
---

`minitest/mock` ([repo](https://github.com/seattlerb/minitest/blob/v5.15.0/lib/minitest/mock.rb)) is a tiny library (< 250 lines of code, including comments) that happens to be a great showcase for using [metaprogramming](https://cs.lmu.edu/~ray/notes/metaprogramming/) in Ruby - let's take a look! If you're new-ish to Ruby, I hope this shows how metaprogramming can be done, using practical examples.

## Define expected method calls with method_missing

The main feature of `minitest/mock` is the `Mock` class, which can be used to test that a method is called, for example:

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

Notice that there's nowhere in the [library](https://github.com/seattlerb/minitest/blob/v5.15.0/lib/minitest/mock.rb) where the method `bar` is explicitly defined in the `Mock` class, yet running the above doesn't raise any NoMethodErrors. We were able "define" (well, not exactly, but we'll get to that) a new method even after the mock object was already instantiated via the `expect` call.

The truth is `expect` ([source code](https://github.com/seattlerb/minitest/blob/v5.15.0/lib/minitest/mock.rb#L81-L92)) is straightforward Ruby; it saves the expected call to an Array instance variable - no new method gets defined! The magic is the use of Ruby's `method_missing` ([source code](https://github.com/seattlerb/minitest/blob/v5.15.0/lib/minitest/mock.rb#L118)):

```ruby
# lib/minitest/mock.rb#L118
def method_missing sym, *args, &block
  # ...

  expected_call = @expected_calls[sym][index]

  # ...

  @actual_calls[sym] << {
    :retval => retval,
    :args => zipped_args.map! { |mod, a| mod === a ? mod : a },
  }
end
```

If a method is called on a Ruby that doesn't exist, Ruby will invoke `method_missing` with a few arguments:

- the method's name in symbol form (`sym` in the above example)
- the arguments (`*args` ) and block (`&block`) passed to the non-existent method

`Minitest::Mock` uses this to catch any method called and check it against the saved expectations.

## Remove inherited methods via undef_method

While `Minitest::Mock` doesn't explicitly define many methods, it does inherit methods from Ruby's `Object` class, such as `#nil?`.

What if we want to check that a mock receives a method call, like `#nil?`? Without any intervention, `method_missing` would _not_ be invoked, since those methods exist! Something like this would happen:

```ruby
mock.expects(:nil?, true)
mock.nil? # => false (this is the default for Object!)
mock.verify # raises MockExpectationError, because the original `#nil?` method is called instead of `method_missing`!
```

So what the library does here is to undefine them when the class is interpreted. `instance_methods` is used to _introspect_ the class for any instance_methods, which are removed via `undef_method`:

```ruby
# class Mock
# L26
instance_methods.each do |m|
  undef_method m unless overridden_methods.include?(m.to_s) || m =~ /^__/
end
```

Calling `#nil?` now would properly invoke `method_missing`.

## Redefining Methods with define_method

In the code above, we saw that not all `instance_methods` were removed, there are some `overridden_methods` (e.g. `inspect`) where the library opts to keep the default implementation _unless_ the user has explicitly set an expectation:

```ruby
class Mock
  # L30
  overridden_methods.map(&:to_sym).each do |method_id|
    define_method method_id do |*args, &b|
	  if @expected_calls.key? method_id then
		method_missing(method_id, *args, &b)
	  else
		super(*args, &b)
	  end
	end
  end
  # ...
end
```

For the most part, these seem to be so that a `Minitest::Mock` instance still looks like one 😄.

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

Since `Object` is the ancestor of all (?) Ruby objects (including Classes and Modules), we are able to call `stub` on basically anything. The actual implementation of `stub` is the interesting bit, introducing us to Ruby's "metaclasses" (also known as "singleton classes" or "eigenclasses"):

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

Metaclasses are a pretty deep topic which I am ill-equipped to elaborate on, but one way to look at the above is to replace the following lines:

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

In other words, it redefines the method on the object. The original method is kept safe by renaming it via `alias_method`, and in the `ensure` block, there is code to reverse this change. These ensure that the stubbing only takes effect in it's block.

For further reading on metaclasses, check these out:

- https://www.toptal.com/ruby/ruby-metaprogramming-cooler-than-it-sounds#metaclasses
- https://medium.com/@leo_hetsch/demystifying-singleton-classes-in-ruby-caf3fa4c9d91

---
title: Overspecifying Tests - the Employee Report Kata
date: "2022-06-22"
description: "Overspecification is when a test unintentionally tests more than it should. Why is this bad? Let's walk through a short kata that brings this to life."
published: true
tags: ["katas", "testing"]
---
I paired recently with [@andyw8](https://twitter.com/andyw8) on the [Employee Report kata](https://codingdojo.org/kata/Employee-Report/), which illustrates how tests become more difficult to maintain if they are "overspecified". For such an unassuming kata, we found a lot to discuss and ponder about. I found his refactoring particularly interesting and wanted to share it.

⚠️ **STOP**: Before going further, you may want to try the kata for yourself (it's pretty short!). When I try katas unprompted and then look through someone else's solution, I either learn more from their solution or can take a more critical viewpoint.

## What is overspecifying?
At least in the context of the kata, overspecification is when a test unintentionally (or intentionally) tests more than it should. This couples the test to those additional behaviours, causing the test to fail if those behaviours change. Walking through the kata gives us some great examples, so let's dive into it!

## First Requirement: 18 and above
Given some employee data, we first want to exclude employees <18 years of age from working on Sundays:
```ruby
employees = [
  { name: 'Max', age: 17 }, # exclude
  { name: 'Sepp', age: 18 },
  { name: 'Nina', age: 15 }, # exclude
  { name: 'Mike', age: 51 }
]
```

Because the kata encourages us not to look at future requirements, we might write a test like so:
```ruby
class EmployeeReportTest < Minitest::Test
  def test_return_employees_older_than_18
    employees = [
      { name: 'Max', age: 17 },
      { name: 'Sepp', age: 18 },
      { name: 'Nina', age: 15 },
      { name: 'Mike', age: 51 }
    ]
    result = EmployeeReport.new(employees).sunday_allowed_employees
  
    assert_equal ['Sepp', 'Mike'], result.map { |employee| employee[:name] }
  end
end
```

And then get it [passing](https://github.com/wasabigeek/katas/pull/4/commits/afd4bc1b0dd5eb80d4514d2464959dba2b3da962).

## Second Requirement: Sorted Names
The second requirement is to sort employees by name. We write another failing test:

```ruby
class EmployeeReportTest < Minitest::Test
  def test_return_employees_older_than_18
    # ...
  end

  def test_result_sorted_by_name
    # include only employees that are >18 to keep the test focused.
    employees = [
      { name: 'Sepp', age: 18 },
      { name: 'Mike', age: 51 }
    ]
    result = EmployeeReport.new(employees).sunday_allowed_employees

    # the only difference in the assertion from the previous test is the order.
    # the requirement wasn't specific, so we default to alphabetical order. 
    assert_equal ['Mike', 'Sepp'], result.map { |employee| employee[:name] }
  end
end
```

To get it passing, we do a small [refactor](https://github.com/wasabigeek/katas/pull/4/commits/4ba5627a4dfb328356f56a3d8d704931b4a6e31e) before [addressing the requirement](https://github.com/wasabigeek/katas/pull/4/commits/195588d660ca67865a39e2703acfd51b6d2c5f51)... **only to have the first test fail**. This is in spite of the logic being accurate (our results still only exclude employees <18 years) and makes it clear that our first test also implicitly tested the ordering.

To fix the first test, we could `sort` both expected and actual arguments, but a more explicit (and slightly verbose) way is to use assertions that better capture our intent:
```ruby
class EmployeeReportTest < Minitest::Test
  def test_return_employees_older_than_18
    # ...
  
    result_names = result.map { |employee| employee[:name] }
    assert_includes result_names, 'Sepp'
    assert_includes result_names, 'Mike'
    refute_includes result_names, 'Max'
    refute_includes result_names, 'Nina'
  end

  def test_result_sorted_by_name
    # ...
  end
end
```

This decouples the first test from the ordering of the result, but there is still at least one hidden coupling...

## Third Requirement: All Caps
Now, we have to capitalize all the names:
```ruby
class EmployeeReportTest < Minitest::Test
  def test_return_employees_older_than_18
    # ...
  end

  def test_result_sorted_by_name
    # ...
  end

  def test_results_are_capitalised
    employees = [
      { name: 'Sepp', age: 18 },
      { name: 'Mike', age: 51 }
    ]
    result = EmployeeReport.new(employees).sunday_allowed_employees

    # OK, you got us, we are potentially overspecifying here too 😝.
    assert_equal ['MIKE', 'SEPP'], result.map { |employee| employee[:name] }
  end 
end
```

We naively implement the third requirement with some [ugly code](https://github.com/wasabigeek/katas/pull/4/commits/6505cdd7c44f92a0e201a76f406351bf002cb556). Our new test passes, but guess what? **Our first two tests are now failing** 😔. Turns out they were also implicitly testing that an employee's attribute was in a certain format, when all we actually wanted to check was that the employee itself was included (properties VS identity?).

## Optional: Refactoring to Objects
Now we could simply change all the tests to check for capitalized names, but I thought the refactoring @andyw8 proposed was very cool (though you can poke holes in it, see the [afterword](/blog/overspecifying-tests-the-employee-report-kata/#afterword)). Could we get the tests to compare the "identity" of the employees, instead of one of their attributes? e.g.:
```ruby
class EmployeeReportTest < Minitest::Test
  def test_return_employees_older_than_18
    employees = [
      # note the new Employee class.
      # (also, tried to minimise test data even more.)
      max = Employee.new(name: 'Max', age: 17),
      sepp = Employee.new(name: 'Sepp', age: 18),
      mike = Employee.new(name: 'Mike', age: 51)
    ]
    result = EmployeeReport.new(employees).sunday_allowed_employees
    # now this test doesn't rely on the attributes of an employee!
    assert_includes result, sepp
    assert_includes result, mike
    refute_includes result, max
  end
  
  def test_result_sorted_by_name
    employees = [
      sepp = Employee.new(name: 'Sepp', age: 18),
      mike = Employee.new(name: 'Mike', age: 51)
    ]
    result = EmployeeReport.new(employees).sunday_allowed_employees
    assert_equal [mike, sepp], result
  end

  def test_results_are_capitalised
    employees = [Employee.new(name: 'Sepp', age: 18)]

    result = EmployeeReport.new(employees).sunday_allowed_employees
    assert_equal result.first.name, 'SEPP'
  end
end
```

Note that some liberties were taken since the requirements gave us a lot of autonomy: we assumed that we had some way to convert the input (an array of hashes) into objects, and that the output could also be a set of objects.

In the context of the kata, this refactoring is optional because the way the final requirement is written doesn't require it. But it's a really good example of how we can encapsulate logic in objects! I did have to take quite a few steps (you can follow the [PR](https://github.com/wasabigeek/katas/commits/employee-report) history) to "safely" refactor, but the end result is quite satisfying.

## Fourth Requirement: Sort Descending
We now want the names to be in descending order. Since we already have a test for ordering, we can modify that instead of creating a new one:

```ruby
class EmployeeReportTest < Minitest::Test
  def test_return_employees_older_than_18
    # ...
  end

  def test_result_sorted_by_names_descending
    # ...

    # swap the ordering
    assert_equal [sepp, mike], result
  end

  def test_results_are_capitalised
    # ...
  end
end
```

With the newly refactored Employee class, we can [modify the comparison method](https://github.com/wasabigeek/katas/pull/4/commits/6fac6fb78bbee0aac80ad722ee997db28a45ed24) `<=>` (a.k.a. the "spaceship" operator). This time, **we have successfully defeated overspecification** - none of our other tests fail!

Or have we?

## Takeaways
I don't think most of us _intentionally_ overspecify our tests, so this kata is more a reminder to compare what we're _actually_ testing VS what we _want_ to test. Could we be more specific?

From the kata, some possible heuristics (we all know that heuristics don't always work, right?):
- when checking for the presence of an object in a result, avoid comparing the arrays/enumerables directly.
- when comparing objects, avoid comparing by their attributes and try to find some way to compare their identity instead.

## Afterword
I had a lot of fun doing this kata, and @andyw8's refactoring reminded me of why I appreciate object-oriented programming. That said, there are some decisions made in the refactoring that can be debated or improved:
- `Employee#name` always returns the capitalized name. This might not be an assumption we want to apply application-wide (e.g. what if we wanted another report that only capitalizes the initials), and could be considered too pre-emptive.
- `Employee#<=>` could be similarly argued, though IMO this seems more broadly applicable across an application as a "default" sort.
- In our tests, we are relying on comparison of the Ruby object ids, meaning that the EmployeeReport class _must_ return the exact instances that were passed into it. If some step in between created new instances (e.g. for immutability), these tests would fail. (I think this can be easily resolved through adding `Employee#==` though.)

For the first two points, we won't truly know if the refactor was "right" or "wrong" until we get new requirements! So, [observe future changes, and continue to refactor if necessary](https://wasabigeek.com/blog/coupling-and-cohesion-is-a-tradeoff/#refactoring-is-important).

There are also some decisions that could be worth expounding on... another time:
- not memoizing the array of employee data, instead choosing to "duplicate" for each test (eventually we purposefully changed the data for each test).
- choosing to have many focused tests, when perhaps one big test might have achieved a similar result.


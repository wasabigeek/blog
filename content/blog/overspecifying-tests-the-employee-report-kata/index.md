---
title: Overspecifying Tests - the Employee Report Kata
date: "2022-06-22"
description: "Overspecification is when a test unintentionally tests more than it should. Why is this bad? Let's walk through a short kata that brings this to life."
published: true
tags: ["katas", "testing"]
---
I paired recently with [@andyw8](https://twitter.com/andyw8) on the Employee Report kata[^1], which illustrates how tests become more difficult to maintain if they are "overspecified". For such an unassuming kata, we found a lot to discuss and ponder about. I found his refactoring particularly interesting and wanted to share it.

[^1]: What is a kata? The term has [origins](https://en.m.wikipedia.org/wiki/Kata) in martial arts, but in software it seems to generally refer to practice exercises. I like the parallel of following and repeating a certain set of movements, but I don't think everyone subscribes to this specific interpretation.

## What is Overspecifying?
In the context of the kata, a test is overspecified when it unintentionally (or intentionally?) tests _more_ than it should. This couples the test to those additional behaviours, causing the test to fail if those behaviours change.  Walking through the kata gives us some great examples, so let's learn while doing!

## The Kata
The [instructions](https://codingdojo.org/kata/Employee-Report/) are to build a program for a shop owner. The program should generate a report of employees allowed to work on Sundays, given input data like the following:
```ruby
employees = [
  { name: 'Max', age: 17 },
  { name: 'Sepp', age: 18 },
  { name: 'Nina', age: 15 },
  { name: 'Mike', age: 51 }
]
```

There are 4 requirements, and you're encouraged _not_ to look ahead, instead testing and implementing one requirement at a time. We'll use Ruby and Minitest in our example.

>💡 **Suggestion**: Before going further, you may want to try the kata for yourself - it's pretty short! When I try katas unprompted and then look through someone else's solution, I either learn more from their solution or can take a more critical viewpoint.

## First Requirement: 18 and above
We first want to exclude employees <18 years of age. This is our first test:
```ruby
class EmployeeReportTest < Minitest::Test
  def test_return_employees_older_than_18
    employees = [
      { name: 'Max', age: 17 }, # exclude
      { name: 'Sepp', age: 18 },
      { name: 'Nina', age: 15 }, # exclude
      { name: 'Mike', age: 51 }
    ]
    result = EmployeeReport.new(employees).sunday_allowed_employees
  
    assert_equal ['Sepp', 'Mike'], result.map { |employee| employee[:name] }
  end
end
```

We then write the [code](https://github.com/wasabigeek/katas/pull/4/commits/afd4bc1b0dd5eb80d4514d2464959dba2b3da962) to get the test passing ✅. (I'll mostly link out the implementations because I think it's secondary to the point of the kata.)

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

    # the only difference from the previous test is the order of the result.
    # the requirement wasn't specific, so we default to alphabetical order. 
    assert_equal ['Mike', 'Sepp'], result.map { |employee| employee[:name] }
  end
end
```

We do a small [refactor](https://github.com/wasabigeek/katas/pull/4/commits/4ba5627a4dfb328356f56a3d8d704931b4a6e31e) before [addressing the requirement](https://github.com/wasabigeek/katas/pull/4/commits/195588d660ca67865a39e2703acfd51b6d2c5f51).  Our new test passes! ✅

One problem: when we run all the tests, **the first test fails** ❌. This is in spite of the logic being accurate (our results still excludes employees <18 years). It's clear that in addition to checking that employees were filtered out, our first test _also_ implicitly tested the ordering.

RSpec has a matcher called `contain_exactly` that disregards the ordering. Minitest does not, but we could easily `sort` the expected and actual results so that it disregards ordering:
```ruby
class EmployeeReportTest < Minitest::Test
  def test_return_employees_older_than_18
    # ...
  
    result_names = result.map { |employee| employee[:name] }
    assert_equal ['Sepp', 'Mike'].sort, result_names.sort
  end

  def test_result_sorted_by_name
    # ...
  end
end
```

(EDIT: our previous implementation used `assert`/`refute_includes` to convey the intent that we're checking only for the presence of certain employees. [@deliberatecoder](https://twitter.com/deliberatecoder) correctly pointed out that this would not catch duplicate employees. I think this new implementation still captures the intent of the test, which is that we return only employees >18 years old.)

Now the first test is decoupled from the ordering of the result, but there is still at least one hidden coupling...

## Third Requirement: All Caps
Now, we are asked to uppercase all the names:
```ruby
class EmployeeReportTest < Minitest::Test
  def test_return_employees_older_than_18
    # ...
  end

  def test_result_sorted_by_name
    # ...
  end

  def test_results_are_uppercased
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

We naively implement the third requirement with some [ugly code](https://github.com/wasabigeek/katas/pull/4/commits/6505cdd7c44f92a0e201a76f406351bf002cb556). Our new test passes ✅, but guess what? **Our first two tests are now failing** ❌. Turns out they were also implicitly testing that an employee's attribute was in a certain format, when all we actually wanted to check was that the employee itself was included (properties VS identity?).

## Optional: Refactoring to Objects
Now we could simply change all the tests to check for capitalized names, but I thought the refactoring @andyw8 proposed was very cool (though you can poke holes in it, see the [afterword](/blog/overspecifying-tests-the-employee-report-kata/#afterword)). Could we get the tests to compare the "identity" of the employees, instead of one of their attributes? 

What we did was to introduce a new `Employee` class and use that during comparisons, instead of checking for an attribute e.g.:
```ruby
class EmployeeReportTest < Minitest::Test
  def test_return_employees_older_than_18
    employees = [
      # Note the new Employee class.
      max = Employee.new(name: 'Max', age: 17),
      sepp = Employee.new(name: 'Sepp', age: 18),
      mike = Employee.new(name: 'Mike', age: 51)
    ]
    result = EmployeeReport.new(employees).sunday_allowed_employees
    # We're now comparing the Employee objects,
    # instead of their attributes.
    assert_contains_exactly [sepp, mike], result
  end
  
  def test_result_sorted_by_name
    employees = [
      sepp = Employee.new(name: 'Sepp', age: 18),
      mike = Employee.new(name: 'Mike', age: 51)
    ]
    result = EmployeeReport.new(employees).sunday_allowed_employees
    # Same here - this test doesn't rely on the 
    # attributes of an employee!
    assert_equal [mike, sepp], result
  end

  def test_results_are_uppercased
    employees = [Employee.new(name: 'Sepp', age: 18)]

    result = EmployeeReport.new(employees).sunday_allowed_employees
    assert_equal result.first.name, 'SEPP'
  end

  private

  def assert_contains_exactly(expected, actual)
    assert_equal(expected.sort, result.sort)
  end
end
```

Note that some liberties were taken since the requirements gave us a lot of autonomy: we assumed that we had some way to convert the input (an array of hashes) into objects, and that the output could also be a set of objects.

In the context of the kata, this refactoring is optional because the way the final requirement is written doesn't require it. But it's a really good example of how we can encapsulate logic in objects! I did have to take quite a few steps (you can follow the [commits](https://github.com/wasabigeek/katas/compare/14ab7ffe4a9ce2d780c9dfa7231e5f25f3a40e38...6fac6fb78bbee0aac80ad722ee997db28a45ed24) here) to "safely" refactor, but the end result is quite satisfying.

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

  def test_results_are_uppercased
    # ...
  end
end
```

With the newly refactored Employee class, we can [modify the comparison method](https://github.com/wasabigeek/katas/pull/4/commits/6fac6fb78bbee0aac80ad722ee997db28a45ed24) `<=>` (a.k.a. the "spaceship" operator). This time, none of our other tests fail ✅ - **we have successfully defeated overspecification**!

Or have we?

## Takeaways
I don't think most of us _intentionally_ overspecify our tests, so this kata is more a reminder to compare what we're _actually_ testing VS what we _want_ to test. Could we be more specific?

From the kata, some possible heuristics (we all know that heuristics don't always work, right?):
- when checking for the presence of an object in a result, avoid implicitly comparing the ordering.
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


---
title: Don’t give up on your Rails Generators!
date: "2021-03-14"
description: "Most devs quickly stop using Rail's built-in generators. This is a pity, as generators can help improve team productivity - we just need to tweak them. In this post, we'll explore customising the rake task generator."
published: true
tags: ["rails-generators"]
---

Many Rails devs I've spoken to quickly stop using the built-in generators - the common reason is that the generated files no longer suit the project, so it’s easier to start from scratch rather generate and then modify them. What a pity! To paraphrase DHH, generators can help **improve team productivity** and **encourage consistency** - we just need to tweak them.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">A good way to get more people to do the right thing: Generate the pattern by default via built-in generators. Like we do with tests etc.</p>&mdash; DHH (@dhh) <a href="https://twitter.com/dhh/status/176466771698659328?ref_src=twsrc%5Etfw">March 5, 2012</a></blockquote>

In this post, I look at one approach for customising generators, based on one we customised recently at work: the rake task generator.

## TL;DR on Overriding a Generator

- Copy over the Generator classes to `/lib/generators/...` and modify
- Copy over the template file to `/lib/templates/...` and modify
- Bonus: Use `hook_for` to generate a test file if the generator doesn’t do it automatically

## The Problem

At work, we use rake tasks quite a fair bit, both for cron-like jobs and one-off migration or support tasks. Rails has a built-in [task generator](https://github.com/rails/rails/blob/main/railties/lib/rails/generators/rails/task/USAGE), with the form:

```bash
bin/rails g task file_name [action]
```

It’s never quite worked for us:

- We like to keep one task “action” per file, with the file named the same as the action - this makes it easier to grep for the task. The built-in generator requires separate `file_name` and `action` arguments, which is a little unnecessary.
- We sometimes namespace tasks e.g. with a “onetime” namespace for one-off tasks, but the built-in generator ignores paths in the `file_name` and also uses the `file_name` as the namespace.
- We write tests for our rake tasks, but the generator doesn’t create test files.

Let’s address these! There are different approaches available, but in this case it made sense to override the generator entirely - the team wasn’t using it, so we weren’t breaking established conventions.

## Overriding the Task Generator

Rails searches for generators in a [few paths](https://guides.rubyonrails.org/generators.html#generators-lookup), so as long as we place our file in `/lib/generators/task/task_generator.rb`, Rails will load our custom file instead.

We’ll copy over the original task generator to use as a base. Most of the default generators can be found in `railties/lib/rails/generators/rails`, the one we’re after is [here](https://github.com/rails/rails/blob/main/railties/lib/rails/generators/rails/task/task_generator.rb):

```ruby
module Rails
  module Generators
    class TaskGenerator < NamedBase # :nodoc:
      argument :actions, type: :array, default: [], banner: "action action"

      def create_task_files
        template "task.rb", File.join("lib/tasks", "#{file_name}.rake")
      end
    end
  end
end
```

Copy it over to `/lib/rails/generators/task/task_generator.rb`. As a simple sanity check to see if we've overridden the class, let’s make the generator spit out a hardcoded file name and run it. Change this line:

```ruby
template "task.rb", File.join("lib/tasks", "hardcoded_file_name.rake")
```

Then run the command:

```bash
bin/rails g task path/to/my_task
# create  lib/tasks/hardcoded_file_name.rake
```

It works! Let's revert the hardcoding and leave the rest of the class as-is for now. We'll be back, promise.

## Overriding the Generator Template

We'll going to be customising the template as well, so let's override that. When invoked, generators search for templates in a different set of paths from the invoker (I explored this more in another [post](https://wasabigeek.com/blog/customising-generator-templates-in-rails-gems-too/)) - we'll be wanting to place our template at `/lib/templates/rails/task/task.rb.tt`.

Copy the [original](https://github.com/rails/rails/blob/main/railties/lib/rails/generators/rails/task/templates/task.rb.tt) and modify it as such (the lack of indentation is intentional):

```bash
<% class_path.each_with_index do |path_fragment, index| -%>
<%= indent("namespace :#{path_fragment}", index * 2) %> do
<% end -%>
<% content = capture do -%>
desc "TODO"
task <%= file_name %>: :environment do
end
<% end -%>
<%= indent(content, class_path.size * 2) %>
<% (0...class_path.size).reverse_each do |index| -%>
<%= indent('end', index * 2) %>
<% end -%>
```

Let's breakdown the changes. First, we'll sort our name-spacing, including the indentation (note that `indent` is actually a private method on `Rails::Generators::Base`, so you won't be able to use it in your regular view templates):

```
<% class_path.each_with_index do |path_fragment, index| -%>
<%= indent("namespace :#{path_fragment}", index * 2) %> do
<% end -%>
...
<% (0...class_path.size).reverse_each do |index| -%>
<%= indent('end', index * 2) %>
<% end -%>
```

With the previous command `bin/rails g task path/to/my_task`, the above results in:

```
namespace :path do
  namespace :to do
    ...
  end
end
```

Now lets sort the task itself:

```
...
<% content = capture do -%>
desc "TODO"
task <%= file_name %>: :environment do
end
<% end -%>
<%= indent(content, class_path.size * 2) %>
...
```

Here, we indent the task description strings by first assigning it to a variable, `content` via the `capture` helper. Then, we indent and insert it into the file. So running the command again will give us:

```
namespace :path do
  namespace :to do
    desc "TODO"
    task my_task: :environment do
    end

  end
end
```

Almost there! Our file is still being created as `/lib/tasks/my_task.rake` though, instead of `/lib/tasks/path/to/my_task.rake`.

## Fixing the Generated Path

Let's fix that. Here's the diff for our generator:

```diff
4,5d3
<       argument :actions, type: :array, default: [], banner: "action action"
<
7c5
<         template "task.rb", File.join("lib/tasks", "#{file_name}.rake")
---
>         template "task.rb", File.join("lib/tasks", class_path, "#{file_name}.rake")
```

We've removed the unnecessary `actions` argument and added the `class_path` to the generated file's path. Running the command again nests the file nicely now.

## Hooking in a Test file

“Should you test rake tasks?”... is not a discussion for this article, let’s assume you do! We can customise our generator to create a test file.

The method we’re looking for is [hook_for](https://api.rubyonrails.org/v6.1.3/classes/Rails/Generators/Base.html#method-c-hook_for), which will cause the generator to attempt to also invoke other generators. Add the following DSL to your generator class:

```ruby
hook_for :test_framework
```

In short, this attempts to invoke `Rspec::Generators::TaskGenerator`, which... doesn’t exist yet. Let’s resolve that.

## Adding RSpec Generator and Template

RSpec doesn’t have a custom generator for tasks, but the steps for overriding it are more or less the same. Let’s start by creating the TaskGenerator class in `/lib/generators/rspec/task/task_generator.rb`:

```ruby
# frozen_string_literal: true

require 'generators/rspec'

module Rspec
  module Generators
    class TaskGenerator < Base # :nodoc:
      def create_task_specs
        template "task_spec.rb", File.join("spec/tasks", class_path, "#{file_name}_rake_spec.rb")
      end
    end
  end
end
```

Next, we need to create the corresponding template in `/lib/templates/rspec/task/task_spec.rb.tt` (note: we can definitely DRY this out more, you might be able to draw some inspiration from these examples by [Thoughtbot](https://thoughtbot.com/blog/test-rake-tasks-like-a-boss) and [10Pines](https://blog.10pines.com/2019/01/14/testing-rake-tasks/)):

```ruby
require 'rails_helper'
require 'rake'

describe '<%= class_path.join(':') %>' do
  describe ':<%= file_name %>' do
    before(:all) do
      Rake::Task.define_task(:environment)
      Rake.application = rake = Rake::Application.new
      rake.rake_require 'tasks/<%= File.join(class_path, file_name) %>'
      @task = rake['<%= class_path.concat([file_name]).join(':') %>']
    end

    it 'works' do
      @task.execute
    end
  end
end
```

With that done, running the generator command now creates the files just as we wanted. Neat!

## Go forth and generate!

I hope this has given you some inspiration to give generators a second chance - with a little tweaking, they can be really useful in saving time for you and your team. What ideas do you have for improving your generators?

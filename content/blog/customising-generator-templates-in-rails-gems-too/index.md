---
title: Customising Generator Templates in Rails (Gems too!)
date: "2020-11-07T20:32:03.284Z"
description: "Overriding the default templates in Rails and gems is simple and impactful early on in a project. Find out how."
published: true
---

Rails' generators are a great boon to the Indie Hacker<sup>TM</sup> or Solo Developer<sup>TM</sup>. Running `rails g scaffold ...` will quickly bootstrap the full stack for a model, creating the routes, controllers, views and even tests.

As you start customising and standardising your interface though, the default templates get less and less useful - most of the generated code doesn't fit your layout or setup, and you end up deleting most of it or skipping them.

## What if we could change the... templates?

Rails actually gives you a lot of [control](https://guides.rubyonrails.org/generators.html) over the generators, but early on in a project, perhaps the most impactful _and_ simple thing to do is to override the [templates](https://guides.rubyonrails.org/generators.html#customizing-your-workflow-by-changing-generators-templates).

Let's look at an example. Normally Rails would generate a `show.html` that looks something like this:
```
<p id="notice"><%= notice %></p>

<p>
  <strong>Attribute:</strong>
  <%= @object.attribute %>
</p>

<%= link_to 'Edit', edit_object_path(@object) %> |
<%= link_to 'Back', object_path %>
```
For a personal project, I've made mine generate something like:
```
<% content_for :breadcrumbs do %>
  <div class="...">
    Home > <%= @object.attribute %>
  </div>
<% end %>

<% content_for :heading do %>
  <div class="...">
    <h1 class="...">
      <%= @object.name %>
    </h1>
    <div>
      <%= link_to 'Edit object', edit_object_path(@object), { class: '...' } %>
    </div>
  </div>
<% end %>

<% content_for :main_content do %>
  <div class="...">
    <%= @object.attribute %>
  </div>
<% end %>
```
It's saved me a lot of time!

To do so, simply add a template to your Rails project in `lib/templates/erb/scaffold/show.html.erb`. You can use the [original](https://github.com/rails/rails/blob/master/railties/lib/rails/generators/erb/scaffold/templates/show.html.erb.tt) as a starting point. The other templates can also be easily changed following a similar path. Note the double percentages (`%%`) used to escape ERB tags!

## Bonus: Gems too!

This also works for your gems that have generators (e.g. [rspec-rails](https://github.com/rspec/rspec-rails) or [react-rails](https://github.com/reactjs/react-rails)), though it's not obvious where to place the templates.

Our answer lies in [`Rails::Generators::Base.inherited`](https://github.com/rails/rails/blob/master/railties/lib/rails/generators/base.rb):
```
def self.inherited(base) #:nodoc:
  ...
  Rails::Generators.templates_path.each do |path|
    if base.name.include?("::")
      base.source_paths << File.join(path, base.base_name, base.generator_name)
    else
      base.source_paths << File.join(path, base.generator_name)
    end
  end
  ...
end
```
So, in addition to the `source_root` that most Generators would define, Rails will also search a few extra paths. In general, you should place the template in `lib/templates/<top_level_module>/<generator_class_prefix>/<template_name>`.

For example, `react-rails` has [`React::Generators::ComponentGenerator`](https://github.com/reactjs/react-rails/blob/master/lib/generators/react/component_generator.rb), so if I wanted to replace [`component.es6.jsx`](https://github.com/reactjs/react-rails/blob/master/lib/generators/templates/component.es6.jsx), I would place it in `lib/templates/react/component/component.es6.jsx`.

I hope that helps!

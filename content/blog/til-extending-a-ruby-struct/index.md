---
title: "TIL: Extending a Ruby Struct"
date: "2021-11-07T10:48:03.284Z"
description: "a.k.a. well duh, of course a Struct returns a class."
published: true
---

Last week I had a head-scratching moment looking at the following code (from the [google-api-ruby-client](https://github.com/googleapis/google-api-ruby-client/blob/google-apis-core/v0.4.1/google-apis-core/lib/google/apis/options.rb)):

```ruby
ClientOptions = Struct.new(
    :application_name,
    :application_version,
    :proxy_url,
    :open_timeout_sec,
    :read_timeout_sec,
    :send_timeout_sec,
    :log_http_requests,
    :transparent_gzip_decompression)

# ...

class ClientOptions
    # ...
    def self.default
    @options ||= ClientOptions.new
    end
end
```

My initial confusion stemmed from the assumption that the first `ClientOptions` declaration returned a regular object. A helpful colleague explained to me that `Struct.new` actually returns a subclass of [Struct](https://ruby-doc.org/core-3.0.2/Struct.html). That meant the second `class ClientOptions` declaration was actually _re-opening_ the class to add a method, not to declare a new class.

Why would one want to do this? Well, one would get all the methods of a regular Struct (e.g. accessors, iterators) <s>for free</s> at the cost of the inheritance hierarchy. This could be useful for [ValueObjects](https://martinfowler.com/bliki/ValueObject.html).

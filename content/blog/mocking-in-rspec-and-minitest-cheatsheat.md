---
title: "Mocking in RSpec and Minitest: A Cheatsheet"
date: "2022-01-05T23:21:03.284Z"
description: "A cheatsheet for those who started off with RSpec expectations and mocks, and now need to translate that to Minitest."
published: true
tags: ["ruby", "rails", "testing"]
---

My first exposure to testing in Ruby / Rails was through RSpec, but I'm now using Minitest. It wasn't immediately obvious how to translate rspec-expectations and rspec-mocks to Minitest, so here's my attempt at a cheatsheet:

| RSpec                                       | minitest with [mocha](https://github.com/freerange/mocha)                                                                                                                               | minitest with [minitest/mocks](https://github.com/seattlerb/minitest#mocks-)                                                                                                                                                                                                 |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `double`                                    | `mock` or `stub`                                                                                                                                                                        | `Minitest::Mock.new`                                                                                                                                                                                                                                                         |
| `instance_double`                           | `stub` or `mock.responds_like_instance_of`                                                                                                                                              | Not supported                                                                                                                                                                                                                                                                |
| `expect().to receive().with().and_return()` | `mock.expects().with().returns()`<br/>Note:<ul><li>like RSpec, can also call `expects` on any object, not just a `Mock`/`Stub`</li><li>`with` has limited keyword arg support</li></ul> | `mock = Minitest::Mock.new`<br/>`mock.expects(:method, args, return)`<br/>`mock.verify`<br/>Note: cannot call `expects` on any Object, but make a Mock [delegate to an underlying object](https://github.com/seattlerb/minitest/blob/v5.15.0/lib/minitest/mock.rb#L120-L121) |
| `expect().not_to receive()`                 | `mock.expects().never`                                                                                                                                                                  | If it's a class, technically you could use [`Object#stub`](https://github.com/seattlerb/minitest/blob/v5.15.0/lib/minitest/mock.rb#L214) and raise in the val_or_callable                                                                                                    |
| `expect()... and yield_control()`           | `expects().yields(*parameters)` <br/>See [docs](https://www.rubydoc.info/github/floehopper/mocha/Mocha%2FExpectation:yields)                                                            | Not quite supported since return value is not a callable                                                                                                                                                                                                                     |
| `expect()... and raise_error()`             | `expects().raises(error)` <br/>See [docs](https://www.rubydoc.info/github/floehopper/mocha/Mocha%2FExpectation:raises)                                                                  | Can pass in a block (instead of expected args) to `expects` and raise there                                                                                                                                                                                                  |
| `allow()...`                                | Similar as above but substitute `expects` with `stubs`                                                                                                                                  | Can use [`Object#stub`](https://github.com/seattlerb/minitest/blob/v5.15.0/lib/minitest/mock.rb#L214) if it's a class                                                                                                                                                        |
| `.and_call_original`                        | Not supported (see [reasoning](https://github.com/freerange/mocha/issues/334))                                                                                                          | Not supported                                                                                                                                                                                                                                                                |
| `before` / `after`                          | `setup` / `teardown`<br/>(standard minitest)                                                                                                                                            | `setup` / `teardown` (standard minitest)                                                                                                                                                                                                                                     |
| `allow_any_instance_of.Klass`               | `Klass.any_instance.stubs`                                                                                                                                                              | Not supported                                                                                                                                                                                                                                                                |

Additional Note: Rails minitest is slightly different from pure Minitest https://guides.rubyonrails.org/testing.html.

It's very possible I've gotten something wrong - please feel free to correct in the comments or submit a PR!
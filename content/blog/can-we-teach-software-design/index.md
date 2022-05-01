---
title: "Can we teach software design? A drummer's perspective"
date: "2022-04-29"
description: "Software design is somewhat abstract and difficult to teach. Learning to play the drums is somewhat similar - can we draw some parallels and find a better path forward?"
published: false
tags: ["software-design"]
---
Considering how much software design[^1] is part of a dev's daily work, the availability of good, clear resources seems disproportionate. There's a lot of material on using X library or Y framework, but whenever I've asked or looked up software design,  in general I get some disjointed links to patterns or principles, along with advice that "it comes with experience".

[^1]: Software Design is itself a broad term (see [wikipedia](https://en.wikipedia.org/wiki/Software_design)). Here I think more about "code-level" aspects e.g. how to decompose a problem into different modules, create extensible code. But the thinking could also be applied at "higher-levels" e.g. breaking out microservices.

While there's truth to that advice, I wonder if we could do better. Maybe this is difficult because software design is a pursuit that is relatively abstract and difficult to measure accurately. In that way, it's somewhat similar to creative pursuits. I used to play the drums, and when asking drummers to explain why their idols are so great, it's common to summarise as "they have great feel" - sound familiar?

So, can we draw some parallels between learning to play the drums and software design? Could it improve how we frame and approach the teaching of software design?

## How Drummers Practice
I'd broadly categorise most practice as achieving one of two main goals: "how to play", and "when to play"[^2].

[^2]: In reality, some practice exercises straddle both buckets. There are also other aspects such as being able to sight-read drum score, but I feel they mainly support learning than being an end themselves.

### How to Play
This is mainly about mechanics - building a library of motions (e.g. grooves, fills) and getting comfortable with executing them (e.g. technique, building muscle memory, playing up to speed). These "building blocks" can then be played in sequence to a song.

### When to Play
This is about knowing the "right" sequence of building blocks to play e.g. does the groove fit this song? Is this the right time to play a particular fill? What sort of fill should I play?

There are principles and even some heuristics, such as:
- "play a groove for 3 bars, do a fill on the 4th"
- a mapping of grooves to genres (e.g. you'd often hear the [one-drop](https://en.wikipedia.org/wiki/One_drop_rhythm) in reggae music)

They're important, but knowing these principles and heuristics don't immediately translate to "having great feel". Instead I believe the secret sauce is this: **copying how other drummers play in existing music**.

Copying isn't just about learning "how to play" patterns in the song - as we play to a song, we are also listening to what other musicians are doing, subconsciously connecting drum patterns to things like the melody, intensity of the moment etc. When we next hear a similar type of song, we instinctively know what patterns would likely fit, even if we've never heard the drum parts before.

"Experience" and more free-form practice is still a key part of learning, but I believe copying helps quickly build "feel" for what works, reducing the amount of trial-and-error needed.

## What are we missing in Software Design?
Here are similarities I found in practicing software design:
- **"How to play"**:
   - Design Patterns, Refactoring Techniques
- **"When to play"**:
  - Principles and Heuristics (SOLID, DRY, [information hiding](https://wasabigeek.com/blog/what-does-a-1972-paper-have-to-do-with-the-single-responsibility-principle/), abstraction etc.)
  - Trial-and-error via design katas and actual coding
  - Code Reviews
  - **Reading and/or copying code** (e.g. open source)

On the surface, reading and copying code seems like a parallel to copying music, but I feel there's a deficiency - we can generally tell what "good" music is, whether instinctively or by looking at genre top charts.

I feel we don't really have the same for software design (or if we do, it's not well-known).

Maybe it's because not everyone agrees on what constitutes a good design (we tend to argue using principles, which inherently require additional nuance), but I think it's also because while there are foundational aspects of a good design, a sizable part of it contextual. Meaning unless one understands the context behind a design choice, copying blindly is basically trial-and-error (inefficient).

The contextual element is also tricky given that a key goal of design is to reduce cost over time i.e. we can only really tell if a design was good in retrospect.

## Can we do better?
TODO
I don't have an answer actually, but maybe:
- What if we started talking more openly about designs that worked out well in retrospect?
   - It doesn't have to be universally agreed, after all everyone has different music tastes
   - But it must contain context and explanation of why it worked
 - Or more generally, talked more openly about decision-making behind designs?
    - IMO, 99 bottles is a great example, especially given that it has elements of how the design worked over time

Please correct me


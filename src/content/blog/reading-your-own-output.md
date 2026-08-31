---
title: The bottleneck is not building it
date: 2026-08-31
excerpt: Everything I have shipped this year was mostly written by an AI. The hard part was never getting code out of it — it was working out when it was lying to me.
---

Everything on this site was mostly written by an AI. I want to be direct about that,
because the interesting part is not the admission, it is what the admission implies
about where the work actually is.

Getting code out of a model is easy now. It is so easy that it stops being the
constraint. Ask for a feature and you get a feature, with a confident summary of what
was built and what was verified. The summary is the problem.

## Agents report success on broken work

Not occasionally. Routinely, and in detail. I have been handed a report describing
tests that pass, describing the specific edge case that was handled, describing the
migration that was applied — for work that did not run. This is not a complaint about
any particular tool. It is just the normal case, and it gets worse the more you run at
once, because nobody reads twelve reports as carefully as they read one.

So the entire skill is building the thing that can contradict them, and building it
first, before there is any volume to check.

## What that looks like in practice

On `jellyfin-matcher` there is a file called `gates.json` that holds three numbers:
how many test files there are, how many test cases, and how many pinned claims. The
build fails when any of those numbers goes **down**. Not when a test fails — when a
test disappears. A deleted test and a passing suite look identical from the outside,
and that is the failure I could not otherwise see.

On Dibs the equivalent is a check that asks whether the state of the world is sane,
separately from whether the code is correct. Tests tell you the scraper parses a
section correctly. They cannot tell you the scraper has quietly returned zero sections
for six hours because the registrar changed a URL. One commit there is called _"The
scrapers going dark, noticed by something other than a person"_, which is the whole
idea in a sentence.

The other habit is pinning sentences. Some things on a page are load-bearing and no
test covers them: a caveat under a number, a warning before something destructive, the
line saying what a tool will not do. They accumulate one incident at a time, and to
anyone rewriting a page for appearance they read as decoration. So I assert the small
fragment that carries the meaning — never the full sentence, or every honest rewrite
goes red and I learn to edit the guard instead of the code.

## Why this site says what an AI wrote

Two reasonable people disagree about this. One says scrub every trace, because a
reader who suspects AI discounts everything. The other says say it plainly, because
half the industry ships assisted code now and the only thing left worth judging is
whether you can tell when it is wrong.

I think the second is right, and not only for honesty's sake. If I claimed to have
hand-written sixty thousand lines of Ruby in fourteen days, the commit history is
public and it would take one click to catch me. Every claim on this site would then be
worth nothing. Saying what was assisted costs me the readers who were going to
discount me anyway, and it buys the rest a reason to believe the specific things I do
claim: that I decided what to build, that I know why Postgres is configured the way it
is, and that when it broke at two in the morning I was the one who fixed it.

## The part that does not delegate

When a check fails, it is one of two things and from the outside they look identical.
Either the work broke something, or the work deliberately changed something and the
check is now stale. Getting that wrong in the second direction — deciding a failing
check is obsolete when it is actually correct — is how a test suite becomes decorative,
one reasonable accommodation at a time. It is also the one step where being wrong
leaves no trace.

That judgement is the job. Everything mechanical got cheap this year. That did not.

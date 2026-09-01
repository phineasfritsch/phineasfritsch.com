---
title: The bottleneck is not building it
date: 2026-08-31
excerpt: The code in everything I have shipped this year was mostly written by an AI. The hard part was never getting code out of it — it was working out when it was lying to me.
---

The code behind everything on this site was mostly written by an AI. The writing,
including this, is mine.

Getting code out of a model is easy now. It is so easy that it stops being the
constraint. Ask for a feature and you get a feature, with a confident summary of what
was built and what was verified. The summary is the problem.

## Agents report success on broken work

This happens constantly, and it is not a complaint about any particular tool. The
reports are detailed and specific: which tests passed, which edge case got handled,
which migration was applied. Sometimes none of it ran. Nothing about the report tells
you which kind you are holding, which is the entire problem.

It gets worse the more you run at once, for the boring reason that nobody reads twelve
reports as carefully as they read one. So the thing to build first is whatever can
contradict them, before there is any volume to check.

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
line saying what a tool will not do. Each one is usually there because
something went wrong once, and to anyone rewriting a page for appearance they read as
decoration. So I assert the small
fragment that carries the meaning — never the full sentence, or every honest rewrite
goes red and I learn to edit the guard instead of the code.

## Why this site says what an AI wrote

The argument for hiding it is that a reader who suspects AI discounts everything, and
that is a real cost. I will lose some of you on this page. I say it anyway, and not
only for honesty's sake. If I claimed to have
hand-written sixty thousand lines of Ruby in fourteen days, one question from anyone
who has read a codebase that size would catch me, and the histories are public and one
clone would catch me: [Dibs](https://github.com/phineasfritsch/ge_snipe),
[this site](https://github.com/phineasfritsch/phineasfritsch.com/tree/claude/operator-manual-agent-systems-tmrdiz),
[jellyfin-matcher](https://github.com/phineasfritsch/jellyfin-matcher),
[nakra](https://github.com/phineasfritsch/nakra) and
[the shelf survey](https://github.com/phineasfritsch/biomed_callnumber_finder).
Every claim here would be worth nothing the moment one of them turned out to be
dressed up. Saying what was assisted costs me the readers who were going to
discount me anyway, and it buys the rest a reason to believe the specific things I do
claim: that I decided what to build, and that the reason Postgres is configured the way
it is was mine, is written down in the deploy config, and I can defend it.

## The part that does not delegate

When a check fails, it is one of two things and from the outside they look identical.
Either the work broke something, or the work deliberately changed something and the
check is now stale. Getting that wrong in the second direction — deciding a failing
check is obsolete when it is correct — is how a test suite becomes decorative,
one reasonable accommodation at a time. It is also the one step where being wrong
leaves no trace: nothing turns red later to tell you what you let
through. That call is the part I cannot hand to anything.

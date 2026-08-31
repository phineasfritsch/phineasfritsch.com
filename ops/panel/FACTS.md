# Fact brief — everything the panel needs. Do not go exploring.

You have been given every fact below. Do NOT use search tools to find more context.
An agent told everything it needs and instructed not to explore uses ~8 tool calls;
the same agent left to find its own context uses over a thousand and reaches the same
answer. Read the screenshots you are pointed at, and judge.

## Who this is

Phineas Fritsch. UCLA student or recent graduate (see "what is unknown" below).
Email on the site: accounts@phineasfritsch.com. GitHub: github.com/phineasfritsch,
account created Nov 2019, 10 public repos, 0 followers, 0 stars on anything.

He describes his own projects, in his own words, as "all vibe coded to be 100% clear."
That is his framing, volunteered, not an accusation. It is the central design problem
of this whole exercise.

## What is actually deployed right now at phineasfritsch.com

1. The apex `/` issues a 301 to `phinster.net`, which returns HTTP 530,
   Cloudflare error 1033 — "Cloudflare Tunnel error", i.e. no origin is connected.
   A real visitor typing phineasfritsch.com gets a Cloudflare error page. Verified
   by direct request, reproducible.

2. Every sub-path (`/about/`, `/work/`, `/resume/`, `/blog/`) returns HTTP 200 and
   serves the SAME 3KB HTML file, a 2023 template. Its complete visible text is:

   > Phineas Fritsch — Welcome to my personal website!
   > [a run of ~600 hyphens containing:]
   > I-don't-like-it-when-emails-have-domains-that-don't-go-to-a-website-so-this-why-I-am-making-this-:)
   > About | Portfolio | Resume | Contact
   > About Me — Short bio or introduction about yourself.
   > Portfolio — Project Title — Description of the project.
   > Resume — Information about your professional experience and education.
   > Contact — Send
   > Copyright © 2023 Your Name

   The footer says "Your Name". It has said "Your Name" for three years.

## What is in the repo (never deployed)

A SvelteKit 5 site with a Three.js / Threlte 3D scene. Measured, not estimated:

- Homepage: a low-poly cartoon planet floating in space, with tiny houses on it,
  the name in Playfair Display serif, and the words "CLICK TO EXPLORE".
- Homepage ships **903 KB of JavaScript**.
- Homepage takes **21.5 seconds** to reach network-idle in headless Chromium on a
  fast connection with no throttling.
- Homepage contains **37 characters of text**. With JavaScript disabled the
  prerendered HTML contains **53 characters** — the name is in the <title> and
  essentially nothing else. Google, LinkedIn link previews, and any reader with JS
  blocked see an empty page.
- Four interior pages: /ucla/, /theta-chi/, /sailing/, /future/.
- Every interior page is placeholder text. Verbatim examples that are live in the
  repo right now: "[Your Major]", "[Year]", "[Clubs, orgs, teams]",
  "[Write about your UCLA experience here...]", "[Fill in your sailing background here...]".
- The interior page headlines are single abstract nouns with full stops:
  "Go Bruins." / "Brotherhood." / "Sailing" / "The Horizon."
- Sample body copy, verbatim: "There's something about the ocean that resets
  everything. Wind, water, and a boat that does exactly what you ask of it — if
  you've learned to ask right." and "Every sailor knows the horizon keeps moving.
  That's not a problem — that's the point."
- Palette: near-black navy backgrounds, sunset orange/gold accents, cream serif text.
- One blog post exists, titled "Hello, World", body: "This is the beginning. A small
  corner of the internet to think out loud. More to come."

## The repos, as a skeptical person would find them

Public: gesnipe (Python, 1 day of commits, Jun 2025), biomed_callnumber_finder
(Swift, ~1GB repo size), jellyfin-matcher (TypeScript, ~60MB, active), nakra (Swift,
"Not Another Kustom Reminder App"), uclalibhours (Swift), PIC16A (a UCLA Python
course), portflio (JavaScript, note the typo in the repo name — it is spelled
"portflio").

Private: ge_snipe (Ruby, "Dibs (dibs.ge) — UCLA GE course ranking and seat alerts"),
bruinsailing.org ("WP for UCLA Sailing"), bruinthetachi.com (Astro),
nextjs-portfolio, plus four repos created on a single day (2026-08-31) that are all
0 KB and contain nothing: yikyak_archive, blackjack_coach, better_bio_schedule,
and one more.

## What is unknown and must NOT be invented

His major, his graduation year, his employment history, his job titles, his GPA,
any internship, any club office he held, where he is located, what job he wants.
None of it is established. If your critique depends on one of these, say so and
name it as an open question — do not assume a value.

## The screenshots

Rendered in real Chromium against the real production build:
ops/shots/desktop-home.png ops/shots/mobile-home.png
ops/shots/desktop-ucla.png ops/shots/mobile-ucla.png
ops/shots/desktop-theta-chi.png
ops/shots/desktop-sailing.png
ops/shots/desktop-future.png
ops/shots/desktop-blog.png
Read the ones relevant to your remit. Judge the rendered page, not the source.

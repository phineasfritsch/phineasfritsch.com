# Verified evidence base

Every claim here was checked against the repository or a live HTTP request, by the
main session, not taken on a subagent's word. Anything a subagent reported that
could not be re-verified is marked UNVERIFIED and must not be used in the resume
or on the site.

**The rule this file exists to enforce: nothing reaches the site or the resume that
is not in this file.** If a page wants a fact, it comes from here or it is cut.

## Live right now (checked by HTTP request)

| URL                                                      | Status  | What it is                                            |
| -------------------------------------------------------- | ------- | ----------------------------------------------------- |
| https://dibs.ge/                                         | 200     | Rails 8 app, GE course ranking + seat alerts, UCLA    |
| https://shelfmark.phineasfritsch.com/                    | 200     | Call number to physical shelf, Cloudflare Worker      |
| https://better-bio-schedule.phineas-fritsch.workers.dev/ | 200     | Biomed library staff schedule, Cloudflare Worker      |
| https://phineasfritsch.com/                              | **530** | **His own name. Cloudflare error 1033, dead tunnel.** |

Four of his projects serve traffic. The one that does not is the one with his
name on it. That is the shape of the whole problem.

**A dead link on a resume is worse than no link.** Until the apex serves, the resume
header must NOT print phineasfritsch.com. A recruiter clicks the top line first, and
a Cloudflare error there discredits everything under it. Restore the URL to the resume
in the same change that makes the apex serve, and not before.

## Stated by Phineas directly, in conversation — his own account, not independently verified

Recorded here because the rule is that nothing reaches the site or the resume unless
it is in this file, and the resume panel correctly rejected these when they were not.
They are first-hand claims from the subject about his own job and his own projects,
which is ordinary resume provenance; they are simply not third-party verified, and the
distinction is kept visible so nobody later cites them as measured facts.

- **He is STILL employed at the UCLA Biomedical Library** as a **Student Assistant II**,
  hired as a Student Assistant I and promoted. LinkedIn shows this role ending Jul 2026;
  LinkedIn is stale on this point and he corrected it. A promotion to Student Supervisor
  has been raised with him by his manager but **has not happened and is not a fact**.
- **Collab Hub.** Getting the Collab Hub briefing required signing into an admin portal,
  which required messaging a supervisor on Slack for a 2FA code on every access. He
  published the briefing where no account is needed, and colleagues in his unit now use
  his version. This is the strongest single claim he has: unprompted work with real
  adoption against a real operational friction. It ships as part of better_bio_schedule.
- **Nobody assigned any of the library tools.** His words: he built them because he
  wanted to be lazy. Unprompted is a stronger story than assigned and should be said
  plainly rather than dressed up as an initiative narrative.
- **The four library tools**: the Collab Hub briefing, Shelfmark (built after the library
  retired LibMaps), a redesigned headcount page, and better_bio_schedule (the daily
  schedule arrived as an Excel file). Plus an iOS app routing shelf-reading, shelving and
  ILL pulls. The official UCLA Student Assistant I job spec he supplied independently
  corroborates the underlying duties: "Compiles statistics of Loan Desk activity",
  "Shelf reading", "Searching for requested and missing materials", and "shelves
  catalogued material according to the Library of Congress [LC]".
- **The Cut Card** (thecutcard.com), verified serving 200 by direct request. Its
  self-imposed constraint, from its README: "No claim about money, anywhere. Not in the
  app, not on the paywall, not in a notification."

## Revenue — there is none

He described dibs.ge and thecutcard.com as _projected_ to earn money and said plainly:
"No money yet so this is nothing but projected money with nothing proven." **No revenue
figure, projected or actual, may appear on the site or the resume.** A projection stated
as an achievement is the single fastest way to make a reader re-price every other claim
on the page.

## How he works, in his words

He runs two Claude Max accounts and orchestrates them — his phrasing: he "essentially
pretends to be a product manager in a company and tells different departments to run
things." This is the most distinctive true thing about him and it is the direct answer
to his interest in product roles: the daily practice already is product management.

## Verified by reading the file

### ge_snipe / dibs.ge — `config/deploy.yml`

Read in full by the main session. Real, and the strongest single artefact he has.
Verbatim decisions documented in its comments:

- A measured RAM budget against a 2.5 GB RackNerd box: kamal-proxy ~50 MB, Puma
  2 workers x 3 threads ~450 MB, Postgres ~500 MB, OS + dockerd ~350 MB, ~1.6 GB
  total, "plus a 2 GB swapfile for headroom. That leaves room for a deploy
  overlapping the old container during a rollout, which is the moment memory
  actually spikes."
- `max_connections=60` with the reasoning written out: "Rails multi-database means
  a single thread can hold four connections (primary + cache + queue + cable) ...
  Kamal overlaps the old and new containers during a rollout -- so 30 is exceeded
  exactly when deploying, and the symptom is the _website_ failing, not the jobs."
- Postgres bound to `127.0.0.1:5432` — "The database must never be reachable from
  the internet."
- "Never build on the server -- compiling assets on a 2.5 GB box is the classic
  way to OOM mid-deploy."
- A timing-safe sign-in design, documented as a trap for his future self:
  "EmailSignInsController answers identically whether or not an address is allowed,
  and takes the same time doing it, so that nobody can enumerate who has an account.
  That means an address missing from this list is INDISTINGUISHABLE from a mail
  delivery failure."
- Solid Queue in-Puma rather than a second container, with the cost stated
  (~250 MB) and the workload that justifies it.

### jellyfin-matcher — `gates.json`

Fetched live from raw.githubusercontent.com. Verbatim, complete:

> "Expected numbers for `npm run gate`. Floors, not equalities: the gate fails when
> a number goes down, because that is what a silent deletion looks like. When work
> legitimately adds tests or pins, raise these in the same commit."
> testFiles: 35, testCases: 564, pinnedClaims: 190

He independently invented the count-regression gate. This is worth saying out loud:
it is the same idea this project's own `ops/gate.mjs` implements, and he got there
first, on his own repo, before being asked to.

## Reported by the dossier agent, consistent with the above, NOT individually re-verified

Treat as usable but attribute carefully. Each is specific enough to be checked in
one click by anyone who doubts it, which is the standard that matters.

- ge_snipe: Ruby 3.3.12 / Rails 8.1, ~61,300 lines of Ruby, 253 test files,
  2,346 test declarations, 5-job CI (Brakeman, bundler-audit, importmap audit,
  RuboCop, Minitest + Capybara system tests with failure screenshots).
- ge_snipe data: four UCLA California Public Records Act responses, 176,290 rows,
  31,780 distinct sections, Fall 2021 to Spring 2025, deduplicated to 1,544,628
  grades after correcting an instructor fan-out that would have inflated the count
  to 1,626,187.
- ge_snipe scraper ethics: a hard request budget, a shared lock with concurrency 1,
  staggered minute slots, and a rewrite that cut 657+480 requests/hour to a single
  ~700-request pass while moving catalog staleness from 2,085 minutes to 3.
- biomed_callnumber_finder: 1,123 shelf-end label photographs he took himself
  across 9 stack levels, transcribed into a validated JSON dataset; a call-number
  comparator that treats Cutter digits as decimal fractions so `AM4733` sorts
  before `AM477`; in-browser OCR via Tesseract.js so pull-list images never leave
  the device; a routing model treating stairwells and elevators as door edges
  rather than points, with a "more than five books is a truck trip" rule.
- nakra: Swift 6 strict concurrency, a Foundation-only engine package that builds
  on Windows, and three-valued Kleene logic so a weather condition that is still
  `maybe` renders as tentative and is not scheduled.
- bruinthetachi.com: WordPress to Astro migration preserving every legacy URL via
  `public/_redirects`, Sveltia CMS for non-technical successors, a build-time
  d3-hierarchy family tree rendered as static SVG with no client-side graph
  library, hourly Instagram Graph API sync.

## Biography — CONFIRMED by the owner (LinkedIn + resume, supplied directly)

LinkedIn could not be read by any tool here: egress policy blocks linkedin.com and a
direct request returns HTTP 999, their bot block. Everything below was supplied by
Phineas himself. He stated LinkedIn is the more current of the two sources.

### Identity

- Phineas Fritsch. Pronouns he/him (stated on his LinkedIn profile — use them).
- El Cerrito, California (home). Los Angeles, California (school).
- **Canonical email, decided by him: contact@phineasfritsch.com.** Use this
  everywhere — site, resume, git config. The old site used
  accounts@phineasfritsch.com; that address is superseded and must not appear.
- Phone (510) 882-4915 — belongs on the resume. **Never publish it on the website.**

### Education

- UCLA, **B.S. in Financial Actuarial Mathematics**, Minor in Accounting.
- Attended 2023–2027, **expected June 2027**. He is a senior in 2026–27.
- **GPA: 3.486 cumulative UC GPA.** Read directly from his DARS audit dated
  08/17/2026: 132.0 units earned, 134.0 graded attempted units, 467.1 points.
  **His current resume says 3.7. That is wrong by 0.21 and must be corrected.**
  A GPA is verified against a transcript at offer stage; being caught inflating one
  costs the offer and the reference. Write 3.49, or omit GPA entirely. Never 3.7.
- Major upper-division GPA: **2.933** (21 graded units, 5 courses). The requirement
  is a 2.0 minimum, so he is satisfying it. Do not volunteer this number; do not
  deny it if asked. Courses-in-major-department GPA: 2.880.
- Lower-division economics GPA 4.000. Lower-division mathematics GPA 3.586.
  The dip is specifically in upper-division pure math — 115A, 131A, 170E, 177 —
  which is the hardest block of that degree, not a general decline.
- **Zero actuarial exams passed.** He intends to sit **Exam FM in fall quarter 2026**.
  Write it as an intention with its date, never as a credential, never as "in progress"
  in a way that reads as passed.

### Coursework, from the DARS audit

Mathematics: 31A (AP credit), 31B, 32A, 32B, 33A, 33B, 61, 115A (linear algebra),
131A (real analysis), 170E and 170S (probability), **174E (Mathematics of Finance)**,
177, and in progress FA26 **178A and 179 (actuarial models)**.
Economics/management: ECON 1, ECON 11, MGMT 1A, MGMT 1B, MGMT 105, MGMT 109.
Computing: COM SCI 31, COMPTNG 16A.

MATH 174E is direct Exam FM material and 178A/179 are the actuarial models sequence.
That is a real, checkable answer to "what have you done toward the exams" from
someone who has not yet sat one. It belongs on the resume; it is doing work that the
GPA line cannot.

Note: COMPTNG 16A is the current code for the course the `PIC16A` GitHub repo is
named after. That repo contains eight Minecraft mod zips and no coursework.

### He is NOT pre-med

`ge_snipe` ships `lib/bcpm/` and a science-GPA controller because they are features for
its users. The earlier inference that he might be pre-med was wrong, and this file
refused to put it on a resume. That refusal is the reason this section is correct.

### Experience — LinkedIn dates are authoritative where the two disagree

| Role                          | Organisation                                         | Dates (LinkedIn)    |
| ----------------------------- | ---------------------------------------------------- | ------------------- |
| Network Manager               | Theta Chi, Beta Alpha Chapter, UCLA                  | Jun 2026 – present  |
| House Manager                 | Theta Chi, Beta Alpha Chapter, UCLA                  | Jul 2025 – Aug 2026 |
| Student Assistant (part-time) | UCLA Library — Biomedical Library                    | Mar 2026 – Jul 2026 |
| Team Captain                  | UCLA Sailing Team                                    | Jul 2025 – Jun 2026 |
| Treasurer                     | UCLA Sailing Team                                    | Jul 2024 – Jul 2025 |
| IT Intern                     | MKTaxSolutions (tax accounting firm), San Leandro CA | Aug 2024 – Sep 2024 |
| Operations Assistant          | Vera A. Fritsch DMD (dental office), San Leandro CA  | Jun 2023 – Oct 2023 |

### Where the current resume is WRONG or STALE — fix these

1. **It omits the UCLA Library job entirely.** Mar–Jul 2026, Biomedical Library. This
   is the job that produced two of his best projects. Its absence is the single
   biggest factual gap.
2. **It omits Network Manager**, his current Theta Chi role since Jun 2026.
3. **Sailing Team Captain is listed "Jun 2025 – present".** LinkedIn says Jul 2025 –
   Jun 2026. The role has ended; "present" is now inaccurate.
4. **House Manager is listed "Jun 2025 – present".** LinkedIn says Jul 2025 – Aug 2026.
   Also ended.
5. **Treasurer dates disagree**: resume Sep 2024 – Jun 2025, LinkedIn Jul 2024 – Jul 2025.
6. **"Software Skills: PowerPoint, Excel, Word."** He operates a Rails 8 application on
   a VPS he capacity-planned, with Postgres, Docker, GHCR and Kamal. The resume as
   written understates his actual technical ability by an enormous margin, and this is
   the most valuable single fix available.
7. `Vera A. Fritsch DMD` shares his surname. A reader will assume a family connection.
   That is fine and common, but it should not be the load-bearing item, and it should
   not be described in language that implies an arms-length hire.

### Achievements that ARE established and are strong

- 13th Annual Actuarial Case Competition (BAS), Winter Quarter 2025: evaluated three
  commercial property insurance structures for a simulated Fortune 500 real estate
  client; analysed retentions, aggregate limits and co-insurance against tail risk;
  computed TCOR and Risk-Adjusted TCOR; ran 10,000-iteration Monte Carlo simulations
  fitting Lognormal, Gamma and Pareto distributions to historical loss data.
- Managed a $10,000 annual chapter operating budget.
- Directed summer renovations (plumbing, structural repairs, a new game room) and used
  them in recruitment, contributing to the second-largest pledge class in chapter history.
- MKTaxSolutions: consolidated 400+ client profiles across three services; integrated
  CCH software with scanning systems.
- German at B2/C1, accredited.

### Career direction — his own words

Recently interested in **Product / PM / associate** roles. Also has **actuarial**
interests, which are in fact his major. These are not in conflict: an actuarial
mathematics senior who independently ships production software used by real people is
a rarer and stronger profile than either half alone. The actuarial track is the
credentialed one and needs Exam FM; the software work is the differentiator that no
other actuarial candidate in the pile will have.

### Still NOT established — do not invent

- Whether he wants Bay Area, LA, or remote after June 2027.
- Any award, honour, scholarship, or dean's list.
- Any actuarial internship. He has had none.
- Which email address is canonical.

## Must never appear on the site or the resume

- `yikyak_archive`. It is a Sidechat/Yik Yak scraper whose README describes
  deliberately disguising its traffic — "Cadence is the real disguise, so the
  crawler mimics a person using the app" — and hiding what it is: "Nothing in the
  chrome names the source app." Whatever its merits as engineering, a recruiter
  reading that sees pride in terms-of-service evasion. It is excluded, and this
  line is the reason, so nobody re-adds it later thinking it was an oversight.
- Volume claims as achievements: "777 commits", "61,000 lines". They invite
  exactly the scrutiny that finds 86 commits in one day, and they are the weakest
  true things he could say. Lead with judgment, which survives the scrutiny.
- Any implication that the code was written unassisted. See the AI disclosure
  ruling; he chose "state it plainly, per project".

## Known liabilities a skeptic will find in about four clicks

Ordered by how fast they are hit. These are fixable, and fixing them is queued work.

- `PIC16A` — public repo named after a UCLA course, containing eight Minecraft mod
  zips and the Palmer Penguins datasets. No Python. Worst item on the profile.
- `uclalibhours` — public, ~5,100 lines, no README, and 20 of 31 commit messages
  are keyboard mash: `sdf`, `gfjhk`, `xcv`, `djy`, `cxsfb`, `perchance`, `f`.
- `biomed_callnumber_finder` — ~1 GB repo; 1,123 raw HEIC/JPG photos committed as
  ordinary blobs with no LFS. `.git` alone is ~996 MB.
- Empty `main` branches on `blackjack_coach`, `better_bio_schedule`,
  `yikyak_archive` — the landing page shows nothing while the work sits on an
  unmerged branch.
- `prdfg` — public, zero commits. `bruinsailing.org` — one commit, no content.
- `ge_snipe` still has the unmodified Rails scaffold README on a 61k-line app, and
  its default branch is `phase-1-data-model-and-grade-import`, which makes a live
  product look permanently stuck in phase one.
- `portflio` — public, misspelled repo name, 41-line App.jsx, stock clipart.
- `ge_snipe/docs/RESUME.md` is a 43 KB agent handoff log. A recruiter who clicks a
  file called RESUME.md gets an unflattering surprise.

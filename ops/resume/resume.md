# PHINEAS FRITSCH

Los Angeles, CA · (510) 882-4915 · contact@phineasfritsch.com
linkedin.com/in/phineasfritsch · github.com/phineasfritsch · phineasfritsch.com

Financial actuarial mathematics senior who ships production software. Four services
of mine are running right now, one of them replaced a workflow in the library I work
in, and my coworkers use it instead of the official one.

## EDUCATION

**University of California, Los Angeles** — Los Angeles, CA
B.S. Financial Actuarial Mathematics, Minor in Accounting · Expected June 2027

- Actuarial coursework: Mathematics of Finance (174E); Actuarial Models (178A, 179, in progress); Probability (170E, 170S); Real Analysis; Linear Algebra
- Exams: sitting **Exam FM, Fall 2026** — no exams completed to date

## EXPERIENCE

**UCLA Library — Biomedical Library** · Los Angeles, CA
_Student Assistant II_ (promoted from Student Assistant I) · March 2026 – Present

- Circulation, interlibrary-loan pull lists, shelf reading, headcounts, opening and closing.
- Built four tools now used in the unit's daily workflow. None were assigned; I built them because the existing processes were tedious.
- Replaced the Collab Hub access path, which previously required signing into an admin portal and messaging a supervisor on Slack for a two-factor code on every single access. Colleagues now use my tool instead.
- Surveyed and transcribed ~1,100 shelf-end range labels across nine stack levels by hand after the library retired LibMaps, then built a call-number-to-shelf lookup and a pull-list route planner on that dataset. Live at shelfmark.phineasfritsch.com.
- Converted the daily Excel staff schedule into a phone-first page with push notifications for non-desk assignments.

**MKTaxSolutions** (tax accounting firm) · San Leandro, CA
_IT Intern_ · August 2024 – September 2024

- Consolidated 400+ client profiles across three separate services.
- Integrated CCH software with office scanning systems; provided general IT support and handled client calls.

**Vera A. Fritsch DMD** (dental practice) · San Leandro, CA
_Operations Assistant_ · June 2023 – October 2023

- Front-office operations, data entry, and financial record accuracy.
- Managed minor server operations and trained staff on Dentrix.

## SELECTED PROJECTS

All of the following are AI-assisted: I directed the work, made the design and
architecture decisions, and tested and operate the result. Source is public where noted.

**Dibs** — dibs.ge · Ruby on Rails 8, PostgreSQL, Docker, Kamal · live
Ranks UCLA general-education courses on grade history obtained through four California Public Records Act requests (176,290 rows, deduplicated to 1,544,628 grades after correcting an instructor fan-out), and alerts students when a watched section opens a seat. Capacity-planned against a 2.5 GB VPS; documented why Postgres runs 60 connections rather than 30, since Rails multi-database holds four per thread and container overlap during rollout breaches the limit exactly when deploying.

**Shelfmark** — shelfmark.phineasfritsch.com · Cloudflare Workers, in-browser OCR · live
Call number to physical shelf, and a photo of a pull list to a walking route. Implements Cutter-decimal ordering, so AM4733 correctly shelves before AM477. OCR runs client-side so pull lists never leave the device.

**The Cut Card** — thecutcard.com · React Native, Expo, TypeScript · live
Blackjack strategy and counting practice. Built under a self-imposed rule of no claim about money anywhere in the product — not in the app, not on the paywall, not in a notification. Strategy and risk engine is framework-free TypeScript, tested without a simulator.

**Jellyfin Matcher** — github.com/phineasfritsch/jellyfin-matcher · Next.js, socket.io, Docker
Real-time group film selection over websockets. Its build gate fails when a test count _decreases_, not only when a test fails, because a silently deleted test is indistinguishable from a passing suite.

## LEADERSHIP

**UCLA Sailing Team** — Team Captain (2025–26), Treasurer (2024–25)
Ran the executive board and weekly meetings; coordinated travel, housing and rosters for biweekly regattas against a constrained budget.

**Theta Chi, Beta Alpha Chapter** — Network Manager (2026–present), House Manager (2025–26)
Managed a $10,000 annual operating budget and daily property operations with alumni. Directed summer renovations — plumbing, structural repairs, a new game room — and used them in recruitment, contributing to the second-largest pledge class in chapter history.

## ACTUARIAL CASE COMPETITION

**13th Annual Actuarial Case Competition (BAS)** · Winter 2025
Evaluated three commercial property insurance structures for a simulated Fortune 500 real estate client, analysing how retentions, aggregate limits and co-insurance shifted tail risk. Computed TCOR and Risk-Adjusted TCOR against the CFO's premium constraint, and ran 10,000-iteration Monte Carlo simulations of annual aggregate losses fitted to Lognormal, Gamma and Pareto distributions.

## SKILLS

**Quantitative:** Monte Carlo simulation, loss distribution fitting, Excel modelling
**Engineering:** Ruby on Rails, PostgreSQL, TypeScript, Swift, Python
**Infrastructure:** Docker, Kamal, Cloudflare Workers and Pages, GitHub Actions, Linux and Proxmox administration
**Languages:** English (native), German (B2/C1, accredited)

# Work queue

## DEADLINE: before UCLA fall quarter starts

Fall Quarter 2026 begins **Monday 22 September 2026**; instruction begins Thursday 24
September. Source: a web search summary citing the UCLA registrar's 26-27 academic
calendar — **registrar.ucla.edu is blocked by this environment's egress policy, so the
date is NOT confirmed from the primary source.** He is a UCLA student and should
confirm it. Treat 21 September as the working deadline; roughly three weeks from
2026-08-31.

The bar is not "we ran out of items". It is that a ship-review board unanimously agrees
the site is ready. Until every reviewer says ship, the work continues.

The queue lives here, in the repo, not in a session and not in anyone's head.
Sessions die mid-task, limits hit, agents crash. Whatever is not written down is gone.

Rules: one owner per item. Move an item to IN PROGRESS with the owner's name before
starting. An item that has been IN PROGRESS across two runs is stuck — say so rather
than starting it a third time. A smaller honest result beats a larger claimed one.

---

## BLOCKED — needs the owner, cannot be resolved by an agent

- [ ] **B9. Merge the working branch into `main`.** The default branch of
      github.com/phineasfritsch/phineasfritsch.com is still the untouched SvelteKit
      scaffold: no `ops/`, no `tests/`, no gate, no resume. Confirmed by listing the
      repository root at the default ref — it returns fifteen entries and none of
      them is this work.

      That matters more than it sounds. `/answers/` invites a skeptical reader to
      verify the site against its source, and the one claim the entire page rests on
      — that the machinery keeping it honest exists — was the one a recruiter taking
      that invitation could not confirm. A reviewer found it by clicking the link.

      No agent in this session may push to `main`; the standing instruction is to
      develop and push only to `claude/operator-manual-agent-systems-tmrdiz`. So the
      interim fix is in the copy: `/answers/` now says the gate, the pins and the
      tests are on the working branch rather than main. `repo.source-claim` in
      ops/sanity.mjs holds the two in step in BOTH directions — it fetches
      `main/ops/gate.mjs` and fails if main lacks it while the page sends readers
      there, and equally if main has it while the page still says it does not, so
      the caveat cannot outlive the problem and become its own small lie.

      Merge it and the caveat comes out on the next deploy.

- [ ] **B8. YOUR COWORKERS' DATA IS PUBLIC. Do this before anything else on this
      list.** `GET https://better-bio-schedule.phineas-fritsch.workers.dev/api/schedule`
      needs no authentication of any kind and returns, for every shift: coworker
      first names, each person's duty assignment, and `sheetUrl` — a direct link to
      the internal Google Sheet the data comes from. Verified by an unauthenticated
      request from this container on 2026-09-01; a reviewer found it independently
      by reading the page and trying the endpoint printed on it.

      This is other people's information, published by an app whose live URL the
      portfolio links from `/work/biomed-schedule/`. It is not a portfolio problem,
      it is a your-coworkers problem, and it is the one item here that gets worse
      the longer the site drives traffic at it.

      Fixed in the worker, not here — it is a different repository, so no agent in
      this session can touch it. The smallest fix that works: drop `coworkers[].student`
      and `sheetUrl` from the API response, since the phone view you actually use
      needs neither. Deliberately NOT disclosed in the site copy, because a sentence
      on a public page naming an open endpoint is an advertisement for it. Once the
      worker is fixed, say so on the project page.

- [ ] **B1. LinkedIn contents.** Egress policy blocks linkedin.com and a direct
      request returns HTTP 999. No agent can read it. Phineas must paste: headline,
      any employment with dates, education incl. major and expected graduation,
      any club offices. Blocks: the employment and education sections of the resume,
      and any "what I'm looking for" copy on the site.
- [x] **B2. RESOLVED. `CLOUDFLARE_API_TOKEN` is reaching sessions.** Present in the
      environment on 2026-08-31 and used for a real deploy. No longer blocks anything.
- [x] **B3. RESOLVED 2026-08-31. The apex redirect is gone and the site is live.**
      `https://phineasfritsch.com/` returned 301 -> phinster.net -> 530/1033 for the
      life of this project. Phineas deleted the rule; the apex now returns **200** and
      serves commit 3264229. Verified four ways: raw headers on `/`, `/version.json`
      reporting the deployed commit, `ops/read-prod.mjs` green on all five paths
      (VERDICT serving), and the full gate at **6/6 with no override** — sanity went
      8/8, `prod.serving` flipping red to green for the first time. The homepage
      renders 5,780 characters of text with JS disabled.

      Two notes for whoever reads this next. The rule only ever matched the root path,
      so the deeper pages were already reachable before it was deleted; the diagnosis
      "the domain is dead" was true of the homepage and only the homepage. And the
      custom domain never needed re-attaching — it was bound to `personalsite` the
      whole time.

- [x] **B4. RESOLVED. UCLA Sailing title is "Team Captain".** He held both titles
      technically. Captain matches LinkedIn, so a recruiter cross-checking the two
      documents finds the same word. Already correct on the site and the resume.
- [x] **B6. RESOLVED 2026-09-01, from the repo, without the dashboard.** Cloudflare
      publishes opt-out markers — `<!--email_off-->` … `<!--/email_off-->` — and they
      work at the edge. Svelte strips markup comments from a production build, so they
      go through `{@html}` as static strings from `src/lib/data/contact.ts`. Measured
      after deploying: `contact@phineasfritsch.com` appears in the production HTML of
      every page, `__cf_email__` appears zero times, and `ops/read-prod.mjs` exits 0
      with no EDGE section for the first time.

      This was logged for six rounds as owner-only and unreachable from here, on my
      say-so, after one blocked API call. It was neither. A reviewer said "there is an
      untried in-repo mitigation" and there was. **Turning the dashboard toggle off is
      still the cleaner fix** — these markers are a workaround that a future Cloudflare
      change could stop honouring, and `prod.edge-intact` is what would notice.

- [ ] **B5. Confirm the dental-practice cut.** Vera A. Fritsch DMD (Jun–Oct 2023) was
      removed from the one-page resume: four months, three years ago, and it shares
      his surname, which the panel flagged as a liability rather than an asset. Easy
      to restore if he disagrees; the space it costs is real.

## DONE 2026-08-31, second deploy round

- [x] **Production is no longer stale.** `/version.json` served `625194f`
      while HEAD was four commits ahead, so the live site still carried the claim
      the owner permanently excluded. HEAD is deployed and verified: `grep -ic
collab` returns 0 on `/`, `/resume/`, `/work/`, `/work/biomed-schedule/`,
      `/about/` and `/blog/`. This was the single reason all four HOLD votes in
      ship-review round 1 gave.

- [x] **The product resume no longer points at something a reader can count.**
      The lede said "Six of the projects below are serving traffic today" on a
      document that lists two. Five reviewers found it independently. It now reads
      "Six of my projects are serving traffic today", which is true against
      EVIDENCE.md and falsifies nothing on the page.

- [x] **Three tools that reported the wrong thing, fixed.** Each of these would
      have made a future agent act on a false reading: 1. `sanity.mjs` collapsed read-prod's exit 2 (serving, but the CDN altered
      the page) into exit non-zero, and printed "apex is not serving" about a
      site answering every page in 250ms — throwing away the real finding with
      the exit code. Split into `prod.serving` and `prod.edge-intact`. 2. `deploy.mjs` retried the read-back for REACHABILITY, returning on the
      first parseable response — which, seconds after an upload, is the OLD
      version.json. It printed DEPLOY REFUSED over a deploy that worked. It now
      waits for the commit it shipped. 3. `deploy.mjs` defaulted `--branch` to the checkout's name. This project's
      production branch is `main`, so a deploy from a feature branch uploaded a
      PREVIEW: wrangler printed "Deployment complete", the URL worked, and the
      custom domain kept serving the old build. It now asks the project. 4. Every browser script read Chromium from `CHROMIUM_PATH` with no fallback,
      and the bundled path carries a build number that changes between
      containers. Unset, they died with Playwright's "run npx playwright
      install" advice, which does not work in this image. `lib.mjs` now
      resolves the newest `chromium-*` on disk.

## READY — unblocked, in priority order

- [x] R8/R9. DONE — fixed in 38e6332, filed from the failed deploy that exposed them.
      `--branch` now takes `PAGES_PRODUCTION_BRANCH || branch` instead of a ternary
      whose arms were identical, and `deploy.mjs` accepts both `PAGES_PROJECT` and
      `CF_PAGES_PROJECT`. Until that landed the second `wrangler pages deploy
--branch main` was mandatory; it is not any more.

- [ ] R2. Resume, built only from ops/private/EVIDENCE.md. Blocked in part by B1 for
      the employment section; everything else can be written now.
- [ ] R3. Flip the pending pins in ops/pins.json to active in the same commit that
      writes the property each one guards. Never in a later commit.
- [ ] R4. Fix `build.page-metadata`: blog/hello-world renders two h1 elements.
- [ ] R7. **Tell Phineas about the Shelfmark building bug** (also in EVIDENCE.md).
      A bare call number is always mapped onto Biomed, so `PS3535.A547 A94 2005`, a
      YRL call number, returns a confident Biomed shelf face with no warning. Not a
      parsing fault — the Biomed range genuinely contains PS3535 — but someone could
      walk to the wrong building. Level 4 is also unsurveyed. Fix lives in the
      shelfmark repo, not this one.
- [x] R5. DONE. Expanded the Shelfmark description once the comparison against UCLA's own
      catalogue search lands. He says it is a full replacement search built on UCLA's
      public Alma SRU endpoint, not only a call-number-to-shelf tool, and the current
      copy undersells it. Do not write the comparison from imagination — it must come
      from observed behaviour of both systems.
- [ ] R10. **Attach `www.phineasfritsch.com` as a Custom Domain**, or decide not to.
      Only the apex is attached to `personalsite`. This could not be tested from the
      container — egress policy denied CONNECT to `www.phineasfritsch.com:443`, which
      is a proxy refusal and NOT evidence about the record either way. Someone on an
      ordinary network should type `www.phineasfritsch.com` and see what happens before
      any work is done here. Low stakes now that the apex serves.

- [ ] R6. Consider adding the headcount page and the iOS shelf-reading/ILL routing app.
      Both were described by him and neither is currently on the site. Needs evidence
      in EVIDENCE.md first.

## PROFILE CLEANUP

Six items covering things a skeptical reader finds in about four clicks across his
other repositories: an empty public repo, unmerged default branches, a scaffold README
on a live product, and a repository whose name promises one thing and contains another.

They are listed in `ops/private/EVIDENCE.md` rather than here, because naming another
person's repositories and their faults in a public file is a different act from noting
them privately. Each is small and none of them are in this repository.

## DONE — the deploy, and what it cost to get there

- [x] **The site is LIVE on phineasfritsch.com**, verified independently:
      `/version.json` returns commit 3264229, built 2026-08-31T20:03:20Z, and
      `/work/`, `/answers/`, `/resume/`, `/blog/` and `/work/shelfmark/` all serve
      the new site with real content. Written while `/` itself still 301'd; as of
      the redirect deletion it is true of the homepage as well, so the sentence now
      means what it says. `ops/read-prod.mjs` returns VERDICT serving on all five
      paths.
- [x] R8/R9 fixed: the `--branch` argument was `branch === 'main' ? 'main' : branch`,
      both arms identical — a no-op wearing the costume of a deliberate mapping, which
      uploaded previews no visitor sees. And PAGES_PROJECT vs CF_PAGES_PROJECT
      disagreed between the runbook and the code; both are accepted now.

## DONE

- [x] D1. Read production safely, one command — `ops/read-prod.mjs`. Found the
      apex 530 on first use.
- [x] D2. State sanity check with a machine-readable verdict — `ops/sanity.mjs`.
      Found 903KB of JS, a homepage with 53 characters of text without JS, and
      seven placeholder strings in the built artefact.
- [x] D3. Test suite that prints a count — `npm test` via vitest.
- [x] D4. Pinned claims with signature matching and comment stripping —
      `ops/pins.json` + `tests/pins.spec.ts`. Its own hygiene test rejected two
      bad pins on the first run.
- [x] D5. One-command gate with numbered gates and drift detection — `ops/gate.mjs`.
- [x] D6. Deploy that pushes before deploying and reads production back —
      `ops/deploy.mjs`. Correctly refuses on a dirty tree.
- [x] D7. This queue.
- [x] D8. Verified evidence base — `ops/private/EVIDENCE.md`.
- [x] D9. Six-persona panel audited the live site as real users. Median time before
      closing the tab: 16 seconds. All six flagged the dead apex first.
- [x] D10. Sixteen-direction knockout bracket. Winner "Plain Answers", unanimous, no
      vetoes. Shipped as `/answers/` rather than as the index, because a table serves
      the 90-second reader better than prose; the bracket's grafts were applied to the
      index instead — the AI disclosure is now a field in the stack line rather than a
      callout box, and the failures are listed alongside the successes.
- [x] D11. Site rebuilt as an exhibit sheet. Homepage 37 -> 5,349 characters of text,
      21.5s -> 3.5s, 903KB -> 104KB of JS.
- [x] D12. Fonts self-hosted. The font CDN was render-blocking at roughly 8s per page;
      the browser suite went from 2.9 minutes to 12.8 seconds.
- [x] D13. Two cloud routines, surviving this session: a tester every 4 hours that is
      forbidden from fixing anything, and a daily fixer that works one queue item and
      pushes to an isolated branch, never deploying.
- [x] D15. Resume: one page, built only from EVIDENCE.md, rendered by
      ops/resume-build.mjs which refuses if a GPA, a revenue projection, a passed-exam
      claim, or the excluded project appears. Six-persona panel reviewed it; the actuarial
      hiring manager would NOT advance it, on exams alone, which is the single most
      important strategic finding: FM this fall is the highest-leverage thing he can do.
- [x] D16. Real README, replacing the sv scaffold.
- [x] D17. Redirect map for the 2023 site's paths, and strict security headers.
- [x] D19. **The domain works.** With B3 cleared, phineasfritsch.com serves the built
      site at every path including `/`, and the gate passes 6/6 clean — no overridden
      checks, nothing structurally unsatisfiable left. The URL can go back in the
      resume header and the email signature.
- [x] D18. **Deployed to production, 2026-08-31, commit 3264229.** Gate green on
      everything real — 56 tests, 40 browser checks, format/typecheck/build/sanity —
      with only `prod.serving` overridden, which is unsatisfiable before a deploy by
      construction. `personalsite-ezt.pages.dev` and every apex path except `/` now
      serve 3264229. Took two steps, not one: see R8. The site is live; the homepage
      is not reachable at the domain until B3 is done.
- [x] D14. Real bugs the gate found: the blog rendered its own filename as a headline
      (mdsvex frontmatter is on `metadata`, both loaders read the module root); twelve
      MeshToonMaterial constructors set `flatShading`, which that material ignores while
      three.js logged a warning for each; playwright reused a stale preview server,
      which can produce a green suite over an old build.

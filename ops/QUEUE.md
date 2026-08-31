# Work queue

The queue lives here, in the repo, not in a session and not in anyone's head.
Sessions die mid-task, limits hit, agents crash. Whatever is not written down is gone.

Rules: one owner per item. Move an item to IN PROGRESS with the owner's name before
starting. An item that has been IN PROGRESS across two runs is stuck — say so rather
than starting it a third time. A smaller honest result beats a larger claimed one.

---

## BLOCKED — needs the owner, cannot be resolved by an agent

- [ ] **B1. LinkedIn contents.** Egress policy blocks linkedin.com and a direct
      request returns HTTP 999. No agent can read it. Phineas must paste: headline,
      any employment with dates, education incl. major and expected graduation,
      any club offices. Blocks: the employment and education sections of the resume,
      and any "what I'm looking for" copy on the site.
- [x] **B2. RESOLVED. `CLOUDFLARE_API_TOKEN` is reaching sessions.** Present in the
      environment on 2026-08-31 and used for a real deploy. No longer blocks anything.
- [ ] **B3. Delete the apex redirect.** phineasfritsch.com 301s to phinster.net,
      which is a dead Cloudflare tunnel (error 1033). **This is now the ONLY thing
      standing between the domain and a working site, and it does not need an agent** —
      removing that redirect rule in the Cloudflare dashboard (Redirect Rules / Page
      Rules / Bulk Redirects) is worth more than everything else here, because the
      domain is in his email signature and his resume header, and a dead link there
      discredits every claim under it.

      MEASURED 2026-08-31, after the deploy, and it narrows the problem considerably:
      the redirect matches **only the root path**. `https://phineasfritsch.com/` 301s
      to phinster.net and dies at 530/1033, but `/resume/`, `/blog/`, `/work/`,
      `/answers/`, `/planet/`, `/favicon.ico` and `/version.json` all return 200 and
      serve commit 3264229 right now. So the custom domain is attached and healthy at
      the edge; one rule on `/` is eating the homepage. Deleting that rule should be
      the whole fix — nothing needs to be re-attached or re-deployed afterwards.

      Corollary worth knowing: the custom domain **is** already bound to the
      `personalsite` Pages project (`wrangler pages project list` shows
      `personalsite-ezt.pages.dev, phineasfritsch.com`). Earlier notes assumed it
      still had to be added. It does not. Attaching `www` is still open.

- [x] **B4. RESOLVED. UCLA Sailing title is "Team Captain".** He held both titles
      technically. Captain matches LinkedIn, so a recruiter cross-checking the two
      documents finds the same word. Already correct on the site and the resume.
- [ ] **B5. Confirm the dental-practice cut.** Vera A. Fritsch DMD (Jun–Oct 2023) was
      removed from the one-page resume: four months, three years ago, and it shares
      his surname, which the panel flagged as a liability rather than an asset. Easy
      to restore if he disagrees; the space it costs is real.

## READY — unblocked, in priority order

- [ ] R8. **Fix the `--branch` bug in `ops/deploy.mjs`.** Line reads
      `'--branch', branch === 'main' ? 'main' : branch` — both arms are `branch`, so it
      is a no-op that always deploys the CURRENT branch. On any branch but `main` that
      makes a **preview** deployment, which never becomes what `personalsite-ezt.pages.dev`
      or the apex serves. This is why the deploy on 2026-08-31 uploaded cleanly and then
      correctly refused: it had genuinely not changed production. The read-back was right
      and the deploy was wrong, which is the good way round. Fix is to send `main` for the
      production deploy regardless of the local branch name, or to take the target branch
      as an explicit flag. Until then, the second `wrangler pages deploy ... --branch main`
      step is mandatory and must not be described as redundant.

- [ ] R9. **`PAGES_PROJECT`, not `CF_PAGES_PROJECT`.** `ops/deploy.mjs` reads
      `process.env.PAGES_PROJECT`. Any runbook or routine passing `CF_PAGES_PROJECT` is
      silently ignored and falls through to the `personalsite` default. Harmless today
      because the default is correct; a trap the day it is not. Pick one name.
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
      ops/resume-pdf.mjs which refuses if a GPA, a revenue projection, a passed-exam
      claim, or the excluded project appears. Six-persona panel reviewed it; the actuarial
      hiring manager would NOT advance it, on exams alone, which is the single most
      important strategic finding: FM this fall is the highest-leverage thing he can do.
- [x] D16. Real README, replacing the sv scaffold.
- [x] D17. Redirect map for the 2023 site's paths, and strict security headers.
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

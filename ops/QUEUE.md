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
- [ ] **B2. `CLOUDFLARE_API_TOKEN`.** `wrangler login` needs a browser this container
      does not have. Token template "Cloudflare Pages — Edit" at
      https://dash.cloudflare.com/profile/api-tokens. Blocks: every deploy.
- [ ] **B3. Decide the apex.** phineasfritsch.com currently 301s to phinster.net,
      which is a dead Cloudflare tunnel (error 1033). Someone has to decide whether
      phinster.net keeps the redirect, and the rule must be removed either way before
      the new site can serve at the apex. Blocks: the site being reachable at all.

## READY — unblocked, in priority order

- [ ] R1. Deploy, once B2 and B3 clear. `node ops/deploy.mjs` is written and refuses
      correctly on a dirty tree, a red gate, or a missing token.
- [ ] R2. Resume, built only from ops/panel/EVIDENCE.md. Blocked in part by B1 for
      the employment section; everything else can be written now.
- [ ] R3. Flip the pending pins in ops/pins.json to active in the same commit that
      writes the property each one guards. Never in a later commit.
- [ ] R4. Fix `build.page-metadata`: blog/hello-world renders two h1 elements.
- [ ] R5. Ask Phineas the two open facts: his current job title wording (he says
      "Student Assistant II", promoted from I, and a Student Supervisor promotion is
      under discussion but is NOT a fact yet), and whether "Team Captain" or
      "President" is the correct UCLA Sailing title — LinkedIn says Captain, he said
      President in conversation.

## PROFILE CLEANUP — cheap, high return, safe to do in any order

Each of these is something a skeptic finds in about four clicks. See the liabilities
section of ops/panel/EVIDENCE.md for why each one matters.

- [ ] P1. `PIC16A` — public repo named for a UCLA course, contains eight Minecraft
      mod zips and no Python. Delete it or rename it to what it actually is.
- [ ] P2. Merge the real branches to `main` on `blackjack_coach`,
      `better_bio_schedule`, `yikyak_archive`. Their landing pages currently show
      nothing while the work sits one click away on an unmerged branch.
- [ ] P3. `ge_snipe` — replace the untouched Rails scaffold README; rename the
      default branch from `phase-1-data-model-and-grade-import` to `main`; rename
      `docs/RESUME.md`, which is a 43KB agent log that a recruiter will click.
- [ ] P4. `uclalibhours` — add a README. Its 5,100 lines are public with no
      explanation and 20 of 31 commit messages are keyboard mash.
- [ ] P5. Delete `prdfg` (public, zero commits) and `portflio` (public, misspelled,
      41 lines, stock clipart). Both are superseded and neither adds anything.
- [ ] P6. `biomed_callnumber_finder` — the ~1GB of committed HEIC/JPG photos.
      Migrating to LFS rewrites history; decide deliberately rather than by default.

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
- [x] D8. Verified evidence base — `ops/panel/EVIDENCE.md`.
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
- [x] D14. Real bugs the gate found: the blog rendered its own filename as a headline
      (mdsvex frontmatter is on `metadata`, both loaders read the module root); twelve
      MeshToonMaterial constructors set `flatShading`, which that material ignores while
      three.js logged a warning for each; playwright reused a stale preview server,
      which can produce a green suite over an old build.

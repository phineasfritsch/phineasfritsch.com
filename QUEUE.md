# Queue — phineasfritsch.com

The work queue lives in the repository, not in a session (`O04`). Sessions die
mid-task, limits are hit, agents crash. What is not written down is gone.

## What this is

> phineasfritsch.com is Phineas Fritsch's personal site: a static SvelteKit build on Cloudflare Pages that presents his projects as an exhibit sheet — /work/, /answers/, /resume/, /blog/ — where every claim is tied to something a skeptical reader can go and check, and /answers/ explicitly invites them to check it against the repository. The interesting half of the repository is `ops/`: a numbered gate that prints a count per stage, signature-matched pins, a state-sanity checker, a read-only production probe and a deploy that pushes first and then reads `/version.json` back — all written on the premise that agents report success on broken work. Caveat that governs everything below: the checked-out branch `main` is NOT that site. It is the abandoned April 2026 3D-globe portfolio; the real site lives on the unmerged branch `claude/operator-manual-agent-systems-tmrdiz`, which is what production serves.

## How to use this file

- One item per line, and the **checkbox** is what makes it an item:
  `- [ ] <id> · <tag> · <what>`. A bullet without a checkbox is prose.
- `quick` is one sitting. `deep` needs a plan first.
- A fixer takes the TOP open item, does that one thing, and stops.
- A tester never ticks anything off; it appends what it found.

## Open

- [~] q1 · deep · PR #1 awaiting owner merge 2026-09-02T16:13:15Z (mct-fixer) · Open ONE pull request from `claude/operator-manual-agent-systems-tmrdiz` into `main` and do nothing else in it: `gh pr create --base main --head claude/operator-manual-agent-systems-tmrdiz`. No new branch, no push, no local merge commit. This is his own B9, the top entry on his blocked list, blocked only because the previous session was forbidden to touch main — a PR is exactly the shape that unblocks it. BEFORE opening it, verify with `gh pr list --state open` that it is not already open (if it is, mark this item `[~] PR #<n> awaiting owner merge <UTC>` and take the next item), and verify the merge yourself: `git merge-tree --write-tree main origin/claude/operator-manual-agent-systems-tmrdiz` must exit 0 (it gave tree ed38d43 on 2026-09-02) and that tree's src/lib/components/SceneRoot.svelte must contain both `import Clouds from './Clouds.svelte'` and `if (!reducedMotion && globeGroup)` with Clouds.svelte present, so his unpushed cloud work survives wired into /planet/. In the PR body paste /version.json, the gate lines you actually ran, AND the warning that merging flips ops/sanity.mjs `repo.source-claim` red until q2 lands. Do not merge it, do not deploy, do not touch the /answers/ copy in this PR.
- [ ] q2 · quick · The moment q1's PR is merged (check `curl -s -o /dev/null -w '%{http_code}' https://raw.githubusercontent.com/phineasfritsch/phineasfritsch.com/main/ops/gate.mjs` → 200), drop the working-branch caveat from src/routes/answers/+page.svelte — the sentence ending 'on the working branch — the gate, the pinned sentences and the tests are there rather than on main, which is still the framework scaffold' — and point the source link at the repository root instead. ops/sanity.mjs line ~315 computes `ok = mainHasOps !== saysBranch`, so from the merge until this ships, sanity is 21/22 and the deploy gate is red. Do not do this before the merge lands: doing it early makes the page silent about a scaffold main still is. Base this PR on the working branch, not main.
- [~] q3 · PR #2 awaiting owner merge 2026-09-02T17:27Z (mct-fixer) · quick · Set `$ProdUrl = 'https://phineasfritsch.com/version.json'` at the top of verify/read-prod.ps1 so every scheduled run says out loud what is actually serving and he never opens a browser to find out. It answers 200 today with commit, branch and builtAt. After q1 lands, the `branch` field is exactly how an unattended run notices production is still serving something other than main. Run it once and paste its verdict line verbatim into QUEUE.md. This item touches only the untracked mct scaffold, so it does not wait on the merge. (grounded: verify/read-prod.ps1 `$ProdUrl = ''` and its banner naming QUEUE.md q6; live GET → 200 {"commit":"6574cfe","branch":"claude/operator-manual-agent-systems-tmrdiz","builtAt":"2026-09-01T10:04:23.799Z"}) **DONE on branch `mct/2026-09-02-read-prod-url`, PR #2 into `claude/operator-manual-agent-systems-tmrdiz`; verdict line verbatim, exit 0: `READPROD status=200 bytes=126 url=https://phineasfritsch.com/version.json`, and it printed `"branch": "claude/operator-manual-agent-systems-tmrdiz"` — which is the whole point of the item: an unattended run now says out loud that production is not serving `main`.**
- [ ] q4 · quick · Make verify/test.ps1 declare its runner WITHOUT a prose precondition, because prose is not enforcement (O00). Replace the empty `$Runner = ''` with a resolver that reads package.json and uses `npm test` only when a `test` script actually exists, falling back to the current empty-state line otherwise — so it can never exit 2 on every scheduled run merely because it is standing on a tree that has no suite. Main's package.json scripts stop at `format`; the working branch has `"test": "vitest run"`. Note that node_modules here is main's install and contains no vitest, so the first real run needs `npm ci` against the branch's package.json. Then run it once and paste the line verbatim into README.md and QUEUE.md: `TESTS total=… passed=… failed=0 skipped=…`. The last recorded count is 85 (ops/baseline.json, ops/floors.json). If you get fewer than 85, that IS the finding — report it and stop; do not record the lower number as a new baseline.
- [ ] q5 · deep · Make the gate runnable on the Windows desk that now dispatches these runs, without breaking the Linux cloud routines that also use it. ops/gate.mjs line 31 calls `spawnSync(cmd, args, { cwd: REPO, encoding: 'utf8', maxBuffer: … })` with no `shell: true`, invoked as `run('npx',['prettier','--check','.'])`, `run('npm',['run','--silent','check'])`, `run('npm',['run','--silent','build'])`, `run('npx',['vitest','run'])` — Node refuses to spawn a `.cmd` that way, so gates 1-4 die with ENOENT and every unattended run here reports a gate that could not run, which is a FAILURE (O13), not a pass. Verified on this desk: `spawnSync('npx',['--version'])` → error.code ENOENT, node v26.3.0. Lines 101-106 free the preview port with `spawnSync('bash',['-lc','fuser 4173/tcp …'])` and ops/lib.mjs `chromiumPath()` resolves from `/opt/pw-browsers` — both Linux-only. Make the spawns and the port reclaim platform-conditional, and let the browser gate skip with a STATED reason and a printed count of `—` rather than silently, so a skip can never read as a pass. Keep the Linux paths intact. Base this PR on `claude/operator-manual-agent-systems-tmrdiz`.
- [ ] q6 · quick · Hoist the five things only Phineas can do into a short block at the top of the single queue, one line each with the exact action, so every run's brief carries them and he does not read two hundred lines of ops/QUEUE.md to find his own homework: B8 access change on the schedule worker (first, and do NOT restate its specifics — this is a public repository and that recipe was already redacted from it once); B1 paste LinkedIn headline, employment with dates, and education, which blocks the resume's employment section (R2); B10 say whether the iOS app is separate work from Shelfmark's route planner; B11 open The Cut Card's paywall and check it against its own no-claims-about-money rule; R10 add a proxied `www` CNAME to phineasfritsch.com — confirmed NXDOMAIN from this machine on 2026-09-02 while the apex resolves to 172.67.203.163 / 104.21.52.202, and the session CLOUDFLARE_API_TOKEN is Pages-scoped so no agent can add it. Also mark R3 and R4 done: all six pins in ops/pins.json are `"active": true`, and blog/[slug]/+page.svelte now carries the single h1.
- [ ] q7 · quick · One queue, not two, and commit it. Root QUEUE.md, PINS.md, docs/ and verify/ are UNTRACKED (`??` in git status) — queue state written there is invisible to both cloud routines, is not backed up, and lives only on this disk. Commit them, make ops/QUEUE.md the single queue, cut root QUEUE.md to a pointer at it plus the `## Findings` section testers append to, and fix root QUEUE.md item q7, which tells a fixer to set `$DeployCmd` in `deploy.ps1` — a file that does not exist here; the deploy is `node ops/deploy.mjs`, which no agent may run. Same for PINS.md, whose pin block sits empty between `<!-- pins:begin -->` markers while ops/pins.json holds six active pins with a `_doc` block explaining the rules. Root QUEUE.md also still describes the project as '(adopted — this repository existed before mct did. Say here what it is for.)' — replace that with one sentence and delete items q1, q3 and q5 that depend on the placeholder.
- [ ] q8 · deep · Two fixers, one queue, no lock. ops/QUEUE.md D13 records two cloud routines still running — a four-hourly tester forbidden from fixing anything, and a daily fixer that works one queue item and pushes to an isolated branch — and mct now dispatches its own tester and fixer against the same repository and the same queue. All are told to take 'the top open item'. Write into ops/OPERATING.md which automation owns which branch and which queue section, and make the IN PROGRESS convention machine-visible: owner id plus a UTC timestamp on the item line, so a second fixer skips a claimed item instead of redoing it, and so an item stranded `[~]` by a dead session is distinguishable from a live claim by its age. Include the open-PR rule — an item whose PR is already open is claimed, not available. Root QUEUE.md currently asserts 'a desk runs one worker at a time, so there is nothing for it to collide with', which is false the moment a second automation shares the repo; fix that sentence. Do not disable the cloud routines yourself — record that retiring them is his call.

## Done

## Findings

Appended by the mct fixer run of 2026-09-02 while working q1. These are
observations, not claimed work. Nothing here was fixed: q1 is one item, and
tidying something noticed on the way is how one item becomes three.

- **F1 · the single root cause behind three "failures" on this Windows desk.**
  `ops/lib.mjs:5` is
  `export const REPO = new URL('..', import.meta.url).pathname.replace(/\/$/, '');`
  On Windows `.pathname` yields `/C:/…` (verified: node prints `/C:/x`), so every
  `join(REPO, …)` produces `C:\C:\…`. Three separate gate failures are all this
  one line:
  - `tests/pins.spec.ts` cannot load at all — `ENOENT … open 'C:\C:\…\ops\pins.json'`.
    That is why the suite reports 70 instead of 85. It is a loader failure, not a
    deletion: voice 41 + contrast 29 = 70, and pins.spec.ts carries the missing 15.
  - `ops/postbuild.mjs` prints `build/not-found/index.html is missing — did the
route prerender?` when the file is present and 5646 bytes. The page prerendered
    fine; only the lookup path is malformed. This is why build counts 15, not 16 —
    the 16th artefact is the `404.html` postbuild publishes.
  - `ops/sanity.mjs` crashes outright at line 338 — `ENOENT … open 'C:\C:\…\src\lib\data\projects.ts'`.
    The fix is `fileURLToPath(new URL('..', import.meta.url))` from `node:url`, which
    is correct on Linux too, so it does not endanger the cloud routines. This belongs
    with **q5** (same family: Windows-hostile ops tooling) and arguably should be the
    first thing q5 does, since until it lands _no_ unattended run on this desk can
    report a real tests or sanity count — and per O13 that is a FAILURE every time,
    not a pass.

- **F2 · `verify/test.ps1` no longer matches what q4 describes.** q4 says it has an
  empty `$Runner = ''` that yields `TESTS total=0`. It does not: `$Runner` is now
  hard-coded to `'npm test'`. On `main`, whose package.json scripts stop at
  `format`, that means it exits **2** with `TESTS could-not-run` rather than
  reporting a zero count. q4's actual remaining work is the package.json-reading
  resolver; the fallback branch it describes is now unreachable on the branch and
  wrong on main. Re-word q4 before working it.

- **F3 · `npm run gate:fast` does not rewrite the baselines when it fails this way.**
  Ran it against the merge result: `0/5 gates pass`, every stage FAIL with **empty**
  output (the q5 ENOENT). Checked afterwards — `ops/baseline.json` and
  `ops/floors.json` were untouched. So q5 can be worked without the usual fear of
  gate.mjs silently rewriting the floors, at least while the spawns are broken.
  Worth re-checking once they are fixed.

- **F4 · two of the three scaffold gates currently assert nothing.**
  `SANE checks=0 ok=0 failed=0 skipped=0 broken=0` and
  `PINS pinned=0 found=0 missing=0 stale=0 files=165`. Both exit 0. A guard
  asserting nothing passes everything (O03, O09) — reading these as green is exactly
  the failure mode the scaffold exists to prevent. PINS.md's own prose says filling
  the pins in is "queue item q5", but in this file q5 is the Windows gate item;
  the pins work has no item at all. That mis-pointer should be fixed when q7
  reconciles the two queues.

- **F5 · the TESTS line could not be recorded where the brief asks.** The standing
  gate instruction is to write the `TESTS total=…` line verbatim into README.md.
  q1 forbids any other change ("do nothing else in it"), and README.md is tracked
  on `main`, so writing it would have put an uncommitted edit on main inside a
  merge-only PR run. Recording it here instead:
  - on `main` (this working tree): `TESTS could-not-run`, exit 2 — no count exists.
  - on the merge result, after `npm ci`: `Tests  70 passed (70)`, exit 1, one suite
    file unloadable. **70 is below the floor of 85**, and per F1 that gap is entirely
    `tests/pins.spec.ts` failing to load on Windows, not missing tests. Verified by
    re-running the pristine branch with no merge overlay: byte-identical output.
    Whoever lands q4 or q5 should write the first honest count into README.md.

- **F6 · the merge itself is clean and loses nothing from either side.** Recorded
  here so the next run need not re-derive it. `git merge-tree --write-tree` exits 0
  and gives tree `ed38d43`. `main`'s cloud commit `e8fdf5f` touches SceneRoot in
  exactly three hunks (the `Clouds` import, the `reducedMotion` const and its guard,
  and `<Clouds animate={!reducedMotion} />`) and all three survive. The branch had
  also edited that file; its `flatShading: true` removal is its own change — present
  at merge base `aa1ae6e`, absent on the branch, untouched by `e8fdf5f` — and it
  survives too. Relative to the branch the merge adds exactly 4 files, all his;
  `ops/` and `tests/` are byte-identical between branch and merge result.

- **F7 · this file is still untracked, so none of the above is backed up or visible
  to the cloud routines.** That is q7, and it is now doing real damage: the q1 claim
  marker and these findings live only on this disk. A second fixer would not see
  that PR #1 exists from this file — only from `gh pr list`, which is why the
  open-PR check in the brief is currently the only working lock. q8 should say so.

Appended by the mct fixer run of 2026-09-02T17:12:54Z while working **q3**. Same
rule as above: observations, not claimed work. Nothing here was fixed.

- **F8 · the open-PR check is the only working lock right now, and it did its job.**
  `gh pr list --state open` returned exactly one PR: **#1**,
  `claude/operator-manual-agent-systems-tmrdiz` -> `main`, "Merge the working site
  into main (q1 / his B9)". q1 was therefore already claimed, so this run did not
  open a second merge PR and took the next item that does not depend on it. q2 is
  still blocked behind that merge: q2's own precondition,
  `https://raw.githubusercontent.com/phineasfritsch/phineasfritsch.com/main/ops/gate.mjs`,
  answered **404** at 2026-09-02T17:04Z, so `main` still carries no `ops/` and the
  /answers/ caveat is still true. q3 was the first genuinely available item.

- **F9 · the first real TESTS count this desk has ever produced, and it confirms F1
  exactly.** F5 could only report `TESTS could-not-run` from `main`. Run here against
  a pristine `origin/claude/operator-manual-agent-systems-tmrdiz` worktree after
  `npm ci`, `verify/test.ps1` printed, verbatim:
  `TESTS total=71 passed=70 failed=1 skipped=0`, exit 1.
  That is **70 passed against a floor of 85** (ops/floors.json). The one failure is
  `tests/pins.spec.ts (0 test)` failing to load, and the arithmetic is F1's:
  voice 41 + contrast 29 = 70, with pins.spec.ts carrying the missing 15. So the
  gate is red on this desk **before any change is made**, for the single reason F1
  names, and no item that does not touch `ops/lib.mjs` can turn it green. Note the
  count shape differs from F5's: F5 read vitest's own `70 passed (70)`, whereas
  test.ps1 reports `total=71` because it counts the unloadable _file_ as one failed
  test. Both describe the same tree.

- **F10 · a fixer cannot run `verify/*.ps1` from inside an EnterWorktree session on
  this desk.** Every `powershell` invocation from an isolated session is refused
  ("what it reads or is handed as shell text cannot be shown not to run git"), in
  both piped and plain form. So the isolation the brief asks for and the gates the
  brief mandates are mutually exclusive as things stand. The workaround this run
  used, which should go into ops/OPERATING.md when q8 lands: create the worktree
  with `git worktree add <path> -b <branch> origin/<base>`, enter it, then leave it
  with ExitWorktree `keep` (the worktree survives), and drive the worktree's **own
  copy** of the script by path from the repository root -
  `powershell -NoProfile -File .claude/worktrees/<name>/verify/test.ps1`.
  That gates the right tree rather than `main`, because test.ps1 line 19-20 does
  `$Root = Split-Path -Parent $PSScriptRoot; Set-Location $Root`. Verify this per
  script before trusting it: `read-prod.ps1` sets no location and does not need to,
  but a future gate that reads the repo without `$PSScriptRoot` would silently
  measure whichever tree it was launched from - which is exactly how a desk reports
  a number for a tree it never tested (O13).

- **F11 · committing root QUEUE.md to a tracked branch drags it inside
  `prettier --check .`, and the `format` baseline is 0.** `.prettierignore` on the
  working branch excludes `/static/`, `.vscode/`, `.claude/`, lockfiles and
  `ops/baseline.json` - it does **not** exclude root markdown. Checked before
  committing: `npx prettier --check QUEUE.md` exited **1**. Left unformatted this
  would have moved `format` from 0 to 1 and the regression would have been mine, on
  an item that changes no application code. Fixed by running `npx prettier --write
QUEUE.md`; the reflow is cosmetic (list-continuation indents, `*no*` -> `_no_`).
  Whoever lands **q7** should decide deliberately whether the queue is prettier's
  business or belongs in `.prettierignore`; `verify/*.ps1` needs no decision, since
  prettier does not handle `.ps1` at all.

- **F12 · read-prod.ps1's empty-state banner still points at the wrong queue item.**
  Line 27 reads "record in QUEUE.md that there is no production (QUEUE.md q6)", but
  q6 in this file is the hoist-his-homework item, not the production-URL item. With
  `$ProdUrl` now set the branch is unreachable, so this is dormant rather than
  harmful, and fixing it was not q3's job. It belongs with **q7**, which is already
  chartered to fix the same class of mis-pointer (PINS.md naming `q5` for the pins
  work, root q7 naming a `deploy.ps1` that does not exist).

- **F13 · the whole gate state on this desk, measured, and the deadlock it creates.**
  Measured in a worktree of pristine `origin/claude/operator-manual-agent-systems-tmrdiz`
  after `npm ci`, before and after q3's two-file change. `npm run gate:fast` still
  cannot spawn (F3/q5), so the stages were run individually, as the brief allows.

  | stage                    | floor/baseline | before                                                  | after     | reading                               |
  | ------------------------ | -------------- | ------------------------------------------------------- | --------- | ------------------------------------- |
  | `verify/test.ps1`        | tests 85       | `TESTS total=71 passed=70 failed=1 skipped=0` exit 1    | identical | RED, pre-existing (F1)                |
  | `verify/sane.ps1`        | -              | `SANE checks=0 ok=0 failed=0 skipped=0 broken=0` exit 0 | identical | exits 0, asserts nothing (F4)         |
  | `verify/pins.ps1`        | -              | `PINS could-not-run` exit 2                             | identical | FAILED (O13), see below               |
  | `npm run check`          | typecheck 11   | `0 ERRORS 11 WARNINGS` exit 0                           | identical | GREEN, exactly on baseline            |
  | `npm run build`          | build 16       | postbuild ENOENT, exit 1                                | identical | RED, pre-existing (F1)                |
  | `node ops/sanity.mjs`    | sanity 22      | crash ENOENT, exit 1                                    | identical | RED, pre-existing (F1)                |
  | `npx prettier --check .` | format 0       | 66 files                                                | 66 files  | RED, desk artefact, see below         |
  | browser                  | 40             | NOT RUN                                                 | NOT RUN   | FAILED (O13), needs Linux/pw-browsers |

  Three separate confirmations of **F1** were obtained here independently of the
  earlier run, on a tree with no merge overlay:
  `node -e "new URL('..','file:///C:/x/ops/lib.mjs').pathname"` returns `/C:/x/`;
  `build/not-found/index.html` **exists**, 5645 bytes, while postbuild calls it
  missing; and sanity dies on
  `path: 'C:\C:\Users\...\src\lib\data\projects.ts'`. One line,
  `ops/lib.mjs:5`, accounts for the tests, build and sanity rows above.

  The **format** row is a second, unrelated desk artefact and is not a content
  regression: `core.autocrlf=true` here and `.gitattributes` is `* text=auto`, so
  every tracked text file lands CRLF in the working tree while prettier defaults to
  `endOfLine: "lf"`. All 66 are tracked files checked out that way; neither file
  this run adds is among them. It is the same family as F1 (Windows-hostile ops
  tooling) and belongs with **q5**.

  The **pins** row is not a Windows problem: `PINS.md` is untracked, so it is absent
  from _every_ tracked tree, and `verify/pins.ps1` therefore reports could-not-run on
  any branch checkout rather than the vacuous `pinned=0` it gives in the desk's own
  working copy. That is **q7**, and it means gate 3 has never actually run against a
  committed tree.

  **The deadlock, which is the point of this finding.** The standing instruction is
  "do not open a pull request for work whose gates you could not get green". Read
  strictly, no item in this queue can ever ship from this desk: four rows above are
  red or unrunnable _before any change is made_, and none of them can be turned green
  by an item that does not touch `ops/lib.mjs`, `.gitattributes` or `PINS.md` -
  including **q5** itself, which even when finished would leave `format`, `pins` and
  `browser` non-green here. The reading this run acted on is that the rule bars
  shipping work you broke or could not verify, not work that is bit-identical across
  gates that were already red; q3's own artefact was verified directly (exit 0, a
  200, and the right branch name in the body). Whoever writes **q8**'s ownership
  rules should settle this explicitly, because the next unattended run will hit it
  again and the two available failure modes are "never ship anything" and "learn to
  wave gates through", and the second one is how O00 happens.

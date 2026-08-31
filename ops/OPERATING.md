# Operating manual — phineasfritsch.com

Written for an operator with no memory, because that is what every scheduled run is:
a fresh clone that knows nothing. Everything needed is here or linked from here.

## The premise

Agents report success on broken work. Routinely, confidently, with a detailed account
of what they verified. Not sometimes, and not only the bad ones. Everything below
exists so that a claim can be contradicted before it is believed.

This project has already demonstrated it in both directions. The state sanity check,
written before any feature work, immediately found a 903KB homepage that renders 53
characters without JavaScript. The pin hygiene test rejected two pins the author had
just written. And a subagent's dossier — excellent, mostly correct — still had to be
re-verified by hand before a single line of it was allowed near a resume.

## Get current

Run all of these. The redundant-looking ones are the point: a bare checkout that
silently moves backwards has cost real days elsewhere.

    git fetch origin
    git status                 # expect clean
    git rev-parse --short HEAD
    npm ci
    node ops/read-prod.mjs     # what is actually live, before you touch anything

## The gate

    npm run gate               # everything, numbered, with counts
    npm run gate:fast          # skips the browser gate

Expected numbers as of the last recorded run are in `ops/baseline.json`, and the gate
prints drift against them. **Green and red are not enough.** A gate can stay green
while its count falls, and that is exactly the case nobody notices. If a count drops,
that is the finding — investigate before doing anything else.

Individually:

    npm test                   # vitest: pins + hygiene
    npm run sanity             # artefact + deployment state, machine-readable
    npm run test:e2e           # real browser, real built artefact
    npm run prod               # read production, exit 1 if it is not serving

Chromium is pre-installed at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`.
The installed `@playwright/test` wants a different build number, so pass that path
via `CHROMIUM_PATH` rather than running `playwright install`, which will not work here.

## Pinned claims

`ops/pins.json` holds properties that are load-bearing and invisible to ordinary
tests. Read the `_doc` block in that file before touching it. The rules in short:
pin by signature not by literal; comments are stripped before searching; search the
whole app, never one file; a pin must be green the moment it is written.

`active: false` means the property does not exist yet and the pin is a spec. Flip it
to `true` **in the same commit that writes the property**, never in a later one.

## What this project has already been caught by

Stated as prohibitions, because that is the only form that survives a fresh context.

- **Never claim the site is deployed without reading it back.** `ops/deploy.mjs`
  fetches `/version.json` and compares the commit. The apex spent an unknown length
  of time returning a Cloudflare 530 while the repo looked healthy.
- **Never push after deploying.** Push first, always. Deploying first opens a window
  where anything reading the repository sees older code and calls it live.
- **Never `git add -A`.** Stage explicit paths. Something else is usually mid-flight,
  and a commit that sweeps unrelated half-finished files into history carries a
  message describing work it does not contain.
- **Never put a fact on the site or the resume that is not in `ops/panel/EVIDENCE.md`.**
  His major, his graduation year, and his employment history are NOT established.
  A pre-med signal exists in his code; it is a feature he built, not a fact about him.
  He has completed zero actuarial exams — Exam FM is an intention, never a credential.
- **Never include `yikyak_archive`.** The reason is in EVIDENCE.md so that nobody
  re-adds it later believing it was an oversight.
- **Never weaken an assertion to something that would pass on an empty page.** When a
  check legitimately changes, leave a comment saying what the new form is and why the
  property is intact, and count the changes. A large count means the work is drifting,
  not the checks.
- **Always pipe verbose output.** `| tail`. One test failure elsewhere dumped 745KB
  into a context window. `ops/gate.mjs` keeps 40 lines and discards the rest.

## Parallelism

The dividing line is shared mutable state, not task size.

| Work                                      | Shares        | Run                             |
| ----------------------------------------- | ------------- | ------------------------------- |
| Research, review, judging, persona panels | nothing       | fan out wide                    |
| One page per agent, ownership declared    | nothing       | parallel                        |
| Anything running the suite                | the build dir | serial, always                  |
| Two agents on one file                    | the file      | never; last write wins silently |
| Anything committing                       | the index     | one at a time, explicit paths   |
| Deploying                                 | production    | one, after everything else      |

Port agents never run the suite. One serial verifier runs after the wave. **Never let
a worker grade its own work**, and treat a missing verification exactly as a failed one.

## When you cannot finish

Revert per page, not per wave — one bad page should not cost three good ones.
Quarantine a failed attempt on a branch before reverting it; the next attempt mines it.
Ship the part that works and say plainly what you did not do and why.

A smaller honest result beats a larger claimed one. This is not a consolation; it is
the standard, because the alternative is a report nobody can trust and work that has
to be redone from scratch.

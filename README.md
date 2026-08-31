# phineasfritsch.com

Personal site for Phineas Fritsch. SvelteKit, static, deployed to Cloudflare Pages.

The interesting part of this repository is not the site. It is `ops/`, which exists
because **agents report success on broken work** — routinely, confidently, and with a
detailed account of what they verified. Every tool in there is something that can
contradict a claim, and each one was written before the work it guards.

## Quick start

```sh
npm ci
npm run dev            # develop
npm run gate           # everything: format, types, build, tests, sanity, browser
npm run prod           # what is production actually serving right now
```

Read [`ops/OPERATING.md`](ops/OPERATING.md) before changing anything. It is short, and
it lists the traps this project has already been caught by.

## The machinery

| Command             | What it answers                                                                                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm run gate`      | Everything, numbered, and **every gate prints a count**. Green and red are not enough — a gate can stay green while its count falls, and that is the case nobody notices. Drift against the last run is printed automatically. |
| `npm run prod`      | Is production serving? Read-only, one command, and the exit code is the verdict so a loop never has to parse a log.                                                                                                            |
| `npm run sanity`    | Is the _state_ sane — the artefact, the deployment, the world? Distinct from tests, which only check code.                                                                                                                     |
| `npm test`          | Unit tests, including the pinned claims.                                                                                                                                                                                       |
| `npm run test:e2e`  | Real browser, real built artefact, desktop and mobile.                                                                                                                                                                         |
| `npm run deploy`    | Pushes **before** deploying, then reads production back and compares the commit, so parity is a fact rather than a hope.                                                                                                       |
| `node ops/shot.mjs` | Screenshots every page. Starts and stops its own server, and fails if a page renders almost nothing.                                                                                                                           |

## Pinned claims

`ops/pins.json` guards properties that are load-bearing and invisible to ordinary
tests: the per-project AI disclosure, the limitation every project states about itself,
the skip link, the contact address, and the position of the "how much of this did you
write?" question on `/answers/`.

They are matched **by signature, not by literal**, with comments stripped first —
otherwise a deleted sentence quoted in the comment explaining its deletion satisfies
the very test protecting it. Read the `_doc` block in that file before touching it.

## Facts

Nothing reaches the site or the resume that is not in `ops/private/EVIDENCE.md`, which
separates what was independently verified from what the subject stated himself. That
file is **not in this repository** — see [`ops/panel/README.md`](ops/panel/README.md) —
because this repository is public and it holds personal details. The rule is enforced
by review rather than by code, and it has already caught two claims that reached the
site without being recorded.

## Notes

The 3D scene at `/planet/` used to be the homepage. It cost 903KB of JavaScript and
21.5 seconds to render 37 characters of text, and with JavaScript disabled it rendered
nothing at all, so every crawler and link preview saw an empty page. It is kept, behind
a button that states its weight, because it is a real thing that was built — it is just
nobody's toll gate on the way to a sentence any more.

import migration from './migration.json';
/**
 * Projects, as data.
 *
 * Every field here is checkable by a reader in one click. That is the whole design:
 * a claim a skeptic cannot verify is worth less than no claim at all.
 *
 * RULES (see ops/pins.json, honesty.ai-disclosure and honesty.scope-caveat):
 *  - `assisted` is required on every project and is never empty. He chose to state
 *    the AI assistance plainly, per project. Do not soften it, do not move it to a
 *    footer, do not delete it because a page looks cleaner without it.
 *  - `limit` is required on every project. Every claim names what it does NOT do in
 *    the same breath. A reader who finds one overstatement discounts the whole page,
 *    so the caveats are what make everything else believable.
 *  - Numbers must come from ops/panel/EVIDENCE.md, which was verified by hand.
 */

export type Project = {
	slug: string;
	name: string;
	what: string;
	url?: string;
	/**
	 * Who can actually open it. 'public' is a stranger with the link; 'preview' is
	 * running at a temporary address because the real domain has not been cut over;
	 * 'internal' is running but deliberately not linked from here. The distinction
	 * exists because "six of my projects are serving traffic" was true and still
	 * misleading — two of the six are not things a reader can go and use.
	 */
	reach?: 'public' | 'preview' | 'internal';
	repo?: string;
	live: boolean;
	stack: string[];
	/** The one decision worth an interview question. His judgement, not the tool's. */
	decision: string;
	/** What it does not do. Required. */
	limit: string;
	/** What was AI-assisted, stated plainly. Required. */
	assisted: string;
	year: string;
};

/**
 * The migration figures, from the file ops/measure-migration.mjs writes.
 *
 * They are not typed into this sentence because I typed them wrong twice, inside a
 * claim that boasted about having measured them: first "every old URL still
 * resolves", when four did, then a count taken from two of the old sitemap's six
 * sub-sitemaps. Both were caught by a reviewer running one curl. A number a person
 * types is a number a person can get wrong twice.
 */
function migrationLimit(): string {
	return `The redirect map is incomplete and I would rather say by how much. The old sitemap index names ${migration.sitemaps} sub-sitemaps and ${migration.total} URLs; ${migration.resolve} resolve on the replacement. The ${migration.missing} that do not include ${migration.topLevelMissing} of the ${migration.topLevel} top-level pages, among them ${migration.notableMissing.slice(0, 3).join(', ')}. Measured by ops/measure-migration.mjs rather than counted by hand, because counting it by hand produced a wrong answer twice. The live chapter domain still serves the old WordPress site, and the cutover is mine to schedule.`;
}

export const projects: Project[] = [
	{
		slug: 'dibs',
		reach: 'public',
		name: 'Dibs',
		what: 'Ranks UCLA general-education courses by real grade history and emails you when a seat opens in one you are watching.',
		url: 'https://dibs.ge',
		// Public, and checked with `git ls-remote` rather than by asking for a README:
		// this repository has no README.md, and the round-9 check took that 404 as
		// evidence the repository was private. It was not, and the essay went out
		// saying so.
		repo: 'https://github.com/phineasfritsch/ge_snipe',
		live: true,
		year: '2026',
		stack: ['Rails 8', 'PostgreSQL', 'Kamal', 'Docker'],
		decision:
			'It runs on one 2.5 GB VPS, so the whole configuration is shaped by that ceiling. Postgres is set to 60 connections rather than the obvious 30, because Rails multi-database means a single thread holds four connections at once, and Kamal overlaps the old and new containers during a rollout — so the limit is breached exactly when deploying, and the symptom is the website failing rather than the jobs. That one is written down in config/deploy.yml so the next person does not have to rediscover it at 2am.',
		limit:
			'UCLA only, and it cannot enroll you. It watches and it emails. The grade data ends at Spring 2025, because that is the last term the public-records responses cover.',
		assisted:
			'Claude wrote most of the code. The data model, the scraping budget, and the deployment sizing were decisions I made and can defend line by line.'
	},
	{
		slug: 'shelfmark',
		reach: 'public',
		name: 'Shelfmark',
		what: 'A replacement for UCLA library search, built on the catalog endpoint the university already publishes. It finds the book, then tells you which shelf face to stand at — which the official search cannot do at all.',
		url: 'https://shelfmark.phineasfritsch.com',
		// /work/ says source is linked where it is public, and this one is public. It
		// was the only project whose readable source the site withheld, on the page
		// making the most specific numeric claims — a reviewer cloned it, counted 453
		// faces and ten level keys with Level 4 absent, and confirmed every figure.
		repo: 'https://github.com/phineasfritsch/biomed_callnumber_finder',
		live: true,
		year: '2026',
		stack: ['Vanilla JS', 'Alma SRU', 'Cloudflare Workers', 'Tesseract.js'],
		decision:
			"UCLA's search will give you a call number and then abandon you: there is no floor, row or side field anywhere in its records. Ours came from walking the building. I walked the stacks with a phone and transcribed the range labels into a 26KB file describing 453 shelf faces that ships with the page, so a call-number lookup makes zero network requests. The endpoint it searches also returns results in filing-title order with no spelling correction, so ranking, edition grouping and typo recovery are all done in the browser afterwards. Call numbers sort as decimals rather than as whole numbers, because the Cutter digits after the letters are a fraction: sort the digits as whole numbers and W1 AM477 lands before W1 AM4733, which is not where they sit on the shelf. That pair is in the real survey, so getting it wrong sends someone to the wrong end of a range.",
		limit:
			'The shelf map is the biomedical library only, and a bare call number is currently assumed to be a Biomed one, so a call number that lives in another building can still return a confident shelf face here. Level 4 has not been surveyed. It has no accounts, holds or renewals, and it links out to the official record rather than replacing it.',
		assisted:
			'Claude wrote most of the code. The shelf survey, the call-number rules and the routing constraints came from working the desk. Nobody asked for this one either.'
	},
	{
		slug: 'biomed-schedule',
		reach: 'internal',
		name: 'Better Bio Schedule',
		what: 'One link for every daily staff schedule at the biomedical library, laid out for a phone, with a notification when you are put on something other than the desk.',
		// The public link is OFF. Its API answers an unauthenticated request with
		// coworkers' first names, their duty assignments, and a link to the internal
		// sheet — other people's information, on a service this page was sending
		// readers to. The queue decided not to NAME the endpoint here because naming
		// it advertises it, and then left a hyperlink to it on the homepage, which
		// advertises it considerably more. A reviewer called that the one judgment
		// call on the site that ran the wrong way, and he was right.
		//
		// `url` comes back when the worker requires auth. The status probe still
		// runs, so the measured latency below stays honest; only the anchor is gone.
		// Its return is guarded in ops/sanity.mjs, because prose alone put the
		// Collab Hub claim back in three files.
		url: undefined,
		live: true,
		year: '2026',
		stack: ['Cloudflare Workers', 'Web Push', 'iCalendar'],
		decision:
			'It reads the schedule the library already publishes rather than asking anyone to maintain a second copy. A tool that needs someone to keep it fed stops being fed the week you stop asking.',
		limit:
			'Reads the schedule; it cannot change it. One library. I have taken the link off this page.',
		assisted:
			'Claude wrote most of the code. I wanted it because I was the one checking the sheet on my phone before every shift.'
	},
	{
		slug: 'the-cut-card',
		reach: 'public',
		name: 'The Cut Card',
		what: 'Blackjack practice that drills you to correct first and fast second: basic strategy, counting, and the arithmetic of how much you can put at risk.',
		url: 'https://thecutcard.com',
		live: true,
		year: '2026',
		stack: ['React Native', 'Expo', 'TypeScript', 'Cloudflare Workers'],
		decision:
			'I made one rule before writing anything and held it: no claim about money, anywhere — not in the app, not on the paywall, not in a notification. A practice tool for a game with an edge against you has exactly one honest job, which is making you correct, and the moment it implies a return it has started lying. The engine that does the strategy, counting and risk maths is plain TypeScript with no React in it, so it can be tested without a simulator.',
		limit:
			'It teaches; it does not predict, and it will not tell you what you stand to win. Nothing in it is financial advice and it is not a system.',
		assisted:
			'Claude wrote most of the code. The no-money-claims rule, the free-versus-paid line, and the decision to keep the engine framework-free are mine.'
	},
	{
		slug: 'jellyfin-matcher',
		reach: 'public',
		name: 'Jellyfin Matcher',
		what: 'Everyone swipes the same deck of films on their own phone and the first one you all like wins. No stalemates — that is the whole point.',
		url: 'https://jellymatch.phinster.net',
		repo: 'https://github.com/phineasfritsch/jellyfin-matcher',
		live: true,
		year: '2026',
		stack: ['Next.js', 'socket.io', 'Docker', 'GHCR'],
		decision:
			'The build gate fails when a number goes down, not just when a test breaks — test files, test cases, pinned claims and killed mutations all have floors in gates.json, because a silently deleted test looks exactly like a passing suite. Raising a floor has to happen in the same commit that earns it.',
		limit:
			'You need your own Jellyfin server. It is not a hosted service and there is nothing to sign up for.',
		assisted:
			'Claude wrote most of the code and did the API spelunking. I steered, made the calls on how it should behave, and tested it on real hardware.'
	},
	{
		slug: 'bruinthetachi',
		reach: 'preview',
		name: 'bruinthetachi.com',
		what: "A replacement for my fraternity chapter's WordPress site: a static build the next webmaster can edit without knowing what a build is. It runs, and the domain has not been cut over to it yet.",
		url: 'https://preview.bruinthetachi.pages.dev',
		repo: 'https://github.com/phineasfritsch/bruinthetachi.com',
		live: true,
		year: '2026',
		stack: ['Astro', 'Sveltia CMS', 'Cloudflare Pages'],
		decision:
			'The old site is linked from alumni emails going back years, so breaking those links is the real cost of a migration, and the redirect map is the part of this I care most about getting right. It is not done: see the limit below for what still 404s and by how much. The member family tree is laid out at build time and shipped as plain SVG, so no visitor downloads a graph library to look at a static picture.',
		limit:
			migrationLimit() +
			' One chapter, not a product, and not something anyone else should adopt without reading the photo policy first.',
		assisted:
			'Claude wrote most of the code. The migration plan, the redirect map and the content policy are mine.'
	},
	{
		slug: 'nakra',
		name: 'nakra',
		what: 'A reminder app where the condition is a thing you build out of blocks — every Tuesday that lands on a full moon, or the next dry morning.',
		repo: 'https://github.com/phineasfritsch/nakra',
		live: false,
		year: '2026',
		stack: ['Swift 6', 'SwiftUI', 'SwiftPM'],
		decision:
			'A weather condition three days out is not true or false, it is unknown, so the engine answers yes, no, or maybe and shows the maybes as tentative instead of guessing. That is also what keeps it inside iOS’s limit of 64 scheduled notifications.',
		limit:
			'Not on the App Store. The engine is tested; the app around it is still a skeleton, and the README says so.',
		assisted:
			'Claude wrote most of the code. The three-valued logic and the scheduling model are the parts I designed.'
	}
];

/** Ordered for a reader who has ninety seconds: live things first. */
export const orderedProjects = [...projects].sort((a, b) => Number(b.live) - Number(a.live));

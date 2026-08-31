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

export const projects: Project[] = [
	{
		slug: 'dibs',
		name: 'Dibs',
		what: 'Ranks UCLA general-education courses by real grade history and emails you when a seat opens in one you are watching.',
		url: 'https://dibs.ge',
		live: true,
		year: '2026',
		stack: ['Rails 8', 'PostgreSQL', 'Kamal', 'Docker'],
		decision:
			'It runs on one 2.5 GB VPS, so the whole configuration is shaped by that ceiling. Postgres is set to 60 connections rather than the obvious 30, because Rails multi-database means a single thread holds four connections at once, and Kamal overlaps the old and new containers during a rollout — so the limit is breached exactly when deploying, and the symptom is the website failing rather than the jobs. That one is written down in config/deploy.yml so the next person does not have to rediscover it at 2am.',
		limit:
			'UCLA only, and it cannot enrol you. It watches and it emails. The grade data ends at Spring 2025, because that is the last term the public-records responses cover.',
		assisted:
			'Claude wrote most of the code. The data model, the scraping budget, and the deployment sizing were decisions I made and can defend line by line.'
	},
	{
		slug: 'shelfmark',
		name: 'Shelfmark',
		what: 'Turns a call number into a physical shelf in the UCLA biomedical library, and a photo of a pull list into a walking route through the building.',
		url: 'https://shelfmark.phineasfritsch.com',
		live: true,
		year: '2026',
		stack: ['Vanilla JS', 'Cloudflare Workers', 'Tesseract.js'],
		decision:
			'The library stopped using LibMaps and the catalogue will tell you a call number but not where to stand, so the dataset simply did not exist. I made it: I photographed the range labels on the end of every shelf across nine levels and transcribed them into one validated file. The sorting is the subtle part. The digits after a Cutter letter are a decimal fraction, so AM4733 shelves before AM477, which is the opposite of what plain string comparison gives you, and getting it backwards sends you to the wrong end of a floor.',
		limit:
			'One building. The route planner assumes you are on foot and refuses to plan stairs for more than five books, because at that point it is a truck trip.',
		assisted:
			'Claude wrote most of the code. The shelf survey, the call-number rules and the routing constraints came from working the desk. Nobody asked for this one either.'
	},
	{
		slug: 'biomed-schedule',
		name: 'Better Bio Schedule',
		what: 'One link for every daily staff schedule at the biomedical library, laid out for a phone, with a notification when you are put on something other than the desk. It also carries the Collab Hub briefing, which is the part my coworkers use.',
		url: 'https://better-bio-schedule.phineas-fritsch.workers.dev',
		live: true,
		year: '2026',
		stack: ['Cloudflare Workers', 'Web Push', 'iCalendar'],
		decision:
			'It reads the schedule the library already publishes rather than asking anyone to maintain a second copy. A tool that needs someone to keep it fed stops being fed the week you stop asking.',
		limit: 'Reads the schedule; it cannot change it. One library.',
		assisted:
			'Claude wrote most of the code. I wanted it because I was the one checking the sheet on my phone before every shift.'
	},
	{
		slug: 'the-cut-card',
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
		name: 'Jellyfin Matcher',
		what: 'Everyone swipes the same deck of films on their own phone and the first one you all like wins. No stalemates — that is the whole point.',
		repo: 'https://github.com/phineasfritsch/jellyfin-matcher',
		live: false,
		year: '2026',
		stack: ['Next.js', 'socket.io', 'Docker', 'GHCR'],
		decision:
			'The build gate fails when a number goes down, not just when a test breaks — test files, test cases and pinned claims all have floors in gates.json, because a silently deleted test looks exactly like a passing suite. Raising a floor has to happen in the same commit that earns it.',
		limit:
			'You need your own Jellyfin server. It is not a hosted service and there is nothing to sign up for.',
		assisted:
			'Claude wrote most of the code and did the API spelunking. I steered, made the calls on how it should behave, and tested it on real hardware.'
	},
	{
		slug: 'bruinthetachi',
		name: 'bruinthetachi.com',
		what: 'Moved my fraternity chapter off WordPress onto a static site the next webmaster can edit without knowing what a build is.',
		live: false,
		year: '2026',
		stack: ['Astro', 'Sveltia CMS', 'Cloudflare Pages'],
		decision:
			'Every old WordPress URL still resolves, because a chapter site is linked from alumni emails going back years and breaking those is the actual cost of a migration. The member family tree is laid out at build time and shipped as plain SVG, so no visitor downloads a graph library to look at a static picture.',
		limit:
			'One chapter. Not a product, and not something anyone else should adopt without reading the photo policy first.',
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

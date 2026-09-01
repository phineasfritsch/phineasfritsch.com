<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { openCount, runningCount, spell } from '$lib/data/counts';
	import { emailLink } from '$lib/data/contact';
	// Every fact on this page comes from ops/panel/EVIDENCE.md. Nothing is inferred.
	// Dates follow LinkedIn where LinkedIn and the older .docx disagree, because he
	// confirmed LinkedIn is the current one.
	//
	// GPA is deliberately absent, and the figures are deliberately not repeated here:
	// this repository is public. The reasoning is in ops/private/EVIDENCE.md, which is
	// not. Omitting a GPA is unremarkable; publishing one nobody asked for is not.

	const DESCRIPTION = `Financial actuarial mathematics at UCLA, June 2027. Actuarial coursework and case competition work, plus ${spell(runningCount)} deployed software projects, ${spell(openCount)} of them open to anyone.`;
</script>

<Seo title="Resume — Phineas Fritsch" description={DESCRIPTION} path="/resume/" />

<section class="section" style="margin-top:2.5rem">
	<h1 style="font-size:clamp(1.6rem,3.6vw,2.2rem);letter-spacing:-0.02em;font-weight:600">
		Resume
	</h1>
	<div class="prose" style="margin-top:0.9rem">
		<p>
			Financial actuarial mathematics at UCLA, graduating June 2027. Sitting Exam FM in fall 2026;
			<strong>no exams passed yet</strong>. Reach me at
			{@html emailLink()}.
		</p>
		<!-- Five of eight reviewers asked for this independently: a recruiter who
		     wants to forward something to a hiring manager had nothing to attach.
		     One file, built from the same fact base as this page by
		     ops/resume-build.mjs, with the phone number stripped because a public
		     download is on the open internet permanently. -->
		<p>
			<a href="/Phineas-Fritsch-resume.pdf">Download as PDF</a> — one page, from the same evidence as
			this one but not the same words: shorter in places, more specific in others.
		</p>
	</div>
</section>

<section class="section">
	<div class="section-head">
		<h2>Education</h2>
		<span class="note">UCLA · 2023–2027</span>
	</div>
	<dl class="meta">
		<dt>Degree</dt>
		<dd>B.S. Financial Actuarial Mathematics. Expected June 2027.</dd>
		<dt>Actuarial</dt>
		<dd>
			MATH 177 (Theory of Interest and Applications) and 174E (Mathematics of Finance), completed.
			178A (Foundations of Actuarial Mathematics) and 179 (Advanced Topic in Financial Mathematics),
			enrolled for fall 2026. Sitting Exam FM in fall 2026.
		</dd>
		<dt>Quantitative</dt>
		<dd>
			Linear algebra, real analysis, probability (170E / 170S), MATH 61, multivariable calculus.
		</dd>
		<dt>Business</dt>
		<dd>Accounting (MGMT 1A / 1B), MGMT 105, MGMT 109, ECON 1, ECON 11.</dd>
	</dl>
</section>

<section class="section">
	<div class="section-head"><h2>Experience</h2></div>
	<ul class="rows">
		<li class="row">
			<span class="row-n" aria-hidden="true">01</span>
			<div>
				<div class="row-title">
					<h3>UCLA Library — Student Assistant II</h3>
					<span class="stack">Biomedical Library · Mar 2026 – present</span>
				</div>
				<p>
					Hired as a Student Assistant I and promoted. Desk and stacks work: circulation,
					interlibrary-loan pull lists, shelf reading, headcounts, opening and closing.
				</p>
				<p>
					Built three tools for the unit on my own initiative, none of them assigned: the daily
					staff schedule on a phone screen, a call-number-to-shelf lookup after the library retired
					LibMaps, and a rebuilt headcount page. The schedule used to arrive as a spreadsheet every
					morning. People at my desk open mine now instead of the file.
				</p>
			</div>
		</li>
		<li class="row">
			<span class="row-n" aria-hidden="true">02</span>
			<div>
				<div class="row-title">
					<h3>MKTaxSolutions — IT Intern</h3>
					<span class="stack">San Leandro, CA · Aug–Sep 2024</span>
				</div>
				<p>
					Consolidated over 400 client profiles across three separate services. Integrated CCH
					software with the office scanning systems and handled general IT support and client calls.
				</p>
			</div>
		</li>
		<li class="row">
			<span class="row-n" aria-hidden="true">03</span>
			<div>
				<div class="row-title">
					<h3>Vera A. Fritsch DMD — Operations Assistant</h3>
					<span class="stack">San Leandro, CA · Jun–Oct 2023</span>
				</div>
				<p>
					My family's dental practice. Front-office clinic operations, patient data entry and
					financial record accuracy, on Dentrix.
				</p>
			</div>
		</li>
	</ul>
</section>

<section class="section">
	<div class="section-head"><h2>Leadership</h2></div>
	<ul class="rows">
		<li class="row">
			<span class="row-n" aria-hidden="true">01</span>
			<div>
				<div class="row-title">
					<h3>UCLA Sailing Team — Treasurer, then Team Captain</h3>
					<span class="stack">Treasurer 2024–25 · Captain 2025–26</span>
				</div>
				<p>
					Ran the executive board and weekly meetings, coordinated travel and housing for biweekly
					regattas against a budget that did not stretch, and set rosters balancing competitiveness
					against who could spend a weekend in a van together.
				</p>
			</div>
		</li>
		<li class="row">
			<span class="row-n" aria-hidden="true">02</span>
			<div>
				<div class="row-title">
					<h3>Theta Chi, Beta Alpha Chapter — House Manager, then Network Manager</h3>
					<span class="stack">House Manager 2025–26 · Network Manager since 2026</span>
				</div>
				<p>
					Managed a $10,000 annual operating budget and daily property operations with alumni.
					Directed summer renovations — plumbing, structural repairs, a new game room — and used
					them in recruitment, contributing to the second-largest pledge class in chapter history.
				</p>
			</div>
		</li>
	</ul>
</section>

<section class="section">
	<div class="section-head"><h2>Case competition</h2></div>
	<div class="prose">
		<p>
			<strong>13th Annual Actuarial Case Competition (BAS), Winter 2025.</strong> Evaluated three commercial
			property insurance structures for a simulated Fortune 500 real estate client, analyzing how varying
			retentions, aggregate limits and co-insurance moved tail risk. Computed TCOR and Risk-Adjusted TCOR
			to reconcile the CFO's premium constraint with actual exposure, and ran 10,000-iteration Monte Carlo
			simulations of annual aggregate losses against Lognormal, Gamma and Pareto fits to historical data.
		</p>
	</div>
</section>

<section class="section">
	<div class="section-head"><h2>Skills</h2></div>
	<dl class="meta">
		<dt>Quantitative</dt>
		<dd>Monte Carlo simulation, loss distribution fitting, Excel modeling.</dd>
		<dt>Engineering</dt>
		<dd>
			Ruby on Rails, PostgreSQL, TypeScript, Swift. Docker, Kamal, Cloudflare Workers and Pages,
			GitHub Actions. I deploy and operate what I build — see the work section.
		</dd>
		<dt>Infrastructure</dt>
		<dd>Linux server administration, Proxmox, networking, self-hosted services.</dd>
		<dt>Languages</dt>
		<dd>English (native), German (B2/C1, accredited).</dd>
	</dl>
</section>

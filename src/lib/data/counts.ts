import { projects } from './projects';
import status from './status.json';

/**
 * Counts, derived once.
 *
 * Three meta descriptions carried these numbers as prose — "three of them are
 * serving traffic right now", "Six projects... Three are serving traffic" — and
 * all three were wrong by the time a reviewer counted: seven projects, six of
 * them up. Nothing was lying; the numbers were written when they were true and
 * then a project was added. A count typed into a sentence is a claim with no
 * owner, so these are computed from the same two files the page renders from.
 */
export const projectCount = projects.length;

/**
 * How many are running. Derived from the curated project list, NOT from the probe.
 *
 * It used to come from status.json, so one dropped curl at deploy time silently
 * subtracted one from a public claim: three meta descriptions went out saying five
 * while /answers/ and the résumé PDF said six, and the guard built to catch exactly
 * that kind of drift read the same wrong number. A count of what he has built is a
 * fact about the work; whether a host answered a request in the last minute is a
 * fact about the network. status.json still drives the per-project badge and
 * latency, where a transient failure is information rather than a claim.
 */
export const runningCount = projects.filter((p) => p.live).length;

/** Running AND openable by a stranger with the link. */
export const openCount = projects.filter((p) => p.live && p.reach === 'public').length;

/** What the probe last measured. Used for badges, never for a headline count. */
export const measuredUpCount = Object.values(
	status.results as Record<string, { status: string }>
).filter((r) => r.status === 'up').length;

/** 'six', for prose. Falls back to digits past what a sentence wants to spell. */
const WORDS = [
	'zero',
	'one',
	'two',
	'three',
	'four',
	'five',
	'six',
	'seven',
	'eight',
	'nine',
	'ten',
	'eleven',
	'twelve'
];
export const spell = (n: number) => WORDS[n] ?? String(n);

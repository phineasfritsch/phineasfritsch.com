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

export const servingCount = Object.values(
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

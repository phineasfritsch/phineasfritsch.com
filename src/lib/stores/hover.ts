import { writable } from 'svelte/store';
export const hoveredHotspot = writable<string | null>(null);

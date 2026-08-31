import { error } from '@sveltejs/kit';
import { projects } from '$lib/data/projects';

export const prerender = true;

// adapter-static needs the list up front; deriving it from the data means a new
// project can never be added without its page being built.
export function entries() {
	return projects.map((p) => ({ slug: p.slug }));
}

export function load({ params }) {
	const project = projects.find((p) => p.slug === params.slug);
	if (!project) error(404, 'No such project');
	return { project };
}

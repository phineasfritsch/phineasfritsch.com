import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const posts = import.meta.glob('/src/content/blog/*.md');
	const key = `/src/content/blog/${params.slug}.md`;

	if (!posts[key]) throw error(404, 'Post not found');

	const mod = (await posts[key]()) as {
		default: unknown;
		title?: string;
		date?: string;
		excerpt?: string;
	};

	return {
		content: mod.default,
		title: mod.title ?? params.slug,
		date: mod.date ?? '',
		excerpt: mod.excerpt ?? ''
	};
};

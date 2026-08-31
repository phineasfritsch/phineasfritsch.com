import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params }) => {
	const posts = import.meta.glob('/src/content/blog/*.md');
	const key = `/src/content/blog/${params.slug}.md`;

	if (!posts[key]) throw error(404, 'Post not found');

	// mdsvex exposes frontmatter as `metadata`. Reading it off the module root
	// returns undefined and quietly falls back to the slug — the post rendered its
	// own filename as its headline until this was fixed.
	const mod = (await posts[key]()) as {
		default: unknown;
		metadata?: Record<string, string>;
	};
	const meta = mod.metadata ?? {};

	return {
		content: mod.default,
		title: meta.title ?? params.slug,
		date: meta.date ?? '',
		excerpt: meta.excerpt ?? ''
	};
};

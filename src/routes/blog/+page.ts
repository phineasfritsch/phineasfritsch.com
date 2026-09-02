import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const modules = import.meta.glob('/src/content/blog/*.md', { eager: true });

	const posts = Object.entries(modules).map(([path, mod]) => {
		// mdsvex puts frontmatter on `metadata`, not on the module root. Reading
		// `mod.title` silently yields undefined and falls back to the slug, which is
		// why the index rendered "reading-your-own-output" as a post title.
		const m = mod as { metadata?: Record<string, string> };
		const meta = m.metadata ?? {};
		const slug = path.split('/').at(-1)!.replace('.md', '');
		return {
			slug,
			title: meta.title ?? slug,
			date: meta.date ?? '',
			excerpt: meta.excerpt ?? ''
		};
	});

	posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return { posts };
};

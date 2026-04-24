import type { PageLoad } from './$types';

export const load: PageLoad = async () => {
	const modules = import.meta.glob('/src/content/blog/*.md', { eager: true });

	const posts = Object.entries(modules).map(([path, mod]) => {
		const m = mod as Record<string, unknown>;
		const slug = path.split('/').at(-1)!.replace('.md', '');
		return {
			slug,
			title: (m.title as string) ?? slug,
			date: (m.date as string) ?? '',
			excerpt: (m.excerpt as string) ?? ''
		};
	});

	posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

	return { posts };
};

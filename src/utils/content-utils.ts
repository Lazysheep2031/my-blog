import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils.ts";

type PostEntry = CollectionEntry<"posts">;

// // Retrieve posts and sort them by publication date
async function getRawSortedPosts() {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const sorted = allBlogPosts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});
	return sorted;
}

function getPostSeriesKey(post: PostEntry): string {
	const primaryTag = post.data.tags?.[0]?.trim();
	if (primaryTag) return primaryTag;

	return post.slug.split("/").slice(0, -1).join("/");
}

function getReadingOrder(post: PostEntry): number {
	const filename = post.slug.split("/").pop()?.toLowerCase() ?? "";

	if (/^(intro|introduction)$/.test(filename)) return 0;

	const chapterMatch = filename.match(
		/^(?:chapter|course|lesson|lecture)[-_ ]*(\d+)/,
	);
	if (chapterMatch) return Number.parseInt(chapterMatch[1], 10);

	return Number.MAX_SAFE_INTEGER;
}

function sortSeriesPosts(posts: PostEntry[]) {
	return posts.sort((a, b) => {
		const orderA = getReadingOrder(a);
		const orderB = getReadingOrder(b);
		if (orderA !== orderB) return orderA - orderB;

		const dateA = new Date(a.data.published).getTime();
		const dateB = new Date(b.data.published).getTime();
		if (dateA !== dateB) return dateA - dateB;

		return a.slug.localeCompare(b.slug);
	});
}

function applySeriesNavigation(posts: PostEntry[]) {
	const seriesMap = new Map<string, PostEntry[]>();

	for (const post of posts) {
		post.data.prevSlug = "";
		post.data.prevTitle = "";
		post.data.nextSlug = "";
		post.data.nextTitle = "";

		const seriesKey = getPostSeriesKey(post);
		if (!seriesKey) continue;

		const seriesPosts = seriesMap.get(seriesKey) ?? [];
		seriesPosts.push(post);
		seriesMap.set(seriesKey, seriesPosts);
	}

	for (const seriesPosts of seriesMap.values()) {
		if (seriesPosts.length <= 1) continue;

		const sortedSeriesPosts = sortSeriesPosts(seriesPosts);
		for (let i = 0; i < sortedSeriesPosts.length; i++) {
			const post = sortedSeriesPosts[i];
			const prevPost = sortedSeriesPosts[i - 1];
			const nextPost = sortedSeriesPosts[i + 1];

			if (prevPost) {
				post.data.prevSlug = prevPost.slug;
				post.data.prevTitle = prevPost.data.title;
			}

			if (nextPost) {
				post.data.nextSlug = nextPost.slug;
				post.data.nextTitle = nextPost.data.title;
			}
		}
	}
}

export async function getSortedPosts() {
	const sorted = await getRawSortedPosts();
	applySeriesNavigation(sorted);

	return sorted;
}
export type PostForList = {
	slug: string;
	data: CollectionEntry<"posts">["data"];
};
export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();

	// delete post.body
	const sortedPostsList = sortedFullPosts.map((post) => ({
		slug: post.slug,
		data: post.data,
	}));

	return sortedPostsList;
}
export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const countMap: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { tags: string[] } }) => {
		post.data.tags.forEach((tag: string) => {
			if (!countMap[tag]) countMap[tag] = 0;
			countMap[tag]++;
		});
	});

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const count: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { category: string | null } }) => {
		if (!post.data.category) {
			const ucKey = i18n(I18nKey.uncategorized);
			count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
			return;
		}

		const categoryName =
			typeof post.data.category === "string"
				? post.data.category.trim()
				: String(post.data.category).trim();

		count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
	});

	const lst = Object.keys(count).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}

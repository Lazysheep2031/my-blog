<script lang="ts">
import { onMount } from "svelte";
import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import { getPostUrlBySlug } from "../utils/url-utils";

interface Post {
	slug: string;
	data: {
		title: string;
		tags: string[];
		category?: string | null;
		published: Date;
	};
}

interface TagItem {
	name: string;
	count: number;
}

interface Group {
	year: number;
	posts: Post[];
}

export let sortedPosts: Post[] = [];

let tagList: TagItem[] = [];
let selectedTag = "";
let groups: Group[] = [];

function formatDate(date: Date) {
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${month}-${day}`;
}

function formatTag(tagList: string[]) {
	return tagList.map((t) => `#${t}`).join(" ");
}

function buildGroups(filtered: Post[]) {
	const grouped = filtered.reduce(
		(acc, post) => {
			const year = post.data.published.getFullYear();
			if (!acc[year]) acc[year] = [];
			acc[year].push(post);
			return acc;
		},
		{} as Record<number, Post[]>,
	);

	const arr = Object.keys(grouped).map((y) => ({
		year: Number.parseInt(y, 10),
		posts: grouped[Number.parseInt(y, 10)],
	}));
	arr.sort((a, b) => b.year - a.year);
	return arr;
}

function selectTag(tag: string) {
	selectedTag = tag;
	const url = new URL(window.location.href);
	if (tag) {
		url.searchParams.set("tag", tag);
	} else {
		url.searchParams.delete("tag");
	}
	window.history.pushState({}, "", url.toString());

	const filtered = tag
		? sortedPosts.filter(
				(p) => Array.isArray(p.data.tags) && p.data.tags.includes(tag),
			)
		: sortedPosts;
	groups = buildGroups(filtered);
}

onMount(() => {
	// Build tag list from posts
	const countMap: Record<string, number> = {};
	for (const post of sortedPosts) {
		for (const tag of post.data.tags ?? []) {
			countMap[tag] = (countMap[tag] ?? 0) + 1;
		}
	}
	tagList = Object.keys(countMap)
		.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
		.map((name) => ({ name, count: countMap[name] }));

	// Read initial tag from URL
	const params = new URLSearchParams(window.location.search);
	const urlTag = params.get("tag") ?? "";
	selectTag(urlTag);
});
</script>

<div class="flex gap-4 w-full">
    <!-- Left: tag/course list -->
    <div class="hidden lg:flex flex-col gap-1 w-52 min-w-[13rem] card-base pb-4 self-start sticky top-4">
        <div class="font-bold transition text-lg text-75 relative ml-8 mt-4 mb-2
            before:w-1 before:h-4 before:rounded-md before:bg-[var(--primary)]
            before:absolute before:left-[-16px] before:top-[5.5px]">
            课程
        </div>
        <!-- All courses button -->
        <button
            class="w-full h-10 rounded-lg transition-all text-left px-4
                hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]
                text-black/75 dark:text-white/75 hover:text-[var(--primary)]"
            class:text-primary={selectedTag === ""}
            class:font-bold={selectedTag === ""}
            on:click={() => selectTag("")}
        >
            <div class="flex items-center justify-between">
                <span class="overflow-hidden whitespace-nowrap overflow-ellipsis text-sm">全部课程</span>
                <span class="btn-regular px-2 h-6 min-w-[1.75rem] rounded-md text-xs font-bold
                    flex items-center justify-center ml-2 shrink-0">
                    {sortedPosts.length}
                </span>
            </div>
        </button>
        <!-- Individual tag buttons -->
        {#each tagList as tag}
            <button
                class="w-full h-10 rounded-lg transition-all text-left px-4
                    hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]
                    text-black/75 dark:text-white/75 hover:text-[var(--primary)]"
                class:text-primary={selectedTag === tag.name}
                class:font-bold={selectedTag === tag.name}
                on:click={() => selectTag(tag.name)}
            >
                <div class="flex items-center justify-between">
                    <span class="overflow-hidden whitespace-nowrap overflow-ellipsis text-sm">{tag.name}</span>
                    <span class="btn-regular px-2 h-6 min-w-[1.75rem] rounded-md text-xs font-bold
                        flex items-center justify-center ml-2 shrink-0">
                        {tag.count}
                    </span>
                </div>
            </button>
        {/each}
    </div>

    <!-- Right: post list -->
    <div class="flex-1 card-base px-8 py-6 min-w-0">
        {#if groups.length === 0}
            <div class="text-50 text-center py-8">暂无文章</div>
        {:else}
            {#each groups as group}
                <div>
                    <div class="flex flex-row w-full items-center h-[3.75rem]">
                        <div class="w-[15%] md:w-[10%] transition text-2xl font-bold text-right text-75">
                            {group.year}
                        </div>
                        <div class="w-[15%] md:w-[10%]">
                            <div class="h-3 w-3 bg-none rounded-full outline outline-[var(--primary)] mx-auto
                                -outline-offset-[2px] z-50 outline-3"></div>
                        </div>
                        <div class="w-[70%] md:w-[80%] transition text-left text-50">
                            {group.posts.length}
                            {i18n(group.posts.length === 1 ? I18nKey.postCount : I18nKey.postsCount)}
                        </div>
                    </div>

                    {#each group.posts as post}
                        <a
                            href={getPostUrlBySlug(post.slug)}
                            aria-label={post.data.title}
                            class="group btn-plain !block h-10 w-full rounded-lg hover:text-[initial]"
                        >
                            <div class="flex flex-row justify-start items-center h-full">
                                <div class="w-[15%] md:w-[10%] transition text-sm text-right text-50">
                                    {formatDate(post.data.published)}
                                </div>
                                <div class="w-[15%] md:w-[10%] relative dash-line h-full flex items-center">
                                    <div class="transition-all mx-auto w-1 h-1 rounded group-hover:h-5
                                        bg-[oklch(0.5_0.05_var(--hue))] group-hover:bg-[var(--primary)]
                                        outline outline-4 z-50
                                        outline-[var(--card-bg)]
                                        group-hover:outline-[var(--btn-plain-bg-hover)]
                                        group-active:outline-[var(--btn-plain-bg-active)]">
                                    </div>
                                </div>
                                <div class="w-[70%] md:max-w-[65%] md:w-[65%] text-left font-bold
                                    group-hover:translate-x-1 transition-all group-hover:text-[var(--primary)]
                                    text-75 pr-8 whitespace-nowrap overflow-ellipsis overflow-hidden">
                                    {post.data.title}
                                </div>
                                <div class="hidden md:block md:w-[15%] text-left text-sm transition
                                    whitespace-nowrap overflow-ellipsis overflow-hidden text-30">
                                    {formatTag(post.data.tags)}
                                </div>
                            </div>
                        </a>
                    {/each}
                </div>
            {/each}
        {/if}
    </div>
</div>

<style>
    button.text-primary {
        color: var(--primary);
    }
    button.text-primary :global(span:first-child) {
        color: var(--primary);
    }
</style>

<script lang="ts">
import Icon from "@iconify/svelte";
import { onMount } from "svelte";
import {
	type CourseMeta,
	courseGroups,
	getCourseMeta,
} from "../constants/course-meta";
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

interface Course {
	tag: string;
	count: number;
	meta: CourseMeta;
	latest: Date;
}

interface CourseGroupView {
	key: string;
	name: string;
	icon: string;
	courses: Course[];
}

interface Group {
	year: number;
	posts: Post[];
}

export let sortedPosts: Post[] = [];

let selectedTag = "";
let groupViews: CourseGroupView[] = [];
let chapterGroups: Group[] = [];

// 取一篇文章所属课程（约定为第一个 tag）
function courseTagOf(post: Post): string {
	return post.data.tags?.[0] ?? "未分类";
}

function formatDate(date: Date) {
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${month}-${day}`;
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

// 按大类分组构建课程卡片墙数据
function buildWall(): CourseGroupView[] {
	const byCourse = new Map<string, Course>();
	for (const post of sortedPosts) {
		const tag = courseTagOf(post);
		const existing = byCourse.get(tag);
		if (existing) {
			existing.count += 1;
			if (post.data.published > existing.latest)
				existing.latest = post.data.published;
		} else {
			byCourse.set(tag, {
				tag,
				count: 1,
				meta: getCourseMeta(tag),
				latest: post.data.published,
			});
		}
	}

	const courses = Array.from(byCourse.values());
	return courseGroups
		.map((g) => ({
			key: g.key,
			name: g.name,
			icon: g.icon,
			courses: courses
				.filter((c) => c.meta.group === g.key)
				.sort((a, b) => b.count - a.count),
		}))
		.filter((g) => g.courses.length > 0);
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

	if (tag) {
		const filtered = sortedPosts.filter((p) => courseTagOf(p) === tag);
		chapterGroups = buildGroups(filtered);
	} else {
		chapterGroups = [];
	}
	if (typeof window !== "undefined")
		window.scrollTo({ top: 0, behavior: "smooth" });
}

$: currentCourse = selectedTag ? getCourseMeta(selectedTag) : null;
$: chapterCount = chapterGroups.reduce((n, g) => n + g.posts.length, 0);

onMount(() => {
	groupViews = buildWall();
	const params = new URLSearchParams(window.location.search);
	selectTag(params.get("tag") ?? "");

	// 支持浏览器前进/后退
	window.addEventListener("popstate", () => {
		const p = new URLSearchParams(window.location.search);
		const t = p.get("tag") ?? "";
		selectedTag = t;
		chapterGroups = t
			? buildGroups(sortedPosts.filter((post) => courseTagOf(post) === t))
			: [];
	});
});
</script>

<div class="w-full">
    {#if selectedTag === ""}
        <!-- ===== 课程卡片墙 ===== -->
        <!-- pt-14 让首个大类标题落到 banner 下方，避免文字压在背景图上 -->
        <div class="flex flex-col gap-6 pt-14 lg:pt-16">
            {#each groupViews as group}
                <section>
                    <h2 class="flex items-center gap-2 font-bold text-lg text-90 mb-3 ml-1">
                        <Icon icon={group.icon} class="text-[1.35rem] text-[var(--primary)]" />
                        {group.name}
                        <span class="text-sm font-normal text-40">· {group.courses.length} 门</span>
                    </h2>
                    <div class="course-grid">
                        {#each group.courses as course}
                            <button
                                class="course-card card-base"
                                style={`--accent: ${course.meta.accent};`}
                                on:click={() => selectTag(course.tag)}
                            >
                                <div class="course-icon">
                                    <Icon icon={course.meta.icon} />
                                </div>
                                <div class="min-w-0 flex-1 text-left">
                                    <div class="flex items-baseline justify-between gap-2">
                                        <span class="course-name">{course.meta.name ?? course.tag}</span>
                                        <span class="course-count">{course.count} 章</span>
                                    </div>
                                    <div class="course-en">{course.meta.en}</div>
                                    <p class="course-blurb">{course.meta.blurb}</p>
                                </div>
                                <Icon icon="material-symbols:arrow-forward-rounded" class="course-arrow" />
                            </button>
                        {/each}
                    </div>
                </section>
            {/each}
        </div>
    {:else}
        <!-- ===== 单课程章节列表 ===== -->
        <div class="card-base px-6 md:px-8 py-6">
            <button class="back-btn" on:click={() => selectTag("")}>
                <Icon icon="material-symbols:arrow-back-rounded" />
                全部课程
            </button>

            <div class="flex items-center gap-3 mt-4 mb-2" style={`--accent: ${currentCourse?.accent};`}>
                <div class="course-icon !w-11 !h-11">
                    <Icon icon={currentCourse?.icon ?? "material-symbols:bookmarks-outline-rounded"} />
                </div>
                <div>
                    <div class="text-2xl font-bold text-90 leading-tight">{currentCourse?.name ?? selectedTag}</div>
                    <div class="text-sm text-50">{currentCourse?.en} · 共 {chapterCount} 章</div>
                </div>
            </div>
            <p class="text-sm text-50 mb-4 ml-1">{currentCourse?.blurb}</p>

            {#if chapterGroups.length === 0}
                <div class="text-50 text-center py-8">暂无文章</div>
            {:else}
                {#each chapterGroups as group}
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
                                    <div class="w-[70%] md:w-[80%] text-left font-bold
                                        group-hover:translate-x-1 transition-all group-hover:text-[var(--primary)]
                                        text-75 pr-8 whitespace-nowrap overflow-ellipsis overflow-hidden">
                                        {post.data.title}
                                    </div>
                                </div>
                            </a>
                        {/each}
                    </div>
                {/each}
            {/if}
        </div>
    {/if}
</div>

<style>
    .course-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
        gap: 0.85rem;
    }

    .course-card {
        display: flex;
        align-items: flex-start;
        gap: 0.85rem;
        padding: 1rem 1.05rem;
        text-align: left;
        border: 1px solid transparent;
        position: relative;
        overflow: hidden;
        transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
    }

    .course-card::before {
        content: "";
        position: absolute;
        inset: 0 auto 0 0;
        width: 4px;
        background: var(--accent);
        opacity: 0.85;
    }

    .course-card:hover {
        transform: translateY(-3px);
        border-color: color-mix(in srgb, var(--accent) 45%, transparent);
        box-shadow: 0 0.9rem 2rem color-mix(in srgb, var(--accent) 20%, transparent);
    }

    .course-icon {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 2.6rem;
        height: 2.6rem;
        border-radius: 0.7rem;
        font-size: 1.4rem;
        color: var(--accent);
        background: color-mix(in srgb, var(--accent) 14%, transparent);
    }

    .course-name {
        font-size: 1.02rem;
        font-weight: 700;
        color: var(--deep-text, rgba(0, 0, 0, 0.8));
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    :global(.dark) .course-name {
        color: rgba(255, 255, 255, 0.85);
    }

    .course-count {
        flex-shrink: 0;
        font-size: 0.72rem;
        font-weight: 700;
        color: var(--accent);
        background: color-mix(in srgb, var(--accent) 12%, transparent);
        padding: 0.1rem 0.5rem;
        border-radius: 999px;
    }

    .course-en {
        font-family: "JetBrains Mono Variable", ui-monospace, monospace;
        font-size: 0.7rem;
        letter-spacing: 0.02em;
        color: color-mix(in srgb, var(--accent) 62%, gray);
        margin-top: 0.15rem;
    }

    .course-blurb {
        margin: 0.4rem 0 0;
        font-size: 0.82rem;
        line-height: 1.5;
        color: var(--tw-prose-body, rgba(0, 0, 0, 0.55));
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    :global(.dark) .course-blurb {
        color: rgba(255, 255, 255, 0.5);
    }

    .course-arrow {
        flex-shrink: 0;
        align-self: center;
        font-size: 1.15rem;
        color: color-mix(in srgb, var(--accent) 55%, gray);
        opacity: 0;
        transform: translateX(-4px);
        transition:
            opacity 0.2s ease,
            transform 0.2s ease;
    }
    .course-card:hover .course-arrow {
        opacity: 1;
        transform: translateX(0);
    }

    .back-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.85rem;
        font-weight: 600;
        color: rgba(0, 0, 0, 0.5);
        transition: color 0.2s ease;
    }
    .back-btn:hover {
        color: var(--primary);
    }
    :global(.dark) .back-btn {
        color: rgba(255, 255, 255, 0.55);
    }
</style>

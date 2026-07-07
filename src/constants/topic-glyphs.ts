// 主题知识小图（线稿 SVG）。颜色继承使用处的 --accent / --accent-2 / --ink。
// 首页 hero 预览卡与列表页无封面文章共用这一套图形。

export type GlyphTheme =
	| "query"
	| "optimize"
	| "transaction"
	| "lock"
	| "diffusion"
	| "language"
	| "cache"
	| "vector"
	| "index"
	| "exception"
	| "note";

export const topicGlyphs: Record<GlyphTheme, string> = {
	// Query Processing — join 计划树
	query: `<svg viewBox="0 0 300 118" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
		<path d="M150 34 L96 70 M150 34 L204 70 M96 82 L60 104 M96 82 L132 104" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/>
		<g fill="color-mix(in srgb, var(--accent-2) 55%, white)" stroke="var(--accent)" stroke-width="2">
			<circle cx="150" cy="26" r="14"/><circle cx="96" cy="76" r="12"/>
		</g>
		<text x="150" y="31" font-size="15" font-family="monospace" text-anchor="middle" fill="var(--ink)">⋈</text>
		<text x="96" y="81" font-size="13" font-family="monospace" text-anchor="middle" fill="var(--ink)">⋈</text>
		<g fill="color-mix(in srgb, var(--accent) 16%, white)" stroke="var(--accent)" stroke-width="1.8">
			<rect x="192" y="64" width="30" height="22" rx="4"/>
			<rect x="46" y="98" width="30" height="18" rx="4"/>
			<rect x="118" y="98" width="30" height="18" rx="4"/>
		</g>
	</svg>`,
	// Query Optimization — 计划择优（两条候选，选低成本）
	optimize: `<svg viewBox="0 0 300 118" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
		<path d="M70 30 V96 M40 96 H100 M40 78 H100 M40 60 H100" stroke="color-mix(in srgb, var(--accent) 45%, white)" stroke-width="2" stroke-linecap="round"/>
		<polyline points="40,92 60,70 80,74 100,44" stroke="var(--accent)" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
		<circle cx="100" cy="44" r="5" fill="var(--accent)"/>
		<g stroke="var(--accent)" stroke-width="2">
			<rect x="176" y="20" width="94" height="20" rx="5" fill="color-mix(in srgb, var(--accent-2) 45%, white)"/>
			<rect x="176" y="52" width="72" height="18" rx="5" fill="color-mix(in srgb, var(--accent) 12%, white)"/>
			<rect x="176" y="80" width="58" height="18" rx="5" fill="color-mix(in srgb, var(--accent) 12%, white)"/>
		</g>
		<text x="223" y="34" font-size="11" font-family="monospace" text-anchor="middle" fill="var(--ink)">best</text>
	</svg>`,
	// Transactions — ACID 状态机
	transaction: `<svg viewBox="0 0 300 118" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
		<path d="M74 46 H128 M198 46 H236 M162 60 V88 H236 V60" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/>
		<path d="M232 44 l6 3 -6 3 M232 86 l6 3 -6 3" fill="var(--accent)"/>
		<g stroke="var(--accent)" stroke-width="2">
			<circle cx="52" cy="46" r="20" fill="color-mix(in srgb, var(--accent) 14%, white)"/>
			<circle cx="150" cy="46" r="20" fill="color-mix(in srgb, var(--accent) 14%, white)"/>
			<circle cx="256" cy="46" r="20" fill="color-mix(in srgb, var(--accent-2) 50%, white)"/>
			<circle cx="256" cy="92" r="18" fill="color-mix(in srgb, var(--accent) 10%, white)"/>
		</g>
		<g font-family="monospace" text-anchor="middle" fill="var(--ink)">
			<text x="52" y="50" font-size="14">A</text><text x="150" y="50" font-size="14">C</text>
			<text x="256" y="50" font-size="13">I</text><text x="256" y="96" font-size="14">D</text>
		</g>
	</svg>`,
	// Concurrency Control — 2PL 加锁 / wait-for
	lock: `<svg viewBox="0 0 300 118" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
		<g stroke="var(--accent)" stroke-width="2" fill="color-mix(in srgb, var(--accent) 12%, white)">
			<circle cx="60" cy="40" r="22"/><circle cx="220" cy="78" r="22"/>
		</g>
		<path d="M82 46 C140 60 160 66 198 74 M198 68 C150 58 120 52 82 44" stroke="var(--accent)" stroke-width="2" fill="none" stroke-linecap="round"/>
		<path d="M196 76 l-10 -6 3 9 M84 42 l10 5 -3 -9" fill="var(--accent)"/>
		<g stroke="var(--accent)" stroke-width="2" fill="color-mix(in srgb, var(--accent-2) 55%, white)">
			<rect x="150" y="18" width="16" height="13" rx="2"/>
			<path d="M153 18 v-4 a5 5 0 0 1 10 0 v4" fill="none"/>
			<rect x="118" y="90" width="16" height="13" rx="2"/>
			<path d="M121 90 v-4 a5 5 0 0 1 10 0 v4" fill="none"/>
		</g>
		<g font-family="monospace" text-anchor="middle" font-size="14" fill="var(--ink)">
			<text x="60" y="45">T1</text><text x="220" y="83">T2</text>
		</g>
	</svg>`,
	// Diffusion — 去噪：噪声 → 清晰
	diffusion: `<svg viewBox="0 0 300 118" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
		<defs>
			<g id="noise-hi">${Array.from({ length: 26 })
				.map(
					() =>
						`<circle cx="${8 + Math.random() * 40}" cy="${8 + Math.random() * 40}" r="1.6" fill="var(--accent)"/>`,
				)
				.join("")}</g>
			<g id="noise-lo">${Array.from({ length: 8 })
				.map(
					() =>
						`<circle cx="${8 + Math.random() * 40}" cy="${8 + Math.random() * 40}" r="1.5" fill="var(--accent)"/>`,
				)
				.join("")}</g>
		</defs>
		<g stroke="var(--accent)" stroke-width="1.8">
			<rect x="8" y="34" width="56" height="56" rx="6" fill="color-mix(in srgb, var(--accent) 10%, white)"/>
			<rect x="88" y="34" width="56" height="56" rx="6" fill="color-mix(in srgb, var(--accent) 10%, white)"/>
			<rect x="168" y="34" width="56" height="56" rx="6" fill="color-mix(in srgb, var(--accent) 8%, white)"/>
			<rect x="238" y="34" width="56" height="56" rx="6" fill="color-mix(in srgb, var(--accent-2) 40%, white)"/>
		</g>
		<use href="#noise-hi" x="0" y="26"/><use href="#noise-lo" x="80" y="26"/>
		<circle cx="266" cy="62" r="13" fill="none" stroke="var(--ink)" stroke-width="2"/>
		<g fill="var(--accent)"><path d="M74 62 l7 -4 v8z"/><path d="M154 62 l7 -4 v8z"/><path d="M234 62 l7 -4 v8z" transform="translate(-6,0)"/></g>
	</svg>`,
	// LLM — token 序列 + 注意力弧
	language: `<svg viewBox="0 0 300 118" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
		<g stroke="var(--accent)" stroke-width="1.6" fill="none" opacity="0.9">
			<path d="M40 74 C70 26 110 26 140 74"/><path d="M90 74 C130 20 190 20 230 74"/><path d="M140 74 C180 32 220 32 260 74"/>
		</g>
		<g stroke="var(--accent)" stroke-width="2">
			<rect x="24" y="74" width="32" height="24" rx="5" fill="color-mix(in srgb, var(--accent) 12%, white)"/>
			<rect x="74" y="74" width="32" height="24" rx="5" fill="color-mix(in srgb, var(--accent) 12%, white)"/>
			<rect x="124" y="74" width="32" height="24" rx="5" fill="color-mix(in srgb, var(--accent-2) 45%, white)"/>
			<rect x="214" y="74" width="32" height="24" rx="5" fill="color-mix(in srgb, var(--accent) 12%, white)"/>
			<rect x="164" y="74" width="32" height="24" rx="5" fill="color-mix(in srgb, var(--accent) 12%, white)"/>
		</g>
		<g fill="var(--accent)"><circle cx="40" cy="74" r="2.5"/><circle cx="140" cy="74" r="2.5"/><circle cx="230" cy="74" r="2.5"/></g>
	</svg>`,
	// Cache Side-Channel — 缓存行 + 时延尖峰
	cache: `<svg viewBox="0 0 300 118" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
		<g stroke="var(--accent)" stroke-width="1.8">
			<rect x="20" y="20" width="110" height="76" rx="6" fill="none"/>
			<line x1="20" y1="45" x2="130" y2="45" /><line x1="20" y1="70" x2="130" y2="70" />
			<rect x="22" y="47" width="106" height="21" fill="color-mix(in srgb, var(--accent-2) 42%, white)" stroke="none"/>
		</g>
		<g font-family="monospace" font-size="10" fill="var(--ink)"><text x="30" y="38">line 0</text><text x="30" y="63">hit</text><text x="30" y="88">line 2</text></g>
		<polyline points="170,88 190,88 200,50 214,50 224,30 238,30 248,84 288,84" stroke="var(--accent)" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
		<line x1="170" y1="96" x2="290" y2="96" stroke="color-mix(in srgb, var(--accent) 40%, white)" stroke-width="1.5"/>
		<circle cx="231" cy="30" r="3.5" fill="var(--accent)"/>
	</svg>`,
	// Vector DB — ANN 近邻检索
	vector: `<svg viewBox="0 0 300 118" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
		<circle cx="150" cy="60" r="44" fill="color-mix(in srgb, var(--accent) 8%, white)" stroke="var(--accent)" stroke-width="1.8" stroke-dasharray="4 4"/>
		<g fill="color-mix(in srgb, var(--accent) 55%, white)" stroke="var(--accent)" stroke-width="1.4">
			<circle cx="128" cy="44" r="4.5"/><circle cx="170" cy="50" r="4.5"/><circle cx="140" cy="82" r="4.5"/>
			<circle cx="176" cy="78" r="4.5"/><circle cx="120" cy="70" r="4.5"/>
		</g>
		<g fill="color-mix(in srgb, var(--accent) 25%, white)" stroke="var(--accent)" stroke-width="1.2" opacity="0.7">
			<circle cx="40" cy="26" r="4"/><circle cx="66" cy="96" r="4"/><circle cx="255" cy="34" r="4"/><circle cx="268" cy="92" r="4"/><circle cx="245" cy="70" r="4"/>
		</g>
		<line x1="150" y1="60" x2="128" y2="44" stroke="var(--ink)" stroke-width="1.6"/>
		<line x1="150" y1="60" x2="170" y2="50" stroke="var(--ink)" stroke-width="1.6"/>
		<line x1="150" y1="60" x2="140" y2="82" stroke="var(--ink)" stroke-width="1.6"/>
		<circle cx="150" cy="60" r="6" fill="var(--accent-2)" stroke="var(--ink)" stroke-width="2"/>
	</svg>`,
	// Indexing — B+ 树
	index: `<svg viewBox="0 0 300 118" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
		<path d="M150 42 L84 74 M150 42 L216 74" stroke="var(--accent)" stroke-width="2" stroke-linecap="round"/>
		<g stroke="var(--accent)" stroke-width="2">
			<rect x="118" y="20" width="64" height="22" rx="4" fill="color-mix(in srgb, var(--accent-2) 45%, white)"/>
			<line x1="150" y1="20" x2="150" y2="42"/>
			<rect x="52" y="74" width="64" height="22" rx="4" fill="color-mix(in srgb, var(--accent) 12%, white)"/>
			<line x1="84" y1="74" x2="84" y2="96"/>
			<rect x="184" y="74" width="64" height="22" rx="4" fill="color-mix(in srgb, var(--accent) 12%, white)"/>
			<line x1="216" y1="74" x2="216" y2="96"/>
		</g>
		<path d="M116 85 H184" stroke="var(--accent)" stroke-width="1.6" stroke-dasharray="3 3"/>
		<path d="M180 82 l6 3 -6 3" fill="var(--accent)"/>
	</svg>`,
	// C++ Exceptions — 栈展开 throw→catch
	exception: `<svg viewBox="0 0 300 118" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
		<g stroke="var(--accent)" stroke-width="2">
			<rect x="30" y="22" width="120" height="20" rx="4" fill="color-mix(in srgb, var(--accent) 12%, white)"/>
			<rect x="30" y="50" width="120" height="20" rx="4" fill="color-mix(in srgb, var(--accent) 12%, white)"/>
			<rect x="30" y="78" width="120" height="20" rx="4" fill="color-mix(in srgb, var(--accent-2) 45%, white)"/>
			<rect x="196" y="50" width="80" height="20" rx="4" fill="none" stroke-dasharray="4 4"/>
		</g>
		<path d="M90 78 C90 60 160 62 194 60" stroke="var(--accent)" stroke-width="2" fill="none" stroke-linecap="round"/>
		<path d="M193 57 l7 3 -6 4" fill="var(--accent)"/>
		<g font-family="monospace" font-size="11" fill="var(--ink)">
			<text x="40" y="36">catch</text><text x="40" y="92">throw</text><text x="206" y="64">handler</text>
		</g>
	</svg>`,
	// 通用回退 — 文档
	note: `<svg viewBox="0 0 300 118" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
		<rect x="96" y="16" width="108" height="90" rx="8" fill="color-mix(in srgb, var(--accent) 8%, white)" stroke="var(--accent)" stroke-width="2"/>
		<g stroke="var(--accent)" stroke-width="3" stroke-linecap="round">
			<line x1="114" y1="40" x2="186" y2="40"/><line x1="114" y1="58" x2="186" y2="58"/>
			<line x1="114" y1="76" x2="160" y2="76" stroke="var(--accent-2)"/>
		</g>
	</svg>`,
};

export const getTopicGlyph = (theme: GlyphTheme): string =>
	topicGlyphs[theme] ?? topicGlyphs.note;

// 按课程（文章第一个 tag）为「无封面文章」挑一张代表性封面图与配色。
export interface GlyphCover {
	svg: string;
	accent: string;
	accent2: string;
	ink: string;
}

const courseGlyphMap: Record<
	string,
	{ theme: GlyphTheme; accent: string; accent2: string; ink: string }
> = {
	数据库系统: {
		theme: "index",
		accent: "#2c8f74",
		accent2: "#7bd6bc",
		ink: "#123f34",
	},
	面向对象程序设计: {
		theme: "exception",
		accent: "#7d67c7",
		accent2: "#b3a6e6",
		ink: "#37246f",
	},
	计算机体系结构: {
		theme: "cache",
		accent: "#ad6b4a",
		accent2: "#e0b48f",
		ink: "#6a321e",
	},
	人工智能基础: {
		theme: "language",
		accent: "#6b7fd2",
		accent2: "#a8b6ec",
		ink: "#273273",
	},
	医学人工智能: {
		theme: "vector",
		accent: "#cf6d7e",
		accent2: "#ecb0ba",
		ink: "#743044",
	},
	CS106L: {
		theme: "note",
		accent: "#3e9caf",
		accent2: "#9ad3dd",
		ink: "#17606d",
	},
	常微分方程: {
		theme: "optimize",
		accent: "#496fc7",
		accent2: "#9db4e6",
		ink: "#172c73",
	},
	微观经济学: {
		theme: "optimize",
		accent: "#4c9a68",
		accent2: "#a3d4b4",
		ink: "#1d5837",
	},
	德语: {
		theme: "note",
		accent: "#c79a3e",
		accent2: "#e6cf95",
		ink: "#6b5010",
	},
};

const fallbackCourseGlyph = {
	theme: "note" as GlyphTheme,
	accent: "#4f9f7a",
	accent2: "#a7d8c4",
	ink: "#1f5d45",
};

export function resolveCourseGlyph(tags: string[] | undefined): GlyphCover {
	const tag = tags?.[0] ?? "";
	const c = courseGlyphMap[tag] ?? fallbackCourseGlyph;
	return {
		svg: topicGlyphs[c.theme],
		accent: c.accent,
		accent2: c.accent2,
		ink: c.ink,
	};
}

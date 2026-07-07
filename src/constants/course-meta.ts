// 课程元数据：为「课程笔记」卡片墙提供大类分组、图标、配色与简介。
// key 为文章 frontmatter 中该课程使用的第一个 tag。

export type CourseGroupKey = "cs" | "math" | "econ" | "lang" | "other";

export interface CourseGroup {
	key: CourseGroupKey;
	name: string;
	icon: string;
}

// 大类展示顺序
export const courseGroups: CourseGroup[] = [
	{
		key: "cs",
		name: "计算机",
		icon: "material-symbols:devices-outline-rounded",
	},
	{ key: "math", name: "数学", icon: "material-symbols:function-rounded" },
	{ key: "econ", name: "经济", icon: "material-symbols:trending-up-rounded" },
	{ key: "lang", name: "语言", icon: "material-symbols:translate-rounded" },
	{
		key: "other",
		name: "其他",
		icon: "material-symbols:bookmarks-outline-rounded",
	},
];

export interface CourseMeta {
	/** 展示用课程名，默认取 tag */
	name?: string;
	/** 英文副标题 */
	en: string;
	group: CourseGroupKey;
	icon: string;
	accent: string;
	blurb: string;
}

export const courseMetaMap: Record<string, CourseMeta> = {
	数据库系统: {
		en: "Database Systems",
		group: "cs",
		icon: "material-symbols:database-outline",
		accent: "#2c8f74",
		blurb: "存储、索引、查询处理与优化、事务与并发控制",
	},
	面向对象程序设计: {
		en: "OOP in C++",
		group: "cs",
		icon: "material-symbols:deployed-code",
		accent: "#7d67c7",
		blurb: "C++ 对象模型、模板、STL、智能指针与异常",
	},
	计算机体系结构: {
		en: "Computer Architecture",
		group: "cs",
		icon: "material-symbols:memory-rounded",
		accent: "#ad6b4a",
		blurb: "流水线、缓存、ILP/DLP/TLP 与侧信道安全",
	},
	人工智能基础: {
		en: "Intro to AI",
		group: "cs",
		icon: "material-symbols:neurology",
		accent: "#6b7fd2",
		blurb: "搜索、机器学习、大语言模型与扩散生成模型",
	},
	医学人工智能: {
		en: "Medical AI",
		group: "cs",
		icon: "material-symbols:clinical-notes-outline-rounded",
		accent: "#cf6d7e",
		blurb: "AI 在医学影像与诊断中的应用",
	},
	CS106L: {
		en: "Standard C++",
		group: "cs",
		icon: "material-symbols:terminal-rounded",
		accent: "#3e9caf",
		blurb: "现代 C++ 标准库与语言特性实践",
	},
	常微分方程: {
		en: "ODE",
		group: "math",
		icon: "material-symbols:calculate-outline-rounded",
		accent: "#496fc7",
		blurb: "一阶方程、线性系统、级数解与稳定性",
	},
	微观经济学: {
		en: "Microeconomics",
		group: "econ",
		icon: "material-symbols:monitoring-rounded",
		accent: "#4c9a68",
		blurb: "供需、消费者与厂商理论、市场结构",
	},
	德语: {
		en: "German",
		group: "lang",
		icon: "material-symbols:menu-book-outline-rounded",
		accent: "#c79a3e",
		blurb: "德语入门语法与词汇笔记",
	},
};

const fallbackMeta: Omit<CourseMeta, "en"> & { en: string } = {
	en: "Course Notes",
	group: "other",
	icon: "material-symbols:bookmarks-outline-rounded",
	accent: "#4f9f7a",
	blurb: "课程笔记",
};

export function getCourseMeta(tag: string): CourseMeta {
	return courseMetaMap[tag] ?? { ...fallbackMeta };
}

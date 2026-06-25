import type { HomepageConfig } from "../types/config";

export const homepageConfig: HomepageConfig = {
	// 首页标题
	heroTitle: "Hongying",
	// 首页副标题
	heroSubtitle: "红荧の宝藏之地",

	// 音乐播放器 - 网易云音乐歌单ID列表
	cloudMusicIds: ["7550001499", "1972374233", "2081005468"],

	// 照片墙
	photoWall: {
		enabled: true,
		title: "照片墙",
		description: "记录美好瞬间",
	},

	// 说说栏目
	chatterSection: {
		title: "说说",
		description: "碎碎念与日常",
	},

	// 杂谈栏目
	essaySection: {
		title: "杂谈",
		description: "深度思考与讨论",
	},
};

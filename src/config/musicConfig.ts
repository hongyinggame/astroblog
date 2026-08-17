import type { MusicPlayerConfig } from "../types/config";

// 音乐播放器配置
export const musicPlayerConfig: MusicPlayerConfig = {
	// 禁用音乐播放器方法：
	// 模板默认侧边栏和导航栏两个都显示
	// 1. 侧边栏：在sidebarConfig.ts侧边栏配置把音乐组件enable设为false禁用即可
	// 2. 导航栏：在本配置文件把showInNavbar设为false禁用即可

	// 是否在导航栏显示音乐播放器入口
	showInNavbar: true,

	// 使用方式："meting" 仅使用 Meting API，"local" 仅使用本地音乐列表，"mix" 合并API与本地
	mode: "local",

	// 默认音量 (0-1)
	volume: 0.7,

	// 播放模式：'list'=列表循环, 'one'=单曲循环, 'random'=随机播放
	playMode: "list",

	// 是否显启用歌词
	showLyrics: true,

	// Meting API 配置
	meting: {
		// Meting API 地址
		// 默认使用官方 API，也可以使用自定义 API
		api: "https://api.i-meto.com/meting/api?server=:server&type=:type&id=:id&r=:r",
		// 音乐平台：netease=网易云音乐, tencent=QQ音乐, kugou=酷狗音乐, xiami=虾米音乐, baidu=百度音乐
		server: "netease",
		// 类型：song=单曲, playlist=歌单, album=专辑, search=搜索, artist=艺术家
		type: "playlist",
		// 歌单/专辑/单曲 ID 或搜索关键词
		id: "10046455237",
		// 认证 token（可选）
		auth: "",
		// 备用 API 配置（当主 API 失败时使用）
		fallbackApis: [
			"https://api.injahow.cn/meting/?server=:server&type=:type&id=:id",
			"https://api.moeyao.cn/meting/?server=:server&type=:type&id=:id",
		],
	},

	// 本地音乐配置（当 mode 为 'local' 时使用）
	// 1. 支持传入歌词文件的路径
	// lrc: "/assets/music/lrc/使一颗心免于哀伤-哼唱.lrc",
	// 2. 或者直接填入歌词字符串内容
	// lrc: "[00:00.00]歌词内容...",
	local: {
		playlist: [
			{
				name: "使一颗心免于哀伤",
				artist: "知更鸟 / HOYO-MiX / Chevy",
				url: "/assets/music/使一颗心免于哀伤-哼唱.mp3",
				cover: "/assets/music/cover/109951169585655912.webp",
				lrc: "",
			},
			{
				name: "萤火飞光",
				artist: "圈9",
				url: "/assets/music/萤火飞光.mp3",
				cover: "https://s3.liumingye.cn/files/2026/06/1781732827484.webp",
				lrc: "/assets/music/lrc/萤火飞光-圈9.lrc",
			},
			{
				name: "月亮船",
				artist: "王英姿",
				url: "/assets/music/月亮船-王英姿.mp3",
				cover: "https://img4.kuwo.cn/star/albumcover/500/73/10/818485132.jpg",
				lrc: "/assets/music/lrc/月亮船-王英姿.lrc",
			},
			{
				name: "My Soul，Your Beats！",
				artist: "Lia",
				url: "/assets/music/My Soul.Your Beats.-Lia.mp3",
				cover: "https://img2.kuwo.cn/star/albumcover/500/30/77/1811049271.jpg",
				lrc: "/assets/music/lrc/My Soul，Your Beats！-Lia.lrc",
			},
			{
				name: "DAN+DAN+心魅かれてく",
				artist: "ZARD",
				url: "/assets/music/DAN+DAN+心魅かれてく-ZARD.mp3",
				cover: "https://img4.kuwo.cn/star/starheads/500/18/97/3283454319.jpg",
				lrc: "/assets/music/lrc/DAN DAN 心魅かれてく-ZARD.lrc",
			},
			{
				name: "負けないで",
				artist: "ZARD",
				url: "/assets/music/負けないで-ZARD.mp3",
				cover: "https://img4.kuwo.cn/star/albumcover/500/4/53/2330660729.jpg",
				lrc: "/assets/music/lrc/負けないで-ZARD.lrc",
			},
			{
				name: "转动命运之轮",
				artist: "ZARD",
				url: "/assets/music/转动命运之轮-ZARD.mp3",
				cover: "https://img3.kuwo.cn/star/albumcover/500/43/23/3572370663.jpg",
				lrc: "/assets/music/lrc/转动命运之轮-ZARD.lrc",
			},
			{
				name: "Just+Now",
				artist: "T-ara",
				url: "/assets/music/Just+Now-T-ara.mp3",
				cover: "https://img4.kuwo.cn/star/albumcover/500/98/49/1174016570.jpg",
				lrc: "/assets/music/lrc/Just+Now-T-ara.lrc",
			},
			{
				name: "坠ちない空",
				artist: "ENA",
				url: "/assets/music/坠ちない空-ENA.mp3",
				cover: "https://img3.kuwo.cn/star/albumcover/500/72/66/2046074520.jpg",
				lrc: "/assets/music/lrc/不坠的天空.lrc",
			},
			{
				name: "落凡尘",
				artist: "黄霄雲",
				url: "/assets/music/落凡尘-黄霄雲.mp3",
				cover: "https://img1.kuwo.cn/star/albumcover/500/s3s47/49/429888771.jpg",
				lrc: "/assets/music/lrc/落凡尘-黄霄雲.lrc",
			},
			{
				name: "song for you",
				artist: "神田沙也加",
				url: "/assets/music/song for you-神田沙也加.mp3",
				cover: "https://img3.kuwo.cn/star/albumcover/500/31/18/130520685.jpg",
				lrc: "/assets/music/lrc/song for you-神田沙也加.lrc",
			},
			{
				name: "巅峰之上",
				artist: "毛不易",
				url: "/assets/music/巅峰之上-毛不易.mp3",
				cover: "https://img3.kuwo.cn/star/albumcover/500/29/59/648767565.jpg",
				lrc: "/assets/music/lrc/巅峰之上-毛不易.lrc",
			},
			{
				name: "小さな手のひら",
				artist: "茶太",
				url: "/assets/music/小さな手のひら-Key Sounds Label.mp3",
				cover: "https://img1.kuwo.cn/star/albumcover/500/s3s88/20/4004815270.jpg",
				lrc: "/assets/music/lrc/小さな手のひら-Key Sounds Label.lrc",
			},
		],
	},
};

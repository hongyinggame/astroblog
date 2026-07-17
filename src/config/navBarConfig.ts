import {
	LinkPreset,
	type NavBarConfig,
	type NavBarLink,
	type NavBarSearchConfig,
	NavBarSearchMethod,
} from "../types/config";
import { siteConfig } from "./siteConfig";

const getDynamicNavBarConfig = (): NavBarConfig => {
	const links: (NavBarLink | LinkPreset)[] = [
		LinkPreset.Home,
	];

	// 文章
	links.push({
		name: "文章",
		url: "/articles/",
		icon: "material-symbols:article-rounded",
		children: [
			{
				name: '首页',
				url: '/articles/home/',
				icon: 'material-symbols:home-outline-rounded',
			},
			LinkPreset.Archive,
			LinkPreset.Categories,
			LinkPreset.Tags,
		],
	});

	// 说说
	if (siteConfig.pages.chatters) {
		links.push({
			name: "说说",
			url: "/chatter/",
			icon: "material-symbols:chat-bubble-outline-rounded",
		});
	}

	// 杂谈
	if (siteConfig.pages.essays) {
		links.push({
			name: "杂谈",
			url: "/essays/",
			icon: "material-symbols:edit-note-rounded",
		});
	}

	// 音乐
	links.push({
		name: "音乐",
		url: "/music/",
		icon: "material-symbols:music-note-rounded",
	});

	links.push({
		name: "我的",
		url: "/my/",
		icon: "material-symbols:person",
		children: [
			...(siteConfig.pages.gallery ? [LinkPreset.Gallery] : []),
			...(siteConfig.pages.anime ? [LinkPreset.Anime] : []),
			...(siteConfig.pages.bangumi ? [LinkPreset.Bangumi] : []),
			...(siteConfig.pages.library ? [LinkPreset.Library] : []),
				{
					name: "工具",
					url: "/tools/",
					icon: "material-symbols:build-circle",
				},
		],
	});

	if (siteConfig.pages.friends) {
		links.push(LinkPreset.Friends);
	}

	// 关于我
	links.push(LinkPreset.About);

	// 旅行
	links.push({
		name: "旅行",
		url: "/travel/",
		icon: "material-symbols:explore",
		children: [
			{
				name: "开往",
				url: "https://www.travellings.cn/go.html",
				external: true,
				icon: "material-symbols:train",
				hideExternalIcon: true,
			},
			{
				name: "虫洞",
				url: "https://foreverblog.cn/go.html",
				external: true,
				icon: "material-symbols:rocket-launch",
				hideExternalIcon: true,
			},
			{
				name: "异次元之旅",
				url: "https://travel.moe/go?travel=on",
				external: true,
				icon: "mingcute:planet-line",
				hideExternalIcon: true,
			},
		],
	});

	return { links } as NavBarConfig;
};

export const navBarSearchConfig: NavBarSearchConfig = {
	method: NavBarSearchMethod.PageFind,
};

export const navBarConfig: NavBarConfig = getDynamicNavBarConfig();

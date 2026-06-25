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
			...(siteConfig.pages.bangumi ? [LinkPreset.Bangumi] : []),
		],
	});

	if (siteConfig.pages.friends) {
		links.push(LinkPreset.Friends);
	}

	// 关于我
	links.push(LinkPreset.About);

	return { links } as NavBarConfig;
};

export const navBarSearchConfig: NavBarSearchConfig = {
	method: NavBarSearchMethod.PageFind,
};

export const navBarConfig: NavBarConfig = getDynamicNavBarConfig();

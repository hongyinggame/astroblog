<script lang="ts">
	export interface Essay {
		id: string;
		data: {
			title: string;
			published: Date;
			description?: string;
			image?: string;
			tags?: string[];
			category?: string;
			pinned?: boolean;
		};
		body?: string;
		bodyHtml?: string;
	}

	let { essays = [], authorName = "", avatarUrl = "", pageTitle = "说说", pageSubtitle = `" 微言碎语，记录日常片段与灵感 "`, urlPrefix = "chatter", giscusTerm = "chatter" }: { essays?: Essay[]; authorName?: string; avatarUrl?: string; pageTitle?: string; pageSubtitle?: string; urlPrefix?: string; giscusTerm?: string } = $props();

	let searchQuery = $state("");
	let sortOrder = $state<"desc" | "asc">("desc");
	let layoutMode = $state<"grid" | "timeline">("grid");
	let selectedTag = $state<string | null>(null);
	let openCommentId = $state<string | null>(null);
	let giscusLoaded = $state(false);

	const allTags = $derived.by(() => {
		const freq: Record<string, number> = {};
		for (const e of essays) {
			for (const t of e.data.tags || []) {
				freq[t] = (freq[t] || 0) + 1;
			}
		}
		return Object.entries(freq)
			.sort((a, b) => b[1] - a[1])
			.map(([tag]) => tag);
	});

	const filteredEssays = $derived.by(() => {
		let result = [...essays];
		const q = searchQuery.trim().toLowerCase();
		if (q) {
			result = result.filter(e => {
				const bodyText = (e.body || "").replace(/[#*`>\-\[\]()!|\\]+/g, " ").replace(/\s+/g, " ");
				return e.data.title.toLowerCase().includes(q) ||
					bodyText.toLowerCase().includes(q) ||
					(e.data.tags || []).some(t => t.toLowerCase().includes(q));
			});
		}
		if (selectedTag) {
			result = result.filter(e => (e.data.tags || []).includes(selectedTag));
		}
		result.sort((a, b) => {
			const tA = new Date(a.data.published).getTime();
			const tB = new Date(b.data.published).getTime();
			return sortOrder === "desc" ? tB - tA : tA - tB;
		});
		return result;
	});

	const leftCol = $derived(filteredEssays.filter((_, i) => i % 2 === 0));
	const rightCol = $derived(filteredEssays.filter((_, i) => i % 2 === 1));

	function timeAgo(dateStr: Date): string {
		const date = new Date(dateStr);
		const now = new Date();
		const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
		if (diffSec < 60) return "刚刚";
		if (diffSec < 3600) return `${Math.floor(diffSec / 60)} 分钟前`;
		if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} 小时前`;
		return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
	}

	function stripMarkdown(body: string): string {
		return body
			.replace(/^#{1,6}\s+/gm, "")
			.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
			.replace(/[*_~`>|]+/g, "")
			.replace(/!\[.*?\]\(.*?\)/g, "")
			.replace(/\n{2,}/g, "\n")
			.trim();
	}

	function essayLink(id: string): string {
		return `/${urlPrefix}/${id}/`;
	}

	function loadGiscus() {
		if (giscusLoaded || document.querySelector('script[src*="esm.sh/giscus"]')) {
			giscusLoaded = true;
			return;
		}
		const script = document.createElement('script');
		script.src = 'https://esm.sh/giscus';
		script.type = 'module';
		script.async = true;
		script.onload = () => { giscusLoaded = true; };
		document.head.appendChild(script);
		giscusLoaded = true;
	}

	function applyThemeToWidgets() {
		const isDark = document.documentElement.classList.contains('dark');
		const theme = isDark ? 'transparent_dark' : 'light';
		document.querySelectorAll('.comment-widget-anchor giscus-widget').forEach(w => {
			if (w.getAttribute('theme') !== theme) w.setAttribute('theme', theme);
		});
	}
	if (typeof window !== 'undefined') {
		new MutationObserver(() => setTimeout(applyThemeToWidgets, 150))
			.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
	}

	function toggleComment(essayId: string, containerEl: HTMLElement) {
		if (openCommentId === essayId) {
			const existing = containerEl.querySelector('giscus-widget');
			if (existing) existing.remove();
			openCommentId = null;
			return;
		}

		if (openCommentId) {
			const prev = document.querySelector(`[data-comment-id="${openCommentId}"]`);
			if (prev) {
				const prevWidget = prev.querySelector('giscus-widget');
				if (prevWidget) prevWidget.remove();
			}
		}

		loadGiscus();

		openCommentId = essayId;
		setTimeout(() => {
			const target = containerEl.querySelector('.comment-widget-anchor');
			if (!target) return;
			target.innerHTML = '';
			const widget = document.createElement('giscus-widget');
			widget.setAttribute('repo', 'hongyinggame/blog_discussion');
			widget.setAttribute('repoId', 'R_kgDOS7RQBg');
			widget.setAttribute('category', 'Announcements');
			widget.setAttribute('categoryId', 'DIC_kwDOS7RQBs4C_MbB');
			widget.setAttribute('mapping', 'specific');
			widget.setAttribute('term', `${giscusTerm}/${essayId}`);
			widget.setAttribute('strict', '0');
			widget.setAttribute('reactionsEnabled', '1');
			widget.setAttribute('emitMetadata', '1');
			widget.setAttribute('inputPosition', 'bottom');
			widget.setAttribute('lang', 'zh-CN');
			widget.setAttribute('loading', 'lazy');
			const isDark = document.documentElement.classList.contains('dark');
			widget.setAttribute('theme', isDark ? 'transparent_dark' : 'light');
			target.appendChild(widget);
		}, 50);
	}
</script>

<div class="moment-page" data-moment-page>
	<div class="page-header">
		<h1 class="page-title">{pageTitle}</h1>
		<p class="page-sub">{pageSubtitle}</p>
	</div>

	<div class="filter-bar">
		<div class="search-wrap">
			<svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
				<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
			</svg>
			<input
				type="text"
				placeholder="搜寻被遗忘的思绪..."
				bind:value={searchQuery}
				class="search-input"
			/>
		</div>

		<div class="sort-bar">
			<button class="sort-btn" class:active={layoutMode === "grid"} onclick={() => (layoutMode = "grid")}>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> 网格
			</button>
			<button class="sort-btn" class:active={layoutMode === "timeline"} onclick={() => (layoutMode = "timeline")}>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="3" x2="12" y2="21"/><circle cx="12" cy="6" r="2"/><circle cx="12" cy="14" r="2"/><circle cx="12" cy="20" r="1.5"/></svg> 时间轴
			</button>
		</div>
	</div>

	{#if allTags.length > 0}
		<div class="tag-filter-bar">
			<button
				class="tag-pill"
				class:active={selectedTag === null}
				onclick={() => (selectedTag = null)}
			>全部</button>
			{#each allTags as tag}
				<button
					class="tag-pill"
					class:active={selectedTag === tag}
					onclick={() => (selectedTag = selectedTag === tag ? null : tag)}
				>#{tag}</button>
			{/each}
		</div>
	{/if}

	{#if filteredEssays.length > 0}
		{#if layoutMode === "grid"}
		<div class="content-toolbar">
			<div class="sort-bar sort-bar--subtle">
				<button class="sort-btn" class:active={sortOrder === "desc"} onclick={() => (sortOrder = "desc")}>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg> 最新
				</button>
				<button class="sort-btn" class:active={sortOrder === "asc"} onclick={() => (sortOrder = "asc")}>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 15l6-6 6 6"/></svg> 最早
				</button>
			</div>
		</div>
		<div class="feed-grid">
			<div class="feed-col">
				{#each leftCol as essay}
					<div class="feed-card" data-comment-id={essay.id} data-chatter-card={urlPrefix === "chatter" || undefined}>
						<a href={essayLink(essay.id)} class="card-header-link">
							<div class="card-header">
								<div class="avatar-ring-sm">
									{#if avatarUrl}
										<img src={avatarUrl} alt="" class="avatar-img" />
									{:else}
										<span class="avatar-fallback">📝</span>
									{/if}
								</div>
								<div class="header-info">
									<span class="author-name">{authorName || "作者"}</span>
									<span class="time-ago">{timeAgo(essay.data.published)}</span>
								</div>
							</div>
						</a>
						<a href={essayLink(essay.id)} class="card-title-link">
							<h3 class="card-title">{essay.data.title}</h3>
						</a>
						{#if urlPrefix === "chatter"}
							<div data-chatter-accent></div>
							<div data-chatter-divider><span>✦</span></div>
						{/if}
						{#if essay.bodyHtml || essay.body}
							<a href={essayLink(essay.id)} class="card-body-link">
								{#if urlPrefix === "chatter"}
								<div data-full-content class="custom-md">{@html essay.bodyHtml || ""}</div>
								{:else}
								<p class="card-body-text">{@html essay.bodyHtml || ""}</p>
								{/if}
							</a>
						{/if}
						{#if essay.data.image}
							<div class="card-image-wrap">
								<img src={essay.data.image} alt="" class="card-image" />
							</div>
						{/if}
						<div class="card-footer">
							<div class="footer-left">
								{#if essay.data.category}
									<span class="category-badge">{essay.data.category}</span>
								{/if}
								{#if essay.data.tags && essay.data.tags.length > 0}
									<div class="footer-tags">
										{#each essay.data.tags.slice(0, 4) as t}
											<span class="footer-tag">#{t}</span>
										{/each}
									</div>
								{/if}
							</div>
							<button
								class="comment-toggle-btn"
								class:active={openCommentId === essay.id}
								aria-label="查看评论"
								onclick={() => {
									const card = document.querySelector(`[data-comment-id="${essay.id}"]`) as HTMLElement;
									if (card) toggleComment(essay.id, card);
								}}
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
									<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
								</svg>
							</button>
						</div>
						{#if openCommentId === essay.id}
							<div class="comment-widget-anchor"></div>
						{/if}
					</div>
				{/each}
			</div>
			<div class="feed-col">
				{#each rightCol as essay}
					<div class="feed-card" data-comment-id={essay.id} data-chatter-card={urlPrefix === "chatter" || undefined}>
						<a href={essayLink(essay.id)} class="card-header-link">
							<div class="card-header">
								<div class="avatar-ring-sm">
									{#if avatarUrl}
										<img src={avatarUrl} alt="" class="avatar-img" />
									{:else}
										<span class="avatar-fallback">📝</span>
									{/if}
								</div>
								<div class="header-info">
									<span class="author-name">{authorName || "作者"}</span>
									<span class="time-ago">{timeAgo(essay.data.published)}</span>
								</div>
							</div>
						</a>
						<a href={essayLink(essay.id)} class="card-title-link">
							<h3 class="card-title">{essay.data.title}</h3>
						</a>
						{#if urlPrefix === "chatter"}
							<div data-chatter-accent></div>
							<div data-chatter-divider><span>✦</span></div>
						{/if}
						{#if essay.bodyHtml || essay.body}
							<a href={essayLink(essay.id)} class="card-body-link">
								{#if urlPrefix === "chatter"}
								<div data-full-content class="custom-md">{@html essay.bodyHtml || ""}</div>
								{:else}
								<p class="card-body-text">{@html essay.bodyHtml || ""}</p>
								{/if}
							</a>
						{/if}
						{#if essay.data.image}
							<div class="card-image-wrap">
								<img src={essay.data.image} alt="" class="card-image" />
							</div>
						{/if}
						<div class="card-footer">
							<div class="footer-left">
								{#if essay.data.category}
									<span class="category-badge">{essay.data.category}</span>
								{/if}
								{#if essay.data.tags && essay.data.tags.length > 0}
									<div class="footer-tags">
										{#each essay.data.tags.slice(0, 4) as t}
											<span class="footer-tag">#{t}</span>
										{/each}
									</div>
								{/if}
							</div>
							<button
								class="comment-toggle-btn"
								class:active={openCommentId === essay.id}
								aria-label="查看评论"
								onclick={() => {
									const card = document.querySelector(`[data-comment-id="${essay.id}"]`) as HTMLElement;
									if (card) toggleComment(essay.id, card);
								}}
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
									<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
								</svg>
							</button>
						</div>
						{#if openCommentId === essay.id}
							<div class="comment-widget-anchor"></div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<!-- Timeline View -->
		<div class="content-toolbar content-toolbar--timeline">
			<div class="sort-bar sort-bar--subtle">
				<button class="sort-btn" class:active={sortOrder === "desc"} onclick={() => (sortOrder = "desc")}>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg> 最新
				</button>
				<button class="sort-btn" class:active={sortOrder === "asc"} onclick={() => (sortOrder = "asc")}>
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 15l6-6 6 6"/></svg> 最早
				</button>
			</div>
		</div>
		<div class="timeline-view">
			{#each filteredEssays as essay, i}
				{@const showYear = i === 0 || new Date(essay.data.published).getFullYear() !== new Date(filteredEssays[i - 1].data.published).getFullYear()}
				<div class="timeline-item" data-comment-id={essay.id}>
					{#if showYear}
						<div class="timeline-year"><span>{new Date(essay.data.published).getFullYear()}</span></div>
					{/if}
					<div class="timeline-date">
						<span class="timeline-dot"></span>
						{new Date(essay.data.published).getFullYear()}.{String(new Date(essay.data.published).getMonth() + 1).padStart(2, "0")}.{String(new Date(essay.data.published).getDate()).padStart(2, "0")}
					</div>
					<div class="timeline-card" data-chatter-card={urlPrefix === "chatter" || undefined}>
						<a href={essayLink(essay.id)} class="card-header-link">
							<div class="card-header">
								<div class="avatar-ring-sm">
									{#if avatarUrl}
										<img src={avatarUrl} alt="" class="avatar-img" />
									{:else}
										<span class="avatar-fallback">📝</span>
									{/if}
								</div>
								<div class="header-info">
									<span class="author-name">{authorName || "作者"}</span>
									<span class="time-ago">{timeAgo(essay.data.published)}</span>
								</div>
							</div>
						</a>
						<a href={essayLink(essay.id)} class="card-title-link">
							<h3 class="card-title">{essay.data.title}</h3>
						</a>
						{#if urlPrefix === "chatter"}
							<div data-chatter-accent></div>
							<div data-chatter-divider><span>✦</span></div>
						{/if}
						{#if essay.bodyHtml || essay.body}
							<a href={essayLink(essay.id)} class="card-body-link">
								{#if urlPrefix === "chatter"}
								<div data-full-content class="custom-md">{@html essay.bodyHtml || ""}</div>
								{:else}
								<p class="card-body-text">{@html essay.bodyHtml || ""}</p>
								{/if}
							</a>
						{/if}
						{#if essay.data.image}
							<div class="card-image-wrap">
								<img src={essay.data.image} alt="" class="card-image" />
							</div>
						{/if}
						<div class="card-footer">
							<div class="footer-left">
								{#if essay.data.category}
									<span class="category-badge">{essay.data.category}</span>
								{/if}
								{#if essay.data.tags && essay.data.tags.length > 0}
									<div class="footer-tags">
										{#each essay.data.tags.slice(0, 4) as t}
											<span class="footer-tag">#{t}</span>
										{/each}
									</div>
								{/if}
							</div>
							<button class="comment-toggle-btn" class:active={openCommentId === essay.id} aria-label="查看评论" onclick={() => { const card = document.querySelector(`[data-comment-id="${essay.id}"]`) as HTMLElement; if (card) toggleComment(essay.id, card); }}>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
							</button>
						</div>
						{#if openCommentId === essay.id}
							<div class="comment-widget-anchor"></div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
		{/if}
	{:else}
		<div class="empty-state">
			<div class="empty-icon-wrap">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>
				</svg>
			</div>
			<h2>{searchQuery ? `没找到相关的${pageTitle}` : `还没有${pageTitle}`}</h2>
			<p>{searchQuery ? "尝试精简你的搜索词，或者换个心情再次出发。" : "还没有记录下任何碎片思绪呢。"}</p>
		</div>
	{/if}
</div>



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

<div class="moment-page">
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
					{@const bodyText = stripMarkdown(essay.body || "")}
					<div class="feed-card" data-comment-id={essay.id}>
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
						{#if bodyText}
							<a href={essayLink(essay.id)} class="card-body-link">
								<p class="card-body-text">{bodyText}</p>
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
					{@const bodyText = stripMarkdown(essay.body || "")}
					<div class="feed-card" data-comment-id={essay.id}>
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
						{#if bodyText}
							<a href={essayLink(essay.id)} class="card-body-link">
								<p class="card-body-text">{bodyText}</p>
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
				{@const bodyText = stripMarkdown(essay.body || "")}
				{@const showYear = i === 0 || new Date(essay.data.published).getFullYear() !== new Date(filteredEssays[i - 1].data.published).getFullYear()}
				<div class="timeline-item" data-comment-id={essay.id}>
					{#if showYear}
						<div class="timeline-year"><span>{new Date(essay.data.published).getFullYear()}</span></div>
					{/if}
					<div class="timeline-date">
						<span class="timeline-dot"></span>
						{new Date(essay.data.published).getFullYear()}.{String(new Date(essay.data.published).getMonth() + 1).padStart(2, "0")}.{String(new Date(essay.data.published).getDate()).padStart(2, "0")}
					</div>
					<div class="timeline-card">
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
						{#if bodyText}
							<a href={essayLink(essay.id)} class="card-body-link">
								<p class="card-body-text">{bodyText}</p>
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

<style>
	.moment-page {
		width: 100%;
		max-width: 80rem;
		margin: 0 auto;
		padding: 1rem 1rem 2rem;
	}

	.page-header {
		text-align: center;
		margin-bottom: 2.5rem;
	}
	.page-title {
		font-size: 2.25rem;
		font-weight: 900;
		letter-spacing: -0.025em;
		color: #0f172a;
		margin: 0 0 0.5rem;
	}
	:global(.dark) .page-title { color: #fff; }
	.page-sub {
		font-size: 0.875rem;
		color: #64748b;
		font-weight: 500;
		font-style: italic;
		opacity: 0.8;
		margin: 0;
	}
	:global(.dark) .page-sub { color: #94a3b8; }

	/* Filter bar */
	.filter-bar {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	.search-wrap {
		position: relative;
		width: 100%;
		max-width: 32rem;
	}
	.search-icon {
		position: absolute;
		left: 1rem;
		top: 50%;
		transform: translateY(-50%);
		color: #94a3b8;
		z-index: 10;
	}
	.search-input {
		width: 100%;
		padding: 0.75rem 1.25rem 0.75rem 2.75rem;
		border-radius: 1rem;
		border: 1px solid rgba(255,255,255,0.4);
		background: rgba(255,255,255,0.4);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		font-size: 0.95rem;
		font-weight: 500;
		outline: none;
		color: #1e293b;
		box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
		transition: all 0.3s;
	}
	:global(.dark) .search-input {
		background: rgba(30,41,59,0.4);
		border-color: rgba(255,255,255,0.05);
		color: #e2e8f0;
	}
	.search-input:focus {
		box-shadow: 0 0 0 2px color-mix(in oklch, var(--primary) 50%, transparent);
	}

	/* Sort bar (shared pill container) */
	.sort-bar {
		display: flex;
		background: rgba(255,255,255,0.5);
		backdrop-filter: blur(16px);
		border-radius: 0.75rem;
		border: 1px solid rgba(255,255,255,0.5);
		padding: 0.25rem;
		box-shadow: 0 1px 3px rgba(0,0,0,0.05);
	}
	:global(.dark) .sort-bar {
		background: rgba(30,41,59,0.5);
		border-color: rgba(255,255,255,0.1);
	}
	.sort-btn {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.4rem 1.25rem;
		border-radius: 0.6rem;
		border: none;
		font-size: 0.75rem;
		font-weight: 800;
		cursor: pointer;
		transition: all 0.3s;
		background: transparent;
		color: #64748b;
	}
	:global(.dark) .sort-btn { color: #94a3b8; }
	.sort-btn.active {
		background: var(--primary);
		color: #fff;
		box-shadow: 0 4px 12px color-mix(in oklch, var(--primary) 30%, transparent);
		transform: scale(1.05);
	}

	/* Tag filter bar */
	.tag-filter-bar {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.4rem;
		margin-bottom: 1.25rem;
	}
	.tag-pill {
		font-size: 0.72rem;
		font-weight: 600;
		padding: 0.3rem 0.85rem;
		border-radius: 9999px;
		border: 1px solid rgba(148,163,184,0.15);
		background: rgba(255,255,255,0.35);
		backdrop-filter: blur(8px);
		color: #64748b;
		cursor: pointer;
		transition: all 0.25s;
		white-space: nowrap;
	}
	:global(.dark) .tag-pill {
		background: rgba(30,41,59,0.35);
		border-color: rgba(148,163,184,0.1);
		color: #94a3b8;
	}
	.tag-pill:hover {
		color: var(--primary);
		border-color: color-mix(in oklch, var(--primary) 40%, transparent);
		background: color-mix(in oklch, var(--primary) 8%, rgba(255,255,255,0.5));
	}
	:global(.dark) .tag-pill:hover {
		background: color-mix(in oklch, var(--primary) 15%, rgba(30,41,59,0.6));
	}
	.tag-pill.active {
		background: var(--primary);
		color: #fff;
		border-color: var(--primary);
		box-shadow: 0 4px 14px color-mix(in oklch, var(--primary) 35%, transparent);
	}

	/* Content toolbar — right-align sort controls, matches content width */
	.content-toolbar {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
	}
	.content-toolbar--timeline {
		max-width: 42rem;
		margin-left: auto;
		margin-right: auto;
	}

	/* Subtle sort bar — lighter, no background pill, for order controls */
	.sort-bar--subtle {
		background: transparent;
		backdrop-filter: none;
		border: none;
		box-shadow: none;
		padding: 0;
		gap: 0.25rem;
	}
	.sort-bar--subtle .sort-btn {
		font-size: 0.7rem;
		font-weight: 600;
		padding: 0.25rem 0.75rem;
		border-radius: 0.5rem;
		color: #94a3b8;
		background: transparent;
	}
	:global(.dark) .sort-bar--subtle .sort-btn { color: #64748b; }
	.sort-bar--subtle .sort-btn:hover {
		color: var(--primary);
		background: color-mix(in oklch, var(--primary) 8%, transparent);
	}
	.sort-bar--subtle .sort-btn.active {
		background: color-mix(in oklch, var(--primary) 12%, transparent);
		color: var(--primary);
		box-shadow: none;
		transform: none;
	}

	/* Feed grid */
	.feed-grid {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
	}
	@media (min-width: 768px) {
		.feed-grid { gap: 2rem; }
	}
	@media (max-width: 639px) {
		.feed-grid { flex-direction: column; }
	}
	.feed-col {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}
	@media (min-width: 768px) {
		.feed-col { gap: 2rem; }
	}

	/* Feed card */
	.feed-card {
		display: block;
		background: rgba(255,255,255,0.6);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-radius: 1.5rem;
		border: 1px solid rgba(255,255,255,0.4);
		padding: 1.25rem;
		box-shadow: 0 10px 30px rgba(0,0,0,0.08);
		transition: all 0.4s;
		overflow: hidden;
	}
	:global(.dark) .feed-card {
		background: rgba(30,41,59,0.5);
		border-color: rgba(255,255,255,0.1);
	}
	.feed-card:hover {
		box-shadow: 0 20px 50px rgba(0,0,0,0.15);
		transform: translateY(-2px);
	}
	:global(.dark) .feed-card:hover {
		box-shadow: 0 20px 50px rgba(0,0,0,0.35);
	}
	@media (min-width: 768px) {
		.feed-card {
			border-radius: 2.25rem;
			padding: 2rem;
		}
	}
	@media (min-width: 1024px) {
		.feed-card {
			border-radius: 2.5rem;
			padding: 2.5rem;
		}
	}

	/* Card header link */
	.card-header-link {
		text-decoration: none;
		display: block;
	}
	.card-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid rgba(0,0,0,0.06);
	}
	:global(.dark) .card-header { border-color: rgba(255,255,255,0.06); }
	@media (min-width: 768px) {
		.card-header { gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1.25rem; }
	}

	.avatar-ring-sm {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 0.75rem;
		overflow: hidden;
		flex-shrink: 0;
		border: 2px solid #fff;
		box-shadow: 0 2px 8px rgba(0,0,0,0.08);
		background: linear-gradient(135deg, var(--primary), #a855f7);
	}
	:global(.dark) .avatar-ring-sm { border-color: #1e293b; }
	@media (min-width: 768px) {
		.avatar-ring-sm {
			width: 3.25rem;
			height: 3.25rem;
			border-radius: 1rem;
		}
	}
	.avatar-img { width: 100%; height: 100%; object-fit: cover; }
	.avatar-fallback {
		width: 100%; height: 100%;
		display: flex; align-items: center; justify-content: center;
		font-size: 1.25rem;
	}

	.header-info { display: flex; flex-direction: column; }
	.author-name {
		font-size: 0.875rem; font-weight: 800;
		color: var(--primary); letter-spacing: 0.02em;
	}
	:global(.dark) .author-name { color: var(--primary); }
	@media (min-width: 768px) { .author-name { font-size: 1rem; } }
	.time-ago {
		font-size: 0.65rem; font-weight: 700;
		color: #94a3b8; margin-top: 0.15rem;
	}
	@media (min-width: 768px) { .time-ago { font-size: 0.7rem; } }

	/* Card title link */
	.card-title-link { text-decoration: none; display: block; }
	.card-title {
		font-size: 1.1rem; font-weight: 800;
		color: #0f172a; margin: 0 0 0.75rem;
		line-height: 1.35; transition: color 0.3s;
	}
	:global(.dark) .card-title { color: #f1f5f9; }
	.feed-card:hover .card-title { color: var(--primary); }
	:global(.dark) .feed-card:hover .card-title { color: var(--primary); }
	@media (min-width: 768px) {
		.card-title { font-size: 1.35rem; margin-bottom: 1rem; }
	}

	/* Body text link */
	.card-body-link { text-decoration: none; display: block; }
	.card-body-text {
		font-size: 0.85rem; line-height: 1.65;
		color: #334155; margin: 0;
		white-space: pre-wrap;
		display: -webkit-box;
		-webkit-line-clamp: 8;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	:global(.dark) .card-body-text { color: #cbd5e1; }
	@media (min-width: 768px) { .card-body-text { font-size: 1rem; } }

	/* Cover image */
	.card-image-wrap {
		margin-top: 1rem; border-radius: 1rem;
		overflow: hidden; border: 1px solid rgba(0,0,0,0.06);
	}
	:global(.dark) .card-image-wrap { border-color: rgba(255,255,255,0.08); }
	@media (min-width: 768px) {
		.card-image-wrap { margin-top: 1.5rem; border-radius: 1.5rem; }
	}
	.card-image {
		width: 100%; height: auto; max-height: 18rem;
		object-fit: cover; display: block;
		transition: transform 0.5s ease;
	}
	.feed-card:hover .card-image { transform: scale(1.03); }

	/* Card footer */
	.card-footer {
		display: flex; align-items: center; justify-content: space-between;
		flex-wrap: wrap; gap: 0.5rem;
		margin-top: 1rem; padding-top: 0.75rem;
		border-top: 1px solid rgba(0,0,0,0.05);
	}
	:global(.dark) .card-footer { border-color: rgba(255,255,255,0.05); }
	@media (min-width: 768px) {
		.card-footer { margin-top: 1.5rem; padding-top: 1rem; gap: 0.75rem; }
	}
	.footer-left { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
	.category-badge {
		font-size: 0.65rem; font-weight: 800;
		padding: 0.2rem 0.6rem; border-radius: 9999px;
		background: rgba(16,185,129,0.1); color: #059669;
		border: 1px solid rgba(16,185,129,0.15);
	}
	:global(.dark) .category-badge {
		background: rgba(16,185,129,0.15); color: #34d399;
	}
	.footer-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; }
	.footer-tag {
		font-size: 0.6rem; font-weight: 600;
		padding: 0.12rem 0.4rem; border-radius: 0.35rem;
		background: rgba(100,116,139,0.06); color: #64748b;
		border: 1px solid rgba(100,116,139,0.1);
	}
	:global(.dark) .footer-tag {
		background: rgba(148,163,184,0.06); color: #94a3b8;
		border-color: rgba(148,163,184,0.1);
	}

	/* Comment toggle button */
	.comment-toggle-btn {
		display: flex; align-items: center; justify-content: center;
		width: 2rem; height: 2rem; border-radius: 50%;
		border: 1px solid rgba(0,0,0,0.08);
		background: rgba(255,255,255,0.8);
		color: #94a3b8; cursor: pointer;
		transition: all 0.25s; flex-shrink: 0;
	}
	:global(.dark) .comment-toggle-btn {
		background: rgba(30,41,59,0.8);
		border-color: rgba(255,255,255,0.08);
		color: #64748b;
	}
	.comment-toggle-btn:hover {
		color: var(--primary);
		border-color: var(--primary);
		background: rgba(255,255,255,1);
	}
	.comment-toggle-btn.active {
		background: var(--primary);
		color: #fff;
		border-color: var(--primary);
		box-shadow: 0 4px 12px color-mix(in oklch, var(--primary) 30%, transparent);
	}
	@media (min-width: 768px) {
		.comment-toggle-btn { width: 2.5rem; height: 2.5rem; }
	}

	/* Inline comment widget area */
	.comment-widget-anchor {
		margin-top: 1rem;
		padding: 0.75rem;
		background: rgba(255,255,255,0.3);
		backdrop-filter: blur(12px);
		border-radius: 1rem;
		border: 1px solid rgba(255,255,255,0.3);
		overflow: hidden;
	}
	:global(.dark) .comment-widget-anchor {
		background: rgba(15,23,42,0.4);
		border-color: rgba(255,255,255,0.06);
	}
	@media (min-width: 768px) {
		.comment-widget-anchor { padding: 1rem; border-radius: 1.25rem; }
	}

	/* Empty state */
	.empty-state {
		display: flex; flex-direction: column;
		align-items: center; justify-content: center;
		padding: 5rem 2rem; text-align: center;
		background: rgba(255,255,255,0.3);
		backdrop-filter: blur(24px); border-radius: 2rem;
		border: 1px solid rgba(255,255,255,0.3);
	}
	:global(.dark) .empty-state {
		background: rgba(30,41,59,0.3);
		border-color: rgba(255,255,255,0.05);
	}
	.empty-icon-wrap {
		width: 6rem; height: 6rem; border-radius: 1.5rem;
		background: color-mix(in oklch, var(--primary) 10%, transparent);
		display: flex; align-items: center; justify-content: center;
		margin-bottom: 1.5rem; color: var(--primary);
	}
	.empty-state h2 {
		font-size: 1.5rem; font-weight: 800;
		color: #0f172a; margin: 0 0 0.5rem;
	}
	:global(.dark) .empty-state h2 { color: #f1f5f9; }
	.empty-state p {
		font-size: 0.9rem; color: #64748b; margin: 0;
	}
	:global(.dark) .empty-state p { color: #94a3b8; }

	/* Timeline view */
	.timeline-view {
		position: relative;
		max-width: 42rem;
		margin: 0 auto;
		padding-left: 1.25rem;
	}
	@media (min-width: 768px) {
		.timeline-view { padding-left: 2rem; }
	}
	.timeline-view::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 2px;
		background: linear-gradient(to bottom, var(--primary), #a855f7, #ec4899, transparent);
		border-radius: 1px;
	}
	@media (min-width: 768px) {
		.timeline-view::before { left: 0.5rem; }
	}

	.timeline-item {
		position: relative;
		margin-bottom: 1.5rem;
	}
	@media (min-width: 768px) {
		.timeline-item { margin-bottom: 2rem; }
	}

	.timeline-year {
		margin-bottom: 0.75rem;
	}
	.timeline-year span {
		display: inline-block;
		font-size: 1rem;
		font-weight: 900;
		color: #fff;
		background: linear-gradient(135deg, var(--primary), #a855f7);
		padding: 0.25rem 1rem;
		border-radius: 9999px;
		box-shadow: 0 4px 12px color-mix(in oklch, var(--primary) 30%, transparent);
	}
	@media (min-width: 768px) {
		.timeline-year span { font-size: 1.15rem; padding: 0.35rem 1.25rem; }
	}

	.timeline-date {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.7rem;
		font-weight: 700;
		color: #94a3b8;
		margin-bottom: 0.5rem;
		padding-left: 1.25rem;
	}
	@media (min-width: 768px) {
		.timeline-date { font-size: 0.8rem; gap: 1rem; padding-left: 2rem; }
	}
	.timeline-dot {
		position: absolute;
		left: -0.313rem;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--primary);
		border: 2px solid #fff;
		box-shadow: 0 0 0 3px color-mix(in oklch, var(--primary) 20%, transparent);
	}
	:global(.dark) .timeline-dot { border-color: #1e293b; }
	@media (min-width: 768px) {
		.timeline-dot {
			left: calc(0.5rem - 3px);
			width: 12px;
			height: 12px;
		}
	}

	.timeline-card {
		background: rgba(255,255,255,0.6);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-radius: 1.25rem;
		border: 1px solid rgba(255,255,255,0.4);
		padding: 1.25rem;
		box-shadow: 0 8px 25px rgba(0,0,0,0.06);
		transition: all 0.3s;
		margin-left: 0.5rem;
	}
	:global(.dark) .timeline-card {
		background: rgba(30,41,59,0.5);
		border-color: rgba(255,255,255,0.1);
	}
	.timeline-card:hover {
		box-shadow: 0 16px 40px rgba(0,0,0,0.12);
		transform: translateY(-1px);
	}
	:global(.dark) .timeline-card:hover {
		box-shadow: 0 16px 40px rgba(0,0,0,0.3);
	}
	@media (min-width: 768px) {
		.timeline-card {
			border-radius: 1.75rem;
			padding: 1.75rem;
			margin-left: 1.25rem;
		}
	}
</style>

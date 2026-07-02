<script lang="ts">
	interface SearchItem {
		id: string;
		type: "post" | "chatter" | "essay";
		title: string;
		description?: string;
		tags?: string[];
		body: string;
		published: Date;
	}

	let { items = [] }: { items: SearchItem[] } = $props();

	let query = $state("");
	let viewMode = $state<"list" | "grid" | "timeline">("list");
	let sortNewest = $state(true);
	let currentPage = $state(1);
	const pageSize = 20;

	function escapeRegExp(s: string) {
		return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}

	function makeExcerpt(body: string, q: string): string {
		if (!body) return "";
		const idx = body.toLowerCase().indexOf(q.toLowerCase());
		if (idx > -1) {
			const start = Math.max(0, idx - 40);
			const end = Math.min(body.length, idx + q.length + 80);
			return (start > 0 ? "..." : "") + body.slice(start, end) + (end < body.length ? "..." : "");
		}
		return body.slice(0, 150) + (body.length > 150 ? "..." : "");
	}

	let results = $derived.by(() => {
		if (!query.trim()) return [];
		const q = query.toLowerCase();
		return items
			.filter((item) => {
				const title = (item.title || "").toLowerCase();
				const desc = (item.description || "").toLowerCase();
				const body = (item.body || "").toLowerCase();
				const tags = (item.tags || []).join(" ").toLowerCase();
				return title.includes(q) || desc.includes(q) || body.includes(q) || tags.includes(q);
			})
			.map((item) => ({
				...item,
				excerpt: makeExcerpt(item.body, q),
			}));
	});

	let sortedResults = $derived(
		[...results].sort((a, b) => {
			const diff = new Date(b.published).getTime() - new Date(a.published).getTime();
			return sortNewest ? diff : -diff;
		})
	);

	let totalPages = $derived(Math.max(1, Math.ceil(sortedResults.length / pageSize)));

	let pagedResults = $derived.by(() => {
		if (currentPage > totalPages) {
			currentPage = totalPages;
		}
		const start = (currentPage - 1) * pageSize;
		return sortedResults.slice(start, start + pageSize);
	});

	function goPage(n: number) {
		currentPage = Math.max(1, Math.min(totalPages, n));
	}

	function typeLabel(type: string): string {
		if (type === "post") return "文章";
		if (type === "chatter") return "说说";
		if (type === "essay") return "杂谈";
		return "";
	}

	function getUrl(item: { id: string; type: string }): string {
		if (item.type === "post") return `/posts/${item.id}/`;
		if (item.type === "chatter") return `/chatter/${item.id}/`;
		if (item.type === "essay") return `/essays/${item.id}/`;
		return "/";
	}

	function highlight(text: string): string {
		if (!query.trim()) return text;
		const escaped = escapeRegExp(query);
		const regex = new RegExp(`(${escaped})`, "gi");
		return text.replace(regex, '<mark class="search-highlight">$1</mark>');
	}

	function formatDate(d: Date): string {
		return new Date(d).toLocaleDateString("zh-CN", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		}).replace(/\//g, ".");
	}

	function formatMonth(d: Date): string {
		return new Date(d).toLocaleDateString("zh-CN", {
			year: "numeric",
			month: "long",
		});
	}

	$effect(() => {
		const params = new URLSearchParams(window.location.search);
		query = params.get("q") || "";
	});

	// Reset page when query or sort changes
	$effect(() => {
		query; sortNewest;
		currentPage = 1;
	});

	function toggleSort() {
		sortNewest = !sortNewest;
	}

	function setView(mode: "list" | "grid" | "timeline") {
		viewMode = mode;
	}

	// Group results by month for timeline
	let timelineGroups = $derived.by(() => {
		const groups: { month: string; items: typeof sortedResults }[] = [];
		for (const item of sortedResults) {
			const m = formatMonth(item.published);
			const last = groups[groups.length - 1];
			if (last && last.month === m) {
				last.items.push(item);
			} else {
				groups.push({ month: m, items: [item] });
			}
		}
		return groups;
	});

	const pageItemIds = $derived(new Set(pagedResults.map(i => i.id)));

	function groupHasPageItem(group: { items: typeof sortedResults }): boolean {
		return group.items.some(i => pageItemIds.has(i.id));
	}

	function filterPageItems(items: typeof sortedResults): typeof sortedResults {
		return items.filter(i => pageItemIds.has(i.id));
	}
</script>

<div class="search-results-page">
	<div class="search-page-header">
		<a href="/" class="search-back-link">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<line x1="19" y1="12" x2="5" y2="12"></line>
				<polyline points="12 19 5 12 12 5"></polyline>
			</svg>
			返回首页
		</a>
		<h1 class="search-page-title">
			搜索 "<span class="search-query-text">{query}</span>"
		</h1>
		<p class="search-page-count">
			{query ? `找到 ${results.length} 条结果` : "请输入搜索关键词"}
		</p>
	</div>

	{#if query && results.length > 0}
		<!-- Toolbar -->
		<div class="search-toolbar">
			<div class="toolbar-left">
				<button class="toolbar-btn" onclick={toggleSort} title={sortNewest ? "最新优先" : "最早优先"}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						{#if sortNewest}
							<line x1="12" y1="5" x2="12" y2="19"></line>
							<polyline points="19 12 12 19 5 12"></polyline>
						{:else}
							<line x1="12" y1="19" x2="12" y2="5"></line>
							<polyline points="5 12 12 5 19 12"></polyline>
						{/if}
					</svg>
					<span>{sortNewest ? "最新优先" : "最早优先"}</span>
				</button>
			</div>

			<div class="toolbar-right">
				<button
					class="toolbar-btn view-btn"
					class:active={viewMode === "list"}
					onclick={() => setView("list")}
					title="列表视图"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<line x1="8" y1="6" x2="21" y2="6"></line>
						<line x1="8" y1="12" x2="21" y2="12"></line>
						<line x1="8" y1="18" x2="21" y2="18"></line>
						<line x1="3" y1="6" x2="3.01" y2="6"></line>
						<line x1="3" y1="12" x2="3.01" y2="12"></line>
						<line x1="3" y1="18" x2="3.01" y2="18"></line>
					</svg>
				</button>
				<button
					class="toolbar-btn view-btn"
					class:active={viewMode === "grid"}
					onclick={() => setView("grid")}
					title="网格视图"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<rect x="3" y="3" width="7" height="7"></rect>
						<rect x="14" y="3" width="7" height="7"></rect>
						<rect x="3" y="14" width="7" height="7"></rect>
						<rect x="14" y="14" width="7" height="7"></rect>
					</svg>
				</button>
				<button
					class="toolbar-btn view-btn"
					class:active={viewMode === "timeline"}
					onclick={() => setView("timeline")}
					title="时间轴视图"
				>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<circle cx="12" cy="12" r="1"></circle>
						<line x1="12" y1="13" x2="12" y2="21"></line>
						<circle cx="5" cy="5" r="1"></circle>
						<line x1="5" y1="6" x2="5" y2="21"></line>
						<circle cx="19" cy="9" r="1"></circle>
						<line x1="19" y1="10" x2="19" y2="21"></line>
					</svg>
				</button>
			</div>
		</div>

		<!-- List View -->
		{#if viewMode === "list"}
			<div class="search-results-list">
				{#each pagedResults as item}
					<a href={getUrl(item)} class="search-result-card">
						<div class="result-card-header">
							<span class="result-type-badge result-type--{item.type}">
								{typeLabel(item.type)}
							</span>
							<span class="result-card-date">{formatDate(item.published)}</span>
						</div>
						<h2 class="result-card-title">{@html highlight(item.title)}</h2>
						{#if item.description}
							<p class="result-card-desc">{@html highlight(item.description)}</p>
						{/if}
						{#if item.tags?.length}
							<div class="result-card-tags">
								{#each item.tags as tag}
									<span class="result-card-tag">{tag}</span>
								{/each}
							</div>
						{/if}
						{#if item.excerpt}
							<p class="result-card-excerpt">{@html highlight(item.excerpt)}</p>
						{/if}
					</a>
				{/each}
			</div>
		{/if}

		<!-- Grid View -->
		{#if viewMode === "grid"}
			<div class="search-results-grid">
				{#each pagedResults as item}
					<a href={getUrl(item)} class="search-result-card grid-card">
						<div class="result-card-header">
							<span class="result-type-badge result-type--{item.type}">
								{typeLabel(item.type)}
							</span>
							<span class="result-card-date">{formatDate(item.published)}</span>
						</div>
						<h2 class="result-card-title">{@html highlight(item.title)}</h2>
						{#if item.description}
							<p class="result-card-desc">{@html highlight(item.description)}</p>
						{/if}
						{#if item.tags?.length}
							<div class="result-card-tags">
								{#each item.tags as tag}
									<span class="result-card-tag">{tag}</span>
								{/each}
							</div>
						{/if}
						{#if item.excerpt}
							<p class="result-card-excerpt">{@html highlight(item.excerpt)}</p>
						{/if}
					</a>
				{/each}
			</div>
		{/if}

		<!-- Timeline View -->
		{#if viewMode === "timeline"}
			<div class="search-timeline">
				{#each timelineGroups as group}
					{#if groupHasPageItem(group)}
						<div class="timeline-group">
							<div class="timeline-month-marker">
								<span class="timeline-dot"></span>
								<span class="timeline-month-label">{group.month}</span>
								<span class="timeline-count">{group.items.length} 篇</span>
							</div>
							<div class="timeline-items">
								{#each filterPageItems(group.items) as item}
									<a href={getUrl(item)} class="search-result-card timeline-card">
										<div class="result-card-header">
											<span class="result-type-badge result-type--{item.type}">
												{typeLabel(item.type)}
											</span>
											<span class="result-card-date">{formatDate(item.published)}</span>
										</div>
										<h2 class="result-card-title">{@html highlight(item.title)}</h2>
										{#if item.description}
											<p class="result-card-desc">{@html highlight(item.description)}</p>
										{/if}
										{#if item.tags?.length}
											<div class="result-card-tags">
												{#each item.tags as tag}
													<span class="result-card-tag">{tag}</span>
												{/each}
											</div>
										{/if}
										{#if item.excerpt}
											<p class="result-card-excerpt">{@html highlight(item.excerpt)}</p>
										{/if}
									</a>
								{/each}
							</div>
						</div>
					{/if}
				{/each}
			</div>
		{/if}

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="search-pagination">
				<button class="page-btn" disabled={currentPage <= 1} onclick={() => goPage(currentPage - 1)}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<polyline points="15 18 9 12 15 6"></polyline>
					</svg>
				</button>

				{#each Array(totalPages) as _, i}
					{@const pageNum = i + 1}
					{#if totalPages <= 7 || pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)}
						<button
							class="page-btn page-num"
							class:active={pageNum === currentPage}
							onclick={() => goPage(pageNum)}
						>
							{pageNum}
						</button>
					{:else if pageNum === currentPage - 2 || pageNum === currentPage + 2}
						<span class="page-ellipsis">...</span>
					{/if}
				{/each}

				<button class="page-btn" disabled={currentPage >= totalPages} onclick={() => goPage(currentPage + 1)}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
						<polyline points="9 18 15 12 9 6"></polyline>
					</svg>
				</button>

				<span class="page-info">{currentPage} / {totalPages} 页</span>
			</div>
		{/if}
	{/if}

	{#if query && results.length === 0}
		<div class="search-no-results">
			<svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round">
				<circle cx="11" cy="11" r="8"></circle>
				<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
			</svg>
			<h2>未找到相关结果</h2>
			<p>试试其他关键词？</p>
		</div>
	{/if}
</div>

<style>
	.search-results-page {
		width: 100%;
		max-width: 56rem;
		margin: 0 auto;
		padding: 0 1rem 2rem;
	}

	.search-page-header {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.search-back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--primary);
		text-decoration: none;
		margin-bottom: 1rem;
		transition: opacity 0.2s;
	}
	.search-back-link:hover {
		opacity: 0.7;
	}

	.search-page-title {
		font-size: 1.75rem;
		font-weight: 900;
		letter-spacing: -0.025em;
		color: #0f172a;
		margin: 0 0 0.5rem;
	}
	:global(.dark) .search-page-title { color: #f1f5f9; }

	.search-query-text {
		color: var(--primary);
	}

	.search-page-count {
		font-size: 0.9rem;
		color: #64748b;
		margin: 0;
	}
	:global(.dark) .search-page-count { color: #94a3b8; }

	/* ── Toolbar ── */
	.search-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1.25rem;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.toolbar-left, .toolbar-right {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}
	.toolbar-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.4rem 0.65rem;
		border-radius: 0.6rem;
		border: 1px solid rgba(100,116,139,0.15);
		background: rgba(255,255,255,0.5);
		backdrop-filter: blur(12px);
		font-size: 0.75rem;
		font-weight: 600;
		color: #475569;
		cursor: pointer;
		transition: all 0.2s;
	}
	:global(.dark) .toolbar-btn {
		background: rgba(30,41,59,0.5);
		border-color: rgba(148,163,184,0.15);
		color: #94a3b8;
	}
	.toolbar-btn:hover {
		background: rgba(255,255,255,0.8);
		border-color: rgba(100,116,139,0.3);
	}
	:global(.dark) .toolbar-btn:hover {
		background: rgba(30,41,59,0.8);
		border-color: rgba(148,163,184,0.3);
	}
	.view-btn {
		padding: 0.4rem;
	}
	.view-btn.active {
		background: color-mix(in oklch, var(--primary) 12%, transparent);
		border-color: color-mix(in oklch, var(--primary) 30%, transparent);
		color: var(--primary);
	}

	/* ── List View ── */
	.search-results-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* ── Grid View ── */
	.search-results-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem;
	}
	@media (min-width: 640px) {
		.search-results-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
	@media (min-width: 1024px) {
		.search-results-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}
	.grid-card {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.grid-card .result-card-excerpt {
		margin-top: auto;
	}

	/* ── Timeline View ── */
	.search-timeline {
		position: relative;
		padding-left: 1.5rem;
	}
	.search-timeline::before {
		content: "";
		position: absolute;
		left: 0.35rem;
		top: 0.3rem;
		bottom: 0;
		width: 2px;
		background: linear-gradient(to bottom, color-mix(in oklch, var(--primary) 50%, transparent), rgba(100,116,139,0.1));
		border-radius: 1px;
	}
	.timeline-group {
		margin-bottom: 1.25rem;
	}
	.timeline-month-marker {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
		margin-left: -1.5rem;
	}
	.timeline-dot {
		width: 0.75rem;
		height: 0.75rem;
		border-radius: 50%;
		background: var(--primary);
		box-shadow: 0 0 0 3px rgba(255,255,255,0.8), 0 0 0 5px color-mix(in oklch, var(--primary) 20%, transparent);
		flex-shrink: 0;
	}
	:global(.dark) .timeline-dot {
		box-shadow: 0 0 0 3px rgba(15,23,42,0.8), 0 0 0 5px color-mix(in oklch, var(--primary) 20%, transparent);
	}
	.timeline-month-label {
		font-size: 0.95rem;
		font-weight: 800;
		color: #0f172a;
		letter-spacing: -0.01em;
	}
	:global(.dark) .timeline-month-label { color: #f1f5f9; }
	.timeline-count {
		font-size: 0.7rem;
		color: #94a3b8;
		font-weight: 500;
	}
	.timeline-items {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.timeline-card {
		position: relative;
	}
	.timeline-card::before {
		content: "";
		position: absolute;
		left: -1.5rem;
		top: 1.1rem;
		width: 0.5rem;
		height: 2px;
		background: rgba(100,116,139,0.2);
	}

	/* ── Card (shared) ── */
	.search-result-card {
		display: block;
		background: rgba(255,255,255,0.6);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-radius: 1.25rem;
		border: 1px solid rgba(255,255,255,0.4);
		padding: 1.25rem;
		text-decoration: none;
		transition: all 0.3s;
		box-shadow: 0 4px 16px rgba(0,0,0,0.06);
	}
	:global(.dark) .search-result-card {
		background: rgba(30,41,59,0.5);
		border-color: rgba(255,255,255,0.1);
	}
	.search-result-card:hover {
		box-shadow: 0 12px 32px rgba(0,0,0,0.12);
		transform: translateY(-1px);
		border-color: color-mix(in oklch, var(--primary) 30%, transparent);
	}
	@media (min-width: 768px) {
		.search-result-card {
			border-radius: 1.75rem;
			padding: 1.75rem;
		}
	}

	.result-card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}

	.result-type-badge {
		font-size: 0.65rem;
		font-weight: 800;
		padding: 0.15rem 0.5rem;
		border-radius: 9999px;
		color: #fff;
		letter-spacing: 0.02em;
	}
	.result-type--post { background: #6366f1; }
	.result-type--chatter { background: #10b981; }
	.result-type--essay { background: #f59e0b; }

	.result-card-date {
		font-size: 0.7rem;
		font-weight: 600;
		color: #94a3b8;
	}
	:global(.dark) .result-card-date { color: #64748b; }

	.result-card-title {
		font-size: 1.1rem;
		font-weight: 800;
		color: #0f172a;
		margin: 0 0 0.35rem;
		line-height: 1.4;
	}
	:global(.dark) .result-card-title { color: #f1f5f9; }
	.search-result-card:hover .result-card-title { color: var(--primary); }

	.result-card-desc {
		font-size: 0.85rem;
		color: #475569;
		margin: 0 0 0.5rem;
		line-height: 1.55;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	:global(.dark) .result-card-desc { color: #94a3b8; }

	.result-card-excerpt {
		font-size: 0.8rem;
		color: #64748b;
		line-height: 1.6;
		margin: 0.5rem 0 0;
		padding-top: 0.5rem;
		border-top: 1px solid rgba(0,0,0,0.05);
		word-break: break-word;
	}
	:global(.dark) .result-card-excerpt {
		color: #94a3b8;
		border-color: rgba(255,255,255,0.05);
	}

	.result-card-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}
	.result-card-tag {
		font-size: 0.6rem;
		font-weight: 600;
		padding: 0.12rem 0.4rem;
		border-radius: 0.35rem;
		background: rgba(100,116,139,0.06);
		color: #64748b;
		border: 1px solid rgba(100,116,139,0.1);
	}
	:global(.dark) .result-card-tag {
		background: rgba(148,163,184,0.06);
		color: #94a3b8;
		border-color: rgba(148,163,184,0.1);
	}

	:global(.search-highlight) {
		background: #fde047;
		color: #000;
		border-radius: 2px;
		padding: 0 2px;
	}
	:global(.dark) :global(.search-highlight) {
		background: #facc15;
		color: #000;
	}

	/* ── Pagination ── */
	.search-pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
		margin-top: 2rem;
		flex-wrap: wrap;
	}
	.page-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		border-radius: 0.5rem;
		border: 1px solid rgba(100,116,139,0.15);
		background: rgba(255,255,255,0.5);
		backdrop-filter: blur(12px);
		color: #475569;
		cursor: pointer;
		transition: all 0.2s;
		font-size: 0.8rem;
		font-weight: 600;
	}
	:global(.dark) .page-btn {
		background: rgba(30,41,59,0.5);
		border-color: rgba(148,163,184,0.15);
		color: #94a3b8;
	}
	.page-btn:hover:not(:disabled) {
		background: rgba(255,255,255,0.8);
		border-color: color-mix(in oklch, var(--primary) 30%, transparent);
	}
	.page-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}
	.page-num.active {
		background: color-mix(in oklch, var(--primary) 15%, transparent);
		border-color: color-mix(in oklch, var(--primary) 40%, transparent);
		color: var(--primary);
	}
	.page-ellipsis {
		width: 2rem;
		text-align: center;
		color: #94a3b8;
		font-size: 0.75rem;
	}
	.page-info {
		font-size: 0.75rem;
		color: #94a3b8;
		margin-left: 0.5rem;
		font-weight: 500;
	}

	/* ── No Results ── */
	.search-no-results {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 4rem 2rem;
		text-align: center;
		color: #94a3b8;
		background: rgba(255,255,255,0.3);
		backdrop-filter: blur(24px);
		border-radius: 2rem;
		border: 1px solid rgba(255,255,255,0.3);
	}
	:global(.dark) .search-no-results {
		background: rgba(30,41,59,0.3);
		border-color: rgba(255,255,255,0.05);
		color: #64748b;
	}
	.search-no-results h2 {
		font-size: 1.25rem;
		font-weight: 700;
		color: #0f172a;
		margin: 1rem 0 0.25rem;
	}
	:global(.dark) .search-no-results h2 { color: #f1f5f9; }
	.search-no-results p {
		font-size: 0.9rem;
		margin: 0;
	}
</style>

<script lang="ts">
	export interface Chatter {
		id: string;
		data: {
			title: string;
			published: Date;
			description?: string;
			image?: string;
			tags?: string[];
			pinned?: boolean;
			mood?: string;
		};
		body?: string;
	}

	let { chatters = [] }: { chatters: Chatter[] } = $props();

	let searchQuery = $state("");
	let activeTag = $state("全部");

	const allTags = $derived.by(() => {
		const tags = new Set<string>();
		chatters.forEach(c => c.data.tags?.forEach(t => tags.add(t)));
		return ["全部", ...Array.from(tags)];
	});

	const filteredChatters = $derived(
		chatters.filter(c => {
			const q = searchQuery.trim().toLowerCase();
			const bodyText = (c.body || "").replace(/[#*`>\-\[\]()!|\\]+/g, " ").replace(/\s+/g, " ");
			const matchSearch = !q || c.data.title.toLowerCase().includes(q) || bodyText.toLowerCase().includes(q);
			const matchTag = activeTag === "全部" || (c.data.tags || []).includes(activeTag);
			return matchSearch && matchTag;
		})
	);

	function fmtDate(d: Date): string {
		const date = new Date(d);
		return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
	}
</script>

<div class="chatter-container">
	<div class="chatter-header">
		<h1 class="chatter-title">杂谈</h1>
		<p class="chatter-desc">" 随笔杂谈，在代码之外捕捉思考的温度 "</p>
	</div>

	<div class="chatter-filters">
		<div class="search-wrap">
			<svg class="search-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
				<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
			</svg>
			<input
				type="text"
				placeholder="搜寻被遗忘的记忆..."
				bind:value={searchQuery}
				class="search-input"
			/>
		</div>

		{#if allTags.length > 1}
			<div class="tag-bar">
				{#each allTags as tag}
					<button
						class="tag-btn"
						class:active={activeTag === tag}
						onclick={() => (activeTag = tag)}
					>
						{tag === "全部" ? tag : `# ${tag}`}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	{#if filteredChatters.length > 0}
		<div class="masonry">
			{#each filteredChatters as chatter (chatter.id)}
				<div class="masonry-item">
					<a href={`/essays/${chatter.id}/`} class="masonry-card">
						{#if chatter.data.image}
							<div class="card-cover">
								<img src={chatter.data.image} alt="" class="cover-img" />
								<div class="cover-overlay"></div>
								{#if chatter.data.mood}
									<span class="mood-badge-cover">✨ {chatter.data.mood}</span>
								{/if}
							</div>
						{/if}

						<div class="card-body">
							<div class="card-meta">
								<span class="card-date">{fmtDate(chatter.data.published)}</span>
								{#if !chatter.data.image && chatter.data.mood}
									<span class="mood-badge-text">{chatter.data.mood}</span>
								{/if}
							</div>

							{#if chatter.data.title}
								<h3 class="card-title">{chatter.data.title}</h3>
							{/if}

							<div class="card-excerpt">
								{chatter.body || chatter.data.description || ""}
							</div>

							{#if chatter.data.tags && chatter.data.tags.length > 0}
								<div class="card-tags">
									{#each chatter.data.tags as t}
										<span class="card-tag">#{t}</span>
									{/each}
								</div>
							{/if}
						</div>
					</a>
				</div>
			{/each}
		</div>
	{:else}
		<div class="empty-state">
			<div class="empty-icon-wrap">
				<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
			</div>
			<h2>{searchQuery ? "没找到相关杂谈" : "还没有杂谈"}</h2>
			<p>{searchQuery ? "尝试精简你的搜索词，或者换个心情再次出发。" : "还没有记录下任何思考碎片呢。"}</p>
		</div>
	{/if}
</div>

<style>
	/* Container */
	.chatter-container {
		width: 100%;
		max-width: 80rem;
		margin: 0 auto;
		padding: 1.5rem 0.75rem;
	}
	@media (min-width: 640px) {
		.chatter-container { padding: 2.5rem 2.5rem; }
	}

	/* Header */
	.chatter-header {
		text-align: center;
		margin-bottom: 2rem;
	}
	@media (min-width: 768px) {
		.chatter-header { margin-bottom: 3.5rem; }
	}
	.chatter-title {
		font-size: 1.875rem;
		font-weight: 900;
		color: #0f172a;
		margin: 0 0 0.5rem;
		letter-spacing: -0.04em;
	}
	:global(.dark) .chatter-title { color: #fff; }
	@media (min-width: 768px) {
		.chatter-title { font-size: 3rem; }
	}
	.chatter-desc {
		font-size: 0.75rem;
		color: #64748b;
		font-weight: 500;
		font-style: italic;
		opacity: 0.8;
		margin: 0;
	}
	:global(.dark) .chatter-desc { color: #94a3b8; }
	@media (min-width: 768px) {
		.chatter-desc { font-size: 1rem; }
	}

	/* Filters */
	.chatter-filters {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
		margin-bottom: 2rem;
	}
	@media (min-width: 768px) {
		.chatter-filters { gap: 2rem; margin-bottom: 3rem; }
	}

	/* Search */
	.search-wrap {
		position: relative;
		width: 100%;
		max-width: 32rem;
	}
	.search-svg {
		position: absolute;
		left: 1rem;
		top: 50%;
		transform: translateY(-50%);
		color: #94a3b8;
		z-index: 10;
		width: 1rem;
		height: 1rem;
	}
	@media (min-width: 768px) {
		.search-svg { width: 1.5rem; height: 1.5rem; left: 1.25rem; }
	}
	.search-input {
		width: 100%;
		padding: 0.75rem 1rem 0.75rem 2.5rem;
		border-radius: 0.75rem;
		border: 1px solid rgba(255,255,255,0.4);
		background: rgba(255,255,255,0.4);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		font-size: 0.875rem;
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
	.search-input::placeholder { color: #94a3b8; font-weight: 500; }
	.search-input:focus {
		box-shadow: 0 0 0 2px color-mix(in oklch, var(--primary) 50%, transparent);
	}
	@media (min-width: 768px) {
		.search-input {
			padding: 1rem 1.5rem 1rem 3.5rem;
			border-radius: 1rem;
			font-size: 1rem;
		}
	}

	/* Tag bar */
	.tag-bar {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.4rem;
	}
	@media (min-width: 768px) {
		.tag-bar { gap: 0.5rem; }
	}
	.tag-btn {
		padding: 0.4rem 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid rgba(255,255,255,0.2);
		background: rgba(255,255,255,0.3);
		font-size: 0.625rem;
		font-weight: 900;
		color: #475569;
		cursor: pointer;
		transition: all 0.5s;
	}
	:global(.dark) .tag-btn {
		background: rgba(30,41,59,0.3);
		border-color: rgba(255,255,255,0.05);
		color: #94a3b8;
	}
	@media (min-width: 768px) {
		.tag-btn {
			padding: 0.5rem 1.25rem;
			border-radius: 0.75rem;
			font-size: 0.75rem;
		}
	}
	.tag-btn:hover {
		background: rgba(255,255,255,0.6);
	}
	:global(.dark) .tag-btn:hover {
		background: rgba(51,65,85,0.6);
	}
	.tag-btn.active {
		background: var(--primary);
		color: #fff;
		border-color: var(--primary);
		box-shadow: 0 4px 12px color-mix(in oklch, var(--primary) 30%, transparent);
		transform: scale(1.05);
	}
	@media (min-width: 768px) {
		.tag-btn.active {
			box-shadow: 0 4px 12px color-mix(in oklch, var(--primary) 30%, transparent);
		}
	}

	/* Masonry */
	.masonry {
		columns: 2;
		gap: 0.75rem;
	}
	@media (min-width: 1024px) {
		.masonry { columns: 3; gap: 1.5rem; }
	}
	.masonry-item {
		break-inside: avoid;
		margin-bottom: 0.75rem;
	}
	@media (min-width: 1024px) {
		.masonry-item { margin-bottom: 1.5rem; }
	}

	/* Card */
	.masonry-card {
		display: block;
		border-radius: 1rem;
		background: rgba(255,255,255,0.4);
		backdrop-filter: blur(16px);
		-webkit-backdrop-filter: blur(16px);
		border: 1px solid rgba(255,255,255,0.5);
		box-shadow: 0 4px 6px rgba(0,0,0,0.06);
		overflow: hidden;
		text-decoration: none;
		transition: all 0.5s;
	}
	:global(.dark) .masonry-card {
		background: rgba(30,41,59,0.4);
		border-color: rgba(255,255,255,0.05);
	}
	@media (min-width: 768px) {
		.masonry-card {
			border-radius: 2rem;
			box-shadow: 0 10px 15px rgba(0,0,0,0.08);
		}
	}
	.masonry-card:hover {
		box-shadow: 0 20px 25px rgba(0,0,0,0.15);
		transform: translateY(-2px);
	}
	:global(.dark) .masonry-card:hover {
		box-shadow: 0 20px 25px rgba(0,0,0,0.4);
	}

	/* Cover */
	.card-cover {
		width: 100%;
		height: 7rem;
		overflow: hidden;
		position: relative;
	}
	@media (min-width: 768px) {
		.card-cover { height: 13rem; }
	}
	.cover-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 1s ease;
	}
	.masonry-card:hover .cover-img {
		transform: scale(1.1);
	}
	.cover-overlay {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgba(15,23,42,0.6), transparent);
	}
	.mood-badge-cover {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		background: rgba(255,255,255,0.2);
		backdrop-filter: blur(12px);
		color: #fff;
		font-size: 0.5rem;
		font-weight: 900;
		padding: 0.25rem 0.5rem;
		border-radius: 9999px;
		border: 1px solid rgba(255,255,255,0.2);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}
	@media (min-width: 768px) {
		.mood-badge-cover {
			top: 1rem;
			right: 1rem;
			font-size: 0.625rem;
			padding: 0.4rem 0.75rem;
		}
	}

	/* Card body */
	.card-body {
		padding: 0.75rem;
	}
	@media (min-width: 768px) {
		.card-body { padding: 1.75rem; }
	}

	/* Card meta row */
	.card-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.5rem;
	}
	@media (min-width: 768px) {
		.card-meta { margin-bottom: 1rem; }
	}
	.card-date {
		font-size: 0.5rem;
		font-weight: 900;
		color: var(--primary);
		text-transform: uppercase;
		letter-spacing: 0.15em;
		background: color-mix(in oklch, var(--primary) 5%, transparent);
		padding: 0.15rem 0.4rem;
		border-radius: 0.3rem;
		border: 1px solid color-mix(in oklch, var(--primary) 10%, transparent);
	}
	:global(.dark) .card-date {
		color: var(--primary);
		background: color-mix(in oklch, var(--primary) 10%, transparent);
		border-color: color-mix(in oklch, var(--primary) 10%, transparent);
	}
	@media (min-width: 768px) {
		.card-date {
			font-size: 0.625rem;
			padding: 0.25rem 0.75rem;
			border-radius: 0.5rem;
		}
	}

	.mood-badge-text {
		font-size: 0.5rem;
		font-weight: 900;
		color: #ec4899;
		background: rgba(236,72,153,0.05);
		padding: 0.15rem 0.4rem;
		border-radius: 0.3rem;
		border: 1px solid rgba(236,72,153,0.1);
	}
	:global(.dark) .mood-badge-text {
		color: #f472b6;
		background: rgba(244,114,182,0.1);
		border-color: rgba(244,114,182,0.1);
	}
	@media (min-width: 768px) {
		.mood-badge-text {
			font-size: 0.625rem;
			padding: 0.25rem 0.75rem;
			border-radius: 0.5rem;
		}
	}

	/* Title */
	.card-title {
		font-size: 0.875rem;
		font-weight: 700;
		color: #1e293b;
		margin: 0 0 0.4rem;
		line-height: 1.25;
		transition: color 0.3s;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	:global(.dark) .card-title { color: #f1f5f9; }
	.masonry-card:hover .card-title { color: var(--primary); }
	:global(.dark) .masonry-card:hover .card-title { color: var(--primary); }
	@media (min-width: 768px) {
		.card-title {
			font-size: 1.25rem;
			margin-bottom: 1rem;
			-webkit-line-clamp: unset;
		}
	}

	/* Excerpt */
	.card-excerpt {
		font-size: 0.625rem;
		line-height: 1.4;
		color: #475569;
		display: -webkit-box;
		-webkit-line-clamp: 4;
		-webkit-box-orient: vertical;
		overflow: hidden;
		opacity: 0.9;
		font-style: italic;
		font-weight: 500;
	}
	:global(.dark) .card-excerpt { color: #94a3b8; }
	@media (min-width: 768px) {
		.card-excerpt {
			font-size: 0.875rem;
			line-height: 1.625;
			-webkit-line-clamp: 5;
		}
	}

	/* Tags */
	.card-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-top: 0.75rem;
	}
	@media (min-width: 768px) {
		.card-tags { gap: 0.5rem; margin-top: 1.5rem; }
	}
	.card-tag {
		font-size: 0.5rem;
		font-weight: 900;
		color: #64748b;
		background: rgba(100,116,139,0.05);
		padding: 0.15rem 0.4rem;
		border-radius: 0.3rem;
		border: 1px solid rgba(100,116,139,0.1);
		transition: all 0.3s;
	}
	:global(.dark) .card-tag {
		color: #94a3b8;
		background: rgba(255,255,255,0.05);
		border-color: rgba(255,255,255,0.05);
	}
	@media (min-width: 768px) {
		.card-tag {
			font-size: 0.55rem;
			padding: 0.25rem 0.6rem;
		}
	}
	.masonry-card:hover .card-tag {
		background: color-mix(in oklch, var(--primary) 10%, transparent);
		color: var(--primary);
	}

	/* Empty */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 4rem 2rem;
		text-align: center;
		background: rgba(255,255,255,0.3);
		backdrop-filter: blur(24px);
		border-radius: 2rem;
		border: 1px solid rgba(255,255,255,0.3);
	}
	:global(.dark) .empty-state {
		background: rgba(30,41,59,0.3);
		border-color: rgba(255,255,255,0.05);
	}
	.empty-icon-wrap {
		width: 5rem;
		height: 5rem;
		border-radius: 1.5rem;
		background: color-mix(in oklch, var(--primary) 10%, transparent);
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1.5rem;
		color: var(--primary);
	}
	.empty-state h2 {
		font-size: 1.5rem;
		font-weight: 800;
		color: #0f172a;
		margin: 0 0 0.5rem;
	}
	:global(.dark) .empty-state h2 { color: #f1f5f9; }
	.empty-state p {
		font-size: 0.9rem;
		color: #64748b;
		margin: 0;
	}
	:global(.dark) .empty-state p { color: #94a3b8; }
</style>

<script lang="ts">
	interface SearchItem {
		id: string;
		type: "post" | "chatter" | "essay";
		title: string;
		description?: string;
		tags?: string[];
	}

	let { items = [] }: { items: SearchItem[] } = $props();

	let query = $state("");
	let isOpen = $state(false);
	let inputRef: HTMLInputElement | undefined;

	function escapeRegExp(s: string) {
		return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	}

	let filtered = $derived(
		query.trim().length > 0
			? items
					.filter((item) => {
						const q = query.toLowerCase();
						return (
							item.title.toLowerCase().includes(q) ||
							(item.description || "").toLowerCase().includes(q) ||
							(item.tags || []).some((t) => t.toLowerCase().includes(q))
						);
					})
					.slice(0, 8)
			: [],
	);

	function getUrl(item: SearchItem): string {
		if (item.type === "post") return `/posts/${item.id}/`;
		if (item.type === "chatter") return `/chatter/${item.id}/`;
		if (item.type === "essay") return `/essays/${item.id}/`;
		return "/";
	}

	function typeLabel(type: string): string {
		if (type === "post") return "文章";
		if (type === "chatter") return "说说";
		if (type === "essay") return "杂谈";
		return "";
	}

	function highlight(text: string): string {
		if (!query.trim()) return text;
		const escaped = escapeRegExp(query);
		const regex = new RegExp(`(${escaped})`, "gi");
		return text.replace(regex, '<mark class="search-highlight">$1</mark>');
	}

	function handleClickOutside(e: MouseEvent) {
		const target = e.target as Node;
		const wrap = document.querySelector(".search-wrap");
		if (wrap && !wrap.contains(target)) {
			isOpen = false;
		}
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	});
</script>

<div class="search-wrap max-w-2xl mx-auto mb-10">
	<div class="search-box">
		<svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
			<circle cx="11" cy="11" r="8"></circle>
			<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
		</svg>
		<input
			type="text"
			bind:this={inputRef}
			bind:value={query}
			onfocus={() => (isOpen = true)}
			oninput={() => (isOpen = true)}
			placeholder="搜寻文章、说说、杂谈..."
			class="search-input"
		/>
	</div>

	{#if isOpen && query.trim()}
		<div class="search-dropdown">
			{#if filtered.length > 0}
				{#each filtered as item}
					<a href={getUrl(item)} class="search-result">
						<div class="result-header">
							<span class="result-type">{typeLabel(item.type)}</span>
							<span class="result-title">{@html highlight(item.title)}</span>
						</div>
						<div class="result-desc">
							{@html highlight(item.description || "")}
						</div>
						{#if item.tags?.length}
							<div class="result-tags">
								{#each item.tags as tag}
									<span class="result-tag">{tag}</span>
								{/each}
							</div>
						{/if}
					</a>
				{/each}
			{:else}
				<div class="search-empty">
					<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<circle cx="11" cy="11" r="8"></circle>
						<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
					</svg>
					<p>未发现关于 "{query}" 的踪迹</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.search-wrap {
		position: relative;
		width: 100%;
		max-width: 42rem;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 2.5rem;
		z-index: 100;
	}
	.search-box {
		position: relative;
	}
	.search-icon {
		position: absolute;
		left: 1.25rem;
		top: 50%;
		transform: translateY(-50%);
		color: #94a3b8;
		z-index: 10;
	}
	:global(.dark) .search-icon {
		color: #64748b;
	}
	.search-input {
		width: 100%;
		padding: 1rem 1.5rem 1rem 3.5rem;
		border-radius: 1.5rem;
		border: 1px solid rgba(255,255,255,0.4);
		background: rgba(255,255,255,0.5);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		font-size: 1.125rem;
		font-weight: 500;
		outline: none;
		transition: all 0.3s;
		color: #1e293b;
		box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
	}
	:global(.dark) .search-input {
		background: rgba(30,41,59,0.5);
		border-color: rgba(255,255,255,0.1);
		color: #e2e8f0;
	}
	.search-input::placeholder {
		color: #94a3b8;
	}
	:global(.dark) .search-input::placeholder {
		color: #64748b;
	}
	.search-input:focus {
		box-shadow: 0 0 0 2px color-mix(in oklch, var(--primary) 50%, transparent);
		border-color: color-mix(in oklch, var(--primary) 30%, transparent);
	}

	.search-dropdown {
		position: absolute;
		top: calc(100% + 0.5rem);
		left: 0;
		right: 0;
		background: rgba(255,255,255,0.95);
		backdrop-filter: blur(24px);
		-webkit-backdrop-filter: blur(24px);
		border-radius: 1.25rem;
		border: 1px solid rgba(255,255,255,0.4);
		box-shadow: 0 20px 50px rgba(0,0,0,0.15);
		max-height: 60vh;
		overflow-y: auto;
		z-index: 50;
		padding: 0.5rem;
	}
	:global(.dark) .search-dropdown {
		background: rgba(15,23,42,0.95);
		border-color: rgba(255,255,255,0.1);
		box-shadow: 0 20px 50px rgba(0,0,0,0.4);
	}

	.search-dropdown::-webkit-scrollbar {
		width: 6px;
	}
	.search-dropdown::-webkit-scrollbar-track {
		background: transparent;
	}
	.search-dropdown::-webkit-scrollbar-thumb {
		background: #cbd5e1;
		border-radius: 9999px;
	}
	.search-dropdown::-webkit-scrollbar-thumb:hover {
		background: #94a3b8;
	}
	:global(.dark) .search-dropdown::-webkit-scrollbar-thumb {
		background: #475569;
	}
	:global(.dark) .search-dropdown::-webkit-scrollbar-thumb:hover {
		background: #64748b;
	}

	.search-result {
		display: block;
		padding: 0.75rem 1rem;
		border-radius: 0.75rem;
		text-decoration: none;
		transition: background 0.15s;
	}
	.search-result:hover {
		background: color-mix(in oklch, var(--primary) 6%, transparent);
	}
	:global(.dark) .search-result:hover {
		background: color-mix(in oklch, var(--primary) 12%, transparent);
	}
	.result-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.result-type {
		font-size: 0.625rem;
		font-weight: 800;
		padding: 0.1rem 0.4rem;
		border-radius: 0.25rem;
		background: var(--primary);
		color: #fff;
		flex-shrink: 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.result-title {
		font-weight: 700;
		font-size: 0.95rem;
		color: #0f172a;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	:global(.dark) .result-title {
		color: #f1f5f9;
	}
	.result-desc {
		font-size: 0.8rem;
		color: #475569;
		margin-top: 0.25rem;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	:global(.dark) .result-desc {
		color: #94a3b8;
	}
	.result-tags {
		display: flex;
		gap: 0.35rem;
		margin-top: 0.4rem;
	}
	.result-tag {
		font-size: 0.65rem;
		padding: 0.1rem 0.4rem;
		border-radius: 9999px;
		background: #f1f5f9;
		color: var(--primary);
	}
	:global(.dark) .result-tag {
		background: #1e293b;
		color: var(--primary);
	}

	.search-highlight {
		background: #fde047;
		color: #000;
		border-radius: 2px;
		padding: 0 2px;
	}
	:global(.dark) .search-highlight {
		background: #facc15;
		color: #000;
	}

	.search-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem;
		color: #94a3b8;
		gap: 0.5rem;
	}
	:global(.dark) .search-empty {
		color: #64748b;
	}
</style>

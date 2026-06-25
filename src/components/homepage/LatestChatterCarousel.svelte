<script lang="ts">
	interface Chatter {
		id: string;
		data: {
			title: string;
			description?: string;
			image?: string;
			published: Date;
		};
		formattedDate?: string;
	}

	let { chatters = [] }: { chatters: Chatter[] } = $props();

	let currentIndex = $state(0);
	let interval: ReturnType<typeof setInterval>;

	function formatDate(d: Date | string) {
		const date = new Date(d);
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, "0");
		const day = String(date.getDate()).padStart(2, "0");
		return `${y}.${m}.${day}`;
	}

	$effect(() => {
		if (chatters.length <= 1) return;
		interval = setInterval(() => {
			currentIndex = (currentIndex + 1) % chatters.length;
		}, 6000);
		return () => clearInterval(interval);
	});
</script>

{#if chatters.length > 0}
	{@const chatter = chatters[currentIndex]}
	{@const bgImage = chatter.data.image || ""}
	{@const slug = chatter.id === "none" ? "/chatter/" : `/chatter/${chatter.id}/`}

	<a href={slug} class="chatter-card">
		{#if bgImage}
			<img src={bgImage} alt="" class="chatter-bg" />
		{/if}
		<div class="chatter-overlay"></div>
		<div class="chatter-content">
			<div class="chatter-badge-row">
				<span class="badge">Records</span>
				<span class="date">{chatter.formattedDate || formatDate(chatter.data.published)}</span>
			</div>
			<h3 class="chatter-title">{chatter.data.title}</h3>
			<p class="chatter-desc">{chatter.data.description || ""}</p>
		</div>
		{#if chatters.length > 1}
			<div class="chatter-dots">
				{#each chatters as _, i}
					<button
						class="dot"
						class:active={i === currentIndex}
						aria-label="第 {i + 1} 条说说"
						onclick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							currentIndex = i;
							clearInterval(interval);
							interval = setInterval(() => {
								currentIndex = (currentIndex + 1) % chatters.length;
							}, 6000);
						}}
					></button>
				{/each}
			</div>
		{/if}
	</a>
{/if}

<style>
.chatter-card {
	display: block;
	position: relative;
	min-height: 220px;
	width: 100%;
	height: 100%;
	border-radius: 1.5rem;
	overflow: hidden;
	text-decoration: none;
	box-shadow: 0 10px 40px rgba(0,0,0,0.1);
	transition: transform 0.4s ease, box-shadow 0.4s ease;
}
.chatter-card:hover {
	transform: scale(1.02);
	box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.chatter-bg {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	transition: transform 0.6s ease;
}
.chatter-card:hover .chatter-bg {
	transform: scale(1.05);
}
.chatter-overlay {
	position: absolute;
	inset: 0;
	background: linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.1) 100%);
	transition: background 0.4s ease;
}
.chatter-card:hover .chatter-overlay {
	background: linear-gradient(to right, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.05) 100%);
}
.chatter-content {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 1.5rem;
	pointer-events: none;
}
.chatter-badge-row {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	margin-bottom: 0.5rem;
}
.badge {
	font-size: 0.65rem;
	font-weight: 600;
	padding: 0.2rem 0.5rem;
	border-radius: 9999px;
	background: rgba(167,139,250,0.3);
	color: #ddd6fe;
	text-transform: uppercase;
	letter-spacing: 0.05em;
}
.date {
	font-size: 0.75rem;
	color: rgba(255,255,255,0.6);
}
.chatter-title {
	font-size: 1.25rem;
	font-weight: 800;
	color: white;
	margin: 0 0 0.4rem;
	text-shadow: 0 2px 8px rgba(0,0,0,0.4);
}
.chatter-desc {
	font-size: 0.8rem;
	color: rgba(255,255,255,0.7);
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
	margin: 0;
}

.chatter-dots {
	position: absolute;
	bottom: 0.75rem;
	right: 0.75rem;
	display: flex;
	gap: 0.35rem;
}
.dot {
	height: 5px;
	border-radius: 9999px;
	border: none;
	cursor: pointer;
	transition: all 0.3s;
	background: rgba(255,255,255,0.5);
	width: 7px;
}
.dot.active {
	width: 20px;
	background: #a78bfa;
}
</style>

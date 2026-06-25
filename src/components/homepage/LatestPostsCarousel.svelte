<script lang="ts">
	interface Post {
		id: string;
		data: {
			title: string;
			description?: string;
			image?: string;
			published: Date;
		};
		formattedDate?: string;
	}

	let { posts = [] }: { posts: Post[] } = $props();

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
		if (posts.length <= 1) return;
		interval = setInterval(() => {
			currentIndex = (currentIndex + 1) % posts.length;
		}, 5000);
		return () => clearInterval(interval);
	});
</script>

{#if posts.length > 0}
	{@const post = posts[currentIndex]}
	{@const bgImage = post.data.image || ""}
	{@const slug = post.id === "none" ? "#" : `/posts/${post.id}/`}

	<a href={slug} class="carousel-card">
		{#if bgImage}
			<img src={bgImage} alt="" class="carousel-bg" />
		{/if}
		<div class="carousel-overlay"></div>
		<div class="carousel-content">
			<div class="carousel-badge-row">
				<span class="badge">Latest Insight</span>
				<span class="date">{post.formattedDate || formatDate(post.data.published)}</span>
			</div>
			<h3 class="carousel-title">{post.data.title}</h3>
			<p class="carousel-desc">{post.data.description || ""}</p>
		</div>
		{#if posts.length > 1}
			<div class="carousel-dots">
				{#each posts as _, i}
					<button
						class="dot"
						class:active={i === currentIndex}
						aria-label="第 {i + 1} 篇文章"
						onclick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							currentIndex = i;
							clearInterval(interval);
							interval = setInterval(() => {
								currentIndex = (currentIndex + 1) % posts.length;
							}, 5000);
						}}
					></button>
				{/each}
			</div>
		{/if}
	</a>
{/if}

<style>
.carousel-card {
	display: block;
	position: relative;
	min-height: 420px;
	border-radius: 1.5rem;
	overflow: hidden;
	text-decoration: none;
	box-shadow: 0 10px 40px rgba(0,0,0,0.1);
	transition: transform 0.4s ease, box-shadow 0.4s ease;
}
.carousel-card:hover {
	transform: scale(1.015);
	box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.carousel-bg {
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	object-fit: cover;
	transition: transform 0.6s ease;
}
.carousel-card:hover .carousel-bg {
	transform: scale(1.05);
}
.carousel-overlay {
	position: absolute;
	inset: 0;
	background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%);
	transition: background 0.4s ease;
}
.carousel-card:hover .carousel-overlay {
	background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%);
}
.carousel-content {
	position: absolute;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 2rem;
	pointer-events: none;
}
.carousel-badge-row {
	display: flex;
	align-items: center;
	gap: 0.75rem;
	margin-bottom: 0.75rem;
}
.badge {
	font-size: 0.7rem;
	font-weight: 600;
	padding: 0.2rem 0.6rem;
	border-radius: 9999px;
	background: color-mix(in oklch, var(--primary) 30%, transparent);
	color: #c7d2fe;
	text-transform: uppercase;
	letter-spacing: 0.05em;
}
.date {
	font-size: 0.8rem;
	color: rgba(255,255,255,0.6);
}
.carousel-title {
	font-size: 1.5rem;
	font-weight: 800;
	color: white;
	margin: 0 0 0.5rem;
	text-shadow: 0 2px 8px rgba(0,0,0,0.4);
}
.carousel-desc {
	font-size: 0.85rem;
	color: rgba(255,255,255,0.7);
	display: -webkit-box;
	-webkit-line-clamp: 3;
	-webkit-box-orient: vertical;
	overflow: hidden;
	margin: 0;
}

.carousel-dots {
	position: absolute;
	bottom: 1rem;
	right: 1rem;
	display: flex;
	gap: 0.4rem;
}
.dot {
	height: 6px;
	border-radius: 9999px;
	border: none;
	cursor: pointer;
	transition: all 0.3s;
	background: rgba(255,255,255,0.5);
	width: 8px;
}
.dot.active {
	width: 24px;
	background: var(--primary);
}
</style>

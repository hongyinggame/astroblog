<script lang="ts">
	interface Petal {
		id: number;
		left: string;
		size: number;
		duration: number;
		delay: number;
	}

	let petals: Petal[] = $state([]);

	$effect(() => {
		petals = Array.from({ length: 40 }).map((_, i) => ({
			id: i,
			left: `${Math.random() * 100}%`,
			size: 8 + Math.random() * 12,
			duration: 6 + Math.random() * 8,
			delay: Math.random() * -15,
		}));
	});
</script>

<div class="sakura-container">
	{#each petals as p (p.id)}
		<div
			class="sakura-petal"
			style="left:{p.left};width:{p.size}px;height:{p.size * 1.2}px;animation:sakuraFall {p.duration}s linear infinite;animation-delay:{p.delay}s"
		></div>
	{/each}
</div>

<style>
	.sakura-container {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		z-index: 5;
	}
	.sakura-petal {
		position: absolute;
		top: -10vh;
		background: rgba(249, 168, 212, 0.7);
		border-radius: 100% 0 100% 0;
		box-shadow: 0 0 5px rgba(255, 182, 193, 0.6);
	}

	:global {
		@keyframes sakuraFall {
			0% {
				transform: translate(0, 0) rotate(0deg);
				opacity: 0;
			}
			10% { opacity: 1; }
			80% { opacity: 1; }
			100% {
				transform: translate(15vw, 110vh) rotate(360deg);
				opacity: 0;
			}
		}
	}
</style>

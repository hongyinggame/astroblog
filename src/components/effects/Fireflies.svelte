<script lang="ts">
	interface Firefly {
		id: number;
		top: string;
		left: string;
		size: number;
		hue: number;
		breatheDuration: number;
		breatheDelay: number;
		floatDuration: number;
		floatDelay: number;
		floatPath: string;
	}

	let flies: Firefly[] = $state([]);

	$effect(() => {
		flies = Array.from({ length: 50 }).map((_, i) => ({
			id: i,
			top: `${Math.random() * 100}%`,
			left: `${Math.random() * 100}%`,
			size: 3 + Math.random() * 4,
			hue: Math.floor(Math.random() * 360),
			breatheDuration: 3 + Math.random() * 5,
			breatheDelay: Math.random() * -10,
			floatDuration: 15 + Math.random() * 20,
			floatDelay: Math.random() * -20,
			floatPath: `float${Math.floor(Math.random() * 4) + 1}`,
		}));
	});
</script>

<div class="firefly-container">
	{#each flies as fly (fly.id)}
		<div
			class="firefly-outer"
			style="top:{fly.top};left:{fly.left};animation:{fly.floatPath} {fly.floatDuration}s ease-in-out infinite;animation-delay:{fly.floatDelay}s"
		>
			<div
				class="firefly-inner"
				style="width:{fly.size}px;height:{fly.size}px;background-color:hsla({fly.hue},80%,70%,0.9);--glow-outer:hsla({fly.hue},80%,65%,0.8);--glow-inner:hsla({fly.hue},80%,55%,0.4);animation:fireflyBreathe {fly.breatheDuration}s ease-in-out infinite;animation-delay:{fly.breatheDelay}s"
			></div>
		</div>
	{/each}
</div>

<style>
	.firefly-container {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
		mix-blend-mode: screen;
		z-index: 5;
	}
	.firefly-outer {
		position: absolute;
	}
	.firefly-inner {
		border-radius: 50%;
	}

	:global {
		@keyframes fireflyBreathe {
			0%, 100% {
				opacity: 0;
				transform: scale(0.3);
			}
			50% {
				opacity: 1;
				transform: scale(1.2);
				box-shadow: 0 0 10px 3px var(--glow-outer), 0 0 20px 6px var(--glow-inner);
			}
		}

		@keyframes float1 {
			0%, 100% { transform: translate(0, 0); }
			33% { transform: translate(10vw, -15vh); }
			66% { transform: translate(-5vw, -20vh); }
		}
		@keyframes float2 {
			0%, 100% { transform: translate(0, 0); }
			33% { transform: translate(-12vw, 10vh); }
			66% { transform: translate(8vw, 15vh); }
		}
		@keyframes float3 {
			0%, 100% { transform: translate(0, 0); }
			33% { transform: translate(15vw, 15vh); }
			66% { transform: translate(-10vw, 5vh); }
		}
		@keyframes float4 {
			0%, 100% { transform: translate(0, 0); }
			33% { transform: translate(-15vw, -10vh); }
			66% { transform: translate(10vw, -15vh); }
		}
	}
</style>

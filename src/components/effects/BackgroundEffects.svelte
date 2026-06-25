<script lang="ts">
	import Fireflies from "./Fireflies.svelte";
	import Sakura from "./Sakura.svelte";
</script>

<div class="effects-wrapper">
	<div class="fireflies-layer">
		<Fireflies />
	</div>
	<div class="sakura-layer">
		<Sakura />
	</div>
</div>

<style>
	.effects-wrapper {
		position: fixed;
		inset: 0;
		pointer-events: none;
		z-index: 10;
		overflow: hidden;
	}

	/* 萤火虫：暗色模式可见 */
	.fireflies-layer {
		opacity: 0;
		transition: opacity 1s ease;
	}
	:global(.dark) .fireflies-layer {
		opacity: 1;
	}

	/* 樱花：亮色模式可见 */
	.sakura-layer {
		opacity: 1;
		transition: opacity 1s ease;
	}
	:global(.dark) .sakura-layer {
		opacity: 0;
	}
</style>

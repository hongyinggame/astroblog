<script lang="ts">
	import { setTheme, getStoredTheme, getSystemTheme } from "@/utils/setting-utils";
	import { DARK_MODE, LIGHT_MODE, SYSTEM_MODE } from "@constants/constants";

	let isDark = $state(false);

	function syncFromStore() {
		const stored = getStoredTheme();
		if (stored === SYSTEM_MODE) {
			isDark = getSystemTheme() === DARK_MODE;
		} else {
			isDark = stored === DARK_MODE;
		}
	}

	function toggleTheme() {
		setTheme(isDark ? LIGHT_MODE : DARK_MODE);
		window.dispatchEvent(new CustomEvent("theme-change"));
	}

	$effect(() => {
		syncFromStore();

		function onThemeChange() {
			syncFromStore();
		}
		window.addEventListener("theme-change", onThemeChange);
		return () => window.removeEventListener("theme-change", onThemeChange);
	});
</script>

<button class="theme-card" onclick={toggleTheme}>
	<div class="theme-icon-wrap">
		<div class="theme-icon-layer light-layer" class:active={!isDark}>
			<span aria-hidden="true">🌸</span>
		</div>
		<div class="theme-icon-layer dark-layer" class:active={isDark}>
			<span aria-hidden="true">✨</span>
		</div>
	</div>
	<div class="theme-text">
		<p class="theme-label">{isDark ? "夜间模式" : "日间模式"}</p>
		<p class="theme-sub">{isDark ? "流萤飞舞的深空" : "落樱漫舞的清晨"}</p>
	</div>
</button>

<style>
.theme-card {
	width: 100%;
	height: 100%;
	border-radius: 1.5rem;
	border: 1px solid rgba(255,255,255,0.4);
	background: rgba(255,255,255,0.5);
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	cursor: pointer;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	padding: 1.5rem;
	transition: all 0.3s;
	box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
}
:global(.dark) .theme-card {
	background: rgba(30,41,59,0.5);
	border-color: rgba(255,255,255,0.1);
	box-shadow: 0 20px 25px -5px rgba(0,0,0,0.35), 0 8px 10px -6px rgba(0,0,0,0.25);
}
.theme-card:hover {
	transform: scale(1.05);
}
.theme-icon-wrap {
	width: 5rem;
	height: 5rem;
	border-radius: 50%;
	overflow: hidden;
	position: relative;
}
.light-layer {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 2rem;
	background: linear-gradient(to top right, #7dd3fc, #fde047);
	transition: transform 0.5s ease;
	transform: translateY(0);
}
.light-layer.active {
	transform: translateY(0);
}
.light-layer:not(.active) {
	transform: translateY(-100%);
}

.dark-layer {
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 2rem;
	background: linear-gradient(to top right, #4338ca, #1e293b);
	transition: transform 0.5s ease;
	transform: translateY(100%);
}
.dark-layer.active {
	transform: translateY(0);
}
.dark-layer:not(.active) {
	transform: translateY(100%);
}

.theme-label {
	font-weight: 800;
	font-size: 1.1rem;
	margin: 0;
	transition: color 0.3s;
}
:global(.dark) .theme-label { color: #f1f5f9; }
.theme-sub {
	font-size: 0.75rem;
	color: #94a3b8;
	margin: 0;
}
:global(.dark) .theme-sub { color: #64748b; }
</style>

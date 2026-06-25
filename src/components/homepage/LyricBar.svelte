<script lang="ts">
	import { musicStore } from "@/lib/music-store";

	let displayedLyric = $state("");
	let typingIndex = $state(0);
	let typingTimer: ReturnType<typeof setInterval>;

	$effect(() => {
		const lyric = $musicStore.currentLyric;
		if (lyric) {
			typingIndex = 0;
			displayedLyric = "";
			clearInterval(typingTimer);
			typingTimer = setInterval(() => {
				typingIndex++;
				if (typingIndex <= lyric.length) {
					displayedLyric = lyric.slice(0, typingIndex);
				} else {
					clearInterval(typingTimer);
				}
			}, 50);
		} else {
			displayedLyric = "";
		}
		return () => clearInterval(typingTimer);
	});
</script>

{#if $musicStore.currentSong}
	<div class="lyric-bar">
		<div class="waveform">
			{#each [0,1,2,3,4] as i}
				<span
					class="wave-bar"
					class:playing={$musicStore.isPlaying}
					style="animation-delay:{i * 0.15}s"
				></span>
			{/each}
		</div>
		<div class="lyric-center">
			<span class="lyric-text" class:empty={!displayedLyric}>
				{displayedLyric || "♪ 暂无歌词 ♪"}
			</span>
			{#if displayedLyric}
				<span class="cursor-blink">|</span>
			{/if}
		</div>
		<div class="music-icon" class:playing={$musicStore.isPlaying}>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
				<path d="M9 18V5l12-2v13"/>
				<circle cx="6" cy="18" r="3"/>
				<circle cx="18" cy="16" r="3"/>
			</svg>
		</div>
	</div>
{/if}

<style>
.lyric-bar {
	display: flex;
	align-items: center;
	gap: 1.5rem;
	padding: 0 1.5rem;
	height: 5rem;
	background: rgba(15,23,42,0.85);
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
	border-radius: 1.5rem;
	border: 1px solid rgba(255,255,255,0.05);
}
:global(.dark) .lyric-bar {
	background: rgba(2,6,23,0.9);
}
.waveform {
	display: flex;
	align-items: flex-end;
	gap: 3px;
	height: 28px;
}
.wave-bar {
	width: 3px;
	border-radius: 3px;
	background: var(--primary);
	height: 8px;
	transition: height 0.3s ease;
}
.wave-bar.playing {
	animation: wave-anim 1s ease-in-out infinite;
}
.wave-bar:nth-child(1) { animation-delay: 0s; }
.wave-bar:nth-child(2) { animation-delay: 0.15s; }
.wave-bar:nth-child(3) { animation-delay: 0.3s; }
.wave-bar:nth-child(4) { animation-delay: 0.15s; }
.wave-bar:nth-child(5) { animation-delay: 0s; }

@keyframes wave-anim {
	0%, 100% { height: 8px; }
	50% { height: 28px; }
}

.lyric-center {
	flex: 1;
	display: flex;
	align-items: center;
	min-width: 0;
}
.lyric-text {
	font-size: 0.95rem;
	color: #e2e8f0;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	text-shadow: 0 0 8px color-mix(in oklch, var(--primary) 80%, transparent);
}
.lyric-text.empty {
	color: #64748b;
	text-shadow: none;
}
.cursor-blink {
	color: var(--primary);
	margin-left: 1px;
	animation: blink 0.8s step-end infinite;
}
@keyframes blink {
	50% { opacity: 0; }
}

.music-icon {
	color: #64748b;
	flex-shrink: 0;
	transition: all 0.3s;
}
.music-icon.playing {
	color: var(--primary);
	animation: bounce 0.6s ease-in-out infinite;
}
@keyframes bounce {
	0%, 100% { transform: translateY(0); }
	50% { transform: translateY(-4px); }
}
</style>

<script lang="ts">
	interface Track {
		name: string;
		artist: string;
		url: string;
		pic: string;
		lrc?: string;
	}

	let isPlaying = $state(false);
	let currentSong = $state<Track | null>(null);
	let currentTime = $state(0);
	let duration = $state(0);
	let progress = $state(0);
	let currentLyric = $state("");
	let lyricLines: { time: number; text: string }[] = $state([]);
	let isLoading = $state(true);

	let displayedLyric = $state("");
	let lyricTimer: ReturnType<typeof setInterval>;

	function typeLyric(text: string) {
		let idx = 0;
		displayedLyric = "";
		clearInterval(lyricTimer);
		if (!text) return;
		lyricTimer = setInterval(() => {
			idx++;
			if (idx <= text.length) {
				displayedLyric = text.slice(0, idx);
			} else {
				clearInterval(lyricTimer);
			}
		}, 50);
	}

	function getMgr() {
		return (window as any).__fireflyMusic;
	}

	$effect(() => {
		const mgr = getMgr();
		if (!mgr) {
			isLoading = false;
			return;
		}

		const s = mgr.getState();
		if (s.initialized) {
			isLoading = false;
			currentSong = s.track;
			isPlaying = s.isPlaying;
			currentTime = s.currentTime;
			duration = s.duration;
			progress = s.progress;
			lyricLines = s.lyrics || [];
			if (s.currentLrcIndex >= 0 && s.lyrics[s.currentLrcIndex]) {
				currentLyric = s.lyrics[s.currentLrcIndex].text;
				typeLyric(currentLyric);
			}
		} else {
			mgr.init();
		}

		function onInit(e: CustomEvent) {
			isLoading = false;
			if (!e.detail.playlist?.length) {
				currentSong = null;
			}
		}
		function onTrack(e: CustomEvent) {
			currentSong = e.detail.track;
			displayedLyric = "";
			currentLyric = "";
			lyricLines = [];
		}
		function onPlayState(e: CustomEvent) {
			isPlaying = e.detail.isPlaying;
		}
		function onTime(e: CustomEvent) {
			currentTime = e.detail.currentTime;
			duration = e.detail.duration;
			progress = e.detail.progress;
		}
		function onLyrics(e: CustomEvent) {
			lyricLines = e.detail.lyrics || [];
		}
		function onLrcIndex(e: CustomEvent) {
			const idx = e.detail.index;
			if (idx >= 0 && lyricLines[idx]) {
				const text = lyricLines[idx].text;
				if (text !== currentLyric) {
					currentLyric = text;
					typeLyric(text);
				}
			}
		}

		window.addEventListener("fm:init", onInit);
		window.addEventListener("fm:track", onTrack);
		window.addEventListener("fm:play-state", onPlayState);
		window.addEventListener("fm:time", onTime);
		window.addEventListener("fm:lyrics", onLyrics);
		window.addEventListener("fm:lrc-index", onLrcIndex);

		return () => {
			window.removeEventListener("fm:init", onInit);
			window.removeEventListener("fm:track", onTrack);
			window.removeEventListener("fm:play-state", onPlayState);
			window.removeEventListener("fm:time", onTime);
			window.removeEventListener("fm:lyrics", onLyrics);
			window.removeEventListener("fm:lrc-index", onLrcIndex);
			clearInterval(lyricTimer);
		};
	});

	function fmtTime(s: number) {
		if (!s || isNaN(s)) return "00:00";
		const m = Math.floor(s / 60).toString().padStart(2, "0");
		const sec = Math.floor(s % 60).toString().padStart(2, "0");
		return `${m}:${sec}`;
	}

	function handleSeek(e: Event) {
		const target = e.target as HTMLInputElement;
		const val = parseFloat(target.value);
		getMgr()?.seek(val / 100);
	}
</script>

<div
	class="player-card"
	class:has-song={currentSong && !isLoading}
	role="button"
	tabindex="0"
	onclick={() => { window.location.href = '/music/'; }}
	onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.location.href = '/music/'; } }}
>
	<!-- Loading -->
	{#if isLoading}
		<div class="player-loading">
			<div class="spinner"></div>
			<span class="loading-text">CONNECTING...</span>
		</div>

	<!-- Empty -->
	{:else if !currentSong}
		<div class="player-empty">
			<div class="empty-icon-wrap">
				<svg class="empty-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
			</div>
			<span class="empty-title">No Music Available</span>
			<span class="empty-sub">请检查播放列表或网络连接</span>
		</div>

	<!-- Playing -->
	{:else}
		<!-- Glow positioned at top-right (reference style) -->
		<div class="glow" class:active={isPlaying}></div>

		<!-- Cover + Info row -->
		<div class="top-row">
			<div class="cover-wrap" class:spinning={isPlaying}>
				<img src={currentSong.pic || ""} alt={currentSong.name} class="cover-img" />
				<div class="cover-overlay"></div>
				<div class="vinyl-center"></div>
			</div>

			<div class="info">
				<span class="badge-src">Cloud Music</span>
				<h3 class="song-name">{currentSong.name}</h3>
				<p class="artist">{currentSong.artist}</p>
			</div>
		</div>

		<!-- Lyric -->
		<div class="lyric-wrap">
			<p class="lyric-text">{displayedLyric || currentLyric || "♪"}</p>
		</div>

		<!-- Progress + Controls -->
		<div class="bottom-row">
			<div
				class="progress-row"
			>
				<span class="time">{fmtTime(currentTime)}</span>
				<input
					type="range"
					min="0"
					max="100"
					value={progress}
					oninput={handleSeek}
					class="progress-bar"
				/>
				<span class="time">{fmtTime(duration)}</span>
			</div>

			<div class="btn-row">
				<button class="ctrl-btn" onclick={(e) => { e.stopPropagation(); getMgr()?.playPrev(); }} aria-label="上一首">
					<svg class="ctrl-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
				</button>

				<button class="ctrl-btn play-btn" onclick={(e) => { e.stopPropagation(); getMgr()?.togglePlay(); }} aria-label={isPlaying ? "暂停" : "播放"}>
					{#if isPlaying}
						<svg class="play-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
					{:else}
						<svg class="play-icon ml-px" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
					{/if}
				</button>

				<button class="ctrl-btn" onclick={(e) => { e.stopPropagation(); getMgr()?.playNext(); }} aria-label="下一首">
					<svg class="ctrl-icon" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.player-card {
		border-radius: 1.5rem;
		background: rgba(255,255,255,0.4);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgba(255,255,255,0.4);
		box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
		padding: 1.5rem;
		cursor: pointer;
		position: relative;
		overflow: hidden;
		transition: all 0.7s;
	}
	:global(.dark) .player-card {
		background: rgba(30,41,59,0.5);
		border-color: rgba(255,255,255,0.1);
		box-shadow: 0 20px 25px -5px rgba(0,0,0,0.35), 0 8px 10px -6px rgba(0,0,0,0.25);
	}
	.player-card:hover {
		transform: scale(1.02);
	}

	/* Glow — reference: positioned top-right */
	.glow {
		position: absolute;
		top: -5rem;
		right: -5rem;
		width: 12rem;
		height: 12rem;
		border-radius: 50%;
		background: color-mix(in oklch, var(--primary) 20%, transparent);
		filter: blur(50px);
		transition: opacity 1s;
		opacity: 0.3;
	}
	.glow.active { opacity: 1; }

	/* Loading */
	.player-loading, .player-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.player-loading { gap: 1rem; }
	.spinner {
		width: 2.5rem;
		height: 2.5rem;
		border: 4px solid color-mix(in oklch, var(--primary) 20%, transparent);
		border-top-color: var(--primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	@keyframes spin { to { transform: rotate(360deg); } }
	.loading-text {
		color: #1e293b;
		font-weight: 700;
		letter-spacing: 0.1em;
		font-size: 0.875rem;
	}
	:global(.dark) .loading-text { color: #fff; }

	/* Empty */
	.player-empty { gap: 0.75rem; }
	.empty-icon-wrap {
		width: 4rem;
		height: 4rem;
		border-radius: 50%;
		background: #e2e8f0;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
		opacity: 0.5;
	}
	:global(.dark) .empty-icon-wrap { background: #334155; }
	.empty-icon {
		width: 2rem;
		height: 2rem;
		color: #94a3b8;
	}
	.empty-title {
		font-size: 0.75rem;
		font-weight: 700;
		color: #64748b;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	:global(.dark) .empty-title { color: #94a3b8; }
	.empty-sub {
		font-size: 0.625rem;
		color: #94a3b8;
	}
	:global(.dark) .empty-sub { color: #64748b; }

	/* Playing layout */
	.has-song {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	/* Cover + Info row */
	.top-row {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		position: relative;
		z-index: 10;
		margin-bottom: 1.5rem;
		margin-top: 0.5rem;
	}

	.cover-wrap {
		width: 5rem;
		height: 5rem;
		border-radius: 50%;
		border: 2px solid rgba(255,255,255,0.5);
		box-shadow: 0 4px 20px rgba(0,0,0,0.2);
		flex-shrink: 0;
		overflow: hidden;
		position: relative;
		animation: spin-cover 6s linear infinite;
		animation-play-state: paused;
		will-change: transform;
	}
	:global(.dark) .cover-wrap {
		border-color: rgba(255,255,255,0.15);
		box-shadow: 0 4px 20px rgba(0,0,0,0.4);
	}
	.cover-wrap.spinning { animation-play-state: running; }
	@keyframes spin-cover { to { transform: rotate(360deg); } }

	.cover-img {
		width: 100%;
		object-fit: cover;
	}
	.cover-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0,0,0,0.1);
	}
	.vinyl-center {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 1.25rem;
		height: 1.25rem;
		border-radius: 50%;
		background: rgba(255,255,255,0.8);
		backdrop-filter: blur(4px);
		border: 1px solid rgba(0,0,0,0.1);
		box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
	}
	:global(.dark) .vinyl-center {
		background: rgba(255,255,255,0.15);
		border-color: rgba(255,255,255,0.1);
		box-shadow: inset 0 1px 3px rgba(0,0,0,0.3);
	}

	/* Info */
	.info {
		flex: 1;
		overflow: hidden;
	}
	.badge-src {
		font-size: 0.625rem;
		font-weight: 900;
		color: var(--primary);
		letter-spacing: 0.1em;
		text-transform: uppercase;
		background: rgba(255,255,255,0.5);
		padding: 0.125rem 0.5rem;
		border-radius: 0.125rem;
		box-shadow: 0 1px 2px rgba(0,0,0,0.05);
		display: inline-block;
		margin-bottom: 0.25rem;
	}
	:global(.dark) .badge-src {
		background: rgba(15,23,42,0.5);
		color: var(--primary);
		box-shadow: 0 1px 3px rgba(0,0,0,0.2);
	}
	.song-name {
		font-size: 1.25rem;
		font-weight: 700;
		color: #0f172a;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		filter: drop-shadow(0 1px 1px rgba(0,0,0,0.05));
		margin: 0;
	}
	:global(.dark) .song-name { color: #fff; }
	.artist {
		font-size: 0.875rem;
		font-weight: 500;
		color: #334155;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		filter: drop-shadow(0 1px 1px rgba(0,0,0,0.05));
		margin: 0;
	}
	:global(.dark) .artist { color: #cbd5e1; }

	/* Lyric */
	.lyric-wrap {
		position: relative;
		z-index: 10;
		margin-bottom: 0.5rem;
		height: 1.5rem;
		overflow: hidden;
	}
	.lyric-text {
		font-size: 0.75rem;
		font-weight: 700;
		color: var(--primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		margin: 0;
	}
	:global(.dark) .lyric-text { color: var(--primary); }

	/* Bottom: progress + controls */
	.bottom-row {
		position: relative;
		z-index: 10;
		margin-top: auto;
	}

	.progress-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}
	.progress-bar {
		flex: 1;
		height: 6px;
		-webkit-appearance: none;
		appearance: none;
		background: rgba(255,255,255,0.4);
		border-radius: 9999px;
		outline: none;
		cursor: pointer;
		box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
	}
	:global(.dark) .progress-bar {
		background: rgba(51,65,85,0.5);
		box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
	}
	.progress-bar::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--primary);
		cursor: pointer;
		transition: transform 0.1s;
	}
	.progress-bar::-webkit-slider-thumb:hover { transform: scale(1.3); }

	.time {
		font-size: 0.75rem;
		font-weight: 700;
		color: #475569;
		width: 2.5rem;
	}
	.time:first-child { text-align: right; }
	:global(.dark) .time { color: #cbd5e1; }

	/* Control buttons */
	.btn-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 1.5rem;
	}
	.ctrl-btn {
		background: none;
		border: none;
		color: #334155;
		cursor: pointer;
		padding: 0;
		transition: color 0.2s;
		filter: drop-shadow(0 1px 1px rgba(0,0,0,0.05));
		position: relative;
		z-index: 20;
	}
	:global(.dark) .ctrl-btn { color: #cbd5e1; }
	.ctrl-btn:hover { color: var(--primary); }
	:global(.dark) .ctrl-btn:hover { color: var(--primary); }

	.ctrl-icon {
		width: 1.5rem;
		height: 1.5rem;
	}

	.play-btn {
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background: var(--primary);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 20px color-mix(in oklch, var(--primary) 40%, transparent);
		border: 2px solid rgba(255,255,255,0.5);
		transition: all 0.2s;
	}
	:global(.dark) .play-btn {
		border-color: rgba(71,85,105,0.5);
		box-shadow: 0 4px 20px color-mix(in oklch, var(--primary) 25%, transparent);
	}
	.ctrl-btn.play-btn:hover,
	.ctrl-btn.play-btn:hover svg,
	:global(.dark) .ctrl-btn.play-btn:hover,
	:global(.dark) .ctrl-btn.play-btn:hover svg {
		transform: scale(1.1);
		color: white;
	}
	.play-icon {
		width: 1.25rem;
		height: 1.25rem;
	}
	.ml-px { margin-left: 1px; }
</style>

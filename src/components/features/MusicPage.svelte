<script lang="ts">
	interface Track {
		name: string;
		artist: string;
		url: string;
		pic: string;
		lrc?: string;
	}

	function getMgr() {
		return typeof window !== "undefined" ? (window as any).__fireflyMusic : undefined;
	}

	// 从已初始化的 MusicManager 同步读取初始状态，避免页面切换时加载闪烁
	const _initMgr = typeof window !== "undefined" ? getMgr() : undefined;
	const _initState = _initMgr?.getState();
	const _ready = _initState?.initialized;

	let isPlaying = $state(_ready ? _initState.isPlaying : false);
	let currentSong = $state<Track | null>(_ready ? _initState.track : null);
	let currentTime = $state(_ready ? _initState.currentTime : 0);
	let duration = $state(_ready ? _initState.duration : 0);
	let progress = $state(_ready ? _initState.progress : 0);
	let lyricLines: { time: number; text: string }[] = $state(_ready ? (_initState.lyrics || []) : []);
	let isLoading = $state(!_ready);
	let volume = $state(_ready ? _initState.volume : 0.7);
	let isMuted = $state(_ready ? _initState.isMuted : false);
	let playMode = $state(_ready
		? _initState.playMode === 1 ? "single" : _initState.playMode === 2 ? "random" : "list"
		: "list");
	let activeTab = $state<"lyrics" | "playlist">("lyrics");
	let searchQuery = $state("");
	let playlist: Track[] = $state(_ready ? (_initState.playlist || []) : []);
	let showVolumeSlider = $state(false);



	$effect(() => {
		const mgr = getMgr();
		if (!mgr) { isLoading = false; return; }

		const s = mgr.getState();
		if (s.initialized) {
			isLoading = false;
			currentSong = s.track;
			isPlaying = s.isPlaying;
			currentTime = s.currentTime;
			duration = s.duration;
			progress = s.progress;
			lyricLines = s.lyrics || [];
			playlist = s.playlist || [];
			const m = s.playMode;
			playMode = m === 1 ? "single" : m === 2 ? "random" : "list";
		} else {
			mgr.init();
		}

		function onInit(e: CustomEvent) {
			isLoading = false;
			if (!e.detail.playlist?.length) currentSong = null;
			playlist = e.detail.playlist || [];
		}
		function onTrack(e: CustomEvent) { currentSong = e.detail.track; lyricLines = []; }
		function onPlayState(e: CustomEvent) { isPlaying = e.detail.isPlaying; }
		function onTime(e: CustomEvent) {
			currentTime = e.detail.currentTime;
			duration = e.detail.duration;
			progress = e.detail.progress;
		}
		function onLyrics(e: CustomEvent) { lyricLines = e.detail.lyrics || []; }
		function onMode(e: CustomEvent) {
			const m = e.detail.playMode;
			if (m === 0) playMode = "list";
			else if (m === 1) playMode = "single";
			else playMode = "random";
		}

		window.addEventListener("fm:init", onInit);
		window.addEventListener("fm:track", onTrack);
		window.addEventListener("fm:play-state", onPlayState);
		window.addEventListener("fm:time", onTime);
		window.addEventListener("fm:lyrics", onLyrics);
		window.addEventListener("fm:mode", onMode);

		return () => {
			window.removeEventListener("fm:init", onInit);
			window.removeEventListener("fm:track", onTrack);
			window.removeEventListener("fm:play-state", onPlayState);
			window.removeEventListener("fm:time", onTime);
			window.removeEventListener("fm:lyrics", onLyrics);
			window.removeEventListener("fm:mode", onMode);
		};
	});

	let activeLyricIndex = $derived.by(() => {
		if (!lyricLines.length) return -1;
		let idx = lyricLines.findIndex((l) => l.time > currentTime) - 1;
		if (idx === -2) idx = lyricLines.length - 1;
		return Math.max(0, idx);
	});

	$effect(() => {
		if (activeLyricIndex < 0 || activeTab !== "lyrics") return;
		const container = document.querySelector(".lyric-mask");
		if (!container) return;
		const buttons = container.querySelectorAll("button");
		const active = buttons[activeLyricIndex];
		if (active) {
			active.scrollIntoView({ behavior: "smooth", block: "center" });
		}
	});

	function fmtTime(s: number) {
		if (!s || isNaN(s)) return "0:00";
		const m = Math.floor(s / 60).toString().padStart(2, "0");
		const sec = Math.floor(s % 60).toString().padStart(2, "0");
		return `${m}:${sec}`;
	}

	function handleSeek(e: Event) {
		const val = parseFloat((e.target as HTMLInputElement).value);
		getMgr()?.seek(val / 100);
	}

	function togglePlay() { getMgr()?.togglePlay(); }
	function playPrev() { getMgr()?.playPrev(); }
	function playNext() { getMgr()?.playNext(); }
	function playSong(idx: number) {
		const mgr = getMgr();
		if (!mgr) return;
		mgr.loadTrack(idx, true);
		isPlaying = true;
	}

	const playModeLabel = $derived(
		playMode === "single" ? "单曲循环" :
		playMode === "random" ? "随机播放" :
		"列表循环"
	);

	function togglePlayMode() {
		const mgr = getMgr();
		if (!mgr) return;
		mgr.cyclePlayMode();
		const m = mgr.getState().playMode;
		if (m === 0) playMode = "list";
		else if (m === 1) playMode = "single";
		else playMode = "random";
	}

	function setVolume(v: number) { volume = v; getMgr()?.setVolume(v); isMuted = false; }
	function toggleMute() {
		if (isMuted) { isMuted = false; getMgr()?.setVolume(volume); }
		else { isMuted = true; getMgr()?.setVolume(0); }
	}

	const cover = $derived(currentSong?.pic || "");
	const songName = $derived(currentSong?.name || "");
	const artist = $derived(currentSong?.artist || "");

	const filteredPlaylist = $derived(
		searchQuery.trim()
			? playlist.filter((s) =>
				s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				s.artist.toLowerCase().includes(searchQuery.toLowerCase())
			)
			: playlist
	);

	function playModeIcon() {
		if (playMode === "single") return "repeat_one";
		if (playMode === "random") return "shuffle";
		return "repeat";
	}
</script>

<div class="music-page">
	<!-- Blurred bg from cover -->
	<div class="fixed inset-0 z-0 pointer-events-none">
		{#if cover}
			<div class="absolute inset-[-10%] bg-cover bg-center transition-all duration-1000 blur-[50px] opacity-40 dark:opacity-20 saturate-150" style="background-image: url({cover})"></div>
		{/if}
		<div class="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-sm"></div>
	</div>

	<main class="relative z-10 min-h-screen pt-24 md:pt-28 pb-10">
		<div class="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10">
			<!-- Title -->
			<div class="mb-6 md:mb-10 text-center md:text-left">
				<h1 class="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-widest mb-1 md:mb-2">云端乐律</h1>
				<p class="text-xs md:text-base text-slate-600 dark:text-slate-400 font-medium tracking-wider">在代码的缝隙中寻找灵魂的共鸣</p>
			</div>

			{#if isLoading}
				<div class="flex-1 flex flex-col items-center justify-center animate-pulse gap-4 py-32">
					<div class="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
					<span class="font-black text-slate-500 tracking-widest text-sm">唤醒音频引擎中...</span>
				</div>
			{:else if !currentSong}
				<div class="flex-1 flex flex-col items-center justify-center gap-4 py-32">
					<svg class="w-16 h-16 text-slate-300 dark:text-slate-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
					<span class="font-black text-slate-400 tracking-widest text-sm">暂无音乐数据</span>
				</div>
			{:else}
				<div class="flex flex-col md:grid md:grid-cols-12 gap-6 md:gap-8 w-full md:items-stretch md:h-[calc(100vh-320px)] md:min-h-[600px] md:max-h-[720px]">

					<!-- ====== Left: Player Panel ====== -->
					<div class="md:col-span-5 flex flex-col bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-[32px] shadow-2xl p-6 md:p-10 relative overflow-hidden transition-all duration-500 shrink-0 min-h-[460px] sm:min-h-[500px] md:min-h-0">

						<div class="flex-1 flex flex-col items-center justify-center relative z-10 w-full overflow-hidden py-4 md:py-0">
							<!-- Vinyl Disc -->
							<div class="relative w-40 h-40 sm:w-48 sm:h-48 lg:w-64 lg:h-64 flex-shrink-0 aspect-square mb-6 md:mb-10 flex items-center justify-center">
								<div class="absolute inset-0 m-auto w-[85%] h-[85%] bg-indigo-500/25 blur-[35px] rounded-full transition-all duration-1000 z-0" class:opacity-90={isPlaying} class:scale-105={isPlaying} class:opacity-20={!isPlaying} class:scale-100={!isPlaying}></div>
								<div class="absolute inset-0 m-auto w-[90%] h-[90%] rounded-full shadow-[0_0_40px_-5px_rgba(99,102,241,0.4)] z-0"></div>
								<div class="absolute inset-0 w-full h-full rounded-full border-[4px] md:border-[6px] border-white/80 dark:border-slate-600/80 shadow-2xl overflow-hidden transition-transform duration-700 z-10" class:scale-100={isPlaying} class:scale-95={!isPlaying} style="animation: vinyl-spin 20s linear infinite; animation-play-state: {isPlaying ? 'running' : 'paused'}">
									<img src={cover} alt="cover" class="w-full h-full object-cover" referrerpolicy="no-referrer" />
									<div class="absolute inset-0 m-auto w-10 h-10 md:w-12 md:h-12 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-full z-30 shadow-inner border border-slate-300 dark:border-slate-700"></div>
									<div class="absolute inset-0 z-20 rounded-full pointer-events-none opacity-20" style="background: conic-gradient(from 0deg, transparent, rgba(255,255,255,0.4), transparent, rgba(255,255,255,0.4), transparent)"></div>
								</div>
							</div>
							<!-- Song Info -->
							<div class="w-full text-center px-2 md:px-4 mb-2 md:mb-6">
								<h2 class="text-lg md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white truncate drop-shadow-sm tracking-tight">{songName}</h2>
								<p class="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 truncate mt-1 md:mt-2 tracking-widest">{artist}</p>
							</div>
						</div>

						<!-- Progress + Controls -->
						<div class="w-full mt-auto relative z-20">
							<div class="w-full flex flex-col gap-1.5 mb-6 md:mb-8 px-1 md:px-3">
								<input type="range" min="0" max="100" value={progress} oninput={handleSeek} class="progress-bar" style="background: linear-gradient(to right, var(--primary) {progress}%, rgba(0,0,0,0.15) 0)" />
								<div class="flex justify-between text-[10px] md:text-xs font-bold text-slate-500 dark:text-slate-400 tabular-nums">
									<span>{fmtTime(currentTime)}</span><span>{fmtTime(duration)}</span>
								</div>
							</div>
							<div class="w-full flex items-center justify-between px-1 md:px-2 lg:px-4">
								<button onclick={togglePlayMode} title={playModeLabel} class="p-2 transition-transform hover:scale-110">
									<svg class="w-[18px] h-[18px] md:w-5 md:h-5 {playMode !== 'list' ? 'text-indigo-500' : 'text-slate-500'}" fill="currentColor" viewBox="0 0 24 24">
										{#if playMode === "single"}
											<path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/>
										{:else if playMode === "random"}
											<path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
										{:else}
											<path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
										{/if}
									</svg>
								</button>
								<div class="flex items-center gap-3 md:gap-4 lg:gap-6">
									<button onclick={playPrev} aria-label="上一首" class="p-2 text-slate-700 dark:text-slate-300 hover:text-indigo-500 transition-transform hover:scale-110">
										<svg class="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>
									</button>
									<button onclick={togglePlay} class="w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 flex items-center justify-center bg-indigo-500 text-white rounded-full hover:scale-105 shadow-xl shadow-indigo-500/40 transition-all">
										{#if isPlaying}
											<svg class="w-7 h-7 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
										{:else}
											<svg class="w-7 h-7 md:w-8 md:h-8 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
										{/if}
									</button>
									<button onclick={playNext} aria-label="下一首" class="p-2 text-slate-700 dark:text-slate-300 hover:text-indigo-500 transition-transform hover:scale-110">
										<svg class="w-6 h-6 md:w-7 md:h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
									</button>
								</div>
								<div class="flex items-center" role="presentation" onmouseleave={() => showVolumeSlider = false}>
									{#if showVolumeSlider}
										<div class="hidden md:flex items-center mr-2 bg-white/30 dark:bg-black/20 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/20">
											<input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} oninput={(e) => setVolume(Number((e.target as HTMLInputElement).value))} class="w-16 h-1 appearance-none rounded-full cursor-pointer volume-bar" style="background: linear-gradient(to right, var(--primary) {(volume || 0) * 100}%, rgba(0,0,0,0.15) 0)" />
										</div>
									{/if}
									<button onclick={() => showVolumeSlider = !showVolumeSlider} ondblclick={toggleMute} class="p-2 rounded-full transition-all" class:bg-indigo-500={showVolumeSlider} class:text-white={showVolumeSlider} class:shadow-lg={showVolumeSlider} class:text-slate-500={!showVolumeSlider}>
										{#if isMuted || volume === 0}
											<svg class="w-[18px] h-[18px] md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
										{:else}
											<svg class="w-[18px] h-[18px] md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
										{/if}
									</button>
								</div>
							</div>
						</div>
					</div>

					<!-- ====== Right: Lyrics / Playlist ====== -->
					<div class="md:col-span-7 flex flex-col bg-white/40 dark:bg-slate-800/50 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-[32px] shadow-2xl relative transition-colors duration-700 overflow-hidden h-[450px] md:h-auto shrink-0">
						<div class="flex items-center justify-center gap-1 p-1 mt-4 md:mt-6 mx-auto bg-white/50 dark:bg-slate-900/50 rounded-full shadow-inner border border-white/40 w-48 md:w-64 z-20 shrink-0">
							<button onclick={() => activeTab = "lyrics"} class="flex-1 py-1.5 md:py-2 rounded-full font-black text-xs md:text-[13px] transition-all" class:bg-indigo-500={activeTab === "lyrics"} class:text-white={activeTab === "lyrics"} class:shadow-md={activeTab === "lyrics"} class:text-slate-500={activeTab !== "lyrics"}>歌词</button>
							<button onclick={() => activeTab = "playlist"} class="flex-1 py-1.5 md:py-2 rounded-full font-black text-xs md:text-[13px] transition-all" class:bg-indigo-500={activeTab === "playlist"} class:text-white={activeTab === "playlist"} class:shadow-md={activeTab === "playlist"} class:text-slate-500={activeTab !== "playlist"}>歌单</button>
						</div>

						<div class="flex-1 relative mt-2 flex flex-col overflow-hidden">
							{#if activeTab === "lyrics"}
								<div class="absolute inset-0 flex flex-col h-full">
									<div class="absolute top-0 left-0 right-0 h-32 md:h-40 bg-gradient-to-b from-white/40 dark:from-slate-800/60 to-transparent z-10 pointer-events-none"></div>
									<div class="absolute bottom-0 left-0 right-0 h-32 md:h-40 bg-gradient-to-t from-white/40 dark:from-slate-800/60 to-transparent z-10 pointer-events-none"></div>
									<div class="h-full overflow-y-auto scroll-smooth relative px-4 md:px-6 lyric-mask">
										<div class="py-[30vh] md:py-[35vh] flex flex-col gap-4 md:gap-6 text-center lg:px-10">
											{#if lyricLines.length > 0}
												{#each lyricLines as line, idx}
													{@const isActive = idx === activeLyricIndex}
													<button
														onclick={() => { const t = (line.time / duration) * 100; getMgr()?.seek(t / 100); }}
														class="transition-all duration-700 cursor-pointer px-2 md:px-4 rounded-2xl text-left w-full {isActive ? 'opacity-100 scale-105 py-2 md:py-3 bg-white/10' : 'opacity-20 hover:opacity-40'}"
													>
														<p class="font-black tracking-tight leading-relaxed transition-all duration-700 {isActive ? 'text-lg md:text-2xl text-indigo-600 dark:text-indigo-400' : 'text-sm md:text-lg text-slate-700 dark:text-slate-300'}" style={isActive ? 'text-shadow: 0 0 20px rgba(99,102,241,0.15)' : ''}>{line.text}</p>
													</button>
												{/each}
											{:else}
												<div class="h-full flex items-center justify-center">
													<div class="flex flex-col items-center gap-3 md:gap-4">
														<svg class="w-8 h-8 animate-spin text-indigo-500/40" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="12" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="8" cy="18" r="2"/><circle cx="16" cy="18" r="2"/></svg>
														<p class="text-base md:text-xl font-black text-indigo-500 animate-pulse">正在捕获灵魂旋律...</p>
													</div>
												</div>
											{/if}
										</div>
									</div>
								</div>
							{:else}
								<div class="absolute inset-0 px-4 md:px-8 pb-4 md:pb-8 pt-2 md:pt-4 flex flex-col">
									<div class="relative w-full max-w-md mx-auto group mb-4 md:mb-8 shrink-0">
										<div class="absolute inset-0 bg-indigo-500/5 blur-xl group-focus-within:bg-indigo-500/10 transition-all rounded-full"></div>
										<svg class="w-4 h-4 md:w-5 md:h-5 absolute left-4 top-1/2 -translate-y-1/2 z-10 text-slate-400 group-focus-within:text-indigo-500 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
										<input type="text" placeholder="搜索音轨..." bind:value={searchQuery} class="w-full h-10 md:h-12 pl-10 md:pl-12 pr-10 md:pr-12 bg-white/30 dark:bg-slate-900/60 backdrop-blur-md border border-white/50 dark:border-white/10 rounded-full text-xs md:text-sm font-medium text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 shadow-inner transition-all" />
										{#if searchQuery}
											<button onclick={() => searchQuery = ""} aria-label="清除搜索" class="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-black/10 rounded-full transition-colors">
												<svg class="w-3.5 h-3.5 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
											</button>
										{/if}
									</div>
									<div class="flex-1 overflow-y-auto pr-2 flex flex-col gap-2 md:gap-2.5 custom-scrollbar">
										{#each filteredPlaylist as song, idx}
											{@const isCurrent = song.name === currentSong?.name && song.artist === currentSong?.artist}
											<button onclick={() => playSong(playlist.findIndex(s => s.name === song.name && s.artist === song.artist))} class="flex items-center justify-between p-3 md:p-4 rounded-xl md:rounded-2xl cursor-pointer transition-all border text-left {isCurrent ? 'bg-white/60 dark:bg-slate-700/80 shadow-md border-indigo-500/30' : 'border-transparent hover:bg-white/30 dark:hover:bg-slate-700/40'}">
												<div class="flex items-center gap-3 md:gap-4 w-[85%]">
													<div class="relative w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-lg md:rounded-xl overflow-hidden shadow-sm">
														<img src={song.pic} alt="cover" class="w-full h-full object-cover" />
														{#if isCurrent && isPlaying}
															<div class="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
																<div class="flex gap-[3px] items-end h-2 md:h-3">
																	<span class="w-0.5 bg-white rounded-full animate-bounce" style="animation-delay: 0ms"></span>
																	<span class="w-0.5 bg-white rounded-full animate-bounce" style="animation-delay: 200ms"></span>
																	<span class="w-0.5 bg-white rounded-full animate-bounce" style="animation-delay: 400ms"></span>
																</div>
															</div>
														{/if}
													</div>
													<div class="flex flex-col truncate">
														<span class="text-sm md:text-[15px] font-black truncate {isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}">{song.name}</span>
														<span class="text-[10px] md:text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">{song.artist}</span>
													</div>
												</div>
											</button>
										{/each}
									</div>
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/if}
		</div>
	</main>
</div>

<style>
	@keyframes vinyl-spin { to { transform: rotate(360deg); } }
	.lyric-mask {
		-webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
		mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
	}
	.lyric-mask::-webkit-scrollbar { display: none; }
	.lyric-mask { -ms-overflow-style: none; scrollbar-width: none; }

	.custom-scrollbar::-webkit-scrollbar { width: 5px; }
	.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: color-mix(in oklch, var(--primary) 30%, transparent);
		border-radius: 9999px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: color-mix(in oklch, var(--primary) 50%, transparent);
	}
	.custom-scrollbar { scrollbar-width: thin; scrollbar-color: color-mix(in oklch, var(--primary) 30%, transparent) transparent; }

	.progress-bar {
		flex: 1; height: 6px; -webkit-appearance: none; appearance: none;
		border-radius: 9999px; outline: none; cursor: pointer;
	}
	.progress-bar::-webkit-slider-thumb {
		-webkit-appearance: none; appearance: none;
		width: 14px; height: 14px; border-radius: 50%;
		background: var(--primary); cursor: pointer;
		transition: transform 0.1s;
		box-shadow: 0 0 8px rgba(99,102,241,0.3);
	}
	.progress-bar::-webkit-slider-thumb:hover { transform: scale(1.3); }

	.volume-bar::-webkit-slider-thumb {
		-webkit-appearance: none; appearance: none;
		width: 10px; height: 10px; border-radius: 50%;
		background: var(--primary); cursor: pointer;
	}
</style>

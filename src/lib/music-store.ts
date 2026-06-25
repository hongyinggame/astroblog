import { writable, derived } from "svelte/store";

export interface Song {
	id: string;
	name: string;
	artist: string;
	album: string;
	cover: string;
	url: string;
	lrc?: string;
}

interface MusicState {
	playlist: Song[];
	currentIndex: number;
	isPlaying: boolean;
	progress: number;
	currentTime: number;
	duration: number;
	volume: number;
	isMuted: boolean;
	playMode: "loop" | "single" | "random";
	currentLyric: string;
	isLoading: boolean;
}

function createMusicStore() {
	const initialState: MusicState = {
		playlist: [],
		currentIndex: 0,
		isPlaying: false,
		progress: 0,
		currentTime: 0,
		duration: 0,
		volume: 0.7,
		isMuted: false,
		playMode: "loop",
		currentLyric: "",
		isLoading: true,
	};

	const { subscribe, update } = writable<MusicState>(initialState);

	let audio: HTMLAudioElement | null = null;
	let lyrics: string[] = [];
	let lyricTimes: number[] = [];

	function parseLrc(lrc: string) {
		const lines = lrc.split("\n");
		lyrics = [];
		lyricTimes = [];
		const timeReg = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;
		for (const line of lines) {
			const match = line.match(timeReg);
			if (match) {
				const text = line.replace(timeReg, "").trim();
				if (text) {
					for (const m of match) {
						const parts = m.slice(1, -1).split(":");
						const mins = parseInt(parts[0]);
						const secs = parseFloat(parts[1]);
						lyricTimes.push(mins * 60 + secs);
						lyrics.push(text);
					}
				}
			}
		}
	}

	function getCurrentLyric(time: number): string {
		let current = "";
		for (let i = 0; i < lyricTimes.length; i++) {
			if (time >= lyricTimes[i]) {
				current = lyrics[i];
			} else {
				break;
			}
		}
		return current;
	}

	function initAudio() {
		if (typeof window === "undefined") return;
		if (audio) return;
		audio = new Audio();
		audio.volume = 0.7;
		audio.ontimeupdate = () => {
			if (!audio) return;
			const ct = audio.currentTime;
			const dur = audio.duration || 1;
			update((s) => ({
				...s,
				currentTime: ct,
				duration: dur,
				progress: (ct / dur) * 100,
				currentLyric: getCurrentLyric(ct),
			}));
		};
		audio.onended = () => {
			update((s) => {
				if (s.playMode === "single") {
					if (audio) {
						audio.currentTime = 0;
						audio.play();
					}
					return s;
				}
				return s;
			});
			if (audio && audio.loop === false) {
				next();
			}
		};
		audio.onloadedmetadata = () => {
			update((s) => ({ ...s, isLoading: false }));
		};
	}

	async function loadPlaylist(ids: string[]) {
		initAudio();
		update((s) => ({ ...s, isLoading: true }));
		try {
			const resp = await fetch(`/api/music.json?ids=${ids.join(",")}`);
			const data = await resp.json();
			if (data.songs && data.songs.length > 0) {
				update((s) => ({
					...s,
					playlist: data.songs,
					isLoading: false,
				}));
				if (data.songs[0].lrc) {
					parseLrc(data.songs[0].lrc);
				}
				if (audio && data.songs[0].url) {
					audio.src = data.songs[0].url;
				}
			} else {
				update((s) => ({ ...s, isLoading: false }));
			}
		} catch {
			update((s) => ({ ...s, isLoading: false }));
		}
	}

	function play(index?: number) {
		if (!audio || !audio.src) return;
		if (index !== undefined) {
			update((s) => ({ ...s, currentIndex: index }));
		}
		audio.play().catch(() => {});
		update((s) => ({ ...s, isPlaying: true }));
	}

	function pause() {
		audio?.pause();
		update((s) => ({ ...s, isPlaying: false }));
	}

	function togglePlay() {
		update((s) => {
			if (s.isPlaying) {
				audio?.pause();
			} else {
				if (audio && audio.src) {
					audio.play().catch(() => {});
				}
			}
			return { ...s, isPlaying: !s.isPlaying };
		});
	}

	function next() {
		update((s) => {
			let nextIdx: number;
			if (s.playMode === "random") {
				nextIdx = Math.floor(Math.random() * s.playlist.length);
			} else {
				nextIdx = (s.currentIndex + 1) % s.playlist.length;
			}
			const song = s.playlist[nextIdx];
			if (song && audio) {
				audio.src = song.url;
				audio.play().catch(() => {});
				if (song.lrc) parseLrc(song.lrc);
			}
			return { ...s, currentIndex: nextIdx, isPlaying: true };
		});
	}

	function prev() {
		update((s) => {
			const prevIdx =
				(s.currentIndex - 1 + s.playlist.length) % s.playlist.length;
			const song = s.playlist[prevIdx];
			if (song && audio) {
				audio.src = song.url;
				audio.play().catch(() => {});
				if (song.lrc) parseLrc(song.lrc);
			}
			return { ...s, currentIndex: prevIdx, isPlaying: true };
		});
	}

	function seek(time: number) {
		if (audio) {
			audio.currentTime = time;
		}
	}

	function setVolume(vol: number) {
		if (audio) audio.volume = vol;
		update((s) => ({ ...s, volume: vol, isMuted: vol === 0 }));
	}

	function toggleMute() {
		update((s) => {
			const muted = !s.isMuted;
			if (audio) audio.muted = muted;
			return { ...s, isMuted: muted };
		});
	}

	function togglePlayMode() {
		update((s) => {
			const modes: Array<MusicState["playMode"]> = [
				"loop",
				"single",
				"random",
			];
			const idx = modes.indexOf(s.playMode);
			return { ...s, playMode: modes[(idx + 1) % modes.length] };
		});
	}

	return {
		subscribe,
		loadPlaylist,
		play,
		pause,
		togglePlay,
		next,
		prev,
		seek,
		setVolume,
		toggleMute,
		togglePlayMode,
		get currentSong() {
			let result: Song | null = null;
			subscribe((s) => {
				result = s.playlist[s.currentIndex] || null;
			})();
			return result;
		},
	};
}

export const musicStore = createMusicStore();

export const currentSong = derived(musicStore, ($store) => {
	return $store.playlist[$store.currentIndex] || null;
});

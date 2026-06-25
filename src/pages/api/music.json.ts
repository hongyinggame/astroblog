import type { APIRoute } from "astro";

const METING_API = "https://api.injahow.cn/meting/";

interface SongItem {
	id: string;
	name: string;
	artist: string;
	album: string;
	cover: string;
	url: string;
	lrc: string;
}

export const GET: APIRoute = async ({ request }) => {
	const url = new URL(request.url);
	const ids = url.searchParams.get("ids") || "";

	if (!ids) {
		return new Response(JSON.stringify({ songs: [] }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	}

	try {
		const idList = ids.split(",").filter(Boolean);
		const songs: SongItem[] = [];

		for (const id of idList) {
			const apiUrl = `${METING_API}?server=netease&type=song&id=${id}&r=${Math.random()}`;
			const resp = await fetch(apiUrl, {
				headers: { "User-Agent": "Firefly/6.0" },
			});
			const data = await resp.json();

			if (Array.isArray(data) && data.length > 0) {
				const item = data[0];
				let lrc = "";
				try {
					const lrcUrl = `${METING_API}?server=netease&type=lrc&id=${id}`;
					const lrcResp = await fetch(lrcUrl, {
						headers: { "User-Agent": "Firefly/6.0" },
					});
					const lrcData = await lrcResp.json();
					if (lrcData && lrcData.lyric) {
						lrc = lrcData.lyric;
					}
				} catch {
					// ignore lrc errors
				}

				songs.push({
					id: String(id),
					name: item.name || item.title || "Unknown",
					artist: item.artist || item.author || "Unknown",
					album: item.album || "",
					cover: item.pic || item.picture || "",
					url: item.url || "",
					lrc,
				});
			}
		}

		return new Response(JSON.stringify({ songs }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch {
		return new Response(
			JSON.stringify({ songs: [] }),
			{
				status: 200,
				headers: { "Content-Type": "application/json" },
			}
		);
	}
};

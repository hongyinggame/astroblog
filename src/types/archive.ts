export interface ArchiveItem {
  id: string;
  title: string;
  published: Date;
  rating: number;
  cover: string;
  author?: string;
  type?: "movie" | "tv" | "小说" | "散文" | "诗歌" | "戏剧";
}

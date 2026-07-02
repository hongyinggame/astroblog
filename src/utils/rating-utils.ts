export interface RatingInfo {
  grade: string;
  stars: number;
  minScore: number;
  label: string;
}

export const RATING_LEVELS: RatingInfo[] = [
  { grade: "SS", stars: 6, minScore: 9.5, label: "该艺术形式的神作" },
  { grade: "S", stars: 5, minScore: 9.0, label: "有着独特魅力、结构完整、内容精彩的作品，能切实地吸收某一领域的知识" },
  { grade: "A", stars: 4, minScore: 8.0, label: "有着可圈可点的特色，读过后觉得值得" },
  { grade: "B", stars: 3, minScore: 7.0, label: "普通的作品，有些特色但存在着一定缺陷" },
  { grade: "C", stars: 2, minScore: 6.0, label: "有着明显缺陷，不值得亲自品鉴的作品" },
  { grade: "D", stars: 1, minScore: 0, label: "屎" },
];

export function getRatingInfo(score: number): RatingInfo {
  for (const level of RATING_LEVELS) {
    if (score >= level.minScore) return level;
  }
  return RATING_LEVELS[RATING_LEVELS.length - 1];
}

export const GRADE_COLORS: Record<string, string> = {
  SS: "bg-yellow-500 text-white",
  S: "bg-amber-500 text-white",
  A: "bg-green-500 text-white",
  B: "bg-blue-500 text-white",
  C: "bg-gray-500 text-white",
  D: "bg-red-500 text-white",
};

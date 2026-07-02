<script lang="ts">
  import type { ArchiveItem } from "@/types/archive";
  import LibraryCard from "./LibraryCard.svelte";
  import RatingGuide from "./RatingGuide.svelte";

  interface Props {
    items: ArchiveItem[];
    type: "book" | "film";
  }

  const { items, type }: Props = $props();

  type SortField = "date" | "rating" | "title";
  let sortField = $state<SortField>("date");
  let sortAsc = $state<boolean>(false);
  let searchQuery = $state("");

  const filteredItems = $derived.by(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [...items];
    return items.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchAuthor = item.author?.toLowerCase().includes(q);
      const matchType = (item.type === "movie" ? "电影" : item.type === "tv" ? "电视剧" : item.type || "").includes(q);
      return matchTitle || matchAuthor || matchType;
    });
  });

  const sortedItems = $derived.by(() => {
    const sorted = [...filteredItems];
    sorted.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "date":
          cmp = new Date(a.published).getTime() - new Date(b.published).getTime();
          break;
        case "rating":
          cmp = a.rating - b.rating;
          break;
        case "title":
          cmp = a.title.localeCompare(b.title, "zh-Hans-CN");
          break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return sorted;
  });

  function onSortChange(e: Event) {
    const value = (e.target as HTMLSelectElement).value;
    const [field, dir] = value.split("-");
    sortField = field as SortField;
    sortAsc = dir === "asc";
  }
</script>

<RatingGuide />

<div class="sort-row">
  <div class="search-box">
    <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
    <input
      type="text"
      class="search-input"
      placeholder="搜索..."
      bind:value={searchQuery}
    />
  </div>
  <select class="sort-select" onchange={onSortChange}>
    <option value="date-desc" selected={sortField === "date" && !sortAsc}>时间 ↓ 最新</option>
    <option value="date-asc" selected={sortField === "date" && sortAsc}>时间 ↑ 最早</option>
    <option value="rating-desc" selected={sortField === "rating" && !sortAsc}>评分 ↓ 最高</option>
    <option value="rating-asc" selected={sortField === "rating" && sortAsc}>评分 ↑ 最低</option>
    <option value="title-asc" selected={sortField === "title" && sortAsc}>标题 ↑ A-Z</option>
    <option value="title-desc" selected={sortField === "title" && !sortAsc}>标题 ↓ Z-A</option>
  </select>
</div>

{#if sortedItems.length > 0}
  <div class="library-card-grid">
    {#each sortedItems as item (item.id)}
      <LibraryCard {item} linkType={type === "book" ? "books" : "films"} />
    {/each}
  </div>
{:else}
  <div class="empty-state">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-14 h-14 mb-3 opacity-25" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
    <p class="text-sm text-(--secondary-text)">{searchQuery ? '未找到匹配项' : '暂无内容'}</p>
  </div>
{/if}

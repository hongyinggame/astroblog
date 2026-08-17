<script lang="ts">
  import type { ArchiveItem } from "@/types/archive";
  import { getRatingInfo } from "@/utils/rating-utils";

  interface Props {
    item: ArchiveItem;
    linkType: "books" | "films";
  }

  const { item, linkType }: Props = $props();

  const ratingInfo = $derived(getRatingInfo(item.rating));
  const gradeLower = $derived(ratingInfo.grade.toLowerCase());
  const filledStars = $derived("★".repeat(ratingInfo.stars));
  const emptyStars = $derived("☆".repeat(6 - ratingInfo.stars));

  let imageLoaded = $state(false);
</script>

<a href={`/library/${linkType}/${item.id}/`} class="library-card group cursor-pointer no-underline">
  <div class="library-card-cover">
    <span class="rating-badge {gradeLower}">{ratingInfo.grade}</span>
    {#if item.type}
      <span class="type-badge">
        {item.type === "movie" ? "电影" : item.type === "tv" ? "电视剧" : item.type}
      </span>
    {/if}

    {#if item.cover}
      <img src={item.cover} alt={item.title} loading="lazy" referrerpolicy="no-referrer" onload={() => imageLoaded = true} class="transition-opacity duration-500 {imageLoaded ? 'opacity-100' : 'opacity-0'}" />
      {#if !imageLoaded}
        <div class="cover-placeholder">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
        </div>
      {/if}
    {:else}
      <div class="cover-placeholder">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
      </div>
    {/if}

    <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end pb-4">
      {#if item.description}
        <p class="text-white/90 text-xs mt-2 text-center px-4 leading-snug line-clamp-3">{item.description}</p>
      {/if}
      <div class="mt-2 flex flex-col items-center">
        <span class="text-yellow-400 text-xs tracking-wide">{filledStars}{emptyStars}</span>
        <span class="text-white/80 text-[0.65rem] mt-0.5">{ratingInfo.label}</span>
      </div>
    </div>
  </div>

  <div class="library-card-info">
    <div class="card-divider"></div>
    <h3 class="title">{item.title}</h3>
    <div class="rating-row">
      <span class="rating-score">{item.rating}</span>
      <span class="rating-stars">{filledStars}{emptyStars}</span>
    </div>
    <div class="meta">
      <span>{new Date(item.published).getFullYear()}-{String(new Date(item.published).getMonth() + 1).padStart(2, '0')}</span>
      {#if item.author}<span>· {item.author}</span>{/if}
    </div>
    {#if item.tags && item.tags.length > 0}
      <div class="tags">
        {#each item.tags as tag}
          <span class="tag">{tag}</span>
        {/each}
      </div>
    {/if}
  </div>
</a>

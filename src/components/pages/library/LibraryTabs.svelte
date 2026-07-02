<script lang="ts">
  import type { ArchiveItem } from "@/types/archive";
  import LibraryGrid from "./LibraryGrid.svelte";

  interface Props {
    books: ArchiveItem[];
    films: ArchiveItem[];
  }

  const { books, films }: Props = $props();

  let activeTab = $state("books");

  const tabs = $derived([
    { id: "books", name: "图书收藏", count: books.length },
    { id: "films", name: "影视记忆", count: films.length },
  ]);
</script>

<div class="tab-nav">
  {#each tabs as tab}
    <button
      class="tab-btn {activeTab === tab.id ? 'active' : ''}"
      onclick={() => activeTab = tab.id}
      type="button"
    >
      {#if tab.id === "books"}
        <svg xmlns="http://www.w3.org/2000/svg" class="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" class="tab-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
          <line x1="7" y1="2" x2="7" y2="22" />
          <line x1="17" y1="2" x2="17" y2="22" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <line x1="2" y1="7" x2="7" y2="7" />
          <line x1="2" y1="17" x2="7" y2="17" />
          <line x1="17" y1="7" x2="22" y2="7" />
          <line x1="17" y1="17" x2="22" y2="17" />
        </svg>
      {/if}
      <span>{tab.name}</span>
      {#if tab.count > 0}
        <span class="tab-count">{tab.count}</span>
      {/if}
    </button>
  {/each}
</div>

{#if activeTab === "books"}
  <LibraryGrid items={books} type="book" />
{:else}
  <LibraryGrid items={films} type="film" />
{/if}

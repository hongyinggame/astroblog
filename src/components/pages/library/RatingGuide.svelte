<script lang="ts">
  import { RATING_LEVELS } from "@/utils/rating-utils";

  const gradeClass = (grade: string) => {
    const map: Record<string, string> = {
      SS: "bg-purple-500",
      S: "bg-amber-500",
      A: "bg-green-500",
      B: "bg-blue-500",
      C: "bg-gray-500",
      D: "bg-red-500",
    };
    return map[grade] ?? "bg-gray-500";
  };

  let expanded = $state(true);
</script>

<div class="rating-guide">
  <button class="rating-guide-header" onclick={() => expanded = !expanded}>
    <span>评级说明</span>
    <svg xmlns="http://www.w3.org/2000/svg" class="guide-arrow" class:collapsed={!expanded} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  </button>
  {#if expanded}
    <div class="rating-guide-content">
      {#each RATING_LEVELS as level}
        <div class="flex items-center gap-3 text-sm py-1 px-2">
          <span class="inline-flex items-center justify-center w-10 h-6 rounded text-xs font-bold text-white shrink-0 {gradeClass(level.grade)}">
            {level.grade}
          </span>
          <span class="text-yellow-400 text-xs w-16 shrink-0">{'★'.repeat(level.stars)}{'☆'.repeat(6 - level.stars)}</span>
          <span class="text-white/70 text-xs shrink-0 w-10">{level.grade === 'D' ? '<6.0' : `≥${level.minScore}`}</span>
          <span class="text-white/90 text-xs flex-1">{level.label}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .rating-guide-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.25rem 0.5rem;
    font-size: 0.8rem;
    font-weight: 700;
    color: rgba(255,255,255,0.75);
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.2s;
  }
  .rating-guide-header:hover {
    color: #fff;
  }
  .guide-arrow {
    transition: transform 0.3s ease;
    opacity: 0.6;
  }
  .guide-arrow.collapsed {
    transform: rotate(-90deg);
  }
  .rating-guide-content {
    padding-top: 0.25rem;
  }
</style>

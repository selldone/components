<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <template v-if="kind === 'category'">
      <path d="M4 9.5V6.25a1.5 1.5 0 0 1 1.5-1.5H9l2.1 2.1h7.4a1.5 1.5 0 0 1 1.5 1.5V9.5" />
      <path d="M3.75 9.5h16.5a1 1 0 0 1 .97 1.24l-1.55 6.2a1.75 1.75 0 0 1-1.7 1.31H5.1a1.75 1.75 0 0 1-1.74-1.54l-.73-5.72A1.3 1.3 0 0 1 3.92 9.5" />
      <path d="M7 13h4m-4 3h6.5" />
    </template>
    <template v-else-if="kind === 'create'">
      <path d="M10.5 19 3 15V7l7.5-4L18 7v5M3 7l7.5 4L18 7M10.5 11v8" />
      <circle cx="18" cy="17.5" r="4" />
      <path d="M18 15.75v3.5m-1.75-1.75h3.5" />
    </template>
    <template v-else-if="kind === 'import'">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" />
      <path d="M14 3v6h6M8 8h2m-2 4h3m-3 4h2M16 12v6m-2.5-2.5L16 18l2.5-2.5" />
    </template>
    <template v-else-if="kind === 'engine'">
      <rect x="9" y="3" width="6" height="5" rx="1.25" />
      <rect x="3" y="16" width="6" height="5" rx="1.25" />
      <rect x="15" y="16" width="6" height="5" rx="1.25" />
      <path d="M12 8v4m-6 4v-4h12v4" />
    </template>
    <template v-else>
      <path d="m12 3.5 9 4.75v7.5l-9 4.75-9-4.75v-7.5Z" />
      <path d="m3 8.25 9 4.5 9-4.5M12 12.75v7.75" />
      <path d="m7.5 5.88 9 4.5v3.37" />
    </template>
  </svg>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  kind: "category" | "product" | "create" | "import" | "engine";
  size?: number;
}>(), { size: 18 });
</script>

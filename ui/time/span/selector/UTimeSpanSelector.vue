<!--
  - Copyright (c) 2023. Selldone® Business OS™
  -
  - Author: M.Pajuhaan
  - Web: https://selldone.com
  - ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  -
  - All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
  - From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
  - Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
  - Our journey is not just about reaching a destination, but about creating a masterpiece.
  - Tread carefully, for you're treading on dreams.
  -->

<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn
        :class="buttonClass"
        :size="size"
        :variant="variant"
        class="tnt"
        v-bind="props"
      >
        {{ $t(selected_timespan) }}
        <v-icon end>arrow_drop_down</v-icon>
      </v-btn>
    </template>
    <v-list density="compact">
      <v-list-item
        v-for="(item, index) in items"
        :key="index"
        @click="$emit('select', item)"
      >
        <v-list-item-title>{{ $t(item.title) }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
export default {
  name: "UTimeSpanSelector",
  emits: ["select"],
  props: {
    dateRange: {
      type: Array,
    },
    maxDays: {
      type: Number,
      default: 30,
    },

    variant: {
      type: String as () => NonNullable<
        "flat" | "text" | "elevated" | "tonal" | "outlined" | "plain"
      >,
      default: null,
    },
    size: [Number, String],
    buttonClass: {},
  },
  data: () => ({}),
  computed: {
    items() {
      let out = [
        { title: "time_spans.today", from: 0, to: 0 },
        { title: "time_spans.yesterday", from: 1, to: 1 },
        { title: "time_spans.last_7", from: 7, to: 0 },
      ];
      if (this.maxDays >= 14)
        out.push({ title: "time_spans.last_14", from: 14, to: 0 });
      if (this.maxDays >= 30)
        out.push({ title: "time_spans.last_30", from: 30, to: 0 });
      if (this.maxDays >= 90)
        out.push({ title: "time_spans.last_90", from: 90, to: 0 });
      out.push({ title: "time_spans.custom", from: 30, to: 0 });
      return out;
    },

    selected_timespan() {
      const found = this.items.find((item:{title:string,from:number,to:number}) => {
        return item.from === this.dateRange[1] && item.to === this.dateRange[0];
      });

      return found ? found.title : "time_spans.custom";
    },
  },
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
</style>

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
  <div
    :id="uid"
    :style="{
      '--highlighted-group-color': highlightedGroup
        ? highlightedGroupColor
        : undefined,
    }"
    :class="{
      'x--chart-bar--fit': fit,
      'x--chart-bar--zero': zero_baseline,
    }"
    class="x--chart-bar"
  >
    <div
      v-if="showTitle"
      class="font-weight-bold mb-2 small text-start px-2 d-flex align-center"
    >
      <slot name="title"></slot>
      <v-icon v-if="icon" class="me-1">{{ icon }}</v-icon>
      {{ title }}
      <v-spacer></v-spacer>
      <span
        v-for="(max, i) in maxs"
        :key="i"
        :title="
          $t('global.commons.max') +
          ' ' +
          (labels && labels.length > i ? labels[i] : '') +
          ` : ${fit && max == null ? '—' : max} ${title ? title : ''}`
        "
        class="small mx-1"
      >
        <v-icon
          :color="colors[i] ? colors[i] : '#333'"
          :class="{ 'hover-scale': !fit }"
          size="10"
          >circle</v-icon
        >
        {{ fit && max == null ? "—" : numeralFormat(max, "0.[0]a") }}
      </span>
    </div>
    <div
      :class="{ 'px-4': !dense && !fit, '-grouped': grouped }"
      class="d-flex justify-space-between w-100 --plot"
    >
      <div
        v-for="(it, i) in normalized"
        :key="i"
        :class="{ '-narrow': narrow, 'flex-column': !grouped }"
        :style="{
          maxWidth: (narrow ? 4 : 8) * (grouped ? count : 1) + 'px',
          height: height + 'px',
        }"
        class="d-flex justify-center flex-grow-1 --bars"
        :tabindex="fit ? 0 : undefined"
        :role="fit ? 'img' : undefined"
        :aria-label="fit ? barLabel(i) : undefined"
        :aria-describedby="fit ? uid + '_tooltip' : undefined"
        @mouseenter.stop="mouseEnter(i)"
        @mouseleave.stop="
          index = null;
          show_tooltip = false;
        "
        @focus="fit && mouseEnter(i)"
        @blur="fit && (show_tooltip = false)"
        @keydown.esc="fit && (show_tooltip = false)"
        :id="'c_' + i"
      >
        <div
          v-for="(col, j) in it"
          :key="'c-' + j"
          :style="{
            height: Math.abs(col) + '%',
            backgroundColor:
              col < 0 ? '#F44336' : colors[j] ? colors[j] : '#333',
            margin: fit ? 0 : '0 1px',
            padding: fit ? 0 : '1px',
            visibility: fit && col == null ? 'hidden' : undefined,
          }"
          class="--bar"
        ></div>
      </div>
    </div>

    <u-fade-scroll v-if="!fit || (legend && labels && !hideLegend)">
      <div
        v-if="legend && labels && !hideLegend"
        class="d-flex text-start mx-2 small text-nowrap"
      >
        <div v-for="i in count" :key="'l-' + i" class="p-1">
          <v-icon :color="colors[i - 1]" class="me-1" size="x-small"
            >lens
          </v-icon>
          {{ labels[i - 1] }}
        </div>
      </div>
    </u-fade-scroll>

    <div v-if="!hideDates" class="d-flex p-2">
      <small v-if="startDate">{{ start_date }}</small>
      <v-spacer></v-spacer>
      <small v-if="endDate">{{ end_date }}</small>
    </div>

    <v-tooltip
      v-model="show_tooltip"
      :activator="`#${uid} #c_${index}`"
      :open-delay="350"
      :color="fit ? undefined : '#222'"
      :location="fit ? 'top' : 'bottom'"
      :transition="fit ? false : 'scale-transition'"
      :content-class="
        fit ? 'sd-modern-tooltip text-start' : 'bg-black text-start'
      "
    >
      <div :id="fit ? uid + '_tooltip' : undefined" class="text-start">
        <div v-if="startDate" class="py-2">
          {{ getLocalDateString(startDate.addDays(index)) }}
        </div>
        <div v-for="(col, j) in selected" :key="'c-' + j">
          <v-icon
            :color="colors[j] ? colors[j] : '#333'"
            class="me-1"
            size="small"
            >circle
          </v-icon>
          <span v-if="labels && labels.length > j" class="small me-1"
            >{{ labels[j] }}:
          </span>
          <b>{{ fit && col == null ? "—" : col }}</b>
        </div>
      </div>
    </v-tooltip>
  </div>
</template>

<script lang="ts">
import { DateConverter } from "@selldone/core-js/helper/date/DateConverter";
import UFadeScroll from "../../../ui/fade-scroll/UFadeScroll.vue";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";

export default {
  name: "UChartBar",
  mixins: [DateMixin],

  components: { UFadeScroll },
  props: {
    startDate: {},
    endDate: {},
    dataset: {},
    colors: {
      type: Array,
    },
    narrow: {
      type: Boolean,
      default: false,
    },
    legend: {
      type: Boolean,
      default: false,
    },
    showTitle: {
      type: Boolean,
      default: true,
    },
    icon: {},
    title: {},
    labels: {},
    height: {
      default: 80,
    },
    dense: {
      type: Boolean,
      default: false,
    },
    fit: {
      type: Boolean,
      default: false,
    },
    grouped: {
      type: Boolean,
      default: false,
    },
    highlightedGroup: {
      type: Boolean,
      default: false,
    },
    highlightedGroupColor: {
      default: "rgba(230, 230, 230, 0.1)",
    },
    hideDates: Boolean,
    hideLegend: Boolean,
  },

  data: () => ({
    uid: "ch_" + Math.round(Math.random() * 9999999),
    index: null,
    selected: null,
    show_tooltip: false,
  }),

  computed: {
    zero_baseline() {
      if (!this.fit) return false;
      const values = this.dataset.flat();
      return (
        values.some((value) => value === 0) &&
        values.every((value) => value == null || value === 0)
      );
    },
    count() {
      return this.dataset[0] ? this.dataset[0].length : 0;
    },
    normalized() {
      let max_sum = 1;
      this.dataset.forEach((it) => {
        let sum = 0;

        sum += it.reduce((a, b) => a + (this.fit && b == null ? 0 : b), 0);

        max_sum = Math.max(max_sum, sum);
      });
      // Normalize:
      return this.dataset.map((i) =>
        i.map((x) =>
          this.fit && x == null ? null : Math.round((100 * x) / max_sum),
        ),
      );
    },

    start_date() {
      return DateConverter.ConvertTimestampToShortString(this.startDate);
    },
    end_date() {
      return DateConverter.isToday(this.endDate)
        ? this.$t("global.commons.today")
        : DateConverter.ConvertTimestampToShortString(this.endDate);
    },

    maxs() {
      const out = [];

      for (let i = 0; i < this.count; i++) {
        let max = this.fit ? null : 0;
        // console.log('this.dataset[i]',this.dataset)
        this.dataset.forEach((it) => {
          if (this.fit && it[i] == null) return;
          max = Math.max(max ?? 0, it[i]);
        });

        out.push(max);
      }

      return out;
    },
  },

  methods: {
    barLabel(i) {
      const date = this.startDate
        ? this.getLocalDateString(this.startDate.addDays(i)) + ". "
        : "";
      return (
        date +
        this.dataset[i]
          .map(
            (value, j) =>
              (this.labels && this.labels[j] ? this.labels[j] + ": " : "") +
              (value ?? "—"),
          )
          .join(", ")
      );
    },
    mouseEnter(i) {
      this.index = i;
      this.selected = this.dataset[i];

      this.$nextTick(() => {
        this.show_tooltip = true;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.x--chart-bar {
  .--bars {
    .--bar:first-child {
      border-top-left-radius: 4px;
      border-top-right-radius: 4px;
    }

    .--bar:last-child {
      border-bottom-left-radius: 4px;
      border-bottom-right-radius: 4px;
    }

    &.-narrow {
      .--bar:first-child {
        border-top-left-radius: 2px;
        border-top-right-radius: 2px;
      }

      .--bar:last-child {
        border-bottom-left-radius: 2px;
        border-bottom-right-radius: 2px;
      }
    }

    transition: all 0.6s ease-in-out;
    transition-delay: 0.3s;

    .--bar {
      transition: all 0.6s ease-in-out;
    }

    &:hover {
      transition-delay: 0s;
      transition: all 0.2s ease-out;
      transform: scale(1.3);
    }
  }

  // --bars

  .-grouped {
    align-items: flex-end;

    .--bars {
      align-items: flex-end;
      margin: 0 3px;
      background: var(--highlighted-group-color);
      padding: 1px;

      .--bar {
        border-radius: 4px 4px;
        flex-grow: 1;

        &:hover {
          transition-delay: 0s;
          transition: all 0.2s ease-out;
          transform: scale(1.3);
        }
      }

      &.-narrow {
        margin: 0 1px;

        .--bar {
          border-radius: 2px 2px;
        }
      }

      &:hover {
        transform: unset;
      }
    }

    // --bars
  }
}

.x--chart-bar.x--chart-bar--fit {
  min-width: 0;
  max-width: 100%;

  .--plot {
    position: relative;
    min-width: 0;
    overflow: hidden;

    .--bars {
      // Fixed insets would make long histories wider than their metric cell.
      flex: 1 1 0px;
      min-width: 0;
      margin: 0;
      padding: 0;

      .--bar {
        min-width: 0;
        width: 100%;
      }

      &,
      &:hover,
      .--bar,
      .--bar:hover {
        transform: none;
        transition: none;
        animation: none;
      }
    }

    &.-grouped .--bar {
      flex: 1 1 0px;
      width: 0;
    }
  }

  &.x--chart-bar--zero .--plot::after {
    content: "";
    position: absolute;
    inset-inline: 0;
    inset-block-end: 0;
    border-block-end: 1px solid rgba(var(--v-theme-on-surface), 0.22);
    pointer-events: none;
  }
}
</style>

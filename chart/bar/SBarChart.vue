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
  <div :id="uid" class="x--chart-bar"
       :style="{'--highlighted-group-color': highlightedGroup?highlightedGroupColor:undefined}"
  >
    <div
      class="font-weight-bold mb-2 small text-start px-2 d-flex align-center"
      v-if="showTitle"
    >
      <slot name="title"></slot>
      {{ title }}
      <v-spacer></v-spacer>
      <span
        v-for="(max, i) in maxs"
        :key="i"
        class="small mx-1"
        :title="
          $t('global.commons.max') +
          ' ' +
          (labels && labels.length > i ? labels[i] : '') +` : ${max} ${title?title:''}`
        "
      >
        <v-icon
          size="10"
          :color="colors[i] ? colors[i] : '#333'"
          class="hover-scale"
          >circle</v-icon
        >
        {{ max | numeralFormat("0.[0]a") }}
      </span>
    </div>

    <div
      class="d-flex justify-space-between w-100"
      :class="{ 'px-4': !dense, '-grouped': grouped }"

    >
      <div
        v-for="(it, i) in normalized"
        :key="i"
        @mouseenter.stop="mouseEnter(i)"
        @mouseleave.stop="index = null"
        class="d-flex justify-center flex-grow-1 --bars"
        :class="{ '-narrow': narrow, 'flex-column': !grouped }"
        :style="{ maxWidth: (narrow ? 4 : 8)*(grouped?count:1)+'px', height: height + 'px' }"
      >
        <div
          v-for="(col, j) in it"
          :key="'c-' + j"
          :id="'c_' + i"
          class="--bar"
          style="margin: 0 1px; padding: 1px"
          :style="{
            height: Math.abs(col) + '%',
            backgroundColor:
              col < 0 ? '#F44336' : colors[j] ? colors[j] : '#333',
          }"
        ></div>
      </div>
    </div>

    <fade-scroll>
      <div
        no-gutters
        v-if="legend && labels"
        class="d-flex text-start mx-2 small text-nowrap"
      >
        <div v-for="i in count" :key="'l-' + i" class="p-1">
          <v-icon x-small :color="colors[i - 1]" class="me-1">lens</v-icon>
          {{ labels[i - 1] }}
        </div>
      </div>
    </fade-scroll>

    <div class="d-flex p-2">
      <small v-if="startDate">{{ start_date }}</small>
      <v-spacer></v-spacer>
      <small v-if="endDate">{{ end_date }}</small>
    </div>

    <v-tooltip
      bottom
      :activator="`#${uid} #c_${index}`"
      transition="scale-transition"
      color="#222"
      :open-delay="350"
    >
      <div class="text-start pa-1">
        <div v-if="startDate" class="py-2">
          {{ getLocalDateString(startDate.addDays(index )) }}
        </div>
        <div v-for="(col, j) in selected" :key="'c-' + j">
          <v-icon :color="colors[j] ? colors[j] : '#333'" class="me-1" small
            >circle</v-icon
          >
          <span v-if="labels && labels.length > j" class="small me-1"
            >{{ labels[j] }}:
          </span>
          <b>{{ col }}</b>
        </div>
      </div>
    </v-tooltip>
  </div>
</template>

<script>
import { DateConverter } from "@core/helper/date/DateConverter";
import FadeScroll from "@components/ui/fade-scroll/FadeScroll.vue";

export default {
  name: "SBarChart",
  components: { FadeScroll },
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
    title: {},
    labels: {},
    height: {
      default: 80,
    },
    dense: {
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
      default: 'rgba(230, 230, 230, 0.1)',
    },
  },

  data: () => ({
    uid: "ch_" + Math.round(Math.random() * 9999999),
    index: null,
    selected: null,
  }),

  computed: {
    count() {
      return this.dataset[0] ? this.dataset[0].length : 0;
    },
    normalized() {
      let max_sum = 1;
      this.dataset.forEach((it) => {
        let sum = 0;

        sum += it.reduce((a, b) => a + b, 0);

        max_sum = Math.max(max_sum, sum);
      });
      // Normalize:
      return this.dataset.map((i) =>
        i.map((x) => Math.round((100 * x) / max_sum))
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
        let max = 0;
        // console.log('this.dataset[i]',this.dataset)
        this.dataset.forEach((it) => {
          max = Math.max(max, it[i]);
        });

        out.push(max);
      }

      return out;
    },
  },

  methods: {
    mouseEnter(i) {
      this.index = i;
      this.selected = this.dataset[i];
    },
  },
};
</script>

<style scoped lang="scss">
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
  } // --bars

  .-grouped {
    align-items: end;

    .--bars {
      align-items: end;
      margin: 0 3px;
      background: var(--highlighted-group-color);
      padding:  1px;
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

    } // --bars

  }
}
</style>

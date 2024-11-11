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
  <div class="overflow-x-auto">
    <div
      v-if="!show_detail"
      :style="`--hex-size:${size}px;--hex-margin:${Math.round(
        size / 12,
      )}px;--hex-margin-half:${-Math.round(
        size / 24,
      )}px;min-width:${min_width}px`"
      class="hex-container"
    >
      <div v-for="(row, ri) in items" :key="'r-' + ri" class="row">
        <div
          v-for="(item, index) in row"
          :key="'c-' + index"
          :class="[{ '-has-more': item.message || item.data }, item.class]"
          :style="
            `animation-delay: ${300 + index * 100}ms;` +
            (item.src
              ? `background-image: url(${item.src});`
              : item.gradient
                ? item.gradient
                : '') +
            `background-color: ${item.bg};color: ${item.color};` +
            `--color:${item.color}`
          "
          :title="item.tooltip"
          class="hexagon zoomIn"
          @click="
            () => {
              selected = item;
              show_detail = item.message || item.data;
            }
          "
        >
          <div class="center-absolute txs">
            <h4 v-if="item.title">{{ item.title }}</h4>
            <hr v-if="item.title && item.value" />
            <p v-if="item.value">
              <flag v-if="item.country" :iso="item.country" :squared="false" />
              {{ item.value }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="detail-container fadeIn" @click="show_detail = false">
      <div class="mb-2" v-html="selected.message"></div>

      <v-table v-if="selected.data" class="bg-transparent" density="compact">
        <template v-slot:default>
          <thead class="text-start">
            <tr>
              <th>
                {{ $t("global.commons.record") }}
              </th>
              <th>
                {{ $t("global.commons.value") }}
              </th>
            </tr>
          </thead>
          <tbody class="text-start">
            <tr v-for="(item, key) in selected.data" :key="key">
              <td>
                <v-icon v-if="item.icon" class="me-1">{{ item.icon }}</v-icon>
                {{ key }}
              </td>
              <td>{{ item.value }}</td>
            </tr>
          </tbody>
        </template>
      </v-table>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: "HexagonalView",
  props: {
    size: {
      default: "60",
    },
    items: {
      type: Array,
      require: true,
    },
  },
  data: () => {
    return {
      show_detail: false,
      selected: null,
    };
  },
  computed: {
    min_width() {
      return this.max_cols * (this.size + this.size / 6);
    },

    max_cols() {
      let max = 0;
      this.items.forEach((item) => {
        if (item.length > max) max = item.length;
      });
      return max;
    },
  },
};
</script>

<style lang="scss">
.hex-container {
  $size: var(--hex-size);
  $margin: var(--hex-margin);
  $margin_half: var(--hex-margin-half);

  margin-top: 3em;
  padding-bottom: 3em;

  display: flex;
  flex-flow: column;
  align-items: center;
  min-height: calc(2.5 * var(--hex-size));

  filter: drop-shadow(-1px 6px 3px rgba(198, 198, 198, 0.5));

  .hexagon {
    width: $size;
    height: $size;
    position: relative;
    background-color: #fafafa;
    display: inline-block;
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover;
    margin: $margin_half $margin;

    -webkit-clip-path: polygon(
      50% 0%,
      100% 25%,
      100% 75%,
      50% 100%,
      0% 75%,
      0% 25%
    );
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    user-select: none;
    text-align: center;

    h4 {
      font-size: calc(#{$size} / 7);

      font-weight: 800;
      margin: 0;
    }

    p {
      font-size: calc(#{$size} / 8);
      // width: 90%;
      margin: 0 auto;
    }

    hr {
      border: 0;
      border-top: 1px solid var(--color);
      width: 90%;
      margin: calc(#{$size} / 40) auto;
    }

    &.-has-more {
      cursor: pointer;

      &:hover {
        background-image: linear-gradient(
          to top,
          #005bea 0%,
          #0754cd 100%
        ) !important;
        --color: #fff !important;
        color: #fff !important;
      }
    }

    .txs {
      text-shadow: 1px 1px 3px #1916162e;
    }
  }
}

.detail-container {
  font-size: 12px;
  min-height: 100px;
  cursor: pointer;
  padding: 12px;
  // border-radius: 8px;
  // background-color: #fafafa;

  p {
    margin-bottom: 4px;
  }
}
</style>

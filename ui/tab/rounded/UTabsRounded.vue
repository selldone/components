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
  <u-fade-scroll center>
    <div
      :class="{ 'is-table': scrollable, disabled: disabled }"
      :style="{ '--radius': radius }"
      class="nav"
    >
      <div v-if="src" class="nav-icon">
        <img :src="src" class="rounded" height="24" />
      </div>
      <div v-else-if="icon" class="nav-icon">
        <v-icon>{{ icon }}</v-icon>
      </div>

      <div
        v-for="item in tabsNotNull"
        :key="'tab-' + item.title"
        :class="{ 'is-active': modelValue === item.value, small: small }"
        :style="``"
        class="nav-item"
        @click="$emit('update:modelValue', item.value)"
      >
        <v-icon
          v-if="item.icon"
          :color="modelValue === item.value ? item.color : ''"
          :size="window.innerWidth < 900 || small ? '20px' : '28px'"
          class="me-2"
          style="pointer-events: none"
          >{{ item.icon }}
        </v-icon>
        <v-img
          v-if="item.src"
          :src="item.src"
          :width="window.innerWidth < 900 || small ? 20 : 28"
          aspect-ratio="1"
          class="me-1"
          style="pointer-events: none"
        >
        </v-img>

        {{ item.title }}

        <slot :name="`item.${item.value}`"></slot>

        <v-icon
          v-if="item.check"
          class="ms-1 zoomIn"
          color="success"
          size="small"
          >check_circle
        </v-icon>
      </div>

      <slot></slot>
    </div>
  </u-fade-scroll>
</template>

<script>
import UFadeScroll from "../../../ui/fade-scroll/UFadeScroll.vue";

export default {
  name: "UTabsRounded",
  components: { UFadeScroll },
  emits: ["update:modelValue"],
  props: {
    modelValue: {},

    tabs: {
      type: Array,
      require: true,
    },
    small: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    scrollable: {
      type: Boolean,
      default: false,
    },
    radius: {
      default: "50px",
    },
    src: {},
    icon: {
      // Show icon if src is empty!
    },
  },

  data: function () {
    return {};
  },

  computed: {
    tabsNotNull() {
      return this.tabs.filter(Boolean);
    },
  },

  watch: {},

  mounted() {},
  created() {},
  methods: {
    redrawActiveItem() {},
  },
};
</script>

<style lang="scss" scoped>
.nav {
  display: flex;
  min-width: min-content;

  align-items: stretch !important;
  width: max-content;
  position: relative;
  z-index: 1;
  user-select: none;
  overflow: visible;
  max-width: 100%;
  background-color: #fff;
  //padding: 0 20px;
  border-radius: var(--radius);
  //  box-shadow: 0 3px 15px rgba(159, 162, 177, 0.4);
  border: 1px solid #dee2e6 !important;
  box-shadow: inset 0px 2px 8px rgba(15, 15, 15, 0.08);

  padding: 12px 20px;
}

.nav-icon {
  //  display: table-cell !important;
  min-width: 50px;
  padding: 20px;
}

.nav-item {
  justify-content: center;
  display: flex !important;
  align-items: center;

  white-space: nowrap;

  cursor: pointer;
  color: #83818c;
  padding: 20px;
  text-decoration: none;
  transition: 0.3s;
  margin: 0 6px;
  z-index: 1;
  font-weight: 500;
  position: relative;
  flex-grow: 1;
  min-width: 100px !important;

  &:before {
    content: "";
    position: absolute;
    bottom: -6px;
    left: 0;
    width: 100%;
    height: 5px;
    background-color: #dfe2ea;
    border-radius: 8px;
    opacity: 0;
    transition: 0.3s;
    pointer-events: none;
  }

  &.small {
    padding: 8px 20px !important;
    font-size: 0.8rem !important;
    margin: 0 2px !important;

    .nav-icon {
      padding: 14px;
    }
  }

  @media only screen and (max-width: 900px) {
    padding: 20px 8px;
    font-size: 0.9rem;
    margin: 0 2px;
  }

  @media only screen and (max-width: 600px) {
    padding: 20px 4px;
    font-size: 0.8rem;
    margin: 0 2px;
  }

  border-radius: 36px;

  &.is-active {
    box-shadow: 0px 7px 15px 8px rgba(113, 112, 112, 0.24);
  }
}

.nav-item:not(.is-active):hover:before {
  opacity: 1;
  bottom: 0;
}

.nav-item:not(.is-active):hover {
  color: #333;
}
</style>

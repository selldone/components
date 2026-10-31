<!--
  - Copyright (c) 2023-2024. Selldone® Business OS™
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
  <span
    :class="{
      'd-flex align-center': noLabel,
      dark: dark,
      'b-customers-filter-item--modern-clubs':
        modern && !noLabel && filter.type === 'LEVEL',
    }"
    :title="modern && filter.type === 'LEVEL' ? undefined : filter.type"
    class="it"
  >
    <v-icon v-if="icon" class="me-2" size="small">{{ icon }}</v-icon>
    <span v-if="!noLabel" class="me-1" style="vertical-align: sub">
      {{ name }}
    </span>

    <!-- Customer clubs -->
    <span
      v-if="filter.type === 'LEVEL' && filter.levels"
      :class="{ 'b-customers-filter-item__clubs': modern }"
    >
      <template v-if="modern">
        <v-tooltip
          v-for="level in filter.levels"
          :key="level"
          location="top"
          :open-on-focus="true"
          :open-on-click="true"
          :persistent="false"
          content-class="sd-modern-tooltip text-start"
          :text="$t(getCustomerClubLevel(level).name)"
        >
          <template #activator="{ props }">
            <button
              v-bind="props"
              type="button"
              class="b-customers-filter-item__club"
              :aria-label="$t(getCustomerClubLevel(level).name)"
              @click.stop
            >
              <img
                :src="getCustomerClubLevel(level).icon"
                height="20"
                width="20"
                alt=""
              />
            </button>
          </template>
        </v-tooltip>
      </template>
      <template v-else>
        <img
          v-for="level in filter.levels"
          :key="level"
          :src="getCustomerClubLevel(level).icon"
          :title="$t(getCustomerClubLevel(level).name)"
          class="me-1"
          height="20"
          width="20"
          :alt="level"
        />
      </template>
    </span>

    <!-- Sex -->
    <span v-else-if="filter.type === 'SEX' && filter.sex">
      <v-icon
        v-if="filter.sex.includes('MALE')"
        class="me-1"
        color="#1976D2"
        size="20"
        >male</v-icon
      >
      <v-icon
        v-if="filter.sex.includes('FEMALE')"
        class="me-1"
        color="#C2185B"
        size="20"
        >female</v-icon
      >
    </span>

    <!-- Subscribe -->
    <span v-else-if="filter.type === 'SUBSCRIBED'">
      <v-icon
        v-if="readOnly"
        :color="filter.subscribed ? 'success' : undefined"
        size="18"
        role="img"
        :aria-label="
          $t(filter.subscribed ? 'global.active' : 'global.inactive')
        "
        >{{ filter.subscribed ? "check" : "close" }}</v-icon
      >
      <u-check v-else :model-value="filter.subscribed"></u-check>
    </span>

    <!-- Limit -->
    <b v-else-if="filter.type === 'LIMIT'" class="small">
      [{{ filter.limit }}]
    </b>

    <!-- Subscribe -->
    <div
      v-else-if="
        ['LOGIN_DATE', 'LAST_BUY_DATE', 'REGISTER_DATE'].includes(filter.type)
      "
    >
      <small v-if="filter.start" class="mx-1"
        ><v-icon class="me-1" color="green" size="small">play_arrow</v-icon>
        {{ getLocalTimeStringSmall(filter.start) }}</small
      >
      <small v-if="filter.end" class="mx-1"
        ><v-icon class="me-1" color="red" size="small">stop</v-icon>
        {{ getLocalTimeStringSmall(filter.end) }}</small
      >
    </div>
  </span>
</template>

<script lang="ts">
import { Customer } from "@selldone/core-js";
import DateMixin from "@selldone/components-vue/mixin/date/DateMixin.ts";
import ClubMixin from "@selldone/components-vue/mixin/club/ClubMixin.ts";

export default {
  name: "BCustomersFilterItem",
  mixins: [DateMixin, ClubMixin],
  props: {
    filter: { required: true },
    modern: { default: false, type: Boolean },
    readOnly: { default: false, type: Boolean },
    dark: { default: false, type: Boolean },
    noLabel: { default: false, type: Boolean },
    forceName: {},
    forceIcon: {},
    types: {
      type: Array,
      default: () => Customer.Filters,
    },
  },

  computed: {
    icon() {
      if (this.forceIcon) return this.forceIcon;

      if (!this.types[this.filter.type]) return null;
      return this.types[this.filter.type].icon;
    },
    name() {
      if (this.forceName) return this.forceName;
      if (!this.types[this.filter.type]) return null;
      return this.$t(this.types[this.filter.type].title);
    },
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.it {
  user-select: none;
}

.b-customers-filter-item--modern-clubs {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  align-items: center;
  row-gap: 5px;
  min-width: 0;

  > .b-customers-filter-item__clubs {
    grid-column: 1 / -1;
  }
}

.b-customers-filter-item__clubs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
}

.b-customers-filter-item__club {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  color: inherit;
  background: transparent;
  cursor: help;

  &:focus-visible {
    outline: 2px solid rgb(var(--v-theme-primary));
    outline-offset: 2px;
  }

  > img {
    display: block;
    object-fit: contain;
  }

  @media (max-width: 599px), (pointer: coarse) {
    flex-basis: 44px;
    width: 44px;
    height: 44px;
  }
}

.dark {
  small {
    color: #fff;
  }
}
</style>

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
    :class="{ 'd-flex align-center': noLabel, dark: dark }"
    :title="filter.type"
    class="it"
  >
    <v-icon v-if="icon"  class="me-2" size="x-small">{{
      icon
    }}</v-icon>
    <span
      v-if="!noLabel"
      class="me-1"
      style="vertical-align: sub"
      v-text="name"
    ></span>

    <!-- Customer clubs -->
    <span v-if="filter.type === 'LEVEL' && filter.levels">
      <img
        v-for="level in filter.levels"
        :key="level"
        :src="getCustomerClubLevel(level).icon"
        :title="$t(getCustomerClubLevel(level).name)"
        class="me-1"
        height="20"
        width="20"
      />
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
      <u-check :model-value="filter.subscribed"></u-check>
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
        ><v-icon  class="me-1" color="green" size="small"
          >play_arrow</v-icon
        >
        {{ getLocalTimeStringSmall(filter.start) }}</small
      >
      <small v-if="filter.end" class="mx-1"
        ><v-icon  class="me-1" color="red" size="small"
          >stop</v-icon
        >
        {{ getLocalTimeStringSmall(filter.end) }}</small
      >
    </div>

    <!-- Others -->
    <b v-else class="small">
      {{ filter.type }}
    </b>
  </span>
</template>

<script>
import CustomersFilterTypes from "@selldone/core-js/enums/customer/CustomersFilterTypes";

export default {
  name: "BCustomersFilterItem",
  props: {
    filter: { required: true },
    dark: { default: false, type: Boolean },
    noLabel: { default: false, type: Boolean },
  },

  computed: {
    icon() {
      if (!CustomersFilterTypes[this.filter.type]) return null;
      return CustomersFilterTypes[this.filter.type].icon;
    },
    name() {
      if (!CustomersFilterTypes[this.filter.type]) return null;
      return this.$t(CustomersFilterTypes[this.filter.type].title);
    },
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.it {
  user-select: none;
}

.dark {
  small {
    color: #fff;
  }
}
</style>

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
  <div>
    <v-table v-if="product.pros" class="table-features">
      <thead>
        <tr>
          <th colspan="2">
            <div class="d-flex align-center">
              <span class="flex-grow-1"> {{ $t("product_info.pros") }}</span>

              <v-icon class="op-0-5">thumb_up_off_alt</v-icon>
            </div>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(value, title) in product.pros" :key="title">
          <td>{{ title }}</td>
          <td>{{ value }}</td>
        </tr>
      </tbody>
    </v-table>

    <v-table v-if="product.cons" class="table-features">
      <thead>
        <tr>
          <th colspan="2">
            <div class="d-flex align-center">
              <span class="flex-grow-1"> {{ $t("product_info.cons") }}</span>
              <v-icon class="op-0-5">thumb_down_off_alt</v-icon>
            </div>
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(value, title) in product.cons" :key="title">
          <td>{{ title }}</td>
          <td>{{ value }}</td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>

<script>
export default {
  name: "SShopProductProsConsTable",
  components: {},
  props: {
    shop: {
      required: true,
      type: Object,
    },

    product: {
      required: true,
      type: Object,
    },
  },

  data: () => ({}),

  computed: {},
  methods: {},
};
</script>

<style lang="scss" scoped>
/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */

/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */

.table-features {
  text-align: start;
  background: #e5e5e5 !important;
  border-radius: 12px;
  margin: 12px;

  tr {
    th {
      font-weight: 300;
    }

    td:first-child {
      font-weight: 800;
    }

    td:last-child {
      color: #666;
    }
  }
}
</style>

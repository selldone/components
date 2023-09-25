<template>
  <div>
    <v-simple-table v-if="product.pros" class="table-features">
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
    </v-simple-table>

    <v-simple-table v-if="product.cons" class="table-features">
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
    </v-simple-table>
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

<style scoped lang="scss">
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

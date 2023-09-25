<template>
  <div :class="{ dark: dark }" class="text-start">
    <h3 v-if="label" class="my-2"><v-icon class="me-1" :color="dark?'#fff':'#111'">storefront</v-icon> {{ label }}</h3>
    <v-subheader v-if="hint">{{ hint }}</v-subheader>

    <v-slide-y-transition
      tag="div"
      group
      class="border-between-vertical rounded-card"
      :class="{ disabled: disabled, '-rounded-8px': items_show.length <= 1 }"
      hide-on-leave
    >
      <div
        v-for="vendor in items_show"
        :key="vendor.id"
        class="p-2 pp row-hover usn border mb-1"
        :class="{
          'bg-dark': dark,
          'bg-white': !dark,
          's--shadow-no-padding z1 my-2': vendor.id === value,
        }"
        @click="
          $emit('input', forceShowAll ? vendor.id : value ? null : vendor.id);
          $emit('change', forceShowAll ? vendor.id : value ? null : vendor.id);
        "
      >
        <div class="d-flex align-center mnh">
          <div class="flex-grow-0 me-2">
            <v-icon color="primary" :large="vendor.id === value">{{
              vendor.id === value ? "lens" : "radio_button_unchecked"
            }}</v-icon>
          </div>
          <div class="flex-grow-1">
            <router-link
              v-if="vendor.page"
              :to="{
                name: 'PageRender',
                params: { page_name: vendor.page.name },
              }"
              class="font-weight-bold tnt text-primary"
              exact
              title="Go to the store page."
            >
              View store of {{ vendor.name }}
              <v-icon class="ms-1 text-primary" small
                >launch</v-icon
              ></router-link
            >
            <b v-else>
              {{ vendor.name }}
            </b>
            <v-subheader style="height: auto" class="p-0">
              {{ vendor.description }}
            </v-subheader>
          </div>

          <div class="min-width-100">
            <price-view
              :currency="GetUserSelectedCurrency()"
              :amount="calcVendorPrice(vendor)"
            ></price-view>
          </div>

          <v-avatar rounded color="#fafafa">
            <img v-if="vendor.icon" :src="getShopImagePath(vendor.icon, 128)" />
            <v-icon v-else>storefront</v-icon>
          </v-avatar>
        </div>
      </div>
    </v-slide-y-transition>
  </div>
</template>

<script>
export default {
  name: "VSmartSelectVendor",
  props: {
    value: {},
    vendors: { type: Array },

    itemIcon: {},
    label: {},
    hint: {},

    forceShowAll: {
      default: false,
      type: Boolean,
    },
    disabled: {
      default: false,
      type: Boolean,
    },
    dark: {
      default: false,
      type: Boolean,
    },
  },
  computed: {
    items_show() {
      if (this.forceShowAll) return this.vendors;
      if (!this.value) return this.vendors;
      const out = this.vendors.filter((i) => i.id === this.value);
      return out.length ? out : this.vendors;
    },
  },

  methods: {
    //█████████████████████████████████████████████████████████████
    //―――――――――――――――――――――――― 🟣 Marketplace 🟣 ――――――――――――――――――――――
    //█████████████████████████████████████████████████████████████

    calcVendorPrice(vendor) {
      return this.CalcPriceProductCurrentCurrency(this.getShop(), vendor, null);
    },
  },
};
</script>

<style scoped lang="scss">
.mnh {
  min-height: 40px;
}
</style>

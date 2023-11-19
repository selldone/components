<template>
  <v-container class="text-center">
    <v-row
      justify="center"
      align="center"
      style="min-height: 240px"
      class="thin-scroll"
    >
      <component
        :is="link ? 'router-link' : 'div'"
        v-for="(shop, index) in shops"
        :key="shop.id"
        class="m-2 zoomIn position-relative pointer-pointer"
        style="max-width: 96px"
        :style="`animation-delay: ${30 * index}ms`"
        @click="$emit('select:shop', returnObject ? shop : shop.id)"
        :class="{
          disabled:
            $route.name === 'AdminShopDashboardPage' &&
            getId($route.params.shop_id) === shop.id,
        }"
        :to="
          link
            ? { name: linkPageName, params: { shop_id: shop.id } }
            : undefined
        "
      >
        <v-card
          width="96"
          height="96"
          class="d-flex align-center justify-center rounded-2rem widget-hover"
          outlined
        >
          <img
            :src="
              shop.icon
                ? getShopImagePath(shop.icon, 96)
                : require('@components/assets/placeholders/shop/store.svg')
            "
            height="80"
            width="80"
            class="rounded-18px"
            @click="selected_shop = shop.id"
          />
        </v-card>

        <v-progress-circular
          v-if="selected_shop === shop.id && hasLoading"
          color="blue"
          indeterminate
          size="48"
          class="position-absolute"
          style="top: 24px; left: 24px"
        ></v-progress-circular>

        <div class="text-ellipsis">
          <v-icon
            v-if="!shop.shop_permissions || !shop.shop_permissions.length"
            x-small
            color="amber"
            class="me-1"
            :title="$t('shop_permissions.ADMIN.text')"
            >fas fa-crown</v-icon
          >

          <v-tooltip v-else bottom :max-width="480" color="#111">
            <template v-slot:activator="{ on }">
              <v-icon v-on="on" x-small color="#03A9F4" class="me-1"
                >fas fa-user</v-icon
              >
            </template>
            <div class="text-start">
              <p
                v-for="item in shop.shop_permissions"
                :key="item.level"
                class="m-1 text-ellipsis"
              >
                <img
                  :src="getShopPermissionObject(item.level).src"
                  width="16"
                  height="16"
                  class="me-2"
                />
                {{ $t(getShopPermissionObject(item.level).text) }}
                <br />
                <small>{{
                  $t(getShopPermissionObject(item.level).description)
                }}</small>
              </p>
            </div>
          </v-tooltip>

          <small>
            {{ shop.title }}
          </small>
        </div>
      </component>
    </v-row>

    <router-link
      v-if="USER() && !shops.length && home"
      :to="{ name: 'ShopsListPage' }"
    >
      <add-button-green
        :caption="$t('home.s1.domain_input.action')"
        icon="add_business"
        class="max-width-field mx-auto"
      >
      </add-button-green>
    </router-link>
  </v-container>
</template>

<script>
import { ShopPermissions } from "@core/enums/permission/ShopPermissions";
import AddButtonGreen from "@components/ui/button/AddButtonGreen.vue";

export default {
  name: "MyShopsList",
  components: { AddButtonGreen },
  props: {
    link: {
      default: false,
      type: Boolean,
    },

    linkPageName: {},
    hasLoading: {
      default: true,
      type: Boolean,
    },
    returnObject: {
      default: false,
      type: Boolean,
    },
  },

  data() {
    return {
      selected_shop: null,
    };
  },
  computed: {
    home() {
      return this.$store.getters.getHome;
    },

    shops() {
      if (!this.home || !this.home.shops) return [];

      let i = 0;
      return this.home.shops.map((item) => {
        item.index = i++;
        return item;
      });
    },
  },

  watch: {
    $route() {
      this.selected_shop = null; //Reset at change route!
    },
  },
  created() {
    this.needHomeData();
  },
  methods: {
    getShopPermissionObject(level) {
      return ShopPermissions[level];
    },
  },
};
</script>

<style scoped></style>

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
  <v-bottom-navigation
    v-if="shop"
    app
    grow
    fixed
    :color="SaminColorDark"
    background-color="#fafafa"
    class="s--shop-bottom-nav shadow-small"
    :class="{
      '-hide': (!showNavbar && !searchmode) || force_hide_navigation,
      '-top': searchmode,
    }"
    style="z-index: 9999999; box-shadow: none"
    :value="tab"
    :height="76"
  >
    <template v-if="!searchmode">
      <!-- ------------------ Home ------------------ -->

      <v-btn
        value="home"
        :to="
          last_home_route
            ? last_home_route
            : in_product || in_category
            ? {
                name: 'ShopPage',
              }
            : {
                name: channel_entry
                  ? in_channel_entry_page
                    ? 'ShopPage'
                    : channel_entry_page_name
                  : getCustomHomePage()
                  ? !in_custom_home_page
                    ? getCustomHomePage()
                    : 'ShopPage'
                  : 'ShopPage',
              }
        "
        @click="
          last_home_route = null;
          last_product = null;
          last_cat = null;
        "
        exact
        min-width="60"
        class="zoomIn"
        retain-focus-on-click
      >
        <v-avatar v-if="last_product" size="24" color="#eee">
          <img :src="getProductImage(last_product, 64)" />
        </v-avatar>
        <v-icon v-else-if="last_cat"> folder </v-icon>
        <v-icon v-else-if="last_home_route">store</v-icon>

        <v-icon v-else-if="channel_entry">{{
          in_channel_entry_page ? "apps" : channel_entry_page_icon
        }}</v-icon>

        <v-icon v-else>{{
          in_custom_home_page || in_product || in_category ? "apps" : "home"
        }}</v-icon>
      </v-btn>

      <!-- ------------------ Search ------------------ -->

      <v-btn
        value="search"
        @click="searchmode = true"
        min-width="60"
        class="zoomIn delay_100"
        key="ser"
        retain-focus-on-click
      >
        <v-icon>search</v-icon>
      </v-btn>

      <!-- ------------------ Basket ------------------ -->

      <v-btn
        value="basket"
        :to="{
          name: 'BasketPage',
          params: { type: current_product_type_in_basket },
        }"
        min-width="60"
        class="zoomIn delay_200"
        retain-focus-on-click
      >
        <v-badge
          :value="total_items_in_carts > 0"
          color="teal"
          :content="total_items_in_carts | numeralFormat('0a')"
          offset-y="10"
        >
          <img
            v-if="total_items_in_carts > 0"
            width="24"
            height="24"
            src="../../assets/icons/pos-basket.png"
          />
          <v-icon v-else>local_mall</v-icon>
        </v-badge>
      </v-btn>

      <!-- ------------------ Notification ------------------ -->

      <v-btn
        value="notification"
        :to="
          USER()
            ? {
                name: 'HistoryOrdersPhysical',
              }
            : undefined
        "
        @click="USER() ? null : NeedLogin()"
        min-width="60"
        class="zoomIn delay_300"
        retain-focus-on-click
      >
        <v-badge
          color="red"
          offset-y="10"
          :value="sum_orders_badges > 0"
          :content="sum_orders_badges | numeralFormat('0a')"
        >
          <v-icon>notifications</v-icon>
        </v-badge>
      </v-btn>

      <!-- ------------------ Profile ------------------ -->

      <v-btn
        value="profile"
        v-bind="USER() ? { to: { name: 'UserProfilePage' } } : undefined"
        @click="USER() ? null : NeedLogin()"
        min-width="60"
        class="zoomIn delay_400"
        retain-focus-on-click
      >
        <v-badge
          v-if="USER_ID()"
          :value="!!getClub()"
          color="transparent"
          offset-y="10"
        >
          <v-avatar size="24" color="#eee">
            <v-img :src="getUserAvatar(USER_ID())"></v-img>
          </v-avatar>

          <template slot="badge">
            <img
              v-if="getClub()"
              :src="getCustomerClubLevel(getClub().level).icon"
              width="18"
              height="18"
            />
          </template>
        </v-badge>

        <v-icon v-else>account_circle</v-icon>
      </v-btn>
    </template>

    <!-- ------------------ Search Box ------------------ -->

    <template v-if="searchmode">
      <v-btn
        @click="$refs.search.showQRScanner()"
        icon
        class="zoomIn delay_300"
        width="70"
        min-width="60"
      >
        <v-icon>qr_code_scanner</v-icon>
      </v-btn>

      <shop-search-box
        ref="search"
        class="full-width align-center d-flex flex-grow-1 fadeIn"
        :class="{}"
        :title="$t('layout_shop.search_title', { shop_name: shop.title })"
        :shop-name="shop.name"
        @onSearch="onSearch"
        @onClear="onClear"
        color="transparent"
        solo
        flat
        no-qr
        block
        rounded
        expand-input
        shadow
      />

      <v-btn
        @click="searchmode = false"
        icon
        class="zoomIn"
        width="70"
        min-width="60"
        key="ser"
      >
        <v-icon>{{ $t("icons.navigate_next") }}</v-icon>
      </v-btn>
    </template>
  </v-bottom-navigation>
</template>

<script>
import ShopSearchBox from "@components/storefront/search/ShopSearchBox.vue";
export default {
  name: "SShopBottomNavigation",
  components: { ShopSearchBox },
  data: () => ({
    last_home_route: null,
    last_cat: null,
    last_product: null,

    showNavbar: true,
    lastScrollPosition: 0,
    sum: 0,

    searchmode: false,
  }),

  computed: {
    /*
     * Force hide navigation when map dialog opened.
     */
    force_hide_navigation() {
      return this.$store.getters.getForceHideNavigation;
    },

    shop() {
      return this.getShop();
    },

    tab() {
      if (this.$route.name === "ShopPage") return "home";
      else if (this.$route.name === "UserFavoritesPage") return "favorite";
      else if (this.$route.name === "BasketPage") return "basket";
      else if (this.$route.name === "UserProfilePage") return "profile";
      else if (this.$route.name === "HistoryOrdersPhysical")
        return "notification";

      return "home";
    },

    in_custom_home_page() {
      return this.$route.name === "CustomHomePage";
    },
    in_product() {
      return this.$route.name === "ProductPage";
    },
    in_category() {
      return this.$route.name === "ShopCategoryPage";
    },

    total_items_in_carts() {
      return this.getTotalItemInBaskets();
    },
    sum_orders_badges() {
      let out = 0;
      if (!this.getOrdersState()) return out;

      this.getOrdersState().forEach((item) => {
        out += item.count;
      });

      return out;
    },

    // Handle channels:
    channel_entry() {
      return this.$store.getters.getChannelEntry;
    },
    in_channel_entry_page() {
      return (
        this.channel_entry &&
        this.$route.matched.some(
          (record) => record.meta.channel === this.channel_entry
        )
      );
    },
    channel_entry_page_name() {
      if (this.channel_entry === "instagram") return "InstagramPage";
      return null;
    },
    channel_entry_page_icon() {
      if (this.channel_entry === "instagram") return "fab fa-instagram";
      return null;
    },
  },

  watch: {
    $route(new_route, old_route) {
      const home_names = ["ShopPage", "ShopCategoryPage", "ProductPage"];

      if (
        home_names.includes(old_route.name) &&
        !home_names.includes(new_route.name)
      ) {
        this.last_home_route = old_route; // Save to retrieve in back!

        this.last_cat = old_route.params.category_name;
        this.last_product = old_route.params.product_id;

        console.log("last_cat", this.last_cat);
      }

      // When user enter a product from a category:
      if (
        old_route.name === "ShopCategoryPage" &&
        new_route.name === "ProductPage" &&
        old_route.params.category_name
      ) {
        this.last_home_route = old_route; // Save to retrieve in back!
        this.last_cat = old_route.params.category_name;
      }

      if (!new_route.query.search) {
        // Hide search bar on change route.
        this.searchmode = false;
      }
    },

    force_hide_navigation(hide) {
      if (hide) this.searchmode = false; // Hide on force hide navigation.
    },
  },

  mounted() {
    this.$store.commit("setBottomNavShow", true);

    window.addEventListener("scroll", this.onScroll);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.onScroll);
  },
  methods: {
    onScroll() {
      // Get the current scroll position
      const currentScrollPosition =
        window.pageYOffset || document.documentElement.scrollTop; // Because of momentum scrolling on mobiles, we shouldn't continue if it is less than zero
      if (currentScrollPosition < 0) {
        return;
      } // Here we determine whether we need to show or hide the navbar

      const diff = currentScrollPosition - this.lastScrollPosition; // Set the current scroll position as the last scroll position

      this.sum += diff;

      // console.log("scroll", this.sum);

      if (Math.abs(this.sum) < 200) return;

      this.showNavbar = this.sum < 0;
      this.sum = 0; // reset!

      this.lastScrollPosition = currentScrollPosition;

      this.$store.commit("setBottomNavShow", this.showNavbar);
    },

    // --------------- Search ------------
    onSearch(event) {
      this.$router.push({
        name: "ShopPage",
        params: { shop_name: this.shop.shop_name },
        query: { search: event.search, search_type: event.search_type },
      });
    },

    onClear() {
      if (this.$route.name === "ShopPage")
        //Only in shop page clear => show all products!
        this.$router.push({
          name: "ShopPage",
          params: { shop_name: this.shop.shop_name },
        });
    },
  },
};
</script>

<style scoped lang="scss">

/*
━━━━━━━━━━━━━━━━━━━━ 🎺 Variables ━━━━━━━━━━━━━━━━━━━━
 */



/*
━━━━━━━━━━━━━━━━━━━━ 🪅 Classes ━━━━━━━━━━━━━━━━━━━━
 */
.s--shop-bottom-nav {
  bottom: 8px !important;
  left: 8px !important;
  right: 8px !important;
  width: auto !important;
  border-radius: 20px !important;
  border: 1px solid #dee2e6 !important;
  transition: all 0.35s linear;
  overflow: hidden;
  &.-hide {
    transform: translateY(100px) !important;
  }

  &.-top {
    width: 100% !important;
    left: 0 !important;
    border-radius: 0 !important;
    top: 0 !important;
    bottom: unset !important;
  }
}
</style>
